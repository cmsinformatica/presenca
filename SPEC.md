# SPEC - Sistema de Presença PWA

## 1. Stack Tecnológico

### Frontend
- **Framework:** React 18 com TypeScript
- **Build Tool:** Vite
- **PWA:** vite-plugin-pwa (Workbox)
- **QR Code:** qrcode.react (gerar), html5-qrcode (ler)
- **Estilização:** Tailwind CSS
- **Ícones:** Lucide React
- **Charts:** Recharts

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Database:** SQLite (Better-SQLite3) para MVP
- **ORM:** Prisma
- **Auth:** JWT simples
- **Email:** Nodemailer (SMTP)

### Infraestrutura
- **Hospedagem:** Vercel (frontend) + Render ou Fly.io (backend)
- **Domínio:** Próprio com SSL automático

---

## 2. Estrutura de Diretórios

```
presenca/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ui/             # Componentes base (Button, Input, Card)
│   │   ├── qr/             # Componentes QR Code
│   │   └── layout/         # Layout containers
│   ├── pages/               # Páginas da aplicação
│   │   ├── organizer/      # Dashboard organizador
│   │   ├── participant/    # Confirmação participante
│   │   └── portaria/       # Interface portaria
│   ├── hooks/              # Custom hooks
│   ├── lib/                 # Utilitários
│   │   ├── api.ts          # Client API
│   │   ├── utils.ts       # Funções auxiliares
│   │   └── storage.ts     # LocalStorage wrapper
│   ├── stores/             # Estado global (Zustand)
│   ├── types/              # TypeScript interfaces
│   ├── data/               # Dados estáticos
│   └── styles/             # Arquivos CSS
├── server/                  # Backend
│   ├── src/
│   │   ├── routes/        # Endpoints API
│   │   ├── services/      # Lógica de negócio
│   │   ├── middleware/    # Middlewares auth
│   │   └── utils/         # Utilitários server
│   ├── prisma/
│   │   └── schema.prisma  # Schema Banco
│   └── package.json
├── public/
│   ├── icons/             # Ícones PWA
│   └── manifest.json      # Web manifest
├── index.html
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## 3. Modelo de Dados

### Banco de Dados (Prisma/SQLite)

```prisma
// schema.prisma

model Evento {
  id            String   @id @default(cuid())
  nome          String
  descricao     String?
  data          DateTime
  horario       String
  local         String
  organizadorId String
  criadoEm      DateTime @default(now())
  atualizadoEm DateTime @updatedAt
  
  participantes Participante[]
  checkins      CheckIn[]
}

model Participante {
  id          String   @id @default(cuid())
  nome        String
  email       String   @unique
  telefone    String?
  eventoId    String
  qrCode      String   @unique
  confirmado  Boolean  @default(false)
  confirmadoEm DateTime?
  criadoEm    DateTime @default(now())
  
  evento      Evento   @relation(fields: [eventoId], references: [id])
  checkins    CheckIn[]
}

