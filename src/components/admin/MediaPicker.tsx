import { useState } from "react";
import { MediaGrid, UploadButton, useMediaAssets, type MediaAsset } from "./MediaLibrary";

export function MediaPicker({
  userId,
  value,
  onChange,
  label,
}: {
  userId: string;
  value: string;
  onChange: (url: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const { items, reload } = useMediaAssets();

  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-[0.22em] font-semibold text-sage">{label}</label>
      <div className="flex items-center gap-4">
        <div className="size-16 rounded-lg overflow-hidden bg-stone border border-sage/15 shrink-0">
          {value && (value.match(/\.(mp4|webm|mov)$/i) ? (
            <video src={value} className="w-full h-full object-cover" muted />
          ) : (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ))}
        </div>
        <div className="flex-1 space-y-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://… or pick from library"
            className="w-full bg-transparent border-b border-sage/20 py-2 text-sm focus:outline-none focus:border-sage"
          />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-[11px] uppercase tracking-[0.18em] text-sage border-b border-sage/40 pb-0.5"
          >
            Choose from media library
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-6" onClick={() => setOpen(false)}>
          <div
            className="bg-cream rounded-3xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-xl">Select media</h3>
              <div className="flex items-center gap-4">
                <UploadButton userId={userId} onUploaded={reload} />
                <button type="button" onClick={() => setOpen(false)} className="text-[11px] uppercase tracking-[0.22em] text-ink/50">
                  Close
                </button>
              </div>
            </div>
            <MediaGrid
              items={items}
              selectable
              onSelect={(m: MediaAsset) => {
                onChange(m.url);
                setOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
