import { useState } from 'react'
import partnerMark from '../../assets/mark.png'
import { cn } from '../../lib/cn'
import {
    useAffiliations,
    useSyncStreamer,
    useUpdateFanCafeUrl,
    useUpdateNickname,
    useUpdateStreamerAffiliations,
    useUpdateYoutubeUrl,
} from '../../hooks'
import { getAffiliationColor } from '../../types'
import type {
    EditingField,
    FieldRowProps,
    StreamerAvatarProps,
    StreamerDetailModalProps,
} from '../../types/streamersManage'
import { getErrorMessage } from '../../utils/error'
import { InlineEditForm } from './InlineEditForm'

function StreamerAvatar({ src, name, size }: StreamerAvatarProps) {
    if (src) {
        return (
            <img
                src={src}
                alt={name}
                width={size}
                height={size}
                className="rounded-full object-cover"
                style={{ width: size, height: size }}
            />
        )
    }

    return (
        <div
            className="flex shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-[#26262e]"
            style={{ width: size, height: size }}
        >
            <svg
                width={size * 0.5}
                height={size * 0.5}
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-gray-400 dark:text-[#848494]"
            >
                <path d="M12 12c2.67 0 4.8-2.13 4.8-4.8S14.67 2.4 12 2.4 7.2 4.53 7.2 7.2 9.33 12 12 12zm0 2.4c-3.2 0-9.6 1.61-9.6 4.8v2.4h19.2v-2.4c0-3.19-6.4-4.8-9.6-4.8z" />
            </svg>
        </div>
    )
}

function FieldRow({ label, children }: FieldRowProps) {
    return (
        <div className="px-5 py-3.5">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-[#848494]">{label}</p>
            {children}
        </div>
    )
}

export function StreamerDetailModal({ streamer, onClose }: StreamerDetailModalProps) {
    const [editing, setEditing] = useState<EditingField>(null)
    const [channelInput, setChannelInput] = useState('')
    const [youtubeInput, setYoutubeInput] = useState(streamer.youtubeUrl ?? '')
    const [fanCafeInput, setFanCafeInput] = useState(streamer.fanCafeUrl ?? '')
    const [nicknameInput, setNicknameInput] = useState(streamer.nickname)
    const [selectedAffiliationIds, setSelectedAffiliationIds] = useState<number[]>(streamer.affiliations.map((affiliation) => affiliation.id))

    const sync = useSyncStreamer(streamer.id)
    const updateYoutube = useUpdateYoutubeUrl(streamer.channelId ?? '')
    const updateFanCafe = useUpdateFanCafeUrl(streamer.channelId ?? '')
    const updateNickname = useUpdateNickname(streamer.id)
    const updateAffiliations = useUpdateStreamerAffiliations(streamer.id)
    const { data: affiliationsData } = useAffiliations()
    const allAffiliations = affiliationsData?.affiliations ?? []

    function cancelEdit() {
        setEditing(null)
        setChannelInput('')
        setYoutubeInput(streamer.youtubeUrl ?? '')
        setFanCafeInput(streamer.fanCafeUrl ?? '')
        setNicknameInput(streamer.nickname)
        setSelectedAffiliationIds(streamer.affiliations.map((affiliation) => affiliation.id))
        sync.reset()
        updateYoutube.reset()
        updateFanCafe.reset()
        updateNickname.reset()
        updateAffiliations.reset()
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/70"
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose()
            }}
        >
            <div className="w-full max-w-md overflow-hidden rounded-xl border border-gray-300 bg-white shadow-2xl dark:border-[#3a3a44] dark:bg-[#1a1a23]">
                <div className="flex items-center gap-3.5 border-b border-gray-200 px-5 py-4 dark:border-[#3a3a44]">
                    <StreamerAvatar src={streamer.channelImageUrl} name={streamer.nickname} size={48} />
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <span className="truncate text-base font-semibold text-gray-900 dark:text-[#efeff1]">{streamer.nickname}</span>
                            {streamer.isPartner && <img src={partnerMark} alt="파트너" className="h-4 w-4 shrink-0" />}
                        </div>
                        {streamer.nickname !== streamer.name && (
                            <p className="mt-0.5 truncate text-xs text-gray-400 dark:text-[#848494]">{streamer.name}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="shrink-0 rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:text-[#848494] dark:hover:bg-[#26262e] dark:hover:text-[#adadb8]"
                        aria-label="닫기"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-[#3a3a44]">
                    <FieldRow label="채널 ID">
                        {editing === 'channel' ? (
                            <InlineEditForm
                                value={channelInput}
                                onChange={setChannelInput}
                                onSave={(event) => {
                                    event.preventDefault()
                                    if (channelInput.trim().length === 0) return
                                    sync.mutate({ channelId: channelInput.trim() }, { onSuccess: onClose })
                                }}
                                onCancel={cancelEdit}
                                placeholder="채널 ID 입력"
                                isPending={sync.isPending}
                                saveLabel="연결"
                                error={sync.error}
                            />
                        ) : (
                            <div className="flex items-center justify-between">
                                <span
                                    className={cn(
                                        'font-mono text-sm',
                                        streamer.channelId ? 'text-gray-900 dark:text-[#efeff1]' : 'text-red-400 dark:text-red-400',
                                    )}
                                >
                                    {streamer.channelId ?? '미연결'}
                                </span>
                                <button
                                    onClick={() => setEditing('channel')}
                                    className="ml-3 shrink-0 text-xs text-gray-400 transition hover:text-gray-700 dark:text-[#848494] dark:hover:text-[#efeff1]"
                                >
                                    {streamer.channelId ? '변경' : '채널 연결 →'}
                                </button>
                            </div>
                        )}
                    </FieldRow>

                    <FieldRow label="닉네임">
                        {editing === 'nickname' ? (
                            <InlineEditForm
                                value={nicknameInput}
                                onChange={setNicknameInput}
                                onSave={(event) => {
                                    event.preventDefault()
                                    if (nicknameInput.trim().length === 0) return
                                    updateNickname.mutate(
                                        { nickname: nicknameInput.trim() },
                                        {
                                            onSuccess: () => setEditing(null),
                                        },
                                    )
                                }}
                                onCancel={cancelEdit}
                                placeholder="닉네임 입력"
                                isPending={updateNickname.isPending}
                                saveLabel="저장"
                                error={updateNickname.error}
                            />
                        ) : (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-900 dark:text-[#efeff1]">{streamer.nickname}</span>
                                <button
                                    onClick={() => setEditing('nickname')}
                                    className="ml-3 shrink-0 text-xs text-gray-400 transition hover:text-gray-700 dark:text-[#848494] dark:hover:text-[#efeff1]"
                                >
                                    수정
                                </button>
                            </div>
                        )}
                    </FieldRow>

                    <FieldRow label="유튜브 URL">
                        {editing === 'youtube' ? (
                            <InlineEditForm
                                value={youtubeInput}
                                onChange={setYoutubeInput}
                                onSave={(event) => {
                                    event.preventDefault()
                                    updateYoutube.mutate({ youtubeUrl: youtubeInput.trim() }, { onSuccess: () => setEditing(null) })
                                }}
                                onCancel={cancelEdit}
                                placeholder="https://youtube.com/..."
                                type="url"
                                isPending={updateYoutube.isPending}
                                saveLabel="저장"
                                error={updateYoutube.error}
                            />
                        ) : (
                            <div className="flex items-center justify-between">
                                {streamer.youtubeUrl ? (
                                    <a
                                        href={streamer.youtubeUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="truncate font-mono text-xs text-blue-500 hover:underline dark:text-blue-400"
                                    >
                                        {streamer.youtubeUrl}
                                    </a>
                                ) : (
                                    <span className="text-sm text-gray-400 dark:text-[#848494]">—</span>
                                )}
                                {streamer.channelId && (
                                    <button
                                        onClick={() => setEditing('youtube')}
                                        className="ml-3 shrink-0 text-xs text-gray-400 transition hover:text-gray-700 dark:text-[#848494] dark:hover:text-[#efeff1]"
                                    >
                                        수정
                                    </button>
                                )}
                            </div>
                        )}
                    </FieldRow>

                    <FieldRow label="팬카페 URL">
                        {editing === 'fanCafe' ? (
                            <InlineEditForm
                                value={fanCafeInput}
                                onChange={setFanCafeInput}
                                onSave={(event) => {
                                    event.preventDefault()
                                    updateFanCafe.mutate({ fanCafeUrl: fanCafeInput.trim() }, { onSuccess: () => setEditing(null) })
                                }}
                                onCancel={cancelEdit}
                                placeholder="https://cafe.naver.com/..."
                                type="url"
                                isPending={updateFanCafe.isPending}
                                saveLabel="저장"
                                error={updateFanCafe.error}
                            />
                        ) : (
                            <div className="flex items-center justify-between">
                                {streamer.fanCafeUrl ? (
                                    <a
                                        href={streamer.fanCafeUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="truncate font-mono text-xs text-blue-500 hover:underline dark:text-blue-400"
                                    >
                                        {streamer.fanCafeUrl}
                                    </a>
                                ) : (
                                    <span className="text-sm text-gray-400 dark:text-[#848494]">—</span>
                                )}
                                {streamer.channelId && (
                                    <button
                                        onClick={() => setEditing('fanCafe')}
                                        className="ml-3 shrink-0 text-xs text-gray-400 transition hover:text-gray-700 dark:text-[#848494] dark:hover:text-[#efeff1]"
                                    >
                                        수정
                                    </button>
                                )}
                            </div>
                        )}
                    </FieldRow>

                    <FieldRow label="소속">
                        {editing === 'affiliations' ? (
                            <div className="space-y-3">
                                {allAffiliations.length === 0 ? (
                                    <p className="text-xs text-gray-400 dark:text-[#848494]">
                                        등록된 소속이 없습니다. 소속 관리 페이지에서 먼저 소속을 추가해주세요.
                                    </p>
                                ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                        {allAffiliations.map((affiliation) => {
                                            const selectedAffiliation = selectedAffiliationIds.includes(affiliation.id)
                                            const color = getAffiliationColor(affiliation)
                                            return (
                                                <button
                                                    key={affiliation.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedAffiliationIds((prev) =>
                                                            selectedAffiliation
                                                                ? prev.filter((id) => id !== affiliation.id)
                                                                : [...prev, affiliation.id],
                                                        )
                                                    }}
                                                    className="cursor-pointer inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all"
                                                    style={{
                                                        backgroundColor: selectedAffiliation ? `${color}20` : 'transparent',
                                                        color: selectedAffiliation ? color : '#9ca3af',
                                                        outline: selectedAffiliation ? `1.5px solid ${color}60` : '1.5px solid #e5e7eb',
                                                    }}
                                                >
                                                    {selectedAffiliation && (
                                                        <svg className="h-3 w-3 shrink-0" viewBox="0 0 12 12" fill="currentColor">
                                                            <path
                                                                d="M10 3L5 8.5 2 5.5"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                fill="none"
                                                            />
                                                        </svg>
                                                    )}
                                                    {affiliation.name}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                                <div className="flex items-center justify-between border-t border-gray-100 pt-2 dark:border-[#2e2e38]">
                                    <span className="text-[11px] text-gray-400 dark:text-[#848494]">
                                        {selectedAffiliationIds.length > 0 ? `${selectedAffiliationIds.length}개 선택됨` : '선택된 소속 없음'}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="h-7 rounded-md border border-gray-300 px-3 text-xs font-medium text-gray-500 transition hover:bg-gray-50 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:bg-[#2e2e38]"
                                        >
                                            취소
                                        </button>
                                        <button
                                            type="button"
                                            disabled={updateAffiliations.isPending}
                                            onClick={() => {
                                                updateAffiliations.mutate(
                                                    { affiliationIds: selectedAffiliationIds },
                                                    { onSuccess: () => setEditing(null) },
                                                )
                                            }}
                                            className="h-7 rounded-md bg-gray-900 px-3 text-xs font-medium text-white transition hover:bg-gray-700 disabled:opacity-40 dark:bg-[#efeff1] dark:text-[#0e0e10] dark:hover:bg-[#adadb8]"
                                        >
                                            {updateAffiliations.isPending ? '…' : '저장'}
                                        </button>
                                    </div>
                                </div>
                                {updateAffiliations.error !== null && (
                                    <p className="text-[11px] text-red-500 dark:text-red-400">{getErrorMessage(updateAffiliations.error)}</p>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex min-h-[22px] flex-wrap gap-1">
                                    {streamer.affiliations.length > 0 ? (
                                        streamer.affiliations.map((affiliation) => {
                                            const color = getAffiliationColor(affiliation)
                                            return (
                                                <span
                                                    key={affiliation.id}
                                                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                                    style={{
                                                        backgroundColor: `${color}20`,
                                                        color,
                                                        outline: `1.5px solid ${color}40`,
                                                    }}
                                                >
                                                    {affiliation.name}
                                                </span>
                                            )
                                        })
                                    ) : (
                                        <span className="text-sm text-gray-400 dark:text-[#848494]">—</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => setEditing('affiliations')}
                                    className="shrink-0 text-xs text-gray-400 transition hover:text-gray-700 dark:text-[#848494] dark:hover:text-[#efeff1]"
                                >
                                    수정
                                </button>
                            </div>
                        )}
                    </FieldRow>

                    <FieldRow label="팸로워 수">
                        <span className="text-sm text-gray-900 dark:text-[#efeff1]">
                            {streamer.followerCount != null ? streamer.followerCount.toLocaleString() : '—'}
                        </span>
                    </FieldRow>

                    <FieldRow label="ID">
                        <span className="font-mono text-xs text-gray-400 dark:text-[#848494]">{streamer.id}</span>
                    </FieldRow>
                </div>
            </div>
        </div>
    )
}
