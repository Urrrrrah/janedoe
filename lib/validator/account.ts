import { z } from "zod";

export const accountSchema = z.object({
    user_id: z
        .string()
        .min(6, "ユーザーIDは6文字以上で入力してください。")
        .max(20, 'ユーザーIDは20文字以内で入力してください。')
        .regex(/^[A-Za-z0-9]+$/, "ユーザーIDは半角英数字のみ入力してください。"),
    password: z
        .string()
        .min(8, "パスワードは8文字以上で入力してください。")
        .max(32, "パスワードは32文字以内で入力してください。"),
});

export type AccountInput = z.infer<typeof accountSchema>;
