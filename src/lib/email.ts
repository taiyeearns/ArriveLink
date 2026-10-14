'use server';

// ============================================================================
// ArriveLink - Email Service (Resend)
// ============================================================================
// Transactional emails for booking events, boarding, trip completion, etc.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'ArriveLink <onboarding@resend.dev>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.arrivelink.app';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set, skipping email:', subject);
    return;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[email] Failed to send:', res.status, errorText);
    }
  } catch (err) {
    console.error('[email] Error sending email:', err);
  }
}

// --------------------------------------------------------------------------
// Branded email wrapper
// --------------------------------------------------------------------------
function emailLayout(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a4d2e,#2d6a4f);padding:28px 32px;">
      <h1 style="margin:0;font-size:20px;color:#fff;font-weight:700;letter-spacing:-0.3px;">ArriveLink</h1>
      <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.6);">${title}</p>
    </div>
    <!-- Body -->
    <div style="padding:32px;">
      ${body}
    </div>
    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid #eef2f0;text-align:center;">
      <p style="margin:0;font-size:11px;color:#999;">
        ArriveLink - Book your bus, arrive with confidence
      </p>
      <p style="margin:6px 0 0;font-size:11px;color:#bbb;">
        <a href="${APP_URL}" style="color:#2d6a4f;text-decoration:none;">arrivelink.app</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

// --------------------------------------------------------------------------
// Email templates
// --------------------------------------------------------------------------

export async function sendBookingReservedEmail(to: string, data: {
  route: string;
  seats: number;
  fare: number;
  minutesLeft: number;
  bookingId: string;
}) {
  const html = emailLayout('Seat Reserved', `
    <h2 style="margin:0 0 12px;font-size:18px;color:#1a1a1a;">Your seat is reserved!</h2>
    <p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.6;">
      You have <strong>${data.minutesLeft} minutes</strong> to complete payment before your reservation expires.
    </p>
    <div style="background:#f0f9f4;border-radius:12px;padding:16px;margin:0 0 20px;">
      <p style="margin:0 0 6px;font-size:12px;color:#888;">Route</p>
      <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#1a1a1a;">${data.route}</p>
      <p style="margin:0 0 6px;font-size:12px;color:#888;">Seats</p>
      <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#1a1a1a;">${data.seats}</p>
      <p style="margin:0 0 6px;font-size:12px;color:#888;">Total</p>
      <p style="margin:0;font-size:15px;font-weight:600;color:#1a1a1a;">N${data.fare.toLocaleString()}</p>
    </div>
    <a href="${APP_URL}/payment/${data.bookingId}" style="display:inline-block;background:#1a4d2e;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;">
      Pay Now
    </a>
  `);

  await sendEmail({ to, subject: 'Seat Reserved - Pay within ' + data.minutesLeft + ' minutes', html });
}

export async function sendPaymentSuccessEmail(to: string, data: {
  route: string;
  seats: number;
  fare: number;
  boardingCode: string;
  bookingId: string;
  ticketCode: string;
}) {
  const html = emailLayout('Booking Confirmed', `
    <h2 style="margin:0 0 12px;font-size:18px;color:#1a1a1a;">Payment successful!</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.6;">
      Your booking is confirmed. Show your boarding code to the driver when you board.
    </p>
    <div style="text-align:center;margin:0 0 20px;">
      <p style="margin:0 0 8px;font-size:12px;color:#888;">Your Boarding Code</p>
      <div style="display:inline-block;background:#1a4d2e;color:#fff;padding:16px 32px;border-radius:12px;">
        <p style="margin:0;font-family:monospace;font-size:28px;font-weight:700;letter-spacing:4px;">${data.boardingCode}</p>
      </div>
      <p style="margin:8px 0 0;font-size:11px;color:#999;">Case-sensitive. Give this to the driver.</p>
    </div>
    <div style="background:#f0f9f4;border-radius:12px;padding:16px;margin:0 0 20px;">
      <p style="margin:0 0 6px;font-size:12px;color:#888;">Route</p>
      <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#1a1a1a;">${data.route}</p>
      <p style="margin:0 0 6px;font-size:12px;color:#888;">Ticket</p>
      <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#1a1a1a;">${data.ticketCode}</p>
      <p style="margin:0 0 6px;font-size:12px;color:#888;">Seats</p>
      <p style="margin:0;font-size:15px;font-weight:600;color:#1a1a1a;">${data.seats}</p>
    </div>
    <a href="${APP_URL}/ticket/${data.bookingId}" style="display:inline-block;background:#1a4d2e;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;">
      View Ticket
    </a>
  `);

  await sendEmail({ to, subject: 'Booking Confirmed - ' + data.route, html });
}

