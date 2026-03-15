import { ApiError } from '../lib/apiClient'

export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) return error.message
    if (error instanceof Error) return error.message
    return '오류가 발생했습니다.'
}
