export type EventCategory =
  | "festivals"
  | "music"
  | "downtown"
  | "sports"
  | "library"
  | "food";

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  festivals: "Festivals",
  music: "Music",
  downtown: "Downtown",
  sports: "Sports",
  library: "Library",
  food: "Food",
};

const SOURCE_CATEGORY: Record<string, EventCategory> = {
  facebook: "festivals",
  paramount: "music",
  "visit-aky": "downtown",
  school: "sports",
  maxpreps: "sports",
  "parks-rec": "downtown",
  "other-official": "downtown",
  "boyd-library": "library",
  sandys: "food",
  sandyridge: "food",
};

const CATEGORY_RANK: Record<EventCategory, number> = {
  festivals: 10,
  music: 20,
  downtown: 30,
  food: 40,
  sports: 50,
  library: 90,
};

export function categoryForSource(source: string): EventCategory {
  return SOURCE_CATEGORY[source] ?? "downtown";
}

export function rankEvent(source: string): number {
  return CATEGORY_RANK[categoryForSource(source)];
}

const FAMILY_TITLE =
  /sesame|blippi|ballet|makers|holiday|first friday|walking|mural|nutcracker|storytime|scavenger|kids|family|youth/i;

export function isFamilyEvent(event: { source: string; title: string }): boolean {
  if (event.source === "visit-aky" || event.source === "boyd-library") return true;
  return FAMILY_TITLE.test(event.title);
}

export function isMusicEvent(event: { source: string }): boolean {
  return categoryForSource(event.source) === "music";
}

export function isSportsEvent(event: { source: string }): boolean {
  return categoryForSource(event.source) === "sports";
}

export function sortForTourist<T extends { source: string; startsAtDate: Date }>(
  events: T[],
): T[] {
  return [...events].sort((left, right) => {
    const rank = rankEvent(left.source) - rankEvent(right.source);
    if (rank !== 0) return rank;
    return left.startsAtDate.getTime() - right.startsAtDate.getTime();
  });
}
