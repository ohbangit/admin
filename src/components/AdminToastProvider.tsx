import { type ReactNode, useCallback, useMemo, useState } from 'react'
import { TOAST_DEFAULT_DURATION_MS } from '../constants'
import { type AddToastInput, AdminToastContext, type ToastItem, type ToastVariant } from '../hooks/useAdminToast'

function resolveId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getToastStyle(variant: ToastVariant) {
  if (variant === 'error') {
    return 'border-red-200 bg-red-50 text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-300'
  }
  if (variant === 'info') {
    return 'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-blue-300'
  }
  return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:text-emerald-300'
}

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [ toasts, setToasts ] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback(
    ({ message, variant = 'success', duration = TOAST_DEFAULT_DURATION_MS }: AddToastInput) => {
      const id = resolveId()
      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          variant,
        },
      ])
      if (duration > 0) {
        window.setTimeout(() => removeToast(id), duration)
      }
    },
    [ removeToast ],
  )

  const value = useMemo(() => ({ addToast }), [ addToast ])

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex w-80 flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`rounded-xl border px-4 py-3 text-sm shadow-lg ${getToastStyle(
              toast.variant,
            )}`}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="leading-5">{toast.message}</span>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-xs opacity-60 transition hover:opacity-100"
              >
                닫기
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminToastContext.Provider>
  )
}
