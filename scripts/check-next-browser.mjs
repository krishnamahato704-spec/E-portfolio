import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { defaultContent } from "../src/content.js";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "outputs", "browser-checks");
const port = Number(process.env.NEXT_TEST_PORT || 4182);
const origin = `http://127.0.0.1:${port}`;
const base = `${origin}/E-portfolio/`;
const results = [];
let browser, server;
const record = (name, pass, details) => {
  results.push({
    name,
    pass: !!pass,
    ...(details === undefined ? {} : { details }),
  });
  if (!pass) console.error(`FAIL: ${name}`, details || "");
};
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pages = [
  "",
  "teaching/",
  "research/",
  "about/",
  "profile/",
  "resources/",
  "credentials/",
  "contact/",
  "resume/",
  "gallery/",
  "teaching/democracy/",
  "teaching/pehchaan/",
  "teaching/mock-election/",
  "teaching/observation/",
];

async function context(options = {}, live) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    colorScheme: "light",
    ...options,
  });
  await ctx.route("**/*.supabase.co/**", (route) =>
    live
      ? route.fulfill({
          json: [{ content: live, updated_at: "2026-10-02T00:00:00Z" }],
        })
      : route.abort(),
  );
  return ctx;
}
try {
  await mkdir(output, { recursive: true });
  server = spawn(process.execPath, ["scripts/serve-next.mjs"], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    windowsHide: true,
    stdio: "pipe",
  });
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch(base)).ok) break;
    } catch {}
    await pause(100);
  }
  const chrome =
    process.env.CHROME_PATH ||
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  browser = await chromium.launch({
    headless: true,
    ...(existsSync(chrome) ? { executablePath: chrome } : {}),
  });
  const ctx = await context();
  const page = await ctx.newPage();
  const errors = [];
  const failedAssets = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.url().startsWith(base) && response.status() >= 400)
      failedAssets.push(`${response.status()} ${response.url()}`);
  });
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of pages) {
      const response = await page.goto(base + route, {
        waitUntil: "networkidle",
      });
      await page.evaluate(() => document.fonts.ready);
      record(
        `${width}px ${route || "home"} responds`,
        response.status() === 200,
      );
      record(
        `${width}px ${route || "home"} has one h1`,
        (await page.locator("main h1").count()) === 1,
      );
      const dimensions = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        viewport: innerWidth,
      }));
      record(
        `${width}px ${route || "home"} has no horizontal overflow`,
        dimensions.scroll <= dimensions.viewport + 1,
        dimensions,
      );
      const margin = await page
        .locator(".site-header .shell")
        .evaluate((element) => element.getBoundingClientRect().left);
      record(
        `${width}px ${route || "home"} keeps page margins`,
        margin >= (width < 360 ? 16 : width < 768 ? 20 : 24) - 0.5,
        { margin },
      );
    }
    console.log(`Checked all public routes at ${width}px.`);
  }
  await page.goto(base);
  record(
    "Removed roles stay excluded",
    !/evidyaloka|urbanpro/i.test(await page.locator("main").innerText()),
  );
  record(
    "Both hero actions are visible",
    (await page
      .getByRole("link", { name: "View Publications", exact: true })
      .isVisible()) &&
      (await page
        .getByRole("link", { name: "Download CV", exact: true })
        .isVisible()),
  );
  await page.screenshot({
    path: path.join(output, "next-desktop-light.png"),
    fullPage: true,
  });
  await page.screenshot({
    path: path.join(output, "next-desktop-opening.png"),
  });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  record(
    "Dark mode applies",
    (await page.locator("html").getAttribute("data-theme")) === "dark",
  );
  await page.reload({ waitUntil: "networkidle" });
  record(
    "Theme persists after reload",
    (await page.locator("html").getAttribute("data-theme")) === "dark",
  );
  await page.screenshot({
    path: path.join(output, "next-desktop-dark.png"),
    fullPage: true,
  });
  for (const theme of ["dark", "light"]) {
    if (theme === "light")
      await page.getByRole("button", { name: "Switch to light mode" }).click();
    for (const route of [
      "",
      "research/",
      "resources/",
      "contact/",
      "teaching/democracy/",
      "gallery/",
    ]) {
      await page.goto(base + route, { waitUntil: "networkidle" });
      const audit = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      record(
        `${theme} ${route || "home"} accessibility`,
        audit.violations.length === 0,
        audit.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      );
      const contrast = await new AxeBuilder({ page })
        .withRules(["color-contrast-enhanced"])
        .analyze();
      record(
        `${theme} ${route || "home"} enhanced text contrast`,
        contrast.violations.length === 0,
        contrast.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      );
      const labels = await new AxeBuilder({ page })
        .withRules(["label-content-name-mismatch"])
        .analyze();
      record(
        `${theme} ${route || "home"} visible and accessible labels match`,
        labels.violations.length === 0,
        labels.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      );
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.screenshot({
    path: path.join(output, "next-mobile-light.png"),
    fullPage: true,
  });
  await page.screenshot({ path: path.join(output, "next-mobile-opening.png") });
  await page.getByRole("button", { name: "Open navigation" }).click();
  record(
    "Mobile menu opens",
    await page.getByRole("dialog", { name: "Site navigation" }).isVisible(),
  );
  await page.keyboard.press("Shift+Tab");
  record(
    "Mobile menu traps keyboard focus",
    await page
      .locator("#mobile-navigation")
      .evaluate((element) => element.contains(document.activeElement)),
  );
  const menuAudit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  record(
    "Mobile menu accessibility",
    menuAudit.violations.length === 0,
    menuAudit.violations.map((v) => v.id),
  );
  await page.keyboard.press("Escape");
  record(
    "Escape closes menu and restores focus",
    await page
      .getByRole("button", { name: "Open navigation" })
      .evaluate((element) => element === document.activeElement),
  );
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: /Research/ })
    .click();
  await page.waitForURL("**/research/");
  record(
    "Mobile route navigation closes menu",
    (await page.locator("#mobile-navigation").count()) === 0,
  );
  await page.goto(base + "resources/", { waitUntil: "networkidle" });
  await page.getByRole("searchbox").fill("Democracy");
  record(
    "Resource search filters correctly",
    (await page.locator(".resource-card").count()) === 1,
  );
  await page.getByRole("searchbox").fill("No matching resource");
  record(
    "Search has a useful empty state",
    await page
      .getByText("No resources match this search.", { exact: false })
      .isVisible(),
  );
  await page.getByRole("searchbox").fill("");
  await page.getByRole("button", { name: "Presentation", exact: true }).click();
  record(
    "Resource category filtering",
    (await page.locator(".resource-card").count()) === 3,
  );
  await page.goto(base + "teaching/democracy/", { waitUntil: "networkidle" });
  await page.getByRole("tab").first().focus();
  await page.keyboard.press("ArrowRight");
  record(
    "Document notes support arrow keys",
    (await page.getByRole("tab").nth(1).getAttribute("aria-selected")) ===
      "true",
  );
  record(
    "Selected document note is visible",
    await page
      .getByRole("tabpanel")
      .getByRole("heading", { name: "Ways into the idea" })
      .isVisible(),
  );
  await page.locator("#case-evidence").scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  record(
    "Case study guide tracks the active section",
    (await page
      .locator('.case-contents a[aria-current="location"]')
      .getAttribute("href")) === "#case-evidence",
  );
  await page.goto(base + "gallery/", { waitUntil: "networkidle" });
  await page
    .getByRole("button", { name: /Enlarge/ })
    .first()
    .click();
  record(
    "Gallery preview opens",
    await page.locator("dialog").evaluate((dialog) => dialog.open),
  );
  await page.keyboard.press("Escape");
  record(
    "Gallery closes with Escape",
    !(await page.locator("dialog").evaluate((dialog) => dialog.open)),
  );
  await page.goto(base + "contact/", { waitUntil: "networkidle" });
  await page.getByLabel("Your name", { exact: true }).fill("Test visitor");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  record(
    "Theme changes preserve form input",
    (await page.getByLabel("Your name", { exact: true }).inputValue()) ===
      "Test visitor",
  );
  await page.screenshot({
    path: path.join(output, "next-mobile-contact-dark.png"),
    fullPage: true,
  });
  await page.goto(base + "admin/", { waitUntil: "networkidle" });
  await page
    .frameLocator("iframe")
    .getByRole("heading", { name: /Portfolio Studio/ })
    .waitFor();
  record(
    "Unchanged owner studio loads",
    (await page.frameLocator("iframe").locator("#login-form").count()) === 1,
  );
  record("No browser runtime errors", errors.length === 0, errors);
  record(
    "All local images and prefetched route segments load",
    failedAssets.length === 0,
    [...new Set(failedAssets)],
  );
  await ctx.close();

  const noJS = await context({ javaScriptEnabled: false });
  const staticPage = await noJS.newPage();
  for (const route of pages) {
    await staticPage.goto(base + route);
    record(
      `${route || "home"} works without JavaScript`,
      (await staticPage.locator("main h1").isVisible()) &&
        (await staticPage.locator("main").innerText()).length > 300,
    );
  }
  await noJS.close();

  const published = structuredClone(defaultContent);
  published.profile.headline = "A published teaching statement.";
  published.profile.availability = "September 2027";
  const liveContext = await context({}, published);
  const livePage = await liveContext.newPage();
  await livePage.goto(base, { waitUntil: "networkidle" });
  record(
    "Existing Supabase loader updates React content",
    await livePage
      .getByText("A published teaching statement.", { exact: true })
      .isVisible(),
  );
  record(
    "Edited profile cannot offer a stale bundled CV",
    (await livePage
      .getByRole("link", { name: "View current CV", exact: true })
      .count()) === 1,
  );
  await liveContext.close();

  const empty = {
    ...published,
    qualifications: [],
    experiences: [],
    certificates: [],
    resources: [],
    gallery: [],
  };
  const emptyContext = await context({}, empty);
  const emptyPage = await emptyContext.newPage();
  await emptyPage.goto(base, { waitUntil: "networkidle" });
  record(
    "Owner removals remain authoritative",
    (await emptyPage
      .locator(
        ".work-feature,.work-card,.paper-panel,.timeline-row,.credential-row",
      )
      .count()) === 0,
  );
  await emptyContext.close();

  const systemDark = await context({ colorScheme: "dark" });
  const darkPage = await systemDark.newPage();
  await darkPage.goto(base, { waitUntil: "networkidle" });
  record(
    "System dark mode is respected",
    (await darkPage.locator("html").getAttribute("data-theme")) === "dark",
  );
  record(
    "Reduced motion disables smooth scrolling",
    (await darkPage.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    )) === "auto",
  );
  await systemDark.close();

  const normal = await context({ reducedMotion: "no-preference" });
  const normalPage = await normal.newPage();
  const motionErrors = [];
  let documentRequests = 0;
  normalPage.on("request", (request) => {
    if (request.resourceType() === "document" && request.url().startsWith(base))
      documentRequests++;
  });
  normalPage.on("pageerror", (error) => motionErrors.push(error.message));
  await normalPage.goto(base, { waitUntil: "networkidle" });
  await normalPage.locator("#education").scrollIntoViewIfNeeded();
  await normalPage.waitForTimeout(500);
  record(
    "Normal motion retains readable content",
    await normalPage.locator("#education h2").isVisible(),
  );
  record(
    "Native smooth scrolling is enabled",
    (await normalPage.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    )) === "smooth",
  );
  await normalPage
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Research", exact: true })
    .click();
  await normalPage.waitForURL("**/research/");
  record(
    "Animated page navigation completes",
    await normalPage.locator("main h1").isVisible(),
  );
  record(
    "Client navigation uses exported route data without a document reload",
    documentRequests === 1,
    { documentRequests },
  );
  record(
    "GSAP and Framer Motion have no runtime errors",
    motionErrors.length === 0,
    motionErrors,
  );
  await normal.close();

  const html = await readFile(path.join(root, "dist", "index.html"), "utf8");
  record(
    "Static export includes canonical, social metadata, and structured data",
    /rel="canonical"/.test(html) &&
      /property="og:image"/.test(html) &&
      /application\/ld\+json/.test(html),
  );
  for (const file of [
    "sitemap.xml",
    "robots.txt",
    "assets/krishna-mahato-resume.pdf",
    "assets/democracy-lesson-plan.pdf",
    "admin/studio.html",
    "src/cloud.js",
  ])
    record(`${file} is served`, (await fetch(base + file)).ok);
} catch (error) {
  record("Browser suite completed", false, error.stack || String(error));
} finally {
  await browser?.close();
  server?.kill();
  await writeFile(
    path.join(output, "next-report.json"),
    JSON.stringify(results, null, 2),
  );
}
const failed = results.filter((result) => !result.pass);
console.log(
  `${results.length - failed.length}/${results.length} Next.js browser checks passed.`,
);
if (failed.length) process.exitCode = 1;
