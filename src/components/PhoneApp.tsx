"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MonthCalendar } from "@/components/MonthCalendar";
import { VisitAkyLogo } from "@/components/VisitAkyLogo";
import type { CalendarEvent } from "@/lib/events";
import { formatCardWhen } from "@/lib/format";
import { sourceLabel } from "@/lib/sources";
import {
  eventsForTouristView,
  featuredForTouristView,
  filterTouristCategory,
  touristWindowEvents,
  type TouristCategory,
  type TouristTime,
} from "@/lib/tourist-feed";

type TimeTab = TouristTime | "calendar";

const TIMES: { id: TimeTab; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "weekend", label: "Weekend" },
  { id: "week", label: "Week" },
  { id: "calendar", label: "Cal" },
];

const CATEGORIES: { id: TouristCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "music", label: "Music" },
  { id: "sports", label: "Sports" },
  { id: "community", label: "Community" },
];

const TIME_SECTION: Record<TouristTime, string> = {
  today: "Today",
  weekend: "This Weekend",
  week: "This Week",
};

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
  const [time, setTime] = useState<TimeTab>("weekend");
  const [category, setCategory] = useState<TouristCategory>("all");
  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "upcoming") setTime("weekend");
    if (hash === "today" || hash === "weekend" || hash === "week" || hash === "calendar") {
      setTime(hash);
    }
    if (hash === "family") setCategory("community");
    if (hash === "music" || hash === "sports" || hash === "community") setCategory(hash);
  }, []);

  const visible = useMemo(
    () => eventsForTouristView(events, time === "calendar" ? "week" : time, category, now),
    [events, time, category, now],
  );
  const featured = useMemo(
    () => featuredForTouristView(events, category, now),
    [events, category, now],
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
            : time === "today"
              ? "Today in Eastern Time. Confirm times before you go."
              : time === "weekend"
                ? "This weekend first in Eastern Time. Confirm times before you go."
                : "This week first in Eastern Time. Confirm times before you go."}
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
            className={category === item.id ? "phone-cats__on" : "phone-cats__off"}
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
        <main id="main">
          {featured.length > 0 ? (
            <section className="featured-block" aria-label="Featured">
              <h2 className="section-kicker">Featured</h2>
              <div className="featured-grid">
                {featured.map((event) => (
                  <PhotoCard key={event.id} event={event} featured />
                ))}
              </div>
            </section>
          ) : null}
          <section className="time-block" aria-label={TIME_SECTION[time]}>
            <h2 className="section-kicker">{TIME_SECTION[time]}</h2>
            <div className="photo-stack">
              {visible.length === 0 ? (
                <p className="st-d-paragraph empty-state">No published events in this view yet.</p>
              ) : (
                visible.map((event) => (
                  <PhotoCard key={event.id} event={event} featured={false} />
                ))
              )}
            </div>
          </section>
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
