import { useAdminToast, useDeleteBroadcast } from '../hooks'
import type { Broadcast } from '../types'
import { getErrorMessage } from '../utils/error'

interface DeleteConfirmModalProps {
    broadcast: Broadcast
    onClose: () => void
    onSuccess: () => void
}

export function DeleteConfirmModal({ broadcast, onClose, onSuccess }: DeleteConfirmModalProps) {
    const { addToast } = useAdminToast()
    const deleteMutation = useDeleteBroadcast()

    async function handleDelete(): Promise<void> {
        try {
            await deleteMutation.mutateAsync(broadcast.id)
            addToast({ message: '방송이 삭제되었습니다.', variant: 'success' })
            onSuccess()
            onClose()
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/70">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1a1a23]">
                <p className="text-sm text-gray-600 dark:text-[#adadb8]">
                    <span className="font-semibold text-gray-900 dark:text-[#efeff1]">{broadcast.title}</span> 방송을 삭제합니다.
                </p>
                <div className="mt-4 flex gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer flex-1 rounded-xl border border-gray-300 py-2 text-sm dark:border-[#3a3a44]"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            void handleDelete()
                        }}
                        className="cursor-pointer flex-1 rounded-xl bg-red-500 py-2 text-sm font-semibold text-white"
                    >
                        삭제
                    </button>
                </div>
            </div>
        </div>
    )
}
