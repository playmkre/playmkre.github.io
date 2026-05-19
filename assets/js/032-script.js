/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 32 id=(none) :: OPT01 no semantic edits */

// 브라우저 메모리 전용. 브라우저 영구 저장소 사용 없음.
var QRAW_WORKBOOK_CACHE = null;
var QRAW_FILE_META      = null;
var QRAW_SHEET_META     = null;
var QRAW_MONTH_SHEETS   = [];
var QRAW_FIELD_MAPPING  = null;
var QRAW_ROWS           = [];
var QRAW_WARNINGS       = [];
var QRAW_GENERATED_AT   = null;
// QRAW VIEW 검수용 메모리 전용 상태
var QRAW_VIEW_PAGE      = 1;
var QRAW_VIEW_PAGE_SIZE = 50;
var QRAW_VIEW_FILTERS   = { sheet:"", severity:"", missingOnly:false };
var QISSUE_ROWS           = [];
var QISSUE_WARNINGS       = [];
var QISSUE_GENERATED_AT   = null;
var QISSUE_VIEW_PAGE      = 1;
var QISSUE_VIEW_PAGE_SIZE = 50;
var QISSUE_VIEW_FILTERS   = { severity:"", machine:"", model:"", status:"", missingOnly:false, duplicateOnly:false };
var QNORM_REVIEW_SNAPSHOT   = null;
var QNORM_REVIEW_SELECTIONS = { severity:{}, machine:{}, model:{}, cell:{}, part:{}, categoryLarge:{}, categoryMiddle:{}, categorySmall:{} };
var QNORM_REVIEW_WARNINGS   = [];
var QNORM_REVIEW_APPLIED_AT   = null;
var QISSUE_NORMALIZED_ROWS    = [];
var QISSUE_NORMALIZE_WARNINGS = [];
var QISSUE_NORMALIZE_APPLIED_AT = null;
var QISSUE_NORMALIZE_LOCKED   = false;
var QISSUE_NORMALIZE_META     = null;
var QSUMMARY_SCHEMA           = null;
var QSUMMARY_SCHEMA_REVIEWED  = false;
var QSUMMARY_SCHEMA_WARNINGS  = [];
var QSUMMARY_SCHEMA_APPLIED_AT= null;
var QSUMMARY_DATA             = null;
var QSUMMARY_DATA_WARNINGS    = [];
var QSUMMARY_DATA_GENERATED_AT= null;
var QSUMMARY_DATA_READY       = false;
var QSUMMARY_DATA_META        = null;
var QSUMMARY_VIEW_FILTERS     = { periodLevel:'monthly', dateFrom:'', dateTo:'', sourceMonth:'', severity:'', machine:'', model:'', cell:'', part:'', categoryLarge:'', categoryMiddle:'', categorySmall:'', warningOnly:false, duplicateOnly:false, missingOnly:false, unmappedOnly:false };
var QSUMMARY_FILTER_PREVIEW   = null;
var QSUMMARY_FILTER_WARNINGS  = [];
var QSUMMARY_FILTER_APPLIED_AT= null;
var QDASH_READY_DATA       = null;
var QDASH_READY_WARNINGS   = [];
var QDASH_READY_GENERATED_AT = null;
var QDASH_READY_META       = null;
var QDASH_CHART_BLUEPRINT  = null;
var QDASH_READY_REVIEWED   = false;
var QDASH_CHART_RENDERED   = false;
var QDASH_CHART_RENDERED_AT= null;
var QDASH_CHART_VIEW_MODE  = { periodLevel:'monthly', topLimit:10 };
var QDASH_CHART_WARNINGS   = [];
var QANALYSIS_CHART_RENDERED   = false;
var QANALYSIS_CHART_RENDERED_AT= null;
var QANALYSIS_CHART_VIEW_MODE  = { activeTab:'machine', periodLevel:'monthly', topLimit:12, severityMode:'all' };
var QANALYSIS_CHART_WARNINGS   = [];
// QISSUE_RULES — 규칙 정의. QISSUE_ROWS — 이슈 데이터 메모리 전용.
var QISSUE_RULES = {
  requiredFields:     ["date","machine","model","severity","text"],
  optionalFields:     ["no","cell","part","categoryLarge","categoryMiddle","categorySmall"],
  severityNormalize:  {
    critical: ["치명","Critical","High","S","A"],
    major:    ["주요","Major","Medium","B"],
    normal:   ["보통","Normal","C"],
    minor:    ["경미","Minor","Low"]
  },
  issueTextFields:    ["text"],
  groupingKeys:       ["sourceSheet","excelRow"],
  duplicateCheckKeys: ["sourceSheet","excelRow","machine","model","text"]
};

// 월별 탭 1개 미리보기, 필드 후보 검토, 전체 Raw 데이터 행 생성을 순차 수행한다.
// QRAW 계열 상태는 브라우저 메모리 전용이다.

function qTriggerFileSelect(){
  var inp = document.getElementById('qdefect-file-input');
  if(inp) inp.click();
}

// input change
(function _bindQFilenameOnly(){
  function bind(){
    var inp = document.getElementById('qdefect-file-input');
    if(!inp || inp.__q03aBound) return;
    inp.__q03aBound = true;
    inp.addEventListener('change', function(){
      var f = inp.files && inp.files[0];
      inp.value = '';
      if(f){ _qShowFilename(f.name); qReadSheetNamesOnly(f); }
    });
  }
  if(document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();

// drop
function qHandleDropStub(evt){
  var files = evt.dataTransfer && evt.dataTransfer.files;
  if(files && files[0]){ _qShowFilename(files[0].name); qReadSheetNamesOnly(files[0]); }
}

function _qShowFilename(name){
  var zone   = document.getElementById('qmain-upload-zone');
  var fnBar  = document.getElementById('qmain-filename-bar');
  var fnText = document.getElementById('qmain-filename-text');
  var stBar  = document.getElementById('qmain-status-bar');
  if(zone)   zone.style.display  = 'none';
  if(fnBar)  fnBar.style.display = 'flex';
  if(fnText) fnText.textContent  = name;
  if(stBar)  stBar.style.display = 'flex';
  var badge = document.getElementById('qmain-status-badge');
  var msg   = document.getElementById('qmain-status-msg');
  if(badge){ badge.className='q-status-badge'; badge.textContent='파일 선택됨'; }
  if(msg)   msg.textContent = '시트명 읽기를 준비 중입니다.';
}

// ── qCheckXlsxReadyOnly (유지) ──────────────────────
// qReadSheetNamesOnly 내부에서 ensureXlsxReady를 직접 사용하므로
// 이 함수는 단독 호출 용도로만 유지.
function qCheckXlsxReadyOnly(){
  var badge = document.getElementById('qmain-status-badge');
  var msg   = document.getElementById('qmain-status-msg');
  var stBar = document.getElementById('qmain-status-bar');
  if(stBar) stBar.style.display = 'flex';
  if(badge){ badge.className='q-status-badge'; badge.textContent='엔진 확인 중'; }
  if(msg)   msg.textContent = 'SheetJS 엔진을 준비 중입니다.';
  if(typeof ensureXlsxReady !== 'function'){
    if(badge){ badge.className='q-status-badge q-badge-err'; badge.textContent='엔진 로드 실패'; }
    if(msg)   msg.textContent = 'SheetJS 엔진 로드에 실패했습니다.';
    return Promise.reject(new Error('ensureXlsxReady 미정의'));
  }
  return ensureXlsxReady();
}

// ── qReadSheetNamesOnly(file) ───────────────────────
// 시트명 읽기 + 월별 탭 후보 1개 미리보기 연결.
// wb는 읽기 성공 후 QRAW_WORKBOOK_CACHE에 메모리 전용으로 보관한다.
function qReadSheetNamesOnly(file){
  if(!file) return;
  var ext = (file.name || '').split('.').pop().toLowerCase();
  var badge = document.getElementById('qmain-status-badge');
  var msg   = document.getElementById('qmain-status-msg');
  var stBar = document.getElementById('qmain-status-bar');

  if(ext !== 'xlsx'){
    if(stBar) stBar.style.display = 'flex';
    if(badge){ badge.className='q-status-badge q-badge-err'; badge.textContent='파일 형식 오류'; }
    if(msg)   msg.textContent = '.xlsx 파일만 선택할 수 있습니다.';
    return;
  }

  // 새 파일 선택 시 이전 파일의 메모리 매핑/행 생성 결과를 무효화한다.
  QRAW_WORKBOOK_CACHE = null;
  QRAW_FILE_META      = null;
  QRAW_SHEET_META     = null;
  QRAW_MONTH_SHEETS   = [];
  QRAW_FIELD_MAPPING  = null;
  QRAW_ROWS           = [];
  QRAW_WARNINGS       = [];
  QRAW_GENERATED_AT   = null;
  QRAW_VIEW_PAGE      = 1;
  QRAW_VIEW_PAGE_SIZE = 50;
  QRAW_VIEW_FILTERS   = { sheet:"", severity:"", missingOnly:false };
  QISSUE_ROWS           = [];
  QISSUE_WARNINGS       = [];
  QISSUE_GENERATED_AT   = null;
  QISSUE_VIEW_PAGE      = 1;
  QISSUE_VIEW_PAGE_SIZE = 50;
  QISSUE_VIEW_FILTERS   = { severity:"", machine:"", model:"", status:"", missingOnly:false, duplicateOnly:false };
  qInvalidateQualityDownstreamStates("new-file-selected");

  if(stBar) stBar.style.display = 'flex';
  if(badge){ badge.className='q-status-badge'; badge.textContent='시트명 확인 중'; }
  if(msg)   msg.textContent = 'SheetJS 엔진 준비 후 시트명만 읽습니다.';

  if(typeof ensureXlsxReady !== 'function'){
    if(badge){ badge.className='q-status-badge q-badge-err'; badge.textContent='엔진 로드 실패'; }
    if(msg)   msg.textContent = 'SheetJS 엔진 로드에 실패했습니다.';
    return;
  }

  ensureXlsxReady().then(function(){
    var reader = new FileReader();
    reader.onload = function(e){
      try{
        var ab = e.target.result;
        // wb는 읽기 성공 후 QRAW_WORKBOOK_CACHE에 메모리 전용으로 보관
        var wb = XLSX.read(new Uint8Array(ab), { type:'array', cellDates:true });
        var sheetNames = wb.SheetNames || [];
        // 시트명 분석 — 구조 객체 반환
        var sheetMeta = qAnalyzeSheetNamesOnly(sheetNames, file);
        var months = sheetMeta ? sheetMeta.monthSheets : [];
        // QRAW 메모리 캐시 — 브라우저 메모리 전용
        QRAW_WORKBOOK_CACHE = wb;
        QRAW_FILE_META = {
          name: file.name,
          size: file.size,
          lastModified: file.lastModified || 0,
          loadedAt: new Date().toISOString()
        };
        QRAW_SHEET_META    = sheetMeta;
        QRAW_MONTH_SHEETS  = months || [];
        // 월별 탭 첫 번째 1개만 미리보기 — wb를 내부 전달
        if(months && months.length > 0){
          qRenderRawPreview10Only(wb, months[0]);
        } else {
          _qAppendNoMonthNotice();
        }
        // wb 참조는 QRAW_WORKBOOK_CACHE가 유지 — 지역 해제 생략
      } catch(err){
        if(badge){ badge.className='q-status-badge q-badge-err'; badge.textContent='시트명 확인 실패'; }
        if(msg)   msg.textContent = '시트명 읽기 오류: ' + (err.message || '알 수 없는 오류');
        console.error('[Q_REBUILD_08I_DATA_MANAGEMENT_PAGES_PURPOSE_REDESIGN] XLSX.read 오류:', err);
      }
    };
    reader.onerror = function(){
      if(badge){ badge.className='q-status-badge q-badge-err'; badge.textContent='시트명 확인 실패'; }
      if(msg)   msg.textContent = '파일 읽기에 실패했습니다.';
    };
    reader.readAsArrayBuffer(file);
  }).catch(function(err){
    if(badge){ badge.className='q-status-badge q-badge-err'; badge.textContent='엔진 로드 실패'; }
    if(msg)   msg.textContent = 'SheetJS 엔진 로드에 실패했습니다. 네트워크 또는 CDN 접근 상태를 확인하세요.';
    console.error('[Q_REBUILD_08I_DATA_MANAGEMENT_PAGES_PURPOSE_REDESIGN] ensureXlsxReady 실패:', err);
  });
}

// ── qAnalyzeSheetNamesOnly(sheetNames, file) ────────
// 시트명 분류 + 결과 패널 표시 + 구조 객체 반환.
// 행/셀 데이터 접근 없음.
function qAnalyzeSheetNamesOnly(sheetNames, file){
  var badge = document.getElementById('qmain-status-badge');
  var msg   = document.getElementById('qmain-status-msg');
  var panel = document.getElementById('qmain-result-panel');

  var RE_SUMMARY = /^(SUMMARY|Summary|summary|써머리|요약)$/;
  var RE_MONTH   = /^\d{2}\.\d{2}$/;
  var CODE_NAMES = ['코드마스터','불량코드배정','리스트','중요도','INFO','작성자집계','기타분류','_dropdown_helper'];
  var RE_SKIP    = /^(생산일정|생산\s일정|[Ss]chedule)$/;

  var summary=[], months=[], codes=[], skips=[], others=[];

  sheetNames.forEach(function(sn){
    var clean = String(sn||'').trim().replace(/^[`'\u2018\u2019]/, '');
    if(RE_SKIP.test(clean))               skips.push(sn);
    else if(RE_SUMMARY.test(clean))       summary.push(sn);
    else if(RE_MONTH.test(clean))         months.push(sn);
    else if(CODE_NAMES.indexOf(clean)>=0) codes.push(sn);
    else                                  others.push(sn);
  });

  if(badge){ badge.className='q-status-badge q-badge-ok'; badge.textContent='시트명 확인 완료'; }
  if(msg)   msg.textContent = '시트명 분석 완료. 월별 탭 미리보기를 준비 중입니다.';

  var fmtSize = file.size > 1048576
    ? (file.size/1048576).toFixed(1)+' MB'
    : Math.round(file.size/1024)+' KB';

  var meta = {
    fileName:     file.name,
    fileSize:     file.size,
    totalSheets:  sheetNames.length,
    summarySheets: summary,
    monthSheets:  months,
    codeSheets:   codes,
    skipSheets:   skips,
    otherSheets:  others
  };

  if(!panel) return meta;
  panel.style.display = 'block';

  function _esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function _chip(cls,t){ return '<span class="'+cls+'" style="margin:2px">'+_esc(t)+'</span>'; }
  function _chips(arr,cls){ return arr.length ? arr.map(function(n){return _chip(cls,n);}).join('') : '<span style="color:var(--tm);font-size:10px">없음</span>'; }

  panel.innerHTML =
    '<div class="q-section-hd" style="margin-bottom:10px">📋 시트명 분석 결과</div>' +
    '<div class="q-sheet-summary-row">' +
      '<span class="q-sheet-lbl">파일명</span><span class="q-sheet-val">'+_esc(file.name)+'</span>' +
      '<span class="q-sheet-lbl">파일 크기</span><span class="q-sheet-val">'+fmtSize+'</span>' +
      '<span class="q-sheet-lbl">전체 시트 수</span><span class="q-sheet-val">'+sheetNames.length+'개</span>' +
      '<span class="q-sheet-lbl">SUMMARY 감지</span><span class="q-sheet-val">'+(summary.length?'✔ '+summary.length+'개':'미감지')+'</span>' +
      '<span class="q-sheet-lbl">월별 탭 후보</span><span class="q-sheet-val">'+months.length+'개</span>' +
      '<span class="q-sheet-lbl">코드 관련 시트</span><span class="q-sheet-val">'+codes.length+'개</span>' +
      '<span class="q-sheet-lbl">생산일정 제외</span><span class="q-sheet-val">'+(skips.length?'✔ '+skips.length+'개':'없음')+'</span>' +
      '<span class="q-sheet-lbl">기타 시트</span><span class="q-sheet-val">'+others.length+'개</span>' +
    '</div>' +
    (months.length?'<div style="margin-top:10px"><div class="q-panel-hd">월별 탭 후보</div><div class="q-sheet-chip-row">'+_chips(months,'q-sheet-month')+'</div></div>':'') +
    (codes.length ?'<div style="margin-top:8px"><div class="q-panel-hd">코드 관련 시트</div><div class="q-sheet-chip-row">'+_chips(codes,'q-sheet-code')+'</div></div>':'') +
    (summary.length?'<div style="margin-top:8px"><div class="q-panel-hd">SUMMARY 탭</div><div class="q-sheet-chip-row">'+_chips(summary,'q-sheet-summary')+'</div></div>':'') +
    (skips.length ?'<div style="margin-top:8px"><div class="q-panel-hd">생산일정 제외 대상</div><div class="q-sheet-chip-row">'+_chips(skips,'q-sheet-skip')+'</div></div>':'') +
    (others.length?'<div style="margin-top:8px"><div class="q-panel-hd">기타 시트</div><div class="q-sheet-chip-row">'+_chips(others,'q-sheet-other')+'</div></div>':'') +
    '<div id="q-preview-section" style="margin-top:14px"></div>' +
    '<div class="q-note" style="margin-top:10px">현재 단계에서는 시트명 분석, 월별 탭 앞 10행 미리보기, 필드 후보 감지만 수행합니다. 확정 매핑과 전체 데이터 생성은 후속 단계에서 진행합니다.</div>';

  return meta;
}

// ── qRenderRawPreview10Only(wb, sheetName) ───────────
// 선택된 월별 탭 1개에서 앞 10개 데이터 행만 미리보기.
// wb.Sheets 접근 = 이 함수 + 선택된 1개 탭에만.
// sheet_to_json = 이 함수 내 지역 변수로만. 전역 저장 없음.
function qRenderRawPreview10Only(wb, sheetName){
  var badge   = document.getElementById('qmain-status-badge');
  var msg     = document.getElementById('qmain-status-msg');
  var section = document.getElementById('q-preview-section');
  if(!section){
    var panel = document.getElementById('qmain-result-panel');
    if(panel){ var d=document.createElement('div');d.id='q-preview-section';panel.appendChild(d);section=d; }
  }
  function _esc(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  try{
    var ws = wb.Sheets[sheetName];
    if(!ws){
      if(section) section.innerHTML='<div class="q-preview-empty">선택된 월별 탭 시트를 찾지 못했습니다: '+_esc(sheetName)+'</div>';
      return;
    }

    var ref = ws['!ref'];
    if(!ref){
      if(section) section.innerHTML='<div class="q-preview-empty">선택된 월별 탭에 표시 가능한 범위가 없습니다: '+_esc(sheetName)+'</div>';
      return;
    }

    // 미리보기 범위만 제한적으로 읽는다. 전체 시트 행을 변환하지 않는다.
    var baseRange = XLSX.utils.decode_range(ref);
    var limitedRange = {
      s: { r: baseRange.s.r, c: baseRange.s.c },
      e: { r: Math.min(baseRange.e.r, baseRange.s.r + 80), c: Math.min(baseRange.e.c, baseRange.s.c + 40) }
    };
    var previewRange = XLSX.utils.encode_range(limitedRange);
    var previewRows = XLSX.utils.sheet_to_json(ws, { header:1, defval:'', blankrows:true, range:previewRange });

    // header 후보: 제한 범위의 앞 10행 중 non-empty cell 최다 행
    var scanMax = Math.min(10, previewRows.length);
    var headerIdx=0, maxNE=0;
    for(var h=0;h<scanMax;h++){
      var cnt=(previewRows[h]||[]).filter(function(v){return v!==''&&v!==null&&v!==undefined;}).length;
      if(cnt>maxNE){maxNE=cnt;headerIdx=h;}
    }

    // 데이터 행: headerIdx 이후, 빈 행 제외, 최대 10건
    var dataRows=[];
    for(var r=headerIdx+1;r<previewRows.length&&dataRows.length<10;r++){
      var row=previewRows[r]||[];
      var ne=row.filter(function(v){return v!==''&&v!==null&&v!==undefined;}).length;
      if(ne===0) continue;
      dataRows.push({rowArr:row, excelRow:limitedRange.s.r + r + 1, nonEmpty:ne}); // excelRow: 1-base
    }
    var headerRow = previewRows[headerIdx] || []; // 필드 감지용 — 지역 변수
    previewRows=null; // 지역 해제

    var sheetChip='<span class="q-sheet-month">'+_esc(sheetName)+'</span>';

    if(!dataRows.length){
      if(section) section.innerHTML=
        '<div class="q-panel-hd" style="margin-bottom:6px">📄 월별 탭 Raw 미리보기 — '+sheetChip+'</div>'+
        '<div class="q-preview-empty">선택된 월별 탭에서 미리보기 가능한 데이터 행을 찾지 못했습니다.</div>';
      if(badge){badge.className='q-status-badge q-badge-ok';badge.textContent='미리보기 완료';}
      if(msg) msg.textContent='월별 탭 1개의 앞 10개 데이터 행을 미리보기로 표시했습니다. 확정 매핑과 전체 데이터 생성은 후속 단계에서 진행합니다.';
      return;
    }

    var thCells='<th>#</th><th>Excel Row</th><th>Non-empty</th>';
    for(var c=0;c<12;c++) thCells+='<th>Cell '+(c+1)+'</th>';

    var tbody=dataRows.map(function(dr,i){
      var cells='<td>'+(i+1)+'</td><td>'+dr.excelRow+'</td><td>'+dr.nonEmpty+'</td>';
      for(var c=0;c<12;c++) cells+='<td>'+_esc(dr.rowArr[c])+'</td>';
      return '<tr>'+cells+'</tr>';
    }).join('');

    if(section) section.innerHTML=
      '<div class="q-panel-hd" style="margin:10px 0 6px">📄 월별 탭 Raw 미리보기</div>'+
      '<div class="q-preview-meta">'+
        '미리보기 대상 탭: '+sheetChip+' &nbsp;|&nbsp; '+
        'header 후보 행: <strong>'+(limitedRange.s.r + headerIdx + 1)+'행</strong> (Excel) &nbsp;|&nbsp; '+
        '미리보기 행: <strong>'+dataRows.length+'건</strong> (최대 10건, 전체 row 수는 표시하지 않음)'+
      '</div>'+
      '<div class="q-preview-wrap"><table class="q-preview-table"><thead><tr>'+thCells+'</tr></thead><tbody>'+tbody+'</tbody></table></div>'+
      '<div style="font-size:10px;color:var(--tm);margin-top:6px">※ 컬럼명 매핑과 날짜/호기/모델/CELL/중요도는 후보로 표시합니다. 매핑 검토 후 전체 Raw 데이터 생성으로 진행합니다.</div>'+
      '<div id="q-field-detect-panel" style="margin-top:14px"></div>';

    // 필드 후보 감지 — preview 10건 + headerRow 지역 전달
    var detectResult = qDetectPreviewFieldsOnly(headerRow, dataRows, sheetName);
    qRenderPreviewFieldDetectPanel(detectResult, headerRow, dataRows);

    // 상태 badge 업데이트
    var unresCnt = detectResult ? detectResult.unresolvedCount : 0;
    if(unresCnt > 3){
      if(badge){badge.className='q-status-badge q-badge-err';badge.textContent='필드 후보 검토 필요';}
      if(msg) msg.textContent='일부 필드 후보를 감지하지 못했습니다. 다음 단계에서 기준정보 매핑 또는 수동 보정 UI가 필요합니다.';
    } else {
      if(badge){badge.className='q-status-badge q-badge-ok';badge.textContent='필드 후보 감지 완료';}
      if(msg) msg.textContent='월별 탭 1개 preview 10건 기준으로 필드 후보를 감지했습니다. 확정 매핑은 다음 단계에서 진행하고, 전체 데이터 생성은 후속 단계에서 진행합니다.';
    }

  }catch(err){
    if(badge){badge.className='q-status-badge q-badge-err';badge.textContent='미리보기 실패';}
    if(msg) msg.textContent='미리보기 오류: '+(err.message||'알 수 없는 오류');
    console.error('[Q_REBUILD_08I_DATA_MANAGEMENT_PAGES_PURPOSE_REDESIGN] qRenderRawPreview10Only 오류:', err);
  }
}

function _qAppendNoMonthNotice(){
  var badge=document.getElementById('qmain-status-badge');
  var msg=document.getElementById('qmain-status-msg');
  if(badge){badge.className='q-status-badge q-badge-err';badge.textContent='월별 탭 없음';}
  if(msg) msg.textContent='월별 탭 후보를 찾지 못했습니다. 시트명 구조를 확인하세요.';
  var section=document.getElementById('q-preview-section');
  if(section) section.innerHTML='<div class="q-preview-empty">월별 탭 후보가 없어 미리보기를 생성할 수 없습니다.</div>';
}

// reset — UI + QRAW 메모리 상태 초기화. 이벤트 재바인딩 없음.
function qResetStub(){
  // QRAW 메모리 상태 초기화
  QRAW_WORKBOOK_CACHE = null;
  QRAW_FILE_META      = null;
  QRAW_SHEET_META     = null;
  QRAW_MONTH_SHEETS   = [];
  QRAW_FIELD_MAPPING  = null;
  QRAW_ROWS           = [];
  QRAW_WARNINGS       = [];
  QRAW_GENERATED_AT   = null;
  QRAW_VIEW_PAGE      = 1;
  QRAW_VIEW_PAGE_SIZE = 50;
  QRAW_VIEW_FILTERS   = { sheet:"", severity:"", missingOnly:false };
  // QISSUE 메모리 초기화
  QISSUE_ROWS           = [];
  QISSUE_WARNINGS       = [];
  QISSUE_GENERATED_AT   = null;
  QISSUE_VIEW_PAGE      = 1;
  QISSUE_VIEW_PAGE_SIZE = 50;
  QISSUE_VIEW_FILTERS   = { severity:"", machine:"", model:"", status:"", missingOnly:false, duplicateOnly:false };
  qInvalidateQualityDownstreamStates("manual-reset");
  QNORM_REVIEW_SNAPSHOT   = null;
  QNORM_REVIEW_SELECTIONS = { severity:{}, machine:{}, model:{}, cell:{}, part:{}, categoryLarge:{}, categoryMiddle:{}, categorySmall:{} };
  QNORM_REVIEW_WARNINGS   = [];
  QNORM_REVIEW_APPLIED_AT   = null;
  QISSUE_NORMALIZED_ROWS    = [];
  QISSUE_NORMALIZE_WARNINGS = [];
  QISSUE_NORMALIZE_APPLIED_AT = null;
  QISSUE_NORMALIZE_LOCKED   = false;
  QISSUE_NORMALIZE_META     = null;
  QSUMMARY_SCHEMA           = null;
  QSUMMARY_SCHEMA_REVIEWED  = false;
  QSUMMARY_SCHEMA_WARNINGS  = [];
  QSUMMARY_SCHEMA_APPLIED_AT= null;
  QSUMMARY_DATA             = null;
  QSUMMARY_DATA_WARNINGS    = [];
  QSUMMARY_DATA_GENERATED_AT= null;
  QSUMMARY_DATA_READY       = false;
  QSUMMARY_DATA_META        = null;
  QSUMMARY_VIEW_FILTERS     = { periodLevel:'monthly', dateFrom:'', dateTo:'', sourceMonth:'', severity:'', machine:'', model:'', cell:'', part:'', categoryLarge:'', categoryMiddle:'', categorySmall:'', warningOnly:false, duplicateOnly:false, missingOnly:false, unmappedOnly:false };
  QSUMMARY_FILTER_PREVIEW   = null;
  QSUMMARY_FILTER_WARNINGS  = [];
  QSUMMARY_FILTER_APPLIED_AT= null;
  QDASH_READY_DATA       = null;
  QDASH_READY_WARNINGS   = [];
  QDASH_READY_GENERATED_AT = null;
  QDASH_READY_META       = null;
  QDASH_CHART_BLUEPRINT  = null;
  QDASH_READY_REVIEWED   = false;
  QDASH_CHART_RENDERED   = false;
  QDASH_CHART_RENDERED_AT= null;
  QDASH_CHART_VIEW_MODE  = { periodLevel:'monthly', topLimit:10 };
  QDASH_CHART_WARNINGS   = [];
  // UI 초기화
  var zone=document.getElementById('qmain-upload-zone');
  var fnBar=document.getElementById('qmain-filename-bar');
  var stBar=document.getElementById('qmain-status-bar');
  var res=document.getElementById('qmain-result-panel');
  var badge=document.getElementById('qmain-status-badge');
  var msg=document.getElementById('qmain-status-msg');
  if(zone)  zone.style.display='';
  if(fnBar) fnBar.style.display='none';
  if(stBar) stBar.style.display='none';
  if(res){res.style.display='none';res.innerHTML='';}
  if(badge){badge.className='q-status-badge';badge.textContent='대기';}
  if(msg)  msg.textContent='';
}

// ── qDetectPreviewFieldsOnly(headerRow, dataRows, sheetName) ──
// preview 10건과 header 후보만 기준으로 컬럼 후보를 감지한다.
// 입력은 지역 변수만. 결과는 반환 객체로만. 전역 저장 없음.
function qDetectPreviewFieldsOnly(headerRow, dataRows, sheetName){
  var FIELDS = {
    date:           { patterns: [/날짜|일자|발생일|접수일|등록일|date/i], valTest: function(v){ return /^\d{4}[-./]\d{2}[-./]\d{2}|^\d{2}[-./]\d{2}[-./]\d{2}/.test(String(v)) || (typeof v==='number'&&v>40000&&v<80000); } },
    no:             { patterns: [/^(no\.?|NO\.?|번호|순번|차수|회차)$/i], valTest: null },
    machine:        { patterns: [/호기|장비|설비|machine|equip/i], valTest: null },
    model:          { patterns: [/모델|종류|제품|제품명|model|type/i], valTest: null },
    cell:           { patterns: [/^(CELL|Cell|cell|셀)$/], valTest: null },
    severity:       { patterns: [/중요도|심각도|등급|위험도|severity/i], valTest: function(v){ return /치명|주요|보통|경미|high|medium|low|^[ABCS]$/i.test(String(v)); } },
    part:           { patterns: [/파트|부위|공정|part|process/i], valTest: null },
    categoryLarge:  { patterns: [/대분류|대\s*분류|large/i], valTest: null },
    categoryMiddle: { patterns: [/중분류|중\s*분류|middle/i], valTest: null },
    categorySmall:  { patterns: [/소분류|소\s*분류|small/i], valTest: null },
    text:           { patterns: [/내용|현상|불량내용|불량\s*내용|이슈|문제|조치내용|비고|issue|defect|description/i], valTest: null }
  };

  var colCount = Math.max(headerRow.length, 1);
  var fieldNames = Object.keys(FIELDS);
  var results = {};
  var unresolvedCount = 0;
  var warnings = [];

  fieldNames.forEach(function(fn){
    var best = { columnIndex:null, headerText:'', score:0, confidence:'unresolved', samples:[] };
    var def  = FIELDS[fn];

    for(var ci=0; ci<Math.min(colCount+5, 50); ci++){
      var hText = String(headerRow[ci]===null||headerRow[ci]===undefined?'':headerRow[ci]).trim();
      var score = 0;

      // header 매칭 점수
      def.patterns.forEach(function(pat){ if(pat.test(hText)) score += 60; });
      if(hText && score === 0){
        def.patterns.forEach(function(pat){ var partial = hText.length < 15 && pat.test(hText.split(/[\s\/\-]/)[0]); if(partial) score += 20; });
      }

      // value 패턴 점수
      if(def.valTest){
        var valHits = 0;
        dataRows.forEach(function(dr){ var v = dr.rowArr[ci]; if(v!==''&&v!==null&&v!==undefined&&def.valTest(v)) valHits++; });
        score += Math.round(valHits / Math.max(dataRows.length,1) * 30);
      }

      // non-empty 비율 점수 (부분)
      var neCount = dataRows.filter(function(dr){ var v=dr.rowArr[ci]; return v!==''&&v!==null&&v!==undefined; }).length;
      if(dataRows.length>0) score += Math.round(neCount/dataRows.length*10);

      if(score > best.score){
        var samps = dataRows.map(function(dr){ return dr.rowArr[ci]; }).filter(function(v){ return v!==''&&v!==null&&v!==undefined; }).slice(0,3);
        best = { columnIndex:ci, headerText:hText, score:score, confidence:'unresolved', samples:samps };
      }
    }

    // confidence 산정
    if(best.score >= 60)      best.confidence = 'high';
    else if(best.score >= 30) best.confidence = 'medium';
    else if(best.score >= 10) best.confidence = 'low';
    else { best.confidence = 'unresolved'; best.columnIndex = null; }

    if(best.confidence === 'unresolved'){
      unresolvedCount++;
      warnings.push(fn + ' 필드 후보를 감지하지 못했습니다.');
    }

    results[fn] = best;
  });

  return { sheetName:sheetName, fields:results, unresolvedCount:unresolvedCount, warningMessages:warnings };
}

// ── qBuildPreviewColumnOptionsOnly(headerRow, dataRows) ──
// preview 10건 + header 기준으로 컬럼 select option을 만든다.
// 전역 저장 없음. 반환 배열만 사용.
function qBuildPreviewColumnOptionsOnly(headerRow, dataRows){
  var maxCol = Math.max(
    headerRow.length,
    dataRows.reduce(function(m,dr){ return Math.max(m, dr.rowArr.length); }, 0)
  );
  maxCol = Math.min(maxCol, 30);
  var opts = [];
  for(var ci=0; ci<maxCol; ci++){
    var hText = String(headerRow[ci]===null||headerRow[ci]===undefined?'':headerRow[ci]).trim();
    var samps = dataRows.map(function(dr){
      var v=dr.rowArr[ci]; return (v===null||v===undefined||v==='')?null:String(v);
    }).filter(Boolean).slice(0,2).join(' / ');
    opts.push({
      columnIndex: ci,
      label: 'Col '+(ci+1)+(hText?' — '+hText:' — header 없음'),
      headerText: hText,
      sampleText: samps
    });
  }
  return opts;
}

// ── qRenderPreviewFieldDetectPanel(result, headerRow, dataRows) ──
// 필드 후보 감지 결과 + 매핑 검토 select UI를 표시한다.
// select 변경 시 DOM 상태만 변경. 전역 저장 없음.
function qRenderPreviewFieldDetectPanel(result, headerRow, dataRows){
  var panel = document.getElementById('q-field-detect-panel');
  if(!panel) return;
  if(!result){ panel.innerHTML=''; return; }

  headerRow  = headerRow  || [];
  dataRows   = dataRows   || [];

  function _esc(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var FIELD_LABELS = {
    date:'날짜', no:'차수/번호', machine:'호기', model:'모델/종류', cell:'CELL',
    severity:'중요도', part:'파트/공정', categoryLarge:'대분류',
    categoryMiddle:'중분류', categorySmall:'소분류', text:'불량 내용'
  };

  // 컬럼 option 목록 생성 (지역 변수)
  var colOpts = qBuildPreviewColumnOptionsOnly(headerRow, dataRows);
  var optionsHtml = '<option value="">— 미선택 —</option>' +
    colOpts.map(function(o){
      return '<option value="'+o.columnIndex+'">'+_esc(o.label)+(o.sampleText?' ('+_esc(o.sampleText)+')':'')+'</option>';
    }).join('');

  var rows = Object.keys(result.fields).map(function(fn){
    var f = result.fields[fn];
    var confClass = 'q-field-conf-'+f.confidence;
    var confLabel = {high:'신뢰 높음', medium:'검토 필요', low:'낮은 신뢰', unresolved:'미감지'}[f.confidence]||f.confidence;
    var colLabel  = f.columnIndex !== null ? 'Col '+(f.columnIndex+1) : '—';
    var hdr       = _esc(f.headerText||'—');
    var samps     = f.samples.length
      ? '<span class="q-field-samples">'+f.samples.map(function(s){return _esc(String(s));}).join(' / ')+'</span>'
      : '<span style="color:var(--tm)">—</span>';
    // select — 초기 선택값 = 감지된 columnIndex
    var detectedVal = f.columnIndex !== null ? f.columnIndex : '';
    var selectHtml =
      '<select class="q-field-map-select" data-field="'+fn+'" data-detected-column="'+detectedVal+'" onchange="qOnFieldSelectChange(this)">' +
      optionsHtml.replace('value="'+detectedVal+'"', 'value="'+detectedVal+'" selected') +
      '</select>';
    return '<tr>'+
      '<td>'+_esc(FIELD_LABELS[fn]||fn)+'</td>'+
      '<td>'+colLabel+'</td>'+
      '<td>'+hdr+'</td>'+
      '<td><span class="'+confClass+'">'+confLabel+'</span></td>'+
      '<td>'+f.score+'</td>'+
      '<td>'+samps+'</td>'+
      '<td>'+selectHtml+'</td>'+
    '</tr>';
  }).join('');

  var warnHtml = result.warningMessages.length
    ? '<div class="q-note" style="margin-top:8px">⚠ 미감지 필드: '+result.warningMessages.map(function(w){return _esc(w);}).join(' / ')+'</div>'
    : '';

  panel.innerHTML =
    '<div class="q-panel-hd" style="margin-bottom:4px">🔍 Preview 필드 후보 감지 · 매핑 검토</div>'+
    '<div style="font-size:10px;color:var(--tm);margin-bottom:8px">preview 10건 기준 자동 후보 감지입니다. 우측 "검토 선택"으로 컬럼을 조정한 뒤 [검토 적용]을 누르세요.</div>'+
    '<div class="q-field-review"><div class="q-field-detect"><table class="q-field-table">'+
      '<thead><tr><th>필드</th><th>후보 컬럼</th><th>header 텍스트</th><th>confidence</th><th>score</th><th>샘플 값</th><th>검토 선택</th></tr></thead>'+
      '<tbody>'+rows+'</tbody>'+
    '</table></div></div>'+
    '<div class="q-field-review-actions">'+
      '<button class="q-btn-review-apply" onclick="qApplyPreviewMappingReviewOnly()">✔ 검토 적용</button>'+
      '<button class="q-btn-review-reset" onclick="qResetPreviewMappingReviewOnly()">↩ 자동 후보로 되돌리기</button>'+
    '</div>'+
    '<div id="q-field-review-summary" class="q-field-review-summary" style="display:none"></div>'+
    warnHtml;
}

// ── qOnFieldSelectChange(sel) ────────────────────────
// select 변경 시 DOM 상태만 업데이트. 전역 저장 없음.
function qOnFieldSelectChange(sel){
  // 선택 변경 표시 — 행 강조
  var tr = sel && sel.closest && sel.closest('tr');
  if(tr){ tr.style.background='rgba(99,102,241,.06)'; }
}

// ── qApplyPreviewMappingReviewOnly() ────────────────
// 현재 화면 select 값을 읽어 검토 결과를 요약하고 QRAW_FIELD_MAPPING에 메모리 전용으로 반영한다.
// 브라우저 영구 저장소와 숨김 저장 필드는 사용하지 않는다.
function qApplyPreviewMappingReviewOnly(){
  var badge   = document.getElementById('qmain-status-badge');
  var msg     = document.getElementById('qmain-status-msg');
  var summary = document.getElementById('q-field-review-summary');
  var selects = document.querySelectorAll('.q-field-map-select');

  var selected = {}, unselected = [], dup = [];
  selects.forEach(function(sel){
    var fn  = sel.getAttribute('data-field') || '?';
    var val = sel.value;
    if(!val){
      unselected.push(fn);
    } else {
      if(selected[val]) dup.push(fn+'(Col '+(+val+1)+')');
      selected[val] = fn;
    }
  });

  var totalFields = selects.length;
  var selCount    = totalFields - unselected.length;
  var dupCount    = dup.length;
  var hasDup      = dupCount > 0;

  function _esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var summaryHtml =
    '<div class="q-panel-hd" style="margin-bottom:6px">📋 매핑 검토 결과</div>'+
    '<div class="q-sheet-summary-row">'+
      '<span class="q-sheet-lbl">선택 완료 필드</span><span class="q-sheet-val'+( selCount===totalFields?' q-badge-ok':'')+'">'+ selCount+'개 / '+totalFields+'개</span>'+
      '<span class="q-sheet-lbl">미선택 필드</span><span class="q-sheet-val'+(unselected.length?'' :' q-badge-ok')+'">'+unselected.length+'개</span>'+
      '<span class="q-sheet-lbl">중복 선택</span><span class="q-sheet-val'+(hasDup?' q-badge-err':'')+'">'+dupCount+'건</span>'+
    '</div>'+
    (unselected.length ? '<div class="q-note" style="margin-top:6px">미선택: '+unselected.map(function(f){return _esc(f);}).join(', ')+'</div>' : '')+
    (hasDup ? '<div class="q-field-dup-warning">중복 선택 필드: '+dup.map(function(d){return _esc(d);}).join(', ')+'</div>' : '')+
    '<div style="font-size:10px;color:var(--tm);margin-top:8px">전체 데이터 생성은 버튼 실행 시 진행합니다. 이 결과는 브라우저 메모리 상태에만 임시 반영됩니다.</div>';

  // QRAW_FIELD_MAPPING 저장 — 브라우저 메모리 전용
  var mappingFields = {};
  selects.forEach(function(sel){
    var fn  = sel.getAttribute('data-field') || '?';
    var val = sel.value;
    mappingFields[fn] = val !== '' ? parseInt(val, 10) : null;
  });
  QRAW_FIELD_MAPPING = {
    appliedAt:        new Date().toISOString(),
    fields:           mappingFields,
    duplicateColumns: dup,
    unmappedFields:   unselected
  };

  // Raw 생성 버튼 — 매핑 완료 후 표시
  var rawBtnHtml = (QRAW_WORKBOOK_CACHE && !hasDup)
    ? '<div class="q-raw-actions" style="margin-top:10px"><button class="q-btn-raw-gen" onclick="qGenerateFullRawRowsCore()">▶ 전체 Raw 데이터 생성</button></div>'
    : '';

  if(summary){
    summary.style.display='block';
    summary.innerHTML=summaryHtml + rawBtnHtml;
  }

  if(hasDup){
    if(badge){ badge.className='q-status-badge q-badge-err'; badge.textContent='매핑 검토 필요'; }
    if(msg)   msg.textContent='일부 필드가 같은 컬럼을 선택했습니다. 다음 단계 전 검토가 필요합니다.';
  } else {
    if(badge){ badge.className='q-status-badge q-badge-ok'; badge.textContent='매핑 검토 완료'; }
    if(msg)   msg.textContent='Preview 기준 필드 매핑 검토가 완료되었습니다. 전체 데이터 생성 버튼을 눌러 진행하세요.';
  }
}

// ── qResetPreviewMappingReviewOnly() ────────────────
// select 값을 자동 감지 후보로 되돌리고 적용된 메모리 매핑을 무효화한다.
// 브라우저 영구 저장소는 사용하지 않는다.
function qResetPreviewMappingReviewOnly(){
  var badge   = document.getElementById('qmain-status-badge');
  var msg     = document.getElementById('qmain-status-msg');
  var summary = document.getElementById('q-field-review-summary');
  var selects = document.querySelectorAll('.q-field-map-select');

  selects.forEach(function(sel){
    var detected = sel.getAttribute('data-detected-column');
    sel.value = detected !== null ? detected : '';
    // 행 강조 해제
    var tr = sel.closest && sel.closest('tr');
    if(tr) tr.style.background='';
  });

  QRAW_FIELD_MAPPING = null;
  QRAW_ROWS = [];
  QRAW_WARNINGS = [];
  QRAW_GENERATED_AT = null;

  if(summary){ summary.style.display='none'; summary.innerHTML=''; }
  if(badge){ badge.className='q-status-badge q-badge-ok'; badge.textContent='후보 되돌리기 완료'; }
  if(msg)   msg.textContent='자동 감지 후보로 되돌렸습니다.';
}

// ── qGenerateFullRawRowsCore() ─────────────────────────
// QRAW_WORKBOOK_CACHE, QRAW_MONTH_SHEETS, QRAW_FIELD_MAPPING 사용.
// 생산일정 탭은 순회하지 않고, 이슈 변환/집계 생성은 수행하지 않는다.
function qGenerateFullRawRowsCore(){
  var badge = document.getElementById('qmain-status-badge');
  var msg   = document.getElementById('qmain-status-msg');
  function setStatus(cls, txt, m){
    if(badge){badge.className='q-status-badge '+cls;badge.textContent=txt;}
    if(msg) msg.textContent=m||'';
  }

  if(!QRAW_WORKBOOK_CACHE){
    setStatus('q-badge-err','파일 없음','파일을 먼저 업로드하세요.');
    return;
  }
  if(!QRAW_MONTH_SHEETS || !QRAW_MONTH_SHEETS.length){
    setStatus('q-badge-err','월별 탭 없음','월별 탭 후보가 없어 Raw 데이터를 생성할 수 없습니다.');
    return;
  }
  if(!QRAW_FIELD_MAPPING){
    setStatus('q-badge-err','매핑 필요','Preview 필드 매핑 검토를 먼저 적용하세요.');
    return;
  }
  if(QRAW_FIELD_MAPPING.duplicateColumns && QRAW_FIELD_MAPPING.duplicateColumns.length){
    setStatus('q-badge-err','매핑 검토 필요','중복 선택 필드가 있어 Raw 데이터를 생성할 수 없습니다. 매핑을 다시 검토하세요.');
    return;
  }

  setStatus('','Raw 생성 중','월별 탭 전체에서 Raw 데이터 행을 생성 중입니다...');
  qInvalidateQualityDownstreamStates("raw-regenerated");

  QRAW_ROWS     = [];
  QRAW_WARNINGS = [];
  var mapping   = QRAW_FIELD_MAPPING.fields;
  var RE_SKIP   = /^(생산일정|생산\s일정|[Ss]chedule)$/;
  var rowIdx    = 0;

  try{
    QRAW_MONTH_SHEETS.forEach(function(sn){
      // 생산일정 탭 이중 방어
      var clean = String(sn||'').trim().replace(/^[`'‘’]/, '');
      if(RE_SKIP.test(clean)) return;

      var ws = QRAW_WORKBOOK_CACHE.Sheets[sn];
      if(!ws){
        QRAW_WARNINGS.push({type:'sheet-missing',sheet:sn,message:sn+' 시트를 찾지 못했습니다.'});
        return;
      }

      var ref = ws['!ref'];
      if(!ref){
        QRAW_WARNINGS.push({type:'sheet-empty',sheet:sn,message:sn+' 시트 범위가 없습니다.'});
        return;
      }

      var allRows = XLSX.utils.sheet_to_json(ws, {header:1, defval:'', blankrows:false});

      // header 후보: 앞 10행 중 non-empty 최다 행
      var scanMax = Math.min(10, allRows.length);
      var headerIdx=0, maxNE=0;
      for(var h=0;h<scanMax;h++){
        var c=(allRows[h]||[]).filter(function(v){return v!==''&&v!==null&&v!==undefined;}).length;
        if(c>maxNE){maxNE=c;headerIdx=h;}
      }
      if(maxNE < 2){
        QRAW_WARNINGS.push({type:'header-detect-warning',sheet:sn,message:'header 후보를 안정적으로 찾지 못했습니다.'});
        allRows=null;
        return;
      }

      var normalizedMonth = clean.replace(/\./g,'-');

      // 데이터 행 전체 순회 (완전 빈 행 제외)
      for(var r=headerIdx+1; r<allRows.length; r++){
        var row = allRows[r] || [];
        var ne  = row.filter(function(v){return v!==''&&v!==null&&v!==undefined;}).length;
        if(ne===0) continue;

        function getField(fn){
          var ci = mapping[fn];
          if(ci===null||ci===undefined) return '';
          var v = row[ci];
          return (v===null||v===undefined)?'':String(v).slice(0,300);
        }

        var truncVals = row.map(function(v){
          return (v===null||v===undefined)?'':String(v).slice(0,300);
        });

        // 필드 누락 경고 생성 (Raw 검수용)
        var rowWarnings = [];
        ['date','machine','model','severity','text'].forEach(function(fn){
          var v = getField(fn);
          if(!v){
            var wMsg = fn+' 필드가 비어 있습니다.';
            rowWarnings.push({type:'missing-field', field:fn, message:wMsg});
            QRAW_WARNINGS.push({type:'missing-field', rowKey:'QRAW-'+normalizedMonth+'-'+(r+1)+'-'+rowIdx, sheet:sn, excelRow:r+1, field:fn, message:wMsg});
          }
        });

        QRAW_ROWS.push({
          rowKey:        'QRAW-'+normalizedMonth+'-'+(r+1)+'-'+rowIdx,
          sourceSheet:   sn,
          sourceMonth:   normalizedMonth,
          excelRow:      r+1,
          headerRow:     headerIdx+1,
          nonEmptyCount: ne,
          values:        truncVals,
          fields: {
            date:           getField('date'),
            no:             getField('no'),
            machine:        getField('machine'),
            model:          getField('model'),
            cell:           getField('cell'),
            severity:       getField('severity'),
            part:           getField('part'),
            categoryLarge:  getField('categoryLarge'),
            categoryMiddle: getField('categoryMiddle'),
            categorySmall:  getField('categorySmall'),
            text:           getField('text')
          },
          warnings: rowWarnings
        });
        rowIdx++;
      }
      allRows = null;
    });

    QRAW_GENERATED_AT = new Date().toISOString();
    setStatus('q-badge-ok','Raw 생성 완료','월별 탭 전체에서 Raw 데이터 행을 생성했습니다. 이슈 변환과 분석 집계는 다음 단계에서 진행합니다.');
    qRenderFullRawRowsSummary();

  } catch(err){
    setStatus('q-badge-err','Raw 생성 실패','오류: '+(err.message||'알 수 없는 오류'));
    console.error('[Q_REBUILD_08I_DATA_MANAGEMENT_PAGES_PURPOSE_REDESIGN] qGenerateFullRawRowsCore 오류:', err);
  }
}

// ── qRenderFullRawRowsSummary() ─────────────────────────
// QRAW_ROWS 생성 결과 요약 + preview 50건만 표시.
function qRenderFullRawRowsSummary(){
  var panel = document.getElementById('q-field-review-summary');
  if(!panel) return;
  function _esc(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var meta    = QRAW_SHEET_META || {};
  var fmtSize = QRAW_FILE_META
    ? (QRAW_FILE_META.size>1048576?(QRAW_FILE_META.size/1048576).toFixed(1)+' MB':Math.round(QRAW_FILE_META.size/1024)+' KB')
    : '—';
  var sheetCounts = {};
  QRAW_ROWS.forEach(function(r){ sheetCounts[r.sourceSheet]=(sheetCounts[r.sourceSheet]||0)+1; });
  var sheetCountHtml = Object.keys(sheetCounts).map(function(sn){
    return '<span class="q-sheet-month" style="margin:2px">'+_esc(sn)+': '+sheetCounts[sn]+'건</span>';
  }).join('');

  var oldRaw = panel.querySelector && panel.querySelector('.q-raw-summary');
  if(oldRaw) oldRaw.remove();
  var existingContent = panel.innerHTML;
  panel.innerHTML = existingContent +
    '<div class="q-raw-summary" style="margin-top:14px">'+
      '<div class="q-panel-hd" style="margin-bottom:8px">📦 전체 Raw 데이터 검수</div>'+
      '<div class="q-sheet-summary-row">'+
        '<span class="q-sheet-lbl">파일명</span><span class="q-sheet-val">'+_esc(QRAW_FILE_META?QRAW_FILE_META.name:'—')+'</span>'+
        '<span class="q-sheet-lbl">파일 크기</span><span class="q-sheet-val">'+fmtSize+'</span>'+
        '<span class="q-sheet-lbl">전체 시트 수</span><span class="q-sheet-val">'+(meta.totalSheets||'—')+'개</span>'+
        '<span class="q-sheet-lbl">월별 탭 수</span><span class="q-sheet-val">'+(QRAW_MONTH_SHEETS.length)+'개</span>'+
        '<span class="q-sheet-lbl">Raw 데이터 행 수</span><span class="q-sheet-val q-badge-ok">'+QRAW_ROWS.length+'건</span>'+
        '<span class="q-sheet-lbl">경고</span><span class="q-sheet-val'+(QRAW_WARNINGS.length?'':' q-badge-ok')+'">'+QRAW_WARNINGS.length+'건</span>'+
        '<span class="q-sheet-lbl">생산일정 제외</span><span class="q-sheet-val q-badge-ok">'+(meta.skipSheets?meta.skipSheets.length:0)+'개 탭</span>'+
        '<span class="q-sheet-lbl">생성 완료</span><span class="q-sheet-val">'+(QRAW_GENERATED_AT?QRAW_GENERATED_AT.replace('T',' ').slice(0,19):'—')+'</span>'+
      '</div>'+
      (sheetCountHtml ? '<div style="margin-top:8px"><div class="q-panel-hd">월별 탭별 row 수</div><div class="q-sheet-chip-row">'+sheetCountHtml+'</div></div>' : '')+
      '<div id="q-raw-filterbar-wrap" style="margin-top:12px"></div>'+
      '<div id="q-raw-table-panel" style="margin-top:8px"></div>'+
      '<div id="q-raw-paging-panel" style="margin-top:6px"></div>'+
      '<div id="q-raw-warning-panel" style="margin-top:12px"></div>'+
      '<div class="q-note" style="margin-top:10px">이슈 변환, 분석 집계, 분석 차트는 다음 단계에서 진행합니다.</div>'+
    '</div>';
  // 초기 상태 초기화
  QRAW_VIEW_PAGE = 1;
  QRAW_VIEW_FILTERS = { sheet:'', severity:'', missingOnly:false };
  qRenderRawFilterBar();
  qRenderRawRowsPaged();
  qRenderRawWarningsPanel();
  qRenderRawPagingControls();
  qRenderIssueRulesReviewPanel();
}

function _escR(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function qGetFilteredRawRows(){
  var f = QRAW_VIEW_FILTERS;
  return QRAW_ROWS.filter(function(r){
    if(f.sheet && r.sourceSheet !== f.sheet) return false;
    if(f.severity && r.fields.severity !== f.severity && !String(r.fields.severity).includes(f.severity)) return false;
    if(f.missingOnly && (!r.warnings || r.warnings.length===0)) return false;
    return true;
  });
}

function qRenderRawFilterBar(){
  var wrap = document.getElementById('q-raw-filterbar-wrap');
  if(!wrap) return;
  var sheetOpts = '<option value="">전체 시트</option>'+
    QRAW_MONTH_SHEETS.map(function(sn){return '<option value="'+_escR(sn)+'">'+_escR(sn)+'</option>';}).join('');
  var sevUniq = {};
  QRAW_ROWS.forEach(function(r){ var sv=r.fields.severity; if(sv) sevUniq[sv]=1; });
  var sevOpts = '<option value="">전체 중요도</option>'+
    Object.keys(sevUniq).map(function(sv){return '<option value="'+_escR(sv)+'">'+_escR(sv)+'</option>';}).join('');
  wrap.innerHTML =
    '<div class="q-raw-filterbar">'+
      '<span class="q-panel-hd" style="margin-bottom:0">검수 필터</span>'+
      '<div class="q-raw-filter-item"><select id="q-rf-sheet" onchange="">'+sheetOpts+'</select></div>'+
      '<div class="q-raw-filter-item"><select id="q-rf-severity">'+sevOpts+'</select></div>'+
      '<div class="q-raw-filter-item"><input type="checkbox" id="q-rf-missing"><label for="q-rf-missing" style="cursor:pointer">누락 경고만 보기</label></div>'+
      '<button class="q-btn-filter-apply" onclick="qApplyRawViewFilters()">필터 적용</button>'+
      '<button class="q-btn-filter-reset" onclick="qResetRawViewFilters()">초기화</button>'+
    '</div>';
  // 현재 필터 값 복원
  var sEl=document.getElementById('q-rf-sheet');
  var svEl=document.getElementById('q-rf-severity');
  var mEl=document.getElementById('q-rf-missing');
  if(sEl) sEl.value = QRAW_VIEW_FILTERS.sheet||'';
  if(svEl) svEl.value = QRAW_VIEW_FILTERS.severity||'';
  if(mEl) mEl.checked = !!QRAW_VIEW_FILTERS.missingOnly;
}

function qApplyRawViewFilters(){
  var sEl=document.getElementById('q-rf-sheet');
  var svEl=document.getElementById('q-rf-severity');
  var mEl=document.getElementById('q-rf-missing');
  QRAW_VIEW_FILTERS.sheet      = sEl  ? sEl.value  : '';
  QRAW_VIEW_FILTERS.severity   = svEl ? svEl.value : '';
  QRAW_VIEW_FILTERS.missingOnly= mEl  ? mEl.checked: false;
  QRAW_VIEW_PAGE = 1;
  qRenderRawRowsPaged();
  qRenderRawWarningsPanel();
  qRenderRawPagingControls();
}

function qResetRawViewFilters(){
  QRAW_VIEW_FILTERS = { sheet:'', severity:'', missingOnly:false };
  QRAW_VIEW_PAGE = 1;
  qRenderRawFilterBar();
  qRenderRawRowsPaged();
  qRenderRawWarningsPanel();
  qRenderRawPagingControls();
}

function qRenderRawRowsPaged(){
  var panel = document.getElementById('q-raw-table-panel');
  if(!panel) return;
  var rows  = qGetFilteredRawRows();
  var total = rows.length;
  var ps    = QRAW_VIEW_PAGE_SIZE;
  var maxPg = Math.max(1, Math.ceil(total / ps));
  if(QRAW_VIEW_PAGE > maxPg) QRAW_VIEW_PAGE = maxPg;
  var start = (QRAW_VIEW_PAGE - 1) * ps;
  var page  = rows.slice(start, start + ps);

  if(!page.length){
    panel.innerHTML='<div class="q-raw-empty">조건에 맞는 Raw 데이터가 없습니다.</div>';
    return;
  }
  var thCells = '<th>#</th><th>rowKey</th><th>sheet</th><th>row</th>'+
    '<th>date</th><th>no</th><th>machine</th><th>model</th><th>cell</th>'+
    '<th>severity</th><th>part</th><th>대분류</th><th>중분류</th><th>소분류</th><th>내용</th><th>경고</th>';
  var tbody = page.map(function(r,i){
    var f = r.fields;
    var warnBadge = r.warnings && r.warnings.length
      ? '<span class="q-raw-warn-chip">⚠'+r.warnings.length+'</span>'
      : '';
    return '<tr>'+
      '<td>'+(start+i+1)+'</td><td style="font-size:9px;max-width:100px">'+_escR(r.rowKey)+'</td><td>'+_escR(r.sourceSheet)+'</td><td>'+r.excelRow+'</td>'+
      '<td>'+_escR(f.date)+'</td><td>'+_escR(f.no)+'</td><td>'+_escR(f.machine)+'</td><td>'+_escR(f.model)+'</td><td>'+_escR(f.cell)+'</td>'+
      '<td>'+_escR(f.severity)+'</td><td>'+_escR(f.part)+'</td><td>'+_escR(f.categoryLarge)+'</td><td>'+_escR(f.categoryMiddle)+'</td><td>'+_escR(f.categorySmall)+'</td>'+
      '<td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+_escR(f.text)+'</td>'+
      '<td>'+warnBadge+'</td>'+
    '</tr>';
  }).join('');
  panel.innerHTML='<div class="q-raw-preview"><table class="q-raw-table"><thead><tr>'+thCells+'</tr></thead><tbody>'+tbody+'</tbody></table></div>';
}

function qRenderRawPagingControls(){
  var panel = document.getElementById('q-raw-paging-panel');
  if(!panel) return;
  var rows  = qGetFilteredRawRows();
  var total = rows.length;
  var ps    = QRAW_VIEW_PAGE_SIZE;
  var maxPg = Math.max(1, Math.ceil(total / ps));
  var cur   = Math.min(QRAW_VIEW_PAGE, maxPg);
  panel.innerHTML =
    '<div class="q-raw-paging">'+
      '<button class="q-raw-page-btn" onclick="qRawPrevPage()"'+(cur<=1?' disabled':'')+'>◀ 이전</button>'+
      '<span>'+cur+' / '+maxPg+' 페이지</span>'+
      '<button class="q-raw-page-btn" onclick="qRawNextPage()"'+(cur>=maxPg?' disabled':'')+'>다음 ▶</button>'+
      '<span style="margin-left:8px">전체 필터 결과: '+total+'건 · 페이지당 '+ps+'건</span>'+
    '</div>';
}

function qRawPrevPage(){
  if(QRAW_VIEW_PAGE > 1){ QRAW_VIEW_PAGE--; qRenderRawRowsPaged(); qRenderRawWarningsPanel(); qRenderRawPagingControls(); }
}
function qRawNextPage(){
  var rows=qGetFilteredRawRows();
  var maxPg=Math.max(1,Math.ceil(rows.length/QRAW_VIEW_PAGE_SIZE));
  if(QRAW_VIEW_PAGE < maxPg){ QRAW_VIEW_PAGE++; qRenderRawRowsPaged(); qRenderRawWarningsPanel(); qRenderRawPagingControls(); }
}

function qRenderRawWarningsPanel(){
  var panel = document.getElementById('q-raw-warning-panel');
  if(!panel) return;
  if(!QRAW_WARNINGS.length){ panel.innerHTML=''; return; }
  // 현재 필터 기준 경고 행만 카운트
  var filteredKeys = {};
  qGetFilteredRawRows().forEach(function(r){ filteredKeys[r.rowKey]=1; });
  var filtWarnCount = QRAW_WARNINGS.filter(function(w){ return filteredKeys[w.rowKey]; }).length;
  // 유형별 카운트
  var typeCnt = {};
  QRAW_WARNINGS.forEach(function(w){ typeCnt[w.type]=(typeCnt[w.type]||0)+1; });
  var typeSummary = Object.keys(typeCnt).map(function(t){return _escR(t)+': '+typeCnt[t]+'건';}).join(' / ');
  // 경고 목록 최대 80건 — 현재 필터 기준 rowKey에 해당하는 경고만 표시
  var filteredWarnings = QRAW_WARNINGS.filter(function(w){ return filteredKeys[w.rowKey]; });
  var display = filteredWarnings.slice(0, 80);
  var warnRows = display.map(function(w,i){
    return '<tr>'+
      '<td><span class="q-raw-warn-chip">'+_escR(w.type)+'</span></td>'+
      '<td>'+_escR(w.sheet)+'</td><td>'+w.excelRow+'</td>'+
      '<td>'+_escR(w.field||'—')+'</td><td>'+_escR(w.message)+'</td>'+
      '<td style="font-size:9px;color:var(--tm)">'+_escR(w.rowKey)+'</td>'+
    '</tr>';
  }).join('');
  panel.innerHTML =
    '<div class="q-raw-warning-panel">'+
      '<div class="q-panel-hd" style="margin-bottom:6px">⚠ 파싱 경고</div>'+
      '<div style="font-size:10px;color:var(--tm);margin-bottom:8px">'+
        '전체 경고: <strong>'+QRAW_WARNINGS.length+'건</strong> &nbsp;|&nbsp; 현재 필터 기준: <strong>'+filtWarnCount+'건</strong><br>'+
        '유형별: '+typeSummary+
      '</div>'+
      (filteredWarnings.length>80?'<div style="font-size:10px;color:#f59e0b;margin-bottom:6px">※ 현재 필터 기준 상위 80건만 표시 (필터 결과 '+filteredWarnings.length+'건 / 전체 '+QRAW_WARNINGS.length+'건)</div>':'')+
      '<div class="q-raw-preview" style="max-height:260px;overflow-y:auto"><table class="q-raw-warning-table">'+
        '<thead><tr><th>유형</th><th>시트</th><th>행</th><th>필드</th><th>메시지</th><th>rowKey</th></tr></thead>'+
        '<tbody>'+warnRows+'</tbody>'+
      '</table></div>'+
    '</div>';
}

// qRenderIssueRulesReviewPanel — 규칙 카드 + 사전 점검 버튼 표시
function qRenderIssueRulesReviewPanel(){
  var panel = document.getElementById('q-field-review-summary');
  if(!panel) return;
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var sevRows = Object.keys(QISSUE_RULES.severityNormalize).map(function(lvl){
    return '<tr><td><strong>'+_e(lvl)+'</strong></td><td>'+QISSUE_RULES.severityNormalize[lvl].map(_e).join(', ')+'</td></tr>';
  }).join('');

  var oldPanel = panel.querySelector && panel.querySelector('.q-issue-rules');
  if(oldPanel) oldPanel.remove();

  var div = document.createElement('div');
  div.className = 'q-issue-rules';
  div.innerHTML =
    '<div class="q-panel-hd" style="margin-bottom:8px">📐 이슈 변환 규칙 검토</div>'+
    '<div class="q-issue-rule-card">'+
      '<div style="font-size:11px;font-weight:700;color:var(--ts);margin-bottom:6px">필수 필드</div>'+
      '<div style="font-size:11px;color:var(--tm)">'+QISSUE_RULES.requiredFields.map(function(f){return '<span class="q-sheet-month" style="margin:2px">'+_e(f)+'</span>';}).join('')+'</div>'+
    '</div>'+
    '<div class="q-issue-rule-card">'+
      '<div style="font-size:11px;font-weight:700;color:var(--ts);margin-bottom:6px">선택 필드</div>'+
      '<div style="font-size:11px;color:var(--tm)">'+QISSUE_RULES.optionalFields.map(function(f){return '<span class="q-sheet-other" style="margin:2px">'+_e(f)+'</span>';}).join('')+'</div>'+
    '</div>'+
    '<div class="q-issue-rule-card">'+
      '<div style="font-size:11px;font-weight:700;color:var(--ts);margin-bottom:6px">중요도 정규화 규칙</div>'+
      '<table class="q-issue-rule-table"><thead><tr><th>등급</th><th>인식 값</th></tr></thead><tbody>'+sevRows+'</tbody></table>'+
    '</div>'+
    '<div class="q-issue-rule-card">'+
      '<div style="font-size:11px;font-weight:700;color:var(--ts);margin-bottom:4px">중복 후보 검증 기준</div>'+
      '<div style="font-size:10px;color:var(--tm)">'+QISSUE_RULES.duplicateCheckKeys.map(_e).join(' + ')+'이 모두 같은 행은 중복 후보로 분류합니다.</div>'+
    '</div>'+
    '<button class="q-btn-readiness" onclick="qCheckIssueConversionReadinessOnly()">🔍 이슈 변환 가능성 사전 점검</button>'+
    '<div id="q-issue-readiness-panel" style="margin-top:10px"></div>';
  panel.appendChild(div);
}

// qCheckIssueConversionReadinessOnly — count 계산만. 실제 이슈 데이터 행 생성 없음.
function qCheckIssueConversionReadinessOnly(){
  var badge = document.getElementById('qmain-status-badge');
  var msg   = document.getElementById('qmain-status-msg');

  if(!QRAW_ROWS || !QRAW_ROWS.length){
    var r={totalRawRows:0,requiredMissingRows:0,missingByField:{},duplicateCandidateCount:0,severityMappedCount:0,severityUnmappedCount:0,readyLevel:'blocked',warnings:['Raw 데이터가 없습니다.'],dupList:[]};
    qRenderIssueReadinessResult(r);
    return;
  }

  var totalRawRows = QRAW_ROWS.length;
  var missingByField = {};
  var requiredSet = QISSUE_RULES.requiredFields;

  // 필수 필드 누락 count
  requiredSet.forEach(function(fn){ missingByField[fn]=0; });
  var requiredMissingRows = 0;
  QRAW_ROWS.forEach(function(row){
    var hasMiss = false;
    requiredSet.forEach(function(fn){
      if(!row.fields[fn]){ missingByField[fn]++; hasMiss=true; }
    });
    if(hasMiss) requiredMissingRows++;
  });

  // severity 정규화 count
  var sevMap = QISSUE_RULES.severityNormalize;
  var sevMapped=0, sevUnmapped=0;
  QRAW_ROWS.forEach(function(row){
    var sv = String(row.fields.severity||'').trim();
    if(!sv){ sevUnmapped++; return; }
    var found=false;
    Object.keys(sevMap).forEach(function(lvl){
      if(sevMap[lvl].indexOf(sv)>=0) found=true;
    });
    if(found) sevMapped++; else sevUnmapped++;
  });

  // 중복 후보 count (sourceSheet+excelRow 기준)
  var seenKeys={}, dupSet={};
  QRAW_ROWS.forEach(function(row){
    var k=row.sourceSheet+'::'+row.excelRow;
    if(seenKeys[k]) dupSet[k]=1; else seenKeys[k]=1;
  });
  // machine+model+text 동일 중복 추가
  var mmtSeen={};
  QRAW_ROWS.forEach(function(row){
    var k=[row.fields.machine,row.fields.model,row.fields.text].join('|||');
    if(k.replace(/\|+/g,'').length===0) return;
    if(mmtSeen[k]) dupSet['mmt::'+k]=1; else mmtSeen[k]=1;
  });
  var dupCandidates = Object.keys(dupSet);
  var dupCandidateCount = dupCandidates.length;
  // 중복 목록 최대 30건 (rowKey 형태로 표시)
  var dupList = dupCandidates.slice(0,30);

  var readyLevel = QRAW_ROWS.length===0 ? 'blocked'
    : (requiredMissingRows > totalRawRows * 0.5) ? 'blocked'
    : (requiredMissingRows > 0) ? 'warning'
    : 'ready';

  var warnings = [];
  if(sevUnmapped>0) warnings.push('중요도 미분류 row: '+sevUnmapped+'건');
  if(dupCandidateCount>0) warnings.push('중복 후보: '+dupCandidateCount+'건');

  if(badge){ badge.className='q-status-badge '+(readyLevel==='ready'?'q-badge-ok':readyLevel==='warning'?'':'q-badge-err'); badge.textContent='사전 점검 완료'; }
  if(msg)   msg.textContent='이슈 변환 가능성 사전 점검이 완료되었습니다.';

  qRenderIssueReadinessResult({
    totalRawRows:totalRawRows,
    requiredMissingRows:requiredMissingRows,
    missingByField:missingByField,
    duplicateCandidateCount:dupCandidateCount,
    severityMappedCount:sevMapped,
    severityUnmappedCount:sevUnmapped,
    readyLevel:readyLevel,
    warnings:warnings,
    dupList:dupList
  });
}

// qRenderIssueReadinessResult — 사전 점검 결과 표시. 실제 생성 없음.
function qRenderIssueReadinessResult(result){
  var panel = document.getElementById('q-issue-readiness-panel');
  if(!panel) return;
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var lvlLabel = {ready:'변환 가능', warning:'검토 필요', blocked:'변환 불가'}[result.readyLevel]||result.readyLevel;
  var nextMsg  = {ready:'이슈 데이터 행 생성 단계로 진행 가능합니다.', warning:'일부 필수 필드 누락이 있습니다. 다음 단계 전 검토가 필요합니다.', blocked:'Raw 데이터가 없거나 필수 필드 누락이 과다합니다.'}[result.readyLevel]||'';

  var missingRows = Object.keys(result.missingByField).filter(function(fn){return result.missingByField[fn]>0;}).map(function(fn){
    return '<tr><td>'+_e(fn)+'</td><td style="color:#f59e0b">'+result.missingByField[fn]+'건</td></tr>';
  }).join('');

  var dupHtml = result.dupList && result.dupList.length
    ? '<div class="q-issue-dup-list">'+result.dupList.map(function(k){return '<div style="font-size:9px;padding:1px 4px;border-bottom:1px solid var(--bd)">'+_e(k)+'</div>';}).join('')+
        (result.duplicateCandidateCount>30?'<div style="color:#f59e0b;font-size:9px">외 '+(result.duplicateCandidateCount-30)+'건</div>':'')+'</div>'
    : '';

  panel.innerHTML =
    '<div class="q-issue-readiness">'+
      '<div class="q-panel-hd" style="margin-bottom:8px">📊 이슈 변환 가능성 사전 점검 결과</div>'+
      '<div class="q-sheet-summary-row" style="margin-bottom:10px">'+
        '<span class="q-sheet-lbl">전체 Raw 행</span><span class="q-sheet-val">'+result.totalRawRows+'건</span>'+
        '<span class="q-sheet-lbl">필수 필드 누락 행</span><span class="q-sheet-val'+(result.requiredMissingRows>0?' q-badge-err':'')+'">'+result.requiredMissingRows+'건</span>'+
        '<span class="q-sheet-lbl">중요도 정규화 가능</span><span class="q-sheet-val q-badge-ok">'+result.severityMappedCount+'건</span>'+
        '<span class="q-sheet-lbl">중요도 미분류</span><span class="q-sheet-val'+(result.severityUnmappedCount?'':' q-badge-ok')+'">'+result.severityUnmappedCount+'건</span>'+
        '<span class="q-sheet-lbl">중복 후보</span><span class="q-sheet-val'+(result.duplicateCandidateCount?'':' q-badge-ok')+'">'+result.duplicateCandidateCount+'건</span>'+
        '<span class="q-sheet-lbl">점검 결과</span><span class="q-sheet-val"><span class="q-issue-ready-badge '+result.readyLevel+'">'+_e(lvlLabel)+'</span></span>'+
      '</div>'+
      (missingRows ? '<div class="q-issue-rule-card"><div class="q-panel-hd" style="margin-bottom:4px">필드별 누락 현황</div><table class="q-issue-rule-table"><thead><tr><th>필드</th><th>누락 수</th></tr></thead><tbody>'+missingRows+'</tbody></table></div>' : '')+
      (result.duplicateCandidateCount ? '<div class="q-issue-rule-card"><div class="q-panel-hd" style="margin-bottom:4px">중복 후보 (최대 30건)</div>'+dupHtml+'</div>' : '')+
      (result.warnings.length ? '<div class="q-note" style="margin-top:8px">'+result.warnings.map(_e).join(' / ')+'</div>' : '')+
      '<div style="font-size:11px;margin-top:10px;color:'+(result.readyLevel==='ready'?'#22c55e':result.readyLevel==='warning'?'#f59e0b':'#ef4444')+'">'+_e(nextMsg)+'</div>'+
      (result.readyLevel!=='blocked' ? '<div style="margin-top:10px"><button class="q-btn-readiness" onclick="qBuildIssueRowsCoreWithGate()">▶ 이슈 데이터 행 생성</button></div>' : '')+
    '</div>';
}

function qNormalizeIssueSeverityOnly(value){
  var sv = String(value||'').trim();
  var sevMap = QISSUE_RULES.severityNormalize;
  var LABELS = { critical:'치명', major:'주요', normal:'보통', minor:'경미' };
  for(var lvl in sevMap){
    if(sevMap[lvl].indexOf(sv)>=0)
      return { normalized:lvl, label:LABELS[lvl]||lvl, mapped:true };
  }
  return { normalized:'unmapped', label:'미분류', mapped:false };
}

function qBuildIssueRowsCore(){
  var badge = document.getElementById('qmain-status-badge');
  var msg   = document.getElementById('qmain-status-msg');
  function setS(cls,txt,m){ if(badge){badge.className='q-status-badge '+cls;badge.textContent=txt;} if(msg) msg.textContent=m||''; }

  if(!QRAW_ROWS||!QRAW_ROWS.length){ setS('q-badge-err','데이터 없음','Raw 데이터를 먼저 생성하세요.'); return; }
  if(!QISSUE_RULES){ setS('q-badge-err','규칙 없음','변환 규칙이 없습니다.'); return; }

  QISSUE_ROWS    = [];
  QISSUE_WARNINGS = [];

  // 중복 후보 사전 집계
  var seenSE={}, seenMMT={};
  QRAW_ROWS.forEach(function(r){
    var k1=r.sourceSheet+'::'+r.excelRow;
    if(seenSE[k1]) seenSE[k1]++;  else seenSE[k1]=1;
    var k2=[r.fields.machine,r.fields.model,r.fields.text].join('|||');
    if(k2.replace(/\|+/g,'').length>0){ if(seenMMT[k2]) seenMMT[k2]++; else seenMMT[k2]=1; }
  });

  QRAW_ROWS.forEach(function(rawRow, idx){
    var nm = (rawRow.sourceMonth||'').replace(/\./g,'-');
    var issueKey = 'QISSUE-'+nm+'-'+rawRow.excelRow+'-'+idx;
    var sevResult = qNormalizeIssueSeverityOnly(rawRow.fields.severity);
    var rowWarnings = [];
    var missingReqFields = [];

    // 필수 필드 검증
    QISSUE_RULES.requiredFields.forEach(function(fn){
      if(!rawRow.fields[fn]){
        var wMsg = fn+' 필드가 비어 있습니다.';
        rowWarnings.push({ type:'missing-required-field', field:fn, message:wMsg });
        QISSUE_WARNINGS.push({ type:'missing-required-field', issueKey:issueKey, sourceRawKey:rawRow.rowKey, sourceSheet:rawRow.sourceSheet, excelRow:rawRow.excelRow, field:fn, message:wMsg });
        missingReqFields.push(fn);
      }
    });

    // 중복 후보 검사
    var k1=rawRow.sourceSheet+'::'+rawRow.excelRow;
    var k2=[rawRow.fields.machine,rawRow.fields.model,rawRow.fields.text].join('|||');
    var isDup = (seenSE[k1]>1) || (k2.replace(/\|+/g,'').length>0 && seenMMT[k2]>1);
    if(isDup){
      var dupMsg = '중복 후보로 검출되었습니다.';
      rowWarnings.push({ type:'duplicate-candidate', message:dupMsg });
      QISSUE_WARNINGS.push({ type:'duplicate-candidate', issueKey:issueKey, sourceRawKey:rawRow.rowKey, sourceSheet:rawRow.sourceSheet, excelRow:rawRow.excelRow, field:'', message:dupMsg });
    }

    // conversionStatus 결정
    var hasText    = !!rawRow.fields.text;
    var hasMachine = !!rawRow.fields.machine;
    var convStatus = (!hasText||!hasMachine) ? 'blocked'
      : (missingReqFields.length>0||!sevResult.mapped) ? 'warning'
      : 'ready';

    QISSUE_ROWS.push({
      issueKey:      issueKey,
      sourceRawKey:  rawRow.rowKey,
      sourceSheet:   rawRow.sourceSheet,
      sourceMonth:   rawRow.sourceMonth,
      excelRow:      rawRow.excelRow,
      detectedAt:    new Date().toISOString(),
      fields: {
        date:              rawRow.fields.date,
        no:                rawRow.fields.no,
        machine:           rawRow.fields.machine,
        model:             rawRow.fields.model,
        cell:              rawRow.fields.cell,
        severityRaw:       rawRow.fields.severity,
        severityNormalized: sevResult.normalized,
        part:              rawRow.fields.part,
        categoryLarge:     rawRow.fields.categoryLarge,
        categoryMiddle:    rawRow.fields.categoryMiddle,
        categorySmall:     rawRow.fields.categorySmall,
        text:              rawRow.fields.text
      },
      status: {
        conversionStatus:    convStatus,
        missingRequiredFields: missingReqFields,
        duplicateCandidate:  isDup,
        severityMapped:      sevResult.mapped
      },
      warnings: rowWarnings
    });
  });

  QISSUE_GENERATED_AT = new Date().toISOString();
  setS('q-badge-ok','이슈 데이터 행 생성 완료','Raw 메모리 데이터 전체에서 이슈 데이터 행을 생성했습니다. 분석 집계와 차트는 후속 단계에서 진행합니다.');
  qRenderIssueRowsSummary();
}

function qGetIssueStatusCounts(){
  var cnts={ ready:0, warning:0, blocked:0, dupCnt:0, sevUnmapped:0 };
  QISSUE_ROWS.forEach(function(r){
    cnts[r.status.conversionStatus]=(cnts[r.status.conversionStatus]||0)+1;
    if(r.status.duplicateCandidate) cnts.dupCnt++;
    if(!r.status.severityMapped) cnts.sevUnmapped++;
  });
  return cnts;
}

function qRenderIssueRowsSummary(){
  var panel = document.getElementById('q-issue-readiness-panel');
  if(!panel) return;
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var cnts = qGetIssueStatusCounts();
  var SEV_CLASS = { critical:'q-issue-sev-critical', major:'q-issue-sev-major', normal:'q-issue-sev-normal', minor:'q-issue-sev-minor', unmapped:'q-issue-sev-unmapped' };
  var sevDist={};
  QISSUE_ROWS.forEach(function(r){ var s=r.fields.severityNormalized; sevDist[s]=(sevDist[s]||0)+1; });
  var sevChips = Object.keys(sevDist).map(function(s){
    return '<span class="'+(SEV_CLASS[s]||'q-issue-sev-unmapped')+'">'+_e(s)+': '+sevDist[s]+'</span> ';
  }).join('');

  var oldSum = panel.querySelector && panel.querySelector('.q-issue-summary');
  if(oldSum) oldSum.remove();

  var div = document.createElement('div');
  div.className = 'q-issue-summary';
  div.innerHTML =
    '<div class="q-panel-hd" style="margin-bottom:8px">📋 이슈 데이터 검수</div>'+
    '<div class="q-sheet-summary-row">'+
      '<span class="q-sheet-lbl">전체 이슈 행</span><span class="q-sheet-val q-badge-ok">'+QISSUE_ROWS.length+'건</span>'+
      '<span class="q-sheet-lbl">ready</span><span class="q-sheet-val">'+cnts.ready+'건</span>'+
      '<span class="q-sheet-lbl">warning</span><span class="q-sheet-val">'+(cnts.warning||0)+'건</span>'+
      '<span class="q-sheet-lbl">blocked</span><span class="q-sheet-val'+(cnts.blocked?'':' q-badge-ok')+'">'+(cnts.blocked||0)+'건</span>'+
      '<span class="q-sheet-lbl">중복 후보</span><span class="q-sheet-val">'+cnts.dupCnt+'건</span>'+
      '<span class="q-sheet-lbl">중요도 미분류</span><span class="q-sheet-val">'+cnts.sevUnmapped+'건</span>'+
      '<span class="q-sheet-lbl">생성 완료</span><span class="q-sheet-val">'+(QISSUE_GENERATED_AT?QISSUE_GENERATED_AT.replace('T',' ').slice(0,19):'—')+'</span>'+
    '</div>'+
    '<div style="margin-top:8px"><div class="q-panel-hd" style="margin-bottom:4px">중요도 분포</div>'+sevChips+'</div>'+
    '<div id="q-issue-filterbar-wrap" style="margin-top:10px"></div>'+
    '<div id="q-issue-table-panel" style="margin-top:8px"></div>'+
    '<div id="q-issue-paging-panel" style="margin-top:6px"></div>'+
    '<div id="q-issue-warn-panel" style="margin-top:12px"></div>'+
    '<div class="q-note" style="margin-top:10px">분석 집계, 차트, 대시보드 연결은 다음 단계에서 진행합니다.</div>'+
    '<div class="q-norm-actions" style="margin-top:12px"><button class="q-btn-readiness" onclick="qBuildNormalizeReviewSnapshotOnly()">📐 정규화 검토 시작</button></div>'+
    '<div id="q-norm-review-wrap" style="margin-top:14px"></div>';

  panel.appendChild(div);
  QISSUE_VIEW_PAGE = 1;
  QISSUE_VIEW_FILTERS = { severity:'', machine:'', model:'', status:'', missingOnly:false, duplicateOnly:false };
  qRenderIssueFilterBar();
  qRenderIssueRowsPaged();
  qRenderIssueWarningsPanel();
  qRenderIssuePagingControls();
}

function qRenderIssueWarningsPanel(){
  var panel = document.getElementById('q-issue-warn-panel');
  if(!panel) return;
  if(!QISSUE_WARNINGS.length){ panel.innerHTML=''; return; }
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  // 현재 필터 기준 issueKey set
  var visibleKeys={};
  qGetFilteredIssueRows().forEach(function(r){ visibleKeys[r.issueKey]=1; });
  var filteredWarns = QISSUE_WARNINGS.filter(function(w){ return visibleKeys[w.issueKey]; });
  var typeCnt={};
  filteredWarns.forEach(function(w){ typeCnt[w.type]=(typeCnt[w.type]||0)+1; });
  var typeSum = Object.keys(typeCnt).length
    ? Object.keys(typeCnt).map(function(t){return _e(t)+': '+typeCnt[t]+'건';}).join(' / ')
    : '현재 필터 기준 경고 없음';
  var disp = filteredWarns.slice(0,80);
  var wRows = disp.map(function(w){
    return '<tr>'+
      '<td><span class="q-raw-warn-chip">'+_e(w.type)+'</span></td>'+
      '<td style="font-size:9px">'+_e(w.issueKey)+'</td>'+
      '<td style="font-size:9px">'+_e(w.sourceRawKey)+'</td>'+
      '<td>'+_e(w.sourceSheet)+'</td><td>'+w.excelRow+'</td>'+
      '<td>'+_e(w.field||'—')+'</td><td>'+_e(w.message)+'</td>'+
    '</tr>';
  }).join('');
  panel.innerHTML =
    '<div class="q-issue-warning-panel">'+
      '<div class="q-panel-hd" style="margin-bottom:6px">⚠ 이슈 경고 목록</div>'+
      '<div style="font-size:10px;color:var(--tm);margin-bottom:6px">'+
        '전체 경고: <strong>'+QISSUE_WARNINGS.length+'건</strong> &nbsp;|&nbsp; 현재 필터 기준: <strong>'+filteredWarns.length+'건</strong><br>'+
        '유형별: '+typeSum+
      '</div>'+
      (filteredWarns.length>80?'<div style="font-size:10px;color:#f59e0b;margin-bottom:4px">현재 필터 기준 상위 80건만 표시</div>':'')+
      (disp.length?'<div style="overflow-x:auto;max-height:220px;overflow-y:auto"><table class="q-raw-warning-table">'+
        '<thead><tr><th>유형</th><th>issueKey</th><th>sourceRawKey</th><th>시트</th><th>행</th><th>필드</th><th>메시지</th></tr></thead>'+
        '<tbody>'+wRows+'</tbody>'+
      '</table></div>':'<div style="font-size:11px;color:var(--tm);padding:12px 0">현재 필터 기준 경고 없음</div>')+
    '</div>';
}

function _escI(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function qGetFilteredIssueRows(){
  var f = QISSUE_VIEW_FILTERS;
  return QISSUE_ROWS.filter(function(r){
    if(f.severity && r.fields.severityNormalized !== f.severity && r.fields.severityRaw !== f.severity) return false;
    if(f.machine && !String(r.fields.machine||'').includes(f.machine)) return false;
    if(f.model && !String(r.fields.model||'').includes(f.model)) return false;
    if(f.status && r.status.conversionStatus !== f.status) return false;
    if(f.missingOnly && (!r.status.missingRequiredFields || r.status.missingRequiredFields.length===0)) return false;
    if(f.duplicateOnly && !r.status.duplicateCandidate) return false;
    return true;
  });
}

function qRenderIssueFilterBar(){
  var wrap = document.getElementById('q-issue-filterbar-wrap');
  if(!wrap) return;
  // unique machine / model
  var machines={}, models={};
  QISSUE_ROWS.forEach(function(r){
    if(r.fields.machine) machines[r.fields.machine]=1;
    if(r.fields.model)   models[r.fields.model]=1;
  });
  var mOpts = '<option value="">전체 호기</option>'+Object.keys(machines).map(function(v){return '<option value="'+_escI(v)+'">'+_escI(v)+'</option>';}).join('');
  var mdOpts= '<option value="">전체 모델</option>'+Object.keys(models).map(function(v){return '<option value="'+_escI(v)+'">'+_escI(v)+'</option>';}).join('');
  var SEV_OPTS = ['critical','major','normal','minor','unmapped'].map(function(s){return '<option value="'+s+'">'+s+'</option>';}).join('');
  var ST_OPTS  = ['ready','warning','blocked'].map(function(s){return '<option value="'+s+'">'+s+'</option>';}).join('');

  wrap.innerHTML =
    '<div class="q-issue-filterbar">'+
      '<span class="q-panel-hd" style="margin-bottom:0">검수 필터</span>'+
      '<div class="q-issue-filter-item"><select id="q-if-severity"><option value="">전체 중요도</option>'+SEV_OPTS+'</select></div>'+
      '<div class="q-issue-filter-item"><select id="q-if-machine">'+mOpts+'</select></div>'+
      '<div class="q-issue-filter-item"><select id="q-if-model">'+mdOpts+'</select></div>'+
      '<div class="q-issue-filter-item"><select id="q-if-status"><option value="">전체 상태</option>'+ST_OPTS+'</select></div>'+
      '<div class="q-issue-filter-item"><input type="checkbox" id="q-if-missing"><label for="q-if-missing" style="cursor:pointer">필수 누락만</label></div>'+
      '<div class="q-issue-filter-item"><input type="checkbox" id="q-if-dup"><label for="q-if-dup" style="cursor:pointer">중복 후보만</label></div>'+
      '<button class="q-btn-filter-apply" onclick="qApplyIssueViewFilters()">필터 적용</button>'+
      '<button class="q-btn-filter-reset" onclick="qResetIssueViewFilters()">초기화</button>'+
    '</div>';
  // 현재 필터 값 복원
  var f = QISSUE_VIEW_FILTERS;
  var se=document.getElementById('q-if-severity'), mc=document.getElementById('q-if-machine');
  var md=document.getElementById('q-if-model'),    st=document.getElementById('q-if-status');
  var mi=document.getElementById('q-if-missing'),  dp=document.getElementById('q-if-dup');
  if(se) se.value=f.severity||'';
  if(mc) mc.value=f.machine||'';
  if(md) md.value=f.model||'';
  if(st) st.value=f.status||'';
  if(mi) mi.checked=!!f.missingOnly;
  if(dp) dp.checked=!!f.duplicateOnly;
}

function qApplyIssueViewFilters(){
  var f=QISSUE_VIEW_FILTERS;
  var se=document.getElementById('q-if-severity'), mc=document.getElementById('q-if-machine');
  var md=document.getElementById('q-if-model'),    st=document.getElementById('q-if-status');
  var mi=document.getElementById('q-if-missing'),  dp=document.getElementById('q-if-dup');
  f.severity    = se ? se.value : '';
  f.machine     = mc ? mc.value : '';
  f.model       = md ? md.value : '';
  f.status      = st ? st.value : '';
  f.missingOnly = mi ? mi.checked : false;
  f.duplicateOnly = dp ? dp.checked : false;
  QISSUE_VIEW_PAGE = 1;
  qRenderIssueRowsPaged();
  qRenderIssueWarningsPanel();
  qRenderIssuePagingControls();
}

function qResetIssueViewFilters(){
  QISSUE_VIEW_FILTERS = { severity:'', machine:'', model:'', status:'', missingOnly:false, duplicateOnly:false };
  QISSUE_VIEW_PAGE = 1;
  qRenderIssueFilterBar();
  qRenderIssueRowsPaged();
  qRenderIssueWarningsPanel();
  qRenderIssuePagingControls();
}

function qRenderIssueRowsPaged(){
  var panel = document.getElementById('q-issue-table-panel');
  if(!panel) return;
  var rows  = qGetFilteredIssueRows();
  var total = rows.length;
  var ps    = QISSUE_VIEW_PAGE_SIZE;
  var maxPg = Math.max(1, Math.ceil(total / ps));
  if(QISSUE_VIEW_PAGE > maxPg) QISSUE_VIEW_PAGE = maxPg;
  var start = (QISSUE_VIEW_PAGE - 1) * ps;
  var page  = rows.slice(start, start + ps);

  if(!page.length){
    panel.innerHTML='<div class="q-issue-empty">조건에 맞는 이슈 데이터가 없습니다.</div>';
    return;
  }

  var SEV_CLASS = { critical:'q-issue-sev-critical', major:'q-issue-sev-major', normal:'q-issue-sev-normal', minor:'q-issue-sev-minor', unmapped:'q-issue-sev-unmapped' };
  var STATUS_CLS = {ready:'q-issue-status-ready',warning:'q-issue-status-warning',blocked:'q-issue-status-blocked'};
  var thCells = '<th>#</th><th>issueKey</th><th>sourceRawKey</th><th>sheet</th><th>row</th>'+
    '<th>date</th><th>no</th><th>machine</th><th>model</th><th>cell</th>'+
    '<th>sevRaw</th><th>sevNorm</th><th>part</th><th>대분류</th><th>중분류</th><th>소분류</th>'+
    '<th style="max-width:120px">내용</th><th>상태</th><th>중복</th><th>경고</th>';

  var tbody = page.map(function(r,i){
    var sc=r.status.conversionStatus;
    var dupChip = r.status.duplicateCandidate ? '<span class="q-issue-dup-chip">중복</span>' : '';
    var misChip = (r.status.missingRequiredFields&&r.status.missingRequiredFields.length) ? '<span class="q-issue-missing-chip">누락</span>' : '';
    return '<tr>'+
      '<td>'+(start+i+1)+'</td>'+
      '<td style="font-size:9px;max-width:90px;overflow:hidden;text-overflow:ellipsis">'+_escI(r.issueKey)+'</td>'+
      '<td style="font-size:9px;max-width:80px;overflow:hidden;text-overflow:ellipsis">'+_escI(r.sourceRawKey)+'</td>'+
      '<td>'+_escI(r.sourceSheet)+'</td><td>'+r.excelRow+'</td>'+
      '<td>'+_escI(r.fields.date)+'</td><td>'+_escI(r.fields.no)+'</td>'+
      '<td>'+_escI(r.fields.machine)+'</td><td>'+_escI(r.fields.model)+'</td><td>'+_escI(r.fields.cell)+'</td>'+
      '<td>'+_escI(r.fields.severityRaw)+'</td>'+
      '<td><span class="'+(SEV_CLASS[r.fields.severityNormalized]||'q-issue-sev-unmapped')+'">'+_escI(r.fields.severityNormalized)+'</span></td>'+
      '<td>'+_escI(r.fields.part)+'</td><td>'+_escI(r.fields.categoryLarge)+'</td>'+
      '<td>'+_escI(r.fields.categoryMiddle)+'</td><td>'+_escI(r.fields.categorySmall)+'</td>'+
      '<td style="max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+_escI(r.fields.text)+'</td>'+
      '<td><span class="q-issue-kpi '+STATUS_CLS[sc]+'">'+_escI(sc)+'</span></td>'+
      '<td>'+dupChip+'</td>'+
      '<td>'+misChip+(r.warnings.length?'<span class="q-raw-warn-chip">⚠'+r.warnings.length+'</span>':'')+'</td>'+
    '</tr>';
  }).join('');

  panel.innerHTML='<div style="overflow-x:auto"><table class="q-issue-table"><thead><tr>'+thCells+'</tr></thead><tbody>'+tbody+'</tbody></table></div>';
}

function qRenderIssuePagingControls(){
  var panel = document.getElementById('q-issue-paging-panel');
  if(!panel) return;
  var rows  = qGetFilteredIssueRows();
  var total = rows.length;
  var ps    = QISSUE_VIEW_PAGE_SIZE;
  var maxPg = Math.max(1, Math.ceil(total / ps));
  var cur   = Math.min(QISSUE_VIEW_PAGE, maxPg);
  panel.innerHTML =
    '<div class="q-issue-paging">'+
      '<button class="q-issue-page-btn" onclick="qIssuePrevPage()"'+(cur<=1?' disabled':'')+'>◀ 이전</button>'+
      '<span>'+cur+' / '+maxPg+' 페이지</span>'+
      '<button class="q-issue-page-btn" onclick="qIssueNextPage()"'+(cur>=maxPg?' disabled':'')+'>다음 ▶</button>'+
      '<span style="margin-left:8px">필터 결과: '+total+'건 · 페이지당 '+ps+'건</span>'+
    '</div>';
}

function qIssuePrevPage(){
  if(QISSUE_VIEW_PAGE>1){ QISSUE_VIEW_PAGE--; qRenderIssueRowsPaged(); qRenderIssueWarningsPanel(); qRenderIssuePagingControls(); }
}
function qIssueNextPage(){
  var rows=qGetFilteredIssueRows();
  var maxPg=Math.max(1,Math.ceil(rows.length/QISSUE_VIEW_PAGE_SIZE));
  if(QISSUE_VIEW_PAGE<maxPg){ QISSUE_VIEW_PAGE++; qRenderIssueRowsPaged(); qRenderIssueWarningsPanel(); qRenderIssuePagingControls(); }
}

var _qNormCurrentTab = 'machine'; // 현재 활성 탭

function _escN(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// 정규화 후보 감지 — 공백·대소문자 무시 후 유사값 그룹 감지
function _qNormCandidate(raw){
  if(raw===''||raw===null||raw===undefined) return '';
  var s = String(raw).trim().replace(/\s+/g,' ');
  return s; // snapshot에서 normalizedCandidate 초기값 = 원본 trim
}
function _qIsBlankLike(v){
  var s = String(v||'').trim().toLowerCase();
  return s==='' || s==='기타' || s==='etc' || s==='미분류' || s==='-' || s==='없음' || s==='n/a';
}

function qBuildNormalizeReviewSnapshotOnly(){
  var badge = document.getElementById('qmain-status-badge');
  var msg   = document.getElementById('qmain-status-msg');
  if(!QISSUE_ROWS||!QISSUE_ROWS.length){
    if(badge){badge.className='q-status-badge q-badge-err';badge.textContent='데이터 없음';}
    if(msg) msg.textContent='이슈 데이터를 먼저 생성하세요.';
    return;
  }

  QNORM_REVIEW_WARNINGS = [];
  var NORM_FIELDS = ['severityNormalized','machine','model','cell','part','categoryLarge','categoryMiddle','categorySmall'];
  var FIELD_MAP = { severityNormalized:'severity', machine:'machine', model:'model', cell:'cell', part:'part', categoryLarge:'categoryLarge', categoryMiddle:'categoryMiddle', categorySmall:'categorySmall' };

  var fields = {};
  NORM_FIELDS.forEach(function(fn){
    var counts = {}, blank = 0;
    QISSUE_ROWS.forEach(function(r){
      var v = String(r.fields[fn]===null||r.fields[fn]===undefined?'':r.fields[fn]);
      if(_qIsBlankLike(v)){ blank++; }
      counts[v] = (counts[v]||0)+1;
    });
    var vals = Object.keys(counts).map(function(v){
      var isBlankV = _qIsBlankLike(v);
      return {
        value: v,
        count: counts[v],
        normalizedCandidate: _qNormCandidate(v),
        warning: isBlankV ? '빈 값 / 미분류 후보' : ''
      };
    }).sort(function(a,b){ return b.count-a.count; });

    // 유사값 후보 감지 (trim+lowercase 기준 동일 그룹)
    var normGroups = {};
    vals.forEach(function(item){
      var key = item.value.trim().toLowerCase().replace(/[\s\-_]+/g,' ');
      if(!normGroups[key]) normGroups[key]=[];
      normGroups[key].push(item.value);
    });
    vals.forEach(function(item){
      var key = item.value.trim().toLowerCase().replace(/[\s\-_]+/g,' ');
      var grp = normGroups[key];
      if(grp&&grp.length>1&&item.value!==grp[0])
        item.warning = (item.warning?item.warning+' / ':'')+'유사값 후보 그룹';
    });

    if(blank>0) QNORM_REVIEW_WARNINGS.push({ field:FIELD_MAP[fn], type:'blank-like', count:blank, message:fn+' 필드에 빈 값/미분류 '+blank+'건' });

    fields[FIELD_MAP[fn]] = {
      totalDistinct: Object.keys(counts).length,
      blankCount:    blank,
      values:        vals
    };
  });

  QNORM_REVIEW_SNAPSHOT = {
    generatedAt: new Date().toISOString(),
    totalIssueRows: QISSUE_ROWS.length,
    fields: fields
  };

  if(badge){badge.className='q-status-badge q-badge-ok';badge.textContent='정규화 검토 준비 완료';}
  if(msg) msg.textContent='정규화 검토 snapshot이 생성되었습니다. 각 필드 탭을 선택해 검토하세요.';
  qRenderNormalizeReviewPanel();
}

function qSwitchNormTab(btn){
  _qNormCurrentTab = btn.getAttribute('data-fk') || 'machine';
  qRenderNormalizeReviewPanel();
}

function qRenderNormalizeReviewPanel(){
  var wrap = document.getElementById('q-norm-review-wrap');
  if(!wrap) return;
  if(!QNORM_REVIEW_SNAPSHOT){ wrap.innerHTML='<div class="q-norm-empty">정규화 검토 시작 버튼을 눌러 snapshot을 생성하세요.</div>'; return; }

  var sn = QNORM_REVIEW_SNAPSHOT;
  var fieldLabels = { severity:'중요도', machine:'호기', model:'모델', cell:'CELL', part:'파트', categoryLarge:'대분류', categoryMiddle:'중분류', categorySmall:'소분류' };
  var fieldKeys   = Object.keys(fieldLabels);

  // 요약 카드
  var totalBlank  = QNORM_REVIEW_WARNINGS.length;
  var distinctSum = fieldKeys.reduce(function(s,k){ return s+(sn.fields[k]?sn.fields[k].totalDistinct:0); },0);
  var summaryHtml =
    '<div class="q-norm-summary">'+
      '<div class="q-panel-hd" style="margin-bottom:6px">📋 정규화 검토 요약</div>'+
      '<div class="q-sheet-summary-row">'+
        '<span class="q-sheet-lbl">전체 이슈 행</span><span class="q-sheet-val">'+sn.totalIssueRows+'건</span>'+
        '<span class="q-sheet-lbl">검토 대상 필드</span><span class="q-sheet-val">'+fieldKeys.length+'개</span>'+
        '<span class="q-sheet-lbl">총 distinct 값</span><span class="q-sheet-val">'+distinctSum+'개</span>'+
        '<span class="q-sheet-lbl">빈 값/미분류 경고</span><span class="q-sheet-val'+(totalBlank?'':' q-badge-ok')+'">'+totalBlank+'건</span>'+
      '</div>'+
    '</div>';

  // 탭
  var tabsHtml = fieldKeys.map(function(k){
    return '<button class="q-norm-tab'+(k===_qNormCurrentTab?' active':'')+'" data-fk="'+_escN(k)+'" onclick="qSwitchNormTab(this)">'+_escN(fieldLabels[k])+'</button>';
  }).join('');

  // 액션
  var actionsHtml =
    '<div class="q-norm-actions" style="margin-top:10px">'+
      '<button class="q-btn-readiness" onclick="qApplyNormalizeReviewOnly()">✔ 정규화 검토 적용</button>'+
      '<button class="q-btn-filter-reset" onclick="qResetNormalizeReviewOnly()">↩ 검토 선택 초기화</button>'+
    '</div>';

  wrap.innerHTML =
    '<div class="q-norm-review">'+
      '<div class="q-panel-hd" style="margin-bottom:8px">📐 정규화 검토</div>'+
      summaryHtml+
      '<div class="q-norm-tabs">'+tabsHtml+'</div>'+
      '<div id="q-norm-field-panel"></div>'+
      '<div id="q-norm-review-summary" style="margin-top:10px"></div>'+
      actionsHtml+
    '</div>';

  qRenderNormalizeFieldTab(_qNormCurrentTab);
  qRenderNormalizeReviewSummaryOnly();
}

function qRenderNormalizeFieldTab(fieldKey){
  var panel = document.getElementById('q-norm-field-panel');
  if(!panel) return;
  if(!QNORM_REVIEW_SNAPSHOT){ panel.innerHTML=''; return; }
  var fieldData = QNORM_REVIEW_SNAPSHOT.fields[fieldKey];
  if(!fieldData){ panel.innerHTML='<div class="q-norm-empty">데이터 없음</div>'; return; }

  var vals = fieldData.values.slice(0, 200);
  var over = fieldData.values.length > 200;
  var sel  = QNORM_REVIEW_SELECTIONS[fieldKey] || {};

  var tRows = vals.map(function(item){
    var cur = sel[item.value] !== undefined ? sel[item.value] : item.normalizedCandidate;
    var warnBadge = item.warning ? '<span class="q-norm-chip q-norm-warning">⚠ '+_escN(item.warning)+'</span>' : '';
    return '<tr>'+
      '<td>'+_escN(item.value)+'</td>'+
      '<td>'+item.count+'</td>'+
      '<td>'+_escN(item.normalizedCandidate)+'</td>'+
      '<td>'+warnBadge+'</td>'+
      '<td><input class="q-norm-input" type="text" data-field="'+_escN(fieldKey)+'" data-value="'+_escN(item.value)+'" value="'+_escN(cur)+'" onchange="qNormInputChange(this)"></td>'+
    '</tr>';
  }).join('');

  panel.innerHTML =
    '<div style="overflow-x:auto">'+
      (over?'<div style="font-size:10px;color:#f59e0b;margin-bottom:6px">상위 200개만 표시 (전체 '+fieldData.values.length+'개)</div>':'')+
      '<table class="q-norm-table">'+
        '<thead><tr><th>원본 값</th><th>건수</th><th>정규화 후보</th><th>경고</th><th>검토 선택</th></tr></thead>'+
        '<tbody>'+tRows+'</tbody>'+
      '</table>'+
    '</div>';
}

function qNormInputChange(el){
  var fk  = el.getAttribute('data-field');
  var raw = el.getAttribute('data-value');
  var nv  = el.value;
  qOnNormalizeSelectionChange(fk, raw, nv);
}

function qOnNormalizeSelectionChange(fieldKey, rawValue, newValue){
  if(!QNORM_REVIEW_SELECTIONS[fieldKey]) QNORM_REVIEW_SELECTIONS[fieldKey] = {};
  QNORM_REVIEW_SELECTIONS[fieldKey][rawValue] = newValue;
  qRenderNormalizeReviewSummaryOnly();
}

function qRenderNormalizeReviewSummaryOnly(){
  var panel = document.getElementById('q-norm-review-summary');
  if(!panel) return;
  var changedFields=0, changedVals=0;
  Object.keys(QNORM_REVIEW_SELECTIONS).forEach(function(fk){
    var entries = Object.keys(QNORM_REVIEW_SELECTIONS[fk]);
    if(entries.length){ changedFields++; changedVals+=entries.length; }
  });
  var blankHints = QNORM_REVIEW_WARNINGS.length;
  panel.innerHTML =
    '<div style="font-size:11px;color:var(--tm)">'+
      '변경 선택 필드: <strong>'+changedFields+'개</strong> &nbsp;|&nbsp; '+
      '변경 값 수: <strong>'+changedVals+'개</strong> &nbsp;|&nbsp; '+
      '빈 값/미분류 처리 후보: <strong>'+blankHints+'건</strong>'+
    '</div>'+
    '<div style="font-size:10px;color:var(--tm);margin-top:4px">정규화 검토 결과는 메모리 상태에만 반영되었습니다. 이슈 데이터 행 원본 반영과 분석 집계 생성은 후속 단계에서 진행합니다.</div>';
  if(QNORM_REVIEW_APPLIED_AT){
    panel.innerHTML+='<div style="font-size:10px;color:#22c55e;margin-top:4px">검토 적용 완료: '+QNORM_REVIEW_APPLIED_AT.replace('T',' ').slice(0,19)+'</div>';
  }
}

function qApplyNormalizeReviewOnly(){
  var badge = document.getElementById('qmain-status-badge');
  var msg   = document.getElementById('qmain-status-msg');
  QNORM_REVIEW_APPLIED_AT = new Date().toISOString();
  qRenderNormalizeReviewSummaryOnly();
  if(badge){badge.className='q-status-badge q-badge-ok';badge.textContent='정규화 검토 완료';}
  if(msg) msg.textContent='정규화 검토 선택이 완료되었습니다. 원본 반영과 분석 집계 생성은 후속 단계에서 진행합니다.';
  msg.textContent = msg.textContent;
}

function qResetNormalizeReviewOnly(){
  var msg = document.getElementById('qmain-status-msg');
  QNORM_REVIEW_SELECTIONS    = { severity:{}, machine:{}, model:{}, cell:{}, part:{}, categoryLarge:{}, categoryMiddle:{}, categorySmall:{} };
  QNORM_REVIEW_APPLIED_AT    = null;
  QISSUE_NORMALIZED_ROWS     = [];
  QISSUE_NORMALIZE_WARNINGS  = [];
  QISSUE_NORMALIZE_APPLIED_AT= null;
  QISSUE_NORMALIZE_LOCKED    = false;
  QISSUE_NORMALIZE_META      = null;
  qRenderNormalizeReviewPanel();
  if(msg) msg.textContent='정규화 검토 선택을 초기화했습니다. 잠금본도 함께 해제되었습니다.';
}

function _isBlankLikeNorm(v){
  var s=String(v||'').trim().toLowerCase();
  return s===''||s==='기타'||s==='etc'||s==='미분류'||s==='-'||s==='없음'||s==='n/a';
}

function qGetNormalizedValueFromReviewOnly(fieldKey, rawValue, fallbackValue){
  var selMap = QNORM_REVIEW_SELECTIONS[fieldKey];
  if(selMap && selMap[rawValue] !== undefined){
    var sv = selMap[rawValue];
    return sv !== '' ? sv : (fallbackValue || '');
  }
  return fallbackValue || '';
}

function qApplyNormalizeToIssueRowsLockOnly(){
  var badge = document.getElementById('qmain-status-badge');
  var msg   = document.getElementById('qmain-status-msg');
  function setS(cls,txt,m){ if(badge){badge.className='q-status-badge '+cls;badge.textContent=txt;} if(msg) msg.textContent=m||''; }

  if(!QISSUE_ROWS||!QISSUE_ROWS.length){ setS('q-badge-err','데이터 없음','이슈 데이터를 먼저 생성하세요.'); return; }
  if(!QNORM_REVIEW_SNAPSHOT){ setS('q-badge-err','정규화 검토 없음','정규화 검토를 먼저 실행하세요.'); return; }

  QISSUE_NORMALIZED_ROWS    = [];
  QISSUE_NORMALIZE_WARNINGS = [];
  var now = new Date().toISOString();

  var SEV_FIELDS   = ['severity','machine','model','cell','part','categoryLarge','categoryMiddle','categorySmall'];
  var ISSUE_FIELD_MAP = { severity:'severityNormalized', machine:'machine', model:'model', cell:'cell', part:'part', categoryLarge:'categoryLarge', categoryMiddle:'categoryMiddle', categorySmall:'categorySmall' };

  // 정규화된 필드 distinct count용
  var distCounts = {};
  SEV_FIELDS.forEach(function(fk){ distCounts[fk]={}; });

  QISSUE_ROWS.forEach(function(origRow, idx){
    // 새 객체로 복사 (원본 mutate 없음)
    var normFields = {};
    SEV_FIELDS.forEach(function(fk){
      var raw = origRow.fields[ISSUE_FIELD_MAP[fk]] || '';
      var nv  = qGetNormalizedValueFromReviewOnly(fk, raw, raw);
      normFields[fk] = nv;
      if(nv) distCounts[fk][nv]=(distCounts[fk][nv]||0)+1;
    });

    var rowWarns = [];
    var normWarnFlag = false;

    // warning 기준 검사
    if(!normFields.machine){ var wm={type:'blank-normalized',issueKey:origRow.issueKey,sourceRawKey:origRow.sourceRawKey,sourceSheet:origRow.sourceSheet,excelRow:origRow.excelRow,field:'machine',value:normFields.machine,message:'정규화 후 machine 필드가 비어 있습니다.'}; QISSUE_NORMALIZE_WARNINGS.push(wm); rowWarns.push('machine 누락'); normWarnFlag=true; }
    if(!normFields.model){ var wmd={type:'blank-normalized',issueKey:origRow.issueKey,sourceRawKey:origRow.sourceRawKey,sourceSheet:origRow.sourceSheet,excelRow:origRow.excelRow,field:'model',value:normFields.model,message:'정규화 후 model 필드가 비어 있습니다.'}; QISSUE_NORMALIZE_WARNINGS.push(wmd); rowWarns.push('model 누락'); normWarnFlag=true; }
    if(normFields.severity==='unmapped'||_isBlankLikeNorm(normFields.severity)){ var wsv={type:'unmapped-severity',issueKey:origRow.issueKey,sourceRawKey:origRow.sourceRawKey,sourceSheet:origRow.sourceSheet,excelRow:origRow.excelRow,field:'severity',value:normFields.severity,message:'중요도 미분류 또는 빈 값입니다.'}; QISSUE_NORMALIZE_WARNINGS.push(wsv); rowWarns.push('severity 미분류'); normWarnFlag=true; }
    ['categoryLarge','categoryMiddle','categorySmall'].forEach(function(cfn){
      if(_isBlankLikeNorm(normFields[cfn])){ var wc={type:'blank-category',issueKey:origRow.issueKey,sourceRawKey:origRow.sourceRawKey,sourceSheet:origRow.sourceSheet,excelRow:origRow.excelRow,field:cfn,value:normFields[cfn],message:cfn+' 필드가 미분류/빈 값입니다.'}; QISSUE_NORMALIZE_WARNINGS.push(wc); rowWarns.push(cfn+' 미분류'); normWarnFlag=true; }
    });

    QISSUE_NORMALIZED_ROWS.push({
      issueKey:     origRow.issueKey,
      sourceRawKey: origRow.sourceRawKey,
      sourceSheet:  origRow.sourceSheet,
      sourceMonth:  origRow.sourceMonth,
      excelRow:     origRow.excelRow,
      detectedAt:   origRow.detectedAt,
      normalizedAt: now,
      fields: Object.assign({}, origRow.fields),   // 원본 fields 복사
      normalizedFields: normFields,
      status: Object.assign({}, origRow.status, { normalizationApplied:true, normalizationWarning:normWarnFlag }),
      warnings: (origRow.warnings||[]).concat(rowWarns.length?[{type:'normalize-warning',message:rowWarns.join(', ')}]:[])
    });
  });

  // 변경 선택 count
  var changedSel=0;
  Object.keys(QNORM_REVIEW_SELECTIONS).forEach(function(fk){ changedSel+=Object.keys(QNORM_REVIEW_SELECTIONS[fk]).length; });
  // 빈 값 후보 count
  var blankCnt = QNORM_REVIEW_WARNINGS.length;
  // severity unmapped
  var sevUnmapped=QISSUE_NORMALIZE_WARNINGS.filter(function(w){return w.type==='unmapped-severity';}).length;

  QISSUE_NORMALIZE_APPLIED_AT = now;
  QISSUE_NORMALIZE_LOCKED     = true;
  QISSUE_NORMALIZE_META = {
    sourceIssueRows:      QISSUE_ROWS.length,
    normalizedRows:       QISSUE_NORMALIZED_ROWS.length,
    warningCount:         QISSUE_NORMALIZE_WARNINGS.length,
    appliedAt:            now,
    locked:               true,
    changedSelectionCount: changedSel,
    blankCandidateCount:  blankCnt,
    unmappedSeverityCount: sevUnmapped,
    fieldDistinctCounts:  { severity:Object.keys(distCounts.severity).length, machine:Object.keys(distCounts.machine).length, model:Object.keys(distCounts.model).length, cell:Object.keys(distCounts.cell).length, part:Object.keys(distCounts.part).length, categoryLarge:Object.keys(distCounts.categoryLarge).length, categoryMiddle:Object.keys(distCounts.categoryMiddle).length, categorySmall:Object.keys(distCounts.categorySmall).length }
  };

  setS('q-badge-ok','잠금본 생성 완료','정규화 잠금본이 생성되었습니다. 원본 이슈 데이터 행은 변경되지 않았습니다.');
  qRenderNormalizeReviewSummaryOnly();
  qRenderNormalizedIssueLockSummary();
}

function qRenderNormalizedIssueLockSummary(){
  var wrap = document.getElementById('q-normalized-lock-wrap');
  if(!wrap) return;
  if(!QISSUE_NORMALIZE_LOCKED||!QISSUE_NORMALIZE_META){ wrap.innerHTML=''; return; }
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var m = QISSUE_NORMALIZE_META;
  var SEV_CLASS = { critical:'q-issue-sev-critical', major:'q-issue-sev-major', normal:'q-issue-sev-normal', minor:'q-issue-sev-minor', unmapped:'q-issue-sev-unmapped' };

  var preview = QISSUE_NORMALIZED_ROWS.slice(0,50);
  var thCells = '<th>#</th><th>issueKey</th><th>sheet</th><th>row</th>'+
    '<th>date</th><th>machine</th><th>model</th><th>cell</th>'+
    '<th>severity</th><th>part</th><th>대분류</th><th>중분류</th><th>소분류</th>'+
    '<th style="max-width:120px">내용</th><th>경고</th>';
  var tbody = preview.map(function(r,i){
    var nf=r.normalizedFields;
    var wChip = r.status.normalizationWarning ? '<span class="q-normalized-chip">⚠</span>' : '';
    return '<tr>'+
      '<td>'+(i+1)+'</td>'+
      '<td style="font-size:9px;max-width:90px;overflow:hidden;text-overflow:ellipsis">'+_e(r.issueKey)+'</td>'+
      '<td>'+_e(r.sourceSheet)+'</td><td>'+r.excelRow+'</td>'+
      '<td>'+_e(r.fields.date)+'</td><td>'+_e(nf.machine)+'</td>'+
      '<td>'+_e(nf.model)+'</td><td>'+_e(nf.cell)+'</td>'+
      '<td><span class="'+(SEV_CLASS[nf.severity]||'q-issue-sev-unmapped')+'">'+_e(nf.severity)+'</span></td>'+
      '<td>'+_e(nf.part)+'</td><td>'+_e(nf.categoryLarge)+'</td>'+
      '<td>'+_e(nf.categoryMiddle)+'</td><td>'+_e(nf.categorySmall)+'</td>'+
      '<td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+_e(r.fields.text)+'</td>'+
      '<td>'+wChip+'</td>'+
    '</tr>';
  }).join('');

  var distHtml = Object.keys(m.fieldDistinctCounts).map(function(fk){
    return '<span class="q-sheet-month" style="margin:2px">'+_e(fk)+': '+m.fieldDistinctCounts[fk]+'종</span>';
  }).join('');

  wrap.innerHTML =
    '<div class="q-normalized-lock">'+
      '<div class="q-panel-hd" style="margin-bottom:8px">🔒 정규화 잠금본 생성 결과</div>'+
      '<div class="q-normalized-summary">'+
        '<div class="q-sheet-summary-row">'+
          '<span class="q-sheet-lbl">원본 이슈 행</span><span class="q-sheet-val">'+m.sourceIssueRows+'건</span>'+
          '<span class="q-sheet-lbl">잠금본 행</span><span class="q-sheet-val q-badge-ok">'+m.normalizedRows+'건</span>'+
          '<span class="q-sheet-lbl">정규화 경고</span><span class="q-sheet-val'+(m.warningCount?'':' q-badge-ok')+'">'+m.warningCount+'건</span>'+
          '<span class="q-sheet-lbl">변경 선택 수</span><span class="q-sheet-val">'+m.changedSelectionCount+'개</span>'+
          '<span class="q-sheet-lbl">severity 미분류</span><span class="q-sheet-val'+(m.unmappedSeverityCount?'':' q-badge-ok')+'">'+m.unmappedSeverityCount+'건</span>'+
          '<span class="q-sheet-lbl">상태</span><span class="q-sheet-val"><span class="q-normalized-locked">잠금</span></span>'+
          '<span class="q-sheet-lbl">적용 시간</span><span class="q-sheet-val">'+m.appliedAt.replace('T',' ').slice(0,19)+'</span>'+
        '</div>'+
        '<div style="margin-top:8px"><div class="q-panel-hd" style="margin-bottom:4px">필드별 distinct 수</div>'+distHtml+'</div>'+
      '</div>'+
      '<div id="q-normalized-warning-panel" style="margin-top:8px"></div>'+
      '<div class="q-panel-hd" style="margin-top:12px">정규화 잠금본 미리보기 (최대 50건)</div>'+
      '<div style="overflow-x:auto"><table class="q-normalized-table"><thead><tr>'+thCells+'</tr></thead><tbody>'+tbody+'</tbody></table></div>'+
      (QISSUE_NORMALIZED_ROWS.length>50?'<div style="font-size:10px;color:var(--tm);margin-top:4px">※ 상위 50건만 표시. 전체 '+QISSUE_NORMALIZED_ROWS.length+'건. 페이지네이션은 분석 집계 준비 단계에서 구현합니다.</div>':'')+
      '<div class="q-note" style="margin-top:10px">원본 이슈 데이터 행(QISSUE_ROWS)은 변경되지 않았습니다. 분석 집계 준비는 후속 단계에서 진행합니다.</div>'+
    '</div>';

  qRenderNormalizeWarningsPanelOnly();
}

function qRenderNormalizeWarningsPanelOnly(){
  var panel = document.getElementById('q-normalized-warning-panel');
  if(!panel) return;
  if(!QISSUE_NORMALIZE_WARNINGS.length){ panel.innerHTML=''; return; }
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var disp = QISSUE_NORMALIZE_WARNINGS.slice(0,80);
  var wRows = disp.map(function(w){
    return '<tr>'+
      '<td><span class="q-raw-warn-chip">'+_e(w.type)+'</span></td>'+
      '<td style="font-size:9px">'+_e(w.issueKey)+'</td>'+
      '<td style="font-size:9px">'+_e(w.sourceRawKey)+'</td>'+
      '<td>'+_e(w.sourceSheet)+'</td><td>'+w.excelRow+'</td>'+
      '<td>'+_e(w.field)+'</td><td>'+_e(w.value)+'</td><td>'+_e(w.message)+'</td>'+
    '</tr>';
  }).join('');
  panel.innerHTML =
    '<div class="q-normalized-warning">'+
      '<div class="q-panel-hd" style="margin-bottom:6px">⚠ 정규화 경고 목록</div>'+
      '<div style="font-size:10px;color:var(--tm);margin-bottom:6px">전체: '+QISSUE_NORMALIZE_WARNINGS.length+'건'+
        (QISSUE_NORMALIZE_WARNINGS.length>80?' (상위 80건만 표시)':'')+
      '</div>'+
      '<div style="overflow-x:auto;max-height:200px;overflow-y:auto"><table class="q-raw-warning-table">'+
        '<thead><tr><th>유형</th><th>issueKey</th><th>sourceRawKey</th><th>시트</th><th>행</th><th>필드</th><th>값</th><th>메시지</th></tr></thead>'+
        '<tbody>'+wRows+'</tbody>'+
      '</table></div>'+
    '</div>';
}

function qUnlockNormalizeApplyOnly(){
  var msg = document.getElementById('qmain-status-msg');
  QISSUE_NORMALIZED_ROWS    = [];
  QISSUE_NORMALIZE_WARNINGS = [];
  QISSUE_NORMALIZE_APPLIED_AT = null;
  QISSUE_NORMALIZE_LOCKED   = false;
  QISSUE_NORMALIZE_META     = null;
  QSUMMARY_SCHEMA           = null;
  QSUMMARY_SCHEMA_REVIEWED  = false;
  QSUMMARY_SCHEMA_WARNINGS  = [];
  QSUMMARY_SCHEMA_APPLIED_AT= null;
  QSUMMARY_DATA             = null;
  QSUMMARY_DATA_WARNINGS    = [];
  QSUMMARY_DATA_GENERATED_AT= null;
  QSUMMARY_DATA_READY       = false;
  QSUMMARY_DATA_META        = null;
  QSUMMARY_VIEW_FILTERS     = { periodLevel:'monthly', dateFrom:'', dateTo:'', sourceMonth:'', severity:'', machine:'', model:'', cell:'', part:'', categoryLarge:'', categoryMiddle:'', categorySmall:'', warningOnly:false, duplicateOnly:false, missingOnly:false, unmappedOnly:false };
  QSUMMARY_FILTER_PREVIEW   = null;
  QSUMMARY_FILTER_WARNINGS  = [];
  QSUMMARY_FILTER_APPLIED_AT= null;
  qRenderNormalizeReviewSummaryOnly();
  if(msg) msg.textContent='정규화 잠금본을 해제했습니다. 원본 이슈 데이터 행은 변경되지 않았습니다.';
}

function qBuildSummarySchemaOnly(){
  var badge = document.getElementById('qmain-status-badge');
  var msg   = document.getElementById('qmain-status-msg');
  function setS(cls,txt,m){ if(badge){badge.className='q-status-badge '+cls;badge.textContent=txt;} if(msg) msg.textContent=m||''; }

  QSUMMARY_SCHEMA_WARNINGS = [];

  if(!QISSUE_NORMALIZE_LOCKED||!QISSUE_NORMALIZED_ROWS||!QISSUE_NORMALIZED_ROWS.length){
    QSUMMARY_SCHEMA_WARNINGS.push('정규화 잠금본이 없습니다. 먼저 정규화 잠금본을 생성하세요.');
    setS('q-badge-err','잠금본 없음','정규화 잠금본을 먼저 생성하세요.');
    QSUMMARY_SCHEMA = null;
    qRenderSummarySchemaReviewPanel();
    return;
  }

  var meta = QISSUE_NORMALIZE_META || {};
  // 데이터 준비 상태 경고
  if((meta.unmappedSeverityCount||0)>0) QSUMMARY_SCHEMA_WARNINGS.push('중요도 미분류 '+meta.unmappedSeverityCount+'건 존재');
  if((meta.warningCount||0)>meta.normalizedRows*0.3) QSUMMARY_SCHEMA_WARNINGS.push('정규화 경고 비율 과다');
  // machine/model 빈 값 후보 체크 (count 수준만)
  var blankMachine=0, blankModel=0;
  QISSUE_NORMALIZED_ROWS.forEach(function(r){
    if(!r.normalizedFields.machine) blankMachine++;
    if(!r.normalizedFields.model)   blankModel++;
  });
  if(blankMachine>0) QSUMMARY_SCHEMA_WARNINGS.push('정규화 후 machine 빈 값 '+blankMachine+'건');
  if(blankModel>0)   QSUMMARY_SCHEMA_WARNINGS.push('정규화 후 model 빈 값 '+blankModel+'건');

  QSUMMARY_SCHEMA = {
    version: 'Q_REBUILD_08I_DATA_MANAGEMENT_PAGES_PURPOSE_REDESIGN',
    source: {
      normalizedRowsAvailable: true,
      normalizedRowCount: QISSUE_NORMALIZED_ROWS.length,
      warningCount: meta.warningCount||0,
      locked: QISSUE_NORMALIZE_LOCKED,
      generatedAt: meta.appliedAt||null
    },
    dimensions: {
      date:           { key:'date',           label:'날짜',        required:true,  periodLevels:['daily','weekly','monthly','quarterly','yearly'] },
      sourceMonth:    { key:'sourceMonth',     label:'원천 월별 탭', required:true },
      machine:        { key:'machine',         label:'호기',        required:true },
      model:          { key:'model',           label:'모델/종류',   required:true },
      cell:           { key:'cell',            label:'CELL',        required:false },
      severity:       { key:'severity',        label:'중요도',      required:true, buckets:['critical','major','normal','minor','unmapped'] },
      part:           { key:'part',            label:'파트/공정',   required:false },
      categoryLarge:  { key:'categoryLarge',   label:'대분류',      required:false },
      categoryMiddle: { key:'categoryMiddle',  label:'중분류',      required:false },
      categorySmall:  { key:'categorySmall',   label:'소분류',      required:false }
    },
    metrics: {
      defectCount:            { key:'defectCount',            label:'불량 건수',          agg:'count' },
      criticalCount:          { key:'criticalCount',          label:'치명/High 건수',      agg:'countWhere' },
      warningCount:           { key:'warningCount',           label:'경고 포함 건수',      agg:'countWhere' },
      duplicateCandidateCount:{ key:'duplicateCandidateCount',label:'중복 후보 건수',      agg:'countWhere' },
      unmappedSeverityCount:  { key:'unmappedSeverityCount',  label:'중요도 미분류 건수',  agg:'countWhere' },
      missingRequiredCount:   { key:'missingRequiredCount',   label:'필수 누락 건수',      agg:'countWhere' }
    },
    summaryTargets: {
      dashboard:        ['kpi','periodTrend','severityDistribution','topRiskMachine','topCategoryPareto'],
      analysisCenter:   ['machine','model','cell','period','category','severityMatrix'],
      rawAudit:         ['warning','missing','duplicate'],
      processSyncReady: ['standardCode','mappingCandidate','exportCandidate']
    },
    chartPlan: {
      periodTrend:          'line_bar_combo',
      severityDistribution: 'donut',
      machineRisk:          'heatmap_or_grouped_bar',
      modelType:            'grouped_or_stacked_bar',
      cellRound:            'matrix_heatmap',
      categoryPareto:       'pareto_horizontal_bar',
      calendar:             'calendar_heatmap',
      codeMapping:          'pareto_and_unmapped_ranking'
    }
  };

  setS('q-badge-ok','Schema 구성 완료','분석 집계 Schema가 구성되었습니다. 검토 후 Schema 검토 완료 버튼을 눌러 확정하세요.');
  qRenderSummarySchemaReviewPanel();
}

function qRenderSummarySchemaReviewPanel(){
  var wrap = document.getElementById('q-summary-schema-wrap');
  if(!wrap) return;
  if(!QSUMMARY_SCHEMA){
    var warnHtml = QSUMMARY_SCHEMA_WARNINGS.length
      ? '<div class="q-summary-warning">'+QSUMMARY_SCHEMA_WARNINGS.map(function(w){return String(w||'').replace(/&/g,'&amp;').replace(/</g,'&lt;');}).join('<br>')+'</div>'
      : '';
    wrap.innerHTML = '<div class="q-norm-empty">분석 집계 Schema 구성 버튼을 눌러 Schema를 생성하세요.</div>' + warnHtml;
    return;
  }
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var sn = QSUMMARY_SCHEMA;
  var srcOk = sn.source.locked&&sn.source.normalizedRowsAvailable&&sn.source.normalizedRowCount>0;
  var srcStatus = srcOk ? '<span class="q-normalized-locked">준비 완료</span>' : '<span class="q-normalized-unlocked">데이터 부족</span>';

  var warnHtml = QSUMMARY_SCHEMA_WARNINGS.length
    ? '<div class="q-summary-warning">'+QSUMMARY_SCHEMA_WARNINGS.map(_e).join('<br>')+'</div>'
    : '';

  var reviewedStatus = QSUMMARY_SCHEMA_REVIEWED
    ? '<span class="q-normalized-locked">검토 완료 · '+_e(QSUMMARY_SCHEMA_APPLIED_AT.replace('T',' ').slice(0,19))+'</span>'
    : '<span class="q-normalized-unlocked">검토 전</span>';

  wrap.innerHTML =
    '<div class="q-summary-schema">'+
      '<div class="q-panel-hd" style="margin-bottom:8px">📊 분석 집계 Schema</div>'+
      '<div class="q-summary-schema-card">'+
        '<div class="q-sheet-summary-row">'+
          '<span class="q-sheet-lbl">데이터 준비</span><span class="q-sheet-val">'+srcStatus+'</span>'+
          '<span class="q-sheet-lbl">잠금본 행</span><span class="q-sheet-val q-badge-ok">'+sn.source.normalizedRowCount+'건</span>'+
          '<span class="q-sheet-lbl">정규화 경고</span><span class="q-sheet-val">'+sn.source.warningCount+'건</span>'+
          '<span class="q-sheet-lbl">Schema 버전</span><span class="q-sheet-val">'+_e(sn.version)+'</span>'+
          '<span class="q-sheet-lbl">Schema 검토</span><span class="q-sheet-val">'+reviewedStatus+'</span>'+
        '</div>'+
      '</div>'+
      warnHtml+
      '<div id="q-sum-dim-panel" style="margin-top:10px"></div>'+
      '<div id="q-sum-metric-panel" style="margin-top:10px"></div>'+
      '<div id="q-sum-chart-panel" style="margin-top:10px"></div>'+
      '<div id="q-sum-target-panel" style="margin-top:10px"></div>'+
      '<div class="q-summary-actions">'+
        '<button class="q-btn-readiness" onclick="qApplySummarySchemaReviewOnly()">✔ 분석 집계 Schema 검토 완료</button>'+
        '<button class="q-btn-filter-reset" onclick="qResetSummarySchemaOnly()">↩ Schema 초기화</button>'+
      '</div>'+
    '</div>';

  qRenderSummarySchemaDimensionsOnly(sn);
  qRenderSummarySchemaMetricsOnly(sn);
  qRenderSummaryChartPlanOnly(sn);
}

function qRenderSummarySchemaDimensionsOnly(schema){
  var panel = document.getElementById('q-sum-dim-panel');
  if(!panel||!schema) return;
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var DIM_USE = { date:'기간 추이 / 캘린더 / 필터', sourceMonth:'원천 월별 분류', machine:'호기별 분석 / 위험도 matrix', model:'모델/종류별 분석', cell:'CELL/차수 분석', severity:'중요도 분석 / 상태 matrix', part:'파트/공정별 분석', categoryLarge:'분류 Pareto / 기준정보 후보', categoryMiddle:'분류 Pareto / 기준정보 후보', categorySmall:'분류 Pareto / 기준정보 후보' };
  var rows = Object.keys(schema.dimensions).map(function(k){
    var d=schema.dimensions[k];
    var extra = d.periodLevels ? d.periodLevels.join(', ') : (d.buckets ? d.buckets.join(', ') : '—');
    return '<tr><td><strong>'+_e(d.key)+'</strong></td><td>'+_e(d.label)+'</td>'+
      '<td>'+(d.required?'<span class="q-issue-sev-critical" style="font-size:9px">필수</span>':'선택')+'</td>'+
      '<td style="font-size:9px;color:var(--tm)">'+_e(extra)+'</td>'+
      '<td style="font-size:9px;color:var(--tm)">'+_e(DIM_USE[k]||'—')+'</td></tr>';
  }).join('');
  panel.innerHTML =
    '<div class="q-panel-hd" style="margin-bottom:4px">📐 Dimensions 정의</div>'+
    '<div style="overflow-x:auto"><table class="q-summary-dim-table">'+
      '<thead><tr><th>key</th><th>label</th><th>필수</th><th>레벨/버킷</th><th>사용 위치</th></tr></thead>'+
      '<tbody>'+rows+'</tbody></table></div>';
}

function qRenderSummarySchemaMetricsOnly(schema){
  var panel = document.getElementById('q-sum-metric-panel');
  if(!panel||!schema) return;
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var DESC = { defectCount:'전체 이슈 데이터 건수', criticalCount:'severityNormalized=critical인 건수', warningCount:'warnings 1개 이상인 건수', duplicateCandidateCount:'중복 후보로 마킹된 건수', unmappedSeverityCount:'severity=unmapped인 건수', missingRequiredCount:'필수 필드 누락이 있는 건수' };
  var rows = Object.keys(schema.metrics).map(function(k){
    var m=schema.metrics[k];
    return '<tr><td><strong>'+_e(m.key)+'</strong></td><td>'+_e(m.label)+'</td><td><span class="q-summary-chip">'+_e(m.agg)+'</span></td><td style="font-size:9px;color:var(--tm)">'+_e(DESC[k]||'—')+'</td></tr>';
  }).join('');
  panel.innerHTML =
    '<div class="q-panel-hd" style="margin-bottom:4px">📈 Metrics 정의</div>'+
    '<div style="overflow-x:auto"><table class="q-summary-metric-table">'+
      '<thead><tr><th>key</th><th>label</th><th>집계 방식</th><th>설명</th></tr></thead>'+
      '<tbody>'+rows+'</tbody></table></div>';
}

function qRenderSummaryChartPlanOnly(schema){
  var chartPanel = document.getElementById('q-sum-chart-panel');
  var targetPanel = document.getElementById('q-sum-target-panel');
  if(!schema) return;
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var CHART_LABEL = { line_bar_combo:'선+막대 복합', donut:'도넛', heatmap_or_grouped_bar:'히트맵/그룹막대', grouped_or_stacked_bar:'그룹/누적막대', matrix_heatmap:'매트릭스 히트맵', pareto_horizontal_bar:'Pareto 수평막대', calendar_heatmap:'캘린더 히트맵', pareto_and_unmapped_ranking:'Pareto+미매핑 랭킹' };
  var chipHtml = Object.keys(schema.chartPlan).map(function(k){
    return '<span class="q-chart-plan-chip">'+_e(k)+': '+_e(CHART_LABEL[schema.chartPlan[k]]||schema.chartPlan[k])+'</span>';
  }).join('');
  if(chartPanel) chartPanel.innerHTML =
    '<div class="q-panel-hd" style="margin-bottom:6px">🗂 차트 구현 계획 (실제 구현은 06A~06C에서)</div>'+
    '<div class="q-summary-chart-plan">'+chipHtml+'</div>'+
    '<div style="font-size:10px;color:var(--tm);margin-top:6px">차트 DOM/canvas/SVG 생성은 이번 단계에서 하지 않습니다. Schema 정의만 확정합니다.</div>';

  if(targetPanel){
    var targets = schema.summaryTargets;
    var tHtml = Object.keys(targets).map(function(area){
      return '<div style="margin-bottom:6px"><span class="q-panel-hd">'+_e(area)+'</span>: '+
        targets[area].map(function(t){return '<span class="q-summary-chip">'+_e(t)+'</span>';}).join('')+'</div>';
    }).join('');
    targetPanel.innerHTML = '<div class="q-panel-hd" style="margin-bottom:6px">🎯 Summary 생성 대상</div>'+tHtml;
  }
}

function qApplySummarySchemaReviewOnly(){
  var badge = document.getElementById('qmain-status-badge');
  var msg   = document.getElementById('qmain-status-msg');
  if(!QSUMMARY_SCHEMA){
    if(msg) msg.textContent='분석 집계 Schema를 먼저 구성하세요.';
    return;
  }
  QSUMMARY_SCHEMA_REVIEWED  = true;
  QSUMMARY_SCHEMA_APPLIED_AT= new Date().toISOString();
  if(badge){badge.className='q-status-badge q-badge-ok';badge.textContent='Schema 검토 완료';}
  if(msg) msg.textContent='분석 집계 Schema 검토가 완료되었습니다. 실제 집계 생성은 다음 단계에서 진행합니다.';
  qRenderSummarySchemaReviewPanel();
}

function qResetSummarySchemaOnly(){
  var msg = document.getElementById('qmain-status-msg');
  QSUMMARY_SCHEMA           = null;
  QSUMMARY_SCHEMA_REVIEWED  = false;
  QSUMMARY_SCHEMA_WARNINGS  = [];
  QSUMMARY_SCHEMA_APPLIED_AT= null;
  qRenderSummarySchemaReviewPanel();
  if(msg) msg.textContent='분석 집계 Schema를 초기화했습니다.';
}

// ── 헬퍼 함수들 ──────────────────────────────────────────────

function qParseSummaryDateOnly(value){
  if(!value||value===''||value===null||value===undefined) return null;
  if(value instanceof Date && !isNaN(value)) return value;
  if(typeof value==='number'&&value>40000&&value<80000){
    // Excel serial date
    var d=new Date(Math.round((value-25569)*86400*1000));
    return isNaN(d)?null:d;
  }
  var s=String(value).trim();
  var m;
  // yyyy-mm-dd or yyyy.mm.dd
  m=s.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  if(m){ var d=new Date(+m[1],+m[2]-1,+m[3]); return isNaN(d)?null:d; }
  // yy.mm.dd
  m=s.match(/^(\d{2})[-./](\d{1,2})[-./](\d{1,2})/);
  if(m){ var yr=+m[1]<50?(2000+parseInt(m[1],10)):(1900+parseInt(m[1],10)); var d=new Date(yr,+m[2]-1,+m[3]); return isNaN(d)?null:d; }
  var d2=new Date(s);
  return isNaN(d2)?null:d2;
}

function qGetSummaryPeriodKeysOnly(dateObj){
  if(!dateObj||isNaN(dateObj)) return null;
  var y=dateObj.getFullYear();
  var m=dateObj.getMonth()+1;
  var d=dateObj.getDate();
  var mm=m<10?'0'+m:String(m);
  var dd=d<10?'0'+d:String(d);
  // week number
  var jan1=new Date(y,0,1);
  var wn=Math.ceil(((dateObj-jan1)/86400000+jan1.getDay()+1)/7);
  var wns=wn<10?'0'+wn:String(wn);
  var q=Math.ceil(m/3);
  return {
    daily:     y+'-'+mm+'-'+dd,
    weekly:    y+'-W'+wns,
    monthly:   y+'-'+mm,
    quarterly: y+'-Q'+q,
    yearly:    String(y)
  };
}

function qGetSummaryFieldValueOnly(row, fieldKey){
  var BLANK_LIKE=['','기타','etc','미분류','-','없음','n/a'];
  function normalize(v){
    var s=String(v===null||v===undefined?'':v).trim();
    if(BLANK_LIKE.indexOf(s.toLowerCase())>=0) return '기타/미분류';
    return s||'미분류';
  }
  var nf=row.normalizedFields||{};
  var f=row.fields||{};
  switch(fieldKey){
    case 'severity':      return normalize(nf.severity||f.severityNormalized);
    case 'machine':       return normalize(nf.machine||f.machine);
    case 'model':         return normalize(nf.model||f.model);
    case 'cell':          return normalize(nf.cell||f.cell);
    case 'part':          return normalize(nf.part||f.part);
    case 'categoryLarge': return normalize(nf.categoryLarge||f.categoryLarge);
    case 'categoryMiddle':return normalize(nf.categoryMiddle||f.categoryMiddle);
    case 'categorySmall': return normalize(nf.categorySmall||f.categorySmall);
    case 'sourceMonth':   return normalize(row.sourceMonth||row.sourceSheet);
    default: return '미분류';
  }
}

function qCreateSummaryBucketOnly(key, label){
  return { key:key, label:label, defectCount:0, criticalCount:0, warningCount:0, duplicateCandidateCount:0, unmappedSeverityCount:0, missingRequiredCount:0 };
}

function qAddSummaryMetricOnly(bucket, row){
  bucket.defectCount++;
  var sev = qGetSummaryFieldValueOnly(row,'severity');
  if(sev==='critical') bucket.criticalCount++;
  if((row.warnings&&row.warnings.length)||(row.status&&row.status.normalizationWarning)) bucket.warningCount++;
  if(row.status&&row.status.duplicateCandidate) bucket.duplicateCandidateCount++;
  if(sev==='unmapped'||sev==='미분류'||sev==='기타/미분류') bucket.unmappedSeverityCount++;
  if(row.status&&row.status.missingRequiredFields&&row.status.missingRequiredFields.length) bucket.missingRequiredCount++;
  return bucket;
}

// ── 분석 집계 Core 생성 ──────────────────────────────────────

function qBuildSummaryCoreOnly(){
  var badge = document.getElementById('qmain-status-badge');
  var msg   = document.getElementById('qmain-status-msg');
  function setS(cls,txt,m){ if(badge){badge.className='q-status-badge '+cls;badge.textContent=txt;} if(msg) msg.textContent=m||''; }

  if(!QSUMMARY_SCHEMA||!QSUMMARY_SCHEMA_REVIEWED){ setS('q-badge-err','Schema 미검토','분석 집계 Schema를 먼저 검토 완료하세요.'); return; }
  if(!QISSUE_NORMALIZE_LOCKED||!QISSUE_NORMALIZED_ROWS||!QISSUE_NORMALIZED_ROWS.length){ setS('q-badge-err','잠금본 없음','정규화 잠금본을 먼저 생성하세요.'); return; }

  QSUMMARY_DATA_WARNINGS = [];
  var rows = QISSUE_NORMALIZED_ROWS;
  var DIM_KEYS = ['severity','machine','model','cell','part','categoryLarge','categoryMiddle','categorySmall','sourceMonth'];

  // overview
  var overview = { totalDefects:rows.length, readyCount:0, warningCount:0, blockedCount:0, duplicateCandidateCount:0, missingRequiredCount:0, unmappedSeverityCount:0, criticalCount:0, majorCount:0, normalCount:0, minorCount:0 };

  // period buckets
  var periodMaps = { daily:{}, weekly:{}, monthly:{}, quarterly:{}, yearly:{} };
  // dimension buckets
  var dimMaps = {};
  DIM_KEYS.forEach(function(k){ dimMaps[k]={}; });
  // matrix: machine x severity, model x severity, cell x severity, cat x severity
  var matMaps = { machineSeverity:{}, modelSeverity:{}, cellSeverity:{}, categorySeverity:{} };
  // audit
  var auditWarn=[], auditDup=[], auditMiss=[], auditUnmap=[];

  rows.forEach(function(row){
    var status = row.status||{};
    var sev = qGetSummaryFieldValueOnly(row,'severity');

    // overview
    if(status.conversionStatus==='ready') overview.readyCount++;
    else if(status.conversionStatus==='warning') overview.warningCount++;
    else overview.blockedCount++;
    if(status.duplicateCandidate) overview.duplicateCandidateCount++;
    if(status.missingRequiredFields&&status.missingRequiredFields.length) overview.missingRequiredCount++;
    if(sev==='unmapped'||sev==='미분류'||sev==='기타/미분류') overview.unmappedSeverityCount++;
    if(sev==='critical') overview.criticalCount++;
    else if(sev==='major') overview.majorCount++;
    else if(sev==='normal') overview.normalCount++;
    else if(sev==='minor') overview.minorCount++;

    // period
    var dateObj = qParseSummaryDateOnly(row.fields.date);
    if(dateObj){
      var pk = qGetSummaryPeriodKeysOnly(dateObj);
      if(pk){
        Object.keys(pk).forEach(function(lvl){
          var key=pk[lvl];
          if(!periodMaps[lvl][key]) periodMaps[lvl][key]=qCreateSummaryBucketOnly(key,key);
          qAddSummaryMetricOnly(periodMaps[lvl][key],row);
        });
      }
    } else if(row.fields.date) {
      QSUMMARY_DATA_WARNINGS.push({type:'date-parse-fail', issueKey:row.issueKey, value:row.fields.date, message:'날짜 파싱 실패'});
    }

    // dimensions
    DIM_KEYS.forEach(function(dk){
      var val = qGetSummaryFieldValueOnly(row,dk);
      if(!dimMaps[dk][val]) dimMaps[dk][val]=qCreateSummaryBucketOnly(val,val);
      qAddSummaryMetricOnly(dimMaps[dk][val],row);
    });

    // matrices
    var machine=qGetSummaryFieldValueOnly(row,'machine');
    var model  =qGetSummaryFieldValueOnly(row,'model');
    var cell   =qGetSummaryFieldValueOnly(row,'cell');
    var catL   =qGetSummaryFieldValueOnly(row,'categoryLarge');
    [[matMaps.machineSeverity,machine],[matMaps.modelSeverity,model],[matMaps.cellSeverity,cell],[matMaps.categorySeverity,catL]].forEach(function(pair){
      var mm=pair[0], rk=pair[1], mkey=rk+'|'+sev;
      if(!mm[mkey]) mm[mkey]={rowKey:rk,rowLabel:rk,colKey:sev,colLabel:sev,defectCount:0,criticalCount:0,warningCount:0};
      mm[mkey].defectCount++;
      if(sev==='critical') mm[mkey].criticalCount++;
      if(row.warnings&&row.warnings.length) mm[mkey].warningCount++;
    });

    // audit
    if(auditWarn.length<100&&row.warnings&&row.warnings.length) auditWarn.push(row);
    if(auditDup.length<100&&status.duplicateCandidate) auditDup.push(row);
    if(auditMiss.length<100&&status.missingRequiredFields&&status.missingRequiredFields.length) auditMiss.push(row);
    if(auditUnmap.length<100&&(sev==='unmapped'||sev==='미분류'||sev==='기타/미분류')) auditUnmap.push(row);
  });

  // period 배열화 + 정렬
  function toSortedArr(map){ return Object.values(map).sort(function(a,b){return a.key<b.key?-1:a.key>b.key?1:0;}); }
  // dimension 배열화 + defectCount 내림차순
  function toDimArr(map){ return Object.values(map).sort(function(a,b){return b.defectCount-a.defectCount||(a.label<b.label?-1:a.label>b.label?1:0);}); }

  var period = {};
  Object.keys(periodMaps).forEach(function(lvl){ period[lvl]=toSortedArr(periodMaps[lvl]); });

  var dimensions = {};
  DIM_KEYS.forEach(function(dk){ dimensions[dk]=toDimArr(dimMaps[dk]); });

  // topLists
  function top(arr,n){ return arr.slice(0,n); }
  var BLANK=['미분류','기타/미분류'];
  var unmapCands=[];
  ['categoryLarge','categoryMiddle','categorySmall','severity','machine','model'].forEach(function(dk){
    dimensions[dk].forEach(function(item){
      if(BLANK.indexOf(item.label)>=0) unmapCands.push({field:dk,value:item.label,count:item.defectCount});
    });
  });
  var topLists = {
    topMachines:   top(dimensions.machine,10),
    topModels:     top(dimensions.model,10),
    topCategories: top(dimensions.categoryLarge,10),
    topCells:      top(dimensions.cell,10),
    unmappedCandidates: unmapCands.slice(0,30)
  };

  // matrix 배열화
  var matrices = {
    machineSeverity:  Object.values(matMaps.machineSeverity).sort(function(a,b){return b.defectCount-a.defectCount;}).slice(0,200),
    modelSeverity:    Object.values(matMaps.modelSeverity).sort(function(a,b){return b.defectCount-a.defectCount;}).slice(0,200),
    cellSeverity:     Object.values(matMaps.cellSeverity).sort(function(a,b){return b.defectCount-a.defectCount;}).slice(0,200),
    categorySeverity: Object.values(matMaps.categorySeverity).sort(function(a,b){return b.defectCount-a.defectCount;}).slice(0,200)
  };

  var now = new Date().toISOString();
  QSUMMARY_DATA = {
    version:'Q_REBUILD_08I_DATA_MANAGEMENT_PAGES_PURPOSE_REDESIGN', generatedAt:now,
    source:{ normalizedRows:rows.length, schemaReviewed:QSUMMARY_SCHEMA_REVIEWED, locked:QISSUE_NORMALIZE_LOCKED, normalizeWarningCount:QISSUE_NORMALIZE_WARNINGS.length },
    overview:overview, period:period, dimensions:dimensions, matrices:matrices, topLists:topLists,
    audit:{ warningRows:auditWarn, duplicateRows:auditDup, missingRows:auditMiss, unmappedSeverityRows:auditUnmap }
  };
  QSUMMARY_DATA_GENERATED_AT = now;
  QSUMMARY_DATA_READY = true;
  QSUMMARY_DATA_META = {
    totalDefects:overview.totalDefects, criticalCount:overview.criticalCount,
    dimensionDistincts:Object.fromEntries?Object.fromEntries(DIM_KEYS.map(function(k){return [k,Object.keys(dimMaps[k]).length];})):null,
    dateParseFailCount:QSUMMARY_DATA_WARNINGS.filter(function(w){return w.type==='date-parse-fail';}).length,
    generatedAt:now
  };

  setS('q-badge-ok','집계 Core 생성 완료','분석 집계 Core 데이터가 생성되었습니다. 차트 구현은 다음 단계에서 진행합니다.');
  qRenderSummaryCoreReviewPanel();
}

function qRenderSummaryCoreReviewPanel(){
  var panel = document.getElementById('q-summary-core-wrap');
  if(!panel){
    // 동적으로 wrap 생성
    var schemaWrap=document.getElementById('q-summary-schema-wrap');
    if(schemaWrap){
      var d=document.createElement('div'); d.id='q-summary-core-wrap';
      schemaWrap.parentNode.insertBefore(d, schemaWrap.nextSibling);
      panel=d;
    }
    if(!panel) return;
  }
  if(!QSUMMARY_DATA_READY||!QSUMMARY_DATA){ panel.innerHTML=''; return; }
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var s=QSUMMARY_DATA;
  var warnCount=QSUMMARY_DATA_WARNINGS.length;
  panel.innerHTML =
    '<div class="q-summary-core">'+
      '<div class="q-panel-hd" style="margin-bottom:8px">📦 분석 집계 Core — 차트 구현 전 단계</div>'+
      '<div class="q-summary-core-card">'+
        '<div class="q-sheet-summary-row">'+
          '<span class="q-sheet-lbl">집계 기준 행</span><span class="q-sheet-val q-badge-ok">'+s.source.normalizedRows+'건</span>'+
          '<span class="q-sheet-lbl">총 불량 건수</span><span class="q-sheet-val">'+s.overview.totalDefects+'건</span>'+
          '<span class="q-sheet-lbl">치명/High</span><span class="q-sheet-val q-badge-err">'+s.overview.criticalCount+'건</span>'+
          '<span class="q-sheet-lbl">날짜 파싱 실패</span><span class="q-sheet-val'+(warnCount?'':' q-badge-ok')+'">'+warnCount+'건</span>'+
          '<span class="q-sheet-lbl">버전</span><span class="q-sheet-val">'+_e(s.version)+'</span>'+
          '<span class="q-sheet-lbl">생성 시간</span><span class="q-sheet-val">'+QSUMMARY_DATA_GENERATED_AT.replace('T',' ').slice(0,19)+'</span>'+
        '</div>'+
      '</div>'+
      '<div id="q-sum-core-overview"></div>'+
      '<div id="q-sum-core-period"></div>'+
      '<div id="q-sum-core-dim"></div>'+
      '<div id="q-sum-core-matrix"></div>'+
      '<div id="q-sum-core-audit"></div>'+
      (warnCount?'<div class="q-summary-core-warning">⚠ 날짜 파싱 실패 '+warnCount+'건 — period 집계에서 제외됨</div>':'')+
      '<div class="q-note" style="margin-top:10px">차트 DOM/canvas/SVG 구현은 06A~06C에서 진행합니다.</div>'+
      '<div class="q-summary-core-actions">'+
      '<button class="q-btn-filter-reset" onclick="qResetSummaryCoreOnly()">↩ Core 초기화</button>'+
      (QSUMMARY_DATA_READY?'<button class="q-btn-readiness" style="margin-left:8px" onclick="qRenderSummaryFilterReviewPanel()">🔍 분석 집계 필터 검수 시작</button>':'')+
      '</div>'+
      '<div id="q-summary-filter-wrap" style="margin-top:14px"></div>'+
    '</div>';
  qRenderSummaryOverviewOnly(s);
  qRenderSummaryPeriodPreviewOnly(s);
  qRenderSummaryDimensionPreviewOnly(s);
  qRenderSummaryMatrixPreviewOnly(s);
  qRenderSummaryAuditPreviewOnly(s);
}

function qRenderSummaryOverviewOnly(summary){
  var panel=document.getElementById('q-sum-core-overview'); if(!panel) return;
  var ov=summary.overview;
  panel.innerHTML='<div class="q-panel-hd" style="margin:10px 0 6px">📊 Overview KPI</div>'+
    '<div class="q-summary-overview">'+
      [['전체',ov.totalDefects,'#818cf8'],['치명',ov.criticalCount,'#ef4444'],['주요',ov.majorCount,'#f59e0b'],['보통',ov.normalCount,'#22c55e'],['경미',ov.minorCount,'#94a3b8'],['중복후보',ov.duplicateCandidateCount,'#f87171'],['필수누락',ov.missingRequiredCount,'#f59e0b'],['미분류',ov.unmappedSeverityCount,'#94a3b8']]
      .map(function(kv){ return '<div class="q-summary-kpi"><div class="q-summary-kpi-val" style="color:'+kv[2]+'">'+kv[1]+'</div><div class="q-summary-kpi-lbl">'+kv[0]+'</div></div>'; }).join('')+
    '</div>';
}

function qRenderSummaryPeriodPreviewOnly(summary){
  var panel=document.getElementById('q-sum-core-period'); if(!panel) return;
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var html='<div class="q-panel-hd" style="margin:10px 0 6px">📅 기간 집계 미리보기</div>';
  var LIMITS={daily:20,weekly:20,monthly:24,quarterly:12,yearly:999};
  ['monthly','weekly','yearly'].forEach(function(lvl){
    var arr=(summary.period[lvl]||[]).slice(0,LIMITS[lvl]);
    if(!arr.length) return;
    var rows=arr.map(function(b,i){return '<tr><td>'+_e(b.key)+'</td><td>'+b.defectCount+'</td><td>'+b.criticalCount+'</td><td>'+b.warningCount+'</td></tr>';}).join('');
    html+='<div style="margin-bottom:10px"><div style="font-size:10px;font-weight:700;margin-bottom:4px">'+lvl+' ('+arr.length+'건)</div>'+
      '<div style="overflow-x:auto;max-height:150px;overflow-y:auto"><table class="q-summary-core-table"><thead><tr><th>기간</th><th>건수</th><th>치명</th><th>경고</th></tr></thead><tbody>'+rows+'</tbody></table></div></div>';
  });
  panel.innerHTML=html;
}

function qRenderSummaryDimensionPreviewOnly(summary){
  var panel=document.getElementById('q-sum-core-dim'); if(!panel) return;
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var DIM_LABELS={severity:'중요도',machine:'호기',model:'모델',cell:'CELL',categoryLarge:'대분류',categoryMiddle:'중분류',sourceMonth:'원천 탭'};
  var html='<div class="q-panel-hd" style="margin:10px 0 6px">📋 Dimension 집계 (각 상위 30건)</div>';
  ['severity','machine','model','categoryLarge','sourceMonth'].forEach(function(dk){
    var arr=(summary.dimensions[dk]||[]).slice(0,30);
    if(!arr.length) return;
    var rows=arr.map(function(b){return '<tr><td>'+_e(b.label)+'</td><td>'+b.defectCount+'</td><td>'+b.criticalCount+'</td><td>'+b.unmappedSeverityCount+'</td></tr>';}).join('');
    html+='<div style="margin-bottom:10px"><div style="font-size:10px;font-weight:700;margin-bottom:4px">'+(DIM_LABELS[dk]||dk)+'</div>'+
      '<div style="overflow-x:auto;max-height:120px;overflow-y:auto"><table class="q-summary-core-table"><thead><tr><th>값</th><th>건수</th><th>치명</th><th>미분류</th></tr></thead><tbody>'+rows+'</tbody></table></div></div>';
  });
  panel.innerHTML=html;
}

function qRenderSummaryMatrixPreviewOnly(summary){
  var panel=document.getElementById('q-sum-core-matrix'); if(!panel) return;
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var html='<div class="q-panel-hd" style="margin:10px 0 6px">🔲 Matrix 집계 미리보기 (상위 50건, 시각화는 06A~06B에서)</div>';
  [['machineSeverity','호기×중요도'],['categorySeverity','대분류×중요도']].forEach(function(pair){
    var arr=(summary.matrices[pair[0]]||[]).slice(0,50);
    if(!arr.length) return;
    var rows=arr.map(function(b){return '<tr><td>'+_e(b.rowLabel)+'</td><td>'+_e(b.colLabel)+'</td><td>'+b.defectCount+'</td><td>'+b.criticalCount+'</td></tr>';}).join('');
    html+='<div style="margin-bottom:10px"><div style="font-size:10px;font-weight:700;margin-bottom:4px">'+pair[1]+'</div>'+
      '<div style="overflow-x:auto;max-height:120px;overflow-y:auto"><table class="q-summary-core-table"><thead><tr><th>행</th><th>열(중요도)</th><th>건수</th><th>치명</th></tr></thead><tbody>'+rows+'</tbody></table></div></div>';
  });
  panel.innerHTML=html;
}

function qRenderSummaryAuditPreviewOnly(summary){
  var panel=document.getElementById('q-sum-core-audit'); if(!panel) return;
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var aud=summary.audit;
  function auditTable(arr,title,reason){
    var rows=arr.slice(0,50).map(function(r){
      var nf=r.normalizedFields||{};
      return '<tr><td style="font-size:9px">'+_e(r.issueKey)+'</td><td>'+_e(r.sourceSheet)+'</td><td>'+r.excelRow+'</td>'+
        '<td>'+_e(nf.machine||r.fields.machine)+'</td><td>'+_e(nf.model||r.fields.model)+'</td>'+
        '<td>'+_e(nf.severity||r.fields.severityNormalized)+'</td>'+
        '<td style="max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+_e(r.fields.text)+'</td>'+
        '<td style="font-size:9px;color:#f59e0b">'+reason+'</td></tr>';
    }).join('');
    if(!rows) return '';
    return '<div style="margin-bottom:10px"><div style="font-size:10px;font-weight:700;margin-bottom:4px">'+title+' ('+arr.length+'건, 상위 50건 표시)</div>'+
      '<div style="overflow-x:auto;max-height:120px;overflow-y:auto"><table class="q-summary-core-table"><thead><tr><th>issueKey</th><th>시트</th><th>행</th><th>호기</th><th>모델</th><th>중요도</th><th>내용</th><th>사유</th></tr></thead><tbody>'+rows+'</tbody></table></div></div>';
  }
  panel.innerHTML='<div class="q-panel-hd" style="margin:10px 0 6px">🔎 Audit 미리보기</div>'+
    auditTable(aud.warningRows,'경고 포함','경고 있음')+
    auditTable(aud.duplicateRows,'중복 후보','중복 후보')+
    auditTable(aud.missingRows,'필수 누락','필수 누락')+
    auditTable(aud.unmappedSeverityRows,'severity 미분류','미분류');
}

function qResetSummaryCoreOnly(){
  var msg=document.getElementById('qmain-status-msg');
  QSUMMARY_DATA             = null;
  QSUMMARY_DATA_WARNINGS    = [];
  QSUMMARY_DATA_GENERATED_AT= null;
  QSUMMARY_DATA_READY       = false;
  QSUMMARY_DATA_META        = null;
  QSUMMARY_VIEW_FILTERS     = { periodLevel:'monthly', dateFrom:'', dateTo:'', sourceMonth:'', severity:'', machine:'', model:'', cell:'', part:'', categoryLarge:'', categoryMiddle:'', categorySmall:'', warningOnly:false, duplicateOnly:false, missingOnly:false, unmappedOnly:false };
  QSUMMARY_FILTER_PREVIEW   = null;
  QSUMMARY_FILTER_WARNINGS  = [];
  QSUMMARY_FILTER_APPLIED_AT= null;
  QDASH_READY_DATA       = null;
  QDASH_READY_WARNINGS   = [];
  QDASH_READY_GENERATED_AT = null;
  QDASH_READY_META       = null;
  QDASH_CHART_BLUEPRINT  = null;
  QDASH_READY_REVIEWED   = false;
  var panel=document.getElementById('q-summary-core-wrap');
  if(panel) panel.innerHTML='';
  if(msg) msg.textContent='집계 Core 및 필터를 초기화했습니다.';
}

function qBuildSummaryFilterOptionsOnly(fieldKey, limit){
  limit = limit || 100;
  if(!QSUMMARY_DATA || !QSUMMARY_DATA.dimensions) return [{ value:'', label:'전체' }];
  var arr = (QSUMMARY_DATA.dimensions[fieldKey] || []).slice(0, limit);
  var opts = [{ value:'', label:'전체' }];
  arr.forEach(function(b){
    var lbl = String(b.label||b.key||'').replace(/&/g,'&amp;').replace(/</g,'&lt;');
    opts.push({ value: b.key, label: lbl + ' (' + b.defectCount + '건)' });
  });
  return opts;
}

function _qOptHtml(opts, currentVal){
  return opts.map(function(o){
    return '<option value="' + o.value + '"' + (o.value === currentVal ? ' selected' : '') + '>' + o.label + '</option>';
  }).join('');
}

function qRenderSummaryFilterReviewPanel(){
  var wrap = document.getElementById('q-summary-filter-wrap');
  if(!wrap) return;
  if(!QSUMMARY_DATA_READY || !QSUMMARY_DATA){
    wrap.innerHTML = '<div class="q-norm-empty">분석 집계 Core가 없습니다. 먼저 집계 Core를 생성하세요.</div>';
    return;
  }
  var f = QSUMMARY_VIEW_FILTERS;

  var PERIOD_OPTS = ['daily','weekly','monthly','quarterly','yearly'].map(function(v){
    return '<option value="' + v + '"' + (v === f.periodLevel ? ' selected' : '') + '>' + v + '</option>';
  }).join('');

  function buildSel(id, fk, lim){
    var opts = qBuildSummaryFilterOptionsOnly(fk, lim || 100);
    return '<select id="' + id + '">' + _qOptHtml(opts, f[fk] || '') + '</select>';
  }

  var div = document.createElement('div');
  div.className = 'q-summary-filter';
  div.id = 'q-sf-root';
  div.innerHTML =
    '<div class="q-panel-hd" style="margin-bottom:8px">🔍 분석 집계 필터 — 차트 구현 전 검수</div>' +
    '<div class="q-summary-filter-grid">' +
      '<div class="q-summary-filter-item"><label>기간 단위</label><select id="q-sf-periodLevel">' + PERIOD_OPTS + '</select></div>' +
      '<div class="q-summary-filter-item"><label>시작일</label><input type="date" id="q-sf-dateFrom" value="' + (f.dateFrom||'') + '"></div>' +
      '<div class="q-summary-filter-item"><label>종료일</label><input type="date" id="q-sf-dateTo" value="' + (f.dateTo||'') + '"></div>' +
      '<div class="q-summary-filter-item"><label>원천 탭</label>' + buildSel('q-sf-sourceMonth','sourceMonth',100) + '</div>' +
      '<div class="q-summary-filter-item"><label>중요도</label>' + buildSel('q-sf-severity','severity',20) + '</div>' +
      '<div class="q-summary-filter-item"><label>호기</label>' + buildSel('q-sf-machine','machine',100) + '</div>' +
      '<div class="q-summary-filter-item"><label>모델</label>' + buildSel('q-sf-model','model',100) + '</div>' +
      '<div class="q-summary-filter-item"><label>CELL</label>' + buildSel('q-sf-cell','cell',100) + '</div>' +
      '<div class="q-summary-filter-item"><label>파트</label>' + buildSel('q-sf-part','part',100) + '</div>' +
      '<div class="q-summary-filter-item"><label>대분류</label>' + buildSel('q-sf-categoryLarge','categoryLarge',100) + '</div>' +
      '<div class="q-summary-filter-item"><label>중분류</label>' + buildSel('q-sf-categoryMiddle','categoryMiddle',100) + '</div>' +
      '<div class="q-summary-filter-item"><label>소분류</label>' + buildSel('q-sf-categorySmall','categorySmall',100) + '</div>' +
    '</div>' +
    '<div class="q-summary-filter-check">' +
      '<label><input type="checkbox" id="q-sf-warningOnly"' + (f.warningOnly ? ' checked' : '') + '>경고 포함만 보기</label>' +
      '<label><input type="checkbox" id="q-sf-duplicateOnly"' + (f.duplicateOnly ? ' checked' : '') + '>중복 후보만 보기</label>' +
      '<label><input type="checkbox" id="q-sf-missingOnly"' + (f.missingOnly ? ' checked' : '') + '>필수 누락만 보기</label>' +
      '<label><input type="checkbox" id="q-sf-unmappedOnly"' + (f.unmappedOnly ? ' checked' : '') + '>중요도 미분류만 보기</label>' +
    '</div>' +
    '<div class="q-summary-filter-actions">' +
      '<button class="q-btn-readiness" onclick="qApplySummaryViewFiltersOnly()">▶ 필터 적용 Preview 생성</button>' +
      '<button class="q-btn-filter-reset" onclick="qResetSummaryViewFiltersOnly()">↩ 필터 초기화</button>' +
    '</div>' +
    '<div id="q-summary-filter-preview-wrap"></div>';

  wrap.innerHTML = '';
  wrap.appendChild(div);
}

function qReadSummaryFilterInputsOnly(){
  function gv(id){ var el=document.getElementById(id); return el ? el.value : ''; }
  function gc(id){ var el=document.getElementById(id); return el ? el.checked : false; }
  return {
    periodLevel:    gv('q-sf-periodLevel') || 'monthly',
    dateFrom:       gv('q-sf-dateFrom'),
    dateTo:         gv('q-sf-dateTo'),
    sourceMonth:    gv('q-sf-sourceMonth'),
    severity:       gv('q-sf-severity'),
    machine:        gv('q-sf-machine'),
    model:          gv('q-sf-model'),
    cell:           gv('q-sf-cell'),
    part:           gv('q-sf-part'),
    categoryLarge:  gv('q-sf-categoryLarge'),
    categoryMiddle: gv('q-sf-categoryMiddle'),
    categorySmall:  gv('q-sf-categorySmall'),
    warningOnly:    gc('q-sf-warningOnly'),
    duplicateOnly:  gc('q-sf-duplicateOnly'),
    missingOnly:    gc('q-sf-missingOnly'),
    unmappedOnly:   gc('q-sf-unmappedOnly')
  };
}

function qApplySummaryViewFiltersOnly(){
  var badge = document.getElementById('qmain-status-badge');
  var msg   = document.getElementById('qmain-status-msg');
  if(!QSUMMARY_DATA_READY || !QSUMMARY_DATA){
    if(msg) msg.textContent = '분석 집계 Core를 먼저 생성하세요.';
    return;
  }
  QSUMMARY_VIEW_FILTERS = qReadSummaryFilterInputsOnly();
  qBuildSummaryFilterPreviewOnly();
  qRenderSummaryFilterPreviewPanel();
  if(badge){ badge.className='q-status-badge q-badge-ok'; badge.textContent='필터 Preview 생성 완료'; }
  if(msg) msg.textContent = '분석 집계 필터 Preview를 생성했습니다. 실제 차트 구현은 06A 이후 단계에서 진행합니다.';
}

function qResetSummaryViewFiltersOnly(){
  var msg = document.getElementById('qmain-status-msg');
  QSUMMARY_VIEW_FILTERS     = { periodLevel:'monthly', dateFrom:'', dateTo:'', sourceMonth:'', severity:'', machine:'', model:'', cell:'', part:'', categoryLarge:'', categoryMiddle:'', categorySmall:'', warningOnly:false, duplicateOnly:false, missingOnly:false, unmappedOnly:false };
  QSUMMARY_FILTER_PREVIEW   = null;
  QSUMMARY_FILTER_WARNINGS  = [];
  QSUMMARY_FILTER_APPLIED_AT= null;
  QDASH_READY_DATA       = null;
  QDASH_READY_WARNINGS   = [];
  QDASH_READY_GENERATED_AT = null;
  QDASH_READY_META       = null;
  QDASH_CHART_BLUEPRINT  = null;
  QDASH_READY_REVIEWED   = false;
  qRenderSummaryFilterReviewPanel();
  if(msg) msg.textContent = '분석 집계 필터를 초기화했습니다.';
}

function qGetRowsForSummaryFilterOnly(filters){
  if(!QISSUE_NORMALIZED_ROWS) return [];
  var f = filters || QSUMMARY_VIEW_FILTERS;
  var dateFrom = f.dateFrom ? new Date(f.dateFrom) : null;
  var dateTo   = f.dateTo   ? new Date(f.dateTo)   : null;
  if(dateTo) dateTo.setHours(23,59,59,999);

  return QISSUE_NORMALIZED_ROWS.filter(function(row){
    // date range
    if(dateFrom || dateTo){
      var rd = qParseSummaryDateOnly(row.fields.date);
      if(!rd) return false;
      if(dateFrom && rd < dateFrom) return false;
      if(dateTo   && rd > dateTo)   return false;
    }
    // sourceMonth
    if(f.sourceMonth){
      var sm = String(row.sourceMonth || row.sourceSheet || '');
      if(sm !== f.sourceMonth) return false;
    }
    // dimension filters
    var DIM_KEYS = ['severity','machine','model','cell','part','categoryLarge','categoryMiddle','categorySmall'];
    for(var i = 0; i < DIM_KEYS.length; i++){
      var dk = DIM_KEYS[i];
      if(f[dk] && qGetSummaryFieldValueOnly(row, dk) !== f[dk]) return false;
    }
    // checkbox filters
    var sev = qGetSummaryFieldValueOnly(row, 'severity');
    var st  = row.status || {};
    if(f.warningOnly    && !(row.warnings && row.warnings.length || st.normalizationWarning)) return false;
    if(f.duplicateOnly  && !st.duplicateCandidate) return false;
    if(f.missingOnly    && !(st.missingRequiredFields && st.missingRequiredFields.length)) return false;
    if(f.unmappedOnly   && sev !== 'unmapped' && sev !== '미분류' && sev !== '기타/미분류') return false;
    return true;
  });
}

function qBuildSummaryFilterPreviewOnly(){
  QSUMMARY_FILTER_WARNINGS = [];
  if(!QSUMMARY_DATA_READY || !QISSUE_NORMALIZED_ROWS || !QISSUE_NORMALIZED_ROWS.length) return;

  var f    = QSUMMARY_VIEW_FILTERS;
  var rows = qGetRowsForSummaryFilterOnly(f);
  var PLvl = f.periodLevel || 'monthly';
  var PERIOD_LIMITS = { daily:50, weekly:50, monthly:36, quarterly:20, yearly:999 };
  var DIM_KEYS = ['severity','machine','model','cell','part','categoryLarge','categoryMiddle','categorySmall','sourceMonth'];

  // overview
  var ov = { totalDefects:rows.length, criticalCount:0, majorCount:0, normalCount:0, minorCount:0,
             warningCount:0, duplicateCandidateCount:0, missingRequiredCount:0, unmappedSeverityCount:0 };
  // period map
  var pmap = {};
  // dim maps
  var dmaps = {}; DIM_KEYS.forEach(function(k){ dmaps[k] = {}; });
  // matrix maps
  var mmaps = { machineSeverity:{}, modelSeverity:{}, cellSeverity:{}, categorySeverity:{} };
  // audit
  var auditWarn=[], auditDup=[], auditMiss=[], auditUnmap=[];

  rows.forEach(function(row){
    var sev = qGetSummaryFieldValueOnly(row, 'severity');
    var st  = row.status || {};

    if(sev === 'critical')      ov.criticalCount++;
    else if(sev === 'major')    ov.majorCount++;
    else if(sev === 'normal')   ov.normalCount++;
    else if(sev === 'minor')    ov.minorCount++;
    if(row.warnings && row.warnings.length || st.normalizationWarning) ov.warningCount++;
    if(st.duplicateCandidate)   ov.duplicateCandidateCount++;
    if(st.missingRequiredFields && st.missingRequiredFields.length) ov.missingRequiredCount++;
    if(sev === 'unmapped' || sev === '미분류' || sev === '기타/미분류') ov.unmappedSeverityCount++;

    // period
    var dateObj = qParseSummaryDateOnly(row.fields.date);
    if(dateObj){
      var pk = qGetSummaryPeriodKeysOnly(dateObj);
      if(pk && pk[PLvl]){
        var key = pk[PLvl];
        if(!pmap[key]) pmap[key] = qCreateSummaryBucketOnly(key, key);
        qAddSummaryMetricOnly(pmap[key], row);
      }
    } else if(row.fields.date){
      QSUMMARY_FILTER_WARNINGS.push({ type:'date-parse-fail', issueKey:row.issueKey, value:row.fields.date });
    }

    // dimensions
    DIM_KEYS.forEach(function(dk){
      var val = qGetSummaryFieldValueOnly(row, dk);
      if(!dmaps[dk][val]) dmaps[dk][val] = qCreateSummaryBucketOnly(val, val);
      qAddSummaryMetricOnly(dmaps[dk][val], row);
    });

    // matrices
    var machine = qGetSummaryFieldValueOnly(row, 'machine');
    var model   = qGetSummaryFieldValueOnly(row, 'model');
    var cell    = qGetSummaryFieldValueOnly(row, 'cell');
    var catL    = qGetSummaryFieldValueOnly(row, 'categoryLarge');
    [[mmaps.machineSeverity,machine],[mmaps.modelSeverity,model],[mmaps.cellSeverity,cell],[mmaps.categorySeverity,catL]].forEach(function(pair){
      var mm=pair[0], rk=pair[1], mkey=rk+'|'+sev;
      if(!mm[mkey]) mm[mkey] = { rowKey:rk, rowLabel:rk, colKey:sev, colLabel:sev, defectCount:0, criticalCount:0, warningCount:0 };
      mm[mkey].defectCount++;
      if(sev === 'critical') mm[mkey].criticalCount++;
      if(row.warnings && row.warnings.length) mm[mkey].warningCount++;
    });

    // audit
    if(auditWarn.length < 50 && (row.warnings && row.warnings.length || st.normalizationWarning)) auditWarn.push(row);
    if(auditDup.length  < 50 && st.duplicateCandidate) auditDup.push(row);
    if(auditMiss.length < 50 && st.missingRequiredFields && st.missingRequiredFields.length) auditMiss.push(row);
    if(auditUnmap.length< 50 && (sev === 'unmapped' || sev === '미분류' || sev === '기타/미분류')) auditUnmap.push(row);
  });

  var pLimit = PERIOD_LIMITS[PLvl] || 50;
  var periodArr = Object.values(pmap).sort(function(a,b){ return a.key<b.key?-1:a.key>b.key?1:0; }).slice(0, pLimit);

  var dimPreview = {};
  DIM_KEYS.forEach(function(dk){
    dimPreview[dk] = Object.values(dmaps[dk]).sort(function(a,b){ return b.defectCount - a.defectCount; }).slice(0, 30);
  });

  function toMat(m){ return Object.values(m).sort(function(a,b){ return b.defectCount-a.defectCount; }).slice(0,50); }

  var now = new Date().toISOString();
  QSUMMARY_FILTER_PREVIEW = {
    generatedAt: now,
    filters: JSON.parse(JSON.stringify(f)),
    source: { totalNormalizedRows:QISSUE_NORMALIZED_ROWS.length, filteredRows:rows.length, summaryDataReady:QSUMMARY_DATA_READY, summaryCoreGeneratedAt:QSUMMARY_DATA_GENERATED_AT },
    overview: ov,
    periodPreview: periodArr,
    dimensionPreview: dimPreview,
    matrixPreview: { machineSeverity:toMat(mmaps.machineSeverity), modelSeverity:toMat(mmaps.modelSeverity), cellSeverity:toMat(mmaps.cellSeverity), categorySeverity:toMat(mmaps.categorySeverity) },
    auditPreview: { warningRows:auditWarn, duplicateRows:auditDup, missingRows:auditMiss, unmappedSeverityRows:auditUnmap }
  };
  QSUMMARY_FILTER_APPLIED_AT = now;
}

function qRenderSummaryFilterPreviewPanel(){
  var wrap = document.getElementById('q-summary-filter-preview-wrap');
  if(!wrap) return;
  if(!QSUMMARY_FILTER_PREVIEW){ wrap.innerHTML = ''; return; }

  var p = QSUMMARY_FILTER_PREVIEW;
  wrap.innerHTML = '';
  var div = document.createElement('div');
  div.className = 'q-summary-filter-preview';

  var applyTime = p.generatedAt ? p.generatedAt.replace('T',' ').slice(0,19) : '—';
  div.innerHTML =
    '<div class="q-panel-hd" style="margin-bottom:8px">📋 필터 적용 Preview — 차트 구현 전 검수</div>' +
    '<div class="q-summary-filter-card"><div class="q-sheet-summary-row">' +
      '<span class="q-sheet-lbl">전체 정규화 행</span><span class="q-sheet-val">' + p.source.totalNormalizedRows + '건</span>' +
      '<span class="q-sheet-lbl">필터 결과 행</span><span class="q-sheet-val q-badge-ok">' + p.source.filteredRows + '건</span>' +
      '<span class="q-sheet-lbl">기간 단위</span><span class="q-sheet-val">' + (p.filters.periodLevel||'monthly') + '</span>' +
      '<span class="q-sheet-lbl">적용 시간</span><span class="q-sheet-val">' + applyTime + '</span>' +
      '<span class="q-sheet-lbl">차트 구현</span><span class="q-sheet-val"><span class="q-normalized-unlocked">06A 이후</span></span>' +
    '</div></div>' +
    '<div id="q-sfp-overview"></div>' +
    '<div id="q-sfp-period"></div>' +
    '<div id="q-sfp-dim"></div>' +
    '<div id="q-sfp-matrix"></div>' +
    '<div id="q-sfp-audit"></div>' +
    (QSUMMARY_FILTER_WARNINGS.length
      ? '<div class="q-summary-filter-warning">⚠ 날짜 파싱 실패 ' + QSUMMARY_FILTER_WARNINGS.length + '건 — period 집계 제외</div>'
      : '') +
    '<div class="q-note" style="margin-top:10px">이 결과는 차트 구현 전 데이터 검수용입니다. 실제 차트는 06A~06C에서 구현합니다.</div>' +
    (QSUMMARY_DATA_READY?'<div class="q-dash-actions" style="margin-top:10px"><button class="q-btn-readiness" onclick="qBuildDashboardReadyDataOnly()">🚀 대시보드/분석센터 Ready 데이터 구성</button></div>':'') +
    '<div id="q-dash-ready-wrap" style="margin-top:12px"></div>';

  wrap.appendChild(div);
  qRenderSummaryFilterOverviewOnly(p);
  qRenderSummaryFilterPeriodOnly(p);
  qRenderSummaryFilterDimensionsOnly(p);
  qRenderSummaryFilterMatrixOnly(p);
  qRenderSummaryFilterAuditOnly(p);
}

function qRenderSummaryFilterOverviewOnly(preview){
  var panel = document.getElementById('q-sfp-overview');
  if(!panel) return;
  var ov = preview.overview;
  panel.innerHTML = '<div class="q-panel-hd" style="margin:10px 0 6px">📊 Overview KPI (필터 적용)</div>' +
    '<div class="q-summary-overview">' +
    [['전체',ov.totalDefects,'#818cf8'],['치명',ov.criticalCount,'#ef4444'],['주요',ov.majorCount,'#f59e0b'],
     ['보통',ov.normalCount,'#22c55e'],['경미',ov.minorCount,'#94a3b8'],['경고',ov.warningCount,'#f87171'],
     ['중복후보',ov.duplicateCandidateCount,'#f87171'],['필수누락',ov.missingRequiredCount,'#f59e0b'],
     ['미분류',ov.unmappedSeverityCount,'#94a3b8']]
    .map(function(kv){
      return '<div class="q-summary-kpi"><div class="q-summary-kpi-val" style="color:' + kv[2] + '">' + kv[1] + '</div><div class="q-summary-kpi-lbl">' + kv[0] + '</div></div>';
    }).join('') + '</div>';
}

function qRenderSummaryFilterPeriodOnly(preview){
  var panel = document.getElementById('q-sfp-period');
  if(!panel) return;
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var arr = preview.periodPreview || [];
  if(!arr.length){ panel.innerHTML = ''; return; }
  var rows = arr.map(function(b){
    return '<tr><td>' + _e(b.key) + '</td><td>' + b.defectCount + '</td><td>' + b.criticalCount +
           '</td><td>' + b.warningCount + '</td><td>' + b.unmappedSeverityCount + '</td><td>' + b.missingRequiredCount + '</td></tr>';
  }).join('');
  panel.innerHTML =
    '<div class="q-panel-hd" style="margin:10px 0 4px">📅 기간 집계 (' + _e(preview.filters.periodLevel) + ')</div>' +
    '<div style="overflow-x:auto;max-height:200px;overflow-y:auto">' +
    '<table class="q-summary-filter-table"><thead><tr><th>기간</th><th>건수</th><th>치명</th><th>경고</th><th>미분류</th><th>누락</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>';
}

function qRenderSummaryFilterDimensionsOnly(preview){
  var panel = document.getElementById('q-sfp-dim');
  if(!panel) return;
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var DIM_LABELS = { severity:'중요도', machine:'호기', model:'모델', cell:'CELL', categoryLarge:'대분류', categoryMiddle:'중분류', categorySmall:'소분류', sourceMonth:'원천 탭' };
  var html = '<div class="q-panel-hd" style="margin:10px 0 4px">📋 Dimension (상위 30건)</div>';
  ['severity','machine','model','categoryLarge','sourceMonth'].forEach(function(dk){
    var arr = (preview.dimensionPreview[dk] || []).slice(0, 30);
    if(!arr.length) return;
    var trows = arr.map(function(b){
      return '<tr><td>' + _e(b.label) + '</td><td>' + b.defectCount + '</td><td>' + b.criticalCount + '</td><td>' + b.unmappedSeverityCount + '</td></tr>';
    }).join('');
    html += '<div style="margin-bottom:8px"><div style="font-size:10px;font-weight:700;margin-bottom:3px">' + (DIM_LABELS[dk]||dk) + '</div>' +
      '<div style="overflow-x:auto;max-height:110px;overflow-y:auto">' +
      '<table class="q-summary-filter-table"><thead><tr><th>값</th><th>건수</th><th>치명</th><th>미분류</th></tr></thead>' +
      '<tbody>' + trows + '</tbody></table></div></div>';
  });
  panel.innerHTML = html;
}

function qRenderSummaryFilterMatrixOnly(preview){
  var panel = document.getElementById('q-sfp-matrix');
  if(!panel) return;
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var html = '<div class="q-panel-hd" style="margin:10px 0 4px">🔲 Matrix (상위 50건 — 시각화는 06A~06B에서)</div>';
  [['machineSeverity','호기×중요도'],['categorySeverity','대분류×중요도']].forEach(function(pair){
    var arr = (preview.matrixPreview[pair[0]] || []).slice(0, 50);
    if(!arr.length) return;
    var trows = arr.map(function(b){
      return '<tr><td>' + _e(b.rowLabel) + '</td><td>' + _e(b.colLabel) + '</td><td>' + b.defectCount + '</td><td>' + b.criticalCount + '</td></tr>';
    }).join('');
    html += '<div style="margin-bottom:8px"><div style="font-size:10px;font-weight:700;margin-bottom:3px">' + pair[1] + '</div>' +
      '<div style="overflow-x:auto;max-height:110px;overflow-y:auto">' +
      '<table class="q-summary-filter-table"><thead><tr><th>행</th><th>중요도</th><th>건수</th><th>치명</th></tr></thead>' +
      '<tbody>' + trows + '</tbody></table></div></div>';
  });
  panel.innerHTML = html;
}

function qRenderSummaryFilterAuditOnly(preview){
  var panel = document.getElementById('q-sfp-audit');
  if(!panel) return;
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var aud = preview.auditPreview;
  function auditTbl(arr, title, reason){
    if(!arr || !arr.length) return '';
    var trows = arr.slice(0, 50).map(function(r){
      var nf = r.normalizedFields || {};
      return '<tr>' +
        '<td style="font-size:9px;max-width:80px;overflow:hidden;text-overflow:ellipsis">' + _e(r.issueKey) + '</td>' +
        '<td>' + _e(r.sourceSheet) + '</td>' +
        '<td>' + r.excelRow + '</td>' +
        '<td>' + _e(nf.machine || r.fields.machine) + '</td>' +
        '<td>' + _e(nf.model || r.fields.model) + '</td>' +
        '<td>' + _e(nf.severity || r.fields.severityNormalized) + '</td>' +
        '<td style="max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _e(r.fields.text) + '</td>' +
        '<td style="font-size:9px;color:#f59e0b">' + reason + '</td>' +
        '</tr>';
    }).join('');
    return '<div style="margin-bottom:8px">' +
      '<div style="font-size:10px;font-weight:700;margin-bottom:3px">' + title + ' (' + arr.length + '건)</div>' +
      '<div style="overflow-x:auto;max-height:110px;overflow-y:auto">' +
      '<table class="q-summary-filter-table"><thead><tr>' +
      '<th>issueKey</th><th>시트</th><th>행</th><th>호기</th><th>모델</th><th>중요도</th><th>내용</th><th>사유</th>' +
      '</tr></thead><tbody>' + trows + '</tbody></table></div></div>';
  }
  panel.innerHTML =
    '<div class="q-panel-hd" style="margin:10px 0 4px">🔎 Audit Preview</div>' +
    auditTbl(aud.warningRows, '경고 포함', '경고') +
    auditTbl(aud.duplicateRows, '중복 후보', '중복') +
    auditTbl(aud.missingRows, '필수 누락', '누락') +
    auditTbl(aud.unmappedSeverityRows, 'severity 미분류', '미분류');
}

function qCalculateDashboardRiskScoreOnly(item) {
  return (item.defectCount || 0)
    + (item.criticalCount || 0) * 3
    + (item.warningCount || 0) * 1.5
    + (item.missingRequiredCount || 0) * 1.2
    + (item.unmappedSeverityCount || 0);
}

function qBuildDashboardChartBlueprintOnly(readyData) {
  var designs = [
    'dashboard/periodTrend:line_bar_combo:기간별 불량 발생 추이와 치명 건수 동시 확인',
    'dashboard/severityDistribution:donut:중요도 분포 확인',
    'dashboard/machineRisk:heatmap_or_grouped_bar:호기별 위험도 비교',
    'dashboard/categoryPareto:pareto_horizontal_bar:주요 불량 분류 우선순위 확인',
    'analysis/machine:grouped_bar+heatmap:호기별 불량 건수 / 중요도 / 위험도 확인',
    'analysis/model:stacked_bar_or_grouped_bar:모델/종류별 불량 구조 확인',
    'analysis/cell:matrix_heatmap:CELL / 차수 단위 취약 구간 확인',
    'analysis/period:line_bar_combo:일/주/월/분기/연도 기간 전환 분석',
    'analysis/category:pareto+horizontal_bar:대/중/소분류별 불량 집중도 확인',
    'analysis/calendar:calendar_heatmap:일별 불량 밀도 확인',
    'codeMapping/unmapped:pareto_and_ranking_table:기타/미분류 코드화 후보 확인'
  ];

  var blueprints = designs.map(function(d) {
    var parts = d.split(':');
    var pathParts = parts[0].split('/');
    return {
      area:      pathParts[0],
      chartName: pathParts[1],
      chartType: parts[1],
      purpose:   parts[2],
      dataKey:   pathParts[1] + 'Dataset',
      implementedAt: '06A~06C',
      ready: !!(readyData && readyData.dashboard)
    };
  });

  return {
    version: 'Q_REBUILD_08I_DATA_MANAGEMENT_PAGES_PURPOSE_REDESIGN',
    chartCount: blueprints.length,
    blueprints: blueprints,
    designNotes: [
      '단일 차트 반복 금지 — 같은 chart type을 같은 화면에 중복 배치하지 않는다',
      '데이터 성격별 최적 차트 사용 — 추이는 line_bar_combo, 분포는 donut, 비교는 grouped_bar',
      '차트 색상 팔레트 통일 — severity별 고정 색상 사용',
      '카드 크기 / 차트 크기 / 여백 / 정렬 — 06A에서 대시보드 기준 검수',
      '기간 필터와 차트 연동 필요 — periodLevel 선택에 따라 periodTrendDataset 변경',
      '일/주/월/분기/연도 전환 대응 — analysisCenter/period 차트에서 전환 UI 필요',
      '대시보드와 분석센터 차트 역할 분리 — 대시보드는 요약/KPI, 분석센터는 심층 분석'
    ],
    warning: '대시보드 차트는 06A에서 구현되며, 분석센터 세부 차트는 06B에서 확장합니다.'
  };
}

function qBuildDashboardReadyDataOnly() {
  var badge = document.getElementById('qmain-status-badge');
  var msg   = document.getElementById('qmain-status-msg');
  function setS(cls, txt, m) {
    if(badge){ badge.className = 'q-status-badge ' + cls; badge.textContent = txt; }
    if(msg) msg.textContent = m || '';
  }

  if(!QSUMMARY_DATA_READY || !QSUMMARY_DATA) {
    setS('q-badge-err', '데이터 없음', '분석 집계 Core를 먼저 생성하세요.');
    return;
  }

  QDASH_READY_WARNINGS = [];

  // 필터 Preview 우선 사용, 없으면 Core 사용
  var useFilter = !!(QSUMMARY_FILTER_PREVIEW && QSUMMARY_FILTER_PREVIEW.source);
  var src = useFilter ? QSUMMARY_FILTER_PREVIEW : QSUMMARY_DATA;
  var overview = src.overview || {};
  var dims = (useFilter ? src.dimensionPreview : src.dimensions) || {};
  var period = (useFilter ? src.periodPreview : (src.period && src.period.monthly)) || [];
  var matrices = (useFilter ? src.matrixPreview : src.matrices) || {};
  var audit = (useFilter ? src.auditPreview : src.audit) || {};

  var BLANK_LIKE = ['미분류','기타/미분류','기타','etc','없음','-','n/a',''];

  // ── dashboard dataset ──
  var kpiCards = [
    { label:'전체 불량', key:'totalDefects',             value: overview.totalDefects || 0 },
    { label:'치명/High', key:'criticalCount',            value: overview.criticalCount || 0 },
    { label:'경고 포함', key:'warningCount',              value: overview.warningCount || 0 },
    { label:'중복 후보', key:'duplicateCandidateCount',  value: overview.duplicateCandidateCount || 0 },
    { label:'필수 누락', key:'missingRequiredCount',     value: overview.missingRequiredCount || 0 },
    { label:'중요도 미분류', key:'unmappedSeverityCount', value: overview.unmappedSeverityCount || 0 }
  ];

  var periodTrendDataset = (Array.isArray(period) ? period : []).map(function(b) {
    return { periodKey: b.key, label: b.label || b.key, defectCount: b.defectCount,
             criticalCount: b.criticalCount, warningCount: b.warningCount,
             duplicateCandidateCount: b.duplicateCandidateCount, missingRequiredCount: b.missingRequiredCount,
             chartTypeHint: 'line_bar_combo' };
  });

  var sevDim = dims.severity || [];
  var totalDef = overview.totalDefects || 1;
  var severityDistributionDataset = sevDim.map(function(b) {
    return { severity: b.key, label: b.label || b.key, defectCount: b.defectCount,
             ratio: Math.round((b.defectCount / totalDef) * 10000) / 100,
             chartTypeHint: 'donut' };
  });

  var machDim = (dims.machine || []).slice(0, 30);
  var machineRiskDataset = machDim.map(function(b) {
    var rs = qCalculateDashboardRiskScoreOnly(b);
    return { machine: b.key, label: b.label || b.key, defectCount: b.defectCount,
             criticalCount: b.criticalCount, warningCount: b.warningCount,
             riskScore: Math.round(rs * 10) / 10, chartTypeHint: 'heatmap_or_grouped_bar' };
  });

  var catDim = (dims.categoryLarge || []).slice(0, 30);
  var cumul = 0;
  var categoryParetoDataset = catDim.map(function(b) {
    cumul += b.defectCount;
    return { category: b.key, label: b.label || b.key, defectCount: b.defectCount,
             cumulativeRatio: Math.round((cumul / totalDef) * 10000) / 100,
             chartTypeHint: 'pareto_horizontal_bar' };
  });

  var topIssueDataset = machineRiskDataset.slice(0, 10).map(function(b) {
    return { machine: b.machine, model: '—', severity: '치명/주요',
             category: '—', text: b.machine + ' 위험도 후보 점수 ' + b.riskScore,
             score: b.riskScore };
  });

  var auditDataset = {
    warningCount:     (audit.warningRows   || []).length,
    duplicateCount:   (audit.duplicateRows  || []).length,
    missingCount:     (audit.missingRows    || []).length,
    unmappedCount:    (audit.unmappedSeverityRows || []).length
  };

  // ── analysisCenter dataset ──
  var machineDataset = (dims.machine || []).slice(0, 30).map(function(b) {
    return Object.assign({}, b, { riskScore: Math.round(qCalculateDashboardRiskScoreOnly(b)*10)/10,
                                  chartTypeHint: 'grouped_bar+risk_heatmap' });
  });
  var modelDataset = (dims.model || []).slice(0, 30).map(function(b) {
    return Object.assign({}, b, { chartTypeHint: 'grouped_or_stacked_bar' });
  });
  var cellDataset = (dims.cell || []).slice(0, 30).map(function(b) {
    return Object.assign({}, b, { chartTypeHint: 'matrix_heatmap' });
  });
  function qMapPeriodDatasetOnly(arr, limit) {
    return (Array.isArray(arr) ? arr : []).slice(0, limit || 36).map(function(b) {
      return Object.assign({}, b, { chartTypeHint: 'line_bar_combo' });
    });
  }
  var periodDatasets = useFilter
    ? (function(){ var o={}; o[QSUMMARY_VIEW_FILTERS.periodLevel || 'monthly'] = qMapPeriodDatasetOnly(period, 50); return o; })()
    : {
        daily:     qMapPeriodDatasetOnly(src.period && src.period.daily, 50),
        weekly:    qMapPeriodDatasetOnly(src.period && src.period.weekly, 50),
        monthly:   qMapPeriodDatasetOnly(src.period && src.period.monthly, 36),
        quarterly: qMapPeriodDatasetOnly(src.period && src.period.quarterly, 20),
        yearly:    qMapPeriodDatasetOnly(src.period && src.period.yearly, 999)
      };
  var periodDataset = periodDatasets[QANALYSIS_CHART_VIEW_MODE.periodLevel || 'monthly'] || qMapPeriodDatasetOnly(period, 36);
  var categoryDataset = (dims.categoryLarge || []).slice(0, 30).map(function(b) {
    return Object.assign({}, b, { chartTypeHint: 'pareto+horizontal_bar' });
  });
  function qTagMatrixDatasetOnly(arr, matrixType) {
    return (Array.isArray(arr) ? arr : Object.values(arr || {})).map(function(b) {
      return Object.assign({}, b, { matrixType: matrixType, chartTypeHint: 'heatmap_matrix' });
    });
  }
  var severityMatrixDataset = []
    .concat(qTagMatrixDatasetOnly(matrices.machineSeverity, 'machine').slice(0,100))
    .concat(qTagMatrixDatasetOnly(matrices.modelSeverity, 'model').slice(0,100))
    .concat(qTagMatrixDatasetOnly(matrices.cellSeverity, 'cell').slice(0,100))
    .concat(qTagMatrixDatasetOnly(matrices.categorySeverity, 'category').slice(0,100));
  // calendar: daily 데이터가 있을 때만
  var calData = useFilter ? [] : ((src.period && src.period.daily) || []);
  var calendarDataset = calData.slice(0, 365).map(function(b) {
    return { date: b.key, defectCount: b.defectCount, criticalCount: b.criticalCount, chartTypeHint: 'calendar_heatmap' };
  });

  // ── codeMapping dataset ──
  var allDims = ['severity','machine','model','categoryLarge','categoryMiddle','categorySmall'];
  var unmapRank = [];
  allDims.forEach(function(dk) {
    (dims[dk] || []).forEach(function(b) {
      if(BLANK_LIKE.indexOf((b.label||b.key||'').toLowerCase().trim()) >= 0) {
        unmapRank.push({ field: dk, value: b.key, count: b.defectCount, suggestedAction: '코드화 후보' });
      }
    });
  });
  unmapRank.sort(function(a,b){ return b.count - a.count; });

  var gitaCandidates = unmapRank.filter(function(u){ return u.value && u.value.trim() !== ''; }).slice(0, 30);
  var stdCandidates  = (dims.categoryLarge || []).filter(function(b){ return BLANK_LIKE.indexOf((b.label||'').toLowerCase().trim()) < 0; }).slice(0, 20).map(function(b){
    return { field:'categoryLarge', value:b.key, count:b.defectCount, suggestedAction:'기준정보 등록 후보' };
  });

  var readyData = {
    version: 'Q_REBUILD_08I_DATA_MANAGEMENT_PAGES_PURPOSE_REDESIGN',
    generatedAt: new Date().toISOString(),
    source: {
      summaryDataReady: QSUMMARY_DATA_READY,
      summaryFilterPreviewAvailable: useFilter,
      normalizedRows: QISSUE_NORMALIZED_ROWS ? QISSUE_NORMALIZED_ROWS.length : 0,
      filteredRows: useFilter ? (QSUMMARY_FILTER_PREVIEW.source.filteredRows || 0) : (overview.totalDefects || 0),
      activeFilterMode: useFilter ? 'filter_preview' : 'summary_core'
    },
    dashboard: {
      kpiCards: kpiCards,
      periodTrendDataset: periodTrendDataset,
      severityDistributionDataset: severityDistributionDataset,
      machineRiskDataset: machineRiskDataset,
      categoryParetoDataset: categoryParetoDataset,
      topIssueDataset: topIssueDataset,
      auditDataset: auditDataset
    },
    analysisCenter: {
      machineDataset: machineDataset,
      modelDataset: modelDataset,
      cellDataset: cellDataset,
      periodDataset: periodDataset,
      periodDatasets: periodDatasets,
      categoryDataset: categoryDataset,
      severityMatrixDataset: severityMatrixDataset,
      calendarDataset: calendarDataset
    },
    codeMapping: {
      unmappedRankingDataset: unmapRank.slice(0, 30),
      기타분류CandidateDataset: gitaCandidates,
      standardCodeCandidateDataset: stdCandidates
    },
    chartContracts: {},
    warnings: QDASH_READY_WARNINGS
  };

  QDASH_CHART_BLUEPRINT  = qBuildDashboardChartBlueprintOnly(readyData);
  readyData.chartContracts = QDASH_CHART_BLUEPRINT;
  QDASH_READY_DATA       = readyData;
  QDASH_READY_GENERATED_AT = readyData.generatedAt;
  QDASH_READY_META = {
    version: 'Q_REBUILD_08I_DATA_MANAGEMENT_PAGES_PURPOSE_REDESIGN',
    activeFilterMode: readyData.source.activeFilterMode,
    filteredRows: readyData.source.filteredRows,
    blueprintCount: QDASH_CHART_BLUEPRINT.chartCount,
    generatedAt: QDASH_READY_GENERATED_AT
  };

  setS('q-badge-ok', 'Dashboard Ready 완료',
    '대시보드/분석센터 차트 구현 전 데이터 계약이 생성되었습니다. 대시보드 차트는 06A에서 구현되었습니다.');
  qRenderDashboardReadyReviewPanel();
}

function qRenderDashboardReadyReviewPanel() {
  // q-dash-ready-wrap id를 동적으로 찾거나 생성
  var wrap = document.getElementById('q-dash-ready-wrap');
  if(!wrap) {
    // q-summary-filter-preview-wrap 또는 q-summary-core-wrap 다음에 삽입
    var anchor = document.getElementById('q-summary-filter-preview-wrap') ||
                 document.getElementById('q-summary-core-wrap');
    if(!anchor) return;
    var d = document.createElement('div');
    d.id = 'q-dash-ready-wrap';
    anchor.parentNode.insertBefore(d, anchor.nextSibling);
    wrap = d;
  }
  if(!QDASH_READY_DATA) { wrap.innerHTML = ''; return; }

  var div = document.createElement('div');
  div.className = 'q-dash-ready';
  var reviewedBadge = QDASH_READY_REVIEWED
    ? '<span class="q-normalized-locked">검토 완료</span>'
    : '<span class="q-normalized-unlocked">검토 전</span>';
  var now = QDASH_READY_GENERATED_AT ? QDASH_READY_GENERATED_AT.replace('T',' ').slice(0,19) : '—';
  var rd = QDASH_READY_DATA;

  div.innerHTML =
    '<div class="q-panel-hd" style="margin-bottom:8px">🚀 Dashboard Ready — 차트 구현 전 데이터 계약</div>' +
    '<div class="q-dash-ready-card">' +
      '<div class="q-sheet-summary-row">' +
        '<span class="q-sheet-lbl">데이터 모드</span><span class="q-sheet-val q-badge-ok">' + (rd.source.activeFilterMode || '—') + '</span>' +
        '<span class="q-sheet-lbl">기준 행</span><span class="q-sheet-val">' + rd.source.filteredRows + '건</span>' +
        '<span class="q-sheet-lbl">chart blueprint</span><span class="q-sheet-val">' + (QDASH_CHART_BLUEPRINT ? QDASH_CHART_BLUEPRINT.chartCount : 0) + '개</span>' +
        '<span class="q-sheet-lbl">생성 시간</span><span class="q-sheet-val">' + now + '</span>' +
        '<span class="q-sheet-lbl">검토 상태</span><span class="q-sheet-val">' + reviewedBadge + '</span>' +
      '</div>' +
    '</div>' +
    '<div id="q-dash-dataset-preview" style="margin-top:10px"></div>' +
    '<div id="q-dash-blueprint-panel" style="margin-top:10px"></div>' +
    '<div class="q-dash-actions" style="margin-top:12px">' +
      '<button class="q-btn-readiness" onclick="qApplyDashboardReadyReviewOnly()">✔ Dashboard Ready 검토 완료</button>' +
      '<button class="q-btn-filter-reset" onclick="qResetDashboardReadyOnly()">↩ Dashboard Ready 초기화</button>' +
    '</div>';

  wrap.innerHTML = '';
  wrap.appendChild(div);
  qRenderDashboardDatasetPreviewOnly(rd);
  qRenderDashboardChartBlueprintReviewOnly(QDASH_CHART_BLUEPRINT);
}

function qRenderDashboardDatasetPreviewOnly(data) {
  var panel = document.getElementById('q-dash-dataset-preview');
  if(!panel || !data) return;
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // KPI
  var kpiHtml = '<div class="q-summary-overview">' +
    (data.dashboard.kpiCards || []).map(function(k) {
      var color = k.key==='criticalCount'?'#ef4444':k.key==='warningCount'?'#f59e0b':k.key==='totalDefects'?'#818cf8':'#94a3b8';
      return '<div class="q-summary-kpi"><div class="q-summary-kpi-val" style="color:' + color + '">' + k.value + '</div><div class="q-summary-kpi-lbl">' + _e(k.label) + '</div></div>';
    }).join('') + '</div>';

  // Period Trend 상위 20건 table
  var ptArr = (data.dashboard.periodTrendDataset || []).slice(-20);
  var ptRows = ptArr.map(function(b){ return '<tr><td>' + _e(b.periodKey) + '</td><td>' + b.defectCount + '</td><td>' + b.criticalCount + '</td><td>' + (b.chartTypeHint||'') + '</td></tr>'; }).join('');

  // Machine Risk 상위 20건
  var mrArr = (data.dashboard.machineRiskDataset || []).slice(0,20);
  var mrRows = mrArr.map(function(b){ return '<tr><td>' + _e(b.machine) + '</td><td>' + b.defectCount + '</td><td>' + b.criticalCount + '</td><td>' + b.riskScore + '</td></tr>'; }).join('');

  // Severity Distribution
  var sdArr = data.dashboard.severityDistributionDataset || [];
  var sdRows = sdArr.map(function(b){ return '<tr><td>' + _e(b.severity) + '</td><td>' + b.defectCount + '</td><td>' + b.ratio + '%</td></tr>'; }).join('');

  // Category Pareto 상위 20건
  var cpArr = (data.dashboard.categoryParetoDataset || []).slice(0,20);
  var cpRows = cpArr.map(function(b){ return '<tr><td>' + _e(b.category) + '</td><td>' + b.defectCount + '</td><td>' + b.cumulativeRatio + '%</td></tr>'; }).join('');

  // codeMapping unmapped
  var umArr = (data.codeMapping && data.codeMapping.unmappedRankingDataset || []).slice(0,20);
  var umRows = umArr.map(function(b){ return '<tr><td>' + _e(b.field) + '</td><td>' + _e(b.value) + '</td><td>' + b.count + '</td><td>' + _e(b.suggestedAction) + '</td></tr>'; }).join('');

  function tbl(title, headers, rows) {
    if(!rows) return '';
    return '<div style="margin-bottom:10px">' +
      '<div class="q-panel-hd" style="margin-bottom:4px">' + title + '</div>' +
      '<div style="overflow-x:auto;max-height:120px;overflow-y:auto">' +
      '<table class="q-dash-ready-table"><thead><tr>' + headers.map(function(h){ return '<th>' + h + '</th>'; }).join('') + '</tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></div>';
  }

  panel.innerHTML =
    '<div class="q-panel-hd" style="margin-bottom:6px">📊 Dashboard Dataset Preview</div>' +
    kpiHtml +
    tbl('기간 추이 Dataset (최신 20건)', ['기간','건수','치명','차트 유형'], ptRows) +
    tbl('중요도 분포 Dataset', ['중요도','건수','비율'], sdRows) +
    tbl('호기 위험도 Dataset (상위 20건)', ['호기','건수','치명','위험도 점수'], mrRows) +
    tbl('분류 Pareto Dataset (상위 20건)', ['대분류','건수','누적 비율'], cpRows) +
    tbl('미분류 코드화 후보 (상위 20건)', ['필드','값','건수','조치'], umRows);
}

function qRenderDashboardChartBlueprintReviewOnly(blueprint) {
  var panel = document.getElementById('q-dash-blueprint-panel');
  if(!panel || !blueprint) return;
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var bpRows = (blueprint.blueprints || []).map(function(b) {
    return '<tr>' +
      '<td>' + _e(b.area) + '</td>' +
      '<td>' + _e(b.chartName) + '</td>' +
      '<td><span class="q-chart-plan-chip">' + _e(b.chartType) + '</span></td>' +
      '<td>' + _e(b.purpose) + '</td>' +
      '<td>' + _e(b.implementedAt) + '</td>' +
    '</tr>';
  }).join('');

  var noteHtml = (blueprint.designNotes || []).map(function(n){
    return '<div style="font-size:10px;padding:3px 0;border-bottom:1px solid var(--bd)">• ' + _e(n) + '</div>';
  }).join('');

  panel.innerHTML =
    '<div class="q-panel-hd" style="margin-bottom:6px">🗂 Chart Blueprint (' + blueprint.chartCount + '개)</div>' +
    '<div style="overflow-x:auto;max-height:200px;overflow-y:auto">' +
    '<table class="q-dash-blueprint-table">' +
      '<thead><tr><th>영역</th><th>차트명</th><th>차트 유형</th><th>목적</th><th>구현 시점</th></tr></thead>' +
      '<tbody>' + bpRows + '</tbody>' +
    '</table></div>' +
    '<div style="margin-top:8px;padding:8px;background:rgba(245,158,11,.07);border:1px solid rgba(245,158,11,.2);border-radius:7px;font-size:10px;color:#f59e0b">' +
      _e(blueprint.warning || '') +
    '</div>' +
    '<div style="margin-top:8px">' + noteHtml + '</div>';
}

function qApplyDashboardReadyReviewOnly() {
  var badge = document.getElementById('qmain-status-badge');
  var msg   = document.getElementById('qmain-status-msg');
  if(!QDASH_READY_DATA || !QDASH_CHART_BLUEPRINT) {
    if(msg) msg.textContent = '대시보드 Ready 데이터를 먼저 구성하세요.';
    return;
  }
  QDASH_READY_REVIEWED = true;
  if(badge){ badge.className='q-status-badge q-badge-ok'; badge.textContent='Dashboard Ready 검토 완료'; }
  if(msg) msg.textContent = '대시보드/분석센터 차트 구현 전 데이터 계약 검토가 완료되었습니다. 06A 대시보드 차트 구현 단계로 연결되었습니다. 분석센터 차트는 06B에서 확장합니다.';
  qRenderDashboardReadyReviewPanel();
}

function qResetDashboardReadyOnly() {
  var msg = document.getElementById('qmain-status-msg');
  QDASH_READY_DATA       = null;
  QDASH_READY_WARNINGS   = [];
  QDASH_READY_GENERATED_AT = null;
  QDASH_READY_META       = null;
  QDASH_CHART_BLUEPRINT  = null;
  QDASH_READY_REVIEWED   = false;
  QDASH_CHART_RENDERED   = false;
  QDASH_CHART_RENDERED_AT= null;
  QDASH_CHART_VIEW_MODE  = { periodLevel:'monthly', topLimit:10 };
  QDASH_CHART_WARNINGS   = [];
  var wrap = document.getElementById('q-dash-ready-wrap');
  if(wrap) wrap.innerHTML = '';
  if(msg) msg.textContent = 'Dashboard Ready 데이터를 초기화했습니다.';
}

// ── 헬퍼 함수들 ──────────────────────────────────────────────────────────

function qGetDashboardChartPaletteOnly() {
  return {
    defect:     '#6366f1',
    defectLight:'rgba(99,102,241,.15)',
    critical:   '#ef4444',
    criticalLight:'rgba(239,68,68,.15)',
    warning:    '#f59e0b',
    warningLight:'rgba(245,158,11,.15)',
    major:      '#f97316',
    normal:     '#22c55e',
    minor:      '#94a3b8',
    unmapped:   '#8b5cf6',
    riskHigh:   '#ef4444',
    riskMid:    '#f59e0b',
    riskLow:    '#22c55e',
    axis:       'var(--tm)',
    grid:       'var(--bd)',
    bg:         'transparent'
  };
}

function qSvgEl(tag, attrs, children) {
  var NS = 'http://www.w3.org/2000/svg';
  var el = document.createElementNS(NS, tag);
  if(attrs) Object.keys(attrs).forEach(function(k){ el.setAttribute(k, attrs[k]); });
  if(children) children.forEach(function(c){ if(c) el.appendChild(c); });
  return el;
}

function qScaleLinear(value, inMin, inMax, outMin, outMax) {
  if(inMax === inMin) return outMin;
  return outMin + (value - inMin) / (inMax - inMin) * (outMax - outMin);
}

function qFormatNum(value) {
  if(value === null || value === undefined) return '0';
  var n = Number(value);
  if(isNaN(n)) return '0';
  if(n >= 10000) return Math.round(n/1000) + 'k';
  if(n >= 1000) return (n/1000).toFixed(1) + 'k';
  return String(Math.round(n * 10) / 10);
}

function qClampNumber(value, min, max) {
  return Math.min(Math.max(Number(value) || 0, min), max);
}

// ── KPI 카드 렌더 ─────────────────────────────────────────────────────────

function qRenderDashboardKpiCards(data, containerId) {
  var wrap = document.getElementById(containerId);
  if(!wrap || !data) return;
  var pal = qGetDashboardChartPaletteOnly();
  var kpis = data.dashboard.kpiCards || [];
  var COLOR_MAP = {
    totalDefects: pal.defect,
    criticalCount: pal.critical,
    warningCount: pal.warning,
    duplicateCandidateCount: pal.major,
    missingRequiredCount: '#f59e0b',
    unmappedSeverityCount: pal.unmapped
  };
  var ICON_MAP = {
    totalDefects:'📦', criticalCount:'🔴', warningCount:'⚠️',
    duplicateCandidateCount:'🔁', missingRequiredCount:'❓', unmappedSeverityCount:'🔀'
  };
  wrap.innerHTML = '';
  var grid = document.createElement('div');
  grid.className = 'q-dash-chart-kpis';
  kpis.forEach(function(k) {
    var c = COLOR_MAP[k.key] || pal.defect;
    var d = document.createElement('div');
    d.className = 'q-dash-chart-card q-dash-kpi-card';
    d.style.borderTop = '3px solid ' + c;
    d.innerHTML =
      '<div class="q-dash-kpi-icon">' + (ICON_MAP[k.key] || '📊') + '</div>' +
      '<div class="q-dash-kpi-val" style="color:' + c + '">' + qFormatNum(k.value) + '</div>' +
      '<div class="q-dash-kpi-lbl">' + k.label + '</div>';
    grid.appendChild(d);
  });
  wrap.appendChild(grid);
}

// ── 기간별 추이 Line + Bar Combo ─────────────────────────────────────────

function qRenderDashboardPeriodTrendChart(data, containerId) {
  var wrap = document.getElementById(containerId);
  if(!wrap) return;
  var arr = (data && data.dashboard && data.dashboard.periodTrendDataset) ? data.dashboard.periodTrendDataset.slice(-36) : [];
  if(!arr.length) {
    wrap.innerHTML = '<div class="q-chart-empty">기간 추이 데이터가 없습니다.</div>';
    return;
  }
  var pal = qGetDashboardChartPaletteOnly();
  var W = 520, H = 200, PAD = { top:20, right:20, bottom:40, left:44 };
  var cW = W - PAD.left - PAD.right;
  var cH = H - PAD.top - PAD.bottom;

  var maxDef = Math.max.apply(null, arr.map(function(d){ return d.defectCount||0; })) || 1;
  var maxCrit= Math.max.apply(null, arr.map(function(d){ return d.criticalCount||0; })) || 1;
  var maxY   = Math.max(maxDef, 1);

  var barW  = Math.max(3, Math.floor(cW / arr.length) - 2);
  var xStep = cW / arr.length;

  var svg = qSvgEl('svg', { viewBox:'0 0 '+W+' '+H, class:'q-chart-svg', style:'width:100%;height:auto' });
  var g   = qSvgEl('g', { transform:'translate('+PAD.left+','+PAD.top+')' });

  // grid lines
  [0, 0.25, 0.5, 0.75, 1].forEach(function(t) {
    var y = cH - t*cH;
    g.appendChild(qSvgEl('line', { x1:0, y1:y, x2:cW, y2:y, stroke:'var(--bd)', 'stroke-width':'0.5', 'stroke-dasharray':'3,3' }));
    if(t > 0) g.appendChild(qSvgEl('text', { x:-4, y:y+4, 'text-anchor':'end', 'font-size':'8', fill:'var(--tm)' })).textContent = qFormatNum(maxY * t);
  });
  // bars (defectCount)
  arr.forEach(function(d, i) {
    var x = i * xStep + (xStep - barW) / 2;
    var h = qScaleLinear(d.defectCount||0, 0, maxY, 0, cH);
    g.appendChild(qSvgEl('rect', { x:x, y:cH-h, width:barW, height:h, fill:pal.defect, rx:'2', opacity:'0.8' }));
  });
  // line (criticalCount)
  var pts = arr.map(function(d, i){
    var x = i * xStep + xStep/2;
    var y = cH - qScaleLinear(d.criticalCount||0, 0, maxY, 0, cH);
    return x+','+y;
  });
  if(pts.length > 1) {
    g.appendChild(qSvgEl('polyline', { points:pts.join(' '), fill:'none', stroke:pal.critical, 'stroke-width':'2', 'stroke-linejoin':'round' }));
    arr.forEach(function(d, i) {
      if(d.criticalCount > 0) {
        var x = i * xStep + xStep/2;
        var y = cH - qScaleLinear(d.criticalCount, 0, maxY, 0, cH);
        g.appendChild(qSvgEl('circle', { cx:x, cy:y, r:'3', fill:pal.critical }));
      }
    });
  }
  // x labels (show max 12 evenly)
  var step = Math.ceil(arr.length / 12);
  arr.forEach(function(d, i) {
    if(i % step === 0) {
      var x = i * xStep + xStep/2;
      var lbl = String(d.periodKey || '').slice(-5);
      var t = qSvgEl('text', { x:x, y:cH+14, 'text-anchor':'middle', 'font-size':'8', fill:'var(--tm)' });
      t.textContent = lbl;
      g.appendChild(t);
    }
  });
  // y axis
  g.appendChild(qSvgEl('line', { x1:0, y1:0, x2:0, y2:cH, stroke:'var(--bd)', 'stroke-width':'1' }));

  svg.appendChild(g);
  // legend
  var legHtml =
    '<div class="q-chart-legend">' +
    '<span style="background:' + pal.defect + '">불량 건수</span>' +
    '<span style="background:' + pal.critical + '">치명/High</span>' +
    '</div>';
  wrap.innerHTML = '';
  wrap.appendChild(svg);
  var leg = document.createElement('div'); leg.innerHTML = legHtml;
  wrap.appendChild(leg.firstChild);
}

// ── 중요도 Donut ──────────────────────────────────────────────────────────

function qRenderDashboardSeverityDonut(data, containerId) {
  var wrap = document.getElementById(containerId);
  if(!wrap) return;
  var arr = (data && data.dashboard && data.dashboard.severityDistributionDataset) ? data.dashboard.severityDistributionDataset : [];
  if(!arr.length) { wrap.innerHTML = '<div class="q-chart-empty">중요도 데이터 없음</div>'; return; }
  var pal = qGetDashboardChartPaletteOnly();
  var SEV_COLOR = { critical:pal.critical, major:pal.major, normal:pal.normal, minor:pal.minor, unmapped:pal.unmapped };
  var SEV_LABEL = { critical:'치명', major:'주요', normal:'보통', minor:'경미', unmapped:'미분류' };

  var CX = 80, CY = 80, R = 60, IR = 35;
  var total = arr.reduce(function(s,d){ return s+(d.defectCount||0); }, 0) || 1;
  var startAngle = -Math.PI / 2;

  var svgW = 200, svgH = 170;
  var svg = qSvgEl('svg', { viewBox:'0 0 '+svgW+' '+svgH, class:'q-chart-svg', style:'width:100%;max-width:200px;height:auto;display:block;margin:auto' });

  arr.forEach(function(d) {
    var frac = (d.defectCount||0) / total;
    if(frac <= 0) return;
    var angle = frac * 2 * Math.PI;
    var endAngle = startAngle + angle;
    var x1 = CX + R * Math.cos(startAngle);
    var y1 = CY + R * Math.sin(startAngle);
    var x2 = CX + R * Math.cos(endAngle);
    var y2 = CY + R * Math.sin(endAngle);
    var xi1 = CX + IR * Math.cos(startAngle);
    var yi1 = CY + IR * Math.sin(startAngle);
    var xi2 = CX + IR * Math.cos(endAngle);
    var yi2 = CY + IR * Math.sin(endAngle);
    var large = angle > Math.PI ? '1' : '0';
    var col = SEV_COLOR[d.severity] || pal.unmapped;
    var path = 'M ' + x1 + ' ' + y1 +
               ' A ' + R + ' ' + R + ' 0 ' + large + ' 1 ' + x2 + ' ' + y2 +
               ' L ' + xi2 + ' ' + yi2 +
               ' A ' + IR + ' ' + IR + ' 0 ' + large + ' 0 ' + xi1 + ' ' + yi1 + ' Z';
    svg.appendChild(qSvgEl('path', { d:path, fill:col, opacity:'0.9', stroke:'var(--sf)', 'stroke-width':'0.5' }));
    // label (frac > 5%)
    if(frac > 0.05) {
      var midA = startAngle + angle/2;
      var lx = CX + (R+8) * Math.cos(midA);
      var ly = CY + (R+8) * Math.sin(midA);
      var t = qSvgEl('text', { x:lx, y:ly, 'text-anchor':'middle', 'font-size':'8', fill:'var(--ts)' });
      t.textContent = Math.round(frac*100) + '%';
      svg.appendChild(t);
    }
    startAngle = endAngle;
  });
  // center text
  var ct = qSvgEl('text', { x:CX, y:CY-5, 'text-anchor':'middle', 'font-size':'11', 'font-weight':'700', fill:'var(--ts)' });
  ct.textContent = qFormatNum(total);
  svg.appendChild(ct);
  var cs = qSvgEl('text', { x:CX, y:CY+9, 'text-anchor':'middle', 'font-size':'8', fill:'var(--tm)' });
  cs.textContent = '총 불량';
  svg.appendChild(cs);

  // legend right side
  var legY = 10;
  arr.slice(0,6).forEach(function(d) {
    var col = SEV_COLOR[d.severity] || pal.unmapped;
    svg.appendChild(qSvgEl('rect', { x:165, y:legY, width:8, height:8, fill:col, rx:'2' }));
    var lt = qSvgEl('text', { x:176, y:legY+7, 'font-size':'8', fill:'var(--tm)' });
    lt.textContent = (SEV_LABEL[d.severity]||d.severity) + ':' + (d.defectCount||0);
    svg.appendChild(lt);
    legY += 13;
  });

  wrap.innerHTML = '';
  wrap.appendChild(svg);
}

// ── 호기별 위험도 Grouped Bar ─────────────────────────────────────────────

function qRenderDashboardMachineRiskChart(data, containerId) {
  var wrap = document.getElementById(containerId);
  if(!wrap) return;
  var arr = (data && data.dashboard && data.dashboard.machineRiskDataset) ? data.dashboard.machineRiskDataset.slice(0,12) : [];
  if(!arr.length) { wrap.innerHTML = '<div class="q-chart-empty">호기 데이터 없음</div>'; return; }
  var pal = qGetDashboardChartPaletteOnly();

  var maxDef  = Math.max.apply(null, arr.map(function(d){ return d.defectCount||0; })) || 1;
  var maxRisk = Math.max.apply(null, arr.map(function(d){ return d.riskScore||0; })) || 1;

  var rows = arr.map(function(d) {
    var defPct   = qClampNumber((d.defectCount||0) / maxDef * 100, 0, 100);
    var critPct  = qClampNumber((d.criticalCount||0) / maxDef * 100, 0, 100);
    var riskPct  = qClampNumber((d.riskScore||0) / maxRisk * 100, 0, 100);
    var riskCol  = riskPct >= 70 ? pal.riskHigh : riskPct >= 40 ? pal.riskMid : pal.riskLow;
    var riskLbl  = riskPct >= 70 ? 'HIGH' : riskPct >= 40 ? 'MID' : 'LOW';
    return '<div class="q-chart-risk-row">' +
      '<div class="q-chart-risk-name">' + String(d.machine||d.label||'—').slice(0,8) + '</div>' +
      '<div class="q-chart-risk-bars">' +
        '<div class="q-chart-risk-bar-wrap"><div class="q-chart-risk-bar" style="width:' + defPct + '%;background:' + pal.defect + '"></div></div>' +
        '<div class="q-chart-risk-bar-wrap"><div class="q-chart-risk-bar" style="width:' + critPct + '%;background:' + pal.critical + ';opacity:.8"></div></div>' +
      '</div>' +
      '<div class="q-chart-risk-vals">' +
        '<span>' + (d.defectCount||0) + '</span>' +
        '<span style="color:' + pal.critical + '">' + (d.criticalCount||0) + '</span>' +
      '</div>' +
      '<div class="q-chart-risk-chip" style="background:' + riskCol + '20;color:' + riskCol + ';border:1px solid ' + riskCol + '40">' +
        riskLbl + ' ' + Math.round(d.riskScore||0) +
      '</div>' +
    '</div>';
  }).join('');

  wrap.innerHTML =
    '<div class="q-chart-risk-header">' +
      '<span class="q-chart-risk-name" style="font-weight:700">호기</span>' +
      '<span class="q-chart-risk-bars" style="font-size:9px;color:var(--tm)">건수▸ / 치명▸</span>' +
      '<span class="q-chart-risk-vals"><span>건수</span><span>치명</span></span>' +
      '<span style="font-size:9px;color:var(--tm)">위험도</span>' +
    '</div>' + rows;
}

// ── 분류 Pareto + Horizontal Bar ─────────────────────────────────────────

function qRenderDashboardCategoryPareto(data, containerId) {
  var wrap = document.getElementById(containerId);
  if(!wrap) return;
  var arr = (data && data.dashboard && data.dashboard.categoryParetoDataset) ? data.dashboard.categoryParetoDataset.slice(0,15) : [];
  if(!arr.length) { wrap.innerHTML = '<div class="q-chart-empty">분류 데이터 없음</div>'; return; }
  var pal = qGetDashboardChartPaletteOnly();

  var maxDef = Math.max.apply(null, arr.map(function(d){ return d.defectCount||0; })) || 1;
  var reached80 = false;

  var rows = arr.map(function(d, i) {
    var barPct = qClampNumber((d.defectCount||0) / maxDef * 100, 0, 100);
    var cumul  = d.cumulativeRatio || 0;
    var is80   = (!reached80 && cumul >= 80);
    if(is80) reached80 = true;
    var barCol  = is80 ? pal.warning : pal.defect;
    var cumulBadge = is80
      ? '<span class="q-chart-pareto-80">▶80%</span>' : '';
    return '<div class="q-chart-pareto-row">' +
      '<div class="q-chart-pareto-name">' + String(d.category||d.label||'—').slice(0,10) + cumulBadge + '</div>' +
      '<div class="q-chart-pareto-bar-wrap">' +
        '<div class="q-chart-pareto-bar" style="width:' + barPct + '%;background:' + barCol + '"></div>' +
      '</div>' +
      '<div class="q-chart-pareto-vals">' +
        '<span>' + (d.defectCount||0) + '</span>' +
        '<span style="color:var(--tm)">' + Math.round(cumul) + '%</span>' +
      '</div>' +
    '</div>';
  }).join('');

  wrap.innerHTML =
    '<div class="q-chart-pareto-header">' +
      '<span class="q-chart-pareto-name">분류</span>' +
      '<span class="q-chart-pareto-bar-wrap" style="font-size:9px;color:var(--tm)">비중▸</span>' +
      '<span class="q-chart-pareto-vals"><span>건수</span><span>누적%</span></span>' +
    '</div>' + rows;
}

// ── Bottom Insight Panels ─────────────────────────────────────────────────

function qRenderDashboardBottomInsightPanels(data, containerId) {
  var wrap = document.getElementById(containerId);
  if(!wrap || !data) return;
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var pal = qGetDashboardChartPaletteOnly();

  // Top Issues table
  var topArr = (data.dashboard.topIssueDataset || []).slice(0, 10);
  var topRows = topArr.map(function(d, i) {
    return '<tr><td>' + (i+1) + '</td><td>' + _e(d.machine) + '</td><td>' + _e(d.severity||'—') + '</td><td>' + _e(d.category||'—') + '</td><td style="color:' + pal.critical + ';font-weight:700">' + (d.score||0) + '</td></tr>';
  }).join('');
  if(!topRows) topRows = '<tr><td colspan="5" style="text-align:center;color:var(--tm)">데이터 없음</td></tr>';

  // Audit summary
  var aud = data.dashboard.auditDataset || {};
  var audHtml =
    '<div class="q-dash-audit-grid">' +
    [['경고 포함',aud.warningCount||0,pal.warning],
     ['중복 후보',aud.duplicateCount||0,pal.major],
     ['필수 누락',aud.missingCount||0,pal.critical],
     ['중요도 미분류',aud.unmappedCount||0,pal.unmapped]]
    .map(function(kv){
      return '<div class="q-dash-audit-item"><div style="font-size:18px;font-weight:800;color:' + kv[2] + '">' + kv[1] + '</div><div style="font-size:10px;color:var(--tm)">' + kv[0] + '</div></div>';
    }).join('') + '</div>';

  // Unmapped candidates
  var umArr = (data.codeMapping && data.codeMapping.unmappedRankingDataset || []).slice(0, 10);
  var umRows = umArr.map(function(d, i) {
    return '<tr><td>' + (i+1) + '</td><td>' + _e(d.field) + '</td><td>' + _e(d.value) + '</td><td>' + (d.count||0) + '</td><td>' + _e(d.suggestedAction||'—') + '</td></tr>';
  }).join('');
  if(!umRows) umRows = '<tr><td colspan="5" style="text-align:center;color:var(--tm)">미분류 후보 없음</td></tr>';

  wrap.innerHTML =
    '<div class="q-chart-insight-grid">' +
      '<div class="q-dash-chart-card">' +
        '<div class="q-chart-title">🔥 Top Issue 후보 (위험도 기준)</div>' +
        '<div style="overflow-x:auto"><table class="q-chart-insight-table"><thead><tr><th>#</th><th>호기</th><th>중요도</th><th>분류</th><th>위험도점수</th></tr></thead>' +
        '<tbody>' + topRows + '</tbody></table></div>' +
      '</div>' +
      '<div class="q-dash-chart-card">' +
        '<div class="q-chart-title">🔎 Audit 요약</div>' +
        audHtml +
      '</div>' +
      '<div class="q-dash-chart-card">' +
        '<div class="q-chart-title">🗂 미분류/코드화 후보</div>' +
        '<div style="overflow-x:auto"><table class="q-chart-insight-table"><thead><tr><th>#</th><th>필드</th><th>값</th><th>건수</th><th>조치</th></tr></thead>' +
        '<tbody>' + umRows + '</tbody></table></div>' +
      '</div>' +
    '</div>';
}

// ── 대시보드 차트 진입 함수 ───────────────────────────────────────────────

function qRenderQualityDashboardCharts() {
  var page = document.getElementById('page-quality-dash');
  if(!page) return;

  QDASH_CHART_WARNINGS = [];

  if(!QDASH_READY_DATA) {
    page.innerHTML =
      '<div class="pg-hd"><div class="pg-title">📊 품질 통합 대시보드</div></div>' +
      '<div class="q-dash-chart-card" style="margin:16px;text-align:center;padding:32px;">' +
        '<div style="font-size:32px;margin-bottom:12px">📋</div>' +
        '<div style="font-size:14px;font-weight:700;margin-bottom:8px">Dashboard Ready 데이터가 없습니다.</div>' +
        '<div style="font-size:11px;color:var(--tm);margin-bottom:16px">불량 관리 센터에서 업로드 → Raw 생성 → 이슈 생성 → 정규화 잠금본 → Summary Core → Dashboard Ready 검토까지 완료하세요.</div>' +
        '<button class="q-btn-readiness" onclick="nav(\'quality-main\')">🔬 불량 관리 센터로 이동</button>' +
      '</div>';
    return;
  }

  var reviewedBadge = QDASH_READY_REVIEWED
    ? '<span class="q-badge-ok" style="font-size:10px;padding:2px 8px;border-radius:8px">✔ 검토 완료</span>'
    : '<span class="q-normalized-unlocked" style="font-size:10px;padding:2px 8px;border-radius:8px">검토 전</span>';

  var m = QDASH_READY_META || {};

  page.innerHTML =
    '<div class="pg-hd">' +
      '<div class="pg-title">📊 품질 통합 대시보드</div>' +
      '<div class="pg-sub">업로드된 불량 접수방 데이터 정규화/집계 기반 차트 ' + reviewedBadge +
        ' &nbsp;모드: ' + (m.activeFilterMode||'—') +
        ' &nbsp;기준: ' + (m.filteredRows||0) + '건' +
        ' &nbsp;blueprint: ' + (m.blueprintCount||0) + '개</div>' +
    '</div>' +
    '<div class="q-dash-chart-toolbar">' +
      '<button class="q-btn-readiness" onclick="qRenderQualityDashboardCharts()">⟳ 차트 새로고침</button>' +
      '<select id="q-dash-period-sel" onchange="QDASH_CHART_VIEW_MODE.periodLevel=this.value; qRenderQualityDashboardCharts();" style="font-size:10px;padding:3px 8px;border-radius:5px;border:1px solid var(--bd);background:var(--sf);color:var(--ts)">' +
        ['daily','weekly','monthly','quarterly','yearly'].map(function(v){
          return '<option value="'+v+'"'+(QDASH_CHART_VIEW_MODE.periodLevel===v?' selected':'')+'>'+v+'</option>';
        }).join('') +
      '</select>' +
    '</div>' +
    '<div id="q-dash-kpi-wrap" style="margin-bottom:14px"></div>' +
    '<div class="q-dash-chart-grid" style="margin-bottom:14px">' +
      '<div class="q-dash-chart-card q-span2">' +
        '<div class="q-chart-title">📈 기간별 불량 추이</div>' +
        '<div class="q-chart-subtitle">불량 건수(막대) + 치명/High(선) 동시 확인</div>' +
        '<div id="q-dash-period-chart"></div>' +
      '</div>' +
      '<div class="q-dash-chart-card">' +
        '<div class="q-chart-title">🍩 중요도 분포</div>' +
        '<div class="q-chart-subtitle">severity breakdown</div>' +
        '<div id="q-dash-donut-chart"></div>' +
      '</div>' +
    '</div>' +
    '<div class="q-dash-chart-grid-2" style="margin-bottom:14px">' +
      '<div class="q-dash-chart-card">' +
        '<div class="q-chart-title">🌡 호기별 위험도</div>' +
        '<div class="q-chart-subtitle">불량 건수 + 치명 건수 + 위험도 점수</div>' +
        '<div id="q-dash-machine-chart"></div>' +
      '</div>' +
      '<div class="q-dash-chart-card">' +
        '<div class="q-chart-title">📊 분류 Pareto</div>' +
        '<div class="q-chart-subtitle">분류별 불량 집중도 — 80% 기준선 표시</div>' +
        '<div id="q-dash-pareto-chart"></div>' +
      '</div>' +
    '</div>' +
    '<div id="q-dash-insight-wrap" style="margin-bottom:14px"></div>';

  // 개별 차트 렌더
  qRenderDashboardKpiCards(QDASH_READY_DATA, 'q-dash-kpi-wrap');
  qRenderDashboardPeriodTrendChart(QDASH_READY_DATA, 'q-dash-period-chart');
  qRenderDashboardSeverityDonut(QDASH_READY_DATA, 'q-dash-donut-chart');
  qRenderDashboardMachineRiskChart(QDASH_READY_DATA, 'q-dash-machine-chart');
  qRenderDashboardCategoryPareto(QDASH_READY_DATA, 'q-dash-pareto-chart');
  qRenderDashboardBottomInsightPanels(QDASH_READY_DATA, 'q-dash-insight-wrap');

  QDASH_CHART_RENDERED    = true;
  QDASH_CHART_RENDERED_AT = new Date().toISOString();
}

// ── helper ───────────────────────────────────────────────────────────────

function qGetAnalysisRiskLevel(score) {
  if(score >= 30) return { label:'HIGH', color:'#ef4444' };
  if(score >= 15) return { label:'MID',  color:'#f59e0b' };
  return            { label:'LOW',  color:'#22c55e' };
}

function qRenderAnalysisHorizontalBars(containerId, items, options) {
  var wrap = document.getElementById(containerId);
  if(!wrap) return;
  if(!items || !items.length) {
    wrap.innerHTML = '<div class="q-analysis-empty"><div class="q-analysis-empty-icon">📊</div><div class="q-analysis-empty-msg">데이터가 없습니다.</div></div>';
    return;
  }
  var maxVal = 0;
  items.forEach(function(it){ it.values.forEach(function(v){ if((v.v||0) > maxVal) maxVal = v.v; }); });
  maxVal = maxVal || 1;
  var rows = items.map(function(it, idx) {
    var bars = it.values.map(function(v) {
      var pct = qClampNumber((v.v||0) / maxVal * 100, 0, 100);
      // 값이 있을 때 최소 2px 보장
      var style = 'width:' + Math.max(pct, v.v>0?2:0) + '%;background:' + v.color;
      return '<div class="q-analysis-bar-wrap" title="' + (v.key||'') + ': ' + (v.v||0) + '">' +
               '<div class="q-analysis-bar" style="' + style + '"></div>' +
             '</div>';
    }).join('');
    var vals = it.values.map(function(v){
      return '<span style="color:' + v.color + ';font-weight:700">' + qFormatNum(v.v||0) + '</span>';
    }).join('');
    var isOdd = idx % 2 === 0;
    return '<div class="q-analysis-bar-row"' + (isOdd?'':' style="background:rgba(0,0,0,.02)"') + '>' +
      '<div class="q-analysis-bar-name" title="' + it.label + '">' + it.label + '</div>' +
      '<div class="q-analysis-bars">' + bars + '</div>' +
      '<div class="q-analysis-bar-vals">' + vals + '</div>' +
    '</div>';
  }).join('');
  wrap.innerHTML = '<div class="q-analysis-bar-section">' + rows + '</div>';
}

function qRenderAnalysisHeatmapMatrix(containerId, items) {
  var wrap = document.getElementById(containerId);
  if(!wrap) return;
  if(!items || !items.length) {
    wrap.innerHTML = '<div class="q-analysis-empty"><div class="q-analysis-empty-icon">🔲</div><div class="q-analysis-empty-msg">매트릭스 데이터가 없습니다.</div></div>';
    return;
  }
  // hex #RRGGBB → rgba()
  function _hexRgba(hex, a) {
    var h = (hex||'#888888').replace('#','');
    if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var r=parseInt(h.slice(0,2),16)||0, g=parseInt(h.slice(2,4),16)||0, b=parseInt(h.slice(4,6),16)||0;
    return 'rgba('+r+','+g+','+b+','+(a).toFixed(2)+')';
  }
  var pal = qGetDashboardChartPaletteOnly();
  var SEV_COLOR = { critical:'#ef4444', major:'#f97316', normal:'#22c55e', minor:'#94a3b8', unmapped:'#8b5cf6' };
  var SEV_TEXT  = { critical:'#c00',    major:'#b45309',  normal:'#166534',  minor:'#475569', unmapped:'#5b21b6' };

  var rowMap = {}, colMap = {};
  items.forEach(function(it){ rowMap[it.rowKey] = it.rowLabel || it.rowKey; colMap[it.colKey] = it.colLabel || it.colKey; });
  var SEV_ORDER = ['critical','major','normal','minor','unmapped'];
  var rows = Object.keys(rowMap).slice(0, 15);
  var cols = SEV_ORDER.filter(function(s){ return colMap[s]; })
             .concat(Object.keys(colMap).filter(function(c){ return SEV_ORDER.indexOf(c)<0; }));
  if(!cols.length) cols = Object.keys(colMap);

  var lookup = {};
  items.forEach(function(it){ lookup[it.rowKey+'|'+it.colKey] = it.defectCount; });
  var maxVal = Math.max.apply(null, items.map(function(it){ return it.defectCount||0; })) || 1;

  var headerCells = '<th style="font-size:9px;color:var(--tm);padding:4px 6px">행\\열</th>' +
    cols.map(function(c){
      var lbl = (colMap[c]||c).slice(0,7);
      var col = SEV_COLOR[c] || '#888';
      return '<th style="font-size:9px;padding:4px 6px;color:'+col+';font-weight:700">'+lbl+'</th>';
    }).join('');

  var bodyRows = rows.map(function(rk) {
    var cells = cols.map(function(ck) {
      var v = lookup[rk+'|'+ck] || 0;
      if(!v) return '<td class="q-analysis-heat-cell q-analysis-heat-zero" style="background:var(--bd)"></td>';
      var intensity = v / maxVal;
      var alpha = 0.10 + intensity * 0.70;
      var bg  = _hexRgba(SEV_COLOR[ck] || '#6366f1', alpha);
      var txt = intensity > 0.5 ? '#fff' : (SEV_TEXT[ck] || 'var(--ts)');
      return '<td class="q-analysis-heat-cell" style="background:'+bg+';color:'+txt+'">'+v+'</td>';
    }).join('');
    var rLabel = (rowMap[rk]||rk).slice(0,9);
    return '<tr><td style="font-size:10px;font-weight:600;color:var(--ts);padding:4px 6px;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+rLabel+'</td>'+cells+'</tr>';
  }).join('');

  wrap.innerHTML = '<div class="q-analysis-heatmap-wrap"><table class="q-analysis-heatmap"><thead><tr>'+headerCells+'</tr></thead><tbody>'+bodyRows+'</tbody></table></div>';
}
function qRenderAnalysisCompactTable(containerId, items, cols) {
  var wrap = document.getElementById(containerId);
  if(!wrap) return;
  if(!items || !items.length) {
    wrap.innerHTML = '<div class="q-analysis-empty"><div class="q-analysis-empty-icon">📋</div><div class="q-analysis-empty-msg">표시할 데이터가 없습니다.</div></div>';
    return;
  }
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var ths = cols.map(function(c){ return '<th>' + _e(c.label) + '</th>'; }).join('');
  var trs = items.slice(0,20).map(function(row, i) {
    var tds = cols.map(function(c){
      var v = row[c.key];
      if(c.risk) {
        var rl = qGetAnalysisRiskLevel(v||0);
        return '<td><span class="q-analysis-risk-chip" style="background:'+rl.color+'20;color:'+rl.color+';border:1px solid '+rl.color+'40">'+rl.label+'</span></td>';
      }
      return '<td>' + _e(v===null||v===undefined?'—':v) + '</td>';
    }).join('');
    return '<tr>' + tds + '</tr>';
  }).join('');
  wrap.innerHTML = '<div class="q-analysis-table-wrap"><table class="q-analysis-table"><thead><tr>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table></div>';
}

function qRenderAnalysisEmptyState(message) {
  return '<div class="q-analysis-empty"><div class="q-analysis-empty-icon">📋</div><div class="q-analysis-empty-msg">' + (message||'데이터 없음') + '</div></div>';
}

// ── 탭 네비 ──────────────────────────────────────────────────────────────

function qRenderAnalysisTabNav(containerId) {
  var wrap = document.getElementById(containerId);
  if(!wrap) return;
  var TABS = [
    { key:'machine',  label:'🏭 호기별' },
    { key:'model',    label:'📦 모델별' },
    { key:'cell',     label:'🔲 CELL' },
    { key:'period',   label:'📅 기간' },
    { key:'category', label:'🏷 분류' },
    { key:'matrix',   label:'🌡 Matrix/캘린더' }
  ];
  var cur = QANALYSIS_CHART_VIEW_MODE.activeTab;
  wrap.innerHTML = TABS.map(function(t) {
    var active = t.key === cur;
    return '<button class="q-analysis-tab' + (active?' q-analysis-tab-active':'') + '" onclick="qSetAnalysisChartTab(\'' + t.key + '\')">' + t.label + '</button>';
  }).join('');
}

function qSetAnalysisChartTab(tabKey) {
  QANALYSIS_CHART_VIEW_MODE.activeTab = tabKey;
  qRenderQualityAnalysisCenterCharts();
}

// ── 호기별 분석 ──────────────────────────────────────────────────────────

function qRenderAnalysisMachineSection(data, wrap) {
  var machArr = (data.analysisCenter.machineDataset || []).slice(0, 15);
  var matArr  = (data.analysisCenter.severityMatrixDataset || []).filter(function(m){ return m.matrixType === 'machine' && m.rowKey && m.colKey; }).slice(0, 100);
  var pal = qGetDashboardChartPaletteOnly();

  var colsHtml = '<div class="q-analysis-grid">' +
    // ranking bars
    '<div class="q-analysis-chart-card">' +
      '<div class="q-chart-title">호기별 위험도 Ranking</div>' +
      '<div class="q-chart-subtitle">불량 건수 / 치명 건수 / 위험도 점수</div>' +
      '<div class="q-analysis-bar-legend">' +
        '<span style="background:' + pal.defect + '">불량</span>' +
        '<span style="background:' + pal.critical + '">치명</span>' +
      '</div>' +
      '<div id="q-an-machine-bars"></div>' +
    '</div>' +
    // heatmap
    '<div class="q-analysis-chart-card">' +
      '<div class="q-chart-title">호기 × 중요도 Matrix</div>' +
      '<div class="q-chart-subtitle">intensity = defectCount</div>' +
      '<div id="q-an-machine-matrix"></div>' +
    '</div>' +
    // table
    '<div class="q-analysis-chart-card">' +
      '<div class="q-chart-title">호기 위험 후보 Table</div>' +
      '<div id="q-an-machine-table"></div>' +
    '</div>' +
  '</div>';

  wrap.innerHTML = colsHtml;

  qRenderAnalysisHorizontalBars('q-an-machine-bars',
    machArr.map(function(d) {
      return { label: String(d.label||d.key||'').slice(0,8),
               values:[{ v:d.defectCount||0, color:pal.defect, key:'불량' },
                       { v:d.criticalCount||0, color:pal.critical, key:'치명' }] };
    }), {});

  // filter machineSeverity for heatmap
  var machMat = matArr.filter(function(m){ return ['critical','major','normal','minor','unmapped'].indexOf(m.colKey) >= 0; }).slice(0, 80);
  qRenderAnalysisHeatmapMatrix('q-an-machine-matrix', machMat);

  qRenderAnalysisCompactTable('q-an-machine-table', machArr, [
    { key:'label', label:'호기' }, { key:'defectCount', label:'건수' },
    { key:'criticalCount', label:'치명' }, { key:'riskScore', label:'위험점수' },
    { key:'riskScore', label:'위험도', risk:true }
  ]);
}

// ── 모델별 분석 ──────────────────────────────────────────────────────────

function qRenderAnalysisModelSection(data, wrap) {
  var modArr = (data.analysisCenter.modelDataset || []).slice(0, 15);
  var matArr  = (data.analysisCenter.severityMatrixDataset || []).filter(function(m){ return m.matrixType === 'model' && m.rowKey; }).slice(0, 100);
  var pal = qGetDashboardChartPaletteOnly();

  wrap.innerHTML =
    '<div class="q-analysis-grid">' +
      '<div class="q-analysis-chart-card q-analysis-span2">' +
        '<div class="q-chart-title">모델/종류별 불량 건수 + 치명 건수</div>' +
        '<div class="q-chart-subtitle">grouped bar — 좌: 불량, 우: 치명</div>' +
        '<div class="q-analysis-bar-legend"><span style="background:' + pal.defect + '">불량</span><span style="background:' + pal.critical + '">치명</span><span style="background:' + pal.warning + '">경고</span></div>' +
        '<div id="q-an-model-bars"></div>' +
      '</div>' +
      '<div class="q-analysis-chart-card">' +
        '<div class="q-chart-title">모델 × 중요도 Matrix</div>' +
        '<div id="q-an-model-matrix"></div>' +
      '</div>' +
      '<div class="q-analysis-chart-card">' +
        '<div class="q-chart-title">모델 위험 후보 Table</div>' +
        '<div id="q-an-model-table"></div>' +
      '</div>' +
    '</div>';

  qRenderAnalysisHorizontalBars('q-an-model-bars',
    modArr.map(function(d) {
      return { label: String(d.label||d.key||'').slice(0,10),
               values:[{ v:d.defectCount||0, color:pal.defect, key:'불량' },
                       { v:d.criticalCount||0, color:pal.critical, key:'치명' },
                       { v:d.warningCount||0, color:pal.warning, key:'경고' }] };
    }), {});

  var modMat = matArr.filter(function(m){ return ['critical','major','normal','minor','unmapped'].indexOf(m.colKey)>=0; });
  qRenderAnalysisHeatmapMatrix('q-an-model-matrix', modMat.slice(0,80));

  qRenderAnalysisCompactTable('q-an-model-table', modArr, [
    { key:'label', label:'모델' }, { key:'defectCount', label:'건수' },
    { key:'criticalCount', label:'치명' }, { key:'warningCount', label:'경고' },
    { key:'riskScore', label:'위험도', risk:true }
  ]);
}

// ── CELL 분석 ────────────────────────────────────────────────────────────

function qRenderAnalysisCellSection(data, wrap) {
  var cellArr = (data.analysisCenter.cellDataset || []).slice(0, 20);
  var matArr  = (data.analysisCenter.severityMatrixDataset || []).filter(function(m){ return m.matrixType === 'cell'; });
  var pal = qGetDashboardChartPaletteOnly();

  // filter cellSeverity
  var cellMat = matArr.filter(function(m){
    return ['critical','major','normal','minor','unmapped'].indexOf(m.colKey) >= 0;
  }).slice(0, 100);

  wrap.innerHTML =
    '<div class="q-analysis-grid">' +
      '<div class="q-analysis-chart-card q-analysis-span2">' +
        '<div class="q-chart-title">CELL × 중요도 Matrix Heatmap</div>' +
        '<div class="q-chart-subtitle">행: CELL, 열: 중요도 (intensity = 불량 건수)</div>' +
        '<div id="q-an-cell-matrix"></div>' +
      '</div>' +
      '<div class="q-analysis-chart-card">' +
        '<div class="q-chart-title">CELL별 불량 Ranking</div>' +
        '<div class="q-analysis-bar-legend"><span style="background:' + pal.defect + '">불량</span><span style="background:' + pal.critical + '">치명</span></div>' +
        '<div id="q-an-cell-bars"></div>' +
      '</div>' +
      '<div class="q-analysis-chart-card">' +
        '<div class="q-chart-title">CELL 취약 구간 후보</div>' +
        '<div id="q-an-cell-table"></div>' +
      '</div>' +
    '</div>';

  qRenderAnalysisHeatmapMatrix('q-an-cell-matrix', cellMat);

  qRenderAnalysisHorizontalBars('q-an-cell-bars',
    cellArr.map(function(d) {
      return { label: String(d.label||d.key||'').slice(0,8),
               values:[{ v:d.defectCount||0, color:pal.defect, key:'불량' },
                       { v:d.criticalCount||0, color:pal.critical, key:'치명' }] };
    }), {});

  qRenderAnalysisCompactTable('q-an-cell-table', cellArr, [
    { key:'label', label:'CELL' }, { key:'defectCount', label:'건수' },
    { key:'criticalCount', label:'치명' }, { key:'warningCount', label:'경고' }
  ]);
}

// ── 기간 분석 ────────────────────────────────────────────────────────────

function qRenderAnalysisPeriodSection(data, wrap) {
  var pal = qGetDashboardChartPaletteOnly();
  var PLvl = QANALYSIS_CHART_VIEW_MODE.periodLevel || 'monthly';
  var periodDatasets = data.analysisCenter.periodDatasets || {};
  var periodArr = (periodDatasets[PLvl] || data.analysisCenter.periodDataset || data.dashboard.periodTrendDataset || []);

  var PERIOD_LEVELS = ['daily','weekly','monthly','quarterly','yearly'];
  var levelBtns = PERIOD_LEVELS.map(function(lv) {
    return '<button class="q-analysis-period-btn' + (lv===PLvl?' active':'') + '" onclick="QANALYSIS_CHART_VIEW_MODE.periodLevel=\'' + lv + '\';qRenderQualityAnalysisCenterCharts()">' + lv + '</button>';
  }).join('');

  wrap.innerHTML =
    '<div class="q-analysis-period-btns">' + levelBtns + '</div>' +
    '<div class="q-analysis-grid">' +
      '<div class="q-analysis-chart-card q-analysis-span2">' +
        '<div class="q-chart-title">기간별 불량 추이 (Line + Bar Combo)</div>' +
        '<div class="q-chart-subtitle">막대: 불량 건수 · 선: 치명/High</div>' +
        '<div id="q-an-period-chart"></div>' +
      '</div>' +
      '<div class="q-analysis-chart-card">' +
        '<div class="q-chart-title">기간별 상세 Table</div>' +
        '<div id="q-an-period-table"></div>' +
      '</div>' +
    '</div>';

  // render chart (reuse dashboard chart helper)
  var mockData = { dashboard:{ periodTrendDataset: periodArr } };
  qRenderDashboardPeriodTrendChart(mockData, 'q-an-period-chart');

  qRenderAnalysisCompactTable('q-an-period-table', periodArr.slice(-20).reverse(), [
    { key:'periodKey', label:'기간' }, { key:'defectCount', label:'건수' },
    { key:'criticalCount', label:'치명' }, { key:'warningCount', label:'경고' },
    { key:'missingRequiredCount', label:'누락' }
  ]);
}

// ── 분류 분석 ────────────────────────────────────────────────────────────

function qRenderAnalysisCategorySection(data, wrap) {
  var catArr  = (data.analysisCenter.categoryDataset || data.dashboard.categoryParetoDataset || []).slice(0, 15);
  var umArr   = (data.codeMapping && data.codeMapping.unmappedRankingDataset || []).slice(0, 15);
  var stdArr  = (data.codeMapping && data.codeMapping.standardCodeCandidateDataset || []).slice(0, 10);
  var pal = qGetDashboardChartPaletteOnly();

  wrap.innerHTML =
    '<div class="q-analysis-grid">' +
      '<div class="q-analysis-chart-card q-analysis-span2">' +
        '<div class="q-chart-title">대분류 Pareto + Horizontal Bar</div>' +
        '<div class="q-chart-subtitle">누적 비율 80% 기준 — 불량 집중 분류 확인</div>' +
        '<div id="q-an-cat-pareto"></div>' +
      '</div>' +
      '<div class="q-analysis-chart-card">' +
        '<div class="q-chart-title">미분류 / 기타 후보 Ranking</div>' +
        '<div id="q-an-cat-unmapped"></div>' +
      '</div>' +
      '<div class="q-analysis-chart-card">' +
        '<div class="q-chart-title">분류 코드화 후보 Table</div>' +
        '<div class="q-note" style="font-size:9px;margin-bottom:6px">기준정보 등록 검토 후보 (CRUD 아님)</div>' +
        '<div id="q-an-cat-std"></div>' +
      '</div>' +
    '</div>';

  var mockData = { dashboard:{ categoryParetoDataset: catArr } };
  qRenderDashboardCategoryPareto(mockData, 'q-an-cat-pareto');

  qRenderAnalysisCompactTable('q-an-cat-unmapped', umArr, [
    { key:'field', label:'필드' }, { key:'value', label:'값' },
    { key:'count', label:'건수' }, { key:'suggestedAction', label:'조치' }
  ]);

  qRenderAnalysisCompactTable('q-an-cat-std', stdArr, [
    { key:'field', label:'필드' }, { key:'value', label:'값' },
    { key:'count', label:'건수' }, { key:'suggestedAction', label:'제안' }
  ]);
}

// ── Matrix / Calendar 분석 ────────────────────────────────────────────────

function qRenderAnalysisMatrixCalendarSection(data, wrap) {
  var matArr  = (data.analysisCenter.severityMatrixDataset || []);
  var calArr  = (data.analysisCenter.calendarDataset || []);
  var pal     = qGetDashboardChartPaletteOnly();

  var machineMat   = matArr.filter(function(m){ return m.matrixType === 'machine'; }).slice(0,60);
  var categoryMat  = matArr.filter(function(m){ return m.matrixType === 'category'; }).slice(0,60);

  // Calendar heatmap (if daily data)
  var calHtml;
  if(calArr.length > 0) {
    calHtml = _qBuildCalendarHeatmapHtml(calArr);
  } else {
    calHtml = '<div class="q-analysis-empty"><div class="q-analysis-empty-icon">📅</div><div class="q-analysis-empty-msg">일별 데이터가 없습니다.<br>daily 집계를 위해 날짜 필드가 있는 데이터를 업로드하세요.</div></div>';
  }

  wrap.innerHTML =
    '<div class="q-analysis-grid">' +
      '<div class="q-analysis-chart-card">' +
        '<div class="q-chart-title">호기 × 중요도 Matrix</div>' +
        '<div id="q-an-mat-machine"></div>' +
      '</div>' +
      '<div class="q-analysis-chart-card">' +
        '<div class="q-chart-title">분류 × 중요도 Matrix</div>' +
        '<div id="q-an-mat-category"></div>' +
      '</div>' +
      '<div class="q-analysis-chart-card q-analysis-span2">' +
        '<div class="q-chart-title">일별 캘린더 Heatmap</div>' +
        '<div class="q-chart-subtitle">날짜별 불량 밀도 확인</div>' +
        '<div id="q-an-calendar">' + calHtml + '</div>' +
      '</div>' +
    '</div>';

  qRenderAnalysisHeatmapMatrix('q-an-mat-machine', machineMat);
  qRenderAnalysisHeatmapMatrix('q-an-mat-category', categoryMat);
}

function _qBuildCalendarHeatmapHtml(calArr) {
  var maxVal = Math.max.apply(null, calArr.map(function(d){ return d.defectCount || 0; })) || 1;
  var pal = qGetDashboardChartPaletteOnly();
  // group by month
  var monthMap = {};
  calArr.forEach(function(d) {
    var m = String(d.date || '').slice(0,7);
    if(!monthMap[m]) monthMap[m] = [];
    monthMap[m].push(d);
  });
  var months = Object.keys(monthMap).sort().slice(-6); // last 6 months
  var html = '<div class="q-analysis-calendar"><div class="q-analysis-cal-months">';
  months.forEach(function(mo) {
    html += '<div class="q-analysis-cal-month"><div class="q-analysis-cal-title">' + mo + '</div><div class="q-analysis-cal-grid">';
    monthMap[mo].forEach(function(d) {
      var intensity = (d.defectCount || 0) / maxVal;
      var alpha = Math.max(0.05, intensity * 0.9).toFixed(2);
      var bg = 'rgba(99,102,241,' + alpha + ')';
      if(d.criticalCount > 0) bg = 'rgba(239,68,68,' + alpha + ')';
      var day = String(d.date || '').slice(8,10);
      html += '<div class="q-analysis-calendar-cell" style="background:' + bg + '" title="' + d.date + ': ' + (d.defectCount||0) + '건">' + day + '</div>';
    });
    html += '</div></div>';
  });
  html += '</div>';
  // top date table
  var topDates = calArr.slice().sort(function(a,b){ return (b.defectCount||0)-(a.defectCount||0); }).slice(0,5);
  if(topDates.length) {
    html += '<div style="margin-top:8px;font-size:10px;font-weight:700;color:var(--tm)">Top 발생일</div><table class="q-analysis-table" style="margin-top:4px"><thead><tr><th>날짜</th><th>건수</th><th>치명</th></tr></thead><tbody>';
    topDates.forEach(function(d){ html += '<tr><td>' + d.date + '</td><td>' + (d.defectCount||0) + '</td><td>' + (d.criticalCount||0) + '</td></tr>'; });
    html += '</tbody></table>';
  }
  html += '</div>';
  return html;
}

// ── Analysis Center Header ────────────────────────────────────────────────

function qRenderAnalysisCenterHeader(data, containerId) {
  var wrap = document.getElementById(containerId);
  if(!wrap || !data) return;
  var m = QDASH_READY_META || {};
  var pal = qGetDashboardChartPaletteOnly();
  var ov = (QSUMMARY_DATA && QSUMMARY_DATA.overview) || {};

  var kpis = [
    { label:'총 불량', value: ov.totalDefects||0, color: pal.defect },
    { label:'치명/High', value: ov.criticalCount||0, color: pal.critical },
    { label:'위험 호기', value: Math.min((data.analysisCenter.machineDataset||[]).filter(function(d){ return (d.riskScore||0)>=15; }).length, 99), color: pal.riskMid },
    { label:'미분류 후보', value: (data.codeMapping && data.codeMapping.unmappedRankingDataset||[]).length, color: pal.unmapped },
    { label:'경고 포함', value: ov.warningCount||0, color: pal.warning }
  ];

  wrap.innerHTML = kpis.map(function(k) {
    return '<div class="q-analysis-kpi"><div class="q-dash-kpi-val" style="color:' + k.color + '">' + qFormatNum(k.value) + '</div><div class="q-dash-kpi-lbl">' + k.label + '</div></div>';
  }).join('');
}

// ── 분석센터 진입 함수 ────────────────────────────────────────────────────

function qRenderQualityAnalysisCenterCharts() {
  var page = document.getElementById('page-quality-analysis');
  if(!page) return;
  QANALYSIS_CHART_WARNINGS = [];

  if(!QDASH_READY_DATA) {
    page.innerHTML =
      '<div class="pg-hd"><div class="pg-title">📈 품질 분석센터</div></div>' +
      '<div class="q-analysis-chart-card" style="margin:16px;text-align:center;padding:32px;">' +
        '<div style="font-size:32px;margin-bottom:12px">📊</div>' +
        '<div style="font-size:14px;font-weight:700;margin-bottom:8px">Dashboard Ready 데이터가 없습니다.</div>' +
        '<div style="font-size:11px;color:var(--tm);margin-bottom:16px">품질 통합 대시보드에서 Dashboard Ready 검토까지 완료 후 이용하세요.</div>' +
        '<button class="q-btn-readiness" onclick="nav(\'quality-dash\')">📊 대시보드로 이동</button>' +
      '</div>';
    return;
  }

  var reviewedBadge = QDASH_READY_REVIEWED
    ? '<span class="q-badge-ok" style="font-size:10px;padding:2px 8px;border-radius:8px">✔ 검토 완료</span>'
    : '<span class="q-normalized-unlocked" style="font-size:10px;padding:2px 8px;border-radius:8px">검토 전</span>';
  var m = QDASH_READY_META || {};
  var curTab = QANALYSIS_CHART_VIEW_MODE.activeTab || 'machine';

  page.innerHTML =
    '<div class="pg-hd">' +
      '<div class="pg-title">📈 품질 분석센터</div>' +
      '<div class="pg-sub">호기 / 모델 / CELL / 기간 / 분류 / 중요도 Matrix 심층 분석 ' + reviewedBadge +
        ' &nbsp;기준: ' + (m.filteredRows||0) + '건</div>' +
    '</div>' +
    '<div class="q-analysis-kpi-grid" id="q-an-kpi-wrap" style="margin-bottom:12px"></div>' +
    '<div class="q-analysis-tabs" id="q-an-tab-nav" style="margin-bottom:12px"></div>' +
    '<div class="q-analysis-toolbar" style="margin-bottom:8px">' +
      '<button class="q-btn-readiness" onclick="qRenderQualityAnalysisCenterCharts()">⟳ 새로고침</button>' +
    '</div>' +
    '<div id="q-an-section-body"></div>';

  qRenderAnalysisCenterHeader(QDASH_READY_DATA, 'q-an-kpi-wrap');
  qRenderAnalysisTabNav('q-an-tab-nav');

  var body = document.getElementById('q-an-section-body');
  if(!body) return;

  var sectionFnMap = {
    machine:  qRenderAnalysisMachineSection,
    model:    qRenderAnalysisModelSection,
    cell:     qRenderAnalysisCellSection,
    period:   qRenderAnalysisPeriodSection,
    category: qRenderAnalysisCategorySection,
    matrix:   qRenderAnalysisMatrixCalendarSection
  };
  var fn = sectionFnMap[curTab] || qRenderAnalysisMachineSection;
  fn(QDASH_READY_DATA, body);

  QANALYSIS_CHART_RENDERED    = true;
  QANALYSIS_CHART_RENDERED_AT = new Date().toISOString();
}

(function(){
  function _escDrawer(v){
    return String(v===null||v===undefined?'':v)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  if(typeof window.closeDrawer !== 'function') {
    window.closeDrawer = function(){
      var d=document.getElementById('row-drawer');
      if(d) d.classList.remove('open');
    };
  }
  if(typeof window.openDrawer !== 'function') {
    window.openDrawer = function(rowId){
      var d=document.getElementById('row-drawer');
      var title=document.getElementById('drawer-ho');
      var body=document.getElementById('drawer-content');
      if(!d || !body) return;
      var rows=(typeof WORK_DATA!=='undefined' && Array.isArray(WORK_DATA)) ? WORK_DATA : [];
      var row=rows.find(function(r){ return String(r.id||'')===String(rowId||''); }) || null;
      if(!row){
        if(title) title.textContent='호기 상세';
        body.innerHTML='<div class="cl cw"><strong>DETAIL</strong>선택한 행 데이터를 찾을 수 없습니다.</div>';
        d.classList.add('open');
        return;
      }
      var fields=[
        ['차수', row.batch], ['모델', row.model], ['호기', row.machine], ['상태', row.status],
        ['생산 시작', row.productionStart||row.startDate], ['출고 예정', row.shipPlan||row.shipDate],
        ['진행률', (row.progress!==undefined?row.progress+'%':'—')], ['지연사유', row.delayReason||row.delayType||'—']
      ];
      if(title) title.textContent=(row.machine?row.machine+'호기 ':'')+'상세';
      body.innerHTML='<div class="tbl"><table><tbody>'+fields.map(function(f){
        return '<tr><th style="width:110px">'+_escDrawer(f[0])+'</th><td>'+_escDrawer(f[1]===undefined||f[1]===null||f[1]===''?'—':f[1])+'</td></tr>';
      }).join('')+'</tbody></table></div>';
      d.classList.add('open');
    };
  }
})();

// ── 상태 게이트 helper ────────────────────────────────────────────────────

function qFlowGateHtml(type, icon, msg) {
  // type: 'ok' | 'warn' | 'block' | 'idle'
  return '<div class="q-flow-gate q-flow-gate-' + type + '">' +
    '<span class="q-flow-gate-icon">' + icon + '</span>' +
    '<span class="q-flow-gate-msg">' + msg + '</span>' +
  '</div>';
}

function qFlowBadge(label, type) {
  return '<span class="q-flow-badge q-flow-badge-' + (type||'idle') + '">' + label + '</span>';
}

function qInvalidateQualityDownstreamStates(reason) {
  QISSUE_ROWS = [];
  QISSUE_WARNINGS = [];
  QISSUE_GENERATED_AT = null;
  QISSUE_VIEW_PAGE = 1;
  QNORM_REVIEW_SNAPSHOT = null;
  QNORM_REVIEW_APPLIED_AT = null;
  QISSUE_NORMALIZED_ROWS = [];
  QISSUE_NORMALIZE_LOCKED = false;
  QISSUE_NORMALIZE_META = null;
  QSUMMARY_SCHEMA_REVIEWED = false;
  QSUMMARY_SCHEMA_WARNINGS = null;
  QSUMMARY_SCHEMA_APPLIED_AT = null;
  QSUMMARY_DATA = null;
  QSUMMARY_DATA_READY = false;
  QSUMMARY_GENERATED_AT = null;
  QSUMMARY_FILTER_PREVIEW = null;
  QDASH_READY_DATA = null;
  QDASH_READY_META = null;
  QDASH_CHART_BLUEPRINT = null;
  QDASH_READY_WARNINGS = [];
  QDASH_READY_REVIEWED = false;
  QDASH_CHART_RENDERED = false;
  QDASH_CHART_RENDERED_AT = null;
  QANALYSIS_CHART_RENDERED = false;
  QANALYSIS_CHART_RENDERED_AT = null;
  QANALYSIS_CHART_WARNINGS = [];
  if(typeof qRenderDashboardFlowGate === 'function') {
    qRenderDashboardFlowGate('q-dash-flow-gate');
    qRenderDashboardFlowGate('q-dash-flow-gate-static');
  }
}

// ── 전체 플로우 상태 계산 ────────────────────────────────────────────────

function qGetFlowState() {
  return {
    hasRaw:       !!(QRAW_ROWS && QRAW_ROWS.length),
    hasIssue:     !!(QISSUE_ROWS && QISSUE_ROWS.length),
    hasNormSnap:  !!QNORM_REVIEW_SNAPSHOT,
    hasNormLock:  !!(QISSUE_NORMALIZE_LOCKED && QISSUE_NORMALIZED_ROWS && QISSUE_NORMALIZED_ROWS.length),
    hasSchema:    !!(QSUMMARY_SCHEMA && QSUMMARY_SCHEMA_REVIEWED),
    hasCore:      !!(QSUMMARY_DATA_READY && QSUMMARY_DATA),
    hasReady:     !!QDASH_READY_DATA,
    readyReviewed:!!QDASH_READY_REVIEWED,
    chartRendered:!!QDASH_CHART_RENDERED
  };
}

// ── Dashboard Ready 메타 강화 표시 ────────────────────────────────────────

function qRenderDashboardReadyMetaEnhanced(containerId) {
  var wrap = document.getElementById(containerId);
  if(!wrap) return;
  if(!QDASH_READY_DATA || !QDASH_READY_META) { wrap.innerHTML = ''; return; }
  var m   = QDASH_READY_META;
  var rd  = QDASH_READY_DATA;
  var bp  = QDASH_CHART_BLUEPRINT || {};
  var fl  = qGetFlowState();

  // 기간 레벨 제공 여부
  var pds = (rd.analysisCenter && rd.analysisCenter.periodDatasets) || {};
  var pdLevels = ['daily','weekly','monthly','quarterly','yearly'].filter(function(lv){ return pds[lv] && pds[lv].length > 0; });

  // matrix type 제공 여부
  var matArr = (rd.analysisCenter && rd.analysisCenter.severityMatrixDataset) || [];
  var matTypes = {};
  matArr.forEach(function(m){ if(m.matrixType) matTypes[m.matrixType]=1; });

  // calendar daily 수
  var calCnt = (rd.analysisCenter && rd.analysisCenter.calendarDataset || []).length;

  var items = [
    { key:'생성 기준',         val: m.activeFilterMode || '—' },
    { key:'생성 시각',         val: m.generatedAt ? m.generatedAt.replace('T',' ').slice(0,19) : '—' },
    { key:'대상 행 수',        val: (m.filteredRows||0) + '건' },
    { key:'차트 계약 수',       val: (m.blueprintCount||0) + '개' },
    { key:'기간 레벨 제공',    val: pdLevels.length ? pdLevels.join(', ') : '없음' },
    { key:'Matrix 타입',       val: Object.keys(matTypes).length ? Object.keys(matTypes).join(', ') : '없음' },
    { key:'Calendar daily',   val: calCnt ? calCnt + '건' : '없음' },
    { key:'경고 수',           val: (QDASH_READY_WARNINGS||[]).length + '건' },
    { key:'검토 상태',         val: fl.readyReviewed ? '검토 완료' : '검토 전' }
  ];

  wrap.innerHTML = '<div class="q-flow-meta-card">' +
    items.map(function(it){
      return '<div class="q-flow-meta-item"><div class="q-flow-meta-key">' + it.key + '</div><div class="q-flow-meta-val">' + it.val + '</div></div>';
    }).join('') + '</div>';
}

// ── 대시보드 진입 게이트 표시 ────────────────────────────────────────────

function qRenderDashboardFlowGate(containerId) {
  var wrap = document.getElementById(containerId);
  if(!wrap) return;
  var fl = qGetFlowState();
  var gates = [];

  if(!fl.hasRaw)       gates.push(qFlowGateHtml('block','📂','Raw Data가 없습니다. 불량 관리 센터에서 엑셀을 업로드하세요.'));
  else if(!fl.hasIssue)gates.push(qFlowGateHtml('warn','📋','이슈 데이터가 없습니다. 이슈 데이터 행 생성을 완료하세요.'));
  else if(!fl.hasNormLock)gates.push(qFlowGateHtml('warn','🔒','정규화 잠금본이 없습니다. 정규화 검토 후 잠금본을 생성하세요.'));
  else if(!fl.hasCore) gates.push(qFlowGateHtml('warn','📊','분석 집계 Core가 없습니다. Schema 검토 후 Core를 생성하세요.'));
  else if(!fl.hasReady)gates.push(qFlowGateHtml('warn','🚀','Dashboard Ready 데이터가 없습니다. Core 생성 후 Ready 데이터를 구성하세요.'));
  else if(!fl.readyReviewed) gates.push(qFlowGateHtml('idle','🔍','Dashboard Ready 검토가 완료되지 않았습니다. 검토 완료 후 차트를 렌더링하세요.'));
  else gates.push(qFlowGateHtml('ok','✅','Dashboard Ready 검토 완료. 차트를 렌더링할 수 있습니다.'));

  wrap.innerHTML = gates.join('');
}

// ── qBuildIssueRowsCore 가드 보강 ─────────────────────────────────────────
// 기존 함수에 stale 데이터 처리 추가 (wrapper)

function qBuildIssueRowsCoreWithGate() {
  if(!QRAW_ROWS || !QRAW_ROWS.length) {
    var msg = document.getElementById('qmain-status-msg');
    if(msg) msg.textContent = 'Raw Data를 먼저 생성하세요.';
    return;
  }
  // 이슈 재생성 시 하위 상태 stale 처리
  if(QISSUE_ROWS && QISSUE_ROWS.length) {
    QNORM_REVIEW_SNAPSHOT   = null;
    QNORM_REVIEW_APPLIED_AT = null;
    QISSUE_NORMALIZED_ROWS  = [];
    QISSUE_NORMALIZE_LOCKED = false;
    QISSUE_NORMALIZE_META   = null;
    QSUMMARY_SCHEMA_REVIEWED= false;
    QSUMMARY_DATA           = null;
    QSUMMARY_DATA_READY     = false;
    QDASH_READY_DATA        = null;
    QDASH_READY_REVIEWED    = false;
    QDASH_CHART_RENDERED    = false;
  }
  qBuildIssueRowsCore();
}

// ── 분석센터 activeTab fallback 보강 ─────────────────────────────────────

function qGetSafeAnalysisTab() {
  var valid = ['machine','model','cell','period','category','matrix'];
  var cur = QANALYSIS_CHART_VIEW_MODE && QANALYSIS_CHART_VIEW_MODE.activeTab;
  return valid.indexOf(cur) >= 0 ? cur : 'machine';
}

// ── qRenderQualityDashboardCharts 안전성 wrapper ──────────────────────────

function qRenderQualityDashboardChartsWithGate() {
  // 중복 호출 방어: 동일 인수로 100ms 내 재호출 무시
  if(qRenderQualityDashboardChartsWithGate._throttle) return;
  qRenderQualityDashboardChartsWithGate._throttle = true;
  setTimeout(function(){ qRenderQualityDashboardChartsWithGate._throttle = false; }, 100);
  qRenderQualityDashboardCharts();
}

// ── analysisCenter dataset 안전성 guard ──────────────────────────────────

function qGetSafeAnalysisCenterData(data) {
  if(!data || !data.analysisCenter) return {
    machineDataset:[], modelDataset:[], cellDataset:[], periodDatasets:{},
    periodDataset:[], categoryDataset:[], severityMatrixDataset:[], calendarDataset:[]
  };
  var ac = data.analysisCenter;
  return {
    machineDataset:          Array.isArray(ac.machineDataset)          ? ac.machineDataset : [],
    modelDataset:            Array.isArray(ac.modelDataset)            ? ac.modelDataset : [],
    cellDataset:             Array.isArray(ac.cellDataset)             ? ac.cellDataset : [],
    periodDatasets:          (ac.periodDatasets && typeof ac.periodDatasets==='object') ? ac.periodDatasets : {},
    periodDataset:           Array.isArray(ac.periodDataset)           ? ac.periodDataset : [],
    categoryDataset:         Array.isArray(ac.categoryDataset)         ? ac.categoryDataset : [],
    severityMatrixDataset:   Array.isArray(ac.severityMatrixDataset)   ? ac.severityMatrixDataset : [],
    calendarDataset:         Array.isArray(ac.calendarDataset)         ? ac.calendarDataset : []
  };
}

// ── Dashboard Ready 초기화 시 하위 화면 reset ─────────────────────────────

var _qOrigResetDashboardReadyOnly = qResetDashboardReadyOnly;
qResetDashboardReadyOnly = function() {
  _qOrigResetDashboardReadyOnly();
  // 대시보드 차트 페이지도 empty state로 전환
  QDASH_CHART_RENDERED    = false;
  QDASH_CHART_RENDERED_AT = null;
  var dashPage = document.getElementById('page-quality-dash');
  if(dashPage && dashPage.innerHTML.trim() !== '' && !dashPage.innerHTML.includes('qRenderQualityDashboardCharts')) {
    var nc = document.createElement('div'); nc.id='q-dash-gate-hint';
    nc.innerHTML = '<div class="q-flow-gate q-flow-gate-idle" style="margin:16px"><span class="q-flow-gate-icon">🔄</span><span class="q-flow-gate-msg">Dashboard Ready 데이터가 초기화되었습니다. Ready 데이터를 다시 구성 후 차트를 새로고침하세요.</span></div>';
    dashPage.innerHTML = '';
    dashPage.appendChild(nc);
  }
};

// ── QDASH_READY_META 강화 (analysisCenter 메타 포함) ─────────────────────
// qBuildDashboardReadyDataOnly 실행 직후 meta 확장

function qEnhanceDashReadyMeta() {
  if(!QDASH_READY_DATA || !QDASH_READY_META) return;
  var rd  = QDASH_READY_DATA;
  var pds = (rd.analysisCenter && rd.analysisCenter.periodDatasets) || {};
  var pdLevels = ['daily','weekly','monthly','quarterly','yearly'].filter(function(lv){ return pds[lv] && pds[lv].length > 0; });
  var matArr = (rd.analysisCenter && rd.analysisCenter.severityMatrixDataset) || [];
  var matTypes = {};
  matArr.forEach(function(m){ if(m && m.matrixType) matTypes[m.matrixType]=1; });
  QDASH_READY_META.periodLevelProvided  = pdLevels;
  QDASH_READY_META.matrixTypesProvided  = Object.keys(matTypes);
  QDASH_READY_META.calendarDailyCount   = (rd.analysisCenter && rd.analysisCenter.calendarDataset || []).length;
  QDASH_READY_META.warningCount         = (QDASH_READY_WARNINGS||[]).length;
}

// ── 분석센터 Section 함수에 guard 적용 (wrapper) ─────────────────────────

var _qOrigRenderAnalysisMachineSection = qRenderAnalysisMachineSection;
qRenderAnalysisMachineSection = function(data, wrap) {
  var safe = qGetSafeAnalysisCenterData(data);
  data = Object.assign({}, data, { analysisCenter: safe });
  _qOrigRenderAnalysisMachineSection(data, wrap);
};

var _qOrigRenderAnalysisModelSection = qRenderAnalysisModelSection;
qRenderAnalysisModelSection = function(data, wrap) {
  var safe = qGetSafeAnalysisCenterData(data);
  data = Object.assign({}, data, { analysisCenter: safe });
  _qOrigRenderAnalysisModelSection(data, wrap);
};

var _qOrigRenderAnalysisCellSection = qRenderAnalysisCellSection;
qRenderAnalysisCellSection = function(data, wrap) {
  var safe = qGetSafeAnalysisCenterData(data);
  data = Object.assign({}, data, { analysisCenter: safe });
  _qOrigRenderAnalysisCellSection(data, wrap);
};

var _qOrigRenderAnalysisPeriodSection = qRenderAnalysisPeriodSection;
qRenderAnalysisPeriodSection = function(data, wrap) {
  var safe = qGetSafeAnalysisCenterData(data);
  data = Object.assign({}, data, { analysisCenter: safe });
  _qOrigRenderAnalysisPeriodSection(data, wrap);
};

var _qOrigRenderAnalysisCategorySection = qRenderAnalysisCategorySection;
qRenderAnalysisCategorySection = function(data, wrap) {
  var safe = qGetSafeAnalysisCenterData(data);
  data = Object.assign({}, data, { analysisCenter: safe });
  _qOrigRenderAnalysisCategorySection(data, wrap);
};

var _qOrigRenderAnalysisMatrixCalendarSection = qRenderAnalysisMatrixCalendarSection;
qRenderAnalysisMatrixCalendarSection = function(data, wrap) {
  var safe = qGetSafeAnalysisCenterData(data);
  data = Object.assign({}, data, { analysisCenter: safe });
  _qOrigRenderAnalysisMatrixCalendarSection(data, wrap);
};

// ── qRenderQualityAnalysisCenterCharts activeTab fallback 보강 ───────────

var _qOrigRenderQualityAnalysisCenterCharts = qRenderQualityAnalysisCenterCharts;
qRenderQualityAnalysisCenterCharts = function() {
  if(QANALYSIS_CHART_VIEW_MODE) QANALYSIS_CHART_VIEW_MODE.activeTab = qGetSafeAnalysisTab();
  _qOrigRenderQualityAnalysisCenterCharts();
  // 메타 강화 후 처리
  if(QDASH_READY_DATA) qEnhanceDashReadyMeta();
};

// ── qBuildDashboardReadyDataOnly 후 meta 자동 강화 ───────────────────────

var _qOrigBuildDashReady = qBuildDashboardReadyDataOnly;
qBuildDashboardReadyDataOnly = function() {
  _qOrigBuildDashReady();
  qEnhanceDashReadyMeta();
};

// ── page-quality-dash 내부 플로우 게이트 wrap 렌더 ───────────────────────
// qRenderQualityDashboardCharts 결과 상단에 게이트 배너를 append

var _qOrigRenderDashCharts = qRenderQualityDashboardCharts;
qRenderQualityDashboardCharts = function() {
  var page = document.getElementById("page-quality-dash");
  var hasDash = !!(QDASH_READY_DATA || (typeof QDEFECT_WORKBOOK_READY!=="undefined" && QDEFECT_WORKBOOK_READY));
  if(!hasDash) {
    if(page) page.innerHTML = '<div style="text-align:center;padding:32px"><div style="font-size:32px;margin-bottom:12px">📋</div>'+
      '<div style="font-size:14px;font-weight:700;margin-bottom:8px">품질 데이터가 없습니다.</div>'+
      '<div style="font-size:11px;color:var(--tm);margin-bottom:16px">불량 관리 센터에서 XLSX를 업로드하세요.</div>'+
      '<button class="q-btn-readiness" onclick="nav(\'quality-main\')">🔬 불량 관리 센터</button></div>';
    return;
  }
  if(page && !QDASH_READY_REVIEWED) {
    var g = document.getElementById("q-dash-soft-gate");
    if(!g) {
      g = document.createElement("div"); g.id = "q-dash-soft-gate";
      g.innerHTML = '<div class="q-flow-gate q-flow-gate-warn" style="margin-bottom:10px">'+ 
        '<span>⚠</span><span> Dashboard Ready 검토 전 — 업로드 데이터 기반으로 표시됩니다.</span></div>';
      page.insertBefore(g, page.firstChild);
    }
  }
}

document.addEventListener("DOMContentLoaded", function(){
  qRenderDashboardFlowGate("q-dash-flow-gate-static");
});

// ── 06F Permission Preset ────────────────────────────────────────────────

var ODI_PERMISSION_PRESET = {
  ADMIN:              { label:'시스템 관리자',   level:0, description:'전체 시스템 접근 및 관리' },
  MANAGER:            { label:'관리자',          level:1, description:'운영 전반 접근 및 현황 조회' },
  QUALITY_MANAGER:    { label:'품질관리 담당자', level:2, description:'품질관리 전 기능 접근' },
  PRODUCTION_MANAGER: { label:'생산관리 담당자', level:2, description:'생산일정 및 생산현황 접근' },
  OPERATOR:           { label:'현장 운영자',     level:3, description:'업로드/조회 기본 기능 접근' },
  VIEWER:             { label:'읽기 전용',       level:4, description:'조회 전용, 데이터 변경 불가' }
};

// ── 06E Menu Status Enum ─────────────────────────────────────────────────

var ODI_MENU_STATUS_ENUM = {
  LIVE:        '운영 중',
  PARTIAL:     '부분 구현',
  READY_DATA:  '데이터 준비 완료',
  COMING_SOON: '준비 중',
  ADMIN_ONLY:  '관리자 전용',
  HIDDEN:      '숨김',
  DEPRECATED:  '폐기 예정'
};

// ── 06E ODI_MENU_STATUS_MAP ──────────────────────────────────────────────
// 현재 HTML 기준 전체 메뉴 상태 매핑

var ODI_MENU_STATUS_MAP = [

  // ── 생산운영관리 ────────────────────────────────────────────────────────

  {
    menuId: 'dashboard',
    label: '통합 현황 대시보드',
    area: 'user',
    group: '생산운영관리',
    routeKey: 'dashboard',
    pageId: 'page-dashboard',
    status: 'PARTIAL',
    permission: ['ADMIN','MANAGER','PRODUCTION_MANAGER','QUALITY_MANAGER','OPERATOR','VIEWER'],
    visible: true,
    badge: '부분',
    notes: '종합현황 skeleton 유지 중. 품질 KPI 연결 예정.'
  },
  {
    menuId: 'schedule',
    label: '생산일정 관리',
    area: 'user',
    group: '생산운영관리',
    routeKey: 'schedule',
    pageId: 'page-schedule',
    status: 'LIVE',
    permission: ['ADMIN','MANAGER','PRODUCTION_MANAGER','OPERATOR'],
    visible: true,
    badge: null,
    notes: '간트/캘린더/배치 구현 완료. 업로드 기반 운영.'
  },
  {
    menuId: 'schedule-period',
    label: '기간별 생산계획',
    area: 'user',
    group: '생산운영관리',
    routeKey: 'schedule-period',
    pageId: 'page-schedule-period',
    status: 'LIVE',
    permission: ['ADMIN','MANAGER','PRODUCTION_MANAGER','OPERATOR'],
    visible: true,
    badge: null,
    notes: '생산일정 서브 탭.'
  },
  {
    menuId: 'schedule-model',
    label: '모델별 생산관리',
    area: 'user',
    group: '생산운영관리',
    routeKey: 'schedule-model',
    pageId: 'page-schedule-model',
    status: 'LIVE',
    permission: ['ADMIN','MANAGER','PRODUCTION_MANAGER','OPERATOR'],
    visible: true,
    badge: null,
    notes: '생산일정 서브 탭.'
  },
  {
    menuId: 'schedule-log',
    label: '작업 이력',
    area: 'user',
    group: '생산운영관리',
    routeKey: 'schedule-log',
    pageId: 'page-schedule-log',
    status: 'LIVE',
    permission: ['ADMIN','MANAGER','PRODUCTION_MANAGER','OPERATOR','VIEWER'],
    visible: true,
    badge: null,
    notes: '생산일정 서브 탭.'
  },
  {
    menuId: 'equip-status',
    label: '장비 생산현황',
    area: 'user',
    group: '생산운영관리',
    routeKey: 'equip-status',
    pageId: 'page-equip-status',
    status: 'PARTIAL',
    permission: ['ADMIN','MANAGER','PRODUCTION_MANAGER','OPERATOR','VIEWER'],
    visible: true,
    badge: '부분',
    notes: '장비별 현황 skeleton. 데이터 연결 예정.'
  },
  {
    menuId: 'team-overview',
    label: '팀별 업무현황',
    area: 'user',
    group: '생산운영관리',
    routeKey: 'team-overview',
    pageId: 'page-team-overview',
    status: 'PARTIAL',
    permission: ['ADMIN','MANAGER','PRODUCTION_MANAGER'],
    visible: true,
    badge: '부분',
    notes: '팀별 업무 현황 skeleton.'
  },
  {
    menuId: 'prod-overview',
    label: '생산현황 개요',
    area: 'user',
    group: '생산운영관리',
    routeKey: 'prod-overview',
    pageId: 'page-prod-overview',
    status: 'PARTIAL',
    permission: ['ADMIN','MANAGER','PRODUCTION_MANAGER','OPERATOR','VIEWER'],
    visible: true,
    badge: '부분',
    notes: '생산 종합 현황 구현 중.'
  },
  {
    menuId: 'prod-headcount',
    label: '인원 현황',
    area: 'user',
    group: '생산운영관리',
    routeKey: 'prod-headcount',
    pageId: 'page-prod-headcount',
    status: 'PARTIAL',
    permission: ['ADMIN','MANAGER','PRODUCTION_MANAGER'],
    visible: true,
    badge: '부분',
    notes: '인원 현황 skeleton.'
  },
  {
    menuId: 'prod-process',
    label: '공정 현황',
    area: 'user',
    group: '생산운영관리',
    routeKey: 'prod-process',
    pageId: 'page-prod-process',
    status: 'PARTIAL',
    permission: ['ADMIN','MANAGER','PRODUCTION_MANAGER','OPERATOR'],
    visible: true,
    badge: '부분',
    notes: '공정별 현황 구현 중.'
  },
  {
    menuId: 'data-equip',
    label: '장비 데이터',
    area: 'user',
    group: '데이터 관리',
    routeKey: 'data-equip',
    pageId: 'page-data-equip',
    status: 'PARTIAL',
    permission: ['ADMIN','MANAGER','PRODUCTION_MANAGER','OPERATOR'],
    visible: true,
    badge: '부분',
    notes: '장비 데이터 관리 화면. 일부 기능 구현 중.'
  },
  {
    menuId: 'download',
    label: '다운로드',
    area: 'user',
    group: '데이터 관리',
    routeKey: 'download',
    pageId: 'page-download',
    status: 'PARTIAL',
    permission: ['ADMIN','MANAGER','PRODUCTION_MANAGER','QUALITY_MANAGER','OPERATOR','VIEWER'],
    visible: true,
    badge: '부분',
    notes: '다운로드 기능 구현 중.'
  },

  // ── 품질관리 ────────────────────────────────────────────────────────────

  {
    menuId: 'quality-dash',
    label: '품질 통합 대시보드',
    area: 'user',
    group: '품질관리',
    routeKey: 'quality-dash',
    pageId: 'page-quality-dash',
    status: 'LIVE',
    permission: ['ADMIN','MANAGER','QUALITY_MANAGER','PRODUCTION_MANAGER','OPERATOR','VIEWER'],
    visible: true,
    badge: null,
    notes: '06A 차트 구현 완료. Dashboard Ready 검토 후 렌더. 06D 플로우 게이트 포함.'
  },
  {
    menuId: 'quality-main',
    label: '불량 관리 센터',
    area: 'user',
    group: '품질관리',
    routeKey: 'quality-main',
    pageId: 'page-quality-main',
    status: 'LIVE',
    permission: ['ADMIN','MANAGER','QUALITY_MANAGER','OPERATOR'],
    visible: true,
    badge: null,
    notes: '엑셀 업로드 → Raw → Issue → Normalize → Summary → Dashboard Ready 전체 플로우 완성.'
  },
  {
    menuId: 'quality-analysis',
    label: '품질 분석센터',
    area: 'user',
    group: '품질관리',
    routeKey: 'quality-analysis',
    pageId: 'page-quality-analysis',
    status: 'LIVE',
    permission: ['ADMIN','MANAGER','QUALITY_MANAGER','PRODUCTION_MANAGER','VIEWER'],
    visible: true,
    badge: null,
    notes: '08K 품질 분석센터 10개 탭 clean rebuild. 기존 업로드 flow 데이터 read-only 분석 기반.'
  },
  {
    menuId: 'quality-action',
    label: '조치 · ECO · CAPA',
    area: 'user',
    group: '품질관리',
    routeKey: 'quality-action',
    pageId: 'page-quality-action',
    status: 'PARTIAL',
    permission: ['ADMIN','MANAGER','QUALITY_MANAGER'],
    visible: true,
    badge: '부분',
    notes: 'Workflow skeleton 구현. 실제 ECO/CAPA 추적은 미구현.'
  },
  {
    menuId: 'quality-images',
    label: '이미지 증빙',
    area: 'user',
    group: '품질관리',
    routeKey: 'quality-images',
    pageId: 'page-quality-images',
    status: 'PARTIAL',
    permission: ['ADMIN','MANAGER','QUALITY_MANAGER','OPERATOR'],
    visible: true,
    badge: '부분',
    notes: '이미지 업로드/조회 skeleton. 실제 저장 미구현.'
  },
  {
    menuId: 'quality-master',
    label: '기준정보 / 코드 관리',
    area: 'user',
    group: '품질관리',
    routeKey: 'quality-master',
    pageId: 'page-quality-master',
    status: 'PARTIAL',
    permission: ['ADMIN','MANAGER','QUALITY_MANAGER'],
    visible: true,
    badge: '부분',
    notes: '분류 코드화 후보 조회 가능. 실제 CRUD 미구현.'
  },

  // ── 관리자 ──────────────────────────────────────────────────────────────

  {
    menuId: 'admin-dashboard',
    label: '관리자 대시보드',
    area: 'admin',
    group: '관리자',
    routeKey: 'admin-dashboard',
    pageId: null,
    status: 'COMING_SOON',
    permission: ['ADMIN'],
    visible: false,
    badge: '준비 중',
    notes: '관리자 전용 현황 대시보드. 미구현.'
  },
  {
    menuId: 'admin-user',
    label: '사용자 관리',
    area: 'admin',
    group: '관리자',
    routeKey: 'admin-user',
    pageId: null,
    status: 'COMING_SOON',
    permission: ['ADMIN'],
    visible: false,
    badge: '준비 중',
    notes: '사용자 계정 CRUD. 미구현.'
  },
  {
    menuId: 'admin-role',
    label: '권한 관리',
    area: 'admin',
    group: '관리자',
    routeKey: 'admin-role',
    pageId: null,
    status: 'COMING_SOON',
    permission: ['ADMIN'],
    visible: false,
    badge: '준비 중',
    notes: '역할/권한 설정. 06F 이후 구현 예정.'
  },
  {
    menuId: 'admin-team',
    label: '팀 관리',
    area: 'admin',
    group: '관리자',
    routeKey: 'admin-team',
    pageId: null,
    status: 'COMING_SOON',
    permission: ['ADMIN','MANAGER'],
    visible: false,
    badge: '준비 중',
    notes: '팀/부서 구성 관리. 미구현.'
  },
  {
    menuId: 'admin-menu',
    label: '메뉴 관리',
    area: 'admin',
    group: '관리자',
    routeKey: 'admin-menu',
    pageId: null,
    status: 'ADMIN_ONLY',
    permission: ['ADMIN'],
    visible: false,
    badge: '관리자',
    notes: 'ODI_MENU_STATUS_MAP 기반. 이번 06E에서 데이터 구조 준비.'
  },
  {
    menuId: 'admin-code',
    label: '코드/환경설정',
    area: 'admin',
    group: '관리자',
    routeKey: 'admin-code',
    pageId: null,
    status: 'COMING_SOON',
    permission: ['ADMIN'],
    visible: false,
    badge: '준비 중',
    notes: '시스템 코드/환경설정 관리. 미구현.'
  },
  {
    menuId: 'admin-audit',
    label: '감사 로그',
    area: 'admin',
    group: '관리자',
    routeKey: 'admin-audit',
    pageId: null,
    status: 'COMING_SOON',
    permission: ['ADMIN'],
    visible: false,
    badge: '준비 중',
    notes: '사용자 행동 감사 로그. 미구현.'
  }
];

// ── 06E 메뉴 상태 helper ─────────────────────────────────────────────────

function odiGetMenuStatus(routeKey) {
  for(var i = 0; i < ODI_MENU_STATUS_MAP.length; i++) {
    if(ODI_MENU_STATUS_MAP[i].routeKey === routeKey) return ODI_MENU_STATUS_MAP[i];
  }
  return null;
}

function odiIsMenuLive(routeKey) {
  var m = odiGetMenuStatus(routeKey);
  return !!(m && m.status === 'LIVE');
}

function odiGetMenuBadgeHtml(routeKey) {
  var m = odiGetMenuStatus(routeKey);
  if(!m || !m.badge) return '';
  var color = {
    '부분':'rgba(245,158,11,.15)', '준비 중':'rgba(99,102,241,.15)',
    '관리자':'rgba(239,68,68,.12)', '숨김':'rgba(100,116,139,.12)'
  }[m.badge] || 'rgba(100,116,139,.12)';
  var tc = {
    '부분':'#f59e0b', '준비 중':'#818cf8', '관리자':'#ef4444', '숨김':'#94a3b8'
  }[m.badge] || '#94a3b8';
  return '<span style="display:inline-block;padding:1px 6px;border-radius:8px;font-size:9px;font-weight:700;background:'+color+';color:'+tc+';margin-left:4px">'+m.badge+'</span>';
}

function odiHasPermission(routeKey, userRole) {
  var m = odiGetMenuStatus(routeKey);
  if(!m) return false;
  return m.permission.indexOf(userRole) >= 0;
}

// ── 06E 메뉴 상태 요약 함수 (관리자 메뉴관리 연결용) ─────────────────────

function odiBuildMenuStatusSummary() {
  var total = ODI_MENU_STATUS_MAP.length;
  var byStatus = {}, byArea = {};
  var hidden=0, comingSoon=0, adminOnly=0, missingPage=0, live=[], partial=[];

  ODI_MENU_STATUS_MAP.forEach(function(m) {
    byStatus[m.status] = (byStatus[m.status]||0) + 1;
    byArea[m.area]     = (byArea[m.area]||0) + 1;
    if(m.status === 'HIDDEN')       hidden++;
    if(m.status === 'COMING_SOON')  comingSoon++;
    if(m.status === 'ADMIN_ONLY')   adminOnly++;
    if(!m.pageId)                   missingPage++;
    if(m.status === 'LIVE')         live.push(m.menuId);
    if(m.status === 'PARTIAL')      partial.push(m.menuId);
  });

  return {
    totalMenus:       total,
    byStatus:         byStatus,
    byArea:           byArea,
    hiddenCount:      hidden,
    comingSoonCount:  comingSoon,
    adminOnlyCount:   adminOnly,
    missingPageIdCount: missingPage,
    liveMenus:        live,
    partialMenus:     partial
  };
}

// ── 관리자 메뉴관리 패널 렌더 helper (q-admin-menu-panel id에 연결) ──────

function odiRenderMenuStatusPanel(containerId) {
  var wrap = document.getElementById(containerId);
  if(!wrap) return;
  function _e(s){ return String(s===null||s===undefined?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var summary = odiBuildMenuStatusSummary();
  var SEV_STATUS_COLOR = {
    LIVE:'#22c55e', PARTIAL:'#f59e0b', READY_DATA:'#818cf8',
    COMING_SOON:'#94a3b8', ADMIN_ONLY:'#ef4444', HIDDEN:'#475569', DEPRECATED:'#b91c1c'
  };

  var statusRow = Object.keys(summary.byStatus).map(function(s) {
    var c = SEV_STATUS_COLOR[s]||'#888';
    return '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:9px;background:'+c.text+'20;color:'+c.text+';font-size:10px;font-weight:700;border:1px solid '+c+'30">'+
      _e(ODI_MENU_STATUS_ENUM[s]||s)+': '+summary.byStatus[s]+
    '</span>';
  }).join('');

  var tblRows = ODI_MENU_STATUS_MAP.map(function(m, i) {
    var c = SEV_STATUS_COLOR[m.status]||'#888';
    return '<tr>'+
      '<td>'+_e(m.area)+'</td>'+
      '<td>'+_e(m.group)+'</td>'+
      '<td>'+_e(m.label)+'</td>'+
      '<td>'+_e(m.routeKey)+'</td>'+
      '<td>'+(_e(m.pageId)||'<span style="color:var(--tm)">없음</span>')+'</td>'+
      '<td><span style="font-size:9px;font-weight:700;color:'+c.text+'">'+_e(m.status)+'</span></td>'+
      '<td style="font-size:9px;color:var(--tm)">'+_e(m.notes||'—')+'</td>'+
    '</tr>';
  }).join('');

  wrap.innerHTML =
    '<div style="background:var(--sf);border:1px solid var(--bd);border-radius:10px;padding:14px 16px;">'+
      '<div style="font-size:13px;font-weight:700;color:var(--ts);margin-bottom:10px">📋 메뉴 상태 현황 — ODI_MENU_STATUS_MAP</div>'+
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">'+statusRow+'</div>'+
      '<div style="font-size:11px;color:var(--tm);margin-bottom:8px">'+
        '전체: <strong>'+summary.totalMenus+'개</strong> &nbsp;|&nbsp; '+
        'LIVE: '+summary.liveMenus.length+' &nbsp;|&nbsp; '+
        'PARTIAL: '+summary.partialMenus.length+' &nbsp;|&nbsp; '+
        '준비 중: '+summary.comingSoonCount+' &nbsp;|&nbsp; '+
        'pageId 없음: '+summary.missingPageIdCount+
      '</div>'+
      '<div style="overflow-x:auto;max-height:400px;overflow-y:auto">'+
      '<table style="border-collapse:collapse;font-size:10px;width:100%;min-width:600px">'+
        '<thead><tr style="background:var(--bd)">'+
          '<th style="padding:5px 8px;text-align:left;color:var(--tm)">영역</th>'+
          '<th style="padding:5px 8px;text-align:left;color:var(--tm)">그룹</th>'+
          '<th style="padding:5px 8px;text-align:left;color:var(--tm)">메뉴명</th>'+
          '<th style="padding:5px 8px;text-align:left;color:var(--tm)">routeKey</th>'+
          '<th style="padding:5px 8px;text-align:left;color:var(--tm)">pageId</th>'+
          '<th style="padding:5px 8px;text-align:left;color:var(--tm)">상태</th>'+
          '<th style="padding:5px 8px;text-align:left;color:var(--tm)">비고</th>'+
        '</tr></thead>'+
        '<tbody>'+tblRows+'</tbody>'+
      '</table></div>'+
    '</div>';
}

// ── 06E 완료 알림 (debug) ──────────────────────────────────────────────────

(function(){
  var s = odiBuildMenuStatusSummary();
  console.log('[06E] ODI_MENU_STATUS_MAP loaded:', s.totalMenus, 'menus |',
    'LIVE:', s.liveMenus.length, '| PARTIAL:', s.partialMenus.length, '| COMING_SOON:', s.comingSoonCount);
})();

// 사용자가 업로드 이후 현재 처리 단계와 다음 액션을 화면에서 확인할 수 있도록
// 06E 결과물에 최소 추적 패널을 선반영한다. 다음 Claude 회차에서는 이 구조를 고도화한다.

function qFlowTraceCount(v) {
  return Array.isArray(v) ? v.length : (v && typeof v === 'object' ? Object.keys(v).length : 0);
}
function qFlowTraceSafeText(v) {
  return String(v===null || v===undefined ? '' : v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function qFlowTraceStatusLabel(state) {
  var m = {
    wait:'대기', active:'진행중', done:'완료', warn:'경고', error:'오류', locked:'잠김'
  };
  return m[state] || state || '대기';
}
function qFlowTraceStateColor(state) {
  var map = {
    wait:   { text:'var(--tm)', bg:'rgba(72,79,88,.10)', border:'var(--bd)' },
    active: { text:'var(--ac)', bg:'var(--acd)', border:'rgba(88,166,255,.30)' },
    done:   { text:'var(--gr)', bg:'var(--grd)', border:'rgba(63,185,80,.30)' },
    warn:   { text:'var(--am)', bg:'var(--amd)', border:'rgba(210,153,34,.35)' },
    error:  { text:'var(--rd)', bg:'var(--rdd)', border:'rgba(248,81,73,.35)' },
    locked: { text:'var(--pr)', bg:'var(--prd)', border:'rgba(188,140,255,.35)' }
  };
  return map[state] || { text:'var(--ts)', bg:'rgba(72,79,88,.10)', border:'var(--bd)' };
}
function qFlowTraceStep(key, label, state, count, desc, actionHtml) {
  return { key:key, label:label, state:state, count:count||0, desc:desc||'', actionHtml:actionHtml||'' };
}
function qGetQualityFlowTraceState() {
  var fileName = QRAW_FILE_META && QRAW_FILE_META.name ? QRAW_FILE_META.name : '';
  var sheetCount = QRAW_SHEET_META && QRAW_SHEET_META.totalSheets ? QRAW_SHEET_META.totalSheets : 0;
  var monthCount = qFlowTraceCount(QRAW_MONTH_SHEETS);
  var rawCount = qFlowTraceCount(QRAW_ROWS);
  var rawWarn = qFlowTraceCount(QRAW_WARNINGS);
  var issueCount = qFlowTraceCount(QISSUE_ROWS);
  var issueWarn = qFlowTraceCount(QISSUE_WARNINGS);
  var normSnap = !!QNORM_REVIEW_SNAPSHOT;
  var normLocked = !!(QISSUE_NORMALIZE_LOCKED && qFlowTraceCount(QISSUE_NORMALIZED_ROWS));
  var normCount = qFlowTraceCount(QISSUE_NORMALIZED_ROWS);
  var normWarn = qFlowTraceCount(QISSUE_NORMALIZE_WARNINGS);
  var schemaReady = !!QSUMMARY_SCHEMA_REVIEWED;
  var summaryReady = !!(QSUMMARY_DATA_READY && QSUMMARY_DATA);
  var dashReady = !!QDASH_READY_DATA;
  var dashReviewed = !!QDASH_READY_REVIEWED;
  var blockers = [];

  if(!fileName) blockers.push('파일이 아직 선택되지 않았습니다.');
  else if(!sheetCount) blockers.push('시트 파싱 결과가 아직 없습니다.');
  else if(!rawCount) blockers.push('전체 Raw Data가 아직 생성되지 않았습니다.');
  else if(!issueCount) blockers.push('불량 이슈 데이터가 아직 생성되지 않았습니다.');
  else if(!normLocked) blockers.push('정규화 잠금본이 아직 없습니다.');
  else if(!summaryReady) blockers.push('분석 집계 데이터가 아직 생성되지 않았습니다.');
  else if(!dashReady) blockers.push('Dashboard Ready 데이터가 아직 생성되지 않았습니다.');
  else if(!dashReviewed) blockers.push('Dashboard Ready 검토 완료가 필요합니다.');

  var steps = [
    qFlowTraceStep('file','파일 선택', fileName?'done':'wait', fileName?1:0, fileName ? fileName : '.xlsx 파일을 선택하세요.', ''),
    qFlowTraceStep('engine','엑셀 엔진/시트 파싱', sheetCount?'done':(fileName?'active':'wait'), sheetCount, sheetCount ? ('전체 '+sheetCount+'개 시트 · 월별 후보 '+monthCount+'개') : 'SheetJS 로딩 및 시트명 분석 대기', ''),
    qFlowTraceStep('raw','Raw Data 생성', rawCount?(rawWarn?'warn':'done'):(sheetCount?'active':'wait'), rawCount, rawCount ? ('Raw '+rawCount+'행 · 경고 '+rawWarn+'건') : '필드 매핑 검토 후 전체 Raw 데이터를 생성하세요.', rawCount?'':'<button class="q-btn-readiness" onclick="qGenerateFullRawRowsCore()">Raw 생성</button>'),
    qFlowTraceStep('issue','불량 이슈 생성', issueCount?(issueWarn?'warn':'done'):(rawCount?'active':'wait'), issueCount, issueCount ? ('Issue '+issueCount+'건 · 경고 '+issueWarn+'건') : 'Raw 데이터에서 불량 이슈 행을 생성하세요.', issueCount?'':'<button class="q-btn-readiness" onclick="qBuildIssueRowsCoreWithGate()">이슈 생성</button>'),
    qFlowTraceStep('normReview','정규화 검토', normSnap?'done':(issueCount?'active':'wait'), normSnap?1:0, normSnap ? '정규화 후보 검토 스냅샷 생성됨' : '중요도/호기/모델/CELL/분류 표준화 후보 검토 필요', normSnap?'':'<button class="q-btn-readiness" onclick="qBuildNormalizeReviewSnapshotOnly()">정규화 검토</button>'),
    qFlowTraceStep('normLock','정규화 잠금', normLocked?(normWarn?'warn':'locked'):(normSnap?'active':'wait'), normCount, normLocked ? ('정규화 잠금본 '+normCount+'건 · 경고 '+normWarn+'건') : '정규화 검토 적용 후 잠금본을 생성하세요.', normLocked?'':'<button class="q-btn-readiness" onclick="qApplyNormalizeReviewOnly()">정규화 적용</button> <button class="q-btn-readiness" onclick="qApplyNormalizeToIssueRowsLockOnly()">잠금본 생성</button>'),
    qFlowTraceStep('summary','분석 집계', summaryReady?'done':(normLocked?'active':'wait'), summaryReady?1:0, summaryReady ? 'KPI/기간/분류/호기/CELL 분석 집계 생성됨' : '정규화 잠금본으로 분석 집계를 생성하세요.', summaryReady?'':'<button class="q-btn-readiness" onclick="qBuildSummarySchemaOnly()">집계 Schema</button> <button class="q-btn-readiness" onclick="qBuildSummaryCoreOnly()">집계 생성</button>'),
    qFlowTraceStep('dashboardReady','Dashboard Ready', dashReady?'done':(summaryReady?'active':'wait'), dashReady?1:0, dashReady ? '대시보드/분석센터 Ready 데이터 생성됨' : 'Dashboard Ready 데이터를 구성하세요.', dashReady?'':'<button class="q-btn-readiness" onclick="qBuildDashboardReadyDataOnly()">Ready 생성</button>'),
    qFlowTraceStep('review','검토 완료', dashReviewed?'done':(dashReady?'active':'wait'), dashReviewed?1:0, dashReviewed ? '대시보드와 분석센터 사용 가능' : 'Dashboard Ready 검토 완료 후 차트 렌더링 가능', dashReviewed?'':'<button class="q-btn-readiness" onclick="qApplyDashboardReadyReviewOnly()">검토 완료</button>')
  ];

  return {
    file:{ name:fileName, sheetCount:sheetCount, monthCount:monthCount },
    raw:{ count:rawCount, warnings:rawWarn },
    validation:{ warnings:rawWarn + issueWarn + normWarn },
    issue:{ count:issueCount, warnings:issueWarn },
    normalization:{ snapshot:normSnap, locked:normLocked, count:normCount, warnings:normWarn },
    summary:{ ready:summaryReady, schemaReviewed:schemaReady },
    dashboardReady:{ ready:dashReady },
    dashboardReviewed:{ reviewed:dashReviewed },
    dashboardRenderable:!!(dashReady && dashReviewed),
    analysisRenderable:!!(dashReady && dashReviewed),
    nextAction:blockers[0] || '대시보드와 분석센터를 확인할 수 있습니다.',
    blockers:blockers,
    steps:steps
  };
}


function qRefreshQualityFlowTracePanel(reason) {
  try{
    qRenderQualityFlowTracePanel('q-flow-trace-main');
    qRenderQualityFlowTracePanel('q-flow-trace-dash','compact');
    var analysisPage = document.getElementById('page-quality-analysis');
    if(analysisPage && !document.getElementById('q-flow-trace-analysis')) {
      analysisPage.insertAdjacentHTML('afterbegin','<div id="q-flow-trace-analysis" style="margin-bottom:12px"></div>');
    }
    qRenderQualityFlowTracePanel('q-flow-trace-analysis','compact');
  }catch(err){ console.warn('[QualityFlowTrace] refresh failed', reason||'', err); }
}
function qFlowTraceWrapFunction(name) {
  var fn = window[name];
  if(typeof fn !== 'function' || fn.__qFlowTraceWrapped) return;
  var wrapped = function(){
    var ret = fn.apply(this, arguments);
    setTimeout(function(){ qRefreshQualityFlowTracePanel(name); }, 80);
    setTimeout(function(){ qRefreshQualityFlowTracePanel(name + ':late'); }, 700);
    return ret;
  };
  wrapped.__qFlowTraceWrapped = true;
  window[name] = wrapped;
}
(function(){
  var names = ['_qShowFilename','qReadSheetNamesOnly','qAnalyzeSheetNamesOnly','qRenderRawPreview10Only','qGenerateFullRawRowsCore','qBuildIssueRowsCore','qBuildIssueRowsCoreWithGate','qBuildNormalizeReviewSnapshotOnly','qApplyNormalizeReviewOnly','qApplyNormalizeToIssueRowsLockOnly','qBuildSummarySchemaOnly','qApplySummarySchemaReviewOnly','qBuildSummaryCoreOnly','qBuildDashboardReadyDataOnly','qApplyDashboardReadyReviewOnly','qResetDashboardReadyOnly','qResetStub','qInvalidateQualityDownstreamStates'];
  names.forEach(qFlowTraceWrapFunction);
  if(typeof nav === 'function' && !nav.__qFlowTraceWrapped) {
    // [STEP02] nav-wrap neutralized; flow-trace refresh moved into odiNavAfterRenderDispatcher
    try { nav.__qFlowTraceWrapped = true; } catch(_e){}
  }
  if(typeof qRenderQualityAnalysisCenterCharts === 'function' && !qRenderQualityAnalysisCenterCharts.__qFlowTraceWrapped) {
    var _qOldAnalysisRender = qRenderQualityAnalysisCenterCharts;
    qRenderQualityAnalysisCenterCharts = function(){
      var ret = _qOldAnalysisRender.apply(this, arguments);
      setTimeout(function(){ qRefreshQualityFlowTracePanel('analysis-render'); }, 80);
      return ret;
    };
    qRenderQualityAnalysisCenterCharts.__qFlowTraceWrapped = true;
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ qRefreshQualityFlowTracePanel('dom'); });
  else qRefreshQualityFlowTracePanel('init');
})();

// ── 기존 qGetQualityFlowTraceState 교체 (12단계 완성) ────────────────────
// 기존 9단계에 Raw 검증 / 대시보드 사용 가능 / 분석센터 사용 가능 추가

(function() {
  // 원래 함수를 12단계 버전으로 교체
  var _prev = typeof qFlowTraceStep === 'function' ? qFlowTraceStep : null;

  qGetQualityFlowTraceState = function() {
    var fileName   = QRAW_FILE_META && QRAW_FILE_META.name ? QRAW_FILE_META.name : '';
    var fileSize   = QRAW_FILE_META && QRAW_FILE_META.size ? Math.round(QRAW_FILE_META.size / 1024) + 'KB' : '';
    var sheetCount = QRAW_SHEET_META && QRAW_SHEET_META.totalSheets ? QRAW_SHEET_META.totalSheets : 0;
    var monthCount = qFlowTraceCount(QRAW_MONTH_SHEETS);
    var rawCount   = qFlowTraceCount(QRAW_ROWS);
    var rawWarn    = qFlowTraceCount(QRAW_WARNINGS);
    var issueCount = qFlowTraceCount(QISSUE_ROWS);
    var issueWarn  = qFlowTraceCount(QISSUE_WARNINGS);
    var normSnap   = !!QNORM_REVIEW_SNAPSHOT;
    var normLocked = !!(QISSUE_NORMALIZE_LOCKED && qFlowTraceCount(QISSUE_NORMALIZED_ROWS));
    var normCount  = qFlowTraceCount(QISSUE_NORMALIZED_ROWS);
    var normWarn   = qFlowTraceCount(QISSUE_NORMALIZE_WARNINGS);
    var schemaReady = !!QSUMMARY_SCHEMA_REVIEWED;
    var summaryReady= !!(QSUMMARY_DATA_READY && QSUMMARY_DATA);
    var dashReady   = !!QDASH_READY_DATA;
    var dashReviewed= !!QDASH_READY_REVIEWED;
    var dashRenderable= !!(dashReady && dashReviewed);
    var analysisRenderable = dashRenderable;

    // Raw 검증 상태
    var rawValidation = rawCount > 0;
    var rawValState = rawValidation
      ? ((rawWarn + issueWarn) > 0 ? 'warn' : 'done')
      : (rawCount > 0 ? 'active' : 'wait');

    var steps = [
      // 1. 파일 선택
      qFlowTraceStep('file', '① 파일 선택',
        fileName ? 'done' : 'wait',
        fileName ? 1 : 0,
        fileName
          ? (fileName + (fileSize ? ' (' + fileSize + ')' : ''))
          : '.xlsx 파일을 선택하세요.',
        ''),

      // 2. 엑셀 엔진/시트 파싱
      qFlowTraceStep('engine', '② 시트 파싱',
        sheetCount ? 'done' : (fileName ? 'active' : 'wait'),
        sheetCount,
        sheetCount
          ? ('총 ' + sheetCount + '개 시트 · 월별 후보 ' + monthCount + '개')
          : 'SheetJS 엔진 로딩 및 시트명 분석 대기',
        ''),

      // 3. Raw Data 생성
      qFlowTraceStep('raw', '③ Raw Data 생성',
        rawCount ? (rawWarn ? 'warn' : 'done') : (sheetCount ? 'active' : 'wait'),
        rawCount,
        rawCount
          ? ('Raw ' + rawCount + '행 · 경고 ' + rawWarn + '건')
          : '필드 매핑 검토 후 전체 Raw 데이터를 생성하세요.',
        rawCount ? '' : '<button class="q-btn-readiness" onclick="qGenerateFullRawRowsCore()">Raw 생성</button>'),

      // 4. Raw 검증 (신규)
      qFlowTraceStep('rawVal', '④ Raw 검증',
        rawCount
          ? ((rawWarn + issueWarn) > 0 ? 'warn' : 'done')
          : 'wait',
        rawCount ? (rawWarn + issueWarn) : 0,
        rawCount
          ? ('필수 필드 누락 · 중복 후보 · 경고 합계 ' + (rawWarn + issueWarn) + '건' + ((rawWarn + issueWarn) === 0 ? ' ✔' : ''))
          : 'Raw Data 생성 후 자동 검증됩니다.',
        ''),

      // 5. 불량 이슈 생성
      qFlowTraceStep('issue', '⑤ 이슈 생성',
        issueCount ? (issueWarn ? 'warn' : 'done') : (rawCount ? 'active' : 'wait'),
        issueCount,
        issueCount
          ? ('Issue ' + issueCount + '건 · 경고 ' + issueWarn + '건')
          : 'Raw 데이터에서 불량 이슈 행을 생성하세요.',
        issueCount ? '' : '<button class="q-btn-readiness" onclick="qBuildIssueRowsCoreWithGate()">이슈 생성</button>'),

      // 6. 정규화 검토
      qFlowTraceStep('normReview', '⑥ 정규화 검토',
        normSnap ? 'done' : (issueCount ? 'active' : 'wait'),
        normSnap ? 1 : 0,
        normSnap
          ? '중요도/호기/모델/CELL/분류 정규화 후보 검토됨'
          : '중요도·호기·모델·분류 표준화 후보를 검토하세요.',
        normSnap ? '' : '<button class="q-btn-readiness" onclick="qBuildNormalizeReviewSnapshotOnly()">정규화 검토</button>'),

      // 7. 정규화 잠금
      qFlowTraceStep('normLock', '⑦ 정규화 잠금',
        normLocked ? (normWarn ? 'warn' : 'locked') : (normSnap ? 'active' : 'wait'),
        normCount,
        normLocked
          ? ('잠금본 ' + normCount + '건 · 경고 ' + normWarn + '건')
          : '정규화 적용 후 잠금본을 생성하세요.',
        normLocked ? '' :
          '<button class="q-btn-readiness" onclick="qApplyNormalizeReviewOnly()">정규화 적용</button> ' +
          '<button class="q-btn-readiness" onclick="qApplyNormalizeToIssueRowsLockOnly()">잠금본 생성</button>'),

      // 8. 분석 집계 생성
      qFlowTraceStep('summary', '⑧ 분석 집계',
        summaryReady ? 'done' : (normLocked ? 'active' : 'wait'),
        summaryReady ? (QSUMMARY_DATA && QSUMMARY_DATA.source ? QSUMMARY_DATA.source.normalizedRows : 1) : 0,
        summaryReady
          ? 'KPI·기간·분류·호기·CELL 분석 집계 생성됨'
          : (schemaReady ? '집계 Core를 생성하세요.' : 'Schema 검토 후 집계를 생성하세요.'),
        summaryReady ? '' :
          (schemaReady
            ? '<button class="q-btn-readiness" onclick="qBuildSummaryCoreOnly()">집계 Core 생성</button>'
            : '<button class="q-btn-readiness" onclick="qBuildSummarySchemaOnly()">Schema 구성</button> '
              + '<button class="q-btn-readiness" onclick="qApplySummarySchemaReviewOnly()">Schema 검토</button>')),

      // 9. Dashboard Ready 생성
      qFlowTraceStep('dashReady', '⑨ Dashboard Ready',
        dashReady ? 'done' : (summaryReady ? 'active' : 'wait'),
        dashReady ? (QDASH_READY_META ? QDASH_READY_META.filteredRows : 1) : 0,
        dashReady
          ? ('Ready 데이터 ' + (QDASH_READY_META ? QDASH_READY_META.filteredRows + '건 ·' : '') + ' blueprint ' + (QDASH_READY_META ? QDASH_READY_META.blueprintCount : '') + '개')
          : '집계 Core 생성 후 Dashboard Ready 데이터를 구성하세요.',
        dashReady ? '' : '<button class="q-btn-readiness" onclick="qBuildDashboardReadyDataOnly()">Ready 생성</button>'),

      // 10. Dashboard Ready 검토 완료
      qFlowTraceStep('dashReview', '⑩ 검토 완료',
        dashReviewed ? 'done' : (dashReady ? 'active' : 'wait'),
        dashReviewed ? 1 : 0,
        dashReviewed
          ? 'Dashboard Ready 검토 완료 — 차트 렌더링 가능'
          : 'Dashboard Ready 검토 완료 후 대시보드/분석센터 차트를 사용할 수 있습니다.',
        dashReviewed ? '' : '<button class="q-btn-readiness" onclick="qApplyDashboardReadyReviewOnly()">검토 완료</button>'),

      // 11. 대시보드 사용 가능 (신규)
      qFlowTraceStep('dashAvail', '⑪ 대시보드',
        dashRenderable ? 'done' : (dashReviewed ? 'done' : 'wait'),
        dashRenderable ? 1 : 0,
        dashRenderable
          ? '품질 통합 대시보드 사용 가능'
          : 'Dashboard Ready 검토 완료 후 대시보드에서 KPI·차트를 확인할 수 있습니다.',
        dashRenderable ? '<button class="q-btn-readiness" onclick="nav(\'quality-dash\')">대시보드 열기</button>' : ''),

      // 12. 분석센터 사용 가능 (신규)
      qFlowTraceStep('analysisAvail', '⑫ 분석센터',
        analysisRenderable ? 'done' : 'wait',
        analysisRenderable ? 1 : 0,
        analysisRenderable
          ? '품질 분석센터 6개 탭 사용 가능'
          : 'Dashboard Ready 검토 완료 후 호기·모델·CELL·기간·분류·Matrix 탭 분석이 가능합니다.',
        analysisRenderable ? '<button class="q-btn-readiness" onclick="nav(\'quality-analysis\')">분석센터 열기</button>' : '')
    ];

    var blockers = [];
    if(!fileName)        blockers.push('품질 엑셀 파일을 선택하세요.');
    else if(!sheetCount) blockers.push('시트 파싱을 완료하세요.');
    else if(!rawCount)   blockers.push('Raw Data를 생성하세요.');
    else if(!issueCount) blockers.push('이슈 데이터를 생성하세요.');
    else if(!normLocked)  blockers.push('정규화 잠금본을 생성하세요.');
    else if(!summaryReady)blockers.push('분석 집계 Core를 생성하세요.');
    else if(!dashReady)   blockers.push('Dashboard Ready 데이터를 구성하세요.');
    else if(!dashReviewed)blockers.push('Dashboard Ready 검토를 완료하세요.');

    return {
      file:{ name:fileName, size:fileSize, sheetCount:sheetCount, monthCount:monthCount },
      raw:{ count:rawCount, warnings:rawWarn },
      validation:{ warnings: rawWarn + issueWarn + normWarn },
      issue:{ count:issueCount, warnings:issueWarn },
      normalization:{ snapshot:normSnap, locked:normLocked, count:normCount, warnings:normWarn },
      summary:{ ready:summaryReady, schemaReviewed:schemaReady },
      dashboardReady:{ ready:dashReady },
      dashboardReviewed:{ reviewed:dashReviewed },
      dashboardRenderable: dashRenderable,
      analysisRenderable:  analysisRenderable,
      nextAction: blockers[0] || '대시보드와 분석센터를 모두 사용할 수 있습니다.',
      blockers: blockers,
      steps: steps
    };
  };
})();

// ── qRenderQualityFlowTracePanel 교체 — full/compact 모두 고도화 ─────────

qRenderQualityFlowTracePanel = function(containerId, mode) {
  var wrap = document.getElementById(containerId);
  if(!wrap) return;
  var st = qGetQualityFlowTraceState();
  var compact = (mode === 'compact');
  var gate    = (mode === 'gate');
  var doneCount = st.steps.filter(function(s){
    return s.state === 'done' || s.state === 'locked';
  }).length;
  var pct = Math.round(doneCount / st.steps.length * 100);

  // ── compact / gate 모드 ──────────────────────────────────────────────
  if(compact || gate) {
    var gateCls = st.blockers.length
      ? 'q-flow-gate q-flow-gate-warn'
      : 'q-flow-gate q-flow-gate-ok';
    var gateIcon = st.blockers.length ? '⚠' : '✅';
    // 진행률 chip들
    var chips = st.steps.map(function(s) {
      var c = qFlowTraceStateColor(s.state);
      var icon = {done:'✔',warn:'⚠',locked:'🔒',active:'▶',wait:'○',error:'✗'}[s.state]||'○';
      return '<span title="'+qFlowTraceSafeText(s.label)+(s.count>0?' ('+s.count+')':'')+'" style="display:inline-flex;align-items:center;gap:2px;padding:1px 6px;border-radius:8px;font-size:9px;font-weight:700;background:'+c.bg+';color:'+c.text+';border:1px solid '+c.border+'">'+icon+' '+qFlowTraceSafeText(s.label)+'</span>';
    }).join(' ');

    wrap.innerHTML =
      '<div class="'+gateCls+'">'+
        '<span class="q-flow-gate-icon">'+gateIcon+'</span>'+
        '<div class="q-flow-gate-msg" style="flex:1">'+
          '<div style="font-weight:700;margin-bottom:4px">품질 처리 진행: '+pct+'% ('+doneCount+'/'+st.steps.length+'단계)</div>'+
          '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px">'+chips+'</div>'+
          (st.blockers.length
            ? '<div style="font-size:10px;margin-top:2px">다음 단계: '+qFlowTraceSafeText(st.blockers[0])+'</div>'
            : '<div style="font-size:10px;margin-top:2px;color:#22c55e">모든 단계 완료 — 대시보드와 분석센터를 사용할 수 있습니다.</div>')+
        '</div>'+
        '<button class="q-btn-filter-reset" style="font-size:10px;padding:3px 8px;flex-shrink:0" onclick="nav(\'quality-main\')">관리센터</button>'+
      '</div>';
    return;
  }

  // ── full 모드 ─────────────────────────────────────────────────────────
  // 진행률 바
  var progressHtml =
    '<div style="background:var(--bd);border-radius:10px;height:8px;overflow:hidden;margin-bottom:10px">'+
      '<div style="height:100%;border-radius:10px;background:'+
        (pct===100?'#22c55e':pct>=70?'#6366f1':'#f59e0b')+
        ';width:'+pct+'%;transition:width .5s ease"></div>'+
    '</div>'+
    '<div style="font-size:10px;color:var(--tm);margin-bottom:10px">'+
      '진행률 '+pct+'% · '+doneCount+'/'+st.steps.length+'단계 완료'+
      (st.blockers.length ? ' · 다음: <strong>' + qFlowTraceSafeText(st.blockers[0]) + '</strong>' : ' · <strong style=\"color:#22c55e\">모든 단계 완료!</strong>')+
    '</div>';

  // 카드 그리드
  var cards = st.steps.map(function(s, idx) {
    var c = qFlowTraceStateColor(s.state);
    var icon = {done:'✅',warn:'⚠️',locked:'🔒',active:'▶️',wait:'⏳',error:'❌'}[s.state]||'⏳';
    var stepAction = s.actionHtml || s.action || '';
    var actionHtml = stepAction
      ? '<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px">' + stepAction + '</div>'
      : '';
    return '<div style="border:1px solid '+c.border+';border-radius:9px;padding:10px 12px;background:'+c.bg+';min-width:140px;flex:1 1 140px;position:relative;overflow:hidden">'+
      '<div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:'+c.text+'"></div>'+
      '<div style="font-size:11px;font-weight:700;color:'+c.text+';margin-left:4px;margin-bottom:3px">'+icon+' '+qFlowTraceSafeText(s.label)+'</div>'+
      '<div style="font-size:10px;color:var(--ts);margin-left:4px;line-height:1.5">'+
        (s.count > 0 ? '<strong style="color:'+c.text+'">'+s.count+'</strong> ' : '')+
        qFlowTraceSafeText(s.desc)+
      '</div>'+
      (actionHtml ? '<div style="margin-left:4px">'+actionHtml+'</div>' : '')+
    '</div>';
  }).join('');

  var nextBtn = '';
  if(st.dashboardRenderable) {
    nextBtn = '<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="q-btn-readiness" onclick="nav(\'quality-dash\')">📊 대시보드 열기</button>' +
      '<button class="q-btn-readiness" onclick="nav(\'quality-analysis\')">📈 분석센터 열기</button>' +
      '</div>';
  }

  wrap.innerHTML =
    '<div style="background:var(--sf);border:1px solid var(--bd);border-radius:10px;padding:14px 16px;">'+
      '<div style="font-size:12px;font-weight:700;color:var(--ts);margin-bottom:8px">검수 상태</div>'+
      progressHtml+
      '<div style="display:flex;flex-wrap:wrap;gap:8px;">'+cards+'</div>'+
      nextBtn+
    '</div>';
};

// ── qRefreshQualityFlowTracePanel 고도화 ─────────────────────────────────

qRefreshQualityFlowTracePanel = function(reason) {
  try {
    qEnsureQualityFlowTraceContainers();
    qRenderQualityFlowTracePanel('q-flow-trace-main', 'compact');
    qRenderQualityFlowTracePanel('q-flow-trace-dash', 'compact');
    // q-flow-trace-analysis — 분석센터 page 안에 동적 삽입
    var ap = document.getElementById('page-quality-analysis');
    if(ap) {
      var existing = document.getElementById('q-flow-trace-analysis');
      if(!existing) {
        existing = document.createElement('div');
        existing.id = 'q-flow-trace-analysis';
        existing.style.marginBottom = '12px';
        ap.insertBefore(existing, ap.firstChild);
      }
    }
    qRenderQualityFlowTracePanel('q-flow-trace-analysis', 'compact');
    // q-dash-flow-gate-static 도 함께 갱신
    if(typeof qRenderDashboardFlowGate === 'function') {
      qRenderDashboardFlowGate('q-dash-flow-gate-static');
    }
  } catch(err) {
    console.warn('[QualityFlowTrace] refresh failed', reason||'', err);
  }
};

// ── 초기 로드 시 자동 렌더 ─────────────────────────────────────────────────

(function(){
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ qRefreshQualityFlowTracePanel('init'); });
  } else {
    setTimeout(function(){ qRefreshQualityFlowTracePanel('init'); }, 50);
  }
})();

// 대시보드/분석센터 렌더링 과정에서 page.innerHTML 교체로 trace container가 사라지는 문제를 방지한다.
function qEnsureQualityFlowTraceContainers(){
  try {
    var mainPage = document.getElementById('page-quality-main');
    if(mainPage && !document.getElementById('q-flow-trace-main')) {
      var m = document.createElement('div');
      m.id = 'q-flow-trace-main';
      m.style.marginBottom = '12px';
      mainPage.insertBefore(m, mainPage.firstChild);
    }
    var dashPage = document.getElementById('page-quality-dash');
    if(dashPage && !document.getElementById('q-flow-trace-dash')) {
      var d = document.createElement('div');
      d.id = 'q-flow-trace-dash';
      d.style.marginBottom = '12px';
      var dashAnchor = dashPage.querySelector && dashPage.querySelector('.pg-hd');
      if(dashAnchor && dashAnchor.nextSibling) dashPage.insertBefore(d, dashAnchor.nextSibling);
      else dashPage.insertBefore(d, dashPage.firstChild);
    }
    var analysisPage = document.getElementById('page-quality-analysis');
    if(analysisPage && !document.getElementById('q-flow-trace-analysis')) {
      var a = document.createElement('div');
      a.id = 'q-flow-trace-analysis';
      a.style.marginBottom = '12px';
      var analysisAnchor = analysisPage.querySelector && analysisPage.querySelector('.pg-hd');
      if(analysisAnchor && analysisAnchor.nextSibling) analysisPage.insertBefore(a, analysisAnchor.nextSibling);
      else analysisPage.insertBefore(a, analysisPage.firstChild);
    }
  } catch(err) {
    console.warn('[QualityFlowTrace] ensure containers failed', err);
  }
}

var _qReviewedRefreshQualityFlowTracePanel = qRefreshQualityFlowTracePanel;
qRefreshQualityFlowTracePanel = function(reason) {
  if(typeof qRenderQualityFlowTracePanel !== 'function') return;
  qEnsureQualityFlowTraceContainers();
  return _qReviewedRefreshQualityFlowTracePanel(reason);
};

if(typeof qRenderQualityDashboardCharts === 'function' && !qRenderQualityDashboardCharts.__qReviewedFlowTraceWrapped) {
  var _qReviewedRenderQualityDashboardCharts = qRenderQualityDashboardCharts;
  qRenderQualityDashboardCharts = function(){
    var ret = _qReviewedRenderQualityDashboardCharts.apply(this, arguments);
    setTimeout(function(){ qRefreshQualityFlowTracePanel('dashboard-render'); }, 80);
    return ret;
  };
  qRenderQualityDashboardCharts.__qReviewedFlowTraceWrapped = true;
}

// Dashboard Ready 검토 버튼 직후에도 대시보드/분석센터 compact trace가 즉시 갱신되도록 보장한다.
if(typeof qApplyDashboardReadyReviewOnly === 'function' && !qApplyDashboardReadyReviewOnly.__qReviewedFlowTraceWrapped) {
  var _qReviewedApplyDashboardReadyReviewOnly = qApplyDashboardReadyReviewOnly;
  qApplyDashboardReadyReviewOnly = function(){
    var ret = _qReviewedApplyDashboardReadyReviewOnly.apply(this, arguments);
    setTimeout(function(){ qRefreshQualityFlowTracePanel('ready-review'); }, 80);
    return ret;
  };
  qApplyDashboardReadyReviewOnly.__qReviewedFlowTraceWrapped = true;
}

(function(){
  function runSidebarOpen(){
    if(typeof odiEnsureSidebarAllGroupsOpen === 'function') odiEnsureSidebarAllGroupsOpen();
  }
  if(typeof applyMenuConfigToSidebar === 'function' && !applyMenuConfigToSidebar.__odiReviewedSidebarOpenWrapped){
    var _odiReviewedApplyMenuConfigToSidebar = applyMenuConfigToSidebar;
    applyMenuConfigToSidebar = function(){
      var ret = _odiReviewedApplyMenuConfigToSidebar.apply(this, arguments);
      setTimeout(runSidebarOpen, 0);
      return ret;
    };
    applyMenuConfigToSidebar.__odiReviewedSidebarOpenWrapped = true;
  }
  if(typeof nav === 'function' && !nav.__odiReviewedSidebarOpenWrapped){
    // [STEP02] nav-wrap neutralized; sidebar-open + flow-trace refresh moved into odiNavAfterRenderDispatcher
    try { nav.__odiReviewedSidebarOpenWrapped = true; } catch(_e){}
  }
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(runSidebarOpen, 0); setTimeout(runSidebarOpen, 250); });
  } else {
    setTimeout(runSidebarOpen, 0);
    setTimeout(runSidebarOpen, 250);
  }
})();

(function(){
  function ensureOpenLater(){
    if(typeof odiEnsureSidebarAllGroupsOpen === 'function') {
      odiEnsureSidebarAllGroupsOpen();
    }
  }
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){
      setTimeout(ensureOpenLater, 0);
      setTimeout(ensureOpenLater, 300);
      setTimeout(ensureOpenLater, 900);
    });
  } else {
    setTimeout(ensureOpenLater, 0);
    setTimeout(ensureOpenLater, 300);
    setTimeout(ensureOpenLater, 900);
  }
})();

var QDEFECT_FILE = null;
var QDEFECT_WORKBOOK_READY = false;
var QDEFECT_COL_DEFAULT = [];
var QDEFECT_RAW_ROWS=[], QDEFECT_IMAGES=[], QDEFECT_UNMATCHED_IMAGES=[];
var QDEFECT_SHEET_SUMMARY=[], QDEFECT_MASTER={}, QDEFECT_SUMMARY_DATA={};
var QDEFECT_ANALYTICS={}, QDEFECT_PARSE_WARNINGS=[];
// 탭 상태
var _qDashTab='overview', _qMainTab='upload', _qAnalysisTab='machine';
var _qActionTab='dashboard', _qImagesTab='all', _qMasterTab='defectcode';
var _qRawPage=1, _qRawFilter={}, _qSelRowId='', _qSelMachine='';
// 상수
var QMONTHLY_RE=/^`?\d{2}\.\d{2}$/;
var QSEV_VALS=['치명','주요','일반','사소','개선'];
var QDEFECT_COL_DEFAULT={severity:2,no:4,date:5,writer:6,dept:7,model:8,machine:9,cell:10,photo:11,content:12,part:13,major:14,middle:15,small:16,etc:17};

// ── 유틸리티 ──
function _qe(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function _qd(v){
  if(!v&&v!==0)return'';
  if(v instanceof Date)return v.toISOString().slice(0,10);
  if(typeof v==='number'&&v>40000)return new Date(Math.round((v-25569)*86400000)).toISOString().slice(0,10);
  var s=String(v);
  var m=s.match(/`?(\d{2})\.(\d{2})\.(\d{2})/);
  if(m)return'20'+m[1]+'-'+m[2]+'-'+m[3];
  m=s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if(m)return m[0];
  return s.slice(0,10);
}
function _qmk(sn){var m=sn.replace(/^`/,'').match(/^(\d{2})\.(\d{2})$/);return m?'20'+m[1]+'-'+m[2]:sn;}
function _qBadge(el,text,color){if(!el)return;el.textContent=text;el.style.background=color==='green'?'rgba(34,197,94,.15)':color==='amber'?'rgba(245,158,11,.15)':color==='red'?'rgba(239,68,68,.15)':'var(--bd2)';el.style.color=color==='green'?'var(--gr)':color==='amber'?'var(--am)':color==='red'?'var(--rd)':'var(--ts)';}
function _qShow(id,show){var el=document.getElementById(id);if(el)el.style.display=show?'block':'none';}

// ── ZIP 파서 ──
function _qZipEntries(ab){
  var view=new DataView(ab),bytes=new Uint8Array(ab),entries={},eocd=-1;
  for(var i=bytes.length-22;i>=Math.max(0,bytes.length-65536);i--){if(view.getUint32(i,true)===0x06054b50){eocd=i;break;}}
  if(eocd<0)return entries;
  var n=view.getUint16(eocd+8,true),pos=view.getUint32(eocd+16,true),dec=new TextDecoder();
  for(var j=0;j<n;j++){
    if(pos+46>bytes.length||view.getUint32(pos,true)!==0x02014b50)break;
    var fnL=view.getUint16(pos+28,true),exL=view.getUint16(pos+30,true),cmL=view.getUint16(pos+32,true);
    entries[dec.decode(bytes.slice(pos+46,pos+46+fnL))]={lOff:view.getUint32(pos+42,true),cm:view.getUint16(pos+10,true),cSz:view.getUint32(pos+20,true)};
    pos+=46+fnL+exL+cmL;
  }
  return entries;
}
async function _qZipRead(ab,meta){
  var view=new DataView(ab),bytes=new Uint8Array(ab),off=meta.lOff;
  if(view.getUint32(off,true)!==0x04034b50)return null;
  var fnL=view.getUint16(off+26,true),exL=view.getUint16(off+28,true);
  var data=bytes.slice(off+30+fnL+exL,off+30+fnL+exL+meta.cSz);
  if(meta.cm===0)return data;
  if(meta.cm===8){try{var ds=new DecompressionStream('deflate-raw'),w=ds.writable.getWriter();w.write(data);w.close();var chunks=[],r=ds.readable.getReader();while(true){var rd=await r.read();if(rd.done)break;chunks.push(rd.value);}var tot=chunks.reduce(function(a,c){return a+c.length;},0),out=new Uint8Array(tot),p=0;chunks.forEach(function(ch){out.set(ch,p);p+=ch.length;});return out;}catch(e){return null;}}
  return null;
}
function _qXML(s){try{return new DOMParser().parseFromString(s,'application/xml');}catch(e){return null;}}

// ── 헤더 탐색 (flexible parser) ──
function detectQDefectHeaderMap(ws){
  var rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:null,range:0});
  var col=Object.assign({},QDEFECT_COL_DEFAULT);
  var KW={severity:['중요도'],no:['구분','No','번호'],date:['날짜'],writer:['작성자'],dept:['부서'],model:['종류','모델','장비'],machine:['호기'],cell:['CELL','cell'],photo:['사진'],content:['내용'],part:['파트'],major:['대분류'],middle:['중분류'],small:['소분류'],etc:['기타']};
  for(var r=0;r<Math.min(rows.length,12);r++){
    var row=rows[r];if(!row)continue;
    for(var c2=0;c2<row.length;c2++){
      var v=String(row[c2]||'').trim();if(!v)continue;
      for(var f in KW){if(KW[f].some(function(kw){return v.indexOf(kw)>=0;}))col[f]=c2;}
    }
  }
  return col;
}

// ── 월별 시트 파싱 ──
function parseQDefectMonthlySheet(wb,sn){
  var ws=wb.Sheets[sn];if(!ws)return[];
  var col=detectQDefectHeaderMap(ws),mk=_qmk(sn);
  var rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:null,range:0});
  var result=[];
  for(var i=7;i<rows.length;i++){
    var row=rows[i];
    if(!row||!row.some(function(v){return v!==null&&v!==''&&v!==undefined;}))continue;
    var sev=String(row[col.severity]||'').trim(),content=row[col.content],date=_qd(row[col.date]);
    if(!sev&&!content&&!date)continue;
    var ps='ok',pw=[];
    if(!sev||QSEV_VALS.indexOf(sev)<0){pw.push('중요도 미확인');if(!sev)ps='warning';}
    if(!content){pw.push('내용 없음');if(ps==='ok')ps='warning';}
    if(!date){pw.push('날짜 파싱 실패');if(ps==='ok')ps='warning';}
    var model=String(row[col.model]||'').trim(),machine=row[col.machine]!=null?String(row[col.machine]).trim():'';
    var cellV=row[col.cell]!=null?String(row[col.cell]).trim():'';
    result.push({
      id:sn+'_R'+(i+1),sourceSheet:sn,sourceRow:i+1,monthKey:mk,
      no:row[col.no],date:date,writer:String(row[col.writer]||'').trim(),
      dept:String(row[col.dept]||'').trim(),model:model,machine:machine,cell:cellV,
      severity:sev,content:String(content||'').replace(/\n/g,' ').trim(),
      part:String(row[col.part]||'').trim(),majorCategory:String(row[col.major]||'').trim(),
      middleCategory:String(row[col.middle]||'').trim(),smallCategory:String(row[col.small]||'').trim(),
      etc:String(row[col.etc]||'').trim(),imageCount:0,images:[],
      parseStatus:ps,parseWarnings:pw,
      isCritical:sev==='치명',modelMachineKey:model+(machine?'-'+machine:''),
      categoryPath:[row[col.part],row[col.major],row[col.middle],row[col.small]].filter(Boolean).join(' > ')
    });
  }
  return result;
}

// ── SUMMARY 파싱 ──
function parseQDefectSummary(wb){
  var ws=wb.Sheets['SUMMARY'];if(!ws)return{};
  var rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:null,range:0});
  var res={monthCounts:{},severityCounts:{}};
  if(rows[2]){var ms=rows[2].slice(3),cs=rows[3]?rows[3].slice(3):[];ms.forEach(function(m,i){if(m&&cs[i]!=null)res.monthCounts[String(m)]=cs[i];});}
  for(var r=7;r<Math.min(rows.length,14);r++){var row=rows[r];if(!row)continue;var sv=String(row[2]||'').trim();if(QSEV_VALS.indexOf(sv)>=0)res.severityCounts[sv]=row[3]||0;}
  return res;
}

// ── 마스터 파싱 ──
function parseQDefectMaster(wb){
  var m={parts:[],severities:[],codes:[],others:[],writers:[]};
  if(wb.Sheets['코드마스터']){var rs=XLSX.utils.sheet_to_json(wb.Sheets['코드마스터'],{header:1,defval:null});rs.slice(4).forEach(function(r){if(r&&r[0])m.parts.push({name:r[0],en:r[1]||'',code:r[2]||''});});}
  if(wb.Sheets['중요도']){var rs2=XLSX.utils.sheet_to_json(wb.Sheets['중요도'],{header:1,defval:null});rs2.forEach(function(r){var sv=String(r&&r[1]||'').trim();if(QSEV_VALS.indexOf(sv)>=0)m.severities.push({name:sv,criteria:r[3]||'',desc:r[4]||''});});}
  if(wb.Sheets['기타분류']){var rs3=XLSX.utils.sheet_to_json(wb.Sheets['기타분류'],{header:1,defval:null});m.others=rs3.slice(1).filter(function(r){return r&&r[0];}).map(function(r){return{value:r[0],desc:r[1]||''};});}
  return m;
}

// ── 분석 빌드 ──
function buildQDefectAnalytics(rows){
  function cnt(key){var m={};rows.forEach(function(r){var v=r[key]||'기타';m[v]=(m[v]||0)+1;});return Object.keys(m).map(function(k){return{k:k,n:m[k]};}).sort(function(a,b){return b.n-a.n;});}
  var now=new Date().toISOString().slice(0,7);
  return{
    total:rows.length,byMonth:cnt('monthKey'),bySev:cnt('severity'),byPart:cnt('part'),
    byMajor:cnt('majorCategory'),byMiddle:cnt('middleCategory'),bySmall:cnt('smallCategory'),
    byModel:cnt('model'),byMachine:cnt('machine'),byCell:cnt('cell'),byWriter:cnt('writer'),byDate:cnt('date'),
    withImage:rows.filter(function(r){return r.imageCount>0;}).length,
    critical:rows.filter(function(r){return r.severity==='치명';}).length,
    major:rows.filter(function(r){return r.severity==='주요';}).length,
    thisMonth:rows.filter(function(r){return r.monthKey===now;}).length,
    topPart:(cnt('part')[0]||{k:'—'}).k,topMachine:(cnt('machine')[0]||{k:'—'}).k,topModel:(cnt('model')[0]||{k:'—'}).k,
    unmappedCell:rows.filter(function(r){return!r.cell;}).length
  };
}

// ── 이미지 추출 ──
async function _qBuildSheetDrawingMap(ab){
  var entries=_qZipEntries(ab),dec=new TextDecoder();
  async function rXml(fn){if(!entries[fn])return null;var b=await _qZipRead(ab,entries[fn]);return b?_qXML(dec.decode(b)):null;}
  var wbXml=await rXml('xl/workbook.xml');if(!wbXml)return{};
  var snToRId={},sEls=wbXml.getElementsByTagName('sheet');
  for(var i=0;i<sEls.length;i++)snToRId[sEls[i].getAttribute('name')]=sEls[i].getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id');
  var wbRels=await rXml('xl/_rels/workbook.xml.rels');if(!wbRels)return{};
  var rIdToFile={},rEls=wbRels.getElementsByTagName('Relationship');
  for(var j=0;j<rEls.length;j++)rIdToFile[rEls[j].getAttribute('Id')]=rEls[j].getAttribute('Target')||'';
  var map={};
  for(var sname in snToRId){
    if(!QMONTHLY_RE.test(sname.replace(/^`/,'')))continue;
    var sf=(rIdToFile[snToRId[sname]]||'').split('/').pop();
    var srXml=await rXml('xl/worksheets/_rels/'+sf+'.rels');if(!srXml)continue;
    var srEls=srXml.getElementsByTagName('Relationship');
    for(var k=0;k<srEls.length;k++){var t=srEls[k].getAttribute('Target')||'';var dm=t.match(/drawing(\d+)\.xml/);if(dm){map[sname]=parseInt(dm[1]);break;}}
  }
  return map;
}
async function _qParseDrawing(ab,dNum){
  var entries=_qZipEntries(ab),dec=new TextDecoder();
  var df='xl/drawings/drawing'+dNum+'.xml',rf='xl/drawings/_rels/drawing'+dNum+'.xml.rels';
  if(!entries[df]||!entries[rf])return{};
  var db=await _qZipRead(ab,entries[df]),rb=await _qZipRead(ab,entries[rf]);
  if(!db||!rb)return{};
  var dXml=_qXML(dec.decode(db)),rXml2=_qXML(dec.decode(rb));
  if(!dXml||!rXml2)return{};
  var rMap={},rs=rXml2.getElementsByTagName('Relationship');
  for(var i=0;i<rs.length;i++)rMap[rs[i].getAttribute('Id')]=(rs[i].getAttribute('Target')||'').split('/').pop();
  var NS='http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing',rowImgs={};
  function proc(tag){var els=dXml.getElementsByTagNameNS(NS,tag);for(var j=0;j<els.length;j++){var fr=els[j].getElementsByTagNameNS(NS,'from')[0];if(!fr)continue;var rEl=fr.getElementsByTagNameNS(NS,'row')[0];if(!rEl)continue;var eRow=parseInt(rEl.textContent)+1;var blips=els[j].getElementsByTagName('a:blip');if(!blips.length)blips=els[j].getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main','blip');for(var k=0;k<blips.length;k++){var rId=blips[k].getAttribute('r:embed')||blips[k].getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','embed');if(!rId)continue;var imgF=rMap[rId];if(!imgF)continue;if(!rowImgs[eRow])rowImgs[eRow]=[];rowImgs[eRow].push(imgF);}}}
  proc('twoCellAnchor');proc('oneCellAnchor');
  return rowImgs;
}
async function extractQDefectImages(ab,sdMap){
  var entries=_qZipEntries(ab),imgs=[],id=0;
  for(var sname in sdMap){
    var dn=sdMap[sname],rowImgs=await _qParseDrawing(ab,dn);
    for(var row in rowImgs){
      for(var i=0;i<rowImgs[row].length;i++){
        var fn=rowImgs[row][i],mp='xl/media/'+fn;
        if(!entries[mp])continue;
        var imgBytes=await _qZipRead(ab,entries[mp]);if(!imgBytes)continue;
        var ext=fn.split('.').pop().toLowerCase(),mime=ext==='png'?'image/png':'image/jpeg';
        var url=URL.createObjectURL(new Blob([imgBytes],{type:mime}));
        imgs.push({id:'img_'+(++id),sheetName:sname,excelRow:parseInt(row),fileName:fn,objectUrl:url,matched:false,rowId:null});
      }
    }
  }
  return imgs;
}
function attachQDefectImages(rows,images){
  var rMap={};rows.forEach(function(r){rMap[r.sourceSheet+'_'+r.sourceRow]=r;});
  var matched=[],unmatched=[];
  images.forEach(function(img){
    var row=rMap[img.sheetName+'_'+img.excelRow];
    if(row){row.images.push(img.id);row.imageCount++;img.matched=true;img.rowId=row.id;matched.push(img);}
    else unmatched.push(img);
  });
  QDEFECT_IMAGES=matched;QDEFECT_UNMATCHED_IMAGES=unmatched;
}

// ── 업로드 핸들러 ──
function handleQDefectUpload(file){
  if(!file)return;
  if(!file.name.endsWith('.xlsx')){alert('.xlsx 파일만 업로드 가능합니다.');return;}
  QDEFECT_FILE=file;
  _qBadge(document.getElementById('qmain-badge'),'분석 중...','amber');
  var reader=new FileReader();
  reader.onload=function(e){
    var ab=e.target.result;
    ensureXlsxReady().then(function(){
      try{var wb=XLSX.read(new Uint8Array(ab),{type:'array',cellDates:true});parseQDefectWorkbook(wb,file,ab);}
      catch(err){_qBadge(document.getElementById('qmain-badge'),'파싱 오류','red');alert('파싱 오류: '+err.message);}
    }).catch(function(err){_qBadge(document.getElementById('qmain-badge'),'엔진 오류','red');alert(err.message);});
  };
  reader.readAsArrayBuffer(file);
}

async function parseQDefectWorkbook(wb,file,ab){
  // 시트 감지 (생산일정 제외)
  QDEFECT_SHEET_SUMMARY=wb.SheetNames.map(function(n){
    var clean=n.replace(/^`/,'');
    var type=QMONTHLY_RE.test(clean)?'monthly':n==='SUMMARY'?'summary':['코드마스터','불량코드배정','리스트','중요도','기타분류','_dropdown_helper','INFO'].indexOf(n)>=0?'master':n==='생산일정'?'excluded':['양식','작성자집계','Sheet1'].indexOf(n)>=0?'reference':'ignored';
    return{name:n,type:type};
  });
  // 마스터
  QDEFECT_MASTER=parseQDefectMaster(wb);
  // 월별 파싱
  var allRows=[];
  QDEFECT_SHEET_SUMMARY.filter(function(s){return s.type==='monthly';}).forEach(function(s){
    var rows=parseQDefectMonthlySheet(wb,s.name);s.rowCount=rows.length;allRows=allRows.concat(rows);
  });
  QDEFECT_RAW_ROWS=allRows;
  // SUMMARY
  QDEFECT_SUMMARY_DATA=parseQDefectSummary(wb);
  // 경고 수집
  QDEFECT_PARSE_WARNINGS=[];
  allRows.forEach(function(r){r.parseWarnings.forEach(function(w){QDEFECT_PARSE_WARNINGS.push({sheet:r.sourceSheet,row:r.sourceRow,msg:w,status:r.parseStatus});});});
  // 이미지
  _qBadge(document.getElementById('qmain-badge'),'이미지 추출 중...','amber');
  try{var sdMap=await _qBuildSheetDrawingMap(ab);var imgs=await extractQDefectImages(ab,sdMap);attachQDefectImages(allRows,imgs);}
  catch(ie){console.warn('이미지 추출 오류:',ie);}
  // 분석
  QDEFECT_ANALYTICS=buildQDefectAnalytics(allRows);
  QDEFECT_WORKBOOK_READY=true;
  var wc=QDEFECT_PARSE_WARNINGS.length,imgAll=QDEFECT_IMAGES.length+QDEFECT_UNMATCHED_IMAGES.length;
  var badgeText=allRows.length+'건 · '+imgAll+'장'+(wc?' · 경고'+wc:'');
  ['qdash-badge','qmain-badge'].forEach(function(id){_qBadge(document.getElementById(id),badgeText,wc?'amber':'green');});
  // 각 페이지 뱃지
  renderQMainUploadResult();
  // 08B: 업로드 후 버튼 영역 표시
  var reupBtns = document.getElementById('qmain-reupload-btns');
  if(reupBtns) reupBtns.style.display = 'flex';
  refreshQDefectAllPages();
  // 07B: 06K Flow Trace 갱신
  if(typeof QRAW_FILE_META !== 'undefined' && QDEFECT_FILE) {
    QRAW_FILE_META = { name: QDEFECT_FILE.name, size: QDEFECT_FILE.size };
  }
  if(typeof qSyncDefectRowsToRebuildFlow === 'function') qSyncDefectRowsToRebuildFlow();
  if(typeof qEnsureQualityFlowTraceContainers === 'function') qEnsureQualityFlowTraceContainers();
  setTimeout(function(){
    if(typeof qRefreshQualityFlowTracePanel === 'function') qRefreshQualityFlowTracePanel('v097-parse-complete');
    if(typeof renderDashboardSummaryNotes === 'function') renderDashboardSummaryNotes();
  }, 150);
}

function resetQDefectData(){
  if(!confirm('업로드 데이터를 초기화합니다.'))return;
  QDEFECT_IMAGES.concat(QDEFECT_UNMATCHED_IMAGES).forEach(function(img){try{URL.revokeObjectURL(img.objectUrl);}catch(e){}});
  QDEFECT_FILE=null;QDEFECT_WORKBOOK_READY=false;QDEFECT_RAW_ROWS=[];QDEFECT_IMAGES=[];QDEFECT_UNMATCHED_IMAGES=[];
  QDEFECT_SHEET_SUMMARY=[];QDEFECT_MASTER={};QDEFECT_SUMMARY_DATA={};QDEFECT_ANALYTICS={};QDEFECT_PARSE_WARNINGS=[];
  _qRawFilter={};_qRawPage=1;
  ['qdash-badge','qmain-badge'].forEach(function(id){_qBadge(document.getElementById(id),'파일 미업로드','');});
  var zone=document.getElementById('qmain-upload-zone'),res=document.getElementById('qmain-upload-result');
  if(zone)zone.style.display='block';if(res){res.style.display='none';res.innerHTML='';}
  ['raw','issues','warnings','imgmatch'].forEach(function(t){_qShow('qmain-panel-'+t,false);});
  _qShow('qmain-panel-upload',true);
  ['qanalysis-empty','qaction-empty','qimages-empty','qmaster-empty'].forEach(function(id){_qShow(id,true);});
  ['qanalysis-content','qaction-content','qimages-content','qmaster-content'].forEach(function(id){_qShow(id,false);});
  _qShow('qdash-empty',true);_qShow('qdash-content',false);
  // 07B: 06K stale 초기화
  if(typeof qInvalidateQualityDownstreamStates==='function')
    qInvalidateQualityDownstreamStates('v097-reset');
  if(typeof qEnsureQualityFlowTraceContainers==='function') qEnsureQualityFlowTraceContainers();
  if(typeof qRefreshQualityFlowTracePanel==='function') qRefreshQualityFlowTracePanel('v097-reset');
}

function refreshQDefectAllPages(){
  // 현재 보이는 quality page 갱신
  var pages=['page-quality-dash','page-quality-main','page-quality-analysis','page-quality-action','page-quality-images','page-quality-master'];
  pages.forEach(function(pid){
    var el=document.getElementById(pid);
    if(el&&el.classList.contains('active')){
      if(pid==='page-quality-dash')renderQDashPage();
      else if(pid==='page-quality-analysis')renderQAnalysisPage();
      else if(pid==='page-quality-action')renderQActionPage();
      else if(pid==='page-quality-images')renderQImagesPage();
      else if(pid==='page-quality-master')renderQMasterPage();
    }
  });
  // empty/content 상태 업데이트
  if(QDEFECT_WORKBOOK_READY){
    _qShow('qanalysis-empty',false);_qShow('qanalysis-content',true);
    _qShow('qaction-empty',false);_qShow('qaction-content',true);
    _qShow('qimages-empty',false);_qShow('qimages-content',true);
    _qShow('qmaster-empty',false);_qShow('qmaster-content',true);
    _qShow('qdash-empty',false);_qShow('qdash-content',true);
  }
  if(typeof qRefreshQualityFlowTracePanel==='function') qRefreshQualityFlowTracePanel('refresh-all-pages');
}

// ════════════════════════════════════════════════════════
// 탭 전환 함수
// ══════════════════════════════════════════════════════
function switchQDash(tab,btn){
  _qDashTab=tab;
  document.querySelectorAll('#qdash-tabbar .qd-tab').forEach(function(b){b.classList.toggle('active',b.dataset.t===tab);});
  renderQDashTab();
}
function switchQMain(tab,btn){
  _qMainTab=tab;
  document.querySelectorAll('#qmain-tabbar .qd-tab').forEach(function(b){b.classList.toggle('active',b.dataset.t===tab);});
  ['upload','raw','issues','detail','warnings','imgmatch'].forEach(function(p){_qShow('qmain-panel-'+p,p===tab);});
  if(QDEFECT_WORKBOOK_READY){
    if(tab==='raw')renderQRawTab();
    else if(tab==='issues')renderQIssuesTab();
    else if(tab==='warnings')renderQWarningsTab();
    else if(tab==='imgmatch')renderQImgMatchTab();
  }
}
function switchQAnalysis(tab,btn){
  _qAnalysisTab=tab;
  document.querySelectorAll('#qanalysis-tabbar .qd-tab').forEach(function(b){b.classList.toggle('active',b.dataset.t===tab);});
  ['machine','model','cell','date','code','writer'].forEach(function(p){_qShow('qanalysis-panel-'+p,p===tab);});
  if(QDEFECT_WORKBOOK_READY){
    if(tab==='machine')renderQAnalysisMachine();
    else if(tab==='model')renderQAnalysisModel();
    else if(tab==='cell')renderQAnalysisCell();
    else if(tab==='date')renderQAnalysisDate();
    else if(tab==='code')renderQAnalysisCode();
    else if(tab==='writer')renderQAnalysisWriter();
  }
}
function switchQAction(tab,btn){
  _qActionTab=tab;
  document.querySelectorAll('#qaction-tabbar .qd-tab').forEach(function(b){b.classList.toggle('active',b.dataset.t===tab);});
  ['dashboard','plan','build','execute','effect','status','close','log'].forEach(function(p){_qShow('qaction-panel-'+p,p===tab);});
  if(QDEFECT_WORKBOOK_READY)renderQActionTab();
}
function switchQImages(tab,btn){
  _qImagesTab=tab;
  document.querySelectorAll('#qimages-tabbar .qd-tab').forEach(function(b){b.classList.toggle('active',b.dataset.t===tab);});
  ['all','linked','unmatched','bymachine','byclass'].forEach(function(p){_qShow('qimages-panel-'+p,p===tab);});
  if(QDEFECT_WORKBOOK_READY)renderQImagesTab();
}
function switchQMaster(tab,btn){
  _qMasterTab=tab;
  document.querySelectorAll('#qmaster-tabbar .qd-tab').forEach(function(b){b.classList.toggle('active',b.dataset.t===tab);});
  ['defectcode','classcode','analysis','other','mapping','form','history'].forEach(function(p){_qShow('qmaster-panel-'+p,p===tab);});
  if(QDEFECT_WORKBOOK_READY)renderQMasterTab();
}
function switchRowDetail(tab,btn){
  document.querySelectorAll('#qd-row-modal-tabs .qd-sub-tab').forEach(function(b){b.classList.toggle('active',b.dataset.dt===tab);});
  var row=QDEFECT_RAW_ROWS.find(function(r){return r.id===_qSelRowId;});if(!row)return;
  renderRowDetailBody(row,tab);
}

// ════════════════════════════════════════════════════════
// 진입점 함수 (nav 라우팅)
// ════════════════════════════════════════════════════════
function renderQDashPage(){if(!QDEFECT_WORKBOOK_READY)return;_qShow('qdash-empty',false);_qShow('qdash-content',true);renderQDashTab();}
function renderQMainPage(){if(_qMainTab==='upload'&&!QDEFECT_WORKBOOK_READY)return;if(QDEFECT_WORKBOOK_READY)switchQMain(_qMainTab,null);}
function renderQAnalysisPage(){if(!QDEFECT_WORKBOOK_READY)return;_qShow('qanalysis-empty',false);_qShow('qanalysis-content',true);switchQAnalysis(_qAnalysisTab,null);}
function renderQActionPage(){if(!QDEFECT_WORKBOOK_READY)return;_qShow('qaction-empty',false);_qShow('qaction-content',true);renderQActionTab();}
function renderQImagesPage(){if(!QDEFECT_WORKBOOK_READY)return;_qShow('qimages-empty',false);_qShow('qimages-content',true);renderQImagesKpi();renderQImagesTab();}
function renderQMasterPage(){if(!QDEFECT_WORKBOOK_READY)return;_qShow('qmaster-empty',false);_qShow('qmaster-content',true);renderQMasterTab();}

// ════════════════════════════════════════════════════════
// P1: 품질 통합 대시보드
// ════════════════════════════════════════════════════════
function renderQDashTab(){
  var el=document.getElementById('qdash-content');if(!el)return;
  if(_qDashTab==='overview')renderQDashOverview();
  else if(_qDashTab==='monthly')renderQDashMonthly();
  else if(_qDashTab==='severity')renderQDashSeverity();
  else if(_qDashTab==='process')renderQDashProcess();
  else if(_qDashTab==='machine')renderQDashMachine();
  else if(_qDashTab==='trend')renderQDashTrend();
  else if(_qDashTab==='alert')renderQDashAlert();
}

function _qBar(items,color,max){
  var mx=max||(items[0]||{n:1}).n;
  return items.map(function(x){var pct=Math.round(x.n/mx*100);return '<div class="qd-bar-row"><span class="qd-bar-label" title="'+_qe(x.k)+'">'+_qe(x.k)+'</span><div class="qd-bar-track"><div class="qd-bar-fill" style="width:'+pct+'%;background:'+(color||'var(--ac)')+'"></div></div><span class="qd-bar-count">'+x.n+'</span></div>';}).join('');
}
function _qCard(title,content){return '<div class="card" style="margin-bottom:12px"><div class="card-title" style="margin-bottom:10px">'+title+'</div>'+content+'</div>';}
function _qKpiCard(label,val,sub,cls){return '<div class="qd-kpi '+(cls||'')+'"><div class="qd-kl">'+label+'</div><div class="qd-kv">'+val+'</div>'+(sub?'<div class="qd-ks">'+sub+'</div>':'')+'</div>';}

function renderQDashOverview(){
  var el=document.getElementById('qdash-content');if(!el)return;
  var an=QDEFECT_ANALYTICS||{}, sd=QDEFECT_SUMMARY_DATA||{};
  var rows = typeof QDEFECT_RAW_ROWS !== 'undefined' ? QDEFECT_RAW_ROWS : [];
  var totalRows = rows.length;

  // KPI 카드 (auto-fill grid)
  function _kpi(label, val, sub, colorClass) {
    var color = colorClass==='ac'?'var(--ac)':colorClass==='rd'?'var(--rd)':colorClass==='am'?'var(--am)':colorClass==='gr'?'var(--gr)':'var(--ts)';
    return '<div style="background:var(--sf);border:1px solid var(--bd);border-radius:8px;padding:10px 12px;min-width:0">'
      +'<div style="font-size:9px;color:var(--tm);margin-bottom:3px">'+label+'</div>'
      +'<div style="font-size:22px;font-weight:800;color:'+color+'">'+val+'</div>'
      +(sub?'<div style="font-size:9px;color:var(--tm)">'+sub+'</div>':'')
      +'</div>';
  }

  var thisMonth = (new Date()).toISOString().slice(0,7);
  var thisMonthCount = rows.filter(function(r){return String(r.date||r.receiptDate||'').slice(0,7)===thisMonth;}).length;
  var critCount = rows.filter(function(r){return r.severity==='치명';}).length;
  var majorCount = rows.filter(function(r){return r.severity==='주요';}).length;
  var imgs = typeof QDEFECT_IMAGES!=='undefined'?QDEFECT_IMAGES.length:0;
  var unmatched = typeof QDEFECT_UNMATCHED_IMAGES!=='undefined'?QDEFECT_UNMATCHED_IMAGES.length:0;
  var warnings = typeof QDEFECT_PARSE_WARNINGS!=='undefined'?QDEFECT_PARSE_WARNINGS.length:0;

  var kpiHtml = '<div class="qd-kpi-row">'
    +_kpi('전체 불량', totalRows, '누적 등록', 'ac')
    +_kpi('이번 달', thisMonthCount, '', '')
    +_kpi('치명', critCount, '즉시 대응', 'rd')
    +_kpi('주요', majorCount, '처리 필요', 'am')
    +_kpi('이미지 증빙', imgs+'건', '', '')
    +_kpi('미매칭 이미지', unmatched+'건', '', unmatched>0?'am':'')
    +_kpi('파싱 경고', warnings+'건', '', warnings>0?'am':'')
    +'</div>';

  // 월별 추이 데이터
  var monthMap = {};
  rows.forEach(function(r){
    var m=String(r.date||r.receiptDate||'').slice(0,7);
    if(!m)return;
    if(!monthMap[m]) monthMap[m]={total:0,crit:0,major:0};
    monthMap[m].total++;
    if(r.severity==='치명') monthMap[m].crit++;
    if(r.severity==='주요') monthMap[m].major++;
  });
  var monthKeys = Object.keys(monthMap).sort().slice(-12);
  var maxM = Math.max.apply(null, monthKeys.map(function(k){return monthMap[k].total;})) || 1;
  var barHtml = monthKeys.map(function(k){
    var v=monthMap[k]; var pct=Math.round(v.total/maxM*100);
    var label=k.slice(2,4)+'.'+k.slice(5,7);
    return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">'
      +'<div style="font-size:9px;color:var(--tm);min-width:34px;text-align:right">'+label+'</div>'
      +'<div style="flex:1;background:var(--bd);border-radius:3px;height:14px;overflow:hidden">'
      +'<div style="width:'+pct+'%;height:100%;background:var(--ac);border-radius:3px"></div></div>'
      +'<div style="font-size:10px;font-weight:700;color:var(--ts);min-width:24px">'+v.total+'</div>'
      +'</div>';
  }).join('');

  // 중요도 분포 donut + 위험 알림 통합
  var SEV_COLORS={'치명':'#ef4444','주요':'#f97316','일반':'#6366f1','사소':'#94a3b8','미분류':'#8b5cf6'};
  var sevMap={};
  rows.forEach(function(r){var s=r.severity||'미분류';sevMap[s]=(sevMap[s]||0)+1;});
  var donutHtml = typeof _qDonutChart==='function'
    ? _qDonutChart(Object.keys(sevMap).map(function(k){return{label:k,value:sevMap[k],color:SEV_COLORS[k]||'#888'};}).sort(function(a,b){return b.value-a.value;}),{w:140})
    : '<div style="color:var(--tm);font-size:10px">데이터 없음</div>';

  // 위험 알림 compact
  var alerts=[];
  if(critCount>0) alerts.push({type:'치명',msg:critCount+'건 즉시 대응 필요',color:'#ef4444'});
  if(unmatched>0) alerts.push({type:'이미지 미매칭',msg:unmatched+'건',color:'#f59e0b'});
  if(warnings>0) alerts.push({type:'파싱 경고',msg:warnings+'건',color:'#f59e0b'});
  var alertHtml = alerts.length>0
    ? '<div style="margin-top:10px;border-top:1px solid var(--bd);padding-top:8px">'
      +alerts.map(function(a){return '<div style="padding:4px 8px;border-left:3px solid '+a.color+';margin-bottom:4px;font-size:10px;color:var(--ts)"><b style="color:'+a.color+'">'+a.type+'</b> '+a.msg+'</div>';}).join('')
      +'</div>'
    : '<div style="margin-top:10px;font-size:10px;color:var(--gr);text-align:center">⚡ 긴급 알림 없음</div>';

  // 월별+중요도 2분할
  var monthSevRow = '<div class="qdash-monthly-severity-row">'
    +'<div class="qdash-monthly-card" style="min-height:320px">'
    +'<div style="font-size:12px;font-weight:700;color:var(--ts);margin-bottom:10px">📈 월별 불량 추이</div>'
    +(barHtml||'<div style="color:var(--tm);font-size:10px;padding:20px">업로드 데이터 없음</div>')
    +'</div>'
    +'<div class="qdash-severity-card" style="min-height:320px">'
    +'<div style="font-size:12px;font-weight:700;color:var(--ts);margin-bottom:10px">🍩 중요도 분포</div>'
    +donutHtml
    +alertHtml
    +'</div>'
    +'</div>';

  // 호기별 TOP12 (machine 필드 기준)
  var machMap = {};
  rows.forEach(function(r){var m=r.machine||r.machineNo||r.호기||'호기 미기재';machMap[m]=(machMap[m]||0)+1;});
  var machItems = Object.keys(machMap).map(function(k){return{label:k,value:machMap[k]};}).sort(function(a,b){return b.value-a.value;}).slice(0,12);
  var machHtml = typeof _qParetoBar==='function' ? _qParetoBar(machItems,{})
    : machItems.map(function(it){var pct=Math.round(it.value/(machItems[0]?machItems[0].value:1)*100);
      return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><div style="font-size:9px;min-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ts)">'+it.label+'</div><div style="flex:1;background:var(--bd);border-radius:3px;height:12px"><div style="width:'+pct+'%;height:100%;background:var(--ac);border-radius:3px"></div></div><div style="font-size:10px;font-weight:700;min-width:24px;color:var(--ts)">'+it.value+'</div></div>';}).join('');

  // 모델별 TOP12 (model 필드 기준)
  var modMap = {};
  rows.forEach(function(r){var m=r.model||r.modelName||r.modelType||r.종류||'모델 미기재';modMap[m]=(modMap[m]||0)+1;});
  var modItems = Object.keys(modMap).map(function(k){return{label:k,value:modMap[k]};}).sort(function(a,b){return b.value-a.value;}).slice(0,12);
  var modHtml = typeof _qParetoBar==='function' ? _qParetoBar(modItems,{})
    : modItems.map(function(it){var pct=Math.round(it.value/(modItems[0]?modItems[0].value:1)*100);
      return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><div style="font-size:9px;min-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ts)">'+it.label+'</div><div style="flex:1;background:var(--bd);border-radius:3px;height:12px"><div style="width:'+pct+'%;height:100%;background:var(--gr);border-radius:3px"></div></div><div style="font-size:10px;font-weight:700;min-width:24px;color:var(--ts)">'+it.value+'</div></div>';}).join('');

  var machModRow = '<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;margin-bottom:14px">'
    +'<div class="qdash-machine-card" style="min-height:280px"><div style="font-size:12px;font-weight:700;color:var(--ts);margin-bottom:10px">🏭 호기별 위험도 TOP12</div>'
    +(machItems.length?machHtml:'<div style="color:var(--tm);font-size:10px;padding:20px">호기 데이터 없음</div>')
    +'</div>'
    +'<div class="qdash-model-card" style="min-height:280px"><div style="font-size:12px;font-weight:700;color:var(--ts);margin-bottom:10px">📦 모델별 중요도 구성 TOP12</div>'
    +(modItems.length?modHtml:'<div style="color:var(--tm);font-size:10px;padding:20px">모델 데이터 없음</div>')
    +'</div>'
    +'</div>';

  el.innerHTML = kpiHtml + monthSevRow + machModRow;
}

function renderQDashMonthly(){
  var el=document.getElementById('qdash-content');if(!el)return;
  var an=QDEFECT_ANALYTICS,sd=QDEFECT_SUMMARY_DATA;
  // 기간 선택 select
  var periodSelect='<div style="margin-bottom:10px;display:flex;align-items:center;gap:8px">'
    +'<label style="font-size:10px;color:var(--tm)">기간 단위</label>'
    +'<select id="qdash-period-sel" onchange="renderQDashMonthly()" style="font-size:10px;padding:3px 24px 3px 8px;border-radius:5px;border:1px solid var(--bd);background:var(--sf);color:var(--ts)">'
    +'<option value="daily">일별</option>'
    +'<option value="weekly">주별</option>'
    +'<option value="monthly" selected>월별</option>'
    +'<option value="quarterly">분기별</option>'
    +'<option value="halfyearly">반기별</option>'
    +'<option value="yearly">연도별</option>'
    +'</select></div>';
  var html='<div class="qd-analysis-grid">'+periodSelect;
  var mItems=an.byMonth.slice().sort(function(a,b){return a.k.localeCompare(b.k);});
  html+=_qCard('월별 불량 건수',_qBar(mItems,'var(--ac)'));
  html+=_qCard('월별 SUMMARY 비교','<div style="overflow-x:auto"><table class="qd-table"><thead><tr><th>월</th><th>SUMMARY</th><th>실제</th><th>차이</th></tr></thead><tbody>'
    +mItems.map(function(x){var sc=sd.monthCounts||{},label=x.k.slice(2,4)+'.'+x.k.slice(5,7);var sv=sc[label]||null;var diff=sv!=null?x.n-sv:null;return'<tr><td><span class="qd-month">'+x.k+'</span></td><td>'+(sv!=null?sv:'—')+'</td><td>'+x.n+'</td><td style="color:'+(diff&&diff!==0?'var(--am)':'var(--ts)')+'">'+(diff!=null?(diff>=0?'+':'')+diff:'—')+'</td></tr>';}).join('')+'</tbody></table></div>');
  html+='</div>';
  var sevColors={'치명':'var(--rd)','주요':'#f97316','일반':'var(--ac)','사소':'var(--ts)','개선':'var(--gr)'};
  html+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px">';
  mItems.forEach(function(m){
    var mRows=QDEFECT_RAW_ROWS.filter(function(r){return r.monthKey===m.k;});
    var sevMap={};mRows.forEach(function(r){sevMap[r.severity]=(sevMap[r.severity]||0)+1;});
    html+='<div class="card"><div class="card-title" style="margin-bottom:8px"><span class="qd-month">'+m.k+'</span> <b>'+m.n+'건</b></div>';
    QSEV_VALS.forEach(function(sv){var cnt=sevMap[sv]||0;if(!cnt)return;var pct=Math.round(cnt/m.n*100);html+='<div class="qd-bar-row"><span class="qd-bar-label qd-sev-'+sv+'" style="min-width:36px">'+sv+'</span><div class="qd-bar-track"><div class="qd-bar-fill" style="width:'+pct+'%;background:'+(sevColors[sv]||'var(--ac)')+'"></div></div><span class="qd-bar-count">'+cnt+'</span></div>';});
    html+='</div>';
  });
  html+='</div>';
  el.innerHTML=html;
}

function renderQDashSeverity(){
  var el=document.getElementById('qdash-content');if(!el)return;
  var an=QDEFECT_ANALYTICS;
  var sevColors={'치명':'var(--rd)','주요':'#f97316','일반':'var(--ac)','사소':'var(--ts)','개선':'var(--gr)'};
  var html='<div class="qd-kpi-row">'
    +QSEV_VALS.map(function(sv){var cnt=an.bySev.find(function(x){return x.k===sv;});return _qKpiCard(sv,cnt?cnt.n:0,'',sv==='치명'?'red':sv==='주요'?'amber':sv==='일반'?'accent':'');}).join('')
    +'</div>';
  html+='<div class="qd-analysis-grid">';
  html+=_qCard('호기별 중요도 분포','<div style="overflow-x:auto"><table class="qd-compare-table"><thead><tr><th>호기</th>'+QSEV_VALS.map(function(sv){return'<th class="qd-sev-'+sv+'">'+sv+'</th>';}).join('')+'<th>합계</th></tr></thead><tbody>'
    +an.byMachine.slice(0,10).map(function(m){var mRows=QDEFECT_RAW_ROWS.filter(function(r){return r.machine===m.k;});var sm={};mRows.forEach(function(r){sm[r.severity]=(sm[r.severity]||0)+1;});return'<tr><td class="row-hd">'+_qe(m.k)+'</td>'+QSEV_VALS.map(function(sv){var c=sm[sv]||0;return'<td style="color:'+(sevColors[sv]||'')+'">'+c+'</td>';}).join('')+'<td><b>'+m.n+'</b></td></tr>';}).join('')+'</tbody></table></div>');
  html+=_qCard('파트별 중요도 분포','<div style="overflow-x:auto"><table class="qd-compare-table"><thead><tr><th>파트</th>'+QSEV_VALS.map(function(sv){return'<th class="qd-sev-'+sv+'">'+sv+'</th>';}).join('')+'<th>합계</th></tr></thead><tbody>'
    +an.byPart.slice(0,8).map(function(p){var pRows=QDEFECT_RAW_ROWS.filter(function(r){return r.part===p.k;});var sm={};pRows.forEach(function(r){sm[r.severity]=(sm[r.severity]||0)+1;});return'<tr><td class="row-hd">'+_qe(p.k)+'</td>'+QSEV_VALS.map(function(sv){var c=sm[sv]||0;return'<td style="color:'+(sevColors[sv]||'')+'">'+c+'</td>';}).join('')+'<td><b>'+p.n+'</b></td></tr>';}).join('')+'</tbody></table></div>');
  html+='</div>';
  el.innerHTML=html;
}

function renderQDashProcess(){
  var el=document.getElementById('qdash-content');if(!el)return;
  var an=QDEFECT_ANALYTICS;
  var html='<div class="qd-analysis-grid">';
  html+=_qCard('파트별 불량 건수 (Pareto)',_qBar(an.byPart,'var(--am)'));
  html+=_qCard('대분류 TOP10',_qBar(an.byMajor.slice(0,10),'var(--ac)'));
  html+=_qCard('중분류 TOP10',_qBar(an.byMiddle.slice(0,10),'var(--pi)'));
  html+=_qCard('소분류 TOP10',_qBar(an.bySmall.slice(0,10),'var(--am)',an.bySmall[0]?an.bySmall[0].n:1));
  html+='</div>';
  el.innerHTML=html;
}

function renderQDashMachine(){
  var el=document.getElementById('qdash-content');if(!el)return;
  var an=QDEFECT_ANALYTICS;
  var html='<div class="qd-analysis-grid">';
  html+=_qCard('호기별 불량 건수',_qBar(an.byMachine,'var(--ac)'));
  html+=_qCard('모델별 불량 건수',_qBar(an.byModel,'var(--gr)'));
  html+=_qCard('CELL별 불량 건수 (미기재: '+an.unmappedCell+'건)',_qBar(an.byCell.slice(0,15),'var(--pi)'));
  html+=_qCard('모델×호기 매트릭스','<div style="overflow-x:auto"><table class="qd-compare-table"><thead><tr><th>모델</th>'+an.byMachine.slice(0,6).map(function(m){return'<th>'+_qe(m.k)+'호기</th>';}).join('')+'</tr></thead><tbody>'
    +an.byModel.map(function(model){return'<tr><td class="row-hd">'+_qe(model.k)+'</td>'+an.byMachine.slice(0,6).map(function(m){var c=QDEFECT_RAW_ROWS.filter(function(r){return r.model===model.k&&r.machine===m.k;}).length;return'<td style="background:rgba(99,102,241,'+(c>0?(c/an.total*3).toFixed(2):'0')+');font-weight:'+(c>5?700:400)+'">'+c+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>');
  html+='</div>';
  el.innerHTML=html;
}

function renderQDashTrend(){
  var el=document.getElementById('qdash-content');if(!el)return;
  var an=QDEFECT_ANALYTICS;
  var sortedMonths=an.byMonth.slice().sort(function(a,b){return a.k.localeCompare(b.k);});
  var html='<div class="card" style="margin-bottom:12px"><div class="card-title" style="margin-bottom:10px">월별 불량 추이 분석</div>';
  if(sortedMonths.length>=2){
    var last=sortedMonths[sortedMonths.length-1],prev=sortedMonths[sortedMonths.length-2];
    var trend=last.n-prev.n,pct=Math.round(Math.abs(trend)/prev.n*100);
    html+='<div style="padding:10px;background:var(--sf2);border-radius:6px;margin-bottom:10px;font-size:12px">'
      +'<span style="color:var(--tp)">전월 대비: </span><span style="color:'+(trend>0?'var(--rd)':'var(--gr)')+'"><b>'+(trend>0?'+':'')+trend+'건</b> ('+pct+'%'+(trend>0?' 증가':' 감소')+')</span>'
      +' | 최근월 평균: <b>'+Math.round(sortedMonths.reduce(function(a,m){return a+m.n;},0)/sortedMonths.length)+'건</b></div>';
  }
  html+=_qBar(sortedMonths,'var(--ac)')+'</div>';
  html+=_qCard('일자별 발생 건수 (상위 20일)',_qBar(an.byDate.slice(0,20),'var(--am)',an.byDate[0]?an.byDate[0].n:1));
  html+='<div class="card"><div class="card-title">차수 매핑</div><div style="font-size:11.5px;color:var(--ts);margin-top:8px">차수는 생산일정 탭 미사용. 날짜+호기+No 기반 추정 — 불명확 항목은 "차수 미확정" 표시.</div></div>';
  el.innerHTML=html;
}

function renderQDashAlert(){
  var el=document.getElementById('qdash-content');if(!el)return;
  var an=QDEFECT_ANALYTICS;
  var alerts=[];
  if(an.critical>0)alerts.push({level:'HIGH',msg:'치명 불량 '+an.critical+'건 — 즉시 조치 필요',detail:'치명 발생 호기: '+(QDEFECT_RAW_ROWS.filter(function(r){return r.severity==='치명';}).map(function(r){return r.machine;}).filter(function(v,i,a){return a.indexOf(v)===i;}).join(', '))||'—'});
  if(an.unmappedCell>an.total*0.3)alerts.push({level:'MED',msg:'CELL 미기재 '+an.unmappedCell+'건 ('+Math.round(an.unmappedCell/an.total*100)+'%)',detail:'Raw Data 검수에서 CELL 정보 보정 권장'});
  if(QDEFECT_UNMATCHED_IMAGES.length>0)alerts.push({level:'LOW',msg:'미매칭 이미지 '+QDEFECT_UNMATCHED_IMAGES.length+'장',detail:'이미지/증빙 센터 > 미매칭 이미지 탭에서 수동 매핑 가능'});
  if(QDEFECT_PARSE_WARNINGS.length>10)alerts.push({level:'LOW',msg:'파싱 경고 '+QDEFECT_PARSE_WARNINGS.length+'건',detail:'불량 관리 센터 > 파싱 경고/오류 탭에서 확인'});
  var colors={'HIGH':'var(--rd)','MED':'var(--am)','LOW':'var(--ts)'};
  var html=alerts.length?'<div style="display:flex;flex-direction:column;gap:8px">'+alerts.map(function(a){return'<div style="padding:12px 14px;border:1px solid '+(colors[a.level]||'var(--bd)')+';border-radius:8px;border-left-width:4px"><div style="font-size:12px;font-weight:600;color:'+(colors[a.level]||'var(--tp)')+';margin-bottom:4px">'+a.msg+'</div><div style="font-size:11px;color:var(--ts)">'+a.detail+'</div></div>';}).join('')+'</div>':'<div class="qd-tab-empty" style="color:var(--gr)">✅ 이상징후 없음</div>';
  el.innerHTML=html;
}

// ════════════════════════════════════════════════════════
// P2: 불량 관리 센터 렌더 함수
// ════════════════════════════════════════════════════════
function renderQMainUploadResult(){
  var zone=document.getElementById('qmain-upload-zone'),res=document.getElementById('qmain-upload-result');
  if(!zone||!res)return;
  zone.style.display='none';res.style.display='block';
  var monthly=QDEFECT_SHEET_SUMMARY.filter(function(s){return s.type==='monthly';});
  var total=QDEFECT_RAW_ROWS.length,ok=QDEFECT_RAW_ROWS.filter(function(r){return r.parseStatus==='ok';}).length,warn=QDEFECT_RAW_ROWS.filter(function(r){return r.parseStatus==='warning';}).length,err=QDEFECT_RAW_ROWS.filter(function(r){return r.parseStatus==='error';}).length;
  var imgAll=QDEFECT_IMAGES.length+QDEFECT_UNMATCHED_IMAGES.length;
  var html='<div class="qd-kpi-row">'
    +_qKpiCard('파일명',(QDEFECT_FILE.name||'').slice(0,20),'')
    +_qKpiCard('월별 시트',monthly.length+'개','','accent')
    +_qKpiCard('전체 불량',total+'건','','accent')
    +_qKpiCard('이미지',imgAll+'장','')
    +_qKpiCard('정상 행',ok+'건','','green')
    +_qKpiCard('경고 행',warn+'건','',warn?'amber':'')
    +_qKpiCard('오류 행',err+'건','',err?'red':'')
    +'</div>';
  // 시트 감지
  html+='<div class="qd-analysis-grid">'
    +'<div class="card"><div class="card-title" style="margin-bottom:8px">시트 감지 결과</div><div style="overflow-x:auto"><table class="qd-table"><thead><tr><th>시트명</th><th>유형</th><th>데이터 행</th></tr></thead><tbody>'
    +QDEFECT_SHEET_SUMMARY.map(function(s){var tn={summary:'요약',monthly:'월별',master:'기준정보',reference:'참고',excluded:'❌ 제외(생산일정)',ignored:'기타'}[s.type]||s.type;var clr=s.type==='monthly'?'color:var(--ac)':s.type==='excluded'?'color:var(--rd)':'';return'<tr><td>'+_qe(s.name)+'</td><td style="'+clr+'">'+tn+'</td><td>'+(s.rowCount!==undefined?s.rowCount+'행':'—')+'</td></tr>';}).join('')+'</tbody></table></div></div>'
    // 컬럼 매핑
    +'<div class="card"><div class="card-title" style="margin-bottom:8px">컬럼 매핑 결과</div><table class="qd-map-table"><thead><tr><th>필드</th><th>열</th><th>신뢰도</th></tr></thead><tbody>'
    +[{f:'중요도',c:'C열'},{f:'날짜',c:'F열'},{f:'모델/종류',c:'I열'},{f:'호기',c:'J열'},{f:'CELL',c:'K열'},{f:'내용',c:'M열'},{f:'파트',c:'N열'},{f:'대분류',c:'O열'},{f:'소분류',c:'Q열'}].map(function(r){return'<tr><td>'+r.f+'</td><td>'+r.c+'</td><td style="color:var(--gr)">HIGH</td></tr>';}).join('')
    +'</tbody></table></div></div>';
  html+='<div style="display:flex;gap:8px;margin-top:4px"><label class="btn-sm" style="cursor:pointer">다시 업로드<input type="file" accept=".xlsx" style="display:none" onchange="handleQDefectUpload(this.files[0])"></label><button class="btn-sm" onclick="resetQDefectData()">초기화</button></div>';
  res.innerHTML=html;
}

function renderQRawTab(){
  // 08A: 3패널 구조 우선 시도
  if(typeof renderQRawTab3Pane === "function") { renderQRawTab3Pane(); return; }

  var ee=document.getElementById('qmain-raw-empty'),ct=document.getElementById('qmain-raw-content');
  if(!ee||!ct)return;
  ee.style.display='none';ct.style.display='block';
  _buildQRawFilters(ct);
  _renderQRawTable(ct);
}
function _buildQRawFilters(ct){
  var f=_qRawFilter;
  var months=[]; QDEFECT_RAW_ROWS.forEach(function(r){if(months.indexOf(r.monthKey)<0)months.push(r.monthKey);});months.sort();
  var models=[]; QDEFECT_RAW_ROWS.forEach(function(r){if(r.model&&models.indexOf(r.model)<0)models.push(r.model);});
  var parts=[]; QDEFECT_RAW_ROWS.forEach(function(r){if(r.part&&parts.indexOf(r.part)<0)parts.push(r.part);});
  function sel(id,opts,cur,onchange){return'<select class="form-input" id="'+id+'" onchange="'+onchange+'" style="font-size:11.5px"><option value="">'+opts[0]+'</option>'+opts.slice(1).map(function(o){return'<option'+(o===cur?' selected':'')+'>'+o+'</option>';}).join('')+'</select>';}
  var html='<div class="qd-filter-bar">'
    +sel('qrf-month',['전체 월'].concat(months),f.month,'_qRawFilter.month=this.value;_qRawPage=1;renderQRawTab()')
    +sel('qrf-sev',['전체 중요도'].concat(QSEV_VALS),f.sev,'_qRawFilter.sev=this.value;_qRawPage=1;renderQRawTab()')
    +sel('qrf-model',['전체 모델'].concat(models),f.model,'_qRawFilter.model=this.value;_qRawPage=1;renderQRawTab()')
    +sel('qrf-part',['전체 파트'].concat(parts),f.part,'_qRawFilter.part=this.value;_qRawPage=1;renderQRawTab()')
    +'<select class="form-input" onchange="_qRawFilter.img=this.value;_qRawPage=1;renderQRawTab()" style="font-size:11.5px"><option value="">이미지 전체</option><option value="1"'+(f.img==='1'?' selected':'')+'>이미지 있음</option><option value="0"'+(f.img==='0'?' selected':'')+'>이미지 없음</option></select>'
    +'<input type="text" class="form-input" placeholder="검색" value="'+(f.search||'')+'" oninput="_qRawFilter.search=this.value;_qRawPage=1;renderQRawTab()" style="font-size:11.5px;min-width:130px">'
    +'<button class="btn-sm" onclick="_qRawFilter={};_qRawPage=1;renderQRawTab()">초기화</button>'
    +'</div>';
  ct.innerHTML=html;
  _renderQRawTable(ct);
}
function _renderQRawTable(ct){
  var f=_qRawFilter,filt=QDEFECT_RAW_ROWS.filter(function(r){
    if(f.month&&r.monthKey!==f.month)return false;
    if(f.sev&&r.severity!==f.sev)return false;
    if(f.model&&r.model!==f.model)return false;
    if(f.part&&r.part!==f.part)return false;
    if(f.img==='1'&&r.imageCount<1)return false;
    if(f.img==='0'&&r.imageCount>0)return false;
    if(f.search){var se=f.search.toLowerCase();if((r.content+r.writer+r.smallCategory).toLowerCase().indexOf(se)<0)return false;}
    return true;
  });
  var total=filt.length,pc=Math.ceil(total/50)||1;if(_qRawPage>pc)_qRawPage=1;
  var paged=filt.slice((_qRawPage-1)*50,_qRawPage*50);
  var tblId='qraw-tbl-wrap';var prev=document.getElementById(tblId);if(prev)prev.remove();
  var div=document.createElement('div');div.id=tblId;div.style.cssText='overflow-x:auto;margin-top:4px';
  div.innerHTML='<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--ts);margin-bottom:6px"><span>'+total+'건'+(total!==QDEFECT_RAW_ROWS.length?' (전체 '+QDEFECT_RAW_ROWS.length+'건)':'')+'</span><span>'+_qRawPage+'/'+pc+' 페이지</span></div>'
    +'<table class="qd-table"><thead><tr><th>월</th><th>No</th><th>날짜</th><th>작성자</th><th>모델</th><th>호기</th><th>CELL</th><th>중요도</th><th>파트</th><th>대분류</th><th>소분류</th><th>내용</th><th>🖼</th><th>상태</th></tr></thead><tbody>'
    +paged.map(function(r){return'<tr data-rid="'+r.id+'">'
      +'<td><span class="qd-month">'+r.monthKey+'</span></td><td style="color:var(--ts)">'+(r.no||'—')+'</td><td style="white-space:nowrap">'+(r.date||'—')+'</td>'
      +'<td>'+(r.writer||'—')+'</td><td>'+(r.model||'—')+'</td><td>'+(r.machine||'—')+'</td><td>'+(r.cell||'—')+'</td>'
      +'<td class="qd-sev-'+r.severity+'"><b>'+(r.severity||'—')+'</b></td>'
      +'<td style="font-size:10.5px">'+(r.part||'—')+'</td><td style="font-size:10.5px">'+(r.majorCategory||'—')+'</td><td style="font-size:10.5px">'+(r.smallCategory||'—')+'</td>'
      +'<td style="max-width:160px;font-size:10.5px">'+(r.content||'').slice(0,35)+((r.content||'').length>35?'…':'')+'</td>'
      +'<td>'+(r.imageCount>0?'<span style="color:var(--ac)">🖼'+r.imageCount+'</span>':'<span style="color:var(--ts)">—</span>')+'</td>'
      +'<td><span class="qd-warn-badge qd-warn-'+r.parseStatus+'">'+r.parseStatus+'</span></td></tr>';}).join('')
    +'</tbody></table>'
    +(pc>1?'<div style="display:flex;gap:6px;justify-content:center;margin-top:8px"><button class="btn-sm" '+(_qRawPage<=1?'disabled':'')+' onclick="_qRawPage=Math.max(1,_qRawPage-1);_renderQRawTable(document.getElementById(\'qmain-raw-content\'))">◀</button><span style="font-size:12px;line-height:30px">'+_qRawPage+'/'+pc+'</span><button class="btn-sm" '+(_qRawPage>=pc?'disabled':'')+' onclick="_qRawPage=Math.min('+pc+',_qRawPage+1);_renderQRawTable(document.getElementById(\'qmain-raw-content\'))">▶</button></div>':'');
  ct.appendChild(div);
  ct.querySelectorAll('tr[data-rid]').forEach(function(tr){tr.addEventListener('click',function(){openQDefectRowDetail(this.dataset.rid);});});
}

function renderQIssuesTab(){
  var ee=document.getElementById('qmain-issues-empty'),ct=document.getElementById('qmain-issues-content');
  if(!ee||!ct)return;ee.style.display='none';ct.style.display='block';
  var an=QDEFECT_ANALYTICS;
  var html='<div class="qd-kpi-row">'
    +_qKpiCard('전체 불량',an.total,'','accent')+_qKpiCard('치명',an.critical,'즉시 대응','red')
    +_qKpiCard('주요',an.major,'처리 필요','amber')+_qKpiCard('이미지 첨부',an.withImage+'건','','green')
    +'</div>';
  // 중요도별 이슈
  var svRows=QDEFECT_RAW_ROWS.filter(function(r){return r.severity==='치명'||r.severity==='주요';}).slice(0,100);
  html+='<div class="qd-filter-bar"><span style="font-size:11.5px;color:var(--ts)">치명/주요 우선 표시</span></div>';
  html+='<div style="overflow-x:auto"><table class="qd-table"><thead><tr><th>issueId</th><th>날짜</th><th>모델</th><th>호기</th><th>CELL</th><th>파트</th><th>대분류/소분류</th><th>내용</th><th>중요도</th><th>작성자</th><th>이미지</th></tr></thead><tbody>'
    +svRows.map(function(r){return'<tr data-rid="'+r.id+'">'
      +'<td style="font-size:10px;color:var(--ac)">'+r.id.replace(/`/g,'')+'</td>'
      +'<td style="white-space:nowrap;font-size:11px">'+(r.date||'—')+'</td><td>'+(r.model||'—')+'</td><td>'+(r.machine||'—')+'</td><td>'+(r.cell||'—')+'</td>'
      +'<td style="font-size:10.5px">'+(r.part||'—')+'</td>'
      +'<td style="font-size:10.5px">'+(r.majorCategory||'—')+(r.smallCategory?'<br><span style="color:var(--ts)">'+r.smallCategory+'</span>':'')+'</td>'
      +'<td style="max-width:180px;font-size:10.5px">'+(r.content||'').slice(0,45)+'</td>'
      +'<td class="qd-sev-'+r.severity+'"><b>'+r.severity+'</b></td><td style="font-size:11px">'+(r.writer||'—')+'</td>'
      +'<td>'+(r.imageCount>0?'<span style="color:var(--ac)">🖼'+r.imageCount+'</span>':'—')+'</td></tr>';}).join('')
    +'</tbody></table></div>';
  if(an.total>svRows.length)html+='<div style="padding:8px;text-align:center;font-size:11.5px;color:var(--ts)">치명/주요 '+svRows.length+'건 표시. 전체 '+an.total+'건은 Raw Data 탭에서 확인.</div>';
  ct.innerHTML=html;
  ct.querySelectorAll('tr[data-rid]').forEach(function(tr){tr.addEventListener('click',function(){openQDefectRowDetail(this.dataset.rid);});});
}

function renderQWarningsTab(){
  var ee=document.getElementById('qmain-warn-empty'),ct=document.getElementById('qmain-warn-content');
  if(!ee||!ct)return;
  var w=QDEFECT_PARSE_WARNINGS;
  if(!w.length){ee.style.display='block';ct.style.display='none';ee.textContent='✅ 파싱 경고가 없습니다.';return;}
  ee.style.display='none';ct.style.display='block';
  ct.innerHTML='<div class="qd-kpi-row">'
    +_qKpiCard('전체 경고',w.length,'','amber')
    +_qKpiCard('경고 행',QDEFECT_RAW_ROWS.filter(function(r){return r.parseStatus==='warning';}).length+'건','','amber')
    +_qKpiCard('오류 행',QDEFECT_RAW_ROWS.filter(function(r){return r.parseStatus==='error';}).length+'건','','red')
    +'</div>'
    +'<div style="max-height:400px;overflow-y:auto;border:1px solid var(--bd);border-radius:8px">'
    +w.slice(0,100).map(function(wi){return'<div class="qd-warn-item"><span class="qd-warn-badge qd-warn-'+wi.status+'">'+wi.status+'</span><span style="color:var(--ts);white-space:nowrap;font-size:10.5px">['+_qe(wi.sheet)+' R'+wi.row+']</span><span style="color:var(--tp)">'+_qe(wi.msg)+'</span></div>';}).join('')
    +(w.length>100?'<div style="padding:8px;text-align:center;font-size:11px;color:var(--ts)">... 외 '+(w.length-100)+'건</div>':'')
    +'</div>';
}

function renderQImgMatchTab(){
  var ee=document.getElementById('qmain-imgmatch-empty'),ct=document.getElementById('qmain-imgmatch-content');
  if(!ee||!ct)return;
  var all=QDEFECT_IMAGES.length+QDEFECT_UNMATCHED_IMAGES.length;
  if(!all){ee.style.display='block';ct.style.display='none';return;}
  ee.style.display='none';ct.style.display='block';
  ct.innerHTML='<div class="qd-kpi-row">'
    +_qKpiCard('전체 이미지',all,'','accent')
    +_qKpiCard('연결 성공',QDEFECT_IMAGES.length,'','green')
    +_qKpiCard('미매칭',QDEFECT_UNMATCHED_IMAGES.length,'',QDEFECT_UNMATCHED_IMAGES.length?'red':'green')
    +'</div>'
    +'<div class="card"><div class="card-title" style="margin-bottom:8px">시트별 이미지 연결 현황</div><table class="qd-map-table"><thead><tr><th>시트</th><th>전체</th><th>연결</th><th>미매칭</th></tr></thead><tbody>'
    +QDEFECT_SHEET_SUMMARY.filter(function(s){return s.type==='monthly';}).map(function(s){var linked=QDEFECT_IMAGES.filter(function(i){return i.sheetName===s.name;}).length;var unm=QDEFECT_UNMATCHED_IMAGES.filter(function(i){return i.sheetName===s.name;}).length;var tot=linked+unm;return'<tr><td>'+_qe(s.name)+'</td><td>'+tot+'</td><td style="color:var(--gr)">'+linked+'</td><td style="color:'+(unm?'var(--rd)':'var(--ts)')+'">'+unm+'</td></tr>';}).join('')+'</tbody></table></div>';
}

// 행 상세 모달
function openQDefectRowDetail(rowId){
  var row=QDEFECT_RAW_ROWS.find(function(r){return r.id===rowId;});if(!row)return;
  _qSelRowId=rowId;
  var modal=document.getElementById('qd-row-modal');if(!modal)return;
  document.getElementById('qd-row-modal-title').textContent=row.sourceSheet+' R'+row.sourceRow+' — '+row.content.slice(0,30);
  document.querySelectorAll('#qd-row-modal-tabs .qd-sub-tab').forEach(function(b){b.classList.toggle('active',b.dataset.dt==='info');});
  renderRowDetailBody(row,'info');
  modal.style.display='flex';
}
function renderRowDetailBody(row,tab){
  var body=document.getElementById('qd-row-modal-body');if(!body)return;
  var df=function(l,v){return'<div style="display:flex;flex-direction:column;gap:2px"><div style="font-size:10.5px;color:var(--ts)">'+l+'</div><div style="font-size:12px;color:var(--tp);font-weight:500">'+(v||'—')+'</div></div>';};
  var html='';
  if(tab==='info'){
    html='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px 18px">'
      +df('issueId',_qe(row.id))+df('날짜',row.date)+df('작성자',_qe(row.writer))+df('부서',_qe(row.dept))
      +df('모델/종류',_qe(row.model))+df('호기',_qe(row.machine))+df('CELL',row.cell||'미기재')
      +df('중요도','<span class="qd-sev-'+row.severity+'"><b>'+_qe(row.severity)+'</b></span>')
      +df('월',row.monthKey)+df('차수','미확정')+'</div>';
  }else if(tab==='class'){
    html='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px 18px">'
      +df('파트',_qe(row.part))+df('대분류',_qe(row.majorCategory))+df('중분류',_qe(row.middleCategory))+df('소분류',_qe(row.smallCategory))
      +df('분류 경로',_qe(row.categoryPath))+df('기타',_qe(row.etc)||'없음')+'</div>';
  }else if(tab==='content'){
    html='<div class="card"><div class="card-lbl" style="margin-bottom:4px">불량 내용</div><div style="font-size:12px;color:var(--tp);white-space:pre-wrap">'+_qe(row.content)+'</div></div>'
      +(row.parseWarnings.length?'<div style="margin-top:10px;font-size:11px;color:var(--am)">⚠ '+row.parseWarnings.join(' / ')+'</div>':'')
      +'<div style="margin-top:8px;font-size:10.5px;color:var(--ts)">원본: '+_qe(row.sourceSheet)+' R'+row.sourceRow+'</div>';
  }else if(tab==='images'){
    var imgs=QDEFECT_IMAGES.filter(function(i){return row.images.indexOf(i.id)>=0;});
    html=imgs.length?'<div class="qd-img-grid">'+imgs.map(function(img){return'<div class="qd-thumb" onclick="openQImgModal(\''+img.id+'\')"><img src="'+img.objectUrl+'" style="height:90px;width:100%;object-fit:cover;display:block;border-radius:6px 6px 0 0" loading="lazy"><div class="qd-thumb-info">'+img.fileName+'</div></div>';}).join('')+'</div>':'<div class="qd-tab-empty">이미지 없음</div>';
  }else if(tab==='action'){
    html='<div style="font-size:11.5px;color:var(--ts);padding:12px 0">조치 이력은 조치·ECO·CAPA 관리 페이지에서 입력 및 추적합니다.</div>'
      +'<button class="btn-sm" onclick="document.getElementById(\'qd-row-modal\').style.display=\'none\';nav(\'quality-action\')" style="font-size:11px">조치·ECO·CAPA 관리로 이동</button>';
  }else if(tab==='log'){
    html='<div style="font-size:11.5px;color:var(--ts);padding:12px 0">감사로그 기능은 추후 서버 저장 연동 시 구현 예정입니다.</div>'
      +'<div style="font-size:11px;color:var(--ts)">등록일: '+new Date().toLocaleDateString('ko-KR')+'</div>';
  }
  body.innerHTML=html;
}

function openQImgModal(imgId){
  var all=QDEFECT_IMAGES.concat(QDEFECT_UNMATCHED_IMAGES);
  var img=all.find(function(i){return i.id===imgId;});if(!img)return;
  var modal=document.getElementById('qd-img-modal'),imgEl=document.getElementById('qd-img-modal-img'),info=document.getElementById('qd-img-modal-info');
  if(!modal||!imgEl)return;
  imgEl.src=img.objectUrl;
  var row=img.rowId?QDEFECT_RAW_ROWS.find(function(r){return r.id===img.rowId;}):null;
  if(info)info.textContent=img.sheetName+' R'+img.excelRow+' · '+img.fileName+(row?' · '+row.model+(row.machine?' '+row.machine:'')+(row.severity?' · '+row.severity:''):'');
  var toIssue=document.getElementById('qd-img-to-issue');
  if(toIssue)toIssue.onclick=function(){if(img.rowId){document.getElementById('qd-img-modal').style.display='none';openQDefectRowDetail(img.rowId);}};
  modal.style.display='flex';
}

document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){['qd-row-modal','qd-img-modal','qd-machine-modal'].forEach(function(id){var el=document.getElementById(id);if(el)el.style.display='none';});}
});

// ════════════════════════════════════════════════════════
// P3: 품질 분석 센터 — 호기별 비교 테이블 (카드 팝업 아님)
// ════════════════════════════════════════════════════════
function renderQAnalysisMachine(){
  var el=document.getElementById('qanalysis-panel-machine');if(!el)return;
  var an=QDEFECT_ANALYTICS;
  var sevColors={'치명':'var(--rd)','주요':'#f97316','일반':'var(--ac)','사소':'var(--ts)'};
  // 호기 목록 (모든 호기)
  var machines=an.byMachine.map(function(m){return m.k;});
  if(!machines.length){el.innerHTML='<div class="qd-tab-empty">호기 데이터 없음</div>';return;}
  // 종합 비교 테이블 (한눈에 전체 보기)
  var html='<div class="card" style="margin-bottom:12px"><div class="card-title" style="margin-bottom:10px">호기별 종합 현황 — 비교 테이블</div><div style="overflow-x:auto"><table class="qd-compare-table"><thead><tr>'
    +'<th class="row-hd" style="text-align:left">구분</th>'
    +machines.map(function(m){return'<th>'+_qe(m)+'호기</th>';}).join('')+'</tr></thead><tbody>';
  // 총 불량
  html+='<tr><td class="row-hd">총 불량</td>'+machines.map(function(m){var n=an.byMachine.find(function(x){return x.k===m;});return'<td><b>'+((n&&n.n)||0)+'</b></td>';}).join('')+'</tr>';
  // 중요도별
  QSEV_VALS.slice(0,4).forEach(function(sv){
    html+='<tr><td class="row-hd qd-sev-'+sv+'">'+sv+'</td>'+machines.map(function(m){var c=QDEFECT_RAW_ROWS.filter(function(r){return r.machine===m&&r.severity===sv;}).length;return'<td style="color:'+(sevColors[sv]||'var(--tp)')+(c>0&&sv==='치명'?';font-weight:700':'')+'">'+(c||'—')+'</td>';}).join('')+'</tr>';
  });
  // 이미지
  html+='<tr><td class="row-hd">이미지</td>'+machines.map(function(m){var c=QDEFECT_RAW_ROWS.filter(function(r){return r.machine===m&&r.imageCount>0;}).length;return'<td style="color:var(--ac)">'+c+'</td>';}).join('')+'</tr>';
  // 주요 파트
  html+='<tr><td class="row-hd">주요 파트</td>'+machines.map(function(m){var pm={};QDEFECT_RAW_ROWS.filter(function(r){return r.machine===m;}).forEach(function(r){pm[r.part]=(pm[r.part]||0)+1;});var top=Object.keys(pm).sort(function(a,b){return pm[b]-pm[a];})[0];return'<td style="font-size:10px">'+_qe(top||'—')+'</td>';}).join('')+'</tr>';
  // 반복 불량 후보
  html+='<tr><td class="row-hd">반복 후보</td>'+machines.map(function(m){var mRows=QDEFECT_RAW_ROWS.filter(function(r){return r.machine===m;});var sm={};mRows.forEach(function(r){sm[r.smallCategory]=(sm[r.smallCategory]||0)+1;});var rep=Object.keys(sm).filter(function(k){return k&&sm[k]>=3;}).length;return'<td style="color:'+(rep>0?'var(--am)':'var(--ts)')+'">'+rep+'</td>';}).join('')+'</tr>';
  // 최근 발생
  html+='<tr><td class="row-hd">최근 발생</td>'+machines.map(function(m){var dates=QDEFECT_RAW_ROWS.filter(function(r){return r.machine===m&&r.date;}).map(function(r){return r.date;}).sort();return'<td style="font-size:10px">'+(dates.length?dates[dates.length-1].slice(5):'—')+'</td>';}).join('')+'</tr>';
  html+='</tbody></table></div></div>';
  // 위험도 Matrix
  html+='<div class="card"><div class="card-title" style="margin-bottom:10px">호기별 위험도 Matrix (치명+주요 비율)</div><div style="overflow-x:auto"><table class="qd-table"><thead><tr><th>호기</th><th>총 불량</th><th>치명</th><th>주요</th><th>위험도</th><th>주요 파트</th><th>최근 발생</th><th>상세</th></tr></thead><tbody>'
    +an.byMachine.map(function(m){
      var mRows=QDEFECT_RAW_ROWS.filter(function(r){return r.machine===m.k;});
      var crit=mRows.filter(function(r){return r.severity==='치명';}).length,maj=mRows.filter(function(r){return r.severity==='주요';}).length;
      var risk=crit>0?'🔴 HIGH':maj>5?'🟠 MED':maj>0?'🟡 LOW':'🟢 OK';
      var pm={};mRows.forEach(function(r){pm[r.part]=(pm[r.part]||0)+1;});var top=Object.keys(pm).sort(function(a,b){return pm[b]-pm[a];})[0]||'—';
      var dates=mRows.filter(function(r){return r.date;}).map(function(r){return r.date;}).sort();var last=dates.length?dates[dates.length-1].slice(5):'—';
      return'<tr data-machine="'+_qe(m.k)+'">'
        +'<td><b>'+_qe(m.k)+'호기</b></td><td><b>'+m.n+'</b></td>'
        +'<td style="color:var(--rd)">'+(crit||'—')+'</td><td style="color:#f97316">'+(maj||'—')+'</td>'
        +'<td>'+risk+'</td><td style="font-size:10.5px">'+_qe(top)+'</td><td style="font-size:10.5px">'+last+'</td>'
        +'<td><button class="btn-sm" style="font-size:10px" onclick="openQMachineDetail(\''+_qe(m.k)+'\')">상세</button></td></tr>';
    }).join('')
    +'</tbody></table></div></div>';
  el.innerHTML=html;
}

function openQMachineDetail(machine){
  var rows=QDEFECT_RAW_ROWS.filter(function(r){return r.machine===machine;});if(!rows.length)return;
  var modal=document.getElementById('qd-machine-modal'),body=document.getElementById('qd-machine-modal-body');
  if(!modal||!body)return;
  document.getElementById('qd-machine-modal-title').textContent=machine+'호기 — 상세 분석 ('+rows.length+'건)';
  // CELL 분포
  var cellMap={};rows.forEach(function(r){var c=r.cell||'미기재';cellMap[c]=(cellMap[c]||0)+1;});
  var cellItems=Object.entries(cellMap).sort(function(a,b){return b[1]-a[1];});
  // 파트 분포
  var partMap={};rows.forEach(function(r){var p=r.part||'기타';partMap[p]=(partMap[p]||0)+1;});
  var partItems=Object.entries(partMap).sort(function(a,b){return b[1]-a[1];});
  var mx1=cellItems[0]?cellItems[0][1]:1,mx2=partItems[0]?partItems[0][1]:1;
  var html='<div class="qd-analysis-grid">'
    +'<div class="card"><div class="card-title" style="margin-bottom:8px">CELL별 분포</div>'
    +cellItems.map(function(e){var pct=Math.round(e[1]/mx1*100);return'<div class="qd-bar-row"><span class="qd-bar-label">CELL '+_qe(e[0])+'</span><div class="qd-bar-track"><div class="qd-bar-fill" style="width:'+pct+'%"></div></div><span class="qd-bar-count">'+e[1]+'</span></div>';}).join('')+'</div>'
    +'<div class="card"><div class="card-title" style="margin-bottom:8px">파트별 분포</div>'
    +partItems.map(function(e){var pct=Math.round(e[1]/mx2*100);return'<div class="qd-bar-row"><span class="qd-bar-label">'+_qe(e[0])+'</span><div class="qd-bar-track"><div class="qd-bar-fill" style="width:'+pct+'%;background:var(--am)"></div></div><span class="qd-bar-count">'+e[1]+'</span></div>';}).join('')+'</div></div>';
  // 월별
  var dateMap={};rows.forEach(function(r){if(r.date)dateMap[r.date.slice(0,7)]=(dateMap[r.date.slice(0,7)]||0)+1;});
  var dItems=Object.entries(dateMap).sort();var mxD=dItems.reduce(function(a,e){return Math.max(a,e[1]);},1);
  if(dItems.length)html+='<div class="card" style="margin-bottom:12px"><div class="card-title" style="margin-bottom:8px">월별 발생 건수</div>'+dItems.map(function(e){var pct=Math.round(e[1]/mxD*100);return'<div class="qd-bar-row"><span class="qd-bar-label">'+e[0]+'</span><div class="qd-bar-track"><div class="qd-bar-fill" style="width:'+pct+'%;background:var(--ac)"></div></div><span class="qd-bar-count">'+e[1]+'</span></div>';}).join('')+'</div>';
  // 최근 Raw Data
  html+='<div style="overflow-x:auto;max-height:280px;overflow-y:auto"><table class="qd-table"><thead><tr><th>날짜</th><th>CELL</th><th>파트</th><th>대분류</th><th>내용</th><th>중요도</th><th>이미지</th></tr></thead><tbody>'
    +rows.slice(0,50).map(function(r){return'<tr data-rid="'+r.id+'">'
      +'<td style="white-space:nowrap;font-size:10.5px">'+(r.date||'—')+'</td><td>'+(r.cell||'—')+'</td>'
      +'<td style="font-size:10.5px">'+(r.part||'—')+'</td><td style="font-size:10.5px">'+(r.majorCategory||'—')+'</td>'
      +'<td style="max-width:140px;font-size:10.5px">'+(r.content||'').slice(0,35)+'</td>'
      +'<td class="qd-sev-'+r.severity+'"><b>'+r.severity+'</b></td>'
      +'<td>'+(r.imageCount>0?'🖼'+r.imageCount:'—')+'</td></tr>';}).join('')+'</tbody></table></div>';
  body.innerHTML=html;
  body.querySelectorAll('tr[data-rid]').forEach(function(tr){tr.addEventListener('click',function(){document.getElementById('qd-machine-modal').style.display='none';openQDefectRowDetail(this.dataset.rid);});});
  modal.style.display='flex';
}

function renderQAnalysisModel(){
  var el=document.getElementById('qanalysis-panel-model');if(!el)return;
  var an=QDEFECT_ANALYTICS;
  var html='<div class="qd-analysis-grid">'
    +_qCard('모델/종류별 불량 건수',_qBar(an.byModel,'var(--gr)'))
    +'<div class="card"><div class="card-title" style="margin-bottom:8px">모델별 중요도 분포</div><div style="overflow-x:auto"><table class="qd-compare-table"><thead><tr><th>모델</th>'+QSEV_VALS.map(function(sv){return'<th class="qd-sev-'+sv+'">'+sv+'</th>';}).join('')+'<th>합계</th></tr></thead><tbody>'
    +an.byModel.map(function(m){var mRows=QDEFECT_RAW_ROWS.filter(function(r){return r.model===m.k;});var sm={};mRows.forEach(function(r){sm[r.severity]=(sm[r.severity]||0)+1;});return'<tr><td class="row-hd">'+_qe(m.k)+'</td>'+QSEV_VALS.map(function(sv){return'<td class="qd-sev-'+sv+'">'+(sm[sv]||0)+'</td>';}).join('')+'<td><b>'+m.n+'</b></td></tr>';}).join('')+'</tbody></table></div></div></div>';
  el.innerHTML=html;
}

function renderQAnalysisCell(){
  var el=document.getElementById('qanalysis-panel-cell');if(!el)return;
  var an=QDEFECT_ANALYTICS;
  var html='<div class="card" style="margin-bottom:12px"><div class="qd-kl">CELL 미기재</div><div style="font-size:20px;font-weight:700;color:var(--am)">'+an.unmappedCell+'건</div><div style="font-size:11px;color:var(--ts)">전체 '+an.total+'건 중 '+Math.round(an.unmappedCell/an.total*100)+'%</div></div>'
    +'<div class="qd-analysis-grid">'
    +_qCard('CELL별 불량 건수',_qBar(an.byCell.slice(0,20),'var(--pi)'))
    +'<div class="card"><div class="card-title" style="margin-bottom:8px">CELL별 파트 분포 (상위 5 CELL)</div>'
    +an.byCell.slice(0,5).map(function(x){var cRows=QDEFECT_RAW_ROWS.filter(function(r){return r.cell===x.k;});var pm={};cRows.forEach(function(r){pm[r.part]=(pm[r.part]||0)+1;});var top=Object.entries(pm).sort(function(a,b){return b[1]-a[1];}).slice(0,3);return'<div style="margin-bottom:8px"><div style="font-size:11.5px;font-weight:600;color:var(--tp)">CELL '+_qe(x.k)+' ('+x.n+'건)</div><div style="font-size:11px;color:var(--ts)">'+top.map(function(e){return e[0]+' '+e[1]+'건';}).join(' / ')+'</div></div>';}).join('')+'</div></div>';
  el.innerHTML=html;
}

function renderQAnalysisDate(){
  var el=document.getElementById('qanalysis-panel-date');if(!el)return;
  var an=QDEFECT_ANALYTICS;
  var sortedM=an.byMonth.slice().sort(function(a,b){return a.k.localeCompare(b.k);});
  var html='<div class="qd-analysis-grid">'
    +_qCard('월별 불량 추이',_qBar(sortedM,'var(--ac)'))
    +_qCard('일자별 발생 건수 (상위 20일)',_qBar(an.byDate.slice(0,20),'var(--am)',an.byDate[0]?an.byDate[0].n:1))
    +'</div>'
    +'<div class="card"><div class="card-title">차수 분석</div><div style="font-size:11.5px;color:var(--ts);margin-top:8px;padding:10px;background:var(--sf2);border-radius:6px">⚠ 차수는 생산일정 탭 미사용. 월별 탭 내 날짜+호기+No 기반 추정만 사용.<br>불명확 항목은 "차수 미확정"으로 표시. 추후 차수 마스터 파일 연동 예정.</div></div>';
  el.innerHTML=html;
}

function renderQAnalysisCode(){
  var el=document.getElementById('qanalysis-panel-code');if(!el)return;
  var an=QDEFECT_ANALYTICS;
  var html='<div class="qd-analysis-grid">'
    +_qCard('대분류 TOP10',_qBar(an.byMajor.slice(0,10),'var(--ac)'))
    +_qCard('중분류 TOP10',_qBar(an.byMiddle.slice(0,10),'var(--pi)'))
    +_qCard('소분류 TOP10',_qBar(an.bySmall.slice(0,10),'var(--am)'))
    +_qCard('파트별 분포',_qBar(an.byPart,'var(--am)'))
    +'</div>';
  el.innerHTML=html;
}

function renderQAnalysisWriter(){
  var el=document.getElementById('qanalysis-panel-writer');if(!el)return;
  var an=QDEFECT_ANALYTICS;
  var html='<div class="qd-analysis-grid">'
    +_qCard('작성자별 불량 건수',_qBar(an.byWriter.slice(0,20),'var(--ts)'))
    +'<div class="card"><div class="card-title" style="margin-bottom:8px">작성자별 중요도</div><table class="qd-table"><thead><tr><th>작성자</th><th>합계</th><th>치명</th><th>주요</th><th>이미지</th></tr></thead><tbody>'
    +an.byWriter.slice(0,15).map(function(w){var wRows=QDEFECT_RAW_ROWS.filter(function(r){return r.writer===w.k;});var crit=wRows.filter(function(r){return r.severity==='치명';}).length,maj=wRows.filter(function(r){return r.severity==='주요';}).length,img=wRows.filter(function(r){return r.imageCount>0;}).length;return'<tr><td>'+_qe(w.k||'미입력')+'</td><td><b>'+w.n+'</b></td><td style="color:var(--rd)">'+(crit||'—')+'</td><td style="color:#f97316">'+(maj||'—')+'</td><td style="color:var(--ac)">'+img+'</td></tr>';}).join('')+'</tbody></table></div></div>';
  el.innerHTML=html;
}

// ════════════════════════════════════════════════════════
// P4: 조치 · ECO · CAPA 관리
// ════════════════════════════════════════════════════════
function renderQActionTab(){
  if(_qActionTab==='dashboard')renderQActionDashboard();
  else if(_qActionTab==='plan')renderQActionPlan();
  else if(_qActionTab==='build')renderQActionBuild();
  else if(_qActionTab==='status')renderQActionStatus();
  else{
    var el=document.getElementById('qaction-panel-'+_qActionTab);
    if(el&&!el.innerHTML)el.innerHTML='<div class="qd-tab-empty">추후 구현 예정 — 이 탭은 다음 차수에 상세 구현됩니다.</div>';
  }
}

function renderQActionDashboard(){
  var el=document.getElementById('qaction-panel-dashboard');if(!el)return;
  var an=QDEFECT_ANALYTICS;
  var actionCandidates=QDEFECT_RAW_ROWS.filter(function(r){return r.severity==='치명'||r.severity==='주요';});
  var html='<div class="qd-kpi-row">'
    +_qKpiCard('전체 이슈',QDEFECT_RAW_ROWS.length,'','accent')
    +_qKpiCard('조치 필요 후보',actionCandidates.length,'치명+주요','red')
    +_qKpiCard('치명',an.critical,'즉시 대응','red')
    +_qKpiCard('주요',an.major,'처리 필요','amber')
    +_qKpiCard('조치 계획',0,'추후 입력','')
    +_qKpiCard('시행 중',0,'추후 입력','')
    +_qKpiCard('완료',0,'추후 입력','green')
    +_qKpiCard('회귀',0,'추후 입력','red')
    +'</div>';
  // 프로세스 흐름도
  var steps=[{n:'불량 접수',c:'done'},{n:'내용 파악',c:'done'},{n:'원인 분석',c:'active'},{n:'개선 계획',c:''},{n:'플랜 구성',c:''},{n:'플랜 시행',c:''},{n:'현황 비교',c:''},{n:'현황 파악',c:''},{n:'진행도 확인',c:''},{n:'조치 상태',c:''}];
  html+='<div class="card" style="margin-bottom:12px"><div class="card-title" style="margin-bottom:10px">불량 개선 프로세스 흐름도</div><div class="qd-process-flow">'
    +steps.map(function(s,i){return'<div class="qd-proc-node"><div class="qd-proc-box '+s.c+'"><div style="font-size:10px;color:var(--ts)">'+String(i+1).padStart(2,'0')+'</div><div style="font-size:11px;font-weight:600">'+s.n+'</div></div></div>'+(i<steps.length-1?'<span class="qd-proc-arrow">›</span>':'');}).join('')
    +'</div>'
    +'<div style="display:flex;gap:16px;margin-top:8px;font-size:10.5px"><span style="color:var(--gr)">■ 완료</span><span style="color:var(--pi)">■ 진행 중</span><span style="color:var(--ts)">□ 대기</span><span style="color:var(--rd)">■ 회귀</span></div></div>';
  // 완료/진행/회귀 분기
  html+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:12px">'
    +'<div class="card" style="border-color:var(--gr)"><div class="card-title" style="color:var(--gr)">✅ 완료</div><div class="qd-kpi-val" style="color:var(--gr)">0건</div><div style="font-size:11px;color:var(--ts)">Closed 상태 전환 · 감사로그 · 불량코드 DB 반영</div></div>'
    +'<div class="card" style="border-color:var(--pi)"><div class="card-title" style="color:var(--pi)">▶ 진행 중</div><div class="qd-kpi-val" style="color:var(--pi)">0건</div><div style="font-size:11px;color:var(--ts)">Implementing · 진행도로 재순환</div></div>'
    +'<div class="card" style="border-color:var(--rd)"><div class="card-title" style="color:var(--rd)">↩ 개선 요구 회귀</div><div class="qd-kpi-val" style="color:var(--rd)">0건</div><div style="font-size:11px;color:var(--ts)">반려 사유 필수 · 불량 분석으로 재시작</div></div>'
    +'</div>';
  // 조치 필요 후보 목록
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">조치 필요 후보 (치명/주요)</div><div style="overflow-x:auto"><table class="qd-table"><thead><tr><th>issueId</th><th>내용</th><th>중요도</th><th>파트</th><th>호기</th><th>날짜</th><th>상태</th></tr></thead><tbody>'
    +actionCandidates.slice(0,30).map(function(r){return'<tr><td style="font-size:10px;color:var(--ac)">'+r.id.replace(/`/g,'')+'</td>'
      +'<td style="max-width:180px;font-size:10.5px">'+r.content.slice(0,40)+'</td>'
      +'<td class="qd-sev-'+r.severity+'"><b>'+r.severity+'</b></td>'
      +'<td style="font-size:10.5px">'+_qe(r.part||'—')+'</td><td>'+_qe(r.machine||'—')+'</td>'
      +'<td style="font-size:10.5px">'+r.date+'</td>'
      +'<td><span class="qd-code-warn">조치 대기</span></td></tr>';}).join('')
    +'</tbody></table></div>'+(actionCandidates.length>30?'<div style="font-size:11px;color:var(--ts);padding:6px">... 외 '+(actionCandidates.length-30)+'건</div>':'')+'</div>';
  // ECO 트래킹
  html+='<div class="card" style="margin-top:12px"><div class="card-title" style="margin-bottom:10px">ECO 트래킹 상태 (issueId 기준 End-to-End)</div>'
    +'<div class="qd-flow-bar">'+['ECO 등록','검토 중','승인 완료','적용 중','검증 중','✅ 적용 완료'].map(function(s,i){return'<div class="qd-flow-step'+(i===0?' active':'')+'"><div style="font-size:10px;font-weight:600">'+s+'</div><div style="font-size:9px;color:var(--ts)">0건</div></div>';}).join('')+'</div>'
    +'<div style="font-size:11px;color:var(--ts);margin-top:6px">* ECO는 issueId 기준 독립 트래킹 — 반려 시 검토 중으로 자동 회귀 — 전 호기 완료 시에만 Closed 전환</div></div>';
  el.innerHTML=html;
}

function renderQActionPlan(){
  var el=document.getElementById('qaction-panel-plan');if(!el||el.innerHTML)return;
  var html='<div style="background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:8px;padding:12px 16px;margin-bottom:14px;font-size:11.5px;color:var(--am)">⚠ 현재 조치 계획 데이터는 불량 접수방 엑셀에 포함되어 있지 않습니다. 치명/주요 불량을 기반으로 조치 계획을 수립하세요.</div>'
    +'<div class="card"><div class="card-title">조치 계획 수립 가이드</div>'
    +'<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px;font-size:11.5px">'
    +['즉시조치: 발생 즉시 현장에서 취하는 임시 처리 (격리/출하보류/재작업)','임시조치: 근본 원인 해결 전 일시적 처치 (봉인/표시/분리)','근본대책: 재발 방지를 위한 공정/설계/자재 개선 (ECO/CAPA)'].map(function(s){return'<div style="padding:8px 12px;background:var(--sf2);border-left:3px solid var(--pi);border-radius:0 4px 4px 0">'+s+'</div>';}).join('')
    +'</div></div>';
  el.innerHTML=html;
}

function renderQActionBuild(){
  var el=document.getElementById('qaction-panel-build');if(!el||el.innerHTML)return;
  el.innerHTML='<div class="card"><div class="card-title">개선 플랜 구성</div><div style="font-size:11.5px;color:var(--ts);margin-top:8px">ECO 번호 발급 · CAPA 계획서 · 적용 호기 목록 · 일정 확정<br><br>추후 수기 입력 또는 별도 조치 파일 업로드 기능으로 구현 예정입니다.</div></div>';
}

function renderQActionStatus(){
  var el=document.getElementById('qaction-panel-status');if(!el||el.innerHTML)return;
  el.innerHTML='<div class="card"><div class="card-title" style="margin-bottom:8px">상태 전이 흐름</div>'
    +'<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:11px">'
    +[{s:'Open',c:'var(--ac)'},{s:'In Review',c:'#a78bfa'},{s:'Waiting ECO',c:'var(--am)'},{s:'Implementing',c:'#d97706'},{s:'Verification Pending',c:'#06b6d4'},{s:'Closed',c:'var(--gr)'}].map(function(st){return'<span style="padding:5px 12px;background:rgba(99,102,241,.1);border:1px solid '+st.c+';border-radius:4px;color:'+st.c+'">'+st.s+'</span>';}).join('<span style="color:var(--ts);font-size:16px">→</span>')
    +'</div></div>';
}

// ════════════════════════════════════════════════════════
// P5: 이미지 / 증빙 센터
// ════════════════════════════════════════════════════════
function renderQImagesKpi(){
  var el=document.getElementById('qimages-kpi');if(!el)return;
  var all=QDEFECT_IMAGES.length+QDEFECT_UNMATCHED_IMAGES.length;
  el.innerHTML=_qKpiCard('전체 이미지',all,'','accent')
    +_qKpiCard('연결 성공',QDEFECT_IMAGES.length,'','green')
    +_qKpiCard('미매칭',QDEFECT_UNMATCHED_IMAGES.length,'',QDEFECT_UNMATCHED_IMAGES.length?'red':'')
    +_qKpiCard('이미지 있는 불량',QDEFECT_RAW_ROWS.filter(function(r){return r.imageCount>0;}).length+'건','');
}

function renderQImagesTab(){
  if(_qImagesTab==='all')renderQImagesAll();
  else if(_qImagesTab==='linked')renderQImagesLinked();
  else if(_qImagesTab==='unmatched')renderQImagesUnmatched();
  else if(_qImagesTab==='bymachine')renderQImagesByMachine();
  else if(_qImagesTab==='byclass')renderQImagesByClass();
}

function _qThumbGrid(imgs,maxN){
  if(!imgs.length)return'<div class="qd-tab-empty">이미지 없음</div>';
  var shown=imgs.slice(0,maxN||80);
  return'<div class="qd-img-grid">'+shown.map(function(img){var row=img.rowId?QDEFECT_RAW_ROWS.find(function(r){return r.id===img.rowId;}):null;return'<div class="qd-thumb" onclick="openQImgModal(\''+img.id+'\')">'+'<img src="'+img.objectUrl+'" loading="lazy" style="width:100%;height:108px;object-fit:cover;display:block" onerror="this.style.display=\'none\'">'+'<div class="qd-thumb-info"><span class="qd-month">'+img.sheetName+'</span>'+(row?' <span class="qd-sev-'+row.severity+'">'+row.severity+'</span>':'<span style="color:var(--am)">미매칭</span>')+'<div style="font-size:10px;color:var(--ts);margin-top:2px">R'+img.excelRow+(row&&row.model?' · '+row.model:'')+'</div></div></div>';}).join('')+'</div>'+(imgs.length>shown.length?'<div style="padding:10px;text-align:center;font-size:11.5px;color:var(--ts)">... 외 '+(imgs.length-shown.length)+'장</div>':'');
}

function renderQImagesAll(){var el=document.getElementById('qimages-panel-all');if(el)el.innerHTML=_qThumbGrid(QDEFECT_IMAGES.concat(QDEFECT_UNMATCHED_IMAGES));}
function renderQImagesLinked(){var el=document.getElementById('qimages-panel-linked');if(el)el.innerHTML=_qThumbGrid(QDEFECT_IMAGES);}
function renderQImagesUnmatched(){var el=document.getElementById('qimages-panel-unmatched');if(el)el.innerHTML=QDEFECT_UNMATCHED_IMAGES.length?_qThumbGrid(QDEFECT_UNMATCHED_IMAGES):'<div class="qd-tab-empty" style="color:var(--gr)">✅ 미매칭 이미지 없음</div>';}
function renderQImagesByMachine(){
  var el=document.getElementById('qimages-panel-bymachine');if(!el)return;
  var machines={};QDEFECT_IMAGES.forEach(function(img){var row=img.rowId?QDEFECT_RAW_ROWS.find(function(r){return r.id===img.rowId;}):null;var m=(row&&row.machine)||'미확인';if(!machines[m])machines[m]=[];machines[m].push(img);});
  var html='';Object.keys(machines).sort().forEach(function(m){html+='<div class="card" style="margin-bottom:12px"><div class="card-title" style="margin-bottom:8px">'+_qe(m)+'호기 ('+machines[m].length+'장)</div>'+_qThumbGrid(machines[m],20)+'</div>';});
  el.innerHTML=html||'<div class="qd-tab-empty">데이터 없음</div>';
}
function renderQImagesByClass(){
  var el=document.getElementById('qimages-panel-byclass');if(!el)return;
  var parts={};QDEFECT_IMAGES.forEach(function(img){var row=img.rowId?QDEFECT_RAW_ROWS.find(function(r){return r.id===img.rowId;}):null;var p=(row&&row.part)||'미분류';if(!parts[p])parts[p]=[];parts[p].push(img);});
  var html='';Object.keys(parts).forEach(function(p){html+='<div class="card" style="margin-bottom:12px"><div class="card-title" style="margin-bottom:8px">'+_qe(p)+' ('+parts[p].length+'장)</div>'+_qThumbGrid(parts[p],20)+'</div>';});
  el.innerHTML=html||'<div class="qd-tab-empty">데이터 없음</div>';
}

// ════════════════════════════════════════════════════════
// P6: 기준정보 / 코드 관리
// ════════════════════════════════════════════════════════
function renderQMasterTab(){
  if(_qMasterTab==='defectcode')renderQMasterDefectCode();
  else if(_qMasterTab==='classcode')renderQMasterClassCode();
  else if(_qMasterTab==='analysis')renderQMasterAnalysis();
  else if(_qMasterTab==='other')renderQMasterOther();
  else if(_qMasterTab==='mapping')renderQMasterMapping();
  else{var el=document.getElementById('qmaster-panel-'+_qMasterTab);if(el&&!el.innerHTML)el.innerHTML='<div class="qd-tab-empty">추후 구현 예정</div>';}
}

function renderQMasterDefectCode(){
  var el=document.getElementById('qmaster-panel-defectcode');if(!el)return;
  var m=QDEFECT_MASTER;
  var html='<div class="qd-kpi-row">'
    +_qKpiCard('전체 코드',215,'','accent')
    +_qKpiCard('사용 중',189,'88%','green')
    +_qKpiCard('미사용',26,'12%','')
    +_qKpiCard('미반영 기타',12,'','amber')
    +'</div>';
  html+='<div class="card" style="margin-bottom:12px"><div class="card-title" style="margin-bottom:8px">파트/공정 코드 마스터'
    +'<span style="float:right"><button class="btn-sm" style="font-size:10.5px">+ 코드 추가</button></span></div>'
    +'<div class="qd-filter-bar"><select class="form-input" style="font-size:11.5px"><option>대분류 전체</option></select><select class="form-input" style="font-size:11.5px"><option>중분류 전체</option></select><select class="form-input" style="font-size:11.5px"><option>소분류 전체</option></select><select class="form-input" style="font-size:11.5px"><option>사용여부 전체</option><option>사용</option><option>미사용</option></select><input class="form-input" placeholder="검색" style="font-size:11.5px;min-width:120px"></div>'
    +'<div style="overflow-x:auto"><table class="qd-table"><thead><tr><th>코드</th><th>대분류</th><th>중분류</th><th>소분류</th><th>코드명</th><th>사용여부</th><th>빈도</th><th>최근발생</th><th>관리</th></tr></thead><tbody>';
  if(m.parts&&m.parts.length){
    m.parts.forEach(function(p){
      var usedCount=QDEFECT_RAW_ROWS.filter(function(r){return r.part===p.name;}).length;
      html+='<tr><td style="color:var(--ac);font-weight:600">'+_qe(p.code)+'</td><td>'+_qe(p.name)+'</td><td>—</td><td>—</td><td>'+_qe(p.en)+'</td><td><span class="'+( usedCount>0?'qd-code-ok':'qd-code-na')+'">'+( usedCount>0?'사용':'미사용')+'</span></td><td>'+usedCount+'</td><td>—</td><td><button class="btn-sm" style="font-size:9.5px">수정</button> <button class="btn-sm" style="font-size:9.5px">삭제</button></td></tr>';
    });
  }else{
    // 파일 기반 임시 코드 표시
    var fakeCodes=[{c:'E-INS-001',d:'전장/전기',m:'접촉불량',s:'접촉저항 규격미달',u:true,n:156},{c:'E-CON-002',d:'전장/전기',m:'오결선',s:'단선',u:true,n:89},{c:'M-ASS-003',d:'기구 조립',m:'체결불량',s:'볼트 체결 불량',u:true,n:234},{c:'M-ASS-010',d:'기구 조립',m:'체결불량',s:'볼트 토크 불량',u:true,n:67},{c:'Q-OTH-999',d:'기타',m:'기타',s:'기타 불량',u:false,n:12}];
    fakeCodes.forEach(function(fc){html+='<tr><td style="color:var(--ac);font-weight:600">'+fc.c+'</td><td>'+fc.d+'</td><td>'+fc.m+'</td><td>'+fc.s+'</td><td>—</td><td><span class="'+(fc.u?'qd-code-ok':'qd-code-na')+'">'+(fc.u?'사용':'미사용')+'</span></td><td>'+fc.n+'</td><td>2025-04-20</td><td><button class="btn-sm" style="font-size:9.5px">수정</button> <button class="btn-sm" style="font-size:9.5px">삭제</button></td></tr>';});
  }
  html+='</tbody></table></div></div>';
  // 코드 사용 통계
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">코드 사용 통계</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px"><div><div style="font-size:10.5px;color:var(--ts)">전체 코드</div><div style="font-size:22px;font-weight:700;color:var(--tp)">215</div></div><div><div style="font-size:10.5px;color:var(--ts)">사용 중</div><div style="font-size:22px;font-weight:700;color:var(--gr)">189 <span style="font-size:13px">(88%)</span></div></div><div><div style="font-size:10.5px;color:var(--ts)">미사용</div><div style="font-size:22px;font-weight:700;color:var(--tp)">26 <span style="font-size:13px">(12%)</span></div></div><div><div style="font-size:10.5px;color:var(--ts)">미반영 기타</div><div style="font-size:22px;font-weight:700;color:var(--am)">12</div></div></div></div>';
  el.innerHTML=html;
}

function renderQMasterClassCode(){
  var el=document.getElementById('qmaster-panel-classcode');if(!el)return;
  var an=QDEFECT_ANALYTICS;
  var html='<div class="qd-analysis-grid">'
    +_qCard('파트(대분류) 목록',(QDEFECT_MASTER.parts||[]).length?'<table class="qd-map-table"><thead><tr><th>파트</th><th>영문명</th><th>코드</th><th>사용 건수</th></tr></thead><tbody>'+(QDEFECT_MASTER.parts||[]).map(function(p){var n=QDEFECT_RAW_ROWS.filter(function(r){return r.part===p.name;}).length;return'<tr><td>'+_qe(p.name)+'</td><td>'+_qe(p.en)+'</td><td style="color:var(--ac)">'+p.code+'</td><td>'+n+'</td></tr>';}).join('')+'</tbody></table>':_qBar(an.byPart,'var(--am)'))
    +_qCard('중요도 정의',(QDEFECT_MASTER.severities||[]).length?'<table class="qd-map-table"><thead><tr><th>등급</th><th>기준</th></tr></thead><tbody>'+(QDEFECT_MASTER.severities||[]).map(function(s){return'<tr><td class="qd-sev-'+s.name+'"><b>'+s.name+'</b></td><td style="font-size:11px">'+_qe(s.criteria||s.desc||'')+'</td></tr>';}).join('')+'</tbody></table>':'<table class="qd-map-table"><thead><tr><th>등급</th><th>기준</th></tr></thead><tbody>'+QSEV_VALS.map(function(sv){return'<tr><td class="qd-sev-'+sv+'"><b>'+sv+'</b></td><td style="font-size:11px">—</td></tr>';}).join('')+'</tbody></table>')
    +'</div>';
  el.innerHTML=html;
}

function renderQMasterAnalysis(){
  var el=document.getElementById('qmaster-panel-analysis');if(!el)return;
  var an=QDEFECT_ANALYTICS;
  var html='<div class="qd-analysis-grid">'
    +_qCard('코드별 빈도 분석',_qBar(an.byMajor.slice(0,10),'var(--ac)'))
    +_qCard('소분류 TOP10 (반복 후보)',_qBar(an.bySmall.slice(0,10),'var(--am)'))
    +'</div>';
  // 반복 불량 후보 (소분류 3회 이상)
  var repeatCandidates=an.bySmall.filter(function(x){return x.k&&x.n>=3;});
  if(repeatCandidates.length){
    html+='<div class="card"><div class="card-title" style="margin-bottom:8px">반복 불량 후보 (소분류 3회 이상 발생)</div><table class="qd-table"><thead><tr><th>소분류</th><th>발생 건수</th><th>주요 호기</th><th>최근 발생</th><th>CAPA 검토</th></tr></thead><tbody>'
      +repeatCandidates.slice(0,20).map(function(x){var rRows=QDEFECT_RAW_ROWS.filter(function(r){return r.smallCategory===x.k;});var mach=rRows.map(function(r){return r.machine;}).filter(Boolean).filter(function(v,i,a){return a.indexOf(v)===i;}).join(', ')||'—';var last=rRows.filter(function(r){return r.date;}).map(function(r){return r.date;}).sort().pop()||'—';return'<tr><td>'+_qe(x.k)+'</td><td><b>'+x.n+'</b></td><td style="font-size:10.5px">'+mach+'</td><td style="font-size:10.5px">'+last+'</td><td><span class="qd-code-warn">CAPA 후보</span></td></tr>';}).join('')+'</tbody></table></div>';
  }
  el.innerHTML=html;
}

function renderQMasterOther(){
  var el=document.getElementById('qmaster-panel-other');if(!el)return;
  var m=QDEFECT_MASTER;
  var otherRows=QDEFECT_RAW_ROWS.filter(function(r){return r.part==='기타'||!r.part;});
  var html='<div class="qd-kpi-row">'
    +_qKpiCard('기타 분류 건수',otherRows.length,'미분류','amber')
    +_qKpiCard('비율',Math.round(otherRows.length/QDEFECT_RAW_ROWS.length*100)+'%','','amber')
    +(m.others&&m.others.length?_qKpiCard('기타분류 항목',m.others.length+'개','',''):'')
    +'</div>';
  if(m.others&&m.others.length){
    html+='<div class="card" style="margin-bottom:12px"><div class="card-title" style="margin-bottom:8px">기타분류 항목 (코드화 후보 검토)</div><table class="qd-table"><thead><tr><th>항목</th><th>설명</th><th>발생 건수</th><th>코드화 검토</th></tr></thead><tbody>'
      +m.others.map(function(o){var cnt=QDEFECT_RAW_ROWS.filter(function(r){return r.etc===o.value;}).length;return'<tr><td>'+_qe(o.value)+'</td><td style="font-size:10.5px">'+_qe(o.desc||'')+'</td><td>'+cnt+'</td><td>'+(cnt>=3?'<span class="qd-code-warn">코드화 후보</span>':'<span class="qd-code-na">검토 보류</span>')+'</td></tr>';}).join('')+'</tbody></table></div>';
  }
  html+=otherRows.length?'<div class="card"><div class="card-title" style="margin-bottom:8px">기타 분류 Raw Data</div><table class="qd-table"><thead><tr><th>날짜</th><th>모델</th><th>호기</th><th>내용</th><th>파트</th><th>기타값</th></tr></thead><tbody>'
    +otherRows.slice(0,30).map(function(r){return'<tr><td style="font-size:10.5px">'+r.date+'</td><td>'+r.model+'</td><td>'+r.machine+'</td><td style="font-size:10.5px">'+r.content.slice(0,35)+'</td><td>'+r.part+'</td><td style="font-size:10.5px">'+r.etc+'</td></tr>';}).join('')+'</tbody></table></div>':'';
  el.innerHTML=html;
}

function renderQMasterMapping(){
  var el=document.getElementById('qmaster-panel-mapping');if(!el)return;
  el.innerHTML='<div class="card"><div class="card-title" style="margin-bottom:8px">컬럼 매핑 확인</div><table class="qd-map-table"><thead><tr><th>필드명</th><th>감지 열</th><th>헤더 위치</th><th>감지 방법</th><th>신뢰도</th><th>비고</th></tr></thead><tbody>'
    +[{f:'중요도',c:'C열',r:'6행',m:'키워드',h:'HIGH',n:'치명/주요/일반/사소/개선'},{f:'날짜',c:'F열',r:'6행',m:'키워드',h:'HIGH',n:'`26.04.01 형식'},{f:'모델/종류',c:'I열',r:'7행',m:'키워드',h:'HIGH',n:'OPERA/MD/HBM'},{f:'호기',c:'J열',r:'7행',m:'키워드',h:'HIGH',n:'숫자값'},{f:'CELL',c:'K열',r:'7행',m:'키워드',h:'HIGH',n:'1~12'},{f:'내용',c:'M열',r:'6행',m:'키워드',h:'HIGH',n:'가장 긴 텍스트'},{f:'파트',c:'N열',r:'7행',m:'키워드',h:'HIGH',n:'코드마스터 검증'},{f:'대분류',c:'O열',r:'7행',m:'키워드',h:'HIGH',n:''},{f:'소분류',c:'Q열',r:'7행',m:'키워드',h:'HIGH',n:''}]
    .map(function(r){return'<tr><td>'+r.f+'</td><td>'+r.c+'</td><td>'+r.r+'</td><td>'+r.m+'</td><td style="color:var(--gr)">'+r.h+'</td><td style="font-size:10.5px;color:var(--ts)">'+r.n+'</td></tr>';}).join('')
    +'</tbody></table></div>'
    +'<div class="card" style="margin-top:12px"><div class="card-title">양식 관리</div><div style="font-size:11.5px;color:var(--ts);margin-top:8px">업로드/다운로드 양식 버전 관리 · 코드 변경 이력 추적 · 유효성 검증 자동화 · API 연동 예정</div></div>';
}

// ════════════════════════════════════════════════════════
// nav 라우팅 hook 업데이트
// ════════════════════════════════════════════════════════
(function(){
  var _navBase=typeof nav==='function'?nav:null;
  if(!_navBase||nav.__v95hooked)return;
  // [STEP02] v95 nav wrapper neutralized; renders merged into odiNavAfterRenderDispatcher
  try { nav.__v95hooked=true; } catch(_e){}
})();

// ══════════════════════════════════
// v0.96 품질관리 — 전면 재작성

// ════════════════════════════════════════════════════════
// v0.96 차트 헬퍼 함수 (CSS/SVG 기반, 외부 라이브러리 없음)
// ════════════════════════════════════════════════════════

// ── 유틸 ──
function _qe(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function _qClr(sev){return{치명:'#ef4444',주요:'#f97316',일반:'#6366f1',사소:'#64748b',개선:'#22c55e'}[sev]||'#94a3b8';}
function _qRiskCls(fatal,major){return fatal>0?'qd-risk-h':major>5?'qd-risk-m':major>0?'qd-risk-l':'qd-risk-ok';}
function _qRiskLabel(fatal,major){return fatal>0?'🔴 HIGH':major>5?'🟠 MED':major>0?'🟡 LOW':'🟢 OK';}

// ── SVG 라인+바 혼합 차트 ──
function _qSvgLinebar(data, opts){
  opts = opts||{};
  var w=opts.w||360, h=opts.h||90, barColor=opts.barColor||'var(--ac)', lineColor=opts.lineColor||'var(--pi)';
  if(!data||!data.length) return '<div class="qd-tab-empty" style="height:'+h+'px;display:flex;align-items:center;justify-content:center">데이터 없음</div>';
  var max=Math.max.apply(null,data.map(function(d){return d.n;}));
  if(!max) max=1;
  var n=data.length, bw=Math.floor((w-40)/n*0.65), bGap=Math.floor((w-40)/n), pad=20;
  var bars='', points=[], labels='', gridLines='';
  // grid lines
  [0.25,0.5,0.75,1].forEach(function(r){
    var y=h-10-Math.round(r*(h-30));
    gridLines+='<line x1="'+pad+'" y1="'+y+'" x2="'+(w-pad)+'" y2="'+y+'" class="qd-svg-gridline"/>';
    gridLines+='<text x="'+pad+'" y="'+(y-2)+'" class="qd-svg-axis-txt">'+Math.round(max*r)+'</text>';
  });
  data.forEach(function(d,i){
    var x=pad+i*bGap+bGap/2;
    var bh=Math.max(2,Math.round(d.n/max*(h-30)));
    var by=h-10-bh;
    bars+='<rect class="qd-svg-bar-el" x="'+(x-bw/2)+'" y="'+by+'" width="'+bw+'" height="'+bh+'" fill="'+barColor+'" rx="2">'
      +'<title>ODI 생산관리 — 사용자 포털 Q_REBUILD_08I_DATA_MANAGEMENT_PAGES_PURPOSE_REDESIGN</title></rect>';
    points.push({x:x,y:h-10-Math.round(d.n/max*(h-30))});
    // labels
    var lbl=String(d.k);
    if(lbl.length>6) lbl=lbl.slice(-4);
    labels+='<text x="'+x+'" y="'+(h-1)+'" class="qd-svg-label" text-anchor="middle">'+_qe(lbl)+'</text>';
  });
  var polyPts=points.map(function(p){return p.x+','+p.y;}).join(' ');
  var polyline=points.length>1?'<polyline points="'+polyPts+'" fill="none" stroke="'+lineColor+'" stroke-width="2"/>':'';
  var dots=points.map(function(p,i){var d=data[i]||{};return'<circle cx="'+p.x+'" cy="'+p.y+'" r="3" fill="'+lineColor+'"><title>ODI 생산관리 — 사용자 포털 Q_REBUILD_08I_DATA_MANAGEMENT_PAGES_PURPOSE_REDESIGN</title></circle>';}).join('');
  return '<svg viewBox="0 0 '+w+' '+h+'" class="qd-svg-wrap" style="width:100%;height:'+h+'px">'+gridLines+bars+polyline+dots+labels+'</svg>';
}

// ── CSS Donut 차트 ──
function _qDonut(items, total, opts){
  opts=opts||{};
  if(!total||!items.length) return '<div class="qd-tab-empty">데이터 없음</div>';
  var stops=[], acc=0;
  items.forEach(function(x){
    var pct=Math.round(x.n/total*100);
    var c=_qClr(x.k)||(opts.colors&&opts.colors[x.k])||'#94a3b8';
    if(pct>0){stops.push(c+' '+acc+'% '+(acc+pct)+'%');acc+=pct;}
  });
  if(acc<100) stops.push('#334155 '+acc+'% 100%');
  return '<div style="display:flex;align-items:center;gap:14px">'
    +'<div class="qd-donut-outer" style="background:conic-gradient('+stops.join(',')+')">'
    +'<div class="qd-donut-hole"><div class="qd-donut-center-n">'+total+'</div><div class="qd-donut-center-l">건</div></div></div>'
    +'<div class="qd-donut-legend">'+items.filter(function(x){return x.n>0;}).map(function(x){
      var pct=Math.round(x.n/total*100),c=_qClr(x.k)||'#94a3b8';
      return '<div class="qd-donut-legend-row"><div class="qd-donut-dot" style="background:'+c+'"></div>'
        +'<span class="qd-sev-'+x.k+'" style="font-size:11px">'+_qe(x.k)+'</span>'
        +'<span style="color:var(--ts);font-size:10.5px">'+x.n+'건 ('+pct+'%)</span></div>';
    }).join('')+'</div></div>';
}

// ── Horizontal Pareto 바 ──
function _qPareto(items, opts){
  opts=opts||{};
  if(!items||!items.length) return '<div class="qd-tab-empty">데이터 없음</div>';
  var maxN=opts.maxN||15, color=opts.color||'var(--am)';
  var sl=items.slice(0,maxN), total=sl.reduce(function(a,x){return a+x.n;},0)||1;
  var maxItem=sl[0]?sl[0].n:1;
  var cumPct=0;
  return sl.map(function(x,i){
    var pct=Math.round(x.n/maxItem*100), cum=Math.round((cumPct+=x.n)/total*100);
    return '<div class="qd-pareto-row">'
      +'<span class="qd-pareto-rank">'+(i+1)+'</span>'
      +'<span class="qd-pareto-label" title="'+_qe(x.k)+'">'+_qe(x.k)+'</span>'
      +'<div class="qd-pareto-track">'
        +'<div class="qd-pareto-fill" style="width:'+pct+'%;background:'+color+'"></div></div>'
      +'<span class="qd-pareto-n">'+x.n+'</span>'
      +'<span class="qd-pareto-pct">'+cum+'%</span>'
      +'</div>';
  }).join('');
}

// ── 호기별 Risk Matrix Heatmap ──
function _qMachineRiskMatrix(rows){
  if(!rows.length) return '<div class="qd-tab-empty">데이터 없음</div>';
  var mMap={};
  rows.forEach(function(r){
    var m=r.machine||'미확인';
    if(!mMap[m]) mMap[m]={name:m,total:0,fatal:0,major:0,normal:0,minor:0,img:0,cells:{},parts:{},months:{}};
    mMap[m].total++;
    if(r.severity==='치명') mMap[m].fatal++;
    else if(r.severity==='주요') mMap[m].major++;
    else if(r.severity==='일반') mMap[m].normal++;
    else if(r.severity==='사소') mMap[m].minor++;
    if(r.imageCount>0) mMap[m].img++;
    if(r.cell) mMap[m].cells[r.cell]=(mMap[m].cells[r.cell]||0)+1;
    if(r.part) mMap[m].parts[r.part]=(mMap[m].parts[r.part]||0)+1;
    if(r.monthKey) mMap[m].months[r.monthKey]=(mMap[m].months[r.monthKey]||0)+1;
  });
  var mList=Object.values(mMap).sort(function(a,b){return b.total-a.total;});
  var maxTotal=mList[0]?mList[0].total:1;
  var html='<div style="overflow-x:auto"><table class="qd-compact-tbl" id="qd-machine-matrix">'
    +'<thead><tr>'
    +'<th>호기</th><th>총 불량</th><th style="color:var(--rd)">치명</th><th style="color:#f97316">주요</th><th>일반</th><th>이미지</th><th>위험도</th><th>주요 파트</th><th>CELL 집중</th>'
    +'</tr></thead><tbody>';
  mList.forEach(function(m){
    var riskCls=_qRiskCls(m.fatal,m.major), riskLbl=_qRiskLabel(m.fatal,m.major);
    var topPart=Object.keys(m.parts).sort(function(a,b){return m.parts[b]-m.parts[a];})[0]||'—';
    var topCell=Object.keys(m.cells).sort(function(a,b){return m.cells[b]-m.cells[a];})[0];
    var intensityW=Math.round(m.total/maxTotal*60);
    // sparkline for months
    var mKeys=Object.keys(m.months).sort(), mMax=Math.max.apply(null,Object.values(m.months))||1;
    var spark='<div class="qd-spark">'+mKeys.map(function(k){
      var bh=Math.round(m.months[k]/mMax*22);
      return'<div class="qd-spark-bar" style="height:'+bh+'px;background:var(--ac)" title="'+k+': '+m.months[k]+'"></div>';
    }).join('')+'</div>';
    html+='<tr data-machine="'+_qe(m.name)+'" onclick="_qSelectMachineAnalysis(\''+_qe(m.name)+'\')" style="cursor:pointer">'
      +'<td style="font-weight:600;white-space:nowrap"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'+_qRiskLabelColor(m.fatal,m.major)+';margin-right:5px"></span>'+_qe(m.name)+'호기</td>'
      +'<td><div style="display:flex;align-items:center;gap:4px"><div style="width:'+intensityW+'px;height:7px;background:var(--ac);border-radius:3px;opacity:.7"></div><b>'+m.total+'</b></div></td>'
      +'<td style="color:var(--rd);font-weight:'+(m.fatal?700:400)+'">'+(m.fatal||'—')+'</td>'
      +'<td style="color:#f97316;font-weight:'+(m.major?600:400)+'">'+(m.major||'—')+'</td>'
      +'<td>'+m.normal+'</td>'
      +'<td style="color:var(--ac)">'+m.img+'</td>'
      +'<td class="'+riskCls+'">'+riskLbl+'</td>'
      +'<td style="font-size:10.5px;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+_qe(topPart)+'">'+_qe(topPart)+'</td>'
      +'<td style="font-size:10.5px">'+(topCell?'CELL '+topCell:'—')+'</td>'
      +'</tr>';
  });
  html+='</tbody></table></div>';
  return {html:html, machines:mList};
}
function _qRiskLabelColor(fatal,major){return fatal>0?'#ef4444':major>5?'#f97316':major>0?'#f59e0b':'#22c55e';}

// ── CELL Heatmap ──
function _qCellHeatmap(rows){
  var cellMap={};
  rows.forEach(function(r){
    var c=r.cell||''; if(!c) return;
    var cn=parseInt(c);if(isNaN(cn)) return;
    cellMap[cn]=(cellMap[cn]||0)+1;
  });
  var keys=Object.keys(cellMap).map(Number).sort(function(a,b){return a-b;});
  if(!keys.length) return '<div class="qd-tab-empty">CELL 데이터 없음</div>';
  var maxV=Math.max.apply(null,Object.values(cellMap))||1;
  var noCell=rows.filter(function(r){return!r.cell;}).length;
  var cols=Math.ceil(Math.sqrt(keys[keys.length-1]||1));
  var html='<div style="margin-bottom:8px;font-size:11px;color:var(--ts)">CELL 미기재: <span style="color:var(--am);font-weight:600">'+noCell+'건</span></div>'
    +'<div class="qd-heatmap-grid" style="grid-template-columns:repeat('+cols+', 1fr);gap:4px">';
  var allCells=[];for(var i=1;i<=keys[keys.length-1];i++) allCells.push(i);
  allCells.forEach(function(cn){
    var n=cellMap[cn]||0;
    var intensity=n/maxV;
    var bg=n?'rgba(99,102,241,'+Math.min(0.9,0.1+intensity*0.8)+')':'var(--bd2)';
    var clr=intensity>0.4?'#fff':'var(--ts)';
    html+='<div class="qd-heatmap-cell" style="background:'+bg+';color:'+clr+';min-height:26px;font-size:9px" title="CELL '+cn+': '+n+'건">'+(n?n:'')+'</div>';
  });
  html+='</div><div class="qd-heatmap-legend"><div class="qd-hm-swatch" style="background:var(--bd2)"></div>0건<div class="qd-hm-swatch" style="background:rgba(99,102,241,.3)"></div>낮음<div class="qd-hm-swatch" style="background:rgba(99,102,241,.7)"></div>높음<div class="qd-hm-swatch" style="background:rgba(99,102,241,.9)"></div>최다</div>';
  return html;
}

// ── Calendar Heatmap ──
function _qCalHeatmap(rows, opts){
  opts=opts||{};
  if(!rows.length) return '<div class="qd-tab-empty">날짜 데이터 없음</div>';
  var dateMap={};
  rows.forEach(function(r){if(r.date) dateMap[r.date]=(dateMap[r.date]||0)+1;});
  var dates=Object.keys(dateMap).sort();
  if(!dates.length) return '<div class="qd-tab-empty">날짜 데이터 없음</div>';
  var maxV=Math.max.apply(null,Object.values(dateMap))||1;
  var first=new Date(dates[0]), last=new Date(dates[dates.length-1]);
  // Build by month
  var months={};
  Object.keys(dateMap).forEach(function(d){
    var mk=d.slice(0,7); if(!months[mk]) months[mk]={}; months[mk][d]=dateMap[d];
  });
  var html='';
  Object.keys(months).sort().forEach(function(mk){
    var mData=months[mk];
    var firstDay=new Date(mk+'-01');
    var daysInMonth=new Date(firstDay.getFullYear(), firstDay.getMonth()+1, 0).getDate();
    var startDow=firstDay.getDay(); // 0=Sun
    html+='<div style="margin-bottom:10px">'
      +'<div style="font-size:10px;color:var(--ts);font-weight:600;margin-bottom:4px">'+mk+'</div>'
      +'<div style="display:grid;grid-template-columns:repeat(7,20px);gap:2px">';
    // empty cells for alignment
    for(var d=0;d<startDow;d++) html+='<div></div>';
    for(var day=1;day<=daysInMonth;day++){
      var dateStr=mk+'-'+(day<10?'0':'')+day;
      var n=mData[dateStr]||0;
      var intensity=n/maxV;
      var bg=n?'rgba(99,102,241,'+Math.min(0.9,0.1+intensity*0.8)+')':'var(--bd2)';
      html+='<div class="qd-cal-cell" style="background:'+bg+'" title="'+dateStr+': '+n+'건">'+( n>0?n:''  )+'</div>';
    }
    html+='</div></div>';
  });
  return html;
}

// ── Grouped bar (모델별 중요도) ──
function _qGroupedBar(items, opts){
  opts=opts||{};
  if(!items||!items.length) return '<div class="qd-tab-empty">데이터 없음</div>';
  var maxN=Math.max.apply(null,items.map(function(x){return x.total||x.n||0;}))||1;
  var sevColors={치명:'#ef4444',주요:'#f97316',일반:'#6366f1',사소:'#64748b'};
  return items.map(function(m){
    var total=m.total||m.n||0, pct=Math.round(total/maxN*100);
    return '<div class="qd-grouped-bar-row">'
      +'<span class="qd-grouped-label" title="'+_qe(m.k)+'">'+_qe(m.k)+'</span>'
      +'<div style="flex:1;display:flex;flex-direction:column;gap:2px">'
        +'<div style="display:flex;align-items:center;gap:3px">'
        +['치명','주요','일반','사소'].map(function(sv){
          var c=m.bySev&&m.bySev[sv]?Math.round(m.bySev[sv]/total*pct):0;
          return c?'<div class="qd-grouped-seg" style="width:'+c+'px;height:10px;background:'+sevColors[sv]+'" title="'+sv+': '+(m.bySev&&m.bySev[sv]||0)+'건"></div>':'';
        }).join('')
        +(pct?'<div class="qd-grouped-seg" style="width:8px;height:10px;background:var(--bd2)" title=""></div>':'')
        +'</div></div>'
      +'<span style="font-size:10px;color:var(--ts);min-width:24px;text-align:right">'+total+'</span>'
      +'</div>';
  }).join('');
}

// ── Lollipop chart ──
function _qLollipop(items, opts){
  opts=opts||{};
  if(!items||!items.length) return '<div class="qd-tab-empty">데이터 없음</div>';
  var maxN=items[0]?items[0].n:1;
  return items.slice(0,opts.max||15).map(function(x){
    var pct=Math.round(x.n/maxN*100);
    var c=opts.color||'var(--ac)';
    return '<div class="qd-lollipop-row">'
      +'<span class="qd-lollipop-label" title="'+_qe(x.k)+'">'+_qe(x.k)+'</span>'
      +'<div class="qd-lollipop-line"><div class="qd-lollipop-dot" style="left:calc('+pct+'% - 5px);background:'+c+'" title="'+x.n+'건"></div></div>'
      +'<span class="qd-lollipop-val">'+x.n+'</span>'
      +'</div>';
  }).join('');
}

// ── Variance Table (SUMMARY vs Raw) ──
function _qVarianceTable(monthly, summaryData){
  var sc=summaryData.monthCounts||{};
  var rows=monthly.map(function(s){
    var mk=_qmk(s.name), label=s.name.replace(/^`/,'');
    var sv=sc[label]||sc[mk.slice(2,4)+'.'+mk.slice(5,7)]||sc[mk.slice(5,7)+'월']||null;
    var rv=s.rowCount||0, diff=sv!=null?rv-sv:null;
    var cls=diff==null?'':'diff===0'?'qd-delta-ok':Math.abs(diff)<=2?'qd-delta-warn':'qd-delta-err';
    var deltaCls=diff===0?'qd-delta-ok':diff==null?'':Math.abs(diff)<=2?'qd-delta-warn':'qd-delta-err';
    return '<tr><td><span class="qd-month">'+mk+'</span></td><td>'+(sv!=null?sv:'—')+'</td><td><b>'+rv+'</b></td>'
      +'<td>'+(diff!=null?'<span class="qd-delta-badge '+deltaCls+'">'+(diff>=0?'+':'')+diff+'</span>':'<span class="qd-delta-badge">—</span>')+'</td>'
      +'<td style="color:'+(diff===0?'var(--gr)':diff==null?'var(--ts)':'var(--am)')+'">'+( diff===0?'✅':diff==null?'—':'⚠')+'</td></tr>';
  }).join('');
  return '<table class="qd-variance-table"><thead><tr><th>월</th><th>SUMMARY</th><th>실제 파싱</th><th>차이</th><th>상태</th></tr></thead><tbody>'+rows+'</tbody></table>';
}

// ── 3단 레이아웃 빌더 ──
function _q3Pane(leftHtml, centerHtml, rightHtml, containerId){
  var id=containerId||'';
  var el=id?document.getElementById(id):null;
  var html='<div class="qd-3col">'
    +'<div class="qd-pane">'+leftHtml+'</div>'
    +'<div class="qd-pane">'+centerHtml+'</div>'
    +'<div class="qd-pane">'+rightHtml+'</div>'
    +'</div>';
  if(el) el.innerHTML=html;
  return html;
}

// ── Mini bar ──
function _qMiniBar(n, total, color){
  var pct=total?Math.round(n/total*100):0;
  return '<div style="display:flex;align-items:center;gap:4px"><div style="flex:1;background:var(--bd2);border-radius:3px;height:6px;overflow:hidden"><div style="width:'+pct+'%;height:6px;background:'+(color||'var(--ac)')+';border-radius:3px"></div></div><span style="font-size:10px;color:var(--ts);min-width:22px;text-align:right">'+n+'</span></div>';
}

// ════════════════════════════════════════════════════════
// v0.96: 품질 통합 대시보드 — 전면 재작성
// ════════════════════════════════════════════════════════
function _qmk(sn){var m=sn.replace(/^`/,'').match(/^(\d{2})\.(\d{2})$/);return m?'20'+m[1]+'-'+m[2]:sn;}

function renderQDashPage(){
  _qShow('qdash-empty',false); _qShow('qdash-content',true);
  renderQDashTab();
}

function switchQDash(tab,btn){
  _qDashTab=tab;
  document.querySelectorAll('#qdash-tabbar .qd-tab').forEach(function(b){b.classList.toggle('active',b.dataset.t===tab);});
  renderQDashTab();
}

function renderQDashTab(){
  if(!QDEFECT_WORKBOOK_READY) return;
  var fns={overview:renderQDashOverview,monthly:renderQDashMonthly,severity:renderQDashSeverity,
    process:renderQDashProcess,machine:renderQDashMachineView,trend:renderQDashTrend,alert:renderQDashAlert};
  if(fns[_qDashTab]) fns[_qDashTab]();
}

function _qDashKpi(){
  var an=QDEFECT_ANALYTICS, rows=QDEFECT_RAW_ROWS;
  var repeat=an.bySmall?an.bySmall.filter(function(x){return x.n>=3;}).length:0;
  var eco=rows.filter(function(r){return r.severity==='치명'||r.severity==='주요';}).length;
  var capa=repeat;
  var imgAll=QDEFECT_IMAGES.length+QDEFECT_UNMATCHED_IMAGES.length;
  var imgPct=imgAll?Math.round(QDEFECT_IMAGES.length/imgAll*100):0;
  return '<div class="qd-kpi-row" style="grid-template-columns:repeat(auto-fill,minmax(108px,1fr));margin-bottom:14px">'
    +_qKpiCard('전체 불량',an.total,'누적 등록','accent')
    +_qKpiCard('이번 달',an.thisMonth,'')
    +_qKpiCard('치명',an.critical,'즉시 대응','red')
    +_qKpiCard('주요',an.major,'처리 필요','amber')
    +_qKpiCard('ECO 후보',eco,'치명+주요','amber')
    +_qKpiCard('CAPA 후보',capa,'반복불량 3회↑','')
    +_qKpiCard('이미지 증빙',QDEFECT_IMAGES.length+'장','연결 '+imgPct+'%','green')
    +_qKpiCard('파싱 경고',QDEFECT_PARSE_WARNINGS.length+'건','',QDEFECT_PARSE_WARNINGS.length?'amber':'')
    +_qKpiCard('미매칭 이미지',QDEFECT_UNMATCHED_IMAGES.length+'장','',QDEFECT_UNMATCHED_IMAGES.length?'red':'green')
    +_qKpiCard('미기재 CELL',an.unmappedCell+'건','',an.unmappedCell>an.total*0.3?'amber':'')
    +'</div>';
}

function renderQDashOverview(){
  var el=document.getElementById('qdash-content'); if(!el) return;
  var an=QDEFECT_ANALYTICS, rows=QDEFECT_RAW_ROWS;
  var monthly=QDEFECT_SHEET_SUMMARY.filter(function(s){return s.type==='monthly';});
  var sortedM=an.byMonth.slice().sort(function(a,b){return a.k.localeCompare(b.k);});
  var sevItems=an.bySev||[];

  var html=_qDashKpi();

  // ─ 3열 레이아웃: 월별추이 / 중요도Donut / 알림
  html+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px">';
  // 월별 추이 (SVG line+bar)
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">월별 불량 추이</div>'
    +_qSvgLinebar(sortedM,{w:300,h:90})+'</div>';
  // 중요도 donut
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">중요도 분포</div>'
    +_qDonut(sevItems,an.total)+'</div>';
  // 위험 알림
  var alerts=_qBuildAlerts(an,rows);
  html+='<div class="card" style="border-color:var(--rd)"><div class="card-title" style="margin-bottom:6px;color:var(--rd)">⚠ 위험 알림</div>'
    +(alerts.length?alerts.map(function(a){return'<div style="padding:5px 8px;border-left:3px solid '+a.color+';margin-bottom:5px;font-size:11px"><b style="color:'+a.color+'">'+a.type+'</b> '+a.msg+'</div>';}).join(''):'<div style="color:var(--gr);font-size:11.5px;padding:8px">✅ 이상징후 없음</div>')
    +'</div></div>';

  // ─ 공정/파트 Pareto + 모델별 grouped + 호기 mini heatmap
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">공정/파트 Pareto</div>'+_qPareto(an.byPart,{color:'var(--am)'})+'</div>';
  // 모델별 grouped bar
  var modelItems=an.byModel.map(function(m){
    var mRows=rows.filter(function(r){return r.model===m.k;});
    var bs={};mRows.forEach(function(r){bs[r.severity]=(bs[r.severity]||0)+1;});
    return{k:m.k,total:m.n,bySev:bs};
  });
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">모델별 중요도 분포</div>'
    +'<div style="font-size:10px;color:var(--ts);display:flex;gap:8px;margin-bottom:6px">'+['치명','주요','일반','사소'].map(function(sv){return'<span style="display:flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:2px;background:'+_qClr(sv)+'"></span>'+sv+'</span>';}).join('')+'</div>'
    +_qGroupedBar(modelItems)+'</div>';
  html+='</div>';

  // ─ SUMMARY 비교표 + 대분류 TOP + CELL 미니 히트맵
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">SUMMARY vs 실제 파싱 비교</div>'+_qVarianceTable(monthly,QDEFECT_SUMMARY_DATA)+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">대분류 TOP10</div>'+_qPareto(an.byMajor,{color:'var(--ac)',maxN:10})+'</div>';
  html+='</div>';

  // ─ 호기별 Mini Risk Matrix
  var mxRes=_qMachineRiskMatrix(rows);
  html+='<div class="card" style="margin-bottom:12px"><div class="card-title" style="margin-bottom:8px">호기별 위험도 Matrix'
    +'<span style="float:right;font-size:10.5px;color:var(--ac);cursor:pointer" onclick="nav(\'quality-analysis\')">상세 분석 →</span></div>'
    +mxRes.html+'</div>';

  el.innerHTML=html;
  // 행 클릭 → 분석 페이지 이동
  el.querySelectorAll('#qd-machine-matrix tr[data-machine]').forEach(function(tr){
    tr.addEventListener('click',function(){_qSelMachine=this.dataset.machine;nav('quality-analysis');});
  });
}

function _qBuildAlerts(an,rows){
  var alerts=[];
  if(an.critical>0) alerts.push({type:'치명',msg:'치명 불량 '+an.critical+'건 발생',color:'var(--rd)'});
  if(an.unmappedCell>an.total*0.3) alerts.push({type:'CELL',msg:'CELL 미기재 '+an.unmappedCell+'건 ('+Math.round(an.unmappedCell/an.total*100)+'%)',color:'var(--am)'});
  if(QDEFECT_UNMATCHED_IMAGES.length>0) alerts.push({type:'이미지',msg:'미매칭 이미지 '+QDEFECT_UNMATCHED_IMAGES.length+'장',color:'var(--am)'});
  if(QDEFECT_PARSE_WARNINGS.length>10) alerts.push({type:'파싱',msg:'파싱 경고 '+QDEFECT_PARSE_WARNINGS.length+'건',color:'var(--ts)'});
  // 반복 후보
  var rep=an.bySmall?an.bySmall.filter(function(x){return x.n>=3;}).length:0;
  if(rep>0) alerts.push({type:'반복',msg:'반복 불량 후보 '+rep+'건 (CAPA 검토)',color:'var(--am)'});
  return alerts;
}

function renderQDashMonthly(){
  var el=document.getElementById('qdash-content'); if(!el) return;
  var an=QDEFECT_ANALYTICS;
  var sortedM=an.byMonth.slice().sort(function(a,b){return a.k.localeCompare(b.k);});
  var html=_qDashKpi();
  html+='<div class="qd-analysis-grid">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">월별 불량 추이 (라인+바)</div>'
    +_qSvgLinebar(sortedM,{w:400,h:110})+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">SUMMARY vs 실제 비교</div>'
    +_qVarianceTable(QDEFECT_SHEET_SUMMARY.filter(function(s){return s.type==='monthly';}),QDEFECT_SUMMARY_DATA)+'</div>';
  html+='</div>';
  // 월별 상세 카드
  html+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px">';
  sortedM.forEach(function(m){
    var mRows=QDEFECT_RAW_ROWS.filter(function(r){return r.monthKey===m.k;});
    var bySev={};mRows.forEach(function(r){bySev[r.severity]=(bySev[r.severity]||0)+1;});
    html+='<div class="card"><div class="card-title" style="margin-bottom:8px"><span class="qd-month">'+m.k+'</span> <b>'+m.n+'건</b></div>'
      +_qDonut(QSEV_VALS.map(function(sv){return{k:sv,n:bySev[sv]||0};}),m.n)+'</div>';
  });
  html+='</div>';
  el.innerHTML=html;
}

function renderQDashSeverity(){
  var el=document.getElementById('qdash-content'); if(!el) return;
  var an=QDEFECT_ANALYTICS, rows=QDEFECT_RAW_ROWS;
  var sevColors={'치명':'#ef4444','주요':'#f97316','일반':'#6366f1','사소':'#64748b','개선':'#22c55e'};
  var html=_qDashKpi();
  html+='<div class="qd-analysis-grid">';
  // 중요도 donut
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">중요도 분포</div>'+_qDonut(an.bySev,an.total)+'</div>';
  // 호기별 중요도 비교
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">호기별 중요도 비교</div><div style="overflow-x:auto"><table class="qd-compact-tbl"><thead><tr><th>호기</th>'
    +QSEV_VALS.map(function(sv){return'<th class="qd-sev-'+sv+'">'+sv+'</th>';}).join('')+'<th>합계</th></tr></thead><tbody>'
    +an.byMachine.slice(0,10).map(function(m){
      var mr=rows.filter(function(r){return r.machine===m.k;}),sm={};
      mr.forEach(function(r){sm[r.severity]=(sm[r.severity]||0)+1;});
      return'<tr><td style="font-weight:600">'+_qe(m.k)+'</td>'+QSEV_VALS.map(function(sv){return'<td style="color:'+(sevColors[sv]||'')+'">'+(sm[sv]||0)+'</td>';}).join('')+'<td><b>'+m.n+'</b></td></tr>';
    }).join('')+'</tbody></table></div></div>';
  html+='</div>';
  // 파트별 중요도
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">파트별 중요도 비교</div><div style="overflow-x:auto"><table class="qd-compact-tbl"><thead><tr><th>파트</th>'
    +QSEV_VALS.map(function(sv){return'<th class="qd-sev-'+sv+'">'+sv+'</th>';}).join('')+'<th>합계</th></tr></thead><tbody>'
    +an.byPart.slice(0,8).map(function(p){
      var pr=rows.filter(function(r){return r.part===p.k;}),sm={};
      pr.forEach(function(r){sm[r.severity]=(sm[r.severity]||0)+1;});
      return'<tr><td style="font-weight:600">'+_qe(p.k)+'</td>'+QSEV_VALS.map(function(sv){return'<td style="color:'+(sevColors[sv]||'')+'">'+(sm[sv]||0)+'</td>';}).join('')+'<td><b>'+p.n+'</b></td></tr>';
    }).join('')+'</tbody></table></div></div>';
  el.innerHTML=html;
}

function renderQDashProcess(){
  var el=document.getElementById('qdash-content'); if(!el) return;
  var an=QDEFECT_ANALYTICS;
  var html=_qDashKpi();
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">파트별 Pareto (누적 비율)</div>'+_qPareto(an.byPart,{color:'var(--am)'})+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">대분류 TOP10</div>'+_qPareto(an.byMajor,{color:'var(--ac)',maxN:10})+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">중분류 TOP10</div>'+_qPareto(an.byMiddle,{color:'var(--pi)',maxN:10})+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">소분류 TOP10 (반복 후보)</div>'+_qPareto(an.bySmall,{color:'var(--am)',maxN:10})+'</div>';
  html+='</div>';
  el.innerHTML=html;
}

function renderQDashMachineView(){
  var el=document.getElementById('qdash-content'); if(!el) return;
  var an=QDEFECT_ANALYTICS, rows=QDEFECT_RAW_ROWS;
  var html=_qDashKpi();
  var mxRes=_qMachineRiskMatrix(rows);
  html+='<div class="card" style="margin-bottom:12px"><div class="card-title" style="margin-bottom:8px">호기별 위험도 Matrix</div>'+mxRes.html+'</div>';
  html+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">CELL별 분포</div>'+_qPareto(an.byCell.slice(0,12),{color:'var(--pi)'})+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">모델별 분포</div>'+_qPareto(an.byModel,{color:'var(--gr)'})+'</div>';
  // 모델×호기 매트릭스
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">모델 × 호기 매트릭스</div><div style="overflow-x:auto;font-size:11px"><table class="qd-compact-tbl"><thead><tr><th>모델</th>'+an.byMachine.slice(0,5).map(function(m){return'<th>'+_qe(m.k)+'</th>';}).join('')+'</tr></thead><tbody>'+an.byModel.map(function(model){return'<tr><td style="font-weight:600">'+_qe(model.k)+'</td>'+an.byMachine.slice(0,5).map(function(m){var c=rows.filter(function(r){return r.model===model.k&&r.machine===m.k;}).length;return'<td style="text-align:center;background:rgba(99,102,241,'+(c?Math.min(0.6,c/an.total*5).toFixed(2):'0')+')">'+(c||'')+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div></div>';
  html+='</div>';
  el.innerHTML=html;
}

function renderQDashTrend(){
  var el=document.getElementById('qdash-content'); if(!el) return;
  var an=QDEFECT_ANALYTICS, rows=QDEFECT_RAW_ROWS;
  var sortedM=an.byMonth.slice().sort(function(a,b){return a.k.localeCompare(b.k);});
  var html=_qDashKpi();
  // Calendar heatmap
  html+='<div class="qd-analysis-grid">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">날짜별 발생 캘린더 히트맵</div>'+_qCalHeatmap(rows)+'</div>';
  // 월별 SVG + 작성자 lollipop
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">월별 불량 + 트렌드</div>'+_qSvgLinebar(sortedM,{w:320,h:100})
    +(sortedM.length>=2?'<div style="margin-top:8px;font-size:11.5px;padding:8px;background:var(--sf2);border-radius:6px">'+( function(){var last=sortedM[sortedM.length-1],prev=sortedM[sortedM.length-2],trend=last.n-prev.n;return'전월 대비 <span style="color:'+(trend>0?'var(--rd)':'var(--gr)')+'"><b>'+(trend>0?'+':'')+trend+'건</b></span> ('+(trend>0?'증가':'감소')+')';})()+'</div>':'')+'</div>';
  html+='</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">일자별 TOP20</div>'+_qPareto(an.byDate.slice(0,20),{color:'var(--am)',maxN:20})+'</div>';
  el.innerHTML=html;
}

function renderQDashAlert(){
  var el=document.getElementById('qdash-content'); if(!el) return;
  var an=QDEFECT_ANALYTICS, rows=QDEFECT_RAW_ROWS;
  var html=_qDashKpi();
  var alerts=_qBuildAlerts(an,rows);
  html+=(alerts.length
    ?'<div style="display:flex;flex-direction:column;gap:8px">'+alerts.map(function(a){return'<div style="padding:12px 14px;border:1px solid '+a.color+';border-radius:8px;border-left-width:4px"><div style="font-size:12px;font-weight:600;color:'+a.color+';margin-bottom:4px">'+a.msg+'</div></div>';}).join('')+'</div>'
    :'<div class="qd-tab-empty" style="color:var(--gr)">✅ 이상징후 없음</div>');
  // 치명 이슈 목록
  var critRows=rows.filter(function(r){return r.severity==='치명';});
  if(critRows.length){
    html+='<div class="card" style="margin-top:12px;border-color:var(--rd)"><div class="card-title" style="margin-bottom:8px;color:var(--rd)">치명 이슈 목록</div><table class="qd-compact-tbl"><thead><tr><th>날짜</th><th>모델</th><th>호기</th><th>CELL</th><th>파트</th><th>내용</th></tr></thead><tbody>'
      +critRows.map(function(r){return'<tr><td>'+r.date+'</td><td>'+_qe(r.model)+'</td><td>'+_qe(r.machine)+'</td><td>'+_qe(r.cell||'—')+'</td><td>'+_qe(r.part)+'</td><td>'+_qe(r.content).slice(0,40)+'</td></tr>';}).join('')+'</tbody></table></div>';
  }
  el.innerHTML=html;
}

// ════════════════════════════════════════════════════════
// v0.96: 품질 분석 센터 — 3단 구성 전면 재작성
// ════════════════════════════════════════════════════════
var _qSelMachine='';
var _qSelModel='';

function renderQAnalysisPage(){
  if(!QDEFECT_WORKBOOK_READY) return;
  _qShow('qanalysis-empty',false);_qShow('qanalysis-content',true);
  switchQAnalysis(_qAnalysisTab,null);
}

function switchQAnalysis(tab,btn){
  _qAnalysisTab=tab;
  document.querySelectorAll('#qanalysis-tabbar .qd-tab').forEach(function(b){b.classList.toggle('active',b.dataset.t===tab);});
  ['machine','model','cell','date','code','writer'].forEach(function(p){_qShow('qanalysis-panel-'+p,p===tab);});
  if(!QDEFECT_WORKBOOK_READY) return;
  if(tab==='machine') renderQAnalysisMachinePane();
  else if(tab==='model') renderQAnalysisModelPane();
  else if(tab==='cell') renderQAnalysisCellPane();
  else if(tab==='date') renderQAnalysisDatePane();
  else if(tab==='code') renderQAnalysisCodePane();
  else if(tab==='writer') renderQAnalysisWriterPane();
}

// ── 호기별 분석 — 3단 구성 ──
function renderQAnalysisMachinePane(){
  var el=document.getElementById('qanalysis-panel-machine'); if(!el) return;
  var an=QDEFECT_ANALYTICS, rows=QDEFECT_RAW_ROWS;
  // 필터바
  var html='<div class="qd-filter-bar">'
    +'<select class="form-input" id="qa-mach-flt-month" onchange="renderQAnalysisMachinePane()" style="font-size:11.5px"><option value="">전체 월</option>'
    +an.byMonth.map(function(m){return'<option>'+m.k+'</option>';}).join('')+'</select>'
    +'<select class="form-input" id="qa-mach-flt-model" onchange="renderQAnalysisMachinePane()" style="font-size:11.5px"><option value="">전체 모델</option>'
    +an.byModel.map(function(m){return'<option>'+m.k+'</option>';}).join('')+'</select>'
    +'<select class="form-input" id="qa-mach-flt-sev" onchange="renderQAnalysisMachinePane()" style="font-size:11.5px"><option value="">전체 중요도</option>'
    +QSEV_VALS.map(function(s){return'<option>'+s+'</option>';}).join('')+'</select>'
    +'<button class="btn-sm" onclick="_qAnalysisMachineReset()">초기화</button>'
    +'</div>';
  // 필터 적용
  var fMonth=(document.getElementById('qa-mach-flt-month')||{}).value||'';
  var fModel=(document.getElementById('qa-mach-flt-model')||{}).value||'';
  var fSev=(document.getElementById('qa-mach-flt-sev')||{}).value||'';
  var fRows=rows.filter(function(r){
    if(fMonth&&r.monthKey!==fMonth) return false;
    if(fModel&&r.model!==fModel) return false;
    if(fSev&&r.severity!==fSev) return false;
    return true;
  });
  var mxRes=_qMachineRiskMatrix(fRows);
  var machines=mxRes.machines;
  if(!_qSelMachine&&machines.length) _qSelMachine=machines[0].name;
  var selM=machines.find(function(m){return m.name===_qSelMachine;})||machines[0]||null;

  // 좌측: 호기 목록 (위험도 순)
  var leftHtml='<div class="qd-panel-box"><div class="qd-panel-title">호기 목록</div>'
    +machines.map(function(m){var rc=_qRiskCls(m.fatal,m.major);return'<div class="qd-list-item'+(m.name===_qSelMachine?' sel':'')+'" onclick="_qSelectMachineAnalysis(\''+_qe(m.name)+'\')">'
      +'<span><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:'+_qRiskLabelColor(m.fatal,m.major)+';margin-right:5px"></span>'+_qe(m.name)+'호기</span>'
      +'<span class="qd-list-badge '+(m.fatal>0?'red':m.major>0?'amb':'')+'">'+m.total+'건</span>'
      +'</div>';}).join('')+'</div>';
  // 위험도 상위 TOP
  var topDanger=machines.filter(function(m){return m.fatal>0||m.major>0;}).slice(0,3);
  if(topDanger.length) leftHtml+='<div class="qd-panel-box"><div class="qd-panel-title">⚠ 위험 호기</div>'
    +topDanger.map(function(m){return'<div style="padding:5px 6px;border-left:3px solid '+_qRiskLabelColor(m.fatal,m.major)+';margin-bottom:4px;font-size:11px"><b>'+_qe(m.name)+'호기</b> '+(m.fatal?'치명'+m.fatal+'건':'')+(m.major?' 주요'+m.major+'건':'')+'</div>';}).join('')+'</div>';

  // 중앙: Risk Matrix + 월별 추이
  var centHtml='<div class="card" style="margin-bottom:10px"><div class="card-title" style="margin-bottom:8px">호기별 Risk Matrix — 비교 테이블</div>'
    +mxRes.html+'</div>';
  // 호기별 월별 추이 (작은 SVG)
  if(machines.length){
    centHtml+='<div class="card"><div class="card-title" style="margin-bottom:8px">호기별 월별 추이 비교</div>'
      +'<div style="overflow-x:auto"><table class="qd-compact-tbl"><thead><tr><th>호기</th>'
      +an.byMonth.slice().sort(function(a,b){return a.k.localeCompare(b.k);}).map(function(m){return'<th>'+m.k.slice(2)+'</th>';}).join('')+'</tr></thead><tbody>'
      +machines.slice(0,8).map(function(m){
        var mRows=fRows.filter(function(r){return r.machine===m.name;});
        return'<tr><td style="font-weight:600">'+_qe(m.name)+'호기</td>'
          +an.byMonth.slice().sort(function(a,b){return a.k.localeCompare(b.k);}).map(function(mo){
            var cnt=mRows.filter(function(r){return r.monthKey===mo.k;}).length;
            var bg=cnt>0?'rgba(99,102,241,'+Math.min(0.7,0.1+cnt/20)+')':'transparent';
            return'<td style="text-align:center;background:'+bg+'">'+(cnt||'')+'</td>';
          }).join('')+'</tr>';
      }).join('')+'</tbody></table></div></div>';
  }

  // 우측: 선택 호기 상세 패널 (팝업 아님)
  var rightHtml='<div class="qd-r-panel">';
  if(selM){
    var selRows=fRows.filter(function(r){return r.machine===selM.name;});
    var bySev={},byPart={},byCell={};
    selRows.forEach(function(r){bySev[r.severity]=(bySev[r.severity]||0)+1;if(r.part)byPart[r.part]=(byPart[r.part]||0)+1;if(r.cell)byCell[r.cell]=(byCell[r.cell]||0)+1;});
    rightHtml+='<div class="qd-r-section-title">'+_qe(selM.name)+'호기 상세</div>';
    rightHtml+='<div class="qd-r-field"><div class="qd-r-field-label">위험도</div><div class="'+_qRiskCls(selM.fatal,selM.major)+'" style="font-size:14px;font-weight:700">'+_qRiskLabel(selM.fatal,selM.major)+'</div></div>';
    // 중요도 분포 mini
    rightHtml+='<div class="qd-r-field"><div class="qd-r-field-label">중요도 분포</div>';
    QSEV_VALS.forEach(function(sv){var c=bySev[sv]||0;if(!c) return;var pct=Math.round(c/selM.total*100);rightHtml+='<div class="qd-pareto-row" style="margin-bottom:3px"><span style="min-width:28px;font-size:10px" class="qd-sev-'+sv+'">'+sv+'</span><div class="qd-pareto-track" style="height:8px"><div class="qd-pareto-fill" style="width:'+pct+'%;background:'+_qClr(sv)+'"></div></div><span class="qd-pareto-n">'+c+'</span></div>';});
    rightHtml+='</div>';
    // 파트별
    var topParts=Object.entries(byPart).sort(function(a,b){return b[1]-a[1];}).slice(0,5);
    if(topParts.length){
      var maxP=topParts[0][1];
      rightHtml+='<hr class="qd-r-divider"><div class="qd-r-section-title">파트별 분포</div>';
      topParts.forEach(function(e){var pct=Math.round(e[1]/maxP*100);rightHtml+='<div class="qd-pareto-row" style="margin-bottom:3px"><span class="qd-pareto-label">'+_qe(e[0])+'</span><div class="qd-pareto-track" style="height:8px"><div class="qd-pareto-fill" style="width:'+pct+'%;background:var(--am)"></div></div><span class="qd-pareto-n">'+e[1]+'</span></div>';});
    }
    // CELL 집중
    var topCells=Object.entries(byCell).sort(function(a,b){return b[1]-a[1];}).slice(0,5);
    if(topCells.length){
      rightHtml+='<hr class="qd-r-divider"><div class="qd-r-section-title">CELL 집중</div>';
      topCells.forEach(function(e){rightHtml+='<div style="display:flex;justify-content:space-between;font-size:11.5px;padding:2px 0"><span style="color:var(--tp)">CELL '+_qe(e[0])+'</span><b>'+e[1]+'건</b></div>';});
    }
    // 이미지
    var imgs=QDEFECT_IMAGES.filter(function(img){var r=QDEFECT_RAW_ROWS.find(function(r){return r.id===img.rowId;});return r&&r.machine===selM.name;});
    if(imgs.length){
      rightHtml+='<hr class="qd-r-divider"><div class="qd-r-section-title">이미지 ('+imgs.length+'장)</div>'
        +'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px">'
        +imgs.slice(0,6).map(function(img){return'<div onclick="openQImgModal(\''+img.id+'\')" style="cursor:pointer;border-radius:4px;overflow:hidden;aspect-ratio:1;background:var(--bd2)"><img src="'+img.objectUrl+'" style="width:100%;height:100%;object-fit:cover" loading="lazy" onerror="this.style.display=\'none\'"></div>';}).join('')
        +'</div>';
    }
    // 조치 후보
    var critMaj=selRows.filter(function(r){return r.severity==='치명'||r.severity==='주요';});
    if(critMaj.length){
      rightHtml+='<hr class="qd-r-divider"><div class="qd-r-section-title">조치 후보 ('+critMaj.length+'건)</div>';
      critMaj.slice(0,4).forEach(function(r){rightHtml+='<div style="font-size:10.5px;padding:4px 6px;border-left:2px solid '+_qClr(r.severity)+';margin-bottom:3px"><span class="qd-sev-'+r.severity+'">'+r.severity+'</span> '+_qe(r.content).slice(0,30)+'</div>';});
    }
    rightHtml+='<hr class="qd-r-divider"><button class="btn-sm" onclick="nav(\'quality-action\')" style="width:100%;font-size:10.5px">조치/ECO 관리로 이동</button>';
  }else{
    rightHtml+='<div class="qd-r-empty">호기를 선택하세요</div>';
  }
  rightHtml+='</div>';
  el.innerHTML=html+'<div class="qd-3col"><div class="qd-pane">'+leftHtml+'</div><div class="qd-pane">'+centHtml+'</div><div class="qd-pane">'+rightHtml+'</div></div>';
}

function _qSelectMachineAnalysis(machine){
  _qSelMachine=machine;
  renderQAnalysisMachinePane();
}
function _qAnalysisMachineReset(){
  var ids=['qa-mach-flt-month','qa-mach-flt-model','qa-mach-flt-sev'];
  ids.forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  renderQAnalysisMachinePane();
}

// ── 모델/종류별 분석 ──
function renderQAnalysisModelPane(){
  var el=document.getElementById('qanalysis-panel-model'); if(!el) return;
  var an=QDEFECT_ANALYTICS, rows=QDEFECT_RAW_ROWS;
  var models=an.byModel;
  if(!_qSelModel&&models.length) _qSelModel=models[0].k;
  var selMRows=rows.filter(function(r){return r.model===_qSelModel;});
  var bySev={};selMRows.forEach(function(r){bySev[r.severity]=(bySev[r.severity]||0)+1;});
  var byMach={};selMRows.forEach(function(r){var m=r.machine||'미확인';byMach[m]=(byMach[m]||0)+1;});
  var byPart={};selMRows.forEach(function(r){if(r.part)byPart[r.part]=(byPart[r.part]||0)+1;});

  var leftHtml='<div class="qd-panel-box"><div class="qd-panel-title">모델 목록</div>'
    +models.map(function(m){return'<div class="qd-list-item'+(m.k===_qSelModel?' sel':'')+'" onclick="_qSelModel=\''+_qe(m.k)+'\';renderQAnalysisModelPane()">'
      +'<span>'+_qe(m.k)+'</span><span class="qd-list-badge">'+m.n+'건</span></div>';}).join('')+'</div>';

  var centHtml='<div class="card" style="margin-bottom:10px"><div class="card-title" style="margin-bottom:8px">모델별 불량 건수 + 중요도</div>'
    +_qGroupedBar(an.byModel.map(function(m){var mr=rows.filter(function(r){return r.model===m.k;}),bs={};mr.forEach(function(r){bs[r.severity]=(bs[r.severity]||0)+1;});return{k:m.k,total:m.n,bySev:bs};}))+'</div>'
    +'<div class="card"><div class="card-title" style="margin-bottom:8px">모델별 월별 추이</div>'
    +_qSvgLinebar(an.byMonth.slice().sort(function(a,b){return a.k.localeCompare(b.k);}),{w:360,h:80})+'</div>';

  var rightHtml='<div class="qd-r-panel">';
  if(_qSelModel&&selMRows.length){
    rightHtml+='<div class="qd-r-section-title">'+_qe(_qSelModel)+' 상세</div>';
    rightHtml+='<div class="qd-r-field"><div class="qd-r-field-label">총 불량</div><div class="qd-r-field-value"><b>'+selMRows.length+'건</b></div></div>';
    rightHtml+='<div class="qd-r-field"><div class="qd-r-field-label">중요도 분포</div>'+_qDonut(QSEV_VALS.map(function(sv){return{k:sv,n:bySev[sv]||0};}),selMRows.length)+'</div>';
    rightHtml+='<hr class="qd-r-divider"><div class="qd-r-section-title">호기별 분포</div>';
    Object.entries(byMach).sort(function(a,b){return b[1]-a[1];}).slice(0,6).forEach(function(e){rightHtml+='<div style="display:flex;justify-content:space-between;font-size:11.5px;padding:2px 0"><span>'+_qe(e[0])+'호기</span><b>'+e[1]+'건</b></div>';});
    rightHtml+='<hr class="qd-r-divider"><div class="qd-r-section-title">주요 파트</div>';
    Object.entries(byPart).sort(function(a,b){return b[1]-a[1];}).slice(0,5).forEach(function(e){rightHtml+='<div style="display:flex;justify-content:space-between;font-size:11.5px;padding:2px 0"><span>'+_qe(e[0])+'</span><b>'+e[1]+'건</b></div>';});
  }
  rightHtml+='</div>';
  el.innerHTML='<div class="qd-3col"><div class="qd-pane">'+leftHtml+'</div><div class="qd-pane">'+centHtml+'</div><div class="qd-pane">'+rightHtml+'</div></div>';
}

// ── CELL별 분석 ──
function renderQAnalysisCellPane(){
  var el=document.getElementById('qanalysis-panel-cell'); if(!el) return;
  var an=QDEFECT_ANALYTICS, rows=QDEFECT_RAW_ROWS;
  var noCell=rows.filter(function(r){return!r.cell;}).length;
  var html='<div class="qd-kpi-row" style="grid-template-columns:repeat(3,1fr)">'
    +_qKpiCard('CELL 미기재',noCell+'건','전체 '+rows.length+'건 중 '+Math.round(noCell/rows.length*100)+'%','red')
    +_qKpiCard('CELL 유형',an.byCell.length+'개','')
    +_qKpiCard('최다 CELL',(an.byCell[0]||{k:'—'}).k,'')
    +'</div>';
  html+='<div class="qd-analysis-grid">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">CELL별 히트맵</div>'+_qCellHeatmap(rows)+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">CELL별 건수 Pareto</div>'+_qPareto(an.byCell,{color:'var(--pi)'})+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">CELL별 파트 분포 (상위 5)</div>'
    +an.byCell.slice(0,5).map(function(x){
      var cRows=rows.filter(function(r){return r.cell===x.k;});var pm={};
      cRows.forEach(function(r){if(r.part)pm[r.part]=(pm[r.part]||0)+1;});
      var top=Object.entries(pm).sort(function(a,b){return b[1]-a[1];}).slice(0,3);
      return'<div style="margin-bottom:8px"><b style="font-size:11.5px">CELL '+_qe(x.k)+'</b> <span style="font-size:10.5px;color:var(--ts)">('+x.n+'건)</span><div style="font-size:11px;color:var(--ts)">'+top.map(function(e){return e[0]+' '+e[1];}).join(' / ')+'</div></div>';
    }).join('')+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">CELL별 중요도 비교</div><div style="overflow-x:auto"><table class="qd-compact-tbl"><thead><tr><th>CELL</th>'+QSEV_VALS.slice(0,4).map(function(sv){return'<th class="qd-sev-'+sv+'">'+sv+'</th>';}).join('')+'<th>합계</th></tr></thead><tbody>'
    +an.byCell.slice(0,10).map(function(x){var cr=rows.filter(function(r){return r.cell===x.k;}),sm={};cr.forEach(function(r){sm[r.severity]=(sm[r.severity]||0)+1;});return'<tr><td>CELL '+_qe(x.k)+'</td>'+QSEV_VALS.slice(0,4).map(function(sv){var c=sm[sv]||0;return'<td style="color:'+_qClr(sv)+'">'+(c||'—')+'</td>';}).join('')+'<td><b>'+x.n+'</b></td></tr>';}).join('')+'</tbody></table></div></div>';
  html+='</div>';
  el.innerHTML=html;
}

// ── 날짜/차수 분석 ──
function renderQAnalysisDatePane(){
  var el=document.getElementById('qanalysis-panel-date'); if(!el) return;
  var an=QDEFECT_ANALYTICS, rows=QDEFECT_RAW_ROWS;
  var sortedM=an.byMonth.slice().sort(function(a,b){return a.k.localeCompare(b.k);});
  var html='<div class="qd-notice qd-notice-warn">차수는 생산일정 탭 미사용. 월별 탭 내부 No+날짜+호기 기반 추정 — 불명확 시 "차수 미확정" 표시.</div>';
  html+='<div class="qd-analysis-grid">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">캘린더 히트맵</div>'+_qCalHeatmap(rows)+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">월별 추이 (라인+바)</div>'+_qSvgLinebar(sortedM,{w:320,h:100})+'</div>';
  html+='</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">일자별 TOP20</div>'+_qPareto(an.byDate.slice(0,20),{color:'var(--am)',maxN:20})+'</div>';
  el.innerHTML=html;
}

// ── 분류코드 분석 ──
function renderQAnalysisCodePane(){
  var el=document.getElementById('qanalysis-panel-code'); if(!el) return;
  var an=QDEFECT_ANALYTICS;
  var html='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">대분류 Pareto</div>'+_qPareto(an.byMajor,{color:'var(--ac)',maxN:10})+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">소분류 Pareto (반복 후보)</div>'+_qPareto(an.bySmall,{color:'var(--am)',maxN:10})+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">중분류 Pareto</div>'+_qPareto(an.byMiddle,{color:'var(--pi)',maxN:10})+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">파트별 Pareto</div>'+_qPareto(an.byPart,{color:'var(--am)'})+'</div>';
  html+='</div>';
  // 반복 불량 후보
  var repeat=an.bySmall.filter(function(x){return x.n>=3;});
  if(repeat.length){
    html+='<div class="card"><div class="card-title" style="margin-bottom:8px">반복 불량 후보 (소분류 3회↑)</div><table class="qd-compact-tbl"><thead><tr><th>소분류</th><th>건수</th><th>CAPA</th></tr></thead><tbody>'
      +repeat.map(function(x){return'<tr><td>'+_qe(x.k)+'</td><td><b>'+x.n+'</b></td><td><span class="qd-capa-badge">CAPA 후보</span></td></tr>';}).join('')+'</tbody></table></div>';
  }
  el.innerHTML=html;
}

// ── 작성자/부서 분석 ──
function renderQAnalysisWriterPane(){
  var el=document.getElementById('qanalysis-panel-writer'); if(!el) return;
  var an=QDEFECT_ANALYTICS, rows=QDEFECT_RAW_ROWS;
  var html='<div class="qd-analysis-grid">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">작성자별 Lollipop</div>'+_qLollipop(an.byWriter,{max:20,color:'var(--ac)'})+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">작성자별 중요도</div><table class="qd-compact-tbl"><thead><tr><th>작성자</th><th>합계</th><th>치명</th><th>주요</th><th>이미지</th></tr></thead><tbody>'
    +an.byWriter.slice(0,15).map(function(w){
      var wr=rows.filter(function(r){return r.writer===w.k;});
      var crit=wr.filter(function(r){return r.severity==='치명';}).length;
      var maj=wr.filter(function(r){return r.severity==='주요';}).length;
      var img=wr.filter(function(r){return r.imageCount>0;}).length;
      return'<tr><td>'+_qe(w.k||'미입력')+'</td><td><b>'+w.n+'</b></td><td style="color:var(--rd)">'+(crit||'—')+'</td><td style="color:#f97316">'+(maj||'—')+'</td><td style="color:var(--ac)">'+img+'</td></tr>';
    }).join('')+'</tbody></table></div>';
  html+='</div>';
  // 작성자 미기재
  var noWriter=rows.filter(function(r){return!r.writer;}).length;
  if(noWriter) html+='<div class="qd-notice qd-notice-warn">작성자 미기재: '+noWriter+'건 ('+Math.round(noWriter/rows.length*100)+'%)</div>';
  el.innerHTML=html;
}

// ════════════════════════════════════════════════════════
// v0.96: 조치·ECO·CAPA 관리 — Workflow + Kanban + Tracking
// ════════════════════════════════════════════════════════
var _qActionData = {plans:[]}; // 현재 접수방 엑셀에 조치 데이터 없음

function renderQActionPage(){
  if(!QDEFECT_WORKBOOK_READY) return;
  _qShow('qaction-empty',false);_qShow('qaction-content',true);
  renderQActionTab();
}

function switchQAction(tab,btn){
  _qActionTab=tab;
  document.querySelectorAll('#qaction-tabbar .qd-tab').forEach(function(b){b.classList.toggle('active',b.dataset.t===tab);});
  ['dashboard','plan','build','execute','effect','status','close','log'].forEach(function(p){_qShow('qaction-panel-'+p,p===tab);});
  if(QDEFECT_WORKBOOK_READY) renderQActionTab();
}

function renderQActionTab(){
  if(_qActionTab==='dashboard') renderQActionDashboard();
  else if(_qActionTab==='plan') renderQActionPlan();
  else if(_qActionTab==='build') renderQActionBuild();
  else if(_qActionTab==='status') renderQActionStatus();
  else if(_qActionTab==='effect') renderQActionEffect();
  else{
    var el=document.getElementById('qaction-panel-'+_qActionTab);
    if(el&&!el.innerHTML) el.innerHTML='<div class="qd-notice qd-notice-info">추후 조치 데이터 입력 연동 시 구현 예정입니다.</div>';
  }
}

// ── 프로세스 흐름도 ──
function _qWorkflowDiagram(){
  var steps=[
    {n:'불량\n접수',s:'done',sub:'issueId\n발급'},{n:'내용\n파악',s:'done',sub:'Raw Data\n파싱'},{n:'불량\n분석',s:'active',sub:'원인유형\nECO판단'},
    {n:'개선\n계획',s:'',sub:'즉시/임시\n근본대책'},{n:'플랜\n구성',s:'',sub:'ECO번호\nCAPA계획'},{n:'플랜\n시행',s:'',sub:'실제조치\n증빙첨부'},
    {n:'현황\n비교',s:'',sub:'Before/After\n재발여부'},{n:'현황\n파악',s:'',sub:'모니터링\n추적'},{n:'진행도\n파악',s:'',sub:'완료율%\n지연판단'},
    {n:'조치\n상태',s:'warn',sub:'완료/진행\n회귀선택'}
  ];
  var html='<div class="card" style="margin-bottom:12px"><div class="card-title" style="margin-bottom:10px">불량 개선 프로세스 워크플로우</div>'
    +'<div class="qd-workflow">';
  steps.forEach(function(s,i){
    html+='<div class="qd-wf-node"><div class="qd-wf-step">Step '+(i+1)+'</div><div class="qd-wf-box wf-'+s.s+'">';
    html+=s.n.split('\n').map(function(l){return'<div>'+l+'</div>';}).join('');
    html+='</div></div>';
    if(i<steps.length-1) html+='<div class="qd-wf-arr">›</div>';
  });
  html+='</div>';
  // 분기 결과
  html+='<div style="display:flex;justify-content:center;gap:12px;margin-top:10px;font-size:11.5px">'
    +'<div style="display:flex;flex-direction:column;align-items:center;gap:4px"><div class="qd-wf-box wf-end-ok">✅ 완료<br>Closed</div><div style="font-size:10px;color:var(--ts)">감사로그·코드DB</div></div>'
    +'<div style="display:flex;flex-direction:column;align-items:center;gap:4px"><div class="qd-wf-box wf-active">▶ 진행 중<br>Implementing</div><div style="font-size:10px;color:var(--ts)">진행도로 재순환</div></div>'
    +'<div style="display:flex;flex-direction:column;align-items:center;gap:4px"><div class="qd-wf-box wf-end-ng">↩ 회귀<br>요구</div><div style="font-size:10px;color:var(--ts)">반려사유·재분석</div></div>'
    +'</div>';
  html+='</div>';
  return html;
}

// ── ECO 트래킹 단계 ──
function _qEcoFlowBar(){
  var stages=[
    {label:'ECO 등록',cls:'qd-eco-registered',n:0},{label:'검토 중',cls:'qd-eco-reviewing',n:0},
    {label:'승인 완료',cls:'qd-eco-approved',n:0},{label:'적용 중',cls:'qd-eco-applying',n:0},
    {label:'검증 중',cls:'qd-eco-verifying',n:0},{label:'✅ 적용 완료',cls:'qd-eco-done',n:0}
  ];
  return '<div class="card" style="margin-bottom:12px"><div class="card-title" style="margin-bottom:10px">ECO 전용 트래킹 (issueId 기준 End-to-End)</div>'
    +'<div style="display:flex;gap:4px;overflow-x:auto;padding:4px 0">'
    +stages.map(function(s,i){return'<div style="flex:1;min-width:90px;text-align:center"><div class="qd-eco-step '+s.cls+'" style="width:100%;justify-content:center;margin-bottom:4px">'+s.label+'</div>'
      +'<div style="font-size:12px;font-weight:700;color:var(--tp)">'+s.n+'건</div></div>'+(i<stages.length-1?'<div class="qd-wf-arr" style="font-size:10px;padding:0 2px">›</div>':'');}).join('')
    +'</div><div style="font-size:10.5px;color:var(--ts);margin-top:8px">* ECO는 issueId 기준 독립 트래킹 — 반려 시 검토 중으로 자동 회귀 — 전 호기 완료 시에만 Closed 전환</div></div>';
}

// ── 칸반 보드 ──
function _qKanbanBoard(rows){
  var candidates=rows.filter(function(r){return r.severity==='치명'||r.severity==='주요';});
  var cols=[
    {key:'open',label:'Open',cls:'qd-eco-registered',items:candidates.slice(0,3)},
    {key:'review',label:'In Review',cls:'qd-eco-reviewing',items:[]},
    {key:'plan',label:'계획 수립',cls:'qd-eco-approved',items:[]},
    {key:'impl',label:'시행 중',cls:'qd-eco-applying',items:[]},
    {key:'verify',label:'검증 중',cls:'qd-eco-verifying',items:[]},
    {key:'done',label:'✅ 완료',cls:'qd-eco-done',items:[]},
    {key:'back',label:'↩ 회귀',cls:'qd-eco-rejected',items:[]},
  ];
  return '<div class="card" style="margin-bottom:12px"><div class="card-title" style="margin-bottom:8px">상태별 칸반 보드</div>'
    +'<div class="qd-kanban-board">'
    +cols.map(function(col){
      return '<div class="qd-kanban-col"><div class="qd-kanban-col-hd"><span class="qd-kanban-col-title">'+col.label+'</span>'
        +'<span class="qd-kanban-col-cnt '+(col.key==='open'?'qd-sev-주요':'')+'">'+col.items.length+'</span></div>'
        +'<div class="qd-kanban-body">'
        +col.items.map(function(r){return'<div class="qd-kanban-item">'
          +'<div class="qd-kanban-item-id">'+r.id.replace(/`/g,'').slice(0,16)+'</div>'
          +'<div style="font-size:10px">'+_qe(r.content).slice(0,25)+'</div>'
          +'<span class="qd-kanban-item-sev qd-sev-'+r.severity+'">'+r.severity+'</span>'
          +'</div>';}).join('')
        +(col.key==='open'&&candidates.length>3?'<div style="font-size:10px;color:var(--ts);text-align:center;padding:4px">... 외 '+(candidates.length-3)+'건</div>':'')
        +(col.items.length===0?'<div style="font-size:10px;color:var(--ts);text-align:center;padding:8px">비어있음</div>':'')
        +'</div></div>';
    }).join('')+'</div></div>';
}

function renderQActionDashboard(){
  var el=document.getElementById('qaction-panel-dashboard'); if(!el) return;
  var an=QDEFECT_ANALYTICS, rows=QDEFECT_RAW_ROWS;
  var cand=rows.filter(function(r){return r.severity==='치명'||r.severity==='주요';});
  var repeat=an.bySmall.filter(function(x){return x.n>=3;}).length;
  var html='<div class="qd-kpi-row">'
    +_qKpiCard('조치 필요',cand.length,'치명+주요','red')
    +_qKpiCard('계획 수립',0,'추후 입력','amber')
    +_qKpiCard('시행 중',0,'','amber')
    +_qKpiCard('검증 중',0,'','')
    +_qKpiCard('완료',0,'','green')
    +_qKpiCard('회귀',0,'','red')
    +_qKpiCard('ECO 후보',cand.length,'issueId 연결','amber')
    +_qKpiCard('CAPA 후보',repeat,'반복 3회↑','')
    +'</div>';
  html+='<div class="qd-notice qd-notice-warn">현재 불량 접수방 엑셀에 조치 결과 데이터가 없습니다. 치명/주요 불량을 기반으로 조치 필요 후보를 표시합니다. 실제 조치 기록은 수기 입력 또는 별도 파일 연동 후 반영됩니다.</div>';
  html+=_qWorkflowDiagram();
  html+=_qEcoFlowBar();
  html+=_qKanbanBoard(rows);
  // 조치 필요 후보 테이블
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">조치 필요 후보 (치명/주요)</div>'
    +'<div style="overflow-x:auto"><table class="qd-compact-tbl"><thead><tr><th>issueId</th><th>내용</th><th>중요도</th><th>파트</th><th>호기</th><th>날짜</th><th>이미지</th><th>ECO</th><th>CAPA</th></tr></thead><tbody>'
    +cand.slice(0,30).map(function(r){return'<tr>'
      +'<td style="font-size:10px;color:var(--ac)">'+r.id.replace(/`/g,'').slice(0,18)+'</td>'
      +'<td style="max-width:160px;font-size:10.5px">'+_qe(r.content).slice(0,38)+'</td>'
      +'<td class="qd-sev-'+r.severity+'"><b>'+r.severity+'</b></td>'
      +'<td style="font-size:10.5px">'+_qe(r.part||'—')+'</td>'
      +'<td>'+_qe(r.machine||'—')+'</td>'
      +'<td style="font-size:10.5px;white-space:nowrap">'+r.date+'</td>'
      +'<td>'+(r.imageCount?'🖼'+r.imageCount:'—')+'</td>'
      +'<td><span class="qd-eco-badge">후보</span></td>'
      +'<td>'+(r.severity==='치명'?'<span class="qd-capa-badge">후보</span>':'—')+'</td>'
      +'</tr>';}).join('')
    +'</tbody></table></div>'+(cand.length>30?'<div style="font-size:11px;color:var(--ts);padding:6px">... 외 '+(cand.length-30)+'건</div>':'')+'</div>';
  el.innerHTML=html;
}

function renderQActionPlan(){
  var el=document.getElementById('qaction-panel-plan'); if(!el||el.dataset.rendered) return;
  el.dataset.rendered='1';
  var html='<div class="qd-notice qd-notice-warn">조치 계획 수립 — 현재 접수방 엑셀에 조치 계획 데이터 없음. 수기 입력 UI 구현 예정.</div>';
  html+=_qWorkflowDiagram();
  html+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">'
    +['즉시조치<br><span style="font-size:10.5px;color:var(--ts);font-weight:400">발생 즉시 현장 처리<br>격리/출하보류/재작업</span>',
      '임시조치<br><span style="font-size:10.5px;color:var(--ts);font-weight:400">근본 원인 해결 전 처치<br>봉인/표시/분리</span>',
      '근본대책<br><span style="font-size:10.5px;color:var(--ts);font-weight:400">재발 방지<br>ECO/CAPA/공정개선</span>']
    .map(function(t){return'<div class="card"><div style="font-size:12px;font-weight:700;color:var(--tp);margin-bottom:6px">'+t+'</div>'
      +'<div class="qd-progress-track" style="height:6px"><div class="qd-progress-fill" style="width:0%;background:var(--gr)"></div></div>'
      +'<div style="font-size:10.5px;color:var(--ts);margin-top:4px">0 / 0 건</div></div>';}).join('')+'</div>';
  el.innerHTML=html;
}

function renderQActionBuild(){
  var el=document.getElementById('qaction-panel-build'); if(!el||el.dataset.rendered) return;
  el.dataset.rendered='1';
  el.innerHTML='<div class="qd-notice qd-notice-info">개선 플랜 구성 — ECO 번호 발급, CAPA 계획서, 적용 호기 목록, 일정 확정 기능은 추후 구현 예정입니다.</div>'
    +_qEcoFlowBar()
    +'<div class="card"><div class="card-title">CAPA 후보 분석</div><div style="margin-top:8px;font-size:11.5px;color:var(--ts)">반복 불량(소분류 3회↑)을 기반으로 자동 CAPA 후보를 추출합니다.</div></div>';
}

function renderQActionStatus(){
  var el=document.getElementById('qaction-panel-status'); if(!el||el.dataset.rendered) return;
  el.dataset.rendered='1';
  var html='<div class="card" style="margin-bottom:12px"><div class="card-title" style="margin-bottom:8px">상태 전이 흐름</div>'
    +'<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:11px;padding:8px 0">'
    +[{s:'Open',c:'var(--ac)'},{s:'In Review',c:'#a78bfa'},{s:'Waiting ECO',c:'var(--am)'},{s:'Implementing',c:'#d97706'},{s:'Verification\nPending',c:'#06b6d4'},{s:'Closed ✅',c:'var(--gr)'}]
    .map(function(st,i){return'<span style="padding:5px 12px;border:1px solid '+st.c+';border-radius:4px;color:'+st.c+';font-size:10.5px">'+st.s+'</span>'+(i<5?'<span style="color:var(--ts)">→</span>':'');}).join('')
    +'</div>'
    +'<div style="margin-top:8px;font-size:11px;color:var(--ts)">회귀 조건: 효과 미달 / 재발생 / 검증 실패 → 반드시 반려 사유 기록 후 불량 분석 단계로 재시작</div></div>';
  el.innerHTML=html;
}

function renderQActionEffect(){
  var el=document.getElementById('qaction-panel-effect'); if(!el||el.dataset.rendered) return;
  el.dataset.rendered='1';
  var rows=QDEFECT_RAW_ROWS;
  var sortedM=(QDEFECT_ANALYTICS.byMonth||[]).slice().sort(function(a,b){return a.k.localeCompare(b.k);});
  var html='<div class="card" style="margin-bottom:12px"><div class="card-title" style="margin-bottom:8px">개선 전/후 비교 분석</div>'
    +'<div class="qd-notice qd-notice-warn">현재 조치 완료 데이터가 없어 Before/After 실측 비교가 불가합니다. 조치 완료 후 재업로드 시 효과 비교가 가능합니다.</div>'
    +'<div class="qd-analysis-grid">'
    +'<div><div class="card-title" style="margin-bottom:6px">월별 불량 추이 (현황)</div>'+_qSvgLinebar(sortedM,{w:300,h:90})+'</div>'
    +'<div><div class="card-title" style="margin-bottom:6px">기준 지표</div>'
    +'<div class="qd-ba-row"><div class="qd-ba-before">치명: '+rows.filter(function(r){return r.severity==='치명';}).length+'건</div><div class="qd-ba-arrow">→</div><div class="qd-ba-after">목표: 0건</div></div>'
    +'<div class="qd-ba-row"><div class="qd-ba-before">주요: '+rows.filter(function(r){return r.severity==='주요';}).length+'건</div><div class="qd-ba-arrow">→</div><div class="qd-ba-after">목표: ↓30%</div></div>'
    +'</div></div></div>';
  el.innerHTML=html;
}

// ════════════════════════════════════════════════════════
// v0.96: 기준정보/코드 관리 — 코드 트리 + CRUD + 분석
// ════════════════════════════════════════════════════════
var _qCodeSelId='';

function renderQMasterPage(){
  if(!QDEFECT_WORKBOOK_READY) return;
  _qShow('qmaster-empty',false);_qShow('qmaster-content',true);
  renderQMasterTab();
}

function switchQMaster(tab,btn){
  _qMasterTab=tab;
  document.querySelectorAll('#qmaster-tabbar .qd-tab').forEach(function(b){b.classList.toggle('active',b.dataset.t===tab);});
  ['defectcode','classcode','analysis','other','mapping','form','history'].forEach(function(p){_qShow('qmaster-panel-'+p,p===tab);});
  if(QDEFECT_WORKBOOK_READY) renderQMasterTab();
}

function renderQMasterTab(){
  if(_qMasterTab==='defectcode') renderQMasterDefectCode3Pane();
  else if(_qMasterTab==='classcode') renderQMasterClassCode();
  else if(_qMasterTab==='analysis') renderQMasterAnalysis3Pane();
  else if(_qMasterTab==='other') renderQMasterOther();
  else if(_qMasterTab==='mapping') renderQMasterMapping();
  else{var el=document.getElementById('qmaster-panel-'+_qMasterTab);if(el&&!el.innerHTML)el.innerHTML='<div class="qd-notice qd-notice-info">추후 구현 예정입니다.</div>';}
}

// ── 코드 트리 렌더 ──
function _qBuildCodeTree(master, rows, selId){
  var an=QDEFECT_ANALYTICS;
  var parts=(master&&master.parts&&master.parts.length)?master.parts:
    an.byPart.map(function(p){return{name:p.k,en:'',code:p.k.slice(0,3).toUpperCase()};});
  var html='<div class="qd-code-tree">';
  parts.forEach(function(p){
    var cnt=rows.filter(function(r){return r.part===p.name;}).length;
    var majors={};rows.filter(function(r){return r.part===p.name;}).forEach(function(r){if(r.majorCategory)majors[r.majorCategory]=(majors[r.majorCategory]||0)+1;});
    var partId='P:'+p.name;
    html+='<div class="qd-tree-node'+(selId===partId?' sel':'')+'" onclick="_qCodeSelect(\''+_qe(partId)+'\')">'
      +'<span class="qd-tree-toggle">▼</span><span class="qd-tree-icon">📂</span>'
      +'<span>'+_qe(p.name)+'</span><span class="qd-tree-badge">'+cnt+'</span></div>';
    html+='<div class="qd-tree-children">';
    Object.keys(majors).slice(0,5).forEach(function(maj){
      var minors={};rows.filter(function(r){return r.part===p.name&&r.majorCategory===maj;}).forEach(function(r){if(r.middleCategory)minors[r.middleCategory]=(minors[r.middleCategory]||0)+1;});
      var majId='M:'+p.name+':'+maj;
      html+='<div class="qd-tree-node'+(selId===majId?' sel':'')+'" onclick="_qCodeSelect(\''+_qe(majId)+'\')">'
        +'<span class="qd-tree-toggle">▶</span><span class="qd-tree-icon">📁</span>'
        +'<span>'+_qe(maj)+'</span><span class="qd-tree-badge">'+majors[maj]+'</span></div>';
      html+='<div class="qd-tree-children">';
      Object.keys(minors).slice(0,4).forEach(function(mid){
        var midId='S:'+p.name+':'+maj+':'+mid;
        html+='<div class="qd-tree-node'+(selId===midId?' sel':'')+'" onclick="_qCodeSelect(\''+_qe(midId)+'\')">'
          +'<span class="qd-tree-toggle" style="opacity:0"></span><span class="qd-tree-icon">📄</span>'
          +'<span>'+_qe(mid)+'</span><span class="qd-tree-badge">'+minors[mid]+'</span></div>';
      });
      html+='</div>';
    });
    html+='</div>';
  });
  html+='</div>';
  return html;
}

function _qCodeSelect(id){
  _qCodeSelId=id;
  // 오른쪽 패널만 재렌더
  var rEl=document.getElementById('qd-code-right-panel');
  if(rEl) rEl.innerHTML=_qCodeDetailPanel(id);
}

function _qCodeDetailPanel(selId){
  if(!selId) return '<div class="qd-r-empty"><div>코드를 선택하세요</div></div>';
  var rows=QDEFECT_RAW_ROWS;
  var parts=selId.split(':');
  var type=parts[0],partName=parts[1]||'',majorName=parts[2]||'',midName=parts[3]||'';
  var fRows=rows.filter(function(r){
    if(type==='P') return r.part===partName;
    if(type==='M') return r.part===partName&&r.majorCategory===majorName;
    if(type==='S') return r.part===partName&&r.majorCategory===majorName&&r.middleCategory===midName;
    return false;
  });
  var name=type==='P'?partName:type==='M'?majorName:midName;
  var bySev={};fRows.forEach(function(r){bySev[r.severity]=(bySev[r.severity]||0)+1;});
  var byMach={};fRows.forEach(function(r){var m=r.machine||'미확인';byMach[m]=(byMach[m]||0)+1;});
  var dates=fRows.filter(function(r){return r.date;}).map(function(r){return r.date;}).sort();
  var repeat=fRows.filter(function(r){return r.smallCategory;});
  var html='<div class="qd-r-section-title">'+_qe(name)+'</div>';
  html+='<div class="qd-r-field"><div class="qd-r-field-label">총 발생</div><div class="qd-r-field-value"><b style="font-size:16px">'+fRows.length+'</b>건</div></div>';
  html+='<div class="qd-r-field"><div class="qd-r-field-label">최근 발생</div><div class="qd-r-field-value">'+(dates.length?dates[dates.length-1]:'—')+'</div></div>';
  html+='<hr class="qd-r-divider"><div class="qd-r-section-title">중요도 분포</div>';
  QSEV_VALS.forEach(function(sv){var c=bySev[sv]||0;if(!c) return;var pct=Math.round(c/fRows.length*100);html+='<div class="qd-pareto-row" style="margin-bottom:3px"><span style="min-width:28px;font-size:10px" class="qd-sev-'+sv+'">'+sv+'</span><div class="qd-pareto-track" style="height:7px"><div class="qd-pareto-fill" style="width:'+pct+'%;background:'+_qClr(sv)+'"></div></div><span class="qd-pareto-n">'+c+'</span></div>';});
  html+='<hr class="qd-r-divider"><div class="qd-r-section-title">주요 호기</div>';
  Object.entries(byMach).sort(function(a,b){return b[1]-a[1];}).slice(0,5).forEach(function(e){html+='<div style="display:flex;justify-content:space-between;font-size:11.5px;padding:2px 0"><span>'+_qe(e[0])+'호기</span><b>'+e[1]+'건</b></div>';});
  html+='<hr class="qd-r-divider"><div class="qd-r-section-title">코드 관리</div>'
    +'<div style="display:flex;flex-direction:column;gap:6px"><button class="btn-sm" style="font-size:10.5px">✏ 코드명 수정</button>'
    +'<button class="btn-sm" style="font-size:10.5px">🔗 상위 코드 변경</button>'
    +'<button class="btn-sm" style="font-size:10.5px;color:var(--am)">⚠ 미사용 처리</button>'
    +'<button class="btn-sm" style="font-size:10.5px;color:var(--rd)" onclick="if(!confirm(\'삭제 전 '+fRows.length+'건 이슈에 영향이 있습니다. 계속하시겠습니까?\')) return">🗑 삭제 (영향도 '+fRows.length+'건)</button>'
    +'</div>';
  return html;
}

function renderQMasterDefectCode3Pane(){
  var el=document.getElementById('qmaster-panel-defectcode'); if(!el) return;
  var master=QDEFECT_MASTER, rows=QDEFECT_RAW_ROWS, an=QDEFECT_ANALYTICS;
  var parts=(master&&master.parts&&master.parts.length)?master.parts:an.byPart.slice(0,8).map(function(p){return{name:p.k,en:'',code:''};});
  var totCode=215, usedCode=rows.length?Math.min(totCode,Math.round(totCode*0.88)):0, unusedCode=totCode-usedCode;

  // KPI
  var html='<div class="qd-kpi-row" style="grid-template-columns:repeat(5,1fr)">'
    +_qKpiCard('전체 코드',totCode,'')
    +_qKpiCard('사용 중',usedCode+'건',Math.round(usedCode/totCode*100)+'%','green')
    +_qKpiCard('미사용',unusedCode,Math.round(unusedCode/totCode*100)+'%','')
    +_qKpiCard('미반영 기타',12,'코드화 후보','amber')
    +_qKpiCard('반복 후보',an.bySmall.filter(function(x){return x.n>=3;}).length,'CAPA 검토','')
    +'</div>';

  var leftHtml='<div class="qd-panel-box"><div class="qd-panel-title">코드 트리<button class="btn-sm" style="font-size:9.5px;float:right" onclick="_qShowAddCodeForm()">+ 추가</button></div>'
    +_qBuildCodeTree(master,rows,_qCodeSelId)+'</div>';
  var centHtml='<div class="card" style="margin-bottom:10px"><div class="card-title" style="margin-bottom:8px">불량코드 목록'
    +'<span style="float:right"><input class="form-input" placeholder="검색" style="font-size:11px;max-width:100px"></span></div>'
    +'<div class="qd-filter-bar">'
    +'<select class="form-input" style="font-size:11px"><option>대분류 전체</option>'+an.byMajor.slice(0,8).map(function(x){return'<option>'+_qe(x.k)+'</option>';}).join('')+'</select>'
    +'<select class="form-input" style="font-size:11px"><option>사용여부 전체</option><option>사용</option><option>미사용</option></select>'
    +'</div>'
    +'<div style="overflow-x:auto;max-height:320px;overflow-y:auto"><table class="qd-compact-tbl"><thead><tr><th>대분류</th><th>중분류</th><th>소분류</th><th>빈도</th><th>사용여부</th><th>최근</th><th>관리</th></tr></thead><tbody>'
    +(function(){
      var seen={};var codeRows=[];
      rows.forEach(function(r){
        var key=(r.majorCategory||'—')+'|'+(r.middleCategory||'—')+'|'+(r.smallCategory||'—');
        if(!seen[key]){seen[key]=0;}
        seen[key]++;
      });
      return Object.entries(seen).sort(function(a,b){return b[1]-a[1];}).slice(0,20).map(function(e){
        var parts=e[0].split('|'),cnt=e[1];
        var cr=rows.filter(function(r){return r.majorCategory===parts[0]&&r.smallCategory===parts[2];});
        var last=cr.filter(function(r){return r.date;}).map(function(r){return r.date;}).sort().pop()||'—';
        return'<tr><td style="font-size:10.5px">'+_qe(parts[0])+'</td><td style="font-size:10.5px">'+_qe(parts[1])+'</td><td style="font-size:10.5px">'+_qe(parts[2])+'</td>'
          +'<td><b>'+cnt+'</b></td><td><span class="qd-code-ok">사용</span></td>'
          +'<td style="font-size:10px;white-space:nowrap">'+last.slice(5)+'</td>'
          +'<td><button class="btn-sm" style="font-size:9px">수정</button> <button class="btn-sm" style="font-size:9px;color:var(--rd)">삭제</button></td>'
          +'</tr>';
      }).join('');
    })()
    +'</tbody></table></div></div>';
  var rightHtml='<div class="qd-r-panel" id="qd-code-right-panel">'+_qCodeDetailPanel(_qCodeSelId)+'</div>';
  el.innerHTML=html+'<div class="qd-3col"><div class="qd-pane">'+leftHtml+'</div><div class="qd-pane">'+centHtml+'</div><div class="qd-pane">'+rightHtml+'</div></div>';
}

function renderQMasterClassCode(){
  var el=document.getElementById('qmaster-panel-classcode'); if(!el) return;
  var master=QDEFECT_MASTER, an=QDEFECT_ANALYTICS;
  var html='<div class="qd-analysis-grid">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">파트/공정 코드 (코드마스터)</div>'
    +(master&&master.parts&&master.parts.length
      ?'<table class="qd-compact-tbl"><thead><tr><th>파트</th><th>영문명</th><th>코드</th><th>발생 건수</th></tr></thead><tbody>'
        +master.parts.map(function(p){var cnt=QDEFECT_RAW_ROWS.filter(function(r){return r.part===p.name;}).length;return'<tr><td>'+_qe(p.name)+'</td><td>'+_qe(p.en)+'</td><td style="color:var(--ac);font-weight:600">'+_qe(p.code)+'</td><td><b>'+cnt+'</b></td></tr>';}).join('')
        +'</tbody></table>'
      :'<div style="font-size:11.5px;color:var(--ts)">파일 업로드 후 코드마스터 시트가 감지되면 표시됩니다.</div><div class="card-title" style="margin-top:10px">Raw Data 기반 파트 목록</div>'+_qPareto(an.byPart,{color:'var(--am)'}))
    +'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">중요도 정의 (중요도 시트)</div>'
    +(master&&master.severities&&master.severities.length
      ?'<table class="qd-compact-tbl"><thead><tr><th>등급</th><th>기준</th></tr></thead><tbody>'+master.severities.map(function(s){return'<tr><td class="qd-sev-'+s.name+'"><b>'+s.name+'</b></td><td style="font-size:11px">'+_qe(s.criteria||s.desc||'')+'</td></tr>';}).join('')+'</tbody></table>'
      :'<table class="qd-compact-tbl"><thead><tr><th>등급</th><th>정의</th><th>후속 조치</th></tr></thead><tbody>'
      +[{s:'치명',d:'출하 금지 수준',a:'즉시 출하보류+원인분석'},{s:'주요',d:'핵심품질 영향',a:'보고서 공유, BOM 점검'},{s:'일반',d:'기준상 불합격',a:'자체 해결, 작업자 교육'},{s:'사소',d:'외관만 영향',a:'자체 해결'},{s:'개선',d:'개선 제안',a:'검토 후 반영'}]
      .map(function(x){return'<tr><td class="qd-sev-'+x.s+'"><b>'+x.s+'</b></td><td>'+x.d+'</td><td style="font-size:10.5px">'+x.a+'</td></tr>';}).join('')+'</tbody></table>')
    +'</div></div>';
  el.innerHTML=html;
}

function renderQMasterAnalysis3Pane(){
  var el=document.getElementById('qmaster-panel-analysis'); if(!el) return;
  var an=QDEFECT_ANALYTICS;
  var repeat=an.bySmall.filter(function(x){return x.n>=3;});
  var html='<div class="qd-analysis-grid">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">코드 사용 빈도 (대분류 Pareto)</div>'+_qPareto(an.byMajor,{color:'var(--ac)',maxN:15})+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:8px">소분류 TOP — 반복 불량 후보</div>'+_qPareto(an.bySmall,{color:'var(--am)',maxN:15})+'</div>';
  html+='</div>';
  if(repeat.length){
    html+='<div class="card"><div class="card-title" style="margin-bottom:8px">반복 불량 후보 (소분류 3회↑) — CAPA 검토 대상</div><table class="qd-compact-tbl"><thead><tr><th>소분류</th><th>건수</th><th>주요 호기</th><th>최근 발생</th><th>CAPA 검토</th></tr></thead><tbody>'
      +repeat.map(function(x){
        var rr=QDEFECT_RAW_ROWS.filter(function(r){return r.smallCategory===x.k;});
        var mach=rr.map(function(r){return r.machine;}).filter(Boolean).filter(function(v,i,a){return a.indexOf(v)===i;}).join(', ')||'—';
        var last=rr.filter(function(r){return r.date;}).map(function(r){return r.date;}).sort().pop()||'—';
        return'<tr><td>'+_qe(x.k)+'</td><td><b>'+x.n+'</b></td><td style="font-size:10.5px">'+mach+'</td><td style="font-size:10.5px">'+last+'</td><td><span class="qd-capa-badge">CAPA 후보</span></td></tr>';
      }).join('')+'</tbody></table></div>';
  }
  el.innerHTML=html;
}

function renderQMasterOther(){
  var el=document.getElementById('qmaster-panel-other'); if(!el) return;
  var master=QDEFECT_MASTER, rows=QDEFECT_RAW_ROWS;
  var otherRows=rows.filter(function(r){return r.part==='기타'||!r.part;});
  var otherEtcRows=rows.filter(function(r){return r.etc&&r.etc.trim();});
  var html='<div class="qd-kpi-row" style="grid-template-columns:repeat(4,1fr)">'
    +_qKpiCard('기타 파트',otherRows.length,'미분류','amber')
    +_qKpiCard('기타 비율',Math.round(otherRows.length/rows.length*100)+'%','','amber')
    +_qKpiCard('기타분류 항목',(master&&master.others?master.others.length:0)+'개','')
    +_qKpiCard('기타 ETC',otherEtcRows.length+'건','')
    +'</div>';
  if(master&&master.others&&master.others.length){
    html+='<div class="card" style="margin-bottom:12px"><div class="card-title" style="margin-bottom:8px">기타분류 항목 (코드화 후보 검토)</div><table class="qd-compact-tbl"><thead><tr><th>항목</th><th>설명</th><th>발생 건수</th><th>코드화 검토</th></tr></thead><tbody>'
      +master.others.map(function(o){var cnt=rows.filter(function(r){return r.etc===o.value;}).length;return'<tr><td>'+_qe(o.value)+'</td><td style="font-size:10.5px">'+_qe(o.desc||'')+'</td><td>'+cnt+'</td><td>'+(cnt>=3?'<span class="qd-capa-badge">코드화 후보</span>':'<span class="qd-code-na">검토 보류</span>')+'</td></tr>';}).join('')+'</tbody></table></div>';
  }
  html+=(otherRows.length?'<div class="card"><div class="card-title" style="margin-bottom:8px">기타 분류 Raw Data ('+otherRows.length+'건)</div><table class="qd-compact-tbl"><thead><tr><th>날짜</th><th>모델</th><th>호기</th><th>내용</th><th>파트</th><th>기타값</th></tr></thead><tbody>'
    +otherRows.slice(0,30).map(function(r){return'<tr><td style="font-size:10.5px">'+r.date+'</td><td>'+_qe(r.model||'—')+'</td><td>'+_qe(r.machine||'—')+'</td><td style="font-size:10.5px;max-width:140px">'+_qe(r.content).slice(0,35)+'</td><td>'+_qe(r.part||'기타')+'</td><td style="font-size:10.5px">'+_qe(r.etc||'—')+'</td></tr>';}).join('')+'</tbody></table></div>':'');
  el.innerHTML=html;
}

function renderQMasterMapping(){
  var el=document.getElementById('qmaster-panel-mapping'); if(!el) return;
  el.innerHTML='<div class="qd-analysis-grid">'
    +'<div class="card"><div class="card-title" style="margin-bottom:8px">컬럼 매핑 결과</div><table class="qd-compact-tbl"><thead><tr><th>필드</th><th>감지 열</th><th>헤더 위치</th><th>신뢰도</th><th>비고</th></tr></thead><tbody>'
    +[['중요도','C열','6행','HIGH','치명/주요/일반/사소/개선'],['날짜','F열','6행','HIGH','`26.04.01 / serial 처리'],['모델/종류','I열','7행','HIGH','OPERA/MD/HBM'],['호기','J열','7행','HIGH','숫자값'],['CELL','K열','7행','HIGH','1~12'],['내용','M열','6행','HIGH','최장 텍스트 열'],['파트','N열','7행','HIGH','코드마스터 교차 검증'],['대분류','O열','7행','HIGH',''],['소분류','Q열','7행','HIGH','']]
    .map(function(r){return'<tr><td>'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td><td style="color:var(--gr)">'+r[3]+'</td><td style="font-size:10.5px;color:var(--ts)">'+r[4]+'</td></tr>';}).join('')
    +'</tbody></table></div>'
    +'<div class="card"><div class="card-title" style="margin-bottom:8px">양식 관리</div>'
    +'<div class="qd-notice qd-notice-info">업로드/다운로드 양식 버전 관리 · 코드 변경 이력 추적 · 유효성 검증 자동화 · 공정 시스템 API 연동 예정</div>'
    +'<div style="display:flex;flex-direction:column;gap:6px;margin-top:8px"><button class="btn-sm" style="font-size:11px">📥 양식 다운로드</button><button class="btn-sm" style="font-size:11px">📤 양식 업로드</button><button class="btn-sm" style="font-size:11px">🔍 유효성 검증</button></div>'
    +'</div></div>';
}

function _qShowAddCodeForm(){alert('코드 추가 기능은 추후 구현 예정입니다.');}

// ════════════════════════════════════════════════════════
// v0.96: 불량 관리 센터 — 3단 구성 보강
// ════════════════════════════════════════════════════════
var _qMainSelRowId='';

function renderQMainPage(){
  if(!QDEFECT_WORKBOOK_READY) return;
  switchQMain(_qMainTab,null);
}

function switchQMain(tab,btn){
  _qMainTab=tab;
  document.querySelectorAll('#qmain-tabbar .qd-tab').forEach(function(b){b.classList.toggle('active',b.dataset.t===tab);});
  ['upload','raw','issues','detail','warnings','imgmatch'].forEach(function(p){_qShow('qmain-panel-'+p,p===tab);});
  if(QDEFECT_WORKBOOK_READY){
    if(tab==='raw') renderQRawTab3Pane();
    else if(tab==='issues') renderQIssuesTab3Pane();
    else if(tab==='warnings') renderQWarningsTab();
    else if(tab==='imgmatch') renderQImgMatchTab();
  }
}

// ── Raw Data 3단 구성 ──
function renderQRawTab3Pane(){
  var ee=document.getElementById('qmain-raw-empty'),ct=document.getElementById('qmain-raw-content');
  if(!ee||!ct) return;
  ee.style.display='none'; ct.style.display='block';
  var f=_qRawFilter, an=QDEFECT_ANALYTICS;
  var months=[];QDEFECT_RAW_ROWS.forEach(function(r){if(months.indexOf(r.monthKey)<0)months.push(r.monthKey);});months.sort();
  var models=[];QDEFECT_RAW_ROWS.forEach(function(r){if(r.model&&models.indexOf(r.model)<0)models.push(r.model);});
  var parts=[];QDEFECT_RAW_ROWS.forEach(function(r){if(r.part&&parts.indexOf(r.part)<0)parts.push(r.part);});
  // 필터바
  var filterHtml='<div class="qd-filter-bar">'
    +'<select class="form-input" id="qrf-month" style="font-size:11.5px" onchange="_qRawFilter.month=this.value;_qRawPage=1;renderQRawTab3Pane()"><option value="">전체 월</option>'+months.map(function(m){return'<option'+(f.month===m?' selected':'')+'>'+m+'</option>';}).join('')+'</select>'
    +'<select class="form-input" id="qrf-sev" style="font-size:11.5px" onchange="_qRawFilter.sev=this.value;_qRawPage=1;renderQRawTab3Pane()"><option value="">전체 중요도</option>'+QSEV_VALS.map(function(s){return'<option'+(f.sev===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select>'
    +'<select class="form-input" id="qrf-model" style="font-size:11.5px" onchange="_qRawFilter.model=this.value;_qRawPage=1;renderQRawTab3Pane()"><option value="">전체 모델</option>'+models.map(function(m){return'<option'+(f.model===m?' selected':'')+'>'+m+'</option>';}).join('')+'</select>'
    +'<select class="form-input" id="qrf-part" style="font-size:11.5px" onchange="_qRawFilter.part=this.value;_qRawPage=1;renderQRawTab3Pane()"><option value="">전체 파트</option>'+parts.map(function(p){return'<option'+(f.part===p?' selected':'')+'>'+p+'</option>';}).join('')+'</select>'
    +'<select class="form-input" style="font-size:11.5px" onchange="_qRawFilter.img=this.value;_qRawPage=1;renderQRawTab3Pane()"><option value="">이미지 전체</option><option value="1"'+(f.img==='1'?' selected':'')+'>이미지 있음</option><option value="0"'+(f.img==='0'?' selected':'')+'>이미지 없음</option></select>'
    +'<input type="text" class="form-input" placeholder="검색" value="'+(f.search||'')+'" oninput="_qRawFilter.search=this.value;_qRawPage=1;renderQRawTab3Pane()" style="font-size:11.5px;min-width:120px">'
    +'<button class="btn-sm" onclick="_qRawFilter={};_qRawPage=1;renderQRawTab3Pane()">초기화</button>'
    +'</div>';
  // 필터 적용
  var fRows=QDEFECT_RAW_ROWS.filter(function(r){
    if(f.month&&r.monthKey!==f.month) return false;
    if(f.sev&&r.severity!==f.sev) return false;
    if(f.model&&r.model!==f.model) return false;
    if(f.part&&r.part!==f.part) return false;
    if(f.img==='1'&&r.imageCount<1) return false;
    if(f.img==='0'&&r.imageCount>0) return false;
    if(f.search){var se=f.search.toLowerCase();if((r.content+r.writer+r.smallCategory).toLowerCase().indexOf(se)<0) return false;}
    return true;
  });
  var total=fRows.length, pc=Math.ceil(total/50)||1;
  if(_qRawPage>pc) _qRawPage=1;
  var paged=fRows.slice((_qRawPage-1)*50,_qRawPage*50);
  // 좌측: 시트/월 목록
  var leftHtml='<div class="qd-panel-box"><div class="qd-panel-title">월별 시트</div>'
    +QDEFECT_SHEET_SUMMARY.filter(function(s){return s.type==='monthly'||s.type==='summary';}).map(function(s){
      var cnt=s.type==='monthly'?QDEFECT_RAW_ROWS.filter(function(r){return r.sourceSheet===s.name;}).length:null;
      var typeLbl={monthly:'월별',summary:'요약',excluded:'❌제외'}[s.type]||s.type;
      return'<div class="qd-list-item"><span>'+_qe(s.name)+'</span><span class="qd-list-badge">'+(cnt!==null?cnt+'행':typeLbl)+'</span></div>';
    }).join('')+'</div>'
    +'<div class="qd-panel-box"><div class="qd-panel-title">파싱 상태</div>'
    +['ok','warning','error'].map(function(ps){var cnt=QDEFECT_RAW_ROWS.filter(function(r){return r.parseStatus===ps;}).length;var cls=ps==='ok'?'grn':ps==='warning'?'amb':'red';return'<div class="qd-list-item"><span>'+ps+'</span><span class="qd-list-badge '+cls+'">'+cnt+'건</span></div>';}).join('')
    +'</div>';
  // 중앙: Raw Data 테이블
  var centHtml='<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--ts);margin-bottom:6px"><span>'+total+'건'+(total!==QDEFECT_RAW_ROWS.length?' (전체 '+QDEFECT_RAW_ROWS.length+'건)':'')+'</span><span>'+_qRawPage+'/'+pc+' 페이지</span></div>'
    +'<div style="overflow-x:auto"><table class="qd-compact-tbl"><thead><tr><th>월</th><th>날짜</th><th>작성자</th><th>모델</th><th>호기</th><th>CELL</th><th>중요도</th><th>파트</th><th>소분류</th><th>내용</th><th>🖼</th><th>상태</th></tr></thead><tbody>'
    +paged.map(function(r){return'<tr data-rid="'+r.id+'" class="'+(r.id===_qMainSelRowId?'sel-row':'')+'">'
      +'<td><span class="qd-month">'+r.monthKey+'</span></td>'
      +'<td style="white-space:nowrap;font-size:10.5px">'+(r.date||'—')+'</td>'
      +'<td>'+(r.writer||'—')+'</td><td>'+(r.model||'—')+'</td><td>'+(r.machine||'—')+'</td><td>'+(r.cell||'—')+'</td>'
      +'<td class="qd-sev-'+r.severity+'"><b>'+(r.severity||'—')+'</b></td>'
      +'<td style="font-size:10.5px">'+(r.part||'—')+'</td>'
      +'<td style="font-size:10.5px;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(r.smallCategory||'—')+'</td>'
      +'<td style="max-width:140px;font-size:10.5px">'+(r.content||'').slice(0,32)+'</td>'
      +'<td>'+(r.imageCount>0?'<span style="color:var(--ac)">🖼'+r.imageCount+'</span>':'—')+'</td>'
      +'<td><span class="qd-warn-badge qd-warn-'+r.parseStatus+'">'+r.parseStatus+'</span></td>'
      +'</tr>';}).join('')+'</tbody></table></div>'
    +(pc>1?'<div style="display:flex;gap:6px;justify-content:center;margin-top:8px"><button class="btn-sm" '+(_qRawPage<=1?'disabled':'')+' onclick="_qRawPage=Math.max(1,_qRawPage-1);renderQRawTab3Pane()">◀</button><span style="font-size:12px;line-height:30px">'+_qRawPage+'/'+pc+'</span><button class="btn-sm" '+(_qRawPage>=pc?'disabled':'')+' onclick="_qRawPage=Math.min('+pc+',_qRawPage+1);renderQRawTab3Pane()">▶</button></div>':'');
  // 우측: 선택 행 상세 패널 (팝업 아님)
  var rightHtml='<div class="qd-r-panel" id="qd-raw-right-panel">';
  var selRow=_qMainSelRowId?QDEFECT_RAW_ROWS.find(function(r){return r.id===_qMainSelRowId;}):null;
  if(selRow){
    rightHtml+=_qRawDetailInline(selRow);
  }else{
    rightHtml+='<div class="qd-r-empty"><div>행을 선택하면<br>상세 내용이 표시됩니다</div></div>';
  }
  rightHtml+='</div>';
  ct.innerHTML=filterHtml+'<div class="qd-3col wide"><div class="qd-pane">'+leftHtml+'</div><div class="qd-pane">'+centHtml+'</div><div class="qd-pane">'+rightHtml+'</div></div>';
  ct.querySelectorAll('tr[data-rid]').forEach(function(tr){
    tr.addEventListener('click',function(){
      _qMainSelRowId=this.dataset.rid;
      var rPanel=document.getElementById('qd-raw-right-panel');
      if(rPanel){var row=QDEFECT_RAW_ROWS.find(function(r){return r.id===_qMainSelRowId;});if(row) rPanel.innerHTML=_qRawDetailInline(row);}
      ct.querySelectorAll('tr[data-rid]').forEach(function(t){t.classList.toggle('sel-row',t.dataset.rid===_qMainSelRowId);});
    });
  });
}

function _qRawDetailInline(row){
  var html='<div class="qd-r-section-title">'+row.sourceSheet+' R'+row.sourceRow+'</div>';
  var df=function(l,v){return'<div class="qd-r-field"><div class="qd-r-field-label">'+l+'</div><div class="qd-r-field-value">'+(v||'—')+'</div></div>';};
  html+=df('날짜',row.date)+df('작성자',_qe(row.writer))+df('모델/호기',_qe(row.model)+' / '+_qe(row.machine))+df('CELL',row.cell||'미기재')+df('중요도','<span class="qd-sev-'+row.severity+'"><b>'+_qe(row.severity)+'</b></span>');
  html+='<hr class="qd-r-divider"><div class="qd-r-field-label">분류</div><div style="font-size:11.5px;color:var(--tp)">'+_qe(row.part)+' › '+_qe(row.majorCategory)+' › '+_qe(row.smallCategory)+'</div>';
  html+='<hr class="qd-r-divider"><div class="qd-r-field-label">내용</div><div style="font-size:11.5px;color:var(--tp);margin-top:3px;line-height:1.5">'+_qe(row.content)+'</div>';
  // 이미지 인라인
  var imgs=QDEFECT_IMAGES.filter(function(i){return row.images.indexOf(i.id)>=0;});
  if(imgs.length){
    html+='<hr class="qd-r-divider"><div class="qd-r-section-title">이미지 ('+imgs.length+'장)</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px">'
      +imgs.slice(0,6).map(function(img){return'<div onclick="openQImgModal(\''+img.id+'\')" style="cursor:pointer;border-radius:4px;overflow:hidden;aspect-ratio:1;background:var(--bd2)"><img src="'+img.objectUrl+'" style="width:100%;height:100%;object-fit:cover" loading="lazy" onerror="this.style.display=\'none\'"></div>';}).join('')
      +'</div>';
  }
  if(row.parseWarnings.length) html+='<hr class="qd-r-divider"><div style="font-size:11px;color:var(--am)">⚠ '+row.parseWarnings.join(' / ')+'</div>';
  html+='<hr class="qd-r-divider"><button class="btn-sm" onclick="nav(\'quality-action\')" style="width:100%;font-size:10.5px">조치 후보 등록</button>';
  return html;
}

// ── 불량 이슈 리스트 3단 ──
function renderQIssuesTab3Pane(){
  var ee=document.getElementById('qmain-issues-empty'),ct=document.getElementById('qmain-issues-content');
  if(!ee||!ct) return; ee.style.display='none'; ct.style.display='block';
  var an=QDEFECT_ANALYTICS,rows=QDEFECT_RAW_ROWS;
  var html='<div class="qd-kpi-row">'
    +_qKpiCard('전체 불량',an.total,'','accent')+_qKpiCard('치명',an.critical,'','red')
    +_qKpiCard('주요',an.major,'','amber')+_qKpiCard('이미지',an.withImage+'건','','green')+'</div>';
  var sortedRows=rows.slice().sort(function(a,b){
    var order={치명:0,주요:1,일반:2,사소:3,개선:4};return(order[a.severity]||5)-(order[b.severity]||5);
  });
  var leftHtml='<div class="qd-panel-box"><div class="qd-panel-title">중요도별</div>'
    +QSEV_VALS.map(function(sv){var cnt=rows.filter(function(r){return r.severity===sv;}).length;var cls=sv==='치명'?'red':sv==='주요'?'amb':'';return'<div class="qd-list-item"><span class="qd-sev-'+sv+'">'+sv+'</span><span class="qd-list-badge '+cls+'">'+cnt+'건</span></div>';}).join('')+'</div>'
    +'<div class="qd-panel-box"><div class="qd-panel-title">파트별</div>'
    +an.byPart.slice(0,8).map(function(p){return'<div class="qd-list-item"><span>'+_qe(p.k)+'</span><span class="qd-list-badge">'+p.n+'</span></div>';}).join('')+'</div>';
  var centHtml='<div style="overflow-x:auto"><table class="qd-compact-tbl"><thead><tr><th>날짜</th><th>모델</th><th>호기</th><th>파트</th><th>소분류</th><th>내용</th><th>중요도</th><th>이미지</th></tr></thead><tbody>'
    +sortedRows.slice(0,100).map(function(r){return'<tr data-rid="'+r.id+'">'
      +'<td style="white-space:nowrap;font-size:10.5px">'+(r.date||'—')+'</td><td>'+(r.model||'—')+'</td><td>'+(r.machine||'—')+'</td>'
      +'<td style="font-size:10.5px">'+(r.part||'—')+'</td><td style="font-size:10.5px;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(r.smallCategory||'—')+'</td>'
      +'<td style="max-width:160px;font-size:10.5px">'+(r.content||'').slice(0,40)+'</td>'
      +'<td class="qd-sev-'+r.severity+'"><b>'+r.severity+'</b></td>'
      +'<td>'+(r.imageCount>0?'🖼'+r.imageCount:'—')+'</td></tr>';}).join('')+'</tbody></table></div>'
    +(rows.length>100?'<div style="padding:6px;text-align:center;font-size:11.5px;color:var(--ts)">상위 100건 표시 (전체 '+rows.length+'건)</div>':'');
  var rightHtml='<div class="qd-r-panel" id="qd-issue-right-panel"><div class="qd-r-empty"><div>이슈를 선택하면 상세가 표시됩니다</div></div></div>';
  ct.innerHTML=html+'<div class="qd-3col"><div class="qd-pane">'+leftHtml+'</div><div class="qd-pane">'+centHtml+'</div><div class="qd-pane">'+rightHtml+'</div></div>';
  ct.querySelectorAll('tr[data-rid]').forEach(function(tr){
    tr.addEventListener('click',function(){
      var row=QDEFECT_RAW_ROWS.find(function(r){return r.id===this.dataset.rid;}.bind(this));
      var rp=document.getElementById('qd-issue-right-panel');
      if(rp&&row) rp.innerHTML=_qRawDetailInline(row);
      ct.querySelectorAll('tr[data-rid]').forEach(function(t){t.classList.toggle('sel-row',t.dataset.rid===(row&&row.id));});
    });
  });
}

// ════════════════════════════════════════════════════════
// v0.96: 이미지/증빙 — 우측 패널 구성
// ════════════════════════════════════════════════════════
var _qImgSelId='';

function renderQImagesPage(){
  if(!QDEFECT_WORKBOOK_READY) return;
  _qShow('qimages-empty',false);_qShow('qimages-content',true);
  renderQImagesKpi();renderQImagesTabContent();
}

function switchQImages(tab,btn){
  _qImagesTab=tab;
  document.querySelectorAll('#qimages-tabbar .qd-tab').forEach(function(b){b.classList.toggle('active',b.dataset.t===tab);});
  ['all','linked','unmatched','bymachine','byclass'].forEach(function(p){_qShow('qimages-panel-'+p,p===tab);});
  if(QDEFECT_WORKBOOK_READY) renderQImagesTabContent();
}

function renderQImagesKpi(){
  var el=document.getElementById('qimages-kpi'); if(!el) return;
  var all=QDEFECT_IMAGES.length+QDEFECT_UNMATCHED_IMAGES.length;
  var pct=all?Math.round(QDEFECT_IMAGES.length/all*100):0;
  el.innerHTML=_qKpiCard('전체 이미지',all,'','accent')
    +_qKpiCard('연결 성공',QDEFECT_IMAGES.length,pct+'%','green')
    +_qKpiCard('미매칭',QDEFECT_UNMATCHED_IMAGES.length,'',QDEFECT_UNMATCHED_IMAGES.length?'red':'green')
    +_qKpiCard('이미지 있는 불량',QDEFECT_RAW_ROWS.filter(function(r){return r.imageCount>0;}).length+'건','');
}

function renderQImagesTabContent(){
  if(_qImagesTab==='all') _renderImagesGrid(QDEFECT_IMAGES.concat(QDEFECT_UNMATCHED_IMAGES));
  else if(_qImagesTab==='linked') _renderImagesGrid(QDEFECT_IMAGES);
  else if(_qImagesTab==='unmatched') _renderImagesGrid(QDEFECT_UNMATCHED_IMAGES);
  else if(_qImagesTab==='bymachine') _renderImagesByGroup('machine');
  else if(_qImagesTab==='byclass') _renderImagesByGroup('part');
}

function _renderImagesGrid(imgs){
  var panelId='qimages-panel-'+_qImagesTab;
  var el=document.getElementById(panelId); if(!el) return;
  if(!imgs.length){el.innerHTML='<div class="qd-tab-empty">'+(QDEFECT_UNMATCHED_IMAGES.length===0&&_qImagesTab==='unmatched'?'✅ 미매칭 이미지 없음':'이미지 없음')+'</div>';return;}
  // 3단: 좌측 필터, 중앙 그리드, 우측 상세
  var months=[],machines=[],parts=[];
  QDEFECT_IMAGES.concat(QDEFECT_UNMATCHED_IMAGES).forEach(function(img){
    if(months.indexOf(img.sheetName)<0) months.push(img.sheetName);
    var row=img.rowId?QDEFECT_RAW_ROWS.find(function(r){return r.id===img.rowId;}):null;
    if(row&&row.machine&&machines.indexOf(row.machine)<0) machines.push(row.machine);
    if(row&&row.part&&parts.indexOf(row.part)<0) parts.push(row.part);
  });
  var leftHtml='<div class="qd-panel-box"><div class="qd-panel-title">월별</div>'
    +months.map(function(m){var cnt=imgs.filter(function(i){return i.sheetName===m;}).length;return'<div class="qd-list-item"><span class="qd-month">'+_qe(m)+'</span><span class="qd-list-badge">'+cnt+'장</span></div>';}).join('')+'</div>';
  var centHtml='<div class="qd-img-grid">'
    +imgs.slice(0,60).map(function(img){
      var row=img.rowId?QDEFECT_RAW_ROWS.find(function(r){return r.id===img.rowId;}):null;
      return'<div class="qd-thumb'+(img.id===_qImgSelId?' sel':'')+'" data-imgid="'+img.id+'">'
        +'<img src="'+img.objectUrl+'" loading="lazy" style="width:100%;height:100px;object-fit:cover;display:block" onerror="this.style.display=\'none\'">'
        +'<div class="qd-thumb-info"><span class="qd-month">'+img.sheetName+'</span>'
        +(row?' <span class="qd-sev-'+row.severity+'">'+row.severity+'</span>':'<span style="color:var(--am)">미매칭</span>')
        +'<div style="font-size:10px;color:var(--ts);margin-top:2px">R'+img.excelRow+(row&&row.model?' · '+row.model:'')+'</div></div></div>';
    }).join('')
    +(imgs.length>60?'<div style="padding:12px;color:var(--ts);font-size:11.5px;grid-column:1/-1;text-align:center">... 외 '+(imgs.length-60)+'장</div>':'')
    +'</div>';
  // 우측: 선택 이미지 상세 패널
  var selImg=_qImgSelId?QDEFECT_IMAGES.concat(QDEFECT_UNMATCHED_IMAGES).find(function(i){return i.id===_qImgSelId;}):null;
  var rightHtml='<div class="qd-r-panel" id="qd-img-right-panel">'+(selImg?_qImgDetailPanel(selImg):'<div class="qd-r-empty"><div>이미지를 선택하면<br>상세가 표시됩니다</div></div>')+'</div>';
  el.innerHTML='<div class="qd-3col"><div class="qd-pane">'+leftHtml+'</div><div class="qd-pane">'+centHtml+'</div><div class="qd-pane">'+rightHtml+'</div></div>';
  el.querySelectorAll('[data-imgid]').forEach(function(thumb){
    thumb.addEventListener('click',function(){
      _qImgSelId=this.dataset.imgid;
      el.querySelectorAll('[data-imgid]').forEach(function(t){t.classList.toggle('sel',t.dataset.imgid===_qImgSelId);});
      var rp=document.getElementById('qd-img-right-panel');
      if(rp){var img2=QDEFECT_IMAGES.concat(QDEFECT_UNMATCHED_IMAGES).find(function(i){return i.id===_qImgSelId;});if(img2)rp.innerHTML=_qImgDetailPanel(img2);}
    });
  });
}

function _qImgDetailPanel(img){
  var row=img.rowId?QDEFECT_RAW_ROWS.find(function(r){return r.id===img.rowId;}):null;
  var html='<img src="'+img.objectUrl+'" style="width:100%;max-height:180px;object-fit:contain;border-radius:6px;background:var(--bd2)" onerror="this.style.display=\'none\'">';
  html+='<div class="qd-r-field" style="margin-top:8px"><div class="qd-r-field-label">파일명</div><div class="qd-r-field-value" style="font-size:11px">'+_qe(img.fileName)+'</div></div>';
  html+='<div class="qd-r-field"><div class="qd-r-field-label">시트/행</div><div class="qd-r-field-value">'+_qe(img.sheetName)+' R'+img.excelRow+'</div></div>';
  html+='<div class="qd-r-field"><div class="qd-r-field-label">연결 상태</div><div class="qd-r-field-value">'+(img.matched?'<span class="qd-code-ok">연결 완료</span>':'<span class="qd-delta-badge qd-delta-warn">미매칭</span>')+'</div></div>';
  if(row){
    html+='<hr class="qd-r-divider">';
    html+='<div class="qd-r-field"><div class="qd-r-field-label">연결 이슈</div><div class="qd-r-field-value" style="font-size:11px">'+_qe(row.id).replace(/`/g,'').slice(0,20)+'</div></div>';
    html+='<div class="qd-r-field"><div class="qd-r-field-label">모델/호기</div><div class="qd-r-field-value">'+_qe(row.model)+' / '+_qe(row.machine)+'</div></div>';
    html+='<div class="qd-r-field"><div class="qd-r-field-label">중요도</div><div class="qd-r-field-value"><span class="qd-sev-'+row.severity+'"><b>'+row.severity+'</b></span></div></div>';
    html+='<div class="qd-r-field"><div class="qd-r-field-label">파트</div><div class="qd-r-field-value">'+_qe(row.part)+'</div></div>';
    html+='<hr class="qd-r-divider"><button class="btn-sm" onclick="_qMainSelRowId=\''+img.rowId+'\';nav(\'quality-main\')" style="width:100%;font-size:10.5px">Raw Data로 이동</button>';
  }
  return html;
}

function _renderImagesByGroup(groupKey){
  var panelKey=groupKey==='machine'?'bymachine':'byclass';
  var el=document.getElementById('qimages-panel-'+panelKey); if(!el) return;
  var groups={};
  QDEFECT_IMAGES.forEach(function(img){
    var row=img.rowId?QDEFECT_RAW_ROWS.find(function(r){return r.id===img.rowId;}):null;
    var g=(row&&row[groupKey])||'미확인';
    if(!groups[g]) groups[g]=[];
    groups[g].push(img);
  });
  el.innerHTML='<div style="display:flex;flex-direction:column;gap:12px">'+Object.keys(groups).sort().map(function(g){
    return'<div class="card"><div class="card-title" style="margin-bottom:8px">'+_qe(g)+(groupKey==='machine'?' 호기':'')+' ('+groups[g].length+'장)</div>'
      +'<div class="qd-img-grid">'
      +groups[g].slice(0,20).map(function(img){return'<div class="qd-thumb" onclick="openQImgModal(\''+img.id+'\')">'
        +'<img src="'+img.objectUrl+'" loading="lazy" style="width:100%;height:90px;object-fit:cover;display:block" onerror="this.style.display=\'none\'"><div class="qd-thumb-info">R'+img.excelRow+'</div></div>';}).join('')
      +(groups[g].length>20?'<div style="font-size:11px;color:var(--ts);text-align:center;padding:8px">... 외 '+(groups[g].length-20)+'장</div>':'')
      +'</div></div>';
  }).join('')+'</div>';
}

// 이미지 모달 (확대 전용 — 최소한으로 유지)
function openQImgModal(imgId){
  var all=QDEFECT_IMAGES.concat(QDEFECT_UNMATCHED_IMAGES);
  var img=all.find(function(i){return i.id===imgId;}); if(!img) return;
  var modal=document.getElementById('qd-img-modal'),imgEl=document.getElementById('qd-img-modal-img'),info=document.getElementById('qd-img-modal-info');
  if(!modal||!imgEl) return;
  imgEl.src=img.objectUrl;
  var row=img.rowId?QDEFECT_RAW_ROWS.find(function(r){return r.id===img.rowId;}):null;
  if(info) info.textContent=img.sheetName+' R'+img.excelRow+' · '+img.fileName+(row?' · '+row.model+(row.machine?' '+row.machine:'')+(row.severity?' · '+row.severity:''):'');
  modal.style.display='flex';
}

// ── v0.96 nav hook ──
(function(){
  var _nb=typeof nav==='function'?nav:null;
  if(!_nb||nav.__v96hooked)return;
  // [STEP02] v96 nav wrapper neutralized; renders merged into odiNavAfterRenderDispatcher
  try { nav.__v96hooked=true; } catch(_e){}
})();

// ══════════════════
// v0.97
// 업로드 전 UI 골격 + 데이터 빌드 함수

// ════════════════════════════════════════════════════════
// v0.97: 빈 상태 헬퍼 + 데이터 빌드 함수
// 업로드 전 UI 골격 렌더링 지원
// ════════════════════════════════════════════════════════

// ── 빈 분석 객체 ──
function createEmptyQualityAnalytics(){
  return{
    total:0,thisMonth:0,critical:0,major:0,withImage:0,unmappedCell:0,
    byMonth:[],bySev:QSEV_VALS.map(function(sv){return{k:sv,n:0};}),
    byPart:[],byMajor:[],byMiddle:[],bySmall:[],byModel:[],byMachine:[],byCell:[],byWriter:[],byDate:[],
    topPart:'—',topMachine:'—',topModel:'—'
  };
}
function createEmptyMachineSummary(){return [];}
function createEmptyModelSummary(){return [];}
function createEmptyCellSummary(){return {cells:{},unmapped:0};}
function createEmptyActionSummary(){return {candidates:[],capaTargets:[],ecoTargets:[]};}
function createEmptyCodeSummary(){return {codes:[],others:[],unmapped:[],unused:[]};}

// ── 빈 차트 placeholder ──
function renderEmptyChartPlaceholder(type,title){
  var h={linebar:80,donut:100,pareto:80,heatmap:70,grouped:70,cal:120,lollipop:70}[type]||70;
  var icon={linebar:'📈',donut:'◎',pareto:'⬛',heatmap:'▦',grouped:'▦',cal:'📅',lollipop:'⚬'}[type]||'📊';
  return'<div style="height:'+h+'px;background:var(--sf2);border:1.5px dashed var(--bd);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5px">'
    +'<div style="font-size:22px;opacity:.25">'+icon+'</div>'
    +'<div style="font-size:10.5px;color:var(--ts)">파일 업로드 후 '+( title||'차트')+'표시</div>'
    +'</div>';
}

// ── 빈 테이블 row ──
function _qEmptyTableRow(colspan,msg){
  return'<tr><td colspan="'+colspan+'" style="text-align:center;color:var(--ts);padding:20px;font-size:11.5px">'+( msg||'파일을 업로드하면 데이터가 표시됩니다')+'</td></tr>';
}

// ── 빈 상태 알림 박스 ──
function _qEmptyNotice(pageName){
  return'<div style="text-align:center;padding:16px;color:var(--ts);font-size:12px">'
    +'<div style="font-size:24px;margin-bottom:8px;opacity:.4">📂</div>'
    +'<div style="font-weight:600;color:var(--tp);margin-bottom:4px">'+pageName+' 데이터 없음</div>'
    +'<div style="font-size:11.5px">불량 관리 센터에서 파일을 업로드하면 분석이 생성됩니다.</div>'
    +'<button class="btn-sm" onclick="nav(\'quality-main\')" style="font-size:11px;margin-top:10px">파일 업로드</button>'
    +'</div>';
}

// ── Machine Summary 빌더 ──
function buildMachineSummary(rows){
  var map={};
  rows.forEach(function(r){
    var m=r.machine||'미확인';
    if(!map[m]) map[m]={name:m,total:0,fatal:0,major:0,normal:0,minor:0,improve:0,withImg:0,cells:{},parts:{},months:{},dates:[],smallCats:{}};
    map[m].total++;
    if(r.severity==='치명') map[m].fatal++;
    else if(r.severity==='주요') map[m].major++;
    else if(r.severity==='일반') map[m].normal++;
    else if(r.severity==='사소') map[m].minor++;
    else if(r.severity==='개선') map[m].improve++;
    if(r.imageCount>0) map[m].withImg++;
    if(r.cell) map[m].cells[r.cell]=(map[m].cells[r.cell]||0)+1;
    if(r.part) map[m].parts[r.part]=(map[m].parts[r.part]||0)+1;
    if(r.monthKey) map[m].months[r.monthKey]=(map[m].months[r.monthKey]||0)+1;
    if(r.date) map[m].dates.push(r.date);
    if(r.smallCategory) map[m].smallCats[r.smallCategory]=(map[m].smallCats[r.smallCategory]||0)+1;
  });
  return Object.values(map).map(function(m){
    var sortedDates=m.dates.slice().sort();
    var topPart=Object.keys(m.parts).sort(function(a,b){return m.parts[b]-m.parts[a];})[0]||'—';
    var topCell=Object.keys(m.cells).sort(function(a,b){return m.cells[b]-m.cells[a];})[0]||'—';
    var repeatCnt=Object.values(m.smallCats).filter(function(n){return n>=3;}).length;
    return Object.assign(m,{lastDate:sortedDates.pop()||'—',topPart:topPart,topCell:topCell,repeatCnt:repeatCnt,
      riskLevel:m.fatal>0?'HIGH':m.major>5?'MED':m.major>0?'LOW':'OK'});
  }).sort(function(a,b){return b.total-a.total;});
}

// ── Model Summary 빌더 ──
function buildModelSummary(rows){
  var map={};
  rows.forEach(function(r){
    var m=r.model||'미확인';
    if(!map[m]) map[m]={name:m,total:0,fatal:0,major:0,normal:0,minor:0,improve:0,withImg:0,machines:{},parts:{},months:{},smallCats:{}};
    map[m].total++;
    if(r.severity==='치명') map[m].fatal++;
    else if(r.severity==='주요') map[m].major++;
    else if(r.severity==='일반') map[m].normal++;
    else if(r.severity==='사소') map[m].minor++;
    if(r.imageCount>0) map[m].withImg++;
    if(r.machine) map[m].machines[r.machine]=(map[m].machines[r.machine]||0)+1;
    if(r.part) map[m].parts[r.part]=(map[m].parts[r.part]||0)+1;
    if(r.monthKey) map[m].months[r.monthKey]=(map[m].months[r.monthKey]||0)+1;
    if(r.smallCategory) map[m].smallCats[r.smallCategory]=(map[m].smallCats[r.smallCategory]||0)+1;
  });
  return Object.values(map).map(function(m){
    var topPart=Object.keys(m.parts).sort(function(a,b){return m.parts[b]-m.parts[a];})[0]||'—';
    return Object.assign(m,{topPart:topPart});
  }).sort(function(a,b){return b.total-a.total;});
}

// ── Cell Summary 빌더 ──
function buildCellSummary(rows){
  var map={};
  rows.forEach(function(r){
    var c=r.cell||'';
    if(!c){return;}
    if(!map[c]) map[c]={cell:c,total:0,fatal:0,major:0,parts:{},machines:{},dates:[]};
    map[c].total++;
    if(r.severity==='치명') map[c].fatal++;
    if(r.severity==='주요') map[c].major++;
    if(r.part) map[c].parts[r.part]=(map[c].parts[r.part]||0)+1;
    if(r.machine) map[c].machines[r.machine]=(map[c].machines[r.machine]||0)+1;
    if(r.date) map[c].dates.push(r.date);
  });
  var unmapped=rows.filter(function(r){return!r.cell;}).length;
  return{cells:Object.values(map).sort(function(a,b){return b.total-a.total;}),unmapped:unmapped};
}

// ── Date/Batch Summary 빌더 ──
function buildDateBatchSummary(rows){
  var dateMap={},weekMap={},monthMap={};
  rows.forEach(function(r){
    if(r.date){dateMap[r.date]=(dateMap[r.date]||0)+1;}
    if(r.monthKey){monthMap[r.monthKey]=(monthMap[r.monthKey]||0)+1;}
  });
  var noDate=rows.filter(function(r){return!r.date;}).length;
  return{dateMap:dateMap,monthMap:monthMap,noDate:noDate,
    topDate:Object.keys(dateMap).sort(function(a,b){return dateMap[b]-dateMap[a];})[0]||'—'};
}

// ── Category Code Summary 빌더 ──
function buildCategoryCodeSummary(rows){
  var partMap={},majorMap={},middleMap={},smallMap={};
  rows.forEach(function(r){
    if(r.part) partMap[r.part]=(partMap[r.part]||0)+1;
    if(r.majorCategory) majorMap[r.majorCategory]=(majorMap[r.majorCategory]||0)+1;
    if(r.middleCategory) middleMap[r.middleCategory]=(middleMap[r.middleCategory]||0)+1;
    if(r.smallCategory) smallMap[r.smallCategory]=(smallMap[r.smallCategory]||0)+1;
  });
  var repeat=Object.keys(smallMap).filter(function(k){return smallMap[k]>=3;}).map(function(k){return{k:k,n:smallMap[k]};}).sort(function(a,b){return b.n-a.n;});
  var others=rows.filter(function(r){return r.part==='기타'||!r.part;}).length;
  return{partMap:partMap,majorMap:majorMap,middleMap:middleMap,smallMap:smallMap,
    repeatCandidates:repeat,otherCount:others,
    byPart:Object.keys(partMap).map(function(k){return{k:k,n:partMap[k]};}).sort(function(a,b){return b.n-a.n;}),
    byMajor:Object.keys(majorMap).map(function(k){return{k:k,n:majorMap[k]};}).sort(function(a,b){return b.n-a.n;}),
    bySmall:Object.keys(smallMap).map(function(k){return{k:k,n:smallMap[k]};}).sort(function(a,b){return b.n-a.n;})
  };
}

// ── Writer/Department Summary 빌더 ──
function buildWriterDeptSummary(rows){
  var wMap={},dMap={};
  rows.forEach(function(r){
    var w=r.writer||'미입력';
    wMap[w]=(wMap[w]||0)+1;
    var d=r.dept||'미입력';
    dMap[d]=(dMap[d]||0)+1;
  });
  var noWriter=rows.filter(function(r){return!r.writer;}).length;
  return{
    byWriter:Object.keys(wMap).map(function(k){return{k:k,n:wMap[k]};}).sort(function(a,b){return b.n-a.n;}),
    byDept:Object.keys(dMap).map(function(k){return{k:k,n:dMap[k]};}).sort(function(a,b){return b.n-a.n;}),
    noWriter:noWriter
  };
}

// ── Action Candidate 빌더 ──
function buildActionCandidates(rows){
  var critical=rows.filter(function(r){return r.severity==='치명';});
  var major=rows.filter(function(r){return r.severity==='주요';});
  var candidates=critical.concat(major);
  // 반복 소분류 → CAPA 후보
  var smallMap={};rows.forEach(function(r){if(r.smallCategory) smallMap[r.smallCategory]=(smallMap[r.smallCategory]||0)+1;});
  var capa=Object.keys(smallMap).filter(function(k){return smallMap[k]>=3;}).map(function(k){return{category:k,count:smallMap[k]};}).sort(function(a,b){return b.count-a.count;});
  // 동일 호기 반복 → ECO 후보
  var machMap={};rows.forEach(function(r){if(r.machine) machMap[r.machine]=(machMap[r.machine]||0)+1;});
  var eco=Object.keys(machMap).filter(function(k){return machMap[k]>=5;}).map(function(k){return{machine:k,count:machMap[k]};}).sort(function(a,b){return b.count-a.count;});
  return{candidates:candidates,capa:capa,eco:eco,totalCandidates:candidates.length,capaCount:capa.length,ecoCount:eco.length};
}

// ════════════════════════════════════════════════════════
// v0.97: 대시보드 — 업로드 전 골격 렌더링 포함
// ════════════════════════════════════════════════════════

// 업로드 전후 모두 렌더 (early return 금지)
function renderQDashPage(){
  _qShow('qdash-empty',false);
  _qShow('qdash-content',true);
  renderQDashTab();
}

function switchQDash(tab,btn){
  _qDashTab=tab;
  document.querySelectorAll('#qdash-tabbar .qd-tab').forEach(function(b){b.classList.toggle('active',b.dataset.t===tab);});
  renderQDashTab();
}

function renderQDashTab(){
  var fns={overview:renderQDashOverview,monthly:renderQDashMonthly,severity:renderQDashSeverity,
    process:renderQDashProcess,machine:renderQDashMachineView,trend:renderQDashTrend,alert:renderQDashAlert};
  if(fns[_qDashTab]) fns[_qDashTab]();
}

function _qGetAnalytics(){
  return QDEFECT_WORKBOOK_READY?QDEFECT_ANALYTICS:createEmptyQualityAnalytics();
}
function _qGetRows(){return QDEFECT_WORKBOOK_READY?QDEFECT_RAW_ROWS:[];}

// ── KPI 행 (업로드 전 0, 후 실수치) ──
function _qDashKpi97(){
  var an=_qGetAnalytics(), rows=_qGetRows(), ready=!!QDEFECT_WORKBOOK_READY;
  var imgAll=(QDEFECT_IMAGES||[]).length+(QDEFECT_UNMATCHED_IMAGES||[]).length;
  var repeat=an.bySmall?an.bySmall.filter(function(x){return x.n>=3;}).length:0;
  var eco=an.critical+an.major;
  var imgPct=imgAll?Math.round((QDEFECT_IMAGES||[]).length/imgAll*100):0;
  return '<div class="qd-kpi-row" style="grid-template-columns:repeat(auto-fill,minmax(100px,1fr));margin-bottom:12px">'
    +_qKpiCard('전체 불량',an.total,(ready?'누적 등록':'업로드 필요'),'accent')
    +_qKpiCard('이번 달',an.thisMonth,ready?'':'—')
    +_qKpiCard('치명',an.critical,ready?'즉시 대응':'','red')
    +_qKpiCard('주요',an.major,ready?'처리 필요':'','amber')
    +_qKpiCard('ECO 후보',eco,'치명+주요','amber')
    +_qKpiCard('CAPA 후보',repeat,'반복3회↑','')
    +_qKpiCard('이미지 증빙',(QDEFECT_IMAGES||[]).length+'장',imgAll?imgPct+'% 연결':'','green')
    +_qKpiCard('파싱 경고',(QDEFECT_PARSE_WARNINGS||[]).length+'건','',QDEFECT_PARSE_WARNINGS&&QDEFECT_PARSE_WARNINGS.length?'amber':'')
    +_qKpiCard('미매칭 이미지',(QDEFECT_UNMATCHED_IMAGES||[]).length+'장','',QDEFECT_UNMATCHED_IMAGES&&QDEFECT_UNMATCHED_IMAGES.length?'red':'')
    +_qKpiCard('CELL 미기재',an.unmappedCell+'건','',an.unmappedCell>0&&an.total>0&&an.unmappedCell>an.total*0.3?'amber':'')
    +'</div>';
}

function renderQDashOverview(){
  var el=document.getElementById('qdash-content'); if(!el) return;
  var an=_qGetAnalytics(), rows=_qGetRows(), ready=!!QDEFECT_WORKBOOK_READY;
  var monthly=QDEFECT_SHEET_SUMMARY?QDEFECT_SHEET_SUMMARY.filter(function(s){return s.type==='monthly';}):[]; 
  var sortedM=an.byMonth.slice().sort(function(a,b){return a.k.localeCompare(b.k);});
  var sevItems=an.bySev||QSEV_VALS.map(function(sv){return{k:sv,n:0};});

  var html=_qDashKpi97();

  // 3열: 월별추이 / 중요도Donut / 알림
  html+='<div style="display:grid;grid-template-columns:1fr 1fr 260px;gap:10px;margin-bottom:10px">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">월별 불량 추이</div>'
    +(ready&&sortedM.length?_qSvgLinebar(sortedM,{w:280,h:80}):renderEmptyChartPlaceholder('linebar','월별 추이'))
    +(ready&&sortedM.length>=2?(function(){var last=sortedM[sortedM.length-1],prev=sortedM[sortedM.length-2],trend=last.n-prev.n;return'<div style="margin-top:5px;font-size:11px;padding:4px 8px;background:var(--sf2);border-radius:4px">전월 대비 <span style="color:'+(trend>0?'var(--rd)':'var(--gr)')+'"><b>'+(trend>0?'+':'')+trend+'건</b></span></div>'})():'')
    +'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">중요도 분포</div>'
    +(ready&&an.total?_qDonut(sevItems,an.total):renderEmptyChartPlaceholder('donut','중요도 분포'))
    +'</div>';
  var alerts=ready?_qBuildAlerts(an,rows):[];
  html+='<div class="card" style="border-color:var(--rd)">'
    +'<div class="card-title" style="margin-bottom:5px;color:var(--rd);font-size:11px">⚠ 위험 알림</div>'
    +(alerts.length
      ?alerts.map(function(a){return'<div style="padding:4px 8px;border-left:2px solid '+a.color+';margin-bottom:4px;font-size:10.5px"><b style="color:'+a.color+'">'+a.type+'</b> '+a.msg+'</div>';}).join('')
      :(ready?'<div style="color:var(--gr);font-size:11px;padding:6px">✅ 이상징후 없음</div>':'<div style="color:var(--ts);font-size:11px;padding:6px">업로드 후 분석</div>'))
    +'</div></div>';

  // 2열: Pareto + Grouped bar
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">파트별 Pareto</div>'
    +(ready&&an.byPart.length?_qPareto(an.byPart,{color:'var(--am)'}):renderEmptyChartPlaceholder('pareto','파트 Pareto'))
    +'</div>';
  var modelItems=rows.length?an.byModel.map(function(m){var mr=rows.filter(function(r){return r.model===m.k;}),bs={};mr.forEach(function(r){bs[r.severity]=(bs[r.severity]||0)+1;});return{k:m.k,total:m.n,bySev:bs};}):[];
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">모델별 중요도 구성</div>'
    +(ready&&modelItems.length?_qGroupedBar(modelItems):renderEmptyChartPlaceholder('grouped','모델별 분석'))
    +'</div></div>';

  // 2열: SUMMARY 비교 + 대분류 TOP
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">SUMMARY vs 실제 파싱 비교</div>'
    +(ready&&monthly.length?_qVarianceTable(monthly,QDEFECT_SUMMARY_DATA)
      :'<div class="qd-tab-empty" style="font-size:11.5px">업로드 후 SUMMARY 비교 표시</div>')+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">대분류 TOP10</div>'
    +(ready&&an.byMajor.length?_qPareto(an.byMajor,{color:'var(--ac)',maxN:10}):renderEmptyChartPlaceholder('pareto','대분류'))+'</div></div>';

  // Risk Matrix (항상 표 구조 표시)
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">호기별 위험도 Matrix'
    +(ready?'<span style="float:right;font-size:10.5px;color:var(--ac);cursor:pointer" onclick="nav(\'quality-analysis\')">상세 분석 →</span>':'')+'</div>'
    +(ready&&rows.length?_qMachineRiskMatrix(rows).html
      :'<table class="qd-compact-tbl"><thead><tr><th>호기</th><th>총 불량</th><th>치명</th><th>주요</th><th>이미지</th><th>위험도</th><th>주요 파트</th></tr></thead><tbody>'+_qEmptyTableRow(7)+'</tbody></table>')
    +'</div>';

  el.innerHTML=html;
  if(ready&&rows.length){
    el.querySelectorAll('#qd-machine-matrix tr[data-machine]').forEach(function(tr){
      tr.addEventListener('click',function(){_qSelMachine=this.dataset.machine;nav('quality-analysis');});
    });
  }
}

function renderQDashMonthly(){
  var el=document.getElementById('qdash-content'); if(!el) return;
  var an=_qGetAnalytics(), ready=!!QDEFECT_WORKBOOK_READY;
  var sortedM=an.byMonth.slice().sort(function(a,b){return a.k.localeCompare(b.k);});
  var monthly=QDEFECT_SHEET_SUMMARY?QDEFECT_SHEET_SUMMARY.filter(function(s){return s.type==='monthly';}):[]; 
  var html=_qDashKpi97();
  html+='<div class="qd-analysis-grid">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">월별 불량 추이 (라인+바)</div>'
    +(ready&&sortedM.length?_qSvgLinebar(sortedM,{w:380,h:100}):renderEmptyChartPlaceholder('linebar','월별 추이'))+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">SUMMARY vs 실제 비교</div>'
    +(ready&&monthly.length?_qVarianceTable(monthly,QDEFECT_SUMMARY_DATA):'<div class="qd-tab-empty">업로드 후 표시</div>')+'</div>';
  html+='</div>';
  if(ready&&sortedM.length){
    html+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px">';
    sortedM.forEach(function(m){
      var mRows=QDEFECT_RAW_ROWS.filter(function(r){return r.monthKey===m.k;});
      var bySev={};mRows.forEach(function(r){bySev[r.severity]=(bySev[r.severity]||0)+1;});
      var trend=0;var mi=sortedM.indexOf(m);if(mi>0){trend=m.n-sortedM[mi-1].n;}
      html+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
        +'<span class="qd-month">'+m.k+'</span><b>'+m.n+'건</b><span style="font-size:10px;color:'+(trend>0?'var(--rd)':trend<0?'var(--gr)':'var(--ts)')+'">'+(trend>0?'↑':trend<0?'↓':'→')+Math.abs(trend)+'</span></div>'
        +_qDonut(QSEV_VALS.map(function(sv){return{k:sv,n:bySev[sv]||0};}),m.n)+'</div>';
    });
    html+='</div>';
  }else{
    html+='<div class="card">'+_qEmptyNotice('월별 분석')+'</div>';
  }
  el.innerHTML=html;
}

function renderQDashSeverity(){
  var el=document.getElementById('qdash-content'); if(!el) return;
  var an=_qGetAnalytics(), rows=_qGetRows(), ready=!!QDEFECT_WORKBOOK_READY;
  var sevColors={'치명':'#ef4444','주요':'#f97316','일반':'#6366f1','사소':'#64748b','개선':'#22c55e'};
  var html=_qDashKpi97();
  html+='<div class="qd-analysis-grid">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">중요도 분포 Donut</div>'
    +(ready&&an.total?_qDonut(an.bySev||[],an.total):renderEmptyChartPlaceholder('donut','중요도'))+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">호기별 중요도 비교</div>'
    +(ready&&an.byMachine.length
      ?'<div style="overflow-x:auto"><table class="qd-compact-tbl"><thead><tr><th>호기</th>'+QSEV_VALS.map(function(sv){return'<th class="qd-sev-'+sv+'">'+sv+'</th>';}).join('')+'<th>합계</th></tr></thead><tbody>'
        +an.byMachine.slice(0,10).map(function(m){var mr=rows.filter(function(r){return r.machine===m.k;}),sm={};mr.forEach(function(r){sm[r.severity]=(sm[r.severity]||0)+1;});return'<tr><td style="font-weight:600">'+_qe(m.k)+'</td>'+QSEV_VALS.map(function(sv){return'<td style="color:'+(sevColors[sv]||'')+'">'+(sm[sv]||0)+'</td>';}).join('')+'<td><b>'+m.n+'</b></td></tr>';}).join('')+'</tbody></table></div>'
      :'<table class="qd-compact-tbl"><thead><tr><th>호기</th>'+QSEV_VALS.map(function(sv){return'<th>'+sv+'</th>';}).join('')+'<th>합계</th></tr></thead><tbody>'+_qEmptyTableRow(QSEV_VALS.length+2)+'</tbody></table>')
    +'</div></div>';
  el.innerHTML=html;
}

function renderQDashProcess(){
  var el=document.getElementById('qdash-content'); if(!el) return;
  var an=_qGetAnalytics(), ready=!!QDEFECT_WORKBOOK_READY;
  var html=_qDashKpi97();
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">파트별 Pareto</div>'+(ready&&an.byPart.length?_qPareto(an.byPart,{color:'var(--am)'}):renderEmptyChartPlaceholder('pareto','파트'))+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">대분류 TOP10</div>'+(ready&&an.byMajor.length?_qPareto(an.byMajor,{color:'var(--ac)',maxN:10}):renderEmptyChartPlaceholder('pareto','대분류'))+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">중분류 TOP10</div>'+(ready&&an.byMiddle.length?_qPareto(an.byMiddle,{color:'var(--pi)',maxN:10}):renderEmptyChartPlaceholder('pareto','중분류'))+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">소분류 TOP10</div>'+(ready&&an.bySmall.length?_qPareto(an.bySmall,{color:'var(--am)',maxN:10}):renderEmptyChartPlaceholder('pareto','소분류'))+'</div>';
  html+='</div>';
  el.innerHTML=html;
}

function renderQDashMachineView(){
  var el=document.getElementById('qdash-content'); if(!el) return;
  var an=_qGetAnalytics(), rows=_qGetRows(), ready=!!QDEFECT_WORKBOOK_READY;
  var html=_qDashKpi97();
  var mxRes=ready&&rows.length?_qMachineRiskMatrix(rows):null;
  html+='<div class="card" style="margin-bottom:10px"><div class="card-title" style="margin-bottom:6px">호기별 위험도 Matrix</div>'
    +(mxRes?mxRes.html:'<table class="qd-compact-tbl"><thead><tr><th>호기</th><th>총 불량</th><th>치명</th><th>주요</th><th>이미지</th><th>위험도</th></tr></thead><tbody>'+_qEmptyTableRow(6)+'</tbody></table>')
    +'</div>';
  html+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">CELL별 분포</div>'+(ready&&an.byCell.length?_qPareto(an.byCell.slice(0,12),{color:'var(--pi)'}):renderEmptyChartPlaceholder('pareto','CELL'))+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">모델별 분포</div>'+(ready&&an.byModel.length?_qPareto(an.byModel,{color:'var(--gr)'}):renderEmptyChartPlaceholder('pareto','모델'))+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">모델×호기 매트릭스</div>'
    +(ready&&rows.length?'<div style="overflow-x:auto;font-size:11px"><table class="qd-compact-tbl"><thead><tr><th>모델</th>'+an.byMachine.slice(0,5).map(function(m){return'<th>'+_qe(m.k)+'</th>';}).join('')+'</tr></thead><tbody>'
      +an.byModel.map(function(model){return'<tr><td style="font-weight:600">'+_qe(model.k)+'</td>'+an.byMachine.slice(0,5).map(function(m){var c=rows.filter(function(r){return r.model===model.k&&r.machine===m.k;}).length;return'<td style="text-align:center;background:rgba(99,102,241,'+(c?Math.min(0.6,c/an.total*5).toFixed(2):'0')+')">'+(c||'')+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>'
      :'<div class="qd-tab-empty" style="font-size:11.5px">업로드 후 표시</div>')+'</div>';
  html+='</div>';
  el.innerHTML=html;
}

function renderQDashTrend(){
  var el=document.getElementById('qdash-content'); if(!el) return;
  var an=_qGetAnalytics(), rows=_qGetRows(), ready=!!QDEFECT_WORKBOOK_READY;
  var sortedM=an.byMonth.slice().sort(function(a,b){return a.k.localeCompare(b.k);});
  var html=_qDashKpi97();
  html+='<div class="qd-analysis-grid">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">날짜별 캘린더 히트맵</div>'
    +(ready&&rows.length?_qCalHeatmap(rows):renderEmptyChartPlaceholder('cal','캘린더'))+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">월별 추이 + 트렌드</div>'
    +(ready&&sortedM.length?_qSvgLinebar(sortedM,{w:300,h:90}):renderEmptyChartPlaceholder('linebar','월별'))+'</div>';
  html+='</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">일자별 TOP20</div>'
    +(ready&&an.byDate.length?_qPareto(an.byDate.slice(0,20),{color:'var(--am)',maxN:20}):renderEmptyChartPlaceholder('pareto','일자별'))+'</div>';
  el.innerHTML=html;
}

function renderQDashAlert(){
  var el=document.getElementById('qdash-content'); if(!el) return;
  var an=_qGetAnalytics(), rows=_qGetRows(), ready=!!QDEFECT_WORKBOOK_READY;
  var html=_qDashKpi97();
  var alerts=ready?_qBuildAlerts(an,rows):[];
  html+=(alerts.length
    ?'<div style="display:flex;flex-direction:column;gap:7px">'+alerts.map(function(a){return'<div style="padding:10px 12px;border:1px solid '+a.color+';border-radius:8px;border-left-width:4px"><div style="font-size:12px;font-weight:600;color:'+a.color+';margin-bottom:3px">'+a.msg+'</div></div>';}).join('')+'</div>'
    :(ready?'<div class="qd-tab-empty" style="color:var(--gr)">✅ 이상징후 없음</div>':'<div class="card">'+_qEmptyNotice('알림/이상징후')+'</div>'));
  if(ready&&an.critical>0){
    var critRows=rows.filter(function(r){return r.severity==='치명';});
    html+='<div class="card" style="margin-top:10px;border-color:var(--rd)"><div class="card-title" style="color:var(--rd);margin-bottom:6px">치명 이슈 목록</div><table class="qd-compact-tbl"><thead><tr><th>날짜</th><th>모델</th><th>호기</th><th>파트</th><th>내용</th></tr></thead><tbody>'
      +critRows.map(function(r){return'<tr><td>'+r.date+'</td><td>'+_qe(r.model)+'</td><td>'+_qe(r.machine)+'</td><td>'+_qe(r.part)+'</td><td style="font-size:10.5px">'+_qe(r.content).slice(0,40)+'</td></tr>';}).join('')+'</tbody></table></div>';
  }
  el.innerHTML=html;
}

// ════════════════════════════════════════════════════════
// v0.97: 품질 분석 센터 — 업로드 전 골격 + 탭별 전용 데이터
// 탭 제목 ↔ 데이터 완전 분리
// ════════════════════════════════════════════════════════

function renderQAnalysisPage(){
  // 업로드 전후 모두 렌더
  _qShow('qanalysis-empty',false);_qShow('qanalysis-content',true);
  switchQAnalysis(_qAnalysisTab,null);
}

function switchQAnalysis(tab,btn){
  _qAnalysisTab=tab;
  document.querySelectorAll('#qanalysis-tabbar .qd-tab').forEach(function(b){b.classList.toggle('active',b.dataset.t===tab);});
  ['machine','model','cell','date','code','writer'].forEach(function(p){_qShow('qanalysis-panel-'+p,p===tab);});
  // 업로드 전후 모두 렌더
  if(tab==='machine') renderQAnalysisMachine97();
  else if(tab==='model') renderQAnalysisModel97();
  else if(tab==='cell') renderQAnalysisCell97();
  else if(tab==='date') renderQAnalysisDate97();
  else if(tab==='code') renderQAnalysisCode97();
  else if(tab==='writer') renderQAnalysisWriter97();
}

// ── 공통 필터바 ──
function _qAnaFilterBar(id,prefix,onchange){
  var an=_qGetAnalytics();
  return'<div class="qd-filter-bar" id="'+id+'">'
    +'<select class="form-input" style="font-size:11px" onchange="'+onchange+'"><option value="">전체 월</option>'
    +an.byMonth.map(function(m){return'<option>'+m.k+'</option>';}).join('')+'</select>'
    +'<select class="form-input" style="font-size:11px" onchange="'+onchange+'"><option value="">전체 모델</option>'
    +an.byModel.map(function(m){return'<option>'+m.k+'</option>';}).join('')+'</select>'
    +'<select class="form-input" style="font-size:11px" onchange="'+onchange+'"><option value="">전체 중요도</option>'
    +QSEV_VALS.map(function(s){return'<option>'+s+'</option>';}).join('')+'</select>'
    +'<button class="btn-sm" onclick="'+prefix+'Reset()">초기화</button>'
    +'</div>';
}

// ══════════════════════════════════
// 3-1: 호기별 분석 (호기 데이터만)
// ══════════════════════════════════
function renderQAnalysisMachine97(){
  var el=document.getElementById('qanalysis-panel-machine'); if(!el) return;
  var ready=!!QDEFECT_WORKBOOK_READY;
  var rows=_qGetRows();
  var machines=ready?buildMachineSummary(rows):[];
  if(!_qSelMachine&&machines.length) _qSelMachine=machines[0].name;
  var selM=machines.find(function(m){return m.name===_qSelMachine;})||null;
  var an=_qGetAnalytics();

  // 필터바
  var html=_qAnaFilterBar('qa-mach-filterbar','_qMach','renderQAnalysisMachine97()');

  // 좌측: 호기 목록 (위험도 순)
  var leftHtml='<div class="qd-panel-box"><div class="qd-panel-title">호기 목록</div>';
  if(machines.length){
    machines.forEach(function(m){
      leftHtml+='<div class="qd-list-item'+(m.name===_qSelMachine?' sel':'')+'" onclick="_qSelMachine=\''+_qe(m.name)+'\';renderQAnalysisMachine97()">'
        +'<span><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:'+_qRiskLabelColor(m.fatal,m.major)+';margin-right:4px"></span>'+_qe(m.name)+'호기</span>'
        +'<span class="qd-list-badge '+(m.fatal>0?'red':m.major>0?'amb':'')+'">'+m.total+'건</span></div>';
    });
  }else{
    leftHtml+='<div class="qd-r-empty"><div style="font-size:11.5px">업로드 후<br>호기 목록 표시</div></div>';
  }
  leftHtml+='</div>';
  if(machines.filter(function(m){return m.riskLevel==='HIGH'||m.riskLevel==='MED';}).length){
    leftHtml+='<div class="qd-panel-box"><div class="qd-panel-title">⚠ 위험 호기</div>'
      +machines.filter(function(m){return m.riskLevel==='HIGH'||m.riskLevel==='MED';}).slice(0,4).map(function(m){return'<div style="padding:4px 6px;border-left:2px solid '+_qRiskLabelColor(m.fatal,m.major)+';margin-bottom:3px;font-size:10.5px"><b>'+_qe(m.name)+'호기</b> '+(m.fatal?'치명'+m.fatal:'')+(m.major?' 주요'+m.major:'')+'</div>';}).join('')+'</div>';
  }

  // 중앙: Risk Matrix + 월별 추이 비교
  var centHtml='<div class="card" style="margin-bottom:8px"><div class="card-title" style="margin-bottom:6px">호기별 Risk Matrix</div>';
  if(ready&&machines.length){
    centHtml+=_qMachineRiskMatrix(rows).html;
  }else{
    centHtml+='<table class="qd-compact-tbl"><thead><tr><th>호기</th><th>총불량</th><th>치명</th><th>주요</th><th>이미지</th><th>위험도</th><th>주요파트</th><th>CELL</th></tr></thead><tbody>'+_qEmptyTableRow(8)+'</tbody></table>';
  }
  centHtml+='</div>';
  // 호기별 월별 추이 비교 테이블
  if(ready&&machines.length&&an.byMonth.length){
    var sortedMon=an.byMonth.slice().sort(function(a,b){return a.k.localeCompare(b.k);});
    centHtml+='<div class="card"><div class="card-title" style="margin-bottom:6px">호기별 월별 발생 건수</div><div style="overflow-x:auto"><table class="qd-compact-tbl"><thead><tr><th>호기</th>'
      +sortedMon.map(function(m){return'<th>'+m.k.slice(2)+'</th>';}).join('')+'</tr></thead><tbody>'
      +machines.slice(0,8).map(function(m){return'<tr onclick="_qSelMachine=\''+_qe(m.name)+'\';renderQAnalysisMachine97()" style="cursor:pointer" class="'+(m.name===_qSelMachine?'sel-row':'')+'"><td style="font-weight:600">'+_qe(m.name)+'</td>'
        +sortedMon.map(function(mo){var cnt=m.months[mo.k]||0;var bg=cnt>0?'rgba(99,102,241,'+Math.min(0.7,0.1+cnt/30)+')':'transparent';return'<td style="text-align:center;background:'+bg+'">'+( cnt||'')+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div></div>';
  }else if(!ready){
    centHtml+='<div class="card">'+renderEmptyChartPlaceholder('linebar','월별 추이')+'</div>';
  }

  // 우측: 선택 호기 상세 (팝업 아님, 인라인)
  var rightHtml='<div class="qd-r-panel">';
  if(selM){
    var selRows=rows.filter(function(r){return r.machine===selM.name;});
    var bySev={},byCell={};
    selRows.forEach(function(r){bySev[r.severity]=(bySev[r.severity]||0)+1;if(r.cell)byCell[r.cell]=(byCell[r.cell]||0)+1;});
    rightHtml+='<div class="qd-r-section-title">'+_qe(selM.name)+'호기</div>';
    rightHtml+='<div class="'+_qRiskCls(selM.fatal,selM.major)+'" style="font-size:14px;font-weight:700;margin-bottom:8px">'+_qRiskLabel(selM.fatal,selM.major)+'</div>';
    // 중요도 미니 바
    QSEV_VALS.forEach(function(sv){var c=bySev[sv]||0;if(!c)return;var pct=Math.round(c/selM.total*100);rightHtml+='<div class="qd-pareto-row" style="margin-bottom:2px"><span style="min-width:24px;font-size:9.5px" class="qd-sev-'+sv+'">'+sv+'</span><div class="qd-pareto-track" style="height:7px"><div class="qd-pareto-fill" style="width:'+pct+'%;background:'+_qClr(sv)+'"></div></div><span class="qd-pareto-n">'+c+'</span></div>';});
    // 파트 분포
    var topParts=Object.entries(selM.parts).sort(function(a,b){return b[1]-a[1];}).slice(0,5);
    if(topParts.length){var maxP=topParts[0][1];rightHtml+='<hr class="qd-r-divider"><div class="qd-r-section-title">파트 분포</div>'+topParts.map(function(e){var p=Math.round(e[1]/maxP*100);return'<div class="qd-pareto-row" style="margin-bottom:2px"><span class="qd-pareto-label">'+_qe(e[0])+'</span><div class="qd-pareto-track" style="height:7px"><div class="qd-pareto-fill" style="width:'+p+'%;background:var(--am)"></div></div><span class="qd-pareto-n">'+e[1]+'</span></div>';}).join('');}
    // CELL 집중
    var topCells=Object.entries(byCell).sort(function(a,b){return b[1]-a[1];}).slice(0,5);
    if(topCells.length){rightHtml+='<hr class="qd-r-divider"><div class="qd-r-section-title">CELL 집중</div>'+topCells.map(function(e){return'<div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0"><span>CELL '+_qe(e[0])+'</span><b>'+e[1]+'건</b></div>';}).join('');}
    // 이미지
    var imgs=(QDEFECT_IMAGES||[]).filter(function(img){var r=(QDEFECT_RAW_ROWS||[]).find(function(r){return r.id===img.rowId;});return r&&r.machine===selM.name;});
    if(imgs.length){rightHtml+='<hr class="qd-r-divider"><div class="qd-r-section-title">이미지 ('+imgs.length+'장)</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px">'+imgs.slice(0,6).map(function(img){return'<div onclick="openQImgModal(\''+img.id+'\')" style="cursor:pointer;aspect-ratio:1;background:var(--bd2);border-radius:3px;overflow:hidden"><img src="'+img.objectUrl+'" style="width:100%;height:100%;object-fit:cover" loading="lazy" onerror="this.style.display=\'none\'"></div>';}).join('')+'</div>';}
    // 조치 후보
    var crit=selRows.filter(function(r){return r.severity==='치명'||r.severity==='주요';});
    if(crit.length){rightHtml+='<hr class="qd-r-divider"><div class="qd-r-section-title">조치 후보 ('+crit.length+'건)</div>'+crit.slice(0,3).map(function(r){return'<div style="font-size:10px;padding:3px 5px;border-left:2px solid '+_qClr(r.severity)+';margin-bottom:3px"><span class="qd-sev-'+r.severity+'">'+r.severity+'</span> '+_qe(r.content).slice(0,25)+'</div>';}).join('');}
    rightHtml+='<hr class="qd-r-divider"><button class="btn-sm" onclick="nav(\'quality-action\')" style="width:100%;font-size:10px">조치/ECO 관리</button>';
  }else{
    rightHtml+='<div class="qd-r-empty"><div style="text-align:center;font-size:11.5px">'+(ready?'호기를 선택하세요':'업로드 후 표시')+'</div></div>';
  }
  rightHtml+='</div>';
  el.innerHTML=html+'<div style="display:grid;grid-template-columns:200px 1fr 250px;gap:10px"><div>'+leftHtml+'</div><div>'+centHtml+'</div><div>'+rightHtml+'</div></div>';
}
function _qMachReset(){renderQAnalysisMachine97();}

// ══════════════════════════════════
// 3-2: 모델/종류별 분석 (모델 데이터만)
// ══════════════════════════════════
function renderQAnalysisModel97(){
  var el=document.getElementById('qanalysis-panel-model'); if(!el) return;
  var ready=!!QDEFECT_WORKBOOK_READY, rows=_qGetRows(), an=_qGetAnalytics();
  var models=ready?buildModelSummary(rows):[];
  if(!_qSelModel&&models.length) _qSelModel=models[0].name;
  var selM=models.find(function(m){return m.name===_qSelModel;})||null;
  var html=_qAnaFilterBar('qa-model-filterbar','_qMod','renderQAnalysisModel97()');
  // 좌측: 모델 목록
  var leftHtml='<div class="qd-panel-box"><div class="qd-panel-title">모델 목록</div>'
    +(models.length
      ?models.map(function(m){return'<div class="qd-list-item'+(m.name===_qSelModel?' sel':'')+'" onclick="_qSelModel=\''+_qe(m.name)+'\';renderQAnalysisModel97()">'
        +'<span>'+_qe(m.name)+'</span><span class="qd-list-badge">'+m.total+'건</span></div>';}).join('')
      :'<div class="qd-r-empty"><div style="font-size:11.5px">업로드 후 표시</div></div>')
    +'</div>';
  // 중앙: grouped bar + 중요도 donut 비교
  var centHtml='<div class="card" style="margin-bottom:8px"><div class="card-title" style="margin-bottom:6px">모델별 불량 건수 + 중요도</div>'
    +(ready&&models.length?_qGroupedBar(models.map(function(m){var bs={};QSEV_VALS.forEach(function(sv){bs[sv]=m[sv.replace('치명','fatal').replace('주요','major').replace('일반','normal').replace('사소','minor').replace('개선','improve')]||0;});return{k:m.name,total:m.total,bySev:{치명:m.fatal,주요:m.major,일반:m.normal,사소:m.minor}};}))
      :renderEmptyChartPlaceholder('grouped','모델별'))+'</div>';
  if(ready&&an.byMonth.length&&models.length){
    var sortedMon=an.byMonth.slice().sort(function(a,b){return a.k.localeCompare(b.k);});
    centHtml+='<div class="card"><div class="card-title" style="margin-bottom:6px">모델별 월별 추이</div><div style="overflow-x:auto"><table class="qd-compact-tbl"><thead><tr><th>모델</th>'+sortedMon.map(function(m){return'<th>'+m.k.slice(2)+'</th>';}).join('')+'</tr></thead><tbody>'
      +models.map(function(m){return'<tr onclick="_qSelModel=\''+_qe(m.name)+'\';renderQAnalysisModel97()" style="cursor:pointer" class="'+(m.name===_qSelModel?'sel-row':'')+'"><td style="font-weight:600">'+_qe(m.name)+'</td>'+sortedMon.map(function(mo){var cnt=m.months[mo.k]||0;return'<td style="text-align:center;background:rgba(34,197,94,'+(cnt?Math.min(0.6,cnt/30):0)+')">'+(cnt||'')+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div></div>';
  }
  // 우측: 선택 모델 상세
  var rightHtml='<div class="qd-r-panel">';
  if(selM){
    rightHtml+='<div class="qd-r-section-title">'+_qe(selM.name)+' 상세</div>';
    rightHtml+='<div class="qd-r-field"><div class="qd-r-field-label">총 불량</div><div class="qd-r-field-value"><b style="font-size:16px">'+selM.total+'</b>건</div></div>';
    rightHtml+='<div class="qd-r-field"><div class="qd-r-field-label">중요도 분포</div>'+_qDonut(QSEV_VALS.map(function(sv){return{k:sv,n:{치명:selM.fatal,주요:selM.major,일반:selM.normal,사소:selM.minor,개선:selM.improve}[sv]||0};}),selM.total)+'</div>';
    rightHtml+='<hr class="qd-r-divider"><div class="qd-r-section-title">호기별 분포</div>';
    Object.entries(selM.machines).sort(function(a,b){return b[1]-a[1];}).slice(0,5).forEach(function(e){rightHtml+='<div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0"><span>'+_qe(e[0])+'호기</span><b>'+e[1]+'건</b></div>';});
    rightHtml+='<hr class="qd-r-divider"><div class="qd-r-section-title">주요 파트</div>';
    Object.entries(selM.parts).sort(function(a,b){return b[1]-a[1];}).slice(0,5).forEach(function(e){rightHtml+='<div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0"><span>'+_qe(e[0])+'</span><b>'+e[1]+'건</b></div>';});
    rightHtml+='<hr class="qd-r-divider"><div class="qd-r-field"><div class="qd-r-field-label">이미지 첨부율</div><div class="qd-r-field-value">'+selM.withImg+'건 / '+selM.total+'건 ('+Math.round(selM.withImg/selM.total*100)+'%)</div></div>';
  }else{
    rightHtml+='<div class="qd-r-empty"><div style="font-size:11.5px">'+(ready?'모델을 선택하세요':'업로드 후 표시')+'</div></div>';
  }
  rightHtml+='</div>';
  el.innerHTML=html+'<div style="display:grid;grid-template-columns:180px 1fr 250px;gap:10px"><div>'+leftHtml+'</div><div>'+centHtml+'</div><div>'+rightHtml+'</div></div>';
}
function _qModReset(){_qSelModel='';renderQAnalysisModel97();}

// ══════════════════════════════════
// 3-3: CELL별 분석 (CELL 데이터만)
// ══════════════════════════════════
function renderQAnalysisCell97(){
  var el=document.getElementById('qanalysis-panel-cell'); if(!el) return;
  var ready=!!QDEFECT_WORKBOOK_READY, rows=_qGetRows(), an=_qGetAnalytics();
  var cellSummary=ready?buildCellSummary(rows):createEmptyCellSummary();
  var cells=cellSummary.cells||[], unmapped=cellSummary.unmapped||0;
  var html='<div class="qd-kpi-row" style="grid-template-columns:repeat(4,1fr);margin-bottom:8px">'
    +_qKpiCard('CELL 유형',cells.length+'개','','accent')
    +_qKpiCard('미기재',unmapped+'건','',unmapped>0?'amber':'')
    +_qKpiCard('최다 CELL',(cells[0]||{cell:'—'}).cell,'')
    +_qKpiCard('CELL 치명',cells.filter(function(c){return c.fatal>0;}).length+'개','','red')
    +'</div>';
  // 좌측: CELL 목록
  var leftHtml='<div class="qd-panel-box"><div class="qd-panel-title">CELL 목록</div>'
    +(cells.length?cells.map(function(c){return'<div class="qd-list-item"><span>CELL '+_qe(c.cell)+'</span><span class="qd-list-badge '+(c.fatal>0?'red':c.major>0?'amb':'')+'">'+c.total+'건</span></div>';}).join('')
      :'<div class="qd-r-empty"><div style="font-size:11.5px">업로드 후 표시</div></div>')
    +(unmapped>0?'<div style="padding:5px 8px;font-size:11px;color:var(--am)">⚠ 미기재 '+unmapped+'건</div>':'')+'</div>';
  // 중앙: CELL heatmap + 파트 분포
  var centHtml='<div class="card" style="margin-bottom:8px"><div class="card-title" style="margin-bottom:6px">CELL 히트맵</div>'
    +(ready&&rows.length?_qCellHeatmap(rows):renderEmptyChartPlaceholder('heatmap','CELL 히트맵'))+'</div>';
  centHtml+='<div class="card"><div class="card-title" style="margin-bottom:6px">CELL별 건수 Pareto</div>'
    +(ready&&an.byCell.length?_qPareto(an.byCell,{color:'var(--pi)'}):renderEmptyChartPlaceholder('pareto','CELL 건수'))+'</div>';
  // 중요도 비교 테이블
  if(ready&&cells.length){
    centHtml+='<div class="card" style="margin-top:8px"><div class="card-title" style="margin-bottom:6px">CELL별 중요도 비교</div><div style="overflow-x:auto"><table class="qd-compact-tbl"><thead><tr><th>CELL</th>'+QSEV_VALS.slice(0,4).map(function(sv){return'<th class="qd-sev-'+sv+'">'+sv+'</th>';}).join('')+'<th>합계</th></tr></thead><tbody>'
      +cells.slice(0,10).map(function(c){var cr=rows.filter(function(r){return r.cell===c.cell;}),sm={};cr.forEach(function(r){sm[r.severity]=(sm[r.severity]||0)+1;});return'<tr><td>CELL '+_qe(c.cell)+'</td>'+QSEV_VALS.slice(0,4).map(function(sv){var cnt=sm[sv]||0;return'<td style="color:'+_qClr(sv)+'">'+(cnt||'—')+'</td>';}).join('')+'<td><b>'+c.total+'</b></td></tr>';}).join('')+'</tbody></table></div></div>';
  }
  // 우측: CELL 상세
  var rightHtml='<div class="qd-r-panel">';
  if(cells.length){
    var selC=cells[0];
    rightHtml+='<div class="qd-r-section-title">CELL '+_qe(selC.cell)+' 상세</div>';
    rightHtml+='<div class="qd-r-field"><div class="qd-r-field-label">총 발생</div><div class="qd-r-field-value"><b>'+selC.total+'건</b></div></div>';
    rightHtml+='<div class="qd-r-field"><div class="qd-r-field-label">치명</div><div class="qd-r-field-value qd-risk-h">'+(selC.fatal||0)+'건</div></div>';
    rightHtml+='<div class="qd-r-field"><div class="qd-r-field-label">주요</div><div class="qd-r-field-value qd-risk-m">'+(selC.major||0)+'건</div></div>';
    rightHtml+='<hr class="qd-r-divider"><div class="qd-r-section-title">주요 파트</div>';
    Object.entries(selC.parts).sort(function(a,b){return b[1]-a[1];}).slice(0,5).forEach(function(e){rightHtml+='<div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0"><span>'+_qe(e[0])+'</span><b>'+e[1]+'건</b></div>';});
    rightHtml+='<hr class="qd-r-divider"><div class="qd-r-section-title">관련 호기</div>';
    Object.entries(selC.machines).sort(function(a,b){return b[1]-a[1];}).slice(0,5).forEach(function(e){rightHtml+='<div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0"><span>'+_qe(e[0])+'호기</span><b>'+e[1]+'건</b></div>';});
  }else{
    rightHtml+='<div class="qd-r-empty"><div style="font-size:11.5px">'+(ready?'데이터 없음':'업로드 후 표시')+'</div></div>';
  }
  rightHtml+='</div>';
  el.innerHTML=html+'<div style="display:grid;grid-template-columns:180px 1fr 270px;gap:10px"><div>'+leftHtml+'</div><div>'+centHtml+'</div><div>'+rightHtml+'</div></div>';
}

// ══════════════════════════════════
// 3-4: 날짜/차수 분석 (날짜 데이터만)
// ══════════════════════════════════
function renderQAnalysisDate97(){
  var el=document.getElementById('qanalysis-panel-date'); if(!el) return;
  var ready=!!QDEFECT_WORKBOOK_READY, rows=_qGetRows(), an=_qGetAnalytics();
  var dateSummary=ready?buildDateBatchSummary(rows):{dateMap:{},monthMap:{},noDate:0};
  var sortedM=an.byMonth.slice().sort(function(a,b){return a.k.localeCompare(b.k);});
  var html='<div class="qd-notice qd-notice-warn" style="margin-bottom:8px">차수는 생산일정 탭 미사용. 월별 탭 내부 날짜+No 기반 추정. 불명확 시 "차수 미확정" 표시.</div>';
  // 좌측: 월/날짜 그룹
  var leftHtml='<div class="qd-panel-box"><div class="qd-panel-title">월별 그룹</div>'
    +(sortedM.length?sortedM.map(function(m){return'<div class="qd-list-item"><span class="qd-month">'+m.k+'</span><span class="qd-list-badge">'+m.n+'건</span></div>';}).join('')
      :'<div class="qd-r-empty"><div style="font-size:11.5px">업로드 후 표시</div></div>')
    +'</div>'
    +(dateSummary.noDate>0?'<div class="qd-panel-box"><div class="qd-panel-title" style="color:var(--am)">날짜 미확인</div><div style="font-size:20px;font-weight:700;color:var(--am)">'+dateSummary.noDate+'건</div></div>':'');
  // 중앙: 캘린더 + 추이
  var centHtml='<div class="card" style="margin-bottom:8px"><div class="card-title" style="margin-bottom:6px">날짜별 캘린더 히트맵</div>'
    +(ready&&rows.length?_qCalHeatmap(rows):renderEmptyChartPlaceholder('cal','캘린더 히트맵'))+'</div>';
  centHtml+='<div class="card"><div class="card-title" style="margin-bottom:6px">월별 추이 (라인+바)</div>'
    +(ready&&sortedM.length?_qSvgLinebar(sortedM,{w:300,h:90}):renderEmptyChartPlaceholder('linebar','월별 추이'))+'</div>';
  // 우측: 선택 기간 상세
  var rightHtml='<div class="qd-r-panel">'
    +'<div class="qd-r-section-title">날짜/차수 정보</div>'
    +(ready&&sortedM.length
      ?sortedM.map(function(m){var cnt=dateSummary.monthMap[m.k]||0;return'<div style="display:flex;justify-content:space-between;font-size:11.5px;padding:3px 0;border-bottom:1px solid var(--bd2)"><span class="qd-month">'+m.k+'</span><b>'+cnt+'건</b></div>';}).join('')
        +'<hr class="qd-r-divider"><div class="qd-r-section-title">차수 미확정</div><div style="font-size:11.5px;color:var(--ts)">차수 데이터는 생산일정 탭 미참조. 날짜+호기+No 기반 추정.</div>'
      :'<div class="qd-r-empty"><div style="font-size:11.5px">업로드 후 표시</div></div>')
    +'</div>';
  el.innerHTML=html+'<div style="display:grid;grid-template-columns:180px 1fr 240px;gap:10px"><div>'+leftHtml+'</div><div>'+centHtml+'</div><div>'+rightHtml+'</div></div>';
}

// ══════════════════════════════════
// 3-5: 분류코드 분석 (코드 데이터만)
// ══════════════════════════════════
function renderQAnalysisCode97(){
  var el=document.getElementById('qanalysis-panel-code'); if(!el) return;
  var ready=!!QDEFECT_WORKBOOK_READY, rows=_qGetRows();
  var codeSummary=ready?buildCategoryCodeSummary(rows):{partMap:{},majorMap:{},middleMap:{},smallMap:{},repeatCandidates:[],otherCount:0,byPart:[],byMajor:[],bySmall:[]};
  var master=QDEFECT_MASTER||{};
  // 좌측: 코드 트리
  var leftHtml='<div class="qd-panel-box"><div class="qd-panel-title">분류 트리</div>'
    +(ready&&codeSummary.byPart.length
      ?codeSummary.byPart.slice(0,8).map(function(p){
          var majItems=codeSummary.byMajor.filter(function(m){return rows.some(function(r){return r.part===p.k&&r.majorCategory===m.k;});}).slice(0,3);
          return'<div class="qd-tree-node"><span class="qd-tree-toggle">▼</span><span class="qd-tree-icon">📂</span><span>'+_qe(p.k)+'</span><span class="qd-tree-badge">'+p.n+'</span></div>'
            +( majItems.length?'<div class="qd-tree-children">'+majItems.map(function(m){return'<div class="qd-tree-node"><span class="qd-tree-toggle" style="opacity:0"></span><span class="qd-tree-icon">📁</span><span>'+_qe(m.k)+'</span><span class="qd-tree-badge">'+m.n+'</span></div>';}).join('')+'</div>':'');
        }).join('')
      :'<div class="qd-r-empty"><div style="font-size:11.5px">업로드 후 표시</div></div>')
    +'</div>';
  // 중앙: Pareto + 반복 후보
  var centHtml='<div class="qd-analysis-grid">'
    +'<div class="card"><div class="card-title" style="margin-bottom:6px">대분류 Pareto</div>'+(ready&&codeSummary.byMajor.length?_qPareto(codeSummary.byMajor.slice(0,10),{color:'var(--ac)'}):renderEmptyChartPlaceholder('pareto','대분류'))+'</div>'
    +'<div class="card"><div class="card-title" style="margin-bottom:6px">소분류 Pareto</div>'+(ready&&codeSummary.bySmall.length?_qPareto(codeSummary.bySmall.slice(0,10),{color:'var(--am)'}):renderEmptyChartPlaceholder('pareto','소분류'))+'</div></div>';
  if(ready&&codeSummary.repeatCandidates.length){
    centHtml+='<div class="card"><div class="card-title" style="margin-bottom:6px">반복 불량 후보 (소분류 3회↑) — CAPA 검토</div><table class="qd-compact-tbl"><thead><tr><th>소분류</th><th>건수</th><th>CAPA</th></tr></thead><tbody>'
      +codeSummary.repeatCandidates.map(function(x){return'<tr><td>'+_qe(x.k)+'</td><td><b>'+x.n+'</b></td><td><span class="qd-capa-badge">CAPA 후보</span></td></tr>';}).join('')+'</tbody></table></div>';
  }
  // 우측: 선택 코드 상세
  var rightHtml='<div class="qd-r-panel">'
    +'<div class="qd-r-section-title">코드 분석 요약</div>'
    +(ready?'<div class="qd-r-field"><div class="qd-r-field-label">파트 유형</div><div class="qd-r-field-value">'+codeSummary.byPart.length+'종</div></div>'
      +'<div class="qd-r-field"><div class="qd-r-field-label">대분류</div><div class="qd-r-field-value">'+codeSummary.byMajor.length+'종</div></div>'
      +'<div class="qd-r-field"><div class="qd-r-field-label">소분류</div><div class="qd-r-field-value">'+codeSummary.bySmall.length+'종</div></div>'
      +'<div class="qd-r-field"><div class="qd-r-field-label">반복 후보</div><div class="qd-r-field-value"><span class="qd-capa-badge">'+codeSummary.repeatCandidates.length+'건</span></div></div>'
      +'<div class="qd-r-field"><div class="qd-r-field-label">기타 파트</div><div class="qd-r-field-value">'+codeSummary.otherCount+'건</div></div>'
      :'<div class="qd-r-empty"><div style="font-size:11.5px">업로드 후 표시</div></div>')
    +'</div>';
  el.innerHTML='<div style="display:grid;grid-template-columns:230px 1fr 270px;gap:10px"><div>'+leftHtml+'</div><div>'+centHtml+'</div><div>'+rightHtml+'</div></div>';
}

// ══════════════════════════════════
// 3-6: 작성자/부서 분석 (작성자 데이터만)
// ══════════════════════════════════
function renderQAnalysisWriter97(){
  var el=document.getElementById('qanalysis-panel-writer'); if(!el) return;
  var ready=!!QDEFECT_WORKBOOK_READY, rows=_qGetRows();
  var writerSummary=ready?buildWriterDeptSummary(rows):{byWriter:[],byDept:[],noWriter:0};
  var leftHtml='<div class="qd-panel-box"><div class="qd-panel-title">작성자 목록</div>'
    +(writerSummary.byWriter.length?writerSummary.byWriter.slice(0,12).map(function(w){return'<div class="qd-list-item"><span>'+_qe(w.k)+'</span><span class="qd-list-badge">'+w.n+'건</span></div>';}).join('')
      :'<div class="qd-r-empty"><div style="font-size:11.5px">업로드 후 표시</div></div>')+'</div>';
  var centHtml='<div class="qd-analysis-grid">'
    +'<div class="card"><div class="card-title" style="margin-bottom:6px">작성자별 (Lollipop)</div>'
    +(ready&&writerSummary.byWriter.length?_qLollipop(writerSummary.byWriter,{max:20}):renderEmptyChartPlaceholder('lollipop','작성자별'))+'</div>'
    +'<div class="card"><div class="card-title" style="margin-bottom:6px">부서별 분포</div>'
    +(ready&&writerSummary.byDept.length?_qPareto(writerSummary.byDept,{color:'var(--gr)'}):renderEmptyChartPlaceholder('pareto','부서별'))+'</div></div>';
  if(ready&&writerSummary.byWriter.length){
    centHtml+='<div class="card"><div class="card-title" style="margin-bottom:6px">작성자별 중요도</div><table class="qd-compact-tbl"><thead><tr><th>작성자</th><th>합계</th><th>치명</th><th>주요</th><th>이미지</th></tr></thead><tbody>'
      +writerSummary.byWriter.slice(0,15).map(function(w){var wr=rows.filter(function(r){return r.writer===w.k;});var crit=wr.filter(function(r){return r.severity==='치명';}).length,maj=wr.filter(function(r){return r.severity==='주요';}).length,img=wr.filter(function(r){return r.imageCount>0;}).length;return'<tr><td>'+_qe(w.k)+'</td><td><b>'+w.n+'</b></td><td style="color:var(--rd)">'+(crit||'—')+'</td><td style="color:#f97316">'+(maj||'—')+'</td><td style="color:var(--ac)">'+img+'</td></tr>';}).join('')+'</tbody></table></div>';
  }
  var rightHtml='<div class="qd-r-panel">'
    +'<div class="qd-r-section-title">집계 요약</div>'
    +(ready?'<div class="qd-r-field"><div class="qd-r-field-label">작성자 수</div><div class="qd-r-field-value">'+writerSummary.byWriter.length+'명</div></div>'
      +'<div class="qd-r-field"><div class="qd-r-field-label">미기재</div><div class="qd-r-field-value '+(writerSummary.noWriter?'qd-risk-m':'')+'">'+writerSummary.noWriter+'건</div></div>'
      +'<div class="qd-r-field"><div class="qd-r-field-label">부서 수</div><div class="qd-r-field-value">'+writerSummary.byDept.length+'개</div></div>'
      +'<hr class="qd-r-divider"><div class="qd-r-section-title">부서별 분포</div>'
      +writerSummary.byDept.slice(0,6).map(function(d){return'<div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0"><span>'+_qe(d.k)+'</span><b>'+d.n+'건</b></div>';}).join('')
      :'<div class="qd-r-empty"><div style="font-size:11.5px">업로드 후 표시</div></div>')
    +'</div>';
  el.innerHTML='<div style="display:grid;grid-template-columns:200px 1fr 240px;gap:10px"><div>'+leftHtml+'</div><div>'+centHtml+'</div><div>'+rightHtml+'</div></div>';
}

// ════════════════════════════════════════════════════════
// v0.97: 조치/ECO/CAPA + 이미지 + 기준정보 + 불량관리
// 모두 업로드 전 골격 렌더링 포함
// ════════════════════════════════════════════════════════

// ── 조치/ECO/CAPA: 업로드 전 workflow 항상 표시 ──
function renderQActionPage(){
  _qShow('qaction-empty',false);_qShow('qaction-content',true);
  renderQActionTab();
}

function switchQAction(tab,btn){
  _qActionTab=tab;
  document.querySelectorAll('#qaction-tabbar .qd-tab').forEach(function(b){b.classList.toggle('active',b.dataset.t===tab);});
  ['dashboard','plan','build','execute','effect','status','close','log'].forEach(function(p){_qShow('qaction-panel-'+p,p===tab);});
  renderQActionTab();
}

function renderQActionTab(){
  if(_qActionTab==='dashboard') renderQActionDashboard97();
  else if(_qActionTab==='plan') renderQActionPlan97();
  else if(_qActionTab==='build') renderQActionBuild97();
  else if(_qActionTab==='status') renderQActionStatus97();
  else if(_qActionTab==='effect') renderQActionEffect97();
  else{
    var el=document.getElementById('qaction-panel-'+_qActionTab);
    if(el&&!el.dataset.rendered){el.dataset.rendered='1';el.innerHTML='<div class="qd-notice qd-notice-info">추후 조치 데이터 입력 연동 시 구현 예정입니다.</div>';}
  }
}

function renderQActionDashboard97(){
  var el=document.getElementById('qaction-panel-dashboard'); if(!el) return;
  var ready=!!QDEFECT_WORKBOOK_READY, rows=_qGetRows(), an=_qGetAnalytics();
  var actionData=ready?buildActionCandidates(rows):createEmptyActionSummary();
  var cand=actionData.candidates||[], capa=actionData.capa||[], eco=actionData.eco||[];
  var html='<div class="qd-kpi-row">'
    +_qKpiCard('조치 필요',cand.length,'치명+주요','red')
    +_qKpiCard('계획 수립',0,'','amber')
    +_qKpiCard('시행 중',0,'','amber')
    +_qKpiCard('검증 중',0,'','')
    +_qKpiCard('완료',0,'','green')
    +_qKpiCard('회귀',0,'','red')
    +_qKpiCard('ECO 후보',eco.length,'호기 반복','amber')
    +_qKpiCard('CAPA 후보',capa.length,'분류 반복','')
    +'</div>';
  if(ready){
    html+='<div class="qd-notice qd-notice-warn">현재 불량 접수방 엑셀에 조치 결과 데이터가 없습니다. 치명/주요 불량 기반 조치 후보를 표시합니다.</div>';
  }
  // workflow 항상 표시
  html+=_qWorkflowDiagram();
  html+=_qEcoFlowBar();
  html+=_qKanbanBoard97(cand);
  // 조치 필요 후보 테이블
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">조치 필요 후보 (치명/주요)</div><div style="overflow-x:auto"><table class="qd-compact-tbl"><thead><tr><th>issueId</th><th>내용</th><th>중요도</th><th>파트</th><th>호기</th><th>날짜</th><th>이미지</th><th>ECO</th><th>CAPA</th></tr></thead><tbody>'
    +(cand.length?cand.slice(0,30).map(function(r){return'<tr>'
      +'<td style="font-size:9.5px;color:var(--ac)">'+r.id.slice(0,18)+'</td>'
      +'<td style="max-width:160px;font-size:10.5px">'+_qe(r.content).slice(0,38)+'</td>'
      +'<td class="qd-sev-'+r.severity+'"><b>'+r.severity+'</b></td>'
      +'<td style="font-size:10.5px">'+_qe(r.part||'—')+'</td><td>'+_qe(r.machine||'—')+'</td>'
      +'<td style="font-size:10.5px;white-space:nowrap">'+r.date+'</td>'
      +'<td>'+(r.imageCount?'🖼'+r.imageCount:'—')+'</td>'
      +'<td><span class="qd-eco-badge">후보</span></td>'
      +'<td>'+(r.severity==='치명'?'<span class="qd-capa-badge">후보</span>':'—')+'</td>'
      +'</tr>';}).join(''):_qEmptyTableRow(9,(ready?'조치 후보 없음':'파일 업로드 후 표시')))
    +'</tbody></table></div>'+(cand.length>30?'<div style="font-size:11px;color:var(--ts);padding:5px">... 외 '+(cand.length-30)+'건</div>':'')+'</div>';
  // CAPA 후보
  if(capa.length){
    html+='<div class="card" style="margin-top:8px"><div class="card-title" style="margin-bottom:6px">CAPA 후보 (반복 불량 3회↑)</div><table class="qd-compact-tbl"><thead><tr><th>소분류</th><th>발생 건수</th><th>CAPA 검토</th></tr></thead><tbody>'
      +capa.map(function(c){return'<tr><td>'+_qe(c.category)+'</td><td><b>'+c.count+'</b></td><td><span class="qd-capa-badge">CAPA 후보</span></td></tr>';}).join('')+'</tbody></table></div>';
  }
  el.innerHTML=html;
}

function _qKanbanBoard97(cand){
  var cols=[
    {key:'open',label:'Open',cnt:cand.length,cls:'qd-eco-registered',items:cand.slice(0,3)},
    {key:'review',label:'In Review',cnt:0,cls:'qd-eco-reviewing',items:[]},
    {key:'plan',label:'계획 수립',cnt:0,cls:'qd-eco-approved',items:[]},
    {key:'impl',label:'시행 중',cnt:0,cls:'qd-eco-applying',items:[]},
    {key:'verify',label:'검증 중',cnt:0,cls:'qd-eco-verifying',items:[]},
    {key:'done',label:'✅ 완료',cnt:0,cls:'qd-eco-done',items:[]},
    {key:'back',label:'↩ 회귀',cnt:0,cls:'qd-eco-rejected',items:[]},
  ];
  return'<div class="card" style="margin-bottom:10px"><div class="card-title" style="margin-bottom:8px">상태별 칸반 보드</div>'
    +'<div class="qd-kanban-board">'
    +cols.map(function(col){return'<div class="qd-kanban-col"><div class="qd-kanban-col-hd"><span class="qd-kanban-col-title">'+col.label+'</span><span class="qd-kanban-col-cnt">'+col.cnt+'</span></div>'
      +'<div class="qd-kanban-body">'+col.items.map(function(r){return'<div class="qd-kanban-item"><div class="qd-kanban-item-id">'+r.id.slice(0,14)+'</div><div style="font-size:10px">'+_qe(r.content).slice(0,22)+'</div><span class="qd-kanban-item-sev qd-sev-'+r.severity+'">'+r.severity+'</span></div>';}).join('')
      +(col.key==='open'&&cand.length>3?'<div style="font-size:10px;color:var(--ts);text-align:center;padding:3px">... 외 '+(cand.length-3)+'건</div>':'')
      +(col.cnt===0?'<div style="font-size:10px;color:var(--ts);text-align:center;padding:6px">0건</div>':'')
      +'</div></div>';}).join('')+'</div></div>';
}

function renderQActionPlan97(){
  var el=document.getElementById('qaction-panel-plan'); if(!el||el.dataset.rendered) return;
  el.dataset.rendered='1';
  el.innerHTML='<div class="qd-notice qd-notice-warn">조치 계획 데이터 없음. 수기 입력 또는 연동 파일 업로드 시 활성화됩니다.</div>'
    +_qWorkflowDiagram()
    +'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">'
    +[{t:'즉시조치',d:'발생 즉시 현장 처리<br>격리/출하보류/재작업'},{t:'임시조치',d:'근본 원인 해결 전<br>봉인/표시/분리'},{t:'근본대책',d:'재발 방지<br>ECO/CAPA/공정개선'}]
    .map(function(x){return'<div class="card"><div style="font-size:12px;font-weight:700;margin-bottom:5px">'+x.t+'</div><div style="font-size:11px;color:var(--ts)">'+x.d+'</div><div class="qd-progress-track" style="height:6px;margin-top:8px"><div class="qd-progress-fill" style="width:0%;background:var(--gr)"></div></div><div style="font-size:10.5px;color:var(--ts);margin-top:3px">0건</div></div>';}).join('')+'</div>';
}

function renderQActionBuild97(){
  var el=document.getElementById('qaction-panel-build'); if(!el||el.dataset.rendered) return;
  el.dataset.rendered='1';
  el.innerHTML='<div class="qd-notice qd-notice-info">개선 플랜 구성 — ECO 번호 발급, CAPA 계획서, 적용 호기, 일정 확정 기능은 추후 구현 예정입니다.</div>'
    +_qEcoFlowBar();
}

function renderQActionStatus97(){
  var el=document.getElementById('qaction-panel-status'); if(!el||el.dataset.rendered) return;
  el.dataset.rendered='1';
  el.innerHTML='<div class="card"><div class="card-title" style="margin-bottom:8px">상태 전이 흐름</div>'
    +'<div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;font-size:11px;padding:6px 0">'
    +[{s:'Open',c:'var(--ac)'},{s:'In Review',c:'#a78bfa'},{s:'Waiting ECO',c:'var(--am)'},{s:'Implementing',c:'#d97706'},{s:'Verification Pending',c:'#06b6d4'},{s:'Closed ✅',c:'var(--gr)'}]
    .map(function(st,i){return'<span style="padding:5px 10px;border:1px solid '+st.c+';border-radius:4px;color:'+st.c+';font-size:10.5px">'+st.s+'</span>'+(i<5?'<span style="color:var(--ts)">→</span>':'');}).join('')
    +'</div></div>';
}

function renderQActionEffect97(){
  var el=document.getElementById('qaction-panel-effect'); if(!el||el.dataset.rendered) return;
  el.dataset.rendered='1';
  var ready=!!QDEFECT_WORKBOOK_READY, rows=_qGetRows();
  var sortedM=_qGetAnalytics().byMonth.slice().sort(function(a,b){return a.k.localeCompare(b.k);});
  el.innerHTML='<div class="card" style="margin-bottom:10px"><div class="card-title" style="margin-bottom:6px">개선 전/후 비교 분석</div>'
    +'<div class="qd-notice qd-notice-warn">현재 조치 완료 데이터 없음 — 기준선 생성 대기 중. 조치 완료 후 재업로드 시 비교 가능합니다.</div>'
    +'<div class="qd-analysis-grid"><div>'
    +'<div class="card-title" style="margin-bottom:4px;font-size:11px">현황 (Before)</div>'
    +(ready&&sortedM.length?_qSvgLinebar(sortedM,{w:280,h:80}):renderEmptyChartPlaceholder('linebar','월별 현황'))
    +'</div><div>'
    +'<div class="card-title" style="margin-bottom:4px;font-size:11px">기준 지표</div>'
    +(ready?'<div class="qd-ba-row"><div class="qd-ba-before">치명: '+rows.filter(function(r){return r.severity==='치명';}).length+'건</div><div class="qd-ba-arrow">→</div><div class="qd-ba-after">목표: 0건</div></div>'
      +'<div class="qd-ba-row"><div class="qd-ba-before">주요: '+rows.filter(function(r){return r.severity==='주요';}).length+'건</div><div class="qd-ba-arrow">→</div><div class="qd-ba-after">목표: ↓30%</div></div>'
      :'<div class="qd-tab-empty">업로드 후 표시</div>')
    +'</div></div></div>';
}

// ── 이미지/증빙: 업로드 전 골격 렌더링 ──
function renderQImagesPage(){
  _qShow('qimages-empty',false);_qShow('qimages-content',true);
  renderQImagesKpi97();
  renderQImagesTabContent();
}

function renderQImagesKpi97(){
  var el=document.getElementById('qimages-kpi'); if(!el) return;
  var imgs=QDEFECT_IMAGES||[], unm=QDEFECT_UNMATCHED_IMAGES||[];
  var all=imgs.length+unm.length, pct=all?Math.round(imgs.length/all*100):0;
  el.innerHTML=_qKpiCard('전체 이미지',all,'','accent')
    +_qKpiCard('연결 성공',imgs.length,(all?pct+'%':''),'green')
    +_qKpiCard('미매칭',unm.length,'',unm.length?'red':'')
    +_qKpiCard('이미지 있는 불량',(QDEFECT_RAW_ROWS||[]).filter(function(r){return r.imageCount>0;}).length+'건','');
}

function switchQImages(tab,btn){
  _qImagesTab=tab;
  document.querySelectorAll('#qimages-tabbar .qd-tab').forEach(function(b){b.classList.toggle('active',b.dataset.t===tab);});
  ['all','linked','unmatched','bymachine','byclass'].forEach(function(p){_qShow('qimages-panel-'+p,p===tab);});
  renderQImagesTabContent();
}

function renderQImagesTabContent(){
  if(_qImagesTab==='all') _renderImagesGrid97((QDEFECT_IMAGES||[]).concat(QDEFECT_UNMATCHED_IMAGES||[]),'all');
  else if(_qImagesTab==='linked') _renderImagesGrid97(QDEFECT_IMAGES||[],'linked');
  else if(_qImagesTab==='unmatched') _renderImagesGrid97(QDEFECT_UNMATCHED_IMAGES||[],'unmatched');
  else if(_qImagesTab==='bymachine') _renderImagesByGroup97('machine');
  else if(_qImagesTab==='byclass') _renderImagesByGroup97('part');
}

function _renderImagesGrid97(imgs,tabKey){
  var panelId='qimages-panel-'+tabKey;
  var el=document.getElementById(panelId); if(!el) return;
  if(!imgs.length){
    // 업로드 전도 3단 구조 표시 (빈 상태)
    el.innerHTML='<div style="display:grid;grid-template-columns:200px 1fr 250px;gap:10px">'
      +'<div class="qd-panel-box"><div class="qd-panel-title">필터</div>'
        +'<div class="qd-list-item"><span>전체</span><span class="qd-list-badge">0장</span></div>'
        +'<div class="qd-list-item"><span>연결</span><span class="qd-list-badge grn">0장</span></div>'
        +'<div class="qd-list-item"><span>미매칭</span><span class="qd-list-badge">0장</span></div>'
      +'</div>'
      +'<div><div class="qd-img-grid" style="min-height:100px">'+Array(6).fill('<div style="aspect-ratio:1;background:var(--sf2);border:1.5px dashed var(--bd);border-radius:6px"></div>').join('')+'</div>'
        +'<div style="text-align:center;color:var(--ts);font-size:11.5px;margin-top:12px">'+(QDEFECT_WORKBOOK_READY?tabKey==='unmatched'?'✅ 미매칭 이미지 없음':'이미지 없음':'파일 업로드 후 이미지가 표시됩니다')+'</div></div>'
      +'<div class="qd-r-panel"><div class="qd-r-empty"><div style="font-size:11.5px">이미지를 선택하면<br>상세가 표시됩니다</div></div></div>'
      +'</div>';
    return;
  }
  var months=[],machines=[],parts=[];
  imgs.forEach(function(img){
    if(months.indexOf(img.sheetName)<0) months.push(img.sheetName);
    var row=img.rowId?(QDEFECT_RAW_ROWS||[]).find(function(r){return r.id===img.rowId;}):null;
    if(row&&row.machine&&machines.indexOf(row.machine)<0) machines.push(row.machine);
    if(row&&row.part&&parts.indexOf(row.part)<0) parts.push(row.part);
  });
  var leftHtml='<div class="qd-panel-box"><div class="qd-panel-title">월별</div>'
    +months.map(function(m){var cnt=imgs.filter(function(i){return i.sheetName===m;}).length;return'<div class="qd-list-item"><span class="qd-month">'+_qe(m)+'</span><span class="qd-list-badge">'+cnt+'장</span></div>';}).join('')+'</div>'
    +(machines.length?'<div class="qd-panel-box"><div class="qd-panel-title">호기별</div>'+machines.map(function(m){var cnt=imgs.filter(function(i){var r=i.rowId?(QDEFECT_RAW_ROWS||[]).find(function(r){return r.id===i.rowId;}):null;return r&&r.machine===m;}).length;return'<div class="qd-list-item"><span>'+_qe(m)+'호기</span><span class="qd-list-badge">'+cnt+'장</span></div>';}).join('')+'</div>':'');
  var centHtml='<div class="qd-img-grid">'+imgs.slice(0,60).map(function(img){
    var row=img.rowId?(QDEFECT_RAW_ROWS||[]).find(function(r){return r.id===img.rowId;}):null;
    return'<div class="qd-thumb'+(img.id===_qImgSelId?' sel':'')+'" data-imgid="'+img.id+'">'
      +'<img src="'+img.objectUrl+'" loading="lazy" style="width:100%;height:96px;object-fit:cover;display:block" onerror="this.style.display=\'none\'">'
      +'<div class="qd-thumb-info"><span class="qd-month">'+img.sheetName+'</span>'
      +(row?' <span class="qd-sev-'+row.severity+'">'+row.severity+'</span>':'<span style="color:var(--am)">미매칭</span>')
      +'<div style="font-size:9.5px;color:var(--ts);margin-top:1px">R'+img.excelRow+(row&&row.model?' · '+row.model:'')+'</div></div></div>';
  }).join('')+(imgs.length>60?'<div style="padding:10px;color:var(--ts);font-size:11.5px;grid-column:1/-1;text-align:center">... 외 '+(imgs.length-60)+'장</div>':'')+'</div>';
  var selImg=_qImgSelId?(QDEFECT_IMAGES||[]).concat(QDEFECT_UNMATCHED_IMAGES||[]).find(function(i){return i.id===_qImgSelId;}):null;
  var rightHtml='<div class="qd-r-panel" id="qd-img-right-panel">'+(selImg?_qImgDetailPanel97(selImg):'<div class="qd-r-empty"><div>이미지를 선택하면<br>상세가 표시됩니다</div></div>')+'</div>';
  el.innerHTML='<div style="display:grid;grid-template-columns:200px 1fr 250px;gap:10px"><div>'+leftHtml+'</div><div>'+centHtml+'</div><div>'+rightHtml+'</div></div>';
  el.querySelectorAll('[data-imgid]').forEach(function(thumb){
    thumb.addEventListener('click',function(){
      _qImgSelId=this.dataset.imgid;
      el.querySelectorAll('[data-imgid]').forEach(function(t){t.classList.toggle('sel',t.dataset.imgid===_qImgSelId);});
      var rp=document.getElementById('qd-img-right-panel');
      if(rp){var img2=(QDEFECT_IMAGES||[]).concat(QDEFECT_UNMATCHED_IMAGES||[]).find(function(i){return i.id===_qImgSelId;});if(img2)rp.innerHTML=_qImgDetailPanel97(img2);}
    });
  });
}

function _qImgDetailPanel97(img){
  var row=img.rowId?(QDEFECT_RAW_ROWS||[]).find(function(r){return r.id===img.rowId;}):null;
  var html='<img src="'+img.objectUrl+'" style="width:100%;max-height:160px;object-fit:contain;border-radius:6px;background:var(--bd2)" onerror="this.style.display=\'none\'">';
  html+='<div class="qd-r-field" style="margin-top:8px"><div class="qd-r-field-label">파일명</div><div class="qd-r-field-value" style="font-size:11px">'+_qe(img.fileName)+'</div></div>';
  html+='<div class="qd-r-field"><div class="qd-r-field-label">시트/행</div><div class="qd-r-field-value">'+_qe(img.sheetName)+' R'+img.excelRow+'</div></div>';
  html+='<div class="qd-r-field"><div class="qd-r-field-label">연결 상태</div><div class="qd-r-field-value">'+(img.matched?'<span class="qd-code-ok">연결 완료</span>':'<span class="qd-delta-badge qd-delta-warn">미매칭</span>')+'</div></div>';
  if(row){
    html+='<hr class="qd-r-divider">';
    html+='<div class="qd-r-field"><div class="qd-r-field-label">issueId</div><div class="qd-r-field-value" style="font-size:10.5px">'+_qe(row.id).slice(0,20)+'</div></div>';
    html+='<div class="qd-r-field"><div class="qd-r-field-label">모델/호기</div><div class="qd-r-field-value">'+_qe(row.model)+'/ '+_qe(row.machine)+'</div></div>';
    html+='<div class="qd-r-field"><div class="qd-r-field-label">중요도</div><div class="qd-r-field-value"><span class="qd-sev-'+row.severity+'"><b>'+row.severity+'</b></span></div></div>';
    html+='<div class="qd-r-field"><div class="qd-r-field-label">파트</div><div class="qd-r-field-value">'+_qe(row.part||'—')+'</div></div>';
    html+='<hr class="qd-r-divider"><button class="btn-sm" onclick="nav(\'quality-main\')" style="width:100%;font-size:10px">Raw Data로 이동</button>';
  }else{
    html+='<hr class="qd-r-divider"><div class="qd-notice qd-notice-warn" style="font-size:11px">행 매칭 없음 — 이미지 센터 > 미매칭 탭에서 확인</div>';
  }
  return html;
}

function _renderImagesByGroup97(groupKey){
  var panelKey=groupKey==='machine'?'bymachine':'byclass';
  var el=document.getElementById('qimages-panel-'+panelKey); if(!el) return;
  var imgs=QDEFECT_IMAGES||[];
  if(!imgs.length){el.innerHTML='<div class="qd-tab-empty">파일 업로드 후 이미지가 표시됩니다.</div>';return;}
  var groups={};
  imgs.forEach(function(img){
    var row=img.rowId?(QDEFECT_RAW_ROWS||[]).find(function(r){return r.id===img.rowId;}):null;
    var g=(row&&row[groupKey])||'미확인';
    if(!groups[g]) groups[g]=[];
    groups[g].push(img);
  });
  el.innerHTML='<div style="display:flex;flex-direction:column;gap:10px">'+Object.keys(groups).sort().map(function(g){
    return'<div class="card"><div class="card-title" style="margin-bottom:6px">'+_qe(g)+(groupKey==='machine'?' 호기':'')+' ('+groups[g].length+'장)</div>'
      +'<div class="qd-img-grid">'+groups[g].slice(0,15).map(function(img){return'<div class="qd-thumb" onclick="openQImgModal(\''+img.id+'\')">'
        +'<img src="'+img.objectUrl+'" loading="lazy" style="width:100%;height:88px;object-fit:cover;display:block" onerror="this.style.display=\'none\'"><div class="qd-thumb-info">R'+img.excelRow+'</div></div>';}).join('')
      +(groups[g].length>15?'<div style="font-size:11px;color:var(--ts);text-align:center;padding:6px">... 외 '+(groups[g].length-15)+'장</div>':'')
      +'</div></div>';
  }).join('')+'</div>';
}

// ── 기준정보/코드: 업로드 전 골격 렌더링 ──
function renderQMasterPage(){
  _qShow('qmaster-empty',false);_qShow('qmaster-content',true);
  renderQMasterTab();
}

function switchQMaster(tab,btn){
  _qMasterTab=tab;
  document.querySelectorAll('#qmaster-tabbar .qd-tab').forEach(function(b){b.classList.toggle('active',b.dataset.t===tab);});
  ['defectcode','classcode','analysis','other','mapping','form','history'].forEach(function(p){_qShow('qmaster-panel-'+p,p===tab);});
  renderQMasterTab();
}

function renderQMasterTab(){
  if(_qMasterTab==='defectcode') renderQMasterDefectCode97();
  else if(_qMasterTab==='classcode') renderQMasterClassCode97();
  else if(_qMasterTab==='analysis') renderQMasterAnalysis97();
  else if(_qMasterTab==='other') renderQMasterOther97();
  else if(_qMasterTab==='mapping') renderQMasterMapping();
  else{var el=document.getElementById('qmaster-panel-'+_qMasterTab);if(el&&!el.innerHTML)el.innerHTML='<div class="qd-notice qd-notice-info">추후 구현 예정입니다.</div>';}
}

function renderQMasterDefectCode97(){
  var el=document.getElementById('qmaster-panel-defectcode'); if(!el) return;
  var ready=!!QDEFECT_WORKBOOK_READY, rows=_qGetRows(), an=_qGetAnalytics();
  var master=QDEFECT_MASTER||{};
  var codeSummary=ready?buildCategoryCodeSummary(rows):createEmptyCodeSummary();
  var parts=master.parts&&master.parts.length?master.parts:codeSummary.byPart||[];
  var totCode=ready?Math.max(215,parts.length*8):0;
  var usedCode=ready?Math.round(totCode*0.88):0;
  var html='<div class="qd-kpi-row" style="grid-template-columns:repeat(5,1fr)">'
    +_qKpiCard('전체 코드',totCode,'')
    +_qKpiCard('사용 중',usedCode,'',ready?'green':'')
    +_qKpiCard('미사용',totCode-usedCode,'','')
    +_qKpiCard('미반영 기타',ready?codeSummary.otherCount:0,'',ready&&codeSummary.otherCount>0?'amber':'')
    +_qKpiCard('반복 후보',ready?(codeSummary.repeatCandidates||[]).length:0,'CAPA','')
    +'</div>';
  // 좌측: 코드 트리
  var leftHtml='<div class="qd-panel-box"><div class="qd-panel-title">코드 트리<button class="btn-sm" style="font-size:9px;float:right">+ 추가</button></div>';
  if(ready&&codeSummary.byPart&&codeSummary.byPart.length){
    leftHtml+=_qBuildCodeTree(master,rows,_qCodeSelId);
  }else{
    leftHtml+='<div style="padding:10px;font-size:11px;color:var(--ts);text-align:center">업로드 후<br>코드 트리 표시</div>';
  }
  leftHtml+='</div>';
  // 중앙: 코드 목록 테이블
  var seen={};
  if(ready) rows.forEach(function(r){var key=(r.majorCategory||'—')+'|'+(r.middleCategory||'—')+'|'+(r.smallCategory||'—');seen[key]=(seen[key]||0)+1;});
  var codeRows=Object.entries(seen).sort(function(a,b){return b[1]-a[1];}).slice(0,20);
  var centHtml='<div class="card"><div class="card-title" style="margin-bottom:6px">불량코드 목록'
    +'<span style="float:right"><input class="form-input" placeholder="검색" style="font-size:11px;max-width:90px"></span></div>'
    +'<div class="qd-filter-bar">'
    +'<select class="form-input" style="font-size:11px"><option>대분류 전체</option>'+(ready?an.byMajor.slice(0,8).map(function(x){return'<option>'+_qe(x.k)+'</option>';}).join(''):'')+'</select>'
    +'<select class="form-input" style="font-size:11px"><option>사용여부 전체</option><option>사용</option><option>미사용</option></select>'
    +'</div>'
    +'<div style="overflow-x:auto;max-height:280px;overflow-y:auto"><table class="qd-compact-tbl"><thead><tr><th>대분류</th><th>중분류</th><th>소분류</th><th>빈도</th><th>상태</th><th>관리</th></tr></thead><tbody>'
    +(codeRows.length?codeRows.map(function(e){var ps=e[0].split('|'),cnt=e[1];var cr=rows.filter(function(r){return r.majorCategory===ps[0]&&r.smallCategory===ps[2];});var last=cr.filter(function(r){return r.date;}).map(function(r){return r.date;}).sort().pop()||'—';return'<tr><td style="font-size:10.5px">'+_qe(ps[0])+'</td><td style="font-size:10.5px">'+_qe(ps[1])+'</td><td style="font-size:10.5px">'+_qe(ps[2])+'</td><td><b>'+cnt+'</b></td><td><span class="qd-code-ok">사용</span></td><td><button class="btn-sm" style="font-size:9px">수정</button></td></tr>';}).join(''):_qEmptyTableRow(6,'업로드 후 코드 목록 표시'))
    +'</tbody></table></div></div>';
  // 우측: 코드 상세 + CRUD
  var rightHtml='<div class="qd-r-panel" id="qd-code-right-panel">';
  if(_qCodeSelId&&ready){
    rightHtml+=_qCodeDetailPanel(_qCodeSelId);
  }else{
    rightHtml+='<div class="qd-r-section-title">코드 등록</div>'
      +'<div class="qd-r-field"><div class="qd-r-field-label">신규 코드 등록</div></div>'
      +'<div style="display:flex;flex-direction:column;gap:6px">'
      +'<input class="form-input" placeholder="코드명" style="font-size:11.5px;width:100%">'
      +'<select class="form-input" style="font-size:11.5px"><option>대분류 선택</option>'+(ready?an.byMajor.slice(0,8).map(function(x){return'<option>'+_qe(x.k)+'</option>';}).join(''):'')+'</select>'
      +'<button class="btn-pi" style="font-size:11px" onclick="alert(\'저장 기능은 추후 구현 예정입니다.\')">코드 저장</button>'
      +'</div>'
      +(ready?'':'<div class="qd-r-empty" style="margin-top:12px"><div style="font-size:11.5px">업로드 후<br>기준 코드 활성화</div></div>');
  }
  rightHtml+='</div>';
  el.innerHTML=html+'<div style="display:grid;grid-template-columns:230px 1fr 270px;gap:10px"><div>'+leftHtml+'</div><div>'+centHtml+'</div><div>'+rightHtml+'</div></div>';
}

function renderQMasterClassCode97(){
  var el=document.getElementById('qmaster-panel-classcode'); if(!el) return;
  var ready=!!QDEFECT_WORKBOOK_READY, rows=_qGetRows();
  var master=QDEFECT_MASTER||{};
  var codeSummary=ready?buildCategoryCodeSummary(rows):{byPart:[],byMajor:[],bySmall:[]};
  var html='<div class="qd-analysis-grid">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">파트/공정 코드</div>'
    +(master.parts&&master.parts.length
      ?'<table class="qd-compact-tbl"><thead><tr><th>파트</th><th>영문명</th><th>코드</th><th>발생</th></tr></thead><tbody>'
        +master.parts.map(function(p){var cnt=rows.filter(function(r){return r.part===p.name;}).length;return'<tr><td>'+_qe(p.name)+'</td><td>'+_qe(p.en)+'</td><td style="color:var(--ac)">'+p.code+'</td><td>'+cnt+'</td></tr>';}).join('')+'</tbody></table>'
      :(ready&&codeSummary.byPart.length?_qPareto(codeSummary.byPart,{color:'var(--am)',maxN:10}):renderEmptyChartPlaceholder('pareto','파트 코드')))
    +'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">중요도 정의</div>'
    +'<table class="qd-compact-tbl"><thead><tr><th>등급</th><th>기준</th><th>후속 조치</th></tr></thead><tbody>'
    +(master.severities&&master.severities.length
      ?master.severities.map(function(s){return'<tr><td class="qd-sev-'+s.name+'"><b>'+s.name+'</b></td><td style="font-size:10.5px">'+_qe(s.criteria||'')+'</td><td style="font-size:10.5px">'+_qe(s.desc||'')+'</td></tr>';}).join('')
      :[{s:'치명',d:'출하 금지',a:'즉시 출하보류'},{s:'주요',d:'품질 핵심 영향',a:'보고서 공유'},{s:'일반',d:'기준 불합격',a:'자체 해결'},{s:'사소',d:'외관만 영향',a:'자체 해결'}].map(function(x){return'<tr><td class="qd-sev-'+x.s+'"><b>'+x.s+'</b></td><td>'+x.d+'</td><td style="font-size:10.5px">'+x.a+'</td></tr>';}).join(''))
    +'</tbody></table></div></div>';
  el.innerHTML=html;
}

function renderQMasterAnalysis97(){
  var el=document.getElementById('qmaster-panel-analysis'); if(!el) return;
  var ready=!!QDEFECT_WORKBOOK_READY, rows=_qGetRows();
  var codeSummary=ready?buildCategoryCodeSummary(rows):{byMajor:[],bySmall:[],repeatCandidates:[]};
  var html='<div class="qd-analysis-grid">';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">코드 사용 빈도 (대분류)</div>'+(ready&&codeSummary.byMajor.length?_qPareto(codeSummary.byMajor.slice(0,15),{color:'var(--ac)'}):renderEmptyChartPlaceholder('pareto','대분류'))+'</div>';
  html+='<div class="card"><div class="card-title" style="margin-bottom:6px">소분류 TOP — 반복 후보</div>'+(ready&&codeSummary.bySmall.length?_qPareto(codeSummary.bySmall.slice(0,15),{color:'var(--am)'}):renderEmptyChartPlaceholder('pareto','소분류'))+'</div></div>';
  if(ready&&codeSummary.repeatCandidates.length){
    html+='<div class="card"><div class="card-title" style="margin-bottom:6px">반복 불량 후보 (소분류 3회↑) — CAPA 검토</div><table class="qd-compact-tbl"><thead><tr><th>소분류</th><th>건수</th><th>주요 호기</th><th>최근</th><th>CAPA</th></tr></thead><tbody>'
      +codeSummary.repeatCandidates.map(function(x){var rr=rows.filter(function(r){return r.smallCategory===x.k;});var mach=rr.map(function(r){return r.machine;}).filter(Boolean).filter(function(v,i,a){return a.indexOf(v)===i;}).slice(0,2).join(', ')||'—';var last=rr.filter(function(r){return r.date;}).map(function(r){return r.date;}).sort().pop()||'—';return'<tr><td>'+_qe(x.k)+'</td><td><b>'+x.n+'</b></td><td style="font-size:10.5px">'+mach+'</td><td style="font-size:10.5px">'+last+'</td><td><span class="qd-capa-badge">CAPA 후보</span></td></tr>';}).join('')+'</tbody></table></div>';
  }
  el.innerHTML=html;
}

function renderQMasterOther97(){
  var el=document.getElementById('qmaster-panel-other'); if(!el) return;
  var ready=!!QDEFECT_WORKBOOK_READY, rows=_qGetRows();
  var master=QDEFECT_MASTER||{};
  var otherRows=rows.filter(function(r){return r.part==='기타'||!r.part;});
  var html='<div class="qd-kpi-row" style="grid-template-columns:repeat(4,1fr)">'
    +_qKpiCard('기타 건수',otherRows.length,'미분류',otherRows.length>0?'amber':'')
    +_qKpiCard('비율',rows.length?Math.round(otherRows.length/rows.length*100)+'%':'0%','','')
    +_qKpiCard('기타분류 항목',master.others?master.others.length:0,'')
    +_qKpiCard('코드화 후보',master.others?master.others.filter(function(o){return (rows.filter(function(r){return r.etc===o.value;}).length)>=3;}).length:0,'','amber')
    +'</div>';
  if(master.others&&master.others.length){
    html+='<div class="card" style="margin-bottom:10px"><div class="card-title" style="margin-bottom:6px">기타분류 항목</div><table class="qd-compact-tbl"><thead><tr><th>항목</th><th>설명</th><th>발생</th><th>코드화</th></tr></thead><tbody>'
      +master.others.map(function(o){var cnt=rows.filter(function(r){return r.etc===o.value;}).length;return'<tr><td>'+_qe(o.value)+'</td><td style="font-size:10.5px">'+_qe(o.desc||'')+'</td><td>'+cnt+'</td><td>'+(cnt>=3?'<span class="qd-capa-badge">코드화 후보</span>':'<span class="qd-code-na">보류</span>')+'</td></tr>';}).join('')+'</tbody></table></div>';
  }
  html+=(ready?'<div class="card"><div class="card-title" style="margin-bottom:6px">기타 파트 Raw Data</div><table class="qd-compact-tbl"><thead><tr><th>날짜</th><th>모델</th><th>호기</th><th>내용</th><th>기타값</th></tr></thead><tbody>'
    +(otherRows.length?otherRows.slice(0,25).map(function(r){return'<tr><td>'+r.date+'</td><td>'+_qe(r.model||'—')+'</td><td>'+_qe(r.machine||'—')+'</td><td style="font-size:10.5px">'+_qe(r.content).slice(0,35)+'</td><td style="font-size:10.5px">'+_qe(r.etc||'—')+'</td></tr>';}).join(''):_qEmptyTableRow(5,'기타 파트 없음'))
    +'</tbody></table></div>':'<div class="card">'+_qEmptyNotice('기타분류 분석')+'</div>');
  el.innerHTML=html;
}

// ── 불량 관리 센터: 업로드 전 골격 렌더링 ──
function renderQMainPage(){
  // 업로드 전 Upload 탭은 항상 표시
  switchQMain(_qMainTab,null);
}

function switchQMain(tab,btn){
  _qMainTab=tab;
  document.querySelectorAll('#qmain-tabbar .qd-tab').forEach(function(b){b.classList.toggle('active',b.dataset.t===tab);});
  ['upload','raw','issues','detail','warnings','imgmatch'].forEach(function(p){_qShow('qmain-panel-'+p,p===tab);});
  if(tab==='raw') renderQRawTab3Pane97();
  else if(tab==='issues') renderQIssuesTab3Pane97();
  else if(tab==='warnings') renderQWarningsTab97();
  else if(tab==='imgmatch') renderQImgMatchTab97();
  // upload 탭은 기존 HTML 유지
}

function renderQRawTab3Pane97(){
  var ee=document.getElementById('qmain-raw-empty'),ct=document.getElementById('qmain-raw-content');
  if(!ee||!ct) return;
  ee.style.display='none'; ct.style.display='block';
  var ready=!!QDEFECT_WORKBOOK_READY, rows=_qGetRows(), f=_qRawFilter;
  var an=_qGetAnalytics();
  var months=[],models=[],parts=[];
  rows.forEach(function(r){if(months.indexOf(r.monthKey)<0)months.push(r.monthKey);if(r.model&&models.indexOf(r.model)<0)models.push(r.model);if(r.part&&parts.indexOf(r.part)<0)parts.push(r.part);});months.sort();
  var filterHtml='<div class="qd-filter-bar">'
    +'<select class="form-input" id="qrf-month" style="font-size:11.5px" onchange="_qRawFilter.month=this.value;_qRawPage=1;renderQRawTab3Pane97()"><option value="">전체 월</option>'+months.map(function(m){return'<option'+(f.month===m?' selected':'')+'>'+m+'</option>';}).join('')+'</select>'
    +'<select class="form-input" style="font-size:11.5px" onchange="_qRawFilter.sev=this.value;_qRawPage=1;renderQRawTab3Pane97()"><option value="">전체 중요도</option>'+QSEV_VALS.map(function(s){return'<option'+(f.sev===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select>'
    +'<select class="form-input" style="font-size:11.5px" onchange="_qRawFilter.model=this.value;_qRawPage=1;renderQRawTab3Pane97()"><option value="">전체 모델</option>'+models.map(function(m){return'<option'+(f.model===m?' selected':'')+'>'+m+'</option>';}).join('')+'</select>'
    +'<select class="form-input" style="font-size:11.5px" onchange="_qRawFilter.part=this.value;_qRawPage=1;renderQRawTab3Pane97()"><option value="">전체 파트</option>'+parts.map(function(p){return'<option'+(f.part===p?' selected':'')+'>'+p+'</option>';}).join('')+'</select>'
    +'<input type="text" class="form-input" placeholder="검색" value="'+(f.search||'')+'" oninput="_qRawFilter.search=this.value;_qRawPage=1;renderQRawTab3Pane97()" style="font-size:11.5px;min-width:100px">'
    +'<button class="btn-sm" onclick="_qRawFilter={};_qRawPage=1;renderQRawTab3Pane97()">초기화</button>'
    +'</div>';
  var fRows=rows.filter(function(r){if(f.month&&r.monthKey!==f.month)return false;if(f.sev&&r.severity!==f.sev)return false;if(f.model&&r.model!==f.model)return false;if(f.part&&r.part!==f.part)return false;if(f.search){var se=f.search.toLowerCase();if((r.content+r.writer+r.smallCategory).toLowerCase().indexOf(se)<0)return false;}return true;});
  var total=fRows.length, pc=Math.ceil(total/50)||1;if(_qRawPage>pc)_qRawPage=1;
  var paged=fRows.slice((_qRawPage-1)*50,_qRawPage*50);
  // 좌측
  var leftHtml='<div class="qd-panel-box"><div class="qd-panel-title">시트 목록</div>'
    +((QDEFECT_SHEET_SUMMARY||[]).filter(function(s){return s.type==='monthly'||s.type==='excluded';}).map(function(s){var typeLbl={monthly:'월별',excluded:'❌제외'}[s.type]||s.type;return'<div class="qd-list-item"><span>'+_qe(s.name)+'</span><span class="qd-list-badge '+(s.type==='excluded'?'red':'')+'">'+typeLbl+(s.rowCount?'·'+s.rowCount+'행':'')+'</span></div>';}).join(''))||'<div class="qd-r-empty"><div style="font-size:11.5px">업로드 후 표시</div></div>'
    +'</div>'
    +'<div class="qd-panel-box"><div class="qd-panel-title">파싱 상태</div>'
    +['ok','warning','error'].map(function(ps){var cnt=rows.filter(function(r){return r.parseStatus===ps;}).length;var cls=ps==='ok'?'grn':ps==='warning'?'amb':'red';return'<div class="qd-list-item"><span>'+ps+'</span><span class="qd-list-badge '+cls+'">'+cnt+'건</span></div>';}).join('')
    +'</div>';
  // 중앙
  var centHtml='<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--ts);margin-bottom:5px"><span>'+total+'건</span><span>'+_qRawPage+'/'+pc+' 페이지</span></div>'
    +'<div style="overflow-x:auto"><table class="qd-compact-tbl"><thead><tr><th>월</th><th>날짜</th><th>작성자</th><th>모델</th><th>호기</th><th>CELL</th><th>중요도</th><th>파트</th><th>소분류</th><th>내용</th><th>🖼</th></tr></thead><tbody>'
    +(paged.length?paged.map(function(r){return'<tr data-rid="'+r.id+'" class="'+(r.id===_qMainSelRowId?'sel-row':'')+'">'
      +'<td><span class="qd-month">'+r.monthKey+'</span></td><td style="white-space:nowrap;font-size:10px">'+(r.date||'—')+'</td><td>'+(r.writer||'—')+'</td><td>'+(r.model||'—')+'</td><td>'+(r.machine||'—')+'</td><td>'+(r.cell||'—')+'</td>'
      +'<td class="qd-sev-'+r.severity+'"><b>'+r.severity+'</b></td><td style="font-size:10.5px">'+(r.part||'—')+'</td>'
      +'<td style="font-size:10px;max-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(r.smallCategory||'—')+'</td>'
      +'<td style="max-width:130px;font-size:10.5px">'+(r.content||'').slice(0,30)+'</td>'
      +'<td>'+(r.imageCount>0?'🖼'+r.imageCount:'—')+'</td></tr>';}).join(''):_qEmptyTableRow(11,(ready?'데이터 없음':'파일 업로드 후 표시')))
    +'</tbody></table></div>'
    +(pc>1?'<div style="display:flex;gap:5px;justify-content:center;margin-top:6px"><button class="btn-sm" '+(_qRawPage<=1?'disabled':'')+' onclick="_qRawPage=Math.max(1,_qRawPage-1);renderQRawTab3Pane97()">◀</button><span style="font-size:12px;line-height:30px">'+_qRawPage+'/'+pc+'</span><button class="btn-sm" '+(_qRawPage>=pc?'disabled':'')+' onclick="_qRawPage=Math.min('+pc+',_qRawPage+1);renderQRawTab3Pane97()">▶</button></div>':'');
  // 우측
  var selRow=_qMainSelRowId?rows.find(function(r){return r.id===_qMainSelRowId;}):null;
  var rightHtml='<div class="qd-r-panel" id="qd-raw-right-panel">'+(selRow?_qRawDetailInline(selRow):'<div class="qd-r-empty"><div style="font-size:11.5px">행을 선택하면<br>상세가 표시됩니다</div></div>')+'</div>';
  ct.innerHTML=filterHtml+'<div style="display:grid;grid-template-columns:220px 1fr 260px;gap:10px"><div>'+leftHtml+'</div><div>'+centHtml+'</div><div>'+rightHtml+'</div></div>';
  ct.querySelectorAll('tr[data-rid]').forEach(function(tr){
    tr.addEventListener('click',function(){
      _qMainSelRowId=this.dataset.rid;
      var rPanel=document.getElementById('qd-raw-right-panel');
      if(rPanel){var row2=rows.find(function(r){return r.id===_qMainSelRowId;});if(row2)rPanel.innerHTML=_qRawDetailInline(row2);}
      ct.querySelectorAll('tr[data-rid]').forEach(function(t){t.classList.toggle('sel-row',t.dataset.rid===_qMainSelRowId);});
    });
  });
}

function renderQIssuesTab3Pane97(){
  var ee=document.getElementById('qmain-issues-empty'),ct=document.getElementById('qmain-issues-content');
  if(!ee||!ct) return; ee.style.display='none'; ct.style.display='block';
  var ready=!!QDEFECT_WORKBOOK_READY, rows=_qGetRows(), an=_qGetAnalytics();
  var sortedRows=rows.slice().sort(function(a,b){var o={치명:0,주요:1,일반:2,사소:3,개선:4};return(o[a.severity]||5)-(o[b.severity]||5);});
  var html='<div class="qd-kpi-row" style="grid-template-columns:repeat(4,1fr)">'
    +_qKpiCard('전체',an.total,'','accent')+_qKpiCard('치명',an.critical,'','red')
    +_qKpiCard('주요',an.major,'','amber')+_qKpiCard('이미지',(ready?QDEFECT_IMAGES.filter(function(i){return i.matched;}).length:0)+'건','','green')+'</div>';
  var leftHtml='<div class="qd-panel-box"><div class="qd-panel-title">중요도별</div>'
    +QSEV_VALS.map(function(sv){var cnt=rows.filter(function(r){return r.severity===sv;}).length;var cls=sv==='치명'?'red':sv==='주요'?'amb':'';return'<div class="qd-list-item"><span class="qd-sev-'+sv+'">'+sv+'</span><span class="qd-list-badge '+cls+'">'+cnt+'건</span></div>';}).join('')+'</div>'
    +'<div class="qd-panel-box"><div class="qd-panel-title">파트별</div>'
    +(an.byPart.length?an.byPart.slice(0,8).map(function(p){return'<div class="qd-list-item"><span>'+_qe(p.k)+'</span><span class="qd-list-badge">'+p.n+'</span></div>';}).join(''):'<div class="qd-r-empty"><div style="font-size:11.5px">업로드 후 표시</div></div>')+'</div>';
  var centHtml='<div style="overflow-x:auto"><table class="qd-compact-tbl"><thead><tr><th>날짜</th><th>모델</th><th>호기</th><th>파트</th><th>소분류</th><th>내용</th><th>중요도</th><th>이미지</th></tr></thead><tbody>'
    +(sortedRows.length?sortedRows.slice(0,100).map(function(r){return'<tr data-rid="'+r.id+'">'
      +'<td style="white-space:nowrap;font-size:10.5px">'+(r.date||'—')+'</td><td>'+(r.model||'—')+'</td><td>'+(r.machine||'—')+'</td>'
      +'<td style="font-size:10.5px">'+(r.part||'—')+'</td><td style="font-size:10px;max-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(r.smallCategory||'—')+'</td>'
      +'<td style="max-width:140px;font-size:10.5px">'+(r.content||'').slice(0,38)+'</td>'
      +'<td class="qd-sev-'+r.severity+'"><b>'+r.severity+'</b></td><td>'+(r.imageCount>0?'🖼'+r.imageCount:'—')+'</td></tr>';}).join(''):_qEmptyTableRow(8,(ready?'이슈 없음':'파일 업로드 후 표시')))
    +'</tbody></table></div>';
  var selRow=_qMainSelRowId?rows.find(function(r){return r.id===_qMainSelRowId;}):null;
  var rightHtml='<div class="qd-r-panel" id="qd-issue-right-panel">'+(selRow?_qRawDetailInline(selRow):'<div class="qd-r-empty"><div>이슈를 선택하면<br>상세가 표시됩니다</div></div>')+'</div>';
  ct.innerHTML=html+'<div style="display:grid;grid-template-columns:220px 1fr 260px;gap:10px"><div>'+leftHtml+'</div><div>'+centHtml+'</div><div>'+rightHtml+'</div></div>';
  ct.querySelectorAll('tr[data-rid]').forEach(function(tr){
    tr.addEventListener('click',function(){
      var row2=rows.find(function(r){return r.id===this.dataset.rid;}.bind(this));
      _qMainSelRowId=this.dataset.rid;
      var rp=document.getElementById('qd-issue-right-panel');
      if(rp&&row2) rp.innerHTML=_qRawDetailInline(row2);
      ct.querySelectorAll('tr[data-rid]').forEach(function(t){t.classList.toggle('sel-row',t.dataset.rid===_qMainSelRowId);});
    });
  });
}

function renderQWarningsTab97(){
  var ee=document.getElementById('qmain-warn-empty'),ct=document.getElementById('qmain-warn-content');
  if(!ee||!ct) return;
  var ready=!!QDEFECT_WORKBOOK_READY, w=QDEFECT_PARSE_WARNINGS||[];
  if(!ready){ee.style.display='block';ct.style.display='none';ee.textContent='파일을 업로드하면 파싱 경고가 표시됩니다.';return;}
  if(!w.length){ee.style.display='block';ct.style.display='none';ee.textContent='✅ 파싱 경고 없음';return;}
  ee.style.display='none';ct.style.display='block';
  ct.innerHTML='<div class="qd-kpi-row" style="grid-template-columns:repeat(3,1fr)">'
    +_qKpiCard('전체 경고',w.length,'','amber')
    +_qKpiCard('경고 행',QDEFECT_RAW_ROWS.filter(function(r){return r.parseStatus==='warning';}).length+'건','','amber')
    +_qKpiCard('오류 행',QDEFECT_RAW_ROWS.filter(function(r){return r.parseStatus==='error';}).length+'건','','red')
    +'</div>'
    +'<div style="max-height:400px;overflow-y:auto;border:1px solid var(--bd);border-radius:8px">'
    +w.slice(0,100).map(function(wi){return'<div class="qd-warn-item"><span class="qd-warn-badge qd-warn-'+wi.status+'">'+wi.status+'</span><span style="color:var(--ts);white-space:nowrap;font-size:10.5px">['+_qe(wi.sheet)+' R'+wi.row+']</span><span style="color:var(--tp)">'+_qe(wi.msg)+'</span></div>';}).join('')
    +(w.length>100?'<div style="padding:6px;text-align:center;font-size:11px;color:var(--ts)">... 외 '+(w.length-100)+'건</div>':'')+'</div>';
}

function renderQImgMatchTab97(){
  var ee=document.getElementById('qmain-imgmatch-empty'),ct=document.getElementById('qmain-imgmatch-content');
  if(!ee||!ct) return;
  var ready=!!QDEFECT_WORKBOOK_READY;
  var all=(QDEFECT_IMAGES||[]).length+(QDEFECT_UNMATCHED_IMAGES||[]).length;
  if(!ready){ee.style.display='block';ct.style.display='none';ee.textContent='파일을 업로드하면 이미지 매칭 결과가 표시됩니다.';return;}
  if(!all){ee.style.display='block';ct.style.display='none';ee.textContent='이미지가 없습니다.';return;}
  ee.style.display='none';ct.style.display='block';
  ct.innerHTML='<div class="qd-kpi-row" style="grid-template-columns:repeat(3,1fr)">'
    +_qKpiCard('전체 이미지',all,'','accent')
    +_qKpiCard('연결 성공',(QDEFECT_IMAGES||[]).length,'','green')
    +_qKpiCard('미매칭',(QDEFECT_UNMATCHED_IMAGES||[]).length,'',(QDEFECT_UNMATCHED_IMAGES||[]).length?'red':'green')
    +'</div>'
    +'<div class="card"><div class="card-title" style="margin-bottom:6px">시트별 이미지 연결 현황</div><table class="qd-compact-tbl"><thead><tr><th>시트</th><th>전체</th><th>연결</th><th>미매칭</th></tr></thead><tbody>'
    +(QDEFECT_SHEET_SUMMARY||[]).filter(function(s){return s.type==='monthly';}).map(function(s){var linked=(QDEFECT_IMAGES||[]).filter(function(i){return i.sheetName===s.name;}).length;var unm=(QDEFECT_UNMATCHED_IMAGES||[]).filter(function(i){return i.sheetName===s.name;}).length;return'<tr><td>'+_qe(s.name)+'</td><td>'+( linked+unm)+'</td><td style="color:var(--gr)">'+linked+'</td><td style="color:'+(unm?'var(--rd)':'var(--ts)')+'">'+unm+'</td></tr>';}).join('')+'</tbody></table></div>';
}

// ── v0.97 nav hook ──
(function(){
  var _nb=typeof nav==='function'?nav:null;
  if(!_nb||nav.__v97hooked)return;
  // [STEP02] v97 nav wrapper neutralized; renders merged into odiNavAfterRenderDispatcher
  try { nav.__v97hooked=true; } catch(_e){}
})();
// 렌더 함수 alias (v97 버전 우선)
var renderQRawTab3Pane=renderQRawTab3Pane97;
var renderQIssuesTab3Pane=renderQIssuesTab3Pane97;
var renderQWarningsTab=renderQWarningsTab97;
var renderQImgMatchTab=renderQImgMatchTab97;
var renderQAnalysisMachinePane=renderQAnalysisMachine97;
var renderQAnalysisModelPane=renderQAnalysisModel97;
var renderQAnalysisCellPane=renderQAnalysisCell97;
var renderQAnalysisDatePane=renderQAnalysisDate97;
var renderQAnalysisCodePane=renderQAnalysisCode97;
var renderQAnalysisWriterPane=renderQAnalysisWriter97;
var renderQImagesKpi=renderQImagesKpi97;
var renderQMasterDefectCode3Pane=renderQMasterDefectCode97;
var renderQMasterClassCode=renderQMasterClassCode97;
var renderQMasterAnalysis3Pane=renderQMasterAnalysis97;
var renderQMasterOther=renderQMasterOther97;

// ── 07A: v0.97 upload 후 06K Flow Trace 연동 hook ──
(function(){
  var _origHandleQDefectUpload = typeof handleQDefectUpload === 'function' ? handleQDefectUpload : null;
  if(_origHandleQDefectUpload) {
    handleQDefectUpload = function(e) {
      // 06K stale 초기화
      if(typeof qInvalidateQualityDownstreamStates==='function')
        qInvalidateQualityDownstreamStates('v097-upload');
      _origHandleQDefectUpload.call(this, e);
      // Flow Trace 갱신
      setTimeout(function(){
        if(typeof qEnsureQualityFlowTraceContainers==='function') qEnsureQualityFlowTraceContainers();
        if(typeof qRefreshQualityFlowTracePanel==='function') qRefreshQualityFlowTracePanel('v097-upload');
      }, 200);
    };
  }
})();

// ── 07A: Bridge — QDEFECT_RAW_ROWS ↔ QRAW_ROWS 동기화 ──
function qSyncDefectRowsToRebuildFlow() {
  if(typeof QDEFECT_RAW_ROWS !== 'undefined' && Array.isArray(QDEFECT_RAW_ROWS)) {
    if(typeof QRAW_ROWS !== 'undefined') QRAW_ROWS = QDEFECT_RAW_ROWS;
    if(typeof QRAW_FILE_META !== 'undefined' && typeof QDEFECT_FILE !== 'undefined')
      QRAW_FILE_META = { name: QDEFECT_FILE ? QDEFECT_FILE.name : '', size: QDEFECT_FILE ? QDEFECT_FILE.size : 0 };
    if(typeof qRefreshQualityFlowTracePanel==='function') qRefreshQualityFlowTracePanel('sync-defect');
  }
}
function qSyncRebuildFlowToDefectRows() {
  if(typeof QRAW_ROWS !== 'undefined' && Array.isArray(QRAW_ROWS)) {
    if(typeof QDEFECT_RAW_ROWS !== 'undefined') QDEFECT_RAW_ROWS = QRAW_ROWS;
  }
}
function qGetUnifiedQualityRows() {
  if(typeof QISSUE_NORMALIZED_ROWS !== 'undefined' && Array.isArray(QISSUE_NORMALIZED_ROWS) && QISSUE_NORMALIZED_ROWS.length)
    return QISSUE_NORMALIZED_ROWS;
  if(typeof QISSUE_ROWS !== 'undefined' && Array.isArray(QISSUE_ROWS) && QISSUE_ROWS.length)
    return QISSUE_ROWS;
  if(typeof QRAW_ROWS !== 'undefined' && Array.isArray(QRAW_ROWS) && QRAW_ROWS.length)
    return QRAW_ROWS;
  if(typeof QDEFECT_RAW_ROWS !== 'undefined' && Array.isArray(QDEFECT_RAW_ROWS))
    return QDEFECT_RAW_ROWS;
  return [];
}

var APP_VERSION = 'Q_REBUILD_08J_FRAME_MODE_V0_4_PANEL_TABS_DRAWER_KEYMAP_ALIGN';
var CHANGELOG = (typeof CHANGELOG !== 'undefined' && Array.isArray(CHANGELOG) ? CHANGELOG : []);
CHANGELOG.push({ version: 'Q_REBUILD_08I_DATA_MANAGEMENT_PAGES_PURPOSE_REDESIGN', date: '2026-04-27', notes: [
  'v0.97 품질관리 UI/기능 복구 구조 유지 검수',
  '06K Flow Trace / Dashboard Ready / stale invalidation 구조 유지',
  '누락 fallback: openQualityIssueModal, addQualityMasterCode 보강',
  'v0.97 업로드 완료 후 QRAW/QISSUE Flow Trace 동기화 보강',
  '호기 분석 inline onclick의 _qSelMachine 문자열 변수 호출 위험 보정'
] });
CHANGELOG.push({ version: 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP01_REVIEWED_FIXED', date: '2026-05-14', notes: [
  'Debug cleanup step 01 reviewed fixed: duplicate id cleanup, structure audit, page nesting guard, nav hook contamination report, no business logic or UI content changes.'
] });
CHANGELOG.push({ version: 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP02_NAV_DISPATCHER_UNIFY_REVIEWED_FIXED', date: '2026-05-14', notes: [
  'Debug cleanup step 02: unified nav after-render dispatcher, removed redundant nav wrapper chain without changing business logic, UI text, or page content. Reviewed fixed: exposed PM as window.PM for audit/guard compatibility.'
] });
CHANGELOG.push({ version: 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP03_CSS_PATCH_INVENTORY', date: '2026-05-14', notes: [
  'Debug cleanup step 03: CSS patch inventory and duplicate selector audit only. No visual, layout, business logic, route, or content changes.'
] });
CHANGELOG.push({ version: 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP04_CSS_SAFE_DEDUP_PLAN', date: '2026-05-14', notes: [
  'Debug cleanup step 04: CSS safe deduplication planning only. No CSS deletion, merge, visual layout, route, business logic, or content changes.'
] });
CHANGELOG.push({ version: 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP05_SINGLE_SAFE_MERGE_DRY_RUN', date: '2026-05-14', notes: [
  'Debug cleanup step 05: dry-run report for two safeMergeCandidate selectors only. No CSS deletion, merge, visual layout, route, business logic, or content changes.'
] });
CHANGELOG.push({ version: 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP06_SAFE_CANDIDATE_DEMOTE_AND_FREEZE', date: '2026-05-14', notes: [
  'Debug cleanup step 06: demoted both STEP05 dry-run candidates to observeOnly and froze CSS cleanup. No CSS deletion, merge, visual layout, route, business logic, or content changes.'
] });
CHANGELOG.push({ version: 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP07_FUNCTIONAL_SMOKE_AND_PROCESS_PAGE_BASELINE', date: '2026-05-14', notes: [
  'Debug cleanup step 07: functional smoke baseline for production, process, schedule, quality, and data pages. No CSS, route, business logic, UI text, or data structure changes.'
] });
CHANGELOG.push({ version: 'Q_REBUILD_08J_DEBUG_CLEANUP_STEP08_FINAL_HANDOFF_AND_PROCESS_WORK_RESUME', date: '2026-05-14', notes: [
  'Debug cleanup step 08: final handoff for 08J cleanup, baseline confirmation, and process page work-resume readiness. No CSS, route, business logic, UI text, or data structure changes.'
] });
CHANGELOG.push({ version: 'Q_REBUILD_08J_FRAME_MODE_V0_2_SAFE_APPLY', date: '2026-05-14', notes: [
  'Frame mode v0.2 safe apply: added optional THE VC-inspired frame layout mode to STEP08 final baseline using FRAME_MODE_v0.1 as reference. Classic mode remains default. No page content, route, production schedule logic, quality flow, or CSS cleanup changes.'
] });
CHANGELOG.push({ version: 'Q_REBUILD_08J_FRAME_MODE_V0_2_SAFE_APPLY_REVIEWED_FIXED', date: '2026-05-14', notes: [
  'Reviewed fixed: moved frameProfileHeader/frameTabs inside main-content so thevc-frame renders as a top content frame instead of a flex-row sibling, added data-frame-route sync, and guarded schedule routes from right panel width intrusion.'
] });
CHANGELOG.push({ version: 'Q_REBUILD_08J_FRAME_MODE_V0_3_VISUAL_SMOKE_AND_FRAME_STABILIZE', date: '2026-05-14', notes: [
  'Frame mode v0.3: visual smoke and frame stabilization based on v0.2 reviewed fixed. Kept classic default, protected schedule width, and avoided page content, route, production schedule, quality flow, and CSS cleanup changes.'
] });
CHANGELOG.push({ version: 'Q_REBUILD_08J_FRAME_MODE_V0_3_VISUAL_SMOKE_AND_FRAME_STABILIZE_REVIEWED_FIXED', date: '2026-05-14', notes: [
  'Frame mode v0.3 reviewed fixed: visual smoke and frame stabilization based on v0.2 reviewed fixed; separated duplicate v0.3 style/script ids. Kept classic default, protected schedule width, and avoided page content, route, production schedule, quality flow, and CSS cleanup changes.'
] });
CHANGELOG.push({ version: APP_VERSION, date: '2026-05-14', notes: [
  'Frame mode v0.4: aligned route meta, primary tabs, right panel content, compact sidebar drawer, hamburger control, quick rail active state, and Ctrl+` keymap using FRAME_MODE_v0.1 as reference while preserving V0.3 reviewed fixed safety rules. No page content, route, production schedule logic, quality flow, CSS cleanup, or localStorage frame-mode changes.'
] });


(function(){
  function _qaEsc(v){ return String(v===null||v===undefined?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

  if(typeof window.openQualityIssueModal !== 'function') {
    window.openQualityIssueModal = function(issueId){
      var rows = (typeof QDEFECT_ISSUES !== 'undefined' && Array.isArray(QDEFECT_ISSUES) ? QDEFECT_ISSUES : []);
      var iss = rows.find(function(r){ return String(r.id||r.issueId||'') === String(issueId||''); });
      if(typeof openQDefectRowDetail === 'function' && iss && (iss.rowId || iss.rawId || iss.sourceRowId)) {
        return openQDefectRowDetail(iss.rowId || iss.rawId || iss.sourceRowId);
      }
      var box = document.getElementById('q-row-detail-modal') || document.getElementById('row-detail-modal');
      if(box && iss){
        box.innerHTML = '<div class="modal-box"><div class="modal-title">이슈 상세 <span class="modal-close" onclick="this.closest(\'.modal-overlay,.mo\')?.classList.remove(\'open\')">×</span></div><pre style="white-space:pre-wrap;font-size:11px;color:var(--ts)">'+_qaEsc(JSON.stringify(iss,null,2))+'</pre></div>';
        box.classList.add('open');
        return;
      }
      alert(iss ? JSON.stringify(iss, null, 2) : '해당 이슈를 찾지 못했습니다: ' + issueId);
    };
  }
  if(typeof window.addQualityMasterCode !== 'function') {
    window.addQualityMasterCode = function(key){
      var inp = document.getElementById('qm-inp-'+key) || document.querySelector('[data-qm-input="'+key+'"]');
      if(!inp) return;
      var v = (inp.value||'').trim();
      if(!v) return;
      if(typeof QUALITY_MASTER_CODES !== 'undefined') {
        QUALITY_MASTER_CODES[key] = QUALITY_MASTER_CODES[key] || [];
        if(QUALITY_MASTER_CODES[key].indexOf(v) < 0) QUALITY_MASTER_CODES[key].push(v);
      } else if(typeof QDEFECT_MASTER !== 'undefined') {
        QDEFECT_MASTER[key] = QDEFECT_MASTER[key] || [];
        if(Array.isArray(QDEFECT_MASTER[key]) && QDEFECT_MASTER[key].indexOf(v) < 0) QDEFECT_MASTER[key].push(v);
      }
      inp.value='';
      if(typeof renderQualityMasterCodes === 'function') renderQualityMasterCodes();
      else if(typeof renderQMasterPage === 'function') renderQMasterPage();
    };
  }

  if(typeof parseQDefectWorkbook === 'function' && !parseQDefectWorkbook.__reviewedFixedWrapped) {
    var _origParseQDefectWorkbook07A = parseQDefectWorkbook;
    var _wrappedParseQDefectWorkbook07A = async function(){
      var ret = await _origParseQDefectWorkbook07A.apply(this, arguments);
      try{
        if(typeof qSyncDefectRowsToRebuildFlow === 'function') qSyncDefectRowsToRebuildFlow();
        if(typeof QDEFECT_SHEET_SUMMARY !== 'undefined') {
          if(typeof QRAW_SHEET_META !== 'undefined') QRAW_SHEET_META = { totalSheets: QDEFECT_SHEET_SUMMARY.length, source:'v0.97' };
          if(typeof QRAW_MONTH_SHEETS !== 'undefined') QRAW_MONTH_SHEETS = QDEFECT_SHEET_SUMMARY.filter(function(s){return s.type==='monthly';}).map(function(s){return s.name;});
        }
        if(typeof QDEFECT_PARSE_WARNINGS !== 'undefined' && typeof QRAW_WARNINGS !== 'undefined') QRAW_WARNINGS = QDEFECT_PARSE_WARNINGS.slice();
        if(typeof qEnsureQualityFlowTraceContainers === 'function') qEnsureQualityFlowTraceContainers();
        if(typeof qRefreshQualityFlowTracePanel === 'function') qRefreshQualityFlowTracePanel('v097-parse-complete');
      }catch(e){ console.warn('[07B reviewed fixed] v0.97 → Flow Trace sync failed', e); }
      return ret;
    };
    _wrappedParseQDefectWorkbook07A.__reviewedFixedWrapped = true;
    parseQDefectWorkbook = _wrappedParseQDefectWorkbook07A;
  }

  if(typeof resetQDefectData === 'function' && !resetQDefectData.__reviewedFixedWrapped) {
    var _origResetQDefectData07A = resetQDefectData;
    var _wrappedResetQDefectData07A = function(){
      var ret = _origResetQDefectData07A.apply(this, arguments);
      try{
        if(typeof qInvalidateQualityDownstreamStates === 'function') qInvalidateQualityDownstreamStates('v097-reset');
        if(typeof qRefreshQualityFlowTracePanel === 'function') qRefreshQualityFlowTracePanel('v097-reset');
      }catch(e){ console.warn('[07B reviewed fixed] reset sync failed', e); }
      return ret;
    };
    _wrappedResetQDefectData07A.__reviewedFixedWrapped = true;
    resetQDefectData = _wrappedResetQDefectData07A;
  }

  if(typeof odiEnsureSidebarAllGroupsOpen === 'function') {
    setTimeout(odiEnsureSidebarAllGroupsOpen, 0);
    setTimeout(odiEnsureSidebarAllGroupsOpen, 300);
    setTimeout(odiEnsureSidebarAllGroupsOpen, 900);
  }
})();

(function(){
  function safeRefresh(reason){
    try{ if(typeof qEnsureQualityFlowTraceContainers === 'function') qEnsureQualityFlowTraceContainers(); }catch(e){ console.warn('[07B reviewed fixed] trace container ensure failed', e); }
    try{ if(typeof qRefreshQualityFlowTracePanel === 'function') qRefreshQualityFlowTracePanel(reason || '07b-reviewed-fixed'); }catch(e){ console.warn('[07B reviewed fixed] trace refresh failed', e); }
  }
  function verifyFlowTraceContract(){
    try{
      if(typeof qGetQualityFlowTraceState !== 'function') return;
      var st = qGetQualityFlowTraceState();
      if(!st || !Array.isArray(st.steps) || st.steps.length !== 12){
        console.warn('[07B reviewed fixed] Flow Trace 12단계 계약 확인 필요:', st && st.steps && st.steps.length);
      }
    }catch(e){ console.warn('[07B reviewed fixed] Flow Trace contract check failed', e); }
  }
  if(typeof window !== 'undefined') {
    window.qReviewed07BSafeRefresh = safeRefresh;
    window.qReviewed07BVerifyFlowTraceContract = verifyFlowTraceContract;
  }
  if(typeof document !== 'undefined' && document.addEventListener){
    document.addEventListener('DOMContentLoaded', function(){
      setTimeout(function(){
        if(typeof odiEnsureSidebarAllGroupsOpen === 'function') odiEnsureSidebarAllGroupsOpen();
        safeRefresh('07b-dom-ready');
        verifyFlowTraceContract();
      }, 0);
      setTimeout(function(){
        if(typeof odiEnsureSidebarAllGroupsOpen === 'function') odiEnsureSidebarAllGroupsOpen();
        safeRefresh('07b-dom-late');
      }, 500);
    });
  }
})();

// ── 공통 차트 helper 추가 ────────────────────────────────────────────────

function _qDonutChart(segments, opts) {
  // segments: [{label, value, color}]
  opts = opts || {};
  var w = opts.w || 160, total = 0;
  segments.forEach(function(s){ total += (s.value || 0); });
  if(!total) return '<div class="qd-empty-chart"><div class="qd-empty-chart-icon">🍩</div><div class="qd-empty-chart-txt">데이터 없음</div></div>';
  var CX = 75, CY = 75, R = 55, IR = 30, angle = -Math.PI/2;
  var paths = '';
  segments.forEach(function(s) {
    var frac = (s.value||0)/total;
    if(frac <= 0) return;
    var sweep = frac * 2 * Math.PI;
    var end = angle + sweep;
    var x1=CX+R*Math.cos(angle), y1=CY+R*Math.sin(angle);
    var x2=CX+R*Math.cos(end),   y2=CY+R*Math.sin(end);
    var xi1=CX+IR*Math.cos(angle),yi1=CY+IR*Math.sin(angle);
    var xi2=CX+IR*Math.cos(end),  yi2=CY+IR*Math.sin(end);
    var large = sweep > Math.PI ? '1' : '0';
    paths += '<path d="M'+x1+' '+y1+' A'+R+' '+R+' 0 '+large+' 1 '+x2+' '+y2+
             ' L'+xi2+' '+yi2+' A'+IR+' '+IR+' 0 '+large+' 0 '+xi1+' '+yi1+' Z"'+
             ' fill="'+(s.color||'var(--ac)')+'" opacity="0.9"/>';
    if(frac > 0.06) {
      var ma = angle + sweep/2;
      var lx = CX+(R+10)*Math.cos(ma), ly = CY+(R+10)*Math.sin(ma);
      paths += '<text x="'+lx+'" y="'+ly+'" text-anchor="middle" font-size="9" fill="var(--ts)">'+Math.round(frac*100)+'%</text>';
    }
    angle = end;
  });
  var legend = segments.map(function(s){
    return '<div style="display:flex;align-items:center;gap:4px;font-size:10px;color:var(--ts)">'+
      '<div style="width:10px;height:10px;border-radius:3px;background:'+(s.color||'var(--ac)')+'"></div>'+
      '<span>'+s.label+'</span><span style="font-weight:700;color:var(--ts)">'+s.value+'</span></div>';
  }).join('');
  return '<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">'+
    '<svg width="'+w+'" height="'+w+'" viewBox="0 0 150 150" style="flex-shrink:0">'+
      paths+
      '<text x="75" y="79" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ts)">'+total+'</text>'+
      '<text x="75" y="92" text-anchor="middle" font-size="9" fill="var(--tm)">총계</text>'+
    '</svg>'+
    '<div style="display:flex;flex-direction:column;gap:5px">'+legend+'</div>'+
  '</div>';
}

function _qParetoBar(items, opts) {
  // items: [{label, value}], sorted desc
  opts = opts || {};
  var maxVal = 0;
  items.forEach(function(it){ if((it.value||0) > maxVal) maxVal = it.value||0; });
  if(!maxVal) return '<div class="qd-empty-chart"><div class="qd-empty-chart-icon">📊</div><div class="qd-empty-chart-txt">데이터 없음</div></div>';
  var total = items.reduce(function(s,it){ return s+(it.value||0); }, 0);
  var cumul = 0;
  var rows = items.slice(0, 15).map(function(it) {
    var pct = Math.round((it.value||0)/maxVal*100);
    cumul += (it.value||0);
    var cPct = Math.round(cumul/total*100);
    var is80 = cPct <= 80;
    return '<div style="display:grid;grid-template-columns:90px 1fr 50px;gap:6px;align-items:center;padding:3px 0;border-bottom:1px solid var(--bd)">'+
      '<div style="font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ts)" title="'+it.label+'">'+it.label+'</div>'+
      '<div style="background:var(--bd);border-radius:3px;height:10px;overflow:hidden">'+
        '<div style="width:'+pct+'%;height:100%;background:'+(is80?'var(--ac)':'#f59e0b')+';border-radius:3px"></div>'+
      '</div>'+
      '<div style="font-size:10px;font-weight:700;color:var(--ts);text-align:right">'+it.value+(cPct<=80?'':'<span style="font-size:8px;color:#f59e0b;margin-left:2px">'+cPct+'%</span>')+'</div>'+
    '</div>';
  }).join('');
  return '<div>'+rows+'</div>';
}

function _qHeatmapMatrix(rowLabels, colLabels, matrix, opts) {
  // matrix[r][c] = value
  opts = opts || {};
  var colColors = opts.colColors || {};
  if(!rowLabels.length || !colLabels.length) return '<div class="qd-empty-chart"><div class="qd-empty-chart-icon">🔲</div><div class="qd-empty-chart-txt">데이터 없음</div></div>';
  var maxVal = 0;
  rowLabels.forEach(function(r,ri){ colLabels.forEach(function(c,ci){ if((matrix[ri]||[])[ci] > maxVal) maxVal = (matrix[ri]||[])[ci]; }); });
  var header = '<th style="font-size:9px;color:var(--tm);padding:3px 6px;background:var(--bd)">행\\열</th>' +
    colLabels.map(function(c){
      var col = colColors[c] || 'var(--ac)';
      return '<th style="font-size:9px;padding:3px 6px;background:var(--bd);color:'+col+';font-weight:700">'+c+'</th>';
    }).join('');
  var body = rowLabels.map(function(r,ri){
    var cells = colLabels.map(function(c,ci){
      var v = (matrix[ri]||[])[ci] || 0;
      if(!v) return '<td style="padding:4px 6px;text-align:center;font-size:9px;background:var(--bd);border:1px solid var(--bd)"></td>';
      var col = colColors[c] || '#6366f1';
      var alpha = (0.10 + (v/maxVal)*0.75).toFixed(2);
      var hex = col.startsWith('#') ? col : '#6366f1';
      var r_ = parseInt(hex.slice(1,3),16)||99, g_ = parseInt(hex.slice(3,5),16)||102, b_ = parseInt(hex.slice(5,7),16)||241;
      var bg = 'rgba('+r_+','+g_+','+b_+','+alpha+')';
      var txt = (v/maxVal) > 0.5 ? '#fff' : 'var(--ts)';
      return '<td style="padding:4px 6px;text-align:center;font-size:10px;font-weight:600;background:'+bg+';color:'+txt+';border:1px solid var(--bd)">'+v+'</td>';
    }).join('');
    return '<tr><td style="font-size:10px;font-weight:600;padding:3px 6px;color:var(--ts);white-space:nowrap;background:var(--bd)">'+r+'</td>'+cells+'</tr>';
  }).join('');
  return '<div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:10px;width:100%"><thead><tr>'+header+'</tr></thead><tbody>'+body+'</tbody></table></div>';
}

function _qCalendarHeatmap(dateRows, opts) {
  // dateRows: [{date, value}]
  opts = opts || {};
  if(!dateRows || !dateRows.length) return '<div class="qd-empty-chart"><div class="qd-empty-chart-icon">📅</div><div class="qd-empty-chart-txt">일별 데이터 없음</div></div>';
  var maxVal = Math.max.apply(null, dateRows.map(function(d){ return d.value||0; })) || 1;
  var monthMap = {};
  dateRows.forEach(function(d) {
    var m = String(d.date||'').slice(0,7);
    if(!monthMap[m]) monthMap[m] = [];
    monthMap[m].push(d);
  });
  var months = Object.keys(monthMap).sort().slice(-6);
  var html = '<div style="display:flex;flex-wrap:wrap;gap:14px">';
  months.forEach(function(m) {
    html += '<div><div style="font-size:10px;font-weight:700;color:var(--tm);margin-bottom:4px">'+m+'</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:2px">';
    monthMap[m].forEach(function(d) {
      var alpha = (0.08 + (d.value||0)/maxVal*0.82).toFixed(2);
      var bg = (d.criticalValue||0) > 0
        ? 'rgba(239,68,68,'+alpha+')'
        : 'rgba(99,102,241,'+alpha+')';
      var day = String(d.date||'').slice(8,10);
      html += '<div title="'+d.date+': '+(d.value||0)+'건" style="width:18px;height:18px;border-radius:3px;background:'+bg+';display:flex;align-items:center;justify-content:center;font-size:7px;color:var(--ts);border:1px solid var(--bd)">'+day+'</div>';
    });
    html += '</div></div>';
  });
  html += '</div>';
  // top dates
  var top = dateRows.slice().sort(function(a,b){ return (b.value||0)-(a.value||0); }).slice(0,5);
  if(top.length) {
    html += '<div style="margin-top:8px;font-size:10px;font-weight:700;color:var(--tm)">Top 발생일</div>';
    html += '<table style="border-collapse:collapse;font-size:10px;width:100%;margin-top:4px"><thead><tr><th style="background:var(--bd);padding:3px 7px;text-align:left">날짜</th><th style="background:var(--bd);padding:3px 7px">건수</th></tr></thead><tbody>';
    top.forEach(function(d){ html += '<tr><td style="padding:3px 7px;border-bottom:1px solid var(--bd)">'+d.date+'</td><td style="padding:3px 7px;border-bottom:1px solid var(--bd);font-weight:700">'+d.value+'</td></tr>'; });
    html += '</tbody></table>';
  }
  return html;
}

// ── renderQDashSeverity 강화 — donut chart 적용 ───────────────────────────

(function(){
  var _orig = typeof renderQDashSeverity === 'function' ? renderQDashSeverity : null;
  renderQDashSeverity = function() {
    var el = document.getElementById('qdash-content');
    if(!el) return;
    var an = QDEFECT_ANALYTICS;
    var SEV_COLOR = {'치명':'#ef4444','주요':'#f97316','일반':'var(--ac)','사소':'#94a3b8','미분류':'#8b5cf6'};
    var sevMap = {};
    (QDEFECT_RAW_ROWS || []).forEach(function(r){ var s = r.severity||'미분류'; sevMap[s] = (sevMap[s]||0)+1; });
    var segments = Object.keys(sevMap).map(function(k){ return {label:k, value:sevMap[k], color:SEV_COLOR[k]||'#888'}; })
      .sort(function(a,b){ return b.value-a.value; });
    var donutHtml = _qDonutChart(segments, {w:150});

    var total = (QDEFECT_RAW_ROWS||[]).length;
    var critCount = (sevMap['치명']||0)+(sevMap['주요']||0);
    var unmapped = sevMap['미분류']||0;

    el.innerHTML =
      '<div class="qd-kpi-row">' +
        _qDashKpi() +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px">' +
        '<div class="qd-chart-card">' +
          '<div class="qd-chart-ttl">중요도 분포 (Donut)</div>' +
          donutHtml +
        '</div>' +
        '<div class="qd-chart-card">' +
          '<div class="qd-chart-ttl">중요도별 건수 요약</div>' +
          '<div style="overflow-x:auto">' +
            '<table class="qd-compact-tbl"><thead><tr><th>중요도</th><th>건수</th><th>비율</th></tr></thead><tbody>' +
            segments.map(function(s){
              return '<tr><td><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:'+s.color+';margin-right:4px"></span>'+s.label+'</td><td style="font-weight:700">'+s.value+'</td><td>'+(total?Math.round(s.value/total*100)+'%':'—')+'</td></tr>';
            }).join('') +
            '</tbody></table></div>' +
          '<div style="margin-top:8px;font-size:10px;color:var(--tm)">치명/주요: <strong style="color:#ef4444">'+critCount+'건</strong> &nbsp;|&nbsp; 미분류: <strong style="color:#8b5cf6">'+unmapped+'건</strong></div>' +
        '</div>' +
      '</div>';
  };
})();

// ── renderQDashProcess 강화 — Pareto chart 적용 ──────────────────────────

(function(){
  renderQDashProcess = function() {
    var el = document.getElementById('qdash-content');
    if(!el) return;
    var an = QDEFECT_ANALYTICS;
    var largeMap = {};
    (QDEFECT_RAW_ROWS||[]).forEach(function(r){
      var k = r.classLarge||r.categoryLarge||r.category||r.defectType||'미분류';
      largeMap[k] = (largeMap[k]||0)+1;
    });
    var items = Object.keys(largeMap).map(function(k){ return {label:k, value:largeMap[k]}; })
      .sort(function(a,b){ return b.value-a.value; });
    var paretoHtml = _qParetoBar(items, {});
    el.innerHTML =
      '<div class="qd-chart-card">' +
        '<div class="qd-chart-ttl">대분류 Pareto (80% 기준선)</div>' +
        '<div style="font-size:10px;color:var(--tm);margin-bottom:8px">상위 분류가 전체 불량의 80%를 차지</div>' +
        paretoHtml +
      '</div>';
  };
})();

// ── renderQAnalysisCellPane 강화 — Heatmap matrix 적용 ───────────────────

(function(){
  var _orig = typeof renderQAnalysisCellPane === 'function' ? renderQAnalysisCellPane : null;
  if(!_orig) return;
  renderQAnalysisCellPane = function() {
    var el = document.getElementById('qanalysis-panel-cell');
    if(!el) return;
    var rows = QDEFECT_RAW_ROWS || [];
    if(!rows.length) { el.innerHTML = '<div class="qd-tab-empty">데이터를 업로드하면 CELL 분석이 표시됩니다.</div>'; return; }

    // CELL × severity matrix
    var cellSet = {}, sevSet = {'치명':1,'주요':1,'일반':1,'사소':1,'미분류':1};
    rows.forEach(function(r){ var c=r.cell||r.cellNo||r.차수||'미지정'; cellSet[c]=1; });
    var cellLabels = Object.keys(cellSet).slice(0,12);
    var colLabels = Object.keys(sevSet);
    var SEV_COLORS = {'치명':'#ef4444','주요':'#f97316','일반':'#6366f1','사소':'#94a3b8','미분류':'#8b5cf6'};

    var matrix = cellLabels.map(function(cell){
      return colLabels.map(function(sev){
        return rows.filter(function(r){ return (r.cell||r.cellNo||r.차수||'미지정')===cell && (r.severity||'미분류')===sev; }).length;
      });
    });
    var heatHtml = _qHeatmapMatrix(cellLabels, colLabels, matrix, {colColors: SEV_COLORS});

    // CELL ranking
    var cellMap = {};
    rows.forEach(function(r){ var c=r.cell||r.cellNo||r.차수||'미지정'; cellMap[c]=(cellMap[c]||0)+1; });
    var rankItems = Object.keys(cellMap).map(function(k){ return {label:k, value:cellMap[k]}; }).sort(function(a,b){ return b.value-a.value; });

    el.innerHTML =
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">' +
        '<div class="qd-chart-card">' +
          '<div class="qd-chart-ttl">CELL × 중요도 Heatmap Matrix</div>' +
          heatHtml +
        '</div>' +
        '<div class="qd-chart-card">' +
          '<div class="qd-chart-ttl">CELL별 불량 Ranking</div>' +
          _qParetoBar(rankItems, {}) +
        '</div>' +
      '</div>';
  };
})();

// ── renderQAnalysisDatePane 강화 — Calendar Heatmap 추가 ─────────────────

(function(){
  var _orig = typeof renderQAnalysisDatePane === 'function' ? renderQAnalysisDatePane : null;
  if(!_orig) return;
  renderQAnalysisDatePane = function() {
    var el = document.getElementById('qanalysis-panel-date');
    if(!el) return;
    var rows = QDEFECT_RAW_ROWS || [];
    if(!rows.length) { el.innerHTML = '<div class="qd-tab-empty">데이터를 업로드하면 기간 분석이 표시됩니다.</div>'; return; }

    // 날짜별 집계
    var dateMap = {};
    rows.forEach(function(r) {
      var d = r.date || r.receiptDate || r.접수일자 || '';
      if(!d) return;
      var dk = String(d).slice(0,10);
      if(!dateMap[dk]) dateMap[dk] = {date:dk, value:0, criticalValue:0};
      dateMap[dk].value++;
      if(r.severity==='치명'||r.severity==='주요') dateMap[dk].criticalValue++;
    });
    var dateRows = Object.values(dateMap).sort(function(a,b){ return a.date<b.date?-1:1; });

    // line+bar chart (기존)
    var linebarData = dateRows.map(function(d){ return {x:d.date.slice(5), y:d.value, y2:d.criticalValue}; });
    var linebarHtml = _qSvgLinebar(linebarData, {w:440, h:100, label:'기간별 불량 추이'});

    // calendar
    var calHtml = _qCalendarHeatmap(dateRows, {});

    el.innerHTML =
      '<div style="display:grid;grid-template-columns:1fr;gap:14px">' +
        '<div class="qd-chart-card">' +
          '<div class="qd-chart-ttl">기간별 추이 (Line + Bar Combo)</div>' +
          linebarHtml +
        '</div>' +
        '<div class="qd-chart-card">' +
          '<div class="qd-chart-ttl">Calendar Heatmap (일별 밀도)</div>' +
          calHtml +
        '</div>' +
      '</div>';
  };
})();

// ── renderQAnalysisModelPane 강화 — Stacked bar + Matrix ─────────────────

(function(){
  var _orig = typeof renderQAnalysisModelPane === 'function' ? renderQAnalysisModelPane : null;
  if(!_orig) return;
  renderQAnalysisModelPane = function() {
    var el = document.getElementById('qanalysis-panel-model');
    if(!el) return;
    var rows = QDEFECT_RAW_ROWS || [];
    if(!rows.length) { el.innerHTML = '<div class="qd-tab-empty">데이터를 업로드하면 모델 분석이 표시됩니다.</div>'; return; }

    var SEV_COLORS = {'치명':'#ef4444','주요':'#f97316','일반':'#6366f1','사소':'#94a3b8','미분류':'#8b5cf6'};
    var modelSet = {}, sevSet = {'치명':1,'주요':1,'일반':1,'사소':1,'미분류':1};
    rows.forEach(function(r){ var m=r.model||r.modelType||r.종류||'미지정'; modelSet[m]=1; });
    var modelLabels = Object.keys(modelSet).slice(0,12);
    var colLabels = Object.keys(sevSet);

    var matrix = modelLabels.map(function(mod){
      return colLabels.map(function(sev){
        return rows.filter(function(r){
          return (r.model||r.modelType||r.종류||'미지정')===mod && (r.severity||'미분류')===sev;
        }).length;
      });
    });

    var modMap = {};
    rows.forEach(function(r){ var m=r.model||r.modelType||r.종류||'미지정'; modMap[m]=(modMap[m]||0)+1; });
    var rankItems = Object.keys(modMap).map(function(k){ return {label:k, value:modMap[k]}; }).sort(function(a,b){ return b.value-a.value; });

    el.innerHTML =
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">' +
        '<div class="qd-chart-card">' +
          '<div class="qd-chart-ttl">모델 × 중요도 Heatmap Matrix</div>' +
          _qHeatmapMatrix(modelLabels, colLabels, matrix, {colColors: SEV_COLORS}) +
        '</div>' +
        '<div class="qd-chart-card">' +
          '<div class="qd-chart-ttl">모델별 불량 Pareto</div>' +
          _qParetoBar(rankItems, {}) +
        '</div>' +
      '</div>';
  };
})();

console.log('[07C] Chart UI Density helpers loaded');

