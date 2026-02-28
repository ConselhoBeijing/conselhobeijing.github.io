import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = path.resolve(import.meta.dirname, "..");

function read(relPath) {
  return readFileSync(path.join(root, relPath), "utf8");
}

test("news thumbnail resolver prefers valid thumbnails and falls back to the first body image", async () => {
  const relPath = "src/utils/news-thumbnails.ts";

  assert.ok(existsSync(path.join(root, relPath)));

  const newsThumbnails = await import(new URL(`../${relPath}`, import.meta.url));

  const explicit = newsThumbnails.resolveNewsThumbnail({
    data: { thumbnail: "https://example.com/hero.jpg" },
    body: "![Body](/news/body.jpg)",
  });
  assert.equal(explicit, "https://example.com/hero.jpg");

  const fallback = newsThumbnails.resolveNewsThumbnail({
    data: {},
    body: "Lead text\n\n![Body](/news/body.jpg)",
  });
  assert.equal(fallback, "/news/body.jpg");

  const blobFallback = newsThumbnails.resolveNewsThumbnail({
    data: { thumbnail: "blob:https://example.com/file" },
    body: "Lead text\n\n![Body](/news/blob-fallback.jpg)",
  });
  assert.equal(blobFallback, "/news/blob-fallback.jpg");

  const dataFallback = newsThumbnails.resolveNewsThumbnail({
    data: { thumbnail: "data:image/png;base64,abc" },
    body: "Lead text\n\n![Body](/news/data-fallback.jpg)",
  });
  assert.equal(dataFallback, "/news/data-fallback.jpg");
});

test("news pages use the shared thumbnail resolver", () => {
  const listPage = read("src/pages/news/[...page].astro");
  const detailPage = read("src/pages/news/[slug].astro");
  const home = read("src/pages/index.astro");
  const singlePage = read("src/pages/inicio.astro");

  assert.ok(listPage.includes("resolveNewsThumbnail"));
  assert.ok(detailPage.includes("resolveNewsThumbnail"));
  assert.ok(home.includes("resolveNewsThumbnail"));
  assert.ok(singlePage.includes("resolveNewsThumbnail"));
});
