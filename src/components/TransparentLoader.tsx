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
          ? "fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-md transition-all duration-200"
          : "w-full h-full min-h-[220px] flex items-center justify-center bg-transparent"
      }
    >
      <div className="relative flex flex-col items-center justify-center gap-3">
        {/* Sleek Centered Circular Spinner */}
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-[3px] border-black/10 border-t-black animate-spin" />
        {label && (
          <span className="text-xs font-bold text-neutral-600 tracking-wide uppercase">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
