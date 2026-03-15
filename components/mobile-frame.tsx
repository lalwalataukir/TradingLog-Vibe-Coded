"use client"

interface MobileFrameProps {
  children: React.ReactNode
  label: string
}

export function MobileFrame({ children, label }: MobileFrameProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">{label}</span>
      <div className="relative w-[375px] bg-background rounded-[40px] overflow-hidden shadow-2xl border border-border/40"
        style={{ boxShadow: "0 0 0 1px oklch(0.24 0 0), 0 32px 80px oklch(0 0 0 / 60%)" }}>
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-1 bg-background">
          <span className="text-xs font-semibold text-foreground">9:41</span>
          <div className="w-28 h-6 bg-background rounded-full border border-border/30 absolute left-1/2 -translate-x-1/2 top-2" />
          <div className="flex items-center gap-1.5">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" className="text-foreground opacity-80">
              <rect x="0" y="4" width="3" height="8" rx="0.5" fill="currentColor" opacity="0.4"/>
              <rect x="4" y="2.5" width="3" height="9.5" rx="0.5" fill="currentColor" opacity="0.6"/>
              <rect x="8" y="0.5" width="3" height="11.5" rx="0.5" fill="currentColor" opacity="0.8"/>
              <rect x="12" y="0" width="3" height="12" rx="0.5" fill="currentColor"/>
            </svg>
            <svg width="16" height="12" viewBox="0 0 24 12" fill="none" className="text-foreground opacity-80">
              <rect x="0" y="1" width="21" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="22" y="4" width="2" height="4" rx="1" fill="currentColor" opacity="0.5"/>
              <rect x="1.5" y="2.5" width="14" height="7" rx="1" fill="currentColor"/>
            </svg>
          </div>
        </div>
        {/* Content */}
        <div className="overflow-y-auto" style={{ height: "780px" }}>
          {children}
        </div>
      </div>
    </div>
  )
}
