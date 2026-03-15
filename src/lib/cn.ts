import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind 클래스 병합 유틸리티
 * clsx로 조건부 클래스를 처리하고, tailwind-merge로 충돌을 해소한다.
 * @example cn('px-4', isLarge && 'px-6') → 'px-6'
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
