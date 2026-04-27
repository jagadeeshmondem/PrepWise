import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { motion } from 'framer-motion'
import { getCodingSuggestions } from '../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineCodeBracket,
  HiOutlineSparkles,
  HiOutlineArrowPath,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineFire,
  HiOutlineAcademicCap,
  HiOutlineSignal,
} from 'react-icons/hi2'

const DIFFICULTY_COLORS = {
  easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  hard: 'text-red-400 bg-red-500/10 border-red-500/20',
}

const TOPIC_COLORS = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-red-500',
  'from-indigo-500 to-violet-500',
]

export default function CodingPractice() {
  const { state, dispatch } = useApp()
  const { codingSuggestions, analytics, resumeData } = state
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')

  const handleGenerate = async () => {
    if (!resumeData) {
      toast.error('Upload your resume first')
      dispatch({ type: 'SET_VIEW', payload: 'resume' })
      return
    }

    setIsLoading(true)
    try {
      const data = await getCodingSuggestions(
        analytics.weakAreas || [],
        selectedDifficulty
      )
      dispatch({ type: 'SET_CODING_SUGGESTIONS', payload: data.suggestions || data })
      toast.success('Coding problems generated!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to get suggestions')
    }
    setIsLoading(false)
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="space-y-8">
      <motion.div variants={fadeUp} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <HiOutlineCodeBracket className="text-emerald-400" />
            Coding Practice
          </h1>
          <p className="text-slate-500 mt-1">Personalized coding problems based on your weak areas</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="input-field w-auto text-sm"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !resumeData}
            className="btn-primary flex items-center gap-2"
          >
            {isLoading ? (
              <><HiOutlineArrowPath className="animate-spin" /> Loading...</>
            ) : (
              <><HiOutlineSparkles /> Get Problems</>
            )}
          </button>
        </div>
      </motion.div>

      {/* Weak areas summary */}
      {analytics.weakAreas?.length > 0 && (
        <motion.div variants={fadeUp} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
            <HiOutlineFire />
            Focus Areas Detected
          </h3>
          <div className="flex flex-wrap gap-2">
            {analytics.weakAreas.map((area, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {area}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Problem cards */}
      {codingSuggestions?.length > 0 ? (
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {codingSuggestions.map((problem, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card glass-card-hover p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${TOPIC_COLORS[i % TOPIC_COLORS.length]} flex items-center justify-center`}>
                    <span className="text-white text-sm font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-200 text-sm">{problem.title || problem.name}</h3>
                    {problem.topic && (
                      <p className="text-xs text-slate-500">{problem.topic}</p>
                    )}
                  </div>
                </div>
                {problem.difficulty && (
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${DIFFICULTY_COLORS[problem.difficulty?.toLowerCase()] || DIFFICULTY_COLORS.medium}`}>
                    {problem.difficulty}
                  </span>
                )}
              </div>

              {problem.description && (
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">{problem.description}</p>
              )}

              {problem.hint && (
                <div className="p-2.5 rounded-lg bg-surface-800/50 border border-purple-500/5 mb-3">
                  <p className="text-xs text-purple-400">
                    <HiOutlineAcademicCap className="inline mr-1" />
                    Hint: {problem.hint}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                {problem.pattern && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <HiOutlineSignal className="text-sm" />
                    {problem.pattern}
                  </span>
                )}
                {problem.link && (
                  <a
                    href={problem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    Solve <HiOutlineArrowTopRightOnSquare />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="glass-card p-12 text-center">
          <HiOutlineCodeBracket className="text-5xl text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">No coding problems yet</p>
          <p className="text-sm text-slate-500">Generate personalized problems based on your profile</p>
        </motion.div>
      )}
    </motion.div>
  )
}
