import { useEffect, useMemo, useState } from 'react'
import { useStreamers } from './useStreamers'
import type { StreamerItem } from '../types'
import type { StreamerSortType, TabType } from '../types/streamersManage'

const PAGE_SIZE = 20

export function useStreamersManage() {
    const [tab, setTab] = useState<TabType>('all')
    const [search, setSearch] = useState('')
    const [showRegister, setShowRegister] = useState(false)
    const [selected, setSelected] = useState<StreamerItem | null>(null)
    const [page, setPage] = useState(1)
    const [sort, setSort] = useState<StreamerSortType>('name_asc')

    const queryParams = useMemo(() => {
        if (tab === 'missing') {
            return { hasChannel: false as const }
        }
        if (search.trim().length > 0) {
            return { nickname: search.trim() }
        }
        return {}
    }, [tab, search])

    const { data, isLoading, isError } = useStreamers({
        ...queryParams,
        page,
        size: PAGE_SIZE,
        sort,
    })

    useEffect(() => {
        setPage(1)
    }, [tab, search, sort])

    const items = data?.items ?? []
    const total = data?.total ?? 0
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const emptyMessage =
        tab === 'missing'
            ? '채널 ID 미등록 스트리머가 없습니다.'
            : search.trim().length > 0
              ? '검색 결과가 없습니다.'
              : '등록된 스트리머가 없습니다.'

    function handleTabChange(nextTab: TabType) {
        setTab(nextTab)
        setSearch('')
    }

    function handlePrevPage() {
        setPage((prev) => Math.max(1, prev - 1))
    }

    function handleNextPage() {
        setPage((prev) => Math.min(totalPages, prev + 1))
    }

    return {
        tab,
        search,
        showRegister,
        selected,
        page,
        sort,
        isLoading,
        isError,
        items,
        total,
        totalPages,
        emptyMessage,
        setSearch,
        setShowRegister,
        setSelected,
        setSort,
        handleTabChange,
        handlePrevPage,
        handleNextPage,
    }
}
