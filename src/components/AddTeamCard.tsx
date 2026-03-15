import { useState } from 'react'
import { useAdminToast, useCreateTournamentTeam } from '../hooks'
import { getErrorMessage } from '../utils'

interface AddTeamCardProps {
    tournamentId: number
}

export function AddTeamCard({ tournamentId }: AddTeamCardProps) {
    const { addToast } = useAdminToast()
    const createTeam = useCreateTournamentTeam(tournamentId)
    const [isOpen, setIsOpen] = useState(false)
    const [newName, setNewName] = useState('')

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (newName.trim().length === 0) {
            addToast({ message: '팀 이름을 입력해주세요.', variant: 'error' })
            return
        }
        try {
            await createTeam.mutateAsync({ name: newName.trim() })
            addToast({ message: '팀이 생성되었습니다.', variant: 'success' })
            setNewName('')
            setIsOpen(false)
        } catch (error) {
            addToast({ message: getErrorMessage(error), variant: 'error' })
        }
    }

    if (isOpen) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-[#3a3a44] dark:bg-[#1a1a23]">
                <form
                    onSubmit={(e) => {
                        void handleCreate(e)
                    }}
                    className="space-y-3"
                >
                    <p className="text-sm font-semibold text-gray-700 dark:text-[#adadb8]">
                        새 팀 추가
                    </p>
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="팀 이름"
                        autoFocus
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={createTeam.isPending}
                            className="flex-1 rounded-xl bg-emerald-500 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                        >
                            {createTeam.isPending ? '생성 중...' : '생성'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false)
                                setNewName('')
                            }}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-50 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:bg-[#26262e]"
                        >
                            취소
                        </button>
                    </div>
                </form>
            </div>
        )
    }

    return (
        <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex min-h-[280px] w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-transparent transition-colors hover:border-blue-300 hover:bg-blue-50/30 dark:border-[#3a3a44] dark:hover:border-blue-700/60 dark:hover:bg-blue-900/10"
        >
            <div className="flex flex-col items-center gap-2 text-gray-300 transition-colors group-hover:text-blue-400 dark:text-[#3a3a44] dark:group-hover:text-blue-500">
                <svg
                    className="h-10 w-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                    />
                </svg>
                <span className="text-sm font-medium">팀 추가</span>
            </div>
        </button>
    )
}
