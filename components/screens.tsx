"use client"

import {
  BarChart2, BookOpen, ChevronRight, Home, PlusCircle, TrendingUp, TrendingDown,
  Activity, Shield, Star, ArrowUpRight, ArrowDownRight, Minus, Clock, Target,
  Zap, CheckCircle, XCircle, AlertCircle, Filter, Search, ChevronDown, ChevronLeft,
  Calendar, Bell, Settings, MoreHorizontal, RefreshCw, Award, Flame, Brain, Eye,
  SlidersHorizontal
} from "lucide-react"

// ──────────────────────────────────────────────
// BOTTOM NAV
// ──────────────────────────────────────────────
export function BottomNav({ active }: { active: "home" | "trades" | "log" | "analytics" | "journal" }) {
  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "trades", icon: BarChart2, label: "Trades" },
    { id: "log", icon: PlusCircle, label: "Log", primary: true },
    { id: "analytics", icon: Activity, label: "Analytics" },
    { id: "journal", icon: BookOpen, label: "Journal" },
  ] as const

  return (
    <div className="flex items-center justify-around px-2 pt-2 pb-6 bg-card border-t border-border">
      {tabs.map((tab) => (
        <button key={tab.id} className={`flex flex-col items-center gap-1 px-3 ${tab.primary ? "-mt-5" : ""}`}>
          {tab.primary ? (
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg"
              style={{ boxShadow: "0 0 20px oklch(0.72 0.19 142 / 40%)" }}>
              <tab.icon size={22} className="text-primary-foreground" />
            </div>
          ) : (
            <tab.icon size={20} className={active === tab.id ? "text-primary" : "text-muted-foreground"} />
          )}
          <span className={`text-[10px] font-medium ${tab.primary ? "text-primary" : active === tab.id ? "text-primary" : "text-muted-foreground"}`}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────────
// SCREEN 1: DASHBOARD
// ──────────────────────────────────────────────
export function DashboardScreen() {
  const equityPoints = [0, 8, 5, 14, 11, 18, 13, 22, 20, 28, 25, 35, 30, 38, 42]
  const maxY = 42
  const W = 335, H = 100
  const pts = equityPoints.map((v, i) => `${(i / (equityPoints.length - 1)) * W},${H - (v / maxY) * H}`).join(" ")

  const dailyPnl = [820, -430, 1200, -200, 950, 330, -580, 1400, 700, -120, 880, 1100, -350, 600, 450]

  return (
    <div className="flex flex-col bg-background min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-2 pb-4">
        <div>
          <p className="text-xs text-muted-foreground font-medium">Good morning,</p>
          <h1 className="text-lg font-bold text-foreground">TradeLog</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
            <Bell size={16} className="text-muted-foreground" />
          </button>
          <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">RK</span>
          </div>
        </div>
      </div>

      {/* Total P&L card */}
      <div className="mx-4 p-4 bg-card rounded-2xl border border-border mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground font-medium">Total P&L · March 2025</span>
          <span className="text-[10px] bg-profit-muted text-profit px-2 py-0.5 rounded-full font-semibold">+18.4%</span>
        </div>
        <div className="flex items-end gap-2 mb-3">
          <span className="text-3xl font-bold text-profit">+₹1,24,350</span>
          <span className="text-sm text-profit mb-1 flex items-center gap-0.5"><ArrowUpRight size={14} />₹8,200 today</span>
        </div>
        {/* Equity Curve */}
        <div className="relative" style={{ height: "100px" }}>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full">
            <defs>
              <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.72 0.19 142)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="oklch(0.72 0.19 142)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={`0,${H} ${pts} ${W},${H}`} fill="url(#eqGrad)" />
            <polyline points={pts} fill="none" stroke="oklch(0.72 0.19 142)" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex justify-between mt-1">
          {["Jan", "Feb", "Mar"].map(m => (
            <span key={m} className="text-[10px] text-muted-foreground">{m}</span>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 px-4 mb-4">
        {[
          { label: "Win Rate", value: "64%", icon: Target, color: "text-profit" },
          { label: "Avg R:R", value: "1.8x", icon: TrendingUp, color: "text-chart-4" },
          { label: "Streak", value: "4W", icon: Flame, color: "text-primary" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 flex flex-col gap-1.5">
            <s.icon size={14} className={s.color} />
            <span className={`text-base font-bold ${s.color}`}>{s.value}</span>
            <span className="text-[10px] text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Daily P&L bars */}
      <div className="mx-4 bg-card border border-border rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-foreground">Daily P&L</span>
          <span className="text-xs text-muted-foreground">Last 15 days</span>
        </div>
        <div className="flex items-end gap-1 h-16">
          {dailyPnl.map((v, i) => {
            const isPos = v >= 0
            const h = Math.abs(v) / 1400 * 100
            return (
              <div key={i} className="flex-1 flex flex-col justify-end" style={{ height: "100%" }}>
                <div
                  className={`rounded-sm w-full`}
                  style={{
                    height: `${h}%`,
                    background: isPos ? "oklch(0.72 0.19 142)" : "oklch(0.60 0.22 25)",
                    opacity: i === 14 ? 1 : 0.7
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Extra stats row — profit factor + trade count */}
      <div className="grid grid-cols-2 gap-2 px-4 mb-4">
        {[
          { label: "Profit Factor", value: "2.4×", sub: "Gross wins / losses", color: "text-profit" },
          { label: "Trades (Mar)", value: "42", sub: "6 open · 36 closed", color: "text-foreground" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3">
            <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            <p className="text-[9px] text-muted-foreground/60">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Win rate by setup */}
      <div className="mx-4 bg-card border border-border rounded-2xl p-4 mb-4">
        <p className="text-sm font-semibold text-foreground mb-3">Win Rate by Setup</p>
        <div className="flex flex-col gap-2">
          {[
            { name: "Breakout", wr: 72 },
            { name: "Pullback", wr: 61 },
            { name: "Momentum", wr: 55 },
            { name: "Reversal", wr: 38 },
          ].map(s => (
            <div key={s.name} className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground w-16 shrink-0">{s.name}</span>
              <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${s.wr}%`, background: s.wr >= 50 ? "oklch(0.72 0.19 142)" : "oklch(0.60 0.22 25)", opacity: 0.8 }} />
              </div>
              <span className={`text-[10px] font-semibold w-8 text-right ${s.wr >= 50 ? "text-profit" : "text-loss"}`}>{s.wr}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* P&L distribution histogram */}
      <div className="mx-4 bg-card border border-border rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">P&L Distribution</p>
          <span className="text-[10px] text-muted-foreground">42 trades</span>
        </div>
        <div className="flex items-end gap-1 h-14">
          {[1, 2, 4, 6, 9, 7, 5, 4, 3, 2, 1].map((v, i) => {
            const isProfit = i >= 5
            return (
              <div key={i} className="flex-1 flex flex-col justify-end" style={{ height: "100%" }}>
                <div className="rounded-sm w-full" style={{
                  height: `${(v / 9) * 100}%`,
                  background: isProfit ? "oklch(0.72 0.19 142)" : "oklch(0.60 0.22 25)",
                  opacity: 0.75
                }} />
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[9px] text-loss">-₹8K</span>
          <span className="text-[9px] text-muted-foreground">₹0</span>
          <span className="text-[9px] text-profit">+₹8K</span>
        </div>
      </div>

      {/* Recent trades */}
      <div className="mx-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-foreground">Recent Trades</span>
          <button className="text-xs text-primary font-medium flex items-center gap-0.5">View all <ChevronRight size={12} /></button>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { sym: "RELIANCE", dir: "LONG", pnl: "+₹4,200", pct: "+2.1%", setup: "Breakout", pos: true },
            { sym: "NIFTY CE", dir: "LONG", pnl: "-₹1,800", pct: "-3.4%", setup: "Reversal", pos: false },
            { sym: "TCS", dir: "SHORT", pnl: "+₹2,600", pct: "+1.8%", setup: "Pullback", pos: true },
          ].map((t, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${t.pos ? "bg-profit-muted text-profit" : "bg-loss-muted text-loss"}`}>
                  {t.sym.slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.sym}</p>
                  <p className="text-[10px] text-muted-foreground">{t.dir} · {t.setup}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${t.pos ? "text-profit" : "text-loss"}`}>{t.pnl}</p>
                <p className={`text-[10px] ${t.pos ? "text-profit" : "text-loss"}`}>{t.pct}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  )
}

// ──────────────────────────────────────────────
// SCREEN 2: TRADE LOG
// ──────────────────────────────────────────────
export function TradeLogScreen() {
  const trades = [
    { sym: "RELIANCE", mkt: "NSE", dir: "L", entry: "2840", exit: "2898", pnl: "+₹5,800", pct: "+2.0%", setup: "Breakout", date: "Mar 12", pos: true, status: "closed" },
    { sym: "NIFTY PE", mkt: "F&O", dir: "L", entry: "185", exit: "—", pnl: "Open", pct: "+0.8%", setup: "Momentum", date: "Mar 14", pos: true, status: "open" },
    { sym: "HDFC", mkt: "NSE", dir: "S", entry: "1680", exit: "1641", pnl: "+₹3,900", pct: "+2.3%", setup: "Pullback", date: "Mar 11", pos: true, status: "closed" },
    { sym: "AAPL", mkt: "US", dir: "L", entry: "172.5", exit: "168.3", pnl: "-₹1,260", pct: "-2.4%", setup: "Gap Fill", date: "Mar 10", pos: false, status: "closed" },
    { sym: "TATAMOTORS", mkt: "NSE", dir: "L", entry: "914", exit: "947", pnl: "+₹6,600", pct: "+3.6%", setup: "Trend Follow", date: "Mar 9", pos: true, status: "closed" },
    { sym: "BANKNIFTY", mkt: "F&O", dir: "S", entry: "48200", exit: "47650", pnl: "-₹2,200", pct: "-1.1%", setup: "Reversal", date: "Mar 8", pos: false, status: "closed" },
  ]

  return (
    <div className="flex flex-col bg-background min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-2 pb-3">
        <h1 className="text-lg font-bold text-foreground">Trade Log</h1>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center">
            <Search size={15} className="text-muted-foreground" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center">
            <SlidersHorizontal size={15} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 px-5 pb-3 overflow-x-auto no-scrollbar">
        {["All", "Open", "Closed", "Winners", "Losers", "Indian", "US"].map((f, i) => (
          <button key={f} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border ${i === 0 ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Summary row */}
      <div className="flex gap-3 px-4 mb-3">
        {[
          { label: "42 Trades", sub: "This month" },
          { label: "₹1,24,350", sub: "Total P&L", green: true },
          { label: "64%", sub: "Win rate" },
        ].map(s => (
          <div key={s.label} className="flex-1 bg-card border border-border rounded-xl px-3 py-2.5">
            <p className={`text-sm font-bold ${s.green ? "text-profit" : "text-foreground"}`}>{s.label}</p>
            <p className="text-[10px] text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Trade list */}
      <div className="flex flex-col gap-2 px-4">
        {trades.map((t, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${t.pos ? "bg-profit-muted text-profit" : "bg-loss-muted text-loss"}`}>
                  {t.dir}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-foreground">{t.sym}</span>
                    <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-md">{t.mkt}</span>
                    {t.status === "open" && (
                      <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-md font-medium">OPEN</span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{t.date} · {t.setup}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${t.pos ? "text-profit" : t.status === "open" ? "text-chart-4" : "text-loss"}`}>{t.pnl}</p>
                <p className={`text-[10px] ${t.pos ? "text-profit" : t.status === "open" ? "text-chart-4" : "text-loss"}`}>{t.pct}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <div className="flex gap-3">
                <div>
                  <p className="text-[9px] text-muted-foreground">Entry</p>
                  <p className="text-xs font-medium text-foreground">₹{t.entry}</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground">Exit</p>
                  <p className="text-xs font-medium text-foreground">₹{t.exit}</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>

      <div className="h-4" />
      <BottomNav active="trades" />
    </div>
  )
}

// ──────────────────────────────────────────────
// SCREEN 3: LOG TRADE — Step 1 (Instrument)
// ──────────────────────────────────────────────
export function LogTradeScreen() {
  return (
    <div className="flex flex-col bg-background min-h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-2 pb-4">
        <button className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
          <ChevronLeft size={16} className="text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Log Trade</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center px-5 mb-5 gap-2">
        {["Instrument", "Execution", "Setup", "Psychology"].map((step, i) => (
          <div key={step} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-full h-1 rounded-full ${i === 0 ? "bg-primary" : i < 2 ? "bg-primary/40" : "bg-border"}`} />
            <span className={`text-[9px] font-medium ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>{i + 1}</span>
          </div>
        ))}
      </div>

      {/* Step 1 content */}
      <div className="px-5 flex flex-col gap-4">
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2">MARKET</p>
          <div className="grid grid-cols-4 gap-1.5">
            {["NSE Equity", "F&O", "US Equity", "Commodity"].map((m, i) => (
              <button key={m} className={`py-2 rounded-xl text-[10px] font-semibold border ${i === 0 ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"}`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2">SYMBOL</p>
          <div className="flex items-center gap-2 bg-card border border-primary rounded-xl px-3 py-3">
            <Search size={14} className="text-primary" />
            <span className="text-sm text-foreground font-medium">RELIANCE</span>
            <ChevronDown size={14} className="text-muted-foreground ml-auto" />
          </div>
          <div className="mt-2 bg-card border border-border rounded-xl overflow-hidden">
            {["RELIANCE", "RELIANCE24MARCE2900", "RELCAP"].map((s, i) => (
              <div key={s} className={`px-3 py-2.5 flex justify-between items-center ${i < 2 ? "border-b border-border/50" : ""}`}>
                <span className="text-sm text-foreground">{s}</span>
                <span className="text-[10px] text-muted-foreground">NSE</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2">INSTRUMENT TYPE</p>
          <div className="grid grid-cols-3 gap-2">
            {["Stock", "Futures", "Call Option", "Put Option", "Index"].map((t, i) => (
              <button key={t} className={`py-2 rounded-xl text-xs font-medium border ${i === 0 ? "bg-primary/10 text-primary border-primary/40" : "bg-card text-muted-foreground border-border"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2">DIRECTION</p>
          <div className="grid grid-cols-2 gap-2">
            <button className="py-3 rounded-xl bg-profit-muted border border-profit/30 flex items-center justify-center gap-2">
              <TrendingUp size={16} className="text-profit" />
              <span className="text-sm font-bold text-profit">LONG</span>
            </button>
            <button className="py-3 rounded-xl bg-card border border-border flex items-center justify-center gap-2">
              <TrendingDown size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">SHORT</span>
            </button>
          </div>
        </div>

        {/* Execution inputs (Step 2 preview) */}
        <div className="bg-card/50 border border-border/50 rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Entry</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Entry Price", val: "₹2,840.00" },
              { label: "Quantity", val: "200 shares" },
              { label: "Stop Loss", val: "₹2,790.00" },
              { label: "Target", val: "₹2,940.00" },
            ].map(f => (
              <div key={f.label} className="bg-card border border-border rounded-xl px-3 py-2.5">
                <p className="text-[9px] text-muted-foreground mb-1">{f.label}</p>
                <p className="text-sm font-semibold text-foreground">{f.val}</p>
              </div>
            ))}
          </div>
          {/* Live R:R */}
          <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-3 py-2">
            <span className="text-xs text-muted-foreground">Planned R:R</span>
            <span className="text-sm font-bold text-primary">2.0 : 1</span>
          </div>
        </div>

        <button className="w-full py-3.5 bg-primary rounded-2xl font-semibold text-primary-foreground text-sm"
          style={{ boxShadow: "0 0 20px oklch(0.72 0.19 142 / 30%)" }}>
          Continue to Execution
        </button>
      </div>

      <div className="h-6" />
    </div>
  )
}

// ──────────────────────────────────────────────
// SCREEN 4: ANALYTICS
// ──────────────────────────────────────────────
export function AnalyticsScreen() {
  const setupData = [
    { name: "Breakout", wr: 72, pnl: "₹38.4K", color: "oklch(0.72 0.19 142)" },
    { name: "Pullback", wr: 61, pnl: "₹22.1K", color: "oklch(0.72 0.19 142)" },
    { name: "Momentum", wr: 58, pnl: "₹18.7K", color: "oklch(0.65 0.15 200)" },
    { name: "Reversal", wr: 44, pnl: "-₹4.2K", color: "oklch(0.60 0.22 25)" },
    { name: "Gap Fill", wr: 40, pnl: "-₹8.1K", color: "oklch(0.60 0.22 25)" },
  ]

  const emotions = [
    { label: "Calm", pnl: "+₹4,200", pos: true },
    { label: "Confident", pnl: "+₹3,100", pos: true },
    { label: "Neutral", pnl: "+₹1,400", pos: true },
    { label: "Anxious", pnl: "-₹800", pos: false },
    { label: "FOMO", pnl: "-₹2,600", pos: false },
    { label: "Revenge", pnl: "-₹4,800", pos: false },
  ]

  return (
    <div className="flex flex-col bg-background min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-2 pb-3">
        <h1 className="text-lg font-bold text-foreground">Analytics</h1>
        <button className="flex items-center gap-1 text-xs text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-lg">
          Mar 2025 <ChevronDown size={12} />
        </button>
      </div>

      {/* Tab pills */}
      <div className="flex gap-2 px-5 mb-4 overflow-x-auto no-scrollbar">
        {["Performance", "Behavior", "Setups", "Risk"].map((t, i) => (
          <button key={t} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${i === 0 ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Profit Factor", value: "2.4", sub: "Gross wins / losses", icon: Award, color: "text-profit" },
            { label: "Expectancy", value: "₹2,840", sub: "Per trade avg", icon: Zap, color: "text-chart-4" },
            { label: "Max Drawdown", value: "-₹18.2K", sub: "Peak to trough", icon: TrendingDown, color: "text-loss" },
            { label: "Sharpe Ratio", value: "1.82", sub: "Risk-adjusted return", icon: Shield, color: "text-chart-3" },
          ].map(m => (
            <div key={m.label} className="bg-card border border-border rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted-foreground font-medium">{m.label}</span>
                <m.icon size={13} className={m.color} />
              </div>
              <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Setup performance */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Setup Performance</p>
          <div className="flex flex-col gap-2.5">
            {setupData.map(s => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-20 shrink-0">{s.name}</span>
                <div className="flex-1 h-5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full flex items-center pl-2" style={{ width: `${s.wr}%`, background: s.color, opacity: 0.85 }}>
                    <span className="text-[9px] font-bold text-background">{s.wr}%</span>
                  </div>
                </div>
                <span className={`text-xs font-semibold w-14 text-right ${s.pnl.startsWith("-") ? "text-loss" : "text-profit"}`}>{s.pnl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emotion vs P&L */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">Emotion vs P&L</p>
            <Brain size={14} className="text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-2">
            {emotions.map(e => {
              const max = 4800
              const val = parseInt(e.pnl.replace(/[₹,+\-K]/g, "")) * (e.pos ? 1 : -1)
              const w = Math.abs(val) / max * 100
              return (
                <div key={e.label} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-16 shrink-0">{e.label}</span>
                  <div className="flex-1 flex justify-center h-4 relative">
                    {e.pos ? (
                      <div className="absolute left-1/2 top-0 h-full rounded-r-full" style={{ width: `${w / 2}%`, background: "oklch(0.72 0.19 142)", opacity: 0.8 }} />
                    ) : (
                      <div className="absolute right-1/2 top-0 h-full rounded-l-full" style={{ width: `${w / 2}%`, background: "oklch(0.60 0.22 25)", opacity: 0.8 }} />
                    )}
                    <div className="absolute left-1/2 top-0 w-px h-full bg-border" />
                  </div>
                  <span className={`text-xs font-semibold w-14 text-right ${e.pos ? "text-profit" : "text-loss"}`}>{e.pnl}</span>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[9px] text-muted-foreground">Loss</span>
            <span className="text-[9px] text-muted-foreground">Profit</span>
          </div>
        </div>

        {/* Plan adherence */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">Plan Adherence Impact</p>
            <CheckCircle size={14} className="text-profit" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full h-24 bg-secondary rounded-xl overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 rounded-xl" style={{ height: "78%", background: "oklch(0.72 0.19 142)", opacity: 0.8 }} />
                <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-background">₹3,840</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={11} className="text-profit" />
                <span className="text-xs text-muted-foreground">Followed Plan</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full h-24 bg-secondary rounded-xl overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 rounded-xl" style={{ height: "28%", background: "oklch(0.60 0.22 25)", opacity: 0.8 }} />
                <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-loss">-₹1,200</span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle size={11} className="text-loss" />
                <span className="text-xs text-muted-foreground">Deviated</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-4" />
      <BottomNav active="analytics" />
    </div>
  )
}

// ──────────────────────────────────────────────
// SCREEN 5: DAILY JOURNAL
// ──────────────────────────────────────────────
export function JournalScreen() {
  const days = ["M", "T", "W", "T", "F", "S", "S"]
  const calData = [
    [null, null, null, null, null, "pos", null],
    ["pos", "neg", "pos", "pos", "neg", "pos", null],
    ["pos", "pos", "pos", "neg", "pos", "pos", null],
    ["neg", "pos", "pos", "pos", "pos", "neg", null],
    ["pos", "pos", null, null, null, null, null],
  ]

  return (
    <div className="flex flex-col bg-background min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-2 pb-3">
        <h1 className="text-lg font-bold text-foreground">Daily Journal</h1>
        <button className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center">
          <Calendar size={15} className="text-muted-foreground" />
        </button>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between px-5 mb-3">
        <button><ChevronLeft size={18} className="text-muted-foreground" /></button>
        <span className="text-sm font-semibold text-foreground">March 2025</span>
        <button><ChevronRight size={18} className="text-muted-foreground" /></button>
      </div>

      {/* Calendar */}
      <div className="mx-4 bg-card border border-border rounded-2xl p-4 mb-4">
        <div className="grid grid-cols-7 mb-2">
          {days.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-semibold text-muted-foreground">{d}</div>
          ))}
        </div>
        {calData.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
            {week.map((day, di) => {
              const num = wi * 7 + di - 4
              return (
                <div key={di} className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-medium
                  ${day === null ? "" : day === "pos" ? "bg-profit-muted text-profit" : "bg-loss-muted text-loss"}
                  ${num === 14 ? "ring-1 ring-primary" : ""}
                `}>
                  {num > 0 && num <= 31 ? num : ""}
                </div>
              )
            })}
          </div>
        ))}
        {/* Legend */}
        <div className="flex items-center gap-3 mt-2 justify-end">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-profit opacity-70" /><span className="text-[9px] text-muted-foreground">Profit</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-loss opacity-70" /><span className="text-[9px] text-muted-foreground">Loss</span></div>
        </div>
      </div>

      {/* Today's entry */}
      <div className="mx-4 bg-card border border-border rounded-2xl p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-foreground">March 14, 2025</p>
            <p className="text-[10px] text-muted-foreground">Today's Journal</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-profit">+₹8,200</p>
            <p className="text-[10px] text-muted-foreground">3 trades</p>
          </div>
        </div>

        {/* Pre-market */}
        <div className="mb-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Pre-Market Plan</p>
          <div className="bg-secondary rounded-xl p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">Watching RELIANCE near 2840 resistance for breakout. BankNifty PUT hedge if Nifty shows weakness below 22400...</p>
          </div>
        </div>

        {/* Vitals */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "Mood", value: "4/5", icon: "😊" },
            { label: "Sleep", value: "7.5h", icon: "😴" },
            { label: "Exercise", value: "Yes", icon: "💪" },
          ].map(v => (
            <div key={v.label} className="bg-secondary rounded-xl p-2.5 text-center">
              <p className="text-base mb-0.5">{v.icon}</p>
              <p className="text-xs font-semibold text-foreground">{v.value}</p>
              <p className="text-[9px] text-muted-foreground">{v.label}</p>
            </div>
          ))}
        </div>

        {/* Market bias */}
        <div className="flex items-center justify-between bg-profit-muted border border-profit/20 rounded-xl px-3 py-2 mb-3">
          <span className="text-xs text-muted-foreground">Market Bias</span>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} className="text-profit" />
            <span className="text-xs font-semibold text-profit">Bullish</span>
          </div>
        </div>

        {/* Post-market notes */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Post-Market Reflection</p>
          <div className="bg-secondary rounded-xl p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">Good day overall. RELIANCE breakout played out perfectly. Avoided FOMO on BankNifty afternoon move which saved me from a likely loss.</p>
          </div>
        </div>
      </div>

      {/* Today's trades */}
      <div className="mx-4 mb-2">
        <p className="text-xs font-semibold text-muted-foreground mb-2">TRADES TODAY</p>
        <div className="flex flex-col gap-2">
          {[
            { sym: "RELIANCE", pnl: "+₹5,800", pos: true },
            { sym: "NIFTY CE", pnl: "+₹3,200", pos: true },
            { sym: "HDFC", pnl: "-₹800", pos: false },
          ].map((t, i) => (
            <div key={i} className="bg-card border border-border rounded-xl px-3 py-2.5 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{t.sym}</span>
              <span className={`text-sm font-bold ${t.pos ? "text-profit" : "text-loss"}`}>{t.pnl}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-4" />
      <BottomNav active="journal" />
    </div>
  )
}

// ──────────────────────────────────────────────
// SCREEN 3b: LOG TRADE — Step 2 (Execution)
// ──────────────────────────────────────────────
export function LogTradeStep2Screen() {
  return (
    <div className="flex flex-col bg-background min-h-full">
      <div className="flex items-center gap-3 px-5 pt-2 pb-4">
        <button className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
          <ChevronLeft size={16} className="text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Log Trade</h1>
        <span className="text-xs text-muted-foreground ml-auto">RELIANCE · LONG</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center px-5 mb-5 gap-2">
        {["Instrument", "Execution", "Setup", "Psychology"].map((step, i) => (
          <div key={step} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-full h-1 rounded-full ${i <= 1 ? "bg-primary" : "bg-border"}`} />
            <span className={`text-[9px] font-medium ${i <= 1 ? "text-primary" : "text-muted-foreground"}`}>{i + 1}</span>
          </div>
        ))}
      </div>

      <div className="px-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Entry Date & Time", val: "Mar 14, 09:22 AM", full: true },
            { label: "Entry Price (₹)", val: "2,840.00" },
            { label: "Quantity (shares)", val: "200" },
            { label: "Entry Fees (₹)", val: "142.80" },
            { label: "Stop Loss (₹)", val: "2,790.00" },
            { label: "Target (₹)", val: "2,940.00" },
          ].map((f, i) => (
            <div key={f.label} className={`bg-card border border-border rounded-xl px-3 py-3 ${i === 0 ? "col-span-2" : ""}`}>
              <p className="text-[9px] text-muted-foreground mb-1">{f.label}</p>
              <p className="text-sm font-semibold text-foreground">{f.val}</p>
            </div>
          ))}
        </div>

        {/* Live R:R */}
        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
          <div>
            <p className="text-[10px] text-muted-foreground">Planned R:R</p>
            <p className="text-xl font-bold text-primary">2.0 : 1</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground text-right">Position Size</p>
            <p className="text-xl font-bold text-foreground">5.68%</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground text-right">Risk ₹</p>
            <p className="text-xl font-bold text-loss">₹10,000</p>
          </div>
        </div>

        <button className="w-full py-3.5 bg-primary rounded-2xl font-semibold text-primary-foreground text-sm"
          style={{ boxShadow: "0 0 20px oklch(0.72 0.19 142 / 30%)" }}>
          Continue to Setup
        </button>
      </div>
      <div className="h-6" />
    </div>
  )
}

// ──────────────────────────────────────────────
// SCREEN 3c: LOG TRADE — Step 3 (Setup & Thesis)
// ──────────────────────────────────────────────
export function LogTradeStep3Screen() {
  const confluenceItems = ["Volume Confirm.", "Support/Resist.", "Moving Average", "RSI Divergence", "MACD Cross", "VWAP", "OI Buildup", "Fib Levels", "Trendline", "FII/DII Flow", "News Catalyst"]
  const selectedConfluence = [0, 2, 6]

  return (
    <div className="flex flex-col bg-background min-h-full">
      <div className="flex items-center gap-3 px-5 pt-2 pb-4">
        <button className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
          <ChevronLeft size={16} className="text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Log Trade</h1>
        <span className="text-xs text-muted-foreground ml-auto">RELIANCE · LONG</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center px-5 mb-5 gap-2">
        {["Instrument", "Execution", "Setup", "Psychology"].map((step, i) => (
          <div key={step} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-full h-1 rounded-full ${i <= 2 ? "bg-primary" : "bg-border"}`} />
            <span className={`text-[9px] font-medium ${i <= 2 ? "text-primary" : "text-muted-foreground"}`}>{i + 1}</span>
          </div>
        ))}
      </div>

      <div className="px-5 flex flex-col gap-4">
        {/* Setup type */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2">SETUP TYPE</p>
          <div className="flex flex-wrap gap-2">
            {["Breakout", "Breakdown", "Pullback", "Reversal", "Momentum", "Range Trade", "Gap Fill", "Trend Follow"].map((s, i) => (
              <button key={s} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${i === 0 ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Timeframe */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2">TIMEFRAME</p>
          <div className="grid grid-cols-4 gap-1.5">
            {["Scalp", "Intraday", "Swing", "Positional"].map((t, i) => (
              <button key={t} className={`py-2 rounded-xl text-[10px] font-semibold border ${i === 1 ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Confluence multi-select */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2">CONFLUENCE FACTORS</p>
          <div className="flex flex-wrap gap-1.5">
            {confluenceItems.map((c, i) => (
              <button key={c} className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${selectedConfluence.includes(i) ? "bg-primary/15 text-primary border-primary/40" : "bg-card text-muted-foreground border-border"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Thesis */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2">THESIS</p>
          <div className="bg-card border border-primary/30 rounded-xl p-3 min-h-[72px]">
            <p className="text-xs text-muted-foreground leading-relaxed">RELIANCE holding 2840 with volume buildup. FII activity positive. Clean breakout above weekly resistance...</p>
          </div>
          <p className="text-[9px] text-muted-foreground mt-1 text-right">Why this trade, right now, at this price?</p>
        </div>

        {/* Conviction slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">CONVICTION LEVEL</p>
            <span className="text-sm font-bold text-primary">4 / 5</span>
          </div>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(n => (
              <div key={n} className={`flex-1 h-2 rounded-full ${n <= 4 ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-muted-foreground">Low</span>
            <span className="text-[9px] text-muted-foreground">High</span>
          </div>
        </div>

        <button className="w-full py-3.5 bg-primary rounded-2xl font-semibold text-primary-foreground text-sm"
          style={{ boxShadow: "0 0 20px oklch(0.72 0.19 142 / 30%)" }}>
          Continue to Psychology
        </button>
      </div>
      <div className="h-6" />
    </div>
  )
}

// ──────────────────────────────────────────────
// SCREEN 3d: LOG TRADE — Step 4 (Psychology)
// ──────────────────────────────────────────────
export function LogTradeStep4Screen() {
  const emotions = ["Calm", "Confident", "Neutral", "Anxious", "FOMO", "Revenge", "Greedy", "Fearful"]
  const emotionColors: Record<string, string> = {
    Calm: "text-profit border-profit/40 bg-profit-muted",
    Confident: "text-chart-3 border-chart-3/30 bg-chart-3/10",
    Neutral: "text-muted-foreground border-border bg-secondary",
    Anxious: "text-chart-4 border-chart-4/30 bg-chart-4/10",
    FOMO: "text-loss border-loss/40 bg-loss-muted",
    Revenge: "text-loss border-loss/40 bg-loss-muted",
    Greedy: "text-chart-4 border-chart-4/30 bg-chart-4/10",
    Fearful: "text-loss border-loss/40 bg-loss-muted",
  }

  return (
    <div className="flex flex-col bg-background min-h-full">
      <div className="flex items-center gap-3 px-5 pt-2 pb-4">
        <button className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
          <ChevronLeft size={16} className="text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Log Trade</h1>
        <span className="text-xs text-muted-foreground ml-auto">RELIANCE · LONG</span>
      </div>

      {/* Step indicator — all active */}
      <div className="flex items-center px-5 mb-5 gap-2">
        {["Instrument", "Execution", "Setup", "Psychology"].map((step, i) => (
          <div key={step} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full h-1 rounded-full bg-primary" />
            <span className="text-[9px] font-medium text-primary">{i + 1}</span>
          </div>
        ))}
      </div>

      <div className="px-5 flex flex-col gap-5">
        {/* Pre-trade emotion */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2">PRE-TRADE EMOTION</p>
          <div className="flex flex-wrap gap-2">
            {emotions.map((e, i) => (
              <button key={e} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${i === 0 ? emotionColors[e] : "bg-card text-muted-foreground border-border"}`}>
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Screenshot upload */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2">CHART SCREENSHOT</p>
          <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 bg-card">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Eye size={18} className="text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground text-center">Drag & drop chart screenshot or tap to upload</p>
            <button className="text-xs text-primary font-medium border border-primary/30 px-3 py-1 rounded-lg">Browse files</button>
          </div>
        </div>

        {/* Rules checklist pre-trade */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2">PRE-TRADE RULES CHECK</p>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {[
              { rule: "Risk ≤ 2% of capital", ok: true },
              { rule: "Stop loss defined before entry", ok: true },
              { rule: "Not revenge trading", ok: true },
              { rule: "Trading plan written today", ok: false },
            ].map((r, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2.5 ${i > 0 ? "border-t border-border/50" : ""}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${r.ok ? "bg-profit-muted" : "bg-loss-muted"}`}>
                  {r.ok
                    ? <CheckCircle size={12} className="text-profit" />
                    : <XCircle size={12} className="text-loss" />
                  }
                </div>
                <span className="text-xs text-foreground">{r.rule}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full py-3.5 bg-primary rounded-2xl font-semibold text-primary-foreground text-sm"
          style={{ boxShadow: "0 0 20px oklch(0.72 0.19 142 / 30%)" }}>
          Save as Open Trade
        </button>
      </div>
      <div className="h-6" />
    </div>
  )
}

// ──────────────────────────────────────────────
// SCREEN: CLOSE TRADE
// ──────────────────────────────────────────────
export function CloseTradeScreen() {
  const mistakeTags = ["Entered too early", "Exited too early", "Moved SL", "Held too long", "Oversized", "Chased entry", "Revenge trade", "No thesis"]

  return (
    <div className="flex flex-col bg-background min-h-full">
      <div className="flex items-center justify-between px-5 pt-2 pb-4">
        <button className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
          <ChevronLeft size={16} className="text-foreground" />
        </button>
        <h1 className="text-base font-bold text-foreground">Close Trade</h1>
        <div className="w-8" />
      </div>

      {/* Trade summary bar */}
      <div className="mx-4 bg-card border border-border rounded-2xl px-4 py-3 mb-4 flex items-center justify-between">
        <div>
          <span className="text-base font-bold text-foreground">RELIANCE</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] bg-profit-muted text-profit px-2 py-0.5 rounded-full font-semibold">LONG</span>
            <span className="text-[10px] text-muted-foreground">Entry ₹2,840 · 200 sh</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-profit">+₹5,800</p>
          <p className="text-xs text-profit">+2.04% · live P&L</p>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Exit fields */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Exit Date & Time", val: "Mar 14, 02:48 PM" },
            { label: "Exit Price (₹)", val: "2,898.00" },
            { label: "Exit Fees (₹)", val: "145.40" },
            { label: "Net P&L (auto)", val: "+₹5,512.80" },
          ].map((f, i) => (
            <div key={f.label} className={`bg-card border rounded-xl px-3 py-3 ${i === 3 ? "border-profit/30 bg-profit/5" : "border-border"}`}>
              <p className="text-[9px] text-muted-foreground mb-1">{f.label}</p>
              <p className={`text-sm font-semibold ${i === 3 ? "text-profit" : "text-foreground"}`}>{f.val}</p>
            </div>
          ))}
        </div>

        {/* Emotion during + post */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Emotion During Trade", selected: "Confident" },
            { label: "Emotion Post Trade", selected: "Satisfied" },
          ].map(e => (
            <div key={e.label} className="bg-card border border-border rounded-xl px-3 py-3">
              <p className="text-[9px] text-muted-foreground mb-1.5">{e.label}</p>
              <div className="flex flex-wrap gap-1">
                {["Calm", "Confident", "Greedy"].map((em, i) => (
                  <span key={em} className={`px-2 py-0.5 rounded-full text-[10px] border ${em === e.selected ? "bg-primary/15 text-primary border-primary/30" : "bg-secondary text-muted-foreground border-border"}`}>{em}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Followed plan toggle */}
        <div className="bg-card border border-border rounded-xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Followed Plan?</p>
              <p className="text-[10px] text-muted-foreground">Did you follow your predefined rules?</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-profit-muted text-profit border border-profit/30">Yes</button>
              <button className="px-4 py-1.5 rounded-full text-xs font-medium bg-card text-muted-foreground border border-border">No</button>
            </div>
          </div>
        </div>

        {/* Mistake tags */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2">MISTAKE TAGS <span className="text-[9px]">(optional)</span></p>
          <div className="flex flex-wrap gap-1.5">
            {mistakeTags.map((m) => (
              <button key={m} className="px-2.5 py-1 rounded-full text-[10px] font-medium border bg-card text-muted-foreground border-border">{m}</button>
            ))}
          </div>
        </div>

        {/* Lesson learned */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2">LESSON LEARNED</p>
          <div className="bg-card border border-border rounded-xl p-3 min-h-[64px]">
            <p className="text-xs text-muted-foreground leading-relaxed">Patience at the entry paid off. Waited for confirmation candle instead of rushing in...</p>
          </div>
          <p className="text-[9px] text-muted-foreground mt-1 text-right">What would I do differently?</p>
        </div>

        {/* Process rating */}
        <div className="bg-card border border-border rounded-xl px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Process Rating</p>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={18} className={s <= 4 ? "text-chart-4 fill-chart-4" : "text-border"} />
              ))}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Rate this trade's process, regardless of outcome</p>
        </div>

        <button className="w-full py-3.5 bg-primary rounded-2xl font-semibold text-primary-foreground text-sm"
          style={{ boxShadow: "0 0 20px oklch(0.72 0.19 142 / 30%)" }}>
          Close Trade
        </button>
      </div>
      <div className="h-6" />
    </div>
  )
}

// ──────────────────────────────────────────────
// SCREEN: ANALYTICS — Behavioral (full)
// ──────────────────────────────────────────────
export function AnalyticsBehaviorScreen() {
  return (
    <div className="flex flex-col bg-background min-h-full">
      <div className="flex items-center justify-between px-5 pt-2 pb-3">
        <h1 className="text-lg font-bold text-foreground">Analytics</h1>
        <button className="flex items-center gap-1 text-xs text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-lg">
          Mar 2025 <ChevronDown size={12} />
        </button>
      </div>

      <div className="flex gap-2 px-5 mb-4 overflow-x-auto no-scrollbar">
        {["Performance", "Behavior", "Setups", "Risk"].map((t, i) => (
          <button key={t} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${i === 1 ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Conviction scatter (simplified) */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-foreground">Conviction vs Outcome</p>
            <Activity size={13} className="text-muted-foreground" />
          </div>
          <p className="text-[10px] text-muted-foreground mb-3">Do high-conviction trades perform better?</p>
          <div className="flex items-end gap-3 h-20">
            {[
              { conv: "1", avg: -1200, n: 5 },
              { conv: "2", avg: 200, n: 8 },
              { conv: "3", avg: 1400, n: 14 },
              { conv: "4", avg: 3200, n: 10 },
              { conv: "5", avg: 4800, n: 5 },
            ].map(c => {
              const isPos = c.avg >= 0
              const h = Math.abs(c.avg) / 4800 * 80
              return (
                <div key={c.conv} className="flex-1 flex flex-col items-center justify-end gap-1">
                  <span className={`text-[8px] font-semibold ${isPos ? "text-profit" : "text-loss"}`}>
                    {isPos ? "+" : ""}₹{Math.abs(c.avg / 1000).toFixed(1)}K
                  </span>
                  <div className="w-full rounded-sm" style={{
                    height: `${h}%`,
                    background: isPos ? "oklch(0.72 0.19 142)" : "oklch(0.60 0.22 25)",
                    opacity: 0.8
                  }} />
                  <span className="text-[9px] text-muted-foreground">{c.conv}</span>
                </div>
              )
            })}
          </div>
          <p className="text-[9px] text-muted-foreground text-center mt-1">Conviction Level (1–5)</p>
        </div>

        {/* Mistake frequency */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold text-foreground mb-1">Mistake Cost Ranking</p>
          <p className="text-[10px] text-muted-foreground mb-3">Sorted by total ₹ lost per mistake type</p>
          <div className="flex flex-col gap-2">
            {[
              { tag: "Moved Stop Loss", cost: "₹47,200", n: 12 },
              { tag: "Held Too Long", cost: "₹23,800", n: 8 },
              { tag: "Revenge Trade", cost: "₹18,400", n: 5 },
              { tag: "Entered Too Early", cost: "₹11,600", n: 9 },
              { tag: "Oversized", cost: "₹9,200", n: 3 },
            ].map((m, i) => (
              <div key={m.tag} className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground w-5 text-right shrink-0">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-foreground">{m.tag}</span>
                    <span className="text-xs font-semibold text-loss">{m.cost}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-loss opacity-70" style={{ width: `${(47200 - i * 9000) / 47200 * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time of day */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Time of Day Analysis</p>
          <div className="flex items-end gap-1.5 h-16">
            {[
              { label: "9-10", pnl: 8200 },
              { label: "10-11", pnl: 12400 },
              { label: "11-12", pnl: -3200 },
              { label: "12-1", pnl: -1800 },
              { label: "1-2", pnl: 4600 },
              { label: "2-3", pnl: 7800 },
              { label: "3-4", pnl: 2100 },
            ].map(t => {
              const isPos = t.pnl >= 0
              const h = Math.abs(t.pnl) / 12400 * 100
              return (
                <div key={t.label} className="flex-1 flex flex-col items-center justify-end gap-1">
                  <div className="w-full rounded-sm" style={{
                    height: `${h}%`,
                    background: isPos ? "oklch(0.72 0.19 142)" : "oklch(0.60 0.22 25)",
                    opacity: 0.8
                  }} />
                  <span className="text-[8px] text-muted-foreground">{t.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Day of week */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Day of Week Performance</p>
          <div className="flex gap-2">
            {[
              { day: "Mon", pnl: "+₹18K", pos: true },
              { day: "Tue", pnl: "+₹9K", pos: true },
              { day: "Wed", pnl: "-₹4K", pos: false },
              { day: "Thu", pnl: "+₹22K", pos: true },
              { day: "Fri", pnl: "-₹6K", pos: false },
            ].map(d => (
              <div key={d.day} className={`flex-1 rounded-xl p-2 text-center border ${d.pos ? "bg-profit-muted border-profit/20" : "bg-loss-muted border-loss/20"}`}>
                <p className="text-[9px] text-muted-foreground mb-1">{d.day}</p>
                <p className={`text-[10px] font-bold ${d.pos ? "text-profit" : "text-loss"}`}>{d.pnl}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sleep & mood correlation */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold text-foreground mb-1">Sleep & Mood vs P&L</p>
          <p className="text-[10px] text-muted-foreground mb-3">From daily journal data</p>
          <div className="flex flex-col gap-2">
            {[
              { label: "8h+ sleep", pnl: "+₹6,200", pos: true, mood: "4.2" },
              { label: "6-8h sleep", pnl: "+₹2,100", pos: true, mood: "3.4" },
              { label: "{'<'}6h sleep", pnl: "-₹3,400", pos: false, mood: "2.1" },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between bg-secondary rounded-xl px-3 py-2.5">
                <div>
                  <p className="text-xs font-medium text-foreground">{r.label}</p>
                  <p className="text-[9px] text-muted-foreground">Avg mood {r.mood}/5</p>
                </div>
                <span className={`text-sm font-bold ${r.pos ? "text-profit" : "text-loss"}`}>{r.pnl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-4" />
      <BottomNav active="analytics" />
    </div>
  )
}

// ──────────────────────────────────────────────
// SCREEN: ANALYTICS — Setups tab
// ──────────────────────────────────────────────
export function AnalyticsSetupsScreen() {
  return (
    <div className="flex flex-col bg-background min-h-full">
      <div className="flex items-center justify-between px-5 pt-2 pb-3">
        <h1 className="text-lg font-bold text-foreground">Analytics</h1>
        <button className="flex items-center gap-1 text-xs text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-lg">
          Mar 2025 <ChevronDown size={12} />
        </button>
      </div>

      <div className="flex gap-2 px-5 mb-4 overflow-x-auto no-scrollbar">
        {["Performance", "Behavior", "Setups", "Risk"].map((t, i) => (
          <button key={t} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${i === 2 ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Setup report card table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">Setup Report Card</p>
            <p className="text-[10px] text-muted-foreground">Sorted by total P&L</p>
          </div>
          {/* Header */}
          <div className="grid grid-cols-5 px-4 py-2 border-b border-border/50">
            {["Setup", "Trades", "Win%", "Avg P&L", "R:R"].map(h => (
              <span key={h} className="text-[9px] font-semibold text-muted-foreground">{h}</span>
            ))}
          </div>
          {[
            { name: "Breakout", n: 14, wr: 72, avg: "+₹3.8K", rr: "2.1" },
            { name: "Pullback", n: 10, wr: 61, avg: "+₹2.4K", rr: "1.8" },
            { name: "Momentum", n: 8, wr: 55, avg: "+₹1.9K", rr: "1.5" },
            { name: "Reversal", n: 6, wr: 38, avg: "-₹0.9K", rr: "1.1" },
            { name: "Gap Fill", n: 4, wr: 40, avg: "-₹2.1K", rr: "0.9" },
          ].map((s, i) => (
            <div key={s.name} className={`grid grid-cols-5 px-4 py-2.5 ${i > 0 ? "border-t border-border/30" : ""}`}>
              <span className="text-xs text-foreground font-medium">{s.name}</span>
              <span className="text-xs text-muted-foreground">{s.n}</span>
              <span className={`text-xs font-semibold ${s.wr >= 50 ? "text-profit" : "text-loss"}`}>{s.wr}%</span>
              <span className={`text-xs font-semibold ${s.avg.startsWith("-") ? "text-loss" : "text-profit"}`}>{s.avg}</span>
              <span className={`text-xs font-semibold ${parseFloat(s.rr) >= 1.5 ? "text-profit" : "text-muted-foreground"}`}>{s.rr}x</span>
            </div>
          ))}
        </div>

        {/* Confluence factor effectiveness */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold text-foreground mb-1">Confluence Effectiveness</p>
          <p className="text-[10px] text-muted-foreground mb-3">Avg P&L when factor present in trade</p>
          <div className="flex flex-col gap-2">
            {[
              { factor: "OI Buildup", avg: "+₹4,200", pos: true },
              { factor: "Volume Confirm.", avg: "+₹3,100", pos: true },
              { factor: "FII/DII Flow", avg: "+₹2,800", pos: true },
              { factor: "Trendline", avg: "+₹1,400", pos: true },
              { factor: "RSI Divergence", avg: "-₹600", pos: false },
              { factor: "Gap Fill setup", avg: "-₹1,800", pos: false },
            ].map(f => (
              <div key={f.factor} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{f.factor}</span>
                <span className={`text-xs font-semibold ${f.pos ? "text-profit" : "text-loss"}`}>{f.avg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Best setup by market */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Best Setups by Market</p>
          <div className="flex flex-col gap-3">
            {[
              { mkt: "Indian Equity", best: "Breakout", wr: 72, color: "text-chart-3" },
              { mkt: "F&O", best: "Momentum", wr: 58, color: "text-chart-4" },
              { mkt: "US Equity", best: "Gap Fill", wr: 55, color: "text-primary" },
            ].map(m => (
              <div key={m.mkt} className="flex items-center justify-between bg-secondary rounded-xl px-3 py-2.5">
                <div>
                  <p className="text-xs font-medium text-foreground">{m.mkt}</p>
                  <p className={`text-[10px] font-semibold ${m.color}`}>{m.best}</p>
                </div>
                <span className={`text-sm font-bold ${m.wr >= 50 ? "text-profit" : "text-loss"}`}>{m.wr}% WR</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-4" />
      <BottomNav active="analytics" />
    </div>
  )
}

// ──────────────────────────────────────────────
// SCREEN: ANALYTICS — Risk tab
// ──────────────────────────────────────────────
export function AnalyticsRiskScreen() {
  return (
    <div className="flex flex-col bg-background min-h-full">
      <div className="flex items-center justify-between px-5 pt-2 pb-3">
        <h1 className="text-lg font-bold text-foreground">Analytics</h1>
        <button className="flex items-center gap-1 text-xs text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-lg">
          Mar 2025 <ChevronDown size={12} />
        </button>
      </div>

      <div className="flex gap-2 px-5 mb-4 overflow-x-auto no-scrollbar">
        {["Performance", "Behavior", "Setups", "Risk"].map((t, i) => (
          <button key={t} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${i === 3 ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* SL discipline */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold text-foreground mb-1">Stop Loss Discipline</p>
          <p className="text-[10px] text-muted-foreground mb-3">% of trades where SL was honored vs moved/ignored</p>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <div className="relative w-full h-20 bg-secondary rounded-xl overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 rounded-xl" style={{ height: "74%", background: "oklch(0.72 0.19 142)", opacity: 0.8 }} />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-background">74%</span>
              </div>
              <span className="text-[10px] text-muted-foreground">SL Honored</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <div className="relative w-full h-20 bg-secondary rounded-xl overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 rounded-xl" style={{ height: "26%", background: "oklch(0.60 0.22 25)", opacity: 0.8 }} />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-loss">26%</span>
              </div>
              <span className="text-[10px] text-muted-foreground">SL Moved</span>
            </div>
          </div>
          <div className="flex items-center justify-between bg-secondary rounded-xl px-3 py-2.5">
            <span className="text-xs text-muted-foreground">Avg P&L when SL honored</span>
            <span className="text-xs font-bold text-profit">+₹3,200</span>
          </div>
          <div className="flex items-center justify-between bg-secondary rounded-xl px-3 py-2.5 mt-2">
            <span className="text-xs text-muted-foreground">Avg P&L when SL moved</span>
            <span className="text-xs font-bold text-loss">-₹5,800</span>
          </div>
        </div>

        {/* R:R planned vs actual */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold text-foreground mb-1">Planned vs Actual R:R</p>
          <p className="text-[10px] text-muted-foreground mb-3">Are you cutting winners short?</p>
          <div className="flex flex-col gap-2">
            {[
              { range: "RR ≥ 2.0 planned", planned: "2.4x", actual: "1.6x", cut: true },
              { range: "RR 1.5–2.0", planned: "1.7x", actual: "1.5x", cut: false },
              { range: "RR 1.0–1.5", planned: "1.2x", actual: "1.1x", cut: false },
            ].map(r => (
              <div key={r.range} className="bg-secondary rounded-xl px-3 py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">{r.range}</span>
                  {r.cut && <span className="text-[9px] text-loss bg-loss-muted px-1.5 py-0.5 rounded-full">Cutting short</span>}
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-[9px] text-muted-foreground">Planned</p>
                    <p className="text-xs font-bold text-chart-4">{r.planned}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">Actual</p>
                    <p className="text-xs font-bold text-primary">{r.actual}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Position sizing */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold text-foreground mb-1">Position Sizing Analysis</p>
          <p className="text-[10px] text-muted-foreground mb-3">Position size % vs trade P&L%</p>
          <div className="flex flex-col gap-2">
            {[
              { bucket: "{'>'} 8% capital", avgPnl: "-1.2%", n: 6, bad: true },
              { bucket: "5–8% capital", avgPnl: "+0.8%", n: 12, bad: false },
              { bucket: "2–5% capital", avgPnl: "+2.1%", n: 18, bad: false },
              { bucket: "{'<'} 2% capital", avgPnl: "+1.4%", n: 6, bad: false },
            ].map(p => (
              <div key={p.bucket} className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${p.bad ? "border-loss/30 bg-loss-muted" : "bg-secondary border-transparent"}`}>
                <div>
                  <p className="text-xs font-medium text-foreground">{p.bucket}</p>
                  <p className="text-[9px] text-muted-foreground">{p.n} trades</p>
                </div>
                <span className={`text-sm font-bold ${p.avgPnl.startsWith("-") ? "text-loss" : "text-profit"}`}>{p.avgPnl}</span>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-loss mt-2 flex items-center gap-1"><AlertCircle size={10} className="text-loss" /> Oversizing on bad trades — reduce position when size exceeds 8%</p>
        </div>

        {/* Overtrading detector */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold text-foreground mb-1">Overtrading Detector</p>
          <p className="text-[10px] text-muted-foreground mb-3">Trades per day vs daily P&L</p>
          <div className="flex items-end gap-1.5 h-16">
            {[
              { trades: 1, pnl: 8200 },
              { trades: 2, pnl: 6400 },
              { trades: 3, pnl: 4100 },
              { trades: 4, pnl: 1200 },
              { trades: 5, pnl: -2800 },
              { trades: 6, pnl: -5400 },
              { trades: 7, pnl: -8100 },
            ].map(d => {
              const isPos = d.pnl >= 0
              const h = Math.abs(d.pnl) / 8200 * 100
              return (
                <div key={d.trades} className="flex-1 flex flex-col items-center justify-end gap-1">
                  <div className="w-full rounded-sm" style={{
                    height: `${h}%`,
                    background: isPos ? "oklch(0.72 0.19 142)" : "oklch(0.60 0.22 25)",
                    opacity: 0.8
                  }} />
                  <span className="text-[8px] text-muted-foreground">{d.trades}</span>
                </div>
              )
            })}
          </div>
          <p className="text-[9px] text-muted-foreground text-center mt-1">Number of trades per day</p>
          <p className="text-[9px] text-loss mt-2 flex items-center gap-1"><AlertCircle size={10} className="text-loss" /> More trades per day correlates with lower P&L</p>
        </div>
      </div>
      <div className="h-4" />
      <BottomNav active="analytics" />
    </div>
  )
}

// ──────────────────────────────────────────────
// SCREEN: RULES
// ──────────────────────────────────────────────
export function RulesScreen() {
  const categories = ["Risk", "Entry", "Exit", "Psychology", "Sizing"]
  const rules = [
    { text: "Never risk more than 2% on a single trade", cat: "Risk", active: true, violations: 2 },
    { text: "Always define stop loss before entering a trade", cat: "Risk", active: true, violations: 0 },
    { text: "No trading in the first 15 minutes of the session", cat: "Entry", active: true, violations: 5 },
    { text: "Do not enter unless conviction is 3 or above", cat: "Entry", active: true, violations: 3 },
    { text: "Never move stop loss against the position", cat: "Exit", active: true, violations: 12 },
    { text: "Take partial profits at 1R", cat: "Exit", active: false, violations: 0 },
    { text: "Do not trade after two consecutive losses", cat: "Psychology", active: true, violations: 4 },
    { text: "Max 3 trades per day", cat: "Sizing", active: true, violations: 7 },
  ]

  return (
    <div className="flex flex-col bg-background min-h-full">
      <div className="flex items-center justify-between px-5 pt-2 pb-3">
        <h1 className="text-lg font-bold text-foreground">Rules</h1>
        <button className="flex items-center gap-1.5 text-xs text-primary-foreground bg-primary px-3 py-1.5 rounded-lg font-semibold">
          <PlusCircle size={13} /> Add Rule
        </button>
      </div>

      {/* Streak widget */}
      <div className="mx-4 mb-4 bg-card border border-profit/20 rounded-2xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground">Days since last violation</p>
          <p className="text-2xl font-bold text-profit">7</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground">Violations this month</p>
          <p className="text-lg font-bold text-loss">5</p>
        </div>
        <Award size={32} className="text-primary opacity-60" />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 px-5 mb-4 overflow-x-auto no-scrollbar">
        {["All", ...categories].map((c, i) => (
          <button key={c} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border ${i === 0 ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Rules list */}
      <div className="px-4 flex flex-col gap-2">
        {rules.map((r, i) => (
          <div key={i} className={`bg-card border rounded-xl px-4 py-3 ${!r.active ? "opacity-50" : r.violations > 5 ? "border-loss/30" : "border-border"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md uppercase ${
                    r.cat === "Risk" ? "bg-loss-muted text-loss" :
                    r.cat === "Psychology" ? "bg-primary/10 text-primary" :
                    r.cat === "Entry" ? "bg-chart-3/15 text-chart-3" :
                    r.cat === "Exit" ? "bg-chart-4/15 text-chart-4" :
                    "bg-secondary text-muted-foreground"
                  }`}>{r.cat}</span>
                  {!r.active && <span className="text-[9px] text-muted-foreground">Inactive</span>}
                  {r.violations > 5 && <span className="text-[9px] text-loss bg-loss-muted px-1.5 py-0.5 rounded-full">{r.violations} violations</span>}
                </div>
                <p className="text-xs text-foreground leading-relaxed">{r.text}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${r.active ? "border-primary bg-primary/20" : "border-border"}`}>
                {r.active && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-4" />
      <BottomNav active="home" />
    </div>
  )
}

// ──────────────────────────────────────────────
// SCREEN: SETTINGS
// ──────────────────────────────────────────────
export function SettingsScreen() {
  return (
    <div className="flex flex-col bg-background min-h-full">
      <div className="flex items-center justify-between px-5 pt-2 pb-4">
        <h1 className="text-lg font-bold text-foreground">Settings</h1>
        <button className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
          <RefreshCw size={15} className="text-muted-foreground" />
        </button>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Capital */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Capital</p>
          </div>
          {[
            { label: "Starting Capital", value: "₹20,00,000" },
            { label: "Current Capital", value: "₹21,24,350" },
            { label: "Monthly Update", value: "No withdrawals" },
          ].map((s, i) => (
            <div key={s.label} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-border/50" : ""}`}>
              <span className="text-sm text-foreground">{s.label}</span>
              <span className="text-sm font-semibold text-muted-foreground">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Trading defaults */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Defaults</p>
          </div>
          {[
            { label: "Default Market", value: "Indian Equity" },
            { label: "Currency", value: "₹ (INR)" },
            { label: "Timezone", value: "IST (UTC+5:30)" },
            { label: "Risk per Trade", value: "2.0%" },
          ].map((s, i) => (
            <div key={s.label} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-border/50" : ""}`}>
              <span className="text-sm text-foreground">{s.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-primary font-medium">{s.value}</span>
                <ChevronRight size={13} className="text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>

        {/* Display */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Display</p>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-foreground">Theme</span>
            <div className="flex gap-1 bg-secondary rounded-full p-0.5">
              <button className="px-3 py-1 rounded-full text-[11px] font-semibold bg-card text-foreground">Dark</button>
              <button className="px-3 py-1 rounded-full text-[11px] text-muted-foreground">Light</button>
            </div>
          </div>
        </div>

        {/* Import/Export */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data</p>
          </div>
          {[
            { label: "Import CSV", sub: "Load historical trades", icon: ArrowUpRight },
            { label: "Export CSV", sub: "Download trade data", icon: ArrowDownRight },
            { label: "Export JSON", sub: "Full backup", icon: ArrowDownRight },
          ].map((a, i) => (
            <div key={a.label} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-border/50" : ""}`}>
              <div>
                <p className="text-sm text-foreground">{a.label}</p>
                <p className="text-[10px] text-muted-foreground">{a.sub}</p>
              </div>
              <a.icon size={15} className="text-primary" />
            </div>
          ))}
        </div>

        {/* About */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <span className="text-sm text-foreground">Database</span>
            <span className="text-xs text-muted-foreground font-mono">tradeLog.db · 2.4 MB</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-foreground">Version</span>
            <span className="text-xs text-muted-foreground">TradeLog v1.0.0</span>
          </div>
        </div>
      </div>

      <div className="h-4" />
      <BottomNav active="home" />
    </div>
  )
}
export function TradeDetailScreen() {
  return (
    <div className="flex flex-col bg-background min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-2 pb-4">
        <button className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
          <ChevronLeft size={16} className="text-foreground" />
        </button>
        <h1 className="text-base font-bold text-foreground">Trade Detail</h1>
        <button className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
          <MoreHorizontal size={16} className="text-foreground" />
        </button>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Hero card */}
        <div className="bg-card border border-profit/20 rounded-2xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold text-foreground">RELIANCE</span>
                <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-md">NSE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-profit-muted text-profit px-2 py-0.5 rounded-full font-semibold">LONG</span>
                <span className="text-xs text-muted-foreground">Breakout · Intraday</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-profit">+₹5,800</p>
              <p className="text-sm text-profit">+2.04%</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "Entry", value: "₹2,840" },
              { label: "Exit", value: "₹2,898" },
              { label: "Qty", value: "100 sh" },
              { label: "Planned R:R", value: "2.0x" },
              { label: "Actual R:R", value: "1.9x" },
              { label: "Net P&L", value: "₹5,621" },
            ].map(f => (
              <div key={f.label} className="bg-secondary rounded-xl px-2.5 py-2">
                <p className="text-[9px] text-muted-foreground">{f.label}</p>
                <p className="text-xs font-semibold text-foreground">{f.value}</p>
              </div>
            ))}
          </div>

          {/* SL / Target markers */}
          <div className="relative h-8 bg-secondary rounded-xl overflow-hidden">
            <div className="absolute inset-0 flex items-center px-3">
              <div className="flex-1 relative h-1 bg-border rounded-full">
                <div className="absolute left-[15%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-loss" />
                <div className="absolute left-[35%] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
                <div className="absolute left-[72%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-profit" />
                <div className="absolute left-[90%] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-chart-4" />
              </div>
            </div>
            <div className="absolute top-0 left-0 h-full flex items-center" style={{ left: "calc(15% + 8px)" }}>
              <span className="text-[8px] text-muted-foreground ml-1">SL</span>
            </div>
            <div className="absolute top-0 flex items-center" style={{ left: "calc(72% + 8px)" }}>
              <span className="text-[8px] text-profit ml-1">Target</span>
            </div>
          </div>
        </div>

        {/* Thesis & Setup */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Thesis</p>
          <p className="text-sm text-foreground leading-relaxed">"RELIANCE holding above 2840 with strong volume buildup. FII activity positive in energy sector. Clean breakout above weekly resistance with OI buildup at 2850 CE."</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {["Volume Confirmation", "Breakout", "OI Buildup", "FII Flow"].map(c => (
              <span key={c} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">{c}</span>
            ))}
          </div>
        </div>

        {/* Psychology */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Psychology</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Pre-trade", val: "Calm", color: "text-profit" },
              { label: "During", val: "Confident", color: "text-chart-4" },
              { label: "Post", val: "Satisfied", color: "text-profit" },
            ].map(p => (
              <div key={p.label} className="bg-secondary rounded-xl p-2.5 text-center">
                <p className={`text-xs font-semibold ${p.color}`}>{p.val}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{p.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 bg-profit-muted border border-profit/20 rounded-xl px-3 py-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={13} className="text-profit" />
              <span className="text-xs text-foreground">Followed Plan</span>
            </div>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => <Star key={s} size={11} className={s <= 4 ? "text-chart-4 fill-chart-4" : "text-muted-foreground"} />)}
            </div>
          </div>
        </div>

        {/* Lesson */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Lesson Learned</p>
          <p className="text-sm text-muted-foreground leading-relaxed">Patience at the entry paid off. Waited 15 mins for confirmation candle instead of rushing in at first tick above resistance.</p>
        </div>
      </div>

      <div className="h-6" />
    </div>
  )
}
