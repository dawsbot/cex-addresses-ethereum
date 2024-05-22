import "dotenv/config";
import type { Browser, Page } from "playwright";
import { describe, expect, test } from "vitest";
import { closeBrowser, openBrowser } from "./BrowserUtil";
import { scanConfig } from "./scan-config";

describe("ApiParsing", () => {
  test("should pull exanded etherscan", async () => {
    const { browser, page } = (await openBrowser()) as {
      browser: Browser;
      page: Page;
    };
    const etherscanHtmlParser = scanConfig["etherscan"].htmlParser;
    const baseUrl = scanConfig["etherscan"].website;
    await etherscanHtmlParser.login(page, baseUrl);
    const url = "https://etherscan.io/tokens/label/aave?size=100";
    await page.goto(url);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const data = await etherscanHtmlParser.selectAllTokenAddressesApi(
      page,
      url,
    );
    expect(data).toContainEqual({
      tokenName: "Aave interest bearing WBTC",
      tokenImage: "/token/images/Aave_aWBTC_32.png",
      tokenSymbol: "aWBTC",
      website: "https://aave.com/atokens",
      address: "0x9ff58f4ffb29fa2266ab25e75e2a8b3503311656",
    });
    await closeBrowser(browser);
  }, 1000000);
});
