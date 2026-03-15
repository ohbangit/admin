/** 방송 타입 목록 */
export const BROADCAST_TYPES = ['합방', '대회', '콘텐츠', '내전'] as const
export type BroadcastType = (typeof BROADCAST_TYPES)[number]

/** 방송 타입별 그라디언트 클래스 */
export const BROADCAST_TYPE_GRADIENT: Record<string, string> = {
  대회: 'bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20',
  콘텐츠: 'bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-950/20 dark:to-cyan-950/20',
  내전: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20',
}
export const BROADCAST_TYPE_GRADIENT_DEFAULT =
  'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20'
