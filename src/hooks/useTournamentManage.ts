import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
    useAdminStreamerSearch,
    useAdminToast,
    useAdminTournaments,
    useCreatePromotionConfig,
    useDeleteTournament,
    usePromotionConfig,
    useReorderPromotionPanels,
    useReorderTournamentTeams,
    useTournamentPlayers,
    useTournamentTeams,
    useUpdatePromotionPanels,
    useUpdateTournament,
    useUpdateTournamentPlayersV2,
} from './index'
import type { DraftParticipant, F1DriversContent, TournamentManageMode, TournamentMetaFormState, TournamentPanelContent } from '../types'
import { getErrorMessage } from '../utils/error'
import { createEmptyTournamentMetaForm, isOverwatchGame, isRacingGame, toF1DriversContentFromAdminPlayers } from '../utils/tournamentManage'

export function useTournamentManage(mode: TournamentManageMode = 'overwatch') {
    const { addToast } = useAdminToast()
    const { data: tournamentsData, isLoading: isTournamentsLoading } = useAdminTournaments()
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showMetaEditor, setShowMetaEditor] = useState(false)
    const [isRosterSectionCollapsed, setIsRosterSectionCollapsed] = useState(false)
    const [isParticipantSectionCollapsed, setIsParticipantSectionCollapsed] = useState(false)
    const [metaForm, setMetaForm] = useState<TournamentMetaFormState>(() => createEmptyTournamentMetaForm())
    const [tagInput, setTagInput] = useState('')
    const [hostSearchInput, setHostSearchInput] = useState('')
    const [hostSelectedId, setHostSelectedId] = useState<number | undefined>()
    const [broadcasterSearchInput, setBroadcasterSearchInput] = useState('')
    const [broadcasterSelectedId, setBroadcasterSelectedId] = useState<number | undefined>()
    const [commentatorSearchInput, setCommentatorSearchInput] = useState('')
    const [commentatorSelectedId, setCommentatorSelectedId] = useState<number | undefined>()
    const [draggingTeamId, setDraggingTeamId] = useState<number | null>(null)
    const [hoveredTeamId, setHoveredTeamId] = useState<number | null>(null)
    const [draggingPanelId, setDraggingPanelId] = useState<number | null>(null)
    const [hoveredPanelId, setHoveredPanelId] = useState<number | null>(null)
    const [savingPanelId, setSavingPanelId] = useState<number | null>(null)
    const [collapsedPromotionEditors, setCollapsedPromotionEditors] = useState<Record<number, boolean>>({})

    const tournaments = useMemo(() => {
        const allTournaments = tournamentsData?.tournaments ?? []
        return allTournaments.filter((tournament) => (mode === 'racing' ? isRacingGame(tournament.game) : !isRacingGame(tournament.game)))
    }, [mode, tournamentsData])

    const selectedTournament = useMemo(() => tournaments.find((tournament) => tournament.slug === selectedSlug), [selectedSlug, tournaments])
    const selectedTournamentId = selectedTournament?.id ?? null
    const isSelectedOverwatchTournament = selectedTournament !== undefined && isOverwatchGame(selectedTournament.game)

    useEffect(() => {
        if (selectedSlug === null && tournaments.length > 0) {
            setSelectedSlug(tournaments[0].slug)
        }
    }, [selectedSlug, tournaments])

    useEffect(() => {
        if (selectedSlug === null) return
        if (tournaments.some((tournament) => tournament.slug === selectedSlug)) return
        setSelectedSlug(null)
    }, [selectedSlug, tournaments])

    useEffect(() => {
        if (selectedTournament === undefined) {
            setMetaForm(createEmptyTournamentMetaForm())
            setTagInput('')
            setHostSearchInput('')
            setHostSelectedId(undefined)
            setBroadcasterSearchInput('')
            setBroadcasterSelectedId(undefined)
            setCommentatorSearchInput('')
            setCommentatorSelectedId(undefined)
            return
        }

        setMetaForm({
            name: selectedTournament.name,
            startedAt: selectedTournament.startedAt?.slice(0, 10) ?? '',
            endedAt: selectedTournament.endedAt?.slice(0, 10) ?? '',
            bannerUrl: selectedTournament.bannerUrl ?? '',
            tags: selectedTournament.tags ?? [],
            isChzzkSupport: selectedTournament.isChzzkSupport ?? false,
            hostName: selectedTournament.hostName ?? '',
            hostAvatarUrl: selectedTournament.hostAvatarUrl ?? '',
            hostChannelUrl: selectedTournament.hostChannelUrl ?? '',
            hostIsPartner: selectedTournament.hostIsPartner ?? false,
            hostStreamerId: selectedTournament.hostStreamerId ?? null,
            links: selectedTournament.links ?? [],
            description: selectedTournament.description ?? '',
            showDescription: selectedTournament.showDescription ?? false,
            broadcasterName: selectedTournament.broadcasterName ?? '',
            broadcasterAvatarUrl: selectedTournament.broadcasterAvatarUrl ?? '',
            broadcasterChannelUrl: selectedTournament.broadcasterChannelUrl ?? '',
            broadcasterIsPartner: selectedTournament.broadcasterIsPartner ?? false,
            broadcasterStreamerId: selectedTournament.broadcasterStreamerId ?? null,
            commentators: selectedTournament.commentators ?? [],
        })
        setTagInput('')
        setHostSearchInput('')
        setHostSelectedId(selectedTournament.hostStreamerId ?? undefined)
        setBroadcasterSearchInput('')
        setBroadcasterSelectedId(selectedTournament.broadcasterStreamerId ?? undefined)
        setCommentatorSearchInput('')
        setCommentatorSelectedId(undefined)
    }, [selectedTournament])

    useEffect(() => {
        setShowMetaEditor(false)
        setCollapsedPromotionEditors({})
    }, [selectedSlug])

    const { data: tournamentTeamData, isLoading: isTournamentTeamLoading, isError: isTournamentTeamError, error: tournamentTeamError } =
        useTournamentTeams(selectedTournamentId)
    const { data: playersData } = useTournamentPlayers(selectedTournamentId, mode === 'racing')
    const reorderTeams = useReorderTournamentTeams(selectedTournamentId ?? 0)
    const { data: hostSuggestions, isFetching: isHostFetching } = useAdminStreamerSearch(hostSelectedId === undefined ? hostSearchInput : '')
    const { data: broadcasterSuggestions, isFetching: isBroadcasterFetching } = useAdminStreamerSearch(
        broadcasterSelectedId === undefined ? broadcasterSearchInput : '',
    )
    const { data: commentatorSuggestions, isFetching: isCommentatorFetching } = useAdminStreamerSearch(
        commentatorSelectedId === undefined ? commentatorSearchInput : '',
    )

    const { data: promotionData, isLoading: isPromotionLoading } = usePromotionConfig(selectedTournamentId)
    const createPromotionConfig = useCreatePromotionConfig(selectedTournamentId ?? 0)
    const updatePromotionPanels = useUpdatePromotionPanels(selectedTournamentId ?? 0)
    const updateTournamentPlayersV2 = useUpdateTournamentPlayersV2(selectedTournamentId ?? 0)
    const reorderPromotionPanels = useReorderPromotionPanels(selectedTournamentId ?? 0)
    const updateTournament = useUpdateTournament(selectedTournamentId)
    const deleteTournament = useDeleteTournament()

    const sortedTeams = useMemo(
        () =>
            [...(tournamentTeamData?.teams ?? [])].sort((a, b) => {
                if (a.teamOrder === b.teamOrder) return a.id - b.id
                return a.teamOrder - b.teamOrder
            }),
        [tournamentTeamData?.teams],
    )

    const sortedPanels = useMemo(
        () => (promotionData === undefined ? [] : [...promotionData.panels].sort((a, b) => a.order_index - b.order_index)),
        [promotionData],
    )

    const f1DriversContentFromAdminApi = useMemo(() => {
        if (playersData === undefined) return null
        return toF1DriversContentFromAdminPlayers(playersData)
    }, [playersData])

    const visiblePanels = useMemo(() => sortedPanels.filter((panel) => panel.enabled && !panel.hidden), [sortedPanels])
    const isParticipantSectionVisible = useMemo(() => visiblePanels.some((panel) => panel.type === 'PLAYER_LIST'), [visiblePanels])
    const isRosterEditorVisible = useMemo(() => visiblePanels.some((panel) => panel.type === 'TEAMS'), [visiblePanels])
    const schedulePreview = useMemo(
        () => (metaForm.startedAt.length > 0 || metaForm.endedAt.length > 0 ? `${metaForm.startedAt || '미정'} ~ ${metaForm.endedAt || '미정'}` : '미정 ~ 미정'),
        [metaForm.endedAt, metaForm.startedAt],
    )

    const draftPanel = useMemo(() => promotionData?.panels.find((panel) => panel.type === 'DRAFT'), [promotionData?.panels])

    const handleCopySlug = useCallback(() => {
        if (selectedSlug === null) return

        void navigator.clipboard.writeText(selectedSlug).then(() => {
            addToast({
                message: '슬러그가 복사되었습니다.',
                variant: 'success',
            })
        })
    }, [addToast, selectedSlug])

    const handleToggleActive = useCallback(async () => {
        if (selectedTournament === undefined) return
        try {
            await updateTournament.mutateAsync({
                isActive: !selectedTournament.isActive,
            })
            addToast({
                message: `대회가 ${!selectedTournament.isActive ? '활성화' : '비활성화'}되었습니다.`,
                variant: 'success',
            })
        } catch (error) {
            addToast({ message: getErrorMessage(error), variant: 'error' })
        }
    }, [addToast, selectedTournament, updateTournament])

    const handleDeleteTournament = useCallback(async () => {
        if (selectedTournamentId === null || selectedTournament === undefined) return
        if (!confirm(`'${selectedTournament.name}' 대회를 삭제할까요?\n하위 팀과 선수 데이터도 모두 삭제됩니다.`)) return

        try {
            await deleteTournament.mutateAsync(selectedTournamentId)
            setSelectedSlug(null)
            addToast({ message: '대회가 삭제되었습니다.', variant: 'success' })
        } catch (error) {
            addToast({ message: getErrorMessage(error), variant: 'error' })
        }
    }, [addToast, deleteTournament, selectedTournament, selectedTournamentId])

    const handleUpdateTournamentMeta = useCallback(
        async (event: FormEvent) => {
            event.preventDefault()
            if (selectedTournament === undefined) return
            if (metaForm.name.trim().length === 0) {
                addToast({
                    message: '대회명을 입력해주세요.',
                    variant: 'error',
                })
                return
            }

            try {
                await updateTournament.mutateAsync({
                    name: metaForm.name.trim(),
                    startedAt: metaForm.startedAt.trim().length > 0 ? metaForm.startedAt : undefined,
                    endedAt: metaForm.endedAt.trim().length > 0 ? metaForm.endedAt : undefined,
                    bannerUrl: metaForm.bannerUrl.trim().length > 0 ? metaForm.bannerUrl.trim() : undefined,
                    tags: metaForm.tags,
                    isChzzkSupport: metaForm.isChzzkSupport,
                    hostName: metaForm.hostName.trim().length > 0 ? metaForm.hostName.trim() : null,
                    hostAvatarUrl: metaForm.hostAvatarUrl.trim().length > 0 ? metaForm.hostAvatarUrl.trim() : null,
                    hostChannelUrl: metaForm.hostChannelUrl.trim().length > 0 ? metaForm.hostChannelUrl.trim() : null,
                    hostIsPartner: metaForm.hostIsPartner,
                    hostStreamerId: metaForm.hostStreamerId,
                    links: metaForm.links,
                    description: metaForm.description.trim().length > 0 ? metaForm.description.trim() : null,
                    showDescription: metaForm.showDescription,
                    broadcasterName: metaForm.broadcasterName.trim().length > 0 ? metaForm.broadcasterName.trim() : null,
                    broadcasterAvatarUrl: metaForm.broadcasterAvatarUrl.trim().length > 0 ? metaForm.broadcasterAvatarUrl.trim() : null,
                    broadcasterChannelUrl: metaForm.broadcasterChannelUrl.trim().length > 0 ? metaForm.broadcasterChannelUrl.trim() : null,
                    broadcasterIsPartner: metaForm.broadcasterIsPartner,
                    broadcasterStreamerId: metaForm.broadcasterStreamerId,
                    commentators: metaForm.commentators,
                })
                addToast({
                    message: '대회 메타가 저장되었습니다.',
                    variant: 'success',
                })
                setShowMetaEditor(false)
            } catch (error) {
                addToast({ message: getErrorMessage(error), variant: 'error' })
            }
        },
        [addToast, metaForm, selectedTournament, updateTournament],
    )

    const handleCreatePromotion = useCallback(async () => {
        try {
            await createPromotionConfig.mutateAsync({})
            addToast({
                message: '대회 구성 설정이 생성되었습니다.',
                variant: 'success',
            })
        } catch {
            addToast({
                message: '대회 구성 설정 생성에 실패했습니다.',
                variant: 'error',
            })
        }
    }, [addToast, createPromotionConfig])

    const handleDropPanel = useCallback(
        async (targetPanelId: number) => {
            if (draggingPanelId === null || draggingPanelId === targetPanelId) return
            const sourceIndex = sortedPanels.findIndex((panel) => panel.id === draggingPanelId)
            const targetIndex = sortedPanels.findIndex((panel) => panel.id === targetPanelId)
            if (sourceIndex < 0 || targetIndex < 0) return

            const nextPanels = [...sortedPanels]
            const [draggedPanel] = nextPanels.splice(sourceIndex, 1)
            if (draggedPanel === undefined) return

            nextPanels.splice(targetIndex, 0, draggedPanel)
            try {
                await reorderPromotionPanels.mutateAsync({
                    panelIdsInOrder: nextPanels.map((panel) => panel.id),
                })
            } catch {
                addToast({
                    message: '패널 순서 변경에 실패했습니다.',
                    variant: 'error',
                })
            }
        },
        [addToast, draggingPanelId, reorderPromotionPanels, sortedPanels],
    )

    const handleTogglePanelVisibility = useCallback(
        async (panelId: number) => {
            if (promotionData === undefined) return
            const panel = promotionData.panels.find((panelItem) => panelItem.id === panelId)
            if (panel === undefined) return

            const nextVisible = !(panel.enabled && !panel.hidden)
            try {
                await updatePromotionPanels.mutateAsync({
                    panels: [
                        {
                            id: panelId,
                            enabled: nextVisible,
                            hidden: false,
                        },
                    ],
                })
            } catch {
                addToast({
                    message: '패널 설정 변경에 실패했습니다.',
                    variant: 'error',
                })
            }
        },
        [addToast, promotionData, updatePromotionPanels],
    )

    const handleTogglePanelDefaultExpanded = useCallback(
        async (panelId: number) => {
            if (promotionData === undefined) return
            const panel = promotionData.panels.find((panelItem) => panelItem.id === panelId)
            if (panel === undefined) return

            const currentContent = typeof panel.content === 'object' && panel.content !== null ? panel.content : {}
            const nextDefaultExpanded = currentContent.defaultExpanded !== true

            try {
                await updatePromotionPanels.mutateAsync({
                    panels: [
                        {
                            id: panelId,
                            content: {
                                ...currentContent,
                                defaultExpanded: nextDefaultExpanded,
                            },
                        },
                    ],
                })
            } catch {
                addToast({
                    message: '패널 기본 펼침 설정 변경에 실패했습니다.',
                    variant: 'error',
                })
            }
        },
        [addToast, promotionData, updatePromotionPanels],
    )

    const handleSavePanelContent = useCallback(
        async (panelId: number, content: TournamentPanelContent) => {
            setSavingPanelId(panelId)
            try {
                await updatePromotionPanels.mutateAsync({
                    panels: [
                        {
                            id: panelId,
                            content: content as unknown as Record<string, unknown>,
                        },
                    ],
                })
                addToast({
                    message: '패널 내용이 저장되었습니다.',
                    variant: 'success',
                })
            } catch {
                addToast({
                    message: '패널 저장에 실패했습니다.',
                    variant: 'error',
                })
            } finally {
                setSavingPanelId(null)
            }
        },
        [addToast, updatePromotionPanels],
    )

    const handleDropTeam = useCallback(
        async (targetTeamId: number) => {
            if (draggingTeamId === null || draggingTeamId === targetTeamId) return
            const sourceIndex = sortedTeams.findIndex((team) => team.id === draggingTeamId)
            const targetIndex = sortedTeams.findIndex((team) => team.id === targetTeamId)
            if (sourceIndex < 0 || targetIndex < 0) return

            const nextOrder = [...sortedTeams]
            const [draggedTeam] = nextOrder.splice(sourceIndex, 1)
            if (draggedTeam === undefined) return

            nextOrder.splice(targetIndex, 0, draggedTeam)
            const changedOrders = nextOrder
                .map((team, index) => ({
                    teamId: team.id,
                    teamOrder: index,
                    hasChanged: team.teamOrder !== index,
                }))
                .filter((item) => item.hasChanged)
                .map(({ teamId, teamOrder }) => ({ teamId, teamOrder }))

            if (changedOrders.length === 0) return

            try {
                await reorderTeams.mutateAsync(changedOrders)
                addToast({
                    message: '팀 순서가 변경되었습니다.',
                    variant: 'success',
                })
            } catch (error) {
                addToast({ message: getErrorMessage(error), variant: 'error' })
            } finally {
                setDraggingTeamId(null)
                setHoveredTeamId(null)
            }
        },
        [addToast, draggingTeamId, reorderTeams, sortedTeams],
    )

    const handleSaveDraftParticipants = useCallback(
        async (participants: DraftParticipant[]) => {
            if (draftPanel === undefined) return
            const content = draftPanel.content as Record<string, unknown>
            await handleSavePanelContent(draftPanel.id, {
                startsOn: typeof content.startsOn === 'string' ? content.startsOn : null,
                meta: typeof content.meta === 'string' ? content.meta : '',
                participants,
            })
        },
        [draftPanel, handleSavePanelContent],
    )

    const handleSaveF1DriversPanel = useCallback(
        async (panelId: number, content: F1DriversContent) => {
            setSavingPanelId(panelId)
            try {
                await updateTournamentPlayersV2.mutateAsync({
                    players: content.participants
                        .map((participant, index) => {
                            const nickname = participant.nickname?.trim().length ? participant.nickname.trim() : participant.name.trim()
                            return {
                                nickname,
                                isPartner: participant.isPartner,
                                order: typeof participant.order === 'number' ? participant.order : index,
                                avatarUrl: participant.avatarUrl?.trim() ?? null,
                                channelUrl: participant.channelUrl?.trim() ?? null,
                                streamerId: participant.streamerId ?? null,
                                secondGroup: participant.secondGroup ?? null,
                                qualifyingEliminated: participant.qualifyingEliminated === true,
                                info: {
                                    name: participant.name,
                                    driverRole: participant.driverRole,
                                    tier: participant.tier,
                                    ranking: participant.ranking,
                                    participationCount: participant.participationCount,
                                    winCount: participant.winCount,
                                    carNumber: participant.carNumber,
                                },
                            }
                        })
                        .sort((a, b) => a.order - b.order),
                })
                addToast({
                    message: '드라이버 목록이 저장되었습니다.',
                    variant: 'success',
                })
            } catch (error) {
                addToast({
                    message: getErrorMessage(error),
                    variant: 'error',
                })
                throw error
            } finally {
                setSavingPanelId(null)
            }
        },
        [addToast, updateTournamentPlayersV2],
    )

    const handleTogglePromotionEditor = useCallback((panelId: number) => {
        setCollapsedPromotionEditors((previous) => ({
            ...previous,
            [panelId]: !(previous[panelId] ?? false),
        }))
    }, [])

    const pageTitle = mode === 'racing' ? '레이싱' : '오버워치'
    const pageDescription =
        mode === 'racing' ? '레이싱 대회를 선택한 뒤 메타와 구성요소를 함께 관리합니다.' : '기존 오버워치 대회를 선택한 뒤 메타와 구성요소를 함께 관리합니다.'
    const createTournamentDefaultGame = mode === 'racing' ? 'racing' : 'overwatch'

    return {
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
        errorMessage: getErrorMessage(tournamentTeamError),
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
        playersData,
        promotionData,
        reorderTeams,
        savingPanelId,
        schedulePreview,
        selectedSlug,
        selectedTournament,
        selectedTournamentId,
        setBroadcasterSearchInput,
        setBroadcasterSelectedId,
        setCollapsedPromotionEditors,
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
    }
}
