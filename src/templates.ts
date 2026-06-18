// HTML template generators for each PDF type.
// Barcodes use a placeholder <svg class="barcode"> that the embedded JsBarcode CDN
// script populates inside the rendering Chromium (Doppio). No DOM required at build time.

import type { CaseData } from "./types.ts";
import {
    formatDate,
    formatDueDate,
    formatCreatedDate,
    formatAppointmentDate,
} from "./utils.ts";
import dayjs from "npm:dayjs@^1.11.19";

// JsBarcode CDN script + auto-render block, appended at end of <body>
const BARCODE_SCRIPTS = `
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3/dist/JsBarcode.all.min.js"></script>
<script>
  document.querySelectorAll('.barcode').forEach(function(el) {
    var opts = JSON.parse(el.getAttribute('data-options') || '{}');
    opts.format = 'CODE128';
    JsBarcode(el, el.getAttribute('data-value'), opts);
  });
</script>`;

const CASE_FLAG_MESSAGES = {
    urgent: "Urgent Case",
    missingInfo: "Photos/email missing at entry",
    placeholderDate: "Placeholder date (not real)",
} as const;

function normalizeCaseFlagMsg(data: CaseData): string {
    const existingMessage = typeof data.caseFlagMsg === "string"
        ? data.caseFlagMsg.trim()
        : "";
    if (existingMessage) return existingMessage;

    switch (Number(data.caseFlag)) {
        case 10:
            return CASE_FLAG_MESSAGES.urgent;
        case 30:
            return CASE_FLAG_MESSAGES.missingInfo;
        case 50:
            return CASE_FLAG_MESSAGES.placeholderDate;
        default:
            return "";
    }
}

// Barcode placeholder SVG
function barcodeSvg(
    value: string,
    options: Record<string, unknown> = {},
): string {
    const opts = JSON.stringify({ displayValue: false, margin: 0, ...options });
    return `<svg class="barcode" data-value="${value}" data-options='${opts}'></svg>`;
}

// ---------------------------------------------------------------------------
// Zirconia section (work ticket only)
// ---------------------------------------------------------------------------

