import { Leaf } from "lucide-react";

/** Product photo with a calm placeholder for products that have no image yet. */
export function ProductImage({
  src,
  alt,
  className = "",
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-stone text-sage/30 ${className}`}
      >
        <Leaf size={40} strokeWidth={1.25} />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />;
}
