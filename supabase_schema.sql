-- ════════════════════════════════════════════════════════
-- Lurdes Cookie — Supabase Schema
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
  cliente    text        not null,
  sabor      text        not null,
  qtd        integer     not null default 1,
  valor      numeric(10,2) not null,
  pag        text        not null default 'fiado' check (pag in ('fiado', 'pago')),
  data       date        not null default current_date,
  created_at timestamptz not null default now(),
  user_id    uuid references auth.users(id) on delete cascade
);

-- Índices
create index if not exists vendas_data_idx     on vendas (data);
create index if not exists vendas_cliente_idx  on vendas (cliente);
create index if not exists vendas_pag_idx      on vendas (pag);
create index if not exists vendas_user_idx     on vendas (user_id);


-- ────────────────────────────────────────────────────────
-- TABELA: estoque
-- ────────────────────────────────────────────────────────
create table if not exists estoque (
  id           bigint generated always as identity primary key,
  ingrediente  text        not null unique,
  quantidade   numeric(10,2) not null default 0,
  updated_at   timestamptz not null default now()
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


-- ════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ════════════════════════════════════════════════════════

-- VENDAS: apenas usuários autenticados podem ler/escrever
alter table vendas enable row level security;

create policy "vendas_select" on vendas
  for select using (auth.role() = 'authenticated');

create policy "vendas_insert" on vendas
  for insert with check (auth.role() = 'authenticated');

create policy "vendas_update" on vendas
  for update using (auth.role() = 'authenticated');

create policy "vendas_delete" on vendas
  for delete using (auth.role() = 'authenticated');


-- ESTOQUE: apenas usuários autenticados
alter table estoque enable row level security;

create policy "estoque_select" on estoque
  for select using (auth.role() = 'authenticated');

create policy "estoque_insert" on estoque
  for insert with check (auth.role() = 'authenticated');

create policy "estoque_update" on estoque
  for update using (auth.role() = 'authenticated');

create policy "estoque_delete" on estoque
  for delete using (auth.role() = 'authenticated');


-- ════════════════════════════════════════════════════════
-- DADOS INICIAIS — ingredientes com estoque zerado
-- (opcional — descomente para inserir)
-- ════════════════════════════════════════════════════════

/*
insert into estoque (ingrediente, quantidade) values
  ('Amido',              0),
  ('Baunilha',           0),
  ('Bicabornato',        0),
  ('Bicarbonato',        0),
  ('Biscoito Oreo',      0),
  ('Cacau 100%',         0),
  ('Cacau black',        0),
  ('Canela em Pó',       0),
  ('Choc. Branco',       0),
  ('Chocolate branco',   0),
  ('Chocolate em pó',    0),
  ('Coco ralado',        0),
  ('Corante',            0),
  ('Cream Cheese',       0),
  ('Creme de leite',     0),
  ('Café solúvel',       0),
  ('Farinha',            0),
  ('Fermento',           0),
  ('Gotas Branca',       0),
  ('Gotas Preta',        0),
  ('Gotas Preta Branca', 0),
  ('Gotas Preta e Branca',0),
  ('Leite condensado',   0),
  ('Leite em Pó',        0),
  ('Manteiga',           0),
  ('Mascavo',            0),
  ('Moeda',              0),
  ('Nesquik',            0),
  ('Nutella',            0),
  ('Ovo',                0),
  ('Refinado',           0),
  ('Sal',                0),
  ('Vinagre',            0)
on conflict (ingrediente) do nothing;
*/
