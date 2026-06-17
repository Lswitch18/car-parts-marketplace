import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../lib/i18n';
import { useAuthStore } from '../../stores/authStore';
import { Navigate } from 'react-router-dom';
import { 
  Star, Trash2, Search, Filter, MessageSquare, 
  ThumbsUp, ThumbsDown, MessageCircle, DollarSign,
  AlertOctagon, ShieldAlert, Check
} from 'lucide-react';

export default function ReviewManagement() {
  const { user: currentUser } = useAuthStore();
  const { t } = useI18n();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom Filter type: 'all' | 'compliment' (4-5 stars) | 'neutral' (3 stars) | 'complaint' (1-2 stars)
  const [activeFilter, setActiveFilter] = useState<'all' | 'compliment' | 'neutral' | 'complaint'>('all');

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          reviewer:profiles!reviewer_id(full_name, email),
          reviewee:profiles!reviewee_id(full_name, email),
          transaction:transactions(id, amount)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading reviews.');
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!window.confirm(t('Tem certeza que deseja excluir esta avaliação permanentemente?'))) return;
    try {
      setError(null);
      setSuccessMsg(null);
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);
      
      if (error) throw error;
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      showFlashSuccess(t('Avaliação excluída com sucesso.'));
    } catch (err: any) {
      setError(err.message || 'Falha ao excluir a avaliação.');
    }
  };

  const showFlashSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Stats calculation
  const totalCount = reviews.length;
  const avgRating = totalCount > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1)
    : '0.0';

  const complimentCount = reviews.filter(r => r.rating >= 4).length;
  const neutralCount = reviews.filter(r => r.rating === 3).length;
  const complaintCount = reviews.filter(r => r.rating <= 2).length;

  // Filter reviews
  const filteredReviews = reviews.filter(r => {
    // 1. Filter by category
    if (activeFilter === 'compliment' && r.rating < 4) return false;
    if (activeFilter === 'neutral' && r.rating !== 3) return false;
    if (activeFilter === 'complaint' && r.rating > 2) return false;

    // 2. Filter by search term
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const reviewer = Array.isArray(r.reviewer) ? r.reviewer[0] : r.reviewer;
    const reviewee = Array.isArray(r.reviewee) ? r.reviewee[0] : r.reviewee;

    const reviewerName = (reviewer?.full_name || '').toLowerCase();
    const reviewerEmail = (reviewer?.email || '').toLowerCase();
    const revieweeName = (reviewee?.full_name || '').toLowerCase();
    const revieweeEmail = (reviewee?.email || '').toLowerCase();
    const commentText = (r.comment || '').toLowerCase();

    return (
      reviewerName.includes(term) ||
      reviewerEmail.includes(term) ||
      revieweeName.includes(term) ||
      revieweeEmail.includes(term) ||
      commentText.includes(term)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-10 h-10 border-4 border-black border-t-transparent rounded-full" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">{t('Carregando Avaliações...')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8 font-sans antialiased text-black">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-black/15 pb-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">{t('Painel de Controle')}</span>
          <h1 className="text-4xl font-black uppercase tracking-tight text-black mt-1">
            {t('Moderação de Avaliações')}
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            {t('Acompanhe a reputação dos usuários, elogios, reclamações e modere comentários inapropriados.')}
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="max-w-7xl mx-auto bg-red-50 border-2 border-black text-black p-4 mb-6 rounded-lg flex items-start gap-3 animate-in fade-in duration-200">
          <ShieldAlert className="text-red-600 shrink-0 mt-0.5" size={18} />
          <div>
            <span className="font-bold text-xs uppercase tracking-wider block mb-0.5">{t('Erro')}</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="max-w-7xl mx-auto bg-slate-100 border-2 border-black text-black p-4 mb-6 rounded-lg flex items-start gap-3 animate-in fade-in duration-200">
          <Check className="text-black shrink-0 mt-0.5" size={18} strokeWidth={3} />
          <div>
            <span className="font-bold text-xs uppercase tracking-wider block mb-0.5">{t('Sucesso')}</span>
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        </div>
      )}

      {/* KPI Stats Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total Card */}
        <div className="bg-white border-2 border-black rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{t('Total Geral')}</span>
            <MessageSquare size={16} className="text-black" />
          </div>
          <p className="text-3xl font-black text-black">{totalCount}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase mt-1.5">{t('Avaliações registradas')}</p>
        </div>

        {/* Average Card */}
        <div className="bg-white border-2 border-black rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{t('Média de Satisfação')}</span>
            <Star size={16} className="text-amber-500 fill-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-black">{avgRating}</p>
            <span className="text-xs font-bold text-slate-400">/ 5.0</span>
          </div>
          <div className="flex gap-0.5 mt-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                size={10} 
                className={i < Math.round(Number(avgRating)) ? 'text-amber-500 fill-amber-500' : 'text-slate-200'} 
              />
            ))}
          </div>
        </div>

        {/* Elogios Card */}
        <button 
          onClick={() => setActiveFilter('compliment')}
          className={`text-left bg-white border-2 border-black rounded-xl p-5 shadow-sm transition-all focus:outline-none hover:-translate-y-0.5 ${activeFilter === 'compliment' ? 'ring-4 ring-black/10 bg-green-50/20' : ''}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{t('Elogios')}</span>
            <ThumbsUp size={16} className="text-black" />
          </div>
          <p className="text-3xl font-black text-black">{complimentCount}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase mt-1.5">★ 4 e 5 {t('estrelas')}</p>
        </button>

        {/* Reclamações Card */}
        <button 
          onClick={() => setActiveFilter('complaint')}
          className={`text-left bg-white border-2 border-black rounded-xl p-5 shadow-sm transition-all focus:outline-none hover:-translate-y-0.5 ${activeFilter === 'complaint' ? 'ring-4 ring-black/10 bg-red-50/20' : ''}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{t('Reclamações')}</span>
            <ThumbsDown size={16} className="text-black" />
          </div>
          <p className="text-3xl font-black text-black">{complaintCount}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase mt-1.5">★ 1 e 2 {t('estrelas')}</p>
        </button>

      </div>

      {/* Filter and Search Bar Container */}
      <div className="max-w-7xl mx-auto bg-white border-2 border-black rounded-xl p-4 mb-8 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="flex items-center bg-slate-50 rounded-lg px-3 py-2 border-2 border-black flex-1 max-w-lg">
          <Search size={16} className="text-slate-400 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder={t('Buscar por autor, avaliado ou comentário...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-black text-xs w-full font-bold placeholder:text-slate-400"
          />
        </div>

        {/* Filters Selectors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border-2 border-black transition-all ${activeFilter === 'all' ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-50'}`}
          >
            {t('Todos')} ({totalCount})
          </button>
          <button 
            onClick={() => setActiveFilter('compliment')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border-2 border-black transition-all ${activeFilter === 'compliment' ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-50'}`}
          >
            {t('Elogios')} ({complimentCount})
          </button>
          <button 
            onClick={() => setActiveFilter('neutral')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border-2 border-black transition-all ${activeFilter === 'neutral' ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-50'}`}
          >
            {t('Neutros')} ({neutralCount})
          </button>
          <button 
            onClick={() => setActiveFilter('complaint')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border-2 border-black transition-all ${activeFilter === 'complaint' ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-50'}`}
          >
            {t('Reclamações')} ({complaintCount})
          </button>
        </div>
      </div>

      {/* Review List */}
      <div className="max-w-7xl mx-auto space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white border-2 border-black rounded-xl p-10 text-center text-slate-500 font-bold">
            <MessageCircle className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-sm">{t('Nenhuma avaliação correspondente aos filtros foi encontrada.')}</p>
          </div>
        ) : (
          filteredReviews.map((review) => {
            const reviewer = Array.isArray(review.reviewer) ? review.reviewer[0] : review.reviewer;
            const reviewee = Array.isArray(review.reviewee) ? review.reviewee[0] : review.reviewee;

            // Classify rating
            let ratingType: 'compliment' | 'neutral' | 'complaint' = 'neutral';
            if (review.rating >= 4) ratingType = 'compliment';
            if (review.rating <= 2) ratingType = 'complaint';

            return (
              <div 
                key={review.id} 
                className="bg-white border-2 border-black rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row items-stretch justify-between gap-6"
              >
                
                {/* Info Container */}
                <div className="space-y-3.5 flex-1 min-w-0">
                  
                  {/* Rating Stars and Badge */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex text-amber-500 gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-200'} 
                        />
                      ))}
                    </div>

                    {/* Classification Badge */}
                    {ratingType === 'compliment' && (
                      <span className="bg-green-100 text-green-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-green-300">
                        {t('Elogio')}
                      </span>
                    )}
                    {ratingType === 'neutral' && (
                      <span className="bg-yellow-100 text-yellow-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-yellow-300">
                        {t('Neutro')}
                      </span>
                    )}
                    {ratingType === 'complaint' && (
                      <span className="bg-red-100 text-red-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-red-300">
                        {t('Reclamação')}
                      </span>
                    )}

                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(review.created_at).toLocaleString()}
                    </span>
                  </div>

                  {/* Comment */}
                  <div className="bg-slate-50 border border-black/10 rounded-xl p-4 relative">
                    <p className="text-sm font-medium italic text-black pr-4 leading-relaxed">
                      "{review.comment || t('Sem comentário adicional.')}"
                    </p>
                  </div>

                  {/* Participants */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    
                    {/* Reviewer / Autor */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-black/15 flex items-center justify-center font-black text-xs shrink-0">
                        {(reviewer?.full_name || 'U')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block leading-none">{t('Autor')}</span>
                        <span className="text-xs font-black text-black truncate block mt-0.5">{reviewer?.full_name || t('Sem nome')}</span>
                        <span className="text-[10px] font-bold text-slate-500 truncate block leading-tight">{reviewer?.email}</span>
                      </div>
                    </div>

                    {/* Reviewee / Avaliado */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-black/15 flex items-center justify-center font-black text-xs shrink-0">
                        {(reviewee?.full_name || 'U')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block leading-none">{t('Destinatário')}</span>
                        <span className="text-xs font-black text-black truncate block mt-0.5">{reviewee?.full_name || t('Sem nome')}</span>
                        <span className="text-[10px] font-bold text-slate-500 truncate block leading-tight">{reviewee?.email}</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Actions & Details Sidebar of the card */}
                <div className="lg:w-48 flex flex-row lg:flex-col justify-between lg:justify-center items-center lg:items-end gap-3.5 border-t lg:border-t-0 lg:border-l border-black/15 pt-4 lg:pt-0 lg:pl-6 shrink-0">
                  
                  {/* Transaction amount */}
                  {review.transaction && (
                    <div className="text-left lg:text-right">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block leading-none">{t('Transação Relacionada')}</span>
                      <span className="text-xs font-black text-black mt-1 flex items-center gap-0.5 justify-start lg:justify-end">
                        <DollarSign size={10} className="shrink-0" />
                        {(review.transaction.amount || 0).toLocaleString('ja-JP')}
                      </span>
                    </div>
                  )}

                  {/* Moderate delete button */}
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="bg-white hover:bg-red-50 text-red-600 px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all border-2 border-red-200 hover:border-red-400 flex items-center gap-1.5 shadow-sm"
                  >
                    <Trash2 size={12} />
                    {t('Excluir')}
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
