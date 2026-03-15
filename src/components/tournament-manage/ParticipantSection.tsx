import { ParticipantEditor } from '../index'
import { cn } from '../../lib/cn'
import type { DraftParticipant } from '../../types'

interface ParticipantSectionProps {
    participants: DraftParticipant[]
    isCollapsed: boolean
    isSaving: boolean
    onToggleCollapsed: () => void
    onSave: (participants: DraftParticipant[]) => Promise<void>
}

export function ParticipantSection({ isCollapsed, isSaving, onSave, onToggleCollapsed, participants }: ParticipantSectionProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-[#3a3a44] dark:bg-[#1a1a23]">
            <button
                type="button"
                onClick={onToggleCollapsed}
                aria-expanded={!isCollapsed}
                aria-controls="participant-editor-panel"
                className={cn('flex w-full items-center justify-between px-4 py-3 text-left', isCollapsed ? '' : 'border-b border-gray-100 dark:border-[#2e2e38]')}
            >
                <span>
                    <p className="text-sm font-semibold text-gray-700 dark:text-[#efeff1]">참여자 목록</p>
                    <p className="text-xs text-gray-400 dark:text-[#adadb8]">드래프트에 참여할 스트리머를 추가하고 포지션을 설정합니다.</p>
                </span>
                <span className="text-xs text-gray-500 dark:text-[#adadb8]">{isCollapsed ? '펼치기' : '접기'}</span>
            </button>
            <div id="participant-editor-panel" className={isCollapsed ? 'hidden' : 'block'}>
                <ParticipantEditor participants={participants} onSave={onSave} isSaving={isSaving} />
            </div>
        </section>
    )
}
