"use client";

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Separator} from "@/components/ui/separator";
import {Plus, Trash2, Save} from "lucide-react";
import {ProjectJohoIchiranForm, SubprojectJohoIchiran} from "@/types/record";
import {apiFetch} from "@/lib/http";
import Link from "next/link";
import {useSearchParams} from "next/dist/client/components/navigation";
import {Controller, useForm, useWatch} from "react-hook-form";
import {LookupDialog} from "@/components/look-up-dialog";
import {useRouter} from "next/navigation";
import {ApiResponse, ProjectFormResponse, UpdateResponse} from "@/types/api";
import {projectSchema} from "@/lib/validator/project";
import {zodResolver} from "@hookform/resolvers/zod";


const SUBPROJECT_ICHIRAN = "/pms/list/subproject_ichiran";
const PROJECT_CREATE_REFRESH = '/pms/list/project_ichiran';

const PROJECT_UPSERT = (mode: string, sys_id: string) =>
    `/api/project_shosai?mode=${mode}&sys_id=${sys_id}`;
const PROJECT_UPDATE_REFRESH = (sys_id: string) =>
    `/pms/project_shosai?mode=update&sys_id=${sys_id}`;
const NEW_SUBPROJECT_SHOSAI = (sys_id: string, project_id: string) =>
    `/pms/subproject_shosai?mode=create&joi_sys_id=${sys_id}&joi_project_id=${project_id}`;
const UPDATE_SUBPROJECT_SHOSAI = (sys_id: string, joi_sys_id: string) =>
    `/pms/subproject_shosai?mode=update&joi_sys_id=${joi_sys_id}&sys_id=${sys_id}`;


