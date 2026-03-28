import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, Tag, X } from 'lucide-react'
import { cn } from '../../lib/cn'

const TYPE_LABELS: Record<'mcn' | 'agency' | 'crew' | 'esports', string> = {
    mcn: 'MCN',
    agency: '소속사',
    crew: '크루',
    esports: '프로게임단',
}

const TYPE_ORDER: Array<'mcn' | 'agency' | 'crew' | 'esports'> = ['mcn', 'agency', 'crew', 'esports']

interface AffiliationEntry {
    id: number
    name: string
    type: 'mcn' | 'agency' | 'crew' | 'esports'
}

interface AffiliationSectionProps {
    allAffiliations: AffiliationEntry[]
    selectedIds: number[]
    onChange: (ids: number[]) => void
}

export function AffiliationSectionDropdown({ allAffiliations, selectedIds, onChange }: AffiliationSectionProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setSearchQuery('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const selectedEntries = useMemo(() => allAffiliations.filter((aff) => selectedIds.includes(aff.id)), [allAffiliations, selectedIds])

    const filteredGrouped = useMemo(() => {
        const q = searchQuery.toLowerCase()
        return TYPE_ORDER.map((type) => ({
            type,
            label: TYPE_LABELS[type],
            items: allAffiliations.filter((aff) => aff.type === type && (q === '' || aff.name.toLowerCase().includes(q))),
        })).filter((group) => group.items.length > 0)
    }, [allAffiliations, searchQuery])

    const toggle = (id: number) => {
        const newIds = selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]
        onChange(newIds)
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-medium text-[#adadb8]">
                    <Tag className="h-3.5 w-3.5" /> 소속
                </label>
            </div>
            <div ref={containerRef} className="relative space-y-2">
                {selectedEntries.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {selectedEntries.map((aff) => (
                            <span
                                key={aff.id}
                                className="inline-flex items-center gap-1 rounded-full border border-blue-500/40 bg-blue-500/15 px-2.5 py-1 text-xs font-semibold text-blue-300"
                            >
                                {aff.name}
                                <button
                                    type="button"
                                    onClick={() => toggle(aff.id)}
                                    className="cursor-pointer ml-0.5 rounded-full text-blue-300/70 transition hover:text-blue-200"
                                    aria-label={`${aff.name} 제거`}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="flex w-full items-center gap-2 rounded-xl border border-[#3a3a44] bg-[#1e1e26] px-3 py-2 text-xs text-[#848494] transition hover:border-[#5a5a64]"
                >
                    <Search className="h-3.5 w-3.5 shrink-0" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setIsOpen(true)
                        }}
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsOpen(true)
                        }}
                        placeholder="소속 검색..."
                        className="flex-1 bg-transparent outline-none placeholder:text-[#848494]"
                    />
                    <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform', isOpen && 'rotate-180')} />
                </button>
                {isOpen && (
                    <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-[#3a3a44] bg-[#1e1e26] shadow-xl">
                        {filteredGrouped.length > 0 ? (
                            filteredGrouped.map((group) => (
                                <div key={group.type}>
                                    <p className="sticky top-0 bg-[#1e1e26] px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#848494]">
                                        {group.label}
                                    </p>
                                    {group.items.map((aff) => {
                                        const selected = selectedIds.includes(aff.id)
                                        return (
                                            <button
                                                key={aff.id}
                                                type="button"
                                                onClick={() => toggle(aff.id)}
                                                className={cn(
                                                    'flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-xs transition',
                                                    selected ? 'bg-blue-500/10 text-blue-300' : 'text-[#adadb8] hover:bg-[#26262e]',
                                                )}
                                            >
                                                <Check className={cn('h-3.5 w-3.5 shrink-0 transition', selected ? 'opacity-100' : 'opacity-0')} />
                                                <span className="opacity-60">[{TYPE_LABELS[aff.type]}]</span>
                                                {aff.name}
                                            </button>
                                        )
                                    })}
                                </div>
                            ))
                        ) : (
                            <p className="px-3 py-3 text-xs text-[#848494]">검색 결과가 없습니다.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
