-- Migration para adicionar funções RPC de estatísticas administrativas

-- 1. Obter Total de Usuários
CREATE OR REPLACE FUNCTION get_total_users()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_users integer;
BEGIN
  SELECT count(*) INTO total_users FROM auth.users;
  RETURN total_users;
END;
$$;

-- 2. Obter GMV Total (Gross Merchandise Volume)
CREATE OR REPLACE FUNCTION get_total_gmv()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_gmv numeric;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total_gmv 
  FROM public.transactions 
  WHERE payment_status = 'paid';
  RETURN total_gmv;
END;
$$;

-- 3. Obter Receita Total (ex: 10% do GMV como taxa da plataforma DAIG)
CREATE OR REPLACE FUNCTION get_total_revenue()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_revenue numeric;
BEGIN
  SELECT COALESCE(SUM(amount * 0.10), 0) INTO total_revenue 
  FROM public.transactions 
  WHERE payment_status = 'paid';
  RETURN total_revenue;
END;
$$;

-- Concede acesso de execução para usuários autenticados (opcional, dependendo de como as RLS estão configuradas)
GRANT EXECUTE ON FUNCTION get_total_users() TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_gmv() TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_revenue() TO authenticated;
