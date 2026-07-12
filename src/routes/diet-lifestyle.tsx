import { createFileRoute, Link } from "@tanstack/react-router";
import portfolioMeditation from "@/assets/portfolio-meditation.jpg";

export const Route = createFileRoute("/diet-lifestyle")({
  head: () => ({
    meta: [
      { title: "Diet & Lifestyle — Araya Veda" },
      { name: "description", content: "Constitution-specific Ayurvedic diet plans and daily routines (Dinacharya) designed for real, modern lives." },
      { property: "og:title", content: "Diet & Lifestyle — Araya Veda" },
      { property: "og:description", content: "Dosha-aligned nutrition and routine for sustainable wellness." },
    ],
  }),
  component: Page,
});

const CARDS = [
  { t: "Dosha-Aligned Nutrition", d: "Meal frameworks built to your constitution, climate, and weekly schedule." },
  { t: "Daily Routine (Dinacharya)", d: "Sleep, movement, breath, and meal timing that compound over months." },
  { t: "Seasonal Rituals (Ritucharya)", d: "Quarterly shifts in diet and herbs to match your environment." },
  { t: "Mindful Movement", d: "Yoga, pranayama and walking practices integrated into work-day reality." },
  { t: "Travel & Work Protocols", d: "Plans designed for frequent travellers, founders and shift workers." },
  { t: "Family & Children", d: "Gentle constitutional guidance for childhood immunity and family kitchens." },
];

function Page() {
  return (
    <article className="pt-32 md:pt-40 pb-24">
      <section className="px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center mb-24">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4 block">Diet & Lifestyle</span>
          <h1 className="text-5xl md:text-7xl font-serif font-light leading-[1.05] mb-8">
            A life that <br /><span className="italic">heals you back</span>
          </h1>
          <p className="text-lg text-ink/70 max-w-md leading-relaxed">
            Ayurveda treats lifestyle as medicine. Our plans are practical, beautiful, and built to survive real weeks.
          </p>
        </div>
        <img src={portfolioMeditation} alt="Mindful meditation practice" loading="lazy" width={1024} height={1024} className="w-full aspect-square object-cover rounded-2xl" />
      </section>

      <section className="px-6 max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
        {CARDS.map((c) => (
          <div key={c.t} className="p-8 bg-stone rounded-2xl">
            <h3 className="text-xl font-serif mb-3">{c.t}</h3>
            <p className="text-sm text-ink/65 leading-relaxed">{c.d}</p>
          </div>
        ))}
      </section>

      <div className="mt-16 text-center">
        <Link to="/contact" className="inline-flex bg-sage text-cream px-8 py-4 rounded-full text-[11px] font-medium uppercase tracking-[0.22em] hover:bg-ink transition-colors">
          Design My Lifestyle Plan
        </Link>
      </div>
    </article>
  );
}