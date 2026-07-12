import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "media";

export function publicUrl(path: string) {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Small inline field: preview + Upload / Pick / Clear. */
export function MediaField({ value, onChange, label = "Image" }: { value: string; onChange: (url: string) => void; label?: string }) {
  const [browsing, setBrowsing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from(BUCKET).upload(name, file, { upsert: false });
    setBusy(false);
    if (error) return alert(error.message);
    onChange(publicUrl(name));
  }

  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-[0.22em] font-semibold text-sage">{label}</label>
      <div className="flex gap-3 items-start flex-wrap">
        {value ? (
          <img src={value} alt="" className="h-20 w-20 object-cover rounded-lg border border-sage/20" />
        ) : (
          <div className="h-20 w-20 rounded-lg border border-dashed border-sage/30 flex items-center justify-center text-[10px] text-ink/40 uppercase tracking-wider">Empty</div>
        )}
        <div className="flex-1 min-w-[200px] space-y-2">
          <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://... or upload/pick below" className="w-full bg-transparent border-b border-sage/20 py-2 text-sm focus:outline-none focus:border-sage" />
          <div className="flex gap-3 text-[11px] uppercase tracking-[0.18em]">
            <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="text-sage border-b border-sage/40 pb-0.5 disabled:opacity-50">{busy ? "Uploading…" : "Upload"}</button>
            <button type="button" onClick={() => setBrowsing(true)} className="text-sage border-b border-sage/40 pb-0.5">Pick from library</button>
            {value && <button type="button" onClick={() => onChange("")} className="text-destructive border-b border-destructive/40 pb-0.5">Clear</button>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.currentTarget.value = ""; }} />
        </div>
      </div>
      {browsing && <MediaLibraryModal onClose={() => setBrowsing(false)} onPick={(url) => { onChange(url); setBrowsing(false); }} />}
    </div>
  );
}

export function MediaLibraryModal({ onClose, onPick }: { onClose: () => void; onPick: (url: string) => void }) {
  const [items, setItems] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.storage.from(BUCKET).list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } }).then(({ data }) => {
      setItems((data ?? []).filter((f) => f.name !== ".emptyFolderPlaceholder").map((f) => ({ name: f.name, url: publicUrl(f.name) })));
      setLoading(false);
    });
  }, []);
  return (
    <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream rounded-3xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-serif text-xl">Media library</h3>
          <button onClick={onClose} className="text-[11px] uppercase tracking-[0.22em] text-ink/50">Close</button>
        </div>
        {loading ? <div className="text-center py-12 text-sm text-ink/50">Loading…</div> : (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {items.map((it) => (
              <button key={it.name} onClick={() => onPick(it.url)} className="aspect-square rounded-lg overflow-hidden border border-sage/10 hover:border-sage transition">
                <img src={it.url} alt={it.name} className="w-full h-full object-cover" />
              </button>
            ))}
            {items.length === 0 && <div className="col-span-full text-center text-ink/50 py-8 text-sm">No media yet. Upload from any admin form or the Media tab.</div>}
          </div>
        )}
      </div>
    </div>
  );
}