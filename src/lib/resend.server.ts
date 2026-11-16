/**
 * Server-only helper: e-mail a message to the clinic inbox through Resend.
 * Load it inside server-function handlers:  const { sendInboxEmail } = await import("@/lib/resend.server");
 *
 * Server environment variables (set in the deployment, never committed):
 *   RESEND_API_KEY        required to actually send — without it the caller still succeeds (the data is
 *                         already saved in Supabase) and a warning is logged instead.
 *   CONTACT_INBOX_EMAIL   optional, defaults to info@swastha.org.in
 *   CONTACT_FROM_EMAIL    optional, defaults to "Swastha Website <noreply@swastha.org.in>"
 *                         (the sending domain must be verified in Resend)
 */
export const CONTACT_INBOX_DEFAULT = "info@swastha.org.in";
const FROM_DEFAULT = "Swastha Website <noreply@swastha.org.in>";

export type MailResult =
  | { delivered: true }
  | { delivered: false; reason: "not_configured" | "provider_error" };

export async function sendInboxEmail(opts: {
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<MailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "[mail] RESEND_API_KEY is not set — the message was saved to Supabase but NOT emailed.",
    );
    return { delivered: false, reason: "not_configured" };
  }

  const to = process.env.CONTACT_INBOX_EMAIL || CONTACT_INBOX_DEFAULT;
  const from = process.env.CONTACT_FROM_EMAIL || FROM_DEFAULT;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      subject: opts.subject,
      text: opts.text,
    }),
  });

  if (!res.ok) {
    console.error("[mail] Resend rejected the email:", res.status, await res.text());
    return { delivered: false, reason: "provider_error" };
  }
  return { delivered: true };
}
