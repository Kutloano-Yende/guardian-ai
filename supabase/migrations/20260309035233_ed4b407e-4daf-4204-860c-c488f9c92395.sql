
CREATE TABLE public.ai_chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_message text NOT NULL,
  ai_response text NOT NULL,
  context_module text DEFAULT 'general',
  user_role text DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_chat_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat logs" ON public.ai_chat_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat logs" ON public.ai_chat_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all chat logs" ON public.ai_chat_logs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
