import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePageSection } from "@/lib/usePageContent";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Journal — Araya Veda" },
      { name: "description", content: "Clinical notes, case studies and essays on Ayurvedic medicine, prevention and lifestyle from the Araya Veda team." },
      { property: "og:title", content: "Journal — Araya Veda" },
      { property: "og:description", content: "Essays and clinical case studies from our Ayurvedic team." },
    ],
  }),
  component: Page,
});

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function Page() {
  const { content: hero } = usePageSection("blog", "hero");
  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog_posts_published"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <article className="pt-32 md:pt-40 pb-24 px-6">
      <section className="max-w-7xl mx-auto mb-16">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4 block">{hero.kicker}</span>
        <h1 className="text-5xl md:text-7xl font-serif font-light leading-[1.05] max-w-3xl">
          {hero.heading_line1} <span className="italic">{hero.heading_highlight}</span>
        </h1>
      </section>

      <section className="max-w-7xl mx-auto">
        <div className="divide-y divide-sage/10 border-y border-sage/10">
          {posts?.map((p) => (
            <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="block py-8 group">
              <div className="grid md:grid-cols-12 gap-6 items-baseline">
                <div className="md:col-span-2 text-[10px] uppercase tracking-[0.22em] text-sage/70">{formatDate(p.published_at)}</div>
                <div className="md:col-span-2 text-[10px] uppercase tracking-[0.22em] text-gold">{p.category}</div>
                <h3 className="md:col-span-6 text-2xl md:text-3xl font-serif group-hover:text-gold transition-colors">{p.title}</h3>
                <div className="md:col-span-2 md:text-right text-xs text-ink/50">{p.read_time}</div>
              </div>
            </Link>
          ))}
        </div>
        {!isLoading && posts?.length === 0 && (
          <div className="text-center text-ink/50 py-24 text-sm">No posts published yet — check back soon.</div>
        )}
      </section>
    </article>
  );
}
