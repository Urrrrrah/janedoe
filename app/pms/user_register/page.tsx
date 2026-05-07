"use client";

import {useSearchParams} from "next/dist/client/components/navigation";
import CreateForm from "@/app/pms/user_register/createUser";
import UpdateForm from "@/app/pms/user_register/updateUser";

export default function UsersRegisterPage() {

    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');

    return mode === "create" ? (
        <CreateForm />
    ) : (
        <UpdateForm />
    );
}


