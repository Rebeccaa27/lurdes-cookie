-- ════════════════════════════════════════════════════════
-- BakeFlow — Novas tabelas necessárias
-- Execute no SQL Editor do Supabase
-- ════════════════════════════════════════════════════════

-- Tabela de estoque de cookies prontos
create table if not exists estoque_cookies (
  id           bigint generated always as identity primary key,
  sabor        text not null unique,
  quantidade   integer not null default 0,
  minimo       integer not null default 3,
  updated_at   timestamptz not null default now()
);

alter table estoque_cookies enable row level security;
create policy "ec_select" on estoque_cookies for select using (auth.role() = 'authenticated');
create policy "ec_insert" on estoque_cookies for insert with check (auth.role() = 'authenticated');
create policy "ec_update" on estoque_cookies for update using (auth.role() = 'authenticated');
create policy "ec_delete" on estoque_cookies for delete using (auth.role() = 'authenticated');

drop trigger if exists ec_updated_at on estoque_cookies;
create trigger ec_updated_at before update on estoque_cookies
  for each row execute function update_updated_at();


-- Tabela de status CRM mensal por cliente
create table if not exists crm_status (
  id           bigint generated always as identity primary key,
  cliente_key  text not null,
  mes          integer not null,
  ano          integer not null,
  pago         boolean not null default false,
  pago_em      timestamptz,
  unique (cliente_key, mes, ano)
);

alter table crm_status enable row level security;
create policy "crm_select" on crm_status for select using (auth.role() = 'authenticated');
create policy "crm_insert" on crm_status for insert with check (auth.role() = 'authenticated');
create policy "crm_update" on crm_status for update using (auth.role() = 'authenticated');
create policy "crm_delete" on crm_status for delete using (auth.role() = 'authenticated');


-- Tabela de preços por sabor (com histórico)
create table if not exists precos_sabores (
  id             bigint generated always as identity primary key,
  sabor          text not null unique,
  preco          numeric(10,2) not null,
  custo          numeric(10,2) not null default 0,
  atualizado_em  timestamptz not null default now()
);

alter table precos_sabores enable row level security;
create policy "ps_select" on precos_sabores for select using (auth.role() = 'authenticated');
create policy "ps_insert" on precos_sabores for insert with check (auth.role() = 'authenticated');
create policy "ps_update" on precos_sabores for update using (auth.role() = 'authenticated');
create policy "ps_delete" on precos_sabores for delete using (auth.role() = 'authenticated');


-- Habilitar Realtime nas novas tabelas
alter publication supabase_realtime add table estoque_cookies;
alter publication supabase_realtime add table crm_status;
alter publication supabase_realtime add table precos_sabores;
alter publication supabase_realtime add table vendas;
alter publication supabase_realtime add table estoque;