export async function sendBookingExpiredEmail(to: string, data: {
  route: string;
  seats: number;
}) {
  const html = emailLayout('Reservation Expired', `
    <h2 style="margin:0 0 12px;font-size:18px;color:#1a1a1a;">Your reservation has expired</h2>
    <p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.6;">
      The payment window for your reservation on <strong>${data.route}</strong> (${data.seats} seat${data.seats !== 1 ? 's' : ''}) has closed. The seat has been released.
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#555;">
      You can search for available buses and book again.
    </p>
    <a href="${APP_URL}" style="display:inline-block;background:#1a4d2e;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;">
      Search Buses
    </a>
  `);

  await sendEmail({ to, subject: 'Reservation Expired - ' + data.route, html });
}

export async function sendBoardingConfirmedEmail(to: string, data: {
  route: string;
}) {
  const html = emailLayout('Boarding Confirmed', `
    <h2 style="margin:0 0 12px;font-size:18px;color:#1a1a1a;">You're on board!</h2>
    <p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.6;">
      Your boarding has been verified for <strong>${data.route}</strong>. Have a safe and comfortable trip!
    </p>
  `);

  await sendEmail({ to, subject: 'Boarding Confirmed - Have a safe trip!', html });
}

export async function sendTripCompletedEmail(to: string, data: {
  route: string;
  bookingId: string;
}) {
  const html = emailLayout('Trip Complete', `
    <h2 style="margin:0 0 12px;font-size:18px;color:#1a1a1a;">Trip complete!</h2>
    <p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.6;">
      Your trip on <strong>${data.route}</strong> has been completed. We hope you had a great experience!
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#555;">
      Please take a moment to rate your trip.
    </p>
    <a href="${APP_URL}/history" style="display:inline-block;background:#1a4d2e;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;">
      Rate Your Trip
    </a>
  `);

  await sendEmail({ to, subject: 'Trip Complete - Rate your experience', html });
}

export async function sendNewBookingToOperatorEmail(to: string, data: {
  route: string;
  seats: number;
  travelerName: string;
}) {
  const html = emailLayout('New Booking', `
    <h2 style="margin:0 0 12px;font-size:18px;color:#1a1a1a;">New booking received</h2>
    <p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.6;">
      <strong>${data.travelerName}</strong> has reserved <strong>${data.seats} seat${data.seats !== 1 ? 's' : ''}</strong> on your route:
    </p>
    <div style="background:#f0f9f4;border-radius:12px;padding:16px;margin:0 0 20px;">
      <p style="margin:0;font-size:15px;font-weight:600;color:#1a1a1a;">${data.route}</p>
    </div>
  `);

  await sendEmail({ to, subject: 'New Booking - ' + data.route, html });
}

export async function sendSettlementEmail(to: string, data: {
  route: string;
  amount: number;
  status: string;
}) {
  const html = emailLayout('Settlement Update', `
    <h2 style="margin:0 0 12px;font-size:18px;color:#1a1a1a;">Settlement ${data.status}</h2>
    <p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.6;">
      Trip on <strong>${data.route}</strong> has been settled.
    </p>
    <div style="background:#f0f9f4;border-radius:12px;padding:16px;margin:0 0 20px;">
      <p style="margin:0 0 6px;font-size:12px;color:#888;">Amount</p>
      <p style="margin:0;font-size:24px;font-weight:700;color:#1a4d2e;">N${data.amount.toLocaleString()}</p>
    </div>
  `);

  await sendEmail({ to, subject: 'Settlement - N' + data.amount.toLocaleString(), html });
}

export async function sendSupportTicketReplyEmail(to: string, data: {
  ticketSubject: string;
  replyMessage: string;
  ticketId: string;
}) {
  const html = emailLayout('Support Reply', `
    <h2 style="margin:0 0 12px;font-size:18px;color:#1a1a1a;">New reply on your ticket</h2>
    <p style="margin:0 0 8px;font-size:12px;color:#888;">Subject: ${data.ticketSubject}</p>
    <div style="background:#f8f8f8;border-radius:12px;padding:16px;margin:0 0 20px;border-left:3px solid #1a4d2e;">
      <p style="margin:0;font-size:14px;color:#333;line-height:1.6;white-space:pre-wrap;">${data.replyMessage}</p>
    </div>
    <a href="${APP_URL}/support" style="display:inline-block;background:#1a4d2e;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;">
      View Ticket
    </a>
  `);

  await sendEmail({ to, subject: 'Re: ' + data.ticketSubject, html });
}
