import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ProductImage } from "@/components/shop/ProductImage";
import { OrderDialog } from "@/components/shop/OrderDialog";
import { discountPercent, formatPrice, type Product } from "@/lib/shop";

export function PriceTag({ product, large = false }: { product: Product; large?: boolean }) {
  const off = discountPercent(Number(product.price), product.compare_at_price);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
      <span className={`${large ? "text-3xl" : "text-lg"} font-serif text-ink`}>
        {formatPrice(Number(product.price))}
      </span>
      {product.compare_at_price && off !== null && (
        <>
          <span className="text-sm text-ink/40 line-through">
            {formatPrice(Number(product.compare_at_price))}
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-gold">{off}% off</span>
        </>
      )}
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const [ordering, setOrdering] = useState(false);

  return (
    <article className="group flex flex-col">
      <Link
        to="/shop/$slug"
        params={{ slug: product.slug }}
        className="relative block overflow-hidden rounded-2xl bg-stone"
        aria-label={product.name}
      >
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          className="w-full aspect-square transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {!product.in_stock && (
          <span className="absolute top-3 left-3 bg-ink text-cream text-[10px] uppercase tracking-[0.18em] px-3 py-1 rounded-full">
            Sold out
          </span>
        )}
        {product.is_featured && product.in_stock && (
          <span className="absolute top-3 left-3 bg-gold text-cream text-[10px] uppercase tracking-[0.18em] px-3 py-1 rounded-full">
            Featured
          </span>
        )}
      </Link>

      <div className="pt-4 flex-1 flex flex-col gap-1.5">
        {product.category && (
          <div className="text-[10px] uppercase tracking-[0.22em] text-sage/60">
            {product.category}
          </div>
        )}
        <h3 className="text-xl font-serif leading-snug">
          <Link
            to="/shop/$slug"
            params={{ slug: product.slug }}
            className="hover:text-gold transition-colors"
          >
            {product.name}
          </Link>
        </h3>
        {product.size_label && <div className="text-xs text-ink/50">{product.size_label}</div>}
        {product.short_description && (
          <p className="text-sm text-ink/60 line-clamp-2">{product.short_description}</p>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between gap-3">
          <PriceTag product={product} />
          <button
            type="button"
            disabled={!product.in_stock}
            onClick={() => setOrdering(true)}
            className="bg-sage text-cream px-5 py-2.5 rounded-full text-[11px] font-medium uppercase tracking-[0.18em] hover:bg-ink transition-colors disabled:bg-ink/20 disabled:cursor-not-allowed"
          >
            {product.in_stock ? "Buy now" : "Sold out"}
          </button>
        </div>
      </div>

      {ordering && <OrderDialog product={product} open={ordering} onOpenChange={setOrdering} />}
    </article>
  );
}
