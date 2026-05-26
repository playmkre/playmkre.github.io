/* TechSysLab Phase 14C-2 — Upload Workspace Split Results
 * Frontend-only fix.
 * Goal:
 *   - Schedule upload and Quality upload must be independent.
 *   - Each upload card has its own input, button, status/result box, and latest response.
 *   - UI is registry-based so future upload types can be added by adding one config object.
 */
(function(){
  'use strict';

  var API_BASE = 'https://api.techsyslab.com';
  var SESSION_KEY = 'techsyslab.tempAccess.v1';
  var PANEL_ID = 'tsl-upload-workspace-panel';
  var OLD_PANEL_ID = 'tsl-upload-save-panel';

  var UPLOAD_ITEMS = [
    {
      key: 'schedule',
      label: '생산일정',
      title: '생산일정 엑셀 업로드',
      button: '생산일정 저장/반영',
      endpoint: '/api/public/upload/schedule',
      help: '생산일정 파일만 이 영역에서 업로드합니다. 결과도 이 카드 안에만 표시됩니다.',
      accent: '#58a6ff'
    },
    {
      key: 'quality',
      label: '품질/불량',
      title: '품질/불량 엑셀 업로드',
      button: '품질 데이터 저장/반영',
      endpoint: '/api/public/upload/quality',
      help: '품질/불량 파일만 이 영역에서 업로드합니다. 결과도 이 카드 안에만 표시됩니다.',
      accent: '#3fb950'
    }
  ];

  function gateUnlocked(){
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch(e){ return false; }
  }
  function byId(id){ return document.getElementById(id); }
  function esc(v){
    return String(v == null ? '' : v).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function fmt(v){ return v == null || v === '' ? '-' : String(v); }

  function injectStyle(){
    if (byId('tsl-upload-workspace-style')) return;
    var style = document.createElement('style');
    style.id = 'tsl-upload-workspace-style';
    style.textContent = [
      '#'+PANEL_ID+'{margin:14px 0 18px;padding:16px;border:1px solid rgba(88,166,255,.28);border-radius:16px;background:#0d1117;color:#c9d1d9;box-shadow:0 10px 28px rgba(0,0,0,.22);font-size:12px;line-height:1.55}',
      '#'+PANEL_ID+' *{box-sizing:border-box}',
      '#'+PANEL_ID+' .tsl-ws-head{display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;border-bottom:1px solid rgba(255,255,255,.08);padding-bottom:12px}',
      '#'+PANEL_ID+' .tsl-ws-title{font-size:14px;font-weight:900;color:#58a6ff}',
      '#'+PANEL_ID+' .tsl-ws-sub{margin-top:3px;color:#8b949e;font-size:11px}',
      '#'+PANEL_ID+' .tsl-ws-badge{margin-left:auto;white-space:nowrap;border:1px solid rgba(88,166,255,.28);border-radius:999px;padding:4px 9px;color:#9ecbff;background:rgba(88,166,255,.08);font-size:11px}',
      '#'+PANEL_ID+' .tsl-ws-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px;align-items:stretch}',
      '#'+PANEL_ID+' .tsl-ws-card{position:relative;min-height:260px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(22,27,34,.96);padding:14px;display:flex;flex-direction:column;gap:10px;overflow:hidden}',
      '#'+PANEL_ID+' .tsl-ws-card:before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--accent,#58a6ff)}',
      '#'+PANEL_ID+' .tsl-ws-card-head{display:flex;align-items:flex-start;gap:8px}',
      '#'+PANEL_ID+' .tsl-ws-card-title{font-weight:900;color:#fff;font-size:13px}',
      '#'+PANEL_ID+' .tsl-ws-endpoint{margin-left:auto;text-align:right;color:#8b949e;font-size:10px;line-height:1.35}',
      '#'+PANEL_ID+' .tsl-ws-help{color:#8b949e;font-size:11px;min-height:32px}',
      '#'+PANEL_ID+' .tsl-ws-file{display:block;width:100%;padding:8px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:#161b22;color:#c9d1d9;font-size:12px}',
      '#'+PANEL_ID+' .tsl-ws-btn-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}',
      '#'+PANEL_ID+' button.tsl-ws-upload{border:0;border-radius:10px;padding:9px 12px;font-weight:900;color:#fff;background:var(--accent,#238636);cursor:pointer;font-size:12px}',
      '#'+PANEL_ID+' button.tsl-ws-upload:disabled{opacity:.55;cursor:not-allowed}',
      '#'+PANEL_ID+' .tsl-ws-reset{border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:8px 10px;background:rgba(255,255,255,.04);color:#c9d1d9;cursor:pointer;font-size:11px}',
      '#'+PANEL_ID+' .tsl-ws-result{margin-top:2px;min-height:110px;padding:10px;border-radius:12px;background:rgba(1,4,9,.55);border:1px solid rgba(255,255,255,.10);white-space:pre-wrap;color:#8b949e;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:11px}',
      '#'+PANEL_ID+' .tsl-ws-result.ok{border-color:rgba(63,185,80,.35);color:#3fb950;background:rgba(35,134,54,.09)}',
      '#'+PANEL_ID+' .tsl-ws-result.err{border-color:rgba(248,81,73,.35);color:#ff7b72;background:rgba(248,81,73,.08)}',
      '#'+PANEL_ID+' .tsl-ws-result.busy{border-color:rgba(88,166,255,.35);color:#9ecbff;background:rgba(88,166,255,.08)}',
      '#'+PANEL_ID+' .tsl-ws-footer{margin-top:14px;display:grid;grid-template-columns:minmax(220px,1fr) minmax(220px,1fr);gap:12px}',
      '#'+PANEL_ID+' .tsl-ws-summary{border:1px solid rgba(255,255,255,.1);border-radius:12px;background:rgba(255,255,255,.035);padding:10px;color:#8b949e;min-height:58px}',
      '#'+PANEL_ID+' .tsl-ws-summary strong{color:#fff}',
      '#'+PANEL_ID+' .tsl-ws-mini{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}',
      '#'+PANEL_ID+' .tsl-ws-mini div{border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:8px;background:rgba(0,0,0,.12)}',
      '#'+PANEL_ID+' .tsl-ws-mini b{display:block;color:#fff;font-size:15px}',
      '@media(max-width:760px){#'+PANEL_ID+' .tsl-ws-footer{grid-template-columns:1fr}#'+PANEL_ID+' .tsl-ws-mini{grid-template-columns:1fr}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function removeOldPanels(){
    var old = byId(OLD_PANEL_ID);
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var current = byId(PANEL_ID);
    if (current && current.parentNode) current.parentNode.removeChild(current);
  }

  function findMount(){
    return document.querySelector('main') || document.querySelector('.main') || document.querySelector('#app') || document.body;
  }

  function cardHtml(item){
    var inputId = 'tsl14c-file-' + item.key;
    var btnId = 'tsl14c-btn-' + item.key;
    var resId = 'tsl14c-result-' + item.key;
    var resetId = 'tsl14c-reset-' + item.key;
    return [
      '<article class="tsl-ws-card" data-upload-key="'+esc(item.key)+'" style="--accent:'+esc(item.accent)+'">',
      '  <div class="tsl-ws-card-head">',
      '    <div><div class="tsl-ws-card-title">'+esc(item.title)+'</div></div>',
      '    <div class="tsl-ws-endpoint">'+esc(item.key)+'<br>'+esc(item.endpoint)+'</div>',
      '  </div>',
      '  <div class="tsl-ws-help">'+esc(item.help)+'</div>',
      '  <input class="tsl-ws-file" id="'+inputId+'" type="file" accept=".xlsx,.xls,.csv,.tsv">',
      '  <div class="tsl-ws-btn-row">',
      '    <button class="tsl-ws-upload" id="'+btnId+'" type="button">'+esc(item.button)+'</button>',
      '    <button class="tsl-ws-reset" id="'+resetId+'" type="button">이 항목 초기화</button>',
      '  </div>',
      '  <div class="tsl-ws-result" id="'+resId+'">대기 중\n선택한 파일과 결과는 이 카드 안에만 표시됩니다.</div>',
      '</article>'
    ].join('');
  }

  function panelHtml(){
    return [
      '<section id="'+PANEL_ID+'" data-version="phase14c-2-split-results">',
      '  <div class="tsl-ws-head">',
      '    <div>',
      '      <div class="tsl-ws-title">서버 파일 업로드 / DB 반영</div>',
      '      <div class="tsl-ws-sub">항목별 독립 업로드 구조입니다. 생산일정과 품질/불량은 입력창·버튼·결과창이 분리됩니다. 추후 항목 추가 시 업로드 카드가 늘어나는 방식입니다.</div>',
      '    </div>',
      '    <div class="tsl-ws-badge">서버 PC 저장 기준</div>',
      '  </div>',
      '  <div class="tsl-ws-grid">',
          UPLOAD_ITEMS.map(cardHtml).join(''),
      '  </div>',
      '  <div class="tsl-ws-footer">',
      '    <div class="tsl-ws-summary" id="tsl14c-global-summary"><strong>전체 서버 상태</strong><br>업로드 전입니다. 각 항목 카드에서 따로 업로드하세요.</div>',
      '    <div class="tsl-ws-summary"><strong>운영 원칙</strong><br>생산일정 버튼은 schedule API만 호출합니다. 품질 버튼은 quality API만 호출합니다. 공통 결과창을 사용하지 않습니다.</div>',
      '  </div>',
      '</section>'
    ].join('');
  }

  function resultEl(type){ return byId('tsl14c-result-' + type); }
  function fileEl(type){ return byId('tsl14c-file-' + type); }
  function buttonEl(type){ return byId('tsl14c-btn-' + type); }
  function resetEl(type){ return byId('tsl14c-reset-' + type); }
  function setResult(type, state, text){
    var el = resultEl(type);
    if (!el) return;
    el.className = 'tsl-ws-result ' + (state || '');
    el.textContent = text;
  }
  function setBusy(type, busy){
    var el = buttonEl(type);
    if (el) el.disabled = !!busy;
  }
  function updateSummary(db){
    var el = byId('tsl14c-global-summary');
    if (!el) return;
    db = db || {};
    el.innerHTML = [
      '<strong>전체 서버 상태</strong>',
      '<div class="tsl-ws-mini">',
      '<div>업로드 이력<b>'+esc(fmt(db.uploadHistoryCount))+'</b></div>',
      '<div>생산일정<b>'+esc(fmt(db.scheduleRowCount))+'</b></div>',
      '<div>품질/불량<b>'+esc(fmt(db.qualityIssueCount))+'</b></div>',
      '</div>'
    ].join('');
  }
  function getItem(type){
    for (var i=0;i<UPLOAD_ITEMS.length;i++) if (UPLOAD_ITEMS[i].key === type) return UPLOAD_ITEMS[i];
    return null;
  }

  function upload(type){
    var item = getItem(type);
    if (!item) return;
    var input = fileEl(type);
    var file = input && input.files && input.files[0];
    if (!file) {
      setResult(type, 'err', item.label + ' 파일을 먼저 선택하세요.');
      return;
    }

    var fd = new FormData();
    fd.append('file', file);
    fd.append('uploaded_by', 'temp-web');

    setBusy(type, true);
    setResult(type, 'busy', [
      '업로드 중',
      '요청 종류: ' + type,
      'API: ' + item.endpoint,
      '파일: ' + file.name
    ].join('\n'));

    fetch(API_BASE + item.endpoint, { method:'POST', body: fd, cache:'no-store' })
      .then(function(resp){
        return resp.json().catch(function(){ return {}; }).then(function(json){
          if (!resp.ok) {
            var msg = json.detail || json.message || ('HTTP ' + resp.status);
            if (typeof msg !== 'string') msg = JSON.stringify(msg);
            throw new Error(msg);
          }
          return json;
        });
      })
      .then(function(json){
        var db = json.db || {};
        var uploadType = json.upload_type || json.uploadType || type;
        var rowCount = json.row_count != null ? json.row_count : json.rowCount;
        var inserted = json.inserted_count != null ? json.inserted_count : json.insertedCount;
        updateSummary(db);
        setResult(type, 'ok', [
          '저장/반영 완료',
          '요청 종류: ' + type,
          '서버 응답 종류: ' + fmt(uploadType),
          'API: ' + item.endpoint,
          '파일: ' + fmt(json.original_filename || json.originalFilename || file.name),
          '추출 행: ' + fmt(rowCount),
          'DB 반영 행: ' + fmt(inserted),
          '현재 생산일정: ' + fmt(db.scheduleRowCount),
          '현재 품질/불량: ' + fmt(db.qualityIssueCount)
        ].join('\n'));
        if (window.TechSysLabBootstrap && typeof window.TechSysLabBootstrap.reload === 'function') {
          try { window.TechSysLabBootstrap.reload(); } catch(e) {}
        }
      })
      .catch(function(err){
        setResult(type, 'err', [
          '업로드 실패',
          '요청 종류: ' + type,
          'API: ' + item.endpoint,
          '파일: ' + file.name,
          '오류: ' + (err && err.message ? err.message : String(err))
        ].join('\n'));
      })
      .finally(function(){ setBusy(type, false); });
  }

  function bind(){
    UPLOAD_ITEMS.forEach(function(item){
      var btn = buttonEl(item.key);
      if (btn) {
        var clean = btn.cloneNode(true);
        btn.parentNode.replaceChild(clean, btn);
        clean.addEventListener('click', function(e){
          e.preventDefault();
          e.stopPropagation();
          upload(item.key);
        }, true);
      }
      var reset = resetEl(item.key);
      if (reset) {
        reset.addEventListener('click', function(e){
          e.preventDefault();
          var input = fileEl(item.key);
          if (input) input.value = '';
          setResult(item.key, '', '대기 중\n선택한 파일과 결과는 이 카드 안에만 표시됩니다.');
        });
      }
    });
  }

  function mount(){
    if (!gateUnlocked()) return;
    injectStyle();
    removeOldPanels();
    var wrap = document.createElement('div');
    wrap.innerHTML = panelHtml();
    var mount = findMount();
    mount.insertBefore(wrap.firstChild, mount.firstChild);
    bind();
    setTimeout(removeOldPanelsExceptNew, 100);
    setTimeout(removeOldPanelsExceptNew, 800);
  }

  function removeOldPanelsExceptNew(){
    var old = byId(OLD_PANEL_ID);
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  document.addEventListener('tsl:gate-unlocked', mount);
})();
