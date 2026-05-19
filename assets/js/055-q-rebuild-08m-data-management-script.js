/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 55 id=q-rebuild-08m-data-management-script :: OPT01 no semantic edits */

(function(){
'use strict';
/* ============================================================================
 * Q_REBUILD_08M_DATA_MANAGEMENT_STATUS_AND_PAGE_PATCH
 * ----------------------------------------------------------------------------
 * 작업 범위 (사용자 명령문 §1~§7):
 *   §1. ODI_MENU_STATUS_MAP 누락 4건 등록 (upload-history PARTIAL,
 *       data-validation PARTIAL, file-mapping PARTIAL, user-guide LIVE)
 *   §2. page-file-mapping 보강
 *   §3. page-upload-history 보강
 *   §4. page-data-validation 보강
 *   §5. page-user-guide 정리 (LIVE)
 *   §6. page-download 보강
 *   §7. page-data-equip 보강
 *
 * 절대 금지 (§8, §10):
 *   - page-schedule(-log/-model/-period) 구조 변경 X
 *   - page-quality-dash / page-quality-main / page-quality-analysis 변경 X
 *   - page-quality-analysis 10탭 재구축 X
 *   - 본 단계에서 제외 (§9): dashboard / equip-status / team-overview /
 *     prod-overview / prod-headcount / prod-process /
 *     quality-action / quality-images / quality-master
 *   - 외부 CDN / Chart.js / Google Fonts / ALL_DATA 내장 X
 *   - 원본 row mutation X
 *   - 자동 합격/불합격 / 위험도 점수 / 장비 master 임의 확정 X
 * ========================================================================== */
var VERSION = 'Q_REBUILD_08M_DATA_MANAGEMENT_STATUS_AND_PAGE_PATCH_REVIEWED_FIXED';
try { window.APP_VERSION = VERSION; } catch(_e){}
try { document.title = 'ODI 생산관리 — 사용자 포털 ' + VERSION; } catch(_e){}
try {
  window.CHANGELOG = window.CHANGELOG || [];
  window.CHANGELOG.push({
    version: VERSION,
    note: '08M: ODI_MENU_STATUS_MAP 누락 4건 추가 (upload-history PARTIAL / data-validation PARTIAL / file-mapping PARTIAL / user-guide LIVE). 데이터관리 6개 페이지 (data-equip / upload-history / data-validation / file-mapping / user-guide / download) read-only render 함수 추가. 외부 CDN 0. 생산일정 / 품질대시보드 / 불량관리센터 / 품질분석센터 10탭 무변경. 본 단계는 dashboard / equip-status / team-overview / prod-* / quality-action / quality-images / quality-master 제외.'
  });
} catch(_e){}

/* ─────────── helpers ─────────── */
function m08Esc(s){
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function m08Text(id, v){
  var el = document.getElementById(id);
  if(el) el.textContent = (v == null ? '\u2014' : String(v));
}
function m08Html(id, h){
  var el = document.getElementById(id);
  if(el) el.innerHTML = h;
}
function m08Get(r, key){
  if(!r || !key) return '';
  var v = r[key];
  return v == null ? '' : String(v).trim();
}
function m08GetWork(){
  try {
    if(typeof window.WORK_DATA !== 'undefined' && Array.isArray(window.WORK_DATA)) return window.WORK_DATA;
  } catch(_e){}
  return [];
}
function m08GetQRaw(){
  try {
    if(Array.isArray(window.QISSUE_NORMALIZED_ROWS) && window.QISSUE_NORMALIZED_ROWS.length) return window.QISSUE_NORMALIZED_ROWS;
    if(Array.isArray(window.QISSUE_ROWS) && window.QISSUE_ROWS.length) return window.QISSUE_ROWS;
    if(Array.isArray(window.QRAW_ROWS) && window.QRAW_ROWS.length) return window.QRAW_ROWS;
    if(Array.isArray(window.QDEFECT_RAW_ROWS) && window.QDEFECT_RAW_ROWS.length) return window.QDEFECT_RAW_ROWS;
  } catch(_e){}
  return [];
}
function m08GetQIssue(){
  try {
    if(Array.isArray(window.QISSUE_ROWS) && window.QISSUE_ROWS.length) return window.QISSUE_ROWS;
    if(Array.isArray(window.QDEFECT_ISSUES) && window.QDEFECT_ISSUES.length) return window.QDEFECT_ISSUES;
  } catch(_e){}
  return [];
}
function m08GetQSummary(){
  try {
    if(window.QSUMMARY_DATA && typeof window.QSUMMARY_DATA === 'object') return window.QSUMMARY_DATA;
    if(window.QDASH_READY_DATA && typeof window.QDASH_READY_DATA === 'object') return window.QDASH_READY_DATA;
  } catch(_e){}
  return null;
}
function m08Uniq(rows, key){
  var s = {};
  rows.forEach(function(r){ var v = m08Get(r,key); if(v) s[v] = true; });
  return Object.keys(s);
}
function m08DetectKey(rows, candidates){
  if(!rows || !rows.length) return null;
  var keys = Object.keys(rows[0] || {});
  for(var i=0;i<candidates.length;i++){
    var cand = candidates[i].toLowerCase();
    for(var j=0;j<keys.length;j++){
      if(keys[j].toLowerCase().indexOf(cand) >= 0) return keys[j];
    }
  }
  return null;
}

/* ─────────── §1. ODI_MENU_STATUS_MAP augmentation ─────────── */
window.m08AugmentMenuStatusMap = function(){
  try {
    if(!Array.isArray(window.ODI_MENU_STATUS_MAP)) return { error:'ODI_MENU_STATUS_MAP not present' };
    var map = window.ODI_MENU_STATUS_MAP;
    var existing = {};
    map.forEach(function(m){ existing[m.routeKey] = true; });
    var adds = [
      {
        menuId:'upload-history', label:'업로드 이력', area:'user', group:'데이터 관리',
        routeKey:'upload-history', pageId:'page-upload-history',
        status:'PARTIAL',
        permission:['ADMIN','MANAGER','PRODUCTION_MANAGER','QUALITY_MANAGER','OPERATOR'],
        visible:true, badge:'부분',
        notes:'08M: 현재 세션 업로드 이벤트 timeline (새로고침 시 초기화).'
      },
      {
        menuId:'data-validation', label:'데이터 검증', area:'user', group:'데이터 관리',
        routeKey:'data-validation', pageId:'page-data-validation',
        status:'PARTIAL',
        permission:['ADMIN','MANAGER','PRODUCTION_MANAGER','QUALITY_MANAGER'],
        visible:true, badge:'부분',
        notes:'08M: 필수값/날짜/장비/중복/코드 매핑 검증 요약. 자동 합격/불합격 X.'
      },
      {
        menuId:'file-mapping', label:'파일 매핑', area:'user', group:'데이터 관리',
        routeKey:'file-mapping', pageId:'page-file-mapping',
        status:'PARTIAL',
        permission:['ADMIN','MANAGER','PRODUCTION_MANAGER','QUALITY_MANAGER'],
        visible:true, badge:'부분',
        notes:'08M: 시트/컬럼 → 표준 필드 매핑 현황 표시. 자동매핑 확정 X, 저장 X.'
      },
      {
        menuId:'user-guide', label:'사용 가이드', area:'user', group:'데이터 관리',
        routeKey:'user-guide', pageId:'page-user-guide',
        status:'LIVE',
        permission:['ADMIN','MANAGER','PRODUCTION_MANAGER','QUALITY_MANAGER','OPERATOR','VIEWER'],
        visible:true, badge:null,
        notes:'08M: 운영자용 가이드 (워크플로우 + 주의사항 + 용어 설명).'
      }
    ];
    var added = 0;
    adds.forEach(function(a){ if(!existing[a.routeKey]){ map.push(a); added++; } });
    return { added: added, totalAfter: map.length };
  } catch(e){ return { error: e.message || String(e) }; }
};

/* ─────────── §1b. shared standard-field map (for file-mapping + data-equip + validation) ─────────── */
var M08_STD_FIELDS = [
  { std:'일자/날짜',   keys:['date','일자','planDate','예정일','productionStart','startDate'],   required:true,  group:'생산일정' },
  { std:'호기/장비',   keys:['machine','machineNo','호기','장비','equip'],                       required:true,  group:'생산일정' },
  { std:'모델',        keys:['model','MODEL','모델','modelType','종류'],                          required:true,  group:'생산일정' },
  { std:'공정/단계',   keys:['process','공정','status','상태','stage','단계'],                    required:false, group:'생산일정' },
  { std:'출고 예정',   keys:['ship','출고','shipDate'],                                          required:false, group:'생산일정' },
  { std:'해체',        keys:['disassembly','해체'],                                              required:false, group:'생산일정' },
  { std:'담당/팀',     keys:['manager','담당','team','팀'],                                       required:false, group:'생산일정' },
  { std:'심각도',      keys:['severity','중요도','심각도'],                                       required:false, group:'품질' },
  { std:'분류코드',    keys:['majorCategory','middleCategory','smallCategory','분류코드'],         required:false, group:'품질' },
  { std:'작성자',      keys:['writer','작성자'],                                                  required:false, group:'품질' },
  { std:'이미지',      keys:['imageCount','사진','photo','image'],                                required:false, group:'품질' }
];
function m08FindKey(rows, candidates){ return m08DetectKey(rows, candidates); }

/* ─────────── §2. renderM08FileMapping ─────────── */
window.renderM08FileMapping = function(){
  try {
    var page = document.getElementById('page-file-mapping');
    if(!page) return false;
    var work = m08GetWork();
    var qRaw = m08GetQRaw();

    var sheets = [];
    if(work.length) sheets.push({ name:'생산일정', rows: work });
    if(qRaw.length) sheets.push({ name:'품질 Raw',  rows: qRaw });

    var allColumns = [];
    sheets.forEach(function(s){
      if(s.rows.length){
        var keys = Object.keys(s.rows[0] || {}).filter(function(k){ return typeof s.rows[0][k] !== 'object'; });
        keys.forEach(function(k){ allColumns.push({ sheet: s.name, column: k }); });
      }
    });

    /* compute mapped vs unmapped */
    var mappingResults = [];   /* {sheet, column, std, status} */
    var stdMapped = {};        /* std -> {sheet,column} */

    /* For each sheet, find columns mapping to standard fields */
    sheets.forEach(function(sh){
      if(!sh.rows.length) return;
      var groupFilter = sh.name === '생산일정' ? '생산일정' : '품질';
      M08_STD_FIELDS.filter(function(sf){ return sf.group === groupFilter; }).forEach(function(sf){
        var found = m08FindKey(sh.rows, sf.keys);
        if(found && !stdMapped[sh.name + '|' + sf.std]){
          stdMapped[sh.name + '|' + sf.std] = { sheet: sh.name, column: found, std: sf.std, required: sf.required };
        }
      });
    });
    var mappedColumnKey = {};
    Object.keys(stdMapped).forEach(function(k){
      var v = stdMapped[k];
      mappedColumnKey[v.sheet + '|' + v.column] = v.std;
    });

    /* Build full table rows */
    allColumns.forEach(function(c){
      var std = mappedColumnKey[c.sheet + '|' + c.column];
      var status = std ? 'mapped' : 'review';
      mappingResults.push({ sheet:c.sheet, column:c.column, std: std || '', status: status });
    });
    /* Add unmapped standard fields (required ones not found in any sheet) */
    M08_STD_FIELDS.forEach(function(sf){
      if(!sf.required) return;
      var groupSheet = sf.group === '생산일정' ? '생산일정' : '품질 Raw';
      var key = groupSheet + '|' + sf.std;
      if(!stdMapped[key]){
        var sheetExists = sheets.some(function(s){ return s.name === groupSheet; });
        if(sheetExists){
          mappingResults.push({ sheet: groupSheet, column:'(미감지)', std: sf.std, status:'missing' });
        }
      }
    });

    var totalCols = allColumns.length;
    var totalMapped = mappingResults.filter(function(r){ return r.status === 'mapped'; }).length;
    var totalUnmapped = totalCols - totalMapped;

    m08Text('fm2-upload-val', sheets.length > 0 ? sheets.length + '개' : '미감지');
    m08Text('fm2-sheet-val',  sheets.length);
    m08Text('fm2-field-val',  totalCols);
    m08Text('fm2-b-trust',    sheets.length > 0 ? (totalCols ? Math.round(totalMapped / Math.max(1, totalMapped + mappingResults.filter(function(r){ return r.status==='missing'; }).length) * 100) + '%' : '0%') : '\u2014');

    /* per-standard cards (fm2-u-* IMPORTANT: do not destroy parent #fm2-unmap-panel) */
    var dateKey  = m08FindKey(work, ['date','일자','planDate','예정일']);
    var equipKey = m08FindKey(work, ['machine','호기','equip']);
    var modelKey = m08FindKey(work, ['model','모델']);
    var procKey  = m08FindKey(work, ['process','공정','stage','단계']);
    m08Text('fm2-u-date',  dateKey  || '미감지');
    m08Text('fm2-u-equip', equipKey || '미감지');
    m08Text('fm2-u-model', modelKey || '미감지');
    m08Text('fm2-u-proc',  procKey  || '미감지');

    /* status block tone */
    function setTone(id, ok){
      var b = document.getElementById(id);
      if(!b) return;
      b.style.borderColor = ok ? 'rgba(34,197,94,0.30)' : 'var(--bd, rgba(168,162,158,0.30))';
    }
    setTone('fm2-b-upload', sheets.length > 0);
    setTone('fm2-b-sheet',  sheets.length > 0);
    setTone('fm2-b-field',  totalCols > 0);

    /* full field table (fm2-field-tbody) — spec §2 columns */
    var ftbody = document.getElementById('fm2-field-tbody');
    if(ftbody){
      if(!mappingResults.length){
        ftbody.innerHTML = '<tr><td colspan="4" style="padding:0">'
                         +   '<div class="m08-empty">'
                         +     '<div class="ico">📭</div>'
                         +     '<div class="ttl">업로드 데이터 없음</div>'
                         +     '<div>파일 매핑은 업로드 직후부터 표시됩니다.</div>'
                         +     '<div class="act">'
                         +       '<button onclick="nav(\'schedule\')">생산일정 →</button>'
                         +       '<button onclick="nav(\'quality-main\')">불량 관리 →</button>'
                         +     '</div>'
                         +   '</div>'
                         + '</td></tr>';
      } else {
        ftbody.innerHTML = mappingResults.slice(0, 80).map(function(r){
          var badge, label;
          if(r.status === 'mapped')  { badge = 'ok';     label = '매핑됨'; }
          else if(r.status === 'review')  { badge = 'review'; label = '검토 필요'; }
          else if(r.status === 'missing') { badge = 'miss';   label = '매핑 필요'; }
          else                            { badge = 'warn';   label = '미감지'; }
          var std = r.std ? '<span style="color:#67e8f9">' + m08Esc(r.std) + '</span>' : '<span style="color:var(--tm,#8da0c1)">—</span>';
          return '<tr>'
               +   '<td class="dim">' + m08Esc(r.sheet) + '</td>'
               +   '<td class="mono">' + m08Esc(r.column) + '</td>'
               +   '<td>' + std + '</td>'
               +   '<td><span class="m08-badge ' + badge + '">' + label + '</span></td>'
               + '</tr>';
        }).join('') + (mappingResults.length > 80 ? '<tr><td colspan="4" class="dim" style="text-align:right;font-size:9px">상위 80개 표시 / 전체 ' + mappingResults.length + '개</td></tr>' : '');
      }
    }

    /* sibling status note below #fm2-unmap-panel (NOT overwriting parent) */
    var unmap = document.getElementById('fm2-unmap-panel');
    if(unmap){
      var prev = document.getElementById('m08-fm-note');
      if(prev && prev.parentNode) prev.parentNode.removeChild(prev);
      var noteHtml;
      if(!sheets.length){
        noteHtml = '<div id="m08-fm-note" style="margin-top:8px;padding:10px 12px;background:rgba(168,162,158,0.05);border:1px dashed var(--bd,rgba(168,162,158,0.30));border-radius:6px;font-size:10px;color:var(--tm,#8da0c1);text-align:center">업로드 후 매핑 분석이 표시됩니다.</div>';
      } else {
        var missingStd = mappingResults.filter(function(r){ return r.status === 'missing'; });
        if(!missingStd.length){
          noteHtml = '<div id="m08-fm-note" style="margin-top:8px;padding:10px 12px;background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.20);border-radius:6px;font-size:11px;color:#86efac">필수 필드 모두 매핑됨 — 추가 매핑 작업 없음</div>';
        } else {
          noteHtml = '<div id="m08-fm-note" style="margin-top:8px;padding:10px 12px;background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.22);border-radius:6px">'
                   + '<div style="font-size:10px;font-weight:700;color:#fcd34d;margin-bottom:6px">매핑 필요 필드 ' + missingStd.length + '건</div>'
                   + missingStd.map(function(m){ return '<div style="font-size:10px;color:var(--tm,#8da0c1);padding:2px 0">• ' + m08Esc(m.sheet) + ' / ' + m08Esc(m.std) + '</div>'; }).join('')
                   + '<div style="margin-top:8px;padding-top:6px;border-top:1px dashed rgba(168,162,158,0.20);font-size:9.5px;color:var(--tm,#8da0c1)">업로드 데이터의 컬럼명을 확인해 주세요. 자동매핑 확정은 수행하지 않습니다.</div>'
                   + '</div>';
        }
      }
      unmap.insertAdjacentHTML('afterend', noteHtml);
    }

    return true;
  } catch(e){
    try { console.warn('[' + VERSION + '] renderM08FileMapping failed:', e); } catch(_e){}
    return false;
  }
};

/* ─────────── §3. renderM08UploadHistory ─────────── */
if(!window.__m08UploadEvents) try { window.__m08UploadEvents = []; } catch(_e){}
window.m08RecordUploadEvent = function(kind, fileName, status, msg){
  try {
    window.__m08UploadEvents = window.__m08UploadEvents || [];
    window.__m08UploadEvents.push({
      ts: Date.now(), kind: kind, fileName: fileName || '(파일명 없음)',
      status: status || 'ok', msg: msg || ''
    });
    if(window.__m08UploadEvents.length > 50) window.__m08UploadEvents.shift();
  } catch(_e){}
};
window.renderM08UploadHistory = function(){
  try {
    var page = document.getElementById('page-upload-history');
    if(!page) return false;
    var work = m08GetWork();
    var qRaw = m08GetQRaw();
    var qIssue = m08GetQIssue();
    var qSummary = m08GetQSummary();
    var imgCnt = 0;
    qRaw.forEach(function(r){ var ic = m08Get(r,'imageCount') || m08Get(r,'사진'); if(ic && ic !== '0') imgCnt++; });

    m08Text('uh2-sched-rows', work.length);
    m08Text('uh2-qual-rows',  qRaw.length);
    m08Text('uh2-img-cnt',    imgCnt);

    /* derive synthetic upload events from current state if no real events recorded */
    var events = (window.__m08UploadEvents || []).slice();
    if(!events.length){
      if(work.length)  events.push({ ts: Date.now(), kind:'생산일정', fileName:'(세션 감지)', status:'ok',   msg: work.length + ' row Raw 감지' });
      if(qRaw.length)  events.push({ ts: Date.now(), kind:'품질 Raw', fileName:'(세션 감지)', status:'ok',   msg: qRaw.length + ' row Raw 감지' });
      if(qIssue.length) events.push({ ts: Date.now(), kind:'품질 Issue', fileName:'(세션 감지)', status:'ok', msg: qIssue.length + ' row Issue 시트 감지' });
      if(qSummary)     events.push({ ts: Date.now(), kind:'품질 Summary', fileName:'(세션 감지)', status:'ok', msg:'Summary/Dashboard Ready 준비' });
    }

    /* compute counts */
    var processed = events.filter(function(e){ return e.status === 'ok'; }).length;
    var review    = events.filter(function(e){ return e.status === 'review' || e.status === 'warn'; }).length;
    var errors    = events.filter(function(e){ return e.status === 'err' || e.status === 'error'; }).length;
    m08Text('uh2-link-sched', work.length > 0 ? '✓' : '\u2014');
    m08Text('uh2-link-qual',  qRaw.length > 0 ? '✓' : '\u2014');
    m08Text('uh2-link-valid', work.length > 0 ? '검증 가능' : '\u2014');
    m08Text('uh2-link-equip', work.length > 0 ? '✓' : '\u2014');

    /* sibling summary block (idempotent) */
    var prevSummary = document.getElementById('m08-uh-summary');
    if(prevSummary && prevSummary.parentNode) prevSummary.parentNode.removeChild(prevSummary);

    /* insert §3 summary cards above timeline */
    var timeline = document.getElementById('uh2-timeline');
    if(timeline){
      var sumBlock = document.createElement('div');
      sumBlock.id = 'm08-uh-summary';
      sumBlock.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;margin-bottom:10px';
      sumBlock.innerHTML =
          '<div style="padding:9px 11px;background:rgba(255,255,255,0.025);border:1px solid var(--bd,rgba(168,162,158,0.30));border-radius:6px"><div style="font-size:9px;color:var(--tm,#8da0c1)">총 업로드</div><div style="font-size:17px;font-weight:800;color:var(--ts,#cfd6e4);font-family:monospace">' + events.length + '</div></div>'
        + '<div style="padding:9px 11px;background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.20);border-radius:6px"><div style="font-size:9px;color:var(--tm,#8da0c1)">처리 완료</div><div style="font-size:17px;font-weight:800;color:#86efac;font-family:monospace">' + processed + '</div></div>'
        + '<div style="padding:9px 11px;background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.22);border-radius:6px"><div style="font-size:9px;color:var(--tm,#8da0c1)">검토 필요</div><div style="font-size:17px;font-weight:800;color:#fcd34d;font-family:monospace">' + review + '</div></div>'
        + '<div style="padding:9px 11px;background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.22);border-radius:6px"><div style="font-size:9px;color:var(--tm,#8da0c1)">오류/경고</div><div style="font-size:17px;font-weight:800;color:#fca5a5;font-family:monospace">' + errors + '</div></div>';
      timeline.parentNode.insertBefore(sumBlock, timeline);

      /* timeline as table (§3 columns) */
      if(!events.length){
        timeline.innerHTML = '<div class="m08-empty">'
                           +   '<div class="ico">📭</div>'
                           +   '<div class="ttl">현재 세션에 업로드 이벤트가 없습니다</div>'
                           +   '<div>새로고침 시 모든 세션 데이터가 초기화됩니다. 서버 감사 로그가 아닙니다.</div>'
                           +   '<div class="act">'
                           +     '<button onclick="nav(\'schedule\')">생산일정 →</button>'
                           +     '<button onclick="nav(\'quality-main\')">불량 관리 →</button>'
                           +   '</div>'
                           + '</div>';
      } else {
        var sorted = events.slice().sort(function(a,b){ return b.ts - a.ts; });
        var hasLinks = {
          schedule: work.length > 0,
          qraw: qRaw.length > 0,
          qissue: qIssue.length > 0,
          qdash: !!qSummary
        };
        var tableHtml = '<div class="m08-tbl-wrap"><table class="m08-tbl">'
                      +   '<thead><tr>'
                      +     '<th>파일명</th><th>업로드 시각</th><th>데이터 종류</th><th>처리 상태</th>'
                      +     '<th>Raw 연결</th><th>Issue 연결</th><th>Dashboard 연결</th>'
                      +   '</tr></thead>'
                      +   '<tbody>';
        sorted.forEach(function(e){
          var ts = new Date(e.ts);
          var tsStr = ts.getFullYear() + '-' + String(ts.getMonth()+1).padStart(2,'0') + '-' + String(ts.getDate()).padStart(2,'0')
                    + ' ' + String(ts.getHours()).padStart(2,'0') + ':' + String(ts.getMinutes()).padStart(2,'0');
          var statusBadge = e.status === 'ok'    ? '<span class="m08-badge ok">완료</span>'
                          : e.status === 'review'? '<span class="m08-badge review">검토</span>'
                          : e.status === 'warn'  ? '<span class="m08-badge warn">경고</span>'
                          :                        '<span class="m08-badge err">오류</span>';
          var rawLink   = (/Raw|Issue|품질|quality/i.test(e.kind) && hasLinks.qraw) ? '<span class="m08-badge ok">연결됨</span>' : '<span class="m08-badge miss">—</span>';
          var issueLink = (/Issue|품질|quality/i.test(e.kind) && hasLinks.qissue) ? '<span class="m08-badge ok">연결됨</span>' : '<span class="m08-badge miss">—</span>';
          var dashLink  = (/품질|quality/.test(e.kind) && hasLinks.qdash)       ? '<span class="m08-badge ok">Ready</span>' : '<span class="m08-badge miss">—</span>';
          if(/생산일정|schedule/.test(e.kind)){
            rawLink   = hasLinks.schedule ? '<span class="m08-badge ok">' + work.length + ' row</span>' : '<span class="m08-badge miss">—</span>';
            issueLink = '<span class="m08-badge miss">—</span>';
            dashLink  = '<span class="m08-badge miss">—</span>';
          }
          tableHtml +=
              '<tr>'
            +   '<td class="mono">' + m08Esc(e.fileName) + '</td>'
            +   '<td class="dim">' + tsStr + '</td>'
            +   '<td>' + m08Esc(e.kind) + '</td>'
            +   '<td>' + statusBadge + '</td>'
            +   '<td>' + rawLink + '</td>'
            +   '<td>' + issueLink + '</td>'
            +   '<td>' + dashLink + '</td>'
            + '</tr>';
        });
        tableHtml += '</tbody></table></div>';
        timeline.innerHTML = tableHtml;
      }
    }
    return true;
  } catch(e){
    try { console.warn('[' + VERSION + '] renderM08UploadHistory failed:', e); } catch(_e){}
    return false;
  }
};

/* ─────────── §4. renderM08DataValidation ─────────── */
window.renderM08DataValidation = function(){
  try {
    var page = document.getElementById('page-data-validation');
    if(!page) return false;
    var rows = m08GetWork();

    /* compute summary */
    var total = rows.length;
    var noDate = 0, noEquip = 0, noModel = 0, noStage = 0, sunday = 0, noCode = 0;
    var seen = {}, dupCount = 0;
    var issues = [];   /* per-row violations (limited) */
    rows.forEach(function(r, idx){
      var rowNum = idx + 1;
      var dt = m08Get(r,'date') || m08Get(r,'planDate') || m08Get(r,'일자');
      var eq = m08Get(r,'machine') || m08Get(r,'호기');
      var md = m08Get(r,'model') || m08Get(r,'모델');
      var stageStatus = '';
      try {
        var info = (typeof getRowStageInfo === 'function') ? getRowStageInfo(r) : null;
        stageStatus = info ? (info.status || '') : '';
      } catch(_e){}
      if(!dt){ noDate++; issues.push({ row:rowNum, kind:'필수값 누락', field:'일자', value:'(미기재)', status:'missing', action:'원본 행의 일자 컬럼 확인' }); }
      else {
        try { var d = new Date(dt); if(!isNaN(d) && d.getDay() === 0){ sunday++; issues.push({ row:rowNum, kind:'날짜 이상', field:'일자', value:dt, status:'review', action:'일요일 일정 — 원본 확인 필요' }); } } catch(_e){}
      }
      if(!eq){ noEquip++; issues.push({ row:rowNum, kind:'필수값 누락', field:'호기/장비', value:'(미기재)', status:'missing', action:'원본 행의 호기 컬럼 확인' }); }
      if(!md){ noModel++; issues.push({ row:rowNum, kind:'필수값 누락', field:'모델', value:'(미기재)', status:'missing', action:'원본 행의 모델 컬럼 확인' }); }
      if(!stageStatus || stageStatus === '미확인'){ noStage++; if(issues.length < 200) issues.push({ row:rowNum, kind:'코드 매핑 필요', field:'공정 단계', value:'(미확인)', status:'review', action:'단계 컬럼 정규화 필요' }); }
      var dupKey = (eq||'') + '|' + (md||'') + '|' + (dt||'');
      if(dupKey !== '||'){
        if(seen[dupKey]){ dupCount++; issues.push({ row:rowNum, kind:'중복 후보', field:'호기+모델+일자', value:dupKey, status:'review', action:'동일 호기·모델·일자 다중 row — 검토 필요' }); }
        else seen[dupKey] = true;
      }
    });

    m08Text('dv2-total',    total);
    m08Text('dv2-error',    noDate + noEquip + noModel);
    m08Text('dv2-warn',     sunday + dupCount);
    m08Text('dv2-c-date',   noDate);
    m08Text('dv2-c-equip',  noEquip);
    m08Text('dv2-c-model',  noModel);
    m08Text('dv2-c-stage',  noStage);
    m08Text('dv2-c-sun',    sunday);
    m08Text('dv2-c-dup',    dupCount);
    m08Text('dv2-nodate',   noDate);
    m08Text('dv2-nostage',  noStage);
    m08Text('dv2-sunday',   sunday);

    /* spec §4 summary cards — sibling block (idempotent) */
    var section = document.getElementById('dv2-tbody');
    if(section){
      var prev = document.getElementById('m08-dv-summary');
      if(prev && prev.parentNode) prev.parentNode.removeChild(prev);
      var wrapTable = section.closest('table') ? section.closest('.di-tbl-wrap') || section.closest('div') : null;
      var cardsBlock = document.createElement('div');
      cardsBlock.id = 'm08-dv-summary';
      cardsBlock.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:6px;margin:8px 0';
      cardsBlock.innerHTML =
          '<div style="padding:8px 10px;background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.22);border-radius:5px"><div style="font-size:9px;color:var(--tm,#8da0c1)">필수값 누락</div><div style="font-size:15px;font-weight:800;color:#fca5a5;font-family:monospace">' + (noDate + noEquip + noModel) + '</div></div>'
        + '<div style="padding:8px 10px;background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.22);border-radius:5px"><div style="font-size:9px;color:var(--tm,#8da0c1)">날짜 이상</div><div style="font-size:15px;font-weight:800;color:#fcd34d;font-family:monospace">' + sunday + '</div></div>'
        + '<div style="padding:8px 10px;background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.22);border-radius:5px"><div style="font-size:9px;color:var(--tm,#8da0c1)">장비/호기 미기재</div><div style="font-size:15px;font-weight:800;color:#fca5a5;font-family:monospace">' + noEquip + '</div></div>'
        + '<div style="padding:8px 10px;background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.22);border-radius:5px"><div style="font-size:9px;color:var(--tm,#8da0c1)">중복 후보</div><div style="font-size:15px;font-weight:800;color:#fcd34d;font-family:monospace">' + dupCount + '</div></div>'
        + '<div style="padding:8px 10px;background:rgba(34,211,238,0.05);border:1px solid rgba(34,211,238,0.22);border-radius:5px"><div style="font-size:9px;color:var(--tm,#8da0c1)">코드 매핑 필요</div><div style="font-size:15px;font-weight:800;color:#67e8f9;font-family:monospace">' + noStage + '</div></div>';
      if(wrapTable && wrapTable.parentNode) wrapTable.parentNode.insertBefore(cardsBlock, wrapTable);

      /* spec §4 detailed table — populate existing dv2-tbody */
      if(!total){
        section.innerHTML = '<tr><td colspan="4" style="padding:0">'
                          +   '<div class="m08-empty">'
                          +     '<div class="ico">📭</div>'
                          +     '<div class="ttl">생산일정 데이터 없음</div>'
                          +     '<div>업로드 후 검증 결과가 표시됩니다.</div>'
                          +     '<div class="act"><button onclick="nav(\'schedule\')">생산일정 →</button></div>'
                          +   '</div></td></tr>';
      } else if(!issues.length){
        section.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:16px;color:#86efac;font-size:11px">'
                          +   '<strong style="color:#86efac">검증 통과</strong> — 필수값/날짜/장비/모델/공정/중복 검사 모두 정상'
                          + '</td></tr>';
      } else {
        var limited = issues.slice(0, 100);
        section.innerHTML = limited.map(function(it){
          var badge =
            it.status === 'missing' ? '<span class="m08-badge miss">미기재</span>' :
            it.status === 'review'  ? '<span class="m08-badge review">검토 필요</span>' :
            it.status === 'mapped'  ? '<span class="m08-badge ok">정상</span>' :
                                      '<span class="m08-badge warn">' + m08Esc(it.status) + '</span>';
          return '<tr>'
               +   '<td class="mono dim">#' + it.row + '</td>'
               +   '<td>' + m08Esc(it.kind) + ' / ' + m08Esc(it.field) + '</td>'
               +   '<td class="mono">' + m08Esc(it.value) + '</td>'
               +   '<td>' + badge + ' <span class="dim" style="font-size:9.5px;display:block;margin-top:2px">' + m08Esc(it.action) + '</span></td>'
               + '</tr>';
        }).join('') + (issues.length > 100 ? '<tr><td colspan="4" class="dim" style="text-align:right;font-size:9px">상위 100건 표시 / 전체 ' + issues.length + '건</td></tr>' : '');
      }
    }
    return true;
  } catch(e){
    try { console.warn('[' + VERSION + '] renderM08DataValidation failed:', e); } catch(_e){}
    return false;
  }
};

/* ─────────── §5. renderM08UserGuide (LIVE) ─────────── */
window.renderM08UserGuide = function(){
  try {
    var page = document.getElementById('page-user-guide');
    if(!page) return false;
    /* keep existing content. append operator workflow + glossary if not present. */
    var sectionId = 'm08-userguide-extras';
    var existing = document.getElementById(sectionId);
    if(existing) return true;   /* idempotent — append once */

    var html = '<div id="' + sectionId + '">'
             /* 1. operator workflows */
             + '<div class="m08-guide-section">'
             +   '<h4>🛠 운영자용 워크플로우 가이드</h4>'
             +   '<div class="gg">'
             +     '<div class="m08-flow-card">'
             +       '<div class="ftit">📅 생산일정 관리 사용 순서</div>'
             +       '<ol>'
             +         '<li>좌측 <code>nav(\'schedule\')</code> 진입 — 캘린더/간트/배치 view 자동 표시</li>'
             +         '<li>상단 view 선택 (캘린더 · 간트 · 배치)</li>'
             +         '<li>월/기간 필터 적용</li>'
             +         '<li>일자/호기/모델 셀 클릭 — 상세 modal</li>'
             +         '<li>이상 항목은 <code>data-validation</code> 으로 이동</li>'
             +       '</ol>'
             +     '</div>'
             +     '<div class="m08-flow-card">'
             +       '<div class="ftit">⚠ 품질 업로드 사용 순서</div>'
             +       '<ol>'
             +         '<li>좌측 <code>nav(\'quality-main\')</code> 진입 (불량 관리 센터)</li>'
             +         '<li>품질 엑셀 파일 드래그·드롭 또는 파일 선택</li>'
             +         '<li>Raw / Issue 시트 자동 파싱 — 결과 카드 확인</li>'
             +         '<li>Normalize → Summary → Dashboard Ready 단계 자동 진행</li>'
             +         '<li>이상 row 는 Raw 검수 탭에서 확인</li>'
             +       '</ol>'
             +     '</div>'
             +     '<div class="m08-flow-card">'
             +       '<div class="ftit">📈 품질 분석센터 사용 순서</div>'
             +       '<ol>'
             +         '<li>좌측 <code>nav(\'quality-analysis\')</code> 진입 (10탭 구조)</li>'
             +         '<li>상단 필터 적용 (월/심각도/장비/공정/keyword)</li>'
             +         '<li>10탭 순차 검토: 종합 → 추이 → 분류 → 장비 → 반복 → 일정연계 → 작성자 → Raw → 코드 → 우선순위</li>'
             +         '<li>탭별 KPI/표 확인 — 자동 합격/불합격 판정 없음</li>'
             +         '<li>조치 우선순위 후보는 <code>quality-action</code> 으로 이동</li>'
             +       '</ol>'
             +     '</div>'
             +     '<div class="m08-flow-card">'
             +       '<div class="ftit">💾 데이터관리 사용 순서</div>'
             +       '<ol>'
             +         '<li><code>nav(\'upload-history\')</code> — 현재 세션 업로드 이력 확인</li>'
             +         '<li><code>nav(\'file-mapping\')</code> — 컬럼 → 표준 필드 매핑 현황</li>'
             +         '<li><code>nav(\'data-validation\')</code> — 일자/장비/모델/공정 검증</li>'
             +         '<li><code>nav(\'data-equip\')</code> — 장비/모델 master 정규화 후보</li>'
             +         '<li><code>nav(\'download\')</code> — CSV/JSON 다운로드</li>'
             +       '</ol>'
             +     '</div>'
             +   '</div>'
             + '</div>'
             /* 2. cautions */
             + '<div class="m08-guide-section">'
             +   '<h4>⚠ 주의사항</h4>'
             +   '<ul class="m08-caution-list">'
             +     '<li><strong style="color:#fcd34d">새로고침 시 모든 세션 데이터가 초기화</strong>됩니다. 서버 저장 기능이 없으므로 다운로드는 즉시 받으세요.</li>'
             +     '<li>일요일 일정 <strong>자동 보정하지 않습니다</strong> — 원본 행 확인 필요.</li>'
             +     '<li>원본 업로드 데이터는 화면 표시 중 <strong>수정/삭제되지 않습니다</strong>.</li>'
             +     '<li>분류 코드 / 분류 체계 자동 확정 없음 — 정규화는 운영 검토 후 진행.</li>'
             +     '<li>품질 자동 합격/불합격 판정 없음. 위험도 점수 자동 산출 없음.</li>'
             +     '<li>이미지/증빙 파일은 단일 HTML 한계상 <strong>업로드/저장이 불가능</strong>합니다.</li>'
             +     '<li>업로드 이력은 <strong>브라우저 세션 기준</strong>이며 서버 감사 로그가 아닙니다.</li>'
             +   '</ul>'
             + '</div>'
             /* 3. glossary */
             + '<div class="m08-guide-section">'
             +   '<h4>📖 용어 설명</h4>'
             +   '<div class="m08-glossary">'
             +     '<div class="m08-gloss-item"><div class="term">Raw Data</div><div class="def">업로드 직후 1차 파싱된 원본 row. 정규화 및 집계 이전 상태.</div></div>'
             +     '<div class="m08-gloss-item"><div class="term">Issue Sheet</div><div class="def">품질 엑셀의 이슈 시트. Raw 와 별도로 관리되는 불량 발생 기록.</div></div>'
             +     '<div class="m08-gloss-item"><div class="term">Normalize</div><div class="def">호기/모델/공정 등의 표기 차이를 표준 명칭으로 정렬하는 처리.</div></div>'
             +     '<div class="m08-gloss-item"><div class="term">Summary</div><div class="def">Normalize 이후 일자/장비/공정 기준 집계 데이터.</div></div>'
             +     '<div class="m08-gloss-item"><div class="term">Dashboard Ready</div><div class="def">대시보드 화면이 렌더 가능한 상태로 모든 집계가 완료된 단계.</div></div>'
             +     '<div class="m08-gloss-item"><div class="term">단계 (Stage)</div><div class="def">생산일정의 자재입고 / 작업 / 출고 / 해체 / 미확인 5단계.</div></div>'
             +     '<div class="m08-gloss-item"><div class="term">반복 후보</div><div class="def">동일 호기·모델·일자 중복 row 또는 동일 분류 다발 후보.</div></div>'
             +     '<div class="m08-gloss-item"><div class="term">조치 우선순위</div><div class="def">치명 / 주요 / 빈도 / 반복성 기준 조치 후보. 자동 확정 없음.</div></div>'
             +     '<div class="m08-gloss-item"><div class="term">ECO / CAPA</div><div class="def">설계 변경 (ECO) / 시정 예방 조치 (CAPA). 본 포털에서는 후보 표시만.</div></div>'
             +     '<div class="m08-gloss-item"><div class="term">매핑됨 / 매핑 필요</div><div class="def">컬럼 ↔ 표준 필드 자동 감지 여부. 매핑 필요는 컬럼명 확인 후 수동 보정 대상.</div></div>'
             +     '<div class="m08-gloss-item"><div class="term">세션 기준</div><div class="def">브라우저 탭/창 단위. 새로고침 시 초기화. 서버 영속 저장 아님.</div></div>'
             +     '<div class="m08-gloss-item"><div class="term">PM map</div><div class="def">route key → page DOM id 매핑. nav() 호출 시 사용.</div></div>'
             +   '</div>'
             + '</div>'
             + '</div>';

    page.insertAdjacentHTML('beforeend', html);
    return true;
  } catch(e){
    try { console.warn('[' + VERSION + '] renderM08UserGuide failed:', e); } catch(_e){}
    return false;
  }
};

/* ─────────── §6. renderM08Download ─────────── */
/* download helpers (Blob-based, no external dependency, FEFF BOM for Excel) */
window.m08DownloadCSV = function(filename, rows){
  try {
    if(!rows || !rows.length){ alert('데이터가 없습니다.'); return; }
    var keys = Object.keys(rows[0]).filter(function(k){ return typeof rows[0][k] !== 'object'; });
    var head = keys.map(function(k){ return '"' + String(k).replace(/"/g,'""') + '"'; }).join(',');
    var body = rows.map(function(r){
      return keys.map(function(k){
        var v = r[k] == null ? '' : String(r[k]);
        return '"' + v.replace(/"/g,'""') + '"';
      }).join(',');
    }).join('\n');
    var csv = '\ufeff' + head + '\n' + body;
    var blob = new Blob([csv], { type:'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  } catch(e){ alert('다운로드 실패: ' + (e.message || e)); }
};
window.m08DownloadJSON = function(filename, data){
  try {
    var json = JSON.stringify(data, null, 2);
    var blob = new Blob([json], { type:'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  } catch(e){ alert('다운로드 실패: ' + (e.message || e)); }
};
window.renderM08Download = function(){
  try {
    var page = document.getElementById('page-download');
    if(!page) return false;
    var work = m08GetWork();
    var qRaw = m08GetQRaw();
    var qIssue = m08GetQIssue();
    var qSummary = m08GetQSummary();

    var sched   = work.length;
    var qrawN   = qRaw.length;
    var qissueN = qIssue.length;
    var qsumOk  = !!qSummary;

    /* existing IDs */
    m08Text('dl2-sched-cnt', sched);
    m08Text('dl2-qual-cnt',  qrawN);
    /* warn count = data-validation derived */
    var noDate = 0, noEquip = 0, noModel = 0, sunday = 0;
    work.forEach(function(r){
      var dt = m08Get(r,'date') || m08Get(r,'planDate') || m08Get(r,'일자');
      var eq = m08Get(r,'machine') || m08Get(r,'호기');
      var md = m08Get(r,'model') || m08Get(r,'모델');
      if(!dt) noDate++; else { try { var d=new Date(dt); if(!isNaN(d) && d.getDay()===0) sunday++; }catch(_e){} }
      if(!eq) noEquip++;
      if(!md) noModel++;
    });
    var warnCnt = noDate + noEquip + noModel + sunday;
    m08Text('dl2-warn-cnt', warnCnt);

    /* attach button behaviors */
    function bindBtn(id, label, enable, onClick, reason){
      var b = document.getElementById(id);
      if(!b) return;
      b.removeAttribute('onclick');
      b.classList.add('m08-dl-btn');
      b.disabled = !enable;
      b.textContent = label;
      b.title = enable ? '' : (reason || '');
      if(enable) b.onclick = onClick;
      else b.onclick = null;
    }
    bindBtn('dl2-btn-sched',
      sched > 0 ? '생산일정 CSV 다운로드' : '생산일정 데이터 없음',
      sched > 0,
      function(){ window.m08DownloadCSV('odi-schedule-' + Date.now() + '.csv', work); },
      '생산일정을 먼저 업로드해 주세요.'
    );
    bindBtn('dl2-btn-equip',
      sched > 0 ? '장비 master JSON 다운로드' : '데이터 없음',
      sched > 0,
      function(){
        var pairs = {};
        work.forEach(function(r){
          var eq = m08Get(r,'machine') || m08Get(r,'호기');
          var md = m08Get(r,'model') || m08Get(r,'모델');
          if(eq){
            pairs[eq] = pairs[eq] || { equip:eq, models:{} };
            if(md) pairs[eq].models[md] = (pairs[eq].models[md]||0)+1;
          }
        });
        window.m08DownloadJSON('odi-equip-master-' + Date.now() + '.json', Object.values(pairs));
      },
      '생산일정을 먼저 업로드해 주세요.'
    );
    bindBtn('dl2-btn-valid',
      sched > 0 ? '검증 결과 JSON 다운로드' : '데이터 없음',
      sched > 0,
      function(){
        window.m08DownloadJSON('odi-validation-' + Date.now() + '.json', {
          generatedAt: new Date().toISOString(),
          version: VERSION,
          schedule: { total: sched, noDate: noDate, noEquip: noEquip, noModel: noModel, sunday: sunday },
          warnCnt: warnCnt
        });
      },
      '생산일정을 먼저 업로드해 주세요.'
    );

    m08Html('dl2-sched-desc', sched > 0
      ? '<span style="color:#86efac">생산일정 ' + sched + ' row · CSV 다운로드 가능</span>'
      : '<span style="color:var(--tm,#8da0c1)">생산일정 업로드 전 — 사용 불가</span>');
    m08Html('dl2-equip-desc', sched > 0
      ? '<span style="color:#86efac">호기/모델 master JSON</span>'
      : '<span style="color:var(--tm,#8da0c1)">생산일정 업로드 전 — 사용 불가</span>');
    m08Html('dl2-valid-desc', sched > 0
      ? '<span style="color:#86efac">검증 집계 결과 JSON</span>'
      : '<span style="color:var(--tm,#8da0c1)">생산일정 업로드 전 — 사용 불가</span>');

    /* additional spec §6 rows — sibling block (idempotent) */
    var prev = document.getElementById('m08-dl-extra');
    if(prev && prev.parentNode) prev.parentNode.removeChild(prev);

    var extra = document.createElement('div');
    extra.id = 'm08-dl-extra';
    extra.style.cssText = 'margin-top:12px';
    extra.innerHTML =
        '<div style="font-size:11px;font-weight:700;color:var(--ts,#cfd6e4);margin-bottom:6px">📥 추가 다운로드 — 품질 데이터</div>'
      + '<div id="m08-dl-qraw-row" class="m08-dl-row">'
      +   '<div><div class="dlr-label">품질 Raw 데이터</div><div class="dlr-sub">' + (qrawN > 0 ? '엑셀 Raw 시트 ' + qrawN + ' row CSV' : '품질 엑셀 업로드 전') + '</div></div>'
      +   '<div class="dlr-cnt">' + qrawN + '</div>'
      +   '<button class="m08-dl-btn" id="m08-dl-qraw-btn" ' + (qrawN > 0 ? '' : 'disabled title="품질 엑셀 업로드 후 활성화"') + '>CSV</button>'
      + '</div>'
      + '<div id="m08-dl-qissue-row" class="m08-dl-row">'
      +   '<div><div class="dlr-label">품질 Issue 데이터</div><div class="dlr-sub">' + (qissueN > 0 ? 'Issue 시트 ' + qissueN + ' row CSV' : '품질 Issue 시트 없음') + '</div></div>'
      +   '<div class="dlr-cnt">' + qissueN + '</div>'
      +   '<button class="m08-dl-btn" id="m08-dl-qissue-btn" ' + (qissueN > 0 ? '' : 'disabled title="Issue 시트 업로드 후 활성화"') + '>CSV</button>'
      + '</div>'
      + '<div id="m08-dl-qsum-row" class="m08-dl-row">'
      +   '<div><div class="dlr-label">품질 Summary 데이터</div><div class="dlr-sub">' + (qsumOk ? 'Dashboard Ready 집계 JSON' : 'Dashboard Ready 준비 전') + '</div></div>'
      +   '<div class="dlr-cnt">' + (qsumOk ? '✓' : '—') + '</div>'
      +   '<button class="m08-dl-btn" id="m08-dl-qsum-btn" ' + (qsumOk ? '' : 'disabled title="Dashboard Ready 완료 후 활성화"') + '>JSON</button>'
      + '</div>'
      + '<div id="m08-dl-session-row" class="m08-dl-row">'
      +   '<div><div class="dlr-label">현재 세션 통합 데이터</div><div class="dlr-sub">생산일정 + 품질 + 메타 통합 JSON</div></div>'
      +   '<div class="dlr-cnt">' + (sched + qrawN) + '</div>'
      +   '<button class="m08-dl-btn" id="m08-dl-session-btn" ' + ((sched + qrawN) > 0 ? '' : 'disabled title="업로드 데이터가 없습니다"') + '>JSON</button>'
      + '</div>';
    page.appendChild(extra);

    /* bind extra buttons */
    var qrawBtn = document.getElementById('m08-dl-qraw-btn');
    if(qrawBtn && !qrawBtn.disabled) qrawBtn.onclick = function(){ window.m08DownloadCSV('odi-quality-raw-' + Date.now() + '.csv', qRaw); };
    var qissueBtn = document.getElementById('m08-dl-qissue-btn');
    if(qissueBtn && !qissueBtn.disabled) qissueBtn.onclick = function(){ window.m08DownloadCSV('odi-quality-issue-' + Date.now() + '.csv', qIssue); };
    var qsumBtn = document.getElementById('m08-dl-qsum-btn');
    if(qsumBtn && !qsumBtn.disabled) qsumBtn.onclick = function(){ window.m08DownloadJSON('odi-quality-summary-' + Date.now() + '.json', qSummary); };
    var sessionBtn = document.getElementById('m08-dl-session-btn');
    if(sessionBtn && !sessionBtn.disabled) sessionBtn.onclick = function(){
      window.m08DownloadJSON('odi-session-' + Date.now() + '.json', {
        generatedAt: new Date().toISOString(),
        version: VERSION,
        schedule: { rows: sched, warn: warnCnt },
        quality:  { raw: qrawN, issue: qissueN, summaryReady: qsumOk }
      });
    };

    return true;
  } catch(e){
    try { console.warn('[' + VERSION + '] renderM08Download failed:', e); } catch(_e){}
    return false;
  }
};

/* ─────────── §7. renderM08DataEquip ─────────── */
window.renderM08DataEquip = function(){
  try {
    var page = document.getElementById('page-data-equip');
    if(!page) return false;
    var work = m08GetWork();
    var qRaw = m08GetQRaw();

    /* equip detection per source */
    var workEquipMap = {};   /* equip -> count */
    var qualEquipMap = {};
    var workModelByEquip = {};
    work.forEach(function(r){
      var eq = m08Get(r,'machine') || m08Get(r,'호기');
      var md = m08Get(r,'model') || m08Get(r,'모델');
      if(eq){
        workEquipMap[eq] = (workEquipMap[eq] || 0) + 1;
        workModelByEquip[eq] = workModelByEquip[eq] || {};
        if(md) workModelByEquip[eq][md] = (workModelByEquip[eq][md] || 0) + 1;
      }
    });
    qRaw.forEach(function(r){
      var eq = m08Get(r,'machine') || m08Get(r,'호기');
      if(eq) qualEquipMap[eq] = (qualEquipMap[eq] || 0) + 1;
    });

    var allEquipSet = {};
    Object.keys(workEquipMap).forEach(function(k){ allEquipSet[k] = true; });
    Object.keys(qualEquipMap).forEach(function(k){ allEquipSet[k] = true; });
    var allEquip = Object.keys(allEquipSet).sort();

    var workEquipCnt = Object.keys(workEquipMap).length;
    var qualEquipCnt = Object.keys(qualEquipMap).length;
    var detectedCnt  = allEquip.length;
    var unmappedCnt  = 0;
    work.forEach(function(r){ var eq = m08Get(r,'machine') || m08Get(r,'호기'); if(!eq) unmappedCnt++; });

    m08Text('de2-total-equip', detectedCnt);
    m08Text('de2-total-model', m08Uniq(work, 'model').length || m08Uniq(work,'모델').length);
    m08Text('de2-missing-equip', unmappedCnt);
    m08Text('de2-missing-model', work.filter(function(r){ return !(m08Get(r,'model') || m08Get(r,'모델')); }).length);

    /* dup candidate count */
    var pairs = {};
    work.forEach(function(r){
      var eq = m08Get(r,'machine') || m08Get(r,'호기');
      var md = m08Get(r,'model') || m08Get(r,'모델');
      if(eq && md) pairs[eq + '|' + md] = (pairs[eq + '|' + md] || 0) + 1;
    });
    var dupCand = Object.keys(pairs).filter(function(k){ return pairs[k] > 1; }).length;
    m08Text('de2-dup-cand', dupCand);

    /* §7 summary cards as sibling (idempotent) */
    var existing = document.getElementById('m08-de-summary');
    if(existing && existing.parentNode) existing.parentNode.removeChild(existing);

    var sumBlock = document.createElement('div');
    sumBlock.id = 'm08-de-summary';
    sumBlock.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin:10px 0';
    sumBlock.innerHTML =
        '<div style="padding:9px 11px;background:rgba(34,211,238,0.05);border:1px solid rgba(34,211,238,0.22);border-radius:6px"><div style="font-size:9px;color:var(--tm,#8da0c1)">감지 장비 수</div><div style="font-size:17px;font-weight:800;color:#67e8f9;font-family:monospace">' + detectedCnt + '</div></div>'
      + '<div style="padding:9px 11px;background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.22);border-radius:6px"><div style="font-size:9px;color:var(--tm,#8da0c1)">미매핑 장비</div><div style="font-size:17px;font-weight:800;color:#fcd34d;font-family:monospace">' + unmappedCnt + '</div></div>'
      + '<div style="padding:9px 11px;background:rgba(99,102,241,0.05);border:1px solid rgba(99,102,241,0.22);border-radius:6px"><div style="font-size:9px;color:var(--tm,#8da0c1)">품질 데이터 장비</div><div style="font-size:17px;font-weight:800;color:#a5b4fc;font-family:monospace">' + qualEquipCnt + '</div></div>'
      + '<div style="padding:9px 11px;background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.20);border-radius:6px"><div style="font-size:9px;color:var(--tm,#8da0c1)">생산 데이터 장비</div><div style="font-size:17px;font-weight:800;color:#86efac;font-family:monospace">' + workEquipCnt + '</div></div>';

    /* insert before existing de2 master tbody parent */
    var masterTbody = document.getElementById('de2-master-tbody');
    var masterTable = masterTbody ? (masterTbody.closest('.di-tbl-wrap') || masterTbody.closest('table') || masterTbody.parentNode) : null;
    if(masterTable && masterTable.parentNode){
      masterTable.parentNode.insertBefore(sumBlock, masterTable);
    } else {
      page.appendChild(sumBlock);
    }

    /* master tbody — spec §7 columns: 장비명 / 출처 / 모델 후보 / 매핑 상태 / 검토 필요 여부 */
    if(masterTbody){
      if(!allEquip.length){
        masterTbody.innerHTML = '<tr><td colspan="5" style="padding:0">'
                              +   '<div class="m08-empty">'
                              +     '<div class="ico">📭</div>'
                              +     '<div class="ttl">장비 데이터 없음</div>'
                              +     '<div>생산일정 또는 품질 엑셀 업로드 후 장비 후보가 표시됩니다.</div>'
                              +     '<div class="act">'
                              +       '<button onclick="nav(\'schedule\')">생산일정 →</button>'
                              +       '<button onclick="nav(\'quality-main\')">불량 관리 →</button>'
                              +     '</div></div></td></tr>';
      } else {
        masterTbody.innerHTML = allEquip.slice(0, 60).map(function(eq){
          var inWork = !!workEquipMap[eq];
          var inQual = !!qualEquipMap[eq];
          var sources = [];
          if(inWork) sources.push('생산');
          if(inQual) sources.push('품질');
          var sourceTxt = sources.join(' + ');
          var models = workModelByEquip[eq] || {};
          var modelList = Object.keys(models).sort(function(a,b){ return models[b]-models[a]; });
          var modelTxt = modelList.length === 0 ? '<span class="dim">—</span>'
                        : modelList.length === 1 ? m08Esc(modelList[0])
                        : (m08Esc(modelList[0]) + ' <span class="dim">+' + (modelList.length-1) + '</span>');
          /* status: 매핑됨 if appears in both & has model; 매핑 필요 if mismatch between work/qual; 미기재 if neither has model */
          var status, statusBadge;
          if(inWork && inQual){
            if(modelList.length > 0){ status = 'mapped';   statusBadge = '<span class="m08-badge ok">매핑됨</span>'; }
            else                    { status = 'review';   statusBadge = '<span class="m08-badge review">검토 필요</span>'; }
          } else if(inWork && !inQual){
            status = 'mapped'; statusBadge = '<span class="m08-badge ok">매핑됨</span>';
          } else if(!inWork && inQual){
            status = 'needmap'; statusBadge = '<span class="m08-badge warn">매핑 필요</span>';
          } else {
            status = 'missing'; statusBadge = '<span class="m08-badge miss">미기재</span>';
          }
          var needsReview = (inWork && inQual && modelList.length === 0) || (inQual && !inWork) ? '검토 필요' : '—';
          var needsBadge = needsReview === '검토 필요' ? '<span class="m08-badge review">검토 필요</span>' : '<span class="dim">—</span>';
          return '<tr>'
               +   '<td class="mono">' + m08Esc(eq) + '</td>'
               +   '<td>' + m08Esc(sourceTxt) + '</td>'
               +   '<td>' + modelTxt + '</td>'
               +   '<td>' + statusBadge + '</td>'
               +   '<td>' + needsBadge + '</td>'
               + '</tr>';
        }).join('') + (allEquip.length > 60 ? '<tr><td colspan="5" class="dim" style="text-align:right;font-size:9px">상위 60건 표시 / 전체 ' + allEquip.length + '건</td></tr>' : '');
      }
    }

    /* normalization panel */
    var normPanel = document.getElementById('de2-norm-panel');
    if(normPanel){
      var needs = [];
      if(unmappedCnt > 0) needs.push({ k:'호기 미기재', n:unmappedCnt });
      if(dupCand > 0)     needs.push({ k:'중복 후보 (동일 장비+모델 다중 row)', n:dupCand });
      var crossOnly = Object.keys(qualEquipMap).filter(function(k){ return !workEquipMap[k]; }).length;
      if(crossOnly > 0)   needs.push({ k:'품질 데이터에만 존재하는 장비', n:crossOnly });
      if(!work.length && !qRaw.length){
        normPanel.innerHTML = '<div class="m08-empty"><div class="ico">📭</div><div class="ttl">데이터 없음</div><div>업로드 후 정규화 후보가 표시됩니다.</div></div>';
      } else if(!needs.length){
        normPanel.innerHTML = '<div style="padding:10px 12px;background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.20);border-radius:5px;font-size:11px;color:#86efac">정규화 필요 항목 없음 — 장비·모델 master 정상</div>';
      } else {
        normPanel.innerHTML = '<div style="padding:10px 12px;background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.22);border-radius:5px">'
                            + '<div style="font-size:10px;font-weight:700;color:#fcd34d;margin-bottom:6px">정규화 후보 ' + needs.length + '건</div>'
                            + needs.map(function(n){ return '<div style="font-size:10px;color:var(--tm,#8da0c1);padding:2px 0">• ' + m08Esc(n.k) + ': <strong style="color:#fcd34d">' + n.n + '</strong> 건</div>'; }).join('')
                            + '<div style="margin-top:8px;padding-top:6px;border-top:1px dashed rgba(168,162,158,0.20);font-size:9.5px;color:var(--tm,#8da0c1)">장비 master 자동 확정은 수행하지 않습니다. 운영 검토 후 수동 정규화 필요.</div>'
                            + '</div>';
      }
    }

    return true;
  } catch(e){
    try { console.warn('[' + VERSION + '] renderM08DataEquip failed:', e); } catch(_e){}
    return false;
  }
};

/* ─────────── dispatcher wrap (data management routes only) ─────────── */
function m08WrapDispatcher(){
  try {
    if(typeof window.odiNavAfterRenderDispatcher !== 'function') return false;
    if(window.odiNavAfterRenderDispatcher.__m08Wrapped) return true;
    var original = window.odiNavAfterRenderDispatcher;
    var wrapped = function(k){
      var ret = original.apply(this, arguments);
      setTimeout(function(){
        try {
          if(k === 'data-equip')      window.renderM08DataEquip();
          if(k === 'data-validation') window.renderM08DataValidation();
          if(k === 'download')        window.renderM08Download();
          if(k === 'upload-history')  window.renderM08UploadHistory();
          if(k === 'file-mapping')    window.renderM08FileMapping();
          if(k === 'user-guide')      window.renderM08UserGuide();
        } catch(_e){}
      }, 150);
      return ret;
    };
    wrapped.__m08Wrapped = true;
    window.odiNavAfterRenderDispatcher = wrapped;
    return true;
  } catch(_e){ return false; }
}

/* ─────────── audit ─────────── */
window.ODI_DATA_MANAGEMENT_PATCH_AUDIT = {
  version: VERSION,
  scope: 'data management only — §8 보존 페이지 (schedule × 4, quality-dash, quality-main, quality-analysis 10탭) 무변경. §9 제외 페이지 (dashboard, equip-status, team-overview, prod × 3, quality-action, quality-images, quality-master) 미수정.',
  augmentedStatusMap: ['upload-history','data-validation','file-mapping','user-guide'],
  rendersAdded: [
    'renderM08FileMapping','renderM08UploadHistory','renderM08DataValidation',
    'renderM08UserGuide','renderM08Download','renderM08DataEquip'
  ],
  noExternalCdn: true, noGoogleFonts: true, noChartjs: true,
  noAllData: true, noOriginalDataMutation: true,
  workingPrinciples: {
    improvementPoints: [
      'ODI_MENU_STATUS_MAP 누락 4건 등록 — MAP_MISSING 0건 달성',
      '데이터관리 6개 페이지 (data-equip / upload-history / data-validation / file-mapping / user-guide / download) 사용자용 화면 보강',
      '파일 매핑 "준비중" 상태 제거 — 표준 필드 매핑 현황 + 미매핑 알림으로 대체',
      '내보내기/다운로드: Blob 기반 CSV/JSON 6종 (생산일정, 장비 master, 검증 결과, 품질 Raw, Issue, Summary, 세션 통합) — 데이터 없을 때 비활성 사유 표시',
      '데이터 검증: 필수값/날짜/장비/중복/코드 매핑 5종 검증 카드 + 행 단위 상세 표 (조치 안내 포함)',
      '사용 가이드: 4개 운영자 워크플로우 + 7개 주의사항 + 12개 용어 설명. LIVE 상태',
      '장비 데이터: 생산 + 품질 통합 장비 감지, 출처/모델 후보/매핑 상태/검토 필요 여부 표 (장비 master 임의 확정 X)'
    ],
    implementationCautions: [
      '모든 render 함수 read-only — WORK_DATA / Q*_ROWS / QSUMMARY_DATA mutation 없음',
      'fm2-unmap-panel 의 자식 fm2-u-* 요소들이 destroy 되지 않도록 sibling 노트 (#m08-fm-note) 패턴 사용 — innerHTML overwrite 금지',
      'odiNavAfterRenderDispatcher 본체 변경 X, wrap 만 (__m08Wrapped). 데이터관리 6개 route 만 분기',
      '본 단계 제외 페이지 (§9: dashboard, equip-status, team-overview, prod × 3, quality-action, quality-images, quality-master) 는 render 분기 없음 — 다른 단계에서 작업',
      'LIVE 페이지 (§8: schedule × 4, quality-dash, quality-main, quality-analysis) 는 dispatcher 분기에 미포함',
      '품질 분석센터 10탭 (qClean) 보존 — qCleanRenderShell, runOdiQualityAnalysisCleanRebuildCheck 무변경',
      '자동 합격/불합격 판정 X, 위험도 점수 자동 X, ECO/CAPA 자동 X, 장비 master 임의 확정 X',
      'idempotent 보장: m08-uh-summary / m08-dv-summary / m08-de-summary / m08-fm-note / m08-dl-extra / m08-userguide-extras 매번 재생성 시 기존 동일 ID 요소 제거 후 추가',
      '신규 CSS 전부 .m08-* prefix. 전역 .card/.tbl/.tabs/body/#main-content/.page 무변경'
    ],
    pendingDecisions: [
      '품질 분류 코드 master CRUD — 본 작업 범위 외 (§9 quality-master 제외, 추후 단계)',
      'ECO/CAPA 워크플로우 자동화 — 사용자 명시적 금지 유지',
      '업로드 이력 서버 감사 로그 — 현재 세션 기준만, 영구 저장은 서버 연동 후',
      'page-user-guide 의 DXF/FAIR 예정 흐름 섹션 제거 — 현재 포털 범위와 분리',
      'data-equip 의 장비 master 정규화 자동화 — 운영 검토 후 수동 정규화 정책 결정 필요',
      '대시보드 3개 (§9 dashboard/equip-status/team-overview) 및 생산 관리 3개 (§9 prod × 3) 보강 — 08N/08O 단계'
    ]
  }
};

window.runOdiDataManagementPatchAudit = function(){
  var routes = ['upload-history','data-validation','file-mapping','user-guide','download','data-equip'];
  var pmHas = {}, pageDomHas = {}, mapStatus = {};
  routes.forEach(function(k){
    pmHas[k]       = !!(window.PM && window.PM[k]);
    var pid        = window.PM ? window.PM[k] : null;
    pageDomHas[k]  = pid ? !!document.getElementById(pid) : false;
    var mapEntry   = Array.isArray(window.ODI_MENU_STATUS_MAP) ? window.ODI_MENU_STATUS_MAP.find(function(m){ return m.routeKey === k; }) : null;
    mapStatus[k]   = mapEntry ? mapEntry.status : '(미등록)';
  });
  var rendersAvail = {};
  ['renderM08FileMapping','renderM08UploadHistory','renderM08DataValidation','renderM08UserGuide','renderM08Download','renderM08DataEquip'].forEach(function(n){
    rendersAvail[n] = typeof window[n] === 'function';
  });

  /* preservation checks */
  var preservedLive = {
    'page-schedule':         !!document.getElementById('page-schedule'),
    'page-schedule-log':     !!document.getElementById('page-schedule-log'),
    'page-schedule-model':   !!document.getElementById('page-schedule-model'),
    'page-schedule-period':  !!document.getElementById('page-schedule-period'),
    'page-quality-dash':     !!document.getElementById('page-quality-dash'),
    'page-quality-main':     !!document.getElementById('page-quality-main'),
    'page-quality-analysis': !!document.getElementById('page-quality-analysis')
  };
  var qCleanTabs = document.querySelectorAll('#page-quality-analysis [data-qclean="tabs"] > button').length;

  /* excluded pages — confirm no m08 render registered */
  var excludedPages = ['page-dashboard','page-equip-status','page-team-overview',
                       'page-prod-overview','page-prod-headcount','page-prod-process',
                       'page-quality-action','page-quality-images','page-quality-master'];
  var excludedDomPresent = {};
  excludedPages.forEach(function(p){ excludedDomPresent[p] = !!document.getElementById(p); });

  var result = {
    version: window.APP_VERSION,
    scope: 'data-management',
    routes: routes,
    pmHas: pmHas,
    pageDomHas: pageDomHas,
    mapStatus: mapStatus,
    mapMissingCount: routes.filter(function(k){ return mapStatus[k] === '(미등록)'; }).length,
    rendersAvail: rendersAvail,
    dispatcherWrapped: !!(window.odiNavAfterRenderDispatcher && window.odiNavAfterRenderDispatcher.__m08Wrapped),
    preservedLive: preservedLive,
    qCleanTabsCount: qCleanTabs,
    excludedDomPresent: excludedDomPresent,
    externalCdnAdded: !!document.querySelector('script[src*="cdn.jsdelivr"], script[src*="chart.js"], link[href*="fonts.googleapis"]'),
    allDataImported: typeof window.ALL_DATA !== 'undefined',
    errors: []
  };
  try { console.log('[' + VERSION + '] data-management audit', result); } catch(_e){}
  return result;
};

/* ─────────── init ─────────── */
function m08Init(){
  try {
    window.m08AugmentMenuStatusMap();
    m08WrapDispatcher();
    /* render current page if it's one of ours */
    var page = document.querySelector('.page.active');
    if(page){
      var pid = page.id || '';
      if(pid === 'page-data-equip')      window.renderM08DataEquip();
      if(pid === 'page-data-validation') window.renderM08DataValidation();
      if(pid === 'page-download')        window.renderM08Download();
      if(pid === 'page-upload-history')  window.renderM08UploadHistory();
      if(pid === 'page-file-mapping')    window.renderM08FileMapping();
      if(pid === 'page-user-guide')      window.renderM08UserGuide();
    }
  } catch(e){ try { console.warn('[' + VERSION + '] init failed:', e); } catch(_e){} }
}
function m08Boot(){ setTimeout(m08Init, 900); }
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', m08Boot);
else m08Boot();

})();
