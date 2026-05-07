import {
    Field,
    FieldDescription,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {useState} from "react";

export function RegisterInputField() {
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        const res = await fetch("/api/users", {
            method: "POST",
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        alert('登録情報提出完了')
    }
    return (
        <Field className="relative w-full max-w-sm align-middle">
            <FieldLabel htmlFor="input-field-username">Username</FieldLabel>
            <Input
                id="input-field-username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <FieldDescription>
                ユーザー名を入力してください
            </FieldDescription>

            <FieldLabel htmlFor="login-password">Password</FieldLabel>
            <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <FieldDescription>
                パスワードを入力してください
            </FieldDescription>
            <Button type="submit">提出</Button>
        </Field>
    )
}
