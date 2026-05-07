import {userSchema} from "@/lib/validator/sysuser";

export const runtime = "nodejs";
import {NextRequest, NextResponse} from 'next/server';

import {newUserSchema} from "@/lib/validator/user_register";
import {createAdmin, createUser, getSysUser, updateUser} from "@/lib/services/user.service";
import {auth} from "@/lib/auth";

const SYSTEM_ERROR = 'システムエラー';

export async function GET(req: NextRequest) {
    const {searchParams} = req.nextUrl;
    const sys_id = searchParams.get("sys_id");
    const self = searchParams.get("self") || "false";

    const session = await auth();
    if (!session) {
        return new NextResponse("Unauthorized", {status: 401});
    }
    if (!session.user) {
        return new NextResponse("User not found", {status: 404});
    }
    console.log(session.user);

    if (!sys_id) {
        if (self === "true") {
            const user_sys_id = session.user.id;
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
            )
        } else {
            return NextResponse.json({
                success: false,
                errors: "権限ありません。",
            }, {status: 403});
        }

    }

    if (sys_id) {
        if (!session.user.roles.includes("admin")) {
            return NextResponse.json({
                success: false,
                errors: "権限ありません。",
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
        )
    }
    //新規とします
    return NextResponse.json({
        success: true
    }, {status: 200});

}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {searchParams} = req.nextUrl;
        const mode = searchParams.get("mode");
        const sys_id = searchParams.get("sys_id");
        const admin = searchParams.get("admin");

        const session = await auth();

        if (mode === "create") {
            if (admin && admin === "true") {
                const parsed = newUserSchema.safeParse(body);
                if (!parsed.success) {
                    return NextResponse.json({
                        success: false,
                        errors: parsed.error.flatten(),
                    }, {status: 400});
                }
                const newAdmin = parsed.data;

                const result = await createAdmin(newAdmin);
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
                if (!session) {
                    return new NextResponse("Unauthorized", {status: 401});
                }
                if (!session.user) {
                    return new NextResponse("User not found", {status: 404});
                }

                if (session.user.roles.includes("admin")) {
                    const parsed = newUserSchema.safeParse(body);
                    if (!parsed.success) {
                        return NextResponse.json({
                            success: false,
                            errors: parsed.error.flatten(),
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
                        errors: "権限ありません。",
                    }, {status: 403});
                }

            }
        }

        //管理者のみアカウント作成可能
        if (mode === "update") {
            if (!session) {
                return new NextResponse("Unauthorized", {status: 401});
            }
            if (!session.user) {
                return new NextResponse("User not found", {status: 404});
            }
            const parsed = userSchema.safeParse(body);
            if (!parsed.success) {
                return NextResponse.json({
                    success: false,
                    errors: parsed.error.flatten(),
                }, {status: 400});
            }
            const user = parsed.data;
            const user_sys_id = session.user.id;
            const targetId = sys_id ?? user_sys_id;

            const isSelf = user_sys_id === targetId;
            const isAdmin = session.user.roles.includes("admin");
            if (!isSelf && !isAdmin) {
                return NextResponse.json({
                    success: false,
                    errors: "権限ありません。",
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