import { useState } from 'react'

const ImprovedCodePanel = ({ improvedCode, originalCode }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(improvedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([improvedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'improved_code.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!improvedCode) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <p className="text-lg font-medium">Improved Code</p>
          <p>Submit your code to see the improved version</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">Improved Code</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {improvedCode.length.toLocaleString()} characters
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors dark:bg-dark-900 dark:border-gray-700 dark:text-white dark:hover:bg-dark-800"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors dark:bg-dark-900 dark:border-gray-700 dark:text-white dark:hover:bg-dark-800"
          >
            Download
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-dark-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <pre className="p-4 text-sm overflow-x-auto">
          <code className="whitespace-pre-wrap break-words font-mono">
            {improvedCode}
          </code>
        </pre>
      </div>
    </div>
  )
}

export default ImprovedCodePanel
