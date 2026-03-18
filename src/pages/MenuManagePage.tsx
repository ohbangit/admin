import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { useAdminToast, useAdminMenus, useCreateMenu, useDeleteMenu, useReorderMenus, useUpdateMenu } from '../hooks'
import type { CreateMenuRequest, MenuRow, ReorderMenuItem, UpdateMenuRequest } from '../types'
import { getErrorMessage } from '../utils/error'
import { cn } from '../lib/cn'
import { panelClass, inputClass, selectClass } from '../constants/styles'
import { ConfirmModal } from '../components/ConfirmModal'
import { ListLoading, ListError, ListEmpty } from '../components/ListState'

interface MenuDisplayRow {
    row: MenuRow
    depth: number
    hasChildren: boolean
}

interface MenuFormValues {
    parent_id: number | null
    label: string
    path: string
    icon: string
    is_visible: boolean
    is_external: boolean
}


function getDepthPaddingClass(depth: number): string {
    if (depth <= 0) return 'pl-0'
    if (depth === 1) return 'pl-6'
    if (depth === 2) return 'pl-12'
    if (depth === 3) return 'pl-16'
    return 'pl-20'
}

function toFormValues(menu?: MenuRow): MenuFormValues {
    if (menu === undefined) {
        return {
            parent_id: null,
            label: '',
            path: '',
            icon: '',
            is_visible: true,
            is_external: false,
        }
    }

    return {
        parent_id: menu.parent_id,
        label: menu.label,
        path: menu.path ?? '',
        icon: menu.icon ?? '',
        is_visible: menu.is_visible,
        is_external: menu.is_external,
    }
}

function sortMenus(a: MenuRow, b: MenuRow): number {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
    return a.id - b.id
}

function buildDisplayRows(menus: MenuRow[]): MenuDisplayRow[] {
    const byParent = new Map<number | null, MenuRow[]>()
    const parentIds = new Set<number>()

    for (const menu of menus) {
        const parentList = byParent.get(menu.parent_id) ?? []
        parentList.push(menu)
        byParent.set(menu.parent_id, parentList)

        if (menu.parent_id !== null) {
            parentIds.add(menu.parent_id)
        }
    }

    for (const list of byParent.values()) {
        list.sort(sortMenus)
    }

    const visited = new Set<number>()
    const rows: MenuDisplayRow[] = []

    function walk(parentId: number | null, depth: number) {
        const children = byParent.get(parentId) ?? []
        for (const child of children) {
            if (visited.has(child.id)) continue
            visited.add(child.id)
            rows.push({
                row: child,
                depth,
                hasChildren: parentIds.has(child.id),
            })
            walk(child.id, depth + 1)
        }
    }

    walk(null, 0)

    const remaining = menus.filter((menu) => !visited.has(menu.id)).sort(sortMenus)
    for (const menu of remaining) {
        rows.push({
            row: menu,
            depth: 0,
            hasChildren: parentIds.has(menu.id),
        })
    }

    return rows
}

function buildParentOptions(menus: MenuRow[], currentId?: number): MenuDisplayRow[] {
    return buildDisplayRows(menus).filter(({ row }) => row.id !== currentId)
}

function buildCreatePayload(values: MenuFormValues, sortOrder: number): CreateMenuRequest {
    return {
        parent_id: values.parent_id,
        label: values.label.trim(),
        path: values.path.trim().length > 0 ? values.path.trim() : null,
        icon: values.icon.trim().length > 0 ? values.icon.trim() : null,
        sort_order: sortOrder,
        is_visible: values.is_visible,
        is_external: values.is_external,
    }
}

function buildUpdatePayload(values: MenuFormValues): UpdateMenuRequest {
    return {
        parent_id: values.parent_id,
        label: values.label.trim(),
        path: values.path.trim().length > 0 ? values.path.trim() : null,
        icon: values.icon.trim().length > 0 ? values.icon.trim() : null,
        is_visible: values.is_visible,
        is_external: values.is_external,
    }
}

