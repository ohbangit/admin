export const OVERWATCH_MAP_TYPES = ['쟁탈', '혼합', '밀기', '호위', '플레시포인트'] as const
export type OverwatchMapType = (typeof OVERWATCH_MAP_TYPES)[number]

export const DEFAULT_OVERWATCH_MAP_TYPE: OverwatchMapType = '쟁탈'

export const TOURNAMENT_OVERWATCH_MAP_OPTIONS: Record<OverwatchMapType, readonly string[]> = {
    쟁탈: ['남극반도', '네팔', '리장타워', '부산', '오아시스', '일리오스', '사모아'],
    혼합: ['눔바니', '미드타운', '블리자드월드', '아이헨발데', '할리우드', '파라이수', '왕의 길'],
    밀기: ['루나사피', '콜로세오', '이스페란사', '뉴 퀸 스트리트'],
    호위: ['66번 국도', '감시기지:지브롤터', '도라도', '리알토', '서킷 로얄', '삼발리 수도원', '쓰레기촌', '하바나'],
    플레시포인트: ['뉴 정크 시티', '수라바사', '아틀리스'],
}

export const TOURNAMENT_OVERWATCH_MAP_ENTRIES = OVERWATCH_MAP_TYPES.flatMap((mapType) =>
    TOURNAMENT_OVERWATCH_MAP_OPTIONS[mapType].map((mapName) => ({ mapType, mapName })),
)

export const TOURNAMENT_MAP_TYPE_BY_MAP_NAME: Record<string, OverwatchMapType> = TOURNAMENT_OVERWATCH_MAP_ENTRIES.reduce<
    Record<string, OverwatchMapType>
>((acc, entry) => {
    acc[entry.mapName] = entry.mapType
    return acc
}, {})
