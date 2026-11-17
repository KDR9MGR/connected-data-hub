-- =====================================================
-- INBOX E-MAIL: every new enquiry (contact_submissions) and every
-- shop order (product_orders) is e-mailed to the clinic inbox
-- (info@swastha.org.in) through Resend.
--
-- Flow:  AFTER INSERT trigger -> pg_net HTTP call -> Edge Function
--        "notify-inbox" (supabase/functions/notify-inbox), which reads the
--        row with the service role, sends the mail and stamps notified_at.
--
-- The Resend API key is a Supabase secret (RESEND_API_KEY or RESEND_API);
-- it is never stored in this repository or in the database.
-- Idempotent: safe to run more than once.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pg_net;

-- ---------- delivery status, shown as a small tag in the admin panel ----------
ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notify_error TEXT;

ALTER TABLE public.product_orders
  ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notify_error TEXT;

-- Visitors insert these rows anonymously, so make sure they cannot pre-set the delivery state
-- (e.g. to suppress the e-mail for their own message).
CREATE OR REPLACE FUNCTION public.reset_notify_state()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.notified_at := NULL;
  NEW.notify_error := NULL;
  RETURN NEW;
END;
$$;

-- Queues one HTTP call to the Edge Function. It runs after the row is committed, and a failure to
-- queue the call must never stop the visitor's enquiry/order from being saved.
CREATE OR REPLACE FUNCTION public.notify_inbox()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://httpnqqiqcghjrmumnwi.supabase.co/functions/v1/notify-inbox',
    body := jsonb_build_object('table', TG_TABLE_NAME, 'id', NEW.id),
    headers := jsonb_build_object('Content-Type', 'application/json'),
    timeout_milliseconds := 10000
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_inbox: could not queue the e-mail for % %: %', TG_TABLE_NAME, NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_inbox() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reset_notify_state() FROM PUBLIC, anon, authenticated;

-- ---------- contact_submissions ----------
DROP TRIGGER IF EXISTS trg_contact_reset_notify ON public.contact_submissions;
CREATE TRIGGER trg_contact_reset_notify BEFORE INSERT ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.reset_notify_state();

DROP TRIGGER IF EXISTS trg_contact_notify_inbox ON public.contact_submissions;
CREATE TRIGGER trg_contact_notify_inbox AFTER INSERT ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.notify_inbox();

-- ---------- product_orders ----------
DROP TRIGGER IF EXISTS trg_orders_reset_notify ON public.product_orders;
CREATE TRIGGER trg_orders_reset_notify BEFORE INSERT ON public.product_orders
  FOR EACH ROW EXECUTE FUNCTION public.reset_notify_state();

DROP TRIGGER IF EXISTS trg_orders_notify_inbox ON public.product_orders;
CREATE TRIGGER trg_orders_notify_inbox AFTER INSERT ON public.product_orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_inbox();
