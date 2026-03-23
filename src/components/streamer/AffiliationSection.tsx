import { useEffect, useMemo, useState } from 'react'
import { Check, Tag } from 'lucide-react'
import { cn } from '../../lib/cn'

interface AffiliationSectionProps {
    streamerId: number
    currentAffiliations: { id: number; name: string }[]
    allAffiliations: { id: number; name: string }[]
    pending: boolean
    onSave: (id: number, affiliationIds: number[]) => Promise<void>
}

export function AffiliationSection({ streamerId, currentAffiliations, allAffiliations, pending, onSave }: AffiliationSectionProps) {
    const [selectedAffIds, setSelectedAffIds] = useState<number[]>(() => currentAffiliations.map((aff) => aff.id))

    useEffect(() => {
        setSelectedAffIds(currentAffiliations.map((aff) => aff.id))
    }, [currentAffiliations])

    const currentAffIds = useMemo(() => new Set(currentAffiliations.map((aff) => aff.id)), [currentAffiliations])
    const hasAffiliationChanges = selectedAffIds.length !== currentAffIds.size || selectedAffIds.some((id) => !currentAffIds.has(id))

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-medium text-[#adadb8]">
                    <Tag className="h-3.5 w-3.5" /> 소속
                </label>
                {hasAffiliationChanges && (
                    <button
                        type="button"
                        onClick={() => {
                            void onSave(streamerId, selectedAffIds)
                        }}
                        disabled={pending}
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
                                    setSelectedAffIds((prev) => (selected ? prev.filter((id) => id !== aff.id) : [...prev, aff.id]))
                                }}
                                disabled={pending}
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
    )
}
