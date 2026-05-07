import {projectCsvSchema} from "@/lib/validator/projectCSV";

function parseDateString(dateStr: string) {

    if (/^\d{8}$/.test(dateStr)) {
        const year = dateStr.slice(0, 4);
        const month = dateStr.slice(4, 6);
        const day = dateStr.slice(6, 8);
        return new Date(`${year}-${month}-${day}`).toISOString();
    }

    // fallback
    return new Date(dateStr).toISOString();
}

export function isValidUTF8(buffer: Buffer) {
    try {
        new TextDecoder("utf-8", { fatal: true }).decode(buffer);
        return true;
    } catch {
        return false;
    }
}

export const projectCsvParser = projectCsvSchema.transform((item) => ({
    project_id: item.project_id,

    start_date: parseDateString(item.start_date),
    end_date: parseDateString(item.end_date),

    department: item.department,
    project_type: item.project_type,
    project_name: item.project_name,

    active: item.active,
    sansho_user: item.sansho_user,
}));