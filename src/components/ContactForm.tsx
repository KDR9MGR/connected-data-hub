import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const DISEASES = [
  "Digestive Health (IBS, Acidity)",
  "Chronic Pain & Arthritis",
  "Skin Disorders (Psoriasis, Eczema)",
  "Mental Wellness & Sleep",
  "Metabolic & Diabetes",
  "Autoimmune Support",
  "Preventative & Lifestyle",
] as const;

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z.string().trim().min(6, "Enter a valid contact number").max(30),
  email: z.string().trim().email("Enter a valid email").max(255),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  disease: z.string().min(1, "Please choose a concern"),
  body: z.string().trim().min(10, "Please share at least a brief description").max(2000),
});

type FormState = z.input<typeof schema>;

const empty: FormState = { name: "", phone: "", email: "", subject: "", disease: "", body: "" };

export function ContactForm() {
  const [data, setData] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setData((d) => ({ ...d, [k]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(data);
    if (!result.success) {
      const fe: Record<string, string> = {};
      for (const issue of result.error.issues) fe[issue.path[0] as string] = issue.message;
      setErrors(fe);
      return;
    }
    setErrors({});
    setSubmitError(null);
    setSubmitting(true);
    const v = result.data;
    const { error } = await supabase.from("contact_submissions").insert({
      name: v.name,
      email: v.email,
      phone: v.phone,
      subject: v.subject || null,
      disease: v.disease,
      body: v.body,
    });
    setSubmitting(false);
    if (error) {
      setSubmitError(error.message);
      return;
    }
    setSent(true);
    setData(empty);
  };

  if (sent) {
    return (
      <div className="bg-stone p-10 rounded-3xl text-center">
        <div className="text-[10px] uppercase tracking-[0.22em] text-gold mb-4">Received</div>
        <h3 className="text-3xl font-serif mb-3">Thank you.</h3>
        <p className="text-ink/60 max-w-md mx-auto">
          A member of our clinical team will reach out within one working day. For
          urgent matters please message us on WhatsApp.
        </p>
        <button onClick={() => setSent(false)} className="mt-8 text-[11px] uppercase tracking-[0.22em] text-sage border-b border-sage/40 pb-0.5">
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-stone p-8 md:p-10 rounded-3xl space-y-6">
      <Field label="Full Name" error={errors.name}>
        <input type="text" value={data.name} onChange={update("name")} className={inputClass} placeholder="Aditi Sharma" />
      </Field>

      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Contact Number" error={errors.phone}>
          <input type="tel" value={data.phone} onChange={update("phone")} className={inputClass} placeholder="+91 ..." />
        </Field>
        <Field label="Email Address" error={errors.email}>
          <input type="email" value={data.email} onChange={update("email")} className={inputClass} placeholder="name@domain.com" />
        </Field>
      </div>

      <Field label="Subject (Optional)" error={errors.subject}>
        <input type="text" value={data.subject} onChange={update("subject")} className={inputClass} placeholder="Initial enquiry" />
      </Field>

      <Field label="Concern (Disease)" error={errors.disease}>
        <select value={data.disease} onChange={update("disease")} className={`${inputClass} appearance-none`}>
          <option value="">Select a category…</option>
          {DISEASES.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </Field>

      <Field label="Body (Mandatory)" error={errors.body}>
        <textarea rows={5} value={data.body} onChange={update("body")} className={`${inputClass} resize-none`} placeholder="Briefly describe your symptoms, history and goals…" />
      </Field>

      {submitError && <p className="text-[12px] text-destructive">{submitError}</p>}
      <button type="submit" disabled={submitting} className="w-full bg-sage text-cream py-4 rounded-full text-xs font-medium uppercase tracking-[0.22em] hover:bg-ink transition-colors disabled:opacity-60">
        {submitting ? "Sending…" : "Request Consultation"}
      </button>
    </form>
  );
}

const inputClass = "w-full bg-transparent border-b border-sage/20 py-2 text-sm focus:outline-none focus:border-sage transition-colors";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-[0.22em] font-semibold text-sage">{label}</label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}