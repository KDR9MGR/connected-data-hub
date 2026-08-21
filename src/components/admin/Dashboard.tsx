import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Counts = {
  blogPublished: number;
  blogDrafts: number;
  testimonials: number;
  portfolio: number;
  pricing: number;
  treatmentItems: number;
  unreadInquiries: number;
};

// Table name and filter shape vary per call site, so this stays untyped rather than
// fighting PostgREST's generic query builder types for a handful of read-only counts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function count(table: string, filter?: (q: any) => any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase.from as any)(table).select("*", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count: c } = await q;
  return c ?? 0;
}

export function Dashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    (async () => {
      const [
        blogPublished,
        blogDrafts,
        testimonials,
        portfolio,
        pricing,
        treatmentItems,
        unreadInquiries,
      ] = await Promise.all([
        count("blog_posts", (q) => q.eq("status", "published")),
        count("blog_posts", (q) => q.eq("status", "draft")),
        count("testimonials"),
        count("portfolio_items"),
        count("pricing_plans"),
        count("treatment_items"),
        count("contact_submissions", (q) => q.eq("is_read", false)),
      ]);
      setCounts({
        blogPublished,
        blogDrafts,
        testimonials,
        portfolio,
        pricing,
        treatmentItems,
        unreadInquiries,
      });
    })();
  }, []);

  const tiles = counts
    ? [
        { label: "Published Posts", value: counts.blogPublished },
        { label: "Draft Posts", value: counts.blogDrafts },
        { label: "Testimonials", value: counts.testimonials },
        { label: "Portfolio Items", value: counts.portfolio },
        { label: "Pricing Plans", value: counts.pricing },
        { label: "Treatment Items", value: counts.treatmentItems },
        {
          label: "Unread Inquiries",
          value: counts.unreadInquiries,
          highlight: counts.unreadInquiries > 0,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {!counts && <p className="text-ink/50 text-sm">Loading…</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {tiles.map((t) => (
          <div
            key={t.label}
            className={`p-6 rounded-2xl border ${t.highlight ? "border-gold/40 bg-gold/5" : "border-sage/10 bg-stone"}`}
          >
            <div className={`text-3xl font-serif mb-1 ${t.highlight ? "text-gold" : "text-sage"}`}>
              {t.value}
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink/60">{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
