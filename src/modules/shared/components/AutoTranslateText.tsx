import { useEffect, useState } from 'react'
import { Globe } from 'lucide-react'

interface AutoTranslateTextProps {
  text: string
  targetLang: string
  simple?: boolean
}

export default function AutoTranslateText({ text, targetLang, simple }: AutoTranslateTextProps) {
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // If it's a price proposal or confirmation, don't translate the formatting
    if (!text || text.trim() === '' || text.startsWith('Proposta de preço') || text.startsWith('✅ Preço de') || text.startsWith('Preço confirmado')) {
      setTranslatedText(null)
      return
    }

    const translate = async () => {
      setLoading(true)
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
        const res = await fetch(url)
        const data = await res.json()
        if (data && data[0] && data[0][0] && data[0][0][0]) {
          const translation = data[0].map((x: any) => x[0]).join('')
          if (translation.toLowerCase().trim() !== text.toLowerCase().trim()) {
            setTranslatedText(translation)
          } else {
            setTranslatedText(null)
          }
        }
      } catch (err) {
        console.error('Translation error:', err)
      } finally {
        setLoading(false)
      }
    }

    // Debounce translation to avoid excessive calls
    const timer = setTimeout(() => {
      translate()
    }, 300)

    return () => clearTimeout(timer)
  }, [text, targetLang])

  if (loading) {
    if (simple) {
      return <span className="opacity-70 animate-pulse">{text}</span>
    }
    return (
      <span className="opacity-70 animate-pulse flex items-center space-x-1">
        <span>{text}</span>
        <span className="text-[10px] text-gray-400 flex items-center ml-2">
          <Globe className="w-3 h-3 animate-spin mr-1 text-[#00E5FF]" />
          Translating...
        </span>
      </span>
    )
  }

  if (translatedText && !showOriginal) {
    if (simple) {
      return <span>{translatedText}</span>
    }
    return (
      <div>
        <p className="text-white">{translatedText}</p>
        <button
          onClick={() => setShowOriginal(true)}
          className="text-[10px] text-[#00E5FF] hover:underline block mt-1 flex items-center focus:outline-none"
        >
          <Globe className="w-3 h-3 mr-1" />
          Ver original (Show original)
        </button>
      </div>
    )
  }

  if (translatedText && showOriginal) {
    if (simple) {
      return <span>{text}</span>
    }
    return (
      <div>
        <p className="text-white">{text}</p>
        <button
          onClick={() => setShowOriginal(false)}
          className="text-[10px] text-[#00E5FF] hover:underline block mt-1 flex items-center focus:outline-none"
        >
          <Globe className="w-3 h-3 mr-1" />
          Ver tradução (Show translation)
        </button>
      </div>
    )
  }

  return simple ? <span>{text}</span> : <p className="text-white">{text}</p>
}
