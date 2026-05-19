/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 53 id=frame-mode-v0-4-reviewed-fixed-script :: OPT01 no semantic edits */

(function(){
  'use strict';
  var VERSION = 'Q_REBUILD_08J_FRAME_MODE_V0_4_PANEL_TABS_DRAWER_KEYMAP_ALIGN_REVIEWED_FIXED';
  try { window.APP_VERSION = VERSION; } catch(_e){}
  try { document.title = 'ODI 생산관리 — 사용자 포털 ' + VERSION; } catch(_e){}
  try {
    window.CHANGELOG = window.CHANGELOG || [];
    window.CHANGELOG.push({
      version: VERSION,
      note: 'Reviewed fixed: compared V0.4 against FRAME_MODE_v0.1 and restored missing frame-feel parity by adding route-oriented quick rail buttons and true off-canvas sidebar drawer behavior for thevc-frame/focus. Classic remains unchanged; no nav wrapper, localStorage frame mode, page content, schedule logic, or quality flow changes.'
    });
  } catch(_e){}

  var RAIL_ITEMS = [
    { panel:'dashboard', route:'dashboard',     icon:'📊', title:'종합현황' },
    { panel:'schedule',  route:'schedule',      icon:'📅', title:'일정/공정' },
    { panel:'quality',   route:'quality-dash',  icon:'🔬', title:'품질관리' },
    { panel:'data',      route:'data-equip',    icon:'✅', title:'데이터' },
    { panel:'report',    route:'download',      icon:'📥', title:'리포트' },
    { panel:'settings',  route:'user-guide',    icon:'📖', title:'안내/관리' }
  ];
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function safeRoute(route){
    try {
      if(window.ODI_USER_FORBIDDEN_ROUTES && window.ODI_USER_FORBIDDEN_ROUTES[route]) return false;
      if(typeof window.isForbiddenRoute === 'function' && window.isForbiddenRoute(route)) return false;
    } catch(_e){}
    return true;
  }
  window.odiFrameV04ReviewedRouteNav = function(route){
    if(!route) return;
    if(!safeRoute(route)){
      console.warn('[frame v0.4 reviewed fixed] forbidden route ignored:', route);
      return;
    }
    try {
      if(typeof window.nav === 'function') window.nav(route);
    } catch(e){
      console.warn('[frame v0.4 reviewed fixed] nav failed:', route, e);
    }
  };
  window.odiFrameV04ReviewedRenderQuickRail = function(){
    var rail = document.getElementById('frameQuickRail');
    if(!rail) return false;
    if(rail.getAttribute('data-v04-reviewed-fixed') === '1') return true;
    var html = RAIL_ITEMS.map(function(item){
      return '<button type="button" class="fqr-btn" data-fm-panel="' + esc(item.panel) + '" data-fm-route="' + esc(item.route) + '" title="' + esc(item.title) + '" onclick="window.odiFrameV04ReviewedRouteNav(&quot;' + esc(item.route) + '&quot;)">' + esc(item.icon) + '</button>';
    }).join('')
    + '<div class="fqr-sep" aria-hidden="true"></div>'
    + '<button type="button" class="fqr-btn" data-rail="back-classic" onclick="if(typeof odiFrameSetMode===\'function\')odiFrameSetMode(\'classic\')" title="Classic mode">↩</button>'
    + '<button type="button" class="fqr-btn" data-rail="focus" onclick="if(typeof odiFrameSetMode===\'function\')odiFrameSetMode(\'focus\')" title="Focus mode">◐</button>'
    + '<button type="button" class="fqr-btn" data-rail="compact" onclick="if(typeof odiFrameSetMode===\'function\')odiFrameSetMode(\'compact\')" title="Compact mode">▦</button>';
    rail.innerHTML = html;
    rail.setAttribute('data-v04-reviewed-fixed','1');
    return true;
  };
  function currentRoute(){
    try {
      var pm = window.PM || {};
      var active = document.querySelector('.page.active');
      if(!active || !active.id) return 'dashboard';
      for(var k in pm){ if(pm[k] === active.id) return k; }
    } catch(_e){}
    return 'dashboard';
  }
  function closeOnSidebarItemForAnyFrameMode(){
    var sb = document.getElementById('sidebar');
    if(!sb || sb.__v04ReviewedClickCloserInstalled) return;
    sb.addEventListener('click', function(ev){
      try {
        var mode = (document.body && document.body.dataset && document.body.dataset.layoutMode) || 'classic';
        if(mode === 'classic') return;
        if(!sb.classList.contains('odi-frame-drawer-open')) return;
        var t = ev.target;
        while(t && t !== sb){
          var tag = (t.tagName || '').toLowerCase();
          if(tag === 'a' || tag === 'button' || (t.getAttribute && t.getAttribute('onclick'))){
            setTimeout(function(){ if(typeof window.odiFrameV04CloseSidebarDrawer === 'function') window.odiFrameV04CloseSidebarDrawer(); }, 80);
            return;
          }
          t = t.parentNode;
        }
      } catch(_e){}
    }, true);
    sb.__v04ReviewedClickCloserInstalled = true;
  }
  function installReviewedSync(){
    try {
      window.odiFrameV04ReviewedRenderQuickRail();
      if(typeof window.odiFrameV04SyncQuickRail === 'function' && !window.odiFrameV04SyncQuickRail.__reviewedFixedWrapped){
        var original = window.odiFrameV04SyncQuickRail;
        window.odiFrameV04SyncQuickRail = function(route){
          try { window.odiFrameV04ReviewedRenderQuickRail(); } catch(_e){}
          return original.apply(this, arguments);
        };
        window.odiFrameV04SyncQuickRail.__reviewedFixedWrapped = true;
      }
      var k = currentRoute();
      if(typeof window.odiFrameV04SyncQuickRail === 'function') window.odiFrameV04SyncQuickRail(k);
    } catch(e){ console.warn('[frame v0.4 reviewed fixed] sync install failed', e); }
  }
  window.ODI_FRAME_MODE_V04_REVIEWED_FIXED_AUDIT = {
    version: VERSION,
    baseFile: 'ODI_USER_PORTAL_IMPL_Q_REBUILD_08J_FRAME_MODE_V0_4_PANEL_TABS_DRAWER_KEYMAP_ALIGN.html',
    comparedReference: 'ODI_USER_PORTAL_IMPL_FRAME_MODE_v0.1 (1).html',
    updates: [
      'Added route-oriented quick rail buttons similar to FRAME_MODE_v0.1',
      'Added true off-canvas sidebar drawer behavior for thevc-frame and focus modes',
      'Extended sidebar item click close behavior to non-classic open drawers',
      'Preserved V0.4 no-localStorage and no-nav-wrapper policy'
    ],
    validation: {
      quickRailRouteButtonsExpected: 6,
      trueDrawerModes: ['thevc-frame','focus','compact'],
      classicModeUnaffected: true,
      navWrapperAdded: false,
      localStorageFrameModeUsed: false
    }
  };
  window.runOdiFrameModeV04ReviewedFixedCheck = function(){
    var result = {
      version: window.APP_VERSION || 'unknown',
      hasV04Audit: !!window.ODI_FRAME_MODE_V04_AUDIT,
      hasReviewedFixedAudit: !!window.ODI_FRAME_MODE_V04_REVIEWED_FIXED_AUDIT,
      pageCount: document.querySelectorAll('.page').length,
      nestedPageCount: document.querySelectorAll('.page .page').length,
      duplicateIds: [],
      pmTargetMissing: [],
      routeQuickRailButtons: document.querySelectorAll('#frameQuickRail .fqr-btn[data-fm-panel]').length,
      hasDrawerToggle: !!document.getElementById('frameModeDrawerToggle'),
      hasShortcutHint: !!document.getElementById('frameModeShortcutHint'),
      localStorageFrameModeKeyDetected: false,
      functions: {
        reviewedRenderQuickRail: typeof window.odiFrameV04ReviewedRenderQuickRail === 'function',
        reviewedRouteNav: typeof window.odiFrameV04ReviewedRouteNav === 'function',
        sidebarDrawerToggle: typeof window.odiFrameV04ToggleSidebarDrawer === 'function',
        keymap: typeof window.odiFrameV04InstallKeymap === 'function'
      },
      errors: []
    };
    try {
      var seen = {};
      document.querySelectorAll('[id]').forEach(function(el){ if(el.id) seen[el.id] = (seen[el.id] || 0) + 1; });
      Object.keys(seen).forEach(function(id){ if(seen[id] > 1) result.duplicateIds.push({id:id,count:seen[id]}); });
    } catch(e){ result.errors.push('duplicate id scan failed: ' + (e.message || e)); }
    try {
      var pm = window.PM || {};
      Object.keys(pm).forEach(function(k){ if(pm[k] && !document.getElementById(pm[k])) result.pmTargetMissing.push({key:k,pageId:pm[k]}); });
    } catch(e){ result.errors.push('PM target scan failed: ' + (e.message || e)); }
    try { if(localStorage.getItem('odi_frame_mode')) result.localStorageFrameModeKeyDetected = true; } catch(_e){}
    console.log('[' + VERSION + '] reviewed fixed check', result);
    return result;
  };
  function init(){
    try { window.odiFrameV04ReviewedRenderQuickRail(); } catch(_e){}
    closeOnSidebarItemForAnyFrameMode();
    installReviewedSync();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 3200); });
  else setTimeout(init, 3200);
})();
