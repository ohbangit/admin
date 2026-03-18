export function getInitial(name: string): string {
    const trimmed = name.trim()
    if (trimmed.length === 0) return 'U'
    return trimmed[0]?.toUpperCase() ?? 'U'
}

export function formatFollowerCount(value: number | null): string {
    if (value === null) return '-'
    return value.toLocaleString('ko-KR')
}

export function normalizeInput(value: string): string {
    return value.trim()
}
