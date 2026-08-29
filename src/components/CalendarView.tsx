import { EventCard } from "@/components/EventCard";
import { EventList } from "@/components/EventList";
import { FilterBar } from "@/components/FilterBar";
import { VisitAkyLogo } from "@/components/VisitAkyLogo";
import type { CalendarEvent } from "@/lib/events";
import { splitFeatured } from "@/lib/events";
import type { EventRange } from "@/lib/filters";

export function CalendarView({
  mode,
  range,
  events,
}: {
  mode: "public" | "embed";
  range: EventRange;
  events: CalendarEvent[];
}) {
  const { featured, rest } = splitFeatured(events);
  const embed = mode === "embed";

  const filters = embed
    ? [
        { id: "upcoming" as const, label: "Upcoming", href: "/embed?range=upcoming" },
        { id: "all" as const, label: "All", href: "/embed?range=all" },
      ]
    : [
        { id: "month" as const, label: "This month", href: "/?range=month" },
        { id: "week" as const, label: "This week", href: "/?range=week" },
        { id: "all" as const, label: "All", href: "/?range=all" },
      ];

  return (
    <div className={embed ? "shell shell--embed" : "shell"}>
      <header>
        <VisitAkyLogo compact={embed} />
        {!embed ? (
          <div className="intro">
            <h1 id="calendar-heading" className="st-d-title">
              What&apos;s happening
            </h1>
            <p className="st-d-paragraph">
              Live music, makers, and downtown. Confirm times before you go.
            </p>
          </div>
        ) : (
          <h1 id="calendar-heading" className="visually-hidden">
            Visit AKY events
          </h1>
        )}
      </header>

      <main id="main">
        <FilterBar filters={filters} active={range} labelledBy="calendar-heading" />

        {events.length === 0 ? (
          <div className="empty-state">
            <p className="st-d-paragraph">No published events in this range yet.</p>
          </div>
        ) : (
          <>
            {featured.length > 0 ? (
              <section className="card-grid" aria-label="Featured events">
                {featured.map((event, index) => (
                  <EventCard
                    key={event.slug}
                    event={event}
                    variant={embed && index === 1 ? "secondary" : "primary"}
                    detailsHref={embed ? `/embed/${event.slug}` : event.url}
                  />
                ))}
              </section>
            ) : null}

            {rest.length > 0 ? (
              <EventList
                events={rest}
                actionLabel={embed ? "Go" : "Details"}
                actionHref={embed ? (event) => `/embed/${event.slug}` : undefined}
              />
            ) : null}
          </>
        )}
      </main>

      <footer className="footer-note">
        <p className="st-d-paragraph">
          {embed
            ? "Paste iframe on visitaky.com or a partner page."
            : "Sources on each listing: Paramount Theater Ashland, Visit AKY."}
        </p>
      </footer>
    </div>
  );
}
