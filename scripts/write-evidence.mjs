import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

export function writeEvidence(value) {
  const args = process.argv.slice(2);
  const json = `${JSON.stringify(value, null, 2)}\n`;
  if (args.length === 0) {
    process.stdout.write(json);
    return;
  }
  if (args.length !== 2 || args[0] !== "--output") {
    throw new Error("Usage: node SCRIPT [--output FILE.json]");
  }
  const output = resolve(args[1]);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, json);
  console.log(JSON.stringify({ result: value.result, output: args[1] }));
}
