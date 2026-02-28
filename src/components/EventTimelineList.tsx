import { useEffect, useMemo, useState } from "react";
import { formatEventDateValue, toDateInput, toEventDayValue } from "../utils/events";

interface LocalEvent {
  slug: string;
  title: string;
  startISO: string;
  endISO?: string;
  location: string;
  intro: string;
  url: string;
}

interface Props {
  events: LocalEvent[];
}

type EventListMode = "upcoming" | "past";

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDayInput(dayValue: number): string {
  const value = String(dayValue).padStart(8, "0");
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function formatDateBlock(dateIso: string): { day: string; month: string } {
  return {
    day: formatEventDateValue(dateIso, "pt-BR", { day: "2-digit" }),
    month: formatEventDateValue(dateIso, "pt-BR", { month: "short" }).replace(".", "").toUpperCase(),
  };
}

function formatTimeWindow(startIso: string, endIso?: string): string {
  const startText = formatEventDateValue(startIso, "pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!endIso) {
    return startText;
  }

  const endText = formatEventDateValue(endIso, "pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${startText} - ${endText}`;
}

function normalizeToDay(dateInput: string): number {
  return Number(dateInput.replace(/-/g, ""));
}

function normalizeIsoToDay(dateIso: string): number {
  return toEventDayValue(dateIso);
}

function clampDateInput(value: string, min: string, max: string): string {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

function toViewMode(value: string | null): EventListMode {
  return value === "past" ? "past" : "upcoming";
}

function viewModeSwitchClass(active: boolean): string {
  const base = "site-button calendario-feed-switch px-4 py-2 text-xs";
  if (active) {
    return `${base} calendario-feed-switch--active calendario-feed-switch--active-local`;
  }
  return `${base} calendario-feed-switch--inactive`;
}

export default function EventTimelineList({ events }: Props) {
  const today = useMemo(() => new Date(), []);
  const todayValue = toEventDayValue(today);
  const todayInput = toDateInput(today);

  const minDateInput = useMemo(() => {
    if (events.length === 0) {
      return toDateInput(addDays(today, -365));
    }

    const minValue = events.reduce((currentMin, event) => {
      const value = normalizeIsoToDay(event.startISO);
      return value < currentMin ? value : currentMin;
    }, Number.POSITIVE_INFINITY);

    return toDayInput(minValue);
  }, [events, today]);

  const maxDateInput = useMemo(() => {
    if (events.length === 0) {
      return toDateInput(addDays(today, 365));
    }

    const maxValue = events.reduce((currentMax, event) => {
      const value = normalizeIsoToDay(event.startISO);
      return value > currentMax ? value : currentMax;
    }, Number.NEGATIVE_INFINITY);

    return toDayInput(Math.max(maxValue, todayValue));
  }, [events, today, todayValue]);

  const defaultRanges = useMemo(() => {
    const upcomingStart = clampDateInput(todayInput, minDateInput, maxDateInput);
    const upcomingEnd = maxDateInput < upcomingStart ? upcomingStart : maxDateInput;

    const yesterdayInput = toDateInput(addDays(today, -1));
    const pastEnd = clampDateInput(yesterdayInput, minDateInput, maxDateInput);

    return {
      upcoming: {
        start: upcomingStart,
        end: upcomingEnd,
      },
      past: {
        start: minDateInput,
        end: pastEnd < minDateInput ? minDateInput : pastEnd,
      },
    };
  }, [today, todayInput, minDateInput, maxDateInput]);

  const [viewMode, setViewMode] = useState<EventListMode>("upcoming");
  const [startDate, setStartDate] = useState(() => defaultRanges.upcoming.start);
  const [endDate, setEndDate] = useState(() => defaultRanges.upcoming.end);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const modeFromQuery = toViewMode(searchParams.get("view"));
    setViewMode(modeFromQuery);
  }, []);

  useEffect(() => {
    const nextRange = defaultRanges[viewMode];
    setStartDate(nextRange.start);
    setEndDate(nextRange.end);
  }, [defaultRanges, viewMode]);

  const filteredEvents = useMemo(() => {
    const min = normalizeToDay(startDate);
    const max = normalizeToDay(endDate);

    return events
      .filter((event) => {
        const value = normalizeIsoToDay(event.startISO);
        const inRange = value >= min && value <= max;
        if (!inRange) {
          return false;
        }

        if (viewMode === "past") {
          return value < todayValue;
        }

        return value >= todayValue;
      })
      .sort((a, b) => {
        const first = new Date(a.startISO).valueOf();
        const second = new Date(b.startISO).valueOf();
        return viewMode === "past" ? second - first : first - second;
      });
  }, [events, startDate, endDate, viewMode, todayValue]);

  function updateStartDate(next: string) {
    if (!next) {
      return;
    }

    const bounded = clampDateInput(next, minDateInput, maxDateInput);
    setStartDate(bounded);

    if (bounded > endDate) {
      setEndDate(bounded);
    }
  }

  function updateEndDate(next: string) {
    if (!next) {
      return;
    }

    const bounded = clampDateInput(next, minDateInput, maxDateInput);
    setEndDate(bounded < startDate ? startDate : bounded);
  }

  const emptyStateText =
    viewMode === "past"
      ? "Nenhum evento anterior encontrado no período selecionado."
      : "Nenhum evento próximo encontrado no período selecionado.";

  return (
    <div className="eventos-reference-layout space-y-6">
      <section className="eventos-filter-panel rounded-[2rem] p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode("past")}
              aria-pressed={viewMode === "past"}
              className={viewModeSwitchClass(viewMode === "past")}
            >
              Anteriores
            </button>
            <button
              type="button"
              onClick={() => setViewMode("upcoming")}
              aria-pressed={viewMode === "upcoming"}
              className={viewModeSwitchClass(viewMode === "upcoming")}
            >
              Próximos
            </button>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="eventos-filter-label flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide">
              Data inicial
              <input
                type="date"
                value={startDate}
                min={minDateInput}
                max={maxDateInput}
                onChange={(event) => updateStartDate(event.target.value)}
                className="eventos-filter-input rounded-full px-4 py-2 text-sm font-semibold outline-none transition focus:ring-2"
              />
            </label>
            <label className="eventos-filter-label flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide">
              Data final
              <input
                type="date"
                value={endDate}
                min={minDateInput}
                max={maxDateInput}
                onChange={(event) => updateEndDate(event.target.value)}
                className="eventos-filter-input rounded-full px-4 py-2 text-sm font-semibold outline-none transition focus:ring-2"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="eventos-timeline-list relative">
        {filteredEvents.length === 0 ? (
          <div className="eventos-empty-state rounded-2xl border border-dashed p-8 text-center">{emptyStateText}</div>
        ) : (
          <div className="space-y-7">
            {filteredEvents.map((event) => {
              const dateBlock = formatDateBlock(event.startISO);

              return (
                <article key={event.slug} className="grid gap-4 md:grid-cols-[88px_minmax(0,_1fr)] md:items-start md:gap-6">
                  <a
                    href={event.url}
                    className="eventos-date-chip w-[82px] rounded-2xl px-3 py-3 text-center shadow-md transition hover:scale-[1.03]"
                  >
                    <div className="text-[2.1rem] font-black leading-none">{dateBlock.day}</div>
                    <div className="mt-1 text-[1.05rem] font-black tracking-wide">{dateBlock.month}</div>
                  </a>

                  <a href={event.url} className="eventos-card block rounded-[1.8rem] p-7 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
                    <h2 className="eventos-card-title text-xl font-black">{event.title}</h2>
                    <ul className="eventos-card-meta mt-3 space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span
                          className="eventos-card-icon inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black"
                          title="Horário"
                          aria-label="Horário"
                        >
                          H
                        </span>
                        {formatTimeWindow(event.startISO, event.endISO)}
                      </li>
                      <li className="flex items-center gap-2">
                        <span
                          className="eventos-card-icon inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black"
                          title="Local"
                          aria-label="Local"
                        >
                          L
                        </span>
                        {event.location}
                      </li>
                    </ul>
                    <p className="eventos-card-intro mt-4 text-base leading-relaxed">{event.intro}</p>
                    <span className="site-button eventos-detail-button">Detalhes</span>
                  </a>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
