import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContactForm } from "@/components/ContactForm";
import { ConsultWhatsapp, useWaUrl } from "@/components/ConsultWhatsapp";
import { usePageSection } from "@/lib/usePageContent";
import { useState, useEffect } from "react";
import { Play } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Araya Veda — Clinical Ayurveda for the Modern Soul" },
      { name: "description", content: "Personalised Ayurvedic prevention, treatment and lifestyle protocols. NDA-protected English-speaking team, 15+ years of clinical practice." },
      { property: "og:title", content: "Araya Veda — Clinical Ayurveda" },
      { property: "og:description", content: "Holistic disease prevention, treatment and diet & lifestyle care, delivered with discretion." },
      { property: "og:image", content: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=ayurveda%20wellness%20clinic%20hero%20banner%2C%20warm%20earth%20tones%2C%20herbs%2C%20zen%20stones%2C%20lotus%20flower%2C%20gold%20accents%2C%20professional%20healthcare&image_size=landscape_16_9" },
    ],
  }),
  component: Home,
});

type PortfolioItem = { id: string; category: string; title: string; description: string | null; image_url: string | null };
type PricingPlan = { id: string; name: string; price_label: string; description: string | null; features: string[]; is_featured: boolean };
type Testimonial = { id: string; author_name: string; author_location: string | null; quote: string; media_type: string; media_url: string | null };

function Home() {
  return (
    <>
      <Hero />
      <Numbers />
      <Portfolio />
      <Pricing />
      <WhyUs />
      <Testimonials />
      <Contact />
    </>
  );
}

