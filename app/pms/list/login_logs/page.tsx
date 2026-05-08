"use client";
import {useEffect, useState} from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {apiFetch} from "@/lib/http";
import {LoginLogs} from "@/types/record";
import {LoginLogsResponse} from "@/types/api";
import {useRouter} from "next/navigation";

const TABLE_NAME = "ログイン履歴";
const TITLE = "システム内のすべての" + TABLE_NAME + "を閲覧・管理できます";
const INDEX = "/pms/index";
const RECORD_COUNT = (count: number) => `全 ${count} 件のレコード`;
const NO_RECORD_MESSAGE = "記録が存在しません";
const LOGIN_LOGS_API = "/api/login_logs";

export default function UserPage() {
    const [recs, setRecs] = useState<LoginLogs[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await apiFetch<LoginLogsResponse>(LOGIN_LOGS_API);

                if(!result) return;

                if (!result.success) {
                    console.error(result.error);
                    router.push(INDEX);
                    return;
                }

                if (!result.data) return;

                setRecs(result.data.logs ?? []);

            } catch (error) {
                console.error("Fetch error:", error);
                router.push(INDEX);
            }
        };

        void fetchData();
    }, [router]);

    return (
        <main className="p-6 md:p-10 space-y-6 bg-slate-50/30 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{TABLE_NAME}</h1>
                    <p className="text-muted-foreground text-sm">
                        {TITLE}
                    </p>
                </div>
                {/*<div className="flex items-center gap-2">*/}
                {/*    <Button variant="outline" size="sm">*/}
                {/*        <Filter className="w-4 h-4 mr-2"/> フィルター*/}
                {/*    </Button>*/}
                {/*</div>*/}
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
                                    <TableHead className="font-bold">ユーザID</TableHead>
                                    <TableHead className="font-bold">ログイン時間</TableHead>
                                    <TableHead className="w-[120px] font-bold text-center">ステータス</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {recs.length ? (
                                    recs.map((rec) => (
                                        <TableRow key={rec.sys_id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="font-medium">
                                                {rec.user_id}
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-sm">
                                                {rec.login_time}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {/* ステータスによって色を変更 */}
                                                <Badge
                                                    variant={rec.status === "ok" ? "default" : "destructive"}
                                                    className={rec.status === "ok" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                                                >
                                                    {rec.status === "ok" ? "成功" : "失敗"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4}
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


