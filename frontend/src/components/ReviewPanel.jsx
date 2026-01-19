import { useState } from 'react'

const ReviewPanel = ({ issues }) => {
  const [selectedIssue, setSelectedIssue] = useState(null)

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700'
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
    }
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'bug': '🐛',
      'performance': '⚡',
      'security': '🔒',
      'clean-code': '✨',
      'anti-pattern': '🔄'
    }
    return icons[category] || '📝'
  }

  if (!issues || issues.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">Great job!</p>
          <p>No issues found in your code.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Issues Found</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {issues.length} {issues.length === 1 ? 'issue' : 'issues'} identified
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {issues.map((issue, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md dark:border-gray-700 ${
              selectedIssue === index ? 'ring-2 ring-primary-500' : ''
            }`}
            onClick={() => setSelectedIssue(selectedIssue === index ? null : index)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getCategoryIcon(issue.category)}</span>
                <span className={`text-xs px-2 py-1 rounded-full border ${getSeverityColor(issue.severity)}`}>
                  {issue.severity}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Line {issue.line}
                </span>
              </div>
              <span className="text-xs font-medium text-primary-600 dark:text-primary-400 capitalize">
                {issue.category}
              </span>
            </div>

            <p className="text-sm font-medium mb-2">{issue.message}</p>

            {selectedIssue === index && (
              <div className="mt-3 space-y-2 text-sm">
                <div className="bg-gray-50 dark:bg-dark-900 p-3 rounded-lg">
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Why this matters:</p>
                  <p className="text-gray-600 dark:text-gray-400">{issue.explanation}</p>
                </div>
                <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg border-l-4 border-primary-500">
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Suggested fix:</p>
                  <p className="text-gray-600 dark:text-gray-400">{issue.suggestion}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReviewPanel
