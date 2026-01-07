# 🛠️ Utils

Funções auxiliares e utilitárias.

## Exemplos

- `formatters.js` - Formatação de dinheiro, datas
- `calculations.js` - Cálculos financeiros
- `validators.js` - Validações de formulários
- `constants.js` - Constantes da aplicação

## Padrão

```javascript
// formatters.js
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};
```
