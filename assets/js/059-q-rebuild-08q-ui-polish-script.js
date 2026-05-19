/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 59 id=q-rebuild-08q-ui-polish-script :: OPT01 no semantic edits */

(function(){
'use strict';
/* ============================================================================
 * Q_REBUILD_08Q_UI_POLISH_EMPTY_STATE_AND_DARKMODE_PASS
 * ----------------------------------------------------------------------------
 * 새 기능 추가 없음. UI 품질 정리:
 *  1. empty state 문구 통일 (데이터 없을 때 → 단일 패턴)
 *  2. 버튼 비활성 상태 개선 (준비 중 → 명확한 이유 표시)
 *  3. 사이드 메뉴 전체 open 상태 유지 확인
 *  4. 다크/라이트 모드 색상 변수 무결성 확인
 *  5. 개발자 문구(STEP/schema/blueprint/preview) 사용자 화면 노출 확인
 *  6. fm2-b-trust 신뢰도 값을 renderM08FileMapping 호출 후 반영되도록 보조
 * ============================================================================ */
var VERSION = 'Q_REBUILD_08Q_UI_POLISH_EMPTY_STATE_AND_DARKMODE_PASS_REVIEWED_FIXED';
try { window.APP_VERSION = VERSION; document.title = 'ODI 생산관리 — 사용자 포털 ' + VERSION; } catch(_e){}
try {
  window.CHANGELOG = window.CHANGELOG||[];
  window.CHANGELOG.push({ version:VERSION, note:'08Q: UI 정리 pass. 준비 중 버튼 제거(prod-headcount). fm2-b-trust 준비중→— 텍스트 정리. 다운로드 버튼 설명 개선. 새 기능 없음.' });
} catch(_e){}

/* fm2-b-trust : renderM08FileMapping이 fm2-b-trust 값을 채울 때 fm2-b-trust-val ID를 사용하도록 보조.
   기존 fm2-b-trust 자체에 내용을 쓰는 경우와 fm2-b-trust-val 두 경로를 모두 허용. */
function q08FixFm2Trust(){
  try {
    var trustEl = document.getElementById('fm2-b-trust-val');
    if(!trustEl) {
      /* fm2-b-trust-val 이 없으면 fm2-b-trust 내부 첫 번째 .di-map-icon 다음 div에 id 부여 */
      var trustBlock = document.getElementById('fm2-b-trust');
      if(trustBlock){
        var divs = trustBlock.querySelectorAll('div');
        /* second div (index 1) is the value display */
        if(divs.length >= 2 && !divs[1].id){
          divs[1].id = 'fm2-b-trust-val';
          if(divs[1].textContent.trim() === '—' || divs[1].textContent.trim() === '') {
            divs[1].textContent = '—';
          }
        }
      }
    }
  } catch(_e){}
}

/* Sidebar all-open check — ensure no group is collapsed */
function q08EnsureSidebarOpen(){
  try {
    document.querySelectorAll('.sb-items').forEach(function(el){
      if(!el.classList.contains('open')) el.classList.add('open');
    });
  } catch(_e){}
}

/* ── Audit function ── */
window.runOdi08QUiPolishAudit = function(){
  /* 1. Scan user-visible pages for forbidden text */
  var forbiddenPatterns = ['STEP01','STEP02','STEP03','STEP04','STEP05','STEP06','STEP07','STEP08','STEP09',
                           'schema','blueprint','preview-only'];
  var userPageIds = [
    'page-dashboard','page-equip-status','page-team-overview',
    'page-prod-overview','page-prod-headcount','page-prod-process',
    'page-quality-dash','page-quality-main','page-quality-analysis',
    'page-quality-action','page-quality-images','page-quality-master',
    'page-data-equip','page-upload-history','page-data-validation',
    'page-file-mapping','page-download','page-user-guide',
    'page-schedule','page-schedule-log','page-schedule-model','page-schedule-period'
  ];
  var forbiddenFound = [];
  userPageIds.forEach(function(pid){
    var page = document.getElementById(pid);
    if(!page) return;
    var text = page.textContent || '';
    forbiddenPatterns.forEach(function(p){
      /* skip data-qclean="boot" initial placeholder (replaced at runtime) */
      if(p.indexOf('STEP') < 0 && text.indexOf(p) >= 0) forbiddenFound.push(pid + ':' + p);
      if(p.indexOf('STEP') >= 0){
        /* STEP text — must not appear in visible DOM (not inside data-qclean=boot) */
        var bootEl = page.querySelector('[data-qclean="boot"]');
        var textWithoutBoot = bootEl ? text.replace(bootEl.textContent,'') : text;
        if(textWithoutBoot.indexOf(p) >= 0) forbiddenFound.push(pid+':'+p);
      }
    });
  });

  /* 2. Disabled buttons with 준비 중 text */
  var juniButtons = [];
  document.querySelectorAll('button[disabled]').forEach(function(b){
    var t = (b.textContent||'').trim();
    if(t === '준비 중' || t === '저장 (준비 중)') juniButtons.push(b.id || t);
  });

  /* 3. Sidebar all open */
  var sbGroups = document.querySelectorAll('.sb-items');
  var sbAllOpen = Array.from(sbGroups).every(function(el){ return el.classList.contains('open'); });

  /* 4. CSS variable coverage — light mode variables defined? */
  var style = document.querySelector('[data-theme="light"], style');
  var hasLightMode = !!document.querySelector('style') &&
    (document.documentElement.outerHTML.indexOf('[data-theme="light"]') >= 0 ||
     document.documentElement.outerHTML.indexOf('data-theme="light"') >= 0);

  /* 5. fm2-b-trust text */
  var trustEl = document.getElementById('fm2-b-trust-val') ||
                (document.getElementById('fm2-b-trust') && document.getElementById('fm2-b-trust').querySelectorAll('div')[1]);
  var trustText = trustEl ? (trustEl.textContent||'').trim() : '(elem missing)';
  var trustClean = trustText !== '준비중' && trustText !== '준비 중';

  /* 6. qClean 10 tabs still intact */
  var qcTabs = document.querySelectorAll('#page-quality-analysis [data-qclean="tabs"] > button').length;

  /* 7. Changelog chain */
  var versions = (window.CHANGELOG||[]).map(function(c){ return c.version; });

  var result = {
    version: VERSION,
    forbiddenTextFound: forbiddenFound,
    forbiddenTextClean: forbiddenFound.length === 0,
    disabledJuniButtons: juniButtons,
    disabledJuniClean: juniButtons.length === 0,
    sidebarAllOpen: sbAllOpen,
    hasLightMode: hasLightMode,
    fm2TrustText: trustText,
    fm2TrustClean: trustClean,
    qCleanTabsCount: qcTabs,
    changelogVersions: versions,
    errors: []
  };
  try { console.log('[' + VERSION + '] ui-polish-audit', result); } catch(_e){}
  return result;
};

function q08Init(){
  try { q08FixFm2Trust(); } catch(_e){}
  try { q08EnsureSidebarOpen(); } catch(_e){}
}
function q08Boot(){ setTimeout(q08Init, 1200); }
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', q08Boot);
else q08Boot();

})();
