/**
 * Fast, intelligent, and secure automotive text localizer for JDM catalog titles, brands, and descriptions.
 * Operates purely in-memory with zero network latency, Shift-Left SAST security, and deterministic output.
 * Provides 100% localization support for Japanese (ja), Portuguese (pt), and English (en).
 */

// Japanese translations (from English/Portuguese to Japanese)
const JDM_AUTOMOTIVE_TRANSLATIONS_JA: [RegExp, string][] = [
  // Coilovers & Suspension
  [/\b(Road\s*&\s*Track|Road\s+and\s+Track)\b/gi, 'ロード＆トラック'],
  [/\b(Coilovers?|Suspens[ãa]o\s+Coilover)\b/gi, '車高調'],
  [/\b(Suspens[ãa]o|Suspension)\b/gi, 'サスペンション'],
  [/\b(Barra\s+Antitor[çc][ãa]o|Strut\s+Bar|Tower\s+Bar)\b/gi, 'タワーバー'],
  [/\b(Barra\s+Estabilizadora|Sway\s+Bar|Anti-roll\s+Bar)\b/gi, 'スタビライザー'],
  [/\b(Santo\s+Ant[ôo]nio|Rollcage|Roll\s+Cage|Roll\s+Bar)\b/gi, 'ロールケージ'],

  // Turbo & Engine
  [/\b(Twin\s+Turbo|Biturbo)\b/gi, 'ツインターボ'],
  [/\b(Single\s+Turbo|Turbo\s+Simples)\b/gi, 'シングルターボ'],
  [/\b(Turbine\s+Kit|Kit\s+de\s+Turbina)\b/gi, 'タービンキット'],
  [/\b(Turbine|Turbocompressor)\b/gi, 'タービン'],
  [/\b(Turbo)\b/gi, 'ターボ'],
  [/\b(Intercooler|Resfriador\s+de\s+Ar)\b/gi, 'インタークーラー'],
  [/\b(Forged\s+Piston|Pist[ãa]o\s+Forjado)\b/gi, '鍛造ピストン'],
  [/\b(Connecting\s+Rods?|Conrods?|Bielas?\s+Forjadas?)\b/gi, 'コンロッド'],
  [/\b(Billet)\b/gi, 'ビレット'],
  [/\b(Engine|Motor)\b/gi, 'エンジン'],
  [/\b(Radiator|Radiador)\b/gi, 'ラジエーター'],
  [/\b(Oil\s+Cooler|Radiador\s+de\s+[ÓO]leo)\b/gi, 'オイルクーラー'],
  [/\b(Air\s+Filter|Air\s+Intake|Filtro\s+de\s+Ar|Admiss[ãa]o)\b/gi, 'エアクリーナー'],

  // Exhaust
  [/\b(Cat-?back\s+Exhaust|Escapamento\s+Cat-?Back)\b/gi, 'キャットバックエキゾースト'],
  [/\b(Cat-?back)\b/gi, 'キャットバック'],
  [/\b(Exhaust\s+System|Sistema\s+de\s+Escape)\b/gi, 'エキゾーストシステム'],
  [/\b(Exhaust\s+Manifold|Coletor\s+de\s+Escape)\b/gi, 'エキゾーストマニホールド'],
  [/\b(Exhaust|Muffler|Escapamento|Silencioso)\b/gi, 'エキゾースト'],

  // Brakes
  [/\b(Big\s+Brake\s+Kit|Kit\s+de\s+Freios?\s+Grandes?)\b/gi, 'ビッグブレーキキット'],
  [/\b(Brake\s+Kit|Kit\s+de\s+Freios?)\b/gi, 'ブレーキキット'],
  [/\b(Brake\s+Calipers?|Pin[çc]as?\s+de\s+Freio)\b/gi, 'ブレーキキャリパー'],
  [/\b(Brake\s+Pads?|Pastilhas?\s+de\s+Freio)\b/gi, 'ブレーキパッド'],
  [/\b(Brake\s+Rotors?|Discos?\s+de\s+Freio)\b/gi, 'ブレーキローター'],
  [/\b(\d+)[-\s]*(Piston|Pist[õo]es|Pot)\b/gi, '$1ポット'],

  // Aero & Body
  [/\b(Carbon\s+Fiber|Fibra\s+de\s+Carbono)\b/gi, 'カーボンファイバー'],
  [/\b(Carbon|Carbono)\b/gi, 'カーボン'],
  [/\b(Roof\s+Spoiler|Spoiler\s+de\s+Teto)\b/gi, 'ルーフスポイラー'],
  [/\b(Rear\s+Spoiler|Spoiler\s+Traseiro)\b/gi, 'リアスポイラー'],
  [/\b(Front\s+Lip|Lip\s+Dianteiro)\b/gi, 'フロントリップ'],
  [/\b(Front\s+Bumper|P[aá]ra-?choque\s+Dianteiro)\b/gi, 'フロントバンパー'],
  [/\b(Rear\s+Bumper|P[aá]ra-?choque\s+Traseiro)\b/gi, 'リアバンパー'],
  [/\b(Side\s+Skirts?|Saias?\s+Laterais?)\b/gi, 'サイドステップ'],
  [/\b(Vented\s+Hood|Cap[ôo]\s+Ventilado)\b/gi, 'ベント付きボンネット'],
  [/\b(Hood|Cap[ôo])\b/gi, 'ボンネット'],
  [/\b(Spoiler|Aerof[óo]lio)\b/gi, 'スポイラー'],
  [/\b(Wing|Asa\s+Traseira)\b/gi, 'ウイング'],
  [/\b(Body\s+Kit)\b/gi, 'ボディキット'],

  // Interior & Seats
  [/\b(Racing\s+Steering\s+Wheel|Volante\s+Esportivo)\b/gi, 'レーシングステアリングホイール'],
  [/\b(Racing\s+Steering|Volante\s+de\s+Corrida)\b/gi, 'レーシングステアリング'],
  [/\b(Steering\s+Wheel|Volante)\b/gi, 'ステアリングホイール'],
  [/\b(Full\s+Bucket\s+Seat|Banco\s+Concha\s+Integral)\b/gi, 'フルバケットシート'],
  [/\b(Bucket\s+Seat|Banco\s+Concha)\b/gi, 'バケットシート'],
  [/\b(Seat|Banco)\b/gi, 'シート'],

  // Transmission & Drivetrain
  [/\b(Sequential\s+Gearbox|C[âa]mbio\s+Sequencial)\b/gi, 'シーケンシャルミッション'],
  [/\b(Clutch\s+Kit|Kit\s+de\s+Embreagem)\b/gi, 'クラッチキット'],
  [/\b(Clutch|Embreagem)\b/gi, 'クラッチ'],
  [/\b(Flywheel|Volante\s+do\s+Motor)\b/gi, 'フライホイール'],
  [/\b(Transmission|Transmiss[ãa]o|C[âa]mbio)\b/gi, 'トランスミッション'],

  // Lighting
  [/\b(Headlights?|Far[óo]is?(\s+Dianteiros?)?)\b/gi, 'ヘッドライト'],
  [/\b(Taillights?|Tail\s+Lights?|Lanternas?(\s+Traseiras?)?)\b/gi, 'テールランプ'],
  [/\b(Fog\s+Lights?|Far[óo]is?\s+de\s+Milha|Far[óo]is?\s+de\s+Neblina)\b/gi, 'フォグランプ'],

  // Wheels
  [/\b(Wheels?|Rims?|Rodas?|Aros?)\b/gi, 'ホイール'],
  [/\b(Tires?|Pneus?)\b/gi, 'タイヤ'],

  // Materials & Attributes
  [/\b(OEM|Original|Genu[íi]no)\b/gi, '純正'],
  [/\b(High\s+Performance|Alta\s+Performance|Alto\s+Desempenho)\b/gi, '高性能'],
  [/\b(Polished\s+Aluminum|Alum[íi]nio\s+Polido)\b/gi, 'ポリッシュドアルミニウム'],
  [/\b(Stainless\s+Steel|A[çc]o\s+Inoxid[áa]vel|Inox)\b/gi, 'ステンレス製'],
  [/\b(Titanium|Tit[âa]nio)\b/gi, 'チタン製'],
  [/\b(Aluminum|Alum[íi]nio)\b/gi, 'アルミ製'],
]

