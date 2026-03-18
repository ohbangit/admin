import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Check, ExternalLink, RefreshCw, Search, Trash2, X } from 'lucide-react'
import {
    useAdminToast,
    useCreateExclusions,
    useDeleteExclusion,
    useExclusions,
    useRegisterCandidates,
    useRunDiscovery,
} from '../hooks'
import type { DiscoveryCandidate, DiscoveryCursor, StreamerExclusion } from '../types'
import partnerMark from '../assets/mark.png'
import { cn } from '../lib/cn'
import { getErrorMessage } from '../utils/error'
import { getInitial } from '../utils/format'
import { panelClass, inputClass } from '../constants/styles'
import { ConfirmModal } from '../components/ConfirmModal'
import { ListEmpty, ListError, ListLoading } from '../components/ListState'

type TabType = 'discovery' | 'exclusions'

function mergeCandidates(existing: DiscoveryCandidate[], incoming: DiscoveryCandidate[]): DiscoveryCandidate[] {
    const map = new Map(existing.map((candidate) => [candidate.channelId, candidate]))
    for (const candidate of incoming) {
        map.set(candidate.channelId, candidate)
    }
    return Array.from(map.values())
}

function removeCandidatesByChannelIds(candidates: DiscoveryCandidate[], channelIds: Set<string>): DiscoveryCandidate[] {
    return candidates.filter((candidate) => !channelIds.has(candidate.channelId))
}

interface CandidateCardProps {
    candidate: DiscoveryCandidate
    checked: boolean
    disabled: boolean
    onToggle: (channelId: string) => void
}

