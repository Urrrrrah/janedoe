import {prisma} from "@/lib/prisma";
import {generatePasswordHashing, generateSysId, timeFormat} from "@/app/service/generate-util";
import {LoginLogs, NewUserForm, SysUser, SysUserForm} from "@/types/record";
import {SysUserInput, userSchema} from "@/lib/validator/sysuser";

export async function getAllUsers() {
    const records = await prisma.sys_user.findMany();

    const results: SysUser[] = records.map(item => ({
        sys_id: item.sys_id,
        created: timeFormat(item.created),
        updated: timeFormat(item.updated),
        created_by: item.created_by,
        updated_by: item.updated_by,
        active: item.active,
        user_id: item.user_id,
        first_name: item.first_name,
        last_name: item.last_name,
        company: item.company
    }));

    return {
        success: true,
        data: {
            sysusers: results
        }
    };
}

export async function getLoginLogs() {
    const records = await prisma.sys_login_context.findMany();
    const results: LoginLogs[] = records.map((record) => ({
        sys_id: record.sys_id,
        created: timeFormat(record.created),
        updated: timeFormat(record.created),
        created_by: record.created_by,
        updated_by: record.updated_by,
        user_id: record.user_id,
        login_time: timeFormat(record.login_time),
        status: record.status
    }));

    return {
        success: true,
        data: {
            logs: results
        }
    };
}

export async function getSysUser(sys_id: string) {
    try {
        const sys_user = await prisma.sys_user.findFirst({
            where: {
                sys_id: sys_id,
            },
        });
        if (sys_user) {
            const userFormat = {
                active: sys_user.active,
                user_id: sys_user.user_id,
                first_name: sys_user.first_name,
                last_name: sys_user.last_name,
                company: sys_user.company,
                email: sys_user.email,
            };

            const userForm: SysUserInput = userSchema.parse(userFormat);

            return {
                success: true,
                data: {
                    sysuser: userForm
                }
            };
        } else {
            return {
                success: false,
                error: "利用できるユーザー見つかりませんでした。"
            };
        }
    } catch (e) {
        console.error(e);

        throw new Error("ユーザー見つかりませんでした。")
    }
}

export async function createAdmin(newUserForm: NewUserForm) {
    try {
        const hash_password = await generatePasswordHashing(newUserForm.password);
        await prisma.$transaction(async (tx) => {
            const existCheck = await tx.sys_user.count();
            if (existCheck > 0) {
                throw new Error("ADMIN_ALREADY_EXISTS");
            }
            await tx.sys_account.create({
                data: {
                    sys_id: generateSysId(),
                    user_id: newUserForm.user_id,
                    password_hash: hash_password,
                    created_by: 'system',
                    updated_by: 'system',
                    active: true,
                },
            });

            await tx.sys_user.create({
                data: {
                    sys_id: generateSysId(),
                    user_id: newUserForm.user_id,
                    first_name: newUserForm.first_name,
                    last_name: newUserForm.last_name,
                    company: newUserForm.company,
                    email: newUserForm.email,
                    created_by: 'system',
                    updated_by: 'system',
                }
            });

            await tx.sys_user_role.create({
                data: {
                    sys_id: generateSysId(),
                    role: "admin",
                    user_id: newUserForm.user_id,
                    start_date: new Date(),
                    end_date: new Date("2099-12-31"),
                    created_by: "system",
                    updated_by: "system",
                }
            });
        });
        return {
            success: true,
            data: {
                message: "登録成功",
            }
        }
    } catch (e) {
        if (e instanceof Error && e.message === "ADMIN_ALREADY_EXISTS") {
            return {
                success: false,
                error: "管理者アカウントがすでに存在しました。",
            };
        }
        console.error(e);

        throw new Error("ユーザー登録失敗しました。");
    }
}

export async function createUser(newUserForm: NewUserForm) {
    try {
        const hash_password = await generatePasswordHashing(newUserForm.password);
        await prisma.$transaction(async (tx) => {
            await tx.sys_account.create({
                data: {
                    sys_id: generateSysId(),
                    user_id: newUserForm.user_id,
                    password_hash: hash_password,
                    created_by: 'admin',
                    updated_by: 'admin',
                    active: true,
                },
            });

            await tx.sys_user.create({
                data: {
                    sys_id: generateSysId(),
                    user_id: newUserForm.user_id,
                    first_name: newUserForm.first_name,
                    last_name: newUserForm.last_name,
                    company: newUserForm.company,
                    email: newUserForm.email,
                    created_by: 'admin',
                    updated_by: 'admin',
                }
            });

            await tx.sys_user_role.create({
                data: {
                    sys_id: generateSysId(),
                    role: "normal",
                    user_id: newUserForm.user_id,
                    start_date: new Date(),
                    end_date: new Date("2099-12-31"),
                    created_by: "system",
                    updated_by: "system",
                }
            });
        });
        return {
            success: true,
            data: {
                message: "登録成功",
            }
        }
    } catch (e) {
        console.error(e);

        throw new Error("ユーザー登録失敗しました。");
    }
}

export async function updateUser(sys_id: string, userForm: SysUserForm) {
    try {
        const password = userForm.password?.trim();

        await prisma.$transaction(async (tx) => {
            const userInfo = await tx.sys_user.update({
                where: {
                    sys_id,
                },
                data: {
                    first_name: userForm.first_name,
                    last_name: userForm.last_name,
                    company: userForm.company,
                    email: userForm.email,
                    updated_by: 'admin',
                }
            });

            if (password) {
                const hash_password = await generatePasswordHashing(password);

                await tx.sys_account.update({
                    where: {
                        user_id: userInfo.user_id,
                    },
                    data: {
                        password_hash: hash_password,
                        updated_by: 'admin',
                    },
                });
            }


        });
        return {
            success: true,
            data: {
                message: "更新成功",
            }
        }
    } catch (e) {
        console.error(e);

        throw new Error("ユーザー更新失敗しました。");
    }
}

export async function deleteUser(user_id: string) {
    try {
        await prisma.$transaction(async (tx) => {

            await tx.sys_account.update({
                where: {
                    user_id,
                },
                data: {
                    active: false,
                    updated_by: 'admin',
                },
            });

            await tx.sys_user.update({
                where: {
                    user_id,
                },
                data: {
                    active: false,
                }
            });
        });
        return {
            success: true,
            data: {
                message: "削除成功",
            }
        }
    } catch (e) {
        console.error(e);

        throw new Error("ユーザー削除失敗しました。");
    }
}