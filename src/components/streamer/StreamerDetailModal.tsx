import { useEffect, useState } from 'react'
import { Check, ExternalLink, Tag, Trash2, X } from 'lucide-react'
import type { AffiliationItem, StreamerItem } from '../../types'
import { cn } from '../../lib/cn'
import { inputClass } from '../../constants/styles'
import { ModalOverlay } from '../ModalOverlay'
import { Avatar } from './Avatar'
import { formatFollowerCount, normalizeInput } from '../../utils/format'
import partnerMark from '../../assets/mark.png'

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
    const [selectedAffIds, setSelectedAffIds] = useState<number[]>(() => streamer.affiliations.map((a) => a.id))
    const isAnyPending = pendingNickname || pendingYoutube || pendingFanCafe || pendingAffiliations || pendingDelete

    const currentAffIds = new Set(streamer.affiliations.map((a) => a.id))
    const hasAffiliationChanges = selectedAffIds.length !== currentAffIds.size || selectedAffIds.some((id) => !currentAffIds.has(id))

    useEffect(() => {
        setNickname(streamer.nickname ?? '')
        setYoutubeUrl(streamer.youtubeUrl ?? '')
        setFanCafeUrl(streamer.fanCafeUrl ?? '')
        setSelectedAffIds(streamer.affiliations.map((a) => a.id))
    }, [streamer])

    const channelLink = streamer.channelId ? `https://chzzk.naver.com/${streamer.channelId}` : null

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
                            <div className="flex items-center gap-2">
                                <p className="truncate text-lg font-bold text-[#efeff1]">{streamer.name}</p>
                                {streamer.isPartner && <img src={partnerMark} alt="파트너" className="h-5 w-5 shrink-0" />}
                            </div>
                            {streamer.nickname !== null && streamer.nickname !== streamer.name && (
                                <p className="mt-0.5 truncate text-sm text-[#adadb8]">{streamer.nickname}</p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
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
                        <label className="text-xs font-medium text-[#adadb8]">닉네임</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={nickname}
                                onChange={(event) => setNickname(event.target.value)}
                                className={inputClass}
                                placeholder="노출할 닉네임"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    void onSaveNickname(streamer.id, normalizeInput(nickname))
                                }}
                                disabled={pendingNickname}
                                className="cursor-pointer inline-flex shrink-0 items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                            >
                                <Check className="h-4 w-4" /> 저장
                            </button>
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
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-1.5 text-xs font-medium text-[#adadb8]">
                                <Tag className="h-3.5 w-3.5" /> 소속
                            </label>
                            {hasAffiliationChanges && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        void onSaveAffiliations(streamer.id, selectedAffIds)
                                    }}
                                    disabled={pendingAffiliations}
                                    className="cursor-pointer inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                                >
                                    <Check className="h-3.5 w-3.5" /> 저장
                                </button>
                            )}
                        </div>
                        {allAffiliations.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {allAffiliations.map((aff) => {
                                    const selected = selectedAffIds.includes(aff.id)
                                    return (
                                        <button
                                            key={aff.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedAffIds((prev) =>
                                                    selected ? prev.filter((id) => id !== aff.id) : [...prev, aff.id],
                                                )
                                            }}
                                            disabled={pendingAffiliations}
                                            className={cn(
                                                'cursor-pointer rounded-full border px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50',
                                                selected
                                                    ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
                                                    : 'border-[#3a3a44] bg-[#26262e] text-[#adadb8] hover:bg-[#32323d]',
                                            )}
                                        >
                                            {aff.name}
                                        </button>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-[#848494]">등록된 소속이 없습니다.</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-medium text-[#adadb8]">외부 링크</p>
                        <div className="flex flex-wrap gap-2">
                            <a
                                href={channelLink ?? undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition',
                                    channelLink
                                        ? 'cursor-pointer border-[#3a3a44] bg-[#26262e] text-[#efeff1] hover:border-green-500/50 hover:text-green-300'
                                        : 'pointer-events-none border-[#3a3a44]/50 bg-[#26262e]/40 text-[#848494]',
                                )}
                            >
                                <span className={cn('h-2 w-2 rounded-full', channelLink ? 'bg-green-400' : 'bg-[#848494]')} />
                                치지직
                                <ExternalLink className="h-3 w-3" />
                            </a>
                            <a
                                href={streamer.youtubeUrl && streamer.youtubeUrl.trim().length > 0 ? streamer.youtubeUrl : undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition',
                                    streamer.youtubeUrl
                                        ? 'cursor-pointer border-[#3a3a44] bg-[#26262e] text-[#efeff1] hover:border-red-500/50 hover:text-red-300'
                                        : 'pointer-events-none border-[#3a3a44]/50 bg-[#26262e]/40 text-[#848494]',
                                )}
                            >
                                <span className={cn('h-2 w-2 rounded-full', streamer.youtubeUrl ? 'bg-red-400' : 'bg-[#848494]')} />
                                유튜브
                                <ExternalLink className="h-3 w-3" />
                            </a>
                            <a
                                href={streamer.fanCafeUrl && streamer.fanCafeUrl.trim().length > 0 ? streamer.fanCafeUrl : undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition',
                                    streamer.fanCafeUrl
                                        ? 'cursor-pointer border-[#3a3a44] bg-[#26262e] text-[#efeff1] hover:border-emerald-500/50 hover:text-emerald-300'
                                        : 'pointer-events-none border-[#3a3a44]/50 bg-[#26262e]/40 text-[#848494]',
                                )}
                            >
                                <span className={cn('h-2 w-2 rounded-full', streamer.fanCafeUrl ? 'bg-emerald-400' : 'bg-[#848494]')} />
                                팬카페
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>
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
