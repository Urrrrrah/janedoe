import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            user_id: string;
            roles: string[];
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        user_id?: string;
        roles?: string[];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        user_id?: string;
        roles?: string[];
    }
}