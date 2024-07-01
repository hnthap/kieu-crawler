import archiver from "archiver";
import { createWriteStream } from "fs";
import { mkdir, rm, writeFile } from "fs/promises";
import { join, resolve } from "path";
import { Browser } from "puppeteer";
import { scrapeKieu } from "./scraper.js";

export async function crawlKieuVersions(browser: Browser, outDir: string) {
  const metadata: { name: string; url: string }[] = [
    {
      name: "1871-van-duong",
      url: "https://nomfoundation.org/nom-project/tale-of-kieu/tale-of-kieu-version-1871",
    },
    {
      name: "1870-kinh",
      url: "https://nomfoundation.org/nom-project/tale-of-kieu/tale-of-kieu-version-1870",
    },
    {
      name: "1902-oanh-mau",
      url: "https://nomfoundation.org/nom-project/tale-of-kieu/tale-of-kieu-version-1902",
    },
  ];
  const kieuDir = join(outDir, "kieu");
  await mkdirIfNotExists(kieuDir);
  const page = await newTextPage(browser);
  for (const { name, url } of metadata) {
    const content = await scrapeKieu(page, url);
    const outFile = join(kieuDir, `kieu-${name}.txt`);
    await writeFile(outFile, content);
    console.log(`📖  Saved ${name} version as ${resolve(outFile)}`);
  }
  await page.close();
  await compressDir(kieuDir, join(outDir, "kieu.zip"), "zip");
}

export async function resetDir(dir: string) {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir);
}

async function mkdirIfNotExists(dir: string) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") {
      throw err;
    }
  }
}

async function compressDir(
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

async function newTextPage(browser: Browser) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (request.resourceType() === "image") {
      request.abort();
    } else {
      request.continue();
    }
  });
  return page;
}
