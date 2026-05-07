import { ApiResponse } from "@/types/api";

export async function apiFetch<T>(
    url: string,
    options?: RequestInit
): Promise<ApiResponse<T> | null> {
    const res = await fetch(url, options);

    if (res.status === 401) {
        window.location.href = "/login";
        return null;
    }

    return res.json();
}