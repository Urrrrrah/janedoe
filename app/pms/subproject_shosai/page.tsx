"use client";

import {useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Trash2, Save} from "lucide-react";
import {SubprojectJohoIchiranForm} from "@/types/record";
import {apiFetch} from "@/lib/http";
import {useSearchParams} from "next/dist/client/components/navigation";
import {useForm, useWatch} from "react-hook-form";
import {useRouter} from "next/navigation";
import {ApiResponse, SubprojectShosaiResponse, UpdateResponse} from "@/types/api";
import {zodResolver} from "@hookform/resolvers/zod";
import {subprojectSchema} from "@/lib/validator/subproject";

// const SUBPROJECT_ICHIRAN = "/pms/list/subproject_ichiran";
const SUBPROJECT_UPSERT = (mode: string, joi_sys_id: string, sys_id: string) =>
    `/api/subproject_shosai?mode=${mode}&joi_sys_id=${joi_sys_id}&sys_id=${sys_id}`;
const SUBPROJECT_DELETE = (mode: string, joi_sys_id: string, sys_id: string) =>
    `/api/subproject_shosai?mode=${mode}&joi_sys_id=${joi_sys_id}&sys_id=${sys_id}`;
const SUBPROJECT_UPDATE_REFRESH = (sys_id: string) =>
    `/pms/subproject_shosai?mode=update&sys_id=${sys_id}`;
const SUBPROJECT_CREATE_REFRESH = (joi_sys_id: string) =>
    `/pms/project_shosai?mode=update&sys_id=${joi_sys_id}`;


export default function ProposalPage() {
    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<SubprojectJohoIchiranForm>({
        resolver: zodResolver(subprojectSchema),
    });

    const active = useWatch({
        control,
        name: "active",
    });

    const router = useRouter();

    const searchParams = useSearchParams();
    const mode = searchParams.get('mode') || 'create';
    const sys_id = searchParams.get('sys_id') || '';
    const joi_sys_id = searchParams.get('joi_sys_id') || '';
    const joi_project_id = searchParams.get('joi_project_id') || '';

    //DB年月日Formatに調整
    const toISODate = (date: string) => {
        if (!date) return null;
        return new Date(date).toISOString();
    };

    const onSubmit = async (data: SubprojectJohoIchiranForm) => {
        let payload;
        if (mode === 'create') {
            payload = {
                ...data,
                start_date: toISODate(data.start_date),
                end_date: toISODate(data.end_date),
                joi_project_id: joi_project_id,
            };
        } else {
            payload = {
                ...data,
                start_date: toISODate(data.start_date),
                end_date: toISODate(data.end_date),
                sys_id: sys_id,
            };
        }

        const res = await fetch(SUBPROJECT_UPSERT(mode, joi_sys_id, sys_id), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const result = await res.json() as ApiResponse<UpdateResponse>;
        if (!result.success) {
            alert(result.error ?? "エラーが発生しました。");
            return;
        }
        alert(result.data?.message);
        if (sys_id == '') {
            router.push(SUBPROJECT_CREATE_REFRESH(joi_sys_id));
        } else {
            router.push(SUBPROJECT_UPDATE_REFRESH(sys_id));
        }
    };

    const handleDelete = async () => {
        if (!confirm("削除しますか？")) return;

        const res = await fetch(SUBPROJECT_DELETE('delete', joi_sys_id, sys_id), {
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

        router.push(SUBPROJECT_UPDATE_REFRESH(sys_id));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await apiFetch<SubprojectShosaiResponse>(
                    SUBPROJECT_UPSERT(mode, joi_sys_id, sys_id)
                );
                if (!result) return;

                if (!result.success) {
                    console.error(result.error);
                    return;
                }

                if (!result.data) return;

                if (mode === "create") {
                    reset({
                        ...result.data.subproject,
                        joi_project_id: joi_project_id
                    });
                } else {
                    reset(result.data.subproject);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            }
        }
        void fetchData();

    }, [mode, sys_id, reset, joi_sys_id, joi_project_id]);

    return (
        <main className="container mx-auto p-6 min-h-screen space-y-6 bg-slate-50/50">
            <div className="flex justify-between items-end border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Subproject 詳細</h1>
                    <p className="text-muted-foreground text-sm">Subprojectの基本情報。</p>
                </div>
                <div className="flex gap-3">
                    {active && (
                        <Button type="button"
                                variant="outline"
                                className="text-destructive hover:bg-destructive/10 border-destructive/20"
                                onClick={handleDelete}>
                            <Trash2 className="w-4 h-4 mr-2"/> 削除
                        </Button>
                    )}
                    {(active || mode === 'create') && (
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
                            Subproject 情報詳細
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">


                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                {/* Subproject ID */}
                                <div className="space-y-2">
                                    <Label htmlFor="subprojectId" className="text-slate-500 font-semibold">
                                        SubprojectID
                                    </Label>
                                    <Input readOnly
                                           id="subprojectId"
                                           {...register("subproject_id")}
                                           className="bg-slate-100/50"/>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="start-date" className="font-semibold">
                                        開始年月日 <span className="text-destructive">*</span>
                                    </Label>
                                    <Input required id="start-date"
                                           type="date"
                                           {...register("start_date")}
                                    />
                                    {errors.start_date && (
                                        <p className="text-sm text-destructive">
                                            {errors.start_date.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="joi_project"
                                           className="text-slate-500 font-semibold">上位Project</Label>
                                    <Input readOnly
                                           className="bg-slate-100/50"
                                           {...register("joi_project_id")}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end-date" className="font-semibold">
                                        終了年月日 <span className="text-destructive">*</span>
                                    </Label>
                                    <Input required id="end-date"
                                           type="date"
                                           {...register("end_date")}
                                    />
                                    {errors.end_date && (
                                        <p className="text-sm text-destructive">
                                            {errors.end_date.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title" className="font-semibold">
                                    Subproject 名 <span className="text-destructive">*</span>
                                </Label>
                                <Input required id="title"
                                       placeholder="サブプロジェクト名を入力してください"
                                       {...register("subproject_name")}
                                       className="text-lg font-medium"/>
                                {errors.subproject_name && (
                                    <p className="text-sm text-destructive">
                                        {errors.subproject_name.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="desc" className="font-semibold">説明</Label>
                                <Textarea id="desc"
                                          className="min-h-30 resize-none"
                                          {...register("short_description")}
                                          placeholder="プロジェクトの概要、目的など..."/>
                                {errors.short_description && (
                                    <p className="text-sm text-destructive">
                                        {errors.short_description.message}
                                    </p>
                                )}
                            </div>
                        </form>

                    </CardContent>
                </Card>
            </div>
        </main>
    );
}