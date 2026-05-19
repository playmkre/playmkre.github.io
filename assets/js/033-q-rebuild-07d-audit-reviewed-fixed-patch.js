/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 33 id=q-rebuild-07d-audit-reviewed-fixed-patch :: OPT01 no semantic edits */

(function(){
  var VERSION = 'Q_REBUILD_08I_DATA_MANAGEMENT_PAGES_PURPOSE_REDESIGN';
  window.APP_VERSION = 'Q_REBUILD_08I_DATA_MANAGEMENT_PAGES_PURPOSE_REDESIGN';
  window.CHANGELOG = window.CHANGELOG || [];
  window.CHANGELOG.push({version:VERSION, note:'Contamination audit: hide main Flow Trace, preserve v0.97 quality UI, convert Dashboard Ready to soft gate, keep image/schedule structures.'});

  function q07dSoftGateHtml(kind){
    var msg = kind === 'analysis'
      ? 'Dashboard Ready 검토 전입니다. 분석 화면은 업로드 데이터 기준으로 표시됩니다.'
      : 'Dashboard Ready 검토 전입니다. 대시보드는 업로드 데이터 기준으로 표시됩니다.';
    return '<div class="q-flow-gate q-flow-gate-warn q-soft-ready-gate" style="margin-bottom:10px">' +
      '<span>⚠</span><span> ' + msg + '</span></div>';
  }
  function q07dInsertSoftGate(pageId, kind){
    var page = document.getElementById(pageId);
    if(!page || (typeof QDASH_READY_REVIEWED !== 'undefined' && QDASH_READY_REVIEWED)) return;
    var id = kind === 'analysis' ? 'q-analysis-soft-ready-gate' : 'q-dash-soft-ready-gate';
    if(document.getElementById(id)) return;
    var div = document.createElement('div');
    div.id = id;
    div.innerHTML = q07dSoftGateHtml(kind);
    page.insertBefore(div, page.firstChild);
  }
  window.q07dInsertSoftGate = q07dInsertSoftGate;

  var prevTrace = typeof qRenderQualityFlowTracePanel === 'function' ? qRenderQualityFlowTracePanel : null;
  window.qRenderQualityFlowTracePanel = function(containerId, mode){
    var el = document.getElementById(containerId);
    if(!el) return;
    if(containerId === 'q-flow-trace-main'){
      el.innerHTML = '';
      el.style.display = 'none';
      return;
    }
    if(containerId === 'q-flow-trace-dash' || containerId === 'q-flow-trace-analysis'){
      el.style.display = '';
      var isReviewed = !!(typeof QDASH_READY_REVIEWED !== 'undefined' && QDASH_READY_REVIEWED);
      var hasData = !!((typeof QDASH_READY_DATA !== 'undefined' && QDASH_READY_DATA) || (typeof QDEFECT_WORKBOOK_READY !== 'undefined' && QDEFECT_WORKBOOK_READY));
      el.innerHTML = '<div class="q-flow-gate '+(isReviewed?'q-flow-gate-ok':(hasData?'q-flow-gate-warn':'q-flow-gate-idle'))+'" style="margin-bottom:10px">' +
        '<span>'+(isReviewed?'✅':(hasData?'⚠':'ℹ'))+'</span><span>'+
        (isReviewed ? 'Dashboard Ready 검토 완료' : (hasData ? '검토 전 — 업로드 데이터 기준 표시' : '품질 XLSX 업로드 전'))+
        '</span></div>';
      return;
    }
    if(prevTrace) return prevTrace.apply(this, arguments);
  };

  var prevRefresh = typeof qRefreshQualityFlowTracePanel === 'function' ? qRefreshQualityFlowTracePanel : null;
  window.qRefreshQualityFlowTracePanel = function(reason){
    try{
      var main = document.getElementById('q-flow-trace-main');
      if(main){ main.innerHTML=''; main.style.display='none'; }
      window.qRenderQualityFlowTracePanel('q-flow-trace-dash','compact');
      window.qRenderQualityFlowTracePanel('q-flow-trace-analysis','compact');
    }catch(e){ console.warn('[07D audit] trace refresh failed', reason||'', e); }
  };

  var origDash = (typeof _qOrigRenderDashCharts === 'function') ? _qOrigRenderDashCharts : (typeof qRenderQualityDashboardCharts === 'function' ? qRenderQualityDashboardCharts : null);
  window.qRenderQualityDashboardCharts = function(){
    var hasQDefect = !!(typeof QDEFECT_WORKBOOK_READY !== 'undefined' && QDEFECT_WORKBOOK_READY);
    var hasReady = !!(typeof QDASH_READY_DATA !== 'undefined' && QDASH_READY_DATA);
    if(hasReady && origDash){ origDash.apply(this, arguments); q07dInsertSoftGate('page-quality-dash','dash'); return; }
    if(hasQDefect && typeof renderQDashPage === 'function'){ renderQDashPage(); q07dInsertSoftGate('page-quality-dash','dash'); return; }
    var page = document.getElementById('page-quality-dash');
    if(page){ page.innerHTML = '<div class="pg-hd"><div class="pg-title">📊 품질 통합 대시보드</div></div>'+
      '<div class="card" style="text-align:center;padding:32px"><div style="font-size:28px;margin-bottom:8px">📋</div><b>품질 데이터가 없습니다.</b><div style="font-size:11px;color:var(--tm);margin-top:6px">불량 관리 센터에서 XLSX를 업로드하세요.</div></div>'; }
  };

  var origAnalysis = (typeof _qOrigRenderQualityAnalysisCenterCharts === 'function') ? _qOrigRenderQualityAnalysisCenterCharts : (typeof qRenderQualityAnalysisCenterCharts === 'function' ? qRenderQualityAnalysisCenterCharts : null);
  window.qRenderQualityAnalysisCenterCharts = function(){
    var hasQDefect = !!(typeof QDEFECT_WORKBOOK_READY !== 'undefined' && QDEFECT_WORKBOOK_READY);
    var hasReady = !!(typeof QDASH_READY_DATA !== 'undefined' && QDASH_READY_DATA);
    if(hasReady && origAnalysis){ origAnalysis.apply(this, arguments); q07dInsertSoftGate('page-quality-analysis','analysis'); return; }
    if(hasQDefect && typeof renderQAnalysisPage === 'function'){ renderQAnalysisPage(); q07dInsertSoftGate('page-quality-analysis','analysis'); return; }
    var page = document.getElementById('page-quality-analysis');
    if(page){ page.innerHTML = '<div class="pg-hd"><div class="pg-title">📈 품질 분석센터</div></div>'+
      '<div class="card" style="text-align:center;padding:32px"><div style="font-size:28px;margin-bottom:8px">📊</div><b>품질 데이터가 없습니다.</b><div style="font-size:11px;color:var(--tm);margin-top:6px">불량 관리 센터에서 XLSX를 업로드하세요.</div></div>'; }
  };

  document.addEventListener('DOMContentLoaded', function(){
    try{ if(typeof odiEnsureSidebarAllGroupsOpen === 'function') odiEnsureSidebarAllGroupsOpen(); }catch(e){}
    try{ qRefreshQualityFlowTracePanel('07d-audit-dom'); }catch(e){}
  });
})();

