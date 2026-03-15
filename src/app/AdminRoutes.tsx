import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminGuard } from '../components'
import { AdminLayout } from '../components'

const StreamersPage = lazy(() => import('../pages/StreamersPage'))
const DiscoveryPage = lazy(() => import('../pages/DiscoveryPage'))
const BroadcastCrawlPage = lazy(() => import('../pages/BroadcastCrawlPage'))
const BroadcastSchedulePage = lazy(() => import('../pages/BroadcastSchedulePage'))
const CategoryManagePage = lazy(() => import('../pages/CategoryManagePage'))
const TournamentManagePage = lazy(() => import('../pages/TournamentManagePage'))
const F1TournamentManagePage = lazy(() => import('../pages/F1TournamentManagePage'))
const BannerManagePage = lazy(() => import('../pages/BannerManagePage'))
const AffiliationManagePage = lazy(() => import('../pages/AffiliationManagePage'))
const MenuManagePage = lazy(() => import('../pages/MenuManagePage'))

export default function AdminRoutes() {
    return (
        <AdminGuard>
            <AdminLayout>
                <Suspense fallback={null}>
                    <Routes>
                        <Route path="streamers" element={<StreamersPage />} />
                        <Route path="streamer-discovery" element={<DiscoveryPage />} />
                        <Route path="broadcast-crawl" element={<BroadcastCrawlPage />} />
                        <Route path="schedule" element={<BroadcastSchedulePage />} />
                        <Route path="categories" element={<CategoryManagePage />} />
                        <Route path="tournaments" element={<TournamentManagePage />} />
                        <Route path="racing" element={<F1TournamentManagePage />} />
                        <Route path="banners" element={<BannerManagePage />} />
                        <Route path="menus" element={<MenuManagePage />} />
                        <Route path="affiliations" element={<AffiliationManagePage />} />
                        <Route path="*" element={<Navigate to="streamers" replace />} />
                    </Routes>
                </Suspense>
            </AdminLayout>
        </AdminGuard>
    )
}
