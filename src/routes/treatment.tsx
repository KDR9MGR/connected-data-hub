import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePageSection } from "@/lib/usePageContent";
import { MediaDisplay } from "@/components/MediaDisplay";

export const Route = createFileRoute("/treatment")({
  head: () => ({
    meta: [
      { title: "Treatment — Araya Veda" },
      {
        name: "description",
        content:
          "Authentic Ayurvedic treatments: Panchakarma, Rasayana rejuvenation and protocols for chronic and autoimmune conditions.",
      },
      { property: "og:title", content: "Treatment — Araya Veda" },
      { property: "og:description", content: "Indexed clinical treatments for serious recovery." },
    ],
  }),
  component: Page,
});

function Page() {
  const { content: hero } = usePageSection("treatment", "hero");
  const { data: items } = useQuery({
    queryKey: ["treatment_items", "treatment"],
    queryFn: async () => {
      const { data } = await supabase
        .from("treatment_items")
        .select("*")
        .eq("is_published", true)
        .contains("pages", ["treatment"])
        .order("sort_order");
      return data ?? [];
    },
  });

  return (
    <article className="pt-32 md:pt-40 pb-24">
      <section className="px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center mb-24">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4 block">
            {hero.kicker}
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-light leading-[1.05] mb-8">
            {hero.heading_line1} <br />
            <span className="italic">{hero.heading_highlight}</span>
          </h1>
          <p className="text-lg text-ink/70 max-w-md leading-relaxed">{hero.body}</p>
        </div>
        {hero.image && (
          <img
            src={hero.image}
            alt="Ayurvedic Shirodhara treatment"
            loading="lazy"
            width={1024}
            height={1024}
            className="w-full aspect-square object-cover rounded-2xl"
          />
        )}
      </section>

      <section className="px-6 max-w-7xl mx-auto">
        <div className="divide-y divide-sage/10 border-y border-sage/10">
          {items?.map((t, i) => (
            <div
              key={t.id}
              className="py-8 flex flex-col md:flex-row md:items-start justify-between gap-4 group"
            >
              <div className="flex items-start gap-8 md:gap-16 md:w-1/2">
                <span className="text-sm font-mono text-sage/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-2xl font-serif group-hover:text-gold transition-colors mb-2">
                    {t.title}
                  </h3>
                  {t.media_url && (
                    <MediaDisplay
                      url={t.media_url}
                      alt={t.title}
                      className="w-full max-w-sm rounded-xl object-cover mt-3"
                    />
                  )}
                </div>
              </div>
              <p className="md:max-w-md text-sm text-ink/65 leading-relaxed">{t.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link
            to="/contact"
            className="inline-flex bg-sage text-cream px-8 py-4 rounded-full text-[11px] font-medium uppercase tracking-[0.22em] hover:bg-ink transition-colors"
          >
            {hero.cta_label}
          </Link>
        </div>
      </section>
    </article>
  );
}
