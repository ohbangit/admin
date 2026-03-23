import { useEffect, useMemo, useState } from 'react'
import { Check, Megaphone, Pencil, Plus, Trash2, X } from 'lucide-react'
import { ListEmpty, ListError, ListLoading } from '../components/ListState'
import { ModalOverlay } from '../components/ModalOverlay'
import { ConfirmModal } from '../components/ConfirmModal'
import { inputClass, panelClass } from '../constants/styles'
import { useAdminToast, useCreateNotice, useDeleteNotice, useNotices, useUpdateNotice } from '../hooks'
import { cn } from '../lib/cn'
import type { CreateNoticeRequest, NoticeItem, UpdateNoticeRequest } from '../types'
import { getErrorMessage } from '../utils/error'

interface NoticeFormValues {
    title: string
    content: string
    orderIndex: number
    isActive: boolean
}

interface NoticeFormModalProps {
    title: string
    submitLabel: string
    initialValues: NoticeFormValues
    pending: boolean
    onClose: () => void
    onSubmit: (values: NoticeFormValues) => Promise<void>
}

function toFormValues(item?: NoticeItem, defaultOrderIndex?: number): NoticeFormValues {
    if (item === undefined) {
        return {
            title: '',
            content: '',
            orderIndex: defaultOrderIndex ?? 0,
            isActive: true,
        }
    }

    return {
        title: item.title,
        content: item.content,
        orderIndex: item.orderIndex,
        isActive: item.isActive,
    }
}

function toCreatePayload(values: NoticeFormValues): CreateNoticeRequest {
    return {
        title: values.title.trim(),
        content: values.content.trim(),
        orderIndex: values.orderIndex,
        isActive: values.isActive,
    }
}

function toUpdatePayload(values: NoticeFormValues): UpdateNoticeRequest {
    return toCreatePayload(values)
}

function truncateContent(content: string): string {
    if (content.length <= 50) return content
    return `${content.slice(0, 50)}...`
}

