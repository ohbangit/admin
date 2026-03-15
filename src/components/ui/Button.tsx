import { forwardRef } from 'react'
import { cn } from '../../lib/cn'

// ---------------------------------------------------------------------------
// 타입
// ---------------------------------------------------------------------------

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** 버튼 스타일 변형 @default 'primary' */
    variant?: ButtonVariant
    /** 버튼 크기 @default 'md' */
    size?: ButtonSize
    /** 로딩 상태 — 비활성화 + 스피너 표시 */
    loading?: boolean
    /** 버튼 텍스트 앞에 표시할 아이콘 */
    leftIcon?: React.ReactNode
    /** 버튼 텍스트 뒤에 표시할 아이콘 */
    rightIcon?: React.ReactNode
}

// ---------------------------------------------------------------------------
// 스타일 맵
// ---------------------------------------------------------------------------

/** 모든 variant에 공통 적용되는 base 클래스 */
const BASE =
    'inline-flex items-center justify-center gap-2 font-medium cursor-pointer select-none transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-white hover:bg-primary-dim shadow-sm rounded-md',
    outline: 'border border-border/50 bg-card text-text-muted hover:border-border hover:bg-card-hover hover:text-text rounded-md',
    ghost: 'text-text-muted hover:bg-card-hover hover:text-text rounded-md',
    destructive: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-md',
}

const sizes: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
    icon: 'h-9 w-9',
}

// ---------------------------------------------------------------------------
// 컴포넌트
// ---------------------------------------------------------------------------

/**
 * 범용 버튼 컴포넌트
 * variant(primary/outline/ghost/destructive)와 size(sm/md/lg/icon)를 지원한다.
 * loading 상태에서는 자동으로 비활성화되고 스피너가 표시된다.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', loading = false, leftIcon, rightIcon, className, disabled, children, ...props }, ref) => {
        return (
            <button ref={ref} disabled={disabled || loading} className={cn(BASE, variants[variant], sizes[size], className)} {...props}>
                {loading ? (
                    <svg
                        className="h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                ) : (
                    leftIcon
                )}
                {children}
                {!loading && rightIcon}
            </button>
        )
    },
)

Button.displayName = 'Button'