interface MenuFormModalProps {
    title: string
    submitLabel: string
    initialValues: MenuFormValues
    menus: MenuRow[]
    currentId?: number
    pending: boolean
    onClose: () => void
    onSubmit: (values: MenuFormValues) => Promise<void>
}

function MenuFormModal({
    title,
    submitLabel,
    initialValues,
    menus,
    currentId,
    pending,
    onClose,
    onSubmit,
}: MenuFormModalProps) {
    const [values, setValues] = useState<MenuFormValues>(initialValues)
    const [error, setError] = useState<string | null>(null)
    const parentOptions = useMemo(() => buildParentOptions(menus, currentId), [menus, currentId])

    async function handleSubmit(): Promise<void> {
        if (values.label.trim().length === 0) {
            setError('메뉴명은 필수입니다.')
            return
        }
        setError(null)
        await onSubmit(values)
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget && !pending) onClose()
            }}
        >
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#3a3a44] bg-[#1a1a23] shadow-xl">
                <div className="border-b border-[#3a3a44] px-6 py-4">
                    <h2 className="text-base font-bold text-[#efeff1]">{title}</h2>
                    <p className="mt-1 text-xs text-[#adadb8]">GNB 항목을 생성하거나 수정합니다.</p>
                </div>

                <div className="space-y-3 px-6 py-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[#adadb8]">
                            메뉴명 <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={values.label}
                            onChange={(e) => setValues((prev) => ({ ...prev, label: e.target.value }))}
                            className={inputClass}
                            placeholder="예: 대회 정보"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[#adadb8]">경로</label>
                        <input
                            type="text"
                            value={values.path}
                            onChange={(e) => setValues((prev) => ({ ...prev, path: e.target.value }))}
                            className={inputClass}
                            placeholder="/tournament 또는 비워두면 그룹"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[#adadb8]">상위 메뉴</label>
                        <select
                            value={values.parent_id ?? ''}
                            onChange={(e) =>
                                setValues((prev) => ({
                                    ...prev,
                                    parent_id: e.target.value === '' ? null : Number(e.target.value),
                                }))
                            }
                            className={selectClass}
                        >
                            <option value="">최상위 메뉴</option>
                            {parentOptions.map(({ row, depth }) => (
                            <option key={row.id} value={row.id}>
                                    {'-- '.repeat(depth)}{row.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#3a3a44] bg-[#26262e] px-3 py-2">
                            <input
                                type="checkbox"
                                checked={values.is_visible}
                                onChange={(e) => setValues((prev) => ({ ...prev, is_visible: e.target.checked }))}
                                className="h-4 w-4 cursor-pointer rounded"
                            />
                            <span className="text-sm text-[#efeff1]">노출</span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#3a3a44] bg-[#26262e] px-3 py-2">
                            <input
                                type="checkbox"
                                checked={values.is_external}
                                onChange={(e) => setValues((prev) => ({ ...prev, is_external: e.target.checked }))}
                                className="h-4 w-4 cursor-pointer rounded"
                            />
                            <span className="text-sm text-[#efeff1]">외부 링크</span>
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

export default function MenuManagePage() {
    const { addToast } = useAdminToast()
    const { data: menus = [], isLoading, isError, refetch } = useAdminMenus()
    const createMutation = useCreateMenu()
    const updateMutation = useUpdateMenu()
    const deleteMutation = useDeleteMenu()
    const reorderMutation = useReorderMenus()
    const [creating, setCreating] = useState(false)
    const [editingMenu, setEditingMenu] = useState<MenuRow | null>(null)
    const [deletingMenu, setDeletingMenu] = useState<MenuRow | null>(null)

    const displayRows = useMemo(() => buildDisplayRows(menus), [menus])

    async function handleCreate(values: MenuFormValues): Promise<void> {
        const siblingMaxOrder = menus
            .filter((menu) => menu.parent_id === values.parent_id)
            .reduce((max, menu) => Math.max(max, menu.sort_order), -1)

        try {
            await createMutation.mutateAsync(buildCreatePayload(values, siblingMaxOrder + 1))
            addToast({ message: '메뉴가 생성되었습니다.', variant: 'success' })
            setCreating(false)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleUpdate(menuId: number, values: MenuFormValues): Promise<void> {
        try {
            await updateMutation.mutateAsync({ id: menuId, body: buildUpdatePayload(values) })
            addToast({ message: '메뉴가 수정되었습니다.', variant: 'success' })
            setEditingMenu(null)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleDelete(): Promise<void> {
        if (deletingMenu === null) return
        try {
            await deleteMutation.mutateAsync(deletingMenu.id)
            addToast({ message: '메뉴가 삭제되었습니다.', variant: 'success' })
            setDeletingMenu(null)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleToggleVisible(menu: MenuRow): Promise<void> {
        const nextVisible = !menu.is_visible
        try {
            await updateMutation.mutateAsync({
                id: menu.id,
                body: { is_visible: nextVisible },
            })
            addToast({ message: `${menu.label} 메뉴를 ${nextVisible ? '노출' : '미노출'}로 변경했습니다.`, variant: 'success' })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleMove(menu: MenuRow, direction: 'up' | 'down'): Promise<void> {
        const siblings = menus.filter((item) => item.parent_id === menu.parent_id).sort(sortMenus)
        const currentIndex = siblings.findIndex((item) => item.id === menu.id)
        if (currentIndex < 0) return

        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
        if (targetIndex < 0 || targetIndex >= siblings.length) return

        const nextSiblings = [...siblings]
        const [moved] = nextSiblings.splice(currentIndex, 1)
        nextSiblings.splice(targetIndex, 0, moved)

        const baseSortOrder = siblings.reduce((min, item) => Math.min(min, item.sort_order), siblings[0].sort_order)
        const updatedSortOrder = new Map<number, number>()

        nextSiblings.forEach((item, index) => {
            updatedSortOrder.set(item.id, baseSortOrder + index)
        })

        const payload: ReorderMenuItem[] = menus.map((item) => ({
            id: item.id,
            parent_id: item.parent_id,
            sort_order: updatedSortOrder.get(item.id) ?? item.sort_order,
        }))

        try {
            await reorderMutation.mutateAsync({ items: payload })
            addToast({ message: `${menu.label} 메뉴 순서를 변경했습니다.`, variant: 'success' })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    return (
        <>
            <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-[#efeff1]">메뉴 관리</h1>
                    <p className="mt-1 text-sm text-[#adadb8]">서버에서 제어하는 GNB 메뉴를 관리합니다</p>
                </div>
                <button
                    type="button"
                    onClick={() => setCreating(true)}
                    className="cursor-pointer flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                    <Plus className="h-4 w-4" />
                    메뉴 추가
                </button>
            </div>

            <div className={panelClass}>
                <div className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.8fr)_90px_80px_172px] items-center gap-3 border-b border-[#3a3a44] px-4 py-3 text-center text-xs font-semibold text-[#848494]">
                    <div>메뉴명</div>
                    <div>경로</div>
                    <div>순서</div>
                    <div>노출</div>
                    <div>작업</div>
                </div>

                {isLoading && <ListLoading />}

                {isError && <ListError message="메뉴를 불러오는 중 오류가 발생했습니다." onRetry={() => { void refetch() }} />}

                {!isLoading && !isError && displayRows.length === 0 && <ListEmpty message="등록된 메뉴가 없습니다." />}

                {!isLoading && !isError && displayRows.length > 0 && (
                    <ul className="divide-y divide-[#3a3a44]">
                        {displayRows.map(({ row, depth, hasChildren }) => {
                            const siblings = menus.filter((item) => item.parent_id === row.parent_id).sort(sortMenus)
                            const index = siblings.findIndex((item) => item.id === row.id)
                            const isFirst = index <= 0
                            const isLast = index === siblings.length - 1
                            const isPending = updateMutation.isPending || deleteMutation.isPending || reorderMutation.isPending

                            return (
                                <li key={row.id} className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.8fr)_90px_80px_172px] items-center gap-3 px-4 py-3">
                                    <div className={cn('min-w-0', getDepthPaddingClass(depth))}>
                                        <div className="flex items-center gap-2">
                                            <span className={cn('truncate text-sm text-[#efeff1]', hasChildren && 'font-semibold')}>{row.label}</span>
                                            {row.path === null && (
                                                <span className="rounded-full border border-[#3a3a44] bg-[#26262e] px-2 py-0.5 text-[10px] text-[#adadb8]">
                                                    그룹
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="truncate text-xs text-[#adadb8]">{row.path ?? '-'}</div>

                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                void handleMove(row, 'up')
                                            }}
                                            disabled={isPending || isFirst}
                                            className="cursor-pointer rounded border border-[#3a3a44] p-0.5 text-[#adadb8] transition hover:bg-[#26262e] disabled:cursor-not-allowed disabled:opacity-30"
                                        >
                                            <ArrowUp className="h-3 w-3" />
                                        </button>
                                        <span className="w-5 text-center text-xs tabular-nums text-[#848494]">{row.sort_order}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                void handleMove(row, 'down')
                                            }}
                                            disabled={isPending || isLast}
                                            className="cursor-pointer rounded border border-[#3a3a44] p-0.5 text-[#adadb8] transition hover:bg-[#26262e] disabled:cursor-not-allowed disabled:opacity-30"
                                        >
                                            <ArrowDown className="h-3 w-3" />
                                        </button>
                                    </div>

                                    <div className="flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                void handleToggleVisible(row)
                                            }}
                                            disabled={updateMutation.isPending}
                                            className={cn(
                                                'cursor-pointer rounded-full px-2.5 py-0.5 text-[11px] font-bold transition disabled:cursor-not-allowed disabled:opacity-50',
                                                row.is_visible
                                                    ? 'bg-emerald-500/20 text-emerald-300'
                                                    : 'bg-red-500/20 text-red-400',
                                            )}
                                        >
                                            {row.is_visible ? '노출' : '미노출'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setEditingMenu(row)}
                                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#3a3a44] px-3 py-1.5 text-xs font-medium text-[#adadb8] transition hover:bg-[#26262e]"
                                        >
                                            <Pencil className="h-3.5 w-3.5" /> 수정
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeletingMenu(row)}
                                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-red-500/35 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/10"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" /> 삭제
                                        </button>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>

            {creating && (
                <MenuFormModal
                    title="메뉴 생성"
                    submitLabel="생성"
                    initialValues={toFormValues()}
                    menus={menus}
                    pending={createMutation.isPending}
                    onClose={() => setCreating(false)}
                    onSubmit={handleCreate}
                />
            )}

            {editingMenu !== null && (
                <MenuFormModal
                    title="메뉴 수정"
                    submitLabel="수정"
                    initialValues={toFormValues(editingMenu)}
                    menus={menus}
                    currentId={editingMenu.id}
                    pending={updateMutation.isPending}
                    onClose={() => setEditingMenu(null)}
                    onSubmit={(values) => handleUpdate(editingMenu.id, values)}
                />
            )}

            {deletingMenu !== null && (
                <ConfirmModal
                    title="메뉴 삭제"
                    message="메뉴를 삭제하시겠습니까?"
                    itemName={deletingMenu.label}
                    pending={deleteMutation.isPending}
                    onClose={() => setDeletingMenu(null)}
                    onConfirm={() => {
                        void handleDelete()
                    }}
                />
            )}
        </>
    )
}
