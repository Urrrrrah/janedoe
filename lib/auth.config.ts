// import Credentials from "next-auth/providers/credentials"
// import {NextAuthConfig} from "next-auth";
//
// export const authConfig = {
//     providers: [
//         Credentials({
//             name: "credentials",
//             credentials: {
//                 user_id: {},
//                 password: {},
//             },
//             async authorize(credentials) {
//                 return null
//             },
//         }),
//     ],
//
//     session: {
//         strategy: "jwt",
//         maxAge: 60 * 60 * 8,
//     },
//
//     jwt: {
//         maxAge: 60 * 60 * 8,
//     },
//
//     callbacks: {
//         authorized({ auth, request: { nextUrl } }) {
//             const isLoggedIn = !!auth?.user;
//             const isOnPMS = nextUrl.pathname.startsWith("/pms");
//             if (nextUrl.pathname.startsWith("/api/auth")) {
//                 return true;
//             }
//             if (isOnPMS) {
//                 if (isLoggedIn) return true;
//                 return Response.redirect(new URL('/login', nextUrl));
//             }
//             return true;
//         },
//
//         async jwt({ token, user }) {
//
//             console.log("JWT user:", user);
//             console.log("JWT token before:", token);
//             if (user) {
//                 token.id = user.id;
//                 token.user_id = user.user_id;
//                 token.roles = user.roles ?? [];
//             }
//             console.log("JWT token after:", token);
//
//             return token;
//         },
//
//         async session({ session, token }) {
//             if (session.user) {
//                 session.user.id = token.id as string;
//                 session.user.user_id = token.user_id as string;
//                 session.user.roles = (token.roles as string[]) ?? [];
//             }
//             return session;
//         }
//     },
// } satisfies NextAuthConfig;