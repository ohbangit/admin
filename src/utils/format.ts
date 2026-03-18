export function getInitial(name: string): string {
    const trimmed = name.trim()
    if (trimmed.length === 0) return 'U'
    return trimmed[0]?.toUpperCase() ?? 'U'
}
