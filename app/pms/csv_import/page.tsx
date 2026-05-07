'use client';
import {Button} from "@/components/ui/button";
import {FileDown, UploadCloud} from "lucide-react";
import {ApiResponse, ImportResponse} from "@/types/api";

const RECORD_COUNT = (count: number) => `全 ${count} 件インポート完成`;

export default function ImprotComponent() {
    const downloadTemplate = () => {
        const headers = "start_date,end_date,department,project_type,project_name,active\n";
        const blob = new Blob([headers], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'import_template.csv';
        a.click();
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 简单校验文件类型
        if (!file.name.endsWith(".csv")) {
            alert("CSVファイルを選択してください");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/import", {
            method: "POST",
            body: formData,
        });

        const resData = await response.json() as ApiResponse<ImportResponse>;

        if (!resData.success) {
            alert(resData.error || "インポート失敗");
            return;
        }

        const count = resData.data?.count;

        if (!count) {
            alert(RECORD_COUNT(0));
        } else {
            alert(RECORD_COUNT(count));
        }
    };

    return (
        <main className="p-6 max-w-2xl mx-auto">
            <div className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-12 transition-colors hover:bg-muted/80 hover:border-primary/50">

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-background shadow-sm">
                    <UploadCloud className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                <div className="text-center">
                    <h3 className="text-lg font-semibold">CSVファイルをインポート</h3>
                    <p className="mb-6 text-sm text-muted-foreground">
                        クリックまたはファイルをドラッグ＆ドロップ
                    </p>
                </div>

                <input
                    type="file"
                    accept=".csv"
                    onChange={handleUpload}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    id="csv-input"
                />

                <div className="relative z-10 flex gap-3">
                    {/*<Button variant="default" className="pointer-events-none">*/}
                    {/*    ファイルを選択*/}
                    {/*</Button>*/}

                    <Button
                        variant="outline"
                        onClick={downloadTemplate}
                        type="button"
                        className="flex items-center gap-2"
                    >
                        <FileDown className="h-4 w-4" />
                        テンプレート取得
                    </Button>
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                    ※ 対応フォーマット: .csv (最大 10MB)
                </p>
            </div>
        </main>
    );
}
