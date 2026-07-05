import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Entry {
  id: number
  label: string
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

export default function TodayPage() {
  const [activeEntry, setActiveEntry] = useState<Entry | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [label, setLabel] = useState("")
  const [now, setNow] = useState(Date.now())

  const fetchActive = async () => {
    const data = await api.get<Entry | null>("/entries/active")
    setActiveEntry(data)
  }

  const fetchToday = async () => {
    const today = new Date().toISOString().slice(0, 10)
    const data = await api.get<Entry[]>(`/entries?date=${today}`)
    setEntries(data)
  }

  useEffect(() => {
    fetchActive()
    fetchToday()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleStart = async () => {
    if (!label.trim()) return
    await api.post("/entries/start", { label })
    setLabel("")
    fetchActive()
    fetchToday()
  }

  const handleStop = async () => {
    await api.post("/entries/stop")
    fetchActive()
    fetchToday()
  }

  const activeDuration = activeEntry
    ? Math.floor((Date.now() - new Date(activeEntry.started_at).getTime()) / 1000)
    : 0

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Today</h1>
        <p className="text-sm text-muted-foreground mt-1">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      {activeEntry ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center space-y-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current task</p>
            <h2 className="text-xl font-semibold mt-1">{activeEntry.label}</h2>
          </div>
          <div className="text-6xl font-mono font-light tracking-wider text-primary">
            {formatDuration(activeDuration)}
          </div>
          <div className="flex items-center justify-center gap-4">
            <p className="text-sm text-muted-foreground">Started at {formatTime(activeEntry.started_at)}</p>
            <Button onClick={handleStop} variant="destructive" size="lg" className="rounded-full px-8">
              Stop
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-8 text-center space-y-6">
          <div>
            <h2 className="text-lg font-semibold">What are you working on?</h2>
            <p className="text-sm text-muted-foreground mt-1">Enter a task name to start tracking time</p>
          </div>
          <div className="flex gap-3 max-w-md mx-auto">
            <Input
              placeholder="e.g. Design review, coding, meeting..."
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              className="flex-1"
            />
            <Button onClick={handleStart} className="shrink-0">
              Start timer
            </Button>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">Today's entries</h2>
        <div className="space-y-1">
          {entries.map((entry) => {
            const start = new Date(entry.started_at)
            const end = entry.ended_at ? new Date(entry.ended_at) : new Date()
            const duration = Math.floor((end.getTime() - start.getTime()) / 1000)
            return (
              <div key={entry.id} className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{entry.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(entry.started_at)} - {entry.ended_at ? formatTime(entry.ended_at) : "now"}
                  </p>
                </div>
                <p className="text-sm font-mono text-muted-foreground tabular-nums">{formatDuration(duration)}</p>
              </div>
            )
          })}
          {entries.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No entries yet today</p>
          )}
        </div>
      </div>
    </div>
  )
}