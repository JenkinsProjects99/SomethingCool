import Link from "next/link";
import type { CalendarEvent } from "@/lib/events";
import { formatCompactVenue, formatListDate, formatTimeRange } from "@/lib/format";

export function EventList({
  events,
  actionLabel,
  actionHref,
}: {
  events: CalendarEvent[];
  actionLabel: "Details" | "Go";
  actionHref?: (event: CalendarEvent) => string;
}) {
  return (
    <ol className="event-list">
      {events.map((event) => {
        const date = formatListDate(event.startsAtDate);
        const href = actionHref?.(event) ?? event.url;
        const external = href.startsWith("http");
        return (
          <li className="event-row" key={event.slug}>
            <p className="event-row__date">
              <time dateTime={event.startsAt}>
                {date.weekday}
                <br />
                {date.monthDay}
              </time>
            </p>
            <div>
              <h3 className="event-row__title">{event.title}</h3>
              <p className="st-d-paragraph">
                {formatTimeRange(event.startsAtDate, event.endsAtDate)}
                {" · "}
                {formatCompactVenue(event.venue)}
              </p>
            </div>
            {external ? (
              <a className="st-text-link" href={href} target="_blank" rel="noreferrer">
                {actionLabel}
              </a>
            ) : (
              <Link className="st-text-link" href={href}>
                {actionLabel}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}
