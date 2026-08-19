-- =====================================================
-- TREATMENT / CONDITION ITEMS (replaces the flat JSON
-- "items" lists in page_content for treatment,
-- diet-lifestyle and disease-prevention)
-- =====================================================
CREATE TABLE public.treatment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  body TEXT,
  pages TEXT[] NOT NULL DEFAULT '{}',
  media_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.treatment_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.treatment_items TO authenticated;
GRANT ALL ON public.treatment_items TO service_role;
ALTER TABLE public.treatment_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published treatment items readable" ON public.treatment_items FOR SELECT USING (is_published = true);
CREATE POLICY "Editors manage treatment items" ON public.treatment_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'editor')) WITH CHECK (public.has_role(auth.uid(), 'editor'));

CREATE TRIGGER trg_treatment_items_updated BEFORE UPDATE ON public.treatment_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_treatment_items_pages ON public.treatment_items USING gin (pages);

-- Migrate the current flat item lists into real rows
INSERT INTO public.treatment_items (title, description, pages, sort_order) VALUES
('Panchakarma Detoxification', 'Fivefold purification therapy to eliminate deep metabolic toxins and restore cellular intelligence.', ARRAY['treatment'], 0),
('Rasayana Rejuvenation', 'Immune-boosting protocols using rare herbs to halt degenerative processes and enhance longevity.', ARRAY['treatment'], 1),
('Shirodhara & Nervous System Care', 'Continuous warm-oil therapies for anxiety, insomnia and burnout recovery.', ARRAY['treatment'], 2),
('Joint & Autoimmune Programmes', 'Targeted internal and external care for rheumatoid arthritis, psoriasis and thyroid imbalance.', ARRAY['treatment'], 3),
('Digestive Restoration', 'IBS, acidity and gut microbiome rebuilding through Agni-led protocols.', ARRAY['treatment'], 4),
('Post-illness Recovery', 'Structured recovery from long-COVID, chemotherapy and chronic fatigue states.', ARRAY['treatment'], 5),
('Dosha-Aligned Nutrition', 'Meal frameworks built to your constitution, climate, and weekly schedule.', ARRAY['diet-lifestyle'], 0),
('Daily Routine (Dinacharya)', 'Sleep, movement, breath, and meal timing that compound over months.', ARRAY['diet-lifestyle'], 1),
('Seasonal Rituals (Ritucharya)', 'Quarterly shifts in diet and herbs to match your environment.', ARRAY['diet-lifestyle'], 2),
('Mindful Movement', 'Yoga, pranayama and walking practices integrated into work-day reality.', ARRAY['diet-lifestyle'], 3),
('Travel & Work Protocols', 'Plans designed for frequent travellers, founders and shift workers.', ARRAY['diet-lifestyle'], 4),
('Family & Children', 'Gentle constitutional guidance for childhood immunity and family kitchens.', ARRAY['diet-lifestyle'], 5),
('Constitutional Mapping', 'A full prakriti assessment to identify the imbalances most likely to take root in your body.', ARRAY['disease-prevention'], 0),
('Immune Foundations', 'Daily herbal regimens and breath practice to strengthen Ojas and defend against seasonal flux.', ARRAY['disease-prevention'], 1),
('Metabolic Alignment', 'Targeted plans for Agni, blood sugar regulation and inflammation control.', ARRAY['disease-prevention'], 2),
('Seasonal Resets', 'Quarterly cleansing rituals to clear accumulated toxins and recalibrate the nervous system.', ARRAY['disease-prevention'], 3)
ON CONFLICT DO NOTHING;

-- The old flat "items" JSON sections are superseded by treatment_items above
DELETE FROM public.page_content WHERE (page, section) IN (
  ('treatment', 'items'), ('diet-lifestyle', 'items'), ('disease-prevention', 'items')
);

-- =====================================================
-- SEED: editable Concern categories (used by the contact
-- form and as a category picker for treatment items)
-- =====================================================
INSERT INTO public.page_content (page, section, content) VALUES
('global', 'concerns', '{
  "items": [
    "Digestive Health (IBS, Acidity)",
    "Chronic Pain & Arthritis",
    "Skin Disorders (Psoriasis, Eczema)",
    "Mental Wellness & Sleep",
    "Metabolic & Diabetes",
    "Autoimmune Support",
    "Preventative & Lifestyle"
  ]
}'::jsonb)
ON CONFLICT (page, section) DO NOTHING;

-- =====================================================
-- SEED: Theme (accent/background colors + heading font)
-- =====================================================
INSERT INTO public.page_content (page, section, content) VALUES
('global', 'theme', '{
  "accent_color": "#4a6355",
  "background_color": "#fafaf6",
  "heading_font": "Cormorant Garamond"
}'::jsonb)
ON CONFLICT (page, section) DO NOTHING;
