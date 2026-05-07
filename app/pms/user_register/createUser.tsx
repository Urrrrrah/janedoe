"use client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {SendHorizontal} from "lucide-react";
import {useForm} from "react-hook-form";
import {NewUserForm} from "@/types/record";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "next/navigation";
import {ApiResponse, SysUserFormResponse, UpdateResponse} from "@/types/api";
import {newUserSchema} from "@/lib/validator/user_register";
import {useSearchParams} from "next/dist/client/components/navigation";
import {useEffect} from "react";
import {apiFetch} from "@/lib/http";

const LOGIN = "/login";
const INDEX = "/pms/index";
const USER_REGISTER = (mode: string, admin: string) =>
    `/api/user_register?mode=${mode}&admin=${admin}`;


export default function CreateForm() {
    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<NewUserForm>({
        resolver: zodResolver(newUserSchema),
    });

    const searchParams = useSearchParams();
    const admin = searchParams.get('admin') || "false";
    const mode = searchParams.get('mode') || 'create';
    const sys_id = searchParams.get('sys_id') || '';

    const router = useRouter();

    const onSubmit = async (data: NewUserForm) => {
        const res = await fetch(USER_REGISTER("create", admin), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await res.json() as ApiResponse<UpdateResponse>;
        alert(result.data?.message);
        router.push(LOGIN);
    }

    useEffect(() => {
        if (mode !== "create") return;
        const fetchData = async () => {
            try {
                const result = await apiFetch<SysUserFormResponse>('/api/user_register?mode=create');
                if (!result) return;

                if (!result.success) {
                    console.error(result.error);
                    router.push(INDEX);
                    return;
                }

                if (!result.data) return;
            } catch (error) {
                console.error("Fetch error:", error);
                router.push(INDEX);
            }
        }
        void fetchData();

    }, [mode, sys_id, router]);

    return (
        <main className="min-h-screen bg-slate-50/50 p-6 md:p-10 flex justify-center items-start">
            <Card className="w-full max-w-md shadow-lg border-none ring-1 ring-slate-200">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight">新規ユーザー登録</CardTitle>
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
                            <Input required
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
                                パスワード<span className="text-destructive">*</span>
                            </Label>
                            <Input
                                required
                                id="password"
                                type="password"
                                className="focus-visible:ring-primary"
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
                                required
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
                            <SendHorizontal className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"/>
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}


