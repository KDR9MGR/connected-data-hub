import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type S = { id: string; name: string; email: string; phone: string | null; subject: string | null; disease: string | null; body: string; is_read: boolean; created_at: string };

export function SubmissionsAdmin() {
  const [items, setItems] = useState<S[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
    setItems((data as S[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function toggleRead(s: S) {
    await supabase.from("contact_submissions").update({ is_read: !s.is_read }).eq("id", s.id); load();
  }
  async function del(id: string) {
    if (!confirm("Delete submission?")) return;
    await supabase.from("contact_submissions").delete().eq("id", id); load();
  }

  return (
    <div className="space-y-3">
      {items.map((s) => (
        <div key={s.id} className={`rounded-2xl p-5 ${s.is_read ? "bg-stone" : "bg-sage/5 border border-sage/20"}`}>
          <div className="flex flex-wrap justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink/50 mb-1">
                {new Date(s.created_at).toLocaleString()} · {s.disease || "—"}
              </div>
              <div className="font-serif">{s.name} <span className="text-ink/50 text-sm">· {s.email}</span></div>
              {s.subject && <div className="text-sm text-ink/60">{s.subject}</div>}
            </div>
            <div className="flex gap-3 items-start">
              <button onClick={() => setOpenId(openId === s.id ? null : s.id)} className="text-[11px] uppercase tracking-[0.18em] text-sage border-b border-sage/40 pb-0.5">{openId === s.id ? "Close" : "View"}</button>
              <button onClick={() => toggleRead(s)} className="text-[11px] uppercase tracking-[0.18em] text-ink/60 border-b border-ink/20 pb-0.5">{s.is_read ? "Unread" : "Read"}</button>
              <button onClick={() => del(s.id)} className="text-[11px] uppercase tracking-[0.18em] text-destructive border-b border-destructive/40 pb-0.5">Delete</button>
            </div>
          </div>
          {openId === s.id && (
            <div className="mt-4 pt-4 border-t border-sage/10 text-sm space-y-2 text-ink/80">
              {s.phone && <div><span className="text-ink/50 uppercase text-[10px] tracking-[0.2em]">Phone: </span>{s.phone}</div>}
              <p className="whitespace-pre-wrap">{s.body}</p>
            </div>
          )}
        </div>
      ))}
      {items.length === 0 && <div className="text-center text-ink/50 py-16 border border-dashed border-sage/20 rounded-2xl text-sm">No submissions yet.</div>}
    </div>
  );
}