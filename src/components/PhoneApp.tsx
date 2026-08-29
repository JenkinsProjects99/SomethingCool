"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { VisitAkyLogo } from "@/components/VisitAkyLogo";
import {
  CATEGORY_LABELS,
  EVENT_CATEGORIES,
  sortForTourist,
  type EventCategory,
} from "@/lib/categories";
import type { CalendarEvent } from "@/lib/events";
import {
  eventInRange,
  eventInWindow,
  startOfToday,
  thisWeekendWindow,
} from "@/lib/filters";
import { formatCardWhen } from "@/lib/format";
import { sourceLabel } from "@/lib/sources";

type DateThumb = "weekend" | "week" | "month";
type ScopeThumb = "upcoming" | "all";
type CategoryThumb = "all" | EventCategory;

const DATE_THUMBS: { id: DateThumb; label: string }[] = [
  { id: "weekend", label: "This weekend" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
];

const SCOPE_THUMBS: { id: ScopeThumb; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "all", label: "All" },
];

export function PhoneApp({ events }: { events: CalendarEvent[] }) {
  const [dateThumb, setDateThumb] = useState<DateThumb>("weekend");
  const [scope, setScope] = useState<ScopeThumb>("upcoming");
  const [category, setCategory] = useState<CategoryThumb>("all");

  const weekend = useMemo(
    () => thisWeekendWindow(new Date(), events.map((event) => ({ startsAt: event.startsAtDate }))),
    [events],
  );

  const visible = useMemo(() => {
    const today = startOfToday();
    return sortForTourist(
      events.filter((event) => {
        if (category !== "all" && event.category !== category) return false;

        if (dateThumb === "weekend") {
          return eventInWindow(event.startsAtDate, weekend);
        }

        const inDate =
          dateThumb === "week"
            ? eventInRange(event.startsAtDate, "week")
            : eventInRange(event.startsAtDate, "month");
        if (!inDate) return false;
        if (scope === "upcoming" && event.startsAtDate < today) return false;
        return true;
      }),
    );
  }, [events, dateThumb, scope, category, weekend]);

  return (
    <div className="phone-app">
      <header className="phone-app__top">
        <VisitAkyLogo compact />
        <p className="phone-app__eyebrow">You are now viewing events</p>
        <h1 className="st-d-title">What&apos;s happening</h1>
        <p className="st-d-paragraph">This weekend in Ashland. Confirm times before you go.</p>
      </header>

      <div className="phone-filters">
        <div className="phone-thumbs" role="tablist" aria-label="Date">
          {DATE_THUMBS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              className={dateThumb === item.id ? "st-primary" : "st-secondary"}
              aria-selected={dateThumb === item.id}
              onClick={() => setDateThumb(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="phone-thumbs phone-thumbs--scope" role="tablist" aria-label="Upcoming or all">
          {SCOPE_THUMBS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              className={scope === item.id ? "st-primary" : "st-secondary"}
              aria-selected={scope === item.id}
              onClick={() => setScope(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="phone-thumbs phone-thumbs--category" role="tablist" aria-label="Category">
          <button
            type="button"
            role="tab"
            className={category === "all" ? "st-primary" : "st-secondary"}
            aria-selected={category === "all"}
            onClick={() => setCategory("all")}
          >
            All
          </button>
          {EVENT_CATEGORIES.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              className={category === id ? "st-primary" : "st-secondary"}
              aria-selected={category === id}
              onClick={() => setCategory(id)}
            >
              {CATEGORY_LABELS[id]}
            </button>
          ))}
        </div>
      </div>

      <main id="main" className="photo-stack">
        {visible.length === 0 ? (
          <p className="st-d-paragraph empty-state">No published events in this view yet.</p>
        ) : (
          visible.map((event, index) => (
            <a
              key={event.id}
              className={`photo-card photo-card--${event.category} ${index === 0 ? "photo-card--featured" : ""}`}
              href={event.url}
              target="_blank"
              rel="noreferrer"
            >
              {event.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="photo-card__image" src={event.image} alt="" />
              ) : (
                <div className="photo-card__fallback" aria-hidden="true" />
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
