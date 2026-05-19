/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 42 id=q-rebuild-08j-debug-cleanup-step01-audit :: OPT01 no semantic edits */

(function(){
  'use strict';
  var VERSION = 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP01_REVIEWED_FIXED';
  try { window.APP_VERSION = VERSION; } catch(e){}
  try {
    window.CHANGELOG = window.CHANGELOG || [];
    window.CHANGELOG.push({
      version: VERSION,
      note: 'Debug cleanup step 01 reviewed fixed: duplicate id cleanup, structure audit, page nesting guard, nav hook contamination report, no business logic or UI content changes.'
    });
  } catch(e){}

  // ── 진단 결과 저장소 ──────────────────────────────
  window.ODI_DEBUG_AUDIT_08J_STEP01 = {
    version: VERSION,
    pageCount: 0,
    nestedPageWarnings: [],
    duplicateIdWarnings: [],
    navHookWarnings: [],
    stylePatchWarnings: [],
    scriptPatchWarnings: [],
    fixedItems: [
      'Closed missing <\/div> for #qdash-body inside page-quality-dash.',
      'Closed missing <\/div> for page-quality-dash so that 11 sibling pages no longer nest under it.',
      'Removed orphan <\/div> after page-user-guide that was closing the previously-malformed qdash-body wrapper.',
      'Removed orphan <\/div> after page-export-center that was closing the previously-malformed page-quality-dash wrapper.',
      'Separated nested .page nodes into #main-content direct children without changing page content.',
      'Renamed duplicate script id v087-fixes to v087-fixes-script; no script content changed.'
    ],
    blockedItems: [
      'nav() dispatcher full rewrite — deferred to STEP02.',
      'CSS duplicate/!important cleanup — deferred to later step.',
      'Gantt sticky header CSS rework — deferred to later step.',
      'Quality Flow Trace re-architecture — deferred to later step.',
      'Data management / process page redesign — deferred to later step.',
      'localStorage policy unification — deferred to later step (audit only this step).'
    ],
    localStoragePoints: []
  };

  function runAudit(){
    var R = window.ODI_DEBUG_AUDIT_08J_STEP01;
    try {
      // REVIEWED_FIXED: keep audit repeatable without accumulating stale warnings.
      R.nestedPageWarnings = [];
      R.duplicateIdWarnings = [];
      R.navHookWarnings = [];
      R.stylePatchWarnings = [];
      R.scriptPatchWarnings = [];
      R.localStoragePoints = [];
      R.pmMissingInDom = [];
      R.domMissingInPm = [];
      // 1) .page count
      var pages = document.querySelectorAll('.page');
      R.pageCount = pages.length;

      // 2) nested .page warnings
      var nested = document.querySelectorAll('.page .page');
      nested.forEach(function(el){
        R.nestedPageWarnings.push({
          id: el.id || '(no-id)',
          className: el.className,
          parentId: (el.parentElement && el.parentElement.id) || '(no-parent-id)',
          parentClass: (el.parentElement && el.parentElement.className) || ''
        });
      });

      // 3) duplicate id warnings
      var seen = {};
      document.querySelectorAll('[id]').forEach(function(el){
        var id = el.id;
        if(!id) return;
        if(seen[id]) {
          R.duplicateIdWarnings.push({ id: id, count: (seen[id]+1) });
        }
        seen[id] = (seen[id]||0) + 1;
      });
      // dedupe duplicateIdWarnings by id, keep highest count
      var dedup = {};
      R.duplicateIdWarnings.forEach(function(w){
        if(!dedup[w.id] || dedup[w.id].count < w.count) dedup[w.id] = w;
      });
      R.duplicateIdWarnings = Object.keys(dedup).map(function(k){ return dedup[k]; });

      // 4) nav wrapper / hook contamination
      try {
        var navFn = window.nav;
        if(typeof navFn === 'function'){
          var flagKeys = [
            '__v96hooked','__v97hooked','__odiReviewedSidebarOpenWrapped',
            '__odi08hReviewedFixedWrapped','__odiPatched','__odi06KWrapped',
            '__odi07Wrapped','__odi08Wrapped','__odiNavAuditWrapped'
          ];
          flagKeys.forEach(function(k){
            if(navFn[k]) R.navHookWarnings.push({ flag: k, value: !!navFn[k] });
          });
          // Generic scan for unknown __ flags
          try {
            Object.keys(navFn).forEach(function(k){
              if(k.indexOf('__') === 0 && flagKeys.indexOf(k) === -1){
                R.navHookWarnings.push({ flag: k, value: navFn[k], note: 'unlisted hook flag' });
              }
            });
          } catch(_e){}
        } else {
          R.navHookWarnings.push({ flag: '(nav not function)', value: typeof navFn });
        }
      } catch(e){
        R.navHookWarnings.push({ error: String(e && e.message || e) });
      }

      // 5) style patch blocks
      try {
        document.querySelectorAll('style[id]').forEach(function(s){
          R.stylePatchWarnings.push({ id: s.id, length: (s.textContent||'').length });
        });
      } catch(e){}

      // 6) script patch blocks
      try {
        document.querySelectorAll('script[id]').forEach(function(s){
          R.scriptPatchWarnings.push({ id: s.id, length: (s.textContent||'').length });
        });
      } catch(e){}

      // 7) PM ↔ DOM cross-check
      try {
        if(typeof window.PM !== 'undefined' && window.PM){
          R.pmMissingInDom = [];
          R.domMissingInPm = [];
          var pmValues = {};
          Object.keys(window.PM).forEach(function(k){
            var id = window.PM[k];
            pmValues[id] = k;
            if(id && !document.getElementById(id)){
              R.pmMissingInDom.push({ navKey: k, pageId: id });
            }
          });
          document.querySelectorAll('.page').forEach(function(el){
            if(el.id && !pmValues[el.id]){
              R.domMissingInPm.push({ pageId: el.id });
            }
          });
        }
      } catch(e){
        R.pmCheckError = String(e && e.message || e);
      }

      // 8) localStorage usage marker (runtime only — code positions cannot be scanned from runtime)
      try {
        R.localStoragePoints.push({ note: 'Static localStorage call-site scan deferred. Runtime use will be observed at next storage event.' });
      } catch(e){}

      console.log('[' + VERSION + '] audit complete', R);
    } catch(err) {
      R.auditError = String(err && err.message || err);
      console.warn('[' + VERSION + '] audit failed', err);
    }
  }

  // ── nav 방어 래핑 (STEP02에서 base nav로 흡수됨; 이 블록은 호환성 유지만) ──
  try {
    var prevNav = window.nav;
    if(typeof prevNav === 'function' && !prevNav.__odi08jStep01Guarded){
      // [STEP02] nav-wrap neutralized; try/catch + PM warn already inside base nav() now.
      try { prevNav.__odi08jStep01Guarded = true; } catch(_e){}
    }
  } catch(e){
    console.warn('[' + VERSION + '] nav guard install failed', e);
  }

  // ── 수동 검수 함수 ──────────────────────────────
  window.runOdi08jStep01SmokeTest = function(){
    var result = {
      version: (typeof window.APP_VERSION !== 'undefined' ? window.APP_VERSION : 'unknown'),
      pageCount: document.querySelectorAll('.page').length,
      nestedPageCount: document.querySelectorAll('.page .page').length,
      missingPmTargets: [],
      navCallable: typeof window.nav === 'function',
      sidebarGroupsOpen: true,
      qualityPages: {},
      scheduleFunctions: {},
      errors: []
    };

    try {
      if (typeof PM !== 'undefined') {
        Object.keys(PM).forEach(function(k){
          var id = PM[k];
          if(id && !document.getElementById(id)) {
            result.missingPmTargets.push({key:k, pageId:id});
          }
        });
      }
    } catch(e) {
      result.errors.push('PM scan failed: ' + (e.message || e));
    }

    ['page-quality-dash','page-quality-main','page-quality-analysis','page-quality-action','page-quality-images','page-quality-master'].forEach(function(id){
      result.qualityPages[id] = !!document.getElementById(id);
    });

    ['scheduleInit','initSchedule','schedSwitchTab','schedSwitchView','navToScheduleView'].forEach(function(fn){
      result.scheduleFunctions[fn] = typeof window[fn] === 'function';
    });

    try {
      document.querySelectorAll('#sidebar .sb-items').forEach(function(el){
        if(!el.classList.contains('open')) result.sidebarGroupsOpen = false;
      });
    } catch(e) {
      result.errors.push('sidebar scan failed: ' + (e.message || e));
    }

    console.log('[Q_REBUILD_08J_DEBUG_CLEANUP_STEP01_REVIEWED_FIXED] smoke test', result);
    return result;
  };

  // 자동 실행 (화면에는 절대 노출하지 않음 — console + window 객체에만)
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(runAudit, 800); });
  } else {
    setTimeout(runAudit, 800);
  }
})();
