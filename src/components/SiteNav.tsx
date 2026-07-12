import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/disease-prevention", label: "Prevention" },
  { to: "/treatment", label: "Treatment" },
  { to: "/diet-lifestyle", label: "Lifestyle" },
  { to: "/blog", label: "Blog" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-cream/80 backdrop-blur-md border-b border-sage/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="text-xl md:text-2xl font-serif font-semibold tracking-tight text-sage">
          Swāstha
        </Link>

        <div className="hidden md:flex gap-10 text-xs font-medium uppercase tracking-[0.18em]">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-ink/70 hover:text-gold transition-colors"
              activeProps={{ className: "text-gold" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden md:inline-flex text-[11px] font-medium uppercase tracking-[0.18em] text-ink/60 hover:text-sage transition-colors"
          >
            Studio
          </Link>
          <Link
            to="/contact"
            className="hidden sm:inline-flex bg-sage text-cream px-5 py-2.5 rounded-full text-[11px] font-medium uppercase tracking-[0.18em] hover:bg-ink transition-colors"
          >
            Consult Us
          </Link>
          <button
            className="md:hidden p-2 text-sage"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-sage/10 bg-cream">
          <div className="px-6 py-6 flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="text-sm font-medium uppercase tracking-[0.18em] text-ink/70 hover:text-gold"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex w-fit bg-sage text-cream px-5 py-2.5 rounded-full text-[11px] font-medium uppercase tracking-[0.18em]"
            >
              Consult Us
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}