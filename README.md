# @oralart/pdf-core

Shared PDF templates, types, and Doppio client for Oralart print tools.

Consumed by:

- [`oralart-print-tool`](https://github.com/...) (Tampermonkey userscript,
  Svelte + Vite)
- [`raycast_lms`](https://github.com/...) (Raycast extension, Node.js)
- [`oralart-pdf-server`](https://github.com/...) (Netlify Functions)

## Usage

```ts
import {
  type CaseData,
  generateWorkTicketHTML,
  PDF_DIMENSIONS,
  type PdfTransport,
  renderHtmlToPdf,
} from "@oralart/pdf-core";

const html = generateWorkTicketHTML(caseData);

const fetchTransport: PdfTransport = {
  async post(url, headers, body) {
    const r = await fetch(url, { method: "POST", headers, body });
    if (!r.ok) throw new Error(`Doppio ${r.status}: ${await r.text()}`);
    return r.arrayBuffer();
  },
};

const pdf = await renderHtmlToPdf(
  html,
  PDF_DIMENSIONS.workTicket,
  DOPPIO_API_KEY,
  fetchTransport,
);
```

### Tampermonkey transport

```ts
const gmTransport: PdfTransport = {
  post: (url, headers, body) =>
    new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "POST",
        url,
        headers,
        data: body,
        responseType: "arraybuffer",
        onload: (r) => (r.status === 200
          ? resolve(r.response)
          : reject(new Error(`Doppio ${r.status}`))),
        onerror: reject,
      });
    }),
};
```

## Barcode rendering

Templates emit placeholder
`<svg class="barcode" data-value="..." data-options="...">` tags plus an
appended `<script>` that loads JsBarcode from jsDelivr and populates them.
Rendering happens inside the PDF engine's Chromium (Doppio), so the package has
no DOM dependency at template-build time.

## Development

```bash
deno task check
npx jsr publish --dry-run
npx jsr publish             # requires @oralart scope membership on jsr.io
```

### Preview templates with captured data

In this repo, preview data captured from `raycast_lms` lives in
`preview-data/pdf-core`. To regenerate HTML previews after editing a template:

```bash
deno task preview # writes previews/pdf-core/*.html and regenerates on changes
```

The generated preview files are ignored by git. The captured preview data may
contain real LMS case data, so keep them private; they are intentionally
excluded from JSR publishes.
