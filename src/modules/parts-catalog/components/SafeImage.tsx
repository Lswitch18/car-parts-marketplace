import { useState } from 'react'
import { Package } from 'lucide-react'

interface SafeImageProps {
  src?: string
  alt?: string
  className?: string
  fallback?: React.ReactNode
}

export default function SafeImage({ src, alt = '', className = '', fallback }: SafeImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return fallback ?? (
      <div className={`flex items-center justify-center ${className}`}>
        <Package className="w-8 h-8 text-gray-400" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
