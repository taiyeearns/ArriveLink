'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function getGeneralRoutes() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('general_routes')
    .select('*')
    .order('origin_state', { ascending: true })
    .order('origin_city', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function createGeneralRoute(formData: FormData) {
  const originCity = formData.get('origin_city') as string;
  const originState = formData.get('origin_state') as string;
  const destinationCity = formData.get('destination_city') as string;
  const destinationState = formData.get('destination_state') as string;

  if (!originCity?.trim()) return { error: 'Origin city is required' };
  if (!originState?.trim()) return { error: 'Origin state is required' };
  if (!destinationCity?.trim()) return { error: 'Destination city is required' };
  if (!destinationState?.trim()) return { error: 'Destination state is required' };

  if (
    originCity.trim().toLowerCase() === destinationCity.trim().toLowerCase() &&
    originState.trim().toLowerCase() === destinationState.trim().toLowerCase()
  ) {
    return { error: 'Origin and destination must be different' };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('general_routes')
    .insert({
      origin_city: originCity.trim(),
      origin_state: originState.trim(),
      destination_city: destinationCity.trim(),
      destination_state: destinationState.trim(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { error: 'This route corridor already exists' };
    }
    return { error: error.message };
  }

  revalidatePath('/admin/routes');
  return { data };
}

export async function updateGeneralRoute(id: string, formData: FormData) {
  const originCity = formData.get('origin_city') as string;
  const originState = formData.get('origin_state') as string;
  const destinationCity = formData.get('destination_city') as string;
  const destinationState = formData.get('destination_state') as string;

  if (!originCity?.trim()) return { error: 'Origin city is required' };
  if (!originState?.trim()) return { error: 'Origin state is required' };
  if (!destinationCity?.trim()) return { error: 'Destination city is required' };
  if (!destinationState?.trim()) return { error: 'Destination state is required' };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('general_routes')
    .update({
      origin_city: originCity.trim(),
      origin_state: originState.trim(),
      destination_city: destinationCity.trim(),
      destination_state: destinationState.trim(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { error: 'This route corridor already exists' };
    }
    return { error: error.message };
  }

  revalidatePath('/admin/routes');
  return { data };
}

export async function toggleGeneralRoute(id: string) {
  const supabase = createAdminClient();

  const { data: route } = await supabase
    .from('general_routes')
    .select('active')
    .eq('id', id)
    .single();

  if (!route) return { error: 'Route not found' };

  const { error } = await supabase
    .from('general_routes')
    .update({ active: !route.active })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/routes');
  return { active: !route.active };
}

export async function deleteGeneralRoute(id: string) {
  const supabase = createAdminClient();

  // Check if any operator routes reference this general route
  const { count } = await supabase
    .from('routes')
    .select('id', { count: 'exact', head: true })
    .eq('general_route_id', id);

  if (count && count > 0) {
    return { error: `Cannot delete: ${count} operator bus(es) use this route` };
  }

  const { error } = await supabase
    .from('general_routes')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/routes');
  return { success: true };
}
