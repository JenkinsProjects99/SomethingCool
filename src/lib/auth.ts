import { createHash, timingSafeEqual } from "node:crypto";
import { UnauthorizedError } from "./tenant";

export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function parseBearer(header: string | null | undefined): string {
  if (!header) {
    throw new UnauthorizedError();
  }
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
  if (!match?.[1]) {
    throw new UnauthorizedError();
  }
  return match[1];
}

export function tokensEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}
