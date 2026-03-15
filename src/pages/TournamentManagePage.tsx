import { useMemo } from 'react'
import {
    CreateTournamentModal,
    ParticipantSection,
    RosterSection,
    TournamentMetaSection,
    TournamentPromotionEditors,
    TournamentSelector,
} from '../components'
import { useTournamentManage } from '../hooks'
import type { TournamentManagePageProps } from '../types'

export default function TournamentManagePage({ mode = 'overwatch' }: TournamentManagePageProps) {
    const {
        broadcasterSearchInput,
        broadcasterSelectedId,
        broadcasterSuggestions,
        collapsedPromotionEditors,
        commentatorSearchInput,
        commentatorSelectedId,
        commentatorSuggestions,
        createPromotionConfig,
        createTournamentDefaultGame,
        deleteTournament,
        draggingPanelId,
        draggingTeamId,
        draftPanel,
        errorMessage,
        f1DriversContentFromAdminApi,
        handleCopySlug,
        handleCreatePromotion,
        handleDeleteTournament,
        handleDropPanel,
        handleDropTeam,
        handleSaveDraftParticipants,
        handleSaveF1DriversPanel,
        handleSavePanelContent,
        handleToggleActive,
        handleTogglePanelDefaultExpanded,
        handleTogglePanelVisibility,
        handleTogglePromotionEditor,
        handleUpdateTournamentMeta,
        hostSearchInput,
        hostSelectedId,
        hostSuggestions,
        hoveredPanelId,
        hoveredTeamId,
        isBroadcasterFetching,
        isCommentatorFetching,
        isHostFetching,
        isParticipantSectionCollapsed,
        isParticipantSectionVisible,
        isPromotionLoading,
        isRosterEditorVisible,
        isRosterSectionCollapsed,
        isSelectedOverwatchTournament,
        isTournamentTeamError,
        isTournamentTeamLoading,
        isTournamentsLoading,
        metaForm,
        pageDescription,
        pageTitle,
        promotionData,
        reorderTeams,
        savingPanelId,
        schedulePreview,
        selectedSlug,
        selectedTournament,
        selectedTournamentId,
        setBroadcasterSearchInput,
        setBroadcasterSelectedId,
        setCommentatorSearchInput,
        setCommentatorSelectedId,
        setDraggingPanelId,
        setDraggingTeamId,
        setHoveredPanelId,
        setHoveredTeamId,
        setHostSearchInput,
        setHostSelectedId,
        setIsParticipantSectionCollapsed,
        setIsRosterSectionCollapsed,
        setMetaForm,
        setSelectedSlug,
        setShowCreateModal,
        setShowMetaEditor,
        setTagInput,
        showCreateModal,
        showMetaEditor,
        sortedPanels,
        sortedTeams,
        tagInput,
        tournaments,
        updateTournament,
        visiblePanels,
    } = useTournamentManage(mode)

    const draftParticipants = useMemo(() => {
        const content = draftPanel?.content as Record<string, unknown> | undefined
        if (!Array.isArray(content?.participants)) return []
        return content.participants
    }, [draftPanel])

    return (
        <div className="space-y-6 [&_button:disabled]:cursor-not-allowed [&_button]:cursor-pointer">
            <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-[#efeff1]">{pageTitle}</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-[#adadb8]">{pageDescription}</p>
            </div>

            {isTournamentsLoading ? (
                <div className="text-sm text-gray-400 dark:text-[#adadb8]">대회 목록 불러오는 중...</div>
            ) : (
                <TournamentSelector tournaments={tournaments} selectedSlug={selectedSlug} onSelect={setSelectedSlug} onAdd={() => setShowCreateModal(true)} />
            )}

            {selectedSlug !== null && (
                <TournamentMetaSection
                    selectedSlug={selectedSlug}
                    selectedTournament={selectedTournament}
                    showMetaEditor={showMetaEditor}
                    metaForm={metaForm}
                    tagInput={tagInput}
                    hostSearchInput={hostSearchInput}
                    hostSelectedId={hostSelectedId}
                    hostSuggestions={hostSuggestions}
                    isHostFetching={isHostFetching}
                    broadcasterSearchInput={broadcasterSearchInput}
                    broadcasterSelectedId={broadcasterSelectedId}
                    broadcasterSuggestions={broadcasterSuggestions}
                    isBroadcasterFetching={isBroadcasterFetching}
                    commentatorSearchInput={commentatorSearchInput}
                    commentatorSelectedId={commentatorSelectedId}
                    commentatorSuggestions={commentatorSuggestions}
                    isCommentatorFetching={isCommentatorFetching}
                    schedulePreview={schedulePreview}
                    isPromotionLoading={isPromotionLoading}
                    hasPromotionData={promotionData !== undefined}
                    sortedPanels={sortedPanels}
                    draggingPanelId={draggingPanelId}
                    hoveredPanelId={hoveredPanelId}
                    createPromotionPending={createPromotionConfig.isPending}
                    updateTournamentPending={updateTournament.isPending}
                    deleteTournamentPending={deleteTournament.isPending}
                    onSetShowMetaEditor={setShowMetaEditor}
                    onSetMetaForm={setMetaForm}
                    onSetTagInput={setTagInput}
                    onSetHostSearchInput={setHostSearchInput}
                    onSetHostSelectedId={setHostSelectedId}
                    onSetBroadcasterSearchInput={setBroadcasterSearchInput}
                    onSetBroadcasterSelectedId={setBroadcasterSelectedId}
                    onSetCommentatorSearchInput={setCommentatorSearchInput}
                    onSetCommentatorSelectedId={setCommentatorSelectedId}
                    onSetDraggingPanelId={setDraggingPanelId}
                    onSetHoveredPanelId={setHoveredPanelId}
                    onCopySlug={handleCopySlug}
                    onToggleActive={handleToggleActive}
                    onDeleteTournament={handleDeleteTournament}
                    onSubmitMeta={handleUpdateTournamentMeta}
                    onCreatePromotion={handleCreatePromotion}
                    onDropPanel={handleDropPanel}
                    onTogglePanelVisibility={handleTogglePanelVisibility}
                    onTogglePanelDefaultExpanded={handleTogglePanelDefaultExpanded}
                />
            )}

            {selectedSlug === null && !isTournamentsLoading && tournaments.length === 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500 dark:border-[#3a3a44] dark:bg-[#1a1a23] dark:text-[#adadb8]">
                    대회가 없습니다. 먼저 대회를 추가해주세요.
                </div>
            )}

            {selectedSlug !== null && promotionData === undefined && !isPromotionLoading && (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-3 text-xs text-gray-500 dark:border-[#3a3a44] dark:bg-[#1a1a23] dark:text-[#adadb8]">
                    대회 구성 설정 생성 후 `참여자 목록`, `팀 정보` 패널을 필요에 맞게 ON/OFF로 제어하세요.
                </div>
            )}

            {selectedSlug !== null && promotionData !== undefined && isParticipantSectionVisible && (
                <ParticipantSection
                    participants={draftParticipants}
                    isCollapsed={isParticipantSectionCollapsed}
                    isSaving={savingPanelId === (draftPanel?.id ?? null)}
                    onToggleCollapsed={() => setIsParticipantSectionCollapsed((previous) => !previous)}
                    onSave={handleSaveDraftParticipants}
                />
            )}

            {selectedSlug !== null && promotionData !== undefined && isRosterEditorVisible && (
                <RosterSection
                    errorMessage={errorMessage}
                    hoveredTeamId={hoveredTeamId}
                    isCollapsed={isRosterSectionCollapsed}
                    isError={isTournamentTeamError}
                    isLoading={isTournamentTeamLoading}
                    isReorderPending={reorderTeams.isPending}
                    selectedTournamentId={selectedTournamentId}
                    sortedTeams={sortedTeams}
                    draggingTeamId={draggingTeamId}
                    onToggleCollapsed={() => setIsRosterSectionCollapsed((previous) => !previous)}
                    onDragStartTeam={setDraggingTeamId}
                    onDragEndTeam={() => {
                        setDraggingTeamId(null)
                        setHoveredTeamId(null)
                    }}
                    onDragEnterTeam={setHoveredTeamId}
                    onDragLeaveTeam={(teamId) => {
                        if (hoveredTeamId === teamId) setHoveredTeamId(null)
                    }}
                    onDropTeam={(teamId) => {
                        void handleDropTeam(teamId)
                    }}
                />
            )}

            {selectedSlug !== null && promotionData !== undefined && (
                <TournamentPromotionEditors
                    visiblePanels={visiblePanels}
                    collapsedPromotionEditors={collapsedPromotionEditors}
                    savingPanelId={savingPanelId}
                    sortedTeams={sortedTeams}
                    isSelectedOverwatchTournament={isSelectedOverwatchTournament}
                    promotionPanels={promotionData.panels}
                    f1DriversContentFromAdminApi={f1DriversContentFromAdminApi}
                    onTogglePromotionEditor={handleTogglePromotionEditor}
                    onSavePanelContent={handleSavePanelContent}
                    onSaveF1DriversPanel={handleSaveF1DriversPanel}
                />
            )}

            {showCreateModal && <CreateTournamentModal defaultGame={createTournamentDefaultGame} onClose={() => setShowCreateModal(false)} />}
        </div>
    )
}
