import {
    DraftPanelEditor,
    F1DriversPanelEditor,
    F1QualifyingPanelEditor,
    F1RaceResultPanelEditor,
    F1RaceSchedulePanelEditor,
    F1StandingsPanelEditor,
    F1TeamDraftPanelEditor,
    FinalResultPanelEditor,
    SchedulePanelEditor,
} from '../index'
import type { F1DriversContent, TournamentAdminTeam, TournamentPanelContent, TournamentPromotionPanel } from '../../types'
import { PromotionPanelSection } from './PromotionPanelSection'

interface TournamentPromotionEditorsProps {
    visiblePanels: TournamentPromotionPanel[]
    collapsedPromotionEditors: Record<number, boolean>
    savingPanelId: number | null
    sortedTeams: TournamentAdminTeam[]
    isSelectedOverwatchTournament: boolean
    promotionPanels: TournamentPromotionPanel[]
    f1DriversContentFromAdminApi: F1DriversContent | null
    onTogglePromotionEditor: (panelId: number) => void
    onSavePanelContent: (panelId: number, content: TournamentPanelContent) => Promise<void>
    onSaveF1DriversPanel: (panelId: number, content: F1DriversContent) => Promise<void>
}

export function TournamentPromotionEditors({
    collapsedPromotionEditors,
    f1DriversContentFromAdminApi,
    isSelectedOverwatchTournament,
    onSaveF1DriversPanel,
    onSavePanelContent,
    onTogglePromotionEditor,
    promotionPanels,
    savingPanelId,
    sortedTeams,
    visiblePanels,
}: TournamentPromotionEditorsProps) {
    const draftPanelEditors = visiblePanels.filter((panel) => panel.type === 'DRAFT')
    const generalPanelEditors = visiblePanels.filter((panel) => panel.type !== 'DRAFT' && panel.type !== 'PLAYER_LIST' && panel.type !== 'TEAMS')

    return (
        <>
            {draftPanelEditors.map((panel) => (
                <PromotionPanelSection
                    key={`promotion-editor-${panel.id}`}
                    panelId={panel.id}
                    panelType={panel.type}
                    collapsed={collapsedPromotionEditors[panel.id] ?? false}
                    onToggle={onTogglePromotionEditor}
                >
                    <DraftPanelEditor
                        content={panel.content}
                        onSave={(content) => onSavePanelContent(panel.id, content)}
                        isSaving={savingPanelId === panel.id}
                    />
                </PromotionPanelSection>
            ))}

            {generalPanelEditors.map((panel) => (
                <PromotionPanelSection
                    key={`promotion-editor-${panel.id}`}
                    panelId={panel.id}
                    panelType={panel.type}
                    collapsed={collapsedPromotionEditors[panel.id] ?? false}
                    onToggle={onTogglePromotionEditor}
                >
                    {panel.type === 'SCHEDULE' && (
                        <SchedulePanelEditor
                            content={panel.content}
                            teams={sortedTeams}
                            onSave={(content) => onSavePanelContent(panel.id, content)}
                            isSaving={savingPanelId === panel.id}
                            isOverwatch={isSelectedOverwatchTournament}
                        />
                    )}
                    {panel.type === 'FINAL_RESULT' && (
                        <FinalResultPanelEditor
                            content={panel.content}
                            teams={sortedTeams}
                            onSave={(content) => onSavePanelContent(panel.id, content)}
                            isSaving={savingPanelId === panel.id}
                        />
                    )}
                    {panel.type === 'F1_DRIVERS' && (
                        <F1DriversPanelEditor
                            content={(f1DriversContentFromAdminApi ?? panel.content) as unknown as Record<string, unknown>}
                            onSave={(content) => onSaveF1DriversPanel(panel.id, content)}
                            isSaving={savingPanelId === panel.id}
                        />
                    )}
                    {panel.type === 'F1_RACE_SCHEDULE' && (
                        <F1RaceSchedulePanelEditor
                            content={panel.content}
                            onSave={(content) => onSavePanelContent(panel.id, content)}
                            isSaving={savingPanelId === panel.id}
                        />
                    )}
                    {panel.type === 'F1_RACE_RESULT' && (
                        <F1RaceResultPanelEditor
                            content={panel.content}
                            onSave={(content) => onSavePanelContent(panel.id, content)}
                            isSaving={savingPanelId === panel.id}
                        />
                    )}
                    {panel.type === 'F1_STANDINGS' && (
                        <F1StandingsPanelEditor
                            content={panel.content}
                            onSave={(content) => onSavePanelContent(panel.id, content)}
                            isSaving={savingPanelId === panel.id}
                            raceResultContent={promotionPanels.find((item) => item.type === 'F1_RACE_RESULT')?.content}
                        />
                    )}
                    {panel.type === 'F1_QUALIFYING' && (
                        <F1QualifyingPanelEditor
                            content={panel.content}
                            onSave={(content) => onSavePanelContent(panel.id, content)}
                            isSaving={savingPanelId === panel.id}
                        />
                    )}
                    {panel.type === 'F1_TEAM_DRAFT' && (
                        <F1TeamDraftPanelEditor
                            content={panel.content}
                            onSave={(content) => onSavePanelContent(panel.id, content)}
                            isSaving={savingPanelId === panel.id}
                        />
                    )}
                </PromotionPanelSection>
            ))}
        </>
    )
}
