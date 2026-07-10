# Cansado → Lendário

Site do sorteio do projecto Cansado → Lendário. Next.js + Neon Postgres.
Deploy no Vercel, como os teus outros projectos.

---

## Pôr no ar (5 passos, ~10 minutos)

### 1. Base de dados na Neon
- Vai a **neon.tech**, cria um projecto.
- Botão **Connect** → copia a **Pooled connection string** (tem `-pooler` no host).

### 2. Código no GitHub
- Cria um repositório e carrega esta pasta.

### 3. Deploy no Vercel
- **vercel.com** → New Project → importa o repositório.
- O Vercel detecta Next.js sozinho. Não mexas em nada.

### 4. Variáveis de ambiente (no Vercel, antes do primeiro deploy)
No ecrã de importação, secção **Environment Variables**, cola:

| Nome | Valor |
|---|---|
| `DATABASE_URL` | a connection string da Neon (passo 1) |
| `HASH_SECRET` | corre `openssl rand -hex 32` no terminal e cola o resultado |

Carrega em **Deploy**. Em ~1 minuto está no ar.

### 5. Criar as tabelas
Uma vez, depois do deploy. No teu terminal, na pasta do projecto:

```bash
# usa a connection string DIRECTA da Neon (sem -pooler) para este comando
DATABASE_URL="postgres://...sem-pooler..." npm run db:setup
```

Isto cria as tabelas e regista os dois parceiros (Fuel Injection, The Shine).

**Pronto.** O site está no ar no domínio que o Vercel te deu.

---

## Ligar o teu subdomínio (quando quiseres)
- Vercel → Settings → Domains → `lendario.fuelinjectiontech.com`.
- O Vercel dá-te um CNAME. Adiciona-o no teu DNS.
- HTTPS automático.

---

## O que já funciona

- **Landing** — o site, com a foto do carro, os passos e os parceiros.
- **Registo** — `/registar`. Alguém com um voucher regista-o e recebe o bilhete.
- **QR / link** — `/r/{codigo}` leva ao formulário com o código já preenchido.
- **API** — `/api/registar`, `/api/health`, `/api/live/contador`.

A garantia central está no sítio certo (na base de dados): um código só pode
gerar **uma** entrada, mesmo que duas pessoas o registem no mesmo instante.

## O que falta (próximos passos)

- Email de confirmação e área "as minhas entradas"
- Painel de administração
- Portal do parceiro (emitir vouchers em PDF)
- Página `/live` e motor do sorteio

---

## Correr localmente (opcional)

```bash
npm install
# cria um ficheiro .env com DATABASE_URL e HASH_SECRET (ver .env.example)
npm run dev
```

Abre http://localhost:3000
