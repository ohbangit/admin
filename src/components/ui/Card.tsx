import { forwardRef } from 'react'
import { cn } from '../../lib/cn'

// ---------------------------------------------------------------------------
// 타입
// ---------------------------------------------------------------------------

/**
 * - default: 플랫한 카드 (배경색만)
 * - gradient: 그라디언트 + 호버 시 primary 색상 shimmer 효과 (BroadcastCard 패턴)
 * - elevated: 그림자 있는 카드
 */
export type CardVariant = 'default' | 'gradient' | 'elevated'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** 카드 스타일 variant @default 'default' */
    variant?: CardVariant
    /** 클릭 핸들러가 있을 때 자동으로 cursor-pointer + 호버 이펙트 활성화 */
    onClick?: React.MouseEventHandler<HTMLDivElement>
}

// ---------------------------------------------------------------------------
// 스타일 맵
// ---------------------------------------------------------------------------

const BASE = 'relative overflow-hidden rounded-lg border border-border/50 bg-card transition-all duration-200'

const variants: Record<CardVariant, string> = {
    default: 'bg-card',
    gradient:
        'bg-gradient-to-br from-card via-card to-bg-secondary/70 ' +
        'before:pointer-events-none before:absolute before:inset-0 before:rounded-lg ' +
        'before:bg-[radial-gradient(circle_at_top,rgba(0,255,163,0.12),transparent_60%)] ' +
        'before:opacity-0 before:transition-opacity before:duration-300',
    elevated: 'bg-card shadow-card',
}

const interactiveClass = 'cursor-pointer hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-hover hover:before:opacity-100'

// ---------------------------------------------------------------------------
// 컴포넌트
// ---------------------------------------------------------------------------

/**
 * 범용 카드 컴포넌트
 * onClick prop이 있으면 자동으로 인터랙티브 스타일(호버 효과)이 활성화된다.
 * gradient variant는 마우스 오버 시 상단에 primary 색상 shimmer가 나타난다.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(({ variant = 'default', onClick, className, children, ...props }, ref) => {
    return (
        <div ref={ref} onClick={onClick} className={cn(BASE, variants[variant], onClick && interactiveClass, className)} {...props}>
            {children}
        </div>
    )
})

Card.displayName = 'Card'

// ---------------------------------------------------------------------------
// 서브 컴포넌트 (Compound Pattern)
// ---------------------------------------------------------------------------

/** 카드 상단 헤더 영역 */
export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('flex items-center justify-between px-4 py-3 border-b border-border/30', className)} {...props}>
            {children}
        </div>
    )
}

/** 카드 본문 영역 */
export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('px-4 py-3', className)} {...props}>
            {children}
        </div>
    )
}

/** 카드 하단 푸터 영역 */
export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('flex items-center px-4 py-3 border-t border-border/30', className)} {...props}>
            {children}
        </div>
    )
}
