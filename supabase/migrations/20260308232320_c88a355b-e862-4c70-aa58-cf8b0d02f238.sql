
-- Assets table
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'hardware',
  department text NOT NULL DEFAULT '',
  owner text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  criticality text NOT NULL DEFAULT 'medium',
  location text NOT NULL DEFAULT '',
  last_audit_date text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own assets" ON public.assets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own assets" ON public.assets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own assets" ON public.assets FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own assets" ON public.assets FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Risks table
CREATE TABLE public.risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'operational',
  asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  probability integer NOT NULL DEFAULT 3,
  impact integer NOT NULL DEFAULT 3,
  mitigation_strategy text NOT NULL DEFAULT '',
  owner text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  regulatory_ref text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own risks" ON public.risks FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own risks" ON public.risks FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own risks" ON public.risks FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own risks" ON public.risks FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Incidents table
CREATE TABLE public.incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT '',
  reported_by text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'medium',
  asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  risk_id uuid REFERENCES public.risks(id) ON DELETE SET NULL,
  assigned_to text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  regulatory_impact text NOT NULL DEFAULT '',
  deadline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own incidents" ON public.incidents FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own incidents" ON public.incidents FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own incidents" ON public.incidents FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own incidents" ON public.incidents FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Audits table
CREATE TABLE public.audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  scope text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'internal',
  auditor text NOT NULL DEFAULT '',
  start_date text NOT NULL DEFAULT '',
  end_date text NOT NULL DEFAULT '',
  findings text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
  linked_incidents text[] NOT NULL DEFAULT '{}',
  linked_risks text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own audits" ON public.audits FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own audits" ON public.audits FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own audits" ON public.audits FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own audits" ON public.audits FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Compliance table
CREATE TABLE public.compliance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'sa_law',
  department text NOT NULL DEFAULT '',
  owner text NOT NULL DEFAULT '',
  enforcement text NOT NULL DEFAULT '',
  consequences text NOT NULL DEFAULT '',
  last_reviewed text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'under_review',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.compliance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own compliance" ON public.compliance FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own compliance" ON public.compliance FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own compliance" ON public.compliance FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own compliance" ON public.compliance FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Actions table
CREATE TABLE public.actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  related_type text NOT NULL DEFAULT 'risk',
  related_id text NOT NULL DEFAULT '',
  assigned_to text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'medium',
  start_date text NOT NULL DEFAULT '',
  due_date text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  notes text NOT NULL DEFAULT '',
  estimated_impact_of_delay text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own actions" ON public.actions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own actions" ON public.actions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own actions" ON public.actions FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own actions" ON public.actions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Performance KPIs table
CREATE TABLE public.performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  department text NOT NULL DEFAULT '',
  target numeric NOT NULL DEFAULT 0,
  actual numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT '',
  responsible text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'on_track',
  linked_risk_ids text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own performance" ON public.performance FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own performance" ON public.performance FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own performance" ON public.performance FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own performance" ON public.performance FOR DELETE TO authenticated USING (user_id = auth.uid());
