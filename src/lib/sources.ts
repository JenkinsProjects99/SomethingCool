export const SOURCE_LABELS: Record<string, string> = {
  paramount: "Paramount Theater Ashland",
  "visit-aky": "Visit AKY",
  "boyd-library": "Boyd County Public Library",
  sandys: "Sandy's",
  sandyridge: "Sandy Ridge",
  "other-official": "Official listing",
  "parks-rec": "Parks & Recreation",
  maxpreps: "MaxPreps",
  facebook: "Facebook",
  school: "School",
};

export const BOYD_LIBRARY_HOST = "www.thebookplace.org";
export const FORBIDDEN_LIBRARY_HOSTS = ["ashland.librarycalendar.com"];

export function sourceLabel(source: string): string {
  return SOURCE_LABELS[source] ?? source;
}

export function assertAllowedEventUrl(source: string, url: string): void {
  const host = new URL(url).hostname.replace(/^www\./, "");
  const forbidden = FORBIDDEN_LIBRARY_HOSTS.some(
    (blocked) => host === blocked.replace(/^www\./, "") || host.endsWith(`.${blocked}`),
  );
  if (forbidden) {
    throw new Error(`${url} is the Ohio library calendar; use ${BOYD_LIBRARY_HOST} only`);
  }
  if (source === "boyd-library") {
    const allowed = host === "thebookplace.org";
    if (!allowed) {
      throw new Error(`boyd-library rows must use https://${BOYD_LIBRARY_HOST}/`);
    }
  }
}