function Hero() {
  const { content: hero } = usePageSection("home", "hero");
  const slides: string[] = hero.slideshow_images?.length ? hero.slideshow_images : [];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 3500);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <header className="min-h-screen pt-24 md:pt-28 pb-10 px-6 flex items-center">
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-10 md:gap-14 items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-sage bg-sage/8 border border-sage/15 rounded-full px-3 py-1.5 mb-5">
            <span className="size-1.5 rounded-full bg-gold animate-pulse" /> {hero.badge}
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-light leading-[1.05] mb-5">
            {hero.heading_line1} <span className="italic text-gold">{hero.heading_highlight}</span> {hero.heading_line2}
          </h1>
          <p className="text-base md:text-lg text-ink/70 max-w-md mb-7 leading-relaxed">{hero.subtext}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/treatment"
              className="px-6 py-3.5 bg-sage text-cream rounded-full text-xs font-medium uppercase tracking-[0.18em] hover:bg-ink transition-colors"
            >
              {hero.cta_label} ↗
            </Link>
            <ConsultWhatsapp />
          </div>
        </div>
        {slides.length > 0 && (
          <div className="relative">
            <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden outline outline-1 -outline-offset-1 outline-black/5 bg-stone">
              {slides.map((s, i) => (
                <img
                  key={s}
                  src={s}
                  alt="Swāstha clinic"
                  loading={i === 0 ? "eager" : "lazy"}
                  className={
                    "absolute inset-0 w-full h-full object-cover transition-opacity duration-700 " +
                    (i === idx ? "opacity-100" : "opacity-0")
                  }
                />
              ))}
              <div className="absolute inset-x-0 bottom-0 p-4 flex items-center justify-between bg-gradient-to-t from-ink/40 to-transparent">
                <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-cream/90">
                  Inside the clinic
                </span>
                <div className="flex gap-1.5">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      aria-label={`Slide ${i + 1}`}
                      onClick={() => setIdx(i)}
                      className={
                        "h-1 rounded-full transition-all " +
                        (i === idx ? "w-6 bg-cream" : "w-1.5 bg-cream/50 hover:bg-cream/80")
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function Numbers() {
  const { content } = usePageSection("home", "numbers");
  const items: { value: string; label: string }[] = content.stats ?? [];
  const cards: { title: string; body: string }[] = content.philosophy_cards ?? [];

  return (
    <section className="bg-stone py-20 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 border-b border-sage/15 pb-14 md:pb-16">
          {items.map((i) => (
            <div key={i.label} className="space-y-2">
              <div className="text-3xl md:text-4xl font-serif text-sage">{i.value}</div>
              <div className="text-[10px] md:text-xs uppercase tracking-[0.22em] font-semibold text-ink/80">{i.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-14 md:mt-16 flex flex-col md:flex-row justify-between items-start gap-10 md:gap-12">
          <div className="md:w-1/3">
            <h2 className="text-3xl font-serif mb-5">{content.philosophy_title}</h2>
            <p className="text-ink/70 leading-relaxed">{content.philosophy_body}</p>
          </div>
          <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cards.map((c) => (
              <PhilosophyCard key={c.title} title={c.title} body={c.body} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PhilosophyCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-6 bg-cream rounded-xl border border-sage/10">
      <h4 className="font-serif text-xl mb-2">{title}</h4>
      <p className="text-sm text-ink/60 leading-relaxed">{body}</p>
    </div>
  );
}

function Portfolio() {
  const [tab, setTab] = useState<"Diseases" | "Diet & Lifestyle">("Diseases");
  const { data: allItems } = useQuery({
    queryKey: ["portfolio_items_published"],
    queryFn: async () => {
      const { data } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("is_published", true)
        .order("category")
        .order("sort_order");
      return (data as PortfolioItem[]) ?? [];
    },
  });
  const items = (allItems ?? []).filter((i) => i.category === tab);

  return (
    <section className="py-20 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif mb-2">Specialised Care</h2>
            <p className="text-ink/60">Clinical excellence across chronic and acute conditions.</p>
          </div>
          <div className="flex gap-3">
            <TabPill active={tab === "Diseases"} onClick={() => setTab("Diseases")}>Diseases</TabPill>
            <TabPill active={tab === "Diet & Lifestyle"} onClick={() => setTab("Diet & Lifestyle")}>Diet & Lifestyle</TabPill>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((it) => (
            <article key={it.id} className="group">
              <div className="relative overflow-hidden rounded-2xl mb-6 aspect-square">
                {it.image_url && (
                  <img
                    src={it.image_url}
                    alt={it.title}
                    loading="lazy"
                    width={800}
                    height={800}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-700 ease-out"
                  />
                )}
              </div>
              <h3 className="text-xl font-serif mb-1">{it.title}</h3>
              <p className="text-[10px] uppercase tracking-[0.22em] text-gold mb-2">{it.category}</p>
              <p className="text-sm text-ink/60 leading-relaxed">{it.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TabPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-4 py-2 rounded-full text-[10px] font-medium uppercase tracking-[0.22em] transition-colors " +
        (active ? "bg-sage text-cream" : "border border-sage/20 text-sage/60 hover:text-sage")
      }
    >
      {children}
    </button>
  );
}

function Pricing() {
  const { content } = usePageSection("home", "pricing");
  const { data: plans } = useQuery({
    queryKey: ["pricing_plans_published"],
    queryFn: async () => {
      const { data } = await supabase.from("pricing_plans").select("*").eq("is_published", true).order("sort_order");
      return (data as PricingPlan[]) ?? [];
    },
  });

  return (
    <section className="py-24 md:py-28 bg-sage text-cream px-6">
      <div className="max-w-3xl mx-auto text-center">
        <span className="text-[10px] uppercase tracking-[0.3em] text-cream/60 mb-6 block">{content.kicker}</span>
        <h2 className="text-4xl md:text-5xl font-serif mb-8">{content.heading}</h2>
        <p className="text-lg opacity-80 mb-10 leading-relaxed">{content.body}</p>
        <div className="h-px w-24 bg-gold mx-auto mb-10" />
        <div className="grid sm:grid-cols-3 gap-6 text-left">
          {plans?.map((p) => (
            <PriceTile key={p.id} kicker={p.price_label} title={p.name} detail={p.description ?? ""} highlight={p.is_featured} />
          ))}
        </div>
        <p className="mt-10 text-xs uppercase tracking-[0.22em] text-cream/60">{content.footnote}</p>
      </div>
    </section>
  );
}

function PriceTile({ kicker, title, detail, highlight }: { kicker: string; title: string; detail: string; highlight?: boolean }) {
  return (
    <div className={"p-6 rounded-2xl border " + (highlight ? "border-gold/40 bg-cream/5" : "border-cream/15")}>
      <div className="text-[10px] uppercase tracking-[0.22em] text-gold mb-3">{kicker}</div>
      <div className="font-serif text-2xl mb-2">{title}</div>
      <p className="text-sm text-cream/70 leading-relaxed">{detail}</p>
    </div>
  );
}

function WhyUs() {
  const { content } = usePageSection("home", "why_us");
  const items: { title: string; body: string }[] = content.items ?? [];

  return (
    <section className="py-20 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-14">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-3 block">{content.kicker}</span>
          <h2 className="text-4xl md:text-5xl font-serif">{content.heading} <span className="italic text-gold">{content.heading_highlight}</span></h2>
          <p className="mt-4 text-ink/65 leading-relaxed">{content.subheading}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-10 border-t border-sage/10">
          {items.map((i, idx) => (
            <div key={i.title} className="pt-8 border-b border-sage/10 pb-8 last:border-b-0">
              <div className="flex items-baseline gap-6">
                <span className="text-[10px] font-mono text-sage/50">0{idx + 1}</span>
                <div>
                  <h3 className="text-2xl font-serif mb-2">{i.title}</h3>
                  <p className="text-ink/65 leading-relaxed">{i.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const { content } = usePageSection("home", "testimonials");
  const waUrl = useWaUrl();
  const { data: items } = useQuery({
    queryKey: ["testimonials_published"],
    queryFn: async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_published", true)
        .order("sort_order")
        .order("created_at", { ascending: false });
      return (data as Testimonial[]) ?? [];
    },
  });

  return (
    <section className="py-20 md:py-24 px-6 bg-stone/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-3 block">{content.kicker}</span>
          <h2 className="text-4xl md:text-5xl font-serif">{content.heading}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items?.map((t) => (
            <div key={t.id} className="space-y-4">
              {t.media_url && (
                t.media_type === "video" ? (
                  <a href={waUrl} target="_blank" rel="noopener noreferrer" className="relative block rounded-2xl overflow-hidden aspect-video group">
                    <img src={t.media_url} alt={`${t.author_name} testimonial`} loading="lazy" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-ink/15 group-hover:bg-ink/25 transition-colors" />
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="size-14 rounded-full bg-cream flex items-center justify-center shadow-lg">
                        <Play size={20} className="text-sage ml-0.5" />
                      </div>
                    </div>
                  </a>
                ) : (
                  <img src={t.media_url} alt={`${t.author_name} testimonial`} loading="lazy" className="w-full aspect-[4/3] object-cover rounded-2xl" />
                )
              )}
              <p className="font-serif italic text-lg text-sage leading-snug">“{t.quote}”</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-ink/60">
                — {t.author_name}{t.author_location ? `, ${t.author_location}` : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const { content } = usePageSection("home", "contact");
  const { content: globalContact } = usePageSection("global", "contact");

  return (
    <section id="contact" className="py-20 md:py-24 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 md:gap-24">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4 block">{content.kicker}</span>
          <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-[1.05]">
            {content.heading_line1} <br /><span className="italic">{content.heading_highlight}</span>
          </h2>
          <p className="text-ink/65 mb-10 max-w-md leading-relaxed">{content.body}</p>
          <div className="space-y-5 mb-10">
            <ContactRow label="Email" value={globalContact.email} />
            <ContactRow label="WhatsApp" value={globalContact.phone_display} />
          </div>
          <ConsultWhatsapp variant="tile" />
        </div>
        <ContactForm />
      </div>
    </section>
  );
}

function ContactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="size-10 rounded-full bg-sage/8 flex items-center justify-center text-sage font-serif">
        {label[0]}
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-sage/70">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
