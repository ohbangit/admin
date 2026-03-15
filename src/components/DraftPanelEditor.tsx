import { useState } from 'react'
import { CalendarPicker } from './CalendarPicker'
import type { DraftContent, DraftParticipant } from '../types'

interface DraftPanelEditorProps {
    content: Record<string, unknown>
    onSave: (content: DraftContent) => Promise<void>
    isSaving: boolean
}

function parseDraftContent(raw: Record<string, unknown>): DraftContent {
    const parsedParticipants = Array.isArray(raw.participants)
        ? (raw.participants as DraftParticipant[]).map((participant, index) => ({
              id: participant.id,
              streamerId: typeof participant.streamerId === 'number' ? participant.streamerId : null,
              name: participant.name,
              channelId: typeof participant.channelId === 'string' ? participant.channelId : null,
              teamId: typeof participant.teamId === 'number' ? participant.teamId : null,
              position: ['TNK', 'DPS', 'SPT'].includes(participant.position as string)
                  ? (participant.position as 'TNK' | 'DPS' | 'SPT')
                  : null,
              avatarUrl: typeof participant.avatarUrl === 'string' ? participant.avatarUrl : null,
              isPartner: participant.isPartner === true,
              isCaptain: participant.isCaptain === true,
              order: typeof participant.order === 'number' ? participant.order : index,
          }))
        : []
    return {
        startsOn: typeof raw.startsOn === 'string' ? raw.startsOn : null,
        meta: typeof raw.meta === 'string' ? raw.meta : '',
        participants: parsedParticipants,
    }
}

export function DraftPanelEditor({ content, onSave, isSaving }: DraftPanelEditorProps) {
    const parsed = parseDraftContent(content)
    const [startsOn, setStartsOn] = useState(parsed.startsOn ?? '')
    const [meta, setMeta] = useState(parsed.meta)
    // participants는 이 에디터에서 수정하지 않음 — ParticipantEditor에서 관리
    const participants: DraftParticipant[] = parsed.participants

    async function handleSave() {
        await onSave({
            startsOn: startsOn.trim().length > 0 ? startsOn : null,
            meta,
            participants,
        })
    }

    return (
        <div className="mt-3 space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-[#2e2e38] dark:bg-[#20202a]">
            {/* 드래프트 일정 */}
            <div>
                <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-[#adadb8]">드래프트 일자</p>
                <CalendarPicker value={startsOn.length > 0 ? startsOn : null} onChange={(v) => setStartsOn(v ?? '')} />
            </div>

            {/* 메타 메모 */}
            <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500 dark:text-[#adadb8]">메모 (선택)</label>
                <textarea
                    value={meta}
                    onChange={(e) => setMeta(e.target.value)}
                    rows={2}
                    placeholder="드래프트 관련 추가 설명"
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1] dark:placeholder-[#6b6b7a]"
                />
            </div>

            {/* 저장 */}
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => {
                        void handleSave()
                    }}
                    disabled={isSaving}
                    className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
                >
                    {isSaving ? '저장 중...' : '드래프트 저장'}
                </button>
            </div>
        </div>
    )
}
