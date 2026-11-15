import { usePageSection } from "@/lib/usePageContent";

export const CONTACT_EMAIL = "info@swastha.org.in";

function buildMailto(email: string) {
  const subject = encodeURIComponent("Consultation enquiry");
  const body = encodeURIComponent("Hello Swāstha, I'd like to book a consultation.");
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

export function useContactEmail() {
  const { content } = usePageSection("global", "contact");
  return (content.email as string) || CONTACT_EMAIL;
}

export function useMailto() {
  return buildMailto(useContactEmail());
}

export function ConsultEmail({ variant = "default" }: { variant?: "default" | "tile" }) {
  const email = useContactEmail();
  const href = buildMailto(email);

  if (variant === "tile") {
    return (
      <a
        href={href}
        className="block bg-sage text-cream rounded-2xl p-8 hover:bg-ink transition-colors"
      >
        <div className="text-[10px] uppercase tracking-[0.22em] text-cream/60 mb-3">
          Write to us
        </div>
        <div className="text-2xl font-serif mb-3">Email our clinical team</div>
        <p className="text-sm text-cream/70 max-w-xs mb-6">
          Share your concern in a few lines and a member of the team will reply within one working
          day.
        </p>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-medium border-b border-gold/60 pb-0.5 break-all">
          {email} →
        </span>
      </a>
    );
  }
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 bg-sage text-cream px-6 py-3 rounded-full text-xs font-medium uppercase tracking-[0.18em] hover:bg-ink transition-colors"
    >
      Email us
    </a>
  );
}
