function renderConfiguracoes() {
  document.getElementById('page-content').innerHTML = `
  <div style="max-width:640px;padding:16px 0">
    <div class="config-section">
      <h4>Geral</h4>
      <div class="config-row">
        <div><div class="config-label">Nome da empresa</div><div class="config-desc">Exibido no topo do sistema</div></div>
        <input class="input-field" value="Logistix" style="width:200px">
      </div>
      <div class="config-row">
        <div><div class="config-label">Fuso horário</div><div class="config-desc">Para datas e horários</div></div>
        <select class="input-field" style="width:200px"><option>America/Sao_Paulo</option><option>UTC</option></select>
      </div>
    </div>
    <div class="config-section">
      <h4>Notificações</h4>
      <div class="config-row">
        <div><div class="config-label">Alertas de atraso</div><div class="config-desc">Notificar quando pedido atrasar</div></div>
        <div class="toggle on" onclick="this.classList.toggle('on')"></div>
      </div>
      <div class="config-row">
        <div><div class="config-label">Estoque crítico</div><div class="config-desc">Alertar quando estoque abaixo de 10%</div></div>
        <div class="toggle on" onclick="this.classList.toggle('on')"></div>
      </div>
      <div class="config-row">
        <div><div class="config-label">Relatório diário por email</div><div class="config-desc">Resumo enviado às 8h</div></div>
        <div class="toggle" onclick="this.classList.toggle('on')"></div>
      </div>
    </div>
    <div class="config-section">
      <h4>Aparência</h4>
      <div class="config-row">
        <div><div class="config-label">Tema escuro</div><div class="config-desc">Ativado por padrão</div></div>
        <div class="toggle on" onclick="this.classList.toggle('on')"></div>
      </div>
      <div class="config-row">
        <div><div class="config-label">Animações</div><div class="config-desc">Transições e microanimações</div></div>
        <div class="toggle on" onclick="this.classList.toggle('on')"></div>
      </div>
    </div>
    <div class="config-section">
      <h4>Segurança</h4>
      <div class="config-row">
        <div><div class="config-label">Autenticação 2FA</div><div class="config-desc">Adiciona camada extra de segurança</div></div>
        <div class="toggle" onclick="this.classList.toggle('on')"></div>
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-top:8px">
      <button class="btn-primary" onclick="toast('Configurações salvas!','success')">Salvar alterações</button>
      <button class="btn-secondary" onclick="toast('Alterações descartadas.','info')">Cancelar</button>
    </div>
  </div>`;
}