function generateZirconiaSection(data: CaseData): string {
    const hasZirconia = data.caseItems.some((item) =>
        item.item.toLowerCase().includes("zirconia"),
    );
    if (!hasZirconia) return "";

    return `
    <div class="content-section" style="border: 1px solid black; margin-bottom: 15px; font-size: 12px;">
      <div style="display: flex;">
        <div style="flex: 3; padding: 8px;">
          <div style="font-weight: bold; margin-bottom: 5px;">ZIRCONIA USED</div>
          <div style="display: flex; font-size: 10px;">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center;"><input type="checkbox" id="upcera" /> <label for="upcera">Upcera</label></div>
              <div style="display: flex; align-items: center;"><input type="checkbox" id="aidite" /> <label for="aidite">Aidite</label></div>
              <div style="display: flex; align-items: center;"><input type="checkbox" id="xtml" /> <label for="xtml">XTML</label></div>
            </div>
            <div style="flex: 1;">
              <div style="display: flex; align-items: center;"><input type="checkbox" id="html" /> <label for="html">HTML</label></div>
              <div style="display: flex; align-items: center;"><input type="checkbox" id="prime" /> <label for="prime">Prime</label></div>
              <div style="display: flex; align-items: center;"><input type="checkbox" id="prime_a" /> <label for="prime_a">Prime E</label></div>
            </div>
            <div style="flex: 1;">
              <div style="display: flex; align-items: center;"><input type="checkbox" id="whitepeaks" /> <label for="whitepeaks">Whitepeaks</label></div>
              <div style="display: flex; align-items: center;"><input type="checkbox" id="mt_multi" /> <label for="mt_multi">MT Multi</label></div>
              <div style="display: flex; align-items: center; margin-bottom: 1rem;"><input type="checkbox" id="other" /> <label for="other">Other:</label></div>
            </div>
          </div>
        </div>
        <div style="flex: 2; padding: 8px; background-color: #f2f2f2; border-left: 1px solid black; display: flex; flex-direction: column; justify-content: space-between;">
          <div style="font-weight: bold;">SHADE</div>
          <div style="font-size: 10px; display: flex;">
            <div style="display: flex; align-items: center; margin-right: 15px;"><input type="checkbox" id="blockout" /> <label for="blockout">Blockout</label></div>
            <div style="display: flex; align-items: center;"><input type="checkbox" id="tint" /> <label for="tint">Tint</label></div>
          </div>
        </div>
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Work Ticket (A4 landscape, 297x210mm)
// ---------------------------------------------------------------------------

export function generateWorkTicketHTML(data: CaseData): string {
    const dueDateTime = formatDueDate(data.rawDueDate);
    const headerBarcode = barcodeSvg(data.barcode, { width: 1, height: 25 });
    const caseFlagMsg = normalizeCaseFlagMsg(data);

    return `<!DOCTYPE html>
<html>
<head>
    <title>Lab Sheet - ${data.patientName}</title>
    <style>
        body { 
            font-family: Arial, sans-serif;
            box-sizing: border-box;
            padding: 0px;
        }
        .page-container { width: 100%; margin: 0 auto; overflow: visible; }
        .header-section-top { margin-bottom: 20px; position: relative; min-height: 58px; }
        .work-ticket-header { display: flex; justify-content: space-between; align-items: flex-start; margin-right: 10px; padding-right: 125px; }
        .header-pan { flex-shrink: 0; }
        .content-columns { column-count: 3; column-gap: 20px; column-fill: auto; height: 100%; }
        .content-section { margin-bottom: 20px; }
        .header-section { text-align: left; }
        .header-section.center { text-align: center; }
        .header-section.right { text-align: right; }
        .company-name { font-size: 11px; font-weight: bold; margin-bottom: 0; }
        .courier-text { font-size: 11px; font-weight: bold; margin-bottom: 5px; }
        .pan-number { font-size: 24px; font-weight: bold; white-space: nowrap; }
        .due-date-box { background: #000; color: #fff; padding: 8px; text-align: center; width: 94px; z-index: 1; }
        .header-date-box { position: absolute; top: 0; right: 10px; }
        .due-date-day { font-size: 54px; font-weight: bold; line-height: 1; margin-bottom: 6px; }
        .due-date-rest { font-size: 16px; line-height: 1.2; }
        .info-label { font-size: 12px; color: #666; }
        .info-value { font-size: 30px; font-weight: bold; margin-bottom: 10px; display: flex; }
        .patient-name { flex-grow: 1; }
        .remake-status { color: red; }
        .details-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .details-table th { border-bottom: 2px solid #000; padding: 6px 8px; text-align: left; font-weight: bold; border-top: none; font-size: 14px; white-space: nowrap; }
        .details-table td { padding: 6px 8px; text-align: left; font-size: 14px; border-bottom: 1px solid #e0e0e0; }
        .schedule-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .schedule-table tr { border-bottom: 1px solid #e0e0e0; }
        .schedule-table td { padding: 4px 8px; vertical-align: top; line-height: 1; }
        @page { margin: 0.5cm; size: A4 landscape; }
        body { print-color-adjust: exact; margin: 0; }
        .page-container { max-width: none; width: 100%; min-height: auto; }
        .comments-box { margin-bottom: 20px; }
        .comments-box h3 { margin-bottom: 0; }
        .comments-content { white-space: pre-line; border-top: 2px solid #000; padding-top: 10px; font-weight: bold; }
        .doctor-preferences { margin-bottom: 20px; }
        .doctor-preferences h3 { margin-bottom: 0; padding: 0; }
        .doctor-preferences > div { border-top: 2px solid #000; padding: 10px 0; }
        .schedule-table th { text-align: left; padding: 6px 8px; font-weight: bold; border-bottom: 2px solid #000; }
        .phone-label { color: #666; font-size: 12px; margin-bottom: 2px; }
        .phone-value { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
        .production-schedule h3 { margin-bottom: 10px; font-size: 16px; font-weight: bold; padding-bottom: 5px; border-bottom: 2px solid #000; }
        .schedule-table thead tr th { border-bottom: 2px solid #000; border-top: none; }
        .schedule-table td:first-child { font-weight: bold; }
        .doctor-patient-info { overflow: hidden; margin-bottom: 15px; }
        .doctor-info { float: left; width: calc(100% - 125px); }
        .patient-info { clear: both; margin-bottom: 10px; }
        .phone-info { margin-bottom: 10px; }
        .total-units { margin-bottom: 15px; font-weight: bold; }
        .send-for-approval-section { background-color: #f3833b; color: black; padding: 16px 12px; margin-bottom: 15px; font-size: 14px; }
        .send-for-approval-section strong { font-size: 16px; }
        .urgent-banner { background-color: #dc143c; color: white; text-align: center; font-size: 32px; font-weight: bold; padding: 10px; margin-bottom: 15px; break-inside: avoid; }
        .missing-info-banner { background-color: #f5c518; color: black; text-align: center; font-size: 16px; font-weight: bold; padding: 5px; margin-bottom: 15px; break-inside: avoid; }
        .placeholder-date-banner { background-color: #2f80ed; color: white; text-align: center; font-size: 20px; font-weight: bold; padding: 8px; margin-bottom: 15px; break-inside: avoid; }
        .check-case-entry-banner { background-color: #9874D3; color: white; text-align: center; font-size: 16px; font-weight: bold; padding: 5px; margin-bottom: 15px; break-inside: avoid; }
    </style>
</head>
<body>
    <div class="page-container">
        <div class="content-columns">
            ${caseFlagMsg === CASE_FLAG_MESSAGES.urgent ? '<div class="content-section urgent-banner">URGENT</div>' : ""}
            ${caseFlagMsg === CASE_FLAG_MESSAGES.missingInfo ? '<div class="content-section missing-info-banner">Missing Information</div>' : ""}
            ${caseFlagMsg === CASE_FLAG_MESSAGES.placeholderDate ? '<div class="content-section placeholder-date-banner">Placeholder date (not real)</div>' : ""}
            ${data.caseItems.some((item) => item.item.includes("[A] Check Case Entry")) ? '<div class="content-section check-case-entry-banner">Check Case Entry</div>' : ""}
            <div class="content-section header-section-top">
                <div class="work-ticket-header">
                    <div>
                        <div class="company-name">${data.clientInfo}</div>
                        ${headerBarcode}
                    </div>
                    <div class="header-pan">
                        <div class="courier-text">${data.courierInfo || "No Courier Specified"}</div>
                        <div class="pan-number">${data.panNum}</div>
                    </div>
                </div>
                <div class="due-date-box header-date-box">
                    <div class="due-date-day">${dueDateTime.day}</div>
                    <div class="due-date-rest">${dueDateTime.rest}</div>
                </div>
            </div>

            <div class="content-section doctor-patient-info">
                <div class="doctor-info">
                    <div class="info-label">Doctor</div>
                    <div class="info-value">${data.doctorName}</div>
                </div>
            </div>

            <div class="content-section patient-info">
                <div class="info-label">Patient</div>
                <div class="info-value">
                    <div class="patient-name">${data.patientName}</div>
                    ${data.remakeStatus ? `<div class="remake-status">${data.remakeStatus}</div>` : ""}
                </div>
            </div>

            <div class="content-section phone-info">
                <div class="phone-label">Phone</div>
                <div class="phone-value">${data.phone}</div>
            </div>

            ${data.caseItems.some((item) => item.item.includes("*Send design for approval * Check it happened*")) ? `
            <div class="content-section send-for-approval-section">
                <div style="margin-bottom: 20px;"><strong>Send Design for approval</strong></div>
                <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                    <span>Sent: ___________</span>
                    <span>Approved: ___________</span>
                </div>
            </div>
            ` : ""}

            ${generateZirconiaSection(data)}

            <div class="content-section">
                <table class="details-table">
                    <thead>
                        <tr>
                            <th>Tooth #</th>
                            <th>Description</th>
                            <th>Shade</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.caseItems
                            .map(
                                (item) => `
                            <tr>
                                <td>${item.toothNum}</td>
                                <td>${item.item}</td>
                                <td>${item.shade}</td>
                            </tr>`,
                            )
                            .join("")}
                    </tbody>
                </table>
            </div>

            <div class="content-section comments-box">
                <h3>Comments</h3>
                <div class="comments-content">${data.comments}</div>
            </div>

            <div class="content-section doctor-preferences">
                <h3>Doctor Preferences</h3>
                <div>
                    ${data.doctorPreferences.map((pref) => `<div>${pref}</div>`).join("")}
                </div>
            </div>

            <div class="content-section production-schedule">
                <h3>Production Schedule</h3>
                <table class="schedule-table">
                    <thead>
                        <tr>
                            <th style="width: 80px">Deadline</th>
                            <th>Step</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.productionLog
                            .map(
                                (log) => `
                            <tr>
                                <td>${formatDate(log.date)}</td>
                                <td>${log.step}</td>
                            </tr>`,
                            )
                            .join("")}
                    </tbody>
                </table>
            </div>

            ${data.createdDate ? `
            <div class="content-section" style="font-size: 14px; font-weight: bold;">
                Case entered in LMS: ${formatCreatedDate(data.createdDate)}
            </div>
            ` : ""}
        </div>
    </div>
    ${BARCODE_SCRIPTS}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Label (100x61mm)
// ---------------------------------------------------------------------------

export function generateLabelHTML(data: CaseData): string {
    // Group items by type and count teeth, excluding "hide" type
    const typeGroups = data.caseItems.reduce(
        (acc: Record<string, number>, item) => {
            if (item.type && item.type.toLowerCase() !== "hide") {
                const type = item.type;
                const teethCount = item.toothNum?.split(/[,&]/)?.length || 1;
                acc[type] = (acc[type] || 0) + teethCount;
            }
            return acc;
        },
        {},
    );

    const typeText = Object.entries(typeGroups)
        .map(([type, count]) => `${count}\u02E3${type}`)
        .join("\n");

    const colourText = [
        ...new Set(
            data.caseItems
                .map((x) => x.colour)
                .filter((x) => x && x !== "Hide"),
        ),
    ].join(", ");

    // Find the main production date
    const mainDateSteps = [
        "CAD Design",
        "Set Up",
        "Porcelain",
        "Substructure",
        "Stain, glaze & fit",
        "Digital Denture Work",
        "Technician's Desk",
        "Cast printed crown/coping",
        "Digital Wax-Up",
        "Denture Process/Finish Acrylic",
        "Denture Process/Finish Valplast & Thermosense",
        "Metal Work",
        "Make simple appliance",
        "Wax-Ups",
    ].map((x) => x.toLowerCase());

    const matchingSteps = data.productionLog.filter((log) =>
        mainDateSteps.includes(log.step.toLowerCase()),
    );

    const porcelainStep =
        matchingSteps.length > 0
            ? matchingSteps.reduce(
                  (latest, current) =>
                      !latest || current.rawDate > latest.rawDate ? current : latest,
                  null as (typeof matchingSteps)[0] | null,
              )
            : null;

    let formattedDate = "ERROR";
    if (porcelainStep?.rawDate) {
        const dateOnly = porcelainStep.rawDate.split("T")[0];
        formattedDate = dayjs(dateOnly).format("ddd DD MMM");
    }

    const headerBarcode = barcodeSvg(data.barcode, { width: 5.0, margin: 0 });

    return `<!DOCTYPE html>
<html>
<head>
    <style>
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { margin: 0; padding: 0px 10px; font-family: monospace; max-width: 96mm; }
        .header { display: flex; align-items: stretch; margin-bottom: 2px; height: 25px; }
        .patient-name-box { background: #000; color: #fff; line-height: 25px; display: flex; align-items: flex-start; font-size: 15px; font-weight: bold; flex: 1; margin-right: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-left: 4px }
        .barcode-box { display: flex; align-items: center; justify-content: center; flex: 0 0 auto; }
        .barcode-box svg { height: 100%; width: auto; }
        .container { display: flex; width: 100%; align-items: start; font-size: 20px; margin-bottom: 5px; }
        .left { text-align: left; word-break: normal; white-space: pre-line; line-height: 1.2; flex: 1; }
        .center-column { display: flex; flex-direction: column; align-items: center; flex: 1; }
        .day-date { text-align: center; white-space: nowrap; font-weight: bold; }
        .right { text-align: right; white-space: nowrap; flex: 1; }
    </style>
</head>
<body style="height: 100vh; box-sizing: border-box; display: flex; flex-direction: column;">
    <div class="header">
        <div class="patient-name-box">${data.patientName}</div>
        <div class="barcode-box">${headerBarcode}</div>
    </div>
    <div class="container">
        <div class="left">${typeText || "N/A"}</div>
        <div class="center-column">
            <div class="day-date">${formattedDate}</div>
        </div>
        <div class="right">${data.panNum}</div>
    </div>
    <div style="flex-grow: 1;"></div>
    <div class="colour-container" style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; font-size: 10px;">
        <span>${colourText}</span>
    </div>
    ${BARCODE_SCRIPTS}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Address Label (100x62mm)
// ---------------------------------------------------------------------------

export function generateAddressLabelHTML(data: CaseData): string {
    const patientName =
        `${data.patientLastName}, ${data.patientFirstName}`.trim();
    const hasPatientName = patientName && patientName !== ",";

    const addressLines = [
        { text: data.clientName || "", isBold: true },
        { text: data.clientAddr1 || "", isBold: false },
        { text: data.clientAddr2 || "", isBold: false },
        { text: data.clientAddr3 || "", isBold: false },
        {
            text: [data.clientCity, data.clientZip].filter((x) => x).join(", "),
            isBold: false,
        },
    ].filter((line) => line.text && line.text.trim() !== "");

    // Use appointment date if available, otherwise fall back to due date (without time)
    const dateText = data.appointmentDate
        ? formatAppointmentDate(data.appointmentDate, true, true)
        : data.rawDueDate
            ? formatAppointmentDate(data.rawDueDate, false, true)
            : "";

    const addressHTML = addressLines
        .map((line) =>
            line.isBold
                ? `<div class="client-name">${line.text}</div>`
                : `<div style="font-size: 14px; line-height: 1.4; color: #555;">${line.text}</div>`,
        )
        .join("");

    const patientHTML = hasPatientName
        ? `<div class="patient-name">${patientName}</div>`
        : "";

    return `<!DOCTYPE html>
<html>
<head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    <style>
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
        html { margin: 0; padding: 20px; min-height: 100vh; background: #525659; }
        body { margin: 0 auto; padding: 12px 16px; width: 100mm; height: 62mm; overflow: hidden; font-family: 'Roboto', sans-serif; display: flex; flex-direction: column; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
        .address-section { color: #000; flex: 1; overflow: hidden; }
        .client-name { font-weight: bold; font-size: 30px; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.2; }
        .patient-name { font-size: 14px; text-align: right; color: #555; margin-top: 8px; }
        .divider { border-top: 1px solid #000; margin: 8px 0; }
        .date-section { font-weight: bold; font-size: 30px; text-align: right; }
        @media print { html { padding: 0; background: none; } body { box-shadow: none; } }
        @page { size: 100mm 62mm; margin: 0; }
    </style>
</head>
<body>
    <div class="address-section">${addressHTML}</div>
${patientHTML}
    <div class="divider"></div>
    ${dateText ? `<div class="date-section">${dateText}</div>` : ""}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Case Label (100x62mm)
// ---------------------------------------------------------------------------

export function generateCaseLabelHTML(data: CaseData): string {
    const caseBarcode = barcodeSvg(data.barcode, {
        width: 2,
        height: 40,
        displayValue: false,
        margin: 0,
    });
    const patientName = `${data.patientLastName}, ${data.patientFirstName}`;

    return `<!DOCTYPE html>
<html>
<head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    <style>
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
        html { margin: 0; padding: 20px; min-height: 100vh; background: #525659; }
        body {
            margin: 0 auto;
            padding: 12px 16px;
            width: 100mm;
            height: 62mm;
            overflow: hidden;
            font-family: 'Roboto', sans-serif;
            display: flex;
            flex-direction: column;
            background: #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        @media print { html { padding: 0; background: none; } body { box-shadow: none; } }
        @page { size: 100mm 62mm; margin: 0; }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
        }
        .patient-name {
            font-size: 24px;
            font-weight: bold;
            flex: 1;
            line-height: 1.1;
        }
        .middle-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .client-name {
            font-size: 18px;
        }
        .pan-num {
            font-size: 24px;
            font-weight: bold;
            text-align: right;
        }
        .barcode-section {
            margin-top: auto;
        }
        .barcode-number {
            font-size: 12px;
            margin-bottom: 4px;
            font-family: monospace;
        }
        .barcode-svg {
            display: flex;
        }
        .barcode-svg svg {
            max-width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="patient-name">${patientName}</div>
    </div>
    <div class="middle-row">
        <div class="client-name">${data.clientName}</div>
        <div class="pan-num">${data.panNum}</div>
    </div>
    <div class="barcode-section">
        <div class="barcode-number">${data.barcode}</div>
        <div class="barcode-svg">${caseBarcode}</div>
    </div>
    ${BARCODE_SCRIPTS}
</body>
</html>`;
}
