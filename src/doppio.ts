// Transport-injected Doppio PDF renderer.
// Each caller (Tampermonkey/Raycast/Node/etc.) supplies its own transport so we
// can accommodate GM_xmlhttpRequest, fetch, or any other HTTP mechanism.

import type { PdfDimensions } from "./types.ts";

export interface PdfTransport {
    /**
     * Perform a POST request and resolve with the raw response body as bytes.
     * Reject on non-2xx or network error.
     */
    post(
        url: string,
        headers: Record<string, string>,
        body: string,
    ): Promise<ArrayBuffer>;
}

// UTF-8 safe base64 encoding that works in browsers, TM, and Node.
function utf8ToBase64(str: string): string {
    // Node / Deno path
    if (typeof globalThis !== "undefined") {
        const g = globalThis as unknown as {
            Buffer?: { from: (s: string, enc: string) => { toString: (e: string) => string } };
        };
        if (g.Buffer && typeof g.Buffer.from === "function") {
            return g.Buffer.from(str, "utf-8").toString("base64");
        }
    }
    // Browser path
    return btoa(
        encodeURIComponent(str).replace(
            /%([0-9A-F]{2})/g,
            (_match, p1: string) => String.fromCharCode(parseInt("0x" + p1, 16)),
        ),
    );
}

export const DOPPIO_URL = "https://api.doppio.sh/v1/render/pdf/direct";

export async function renderHtmlToPdf(
    htmlContent: string,
    dimensions: PdfDimensions,
    apiKey: string,
    transport: PdfTransport,
): Promise<ArrayBuffer> {
    const payload = {
        page: {
            pdf: {
                width: dimensions.width,
                height: dimensions.height,
                margin: {
                    top: "1mm",
                    right: "1mm",
                    bottom: "2mm",
                    left: "1mm",
                },
                printBackground: true,
            },
            setContent: {
                html: utf8ToBase64(htmlContent),
            },
        },
    };

    return transport.post(
        DOPPIO_URL,
        {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        JSON.stringify(payload),
    );
}
