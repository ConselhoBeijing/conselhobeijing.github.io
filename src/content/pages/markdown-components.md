---
title: "Markdown Components"
subtitle: "Página de referência com todos os componentes markdown enriquecidos habilitados no site."
---

# Título N1

## Título N2

Texto com **negrito**, *itálico*, ~~tachado~~ e `inline code`.

Lista com checkbox:

- [x] Tarefa concluída
- [ ] Tarefa pendente

Tabela:

| Componente | Suporte |
| --- | --- |
| Tabelas | Sim |
| Notas de rodapé | Sim |
| Admonitions | Sim |
| Matemática | Sim |

Nota de rodapé em uso[^suporte].

[^suporte]: A renderização usa plugins globais para todos os conteúdos markdown.

> [!NOTE]
> Este é um bloco de aviso no formato de alerta estilo GitHub.

> [!WARNING]
> Use este tipo quando a mensagem exigir atenção especial.

:::tip{title="Dica via diretiva"}
Diretivas também funcionam para mensagens estruturadas.
:::

:::details{summary="Detalhes expansíveis"}
Você pode incluir listas e qualquer markdown dentro de um bloco expansível.

1. Item A
2. Item B
3. Item C
:::

Equação inline: $E = mc^2$

Equação em bloco:

$$
\int_0^1 x^2 dx = \frac{1}{3}
$$

Bloco de código:

```ts
type Member = {
  name: string;
  role: string;
};

const formatMember = (member: Member) => `${member.name} - ${member.role}`;
```
