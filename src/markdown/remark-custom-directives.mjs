import { visit } from "unist-util-visit";
import {
  createRichImageHtml,
  normalizeHexColor,
  parseTagAttributes,
} from "../keystatic/rich-markdoc-shared.js";

const ADMONITION_DEFAULT_TITLE = {
  note: "Nota",
  tip: "Dica",
  info: "Informação",
  warning: "Aviso",
  caution: "Atenção",
  danger: "Perigo",
  important: "Importante",
};

const ADMONITION_TYPES = new Set(Object.keys(ADMONITION_DEFAULT_TITLE));
const TEXT_COLOR_TAG_PATTERN = /(\{%\s*textColor\b[\s\S]*?%\}|\{%\s*\/textColor\s*%\})/g;
const TEXT_COLOR_OPEN_PATTERN = /^\{%\s*textColor\b([\s\S]*?)%\}$/;
const TEXT_COLOR_CLOSE_PATTERN = /^\{%\s*\/textColor\s*%\}$/;
const RICH_IMAGE_PATTERN = /^\s*\{%\s*richImage\b([\s\S]*?)\/%\}\s*$/;

function toPlainText(children = []) {
  return children
    .map((child) => {
      if (child.type === "text") return child.value;
      if (Array.isArray(child.children)) return toPlainText(child.children);
      return "";
    })
    .join("")
    .trim();
}

function createAdmonitionTitleParagraph(title) {
  return {
    type: "paragraph",
    data: {
      hName: "p",
      hProperties: { className: ["admonition-title"] },
    },
    children: [{ type: "text", value: title }],
  };
}

function createDetailsSummary(summary) {
  return {
    type: "paragraph",
    data: {
      hName: "summary",
      hProperties: { className: ["markdown-details-summary"] },
    },
    children: [{ type: "text", value: summary }],
  };
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function createTextNode(value) {
  return {
    type: "text",
    value,
  };
}

function splitTextColorTokens(children = []) {
  const tokens = [];

  for (const child of children) {
    if (child.type !== "text") {
      tokens.push(child);
      continue;
    }

    let lastIndex = 0;
    for (const match of child.value.matchAll(TEXT_COLOR_TAG_PATTERN)) {
      const matchIndex = match.index ?? 0;
      const raw = match[0];

      if (matchIndex > lastIndex) {
        tokens.push(createTextNode(child.value.slice(lastIndex, matchIndex)));
      }

      const openMatch = raw.match(TEXT_COLOR_OPEN_PATTERN);
      if (openMatch) {
        tokens.push({
          type: "keystaticTextColorOpen",
          raw,
          attributes: parseTagAttributes(openMatch[1] || ""),
        });
      } else if (TEXT_COLOR_CLOSE_PATTERN.test(raw)) {
        tokens.push({
          type: "keystaticTextColorClose",
          raw,
        });
      } else {
        tokens.push(createTextNode(raw));
      }

      lastIndex = matchIndex + raw.length;
    }

    if (lastIndex < child.value.length) {
      tokens.push(createTextNode(child.value.slice(lastIndex)));
    }
  }

  return tokens;
}

function renderColorSpan(color, children) {
  return [
    {
      type: "html",
      value: `<span class="rich-text-color" style="color: ${escapeHtml(color)};">`,
    },
    ...children,
    {
      type: "html",
      value: "</span>",
    },
  ];
}

function consumeTextColor(tokens, startIndex) {
  const children = [];

  for (let index = startIndex; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (token.type === "keystaticTextColorClose") {
      return {
        children,
        nextIndex: index,
        closed: true,
      };
    }

    if (token.type === "keystaticTextColorOpen") {
      const nested = consumeTextColor(tokens, index + 1);
      if (nested.closed) {
        const color = normalizeHexColor(token.attributes?.color);
        children.push(...renderColorSpan(color, nested.children));
        index = nested.nextIndex;
        continue;
      }

      children.push(createTextNode(token.raw), ...nested.children);
      return {
        children,
        nextIndex: nested.nextIndex,
        closed: false,
      };
    }

    children.push(token);
  }

  return {
    children,
    nextIndex: tokens.length,
    closed: false,
  };
}

function renderInlineTextColors(children = []) {
  const tokens = splitTextColorTokens(children);
  const rendered = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (token.type === "keystaticTextColorOpen") {
      const nested = consumeTextColor(tokens, index + 1);
      if (nested.closed) {
        const color = normalizeHexColor(token.attributes?.color);
        rendered.push(...renderColorSpan(color, nested.children));
        index = nested.nextIndex;
        continue;
      }

      rendered.push(createTextNode(token.raw), ...nested.children);
      break;
    }

    if (token.type === "keystaticTextColorClose") {
      rendered.push(createTextNode(token.raw));
      continue;
    }

    rendered.push(token);
  }

  return rendered;
}

function transformParagraphNode(node, parent, index) {
  if (!parent || typeof index !== "number" || node.type !== "paragraph" || !Array.isArray(node.children)) {
    return;
  }

  const textOnly = node.children.every((child) => child.type === "text");
  if (textOnly) {
    const raw = node.children.map((child) => child.value).join("");
    const richImageMatch = raw.match(RICH_IMAGE_PATTERN);

    if (richImageMatch) {
      const html = createRichImageHtml(parseTagAttributes(richImageMatch[1] || ""));
      if (html) {
        parent.children[index] = {
          type: "html",
          value: html,
        };
        return;
      }
    }
  }

  node.children = renderInlineTextColors(node.children);
}

export default function remarkCustomDirectives() {
  return (tree) => {
    visit(tree, (node, index, parent) => {
      if (node.type === "paragraph") {
        transformParagraphNode(node, parent, index);
      }

      if (node.type !== "containerDirective") {
        return;
      }

      const directiveName = String(node.name || "").toLowerCase();

      if (ADMONITION_TYPES.has(directiveName)) {
        const explicitTitle = node.attributes?.title;
        const title =
          typeof explicitTitle === "string" && explicitTitle.trim()
            ? explicitTitle.trim()
            : ADMONITION_DEFAULT_TITLE[directiveName];

        const firstParagraph = node.children?.[0];
        const firstParagraphText =
          firstParagraph?.type === "paragraph" ? toPlainText(firstParagraph.children) : "";

        if (!firstParagraph || firstParagraphText !== title) {
          node.children = [createAdmonitionTitleParagraph(title), ...(node.children || [])];
        }

        node.data = {
          hName: "aside",
          hProperties: {
            className: ["admonition", `admonition-${directiveName}`],
          },
        };
        return;
      }

      if (directiveName === "details") {
        const explicitSummary = node.attributes?.summary;
        const summary =
          typeof explicitSummary === "string" && explicitSummary.trim()
            ? explicitSummary.trim()
            : "Detalhes";

        const firstChild = node.children?.[0];
        const hasSummary =
          firstChild?.data?.hName === "summary" ||
          (firstChild?.type === "paragraph" &&
            Array.isArray(firstChild.children) &&
            toPlainText(firstChild.children) === summary);

        if (!hasSummary) {
          node.children = [createDetailsSummary(summary), ...(node.children || [])];
        }

        node.data = {
          hName: "details",
          hProperties: { className: ["markdown-details"] },
        };
      }
    });
  };
}
