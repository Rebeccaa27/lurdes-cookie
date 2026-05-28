-- ════════════════════════════════════════════════════════
-- Doce Controle (Lurdes Cookie) — Supabase Schema
-- Execute este arquivo no SQL Editor do Supabase
-- Painel: https://supabase.com/dashboard → SQL Editor
-- ════════════════════════════════════════════════════════

-- Habilitar extensão de UUID
create extension if not exists "pgcrypto";


-- ────────────────────────────────────────────────────────
-- TABELA: vendas
-- ────────────────────────────────────────────────────────
create table if not exists vendas (
  id         bigint generated always as identity primary key,
  cliente    text          not null,
  sabor      text          not null,
  qtd        integer       not null default 1,
  valor      numeric(10,2) not null,
  pag        text          not null default 'fiado' check (pag in ('fiado', 'pago')),
  data       date          not null default current_date,
  created_at timestamptz   not null default now(),
  user_id    uuid references auth.users(id) on delete cascade
);

create index if not exists vendas_data_idx    on vendas (data);
create index if not exists vendas_cliente_idx on vendas (cliente);
create index if not exists vendas_pag_idx     on vendas (pag);
create index if not exists vendas_user_idx    on vendas (user_id);


-- ────────────────────────────────────────────────────────
-- TABELA: estoque  (ingredientes)
-- ────────────────────────────────────────────────────────
create table if not exists estoque (
  id          bigint generated always as identity primary key,
  ingrediente text          not null unique,
  quantidade  numeric(10,2) not null default 0,
  updated_at  timestamptz   not null default now()
);

create index if not exists estoque_ing_idx on estoque (ingrediente);

-- Trigger para atualizar updated_at automaticamente
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists estoque_updated_at on estoque;
create trigger estoque_updated_at
  before update on estoque
  for each row execute function update_updated_at();


-- ────────────────────────────────────────────────────────
-- TABELA: estoque_cookies  (cookies prontos para venda)
-- ────────────────────────────────────────────────────────
create table if not exists estoque_cookies (
  id         bigint generated always as identity primary key,
  sabor      text    not null unique,
  quantidade integer not null default 0,
  minimo     integer not null default 3,
  updated_at timestamptz not null default now()
);

create index if not exists estoque_cookies_sabor_idx on estoque_cookies (sabor);

drop trigger if exists estoque_cookies_updated_at on estoque_cookies;
create trigger estoque_cookies_updated_at
  before update on estoque_cookies
  for each row execute function update_updated_at();

-- Diminui estoque de cookie automaticamente quando uma venda é registrada
create or replace function decrementar_estoque_cookie()
returns trigger as $$
begin
  update estoque_cookies
    set quantidade = greatest(quantidade - new.qtd, 0)
  where lower(sabor) = lower(new.sabor);
  return new;
end;
$$ language plpgsql;

drop trigger if exists venda_decrementa_cookie on vendas;
create trigger venda_decrementa_cookie
  after insert on vendas
  for each row execute function decrementar_estoque_cookie();


-- ────────────────────────────────────────────────────────
-- TABELA: crm_status  (controle de pagamento mensal por cliente)
-- ────────────────────────────────────────────────────────
create table if not exists crm_status (
  id          bigint generated always as identity primary key,
  cliente_key text    not null,
  mes         integer not null check (mes between 1 and 12),
  ano         integer not null,
  pago        boolean not null default false,
  pago_em     timestamptz,
  created_at  timestamptz not null default now(),
  unique (cliente_key, mes, ano)
);

create index if not exists crm_status_mes_ano_idx on crm_status (mes, ano);
create index if not exists crm_status_cliente_idx on crm_status (cliente_key);


-- ────────────────────────────────────────────────────────
-- TABELA: precos_sabores  (preços editáveis por sabor no Financeiro)
-- ────────────────────────────────────────────────────────
create table if not exists precos_sabores (
  id            bigint generated always as identity primary key,
  sabor         text          not null unique,
  preco         numeric(10,2) not null default 0,
  custo         numeric(10,2) not null default 0,
  atualizado_em timestamptz   not null default now()
);

create index if not exists precos_sabores_sabor_idx on precos_sabores (sabor);


