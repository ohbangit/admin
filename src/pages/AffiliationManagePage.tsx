import { useState } from 'react'
import { useAdminToast, useAffiliations, useCreateAffiliation, useUpdateAffiliation, useDeleteAffiliation } from '../hooks'
import type { AffiliationItem } from '../types'
import { getAffiliationColor } from '../types'
import { AFFILIATION_COLOR_PALETTE } from '../types/affiliation'
import { getErrorMessage } from '../utils/error'

// ─── 색상 프리셋 팔레트 ────────────────────────────────────────────────────────

interface ColorPresetProps {
    selectedColor: string | null
    onChange: (color: string | null) => void
    previewName?: string
}

function ColorPreset({ selectedColor, onChange, previewName }: ColorPresetProps) {
    const effectiveColor = selectedColor != null ? selectedColor : AFFILIATION_COLOR_PALETTE[0]

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-gray-500 dark:text-[#adadb8]">색상</label>
                {previewName != null && previewName.trim().length > 0 && (
                    <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                            backgroundColor: `${effectiveColor}20`,
                            color: effectiveColor,
                            outline: `1px solid ${effectiveColor}40`,
                        }}
                    >
                        {previewName}
                    </span>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {/* 색상 없음 (자동) */}
                <button
                    type="button"
                    title="자동 (ID 기반)"
                    onClick={() => onChange(null)}
                    className="cursor-pointer relative h-6 w-6 rounded-full border-2 border-dashed border-gray-300 bg-gray-100 transition hover:border-gray-400 dark:border-[#3a3a44] dark:bg-[#26262e]"
                >
                    {selectedColor === null && (
                        <span className="absolute inset-0 flex items-center justify-center">
                            <svg className="h-3 w-3 text-gray-500" viewBox="0 0 12 12" fill="none">
                                <path
                                    d="M2 6h8M6 2l4 4-4 4"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                    )}
                </button>
                {/* 팔레트 */}
                {AFFILIATION_COLOR_PALETTE.map((color) => (
                    <button
                        key={color}
                        type="button"
                        title={color}
                        onClick={() => onChange(color)}
                        className="cursor-pointer relative h-6 w-6 rounded-full transition hover:scale-110 hover:shadow-md"
                        style={{ backgroundColor: color }}
                    >
                        {selectedColor === color && (
                            <span className="absolute inset-0 flex items-center justify-center">
                                <svg className="h-3.5 w-3.5 text-white drop-shadow" viewBox="0 0 12 12" fill="none">
                                    <path
                                        d="M2 6l3 3 5-5"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}

// ─── AffiliationTag ────────────────────────────────────────────────────────────

interface AffiliationTagProps {
    affiliation: AffiliationItem
}

function AffiliationTag({ affiliation }: AffiliationTagProps) {
    const color = getAffiliationColor(affiliation)
    return (
        <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
                backgroundColor: `${color}20`,
                color,
                outline: `1px solid ${color}40`,
            }}
        >
            {affiliation.name}
        </span>
    )
}

// ─── DeleteConfirmModal ────────────────────────────────────────────────────────

interface DeleteConfirmModalProps {
    affiliation: AffiliationItem
    onConfirm: () => void
    onCancel: () => void
    isPending: boolean
}

function DeleteConfirmModal({ affiliation, onConfirm, onCancel, isPending }: DeleteConfirmModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/70"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isPending) onCancel()
            }}
        >
            <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-[#1a1a23]">
                <div className="px-6 py-5">
                    <h3 className="text-base font-bold text-gray-900 dark:text-[#efeff1]">소속 삭제</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-[#adadb8]">
                        <span className="font-semibold text-gray-800 dark:text-[#efeff1]">{affiliation.name}</span>
                        을(를) 삭제하시겠습니까?
                        <br />
                        소속이 연결된 스트리머에서 자동으로 제거됩니다.
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

// ─── EditModal ─────────────────────────────────────────────────────────────────

interface EditModalProps {
    affiliation: AffiliationItem
    onConfirm: (name: string, color: string | null) => void
    onCancel: () => void
    isPending: boolean
}

function EditModal({ affiliation, onConfirm, onCancel, isPending }: EditModalProps) {
    const [name, setName] = useState(affiliation.name)
    const [color, setColor] = useState<string | null>(affiliation.color ?? null)
    const { addToast } = useAdminToast()

    function handleSubmit(e: React.FormEvent): void {
        e.preventDefault()
        const trimmed = name.trim()
        if (trimmed.length === 0) {
            addToast({ message: '소속 이름을 입력해주세요.', variant: 'error' })
            return
        }
        onConfirm(trimmed, color)
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
                    <div className="space-y-4 px-6 py-5">
                        <h3 className="text-base font-bold text-gray-900 dark:text-[#efeff1]">소속 수정</h3>
                        <div>
                            <label className="text-[11px] font-medium text-gray-500 dark:text-[#adadb8]">
                                이름 <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                                placeholder="예: 침착맨크루, IST엔터테인먼트"
                                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1] dark:placeholder-[#848494]"
                            />
                        </div>
                        <ColorPreset
                            selectedColor={color}
                            onChange={setColor}
                            previewName={name.trim().length > 0 ? name.trim() : affiliation.name}
                        />
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

// ─── AddAffiliationForm ────────────────────────────────────────────────────────

interface AddAffiliationFormProps {
    onSuccess: () => void
}

function AddAffiliationForm({ onSuccess }: AddAffiliationFormProps) {
    const [name, setName] = useState('')
    const [color, setColor] = useState<string | null>(null)
    const { addToast } = useAdminToast()
    const createMutation = useCreateAffiliation()

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault()
        const trimmed = name.trim()
        if (trimmed.length === 0) {
            addToast({ message: '소속 이름을 입력해주세요.', variant: 'error' })
            return
        }
        try {
            await createMutation.mutateAsync({ name: trimmed, color })
            addToast({ message: '소속이 추가되었습니다.', variant: 'success' })
            setName('')
            setColor(null)
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
            <p className="text-xs font-semibold text-gray-500 dark:text-[#848494]">새 소속 추가</p>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 침착맨크루, IST엔터테인먼트"
                    className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1] dark:placeholder-[#848494]"
                />
                <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="cursor-pointer rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
                >
                    {createMutation.isPending ? '추가 중...' : '추가'}
                </button>
            </div>
            <ColorPreset selectedColor={color} onChange={setColor} previewName={name.trim().length > 0 ? name.trim() : undefined} />
        </form>
    )
}

// ─── AffiliationManagePage ─────────────────────────────────────────────────────

export default function AffiliationManagePage() {
    const { data, isLoading, isError } = useAffiliations()
    const deleteMutation = useDeleteAffiliation()
    const updateMutation = useUpdateAffiliation()
    const { addToast } = useAdminToast()
    const [deletingAffiliation, setDeletingAffiliation] = useState<AffiliationItem | null>(null)
    const [editingAffiliation, setEditingAffiliation] = useState<AffiliationItem | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const affiliations = data?.affiliations ?? []
    const filteredAffiliations =
        searchQuery.trim().length > 0
            ? affiliations.filter((a) => a.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
            : affiliations

    async function handleDelete(): Promise<void> {
        if (deletingAffiliation === null) return
        try {
            await deleteMutation.mutateAsync(deletingAffiliation.id)
            addToast({
                message: `'${deletingAffiliation.name}' 소속이 삭제되었습니다.`,
                variant: 'success',
            })
            setDeletingAffiliation(null)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleUpdate(name: string, color: string | null): Promise<void> {
        if (editingAffiliation === null) return
        try {
            await updateMutation.mutateAsync({
                id: editingAffiliation.id,
                body: { name, color },
            })
            addToast({
                message: `'${name}' 소속이 수정되었습니다.`,
                variant: 'success',
            })
            setEditingAffiliation(null)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    return (
        <>
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900 dark:text-[#efeff1]">소속 관리</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-[#adadb8]">스트리머에 연결할 소속(크루, 소속사, 팀 등)을 관리합니다.</p>
            </div>

            <div className="space-y-4">
                <AddAffiliationForm onSuccess={() => setSearchQuery('')} />

                <div className="rounded-xl border border-gray-200 dark:border-[#3a3a44]">
                    <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-[#3a3a44]">
                        <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-gray-500 dark:text-[#848494]">소속 목록</p>
                            {!isLoading && (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-[#26262e] dark:text-[#848494]">
                                    {affiliations.length}개
                                </span>
                            )}
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="검색"
                            className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1] dark:placeholder-[#848494]"
                        />
                    </div>

                    {isLoading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        </div>
                    )}

                    {isError && <div className="py-12 text-center text-sm text-red-500">소속 목록을 불러오는 중 오류가 발생했습니다.</div>}

                    {!isLoading && !isError && filteredAffiliations.length === 0 && (
                        <div className="py-12 text-center text-sm text-gray-400 dark:text-[#848494]">
                            {searchQuery.trim().length > 0 ? '검색 결과가 없습니다.' : '등록된 소속이 없습니다.'}
                        </div>
                    )}

                    {!isLoading && !isError && filteredAffiliations.length > 0 && (
                        <ul className="divide-y divide-gray-100 dark:divide-[#3a3a44]">
                            {filteredAffiliations.map((affiliation) => (
                                <li key={affiliation.id} className="flex items-center gap-3 px-4 py-3">
                                    <div className="flex-1">
                                        <AffiliationTag affiliation={affiliation} />
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setEditingAffiliation(affiliation)}
                                            className="cursor-pointer rounded-lg border border-blue-100 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50 dark:border-blue-900/30 dark:hover:bg-blue-900/10"
                                        >
                                            수정
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeletingAffiliation(affiliation)}
                                            className="cursor-pointer rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {deletingAffiliation !== null && (
                <DeleteConfirmModal
                    affiliation={deletingAffiliation}
                    onConfirm={() => {
                        void handleDelete()
                    }}
                    onCancel={() => setDeletingAffiliation(null)}
                    isPending={deleteMutation.isPending}
                />
            )}

            {editingAffiliation !== null && (
                <EditModal
                    affiliation={editingAffiliation}
                    onConfirm={(name, color) => {
                        void handleUpdate(name, color)
                    }}
                    onCancel={() => setEditingAffiliation(null)}
                    isPending={updateMutation.isPending}
                />
            )}
        </>
    )
}
