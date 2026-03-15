import { useState, type FormEvent } from 'react'
import { useAdminToast } from './useAdminToast'
import { useCategories } from './useCategories'
import { useCreateBroadcast, useUpdateBroadcast } from './useBroadcastSchedule'
import { useStreamers } from './useStreamers'
import type {
    AdminBroadcastParticipantInput,
    AffiliationItem,
    CreateBroadcastRequest,
    UpdateBroadcastRequest,
} from '../types'
import type { BroadcastFormState } from '../types/broadcastSchedule'
import type { Broadcast } from '../types'
import { getErrorMessage } from '../utils/error'
import {
    buildLocalDatetime,
    collectQuickTags,
    formatTagInput,
    initFormState,
    localDatetimeToISO,
    parseTagInput,
} from '../utils/broadcastSchedule'

type UseBroadcastFormParams = {
    mode: 'create' | 'edit'
    broadcast?: Broadcast
    onClose: () => void
    onSuccess: () => void
}

type CommitStreamerEditParams = {
    originalName: string
    streamerId: number
    streamerName: string
    avatarUrl?: string
    isPartner: boolean
    affiliations: AffiliationItem[]
}

export function useBroadcastForm({ mode, broadcast, onClose, onSuccess }: UseBroadcastFormParams) {
    const [form, setForm] = useState<BroadcastFormState>(() => initFormState(broadcast))
    const [participantNameInput, setParticipantNameInput] = useState('')
    const [participantStreamerId, setParticipantStreamerId] = useState<number>()
    const [participantAvatarUrl, setParticipantAvatarUrl] = useState<string>()
    const [participantIsPartner, setParticipantIsPartner] = useState(false)
    const [participantAffiliations, setParticipantAffiliations] = useState<AffiliationItem[]>([])
    const [editingParticipantName, setEditingParticipantName] = useState<string | null>(null)
    const [editingInput, setEditingInput] = useState('')
    const [categorySearch, setCategorySearch] = useState('')
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const [initialFormSnapshot] = useState<string>(() => JSON.stringify(initFormState(broadcast)))

    const { addToast } = useAdminToast()
    const createMutation = useCreateBroadcast()
    const updateMutation = useUpdateBroadcast(broadcast?.id ?? '')
    const { data: categoriesData } = useCategories()

    const showParticipantSuggestions = participantNameInput.trim().length > 0 && participantStreamerId === undefined
    const participantStreamerQuery = useStreamers(
        showParticipantSuggestions ? { nickname: participantNameInput.trim(), size: 5 } : { size: 0 },
    )
    const showEditSuggestions = editingParticipantName !== null && editingInput.trim().length > 0
    const editStreamerQuery = useStreamers(showEditSuggestions ? { nickname: editingInput.trim(), size: 5 } : { size: 0 })
    const categories = categoriesData?.categories ?? []
    const isPending = createMutation.isPending || updateMutation.isPending

    const quickTags = collectQuickTags(form.participants)
    const selectedTags = parseTagInput(form.tags)

    const hasUnsavedChanges =
        JSON.stringify(form) !== initialFormSnapshot ||
        participantNameInput.trim().length > 0 ||
        participantStreamerId !== undefined ||
        editingParticipantName !== null ||
        editingInput.trim().length > 0

    function requestClose(): void {
        if (isPending) {
            return
        }
        if (!hasUnsavedChanges) {
            onClose()
            return
        }
        const shouldClose = window.confirm('저장하지 않은 변경사항이 있습니다. 닫을까요?')
        if (shouldClose) {
            onClose()
        }
    }

    function updateField<K extends keyof BroadcastFormState>(key: K, value: BroadcastFormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    function addParticipant(): void {
        const name = participantNameInput.trim()
        if (name.length === 0) return
        if (form.participants.some((participant) => participant.name === name)) {
            addToast({ message: '이미 추가된 참석자입니다.', variant: 'error' })
            return
        }
        setForm((prev) => ({
            ...prev,
            participants: [
                ...prev.participants,
                {
                    name,
                    streamerId: participantStreamerId,
                    isHost: false,
                    avatarUrl: participantAvatarUrl,
                    isPartner: participantIsPartner,
                    affiliations: participantAffiliations,
                },
            ],
        }))
        setParticipantNameInput('')
        setParticipantStreamerId(undefined)
        setParticipantAvatarUrl(undefined)
        setParticipantIsPartner(false)
        setParticipantAffiliations([])
    }

    function startEditing(name: string): void {
        setEditingParticipantName(name)
        setEditingInput(name)
    }

    function cancelEditing(): void {
        setEditingParticipantName(null)
        setEditingInput('')
    }

    function commitNameEdit(originalName: string): void {
        const normalized = editingInput.trim()
        if (normalized.length === 0) {
            addToast({ message: '이름을 입력해주세요.', variant: 'error' })
            return
        }
        if (normalized !== originalName && form.participants.some((participant) => participant.name === normalized)) {
            addToast({ message: '이미 존재하는 참석자 이름입니다.', variant: 'error' })
            return
        }
        if (normalized !== originalName) {
            setForm((prev) => ({
                ...prev,
                participants: prev.participants.map((participant) =>
                    participant.name === originalName ? { ...participant, name: normalized } : participant,
                ),
            }))
        }
        cancelEditing()
    }

    function commitStreamerEdit({
        originalName,
        streamerId,
        streamerName,
        avatarUrl,
        isPartner,
        affiliations,
    }: CommitStreamerEditParams): void {
        setForm((prev) => ({
            ...prev,
            participants: prev.participants.map((participant) =>
                participant.name === originalName
                    ? {
                          ...participant,
                          name: streamerName,
                          streamerId,
                          avatarUrl,
                          isPartner,
                          affiliations,
                      }
                    : participant,
            ),
        }))
        cancelEditing()
    }

    function toggleQuickTag(tag: string): void {
        const tags = parseTagInput(form.tags)
        const hasTag = tags.includes(tag)
        if (hasTag) {
            updateField('tags', formatTagInput(tags.filter((existingTag) => existingTag !== tag)))
            return
        }
        updateField('tags', formatTagInput([...tags, tag]))
    }

    function removeParticipant(name: string): void {
        setForm((prev) => ({
            ...prev,
            participants: prev.participants.filter((participant) => participant.name !== name),
        }))
    }

    function setHost(name: string): void {
        setForm((prev) => ({
            ...prev,
            participants: prev.participants.map((participant) => ({
                ...participant,
                isHost: participant.name === name,
            })),
        }))
    }

    function clearHost(): void {
        setForm((prev) => ({
            ...prev,
            participants: prev.participants.map((participant) => ({
                ...participant,
                isHost: false,
            })),
        }))
    }

    async function handleSubmit(e: FormEvent): Promise<void> {
        e.preventDefault()
        if (form.title.trim().length === 0) {
            addToast({ message: '제목을 입력해주세요.', variant: 'error' })
            return
        }
        const startLocal = buildLocalDatetime(form.startDate, form.startHour, form.startMinute)
        if (startLocal === null) {
            addToast({ message: '시작 날짜와 시간을 입력해주세요.', variant: 'error' })
            return
        }
        const endLocal = buildLocalDatetime(form.endDate, form.endHour, form.endMinute)
        const tags = parseTagInput(form.tags)
        const participants: AdminBroadcastParticipantInput[] = form.participants.map((participant) => ({
            name: participant.name,
            ...(participant.streamerId !== undefined && {
                streamerId: participant.streamerId,
            }),
            ...(participant.isHost !== undefined && {
                isHost: participant.isHost,
            }),
        }))

        try {
            if (mode === 'create') {
                const body: CreateBroadcastRequest = {
                    title: form.title.trim(),
                    startTime: localDatetimeToISO(startLocal),
                    broadcastType: form.broadcastType,
                    isVisible: form.isVisible,
                    isChzzkSupport: form.isChzzkSupport,
                    ...(form.categoryId !== null && {
                        categoryId: form.categoryId,
                    }),
                    ...(endLocal !== null && {
                        endTime: localDatetimeToISO(endLocal),
                    }),
                    ...(tags.length > 0 && { tags }),
                    participants,
                }
                await createMutation.mutateAsync(body)
                addToast({ message: '방송이 추가되었습니다.', variant: 'success' })
            } else {
                const body: UpdateBroadcastRequest = {
                    title: form.title.trim(),
                    startTime: localDatetimeToISO(startLocal),
                    broadcastType: form.broadcastType,
                    isVisible: form.isVisible,
                    isChzzkSupport: form.isChzzkSupport,
                    categoryId: form.categoryId !== null ? form.categoryId : undefined,
                    endTime: endLocal !== null ? localDatetimeToISO(endLocal) : null,
                    tags,
                    participants,
                }
                await updateMutation.mutateAsync(body)
                addToast({ message: '방송이 수정되었습니다.', variant: 'success' })
            }
            onSuccess()
            onClose()
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    return {
        form,
        participantNameInput,
        participantStreamerId,
        participantAvatarUrl,
        participantIsPartner,
        participantAffiliations,
        editingParticipantName,
        editingInput,
        categorySearch,
        isCategoryOpen,
        showParticipantSuggestions,
        participantStreamerQuery,
        showEditSuggestions,
        editStreamerQuery,
        categories,
        isPending,
        quickTags,
        selectedTags,
        setParticipantNameInput,
        setParticipantStreamerId,
        setParticipantAvatarUrl,
        setParticipantIsPartner,
        setParticipantAffiliations,
        setEditingInput,
        setCategorySearch,
        setIsCategoryOpen,
        requestClose,
        updateField,
        addParticipant,
        startEditing,
        cancelEditing,
        commitNameEdit,
        commitStreamerEdit,
        toggleQuickTag,
        removeParticipant,
        setHost,
        clearHost,
        handleSubmit,
    }
}
