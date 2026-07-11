'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function getTicketForBooking(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();

  const { data: booking } = await admin
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

  if (!booking) return null;

  const { data: ticket } = await admin
    .from('tickets')
    .select('*')
    .eq('booking_id', bookingId)
    .single();

  if (!ticket) return null;

  return { booking, ticket };
}
