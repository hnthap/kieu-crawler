import { Browser, Page } from "puppeteer";
import { Scraper } from "./scraper.js";
import { mkdir, writeFile } from "fs/promises";
import archiver from "archiver";
import { createWriteStream } from "fs";
import { join, resolve } from "path";

export async function crawlKieuVersions(browser: Browser, outDir: string) {
  const versions: { name: string; url: string }[] = [
    {
      name: "1870-kinh",
      url: "https://nomfoundation.org/nom-project/tale-of-kieu/tale-of-kieu-version-1870",
    },
    {
      name: "1906-oanh-mau",
      url: "https://nomfoundation.org/nom-project/tale-of-kieu/tale-of-kieu-version-1902",
    },
  ];
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (request.resourceType() === "image") {
      request.abort();
    } else {
      request.continue();
    }
  });
  for (const { name, url } of versions) {
    const content = await scrapeAll(url, page);
    const outFile = join(outDir, `kieu-${name}.txt`);
    await writeFile(outFile, content);
    console.log(`📖  Saved ${name} version as ${resolve(outFile)}`);
  }
  await page.close();
}

async function scrapeAll(url: string, page: Page) {
  const scraper = new Scraper(url);
  const result = await scraper.scrape(page);
  return result;
}

export async function mkdirIfNotExists(dir: string) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") {
      throw err;
    }
  }
}

export async function compressDir(
  dir: string,
  outFile: string,
  format: archiver.Format
) {
  const stream = createWriteStream(outFile);
  const archive = archiver(format, { zlib: { level: 9 } });
  stream.on("close", () => {
    console.log(`📦  Compressed as ${outFile} (${archive.pointer()} bytes)`);
  });
  archive.on("error", (error) => {
    throw error;
  });
  archive.pipe(stream);
  archive.directory(dir, false);
  await archive.finalize();
}