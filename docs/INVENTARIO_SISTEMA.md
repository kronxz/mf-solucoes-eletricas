# Inventário do Sistema — MF Soluções
**Data:** 2026-06-04
**Gerado por:** Auditoria automatizada (somente leitura)

---

## 1. CRM

**URL produção:** https://mf-solucoes-crm.web.app
**Projeto Firebase:** mf-solucoes-crm
**Pasta local:** MF_Solucoes/crm-dev/
**Entry point:** crm-dev/js/app.js (módulo ES)

### Módulos existentes

| Módulo | Arquivo principal | Rota/Página |
|--------|------------------|-------------|
| Dashboard | crm-dashboard.js | dashboardPage |
| Visitas | crm-visitas.js | visitasPage |
| Leads (Kanban) | crm-kanban.js | leadsPage |
| Instalações | crm-instalacoes.js | instalacoesPage |
| Área Técnica | crm-tecnico.js | tecnicoPage |
| Financeiro | crm-financeiro.js | financeiroPage |
| Notificações | crm-notificacoes.js | notificacoesPage |
| Estatísticas | crm-stats.js | statsPage |
| Analytics | crm-analytics.js | analyticsPage |
| QR Codes | presente em produção, ausente no crm-dev local | qrPage |
| Lixeira | crm-lixeira.js | — |
| Backup | exportarBackup() em app.js | botão sidebar |

### Serviços (services/)

| Serviço | Responsabilidade |
|---------|-----------------|
| leadService.js | CRUD leads, dedupe por telefoneDigitos |
| crmService.js | Consultas CRM por userId |
| scoreService.js | Score incremental de leads |
| timelineService.js | Registro de eventos na subcoleção timeline |
| validationService.js | Validação de dados antes de salvar |
| storageService.js | Cache localStorage (leadId, telefoneDigitos) |

---

## 2. Landing Page

**URL produção:** https://kronxz.github.io/mf-solucoes-eletricas/
**Repositório:** https://github.com/kronxz/mf-solucoes-eletricas.git
**Branch publicada:** main
**Pasta local:** MF_Landing_V2/

### Formulários

| ID | Localização | Destino |
|----|-------------|---------|
| hero-lead-form | index.html (seção hero) | Firebase lp_leads + WhatsApp |

### Campos do formulário

| Campo | ID | Validação ativa |
|-------|----|----------------|
| Nome | lead-nome | Letras/acentos/espaços, 2–30 chars |
| Telefone | lead-telefone | Só dígitos, 10–13 chars |
| Conta de luz | lead-conta | Só dígitos, 1–99999 |

### Rastreamentos ativos

| Sistema | ID / Chave | Evento principal |
|---------|-----------|-----------------|
| Google Analytics 4 | G-2MDLX4H95K | lead_submit, whatsapp_click, scroll |
| Meta Pixel | 847474405060823 | Lead, PageView, TempoPagina |
| Microsoft Clarity | configurado | sessões gravadas |
| localStorage UTMs | mf_utm_source, mf_utm_medium, etc. | captura na primeira visita |
| localStorage anti-flood | mf_ultimo_envio | bloqueia reenvio < 60s |

### Integrações Firebase

| Arquivo | Coleção | Operação |
|---------|---------|----------|
| js/firebase-leads.js | lp_leads | addDoc (create only) |

### Scripts externos carregados

- Firebase SDK v8 (compat) — app + firestore
- reCAPTCHA v3 — site key: 6Lds8AotAAAA...
- Google Tag Manager / gtag
- Meta Pixel SDK
- Microsoft Clarity SDK
- Font Awesome 6.5.0

---

## 3. Firebase

**Projeto:** mf-solucoes-crm
**Console:** https://console.firebase.google.com/project/mf-solucoes-crm

### Coleções identificadas

| Coleção | Origem | Uso |
|---------|--------|-----|
| leads | CRM (calculadora) | Leads do simulador solar |
| leads/{id}/timeline | CRM | Subcoleção de eventos por lead |
| lp_leads | Landing Page | Leads do formulário hero |
| eventos | CRM (analytics) | Eventos comportamentais dos visitantes |
| crm_config | CRM (dashboard) | Configurações e notas por userId |

### Coleções referenciadas mas não confirmadas localmente

| Coleção | Referência encontrada |
|---------|-----------------------|
| landing_visits | Comentário no index.html ("Rastreamento de visitantes + QR Codes") |

### Regras Firestore (arquivo local: MF_Solucoes/firestore.rules)

```
leads       → allow read, write: if true    ← RISCO ALTO (sem autenticação)
eventos     → allow read, write: if true    ← RISCO ALTO (sem autenticação)
lp_leads    → allow create: if nome+tel presentes; read/update/delete: false
/{document} → allow read, write: if request.auth != null
```

> Alerta: `leads` e `eventos` estão públicas. Correção pendente para etapa futura.

### Arquivo de regras da landing (firestore_lp_leads.rules)

```
lp_leads    → allow create: if nome+tel string e não vazios
lp_leads    → read/list/update/delete: false
outros      → allow read, write: false
```

---

## 4. Branches do repositório

| Branch | Estado | Observação |
|--------|--------|-----------|
| main (origin) | Publicada no GitHub Pages | Base estável atual |
| deploy-fix | Sincronizado com origin/main | Branch de trabalho atual |
| feature/fase3-premium-conversao | Ahead de origin | Fixes de validação |
| feature/fase2-visual-confianca | Local | Fase 2 visual |
| feature/landing-v2 | Local | Landing v2 |
| main (local) | 315 ahead / 16 behind origin | Histórico divergente |

---

## 5. Arquivos críticos

| Arquivo | Localização | Descrição |
|---------|-------------|-----------|
| index.html | MF_Landing_V2/ | Landing page completa |
| js/firebase-leads.js | MF_Landing_V2/js/ | Captura de leads no Firestore |
| js/visit-tracking.js | MF_Landing_V2/js/ | Rastreamento de visitas |
| firestore_lp_leads.rules | MF_Landing_V2/ | Regras Firestore da landing |
| firebase.json | MF_Solucoes/ | Config deploy CRM |
| firestore.rules | MF_Solucoes/ | Regras Firestore do CRM |
| crm-dev/js/app.js | MF_Solucoes/ | Entry point do CRM |
| crm-dev/js/crm-kanban.js | MF_Solucoes/ | Kanban de leads |
