# Firebase — Fase 1 — Landing Page MF Soluções

## Objetivo

Capturar leads da landing page no Firestore de forma isolada do CRM.

---

## Coleção

**Nome:** `lp_leads`

---

## Campos

| Campo          | Tipo      | Fonte                                          |
|----------------|-----------|------------------------------------------------|
| `nome`         | string    | Formulário hero                                |
| `telefone`     | string    | Formulário hero                                |
| `valorConta`   | string    | Formulário hero (opcional)                     |
| `utm_source`   | string    | localStorage `mf_utm_source`                   |
| `utm_medium`   | string    | localStorage `mf_utm_medium`                   |
| `utm_campaign` | string    | localStorage `mf_utm_campaign`                 |
| `utm_content`  | string    | localStorage `mf_utm_content`                  |
| `utm_term`     | string    | localStorage `mf_utm_term`                     |
| `referrer`     | string    | localStorage `mf_referrer` (document.referrer) |
| `landingPage`  | string    | localStorage `mf_landingPage` (pathname)       |
| `createdAt`    | timestamp | new Date() no momento do envio                 |

---

## Regras de isolamento

- `lp_leads` é exclusivo da landing page
- O CRM **não lê nem escreve** nesta coleção
- Nenhuma função do CRM referencia `lp_leads`
- Firestore existente permanece intacto

---

## Fluxo de implementação (futuro)

```
Usuário preenche formulário hero
    ↓
enviarFormHero() chamado
    ↓
Salvar em Firestore → lp_leads   (antes de abrir WhatsApp)
    ↓
Abrir WhatsApp com mensagem pré-preenchida
    ↓
Falha no Firestore = silenciosa (não bloqueia o WhatsApp)
```

---

## Checklist de implementação

- [ ] Criar projeto Firebase dedicado (ou usar ambiente isolado)
- [ ] Instalar Firebase SDK v9+ modular
- [ ] Configurar `firebaseConfig` em variável de ambiente ou config separada
- [ ] Implementar `saveLeadToFirestore(leadData)` em `enviarFormHero()`
- [ ] Testar captura end-to-end (form → Firestore → WhatsApp)
- [ ] Configurar regras de segurança: write permitido para todos, read restrito
- [ ] Validar isolamento total do CRM

---

## Status

Pendente de autorização para implementação.
