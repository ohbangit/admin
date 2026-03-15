import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRegisterStreamer } from '../../hooks'
import { getErrorMessage } from '../../utils/error'
import type { RegisterModalProps } from '../../types/streamersManage'

export function RegisterModal({ onClose }: RegisterModalProps) {
    const [channelId, setChannelId] = useState('')
    const register = useRegisterStreamer()

    function handleSubmit(event: FormEvent) {
        event.preventDefault()
        if (channelId.trim().length === 0) return
        register.mutate({ channelId: channelId.trim() }, { onSuccess: onClose })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 dark:bg-black/70">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1a1a23]">
                <h2 className="mb-1 text-base font-bold text-gray-900 dark:text-[#efeff1]">스트리머 등록</h2>
                <p className="mb-4 text-sm text-gray-500 dark:text-[#adadb8]">치지직 채널 ID로 스트리머를 등록합니다.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={channelId}
                        onChange={(event) => setChannelId(event.target.value)}
                        placeholder="채널 ID"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1] dark:placeholder-[#848494] dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                    />

                    {register.error !== null && (
                        <p className="text-xs text-red-500 dark:text-red-400">{getErrorMessage(register.error)}</p>
                    )}

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:bg-[#26262e]"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={register.isPending || channelId.trim().length === 0}
                            className="flex-1 rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
                        >
                            {register.isPending ? '등록 중…' : '등록'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
