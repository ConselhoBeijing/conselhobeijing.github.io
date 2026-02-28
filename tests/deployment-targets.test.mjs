import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = path.resolve(import.meta.dirname, "..");

function read(relPath) {
  return readFileSync(path.join(root, relPath), "utf8");
}

test("astro config defaults to vercel and only enables adapter/keystatic outside the pages target", () => {
  const config = read("astro.config.mjs");

  assert.ok(config.includes('process.env.DEPLOY_TARGET ?? "vercel"'));
  assert.ok(config.includes("...(isVercel ? [keystatic()] : [])"));
  assert.ok(config.includes("...(isVercel ? { adapter: vercel() } : {})"));
  assert.ok(!config.includes("integrations: [react(), markdoc(), keystatic()]"));
  assert.ok(!config.includes("adapter: vercel(),"));
});

test("package scripts and github pages workflow use the pages-specific build target", () => {
  const pkg = read("package.json");
  const workflow = read(".github/workflows/deploy.yml");

  assert.ok(pkg.includes('"build": "astro build"'));
  assert.ok(pkg.includes('"build:pages": "DEPLOY_TARGET=pages astro build"'));
  assert.ok(workflow.includes("run: npm run build:pages"));
  assert.ok(!workflow.includes("run: npm run build\n"));
});
