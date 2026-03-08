
-- Admin policies for assets
CREATE POLICY "Admins can view all assets" ON public.assets FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all assets" ON public.assets FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete all assets" ON public.assets FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for risks
CREATE POLICY "Admins can view all risks" ON public.risks FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all risks" ON public.risks FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete all risks" ON public.risks FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for incidents
CREATE POLICY "Admins can view all incidents" ON public.incidents FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all incidents" ON public.incidents FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete all incidents" ON public.incidents FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for audits
CREATE POLICY "Admins can view all audits" ON public.audits FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all audits" ON public.audits FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete all audits" ON public.audits FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for compliance
CREATE POLICY "Admins can view all compliance" ON public.compliance FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all compliance" ON public.compliance FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete all compliance" ON public.compliance FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for actions
CREATE POLICY "Admins can view all actions" ON public.actions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all actions" ON public.actions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete all actions" ON public.actions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for performance
CREATE POLICY "Admins can view all performance" ON public.performance FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all performance" ON public.performance FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete all performance" ON public.performance FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
