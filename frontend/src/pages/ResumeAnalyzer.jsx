import React, { useState, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { analyzeResume, analyzeResumeText, saveResumeData } from '../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineDocumentText,
  HiOutlineCloudArrowUp,
  HiOutlineSparkles,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineCog6Tooth,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineClipboardDocument,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCalendarDays,
} from 'react-icons/hi2'

export default function ResumeAnalyzer() {
  const { state, dispatch } = useApp()
  const { resumeData, isResumeAnalyzing } = state
  const [textMode, setTextMode] = useState(false)
  const [resumeText, setResumeText] = useState('')

  const validateAndSetResume = async (data) => {
    // Check if the API returned an error
    if (data.error) {
      dispatch({ type: 'SET_RESUME_ANALYZING', payload: false })
      toast.error(data.error)
      return
    }
    // Ensure required fields exist with safe defaults
    const safeData = {
      skills: Array.isArray(data.skills) ? data.skills : [],
      projects: Array.isArray(data.projects) ? data.projects : [],
      experience: Array.isArray(data.experience) ? data.experience : [],
      education: Array.isArray(data.education) ? data.education : [],
      certifications: Array.isArray(data.certifications) ? data.certifications : [],
      summary: data.summary || '',
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      improvement_areas: Array.isArray(data.improvement_areas) ? data.improvement_areas : [],
    }
    dispatch({ type: 'SET_RESUME_DATA', payload: safeData })
    toast.success('Resume analyzed successfully!')

    if (state.user && state.user.id !== 'guest') {
      try {
        await saveResumeData(state.user.id, safeData)
      } catch(e) {
        console.error("Failed to save resume to profile", e)
      }
    }
  }

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return
    const file = acceptedFiles[0]
    dispatch({ type: 'SET_RESUME_FILE', payload: file })
    dispatch({ type: 'SET_RESUME_ANALYZING', payload: true })

    try {
      const data = await analyzeResume(file)
      await validateAndSetResume(data)
    } catch (err) {
      console.error(err)
      dispatch({ type: 'SET_RESUME_ANALYZING', payload: false })
      toast.error('Failed to analyze resume. Ensure backend is running.')
    }
  }, [dispatch, state.user])

  const handleTextAnalyze = async () => {
    if (!resumeText.trim()) {
      toast.error('Please paste your resume content')
      return
    }
    dispatch({ type: 'SET_RESUME_ANALYZING', payload: true })

    try {
      const data = await analyzeResumeText(resumeText)
      await validateAndSetResume(data)
    } catch (err) {
      console.error(err)
      dispatch({ type: 'SET_RESUME_ANALYZING', payload: false })
      toast.error('Failed to analyze resume. Ensure backend is running.')
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="space-y-8">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <HiOutlineDocumentText className="text-blue-400" />
            Resume Analyzer
          </h1>
          <p className="text-slate-500 mt-1">Upload your resume to extract skills, projects, and experience</p>
        </div>
        {resumeData && (
          <button
            onClick={() => {
              dispatch({ type: 'SET_RESUME_DATA', payload: null })
              setResumeText('')
            }}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <HiOutlineArrowPath className="text-base" />
            Re-analyze
          </button>
        )}
      </motion.div>

      {/* Upload section */}
      <AnimatePresence mode="wait">
        {!resumeData && (
          <motion.div variants={fadeUp} key="upload" exit={{ opacity: 0, y: -20 }}>
            {/* Mode toggle */}
            <div className="flex gap-3 mb-5">
              <button
                onClick={() => setTextMode(false)}
                className={`text-sm px-4 py-2 rounded-xl transition-all ${
                  !textMode
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <HiOutlineCloudArrowUp className="inline mr-2" />
                Upload File
              </button>
              <button
                onClick={() => setTextMode(true)}
                className={`text-sm px-4 py-2 rounded-xl transition-all ${
                  textMode
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <HiOutlineClipboardDocument className="inline mr-2" />
                Paste Text
              </button>
            </div>

            {!textMode ? (
              <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''}`}
              >
                <input {...getInputProps()} />
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <HiOutlineCloudArrowUp className="text-3xl text-white" />
                  </div>
                  <div>
                    <p className="text-slate-200 font-medium">
                      {isDragActive ? 'Drop your resume here...' : 'Drag & drop your resume here'}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Supports PDF, DOC, DOCX, TXT (Max 10MB)
                    </p>
                  </div>
                  <button className="btn-primary text-sm mx-auto">Browse Files</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume content here...&#10;&#10;Include your skills, projects, experience, education, etc."
                  className="input-field min-h-[250px] resize-y font-mono text-sm"
                />
                <button
                  onClick={handleTextAnalyze}
                  disabled={isResumeAnalyzing || !resumeText.trim()}
                  className="btn-primary flex items-center gap-2"
                >
                  {isResumeAnalyzing ? (
                    <>
                      <HiOutlineArrowPath className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <HiOutlineSparkles />
                      Analyze Resume
                    </>
                  )}
                </button>
              </div>
            )}

            {isResumeAnalyzing && (
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center gap-3 text-purple-400">
                  <HiOutlineArrowPath className="animate-spin text-xl" />
                  <span className="text-sm font-medium">AI is analyzing your resume...</span>
                </div>
                <div className="mt-4 max-w-xs mx-auto">
                  <div className="progress-bar-bg">
                    <motion.div
                      className="progress-bar-fill"
                      initial={{ width: '0%' }}
                      animate={{ width: '80%' }}
                      transition={{ duration: 3, ease: 'easeInOut' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Results */}
        {resumeData && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Success banner */}
            <div className="glass-card p-4 flex items-center gap-3 border-emerald-500/20">
              <HiOutlineCheckCircle className="text-2xl text-emerald-400 shrink-0" />
              <div>
                <p className="font-medium text-emerald-400">Resume Analyzed Successfully</p>
                <p className="text-sm text-slate-500">
                  Found {resumeData.skills?.length || 0} skills, {resumeData.projects?.length || 0} projects, {resumeData.experience?.length || 0} experiences
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skills */}
              <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <HiOutlineCog6Tooth className="text-cyan-400" />
                  Technical Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills?.map((skill, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="skill-tag"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <HiOutlineSparkles className="text-amber-400" />
                  Projects
                </h3>
                <div className="space-y-3">
                  {resumeData.projects?.map((project, i) => (
                    <div key={i} className="p-3 rounded-xl bg-surface-800/50 border border-purple-500/5">
                      <p className="font-medium text-slate-200 text-sm">{project.name || project}</p>
                      {project.description && (
                        <p className="text-xs text-slate-500 mt-1">{project.description}</p>
                      )}
                      {project.technologies && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.map((t, j) => (
                            <span key={j} className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {(!resumeData.projects || resumeData.projects.length === 0) && (
                    <p className="text-sm text-slate-500">No projects detected</p>
                  )}
                </div>
              </div>

              {/* Experience */}
              <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <HiOutlineBriefcase className="text-emerald-400" />
                  Experience
                </h3>
                <div className="space-y-3">
                  {resumeData.experience?.map((exp, i) => (
                    <div key={i} className="p-3 rounded-xl bg-surface-800/50 border border-purple-500/5">
                      <p className="font-medium text-slate-200 text-sm">{exp.role || exp.title || exp}</p>
                      {exp.company && <p className="text-xs text-purple-400">{exp.company}</p>}
                      {exp.duration && <p className="text-xs text-slate-500">{exp.duration}</p>}
                    </div>
                  ))}
                  {(!resumeData.experience || resumeData.experience.length === 0) && (
                    <p className="text-sm text-slate-500">No experience detected</p>
                  )}
                </div>
              </div>

              {/* Education */}
              <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <HiOutlineAcademicCap className="text-pink-400" />
                  Education
                </h3>
                <div className="space-y-3">
                  {resumeData.education?.map((edu, i) => (
                    <div key={i} className="p-3 rounded-xl bg-surface-800/50 border border-purple-500/5">
                      <p className="font-medium text-slate-200 text-sm">{edu.degree || edu}</p>
                      {edu.institution && <p className="text-xs text-purple-400">{edu.institution}</p>}
                      {edu.year && <p className="text-xs text-slate-500">{edu.year}</p>}
                    </div>
                  ))}
                  {(!resumeData.education || resumeData.education.length === 0) && (
                    <p className="text-sm text-slate-500">No education data detected</p>
                  )}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="glass-card p-6 text-center">
              <p className="text-slate-300 mb-4">Ready to start your interview preparation?</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => dispatch({ type: 'SET_VIEW', payload: 'interview' })}
                  className="btn-primary flex items-center gap-2"
                >
                  <HiOutlineChatBubbleLeftRight />
                  Start Mock Interview
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_VIEW', payload: 'planner' })}
                  className="btn-secondary flex items-center gap-2"
                >
                  <HiOutlineCalendarDays />
                  Generate Study Plan
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
