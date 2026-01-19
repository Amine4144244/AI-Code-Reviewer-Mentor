import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'

const CodeEditor = ({ code, language, onChange, readOnly = false }) => {
  const [characterCount, setCharacterCount] = useState(0)

  useEffect(() => {
    setCharacterCount(code.length)
  }, [code])

  const handleEditorChange = (value) => {
    if (onChange && !readOnly) {
      onChange(value || '')
    }
  }

  const getLanguageMonaco = (lang) => {
    const languageMap = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'python': 'python',
      'go': 'go',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c'
    }
    return languageMap[lang] || 'javascript'
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2 text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium">Code Editor</span>
        <span>{characterCount.toLocaleString()} characters</span>
      </div>
      <div className="flex-1 border rounded-lg overflow-hidden dark:border-gray-700">
        <Editor
          height="100%"
          language={getLanguageMonaco(language)}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            folding: true,
            padding: { top: 16, bottom: 16 }
          }}
        />
      </div>
    </div>
  )
}

export default CodeEditor
