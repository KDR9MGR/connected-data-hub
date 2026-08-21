import { Link } from "@tanstack/react-router";
import { usePageSection } from "@/lib/usePageContent";

export function SiteFooter() {
  const { content: footer } = usePageSection("global", "footer");
  const { content: contact } = usePageSection("global", "contact");
  const badges: string[] = footer.badges ?? [];

  return (
    <footer className="border-t border-sage/10 bg-cream">
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2 space-y-4">
          <div className="text-2xl font-serif font-semibold text-sage">Swāstha</div>
          <p className="text-sm text-ink/60 max-w-sm">{footer.tagline}</p>
          <div className="flex gap-2 pt-2">
            {badges.map((b) => (
              <span
                key={b}
                className="text-[10px] px-2.5 py-1 rounded-full border border-sage/15 text-sage/70 uppercase tracking-[0.18em]"
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-sage/60 mb-4">Care</div>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/disease-prevention" className="hover:text-gold">
                Disease Prevention
              </Link>
            </li>
            <li>
              <Link to="/treatment" className="hover:text-gold">
                Treatment
              </Link>
            </li>
            <li>
              <Link to="/diet-lifestyle" className="hover:text-gold">
                Diet & Lifestyle
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-gold">
                Blog
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-sage/60 mb-4">Reach Us</div>
          <ul className="space-y-3 text-sm">
            <li className="text-ink/70">{contact.email}</li>
            <li className="text-ink/70">{contact.phone_display}</li>
            <li>
              <Link to="/contact" className="hover:text-gold">
                Contact form
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sage/10">
        <div className="max-w-7xl mx-auto px-6 py-6 text-[10px] uppercase tracking-[0.3em] text-sage/40 text-center">
          © {new Date().getFullYear()} Swāstha · {footer.copyright_tagline}
        </div>
      </div>
    </footer>
  );
}
