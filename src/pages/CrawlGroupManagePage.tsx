import { useMemo } from 'react'
import { useScheduleSources } from '../hooks'
import { cn } from '../lib/cn'
import type { ScheduleSourceItem } from '../types'
import { panelClass } from '../constants/styles'
import { ListEmpty, ListError, ListLoading } from '../components/ListState'

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const

interface ScheduleGroup {
    key: string
    crawl_days: number[]
    crawl_hour: number
    sources: ScheduleSourceItem[]
}

function getSourceStyle(sourceType: string): string {
    if (sourceType === 'chzzk_community' || sourceType === 'chzzk') {
        return 'border-green-500/35 bg-green-500/10 text-green-300'
    }
    if (sourceType === 'fan_cafe') {
        return 'border-orange-500/35 bg-orange-500/10 text-orange-300'
    }
    return 'border-[#3a3a44] bg-[#26262e] text-[#adadb8]'
}

export default function CrawlGroupManagePage() {
    const { data: sources = [], isLoading, isError, refetch } = useScheduleSources()

    const groups = useMemo<ScheduleGroup[]>(() => {
        const grouped = sources.reduce<Map<string, ScheduleGroup>>((acc, source) => {
            const crawlDays = [...source.crawl_days].sort((a, b) => a - b)
            const key = `${crawlDays.join(',')}-${source.crawl_hour}`
            const current = acc.get(key)

            if (current !== undefined) {
                current.sources.push(source)
                return acc
            }

            acc.set(key, {
                key,
                crawl_days: crawlDays,
                crawl_hour: source.crawl_hour,
                sources: [source],
            })
            return acc
        }, new Map<string, ScheduleGroup>())

        return [...grouped.values()].sort((a, b) => {
            if (a.crawl_hour !== b.crawl_hour) {
                return a.crawl_hour - b.crawl_hour
            }
            return a.crawl_days.join(',').localeCompare(b.crawl_days.join(','))
        })
    }, [sources])

    return (
        <>
            <div className="mb-6">
                <h1 className="text-xl font-bold text-[#efeff1]">크롤링 스케줄 현황</h1>
                <p className="mt-1 text-sm text-[#adadb8]">요일·시간대별 크롤링 스케줄 현황입니다</p>
            </div>

            <div className={panelClass}>
                {isLoading && <ListLoading />}
                {isError && <ListError message="스케줄 현황을 불러오는 중 오류가 발생했습니다." onRetry={() => void refetch()} />}
                {!isLoading && !isError && groups.length === 0 && <ListEmpty message="등록된 크롤링 스케줄이 없습니다." />}

                {!isLoading && !isError && groups.length > 0 && (
                    <ul className="divide-y divide-[#3a3a44]">
                        {groups.map((group) => (
                            <li key={group.key} className="space-y-2 px-4 py-3">
                                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                    {group.crawl_days.map((day) => (
                                        <span
                                            key={`${group.key}-${day}`}
                                            className="rounded-full border border-blue-500/35 bg-blue-500/15 px-2 py-0.5 font-semibold text-blue-300"
                                        >
                                            {DAY_LABELS[day]}
                                        </span>
                                    ))}
                                    <span className="rounded-full border border-[#3a3a44] bg-[#26262e] px-2 py-0.5 font-semibold text-[#efeff1]">
                                        {String(group.crawl_hour).padStart(2, '0')}시
                                    </span>
                                    <span className="text-[#848494]">·</span>
                                    <span className="text-[#adadb8]">{group.sources.length}명</span>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {group.sources.map((source) => (
                                        <span
                                            key={source.id}
                                            className={cn('rounded-lg border px-2 py-1 text-xs font-medium', getSourceStyle(source.source_type))}
                                        >
                                            {source.streamers.name}
                                        </span>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    )
}
