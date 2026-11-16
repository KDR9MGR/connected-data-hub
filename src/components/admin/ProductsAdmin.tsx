import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { F, inp } from "./formPrimitives";
import { MediaPicker } from "./MediaPicker";
import { ProductImage } from "@/components/shop/ProductImage";
import { formatPrice, slugify, type Product } from "@/lib/shop";

type Draft = Partial<Omit<Product, "images">> & { images: string[] };

const MAX_IMAGES = 8;

const blank = (): Draft => ({
  name: "",
  slug: "",
  images: [""],
  in_stock: true,
  is_featured: false,
  is_published: true,
  sort_order: 0,
});

const numOrUndefined = (v: string) => (v === "" ? undefined : Number(v));

export function ProductsAdmin({ userId }: { userId: string }) {
  const [items, setItems] = useState<Product[]>([]);
  const [edit, setEdit] = useState<Draft | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("sort_order")
      .order("created_at", { ascending: false });
    setItems((data as Product[]) ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  const categories = Array.from(
    new Set(items.map((p) => p.category).filter((c): c is string => !!c)),
  );

  function startEdit(p?: Product) {
    setError(null);
    setSlugTouched(!!p);
    setEdit(p ? { ...p, images: p.images.length ? p.images : [""] } : blank());
  }

  function patch(next: Partial<Draft>) {
    setEdit((e) => (e ? { ...e, ...next } : e));
  }

  function setImage(index: number, url: string) {
    if (!edit) return;
    patch({ images: edit.images.map((u, i) => (i === index ? url : u)) });
  }

  async function save() {
    if (!edit) return;
    const name = (edit.name ?? "").trim();
    const slug = slugify(edit.slug?.trim() || name);
    if (!name) return setError("Please enter a product name.");
    if (!slug) return setError("The URL slug needs letters or numbers.");
    if (edit.price === undefined || Number.isNaN(edit.price) || edit.price < 0)
      return setError("Please enter a price (0 or more).");
    if (
      edit.compare_at_price !== undefined &&
      edit.compare_at_price !== null &&
      (Number.isNaN(edit.compare_at_price) || edit.compare_at_price < 0)
    )
      return setError("The original price must be 0 or more.");

    const payload = {
      name,
      slug,
      category: edit.category?.trim() || null,
      short_description: edit.short_description?.trim() || null,
      description: edit.description?.trim() || null,
      price: edit.price,
      compare_at_price: edit.compare_at_price ?? null,
      size_label: edit.size_label?.trim() || null,
      images: edit.images.map((u) => u.trim()).filter(Boolean),
      in_stock: edit.in_stock ?? true,
      is_featured: edit.is_featured ?? false,
      is_published: edit.is_published ?? true,
      sort_order: edit.sort_order ?? 0,
    };

    setSaving(true);
    setError(null);
    const q = edit.id
      ? supabase.from("products").update(payload).eq("id", edit.id)
      : supabase.from("products").insert(payload);
    const { error: err } = await q;
    setSaving(false);
    if (err) {
      setError(
        err.code === "23505"
          ? "Another product already uses this URL slug. Please change the slug."
          : err.message,
      );
      return;
    }
    setEdit(null);
    load();
  }

  async function del(p: Product) {
    if (!confirm(`Delete "${p.name}"? Past orders keep their details.`)) return;
    const { error: err } = await supabase.from("products").delete().eq("id", p.id);
    if (err) return alert(err.message);
    load();
  }

  async function quickToggle(p: Product, field: "in_stock" | "is_published") {
    const { error: err } = await supabase
      .from("products")
      .update(field === "in_stock" ? { in_stock: !p.in_stock } : { is_published: !p.is_published })
      .eq("id", p.id);
    if (err) return alert(err.message);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => startEdit()}
          className="bg-sage text-cream px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.18em] hover:bg-ink"
        >
          + Add product
        </button>
      </div>

      {edit && (
        <div className="bg-stone rounded-3xl p-8 space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-2xl">{edit.id ? "Edit" : "New"} product</h3>
            <button
              onClick={() => setEdit(null)}
              className="text-[11px] uppercase tracking-[0.22em] text-ink/50"
            >
              Cancel
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <F label="Product name">
              <input
                className={inp}
                value={edit.name ?? ""}
                onChange={(e) => {
                  const name = e.target.value;
                  patch({ name, ...(slugTouched ? {} : { slug: slugify(name) }) });
                }}
              />
            </F>
            <F label="URL slug (shop/…)">
              <input
                className={inp}
                value={edit.slug ?? ""}
                onChange={(e) => {
                  setSlugTouched(true);
                  patch({ slug: e.target.value });
                }}
                placeholder="auto-generated from the name"
              />
            </F>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <F label="Price (₹)">
              <input
                type="number"
                min={0}
                step="0.01"
                className={inp}
                value={edit.price ?? ""}
                onChange={(e) => patch({ price: numOrUndefined(e.target.value) })}
              />
            </F>
            <F label="Original price / MRP (₹, optional)">
              <input
                type="number"
                min={0}
                step="0.01"
                className={inp}
                value={edit.compare_at_price ?? ""}
                onChange={(e) =>
                  patch({ compare_at_price: numOrUndefined(e.target.value) ?? null })
                }
              />
            </F>
            <F label="Size / pack (e.g. 100 g)">
              <input
                className={inp}
                value={edit.size_label ?? ""}
                onChange={(e) => patch({ size_label: e.target.value })}
              />
            </F>
          </div>

          <F label="Category">
            <input
              className={inp}
              list="product-categories"
              value={edit.category ?? ""}
              onChange={(e) => patch({ category: e.target.value })}
              placeholder="e.g. Herbal oils, Supplements, Teas"
            />
            <datalist id="product-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </F>

          <F label="Short description (shown on the product card)">
            <textarea
              rows={2}
              className={`${inp} resize-none`}
              value={edit.short_description ?? ""}
              onChange={(e) => patch({ short_description: e.target.value })}
            />
          </F>
          <F label="Full description (separate paragraphs with a blank line)">
            <textarea
              rows={6}
              className={`${inp} resize-none`}
              value={edit.description ?? ""}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </F>

          <div className="space-y-4">
            <div className="text-[10px] uppercase tracking-[0.22em] font-semibold text-sage">
              Photos (the first one is the main photo)
            </div>
            {edit.images.map((url, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-1">
                  <MediaPicker
                    userId={userId}
                    label={`Photo ${i + 1}`}
                    value={url}
                    onChange={(u) => setImage(i, u)}
                  />
                </div>
                {edit.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => patch({ images: edit.images.filter((_, idx) => idx !== i) })}
                    className="mt-6 text-[11px] uppercase tracking-[0.18em] text-destructive border-b border-destructive/40 pb-0.5"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {edit.images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => patch({ images: [...edit.images, ""] })}
                className="text-[11px] uppercase tracking-[0.18em] text-sage border-b border-sage/40 pb-0.5"
              >
                + Add another photo
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <F label="Sort order (lower shows first)">
              <input
                type="number"
                className={inp}
                value={edit.sort_order ?? 0}
                onChange={(e) => patch({ sort_order: Number(e.target.value) })}
              />
            </F>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink/70 md:mt-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={edit.in_stock ?? true}
                  onChange={(e) => patch({ in_stock: e.target.checked })}
                />
                In stock
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={edit.is_featured ?? false}
                  onChange={(e) => patch({ is_featured: e.target.checked })}
                />
                Featured
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={edit.is_published ?? true}
                  onChange={(e) => patch({ is_published: e.target.checked })}
                />
                Published
              </label>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="bg-sage text-cream px-8 py-3 rounded-full text-[11px] uppercase tracking-[0.22em] hover:bg-ink disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save product"}
          </button>
        </div>
      )}

      <div className="grid gap-3">
        {items.map((p) => (
          <div key={p.id} className="bg-stone rounded-2xl p-4 flex flex-wrap items-center gap-4">
            <ProductImage src={p.images[0]} alt={p.name} className="size-16 rounded-xl shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink/50 mb-1">
                {p.category || "no category"} · {p.is_published ? "published" : "hidden"} ·{" "}
                {p.in_stock ? "in stock" : "sold out"}
                {p.is_featured ? " · featured" : ""}
              </div>
              <div className="font-serif">{p.name}</div>
              <div className="text-sm text-ink/60">
                {formatPrice(Number(p.price))}
                {p.size_label ? ` · ${p.size_label}` : ""}
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => quickToggle(p, "in_stock")}
                className="text-[11px] uppercase tracking-[0.18em] text-ink/60 border-b border-ink/20 pb-0.5"
              >
                {p.in_stock ? "Mark sold out" : "Mark in stock"}
              </button>
              <button
                onClick={() => quickToggle(p, "is_published")}
                className="text-[11px] uppercase tracking-[0.18em] text-ink/60 border-b border-ink/20 pb-0.5"
              >
                {p.is_published ? "Hide" : "Publish"}
              </button>
              <button
                onClick={() => startEdit(p)}
                className="text-[11px] uppercase tracking-[0.18em] text-sage border-b border-sage/40 pb-0.5"
              >
                Edit
              </button>
              <button
                onClick={() => del(p)}
                className="text-[11px] uppercase tracking-[0.18em] text-destructive border-b border-destructive/40 pb-0.5"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center text-ink/50 py-16 border border-dashed border-sage/20 rounded-2xl text-sm">
            No products yet. Add your first product to start the shop.
          </div>
        )}
      </div>
    </div>
  );
}
