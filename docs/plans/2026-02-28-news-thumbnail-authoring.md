# News Thumbnail Authoring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make news thumbnails easier and safer to author by supporting both uploaded images and remote image URLs without requiring editors to know a remote image URL in advance.

**Architecture:** Split the current single `thumbnail` text field into explicit authoring choices: an uploaded thumbnail path, a remote thumbnail URL, and a shared resolver that decides what the site should render. Keep the legacy `thumbnail` field temporarily during rollout so existing content continues to work while entries are migrated.

**Tech Stack:** Astro content collections, Keystatic collections/fields, Zod content schema, Node test runner

---

### Task 1: Add regression tests for the new thumbnail model

**Files:**
- Create: `tests/news-thumbnail-authoring.test.mjs`
- Test: `tests/spec-regressions.test.mjs`

**Step 1: Write the failing test**

Add a focused test file that asserts:
- the news schema no longer relies only on a single `thumbnail` text field
- a shared resolver exists for news thumbnails
- the resolver prefers uploaded image, then remote URL, then legacy thumbnail, then first image from body
- invalid `blob:` URLs are rejected by validation logic

**Step 2: Run test to verify it fails**

Run: `node --test tests/news-thumbnail-authoring.test.mjs`
Expected: FAIL because the resolver and new fields do not exist yet.

**Step 3: Update source-string regressions**

Extend `tests/spec-regressions.test.mjs` so it checks for:
- a dedicated news thumbnail helper
- use of uploaded thumbnails in the news form
- continued rendering fallback in news list/detail/home surfaces

**Step 4: Run tests again**

Run: `node --test tests/news-thumbnail-authoring.test.mjs tests/spec-regressions.test.mjs`
Expected: still FAIL until implementation lands.

**Step 5: Commit**

```bash
git add tests/news-thumbnail-authoring.test.mjs tests/spec-regressions.test.mjs
git commit -m "test: cover news thumbnail authoring flow"
```

### Task 2: Reshape the Keystatic news form

**Files:**
- Modify: `keystatic.config.ts`

**Step 1: Add explicit thumbnail source fields**

Replace the single `thumbnail` text field in the news schema with:
- `thumbnailMode`: select field such as `upload`, `remote`, `auto`
- `thumbnailImage`: `fields.image({ directory: "public/news", publicPath: "/news" })`
- `thumbnailUrl`: text or URL field for remote images

Use `fields.conditional(...)` so the editor only shows the relevant input for the selected mode:
- `upload` shows the image upload field
- `remote` shows the remote URL field
- `auto` shows no extra thumbnail input and relies on the first body image

**Step 2: Keep backward compatibility during rollout**

Do not immediately delete the current `thumbnail` frontmatter path from the reader path. Either:
- keep `thumbnail` as a deprecated hidden/ignored compatibility field for one migration cycle, or
- read legacy `thumbnail` values in the shared resolver until content is migrated

**Step 3: Improve field descriptions**

Add concise author guidance:
- uploaded thumbnail is recommended for external links when the publisher’s image URL is unknown
- remote URL is only for stable direct image links
- `auto` uses the first image embedded in the article body

**Step 4: Run a narrow verification**

Run: `npm test -- --test-name-pattern="news thumbnail|news form"`
Expected: tests for news thumbnail authoring pass after implementation.

**Step 5: Commit**

```bash
git add keystatic.config.ts
git commit -m "feat: improve news thumbnail authoring fields"
```

### Task 3: Update the content schema and validation rules

**Files:**
- Modify: `src/content/config.ts`

**Step 1: Add the new frontmatter fields**

Extend the news collection schema with:
- `thumbnailMode`
- `thumbnailImage`
- `thumbnailUrl`

Keep `thumbnail` as an optional legacy field during the migration window.

**Step 2: Add cross-field validation**

Use `z.object(...).superRefine(...)` to enforce:
- `type === "external"` requires `externalLink`
- `thumbnailMode === "upload"` requires `thumbnailImage`
- `thumbnailMode === "remote"` requires `thumbnailUrl`
- `thumbnailUrl`, when present, must be `http` or `https`
- reject `blob:` and `data:` URLs explicitly

**Step 3: Preserve optional authoring**

Allow no explicit thumbnail when:
- `thumbnailMode === "auto"` and the body contains an image
- the entry is legacy content still using `thumbnail`

**Step 4: Run the targeted test**

Run: `node --test tests/news-thumbnail-authoring.test.mjs`
Expected: PASS for validation behavior.

**Step 5: Commit**

```bash
git add src/content/config.ts tests/news-thumbnail-authoring.test.mjs
git commit -m "feat: validate news thumbnail sources"
```

