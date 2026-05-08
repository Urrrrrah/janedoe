"use client";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {apiFetch} from "@/lib/http";
import {ProjectJohoIchiran} from "@/types/record";
import {Plus} from "lucide-react";
import Link from "next/link";
import {ProjectJohoIchiranResponse} from "@/types/api";

const TABLE_NAME = "Project情報一覧";
const TITLE = "システム内のすべての" + TABLE_NAME + "を閲覧・管理できます";
const RECORD_COUNT = (count: number) => `全 ${count} 件のレコード`;
const NO_RECORD_MESSAGE = "記録が存在しません";
const NEW_PROJECT_SHOSAI = "/pms/project_shosai?mode=create";
const UPDATE_PROJECT_SHOSAI = (sys_id: string) => `/pms/project_shosai?mode=update&sys_id=${sys_id}`;


export default function UserPage() {

    const [recs, setRecs] = useState<ProjectJohoIchiran[]>([]);

    useEffect(() => {
        const fetchData = async() => {
            try {
                const result = await apiFetch<ProjectJohoIchiranResponse>("/api/project_ichiran");
                if (!result) return;

                if (!result.success) {
                    console.error(result.error);
                    return;
                }
                console.log("projects:", result.data?.projects);


                setRecs(result.data?.projects ?? []);
            } catch (error) {
                console.error("Fetch error:", error);
            }
        }
        void fetchData();

    }, []);

    return (
        <main className="p-6 md:p-10 space-y-6 bg-slate-50/30 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{TABLE_NAME}</h1>
                    <p className="text-muted-foreground text-sm">
                        {TITLE}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/*<Button variant="outline" size="sm">*/}
                    {/*    <Filter className="w-4 h-4 mr-2"/> フィルター*/}
                    {/*</Button>*/}
                    <Button size="sm" variant="outline" className="h-8 gap-1" asChild>
                        <Link href={NEW_PROJECT_SHOSAI}>
                            <Plus className="w-4 h-4"/>
                            追加
                        </Link>
                    </Button>
                </div>
            </div>
            <div className="p-6 md:p-10 space-y-6 bg-slate-50/30 min-h-screen">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="py-4 border-b bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-slate-500">
                                {RECORD_COUNT(recs.length)}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="font-bold">Project ID</TableHead>
                                    <TableHead className="font-bold">Project名</TableHead>
                                    <TableHead className="font-bold">Project種別</TableHead>
                                    <TableHead className="font-bold">開始年月日</TableHead>
                                    <TableHead className="font-bold">終了年月日</TableHead>
                                    <TableHead className="font-bold">部門</TableHead>
                                    <TableHead className="font-bold">説明</TableHead>
                                    <TableHead className="font-bold">作成者</TableHead>
                                    <TableHead className="font-bold">更新日</TableHead>
                                    <TableHead className="font-bold">アクティブ</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {recs.length ? (
                                    recs.map((rec) => (
                                        <TableRow key={rec.sys_id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="font-medium">
                                                <Link href={UPDATE_PROJECT_SHOSAI(rec.sys_id)}>
                                                    {rec.project_id}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-sm">
                                                {rec.project_name}
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-sm">
                                                {rec.project_type}
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-sm">
                                                {rec.start_date}
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-sm">
                                                {rec.end_date}
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-sm">
                                                {rec.department}
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-sm">
                                                {rec.short_description}
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-sm">
                                                {rec.created_by}
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-sm">
                                                {rec.updated}
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-sm">
                                                {String(rec.active)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7}
                                                   className="h-32 text-center text-muted-foreground italic">
                                            {NO_RECORD_MESSAGE}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}


