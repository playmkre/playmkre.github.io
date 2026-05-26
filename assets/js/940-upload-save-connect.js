/* TechSysLab Phase 14C-1 — Upload Button Binding Fix
 * Purpose: make schedule button ALWAYS call /api/public/upload/schedule
 *          and quality button ALWAYS call /api/public/upload/quality.
 * This script is frontend-only. Server folder is not changed.
 */
(function(){
  'use strict';

  var API_BASE = 'https://api.techsyslab.com';
  var PANEL_ID = 'tsl-upload-save-panel';
  var SESSION_KEY = 'techsyslab.tempAccess.v1';

  function gateUnlocked(){
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch(e){ return false; }
  }
  function q(id){ return document.getElementById(id); }
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function css(){
    if (q('tsl-upload-save-style')) return;
    var style = document.createElement('style');
    style.id = 'tsl-upload-save-style';
    style.textContent = [
      '#'+PANEL_ID+'{margin:14px 0;padding:14px 16px;border:1px solid rgba(88,166,255,.25);border-radius:14px;background:rgba(13,17,23,.94);box-shadow:0 10px 30px rgba(0,0,0,.18);font-size:12px;line-height:1.5}',
      '#'+PANEL_ID+' .tsl-up-head{display:flex;gap:8px;align-items:center;margin-bottom:10px;font-weight:800;color:#58a6ff}',
      '#'+PANEL_ID+' .tsl-up-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
      '#'+PANEL_ID+' .tsl-up-card{border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px;background:rgba(255,255,255,.035)}',
      '#'+PANEL_ID+' .tsl-up-card.schedule{border-color:rgba(88,166,255,.35)}',
      '#'+PANEL_ID+' .tsl-up-card.quality{border-color:rgba(63,185,80,.35)}',
      '#'+PANEL_ID+' input[type=file]{display:block;width:100%;margin:8px 0;color:#c9d1d9;font-size:11px}',
      '#'+PANEL_ID+' button{border:0;border-radius:8px;padding:8px 10px;color:#fff;font-weight:800;cursor:pointer;font-size:12px}',
      '#'+PANEL_ID+' button.schedule{background:#1f6feb}',
      '#'+PANEL_ID+' button.quality{background:#238636}',
      '#'+PANEL_ID+' button:disabled{opacity:.5;cursor:not-allowed}',
      '#'+PANEL_ID+' .tsl-up-msg{margin-top:8px;padding:8px 9px;border-radius:8px;background:rgba(255,255,255,.04);color:#8b949e;white-space:pre-wrap;min-height:38px}',
      '#'+PANEL_ID+' .ok{color:#3fb950}.err{color:#f85149}.muted{color:#8b949e}',
      '@media(max-width:720px){#'+PANEL_ID+' .tsl-up-grid{grid-template-columns:1fr}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function findMount(){
    return document.querySelector('main') || document.querySelector('.main') || document.querySelector('#app') || document.body;
  }

  function panelHtml(){
    return [
      '<section id="'+PANEL_ID+'" data-version="phase14c-1-button-fix">',
      '  <div class="tsl-up-head"><span>서버 파일 업로드 / DB 반영</span><span class="muted" style="margin-left:auto;font-weight:400">버튼 분리 고정판</span></div>',
      '  <div class="tsl-up-grid">',
      '    <div class="tsl-up-card schedule">',
      '      <strong>생산일정 엑셀 업로드</strong>',
      '      <input id="tsl14c-schedule-file" type="file" accept=".xlsx,.csv,.tsv">',
      '      <button id="tsl14c-schedule-button" class="schedule" type="button" data-upload-type="schedule">생산일정 저장/반영</button>',
      '      <div id="tsl14c-schedule-msg" class="tsl-up-msg">생산일정 파일만 선택하고 이 버튼을 누르세요. 호출 API: /api/public/upload/schedule</div>',
      '    </div>',
      '    <div class="tsl-up-card quality">',
      '      <strong>품질/불량 엑셀 업로드</strong>',
      '      <input id="tsl14c-quality-file" type="file" accept=".xlsx,.csv,.tsv">',
      '      <button id="tsl14c-quality-button" class="quality" type="button" data-upload-type="quality">품질 데이터 저장/반영</button>',
      '      <div id="tsl14c-quality-msg" class="tsl-up-msg">품질/불량 파일만 선택하고 이 버튼을 누르세요. 호출 API: /api/public/upload/quality</div>',
      '    </div>',
      '  </div>',
      '</section>'
    ].join('');
  }

  function setMsg(type, text, kind){
    var el = q(type === 'schedule' ? 'tsl14c-schedule-msg' : 'tsl14c-quality-msg');
    if (!el) return;
    el.className = 'tsl-up-msg ' + (kind || '');
    el.textContent = text;
  }

  function setBusy(type, busy){
    var b = q(type === 'schedule' ? 'tsl14c-schedule-button' : 'tsl14c-quality-button');
    if (b) b.disabled = !!busy;
  }

  function uploadExact(type){
    var inputId = type === 'schedule' ? 'tsl14c-schedule-file' : 'tsl14c-quality-file';
    var endpoint = type === 'schedule' ? '/api/public/upload/schedule' : '/api/public/upload/quality';
    var input = q(inputId);
    if (!input || !input.files || !input.files[0]) {
      setMsg(type, (type === 'schedule' ? '생산일정' : '품질/불량') + ' 파일을 먼저 선택하세요.', 'err');
      return;
    }

    var file = input.files[0];
    var fd = new FormData();
    fd.append('file', file);
    fd.append('uploaded_by', 'temp-web');

    setBusy(type, true);
    setMsg(type, '업로드 중...\n종류: ' + type + '\nAPI: ' + endpoint + '\n파일: ' + file.name, '');

    fetch(API_BASE + endpoint, { method:'POST', body: fd, cache:'no-store' })
      .then(function(r){
        return r.json().catch(function(){ return {}; }).then(function(j){
          if(!r.ok){
            var detail = j.detail;
            var msg = (detail && (detail.message || detail.error)) || (typeof detail === 'string' ? detail : '') || ('HTTP ' + r.status);
            throw new Error(msg);
          }
          return j;
        });
      })
      .then(function(j){
        var c = j.db || {};
        var serverType = j.uploadType || j.upload_type || type;
        var rowCount = j.rowCount != null ? j.rowCount : (j.row_count != null ? j.row_count : '-');
        var inserted = j.insertedCount != null ? j.insertedCount : (j.inserted_count != null ? j.inserted_count : '-');
        setMsg(type,
          '저장/반영 완료\n' +
          '요청 종류: ' + type + '\n' +
          '서버 응답 종류: ' + serverType + '\n' +
          'API: ' + endpoint + '\n' +
          '파일: ' + (j.originalFilename || j.original_filename || file.name) + '\n' +
          '추출 행: ' + rowCount + '\n' +
          'DB 반영 행: ' + inserted + '\n' +
          '생산일정: ' + (c.scheduleRowCount != null ? c.scheduleRowCount : '-') + ' / 품질: ' + (c.qualityIssueCount != null ? c.qualityIssueCount : '-'),
          'ok'
        );
        if (window.TechSysLabBootstrap && window.TechSysLabBootstrap.reload) {
          window.TechSysLabBootstrap.reload();
        }
      })
      .catch(function(e){
        setMsg(type, '업로드 실패\n종류: ' + type + '\nAPI: ' + endpoint + '\n' + (e && e.message ? e.message : e), 'err');
      })
      .finally(function(){ setBusy(type, false); });
  }

  function bindButton(id, type){
    var oldBtn = q(id);
    if (!oldBtn) return;
    var btn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(btn, oldBtn);
    btn.addEventListener('click', function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      uploadExact(type);
    }, true);
  }

  function mount(){
    if (!gateUnlocked()) return;
    css();
    var existing = q(PANEL_ID);
    if (existing) existing.remove();
    var wrap = document.createElement('div');
    wrap.innerHTML = panelHtml();
    var mountPoint = findMount();
    mountPoint.insertBefore(wrap.firstChild, mountPoint.firstChild);
    bindButton('tsl14c-schedule-button', 'schedule');
    bindButton('tsl14c-quality-button', 'quality');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  document.addEventListener('tsl:gate-unlocked', mount);
})();