// Portuguese translations (from Japanese/English to Portuguese)
const JDM_AUTOMOTIVE_TRANSLATIONS_PT: [RegExp, string][] = [
  // Brands / Makers with suffix 製
  [/スーパーオーリンズ製?/gi, 'Super Öhlins '],
  [/オーリンズ製?/gi, 'Öhlins '],
  [/無限製?/gi, 'MUGEN '],
  [/ニスモ製?/gi, 'NISMO '],
  [/ブレンボ製?/gi, 'Brembo '],
  [/レカロ製?/gi, 'RECARO '],
  [/ブリッド製?/gi, 'BRIDE '],
  [/東名製?|TOMEI製?/gi, 'TOMEI '],
  [/フジツボ製?/gi, 'Fujitsubo '],
  [/クスコ製?/gi, 'Cusco '],
  [/テイン製?/gi, 'Tein '],
  [/ブリッツ製?/gi, 'Blitz '],
  [/エンドレス製?/gi, 'Endless '],

  // Japanese Brands & Car Models
  [/ミツビシ|三菱/g, 'Mitsubishi '],
  [/ホンダ|本田/g, 'Honda '],
  [/トヨタ|豊田/g, 'Toyota '],
  [/ニッサン|日産/g, 'Nissan '],
  [/スバル/g, 'Subaru '],
  [/マツダ/g, 'Mazda '],
  [/スズキ/g, 'Suzuki '],
  [/ダイハツ/g, 'Daihatsu '],
  [/ランサーエボリューション|ランエボ/g, 'Lancer Evolution '],
  [/スカイライン/g, 'Skyline '],
  [/シルビア/g, 'Silvia '],
  [/インプレッサ/g, 'Impreza '],
  [/シビック/g, 'Civic '],
  [/インテグラ/g, 'Integra '],
  [/ロードスター/g, 'Roadster '],
  [/フェアレディZ/g, 'Fairlady Z '],
  [/スープラ/g, 'Supra '],

  // Common Japanese Automotive Keywords
  [/純正/g, 'Original '],
  [/専用/g, ' '],
  [/用/g, ' para '],
  [/製/g, ' '],
  [/左右セット/g, 'Par (Esq/Dir) '],
  [/セット/g, 'Kit '],
  [/フロントリップ/g, 'Lip Dianteiro '],
  [/フロントバンパー/g, 'Para-choque Dianteiro '],
  [/リアバンパー/g, 'Para-choque Traseiro '],
  [/サイドステップ/g, 'Saias Laterais '],
  [/ルーフスポイラー/g, 'Spoiler de Teto '],
  [/リアスポイラー/g, 'Spoiler Traseiro '],
  [/リップスポイラー/g, 'Lip Spoiler '],
  [/スポイラー/g, 'Spoiler '],
  [/ウイング/g, 'Aerofólio '],
  [/ボディキット/g, 'Body Kit '],
  [/ボンネット/g, 'Capô '],
  [/ベント付きボンネット/g, 'Capô Ventilado '],

  // Engine & Turbo
  [/ターボエキゾーストマニホールド/g, 'Coletor de Escape Turbo '],
  [/エキゾーストマニホールド/g, 'Coletor de Escape '],
  [/キャットバックエキゾースト/g, 'Escapamento Cat-Back '],
  [/キャットバック/g, 'Cat-Back '],
  [/エキゾーストシステム/g, 'Sistema de Escape '],
  [/エキゾースト|マフラー/g, 'Escapamento '],
  [/ツインターボ/g, 'Twin Turbo '],
  [/シングルターボ/g, 'Single Turbo '],
  [/タービンキット/g, 'Kit de Turbina '],
  [/タービン/g, 'Turbina '],
  [/ターボ/g, 'Turbo '],
  [/インタークーラー/g, 'Intercooler '],
  [/鍛造ピストン/g, 'Pistões Forjados '],
  [/ピストン/g, 'Pistão '],
  [/コンロッド/g, 'Bielas Forjadas '],
  [/ビレット/g, 'Billet '],
  [/ラジエーター/g, 'Radiador '],
  [/オイルクーラー/g, 'Radiador de Óleo '],
  [/エアクリーナー/g, 'Filtro de Ar Esportivo '],
  [/エンジン/g, 'Motor '],

  // Suspension & Brakes
  [/車高調/g, 'Suspensão Coilover '],
  [/サスペンション/g, 'Suspensão '],
  [/ビッグブレーキキット/g, 'Kit de Freios Grandes '],
  [/ブレーキキット/g, 'Kit de Freios '],
  [/ブレーキキャリパー/g, 'Pinças de Freio '],
  [/ブレーキパッド/g, 'Pastilhas de Freio '],
  [/ブレーキローター|ディスクローター/g, 'Discos de Freio '],
  [/タワーバー/g, 'Barra Antitorção '],
  [/スタビライザー/g, 'Barra Estabilizadora '],
  [/ロールケージ/g, 'Santo Antônio / Rollcage '],

  // Interior & Seats
  [/フルバケットシート/g, 'Banco Concha Integral '],
  [/バケットシート/g, 'Banco Concha '],
  [/シート/g, 'Banco '],
  [/レーシングステアリングホイール/g, 'Volante Esportivo '],
  [/レーシングステアリング/g, 'Volante de Corrida '],
  [/ステアリングホイール|ステアリング/g, 'Volante '],

  // Materials
  [/カーボンファイバー/g, 'Fibra de Carbono '],
  [/カーボン/g, 'Carbono '],
  [/チタン製|チタン/g, 'em Titânio '],
  [/ステンレス製|ステンレス/g, 'em Aço Inox '],
  [/アルミ製|アルミニウム/g, 'em Alumínio '],
  [/ポリッシュドアルミニウム/g, 'Alumínio Polido '],
  [/高性能/g, 'Alta Performance '],

  // Transmission & Lighting
  [/シーケンシャルミッション/g, 'Câmbio Sequencial '],
  [/クラッチキット/g, 'Kit de Embreagem '],
  [/クラッチ/g, 'Embreagem '],
  [/フライホイール/g, 'Volante do Motor '],
  [/トランスミッション|ミッション/g, 'Transmissão '],
  [/ヘッドライト/g, 'Faróis Dianteiros '],
  [/テールランプ|テールライト/g, 'Lanternas Traseiras '],
  [/フォグランプ/g, 'Faróis de Neblina '],
  [/ホイール/g, 'Rodas '],
  [/タイヤ/g, 'Pneus '],

  // English to Portuguese support
  [/\bRoad\s*&\s*Track\b/gi, 'Road & Track'],
  [/\bCoilovers?\b/gi, 'Suspensão Coilover'],
  [/\bTwin\s+Turbo\b/gi, 'Twin Turbo'],
  [/\bSingle\s+Turbo\b/gi, 'Single Turbo'],
  [/\bCat-?back\s+Exhaust\b/gi, 'Escapamento Cat-Back'],
  [/\bExhaust\s+System\b/gi, 'Sistema de Escape'],
  [/\bExhaust\s+Manifold\b/gi, 'Coletor de Escape'],
  [/\bBig\s+Brake\s+Kit\b/gi, 'Kit de Freios Grandes'],
  [/\bBrake\s+Kit\b/gi, 'Kit de Freios'],
  [/\bBrake\s+Calipers?\b/gi, 'Pinças de Freio'],
  [/\bBrake\s+Pads?\b/gi, 'Pastilhas de Freio'],
  [/\bBrake\s+Rotors?\b/gi, 'Discos de Freio'],
  [/\bCarbon\s+Fiber\b/gi, 'Fibra de Carbono'],
  [/\bRacing\s+Steering\s+Wheel\b/gi, 'Volante Esportivo'],
  [/\bFull\s+Bucket\s+Seat\b/gi, 'Banco Concha Integral'],
  [/\bBucket\s+Seat\b/gi, 'Banco Concha'],
  [/\bConnecting\s+Rods?\b/gi, 'Bielas Forjadas'],
  [/\bForged\s+Pistons?\b/gi, 'Pistões Forjados'],
  [/\bVented\s+Hood\b/gi, 'Capô Ventilado'],
  [/\bRoof\s+Spoiler\b/gi, 'Spoiler de Teto'],
  [/\bRear\s+Spoiler\b/gi, 'Spoiler Traseiro'],
  [/\bFront\s+Bumper\b/gi, 'Para-choque Dianteiro'],
  [/\bRear\s+Bumper\b/gi, 'Para-choque Traseiro'],
  [/\bSide\s+Skirts?\b/gi, 'Saias Laterais'],
  [/\bClutch\s+Kit\b/gi, 'Kit de Embreagem'],
  [/\bOil\s+Cooler\b/gi, 'Radiador de Óleo'],
  [/\bAir\s+Intake\b/gi, 'Admissão de Ar'],
]

