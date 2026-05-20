/* ============================================================================
 * ODI Admin Portal — Phase 13A Source File Vault + Operations Console
 * ----------------------------------------------------------------------------
 * Phase 13A의 핵심: 운영자 관점 UI를 정식 영역으로, 개발자/기술 진단은
 * "고급 진단" 접힘 영역으로 분리한다.
 *
 *  [정식 영역 - 항상 펼침]
 *   1) 현재 적용 중인 원본 파일
 *      생산일정 / 품질 — 파일명, 행 수, 마지막 적용일, 상태(적용됨)
 *   2) 원본 파일 보관함
 *      원본 / 양식 / 증빙 / 보관소 트리 + 파일 목록
 *   3) 운영자 업로드 흐름 안내 (4단계)
 *
 *  [고급 진단 - 접힘 기본]
 *   4) 기존 API/DB/Release QA 콘솔 통합 호출 버튼
 *      - 처음에는 보이지 않음
 *      - "고급 진단 펼치기" 클릭 시에만 노출
 *
 *  버튼 라벨 후처리:
 *   사전검수        → 파일 확인
 *   검수 세션 생성   → 원본 저장
 *   최근 세션 확정   → 화면 데이터 적용
 *   최근 업로드 롤백 → 이전 적용으로 되돌리기
 *
 *  Phase 13/13A 정책:
 *   - 기존 사용자/관리자 HTML 본문 미변경
 *   - 기존 API/data-act 속성 무손상
 *   - 보호 페이지 9종 미숨김
 *   - 원본 파일 절대 수정 금지
 * ========================================================================== */
