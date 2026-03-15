import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAdminToast, useCreateCategory } from '../../hooks'
import type { CategoryItem, UpdateCategoryRequest } from '../../types'
import { getErrorMessage } from '../../utils/error'

interface CategoryFormFieldsProps {
    name: string
    thumbnailUrl: string
    onNameChange: (value: string) => void
    onThumbnailUrlChange: (value: string) => void
}

function CategoryFormFields({ name, thumbnailUrl, onNameChange, onThumbnailUrlChange }: CategoryFormFieldsProps) {
    return (
        <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
                <label className="text-[11px] font-medium text-gray-500 dark:text-[#adadb8]">
                    이름 <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="예: 발로란트, 리그 오브 레전드"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1] dark:placeholder-[#848494]"
                />
            </div>
            <div className="space-y-1">
                <label className="text-[11px] font-medium text-gray-500 dark:text-[#adadb8]">썸네일 URL (선택)</label>
                <input
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => onThumbnailUrlChange(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1] dark:placeholder-[#848494]"
                />
            </div>
        </div>
    )
}

interface AddCategoryFormProps {
    onSuccess: () => void
}

export function AddCategoryForm({ onSuccess }: AddCategoryFormProps) {
    const [name, setName] = useState('')
    const [thumbnailUrl, setThumbnailUrl] = useState('')
    const { addToast } = useAdminToast()
    const createMutation = useCreateCategory()

    async function handleSubmit(e: FormEvent): Promise<void> {
        e.preventDefault()
        const trimmedName = name.trim()

        if (trimmedName.length === 0) {
            addToast({ message: '카테고리 이름을 입력해주세요.', variant: 'error' })
            return
        }

        try {
            await createMutation.mutateAsync({
                name: trimmedName,
                thumbnailUrl: thumbnailUrl.trim().length > 0 ? thumbnailUrl.trim() : undefined,
            })
            addToast({ message: '카테고리가 추가되었습니다.', variant: 'success' })
            setName('')
            setThumbnailUrl('')
            onSuccess()
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    return (
        <form
            onSubmit={(e) => {
                void handleSubmit(e)
            }}
            className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-[#3a3a44]"
        >
            <p className="text-xs font-semibold text-gray-500 dark:text-[#848494]">새 카테고리 추가</p>
            <CategoryFormFields
                name={name}
                thumbnailUrl={thumbnailUrl}
                onNameChange={setName}
                onThumbnailUrlChange={setThumbnailUrl}
            />
            <button
                type="submit"
                disabled={createMutation.isPending}
                className="cursor-pointer w-full rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
            >
                {createMutation.isPending ? '추가 중...' : '카테고리 추가'}
            </button>
        </form>
    )
}

interface EditCategoryModalProps {
    category: CategoryItem
    onConfirm: (payload: UpdateCategoryRequest) => void
    onCancel: () => void
    isPending: boolean
}

export function EditCategoryModal({ category, onConfirm, onCancel, isPending }: EditCategoryModalProps) {
    const [name, setName] = useState(category.name)
    const [thumbnailUrl, setThumbnailUrl] = useState(category.thumbnailUrl ?? '')
    const { addToast } = useAdminToast()

    useEffect(() => {
        setName(category.name)
        setThumbnailUrl(category.thumbnailUrl ?? '')
    }, [category])

    function handleSubmit(e: FormEvent): void {
        e.preventDefault()
        const trimmedName = name.trim()
        if (trimmedName.length === 0) {
            addToast({ message: '카테고리 이름을 입력해주세요.', variant: 'error' })
            return
        }

        const trimmedThumbnailUrl = thumbnailUrl.trim()
        onConfirm({
            name: trimmedName,
            thumbnailUrl: trimmedThumbnailUrl.length > 0 ? trimmedThumbnailUrl : null,
        })
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/70"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isPending) onCancel()
            }}
        >
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-[#1a1a23]">
                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-5">
                        <h3 className="text-base font-bold text-gray-900 dark:text-[#efeff1]">카테고리 수정</h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-[#adadb8]">카테고리 이름과 썸네일 URL을 수정합니다.</p>
                        <div className="mt-4">
                            <CategoryFormFields
                                name={name}
                                thumbnailUrl={thumbnailUrl}
                                onNameChange={setName}
                                onThumbnailUrlChange={setThumbnailUrl}
                            />
                        </div>
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
                            type="submit"
                            disabled={isPending}
                            className="cursor-pointer flex-1 rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
                        >
                            {isPending ? '수정 중...' : '수정'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
