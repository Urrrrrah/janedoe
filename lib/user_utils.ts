import {prisma} from "@/lib/prisma";
import {SysUser} from "@/types/record";

export async function getUser(username: string): Promise<SysUser | null> {
    const userDB = await prisma.sys_user.findFirst({
        where: {user_id: username, active: true},
    })
    if (userDB) {
        return {
            ...userDB,
            created: userDB.created.toISOString(),
            updated: userDB.updated.toISOString(),
        };
    } else {
        return null;
    }
}

export async function getUserName(username: string): Promise<string> {
    const user = await getUser(username);
    if (user) {
        return user.first_name + ' ' + user.last_name;
    } else {
        return '';
    }
}

export async function getUserSysId(username: string): Promise<string> {
    const user = await getUser(username);
    if (user) {
        return user.sys_id;
    } else {
        return '';
    }
}