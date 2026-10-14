'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendSupportTicketReplyEmail } from '@/lib/email';

// --------------------------------------------------------------------------
// Get current user info
// --------------------------------------------------------------------------
async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('users')
    .select('id, name, email, role')
    .eq('id', user.id)
    .single();

  return profile;
}

// --------------------------------------------------------------------------
// List tickets for the current user
// --------------------------------------------------------------------------
export async function getMyTickets() {
  const user = await getCurrentUser();
  if (!user) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from('support_tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return data || [];
}

// --------------------------------------------------------------------------
// Get a single ticket with replies
// --------------------------------------------------------------------------
export async function getTicketWithReplies(ticketId: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: ticket } = await admin
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .single();

  if (!ticket) return null;

  // Non-admins can only view their own tickets
  if (user.role !== 'admin' && ticket.user_id !== user.id) return null;

  const { data: replies } = await admin
    .from('ticket_replies')
    .select('*, user:users(name, role)')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  return { ticket, replies: replies || [], currentUser: user };
}

// --------------------------------------------------------------------------
// Create a new ticket
// --------------------------------------------------------------------------
export async function createTicket(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not logged in' };

  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;
  const category = formData.get('category') as string || 'general';

  if (!subject?.trim()) return { error: 'Subject is required' };
  if (!message?.trim()) return { error: 'Message is required' };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('support_tickets')
    .insert({
      user_id: user.id,
      email: user.email,
      name: user.name || 'User',
      category,
      subject: subject.trim(),
      message: message.trim(),
      status: 'open',
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/support');
  revalidatePath('/dashboard/support');
  return { data };
}

// --------------------------------------------------------------------------
// Reply to a ticket
// --------------------------------------------------------------------------
export async function replyToTicket(ticketId: string, message: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not logged in' };

  if (!message?.trim()) return { error: 'Message is required' };

  const admin = createAdminClient();

  const { data: ticket } = await admin
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .single();

  if (!ticket) return { error: 'Ticket not found' };

  // Non-admins can only reply to their own tickets
  const isAdmin = user.role === 'admin';
  if (!isAdmin && ticket.user_id !== user.id) return { error: 'Not authorized' };

  const { error } = await admin
    .from('ticket_replies')
    .insert({
      ticket_id: ticketId,
      user_id: user.id,
      is_admin: isAdmin,
      message: message.trim(),
    });

  if (error) return { error: error.message };

  // Update ticket status
  if (isAdmin && ticket.status === 'open') {
    await admin
      .from('support_tickets')
      .update({ status: 'in_progress' })
      .eq('id', ticketId);
  }

  // Send email notification to the other party
  try {
    if (isAdmin && ticket.email) {
      await sendSupportTicketReplyEmail(ticket.email, {
        ticketSubject: ticket.subject,
        replyMessage: message.trim(),
        ticketId,
      });
    }
  } catch {
    // Non-fatal
  }

  revalidatePath('/support');
  revalidatePath('/dashboard/support');
  revalidatePath('/admin/support');
  return { success: true };
}

// --------------------------------------------------------------------------
// Create a public ticket (no auth required)
// --------------------------------------------------------------------------
export async function createPublicTicket(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;
  const category = formData.get('category') as string || 'general';

  if (!name?.trim()) return { error: 'Name is required' };
  if (!email?.trim()) return { error: 'Email is required' };
  if (!subject?.trim()) return { error: 'Subject is required' };
  if (!message?.trim()) return { error: 'Message is required' };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('support_tickets')
    .insert({
      user_id: null,
      email: email.trim(),
      name: name.trim(),
      category,
      subject: subject.trim(),
      message: message.trim(),
      status: 'open',
    })
    .select()
    .single();

  if (error) return { error: error.message };

  return { data };
}

// --------------------------------------------------------------------------
// Admin: get all tickets
// --------------------------------------------------------------------------
export async function getAllTickets(statusFilter?: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') return [];

  const admin = createAdminClient();
  let query = admin
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data } = await query;
  return data || [];
}

// --------------------------------------------------------------------------
// Admin: update ticket status
// --------------------------------------------------------------------------
export async function updateTicketStatus(ticketId: string, status: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') return { error: 'Not authorized' };

  const admin = createAdminClient();
  const { error } = await admin
    .from('support_tickets')
    .update({ status })
    .eq('id', ticketId);

  if (error) return { error: error.message };

  revalidatePath('/admin/support');
  return { success: true };
}
