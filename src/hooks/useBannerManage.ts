import { useState } from 'react'
import { useAdminToast } from './useAdminToast'
import { useBanners, useDeleteBanner } from './useBanners'
import type { AdminBanner } from '../types/banner'
import { getErrorMessage } from '../utils/error'

interface UseBannerManageResult {
    banners: AdminBanner[]
    isLoading: boolean
    isError: boolean
    deletePending: boolean
    deletingBanner: AdminBanner | null
    editingBanner: AdminBanner | null
    showCreateModal: boolean
    openCreateModal: () => void
    closeCreateModal: () => void
    openEditModal: (banner: AdminBanner) => void
    closeEditModal: () => void
    openDeleteModal: (banner: AdminBanner) => void
    closeDeleteModal: () => void
    handleDelete: () => Promise<void>
}

export function useBannerManage(): UseBannerManageResult {
    const { data, isLoading, isError } = useBanners()
    const deleteMutation = useDeleteBanner()
    const { addToast } = useAdminToast()
    const [deletingBanner, setDeletingBanner] = useState<AdminBanner | null>(null)
    const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)

    const banners = data?.banners ?? []

    async function handleDelete(): Promise<void> {
        if (deletingBanner === null) return
        try {
            await deleteMutation.mutateAsync(deletingBanner.id)
            addToast({
                message: `'${deletingBanner.title}' 배너가 삭제되었습니다.`,
                variant: 'success',
            })
            setDeletingBanner(null)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    return {
        banners,
        isLoading,
        isError,
        deletePending: deleteMutation.isPending,
        deletingBanner,
        editingBanner,
        showCreateModal,
        openCreateModal: () => setShowCreateModal(true),
        closeCreateModal: () => setShowCreateModal(false),
        openEditModal: (banner) => setEditingBanner(banner),
        closeEditModal: () => setEditingBanner(null),
        openDeleteModal: (banner) => setDeletingBanner(banner),
        closeDeleteModal: () => setDeletingBanner(null),
        handleDelete,
    }
}
