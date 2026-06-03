// Shared contract: all clients build this shape before calling template/render functions.

export interface CaseItem {
    type: string;
    colour: string;
    toothNum: string;
    item: string;
    shade: string;
}

export interface ProductionStep {
    date: string; // formatted DD/MM
    rawDate: string; // ISO 8601
    step: string;
    tech: string;
    completedTech: string;
    completedDate: string;
}

export interface CaseData {
    patientFirstName: string;
    patientLastName: string;
    patientName: string; // "Last, First"
    panNum: string;
    barcode: string;
    clientInfo: string; // clientName
    clientName: string;
    clientAddr1: string;
    clientAddr2: string;
    clientAddr3: string;
    clientCity: string;
    clientZip: string;
    appointmentDate: string;
    doctorName: string; // "Last, First"
    phone: string; // clientPhone
    caseItems: CaseItem[];
    comments: string; // specialInstruction
    productionLog: ProductionStep[];
    dueDate: string; // formatted DD/MM
    rawDueDate: string; // ISO 8601
    shipDate: string; // formatted DD/MM
    doctorPreferences: string[];
    courierInfo: string;
    remakeStatus: string; // "[R]", "[A]", or ""
    caseFlagMsg: string;
    createdDate: string; // ISO 8601
}

export type PdfType = "workTicket" | "label" | "addressLabel" | "caseLabel";

export interface PdfDimensions {
    width: string;
    height: string;
}

export const PDF_DIMENSIONS: Record<PdfType, PdfDimensions> = {
    workTicket: { width: "297mm", height: "210mm" },
    label: { width: "100mm", height: "61mm" },
    addressLabel: { width: "100mm", height: "62mm" },
    caseLabel: { width: "100mm", height: "62mm" },
};
