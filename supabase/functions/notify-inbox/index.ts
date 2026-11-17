// Supabase Edge Function: e-mail a new website enquiry or shop order to the clinic inbox via Resend.
//
// Called by a database trigger (see supabase/migrations/20261117000000_inbox_email_notifications.sql)
// with { table, id } right after a row is inserted. The function does NOT trust the request body for
// content: it only takes the row id, re-reads the row with the service role, and e-mails what is in
// the database. Each row is claimed with `notified_at` first, so a repeated call can never send twice.
//
// Secrets (Supabase dashboard -> Edge Functions -> Secrets):
//   RESEND_API_KEY (or RESEND_API)   required — the Resend API key
//   CONTACT_INBOX_EMAIL              optional — defaults to info@swastha.org.in
//   CONTACT_FROM_EMAIL               optional — defaults to "Swastha Website <noreply@swastha.org.in>"
//                                    (the sending domain must be verified in Resend)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically by Supabase.

export type Env = {
  supabaseUrl: string;
  serviceKey: string;
  resendKey: string;
  to: string;
  from: string;
};

type Row = Record<string, unknown>;
type Mail = { subject: string; text: string; replyTo?: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const oneLine = (v: unknown) =>
  String(v ?? "")
    .replace(/[\r\n]+/g, " ")
    .trim();
const dash = (v: unknown) => oneLine(v) || "—";
const money = (v: unknown) => `Rs. ${Number(v ?? 0).toLocaleString("en-IN")}`;

const BUILDERS: Record<string, (r: Row) => Mail> = {
  contact_submissions: (r) => ({
    subject: `New enquiry — ${oneLine(r.disease) || "General"} — ${oneLine(r.name)}`,
    replyTo: EMAIL.test(oneLine(r.email)) ? oneLine(r.email) : undefined,
    text: [
      `New enquiry from the Swastha website`,
      ``,
      `Name:     ${dash(r.name)}`,
      `Email:    ${dash(r.email)}`,
      `Phone:    ${dash(r.phone)}`,
      `Concern:  ${dash(r.disease)}`,
      `Subject:  ${dash(r.subject)}`,
      ``,
      `Message:`,
      String(r.body ?? "").trim(),
    ].join("\n"),
  }),

  product_orders: (r) => {
    const email = oneLine(r.email);
    const lines = [
      `New order — Swastha`,
      `Order ref: ${dash(r.order_ref)}`,
      `Sent via:  ${r.channel === "whatsapp" ? "WhatsApp button" : "Email button"}`,
      ``,
      `Product:  ${dash(r.product_name)}`,
      `Quantity: ${dash(r.quantity)}`,
      `Price:    ${money(r.unit_price)} x ${oneLine(r.quantity)} = ${money(r.total)}`,
      ``,
      `Customer: ${dash(r.customer_name)}`,
      `Phone:    ${dash(r.phone)}`,
      `Email:    ${email || "—"}`,
      ``,
      `Delivery address:`,
      String(r.address ?? "").trim(),
      `${oneLine(r.city)}, ${oneLine(r.state)} - ${oneLine(r.pincode)}`,
    ];
    const notes = String(r.notes ?? "").trim();
    if (notes) lines.push(``, `Notes: ${notes}`);
    return {
      subject: `New order ${oneLine(r.order_ref)} — ${oneLine(r.product_name)} x ${oneLine(r.quantity)}`,
      replyTo: EMAIL.test(email) ? email : undefined,
      text: lines.join("\n"),
    };
  },
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export async function handle(
  req: Request,
  env: Env,
  doFetch: typeof fetch = fetch,
): Promise<Response> {
  if (req.method !== "POST") return json(405, { error: "POST only" });

  let payload: { table?: unknown; id?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON" });
  }
  const table = typeof payload.table === "string" ? payload.table : "";
  const id = typeof payload.id === "string" ? payload.id : "";
  const build = Object.prototype.hasOwnProperty.call(BUILDERS, table) ? BUILDERS[table] : null;
  if (!build || !UUID.test(id)) return json(400, { error: "Unknown table or invalid id" });

  const rest = `${env.supabaseUrl}/rest/v1/${table}?id=eq.${id}`;
  const dbHeaders = {
    apikey: env.serviceKey,
    Authorization: `Bearer ${env.serviceKey}`,
    "Content-Type": "application/json",
  };
  const patch = (extra: string, body: Row, returnRows: boolean) =>
    doFetch(`${rest}${extra}`, {
      method: "PATCH",
      headers: { ...dbHeaders, Prefer: returnRows ? "return=representation" : "return=minimal" },
      body: JSON.stringify(body),
    });

  // Claim the row: only the first call finds notified_at still empty.
  const claim = await patch(
    "&notified_at=is.null",
    { notified_at: new Date().toISOString(), notify_error: null },
    true,
  );
  if (!claim.ok) {
    console.error("[notify-inbox] could not claim row:", claim.status, await claim.text());
    return json(500, { error: "Database error" });
  }
  const rows = (await claim.json()) as Row[];
  if (!rows.length) return json(200, { status: "skipped", reason: "already sent or not found" });

  const release = async (reason: string) => {
    await patch("", { notified_at: null, notify_error: reason.slice(0, 300) }, false);
  };

  if (!env.resendKey) {
    await release("Resend API key is not set in Supabase secrets");
    console.error("[notify-inbox] no Resend API key configured");
    return json(500, { error: "Email is not configured" });
  }

  const mail = build(rows[0]);
  let res: Response;
  try {
    res = await doFetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.from,
        to: [env.to],
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
        subject: mail.subject,
        text: mail.text,
      }),
    });
  } catch (err) {
    await release(`Could not reach Resend: ${err instanceof Error ? err.message : String(err)}`);
    return json(502, { error: "Could not reach the email provider" });
  }

  if (!res.ok) {
    const detail = await res.text();
    console.error("[notify-inbox] Resend rejected the email:", res.status, detail);
    await release(`Resend ${res.status}: ${detail}`);
    return json(502, { error: "Email provider rejected the message" });
  }
  return json(200, { status: "sent" });
}

// Start the server only inside the Supabase/Deno runtime (the import above is also used by tests).
// deno-lint-ignore no-explicit-any
const deno = (globalThis as any).Deno;
if (deno?.serve) {
  deno.serve((req: Request) =>
    handle(req, {
      supabaseUrl: deno.env.get("SUPABASE_URL") ?? "",
      serviceKey: deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      resendKey: deno.env.get("RESEND_API_KEY") ?? deno.env.get("RESEND_API") ?? "",
      to: deno.env.get("CONTACT_INBOX_EMAIL") || "info@swastha.org.in",
      from: deno.env.get("CONTACT_FROM_EMAIL") || "Swastha Website <noreply@swastha.org.in>",
    }),
  );
}
