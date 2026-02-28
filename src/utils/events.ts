import type { CollectionEntry } from 'astro:content';

type EventDateValue = Date | string;

export const EVENT_TIME_ZONE = 'Asia/Shanghai';
export const EVENT_TIME_OFFSET = '+08:00';

const EVENT_DATETIME_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const eventDateTimePartsFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: EVENT_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

export interface LocalEventSummary {
  slug: string;
  title: string;
  startISO: string;
  endISO?: string;
  location: string;
  intro: string;
  url: string;
}

function toEventDate(value: EventDateValue): Date {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.valueOf())) {
    throw new RangeError(`Invalid event date: ${String(value)}`);
  }

  return date;
}

function getEventDateParts(value: EventDateValue) {
  const values = {
    year: '0000',
    month: '00',
    day: '00',
    hour: '00',
    minute: '00',
    second: '00',
  };

  for (const part of eventDateTimePartsFormatter.formatToParts(toEventDate(value))) {
    if (part.type in values) {
      values[part.type as keyof typeof values] = part.value;
    }
  }

  return values;
}

export function toDateInput(date: Date): string {
  const { year, month, day } = getEventDateParts(date);
  return `${year}-${month}-${day}`;
}

export function toEventDateTimeInput(value: EventDateValue): string {
  const { year, month, day, hour, minute } = getEventDateParts(value);
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function toEventTimezoneISOString(value: EventDateValue): string {
  const { year, month, day, hour, minute, second } = getEventDateParts(value);
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.000${EVENT_TIME_OFFSET}`;
}

export function toEventDayValue(value: EventDateValue): number {
  const { year, month, day } = getEventDateParts(value);
  return Number(`${year}${month}${day}`);
}

export function formatEventDateValue(
  value: EventDateValue,
  locale: string,
  options: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: EVENT_TIME_ZONE,
  }).format(toEventDate(value));
}

export function isValidEventDateTimeInput(value: string): boolean {
  return EVENT_DATETIME_INPUT_PATTERN.test(value);
}

export function toEventTimezoneDate(value: string): Date {
  if (!isValidEventDateTimeInput(value)) {
    throw new RangeError(`Invalid event datetime input: ${value}`);
  }

  const iso = `${value}:00.000${EVENT_TIME_OFFSET}`;
  const date = new Date(iso);

  if (Number.isNaN(date.valueOf())) {
    throw new RangeError(`Invalid event datetime input: ${value}`);
  }

  date.toISOString = () => iso;
  date.toJSON = () => iso;
  date.toString = () => iso;

  return date;
}

function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/<[^>]*>/g, ' ')
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
    startISO: toEventTimezoneISOString(entry.data.start),
    endISO: entry.data.end ? toEventTimezoneISOString(entry.data.end) : undefined,
    location: entry.data.location ?? 'Local a confirmar',
    intro: intro || 'Detalhes do evento em atualização.',
    url: `/events/${entry.slug}`,
  };
}
