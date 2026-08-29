/** Client-only fallback. Never write this URL into seed JSON or the GET payload. */
export const VISIT_AKY_LOGO_SRC = "/brand/visit-aky-logo.png";

export function cardImageSrc(image: string | null | undefined): string {
  return image ?? VISIT_AKY_LOGO_SRC;
}
