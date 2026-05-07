export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {checkListPermission, sessionCheck} from "@/lib/services/permission.service";
import {getProjectList} from "@/lib/services/project.service";

const TABLE_NAME = "project_joho_ichiran";

/**
 * プロジェクト一覧取得API
 * ・ログインユーザーが参照可能なプロジェクトのみ取得
 */
export async function GET(request: NextRequest) {
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