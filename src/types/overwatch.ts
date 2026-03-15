/** 오버워치 맵 타입 4종 */
export type OverwatchMapType = '쟁탈' | '혼합' | '밀기' | '호위'

/** 세트 결과 (경기 종료 후) */
export type SetResult = 'home' | 'away' | null // null = 미완료/예정

/** 오버워치 단일 세트 정보 */
export interface OverwatchSet {
    setNumber: number // 1~7
    mapType: OverwatchMapType
    mapName: string | null // null = TBD (경기 전 미확정)
    result: SetResult // 어느 팀이 세트 승리했는지
    isPlayed: boolean // 실제 진행된 세트 여부 (BO5에서 4세트 만에 끝나면 5세트는 false)
    roundScore?: string // 쟁탈 전용: 라운드 점수 (예: "2:1")
}

/** 경기 포맷 */
export type MatchFormat = 'bo3' | 'bo5' | 'bo7'

/** 경기 전체 정보 */
export interface OverwatchMatchInfo {
    format: MatchFormat
    sets: OverwatchSet[] // 최소 2, 최대 7개
    homeTeam: string // 홈팀명 (참여자 중 1명)
    awayTeam: string // 어웨이팀명
    homeWins: number // 현재 홈팀 세트 승수
    awayWins: number // 현재 어웨이팀 세트 승수
    isCompleted: boolean // 경기 완료 여부
}
