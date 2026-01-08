# 📊 Sistema de Gerenciamento de Dívidas - Métodos de Quitação

## 🎯 Método Bola de Neve (Snowball)

O método **Bola de Neve** é uma estratégia de quitação de dívidas que prioriza dívidas pelo **menor saldo restante**.

### Como funciona:

1. **Ordene suas dívidas** da menor para a maior pelo saldo restante
2. **Pague o mínimo** em todas as dívidas
3. **Direcione todo dinheiro extra** para a dívida de menor saldo
4. **Quando quitar a menor**, aplique o valor dela à próxima menor dívida
5. **Repita o processo** criando um "efeito bola de neve"

### Vantagens:

- ✅ **Motivação psicológica**: vitórias rápidas ao quitar dívidas menores
- ✅ **Momentum**: cada dívida quitada libera mais dinheiro para as próximas
- ✅ **Simplicidade**: fácil de entender e seguir

### Desvantagens:

- ❌ Pode pagar mais juros no total (comparado ao método Avalanche)
- ❌ Dívidas com juros altos podem demorar mais para serem quitadas

### Exemplo:

```
Dívidas:
- Cartão A: R$ 1.000 (taxa 15% a.a.)
- Cartão B: R$ 5.000 (taxa 5% a.a.)
- Financiamento: R$ 2.000 (taxa 20% a.a.)

Ordem Bola de Neve:
1º → Cartão A (R$ 1.000)
2º → Financiamento (R$ 2.000)
3º → Cartão B (R$ 5.000)
```

---

## 🏔️ Método Avalanche

O método **Avalanche** prioriza dívidas pela **maior taxa de juros**.

### Como funciona:

1. **Ordene suas dívidas** da maior para a menor taxa de juros
2. **Pague o mínimo** em todas as dívidas
3. **Direcione todo dinheiro extra** para a dívida com maior taxa
4. **Quando quitar a de maior taxa**, aplique o valor à próxima
5. **Continue até quitar todas**

### Vantagens:

- ✅ **Economia máxima**: paga menos juros no total
- ✅ **Eficiência matemática**: melhor resultado financeiro
- ✅ **Ideal para juros altos**: ataca primeiro o que mais cresce

### Desvantagens:

- ❌ Pode demorar mais para ver a primeira dívida quitada
- ❌ Menos motivação psicológica no início

### Exemplo:

```
Mesmas dívidas acima:

Ordem Avalanche:
1º → Financiamento (20% a.a.)
2º → Cartão A (15% a.a.)
3º → Cartão B (5% a.a.)
```

---

## 💡 Qual método escolher?

### Escolha **Bola de Neve** se:

- Você precisa de **motivação** e resultados rápidos
- Tem muitas dívidas pequenas
- Prefere vitórias frequentes
- Disciplina financeira é um desafio

### Escolha **Avalanche** se:

- Quer **economizar mais dinheiro** em juros
- Tem paciência para esperar resultados
- É motivado por eficiência matemática
- Tem poucas dívidas com taxas variadas

---

## 🧮 Cálculo de Juros

### Juros Compostos (mensais):

```javascript
jurosDoMes = saldoRestante * (taxaAnual / 12 / 100);
```

### Parcela Fixa (Sistema Price):

```javascript
PMT = PV * ((i * (1 + i) ** n) / ((1 + i) ** n - 1));

// Onde:
// PMT = Valor da parcela
// PV = Valor presente (saldo inicial)
// i = Taxa de juros mensal (decimal)
// n = Número de parcelas
```

### Amortização:

```javascript
amortização = parcela - jurosDoMes;
novoSaldo = saldoAtual - amortização;
```

---

## 🎯 Dicas Importantes

1. **Pague sempre o mínimo** em todas as dívidas para não ficar inadimplente
2. **Evite novas dívidas** enquanto quita as existentes
3. **Use o simulador** para ver o impacto de pagamentos extras
4. **Registre todos os pagamentos** para acompanhar progresso
5. **Comemore cada vitória** 🎉 - manter a motivação é crucial!

---

## 📱 Funcionalidades do Sistema

### ✨ Recursos Disponíveis:

- ✅ Ordenação automática por método Bola de Neve ou Avalanche
- ✅ Simulador de quitação com gráficos
- ✅ Registro de pagamentos normais e extras
- ✅ Histórico de pagamentos
- ✅ Projeção de quitação com timeline visual
- ✅ Insights personalizados
- ✅ Cálculo automático de economia de juros
- ✅ Indicadores visuais de progresso
- ✅ Notificações ao quitar dívidas

---

## 🔗 Referências

- [Método Bola de Neve - Dave Ramsey](https://www.ramseysolutions.com/debt/how-the-debt-snowball-method-works)
- [Calculadora de Juros Compostos](https://www.rapidtables.com/calc/finance/compound-interest-calculator.html)
- [Sistema Price de Amortização](https://pt.wikipedia.org/wiki/Sistema_de_amortiza%C3%A7%C3%A3o_Price)

---

**📌 Lembre-se:** O melhor método é aquele que você consegue seguir até o fim! 💪
