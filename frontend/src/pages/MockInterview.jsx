import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import { startInterview, submitAnswer, saveInterviewSession } from '../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlinePaperAirplane,
  HiOutlineArrowPath,
  HiOutlineStopCircle,
  HiOutlineSparkles,
  HiOutlineTrophy,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineLightBulb,
  HiOutlineArrowTrendingUp,
  HiOutlineMicrophone,
  HiOutlineSpeakerWave,
} from 'react-icons/hi2'
import { RiRobot2Line } from 'react-icons/ri'

const INTERVIEW_TYPES = [
  { id: 'general', label: 'General', desc: 'Mixed HR + Technical' },
  { id: 'hr', label: 'HR Round', desc: 'Behavioral & situational' },
  { id: 'technical', label: 'Technical', desc: 'CS fundamentals & coding' },
  { id: 'project', label: 'Project Deep-Dive', desc: 'Based on your projects' },
]

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', color: 'text-emerald-400' },
  { id: 'medium', label: 'Medium', color: 'text-amber-400' },
  { id: 'hard', label: 'Hard', color: 'text-red-400' },
]

export default function MockInterview() {
  const { state, dispatch } = useApp()
  const { resumeData, isInterviewActive, interviewSession, currentQuestion, targetCompany } = state
  const [answer, setAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false)
  const [selectedType, setSelectedType] = useState('general')
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')
  const [company, setCompany] = useState(targetCompany || '')
  const [role, setRole] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const chatEndRef = useRef(null)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [interviewSession?.questions, currentQuestion])

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = false

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setAnswer((prev) => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + finalTranscript.trim())
        }
      }

      recognitionRef.current.onerror = (e) => {
        console.error('Speech recognition error', e.error)
        setIsRecording(false)
      }
      
      recognitionRef.current.onend = () => {
        setIsRecording(false)
      }
    }
    
    // Cleanup speech synthesis on unmount
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel() // stop current
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.05
      window.speechSynthesis.speak(utterance)
    } else {
      toast.error('Text-to-speech not supported in this browser')
    }
  }

  // Auto-speak new questions
  useEffect(() => {
    if (isInterviewActive && currentQuestion) {
      speakText(currentQuestion)
    }
  }, [currentQuestion, isInterviewActive])

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recording not supported in this browser')
      return
    }
    if (isRecording) {
      recognitionRef.current.stop()
    } else {
      try {
        recognitionRef.current.start()
        setIsRecording(true)
      } catch (e) {
        console.error(e)
      }
    }
  }

  const handleStartInterview = async () => {
    if (!resumeData) {
      toast.error('Please upload your resume first')
      dispatch({ type: 'SET_VIEW', payload: 'resume' })
      return
    }

    dispatch({
      type: 'START_INTERVIEW',
      payload: { type: selectedType, company, role },
    })
    if (company) {
      dispatch({ type: 'SET_TARGET_COMPANY', payload: company })
    }

    setIsLoadingQuestion(true)
    try {
      const data = await startInterview(resumeData, selectedType, company, selectedDifficulty, role)
      dispatch({ type: 'SET_CURRENT_QUESTION', payload: data.question })
    } catch (err) {
      console.error(err)
      toast.error('Failed to start interview')
      dispatch({ type: 'END_INTERVIEW' })
    }
    setIsLoadingQuestion(false)
  }

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || isSubmitting) return
    setIsSubmitting(true)

    const questionEntry = {
      question: currentQuestion,
      answer: answer.trim(),
      feedback: null,
    }

    try {
      const data = await submitAnswer({
        resume_data: resumeData,
        question: currentQuestion,
        answer: answer.trim(),
        type: interviewSession?.type || 'general',
        company: interviewSession?.company || '',
        role: interviewSession?.role || '',
        difficulty: selectedDifficulty,
        history: interviewSession?.questions || [],
      })

      // Show feedback immediately
      questionEntry.feedback = data.feedback
      dispatch({ type: 'ADD_INTERVIEW_ENTRY', payload: questionEntry })
      dispatch({ type: 'SET_CURRENT_QUESTION', payload: null })
      setAnswer('')
      setIsSubmitting(false)
      
      // Start loading spinner for the next question
      setIsLoadingQuestion(true)

      // Add a 4-second delay BEFORE showing the next question
      await new Promise(resolve => setTimeout(resolve, 4000))

      // Update analytics hints
      if (data.analytics_hint) {
        dispatch({
          type: 'UPDATE_ANALYTICS',
          payload: { weakAreas: data.analytics_hint.weak_areas || [] },
        })
      }

      if (data.coding_suggestions?.length > 0) {
        dispatch({ type: 'SET_CODING_SUGGESTIONS', payload: data.coding_suggestions })
      }

      // Set next question
      if (data.question) {
        dispatch({ type: 'SET_CURRENT_QUESTION', payload: data.question })
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit answer')
      setIsSubmitting(false)
    } finally {
      setIsLoadingQuestion(false)
    }
  }

  const handleEndInterview = async () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    if (state.user && interviewSession?.questions?.length > 0) {
      try {
        const averageScore = interviewSession.questions.reduce((acc, q) => acc + (q.feedback?.score || 0), 0) / interviewSession.questions.length
        await saveInterviewSession(
          state.user.id, 
          interviewSession, 
          averageScore, 
          interviewSession.company, 
          interviewSession.type
        )
      } catch (e) {
        console.error("Failed to save session", e)
      }
    }

    dispatch({ type: 'END_INTERVIEW' })
    toast.success('Interview session ended')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitAnswer()
    }
  }

  // Setup screen
  if (!isInterviewActive) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <HiOutlineChatBubbleLeftRight className="text-purple-400" />
            Mock Interview
          </h1>
          <p className="text-slate-500 mt-1">Configure your interview session and start practicing</p>
        </div>

        {!resumeData && (
          <div className="glass-card p-6 border-amber-500/20">
            <div className="flex items-center gap-3 text-amber-400">
              <HiOutlineExclamationTriangle className="text-xl shrink-0" />
              <div>
                <p className="font-medium">Resume Required</p>
                <p className="text-sm text-slate-500">Please upload your resume first for personalized questions</p>
              </div>
            </div>
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'resume' })}
              className="btn-primary text-sm mt-4"
            >
              Upload Resume
            </button>
          </div>
        )}

        {/* Interview type selection */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-slate-200 mb-4">Interview Type</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {INTERVIEW_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-xl border transition-all text-left ${
                  selectedType === type.id
                    ? 'bg-purple-500/15 border-purple-500/40 text-purple-400'
                    : 'bg-surface-800/30 border-purple-500/10 text-slate-400 hover:border-purple-500/20'
                }`}
              >
                <p className="font-medium text-sm">{type.label}</p>
                <p className="text-xs text-slate-500 mt-1">{type.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-slate-200 mb-4">Difficulty Level</h3>
          <div className="flex gap-3">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDifficulty(d.id)}
                className={`px-6 py-3 rounded-xl border transition-all font-medium text-sm ${
                  selectedDifficulty === d.id
                    ? `bg-purple-500/15 border-purple-500/40 ${d.color}`
                    : 'bg-surface-800/30 border-purple-500/10 text-slate-400 hover:border-purple-500/20'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target company & role */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-slate-200 mb-4">Target Role & Company (Optional)</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Target Role (e.g., Frontend Developer)"
              className="input-field flex-1"
            />
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Target Company (e.g., Google)"
              className="input-field flex-1"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Questions will be tailored to the specific role and company patterns using AI
          </p>
        </div>

        {/* Start button */}
        <div className="flex justify-center">
          <motion.button
            onClick={handleStartInterview}
            disabled={!resumeData}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary text-lg px-10 py-4 flex items-center gap-3"
          >
            <HiOutlineSparkles className="text-xl" />
            Start Interview Session
          </motion.button>
        </div>
      </motion.div>
    )
  }

  // Active interview chat
  const allEntries = interviewSession?.questions || []

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Header bar */}
      <div className="glass-card p-4 mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <RiRobot2Line className="text-white text-sm" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200 capitalize">
              {interviewSession?.type} Interview
              {interviewSession?.company && ` · ${interviewSession.company}`}
            </p>
            <p className="text-xs text-slate-500">
              {allEntries.length} questions answered
            </p>
          </div>
        </div>
        <button onClick={handleEndInterview} className="btn-secondary text-sm flex items-center gap-2 text-red-400 border-red-500/30 hover:bg-red-500/10">
          <HiOutlineStopCircle />
          End Session
        </button>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2">
        {/* Welcome message */}
        <div className="chat-bubble-ai max-w-3xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <RiRobot2Line className="text-purple-400" />
              <span className="text-xs font-medium text-purple-400">PrepWise Coach</span>
            </div>
            <button onClick={() => speakText(`Welcome to your ${interviewSession?.type} interview session. Let's begin!`)} className="text-purple-400/50 hover:text-purple-400 transition-colors">
              <HiOutlineSpeakerWave />
            </button>
          </div>
          <p className="text-sm text-slate-300">
            Welcome to your {interviewSession?.type} interview session
            {interviewSession?.company ? ` targeting ${interviewSession.company}` : ''}.
            I'll ask you one question at a time. Answer naturally and I'll provide detailed feedback.
            Let's begin!
          </p>
        </div>

        {/* Q&A entries */}
        {allEntries.map((entry, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Question */}
            <div className="chat-bubble-ai max-w-3xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <RiRobot2Line className="text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">Question {i + 1}</span>
                </div>
                <button onClick={() => speakText(entry.question)} className="text-purple-400/50 hover:text-purple-400 transition-colors">
                  <HiOutlineSpeakerWave />
                </button>
              </div>
              <p className="text-sm text-slate-200">{entry.question}</p>
            </div>

            {/* User answer */}
            <div className="chat-bubble-user max-w-3xl ml-auto">
              <p className="text-sm text-slate-200">{entry.answer}</p>
            </div>

            {/* Feedback */}
            {entry.feedback && (
              <FeedbackCard feedback={entry.feedback} questionNum={i + 1} />
            )}
          </motion.div>
        ))}

        {/* Current question */}
        {currentQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="chat-bubble-ai max-w-3xl"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <RiRobot2Line className="text-purple-400" />
                <span className="text-xs font-medium text-purple-400">
                  Question {allEntries.length + 1}
                </span>
              </div>
              <button onClick={() => speakText(currentQuestion)} className="text-purple-400/50 hover:text-purple-400 transition-colors">
                <HiOutlineSpeakerWave />
              </button>
            </div>
            <p className="text-sm text-slate-200">{currentQuestion}</p>
          </motion.div>
        )}

        {/* Loading indicator */}
        {isLoadingQuestion && (
          <div className="chat-bubble-ai max-w-3xl">
            <div className="flex items-center gap-2 text-purple-400">
              <HiOutlineArrowPath className="animate-spin" />
              <span className="text-sm typing-cursor">Preparing next question</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 pt-4 border-t border-purple-500/10">
        <div className="flex gap-3 items-end">
          <button
            onClick={toggleRecording}
            disabled={isSubmitting || !currentQuestion}
            className={`p-3.5 rounded-xl shrink-0 transition-colors border ${
              isRecording
                ? 'bg-red-500/20 border-red-500/50 text-red-500 animate-pulse'
                : 'bg-surface-800/50 border-purple-500/20 text-purple-400 hover:bg-purple-500/10'
            }`}
            title="Start/Stop Voice Recording"
          >
            <HiOutlineMicrophone className="text-lg" />
          </button>
          <textarea
            ref={textareaRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer here... (Shift+Enter for new line)"
            rows={3}
            className="input-field flex-1 resize-none"
            disabled={isSubmitting || !currentQuestion}
          />
          <button
            onClick={handleSubmitAnswer}
            disabled={isSubmitting || !answer.trim() || !currentQuestion}
            className="btn-primary p-3.5 rounded-xl shrink-0"
          >
            {isSubmitting ? (
              <HiOutlineArrowPath className="animate-spin text-lg" />
            ) : (
              <HiOutlinePaperAirplane className="text-lg" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function FeedbackCard({ feedback, questionNum }) {
  const scoreColor =
    feedback.score >= 8 ? 'text-emerald-400' :
    feedback.score >= 5 ? 'text-amber-400' : 'text-red-400'

  const scoreBg =
    feedback.score >= 8 ? 'from-emerald-500/20 to-emerald-500/5' :
    feedback.score >= 5 ? 'from-amber-500/20 to-amber-500/5' : 'from-red-500/20 to-red-500/5'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-5 max-w-3xl mx-auto border-purple-500/20"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <HiOutlineLightBulb className="text-amber-400" />
          Feedback — Question {questionNum}
        </p>
        <div className={`px-4 py-1.5 rounded-full bg-gradient-to-r ${scoreBg} ${scoreColor} font-bold text-sm`}>
          {feedback.score}/10
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Strengths */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <HiOutlineCheckCircle />
            Strengths
          </p>
          <ul className="space-y-1">
            {(feedback.strengths || []).map((s, i) => (
              <li key={i} className="text-xs text-slate-400 flex gap-2">
                <span className="text-emerald-500 shrink-0">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-red-400 flex items-center gap-1">
            <HiOutlineArrowTrendingUp />
            Areas to Improve
          </p>
          <ul className="space-y-1">
            {(feedback.weaknesses || []).map((w, i) => (
              <li key={i} className="text-xs text-slate-400 flex gap-2">
                <span className="text-red-500 shrink-0">→</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Improved answer */}
      {feedback.improved_answer && (
        <div className="p-3 rounded-xl bg-surface-800/50 border border-purple-500/10">
          <p className="text-xs font-semibold text-purple-400 mb-2 flex items-center gap-1">
            <HiOutlineTrophy />
            Improved Answer
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">{feedback.improved_answer}</p>
        </div>
      )}
    </motion.div>
  )
}
