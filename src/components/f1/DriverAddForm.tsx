import type { F1DriverRole } from '../../types'

export interface SelectedStreamer {
    id: number
    name: string
    nickname: string
    channelId: string | null
    channelImageUrl: string | null
    isPartner: boolean
}

interface DriverAddFormProps {
    selectedRole: F1DriverRole
    searchInput: string
    selectedStreamer: SelectedStreamer | null
    isFetching: boolean
    suggestions:
        | Array<{
              id: number
              name: string
              nickname: string
              channelId: string | null
              channelImageUrl: string | null
              isPartner: boolean
          }>
        | undefined
    onRoleChange: (value: F1DriverRole) => void
    onSearchInputChange: (value: string) => void
    onClearSelectedStreamer: () => void
    onSelectStreamer: (streamer: SelectedStreamer) => void
    onAddDriver: () => void
}

export function DriverAddForm({
    selectedRole,
    searchInput,
    selectedStreamer,
    isFetching,
    suggestions,
    onRoleChange,
    onSearchInputChange,
    onClearSelectedStreamer,
    onSelectStreamer,
    onAddDriver,
}: DriverAddFormProps) {
    const showSuggestions = selectedStreamer === null && searchInput.trim().length > 0

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-2.5 dark:border-[#2e2e38] dark:bg-[#1a1a23]">
            <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-[#adadb8]">관리 스트리머로 드라이버 추가</p>

            <div className="relative space-y-2">
                <div className="grid gap-2 md:grid-cols-[140px_1fr_auto]">
                    <select
                        value={selectedRole}
                        onChange={(e) => onRoleChange(e.target.value as F1DriverRole)}
                        className="cursor-pointer w-full rounded-lg border border-gray-300 px-2 py-2 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                    >
                        <option value="FIRST">퍼스트</option>
                        <option value="SECOND">세컨드</option>
                    </select>

                    <div className="relative">
                        <input
                            type="text"
                            value={selectedStreamer !== null ? selectedStreamer.nickname : searchInput}
                            onChange={(e) => onSearchInputChange(e.target.value)}
                            readOnly={selectedStreamer !== null}
                            placeholder="관리 스트리머 검색"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                        />

                        {selectedStreamer !== null && (
                            <button
                                type="button"
                                onClick={onClearSelectedStreamer}
                                className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                                aria-label="선택 해제"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onAddDriver}
                        disabled={selectedStreamer === null}
                        className="cursor-pointer w-full rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:opacity-40 md:w-auto"
                    >
                        드라이버 추가
                    </button>
                </div>

                {showSuggestions && (
                    <div className="absolute z-50 mt-1 max-h-44 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-[#3a3a44] dark:bg-[#26262e]">
                        {isFetching && <p className="px-3 py-2 text-xs text-gray-500">검색 중...</p>}
                        {!isFetching && (suggestions?.length ?? 0) === 0 && <p className="px-3 py-2 text-xs text-gray-500">결과 없음</p>}
                        {!isFetching &&
                            suggestions?.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                        onSelectStreamer({
                                            id: s.id,
                                            name: s.name,
                                            nickname: s.nickname,
                                            channelId: s.channelId,
                                            channelImageUrl: s.channelImageUrl,
                                            isPartner: s.isPartner,
                                        })
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-800 transition hover:bg-gray-50 dark:text-[#efeff1] dark:hover:bg-[#3a3a44]"
                                >
                                    {s.channelImageUrl !== null ? (
                                        <img src={s.channelImageUrl} alt={s.nickname} className="h-5 w-5 rounded-full object-cover" />
                                    ) : (
                                        <div className="h-5 w-5 rounded-full bg-gray-100 dark:bg-[#3a3a44]" />
                                    )}
                                    <span className="min-w-0 flex-1 truncate">{s.nickname}</span>
                                    {s.isPartner && <span className="text-[10px] text-amber-500">파트너</span>}
                                </button>
                            ))}
                    </div>
                )}

                <p className="text-[11px] text-gray-400 dark:text-[#6b6b7a]">모든 드라이버는 관리 스트리머 검색으로 추가합니다.</p>
            </div>
        </div>
    )
}