// ── Q_REBUILD_08A: Menu Inventory ─────────────────────────────────────────
var ODI_MENU_INVENTORY = [
  // 대시보드
  {key:'dashboard', label:'종합 현황', group:'대시보드', pageId:'page-dashboard', status:'active', owner:'common'},
  {key:'equip-status', label:'장비 생산현황', group:'대시보드', pageId:'page-equip-status', status:'active', owner:'production'},
  {key:'team-overview', label:'팀별 업무 현황', group:'대시보드', pageId:'page-team-overview', status:'active', owner:'production'},
  // 일정 관리
  {key:'schedule', label:'생산일정 관리', group:'일정 관리', pageId:'page-schedule', status:'active', owner:'production'},
  {key:'schedule-log', label:'스케줄 변동 이력', group:'일정 관리', pageId:'page-schedule-log', status:'active', owner:'production'},
  {key:'schedule-model', label:'모델별 상세', group:'일정 관리', pageId:'page-schedule-model', status:'active', owner:'production'},
  {key:'schedule-period', label:'기간별 분석', group:'일정 관리', pageId:'page-schedule-period', status:'active', owner:'production'},
  // 생산 관리
  {key:'prod-overview', label:'종합 파악', group:'생산 관리', pageId:'page-prod-overview', status:'shell', owner:'production'},
  {key:'prod-headcount', label:'생산인원 입력', group:'생산 관리', pageId:'page-prod-headcount', status:'shell', owner:'production'},
  {key:'prod-process', label:'공정 현황', group:'생산 관리', pageId:'page-prod-process', status:'shell', owner:'production'},
  // 품질 관리
  {key:'quality-dash', label:'품질 통합 대시보드', group:'품질 관리', pageId:'page-quality-dash', status:'active', owner:'quality'},
  {key:'quality-main', label:'불량 관리 센터', group:'품질 관리', pageId:'page-quality-main', status:'active', owner:'quality'},
  {key:'quality-analysis', label:'품질 분석센터', group:'품질 관리', pageId:'page-quality-analysis', status:'active', owner:'quality'},
  {key:'quality-action', label:'조치·ECO·CAPA', group:'품질 관리', pageId:'page-quality-action', status:'active', owner:'quality'},
  {key:'quality-images', label:'이미지/증빙', group:'품질 관리', pageId:'page-quality-images', status:'active', owner:'quality'},
  {key:'quality-master', label:'기준정보/코드', group:'품질 관리', pageId:'page-quality-master', status:'active', owner:'quality'},
  // 데이터 관리
  {key:'data-equip', label:'장비 데이터', group:'데이터 관리', pageId:'page-data-equip', status:'active', owner:'common'},
  {key:'upload-history', label:'업로드 이력', group:'데이터 관리', pageId:'page-upload-history', status:'active', owner:'common'},
  {key:'data-validation', label:'데이터 검증', group:'데이터 관리', pageId:'page-data-validation', status:'active', owner:'common'},
  {key:'file-mapping', label:'파일 매핑', group:'데이터 관리', pageId:'page-file-mapping', status:'active', owner:'common'},
  {key:'download', label:'내보내기·다운로드', group:'데이터 관리', pageId:'page-download', status:'active', owner:'common'},
  {key:'user-guide', label:'사용 가이드', group:'데이터 관리', pageId:'page-user-guide', status:'active', owner:'common'},
  // 검수/시스템 (08A 신규)
  {key:'test-management', label:'검수 허브', group:'검수·시스템', pageId:'page-test-management', status:'active', owner:'test'},
  {key:'change-log', label:'변경 이력', group:'검수·시스템', pageId:'page-change-log', status:'active', owner:'test'},
  {key:'system-guide', label:'시스템 안내', group:'검수·시스템', pageId:'page-system-guide', status:'active', owner:'test'},
  {key:'notification', label:'알림 센터', group:'검수·시스템', pageId:'page-notification', status:'planned', owner:'common'},
  // 관리 설정 (08A 신규)
  {key:'menu-admin', label:'메뉴 관리', group:'관리 설정', pageId:'page-menu-admin', status:'active', owner:'admin'},
  {key:'master-data-admin', label:'기준 데이터', group:'관리 설정', pageId:'page-master-data-admin', status:'planned', owner:'admin'},
  {key:'export-center', label:'내보내기 센터', group:'관리 설정', pageId:'page-export-center', status:'planned', owner:'common'}
];
function odiGetMenuInventory(filter){ return filter ? ODI_MENU_INVENTORY.filter(function(m){ return m.owner===filter||m.group===filter||m.status===filter; }) : ODI_MENU_INVENTORY; }


// ── 08B: Raw 검수 초기화 ──────────────────────────────────────────────────
function _qRawResetFilter() {
  _qRawFilter = {};
  _qRawPage = 1;
  if(typeof _qMainSelRowId !== 'undefined') _qMainSelRowId = null;
  // 하위 stale
  if(typeof qInvalidateQualityDownstreamStates === 'function')
    qInvalidateQualityDownstreamStates('raw-reset');
  // Raw 탭 재렌더
  if(typeof renderQRawTab === 'function') renderQRawTab();
  if(typeof qRefreshQualityFlowTracePanel === 'function') qRefreshQualityFlowTracePanel('raw-reset');
}

