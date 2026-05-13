async function renderArmazens() {
  const data = await API.get('/api/armazens');
  document.getElementById('page-content').innerHTML = `
  <div class="page-toolbar">
    <div class="page-toolbar-left"></div>
    <div class="page-toolbar-right">
      <button class="btn-primary" id="btn-novo-arm"><i data-lucide="plus"></i> Novo Armazém</button>
    </div>
  </div>
  <div class="grid-auto">
    ${data.map(a => {
      const pct = Math.round((a.ocupacao/a.capacidade)*100);
      const color = pct>80?'var(--green)':pct>60?'var(--yellow)':'var(--red)';
      return `<div class="card" style="animation-delay:${data.indexOf(a)*0.05}s">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
          <div>
            <div style="font-size:15px;font-weight:600">${a.nome}</div>
            <div style="font-size:12px;color:var(--text-2);margin-top:3px">${a.cidade} - ${a.estado}</div>
          </div>
          <button class="icon-btn" style="width:30px;height:30px" onclick="editArmazem(${a.id},${JSON.stringify(a).replace(/"/g,'&quot;')})"><i data-lucide="pencil"></i></button>
        </div>
        <div class="prog-header" style="margin-bottom:6px"><span style="font-size:12px;color:var(--text-2)">Ocupação</span><span style="font-size:13px;font-weight:600">${pct}%</span></div>
        <div class="prog-bar" style="margin-bottom:14px"><div class="prog-fill" style="width:${pct}%;background:${color}"></div></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div style="background:var(--bg);border-radius:8px;padding:10px 12px">
            <div style="font-size:11px;color:var(--text-3)">Capacidade</div>
            <div style="font-weight:600">${fmt(a.capacidade)} un</div>
          </div>
          <div style="background:var(--bg);border-radius:8px;padding:10px 12px">
            <div style="font-size:11px;color:var(--text-3)">Ocupado</div>
            <div style="font-weight:600">${fmt(a.ocupacao)} un</div>
          </div>
        </div>
        <div style="margin-top:12px;font-size:12px;color:var(--text-2)">👤 ${a.responsavel||'—'}</div>
      </div>`;
    }).join('')}
  </div>`;
  lucide.createIcons({ nodes:[document.getElementById('page-content')] });
  document.getElementById('btn-novo-arm').addEventListener('click', () => armazemModal());
}

function armazemModal(id, a={}) {
  openModal(id?'Editar Armazém':'Novo Armazém', `
    <div class="form-group"><label>Nome</label><input class="input-field" id="fa-nome" value="${a.nome||''}"></div>
    <div class="form-row">
      <div class="form-group"><label>Cidade</label><input class="input-field" id="fa-cidade" value="${a.cidade||''}"></div>
      <div class="form-group"><label>Estado</label><input class="input-field" id="fa-estado" value="${a.estado||''}" placeholder="SP"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Capacidade</label><input class="input-field" type="number" id="fa-cap" value="${a.capacidade||1000}"></div>
      <div class="form-group"><label>Ocupação atual</label><input class="input-field" type="number" id="fa-ocu" value="${a.ocupacao||0}"></div>
    </div>
    <div class="form-group"><label>Responsável</label><input class="input-field" id="fa-resp" value="${a.responsavel||''}"></div>`,
    `<button class="btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn-primary" onclick="saveArmazem(${id||''})">Salvar</button>`);
}

async function saveArmazem(id) {
  const payload = { nome:document.getElementById('fa-nome').value, cidade:document.getElementById('fa-cidade').value, estado:document.getElementById('fa-estado').value, capacidade:document.getElementById('fa-cap').value, ocupacao:document.getElementById('fa-ocu').value, responsavel:document.getElementById('fa-resp').value };
  if (id) await API.put(`/api/armazens/${id}`, payload);
  else await API.post('/api/armazens', payload);
  closeModal(); toast(id?'Armazém atualizado!':'Armazém criado!','success'); renderArmazens();
}

function editArmazem(id, a) { armazemModal(id, a); }
