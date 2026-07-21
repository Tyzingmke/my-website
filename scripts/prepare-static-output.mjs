import { cpSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const source = resolve("out");
const destination = resolve("dist");

if (!existsSync(source)) {
  throw new Error("Next.js static output was not found in out/.");
}

rmSync(destination, { recursive: true, force: true });
cpSync(source, destination, { recursive: true });
