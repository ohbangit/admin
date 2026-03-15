import { Image } from 'lucide-react'
import { DeleteConfirmModal, CreateBannerModal, EditBannerModal } from '../components/banner'
import { TYPE_COLOR, TYPE_LABEL } from '../constants/bannerManage'
import { useBannerManage } from '../hooks'
import { cn } from '../lib/cn'

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-'
    return dateStr.slice(0, 10)
}

export default function BannerManagePage() {
    const {
        banners,
        isLoading,
        isError,
        deletePending,
        deletingBanner,
        editingBanner,
        showCreateModal,
        openCreateModal,
        closeCreateModal,
        openEditModal,
        closeEditModal,
        openDeleteModal,
        closeDeleteModal,
        handleDelete,
    } = useBannerManage()

    return (
        <>
            <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-[#efeff1]">배너 관리</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-[#adadb8]">메인 페이지 상단 캐러셀 배너를 관리합니다.</p>
                </div>
                <button
                    type="button"
                    onClick={openCreateModal}
                    className="cursor-pointer flex items-center gap-1.5 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                >
                    <Image className="h-4 w-4" />
                    배너 추가
                </button>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-[#3a3a44]">
                <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 dark:border-[#3a3a44]">
                    <p className="text-xs font-semibold text-gray-500 dark:text-[#848494]">배너 목록</p>
                    {!isLoading && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-[#26262e] dark:text-[#848494]">
                            {banners.length}개
                        </span>
                    )}
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    </div>
                )}
                {isError && <div className="py-12 text-center text-sm text-red-500">배너를 불러오는 중 오류가 발생했습니다.</div>}
                {!isLoading && !isError && banners.length === 0 && (
                    <div className="py-12 text-center text-sm text-gray-400 dark:text-[#848494]">등록된 배너가 없습니다.</div>
                )}
                {!isLoading && !isError && banners.length > 0 && (
                    <ul className="divide-y divide-gray-100 dark:divide-[#3a3a44]">
                        {banners.map((banner) => (
                            <li key={banner.id} className="flex items-center gap-3 px-4 py-3">
                                <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-[#26262e]">
                                    {banner.imageUrl ? (
                                        <img src={banner.imageUrl} alt={banner.title} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <Image className="h-5 w-5 text-gray-300 dark:text-[#5a5a64]" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span
                                            className={cn(
                                                'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                                TYPE_COLOR[banner.type] ?? 'bg-gray-100 text-gray-600 dark:bg-[#26262e] dark:text-[#adadb8]',
                                            )}
                                        >
                                            {TYPE_LABEL[banner.type as keyof typeof TYPE_LABEL] ?? banner.type}
                                        </span>
                                        {!banner.isActive && (
                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-400 dark:bg-[#26262e] dark:text-[#848494]">
                                                비활성
                                            </span>
                                        )}
                                        <span className="text-[10px] text-gray-300 dark:text-[#5a5a64]">#{banner.orderIndex}</span>
                                    </div>
                                    <p className="mt-0.5 truncate text-sm font-medium text-gray-800 dark:text-[#efeff1]">{banner.title}</p>
                                    <p className="text-[11px] text-gray-400 dark:text-[#848494]">
                                        {formatDate(banner.startedAt)} ~ {formatDate(banner.endedAt)}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(banner)}
                                        className="cursor-pointer rounded-lg border border-blue-100 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50 dark:border-blue-900/30 dark:hover:bg-blue-900/10"
                                    >
                                        수정
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openDeleteModal(banner)}
                                        className="cursor-pointer rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {showCreateModal && <CreateBannerModal onClose={closeCreateModal} />}
            {editingBanner !== null && <EditBannerModal banner={editingBanner} onClose={closeEditModal} />}
            {deletingBanner !== null && (
                <DeleteConfirmModal
                    banner={deletingBanner}
                    onConfirm={() => {
                        void handleDelete()
                    }}
                    onCancel={closeDeleteModal}
                    isPending={deletePending}
                />
            )}
        </>
    )
}
