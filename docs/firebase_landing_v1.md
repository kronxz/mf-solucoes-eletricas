# Firebase Landing V1 — MF Soluções

## Coleção criada: `lp_leads`

Exclusiva da landing page. Isolada do CRM.

## Campos

| Campo           | Fonte                                 |
|-----------------|---------------------------------------|
| `nome`          | Formulário hero                       |
| `telefone`      | Formulário hero                       |
| `valorConta`    | Formulário hero (opcional)            |
| `origem`        | `hero_form` (fixo)                    |
| `status`        | `novo` (fixo na criação)              |
| `createdAt`     | `new Date().toISOString()`            |
| `landingPage`   | `window.location.href` (1ª visita)    |
| `referrer`      | `document.referrer` (1ª visita)       |
| `utm_source`    | URL param (não sobrescreve)           |
| `utm_medium`    | URL param                             |
| `utm_campaign`  | URL param                             |
| `utm_content`   | URL param                             |
| `utm_term`      | URL param                             |
| `gclid`         | URL param (Google Ads)                |
| `fbclid`        | URL param (Meta Ads)                  |
| `firstVisit`    | ISO timestamp da 1ª visita            |
| `sessionId`     | `mf_{timestamp}_{random}` único       |
| `recaptchaToken`| reCAPTCHA v3 (quando configurado)     |

## Regras Firestore (`firestore_lp_leads.rules`)

- `create`: permitido se `nome` e `telefone` forem strings não vazias
- `read / list / update / delete`: **negado para todos**

## Eventos GA4 adicionados

| Evento             | Quando dispara                              |
|--------------------|---------------------------------------------|
| `lead_saved`       | Sempre ao submeter o formulário             |
| `firebase_success` | Lead salvo com sucesso no Firestore         |
| `firebase_error`   | Falha ao salvar (WhatsApp abre mesmo assim) |

Parâmetros: `sessionId`, `utm_source`, `utm_campaign`

## UTMs capturados (localStorage)

`mf_utm_source`, `mf_utm_medium`, `mf_utm_campaign`, `mf_utm_content`, `mf_utm_term`,
`mf_gclid`, `mf_fbclid`, `mf_referrer`, `mf_landingPage`, `mf_firstVisit`, `mf_sessionId`

Regra: **não sobrescreve** valores já existentes — preserva dados da primeira visita.

## Pixel Layer (`window.mfTracking`)

Métodos preparados (descomentir ao configurar):
- `trackLead(params)` — Meta Pixel + Google Ads conversion
- `trackWhatsapp(origem)` — Meta Pixel custom event
- `trackPageView()` — Meta Pixel PageView

## Fluxo de execução

```
Usuário preenche e submete formulário
    ↓
localStorage backup (sempre)
    ↓
GA4 lead_submit (sempre)
    ↓
reCAPTCHA v3 token (silencioso)
    ↓
Firestore lp_leads.add(documento)
    ↓ sucesso           ↓ falha
ga4 firebase_success  ga4 firebase_error
    ↓                   ↓
        abrirWhatsApp() ← sempre executado
```

## Próximos passos

- [ ] Criar projeto Firebase dedicado para a landing page
- [ ] Preencher `MF_FIREBASE_CONFIG` em `js/firebase-leads.js`
- [ ] Registrar site no reCAPTCHA v3 e preencher `MF_RECAPTCHA_KEY`
- [ ] Aplicar `firestore_lp_leads.rules` no console Firebase
- [ ] Testar fluxo completo (formulário → Firestore → WhatsApp)
- [ ] Monitorar `firebase_error` no GA4 após deploy
