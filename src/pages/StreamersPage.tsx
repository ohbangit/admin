import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Copy, ExternalLink, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react'
import {
    useAdminToast,
    useDeleteStreamer,
    useRefreshStreamer,
    useRegisterStreamer,
    useStreamers,
    useUpdateFanCafeUrl,
    useUpdateNickname,
    useUpdateYoutubeUrl,
} from '../hooks'
import type { StreamerItem, StreamerSortType } from '../types'
import { cn } from '../lib/cn'
import partnerMark from '../assets/mark.png'
import { getErrorMessage } from '../utils/error'
import { panelClass, inputClass, selectClass } from '../constants/styles'
import { ConfirmModal } from '../components/ConfirmModal'
import { ListLoading, ListError, ListEmpty } from '../components/ListState'

const pageSize = 20

const sortOptions: { value: StreamerSortType; label: string }[] = [
    { value: 'name_asc', label: '이름순' },
    { value: 'name_desc', label: '이름 역순' },
    { value: 'follower_desc', label: '팔로워순' },
]

function formatFollowerCount(value: number | null): string {
    if (value === null) return '-'
    return value.toLocaleString('ko-KR')
}

function getInitial(name: string): string {
    const trimmed = name.trim()
    if (trimmed.length === 0) return 'U'
    return trimmed[0]?.toUpperCase() ?? 'U'
}

function normalizeInput(value: string): string {
    return value.trim()
}

interface AvatarProps {
    streamer: StreamerItem
    sizeClass?: string
    textClass?: string
}

function Avatar({ streamer, sizeClass = 'h-10 w-10', textClass = 'text-xs' }: AvatarProps) {
    if (streamer.channelImageUrl && streamer.channelImageUrl.trim().length > 0) {
        return <img src={streamer.channelImageUrl} alt={`${streamer.name} 프로필`} className={cn('rounded-full border border-[#3a3a44] object-cover', sizeClass)} />
    }

    return (
        <div className={cn('flex items-center justify-center rounded-full border border-[#3a3a44] bg-[#26262e] font-semibold text-[#adadb8]', sizeClass, textClass)}>
            {getInitial(streamer.name)}
        </div>
    )
}

interface RegisterModalProps {
    pending: boolean
    onClose: () => void
    onSubmit: (channelId: string) => Promise<void>
}

function RegisterModal({ pending, onClose, onSubmit }: RegisterModalProps) {
    const [channelId, setChannelId] = useState('')
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(): Promise<void> {
        const value = normalizeInput(channelId)
        if (value.length === 0) {
            setError('채널 ID를 입력해주세요.')
            return
        }

        setError(null)
        await onSubmit(value)
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={(event) => {
                if (event.target === event.currentTarget && !pending) onClose()
            }}
        >
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#3a3a44] bg-[#1a1a23] shadow-xl">
                <div className="border-b border-[#3a3a44] px-6 py-4">
                    <h2 className="text-base font-bold text-[#efeff1]">스트리머 등록</h2>
                    <p className="mt-1 text-xs text-[#adadb8]">치지직 채널 ID를 입력해 등록합니다.</p>
                </div>

                <div className="space-y-3 px-6 py-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[#adadb8]">
                            채널 ID <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={channelId}
                            onChange={(event) => setChannelId(event.target.value)}
                            className={inputClass}
                            placeholder="예: 1f2e3d4c5b"
                            autoFocus
                        />
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
                        {pending ? '등록 중...' : '등록'}
                    </button>
                </div>
            </div>
        </div>
    )
}


interface StreamerDetailModalProps {
    streamer: StreamerItem
    pendingNickname: boolean
    pendingYoutube: boolean
    pendingFanCafe: boolean
    pendingDelete: boolean
    onClose: () => void
    onSaveNickname: (id: number, nickname: string) => Promise<void>
    onSaveYoutubeUrl: (channelId: string, youtubeUrl: string) => Promise<void>
    onSaveFanCafeUrl: (channelId: string, fanCafeUrl: string) => Promise<void>
    onDelete: () => void
}

