import {z} from "zod";

export const newUserSchema = z.object({
    first_name: z
        .string()
        .max(255, "255文字以内で入力してください。")
        .refine(
            (val) => !val || !/[<>$%{}[\]|\\^~`]/.test(val),
            "使用できない記号が含まれています。"
        ),

    last_name: z
        .string()
        .max(255, "255文字以内で入力してください。")
        .refine(
            (val) => !val || !/[<>$%{}[\]|\\^~`]/.test(val),
            "使用できない記号が含まれています。"
        ),

    email: z
        .string()
        .min(1, "メールアドレスを入力してください。")
        .email("メールアドレスの形式が正しくありません。"),

    company: z
        .string()
        .max(255, "255文字以内で入力してください。")
        .refine(
            (val) => !val || !/[<>$%{}[\]|\\^~`]/.test(val),
            "使用できない記号が含まれています。"
        ),

    user_id: z
        .string()
        .min(6, "ユーザーIDは6文字以上で入力してください。")
        .max(20, 'ユーザーIDは20文字以内で入力してください。')
        .regex(/^[A-Za-z0-9]+$/, "ユーザーIDは半角英数字のみ入力してください。"),

    password: z
        .string()
        .min(8, "パスワードは8文字以上で入力してください。")
        .max(32, "パスワードは32文字以内で入力してください。"),


    active: z.boolean().optional(),
});

export type NewUserInput = z.infer<typeof newUserSchema>;
