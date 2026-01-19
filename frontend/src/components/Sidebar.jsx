import { useState } from 'react'

const Sidebar = ({ onSubmit, loading, disabled }) => {
  const [language, setLanguage] = useState('javascript')
  const [skillLevel, setSkillLevel] = useState('mid')
  const [focusAreas, setFocusAreas] = useState(['bugs', 'performance', 'security', 'clean-code'])

  const handleFocusAreaToggle = (area) => {
    setFocusAreas(prev => {
      if (prev.includes(area)) {
        return prev.filter(a => a !== area)
      } else {
        return [...prev, area]
      }
    })
  }

  const handleSubmit = () => {
    if (disabled) return

    onSubmit({
      language,
      skillLevel,
      focusAreas
    })
  }

  return (
    <div className="w-80 bg-white dark:bg-dark-800 border-l border-gray-200 dark:border-gray-700 p-6 flex flex-col">
      <h2 className="text-xl font-bold mb-6">Review Settings</h2>

      <div className="space-y-6 flex-1">
        {/* Language Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Programming Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={loading}
            className="select-field"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="go">Go</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
          </select>
        </div>

        {/* Skill Level Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Experience Level
          </label>
          <select
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
            disabled={loading}
            className="select-field"
          >
            <option value="junior">Junior Developer</option>
            <option value="mid">Mid-Level Developer</option>
            <option value="senior">Senior Developer</option>
          </select>
        </div>

        {/* Focus Areas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Focus Areas
          </label>
          <div className="space-y-2">
            {[
              { value: 'bugs', label: 'Bugs & Errors', icon: '🐛' },
              { value: 'performance', label: 'Performance', icon: '⚡' },
              { value: 'security', label: 'Security', icon: '🔒' },
              { value: 'clean-code', label: 'Clean Code', icon: '✨' },
              { value: 'all', label: 'All Areas', icon: '🔍' }
            ].map((area) => (
              <label
                key={area.value}
                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  focusAreas.includes(area.value)
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={focusAreas.includes(area.value)}
                  onChange={() => handleFocusAreaToggle(area.value)}
                  disabled={loading}
                  className="sr-only"
                />
                <span className="text-xl mr-3">{area.icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {area.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || disabled}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
          loading || disabled
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </span>
        ) : (
          'Analyze Code'
        )}
      </button>
    </div>
  )
}

export default Sidebar
