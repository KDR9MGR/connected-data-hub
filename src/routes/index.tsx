import { createFileRoute, Link } from "@tanstack/react-router";
import portfolioPanchakarma from "@/assets/portfolio-panchakarma.jpg";
import portfolioHerbs from "@/assets/portfolio-herbs.jpg";
import portfolioMeditation from "@/assets/portfolio-meditation.jpg";
import testimonialVideo from "@/assets/testimonial-video.jpg";
import testimonialSkin from "@/assets/testimonial-skin.jpg";
import { ContactForm } from "@/components/ContactForm";
import { ConsultWhatsapp, WA_URL } from "@/components/ConsultWhatsapp";
import { useState, useEffect } from "react";
import { Play } from "lucide-react";

const CLINIC_IMAGES: { url: string }[] = [
  {
    url: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=serene%20ayurveda%20clinic%20reception%20area%20with%20natural%20light%2C%20wooden%20furniture%2C%20indoor%20plants%2C%20warm%20earth%20tones%2C%20spa-like%20atmosphere%2C%20stone%20floor%2C%20minimalist&image_size=portrait_4_3",
  },
  {
    url: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=panchakarma%20treatment%20room%20with%20wooden%20massage%20table%2C%20warm%20towels%2C%20herbal%20oils%2C%20candles%2C%20soft%20lighting%2C%20ayurvedic%20wellness%2C%20serene&image_size=portrait_4_3",
  },
  {
    url: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=ayurvedic%20herbal%20pharmacy%20with%20wooden%20shelves%20filled%20with%20glass%20jars%20of%20dried%20herbs%2C%20roots%2C%20powders%2C%20brass%20bowls%2C%20warm%20natural%20lighting&image_size=portrait_4_3",
  },
  {
    url: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=shirodhara%20ayurvedic%20therapy%20setup%2C%20warm%20oil%20dripping%20device%20over%20wooden%20table%2C%20peaceful%20room%2C%20stone%20walls%2C%20soft%20zen%20lighting&image_size=portrait_4_3",
  },
  {
    url: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=tranquil%20yoga%20meditation%20space%20in%20ayurveda%20clinic%2C%20bamboo%20mats%2C%20floor%20cushions%2C%20lotus%20flowers%2C%20natural%20sunlight%2C%20calm%20peaceful%20atmosphere&image_size=portrait_4_3",
  },
  {
    url: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=ayurvedic%20doctor%20consultation%20room%2C%20wooden%20desk%2C%20pulse%20diagnosis%20setting%2C%20herbal%20medicine%20books%2C%20plants%2C%20warm%20professional%20ambiance&image_size=portrait_4_3",
  },
  {
    url: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=outdoor%20zen%20garden%20at%20ayurveda%20wellness%20retreat%2C%20sand%20patterns%2C%20bonsai%2C%20stone%20pathways%2C%20water%20feature%2C%20lush%20greenery%2C%20peaceful&image_size=portrait_4_3",
  },
];

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