function NoticeFormModal({ title, submitLabel, initialValues, pending, onClose, onSubmit }: NoticeFormModalProps) {
    const [values, setValues] = useState<NoticeFormValues>(initialValues)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(): Promise<void> {
        if (values.title.trim().length === 0) {
            setError('제목은 필수입니다.')
            return
        }
        if (values.content.trim().length === 0) {
            setError('내용은 필수입니다.')
            return
        }
        setError(null)
        await onSubmit(values)
    }

    return (
        <ModalOverlay size="xl" disabled={pending} onClose={onClose}>
            <div className="border-b border-[#3a3a44] px-6 py-4">
                <h2 className="text-base font-bold text-[#efeff1]">{title}</h2>
                <p className="mt-1 text-xs text-[#adadb8]">공지 정보를 생성하거나 수정합니다.</p>
            </div>

            <div className="space-y-3 px-6 py-4">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-[#adadb8]">
                        제목 <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        value={values.title}
                        onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))}
                        className={inputClass}
                        placeholder="공지 제목"
                        autoFocus
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-[#adadb8]">
                        내용 <span className="text-red-400">*</span>
                    </label>
                    <textarea
                        value={values.content}
                        onChange={(event) => setValues((prev) => ({ ...prev, content: event.target.value }))}
                        className={cn(inputClass, 'min-h-24 resize-y')}
                        rows={4}
                        placeholder="공지 내용을 입력하세요"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-[#adadb8]">순서</label>
                    <input
                        type="number"
                        value={values.orderIndex}
                        onChange={(event) => setValues((prev) => ({ ...prev, orderIndex: Number(event.target.value) || 0 }))}
                        className={inputClass}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-[#adadb8]">활성</label>
                    <label className={cn(inputClass, 'flex items-center gap-2 bg-none pr-3')}>
                        <input
                            type="checkbox"
                            checked={values.isActive}
                            onChange={(event) => setValues((prev) => ({ ...prev, isActive: event.target.checked }))}
                            className="h-4 w-4 cursor-pointer rounded"
                        />
                        <span className="text-sm text-[#efeff1]">공지 노출</span>
                    </label>
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
        </ModalOverlay>
    )
}

export default function NoticeManagePage() {
    const { addToast } = useAdminToast()
    const { data: notices = [], isLoading, isError, refetch } = useNotices()
    const createMutation = useCreateNotice()
    const updateMutation = useUpdateNotice()
    const deleteMutation = useDeleteNotice()

    const [creating, setCreating] = useState(false)
    const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null)
    const [deletingNotice, setDeletingNotice] = useState<NoticeItem | null>(null)
    const [activeOverrides, setActiveOverrides] = useState<Record<number, boolean>>({})
    const [pendingToggleIds, setPendingToggleIds] = useState<number[]>([])

    const sortedNotices = useMemo(
        () => [...notices].sort((a, b) => (a.orderIndex !== b.orderIndex ? a.orderIndex - b.orderIndex : a.id - b.id)),
        [notices],
    )

    const nextOrderIndex = useMemo(
        () => (sortedNotices.length > 0 ? Math.max(...sortedNotices.map((notice) => notice.orderIndex)) + 1 : 0),
        [sortedNotices],
    )

    useEffect(() => {
        setActiveOverrides((prev) => {
            const next = { ...prev }
            let changed = false

            for (const notice of notices) {
                if (next[notice.id] !== undefined && next[notice.id] === notice.isActive) {
                    delete next[notice.id]
                    changed = true
                }
            }

            return changed ? next : prev
        })
    }, [notices])

    async function handleCreate(values: NoticeFormValues): Promise<void> {
        try {
            await createMutation.mutateAsync(toCreatePayload(values))
            addToast({ message: '공지가 생성되었습니다.', variant: 'success' })
            setCreating(false)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleUpdate(id: number, values: NoticeFormValues): Promise<void> {
        try {
            await updateMutation.mutateAsync({ id, body: toUpdatePayload(values) })
            addToast({ message: '공지가 수정되었습니다.', variant: 'success' })
            setEditingNotice(null)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleDelete(): Promise<void> {
        if (deletingNotice === null) return
        try {
            await deleteMutation.mutateAsync(deletingNotice.id)
            addToast({ message: '공지가 삭제되었습니다.', variant: 'success' })
            setDeletingNotice(null)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleToggleActive(item: NoticeItem): Promise<void> {
        const currentValue = activeOverrides[item.id] ?? item.isActive
        const nextValue = !currentValue

        setActiveOverrides((prev) => ({ ...prev, [item.id]: nextValue }))
        setPendingToggleIds((prev) => [...prev, item.id])

        try {
            await updateMutation.mutateAsync({ id: item.id, body: { isActive: nextValue } })
            addToast({ message: `공지 활성 상태를 ${nextValue ? '켜짐' : '꺼짐'}으로 변경했습니다.`, variant: 'success' })
        } catch (error) {
            setActiveOverrides((prev) => ({ ...prev, [item.id]: currentValue }))
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        } finally {
            setPendingToggleIds((prev) => prev.filter((id) => id !== item.id))
        }
    }

    return (
        <>
            <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                    <h1 className="flex items-center gap-2 text-xl font-bold text-[#efeff1]">
                        <Megaphone className="h-5 w-5" />
                        공지 관리
                    </h1>
                    <p className="mt-1 text-sm text-[#adadb8]">서비스 공지를 관리합니다</p>
                </div>
                <button
                    type="button"
                    onClick={() => setCreating(true)}
                    className="cursor-pointer flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                    <Plus className="h-4 w-4" />
                    공지 추가
                </button>
            </div>

            <div className={panelClass}>
                <div className="grid grid-cols-[80px_minmax(0,1.2fr)_minmax(0,2fr)_90px_110px] items-center gap-3 border-b border-[#3a3a44] px-4 py-3 text-center text-xs font-semibold text-[#848494]">
                    <div>#순서</div>
                    <div>제목</div>
                    <div>내용</div>
                    <div>상태</div>
                    <div>작업</div>
                </div>

                {isLoading && <ListLoading />}
                {isError && <ListError message="공지를 불러오는 중 오류가 발생했습니다." onRetry={() => { void refetch() }} />}
                {!isLoading && !isError && sortedNotices.length === 0 && <ListEmpty message="등록된 공지가 없습니다." />}

                {!isLoading && !isError && sortedNotices.length > 0 && (
                    <ul className="divide-y divide-[#3a3a44]">
                        {sortedNotices.map((item) => {
                            const isActive = activeOverrides[item.id] ?? item.isActive
                            const isTogglePending = pendingToggleIds.includes(item.id)

                            return (
                                <li
                                    key={item.id}
                                    className="grid grid-cols-[80px_minmax(0,1.2fr)_minmax(0,2fr)_90px_110px] items-center gap-3 px-4 py-3"
                                >
                                    <div className="text-center text-sm font-medium text-[#efeff1]">{item.orderIndex}</div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-[#efeff1]">{item.title}</p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-xs text-[#adadb8]">{truncateContent(item.content)}</p>
                                    </div>

                                    <div className="flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                void handleToggleActive(item)
                                            }}
                                            disabled={isTogglePending}
                                            className={cn(
                                                'cursor-pointer inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
                                                isActive
                                                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                                                    : 'border-[#4a4a58] bg-[#2a2a34] text-[#adadb8]',
                                            )}
                                        >
                                            {isActive ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                            {isActive ? '활성' : '비활성'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setEditingNotice(item)}
                                            className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[#3a3a44] p-1.5 text-[#adadb8] transition hover:bg-[#26262e]"
                                            aria-label="공지 수정"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeletingNotice(item)}
                                            className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-red-500/35 p-1.5 text-red-300 transition hover:bg-red-500/10"
                                            aria-label="공지 삭제"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>

            {creating && (
                <NoticeFormModal
                    title="공지 생성"
                    submitLabel="저장"
                    initialValues={toFormValues(undefined, nextOrderIndex)}
                    pending={createMutation.isPending}
                    onClose={() => setCreating(false)}
                    onSubmit={handleCreate}
                />
            )}

            {editingNotice !== null && (
                <NoticeFormModal
                    title="공지 수정"
                    submitLabel="저장"
                    initialValues={toFormValues(editingNotice)}
                    pending={updateMutation.isPending}
                    onClose={() => setEditingNotice(null)}
                    onSubmit={(values) => handleUpdate(editingNotice.id, values)}
                />
            )}

            {deletingNotice !== null && (
                <ConfirmModal
                    title="공지 삭제"
                    message="공지를 삭제하시겠습니까?"
                    itemName={deletingNotice.title}
                    pending={deleteMutation.isPending}
                    onClose={() => setDeletingNotice(null)}
                    onConfirm={() => {
                        void handleDelete()
                    }}
                />
            )}
        </>
    )
}
