async function renderTransferencias() {
  const data = await API.get('/api/transferencias');
  const armazens = await API.get('/api/armazens');
  document.getElementById('page-content').innerHTML = `
  <div class="page-toolbar">
    <div></div>
    <button class="btn-primary" id="btn-nova-trans"><i data-lucide="plus"></i> Nova Transferência</button>
  </div>
  <div class="card">
    <div class="table-wrap">
      <table>
        <thead><tr><th>Origem</th><th>Destino</th><th>Descrição</th><th>Quantidade</th><th>Data</th><th>Status</th></tr></thead>
        <tbody>
          ${data.map(t=>`<tr>
            <td style="font-weight:500">${t.origem_nome||'—'}</td>
            <td style="font-weight:500">${t.destino_nome||'—'}</td>
            <td style="color:var(--text-2)">${t.descricao||'—'}</td>
            <td style="font-weight:600">${t.quantidade||0}</td>
            <td style="color:var(--text-2)">${fmtDate(t.data)}</td>
            <td>${badge(t.status)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
  lucide.createIcons({ nodes:[document.getElementById('page-content')] });
  document.getElementById('btn-nova-trans').addEventListener('click', () => {
    openModal('Nova Transferência', `
      <div class="form-group"><label>Armazém Origem</label>
        <select class="input-field" id="ftr-orig">${armazens.map(a=>`<option value="${a.id}">${a.nome}</option>`).join('')}</select>
      </div>
      <div class="form-group"><label>Armazém Destino</label>
        <select class="input-field" id="ftr-dest">${armazens.map(a=>`<option value="${a.id}">${a.nome}</option>`).join('')}</select>
      </div>
      <div class="form-group"><label>Descrição</label><input class="input-field" id="ftr-desc" placeholder="Rebalanceamento..."></div>
      <div class="form-row">
        <div class="form-group"><label>Quantidade</label><input class="input-field" type="number" id="ftr-qtd"></div>
        <div class="form-group"><label>Data</label><input class="input-field" type="date" id="ftr-data"></div>
      </div>`,
      `<button class="btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn-primary" onclick="saveTrans()">Salvar</button>`);
  });
}

async function saveTrans() {
  await API.post('/api/transferencias', { armazem_origem_id: document.getElementById('ftr-orig').value, armazem_destino_id: document.getElementById('ftr-dest').value, descricao: document.getElementById('ftr-desc').value, quantidade: document.getElementById('ftr-qtd').value, data: document.getElementById('ftr-data').value });
  closeModal(); toast('Transferência criada!','success'); renderTransferencias();
}
