import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = path.resolve(import.meta.dirname, "..");

function read(relPath) {
  return readFileSync(path.join(root, relPath), "utf8");
}

test("about page is driven from markdown content entry", () => {
  const aboutPage = read("src/pages/sobre.astro");
  assert.ok(aboutPage.includes("getEntry("));
  assert.ok(aboutPage.includes("\"pages\""));
  assert.ok(aboutPage.includes("\"about\""));
  assert.ok(aboutPage.includes("<Content />"));
  assert.ok(existsSync(path.join(root, "src/content/pages/about.md")));
});

test("faq page is driven from markdown content entry", () => {
  const faqPage = read("src/pages/faq.astro");
  assert.ok(faqPage.includes("getEntry("));
  assert.ok(faqPage.includes("\"pages\""));
  assert.ok(faqPage.includes("\"faq\""));
  assert.ok(faqPage.includes("<Content />"));
  assert.ok(existsSync(path.join(root, "src/content/pages/faq.md")));
});

test("projects list supports thumbnail field and placeholder fallback", () => {
  const contentConfig = read("src/content/config.ts");
  const projectsPage = read("src/pages/projects/index.astro");

  assert.ok(contentConfig.includes("thumbnail: z.string().optional()"));
  assert.ok(projectsPage.includes("project-card-thumbnail"));
  assert.ok(projectsPage.includes("project-card-thumbnail-placeholder"));
});

test("enhanced markdown plugins are configured globally", () => {
  const astroConfig = read("astro.config.mjs");

  assert.ok(astroConfig.includes("remarkGfm"));
  assert.ok(astroConfig.includes("remarkDirective"));
  assert.ok(astroConfig.includes("remarkMath"));
  assert.ok(astroConfig.includes("rehypeSlug"));
  assert.ok(astroConfig.includes("rehypeAutolinkHeadings"));
  assert.ok(astroConfig.includes("rehypeKatex"));
});

test("all markdown content sections use shared rich markdown styling", () => {
  const pages = [
    "src/pages/sobre.astro",
    "src/pages/faq.astro",
    "src/pages/projects/[slug].astro",
    "src/pages/news/[slug].astro",
    "src/pages/events/[slug].astro",
  ];

  for (const page of pages) {
    const content = read(page);
    assert.ok(content.includes("markdown-content"), `${page} should include markdown-content`);
  }
});

test("sample markdown showcase and docs are present", () => {
  assert.ok(existsSync(path.join(root, "src/content/pages/markdown-components.md")));
  assert.ok(existsSync(path.join(root, "src/pages/markdown-components.astro")));
  assert.ok(existsSync(path.join(root, "docs/markdown-support.md")));
});