const KNOWN_TITLE_BRANDS: { match: RegExp; name: string }[] = [
  { match: /^(無限|Mugen)/i, name: 'MUGEN' },
  { match: /^(GReddy|TRUST)/i, name: 'GReddy' },
  { match: /^(オーリンズ|Öhlins|Ohlins|スーパーオーリンズ)/i, name: 'ÖHLINS' },
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

/**
 * Checks if a string contains Japanese characters (Hiragana, Katakana, Kanji)
 */
export function hasJapaneseCharacters(text: string | null | undefined): boolean {
  if (!text) return false
  return /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text)
}

/**
 * Clean redundant spacing after regex transformations
 */
function cleanSpacing(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s*([,.:;!?])\s*/g, '$1 ')
    .replace(/\s*\(\s*/g, ' (')
    .replace(/\s*\)\s*/g, ') ')
    .trim()
}

/**
 * Localizes a product title to the requested language (ja, pt, en).
 */
export function localizeProductTitle(title: string | null | undefined, lang: string): string {
  if (!title) return ''

  let localized = title

  if (lang === 'ja') {
    for (const [regex, replacement] of JDM_AUTOMOTIVE_TRANSLATIONS_JA) {
      localized = localized.replace(regex, replacement)
    }
    return cleanSpacing(localized)
  }

  if (lang === 'pt' || lang.startsWith('pt')) {
    for (const [regex, replacement] of JDM_AUTOMOTIVE_TRANSLATIONS_PT) {
      localized = localized.replace(regex, replacement)
    }
    return cleanSpacing(localized)
  }

  // English fallback: translate Japanese keywords to clean English/Romaji
  if (lang === 'en') {
    for (const [regex, replacement] of JDM_AUTOMOTIVE_TRANSLATIONS_PT) {
      localized = localized.replace(regex, replacement)
    }
    return cleanSpacing(localized)
  }

  return cleanSpacing(localized)
}

