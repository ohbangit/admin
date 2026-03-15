import partnerMark from '../assets/mark.png'
import { BROADCAST_TYPES } from '../constants/broadcast'
import { useBroadcastForm } from '../hooks'
import type { Broadcast } from '../types'
import { cn } from '../lib/cn'
import { HOUR_OPTIONS, MINUTE_OPTIONS } from '../utils/broadcastSchedule'

interface BroadcastFormModalProps {
    mode: 'create' | 'edit'
    broadcast?: Broadcast
    onClose: () => void
    onSuccess: () => void
}

export function BroadcastFormModal({ mode, broadcast, onClose, onSuccess }: BroadcastFormModalProps) {
    const {
        form,
        participantNameInput,
        participantStreamerId,
        editingParticipantName,
        editingInput,
        categorySearch,
        isCategoryOpen,
        showParticipantSuggestions,
        participantStreamerQuery,
        showEditSuggestions,
        editStreamerQuery,
        categories,
        isPending,
        quickTags,
        selectedTags,
        setParticipantNameInput,
        setParticipantStreamerId,
        setParticipantAvatarUrl,
        setParticipantIsPartner,
        setParticipantAffiliations,
        setEditingInput,
        setCategorySearch,
        setIsCategoryOpen,
        requestClose,
        updateField,
        addParticipant,
        startEditing,
        cancelEditing,
        commitNameEdit,
        commitStreamerEdit,
        toggleQuickTag,
        removeParticipant,
        setHost,
        clearHost,
        handleSubmit,
    } = useBroadcastForm({ mode, broadcast, onClose, onSuccess })

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 dark:bg-black/70"
            onClick={(e) => {
                if (e.target === e.currentTarget) requestClose()
            }}
        >
            <div className="my-8 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-[#1a1a23]">
                <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-[#3a3a44]">
                    <h2 className="text-base font-bold text-gray-900 dark:text-[#efeff1]">{mode === 'create' ? '방송 추가' : '방송 수정'}</h2>
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2 sm:justify-start dark:border-[#3a3a44]">
                        <span className="text-xs font-medium text-gray-500 dark:text-[#adadb8]">유저 웹 노출</span>
                        <button
                            type="button"
                            onClick={() => updateField('isVisible', !form.isVisible)}
                            className={cn(
                                'cursor-pointer flex h-6 w-12 shrink-0 items-center rounded-full px-0.5 transition-colors',
                                form.isVisible ? 'justify-end' : 'justify-start',
                                form.isVisible ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-[#3a3a44]',
                            )}
                        >
                            <span className="h-5 w-5 rounded-full bg-white shadow" />
                        </button>
                    </div>
                </div>
                <form
                    onSubmit={(e) => {
                        void handleSubmit(e)
                    }}
                    className="space-y-4 px-6 py-4"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <section className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-[#3a3a44]">
                            <p className="text-xs font-semibold text-gray-500 dark:text-[#848494]">기본 정보</p>
                            <p className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-[#adadb8]">
                                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M4 4.75A1.75 1.75 0 015.75 3h7.586c.464 0 .909.184 1.237.513l.914.914A1.75 1.75 0 0116 5.664V15.25A1.75 1.75 0 0114.25 17h-8.5A1.75 1.75 0 014 15.25v-10.5zM6.5 7a.75.75 0 000 1.5h7a.75.75 0 000-1.5h-7zm0 3a.75.75 0 000 1.5h5a.75.75 0 000-1.5h-5z" />
                                </svg>
                                제목
                            </p>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => updateField('title', e.target.value)}
                                placeholder="제목"
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                            />
                            <p className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-[#adadb8]">
                                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2.5 4A1.5 1.5 0 014 2.5h12A1.5 1.5 0 0117.5 4v2A1.5 1.5 0 0116 7.5H4A1.5 1.5 0 012.5 6V4zm0 6A1.5 1.5 0 014 8.5h12a1.5 1.5 0 011.5 1.5v2A1.5 1.5 0 0116 13.5H4A1.5 1.5 0 012.5 12v-2zm1.5 5.5A1.5 1.5 0 002.5 17v1.5h15V17a1.5 1.5 0 00-1.5-1.5H4z" />
                                </svg>
                                타입
                            </p>
                            <div className="grid grid-cols-4 gap-1.5">
                                {BROADCAST_TYPES.map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => updateField('broadcastType', type)}
                                        className={cn(
                                            'cursor-pointer rounded-lg border px-1.5 py-1.5 text-xs font-medium',
                                            form.broadcastType === type
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                                : 'border-gray-300 text-gray-500 dark:border-[#3a3a44] dark:text-[#adadb8]',
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-[#3a3a44]">
                                <span className="text-[11px] font-medium text-gray-500 dark:text-[#adadb8]">치지직 제작지원</span>
                                <button
                                    type="button"
                                    onClick={() => updateField('isChzzkSupport', !form.isChzzkSupport)}
                                    className={cn(
                                        'cursor-pointer flex h-6 w-12 shrink-0 items-center rounded-full px-0.5 transition-colors',
                                        form.isChzzkSupport ? 'justify-end' : 'justify-start',
                                        form.isChzzkSupport ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-[#3a3a44]',
                                    )}
                                >
                                    <span className="h-5 w-5 rounded-full bg-white shadow" />
                                </button>
                            </div>
                            <p className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-[#adadb8]">
                                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M5.5 6A3.5 3.5 0 002 9.5v1A3.5 3.5 0 005.5 14h9a3.5 3.5 0 003.5-3.5v-1A3.5 3.5 0 0014.5 6h-9zM6 8.5a.75.75 0 01.75.75V10H7.5a.75.75 0 010 1.5h-.75v.75a.75.75 0 01-1.5 0v-.75H4.5a.75.75 0 010-1.5h.75v-.75A.75.75 0 016 8.5zm8.25.75a1 1 0 100 2 1 1 0 000-2zm-2.5 1a1 1 0 102 0 1 1 0 00-2 0z" />
                                </svg>
                                게임 / 카테고리
                            </p>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={
                                        isCategoryOpen
                                            ? categorySearch
                                            : form.categoryId !== null
                                              ? (categories.find((c) => c.id === form.categoryId)?.name ?? '')
                                              : ''
                                    }
                                    onChange={(e) => {
                                        setCategorySearch(e.target.value)
                                        if (!isCategoryOpen) {
                                            setIsCategoryOpen(true)
                                        }
                                    }}
                                    onFocus={() => {
                                        setIsCategoryOpen(true)
                                        setCategorySearch('')
                                    }}
                                    onBlur={() => {
                                        setTimeout(() => {
                                            setIsCategoryOpen(false)
                                            setCategorySearch('')
                                        }, 150)
                                    }}
                                    placeholder="카테고리 검색"
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 pr-9 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                />
                                <svg
                                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-[#848494]"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.1 1.02l-4.25 4.5a.75.75 0 01-1.1 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                                </svg>
                                {isCategoryOpen && (
                                    <div className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white dark:border-[#3a3a44] dark:bg-[#26262e]">
                                        <button
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => {
                                                updateField('categoryId', null)
                                                setIsCategoryOpen(false)
                                                setCategorySearch('')
                                            }}
                                            className="flex w-full cursor-pointer items-center px-3 py-1.5 text-left text-xs text-gray-400 hover:bg-gray-50 dark:text-[#848494] dark:hover:bg-[#3a3a44]"
                                        >
                                            카테고리 없음
                                        </button>
                                        {categories
                                            .filter((c) => c.name.toLowerCase().includes(categorySearch.trim().toLowerCase()))
                                            .map((category) => (
                                                <button
                                                    key={category.id}
                                                    type="button"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => {
                                                        updateField('categoryId', category.id)
                                                        setIsCategoryOpen(false)
                                                        setCategorySearch('')
                                                    }}
                                                    className={cn(
                                                        'flex w-full cursor-pointer items-center px-3 py-1.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-[#3a3a44]',
                                                        form.categoryId === category.id
                                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                                            : 'text-gray-800 dark:text-[#efeff1]',
                                                    )}
                                                >
                                                    {category.name}
                                                </button>
                                            ))}
                                    </div>
                                )}
                            </div>
                            <p className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-[#adadb8]">
                                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 4.5a.75.75 0 00-1.5 0v3.69c0 .2.08.39.22.53l2.4 2.4a.75.75 0 101.06-1.06l-2.18-2.18V6.5z" />
                                </svg>
                                시간
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-medium text-gray-400 dark:text-[#848494]">시작</p>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={form.startDate}
                                                onChange={(e) => updateField('startDate', e.target.value)}
                                                className="w-full rounded-xl border border-gray-300 px-3 py-2 pr-9 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    updateField('startDate', '')
                                                    updateField('startHour', '')
                                                    updateField('startMinute', '')
                                                }}
                                                disabled={
                                                    form.startDate.length === 0 && form.startHour.length === 0 && form.startMinute.length === 0
                                                }
                                                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#848494] dark:hover:bg-[#2f2f39] dark:hover:text-[#adadb8]"
                                                aria-label="시작 시간 초기화"
                                            >
                                                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path d="M6.28 5.22a.75.75 0 10-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 10-1.06-1.06L10 8.94 6.28 5.22z" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="relative">
                                                <select
                                                    value={form.startHour}
                                                    onChange={(e) => updateField('startHour', e.target.value)}
                                                    className="w-full appearance-none rounded-xl border border-gray-300 px-3 py-2 pr-9 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                                >
                                                    <option value="">시 선택</option>
                                                    {HOUR_OPTIONS.map((hour) => (
                                                        <option key={hour} value={hour}>
                                                            {hour}
                                                        </option>
                                                    ))}
                                                </select>
                                                <svg
                                                    className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-gray-400 dark:text-[#848494]"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.1 1.02l-4.25 4.5a.75.75 0 01-1.1 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                                                </svg>
                                            </div>
                                            <div className="relative">
                                                <select
                                                    value={form.startMinute}
                                                    onChange={(e) => updateField('startMinute', e.target.value)}
                                                    className="w-full appearance-none rounded-xl border border-gray-300 px-3 py-2 pr-9 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                                >
                                                    <option value="">분 선택</option>
                                                    {MINUTE_OPTIONS.map((minute) => (
                                                        <option key={minute} value={minute}>
                                                            {minute}
                                                        </option>
                                                    ))}
                                                </select>
                                                <svg
                                                    className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-gray-400 dark:text-[#848494]"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.1 1.02l-4.25 4.5a.75.75 0 01-1.1 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-medium text-gray-400 dark:text-[#848494]">종료</p>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={form.endDate}
                                                onChange={(e) => updateField('endDate', e.target.value)}
                                                className="w-full rounded-xl border border-gray-300 px-3 py-2 pr-9 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    updateField('endDate', '')
                                                    updateField('endHour', '')
                                                    updateField('endMinute', '')
                                                }}
                                                disabled={form.endDate.length === 0 && form.endHour.length === 0 && form.endMinute.length === 0}
                                                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#848494] dark:hover:bg-[#2f2f39] dark:hover:text-[#adadb8]"
                                                aria-label="종료 시간 초기화"
                                            >
                                                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path d="M6.28 5.22a.75.75 0 10-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 10-1.06-1.06L10 8.94 6.28 5.22z" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="relative">
                                                <select
                                                    value={form.endHour}
                                                    onChange={(e) => updateField('endHour', e.target.value)}
                                                    className="w-full appearance-none rounded-xl border border-gray-300 px-3 py-2 pr-9 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                                >
                                                    <option value="">시 선택</option>
                                                    {HOUR_OPTIONS.map((hour) => (
                                                        <option key={hour} value={hour}>
                                                            {hour}
                                                        </option>
                                                    ))}
                                                </select>
                                                <svg
                                                    className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-gray-400 dark:text-[#848494]"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.1 1.02l-4.25 4.5a.75.75 0 01-1.1 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                                                </svg>
                                            </div>
                                            <div className="relative">
                                                <select
                                                    value={form.endMinute}
                                                    onChange={(e) => updateField('endMinute', e.target.value)}
                                                    className="w-full appearance-none rounded-xl border border-gray-300 px-3 py-2 pr-9 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                                >
                                                    <option value="">분 선택</option>
                                                    {MINUTE_OPTIONS.map((minute) => (
                                                        <option key={minute} value={minute}>
                                                            {minute}
                                                        </option>
                                                    ))}
                                                </select>
                                                <svg
                                                    className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-gray-400 dark:text-[#848494]"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.1 1.02l-4.25 4.5a.75.75 0 01-1.1 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-[#adadb8]">
                                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2 6.5A2.5 2.5 0 014.5 4h4.964c.663 0 1.299.264 1.768.732l5.036 5.036a2.5 2.5 0 010 3.536l-2.964 2.964a2.5 2.5 0 01-3.536 0L4.732 11.232A2.5 2.5 0 014 9.464V6.5zM7 6.75a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" />
                                </svg>
                                태그
                            </p>
                            <input
                                type="text"
                                value={form.tags}
                                onChange={(e) => updateField('tags', e.target.value)}
                                placeholder="태그 (쉼표 구분)"
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                            />
                            {quickTags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {quickTags.map((tag) => {
                                        const isSelected = selectedTags.includes(tag)
                                        return (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => toggleQuickTag(tag)}
                                                className={cn(
                                                    'cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-semibold transition',
                                                    isSelected
                                                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm dark:border-blue-500 dark:bg-blue-500 dark:text-white'
                                                        : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400 hover:bg-gray-100 dark:border-[#3a3a44] dark:bg-[#2a2a34] dark:text-[#bcbccc] dark:hover:border-[#5a5a66] dark:hover:bg-[#32323c]',
                                                )}
                                            >
                                                {tag}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </section>

                        <section className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-[#3a3a44]">
                            <p className="text-xs font-semibold text-gray-500 dark:text-[#848494]">참석자 관리</p>
                            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                                {form.participants.length === 0 && (
                                    <p className="rounded-lg border border-dashed border-gray-300 px-3 py-5 text-center text-xs text-gray-400 dark:border-[#3a3a44] dark:text-[#848494]">
                                        참석자를 먼저 추가해주세요
                                    </p>
                                )}
                                {form.participants.map((participant) => {
                                    const isEditing = editingParticipantName === participant.name
                                    return (
                                        <div
                                            key={participant.name}
                                            className={cn(
                                                'overflow-hidden rounded-lg border',
                                                participant.streamerId !== undefined
                                                    ? 'border-l-[3px] border-l-emerald-400 border-gray-200 dark:border-gray-100/0 dark:border-l-emerald-400 dark:bg-[#1a1a23]'
                                                    : 'border-l-[3px] border-l-amber-400 border-gray-200 dark:border-gray-100/0 dark:border-l-amber-400 dark:bg-[#1a1a23]',
                                            )}
                                        >
                                            <div className="flex items-center justify-between gap-2 px-3 py-2">
                                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                                    {participant.streamerId !== undefined && participant.avatarUrl !== undefined ? (
                                                        <img
                                                            src={participant.avatarUrl}
                                                            alt={participant.name}
                                                            className="h-7 w-7 shrink-0 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-[#3a3a44]">
                                                            <svg
                                                                className="h-3.5 w-3.5 text-gray-400 dark:text-[#848494]"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H3z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <div className="relative min-w-0 flex-1">
                                                        {isEditing ? (
                                                            <>
                                                                <input
                                                                    type="text"
                                                                    value={editingInput}
                                                                    onChange={(e) => setEditingInput(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault()
                                                                            commitNameEdit(participant.name)
                                                                        }
                                                                        if (e.key === 'Escape') {
                                                                            cancelEditing()
                                                                        }
                                                                    }}
                                                                    autoFocus
                                                                    className="w-full rounded-md border border-blue-400 px-2 py-1 text-sm text-gray-800 outline-none dark:border-blue-500 dark:bg-[#26262e] dark:text-[#efeff1]"
                                                                />
                                                                {showEditSuggestions &&
                                                                    editStreamerQuery.data !== undefined &&
                                                                    editStreamerQuery.data.items.length > 0 && (
                                                                        <div className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-gray-300 bg-white dark:border-[#3a3a44] dark:bg-[#26262e]">
                                                                            {editStreamerQuery.data.items.map((streamer) => (
                                                                                <button
                                                                                    key={streamer.id}
                                                                                    type="button"
                                                                                    onMouseDown={(e) => e.preventDefault()}
                                                                                    onClick={() =>
                                                                                        commitStreamerEdit({
                                                                                            originalName: participant.name,
                                                                                            streamerId: streamer.id,
                                                                                            streamerName: streamer.name,
                                                                                            avatarUrl: streamer.channelImageUrl ?? undefined,
                                                                                            isPartner: streamer.isPartner,
                                                                                            affiliations: streamer.affiliations,
                                                                                        })
                                                                                    }
                                                                                    className="cursor-pointer flex w-full items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-[#3a3a44]"
                                                                                >
                                                                                    <span className="text-gray-800 dark:text-[#efeff1]">{streamer.name}</span>
                                                                                    <span className="text-[10px] text-gray-400 dark:text-[#848494]">
                                                                                        스트리머 연결
                                                                                    </span>
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                            </>
                                                        ) : (
                                                            <div className="flex cursor-pointer items-center gap-1" onClick={() => startEditing(participant.name)}>
                                                                <p className="truncate text-sm font-medium text-gray-800 hover:text-blue-600 dark:text-[#efeff1] dark:hover:text-blue-400">
                                                                    {participant.name}
                                                                </p>
                                                                {participant.isPartner && (
                                                                    <img src={partnerMark} alt="파트너" className="h-3.5 w-3.5 shrink-0" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setHost(participant.name)}
                                                        className={cn(
                                                            'cursor-pointer rounded-md px-2 py-1 text-[11px] font-semibold',
                                                            participant.isHost
                                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                                                : 'bg-gray-100 text-gray-500 dark:bg-[#26262e] dark:text-[#848494]',
                                                        )}
                                                    >
                                                        주최
                                                    </button>
                                                    {participant.isHost && (
                                                        <button
                                                            type="button"
                                                            onClick={clearHost}
                                                            className="cursor-pointer rounded-md px-2 py-1 text-[11px] font-semibold text-gray-500 dark:text-[#848494]"
                                                        >
                                                            해제
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeParticipant(participant.name)}
                                                        className="cursor-pointer rounded-md border border-red-100 px-2 py-1 text-[11px] text-red-500"
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="space-y-2 rounded-lg border border-gray-200 p-3 dark:border-[#3a3a44]">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={participantNameInput}
                                        onChange={(e) => {
                                            setParticipantNameInput(e.target.value)
                                            if (participantStreamerId !== undefined) {
                                                setParticipantStreamerId(undefined)
                                                setParticipantAvatarUrl(undefined)
                                                setParticipantIsPartner(false)
                                                setParticipantAffiliations([])
                                            }
                                        }}
                                        placeholder="참석자 이름 또는 스트리머 검색"
                                        className={cn(
                                            'w-full rounded-lg border border-gray-300 py-2 pl-3 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]',
                                            participantStreamerId !== undefined ? 'pr-14' : 'pr-3',
                                        )}
                                    />
                                    {participantStreamerId !== undefined && (
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                            연결됨
                                        </span>
                                    )}
                                    {showParticipantSuggestions &&
                                        participantStreamerQuery.data !== undefined &&
                                        participantStreamerQuery.data.items.length > 0 && (
                                            <div className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-gray-300 bg-white dark:border-[#3a3a44] dark:bg-[#26262e]">
                                                {participantStreamerQuery.data.items.map((streamer) => (
                                                    <button
                                                        key={streamer.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setParticipantNameInput(streamer.name)
                                                            setParticipantStreamerId(streamer.id)
                                                            setParticipantAvatarUrl(streamer.channelImageUrl ?? undefined)
                                                            setParticipantIsPartner(streamer.isPartner)
                                                            setParticipantAffiliations(streamer.affiliations)
                                                        }}
                                                        className="cursor-pointer flex w-full items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-[#3a3a44]"
                                                    >
                                                        <span className="text-gray-800 dark:text-[#efeff1]">{streamer.name}</span>
                                                        <span className="text-[10px] text-gray-400 dark:text-[#848494]">스트리머 연결</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                </div>
                                <button
                                    type="button"
                                    onClick={addParticipant}
                                    className="cursor-pointer w-full rounded-lg bg-blue-500 py-2 text-xs font-semibold text-white hover:bg-blue-600"
                                >
                                    참석자 추가
                                </button>
                            </div>
                        </section>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={requestClose}
                            className="cursor-pointer flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:bg-[#26262e]"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="cursor-pointer flex-1 rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
                        >
                            {isPending ? '저장 중…' : mode === 'create' ? '추가' : '저장'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
