async function renderColetas() {
  const data = await API.get('/api/coletas?page=1&limit=20');
  document.getElementById('page-content').innerHTML = `
  <div class="page-toolbar"><div></div><span style="font-size:13px;color:var(--text-2)">${data.total} coletas</span></div>
  <div class="card">
    <div class="table-wrap">
      <table>
        <thead><tr><th>Pedido</th><th>Cliente</th><th>Armazém</th><th>Data Coleta</th><th>Status</th></tr></thead>
        <tbody>
          ${data.rows.map(c=>`<tr>
            <td style="color:var(--text-2);font-size:12px">${c.codigo||'—'}</td>
            <td style="font-weight:500">${c.cliente_nome||'—'}</td>
            <td style="color:var(--text-2)">${c.armazem_nome||'—'}</td>
            <td style="color:var(--text-2)">${fmtDate(c.data_coleta)}</td>
            <td>${badge(c.status)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
  lucide.createIcons({ nodes:[document.getElementById('page-content')] });
}
