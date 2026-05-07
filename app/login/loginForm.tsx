"use client";

import {Button} from "@/components/ui/button";
import {useState, FormEvent} from "react";
import {Input} from "@/components/ui/input";
import {useRouter} from "next/navigation";
import {signIn} from "next-auth/react";

export default function LoginForm() {

    const [password, setPassword] = useState('');
    const [userId, setUserID] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                user_id: userId,
                password,
                redirect: false,
            });

            if (res?.error) {
                alert("ユーザー名またはパスワードが間違っています");
                setLoading(false);

            } else {
                router.push("/pms/index");
                router.refresh();
            }
        } catch (error) {
            alert(error);
            setLoading(false);
        }
    };

    return (
        <main className="p-10">
            <div className="flex flex-col items-center justify-center h-screen">
                <div className="w-80 space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            JANEDOE 👋
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            静かに、正確に。<br/>
                            ログインして続行してください。
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <label htmlFor="userId" className="text-sm font-medium">User ID</label>
                                <Input
                                    id="userId"
                                    type="text"
                                    placeholder="Enter your user id"
                                    required
                                    value={userId}
                                    onChange={(e) => setUserID(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="login-password" className="text-sm font-medium">Password</label>
                                <Input
                                    id="login-password"
                                    type="password"
                                    placeholder="Enter your password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "ログイン中..." : "ログイン"}
                        </Button>
                    </form>
                </div>
            </div>
        </main>
    );
}