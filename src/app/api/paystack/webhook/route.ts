import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { CONVENIENCE_FEE } from '@/lib/constants';

export async function POST(req: NextRequest) {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  // Verify webhook signature
  const signature = req.headers.get('x-paystack-signature');
  const body = await req.text();

  const hash = crypto
    .createHmac('sha512', paystackSecret)
    .update(body)
    .digest('hex');

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  // Only handle successful charges
  if (event.event !== 'charge.success') {
    return NextResponse.json({ received: true });
  }

  const reference = event.data.reference;
  if (!reference) {
    return NextResponse.json({ error: 'No reference' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Check if already processed
  const { data: existingPayment } = await admin
    .from('payments')
    .select('booking_id, status')
    .eq('paystack_reference', reference)
    .single();

  if (!existingPayment) {
    return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
  }

  // Already processed - skip
  if (existingPayment.status === 'success') {
    return NextResponse.json({ received: true, already_processed: true });
  }

  // Update payment to success
  await admin
    .from('payments')
    .update({ status: 'success' })
    .eq('paystack_reference', reference);

  // Update booking to PAID
  await admin
    .from('bookings')
    .update({
      status: 'PAID',
      paid_at: new Date().toISOString(),
    })
    .eq('id', existingPayment.booking_id);

  // Generate ticket
  const ticketCode = `AL-${existingPayment.booking_id.slice(0, 5).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  // Check if ticket already exists
  const { data: existingTicket } = await admin
    .from('tickets')
    .select('id')
    .eq('booking_id', existingPayment.booking_id)
    .single();

  if (!existingTicket) {
    await admin.from('tickets').insert({
      booking_id: existingPayment.booking_id,
      ticket_code: ticketCode,
    });
  }

  // Update booking to TICKET_ISSUED
  await admin
    .from('bookings')
    .update({ status: 'TICKET_ISSUED' })
    .eq('id', existingPayment.booking_id);

  // Credit operator wallet
  const { data: booking } = await admin
    .from('bookings')
    .select('route:routes(operator_id, fare), seats_requested')
    .eq('id', existingPayment.booking_id)
    .single();

  if (booking) {
    const route = booking.route as any;
    const operatorEarnings = Number(route.fare) * booking.seats_requested;

    const { data: wallet } = await admin
      .from('wallets')
      .select('pending_balance')
      .eq('operator_id', route.operator_id)
      .single();

    if (wallet) {
      await admin
        .from('wallets')
        .update({ pending_balance: Number(wallet.pending_balance) + operatorEarnings })
        .eq('operator_id', route.operator_id);
    }
  }

  return NextResponse.json({ received: true, processed: true });
}
