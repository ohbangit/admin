import { useEffect, useState } from 'react'
import { Check, ExternalLink, Pencil, Rss, Tag, Trash2, X } from 'lucide-react'
import type { AffiliationItem, StreamerItem } from '../../types'
import { cn } from '../../lib/cn'
import { inputClass, selectClass } from '../../constants/styles'
import { ModalOverlay } from '../ModalOverlay'
import { Avatar } from './Avatar'
import { formatFollowerCount, normalizeInput } from '../../utils/format'
import {
    useAdminToast,
    useCreateScheduleSource,
    useDeleteScheduleSource,
    useScheduleSources,
    useToggleScheduleSourceActive,
    useUpdateScheduleSource,
} from '../../hooks'
import { getErrorMessage } from '../../utils/error'
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

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const

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
    const { addToast } = useAdminToast()
    const { data: sources = [], isLoading: isSourcesLoading } = useScheduleSources(streamer.id)
    const createSourceMutation = useCreateScheduleSource()
    const deleteSourceMutation = useDeleteScheduleSource()
    const toggleSourceMutation = useToggleScheduleSourceActive()
    const updateSourceMutation = useUpdateScheduleSource()
    const [nickname, setNickname] = useState(streamer.nickname ?? '')
    const [youtubeUrl, setYoutubeUrl] = useState(streamer.youtubeUrl ?? '')
    const [fanCafeUrl, setFanCafeUrl] = useState(streamer.fanCafeUrl ?? '')
    const [selectedAffIds, setSelectedAffIds] = useState<number[]>(() => streamer.affiliations.map((a) => a.id))
    const [isAddingSource, setIsAddingSource] = useState(false)
    const [newSourceIdentifier, setNewSourceIdentifier] = useState('')
    const [newSourceDays, setNewSourceDays] = useState<number[]>([1])
    const [newSourceHour, setNewSourceHour] = useState('6')
    const [editingSourceId, setEditingSourceId] = useState<number | null>(null)
    const [editingSourceIdentifier, setEditingSourceIdentifier] = useState('')
    const [editingSourceDays, setEditingSourceDays] = useState<number[]>([1])
    const [editingSourceHour, setEditingSourceHour] = useState('6')
    const [isEditingNickname, setIsEditingNickname] = useState(false)
    const isSourcePending =
        createSourceMutation.isPending || deleteSourceMutation.isPending || toggleSourceMutation.isPending || updateSourceMutation.isPending
    const isAnyPending = pendingNickname || pendingYoutube || pendingFanCafe || pendingAffiliations || pendingDelete || isSourcePending

    const currentAffIds = new Set(streamer.affiliations.map((a) => a.id))
    const hasAffiliationChanges = selectedAffIds.length !== currentAffIds.size || selectedAffIds.some((id) => !currentAffIds.has(id))

     useEffect(() => {
         setNickname(streamer.nickname ?? '')
         setYoutubeUrl(streamer.youtubeUrl ?? '')
         setFanCafeUrl(streamer.fanCafeUrl ?? '')
         setSelectedAffIds(streamer.affiliations.map((a) => a.id))
           setIsAddingSource(false)
           setNewSourceIdentifier('')
           setNewSourceDays([1])
           setNewSourceHour('6')
           setEditingSourceId(null)
           setEditingSourceIdentifier('')
           setEditingSourceDays([1])
           setEditingSourceHour('6')
           setIsEditingNickname(false)
       }, [streamer])

    const channelLink = streamer.channelId ? `https://chzzk.naver.com/${streamer.channelId}` : null
    const displayName = streamer.nickname !== null && streamer.nickname !== streamer.name ? streamer.nickname : streamer.name
    const hasCustomNickname = streamer.nickname !== null && streamer.nickname !== streamer.name

     async function handleCreateSource(): Promise<void> {
          const sourceIdentifier = newSourceIdentifier.trim()
          const crawlHour = Number(newSourceHour)

          if (sourceIdentifier.length === 0) {
              addToast({ message: '식별자를 입력해주세요.', variant: 'error' })
              return
          }

          if (newSourceDays.length === 0) {
              addToast({ message: '요일을 하나 이상 선택해주세요.', variant: 'error' })
              return
          }

          if (!Number.isInteger(crawlHour) || crawlHour < 0 || crawlHour > 23) {
              addToast({ message: '시간을 선택해주세요.', variant: 'error' })
              return
          }

          try {
                await createSourceMutation.mutateAsync({
                    streamer_id: streamer.id,
                    source_type: 'chzzk_community',
                    source_identifier: sourceIdentifier,
                    crawl_days: [...newSourceDays].sort((a, b) => a - b),
                    crawl_hour: crawlHour,
                })
                addToast({ message: '수집 소스를 생성했습니다.', variant: 'success' })
                setIsAddingSource(false)
                setNewSourceIdentifier('')
                setNewSourceDays([1])
                setNewSourceHour('6')
          } catch (error) {
             const message = getErrorMessage(error)
             if (message !== null) {
                 addToast({ message, variant: 'error' })
             }
         }
     }

    async function handleToggleSource(id: number, isActive: boolean): Promise<void> {
        try {
            await toggleSourceMutation.mutateAsync({ id, is_active: !isActive })
            addToast({ message: isActive ? '수집 소스를 비활성화했습니다.' : '수집 소스를 활성화했습니다.', variant: 'success' })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) {
                addToast({ message, variant: 'error' })
            }
        }
    }

     async function handleDeleteSource(id: number): Promise<void> {
         try {
             await deleteSourceMutation.mutateAsync(id)
             addToast({ message: '수집 소스를 삭제했습니다.', variant: 'success' })
               if (editingSourceId === id) {
                   setEditingSourceId(null)
                   setEditingSourceIdentifier('')
                   setEditingSourceDays([1])
                   setEditingSourceHour('6')
               }
         } catch (error) {
             const message = getErrorMessage(error)
             if (message !== null) {
                 addToast({ message, variant: 'error' })
             }
         }
     }

      async function handleUpdateSource(): Promise<void> {
          if (editingSourceId === null) {
              return
          }

          const sourceIdentifier = editingSourceIdentifier.trim()
          const crawlHour = Number(editingSourceHour)

          if (sourceIdentifier.length === 0) {
              addToast({ message: '식별자를 입력해주세요.', variant: 'error' })
              return
          }

          if (editingSourceDays.length === 0) {
              addToast({ message: '요일을 하나 이상 선택해주세요.', variant: 'error' })
              return
          }

          if (!Number.isInteger(crawlHour) || crawlHour < 0 || crawlHour > 23) {
              addToast({ message: '시간을 선택해주세요.', variant: 'error' })
              return
          }

          try {
                await updateSourceMutation.mutateAsync({
                    id: editingSourceId,
                    body: {
                        source_identifier: sourceIdentifier,
                        crawl_days: [...editingSourceDays].sort((a, b) => a - b),
                        crawl_hour: crawlHour,
                    },
                })
                addToast({ message: '수집 소스를 수정했습니다.', variant: 'success' })
                setEditingSourceId(null)
                setEditingSourceIdentifier('')
                setEditingSourceDays([1])
                setEditingSourceHour('6')
          } catch (error) {
             const message = getErrorMessage(error)
             if (message !== null) {
                 addToast({ message, variant: 'error' })
             }
         }
     }

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

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-1.5 text-xs font-medium text-[#adadb8]">
                                <Rss className="h-3.5 w-3.5" /> 수집 소스
                            </label>
                             {!isAddingSource && (
                                  <button
                                      type="button"
                                       onClick={() => {
                                           setIsAddingSource(true)
                                           setNewSourceIdentifier(streamer.channelId ?? '')
                                           setNewSourceDays([1])
                                           setNewSourceHour('6')
                                       }}
                                      disabled={isSourcePending}
                                      className="cursor-pointer inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                                  >
                                    소스 추가
                                </button>
                            )}
                        </div>

                         {isAddingSource && (
                             <div className="space-y-2 rounded-lg border border-[#3a3a44] bg-[#26262e] p-3">
                                 <div className="flex flex-wrap items-center gap-2">
                                     <span className="rounded-full border border-blue-500/35 bg-blue-500/15 px-2 py-1 text-xs font-semibold text-blue-300">
                                         치지직 커뮤니티
                                     </span>
                                 </div>
                                    <div className="grid gap-2">
                                        <input
                                            type="text"
                                            value={newSourceIdentifier}
                                            onChange={(event) => setNewSourceIdentifier(event.target.value)}
                                            className={inputClass}
                                            placeholder="치지직 채널 ID"
                                        />
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-[#adadb8]">요일</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {DAY_LABELS.map((label, day) => {
                                                    const selected = newSourceDays.includes(day)
                                                    return (
                                                        <button
                                                            key={day}
                                                            type="button"
                                                            onClick={() => {
                                                                setNewSourceDays((prev) =>
                                                                    selected ? prev.filter((item) => item !== day) : [...prev, day].sort((a, b) => a - b),
                                                                )
                                                            }}
                                                            className={cn(
                                                                'cursor-pointer rounded-full border px-2 py-1 text-xs font-semibold transition',
                                                                selected
                                                                    ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
                                                                    : 'border-[#3a3a44] bg-[#26262e] text-[#adadb8] hover:bg-[#32323d]',
                                                            )}
                                                        >
                                                            {label}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-[#adadb8]">시간</label>
                                            <select value={newSourceHour} onChange={(event) => setNewSourceHour(event.target.value)} className={cn(selectClass, 'w-28')}>
                                                {Array.from({ length: 24 }, (_, i) => (
                                                    <option key={i} value={i}>
                                                        {String(i).padStart(2, '0')}시
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsAddingSource(false)
                                                setNewSourceIdentifier('')
                                                setNewSourceDays([1])
                                                setNewSourceHour('6')
                                            }}
                                           disabled={isSourcePending}
                                           className="cursor-pointer rounded-xl border border-[#3a3a44] px-3 py-1.5 text-xs font-medium text-[#adadb8] transition hover:bg-[#2e2e38] disabled:opacity-50"
                                      >
                                         취소
                                     </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            void handleCreateSource()
                                        }}
                                        disabled={isSourcePending}
                                        className="cursor-pointer inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                                    >
                                        <Check className="h-3.5 w-3.5" /> 저장
                                    </button>
                                </div>
                            </div>
                        )}

                        {isSourcesLoading ? (
                            <p className="text-xs text-[#848494]">수집 소스 불러오는 중...</p>
                        ) : sources.length > 0 ? (
                            <div className="space-y-2">
                                  {sources.map((source) => {
                                      const isEditing = editingSourceId === source.id
                                      const sourceScheduleLabel = `${source.crawl_days.map((day) => DAY_LABELS[day]).join('·')} ${String(source.crawl_hour).padStart(2, '0')}시`

                                    return (
                                        <div key={source.id} className="space-y-2 rounded-lg border border-[#3a3a44] bg-[#26262e] px-3 py-2">
                                             <div className="flex items-center gap-2">
                                                 <span className="rounded-full border border-blue-500/35 bg-blue-500/15 px-2 py-1 text-[11px] font-semibold text-blue-300">
                                                     치지직 커뮤니티
                                                 </span>
                                                  <span className="min-w-0 flex-1 truncate text-xs text-[#efeff1]" title={source.source_identifier}>
                                                      {source.source_identifier}
                                                  </span>
                                                    <span className="text-[11px] text-[#848494]">{sourceScheduleLabel}</span>
                                                  <button
                                                     type="button"
                                                     onClick={() => {
                                                         void handleToggleSource(source.id, source.is_active)
                                                    }}
                                                    disabled={isSourcePending}
                                                    className={cn(
                                                        'cursor-pointer rounded-full border px-2 py-1 text-[11px] font-semibold transition disabled:opacity-50',
                                                        source.is_active
                                                            ? 'border-emerald-500/35 bg-emerald-500/15 text-emerald-300'
                                                            : 'border-[#3a3a44] bg-[#26262e] text-[#adadb8]',
                                                    )}
                                                >
                                                    {source.is_active ? '활성' : '비활성'}
                                                </button>
                                                <button
                                                    type="button"
                                                       onClick={() => {
                                                            if (isEditing) {
                                                                setEditingSourceId(null)
                                                                setEditingSourceIdentifier('')
                                                                setEditingSourceDays([1])
                                                                setEditingSourceHour('6')
                                                                return
                                                            }
                                                            setEditingSourceId(source.id)
                                                            setEditingSourceIdentifier(source.source_identifier)
                                                            setEditingSourceDays([...source.crawl_days].sort((a, b) => a - b))
                                                            setEditingSourceHour(String(source.crawl_hour))
                                                        }}
                                                     disabled={isSourcePending}
                                                     className="cursor-pointer rounded-lg border border-[#3a3a44] px-2 py-1 text-[11px] font-medium text-[#adadb8] transition hover:bg-[#32323d] disabled:opacity-50"
                                                >
                                                    {isEditing ? '취소' : '수정'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        void handleDeleteSource(source.id)
                                                    }}
                                                    disabled={isSourcePending}
                                                    className="cursor-pointer rounded-lg border border-red-500/35 p-1.5 text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                                                    aria-label="소스 삭제"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>

                                              {isEditing && (
                                                  <div className="space-y-2">
                                                      <input
                                                          type="text"
                                                          value={editingSourceIdentifier}
                                                          onChange={(event) => setEditingSourceIdentifier(event.target.value)}
                                                          className={inputClass}
                                                          placeholder="치지직 채널 ID"
                                                      />
                                                       <div className="space-y-2">
                                                            <label className="text-xs font-medium text-[#adadb8]">요일</label>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {DAY_LABELS.map((label, day) => {
                                                                    const selected = editingSourceDays.includes(day)
                                                                    return (
                                                                        <button
                                                                            key={day}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setEditingSourceDays((prev) =>
                                                                                    selected
                                                                                        ? prev.filter((item) => item !== day)
                                                                                        : [...prev, day].sort((a, b) => a - b),
                                                                                )
                                                                            }}
                                                                            className={cn(
                                                                                'cursor-pointer rounded-full border px-2 py-1 text-xs font-semibold transition',
                                                                                selected
                                                                                    ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
                                                                                    : 'border-[#3a3a44] bg-[#26262e] text-[#adadb8] hover:bg-[#32323d]',
                                                                            )}
                                                                        >
                                                                            {label}
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-medium text-[#adadb8]">시간</label>
                                                            <select
                                                                value={editingSourceHour}
                                                                onChange={(event) => setEditingSourceHour(event.target.value)}
                                                                className={cn(selectClass, 'w-28')}
                                                            >
                                                                {Array.from({ length: 24 }, (_, i) => (
                                                                    <option key={i} value={i}>
                                                                        {String(i).padStart(2, '0')}시
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                      <div className="flex justify-end">
                                                          <button
                                                             type="button"
                                                             onClick={() => {
                                                                 void handleUpdateSource()
                                                             }}
                                                             disabled={isSourcePending}
                                                             className="cursor-pointer inline-flex items-center justify-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                                                         >
                                                             <Check className="h-3.5 w-3.5" /> 저장
                                                         </button>
                                                      </div>
                                                  </div>
                                             )}
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-[#848494]">등록된 수집 소스가 없습니다.</p>
                        )}
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
