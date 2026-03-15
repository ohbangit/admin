import { useEffect, useMemo, useRef, useState } from 'react'
import partnerMark from '../assets/mark.png'
import {
    useAdminToast,
    useCreateStreamerExclusion,
    useCreateStreamerExclusions,
    useDeleteStreamerExclusion,
    useRegisterDiscoveryCandidates,
    useRunDiscovery,
    useStreamerExclusions,
} from '../hooks'
import type { DiscoveryCandidate, DiscoveryCursor } from '../types'
import { getErrorMessage } from '../utils/error'

function mergeCandidates({
    current,
    incoming,
}: {
    current: DiscoveryCandidate[]
    incoming: DiscoveryCandidate[]
}): DiscoveryCandidate[] {
    const map = new Map<string, DiscoveryCandidate>()
    current.forEach((item) => {
        map.set(item.channelId, item)
    })
    incoming.forEach((item) => {
        if (!map.has(item.channelId)) {
            map.set(item.channelId, item)
        }
    })
    return Array.from(map.values())
}

export default function DiscoveryPage() {
    const [candidates, setCandidates] = useState<DiscoveryCandidate[]>([])
    const [cursor, setCursor] = useState<DiscoveryCursor | null>(null)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [exclusionChannelId, setExclusionChannelId] = useState('')
    const [exclusionName, setExclusionName] = useState('')
    const [exclusionReason, setExclusionReason] = useState('')
    const { addToast } = useAdminToast()
    const lastErrorMessageRef = useRef<string | null>(null)

    const runDiscovery = useRunDiscovery()
    const registerCandidates = useRegisterDiscoveryCandidates()
    const createExclusion = useCreateStreamerExclusion()
    const createExclusions = useCreateStreamerExclusions()
    const deleteExclusion = useDeleteStreamerExclusion()
    const {
        data: exclusions = [],
        isLoading: isExclusionsLoading,
        error: exclusionsError,
    } = useStreamerExclusions()

    const selectedCandidates = useMemo(
        () =>
            candidates.filter((candidate) =>
                selectedIds.includes(candidate.channelId),
            ),
        [candidates, selectedIds],
    )

    useEffect(() => {
        const errorMessage =
            getErrorMessage(runDiscovery.error) ??
            getErrorMessage(registerCandidates.error) ??
            getErrorMessage(createExclusions.error) ??
            getErrorMessage(createExclusion.error) ??
            getErrorMessage(exclusionsError) ??
            getErrorMessage(deleteExclusion.error)
        if (
            errorMessage === null ||
            errorMessage === lastErrorMessageRef.current
        ) {
            return
        }
        lastErrorMessageRef.current = errorMessage
        addToast({ message: errorMessage, variant: 'error' })
    }, [
        addToast,
        runDiscovery.error,
        registerCandidates.error,
        createExclusions.error,
        createExclusion.error,
        exclusionsError,
        deleteExclusion.error,
    ])

    function toggleSelected(channelId: string): void {
        setSelectedIds((prev) =>
            prev.includes(channelId)
                ? prev.filter((value) => value !== channelId)
                : [...prev, channelId],
        )
    }

    const allChecked =
        candidates.length > 0 && selectedIds.length === candidates.length

    async function handleRun(): Promise<void> {
        try {
            const result = await runDiscovery.mutateAsync({ size: 20 })
            setCandidates(result.candidates)
            setCursor(result.nextCursor)
            setSelectedIds([])
            addToast({
                message: `후보 ${result.candidates.length}건을 가져왔습니다.`,
                variant: 'success',
            })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) {
                addToast({ message, variant: 'error' })
            }
        }
    }

    async function handleLoadMore(): Promise<void> {
        if (cursor === null) {
            return
        }
        try {
            const result = await runDiscovery.mutateAsync({ size: 20, cursor })
            setCandidates((prev) =>
                mergeCandidates({ current: prev, incoming: result.candidates }),
            )
            setCursor(result.nextCursor)
            addToast({
                message: `후보 ${result.candidates.length}건을 추가로 가져왔습니다.`,
                variant: 'success',
            })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) {
                addToast({ message, variant: 'error' })
            }
        }
    }

    async function handleRegisterSelected(): Promise<void> {
        if (selectedCandidates.length === 0) {
            return
        }
        try {
            await registerCandidates.mutateAsync({
                candidates: selectedCandidates,
            })
            const selectedSet = new Set(selectedIds)
            setCandidates((prev) =>
                prev.filter(
                    (candidate) => !selectedSet.has(candidate.channelId),
                ),
            )
            setSelectedIds([])
            addToast({
                message: `선택한 스트리머 ${selectedCandidates.length}건이 등록되었습니다.`,
                variant: 'success',
            })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) {
                addToast({ message, variant: 'error' })
            }
        }
    }

    async function handleExcludeSelected(): Promise<void> {
        if (selectedCandidates.length === 0) {
            return
        }
        try {
            await createExclusions.mutateAsync({
                exclusions: selectedCandidates.map((candidate) => ({
                    channelId: candidate.channelId,
                    name: candidate.name,
                    reason:
                        exclusionReason.trim().length > 0
                            ? exclusionReason.trim()
                            : undefined,
                })),
            })
            const selectedSet = new Set(selectedIds)
            setCandidates((prev) =>
                prev.filter(
                    (candidate) => !selectedSet.has(candidate.channelId),
                ),
            )
            setSelectedIds([])
            addToast({
                message: `선택한 채널 ${selectedCandidates.length}건을 예외 처리했습니다.`,
                variant: 'success',
            })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) {
                addToast({ message, variant: 'error' })
            }
        }
    }

    async function handleCreateExclusion(): Promise<void> {
        try {
            await createExclusion.mutateAsync({
                channelId: exclusionChannelId.trim(),
                name: exclusionName.trim(),
                reason:
                    exclusionReason.trim().length > 0
                        ? exclusionReason.trim()
                        : undefined,
            })
            setExclusionChannelId('')
            setExclusionName('')
            setExclusionReason('')
            addToast({
                message: '예외 채널이 추가되었습니다.',
                variant: 'success',
            })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) {
                addToast({ message, variant: 'error' })
            }
        }
    }

    async function handleDeleteExclusion(channelId: string): Promise<void> {
        try {
            await deleteExclusion.mutateAsync(channelId)
            addToast({
                message: '예외 채널이 삭제되었습니다.',
                variant: 'success',
            })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) {
                addToast({ message, variant: 'error' })
            }
        }
    }

    return (
        <div className="space-y-8">
            <section>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-[#efeff1]">
                            스트리머 발굴
                        </h1>
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-[#adadb8]">
                            치지직 인기 라이브에서 신규 채널 후보를 가져옵니다.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                void handleRun()
                            }}
                            disabled={runDiscovery.isPending}
                            className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
                        >
                            {runDiscovery.isPending
                                ? '실행 중…'
                                : '크롤링 실행'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                void handleLoadMore()
                            }}
                            disabled={cursor === null || runDiscovery.isPending}
                            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-40 dark:border-[#3a3a44] dark:text-[#efeff1] dark:hover:bg-[#26262e]"
                        >
                            추가로 가져오기
                        </button>
                    </div>
                </div>

                <div className="mb-3 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            void handleRegisterSelected()
                        }}
                        disabled={
                            selectedCandidates.length === 0 ||
                            registerCandidates.isPending
                        }
                        className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-40"
                    >
                        선택 등록 ({selectedCandidates.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            void handleExcludeSelected()
                        }}
                        disabled={
                            selectedCandidates.length === 0 ||
                            createExclusions.isPending
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-40 dark:border-[#3a3a44] dark:text-[#efeff1] dark:hover:bg-[#26262e]"
                    >
                        선택 예외 처리
                    </button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-300 bg-white dark:border-[#3a3a44] dark:bg-[#1a1a23]">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-300 bg-gray-50 dark:border-[#3a3a44] dark:bg-[#26262e]">
                                <th className="w-12 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={allChecked}
                                        onChange={(event) => {
                                            if (event.target.checked) {
                                                setSelectedIds(
                                                    candidates.map(
                                                        (candidate) =>
                                                            candidate.channelId,
                                                    ),
                                                )
                                                return
                                            }
                                            setSelectedIds([])
                                        }}
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#848494]">
                                    스트리머
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#848494]">
                                    채널 ID
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-4 py-10 text-center text-sm text-gray-400 dark:text-[#848494]"
                                    >
                                        아직 후보가 없습니다. 크롤링 실행을
                                        눌러주세요.
                                    </td>
                                </tr>
                            )}
                            {candidates.map((candidate) => {
                                const checked = selectedIds.includes(
                                    candidate.channelId,
                                )
                                return (
                                    <tr
                                        key={candidate.channelId}
                                        className="border-b border-gray-200 last:border-0 dark:border-[#3a3a44]"
                                        onClick={() =>
                                            toggleSelected(candidate.channelId)
                                        }
                                    >
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={(event) => {
                                                    event.stopPropagation()
                                                    toggleSelected(
                                                        candidate.channelId,
                                                    )
                                                }}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {candidate.channelImageUrl ? (
                                                    <img
                                                        src={
                                                            candidate.channelImageUrl
                                                        }
                                                        alt={candidate.name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500 dark:bg-[#26262e] dark:text-[#adadb8]">
                                                        {candidate.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="truncate text-sm font-medium text-gray-900 dark:text-[#efeff1]">
                                                            {candidate.name}
                                                        </span>
                                                        {candidate.isPartner && (
                                                            <img
                                                                src={
                                                                    partnerMark
                                                                }
                                                                alt="파트너"
                                                                className="h-4 w-4 shrink-0"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs text-gray-500 dark:text-[#adadb8]">
                                                    {candidate.channelId}
                                                </span>
                                                <a
                                                    href={`https://chzzk.naver.com/${candidate.channelId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    title="채널로 이동"
                                                    aria-label={`${candidate.name} 채널로 이동`}
                                                    className="shrink-0 cursor-pointer rounded p-0.5 text-gray-400 transition hover:text-blue-500 dark:hover:text-blue-400"
                                                >
                                                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-[#efeff1]">
                    예외 채널 관리
                </h2>

                <form
                    className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-4"
                    onSubmit={(event) => {
                        event.preventDefault()
                        void handleCreateExclusion()
                    }}
                >
                    <input
                        value={exclusionChannelId}
                        onChange={(event) =>
                            setExclusionChannelId(event.target.value)
                        }
                        placeholder="channelId"
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 dark:border-[#3a3a44] dark:bg-[#1a1a23] dark:text-[#efeff1]"
                        required
                    />
                    <input
                        value={exclusionName}
                        onChange={(event) =>
                            setExclusionName(event.target.value)
                        }
                        placeholder="채널명"
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 dark:border-[#3a3a44] dark:bg-[#1a1a23] dark:text-[#efeff1]"
                        required
                    />
                    <input
                        value={exclusionReason}
                        onChange={(event) =>
                            setExclusionReason(event.target.value)
                        }
                        placeholder="사유 (선택)"
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 dark:border-[#3a3a44] dark:bg-[#1a1a23] dark:text-[#efeff1]"
                    />
                    <button
                        type="submit"
                        disabled={createExclusion.isPending}
                        className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-40 dark:bg-[#efeff1] dark:text-[#0e0e10] dark:hover:bg-[#adadb8]"
                    >
                        예외 추가
                    </button>
                </form>

                <div className="overflow-hidden rounded-2xl border border-gray-300 bg-white dark:border-[#3a3a44] dark:bg-[#1a1a23]">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-300 bg-gray-50 dark:border-[#3a3a44] dark:bg-[#26262e]">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#848494]">
                                    채널
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#848494]">
                                    사유
                                </th>
                                <th className="w-24 px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {!isExclusionsLoading &&
                                exclusions.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="px-4 py-8 text-center text-sm text-gray-400 dark:text-[#848494]"
                                        >
                                            등록된 예외 채널이 없습니다.
                                        </td>
                                    </tr>
                                )}
                            {exclusions.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-gray-200 last:border-0 dark:border-[#3a3a44]"
                                >
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-medium text-gray-900 dark:text-[#efeff1]">
                                            {item.name}
                                        </p>
                                        <p className="font-mono text-xs text-gray-500 dark:text-[#adadb8]">
                                            {item.channelId}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-[#adadb8]">
                                        {item.reason ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                void handleDeleteExclusion(
                                                    item.channelId,
                                                )
                                            }}
                                            disabled={deleteExclusion.isPending}
                                            className="rounded-md border border-gray-300 px-2.5 py-1 text-xs text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:bg-[#26262e]"
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}
