import React from 'react'
import { useApp } from '../context/AppContext'
import { motion } from 'framer-motion'
import {
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlineChatBubbleLeftRight,
  HiOutlineChartBarSquare,
  HiOutlineCalendarDays,
  HiOutlineCodeBracket,
  HiOutlineBuildingOffice2,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineUser,
  HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2'
import { RiRobot2Line } from 'react-icons/ri'
import { loginUser, registerUser, getInterviewHistory } from '../services/api'
import toast from 'react-hot-toast'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { id: 'resume', label: 'Resume Analysis', icon: HiOutlineDocumentText },
  { id: 'interview', label: 'Mock Interview', icon: HiOutlineChatBubbleLeftRight },
  { id: 'analytics', label: 'Analytics', icon: HiOutlineChartBarSquare },
  { id: 'planner', label: 'Daily Planner', icon: HiOutlineCalendarDays },
  { id: 'coding', label: 'Coding Practice', icon: HiOutlineCodeBracket },
  { id: 'company', label: 'Company Prep', icon: HiOutlineBuildingOffice2 },
]

export default function Sidebar() {
  const { state, dispatch } = useApp()
  const collapsed = state.isSidebarCollapsed

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="h-screen flex flex-col border-r border-purple-500/10 bg-surface-950/80 backdrop-blur-xl relative z-20 shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 border-b border-purple-500/10">
        <div className="w-14 h-14 flex items-center justify-center shrink-0 bg-white rounded-full overflow-hidden shadow-[0_0_15px_rgba(20,184,166,0.3)] border border-slate-700/50">
          <img src="/logo.jpg" alt="PrepWise Logo" className="w-full h-full object-contain scale-[1.15]" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h1 className="text-lg font-bold gradient-text flex items-baseline tracking-normal" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <span className="text-[1.3em] leading-none">P</span>rep<span className="text-[1.3em] leading-none">W</span>ise
            </h1>
            <p className="text-[9px] tracking-[0.15em] text-slate-400 font-bold uppercase mt-1">PRACTICE. PREPARE. PERFORM.</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = state.currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: item.id })}
              className={`nav-item w-full ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-3' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <Icon className={`text-xl shrink-0 ${isActive ? 'text-purple-400' : ''}`} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Auth Section */}
      <div className="p-3 border-t border-purple-500/10">
        <div className="flex items-center justify-between p-2 rounded-xl bg-surface-800/50 border border-purple-500/10">
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                <HiOutlineUser className="text-purple-400" />
              </div>
              <span className="text-sm text-slate-200 truncate">{state.user?.username}</span>
            </div>
          )}
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-400 transition-colors" title="Logout">
            <HiOutlineArrowRightOnRectangle className="text-lg" />
          </button>
        </div>
      </div>

      {/* Collapse & Theme toggle */}
      <div className="p-3 border-t border-purple-500/10 flex flex-col gap-2">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
          className="nav-item w-full justify-center"
        >
          {state.theme === 'light' ? (
            <>
              <HiOutlineMoon className="text-lg" />
              {!collapsed && <span className="text-sm">Dark Mode</span>}
            </>
          ) : (
            <>
              <HiOutlineSun className="text-lg" />
              {!collapsed && <span className="text-sm">Light Mode</span>}
            </>
          )}
        </button>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="nav-item w-full justify-center"
        >
          {collapsed ? (
            <HiOutlineChevronDoubleRight className="text-lg" />
          ) : (
            <>
              <HiOutlineChevronDoubleLeft className="text-lg" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  )
}
