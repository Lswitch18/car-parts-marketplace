-- Cibersegurança: Mitigação de SECURITY DEFINER bypass (CrewAI SecOps)
-- Aplica o Security Invoker para garantir que o RLS seja respeitado

ALTER VIEW public.admin_profiles SET (security_invoker = true);
ALTER VIEW public.my_profile SET (security_invoker = true);
