"use client";
import {useEffect} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SendHorizontal } from "lucide-react";
import {useForm} from "react-hook-form";
import {SysUserForm} from "@/types/record";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "next/navigation";
import {ApiResponse, SysUserFormResponse, UpdateResponse} from "@/types/api";
import {apiFetch} from "@/lib/http";
import {useSearchParams} from "next/dist/client/components/navigation";
import {userSchema} from "@/lib/validator/sysuser";

const USER_REGISTER = (mode: string, sys_id: string) =>
    `/api/user_register?mode=${mode}&sys_id=${sys_id}`;

export default function UpdateForm() {

    const searchParams = useSearchParams();
    const mode = searchParams.get('mode') || 'create';
    const sys_id = searchParams.get('sys_id') || '';

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<SysUserForm>({
        resolver: zodResolver(userSchema),
    });

    const router = useRouter();

    const onSubmit = async (data: SysUserForm) => {

        const res = await fetch(USER_REGISTER(mode, sys_id), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await res.json() as ApiResponse<UpdateResponse>;
        if (!result.success) {
            alert(result.error ?? "エラー発生しました。");
        } else {
            alert(result.data?.message);
            router.push("/pms/user_register?mode=update");
        }
    }

    useEffect(() => {
        if (mode !== "update") return;
        const fetchData = async () => {
            try {
                const result = await apiFetch<SysUserFormResponse>(`/api/user_register?mode=update&sys_id=${sys_id}`);
                if (!result) return;

                if (!result.success) {
                    console.error(result.error);
                    return;
                }

                if (!result.data) return;

                reset(result.data.sysuser);
            } catch (error) {
                console.error("Fetch error:", error);
            }
        }
        void fetchData();

    }, [mode, sys_id, reset]);

    return (
        <main className="min-h-screen bg-slate-50/50 p-6 md:p-10 flex justify-center items-start">
            <Card className="w-full max-w-md shadow-lg border-none ring-1 ring-slate-200">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight">ユーザー情報編集</CardTitle>
                    <CardDescription>
                        システムにアクセスするための資格情報を入力してください。
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form className="space-y-6">

                        <div className="space-y-2">
                            <Label htmlFor="user_id" className="font-semibold">
                                ユーザーID <span className="text-destructive">*</span>
                            </Label>
                            <Input readOnly
                                   id="user_id"
                                   {...register("user_id")}
                            />
                            {errors.user_id && (
                                <p className="text-sm text-destructive">
                                    {errors.user_id.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user_id" className="font-semibold">
                                パスワード
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                className="focus-visible:ring-primary"
                                placeholder="変更する場合のみ入力"
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="first_name" className="font-semibold">
                                姓 <span className="text-destructive">*</span>
                            </Label>
                            <Input required
                                   id="first_name"
                                   {...register("first_name")}
                            />
                            {errors.first_name && (
                                <p className="text-sm text-destructive">
                                    {errors.first_name.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="last_name" className="font-semibold">
                                名 <span className="text-destructive">*</span>
                            </Label>
                            <Input required
                                   id="last_name"
                                   {...register("last_name")}
                            />
                            {errors.last_name && (
                                <p className="text-sm text-destructive">
                                    {errors.last_name.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-semibold">
                                メールアドレス<span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="xxxxxx@email.com"
                                className="focus-visible:ring-primary"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company" className="font-semibold">
                                会社 <span className="text-destructive">*</span>
                            </Label>
                            <Input required
                                   id="company"
                                   {...register("company")}
                            />
                            {errors.company && (
                                <p className="text-sm text-destructive">
                                    {errors.company.message}
                                </p>
                            )}
                        </div>
                        {/* Submitボタン */}
                        <Button type="button"
                                className="w-full group"
                                onClick={handleSubmit(onSubmit)}>
                            提出
                            <SendHorizontal className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>

                    </form>
                </CardContent>
            </Card>
        </main>
    );
}


