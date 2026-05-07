export const runtime = "nodejs";
import {NextResponse, NextRequest} from 'next/server';
import {checkPermission, sessionCheck} from "@/lib/services/permission.service";
import {projectSchema} from "@/lib/validator/project";
import {createProject, deleteProject, getProjects, updateProject} from "@/lib/services/project.service";

const SYSTEM_ERROR = 'システムエラー';
const TABLE_NAME = "project_joho_ichiran";

export async function GET(request: NextRequest) {
    try {
        const loggedUser = await sessionCheck();

        const {searchParams} = request.nextUrl;
        const mode = searchParams.get("mode");
        const sys_id = searchParams.get("sys_id");

        if (mode === 'update') {
            if (!sys_id) {
                return NextResponse.json({
                    success: false,
                    error: "Projectが見つかりませんでした。"
                }, {status: 404});
            }

            if (!loggedUser.roles.includes("admin")) {
                const hasPermission = await checkPermission(TABLE_NAME, sys_id, loggedUser.user_id);
                if (!hasPermission) {
                    return NextResponse.json({
                        success: false,
                        error: "権限がありません"
                    }, {status: 403});
                }
            }

            const result = await getProjects(sys_id);

            if (!result.success) {
                console.error(result.error);
                return NextResponse.json(
                    result,
                    {status: 400}
                );
            }

            return NextResponse.json(
                result,
                {status: 200}
            );
        }
        //新規の場合
        return NextResponse.json({
            success: true
        }, {status: 200});
    } catch (error) {
        console.error('Database error:', error);

        return NextResponse.json({
            success: false,
            error: SYSTEM_ERROR
        }, {status: 500});
    }
}


export async function POST(req: NextRequest) {
    try {
        const loggedUser = await sessionCheck();

        const body = await req.json();

        const {searchParams} = req.nextUrl;
        const mode = searchParams.get("mode");
        const sys_id = searchParams.get("sys_id") || "";

        const parsed = projectSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({
                success: false
            }, {status: 400});
        }
        const projectData = parsed.data;

        if (mode === "create") {
            const create = await createProject(projectData, loggedUser.user_id);
            return NextResponse.json({
                    success: true,
                    data: {
                        message: "登録成功",
                        sys_id: create
                    }
                }
            );
        }

        if (mode === "update") {
            if (!loggedUser.roles.includes("admin")) {
                const hasPermission = await checkPermission(TABLE_NAME, sys_id, loggedUser.user_id);
                if (!hasPermission) {
                    return NextResponse.json({
                        success: false,
                        error: "権限がありません"
                    }, {status: 403});
                }
            }

            await updateProject(sys_id, projectData, loggedUser.user_id);
            return NextResponse.json({
                success: true,
                data: {
                    message: "更新成功",
                    sys_id: body.sys_id,
                }
            });
        }
    } catch (error) {
        console.error('Database error:', error);

        return NextResponse.json({
            success: false,
            error: SYSTEM_ERROR
        }, {status: 500});
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const loggedUser = await sessionCheck();

        const body = await req.json();

        if (!loggedUser.roles.includes("admin")) {
            const hasPermission = await checkPermission(TABLE_NAME, body.sys_id, loggedUser.user_id);
            if (!hasPermission) {
                return NextResponse.json({
                    success: false,
                    error: "権限がありません"
                }, {status: 403});
            }
        }

        await deleteProject(body.sys_id, loggedUser.user_id);
        return NextResponse.json({
            success: true,
            data: {
                message: "削除成功",
                sys_id: body.sys_id,
            }
        });

    } catch (error) {
        console.error('Database error:', error);

        return NextResponse.json({
            success: false,
            error: SYSTEM_ERROR
        }, {status: 500});
    }
}

