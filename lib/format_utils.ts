import bcrypt from "bcrypt";
import {randomUUID} from "node:crypto";

export async function generatePasswordHashing(password: string): Promise<string> {
    const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 10);
    if (!password) {
        throw new Error("Password is required");
    }
    return await bcrypt.hash(password, SALT_ROUNDS);
}

export function generateSysId():string {
    return randomUUID().replaceAll("-", "");
}

export function now(): string {
    return new Date().toISOString();
}

export function timeFormat(date: Date): string{
    return date.toISOString().split("T")[0];
}
