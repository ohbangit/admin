import type { AdminBanner } from '../../types/banner'

interface DeleteConfirmModalProps {
    banner: AdminBanner
    onConfirm: () => void
    onCancel: () => void
    isPending: boolean
}

export function DeleteConfirmModal({ banner, onConfirm, onCancel, isPending }: DeleteConfirmModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/70"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isPending) onCancel()
            }}
        >
            <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-[#1a1a23]">
                <div className="px-6 py-5">
                    <h3 className="text-base font-bold text-gray-900 dark:text-[#efeff1]">배너 삭제</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-[#adadb8]">
                        <span className="font-semibold text-gray-800 dark:text-[#efeff1]">{banner.title}</span>
                        을(를) 삭제하시겠습니까?
                    </p>
                </div>
                <div className="flex gap-2 border-t border-gray-200 px-6 py-4 dark:border-[#3a3a44]">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isPending}
                        className="cursor-pointer flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:bg-[#26262e]"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isPending}
                        className="cursor-pointer flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                    >
                        {isPending ? '삭제 중...' : '삭제'}
                    </button>
                </div>
            </div>
        </div>
    )
}
