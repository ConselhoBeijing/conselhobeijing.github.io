import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = path.resolve(import.meta.dirname, "..");
const eventUtils = await import(new URL("../src/utils/events.ts", import.meta.url));

function read(relPath) {
  return readFileSync(path.join(root, relPath), "utf8");
}

test("event helpers format stored and editor datetimes in the fixed timezone", () => {
  assert.equal(typeof eventUtils.toEventTimezoneISOString, "function");
  assert.equal(typeof eventUtils.toEventDateTimeInput, "function");
  assert.equal(typeof eventUtils.toEventDayValue, "function");

  const date = new Date("2024-07-10T04:00:00.000Z");

  assert.equal(eventUtils.toEventTimezoneISOString(date), "2024-07-10T12:00:00.000+08:00");
  assert.equal(eventUtils.toEventDateTimeInput(date), "2024-07-10T12:00");
  assert.equal(eventUtils.toEventDayValue(date), 20240710);
});

test("events collection uses the fixed timezone field instead of the stock Keystatic datetime field", () => {
  const config = read("keystatic.config.ts");

  assert.ok(config.includes("fixedTimezoneDatetimeField"));
  assert.ok(!config.includes('start: fields.datetime({ label: "Início" })'));
  assert.ok(!config.includes('end: fields.datetime({ label: "Término" })'));
});
