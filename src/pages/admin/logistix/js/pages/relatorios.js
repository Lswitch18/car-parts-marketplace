async function renderRelatorios() {
  document.getElementById('page-content').innerHTML = `
  <div style="padding:16px 0 20px">
    <h3 style="margin-bottom:4px">Relatórios</h3>
    <p style="color:var(--text-2);font-size:13px">Selecione um relatório para visualizar</p>
  </div>
  <div class="report-grid">
    <div class="report-card" onclick="relPedidos()">
      <div class="report-card-icon" style="background:rgba(59,130,246,.15);color:var(--primary-light)"><i data-lucide="package"></i></div>
      <h4>Pedidos por Status</h4>
      <p>Distribuição de pedidos por status no período</p>
    </div>
    <div class="report-card" onclick="relEntregas()">
      <div class="report-card-icon" style="background:rgba(34,197,94,.15);color:var(--green)"><i data-lucide="truck"></i></div>
      <h4>Performance de Entregas</h4>
      <p>Taxa de entrega no prazo vs atrasadas</p>
    </div>
    <div class="report-card" onclick="relEstoque()">
      <div class="report-card-icon" style="background:rgba(139,92,246,.15);color:var(--purple)"><i data-lucide="boxes"></i></div>
      <h4>Ocupação de Armazéns</h4>
      <p>Nível de ocupação por centro de distribuição</p>
    </div>
    <div class="report-card" onclick="relOcorrencias()">
      <div class="report-card-icon" style="background:rgba(249,115,22,.15);color:var(--orange)"><i data-lucide="alert-triangle"></i></div>
      <h4>Ocorrências</h4>
      <p>Tipos e volume de ocorrências registradas</p>
    </div>
    <div class="report-card" onclick="relClientes()">
      <div class="report-card-icon" style="background:rgba(250,204,21,.15);color:var(--yellow)"><i data-lucide="users"></i></div>
      <h4>Top Clientes</h4>
      <p>Clientes com maior volume de pedidos</p>
    </div>
    <div class="report-card" onclick="relTransportes()">
      <div class="report-card-icon" style="background:rgba(239,68,68,.15);color:var(--red)"><i data-lucide="truck"></i></div>
      <h4>Frota</h4>
      <p>Status e utilização dos veículos</p>
    </div>
  </div>
  <div id="rel-chart-area" style="margin-top:20px"></div>`;
  lucide.createIcons({ nodes:[document.getElementById('page-content')] });
}

async function relPedidos() {
  const data = await API.get('/api/dashboard/status-entregas');
  const el = document.getElementById('rel-chart-area');
  el.innerHTML = `<div class="card"><div class="card-title">Pedidos por Status</div><div style="height:300px"><canvas id="rel-canvas"></canvas></div></div>`;
  new Chart(document.getElementById('rel-canvas'), {
    type: 'bar',
    data: { labels: data.map(d=>STATUS_LABEL[d.status]||d.status), datasets: [{ data: data.map(d=>d.count), backgroundColor: ['#22C55E','#3B82F6','#F97316','#EF4444','#9CA3AF'], borderRadius: 6 }] },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{backgroundColor:'#1F2937',padding:10,cornerRadius:8}}, scales:{x:{grid:{display:false},ticks:{color:'#6B7280'}},y:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'#6B7280'}}} }
  });
}

async function relEntregas() {
  const data = await API.get('/api/dashboard/performance');
  const el = document.getElementById('rel-chart-area');
  el.innerHTML = `<div class="card"><div class="card-title">Performance de Entregas</div><div style="height:300px"><canvas id="rel-canvas"></canvas></div></div>`;
  new Chart(document.getElementById('rel-canvas'), {
    type: 'line',
    data: { labels: data.map(d=>d.data), datasets: [
      { label:'No prazo', data: data.map(d=>d.no_prazo), borderColor:'#22C55E', fill:false, tension:.4, borderWidth:2, pointRadius:4 },
      { label:'Atrasadas', data: data.map(d=>d.atrasadas), borderColor:'#F97316', fill:false, tension:.4, borderWidth:2, pointRadius:4 }
    ]},
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{color:'#9CA3AF'}},tooltip:{backgroundColor:'#1F2937',padding:10,cornerRadius:8}}, scales:{x:{grid:{display:false},ticks:{color:'#6B7280'}},y:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'#6B7280',callback:v=>v+'%'}}} }
  });
}

async function relEstoque() {
  const data = await API.get('/api/armazens');
  const el = document.getElementById('rel-chart-area');
  el.innerHTML = `<div class="card"><div class="card-title">Ocupação de Armazéns</div><div style="height:300px"><canvas id="rel-canvas"></canvas></div></div>`;
  new Chart(document.getElementById('rel-canvas'), {
    type: 'bar',
    data: { labels: data.map(d=>d.nome), datasets: [{ label:'Ocupação %', data: data.map(d=>Math.round(d.ocupacao/d.capacidade*100)), backgroundColor: data.map(d=>{const p=d.ocupacao/d.capacidade*100; return p>80?'#22C55E':p>60?'#FACC15':'#EF4444'}), borderRadius:6 }] },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{backgroundColor:'#1F2937',padding:10,cornerRadius:8,callbacks:{label:c=>c.raw+'%'}}}, scales:{x:{grid:{display:false},ticks:{color:'#6B7280'}},y:{max:100,grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'#6B7280',callback:v=>v+'%'}}} }
  });
}

async function relOcorrencias() {
  const data = await API.get('/api/ocorrencias');
  const tipos = {};
  data.forEach(o => tipos[o.tipo] = (tipos[o.tipo]||0)+1);
  const el = document.getElementById('rel-chart-area');
  el.innerHTML = `<div class="card"><div class="card-title">Ocorrências por Tipo</div><div style="height:300px"><canvas id="rel-canvas"></canvas></div></div>`;
  new Chart(document.getElementById('rel-canvas'), {
    type: 'doughnut',
    data: { labels: Object.keys(tipos), datasets: [{ data: Object.values(tipos), backgroundColor: ['#3B82F6','#F97316','#22C55E','#8B5CF6','#EF4444'], borderWidth:0, hoverOffset:6 }] },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'right',labels:{color:'#9CA3AF',padding:16}},tooltip:{backgroundColor:'#1F2937',padding:10,cornerRadius:8}} }
  });
}

async function relClientes() { toast('Em desenvolvimento','info'); }
async function relTransportes() {
  const data = await API.get('/api/transportes');
  const counts = { disponivel:0, em_rota:0, manutencao:0 };
  data.forEach(t => counts[t.status]=(counts[t.status]||0)+1);
  const el = document.getElementById('rel-chart-area');
  el.innerHTML = `<div class="card"><div class="card-title">Status da Frota</div><div style="height:300px"><canvas id="rel-canvas"></canvas></div></div>`;
  new Chart(document.getElementById('rel-canvas'), {
    type: 'doughnut',
    data: { labels: ['Disponível','Em rota','Manutenção'], datasets: [{ data: [counts.disponivel,counts.em_rota,counts.manutencao], backgroundColor: ['#22C55E','#3B82F6','#F97316'], borderWidth:0, hoverOffset:6 }] },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'right',labels:{color:'#9CA3AF',padding:16}},tooltip:{backgroundColor:'#1F2937',padding:10,cornerRadius:8}} }
  });
}
