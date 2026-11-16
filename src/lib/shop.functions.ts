import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * "Buy now" orders are saved to Supabase by the browser (the `product_orders` table, where the price
 * is re-checked by a database trigger) and — for customers who choose e-mail — forwarded to the clinic
 * inbox through this server function. Mail settings are documented in `resend.server.ts`.
 */
const payload = z.object({
  ref: z.string().regex(/^SW-[A-Z0-9]{8}$/),
  /** The full plain-text order built by `buildOrderMessage` in `@/lib/shop`. */
  message: z.string().trim().min(10).max(4000),
  productName: z.string().trim().min(1).max(200),
  customerName: z.string().trim().min(2).max(100),
  customerEmail: z.string().trim().email().max(255).or(z.literal("")),
  // honeypot: real visitors never fill this in
  website: z.string().max(200),
});

export type OrderNotification = z.input<typeof payload>;

const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export const notifyOrderByEmail = createServerFn({ method: "POST" })
  .inputValidator((input: OrderNotification) => payload.parse(input))
  .handler(async ({ data }) => {
    if (data.website) return { delivered: false as const, reason: "ignored" as const };

    const { sendInboxEmail } = await import("@/lib/resend.server");

    return sendInboxEmail({
      subject: `New order ${data.ref} — ${oneLine(data.productName)} — ${oneLine(data.customerName)}`,
      text: data.message,
      replyTo: data.customerEmail || undefined,
    });
  });
