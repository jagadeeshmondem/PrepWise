import React from 'react'
import { useApp } from '../context/AppContext'
import { motion } from 'framer-motion'
import {
  HiOutlineDocumentText,
  HiOutlineChatBubbleLeftRight,
  HiOutlineChartBarSquare,
  HiOutlineCodeBracket,
  HiOutlineCalendarDays,
  HiOutlineBuildingOffice2,
  HiOutlineArrowTrendingUp,
  HiOutlineBolt,
  HiOutlineAcademicCap,
  HiOutlineSparkles,
} from 'react-icons/hi2'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}

const quickActions = [
  { id: 'resume', label: 'Upload Resume', desc: 'Analyze skills & experience', icon: HiOutlineDocumentText, color: 'from-blue-500 to-cyan-500' },
  { id: 'interview', label: 'Start Mock Interview', desc: 'Personalized Q&A session', icon: HiOutlineChatBubbleLeftRight, color: 'from-purple-500 to-pink-500' },
  { id: 'coding', label: 'Coding Practice', desc: 'DSA & problem solving', icon: HiOutlineCodeBracket, color: 'from-emerald-500 to-teal-500' },
  { id: 'company', label: 'Company Prep', desc: 'Target specific companies', icon: HiOutlineBuildingOffice2, color: 'from-amber-500 to-orange-500' },
]

export default function Dashboard() {
  const { state, dispatch } = useApp()
  const { analytics, resumeData, interviewHistory } = state

  const computeAvgScore = () => {
    let totalScore = 0;
    let totalQuestions = 0;
    interviewHistory.forEach(session => {
      session.questions?.forEach(q => {
        if (q.feedback?.score !== undefined) {
          totalScore += q.feedback.score;
          totalQuestions += 1;
        }
      });
    });
    if (totalQuestions === 0 && analytics.averageScore) return analytics.averageScore.toFixed(1);
    return totalQuestions > 0 ? (totalScore / totalQuestions).toFixed(1) : null;
  };

  const calculatedAvg = computeAvgScore();

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Hero header */}
      <motion.div variants={item} className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-indigo-950/80 via-purple-950/60 to-surface-950/80 border border-purple-500/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 pt-4">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3 tracking-wide flex items-center">
            Welcome to <span className="gradient-text ml-2 flex items-baseline tracking-normal" style={{ fontFamily: "'Space Grotesk', sans-serif" }}><span className="text-[1.35em] leading-none">P</span>rep<span className="text-[1.35em] leading-none">W</span>ise</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-base leading-relaxed">
            Your powerful placement preparation system. Upload your resume to get started with
            personalized mock interviews, targeted coding practice, and company-specific preparation.
          </p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <HiOutlineBolt className="text-amber-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <motion.button
                key={action.id}
                onClick={() => dispatch({ type: 'SET_VIEW', payload: action.id })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="glass-card glass-card-hover p-5 text-left group cursor-pointer"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <Icon className="text-white text-xl" />
                </div>
                <h3 className="font-semibold text-slate-100 mb-1">{action.label}</h3>
                <p className="text-sm text-slate-500">{action.desc}</p>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <HiOutlineArrowTrendingUp className="text-emerald-400" />
          Your Progress
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Interviews Completed"
            value={interviewHistory.length}
            icon={<HiOutlineChatBubbleLeftRight />}
            color="text-purple-400"
            bgColor="bg-purple-500/10"
          />
          <StatCard
            label="Average Score"
            value={calculatedAvg ? `${calculatedAvg}/10` : '--'}
            icon={<HiOutlineChartBarSquare />}
            color="text-cyan-400"
            bgColor="bg-cyan-500/10"
          />
          <StatCard
            label="Skills Identified"
            value={resumeData?.skills?.length || 0}
            icon={<HiOutlineAcademicCap />}
            color="text-amber-400"
            bgColor="bg-amber-500/10"
          />
          <StatCard
            label="Questions Practiced"
            value={interviewHistory.reduce((sum, s) => sum + (s?.questions?.length || 0), 0)}
            icon={<HiOutlineCalendarDays />}
            color="text-emerald-400"
            bgColor="bg-emerald-500/10"
          />
        </div>
      </motion.div>

      {/* Resume Status & Recent Activity */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume status */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <HiOutlineDocumentText className="text-blue-400" />
            Resume Status
          </h3>
          {resumeData ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-ring" />
                Resume analyzed successfully
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {resumeData.skills?.slice(0, 8).map((skill, i) => (
                  <span key={i} className="skill-tag">{skill}</span>
                ))}
                {resumeData.skills?.length > 8 && (
                  <span className="skill-tag opacity-60">+{resumeData.skills.length - 8} more</span>
                )}
              </div>
              <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'resume' })}
                className="btn-secondary text-sm mt-3"
              >
                View Full Analysis
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500 mb-4 text-sm">No resume uploaded yet</p>
              <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'resume' })}
                className="btn-primary text-sm"
              >
                Upload Resume
              </button>
            </div>
          )}
        </div>

        {/* Recent interviews */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <HiOutlineChatBubbleLeftRight className="text-purple-400" />
            Recent Interviews
          </h3>
          {interviewHistory.length > 0 ? (
            <div className="space-y-3">
              {interviewHistory.slice(-3).reverse().map((session, i) => {
                const dateObj = session.startTime ? new Date(session.startTime) : null;
                const isValidDate = dateObj && !isNaN(dateObj);
                
                return (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-800/50 border border-purple-500/5">
                  <div>
                    <p className="text-sm font-medium text-slate-200 capitalize">
                      {session.type} Interview
                    </p>
                    <p className="text-xs text-slate-500">
                      {isValidDate ? dateObj.toLocaleDateString() : 'Unknown Date'} ·{' '}
                      {session.questions?.length || 0} questions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-purple-400">
                      {session.questions?.length > 0
                        ? (
                            session.questions.reduce((s, q) => s + (q.feedback?.score || 0), 0) /
                            session.questions.length
                          ).toFixed(1)
                        : '--'}
                      /10
                    </p>
                  </div>
                </div>
              )})}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500 mb-4 text-sm">No interviews yet</p>
              <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'interview' })}
                className="btn-primary text-sm"
              >
                Start Interview
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function StatCard({ label, value, icon, color, bgColor }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${bgColor} ${color} text-lg`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  )
}
