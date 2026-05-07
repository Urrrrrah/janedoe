export const runtime = "nodejs";
import {NextResponse} from 'next/server';
import {sessionCheck} from "@/lib/services/permission.service";
import {getLoginLogs} from "@/lib/services/user.service";

const SYSTEM_ERROR = 'システムエラー';

export async function GET() {
    try {
        const loggedUser = await sessionCheck();
        if (!loggedUser.roles.includes("admin")) {
            return NextResponse.json({
                success: false,
                error: "権限ありませんでした。"
            }, {status: 403});
        }
        const results = await getLoginLogs();
        return NextResponse.json({
            success: true,
            data: {
                logs: results
            }
        }, {status: 200});

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({
            success: false,
            error: SYSTEM_ERROR
        }, {status: 500});
    }
}