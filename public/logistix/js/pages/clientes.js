let clientesState = { page: 1, search: '' };

async function renderClientes() {
  const { page, search } = clientesState;
  const data = await API.get(`/api/clientes?page=${page}&limit=20&search=${encodeURIComponent(search)}`);
  document.getElementById('page-content').innerHTML = `
  <div class="page-toolbar">
    <div class="page-toolbar-left">
      <input class="input-search" id="cli-search" placeholder="Buscar cliente ou CNPJ..." value="${search}">
    </div>
    <div class="page-toolbar-right">
      <span style="font-size:13px;color:var(--text-2)">${data.total} clientes</span>
      <button class="btn-primary" id="btn-novo-cli"><i data-lucide="plus"></i> Novo Cliente</button>
    </div>
  </div>
  <div class="card">
    <div class="table-wrap">
      <table>
        <thead><tr><th>Nome</th><th>CNPJ</th><th>Email</th><th>Telefone</th><th>Cidade</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          ${data.rows.map(c=>`<tr>
            <td style="font-weight:500">${c.nome}</td>
            <td style="color:var(--text-2);font-size:12px">${c.cnpj||'—'}</td>
            <td style="color:var(--text-2)">${c.email||'—'}</td>
            <td style="color:var(--text-2)">${c.telefone||'—'}</td>
            <td style="color:var(--text-2)">${c.cidade||'—'}</td>
            <td><span class="badge-status s-disponivel">${c.estado||'—'}</span></td>
            <td>
              <button class="icon-btn" style="width:30px;height:30px" onclick="editCliente(${c.id},${JSON.stringify(c).replace(/"/g,'&quot;')})"><i data-lucide="pencil"></i></button>
              <button class="icon-btn" style="width:30px;height:30px;margin-left:4px" onclick="deleteCliente(${c.id})"><i data-lucide="trash-2"></i></button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div id="cli-pagination" class="pagination"></div>
  </div>`;
  lucide.createIcons({ nodes:[document.getElementById('page-content')] });
  document.getElementById('cli-search').addEventListener('input', e => { clientesState.search=e.target.value; clientesState.page=1; renderClientes(); });
  document.getElementById('btn-novo-cli').addEventListener('click', () => clienteModal());
  renderPagination('cli-pagination', page, data.pages, p => { clientesState.page=p; renderClientes(); });
}

function clienteModal(id, c={}) {
  openModal(id?'Editar Cliente':'Novo Cliente', `
    <div class="form-group"><label>Nome</label><input class="input-field" id="fc-nome" value="${c.nome||''}"></div>
    <div class="form-row">
      <div class="form-group"><label>CNPJ</label><input class="input-field" id="fc-cnpj" value="${c.cnpj||''}"></div>
      <div class="form-group"><label>Telefone</label><input class="input-field" id="fc-tel" value="${c.telefone||''}"></div>
    </div>
    <div class="form-group"><label>Email</label><input class="input-field" id="fc-email" value="${c.email||''}"></div>
    <div class="form-row">
      <div class="form-group"><label>Cidade</label><input class="input-field" id="fc-cidade" value="${c.cidade||''}"></div>
      <div class="form-group"><label>Estado</label><input class="input-field" id="fc-estado" value="${c.estado||''}" placeholder="SP"></div>
    </div>`,
    `<button class="btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn-primary" onclick="saveCliente(${id||''})">Salvar</button>`);
}

async function saveCliente(id) {
  const payload = { nome:document.getElementById('fc-nome').value, cnpj:document.getElementById('fc-cnpj').value, email:document.getElementById('fc-email').value, telefone:document.getElementById('fc-tel').value, cidade:document.getElementById('fc-cidade').value, estado:document.getElementById('fc-estado').value };
  if (id) await API.put(`/api/clientes/${id}`, payload);
  else await API.post('/api/clientes', payload);
  closeModal(); toast(id?'Cliente atualizado!':'Cliente criado!','success'); renderClientes();
}

function editCliente(id, c) { clienteModal(id, c); }

async function deleteCliente(id) {
  if (!confirm('Excluir este cliente?')) return;
  await API.del(`/api/clientes/${id}`); toast('Cliente excluído.','info'); renderClientes();
}
