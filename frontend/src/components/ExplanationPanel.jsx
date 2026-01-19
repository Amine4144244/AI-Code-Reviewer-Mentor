import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

const ExplanationPanel = ({ score, mentorExplanation, followUpQuestions }) => {
  const ScoreBadge = ({ score, label }) => {
    let color = 'text-green-600 dark:text-green-400'
    if (score < 60) color = 'text-red-600 dark:text-red-400'
    else if (score < 80) color = 'text-yellow-600 dark:text-yellow-400'

    return (
      <div className="text-center p-3 bg-gray-50 dark:bg-dark-900 rounded-lg">
        <div className={`text-2xl font-bold ${color}`}>{score}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 capitalize">{label}</div>
      </div>
    )
  }

  if (!score) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">Mentor Feedback</p>
          <p>Submit your code to see detailed feedback</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Score Overview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Overall Score</h3>
          <div className={`text-4xl font-bold ${score.overall >= 80 ? 'text-green-600 dark:text-green-400' : score.overall >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
            {score.overall}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          <ScoreBadge score={score.correctness} label="Correctness" />
          <ScoreBadge score={score.readability} label="Readability" />
          <ScoreBadge score={score.maintainability} label="Maintainability" />
          <ScoreBadge score={score.performance} label="Performance" />
          <ScoreBadge score={score.security} label="Security" />
        </div>
      </div>

      {/* Mentor Explanation */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Mentor Feedback</h3>
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {mentorExplanation}
          </ReactMarkdown>
        </div>
      </div>

      {/* Follow-up Questions */}
      {followUpQuestions && followUpQuestions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Questions to Consider</h3>
          <div className="space-y-3">
            {followUpQuestions.map((question, index) => (
              <div
                key={index}
                className="bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500 p-4 rounded-r-lg"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold mr-2">Q{index + 1}:</span>
                  {question}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExplanationPanel
