import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { checkStudioUnlocked, unlockStudio } from "@/lib/gate.functions";

export const Route = createFileRoute("/auth")({ component: AuthPage });

type Mode = "signin" | "signup";
type Role = "editor" | "blogger";

function AuthPage() {
  const nav = useNavigate();
  const check = useServerFn(checkStudioUnlocked);
  const unlock = useServerFn(unlockStudio);
  const [gateChecked, setGateChecked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [gateErr, setGateErr] = useState<string | null>(null);
  const [gateLoading, setGateLoading] = useState(false);

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<Role>("blogger");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    check().then((r) => {
      setUnlocked(r.unlocked);
      setGateChecked(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/studio" });
    });
  }, [nav]);

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setGateErr(null);
    setGateLoading(true);
    try {
      const r = await unlock({ data: { code } });
      if (r.ok) setUnlocked(true);
      else setGateErr("Invalid access code");
    } catch (e: any) {
      setGateErr(e?.message ?? "Something went wrong");
    } finally {
      setGateLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/studio`,
            data: { display_name: displayName || email.split("@")[0], role },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      nav({ to: "/studio" });
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setErr(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/studio` },
    });
    if (error) setErr(error.message);
  }

  if (!gateChecked) {
    return <section className="pt-32 pb-24 px-6 text-center text-ink/50 text-sm">Loading…</section>;
  }

  if (!unlocked) {
    return (
      <section className="pt-32 pb-24 px-6 min-h-screen">
        <div className="max-w-md mx-auto">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4">Restricted</div>
          <h1 className="text-4xl font-serif mb-3">Enter access code</h1>
          <p className="text-ink/60 text-sm mb-10">This area is for staff. Enter the shared access code to continue.</p>
          <form onSubmit={submitCode} className="bg-stone p-8 rounded-3xl space-y-5">
            <Field label="Access code">
              <input type="password" required autoFocus value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} placeholder="••••••••" autoComplete="off" />
            </Field>
            {gateErr && <p className="text-[12px] text-destructive">{gateErr}</p>}
            <button type="submit" disabled={gateLoading} className="w-full bg-sage text-cream py-4 rounded-full text-xs font-medium uppercase tracking-[0.22em] hover:bg-ink transition-colors disabled:opacity-60">
              {gateLoading ? "Please wait…" : "Continue"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link to="/" className="text-[11px] uppercase tracking-[0.22em] text-ink/40 hover:text-sage">← Back to site</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-md mx-auto">
        <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4">Swāstha Studio</div>
        <h1 className="text-4xl font-serif mb-3">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
        <p className="text-ink/60 text-sm mb-10">
          {mode === "signin" ? "Sign in to manage content." : "Editors and bloggers only."}
        </p>

        <form onSubmit={onSubmit} className="bg-stone p-8 rounded-3xl space-y-5">
          {mode === "signup" && (
            <>
              <Field label="Display name">
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputCls} placeholder="Your name" />
              </Field>
              <Field label="Role">
                <div className="flex gap-2">
                  {(["blogger", "editor"] as Role[]).map((r) => (
                    <button type="button" key={r} onClick={() => setRole(r)}
                      className={`flex-1 rounded-full py-2.5 text-[11px] uppercase tracking-[0.18em] transition ${role === r ? "bg-sage text-cream" : "bg-cream text-ink/70 border border-sage/20"}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </Field>
            </>
          )}
          <Field label="Email">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="name@domain.com" />
          </Field>
          <Field label="Password">
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" />
          </Field>

          {err && <p className="text-[12px] text-destructive">{err}</p>}

          <button type="submit" disabled={loading} className="w-full bg-sage text-cream py-4 rounded-full text-xs font-medium uppercase tracking-[0.22em] hover:bg-ink transition-colors disabled:opacity-60">
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-sage/15" />
            <span className="text-[10px] uppercase tracking-[0.22em] text-ink/40">or</span>
            <div className="flex-1 h-px bg-sage/15" />
          </div>

          <button type="button" onClick={google} className="w-full border border-sage/20 bg-cream py-3.5 rounded-full text-xs font-medium uppercase tracking-[0.22em] text-ink hover:bg-sage/5 transition-colors">
            Continue with Google
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-ink/60">
          {mode === "signin" ? (
            <>New here? <button onClick={() => setMode("signup")} className="text-sage underline underline-offset-4">Create account</button></>
          ) : (
            <>Already have one? <button onClick={() => setMode("signin")} className="text-sage underline underline-offset-4">Sign in</button></>
          )}
        </div>
        <div className="mt-4 text-center">
          <Link to="/" className="text-[11px] uppercase tracking-[0.22em] text-ink/40 hover:text-sage">← Back to site</Link>
        </div>
      </div>
    </section>
  );
}

const inputCls = "w-full bg-transparent border-b border-sage/20 py-2 text-sm focus:outline-none focus:border-sage transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-[0.22em] font-semibold text-sage">{label}</label>
      {children}
    </div>
  );
}