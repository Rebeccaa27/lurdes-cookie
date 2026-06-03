-- ============================================================
-- CHAT + AUTOMAÇÃO N8N — Setup Supabase
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- 1. Tabela de conversas
CREATE TABLE IF NOT EXISTS public.conversas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_key   text NOT NULL,
  cliente_nome  text NOT NULL,
  telefone      text DEFAULT '',
  status        text NOT NULL DEFAULT 'aberta'
                  CHECK (status IN ('aberta','automacao','finalizada')),
  nao_lida      boolean NOT NULL DEFAULT false,
  criado_em     timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

-- 2. Tabela de mensagens
CREATE TABLE IF NOT EXISTS public.mensagens (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversa_id  uuid NOT NULL REFERENCES public.conversas(id) ON DELETE CASCADE,
  texto        text NOT NULL,
  origem       text NOT NULL DEFAULT 'manual'
                 CHECK (origem IN ('bot','manual','cliente')),
  lida         boolean NOT NULL DEFAULT false,
  criado_em    timestamptz NOT NULL DEFAULT now()
);

-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_conversas_cliente_key ON public.conversas(cliente_key);
CREATE INDEX IF NOT EXISTS idx_conversas_status      ON public.conversas(status);
CREATE INDEX IF NOT EXISTS idx_mensagens_conversa    ON public.mensagens(conversa_id);

-- 4. Trigger: atualiza atualizado_em ao inserir mensagem
CREATE OR REPLACE FUNCTION update_conversa_atualizado_em()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.conversas
  SET atualizado_em = now(), nao_lida = true
  WHERE id = NEW.conversa_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mensagem_inserted ON public.mensagens;
CREATE TRIGGER trg_mensagem_inserted
  AFTER INSERT ON public.mensagens
  FOR EACH ROW EXECUTE FUNCTION update_conversa_atualizado_em();

-- 5. RLS (Row Level Security) — ajuste conforme sua política
ALTER TABLE public.conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_conversas" ON public.conversas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_mensagens" ON public.mensagens
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mensagens;

-- ============================================================
-- PRONTO! Depois configure no .env:
--   VITE_N8N_COBRANCA_URL=https://seu-n8n.app/webhook/cobranca
--   VITE_N8N_PAGAMENTO_URL=https://seu-n8n.app/webhook/pagamento
-- ============================================================
