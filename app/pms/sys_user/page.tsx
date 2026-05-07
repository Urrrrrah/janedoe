"use client";

import {useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Trash2, Save} from "lucide-react";
import {apiFetch} from "@/lib/http";
import {useSearchParams} from "next/dist/client/components/navigation";
import {useForm} from "react-hook-form";
import {useRouter} from "next/navigation";
import {ApiResponse, SysUserResponse, UpdateResponse} from "@/types/api";
import {zodResolver} from "@hookform/resolvers/zod";
import {SysUserInput, userSchema} from "@/lib/validator/sysuser";

const SYS_USER_UPSERT = (mode: string, sys_id: string) =>
    `/api/sys_user?mode=${mode}&sys_id=${sys_id}`;
const SYS_USER_DELETE = (mode: string, sys_id: string) =>
    `/api/sys_user?mode=${mode}&sys_id=${sys_id}`;
const SYS_USER_UPDATE_REFRESH = (sys_id: string) =>
    `/pms/sys_user?mode=update&sys_id=${sys_id}`;

export default function ProposalPage() {
    const {
        register,
        handleSubmit,
        reset,
        watch,
    } = useForm<SysUserInput>({
        resolver: zodResolver(userSchema),
    });

    const router = useRouter();

    const searchParams = useSearchParams();
    const mode = searchParams.get('mode') || 'create';
    const sys_id = searchParams.get('sys_id') || '';


    const onSubmit = async (data: SysUserInput) => {

        const res = await fetch(SYS_USER_UPSERT(mode, sys_id), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await res.json() as ApiResponse<UpdateResponse>;
        if (!result.success) {
            alert(result.error ?? "エラーが発生しました。");
            return;
        }
        alert(result.data?.message);
        router.push(SYS_USER_UPDATE_REFRESH(sys_id));
    };

    const handleDelete = async () => {
        if (!confirm("削除しますか？")) return;

        const res = await fetch(SYS_USER_DELETE('delete', sys_id), {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ sys_id }),
        });

        const result = await res.json() as ApiResponse<UpdateResponse>;
        if (!result.success) {
            alert(result.error ?? "エラーが発生しました。");
            return;
        }
        alert(result.data?.message);

        router.push(SYS_USER_UPDATE_REFRESH(sys_id));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await apiFetch<SysUserResponse>(
                    SYS_USER_UPSERT(mode, sys_id)
                );
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
        <main className="container mx-auto p-6 min-h-screen space-y-6 bg-slate-50/50">
            <div className="flex justify-between items-end border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">ユーザー 詳細</h1>
                    <p className="text-muted-foreground text-sm">ユーザーの基本情報。</p>
                </div>
                <div className="flex gap-3">
                    {watch('active') && (
                        <Button type="button"
                                variant="outline"
                                className="text-destructive hover:bg-destructive/10 border-destructive/20"
                                onClick={handleDelete}>
                            <Trash2 className="w-4 h-4 mr-2"/> 削除
                        </Button>
                    )}
                    {(watch('active') || mode === 'create') && (
                        <Button className="bg-primary shadow-sm"
                                onClick={handleSubmit(onSubmit)}>
                            <Save className="w-4 h-4 mr-2"/> 更新
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex justify-center">
                <Card className="w-full max-w-7xl shadow-md border-none ring-1 ring-slate-200">
                    <CardHeader className="bg-slate-50/50 rounded-t-lg">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-primary rounded-full"/>
                            ユーザー 情報詳細
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">


                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="userId" className="text-slate-500 font-semibold">
                                        ユーザー名
                                    </Label>
                                    <Input readOnly
                                           id="userId"
                                           {...register("user_id")}
                                           className="bg-slate-100/50"/>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company" className="text-slate-500 font-semibold">
                                        会社
                                    </Label>
                                    <Input id="company"
                                           {...register("company")}
                                           className="bg-slate-100/50"/>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="first_name" className="text-slate-500 font-semibold">
                                        姓
                                    </Label>
                                    <Input id="first_name"
                                           {...register("first_name")}
                                           className="bg-slate-100/50"/>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="last_name" className="text-slate-500 font-semibold">
                                        名
                                    </Label>
                                    <Input id="last_name"
                                           {...register("last_name")}
                                           className="bg-slate-100/50"/>
                                </div>
                            </div>
                        </form>

                    </CardContent>
                </Card>
            </div>
        </main>
    );
}