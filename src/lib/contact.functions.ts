import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Every website form (home + /contact share <ContactForm/>) is saved to Supabase by the browser
 * AND forwarded by email through this server function, so the clinic inbox gets a copy.
 *
 * Server environment variables (set in the deployment, never committed):
 *   RESEND_API_KEY        required to actually send — without it the submission is still saved in
 *                         Supabase and the function logs a warning instead of failing the form.
 *   CONTACT_INBOX_EMAIL   optional, defaults to info@swastha.org.in
 *   CONTACT_FROM_EMAIL    optional, defaults to "Swāstha Website <noreply@swastha.org.in>"
 *                         (the sending domain must be verified in Resend)
 */
export const CONTACT_INBOX_DEFAULT = "info@swastha.org.in";
const FROM_DEFAULT = "Swāstha Website <noreply@swastha.org.in>";

const payload = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30),
  subject: z.string().trim().max(200),
  disease: z.string().trim().max(200),
  body: z.string().trim().min(10).max(2000),
  // honeypot: real visitors never fill this in
  website: z.string().max(200),
});

export type ContactNotification = z.input<typeof payload>;

const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export const notifyContactSubmission = createServerFn({ method: "POST" })
  .inputValidator((input: ContactNotification) => payload.parse(input))
  .handler(async ({ data }) => {
    if (data.website) return { delivered: false as const, reason: "ignored" as const };

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(
        "[contact] RESEND_API_KEY is not set — enquiry was saved to Supabase but NOT emailed.",
      );
      return { delivered: false as const, reason: "not_configured" as const };
    }

    const to = process.env.CONTACT_INBOX_EMAIL || CONTACT_INBOX_DEFAULT;
    const from = process.env.CONTACT_FROM_EMAIL || FROM_DEFAULT;

    const text = [
      `New enquiry from the Swāstha website`,
      ``,
      `Name:     ${oneLine(data.name)}`,
      `Email:    ${oneLine(data.email)}`,
      `Phone:    ${oneLine(data.phone) || "—"}`,
      `Concern:  ${oneLine(data.disease) || "—"}`,
      `Subject:  ${oneLine(data.subject) || "—"}`,
      ``,
      `Message:`,
      data.body,
    ].join("\n");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.email,
        subject: `New enquiry — ${oneLine(data.disease) || "General"} — ${oneLine(data.name)}`,
        text,
      }),
    });

    if (!res.ok) {
      console.error("[contact] Resend rejected the email:", res.status, await res.text());
      return { delivered: false as const, reason: "provider_error" as const };
    }
    return { delivered: true as const };
  });
