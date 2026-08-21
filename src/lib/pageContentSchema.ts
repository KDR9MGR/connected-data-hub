export type Field =
  | { type: "text"; key: string; label: string; placeholder?: string }
  | { type: "textarea"; key: string; label: string }
  | { type: "image"; key: string; label: string }
  | { type: "string-list"; key: string; label: string }
  | { type: "list"; key: string; label: string; itemLabel: string; itemFields: Field[] };

export type SectionSchema = { label: string; fields: Field[] };
export type PageSchema = Record<string, SectionSchema>;

const heroFields: Field[] = [
  { type: "text", key: "kicker", label: "Kicker" },
  { type: "text", key: "heading_line1", label: "Heading line 1" },
  { type: "text", key: "heading_highlight", label: "Heading highlight (italic)" },
  { type: "textarea", key: "body", label: "Body text" },
  { type: "image", key: "image", label: "Hero image" },
  { type: "text", key: "cta_label", label: "Button label" },
];

export const PAGE_CONTENT_SCHEMA: Record<string, PageSchema> = {
  home: {
    hero: {
      label: "Hero",
      fields: [
        { type: "text", key: "badge", label: "Badge text" },
        { type: "text", key: "heading_line1", label: "Heading line 1" },
        { type: "text", key: "heading_highlight", label: "Heading highlight (italic)" },
        { type: "text", key: "heading_line2", label: "Heading line 2" },
        { type: "textarea", key: "subtext", label: "Subtext" },
        { type: "text", key: "cta_label", label: "Button label" },
        { type: "string-list", key: "slideshow_images", label: "Slideshow images (URLs)" },
      ],
    },
    numbers: {
      label: "Stats & Philosophy",
      fields: [
        {
          type: "list",
          key: "stats",
          label: "Stats",
          itemLabel: "Stat",
          itemFields: [
            { type: "text", key: "value", label: "Value" },
            { type: "text", key: "label", label: "Label" },
          ],
        },
        { type: "text", key: "philosophy_title", label: "Philosophy title" },
        { type: "textarea", key: "philosophy_body", label: "Philosophy body" },
        {
          type: "list",
          key: "philosophy_cards",
          label: "Philosophy cards",
          itemLabel: "Card",
          itemFields: [
            { type: "text", key: "title", label: "Title" },
            { type: "textarea", key: "body", label: "Body" },
          ],
        },
      ],
    },
    why_us: {
      label: "Why Us",
      fields: [
        { type: "text", key: "kicker", label: "Kicker" },
        { type: "text", key: "heading", label: "Heading" },
        { type: "text", key: "heading_highlight", label: "Heading highlight (italic)" },
        { type: "textarea", key: "subheading", label: "Subheading" },
        {
          type: "list",
          key: "items",
          label: "Items",
          itemLabel: "Item",
          itemFields: [
            { type: "text", key: "title", label: "Title" },
            { type: "textarea", key: "body", label: "Body" },
          ],
        },
      ],
    },
    pricing: {
      label: "Pricing intro",
      fields: [
        { type: "text", key: "kicker", label: "Kicker" },
        { type: "text", key: "heading", label: "Heading" },
        { type: "textarea", key: "body", label: "Body" },
        { type: "text", key: "footnote", label: "Footnote" },
      ],
    },
    testimonials: {
      label: "Testimonials intro",
      fields: [
        { type: "text", key: "kicker", label: "Kicker" },
        { type: "text", key: "heading", label: "Heading" },
      ],
    },
    contact: {
      label: "Contact section",
      fields: [
        { type: "text", key: "kicker", label: "Kicker" },
        { type: "text", key: "heading_line1", label: "Heading line 1" },
        { type: "text", key: "heading_highlight", label: "Heading highlight (italic)" },
        { type: "textarea", key: "body", label: "Body" },
      ],
    },
  },
  treatment: { hero: { label: "Hero", fields: heroFields } },
  "diet-lifestyle": { hero: { label: "Hero", fields: heroFields } },
  "disease-prevention": { hero: { label: "Hero", fields: heroFields } },
  blog: {
    hero: {
      label: "Hero",
      fields: [
        { type: "text", key: "kicker", label: "Kicker" },
        { type: "text", key: "heading_line1", label: "Heading line 1" },
        { type: "text", key: "heading_highlight", label: "Heading highlight (italic)" },
      ],
    },
  },
  global: {
    contact: {
      label: "Contact details",
      fields: [
        { type: "text", key: "email", label: "Email" },
        {
          type: "text",
          key: "whatsapp_number",
          label: "WhatsApp number (digits only, e.g. 442079460123)",
        },
        { type: "textarea", key: "whatsapp_message", label: "WhatsApp prefill message" },
        { type: "text", key: "phone_display", label: "Phone (displayed)" },
      ],
    },
    concerns: {
      label: "Concern categories",
      fields: [
        { type: "string-list", key: "items", label: "Categories (used by the contact form)" },
      ],
    },
    footer: {
      label: "Footer",
      fields: [
        { type: "textarea", key: "tagline", label: "Tagline" },
        { type: "string-list", key: "badges", label: "Badges" },
        { type: "text", key: "copyright_tagline", label: "Copyright tagline" },
      ],
    },
  },
};

export const PAGE_LABELS: Record<string, string> = {
  home: "Home",
  treatment: "Treatment",
  "diet-lifestyle": "Diet & Lifestyle",
  "disease-prevention": "Disease Prevention",
  blog: "Blog",
  global: "Site Settings",
};

