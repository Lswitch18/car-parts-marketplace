const PAGES = {
  dashboard:    { title: 'Dashboard',      subtitle: 'Bem-vindo de volta! 👋', render: renderDashboard, perm: ['*', 'VER_DASHBOARD'] },
  pedidos:     { title: 'Pedidos',        subtitle: 'Gerencie todos os pedidos',      render: renderPedidos, perm: ['*', 'PEDIDOS', 'PEDIDOS_LEITURA'] },
  coletas:     { title: 'Coletas',        subtitle: 'Coletas agendadas e realizadas', render: renderColetas, perm: ['*', 'COLETAS'] },
  transferencias:{ title:'Transferências', subtitle: 'Movimentação entre armazéns',   render: renderTransferencias, perm: ['*', 'TRANSFERENCIAS'] },
  estoque:     { title: 'Estoque',        subtitle: 'Controle de estoque em tempo real', render: renderEstoque, perm: ['*', 'ESTOQUE', 'ESTOQUE_LEITURA'] },
  armazens:    { title: 'Armazéns',       subtitle: 'Centros de distribuição',        render: renderArmazens, perm: ['*', 'SETORES'] },
  transportes: { title: 'Transportes',    subtitle: 'Frota de veículos',              render: renderTransportes, perm: ['*', 'TRANSPORTES'] },
  entregas:    { title: 'Entregas',       subtitle: 'Rastreamento de entregas',       render: renderEntregas, perm: ['*', 'ENTREGAS'] },
  ocorrencias: { title: 'Ocorrências',    subtitle: 'Problemas e incidentes',         render: renderOcorrencias, perm: ['*', 'OCORRENCIAS'] },
  clientes:    { title: 'Clientes',       subtitle: 'Cadastro de clientes',           render: renderClientes, perm: ['*', 'CLIENTES', 'CLIENTES_LEITURA'] },
  relatorios:  { title: 'Relatórios',     subtitle: 'Análises e métricas',            render: renderRelatorios, perm: ['*', 'RELATORIOS', 'RELATORIOS_LEITURA'] },
  configuracoes:{ title:'Configurações',  subtitle: 'Preferências do sistema',        render: renderConfiguracoes, perm: ['*', 'CONFIG', 'CONFIG_LEITURA'] },
  usuarios:    { title: 'Usuários',       subtitle: 'Gerenciamento de usuários',       render: renderUsuarios, perm: ['*', 'USUARIOS', 'USUARIOS_LEITURA'] },
  setores:     { title: 'Setores',        subtitle: 'Departamentos e permissões',      render: renderSetores, perm: ['*', 'SETORES'] },
  auditoria:   { title: 'Auditoria',      subtitle: 'Logs do sistema',                render: renderAuditoria, perm: ['*', 'AUDITORIA'] },
};

let currentPage = 'dashboard';

function hasAccess(perms) {
  return API.hasPermission(...perms);
}

function navigate(page) {
  if (!PAGES[page]) return;

  const pageData = PAGES[page];
  if (!hasAccess(pageData.perm)) {
    showToast('Acesso negado', 'error');
    return;
  }

  currentPage = page;

  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  document.getElementById('page-title').textContent = pageData.title;
  document.getElementById('page-subtitle').textContent = pageData.subtitle;

  document.getElementById('page-content').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:200px;color:var(--text-3)">Carregando...</div>';
  pageData.render();
}

function updateNavVisibility() {
  document.querySelectorAll('.nav-item').forEach(el => {
    const page = el.dataset.page;
    if (PAGES[page]) {
      el.style.display = hasAccess(PAGES[page].perm) ? '' : 'none';
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  lucide.createIcons();

  const authenticated = await API.checkAuth();
  if (!authenticated) {
    showLogin();
    return;
  }

  initApp();

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      navigate(item.dataset.page);
    });
  });

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('global-search').focus();
    }
    if (e.key === 'Escape') closeModal();
  });

  updateNavVisibility();
});

window.addEventListener('storage', e => {
  if (e.key === 'token' && !e.newValue) {
    showLogin();
  }
});