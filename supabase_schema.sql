-- =====================================================================
-- K-CINE - ESQUEMA DO BANCO DE DADOS SUPABASE
-- =====================================================================
-- Instruções:
-- 1. Acesse o painel do Supabase (https://supabase.com/dashboard)
-- 2. Selecione seu projeto e clique em "SQL Editor" no menu lateral
-- 3. Cole todo este código e clique em "Run" (Executar)
-- =====================================================================

-- 1. Criação da Tabela de Clientes e Usuários
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'cliente',       -- 'admin' ou 'cliente'
    status TEXT NOT NULL DEFAULT 'ativo',       -- 'ativo' ou 'bloqueado'
    notes TEXT DEFAULT '',                      -- Notas, ex: 'Plano Mensal - Vencimento 30/11'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices para busca ultra-rápida de login
CREATE INDEX IF NOT EXISTS idx_clientes_username ON public.clientes (username);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON public.clientes (status);

-- 3. Habilitação de RLS (Row Level Security)
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Acesso para a chave pública (anon)
-- Permite leitura para verificação de login e listagem pela central
DROP POLICY IF EXISTS "Permitir leitura anonima de clientes" ON public.clientes;
CREATE POLICY "Permitir leitura anonima de clientes"
ON public.clientes FOR SELECT
TO anon, authenticated
USING (true);

-- Permite inserção de novos clientes criados pelo Admin
DROP POLICY IF EXISTS "Permitir criacao de clientes" ON public.clientes;
CREATE POLICY "Permitir criacao de clientes"
ON public.clientes FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Permite atualizar status (bloquear/desbloquear) e senhas
DROP POLICY IF EXISTS "Permitir atualizacao de clientes" ON public.clientes;
CREATE POLICY "Permitir atualizacao de clientes"
ON public.clientes FOR UPDATE
TO anon, authenticated
USING (true);

-- Permite exclusão de clientes
DROP POLICY IF EXISTS "Permitir exclusao de clientes" ON public.clientes;
CREATE POLICY "Permitir exclusao de clientes"
ON public.clientes FOR DELETE
TO anon, authenticated
USING (true);

-- 5. Cadastro do Administrador Principal (Kaynã)
INSERT INTO public.clientes (username, password, role, status, notes)
VALUES 
    ('Kaynã', '102587', 'admin', 'ativo', 'Kaynã - Proprietário & Administrador Geral do K-Cine')
ON CONFLICT (username) DO UPDATE 
SET password = '102587', role = 'admin', status = 'ativo';
