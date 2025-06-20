
-- Criar enum para roles do sistema
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Criar tabela para gerenciar roles dos usuários
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Criar função para verificar se usuário tem um role específico
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Políticas RLS para user_roles
CREATE POLICY "Admins can view all user roles" 
  ON public.user_roles FOR SELECT 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert user roles" 
  ON public.user_roles FOR INSERT 
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update user roles" 
  ON public.user_roles FOR UPDATE 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete user roles" 
  ON public.user_roles FOR DELETE 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Criar função para admins criarem usuários
CREATE OR REPLACE FUNCTION public.admin_create_user(
  email TEXT,
  password TEXT,
  user_name TEXT DEFAULT NULL,
  user_role app_role DEFAULT 'user'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('error', 'Acesso negado. Apenas administradores podem criar usuários.');
  END IF;

  -- Criar usuário via auth (isso requer privilégios especiais)
  -- Por enquanto, retornamos instruções para o frontend fazer via Supabase Auth Admin
  RETURN json_build_object(
    'success', true,
    'message', 'Use Supabase Auth Admin API para criar usuário'
  );
END;
$$;

-- Tornar o usuário atual (resumovetorial@gmail.com) um administrador
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'resumovetorial@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Trigger para atualizar updated_at em user_roles
CREATE TRIGGER user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
