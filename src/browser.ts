import { launch } from "puppeteer";

export async function startBrowser() {
  console.log("🔥  Opening browser...");
  const browser = await launch({
    headless: false,
    args: ["--disable-setuid-sandbox"],
    ignoreHTTPSErrors: true,
  });
  console.log("💎  Browser opened.");
  return browser;
}