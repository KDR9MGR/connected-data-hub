const WA_URL = "https://wa.me/442079460123?text=Hello%20Araya%20Veda%2C%20I%27d%20like%20to%20book%20a%20consultation.";

export function ConsultWhatsapp({ variant = "default" }: { variant?: "default" | "tile" }) {
  if (variant === "tile") {
    return (
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-sage text-cream rounded-2xl p-8 hover:bg-ink transition-colors"
      >
        <div className="text-[10px] uppercase tracking-[0.22em] text-cream/60 mb-3">Immediate consult</div>
        <div className="text-2xl font-serif mb-3">Message us on WhatsApp</div>
        <p className="text-sm text-cream/70 max-w-xs mb-6">
          Speak directly with our lead coordinator for clinical availability and travel logistics.
        </p>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-medium border-b border-gold/60 pb-0.5">
          Open chat →
        </span>
      </a>
    );
  }
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-sage text-cream px-6 py-3 rounded-full text-xs font-medium uppercase tracking-[0.18em] hover:bg-ink transition-colors"
    >
      Consult on WhatsApp
    </a>
  );
}

export { WA_URL };