function CandidateCard({ candidate, checked, disabled, onToggle }: CandidateCardProps) {
    return (
        <li
            className={cn(
                'rounded-xl border bg-[#1f1f28] p-3 transition',
                checked ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/30' : 'border-[#3a3a44]',
                disabled ? 'opacity-50' : 'hover:border-[#4a4a57]',
            )}
        >
            <label className={cn('flex cursor-pointer items-center gap-3', disabled && 'cursor-not-allowed')}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(candidate.channelId)}
                    disabled={disabled}
                    className="h-4 w-4 cursor-pointer rounded disabled:cursor-not-allowed"
                />

                {candidate.channelImageUrl !== null && candidate.channelImageUrl.trim().length > 0 ? (
                    <img src={candidate.channelImageUrl} alt={`${candidate.name} 프로필`} className="h-10 w-10 rounded-full border border-[#3a3a44] object-cover" />
                ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3a3a44] bg-[#26262e] text-xs font-semibold text-[#adadb8]">
                        {getInitial(candidate.name)}
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold text-[#efeff1]">{candidate.name}</span>
                        {candidate.isPartner && <img src={partnerMark} alt="파트너" className="h-4 w-4 shrink-0" />}
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-[#848494]">{candidate.channelId}</p>
                </div>

                <a
                    href={`https://chzzk.naver.com/${candidate.channelId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 cursor-pointer rounded-lg border border-[#3a3a44] p-1.5 text-[#848494] transition hover:border-blue-500 hover:text-[#efeff1]"
                    title="방송국 이동"
                >
                    <ExternalLink className="h-3.5 w-3.5" />
                </a>
            </label>
        </li>
    )
}

export default function DiscoveryPage() {
    const { addToast } = useAdminToast()

    const runDiscoveryMutation = useRunDiscovery()
    const registerCandidatesMutation = useRegisterCandidates()
    const createExclusionsMutation = useCreateExclusions()

    const { data: exclusions = [], isLoading: exclusionsLoading, isError: exclusionsError, refetch: refetchExclusions } = useExclusions()
    const deleteExclusionMutation = useDeleteExclusion()

    const [activeTab, setActiveTab] = useState<TabType>('discovery')

    const [size, setSize] = useState('20')
    const [hasRun, setHasRun] = useState(false)
    const [candidates, setCandidates] = useState<DiscoveryCandidate[]>([])
    const [nextCursor, setNextCursor] = useState<DiscoveryCursor | null>(null)
    const [selectedChannelIds, setSelectedChannelIds] = useState<Set<string>>(new Set())

    const [searchName, setSearchName] = useState('')
    const [deletingExclusion, setDeletingExclusion] = useState<StreamerExclusion | null>(null)

    const selectedCandidates = useMemo(() => {
        if (selectedChannelIds.size === 0) return []
        return candidates.filter((candidate) => selectedChannelIds.has(candidate.channelId))
    }, [candidates, selectedChannelIds])

    const selectedCount = selectedCandidates.length
    const allSelected = candidates.length > 0 && selectedChannelIds.size === candidates.length

    const normalizedSearch = searchName.trim().toLowerCase()
    const filteredExclusions = useMemo(() => {
        if (normalizedSearch.length === 0) return exclusions
        return exclusions.filter((item) => item.name.toLowerCase().includes(normalizedSearch))
    }, [exclusions, normalizedSearch])

    function toggleCandidate(channelId: string): void {
        setSelectedChannelIds((prev) => {
            const next = new Set(prev)
            if (next.has(channelId)) next.delete(channelId)
            else next.add(channelId)
            return next
        })
    }

    function toggleAllCandidates(): void {
        if (allSelected) {
            setSelectedChannelIds(new Set())
            return
        }
        setSelectedChannelIds(new Set(candidates.map((candidate) => candidate.channelId)))
    }

    async function handleRunDiscovery(loadMore: boolean): Promise<void> {
        const parsed = Number(size)
        const normalizedSize = Number.isFinite(parsed) ? Math.max(1, Math.min(40, Math.floor(parsed))) : 20

        try {
            const response = await runDiscoveryMutation.mutateAsync({
                size: normalizedSize,
                cursor: loadMore ? nextCursor ?? undefined : undefined,
            })

            if (loadMore) {
                setCandidates((prev) => mergeCandidates(prev, response.candidates))
            } else {
                setCandidates(response.candidates)
                setSelectedChannelIds(new Set(response.candidates.map((candidate) => candidate.channelId)))
                setHasRun(true)
            }

            setNextCursor(response.nextCursor)
            addToast({ message: `${response.candidates.length}명을 크롤링했습니다.`, variant: 'success' })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleRegisterSelected(): Promise<void> {
        if (selectedCandidates.length === 0) return

        try {
            const response = await registerCandidatesMutation.mutateAsync({ candidates: selectedCandidates })
            addToast({ message: `${response.registeredCount}명을 등록했습니다.`, variant: 'success' })

            const selectedIds = new Set(selectedCandidates.map((candidate) => candidate.channelId))
            setCandidates((prev) => removeCandidatesByChannelIds(prev, selectedIds))
            setSelectedChannelIds((prev) => {
                const next = new Set(prev)
                for (const channelId of selectedIds) {
                    next.delete(channelId)
                }
                return next
            })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleExcludeSelected(): Promise<void> {
        if (selectedCandidates.length === 0) return

        try {
            await createExclusionsMutation.mutateAsync({
                exclusions: selectedCandidates.map((candidate) => ({
                    channelId: candidate.channelId,
                    name: candidate.name,
                })),
            })
            addToast({ message: `${selectedCandidates.length}명을 제외 목록에 추가했습니다.`, variant: 'success' })

            const selectedIds = new Set(selectedCandidates.map((candidate) => candidate.channelId))
            setCandidates((prev) => removeCandidatesByChannelIds(prev, selectedIds))
            setSelectedChannelIds((prev) => {
                const next = new Set(prev)
                for (const channelId of selectedIds) {
                    next.delete(channelId)
                }
                return next
            })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleDeleteExclusion(): Promise<void> {
        if (deletingExclusion === null) return

        try {
            await deleteExclusionMutation.mutateAsync(deletingExclusion.channelId)
            addToast({ message: '제외 항목을 삭제했습니다.', variant: 'success' })
            setDeletingExclusion(null)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    const actionPending = registerCandidatesMutation.isPending || createExclusionsMutation.isPending

    return (
        <>
            <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#efeff1]">스트리머 크롤링</h1>
                    <p className="mt-1 text-sm text-[#adadb8]">치지직 인기 라이브에서 신규 스트리머를 크롤링합니다</p>
                </div>

                <div className="inline-flex rounded-xl border border-[#3a3a44] bg-[#1a1a23] p-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('discovery')}
                        className={cn(
                            'cursor-pointer rounded-lg px-3.5 py-1.5 text-sm font-medium transition',
                            activeTab === 'discovery' ? 'bg-blue-600 text-white' : 'text-[#adadb8] hover:bg-[#26262e]',
                        )}
                    >
                        크롤링
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('exclusions')}
                        className={cn(
                            'cursor-pointer rounded-lg px-3.5 py-1.5 text-sm font-medium transition',
                            activeTab === 'exclusions' ? 'bg-blue-600 text-white' : 'text-[#adadb8] hover:bg-[#26262e]',
                        )}
                    >
                        제외 목록
                    </button>
                </div>
            </div>

            {activeTab === 'discovery' && (
                <div className="space-y-4">
                    <div className={panelClass}>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3a3a44] px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <label className="text-xs font-medium text-[#adadb8]">개수</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={40}
                                        value={size}
                                        onChange={(event) => setSize(event.target.value)}
                                        className={cn(inputClass, 'w-20')}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        void handleRunDiscovery(false)
                                    }}
                                    disabled={runDiscoveryMutation.isPending || actionPending}
                                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                                >
                                    <RefreshCw className={cn('h-4 w-4', runDiscoveryMutation.isPending && !hasRun && 'animate-spin')} />
                                    크롤링
                                </button>
                                {nextCursor !== null && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            void handleRunDiscovery(true)
                                        }}
                                        disabled={runDiscoveryMutation.isPending || actionPending}
                                        className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-[#3a3a44] px-3 py-2 text-sm font-medium text-[#adadb8] transition hover:bg-[#26262e] disabled:opacity-50"
                                    >
                                        <RefreshCw className={cn('h-4 w-4', runDiscoveryMutation.isPending && hasRun && 'animate-spin')} />
                                        더 불러오기
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={toggleAllCandidates}
                                    disabled={candidates.length === 0 || actionPending}
                                    className="cursor-pointer rounded-lg border border-[#3a3a44] px-3 py-1.5 text-xs font-medium text-[#adadb8] transition hover:bg-[#26262e] disabled:opacity-50"
                                >
                                    {allSelected ? '전체 해제' : '전체 선택'}
                                </button>
                                <span className="text-xs text-[#848494]">
                                    {selectedCount > 0 ? `${selectedCount}/${candidates.length}명` : `${candidates.length}명`}
                                </span>
                            </div>
                        </div>

                        {!hasRun && <ListEmpty message="크롤링을 실행하여 후보를 가져오세요." className="py-16" />}

                        {hasRun && candidates.length === 0 && !runDiscoveryMutation.isPending && (
                            <ListEmpty message="표시할 크롤링 후보가 없습니다." className="py-16" />
                        )}

                        {runDiscoveryMutation.isPending && candidates.length === 0 && <ListLoading className="py-16" />}

                        {candidates.length > 0 && (
                            <ul className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
                                {candidates.map((candidate) => (
                                    <CandidateCard
                                        key={candidate.channelId}
                                        candidate={candidate}
                                        checked={selectedChannelIds.has(candidate.channelId)}
                                        disabled={actionPending}
                                        onToggle={toggleCandidate}
                                    />
                                ))}
                            </ul>
                        )}

                        {candidates.length > 0 && (
                            <div className="flex items-center justify-end gap-2 border-t border-[#3a3a44] px-4 py-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        void handleExcludeSelected()
                                    }}
                                    disabled={selectedCount === 0 || actionPending}
                                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                                >
                                    <X className="h-4 w-4" />
                                    {selectedCount}명 제외
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        void handleRegisterSelected()
                                    }}
                                    disabled={selectedCount === 0 || actionPending}
                                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                                >
                                    <Check className="h-4 w-4" />
                                    {registerCandidatesMutation.isPending ? '등록 중...' : `${selectedCount}명 등록`}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'exclusions' && (
                <div className={panelClass}>
                    <div className="border-b border-[#3a3a44] p-4">
                        <div className="relative max-w-sm">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#848494]" />
                            <input
                                type="text"
                                value={searchName}
                                onChange={(event) => setSearchName(event.target.value)}
                                className="w-full rounded-xl border border-[#3a3a44] bg-[#26262e] py-2 pl-9 pr-3 text-sm text-[#efeff1] outline-none placeholder:text-[#848494] focus:border-blue-500"
                                placeholder="이름으로 검색"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-[minmax(160px,1.5fr)_minmax(150px,1.5fr)_140px_86px] items-center gap-3 border-b border-[#3a3a44] px-4 py-3 text-center text-xs font-semibold text-[#848494]">
                        <div>이름</div>
                        <div>채널ID</div>
                        <div>등록일</div>
                        <div>작업</div>
                    </div>

                    {exclusionsLoading && <ListLoading />}
                    {exclusionsError && <ListError message="제외 목록을 불러오는 중 오류가 발생했습니다." onRetry={() => { void refetchExclusions() }} />}

                    {!exclusionsLoading && !exclusionsError && filteredExclusions.length === 0 && <ListEmpty message="표시할 제외 항목이 없습니다." />}

                    {!exclusionsLoading && !exclusionsError && filteredExclusions.length > 0 && (
                        <ul className="divide-y divide-[#3a3a44]">
                            {filteredExclusions.map((item) => (
                                <li
                                    key={item.id}
                                    className="grid grid-cols-[minmax(160px,1.5fr)_minmax(150px,1.5fr)_140px_86px] items-center gap-3 px-4 py-3"
                                >
                                    <div className="truncate text-sm text-[#efeff1]">{item.name}</div>
                                    <div className="truncate text-xs text-[#adadb8]">{item.channelId}</div>
                                    <div className="text-center text-xs text-[#adadb8]">{dayjs(item.createdAt).format('YYYY.MM.DD HH:mm')}</div>
                                    <div className="flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => setDeletingExclusion(item)}
                                            disabled={deleteExclusionMutation.isPending}
                                            className="cursor-pointer inline-flex items-center justify-center rounded-lg border border-red-500/35 p-2 text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                                            aria-label={`${item.name} 제외 해제`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {deletingExclusion !== null && (
                <ConfirmModal
                    title="제외 항목 삭제"
                    message="항목을 제외 목록에서 삭제하시겠습니까?"
                    itemName={deletingExclusion.name}
                    pending={deleteExclusionMutation.isPending}
                    onClose={() => setDeletingExclusion(null)}
                    onConfirm={() => {
                        void handleDeleteExclusion()
                    }}
                />
            )}
        </>
    )
}
