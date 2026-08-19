import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePageSection } from "@/lib/usePageContent";
import { MediaDisplay } from "@/components/MediaDisplay";

export const Route = createFileRoute("/disease-prevention")({
  head: () => ({
    meta: [
      { title: "Disease Prevention — Araya Veda" },
      { name: "description", content: "Proactive Ayurvedic prevention: immunity, metabolic alignment and seasonal protocols designed to stop disease before it starts." },
      { property: "og:title", content: "Disease Prevention — Araya Veda" },
      { property: "og:description", content: "Ayurvedic prevention programmes tailored to your constitution and environment." },
    ],
  }),
  component: Page,
});

function Page() {
  const { content: hero } = usePageSection("disease-prevention", "hero");
  const { data: items } = useQuery({
    queryKey: ["treatment_items", "disease-prevention"],
    queryFn: async () => {
      const { data } = await supabase
        .from("treatment_items")
        .select("*")
        .eq("is_published", true)
        .contains("pages", ["disease-prevention"])
        .order("sort_order");
      return data ?? [];
    },
  });

  return (
    <article className="pt-32 md:pt-40 pb-24">
      <section className="px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center mb-24">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4 block">{hero.kicker}</span>
          <h1 className="text-5xl md:text-7xl font-serif font-light leading-[1.05] mb-8">
            {hero.heading_line1} <br /><span className="italic">{hero.heading_highlight}</span>
          </h1>
          <p className="text-lg text-ink/70 max-w-md leading-relaxed">{hero.body}</p>
        </div>
        {hero.image && (
          <img src={hero.image} alt="Ayurvedic prevention herbs" loading="lazy" width={1024} height={1024} className="w-full aspect-square object-cover rounded-2xl" />
        )}
      </section>

      <section className="px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-10 border-t border-sage/10">
          {items?.map((p, i) => (
            <div key={p.id} className="pt-8 pb-8 border-b border-sage/10">
              <div className="flex items-baseline gap-6">
                <span className="text-[10px] font-mono text-sage/50">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-2xl font-serif mb-2">{p.title}</h3>
                  <p className="text-ink/65 leading-relaxed">{p.description}</p>
                  {p.media_url && <MediaDisplay url={p.media_url} alt={p.title} className="w-full max-w-sm rounded-xl object-cover mt-3" />}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link to="/contact" className="inline-flex bg-sage text-cream px-8 py-4 rounded-full text-[11px] font-medium uppercase tracking-[0.22em] hover:bg-ink transition-colors">
            {hero.cta_label}
          </Link>
        </div>
      </section>
    </article>
  );
}
