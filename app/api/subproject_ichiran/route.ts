export const runtime = "nodejs";
import {NextResponse, NextRequest} from 'next/server';
import {checkListPermission, sessionCheck} from "@/lib/services/permission.service";
import {getSubprojectList} from "@/lib/services/subproject.service";

const TABLE_NAME = "project_joho_ichiran";

export async function GET(request: NextRequest) {
    try {
        // 認証チェック
        const loggedUser = await sessionCheck();

        //ユーザーが参照可能なサブプロジェクトList取得
        //Adminの場合全件表示
        const permissionList = loggedUser.roles.includes("admin")
            ? null
            : await checkListPermission(TABLE_NAME, loggedUser.user_id);

        const results = await getSubprojectList(permissionList);

        return NextResponse.json({
            success: true,
            data: {
                subprojects: results
            }
        }, {status: 200});

    } catch (error) {
        console.error('Database error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        }, {status: 500});
    }
}

