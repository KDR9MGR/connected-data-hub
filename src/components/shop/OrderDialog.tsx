import { useEffect, useState } from "react";
import { Mail, MessageCircle, Minus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePageSection } from "@/lib/usePageContent";
import { PAGE_CONTENT_DEFAULTS } from "@/lib/pageContentSchema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductImage } from "@/components/shop/ProductImage";
import {
  buildOrderMessage,
  formatPrice,
  makeOrderRef,
  normalizeWhatsappNumber,
  orderFormSchema,
  whatsappLink,
  type OrderForm,
  type Product,
} from "@/lib/shop";

type Channel = "whatsapp" | "email";

type Result = { kind: "whatsapp"; ref: string; link: string } | { kind: "email"; ref: string };

const emptyForm: OrderForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  quantity: 1,
  notes: "",
};

const MAX_QTY = 10;

export function OrderDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { content: shop } = usePageSection("global", "shop");
  const [form, setForm] = useState<OrderForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Channel | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [honeypot, setHoneypot] = useState("");

  // Start fresh every time the dialog is opened for a product.
  useEffect(() => {
    if (open) {
      setErrors({});
      setSubmitError(null);
      setResult(null);
      setSubmitting(null);
    }
  }, [open, product.id]);

  const unitPrice = Number(product.price);
  const qty = Number.isFinite(form.quantity) ? form.quantity : 1;
  const total = unitPrice * qty;

  const update =
    (k: keyof OrderForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(channel: Channel) {
    const parsed = orderFormSchema.safeParse(form);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) fe[String(issue.path[0])] ??= issue.message;
      setErrors(fe);
      return;
    }
    setErrors({});
    setSubmitError(null);

    const v = parsed.data;
    const ref = makeOrderRef();
    const message = buildOrderMessage({
      ref,
      productName: product.name,
      sizeLabel: product.size_label,
      unitPrice,
      quantity: v.quantity,
      total: unitPrice * v.quantity,
      customer: v,
    });

    // Bots fill the hidden field: pretend it worked, store and send nothing.
    if (honeypot) {
      setResult({ kind: "email", ref });
      return;
    }

    setSubmitting(channel);

    // 1) Save the order. The database re-checks the product, price and stock, and then e-mails the
    //    order to the clinic inbox on its own (see supabase/functions/notify-inbox).
    const { error } = await supabase.from("product_orders").insert({
      order_ref: ref,
      product_id: product.id,
      quantity: v.quantity,
      customer_name: v.name,
      phone: v.phone,
      email: v.email || null,
      address: v.address,
      city: v.city,
      state: v.state,
      pincode: v.pincode,
      notes: v.notes || null,
      channel,
    });
    if (error) {
      setSubmitting(null);
      setSubmitError(error.message);
      return;
    }

    // 2) WhatsApp orders also open a chat with the order text filled in.
    if (channel === "whatsapp") {
      // A blank value saved from the admin panel must not produce a broken wa.me link.
      const number = normalizeWhatsappNumber(shop.whatsapp_number)
        ? shop.whatsapp_number
        : PAGE_CONTENT_DEFAULTS.global.shop.whatsapp_number;
      const link = whatsappLink(number, message);
      window.open(link, "_blank", "noopener,noreferrer");
      setResult({ kind: "whatsapp", ref, link });
    } else {
      setResult({ kind: "email", ref });
    }
    setSubmitting(null);
    setForm(emptyForm);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto overflow-x-hidden grid-cols-[minmax(0,1fr)] bg-cream border-sage/15 sm:max-w-xl rounded-3xl p-6 md:p-8">
        {result ? (
          <SuccessView result={result} onClose={() => onOpenChange(false)} />
        ) : (
          <>
            <DialogHeader className="text-left space-y-1.5">
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Buy now</div>
              <DialogTitle className="text-3xl font-serif font-light">
                Your order details
              </DialogTitle>
              <DialogDescription className="text-ink/60">{shop.order_note}</DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-4 bg-stone rounded-2xl p-4">
              <ProductImage
                src={product.images[0]}
                alt={product.name}
                className="size-16 rounded-xl shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-serif text-lg leading-tight truncate">{product.name}</div>
                {product.size_label && (
                  <div className="text-xs text-ink/50">{product.size_label}</div>
                )}
                <div className="text-sm text-ink/70 mt-1">
                  {formatPrice(unitPrice)} × {qty} ={" "}
                  <span className="font-medium text-ink">{formatPrice(total)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0" aria-label="Quantity">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setForm((f) => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                  className="size-8 rounded-full border border-sage/25 flex items-center justify-center hover:bg-sage hover:text-cream transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-7 text-center text-sm tabular-nums">{qty}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() =>
                    setForm((f) => ({ ...f, quantity: Math.min(MAX_QTY, f.quantity + 1) }))
                  }
                  className="size-8 rounded-full border border-sage/25 flex items-center justify-center hover:bg-sage hover:text-cream transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-5"
              aria-label="Order details"
            >
              <Field label="Full name" error={errors.name} htmlFor="order-name">
                <input
                  id="order-name"
                  autoComplete="name"
                  value={form.name}
                  onChange={update("name")}
                  className={inputClass}
                  placeholder="Aditi Sharma"
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Phone number" error={errors.phone} htmlFor="order-phone">
                  <input
                    id="order-phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={update("phone")}
                    className={inputClass}
                    placeholder="+91 …"
                  />
                </Field>
                <Field label="Email (optional)" error={errors.email} htmlFor="order-email">
                  <input
                    id="order-email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={update("email")}
                    className={inputClass}
                    placeholder="name@domain.com"
                  />
                </Field>
              </div>

              <Field label="Delivery address" error={errors.address} htmlFor="order-address">
                <textarea
                  id="order-address"
                  rows={2}
                  autoComplete="street-address"
                  value={form.address}
                  onChange={update("address")}
                  className={`${inputClass} resize-none`}
                  placeholder="House / flat no., street, area"
                />
              </Field>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                <Field label="City" error={errors.city} htmlFor="order-city">
                  <input
                    id="order-city"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={update("city")}
                    className={inputClass}
                  />
                </Field>
                <Field label="State" error={errors.state} htmlFor="order-state">
                  <input
                    id="order-state"
                    autoComplete="address-level1"
                    value={form.state}
                    onChange={update("state")}
                    className={inputClass}
                  />
                </Field>
                <Field label="PIN code" error={errors.pincode} htmlFor="order-pincode">
                  <input
                    id="order-pincode"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="postal-code"
                    value={form.pincode}
                    onChange={update("pincode")}
                    className={inputClass}
                    placeholder="400001"
                  />
                </Field>
              </div>

              <Field label="Notes (optional)" error={errors.notes} htmlFor="order-notes">
                <textarea
                  id="order-notes"
                  rows={2}
                  value={form.notes}
                  onChange={update("notes")}
                  className={`${inputClass} resize-none`}
                  placeholder="Anything we should know about delivery or the order"
                />
              </Field>

              {/* Honeypot — hidden from people, bots tend to fill it in. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>
                  Website
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </label>
              </div>

              {submitError && (
                <p role="alert" className="text-[12px] text-destructive">
                  {submitError}
                </p>
              )}

              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  disabled={submitting !== null}
                  onClick={() => submit("whatsapp")}
                  className="inline-flex items-center justify-center gap-2 bg-sage text-cream py-3.5 rounded-full text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-ink transition-colors disabled:opacity-60"
                >
                  <MessageCircle size={16} />
                  {submitting === "whatsapp" ? "Saving…" : "Order on WhatsApp"}
                </button>
                <button
                  type="button"
                  disabled={submitting !== null}
                  onClick={() => submit("email")}
                  className="inline-flex items-center justify-center gap-2 border border-sage/40 text-sage py-3.5 rounded-full text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-sage hover:text-cream transition-colors disabled:opacity-60"
                >
                  <Mail size={16} />
                  {submitting === "email" ? "Sending…" : "Order by email"}
                </button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SuccessView({ result, onClose }: { result: Result; onClose: () => void }) {
  const actionClass =
    "inline-flex items-center justify-center gap-2 bg-sage text-cream px-7 py-3.5 rounded-full text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-ink transition-colors";

  return (
    <div className="text-center py-4 space-y-5">
      <DialogHeader className="space-y-2 text-center sm:text-center">
        <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Order {result.ref}</div>
        <DialogTitle className="text-3xl font-serif font-light">
          {result.kind === "whatsapp" ? "One last step" : "Order received"}
        </DialogTitle>
        <DialogDescription className="text-ink/60 max-w-sm mx-auto">
          {result.kind === "whatsapp"
            ? "Your order is saved. WhatsApp should have opened with your details filled in — press Send so our team receives it."
            : "Thank you. Your order has been sent to our team and we will contact you shortly to confirm."}
        </DialogDescription>
      </DialogHeader>

      {result.kind === "whatsapp" && (
        <a href={result.link} target="_blank" rel="noopener noreferrer" className={actionClass}>
          <MessageCircle size={16} /> Open WhatsApp
        </a>
      )}

      <div>
        <button
          type="button"
          onClick={onClose}
          className="text-[11px] uppercase tracking-[0.22em] text-sage border-b border-sage/40 pb-0.5"
        >
          Close
        </button>
      </div>
    </div>
  );
}

const inputClass =
  "w-full min-w-0 bg-transparent border-b border-sage/20 py-2 text-sm focus:outline-none focus:border-sage transition-colors";

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 min-w-0">
      <label
        htmlFor={htmlFor}
        className="text-[10px] uppercase tracking-[0.22em] font-semibold text-sage"
      >
        {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
