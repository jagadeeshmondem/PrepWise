import React from 'react'
import { HiOutlineExclamationTriangle, HiOutlineArrowPath } from 'react-icons/hi2'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="glass-card p-8 text-center max-w-md">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/20 flex items-center justify-center mb-4">
              <HiOutlineExclamationTriangle className="text-3xl text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-200 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="btn-primary text-sm flex items-center gap-2 mx-auto"
            >
              <HiOutlineArrowPath />
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
