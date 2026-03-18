import { useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { useAdminToast, useAffiliations, useCreateAffiliation, useDeleteAffiliation, useUpdateAffiliation } from '../hooks'
import type { AffiliationItem, CreateAffiliationRequest, UpdateAffiliationRequest } from '../types'
import { cn } from '../lib/cn'
import { getErrorMessage } from '../utils/error'
import { panelClass, inputClass } from '../constants/styles'
import { ConfirmModal } from '../components/ConfirmModal'
import { ListLoading, ListError, ListEmpty } from '../components/ListState'

interface AffiliationFormValues {
    name: string
    color: string
}

const COLOR_PRESETS = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E',
]

function toFormValues(item?: AffiliationItem): AffiliationFormValues {
    return {
        name: item?.name ?? '',
        color: item?.color ?? '',
    }
}

function normalizeColor(value: string): string {
    return value.trim().toUpperCase()
}

function isValidColor(value: string): boolean {
    return /^#[0-9A-F]{6}$/.test(value)
}

function buildCreatePayload(values: AffiliationFormValues): CreateAffiliationRequest {
    const color = normalizeColor(values.color)
    return {
        name: values.name.trim(),
        color: color.length > 0 ? color : null,
    }
}

function buildUpdatePayload(values: AffiliationFormValues): UpdateAffiliationRequest {
    const color = normalizeColor(values.color)
    return {
        name: values.name.trim(),
        color: color.length > 0 ? color : null,
    }
}

interface AffiliationFormModalProps {
    title: string
    submitLabel: string
    initialValues: AffiliationFormValues
    pending: boolean
    onClose: () => void
    onSubmit: (values: AffiliationFormValues) => Promise<void>
}

