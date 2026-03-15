import { useEffect, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

// ---------------------------------------------------------------------------
// 타입
// ---------------------------------------------------------------------------

export type ModalSize = 'sm' | 'md' | 'lg'

export interface ModalProps {
    /** 모달 열림 여부 */
    isOpen: boolean
    /** 모달 닫기 콜백 */
    onClose: () => void
    /** 모달 헤더 타이틀 (없으면 헤더 미표시) */
    title?: ReactNode
    /** 모달 너비 @default 'md' */
    size?: ModalSize
    /** 백드롭 클릭으로 닫기 여부 @default true */
    closeOnBackdrop?: boolean
    /** 추가 className (모달 패널에 적용) */
    className?: string
    children: ReactNode
    /** 모달 하단 고정 영역 (버튼 그룹 등) */
    footer?: ReactNode
    /** 접근성 레이블 (title이 없을 때 사용) */
    'aria-label'?: string
}

// ---------------------------------------------------------------------------
// 스타일 맵
// ---------------------------------------------------------------------------

const sizes: Record<ModalSize, string> = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
}

// ---------------------------------------------------------------------------
// 컴포넌트
// ---------------------------------------------------------------------------

/**
 * 범용 모달 컴포넌트
 * - 모바일: 하단 시트 (bottom sheet)
 * - 데스크탑: 중앙 다이얼로그
 * - Escape 키 / 백드롭 클릭으로 닫힘
 * - body overflow 잠금 자동 처리
 * - createPortal로 document.body에 마운트
 */
export function Modal({
    isOpen,
    onClose,
    title,
    size = 'md',
    closeOnBackdrop = true,
    className,
    children,
    footer,
    'aria-label': ariaLabel,
}: ModalProps) {
    // Escape 키 + body overflow 제어
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        },
        [onClose],
    )

    useEffect(() => {
        if (!isOpen) return
        document.addEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [isOpen, handleKeyDown])

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
            {/* 백드롭 */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={closeOnBackdrop ? onClose : undefined}
                role="presentation"
                aria-hidden="true"
            />

            {/* 모달 패널 */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
                className={cn(
                    // 레이아웃
                    'relative z-10 flex max-h-[85vh] w-full flex-col overflow-hidden',
                    // 모바일: 하단 시트
                    'rounded-t-xl border border-border/40 bg-bg shadow-modal',
                    // 데스크탑: 중앙 다이얼로그
                    'sm:max-h-[80vh] sm:rounded-xl sm:shadow-modal-center sm:animate-slide-up',
                    sizes[size],
                    className,
                )}
            >
                {/* 헤더 */}
                {title !== undefined && (
                    <div className="flex shrink-0 items-center justify-between border-b border-border/30 px-5 py-4">
                        <div className="text-sm font-semibold text-text">{title}</div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-text-muted transition-colors hover:bg-card-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                            aria-label="닫기"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* 본문 */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">{children}</div>

                {/* 푸터 */}
                {footer !== undefined && <div className="shrink-0 border-t border-border/30 px-5 py-4">{footer}</div>}
            </div>
        </div>,
        document.body,
    )
}
