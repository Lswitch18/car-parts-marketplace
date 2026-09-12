// Simple VTT parser for kinetic captions
export type VttCue = {
  start: number
  end: number
  text: string
  words: string[]
}

function toSeconds(ts: string): number {
  // 00:00:00,100 or 00:00:00.100
  const m = ts.trim().replace(',', '.').match(/(?:(\d+):)?(\d+):(\d+)\.(\d+)/)
  if (!m) return 0
  const h = m[1] ? parseInt(m[1], 10) : 0
  const min = parseInt(m[2], 10)
  const s = parseInt(m[3], 10)
  const ms = parseInt((m[4] + '000').slice(0, 3), 10)
  return h * 3600 + min * 60 + s + ms / 1000
}

export function parseVtt(vtt: string): VttCue[] {
  const cues: VttCue[] = []
  const blocks = vtt.replace(/\r/g, '').split(/\n\n/)
  for (const block of blocks) {
    const lines = block.split('\n').filter(l => l.trim() && !l.startsWith('WEBVTT') && !l.startsWith('NOTE'))
    if (lines.length < 2) continue
    // first line may be cue id if no arrow
    let timeLineIdx = lines.findIndex(l => l.includes('-->'))
    if (timeLineIdx === -1) continue
    const timeLine = lines[timeLineIdx]
    const [a, b] = timeLine.split('-->').map(s => s.trim().split(' ')[0])
    const start = toSeconds(a)
    const end = toSeconds(b)
    const text = lines.slice(timeLineIdx + 1).join(' ').replace(/\s+/g, ' ').trim()
    if (!text) continue
    cues.push({ start, end, text, words: text.split(/\s+/) })
  }
  return cues.sort((x, y) => x.start - y.start)
}

export function findActiveCue(cues: VttCue[], t: number): VttCue | null {
  // binary search-like linear (cues < 100)
  for (const c of cues) if (t >= c.start && t <= c.end) return c
  return null
}
