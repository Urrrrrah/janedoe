import {NextRequest, NextResponse} from 'next/server';
import {z} from "zod";
import {isValidUTF8, projectCsvParser} from "@/services/csv.service";
import {createProjectsFromCSV} from "@/services/project.service";
import Papa from "papaparse";
import iconv from "iconv-lite";
import {sessionCheck} from "@/services/permission.service";

export async function POST(req: NextRequest) {
    try {
        const loggedUser = await sessionCheck();

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({success: false, error: "ファイルなし"}, {status: 400});
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        let text;

        if (isValidUTF8(buffer)) {
            text = new TextDecoder("utf-8").decode(buffer);
        } else {
            text = iconv.decode(buffer, "Shift_JIS");
        }

        const parseResult = Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
        });

        if (parseResult.errors.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "CSV解析エラー",
                    details: parseResult.errors,
                },
                { status: 400 }
            );
        }

        const data = parseResult.data;

        const parsedResult = z.array(projectCsvParser).safeParse(data);

        if (!parsedResult.success) {
            console.error(parsedResult.error);

            return NextResponse.json({
                success: false,
                error: "CSVデータ形式エラー",
            }, {status: 400});
        }

        const formattedData = parsedResult.data;

        const result = await createProjectsFromCSV(formattedData, loggedUser.user_id);

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Import Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        }, {status: 500});
    }
}