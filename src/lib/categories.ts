export const EVENT_CATEGORIES = [
  "music",
  "sports",
  "family",
  "arts",
  "community",
  "food",
  "outdoor",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  music: "Music",
  sports: "Sports",
  family: "Family",
  arts: "Arts",
  community: "Community",
  food: "Food",
  outdoor: "Outdoor",
};

const CATEGORY_RANK: Record<EventCategory, number> = {
  music: 10,
  family: 20,
  community: 30,
  arts: 40,
  food: 50,
  outdoor: 60,
  sports: 70,
};

export function isEventCategory(value: string): value is EventCategory {
  return (EVENT_CATEGORIES as readonly string[]).includes(value);
}

export function rankCategory(category: EventCategory): number {
  return CATEGORY_RANK[category];
}

export function isFamilyEvent(event: { category: EventCategory }): boolean {
  return event.category === "family";
}

export function isMusicEvent(event: { category: EventCategory }): boolean {
  return event.category === "music";
}

export function isFirstFridayEvent(event: { id?: string; title?: string }): boolean {
  return /first[\s-]?friday/i.test(`${event.id ?? ""} ${event.title ?? ""}`);
}

export function isSportsEvent(event: {
  category: EventCategory;
  id?: string;
  title?: string;
}): boolean {
  if (isFirstFridayEvent(event)) return false;
  return event.category === "sports";
}

/** Date first. Category rank is only a same-timestamp tiebreaker. */
export function sortForTourist<T extends { category: EventCategory; startsAtDate: Date }>(
  events: T[],
): T[] {
  return [...events].sort((left, right) => {
    const byDate = left.startsAtDate.getTime() - right.startsAtDate.getTime();
    if (byDate !== 0) return byDate;
    return rankCategory(left.category) - rankCategory(right.category);
  });
}