-- ════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ════════════════════════════════════════════════════════

-- VENDAS
alter table vendas enable row level security;
create policy if not exists "vendas_select" on vendas for select using (auth.role() = 'authenticated');
create policy if not exists "vendas_insert" on vendas for insert with check (auth.role() = 'authenticated');
create policy if not exists "vendas_update" on vendas for update using (auth.role() = 'authenticated');
create policy if not exists "vendas_delete" on vendas for delete using (auth.role() = 'authenticated');

-- ESTOQUE (ingredientes)
alter table estoque enable row level security;
create policy if not exists "estoque_select" on estoque for select using (auth.role() = 'authenticated');
create policy if not exists "estoque_insert" on estoque for insert with check (auth.role() = 'authenticated');
create policy if not exists "estoque_update" on estoque for update using (auth.role() = 'authenticated');
create policy if not exists "estoque_delete" on estoque for delete using (auth.role() = 'authenticated');

-- ESTOQUE_COOKIES
alter table estoque_cookies enable row level security;
create policy if not exists "ecookies_select" on estoque_cookies for select using (auth.role() = 'authenticated');
create policy if not exists "ecookies_insert" on estoque_cookies for insert with check (auth.role() = 'authenticated');
create policy if not exists "ecookies_update" on estoque_cookies for update using (auth.role() = 'authenticated');
create policy if not exists "ecookies_delete" on estoque_cookies for delete using (auth.role() = 'authenticated');

-- CRM_STATUS
alter table crm_status enable row level security;
create policy if not exists "crm_select" on crm_status for select using (auth.role() = 'authenticated');
create policy if not exists "crm_insert" on crm_status for insert with check (auth.role() = 'authenticated');
create policy if not exists "crm_update" on crm_status for update using (auth.role() = 'authenticated');
create policy if not exists "crm_delete" on crm_status for delete using (auth.role() = 'authenticated');

-- PRECOS_SABORES
alter table precos_sabores enable row level security;
create policy if not exists "precos_select" on precos_sabores for select using (auth.role() = 'authenticated');
create policy if not exists "precos_insert" on precos_sabores for insert with check (auth.role() = 'authenticated');
create policy if not exists "precos_update" on precos_sabores for update using (auth.role() = 'authenticated');
create policy if not exists "precos_delete" on precos_sabores for delete using (auth.role() = 'authenticated');


-- ════════════════════════════════════════════════════════
-- REALTIME — habilitar para todas as tabelas usadas
-- ════════════════════════════════════════════════════════
-- Execute cada linha separadamente se necessário:
-- alter publication supabase_realtime add table vendas;
-- alter publication supabase_realtime add table estoque;
-- alter publication supabase_realtime add table estoque_cookies;
-- alter publication supabase_realtime add table crm_status;
-- alter publication supabase_realtime add table precos_sabores;


-- ════════════════════════════════════════════════════════
-- DADOS INICIAIS — ingredientes com estoque zerado
-- (opcional — descomente para inserir)
-- ════════════════════════════════════════════════════════

/*
insert into estoque (ingrediente, quantidade) values
  ('Amido',               0),
  ('Baunilha',            0),
  ('Bicarbonato',         0),
  ('Biscoito Oreo',       0),
  ('Cacau 100%',          0),
  ('Cacau black',         0),
  ('Canela em Pó',        0),
  ('Choc. Branco',        0),
  ('Chocolate em pó',     0),
  ('Coco ralado',         0),
  ('Corante',             0),
  ('Cream Cheese',        0),
  ('Creme de leite',      0),
  ('Café solúvel',        0),
  ('Farinha',             0),
  ('Fermento',            0),
  ('Gotas Branca',        0),
  ('Gotas Preta',         0),
  ('Gotas Preta e Branca',0),
  ('Leite condensado',    0),
  ('Leite em Pó',         0),
  ('Manteiga',            0),
  ('Mascavo',             0),
  ('Nesquik',             0),
  ('Nutella',             0),
  ('Ovo',                 0),
  ('Refinado',            0),
  ('Sal',                 0),
  ('Vinagre',             0)
on conflict (ingrediente) do nothing;
*/
