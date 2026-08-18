import { createFileRoute } from "@tanstack/react-router";
import { ContactForm } from "@/components/ContactForm";
import { ConsultWhatsapp } from "@/components/ConsultWhatsapp";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Araya Veda" },
      { name: "description", content: "Book a confidential Ayurvedic consultation. Submit the contact form or reach our clinic on WhatsApp." },
      { property: "og:title", content: "Contact — Araya Veda" },
      { property: "og:description", content: "Confidential consultations, English-speaking team." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <article className="pt-32 md:pt-40 pb-24 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 md:gap-24">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4 block">Contact</span>
          <h1 className="text-5xl md:text-7xl font-serif font-light leading-[1.05] mb-8">
            Begin your <br /><span className="italic">consultation.</span>
          </h1>
          <p className="text-ink/65 mb-10 max-w-md leading-relaxed">
            Share a few details and our clinical team will respond within one working day.
            For urgent matters, message us on WhatsApp.
          </p>

          <div className="space-y-5 mb-10">
            <Row label="Email" value="concierge@arayaveda.com" />
            <Row label="WhatsApp" value="+44 20 7946 0123" />
            <Row label="Hours" value="Mon–Sat · 9.00–18.00 IST" />
          </div>

          <ConsultWhatsapp variant="tile" />
        </div>
        <ContactForm />
      </div>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
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