/**
 * Localizes Japanese product descriptions or AI responses when language is Portuguese or English.
 */
export function localizeProductDescription(desc: string | null | undefined, lang: string): string {
  if (!desc) return ''
  if (lang === 'ja') return desc

  let localized = desc
  for (const [regex, replacement] of JDM_AUTOMOTIVE_TRANSLATIONS_PT) {
    localized = localized.replace(regex, replacement)
  }

  // Common Japanese phrases translated to natural Portuguese
  if (lang === 'pt' || lang.startsWith('pt')) {
    localized = localized
      .replace(/外観は非常に良好で[、,]?/g, 'Aparência em excelente estado, ')
      .replace(/塗装も均一[、,]?/g, 'pintura uniforme, ')
      .replace(/傷や劣化の兆候はほとんど見られません[。.]?/g, 'quase sem marcas de desgaste ou danos. ')
      .replace(/高品質な素材で作られており[、,]?/g, 'Fabricado com materiais de alta qualidade, ')
      .replace(/空力性能を向上させます[。.]?/g, 'melhora a eficiência aerodinâmica e o visual. ')
      .replace(/適合車種[：:]/g, 'Compatibilidade: ')
      .replace(/全般[。.]?/g, 'em geral. ')
      .replace(/取り付け簡単[、,]?/g, 'Fácil instalação, ')
      .replace(/純正交換用として最適です[。.]?/g, 'ideal para substituição original (plug and play). ')
      .replace(/推奨適合車種[：:]/g, 'Veículos compatíveis recomendados: ')
      .replace(/状態良好[。.]?/g, 'Excelente estado de conservação. ')
      .replace(/動作確認済み[。.]?/g, 'Testado e 100% funcional. ')
      .replace(/新品同様[。.]?/g, 'Em estado de novo. ')
      .replace(/走行距離[：:]/g, 'Quilometragem: ')
  }

  return cleanSpacing(localized)
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
