# Sistema de Presença PWA

## Repositório
**GitHub:** https://github.com/cmsinformatica/presenca

---

## Stack Tecnológico
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS
- **Backend:** Vercel Serverless Functions
- **Database:** NeonDB (PostgreSQL)
- **Estado:** Zustand
- **QR Code:** qrcode.react + html5-qrcode

---

## Variáveis de Ambiente (Vercel)

| Variável | Valor |
|---------|-------|
| DATABASE_URL | postgresql://neondb_owner:npg_xxx@ep-xxx.neon.tech/neondb?sslmode=require |
| TELEGRAM_BOT_TOKEN | (Token do @BotFather) |
| TELEGRAM_CHAT_ID | (Seu Chat ID) |

---

## Login

| Campo | Valor |
|-------|-------|
| Email | admin@presenca.com |
| Senha | admin123 |

---

## Fluxo Completo

### 1. Admin cria evento
- Acesse https://[projeto].vercel.app
- Login → Dashboard → "+" → Cria evento

### 2. Admin adiciona participantes
- No evento → "+" → Adiciona (nome + telefone)

### 3. Admin gera link geral
- No evento → Botão copied → Link: `https://[projeto].vercel.app/e/[eventoId]`
- Compartilha no grupo WhatsApp

### 4. Participante confirma
- Acessa o link `/e/[eventoId]`
- Vê dados do evento
- Digita: **nome** + **telefone**
- Clica "Confirmar Presença"
- **Recebe QR Code** para entrada

### 5. Check-in na portaria
- Admin → Portaria
- Escaneia QR do participante
- Valida entrada

### 6. Admin recebe notificação
- No Telegram: nome + telefone do participante confirmado

---

## APIs

| Endpoint | Método | Função |
|----------|--------|--------|
| `/api/login` | POST | Login |
| `/api/eventos` | GET/POST | Listar/Criar eventos |
| `/api/evento?id=` | GET | Buscar evento |
| `/api/participantes?eventoId=` | GET/POST | Participantes |
| `/api/confirmar` | POST | Confirmar presença |
| `/api/checkin` | POST | Check-in portaria |
| `/api/notifications` | POST | Telegram |

---

## Páginas

| Rota | Proteção | Descrição |
|------|----------|----------|
| `/login` | ❌ | Login admin |
| `/dashboard` | ✅ | Lista eventos |
| `/evento/:id` | ✅ | Detalhes evento |
| `/portaria` | ✅ | Scanner check-in |
| `/e/:eventoId` | ❌ | **Página pública de confirmação** |
| `/p/:qrCode` | ❌ | QR code participante |

---

##-build
```bash
npm run build
```

## Deploy
-Automatico no Vercel ao fazer push no GitHub

---

## Status: ✅ Implementado e funcionando