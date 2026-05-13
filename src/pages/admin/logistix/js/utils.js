// Status helpers
const STATUS_LABEL = {
  entregue:'Entregue', em_transito:'Em trânsito', atrasado:'Atrasado',
  cancelado:'Cancelado', pendente:'Pendente', disponivel:'Disponível',
  em_rota:'Em rota', manutencao:'Manutenção', aberta:'Aberta',
  resolvida:'Resolvida', agendada:'Agendada', concluida:'Concluída',
  em_andamento:'Em andamento'
};

function badge(status) {
  return `<span class="badge-status s-${status}">${STATUS_LABEL[status]||status}</span>`;
}

function fmt(val, prefix='') {
  if (val == null) return '—';
  return prefix + Number(val).toLocaleString('pt-BR');
}

function fmtMoney(val) {
  return 'R$ ' + Number(val).toLocaleString('pt-BR', {minimumFractionDigits:2});
}

function fmtDate(str) {
  if (!str) return '—';
  return str.split('T')[0].split('-').reverse().join('/');
}

// Toast
function toast(msg, type='info') {
  const icons = {success:'check-circle', error:'x-circle', info:'info'};
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i data-lucide="${icons[type]}"></i><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  lucide.createIcons({ nodes: [el] });
  setTimeout(() => el.remove(), 3500);
}
function showToast(msg, type='info') { toast(msg, type); }

// Logout
function logout() {
  if (!confirm('Sair do sistema?')) return;
  API.logout();
  showLogin();
}

// Open modal wrapper
function openModal(title, bodyHTML, footerHTML) {
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  document.getElementById('modal-footer').innerHTML = footerHTML;
  overlay.classList.add('open');
  lucide.createIcons({ nodes: [document.getElementById('modal')] });
}

// Modal
function openModal(title, bodyHTML, footerHTML='') {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  document.getElementById('modal-footer').innerHTML = footerHTML;
  document.getElementById('modal-overlay').classList.add('open');
  lucide.createIcons({ nodes: [document.getElementById('modal')] });
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

// Pagination renderer
function renderPagination(containerId, current, pages, onPage) {
  const el = document.getElementById(containerId);
  if (!el || pages <= 1) { if(el) el.innerHTML=''; return; }
  let html = `<span class="page-info">Página ${current} de ${pages}</span>`;
  if (current > 1) html += `<button class="page-btn" data-p="${current-1}"><i data-lucide="chevron-left"></i></button>`;
  const start = Math.max(1, current-2), end = Math.min(pages, current+2);
  for (let i = start; i <= end; i++) {
    html += `<button class="page-btn${i===current?' active':''}" data-p="${i}">${i}</button>`;
  }
  if (current < pages) html += `<button class="page-btn" data-p="${current+1}"><i data-lucide="chevron-right"></i></button>`;
  el.innerHTML = html;
  lucide.createIcons({ nodes: [el] });
  el.querySelectorAll('[data-p]').forEach(btn => btn.addEventListener('click', () => onPage(Number(btn.dataset.p))));
}

// Sparkline chart
function sparkline(id, data, color) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 44);
  grad.addColorStop(0, color + '55');
  grad.addColorStop(1, color + '00');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_,i)=>i),
      datasets: [{ data, borderColor: color, backgroundColor: grad, fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } },
      animation: false
    }
  });
}
