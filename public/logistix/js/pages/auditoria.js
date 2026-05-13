async function renderAuditoria() {
  if (!hasAccess(['*', 'AUDITORIA'])) {
    document.getElementById('page-content').innerHTML = '<div class="empty-state"><i data-lucide="lock"></i><p>Acesso negado</p></div>';
    lucide.createIcons();
    return;
  }

  const logs = await API.get('/auditoria');

  document.getElementById('page-content').innerHTML = `
    <div class="toolbar">
      <div class="search-wrap" style="width:240px">
        <i data-lucide="search"></i>
        <input type="text" id="audit-search" placeholder="Buscar logs...">
      </div>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Data/Hora</th>
            <th>Usuário</th>
            <th>Ação</th>
            <th>Tabela</th>
            <th>Detalhes</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody id="audit-tbody">
          ${logs.map(l => `
            <tr>
              <td>${formatDate(l.created_at)}</td>
              <td>${l.usuario_nome || l.usuario_id}</td>
              <td><span class="badge ${l.acao === 'LOGIN' ? 'badge-green' : l.acao === 'LOGIN_FALHOU' || l.acao === 'DELETE' ? 'badge-red' : ''}">${l.acao}</span></td>
              <td>${l.tabela || '-'}</td>
              <td>${l.detalhes || '-'}</td>
              <td><code>${l.ip || '-'}</code></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  lucide.createIcons();

  document.getElementById('audit-search').addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('#audit-tbody tr').forEach(tr => {
      tr.style.display = tr.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('pt-BR');
}