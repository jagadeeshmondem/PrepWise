import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { motion } from 'framer-motion'
import { getCompanyPrep } from '../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineBuildingOffice2,
  HiOutlineSparkles,
  HiOutlineArrowPath,
  HiOutlineLightBulb,
  HiOutlineDocumentText,
  HiOutlineChatBubbleLeftRight,
  HiOutlineAcademicCap,
  HiOutlineCheckBadge,
  HiOutlineArrowTrendingUp,
  HiOutlineCodeBracket,
  HiOutlineStar,
} from 'react-icons/hi2'

const POPULAR_COMPANIES = [
  'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple',
  'TCS', 'Infosys', 'Wipro', 'HCL', 'Accenture',
  'Goldman Sachs', 'JP Morgan', 'Uber', 'Netflix', 'Adobe',
]

export default function CompanyPrep() {
  const { state, dispatch } = useApp()
  const { resumeData, targetCompany } = state
  const [company, setCompany] = useState(targetCompany || '')
  const [companyData, setCompanyData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handlePrepare = async (companyName) => {
    const name = companyName || company
    if (!name.trim()) {
      toast.error('Please enter a company name')
      return
    }
    if (!resumeData) {
      toast.error('Upload your resume first')
      dispatch({ type: 'SET_VIEW', payload: 'resume' })
      return
    }

    setCompany(name)
    dispatch({ type: 'SET_TARGET_COMPANY', payload: name })
    setIsLoading(true)

    try {
      const data = await getCompanyPrep(name, resumeData)
      setCompanyData(data)
      toast.success(`${name} preparation ready!`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load company prep')
    }
    setIsLoading(false)
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="space-y-8">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <HiOutlineBuildingOffice2 className="text-amber-400" />
          Company-Specific Preparation
        </h1>
        <p className="text-slate-500 mt-1">RAG-powered preparation tailored to your target company</p>
      </motion.div>

      {/* Company search */}
      <motion.div variants={fadeUp} className="glass-card p-6">
        <h3 className="font-semibold text-slate-200 mb-4">Select Target Company</h3>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Enter company name..."
            className="input-field flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handlePrepare()}
          />
          <button
            onClick={() => handlePrepare()}
            disabled={isLoading || !resumeData}
            className="btn-primary flex items-center gap-2 shrink-0"
          >
            {isLoading ? (
              <><HiOutlineArrowPath className="animate-spin" /> Loading...</>
            ) : (
              <><HiOutlineSparkles /> Prepare</>
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {POPULAR_COMPANIES.map((c) => (
            <button
              key={c}
              onClick={() => handlePrepare(c)}
              className="text-xs px-3 py-1.5 rounded-lg bg-surface-800/50 text-slate-400 border border-purple-500/10 hover:border-purple-500/30 hover:text-purple-400 transition-all"
            >
              {c}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Company data */}
      {companyData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Company overview */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-2 flex items-center gap-2">
              <HiOutlineCheckBadge className="text-purple-400" />
              {company} — Interview Insights
            </h3>
            {companyData.overview && (
              <p className="text-sm text-slate-400 leading-relaxed">{companyData.overview}</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interview pattern */}
            {companyData.interview_pattern && (
              <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <HiOutlineDocumentText className="text-blue-400" />
                  Interview Pattern
                </h3>
                <div className="space-y-3">
                  {companyData.interview_pattern.rounds?.map((round, i) => (
                    <div key={i} className="p-3 rounded-xl bg-surface-800/50 border border-purple-500/5">
                      <p className="font-medium text-sm text-slate-200">{round.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{round.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Focus topics */}
            {companyData.focus_topics && (
              <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <HiOutlineAcademicCap className="text-emerald-400" />
                  Key Focus Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {companyData.focus_topics.map((topic, i) => (
                    <span key={i} className="skill-tag">{topic}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {companyData.tips && (
              <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <HiOutlineLightBulb className="text-amber-400" />
                  Preparation Tips
                </h3>
                <ul className="space-y-2">
                  {companyData.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-slate-400 flex gap-2">
                      <span className="text-amber-400 shrink-0">→</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sample questions */}
            {companyData.sample_questions && (
              <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <HiOutlineChatBubbleLeftRight className="text-pink-400" />
                  Frequently Asked Questions
                </h3>
                <div className="space-y-2">
                  {companyData.sample_questions.map((q, i) => (
                    <div key={i} className="p-3 rounded-xl bg-surface-800/50 border border-purple-500/5">
                      <p className="text-sm text-slate-300">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Placement Insights */}
          {companyData.placement_insights && companyData.placement_insights.length > 0 && (
            <div className="glass-card p-6 border-l-4 border-l-amber-400">
              <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <HiOutlineStar className="text-amber-400" />
                Placement Insights & Suggestions
              </h3>
              <div className="space-y-3">
                {companyData.placement_insights.map((insight, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-amber-400 mt-1 shrink-0"><HiOutlineStar className="w-4 h-4" /></span>
                    <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coding Questions */}
          {companyData.coding_questions && companyData.coding_questions.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <HiOutlineCodeBracket className="text-blue-400" />
                Company-Specific Coding Questions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companyData.coding_questions.map((cq, i) => (
                  <div key={i} className="p-4 rounded-xl bg-surface-800/50 border border-purple-500/10 hover:border-purple-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-slate-200">{cq.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-md ${
                        cq.difficulty?.toLowerCase() === 'hard' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        cq.difficulty?.toLowerCase() === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {cq.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">{cq.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="glass-card p-6 text-center">
            <p className="text-slate-300 mb-4">Ready to practice for {company}?</p>
            <button
              onClick={() => {
                dispatch({ type: 'SET_TARGET_COMPANY', payload: company })
                dispatch({ type: 'SET_VIEW', payload: 'interview' })
              }}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <HiOutlineChatBubbleLeftRight />
              Start {company} Mock Interview
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
