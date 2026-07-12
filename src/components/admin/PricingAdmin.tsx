import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { F, inp } from "./formPrimitives";

type Plan = { id: string; name: string; price_label: string; description: string | null; features: string[]; is_featured: boolean; is_published: boolean; sort_order: number };

export function PricingAdmin() {
  const [items, setItems] = useState<Plan[]>([]);
  const [edit, setEdit] = useState<Partial<Plan> | null>(null);

  async function load() {
    const { data } = await supabase.from("pricing_plans").select("*").order("sort_order");
    setItems((data as Plan[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!edit) return;
    const payload = {
      name: edit.name ?? "",
      price_label: edit.price_label ?? "",
      description: edit.description ?? null,
      features: edit.features ?? [],
      is_featured: edit.is_featured ?? false,
      is_published: edit.is_published ?? true,
      sort_order: edit.sort_order ?? 0,
    };
    const q = edit.id
      ? supabase.from("pricing_plans").update(payload).eq("id", edit.id)
      : supabase.from("pricing_plans").insert(payload);
    const { error } = await q;
    if (error) return alert(error.message);
    setEdit(null); load();
  }
  async function del(id: string) {
    if (!confirm("Delete?")) return;
    await supabase.from("pricing_plans").delete().eq("id", id); load();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setEdit({ features: [], is_published: true, sort_order: 0 })} className="bg-sage text-cream px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.18em] hover:bg-ink">+ Add plan</button>
      </div>
      {edit && (
        <div className="bg-stone rounded-3xl p-8 space-y-5">
          <div className="flex justify-between items-center"><h3 className="font-serif text-2xl">{edit.id ? "Edit" : "New"} plan</h3>
            <button onClick={() => setEdit(null)} className="text-[11px] uppercase tracking-[0.22em] text-ink/50">Cancel</button></div>
          <div className="grid md:grid-cols-2 gap-5">
            <F label="Name"><input className={inp} value={edit.name ?? ""} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></F>
            <F label="Price label"><input className={inp} value={edit.price_label ?? ""} onChange={(e) => setEdit({ ...edit, price_label: e.target.value })} placeholder="Rs.2,500 / consult" /></F>
          </div>
          <F label="Description"><textarea rows={2} className={`${inp} resize-none`} value={edit.description ?? ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></F>
          <F label="Features (one per line)">
            <textarea rows={5} className={`${inp} resize-none`} value={(edit.features ?? []).join("\n")} onChange={(e) => setEdit({ ...edit, features: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) })} />
          </F>
          <div className="grid md:grid-cols-3 gap-5">
            <F label="Sort"><input type="number" className={inp} value={edit.sort_order ?? 0} onChange={(e) => setEdit({ ...edit, sort_order: Number(e.target.value) })} /></F>
            <label className="flex items-center gap-2 text-xs text-ink/70 mt-6"><input type="checkbox" checked={edit.is_featured ?? false} onChange={(e) => setEdit({ ...edit, is_featured: e.target.checked })} /> Featured</label>
            <label className="flex items-center gap-2 text-xs text-ink/70 mt-6"><input type="checkbox" checked={edit.is_published ?? true} onChange={(e) => setEdit({ ...edit, is_published: e.target.checked })} /> Published</label>
          </div>
          <button onClick={save} className="bg-sage text-cream px-8 py-3 rounded-full text-[11px] uppercase tracking-[0.22em] hover:bg-ink">Save</button>
        </div>
      )}
      <div className="grid gap-3">
        {items.map((p) => (
          <div key={p.id} className="bg-stone rounded-2xl p-5 flex flex-wrap justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink/50 mb-1">{p.price_label} · {p.is_featured ? "featured · " : ""}{p.is_published ? "published" : "hidden"}</div>
              <div className="font-serif">{p.name}</div>
              <div className="text-sm text-ink/60 line-clamp-2">{p.description}</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEdit(p)} className="text-[11px] uppercase tracking-[0.18em] text-sage border-b border-sage/40 pb-0.5">Edit</button>
              <button onClick={() => del(p.id)} className="text-[11px] uppercase tracking-[0.18em] text-destructive border-b border-destructive/40 pb-0.5">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-center text-ink/50 py-16 border border-dashed border-sage/20 rounded-2xl text-sm">No pricing plans yet.</div>}
      </div>
    </div>
  );
}