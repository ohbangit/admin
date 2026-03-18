import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { ChevronDown, ChevronUp, ExternalLink, Image, Pencil, Plus, Trash2 } from 'lucide-react'
import { useAdminToast, useBanners, useCreateBanner, useDeleteBanner, useUpdateBanner } from '../hooks'
import type { BannerItem, CreateBannerRequest, UpdateBannerRequest } from '../types'
import { getErrorMessage } from '../utils/error'
import { cn } from '../lib/cn'
import { inputClass, panelClass, selectClass } from '../constants/styles'
import { ConfirmModal } from '../components/ConfirmModal'
import { ListEmpty, ListError, ListLoading } from '../components/ListState'

interface BannerFormValues {
    type: string
    title: string
    description: string
    imageUrl: string
    linkUrl: string
    tournamentSlug: string
    startedAt: string
    endedAt: string
    orderIndex: number
    isActive: boolean
}

interface BannerFormModalProps {
    title: string
    submitLabel: string
    initialValues: BannerFormValues
    pending: boolean
    onClose: () => void
    onSubmit: (values: BannerFormValues) => Promise<void>
}

function toDateInputValue(value: string | null): string {
    if (value === null) return ''
    return dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD') : ''
}

function toFormValues(item?: BannerItem, defaultOrderIndex?: number): BannerFormValues {
    if (item === undefined) {
        return {
            type: '',
            title: '',
            description: '',
            imageUrl: '',
            linkUrl: '',
            tournamentSlug: '',
            startedAt: '',
            endedAt: '',
            orderIndex: defaultOrderIndex ?? 0,
            isActive: true,
        }
    }

    return {
        type: item.type,
        title: item.title,
        description: item.description ?? '',
        imageUrl: item.imageUrl,
        linkUrl: item.linkUrl ?? '',
        tournamentSlug: item.tournamentSlug ?? '',
        startedAt: toDateInputValue(item.startedAt),
        endedAt: toDateInputValue(item.endedAt),
        orderIndex: item.orderIndex,
        isActive: item.isActive,
    }
}

function formatRange(startedAt: string | null, endedAt: string | null): string {
    if (startedAt === null || !dayjs(startedAt).isValid()) return '-'
    const start = dayjs(startedAt).format('MM.DD')
    if (endedAt === null || !dayjs(endedAt).isValid()) return `${start} ~`
    return `${start} ~ ${dayjs(endedAt).format('MM.DD')}`
}

function getTypeBadgeClass(type: string): string {
    if (type === 'tournament') return 'border-purple-500/40 bg-purple-500/15 text-purple-300'
    if (type === '출시') return 'border-blue-500/40 bg-blue-500/15 text-blue-300'
    if (type === '이벤트') return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
    return 'border-[#4a4a58] bg-[#2a2a34] text-[#b5b5c0]'
}

function toCreatePayload(values: BannerFormValues): CreateBannerRequest {
    const payload: CreateBannerRequest = {
        type: values.type.trim(),
        title: values.title.trim(),
        imageUrl: values.imageUrl.trim(),
        orderIndex: values.orderIndex,
        isActive: values.isActive,
    }

    const description = values.description.trim()
    const linkUrl = values.linkUrl.trim()
    const tournamentSlug = values.tournamentSlug.trim()

    if (description.length > 0) payload.description = description
    if (linkUrl.length > 0) payload.linkUrl = linkUrl
    if (tournamentSlug.length > 0) payload.tournamentSlug = tournamentSlug
    if (values.startedAt.length > 0) payload.startedAt = values.startedAt
    if (values.endedAt.length > 0) payload.endedAt = values.endedAt

    return payload
}

function toUpdatePayload(values: BannerFormValues): UpdateBannerRequest {
    return toCreatePayload(values)
}

