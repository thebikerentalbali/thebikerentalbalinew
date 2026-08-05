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
          ? "fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-md transition-opacity duration-150"
          : "w-full h-full min-h-[180px] flex items-center justify-center bg-transparent"
      }
    >
      <div className="relative flex flex-col items-center justify-center gap-2.5">
        {/* Sleek Centered Circular Spinner with Neon Green Accent */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-[3px] border-black/10 border-t-[#10F580] drop-shadow-[0_0_8px_rgba(16,245,128,0.5)] animate-spin" />
        {label && (
          <span className="text-[11px] font-bold text-neutral-800 tracking-wider uppercase">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
