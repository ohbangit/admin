import { DEFAULT_OVERWATCH_MAP_TYPE, OVERWATCH_MAP_TYPES, TOURNAMENT_MAP_TYPE_BY_MAP_NAME } from '../constants/overwatch'
import type {
    MatchStatus,
    OverwatchSetMap,
    ScheduleContent,
    ScheduleGroup,
    ScheduleMatch,
    TournamentOverwatchMapType,
    TournamentAdminTeam,
} from '../types'

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
    SCHEDULED: '예정',
    COMPLETED: '완료',
    CANCELLED: '취소',
}

export function toOverwatchMapType(value: unknown): TournamentOverwatchMapType | null {
    if (typeof value !== 'string') return null
    return OVERWATCH_MAP_TYPES.includes(value as TournamentOverwatchMapType) ? (value as TournamentOverwatchMapType) : null
}

export function inferMapTypeFromMapName(mapName: string | null): TournamentOverwatchMapType | null {
    if (mapName === null) return null
    return (TOURNAMENT_MAP_TYPE_BY_MAP_NAME[mapName] as TournamentOverwatchMapType | undefined) ?? null
}

export function createDefaultSetMap(setNumber: number): OverwatchSetMap {
    return {
        setNumber,
        mapType: DEFAULT_OVERWATCH_MAP_TYPE,
        mapName: null,
        scoreA: null,
        scoreB: null,
    }
}

export function toSetMaps(match: Record<string, unknown>): OverwatchSetMap[] {
    if (Array.isArray(match.setMaps)) {
        return match.setMaps
            .map((value, index) => {
                if (typeof value !== 'object' || value === null) return null
                const set = value as Record<string, unknown>
                return {
                    setNumber: typeof set.setNumber === 'number' ? set.setNumber : index + 1,
                    mapType:
                        toOverwatchMapType(set.mapType) ??
                        inferMapTypeFromMapName(typeof set.mapName === 'string' ? set.mapName : null) ??
                        DEFAULT_OVERWATCH_MAP_TYPE,
                    mapName: typeof set.mapName === 'string' ? set.mapName : null,
                    scoreA: typeof set.scoreA === 'number' ? set.scoreA : null,
                    scoreB: typeof set.scoreB === 'number' ? set.scoreB : null,
                }
            })
            .filter((set): set is OverwatchSetMap => set !== null)
    }

    const fallbackType = toOverwatchMapType(match.mapType)
    const fallbackName = typeof match.mapName === 'string' ? match.mapName : null

    if (fallbackType !== null || fallbackName !== null) {
        return [
            {
                setNumber: 1,
                mapType: fallbackType ?? inferMapTypeFromMapName(fallbackName) ?? DEFAULT_OVERWATCH_MAP_TYPE,
                mapName: fallbackName,
                scoreA: null,
                scoreB: null,
            },
        ]
    }

    return []
}

export function parseScheduleContent(raw: Record<string, unknown>): ScheduleContent {
    const rawGroups = Array.isArray(raw.groups) ? raw.groups : []
    return {
        groups: rawGroups.map((g: unknown) => {
            const group = g as Record<string, unknown>
            const rawMatches = Array.isArray(group.matches) ? (group.matches as unknown[]) : []

            return {
                ...group,
                matches: rawMatches.map((m: unknown) => {
                    const match = m as Record<string, unknown>
                    return {
                        ...match,
                        mvpPlayerIds: Array.isArray(match.mvpPlayerIds) ? (match.mvpPlayerIds as number[]) : [],
                        mapType: toOverwatchMapType(match.mapType),
                        mapName: typeof match.mapName === 'string' ? match.mapName : null,
                        setMaps: toSetMaps(match),
                    } as ScheduleMatch
                }),
            } as ScheduleGroup
        }),
    }
}

export function getMvpCandidates(match: ScheduleMatch, teams: TournamentAdminTeam[]) {
    const validTeamIds = new Set<number>([match.teamAId, match.teamBId])

    return teams
        .filter((team) => validTeamIds.has(team.id))
        .flatMap((team) =>
            team.members
                .filter((member) => member.slot !== 'HEAD_COACH' && member.slot !== 'COACH')
                .map((member) => ({ id: member.id, name: member.name, teamName: team.name })),
        )
}

export function upsertSetMap(match: ScheduleMatch, setIndex: number, patch: Partial<OverwatchSetMap>): OverwatchSetMap[] {
    const next = [...(match.setMaps ?? [])]
    const current = next[setIndex] ?? createDefaultSetMap(setIndex + 1)
    next[setIndex] = { ...current, ...patch, setNumber: setIndex + 1 }
    return next.map((setMap, index) => ({ ...setMap, setNumber: index + 1 }))
}
