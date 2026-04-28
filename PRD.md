# PRD - Sistema de Presença PWA

## 1. Visão Geral do Produto

**Nome do Produto:** Presença - Sistema de Controle de Presença via QR Code

**Tipo:** Progressive Web App (PWA) para dispositivos móveis

**Resumo:** Sistema que permite o organizador gerenciar presenças em eventos através de QR Codes únicos. Cada participante recebe um link de confirmação e um QR Code pessoal que é escaneado na entrada do evento para registro instantâneo.

**Usuários-Alvo:**
- Organizadores de eventos (palestras, workshops, meetups, conferências)
- Participantes de eventos
- Portaria/ Recepção no local do evento

---

## 2. Problema

Atualmente, o controle de presença em eventos é feito manualmente através de listas impressas ou planilhas, o que gera:
- Filas longas na entrada do evento
- Erros de registromanual
- Dificuldade em exportar relatórios
- Perda de tempo do organizador e participantes

---

## 3. Objetivos de Negócio

1. Eliminar filas na entrada do evento (validação em < 3 segundos)
2. Registro 100% digital e automático
3. Relatórios em tempo real
4. Taxa de conversão de confirmações > 80%
5. Interface mobile-first com experiência semelhante a app nativo

---

## 4. Personas

### Persona 1: Organizador
- **Nome:** Carlos, 35 anos
- **Profissão:** Coordenador de eventos empresariais
- **Dor:** Precisa saber exatamente quem compareceu ao evento
- **Necessidade:** Gerar QR Codes, acompanhar stats em tempo real, exportar lista

### Persona 2: Participante
- **Nome:** Ana, 28 anos
- **Profissão:** Profissional liberal
- **Dor:** Odia filas e papelada na entrada
- **Necessidade:** Confirmar presença de forma rápida, ter QR Code sempre disponível

### Persona 3: Receptionist
- **Nome:** João, 22 anos
- **Profissão:** Auxiliar deevento
- **Dor:**纸张 e caneta, lista manuscrita
- **Necessidade:** Escanear QR Code rapidamente, confirmar visualmente

---

## 5. Requisitos Funcionais

### 5.1 Módulo Organizador

| ID | Requisito | Prioridade |
|----|----------|-----------|
| RF01 | Cadastrar evento (nome, data, horário, local, descrição) | Must |
| RF02 | Gerar lista de QR Codes em lote (importar CSV com nomes/emails) | Must |
| RF03 | Gerar link de confirmação individual por participante | Must |
| RF04 | Enviar link por email automaticamente | Should |
| RF05 | Visualizar dashboard com total confirmado/compareceu | Must |
| RF06 | Visualizar lista de participantes com status | Must |
| RF07 | Exportar relatório (CSV/PDF) com presenças | Should |
| RF08 | Gerar QR Code de verificação para portaria | Must |
| RF09 | RedefinirQR Code de participante | Could |
| RF10 | Cancelar participação | Could |

### 5.2 Módulo Participante

| ID | Requisito | Prioridade |
|----|----------|-----------|
| RF11 | Confirmar presença via link recebido | Must |
| RF12 | Visualizar QR Code pessoal em tela cheia | Must |
| RF13 | Salvar QR Code na galeria do celular | Should |
| RF14 | Ver detalhes do evento (data, local, horário) | Must |
| RF15 | Cancelar confirmação | Could |

### 5.3 Módulo Portaria/Recepção

| ID | Requisito | Prioridade |
|----|----------|-----------|
| RF16 | Escanear QR Code do participante | Must |
| RF17 | Exibir dados do participante na tela | Must |
| RF18 | Confirmar presença com feedback visual e sonoro | Must |
| RF19 | Indicar seQR Code é válido ou já utilizado | Must |
| RF20 | Lista offline de check-in (cache.local) | Should |

---

## 6. Requisitos Não-Funcionais

