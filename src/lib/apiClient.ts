const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

const ADMIN_API_KEY_STORAGE_KEY = 'ohbangit-admin-key'
const ADMIN_API_KEY_EVENT = 'ohbangit-admin-key-change'

export function getAdminApiKey(): string {
    return sessionStorage.getItem(ADMIN_API_KEY_STORAGE_KEY) ?? ''
}

export function setAdminApiKey(key: string): void {
    sessionStorage.setItem(ADMIN_API_KEY_STORAGE_KEY, key)
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(ADMIN_API_KEY_EVENT))
    }
}

export function clearAdminApiKey(): void {
    sessionStorage.removeItem(ADMIN_API_KEY_STORAGE_KEY)
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(ADMIN_API_KEY_EVENT))
    }
}

export function getAdminApiKeyEventName(): string {
    return ADMIN_API_KEY_EVENT
}

function buildAdminHeaders(): Record<string, string> {
    const key = getAdminApiKey()
    if (key.length === 0) return {}
    return { 'x-api-key': key }
}

interface ApiErrorResponse {
    error: {
        code: string
        message: string
        details?: { field: string; reason: string }[]
    }
}

export class ApiError extends Error {
    readonly code: string
    readonly status: number
    readonly details?: { field: string; reason: string }[]

    constructor({ code, message, status, details }: { code: string; message: string; status: number; details?: { field: string; reason: string }[] }) {
        super(message)
        this.name = 'ApiError'
        this.code = code
        this.status = status
        this.details = details
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const body = await response.json().catch(() => null)
        const errorBody = body as ApiErrorResponse | null
        throw new ApiError({
            code: errorBody?.error?.code ?? 'UNKNOWN_ERROR',
            message: errorBody?.error?.message ?? `HTTP ${response.status} 오류가 발생했습니다`,
            status: response.status,
            details: errorBody?.error?.details,
        })
    }
    if (response.status === 204) {
        return null as T
    }
    const rawBody = await response.text()
    if (rawBody.trim().length === 0) {
        return null as T
    }
    return JSON.parse(rawBody) as T
}

export async function adminApiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${BASE_URL}${path}`, window.location.origin)
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.set(key, value)
        })
    }
    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...buildAdminHeaders() },
    })
    return handleResponse<T>(response)
}

export async function adminApiPost<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...buildAdminHeaders() },
        body: JSON.stringify(body),
    })
    return handleResponse<T>(response)
}

export async function adminApiPatch<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...buildAdminHeaders() },
        body: JSON.stringify(body),
    })
    return handleResponse<T>(response)
}

export async function adminApiPut<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...buildAdminHeaders() },
        body: JSON.stringify(body),
    })
    return handleResponse<T>(response)
}

export async function adminApiDelete(path: string): Promise<void> {
    const response = await fetch(`${BASE_URL}${path}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...buildAdminHeaders() },
    })
    if (!response.ok && response.status !== 204) {
        await handleResponse<never>(response)
    }
}
