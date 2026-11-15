import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ProductImage } from "@/components/shop/ProductImage";
import { OrderDialog } from "@/components/shop/OrderDialog";
import { PriceTag } from "@/components/shop/ProductCard";
import { absoluteUrl } from "@/lib/site";
import type { Product } from "@/lib/shop";

export const Route = createFileRoute("/shop/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("slug", params.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (!data) throw notFound();
    return { product: data as Product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const p = loaderData.product;
    const image = p.images[0];
    const description = p.short_description ?? p.description?.slice(0, 160) ?? "";
    return {
      meta: [
        { title: `${p.name} — Swastha` },
        { name: "description", content: description },
        { property: "og:title", content: `${p.name} — Swastha` },
        { property: "og:description", content: description },
        ...(image
          ? [
              {
                property: "og:image",
                content: image.startsWith("http") ? image : absoluteUrl(image),
              },
            ]
          : []),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="pt-40 pb-24 px-6 text-center">
      <h1 className="text-4xl font-serif mb-4">Product not found</h1>
      <p className="text-ink/60 mb-8">
        This product may have been removed or is no longer available.
      </p>
      <Link
        to="/shop"
        className="inline-flex bg-sage text-cream px-8 py-4 rounded-full text-[11px] font-medium uppercase tracking-[0.22em] hover:bg-ink transition-colors"
      >
        Back to the shop
      </Link>
    </div>
  ),
  component: Page,
});

function Page() {
  const { product } = Route.useLoaderData();
  const [active, setActive] = useState(0);
  const [ordering, setOrdering] = useState(false);

  const images = product.images;
  const paragraphs = (product.description ?? "").split(/\n{2,}/).filter(Boolean);

  return (
    <article className="pt-32 md:pt-40 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/shop" className="text-[10px] uppercase tracking-[0.3em] text-gold mb-8 block">
          ← Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="space-y-4">
            <ProductImage
              src={images[active]}
              alt={product.name}
              className="w-full aspect-square rounded-3xl"
            />
            {images.length > 1 && (
              <div className="flex flex-wrap gap-3">
                {images.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Show photo ${i + 1}`}
                    aria-pressed={i === active}
                    className={`size-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      i === active ? "border-sage" : "border-transparent hover:border-sage/40"
                    }`}
                  >
                    <ProductImage src={src} alt="" className="w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="md:sticky md:top-28 space-y-6">
            {product.category && (
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold">
                {product.category}
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-serif font-light leading-[1.1]">
              {product.name}
            </h1>
            {product.size_label && <div className="text-sm text-ink/50">{product.size_label}</div>}
            <PriceTag product={product} large />
            {product.short_description && (
              <p className="text-lg text-ink/70 leading-relaxed">{product.short_description}</p>
            )}

            <div className="pt-2 space-y-3">
              <button
                type="button"
                disabled={!product.in_stock}
                onClick={() => setOrdering(true)}
                className="w-full sm:w-auto bg-sage text-cream px-12 py-4 rounded-full text-[11px] font-medium uppercase tracking-[0.22em] hover:bg-ink transition-colors disabled:bg-ink/20 disabled:cursor-not-allowed"
              >
                {product.in_stock ? "Buy now" : "Currently out of stock"}
              </button>
              {!product.in_stock && (
                <p className="text-sm text-ink/60">
                  Want to be told when it is back?{" "}
                  <Link to="/contact" className="text-sage underline underline-offset-4">
                    Write to us
                  </Link>
                  .
                </p>
              )}
            </div>

            {paragraphs.length > 0 && (
              <div className="pt-6 border-t border-sage/10 space-y-4 text-ink/75 leading-relaxed">
                {paragraphs.map((para, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {para}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {ordering && <OrderDialog product={product} open={ordering} onOpenChange={setOrdering} />}
    </article>
  );
}
