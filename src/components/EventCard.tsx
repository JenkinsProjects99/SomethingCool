import Link from "next/link";
import { cardImageSrc } from "@/lib/card-image";
import type { CalendarEvent } from "@/lib/events";
import { formatCardWhen } from "@/lib/format";
import { sourceLabel } from "@/lib/sources";

export function EventCard({
  event,
  variant = "primary",
  detailsHref,
}: {
  event: CalendarEvent;
  variant?: "primary" | "secondary";
  detailsHref?: string;
}) {
  const href = detailsHref ?? event.url;
  const external = href.startsWith("http");

  return (
    <article className="event-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={event.image ? "event-card__image" : "event-card__image event-card__image--logo"}
        src={cardImageSrc(event.image)}
        alt=""
      />
      <p className="event-card__when">
        <time dateTime={event.startsAt}>
          {formatCardWhen(event.startsAtDate, event.dateOnly, event.endsAtDate)}
        </time>
      </p>
      <h3 className="event-card__title">{event.title}</h3>
      <p className="st-d-paragraph">{event.venue}</p>
      <p className="st-d-subheading">{sourceLabel(event.source)}</p>
      {external ? (
        <a
          className={variant === "primary" ? "st-primary" : "st-secondary"}
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          Event details
        </a>
      ) : (
        <Link className={variant === "primary" ? "st-primary" : "st-secondary"} href={href}>
          Event details
        </Link>
      )}
    </article>
  );
}
