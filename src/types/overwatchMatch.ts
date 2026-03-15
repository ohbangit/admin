import type { MatchFormat, OverwatchMapType, SetResult } from '../types/overwatch'

/** 세트 편집 입력 타입 */
export interface OverwatchSetInput {
    setNumber: number
    mapType: OverwatchMapType
    mapName: string | null
    result: SetResult
    isPlayed: boolean
    roundScore?: string
}

/** 경기 전체 편집 입력 타입 (upsert용) */
export interface OverwatchMatchInput {
    format: MatchFormat
    homeTeam: string
    awayTeam: string
    isCompleted: boolean
    sets: OverwatchSetInput[]
}
