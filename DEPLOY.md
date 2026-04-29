# Deploy do Sistema de Presença

## 1. Deploy Frontend no Vercel

### Opção A: GitHub (Recomendado)

1. Crie um repositório no GitHub
```bash
git remote add origin https://github.com/SEU_USUARIO/presenca.git
git push -u origin main
```

2. Acesse https://vercel.com
3. Clique em "Add New..." > Project
4. Importe o repositório
5. Deploy automático!

### Opção B: Vercel CLI

```bash
vercel login
vercel --prod
```

---

## 2. Configurar Variáveis de Ambiente

No Vercel, configure estas variáveis:

| Variável | Descrição | Exemplo |
|---------|-----------|--------|
| `TEGRAM_BOT_TOKEN` | Token do Bot Telegram | 123456:ABC-DEF |
| `TELEGRAM_CHAT_ID` | Seu Chat ID | 987654321 |

### Obter Token do Telegram:

1. Abra @BotFather no Telegram
2. Send `/newbot`
3. Siga as instruções
4. Copie o token

### Obter Chat ID:

1. Adicione o bot ao grupo/chat
2. Acesse `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. Copie o `chat.id` da resposta

---

## 3. Configurar Webhook

Após o deploy, configure o webhook:

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://seu-projeto.vercel.app/api/telegram"
```

---

## 4. Configurar WhatsApp (Meta Cloud API)

### Criar App na Meta:

1. Acesse developers.facebook.com
2. Crie um app tipo "Outros"
3. Adicione produto "WhatsApp"
4. Configure webhook
5. Obtenha `WHATSAPP_TOKEN` e `WHATSAPP_PHONE_ID`

### Variáveis WhatsApp:

| Variável | Descrição |
|----------|-----------|
| `WHATSAPP_TOKEN` | Temporary access token |
| `WHATSAPP_PHONE_ID` | Phone Number ID |
| `WHATSAPP_RECIPIENT` | Número que receberá msgs |

---

## 5. Fluxo Completo

```
[Organizador] → Cria evento
     ↓
[Gera QR Code] → Envia link ao participante
     ↓
[Participante] → Confirma presença
     ↓
[Check-in] → Portaria escaneia QR
     ↓
[Telegram Bot] ← Notificação
     ↓
[WhatsApp] ← Reenvia msg
```

---

## 6. URLs Úteis

- Frontend: `https://seu-projeto.vercel.app`
- API Telegram: `https://seu-projeto.vercel.app/api/telegram`
- API Notificações: `https://seu-projeto.vercel.app/api/notifications`

---

## 7. Testar

1. Acesse o frontend no celular
2. Faça login (demo@demo.com / demo)
3. Crie um evento
4. Adicione um participante
5. Clique no QR Code de portaria
6. Escaneie com o celular do participante