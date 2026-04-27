import React, { createContext, useContext, useReducer } from 'react'

const AppContext = createContext()

const initialState = {
  // Auth state
  user: null,

  // Resume data
  resumeData: null,
  resumeFile: null,
  isResumeAnalyzing: false,

  // Interview state
  currentView: 'dashboard', // dashboard, resume, interview, analytics, planner, coding
  interviewSession: null,
  interviewHistory: [],
  currentQuestion: null,
  isInterviewActive: false,
  interviewType: 'general', // general, hr, technical, project
  difficulty: 'medium',

  // Company targeting
  targetCompany: '',

  // Analytics
  analytics: {
    totalInterviews: 0,
    averageScore: 0,
    weakAreas: [],
    strongAreas: [],
    scoreHistory: [],
    categoryBreakdown: {},
  },

  // Daily plan
  dailyPlan: null,

  // Coding suggestions
  codingSuggestions: [],

  // UI state
  isSidebarCollapsed: false,
  isLoading: false,
  theme: 'dark',
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }

    case 'LOGOUT':
      return { ...state, user: null, interviewHistory: [], analytics: initialState.analytics }

    case 'SET_HISTORY':
      return { ...state, interviewHistory: action.payload }

    case 'SET_VIEW':
      return { ...state, currentView: action.payload }

    case 'SET_RESUME_DATA':
      return {
        ...state,
        resumeData: action.payload,
        isResumeAnalyzing: false,
      }

    case 'SET_RESUME_FILE':
      return { ...state, resumeFile: action.payload }

    case 'SET_RESUME_ANALYZING':
      return { ...state, isResumeAnalyzing: action.payload }

    case 'START_INTERVIEW':
      return {
        ...state,
        isInterviewActive: true,
        interviewSession: {
          id: Date.now(),
          type: action.payload.type || 'general',
          company: action.payload.company || '',
          startTime: new Date().toISOString(),
          questions: [],
          currentIndex: 0,
        },
        currentQuestion: null,
      }

    case 'SET_CURRENT_QUESTION':
      return { ...state, currentQuestion: action.payload }

    case 'ADD_INTERVIEW_ENTRY':
      return {
        ...state,
        interviewSession: {
          ...state.interviewSession,
          questions: [...(state.interviewSession?.questions || []), action.payload],
        },
      }

    case 'END_INTERVIEW':
      return {
        ...state,
        isInterviewActive: false,
        interviewHistory: [
          ...state.interviewHistory,
          { ...state.interviewSession, endTime: new Date().toISOString() },
        ],
        interviewSession: null,
        currentQuestion: null,
      }

    case 'SET_TARGET_COMPANY':
      return { ...state, targetCompany: action.payload }

    case 'SET_INTERVIEW_TYPE':
      return { ...state, interviewType: action.payload }

    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.payload }

    case 'UPDATE_ANALYTICS':
      return { ...state, analytics: { ...state.analytics, ...action.payload } }

    case 'SET_DAILY_PLAN':
      return { ...state, dailyPlan: action.payload }

    case 'SET_CODING_SUGGESTIONS':
      return { ...state, codingSuggestions: action.payload }

    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarCollapsed: !state.isSidebarCollapsed }

    case 'TOGGLE_THEME': {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark'
      if (newTheme === 'light') {
        document.body.classList.add('light')
      } else {
        document.body.classList.remove('light')
      }
      return { ...state, theme: newTheme }
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
