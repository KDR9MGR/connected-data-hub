import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listUsers, setUserRole, inviteUser, deleteUser } from "@/lib/users.functions";

type U = { id: string; email: string; created_at: string; last_sign_in_at: string | null; roles: string[] };
const ROLES = ["admin", "editor", "blogger"] as const;

export function UsersAdmin({ currentUserId }: { currentUserId: string }) {
  const list = useServerFn(listUsers);
  const setRole = useServerFn(setUserRole);
  const invite = useServerFn(inviteUser);
  const del = useServerFn(deleteUser);
  const [users, setUsers] = useState<U[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<typeof ROLES[number]>("blogger");

  async function load() {
    setLoading(true); setErr(null);
    try { setUsers(await list() as U[]); }
    catch (e: any) { setErr(e.message); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function toggle(u: U, role: string, enabled: boolean) {
    try {
      await setRole({ data: { userId: u.id, role, enabled } });
      load();
    } catch (e: any) { alert(e.message); }
  }
  async function doInvite(e: React.FormEvent) {
    e.preventDefault();
    try {
      await invite({ data: { email: inviteEmail, role: inviteRole } });
      setInviteEmail(""); load();
      alert("Invitation sent.");
    } catch (e: any) { alert(e.message); }
  }
  async function doDelete(u: U) {
    if (!confirm(`Delete user ${u.email}? This cannot be undone.`)) return;
    try { await del({ data: { userId: u.id } }); load(); }
    catch (e: any) { alert(e.message); }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={doInvite} className="bg-stone rounded-3xl p-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] uppercase tracking-[0.22em] font-semibold text-sage">Invite email</label>
          <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="user@example.com" className="w-full bg-transparent border-b border-sage/20 py-2 text-sm focus:outline-none focus:border-sage" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.22em] font-semibold text-sage block">Role</label>
          <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as any)} className="bg-transparent border-b border-sage/20 py-2 text-sm focus:outline-none focus:border-sage">
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <button type="submit" className="bg-sage text-cream px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.18em] hover:bg-ink">Send invite</button>
      </form>
      {err && <div className="p-4 bg-destructive/10 text-destructive rounded-2xl text-sm">{err}</div>}
      {loading ? <div className="text-center text-ink/50 py-8 text-sm">Loading users…</div> : (
        <div className="grid gap-3">
          {users.map((u) => (
            <div key={u.id} className="bg-stone rounded-2xl p-5 flex flex-wrap justify-between gap-4 items-center">
              <div className="min-w-0 flex-1">
                <div className="font-serif">{u.email || "(no email)"}{u.id === currentUserId && <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-sage">you</span>}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-ink/40 mt-1">Joined {new Date(u.created_at).toLocaleDateString()} · Last {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "never"}</div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {ROLES.map((r) => {
                  const on = u.roles.includes(r);
                  return (
                    <button key={r} onClick={() => toggle(u, r, !on)}
                      className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.18em] ${on ? "bg-sage text-cream" : "bg-cream border border-sage/20 text-ink/50"}`}>
                      {r}
                    </button>
                  );
                })}
                {u.id !== currentUserId && (
                  <button onClick={() => doDelete(u)} className="text-[10px] uppercase tracking-[0.18em] text-destructive border-b border-destructive/40 pb-0.5">Delete</button>
                )}
              </div>
            </div>
          ))}
          {users.length === 0 && <div className="text-center text-ink/50 py-16 border border-dashed border-sage/20 rounded-2xl text-sm">No users found.</div>}
        </div>
      )}
    </div>
  );
}