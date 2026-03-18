import { cn } from '../lib/cn'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '5xl'

const sizeMap: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '5xl': 'max-w-5xl',
}

interface ModalOverlayProps {
    size?: ModalSize
    disabled?: boolean
    onClose: () => void
    children: React.ReactNode
}

export function ModalOverlay({ size = 'lg', disabled = false, onClose, children }: ModalOverlayProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={(event) => {
                if (event.target === event.currentTarget && !disabled) onClose()
            }}
        >
            <div className={cn('w-full overflow-hidden rounded-2xl border border-[#3a3a44] bg-[#1a1a23] shadow-xl', sizeMap[size])}>
                {children}
            </div>
        </div>
    )
}
