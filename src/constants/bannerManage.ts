import { TYPE_LABEL as SHARED_TYPE_LABEL } from '../components/banner/constants'
import type { BannerType } from '../types/bannerManage'

export const BANNER_TYPES = ['tournament', 'collab', 'content', '내전', '출시', '인기'] as const satisfies readonly BannerType[]

export const TYPE_LABEL: Record<BannerType, string> = {
    tournament: SHARED_TYPE_LABEL.tournament,
    collab: SHARED_TYPE_LABEL.collab,
    content: SHARED_TYPE_LABEL.content,
    내전: SHARED_TYPE_LABEL.내전,
    출시: SHARED_TYPE_LABEL.출시,
    인기: SHARED_TYPE_LABEL.인기,
}

export const TYPE_COLOR: Record<string, string> = {
    tournament: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    collab: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    content: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    내전: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
}
