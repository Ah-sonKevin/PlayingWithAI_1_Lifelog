import * as React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { AuthPage } from "@/pages/AuthPage"
import { TodayPage } from "@/pages/TodayPage"
import { HistoryPage } from "@/pages/HistoryPage"
import { StatsPage } from "@/pages/StatsPage"

function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="text-lg font-bold tracking-tight text-primary">Lifelog</a>
            <nav className="flex items-center gap-1">
              <a href="/" className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">Today</a>
              <a href="/history" className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">History</a>
              <a href="/stats" className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">Stats</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <button onClick={logout} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Logout
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}

export function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        Loading...
      </div>
    </div>
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<TodayPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}