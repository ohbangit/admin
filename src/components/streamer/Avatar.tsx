import type { StreamerItem } from '../../types'
import { cn } from '../../lib/cn'
import { getInitial } from '../../utils/format'

interface AvatarProps {
    streamer: StreamerItem
    sizeClass?: string
    textClass?: string
}

export function Avatar({ streamer, sizeClass = 'h-10 w-10', textClass = 'text-xs' }: AvatarProps) {
    if (streamer.channelImageUrl && streamer.channelImageUrl.trim().length > 0) {
        return <img src={streamer.channelImageUrl} alt={`${streamer.name} 프로필`} className={cn('rounded-full border border-[#3a3a44] object-cover', sizeClass)} />
    }

    return (
        <div className={cn('flex items-center justify-center rounded-full border border-[#3a3a44] bg-[#26262e] font-semibold text-[#adadb8]', sizeClass, textClass)}>
            {getInitial(streamer.name)}
        </div>
    )
}
