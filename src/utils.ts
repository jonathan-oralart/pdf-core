// Date formatting helpers shared across PDF templates.

import dayjs from "npm:dayjs@^1.11.19";
import utc from "npm:dayjs@^1.11.19/plugin/utc.js";
import timezone from "npm:dayjs@^1.11.19/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export function getOrdinalSuffix(day: number): string {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
        case 1:
            return "st";
        case 2:
            return "nd";
        case 3:
            return "rd";
        default:
            return "th";
    }
}

// Format a "DD/MM" string as "MON 5th"
export function formatDate(dateStr: string): string {
    if (!dateStr || dateStr === "N/A") return "";
    const [day, month] = dateStr.split("/").map(Number);
    const date = new Date(new Date().getFullYear(), month - 1, day);
    const months = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
    ];
    return `${months[date.getMonth()]} ${day}${getOrdinalSuffix(day)}`;
}

// Format due date for the black box on work ticket (accepts ISO date string)
export function formatDueDate(isoDate: string): {
    day: string;
    rest: string;
} {
    if (!isoDate || isoDate === "N/A") return { day: "", rest: "" };
    const date = dayjs.utc(isoDate);
    if (!date.isValid()) return { day: "", rest: "" };

    return {
        day: String(date.date()).padStart(2, "0"),
        rest: `${date.format("MMM")} (${date.format("ddd")})`,
    };
}

// Format created date like "Mon 1 Jan".
// createDate is a real UTC timestamp (unlike most other dates in the API,
// which have "Z" suffix but are actually NZ-local), so convert to NZ time.
export function formatCreatedDate(isoDate: string): string {
    if (!isoDate) return "";
    const date = dayjs.utc(isoDate).tz("Pacific/Auckland");
    if (!date.isValid()) return "";
    return `${date.format("ddd")} ${date.date()} ${date.format("MMM")}`;
}

// Format appointment date like "Fri 28th Jan 2:30pm"
export function formatAppointmentDate(
    isoDate: string,
    includeTime: boolean = true,
    shortFormat: boolean = false,
): string {
    if (!isoDate) return "";
    const date = dayjs(isoDate);
    if (!date.isValid()) return "";

    const dayNum = date.date();
    const suffix = getOrdinalSuffix(dayNum);

    // Short format: "Tue 9th" or "Tue 9th 3pm" (no month)
    if (shortFormat) {
        if (!includeTime) {
            return `${date.format("ddd")} ${dayNum}${suffix}`;
        }
        const minutes = date.minute();
        const timeFormat = minutes > 0 ? "h:mma" : "ha";
        return `${date.format("ddd")} ${dayNum}${suffix} ${date.format(timeFormat)}`;
    }

    if (!includeTime) {
        return `${date.format("ddd")} ${dayNum}${suffix} ${date.format("MMM")}`;
    }

    const minutes = date.minute();
    const timeFormat = minutes > 0 ? "h:mma" : "ha";

    return `${date.format("ddd")} ${dayNum}${suffix} ${date.format("MMM")} ${date.format(timeFormat)}`;
}
