import {z} from "zod";

export const projectSchema = z.object({
    project_id: z.string().nullable().optional(),

    project_type: z.string().min(1, "Projectタイプを選択してください。"),

    department: z.string().min(1, "部門を入力してください。"),

    project_name: z
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

    active: z.boolean().optional(),
})
    .refine(
        (data) => new Date(data.end_date) >= new Date(data.start_date),
        {
            message: "終了日は開始日以降の日付を入力してください。",
            path: ["end_date"],
        }
    );

export type ProjectInput = z.infer<typeof projectSchema>;
