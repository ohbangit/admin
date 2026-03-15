import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../lib/cn'
import { DAY_NAMES_SHORT } from '../constants/date'

const WEEKDAYS = DAY_NAMES_SHORT

interface CalendarPickerProps {
    value: string | null
    onChange: (value: string | null) => void
}

/** "YYYY-MM-DD HH:mm" 또는 "YYYY-MM-DD" 파싱 */
function parseValue(v: string | null): {
    date: dayjs.Dayjs | null
    time: string
} {
    if (!v) return { date: null, time: '00:00' }
    const [datePart, timePart] = v.split(' ')
    const d = dayjs(datePart)
    return { date: d.isValid() ? d : null, time: timePart ?? '00:00' }
}

export function CalendarPicker({ value, onChange }: CalendarPickerProps) {
    const { date: initDate, time: initTime } = parseValue(value)

    const [open, setOpen] = useState(false)
    const [cursor, setCursor] = useState(
        () => initDate?.startOf('month') ?? dayjs().startOf('month'),
    )
    const [pendingDate, setPendingDate] = useState<dayjs.Dayjs | null>(initDate)
    const [pendingTime, setPendingTime] = useState(initTime)
    const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 })

    const triggerRef = useRef<HTMLButtonElement>(null)
    const popoverRef = useRef<HTMLDivElement>(null)

    const today = dayjs()

    // 값이 외부에서 바뀌면 내부 state 동기화
    useEffect(() => {
        const { date, time } = parseValue(value)
        setPendingDate(date)
        setPendingTime(time)
        if (date) setCursor(date.startOf('month'))
    }, [value])

    function openPopover() {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect()
            setPopoverPos({ top: rect.bottom + 4, left: rect.left })
        }
        setOpen(true)
    }

    // 외부 클릭 시 닫기
    useEffect(() => {
        if (!open) return
        function handleMouseDown(e: MouseEvent) {
            const target = e.target as Node
            if (
                !popoverRef.current?.contains(target) &&
                !triggerRef.current?.contains(target)
            ) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleMouseDown)
        return () => document.removeEventListener('mousedown', handleMouseDown)
    }, [open])

    function buildDays() {
        const startOfGrid = cursor.startOf('month').startOf('week')
        const days: dayjs.Dayjs[] = []
        for (let i = 0; i < 42; i++) {
            days.push(startOfGrid.add(i, 'day'))
        }
        return days
    }

    function handleConfirm() {
        if (pendingDate === null) return
        onChange(`${pendingDate.format('YYYY-MM-DD')} ${pendingTime}`)
        setOpen(false)
    }

    function handleClear() {
        onChange(null)
        setPendingDate(null)
        setPendingTime('00:00')
        setOpen(false)
    }

    const days = buildDays()

    const triggerLabel = (() => {
        if (!value) return null
        const { date, time } = parseValue(value)
        if (!date) return null
        return `${date.format('YYYY년 M월 D일')} ${time}`
    })()

    const popover = open
        ? createPortal(
              <div
                  ref={popoverRef}
                  style={{ top: popoverPos.top, left: popoverPos.left }}
                  className="fixed z-[9999] w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-xl dark:border-[#3a3a44] dark:bg-[#1a1a23]"
              >
                  {/* 헤더 — 월 이동 */}
                  <div className="mb-3 flex items-center justify-between">
                      <button
                          type="button"
                          onClick={() =>
                              setCursor((c) => c.subtract(1, 'month'))
                          }
                          className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 dark:text-[#adadb8] dark:hover:bg-[#2e2e38]"
                          aria-label="이전 달"
                      >
                          <ChevronLeft size={16} />
                      </button>
                      <span className="text-sm font-semibold text-gray-700 dark:text-[#efeff1]">
                          {cursor.format('YYYY년 M월')}
                      </span>
                      <button
                          type="button"
                          onClick={() => setCursor((c) => c.add(1, 'month'))}
                          className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 dark:text-[#adadb8] dark:hover:bg-[#2e2e38]"
                          aria-label="다음 달"
                      >
                          <ChevronRight size={16} />
                      </button>
                  </div>

                  {/* 요일 헤더 */}
                  <div className="mb-1 grid grid-cols-7 text-center">
                      {WEEKDAYS.map((d) => (
                          <span
                              key={d}
                              className="py-1 text-[10px] font-medium text-gray-400 dark:text-[#6b6b7a]"
                          >
                              {d}
                          </span>
                      ))}
                  </div>

                  {/* 날짜 그리드 */}
                  <div className="grid grid-cols-7">
                      {days.map((day) => {
                          const isCurrentMonth = day.month() === cursor.month()
                          const isSelected =
                              pendingDate !== null &&
                              day.isSame(pendingDate, 'day')
                          const isToday = day.isSame(today, 'day')

                          return (
                              <button
                                  key={day.format('YYYY-MM-DD')}
                                  type="button"
                                  onClick={() => {
                                      setPendingDate(day)
                                      if (!isCurrentMonth)
                                          setCursor(day.startOf('month'))
                                  }}
                                  className={cn(
                                      'flex h-8 w-full items-center justify-center rounded-full text-xs transition',
                                      isSelected
                                          ? 'bg-blue-500 font-semibold text-white'
                                          : isToday
                                            ? 'font-semibold text-blue-500 ring-1 ring-blue-400 dark:text-blue-400 dark:ring-blue-600'
                                            : isCurrentMonth
                                              ? 'text-gray-700 hover:bg-gray-100 dark:text-[#efeff1] dark:hover:bg-[#2e2e38]'
                                              : 'text-gray-300 hover:bg-gray-50 dark:text-[#3a3a44] dark:hover:bg-[#26262e]',
                                  )}
                              >
                                  {day.date()}
                              </button>
                          )
                      })}
                  </div>

                  {/* 시간 입력 */}
                  <div className="mt-3 border-t border-gray-100 pt-3 dark:border-[#2e2e38]">
                      <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-[#adadb8]">
                              시간
                          </span>
                          <input
                              type="time"
                              value={pendingTime}
                              onChange={(e) => setPendingTime(e.target.value)}
                              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-center text-sm tabular-nums text-gray-700 dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                          />
                      </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="mt-3 flex items-center gap-2">
                      {value !== null && (
                          <button
                              type="button"
                              onClick={handleClear}
                              className="flex-1 rounded-lg py-1.5 text-xs text-gray-400 transition hover:bg-gray-50 hover:text-red-400 dark:text-[#6b6b7a] dark:hover:bg-[#26262e] dark:hover:text-red-500"
                          >
                              선택 해제
                          </button>
                      )}
                      <button
                          type="button"
                          onClick={handleConfirm}
                          disabled={pendingDate === null}
                          className="flex-1 rounded-lg bg-blue-500 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:opacity-40"
                      >
                          확인
                      </button>
                  </div>
              </div>,
              document.body,
          )
        : null

    return (
        <div>
            <button
                ref={triggerRef}
                type="button"
                onClick={openPopover}
                className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm transition hover:border-blue-400 dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1] dark:hover:border-blue-600"
            >
                <span
                    className={
                        triggerLabel
                            ? 'text-gray-800 dark:text-[#efeff1]'
                            : 'text-gray-400 dark:text-[#6b6b7a]'
                    }
                >
                    {triggerLabel ?? '날짜 · 시간 선택'}
                </span>
                <ChevronRight
                    size={14}
                    className={cn(
                        'shrink-0 text-gray-400 transition-transform dark:text-[#6b6b7a]',
                        open ? 'rotate-90' : '',
                    )}
                />
            </button>
            {popover}
        </div>
    )
}
