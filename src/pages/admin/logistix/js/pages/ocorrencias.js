async function renderOcorrencias() {
  const [abertas, todas] = await Promise.all([
    API.get('/api/ocorrencias?status=aberta'),
    API.get('/api/ocorrencias'),
  ]);
  document.getElementById('page-content').innerHTML = `
  <div class="stats-row">
    <div class="stat-mini"><div class="stat-mini-val">${todas.length}</div><div class="stat-mini-lbl">Total</div></div>
    <div class="stat-mini"><div class="stat-mini-val" style="color:var(--red)">${abertas.length}</div><div class="stat-mini-lbl">Abertas</div></div>
    <div class="stat-mini"><div class="stat-mini-val" style="color:var(--green)">${todas.filter(o=>o.status==='resolvida').length}</div><div class="stat-mini-lbl">Resolvidas</div></div>
    <div class="stat-mini"><div class="stat-mini-val" style="color:var(--orange)">${todas.filter(o=>o.prioridade==='alta').length}</div><div class="stat-mini-lbl">Alta prioridade</div></div>
  </div>
  <div class="card">
    <div class="table-wrap">
      <table>
        <thead><tr><th>Pedido</th><th>Tipo</th><th>Descrição</th><th>Prioridade</th><th>Status</th><th>Data</th><th></th></tr></thead>
        <tbody>
          ${todas.map(o=>`<tr>
            <td style="color:var(--text-2);font-size:12px">${o.codigo||'—'}</td>
            <td style="font-weight:500">${o.tipo}</td>
            <td style="color:var(--text-2);font-size:12px">${o.descricao}</td>
            <td>${o.prioridade==='alta'?`<span style="color:var(--red);font-weight:600">Alta</span>`:`<span style="color:var(--text-2)">Média</span>`}</td>
            <td>${badge(o.status)}</td>
            <td style="color:var(--text-2)">${fmtDate(o.created_at)}</td>
            <td>
              ${o.status==='aberta'?`<button class="icon-btn" style="width:30px;height:30px" onclick="resolverOcorrencia(${o.id})"><i data-lucide="check"></i></button>`:''}
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
  lucide.createIcons({ nodes:[document.getElementById('page-content')] });
}

async function resolverOcorrencia(id) {
  await API.put(`/api/ocorrencias/${id}`, { status: 'resolvida' });
  toast('Ocorrência resolvida!','success'); renderOcorrencias();
}
