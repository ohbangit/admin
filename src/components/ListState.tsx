interface ListLoadingProps {
    className?: string
    rows?: number
}

export function ListLoading({ className = 'py-12', rows = 4 }: ListLoadingProps) {
    return (
        <div className={className}>
            <div className="space-y-4 px-4">
                {Array.from({ length: rows }, (_, index) => (
                    <div key={index} className="flex animate-pulse items-center gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-[#26262e]" />
                        <div className="min-w-0 flex-1 space-y-2">
                            <div className="h-3.5 w-3/5 rounded bg-[#26262e]" />
                            <div className="h-3 w-2/5 rounded bg-[#26262e]" />
                        </div>
                        <div className="h-4 w-16 shrink-0 rounded bg-[#26262e]" />
                    </div>
                ))}
            </div>
        </div>
    )
}

interface ListErrorProps {
    message?: string
    className?: string
    onRetry?: () => void
}

export function ListError({ message = '데이터를 불러오는 중 오류가 발생했습니다.', className = 'py-12', onRetry }: ListErrorProps) {
    return (
        <div className={`flex flex-col items-center gap-3 ${className}`}>
            <p className="text-sm text-red-400">{message}</p>
            {onRetry !== undefined && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="cursor-pointer rounded-lg border border-[#3a3a44] px-3 py-1.5 text-xs font-semibold text-[#adadb8] transition hover:bg-[#26262e]"
                >
                    다시 시도
                </button>
            )}
        </div>
    )
}

interface ListEmptyProps {
    message?: string
    className?: string
}

export function ListEmpty({ message = '등록된 항목이 없습니다.', className = 'py-12' }: ListEmptyProps) {
    return <div className={`text-center text-sm text-[#848494] ${className}`}>{message}</div>
}
