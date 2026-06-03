/**
 * @oralart/pdf-core
 * Shared PDF templates, types, and Doppio client for Oralart print tools.
 *
 * Consumed by:
 *  - oralart-print-tool (Tampermonkey userscript)
 *  - raycast_lms (Raycast extension)
 *  - oralart-pdf-server (Netlify functions)
 */

export {
    generateWorkTicketHTML,
    generateLabelHTML,
    generateAddressLabelHTML,
    generateCaseLabelHTML,
} from "./templates.ts";

export {
    getOrdinalSuffix,
    formatDate,
    formatDueDate,
    formatCreatedDate,
    formatAppointmentDate,
} from "./utils.ts";

export type {
    CaseData,
    CaseItem,
    ProductionStep,
    PdfType,
    PdfDimensions,
} from "./types.ts";
export { PDF_DIMENSIONS } from "./types.ts";

export { renderHtmlToPdf, DOPPIO_URL } from "./doppio.ts";
export type { PdfTransport } from "./doppio.ts";
