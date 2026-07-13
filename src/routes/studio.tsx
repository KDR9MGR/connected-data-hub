import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BlogAdmin } from "@/components/admin/BlogAdmin";
import { TestimonialAdmin } from "@/components/admin/TestimonialAdmin";
import { PortfolioAdmin } from "@/components/admin/PortfolioAdmin";
import { PricingAdmin } from "@/components/admin/PricingAdmin";
import { SubmissionsAdmin } from "@/components/admin/SubmissionsAdmin";
import { MediaAdmin } from "@/components/admin/MediaAdmin";
import { SettingsAdmin } from "@/components/admin/SettingsAdmin";
import { UsersAdmin } from "@/components/admin/UsersAdmin";

export const Route = createFileRoute("/studio")({ component: AdminPage });

type Tab = "blog" | "testimonials" | "portfolio" | "pricing" | "submissions" | "media" | "settings" | "users";

function AdminPage() {
  const { user, roles, loading, isEditor, isBlogger, isAdmin } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("blog");

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  if (loading || !user) {
    return <div className="pt-32 pb-24 px-6 text-center text-ink/60 text-sm">Loading…</div>;
  }

  if (roles.length === 0) {
    return (
      <div className="pt-32 pb-24 px-6 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-serif mb-3">No access yet</h1>
        <p className="text-ink/60 text-sm mb-6">Your account has no role assigned. Ask an editor to grant you access.</p>
        <button onClick={() => supabase.auth.signOut().then(() => nav({ to: "/login" }))} className="text-[11px] uppercase tracking-[0.22em] text-sage border-b border-sage/40 pb-0.5">Sign out</button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: "blog", label: "Blog", show: isEditor || isBlogger },
    { id: "testimonials", label: "Testimonials", show: isEditor },
    { id: "portfolio", label: "Portfolio", show: isEditor },
    { id: "pricing", label: "Pricing", show: isEditor },
    { id: "submissions", label: "Submissions", show: isEditor },
    { id: "media", label: "Media", show: isEditor },
    { id: "settings", label: "Settings", show: isEditor },
    { id: "users", label: "Users", show: isAdmin },
  ];
  const visible = tabs.filter((t) => t.show);

  return (
    <section className="pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-3">CMS</div>
            <h1 className="text-4xl md:text-5xl font-serif">Content Studio</h1>
            <p className="text-ink/60 text-sm mt-2">
              Signed in as {user.email} · {roles.join(", ") || "no role"}
            </p>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => nav({ to: "/login" }))}
            className="text-[11px] uppercase tracking-[0.22em] text-ink/60 border-b border-ink/20 hover:text-sage hover:border-sage pb-0.5">
            Sign out
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 border-b border-sage/10 pb-3">
          {visible.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.18em] transition ${tab === t.id ? "bg-sage text-cream" : "bg-transparent text-ink/60 hover:text-sage"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "blog" && <BlogAdmin userId={user.id} isEditor={isEditor} />}
        {tab === "testimonials" && isEditor && <TestimonialAdmin />}
        {tab === "portfolio" && isEditor && <PortfolioAdmin />}
        {tab === "pricing" && isEditor && <PricingAdmin />}
        {tab === "submissions" && isEditor && <SubmissionsAdmin />}
        {tab === "media" && isEditor && <MediaAdmin />}
        {tab === "settings" && isEditor && <SettingsAdmin />}
        {tab === "users" && isAdmin && <UsersAdmin currentUserId={user.id} />}
      </div>
    </section>
  );
}