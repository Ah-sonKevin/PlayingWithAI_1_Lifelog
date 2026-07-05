import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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
  return `${h}h ${m}m`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [range, setRange] = useState<"day" | "week" | "month">("day")
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  const [editLabel, setEditLabel] = useState("")
  const [editStart, setEditStart] = useState("")
  const [editEnd, setEditEnd] = useState("")

  const getDateParams = () => {
    const now = new Date()
    if (range === "day") {
      const d = now.toISOString().slice(0, 10)
      return `date=${d}`
    }
    const to = now.toISOString().slice(0, 10)
    const from = new Date(now)
    if (range === "week") from.setDate(from.getDate() - 7)
    else from.setMonth(from.getMonth() - 1)
    return `from_=${from.toISOString().slice(0, 10)}&to=${to}`
  }

  const fetchEntries = async () => {
    const params = getDateParams()
    const data = await api.get<Entry[]>(`/entries?${params}`)
    setEntries(data)
  }

  useEffect(() => {
    fetchEntries()
  }, [range])

  const handleDelete = async (id: number) => {
    await api.delete(`/entries/${id}`)
    fetchEntries()
  }

  const handleEdit = async () => {
    if (!editingEntry) return
    const body: Record<string, string> = {}
    if (editLabel) body.label = editLabel
    if (editStart) body.started_at = new Date(editStart).toISOString()
    if (editEnd) body.ended_at = new Date(editEnd).toISOString()
    await api.patch(`/entries/${editingEntry.id}`, body)
    setEditingEntry(null)
    fetchEntries()
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">History</h1>

      <div className="flex gap-2">
        {(["day", "week", "month"] as const).map((r) => (
          <Button
            key={r}
            variant={range === r ? "default" : "outline"}
            onClick={() => setRange(r)}
          >
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{entry.label}</p>
              <p className="text-sm text-muted-foreground">
                {formatTime(entry.started_at)} - {entry.ended_at ? formatTime(entry.ended_at) : "now"}
                {entry.duration_seconds ? ` (${formatDuration(entry.duration_seconds)})` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">Edit</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit entry</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Label"
                      defaultValue={entry.label}
                      onChange={(e) => setEditLabel(e.target.value)}
                    />
                    <Input
                      type="datetime-local"
                      defaultValue={new Date(entry.started_at).toISOString().slice(0, 16)}
                      onChange={(e) => setEditStart(e.target.value)}
                    />
                    <Input
                      type="datetime-local"
                      defaultValue={entry.ended_at ? new Date(entry.ended_at).toISOString().slice(0, 16) : ""}
                      onChange={(e) => setEditEnd(e.target.value)}
                    />
                    <Button onClick={handleEdit}>Save</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(entry.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}