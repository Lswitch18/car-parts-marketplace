import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../lib/i18n';
import { useAuthStore } from '../../stores/authStore';
import { Navigate } from 'react-router-dom';

export default function ReviewManagement() {
  const { user: currentUser } = useAuthStore();
  const { t } = useI18n();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState('all');

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          reviewer:profiles!reviews_reviewer_id_fkey(full_name, email),
          reviewee:profiles!reviews_reviewee_id_fkey(full_name, email),
          transaction:transactions(id, amount)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!window.confirm(t('Tem certeza que deseja excluir esta avaliação?'))) return;
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);
      
      if (error) throw error;
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete review');
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (ratingFilter === 'all') return true;
    return r.rating === parseInt(ratingFilter);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="bg-surface border border-border rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="font-display text-2xl font-bold text-text">
            {t('Moderação de Avaliações')}
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-text-secondary text-sm">{t('Filtrar por nota:')}</span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-1 text-text text-sm focus:outline-none focus:border-primary"
            >
              <option value="all">{t('Todas')}</option>
              <option value="5">5 ★</option>
              <option value="4">4 ★</option>
              <option value="3">3 ★</option>
              <option value="2">2 ★</option>
              <option value="1">1 ★</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-surface border border-border rounded-lg p-4 text-center">
          <p className="text-text-secondary text-sm">{t('Total de avaliações')}</p>
          <p className="text-3xl font-bold text-text mt-1">{reviews.length}</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 text-center">
          <p className="text-text-secondary text-sm">{t('Média geral')}</p>
          <p className="text-3xl font-bold text-amber-500 mt-1 flex items-center justify-center gap-1">
            ★ {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="divide-y divide-border">
          {filteredReviews.length === 0 ? (
            <div className="p-6 text-center text-text-secondary">
              {t('Nenhuma avaliação encontrada')}
            </div>
          ) : (
            filteredReviews.map((review) => {
              const reviewer = Array.isArray(review.reviewer) ? review.reviewer[0] : review.reviewer;
              const reviewee = Array.isArray(review.reviewee) ? review.reviewee[0] : review.reviewee;
              return (
                <div key={review.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                      <span className="text-xs text-text-secondary">
                        {new Date(review.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-text text-sm italic">"{review.comment || t('Sem comentário')}"</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-secondary pt-2">
                      <div>
                        <span className="font-semibold text-text">{t('Autor')}: </span>
                        {reviewer?.full_name || reviewer?.email || '—'}
                      </div>
                      <div>
                        <span className="font-semibold text-text">{t('Avaliado')}: </span>
                        {reviewee?.full_name || reviewee?.email || '—'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-red-200"
                    >
                      {t('Excluir')}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
