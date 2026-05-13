async function renderEstoque() {
  const armazens = await API.get('/api/armazens');
  const data = await API.get('/api/estoque');
  document.getElementById('page-content').innerHTML = `
  <div class="page-toolbar">
    <div class="page-toolbar-left">
      <select class="input-field" id="est-arm" style="width:220px">
        <option value="">Todos os armazéns</option>
        ${armazens.map(a=>`<option value="${a.id}">${a.nome}</option>`).join('')}
      </select>
    </div>
  </div>
  <div class="card">
    <div class="table-wrap">
      <table>
        <thead><tr><th>Armazém</th><th>Produto</th><th>SKU</th><th>Quantidade</th><th>Unidade</th><th>Atualizado</th><th></th></tr></thead>
        <tbody id="estoque-tbody">
          ${data.map(e=>`<tr>
            <td style="color:var(--text-2)">${e.armazem_nome||'—'}</td>
            <td style="font-weight:500">${e.produto}</td>
            <td style="color:var(--text-2);font-size:12px">${e.sku||'—'}</td>
            <td><span style="font-weight:600;color:${e.quantidade<100?'var(--red)':e.quantidade<200?'var(--yellow)':'var(--green)'}">${e.quantidade}</span></td>
            <td style="color:var(--text-2)">${e.unidade}</td>
            <td style="color:var(--text-2)">${fmtDate(e.updated_at)}</td>
            <td>
              <button class="icon-btn" style="width:30px;height:30px" onclick="editEstoque(${e.id},${e.quantidade})"><i data-lucide="pencil"></i></button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
  lucide.createIcons({ nodes:[document.getElementById('page-content')] });
  document.getElementById('est-arm').addEventListener('change', async e => {
    const rows = await API.get(`/api/estoque?armazem_id=${e.target.value}`);
    document.getElementById('estoque-tbody').innerHTML = rows.map(e=>`<tr>
      <td style="color:var(--text-2)">${e.armazem_nome||'—'}</td>
      <td style="font-weight:500">${e.produto}</td>
      <td style="color:var(--text-2);font-size:12px">${e.sku||'—'}</td>
      <td><span style="font-weight:600;color:${e.quantidade<100?'var(--red)':e.quantidade<200?'var(--yellow)':'var(--green)'}">${e.quantidade}</span></td>
      <td style="color:var(--text-2)">${e.unidade}</td>
      <td style="color:var(--text-2)">${fmtDate(e.updated_at)}</td>
      <td><button class="icon-btn" style="width:30px;height:30px" onclick="editEstoque(${e.id},${e.quantidade})"><i data-lucide="pencil"></i></button></td>
    </tr>`).join('');
    lucide.createIcons({ nodes:[document.getElementById('estoque-tbody')] });
  });
}

function editEstoque(id, atual) {
  openModal('Ajustar Estoque', `
    <div class="form-group"><label>Quantidade atual: ${atual}</label>
      <input class="input-field" type="number" id="fe-qtd" value="${atual}">
    </div>`,
    `<button class="btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn-primary" onclick="saveEstoque(${id})">Salvar</button>`);
}

async function saveEstoque(id) {
  await API.put(`/api/estoque/${id}`, { quantidade: document.getElementById('fe-qtd').value });
  closeModal(); toast('Estoque atualizado!','success'); renderEstoque();
}
