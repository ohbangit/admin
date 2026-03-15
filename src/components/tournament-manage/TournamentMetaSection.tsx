import type { FormEvent } from 'react'
import { cn } from '../../lib/cn'
import type { CommentatorItem, StreamerItem, TournamentItem, TournamentMetaFormState, TournamentPromotionPanel } from '../../types'
import { PromotionSetupPanel } from './PromotionSetupPanel'

interface TournamentMetaSectionProps {
    selectedSlug: string
    selectedTournament: TournamentItem | undefined
    showMetaEditor: boolean
    metaForm: TournamentMetaFormState
    tagInput: string
    hostSearchInput: string
    hostSelectedId: number | undefined
    hostSuggestions: StreamerItem[] | undefined
    isHostFetching: boolean
    broadcasterSearchInput: string
    broadcasterSelectedId: number | undefined
    broadcasterSuggestions: StreamerItem[] | undefined
    isBroadcasterFetching: boolean
    commentatorSearchInput: string
    commentatorSelectedId: number | undefined
    commentatorSuggestions: StreamerItem[] | undefined
    isCommentatorFetching: boolean
    schedulePreview: string
    isPromotionLoading: boolean
    hasPromotionData: boolean
    sortedPanels: TournamentPromotionPanel[]
    draggingPanelId: number | null
    hoveredPanelId: number | null
    createPromotionPending: boolean
    updateTournamentPending: boolean
    deleteTournamentPending: boolean
    onSetShowMetaEditor: (next: boolean | ((prev: boolean) => boolean)) => void
    onSetMetaForm: (next: TournamentMetaFormState | ((prev: TournamentMetaFormState) => TournamentMetaFormState)) => void
    onSetTagInput: (value: string) => void
    onSetHostSearchInput: (value: string) => void
    onSetHostSelectedId: (value: number | undefined) => void
    onSetBroadcasterSearchInput: (value: string) => void
    onSetBroadcasterSelectedId: (value: number | undefined) => void
    onSetCommentatorSearchInput: (value: string) => void
    onSetCommentatorSelectedId: (value: number | undefined) => void
    onSetDraggingPanelId: (value: number | null) => void
    onSetHoveredPanelId: (value: number | null) => void
    onCopySlug: () => void
    onToggleActive: () => Promise<void>
    onDeleteTournament: () => Promise<void>
    onSubmitMeta: (event: FormEvent) => Promise<void>
    onCreatePromotion: () => Promise<void>
    onDropPanel: (panelId: number) => Promise<void>
    onTogglePanelVisibility: (panelId: number) => Promise<void>
    onTogglePanelDefaultExpanded: (panelId: number) => Promise<void>
}

function toChannelUrl(channelId: string | null): string {
    return channelId !== null ? `https://chzzk.naver.com/live/${channelId}` : ''
}

function toNullableChannelUrl(channelId: string | null): string | null {
    return channelId !== null ? `https://chzzk.naver.com/live/${channelId}` : null
}

