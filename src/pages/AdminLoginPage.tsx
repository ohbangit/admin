import { useEffect, useState } from 'react'
import { useAdminAuth } from '../hooks'

interface AdminLoginPageProps {
    initialError?: string
}

export default function AdminLoginPage({ initialError }: AdminLoginPageProps) {
    const { login } = useAdminAuth()
    const [key, setKey] = useState('')
    const [error, setError] = useState(initialError ?? '')

    useEffect(() => {
        if (initialError && initialError.length > 0) {
            setError(initialError)
        }
    }, [initialError])

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (key.trim().length === 0) {
            setError('API 키를 입력해주세요.')
            return
        }
        login(key.trim())
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0e0e10]">
            <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm dark:bg-[#1a1a23]">
                <div className="mb-8">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-[#efeff1]">
                        어드민 로그인
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-[#adadb8]">
                        API 키를 입력해 어드민 페이지에 접근하세요.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="api-key"
                            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-[#adadb8]"
                        >
                            API 키
                        </label>
                        <input
                            id="api-key"
                            type="password"
                            value={key}
                            onChange={(e) => {
                                setKey(e.target.value)
                                setError('')
                            }}
                            placeholder="API 키 입력"
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1] dark:placeholder-[#848494] dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                            autoComplete="current-password"
                        />
                        {error && (
                            <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 active:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                    >
                        확인
                    </button>
                </form>
            </div>
        </div>
    )
}
