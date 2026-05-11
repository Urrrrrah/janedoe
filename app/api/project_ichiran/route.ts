export const runtime = "nodejs";

import {NextResponse} from "next/server";
import {checkListPermission, sessionCheck} from "@/services/permission.service";
import {getProjectList} from "@/services/project.service";

const TABLE_NAME = "project_joho_ichiran";

export async function GET() {
    try {
        // 認証チェック
        const loggedUser = await sessionCheck();

        //ユーザーが参照可能なプロジェクトList取得
        //Adminの場合全件表示
        const permissionList = loggedUser.roles.includes("admin")
            ? null
            : await checkListPermission(TABLE_NAME, loggedUser.user_id);


        const result = await getProjectList(permissionList);

        return NextResponse.json(
            result,
            { status: 200 }
        );

    } catch (error) {
        console.error("Database error:", error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        }, {status: 500});

    }
}