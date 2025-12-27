# K6 Performance Test Reports

Este diretório contém os relatórios de execução dos testes de performance.

## Estrutura dos Relatórios

Os relatórios são gerados automaticamente após cada execução e seguem o padrão:

```
{ambiente}_{timestamp}_summary.html
{ambiente}_{timestamp}_summary.json
```

### Exemplo:

- `hml_2025-12-26T10-30-45-123Z_summary.html`
- `hml_2025-12-26T10-30-45-123Z_summary.json`

## Ambientes

- **dev**: Desenvolvimento
- **hml**: Homologação
- **prod**: Produção

## Como Visualizar

1. Abra o arquivo `.html` em qualquer navegador
2. O relatório contém:
   - Gráficos de performance
   - Métricas de thresholds
   - Checks realizados
   - Tendências de resposta
   - Taxa de sucesso/falha

## Histórico

Todos os relatórios são mantidos neste diretório para rastreabilidade e comparação histórica.
