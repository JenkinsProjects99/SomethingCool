"use client";

import { useMemo, useState } from "react";
import type { CalendarEvent } from "@/lib/events";
import { formatKickerDay, formatTime } from "@/lib/format";
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

function calendarCells(year: number, month: number) {
  const lead = firstWeekday(year, month);
  const count = daysInMonth(year, month);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevCount = daysInMonth(prevYear, prevMonth);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const cells: { year: number; month: number; day: number; inMonth: boolean }[] = [];
  for (let offset = lead - 1; offset >= 0; offset -= 1) {
    cells.push({ year: prevYear, month: prevMonth, day: prevCount - offset, inMonth: false });
  }
  for (let day = 1; day <= count; day += 1) {
    cells.push({ year, month, day, inMonth: true });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ year: nextYear, month: nextMonth, day: nextDay, inMonth: false });
    nextDay += 1;
  }
  return cells;
}

function selectedDate(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 16));
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

  const cells = useMemo(() => calendarCells(cursor.year, cursor.month), [cursor]);
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
        {cells.map((cell) => {
          const key = keyFor(cell.year, cell.month, cell.day);
          const count = byDay.get(key)?.length ?? 0;
          const other = cell.inMonth ? "" : " month-cal__cell--other";
          const on = selected === key ? " month-cal__cell--on" : "";
          return (
            <button
              key={key}
              type="button"
              className={`month-cal__cell${on}${other}`}
              onClick={() => setSelected(key)}
            >
              <span>{cell.day}</span>
              {count > 0 ? <i className="month-cal__dot" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
      <h3 className="section-kicker month-cal__agenda-kicker">{formatKickerDay(selectedDate(selected))}</h3>
      <ol className="month-cal__list">
        {selectedEvents.length === 0 ? (
          <li className="st-d-paragraph">No events on this date. Pick a dotted day.</li>
        ) : (
          selectedEvents.map((event) => (
            <li key={event.id}>
              <p className="month-cal__when">
                {event.dateOnly ? formatKickerDay(event.startsAtDate) : formatTime(event.startsAtDate)}
              </p>
              <strong>{event.title}</strong>
              <span className="month-cal__venue">{event.venue}</span>
              <span className="st-d-subheading photo-card__source">{sourceLabel(event.source)}</span>
              <a className="st-primary" href={event.url} target="_blank" rel="noreferrer">
                Event Details
              </a>
            </li>
          ))
        )}
      </ol>
    </section>
  );
}