### Task 4: Centralize thumbnail resolution in one helper

**Files:**
- Create: `src/utils/news-thumbnails.ts`
- Modify: `src/utils/content-preview.ts`

**Step 1: Create a resolver**

Add a shared helper such as `resolveNewsThumbnail(entry)` that returns the final image URL in this priority order:
1. `thumbnailImage`
2. `thumbnailUrl`
3. legacy `thumbnail`
4. first image extracted from the body markdown
5. `undefined`

**Step 2: Add safety filters**

The resolver should treat these as invalid and ignore them:
- `blob:`
- `data:`
- empty strings

This avoids rendering broken author-local URLs even if old content still contains them.

**Step 3: Reuse existing body-image extraction**

Keep `extractFirstImageUrl(...)` in `src/utils/content-preview.ts`, but route thumbnail fallback through the new helper instead of duplicating the fallback logic in multiple pages.

**Step 4: Run tests**

Run: `node --test tests/news-thumbnail-authoring.test.mjs`
Expected: PASS with resolver priority and safety behavior covered.

**Step 5: Commit**

```bash
git add src/utils/news-thumbnails.ts src/utils/content-preview.ts tests/news-thumbnail-authoring.test.mjs
git commit -m "feat: centralize news thumbnail resolution"
```

### Task 5: Update all news rendering surfaces to use the resolver

**Files:**
- Modify: `src/pages/news/[...page].astro`
- Modify: `src/pages/news/[slug].astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/inicio.astro`

**Step 1: Replace direct thumbnail reads**

Stop reading `entry.data.thumbnail` directly in templates. Use the shared resolver instead so all pages behave consistently.

**Step 2: Keep the UX consistent**

All news surfaces should render:
- uploaded thumbnail when one exists
- otherwise remote thumbnail URL
- otherwise the first body image
- otherwise no image block

**Step 3: Remove duplicated fallback logic**

Home and `/inicio` currently compute their own fallback with `extractFirstImageUrl(entry.body || "")`. Replace that with the shared resolver to keep one source of truth.

**Step 4: Run UI-facing regression tests**

Run: `npm test`
Expected: full suite passes with all news thumbnail rendering checks green.

**Step 5: Commit**

```bash
git add src/pages/news/[...page].astro src/pages/news/[slug].astro src/pages/index.astro src/pages/inicio.astro
git commit -m "feat: unify news thumbnail rendering"
```

### Task 6: Migrate existing content and remove bad data

**Files:**
- Modify: `src/content/news/*.md`
- Optional Create: `scripts/migrate-news-thumbnails.mjs`

**Step 1: Audit existing entries**

Classify current news frontmatter into:
- legacy local paths like `/news/...`
- stable remote URLs
- invalid values like the current `blob:` entry

**Step 2: Migrate the existing frontmatter**

For each file:
- move site-hosted `/news/...` paths into `thumbnailImage` (or leave as legacy `thumbnail` until a second pass if the path cannot be inferred safely)
- move direct remote URLs into `thumbnailUrl`
- replace `blob:` values by either the uploaded image path already present in body content or `thumbnailMode: auto`

**Step 3: Remove the known bad record**

Specifically fix `src/content/news/cartilha-de-protecao-ao-trabalhador-no-sudeste-asiatico-disponivel-em-pdf.md` so it no longer stores a browser-local `blob:` URL in frontmatter.

**Step 4: Optional scripted migration**

If there are enough entries to justify it, add a one-off migration script that rewrites known-safe cases and prints entries requiring manual review.

**Step 5: Commit**

```bash
git add src/content/news
git commit -m "chore: migrate news thumbnail metadata"
```

### Task 7: Verify the whole flow and clean up legacy support

**Files:**
- Modify later: `keystatic.config.ts`
- Modify later: `src/content/config.ts`
- Modify later: `src/utils/news-thumbnails.ts`

**Step 1: Run full verification**

Run:
- `npm test`
- `npm run build`

Expected:
- test suite passes
- Astro build succeeds
- no new invalid content warnings from news entries

**Step 2: Manual authoring verification**

In Keystatic, create three draft news items:
- external link with uploaded thumbnail
- external link with remote thumbnail URL
- local article with no explicit thumbnail but an image in body

Confirm the editor saves usable frontmatter and the site renders the expected image in list/detail/home views.

**Step 3: Remove legacy field only after migration is complete**

Once all content is migrated and verified:
- delete the deprecated `thumbnail` compatibility path
- tighten tests so old `thumbnail` references fail

**Step 4: Final commit**

```bash
git add keystatic.config.ts src/content/config.ts src/utils/news-thumbnails.ts tests
git commit -m "refactor: remove legacy news thumbnail field"
```
