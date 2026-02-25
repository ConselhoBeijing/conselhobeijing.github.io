export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[>#*_~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function summarize(text: string, maxLength = 180): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}

export function extractFirstImageUrl(markdown: string): string | undefined {
  const match = markdown.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
  return match?.[1];
}

export function extractFaqQuestions(markdown: string, limit = 4): string[] {
  const questionMatches = Array.from(markdown.matchAll(/^###\s+(?:\d+\.\s+)?(.+)$/gm), (match) => match[1]?.trim()).filter(
    (value): value is string => Boolean(value),
  );

  if (questionMatches.length > 0) {
    return questionMatches.slice(0, limit);
  }

  return Array.from(markdown.matchAll(/^##\s+(.+)$/gm), (match) => match[1]?.trim())
    .filter((value): value is string => Boolean(value))
    .slice(0, limit);
}

export interface FaqEntry {
  question: string;
  content: string;
}

export function extractFaqEntries(markdown: string): FaqEntry[] {
  const headings = Array.from(markdown.matchAll(/^###\s+(?:\d+\.\s+)?(.+)$/gm)).map((match) => ({
    index: match.index ?? 0,
    raw: match[0] ?? "",
    title: (match[1] ?? "").trim(),
  }));

  if (headings.length === 0) {
    return [];
  }

  return headings.map((heading, index) => {
    const start = heading.index + heading.raw.length;
    const end = headings[index + 1]?.index ?? markdown.length;
    const content = markdown
      .slice(start, end)
      .trim()
      .replace(/\n{3,}/g, "\n\n");

    return {
      question: heading.title,
      content,
    };
  });
}
