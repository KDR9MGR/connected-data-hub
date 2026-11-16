import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductOrder = Database["public"]["Tables"]["product_orders"]["Row"];

export const ORDER_STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
export const formatPrice = (amount: number) => inr.format(amount);

/** Whole-number "% off" when a higher compare-at (MRP) price is set, otherwise null. */
export function discountPercent(price: number, compareAt: number | null | undefined) {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Customer-facing order reference, e.g. SW-7K3M9QAX. Matches the DB check constraint. */
export function makeOrderRef() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 symbols, no 0/O/1/I
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return `SW-${Array.from(bytes, (b) => alphabet[b & 31]).join("")}`;
}

export const orderFormSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z
    .string()
    .trim()
    .min(8, "Enter a valid phone number")
    .max(20)
    .regex(/^[+\d][\d\s()-]{6,}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email").max(255).or(z.literal("")),
  address: z.string().trim().min(8, "Enter your full delivery address").max(300),
  city: z.string().trim().min(2, "Enter your city").max(80),
  state: z.string().trim().min(2, "Enter your state").max(80),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a 6-digit PIN code"),
  quantity: z.number().int().min(1).max(20),
  notes: z.string().trim().max(500),
});

export type OrderForm = z.input<typeof orderFormSchema>;

export type OrderSummary = {
  ref: string;
  productName: string;
  sizeLabel: string | null;
  unitPrice: number;
  quantity: number;
  total: number;
  customer: z.output<typeof orderFormSchema>;
};

/** Plain-text order details — used for the WhatsApp message and the e-mail body. */
export function buildOrderMessage(o: OrderSummary) {
  const c = o.customer;
  const lines = [
    `New order — Swastha`,
    `Order ref: ${o.ref}`,
    ``,
    `Product: ${o.productName}${o.sizeLabel ? ` (${o.sizeLabel})` : ""}`,
    `Quantity: ${o.quantity}`,
    `Price: ${formatPrice(o.unitPrice)} x ${o.quantity} = ${formatPrice(o.total)}`,
    ``,
    `Customer: ${c.name}`,
    `Phone: ${c.phone}`,
    `Email: ${c.email || "-"}`,
    ``,
    `Delivery address:`,
    c.address,
    `${c.city}, ${c.state} - ${c.pincode}`,
  ];
  if (c.notes) lines.push(``, `Notes: ${c.notes}`);
  return lines.join("\n");
}

/** Digits only, with the India country code added to bare 10-digit numbers. */
export function normalizeWhatsappNumber(raw: string | undefined | null) {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function whatsappLink(number: string, text: string) {
  return `https://wa.me/${normalizeWhatsappNumber(number)}?text=${encodeURIComponent(text)}`;
}

export function mailtoLink(to: string, subject: string, body: string) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
