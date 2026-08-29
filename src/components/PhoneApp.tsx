"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MonthCalendar } from "@/components/MonthCalendar";
import { VisitAkyLogo } from "@/components/VisitAkyLogo";
import { cardImageSrc } from "@/lib/card-image";
import type { CalendarEvent } from "@/lib/events";
import { firstScreenUsedUpcoming, startOfToday } from "@/lib/filters";
import { formatCardWhen } from "@/lib/format";
import { sourceLabel } from "@/lib/sources";
import { eventsForThumb, type TouristThumb } from "@/lib/tourist-feed";

type View = "cards" | "calendar";

const THUMBS: { id: TouristThumb; label: string }[] = [
  { id: "weekend", label: "This weekend" },
  { id: "music", label: "Music" },
  { id: "sports", label: "Sports" },
  { id: "family", label: "Family" },
];

function PhotoCard({ event, featured }: { event: CalendarEvent; featured: boolean }) {
  return (
    <a
      className={`photo-card photo-card--${event.category} ${featured ? "photo-card--featured" : ""}`}
      href={event.url}
      target="_blank"
      rel="noreferrer"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={
          event.image ? "photo-card__image" : "photo-card__image photo-card__image--logo"
        }
        src={cardImageSrc(event.image)}
        alt=""
      />
      <div className="photo-card__overlay">
        <h2 className="photo-card__title">{event.title}</h2>
        <p className="photo-card__when">
          <time dateTime={event.startsAt}>
            {formatCardWhen(event.startsAtDate, event.dateOnly, event.endsAtDate)}
          </time>
        </p>
        <p className="st-d-subheading">{sourceLabel(event.source)}</p>
      </div>
    </a>
  );
}

export function PhoneApp({ events }: { events: CalendarEvent[] }) {
  const [thumb, setThumb] = useState<TouristThumb>("weekend");
  const [view, setView] = useState<View>("cards");
  const now = useMemo(() => new Date(), []);

  const visible = useMemo(() => eventsForThumb(events, thumb, now), [events, thumb, now]);

  const calendarEvents = useMemo(() => {
    if (thumb === "weekend") {
      return events.filter((event) => event.startsAtDate >= startOfToday(now));
    }
    return visible;
  }, [events, thumb, visible, now]);

  const usedUpcoming =
    thumb === "weekend" &&
    firstScreenUsedUpcoming(
      events.map((event) => ({ startsAt: event.startsAtDate })),
      now,
    );

  const blurb =
    thumb === "weekend"
      ? usedUpcoming
        ? "Coming up in Ashland. Confirm times before you go."
        : "This weekend in Ashland. Confirm times before you go."
      : thumb === "music"
        ? "Live music in Ashland. Confirm times before you go."
        : thumb === "sports"
          ? "Local games in Ashland. Confirm times before you go."
          : "Family shows in Ashland. Confirm times before you go.";

  return (
    <div className="phone-app">
      <header className="phone-app__top">
        <VisitAkyLogo compact />
        <p className="phone-app__eyebrow">You are now viewing events</p>
        <h1 className="st-d-title">What&apos;s happening</h1>
        <p className="st-d-paragraph">{blurb}</p>
      </header>

      <div className="phone-thumbs" role="tablist" aria-label="Quick filters">
        {THUMBS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            className={thumb === item.id ? "st-primary" : "st-secondary"}
            aria-selected={thumb === item.id}
            onClick={() => setThumb(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="phone-views" role="group" aria-label="View">
        <button
          type="button"
          className={view === "cards" ? "st-primary" : "st-secondary"}
          aria-pressed={view === "cards"}
          onClick={() => setView("cards")}
        >
          Cards
        </button>
        <button
          type="button"
          className={view === "calendar" ? "st-primary" : "st-secondary"}
          aria-pressed={view === "calendar"}
          onClick={() => setView("calendar")}
        >
          Calendar
        </button>
      </div>

      {view === "calendar" ? (
        <MonthCalendar events={calendarEvents} />
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
