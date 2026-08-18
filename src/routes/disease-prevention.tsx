import { createFileRoute, Link } from "@tanstack/react-router";
import portfolioHerbs from "@/assets/portfolio-herbs.jpg";

export const Route = createFileRoute("/disease-prevention")({
  head: () => ({
    meta: [
      { title: "Disease Prevention — Araya Veda" },
      { name: "description", content: "Proactive Ayurvedic prevention: immunity, metabolic alignment and seasonal protocols designed to stop disease before it starts." },
      { property: "og:title", content: "Disease Prevention — Araya Veda" },
      { property: "og:description", content: "Ayurvedic prevention programmes tailored to your constitution and environment." },
    ],
  }),
  component: Page,
});

const PILLARS = [
  { n: "01", t: "Constitutional Mapping", d: "A full prakriti assessment to identify the imbalances most likely to take root in your body." },
  { n: "02", t: "Immune Foundations", d: "Daily herbal regimens and breath practice to strengthen Ojas and defend against seasonal flux." },
  { n: "03", t: "Metabolic Alignment", d: "Targeted plans for Agni, blood sugar regulation and inflammation control." },
  { n: "04", t: "Seasonal Resets", d: "Quarterly cleansing rituals to clear accumulated toxins and recalibrate the nervous system." },
];

function Page() {
  return (
    <article className="pt-32 md:pt-40 pb-24">
      <section className="px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center mb-24">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4 block">Prevention</span>
          <h1 className="text-5xl md:text-7xl font-serif font-light leading-[1.05] mb-8">
            Stop disease <br /><span className="italic">before it begins</span>
          </h1>
          <p className="text-lg text-ink/70 max-w-md leading-relaxed">
            The deepest Ayurvedic medicine is the one you never need to take. Our
            prevention programmes identify imbalance years before pathology emerges.
          </p>
        </div>
        <img src={portfolioHerbs} alt="Ayurvedic prevention herbs" loading="lazy" width={1024} height={1024} className="w-full aspect-square object-cover rounded-2xl" />
      </section>

      <section className="px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-10 border-t border-sage/10">
          {PILLARS.map((p) => (
            <div key={p.n} className="pt-8 pb-8 border-b border-sage/10">
              <div className="flex items-baseline gap-6">
                <span className="text-[10px] font-mono text-sage/50">{p.n}</span>
                <div>
                  <h3 className="text-2xl font-serif mb-2">{p.t}</h3>
                  <p className="text-ink/65 leading-relaxed">{p.d}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link to="/contact" className="inline-flex bg-sage text-cream px-8 py-4 rounded-full text-[11px] font-medium uppercase tracking-[0.22em] hover:bg-ink transition-colors">
            Begin Prevention Plan
          </Link>
        </div>
      </section>
    </article>
  );
}