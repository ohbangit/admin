import { cn } from '../../lib/cn'

// ---------------------------------------------------------------------------
// 타입
// ---------------------------------------------------------------------------

/**
 * 색상 의미를 나타내는 variant
 * - default: 중립적인 회색 계열 (태그, 카테고리)
 * - primary: 브랜드 색상 (치지직 제작지원 등)
 * - collab: 합방 (보라)
 * - tournament: 대회 (노랑)
 * - content: 콘텐츠 (하늘)
 * - internal: 내전 (빨강)
 * - live: 라이브 중 (빨강, 애니메이션 없음)
 * - outline: 테두리만 있는 중립 스타일
 */
export type BadgeVariant = 'default' | 'primary' | 'collab' | 'tournament' | 'content' | 'internal' | 'live' | 'outline'

export type BadgeSize = 'sm' | 'md'

export interface BadgeProps {
    /** 배지 색상 variant @default 'default' */
    variant?: BadgeVariant
    /** 배지 크기 @default 'md' */
    size?: BadgeSize
    className?: string
    children: React.ReactNode
}

// ---------------------------------------------------------------------------
// 스타일 맵
// ---------------------------------------------------------------------------

const BASE = 'inline-flex shrink-0 items-center font-semibold leading-none rounded-xs'

const variants: Record<BadgeVariant, string> = {
    default: 'bg-category text-text-muted border border-border/40',
    primary: 'bg-primary/10 text-primary border border-primary/30',
    collab: 'bg-collab/10 text-collab border border-collab/20',
    tournament: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    content: 'bg-sky-500/10 text-sky-500 border border-sky-500/20',
    internal: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
    live: 'bg-live/10 text-live border border-live/20',
    outline: 'bg-transparent text-text-muted border border-border/50',
}

const sizes: Record<BadgeSize, string> = {
    sm: 'px-1.5 py-0.5 text-[9px]',
    md: 'px-2 py-0.5 text-[10px]',
}

// ---------------------------------------------------------------------------
// 컴포넌트
// ---------------------------------------------------------------------------

/**
 * 범용 배지 컴포넌트
 * 방송 유형, 카테고리, 상태 등 다양한 레이블을 표시하는 데 사용한다.
 */
export function Badge({ variant = 'default', size = 'md', className, children }: BadgeProps) {
    return <span className={cn(BASE, variants[variant], sizes[size], className)}>{children}</span>
}
