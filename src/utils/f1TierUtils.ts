import type { F1Driver, F1DriversContent } from '../types'

export const TIER_FORMAT_REGEX = /^([1-6])성(\+)?$/
export const MAX_TIER_STARS = 6

export function parseF1DriversContent(raw: Record<string, unknown>): F1DriversContent {
    const rawParticipants = Array.isArray(raw.participants) ? (raw.participants as unknown[]) : []

    return {
        participants: rawParticipants.map((p: unknown, index: number) => {
            const driver = (typeof p === 'object' && p !== null ? p : {}) as Record<string, unknown>

            return {
                id: typeof driver.id === 'string' ? driver.id : crypto.randomUUID(),
                streamerId: typeof driver.streamerId === 'number' ? driver.streamerId : null,
                name: typeof driver.name === 'string' ? driver.name : '',
                nickname: typeof driver.nickname === 'string' ? driver.nickname : undefined,
                avatarUrl: typeof driver.avatarUrl === 'string' ? driver.avatarUrl : null,
                channelUrl: typeof driver.channelUrl === 'string' ? driver.channelUrl : null,
                isPartner: driver.isPartner === true,
                driverRole: driver.driverRole === 'SECOND' ? 'SECOND' : 'FIRST',
                tier: typeof driver.tier === 'string' ? driver.tier : null,
                ranking: typeof driver.ranking === 'number' ? driver.ranking : null,
                participationCount: typeof driver.participationCount === 'number' ? driver.participationCount : 0,
                winCount: typeof driver.winCount === 'number' ? driver.winCount : 0,
                carNumber: typeof driver.carNumber === 'number' ? driver.carNumber : null,
                secondGroup: driver.secondGroup === 'A' || driver.secondGroup === 'B' ? driver.secondGroup : null,
                qualifyingEliminated: driver.qualifyingEliminated === true,
                order: typeof driver.order === 'number' ? driver.order : index,
            } satisfies F1Driver
        }),
    }
}

export function normalizeTier(value: string): string | null {
    const compact = value.trim().replace(/\s+/g, '')
    if (compact.length === 0) return null
    const match = compact.match(TIER_FORMAT_REGEX)
    if (match === null) return null
    const stars = match[1]
    const plus = match[2] === '+' ? '+' : ''
    return `${stars}성${plus}`
}

export function tierStringToValue(value: string | null): number | null {
    if (value === null) return null
    const normalized = normalizeTier(value)
    if (normalized === null) return null
    const match = normalized.match(TIER_FORMAT_REGEX)
    if (match === null) return null
    const stars = Number(match[1])
    const hasPlus = match[2] === '+'
    return stars + (hasPlus ? 0.5 : 0)
}

export function tierValueToString(value: number | null): string | null {
    if (value === null || value <= 0) return null
    const full = Math.floor(value)
    const hasHalf = value - full >= 0.5
    if (full < 1 || full > MAX_TIER_STARS) return null
    return `${full}성${hasHalf ? '+' : ''}`
}

export function isValidTier(value: string | null): boolean {
    if (value === null) return true
    return TIER_FORMAT_REGEX.test(value.trim().replace(/\s+/g, ''))
}
