# Mapa de Dados — MF Soluções
**Data:** 2026-06-04
**Objetivo:** Permitir que qualquer IA ou desenvolvedor entenda rapidamente a estrutura do banco.

---

## Coleção: `lp_leads` (Landing Page)

**Origem:** Formulário hero da landing page
**Arquivo de gravação:** js/firebase-leads.js
**Operações permitidas:** create only (sem leitura/edição/exclusão via cliente)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| nome | string | Nome completo do visitante (2–30 chars) |
| telefone | string | WhatsApp com DDD (10–13 dígitos) |
| valorConta | string | Valor da conta de luz em R$ (ou "Não informado") |
| origem | string | Identificador do formulário (ex: "hero_form") |
| status | string | Sempre "novo" na criação |
| createdAt | string (ISO) | Timestamp de criação |
| lastActivity | string (ISO) | Última atividade |
| landingPage | string | URL da página de origem |
| referrer | string | Página de referência (ou "direto") |
| utm_source | string | Origem do tráfego (ex: "instagram") |
| utm_medium | string | Mídia (ex: "bio", "panfleto") |
| utm_campaign | string | Campanha (ex: "mf_eletricidade") |
| utm_content | string | Conteúdo do anúncio |
| utm_term | string | Termo de busca |
| gclid | string | Google Click ID |
| fbclid | string | Facebook Click ID |
| firstVisit | string (ISO) | Primeira visita do dispositivo |
| sessionId | string | ID único da sessão (ex: "mf_1717..._ab4c") |
| tempoTotalSegundos | number | Tempo na página antes do envio |
| scrollMaximoPercentual | number | % máximo de scroll atingido (0–100) |
| cliquesWhatsapp | number | Nº de cliques em links WhatsApp antes do envio |
| digitouNome | boolean | Se o usuário digitou no campo nome |
| digitouTelefone | boolean | Se o usuário digitou no campo telefone |
| score | number | Score de qualidade (0–100) |
| recaptchaToken | string | Token reCAPTCHA v3 (quando disponível) |

---

## Coleção: `leads` (CRM — Calculadora Solar)

**Origem:** Simulador solar / calculadora
**Arquivo de gravação:** services/leadService.js
**Operações:** read, write (autenticação requerida para não-públicos)

> Atenção: regras atuais estão com `allow read, write: if true` — risco de exposição.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| nome | string | Nome completo |
| telefone | string | Telefone formatado |
| telefoneDigitos | string | Telefone somente dígitos (usado para dedupe) |
| status | string | Estado no Kanban (Novo, Contato, Proposta, Fechado, Instalação, Pós-venda, Manutenção) |
| score | number | Score incremental (0–100) |
| temperatura | string | Fria / Morno / Quente |
| utm_source | string | Origem do tráfego |
| utm_medium | string | Mídia |
| utm_campaign | string | Campanha |
| fbclid | string | Facebook Click ID |
| gclid | string | Google Click ID |
| sessionId | string | ID de sessão |
| bairroQR | string | Bairro capturado via QR Code |
| dispositivo | string | Tipo de dispositivo |
| pagina_origem | string | URL de onde veio |
| createdAt | timestamp | Timestamp Firestore de criação |
| lastAction | timestamp | Última ação no CRM |
| ultima_acao_nome | string | Descrição da última ação |

### Subcoleção: `leads/{leadId}/timeline`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| tipo | string | Tipo de evento (CRIOU_LEAD, RETORNOU_AO_SITE, etc.) |
| criadoEm | timestamp | Quando ocorreu |
| meta | object | Dados adicionais do evento |

---

## Coleção: `eventos` (Analytics)

**Origem:** Rastreamento comportamental dos visitantes
**Arquivo de gravação:** js/visit-tracking.js (landing) + CRM
**Operações permitidas:** read, write (atualmente público — risco alto)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| evento | string | Tipo do evento (pagina_abriu, clicou_simular, clicou_whatsapp, gerou_proposta, scroll_profundo, telefone_digitado) |
| sessionId | string | ID de sessão do visitante |
| score | number | Score no momento do evento |
| utm_source | string | Origem |
| utm_campaign | string | Campanha |
| criadoEm | timestamp | Quando ocorreu |

---

## Coleção: `crm_config`

**Origem:** CRM (dashboard)
**Arquivo de acesso:** crm-dashboard.js
**Operações:** read/write com auth

| Campo | Tipo | Descrição |
|-------|------|-----------|
| userId | string | ID do usuário autenticado |
| notas | string | Observações internas do CRM |

---

## QR Codes — Funil de Conversão

**Status:** Presente na interface de produção do CRM, ausente no código local crm-dev.
**Erro atual:** "Missing or insufficient permissions" — provável leitura de coleção protegida sem auth válida.

**Campos esperados por QR Code (ex: Itaipuaçu, Centro Maricá, Ponta Negra):**

| Campo | Origem | Localização provável |
|-------|--------|---------------------|
| bairroQR | URL param ?bairro= | leads.bairroQR |
| utm_source | URL param | leads.utm_source |
| utm_campaign | URL param | leads.utm_campaign |
| escaneamentos | evento ou coleção própria | a confirmar |
| conversões em lead | count de leads com bairroQR | calculado |

---

## Lógica de Score

**Arquivo:** services/scoreService.js + js/firebase-leads.js

### Score na landing (lp_leads)

| Condição | Pontos |
|----------|--------|
| Digitou nome | +10 |
| Digitou telefone | +20 |
| Scroll > 50% | +20 |
| Tempo na página > 40s | +20 |
| Formulário enviado | +30 |
| **Máximo** | **100** |

### Score no CRM (leads) — incremental

Score é atualizado progressivamente conforme ações: criou lead, retornou ao site, gerou proposta, fechou venda, etc.