function AffiliationFormModal({ title, submitLabel, initialValues, pending, onClose, onSubmit }: AffiliationFormModalProps) {
    const [values, setValues] = useState<AffiliationFormValues>(initialValues)
    const [error, setError] = useState<string | null>(null)
    const colorPickerValue = values.color.length > 0 && isValidColor(normalizeColor(values.color)) ? normalizeColor(values.color) : '#6B7280'

    async function handleSubmit(): Promise<void> {
        const trimmedName = values.name.trim()
        const normalized = normalizeColor(values.color)

        if (trimmedName.length === 0) {
            setError('소속명은 필수입니다.')
            return
        }

        if (normalized.length > 0 && !isValidColor(normalized)) {
            setError('색상은 #RRGGBB 형식으로 입력해주세요.')
            return
        }

        setError(null)
        await onSubmit({
            name: trimmedName,
            color: normalized,
        })
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={(event) => {
                if (event.target === event.currentTarget && !pending) onClose()
            }}
        >
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#3a3a44] bg-[#1a1a23] shadow-xl">
                <div className="border-b border-[#3a3a44] px-6 py-4">
                    <h2 className="text-base font-bold text-[#efeff1]">{title}</h2>
                    <p className="mt-1 text-xs text-[#adadb8]">소속명과 색상을 설정할 수 있습니다.</p>
                </div>

                <div className="space-y-3 px-6 py-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[#adadb8]">
                            소속명 <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={values.name}
                            onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
                            className={inputClass}
                            placeholder="예: 팀 오로라"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-[#adadb8]">색상</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={colorPickerValue}
                                onChange={(event) => setValues((prev) => ({ ...prev, color: normalizeColor(event.target.value) }))}
                                className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-[#3a3a44] bg-[#26262e] p-1"
                            />
                            <div className="relative w-28 shrink-0">
                                <input
                                    type="text"
                                    value={values.color}
                                    onChange={(event) => setValues((prev) => ({ ...prev, color: event.target.value }))}
                                    className={cn(inputClass, 'w-full font-mono text-xs uppercase', values.color.length > 0 && 'pr-7')}
                                    placeholder="#3B82F6"
                                />
                                {values.color.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setValues((prev) => ({ ...prev, color: '' }))}
                                        disabled={pending}
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-[#848494] transition hover:text-[#efeff1] disabled:opacity-50"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {COLOR_PRESETS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setValues((prev) => ({ ...prev, color: c }))}
                                    className={cn(
                                        'h-6 w-6 cursor-pointer rounded-full border transition hover:scale-110',
                                        normalizeColor(values.color) === c
                                            ? 'border-white ring-1 ring-white/40'
                                            : 'border-white/15 hover:border-white/40',
                                    )}
                                    style={{ backgroundColor: c }}
                                    title={c}
                                />
                            ))}
                        </div>
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
                        {pending ? '저장 중...' : submitLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function AffiliationManagePage() {
    const { addToast } = useAdminToast()
    const { data: affiliations = [], isLoading, isError, refetch } = useAffiliations()
    const createMutation = useCreateAffiliation()
    const updateMutation = useUpdateAffiliation()
    const deleteMutation = useDeleteAffiliation()

    const [creating, setCreating] = useState(false)
    const [editingItem, setEditingItem] = useState<AffiliationItem | null>(null)
    const [deletingItem, setDeletingItem] = useState<AffiliationItem | null>(null)

    async function handleCreate(values: AffiliationFormValues): Promise<void> {
        try {
            await createMutation.mutateAsync(buildCreatePayload(values))
            addToast({ message: '소속이 생성되었습니다.', variant: 'success' })
            setCreating(false)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleUpdate(id: number, values: AffiliationFormValues): Promise<void> {
        try {
            await updateMutation.mutateAsync({ id, body: buildUpdatePayload(values) })
            addToast({ message: '소속이 수정되었습니다.', variant: 'success' })
            setEditingItem(null)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleDelete(): Promise<void> {
        if (deletingItem === null) return

        try {
            await deleteMutation.mutateAsync(deletingItem.id)
            addToast({ message: '소속이 삭제되었습니다.', variant: 'success' })
            setDeletingItem(null)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    const isActionPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

    return (
        <>
            <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-[#efeff1]">소속 관리</h1>
                    <p className="mt-1 text-sm text-[#adadb8]">크루, 소속사, 팀을 관리합니다</p>
                </div>
                <button
                    type="button"
                    onClick={() => setCreating(true)}
                    className="cursor-pointer flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                    <Plus className="h-4 w-4" />
                    소속 추가
                </button>
            </div>

            <div className={panelClass}>
                <div className="grid grid-cols-[96px_minmax(0,1fr)_132px] items-center gap-3 border-b border-[#3a3a44] px-4 py-3 text-center text-xs font-semibold text-[#848494]">
                    <div>색상</div>
                    <div className="text-left">소속명</div>
                    <div>작업</div>
                </div>

                {isLoading && <ListLoading />}

                {isError && <ListError message="소속 목록을 불러오는 중 오류가 발생했습니다." onRetry={() => { void refetch() }} />}

                {!isLoading && !isError && affiliations.length === 0 && <ListEmpty message="등록된 소속이 없습니다." />}

                {!isLoading && !isError && affiliations.length > 0 && (
                    <ul className="divide-y divide-[#3a3a44]">
                        {affiliations.map((item) => (
                            <li key={item.id} className="grid grid-cols-[96px_minmax(0,1fr)_132px] items-center gap-3 px-4 py-3">
                                <div className="flex justify-center">
                                    <span
                                        className={cn(
                                            'h-5 w-5 rounded-full border',
                                            item.color === null ? 'border-dashed border-[#5a5a66] bg-[#2f2f38]' : 'border-white/15',
                                        )}
                                        style={item.color === null ? undefined : { backgroundColor: item.color }}
                                    />
                                </div>

                                <div className="truncate text-sm text-[#efeff1]">{item.name}</div>

                                <div className="flex items-center justify-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setEditingItem(item)}
                                        disabled={isActionPending}
                                        className="cursor-pointer rounded-lg border border-[#3a3a44] p-1.5 text-[#adadb8] transition hover:bg-[#26262e] disabled:opacity-50"
                                        aria-label="수정"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeletingItem(item)}
                                        disabled={isActionPending}
                                        className="cursor-pointer rounded-lg border border-red-500/35 p-1.5 text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                                        aria-label="삭제"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {creating && (
                <AffiliationFormModal
                    title="소속 생성"
                    submitLabel="생성"
                    initialValues={toFormValues()}
                    pending={createMutation.isPending}
                    onClose={() => setCreating(false)}
                    onSubmit={handleCreate}
                />
            )}

            {editingItem !== null && (
                <AffiliationFormModal
                    title="소속 수정"
                    submitLabel="수정"
                    initialValues={toFormValues(editingItem)}
                    pending={updateMutation.isPending}
                    onClose={() => setEditingItem(null)}
                    onSubmit={(values) => handleUpdate(editingItem.id, values)}
                />
            )}

            {deletingItem !== null && (
                <ConfirmModal
                    title="소속 삭제"
                    message="소속을 삭제하시겠습니까?"
                    itemName={deletingItem.name}
                    pending={deleteMutation.isPending}
                    onClose={() => setDeletingItem(null)}
                    onConfirm={() => {
                        void handleDelete()
                    }}
                />
            )}
        </>
    )
}
