import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = join(root, ".env");
const example = join(root, ".env.example");

if (!existsSync(env) && existsSync(example)) {
  copyFileSync(example, env);
  console.log("Wrote .env from .env.example (local dummy values).");
}
