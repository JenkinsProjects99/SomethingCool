"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MonthCalendar } from "@/components/MonthCalendar";
import { VisitAkyLogo } from "@/components/VisitAkyLogo";
import type { CalendarEvent } from "@/lib/events";
import { formatCardWhen } from "@/lib/format";
import { sourceLabel } from "@/lib/sources";
import {
  eventsForTouristView,
  filterTouristCategory,
  touristWindowEvents,
  type TouristCategory,
  type TouristTime,
} from "@/lib/tourist-feed";

type TimeTab = TouristTime | "calendar";

const TIMES: { id: TimeTab; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "week", label: "This Week" },
  { id: "calendar", label: "Calendar" },
];

const CATEGORIES: { id: TouristCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "music", label: "Music" },
  { id: "sports", label: "Sports" },
  { id: "community", label: "Community" },
];

function PhotoCard({ event, featured }: { event: CalendarEvent; featured: boolean }) {
  return (
    <article
      className={`photo-card photo-card--${event.category} ${featured ? "photo-card--featured" : ""}`}
    >
      <div className="photo-card__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={
            event.image ? "photo-card__image" : "photo-card__image photo-card__image--logo"
          }
          src={event.image ?? "/brand/visit-aky-logo.png"}
          alt=""
        />
      </div>
      <div className="photo-card__body">
        <h2 className="photo-card__title">{event.title}</h2>
        <p className="photo-card__when">
          <time dateTime={event.startsAt}>
            {formatCardWhen(event.startsAtDate, event.dateOnly, event.endsAtDate)}
          </time>
        </p>
        <p className="st-d-paragraph photo-card__venue">{event.venue}</p>
        <p className="st-d-subheading">{sourceLabel(event.source)}</p>
        <a className="st-primary" href={event.url} target="_blank" rel="noreferrer">
          Event Details
        </a>
      </div>
    </article>
  );
}

export function PhoneApp({ events }: { events: CalendarEvent[] }) {
  const [time, setTime] = useState<TimeTab>("week");
  const [category, setCategory] = useState<TouristCategory>("all");
  const now = useMemo(() => new Date(), []);

  const visible = useMemo(
    () => eventsForTouristView(events, time === "calendar" ? "week" : time, category, now),
    [events, time, category, now],
  );
  const calendarEvents = useMemo(
    () => filterTouristCategory(touristWindowEvents(events, now), category),
    [events, category, now],
  );

  return (
    <div className="phone-app">
      <header className="phone-app__top">
        <VisitAkyLogo compact />
        <p className="phone-app__eyebrow">You are now viewing events</p>
        <h1 className="st-d-title">What&apos;s happening</h1>
        <p className="st-d-paragraph">
          {time === "calendar"
            ? "Pick a day. Confirm times before you go."
            : time === "week"
              ? "This week first in Eastern Time. Confirm times before you go."
              : "Upcoming first in Eastern Time. Confirm times before you go."}
        </p>
      </header>

      <div className="phone-times" role="tablist" aria-label="When">
        {TIMES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            className={time === item.id ? "st-primary" : "st-secondary"}
            aria-selected={time === item.id}
            onClick={() => setTime(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="phone-cats" role="tablist" aria-label="Category">
        {CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            className={category === item.id ? "st-primary" : "st-secondary"}
            aria-selected={category === item.id}
            onClick={() => setCategory(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {time === "calendar" ? (
        <main id="main">
          <MonthCalendar events={calendarEvents} now={now} />
        </main>
      ) : (
        <main id="main" className="photo-stack">
          {visible.length === 0 ? (
            <p className="st-d-paragraph empty-state">No published events in this view yet.</p>
          ) : (
            visible.map((event, index) => (
              <PhotoCard key={event.id} event={event} featured={index === 0} />
            ))
          )}
        </main>
      )}

      <footer className="footer-note">
        <p className="st-d-paragraph">
          Partner iframe still lives at <Link className="st-text-link" href="/embed">/embed</Link>.
        </p>
      </footer>
    </div>
  );
}
