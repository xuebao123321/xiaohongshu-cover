const { execFileSync } = require("node:child_process");
const { existsSync, mkdirSync } = require("node:fs");
const path = require("node:path");

const dir = __dirname;
const html = path.join(dir, "carousel.html");
const outDir = path.join(dir, "png");

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const chromeCandidates = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
];

const chrome = chromeCandidates.find(existsSync);
if (!chrome) {
  throw new Error("No Chrome/Edge executable found.");
}

for (let i = 1; i <= 7; i += 1) {
  const output = path.join(outDir, `slide-${String(i).padStart(2, "0")}.png`);
  const url = `file://${html}?slide=${i}`;
  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1080,1350",
    `--screenshot=${output}`,
    url,
  ], { stdio: "inherit" });
}

console.log(`Exported slides to ${outDir}`);
