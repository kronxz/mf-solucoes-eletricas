# Plano Firebase — Landing Page MF Soluções

## Objetivo

Registrar leads capturados pela landing page no Firestore,
de forma completamente isolada do CRM existente.

---

## Coleção proposta

**Nome:** `lp_leads`

---

## Estrutura de campos

| Campo          | Tipo      | Descrição                                      |
|----------------|-----------|------------------------------------------------|
| `nome`         | string    | Nome completo informado no formulário hero     |
| `telefone`     | string    | WhatsApp com DDD                               |
| `valorConta`   | string    | Valor da conta de luz (ex: "R$ 400")           |
| `utm_source`   | string    | Origem do tráfego (ex: google, facebook)       |
| `utm_medium`   | string    | Mídia (ex: cpc, organic)                       |
| `utm_campaign` | string    | Nome da campanha                               |
| `utm_content`  | string    | Variação do anúncio                            |
| `utm_term`     | string    | Palavra-chave (tráfego pago)                   |
| `origem`       | string    | Seção onde o lead foi gerado (ex: hero_form)   |
| `timestamp`    | timestamp | Data e hora da captura                         |
| `status`       | string    | Estado inicial: "novo" (para uso futuro)       |

---

## Fluxo futuro

```
Landing Page (MF_Landing_V2)
    ↓
Formulário Hero preenchido
    ↓
Firestore → coleção: lp_leads
    ↓
(futuro) painel de visualização ou integração com CRM

CRM permanece completamente isolado — sem leitura desta coleção.
```

---

## Regras de isolamento

- A coleção `lp_leads` é exclusiva da landing page.
- O CRM **não lê nem escreve** nesta coleção.
- Nenhuma função do CRM deve referenciar `lp_leads`.
- Acesso restrito a usuários autenticados (a definir na implementação).

---

## Observações de implementação (futuro)

- Utilizar Firebase SDK v9+ (modular) para menor bundle.
- Salvar lead **antes** de abrir o WhatsApp, garantindo que a captura não depende do clique.
- Tratar erros silenciosamente: falha no Firestore não deve bloquear o redirecionamento ao WhatsApp.
- Não exibir mensagem de confirmação que dependa do sucesso do Firestore.

---

## Status

- [ ] Implementação pendente de autorização
- [ ] Criar projeto Firebase dedicado (ou usar projeto existente isolado)
- [ ] Configurar regras de segurança do Firestore
- [ ] Implementar SDK na landing page
- [ ] Testar fluxo de captura end-to-end
