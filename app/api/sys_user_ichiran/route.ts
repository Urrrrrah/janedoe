export const runtime = "nodejs";
import {NextResponse} from 'next/server';
import {getAllUsers} from "@/lib/services/user.service";
import {sessionCheck} from "@/lib/services/permission.service";

const SYSTEM_ERROR = 'システムエラー';

export async function GET() {
    try {
        // 認証チェック
        const loggedUser = await sessionCheck();

        //Adminの場合のみ内容表示
        if (!loggedUser.roles.includes("admin")) {
            return NextResponse.json({
                success: false,
                error: "権限ありません。",
            }, {status: 403});
        }

        const result = await getAllUsers();

        return NextResponse.json(
            result,
            {status: 200});

    } catch (error) {
        console.error('Database error:', error);

        return NextResponse.json({
            success: false,
            message: SYSTEM_ERROR
        }, {status: 500});//
    }
}

