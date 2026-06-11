import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { useI18n } from '../lib/i18n'
import ParticleField from '../components/ParticleField'
import { useNavigate } from 'react-router-dom'
import {
  Gavel, Clock, TrendingUp, User, AlertTriangle, ArrowRight, X, ChevronRight, Zap, Timer, Star, Award, ShoppingBag, CreditCard
} from 'lucide-react'
import SafeImage from '../components/SafeImage'

interface AuctionItem {
  id: string
  title: string
  description: string
  starting_bid: number
  current_bid: number
  buy_now_price: number | null
  condition: string
  images: string[]
  auction_end: string
  bid_count: number
  time_remaining: number
  status: string
  winner_id: string | null
  brand?: { name: string; logo_url: string }
  category?: { name: string }
  seller?: { id: string; full_name: string; rating: number }
}

interface RecentBid {
  id: string
  amount: number
  created_at: string
  bidder?: { id: string; full_name: string; avatar_url?: string }
}

const CONDITION_COLORS: Record<string, string> = {
  new: '#00D97E',
  like_new: '#00E5FF',
  excellent: '#0D75FF',
  good: '#FFB800',
  fair: '#FF8C00',
}

export default function Auctions() {
  const { t } = useI18n()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [auctions, setAuctions] = useState<AuctionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [globalFeed, setGlobalFeed] = useState<{ text: string; ts: number }[]>([])

  // Modal
  const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(null)
  const [bidAmount, setBidAmount] = useState('')
  const [bidError, setBidError] = useState<string | null>(null)
  const [bidSuccess, setBidSuccess] = useState<string | null>(null)
  const [recentBids, setRecentBids] = useState<RecentBid[]>([])
  const [submittingBid, setSubmittingBid] = useState(false)
  const bidInputRef = useRef<HTMLInputElement>(null)
  const feedRef = useRef<HTMLDivElement>(null)

  // ─── Flash state for price animations ─────────────────────
  const [priceFlash, setPriceFlash] = useState(false)
  const [bidCountFlash, setBidCountFlash] = useState(false)
  const prevBidRef = useRef(0)
  const prevCountRef = useRef(0)
  const [newBidIds, setNewBidIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!selectedAuction) return
    if (prevBidRef.current !== 0 && selectedAuction.current_bid !== prevBidRef.current) {
      setPriceFlash(true)
      setTimeout(() => setPriceFlash(false), 500)
    }
    if (prevCountRef.current !== 0 && selectedAuction.bid_count !== prevCountRef.current) {
      setBidCountFlash(true)
      setTimeout(() => setBidCountFlash(false), 500)
    }
    prevBidRef.current = selectedAuction.current_bid
    prevCountRef.current = selectedAuction.bid_count
  }, [selectedAuction?.current_bid, selectedAuction?.bid_count])

  // ─── Fetch auctions ───────────────────────────────────────────
  const fetchAuctions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.auctions.active() as AuctionItem[]
      setAuctions(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar leilões')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAuctions() }, [])

  // ─── Real-time subscriptions ──────────────────────────────────
  useEffect(() => {
    const bidChannel = supabase
      .channel('auctions-live-bids')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids' }, (payload) => {
        const b = payload.new as { id: string; part_id: string; amount: number; bidder_id: string }
        setAuctions(prev => prev.map(a => a.id === b.part_id ? {
          ...a, current_bid: b.amount, bid_count: a.bid_count + 1
        } : a))
        setGlobalFeed(prev => [
          { text: `🔨 Novo lance: ¥${b.amount.toLocaleString('ja-JP')}`, ts: Date.now() },
          ...prev.slice(0, 6)
        ])
        if (selectedAuction?.id === b.part_id) {
          setNewBidIds(prev => new Set(prev).add(b.id))
          setTimeout(() => setNewBidIds(prev => { const n = new Set(prev); n.delete(b.id); return n }), 3000)
          setSelectedAuction(prev => prev ? { ...prev, current_bid: b.amount, bid_count: prev.bid_count + 1 } : null)
          loadAuctionDetails(b.part_id)
        }
      })
      .subscribe()

    const partChannel = supabase
      .channel('auctions-parts-update')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'parts' }, (payload) => {
        const p = payload.new as { id: string; status: string }
        if (p.status !== 'active') {
          setAuctions(prev => prev.filter(a => a.id !== p.id))
          if (selectedAuction?.id === p.id) setSelectedAuction(null)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(bidChannel); supabase.removeChannel(partChannel) }
  }, [selectedAuction])

  // ─── Countdown timer ─────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setAuctions(prev => prev.map(a => ({ ...a, time_remaining: new Date(a.auction_end).getTime() - Date.now() })).filter(a => a.time_remaining > 0))
      if (selectedAuction) {
        const t = new Date(selectedAuction.auction_end).getTime() - Date.now()
        setSelectedAuction(prev => prev ? { ...prev, time_remaining: t } : null)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [selectedAuction])

  const loadAuctionDetails = async (id: string) => {
    try {
      const d = await api.auctions.get(id) as any
      if (d?.bids) setRecentBids([...d.bids].sort((a: any, b: any) => b.amount - a.amount))
    } catch {}
  }

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedAuction) return
    setBidError(null); setBidSuccess(null); setSubmittingBid(true)
    const amt = parseFloat(bidAmount)
    const min = Math.ceil(selectedAuction.current_bid * 1.05)
    if (isNaN(amt) || amt < min) {
      setBidError(`Lance mínimo: ¥${min.toLocaleString('ja-JP')}`); setSubmittingBid(false); return
    }
    try {
      await api.auctions.bid({ auction_id: selectedAuction.id, amount: amt })
      setBidSuccess('✅ Lance registrado com sucesso!')
      setBidAmount('')
      loadAuctionDetails(selectedAuction.id)
    } catch (err: any) { setBidError(err.message || 'Erro ao enviar lance.') }
    finally { setSubmittingBid(false) }
  }

  // ─── Buy Now ────────────────────────────────────────────────
  const [buying, setBuying] = useState(false)
  const handleBuyNow = async (auction: AuctionItem) => {
    if (!user) { navigate('/login'); return }
    setBuying(true)
    try {
      const result = await api.auctions.buyNow({ auction_id: auction.id }) as any
      const tx = result.transaction
      const checkout = await api.stripe.createCheckout({
        transaction_id: tx.id,
        part_id: auction.id,
        buyer_id: user.id,
        seller_id: auction.seller?.id || '',
        amount: auction.buy_now_price!,
        auction_id: auction.id,
        title: `Comprar Agora - ${auction.title}`,
      })
      window.location.href = checkout.url
    } catch (err: any) {
      alert(err.message || 'Erro ao processar compra')
    } finally { setBuying(false) }
  }

  // ─── Pay for won auction ───────────────────────────────────
  const handlePayWinner = async (auction: AuctionItem) => {
    if (!user) { navigate('/login'); return }
    try {
      const { data: transactions } = await api.transactions.list({ role: 'buyer', status: 'pending' }) as any
      const tx = transactions?.find((t: any) => t.part_id === auction.id)
      if (!tx) { alert('Transação não encontrada'); return }
      const checkout = await api.stripe.createCheckout({
        transaction_id: tx.id,
        part_id: auction.id,
        buyer_id: user.id,
        seller_id: auction.seller?.id || '',
        amount: auction.current_bid,
        auction_id: auction.id,
        title: `Pagamento - ${auction.title}`,
      })
      window.location.href = checkout.url
    } catch (err: any) {
      alert(err.message || 'Erro ao redirecionar para pagamento')
    }
  }

  // ─── Formatters ───────────────────────────────────────────────
  const formatTime = (ms: number) => {
    if (ms <= 0) return 'Encerrado'
    const s = Math.floor((ms / 1000) % 60)
    const m = Math.floor((ms / 60000) % 60)
    const h = Math.floor((ms / 3600000) % 24)
    const d = Math.floor(ms / 86400000)
    return d > 0
      ? `${d}d ${h.toString().padStart(2,'0')}h ${m.toString().padStart(2,'0')}m`
      : `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
  }

  const isEndingSoon = (ms: number) => ms > 0 && ms < 10 * 60 * 1000

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      {/* Grid overlay + glows */}
      <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none z-0" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse, rgba(13,117,255,0.10) 0%, transparent 65%)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse, rgba(112,0,255,0.08) 0%, transparent 65%)' }} />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div className="relative flex flex-col items-center justify-center text-center pt-28 pb-16 px-4 overflow-hidden min-h-[480px]">
        {/* Particle field */}
        <ParticleField />

        {/* Scan line */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.06]">
          <div
            className="absolute left-1/2 w-[2px] h-[200px] -translate-x-1/2 bg-gradient-to-b from-transparent via-[#00E5FF] to-transparent animate-scan-line"
          />
        </div>

        {/* ambient light balls — now floating */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[#0D75FF]/10 blur-[120px] pointer-events-none animate-float-slow" style={{ animationDelay: '0s' }} />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] rounded-full bg-[#7000FF]/10 blur-[100px] pointer-events-none animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-[#00E5FF]/5 blur-[80px] pointer-events-none animate-float-slow" style={{ animationDelay: '0.8s' }} />

        {/* Live badge */}
        <div
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-6 text-xs font-bold uppercase tracking-widest animate-glow-ring"
          style={{
            background: 'rgba(13,117,255,0.12)',
            border: '1px solid rgba(13,117,255,0.3)',
            color: '#00E5FF',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 0 16px rgba(0,229,255,0.15)',
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E5FF]" />
          </span>
          Transmissão Ao Vivo · {auctions.length} {t('Ativos')}
        </div>

        <h1
          className="font-display font-black mb-4 leading-none tracking-tight"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}
        >
          <span
            className="animate-gradient-shift"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #C8D8F4 25%, #0D75FF 50%, #C8D8F4 75%, #FFFFFF 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Leilões{' '}
          </span>
          <span
            className="animate-gradient-shift"
            style={{
              background: 'linear-gradient(135deg, #00E5FF 0%, #0D75FF 30%, #7000FF 50%, #0D75FF 70%, #00E5FF 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animationDelay: '0.3s',
            }}
          >
            Ao Vivo
          </span>
        </h1>
        <p className="text-text-secondary text-base md:text-xl max-w-2xl leading-relaxed">
          Dispute em tempo real as peças automotivas mais raras do Japão.{' '}
          <span style={{ color: '#0D75FF' }}>Lances atualizam instantaneamente</span> para todos os participantes.
        </p>

        {/* Global feed ticker */}
        {globalFeed.length > 0 && (
          <div
            className="mt-8 flex items-center gap-3 px-5 py-2.5 rounded-xl text-sm"
            style={{
              background: 'rgba(13,117,255,0.07)',
              border: '1px solid rgba(13,117,255,0.15)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Zap className="w-4 h-4 text-[#FFB800] flex-shrink-0 animate-pulse" />
            <span style={{ color: '#B0B5C0' }}>{globalFeed[0].text}</span>
          </div>
        )}
      </div>

      {/* ── CONTENT ──────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-[#0D75FF]/20" />
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#0D75FF]"
                style={{ animation: 'spin 1s linear infinite' }}
              />
              <div className="absolute inset-3 rounded-full bg-[#0D75FF]/10 flex items-center justify-center">
                <Gavel className="w-4 h-4 text-[#0D75FF]" />
              </div>
            </div>
            <p className="text-text-secondary text-sm font-medium tracking-wide">Sincronizando feed ao vivo...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div
            className="max-w-lg mx-auto p-8 rounded-2xl text-center"
            style={{ background: 'rgba(255,75,75,0.05)', border: '1px solid rgba(255,75,75,0.2)' }}
          >
            <AlertTriangle className="w-14 h-14 text-[#FF4B4B] mx-auto mb-4" />
            <p className="text-white font-bold text-lg mb-2">Não foi possível carregar</p>
            <p className="text-text-secondary text-sm mb-6">{error}</p>
            <button onClick={fetchAuctions} className="btn-neon">Tentar Novamente</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && auctions.length === 0 && (
          <div
            className="max-w-xl mx-auto p-14 rounded-2xl text-center"
            style={{ background: 'rgba(13,117,255,0.04)', border: '1px solid rgba(13,117,255,0.12)' }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(13,117,255,0.1)', border: '1px solid rgba(13,117,255,0.2)' }}
            >
              <Gavel className="w-9 h-9 text-[#0D75FF]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhum leilão ativo</h3>
            <p className="text-text-secondary text-sm mb-8">Seja o primeiro a anunciar sua peça no leilão ao vivo.</p>
            <Link to="/create-listing" className="btn-neon">Anunciar Peça</Link>
          </div>
        )}

        {/* ── GRID ───────────────────────────────────────────── */}
        {!loading && !error && auctions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {auctions.map((auction, idx) => {
              const soon = isEndingSoon(auction.time_remaining)
              const condColor = CONDITION_COLORS[auction.condition] || '#6B7280'
              return (
                <div
                  key={auction.id}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 card"
                  style={{
                    animationDelay: `${idx * 80}ms`,
                    border: soon ? '1px solid rgba(255,75,75,0.4)' : 'var(--border-subtle)',
                    boxShadow: soon
                      ? '0 0 24px rgba(255,75,75,0.12)'
                      : '0 4px 24px rgba(0,0,0,0.5)',
                  }}
                  onClick={() => { setSelectedAuction(auction); loadAuctionDetails(auction.id); setBidError(null); setBidSuccess(null) }}
                >
                  {/* Neon top edge accent */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[1px]"
                    style={{
                      background: soon
                        ? 'linear-gradient(90deg, transparent, rgba(255,75,75,0.7), transparent)'
                        : 'linear-gradient(90deg, transparent, rgba(13,117,255,0.5), rgba(0,229,255,0.3), transparent)',
                    }}
                  />

                  {/* Image */}
                  <div className="relative aspect-video bg-[#050508] overflow-hidden">
                    <SafeImage
                      src={auction.images?.[0]}
                      alt={auction.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      fallback={<div className="w-full h-full flex items-center justify-center"><Gavel className="w-10 h-10 text-[#1e1e2e]" /></div>}
                    />

                    {/* Dark overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent opacity-80" />

                    {/* Timer chip */}
                    <div
                      className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold backdrop-blur-md"
                      style={{
                        background: soon ? 'rgba(255,75,75,0.25)' : 'rgba(0,0,0,0.65)',
                        border: soon ? '1px solid rgba(255,75,75,0.5)' : '1px solid rgba(255,255,255,0.1)',
                        color: soon ? '#FF4B4B' : '#00E5FF',
                        animation: soon ? 'daig-pulse 1.2s ease-in-out infinite' : 'none',
                      }}
                    >
                      <Timer className="w-3 h-3" />
                      {formatTime(auction.time_remaining)}
                    </div>

                    {/* Condition chip */}
                    <div
                      className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider"
                      style={{
                        background: `${condColor}18`,
                        border: `1px solid ${condColor}50`,
                        color: condColor,
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      {auction.condition}
                    </div>

                    {/* Bid count badge bottom-right */}
                    <div
                      className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{ background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.08)', color: '#B0B5C0' }}
                    >
                      <TrendingUp className="w-3 h-3 text-[#00D97E]" />
                      {auction.bid_count} lances
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    {/* Brand + Category */}
                    <div className="flex items-center gap-2 mb-2">
                      {auction.brand?.logo_url && (
                        <img src={auction.brand.logo_url} alt="" className="w-4 h-4 object-contain opacity-70 rounded" />
                      )}
                      <span className="text-[11px] text-text-muted font-semibold uppercase tracking-widest">
                        {auction.brand?.name || '—'} · {auction.category?.name || '—'}
                      </span>
                    </div>

                    <h3
                      className="font-display font-bold text-white mb-4 truncate transition-colors duration-200"
                      style={{ fontSize: '1.05rem' }}
                    >
                      {auction.title}
                    </h3>

                    {/* Seller row */}
                    <div className="flex items-center gap-2 mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #0D75FF, #7000FF)' }}
                      >
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs text-text-secondary truncate">{auction.seller?.full_name || 'Vendedor'}</span>
                      <div className="ml-auto flex items-center gap-0.5 text-[11px] text-[#FFB800]">
                        <Star className="w-3 h-3 fill-[#FFB800]" />
                        <span>{auction.seller?.rating?.toFixed(1) || '5.0'}</span>
                      </div>
                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Lance Atual</p>
                        <p
                          className="font-display font-extrabold"
                          style={{
                            fontSize: '1.5rem',
                            background: 'linear-gradient(135deg, #FFFFFF 0%, #C8D8F4 60%, #0D75FF 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }}
                        >
                          ¥{auction.current_bid?.toLocaleString('ja-JP')}
                        </p>
                      </div>
                      <button className="btn-neon text-sm px-4 py-2">
                        <Gavel className="w-3.5 h-3.5" />
                        <span>Dar Lance</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Buy now */}
                    {auction.buy_now_price && auction.status === 'active' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleBuyNow(auction) }}
                        disabled={buying}
                        className="mt-3 w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-xs cursor-pointer"
                        style={{ background: 'rgba(0,217,126,0.06)', border: '1px solid rgba(0,217,126,0.15)', color: '#00D97E' }}
                      >
                        <span className="flex items-center gap-1.5">
                          <ShoppingBag className="w-3 h-3" />
                          {buying ? 'Processando...' : 'Comprar Agora'}
                        </span>
                        <span className="font-bold">¥{auction.buy_now_price.toLocaleString('ja-JP')}</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── MODAL ─────────────────────────────────────────────── */}
      {selectedAuction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setSelectedAuction(null) } }}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl flex flex-col md:flex-row card"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              boxShadow: '0 0 60px rgba(13,117,255,0.15), 0 32px 80px rgba(0,0,0,0.8)',
              maxHeight: '92vh',
            }}
          >
            {/* Top neon edge */}
            <div
              className="absolute top-0 left-0 right-0 h-[1px] z-10"
              style={{ background: 'linear-gradient(90deg, transparent, #0D75FF, #00E5FF, #7000FF, transparent)' }}
            />

            {/* Close */}
            <button
              onClick={() => setSelectedAuction(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,75,75,0.15)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>

            {/* Left: Image + Description */}
            <div className="w-full md:w-[45%] flex flex-col" style={{ background: 'var(--bg-deep)' }}>
              <div className="relative flex-1 min-h-[220px] md:min-h-[300px] overflow-hidden">
                <SafeImage
                  src={selectedAuction.images?.[0]}
                  alt=""
                  className="w-full h-full object-cover"
                  fallback={<div className="w-full h-full flex items-center justify-center"><Gavel className="w-16 h-16 text-[#1e1e2e]" /></div>}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060609] via-transparent to-transparent opacity-60" />

                {/* Countdown over image */}
                <div
                  className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{
                    background: 'rgba(0,0,0,0.8)',
                    border: isEndingSoon(selectedAuction.time_remaining)
                      ? '1px solid rgba(255,75,75,0.5)'
                      : '1px solid rgba(0,229,255,0.2)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Clock
                      className="w-4 h-4"
                      style={{ color: isEndingSoon(selectedAuction.time_remaining) ? '#FF4B4B' : '#00E5FF' }}
                    />
                    <span className="text-xs text-text-secondary font-medium">Encerra em</span>
                  </div>
                  <span
                    className="font-display font-extrabold text-lg tabular-nums"
                    style={{
                      color: isEndingSoon(selectedAuction.time_remaining) ? '#FF4B4B' : '#00E5FF',
                      textShadow: isEndingSoon(selectedAuction.time_remaining)
                        ? '0 0 12px rgba(255,75,75,0.6)'
                        : '0 0 12px rgba(0,229,255,0.5)',
                    }}
                  >
                    {formatTime(selectedAuction.time_remaining)}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] text-text-muted uppercase tracking-widest font-semibold">
                    {selectedAuction.brand?.name} · {selectedAuction.category?.name}
                  </span>
                </div>
                <h2 className="font-display font-black text-2xl text-white mb-3 leading-tight">{selectedAuction.title}</h2>
                <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">{selectedAuction.description || 'Sem descrição disponível.'}</p>
              </div>
            </div>

            {/* Right: Bidding Panel */}
            <div className="w-full md:w-[55%] flex flex-col overflow-y-auto p-6 gap-6" style={{ maxHeight: '92vh' }}>

              {/* Stats */}
              <div
                className="grid grid-cols-2 gap-4 p-5 rounded-2xl"
                style={{ background: 'rgba(13,117,255,0.04)', border: '1px solid rgba(13,117,255,0.12)' }}
              >
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Lance Atual</p>
                  <p
                    className={`font-display font-black text-3xl tabular-nums ${priceFlash ? 'animate-price-flash' : ''}`}
                    style={{
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #C8D8F4 50%, #0D75FF 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    ¥{selectedAuction.current_bid?.toLocaleString('ja-JP')}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Total de Lances</p>
                  <p
                    className={`font-display font-black text-3xl tabular-nums ${bidCountFlash ? 'animate-price-flash' : ''}`}
                    style={{ color: '#00E5FF', textShadow: '0 0 16px rgba(0,229,255,0.4)' }}
                  >
                    {selectedAuction.bid_count}
                  </p>
                </div>
              </div>

              {/* Live Bids Feed */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E5FF]" />
                  </span>
                  Feed de Lances Ao Vivo
                </h3>
                <div ref={feedRef} className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {recentBids.length === 0 && (
                    <p className="text-xs text-text-muted text-center py-6">Nenhum lance ainda. Seja o primeiro!</p>
                  )}
                  {recentBids.map((bid, i) => {
                    const isNew = newBidIds.has(bid.id)
                    return (
                      <div
                        key={bid.id}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                          i < 3 ? 'animate-slide-in-right' : ''
                        }`}
                        style={{
                          animationDelay: `${i * 0.06}s`,
                          background: i === 0
                            ? 'linear-gradient(135deg, rgba(13,117,255,0.12) 0%, rgba(0,229,255,0.04) 100%)'
                            : isNew
                              ? 'rgba(0,229,255,0.06)'
                              : 'rgba(255,255,255,0.02)',
                          border: i === 0
                            ? '1px solid rgba(0,229,255,0.3)'
                            : isNew
                              ? '1px solid rgba(0,229,255,0.15)'
                              : '1px solid rgba(255,255,255,0.04)',
                          boxShadow: i === 0 ? '0 0 16px rgba(0,229,255,0.08)' : 'none',
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                            style={{
                              background: i === 0
                                ? 'linear-gradient(135deg, #00E5FF, #0D75FF)'
                                : 'linear-gradient(135deg, #0D75FF, #7000FF)',
                              boxShadow: i === 0 ? '0 0 8px rgba(0,229,255,0.4)' : 'none',
                            }}
                          >
                            {bid.bidder?.avatar_url ? (
                              <img src={bid.bidder.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white">{bid.bidder?.full_name || 'Licitante'}</p>
                            {i === 0 && (
                              <span
                                className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                                style={{ background: 'rgba(0,229,255,0.15)', color: '#00E5FF' }}
                              >
                                <Award className="w-2.5 h-2.5" />
                                Líder
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className="font-display font-bold text-sm tabular-nums"
                          style={{
                            color: i === 0 ? '#FFFFFF' : '#6B7280',
                            textShadow: i === 0 ? '0 0 8px rgba(255,255,255,0.2)' : 'none',
                          }}
                        >
                          ¥{bid.amount?.toLocaleString('ja-JP')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Input — conditional: winner pay / ended / active bid / login */}
              {(() => {
                const isEnded = selectedAuction.status === 'ended' || selectedAuction.status === 'sold' || selectedAuction.time_remaining <= 0
                const isWinner = user && selectedAuction.winner_id === user.id

                // Winner needs to pay
                if (user && isEnded && isWinner) {
                  return (
                    <div className="space-y-4">
                      <div
                        className="p-5 rounded-2xl text-center"
                        style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.2)' }}
                      >
                        <Award className="w-10 h-10 text-[#00E5FF] mx-auto mb-3" />
                        <p className="font-display font-bold text-white text-lg mb-1">🎉 Você venceu!</p>
                        <p className="text-text-secondary text-sm mb-5">
                          Complete o pagamento de <span className="text-white font-bold">¥{selectedAuction.current_bid.toLocaleString('ja-JP')}</span> para garantir sua peça.
                        </p>
                        <button
                          onClick={() => handlePayWinner(selectedAuction)}
                          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-display font-black text-lg transition-all duration-200"
                          style={{
                            background: 'linear-gradient(135deg, #00E5FF 0%, #0D75FF 100%)',
                            color: '#fff',
                            boxShadow: '0 0 24px rgba(0,229,255,0.4)',
                          }}
                        >
                          <CreditCard className="w-5 h-5" />
                          Pagar Agora
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                }

                // Ended no winner / ended with not-winner
                if (isEnded) {
                  return (
                    <div
                      className="p-6 rounded-2xl text-center"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <Clock className="w-8 h-8 text-text-muted mx-auto mb-3" />
                      <p className="text-text-secondary text-sm">Este leilão foi encerrado.</p>
                    </div>
                  )
                }

                // Active auction — bidding form
                if (user) {
                  return (
                    <form onSubmit={handlePlaceBid} className="space-y-3">
                      <div>
                        <label className="block text-xs text-text-secondary font-semibold mb-2 uppercase tracking-wider">
                          Seu Lance — Mín: ¥{Math.ceil(selectedAuction.current_bid * 1.05).toLocaleString('ja-JP')}
                        </label>
                        <div className="relative">
                          <span
                            className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg"
                            style={{ color: '#0D75FF' }}
                          >¥</span>
                            <input
                              ref={bidInputRef}
                              type="number"
                              required
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              placeholder={Math.ceil(selectedAuction.current_bid * 1.05).toString()}
                              className="w-full pl-10 pr-4 py-3.5 rounded-xl font-display font-bold text-xl text-white placeholder-[#333] focus:outline-none transition-all input-field"
                            />
                        </div>
                      </div>

                      {bidError && (
                        <div
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                          style={{ background: 'rgba(255,75,75,0.08)', border: '1px solid rgba(255,75,75,0.2)', color: '#FF4B4B' }}
                        >
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          {bidError}
                        </div>
                      )}

                      {bidSuccess && (
                        <div
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                          style={{ background: 'rgba(0,217,126,0.08)', border: '1px solid rgba(0,217,126,0.2)', color: '#00D97E' }}
                        >
                          {bidSuccess}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submittingBid}
                        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-display font-black text-lg transition-all duration-200"
                        style={{
                          background: submittingBid
                            ? 'rgba(13,117,255,0.3)'
                            : 'linear-gradient(135deg, #0D75FF 0%, #0050c2 100%)',
                          color: '#fff',
                          boxShadow: submittingBid ? 'none' : '0 0 24px rgba(13,117,255,0.4)',
                        }}
                        onMouseEnter={(e) => {
                          if (!submittingBid) (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(13,117,255,0.65)'
                        }}
                        onMouseLeave={(e) => {
                          if (!submittingBid) (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(13,117,255,0.4)'
                        }}
                      >
                        <Gavel className="w-5 h-5" />
                        {submittingBid ? 'Registrando...' : 'Dar Lance Ao Vivo'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )
                }

                // Not logged in
                return (
                  <div
                    className="p-6 rounded-2xl text-center"
                    style={{ background: 'rgba(13,117,255,0.05)', border: '1px solid rgba(13,117,255,0.15)' }}
                  >
                    <p className="text-text-secondary text-sm mb-4">Faça login para dar lances no leilão ao vivo.</p>
                    <Link to="/login" className="btn-neon w-full justify-center">
                      Fazer Login
                    </Link>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
