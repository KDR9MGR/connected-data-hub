import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePageSection } from "@/lib/usePageContent";
import { MediaDisplay } from "@/components/MediaDisplay";

export const Route = createFileRoute("/diet-lifestyle")({
  head: () => ({
    meta: [
      { title: "Diet & Lifestyle — Araya Veda" },
      {
        name: "description",
        content:
          "Constitution-specific Ayurvedic diet plans and daily routines (Dinacharya) designed for real, modern lives.",
      },
      { property: "og:title", content: "Diet & Lifestyle — Araya Veda" },
      {
        property: "og:description",
        content: "Dosha-aligned nutrition and routine for sustainable wellness.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { content: hero } = usePageSection("diet-lifestyle", "hero");
  const { data: items } = useQuery({
    queryKey: ["treatment_items", "diet-lifestyle"],
    queryFn: async () => {
      const { data } = await supabase
        .from("treatment_items")
        .select("*")
        .eq("is_published", true)
        .contains("pages", ["diet-lifestyle"])
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
            alt="Mindful meditation practice"
            loading="lazy"
            width={1024}
            height={1024}
            className="w-full aspect-square object-cover rounded-2xl"
          />
        )}
      </section>

      <section className="px-6 max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
        {items?.map((c) => (
          <div key={c.id} className="p-8 bg-stone rounded-2xl">
            {c.media_url && (
              <MediaDisplay
                url={c.media_url}
                alt={c.title}
                className="w-full rounded-xl object-cover mb-4 aspect-video"
              />
            )}
            <h3 className="text-xl font-serif mb-3">{c.title}</h3>
            <p className="text-sm text-ink/65 leading-relaxed">{c.description}</p>
          </div>
        ))}
      </section>

      <div className="mt-16 text-center">
        <Link
          to="/contact"
          className="inline-flex bg-sage text-cream px-8 py-4 rounded-full text-[11px] font-medium uppercase tracking-[0.22em] hover:bg-ink transition-colors"
        >
          {hero.cta_label}
        </Link>
      </div>
    </article>
  );
}