// Content shape is per-section dynamic JSON edited freely through the CMS form builder,
// so this stays loosely typed rather than declaring a rigid interface per section.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PAGE_CONTENT_DEFAULTS: Record<string, Record<string, Record<string, any>>> = {
  home: {
    hero: {
      badge: "New era of Ayurveda",
      heading_line1: "Start caring for your",
      heading_highlight: "health",
      heading_line2: "with us.",
      subtext:
        "Swāstha is a modern Ayurveda clinic for a generation that wants real care — minus the gimmicks. Prevention, treatment & lifestyle, personalised to you.",
      cta_label: "Explore care",
      slideshow_images: [] as string[],
    },
    numbers: {
      stats: [
        { value: "5+", label: "Years Experience" },
        { value: "12", label: "Countries Served" },
        { value: "BAMS", label: "Medical Degree" },
        { value: "Certified", label: "Panchakarma & More" },
      ],
      philosophy_title: "Our Philosophy",
      philosophy_body:
        "Our English-speaking team bridges Sanskrit medical texts and modern lifestyles, so your journey is precise, understood, and supported.",
      philosophy_cards: [
        {
          title: "Disease Prevention",
          body: "Proactive immunity-building and metabolic alignment, before symptoms arrive.",
        },
        {
          title: "Lifestyle Diet",
          body: "Nutrition and routine tailored to your unique Dosha and daily reality.",
        },
      ],
    },
    why_us: {
      kicker: "Why Us",
      heading: "Help us",
      heading_highlight: "help you.",
      subheading: "Show up honest, we'll show up consistent. Here's what you get when you do.",
      items: [
        {
          title: "Authenticated Degrees",
          body: "Senior physicians hold BAMS / MD credentials from India's most rigorous Ayurvedic medical colleges.",
        },
        {
          title: "Clinical Discretion",
          body: "Every patient relationship is governed by a strict NDA. Your records remain entirely private.",
        },
        {
          title: "English-Speaking Team",
          body: "Concierge coordinators translate ancient protocols into clear, modern, daily practice.",
        },
        {
          title: "Global Patient Care",
          body: "Remote consultations across 12 countries, with travel logistics for in-person care.",
        },
      ],
    },
    pricing: {
      kicker: "Pricing",
      heading: "Invest in Longevity",
      body: "Ayurveda is not one-size-fits-all. Our pricing is bespoke, calculated against your unique constitution, the severity of your condition, and the duration of the healing cycle required.",
      footnote: "Final pricing shared after diagnostic consultation.",
    },
    testimonials: { kicker: "Reviews", heading: "Patient Journeys" },
    contact: {
      kicker: "Contact",
      heading_line1: "Start Your",
      heading_highlight: "Healing Journey",
      body: "Fill out the form for a confidential assessment, or message us on WhatsApp for an immediate consultation.",
    },
  },
  treatment: {
    hero: {
      kicker: "Treatment",
      heading_line1: "Indexed clinical",
      heading_highlight: "protocols",
      body: "Our treatments are not packages — they are sequenced, evidence-led plans built around your diagnostic profile.",
      image: "/seed/portfolio-panchakarma.jpg",
      cta_label: "Request Treatment Plan",
    },
  },
  "diet-lifestyle": {
    hero: {
      kicker: "Diet & Lifestyle",
      heading_line1: "A life that",
      heading_highlight: "heals you back",
      body: "Ayurveda treats lifestyle as medicine. Our plans are practical, beautiful, and built to survive real weeks.",
      image: "/seed/portfolio-meditation.jpg",
      cta_label: "Design My Lifestyle Plan",
    },
  },
  "disease-prevention": {
    hero: {
      kicker: "Prevention",
      heading_line1: "Stop disease",
      heading_highlight: "before it begins",
      body: "The deepest Ayurvedic medicine is the one you never need to take. Our prevention programmes identify imbalance years before pathology emerges.",
      image: "/seed/portfolio-herbs.jpg",
      cta_label: "Begin Prevention Plan",
    },
  },
  blog: {
    hero: { kicker: "Journal", heading_line1: "Notes from the", heading_highlight: "clinic." },
  },
  global: {
    theme: {
      accent_color: "#4a6355",
      background_color: "#fafaf6",
      heading_font: "Cormorant Garamond",
    },
    concerns: {
      items: [
        "Digestive Health (IBS, Acidity)",
        "Chronic Pain & Arthritis",
        "Skin Disorders (Psoriasis, Eczema)",
        "Mental Wellness & Sleep",
        "Metabolic & Diabetes",
        "Autoimmune Support",
        "Preventative & Lifestyle",
      ],
    },
    contact: {
      email: "concierge@arayaveda.com",
      whatsapp_number: "442079460123",
      whatsapp_message: "Hello Araya Veda, I'd like to book a consultation.",
      phone_display: "+44 20 7946 0123",
    },
    footer: {
      tagline:
        "Holistic clinical Ayurveda — disease prevention, personalised treatment and lifestyle medicine, delivered with discretion to patients in 12 countries.",
      badges: ["NDA Protected", "English Speaking"],
      copyright_tagline: "Start caring for your health with us",
    },
  },
};

export function mergeWithDefaults(
  page: string,
  section: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: Record<string, any> | null | undefined,
) {
  const fallback = PAGE_CONTENT_DEFAULTS[page]?.[section] ?? {};
  return { ...fallback, ...(content ?? {}) };
}
