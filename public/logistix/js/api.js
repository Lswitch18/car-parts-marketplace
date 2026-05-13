const API = {
  baseUrl: '/api',
  token: localStorage.getItem('token'),

  async request(method, url, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(this.baseUrl + url, options);
    const data = await res.json();

    if (res.status === 401) {
      this.logout();
      showLogin();
      throw new Error('Sessão expirada');
    }

    if (!res.ok) throw new Error(data.error || 'Erro na requisição');
    return data;
  },

  get(url) { return this.request('GET', url); },
  post(url, body) { return this.request('POST', url, body); },
  put(url, body) { return this.request('PUT', url, body); },
  del(url) { return this.request('DELETE', url); },

  async login(email, senha) {
    const res = await fetch(this.baseUrl + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    this.token = data.token;
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    localStorage.setItem('armazens', JSON.stringify(data.armazens));
    localStorage.setItem('permissoes', JSON.stringify(data.permissoes));
    return data;
  },

  logout() {
    if (this.token) {
      fetch(this.baseUrl + '/logout', { 
        method: 'POST', 
        headers: { 'Authorization': `Bearer ${this.token}` } 
      }).catch(() => {});
    }
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('armazens');
    localStorage.removeItem('permissoes');
  },

  getUsuario() {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  },

  getArmazens() {
    const a = localStorage.getItem('armazens');
    return a ? JSON.parse(a) : [];
  },

  getPermissoes() {
    const p = localStorage.getItem('permissoes');
    return p ? JSON.parse(p) : [];
  },

  hasPermission(...perms) {
    const userPerms = this.getPermissoes();
    return userPerms.includes('*') || perms.some(p => userPerms.includes(p));
  },

  async checkAuth() {
    if (!this.token) return false;
    try {
      await this.get('/me');
      return true;
    } catch {
      return false;
    }
  }
};

function showLogin() {
  document.getElementById('app').classList.add('hidden');
  const loginEl = document.getElementById('login-screen') || createLoginScreen();
  loginEl.classList.remove('hidden');
  loginEl.classList.add('flex');
}

function createLoginScreen() {
  const div = document.createElement('div');
  div.id = 'login-screen';
  div.className = 'login-screen';
  div.innerHTML = `
    <div class="login-box">
      <div class="login-logo">
        <div class="logo-icon"><i data-lucide="package"></i></div>
        <div class="logo-name">LOGISTIX</div>
        <div class="logo-sub">Smart Logistics</div>
      </div>
      <form id="login-form">
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="login-email" placeholder="seu@email.com" required>
        </div>
        <div class="form-group">
          <label>Senha</label>
          <input type="password" id="login-senha" placeholder="••••••••" required>
        </div>
        <div id="login-error" class="error-msg"></div>
        <button type="submit" class="btn-primary btn-block">
          <i data-lucide="log-in"></i> Entrar
        </button>
      </form>
      <div class="login-footer">
        <small>© 2025 Logistix WMS</small>
      </div>
    </div>
  `;
  document.body.appendChild(div);

  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    const errorEl = document.getElementById('login-error');
    const btn = e.target.querySelector('button');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Entrando...';

    try {
      await API.login(email, senha);
      initApp();
    } catch (err) {
      errorEl.textContent = err.message;
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="log-in"></i> Entrar';
    }
  });

  lucide.createIcons();
  return div;
}

function showApp() {
  document.getElementById('login-screen')?.classList.add('hidden');
  document.getElementById('login-screen')?.classList.remove('flex');
  document.getElementById('app').classList.remove('hidden');
}

function updateUserInfo() {
  const user = API.getUsuario();
  const userName = document.querySelector('.user-name');
  const userRole = document.querySelector('.user-role');
  if (user) {
    if (userName) userName.textContent = user.nome;
    if (userRole) userRole.textContent = user.cargo || user.setor;
  }
}

async function initApp() {
  showApp();
  updateUserInfo();
  navigate('dashboard');
  lucide.createIcons();
}