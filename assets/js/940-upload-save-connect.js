/* TechSysLab Phase 14C — Upload Save + DB Apply
 * Temporary endpoint bridge. Works after temp front gate unlock.
 * Server endpoints: /api/public/upload/schedule, /api/public/upload/quality
 */
(function(){
  'use strict';
  var API_BASE = 'https://api.techsyslab.com';
  var PANEL_ID = 'tsl-upload-save-panel';
  var SESSION_KEY = 'techsyslab.tempAccess.v1';

  function gateUnlocked(){ try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch(e){ return false; } }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function q(id){ return document.getElementById(id); }

  function css(){
    if (q('tsl-upload-save-style')) return;
    var style = document.createElement('style');
    style.id = 'tsl-upload-save-style';
    style.textContent = [
      '#'+PANEL_ID+'{margin:14px 0;padding:14px 16px;border:1px solid rgba(88,166,255,.25);border-radius:14px;background:rgba(13,17,23,.9);box-shadow:0 10px 30px rgba(0,0,0,.18);font-size:12px;line-height:1.5}',
      '#'+PANEL_ID+' .tsl-up-head{display:flex;gap:8px;align-items:center;margin-bottom:10px;font-weight:800;color:#58a6ff}',
      '#'+PANEL_ID+' .tsl-up-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
      '#'+PANEL_ID+' .tsl-up-card{border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:10px;background:rgba(255,255,255,.035)}',
      '#'+PANEL_ID+' input[type=file]{display:block;width:100%;margin:8px 0;color:#c9d1d9;font-size:11px}',
      '#'+PANEL_ID+' button{border:0;border-radius:8px;padding:8px 10px;background:#238636;color:#fff;font-weight:700;cursor:pointer;font-size:12px}',
      '#'+PANEL_ID+' button:disabled{opacity:.5;cursor:not-allowed}',
      '#'+PANEL_ID+' .tsl-up-msg{margin-top:10px;padding:9px 10px;border-radius:8px;background:rgba(255,255,255,.04);color:#8b949e;white-space:pre-wrap}',
      '#'+PANEL_ID+' .ok{color:#3fb950}.err{color:#f85149}.muted{color:#8b949e}',
      '@media(max-width:720px){#'+PANEL_ID+' .tsl-up-grid{grid-template-columns:1fr}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function findMount(){
    return document.querySelector('main') || document.querySelector('.main') || document.querySelector('#app') || document.body;
  }

  function html(){
    return [
      '<section id="'+PANEL_ID+'">',
      '  <div class="tsl-up-head"><span>서버 파일 업로드 / DB 반영</span><span class="muted" style="margin-left:auto;font-weight:400">서버 PC 저장 기준</span></div>',
      '  <div class="tsl-up-grid">',
      '    <div class="tsl-up-card">',
      '      <strong>생산일정 엑셀 업로드</strong>',
      '      <input id="tsl-file-schedule" type="file" accept=".xlsx,.csv,.tsv">',
      '      <button id="tsl-btn-schedule" type="button">생산일정 저장/반영</button>',
      '    </div>',
      '    <div class="tsl-up-card">',
      '      <strong>품질/불량 엑셀 업로드</strong>',
      '      <input id="tsl-file-quality" type="file" accept=".xlsx,.csv,.tsv">',
      '      <button id="tsl-btn-quality" type="button">품질 데이터 저장/반영</button>',
      '    </div>',
      '  </div>',
      '  <div id="tsl-upload-msg" class="tsl-up-msg">파일을 선택한 뒤 저장/반영을 누르세요. 저장 위치: 서버 PC uploads/source_files, 표시 기준: 서버 DB</div>',
      '</section>'
    ].join('');
  }

  function setMsg(text, kind){
    var el = q('tsl-upload-msg');
    if (!el) return;
    el.className = 'tsl-up-msg ' + (kind || '');
    el.textContent = text;
  }

  function setBusy(busy){
    ['tsl-btn-schedule','tsl-btn-quality'].forEach(function(id){ var b=q(id); if(b) b.disabled = !!busy; });
  }

  function upload(type){
    var input = q(type === 'schedule' ? 'tsl-file-schedule' : 'tsl-file-quality');
    if (!input || !input.files || !input.files[0]) { setMsg('먼저 파일을 선택하세요.', 'err'); return; }
    var file = input.files[0];
    var fd = new FormData();
    fd.append('file', file);
    fd.append('uploaded_by', 'temp-web');
    setBusy(true);
    setMsg('업로드 중...\n' + file.name, '');
    fetch(API_BASE + '/api/public/upload/' + type, { method:'POST', body: fd, cache:'no-store' })
      .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ if(!r.ok){ throw new Error((j.detail && (j.detail.message || j.detail.error)) || j.detail || ('HTTP '+r.status)); } return j; }); })
      .then(function(j){
        var c = j.db || {};
        setMsg('저장/반영 완료\n파일: ' + (j.originalFilename || file.name) + '\n추출 행: ' + (j.rowCount != null ? j.rowCount : '-') + '\nDB 반영 행: ' + (j.insertedCount != null ? j.insertedCount : '-') + '\n생산일정: ' + (c.scheduleRowCount != null ? c.scheduleRowCount : '-') + ' / 품질: ' + (c.qualityIssueCount != null ? c.qualityIssueCount : '-'), 'ok');
        if (window.TechSysLabBootstrap && window.TechSysLabBootstrap.reload) window.TechSysLabBootstrap.reload();
      })
      .catch(function(e){ setMsg('업로드 실패\n' + (e && e.message ? e.message : e), 'err'); })
      .finally(function(){ setBusy(false); });
  }

  function mount(){
    if (!gateUnlocked()) return;
    if (q(PANEL_ID)) return;
    css();
    var wrap = document.createElement('div');
    wrap.innerHTML = html();
    var mountPoint = findMount();
    mountPoint.insertBefore(wrap.firstChild, mountPoint.firstChild);
    var bs = q('tsl-btn-schedule'); if (bs) bs.addEventListener('click', function(){ upload('schedule'); });
    var bq = q('tsl-btn-quality'); if (bq) bq.addEventListener('click', function(){ upload('quality'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  document.addEventListener('tsl:gate-unlocked', mount);
})();
