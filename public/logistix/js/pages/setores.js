async function renderSetores() {
  if (!hasAccess(['*', 'SETORES'])) {
    document.getElementById('page-content').innerHTML = '<div class="empty-state"><i data-lucide="lock"></i><p>Acesso negado</p></div>';
    lucide.createIcons();
    return;
  }

  const setores = await API.get('/setores');
  const permissoes = await API.get('/permissoes');

  document.getElementById('page-content').innerHTML = `
    <div class="toolbar">
      <button class="btn-primary" onclick="openSetorModal()"><i data-lucide="plus"></i> Novo Setor</button>
    </div>
    <div class="grid-3" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr))">
      ${setores.map(s => {
        const setorPerms = permissoes.filter(p => p.setor_id === s.id);
        return `
          <div class="card">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="kpi-icon" style="background:${s.cor}"><i data-lucide="${s.icon || 'folder'}"></i></div>
                <div>
                  <div class="font-semibold">${s.nome}</div>
                  <div class="text-sm text-gray">${setorPerms.length} permissões</div>
                </div>
              </div>
              <button class="icon-btn" onclick="editSetor(${s.id})"><i data-lucide="edit-2"></i></button>
            </div>
            <p class="text-sm" style="color:var(--text-2)">${s.descricao || 'Sem descrição'}</p>
          </div>
        `;
      }).join('')}
    </div>
  `;
  lucide.createIcons();
}

async function openSetorModal(setor = null) {
  const title = setor ? 'Editar Setor' : 'Novo Setor';
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = `
    <form id="setor-form" class="form-grid">
      <div class="form-group">
        <label>Nome *</label>
        <input type="text" name="nome" value="${setor?.nome || ''}" required>
      </div>
      <div class="form-group">
        <label>Descrição</label>
        <input type="text" name="descricao" value="${setor?.descricao || ''}">
      </div>
      <div class="form-group">
        <label>Cor</label>
        <input type="color" name="cor" value="${setor?.cor || '#6366F1'}" style="height:44px">
      </div>
      <div class="form-group">
        <label>Ícone (lucide)</label>
        <input type="text" name="icon" value="${setor?.icon || ''}" placeholder="shield">
      </div>
    </form>
  `;
  document.getElementById('modal-footer').innerHTML = `
    <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
    <button class="btn-primary" onclick="saveSetor(${setor?.id || null})">Salvar</button>
  `;
  openModal();
  lucide.createIcons();
}

async function saveSetor(id = null) {
  const form = document.getElementById('setor-form');
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  data.ativo = 1;

  try {
    if (id) {
      await API.put(`/setores/${id}`, data);
      showToast('Setor atualizado');
    } else {
      await API.post('/setores', data);
      showToast('Setor criado');
    }
    closeModal();
    renderSetores();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function editSetor(id) {
  const setores = await API.get('/setores');
  const setor = setores.find(s => s.id === id);
  openSetorModal(setor);
}