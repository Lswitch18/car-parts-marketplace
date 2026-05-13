async function renderTransportes() {
  const data = await API.get('/api/transportes');
  const disp = data.filter(t=>t.status==='disponivel').length;
  const rota = data.filter(t=>t.status==='em_rota').length;
  const man = data.filter(t=>t.status==='manutencao').length;
  document.getElementById('page-content').innerHTML = `
  <div class="stats-row">
    <div class="stat-mini"><div class="stat-mini-val">${data.length}</div><div class="stat-mini-lbl">Total de veículos</div></div>
    <div class="stat-mini"><div class="stat-mini-val" style="color:var(--green)">${disp}</div><div class="stat-mini-lbl">Disponíveis</div></div>
    <div class="stat-mini"><div class="stat-mini-val" style="color:var(--primary-light)">${rota}</div><div class="stat-mini-lbl">Em rota</div></div>
    <div class="stat-mini"><div class="stat-mini-val" style="color:var(--orange)">${man}</div><div class="stat-mini-lbl">Em manutenção</div></div>
  </div>
  <div class="page-toolbar" style="padding-top:0">
    <div></div>
    <button class="btn-primary" id="btn-novo-transp"><i data-lucide="plus"></i> Novo Veículo</button>
  </div>
  <div class="card">
    <div class="table-wrap">
      <table>
        <thead><tr><th>Placa</th><th>Modelo</th><th>Motorista</th><th>Armazém</th><th>Capacidade</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${data.map(t=>`<tr>
            <td style="font-weight:600;color:var(--primary-light)">${t.placa}</td>
            <td>${t.modelo||'—'}</td>
            <td>${t.motorista||'—'}</td>
            <td style="color:var(--text-2)">${t.armazem_nome||'—'}</td>
            <td style="color:var(--text-2)">${t.capacidade_kg?fmt(t.capacidade_kg)+' kg':'—'}</td>
            <td>${badge(t.status)}</td>
            <td>
              <button class="icon-btn" style="width:30px;height:30px" onclick="editTransporte(${t.id},${JSON.stringify(t).replace(/"/g,'&quot;')})"><i data-lucide="pencil"></i></button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
  lucide.createIcons({ nodes:[document.getElementById('page-content')] });
  document.getElementById('btn-novo-transp').addEventListener('click', () => transporteModal());
}

async function transporteModal(id, t={}) {
  const armazens = await API.get('/api/armazens');
  openModal(id?'Editar Veículo':'Novo Veículo', `
    <div class="form-row">
      <div class="form-group"><label>Placa</label><input class="input-field" id="ft-placa" value="${t.placa||''}"></div>
      <div class="form-group"><label>Status</label>
        <select class="input-field" id="ft-status">
          ${['disponivel','em_rota','manutencao'].map(s=>`<option value="${s}" ${t.status===s?'selected':''}>${STATUS_LABEL[s]}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group"><label>Modelo</label><input class="input-field" id="ft-modelo" value="${t.modelo||''}"></div>
    <div class="form-group"><label>Motorista</label><input class="input-field" id="ft-motorista" value="${t.motorista||''}"></div>
    <div class="form-row">
      <div class="form-group"><label>Capacidade (kg)</label><input class="input-field" type="number" id="ft-cap" value="${t.capacidade_kg||''}"></div>
      <div class="form-group"><label>Armazém</label>
        <select class="input-field" id="ft-arm">
          ${armazens.map(a=>`<option value="${a.id}" ${t.armazem_id==a.id?'selected':''}>${a.nome}</option>`).join('')}
        </select>
      </div>
    </div>`,
    `<button class="btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn-primary" onclick="saveTransporte(${id||''})">Salvar</button>`);
}

async function saveTransporte(id) {
  const payload = { placa:document.getElementById('ft-placa').value, modelo:document.getElementById('ft-modelo').value, motorista:document.getElementById('ft-motorista').value, status:document.getElementById('ft-status').value, capacidade_kg:document.getElementById('ft-cap').value, armazem_id:document.getElementById('ft-arm').value };
  if (id) await API.put(`/api/transportes/${id}`, payload);
  else await API.post('/api/transportes', payload);
  closeModal(); toast(id?'Veículo atualizado!':'Veículo criado!','success'); renderTransportes();
}

function editTransporte(id, t) { transporteModal(id, t); }
