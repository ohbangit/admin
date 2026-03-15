import { getErrorMessage } from '../../utils/error'
import type { InlineEditFormProps } from '../../types/streamersManage'

export function InlineEditForm({
    value,
    onChange,
    onSave,
    onCancel,
    placeholder,
    type = 'text',
    isPending,
    saveLabel,
    error,
}: InlineEditFormProps) {
    return (
        <form onSubmit={onSave} className="mt-1.5 space-y-2">
            <div className="flex items-center gap-1.5">
                <input
                    autoFocus
                    type={type}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    className="h-8 flex-1 rounded-md border border-gray-300 bg-gray-50 px-2.5 font-mono text-xs text-gray-900 outline-none transition focus:border-gray-400 focus:bg-white dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1] dark:placeholder-[#848494] dark:focus:border-[#848494] dark:focus:bg-[#2e2e38]"
                />
                <button
                    type="submit"
                    disabled={isPending || value.trim().length === 0}
                    className="h-8 rounded-md bg-gray-900 px-3 text-xs font-medium text-white transition hover:bg-gray-700 disabled:opacity-40 dark:bg-[#efeff1] dark:text-[#0e0e10] dark:hover:bg-[#adadb8]"
                >
                    {isPending ? '…' : saveLabel}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="h-8 rounded-md border border-gray-300 px-3 text-xs font-medium text-gray-500 transition hover:bg-gray-50 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:bg-[#2e2e38]"
                >
                    취소
                </button>
            </div>
            {error !== null && error !== undefined && (
                <p className="text-[11px] text-red-500 dark:text-red-400">
                    {getErrorMessage(error)}
                </p>
            )}
        </form>
    )
}