function StreamerDetailModal({
    streamer,
    pendingNickname,
    pendingYoutube,
    pendingFanCafe,
    pendingDelete,
    onClose,
    onSaveNickname,
    onSaveYoutubeUrl,
    onSaveFanCafeUrl,
    onDelete,
}: StreamerDetailModalProps) {
    const [nickname, setNickname] = useState(streamer.nickname ?? '')
    const [youtubeUrl, setYoutubeUrl] = useState(streamer.youtubeUrl ?? '')
    const [fanCafeUrl, setFanCafeUrl] = useState(streamer.fanCafeUrl ?? '')
    const isAnyPending = pendingNickname || pendingYoutube || pendingFanCafe || pendingDelete

    useEffect(() => {
        setNickname(streamer.nickname ?? '')
        setYoutubeUrl(streamer.youtubeUrl ?? '')
        setFanCafeUrl(streamer.fanCafeUrl ?? '')
    }, [streamer])

    const channelLink = streamer.channelId ? `https://chzzk.naver.com/${streamer.channelId}` : null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={(event) => {
                if (event.target === event.currentTarget && !isAnyPending) onClose()
            }}
        >
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#3a3a44] bg-[#1a1a23] shadow-xl">
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
            </div>
        </div>
    )
}

export default function StreamersPage() {
    const { addToast } = useAdminToast()
    const registerMutation = useRegisterStreamer()
    const refreshMutation = useRefreshStreamer()
    const updateNicknameMutation = useUpdateNickname()
    const updateYoutubeMutation = useUpdateYoutubeUrl()
    const updateFanCafeMutation = useUpdateFanCafeUrl()
    const deleteMutation = useDeleteStreamer()

    const [searchInput, setSearchInput] = useState('')
    const [debouncedName, setDebouncedName] = useState('')
    const [tab, setTab] = useState<'all' | 'no_channel'>('all')
    const [sort, setSort] = useState<StreamerSortType>('name_asc')
    const [page, setPage] = useState(1)

    const [isRegisterOpen, setRegisterOpen] = useState(false)
    const [detailStreamer, setDetailStreamer] = useState<StreamerItem | null>(null)
    const [deletingStreamer, setDeletingStreamer] = useState<StreamerItem | null>(null)

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedName(searchInput.trim())
        }, 300)

        return () => {
            window.clearTimeout(timer)
        }
    }, [searchInput])

    useEffect(() => {
        setPage(1)
    }, [debouncedName, tab, sort])

    const params = useMemo(
        () => ({
            name: debouncedName.length > 0 ? debouncedName : undefined,
            hasChannel: tab === 'no_channel' ? false : undefined,
            page,
            size: pageSize,
            sort,
        }),
        [debouncedName, tab, page, sort],
    )

    const { data, isLoading, isError } = useStreamers(params)
    const items = data?.items ?? []
    const total = data?.total ?? 0
    const currentPage = data?.page ?? page
    const currentSize = data?.size ?? pageSize
    const totalPages = Math.max(1, Math.ceil(total / currentSize))

    async function handleRegister(channelId: string): Promise<void> {
        try {
            await registerMutation.mutateAsync({ channelId })
            addToast({ message: '스트리머가 등록되었습니다.', variant: 'success' })
            setRegisterOpen(false)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleRefresh(streamer: StreamerItem): Promise<void> {
        try {
            await refreshMutation.mutateAsync(streamer.id)
            addToast({ message: `${streamer.name} 정보를 새로고침했습니다.`, variant: 'success' })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleCopyChannelId(channelId: string | null): Promise<void> {
        if (!channelId) {
            addToast({ message: '채널 ID가 없습니다.', variant: 'error' })
            return
        }

        try {
            await navigator.clipboard.writeText(channelId)
            addToast({ message: '채널 ID를 복사했습니다.', variant: 'success' })
        } catch {
            addToast({ message: '클립보드 복사에 실패했습니다.', variant: 'error' })
        }
    }

    async function handleSaveNickname(id: number, nickname: string): Promise<void> {
        try {
            await updateNicknameMutation.mutateAsync({ id, body: { nickname } })
            addToast({ message: '닉네임을 저장했습니다.', variant: 'success' })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleSaveYoutubeUrl(channelId: string, youtubeUrl: string): Promise<void> {
        try {
            await updateYoutubeMutation.mutateAsync({ channelId, body: { youtubeUrl } })
            addToast({ message: 'YouTube URL을 저장했습니다.', variant: 'success' })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleSaveFanCafeUrl(channelId: string, fanCafeUrl: string): Promise<void> {
        try {
            await updateFanCafeMutation.mutateAsync({ channelId, body: { fanCafeUrl } })
            addToast({ message: '팬카페 URL을 저장했습니다.', variant: 'success' })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleDelete(): Promise<void> {
        if (deletingStreamer === null) return

        try {
            await deleteMutation.mutateAsync(deletingStreamer.id)
            addToast({ message: '스트리머가 삭제되었습니다.', variant: 'success' })
            setDeletingStreamer(null)
            if (detailStreamer?.id === deletingStreamer.id) {
                setDetailStreamer(null)
            }
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    return (
        <>
            <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-[#efeff1]">스트리머 관리</h1>
                        <span className="rounded-full border border-[#3a3a44] bg-[#26262e] px-2.5 py-0.5 text-xs font-semibold text-[#adadb8]">
                            전체 {total.toLocaleString('ko-KR')}명
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-[#adadb8]">등록된 스트리머를 관리합니다</p>
                </div>
                <button
                    type="button"
                    onClick={() => setRegisterOpen(true)}
                    className="cursor-pointer flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                    <Plus className="h-4 w-4" />
                    스트리머 등록
                </button>
            </div>

            <div className={cn(panelClass, 'mb-4 p-4')}>
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#848494]" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            className={cn(inputClass, 'pl-9')}
                            placeholder="이름 검색"
                        />
                    </div>

                    <div className="inline-flex w-full rounded-xl border border-[#3a3a44] bg-[#26262e] p-1 md:w-auto">
                        <button
                            type="button"
                            onClick={() => setTab('all')}
                            className={cn(
                                'cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition',
                                tab === 'all' ? 'bg-blue-600 text-white' : 'text-[#adadb8] hover:text-[#efeff1]',
                            )}
                        >
                            전체
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab('no_channel')}
                            className={cn(
                                'cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition',
                                tab === 'no_channel' ? 'bg-blue-600 text-white' : 'text-[#adadb8] hover:text-[#efeff1]',
                            )}
                        >
                            채널 미등록
                        </button>
                    </div>

                    <select value={sort} onChange={(event) => setSort(event.target.value as StreamerSortType)} className={cn(selectClass, 'md:w-40')}>
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={panelClass}>
                <div className="grid grid-cols-[56px_minmax(0,2fr)_minmax(0,1.5fr)_110px_minmax(0,1.4fr)_126px] items-center gap-3 border-b border-[#3a3a44] px-4 py-3 text-center text-xs font-semibold text-[#848494]">
                    <div>아바타</div>
                    <div className="text-left">이름/닉네임</div>
                    <div className="text-left">채널ID</div>
                    <div>팔로워</div>
                    <div className="text-left">소속</div>
                    <div>작업</div>
                </div>

                {isLoading && <ListLoading />}

                {isError && <ListError message="스트리머 목록을 불러오는 중 오류가 발생했습니다." />}

                {!isLoading && !isError && items.length === 0 && <ListEmpty message="등록된 스트리머가 없습니다." />}

                {!isLoading && !isError && items.length > 0 && (
                    <ul className="divide-y divide-[#3a3a44]">
                        {items.map((streamer) => {
                            const showNickname = streamer.nickname !== null && streamer.nickname.trim().length > 0 && streamer.nickname !== streamer.name
                            const refreshingThisRow = refreshMutation.isPending

                            return (
                                <li
                                    key={streamer.id}
                                    className="grid grid-cols-[56px_minmax(0,2fr)_minmax(0,1.5fr)_110px_minmax(0,1.4fr)_126px] items-center gap-3 px-4 py-3 transition hover:bg-[#26262e]/60"
                                >
                                    <div className="flex justify-center">
                                        <Avatar streamer={streamer} />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <p className="truncate text-sm font-semibold text-[#efeff1]">{streamer.name}</p>
                                            {streamer.isPartner && (
                                                <img src={partnerMark} alt="파트너" className="h-4 w-4 shrink-0" />
                                            )}
                                        </div>
                                        {showNickname && <p className="mt-0.5 truncate text-xs text-[#adadb8]">{streamer.nickname}</p>}
                                    </div>

                                    <div className="flex min-w-0 items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                void handleCopyChannelId(streamer.channelId)
                                            }}
                                            className="inline-flex min-w-0 cursor-pointer items-center gap-1 rounded-lg border border-[#3a3a44] bg-[#26262e] px-2 py-1 text-xs text-[#adadb8] transition hover:border-blue-500 hover:text-[#efeff1]"
                                        >
                                            <span className="truncate font-mono">{streamer.channelId ?? '-'}</span>
                                            <Copy className="h-3.5 w-3.5 shrink-0" />
                                        </button>
                                        {streamer.channelId && (
                                            <a
                                                href={`https://chzzk.naver.com/${streamer.channelId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="shrink-0 cursor-pointer rounded-lg border border-[#3a3a44] p-1.5 text-[#848494] transition hover:border-blue-500 hover:text-[#efeff1]"
                                                title="치지직 채널"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        )}
                                    </div>

                                    <div className="text-center text-sm tabular-nums text-[#efeff1]">{formatFollowerCount(streamer.followerCount)}</div>

                                    <div className="min-w-0">
                                        {streamer.affiliations.length === 0 ? (
                                            <span className="text-xs text-[#848494]">-</span>
                                        ) : (
                                            <div className="flex flex-wrap gap-1.5">
                                                {streamer.affiliations.map((affiliation) => (
                                                    <span
                                                        key={affiliation.id}
                                                        className="rounded-full border border-[#3a3a44] bg-[#26262e] px-2 py-0.5 text-[11px] text-[#adadb8]"
                                                    >
                                                        {affiliation.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                void handleRefresh(streamer)
                                            }}
                                            disabled={refreshingThisRow}
                                            className="cursor-pointer rounded-lg border border-[#3a3a44] p-1.5 text-[#adadb8] transition hover:bg-[#26262e] disabled:opacity-50"
                                            aria-label="새로고침"
                                        >
                                            <RefreshCw className={cn('h-4 w-4', refreshingThisRow && 'animate-spin')} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDetailStreamer(streamer)}
                                            className="cursor-pointer rounded-lg border border-[#3a3a44] p-1.5 text-[#adadb8] transition hover:bg-[#26262e]"
                                            aria-label="수정"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeletingStreamer(streamer)}
                                            className="cursor-pointer rounded-lg border border-red-500/35 p-1.5 text-red-300 transition hover:bg-red-500/10"
                                            aria-label="삭제"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}

                <div className="flex items-center justify-between border-t border-[#3a3a44] px-4 py-3">
                    <p className="text-sm text-[#adadb8]">전체 {total.toLocaleString('ko-KR')}명</p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            disabled={isLoading || currentPage <= 1}
                            className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-[#3a3a44] px-2.5 py-1.5 text-xs font-medium text-[#adadb8] transition hover:bg-[#26262e] disabled:opacity-40"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" /> 이전
                        </button>
                        <span className="text-xs tabular-nums text-[#848494]">
                            {Math.min(currentPage, totalPages)} / {totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={isLoading || currentPage >= totalPages}
                            className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-[#3a3a44] px-2.5 py-1.5 text-xs font-medium text-[#adadb8] transition hover:bg-[#26262e] disabled:opacity-40"
                        >
                            다음 <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {isRegisterOpen && (
                <RegisterModal pending={registerMutation.isPending} onClose={() => setRegisterOpen(false)} onSubmit={handleRegister} />
            )}

            {detailStreamer !== null && (
                <StreamerDetailModal
                    streamer={detailStreamer}
                    pendingNickname={updateNicknameMutation.isPending}
                    pendingYoutube={updateYoutubeMutation.isPending}
                    pendingFanCafe={updateFanCafeMutation.isPending}
                    pendingDelete={deleteMutation.isPending}
                    onClose={() => setDetailStreamer(null)}
                    onSaveNickname={handleSaveNickname}
                    onSaveYoutubeUrl={handleSaveYoutubeUrl}
                    onSaveFanCafeUrl={handleSaveFanCafeUrl}
                    onDelete={() => setDeletingStreamer(detailStreamer)}
                />
            )}

            {deletingStreamer !== null && (
                <ConfirmModal
                    title="스트리머 삭제"
                    message="스트리머를 삭제하시겠습니까?"
                    itemName={deletingStreamer.name}
                    pending={deleteMutation.isPending}
                    onClose={() => setDeletingStreamer(null)}
                    onConfirm={() => {
                        void handleDelete()
                    }}
                />
            )}

        </>
    )
}
