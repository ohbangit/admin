import { useEffect, useState } from 'react'
import { Check, ExternalLink, Pencil, Trash2, X } from 'lucide-react'
import type { AffiliationItem, StreamerItem } from '../../types'
import { cn } from '../../lib/cn'
import { inputClass } from '../../constants/styles'
import { ModalOverlay } from '../ModalOverlay'
import { Avatar } from './Avatar'
import { AffiliationSection } from './AffiliationSection'
import { ScheduleSourceSection } from './ScheduleSourceSection'
import { formatFollowerCount, normalizeInput } from '../../utils/format'
import partnerMark from '../../assets/mark.png'
import chzzkIcon from '../../assets/chzzk_icon.png'

interface StreamerDetailModalProps {
    streamer: StreamerItem
    allAffiliations: AffiliationItem[]
    pendingNickname: boolean
    pendingYoutube: boolean
    pendingFanCafe: boolean
    pendingAffiliations: boolean
    pendingDelete: boolean
    onClose: () => void
    onSaveNickname: (id: number, nickname: string) => Promise<void>
    onSaveYoutubeUrl: (channelId: string, youtubeUrl: string) => Promise<void>
    onSaveFanCafeUrl: (channelId: string, fanCafeUrl: string) => Promise<void>
    onSaveAffiliations: (id: number, affiliationIds: number[]) => Promise<void>
    onDelete: () => void
}

