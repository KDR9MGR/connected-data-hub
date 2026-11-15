-- Swāstha rebrand + contact clean-up
--   * contact email is now info@swastha.org.in
--   * no phone / WhatsApp number is shown on the site any more (email only)
--   * the home-page contact blurb no longer points people to WhatsApp
-- Idempotent: safe to run more than once.

UPDATE public.page_content
SET content = (content - 'whatsapp_number' - 'whatsapp_message' - 'phone_display')
              || jsonb_build_object('email', 'info@swastha.org.in'),
    updated_at = now()
WHERE page = 'global' AND section = 'contact';

-- In case the row was never seeded
INSERT INTO public.page_content (page, section, content)
VALUES ('global', 'contact', jsonb_build_object('email', 'info@swastha.org.in'))
ON CONFLICT (page, section) DO NOTHING;

UPDATE public.page_content
SET content = jsonb_set(
      content,
      '{body}',
      to_jsonb('Fill out the form for a confidential assessment, or email us directly and our team will get back to you.'::text)
    ),
    updated_at = now()
WHERE page = 'home'
  AND section = 'contact'
  AND content->>'body' ILIKE '%whatsapp%';
