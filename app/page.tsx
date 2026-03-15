"use client"

import { useState } from "react"
import { MobileFrame } from "@/components/mobile-frame"
import {
  DashboardScreen,
  TradeLogScreen,
  LogTradeScreen,
  LogTradeStep2Screen,
  LogTradeStep3Screen,
  LogTradeStep4Screen,
  CloseTradeScreen,
  AnalyticsScreen,
  AnalyticsBehaviorScreen,
  AnalyticsSetupsScreen,
  AnalyticsRiskScreen,
  JournalScreen,
  TradeDetailScreen,
  RulesScreen,
  SettingsScreen,
} from "@/components/screens"

const SCREEN_GROUPS = [
  {
    group: "Dashboard",
    screens: [
      { id: "dashboard", label: "Dashboard", sub: "P&L overview, equity curve, stats, distribution", component: DashboardScreen },
    ],
  },
  {
    group: "Trade Log",
    screens: [
      { id: "trade-log", label: "Trade Log", sub: "Filterable history — all trades", component: TradeLogScreen },
      { id: "trade-detail", label: "Trade Detail", sub: "Full breakdown — thesis, psychology, lesson", component: TradeDetailScreen },
    ],
  },
  {
    group: "Log / Close Trade",
    screens: [
      { id: "log-step1", label: "Log Trade — Step 1", sub: "Instrument, symbol, direction", component: LogTradeScreen },
      { id: "log-step2", label: "Log Trade — Step 2", sub: "Execution — price, qty, fees, SL, target", component: LogTradeStep2Screen },
      { id: "log-step3", label: "Log Trade — Step 3", sub: "Setup, confluence, thesis, conviction", component: LogTradeStep3Screen },
      { id: "log-step4", label: "Log Trade — Step 4", sub: "Psychology, screenshot, rules check", component: LogTradeStep4Screen },
      { id: "close-trade", label: "Close Trade", sub: "Exit, P&L, emotions, mistakes, rating", component: CloseTradeScreen },
    ],
  },
  {
    group: "Analytics",
    screens: [
      { id: "analytics", label: "Analytics — Performance", sub: "Profit factor, drawdown, Sharpe, setup win rates", component: AnalyticsScreen },
      { id: "analytics-behavior", label: "Analytics — Behavior", sub: "Conviction, mistakes, time-of-day, sleep", component: AnalyticsBehaviorScreen },
      { id: "analytics-setups", label: "Analytics — Setups", sub: "Report card table, confluence, market breakdown", component: AnalyticsSetupsScreen },
      { id: "analytics-risk", label: "Analytics — Risk", sub: "SL discipline, R:R gap, sizing, overtrading", component: AnalyticsRiskScreen },
    ],
  },
  {
    group: "Journal",
    screens: [
      { id: "journal", label: "Daily Journal", sub: "Calendar heatmap + daily reflection", component: JournalScreen },
    ],
  },
  {
    group: "Rules & Settings",
    screens: [
      { id: "rules", label: "Rules", sub: "CRUD rules, violation streak, category filter", component: RulesScreen },
      { id: "settings", label: "Settings", sub: "Capital, defaults, timezone, import/export", component: SettingsScreen },
    ],
  },
]

const ALL_SCREENS = SCREEN_GROUPS.flatMap(g => g.screens)

export default function Page() {
  const [active, setActive] = useState<string | null>(null)

  if (active) {
    const screen = ALL_SCREENS.find(s => s.id === active)!
    const Comp = screen.component
    return (
      <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4 font-sans">
        <div className="w-full max-w-sm mb-6 flex items-center justify-between">
          <button onClick={() => setActive(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
            All screens
          </button>
          <span className="text-sm font-semibold text-foreground">{screen.label}</span>
        </div>
        <MobileFrame label={screen.label}>
          <Comp />
        </MobileFrame>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <div className="border-b border-border px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary-foreground">
              <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
            </svg>
          </div>
          <span className="text-lg font-bold text-foreground">TradeLog</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground text-balance mb-2">Mobile UI Wireframes</h1>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto text-pretty">
          15 screens covering every page in the PRD — dashboard, log/close trade (4 steps), analytics (4 tabs), journal, rules, and settings.
        </p>
      </div>

      {/* Grouped screen grid */}
      <div className="px-6 py-10 max-w-7xl mx-auto space-y-12">
        {SCREEN_GROUPS.map(group => (
          <div key={group.group}>
            <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-6 flex items-center gap-2">
              <span className="w-4 h-px bg-primary inline-block" />
              {group.group}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {group.screens.map(screen => {
                const Comp = screen.component
                return (
                  <button
                    key={screen.id}
                    onClick={() => setActive(screen.id)}
                    className="group flex flex-col items-center gap-3 cursor-pointer text-left"
                  >
                    <div
                      className="relative w-full max-w-[220px] mx-auto rounded-[28px] overflow-hidden border border-border/40 transition-all duration-300 group-hover:border-primary/50"
                      style={{
                        boxShadow: "0 0 0 1px oklch(0.24 0 0), 0 12px 40px oklch(0 0 0 / 50%)",
                        aspectRatio: "220/440",
                      }}
                    >
                      <div className="absolute inset-0 z-10 pointer-events-none rounded-[28px] ring-1 ring-white/5" />
                      {/* Status bar */}
                      <div className="absolute top-0 left-0 right-0 z-10 h-6 bg-background flex items-center justify-between px-4 pt-0.5">
                        <span className="text-[8px] font-semibold text-foreground">9:41</span>
                        <div className="w-6 h-2.5 rounded bg-foreground/10 flex items-center px-0.5">
                          <div className="w-4 h-1.5 rounded-sm bg-profit" />
                        </div>
                      </div>
                      {/* Scaled content */}
                      <div className="absolute inset-0 overflow-hidden" style={{ top: "24px" }}>
                        <div style={{ transform: "scale(0.587)", transformOrigin: "top left", width: "375px", height: "calc(100% / 0.587 - 41px)" }}>
                          <Comp />
                        </div>
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/8 transition-colors duration-300 z-20 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                          Preview
                        </div>
                      </div>
                    </div>
                    <div className="text-center max-w-[220px] w-full">
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{screen.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{screen.sub}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="border-t border-border px-6 py-6 flex flex-wrap gap-6 justify-center">
        {[
          { color: "bg-profit", label: "Profit / Win" },
          { color: "bg-loss", label: "Loss / Risk" },
          { color: "bg-primary/60", label: "Primary Action" },
          { color: "bg-chart-3/60", label: "Neutral Data" },
        ].map(c => (
          <div key={c.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${c.color}`} />
            <span className="text-xs text-muted-foreground">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

