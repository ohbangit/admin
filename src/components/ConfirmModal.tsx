interface ConfirmModalProps {
    title: string
    message: string
    itemName: string
    confirmLabel?: string
    pendingLabel?: string
    pending: boolean
    onClose: () => void
    onConfirm: () => void
}

export function ConfirmModal({
    title,
    message,
    itemName,
    confirmLabel = '삭제',
    pendingLabel = '삭제 중...',
    pending,
    onClose,
    onConfirm,
}: ConfirmModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={(event) => {
                if (event.target === event.currentTarget && !pending) onClose()
            }}
        >
            <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#3a3a44] bg-[#1a1a23] shadow-xl">
                <div className="px-6 py-5">
                    <h3 className="text-base font-bold text-[#efeff1]">{title}</h3>
                    <p className="mt-2 text-sm text-[#adadb8]">
                        <span className="font-semibold text-[#efeff1]">{itemName}</span> {message}
                    </p>
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
                        onClick={onConfirm}
                        disabled={pending}
                        className="cursor-pointer flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                    >
                        {pending ? pendingLabel : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
