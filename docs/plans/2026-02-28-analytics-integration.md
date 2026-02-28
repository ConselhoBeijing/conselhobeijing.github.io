# Analytics Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add privacy-conscious, low-cost analytics that covers global traffic and remains usable for mainland China visitors.

**Architecture:** Inject analytics once in the shared Astro layout through a small analytics partial fed by public environment variables. Use Cloudflare Web Analytics as the primary free global beacon and Baidu Tongji as an optional China-friendly companion, both loaded only when configured.

**Tech Stack:** Astro 5, server-rendered `.astro` components, Node built-in test runner

---

### Task 1: Lock expected analytics markup with tests

**Files:**
- Modify: `tests/spec-regressions.test.mjs`
- Test: `tests/spec-regressions.test.mjs`

**Step 1: Write the failing test**

Add assertions that the layout imports a shared analytics component and that the analytics component reads public Cloudflare and Baidu environment variables while exposing lightweight page/event tracking hooks.

**Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern "analytics"`
Expected: FAIL because the analytics component and wiring do not exist yet.

### Task 2: Implement the analytics partial

**Files:**
- Create: `src/components/Analytics.astro`
- Modify: `src/layouts/Layout.astro`

**Step 1: Write minimal implementation**

Create a new component that:
- reads `PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` and `PUBLIC_BAIDU_TONGJI_SITE_ID`
- injects the current Cloudflare beacon script when the token exists
- injects Baidu Tongji using the official async loader when the site id exists
- exposes a minimal `window.__siteAnalytics` API for custom events and virtual page views

**Step 2: Verify tests pass**

Run: `npm test -- --test-name-pattern "analytics"`
Expected: PASS

### Task 3: Verify the full suite

**Files:**
- Test: `tests/spec-regressions.test.mjs`
- Test: `tests/deployment-targets.test.mjs`

**Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS
