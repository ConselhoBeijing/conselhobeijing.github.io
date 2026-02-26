import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = path.resolve(import.meta.dirname, "..");

function read(relPath) {
  return readFileSync(path.join(root, relPath), "utf8");
}

test("contact page is wired for configured form endpoint and inline status/errors", () => {
  const content = read("src/pages/contact.astro");
  assert.ok(!content.includes("YOUR_FORM_ID"));
  assert.ok(content.includes('id="contact-form-status"'));
  assert.ok(content.includes('id="contact-form"'));
  assert.ok(content.includes('data-error-for="email"'));
});

test("contact form fields use padded site-consistent styling classes", () => {
  const content = read("src/pages/contact.astro");
  const styles = read("src/styles/global.css");
  assert.ok(content.includes("contact-form-field"));
  assert.ok(content.includes("contact-form-textarea"));
  assert.ok(content.includes("contact-form-submit"));
  assert.ok(styles.includes(".contact-form-field"));
  assert.ok(styles.includes("px-4 py-3"));
});

test("home page replaces quick links card with previous events card", () => {
  const content = read("src/pages/index.astro");
  assert.ok(!content.includes('title="Links Rápidos"'));
  assert.ok(content.includes('title="Eventos Anteriores"'));
  assert.ok(content.includes("home-past-events-card"));
  assert.ok(content.includes("const pastEvents ="));
});

test("news list renders a description/excerpt line", () => {
  const content = read("src/pages/news/[...page].astro");
  assert.ok(content.includes("news-list-summary"));
  assert.ok(content.includes("description"));
});

test("social icon links are available in navbar and footer", () => {
  const navbar = read("src/components/Navbar.astro");
  const footer = read("src/components/Footer.astro");
  const socialLinks = read("src/components/SocialLinks.astro");
  const config = read("src/config/site-links.ts");
  assert.ok(navbar.includes("<SocialLinks"));
  assert.ok(footer.includes("<SocialLinks"));
  assert.ok(config.includes("WeChat"));
  assert.ok(config.includes("Instagram"));
  assert.ok(config.includes("LinkedIn"));
  assert.ok(socialLinks.includes("noopener noreferrer"));
  assert.ok(socialLinks.includes("navbar-wechat-popover"));
  assert.ok(socialLinks.includes("navbar-wechat-popover-panel"));
  assert.ok(socialLinks.includes("social.iconClass"));
  assert.ok(config.includes("iconClass"));
});

test("wechat social control uses popup-only button behavior instead of navigation", () => {
  const socialLinks = read("src/components/SocialLinks.astro");
  const styles = read("src/styles/global.css");
  assert.ok(socialLinks.includes("social.showQrPopover ?"));
  assert.ok(socialLinks.includes("<button"));
  assert.ok(socialLinks.includes('type="button"'));
  assert.ok(socialLinks.includes('aria-expanded="false"'));
  assert.ok(socialLinks.includes('popover.classList.add("is-open")'));
  assert.ok(socialLinks.includes("event.preventDefault()"));
  assert.ok(styles.includes(".navbar-wechat-popover.is-open .navbar-wechat-popover-panel"));
  assert.ok(socialLinks.includes('class="social-link-button inline-flex rounded transition focus:outline-none focus:ring-2"'));
});

test("navbar keeps consistent spacing between social icons and theme toggle on desktop and mobile", () => {
  const navbar = read("src/components/Navbar.astro");
  assert.ok((navbar.match(/<ThemeToggle/g) ?? []).length >= 2);
  assert.ok(navbar.includes("hidden md:flex items-center gap-4"));
  assert.ok(navbar.includes('SocialLinks class="flex items-center gap-4" popoverAlign="left"'));
  assert.ok(!navbar.includes("navbar-utility-divider"));
});

test("mobile navbar menu uses smooth animated open and close states", () => {
  const navbar = read("src/components/Navbar.astro");
  const styles = read("src/styles/global.css");
  assert.ok(navbar.includes('class="site-mobile-menu sm:hidden" id="mobile-menu"'));
  assert.ok(navbar.includes('menu.classList.add("is-open")'));
  assert.ok(navbar.includes('menu.classList.remove("is-open")'));
  assert.ok(styles.includes(".site-mobile-menu {"));
  assert.ok(styles.includes("transition: max-height"));
  assert.ok(styles.includes(".site-mobile-menu.is-open {"));
});

test("mobile navbar menu closes only after actual scroll movement once open", () => {
  const navbar = read("src/components/Navbar.astro");
  assert.ok(navbar.includes("let openScrollY = 0"));
  assert.ok(navbar.includes("let isMenuSettling = false"));
  assert.ok(navbar.includes("let lastScrollIntentAt = 0"));
  assert.ok(navbar.includes("const SCROLL_INTENT_WINDOW_MS = 450"));
  assert.ok(navbar.includes("const markScrollIntent = () => {"));
  assert.ok(navbar.includes("lastScrollIntentAt = performance.now()"));
  assert.ok(navbar.includes('window.addEventListener("touchmove", markScrollIntent, { passive: true })'));
  assert.ok(navbar.includes('window.addEventListener("wheel", markScrollIntent, { passive: true })'));
  assert.ok(!navbar.includes('window.addEventListener("touchstart", markScrollIntent'));
  assert.ok(navbar.includes("if (performance.now() - lastScrollIntentAt > SCROLL_INTENT_WINDOW_MS)"));
  assert.ok(navbar.includes("openScrollY = window.scrollY"));
  assert.ok(navbar.includes("isMenuSettling = true"));
  assert.ok(navbar.includes("requestAnimationFrame(() => {"));
  assert.ok(navbar.includes("isMenuSettling = false"));
  assert.ok(navbar.includes("if (isMenuSettling)"));
  assert.ok(navbar.includes("Math.abs(window.scrollY - openScrollY) < 2"));
  assert.ok(navbar.includes('if (!menu.classList.contains("is-open"))'));
  assert.ok(navbar.includes('window.addEventListener("scroll", handleScrollClose, { passive: true })'));
  assert.ok(navbar.includes('btn.setAttribute("aria-expanded", "false")'));
});

test("navbar centers primary links in the header layout", () => {
  const navbar = read("src/components/Navbar.astro");
  assert.ok(navbar.includes("hidden sm:flex items-center justify-center gap-6"));
  assert.ok(navbar.includes("flex min-w-0 flex-1 items-center"));
  assert.ok(navbar.includes("flex min-w-0 flex-1 items-center justify-end gap-2"));
});

test("navigation links are configurable via shared site-links config", () => {
  const navbar = read("src/components/Navbar.astro");
  const socialLinks = read("src/components/SocialLinks.astro");
  const config = read("src/config/site-links.ts");
  assert.ok(navbar.includes("primaryNavLinks"));
  assert.ok(navbar.includes("/icons/conselho-top-logo-full.png"));
  assert.ok(config.includes("/icons/conselho-top-logo-full-dark.png"));
  assert.ok(navbar.includes("site-navbar-accent"));
  assert.ok(socialLinks.includes("socialLinksConfig"));
  assert.ok(config.includes("export const primaryNavLinks"));
  assert.ok(config.includes("export const socialLinks"));
});

test("top navigation follows requested order and naming", () => {
  const config = read("src/config/site-links.ts");
  const sobreAt = config.indexOf('name: "Sobre"');
  const noticiasAt = config.indexOf('name: "Notícias"');
  const projetosAt = config.indexOf('name: "Projetos"');
  const agendaAt = config.indexOf('name: "Agenda"');
  const equipeAt = config.indexOf('name: "Equipe"');

  assert.ok(sobreAt < noticiasAt);
  assert.ok(noticiasAt < projetosAt);
  assert.ok(projetosAt < agendaAt);
  assert.ok(agendaAt < equipeAt);
  assert.ok(!config.includes('name: "Eventos"'));
  assert.ok(!config.includes("Knowledge Base"));
});

test("footer uses a compact single-row gradient bar", () => {
  const footer = read("src/components/Footer.astro");
  assert.ok(footer.includes("Made by brazilians"));
  assert.ok(!footer.includes("&copy;"));
  assert.ok(footer.includes("conselho-footer-light.png"));
  assert.ok(footer.includes("conselho-footer-dark.png"));
  assert.ok(footer.includes("justify-between"));
  assert.ok(footer.includes("site-footer-top"));
  assert.ok(!footer.includes("site-footer-stage"));
  assert.ok(!footer.includes("site-footer-wave-svg"));
});

test("global style uses requested palette and translucent chrome", () => {
  const styles = read("src/styles/global.css");
  assert.ok(styles.toLowerCase().includes("#f9f0e3"));
  assert.ok(styles.toLowerCase().includes("#7ef056"));
  assert.ok(styles.toLowerCase().includes("#eae43f"));
  assert.ok(styles.toLowerCase().includes("#ffc60f"));
  assert.ok(styles.toLowerCase().includes("#61e3ff"));
  assert.ok(styles.includes("backdrop-blur"));
  assert.ok(styles.includes(".site-navbar-accent"));
});

test("description text and card descriptions use 16px across pages", () => {
  const styles = read("src/styles/global.css");
  const home = read("src/pages/index.astro");
  const news = read("src/pages/news/[...page].astro");
  const team = read("src/pages/team.astro");
  const calendar = read("src/components/CalendarWidget.tsx");

  assert.ok(styles.includes(".internal-page-subtitle"));
  assert.ok(styles.includes("max-w-3xl text-base"));
  assert.ok(styles.includes(".news-list-summary"));
  assert.ok(styles.includes(".project-card-intro"));
  assert.ok(styles.includes(".team-member-bio"));
  assert.ok(styles.includes(".home-bento-description"));
  assert.ok(styles.includes(".calendario-feed-description"));
  assert.ok(styles.includes(".single-page-card-description"));
  assert.ok(styles.includes(".single-page-project-intro"));
  assert.ok(styles.includes(".single-page-summary-text"));
  assert.ok(styles.includes(".single-page-hero-description"));

  assert.ok(!home.includes("home-bento-description text-sm"));
  assert.ok(!news.includes("news-list-summary text-sm"));
  assert.ok(!team.includes("team-member-bio text-sm"));
  assert.ok(!calendar.includes("calendario-feed-description mt-1 text-sm"));
});

test("site typography uses Open Sans as the primary font", () => {
  const layout = read("src/layouts/Layout.astro");
  const styles = read("src/styles/global.css");
  assert.ok(layout.includes("Open+Sans"));
  assert.ok(styles.includes("Open Sans"));
});

test("main pages reduce vertical shell spacing from py-12 to py-8", () => {
  const pages = ["src/pages/index.astro", "src/pages/team.astro", "src/pages/events.astro", "src/pages/contact.astro"];
  for (const page of pages) {
    const content = read(page);
    assert.ok(content.includes("py-8"), `${page} should use reduced vertical spacing`);
    assert.ok(!content.includes("py-12"), `${page} should no longer use py-12 at root container`);
  }
});

test("home removes animated background and bento cards use title-line accents", () => {
  const home = read("src/pages/index.astro");
  const bento = read("src/components/BentoCard.astro");
  const styles = read("src/styles/global.css");

  assert.ok(!home.includes("<AnimatedBackground"));
  assert.ok(bento.includes("bento-card-title-line"));
  assert.ok(styles.includes("--bento-title-line: #7ef056"));
  assert.ok(styles.includes("--bento-title-line: #fae43f"));
  assert.ok(styles.includes("--bento-title-line: #ffce0f"));
  assert.ok(styles.includes("--bento-title-line: #61e3ff"));
  assert.ok(styles.includes("--bento-title-line: #c9c9c9"));
});

test("team page renders all optional social links consistently", () => {
  const content = read("src/pages/team.astro");
  assert.ok(content.includes("linkedin"));
  assert.ok(content.includes("instagram"));
  assert.ok(content.includes("wechat"));
  assert.ok(content.includes("youtube"));
  assert.ok(content.includes('rel="noopener noreferrer"'));
});

test("team cards use larger photos, justified bios, pinned socials, and hover zoom", () => {
  const content = read("src/pages/team.astro");
  const styles = read("src/styles/global.css");

  assert.ok(content.includes("team-member-photo-frame"));
  assert.ok(content.includes("w-40 h-40"));
  assert.ok(content.includes("h-full flex flex-col"));
  assert.ok(content.includes("text-justify"));
  assert.ok(content.includes("team-member-socials mt-auto"));

  assert.ok(styles.includes(".team-member-photo-frame"));
  assert.ok(styles.includes(".team-member-photo:hover"));
  assert.ok(styles.includes("scale-110"));
});

test("team page sorts directors and executives alphabetically by name", () => {
  const content = read("src/pages/team.astro");
  assert.ok(content.includes("sortMembersByName"));
  assert.ok(content.includes("a.data.name.localeCompare"));
  assert.ok(content.includes("directors = sortMembersByName("));
  assert.ok(content.includes("executives = sortMembersByName("));
});

test("english home route is removed", () => {
  assert.ok(!existsSync(path.join(root, "src/pages/en/index.astro")));
});

test("internal pages share a common heading style class", () => {
  const pages = [
    "src/pages/contact.astro",
    "src/pages/team.astro",
    "src/pages/events.astro",
    "src/pages/events/calendario.astro",
    "src/pages/news/[...page].astro",
    "src/pages/projects/index.astro",
    "src/pages/sobre.astro",
  ];

  for (const page of pages) {
    const content = read(page);
    assert.ok(content.includes("internal-page-title"), `${page} must use internal-page-title`);
  }
});

test("dark mode is class-driven for manual theme toggle support", () => {
  const styles = read("src/styles/global.css");
  assert.ok(styles.includes("@custom-variant dark (&:where(.dark, .dark *));"));
});

test("layout applies persisted/system theme before page render", () => {
  const layout = read("src/layouts/Layout.astro");
  assert.ok(layout.includes("localStorage.getItem('color-theme')"));
  assert.ok(layout.includes("document.documentElement.classList.toggle('dark', isDark)"));
});

test("layout keeps footer pinned with a full-height shell", () => {
  const layout = read("src/layouts/Layout.astro");
  const footer = read("src/components/Footer.astro");
  assert.ok(layout.includes("site-shell"));
  assert.ok(layout.includes("min-h-dvh"));
  assert.ok(layout.includes('main class="flex-1"'));
  assert.ok(footer.includes("shrink-0"));
  assert.ok(!footer.includes("mt-auto"));
});

test("contact and team page headings are left aligned", () => {
  const contact = read("src/pages/contact.astro");
  const team = read("src/pages/team.astro");

  assert.ok(!contact.includes("internal-page-header text-center"));
  assert.ok(!team.includes("internal-page-header text-center"));
});

test("eventos timeline follows reference-oriented layout blocks", () => {
  const timeline = read("src/components/EventTimelineList.tsx");
  assert.ok(timeline.includes("eventos-reference-layout"));
  assert.ok(!timeline.includes("eventos-month-activity"));
  assert.ok(timeline.includes("Detalhes"));
  assert.ok(timeline.includes('type="date"'));
  assert.ok(timeline.includes('searchParams.get("view")'));
  assert.ok(timeline.includes("setViewMode"));
  assert.ok(timeline.includes("Próximos"));
  assert.ok(timeline.includes("Anteriores"));
});

test("eventos timeline keeps dates at left with simplified two-column cards", () => {
  const timeline = read("src/components/EventTimelineList.tsx");
  assert.ok(timeline.includes("eventos-timeline-list"));
  assert.ok(timeline.includes("eventos-detail-button"));
  assert.ok(timeline.includes("Detalhes"));
  assert.ok(timeline.includes("md:grid-cols-[88px_minmax(0,_1fr)]"));
  assert.ok(!timeline.includes("eventos-timeline-track"));
  assert.ok(!timeline.includes("eventos-node"));
});

test("eventos card title matches the news card title font size", () => {
  const timeline = read("src/components/EventTimelineList.tsx");
  assert.ok(timeline.includes("eventos-card-title text-xl"));
  assert.ok(!timeline.includes("eventos-card-title text-4xl"));
});

test("calendar widget is localized and uses styled feed switches", () => {
  const calendar = read("src/components/CalendarWidget.tsx");
  const styles = read("src/styles/global.css");
  const holidaysCn = read("src/data/holidays-cn.json");
  assert.ok(calendar.includes("@fullcalendar/core/locales/pt-br"));
  assert.ok(calendar.includes("locale={ptBrLocale}"));
  assert.ok(calendar.includes("calendario-feed-switch"));
  assert.ok(calendar.includes("calendario-feed-switch--active"));
  assert.ok(calendar.includes("rounded-full"));
  assert.ok(!calendar.includes("translateCnHolidayTitle"));
  assert.ok(calendar.includes('color: "#ffe2e2"'));
  assert.ok(calendar.includes('color: "#e7f8df"'));
  assert.ok(calendar.includes('textColor: "#1f6b3d"'));
  assert.ok(calendar.includes('borderColor: "#b6e2a9"'));
  assert.ok(calendar.includes('color: "#fff2ce"'));
  assert.ok(calendar.includes('textColor: "#8a5a0a"'));
  assert.ok(calendar.includes('borderColor: "#f0d48d"'));
  assert.ok(calendar.includes('eventDisplay="block"'));
  assert.ok(calendar.includes("normalizeInclusiveAllDayEnd"));
  assert.ok(calendar.includes("calendarEvents"));
  assert.ok(calendar.includes("events={calendarEvents}"));
  assert.ok(calendar.includes("event.allDay && event.end"));
  assert.ok(calendar.includes("normalizedEnd.setDate(normalizedEnd.getDate() + 1)"));
  assert.ok(holidaysCn.includes("Ano Novo Chinês / Chinese New Year (春节)"));
  assert.ok(!calendar.includes("🇨🇳"));
  assert.ok(!calendar.includes("🇧🇷"));
  assert.ok(!calendar.includes("📅"));
  assert.ok(styles.includes(".calendario-feed-dot--br"));
  assert.ok(styles.includes("background-color: #7ef056;"));
  assert.ok(styles.includes(".calendario-feed-dot--local"));
  assert.ok(styles.includes("background-color: #ffce0f;"));
});

test("calendar widget renders a filtered events list below the calendar", () => {
  const calendar = read("src/components/CalendarWidget.tsx");
  const styles = read("src/styles/global.css");

  assert.ok(calendar.includes("filteredEvents"));
  assert.ok(calendar.includes("datesSet"));
  assert.ok(calendar.includes("visibleMonthRange"));
  assert.ok(calendar.includes("eventDate >= visibleMonthRange.start"));
  assert.ok(calendar.includes("eventDate < visibleMonthRange.end"));
  assert.ok(calendar.includes("calendario-filtered-list-panel"));
  assert.ok(calendar.includes("calendario-filtered-list"));
  assert.ok(calendar.includes("calendario-filtered-item"));
  assert.ok(calendar.includes("calendario-filtered-item--link"));
  assert.ok(calendar.includes("calendario-filtered-empty"));

  assert.ok(styles.includes(".calendario-filtered-list-panel"));
  assert.ok(styles.includes(".calendario-filtered-item"));
  assert.ok(styles.includes(".calendario-filtered-item--link"));
  assert.ok(styles.includes(".calendario-filtered-empty"));
});

test("calendar buttons match the site button patterns used in events and home pages", () => {
  const styles = read("src/styles/global.css");
  const calendarButtonStyles =
    styles.split(".calendario-widget .fc .fc-today-button {")[1]?.split(".calendario-widget .fc .fc-col-header-cell-cushion")[0] ?? "";
  assert.ok(styles.includes("FullCalendar injects unlayered CSS at runtime; keep overrides unlayered so they win."));
  assert.ok(styles.includes(".calendario-widget .fc {"));
  assert.ok(styles.includes("--fc-button-bg-color: rgb(238 235 229 / 0.92);"));
  assert.ok(styles.includes("--fc-button-border-color: rgb(194 194 194 / 0.95);"));
  assert.ok(styles.includes(".calendario-widget .fc .fc-toolbar .fc-button-group {"));
  assert.ok(styles.includes("gap: 0.75rem;"));
  assert.ok(styles.includes(".calendario-widget .fc .fc-toolbar .fc-button-group > .fc-button {"));
  assert.ok(styles.includes("margin: 0 !important;"));
  assert.ok(styles.includes(".calendario-widget .fc .fc-today-button"));
  assert.ok(styles.includes("border-color: rgb(194 194 194 / 0.95);"));
  assert.ok(styles.includes("background-color: rgb(238 235 229 / 0.92);"));
  assert.ok(styles.includes("font-size: 0.875rem;"));
  assert.ok(styles.includes(".calendario-widget .fc .fc-prev-button"));
  assert.ok(styles.includes(".calendario-widget .fc .fc-next-button"));
  assert.ok(styles.includes("min-width: 2.25rem;"));
  assert.ok(styles.includes("font-size: 1.25rem;"));
  assert.ok(styles.includes("font-weight: 900;"));
  assert.ok(styles.includes("color: rgb(15 23 42);"));
  assert.ok(!calendarButtonStyles.includes("color: #7ef056;"));
  assert.ok(!styles.includes("background: transparent !important;"));
});

test("events date inputs and calendar controls use the site palette styling", () => {
  const styles = read("src/styles/global.css");
  assert.ok(styles.includes(".eventos-filter-input::-webkit-calendar-picker-indicator"));
  assert.ok(styles.includes("accent-color: #ffce0f;"));
  assert.ok(!styles.includes(".eventos-filter-input::-webkit-datetime-edit"));
  assert.ok(styles.includes("border-color: #ffce0f;"));
  assert.ok(styles.includes("background-color: rgb(255 206 15 / 0.18);"));
  assert.ok(styles.includes(".calendario-widget .fc .fc-daygrid-day.fc-day-today"));
  assert.ok(styles.includes(".calendario-widget .fc-theme-standard .fc-scrollgrid"));
});

test("home page uses requested bento structure for latest news, events, past events, and projects", () => {
  const home = read("src/pages/index.astro");
  assert.ok(home.includes("home-main-news-card"));
  assert.ok(home.includes("home-upcoming-events-card"));
  assert.ok(home.includes("home-past-events-card"));
  assert.ok(home.includes("home-projects-card"));
  assert.ok(home.includes("Ver todas as notícias"));
  assert.ok(home.includes("Ver todos os eventos"));
  assert.ok(home.includes("md:col-span-2 lg:col-span-1"));
});

test("home page includes a compact FAQ bento card with preview items and a full FAQ CTA", () => {
  const home = read("src/pages/index.astro");
  const styles = read("src/styles/global.css");
  const homeConfig = read("src/config/home.ts");

  assert.ok(home.includes('title="FAQ"'));
  assert.ok(home.includes("home-faq-card"));
  assert.ok(home.includes("HOME_FAQ_ITEMS_PREVIEW_LIMIT"));
  assert.ok(home.includes("faqPreviewItems"));
  assert.ok(home.includes('href="/faq"'));
  assert.ok(home.includes("Ver todas as perguntas"));
  assert.ok(home.includes("lg:col-start-4 lg:row-start-2"));
  assert.ok(!home.includes("projects.slice("));

  assert.ok(styles.includes(".home-faq-card"));
  assert.ok(styles.includes(".home-faq-item"));
  assert.ok(homeConfig.includes("HOME_FAQ_ITEMS_PREVIEW_LIMIT"));
});

test("shared site button style is reused across key pages and components", () => {
  const styles = read("src/styles/global.css");
  const home = read("src/pages/index.astro");
  const contact = read("src/pages/contact.astro");
  const events = read("src/pages/events.astro");
  const news = read("src/pages/news/[...page].astro");

  assert.ok(styles.includes(".site-button"));
  assert.ok(styles.includes(".home-bento-cta"));
  assert.ok(home.includes("site-button"));
  assert.ok(contact.includes("site-button"));
  assert.ok(events.includes("site-button"));
  assert.ok(news.includes("site-button"));
});

test("non-bento shared buttons remain readable in dark mode while bento CTA keeps contextual color", () => {
  const styles = read("src/styles/global.css");
  const sharedRule = styles.split(".home-bento-cta,")[1]?.split(".internal-back-link")[0] ?? "";
  const bentoRule = styles.split(".home-bento-cta {")[1]?.split("}")[0] ?? "";

  assert.ok(sharedRule.includes("dark:text-gray-100"));
  assert.ok(!sharedRule.includes("color: var(--bento-text-primary"));
  assert.ok(bentoRule.includes("color: var(--bento-text-primary, currentColor);"));
});

test("home page interaction layout matches requested refinements", () => {
  const home = read("src/pages/index.astro");
  const styles = read("src/styles/global.css");
  assert.ok(home.includes("home-main-news-image-link"));
  assert.ok(home.includes("home-upcoming-event-link"));
  assert.ok(home.includes("Eventos Anteriores"));
  assert.ok(home.includes("home-project-item"));
  assert.ok(home.includes("home-projects-menu"));
  assert.ok(home.includes("home-project-item--right"));
  assert.ok(home.includes('href="/events?view=past"'));
  assert.ok(!home.includes('aria-hidden="true">→</span>'));
  assert.ok((home.match(/class=\{primaryBentoButtonClass\}/g) ?? []).length >= 2);
  assert.ok(styles.includes("text-[0.66rem]"));
});

test("home page latest news is a configurable swipeable card carousel", () => {
  const home = read("src/pages/index.astro");
  assert.ok(existsSync(path.join(root, "src/config/home.ts")));

  const homeConfig = read("src/config/home.ts");
  assert.ok(homeConfig.includes("HOME_LATEST_NEWS_CARDS_LIMIT"));
  assert.ok(homeConfig.includes("= 5"));

  assert.ok(home.includes("HOME_LATEST_NEWS_CARDS_LIMIT"));
  assert.ok(home.includes(".slice(0, HOME_LATEST_NEWS_CARDS_LIMIT)"));
  assert.ok(home.includes("data-news-carousel"));
  assert.ok(home.includes("data-news-carousel-track"));
  assert.ok(home.includes("home-news-carousel-prev"));
  assert.ok(home.includes("home-news-carousel-next"));
});

test("single-page overview route exists and uses reusable section/config modules", () => {
  assert.ok(existsSync(path.join(root, "src/pages/inicio.astro")));
  assert.ok(existsSync(path.join(root, "src/components/single-page/SinglePageSection.astro")));
  assert.ok(existsSync(path.join(root, "src/config/single-page.ts")));
  assert.ok(existsSync(path.join(root, "src/utils/content-preview.ts")));

  const page = read("src/pages/inicio.astro");
  assert.ok(page.includes("<SinglePageSection"));
  assert.ok(page.includes("singlePageSections"));
});

test("single-page overview excludes contato section and keeps required section order", () => {
  const page = read("src/pages/inicio.astro");
  const heroAt = page.indexOf('id="single-page-section-hero"');
  const sobreAt = page.indexOf('id="single-page-section-sobre"');
  const noticiasAt = page.indexOf('id="single-page-section-noticias"');
  const agendaAt = page.indexOf('id="single-page-section-agenda"');
  const projetosAt = page.indexOf('id="single-page-section-projetos"');
  const equipeAt = page.indexOf('id="single-page-section-equipe"');
  const faqAt = page.indexOf('id="single-page-section-faq"');

  assert.ok(heroAt < sobreAt);
  assert.ok(sobreAt < noticiasAt);
  assert.ok(noticiasAt < agendaAt);
  assert.ok(agendaAt < projetosAt);
  assert.ok(projetosAt < equipeAt);
  assert.ok(equipeAt < faqAt);
  assert.ok(!page.includes('id="single-page-section-contato"'));
});

test("single-page shows all projects and grouped member cards with photo and name", () => {
  const page = read("src/pages/inicio.astro");
  assert.ok(page.includes('const allProjects = await getCollection("projects")'));
  assert.ok(page.includes("const projects = [...allProjects]"));
  assert.ok(!page.includes("projects.slice("));

  assert.ok(page.includes("Conselheiros Diretores"));
  assert.ok(page.includes("Conselheiros Executivos"));
  assert.ok(page.includes("single-page-member-card"));
  assert.ok(page.includes("member.data.photo"));
  assert.ok(page.includes("single-page-member-name"));
  assert.ok(!page.includes("bi bi-wechat"));
});

test("navbar includes Visão Geral first and points to /inicio", () => {
  const config = read("src/config/site-links.ts");
  const visaoAt = config.indexOf('name: "Visão Geral"');
  assert.ok(visaoAt < 0);
});

test("navbar logo exposes full council name on hover", () => {
  const navbar = read("src/components/Navbar.astro");
  assert.ok(navbar.includes('branding.logoTitle ?? "Conselho dos Cidadãos Brasileiros de Beijing"'));
});

test("single-page styles include solid section variants and dark-mode tuned colors", () => {
  const styles = read("src/styles/global.css");
  assert.ok(styles.includes(".single-page-root"));
  assert.ok(styles.includes(".single-page-section"));
  assert.ok(styles.includes(".single-page-section--hero"));
  assert.ok(styles.includes(":root.dark .single-page-section--hero"));
  assert.ok(styles.includes("background-image: none;"));
  assert.ok(!styles.includes("--single-page-pattern"));
  assert.ok(styles.includes(".single-page-reveal"));
});

test("single-page includes thumbnails for news, projects, and events when available", () => {
  const page = read("src/pages/inicio.astro");
  assert.ok(page.includes("newsThumbnail"));
  assert.ok(page.includes("projectThumbnail"));
  assert.ok(page.includes("eventThumbnail"));
  assert.ok(page.includes("single-page-card-image"));
  assert.ok(page.includes("single-page-event-image"));
  assert.ok(page.includes("single-page-project-image"));
});

test("single-page faq is fully collapsible and renders all parsed entries", () => {
  const page = read("src/pages/inicio.astro");
  assert.ok(page.includes("extractFaqEntries"));
  assert.ok(page.includes("const faqEntries ="));
  assert.ok(!page.includes("extractFaqQuestions"));
  assert.ok(!page.includes(".slice(0, 4)"));
  assert.ok(page.includes("<details"));
  assert.ok(page.includes("single-page-faq-item-summary"));
  assert.ok(page.includes("single-page-faq-item-content"));
});

test("projects page cards use lighter dedicated surface styling", () => {
  const page = read("src/pages/projects/index.astro");
  const styles = read("src/styles/global.css");
  assert.ok(page.includes("projects-overview-card"));
  assert.ok(styles.includes(".projects-overview-card"));
});

test("faq content uses expandable details blocks for all questions", () => {
  const faqContent = read("src/content/pages/faq.md");
  const detailsMatches = faqContent.match(/:::details\{summary=/g) ?? [];
  assert.equal(detailsMatches.length, 14);
  assert.ok(!faqContent.includes("### 1."));
});
