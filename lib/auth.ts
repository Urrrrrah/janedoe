import NextAuth from "next-auth"
import {PrismaAdapter} from "@auth/prisma-adapter"
import {prisma} from "@/lib/prisma"
import {PrismaClient} from "@prisma/client";
import bcrypt from "bcrypt";
import {generateSysId, now} from "@/app/service/generate-util";
import Credentials from "next-auth/providers/credentials";

export const {handlers, auth, signIn, signOut} = NextAuth({
    adapter: PrismaAdapter(prisma as unknown as PrismaClient),
    //
    // session: {
    //     strategy: "jwt",
    // },

    providers: [
        Credentials({
            async authorize(credentials: Record<string, unknown> | undefined) {


                if (!credentials || typeof credentials.user_id !== "string" || typeof credentials.password !== "string") {
                    return null;
                }

                const userId = credentials.user_id
                const password = credentials.password

                const user = await prisma.sys_account.findUnique({
                    where: {
                        user_id: userId
                    },
                });

                const user_role = await prisma.sys_user_role.findMany({
                    where: {
                        user_id: userId
                    },
                    select: {
                        role: true
                    },
                });
                const roles = user_role.map(item => item.role);

                if (!user || !user.active) return null

                const valid = await bcrypt.compare(
                    password,
                    user.password_hash
                );

                if (!valid) {
                    await contextRegister(userId, "password_error");
                    return null;
                }

                await contextRegister(userId, "ok");
                return {
                    id: user.sys_id,
                    user_id: user.user_id,
                    roles: roles,
                }
            }
        }),
    ],

    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 8,
    },

    jwt: {
        maxAge: 60 * 60 * 8,
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.user_id = user.user_id;
                token.roles = user.roles ?? [];
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.user_id = token.user_id as string;
                session.user.roles = (token.roles as string[]) ?? [];
            }
            return session;
        }
    },
})

export async function contextRegister(user_id: string, success: string) {
    const sys_id = generateSysId();
    const created = now();
    await prisma.sys_login_context.create({
        data: {
            sys_id: sys_id,
            user_id: user_id,
            created: created,
            updated: created,
            created_by: 'system',
            updated_by: 'system',
            login_time: created,
            status: success,
        },
    });
}