function BannerFormModal({ title, submitLabel, initialValues, pending, onClose, onSubmit }: BannerFormModalProps) {
    const [values, setValues] = useState<BannerFormValues>(initialValues)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(): Promise<void> {
        if (values.type.trim().length === 0) {
            setError('유형은 필수입니다.')
            return
        }
        if (values.title.trim().length === 0) {
            setError('제목은 필수입니다.')
            return
        }
        if (values.imageUrl.trim().length === 0) {
            setError('이미지 URL은 필수입니다.')
            return
        }
        setError(null)
        await onSubmit(values)
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={(event) => {
                if (event.target === event.currentTarget && !pending) onClose()
            }}
        >
            <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#3a3a44] bg-[#1a1a23] shadow-xl">
                <div className="border-b border-[#3a3a44] px-6 py-4">
                    <h2 className="text-base font-bold text-[#efeff1]">{title}</h2>
                    <p className="mt-1 text-xs text-[#adadb8]">메인 배너 정보를 생성하거나 수정합니다.</p>
                </div>

                <div className="space-y-3 px-6 py-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[#adadb8]">
                            유형 <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={values.type}
                            onChange={(event) => setValues((prev) => ({ ...prev, type: event.target.value }))}
                            className={inputClass}
                            placeholder="tournament, 출시 등"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[#adadb8]">
                            제목 <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={values.title}
                            onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))}
                            className={inputClass}
                            placeholder="배너 제목"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[#adadb8]">설명</label>
                        <textarea
                            value={values.description}
                            onChange={(event) => setValues((prev) => ({ ...prev, description: event.target.value }))}
                            className={cn(inputClass, 'min-h-20 resize-y')}
                            placeholder="배너 보조 설명"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-[#adadb8]">
                            이미지 URL <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={values.imageUrl}
                            onChange={(event) => setValues((prev) => ({ ...prev, imageUrl: event.target.value }))}
                            className={inputClass}
                            placeholder="https://..."
                        />
                        {values.imageUrl.trim().length > 0 && (
                            <div className="overflow-hidden rounded-xl border border-[#3a3a44] bg-[#15151d]">
                                <img src={values.imageUrl} alt="배너 미리보기" className="h-40 w-full object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-[#adadb8]">링크 URL</label>
                            <input
                                type="text"
                                value={values.linkUrl}
                                onChange={(event) => setValues((prev) => ({ ...prev, linkUrl: event.target.value }))}
                                className={inputClass}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-[#adadb8]">토너먼트 슬러그</label>
                            <input
                                type="text"
                                value={values.tournamentSlug}
                                onChange={(event) => setValues((prev) => ({ ...prev, tournamentSlug: event.target.value }))}
                                className={inputClass}
                                placeholder="예: spring-cup-2026"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-[#adadb8]">시작일</label>
                            <input
                                type="date"
                                value={values.startedAt}
                                onChange={(event) => setValues((prev) => ({ ...prev, startedAt: event.target.value }))}
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-[#adadb8]">종료일</label>
                            <input
                                type="date"
                                value={values.endedAt}
                                onChange={(event) => setValues((prev) => ({ ...prev, endedAt: event.target.value }))}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[#adadb8]">활성</label>
                        <label className={cn(selectClass, 'flex items-center gap-2 bg-none pr-3')}>
                            <input
                                type="checkbox"
                                checked={values.isActive}
                                onChange={(event) => setValues((prev) => ({ ...prev, isActive: event.target.checked }))}
                                className="h-4 w-4 cursor-pointer rounded"
                            />
                            <span className="text-sm text-[#efeff1]">배너 노출</span>
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
            </div>
        </div>
    )
}

export default function BannerManagePage() {
    const { addToast } = useAdminToast()
    const { data: banners = [], isLoading, isError, refetch } = useBanners()
    const createMutation = useCreateBanner()
    const updateMutation = useUpdateBanner()
    const deleteMutation = useDeleteBanner()

    const [creating, setCreating] = useState(false)
    const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null)
    const [deletingBanner, setDeletingBanner] = useState<BannerItem | null>(null)
    const [activeOverrides, setActiveOverrides] = useState<Record<number, boolean>>({})
    const [pendingToggleIds, setPendingToggleIds] = useState<number[]>([])
    const [reorderingIds, setReorderingIds] = useState<number[]>([])

    const sortedBanners = useMemo(
        () => [...banners].sort((a, b) => (a.orderIndex !== b.orderIndex ? a.orderIndex - b.orderIndex : a.id - b.id)),
        [banners],
    )

    const nextOrderIndex = useMemo(
        () => (sortedBanners.length > 0 ? Math.max(...sortedBanners.map((b) => b.orderIndex)) + 1 : 0),
        [sortedBanners],
    )

    useEffect(() => {
        setActiveOverrides((prev) => {
            const next = { ...prev }
            let changed = false

            for (const banner of banners) {
                if (next[banner.id] !== undefined && next[banner.id] === banner.isActive) {
                    delete next[banner.id]
                    changed = true
                }
            }

            return changed ? next : prev
        })
    }, [banners])

    async function handleCreate(values: BannerFormValues): Promise<void> {
        try {
            await createMutation.mutateAsync(toCreatePayload(values))
            addToast({ message: '배너가 생성되었습니다.', variant: 'success' })
            setCreating(false)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleUpdate(id: number, values: BannerFormValues): Promise<void> {
        try {
            await updateMutation.mutateAsync({ id, body: toUpdatePayload(values) })
            addToast({ message: '배너가 수정되었습니다.', variant: 'success' })
            setEditingBanner(null)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleDelete(): Promise<void> {
        if (deletingBanner === null) return
        try {
            await deleteMutation.mutateAsync(deletingBanner.id)
            addToast({ message: '배너가 삭제되었습니다.', variant: 'success' })
            setDeletingBanner(null)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleToggleActive(item: BannerItem): Promise<void> {
        const currentValue = activeOverrides[item.id] ?? item.isActive
        const nextValue = !currentValue

        setActiveOverrides((prev) => ({ ...prev, [item.id]: nextValue }))
        setPendingToggleIds((prev) => [...prev, item.id])

        try {
            await updateMutation.mutateAsync({ id: item.id, body: { isActive: nextValue } })
            addToast({ message: `배너 활성 상태를 ${nextValue ? '켜짐' : '꺼짐'}으로 변경했습니다.`, variant: 'success' })
        } catch (error) {
            setActiveOverrides((prev) => ({ ...prev, [item.id]: currentValue }))
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        } finally {
            setPendingToggleIds((prev) => prev.filter((id) => id !== item.id))
        }
    }

    async function handleMoveOrder(index: number, direction: 'up' | 'down'): Promise<void> {
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= sortedBanners.length) return

        const current = sortedBanners[index]
        const target = sortedBanners[targetIndex]

        setReorderingIds((prev) => [...prev, current.id, target.id])

        try {
            await Promise.all([
                updateMutation.mutateAsync({ id: current.id, body: { orderIndex: target.orderIndex } }),
                updateMutation.mutateAsync({ id: target.id, body: { orderIndex: current.orderIndex } }),
            ])
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        } finally {
            setReorderingIds((prev) => prev.filter((id) => id !== current.id && id !== target.id))
        }
    }

    return (
        <>
            <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-[#efeff1]">배너 관리</h1>
                    <p className="mt-1 text-sm text-[#adadb8]">유저웹 메인 배너를 관리합니다</p>
                </div>
                <button
                    type="button"
                    onClick={() => setCreating(true)}
                    className="cursor-pointer flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                    <Plus className="h-4 w-4" />
                    배너 추가
                </button>
            </div>

            <div className={panelClass}>
                <div className="grid grid-cols-[70px_90px_minmax(0,2fr)_120px_minmax(0,1.4fr)_130px_88px_120px] items-center gap-3 border-b border-[#3a3a44] px-4 py-3 text-center text-xs font-semibold text-[#848494]">
                    <div>순서</div>
                    <div>이미지</div>
                    <div>제목</div>
                    <div>유형</div>
                    <div>링크</div>
                    <div>기간</div>
                    <div>활성</div>
                    <div>작업</div>
                </div>

                {isLoading && <ListLoading />}
                {isError && <ListError message="배너를 불러오는 중 오류가 발생했습니다." onRetry={() => { void refetch() }} />}
                {!isLoading && !isError && sortedBanners.length === 0 && <ListEmpty message="등록된 배너가 없습니다." />}

                {!isLoading && !isError && sortedBanners.length > 0 && (
                    <ul className="divide-y divide-[#3a3a44]">
                        {sortedBanners.map((item, index) => {
                            const isActive = activeOverrides[item.id] ?? item.isActive
                            const isTogglePending = pendingToggleIds.includes(item.id)
                            const linkText = item.linkUrl ?? item.tournamentSlug

                            return (
                                <li
                                    key={item.id}
                                    className="grid grid-cols-[70px_90px_minmax(0,2fr)_120px_minmax(0,1.4fr)_130px_88px_120px] items-center gap-3 px-4 py-3"
                                >
                                    <div className="flex items-center justify-center gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                void handleMoveOrder(index, 'up')
                                            }}
                                            disabled={index === 0 || reorderingIds.includes(item.id)}
                                            className="inline-flex cursor-pointer items-center justify-center rounded-md p-0.5 text-[#adadb8] transition hover:bg-[#26262e] disabled:cursor-not-allowed disabled:opacity-30"
                                            aria-label="위로 이동"
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                void handleMoveOrder(index, 'down')
                                            }}
                                            disabled={index === sortedBanners.length - 1 || reorderingIds.includes(item.id)}
                                            className="inline-flex cursor-pointer items-center justify-center rounded-md p-0.5 text-[#adadb8] transition hover:bg-[#26262e] disabled:cursor-not-allowed disabled:opacity-30"
                                            aria-label="아래로 이동"
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="flex justify-center">
                                        <div className="flex h-9 w-[60px] items-center justify-center overflow-hidden rounded-md border border-[#3a3a44] bg-[#26262e]">
                                            {item.imageUrl.trim().length > 0 ? (
                                                <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <Image className="h-4 w-4 text-[#848494]" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-[#efeff1]">{item.title}</p>
                                        <p className="mt-0.5 truncate text-xs text-[#848494]">{item.description ?? '-'}</p>
                                    </div>

                                    <div className="flex justify-center">
                                        <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-medium', getTypeBadgeClass(item.type))}>
                                            {item.type}
                                        </span>
                                    </div>

                                    <div className="min-w-0">
                                        {item.linkUrl !== null ? (
                                            <a
                                                href={item.linkUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex max-w-full items-center gap-1 truncate text-xs text-blue-300 transition hover:text-blue-200"
                                            >
                                                <span className="truncate">{linkText}</span>
                                                <ExternalLink className="h-3 w-3 shrink-0" />
                                            </a>
                                        ) : (
                                            <span className="block truncate text-xs text-[#adadb8]">{linkText ?? '-'}</span>
                                        )}
                                    </div>

                                    <div className="text-center text-xs text-[#adadb8]">{formatRange(item.startedAt, item.endedAt)}</div>

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
                                            <span className={cn('h-1.5 w-1.5 rounded-full', isActive ? 'bg-emerald-300' : 'bg-[#848494]')} />
                                            {isActive ? '활성' : '비활성'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setEditingBanner(item)}
                                            className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[#3a3a44] p-1.5 text-[#adadb8] transition hover:bg-[#26262e]"
                                            aria-label="배너 수정"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeletingBanner(item)}
                                            className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-red-500/35 p-1.5 text-red-300 transition hover:bg-red-500/10"
                                            aria-label="배너 삭제"
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
                <BannerFormModal
                    title="배너 생성"
                    submitLabel="저장"
                    initialValues={toFormValues(undefined, nextOrderIndex)}
                    pending={createMutation.isPending}
                    onClose={() => setCreating(false)}
                    onSubmit={handleCreate}
                />
            )}

            {editingBanner !== null && (
                <BannerFormModal
                    title="배너 수정"
                    submitLabel="저장"
                    initialValues={toFormValues(editingBanner)}
                    pending={updateMutation.isPending}
                    onClose={() => setEditingBanner(null)}
                    onSubmit={(values) => handleUpdate(editingBanner.id, values)}
                />
            )}

            {deletingBanner !== null && (
                <ConfirmModal
                    title="배너 삭제"
                    message="배너를 삭제하시겠습니까?"
                    itemName={deletingBanner.title}
                    pending={deleteMutation.isPending}
                    onClose={() => setDeletingBanner(null)}
                    onConfirm={() => {
                        void handleDelete()
                    }}
                />
            )}
        </>
    )
}
