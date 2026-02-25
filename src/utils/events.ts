import type { CollectionEntry } from 'astro:content';

export interface LocalEventSummary {
  slug: string;
  title: string;
  startISO: string;
  endISO?: string;
  location: string;
  intro: string;
  url: string;
}

export function toDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[>#*_~\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildEventIntro(markdown: string, maxLength = 180): string {
  const plain = stripMarkdown(markdown);
  if (plain.length <= maxLength) {
    return plain;
  }
  return `${plain.slice(0, maxLength).trimEnd()}...`;
}

export function toLocalEventSummary(entry: CollectionEntry<'events'>): LocalEventSummary {
  const intro = buildEventIntro(entry.body ?? "");

  return {
    slug: entry.slug,
    title: entry.data.title,
    startISO: entry.data.start.toISOString(),
    endISO: entry.data.end?.toISOString(),
    location: entry.data.location ?? 'Local a confirmar',
    intro: intro || 'Detalhes do evento em atualização.',
    url: `/events/${entry.slug}`,
  };
}
