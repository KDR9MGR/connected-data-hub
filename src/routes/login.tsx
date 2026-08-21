import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      supabase.auth
        .getSession()
        .then(({ data }) => {
          if (data.session) nav({ to: "/admin" });
        })
        .catch((e: Error) => setErr(e.message));
    } catch (e) {
      setErr((e as Error).message);
    }
  }, [nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      nav({ to: "/admin" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-md mx-auto">
        <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4">Swāstha CMS</div>
        <h1 className="text-4xl font-serif mb-3">Welcome back</h1>
        <p className="text-ink/60 text-sm mb-10">Sign in to manage content.</p>

        <form onSubmit={onSubmit} className="bg-stone p-8 rounded-3xl space-y-5">
          <Field label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="name@domain.com"
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
            />
          </Field>

          {err && <p className="text-[12px] text-destructive">{err}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sage text-cream py-4 rounded-full text-xs font-medium uppercase tracking-[0.22em] hover:bg-ink transition-colors disabled:opacity-60"
          >
            {loading ? "Please wait…" : "Sign in"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-[11px] uppercase tracking-[0.22em] text-ink/40 hover:text-sage"
          >
            ← Back to site
          </Link>
        </div>
      </div>
    </section>
  );
}

const inputCls =
  "w-full bg-transparent border-b border-sage/20 py-2 text-sm focus:outline-none focus:border-sage transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-[0.22em] font-semibold text-sage">
        {label}
      </label>
      {children}
    </div>
  );
}
