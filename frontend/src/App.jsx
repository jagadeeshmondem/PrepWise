import React from 'react'
import { useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import ErrorBoundary from './components/ErrorBoundary'
import Dashboard from './pages/Dashboard'
import ResumeAnalyzer from './pages/ResumeAnalyzer'
import MockInterview from './pages/MockInterview'
import Analytics from './pages/Analytics'
import DailyPlanner from './pages/DailyPlanner'
import CodingPractice from './pages/CodingPractice'
import CompanyPrep from './pages/CompanyPrep'
import AuthPage from './pages/AuthPage'

const VIEWS = {
  dashboard: Dashboard,
  resume: ResumeAnalyzer,
  interview: MockInterview,
  analytics: Analytics,
  planner: DailyPlanner,
  coding: CodingPractice,
  company: CompanyPrep,
}

export default function App() {
  const { state } = useApp()
  const CurrentPage = VIEWS[state.currentView] || Dashboard

  if (!state.user) {
    return <AuthPage />
  }

  return (
    <div className="flex h-screen overflow-hidden animated-bg">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        {/* Ambient glow orbs */}
        <div className="fixed top-20 right-20 w-72 h-72 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-20 left-60 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="p-6 lg:p-8 relative z-10">
          <ErrorBoundary>
            <CurrentPage />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
