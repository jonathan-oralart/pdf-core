import { generateWorkTicketHTML } from "./templates.ts";
import type { CaseData, CaseItem } from "./types.ts";

function makeCaseData(caseItems: CaseItem[]): CaseData {
    return {
        patientFirstName: "Avery",
        patientLastName: "Taylor",
        patientName: "Taylor, Avery",
        panNum: "123456",
        barcode: "90000001",
        clientInfo: "Example Dental Studio",
        clientName: "Example Dental Studio",
        clientAddr1: "123 Sample Street",
        clientAddr2: "Suite 4",
        clientAddr3: "",
        clientCity: "Auckland",
        clientZip: "1010",
        appointmentDate: "2026-02-18T14:30:00.000Z",
        doctorName: "Morgan, Casey",
        phone: "09 555 0100",
        caseItems,
        comments: "Synthetic comment.",
        productionLog: [],
        dueDate: "12/02",
        rawDueDate: "2026-02-12T00:00:00.000Z",
        shipDate: "11/02",
        doctorPreferences: [],
        courierInfo: "Example Courier",
        remakeStatus: "",
        caseFlag: null,
        caseFlagMsg: "",
        createdDate: "2026-01-28T22:15:00.000Z",
    };
}

function makeItem(toothNum: string, item: string, shade: string): CaseItem {
    return {
        type: "Crown",
        colour: "Zirconia",
        toothNum,
        item,
        shade,
    };
}

function workTicketRows(html: string): string[][] {
    const tbody = html.match(
        /<table class="details-table">[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/,
    )?.[1] ?? "";

    return [...tbody.matchAll(
        /<tr>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<\/tr>/g,
    )].map((match) => match.slice(1).map((cell) => cell.trim()));
}

function assertEquals<T>(actual: T, expected: T): void {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
            `Expected ${JSON.stringify(expected)}, received ${
                JSON.stringify(actual)
            }`,
        );
    }
}

Deno.test("work ticket renders No Shade as dash and Upper & Lower as U&L", () => {
    const html = generateWorkTicketHTML(
        makeCaseData([
            makeItem("Upper & Lower", "Full Denture", "No Shade"),
        ]),
    );

    assertEquals(workTicketRows(html), [["U&L", "Full Denture", "-"]]);
});

Deno.test("work ticket consolidates same item and shade with compressed teeth", () => {
    const html = generateWorkTicketHTML(
        makeCaseData([
            makeItem("11", "Zirconia Crown", "A2"),
            makeItem("12", "Zirconia Crown", "A2"),
            makeItem("13", "Zirconia Crown", "A2"),
            makeItem("15", "Zirconia Crown", "A2"),
            makeItem("21", "Zirconia Crown", "A2"),
            makeItem("22", "Zirconia Crown", "A2"),
        ]),
    );

    assertEquals(workTicketRows(html), [[
        "11-13, 15, 21-22",
        "Zirconia Crown",
        "A2",
    ]]);
});

Deno.test("work ticket keeps same item with different shades separate", () => {
    const html = generateWorkTicketHTML(
        makeCaseData([
            makeItem("11", "Zirconia Crown", "A1"),
            makeItem("12", "Zirconia Crown", "A2"),
        ]),
    );

    assertEquals(workTicketRows(html), [
        ["11", "Zirconia Crown", "A1"],
        ["12", "Zirconia Crown", "A2"],
    ]);
});

Deno.test("work ticket tooth ranges do not cross quadrants", () => {
    const html = generateWorkTicketHTML(
        makeCaseData([
            makeItem("18", "Zirconia Crown", "A2"),
            makeItem("21", "Zirconia Crown", "A2"),
        ]),
    );

    assertEquals(workTicketRows(html), [["18, 21", "Zirconia Crown", "A2"]]);
});

Deno.test("work ticket tolerates items without tooth numbers", () => {
    const html = generateWorkTicketHTML(
        makeCaseData([
            {
                type: "",
                colour: "",
                item: "(1) Model Printed - Hollow",
                shade: "",
            },
        ]),
    );

    assertEquals(workTicketRows(html), [["", "(1) Model Printed - Hollow", ""]]);
});
