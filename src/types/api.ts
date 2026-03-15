import type { Broadcast } from './schedule'

export type BroadcastDetailResponse = Broadcast

interface ScheduleDayEntry {
    date: string
    totalCount: number
    items: Broadcast[]
}

export interface ScheduleDailyResponse {
    view: 'daily'
    date: string
    totalCount: number
    items: Broadcast[]
}

export interface ScheduleWeeklyResponse {
    view: 'weekly'
    weekStart: string
    weekEnd: string
    days: ScheduleDayEntry[]
}

export interface ScheduleMonthlyResponse {
    view: 'monthly'
    month: string
    gridStart: string
    gridEnd: string
    days: ScheduleDayEntry[]
}

export type ScheduleResponse =
    | ScheduleDailyResponse
    | ScheduleWeeklyResponse
    | ScheduleMonthlyResponse
