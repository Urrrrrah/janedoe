import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {sessionCheck} from "@/lib/services/permission.service";

const SYSTEM_ERROR = 'システムエラー';

export async function GET() {
    try {
        const loggedUser = await sessionCheck();
        if (!loggedUser.roles.includes("admin")) {
            return NextResponse.json({
                success: false,
                message: "権限ありませんでした。"
            }, { status: 403 });
        }
        const results = await prisma.sannsho_kengen_list.findMany();

        return NextResponse.json({
            success: true,
            data: results
        }, { status: 200 });
    } catch (error) {
        console.error('Database error:', error);

        return NextResponse.json({
            success: false,
            message: SYSTEM_ERROR
        }, { status: 500 });
    }
}