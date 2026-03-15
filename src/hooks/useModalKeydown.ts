import { useEffect, useCallback } from 'react'

/**
 * 모달 열림/닫힘 시 Escape 키 핸들링 + body overflow 제어
 */
export function useModalKeydown(isOpen: boolean, onClose: () => void): void {
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
}
