import { z } from "zod";

export const projectCsvSchema = z.object({
    project_id: z.string().optional(),

    start_date: z.string().min(1),
    end_date: z.string().min(1),

    department: z.string().min(1),
    project_type: z.string().min(1),
    project_name: z.string().min(1),

    active: z
        .string()
        .optional()
        .transform((val) => {
            if (!val) return true;

            const v = val.toLowerCase();

            if (v === "true" || v === "1") return true;
            if (v === "false" || v === "0") return false;

            throw new Error("activeの値が不正です");
        }),

    sansho_user: z
        .array(
            z.object({
                sys_id: z.string(),
                name: z.string(),
                user_id: z.string(),
            })
        )
        .nullable()
        .optional(),
});