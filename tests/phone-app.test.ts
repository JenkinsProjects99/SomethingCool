import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("tourist phone preview", () => {
  const phone = readFileSync(path.join(process.cwd(), "src/components/PhoneApp.tsx"), "utf8");

  it("defaults to This Week with Joanna's two-row IA and logo fallback", () => {
    expect(phone).toContain('useState<TimeTab>("week")');
    expect(phone).toContain("Upcoming");
    expect(phone).toContain("This Week");
    expect(phone).toContain("Calendar");
    expect(phone).toContain("Community");
    expect(phone).toContain("Family");
    expect(phone).toContain("MonthCalendar");
    expect(phone).toContain('event.image ?? "/brand/visit-aky-logo.png"');
    expect(phone).not.toMatch(/chip|pill|badge/i);
  });
});

describe("Dana weekend preview", () => {
  const dana = readFileSync(path.join(process.cwd(), "public/dana.html"), "utf8");

  it("shows Sean's verified weekend rows with the Visit AKY logo fallback", () => {
    expect(dana).toContain("ashland-tomcats-volleyball-johnson-central-2026-08-29");
    expect(dana).toContain("fairview-eagles-volleyball-rose-hill-2026-08-29");
    expect(dana).toContain("ashland-tomcats-volleyball-wolfe-county-2026-08-29");
    expect(dana).toContain("sandys-exacta-giveaway-bronco-sport-2026-08-29");
    expect(dana).toContain("boyd-library-midland-novel-tea-book-club-2026-08-31");
    expect(dana).toContain("boyd-lions-girls-soccer-greenup-2026-08-31");
    expect(dana).toContain("boyd-lions-boys-soccer-greenup-2026-08-31");
    expect(dana).toContain("./brand/visit-aky-logo.png");
    expect(dana).toContain("Calendar");
    expect(dana).toContain("This Week");
    expect(dana).toContain("Community");
    expect(dana).toContain("Family");
    expect(dana).toContain("filterSports");
    expect(dana).toContain('data-time="week"');
    expect(dana).toContain('data-cat="sports"');
    expect(dana).toContain('data-cat="community"');
    expect(dana).toContain("photo-card__image--logo");
    expect(dana).toContain("linear-gradient(160deg, #326dcd, #7b5bbb)");
    expect(dana).not.toMatch(/background:\s*#000/);
    expect(dana).toMatch(/first\[\\s-\]\?friday/i);
    expect(dana).not.toMatch(/first-friday-august|first-friday-september|First Friday August|First Friday September/);
    expect(dana).not.toMatch(/localhost/);
    expect(dana).not.toContain("disabled>");
    expect(dana).toContain("(left.startsMs - right.startsMs)");
    expect(dana).not.toContain("(RANK[left.category] - RANK[right.category]) || (left.startsMs - right.startsMs)");
  });
});
