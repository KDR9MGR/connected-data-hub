-- =====================================================
-- PAGE CONTENT (generic, section-based CMS content)
-- =====================================================
CREATE TABLE public.page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page, section)
);
GRANT SELECT ON public.page_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_content TO authenticated;
GRANT ALL ON public.page_content TO service_role;
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Page content readable by everyone" ON public.page_content FOR SELECT USING (true);
CREATE POLICY "Editors manage page content" ON public.page_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'editor')) WITH CHECK (public.has_role(auth.uid(), 'editor'));

CREATE TRIGGER trg_page_content_updated BEFORE UPDATE ON public.page_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- MEDIA ASSETS
-- =====================================================
CREATE TABLE public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('image', 'video')),
  size_bytes BIGINT,
  alt_text TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media_assets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Media assets readable by everyone" ON public.media_assets FOR SELECT USING (true);
CREATE POLICY "Editors and bloggers upload media" ON public.media_assets FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'blogger'));
CREATE POLICY "Owners update own media" ON public.media_assets FOR UPDATE TO authenticated
  USING (auth.uid() = uploaded_by OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Owners delete own media" ON public.media_assets FOR DELETE TO authenticated
  USING (auth.uid() = uploaded_by OR public.has_role(auth.uid(), 'editor'));

-- =====================================================
-- STORAGE BUCKET
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read media bucket" ON storage.objects FOR SELECT
  USING (bucket_id = 'media');
CREATE POLICY "Editors and bloggers upload to media bucket" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'blogger')));
CREATE POLICY "Owners delete own media bucket objects" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND (owner = auth.uid() OR public.has_role(auth.uid(), 'editor')));

