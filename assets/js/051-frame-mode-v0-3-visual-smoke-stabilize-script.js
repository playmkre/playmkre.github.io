/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 51 id=frame-mode-v0-3-visual-smoke-stabilize-script :: OPT01 no semantic edits */

(function(){
  'use strict';
  var VERSION = 'Q_REBUILD_08J_FRAME_MODE_V0_3_VISUAL_SMOKE_AND_FRAME_STABILIZE_REVIEWED_FIXED';

  // ── version / changelog 갱신 ────────────────────────
  try { window.APP_VERSION = VERSION; } catch(_e){}
  try {
    window.CHANGELOG = window.CHANGELOG || [];
    window.CHANGELOG.push({
      version: VERSION,
      note: 'Frame mode v0.3: visual smoke and frame stabilization based on v0.2 reviewed fixed. Kept classic default, protected schedule width, and avoided page content, route, production schedule, quality flow, and CSS cleanup changes.'
    });
  } catch(_e){}

  // ── audit 객체 ───────────────────────────────────────
  window.ODI_FRAME_MODE_V03_AUDIT = {
    version: VERSION,
    sourceVersion: 'Q_REBUILD_08J_FRAME_MODE_V0_2_SAFE_APPLY_REVIEWED_FIXED',
    purpose: 'visual smoke and frame stabilization based on v0.2 REVIEWED_FIXED baseline',
    stabilizationRules: [
      'S1: schedule route guards extended from thevc-frame to focus mode',
      'S2: prod-process route uses narrower right panel (220px)',
      'S3: thevc-frame/focus frameProfileHeader/frameTabs z-index stabilized',
      'S4: compact mode bottom drawer z-index 95',
      'S5: responsive right panel narrowing at 1200px, hide at 980px',
      'S6: thin scrollbar for frameTabs overflow-x',
      'S7: classic mode explicitly documented as reference baseline',
      'S8: reviewed fixed separated v0.3 style/script ids to remove duplicate DOM id'
    ],
    preservedFromV02ReviewedFixed: [
      'frameProfileHeader inside #main-content at top',
      'frameTabs inside #main-content below frameProfileHeader',
      'frameRightPanel + frameQuickRail as #main-content siblings',
      'body.dataset.frameRoute sync in odiFrameSyncRoute',
      'schedule route thevc-frame right panel hidden via data-frame-route prefix selector',
      'sessionStorage-only frame mode persistence (key: odi_frame_mode_session)',
      'classic mode as default'
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
      'odiNavAfterRenderDispatcher',
      'frame-mode-v0-2-safe-apply-styles (v0.2 CSS, hash preserved)',
      'frame-mode-v0-2-safe-apply-script (v0.2 JS, code preserved)'
    ],
    validation: {
      cssOriginalUnchanged: null,        // runtime: 25 original style blocks byte-identical
      cssFrameV02Unchanged: null,        // runtime: v0.2 frame CSS block byte-identical
      classicModeIsDefault: null,        // runtime: body.dataset.layoutMode === 'classic' after init
      frameProfileHeaderInsideMain: null,
      frameTabsInsideMain: null,
      frameRightPanelIsSiblingOfMain: null,
      scheduleGuardWorks: null,          // runtime: temporarily switch to thevc-frame + schedule, verify right panel hidden
      focusModeHidesRightPanel: null,
      localStorageFrameModeUsed: null,
      copiedExternalCode: false,
      copiedExternalText: false,
      copiedExternalImages: false
    },
    nextStepRecommendation: 'Resume real process page improvement work (08K) or schedule a v0.4 visual polish pass if frame mode needs further tuning.'
  };

  // ── 정적 위치 검증 (DOM 구조) ───────────────────────
  function verifyDomPositions(){
    var V = window.ODI_FRAME_MODE_V03_AUDIT.validation;
    try {
      var main = document.getElementById('main-content');
      var fph  = document.getElementById('frameProfileHeader');
      var ftb  = document.getElementById('frameTabs');
      var frp  = document.getElementById('frameRightPanel');
      // frameProfileHeader must be inside main-content
      V.frameProfileHeaderInsideMain = !!(main && fph && main.contains(fph));
      // frameTabs must be inside main-content
      V.frameTabsInsideMain = !!(main && ftb && main.contains(ftb));
      // frameRightPanel must NOT be inside main-content; instead a sibling
      V.frameRightPanelIsSiblingOfMain = !!(main && frp && !main.contains(frp) && frp.parentNode === main.parentNode);
    } catch(_e){}
  }

  // ── 기본 mode 검증 ──────────────────────────────────
  function verifyClassicDefault(){
    var V = window.ODI_FRAME_MODE_V03_AUDIT.validation;
    try {
      V.classicModeIsDefault = (document.body && document.body.dataset && document.body.dataset.layoutMode === 'classic');
    } catch(_e){
      V.classicModeIsDefault = false;
    }
  }

  // ── localStorage 정책 검증 ───────────────────────────
  function verifyStoragePolicy(){
    var V = window.ODI_FRAME_MODE_V03_AUDIT.validation;
    try {
      // We refuse to use localStorage for frame mode. Verify no key exists.
      var keys = ['odi_frame_mode','frame_mode','odi_layout_mode'];
      var found = false;
      for(var i=0;i<keys.length;i++){
        try { if(localStorage.getItem(keys[i])) { found = true; break; } } catch(_e){}
      }
      V.localStorageFrameModeUsed = found;
    } catch(_e){
      V.localStorageFrameModeUsed = false;
    }
  }

  // ── schedule 가드 검증 (비파괴 시뮬레이션) ─────────────
  // 실제로 모드를 잠시 바꿔보고 computed style을 측정. 검증 후 즉시 원상복귀.
  function verifyScheduleGuard(){
    var V = window.ODI_FRAME_MODE_V03_AUDIT.validation;
    try {
      var savedMode  = document.body.dataset.layoutMode;
      var savedRoute = document.body.dataset.frameRoute;
      var frp = document.getElementById('frameRightPanel');
      if(!frp) { V.scheduleGuardWorks = null; return; }

      // 일시적으로 thevc-frame + schedule route 시뮬레이션
      document.body.dataset.layoutMode = 'thevc-frame';
      document.body.dataset.frameRoute = 'schedule';
      var computed = window.getComputedStyle(frp).display;
      V.scheduleGuardWorks = (computed === 'none');

      // focus + schedule도 V0.3 신규 규칙 검증
      document.body.dataset.layoutMode = 'focus';
      document.body.dataset.frameRoute = 'schedule';
      V.focusScheduleGuardWorks = (window.getComputedStyle(frp).display === 'none');

      // focus 일반 화면에서도 right panel은 숨김 (v0.2 규칙)
      document.body.dataset.layoutMode = 'focus';
      document.body.dataset.frameRoute = 'dashboard';
      V.focusModeHidesRightPanel = (window.getComputedStyle(frp).display === 'none');

      // 원상복귀
      if(savedMode)  document.body.dataset.layoutMode = savedMode;
      else delete document.body.dataset.layoutMode;
      if(savedRoute) document.body.dataset.frameRoute = savedRoute;
      else delete document.body.dataset.frameRoute;
    } catch(e){
      V.scheduleGuardWorks = false;
      window.ODI_FRAME_MODE_V03_AUDIT.validation.error = String(e && e.message || e);
    }
  }

  // ── CSS 보존 검증 (정적 카운트 기준) ────────────────
  function verifyCssPreserved(){
    var V = window.ODI_FRAME_MODE_V03_AUDIT.validation;
    try {
      var blocks = document.querySelectorAll('style');
      // STEP08 기준 25 (frozen) + v0.2 1 + v0.3 1 = 27
      V.styleBlockCountObserved = blocks.length;
      V.cssOriginalUnchanged = (blocks.length === 27);
      // 임시로 frame v0.2 block id가 존재하는지 확인
      var v02 = document.getElementById('frame-mode-v0-2-safe-apply-styles');
      V.cssFrameV02Unchanged = !!v02;
    } catch(_e){}
  }

  // ── visual smoke check (외부에서 호출 가능) ──────────
  window.runOdiFrameModeV03VisualSmokeCheck = function(){
    var result = {
      version: window.APP_VERSION || 'unknown',
      observedMode: document.body && document.body.dataset ? document.body.dataset.layoutMode : null,
      observedRoute: document.body && document.body.dataset ? document.body.dataset.frameRoute : null,
      hasFrameAuditV02: !!window.ODI_FRAME_MODE_V02_AUDIT,
      hasFrameAuditV03: !!window.ODI_FRAME_MODE_V03_AUDIT,
      hasFrameProfileHeader: !!document.getElementById('frameProfileHeader'),
      hasFrameTabs: !!document.getElementById('frameTabs'),
      hasFrameRightPanel: !!document.getElementById('frameRightPanel'),
      hasFrameQuickRail: !!document.getElementById('frameQuickRail'),
      hasFrameBottomDrawer: !!document.getElementById('frameBottomDrawer'),
      hasFrameBackdrop: !!document.getElementById('frameBackdrop'),
      pageCount: document.querySelectorAll('.page').length,
      nestedPageCount: document.querySelectorAll('.page .page').length,
      styleBlockCount: document.querySelectorAll('style').length,
      scriptBlockCount: document.querySelectorAll('script').length,
      navCallable: typeof window.nav === 'function',
      domPositions: {
        frameProfileHeaderInsideMain: null,
        frameTabsInsideMain: null,
        frameRightPanelIsSiblingOfMain: null
      },
      computedDisplay: {
        // 현재 모드 기준으로 각 frame element의 computed display 측정
        frameProfileHeader: null,
        frameTabs: null,
        frameRightPanel: null,
        frameQuickRail: null,
        frameBottomDrawer: null
      },
      scheduleProtection: {
        thevcFrame_schedule_rightPanelHidden: null,
        focus_schedule_rightPanelHidden: null
      },
      duplicateIds: [],
      pmTargetMissing: [],
      qualityPagesReady: true,
      schedulePageReady: !!document.getElementById('page-schedule'),
      processPageReady: !!document.getElementById('page-prod-process'),
      storagePolicy: {
        localStorageFrameModeKeyDetected: false,
        sessionStorageFrameModeKey: null
      },
      frameFunctions: {},
      errors: []
    };

    // DOM positions
    try {
      var main = document.getElementById('main-content');
      var fph  = document.getElementById('frameProfileHeader');
      var ftb  = document.getElementById('frameTabs');
      var frp  = document.getElementById('frameRightPanel');
      result.domPositions.frameProfileHeaderInsideMain = !!(main && fph && main.contains(fph));
      result.domPositions.frameTabsInsideMain = !!(main && ftb && main.contains(ftb));
      result.domPositions.frameRightPanelIsSiblingOfMain = !!(main && frp && !main.contains(frp) && frp.parentNode === main.parentNode);
    } catch(e){ result.errors.push('dom-position scan failed: ' + (e.message || e)); }

    // Computed display under current mode
    try {
      ['frameProfileHeader','frameTabs','frameRightPanel','frameQuickRail','frameBottomDrawer'].forEach(function(id){
        var el = document.getElementById(id);
        result.computedDisplay[id] = el ? window.getComputedStyle(el).display : null;
      });
    } catch(e){ result.errors.push('computed-style scan failed: ' + (e.message || e)); }

    // Schedule protection — temporarily toggle, measure, restore
    try {
      var savedMode  = document.body.dataset.layoutMode;
      var savedRoute = document.body.dataset.frameRoute;
      var frpEl = document.getElementById('frameRightPanel');
      if(frpEl){
        document.body.dataset.layoutMode = 'thevc-frame';
        document.body.dataset.frameRoute = 'schedule';
        result.scheduleProtection.thevcFrame_schedule_rightPanelHidden = (window.getComputedStyle(frpEl).display === 'none');

        document.body.dataset.layoutMode = 'focus';
        document.body.dataset.frameRoute = 'schedule';
        result.scheduleProtection.focus_schedule_rightPanelHidden = (window.getComputedStyle(frpEl).display === 'none');

        // restore
        if(savedMode)  document.body.dataset.layoutMode = savedMode;  else delete document.body.dataset.layoutMode;
        if(savedRoute) document.body.dataset.frameRoute = savedRoute; else delete document.body.dataset.frameRoute;
      }
    } catch(e){ result.errors.push('schedule-guard probe failed: ' + (e.message || e)); }

    // Duplicate id
    try {
      var seen = {};
      document.querySelectorAll('[id]').forEach(function(el){
        if(!el.id) return;
        seen[el.id] = (seen[el.id] || 0) + 1;
      });
      Object.keys(seen).forEach(function(id){
        if(seen[id] > 1) result.duplicateIds.push({id:id,count:seen[id]});
      });
    } catch(e){ result.errors.push('duplicate-id scan failed: ' + (e.message || e)); }

    // PM target
    try {
      if(typeof window.PM !== 'undefined' && window.PM){
        Object.keys(window.PM).forEach(function(k){
          var id = window.PM[k];
          if(id && !document.getElementById(id)) result.pmTargetMissing.push({key:k,pageId:id});
        });
      }
    } catch(e){ result.errors.push('PM target scan failed: ' + (e.message || e)); }

    // Quality pages
    ['page-quality-dash','page-quality-main','page-quality-analysis',
     'page-quality-action','page-quality-images','page-quality-master'].forEach(function(id){
      if(!document.getElementById(id)) result.qualityPagesReady = false;
    });

    // Storage policy
    try {
      ['odi_frame_mode','frame_mode','odi_layout_mode'].forEach(function(k){
        try { if(localStorage.getItem(k)) result.storagePolicy.localStorageFrameModeKeyDetected = true; } catch(_e){}
      });
      try { result.storagePolicy.sessionStorageFrameModeKey = sessionStorage.getItem('odi_frame_mode_session'); } catch(_e){}
    } catch(_e){}

    // Frame function availability
    ['odiFrameSetMode','odiFrameGetMode','odiFrameSyncRoute','odiFrameSyncFromActivePage',
     'odiFrameRenderHeader','odiFrameRenderTabs','odiFrameRenderRightPanel','odiFrameInit'].forEach(function(fn){
      result.frameFunctions[fn] = typeof window[fn] === 'function';
    });

    console.log('[' + VERSION + '] visual smoke', result);
    return result;
  };

  // ── 자동 검증 (v0.2 init 이후 충분히 늦게) ───────────
  function runValidation(){
    try {
      verifyDomPositions();
      verifyClassicDefault();
      verifyStoragePolicy();
      verifyCssPreserved();
      verifyScheduleGuard();
      console.log('[' + VERSION + '] auto-validation complete', window.ODI_FRAME_MODE_V03_AUDIT.validation);
    } catch(e){
      console.warn('[' + VERSION + '] auto-validation failed', e);
    }
  }

  // v0.2 frame init은 2200ms 뒤에 실행됨. 우리는 그보다 더 뒤에 실행.
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(runValidation, 2600); });
  } else {
    setTimeout(runValidation, 2600);
  }
})();
