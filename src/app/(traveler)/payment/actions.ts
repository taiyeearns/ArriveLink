'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { CONVENIENCE_FEE } from '@/lib/constants';

export async function getBookingForPayment(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('bookings')
    .select(`
      *,
      route:routes(
        id, fare, departure_time, pickup_terminal, dropoff_terminal, bus_number,
        general_route:general_routes!routes_general_route_id_fkey(origin_city, origin_state, destination_city, destination_state),
        operator:operators!routes_operator_id_fkey(business_name)
      )
    `)
    .eq('id', bookingId)
    .eq('traveler_id', user.id)
    .single();

  if (error || !data) return null;

  // Allow payment for RESERVED bookings (not expired)
  if (data.status !== 'RESERVED') {
    // Also allow viewing if already paid
    if (['PAID', 'TICKET_ISSUED', 'BOARDED', 'COMPLETED'].includes(data.status)) return data;
    return null;
  }

  // Check if reservation has expired
  if (data.payment_expires_at && new Date(data.payment_expires_at) <= new Date()) {
    return null;
  }

  return data;
}

export async function initializePayment(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const admin = createAdminClient();

  // Get booking with route fare
  const { data: booking } = await admin
    .from('bookings')
    .select('id, status, seats_requested, traveler_id, route:routes(fare)')
    .eq('id', bookingId)
    .eq('traveler_id', user.id)
    .single();

  if (!booking) return { error: 'Booking not found' };
  if (booking.status !== 'RESERVED') return { error: 'Booking is not ready for payment' };

  // Check if reservation expired
  const { data: fullBooking } = await admin
    .from('bookings')
    .select('payment_expires_at')
    .eq('id', bookingId)
    .single();
  if (fullBooking?.payment_expires_at && new Date(fullBooking.payment_expires_at) <= new Date()) {
    return { error: 'Reservation has expired. Please book again.' };
  }

  const route = booking.route as any;
  const fareAmount = Number(route.fare) * booking.seats_requested;
  const totalAmount = fareAmount + CONVENIENCE_FEE;

  // Get user email
  const { data: profile } = await admin
    .from('users')
    .select('email')
    .eq('id', user.id)
    .single();

  const email = profile?.email || user.email || '';

  // Initialize Paystack transaction
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) return { error: 'Payment service not configured' };

  const reference = `AL-${bookingId.slice(0, 8)}-${Date.now()}`;

  try {
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(totalAmount * 100), // Paystack uses kobo
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/${bookingId}/verify`,
        metadata: {
          booking_id: bookingId,
          seats: booking.seats_requested,
          fare_amount: fareAmount,
          convenience_fee: CONVENIENCE_FEE,
        },
      }),
    });

    const data = await res.json();

    if (!data.status) {
      return { error: data.message || 'Failed to initialize payment' };
    }

    // Create a pending payment record (remove any old pending one first for retries)
    await admin.from('payments').delete().eq('booking_id', bookingId).eq('status', 'pending');

    await admin.from('payments').insert({
      booking_id: bookingId,
      fare_amount: fareAmount,
      convenience_fee: CONVENIENCE_FEE,
      processing_fee: 0,
      payment_method: 'paystack',
      paystack_reference: reference,
      status: 'pending',
    });

    return {
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
      access_code: data.data.access_code,
    };
  } catch {
    return { error: 'Failed to connect to payment service' };
  }
}

export async function verifyPayment(reference: string) {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) return { error: 'Payment service not configured. PAYSTACK_SECRET_KEY is missing.' };

  if (!reference || reference.trim() === '') {
    return { error: 'No payment reference provided' };
  }

  const admin = createAdminClient();
  const cleanRef = reference.trim();

  // 1. Check if already processed
  const { data: existingPayment } = await admin
    .from('payments')
    .select('booking_id, status')
    .eq('paystack_reference', cleanRef)
    .maybeSingle();

  if (existingPayment?.status === 'success') {
    return { success: true, bookingId: existingPayment.booking_id };
  }

  // 2. Verify with Paystack API
  try {
    const encodedRef = encodeURIComponent(cleanRef);
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodedRef}`, {
      headers: {
        'Authorization': `Bearer ${paystackSecret}`,
      },
      cache: 'no-store',
    });

    const data = await res.json();

    if (!data.status) {
      return { error: `Paystack error: ${data.message || 'Unknown error'}` };
    }

    if (data.data.status !== 'success') {
      return { error: `Payment status: ${data.data.status}. ${data.data.gateway_response || ''}` };
    }
  } catch (e: any) {
    return { error: `Could not reach Paystack: ${e.message || 'network error'}` };
  }

  // 3. Update payment record
  const { data: payment } = await admin
    .from('payments')
    .update({ status: 'success' })
    .eq('paystack_reference', cleanRef)
    .select('booking_id')
    .maybeSingle();

  if (!payment) return { error: 'Payment record not found for this reference' };

  // 4. Update booking to PAID
  await admin
    .from('bookings')
    .update({
      status: 'PAID',
      paid_at: new Date().toISOString(),
    })
    .eq('id', payment.booking_id);

  // 5. Auto-generate ticket (skip if one already exists)
  const { data: existingTicket } = await admin
    .from('tickets')
    .select('id')
    .eq('booking_id', payment.booking_id)
    .maybeSingle();

  if (!existingTicket) {
    const ticketCode = `AL-${payment.booking_id.slice(0, 5).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    await admin.from('tickets').insert({
      booking_id: payment.booking_id,
      ticket_code: ticketCode,
    });
  }

  // 6. Update booking to TICKET_ISSUED
  await admin
    .from('bookings')
    .update({ status: 'TICKET_ISSUED' })
    .eq('id', payment.booking_id);

  // 7. Credit operator wallet (non-critical - wrapped in its own try/catch)
  try {
    const { data: booking } = await admin
      .from('bookings')
      .select('route:routes(operator_id, fare), seats_requested')
      .eq('id', payment.booking_id)
      .maybeSingle();

    if (booking) {
      const route = booking.route as any;
      const operatorEarnings = Number(route.fare) * booking.seats_requested;

      const { data: wallet } = await admin
        .from('wallets')
        .select('pending_balance')
        .eq('operator_id', route.operator_id)
        .maybeSingle();

      if (wallet) {
        await admin
          .from('wallets')
          .update({ pending_balance: Number(wallet.pending_balance) + operatorEarnings })
          .eq('operator_id', route.operator_id);
      }
    }
  } catch {
    // Wallet credit failed - not critical, payment is still successful
    console.error('Wallet credit failed for booking', payment.booking_id);
  }



  return { success: true, bookingId: payment.booking_id };
}

