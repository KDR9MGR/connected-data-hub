import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Journal — Araya Veda" },
      { name: "description", content: "Clinical notes, case studies and essays on Ayurvedic medicine, prevention and lifestyle from the Araya Veda team." },
      { property: "og:title", content: "Journal — Araya Veda" },
      { property: "og:description", content: "Essays and clinical case studies from our Ayurvedic team." },
    ],
  }),
  component: Page,
});

const POSTS = [
  { date: "May 2026", cat: "Case Study", title: "Resolving 14 years of IBS through Agni-led protocol", read: "8 min" },
  { date: "Apr 2026", cat: "Essay", title: "Why prevention is the future of Ayurvedic practice", read: "6 min" },
  { date: "Mar 2026", cat: "Lifestyle", title: "A founder's Dinacharya — daily routine for high output", read: "5 min" },
  { date: "Feb 2026", cat: "Clinical Notes", title: "Shirodhara and the modern nervous system", read: "7 min" },
  { date: "Jan 2026", cat: "Diet", title: "Vata winter: warm meals to settle a restless mind", read: "4 min" },
];

function Page() {
  return (
    <article className="pt-32 md:pt-40 pb-24 px-6">
      <section className="max-w-7xl mx-auto mb-16">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4 block">Journal</span>
        <h1 className="text-5xl md:text-7xl font-serif font-light leading-[1.05] max-w-3xl">
          Notes from the <span className="italic">clinic.</span>
        </h1>
      </section>

      <section className="max-w-7xl mx-auto">
        <div className="divide-y divide-sage/10 border-y border-sage/10">
          {POSTS.map((p, i) => (
            <a key={i} href="#" className="block py-8 group">
              <div className="grid md:grid-cols-12 gap-6 items-baseline">
                <div className="md:col-span-2 text-[10px] uppercase tracking-[0.22em] text-sage/70">{p.date}</div>
                <div className="md:col-span-2 text-[10px] uppercase tracking-[0.22em] text-gold">{p.cat}</div>
                <h3 className="md:col-span-6 text-2xl md:text-3xl font-serif group-hover:text-gold transition-colors">{p.title}</h3>
                <div className="md:col-span-2 md:text-right text-xs text-ink/50">{p.read}</div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </article>
  );
}