import { useState } from 'react'
import type { F1TeamDraftContent, F1DraftTeam, F1DraftTeamDriver, F1DraftTeamOperator, F1DriverRole } from '../types'

interface F1TeamDraftPanelEditorProps {
    content: Record<string, unknown>
    onSave: (content: F1TeamDraftContent) => Promise<void>
    isSaving: boolean
}

function parseDriver(raw: unknown): F1DraftTeamDriver {
    const d = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
    return {
        driverId: typeof d.driverId === 'string' ? d.driverId : crypto.randomUUID(),
        name: typeof d.name === 'string' ? d.name : '',
        avatarUrl: typeof d.avatarUrl === 'string' ? d.avatarUrl : null,
        isPartner: d.isPartner === true,
        driverRole: d.driverRole === 'SECOND' ? 'SECOND' : 'FIRST',
    }
}

function parseOperator(raw: unknown): F1DraftTeamOperator | null {
    if (raw === null || raw === undefined) return null
    const d = (typeof raw === 'object' ? raw : {}) as Record<string, unknown>
    if (typeof d.name !== 'string' || d.name.trim().length === 0) return null
    return {
        driverId: typeof d.driverId === 'string' ? d.driverId : crypto.randomUUID(),
        name: d.name,
        avatarUrl: typeof d.avatarUrl === 'string' ? d.avatarUrl : null,
        isPartner: d.isPartner === true,
    }
}

function parseTeam(raw: unknown, index: number): F1DraftTeam {
    const t = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
    return {
        id: typeof t.id === 'string' ? t.id : crypto.randomUUID(),
        teamName: typeof t.teamName === 'string' ? t.teamName : '',
        firstDriver: parseDriver(t.firstDriver),
        secondDriver: parseDriver(t.secondDriver),
        operator: parseOperator(t.operator),
        order: typeof t.order === 'number' ? t.order : index,
    }
}

function parseContent(raw: Record<string, unknown>): F1TeamDraftContent {
    const arr = Array.isArray(raw.teams) ? raw.teams : []
    return { teams: arr.map(parseTeam) }
}

function makeEmptyDriver(role: F1DriverRole): F1DraftTeamDriver {
    return {
        driverId: crypto.randomUUID(),
        name: '',
        avatarUrl: null,
        isPartner: false,
        driverRole: role,
    }
}

