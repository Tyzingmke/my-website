import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const serverEntry = resolve("dist/server/index.js");
const hostingSource = resolve(".openai/hosting.json");
const hostingDirectory = resolve("dist/.openai");
const hostingDestination = resolve(hostingDirectory, "hosting.json");

if (!existsSync(serverEntry)) {
  throw new Error("vinext server entry was not found in dist/server/index.js.");
}

if (!existsSync(hostingSource)) {
  throw new Error("Sites metadata was not found in .openai/hosting.json.");
}

mkdirSync(hostingDirectory, { recursive: true });
copyFileSync(hostingSource, hostingDestination);

console.log("Sites bundle is ready in dist/.");
