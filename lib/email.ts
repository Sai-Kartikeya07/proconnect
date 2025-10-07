import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.NOTIFY_FROM_EMAIL || 'no-reply@example.com';

let resend: Resend | null = null;
if (resendApiKey) {
  resend = new Resend(resendApiKey);
}

export interface SendNotificationParams {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmailNotification({ to, subject, html }: SendNotificationParams) {
  if (!resend) {
    console.warn('Resend API key not configured; skipping email send');
    return { skipped: true };
  }
  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send email notification', error);
    return { success: false, error };
  }
}

export function renderPostCreatedEmail(firstName: string, text: string) {
  return `<div style="font-family:Arial,sans-serif;">
    <h2>Your post is live 🎉</h2>
    <p>Hi ${firstName},</p>
    <p>Your new post has been published:</p>
    <blockquote style="border-left:4px solid #6366f1;padding:8px 12px;color:#444;">${escapeHtml(text)}</blockquote>
    <p>We'll keep you updated when others interact with it.</p>
    <p style="font-size:12px;color:#888;">You can disable these emails later if we add notification preferences.</p>
  </div>`;
}

export function renderPostLikedEmail(ownerName: string, likerName: string, postSnippet: string) {
  return `<div style="font-family:Arial,sans-serif;">
    <h2>Your post got a like 👍</h2>
    <p>Hi ${ownerName},</p>
    <p><strong>${likerName}</strong> liked your post:</p>
    <blockquote style="border-left:4px solid #6366f1;padding:8px 12px;color:#444;">${escapeHtml(postSnippet)}</blockquote>
  </div>`;
}

export function renderPostCommentedEmail(ownerName: string, commenterName: string, comment: string, postSnippet: string) {
  return `<div style="font-family:Arial,sans-serif;">
    <h2>New comment 💬</h2>
    <p>Hi ${ownerName},</p>
    <p><strong>${commenterName}</strong> commented on your post:</p>
    <blockquote style="border-left:4px solid #6366f1;padding:8px 12px;color:#444;">${escapeHtml(comment)}</blockquote>
    <p>On the post:</p>
    <blockquote style="border-left:4px solid #d1d5db;padding:8px 12px;color:#555;">${escapeHtml(postSnippet)}</blockquote>
  </div>`;
}

export function renderWelcomeEmail(firstName: string) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;background:#0f1115;padding:24px;color:#e5e7eb;">
  <div style="max-width:640px;margin:0 auto;background:#1c1f24;border:1px solid #2a2f36;border-radius:12px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#3b82f6,#6366f1);padding:28px 32px;">
      <h1 style="margin:0;font-size:24px;font-weight:600;color:#fff;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">Welcome to ProConnect</h1>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 16px;font-size:15px;">Hi ${escapeHtml(firstName || 'there')},</p>
      <p style="margin:0 0 16px;font-size:15px;">We're excited to have you join a community built for sharing posts, discovering opportunities, and building professional connections.</p>
      <div style="margin:24px 0;padding:16px 20px;border:1px solid #334155;border-radius:10px;background:#111418;">
        <h2 style="margin:0 0 12px;font-size:16px;color:#93c5fd;font-weight:600;">Here’s what you can do next:</h2>
        <ul style="padding-left:20px;margin:0;color:#cbd5e1;font-size:14px;">
          <li style="margin-bottom:6px;">Create your first post to introduce yourself</li>
          <li style="margin-bottom:6px;">Add your education details to enhance your profile</li>
          <li style="margin-bottom:6px;">Follow people you find interesting</li>
          <li style="margin-bottom:6px;">Explore jobs posted by the community</li>
        </ul>
      </div>
      <p style="margin:0 0 16px;font-size:15px;">Need help? Just reply to this email (if monitored) or visit your profile to adjust settings.</p>
      <p style="margin:24px 0 0;font-size:12px;color:#64748b;">You’re receiving this because you created a ProConnect account. If this wasn’t you, you can ignore this email.</p>
    </div>
  </div>
</div>`;
}

function escapeHtml(str: string) {
  return str.replace(/[&<>'"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[c] as string));
}
