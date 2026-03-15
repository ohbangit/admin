import { createContext, useContext } from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

export type ToastItem = {
    id: string
    message: string
    variant: ToastVariant
}

export type AddToastInput = {
    message: string
    variant?: ToastVariant
    duration?: number
}

export type ToastContextValue = {
    addToast: (input: AddToastInput) => void
}

export const AdminToastContext = createContext<ToastContextValue | null>(null)

export function useAdminToast(): ToastContextValue {
    const context = useContext(AdminToastContext)
    if (context === null) {
        throw new Error('useAdminToast must be used within AdminToastProvider')
    }
    return context
}
