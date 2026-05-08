import { useState } from 'react'
import { useI18n } from '../lib/i18n'
import { Globe, ChevronDown } from 'lucide-react'

export default function LanguageDetector() {
  const { language, setLanguage } = useI18n()
  const [showDropdown, setShowDropdown] = useState(false)

  const languages = [
    { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ]

  const langCode = language.split('-')[0]
  const currentLang = languages.find(l => l.code.startsWith(langCode)) || languages[0]

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Globe className="w-5 h-5 text-gray-700" />
        <span className="text-sm font-medium text-gray-700">{currentLang.flag} {currentLang.name}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code)
                setShowDropdown(false)
              }}
              className={`w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center space-x-3 first:rounded-t-lg last:rounded-b-lg ${
                currentLang.code === lang.code ? 'bg-gray-50' : ''
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-gray-700">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}