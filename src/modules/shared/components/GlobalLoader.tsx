import { Loader2 } from 'lucide-react'

export default function GlobalLoader() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center bg-transparent">
      <Loader2 className="w-8 h-8 text-daig-primary animate-spin opacity-50" />
    </div>
  )
}
