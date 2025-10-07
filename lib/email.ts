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

function escapeHtml(str: string) {
  return str.replace(/[&<>'"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[c] as string));
}
