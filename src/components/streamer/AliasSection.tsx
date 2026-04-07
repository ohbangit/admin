import { useEffect, useState } from 'react'
import { Tags, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { inputClass } from '../../constants/styles'
import {
    useAdminToast,
    useCreateStreamerAlias,
    useDeleteStreamerAlias,
    useStreamerAliases,
} from '../../hooks'
import { getErrorMessage } from '../../utils/error'

interface AliasSectionProps {
    streamerId: number
    onPendingChange?: (pending: boolean) => void
}

export function AliasSection({ streamerId, onPendingChange }: AliasSectionProps) {
    const { addToast } = useAdminToast()
    const { data: aliases = [], isLoading } = useStreamerAliases(streamerId)
    const createMutation = useCreateStreamerAlias()
    const deleteMutation = useDeleteStreamerAlias()
    const [input, setInput] = useState('')

    const isPending = createMutation.isPending || deleteMutation.isPending

    useEffect(() => {
        onPendingChange?.(isPending)
    }, [isPending, onPendingChange])

    useEffect(() => {
        setInput('')
    }, [streamerId])

    async function handleAdd(): Promise<void> {
        if (createMutation.isPending) {
            return
        }
        const alias = input.trim()
        if (alias.length === 0) {
            return
        }
        if (aliases.some((a) => a.alias.toLowerCase() === alias.toLowerCase())) {
            addToast({ message: '이미 등록된 별명입니다.', variant: 'error' })
            return
        }
        try {
            await createMutation.mutateAsync({ streamerId, alias })
            addToast({ message: '별명을 추가했습니다.', variant: 'success' })
            setInput('')
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) {
                addToast({ message, variant: 'error' })
            }
        }
    }

    async function handleDelete(aliasId: number): Promise<void> {
        try {
            await deleteMutation.mutateAsync({ streamerId, aliasId })
            addToast({ message: '별명을 삭제했습니다.', variant: 'success' })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) {
                addToast({ message, variant: 'error' })
            }
        }
    }

    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-[#adadb8]">
                    <Tags className="h-3.5 w-3.5" /> 별명
                </label>
                <p className="text-[11px] text-[#6a6a76]">
                    라이브 크롤러가 합방 감지 시 식별할 추가 이름입니다.
                </p>
            </div>

            {isLoading ? (
                <div className="flex flex-wrap gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <span
                            key={i}
                            className="h-6 w-16 animate-pulse rounded-full bg-[#26262e]"
                        />
                    ))}
                </div>
            ) : aliases.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                    {aliases.map((a) => (
                        <span
                            key={a.id}
                            className="inline-flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200"
                        >
                            {a.alias}
                            <button
                                type="button"
                                onClick={() => {
                                    void handleDelete(a.id)
                                }}
                                disabled={isPending}
                                className="cursor-pointer ml-0.5 rounded-full p-0.5 text-amber-200/70 transition hover:text-amber-100 disabled:opacity-50"
                                aria-label={`${a.alias} 삭제`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-[#848494]">등록된 별명이 없습니다.</p>
            )}

            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                            event.preventDefault()
                            void handleAdd()
                        }
                    }}
                    placeholder="새 별명 입력 후 Enter"
                    maxLength={100}
                    disabled={isPending}
                    className={cn(inputClass, 'flex-1')}
                />
                <button
                    type="button"
                    onClick={() => {
                        void handleAdd()
                    }}
                    disabled={isPending || input.trim().length === 0}
                    className="cursor-pointer inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                    추가
                </button>
            </div>
        </div>
    )
}
