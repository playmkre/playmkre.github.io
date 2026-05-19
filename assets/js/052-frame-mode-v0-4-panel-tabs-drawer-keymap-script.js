/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 52 id=frame-mode-v0-4-panel-tabs-drawer-keymap-script :: OPT01 no semantic edits */

(function(){
  'use strict';
  var VERSION = 'Q_REBUILD_08J_FRAME_MODE_V0_4_PANEL_TABS_DRAWER_KEYMAP_ALIGN';

  // ── version / changelog 갱신 (다른 setter들 이후에 실행되어 최종값 보장) ──
  try { window.APP_VERSION = VERSION; } catch(_e){}
  try {
    window.CHANGELOG = window.CHANGELOG || [];
    window.CHANGELOG.push({
      version: VERSION,
      note: 'Frame mode v0.4: aligned route meta, primary tabs, right panel content, compact sidebar drawer, hamburger control, quick rail active state, and Ctrl+` keymap using FRAME_MODE_v0.1 as reference while preserving V0.3 reviewed fixed safety rules. No page content, route, production schedule logic, quality flow, CSS cleanup, or localStorage frame-mode changes.'
    });
  } catch(_e){}

  // ── route → panel key 매핑 ──────────────────────────
  var ODI_FRAME_V04_ROUTE_TO_PANEL_KEY = {
    dashboard: 'dashboard',

    schedule: 'schedule',
    'schedule-log': 'schedule',
    'schedule-model': 'schedule',
    'schedule-period': 'schedule',
    'prod-overview': 'schedule',
    'prod-headcount': 'schedule',
    'prod-process': 'schedule',
    'equip-status': 'schedule',
    'team-overview': 'schedule',

    quality: 'quality',
    'quality-dash': 'quality',
    'quality-main': 'quality',
    'quality-analysis': 'quality',
    'quality-action': 'quality',
    'quality-images': 'quality',
    'quality-master': 'quality',

    'data-equip': 'data',
    'upload-history': 'data',
    'data-validation': 'data',
    'file-mapping': 'data',

    download: 'report',

    'user-guide': 'settings',
    'test-management': 'settings',
    'change-log': 'settings',
    'system-guide': 'settings',
    notification: 'settings',
    'menu-admin': 'settings',
    'master-data-admin': 'settings',
    'export-center': 'settings'
  };
  window.ODI_FRAME_V04_ROUTE_TO_PANEL_KEY = ODI_FRAME_V04_ROUTE_TO_PANEL_KEY;

  // ── primary tabs ────────────────────────────────────
  var ODI_FRAME_V04_PRIMARY_TABS = [
    { key:'dashboard', panelKey:'dashboard', label:'대시보드',     route:'dashboard' },
    { key:'schedule',  panelKey:'schedule',  label:'일정/공정',    route:'schedule' },
    { key:'quality',   panelKey:'quality',   label:'품질관리',     route:'quality-dash' },
    { key:'data',      panelKey:'data',      label:'데이터',       route:'data-equip' },
    { key:'report',    panelKey:'report',    label:'리포트',       route:'download' },
    { key:'settings',  panelKey:'settings',  label:'안내/관리',    route:'user-guide' }
  ];
  window.ODI_FRAME_V04_PRIMARY_TABS = ODI_FRAME_V04_PRIMARY_TABS;

  // ── panel content (V0.1 PANEL_CONTENT 개념 참고, 자체 구현) ─
  var ODI_FRAME_V04_PANEL_CONTENT = {
    dashboard: {
      title: '운영 요약',
      sections: [
        { title:'현재 화면', items:['종합현황 기준 운영 요약', '생산·품질·데이터 흐름 확인'] },
        { title:'빠른 이동', routes:['schedule','prod-process','quality-dash'] }
      ]
    },
    schedule: {
      title: '일정 / 공정 요약',
      sections: [
        { title:'데이터 기준', items:['생산일정 WORK_DATA 기준', '공정 현황과 연결'] },
        { title:'폭 보호',    items:['간트/캘린더 화면에서는 right panel 자동 보호'] },
        { title:'빠른 이동',  routes:['schedule','prod-process','data-equip'] }
      ],
      actions: [
        { label:'Focus 전환', mode:'focus' }
      ]
    },
    quality: {
      title: '품질관리 요약',
      sections: [
        { title:'흐름',      items:['업로드 → Raw → Issue → Normalize → Summary → Dashboard Ready'] },
        { title:'빠른 이동', routes:['quality-main','quality-analysis','quality-master'] }
      ]
    },
    data: {
      title: '데이터관리 요약',
      sections: [
        { title:'목적',      items:['업로드 데이터 기준 master 후보와 검증 상태 확인'] },
        { title:'빠른 이동', routes:['data-equip','data-validation','file-mapping'] }
      ]
    },
    report: {
      title: '리포트 / 다운로드',
      sections: [
        { title:'산출물',    items:['업무 기준 다운로드 및 리포트 확인'] },
        { title:'빠른 이동', routes:['download'] }
      ]
    },
    settings: {
      title: '안내 / 관리',
      sections: [
        { title:'보조 화면', items:['사용자 안내, 변경 이력, 검수/관리 화면은 노출 정책 유지'] },
        { title:'주의',      items:['숨김 route를 새로 노출하지 않음'] }
      ]
    }
  };
  window.ODI_FRAME_V04_PANEL_CONTENT = ODI_FRAME_V04_PANEL_CONTENT;

  // ── 유틸 ────────────────────────────────────────────
  function escHtml(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function findActiveNavKey(){
    try {
      var pm = window.PM;
      if(!pm) return null;
      var activeEl = document.querySelector('.page.active');
      if(!activeEl || !activeEl.id) return null;
      for(var k in pm){ if(pm[k] === activeEl.id) return k; }
    } catch(_e){}
    return null;
  }
  // forbidden route guard (사용자 포털에서 차단된 route는 console.warn만)
  function isForbiddenRouteSafe(k){
    try {
      if(window.ODI_USER_FORBIDDEN_ROUTES && window.ODI_USER_FORBIDDEN_ROUTES[k]) return true;
      if(typeof window.isForbiddenRoute === 'function') return !!window.isForbiddenRoute(k);
    } catch(_e){}
    return false;
  }

  // ── 핵심 API ─────────────────────────────────────────
  window.odiFrameV04GetPanelKey = function(route){
    if(!route) return null;
    return ODI_FRAME_V04_ROUTE_TO_PANEL_KEY[route] || null;
  };

  window.odiFrameV04RenderPrimaryTabs = function(route){
    var tabsHost = document.getElementById('frameTabs');
    if(!tabsHost) return;
    var currentPanelKey = window.odiFrameV04GetPanelKey(route);
    var html = ODI_FRAME_V04_PRIMARY_TABS.map(function(t){
      var active = t.panelKey === currentPanelKey ? ' active' : '';
      return '<button type="button" class="fm-primary-tab' + active + '"'
        + ' data-fm-primary="' + escHtml(t.key) + '"'
        + ' data-fm-target-route="' + escHtml(t.route) + '"'
        + ' onclick="window.odiFrameV04OnPrimaryTabClick(&quot;' + escHtml(t.route) + '&quot;)">'
        + escHtml(t.label) + '</button>';
    }).join('');
    tabsHost.innerHTML = html;
  };

  window.odiFrameV04OnPrimaryTabClick = function(route){
    if(!route) return;
    if(isForbiddenRouteSafe(route)){
      console.warn('[frame v0.4] forbidden route, ignored:', route);
      return;
    }
    try {
      if(typeof window.nav === 'function') window.nav(route);
      else console.warn('[frame v0.4] window.nav not available');
    } catch(e){
      console.warn('[frame v0.4] nav call failed for', route, e);
    }
  };

  window.odiFrameV04RenderPanelContent = function(route){
    var bodyEl  = document.getElementById('frameRightPanelBody');
    var titleEl = document.getElementById('frameRightPanelTitle');
    if(!bodyEl) return;
    var panelKey = window.odiFrameV04GetPanelKey(route);
    var content = panelKey ? ODI_FRAME_V04_PANEL_CONTENT[panelKey] : null;
    if(!content){
      // 정의되지 않은 route — 기본 fallback (V0.2 render가 이미 채웠을 수 있으므로 보존)
      return;
    }
    if(titleEl) titleEl.textContent = (content.title || 'CONTEXT').toUpperCase();
    var html = '';
    (content.sections || []).forEach(function(sec){
      html += '<div class="fm-panel-section">';
      if(sec.title){
        html += '<div class="fm-panel-section-title">' + escHtml(sec.title) + '</div>';
      }
      if(Array.isArray(sec.items) && sec.items.length){
        html += '<div class="fm-panel-card">';
        html += sec.items.map(function(t){ return '<div>' + escHtml(t) + '</div>'; }).join('');
        html += '</div>';
      }
      if(Array.isArray(sec.routes) && sec.routes.length){
        html += sec.routes.map(function(r){
          var label = '→ ' + escHtml(r);
          // ODI_FRAME_ROUTE_META가 있으면 title을 우선 사용 (V0.2 audit에서 정의됨)
          try {
            if(window.ODI_FRAME_ROUTE_META && window.ODI_FRAME_ROUTE_META[r] && window.ODI_FRAME_ROUTE_META[r].title){
              label = '→ ' + escHtml(window.ODI_FRAME_ROUTE_META[r].title);
            }
          } catch(_e){}
          return '<span class="fm-panel-link" onclick="window.odiFrameV04OnPrimaryTabClick(&quot;' + escHtml(r) + '&quot;)">' + label + '</span>';
        }).join('');
      }
      html += '</div>';
    });
    if(Array.isArray(content.actions) && content.actions.length){
      html += '<div class="fm-panel-section">';
      html += '<div class="fm-panel-section-title">ACTIONS</div>';
      html += content.actions.map(function(a){
        if(a.mode){
          return '<button type="button" class="fm-panel-action" onclick="window.odiFrameSetMode &amp;&amp; window.odiFrameSetMode(&quot;' + escHtml(a.mode) + '&quot;)">' + escHtml(a.label) + '</button>';
        }
        return '<span class="fm-panel-card">' + escHtml(a.label) + '</span>';
      }).join('');
      html += '</div>';
    }
    bodyEl.innerHTML = html;
  };

  window.odiFrameV04SyncQuickRail = function(route){
    var rail = document.getElementById('frameQuickRail');
    if(!rail) return;
    var currentPanelKey = window.odiFrameV04GetPanelKey(route);
    // V0.2의 quick rail 버튼은 "mode/drawer"용이며 panelKey 기준 active 표시 항목이 없음.
    // V0.4는 quick rail에 panelKey-aware data 속성을 부여하고 active 표시는 panelKey 기준.
    // 안전을 위해 기존 button[data-rail]은 유지하고 active class만 토글.
    var btns = rail.querySelectorAll('.fqr-btn');
    btns.forEach(function(b){
      var rail = b.getAttribute('data-rail') || '';
      // back-classic, focus, compact, drawer는 mode/control용 — active 토글 안 함
      b.classList.remove('fqr-on');
      // 만약 panelKey와 일치하는 data-fm-panel 속성이 있으면 active
      if(b.getAttribute('data-fm-panel') && b.getAttribute('data-fm-panel') === currentPanelKey){
        b.classList.add('fqr-on');
      }
    });
  };

  // ── compact sidebar drawer 제어 ─────────────────────
  window.odiFrameV04OpenSidebarDrawer = function(){
    var sb = document.getElementById('sidebar');
    var bd = document.getElementById('frameBackdrop');
    if(!sb) return;
    sb.classList.add('odi-frame-drawer-open');
    if(bd) bd.classList.add('odi-frame-backdrop-on');
  };
  window.odiFrameV04CloseSidebarDrawer = function(){
    var sb = document.getElementById('sidebar');
    var bd = document.getElementById('frameBackdrop');
    if(sb) sb.classList.remove('odi-frame-drawer-open');
    if(bd) bd.classList.remove('odi-frame-backdrop-on');
  };
  window.odiFrameV04ToggleSidebarDrawer = function(){
    var sb = document.getElementById('sidebar');
    if(!sb) return;
    // classic은 햄버거 자체가 숨겨져 있지만, 안전 가드로 한 번 더 차단
    var mode = (document.body && document.body.dataset && document.body.dataset.layoutMode) || 'classic';
    if(mode === 'classic'){
      console.warn('[frame v0.4] classic mode: drawer toggle ignored');
      return;
    }
    if(sb.classList.contains('odi-frame-drawer-open')){
      window.odiFrameV04CloseSidebarDrawer();
    } else {
      window.odiFrameV04OpenSidebarDrawer();
    }
  };
  window.odiFrameV04CloseAllDrawers = function(){
    try { window.odiFrameV04CloseSidebarDrawer(); } catch(_e){}
    try { if(typeof window.odiFrameCloseDrawer === 'function') window.odiFrameCloseDrawer(); } catch(_e){}
  };

  // sidebar item 클릭 → drawer 닫기 (compact에서만)
  function installSidebarItemCloser(){
    var sb = document.getElementById('sidebar');
    if(!sb || sb.__v04SidebarClickInstalled) return;
    sb.addEventListener('click', function(ev){
      try {
        var mode = (document.body && document.body.dataset && document.body.dataset.layoutMode) || 'classic';
        if(mode !== 'compact') return;
        // 클릭 대상이 nav 항목(a/button 등)인지 확인
        var t = ev.target;
        while(t && t !== sb){
          var tag = (t.tagName || '').toLowerCase();
          if(tag === 'a' || tag === 'button' || (t.getAttribute && t.getAttribute('onclick'))){
            // 살짝 지연 후 닫기 (nav 후 active 변경이 끝난 뒤)
            setTimeout(function(){ window.odiFrameV04CloseSidebarDrawer(); }, 80);
            return;
          }
          t = t.parentNode;
        }
      } catch(_e){}
    }, true);
    sb.__v04SidebarClickInstalled = true;
  }

  // ── Ctrl + ` keymap ─────────────────────────────────
  window.odiFrameV04IsTypingTarget = function(el){
    if(!el) return false;
    var tag = (el.tagName || '').toLowerCase();
    if(tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    if(el.isContentEditable) return true;
    return false;
  };

  function cycleMode(){
    var order = ['classic','thevc-frame','focus','compact'];
    var cur = (document.body && document.body.dataset && document.body.dataset.layoutMode) || 'classic';
    var idx = order.indexOf(cur);
    var nextMode = order[(idx + 1) % order.length];
    if(typeof window.odiFrameSetMode === 'function'){
      window.odiFrameSetMode(nextMode);
    }
  }

  window.odiFrameV04InstallKeymap = function(){
    if(window.__odiFrameV04KeymapInstalled) return;
    document.addEventListener('keydown', function(ev){
      try {
        // 입력 중에는 단축키 무시
        if(window.odiFrameV04IsTypingTarget(ev.target)) return;
        // Ctrl+` 또는 Ctrl+~ (Shift+` 변형 포함)
        var isBacktick = (ev.key === '`') || (ev.key === '~') || (ev.code === 'Backquote');
        if(ev.ctrlKey && isBacktick){
          ev.preventDefault();
          cycleMode();
          return;
        }
        // ESC: drawer 계열만 닫기. 업무 modal/기존 핸들러를 방해하지 않도록
        // ESC는 sidebar drawer 또는 bottom drawer가 열려있을 때만 처리.
        if(ev.key === 'Escape' || ev.code === 'Escape'){
          var sb = document.getElementById('sidebar');
          var bd = document.getElementById('frameBackdrop');
          var fbd = document.getElementById('frameBottomDrawer');
          var sidebarOpen = sb && sb.classList && sb.classList.contains('odi-frame-drawer-open');
          var backdropOn  = bd && bd.classList && bd.classList.contains('odi-frame-backdrop-on');
          var bottomOn    = fbd && fbd.classList && fbd.classList.contains('is-on');
          if(sidebarOpen || backdropOn || bottomOn){
            // 기본 ESC 동작은 막지 않고, drawer만 닫는다 (modal과 충돌 최소화)
            window.odiFrameV04CloseAllDrawers();
            try {
              if(fbd && fbd.classList.contains('is-on') && typeof window.odiFrameCloseDrawer === 'function'){
                window.odiFrameCloseDrawer();
              }
            } catch(_e){}
          }
          return;
        }
      } catch(_e){}
    }, false);
    window.__odiFrameV04KeymapInstalled = true;
  };

  // backdrop 클릭 시 drawer 닫기 (compact에서 backdrop이 모달처럼 동작)
  function installBackdropCloser(){
    var bd = document.getElementById('frameBackdrop');
    if(!bd || bd.__v04BackdropClickInstalled) return;
    bd.addEventListener('click', function(){
      window.odiFrameV04CloseAllDrawers();
    });
    bd.__v04BackdropClickInstalled = true;
  }

  // ── V0.3 sync 함수 1회 wrap (nav wrap 아님 — frame internal sync function wrap) ──
  // V0.4 함수들이 자동 호출되도록 V0.3의 odiFrameSyncRoute에 후크.
  // 이는 window.nav를 wrap하는 것이 아니며, 명령문 9절의 nav wrapper 금지에 해당하지 않음.
  function installSyncHook(){
    try {
      var existing = window.odiFrameSyncRoute;
      if(typeof existing !== 'function') return false;
      if(existing.__v04Hooked) return true;
      window.odiFrameSyncRoute = function(k){
        var result;
        try { result = existing.apply(this, arguments); }
        finally {
          try {
            window.odiFrameV04RenderPrimaryTabs(k);
            window.odiFrameV04RenderPanelContent(k);
            window.odiFrameV04SyncQuickRail(k);
          } catch(_e){}
        }
        return result;
      };
      window.odiFrameSyncRoute.__v04Hooked = true;
      return true;
    } catch(e){
      console.warn('[frame v0.4] sync hook install failed', e);
      return false;
    }
  }

  // ── 초기화 ───────────────────────────────────────────
  window.odiFrameV04Init = function(){
    try {
      installSyncHook();
      window.odiFrameV04InstallKeymap();
      installSidebarItemCloser();
      installBackdropCloser();
      // 현재 active route 기준으로 1회 sync
      var k = findActiveNavKey() || 'dashboard';
      window.odiFrameV04RenderPrimaryTabs(k);
      window.odiFrameV04RenderPanelContent(k);
      window.odiFrameV04SyncQuickRail(k);
      window.__odiFrameV04Initialized = true;
    } catch(e){
      console.warn('[frame v0.4] init failed', e);
    }
  };

  // ── audit 객체 ───────────────────────────────────────
  window.ODI_FRAME_MODE_V04_AUDIT = {
    version: VERSION,
    baseFile: 'ODI_USER_PORTAL_IMPL_Q_REBUILD_08J_FRAME_MODE_V0_3_VISUAL_SMOKE_AND_FRAME_STABILIZE_REVIEWED_FIXED.html',
    referenceFile: 'ODI_USER_PORTAL_IMPL_FRAME_MODE_v0.1 (1).html',
    purpose: 'Enhance frame-mode feeling by adding route panel grouping, primary tabs, panel content, compact sidebar drawer, hamburger control, quick rail active sync, and Ctrl+` keymap without importing v0.1 risk patterns.',
    importedConceptsOnly: [
      'layout mode grouping',
      'hamburger drawer concept',
      'Ctrl+` keymap concept',
      'route-to-panel grouping concept',
      'right panel content concept',
      'quick rail active sync concept'
    ],
    explicitlyNotImported: [
      'localStorage frame mode persistence',
      'nav wrapper chain',
      'page DOM restructuring',
      'schedule CSS overrides',
      'THE VC external code/text/image assets'
    ],
    protectedAreas: [
      'page-schedule',
      'page-quality-dash',
      'page-quality-main',
      'page-quality-analysis',
      'page-quality-action',
      'page-quality-images',
      'page-quality-master',
      'page-prod-process',
      'PM',
      'nav',
      'odiNavAfterRenderDispatcher'
    ],
    validation: {
      classicModeDefault: null,
      localStorageFrameModeUsed: null,
      navRewritten: false,
      cssCleanupResumed: false,
      pageContentModified: false,
      duplicateIds: [],
      nestedPageCount: null,
      pmTargetMissing: [],
      primaryTabsReady: null,
      panelContentReady: null,
      compactDrawerReady: null,
      keymapReady: null,
      quickRailSyncReady: null
    }
  };

  // ── smoke check (명령문 21절 사양) ───────────────────
  window.runOdiFrameModeV04SmokeCheck = function(){
    var result = {
      version: window.APP_VERSION || 'unknown',
      hasV03Audit: !!window.ODI_FRAME_MODE_V03_AUDIT,
      hasV04Audit: !!window.ODI_FRAME_MODE_V04_AUDIT,
      defaultMode: document.body && document.body.dataset ? document.body.dataset.layoutMode : null,
      styleBlockCount: document.querySelectorAll('style').length,
      scriptBlockCount: document.querySelectorAll('script').length,
      pageCount: document.querySelectorAll('.page').length,
      nestedPageCount: document.querySelectorAll('.page .page').length,
      duplicateIds: [],
      pmTargetMissing: [],
      frameDom: {
        frameProfileHeader: !!document.getElementById('frameProfileHeader'),
        frameTabs: !!document.getElementById('frameTabs'),
        frameRightPanel: !!document.getElementById('frameRightPanel'),
        frameQuickRail: !!document.getElementById('frameQuickRail'),
        frameBottomDrawer: !!document.getElementById('frameBottomDrawer'),
        frameBackdrop: !!document.getElementById('frameBackdrop'),
        frameModeDrawerToggle: !!document.getElementById('frameModeDrawerToggle'),
        frameModeShortcutHint: !!document.getElementById('frameModeShortcutHint')
      },
      frameFunctions: {},
      storagePolicy: {
        localStorageFrameModeUsed: false,
        sessionStorageAllowed: true
      },
      routeMeta: {
        panelKeyMapReady: !!window.ODI_FRAME_V04_ROUTE_TO_PANEL_KEY,
        primaryTabsReady: !!window.ODI_FRAME_V04_PRIMARY_TABS,
        panelContentReady: !!window.ODI_FRAME_V04_PANEL_CONTENT
      },
      protectedPages: {
        schedulePageReady: !!document.getElementById('page-schedule'),
        processPageReady: !!document.getElementById('page-prod-process'),
        qualityPagesReady: true
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
      if(!document.getElementById(id)) result.protectedPages.qualityPagesReady = false;
    });

    [
      'odiFrameV04GetPanelKey',
      'odiFrameV04RenderPrimaryTabs',
      'odiFrameV04RenderPanelContent',
      'odiFrameV04SyncQuickRail',
      'odiFrameV04ToggleSidebarDrawer',
      'odiFrameV04OpenSidebarDrawer',
      'odiFrameV04CloseSidebarDrawer',
      'odiFrameV04CloseAllDrawers',
      'odiFrameV04InstallKeymap',
      'odiFrameV04IsTypingTarget',
      'odiFrameV04Init'
    ].forEach(function(fn){
      result.frameFunctions[fn] = typeof window[fn] === 'function';
    });

    try {
      if(typeof localStorage !== 'undefined' && localStorage.getItem('odi_frame_mode')){
        result.storagePolicy.localStorageFrameModeUsed = true;
        result.errors.push('localStorage odi_frame_mode key detected — policy violation');
      }
    } catch(_e){}

    console.log('[Q_REBUILD_08J_FRAME_MODE_V0_4_PANEL_TABS_DRAWER_KEYMAP_ALIGN] smoke check', result);
    return result;
  };

  // ── 자동 검증 ───────────────────────────────────────
  function runValidation(){
    var A = window.ODI_FRAME_MODE_V04_AUDIT;
    var V = A.validation;
    try {
      V.classicModeDefault = (document.body && document.body.dataset && document.body.dataset.layoutMode === 'classic');
      // localStorage 정책 확인
      var lsUsed = false;
      try { if(localStorage.getItem('odi_frame_mode')) lsUsed = true; } catch(_e){}
      V.localStorageFrameModeUsed = lsUsed;
      V.nestedPageCount = document.querySelectorAll('.page .page').length;
      // duplicate id
      var seen = {}, dups = [];
      document.querySelectorAll('[id]').forEach(function(el){
        if(!el.id) return;
        seen[el.id] = (seen[el.id]||0) + 1;
      });
      Object.keys(seen).forEach(function(id){ if(seen[id]>1) dups.push({id:id,count:seen[id]}); });
      V.duplicateIds = dups;
      // PM target
      var miss = [];
      if(typeof window.PM !== 'undefined' && window.PM){
        Object.keys(window.PM).forEach(function(k){
          var id = window.PM[k];
          if(id && !document.getElementById(id)) miss.push({key:k,pageId:id});
        });
      }
      V.pmTargetMissing = miss;

      V.primaryTabsReady = !!window.ODI_FRAME_V04_PRIMARY_TABS;
      V.panelContentReady = !!window.ODI_FRAME_V04_PANEL_CONTENT;
      V.compactDrawerReady = !!document.getElementById('frameModeDrawerToggle') && typeof window.odiFrameV04ToggleSidebarDrawer === 'function';
      V.keymapReady = !!window.__odiFrameV04KeymapInstalled;
      V.quickRailSyncReady = typeof window.odiFrameV04SyncQuickRail === 'function';

      console.log('[' + VERSION + '] auto-validation', V);
    } catch(e){
      V.error = String(e && e.message || e);
      console.warn('[' + VERSION + '] auto-validation failed', e);
    }
  }

  // V0.3 init은 2200ms, V0.3 stabilize는 2600ms. V0.4는 그 이후에 실행.
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      setTimeout(function(){ window.odiFrameV04Init(); runValidation(); }, 3000);
    });
  } else {
    setTimeout(function(){ window.odiFrameV04Init(); runValidation(); }, 3000);
  }
})();
