let _donutChart = null, _perfChart = null;

async function renderDashboard() {
  const [kpis, statusData, perfData, recentOrders, armazens] = await Promise.all([
    API.get('/api/dashboard/kpis'),
    API.get('/api/dashboard/status-entregas'),
    API.get('/api/dashboard/performance'),
    API.get('/api/dashboard/pedidos-recentes'),
    API.get('/api/armazens'),
  ]);

  document.getElementById('page-content').innerHTML = `
  <div class="dash-section">
    <!-- Date filter -->
    <div style="display:flex;justify-content:flex-end;padding:16px 0 0">
      <div class="date-picker-btn">
        <i data-lucide="calendar" style="width:14px;height:14px"></i>
        <span style="font-size:12px;color:var(--text-2)">01/05/2025 — 31/05/2025</span>
        <i data-lucide="chevron-down" style="width:14px;height:14px;color:var(--text-3)"></i>
      </div>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-top"><div class="kpi-icon" style="background:#1D4ED8"><i data-lucide="package"></i></div><span class="kpi-label">Pedidos Totais</span></div>
        <div class="kpi-value">${fmt(kpis.total)}</div>
        <div class="kpi-trend up">+18.2% vs mês anterior</div>
        <div class="kpi-sparkline"><canvas id="sp1" height="44"></canvas></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-top"><div class="kpi-icon" style="background:#15803D"><i data-lucide="check-circle"></i></div><span class="kpi-label">Entregas Concluídas</span></div>
        <div class="kpi-value">${fmt(kpis.concluidas)}</div>
        <div class="kpi-trend up">+22.7% vs mês anterior</div>
        <div class="kpi-sparkline"><canvas id="sp2" height="44"></canvas></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-top"><div class="kpi-icon" style="background:#C2410C"><i data-lucide="alert-triangle"></i></div><span class="kpi-label">Atrasos</span></div>
        <div class="kpi-value">${fmt(kpis.atrasos)}</div>
        <div class="kpi-trend down">-15.3% vs mês anterior</div>
        <div class="kpi-sparkline"><canvas id="sp3" height="44"></canvas></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-top"><div class="kpi-icon" style="background:#6D28D9"><i data-lucide="percent"></i></div><span class="kpi-label">Taxa de Entrega</span></div>
        <div class="kpi-value">${kpis.taxa}%</div>
        <div class="kpi-trend up">+5.7% vs mês anterior</div>
        <div class="kpi-sparkline"><canvas id="sp4" height="44"></canvas></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-top"><div class="kpi-icon" style="background:#92400E"><i data-lucide="dollar-sign"></i></div><span class="kpi-label">Custo Logístico</span></div>
        <div class="kpi-value" style="font-size:19px">R$ ${fmt(Math.round(kpis.custo))}</div>
        <div class="kpi-trend down">-8.6% vs mês anterior</div>
        <div class="kpi-sparkline"><canvas id="sp5" height="44"></canvas></div>
      </div>
    </div>

    <!-- Mid row -->
    <div class="grid-3 col-2-1-1">
      <!-- Map -->
      <div class="card map-card">
        <div class="card-title">Expedições em Tempo Real</div>
        <div class="map-box">
          <svg viewBox="0 0 520 260" preserveAspectRatio="xMidYMid meet">
            <rect width="520" height="260" fill="#060d1a"/>
            <!-- Background grid lines -->
            <line x1="0" y1="65" x2="520" y2="65" stroke="#0d1f38" stroke-width="1"/>
            <line x1="0" y1="130" x2="520" y2="130" stroke="#0d1f38" stroke-width="1"/>
            <line x1="0" y1="195" x2="520" y2="195" stroke="#0d1f38" stroke-width="1"/>
            <line x1="130" y1="0" x2="130" y2="260" stroke="#0d1f38" stroke-width="1"/>
            <line x1="260" y1="0" x2="260" y2="260" stroke="#0d1f38" stroke-width="1"/>
            <line x1="390" y1="0" x2="390" y2="260" stroke="#0d1f38" stroke-width="1"/>
            <!-- State labels -->
            <text x="170" y="80" fill="#1a3050" font-size="11" font-family="Inter">MG</text>
            <text x="290" y="160" fill="#1a3050" font-size="11" font-family="Inter">SC</text>
            <text x="380" y="90" fill="#1a3050" font-size="13" font-family="Inter" font-weight="600">RJ</text>
            <!-- Routes -->
            <path d="M95 155 Q200 100 330 115" fill="none" stroke="#F97316" stroke-width="2.5" stroke-dasharray="6,4" opacity=".9"/>
            <path d="M95 155 L200 185" fill="none" stroke="#22C55E" stroke-width="2.5" opacity=".9"/>
            <path d="M200 185 L330 115" fill="none" stroke="#8B5CF6" stroke-width="2.5" opacity=".9"/>
            <path d="M330 115 L420 90" fill="none" stroke="#3B82F6" stroke-width="2.5" opacity=".9"/>
            <path d="M200 185 Q240 230 300 220" fill="none" stroke="#FACC15" stroke-width="2" stroke-dasharray="5,3" opacity=".8"/>
            <!-- Markers -->
            <circle cx="95" cy="155" r="16" fill="#22C55E" fill-opacity=".15" stroke="#22C55E" stroke-width="2"/>
            <circle cx="95" cy="155" r="8" fill="#22C55E"/>
            <text x="95" y="159" fill="#fff" font-size="8" font-family="Inter" font-weight="700" text-anchor="middle">SP</text>
            <circle cx="330" cy="115" r="16" fill="#22C55E" fill-opacity=".15" stroke="#22C55E" stroke-width="2"/>
            <circle cx="330" cy="115" r="8" fill="#22C55E"/>
            <circle cx="200" cy="185" r="16" fill="#F97316" fill-opacity=".15" stroke="#F97316" stroke-width="2"/>
            <circle cx="200" cy="185" r="8" fill="#F97316"/>
            <circle cx="420" cy="90" r="14" fill="#8B5CF6" fill-opacity=".15" stroke="#8B5CF6" stroke-width="2"/>
            <circle cx="420" cy="90" r="7" fill="#8B5CF6"/>
            <circle cx="300" cy="220" r="13" fill="#3B82F6" fill-opacity=".15" stroke="#3B82F6" stroke-width="2"/>
            <circle cx="300" cy="220" r="6" fill="#3B82F6"/>
          </svg>
          <div class="map-btns">
            <button><i data-lucide="plus"></i></button>
            <button><i data-lucide="minus"></i></button>
            <button><i data-lucide="maximize-2"></i></button>
          </div>
          <div class="map-label">● Ao vivo</div>
        </div>
      </div>

      <!-- Donut -->
      <div class="card">
        <div class="card-title">Status das Entregas</div>
        <div class="donut-wrap">
          <canvas id="donut-chart"></canvas>
          <div class="donut-center">
            <span class="donut-num">${fmt(kpis.total)}</span>
            <span class="donut-lbl">Total</span>
          </div>
        </div>
        <div class="status-legend">
          <div class="leg-row"><span class="leg-dot" style="background:#22C55E"></span><span class="leg-label">Entregue</span><span class="leg-val">${fmt(kpis.concluidas)} (${kpis.taxa}%)</span></div>
          <div class="leg-row"><span class="leg-dot" style="background:#3B82F6"></span><span class="leg-label">Em trânsito</span><span class="leg-val">${fmt(kpis.emTransito)} (${((kpis.emTransito/kpis.total)*100).toFixed(1)}%)</span></div>
          <div class="leg-row"><span class="leg-dot" style="background:#F97316"></span><span class="leg-label">Atrasado</span><span class="leg-val">${fmt(kpis.atrasos)} (${((kpis.atrasos/kpis.total)*100).toFixed(1)}%)</span></div>
          <div class="leg-row"><span class="leg-dot" style="background:#EF4444"></span><span class="leg-label">Cancelado</span><span class="leg-val">${fmt(kpis.cancelados)} (${((kpis.cancelados/kpis.total)*100).toFixed(1)}%)</span></div>
        </div>
        <button class="btn-secondary" style="width:100%;justify-content:center;margin-top:12px" onclick="navigate('entregas')">Ver todas as entregas</button>
      </div>

      <!-- Estoque -->
      <div class="card">
        <div class="card-title">Estoque por Armazém</div>
        <div class="prog-list">
          ${armazens.map(a => {
            const pct = Math.round((a.ocupacao / a.capacidade) * 100);
            const color = pct > 80 ? '#22C55E' : pct > 60 ? '#FACC15' : '#EF4444';
            return `<div class="prog-item">
              <div class="prog-header"><span>${a.nome}</span><span>${pct}%</span></div>
              <div class="prog-bar"><div class="prog-fill" style="width:${pct}%;background:${color}"></div></div>
            </div>`;
          }).join('')}
        </div>
        <button class="btn-secondary" style="width:100%;justify-content:center;margin-top:16px" onclick="navigate('armazens')">Ver todos os armazéns</button>
      </div>
    </div>

    <!-- Bottom row -->
    <div class="grid-3 col-2-1">
      <!-- Recent Orders -->
      <div class="card">
        <div class="card-title">Pedidos Recentes</div>
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Pedido</th><th>Cliente</th><th>Origem</th><th>Destino</th><th>Status</th><th>Previsão</th>
            </tr></thead>
            <tbody>
              ${recentOrders.map(p => `<tr>
                <td style="color:var(--text-2);font-size:12px">${p.codigo}</td>
                <td>${p.cliente}</td>
                <td style="color:var(--text-2)">${p.origem}</td>
                <td style="color:var(--text-2)">${p.destino_cidade} - ${p.destino_estado}</td>
                <td>${badge(p.status)}</td>
                <td style="color:var(--text-2)">${fmtDate(p.previsao)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div class="tbl-footer"><a href="#" onclick="navigate('pedidos')">Ver todos os pedidos</a></div>
      </div>

      <!-- Performance Chart -->
      <div class="card">
        <div class="perf-header">
          <div class="card-title" style="margin:0">Performance de Entregas</div>
          <select class="filter-sel"><option>Diário</option><option>Semanal</option><option>Mensal</option></select>
        </div>
        <div style="height:180px;position:relative"><canvas id="perf-chart"></canvas></div>
        <div class="chart-legend">
          <div class="leg-line-item"><div class="leg-line" style="background:#22C55E"></div>Entregas no prazo</div>
          <div class="leg-line-item"><div class="leg-line" style="background:#F97316"></div>Entregas com atraso</div>
        </div>
      </div>
    </div>
  </div>`;

  lucide.createIcons({ nodes: [document.getElementById('page-content')] });

  // Sparklines
  sparkline('sp1', [30,42,38,55,48,63,57,72,65,80], '#3B82F6');
  sparkline('sp2', [20,32,27,44,38,54,48,64,58,76], '#22C55E');
  sparkline('sp3', [18,14,16,10,14,9,6,8,5,4], '#F97316');
  sparkline('sp4', [80,81,80,84,83,87,86,89,88,92], '#8B5CF6');
  sparkline('sp5', [48,52,55,60,56,62,65,68,63,70], '#FACC15');

  // Donut
  if (_donutChart) _donutChart.destroy();
  const statusMap = {};
  statusData.forEach(s => statusMap[s.status] = s.count);
  _donutChart = new Chart(document.getElementById('donut-chart'), {
    type: 'doughnut',
    data: {
      labels: ['Entregue','Em trânsito','Atrasado','Cancelado'],
      datasets: [{ data: [statusMap.entregue||0, statusMap.em_transito||0, statusMap.atrasado||0, statusMap.cancelado||0],
        backgroundColor: ['#22C55E','#3B82F6','#F97316','#EF4444'], borderWidth: 0, hoverOffset: 6 }]
    },
    options: {
      cutout: '74%', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1F2937', padding: 10, cornerRadius: 8 } }
    }
  });

  // Performance
  if (_perfChart) _perfChart.destroy();
  const ctx = document.getElementById('perf-chart').getContext('2d');
  const g = ctx.createLinearGradient(0,0,0,180);
  g.addColorStop(0,'rgba(34,197,94,.2)'); g.addColorStop(1,'rgba(34,197,94,0)');
  _perfChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: perfData.map(d=>d.data),
      datasets: [
        { label:'No prazo', data: perfData.map(d=>d.no_prazo), borderColor:'#22C55E', backgroundColor: g, fill:true, tension:.4, borderWidth:2, pointRadius:0, pointHoverRadius:4 },
        { label:'Atrasadas', data: perfData.map(d=>d.atrasadas), borderColor:'#F97316', fill:false, tension:.4, borderWidth:2, pointRadius:0, pointHoverRadius:4 }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{mode:'index',intersect:false,backgroundColor:'#1F2937',padding:10,cornerRadius:8} },
      scales:{
        x:{grid:{display:false},ticks:{color:'#6B7280',font:{size:11}}},
        y:{min:0,max:100,grid:{color:'rgba(255,255,255,.04)',drawBorder:false},ticks:{color:'#6B7280',font:{size:11},callback:v=>v+'%'}}
      }
    }
  });
}
