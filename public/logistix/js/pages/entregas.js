let entregasState = { page: 1, status: '' };

async function renderEntregas() {
  const { page, status } = entregasState;
  const data = await API.get(`/api/entregas?page=${page}&limit=20&status=${status}`);
  document.getElementById('page-content').innerHTML = `
  <div class="page-toolbar">
    <div class="page-toolbar-left">
      <select class="input-field" id="ent-status" style="width:180px">
        <option value="">Todos os status</option>
        ${['em_transito','entregue','atrasado','cancelado','pendente'].map(s=>`<option value="${s}" ${status===s?'selected':''}>${STATUS_LABEL[s]}</option>`).join('')}
      </select>
    </div>
    <div class="page-toolbar-right">
      <span style="font-size:13px;color:var(--text-2)">${data.total} entregas</span>
    </div>
  </div>
  <div class="card">
    <div class="table-wrap">
      <table>
        <thead><tr><th>Pedido</th><th>Cliente</th><th>Destino</th><th>Motorista</th><th>Placa</th><th>Status</th><th>Entregue em</th><th></th></tr></thead>
        <tbody>
          ${data.rows.map(e=>`<tr>
            <td style="color:var(--text-2);font-size:12px">${e.codigo||'—'}</td>
            <td style="font-weight:500">${e.cliente_nome||'—'}</td>
            <td style="color:var(--text-2)">${e.destino_cidade||'—'} - ${e.destino_estado||''}</td>
            <td style="color:var(--text-2)">${e.motorista||'—'}</td>
            <td style="color:var(--primary-light);font-weight:600">${e.placa||'—'}</td>
            <td>${badge(e.status)}</td>
            <td style="color:var(--text-2)">${fmtDate(e.entregue_em)}</td>
            <td>
              <button class="icon-btn" style="width:30px;height:30px" onclick="updateEntregaStatus(${e.id},'entregue')"><i data-lucide="check"></i></button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div id="ent-pagination" class="pagination"></div>
  </div>`;
  lucide.createIcons({ nodes:[document.getElementById('page-content')] });
  document.getElementById('ent-status').addEventListener('change', e => { entregasState.status=e.target.value; entregasState.page=1; renderEntregas(); });
  renderPagination('ent-pagination', page, data.pages, p => { entregasState.page=p; renderEntregas(); });
}

async function updateEntregaStatus(id, status) {
  const entregue_em = status==='entregue' ? new Date().toISOString() : null;
  await API.put(`/api/entregas/${id}`, { status, entregue_em });
  toast('Status atualizado!','success'); renderEntregas();
}
