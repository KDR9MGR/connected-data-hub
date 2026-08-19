import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type MediaAsset = {
  id: string;
  storage_path: string;
  url: string;
  file_name: string;
  mime_type: string;
  kind: "image" | "video";
  alt_text: string | null;
  created_at: string;
};

export async function uploadMedia(file: File, userId: string): Promise<MediaAsset> {
  const kind: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
  const ext = file.name.split(".").pop() || "bin";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
  const payload = {
    storage_path: path,
    url: pub.publicUrl,
    file_name: file.name,
    mime_type: file.type,
    kind,
    size_bytes: file.size,
    uploaded_by: userId,
  };
  const { data, error } = await supabase.from("media_assets").insert(payload).select("*").single();
  if (error) throw error;
  return data as MediaAsset;
}

export function useMediaAssets() {
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("media_assets").select("*").order("created_at", { ascending: false });
    setItems((data as MediaAsset[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  return { items, loading, reload: load };
}

export function MediaGrid({
  items,
  onSelect,
  selectable = false,
  onDelete,
}: {
  items: MediaAsset[];
  onSelect?: (item: MediaAsset) => void;
  selectable?: boolean;
  onDelete?: (item: MediaAsset) => void;
}) {
  if (items.length === 0) {
    return <div className="text-center text-ink/50 py-16 border border-dashed border-sage/20 rounded-2xl text-sm">No media uploaded yet.</div>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((m) => (
        <div key={m.id} className="group relative rounded-xl overflow-hidden bg-stone border border-sage/10">
          <button
            type="button"
            onClick={() => selectable && onSelect?.(m)}
            className={`block w-full aspect-square ${selectable ? "cursor-pointer" : "cursor-default"}`}
          >
            {m.kind === "video" ? (
              <video src={m.url} className="w-full h-full object-cover" muted />
            ) : (
              <img src={m.url} alt={m.alt_text ?? m.file_name} className="w-full h-full object-cover" loading="lazy" />
            )}
          </button>
          <div className="absolute inset-x-0 bottom-0 bg-ink/60 px-2 py-1 flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[9px] text-cream/90 truncate">{m.file_name}</span>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(m.url)}
                className="text-[9px] uppercase tracking-[0.15em] text-cream/90 hover:text-gold"
              >
                Copy
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(m)}
                  className="text-[9px] uppercase tracking-[0.15em] text-cream/90 hover:text-destructive"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function UploadButton({ userId, onUploaded }: { userId: string; onUploaded: (asset: MediaAsset) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const asset = await uploadMedia(file, userId);
        onUploaded(asset);
      }
    } catch (e: any) {
      alert(e.message ?? "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="bg-sage text-cream px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.18em] hover:bg-ink disabled:opacity-50"
      >
        {busy ? "Uploading…" : "+ Upload media"}
      </button>
    </>
  );
}

export function MediaLibrary({ userId }: { userId: string }) {
  const { items, loading, reload } = useMediaAssets();

  async function del(m: MediaAsset) {
    if (!confirm(`Delete "${m.file_name}"? This cannot be undone.`)) return;
    await supabase.storage.from("media").remove([m.storage_path]);
    await supabase.from("media_assets").delete().eq("id", m.id);
    reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-xs text-ink/60">{loading ? "Loading…" : `${items.length} file${items.length === 1 ? "" : "s"}`}</p>
        <UploadButton userId={userId} onUploaded={reload} />
      </div>
      <MediaGrid items={items} onDelete={del} />
    </div>
  );
}