| ID | Requisito |
|----|----------|
| RNF01 | Tempo de validação < 3 segundos |
| RNF02 | Funcionar offline após primeiro acesso (PWA) |
| RNF03 | Instalar na homescreen do celular |
| RNF04 | Loading em redes 3G < 5 segundos |
| RNF05 | Compatibilidade: Chrome, Safari (iOS/Android) |
| RNF06 | QR Code legível em telas de 4 a 6 polegadas |
| RNF07 | Dados criptografados em trânsito (HTTPS) |
| RNF08 | backup automático de dados |

---

## 7. Fluxo do Usuário

```
ORGANIZADOR                    PARTICIPANTE                    PORTARIA
     │                              │                               │
     ▼                              ▼                               │
──────┐                             │                               │
│Cria │                             │                               │
│evento                             │                               │
└──────┬                            │                               │
       │                            │                               │
       ▼                            │                               │
┌──────┐                           │                               │
│Import│                           │                               │
│lista │                           │                               │
└──────┬                          │                               │
       │                            │                               │
       ▼             ┌─────────────┘                               │
┌──────┐            │               │                               │
│Gera │─────────────▶│  Email/Link  │                               │
│QRCode            │confirmação    │                               │
└──────┬            └─────────────┬─┘                               │
       │                          │                                 │
       ▼                          ▼                                 │
┌──────┐                  ┌──────────────┐                         │
│Acomp │                  │ Confirma     │                         │
│stats │                  │ presença     │                         │
└──────┬                  └──────────┬───┘                         │
       │                             │                               │
       │                    ┌──────────┴───┐                         │
       │                    │ Recebe QR    │                         │
       │                    │ Code pessoal│                         │
       │                    └──────────┬───┘                         │
       │                             │                               │
       │                             │         ┌─────────────────────▼─
       │                             │         │   Chega no evento
       │                             │         │
       │                             │         ▼
       │                             │   ┌───────────┐
       └─────────────────────────────▶│──│Escaneia QR│
                                     │  │Code      │
                                     │  └────┬────┘
                                     │       ▼
                                     │  ┌──────────┐
                                     │  │Check-in   │
                                     │  │registrado│
                                     │  └──────────┘
```

---

## 8. Casos de Borda

1. **QR Code duplicado:** Exibir erro "QR Code já utilizado" com hora do primeiro uso
2. **QR Code inválido:** Exibir erro "QR Code não encontrado"
3. **Sem internet no evento:** Usar cache.local para validar offline
4. **Tela escura do celular:** QR Code sempre visível com brilho máximo
5. **Participante sem celular:** Permitir check-in manual via código alfanumérico

---

## 9. Métricas de Sucesso

| Métrica | Meta |
|--------|------|
| Tempo médio de check-in | < 3 segundos |
| Taxa de confirmação online | > 80% |
| Taxa de comparecimento | > 90% dos confirmados |
| Satisfação do usuário | NPS > 7 |
| Erros de validação | < 1% |

---

## 10. Priorização

**MVP (Must Have):**
- RF01, RF02, RF03, RF06, RF11, RF12, RF14, RF16, RF17, RF18, RNF01-RNF05

**Versão 1.1 (Should Have):**
- RF04, RF05, RF07, RF08, RNF06

**Versão 1.2 (Could Have):**
- RF09, RF10, RF13, RF19, RNF07, RNF08

---

## 11. Concorrentes 参考

- Google Forms + QR Generator
- Eventbrite (complicated, expensive)
- Mentimeter (não é focus em presença)
- Checkin (app específico, mas não PWA)

---

## 12. Modelo de Negócio

**Free Tier:**
- 1 evento
- até 50 participantes
- sem relatórios avançados

**Pro (R$ 29/mês):**
- eventos ilimitados
- até 500 participantes por evento
- relatórios CSV/PDF
- email automático

**Enterprise (sob consulta):**
- eventos ilimitados
- participantes ilimitados
- API de integração
- suporte dedicado