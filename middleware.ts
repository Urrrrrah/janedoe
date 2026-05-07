import {NextRequest, NextResponse} from "next/server";
import {getToken} from "@auth/core/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
    });
    const isLoggedIn = !!token;
    const isOnPMS = req.nextUrl.pathname.startsWith("/pms");

    if (isOnPMS && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
}

export const config = {
    matcher: [
        '/((?!api/auth|api|_next/static|_next/image|favicon.ico|pms/user_register).*)',
    ],
};