-- =====================================================
-- SEED: page_content
-- =====================================================
INSERT INTO public.page_content (page, section, content) VALUES
('home', 'hero', '{
  "badge": "New era of Ayurveda",
  "heading_line1": "Start caring for your",
  "heading_highlight": "health",
  "heading_line2": "with us.",
  "subtext": "Swāstha is a modern Ayurveda clinic for a generation that wants real care — minus the gimmicks. Prevention, treatment & lifestyle, personalised to you.",
  "cta_label": "Explore care",
  "slideshow_images": [
    "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=panchakarma%20treatment%20room%20with%20wooden%20massage%20table%2C%20warm%20towels%2C%20herbal%20oils%2C%20candles%2C%20soft%20lighting%2C%20ayurvedic%20wellness%2C%20serene&image_size=portrait_4_3",
    "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=ayurvedic%20herbal%20pharmacy%20with%20wooden%20shelves%20filled%20with%20glass%20jars%20of%20dried%20herbs%2C%20roots%2C%20powders%2C%20brass%20bowls%2C%20warm%20natural%20lighting&image_size=portrait_4_3",
    "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=tranquil%20yoga%20meditation%20space%20in%20ayurveda%20clinic%2C%20bamboo%20mats%2C%20floor%20cushions%2C%20lotus%20flowers%2C%20natural%20sunlight%2C%20calm%20peaceful%20atmosphere&image_size=portrait_4_3",
    "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=ayurvedic%20doctor%20consultation%20room%2C%20wooden%20desk%2C%20pulse%20diagnosis%20setting%2C%20herbal%20medicine%20books%2C%20plants%2C%20warm%20professional%20ambiance&image_size=portrait_4_3",
    "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=outdoor%20zen%20garden%20at%20ayurveda%20wellness%20retreat%2C%20sand%20patterns%2C%20bonsai%2C%20stone%20pathways%2C%20water%20feature%2C%20lush%20greenery%2C%20peaceful&image_size=portrait_4_3",
    "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=serene%20ayurveda%20clinic%20reception%20area%20with%20natural%20light%2C%20wooden%20furniture%2C%20indoor%20plants%2C%20warm%20earth%20tones%2C%20spa-like%20atmosphere%2C%20stone%20floor%2C%20minimalist&image_size=portrait_4_3",
    "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=shirodhara%20ayurvedic%20therapy%20setup%2C%20warm%20oil%20dripping%20device%20over%20wooden%20table%2C%20peaceful%20room%2C%20stone%20walls%2C%20soft%20zen%20lighting&image_size=portrait_4_3"
  ]
}'::jsonb),
('home', 'numbers', '{
  "stats": [
    {"value": "5+", "label": "Years Experience"},
    {"value": "12", "label": "Countries Served"},
    {"value": "BAMS", "label": "Medical Degree"},
    {"value": "Certified", "label": "Panchakarma & More"}
  ],
  "philosophy_title": "Our Philosophy",
  "philosophy_body": "Our English-speaking team bridges Sanskrit medical texts and modern lifestyles, so your journey is precise, understood, and supported.",
  "philosophy_cards": [
    {"title": "Disease Prevention", "body": "Proactive immunity-building and metabolic alignment, before symptoms arrive."},
    {"title": "Lifestyle Diet", "body": "Nutrition and routine tailored to your unique Dosha and daily reality."}
  ]
}'::jsonb),
('home', 'why_us', '{
  "kicker": "Why Us",
  "heading": "Help us",
  "heading_highlight": "help you.",
  "subheading": "Show up honest, we''ll show up consistent. Here''s what you get when you do.",
  "items": [
    {"title": "Authenticated Degrees", "body": "Senior physicians hold BAMS / MD credentials from India''s most rigorous Ayurvedic medical colleges."},
    {"title": "Clinical Discretion", "body": "Every patient relationship is governed by a strict NDA. Your records remain entirely private."},
    {"title": "English-Speaking Team", "body": "Concierge coordinators translate ancient protocols into clear, modern, daily practice."},
    {"title": "Global Patient Care", "body": "Remote consultations across 12 countries, with travel logistics for in-person care."}
  ]
}'::jsonb),
('home', 'pricing', '{
  "kicker": "Pricing",
  "heading": "Invest in Longevity",
  "body": "Ayurveda is not one-size-fits-all. Our pricing is bespoke, calculated against your unique constitution, the severity of your condition, and the duration of the healing cycle required.",
  "footnote": "Final pricing shared after diagnostic consultation."
}'::jsonb),
('home', 'testimonials', '{
  "kicker": "Reviews",
  "heading": "Patient Journeys"
}'::jsonb),
('home', 'contact', '{
  "kicker": "Contact",
  "heading_line1": "Start Your",
  "heading_highlight": "Healing Journey",
  "body": "Fill out the form for a confidential assessment, or message us on WhatsApp for an immediate consultation."
}'::jsonb),
('treatment', 'hero', '{
  "kicker": "Treatment",
  "heading_line1": "Indexed clinical",
  "heading_highlight": "protocols",
  "body": "Our treatments are not packages — they are sequenced, evidence-led plans built around your diagnostic profile.",
  "image": "/seed/portfolio-panchakarma.jpg",
  "cta_label": "Request Treatment Plan"
}'::jsonb),
('treatment', 'items', '{
  "items": [
    {"title": "Panchakarma Detoxification", "description": "Fivefold purification therapy to eliminate deep metabolic toxins and restore cellular intelligence."},
    {"title": "Rasayana Rejuvenation", "description": "Immune-boosting protocols using rare herbs to halt degenerative processes and enhance longevity."},
    {"title": "Shirodhara & Nervous System Care", "description": "Continuous warm-oil therapies for anxiety, insomnia and burnout recovery."},
    {"title": "Joint & Autoimmune Programmes", "description": "Targeted internal and external care for rheumatoid arthritis, psoriasis and thyroid imbalance."},
    {"title": "Digestive Restoration", "description": "IBS, acidity and gut microbiome rebuilding through Agni-led protocols."},
    {"title": "Post-illness Recovery", "description": "Structured recovery from long-COVID, chemotherapy and chronic fatigue states."}
  ]
}'::jsonb),
('diet-lifestyle', 'hero', '{
  "kicker": "Diet & Lifestyle",
  "heading_line1": "A life that",
  "heading_highlight": "heals you back",
  "body": "Ayurveda treats lifestyle as medicine. Our plans are practical, beautiful, and built to survive real weeks.",
  "image": "/seed/portfolio-meditation.jpg",
  "cta_label": "Design My Lifestyle Plan"
}'::jsonb),
('diet-lifestyle', 'items', '{
  "items": [
    {"title": "Dosha-Aligned Nutrition", "description": "Meal frameworks built to your constitution, climate, and weekly schedule."},
    {"title": "Daily Routine (Dinacharya)", "description": "Sleep, movement, breath, and meal timing that compound over months."},
    {"title": "Seasonal Rituals (Ritucharya)", "description": "Quarterly shifts in diet and herbs to match your environment."},
    {"title": "Mindful Movement", "description": "Yoga, pranayama and walking practices integrated into work-day reality."},
    {"title": "Travel & Work Protocols", "description": "Plans designed for frequent travellers, founders and shift workers."},
    {"title": "Family & Children", "description": "Gentle constitutional guidance for childhood immunity and family kitchens."}
  ]
}'::jsonb),
('disease-prevention', 'hero', '{
  "kicker": "Prevention",
  "heading_line1": "Stop disease",
  "heading_highlight": "before it begins",
  "body": "The deepest Ayurvedic medicine is the one you never need to take. Our prevention programmes identify imbalance years before pathology emerges.",
  "image": "/seed/portfolio-herbs.jpg",
  "cta_label": "Begin Prevention Plan"
}'::jsonb),
('disease-prevention', 'items', '{
  "items": [
    {"title": "Constitutional Mapping", "description": "A full prakriti assessment to identify the imbalances most likely to take root in your body."},
    {"title": "Immune Foundations", "description": "Daily herbal regimens and breath practice to strengthen Ojas and defend against seasonal flux."},
    {"title": "Metabolic Alignment", "description": "Targeted plans for Agni, blood sugar regulation and inflammation control."},
    {"title": "Seasonal Resets", "description": "Quarterly cleansing rituals to clear accumulated toxins and recalibrate the nervous system."}
  ]
}'::jsonb),
('blog', 'hero', '{
  "kicker": "Journal",
  "heading_line1": "Notes from the",
  "heading_highlight": "clinic."
}'::jsonb),
('global', 'contact', '{
  "email": "concierge@arayaveda.com",
  "whatsapp_number": "442079460123",
  "whatsapp_message": "Hello Araya Veda, I''d like to book a consultation.",
  "phone_display": "+44 20 7946 0123"
}'::jsonb),
('global', 'footer', '{
  "tagline": "Holistic clinical Ayurveda — disease prevention, personalised treatment and lifestyle medicine, delivered with discretion to patients in 12 countries.",
  "badges": ["NDA Protected", "English Speaking"],
  "copyright_tagline": "Start caring for your health with us"
}'::jsonb)
ON CONFLICT (page, section) DO NOTHING;

