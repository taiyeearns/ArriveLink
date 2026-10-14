import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendPaymentSuccessEmail } from '@/lib/email';

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

  // Generate a unique 6-char boarding code
  const { data: boardingCodeResult } = await admin.rpc('generate_boarding_code');
  const boardingCode = boardingCodeResult || crypto.randomBytes(3).toString('hex').slice(0, 6);

  // Update booking to PAID (auto-confirmed) with boarding code
  await admin
    .from('bookings')
    .update({
      status: 'PAID',
      paid_at: new Date().toISOString(),
      boarding_code: boardingCode,
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

  // Update booking to TICKET_ISSUED (auto - no operator confirmation needed)
  await admin
    .from('bookings')
    .update({ status: 'TICKET_ISSUED' })
    .eq('id', existingPayment.booking_id);

  // Send confirmation email to traveler
  try {
    const { data: booking } = await admin
      .from('bookings')
      .select(`
        seats_requested, traveler_id,
        traveler:users!bookings_traveler_id_fkey(email, name),
        route:routes(
          fare,
          general_route:general_routes!routes_general_route_id_fkey(origin_city, destination_city)
        )
      `)
      .eq('id', existingPayment.booking_id)
      .single();

    if (booking) {
      const traveler = booking.traveler as any;
      const route = booking.route as any;
      const routeLabel = `${route?.general_route?.origin_city} to ${route?.general_route?.destination_city}`;

      if (traveler?.email) {
        await sendPaymentSuccessEmail(traveler.email, {
          route: routeLabel,
          seats: booking.seats_requested,
          fare: Number(route?.fare || 0) * booking.seats_requested,
          boardingCode,
          bookingId: existingPayment.booking_id,
          ticketCode: existingTicket ? ticketCode : ticketCode, // Use the code we generated
        });
      }
    }
  } catch (emailErr) {
    console.error('[webhook] Email send failed (non-fatal):', emailErr);
  }

  // NOTE: Operator wallet is NOT credited on payment.
  // Settlement happens on trip completion, only for boarded passengers.

  return NextResponse.json({ received: true, processed: true });
}

