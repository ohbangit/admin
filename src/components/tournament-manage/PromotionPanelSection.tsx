import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import type { PromotionPanelType } from '../../types'
import { PANEL_LABELS } from '../../utils'

interface PromotionPanelSectionProps {
    panelId: number
    panelType: PromotionPanelType
    collapsed: boolean
    children: ReactNode
    onToggle: (panelId: number) => void
}

export function PromotionPanelSection({ children, collapsed, onToggle, panelId, panelType }: PromotionPanelSectionProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-[#3a3a44] dark:bg-[#1a1a23]">
            <button
                type="button"
                onClick={() => onToggle(panelId)}
                aria-expanded={!collapsed}
                aria-controls={`promotion-editor-panel-${panelId}`}
                className={cn(
                    'flex w-full items-center justify-between px-4 py-3 text-left',
                    collapsed ? '' : 'border-b border-gray-100 dark:border-[#2e2e38]',
                )}
            >
                <span>
                    <p className="text-sm font-semibold text-gray-700 dark:text-[#efeff1]">{PANEL_LABELS[panelType]}</p>
                    <p className="text-xs text-gray-400 dark:text-[#adadb8]">선수 목록과 같은 레벨에서 편집하는 섹션입니다.</p>
                </span>
                <span className="text-xs text-gray-500 dark:text-[#adadb8]">{collapsed ? '펼치기' : '접기'}</span>
            </button>
            <div id={`promotion-editor-panel-${panelId}`} className={collapsed ? 'hidden' : 'block'}>
                <div className="p-4">{children}</div>
            </div>
        </section>
    )
}
