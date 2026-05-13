async function renderUsuarios() {
  if (!hasAccess(['*', 'USUARIOS', 'USUARIOS_LEITURA'])) {
    document.getElementById('page-content').innerHTML = '<div class="empty-state"><i data-lucide="lock"></i><p>Acesso negado</p></div>';
    lucide.createIcons();
    return;
  }

  const { rows } = await API.get('/usuarios');
  const setores = await API.get('/setores');
  const cargos = await API.get('/cargos');

  document.getElementById('page-content').innerHTML = `
    <div class="toolbar">
      <div class="search-wrap" style="width:240px">
        <i data-lucide="search"></i>
        <input type="text" id="user-search" placeholder="Buscar usuários...">
      </div>
      <select id="setor-filter" class="select">
        <option value="">Todos os setores</option>
        ${setores.map(s => `<option value="${s.id}">${s.nome}</option>`).join('')}
      </select>
      ${hasAccess(['*', 'USUARIOS']) ? '<button class="btn-primary" onclick="openUserModal()"><i data-lucide="user-plus"></i> Novo Usuário</button>' : ''}
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Email</th>
            <th>Setor</th>
            <th>Cargo</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody id="users-tbody">${rows.map(u => `
          <tr>
            <td>
              <div class="flex items-center gap-2">
                <div class="avatar-sm">${u.nome.charAt(0)}</div>
                ${u.nome}
              </div>
            </td>
            <td>${u.email}</td>
            <td><span class="badge" style="background:var(--primary);color:#fff">${u.setor_nome || '-'}</span></td>
            <td>${u.cargo_nome || '-'}</td>
            <td><span class="badge ${u.status === 'ativo' ? 'badge-green' : 'badge-red'}">${u.status}</span></td>
            <td>
              <div class="flex gap-1">
                <button class="icon-btn" onclick="editUser(${u.id})" title="Editar"><i data-lucide="edit-2"></i></button>
                ${hasAccess(['*', 'USUARIOS']) && u.id !== API.getUsuario()?.id ? `<button class="icon-btn" onclick="deleteUser(${u.id})" title="Excluir"><i data-lucide="trash-2"></i></button>` : ''}
              </div>
            </td>
          </tr>
        `).join('')}
        </tbody>
      </table>
    </div>
  `;

  lucide.createIcons();

  document.getElementById('user-search').addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('#users-tbody tr').forEach(tr => {
      tr.style.display = tr.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
  });
}

async function openUserModal(user = null) {
  const setores = await API.get('/setores');
  const cargos = await API.get('/cargos');
  const armazens = await API.get('/armazens');

  const title = user ? 'Editar Usuário' : 'Novo Usuário';
  const userArmazens = user ? (await API.get(`/usuarios/${user.id}`)).armazens || [] : [];

  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = `
    <form id="user-form" class="form-grid">
      <div class="form-group">
        <label>Nome *</label>
        <input type="text" name="nome" value="${user?.nome || ''}" required>
      </div>
      <div class="form-group">
        <label>Email *</label>
        <input type="email" name="email" value="${user?.email || ''}" required ${user ? 'readonly' : ''}>
      </div>
      <div class="form-group">
        <label>Senha ${user ? '(deixe em branco para manter)' : '*'}</label>
        <input type="password" name="senha" ${user ? '' : 'required'}>
      </div>
      <div class="form-group">
        <label>Setor *</label>
        <select name="setor_id" required onchange="loadCargosBySetor(this.value)">
          <option value="">Selecione</option>
          ${setores.map(s => `<option value="${s.id}" ${user?.setor_id === s.id ? 'selected' : ''}>${s.nome}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Cargo *</label>
        <select name="cargo_id" required>
          <option value="">Selecione o setor primeiro</option>
        </select>
      </div>
      <div class="form-group">
        <label>Telefone</label>
        <input type="text" name="telefone" value="${user?.telefone || ''}">
      </div>
      <div class="form-group full">
        <label>Acesso aos Armazéns</label>
        <div class="checkbox-grid">
          ${armazens.map(a => `
            <label class="checkbox-item">
              <input type="checkbox" name="armazens" value="${a.id}" ${userArmazens.some(ua => ua.id === a.id) ? 'checked' : ''}>
              <span>${a.nome}</span>
              <input type="checkbox" onchange="this.previousElementSibling.checked = this.checked" ${userArmazens.find(ua => ua.id === a.id)?.acesso_admin ? 'checked' : ''}>
              <small>Admin</small>
            </label>
          `).join('')}
        </div>
      </div>
    </form>
  `;

  document.getElementById('modal-footer').innerHTML = `
    <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
    <button class="btn-primary" onclick="saveUser(${user?.id || null})">Salvar</button>
  `;

  openModal();

  if (user?.setor_id) loadCargosBySetor(user.setor_id, user.cargo_id);
}

async function loadCargosBySetor(setorId, selectedCargoId = null) {
  const { rows } = await API.get(`/cargos?setor_id=${setorId}`);
  const select = document.querySelector('select[name="cargo_id"]');
  select.innerHTML = '<option value="">Selecione</option>' + rows.map(c => 
    `<option value="${c.id}" ${c.id === selectedCargoId ? 'selected' : ''}>${c.nome}</option>`
  ).join('');
}

async function saveUser(id = null) {
  const form = document.getElementById('user-form');
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  data.setor_id = Number(data.setor_id);
  data.cargo_id = Number(data.cargo_id);

  const armazensCheckboxes = form.querySelectorAll('input[name="armazens"]:checked');
  data.armazens = Array.from(armazensCheckboxes).map(cb => ({
    id: Number(cb.value),
    acesso_admin: cb.nextElementSibling?.checked || false
  }));

  if (!data.senha) delete data.senha;

  try {
    if (id) {
      await API.put(`/usuarios/${id}`, data);
      showToast('Usuário atualizado');
    } else {
      await API.post('/usuarios', data);
      showToast('Usuário criado');
    }
    closeModal();
    renderUsuarios();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function editUser(id) {
  const user = await API.get(`/usuarios/${id}`);
  openUserModal(user);
}

async function deleteUser(id) {
  if (!confirm('Excluir este usuário?')) return;
  try {
    await API.del(`/usuarios/${id}`);
    showToast('Usuário excluído');
    renderUsuarios();
  } catch (err) {
    showToast(err.message, 'error');
  }
}