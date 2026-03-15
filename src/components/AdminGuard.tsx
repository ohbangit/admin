import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAdminAuth } from '../hooks'
import { adminApiGet } from '../lib/apiClient'
import AdminLoginPage from '../pages/AdminLoginPage'

interface AdminGuardProps {
    children: ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
    const { apiKey, isAuthenticated, logout } = useAdminAuth()
    const [authError, setAuthError] = useState('')
    const { isLoading, isError } = useQuery({
        queryKey: ['admin', 'validate', apiKey],
        queryFn: () => adminApiGet<{ ok: boolean }>('/api/admin/validate'),
        enabled: isAuthenticated,
        retry: false,
        refetchOnWindowFocus: false,
    })

    useEffect(() => {
        if (!isError) return
        setAuthError('API 키가 유효하지 않습니다.')
        logout()
    }, [isError, logout])

    if (!isAuthenticated) {
        return <AdminLoginPage initialError={authError} />
    }

    if (isError) {
        return <AdminLoginPage initialError={authError} />
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500 dark:bg-[#0e0e10] dark:text-[#adadb8]">
                관리자 권한을 확인하는 중입니다.
            </div>
        )
    }

    return <>{children}</>
}
