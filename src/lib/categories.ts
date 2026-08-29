import { EVENT_CATEGORIES, type PublicEventCategory } from "./fields";

export type EventCategory = PublicEventCategory;

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  music: "Music",
  sports: "Sports",
  family: "Family",
  arts: "Arts",
  community: "Community",
  food: "Food",
  outdoor: "Outdoor",
};

const SOURCE_CATEGORY: Record<string, EventCategory> = {
  paramount: "music",
  maxpreps: "sports",
  school: "sports",
  facebook: "community",
  "visit-aky": "community",
  "boyd-library": "family",
  sandys: "food",
  sandyridge: "food",
  "parks-rec": "outdoor",
  "other-official": "community",
};

const FAMILY_TITLE = /sesame|blippi|nutcracker|festival of trees/i;

const CATEGORY_RANK: Record<EventCategory, number> = {
  music: 10,
  family: 20,
  community: 30,
  arts: 40,
  food: 50,
  outdoor: 60,
  sports: 70,
};

export function categoryForEvent(event: {
  category?: string | null;
  source: string;
  title?: string;
}): EventCategory {
  if (event.title && FAMILY_TITLE.test(event.title)) return "family";
  // `community` is the DB default when seed omitted category — still infer.
  if (
    event.category &&
    event.category !== "community" &&
    (EVENT_CATEGORIES as readonly string[]).includes(event.category)
  ) {
    return event.category as EventCategory;
  }
  return SOURCE_CATEGORY[event.source] ?? "community";
}

export function isFamilyEvent(event: { category: EventCategory }): boolean {
  return event.category === "family";
}

export function isMusicEvent(event: { category: EventCategory }): boolean {
  return event.category === "music";
}

export function isSportsEvent(event: { category: EventCategory }): boolean {
  return event.category === "sports";
}

export function sortForTourist<T extends { category: EventCategory; startsAtDate: Date }>(
  events: T[],
): T[] {
  return [...events].sort((left, right) => {
    const rank = CATEGORY_RANK[left.category] - CATEGORY_RANK[right.category];
    if (rank !== 0) return rank;
    return left.startsAtDate.getTime() - right.startsAtDate.getTime();
  });
}
