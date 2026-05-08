import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../lib/i18n';

export default function UserManagement() {
  const { t } = useI18n();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, rating, is_verified, created_at, last_login_at');
      
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
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
      
      // Update local state
      setUsers(prev => 
        users.map(user => 
          user.id === userId ? {...user, role} : user
        )
      );
      setFilteredUsers(prev => 
        users.map(user => 
          user.id === userId ? {...user, role} : user
        )
      );
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
      
      // Update local state
      setUsers(prev => 
        users.map(user => 
          user.id === userId ? {...user, is_verified: !isVerified} : user
        )
      );
      setFilteredUsers(prev => 
        users.map(user => 
          user.id === userId ? {...user, is_verified: !isVerified} : user
        )
      );
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
        <div className="flex flex-col md:flex-row items-between justify-between mb-4">
          <h1 className="font-display text-2xl font-bold text-text">
            {t('Gerenciamento de Usuários')}
          </h1>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <input
              type="text"
              placeholder={t('Pesquisar usuários...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-48 pl-4 pr-12 py-2 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:border-primary"
            >
            </input>
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
                  <td className="px-6 py-4 text-center text-text-secondary">
                    {t('Nenhum usuário encontrado')}
                  </td>
                  <td colSpan="5" className="px-6 py-4 text-center text-text-secondary"></td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="bg-white border-b border-border hover:bg-[#f9fafb]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
                      {user.full_name || 'Sem nome'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="bg-background border border-border rounded-lg px-2 py-1 text-text"
                      >
                        <option value="user">{t('Usuário')}</option>
                        <option value="seller">{t('Vendedor')}</option>
                        <option value="admin">{t('Administrador')}</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={user.is_verified}
                          onChange={(e) => toggleVerification(user.id, user.is_verified)}
                          className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                        />
                        <span className="text-sm font-medium text-text">{t('Verificado')}</span>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
                      {(user.rating || 0).toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => {
                          // Placeholder for view user details
                          alert(`${t('Visualizando detalhes do usuário:')} ${user.full_name}`);
                        }}
                        className="text-primary hover:text-primary-dark"
                      >
                        {t('Ver')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="text-text-secondary text-sm">
            {t('Mostrando')} {filteredUsers.length} {t('de')} {users.length} {t('usuários')}
          </span>
          <div className="flex space-x-2">
            <button 
              disabled={true}
              className="bg-background border border-border rounded-lg px-3 py-1 text-text-secondary cursor-not-allowed"
            >
              «
            </button>
            <span className="px-3 py-1 text-text-secondary">1</span>
            <button 
              disabled={true}
              className="bg-background border border-border rounded-lg px-3 py-1 text-text-secondary cursor-not-allowed"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}