import logoFull from "@/assets/brand/swastha-logo.png";
import logoIcon from "@/assets/brand/swastha-icon.png";

/**
 * Swastha brand marks.
 *  - "icon": pomegranate mark only (tight spaces: navbar, mobile, avatars)
 *  - "full": pomegranate + SWASTHA wordmark (footer, hero, anywhere the brand stands alone)
 */
export function BrandLogo({
  variant = "full",
  className = "",
  decorative = false,
}: {
  variant?: "icon" | "full";
  className?: string;
  /** Use when the brand name is already written next to the mark (empty alt). */
  decorative?: boolean;
}) {
  const isIcon = variant === "icon";
  return (
    <img
      src={isIcon ? logoIcon : logoFull}
      alt={decorative ? "" : isIcon ? "Swastha" : "Swastha — Ayurveda clinic"}
      width={isIcon ? 512 : 900}
      height={isIcon ? 512 : 681}
      decoding="async"
      className={className}
    />
  );
}
