import * as cheerio from "cheerio";
import type { AccountRows } from "../ChainPuller";

export abstract class HtmlParser {
  /**
   * Find all the label urls on a labelcloud page
   * @param html - the labelcloud page content
   * @param baseUrl - the "scan" of interest.
   * @example
   * ```ts
   *  const allAnchors = htmlParser.selectAllLabels(
   *    labelCloudHtml
   * );
   * ```
   */
  #useApiForTokenRows: boolean = false;
  public setUseApiForTokenRows(useApiForTokenRows: boolean): void {
    this.#useApiForTokenRows = useApiForTokenRows;
  }
  public getUseApiForTokenRows(): boolean {
    return this.#useApiForTokenRows;
  }

  public selectAllLabels = (html: string): ReadonlyArray<string> => {
    const $ = cheerio.load(html);
    const parent = $("div > div > div.row.mb-3");

    let anchors: ReadonlyArray<string> = [];
    parent.find("a").each((index, element) => {
      const pathname = $(element).attr("href");
      if (typeof pathname !== "string") {
        console.log(`returning early because "${pathname}" is not a string`);
        return;
      }
      // tokens has a max page size of 100 while accounts seems to allow 10,000+
      // TODO: repull tokens which have a page length > 100
      const maxRecordsLength = pathname.includes("tokens") ? 100 : 10_000;
      const size = $(element).text();
      const regex = /\((.*?)\)/;
      const recordCount = Number(regex.exec(size)?.[1]);
      // if statement needed because otherwise we freeze forever on URL's like "beacon-depositor"
      if (recordCount < maxRecordsLength) {
        const href = `${pathname}?size=${maxRecordsLength}`;
        anchors = [...anchors, href];
      }
    });
    return anchors;
  };

  public abstract selectAllAccountAddresses(
    html: string,
    subcatId: string,
  ): AccountRows;
}