export function F1TeamDraftPanelEditor({ content, onSave, isSaving }: F1TeamDraftPanelEditorProps) {
    const parsed = parseContent(content)
    const [teams, setTeams] = useState<F1DraftTeam[]>(parsed.teams)

    function addTeam() {
        const next: F1DraftTeam = {
            id: crypto.randomUUID(),
            teamName: `Team ${teams.length + 1}`,
            firstDriver: makeEmptyDriver('FIRST'),
            secondDriver: makeEmptyDriver('SECOND'),
            operator: null,
            order: teams.length,
        }
        setTeams((prev) => [...prev, next])
    }

    function removeTeam(teamId: string) {
        if (!confirm('이 팀을 삭제할까요?')) return
        setTeams((prev) => prev.filter((t) => t.id !== teamId).map((t, i) => ({ ...t, order: i })))
    }

    function updateTeam(teamId: string, patch: Partial<F1DraftTeam>) {
        setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, ...patch } : t)))
    }

    function updateDriver(teamId: string, role: 'firstDriver' | 'secondDriver', patch: Partial<F1DraftTeamDriver>) {
        setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, [role]: { ...t[role], ...patch } } : t)))
    }

    function updateOperator(teamId: string, patch: Partial<F1DraftTeamOperator> | null) {
        setTeams((prev) =>
            prev.map((t) => {
                if (t.id !== teamId) return t
                if (patch === null) return { ...t, operator: null }
                return {
                    ...t,
                    operator: t.operator
                        ? { ...t.operator, ...patch }
                        : {
                              driverId: crypto.randomUUID(),
                              name: '',
                              avatarUrl: null,
                              isPartner: false,
                              ...patch,
                          },
                }
            }),
        )
    }

    async function handleSave() {
        await onSave({ teams })
    }

    return (
        <div className="mt-3 space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-[#2e2e38] dark:bg-[#20202a]">
            {teams.length > 0 ? (
                <div className="space-y-4">
                    {teams.map((team, index) => (
                        <div
                            key={team.id}
                            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2e2e38] dark:bg-[#1a1a23]"
                        >
                            {/* 팀 헤더 */}
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-500 dark:text-[#adadb8]">팀 #{index + 1}</span>
                                <button
                                    type="button"
                                    onClick={() => removeTeam(team.id)}
                                    className="cursor-pointer text-xs text-gray-400 hover:text-red-500 dark:text-[#6b6b7a]"
                                >
                                    팀 삭제
                                </button>
                            </div>

                            {/* 팀명 */}
                            <input
                                type="text"
                                value={team.teamName}
                                onChange={(e) => updateTeam(team.id, { teamName: e.target.value })}
                                placeholder="팀명"
                                className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                            />

                            {/* 드라이버 슬롯 */}
                            <div className="grid gap-3 sm:grid-cols-2">
                                {(
                                    [
                                        {
                                            role: 'firstDriver' as const,
                                            label: '퍼스트 드라이버',
                                            color: 'text-[#E10600]',
                                        },
                                        {
                                            role: 'secondDriver' as const,
                                            label: '세컨드 드라이버',
                                            color: 'text-[#6aadcc]',
                                        },
                                    ] as const
                                ).map(({ role, label, color }) => {
                                    const driver = team[role]
                                    return (
                                        <div
                                            key={role}
                                            className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-[#2e2e38] dark:bg-[#20202a]"
                                        >
                                            <p className={`mb-2 text-[10px] font-black tracking-widest uppercase ${color}`}>{label}</p>
                                            <div className="space-y-1.5">
                                                <input
                                                    type="text"
                                                    value={driver.name}
                                                    onChange={(e) =>
                                                        updateDriver(team.id, role, {
                                                            name: e.target.value,
                                                        })
                                                    }
                                                    placeholder="이름"
                                                    className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                                />
                                                <input
                                                    type="text"
                                                    value={driver.avatarUrl ?? ''}
                                                    onChange={(e) =>
                                                        updateDriver(team.id, role, {
                                                            avatarUrl: e.target.value.trim().length > 0 ? e.target.value : null,
                                                        })
                                                    }
                                                    placeholder="아바타 URL"
                                                    className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                                />
                                                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-600 dark:text-[#adadb8]">
                                                    <input
                                                        type="checkbox"
                                                        checked={driver.isPartner}
                                                        onChange={(e) =>
                                                            updateDriver(team.id, role, {
                                                                isPartner: e.target.checked,
                                                            })
                                                        }
                                                        className="cursor-pointer"
                                                    />
                                                    파트너
                                                </label>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* 오퍼레이터 (선택) */}
                            <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-[#2e2e38] dark:bg-[#20202a]">
                                <div className="mb-2 flex items-center justify-between">
                                    <p className="text-[10px] font-black tracking-widest uppercase text-[#a855f7]">오퍼레이터 (선택)</p>
                                    {team.operator !== null ? (
                                        <button
                                            type="button"
                                            onClick={() => updateOperator(team.id, null)}
                                            className="cursor-pointer text-xs text-gray-400 hover:text-red-500"
                                        >
                                            제거
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateOperator(team.id, {
                                                    driverId: crypto.randomUUID(),
                                                    name: '',
                                                    avatarUrl: null,
                                                    isPartner: false,
                                                })
                                            }
                                            className="cursor-pointer text-xs text-[#a855f7] hover:text-purple-400"
                                        >
                                            + 추가
                                        </button>
                                    )}
                                </div>
                                {team.operator !== null && (
                                    <div className="space-y-1.5">
                                        <input
                                            type="text"
                                            value={team.operator.name}
                                            onChange={(e) => updateOperator(team.id, { name: e.target.value })}
                                            placeholder="이름"
                                            className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                        />
                                        <input
                                            type="text"
                                            value={team.operator.avatarUrl ?? ''}
                                            onChange={(e) =>
                                                updateOperator(team.id, {
                                                    avatarUrl: e.target.value.trim().length > 0 ? e.target.value : null,
                                                })
                                            }
                                            placeholder="아바타 URL"
                                            className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                        />
                                        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-600 dark:text-[#adadb8]">
                                            <input
                                                type="checkbox"
                                                checked={team.operator.isPartner}
                                                onChange={(e) =>
                                                    updateOperator(team.id, {
                                                        isPartner: e.target.checked,
                                                    })
                                                }
                                                className="cursor-pointer"
                                            />
                                            파트너
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-xs text-gray-400 dark:text-[#6b6b7a]">구성된 팀이 없습니다.</p>
            )}

            <button
                type="button"
                onClick={addTeam}
                className="cursor-pointer w-full rounded-xl border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-400 hover:border-blue-400 hover:text-blue-500 dark:border-[#3a3a44]"
            >
                + 팀 추가
            </button>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => {
                        void handleSave()
                    }}
                    disabled={isSaving}
                    className="cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
                >
                    {isSaving ? '저장 중...' : '팀 드래프트 저장'}
                </button>
            </div>
        </div>
    )
}
