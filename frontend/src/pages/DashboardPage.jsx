import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import CodeEditor from '../components/CodeEditor'
import ReviewPanel from '../components/ReviewPanel'
import ImprovedCodePanel from '../components/ImprovedCodePanel'
import ExplanationPanel from '../components/ExplanationPanel'
import Sidebar from '../components/Sidebar'
import ThemeToggle from '../components/ThemeToggle'
import { submitCodeReview } from '../services/api'

const DashboardPage = () => {
  const { user, logout } = useAuth()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [reviewResult, setReviewResult] = useState(null)
  const [activeTab, setActiveTab] = useState('issues')

  const handleSubmit = async (settings) => {
    if (!code.trim()) {
      alert('Please enter some code to review')
      return
    }

    setLoading(true)
    setReviewResult(null)
    setActiveTab('issues')

    try {
      const result = await submitCodeReview({
        code,
        language: settings.language,
        skillLevel: settings.skillLevel,
        focusAreas: settings.focusAreas
      })

      setReviewResult(result)
    } catch (error) {
      console.error('Review failed:', error)
      alert(error.response?.data?.error || 'Failed to analyze code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'issues', label: 'Issues' },
    { id: 'improved', label: 'Improved Code' },
    { id: 'explanation', label: 'Mentor Feedback' }
  ]

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-dark-950">
      {/* Header */}
      <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Code Reviewer</h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user?.name}
            </span>
            <ThemeToggle />
            <button
              onClick={() => window.location.href = '/history'}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
            >
              History
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col p-6">
          {reviewResult && (
            <div className="mb-4 flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 flex space-x-6">
            {/* Left Panel - Code Editor or Review Results */}
            <div className="flex-1 flex flex-col">
              {!reviewResult ? (
                <CodeEditor
                  code={code}
                  language="javascript"
                  onChange={setCode}
                  readOnly={loading}
                />
              ) : (
                <div className="flex-1 overflow-auto">
                  {activeTab === 'issues' && (
                    <ReviewPanel issues={reviewResult.issues} />
                  )}
                  {activeTab === 'improved' && (
                    <ImprovedCodePanel
                      improvedCode={reviewResult.improvedCode}
                      originalCode={code}
                    />
                  )}
                  {activeTab === 'explanation' && (
                    <ExplanationPanel
                      score={reviewResult.score}
                      mentorExplanation={reviewResult.mentorExplanation}
                      followUpQuestions={reviewResult.followUpQuestions}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <Sidebar
              onSubmit={handleSubmit}
              loading={loading}
              disabled={!code.trim()}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
