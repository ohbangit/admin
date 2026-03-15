import { cn } from '../../lib/cn'
import type { PromotionPanelType, TournamentPromotionPanel } from '../../types'
import { PANEL_ICONS, PANEL_LABELS } from '../../utils'

interface PromotionSetupPanelProps {
    createPromotionPending: boolean
    draggingPanelId: number | null
    hoveredPanelId: number | null
    isPromotionLoading: boolean
    hasPromotionData: boolean
    sortedPanels: TournamentPromotionPanel[]
    onCreatePromotion: () => void
    onDragStartPanel: (panelId: number) => void
    onDragEndPanel: () => void
    onDragOverPanel: (panelId: number) => void
    onDropPanel: (panelId: number) => void
    onTogglePanelVisibility: (panelId: number) => void
    onTogglePanelDefaultExpanded: (panelId: number) => void
}

export function PromotionSetupPanel({
    createPromotionPending,
    draggingPanelId,
    hasPromotionData,
    hoveredPanelId,
    isPromotionLoading,
    onCreatePromotion,
    onDragEndPanel,
    onDragOverPanel,
    onDragStartPanel,
    onDropPanel,
    onTogglePanelDefaultExpanded,
    onTogglePanelVisibility,
    sortedPanels,
}: PromotionSetupPanelProps) {
    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-[#2e2e38] dark:bg-[#20202a]">
            <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-[#adadb8]">대회 구성요소</p>
            {isPromotionLoading && <p className="text-xs text-gray-400 dark:text-[#adadb8]">구성요소 불러오는 중...</p>}
            {!isPromotionLoading && !hasPromotionData && (
                <button
                    type="button"
                    onClick={onCreatePromotion}
                    disabled={createPromotionPending}
                    className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-600 disabled:opacity-50"
                >
                    {createPromotionPending ? '생성 중...' : '대회 구성 설정 생성'}
                </button>
            )}
            {hasPromotionData && (
                <div className="flex flex-wrap gap-2 pb-1">
                    {sortedPanels.map((panel) => (
                        <div
                            key={`picker-${panel.id}`}
                            draggable
                            onDragStart={() => onDragStartPanel(panel.id)}
                            onDragEnd={onDragEndPanel}
                            onDragOver={(event) => {
                                event.preventDefault()
                                onDragOverPanel(panel.id)
                            }}
                            onDrop={(event) => {
                                event.preventDefault()
                                onDropPanel(panel.id)
                            }}
                            className={cn(
                                'w-full rounded-xl border px-3 py-2 transition sm:w-44 sm:shrink-0',
                                'cursor-grab active:cursor-grabbing',
                                draggingPanelId === panel.id ? 'opacity-50' : '',
                                hoveredPanelId === panel.id && draggingPanelId !== null && draggingPanelId !== panel.id
                                    ? 'border-blue-400 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/10'
                                    : 'border-gray-200 bg-white dark:border-[#2e2e38] dark:bg-[#1a1a23]',
                            )}
                        >
                            <div className="mb-2 flex items-center gap-2">
                                <span className="text-base">{PANEL_ICONS[panel.type as PromotionPanelType]}</span>
                                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700 dark:text-[#efeff1]">
                                    {PANEL_LABELS[panel.type as PromotionPanelType]}
                                </span>
                                <span className="text-[10px] text-gray-300 dark:text-[#3a3a44]">☰</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => onTogglePanelVisibility(panel.id)}
                                className={cn(
                                    'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition',
                                    panel.enabled && !panel.hidden
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-gray-100 text-gray-500 dark:bg-[#2e2e38] dark:text-[#adadb8]',
                                )}
                            >
                                <span>{panel.enabled && !panel.hidden ? 'ON' : 'OFF'}</span>
                                <span>{panel.enabled && !panel.hidden ? '노출' : '비노출'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => onTogglePanelDefaultExpanded(panel.id)}
                                className={cn(
                                    'mt-1 flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition',
                                    panel.content.defaultExpanded === true
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'bg-gray-100 text-gray-500 dark:bg-[#2e2e38] dark:text-[#adadb8]',
                                )}
                            >
                                <span>기본 펼침</span>
                                <span>{panel.content.defaultExpanded === true ? 'ON' : 'OFF'}</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