model CheckIn {
  id            String   @id @default(cuid())
  participanteId String
  eventoId       String
  verificadoPor  String   @default("portaria")
  timestamp     DateTime @default(now())
  local         String?
  ip           String?
  
  participante  Participante @relation(fields: [participanteId], references: [id])
  evento        Evento       @relation(fields: [eventoId], references: [id])
}
```

---

## 4. API Endpoints

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/auth/login | Login organizadors |
| POST | /api/auth/register | Cadastrar organizador |
| GET | /api/auth/me | Dados do organizador |

### Eventos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/eventos | Listar eventos do org |
| POST | /api/eventos | Criar evento |
| GET | /api/eventos/:id | Detalhes do evento |
| PUT | /api/eventos/:id | Editar evento |
| DELETE | /api/eventos/:id | Excluir evento |

### Participantes
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/eventos/:id/participantes | Lista participantes |
| POST | /api/eventos/:id/participantes | Adicionar participante |
| POST | /api/eventos/:id/importar | Importar CSV |
| POST | /api/eventos/:id/enviar-links | Enviar emails |
| POST | /api/participantes/:id/cancelar | Cancelar confirmação |

### Check-in (Portaria)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/checkin | Validar QR Code |
| GET | /api/eventos/:id/stats | Estatísticas em tempo real |
| GET | /api/eventos/:id/exportar | Exportar relatório |

### Participante (Público)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /p/:qrCode | Página de confirmação |
| POST | /p/:qrCode/confirmar | Confirmar presença |
| GET | /p/:qrCode/qrcode | Obter QR Code |

---

## 5. Componentes UI

### Componentes Base
- `Button` - Botão primário/secundário/outline
- `Input` - Campo de texto com label
- `Card` - Container com shadow
- `Badge` - Status indicator
- `Modal` - Dialog overlay
- `Toast` - Notificação temporária
- `Loader` - Spinner de loading
- `EmptyState` - Estado vazio

### Componentes QR
- `QRCodeGenerator` - Gera QR Code (qrcode.react)
- `QRCodeScanner` - Lê QR Code (html5-qrcode)
- `QRCodeDisplay` - Exibe em tela cheia

---

## 6. Fluxos de Tela

### 6.1 Tela Login/Cadastro
```
┌─────────────────────────┐
│  [Logo]                  │
│                         │
│  Entrar                  │
│  └─ Email ─┐            │
│  └─ Senha ─┘            │
│                         │
│  [Entrar]                │
│                         │
│  Não tem conta? Criar    │
└─────────────────────────┘
```

### 6.2 Dashboard Organizador
```
┌─────────────────────────┐
│  │ Meu Eventos      [+] │
├─────────────────────────┤
│  ┌──────┐ ┌──────┐      │
│  │Card │ │Card │      │
│  │Ev.1 │ │Ev.2 │      │
│  │ 📊  │ │ 📊  │      │
│  └──────┘ └──────┘      │
│                         │
│  Lista de Eventos        │
│  - Workshop TI   [•••]  │
│  - Palestra UX   [•••]  │
└─────────────────────────┘
```

### 6.3 Detalhes do Evento
```
┌─────────────────────────┐
│  ← Workshop TI         │
├─────────────────────────┤
│  📅 15/05/2026 • 14:00  │
│  📍 Auditório Principal │
│                         │
│  ┌─────────────────┐   │
│  │   ESTATÍSTICAS   │   │
│  │  45/50  │  38    │   │
│  │Confirm│Comparec │   │
│  └─────────────────┘   │
│                         │
│  [Importar] [Enviar]    │
│  [Exportar] [QR Port.] │
│                         │
│  PARTICIPANTES          │
│  ├─ João Silva    [✓]   │
│  ├─ Maria Sou... [ ]    │
│  └─ Pedro Santos [✓]   │
└─────────────────────────┘
```

### 6.4 Confirmação Participante (Mobile)
```
┌─────────────────────────┐
│  ✓ Confirmado!          │
│                         │
│    ┌───────────┐        │
│    │           │        │
│    │  QR CODE  │  ← Full │
│    │           │    Screen │
│    │           │        │
│    └───────────┘        │
│                         │
│  Workshop TI            │
│  15/05 às 14:00         │
│  Auditório Principal    │
│                         │
│  [Salvar na Galeria]    │
└─────────────────────────┘
```

### 6.5 Interface Portaria (Mobile)
```
┌─────────────────────────┐
│     ESCANEAR QR         │
│                         │
│  ┌─────────────────┐   │
│  │                 │   │
│  │    [📷 Camera] │   │
│  │                 │   │
│  └─────────────────┘   │
│                         │
│  │ QR Code será    │   │
│  │shown here       │   │
│                         │
│  ✋ Aponte para o QR    │
└─────────────────────────┘
```

### 6.6 Sucesso Check-in (Portaria)
```
┌─────────────────────────┐
│       ✓✓✓               │
│      SUCESSO            │
│                         │
│    João Silva           │
│    joao@email.com       │
│                         │
│    14:02 - 15/05        │
│                         │
│    [ Próximo ]          │
└─────────────────────────┘
```

---

## 7. QR Code Strategy

### Estrutura do QR Code
```
{
  "t": "P",           // Type: P = Presença
  "e": "evento_123",  // Event ID
  "p": "partic_456",  // Participante ID
  "h": "hash_md5"     // Hash de validação
}
```

### Validação Backend
```typescript
function validarQRCode(qrData: string, eventoId: string): boolean {
  const data = JSON.parse(qrData);
  
  // Verificar tipo
  if (data.t !== 'P') return false;
  
  // Verificar evento
  if (data.e !== eventoId) return false;
  
  // Verificar hash
  const hashEsperado = generateHash(data.p, eventoId, secret);
  if (data.h !== hashEsperado) return false;
  
  return true;
}
```

---

## 8. PWA Features

### Web App Manifest
```json
{
  "name": "Presença",
  "short_name": "Presença",
  "description": "Controle de presença via QR Code",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker (Workbox)
- Cache-first para estáticos
- Network-first para API
- Background sync para check-ins offline

---

## 9. Segurança

| Item | Implementação |
|------|---------------|
| HTTPS | Automático (Vercel/Render) |
| Auth JWT | Token em httpOnly cookie |
| CORS | Whitelist apenas domínio do app |
| Rate limiting | 100 req/min por IP |
| SQL Injection | Prisma parametrize |
| XSS | React escape automático |
| CSRF | Same-site cookie |

---

## 10. Perfis de Permissão

### Organizador
- Criar/editar/excluir eventos
- Importar participantes
- Enviar links
- Ver stats e exportar

### Portaria
- Apenas fazer check-in
- Ver últimos check-ins

### Participante
- Confirmar presença
- Visualizar QR Code
- Cancelar confirmação

---

## 11. Scripts npm

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "server": "node server/index.js",
    "db:migrate": "prisma migrate dev",
    "db:seed": "node server/seed.js"
  }
}
```

---

## 12. Install Guide

```bash
# Clone e instale
git clone https://github.com/presenca/presenca.git
cd presenca

