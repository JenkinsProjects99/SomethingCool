import Link from "next/link";
import type { EventRange } from "@/lib/filters";

interface Filter {
  id: EventRange;
  label: string;
  href: string;
}

export function FilterBar({
  filters,
  active,
  labelledBy,
}: {
  filters: Filter[];
  active: EventRange;
  labelledBy: string;
}) {
  return (
    <ul className="filters" role="tablist" aria-labelledby={labelledBy}>
      {filters.map((filter) => {
        const selected = filter.id === active;
        return (
          <li key={filter.id} role="presentation">
            <Link
              className={selected ? "st-primary" : "st-secondary"}
              href={filter.href}
              role="tab"
              aria-selected={selected}
            >
              {filter.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
