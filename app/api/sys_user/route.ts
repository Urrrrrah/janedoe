// import {timeFormat} from "@/app/service/generate-util";
// import {prisma} from "@/lib/prisma";
// import {NextRequest, NextResponse} from "next/server";
// import {SysUser} from "@/types/record";
//
// import {SysUserInput, userSchema} from "@/lib/validator/sysuser";
//
// const SYSTEM_ERROR = 'システムエラー';
//
// export async function GET(request: NextRequest) {
//     try {
//         /*
//         ToDo: 権限（ユーザーロール）チェック
//         * */
//         // const session = await auth();
//         // if (!session) {
//         //     return new Response("Unauthorized", {status: 401});
//         // }
//         // if (!session.user) {
//         //     return new Response("User not found", {status: 404});
//         // }
//         // const user_id = session.user.name || "unknown user";
//
//         const {searchParams} = request.nextUrl;
//         const sys_id = searchParams.get("sys_id");
//
//         if (sys_id) {
//             // const sys_user = await prisma.sys_user.findFirst({
//             //     where: {
//             //         sys_id: sys_id,
//             //     },
//             // });
//             // if (sys_user) {
//             //     //DTO用
//             //     const userFormat: SysUser = {
//             //         sys_id: sys_user.sys_id,
//             //         created: timeFormat(sys_user.created),
//             //         updated: timeFormat(sys_user.updated),
//             //         created_by: sys_user.created_by,
//             //         updated_by: sys_user.updated_by,
//             //         active: sys_user.active,
//             //         user_id: sys_user.user_id,
//             //         first_name: sys_user.first_name,
//             //         last_name: sys_user.last_name,
//             //         company: sys_user.company,
//             //     };
//             //
//             //     const userForm: SysUserInput = userSchema.parse(userFormat);
//             //
//             //     return NextResponse.json({
//             //         success: true,
//             //         data: {
//             //             sysuser: userForm
//             //         }
//             //     }, {status: 200});
//             // } else {
//             //     return NextResponse.json({
//             //         success: false,
//             //         error: "利用できるSubproject見つかりませんでした。"
//             //     });
//             // }
//         }
//
//         //新規の場合
//         return NextResponse.json({success: true}, {status: 200});
//     } catch (error) {
//         console.error('Database error:', error);
//
//         return NextResponse.json({
//             success: false,
//             error: SYSTEM_ERROR
//         }, {status: 500});//
//     }
// }
//
// export async function POST(request: NextRequest) {
//     try {
//         // const session = await auth();
//         //
//         // if (!session) {
//         //     return Response.json(
//         //         {success: false, error: "UNAUTHORIZED"},
//         //         {status: 401}
//         //     );
//         // }
//         //
//         // if (!session.user) {
//         //     return NextResponse.json(
//         //         {success: false, error: "USER_NOT_FOUND"},
//         //         {status: 404}
//         //     );
//         // }
//         // const user_id = session.user.name || "unknown user";
//
//         const body = await request.json();
//
//         const {searchParams} = request.nextUrl;
//         const mode = searchParams.get("mode");
//         const sys_id = searchParams.get('sys_id') || '';
//
//         if (!mode) {
//             return NextResponse.json({
//                     success: false,
//                     error: "システムエラー発生"
//                 }, {status: 401}
//             );
//         }
//
//         //更新の場合
//         if (mode === 'update') {
//             await prisma.sys_user.update({
//                 where: {
//                     sys_id: sys_id,
//                 },
//                 data: {
//                     company: body.company,
//                     first_name: body.first_name,
//                     last_name: body.last_name,
//                     updated_by: "admin",
//                 },
//             });
//
//             return NextResponse.json({
//                 success: true,
//                 data: {
//                     message: "更新成功",
//                     sys_id: sys_id,
//                 }
//             });
//         }
//
//     } catch (error) {
//         console.error('Database error:', error);
//
//         return NextResponse.json({
//             success: false,
//             error: SYSTEM_ERROR
//         }, {status: 500});
//     }
// }
//
// export async function DELETE(request: NextRequest) {
//     try {
//         // const session = await auth();
//         //
//         // if (!session) {
//         //     return Response.json(
//         //         {success: false, error: "UNAUTHORIZED"},
//         //         {status: 401}
//         //     );
//         // }
//         //
//         // if (!session.user) {
//         //     return NextResponse.json(
//         //         {success: false, error: "USER_NOT_FOUND"},
//         //         {status: 404}
//         //     );
//         // }
//         // const user_id = session.user.name || "unknown user";
//
//         const body = await request.json();
//
//         await prisma.$transaction(async (tx) => {
//             const sys_user = await tx.sys_user.update({
//                 where: {
//                     sys_id: body.sys_id,
//                 },
//                 data: {
//                     active: false,
//                 }
//             });
//
//             await tx.sys_account.update({
//                 where: {
//                     user_id: sys_user.user_id,
//                 },
//                 data: {
//                     active: false,
//                 }
//             });
//         });
//         return NextResponse.json({
//             success: true,
//             data: {
//                 message: "削除成功",
//                 sys_id: body.sys_id,
//             }
//         });
//
//     } catch (error) {
//         console.error('Database error:', error);
//
//         return NextResponse.json({
//             success: false,
//             error: SYSTEM_ERROR
//         }, {status: 500});
//     }
// }