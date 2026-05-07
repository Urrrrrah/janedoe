
import {redirect} from "next/navigation";
import {auth} from "@/lib/auth";
import LoginForm from "@/app/login/loginForm";

export default async function Home() {
    const session = await auth();

    if (session) {
        redirect("/pms/index");
    }
    return <LoginForm />;
}