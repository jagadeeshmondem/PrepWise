import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Auth
export async function loginUser(username, password) {
  const response = await api.post('/auth/login', { username, password })
  return response.data
}

export async function registerUser(username, password) {
  const response = await api.post('/auth/register', { username, password })
  return response.data
}

export async function getInterviewHistory(userId) {
  const response = await api.get(`/user/history?user_id=${userId}`)
  return response.data
}

export async function saveInterviewSession(userId, sessionData, score, company, type) {
  const response = await api.post('/interview/save', {
    user_id: userId,
    session_data: sessionData,
    score,
    company,
    type
  })
  return response.data
}

// Resume analysis
export async function analyzeResume(file) {
  const formData = new FormData()
  formData.append('resume', file)
  const response = await api.post('/resume/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function analyzeResumeText(text) {
  const response = await api.post('/resume/analyze-text', { text })
  return response.data
}

export async function saveResumeData(userId, resumeData) {
  const response = await api.post('/user/save-resume', {
    user_id: userId,
    resume_data: resumeData
  })
  return response.data
}

// Interview
export async function startInterview(resumeData, type, company, difficulty, role = '') {
  const response = await api.post('/interview/start', {
    resume_data: resumeData,
    type,
    company,
    difficulty,
    role,
  })
  return response.data
}

export async function submitAnswer(sessionData) {
  const response = await api.post('/interview/answer', sessionData)
  return response.data
}

export async function getNextQuestion(sessionData) {
  const response = await api.post('/interview/next-question', sessionData)
  return response.data
}

// Analytics
export async function getAnalytics(history) {
  const response = await api.post('/analytics/generate', { history })
  return response.data
}

// Daily Plan
export async function generateDailyPlan(resumeData, analytics, company) {
  const response = await api.post('/planner/generate', {
    resume_data: resumeData,
    analytics,
    company,
  })
  return response.data
}

// Coding Suggestions
export async function getCodingSuggestions(weakAreas, difficulty) {
  const response = await api.post('/coding/suggestions', {
    weak_areas: weakAreas,
    difficulty,
  })
  return response.data
}

// Company-specific preparation
export async function getCompanyPrep(company, resumeData) {
  const response = await api.post('/company/prepare', {
    company,
    resume_data: resumeData,
  })
  return response.data
}

export default api
