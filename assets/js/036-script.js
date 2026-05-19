/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 36 id=(none) :: OPT01 no semantic edits */

// ── 08C-1: 요약노트 갱신 함수 (WORK_DATA/YANGSAN_DATA/YEONJU_DATA 기반) ──
function renderDashboardSummaryNotes() {
  try { updateDashboardSummaryNotesFromSchedule(); } catch(e) {}
  try { updateDashboardSummaryNotesFromQuality(); } catch(e) {}
}
function updateDashboardSummaryNotesFromSchedule() {
  var allRows = [];
  if(typeof WORK_DATA !== 'undefined' && Array.isArray(WORK_DATA)) allRows = WORK_DATA;
  else if(typeof YANGSAN_DATA !== 'undefined' && typeof YEONJU_DATA !== 'undefined')
    allRows = (YANGSAN_DATA||[]).concat(YEONJU_DATA||[]);

  var prodCount = 0, shipCount = 0, doneCount = 0, delayCount = 0;
  allRows.forEach(function(row) {
    try {
      var info = typeof getRowStageInfo === 'function' ? getRowStageInfo(row) : null;
      var status = info ? info.status : (row.status || '');
      if(/진행|계획|대기/.test(status)) prodCount++;
      if(/출고/.test(status)) shipCount++;
      if(/완료/.test(status)) doneCount++;
      if(typeof hasScheduleDelay === 'function' && hasScheduleDelay(row)) delayCount++;
    } catch(e) {}
  });

  var el; 
  el = document.getElementById('sn-prod-count'); if(el) el.textContent = prodCount;
  el = document.getElementById('sn-ship-count'); if(el) el.textContent = shipCount;
  el = document.getElementById('sn-done-count'); if(el) el.textContent = doneCount;
  el = document.getElementById('sn-delay-count'); if(el) el.textContent = delayCount;

  if(!allRows.length) {
    ['sn-prod-count','sn-ship-count','sn-done-count','sn-delay-count'].forEach(function(id) {
      var e2 = document.getElementById(id); if(e2) e2.textContent = '미업로드';
    });
  }
}
function updateDashboardSummaryNotesFromQuality() {
  var rawRows = (typeof QDEFECT_RAW_ROWS !== 'undefined') ? QDEFECT_RAW_ROWS : [];
  var issues  = (typeof QISSUE_ROWS !== 'undefined') ? QISSUE_ROWS :
                (typeof QDEFECT_ISSUES !== 'undefined') ? QDEFECT_ISSUES : rawRows;
  var imgs    = (typeof QDEFECT_IMAGES !== 'undefined') ? QDEFECT_IMAGES : [];
  var unmatched = (typeof QDEFECT_UNMATCHED_IMAGES !== 'undefined') ? QDEFECT_UNMATCHED_IMAGES : [];
  var hasData = typeof QDEFECT_WORKBOOK_READY !== 'undefined' && QDEFECT_WORKBOOK_READY;

  var el;
  el = document.getElementById('sn-raw-count');   if(el) el.textContent = hasData ? rawRows.length : '-';
  el = document.getElementById('sn-raw-label');   if(el) el.textContent = hasData ? 'Raw 건' : '품질 미업로드';
  el = document.getElementById('sn-issue-count'); if(el) el.textContent = hasData ? rawRows.filter(function(r){return r.severity==='치명'||r.severity==='주요';}).length : '-';
  el = document.getElementById('sn-img-count');   if(el) el.textContent = hasData ? imgs.length : '-';
  el = document.getElementById('sn-img-label');   if(el) el.textContent = hasData ? '미매칭: '+unmatched.length+'건' : '이미지 미업로드';
}
