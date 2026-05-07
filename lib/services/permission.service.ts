import {prisma} from "@/lib/prisma";
import {auth} from "@/lib/auth";
import {SessionUser} from "@/types/api";

export async function checkPermission(table: string, sys_id: string, user_id: string) {
    const kengen = await prisma.sannsho_kengen_list.findFirst({
        where: {
            reference_table: table,
            reference_ticket: sys_id,
            user_id,
            active: true
        },
        select: {
            sys_id: true,
        }
    });

    return !!kengen;
}

export async function checkListPermission(table: string, user_id: string) {
    const kengen = await prisma.sannsho_kengen_list.findMany({
        where: {
            reference_table: table,
            user_id: user_id,
            active: true
        },
        select: {
            reference_ticket: true, // project sys_id
        }
    });

    return kengen.map(k => k.reference_ticket) || [];
}

export async function sessionCheck(): Promise<SessionUser> {
    const session = await auth();

    if (!session?.user) {
        throw new Error("Not logged in");
    }

    if (!session.user.user_id) {
        throw new Error("Invalid session");
    }

    return {
        id: session.user.id,
        user_id: session.user.user_id,
        roles: session.user.roles ?? [],
    };
}