import assert from "assert";
import { Page } from "puppeteer";

const DELAY_MS = parseFloat(process.env.DELAY_MS ?? "1000");

export async function scrapeKieu(page: Page, url: string) {
  console.log(`🔨  Navigating to <${url}>...`);
  await page.goto(url);

  console.log(`🔨  Crawling Kieu...`);
  let content = "";
  try {
    for (let pageId = 0; pageId < 1_000; pageId += 1) {
      await page.evaluate(`javascript:GotoPage(${pageId});`);
      content += "\n" + (await getKieuPage(page));
      await sleep(DELAY_MS);
    }
  } catch (e) {
    // Ignore
  }
  return content;
}

async function getKieuPage(page: Page) {
  const selector =
    "#search_en > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)";
  await page.waitForSelector(selector);
  const element = await page.$(selector);
  const text = await page.evaluate(
    (e) =>
      e.innerText
        .replaceAll(
          /[^a-zA-Z_àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹýÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲỴỶỸÝ\n,.!?"]/gu,
          " "
        )
        .split(/[ \n\t]/g)
        .filter((v) => v)
        .reduce((previous, current, index) => {
          console.log(index, current);
          const t = index % 14;
          const s = t === 0 || t === 6 ? "\n" : " ";
          return previous + s + current;
        }),
    element
  );
  return text;
}

async function sleep(ms: number) {
  assert(ms > 0, "Sleep duration must be positive");
  return await new Promise((resolve) => setTimeout(resolve, ms));
}
