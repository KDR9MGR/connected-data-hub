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
  size_bytes: number | null;
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
    const { data } = await supabase
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as MediaAsset[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  return { items, loading, reload: load };
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    window.prompt("Copy this URL:", text);
    return false;
  }
}

function formatSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaRow({
  item,
  onSelect,
  selectable,
  onDelete,
}: {
  item: MediaAsset;
  onSelect?: (item: MediaAsset) => void;
  selectable?: boolean;
  onDelete?: (item: MediaAsset) => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await copyToClipboard(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-stone border border-sage/10">
      <button
        type="button"
        onClick={() => selectable && onSelect?.(item)}
        className={`shrink-0 size-16 rounded-lg overflow-hidden bg-cream border border-sage/10 ${selectable ? "cursor-pointer" : "cursor-default"}`}
      >
        {item.kind === "video" ? (
          <video src={item.url} className="w-full h-full object-cover" muted />
        ) : (
          <img
            src={item.url}
            alt={item.alt_text ?? item.file_name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{item.file_name}</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-ink/40 mt-0.5">
          {item.kind} · {formatSize(item.size_bytes ?? undefined)} ·{" "}
          {new Date(item.created_at).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <input
            readOnly
            value={item.url}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 min-w-0 bg-transparent text-[11px] text-ink/50 border border-sage/10 rounded px-2 py-1 truncate focus:outline-none focus:border-sage/40"
          />
        </div>
      </div>

      <div className="flex gap-3 shrink-0">
        <button
          type="button"
          onClick={copy}
          className={`text-[11px] uppercase tracking-[0.18em] border-b pb-0.5 whitespace-nowrap ${copied ? "text-sage border-sage" : "text-sage/80 border-sage/40 hover:text-sage"}`}
        >
          {copied ? "Copied ✓" : "Copy URL"}
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="text-[11px] uppercase tracking-[0.18em] text-destructive border-b border-destructive/40 pb-0.5 whitespace-nowrap"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
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
    return (
      <div className="text-center text-ink/50 py-16 border border-dashed border-sage/20 rounded-2xl text-sm">
        No media uploaded yet.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {items.map((m) => (
        <MediaRow
          key={m.id}
          item={m}
          onSelect={onSelect}
          selectable={selectable}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export function UploadButton({
  userId,
  onUploaded,
}: {
  userId: string;
  onUploaded: (asset: MediaAsset) => void;
}) {
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
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed");
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
        <p className="text-xs text-ink/60">
          {loading ? "Loading…" : `${items.length} file${items.length === 1 ? "" : "s"}`}
        </p>
        <UploadButton userId={userId} onUploaded={() => reload()} />
      </div>
      <MediaGrid items={items} onDelete={del} />
    </div>
  );
}
