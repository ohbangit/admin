import { useEffect, useMemo, useRef, useState } from 'react'
import { FolderOpen, Search, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { inputClass } from '../../constants/styles'

interface CategorySelectorProps {
    categories: { id: number; name: string }[]
    selectedId: string
    onChange: (categoryId: string) => void
}

export function CategorySelector({ categories, selectedId, onChange }: CategorySelectorProps) {
    const [categorySearch, setCategorySearch] = useState('')
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const categoryDropdownRef = useRef<HTMLDivElement | null>(null)

    const selectedCategory = categories.find((category) => String(category.id) === selectedId) ?? null
    const filteredCategories = useMemo(() => {
        const keyword = categorySearch.trim().toLowerCase()
        if (keyword.length === 0) return categories
        return categories.filter((category) => category.name.toLowerCase().includes(keyword))
    }, [categories, categorySearch])

    useEffect(() => {
        function handleOutsideClick(event: MouseEvent): void {
            if (categoryDropdownRef.current !== null && !categoryDropdownRef.current.contains(event.target as Node)) {
                setIsCategoryOpen(false)
            }
        }

        function handleEscape(event: KeyboardEvent): void {
            if (event.key === 'Escape') {
                setIsCategoryOpen(false)
            }
        }

        window.addEventListener('mousedown', handleOutsideClick)
        window.addEventListener('keydown', handleEscape)

        return () => {
            window.removeEventListener('mousedown', handleOutsideClick)
            window.removeEventListener('keydown', handleEscape)
        }
    }, [])

    return (
        <div className="space-y-1" ref={categoryDropdownRef}>
            <label className="flex items-center gap-1.5 text-xs font-medium text-[#adadb8]"><FolderOpen className="h-3.5 w-3.5" /> 게임/카테고리</label>
            {selectedCategory === null ? (
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7e7e8c]" />
                    <input
                        type="text"
                        value={categorySearch}
                        onChange={(event) => {
                            setCategorySearch(event.target.value)
                            setIsCategoryOpen(true)
                        }}
                        onFocus={() => setIsCategoryOpen(true)}
                        onKeyDown={(event) => {
                            if (event.key === 'Escape') {
                                setIsCategoryOpen(false)
                            }
                        }}
                        className={cn(inputClass, 'pl-9 pr-8')}
                        placeholder="카테고리 검색"
                    />
                    {categorySearch.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                setCategorySearch('')
                                setIsCategoryOpen(false)
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-0.5 text-[#7e7e8c] transition hover:bg-[#3a3a44] hover:text-[#efeff1]"
                            aria-label="검색어 초기화"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}

                    {isCategoryOpen && (
                        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-[#3a3a44] bg-[#1f1f28] shadow-xl">
                            <button
                                type="button"
                                onClick={() => {
                                    onChange('')
                                    setCategorySearch('')
                                    setIsCategoryOpen(false)
                                }}
                                className="w-full cursor-pointer border-b border-[#32323d] px-3 py-2 text-left text-xs font-medium text-[#c4c4ce] transition hover:bg-[#2a2a34]"
                            >
                                없음
                            </button>
                            <div className="max-h-48 overflow-auto">
                                {filteredCategories.length === 0 ? (
                                    <p className="px-3 py-2 text-xs text-[#848494]">검색 결과가 없습니다.</p>
                                ) : (
                                    filteredCategories.map((category) => (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => {
                                                onChange(String(category.id))
                                                setCategorySearch('')
                                                setIsCategoryOpen(false)
                                            }}
                                            className="w-full cursor-pointer px-3 py-2 text-left text-sm text-[#efeff1] transition hover:bg-[#2a2a34]"
                                        >
                                            {category.name}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center">
                    <div className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2">
                        <span className="text-sm font-medium text-blue-200">{selectedCategory.name}</span>
                        <button
                            type="button"
                            onClick={() => {
                                onChange('')
                                setCategorySearch('')
                            }}
                            className="cursor-pointer rounded-full p-0.5 text-blue-200 transition hover:bg-blue-500/20"
                            aria-label="카테고리 선택 해제"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