export function StreamerDetailModal({
    streamer,
    allAffiliations,
    pendingNickname,
    pendingYoutube,
    pendingFanCafe,
    pendingAffiliations,
    pendingDelete,
    onClose,
    onSaveNickname,
    onSaveYoutubeUrl,
    onSaveFanCafeUrl,
    onSaveAffiliations,
    onDelete,
}: StreamerDetailModalProps) {
    const [nickname, setNickname] = useState(streamer.nickname ?? '')
    const [youtubeUrl, setYoutubeUrl] = useState(streamer.youtubeUrl ?? '')
    const [fanCafeUrl, setFanCafeUrl] = useState(streamer.fanCafeUrl ?? '')
    const [isEditingNickname, setIsEditingNickname] = useState(false)
    const [isSourcePending, setIsSourcePending] = useState(false)
    const isAnyPending = pendingNickname || pendingYoutube || pendingFanCafe || pendingAffiliations || pendingDelete || isSourcePending

    useEffect(() => {
        setNickname(streamer.nickname ?? '')
        setYoutubeUrl(streamer.youtubeUrl ?? '')
        setFanCafeUrl(streamer.fanCafeUrl ?? '')
        setIsEditingNickname(false)
        setIsSourcePending(false)
    }, [streamer])

    const channelLink = streamer.channelId ? `https://chzzk.naver.com/${streamer.channelId}` : null
    const displayName = streamer.nickname !== null && streamer.nickname !== streamer.name ? streamer.nickname : streamer.name
    const hasCustomNickname = streamer.nickname !== null && streamer.nickname !== streamer.name

    return (
        <ModalOverlay size="2xl" disabled={isAnyPending} onClose={onClose}>
            <div className="flex items-start justify-between gap-3 border-b border-[#3a3a44] px-6 py-4">
                <div>
                    <h2 className="text-base font-bold text-[#efeff1]">스트리머 상세 정보</h2>
                    <p className="mt-1 text-xs text-[#adadb8]">기본 정보와 URL, 닉네임을 수정할 수 있습니다.</p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isAnyPending}
                    className="cursor-pointer rounded-lg border border-[#3a3a44] p-1.5 text-[#adadb8] transition hover:bg-[#26262e] disabled:opacity-50"
                    aria-label="닫기"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="space-y-5 px-6 py-5">
                <div className="flex items-start gap-4">
                    <Avatar streamer={streamer} sizeClass="h-18 w-18" textClass="text-lg" />
                    <div className="min-w-0 flex-1">
                        {isEditingNickname ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(event) => setNickname(event.target.value)}
                                    className={cn(inputClass, 'text-lg font-bold')}
                                    placeholder="닉네임 입력"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        void onSaveNickname(streamer.id, normalizeInput(nickname))
                                        setIsEditingNickname(false)
                                    }}
                                    disabled={pendingNickname}
                                    className="cursor-pointer shrink-0 rounded-lg bg-blue-600 p-1.5 text-white transition hover:bg-blue-500 disabled:opacity-50"
                                >
                                    <Check className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNickname(streamer.nickname ?? '')
                                        setIsEditingNickname(false)
                                    }}
                                    className="cursor-pointer shrink-0 rounded-lg border border-[#3a3a44] p-1.5 text-[#adadb8] transition hover:bg-[#26262e]"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <p className="truncate text-lg font-bold text-[#efeff1]">{displayName}</p>
                                {streamer.isPartner && <img src={partnerMark} alt="파트너" className="h-5 w-5 shrink-0" />}
                                <button
                                    type="button"
                                    onClick={() => setIsEditingNickname(true)}
                                    className="cursor-pointer shrink-0 rounded-lg p-1 text-[#848494] transition hover:bg-[#26262e] hover:text-[#adadb8]"
                                    aria-label="닉네임 편집"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                        {hasCustomNickname && !isEditingNickname && <p className="mt-0.5 text-xs text-[#848494]">본명: {streamer.name}</p>}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            {channelLink !== null && (
                                <a
                                    href={channelLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cursor-pointer inline-flex items-center gap-1 rounded-full border border-[#3a3a44] bg-[#26262e] px-2.5 py-1 text-xs text-[#efeff1] transition hover:border-green-500/50 hover:text-green-300"
                                >
                                    <img src={chzzkIcon} alt="치지직" className="h-4 w-4" />
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                            <span className="rounded-full border border-[#3a3a44] bg-[#26262e] px-2.5 py-1 text-xs text-[#efeff1]">
                                팔로워 {formatFollowerCount(streamer.followerCount)}
                            </span>
                            {streamer.affiliations.length > 0 &&
                                streamer.affiliations.map((aff) => (
                                    <span key={aff.id} className="rounded-full border border-[#3a3a44] bg-[#26262e] px-2.5 py-1 text-xs text-[#adadb8]">
                                        {aff.name}
                                    </span>
                                ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-medium text-[#adadb8]">YouTube URL</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={youtubeUrl}
                            onChange={(event) => setYoutubeUrl(event.target.value)}
                            className={inputClass}
                            placeholder="https://www.youtube.com/..."
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if (streamer.channelId) {
                                    void onSaveYoutubeUrl(streamer.channelId, normalizeInput(youtubeUrl))
                                }
                            }}
                            disabled={pendingYoutube || streamer.channelId === null}
                            className="cursor-pointer inline-flex shrink-0 items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                        >
                            <Check className="h-4 w-4" /> 저장
                        </button>
                        <a
                            href={streamer.youtubeUrl && streamer.youtubeUrl.trim().length > 0 ? streamer.youtubeUrl : undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                'inline-flex shrink-0 items-center gap-1 rounded-xl border px-3 py-2 text-sm transition',
                                streamer.youtubeUrl && streamer.youtubeUrl.trim().length > 0
                                    ? 'cursor-pointer border-[#3a3a44] text-[#adadb8] hover:border-red-500/50 hover:text-red-300'
                                    : 'pointer-events-none border-[#3a3a44]/50 text-[#848494]/50',
                            )}
                            aria-label="유튜브 열기"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-medium text-[#adadb8]">팬카페 URL</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={fanCafeUrl}
                            onChange={(event) => setFanCafeUrl(event.target.value)}
                            className={inputClass}
                            placeholder="https://cafe.naver.com/..."
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if (streamer.channelId) {
                                    void onSaveFanCafeUrl(streamer.channelId, normalizeInput(fanCafeUrl))
                                }
                            }}
                            disabled={pendingFanCafe || streamer.channelId === null}
                            className="cursor-pointer inline-flex shrink-0 items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                        >
                            <Check className="h-4 w-4" /> 저장
                        </button>
                        <a
                            href={streamer.fanCafeUrl && streamer.fanCafeUrl.trim().length > 0 ? streamer.fanCafeUrl : undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                'inline-flex shrink-0 items-center gap-1 rounded-xl border px-3 py-2 text-sm transition',
                                streamer.fanCafeUrl && streamer.fanCafeUrl.trim().length > 0
                                    ? 'cursor-pointer border-[#3a3a44] text-[#adadb8] hover:border-emerald-500/50 hover:text-emerald-300'
                                    : 'pointer-events-none border-[#3a3a44]/50 text-[#848494]/50',
                            )}
                            aria-label="팬카페 열기"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>
                </div>

                <AffiliationSection
                    streamerId={streamer.id}
                    currentAffiliations={streamer.affiliations}
                    allAffiliations={allAffiliations}
                    pending={pendingAffiliations}
                    onSave={onSaveAffiliations}
                />

                <ScheduleSourceSection
                    streamerId={streamer.id}
                    streamerName={streamer.name}
                    channelId={streamer.channelId}
                    onPendingChange={setIsSourcePending}
                />
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-[#3a3a44] px-6 py-4">
                <button
                    type="button"
                    onClick={onDelete}
                    disabled={pendingDelete}
                    className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-red-500/35 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                >
                    <Trash2 className="h-4 w-4" /> 삭제
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isAnyPending}
                    className="cursor-pointer rounded-xl border border-[#3a3a44] px-3 py-2 text-sm font-medium text-[#adadb8] transition hover:bg-[#26262e] disabled:opacity-50"
                >
                    닫기
                </button>
            </div>
        </ModalOverlay>
    )
}
