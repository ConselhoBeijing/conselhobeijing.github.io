import React, { useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { EVENT_TIME_ZONE, formatEventDateValue, toEventDayValue } from "../utils/events";

interface Event {
  title: string;
  start: string | Date;
  end?: string | Date;
  allDay?: boolean;
  type?: "cn" | "br" | "local";
  url?: string;
  location?: string;
  color?: string;
  textColor?: string;
  borderColor?: string;
}

interface Props {
  holidaysCn: Event[];
  holidaysBr: Event[];
  localEvents: Event[];
}

export default function CalendarWidget({ holidaysCn, holidaysBr, localEvents }: Props) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [showCn, setShowCn] = useState(true);
  const [showBr, setShowBr] = useState(true);
  const [showLocal, setShowLocal] = useState(true);
  const [visibleMonthRange, setVisibleMonthRange] = useState(() => {
    const now = new Date();
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
    };
  });

  const events = useMemo(() => {
    let combined: Event[] = [];
    if (showCn) {
      combined = [
        ...combined,
        ...holidaysCn.map((event) => ({
          ...event,
          color: "#ffe2e2",
          textColor: "#9f1f1f",
          borderColor: "#f7b4b4",
          type: "cn" as const,
        })),
      ];
    }
    if (showBr) {
      combined = [
        ...combined,
        ...holidaysBr.map((event) => ({
          ...event,
          color: "#e7f8df",
          textColor: "#1f6b3d",
          borderColor: "#b6e2a9",
          type: "br" as const,
        })),
      ];
    }
    if (showLocal) {
      combined = [
        ...combined,
        ...localEvents.map((event) => ({
          ...event,
          color: "#fff2ce",
          textColor: "#8a5a0a",
          borderColor: "#f0d48d",
          type: "local" as const,
        })),
      ];
    }
    return combined;
  }, [showCn, showBr, showLocal, holidaysCn, holidaysBr, localEvents]);

  const filteredEvents = useMemo(() => {
    const visibleStart = toEventDayValue(visibleMonthRange.start);
    const visibleEnd = toEventDayValue(visibleMonthRange.end);
    const monthEvents = events.filter((event) => {
      const eventDate = toEventDayValue(event.start);
      return eventDate >= visibleStart && eventDate < visibleEnd;
    });

    return monthEvents.sort((first, second) => {
      const firstDate = new Date(first.start).valueOf();
      const secondDate = new Date(second.start).valueOf();
      if (firstDate !== secondDate) {
        return firstDate - secondDate;
      }
      return first.title.localeCompare(second.title, "pt-BR");
    });
  }, [events, visibleMonthRange]);

  const calendarEvents = useMemo(() => events.map((event) => normalizeInclusiveAllDayEnd(event)), [events]);

  function switchClass(active: boolean, type: Event["type"]): string {
    const base = "site-button calendario-feed-switch gap-2";
    if (active) {
      if (type === "cn") {
        return `${base} calendario-feed-switch--active calendario-feed-switch--active-cn`;
      }
      if (type === "br") {
        return `${base} calendario-feed-switch--active calendario-feed-switch--active-br`;
      }
      return `${base} calendario-feed-switch--active calendario-feed-switch--active-local`;
    }
    return `${base} calendario-feed-switch--inactive`;
  }

  function formatEventDate(start: string | Date, end?: string | Date): string {
    const startLabel = formatEventDateValue(start, "pt-BR", { day: "2-digit", month: "short", year: "numeric" });
    if (!end) {
      return startLabel;
    }
    const endLabel = formatEventDateValue(end, "pt-BR", { day: "2-digit", month: "short", year: "numeric" });
    return `${startLabel} - ${endLabel}`;
  }

  function typeLabel(type?: Event["type"]): string {
    if (type === "cn") {
      return "Feriado da China / China Holiday";
    }
    if (type === "br") {
      return "Feriado do Brasil / Brazil Holiday";
    }
    return "Evento do Conselho / Council Event";
  }

  function typeClass(type?: Event["type"]): string {
    if (type === "cn") {
      return "calendario-filtered-type calendario-filtered-type--cn";
    }
    if (type === "br") {
      return "calendario-filtered-type calendario-filtered-type--br";
    }
    return "calendario-filtered-type calendario-filtered-type--local";
  }

  function formatVisibleMonthLabel(start: Date): string {
    return formatEventDateValue(start, "pt-BR", { month: "long", year: "numeric" });
  }

  function jumpToCalendarDate(start: string | Date): void {
    const targetDate = new Date(start);
    calendarRef.current?.getApi().gotoDate(targetDate);
    document.getElementById("calendario-mensal")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function normalizeInclusiveAllDayEnd(event: Event): Event {
    if (!(event.allDay && event.end)) {
      return event;
    }

    if (typeof event.end !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(event.end)) {
      return event;
    }

    const normalizedEnd = new Date(`${event.end}T00:00:00`);
    if (Number.isNaN(normalizedEnd.valueOf())) {
      return event;
    }

    normalizedEnd.setDate(normalizedEnd.getDate() + 1);
    const year = normalizedEnd.getFullYear();
    const month = String(normalizedEnd.getMonth() + 1).padStart(2, "0");
    const day = String(normalizedEnd.getDate()).padStart(2, "0");

    return {
      ...event,
      end: `${year}-${month}-${day}`,
    };
  }

  return (
    <div className="calendario-widget space-y-6">
      <section className="calendario-feed-panel rounded-[2rem] p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="calendario-feed-title text-xs font-semibold uppercase tracking-wide">Feeds do calendário</p>
            <p className="calendario-feed-description mt-1">Filtre por tipos de evento.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setShowCn((value) => !value)} className={switchClass(showCn, "cn")} aria-pressed={showCn}>
              <span className={`calendario-feed-dot h-2.5 w-2.5 rounded-full ${showCn ? "calendario-feed-dot--cn" : "calendario-feed-dot--off"}`} />
              Feriados da China
            </button>
            <button type="button" onClick={() => setShowBr((value) => !value)} className={switchClass(showBr, "br")} aria-pressed={showBr}>
              <span className={`calendario-feed-dot h-2.5 w-2.5 rounded-full ${showBr ? "calendario-feed-dot--br" : "calendario-feed-dot--off"}`} />
              Feriados do Brasil
            </button>
            <button type="button" onClick={() => setShowLocal((value) => !value)} className={switchClass(showLocal, "local")} aria-pressed={showLocal}>
              <span className={`calendario-feed-dot h-2.5 w-2.5 rounded-full ${showLocal ? "calendario-feed-dot--local" : "calendario-feed-dot--off"}`} />
              Nossos eventos
            </button>
          </div>
        </div>
      </section>

      <section id="calendario-mensal" className="calendario-main-panel rounded-[2rem] p-4 shadow-sm md:p-6">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={ptBrLocale}
          timeZone={EVENT_TIME_ZONE}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          buttonText={{
            today: "Hoje",
          }}
          events={calendarEvents}
          eventDisplay="block"
          fixedWeekCount={false}
          height="auto"
          datesSet={(dateInfo) => {
            setVisibleMonthRange({
              start: new Date(dateInfo.view.currentStart),
              end: new Date(dateInfo.view.currentEnd),
            });
          }}
          eventClick={(info) => {
            if (info.event.url) {
              info.jsEvent.preventDefault();
              window.location.href = info.event.url;
            }
          }}
        />
      </section>

      <section className="calendario-filtered-list-panel rounded-[2rem] p-4 shadow-sm md:p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="calendario-feed-title text-xs font-semibold uppercase tracking-wide">Lista de eventos</p>
          </div>
          <p className="calendario-filtered-count text-sm font-semibold">
            {formatVisibleMonthLabel(visibleMonthRange.start)}: {filteredEvents.length} item(ns)
          </p>
        </div>

        {filteredEvents.length > 0 ? (
          <ul className="calendario-filtered-list mt-4 space-y-3">
            {filteredEvents.map((event, index) => (
              <li key={`${event.type ?? "local"}-${event.title}-${String(event.start)}-${index}`}>
                {event.url ? (
                  <a href={event.url} className="calendario-filtered-item calendario-filtered-item--link block rounded-2xl p-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 space-y-2">
                        <span className={typeClass(event.type)}>{typeLabel(event.type)}</span>
                        <p className="calendario-filtered-title text-sm font-semibold">{event.title}</p>
                        <p className="calendario-filtered-meta text-sm">{formatEventDate(event.start, event.end)}</p>
                        {event.location && <p className="calendario-filtered-meta text-sm">Local: {event.location}</p>}
                      </div>
                      <span className="site-button calendario-filtered-link">Ver evento</span>
                    </div>
                  </a>
                ) : (
                  <button
                    type="button"
                    className="calendario-filtered-item calendario-filtered-item--button block w-full rounded-2xl p-3 text-left"
                    onClick={() => jumpToCalendarDate(event.start)}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 space-y-2">
                        <span className={typeClass(event.type)}>{typeLabel(event.type)}</span>
                        <p className="calendario-filtered-title text-sm font-semibold">{event.title}</p>
                        <p className="calendario-filtered-meta text-sm">{formatEventDate(event.start, event.end)}</p>
                        {event.location && <p className="calendario-filtered-meta text-sm">Local: {event.location}</p>}
                      </div>
                      <span className="site-button calendario-filtered-link">Ver no calendário</span>
                    </div>
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="calendario-filtered-empty mt-4 rounded-2xl p-4 text-sm">Nenhum evento disponível com os filtros ativos.</p>
        )}
      </section>
    </div>
  );
}
