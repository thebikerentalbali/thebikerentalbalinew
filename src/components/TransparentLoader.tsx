import React from "react"

interface TransparentLoaderProps {
  label?: string
  fullScreen?: boolean
}

export default function TransparentLoader({ label, fullScreen = true }: TransparentLoaderProps) {
  if (!fullScreen) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={label || "Loading content"}
        className="w-full h-full min-h-[160px] flex items-center justify-center bg-transparent"
      >
        <div className="w-7 h-7 rounded-full border-[3px] border-[var(--line-2)] border-t-[var(--accent-blue)] animate-spin" />
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label || "Loading page"}
      className="min-h-screen w-full bg-[var(--bg)] px-4 sm:px-6 py-6 md:py-10"
    >
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="h-9 w-48 rounded-full bg-[var(--card-2)] animate-pulse" />
        <div className="cirrel-glass rounded-[28px] p-5 sm:p-7 space-y-4">
          <div className="h-6 w-2/3 rounded-full bg-[var(--card-2)] animate-pulse" />
          <div className="h-52 sm:h-64 w-full rounded-[22px] bg-[var(--card-2)] animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="h-16 rounded-[18px] bg-[var(--card-2)] animate-pulse" />
            <div className="h-16 rounded-[18px] bg-[var(--card-2)] animate-pulse" />
            <div className="h-16 rounded-[18px] bg-[var(--card-2)] animate-pulse hidden sm:block" />
          </div>
        </div>
      </div>
    </div>
  )
}
