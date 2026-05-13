let pedidosState = { page: 1, status: '', search: '' };

async function renderPedidos() {
  const { page, status, search } = pedidosState;
  const data = await API.get(`/api/pedidos?page=${page}&limit=20&status=${status}&search=${encodeURIComponent(search)}`);

  document.getElementById('page-content').innerHTML = `
  <div class="page-toolbar">
    <div class="page-toolbar-left">
      <input class="input-search" id="ped-search" placeholder="Buscar pedido ou cliente..." value="${search}">
      <select class="input-field" id="ped-status" style="width:160px">
        <option value="">Todos os status</option>
        <option value="pendente" ${status==='pendente'?'selected':''}>Pendente</option>
        <option value="em_transito" ${status==='em_transito'?'selected':''}>Em trânsito</option>
        <option value="entregue" ${status==='entregue'?'selected':''}>Entregue</option>
        <option value="atrasado" ${status==='atrasado'?'selected':''}>Atrasado</option>
        <option value="cancelado" ${status==='cancelado'?'selected':''}>Cancelado</option>
      </select>
    </div>
    <div class="page-toolbar-right">
      <span style="font-size:13px;color:var(--text-2)">${data.total} pedidos</span>
      <button class="btn-primary" id="btn-novo-pedido"><i data-lucide="plus"></i> Novo Pedido</button>
    </div>
  </div>
  <div class="card">
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Código</th><th>Cliente</th><th>Origem</th><th>Destino</th>
          <th>Peso</th><th>Valor</th><th>Status</th><th>Previsão</th><th></th>
        </tr></thead>
        <tbody>
          ${data.rows.map(p => `<tr>
            <td style="color:var(--text-2);font-size:12px">${p.codigo}</td>
            <td style="font-weight:500">${p.cliente_nome||'—'}</td>
            <td style="color:var(--text-2)">${p.armazem_nome||'—'}</td>
            <td style="color:var(--text-2)">${p.destino_cidade} - ${p.destino_estado}</td>
            <td style="color:var(--text-2)">${p.peso_kg?p.peso_kg+'kg':'—'}</td>
            <td>${p.valor?fmtMoney(p.valor):'—'}</td>
            <td>${badge(p.status)}</td>
            <td style="color:var(--text-2)">${fmtDate(p.previsao)}</td>
            <td>
              <button class="icon-btn" style="width:30px;height:30px" onclick="editPedido(${p.id})"><i data-lucide="pencil"></i></button>
              <button class="icon-btn" style="width:30px;height:30px;margin-left:4px" onclick="deletePedido(${p.id})"><i data-lucide="trash-2"></i></button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div id="ped-pagination" class="pagination"></div>
  </div>`;

  lucide.createIcons({ nodes: [document.getElementById('page-content')] });

  document.getElementById('ped-search').addEventListener('input', e => { pedidosState.search = e.target.value; pedidosState.page = 1; renderPedidos(); });
  document.getElementById('ped-status').addEventListener('change', e => { pedidosState.status = e.target.value; pedidosState.page = 1; renderPedidos(); });
  document.getElementById('btn-novo-pedido').addEventListener('click', () => pedidoModal());
  renderPagination('ped-pagination', page, data.pages, p => { pedidosState.page = p; renderPedidos(); });
}

async function pedidoModal(id) {
  const clientes = await API.get('/api/clientes?limit=100');
  const armazens = await API.get('/api/armazens');
  let p = {};
  if (id) p = await API.get(`/api/pedidos/${id}`);
  const title = id ? 'Editar Pedido' : 'Novo Pedido';
  const body = `
    <div class="form-row">
      <div class="form-group"><label>Código</label><input class="input-field" id="f-codigo" value="${p.codigo||''}" placeholder="#PED00000"></div>
      <div class="form-group"><label>Status</label>
        <select class="input-field" id="f-status">
          ${['pendente','em_transito','entregue','atrasado','cancelado'].map(s=>`<option value="${s}" ${p.status===s?'selected':''}>${STATUS_LABEL[s]}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group"><label>Cliente</label>
      <select class="input-field" id="f-cliente">
        ${clientes.rows.map(c=>`<option value="${c.id}" ${p.cliente_id==c.id?'selected':''}>${c.nome}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>Armazém Origem</label>
      <select class="input-field" id="f-armazem">
        ${armazens.map(a=>`<option value="${a.id}" ${p.armazem_origem_id==a.id?'selected':''}>${a.nome}</option>`).join('')}
      </select>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Destino Cidade</label><input class="input-field" id="f-dest-cidade" value="${p.destino_cidade||''}"></div>
      <div class="form-group"><label>Estado</label><input class="input-field" id="f-dest-estado" value="${p.destino_estado||''}" placeholder="SP"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Peso (kg)</label><input class="input-field" type="number" id="f-peso" value="${p.peso_kg||''}"></div>
      <div class="form-group"><label>Valor (R$)</label><input class="input-field" type="number" id="f-valor" value="${p.valor||''}"></div>
    </div>
    <div class="form-group"><label>Previsão</label><input class="input-field" type="date" id="f-previsao" value="${p.previsao||''}"></div>`;
  openModal(title, body, `<button class="btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn-primary" onclick="savePedido(${id||''})">Salvar</button>`);
}

async function savePedido(id) {
  const payload = {
    codigo: document.getElementById('f-codigo').value,
    status: document.getElementById('f-status').value,
    cliente_id: document.getElementById('f-cliente').value,
    armazem_origem_id: document.getElementById('f-armazem').value,
    destino_cidade: document.getElementById('f-dest-cidade').value,
    destino_estado: document.getElementById('f-dest-estado').value,
    peso_kg: document.getElementById('f-peso').value,
    valor: document.getElementById('f-valor').value,
    previsao: document.getElementById('f-previsao').value,
  };
  if (id) await API.put(`/api/pedidos/${id}`, payload);
  else await API.post('/api/pedidos', payload);
  closeModal(); toast(id ? 'Pedido atualizado!' : 'Pedido criado!', 'success'); renderPedidos();
}

async function editPedido(id) { pedidoModal(id); }

async function deletePedido(id) {
  if (!confirm('Excluir este pedido?')) return;
  await API.del(`/api/pedidos/${id}`);
  toast('Pedido excluído.', 'info'); renderPedidos();
}
