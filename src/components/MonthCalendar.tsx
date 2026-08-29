"use client";

import { useMemo, useState } from "react";
import type { CalendarEvent } from "@/lib/events";
import { formatCardWhen } from "@/lib/format";
import { sourceLabel } from "@/lib/sources";

const TIME_ZONE = "America/New_York";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function zonedYmd(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: read("year"), month: read("month"), day: read("day") };
}

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(Date.UTC(year, month - 1, 15)),
  );
}

function keyFor(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function firstWeekday(year: number, month: number) {
  return new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
}

export function MonthCalendar({
  events,
  now = new Date(),
}: {
  events: CalendarEvent[];
  now?: Date;
}) {
  const today = zonedYmd(now);
  const [cursor, setCursor] = useState({ year: today.year, month: today.month });
  const [selected, setSelected] = useState(keyFor(today.year, today.month, today.day));

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const { year, month, day } = zonedYmd(event.startsAtDate);
      const key = keyFor(year, month, day);
      const list = map.get(key) ?? [];
      list.push(event);
      list.sort((left, right) => left.startsAtDate.getTime() - right.startsAtDate.getTime());
      map.set(key, list);
    }
    return map;
  }, [events]);

  const cells = useMemo(() => {
    const blanks = firstWeekday(cursor.year, cursor.month);
    const count = daysInMonth(cursor.year, cursor.month);
    return [
      ...Array.from({ length: blanks }, () => null),
      ...Array.from({ length: count }, (_, index) => index + 1),
    ];
  }, [cursor]);

  const selectedEvents = byDay.get(selected) ?? [];

  function shiftMonth(delta: number) {
    const date = new Date(Date.UTC(cursor.year, cursor.month - 1 + delta, 1));
    setCursor({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 });
  }

  return (
    <section className="month-cal" aria-label="Calendar">
      <div className="month-cal__nav">
        <button type="button" className="st-secondary" onClick={() => shiftMonth(-1)}>
          Prev
        </button>
        <h2 className="month-cal__title">{monthLabel(cursor.year, cursor.month)}</h2>
        <button type="button" className="st-secondary" onClick={() => shiftMonth(1)}>
          Next
        </button>
      </div>
      <div className="month-cal__grid" role="grid" aria-label={monthLabel(cursor.year, cursor.month)}>
        {WEEKDAYS.map((day) => (
          <p key={day} className="month-cal__dow">
            {day}
          </p>
        ))}
        {cells.map((day, index) => {
          if (!day) return <div key={`b-${index}`} className="month-cal__cell month-cal__cell--empty" />;
          const key = keyFor(cursor.year, cursor.month, day);
          const count = byDay.get(key)?.length ?? 0;
          return (
            <button
              key={key}
              type="button"
              className={`month-cal__cell ${selected === key ? "month-cal__cell--on" : ""} ${count ? "month-cal__cell--has" : ""}`}
              onClick={() => setSelected(key)}
            >
              <span>{day}</span>
              {count > 0 ? <i className="month-cal__dot" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
      <ol className="month-cal__list">
        {selectedEvents.length === 0 ? (
          <li className="st-d-paragraph">No events on this date. Pick a dotted day.</li>
        ) : (
          selectedEvents.map((event) => (
            <li key={event.id}>
              <a href={event.url} target="_blank" rel="noreferrer">
                <strong>{event.title}</strong>
                <span>
                  {formatCardWhen(event.startsAtDate, event.dateOnly, event.endsAtDate)}
                  {" · "}
                  {sourceLabel(event.source)}
                </span>
              </a>
            </li>
          ))
        )}
      </ol>
    </section>
  );
}
