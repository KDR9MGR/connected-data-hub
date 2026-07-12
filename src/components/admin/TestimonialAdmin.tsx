import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { F, inp } from "./formPrimitives";
import { MediaField } from "./MediaPicker";

type T = { id: string; author_name: string; author_location: string | null; quote: string; rating: number | null; media_type: string; media_url: string | null; is_published: boolean; sort_order: number };

export function TestimonialAdmin() {
  const [items, setItems] = useState<T[]>([]);
  const [edit, setEdit] = useState<Partial<T> | null>(null);

  async function load() {
    const { data } = await supabase.from("testimonials").select("*").order("sort_order").order("created_at", { ascending: false });
    setItems((data as T[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!edit) return;
    const payload = {
      author_name: edit.author_name ?? "",
      author_location: edit.author_location ?? null,
      quote: edit.quote ?? "",
      rating: edit.rating ?? 5,
      media_type: edit.media_type ?? "photo",
      media_url: edit.media_url ?? null,
      is_published: edit.is_published ?? true,
      sort_order: edit.sort_order ?? 0,
    };
    const q = edit.id
      ? supabase.from("testimonials").update(payload).eq("id", edit.id)
      : supabase.from("testimonials").insert(payload);
    const { error } = await q;
    if (error) return alert(error.message);
    setEdit(null); load();
  }
  async function del(id: string) {
    if (!confirm("Delete?")) return;
    await supabase.from("testimonials").delete().eq("id", id); load();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setEdit({ media_type: "photo", is_published: true, rating: 5, sort_order: 0 })} className="bg-sage text-cream px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.18em] hover:bg-ink">+ Add testimonial</button>
      </div>

      {edit && (
        <div className="bg-stone rounded-3xl p-8 space-y-5">
          <div className="flex justify-between items-center"><h3 className="font-serif text-2xl">{edit.id ? "Edit" : "New"} testimonial</h3>
            <button onClick={() => setEdit(null)} className="text-[11px] uppercase tracking-[0.22em] text-ink/50">Cancel</button></div>
          <div className="grid md:grid-cols-2 gap-5">
            <F label="Author name"><input className={inp} value={edit.author_name ?? ""} onChange={(e) => setEdit({ ...edit, author_name: e.target.value })} /></F>
            <F label="Location"><input className={inp} value={edit.author_location ?? ""} onChange={(e) => setEdit({ ...edit, author_location: e.target.value })} /></F>
          </div>
          <F label="Quote"><textarea rows={3} className={`${inp} resize-none`} value={edit.quote ?? ""} onChange={(e) => setEdit({ ...edit, quote: e.target.value })} /></F>
          <div className="grid md:grid-cols-3 gap-5">
            <F label="Rating (1-5)"><input type="number" min={1} max={5} className={inp} value={edit.rating ?? 5} onChange={(e) => setEdit({ ...edit, rating: Number(e.target.value) })} /></F>
            <F label="Media type">
              <select className={inp} value={edit.media_type ?? "photo"} onChange={(e) => setEdit({ ...edit, media_type: e.target.value })}>
                <option value="photo">Photo</option><option value="video">Video</option>
              </select>
            </F>
            <F label="Sort order"><input type="number" className={inp} value={edit.sort_order ?? 0} onChange={(e) => setEdit({ ...edit, sort_order: Number(e.target.value) })} /></F>
          </div>
          <MediaField label="Media (photo or video URL)" value={edit.media_url ?? ""} onChange={(v) => setEdit({ ...edit, media_url: v })} />
          <label className="flex items-center gap-2 text-xs text-ink/70">
            <input type="checkbox" checked={edit.is_published ?? true} onChange={(e) => setEdit({ ...edit, is_published: e.target.checked })} /> Published
          </label>
          <button onClick={save} className="bg-sage text-cream px-8 py-3 rounded-full text-[11px] uppercase tracking-[0.22em] hover:bg-ink">Save</button>
        </div>
      )}

      <div className="grid gap-3">
        {items.map((t) => (
          <div key={t.id} className="bg-stone rounded-2xl p-5 flex flex-wrap justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink/50 mb-1">{t.media_type} · {t.author_location || "—"} · {t.is_published ? "published" : "hidden"}</div>
              <div className="font-serif">{t.author_name}</div>
              <div className="text-sm text-ink/70 line-clamp-2">{t.quote}</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEdit(t)} className="text-[11px] uppercase tracking-[0.18em] text-sage border-b border-sage/40 pb-0.5">Edit</button>
              <button onClick={() => del(t.id)} className="text-[11px] uppercase tracking-[0.18em] text-destructive border-b border-destructive/40 pb-0.5">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-center text-ink/50 py-16 border border-dashed border-sage/20 rounded-2xl text-sm">No testimonials yet.</div>}
      </div>
    </div>
  );
}