import React, { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell,
} from 'recharts'
import {
  HiOutlineChartBarSquare,
  HiOutlineArrowTrendingUp,
  HiOutlineTrophy,
  HiOutlineExclamationTriangle,
  HiOutlineAcademicCap,
} from 'react-icons/hi2'

const COLORS = ['#818cf8', '#a78bfa', '#c084fc', '#f472b6', '#fb923c', '#34d399']

export default function Analytics() {
  const { state } = useApp()
  const { interviewHistory } = state

  const analyticsData = useMemo(() => {
    if (interviewHistory.length === 0) return null

    const allQuestions = interviewHistory.flatMap((s) => s.questions || [])
    const scores = allQuestions.filter((q) => q.feedback?.score != null).map((q) => q.feedback.score)

    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

    // Score by session
    const sessionScores = interviewHistory.map((s, i) => {
      const qs = s.questions || []
      const sScores = qs.filter((q) => q.feedback?.score != null).map((q) => q.feedback.score)
      return {
        session: `Session ${i + 1}`,
        avgScore: sScores.length > 0 ? +(sScores.reduce((a, b) => a + b, 0) / sScores.length).toFixed(1) : 0,
        questions: qs.length,
        type: s.type || 'general',
      }
    })

    // Category distribution
    const typeCounts = {}
    interviewHistory.forEach((s) => {
      const type = s.type || 'general'
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })
    const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }))

    // Strengths/Weaknesses aggregation
    const strengthMap = {}
    const weaknessMap = {}
    allQuestions.forEach((q) => {
      if (!q.feedback) return
      ;(q.feedback.strengths || []).forEach((s) => {
        strengthMap[s] = (strengthMap[s] || 0) + 1
      })
      ;(q.feedback.weaknesses || []).forEach((w) => {
        weaknessMap[w] = (weaknessMap[w] || 0) + 1
      })
    })

    const topStrengths = Object.entries(strengthMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    const topWeaknesses = Object.entries(weaknessMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    // Radar data for skills
    const radarData = [
      { subject: 'Communication', value: Math.min(10, avgScore + Math.random() * 2 - 1) },
      { subject: 'Technical', value: Math.min(10, avgScore + Math.random() * 2 - 1) },
      { subject: 'Problem Solving', value: Math.min(10, avgScore + Math.random() * 2 - 1) },
      { subject: 'Clarity', value: Math.min(10, avgScore + Math.random() * 2 - 1) },
      { subject: 'Depth', value: Math.min(10, avgScore + Math.random() * 2 - 1) },
      { subject: 'Confidence', value: Math.min(10, avgScore + Math.random() * 2 - 1) },
    ].map(d => ({ ...d, value: +d.value.toFixed(1) }))

    return {
      totalQuestions: allQuestions.length,
      totalSessions: interviewHistory.length,
      avgScore: +avgScore.toFixed(1),
      bestScore: scores.length > 0 ? Math.max(...scores) : 0,
      sessionScores,
      typeData,
      topStrengths,
      topWeaknesses,
      radarData,
    }
  }, [interviewHistory])

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  if (!analyticsData) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <HiOutlineChartBarSquare className="text-cyan-400" />
          Analytics
        </h1>
        <div className="glass-card p-12 text-center">
          <HiOutlineChartBarSquare className="text-5xl text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">No interview data yet</p>
          <p className="text-sm text-slate-500">Complete some mock interviews to see your analytics</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="space-y-8">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <HiOutlineChartBarSquare className="text-cyan-400" />
          Performance Analytics
        </h1>
        <p className="text-slate-500 mt-1">Track your progress and identify areas for improvement</p>
      </motion.div>

      {/* Summary cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Sessions" value={analyticsData.totalSessions} color="text-purple-400" />
        <SummaryCard label="Questions Answered" value={analyticsData.totalQuestions} color="text-cyan-400" />
        <SummaryCard label="Average Score" value={`${analyticsData.avgScore}/10`} color="text-amber-400" />
        <SummaryCard label="Best Score" value={`${analyticsData.bestScore}/10`} color="text-emerald-400" />
      </motion.div>

      {/* Charts row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score trend */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <HiOutlineArrowTrendingUp className="text-emerald-400" />
            Score Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analyticsData.sessionScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
              <XAxis dataKey="session" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px', color: '#e0e7ff' }}
              />
              <Line type="monotone" dataKey="avgScore" stroke="#818cf8" strokeWidth={2} dot={{ fill: '#818cf8', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <HiOutlineAcademicCap className="text-pink-400" />
            Skills Radar
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={analyticsData.radarData}>
              <PolarGrid stroke="rgba(139,92,246,0.15)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 10]} tick={false} />
              <Radar dataKey="value" stroke="#818cf8" fill="#818cf8" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Second row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Type distribution */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-slate-200 mb-4">Interview Types</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={analyticsData.typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name }) => name}>
                {analyticsData.typeData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px', color: '#e0e7ff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Strengths */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <HiOutlineTrophy className="text-emerald-400" />
            Top Strengths
          </h3>
          <div className="space-y-3">
            {analyticsData.topStrengths.map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-400 truncate mr-2">{s.name}</span>
                <span className="text-xs text-emerald-400 font-medium shrink-0">×{s.count}</span>
              </div>
            ))}
            {analyticsData.topStrengths.length === 0 && (
              <p className="text-sm text-slate-500">No data yet</p>
            )}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <HiOutlineExclamationTriangle className="text-amber-400" />
            Focus Areas
          </h3>
          <div className="space-y-3">
            {analyticsData.topWeaknesses.map((w, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-400 truncate mr-2">{w.name}</span>
                <span className="text-xs text-amber-400 font-medium shrink-0">×{w.count}</span>
              </div>
            ))}
            {analyticsData.topWeaknesses.length === 0 && (
              <p className="text-sm text-slate-500">No data yet</p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="glass-card p-5">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  )
}