export function TournamentMetaSection({
    broadcasterSearchInput,
    broadcasterSelectedId,
    broadcasterSuggestions,
    commentatorSearchInput,
    commentatorSelectedId,
    commentatorSuggestions,
    createPromotionPending,
    deleteTournamentPending,
    draggingPanelId,
    hasPromotionData,
    hostSearchInput,
    hostSelectedId,
    hostSuggestions,
    hoveredPanelId,
    isBroadcasterFetching,
    isCommentatorFetching,
    isHostFetching,
    isPromotionLoading,
    metaForm,
    onCopySlug,
    onCreatePromotion,
    onDeleteTournament,
    onDropPanel,
    onSetBroadcasterSearchInput,
    onSetBroadcasterSelectedId,
    onSetCommentatorSearchInput,
    onSetCommentatorSelectedId,
    onSetDraggingPanelId,
    onSetHostSearchInput,
    onSetHostSelectedId,
    onSetHoveredPanelId,
    onSetMetaForm,
    onSetShowMetaEditor,
    onSetTagInput,
    onSubmitMeta,
    onToggleActive,
    onTogglePanelDefaultExpanded,
    onTogglePanelVisibility,
    schedulePreview,
    selectedSlug,
    selectedTournament,
    showMetaEditor,
    sortedPanels,
    tagInput,
    updateTournamentPending,
}: TournamentMetaSectionProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-[#3a3a44] dark:bg-[#1a1a23]">
            <div className="border-b border-gray-100 px-4 py-3 dark:border-[#2e2e38]">
                <p className="text-sm font-semibold text-gray-700 dark:text-[#efeff1]">대회 메타</p>
            </div>
            <div className="space-y-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-400 dark:text-[#adadb8]">slug:</span>
                    <code className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-[#2e2e38] dark:text-[#adadb8]">{selectedSlug}</code>
                    <button type="button" onClick={onCopySlug} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-[#efeff1]">
                        복사
                    </button>
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => onSetShowMetaEditor((previous) => !previous)}
                            className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500 transition hover:border-blue-200 hover:text-blue-600 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:border-blue-700 dark:hover:text-blue-400"
                        >
                            {showMetaEditor ? '메타 닫기' : '메타 편집'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                void onToggleActive()
                            }}
                            disabled={updateTournamentPending}
                            className={cn(
                                'rounded-lg px-3 py-1 text-xs font-medium transition disabled:opacity-50',
                                selectedTournament?.isActive === true
                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-[#2e2e38] dark:text-[#adadb8] dark:hover:bg-[#3a3a44]',
                            )}
                        >
                            {selectedTournament?.isActive === true ? '● 활성' : '○ 비활성'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                void onDeleteTournament()
                            }}
                            disabled={deleteTournamentPending}
                            className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-400 transition hover:border-red-200 hover:text-red-500 disabled:opacity-50 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:border-red-900/60 dark:hover:text-red-400"
                        >
                            대회 삭제
                        </button>
                    </div>
                </div>

                {selectedTournament !== undefined && showMetaEditor && (
                    <form
                        onSubmit={(event) => {
                            void onSubmitMeta(event)
                        }}
                        className="grid gap-3"
                    >
                        <div className="grid gap-3 sm:grid-cols-2">
                            <input
                                type="text"
                                value={metaForm.name}
                                onChange={(event) =>
                                    onSetMetaForm((previous) => ({
                                        ...previous,
                                        name: event.target.value,
                                    }))
                                }
                                placeholder="대회명"
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                            />
                            <input
                                type="url"
                                value={metaForm.bannerUrl}
                                onChange={(event) =>
                                    onSetMetaForm((previous) => ({
                                        ...previous,
                                        bannerUrl: event.target.value,
                                    }))
                                }
                                placeholder="배너 URL (선택)"
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                            />
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-[#2e2e38] dark:bg-[#20202a]">
                            <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-[#adadb8]">일정</p>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <input
                                    type="date"
                                    value={metaForm.startedAt}
                                    onChange={(event) =>
                                        onSetMetaForm((previous) => ({
                                            ...previous,
                                            startedAt: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                />
                                <input
                                    type="date"
                                    value={metaForm.endedAt}
                                    onChange={(event) =>
                                        onSetMetaForm((previous) => ({
                                            ...previous,
                                            endedAt: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-400 dark:text-[#adadb8]">기간 미리보기: {schedulePreview}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-[#2e2e38] dark:bg-[#20202a]">
                            <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-[#adadb8]">태그</p>
                            <label className="mb-3 flex cursor-pointer items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={metaForm.isChzzkSupport}
                                    onChange={(event) =>
                                        onSetMetaForm((previous) => ({
                                            ...previous,
                                            isChzzkSupport: event.target.checked,
                                        }))
                                    }
                                    className="rounded"
                                />
                                <span className="text-xs text-gray-600 dark:text-[#efeff1]">치지직 제작지원</span>
                            </label>
                            {metaForm.tags.length > 0 && (
                                <div className="mb-2 flex flex-wrap gap-1.5">
                                    {metaForm.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onSetMetaForm((previous) => ({
                                                        ...previous,
                                                        tags: previous.tags.filter((_, tagIndex) => tagIndex !== index),
                                                    }))
                                                }
                                                className="ml-0.5 text-blue-400 hover:text-red-500"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-1.5">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(event) => onSetTagInput(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' && tagInput.trim().length > 0) {
                                            event.preventDefault()
                                            onSetMetaForm((previous) => ({
                                                ...previous,
                                                tags: [...previous.tags, tagInput.trim()],
                                            }))
                                            onSetTagInput('')
                                        }
                                    }}
                                    placeholder="태그 입력 후 Enter"
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (tagInput.trim().length > 0) {
                                            onSetMetaForm((previous) => ({
                                                ...previous,
                                                tags: [...previous.tags, tagInput.trim()],
                                            }))
                                            onSetTagInput('')
                                        }
                                    }}
                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-500 transition hover:bg-gray-100 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:bg-[#26262e]"
                                >
                                    추가
                                </button>
                            </div>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-[#2e2e38] dark:bg-[#20202a]">
                            <p className="mb-3 text-xs font-semibold text-gray-500 dark:text-[#adadb8]">스트리머</p>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="flex flex-col gap-1.5">
                                    <p className="text-[11px] font-medium text-gray-400 dark:text-[#6b6b7a]">주최자</p>
                                    {hostSelectedId !== undefined ? (
                                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-[#3a3a44] dark:bg-[#1a1a23]">
                                            <div className="flex min-w-0 items-center gap-2">
                                                {metaForm.hostAvatarUrl.length > 0 && (
                                                    <img src={metaForm.hostAvatarUrl} alt={metaForm.hostName} className="h-6 w-6 shrink-0 rounded-full" />
                                                )}
                                                <span className="min-w-0 truncate text-sm font-medium text-gray-800 dark:text-[#efeff1]">{metaForm.hostName}</span>
                                                {metaForm.hostIsPartner && (
                                                    <span className="shrink-0 rounded-full bg-purple-50 px-1.5 py-0.5 text-[10px] text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                                        파트너
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onSetHostSelectedId(undefined)
                                                    onSetHostSearchInput('')
                                                    onSetMetaForm((previous) => ({
                                                        ...previous,
                                                        hostName: '',
                                                        hostAvatarUrl: '',
                                                        hostChannelUrl: '',
                                                        hostIsPartner: false,
                                                        hostStreamerId: null,
                                                    }))
                                                }}
                                                className="ml-2 shrink-0 cursor-pointer text-gray-400 hover:text-red-500"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={hostSearchInput}
                                                onChange={(event) => onSetHostSearchInput(event.target.value)}
                                                placeholder="스트리머 검색"
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                            />
                                            {hostSearchInput.trim().length > 0 && (
                                                <div className="absolute z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-[#3a3a44] dark:bg-[#26262e]">
                                                    {isHostFetching && <p className="px-3 py-2 text-xs text-gray-500">검색 중...</p>}
                                                    {!isHostFetching && (hostSuggestions?.length ?? 0) === 0 && (
                                                        <p className="px-3 py-2 text-xs text-gray-500">결과 없음</p>
                                                    )}
                                                    {!isHostFetching &&
                                                        hostSuggestions?.map((streamer) => (
                                                            <button
                                                                key={streamer.id}
                                                                type="button"
                                                                onMouseDown={(event) => event.preventDefault()}
                                                                onClick={() => {
                                                                    onSetHostSelectedId(streamer.id)
                                                                    onSetHostSearchInput('')
                                                                    onSetMetaForm((previous) => ({
                                                                        ...previous,
                                                                        hostName: streamer.name,
                                                                        hostAvatarUrl: streamer.channelImageUrl ?? '',
                                                                        hostChannelUrl: toChannelUrl(streamer.channelId),
                                                                        hostIsPartner: streamer.isPartner,
                                                                        hostStreamerId: streamer.id,
                                                                    }))
                                                                }}
                                                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-gray-50 dark:hover:bg-[#3a3a44]"
                                                            >
                                                                {streamer.channelImageUrl !== null && (
                                                                    <img src={streamer.channelImageUrl} alt={streamer.name} className="h-5 w-5 rounded-full" />
                                                                )}
                                                                <span className="text-gray-800 dark:text-[#efeff1]">{streamer.name}</span>
                                                                {streamer.isPartner && (
                                                                    <span className="ml-auto rounded-full bg-purple-50 px-1.5 py-0.5 text-[10px] text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                                                        파트너
                                                                    </span>
                                                                )}
                                                            </button>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <p className="text-[11px] font-medium text-gray-400 dark:text-[#6b6b7a]">
                                        중계자
                                        <span className="ml-1 font-normal opacity-60">(없으면 주최자 직접 중계)</span>
                                    </p>
                                    {broadcasterSelectedId !== undefined ? (
                                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-[#3a3a44] dark:bg-[#1a1a23]">
                                            <div className="flex min-w-0 items-center gap-2">
                                                {metaForm.broadcasterAvatarUrl.length > 0 && (
                                                    <img
                                                        src={metaForm.broadcasterAvatarUrl}
                                                        alt={metaForm.broadcasterName}
                                                        className="h-6 w-6 shrink-0 rounded-full"
                                                    />
                                                )}
                                                <span className="min-w-0 truncate text-sm font-medium text-gray-800 dark:text-[#efeff1]">
                                                    {metaForm.broadcasterName}
                                                </span>
                                                {metaForm.broadcasterIsPartner && (
                                                    <span className="shrink-0 rounded-full bg-purple-50 px-1.5 py-0.5 text-[10px] text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                                        파트너
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onSetBroadcasterSelectedId(undefined)
                                                    onSetBroadcasterSearchInput('')
                                                    onSetMetaForm((previous) => ({
                                                        ...previous,
                                                        broadcasterName: '',
                                                        broadcasterAvatarUrl: '',
                                                        broadcasterChannelUrl: '',
                                                        broadcasterIsPartner: false,
                                                        broadcasterStreamerId: null,
                                                    }))
                                                }}
                                                className="ml-2 shrink-0 cursor-pointer text-gray-400 hover:text-red-500"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={broadcasterSearchInput}
                                                onChange={(event) => onSetBroadcasterSearchInput(event.target.value)}
                                                placeholder="스트리머 검색"
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                            />
                                            {broadcasterSearchInput.trim().length > 0 && (
                                                <div className="absolute z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-[#3a3a44] dark:bg-[#26262e]">
                                                    {isBroadcasterFetching && <p className="px-3 py-2 text-xs text-gray-500">검색 중...</p>}
                                                    {!isBroadcasterFetching && (broadcasterSuggestions?.length ?? 0) === 0 && (
                                                        <p className="px-3 py-2 text-xs text-gray-500">결과 없음</p>
                                                    )}
                                                    {!isBroadcasterFetching &&
                                                        broadcasterSuggestions?.map((streamer) => (
                                                            <button
                                                                key={streamer.id}
                                                                type="button"
                                                                onMouseDown={(event) => event.preventDefault()}
                                                                onClick={() => {
                                                                    onSetBroadcasterSelectedId(streamer.id)
                                                                    onSetBroadcasterSearchInput('')
                                                                    onSetMetaForm((previous) => ({
                                                                        ...previous,
                                                                        broadcasterName: streamer.name,
                                                                        broadcasterAvatarUrl: streamer.channelImageUrl ?? '',
                                                                        broadcasterChannelUrl: toChannelUrl(streamer.channelId),
                                                                        broadcasterIsPartner: streamer.isPartner,
                                                                        broadcasterStreamerId: streamer.id,
                                                                    }))
                                                                }}
                                                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-gray-50 dark:hover:bg-[#3a3a44]"
                                                            >
                                                                {streamer.channelImageUrl !== null && (
                                                                    <img src={streamer.channelImageUrl} alt={streamer.name} className="h-5 w-5 rounded-full" />
                                                                )}
                                                                <span className="text-gray-800 dark:text-[#efeff1]">{streamer.name}</span>
                                                                {streamer.isPartner && (
                                                                    <span className="ml-auto rounded-full bg-purple-50 px-1.5 py-0.5 text-[10px] text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                                                        파트너
                                                                    </span>
                                                                )}
                                                            </button>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <p className="text-[11px] font-medium text-gray-400 dark:text-[#6b6b7a]">
                                        해설진
                                        <span className="ml-1 font-normal opacity-60">(선택)</span>
                                    </p>
                                    {metaForm.commentators.length > 0 && (
                                        <div className="space-y-1">
                                            {metaForm.commentators.map((commentator: CommentatorItem, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 dark:border-[#3a3a44] dark:bg-[#1a1a23]"
                                                >
                                                    {commentator.avatarUrl !== null && commentator.avatarUrl.length > 0 && (
                                                        <img src={commentator.avatarUrl} alt={commentator.name} className="h-5 w-5 shrink-0 rounded-full" />
                                                    )}
                                                    <span className="min-w-0 flex-1 truncate text-xs text-gray-700 dark:text-[#efeff1]">
                                                        {commentator.name}
                                                        {commentator.isPartner && <span className="ml-1.5 text-[10px] text-purple-500">파트너</span>}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onSetMetaForm((previous) => ({
                                                                ...previous,
                                                                commentators: previous.commentators.filter((_, commentatorIndex) => commentatorIndex !== index),
                                                            }))
                                                        }
                                                        className="shrink-0 text-gray-400 hover:text-red-500"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={commentatorSelectedId !== undefined ? '' : commentatorSearchInput}
                                            onChange={(event) => {
                                                onSetCommentatorSearchInput(event.target.value)
                                                onSetCommentatorSelectedId(undefined)
                                            }}
                                            placeholder="추가할 스트리머 검색"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                        />
                                        {commentatorSelectedId === undefined && commentatorSearchInput.trim().length > 0 && (
                                            <div className="absolute z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-[#3a3a44] dark:bg-[#26262e]">
                                                {isCommentatorFetching && <p className="px-3 py-2 text-xs text-gray-500">검색 중...</p>}
                                                {!isCommentatorFetching && (commentatorSuggestions?.length ?? 0) === 0 && (
                                                    <p className="px-3 py-2 text-xs text-gray-500">결과 없음</p>
                                                )}
                                                {!isCommentatorFetching &&
                                                    commentatorSuggestions?.map((streamer) => (
                                                        <button
                                                            key={streamer.id}
                                                            type="button"
                                                            onMouseDown={(event) => event.preventDefault()}
                                                            onClick={() => {
                                                                const alreadyAdded = metaForm.commentators.some((commentator) => commentator.streamerId === streamer.id)
                                                                if (!alreadyAdded) {
                                                                    onSetMetaForm((previous) => ({
                                                                        ...previous,
                                                                        commentators: [
                                                                            ...previous.commentators,
                                                                            {
                                                                                name: streamer.name,
                                                                                avatarUrl: streamer.channelImageUrl ?? null,
                                                                                channelUrl: toNullableChannelUrl(streamer.channelId),
                                                                                isPartner: streamer.isPartner,
                                                                                streamerId: streamer.id,
                                                                            },
                                                                        ],
                                                                    }))
                                                                }
                                                                onSetCommentatorSearchInput('')
                                                                onSetCommentatorSelectedId(undefined)
                                                            }}
                                                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-gray-50 dark:hover:bg-[#3a3a44]"
                                                        >
                                                            {streamer.channelImageUrl !== null && (
                                                                <img src={streamer.channelImageUrl} alt={streamer.name} className="h-5 w-5 rounded-full" />
                                                            )}
                                                            <span className="text-gray-800 dark:text-[#efeff1]">{streamer.name}</span>
                                                            {streamer.isPartner && (
                                                                <span className="ml-auto rounded-full bg-purple-50 px-1.5 py-0.5 text-[10px] text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                                                    파트너
                                                                </span>
                                                            )}
                                                        </button>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-[#2e2e38] dark:bg-[#20202a]">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-xs font-semibold text-gray-500 dark:text-[#adadb8]">부가 설명</p>
                                <label className="flex cursor-pointer items-center gap-1.5">
                                    <input
                                        type="checkbox"
                                        checked={metaForm.showDescription}
                                        onChange={(event) =>
                                            onSetMetaForm((previous) => ({
                                                ...previous,
                                                showDescription: event.target.checked,
                                            }))
                                        }
                                        className="rounded"
                                    />
                                    <span className="text-xs text-gray-600 dark:text-[#efeff1]">표시</span>
                                </label>
                            </div>
                            <textarea
                                value={metaForm.description}
                                onChange={(event) =>
                                    onSetMetaForm((previous) => ({
                                        ...previous,
                                        description: event.target.value,
                                    }))
                                }
                                placeholder="대회 관련 부가 안내사항을 입력하세요 (선택)"
                                rows={3}
                                className="w-full resize-y rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                            />
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-[#2e2e38] dark:bg-[#20202a]">
                            <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-[#adadb8]">추가 링크</p>
                            <div className="space-y-2">
                                {metaForm.links.map((link, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={link.label}
                                            onChange={(event) =>
                                                onSetMetaForm((previous) => ({
                                                    ...previous,
                                                    links: previous.links.map((item, linkIndex) =>
                                                        linkIndex === index
                                                            ? {
                                                                  ...item,
                                                                  label: event.target.value,
                                                              }
                                                            : item,
                                                    ),
                                                }))
                                            }
                                            placeholder="레이블"
                                            className="w-28 shrink-0 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                        />
                                        <input
                                            type="url"
                                            value={link.url}
                                            onChange={(event) =>
                                                onSetMetaForm((previous) => ({
                                                    ...previous,
                                                    links: previous.links.map((item, linkIndex) =>
                                                        linkIndex === index
                                                            ? {
                                                                  ...item,
                                                                  url: event.target.value,
                                                              }
                                                            : item,
                                                    ),
                                                }))
                                            }
                                            placeholder="URL"
                                            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onSetMetaForm((previous) => ({
                                                    ...previous,
                                                    links: previous.links.filter((_, linkIndex) => linkIndex !== index),
                                                }))
                                            }
                                            className="shrink-0 text-gray-400 hover:text-red-500"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() =>
                                        onSetMetaForm((previous) => ({
                                            ...previous,
                                            links: [...previous.links, { label: '', url: '' }],
                                        }))
                                    }
                                    className="mt-1 text-xs text-blue-500 hover:text-blue-600"
                                >
                                    + 링크 추가
                                </button>
                            </div>
                        </div>

                        <PromotionSetupPanel
                            createPromotionPending={createPromotionPending}
                            draggingPanelId={draggingPanelId}
                            hoveredPanelId={hoveredPanelId}
                            isPromotionLoading={isPromotionLoading}
                            hasPromotionData={hasPromotionData}
                            sortedPanels={sortedPanels}
                            onCreatePromotion={() => {
                                void onCreatePromotion()
                            }}
                            onDragStartPanel={onSetDraggingPanelId}
                            onDragEndPanel={() => {
                                onSetDraggingPanelId(null)
                                onSetHoveredPanelId(null)
                            }}
                            onDragOverPanel={onSetHoveredPanelId}
                            onDropPanel={(panelId) => {
                                void onDropPanel(panelId)
                            }}
                            onTogglePanelVisibility={(panelId) => {
                                void onTogglePanelVisibility(panelId)
                            }}
                            onTogglePanelDefaultExpanded={(panelId) => {
                                void onTogglePanelDefaultExpanded(panelId)
                            }}
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => onSetShowMetaEditor(false)}
                                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-gray-50 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:bg-[#26262e]"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                disabled={updateTournamentPending}
                                className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
                            >
                                {updateTournamentPending ? '저장 중...' : '메타 저장'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </section>
    )
}
