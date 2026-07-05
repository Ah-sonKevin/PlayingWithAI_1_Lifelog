import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts"

interface Stats {
  totals_by_label: { label: string; total_seconds: number }[]
  tasks_per_day: { date: string; count: number }[]
  distribution: { label: string; percentage: number }[]
  daily_series: { date: string; total_seconds: number }[]
}

const COLORS = ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"]

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [range, setRange] = useState<"week" | "month">("week")

  const fetchStats = async () => {
    const now = new Date()
    const to = now.toISOString().slice(0, 10)
    const from = new Date(now)
    if (range === "week") from.setDate(from.getDate() - 7)
    else from.setMonth(from.getMonth() - 1)
    const fromStr = from.toISOString().slice(0, 10)
    const data = await api.get<Stats>(`/stats?from=${fromStr}&to=${to}`)
    setStats(data)
  }

  useEffect(() => {
    fetchStats()
  }, [range])

  if (!stats) return <div className="max-w-2xl mx-auto p-6">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Stats</h1>

      <div className="flex gap-2">
        {(["week", "month"] as const).map((r) => (
          <Button
            key={r}
            variant={range === r ? "default" : "outline"}
            onClick={() => setRange(r)}
          >
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total per task</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.totals_by_label}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                formatter={(value: number) => formatDuration(value)}
              />
              <Bar dataKey="total_seconds" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.distribution}
                dataKey="percentage"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ label, percentage }) => `${label} ${percentage}%`}
              >
                {stats.distribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks per day</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.daily_series}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                formatter={(value: number) => formatDuration(value)}
              />
              <Line type="monotone" dataKey="total_seconds" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}