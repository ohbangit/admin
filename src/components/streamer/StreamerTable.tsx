import { useState } from 'react'
import partnerMark from '../../assets/mark.png'
import { cn } from '../../lib/cn'
import { useDeleteStreamer, useRefreshStreamer } from '../../hooks'
import { getAffiliationColor } from '../../types'
import type { StreamerAvatarProps, StreamerRowProps, StreamerTableProps } from '../../types/streamersManage'

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

function StreamerRow({ streamer, onClick, onDeleted }: StreamerRowProps) {
    const [confirmDelete, setConfirmDelete] = useState(false)
    const refresh = useRefreshStreamer(streamer.id)
    const remove = useDeleteStreamer()

    return (
        <tr
            className="border-b border-gray-200 last:border-0 transition hover:bg-gray-50 dark:border-[#3a3a44] dark:hover:bg-[#26262e]"
            onClick={() => {
                if (!confirmDelete) onClick()
            }}
        >
            <td className="cursor-pointer px-4 py-3.5">
                <div className="flex items-center gap-3">
                    <StreamerAvatar src={streamer.channelImageUrl} name={streamer.nickname} size={36} />
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-gray-900 dark:text-[#efeff1]">{streamer.nickname}</span>
                            {streamer.isPartner && <img src={partnerMark} alt="파트너" className="h-4 w-4" />}
                        </div>
                        {streamer.nickname !== streamer.name && (
                            <span className="mt-0.5 block text-xs text-gray-400 dark:text-[#848494]">{streamer.name}</span>
                        )}
                        <span className="mt-0.5 block text-xs text-gray-400 dark:text-[#848494]">
                            팔로워 {streamer.followerCount != null ? streamer.followerCount.toLocaleString() : '—'}
                        </span>
                        {!streamer.channelId && <span className="mt-0.5 block text-xs text-red-400 dark:text-red-400">채널 미연결</span>}
                        {streamer.affiliations.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                                {streamer.affiliations.slice(0, 3).map((affiliation) => {
                                    const color = getAffiliationColor(affiliation)
                                    return (
                                        <span
                                            key={affiliation.id}
                                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                                            style={{
                                                backgroundColor: `${color}18`,
                                                color,
                                            }}
                                        >
                                            {affiliation.name}
                                        </span>
                                    )
                                })}
                                {streamer.affiliations.length > 3 && (
                                    <span className="text-[11px] text-gray-400 dark:text-[#848494]">+{streamer.affiliations.length - 3}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-4 py-3.5 text-right">
                <div className="flex items-center justify-end gap-2">
                    {confirmDelete ? (
                        <>
                            <span className="text-xs text-gray-500 dark:text-[#adadb8]">삭제할까요?</span>
                            <button
                                type="button"
                                disabled={remove.isPending}
                                onClick={(event) => {
                                    event.stopPropagation()
                                    remove.mutate(streamer.id, {
                                        onSuccess: onDeleted,
                                    })
                                }}
                                className="rounded-md bg-red-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-red-600 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-500"
                            >
                                {remove.isPending ? '…' : '삭제'}
                            </button>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation()
                                    setConfirmDelete(false)
                                    remove.reset()
                                }}
                                className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:bg-[#2e2e38]"
                            >
                                취소
                            </button>
                        </>
                    ) : (
                        <>
                            {streamer.channelId && (
                                <a
                                    href={`https://chzzk.naver.com/${streamer.channelId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(event) => event.stopPropagation()}
                                    title="채널로 이동"
                                    aria-label={`${streamer.nickname} 채널로 이동`}
                                    className="cursor-pointer rounded-md border border-gray-300 p-1.5 text-gray-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:border-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            )}
                            <button
                                type="button"
                                disabled={!streamer.channelId || refresh.isPending}
                                onClick={(event) => {
                                    event.stopPropagation()
                                    refresh.mutate()
                                }}
                                title="채널 정보 갱신"
                                className="rounded-md border border-gray-300 p-1.5 text-gray-500 transition hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:border-[#848494] dark:hover:bg-[#2e2e38] dark:hover:text-[#efeff1]"
                            >
                                <svg
                                    className={cn('h-4 w-4', refresh.isPending ? 'animate-spin' : '')}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation()
                                    setConfirmDelete(true)
                                }}
                                title="스트리머 삭제"
                                className="rounded-md border border-gray-300 p-1.5 text-gray-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-500 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:border-red-800 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </button>
                            <span className="text-xs text-gray-300 dark:text-[#848494]">›</span>
                        </>
                    )}
                </div>
            </td>
        </tr>
    )
}

export function StreamerTable({
    streamers,
    emptyMessage = '스트리머가 없습니다.',
    onSelect,
    onDeleted,
}: StreamerTableProps) {
    if (streamers.length === 0) {
        return (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-[#3a3a44]">
                <p className="text-sm text-gray-400 dark:text-[#848494]">{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-300 bg-white dark:border-[#3a3a44] dark:bg-[#1a1a23]">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-300 bg-gray-50 dark:border-[#3a3a44] dark:bg-[#26262e]">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#848494]">스트리머</th>
                        <th className="w-40" />
                    </tr>
                </thead>
                <tbody>
                    {streamers.map((streamer) => (
                        <StreamerRow key={streamer.id} streamer={streamer} onClick={() => onSelect(streamer)} onDeleted={onDeleted} />
                    ))}
                </tbody>
            </table>
        </div>
    )
}
