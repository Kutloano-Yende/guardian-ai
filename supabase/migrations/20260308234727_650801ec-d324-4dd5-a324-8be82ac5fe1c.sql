-- Add role-based RLS policies for specialized roles

-- Risk Manager policies (Asset, Risk, Incident, Performance modules)
CREATE POLICY "Risk managers can view all assets" 
ON public.assets 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'risk_manager'));

CREATE POLICY "Risk managers can update all assets" 
ON public.assets 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'risk_manager'));

CREATE POLICY "Risk managers can insert assets" 
ON public.assets 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'risk_manager'));

CREATE POLICY "Risk managers can delete all assets" 
ON public.assets 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'risk_manager'));

-- Risk Manager - Risks table
CREATE POLICY "Risk managers can view all risks" 
ON public.risks 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'risk_manager'));

CREATE POLICY "Risk managers can update all risks" 
ON public.risks 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'risk_manager'));

CREATE POLICY "Risk managers can insert risks" 
ON public.risks 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'risk_manager'));

CREATE POLICY "Risk managers can delete all risks" 
ON public.risks 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'risk_manager'));

-- Risk Manager - Incidents table
CREATE POLICY "Risk managers can view all incidents" 
ON public.incidents 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'risk_manager'));

CREATE POLICY "Risk managers can update all incidents" 
ON public.incidents 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'risk_manager'));

CREATE POLICY "Risk managers can insert incidents" 
ON public.incidents 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'risk_manager'));

CREATE POLICY "Risk managers can delete all incidents" 
ON public.incidents 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'risk_manager'));

-- Risk Manager - Performance table
CREATE POLICY "Risk managers can view all performance" 
ON public.performance 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'risk_manager'));

CREATE POLICY "Risk managers can update all performance" 
ON public.performance 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'risk_manager'));

CREATE POLICY "Risk managers can insert performance" 
ON public.performance 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'risk_manager'));

CREATE POLICY "Risk managers can delete all performance" 
ON public.performance 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'risk_manager'));

-- Audit Manager policies (Audit, Incident, Action modules)
CREATE POLICY "Audit managers can view all audits" 
ON public.audits 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'audit_manager'));

CREATE POLICY "Audit managers can update all audits" 
ON public.audits 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'audit_manager'));

CREATE POLICY "Audit managers can insert audits" 
ON public.audits 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'audit_manager'));

CREATE POLICY "Audit managers can delete all audits" 
ON public.audits 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'audit_manager'));

-- Audit Manager - Incidents table
CREATE POLICY "Audit managers can view all incidents" 
ON public.incidents 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'audit_manager'));

CREATE POLICY "Audit managers can update all incidents" 
ON public.incidents 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'audit_manager'));

CREATE POLICY "Audit managers can insert incidents" 
ON public.incidents 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'audit_manager'));

CREATE POLICY "Audit managers can delete all incidents" 
ON public.incidents 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'audit_manager'));

-- Audit Manager - Actions table
CREATE POLICY "Audit managers can view all actions" 
ON public.actions 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'audit_manager'));

CREATE POLICY "Audit managers can update all actions" 
ON public.actions 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'audit_manager'));

CREATE POLICY "Audit managers can insert actions" 
ON public.actions 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'audit_manager'));

CREATE POLICY "Audit managers can delete all actions" 
ON public.actions 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'audit_manager'));

-- Compliance Officer policies (Compliance & Governance, Risk, Incident modules)
CREATE POLICY "Compliance officers can view all compliance" 
ON public.compliance 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Compliance officers can update all compliance" 
ON public.compliance 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Compliance officers can insert compliance" 
ON public.compliance 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Compliance officers can delete all compliance" 
ON public.compliance 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'compliance_officer'));

-- Compliance Officer - Risks table
CREATE POLICY "Compliance officers can view all risks" 
ON public.risks 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Compliance officers can update all risks" 
ON public.risks 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Compliance officers can insert risks" 
ON public.risks 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Compliance officers can delete all risks" 
ON public.risks 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'compliance_officer'));

-- Compliance Officer - Incidents table
CREATE POLICY "Compliance officers can view all incidents" 
ON public.incidents 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Compliance officers can update all incidents" 
ON public.incidents 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Compliance officers can insert incidents" 
ON public.incidents 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Compliance officers can delete all incidents" 
ON public.incidents 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'compliance_officer'));