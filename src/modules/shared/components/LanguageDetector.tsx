import { useState, useRef, useEffect } from 'react'
import { useI18n } from '@/modules/shared/lib/i18n'
import { Globe, ChevronDown } from 'lucide-react'

export default function LanguageDetector({ mobileCompact = false }: { mobileCompact?: boolean }) {
  const { language, setLanguage } = useI18n()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const languages = [
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ]

  const langCode = language.split('-')[0]
  const currentLang = languages.find(l => l.code.startsWith(langCode)) || languages[0]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 p-2 md:px-3 rounded-lg transition-all"
        style={{ color: '#B0B5C0', background: 'rgba(255,255,255,0.04)' }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLElement).style.color = '#FFFFFF'
          ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.color = '#B0B5C0'
          ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
        }}
      >
        <Globe className="w-5 h-5" />
        {!mobileCompact && (
          <span className="text-sm font-medium hidden md:inline">{currentLang.flag} {currentLang.name}</span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div 
          className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden shadow-lg z-50 transition-all duration-200 origin-top-right"
          style={{
            background: 'rgba(10,10,15,0.97)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.8)',
          }}
        >
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as 'pt' | 'en' | 'ja')
                  setShowDropdown(false)
                }}
                className={`w-full text-left px-4 py-3 flex items-center space-x-3 transition-colors ${
                  currentLang.code === lang.code ? 'bg-white/10' : ''
                }`}
                style={{ color: currentLang.code === lang.code ? '#FFFFFF' : '#B0B5C0' }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.color = '#FFFFFF'
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.color = currentLang.code === lang.code ? '#FFFFFF' : '#B0B5C0'
                  ;(e.currentTarget as HTMLElement).style.background = currentLang.code === lang.code ? 'rgba(255,255,255,0.1)' : 'transparent'
                }}
              >
                <span className="text-xl leading-none">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}