'use server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'arrivelink@gmail.com';

export async function submitContactForm(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const company = formData.get('company') as string;
  const subject = (formData.get('subject') as string) || 'Operator Enquiry';
  const message = formData.get('message') as string;

  if (!name?.trim()) return { error: 'Name is required' };
  if (!email?.trim()) return { error: 'Email is required' };
  if (!message?.trim()) return { error: 'Message is required' };
  if (!RESEND_API_KEY) return { error: 'Email service not configured' };

  const rows = [
    '<tr><td>Name</td><td>' + name.trim() + '</td></tr>',
    '<tr><td>Email</td><td>' + email.trim() + '</td></tr>',
    '<tr><td>Company</td><td>' + (company?.trim() || 'N/A') + '</td></tr>',
    '<tr><td>Subject</td><td>' + subject.trim() + '</td></tr>',
    '<tr><td>Message</td><td>' + message.trim() + '</td></tr>',
  ].join('');
  const html = '<html><body><h2>ArriveLink - New Contact Submission</h2><table>' + rows + '</table></body></html>';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'ArriveLink <onboarding@resend.dev>',
        to: [ADMIN_EMAIL],
        reply_to: email.trim(),
        subject: 'Contact: ' + subject.trim(),
        html,
      }),
    });
    if (!res.ok) return { error: 'Failed to send. Please try again.' };
    return { success: true };
  } catch {
    return { error: 'Something went wrong. Please try again.' };
  }
}