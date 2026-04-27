import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { motion } from 'framer-motion'
import { loginUser, registerUser, getInterviewHistory } from '../services/api'
import toast from 'react-hot-toast'
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineArrowRightOnRectangle, HiOutlineSun, HiOutlineMoon, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2'

export default function AuthPage() {
  const { state, dispatch } = useApp()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) {
      toast.error('Please enter username and password')
      return
    }
    setLoading(true)
    try {
      let data
      if (isLoginMode) {
        data = await loginUser(username, password)
        toast.success(data.message)
      } else {
        data = await registerUser(username, password)
        toast.success(data.message)
      }
      
      dispatch({ type: 'SET_USER', payload: { id: data.user_id, username: data.username } })
      
      if (data.resume_data) {
        dispatch({ type: 'SET_RESUME_DATA', payload: data.resume_data })
      }
      
      const historyData = await getInterviewHistory(data.user_id)
      if (historyData.history) {
        const formattedHistory = historyData.history.map(s => s.data)
        dispatch({ type: 'SET_HISTORY', payload: formattedHistory })
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed')
    }
    setLoading(false)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center animated-bg overflow-hidden">
      {/* Theme Toggle */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
        className="absolute top-6 right-6 z-20 p-3 rounded-full glass-card hover:bg-surface-800/50 transition-colors border-purple-500/20"
        title="Toggle Theme"
      >
        {state.theme === 'light' ? (
          <HiOutlineMoon className="text-xl text-slate-400 hover:text-purple-400" />
        ) : (
          <HiOutlineSun className="text-xl text-slate-400 hover:text-amber-400" />
        )}
      </button>

      {/* Background Logo */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img src="/logo.jpg" alt="Background Logo" className="w-[80vw] max-w-[800px] object-contain grayscale" />
      </div>
      
      {/* Animated Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md p-8 glass-card border-purple-500/20 shadow-2xl backdrop-blur-2xl mx-4"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] mb-4 overflow-hidden border border-purple-500/30">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain scale-110" />
          </div>
          <h1 className="text-3xl font-bold gradient-text tracking-tight">PrepWise</h1>
          <p className="text-sm text-slate-400 mt-2 font-medium">{isLoginMode ? 'Welcome back, candidate.' : 'Start your journey.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineUser className="text-slate-500" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field !pl-10"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineLockClosed className="text-slate-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field !pl-10 !pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white rounded-xl py-3 font-semibold shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLoginMode ? 'Sign In to Dashboard' : 'Create Account'}
                <HiOutlineArrowRightOnRectangle className="text-lg" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            {isLoginMode ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-purple-400 font-medium hover:text-purple-300 transition-colors"
            >
              {isLoginMode ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
        
        {/* Guest access option */}
        <div className="mt-8 pt-6 border-t border-purple-500/10 text-center">
            <button 
                onClick={() => dispatch({ type: 'SET_USER', payload: { id: 'guest', username: 'Guest' } })}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
                Continue as Guest (Progress won't be saved)
            </button>
        </div>
      </motion.div>
    </div>
  )
}