(function(){
  'use strict';
  if (window.__ODI_PHASE13A_PANEL__) return;
  window.__ODI_PHASE13A_PANEL__ = true;

  var BUTTON_LABEL_MAP = {
    '사전검수': '파일 확인',
    '검수 세션 생성': '원본 저장',
    '최근 세션 확정': '화면 데이터 적용',
    '최근 업로드 롤백': '이전 적용으로 되돌리기'
  };

  // 기존 업로드 콘솔에서 "기본적으로" 감춰서 고급 영역으로 이동시킬 버튼 라벨들
  var ADVANCED_LEGACY_LABELS = [
    '업로드 이력',
    '검수 세션',
    '롤백 이력',
    '필드 규칙',
    'Health',
    'Base 저장',
    '요청 요약',
    '요청 목록',
    '최근 요청 승인',
    '최근 요청 반려',
    '요청 이벤트',
    'Permission summary',
    'Download action preview'
  ];

  function getApiBase(){
    try {
      var api = window.TechSysLabApiClient;
      if (api && typeof api.getApiBase === 'function') return api.getApiBase();
    } catch(e) {}
    return 'https://api.techsyslab.com';
  }

  function fmtBytes(n){
    if (n == null || isNaN(n)) return '-';
    if (n < 1024) return n + ' B';
    if (n < 1024*1024) return (n/1024).toFixed(1) + ' KB';
    return (n/(1024*1024)).toFixed(2) + ' MB';
  }
  function fmtTime(s){
    if (!s) return '-';
    try {
      var d = new Date(String(s).replace(' ', 'T'));
      if (isNaN(d.getTime())) return s;
      return d.toLocaleString('ko-KR', { hour12: false });
    } catch(e) { return s; }
  }
  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function api(path, opts){
    return fetch(getApiBase().replace(/\/$/, '') + path, Object.assign({
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    }, opts || {})).then(function(r){
      if (!r.ok) return r.text().then(function(t){ throw new Error(r.status + ' ' + t); });
      return r.json();
    });
  }

  // ---------------- 버튼 라벨 후처리 + 고급 콘솔 격리 ----------------
  function relabelAndHideAdvanced(){
    var btns = document.querySelectorAll('button');
    btns.forEach(function(btn){
      var txt = (btn.textContent || '').trim();
      if (BUTTON_LABEL_MAP[txt]) {
        if (!btn.getAttribute('data-original-label')) btn.setAttribute('data-original-label', txt);
        btn.textContent = BUTTON_LABEL_MAP[txt];
        btn.title = '운영자 표현: ' + BUTTON_LABEL_MAP[txt] + ' (내부: ' + txt + ')';
      }
    });
    // 기존 Phase 12 업로드 콘솔(#tsl-admin-upload-console)에 'phase13a-managed'
    // 표시를 추가하여 기본 접힘 상태로 만든다. 본 패널의 "고급 진단" 버튼이 토글한다.
    var legacyConsole = document.getElementById('tsl-admin-upload-console');
    if (legacyConsole && !legacyConsole.classList.contains('phase13a-managed')) {
      legacyConsole.classList.add('phase13a-managed');
      legacyConsole.classList.add('phase13a-hidden');
    }
  }

  function watchAndRelabel(){
    relabelAndHideAdvanced();
    var mo = new MutationObserver(function(records){
      var any = false;
      records.forEach(function(r){
        if (r.addedNodes && r.addedNodes.length) any = true;
      });
      if (any) relabelAndHideAdvanced();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  // ---------------- 스타일 ----------------
  function injectStyles(){
    if (document.getElementById('odi-phase13a-style')) return;
    var st = document.createElement('style');
    st.id = 'odi-phase13a-style';
    st.textContent = [
      '#odi-p13a-panel { position:fixed; right:14px; bottom:14px; width:460px;',
      '  max-height:84vh; overflow:auto; background:#0f1320; color:#dde2ec;',
      '  border:1px solid #2a3148; border-radius:10px;',
      '  font-family:system-ui,Pretendard,"Segoe UI",sans-serif; font-size:12px;',
      '  box-shadow:0 8px 28px rgba(0,0,0,0.35); z-index:99998; }',
      '#odi-p13a-panel .p-head { display:flex; align-items:center; justify-content:space-between;',
      '  padding:9px 12px; background:#161c30; border-bottom:1px solid #2a3148; cursor:pointer;',
      '  font-weight:700; color:#bcd2ff; }',
      '#odi-p13a-panel.min .p-body { display:none; }',
      '#odi-p13a-panel .p-body { padding:10px 12px 16px; }',
      '#odi-p13a-panel .p-card { background:#141a2c; border:1px solid #232a44; border-radius:8px;',
      '  padding:10px 12px; margin-bottom:10px; }',
      '#odi-p13a-panel .p-card h4 { margin:0 0 6px; font-size:12px; color:#ffd58a;',
      '  display:flex; align-items:center; justify-content:space-between; }',
      '#odi-p13a-panel .p-card .pill { background:#274a8b; color:#fff; font-size:10px;',
      '  padding:1px 7px; border-radius:9px; font-weight:600; }',
      '#odi-p13a-panel .p-card.applied .pill { background:#2f7a4b; }',
      '#odi-p13a-panel .p-grid { display:grid; grid-template-columns:90px 1fr; gap:3px 8px;',
      '  font-size:11px; }',
      '#odi-p13a-panel .p-grid .k { color:#8b95ad; }',
      '#odi-p13a-panel .p-grid .v { color:#e6edf7; word-break:break-all; }',
      '#odi-p13a-panel .p-section h4 { margin:14px 0 6px; font-size:12px; color:#ffd58a; }',
      '#odi-p13a-panel .p-list .row { display:grid; grid-template-columns:60px 1fr 50px;',
      '  gap:6px; padding:5px 0; border-bottom:1px dashed #2a3148; font-size:11px; }',
      '#odi-p13a-panel .p-list .row .t { color:#7ec8ff; font-weight:600; }',
      '#odi-p13a-panel .p-list .row.active { background:rgba(255,213,138,0.08); padding-left:4px;',
      '  border-radius:3px; }',
      '#odi-p13a-panel .p-tree { display:grid; grid-template-columns:repeat(2,1fr); gap:6px;',
      '  font-size:11px; }',
      '#odi-p13a-panel .p-tree .t-leaf { background:#1a2138; border:1px solid #232a44;',
      '  border-radius:5px; padding:5px 7px; }',
      '#odi-p13a-panel .p-tree .t-leaf .l { color:#8b95ad; font-size:10px; }',
      '#odi-p13a-panel .p-tree .t-leaf .v { color:#e6edf7; font-weight:600; }',
      '#odi-p13a-panel .p-actions { display:flex; gap:6px; flex-wrap:wrap; margin-top:6px; }',
      '#odi-p13a-panel button.p-btn { background:#1f2740; color:#dde2ec; border:1px solid #2a3148;',
      '  border-radius:5px; padding:5px 9px; font-size:11px; cursor:pointer; }',
      '#odi-p13a-panel button.p-btn:hover { background:#2a3148; }',
      '#odi-p13a-panel button.p-btn.primary { background:#2b4a8c; border-color:#3863b8; color:#fff; }',
      '#odi-p13a-panel button.p-btn.danger  { background:#7a2f2f; border-color:#a64545; color:#fff; }',
      '#odi-p13a-panel .p-flow ol { margin:6px 0 0 18px; padding:0; }',
      '#odi-p13a-panel .p-flow li { margin:2px 0; color:#dde2ec; }',
      '#odi-p13a-panel .p-muted { color:#8b95ad; font-size:10px; margin-top:4px; }',
      '#odi-p13a-panel .p-advanced { margin-top:14px; border-top:1px dashed #2a3148; padding-top:10px; }',
      '#odi-p13a-panel .p-advanced-head { cursor:pointer; color:#a4adc4; font-size:11px;',
      '  display:flex; align-items:center; gap:6px; user-select:none; }',
      '#odi-p13a-panel .p-advanced .body { display:none; margin-top:8px; }',
      '#odi-p13a-panel .p-advanced.open .body { display:block; }',
      // legacy console hide rule
      '#tsl-admin-upload-console.phase13a-managed.phase13a-hidden { display:none !important; }'
    ].join('\n');
    document.head.appendChild(st);
  }

  // ---------------- 패널 빌드 ----------------
  function buildPanel(){
    if (document.getElementById('odi-p13a-panel')) return;
    var el = document.createElement('div');
    el.id = 'odi-p13a-panel';
    el.className = 'min';
    el.innerHTML = ''
      + '<div class="p-head"><span>운영 콘솔 · Phase 13A</span><span id="odi-p13a-toggle">▾</span></div>'
      + '<div class="p-body">'
      + '  <div id="odi-p13a-applied"></div>'
      + '  <div class="p-card p-flow">'
      + '    <h4>파일 업로드 흐름 (운영자 안내)</h4>'
      + '    <ol><li>파일 선택</li><li>파일 확인</li><li>원본 저장</li><li>화면 데이터 적용</li></ol>'
      + '    <div class="p-muted">원본 파일은 수정되지 않습니다. DB 데이터는 화면 표시용 보조 데이터입니다.</div>'
      + '  </div>'
      + '  <div class="p-card p-section">'
      + '    <h4>원본 파일 보관함 — 폴더 구조</h4>'
      + '    <div id="odi-p13a-tree">불러오는 중…</div>'
      + '  </div>'
      + '  <div class="p-card p-section">'
      + '    <h4>원본 파일 목록</h4>'
      + '    <div class="p-actions">'
      + '      <button class="p-btn" data-act="list-all">전체</button>'
      + '      <button class="p-btn" data-act="list-schedule">생산일정</button>'
      + '      <button class="p-btn" data-act="list-quality">품질</button>'
      + '      <button class="p-btn" data-act="refresh-all">새로고침</button>'
      + '    </div>'
      + '    <div id="odi-p13a-list" style="margin-top:6px">불러오는 중…</div>'
      + '  </div>'
      + '  <div class="p-advanced" id="odi-p13a-adv">'
      + '    <div class="p-advanced-head" data-act="toggle-adv">'
      + '      <span id="odi-p13a-adv-icon">▸</span><span>고급 진단 (개발자용)</span>'
      + '    </div>'
      + '    <div class="body">'
      + '      <div class="p-muted">기존 검수/세션/롤백/Release QA 진단 콘솔은 운영 화면에서 기본 노출되지 않습니다.<br>아래 버튼으로 필요시에만 펼쳐서 사용하세요.</div>'
      + '      <div class="p-actions" style="margin-top:8px">'
      + '        <button class="p-btn" data-act="adv-show-legacy">기존 업로드 콘솔 보이기</button>'
      + '        <button class="p-btn" data-act="adv-hide-legacy">숨기기</button>'
      + '        <button class="p-btn" data-act="adv-health">/api/health</button>'
      + '        <button class="p-btn" data-act="adv-release-qa">release-qa/summary</button>'
      + '        <button class="p-btn" data-act="adv-pending">미확정 세션 조회</button>'
      + '        <button class="p-btn danger" data-act="adv-cancel-pending">미확정 세션 정리</button>'
      + '      </div>'
      + '      <pre id="odi-p13a-adv-out" style="margin-top:8px;background:#0a0e1a;color:#dde2ec;padding:8px;border-radius:5px;font-size:10px;max-height:200px;overflow:auto">고급 진단 출력 대기</pre>'
      + '    </div>'
      + '  </div>'
      + '</div>';
    document.body.appendChild(el);

    el.querySelector('.p-head').addEventListener('click', function(){
      el.classList.toggle('min');
      var tg = el.querySelector('#odi-p13a-toggle');
      if (tg) tg.textContent = el.classList.contains('min') ? '▾' : '▴';
    });
    el.querySelectorAll('[data-act]').forEach(function(btn){
      btn.addEventListener('click', function(ev){
        ev.stopPropagation();
        handle(btn.getAttribute('data-act'));
      });
    });
  }

  function out(x){
    var box = document.getElementById('odi-p13a-adv-out');
    if (!box) return;
    if (typeof x === 'object') x = JSON.stringify(x, null, 2);
    box.textContent = String(x);
  }

  // ---------------- 로더 ----------------
  function loadApplied(){
    var box = document.getElementById('odi-p13a-applied');
    if (!box) return;
    box.innerHTML = '<div class="p-card"><h4>현재 적용 중인 원본 파일</h4><div>불러오는 중…</div></div>';
    api('/api/admin/source-files/latest').then(function(r){
      function card(label, row){
        if (!row) {
          return '<div class="p-card"><h4>' + esc(label)
               + ' <span class="pill" style="background:#7a4545">없음</span></h4>'
               + '<div class="p-muted">아직 적용된 원본이 없습니다.</div></div>';
        }
        var state = row.state || 'APPLIED';
        var cls = state === 'APPLIED' ? 'applied' : '';
        return '<div class="p-card ' + cls + '">'
             + '<h4>' + esc(label) + ' <span class="pill">' + esc(state) + '</span></h4>'
             + '<div class="p-grid">'
             +   '<div class="k">파일명</div><div class="v">' + esc(row.original_filename || '-') + '</div>'
             +   '<div class="k">반영 행수</div><div class="v">' + esc(row.derived_row_count != null ? row.derived_row_count : '-') + '</div>'
             +   '<div class="k">최종 적용</div><div class="v">' + esc(fmtTime(row.last_parsed_at || row.uploaded_at)) + '</div>'
             +   '<div class="k">저장 위치</div><div class="v" style="font-size:10px">' + esc(row.source_file_path || row.saved_path || '미기록') + '</div>'
             + '</div></div>';
      }
      box.innerHTML = card('생산일정', r.schedule) + card('품질', r.quality);
    }).catch(function(e){
      box.innerHTML = '<div class="p-card"><h4>현재 적용 중인 원본 파일</h4>'
        + '<div style="color:#ff8a8a">조회 실패: ' + esc(e.message || e) + '</div></div>';
    });
  }

  function loadTree(){
    var box = document.getElementById('odi-p13a-tree');
    if (!box) return;
    api('/api/admin/source-files/vault-tree').then(function(r){
      var t = r.tree || {};
      function leaf(label, n){
        return '<div class="t-leaf"><div class="l">' + esc(label) + '</div>'
             + '<div class="v">' + esc(n) + ' 개</div></div>';
      }
      box.innerHTML = '<div class="p-tree">'
        + leaf('originals / schedule', (t.originals||{}).schedule||0)
        + leaf('originals / quality',  (t.originals||{}).quality||0)
        + leaf('forms / schedule',     (t.forms||{}).schedule||0)
        + leaf('forms / quality',      (t.forms||{}).quality||0)
        + leaf('forms / report',       (t.forms||{}).report||0)
        + leaf('evidence',             t.evidence||0)
        + leaf('archive',              t.archive||0)
        + leaf('총 폴더',              7)
        + '</div>';
    }).catch(function(e){
      box.innerHTML = '<span style="color:#ff8a8a">조회 실패: ' + esc(e.message || e) + '</span>';
    });
  }

  function loadList(type){
    var box = document.getElementById('odi-p13a-list');
    if (!box) return;
    box.textContent = '불러오는 중…';
    var q = type ? '?type=' + encodeURIComponent(type) : '';
    api('/api/admin/source-files' + q).then(function(r){
      var rows = r.rows || [];
      if (!rows.length) { box.innerHTML = '<em style="color:#8b95ad">기록이 없습니다.</em>'; return; }
      box.innerHTML = '<div class="p-list">'
        + '<div class="row" style="font-weight:700;color:#8b95ad">'
        + '<div>구분</div><div>파일명 / 업로드시각</div><div>행수</div></div>'
        + rows.map(function(row){
            return '<div class="row' + (row.active_version ? ' active' : '') + '">'
              + '<div class="t">' + esc(row.source_type || row.upload_type || '-')
              + (row.active_version ? ' ★' : '') + '</div>'
              + '<div>' + esc(row.original_filename || '-')
              + '<div style="color:#8b95ad;font-size:10px">' + esc(fmtTime(row.uploaded_at)) + ' · ' + esc(fmtBytes(row.source_file_size)) + '</div>'
              + '</div>'
              + '<div>' + esc(row.derived_row_count != null ? row.derived_row_count : '-') + '</div>'
              + '</div>';
          }).join('')
        + '</div>'
        + '<div class="p-muted">★ = 현재 화면 데이터로 적용 중</div>';
    }).catch(function(e){
      box.innerHTML = '<span style="color:#ff8a8a">조회 실패: ' + esc(e.message || e) + '</span>';
    });
  }

  // ---------------- 액션 라우터 ----------------
  function handle(act){
    var legacy = document.getElementById('tsl-admin-upload-console');
    if (act === 'list-all')      loadList(null);
    else if (act === 'list-schedule') loadList('schedule');
    else if (act === 'list-quality')  loadList('quality');
    else if (act === 'refresh-all')   { loadApplied(); loadTree(); loadList(null); }
    else if (act === 'toggle-adv') {
      var adv = document.getElementById('odi-p13a-adv');
      adv.classList.toggle('open');
      var ic = document.getElementById('odi-p13a-adv-icon');
      if (ic) ic.textContent = adv.classList.contains('open') ? '▾' : '▸';
    }
    else if (act === 'adv-show-legacy') {
      if (legacy) legacy.classList.remove('phase13a-hidden');
      out('기존 업로드 콘솔이 표시됨 (개발자용)');
    }
    else if (act === 'adv-hide-legacy') {
      if (legacy) legacy.classList.add('phase13a-hidden');
      out('기존 업로드 콘솔을 다시 숨김');
    }
    else if (act === 'adv-health') {
      api('/api/health').then(out).catch(function(e){ out(String(e.message || e)); });
    }
    else if (act === 'adv-release-qa') {
      api('/api/admin/release-qa/summary').then(out).catch(function(e){ out(String(e.message || e)); });
    }
    else if (act === 'adv-pending') {
      api('/api/admin/upload/sessions?status=PENDING').then(function(r){
        out(r);
        var ids = (r.rows || []).map(function(s){return s.id;}).filter(Boolean);
        window.__ODI_P13A_PENDING__ = ids;
      }).catch(function(e){ out(String(e.message || e)); });
    }
    else if (act === 'adv-cancel-pending') {
      var ids = window.__ODI_P13A_PENDING__ || [];
      if (!ids.length) { out('먼저 "미확정 세션 조회"를 실행하세요.'); return; }
      if (!confirm('미확정 세션 ' + ids.length + '건을 정리(cancel)할까요?')) return;
      var ok = 0, fail = 0;
      var p = Promise.resolve();
      ids.forEach(function(id){
        p = p.then(function(){
          return api('/api/admin/upload/cancel/' + encodeURIComponent(id), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ canceled_by: 'phase13a-panel', reason: 'cleanup' })
          }).then(function(){ ok++; }, function(){ fail++; });
        });
      });
      p.then(function(){ out('정리 결과: 성공 ' + ok + ' / 실패 ' + fail); });
    }
  }

  function init(){
    injectStyles();
    buildPanel();
    watchAndRelabel();
    setTimeout(function(){
      loadApplied();
      loadTree();
      loadList(null);
    }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
