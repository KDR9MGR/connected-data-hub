import { createFileRoute, Link } from "@tanstack/react-router";
import portfolioPanchakarma from "@/assets/portfolio-panchakarma.jpg";

export const Route = createFileRoute("/treatment")({
  head: () => ({
    meta: [
      { title: "Treatment — Araya Veda" },
      { name: "description", content: "Authentic Ayurvedic treatments: Panchakarma, Rasayana rejuvenation and protocols for chronic and autoimmune conditions." },
      { property: "og:title", content: "Treatment — Araya Veda" },
      { property: "og:description", content: "Indexed clinical treatments for serious recovery." },
    ],
  }),
  component: Page,
});

const TREATMENTS = [
  { n: "01", t: "Panchakarma Detoxification", d: "Fivefold purification therapy to eliminate deep metabolic toxins and restore cellular intelligence." },
  { n: "02", t: "Rasayana Rejuvenation", d: "Immune-boosting protocols using rare herbs to halt degenerative processes and enhance longevity." },
  { n: "03", t: "Shirodhara & Nervous System Care", d: "Continuous warm-oil therapies for anxiety, insomnia and burnout recovery." },
  { n: "04", t: "Joint & Autoimmune Programmes", d: "Targeted internal and external care for rheumatoid arthritis, psoriasis and thyroid imbalance." },
  { n: "05", t: "Digestive Restoration", d: "IBS, acidity and gut microbiome rebuilding through Agni-led protocols." },
  { n: "06", t: "Post-illness Recovery", d: "Structured recovery from long-COVID, chemotherapy and chronic fatigue states." },
];

function Page() {
  return (
    <article className="pt-32 md:pt-40 pb-24">
      <section className="px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center mb-24">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4 block">Treatment</span>
          <h1 className="text-5xl md:text-7xl font-serif font-light leading-[1.05] mb-8">
            Indexed clinical <br /><span className="italic">protocols</span>
          </h1>
          <p className="text-lg text-ink/70 max-w-md leading-relaxed">
            Our treatments are not packages — they are sequenced, evidence-led plans built around your diagnostic profile.
          </p>
        </div>
        <img src={portfolioPanchakarma} alt="Ayurvedic Shirodhara treatment" loading="lazy" width={1024} height={1024} className="w-full aspect-square object-cover rounded-2xl" />
      </section>

      <section className="px-6 max-w-7xl mx-auto">
        <div className="divide-y divide-sage/10 border-y border-sage/10">
          {TREATMENTS.map((t) => (
            <div key={t.n} className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
              <div className="flex items-start gap-8 md:gap-16">
                <span className="text-sm font-mono text-sage/50">{t.n}</span>
                <h3 className="text-2xl font-serif group-hover:text-gold transition-colors">{t.t}</h3>
              </div>
              <p className="md:max-w-md text-sm text-ink/65 leading-relaxed">{t.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link to="/contact" className="inline-flex bg-sage text-cream px-8 py-4 rounded-full text-[11px] font-medium uppercase tracking-[0.22em] hover:bg-ink transition-colors">
            Request Treatment Plan
          </Link>
        </div>
      </section>
    </article>
  );
}