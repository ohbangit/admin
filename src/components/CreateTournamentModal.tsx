import { useState } from 'react'
import { useAdminToast, useCreateTournament } from '../hooks'
import type { CreateTournamentRequest } from '../types'
import { getErrorMessage } from '../utils'

interface CreateTournamentModalProps {
    onClose: () => void
    defaultGame?: string
}

export function CreateTournamentModal({ onClose, defaultGame }: CreateTournamentModalProps) {
    const { addToast } = useAdminToast()
    const createTournament = useCreateTournament()
    const [form, setForm] = useState<CreateTournamentRequest>({
        slug: '',
        name: '',
        game: defaultGame ?? 'overwatch',
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (form.slug.trim().length === 0 || form.name.trim().length === 0) {
            addToast({
                message: '슬러그와 이름을 입력해주세요.',
                variant: 'error',
            })
            return
        }
        try {
            await createTournament.mutateAsync(form)
            addToast({ message: '대회가 생성되었습니다.', variant: 'success' })
            onClose()
        } catch (error) {
            addToast({ message: getErrorMessage(error), variant: 'error' })
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 dark:border-[#3a3a44] dark:bg-[#1a1a23]">
                <h2 className="mb-4 text-base font-bold text-gray-900 dark:text-[#efeff1]">대회 추가</h2>
                <form
                    onSubmit={(e) => {
                        void handleSubmit(e)
                    }}
                    className="space-y-3"
                >
                    <input
                        type="text"
                        value={form.slug}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                slug: e.target.value,
                            }))
                        }
                        placeholder="슬러그 (예: runner-league-2025)"
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                    />
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                name: e.target.value,
                            }))
                        }
                        placeholder="대회명 (예: 런너 리그 2025)"
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={createTournament.isPending}
                            className="flex-1 rounded-xl bg-blue-500 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
                        >
                            {createTournament.isPending ? '생성 중...' : '생성'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-50 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:bg-[#26262e]"
                        >
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
