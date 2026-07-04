# Roadmap — Análise e Exportação para IA
**Data:** 2026-06-04
**Status:** APENAS DOCUMENTAÇÃO — nada implementado

---

## Visão Geral

Criar no CRM um botão:

> 🧠 Exportar Dataset para IA

Que permita exportar os dados do sistema em formatos estruturados para análise por inteligência artificial.

---

## Capacidades futuras desejadas

| Funcionalidade | Formato | Escopo |
|----------------|---------|--------|
| Copiar JSON para clipboard | JSON | Selecionável |
| Exportar arquivo JSON | .json | Selecionável |
| Exportar CSV | .csv | Selecionável |
| Exportar por mês | JSON ou CSV | Filtro por mês/ano |
| Exportar por ano | JSON ou CSV | Filtro por ano |

---

## Dataset: Leads

Campos a exportar:

```
nome
telefone (omitido ou anonimizado)
origem (utm_source)
utm_medium
utm_campaign
utm_content
utm_term
bairroQR
kit (tipo de sistema solar)
valorConta (valor da conta de luz)
economia (estimativa de economia)
score
temperatura
status
createdAt
tempoTotalSegundos
scrollMaximoPercentual
cliquesWhatsapp
```

---

## Dataset: Visitantes sem cadastro

Campos a exportar:

```
origem (utm_source)
utm_medium
utm_campaign
utm_content
sessionId (anonimizado)
tempoNaPagina
scrollMaximo
cliquesWhatsapp
evento (pagina_abriu, scroll_profundo, etc.)
criadoEm
```

---

## Dataset: QR Codes — Funil de Conversão

### QR Codes monitorados

- Itaipuaçu
- Centro Maricá
- Ponta Negra

### Métricas por QR Code

```
bairro (nome do QR Code)
escaneamentos (total de acessos via ?bairro=)
leads (leads com bairroQR correspondente)
whatsapp (cliques em WhatsApp destes leads)
vendas (leads com status Fechado)
taxaConversao (leads / escaneamentos * 100)
```

---

## Formato de saída desejado (exemplo JSON)

```json
{
  "exportado_em": "2026-06-04T00:00:00Z",
  "periodo": "2026-06",
  "leads": [
    {
      "origem": "instagram",
      "campanha": "mf_eletricidade",
      "bairroQR": "centro_marica",
      "valorConta": "450",
      "score": 80,
      "status": "Proposta",
      "createdAt": "2026-06-01T10:30:00Z"
    }
  ],
  "qr_codes": [
    {
      "bairro": "centro_marica",
      "escaneamentos": 42,
      "leads": 12,
      "whatsapp": 8,
      "vendas": 3,
      "taxaConversao": "28.57%"
    }
  ]
}
```

---

## Ordem sugerida de implementação

1. Corrigir permissões QR Codes (erro atual)
2. Reforçar Firestore Rules
3. Evoluir Analytics (resumo executivo)
4. Implementar botão "Exportar Dataset para IA"
   - Fase 4a: copiar JSON para clipboard
   - Fase 4b: exportar JSON para arquivo
   - Fase 4c: exportar CSV
   - Fase 4d: filtros por período

---

> Este documento é apenas um registro de intenção.
> Nenhuma linha de código foi escrita ou modificada para implementar estas funcionalidades.
