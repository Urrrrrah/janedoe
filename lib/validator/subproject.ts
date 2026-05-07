import {z} from "zod";

export const subprojectSchema = z.object({
    subproject_id: z.string().optional(),

    joi_project_id: z.string(),

    subproject_name: z
        .string()
        .min(1, "Project名を入力してください。")
        .max(45, "45文字以内で入力してください。")
        .regex(/^[^<>$%{}[\]|\\^~`]*$/, "使用できない記号が含まれています。"),

    short_description: z
        .string()
        .max(255, "255文字以内で入力してください。")
        .nullable()
        .refine(
            (val) => !val || !/[<>$%{}[\]|\\^~`]/.test(val),
            "使用できない記号が含まれています。"
        )
        .optional(),

    start_date: z.string().min(1, "開始日を入力してください"),
    end_date: z.string().min(1, "終了日を入力してください"),

    active: z.boolean().optional(),
})
    .refine(
    (data) => data.end_date >= data.start_date,
    {
        message: "終了日は開始日以降の日付を入力してください。",
        path: ["end_date"],
    }
);


export type SubprojectInput = z.infer<typeof subprojectSchema>;
