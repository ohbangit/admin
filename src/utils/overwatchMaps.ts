import type { OverwatchMapType } from '../types/overwatch'

interface MapTypeConfig {
    label: string
    color: string
    maps: readonly string[]
}

export const OVERWATCH_MAP_TYPE_CONFIG = {
    쟁탈: {
        label: '쟁탈',
        color: 'violet', // 보라
        maps: ['리장 타워', '부산', '오아시스', '네팔', '일리오스', '사모아'],
    },
    혼합: {
        label: '혼합',
        color: 'orange', // 주황
        maps: ['블리자드 월드', '할리우드', '킹스 로우', '아이헨발데', '누바니', '파라이소'],
    },
    밀기: {
        label: '밀기',
        color: 'blue', // 파랑
        maps: ['콜로세오', '에스페란사', '뉴 퀸 스트리트', '런던 클럭워크'],
    },
    호위: {
        label: '호위',
        color: 'green', // 초록
        maps: ['도라도', '루트 66', '지브롤터', '리알토', '하바나', '서킷 로얄'],
    },
} as const satisfies Record<OverwatchMapType, MapTypeConfig>
