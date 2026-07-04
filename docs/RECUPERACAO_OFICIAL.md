# Recuperação Oficial — MF Soluções
**Data do ponto de recuperação:** 2026-06-04
**Criado por:** Auditoria + documentação automatizada

---

## Identificação

| Item | Valor |
|------|-------|
| Projeto Firebase | mf-solucoes-crm |
| URL CRM | https://mf-solucoes-crm.web.app |
| URL Landing | https://kronxz.github.io/mf-solucoes-eletricas/ |
| Repositório Landing | https://github.com/kronxz/mf-solucoes-eletricas.git |
| Branch estável | main (origin) |
| Branch de recuperação | RECUPERACAO_OFICIAL_MF_2026_06 |
| Último commit validado | a7b6a35 |
| Mensagem do commit | fix(landing): validacao robusta, anti-flood e confirmacao de envio |

---

## Estado validado no ponto de recuperação

### Landing Page (a7b6a35)

- Formulário hero com validação tripla ativa
- Nome: 2–30 chars, apenas letras/acentos/espaços
- Telefone: 10–13 dígitos numéricos
- Conta: 1–99999, apenas inteiros
- Anti-flood: 1 envio por minuto via localStorage
- Botão desativado após primeiro clique
- Confirmação de sucesso exibida, formulário oculto
- reCAPTCHA v3 ativo
- GA4, Meta Pixel, Microsoft Clarity ativos
- Firebase gravando em lp_leads

### O que NÃO estava resolvido neste ponto

- Erro "Missing or insufficient permissions" na aba QR Codes do CRM
- Regras Firestore de `leads` e `eventos` ainda públicas (allow read, write: if true)
- Módulo QR Codes ausente no crm-dev local (presente apenas em produção)

---

## Branches

| Branch | Commit | Descrição |
|--------|--------|-----------|
| RECUPERACAO_OFICIAL_MF_2026_06 | a7b6a35 | Ponto de recuperação oficial |
| main (origin) | a7b6a35 | Branch publicada no GitHub Pages |
| deploy-fix | a7b6a35 | Sincronizado com origin/main |

---

## Coleções críticas do Firestore

| Coleção | Dados críticos |
|---------|---------------|
| leads | Leads do simulador solar (CRM) |
| lp_leads | Leads da landing page |
| eventos | Eventos comportamentais dos visitantes |
| crm_config | Configurações por usuário |
| leads/{id}/timeline | Histórico de ações por lead |

---

## Arquivos críticos

```
MF_Landing_V2/
  index.html                    ← Landing page completa
  js/firebase-leads.js          ← Captura lp_leads
  js/visit-tracking.js          ← Rastreamento visitas
  firestore_lp_leads.rules      ← Regras landing

MF_Solucoes/
  crm-dev/js/app.js             ← Entry point CRM
  crm-dev/js/crm-kanban.js      ← Kanban leads
  firestore.rules               ← Regras CRM (atenção: leads e eventos públicos)
  firebase.json                 ← Config deploy
```

---

## Procedimento de restauração

### Caso 1 — Restaurar Landing para este ponto

```bash
# 1. Ir para o repositório da landing
cd MF_Landing_V2

# 2. Fazer fetch do remoto
git fetch origin

# 3. Criar branch de restauração a partir do ponto de recuperação
git checkout -b restauracao-emergencia origin/RECUPERACAO_OFICIAL_MF_2026_06

# 4. Verificar que está correto
git log --oneline -3

# 5. Fazer push para main (deploy automático GitHub Pages)
git push origin restauracao-emergencia:main
```

### Caso 2 — Verificar estado atual vs ponto de recuperação

```bash
git diff RECUPERACAO_OFICIAL_MF_2026_06..origin/main -- index.html
```

### Caso 3 — Ver conteúdo de arquivo neste ponto

```bash
git show RECUPERACAO_OFICIAL_MF_2026_06:index.html > index_recuperacao.html
```

---

## Ordem recomendada de próximas etapas

1. Corrigir erro de permissões na aba QR Codes do CRM
2. Reforçar Firestore Rules (proteger leads e eventos)
3. Evoluir Analytics
4. Criar exportação de dataset para IA
