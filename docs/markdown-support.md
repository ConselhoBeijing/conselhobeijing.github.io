# Markdown Support

This project uses a shared markdown pipeline for:

- `/sobre` (`src/content/pages/about.md`)
- project details (`src/content/projects/*.md`)
- news details (`src/content/news/**/*.md`)
- event details (`src/content/events/*.md`)
- sample page (`/markdown-components`)

## Supported Features

## Core markdown

- Headings (`#` to `######`)
- Paragraphs, links, images, blockquotes
- Inline code and fenced code blocks

## GFM extensions

- Tables
- Task lists (`- [x]`, `- [ ]`)
- Strikethrough (`~~text~~`)
- Footnotes (`[^1]`)

## Admonitions

### GitHub alert style

```md
> [!NOTE]
> Texto da nota.
```

Supported labels: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`.

### Directive style

```md
:::tip{title="Dica"}
Texto da dica.
:::
```

Supported directive names: `note`, `tip`, `info`, `warning`, `caution`, `danger`, `important`.

## Expandable details

```md
:::details{summary="Clique para abrir"}
Conteúdo interno em markdown.
:::
```

## Math (KaTeX)

Inline:

```md
$E = mc^2$
```

Block:

```md
$$
\int_0^1 x^2 dx = \frac{1}{3}
$$
```

## Heading anchors

All headings automatically receive IDs and hover anchors.

## Shared Styling

All markdown-rendered sections use the `markdown-content` class in `src/styles/global.css`.
This guarantees consistent rendering across about/projects/news/events.

## Live Example

Open `/markdown-components` to see all supported components in one page.
