import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { motion } from 'framer-motion'
import { generateDailyPlan } from '../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineCalendarDays,
  HiOutlineSparkles,
  HiOutlineArrowPath,
  HiOutlineClock,
  HiOutlineBookOpen,
  HiOutlineCodeBracket,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCheckCircle,
  HiOutlineAcademicCap,
} from 'react-icons/hi2'

const ICON_MAP = {
  dsa: HiOutlineCodeBracket,
  coding: HiOutlineCodeBracket,
  'core subjects': HiOutlineAcademicCap,
  core: HiOutlineAcademicCap,
  'mock interview': HiOutlineChatBubbleLeftRight,
  interview: HiOutlineChatBubbleLeftRight,
  revision: HiOutlineBookOpen,
  default: HiOutlineBookOpen,
}

const COLOR_MAP = {
  dsa: 'from-emerald-500 to-teal-500',
  coding: 'from-emerald-500 to-teal-500',
  'core subjects': 'from-blue-500 to-cyan-500',
  core: 'from-blue-500 to-cyan-500',
  'mock interview': 'from-purple-500 to-pink-500',
  interview: 'from-purple-500 to-pink-500',
  revision: 'from-amber-500 to-orange-500',
  default: 'from-gray-500 to-slate-500',
}

export default function DailyPlanner() {
  const { state, dispatch } = useApp()
  const { resumeData, analytics, dailyPlan, targetCompany } = state
  const [isGenerating, setIsGenerating] = useState(false)
  const [completedTasks, setCompletedTasks] = useState(new Set())

  const handleGenerate = async () => {
    if (!resumeData) {
      toast.error('Upload your resume first')
      dispatch({ type: 'SET_VIEW', payload: 'resume' })
      return
    }

    setIsGenerating(true)
    try {
      const data = await generateDailyPlan(resumeData, analytics, targetCompany)
      dispatch({ type: 'SET_DAILY_PLAN', payload: data })
      setCompletedTasks(new Set())
      toast.success('Daily plan generated!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate plan')
    }
    setIsGenerating(false)
  }

  const toggleTask = (blockIdx, taskIdx) => {
    const key = `${blockIdx}-${taskIdx}`
    setCompletedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const totalTasks = dailyPlan?.blocks?.reduce((sum, b) => sum + (b.tasks?.length || 0), 0) || 0
  const progress = totalTasks > 0 ? (completedTasks.size / totalTasks) * 100 : 0

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="space-y-8">
      <motion.div variants={fadeUp} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <HiOutlineCalendarDays className="text-amber-400" />
            Daily Preparation Plan
          </h1>
          <p className="text-slate-500 mt-1">Structured study plan tailored to your profile</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !resumeData}
          className="btn-primary flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <HiOutlineArrowPath className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <HiOutlineSparkles />
              Generate New Plan
            </>
          )}
        </button>
      </motion.div>

      {!resumeData && (
        <motion.div variants={fadeUp} className="glass-card p-6 border-amber-500/20 text-center">
          <p className="text-slate-400 mb-3">Upload your resume to generate a personalized study plan</p>
          <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'resume' })} className="btn-primary text-sm">
            Upload Resume
          </button>
        </motion.div>
      )}

      {dailyPlan && (
        <>
          {/* Progress bar */}
          <motion.div variants={fadeUp} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-300">Today's Progress</p>
              <p className="text-sm font-semibold text-purple-400">{completedTasks.size}/{totalTasks} tasks</p>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </motion.div>

          {/* Time blocks */}
          <motion.div variants={fadeUp} className="space-y-4">
            {dailyPlan.blocks?.map((block, bi) => {
              const categoryLower = (block.category || '').toLowerCase()
              const Icon = ICON_MAP[categoryLower] || ICON_MAP.default
              const color = COLOR_MAP[categoryLower] || COLOR_MAP.default

              return (
                <motion.div
                  key={bi}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: bi * 0.08 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
                      <Icon className="text-white text-lg" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-200">{block.title || block.category}</h3>
                      {block.time && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <HiOutlineClock className="text-sm" />
                          {block.time}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 ml-14">
                    {block.tasks?.map((task, ti) => {
                      const key = `${bi}-${ti}`
                      const isDone = completedTasks.has(key)
                      return (
                        <button
                          key={ti}
                          onClick={() => toggleTask(bi, ti)}
                          className={`flex items-start gap-3 w-full text-left p-2 rounded-lg transition-all hover:bg-surface-800/30 ${
                            isDone ? 'opacity-50' : ''
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border mt-0.5 shrink-0 flex items-center justify-center transition-all ${
                            isDone
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                              : 'border-purple-500/20'
                          }`}>
                            {isDone && <HiOutlineCheckCircle className="text-sm" />}
                          </div>
                          <span className={`text-sm ${isDone ? 'line-through text-slate-600' : 'text-slate-300'}`}>
                            {task}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </>
      )}

      {!dailyPlan && resumeData && (
        <motion.div variants={fadeUp} className="glass-card p-12 text-center">
          <HiOutlineCalendarDays className="text-5xl text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">No plan generated yet</p>
          <p className="text-sm text-slate-500">Click "Generate New Plan" to get your personalized study schedule</p>
        </motion.div>
      )}
    </motion.div>
  )
}
