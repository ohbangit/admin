interface ListLoadingProps {
    className?: string
}

export function ListLoading({ className = 'py-12' }: ListLoadingProps) {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
    )
}

interface ListErrorProps {
    message?: string
    className?: string
}

export function ListError({ message = '데이터를 불러오는 중 오류가 발생했습니다.', className = 'py-12' }: ListErrorProps) {
    return <div className={`text-center text-sm text-red-400 ${className}`}>{message}</div>
}

interface ListEmptyProps {
    message?: string
    className?: string
}

export function ListEmpty({ message = '등록된 항목이 없습니다.', className = 'py-12' }: ListEmptyProps) {
    return <div className={`text-center text-sm text-[#848494] ${className}`}>{message}</div>
}
