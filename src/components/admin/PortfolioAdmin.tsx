import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { F, inp } from "./formPrimitives";

type P = { id: string; category: string; title: string; description: string | null; image_url: string | null; is_published: boolean; sort_order: number };

export function PortfolioAdmin() {
  const [items, setItems] = useState<P[]>([]);
  const [edit, setEdit] = useState<Partial<P> | null>(null);

  async function load() {
    const { data } = await supabase.from("portfolio_items").select("*").order("category").order("sort_order");
    setItems((data as P[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!edit) return;
    const payload = {
      category: edit.category ?? "Diseases",
      title: edit.title ?? "",
      description: edit.description ?? null,
      image_url: edit.image_url ?? null,
      is_published: edit.is_published ?? true,
      sort_order: edit.sort_order ?? 0,
    };
    const q = edit.id
      ? supabase.from("portfolio_items").update(payload).eq("id", edit.id)
      : supabase.from("portfolio_items").insert(payload);
    const { error } = await q;
    if (error) return alert(error.message);
    setEdit(null); load();
  }
  async function del(id: string) {
    if (!confirm("Delete?")) return;
    await supabase.from("portfolio_items").delete().eq("id", id); load();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setEdit({ category: "Diseases", is_published: true, sort_order: 0 })} className="bg-sage text-cream px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.18em] hover:bg-ink">+ Add item</button>
      </div>
      {edit && (
        <div className="bg-stone rounded-3xl p-8 space-y-5">
          <div className="flex justify-between items-center"><h3 className="font-serif text-2xl">{edit.id ? "Edit" : "New"} portfolio item</h3>
            <button onClick={() => setEdit(null)} className="text-[11px] uppercase tracking-[0.22em] text-ink/50">Cancel</button></div>
          <div className="grid md:grid-cols-2 gap-5">
            <F label="Category">
              <select className={inp} value={edit.category ?? "Diseases"} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>
                <option>Diseases</option><option>Diet & Lifestyle</option>
              </select>
            </F>
            <F label="Title"><input className={inp} value={edit.title ?? ""} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></F>
          </div>
          <F label="Description"><textarea rows={3} className={`${inp} resize-none`} value={edit.description ?? ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></F>
          <F label="Image URL"><input className={inp} value={edit.image_url ?? ""} onChange={(e) => setEdit({ ...edit, image_url: e.target.value })} /></F>
          <div className="grid md:grid-cols-2 gap-5">
            <F label="Sort order"><input type="number" className={inp} value={edit.sort_order ?? 0} onChange={(e) => setEdit({ ...edit, sort_order: Number(e.target.value) })} /></F>
            <label className="flex items-center gap-2 text-xs text-ink/70 mt-6">
              <input type="checkbox" checked={edit.is_published ?? true} onChange={(e) => setEdit({ ...edit, is_published: e.target.checked })} /> Published
            </label>
          </div>
          <button onClick={save} className="bg-sage text-cream px-8 py-3 rounded-full text-[11px] uppercase tracking-[0.22em] hover:bg-ink">Save</button>
        </div>
      )}
      <div className="grid gap-3">
        {items.map((p) => (
          <div key={p.id} className="bg-stone rounded-2xl p-5 flex flex-wrap justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink/50 mb-1">{p.category} · {p.is_published ? "published" : "hidden"}</div>
              <div className="font-serif">{p.title}</div>
              <div className="text-sm text-ink/60 line-clamp-2">{p.description}</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEdit(p)} className="text-[11px] uppercase tracking-[0.18em] text-sage border-b border-sage/40 pb-0.5">Edit</button>
              <button onClick={() => del(p.id)} className="text-[11px] uppercase tracking-[0.18em] text-destructive border-b border-destructive/40 pb-0.5">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-center text-ink/50 py-16 border border-dashed border-sage/20 rounded-2xl text-sm">No portfolio items yet.</div>}
      </div>
    </div>
  );
}