export default function ProposalPage() {
    const {
        register,
        setValue,
        handleSubmit,
        reset,
        control,
        formState: {errors},
    } = useForm<ProjectJohoIchiranForm>({
        resolver: zodResolver(projectSchema),
    });

    const active = useWatch({
        control,
        name: "active",
    });

    const sansho_user = useWatch({
        control,
        name: "sansho_user",
    });

    const project_id = useWatch({
        control,
        name: "project_id",
    });

    const [subrecs, setSubRecs] = useState<SubprojectJohoIchiran[]>([]);

    const router = useRouter();

    const searchParams = useSearchParams();
    const mode = searchParams.get('mode') || 'create';
    const sys_id = searchParams.get('sys_id') || '';
    const [open, setOpen] = useState(false);

    //DB年月日Formatに調整
    const toISODate = (date: string) => {
        if (!date) return null;
        return new Date(date).toISOString();
    };

    const onSubmit = async (data: ProjectJohoIchiranForm) => {
        const payload = {
            ...data,
            start_date: toISODate(data.start_date),
            end_date: toISODate(data.end_date),
        };

        const res = await fetch(PROJECT_UPSERT(mode, sys_id), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const result = await res.json() as ApiResponse<UpdateResponse>;
        alert(result.data?.message);

        if (mode === 'create') {
            router.push(PROJECT_CREATE_REFRESH);
        } else {
            router.push(PROJECT_UPDATE_REFRESH(sys_id));
        }
    };

    const handleDelete = async () => {
        if (!confirm("削除しますか？")) return;

        const res = await fetch(PROJECT_UPSERT('delete', sys_id), {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({sys_id}),
        });

        const result = await res.json() as ApiResponse<UpdateResponse>;
        alert(result.data?.message);

        router.push(PROJECT_CREATE_REFRESH);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await apiFetch<ProjectFormResponse>(`/api/project_shosai?mode=${mode}&sys_id=${sys_id}`);
                if (!result) return;

                if (!result.success) {
                    console.error(result.error);
                    return;
                }

                if (!result.data) return;

                reset(result.data.project);
                setSubRecs(result.data.subprojects);
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
                    <h1 className="text-3xl font-bold tracking-tight">Project 詳細</h1>
                    <p className="text-muted-foreground text-sm">プロジェクトの基本情報とサブプロジェクトを管理します。</p>
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
                            Project 情報詳細
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                {/* Project ID */}
                                <div className="space-y-2">
                                    <Label htmlFor="projectId" className="text-slate-500 font-semibold">
                                        ProjectID
                                    </Label>
                                    <Input readOnly
                                           id="projectId"
                                           {...register("project_id")}
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
                                    <Label htmlFor="bumon" className="text-slate-500 font-semibold">
                                        部門<span className="text-destructive">*</span>
                                    </Label>
                                    <Input required
                                           id="bumon"
                                           className="bg-slate-100/50"
                                           {...register("department")}
                                    />
                                    {errors.department && (
                                        <p className="text-sm text-destructive">
                                            {errors.department.message}
                                        </p>
                                    )}
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

                                <div className="space-y-2">
                                    <Label htmlFor="project-type" className="font-semibold">
                                        Project 種別<span className="text-destructive">*</span>
                                    </Label>
                                    <Controller
                                        name="project_type"
                                        control={control}
                                        render={({field}) => (
                                            <Select
                                                value={field.value ?? ""}
                                                onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="選択してください"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="A">A-type</SelectItem>
                                                    <SelectItem value="B">B-type</SelectItem>
                                                    <SelectItem value="C">C-type</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.project_type && (
                                        <p className="text-sm text-destructive">
                                            {errors.project_type.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title" className="font-semibold">
                                    Project 名 <span className="text-destructive">*</span>
                                </Label>
                                <Input required id="title"
                                       placeholder="プロジェクト名を入力してください"
                                       {...register("project_name")}
                                       className="text-lg font-medium"
                                />
                                {errors.project_name && (
                                    <p className="text-sm text-destructive">
                                        {errors.project_name.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="desc" className="font-semibold">説明</Label>
                                <Textarea id="desc"
                                          className="min-h-30 resize-none"
                                          {...register("short_description")}
                                          placeholder="プロジェクトの概要、目的など..."
                                />
                                {errors.short_description && (
                                    <p className="text-sm text-destructive">
                                        {errors.short_description.message}
                                    </p>
                                )}
                            </div>

                            <Separator className="my-8"/>

                            <div className="flex flex-col gap-6">

                                <Card className="border-slate-100 shadow-none bg-slate-50/30">
                                    <CardHeader className="flex flex-row items-center justify-between py-4">
                                        <CardTitle className="text-base font-bold">参照可能ユーザー</CardTitle>
                                        <Button size="sm" variant="outline"
                                                type="button"
                                                className="h-8 gap-1"
                                                onClick={() => setOpen(true)}>
                                            <Plus className="w-4 h-4"/> 追加
                                        </Button>
                                    </CardHeader>
                                    <LookupDialog
                                        multiple
                                        open={open}
                                        onClose={() => setOpen(false)}
                                        onSelect={(record) => {
                                            setValue("sansho_user", record.map(r => ({
                                                    sys_id: r.sys_id,
                                                    name: r.first_name + r.last_name,
                                                    user_id: r.user_id
                                                }))
                                            );
                                        }}
                                    />
                                    <CardContent
                                        className="min-h-25 flex flex-col items-start justify-start text-muted-foreground text-sm">
                                        <div className="flex flex-wrap gap-2">
                                            {sansho_user?.map((user) => (
                                                <span
                                                    key={user.sys_id}
                                                    className="px-2 py-1 bg-slate-200 rounded text-sm"
                                                >
                                                    {user.name}
                                                </span>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </form>

                        <div>
                            <Card className="border-slate-100 shadow-none bg-slate-50/30">
                                <CardHeader className="flex flex-row items-center justify-between py-4">
                                    <CardTitle className="text-base font-bold">
                                        <Link href={SUBPROJECT_ICHIRAN}>Subproject 情報一覧</Link>
                                    </CardTitle>
                                    {sys_id ?
                                        (<Button size="sm" variant="outline" className="h-8 gap-1" asChild>
                                            <Link href={NEW_SUBPROJECT_SHOSAI(sys_id, project_id ?? "")}>
                                                <Plus className="w-4 h-4"/>
                                                追加
                                            </Link>
                                        </Button>) : null}
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border bg-white overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-slate-50/50">
                                                <TableRow>
                                                    <TableHead className="font-bold w-55">Subproject ID</TableHead>
                                                    <TableHead className="font-bold">名称</TableHead>
                                                    <TableHead className="font-bold">期間</TableHead>
                                                    <TableHead className="font-bold">更新日</TableHead>

                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {subrecs && subrecs.length > 0 ? (
                                                    subrecs.map((subrec) => (
                                                        <TableRow key={subrec.sys_id} className="hover:bg-slate-50/50">
                                                            <TableCell
                                                                className="font-mono text-xs">
                                                                <Link
                                                                    href={UPDATE_SUBPROJECT_SHOSAI(subrec.sys_id, sys_id)}>
                                                                    {subrec.subproject_id}
                                                                </Link>
                                                            </TableCell>
                                                            <TableCell
                                                                className="font-medium">{subrec.subproject_name}</TableCell>
                                                            <TableCell className="text-center text-xs text-slate-500">
                                                                {subrec.start_date} ~ {subrec.end_date}
                                                            </TableCell>
                                                            <TableCell
                                                                className="font-medium">{subrec.updated}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={3}
                                                                   className="text-center py-6 text-muted-foreground italic">
                                                            データがありません
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
        ;
}