-- =====================================================
-- SEED: portfolio_items
-- =====================================================
INSERT INTO public.portfolio_items (category, title, description, image_url, is_published, sort_order) VALUES
('Diseases', 'Panchakarma Detox', 'Five-fold purification for chronic metabolic and inflammatory conditions.', '/seed/portfolio-panchakarma.jpg', true, 0),
('Diseases', 'Autoimmune Support', 'Rheumatoid arthritis, psoriasis and thyroid recovery protocols.', '/seed/portfolio-herbs.jpg', true, 1),
('Diseases', 'Anxiety & Sleep', 'Nervous system regulation through Shirodhara and herbal sedation.', '/seed/portfolio-meditation.jpg', true, 2),
('Diet & Lifestyle', 'Dosha Diet Plans', 'Constitution-specific meal plans designed for daily, real life.', '/seed/portfolio-herbs.jpg', true, 0),
('Diet & Lifestyle', 'Daily Routine (Dinacharya)', 'Sleep, movement and breath, calibrated to your work and travel.', '/seed/portfolio-meditation.jpg', true, 1),
('Diet & Lifestyle', 'Seasonal Reset', 'Quarterly cleansing rituals for sustained metabolic clarity.', '/seed/portfolio-panchakarma.jpg', true, 2)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED: pricing_plans
-- =====================================================
INSERT INTO public.pricing_plans (name, price_label, description, features, is_featured, is_published, sort_order) VALUES
('Diagnostic Consult', 'Triage', '60 min deep-dive analysis of prakriti and current vikriti.', '[]'::jsonb, false, true, 0),
('Treatment Intensive', 'Primary Path', 'Full herbal protocol, diet plan and bi-weekly check-ins.', '[]'::jsonb, true, true, 1),
('Annual Care Plan', 'Sustained Care', 'Quarterly resets, year-round access and seasonal protocols.', '[]'::jsonb, false, true, 2)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED: testimonials
-- =====================================================
INSERT INTO public.testimonials (author_name, author_location, quote, rating, media_type, media_url, is_published, sort_order) VALUES
('Elena Richards', 'London', 'The personalised diet plan completely transformed digestion issues that modern medicine couldn''t touch.', 5, 'video', '/seed/testimonial-video.jpg', true, 0),
('Case Study #402', 'Skin Recovery', 'Clinical precision combined with a warmth I''d never experienced in healthcare before.', 5, 'photo', '/seed/testimonial-skin.jpg', true, 1)
ON CONFLICT DO NOTHING;
