import type { AffiliationItem } from '../../types/affiliation'
import { getAffiliationColor } from '../../types/affiliation'
import { cn } from '../../lib/cn'

interface AffiliationBadgeProps {
    affiliation: AffiliationItem
    size?: 'sm' | 'md'
}

export function AffiliationBadge({ affiliation, size = 'sm' }: AffiliationBadgeProps) {
    const color = getAffiliationColor(affiliation)
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full font-medium leading-none',
                size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs',
            )}
            style={{
                backgroundColor: `${color}20`,
                color,
                outline: `1px solid ${color}40`,
            }}
        >
            {affiliation.name}
        </span>
    )
}
