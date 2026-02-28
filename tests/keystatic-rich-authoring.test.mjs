import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = path.resolve(import.meta.dirname, "..");

function read(relPath) {
  return readFileSync(path.join(root, relPath), "utf8");
}

test("keystatic long-form content uses a shared rich markdoc helper", () => {
  const config = read("keystatic.config.ts");

  assert.ok(config.includes("createRichMarkdocField"));
  assert.ok((config.match(/createRichMarkdocField\(/g) ?? []).length >= 5);
});

test("shared rich markdoc helpers normalize editor values and keep markdown output", async () => {
  const relPath = "src/keystatic/rich-markdoc-shared.js";

  assert.ok(existsSync(path.join(root, relPath)));

  const shared = await import(new URL(`../${relPath}`, import.meta.url));
  assert.equal(shared.normalizeHexColor("7EF056"), "#7ef056");
  assert.equal(shared.normalizeHexColor("#abc"), "#aabbcc");
  assert.equal(shared.normalizeHexColor("not-a-color"), shared.DEFAULT_TEXT_COLOR);
  assert.equal(shared.clampRichImageWidthPercent(8), 10);
  assert.equal(shared.clampRichImageWidthPercent(124), 100);

  const coloredHtml = shared.richMarkdocTagsToHtml('{% textColor color="#abc" %}Texto{% /textColor %}');
  assert.equal(coloredHtml, '<span class="rich-text-color" style="color: #aabbcc;">Texto</span>');
  assert.equal(shared.richMarkdocHtmlToTags(coloredHtml), '{% textColor color="#aabbcc" %}Texto{% /textColor %}');

  const richImageHtml = shared.richMarkdocTagsToHtml(
    '{% richImage src="/news/example.jpg" alt="Legenda" widthMode="custom" widthPreset="large" customWidthPercent=72 align="right" /%}'
  );
  assert.ok(richImageHtml.includes("<figure"));
  assert.ok(richImageHtml.includes("max-width: 72%"));
  assert.ok(richImageHtml.includes('rich-image-wrapper--align-right'));
  assert.equal(
    shared.richMarkdocHtmlToTags(richImageHtml),
    '{% richImage src="/news/example.jpg" alt="Legenda" widthMode="custom" widthPreset="large" customWidthPercent="72" align="right" /%}'
  );

  const richMarkdoc = read("src/keystatic/rich-markdoc.tsx");
  assert.ok(richMarkdoc.includes("extension: \"md\""));
  assert.ok(richMarkdoc.includes('type="color"'));
  assert.ok(richMarkdoc.includes("paletteIcon"));
  assert.ok(richMarkdoc.includes("imageIcon"));
  assert.ok(richMarkdoc.includes("richImage"));
});

test("markdown renderer transforms keystatic rich markdoc tags in md content", () => {
  const directives = read("src/markdown/remark-custom-directives.mjs");

  assert.ok(directives.includes("textColor"));
  assert.ok(directives.includes("richImage"));
  assert.ok(directives.includes("parseTagAttributes"));
  assert.ok(directives.includes("createRichImageHtml"));
});

test("global styles include responsive rich image layout rules", () => {
  const styles = read("src/styles/global.css");

  assert.ok(styles.includes(".rich-image-wrapper"));
  assert.ok(styles.includes(".rich-image-figure"));
  assert.ok(styles.includes(".rich-image-caption"));
  assert.ok(styles.includes("rich-image-wrapper--align-left"));
  assert.ok(styles.includes("@media (max-width: 768px)"));
});
