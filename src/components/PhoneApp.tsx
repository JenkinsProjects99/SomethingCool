"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { VisitAkyLogo } from "@/components/VisitAkyLogo";
import {
  isFamilyEvent,
  isMusicEvent,
  isSportsEvent,
  sortForTourist,
} from "@/lib/categories";
import type { CalendarEvent } from "@/lib/events";
import { eventInWindow, startOfToday, thisWeekendWindow } from "@/lib/filters";
import { formatCardWhen } from "@/lib/format";
import { sourceLabel } from "@/lib/sources";

type Thumb = "weekend" | "music" | "sports" | "family";

const THUMBS: { id: Thumb; label: string }[] = [
  { id: "weekend", label: "This weekend" },
  { id: "music", label: "Music" },
  { id: "sports", label: "Sports" },
  { id: "family", label: "Family" },
];

export function PhoneApp({ events }: { events: CalendarEvent[] }) {
  const [thumb, setThumb] = useState<Thumb>("weekend");

  const weekend = useMemo(
    () => thisWeekendWindow(new Date(), events.map((event) => ({ startsAt: event.startsAtDate }))),
    [events],
  );

  const visible = useMemo(() => {
    const today = startOfToday();
    return sortForTourist(
      events.filter((event) => {
        if (event.startsAtDate < today) return false;
        if (thumb === "weekend") return eventInWindow(event.startsAtDate, weekend);
        if (thumb === "music") return isMusicEvent(event);
        if (thumb === "sports") return isSportsEvent(event);
        return isFamilyEvent(event);
      }),
    );
  }, [events, thumb, weekend]);

  return (
    <div className="phone-app">
      <header className="phone-app__top">
        <VisitAkyLogo compact />
        <p className="phone-app__eyebrow">You are now viewing events</p>
        <h1 className="st-d-title">What&apos;s happening</h1>
        <p className="st-d-paragraph">This weekend in Ashland. Confirm times before you go.</p>
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

      <main id="main" className="photo-stack">
        {visible.length === 0 ? (
          <p className="st-d-paragraph empty-state">No published events in this view yet.</p>
        ) : (
          visible.map((event, index) => (
            <a
              key={event.id}
              className={`photo-card photo-card--${thumb} ${index === 0 ? "photo-card--featured" : ""}`}
              href={event.url}
              target="_blank"
              rel="noreferrer"
            >
              {event.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="photo-card__image" src={event.image} alt="" />
              ) : (
                <div className="photo-card__placeholder" aria-hidden="true" />
              )}
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
