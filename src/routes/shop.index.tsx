import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePageSection } from "@/lib/usePageContent";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Product } from "@/lib/shop";

export const Route = createFileRoute("/shop/")({
  head: () => ({
    meta: [
      { title: "Shop — Swastha" },
      {
        name: "description",
        content:
          "Ayurvedic products from the Swastha clinical team. Order online and we confirm availability and delivery with you on WhatsApp or email.",
      },
      { property: "og:title", content: "Shop — Swastha" },
      {
        property: "og:description",
        content: "Ayurvedic products chosen and used by our clinical team.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { content: hero } = usePageSection("shop", "hero");
  const [category, setCategory] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });

  const categories = Array.from(
    new Set((products ?? []).map((p) => p.category).filter((c): c is string => !!c)),
  );
  const visible = (products ?? []).filter((p) => !category || p.category === category);

  return (
    <article className="pt-32 md:pt-40 pb-24">
      <section className="px-6 max-w-7xl mx-auto mb-14">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4 block">
          {hero.kicker}
        </span>
        <h1 className="text-5xl md:text-7xl font-serif font-light leading-[1.05] mb-6">
          {hero.heading_line1} <span className="italic">{hero.heading_highlight}</span>
        </h1>
        <p className="text-lg text-ink/70 max-w-xl leading-relaxed">{hero.body}</p>
      </section>

      <section className="px-6 max-w-7xl mx-auto">
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="Filter by category">
            {[null, ...categories].map((c) => (
              <button
                key={c ?? "all"}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.18em] transition-colors ${
                  category === c
                    ? "bg-sage text-cream"
                    : "bg-cream border border-sage/20 text-ink/60 hover:border-sage/50"
                }`}
              >
                {c ?? "All"}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="text-center text-ink/50 py-24 text-sm">Loading products…</div>
        ) : visible.length > 0 ? (
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center text-ink/50 py-24 border border-dashed border-sage/20 rounded-3xl text-sm">
            Our shop is being stocked. Please check back soon.
          </div>
        )}
      </section>
    </article>
  );
}
