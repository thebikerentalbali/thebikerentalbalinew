import React from "react"

interface TransparentLoaderProps {
  label?: string
  fullScreen?: boolean
}

export default function TransparentLoader({ label, fullScreen = true }: TransparentLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label || "Loading content"}
      className={
        fullScreen
          ? "fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-xl transition-opacity duration-150"
          : "w-full h-full min-h-[180px] flex items-center justify-center bg-transparent"
      }
    >
      <div className="relative flex flex-col items-center justify-center gap-3 cirrel-glass px-6 py-5 rounded-[24px]">
        {/* Sleek Centered Circular Spinner */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-[3px] border-[var(--line-2)] border-t-[var(--accent-blue)] animate-spin" />
        {label && (
          <span className="text-[11px] font-bold text-[var(--ink)] tracking-wider uppercase">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