const PORTFOLIO = {
  diseases: [
    { img: portfolioPanchakarma, title: "Panchakarma Detox", tag: "Treatment & Recovery", desc: "Five-fold purification for chronic metabolic and inflammatory conditions." },
    { img: portfolioHerbs, title: "Autoimmune Support", tag: "Chronic Disease", desc: "Rheumatoid arthritis, psoriasis and thyroid recovery protocols." },
    { img: portfolioMeditation, title: "Anxiety & Sleep", tag: "Mental Wellness", desc: "Nervous system regulation through Shirodhara and herbal sedation." },
  ],
  lifestyle: [
    { img: portfolioHerbs, title: "Dosha Diet Plans", tag: "Nutrition", desc: "Constitution-specific meal plans designed for daily, real life." },
    { img: portfolioMeditation, title: "Daily Routine (Dinacharya)", tag: "Habits", desc: "Sleep, movement and breath, calibrated to your work and travel." },
    { img: portfolioPanchakarma, title: "Seasonal Reset", tag: "Rejuvenation", desc: "Quarterly cleansing rituals for sustained metabolic clarity." },
  ],
} as const;

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
  const slides = [
    CLINIC_IMAGES[1],
    CLINIC_IMAGES[2],
    CLINIC_IMAGES[4],
    CLINIC_IMAGES[5],
    CLINIC_IMAGES[6],
    CLINIC_IMAGES[0],
    CLINIC_IMAGES[3],
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 3500);
    return () => clearInterval(t);
  }, [slides.length]);
  return (
    <header className="min-h-screen pt-24 md:pt-28 pb-10 px-6 flex items-center">
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-10 md:gap-14 items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-sage bg-sage/8 border border-sage/15 rounded-full px-3 py-1.5 mb-5">
            <span className="size-1.5 rounded-full bg-gold animate-pulse" /> New era of Ayurveda
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-light leading-[1.05] mb-5">
            Start caring for your <span className="italic text-gold">health</span> with us.
          </h1>
          <p className="text-base md:text-lg text-ink/70 max-w-md mb-7 leading-relaxed">
            Swāstha is a modern Ayurveda clinic for a generation that wants
            real care — minus the gimmicks. Prevention, treatment & lifestyle,
            personalised to you.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/treatment"
              className="px-6 py-3.5 bg-sage text-cream rounded-full text-xs font-medium uppercase tracking-[0.18em] hover:bg-ink transition-colors"
            >
              Explore care ↗
            </Link>
            <ConsultWhatsapp />
          </div>
        </div>
        <div className="relative">
          <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden outline outline-1 -outline-offset-1 outline-black/5 bg-stone">
            {slides.map((s, i) => (
              <img
                key={s.url}
                src={s.url}
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
      </div>
    </header>
  );
}

function Numbers() {
  const items = [
    { value: "5+", label: "Years Experience" },
    { value: "12", label: "Countries Served" },
    { value: "BAMS", label: "Medical Degree" },
    { value: "Certified", label: "Panchakarma & More" },
  ];
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
            <h2 className="text-3xl font-serif mb-5">Our Philosophy</h2>
            <p className="text-ink/70 leading-relaxed">
              Our English-speaking team bridges Sanskrit medical texts and modern lifestyles,
              so your journey is precise, understood, and supported.
            </p>
          </div>
          <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <PhilosophyCard title="Disease Prevention" body="Proactive immunity-building and metabolic alignment, before symptoms arrive." />
            <PhilosophyCard title="Lifestyle Diet" body="Nutrition and routine tailored to your unique Dosha and daily reality." />
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
  const [tab, setTab] = useState<"diseases" | "lifestyle">("diseases");
  const items = PORTFOLIO[tab];
  return (
    <section className="py-20 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif mb-2">Specialised Care</h2>
            <p className="text-ink/60">Clinical excellence across chronic and acute conditions.</p>
          </div>
          <div className="flex gap-3">
            <TabPill active={tab === "diseases"} onClick={() => setTab("diseases")}>Diseases</TabPill>
            <TabPill active={tab === "lifestyle"} onClick={() => setTab("lifestyle")}>Diet & Lifestyle</TabPill>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((it) => (
            <article key={it.title} className="group">
              <div className="relative overflow-hidden rounded-2xl mb-6 aspect-square">
                <img
                  src={it.img}
                  alt={it.title}
                  loading="lazy"
                  width={800}
                  height={800}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-700 ease-out"
                />
              </div>
              <h3 className="text-xl font-serif mb-1">{it.title}</h3>
              <p className="text-[10px] uppercase tracking-[0.22em] text-gold mb-2">{it.tag}</p>
              <p className="text-sm text-ink/60 leading-relaxed">{it.desc}</p>
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
  return (
    <section className="py-24 md:py-28 bg-sage text-cream px-6">
      <div className="max-w-3xl mx-auto text-center">
        <span className="text-[10px] uppercase tracking-[0.3em] text-cream/60 mb-6 block">Pricing</span>
        <h2 className="text-4xl md:text-5xl font-serif mb-8">Invest in Longevity</h2>
        <p className="text-lg opacity-80 mb-10 leading-relaxed">
          Ayurveda is not one-size-fits-all. Our pricing is bespoke, calculated
          against your unique constitution, the severity of your condition, and
          the duration of the healing cycle required.
        </p>
        <div className="h-px w-24 bg-gold mx-auto mb-10" />
        <div className="grid sm:grid-cols-3 gap-6 text-left">
          <PriceTile kicker="Triage" title="Diagnostic Consult" detail="60 min deep-dive analysis of prakriti and current vikriti." />
          <PriceTile kicker="Primary Path" title="Treatment Intensive" detail="Full herbal protocol, diet plan and bi-weekly check-ins." highlight />
          <PriceTile kicker="Sustained Care" title="Annual Care Plan" detail="Quarterly resets, year-round access and seasonal protocols." />
        </div>
        <p className="mt-10 text-xs uppercase tracking-[0.22em] text-cream/60">
          Final pricing shared after diagnostic consultation.
        </p>
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
  const items = [
    { t: "Authenticated Degrees", d: "Senior physicians hold BAMS / MD credentials from India's most rigorous Ayurvedic medical colleges." },
    { t: "Clinical Discretion", d: "Every patient relationship is governed by a strict NDA. Your records remain entirely private." },
    { t: "English-Speaking Team", d: "Concierge coordinators translate ancient protocols into clear, modern, daily practice." },
    { t: "Global Patient Care", d: "Remote consultations across 12 countries, with travel logistics for in-person care." },
  ];
  return (
    <section className="py-20 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-14">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-3 block">Why Us</span>
          <h2 className="text-4xl md:text-5xl font-serif">Help us <span className="italic text-gold">help you</span>.</h2>
          <p className="mt-4 text-ink/65 leading-relaxed">Show up honest, we'll show up consistent. Here's what you get when you do.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-10 border-t border-sage/10">
          {items.map((i, idx) => (
            <div key={i.t} className="pt-8 border-b border-sage/10 pb-8 last:border-b-0">
              <div className="flex items-baseline gap-6">
                <span className="text-[10px] font-mono text-sage/50">0{idx + 1}</span>
                <div>
                  <h3 className="text-2xl font-serif mb-2">{i.t}</h3>
                  <p className="text-ink/65 leading-relaxed">{i.d}</p>
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
  return (
    <section className="py-20 md:py-24 px-6 bg-stone/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-3 block">Reviews</span>
          <h2 className="text-4xl md:text-5xl font-serif">Patient Journeys</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-start">
          <div className="space-y-6">
            <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="relative block rounded-2xl overflow-hidden aspect-video group">
              <img src={testimonialVideo} alt="Patient video testimonial" loading="lazy" width={1280} height={720} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-ink/15 group-hover:bg-ink/25 transition-colors" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="size-14 rounded-full bg-cream flex items-center justify-center shadow-lg">
                  <Play size={20} className="text-sage ml-0.5" />
                </div>
              </div>
              <span className="absolute bottom-4 left-4 text-[10px] font-medium uppercase tracking-[0.22em] text-cream/90">Video Testimonial</span>
            </a>
            <p className="font-serif italic text-xl md:text-2xl text-sage leading-snug">
              “The personalised diet plan completely transformed digestion issues that modern medicine couldn't touch.”
            </p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-ink/60">— Elena Richards, London</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src={testimonialSkin} alt="Skin recovery case" loading="lazy" width={640} height={832} className="w-full aspect-[3/4] object-cover rounded-xl" />
            <div className="flex flex-col justify-center">
              <p className="font-serif text-lg md:text-xl leading-snug mb-4">
                “Clinical precision combined with a warmth I'd never experienced in healthcare before.”
              </p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Case Study #402 · Skin Recovery</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="py-20 md:py-24 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 md:gap-24">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4 block">Contact</span>
          <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-[1.05]">
            Start Your <br /><span className="italic">Healing Journey</span>
          </h2>
          <p className="text-ink/65 mb-10 max-w-md leading-relaxed">
            Fill out the form for a confidential assessment, or message us on WhatsApp
            for an immediate consultation.
          </p>
          <div className="space-y-5 mb-10">
            <ContactRow label="Email" value="concierge@arayaveda.com" />
            <ContactRow label="WhatsApp" value="+44 20 7946 0123" />
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