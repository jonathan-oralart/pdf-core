import { join } from "node:path";
import {
  generateAddressLabelHTML,
  generateCaseLabelHTML,
  generateLabelHTML,
  generateWorkTicketHTML,
} from "../src/index.ts";

const previewDataDir = "preview-data/pdf-core";
const outputDir = "previews/pdf-core";
const previewData = [
  ["work-ticket", generateWorkTicketHTML],
  ["label", generateLabelHTML],
  ["address-label", generateAddressLabelHTML],
  ["case-label", generateCaseLabelHTML],
] as const;

await Deno.mkdir(outputDir, { recursive: true });

await Promise.all(
  previewData.map(async ([name, render]) => {
    const htmlFile = `${name}.html`;
    const json = await Deno.readTextFile(join(previewDataDir, `${name}.json`));
    await Deno.writeTextFile(
      join(outputDir, htmlFile),
      render(JSON.parse(json).caseData),
    );
  }),
);

console.log(`Rendered ${previewData.length} preview(s).`);
console.log(`Open ${join(Deno.cwd(), outputDir)}`);
