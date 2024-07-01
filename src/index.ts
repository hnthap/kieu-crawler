import { config } from "dotenv";
import { startBrowser } from "./browser.js";
import { crawlKieuVersions, resetDir } from "./controller.js";

(async () => {
  config();
  const outDir = "out";
  await resetDir(outDir);
  const browser = await startBrowser();
  await crawlKieuVersions(browser, outDir);
  await browser.close();
})();
