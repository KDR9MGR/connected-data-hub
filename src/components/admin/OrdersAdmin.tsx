import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CopyButton, EmailStatus } from "@/components/admin/ContactBits";
import {
  ORDER_STATUSES,
  formatPrice,
  normalizeWhatsappNumber,
  type OrderStatus,
  type ProductOrder,
} from "@/lib/shop";

export function OrdersAdmin() {
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data, error: err } = await supabase
      .from("product_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    if (err) setError(err.message);
    setOrders((data as ProductOrder[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function setStatus(o: ProductOrder, status: OrderStatus) {
    const { error: err } = await supabase.from("product_orders").update({ status }).eq("id", o.id);
    if (err) return alert(err.message);
    load();
  }
  async function del(o: ProductOrder) {
    if (!confirm(`Delete order ${o.order_ref}? This cannot be undone.`)) return;
    const { error: err } = await supabase.from("product_orders").delete().eq("id", o.id);
    if (err) return alert(err.message);
    load();
  }

  const shown = orders.filter((o) => filter === "all" || o.status === filter);
  const countOf = (s: OrderStatus) => orders.filter((o) => o.status === s).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter orders by status">
        {(["all", ...ORDER_STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            aria-pressed={filter === s}
            className={`px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.18em] ${
              filter === s ? "bg-sage text-cream" : "bg-cream border border-sage/20 text-ink/60"
            }`}
          >
            {s}
            {s !== "all" && countOf(s) > 0 ? ` · ${countOf(s)}` : ""}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {shown.map((o) => {
          const wa = normalizeWhatsappNumber(o.phone);
          return (
            <div
              key={o.id}
              className={`rounded-2xl p-5 ${o.status === "new" ? "bg-sage/5 border border-sage/20" : "bg-stone"}`}
            >
              <div className="flex flex-wrap justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-ink/50">
                    {o.order_ref} · {new Date(o.created_at).toLocaleString()} · via {o.channel} ·{" "}
                    <EmailStatus sentAt={o.notified_at} error={o.notify_error} />
                  </div>
                  <div className="font-serif text-lg">
                    {o.product_name} <span className="text-ink/50">× {o.quantity}</span>
                  </div>
                  <div className="text-sm text-ink/70">
                    {formatPrice(Number(o.unit_price))} each ·{" "}
                    <span className="font-medium text-ink">{formatPrice(Number(o.total))}</span>
                  </div>
                </div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-ink/50 space-y-1 block">
                  Status
                  <select
                    value={o.status}
                    onChange={(e) => setStatus(o, e.target.value as OrderStatus)}
                    className="block bg-cream border border-sage/20 rounded-lg px-3 py-2 text-sm text-ink normal-case tracking-normal"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4 pt-4 border-t border-sage/10 grid md:grid-cols-2 gap-4 text-sm text-ink/80">
                <div className="space-y-1">
                  <div className="font-medium">{o.customer_name}</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <a href={`tel:${o.phone}`} className="text-sage underline underline-offset-4">
                      {o.phone}
                    </a>
                    <CopyButton value={o.phone} label="phone number" />
                  </div>
                  {o.email && (
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`mailto:${o.email}`}
                        className="text-sage underline underline-offset-4 break-all"
                      >
                        {o.email}
                      </a>
                      <CopyButton value={o.email} label="email" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="whitespace-pre-line">{o.address}</div>
                  <div>
                    {o.city}, {o.state} – {o.pincode}
                  </div>
                  {o.notes && <div className="text-ink/60 italic">“{o.notes}”</div>}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4">
                {wa && (
                  <a
                    href={`https://wa.me/${wa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] uppercase tracking-[0.18em] text-sage border-b border-sage/40 pb-0.5"
                  >
                    Reply on WhatsApp
                  </a>
                )}
                <button
                  onClick={() => del(o)}
                  className="text-[11px] uppercase tracking-[0.18em] text-destructive border-b border-destructive/40 pb-0.5"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
        {!loading && shown.length === 0 && (
          <div className="text-center text-ink/50 py-16 border border-dashed border-sage/20 rounded-2xl text-sm">
            {orders.length === 0 ? "No orders yet." : "No orders with this status."}
          </div>
        )}
      </div>
    </div>
  );
}
