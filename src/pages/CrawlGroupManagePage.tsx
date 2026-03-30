import { useMemo } from 'react'
import dayjs from 'dayjs'
import { Clock, Radio, Users } from 'lucide-react'
import { useScheduleSources } from '../hooks'
import { cn } from '../lib/cn'
import type { ScheduleSourceItem } from '../types'
import { panelClass } from '../constants/styles'
import { ListEmpty, ListError, ListLoading } from '../components/ListState'

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const

function getSourceStyle(sourceType: string): string {
    if (sourceType === 'chzzk_community' || sourceType === 'chzzk') {
        return 'border-green-500/35 bg-green-500/10 text-green-300'
    }
    if (sourceType === 'fan_cafe') {
        return 'border-orange-500/35 bg-orange-500/10 text-orange-300'
    }
    return 'border-[#3a3a44] bg-[#26262e] text-[#adadb8]'
}

type TimetableMap = Map<number, Map<number, ScheduleSourceItem[]>>

function buildTimetable(sources: ScheduleSourceItem[]): { timetable: TimetableMap; hours: number[] } {
    const timetable: TimetableMap = new Map()

    for (const source of sources) {
        for (const day of source.crawl_days) {
            if (!timetable.has(source.crawl_hour)) {
                timetable.set(source.crawl_hour, new Map())
            }
            const hourMap = timetable.get(source.crawl_hour)!
            if (!hourMap.has(day)) {
                hourMap.set(day, [])
            }
            hourMap.get(day)!.push(source)
        }
    }

    const hours = [...timetable.keys()].sort((a, b) => a - b)
    return { timetable, hours }
}

type TimeStatus = 'past' | 'current' | 'future'

function getTimeStatus(hour: number, currentHour: number): TimeStatus {
    if (hour < currentHour) return 'past'
    if (hour === currentHour) return 'current'
    return 'future'
}

export default function CrawlGroupManagePage() {
    const { data: sources = [], isLoading, isError, refetch } = useScheduleSources()

    const now = dayjs()
    const todayIndex = now.day()
    const currentHour = now.hour()

    const { timetable, hours } = useMemo(() => buildTimetable(sources), [sources])

    const stats = useMemo(() => {
        const streamerIds = new Set(sources.map((s) => s.streamer_id))
        return {
            totalSources: sources.length,
            uniqueStreamers: streamerIds.size,
            activeHours: hours.length,
        }
    }, [sources, hours])

    return (
        <>
            <div className="mb-6">
                <h1 className="text-xl font-bold text-[#efeff1]">크롤링 스케줄 현황</h1>
                <p className="mt-1 text-sm text-[#adadb8]">요일·시간대별 크롤링 스케줄 현황입니다</p>
            </div>

            <div className={panelClass}>
                {isLoading && <ListLoading />}
                {isError && <ListError message="스케줄 현황을 불러오는 중 오류가 발생했습니다." onRetry={() => void refetch()} />}
                {!isLoading && !isError && sources.length === 0 && <ListEmpty message="등록된 크롤링 스케줄이 없습니다." />}

                {!isLoading && !isError && sources.length > 0 && (
                    <>
                        <div className="flex items-center gap-6 border-b border-[#3a3a44] px-5 py-3.5">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                                    <Users className="h-3.5 w-3.5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-[#848494]">스트리머</p>
                                    <p className="text-sm font-semibold text-[#efeff1]">{stats.uniqueStreamers}명</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                                    <Radio className="h-3.5 w-3.5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-[#848494]">소스</p>
                                    <p className="text-sm font-semibold text-[#efeff1]">{stats.totalSources}개</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10">
                                    <Clock className="h-3.5 w-3.5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-[#848494]">시간대</p>
                                    <p className="text-sm font-semibold text-[#efeff1]">{stats.activeHours}개</p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] table-fixed border-collapse">
                                <colgroup>
                                    <col className="w-14" />
                                    {DAY_LABELS.map((_, i) => (
                                        <col key={i} />
                                    ))}
                                </colgroup>
                                <thead>
                                    <tr className="border-b border-[#3a3a44]">
                                        <th className="px-2 py-2.5 text-center text-[11px] font-semibold text-[#848494]">시간</th>
                                        {DAY_LABELS.map((label, dayIndex) => {
                                            const isToday = dayIndex === todayIndex
                                            return (
                                                <th
                                                    key={dayIndex}
                                                    className={cn(
                                                        'px-1 py-2.5 text-center text-xs font-semibold',
                                                        isToday ? 'bg-blue-500/[0.06] text-blue-400' : 'text-[#848494]',
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5',
                                                            isToday && 'bg-blue-500/10',
                                                        )}
                                                    >
                                                        {label}
                                                        {isToday && <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />}
                                                    </span>
                                                </th>
                                            )
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {hours.map((hour) => {
                                        const hourMap = timetable.get(hour)!
                                        const todayStatus = getTimeStatus(hour, currentHour)

                                        return (
                                            <tr key={hour} className="border-b border-[#3a3a44] last:border-b-0">
                                                <td
                                                    className={cn(
                                                        'px-3 py-2.5 text-center text-xs font-semibold',
                                                        todayStatus === 'current' ? 'text-blue-400' : 'text-[#6f6f7b]',
                                                    )}
                                                >
                                                    {String(hour).padStart(2, '0')}시
                                                </td>
                                                {DAY_LABELS.map((_, dayIndex) => {
                                                    const isToday = dayIndex === todayIndex
                                                    const cellSources = hourMap.get(dayIndex) ?? []
                                                    const isEmpty = cellSources.length === 0

                                                    return (
                                                        <td
                                                            key={dayIndex}
                                                            className={cn(
                                                                'px-1.5 py-2 align-top',
                                                                isToday && 'bg-blue-500/[0.06]',
                                                                isToday && todayStatus === 'past' && 'bg-blue-500/[0.03]',
                                                                isToday && todayStatus === 'current' && 'bg-blue-500/[0.08]',
                                                            )}
                                                        >
                                                            {isToday && todayStatus === 'current' && !isEmpty && (
                                                                <div className="mb-1.5 flex items-center justify-center">
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                                                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                                                                        진행중
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {isEmpty ? (
                                                                <div className="flex min-h-[28px] items-center justify-center">
                                                                    <span className="text-[10px] text-[#3a3a44]">—</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {cellSources.map((source) => (
                                                                        <span
                                                                            key={source.id}
                                                                            className={cn(
                                                                                'inline-block rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-tight',
                                                                                getSourceStyle(source.source_type),
                                                                                isToday && todayStatus === 'past' && 'opacity-45',
                                                                            )}
                                                                        >
                                                                            {source.streamers.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}
