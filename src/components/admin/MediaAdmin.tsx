import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { publicUrl } from "./MediaPicker";

const BUCKET = "media";

export function MediaAdmin() {
  const [items, setItems] = useState<{ name: string; url: string; size?: number }[]>([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await supabase.storage.from(BUCKET).list("", { limit: 500, sortBy: { column: "created_at", order: "desc" } });
    setItems((data ?? []).filter((f) => f.name !== ".emptyFolderPlaceholder").map((f) => ({ name: f.name, url: publicUrl(f.name), size: f.metadata?.size })));
  }
  useEffect(() => { load(); }, []);

  async function upload(files: FileList | null) {
    if (!files) return;
    setBusy(true);
    for (const file of Array.from(files)) {
      const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage.from(BUCKET).upload(name, file, { upsert: false });
      if (error) alert(`${file.name}: ${error.message}`);
    }
    setBusy(false);
    load();
  }

  async function del(name: string) {
    if (!confirm("Delete this file? Links using it will break.")) return;
    const { error } = await supabase.storage.from(BUCKET).remove([name]);
    if (error) return alert(error.message);
    load();
  }

  return (
    <div className="space-y-6">
      <label className="block border-2 border-dashed border-sage/30 rounded-3xl p-10 text-center cursor-pointer hover:bg-stone/50 transition"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}>
        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => upload(e.target.files)} />
        <div className="text-sm text-ink/70">{busy ? "Uploading…" : "Drop images here or click to upload"}</div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-ink/40 mt-2">Multiple files supported</div>
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((it) => (
          <div key={it.name} className="group relative rounded-2xl overflow-hidden bg-stone">
            <img src={it.url} alt={it.name} className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 bg-ink/70 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2 p-3">
              <button onClick={() => { navigator.clipboard.writeText(it.url); alert("URL copied"); }} className="text-[10px] uppercase tracking-[0.18em] text-cream border-b border-cream/40 pb-0.5">Copy URL</button>
              <button onClick={() => del(it.name)} className="text-[10px] uppercase tracking-[0.18em] text-red-300 border-b border-red-300/40 pb-0.5">Delete</button>
              <div className="text-[9px] text-cream/60 text-center break-all mt-1">{it.name}</div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-full text-center text-ink/50 py-16 border border-dashed border-sage/20 rounded-2xl text-sm">No media uploaded yet.</div>}
      </div>
    </div>
  );
}