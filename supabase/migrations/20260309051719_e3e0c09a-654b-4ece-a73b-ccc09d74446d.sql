CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email_enabled boolean NOT NULL DEFAULT false,
  critical_incidents boolean NOT NULL DEFAULT true,
  overdue_actions boolean NOT NULL DEFAULT true,
  compliance_reviews boolean NOT NULL DEFAULT true,
  high_risks boolean NOT NULL DEFAULT true,
  due_soon_days integer NOT NULL DEFAULT 3,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON public.notification_preferences
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own preferences" ON public.notification_preferences
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own preferences" ON public.notification_preferences
  FOR UPDATE TO authenticated USING (user_id = auth.uid());