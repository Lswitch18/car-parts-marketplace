/**
 * Fast, intelligent, and secure automotive text localizer for JDM catalog titles and brands.
 * Operates purely in-memory with zero network latency, Shift-Left SAST security, and deterministic output.
 */

const JDM_AUTOMOTIVE_TRANSLATIONS_JA: [RegExp, string][] = [
  [/\bRoad\s*&\s*Track\b/gi, 'ロード＆トラック'],
  [/\bRoad\s+and\s+Track\b/gi, 'ロード＆トラック'],
  [/\bCoilovers?\b/gi, '車高調'],
  [/\bTwin\s+Turbo\b/gi, 'ツインターボ'],
  [/\bSingle\s+Turbo\b/gi, 'シングルターボ'],
  [/\bTurbine\s+Kit\b/gi, 'タービンキット'],
  [/\bTurbine\b/gi, 'タービン'],
  [/\bIntercooler\b/gi, 'インタークーラー'],
  [/\bCat-?back\s+Exhaust\b/gi, 'キャットバックエキゾースト'],
  [/\bCat-?back\b/gi, 'キャットバック'],
  [/\bExhaust\s+System\b/gi, 'エキゾーストシステム'],
  [/\bExhaust\s+Manifold\b/gi, 'エキゾーストマニホールド'],
  [/\bExhaust\b/gi, 'エキゾースト'],
  [/\bBig\s+Brake\s+Kit\b/gi, 'ビッグブレーキキット'],
  [/\bBrake\s+Kit\b/gi, 'ブレーキキット'],
  [/\b(\d+)[-\s]*Piston\b/gi, '$1ピストン'],
  [/\b(\d+)[-\s]*Pot\b/gi, '$1ポット'],
  [/\bCarbon\s+Fiber\b/gi, 'カーボンファイバー'],
  [/\bRacing\s+Steering\s+Wheel\b/gi, 'レーシングステアリングホイール'],
  [/\bRacing\s+Steering\b/gi, 'レーシングステアリング'],
  [/\bSteering\s+Wheel\b/gi, 'ステアリングホイール'],
  [/\bForged\s+Piston\b/gi, '鍛造ピストン'],
  [/\bConnecting\s+Rods?\b/gi, 'コンロッド'],
  [/\bConrods?\b/gi, 'コンロッド'],
  [/\bBillet\b/gi, 'ビレット'],
  [/\bTransmission\b/gi, 'トランスミッション'],
  [/\bSequential\s+Gearbox\b/gi, 'シーケンシャルミッション'],
  [/\bHigh\s+Performance\b/gi, '高性能'],
  [/\bPolished\s+Aluminum\b/gi, 'ポリッシュドアルミニウム'],
  [/\bStainless\s+Steel\b/gi, 'ステンレス製'],
  [/\bTitanium\b/gi, 'チタン製'],
  [/\bVented\s+Hood\b/gi, 'ベント付きボンネット'],
  [/\bBucket\s+Seat\b/gi, 'バケットシート'],
  [/\bFull\s+Bucket\s+Seat\b/gi, 'フルバケットシート'],
]

const KNOWN_TITLE_BRANDS: { match: RegExp; name: string }[] = [
  { match: /^(無限|Mugen)/i, name: 'MUGEN' },
  { match: /^(GReddy|TRUST)/i, name: 'GReddy' },
  { match: /^(オーリンズ|Öhlins|Ohlins)/i, name: 'ÖHLINS' },
  { match: /^(HKS)/i, name: 'HKS' },
  { match: /^(Brembo|ブレンボ)/i, name: 'Brembo' },
  { match: /^(NISMO|ニスモ)/i, name: 'NISMO' },
  { match: /^(TRD)/i, name: 'TRD' },
  { match: /^(Tomei|東名)/i, name: 'TOMEI' },
  { match: /^(Recaro|レカロ)/i, name: 'RECARO' },
  { match: /^(Bride|ブリッド)/i, name: 'BRIDE' },
  { match: /^(Work|ワーク)/i, name: 'WORK' },
  { match: /^(Rays|レイズ|Volk)/i, name: 'RAYS' },
  { match: /^(Enkei|エンケイ)/i, name: 'ENKEI' },
  { match: /^(Blitz|ブリッツ)/i, name: 'BLITZ' },
  { match: /^(Apex['’]?i|アペックス)/i, name: 'A\'PEXi' },
  { match: /^(Fujitsubo|フジツボ)/i, name: 'FUJITSUBO' },
  { match: /^(Cusco|クスコ)/i, name: 'CUSCO' },
  { match: /^(Tein|テイン)/i, name: 'TEIN' },
  { match: /^(Endless|エンドレス)/i, name: 'ENDLESS' },
]

export function localizeProductTitle(title: string | null | undefined, lang: string): string {
  if (!title) return ''
  if (lang !== 'ja') return title

  let localized = title
  for (const [regex, replacement] of JDM_AUTOMOTIVE_TRANSLATIONS_JA) {
    localized = localized.replace(regex, replacement)
  }
  return localized
}

export function resolveProductBrandName(
  brandName: string | null | undefined,
  title: string | null | undefined,
  t: (key: string) => string
): string {
  if (brandName && brandName.trim()) {
    return t(brandName)
  }

  if (title) {
    for (const item of KNOWN_TITLE_BRANDS) {
      if (item.match.test(title)) {
        return item.name
      }
    }
  }

  return 'JDM'
}