# Frontend
npm install

# Backend
cd server
npm install

# Database
npx prisma migrate dev

# Execute
npm run dev          # Frontend :5173
npm run server      # Backend  :3001
```

---

## 13. Variáveis de Ambiente

```env
# Frontend (.env)
VITE_API_URL=http://localhost:3001/api
VITE_APP_URL=http://localhost:5173

# Backend (.env)
DATABASE_URL="file:./dev.db"
JWT_SECRET=sua_chave_secreta_aqui
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu@email.com
SMTP_PASS=sua_senha
APP_URL=http://localhost:5173
```

---

## 14. Testes

| Teste | Ferramenta | Cobertura Meta |
|-------|------------|---------------|
| Unitário | Vitest | > 70% |
| E2E | Playwright | Fluxos principais |
| Load | k6 | 100 conc/check-in |

---

## 15. Deploy

### Vercel (Frontend)
```bash
npm i -g vercel
vercel deploy --prod
```

### Render (Backend)
```bash
# Conectar repo GitHub
# Build: npm install && npm run build
# Start: npm run server
```

---

## 16. Offline Strategy

1. **Cachear dados do evento:** Ao abrir evento, salvar participants em IndexedDB
2. **Lista offline:** Interface portaria funciona offline após primeiro acesso
3. **Queue de check-ins:** Se offline, armazenar em queue e fazer sync quando online
4. **Feedback visual:** Indicador de modo offline na tela

---

## 17. Considerações Mobile

- **Tela cheia QR:** Ao exibir QR, evitar que tela durma (Wake Lock API)
- **Flash disponível:** Botão para activar flash da câmera
- **Vibration:** Feedback tátil ao escanear com sucesso
- **Audio:** Som de beep ao validar
- **Portrait only:** Lock orientação em portrait