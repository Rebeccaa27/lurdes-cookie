# 🍪 Lurdes Cookie — Sistema de Gestão

App web para gerenciar vendas, dívidas, estoque e receitas do negócio de cookies.

## Stack

- **React 18** + **Vite**
- **Tailwind CSS** — estilização utilitária
- **Framer Motion** — animações suaves
- **React Router v6** — navegação
- **Supabase** — banco de dados + autenticação

---

## Como rodar

### 1. Pré-requisitos

- Node.js 18+
- Conta gratuita no [Supabase](https://supabase.com)

### 2. Clonar e instalar

```bash
cd lurdes-cookie
npm install
```

### 3. Configurar o Supabase

1. Crie um projeto em [supabase.com/dashboard](https://supabase.com/dashboard)
2. Vá em **Settings → API** e copie a URL e a `anon key`
3. Crie o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

### 4. Criar as tabelas no banco

1. No painel do Supabase, abra o **SQL Editor**
2. Cole o conteúdo do arquivo `supabase_schema.sql`
3. Clique em **Run**

### 5. Criar usuário de acesso

No painel do Supabase → **Authentication → Users → Add user**  
Ou via SQL:

```sql
-- No SQL Editor do Supabase
select auth.create_user(
  email    := 'seu@email.com',
  password := 'sua_senha_segura'
);
```

### 6. Rodar o projeto

```bash
npm run dev
```

Acesse: [http://localhost:5173](http://localhost:5173)

---

## Estrutura do projeto

```
lurdes-cookie/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env                        ← suas credenciais (não commitar!)
├── supabase_schema.sql         ← script de criação das tabelas
├── src/
│   ├── main.jsx
│   ├── App.jsx                 ← rotas + layout principal
│   ├── index.css               ← Tailwind + estilos globais
│   ├── lib/
│   │   ├── supabaseClient.js   ← cliente Supabase
│   │   ├── receitas.js         ← dados de receitas e ingredientes
│   │   ├── hooks.js            ← hooks reutilizáveis (auth, vendas, estoque)
│   │   └── utils.js            ← funções utilitárias
│   ├── components/
│   │   ├── Sidebar.jsx         ← menu lateral (desktop + mobile drawer)
│   │   ├── Header.jsx          ← cabeçalho das páginas
│   │   ├── CardResumo.jsx      ← card de métrica animado
│   │   ├── Modal.jsx           ← modal reutilizável
│   │   ├── Button.jsx          ← botão com variantes
│   │   ├── MonthNav.jsx        ← navegação de mês
│   │   ├── Badge.jsx           ← badge de status
│   │   ├── EmptyState.jsx      ← estado vazio
│   │   └── Toast.jsx           ← notificações (context + provider)
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Vendas.jsx
│   │   ├── Dividas.jsx
│   │   ├── Estoque.jsx
│   │   └── Receitas.jsx
│   └── styles/
│       ├── variables.css       ← CSS custom properties
│       └── animations.css      ← keyframes e classes utilitárias
```

---

## Funcionalidades

| Página | Funcionalidade |
|--------|---------------|
| **Dashboard** | Resumo do mês (total vendas, recebido, a receber, devedores), últimas vendas |
| **Vendas** | Registrar venda, filtro por mês, marcar como pago/fiado, deletar |
| **Dívidas** | Ver devedores agrupados, quitar individual ou tudo de uma vez |
| **Estoque** | Atualizar quantidades, calculadora de produção com o que precisa comprar |
| **Receitas** | Todos os sabores com ingredientes por lote (1-4 lotes) |

---

## Build para produção

```bash
npm run build
```

Os arquivos gerados ficam na pasta `dist/`. Pode fazer deploy em:
- [Vercel](https://vercel.com) (recomendado — conecte o repositório)
- [Netlify](https://netlify.com)
- Qualquer hosting de arquivos estáticos
