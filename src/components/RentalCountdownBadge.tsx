"use client"

import React, { useEffect, useRef, useState } from "react"
import { Timer } from "lucide-react"
import { formatTimeRemaining } from "@/utils/rentalTime"

interface RentalCountdownBadgeProps {
  endDate?: string | Date | null
  onExpire?: () => void
}

export default function RentalCountdownBadge({
  endDate,
  onExpire,
}: RentalCountdownBadgeProps) {
  const [nowMs, setNowMs] = useState<number>(() => Date.now())
  const firedExpireRef = useRef(false)

  useEffect(() => {
    firedExpireRef.current = false
    setNowMs(Date.now())

    const interval = setInterval(() => {
      setNowMs(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [endDate])

  const status = formatTimeRemaining(endDate, nowMs)

  useEffect(() => {
    if (status.isFinished && !firedExpireRef.current) {
      firedExpireRef.current = true
      onExpire?.()
    }
  }, [status.isFinished, onExpire])

  const pillClass =
    status.tone === "warn"
      ? "cirrel-pill--warn"
      : status.tone === "info"
      ? "cirrel-pill--info"
      : "cirrel-pill--good"

  return (
    <span className={`cirrel-pill ${pillClass} text-[11px] font-bold tabular-nums`}>
      <Timer className="w-3 h-3 shrink-0" />
      <span>{status.label}</span>
    </span>
  )
}
