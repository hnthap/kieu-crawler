import { startBrowser } from "./browser.js";
import {
  compressDir,
  crawlKieuVersions,
  mkdirIfNotExists,
} from "./controller.js";

(async () => {
  const outDir = "out";
  await mkdirIfNotExists(outDir);
  const browser = await startBrowser();
  await crawlKieuVersions(browser, outDir);
  await compressDir(outDir, "kieu.zip", "zip");
  await browser.close();
})();
