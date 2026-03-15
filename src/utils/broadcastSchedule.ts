import { DAY_NAMES_SHORT } from '../constants/date'
import {
    BROADCAST_TYPES,
    BROADCAST_TYPE_GRADIENT,
    BROADCAST_TYPE_GRADIENT_DEFAULT,
} from '../constants/broadcast'
import type { Broadcast, Participant, ScheduleMonthlyResponse, ScheduleWeeklyResponse } from '../types'
import type { BroadcastDateGroup, BroadcastFormState, BroadcastDraftParticipant } from '../types/broadcastSchedule'

export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'))
export const MINUTE_OPTIONS = ['00', '30']

export function readTypeGradientClass(type?: string | null): string {
    return type !== undefined && type !== null ? BROADCAST_TYPE_GRADIENT[type] ?? BROADCAST_TYPE_GRADIENT_DEFAULT : BROADCAST_TYPE_GRADIENT_DEFAULT
}

export function toDateString(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

export function formatDisplayDate(isoString: string): string {
    const d = new Date(isoString)
    return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_NAMES_SHORT[d.getDay()]})`
}

export function formatTime(isoString: string): string {
    const d = new Date(isoString)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function toLocalDateInput(isoString: string): string {
    const d = new Date(isoString)
    const y = d.getFullYear()
    const mo = String(d.getMonth() + 1).padStart(2, '0')
    const da = String(d.getDate()).padStart(2, '0')
    return `${y}-${mo}-${da}`
}

export function toLocalHourInput(isoString: string): string {
    const d = new Date(isoString)
    const hour = d.getHours()
    return String(hour).padStart(2, '0')
}

export function toLocalMinuteInput(isoString: string): string {
    const d = new Date(isoString)
    const minute = d.getMinutes()
    const normalizedMinute = minute < 30 ? 0 : 30
    return String(normalizedMinute).padStart(2, '0')
}

export function buildLocalDatetime(date: string, hour: string, minute: string): string | null {
    if (date.length === 0 || hour.length === 0 || minute.length === 0) {
        return null
    }
    return `${date}T${hour}:${minute}`
}

export function localDatetimeToISO(local: string): string {
    return new Date(local).toISOString()
}

export function parseTagInput(value: string): string[] {
    return value
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
}

export function formatTagInput(tags: readonly string[]): string {
    return tags.join(', ')
}

export function collectQuickTags(participants: readonly BroadcastDraftParticipant[]): string[] {
    const seen = new Set<string>()
    for (const participant of participants) {
        const affiliations = participant.affiliations ?? []
        for (const affiliation of affiliations) {
            const normalizedName = affiliation.name.trim()
            if (normalizedName.length === 0 || seen.has(normalizedName)) {
                continue
            }
            seen.add(normalizedName)
        }
    }
    return [...seen]
}

export function collectBroadcasts(
    data: ScheduleWeeklyResponse | ScheduleMonthlyResponse | undefined,
): BroadcastDateGroup[] {
    if (data === undefined) return []
    return data.days.map((day) => ({ date: day.date, broadcasts: day.items }))
}

export function toParticipantDrafts(participants: Participant[] | undefined): BroadcastDraftParticipant[] {
    if (participants === undefined) return []
    return participants.map((participant) => ({
        name: participant.name,
        streamerId: participant.streamerId !== undefined && participant.streamerId !== null ? participant.streamerId : undefined,
        isHost: participant.isHost ?? false,
        avatarUrl: participant.avatarUrl ?? undefined,
        isPartner: participant.isPartner ?? false,
        affiliations: participant.affiliations ?? [],
    }))
}

export function initFormState(broadcast?: Broadcast): BroadcastFormState {
    if (broadcast === undefined) {
        return {
            title: '',
            broadcastType: BROADCAST_TYPES[0],
            categoryId: null,
            startDate: '',
            startHour: '',
            startMinute: '',
            endDate: '',
            endHour: '',
            endMinute: '',
            tags: '',
            isVisible: false,
            isChzzkSupport: false,
            participants: [],
        }
    }
    const startDate = toLocalDateInput(broadcast.startTime)
    const startHour = toLocalHourInput(broadcast.startTime)
    const startMinute = toLocalMinuteInput(broadcast.startTime)
    const endDate = broadcast.endTime !== undefined && broadcast.endTime !== null ? toLocalDateInput(broadcast.endTime) : ''
    const endHour = broadcast.endTime !== undefined && broadcast.endTime !== null ? toLocalHourInput(broadcast.endTime) : ''
    const endMinute = broadcast.endTime !== undefined && broadcast.endTime !== null ? toLocalMinuteInput(broadcast.endTime) : ''
    return {
        title: broadcast.title,
        broadcastType: broadcast.broadcastType ?? BROADCAST_TYPES[0],
        categoryId: broadcast.category?.id ?? null,
        startDate,
        startHour,
        startMinute,
        endDate,
        endHour,
        endMinute,
        tags: (broadcast.tags ?? []).join(', '),
        isVisible: broadcast.isVisible ?? true,
        isChzzkSupport: broadcast.isChzzkSupport ?? false,
        participants: toParticipantDrafts(broadcast.participants),
    }
}
