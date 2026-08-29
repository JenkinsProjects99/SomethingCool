"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { VisitAkyLogo } from "@/components/VisitAkyLogo";
import {
  CATEGORY_LABELS,
  categoryForSource,
  sortForTourist,
  type EventCategory,
} from "@/lib/categories";
import type { CalendarEvent } from "@/lib/events";
import { eventInRange, startOfToday } from "@/lib/filters";
import { formatCardWhen } from "@/lib/format";
import { sourceLabel } from "@/lib/sources";

type RangeTab = "upcoming" | "all";

function eventDateKey(event: CalendarEvent): string {
  return event.startsAt.slice(0, 10);
}

export function PhoneApp({ events }: { events: CalendarEvent[] }) {
  const [range, setRange] = useState<RangeTab>("upcoming");
  const [category, setCategory] = useState<EventCategory | "all">("all");
  const [date, setDate] = useState("");

  const visible = useMemo(() => {
    const now = new Date();
    const today = startOfToday(now);
    return sortForTourist(
      events.filter((event) => {
        if (range === "upcoming" && event.startsAtDate < today) return false;
        if (range === "all" && !eventInRange(event.startsAtDate, "all", now)) return false;
        if (category !== "all" && categoryForSource(event.source) !== category) return false;
        if (date && eventDateKey(event) !== date) return false;
        return true;
      }),
    );
  }, [events, range, category, date]);

  const categories = useMemo(() => {
    const present = new Set(events.map((event) => categoryForSource(event.source)));
    return (Object.keys(CATEGORY_LABELS) as EventCategory[]).filter((key) => present.has(key));
  }, [events]);

  return (
    <div className="phone-app">
      <header className="phone-app__top">
        <VisitAkyLogo compact />
        <h1 className="st-d-title">What&apos;s happening</h1>
        <p className="st-d-paragraph">Ashland, Kentucky. Confirm times before you go.</p>
      </header>

      <div className="phone-filters" role="search">
        <div className="filters" role="tablist" aria-label="When">
          <button
            type="button"
            role="tab"
            className={range === "upcoming" ? "st-primary" : "st-secondary"}
            aria-selected={range === "upcoming"}
            onClick={() => setRange("upcoming")}
          >
            Upcoming
          </button>
          <button
            type="button"
            role="tab"
            className={range === "all" ? "st-primary" : "st-secondary"}
            aria-selected={range === "all"}
            onClick={() => setRange("all")}
          >
            All
          </button>
        </div>

        <label className="phone-date">
          <span className="st-d-subheading">Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>

        <div className="filters" role="tablist" aria-label="Category">
          <button
            type="button"
            role="tab"
            className={category === "all" ? "st-primary" : "st-secondary"}
            aria-selected={category === "all"}
            onClick={() => setCategory("all")}
          >
            All
          </button>
          {categories.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              className={category === key ? "st-primary" : "st-secondary"}
              aria-selected={category === key}
              onClick={() => setCategory(key)}
            >
              {CATEGORY_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <main id="main" className="photo-stack">
        {visible.length === 0 ? (
          <p className="st-d-paragraph empty-state">No published events in this view yet.</p>
        ) : (
          visible.map((event) => (
            <article key={event.id} className={`photo-card photo-card--${categoryForSource(event.source)}`}>
              {event.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="photo-card__image" src={event.image} alt="" />
              ) : (
                <div className="photo-card__placeholder" aria-hidden="true" />
              )}
              <div className="photo-card__body">
                <p className="event-card__when">
                  <time dateTime={event.startsAt}>
                    {formatCardWhen(event.startsAtDate, event.dateOnly, event.endsAtDate)}
                  </time>
                </p>
                <h2 className="photo-card__title">{event.title}</h2>
                <p className="st-d-paragraph">{event.venue}</p>
                <p className="st-d-subheading">{sourceLabel(event.source)}</p>
                <a className="st-primary" href={event.url} target="_blank" rel="noreferrer">
                  Event details
                </a>
              </div>
            </article>
          ))
        )}
      </main>

      <footer className="footer-note">
        <p className="st-d-paragraph">
          Partner iframe still lives at <Link className="st-text-link" href="/embed">/embed</Link>.
        </p>
      </footer>
    </div>
  );
}
