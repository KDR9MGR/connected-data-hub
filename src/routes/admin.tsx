import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BlogAdmin } from "@/components/admin/BlogAdmin";
import { TestimonialAdmin } from "@/components/admin/TestimonialAdmin";
import { PortfolioAdmin } from "@/components/admin/PortfolioAdmin";
import { PricingAdmin } from "@/components/admin/PricingAdmin";
import { SubmissionsAdmin } from "@/components/admin/SubmissionsAdmin";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { PageContentAdmin } from "@/components/admin/PageContentAdmin";
import { PAGE_LABELS } from "@/lib/pageContentSchema";

export const Route = createFileRoute("/admin")({ component: AdminPage });

type Destination =
  | { group: "pages"; page: string }
  | { group: "collections"; id: "blog" | "testimonials" | "portfolio" | "pricing" }
  | { group: "media" }
  | { group: "settings" }
  | { group: "submissions" };

function destKey(d: Destination) {
  if (d.group === "pages") return `pages:${d.page}`;
  if (d.group === "collections") return `collections:${d.id}`;
  return d.group;
}

function AdminPage() {
  const { user, roles, loading, isEditor, isBlogger } = useAuth();
  const nav = useNavigate();
  const [active, setActive] = useState<Destination>({ group: "pages", page: "home" });

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

  const pageDests: Destination[] = ["home", "treatment", "diet-lifestyle", "disease-prevention", "blog"].map((page) => ({ group: "pages", page }));
  const collectionDests: { id: "blog" | "testimonials" | "portfolio" | "pricing"; label: string; show: boolean }[] = [
    { id: "blog", label: "Blog Posts", show: isEditor || isBlogger },
    { id: "testimonials", label: "Testimonials", show: isEditor },
    { id: "portfolio", label: "Portfolio", show: isEditor },
    { id: "pricing", label: "Pricing Plans", show: isEditor },
  ];

  const NavGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
      <div className="text-[10px] uppercase tracking-[0.22em] text-ink/40 mb-2 px-3">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );

  const NavItem = ({ dest, label }: { dest: Destination; label: string }) => (
    <button
      onClick={() => setActive(dest)}
      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${
        destKey(active) === destKey(dest) ? "bg-sage text-cream" : "text-ink/70 hover:bg-sage/8"
      }`}
    >
      {label}
    </button>
  );

  return (
    <section className="pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-3">CMS</div>
            <h1 className="text-4xl md:text-5xl font-serif">Site Content</h1>
            <p className="text-ink/60 text-sm mt-2">
              Signed in as {user.email} · {roles.join(", ") || "no role"}
            </p>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => nav({ to: "/login" }))}
            className="text-[11px] uppercase tracking-[0.22em] text-ink/60 border-b border-ink/20 hover:text-sage hover:border-sage pb-0.5">
            Sign out
          </button>
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-8">
          <nav className="md:sticky md:top-24 self-start">
            {(isEditor || isBlogger) && (
              <NavGroup title="Pages">
                {pageDests.map((d) => d.group === "pages" && <NavItem key={d.page} dest={d} label={PAGE_LABELS[d.page]} />)}
              </NavGroup>
            )}
            <NavGroup title="Collections">
              {collectionDests.filter((c) => c.show).map((c) => (
                <NavItem key={c.id} dest={{ group: "collections", id: c.id }} label={c.label} />
              ))}
            </NavGroup>
            {(isEditor || isBlogger) && (
              <NavGroup title="Library">
                <NavItem dest={{ group: "media" }} label="Media" />
              </NavGroup>
            )}
            {isEditor && (
              <NavGroup title="System">
                <NavItem dest={{ group: "settings" }} label="Global Settings" />
                <NavItem dest={{ group: "submissions" }} label="Submissions" />
              </NavGroup>
            )}
          </nav>

          <div className="min-w-0">
            {active.group === "pages" && (isEditor || isBlogger) && <PageContentAdmin page={active.page} userId={user.id} />}
            {active.group === "collections" && active.id === "blog" && (isEditor || isBlogger) && <BlogAdmin userId={user.id} isEditor={isEditor} />}
            {active.group === "collections" && active.id === "testimonials" && isEditor && <TestimonialAdmin userId={user.id} />}
            {active.group === "collections" && active.id === "portfolio" && isEditor && <PortfolioAdmin userId={user.id} />}
            {active.group === "collections" && active.id === "pricing" && isEditor && <PricingAdmin />}
            {active.group === "media" && (isEditor || isBlogger) && <MediaLibrary userId={user.id} />}
            {active.group === "settings" && isEditor && <PageContentAdmin page="global" userId={user.id} />}
            {active.group === "submissions" && isEditor && <SubmissionsAdmin />}
          </div>
        </div>
      </div>
    </section>
  );
}
