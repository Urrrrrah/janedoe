import {NextRequest, NextResponse} from "next/server";
import {subprojectSchema} from "@/lib/validator/subproject";
import {checkPermission, sessionCheck} from "@/lib/services/permission.service";
import {createSubproject, deleteSubproject, getSubproject, updateSubproject} from "@/lib/services/subproject.service";

const SYSTEM_ERROR = 'システムエラー';
const JOI_TABLE = "project_joho_ichiran";

export async function GET(request: NextRequest) {
    try {
        const loggedUser = await sessionCheck();

        const {searchParams} = request.nextUrl;
        const joi_sys_id = searchParams.get("joi_sys_id") || "";
        const sys_id = searchParams.get("sys_id") || "";

        if (sys_id) {
            if (!loggedUser.roles.includes("admin")) {
                const hasPermission = await checkPermission(JOI_TABLE, joi_sys_id, loggedUser.user_id);
                if (!hasPermission) {
                    return NextResponse.json({
                        success: false,
                        error: "権限がありません"
                    }, {status: 403});
                }
            }
            const result = await getSubproject(sys_id);

            if (!result.success) {
                return NextResponse.json(
                    result,
                    {status: 404}
                )
            }

            return NextResponse.json(
                result,
                {status: 200}
            );
        } else {
            //新規の場合
            return NextResponse.json({
                success: true
            }, {status: 200});
        }

    } catch (error) {
        console.error('Database error:', error);

        return NextResponse.json({
            success: false,
            error: SYSTEM_ERROR
        }, {status: 500});//
    }
}

export async function POST(request: NextRequest) {
    try {
        const loggedUser = await sessionCheck();

        const body = await request.json();

        const {searchParams} = request.nextUrl;
        const mode = searchParams.get("mode");
        const sys_id = searchParams.get('sys_id') || '';
        const joi_ref = searchParams.get("joi_sys_id");

        if (!mode || !joi_ref) {
            return NextResponse.json({
                    success: false,
                    error: "紐づいたProjectが見つかりませんでした"
                }, {status: 400}
            );
        }

        //紐づいた参照可能ユーザーすべて取得
        if (!loggedUser.roles.includes("admin")) {
            const hasPermission = await checkPermission(JOI_TABLE, joi_ref, loggedUser.user_id);
            if (!hasPermission) {
                return NextResponse.json({
                    success: false,
                    error: "権限がありません"
                }, {status: 403});
            }
        }

        const parsed = subprojectSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({
                success: false
            }, {status: 400});
        }
        const subproject = parsed.data;

        //新規作成の場合
        if (mode === 'create') {
            const result = await createSubproject(joi_ref, subproject, loggedUser.user_id);
            if (!result.success) {
                return NextResponse.json(
                    result,
                    {status: 404}
                );
            }
            return NextResponse.json(
                result,
                {status: 200}
            );
        }

        //更新の場合
        if (mode === 'update') {
            const result = await updateSubproject(joi_ref, sys_id, subproject, loggedUser.user_id);
            if (!result.success) {
                return NextResponse.json(
                    result,
                    {status: 404}
                );
            }

            return NextResponse.json(
                result,
                {status: 200}
            );
        }

    } catch (error) {
        console.error('Database error:', error);

        return NextResponse.json({
            success: false,
            error: SYSTEM_ERROR
        }, {status: 500});
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const {searchParams} = request.nextUrl;
        const joi_ref = searchParams.get("joi_sys_id") || "";
        const sys_id = searchParams.get("sys_id") || "";

        const loggedUser = await sessionCheck();

        //紐づいた参照可能ユーザーすべて取得
        if (!loggedUser.roles.includes("admin")) {
            const hasPermission = await checkPermission(JOI_TABLE, joi_ref, loggedUser.user_id);
            if (!hasPermission) {
                return NextResponse.json({
                    success: false,
                    error: "権限がありません"
                }, {status: 403});
            }
        }

        const result = await deleteSubproject(sys_id, loggedUser.user_id);
        if (!result.success) {
            return NextResponse.json(
                result,
                {status: 404}
            );
        }
        return NextResponse.json(
            result,
            {status: 200}
        );

    } catch (error) {
        console.error('Database error:', error);

        return NextResponse.json({
            success: false,
            error: SYSTEM_ERROR
        }, {status: 500});
    }
}