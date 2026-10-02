import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "outputs", "browser-checks");
const port = Number(process.env.LOADING_TEST_PORT || 4183);
const base = `http://127.0.0.1:${port}/E-portfolio/`;
const results = [];
const record = (name, pass) => results.push({ name, pass: !!pass });
let browser, server, release;
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
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const chrome =
    process.env.CHROME_PATH ||
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  browser = await chromium.launch({
    headless: true,
    ...(existsSync(chrome) ? { executablePath: chrome } : {}),
  });
  const page = await browser.newPage({
    reducedMotion: "reduce",
    viewport: { width: 1440, height: 1000 },
    colorScheme: "light",
  });
  await page.route("**/*.supabase.co/**", (route) => route.abort());
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("**/research/*.txt*", async (route) => {
    await gate;
    await route.continue().catch(() => {});
  });
  let documents = 0;
  page.on("request", (request) => {
    if (request.resourceType() === "document") documents++;
  });
  // Link prefetch begins after hydration, so interactions cannot race SSR markup.
  const prefetchStarted = page.waitForRequest((request) =>
    /\/research\/.*\.txt/.test(request.url()),
  );
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await prefetchStarted;
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await page.waitForFunction(
    () => document.documentElement.dataset.theme === "dark",
  );
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Research", exact: true })
    .click({ noWaitAfter: true });
  await page.locator(".navigation-feedback").waitFor({ state: "visible" });
  record(
    "Slow navigation shows feedback from the actual pending link",
    await page.locator(".navigation-feedback").isVisible(),
  );
  record(
    "Loading preserves the current page",
    await page
      .locator("main h1")
      .innerText()
      .then((text) => text.includes("Krishna")),
  );
  record(
    "Reduced motion disables the loading pulse",
    await page
      .locator(".navigation-feedback")
      .evaluate(
        (element) => getComputedStyle(element).animationName === "none",
      ),
  );
  release();
  await page.waitForURL("**/research/");
  await page.locator(".navigation-feedback").waitFor({ state: "detached" });
  record(
    "Navigation completes and clears feedback without reloading the document",
    documents === 1 && (await page.locator("main h1").isVisible()),
  );
} catch (error) {
  results.push({
    name: "Loading browser checks completed",
    pass: false,
    details: error.stack || String(error),
  });
} finally {
  release?.();
  await browser?.close();
  server?.kill();
  await writeFile(
    path.join(output, "loading-report.json"),
    JSON.stringify(results, null, 2),
  );
}
const failed = results.filter((result) => !result.pass);
console.log(
  `${results.length - failed.length}/${results.length} navigation loading checks passed.`,
);
if (failed.length) {
  console.error(failed);
  process.exitCode = 1;
}
