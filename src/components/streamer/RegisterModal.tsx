import { useState } from 'react'
import { inputClass } from '../../constants/styles'
import { ModalOverlay } from '../ModalOverlay'
import { normalizeInput } from '../../utils/format'

interface RegisterModalProps {
    pending: boolean
    onClose: () => void
    onSubmit: (channelId: string) => Promise<void>
}

export function RegisterModal({ pending, onClose, onSubmit }: RegisterModalProps) {
    const [channelId, setChannelId] = useState('')
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(): Promise<void> {
        const value = normalizeInput(channelId)
        if (value.length === 0) {
            setError('채널 ID를 입력해주세요.')
            return
        }

        setError(null)
        await onSubmit(value)
    }

    return (
        <ModalOverlay size="md" disabled={pending} onClose={onClose}>
                <div className="border-b border-[#3a3a44] px-6 py-4">
                    <h2 className="text-base font-bold text-[#efeff1]">스트리머 등록</h2>
                    <p className="mt-1 text-xs text-[#adadb8]">치지직 채널 ID를 입력해 등록합니다.</p>
                </div>

                <div className="space-y-3 px-6 py-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[#adadb8]">
                            채널 ID <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={channelId}
                            onChange={(event) => setChannelId(event.target.value)}
                            className={inputClass}
                            placeholder="예: 1f2e3d4c5b"
                            autoFocus
                        />
                    </div>
                    {error !== null && <p className="text-xs text-red-400">{error}</p>}
                </div>

                <div className="flex gap-2 border-t border-[#3a3a44] px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={pending}
                        className="cursor-pointer flex-1 rounded-xl border border-[#3a3a44] py-2.5 text-sm font-medium text-[#adadb8] transition hover:bg-[#26262e] disabled:opacity-50"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            void handleSubmit()
                        }}
                        disabled={pending}
                        className="cursor-pointer flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                    >
                        {pending ? '등록 중...' : '등록'}
                    </button>
                </div>
        </ModalOverlay>
    )
}
