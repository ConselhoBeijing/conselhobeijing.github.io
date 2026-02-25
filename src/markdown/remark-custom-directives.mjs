import { visit } from "unist-util-visit";

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

export default function remarkCustomDirectives() {
  return (tree) => {
    visit(tree, (node) => {
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
