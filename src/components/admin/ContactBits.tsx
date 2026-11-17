import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

/** Copies text to the clipboard; falls back to a hidden textarea where the Clipboard API is blocked. */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Small "Copy" button for an email address or phone number in the admin lists. */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function onClick() {
    const ok = await copyText(value);
    setState(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1600);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={`Copy ${label}`}
      aria-label={`Copy ${label}`}
      className={`inline-flex items-center gap-1 align-middle rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] transition-colors ${
        state === "copied"
          ? "border-sage bg-sage text-cream"
          : state === "failed"
            ? "border-destructive/50 text-destructive"
            : "border-sage/30 text-sage hover:bg-sage/10"
      }`}
    >
      {state === "copied" ? <Check size={11} /> : <Copy size={11} />}
      {state === "copied" ? "Copied" : state === "failed" ? "Failed" : "Copy"}
      <span role="status" aria-live="polite" className="sr-only">
        {state === "copied" ? `${label} copied` : ""}
      </span>
    </button>
  );
}

/** Whether the notification e-mail for this row reached the clinic inbox. */
export function EmailStatus({ sentAt, error }: { sentAt: string | null; error: string | null }) {
  if (sentAt) {
    return (
      <span
        className="text-sage"
        title={`Emailed to the inbox on ${new Date(sentAt).toLocaleString()}`}
      >
        Emailed ✓
      </span>
    );
  }
  if (error) {
    return (
      <span className="text-destructive" title={error}>
        Email failed
      </span>
    );
  }
  return (
    <span title="No notification e-mail was sent for this one (it may pre-date the feature, or is still sending)">
      Not emailed
    </span>
  );
}
