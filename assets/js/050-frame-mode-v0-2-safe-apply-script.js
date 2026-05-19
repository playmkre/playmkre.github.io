/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 50 id=frame-mode-v0-2-safe-apply-script :: OPT01 no semantic edits */

(function(){
  'use strict';
  var VERSION = 'Q_REBUILD_08J_FRAME_MODE_V0_2_SAFE_APPLY_REVIEWED_FIXED';
  var FM_MODES = ['classic','thevc-frame','focus','compact'];
  var SESSION_KEY = 'odi_frame_mode_session';

  // ── 페이지별 메타 매핑 ──────────────────────────────
  // 표시용 메타 정보 (frame UI에서만 사용). 기존 업무 데이터/문구는 건드리지 않는다.
  var ODI_FRAME_ROUTE_META = {
    'dashboard':      { group:'종합현황',     title:'운영 대시보드',   type:'현황', status:'세션 기준',          related:['schedule','prod-overview','quality-dash'] },
    'schedule':       { group:'생산일정',     title:'생산일정 관리',   type:'업무', status:'업로드 기반',         related:['prod-process','data-equip'] },
    'schedule-log':   { group:'생산일정',     title:'양산 차수 로그',  type:'기록', status:'WORK_DATA',          related:['schedule','schedule-model'] },
    'schedule-model': { group:'생산일정',     title:'모델별 상세',     type:'분석', status:'WORK_DATA',          related:['schedule','schedule-period'] },
    'schedule-period':{ group:'생산일정',     title:'기간 분석',       type:'분석', status:'WORK_DATA',          related:['schedule','prod-overview'] },
    'equip-status':   { group:'생산일정',     title:'호기 상태',       type:'현황', status:'세션 기준',          related:['schedule','prod-process'] },
    'team-overview':  { group:'생산일정',     title:'팀 종합 현황',    type:'현황', status:'세션 기준',          related:['schedule','prod-headcount'] },
    'prod-overview':  { group:'생산운영관리', title:'생산 종합 파악',  type:'현황', status:'WORK_DATA 기준',     related:['schedule','prod-process','quality-dash'] },
    'prod-headcount': { group:'생산운영관리', title:'인력 현황',       type:'현황', status:'세션 기준',          related:['team-overview','prod-overview'] },
    'prod-process':   { group:'생산운영관리', title:'공정 현황',       type:'공정', status:'WORK_DATA 기준',     related:['schedule','prod-overview','quality-dash'] },
    'quality-dash':   { group:'품질관리',     title:'품질 통합 대시보드', type:'품질', status:'Dashboard Ready 기준', related:['quality-main','quality-analysis'] },
    'quality-main':   { group:'품질관리',     title:'불량 관리 센터',  type:'품질', status:'업로드 → Raw → Issue', related:['quality-dash','quality-analysis','quality-action'] },
    'quality-analysis':{ group:'품질관리',    title:'품질 분석',       type:'분석', status:'Issue → Normalize',  related:['quality-main','quality-action'] },
    'quality-action': { group:'품질관리',     title:'품질 조치',       type:'조치', status:'Issue 기반',         related:['quality-main','quality-master'] },
    'quality-images': { group:'품질관리',     title:'품질 이미지',     type:'자료', status:'세션 기준',          related:['quality-main'] },
    'quality-master': { group:'품질관리',     title:'품질 마스터',     type:'기준', status:'세션 기준',          related:['quality-main','quality-analysis'] },
    'data-equip':     { group:'데이터관리',   title:'호기 데이터',     type:'데이터', status:'세션 기준',        related:['equip-status','schedule'] },
    'download':       { group:'다운로드',     title:'다운로드 센터',   type:'유틸', status:'세션 기준',          related:[] }
  };
  window.ODI_FRAME_ROUTE_META = ODI_FRAME_ROUTE_META;

  // ── 핵심 API ─────────────────────────────────────────
  window.odiFrameGetMode = function(){
    if(document.body && document.body.dataset && document.body.dataset.layoutMode){
      return document.body.dataset.layoutMode;
    }
    return 'classic';
  };

  window.odiFrameSetMode = function(mode){
    if(FM_MODES.indexOf(mode) === -1) {
      console.warn('[frame mode] unknown mode:', mode, '— falling back to classic');
      mode = 'classic';
    }
    try {
      document.body.dataset.layoutMode = mode;
      window.ODI_FRAME_MODE = mode;
      try { sessionStorage.setItem(SESSION_KEY, mode); } catch(_e){}
      // 토글 버튼 활성화 동기화
      var btns = document.querySelectorAll('#frameModeToggle button[data-fm]');
      btns.forEach(function(b){
        if(b.getAttribute('data-fm') === mode) b.classList.add('fm-on');
        else b.classList.remove('fm-on');
      });
      // 모드 전환 시 frame UI 즉시 동기화
      try { window.odiFrameSyncFromActivePage(); } catch(_e){}
      // 보호: classic 전환 시 drawer/backdrop 닫기
      if(mode === 'classic'){
        try { window.odiFrameCloseDrawer(); } catch(_e){}
      }
    } catch(e){
      console.warn('[frame mode] setMode failed', e);
    }
    return mode;
  };

  // 현재 active page의 nav key를 찾는다
  function findActiveNavKey(){
    try {
      var pm = window.PM;
      if(!pm) return null;
      var activeEl = document.querySelector('.page.active');
      if(!activeEl || !activeEl.id) return null;
      for(var k in pm){
        if(pm[k] === activeEl.id) return k;
      }
    } catch(_e){}
    return null;
  }

  window.odiFrameSyncRoute = function(k){
    if(!k) return;
    try { if(document.body && document.body.dataset) document.body.dataset.frameRoute = k; } catch(_e){}
    var meta = ODI_FRAME_ROUTE_META[k] || null;
    window.odiFrameRenderHeader(k, meta);
    window.odiFrameRenderTabs(k, meta);
    window.odiFrameRenderRightPanel(k, meta);
    window.odiFrameRenderBottomDrawer(k, meta);
  };

  window.odiFrameSyncFromActivePage = function(){
    var k = findActiveNavKey();
    if(k) window.odiFrameSyncRoute(k);
  };

  // ── 렌더 함수 ────────────────────────────────────────
  window.odiFrameRenderHeader = function(k, meta){
    if(!meta) return;
    var avatar = document.getElementById('frameProfileAvatar');
    var title  = document.getElementById('frameProfileTitle');
    var metaEl = document.getElementById('frameProfileMeta');
    var sa     = document.getElementById('frameStatPages');
    var sr     = document.getElementById('frameStatRoutes');
    var sac    = document.getElementById('frameStatActive');
    try {
      if(avatar) avatar.textContent = (meta.group || '·').charAt(0);
      if(title)  title.textContent  = meta.title || '—';
      if(metaEl) metaEl.textContent = (meta.group || '') + (meta.status ? ' · ' + meta.status : '');
      if(sa)  sa.textContent  = String(document.querySelectorAll('.page').length);
      if(sr)  sr.textContent  = String(window.PM ? Object.keys(window.PM).length : 0);
      if(sac) sac.textContent = (meta.type || '—');
    } catch(_e){}
  };

  window.odiFrameRenderTabs = function(k, meta){
    var tabsHost = document.getElementById('frameTabs');
    if(!tabsHost) return;
    // 현재 그룹 내 형제 탭들을 ODI_FRAME_ROUTE_META에서 동적 추출
    try {
      var group = (meta && meta.group) || null;
      var entries = [];
      Object.keys(ODI_FRAME_ROUTE_META).forEach(function(navKey){
        var m = ODI_FRAME_ROUTE_META[navKey];
        if(group && m.group === group) entries.push({ navKey: navKey, title: m.title });
      });
      // 그룹 미발견 시 현재 키만 단일 탭으로
      if(entries.length === 0 && k){
        entries.push({ navKey: k, title: (meta && meta.title) || k });
      }
      var html = entries.map(function(e){
        var active = e.navKey === k ? ' active' : '';
        // onclick에 nav 호출. 기존 nav()를 그대로 사용 — 재작성하지 않음
        return '<button type="button" class="ft-tab' + active + '" data-fm-tab="' + e.navKey + '" onclick="if(typeof nav===&quot;function&quot;)nav(&quot;' + e.navKey + '&quot;)">' + e.title + '</button>';
      }).join('');
      tabsHost.innerHTML = html;
    } catch(e){
      console.warn('[frame mode] renderTabs failed', e);
    }
  };

  window.odiFrameRenderRightPanel = function(k, meta){
    var titleEl = document.getElementById('frameRightPanelTitle');
    var bodyEl  = document.getElementById('frameRightPanelBody');
    if(!bodyEl) return;
    try {
      if(titleEl) titleEl.textContent = (meta && meta.type) ? meta.type.toUpperCase() : 'CONTEXT';
      var cards = [];
      cards.push(
        '<div class="frp-card">' +
          '<div class="frp-card-title">OVERVIEW</div>' +
          '<div class="frp-card-body">' +
            '<div><b>' + escHtml((meta && meta.title) || (k || '—')) + '</b></div>' +
            '<div style="color:var(--ts);font-size:10.5px;margin-top:4px">' +
              escHtml((meta && meta.group) || '') +
              (meta && meta.status ? ' · ' + escHtml(meta.status) : '') +
            '</div>' +
          '</div>' +
        '</div>'
      );
      // 관련 라우트 카드
      var related = (meta && Array.isArray(meta.related)) ? meta.related : [];
      if(related.length > 0){
        var links = related.map(function(rk){
          var rm = ODI_FRAME_ROUTE_META[rk];
          var rt = (rm && rm.title) || rk;
          return '<span class="frp-card-link" onclick="if(typeof nav===&quot;function&quot;)nav(&quot;' + rk + '&quot;)">→ ' + escHtml(rt) + '</span>';
        }).join('');
        cards.push(
          '<div class="frp-card">' +
            '<div class="frp-card-title">RELATED</div>' +
            '<div class="frp-card-body">' + links + '</div>' +
          '</div>'
        );
      }
      // 모드 전환 가이드 카드 (frame mode 자체 안내)
      cards.push(
        '<div class="frp-card">' +
          '<div class="frp-card-title">LAYOUT MODE</div>' +
          '<div class="frp-card-body" style="font-size:10.5px;color:var(--ts)">' +
            'Classic이 기본값. 상단 토글로 전환.' +
          '</div>' +
        '</div>'
      );
      bodyEl.innerHTML = cards.join('');
    } catch(e){
      console.warn('[frame mode] renderRightPanel failed', e);
    }
  };

  window.odiFrameRenderBottomDrawer = function(k, meta){
    var s1 = document.getElementById('frameBottomStat1');
    var s2 = document.getElementById('frameBottomStat2');
    var s3 = document.getElementById('frameBottomStat3');
    try {
      if(s1) s1.innerHTML = '<b>' + escHtml((meta && meta.title) || (k || '—')) + '</b>';
      if(s2) s2.innerHTML = '<b>' + escHtml((meta && meta.group) || '—') + '</b>';
      if(s3) s3.innerHTML = '<b>' + escHtml((meta && meta.type) || '—') + '</b>';
    } catch(_e){}
  };

  window.odiFrameOpenDrawer = function(){
    var d = document.getElementById('frameBottomDrawer');
    var b = document.getElementById('frameBackdrop');
    if(d) d.classList.add('is-on');
    if(b) b.classList.add('is-on');
  };
  window.odiFrameCloseDrawer = function(){
    var d = document.getElementById('frameBottomDrawer');
    var b = document.getElementById('frameBackdrop');
    if(d) d.classList.remove('is-on');
    if(b) b.classList.remove('is-on');
  };

  // ── 유틸 ────────────────────────────────────────────
  function escHtml(s){
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  // ── active page 변경 관찰 ────────────────────────────
  function observeActivePage(){
    var root = document.getElementById('main-content') || document.body;
    if(!root) return;
    try {
      var observer = new MutationObserver(function(){
        try { window.odiFrameSyncFromActivePage(); }
        catch(e) { console.warn('[frame mode] sync failed', e); }
      });
      observer.observe(root, { attributes:true, subtree:true, attributeFilter:['class'] });
      window.__odiFrameObserverActive = true;
    } catch(e){
      window.__odiFrameObserverActive = false;
      console.warn('[frame mode] observer install failed', e);
    }
  }

  // ── 초기화 ───────────────────────────────────────────
  window.odiFrameInit = function(){
    try {
      // 세션 모드 복원 (있으면), 없으면 classic
      var saved = null;
      try { saved = sessionStorage.getItem(SESSION_KEY); } catch(_e){}
      var initMode = (saved && FM_MODES.indexOf(saved) !== -1) ? saved : 'classic';
      window.odiFrameSetMode(initMode);
      // 초기 sync
      try { window.odiFrameSyncFromActivePage(); } catch(_e){}
      // observer 설치
      observeActivePage();
      window.__odiFrameInitialized = true;
    } catch(e){
      console.warn('[frame mode] init failed', e);
    }
  };

  // ── audit 객체 ───────────────────────────────────────
  window.ODI_FRAME_MODE_V02_AUDIT = {
    version: VERSION,
    baseFile: 'ODI_USER_PORTAL_IMPL_Q_REBUILD_08J_DEBUG_CLEANUP_STEP08_FINAL_HANDOFF_AND_PROCESS_WORK_RESUME.html',
    referenceFile: 'ODI_USER_PORTAL_IMPL_FRAME_MODE_v0.1 (1).html',
    externalReference: 'THE VC product/service page used for layout pattern reference only',
    defaultMode: 'classic',
    copiedExternalCode: false,
    copiedExternalText: false,
    copiedExternalImages: false,
    frameDomAdded: [
      'frameProfileHeader',
      'frameTabs',
      'frameRightPanel',
      'frameQuickRail',
      'frameBottomDrawer',
      'frameBackdrop'
    ],
    protectedAreas: [
      'page-schedule',
      'page-quality-dash',
      'page-quality-main',
      'page-quality-analysis',
      'page-quality-action',
      'page-quality-images',
      'page-quality-master',
      'PM',
      'nav',
      'odiNavAfterRenderDispatcher'
    ],
    validation: {
      classicModeDefault: true,
      cssCleanupResumed: false,
      pageContentModified: false,
      navRewritten: false,
      scheduleLogicModified: false,
      qualityFlowModified: false,
      localStorageUsedForFrameMode: false
    }
  };

  // ── version / changelog ──────────────────────────────
  try { window.APP_VERSION = VERSION; } catch(_e){}
  try {
    window.CHANGELOG = window.CHANGELOG || [];
    window.CHANGELOG.push({
      version: VERSION,
      note: 'Frame mode v0.2 safe apply: added optional THE VC-inspired frame layout mode to STEP08 final baseline using FRAME_MODE_v0.1 as reference. Classic mode remains default. No page content, route, production schedule logic, quality flow, or CSS cleanup changes.'
    });
  } catch(_e){}

  // ── smoke check (명령문 14절) ────────────────────────
  window.runOdiFrameModeV02SmokeCheck = function(){
    var result = {
      version: window.APP_VERSION || 'unknown',
      defaultMode: document.body && document.body.dataset ? document.body.dataset.layoutMode : null,
      hasFrameAudit: !!window.ODI_FRAME_MODE_V02_AUDIT,
      hasFrameProfileHeader: !!document.getElementById('frameProfileHeader'),
      hasFrameTabs: !!document.getElementById('frameTabs'),
      hasFrameRightPanel: !!document.getElementById('frameRightPanel'),
      hasFrameQuickRail: !!document.getElementById('frameQuickRail'),
      hasFrameBottomDrawer: !!document.getElementById('frameBottomDrawer'),
      hasFrameBackdrop: !!document.getElementById('frameBackdrop'),
      frameHeaderInsideMain: !!(document.getElementById('main-content') && document.getElementById('frameProfileHeader') && document.getElementById('main-content').contains(document.getElementById('frameProfileHeader'))),
      pageCount: document.querySelectorAll('.page').length,
      nestedPageCount: document.querySelectorAll('.page .page').length,
      styleBlockCount: document.querySelectorAll('style').length,
      scriptBlockCount: document.querySelectorAll('script').length,
      duplicateIds: [],
      pmTargetMissing: [],
      qualityPagesReady: true,
      schedulePageReady: !!document.getElementById('page-schedule'),
      processPageReady: !!document.getElementById('page-prod-process'),
      navCallable: typeof window.nav === 'function',
      frameFunctions: {},
      storagePolicy: {
        localStorageFrameModeUsed: false,
        sessionStorageAllowed: true
      },
      errors: []
    };

    try {
      var seen = {};
      document.querySelectorAll('[id]').forEach(function(el){
        if(!el.id) return;
        seen[el.id] = (seen[el.id] || 0) + 1;
      });
      Object.keys(seen).forEach(function(id){
        if(seen[id] > 1) result.duplicateIds.push({id:id,count:seen[id]});
      });
    } catch(e) {
      result.errors.push('duplicate id scan failed: ' + (e.message || e));
    }

    try {
      if(typeof window.PM !== 'undefined' && window.PM) {
        Object.keys(window.PM).forEach(function(k){
          var id = window.PM[k];
          if(id && !document.getElementById(id)) {
            result.pmTargetMissing.push({key:k,pageId:id});
          }
        });
      }
    } catch(e) {
      result.errors.push('PM target scan failed: ' + (e.message || e));
    }

    [
      'page-quality-dash',
      'page-quality-main',
      'page-quality-analysis',
      'page-quality-action',
      'page-quality-images',
      'page-quality-master'
    ].forEach(function(id){
      if(!document.getElementById(id)) result.qualityPagesReady = false;
    });

    [
      'odiFrameSetMode',
      'odiFrameGetMode',
      'odiFrameSyncRoute',
      'odiFrameSyncFromActivePage',
      'odiFrameRenderHeader',
      'odiFrameRenderTabs',
      'odiFrameRenderRightPanel',
      'odiFrameInit'
    ].forEach(function(fn){
      result.frameFunctions[fn] = typeof window[fn] === 'function';
    });

    // localStorage 정책 확인 — frame mode 키가 localStorage에 없어야 함
    try {
      if(typeof localStorage !== 'undefined' && localStorage.getItem('odi_frame_mode')){
        result.storagePolicy.localStorageFrameModeUsed = true;
        result.errors.push('localStorage odi_frame_mode key detected — policy violation');
      }
    } catch(_e){}

    console.log('[Q_REBUILD_08J_FRAME_MODE_V0_2_SAFE_APPLY_REVIEWED_FIXED] smoke check', result);
    return result;
  };

  // ── 자동 초기화 ──────────────────────────────────────
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(window.odiFrameInit, 2200); });
  } else {
    setTimeout(window.odiFrameInit, 2200);
  }
})();
