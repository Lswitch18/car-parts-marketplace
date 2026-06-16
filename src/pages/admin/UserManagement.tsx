import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../lib/i18n';
import { useAuthStore } from '../../stores/authStore';
import { Navigate } from 'react-router-dom';

export default function UserManagement() {
  const { user: currentUser } = useAuthStore();
  const { t } = useI18n();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, rating, total_sales, phone, avatar_url, is_verified, created_at, last_login_at');
      
      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }
    
    const filtered = users.filter(user => 
      (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      
      if (error) throw error;
      
      const updateList = (prev: any[]) =>
        prev.map(user => user.id === userId ? {...user, role} : user);
      
      setUsers(updateList);
      setFilteredUsers(updateList);
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, role } : null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user role');
    }
  };

  const toggleVerification = async (userId: string, isVerified: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: !isVerified })
        .eq('id', userId);
      
      if (error) throw error;
      
      const updateList = (prev: any[]) =>
        prev.map(user => user.id === userId ? {...user, is_verified: !isVerified} : user);
      
      setUsers(updateList);
      setFilteredUsers(updateList);
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, is_verified: !isVerified } : null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update verification status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">{error}</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg"
          >
            {t('Tentar novamente')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="bg-surface border border-border rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="font-display text-2xl font-bold text-text">
            {t('Gerenciamento de Usuários')}
          </h1>
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <input
              type="text"
              placeholder={t('Pesquisar usuários...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 px-4 py-2 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('Nome')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('Email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('Função')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('Verificado')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('Avaliação')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('Ações')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-text-secondary">
                    {t('Nenhum usuário encontrado')}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text flex items-center space-x-3">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {(user.full_name || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <span>{user.full_name || 'Sem nome'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="bg-background border border-border rounded-lg px-2 py-1 text-text text-sm focus:border-primary focus:outline-none"
                      >
                        <option value="user">{t('Usuário')}</option>
                        <option value="seller">{t('Vendedor')}</option>
                        <option value="admin">{t('Administrador')}</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={user.is_verified || false}
                          onChange={() => toggleVerification(user.id, user.is_verified || false)}
                          className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                        />
                        <span className="text-sm font-medium text-text">{t('Verificado')}</span>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
                      <div className="flex items-center space-x-1">
                        <span className="text-amber-500">★</span>
                        <span>{(user.rating || 0).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-primary hover:text-primary-dark font-medium"
                      >
                        {t('Ver Detalhes')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="text-text-secondary text-sm">
            {t('Mostrando')} {filteredUsers.length} {t('de')} {users.length} {t('usuários')}
          </span>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-text">{t('Detalhes do Usuário')}</h2>
              <button 
                onClick={() => setSelectedUser(null)} 
                className="text-text-secondary hover:text-text text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                {selectedUser.avatar_url ? (
                  <img src={selectedUser.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-600">
                    {(selectedUser.full_name || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-text">{selectedUser.full_name || 'Sem nome'}</h3>
                  <p className="text-sm text-text-secondary">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                <div>
                  <span className="text-xs text-text-secondary block">{t('Telefone')}</span>
                  <span className="text-sm font-medium text-text">{selectedUser.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-xs text-text-secondary block">{t('ID do Usuário')}</span>
                  <span className="text-xs font-mono text-text break-all">{selectedUser.id}</span>
                </div>
                <div>
                  <span className="text-xs text-text-secondary block">{t('Total de Vendas')}</span>
                  <span className="text-sm font-medium text-text">¥ {(selectedUser.total_sales || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-xs text-text-secondary block">{t('Membro Desde')}</span>
                  <span className="text-sm font-medium text-text">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-text block mb-2">{t('Função no Sistema')}</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => updateUserRole(selectedUser.id, e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="user">{t('Usuário')}</option>
                    <option value="seller">{t('Vendedor')}</option>
                    <option value="admin">{t('Administrador')}</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <h4 className="text-sm font-semibold text-text">{t('Verificação da Conta')}</h4>
                    <p className="text-xs text-text-secondary">{t('Contas verificadas ganham selo de confiança')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUser.is_verified || false}
                      onChange={() => toggleVerification(selectedUser.id, selectedUser.is_verified || false)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2 rounded-lg text-sm"
              >
                {t('Fechar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}