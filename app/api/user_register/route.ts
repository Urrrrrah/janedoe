import {userSchema} from "@/lib/validator/sysuser";

export const runtime = "nodejs";
import {NextRequest, NextResponse} from 'next/server';

import {newUserSchema} from "@/lib/validator/user_register";
import {createUser, getSysUser, updateUser} from "@/services/user.service";
import {sessionCheck} from "@/services/permission.service";

const SYSTEM_ERROR = 'システムエラー';

export async function GET(req: NextRequest) {
    const {searchParams} = req.nextUrl;
    const sys_id = searchParams.get("sys_id");
    const mode = searchParams.get("mode");
    const loggedUser = await sessionCheck();

    if (mode === "create") {
        const loggedUser = await sessionCheck();
        if (loggedUser.roles.includes("admin")) {
            //新規とします
            return NextResponse.json({
                    success: true
                }, {status: 200}
            );
        }
        return NextResponse.json({
            success: false,
            error: "権限ありません。",
        }, {status: 403});

    }

    if (mode === "update") {
        if (!sys_id) {
            const user_sys_id = loggedUser.id;
            const result = await getSysUser(user_sys_id);
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
        }

        if (sys_id) {
            if (!loggedUser.roles.includes("admin")) {
                return NextResponse.json({
                    success: false,
                    error: "権限ありません。",
                }, {status: 403});
            }
            const result = await getSysUser(sys_id);
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
        }

    }
    return NextResponse.json({
        success: false,
        message: "Invalid mode"
    }, {status: 400});
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {searchParams} = req.nextUrl;
        const mode = searchParams.get("mode");
        const sys_id = searchParams.get("sys_id");

        const loggedUser = await sessionCheck();

        //管理者のみアカウント作成可能
        if (mode === "create") {
            if (loggedUser.roles.includes("admin")) {
                const parsed = newUserSchema.safeParse(body);
                if (!parsed.success) {
                    return NextResponse.json({
                        success: false,
                        error: parsed.error.flatten(),
                    }, {status: 400});
                }
                const newUser = parsed.data;
                const result = await createUser(newUser);
                if (!result.success) {
                    return NextResponse.json(
                        result,
                        {status: 400}
                    );
                }

                return NextResponse.json(
                    result,
                    {status: 201}
                );
            } else {
                return NextResponse.json({
                    success: false,
                    error: "権限ありません。",
                }, {status: 403});
            }
        }

        if (mode === "update") {
            const parsed = userSchema.safeParse(body);
            if (!parsed.success) {
                return NextResponse.json({
                    success: false,
                    error: parsed.error.flatten(),
                }, {status: 400});
            }
            const user = parsed.data;
            const user_sys_id = loggedUser.id;
            const targetId = sys_id || user_sys_id;

            const isSelf = user_sys_id === targetId;
            const isAdmin = loggedUser.roles.includes("admin");

            if (!isSelf && !isAdmin) {
                return NextResponse.json({
                    success: false,
                    error: "権限ありません。",
                }, {status: 403});
            }

            const result = await updateUser(targetId, user);
            if (!result.success) {
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

        return NextResponse.json({
            success: false,
            message: "Invalid mode"
        }, {status: 400});
    } catch (error) {
        console.error('Database error:', error);

        return NextResponse.json({
            success: false,
            message: SYSTEM_ERROR
        }, {status: 500});
    }
}