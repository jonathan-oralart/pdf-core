import { join } from "node:path";
import {
  generateAddressLabelHTML,
  generateCaseLabelHTML,
  generateLabelHTML,
  generateWorkTicketHTML,
} from "../src/index.ts";

const fixtureDir = "fixtures/pdf-core";
const outputDir = ".preview/pdf-core";
const fixtures = [
  ["work-ticket", generateWorkTicketHTML],
  ["label", generateLabelHTML],
  ["address-label", generateAddressLabelHTML],
  ["case-label", generateCaseLabelHTML],
] as const;

await Deno.mkdir(outputDir, { recursive: true });

await Promise.all(
  fixtures.map(async ([name, render]) => {
    const htmlFile = `${name}.html`;
    const json = await Deno.readTextFile(join(fixtureDir, `${name}.json`));
    await Deno.writeTextFile(
      join(outputDir, htmlFile),
      render(JSON.parse(json).caseData),
    );
  }),
);

console.log(`Rendered ${fixtures.length} fixture preview(s).`);
console.log(`Open ${join(Deno.cwd(), outputDir)}`);
