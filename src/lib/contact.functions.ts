import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Every website form (home + /contact share <ContactForm/>) is saved to Supabase by the browser
 * AND forwarded by email through this server function, so the clinic inbox gets a copy.
 * Mail settings (RESEND_API_KEY etc.) are documented in `resend.server.ts`.
 */
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

    const { sendInboxEmail } = await import("@/lib/resend.server");

    const text = [
      `New enquiry from the Swastha website`,
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

    return sendInboxEmail({
      subject: `New enquiry — ${oneLine(data.disease) || "General"} — ${oneLine(data.name)}`,
      text,
      replyTo: data.email,
    });
  });
