/**
 * TechSysLab Phase 14G — User portal native upload/server sync
 * 목적:
 * - 관리자 포털 우회/상단 진단 패널 방식 폐기
 * - 사용자 포털의 기존 생산일정 업로드/품질 업로드 메뉴를 서버 API에 직접 연결
 * - 서버 DB 데이터를 기존 사용자 포털 화면/전역 데이터에 반영
 */
(function(){
  'use strict';

  var API_BASE = 'https://api.techsyslab.com';
  var SESSION_KEY = 'techsyslab.tempAccess.v1';
  var state = {
    scheduleFile: null,
    qualityFile: null,
    data: null,
    installed: false,
    applying: false,
    lastRefreshAt: 0
  };

  function hasAccess(){
    try{
      return sessionStorage.getItem(SESSION_KEY) === '1' || document.documentElement.classList.contains('tsl-auth-unlocked');
    }catch(e){
      return document.documentElement.classList.contains('tsl-auth-unlocked');
    }
  }

  function byId(id){ return document.getElementById(id); }

  function safeText(v){ return String(v == null ? '' : v); }

  function esc(v){
    return safeText(v).replace(/[&<>"']/g, function(ch){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];
    });
  }

  function setText(id, value){
    var el = byId(id);
    if(el) el.textContent = safeText(value);
  }

  function setHtml(id, html){
    var el = byId(id);
    if(el) el.innerHTML = html;
  }

  function showMsg(msg, type){
    try{
      if(typeof showToast === 'function') showToast(msg, type || 'ok');
      if(typeof showSaveBar === 'function') showSaveBar(msg);
    }catch(e){}
    console.log('[TechSysLab/server-sync]', msg);
  }

  function fetchJson(path, options){
    return fetch(API_BASE + path, Object.assign({cache:'no-store', credentials:'omit'}, options || {})).then(function(res){
      if(!res.ok) throw new Error(path + ' HTTP ' + res.status);
      return res.json();
    });
  }

  function rowsOf(payload){
    if(!payload) return [];
    if(Array.isArray(payload)) return payload;
    if(Array.isArray(payload.rows)) return payload.rows;
    if(Array.isArray(payload.items)) return payload.items;
    if(Array.isArray(payload.data)) return payload.data;
    if(payload.result && Array.isArray(payload.result.rows)) return payload.result.rows;
    return [];
  }

  function pickFrom(obj, names){
    if(!obj) return '';
    for(var i=0;i<names.length;i++){
      var k = names[i];
      if(obj[k] != null && obj[k] !== '') return obj[k];
    }
    var keys = Object.keys(obj || {});
    for(var j=0;j<keys.length;j++){
      var key = keys[j];
      var nk = key.replace(/[^a-zA-Z0-9가-힣]+/g,'').toLowerCase();
      for(var n=0;n<names.length;n++){
        var nn = String(names[n]).replace(/[^a-zA-Z0-9가-힣]+/g,'').toLowerCase();
        if(nn && nk.indexOf(nn) >= 0 && obj[key] != null && obj[key] !== '') return obj[key];
      }
    }
    return '';
  }

  function short(v, len){
    var s = safeText(v || '-');
    len = len || 28;
    return s.length > len ? s.slice(0, len) + '…' : s;
  }

  function parseDateOnly(v){
    var s = safeText(v || '');
    if(!s) return '';
    var m = s.match(/\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/);
    if(m) return m[0].replace(/[/.]/g,'-');
    return s;
  }

  function latestUpload(uploads, type){
    var rows = rowsOf(uploads);
    for(var i=0;i<rows.length;i++){
      if(String(rows[i].upload_type || '').toLowerCase() === type) return rows[i];
    }
    return null;
  }

  function uploadToServer(type, file){
    if(!file) return Promise.resolve(null);
    var endpoint = type === 'schedule' ? '/api/public/upload/schedule' : '/api/public/upload/quality';
    var form = new FormData();
    form.append('file', file);
    form.append('uploaded_by', 'user-portal');
    showMsg((type === 'schedule' ? '생산일정' : '품질/불량') + ' 서버 저장 중...', 'ok');
    return fetchJson(endpoint, { method:'POST', body: form }).then(function(res){
      var reqType = safeText(res.request_type || type);
      var serverType = safeText(res.upload_type || type);
      if(reqType !== type || serverType !== type){
        throw new Error('업로드 종류 불일치: 요청=' + type + ', 응답=' + serverType);
      }
      showMsg((type === 'schedule' ? '생산일정' : '품질/불량') + ' 서버 저장 완료 — ' + (res.row_count || res.inserted || 0) + '행', 'ok');
      return reloadServerData(true).then(function(){ return res; });
    }).catch(function(err){
      console.error('[TechSysLab/server-sync] upload failed', err);
      alert((type === 'schedule' ? '생산일정' : '품질/불량') + ' 서버 저장 실패: ' + err.message);
      throw err;
    });
  }

  function serverScheduleToAppRow(r, idx){
    var raw = r && r.raw ? r.raw : {};
    var machine = pickFrom(raw, ['호기','장비','CELL','cell','라인','설비']) || r.line_name || r.machine || '';
    var model = r.item_name || pickFrom(raw, ['모델명','모델','품명','제품명','item','model']) || '';
    var batch = r.order_no || pickFrom(raw, ['차수','수주번호','No','번호','LOT','lot']) || String(r.row_index || idx + 1);
    var plan = parseDateOnly(r.plan_date || pickFrom(raw, ['계획일','생산일','납기','일자','출고','해체','date']));
    var status = r.status || pickFrom(raw, ['상태','진행상태','공정상태']) || '서버반영';
    var note = pickFrom(raw, ['비고','메모','사유','내용']) || '';
    return {
      id: 'srv_s_' + (r.id || idx + 1),
      batch: safeText(batch),
      model: safeText(model),
      machine: safeText(machine || '미지정'),
      ybase: plan,
      chulgo: plan,
      haeje: '',
      note: safeText(note),
      type: safeText(status),
      _valid: true,
      _errs: [],
      _server: true,
      _sourceUploadId: r.upload_id || null
    };
  }

  function serverQualityToAppRow(r, idx){
    var raw = r && r.raw ? r.raw : {};
    var date = parseDateOnly(pickFrom(raw, ['날짜','일자','접수일','date']) || r.created_at || '');
    var model = r.item_name || pickFrom(raw, ['모델명','모델','품명','제품명','model']) || '미확인';
    var machine = pickFrom(raw, ['호기','장비','CELL','cell','라인','설비']) || '미확인';
    var part = pickFrom(raw, ['파트','부위','대분류','분류']) || '미분류';
    var issue = r.defect_type || pickFrom(raw, ['불량','불량유형','현상','내용','사유']) || '원본내용확인필요';
    var severity = r.severity || pickFrom(raw, ['중요도','심각도','등급']) || '일반';
    return {
      id: 'srv_q_' + (r.id || idx + 1),
      sourceSheet: 'server',
      sourceRow: r.row_index || idx + 1,
      monthKey: date ? date.slice(0,7) : 'server',
      date: date,
      model: safeText(model),
      machine: safeText(machine),
      cell: safeText(pickFrom(raw, ['CELL','cell']) || ''),
      part: safeText(part),
      smallCategory: safeText(issue),
      defectType: safeText(issue),
      issue: safeText(issue),
      status: safeText(r.status || '접수'),
      severity: safeText(severity),
      writer: safeText(pickFrom(raw, ['작성자','담당자','접수자']) || ''),
      parseStatus: 'ok',
      parseWarnings: [],
      images: [],
      imageCount: 0,
      raw: raw,
      _server: true,
      _sourceUploadId: r.upload_id || null
    };
  }

  function safeCall(name, fn){
    try{ if(typeof fn === 'function') return fn(); }
    catch(err){ console.warn('[TechSysLab/server-sync] ' + name + ' failed', err); }
  }

  function applyScheduleRows(rows){
    var mapped = rows.map(serverScheduleToAppRow).reverse();
    try{
      if(typeof YANGSAN_DATA !== 'undefined') YANGSAN_DATA = mapped;
      if(typeof YEONJU_DATA !== 'undefined') YEONJU_DATA = [];
      if(typeof PENDING_YANGSAN !== 'undefined') PENDING_YANGSAN = null;
      if(typeof PENDING_YEONJU !== 'undefined') PENDING_YEONJU = null;
      if(typeof WORK_DATA !== 'undefined') WORK_DATA = mapped.slice();
      if(typeof lastSavedYangsan !== 'undefined') lastSavedYangsan = JSON.parse(JSON.stringify(mapped));
      if(typeof lastSavedYeonju !== 'undefined') lastSavedYeonju = [];
      if(typeof SCHEDULE_LAST_SAVED_AT !== 'undefined') SCHEDULE_LAST_SAVED_AT = new Date().toISOString();
      safeCall('markScheduleDataReady', function(){ if(mapped.length && typeof markScheduleDataReady === 'function') markScheduleDataReady(); });
      safeCall('syncWorkData', function(){ if(typeof syncWorkData === 'function') syncWorkData(); });
      safeCall('commitSavedSnapshot', function(){ if(typeof commitSavedSnapshot === 'function') commitSavedSnapshot(); });
      safeCall('populateEditFilters', function(){ if(typeof populateEditFilters === 'function') populateEditFilters(); });
      safeCall('renderEditTable', function(){ if(typeof renderEditTable === 'function') renderEditTable(); });
      safeCall('populateGvFilters', function(){ if(typeof populateGvFilters === 'function') populateGvFilters(); });
      safeCall('renderCurrentView', function(){ if(typeof renderCurrentView === 'function') renderCurrentView(); });
      safeCall('renderDashboardKPI', function(){ if(typeof renderDashboardKPI === 'function') renderDashboardKPI(); });
      safeCall('_updateSchedStatusPanel', function(){ if(typeof _updateSchedStatusPanel === 'function') _updateSchedStatusPanel(); });
      var pb = byId('pendingBar'); if(pb) pb.style.display = 'none';
      setText('data-save-status', mapped.length ? '서버 DB 저장됨' : '서버 데이터 없음');
      setText('data-upload-hint', mapped.length ? '서버 DB 기준으로 불러온 생산일정입니다.' : '생산일정 업로드 후 서버 DB에 반영됩니다.');
      setText('sched-card-time', mapped.length ? '서버 동기화 ' + new Date().toLocaleTimeString('ko-KR') : '서버 데이터 없음');
      setText('card-total-y', mapped.length);
      setText('card-total-r', 0);
      setText('card-ok-y', mapped.length);
      setText('card-ok-r', 0);
      setText('card-err-y', 0);
      setText('card-err-r', 0);
    }catch(err){
      console.error('[TechSysLab/server-sync] applyScheduleRows failed', err);
    }
  }

  function applyQualityRows(rows){
    var mapped = rows.map(serverQualityToAppRow).reverse();
    try{
      if(typeof QDEFECT_RAW_ROWS !== 'undefined') QDEFECT_RAW_ROWS = mapped;
      if(typeof QRAW_ROWS !== 'undefined') QRAW_ROWS = mapped;
      if(typeof QDEFECT_IMAGES !== 'undefined') QDEFECT_IMAGES = [];
      if(typeof QDEFECT_UNMATCHED_IMAGES !== 'undefined') QDEFECT_UNMATCHED_IMAGES = [];
      if(typeof QDEFECT_PARSE_WARNINGS !== 'undefined') QDEFECT_PARSE_WARNINGS = [];
      if(typeof QDEFECT_WORKBOOK_READY !== 'undefined') QDEFECT_WORKBOOK_READY = mapped.length > 0;
      if(typeof QDEFECT_FILE !== 'undefined') QDEFECT_FILE = { name: '서버 DB 품질/불량 데이터', size: mapped.length };
      if(typeof QRAW_FILE_META !== 'undefined') QRAW_FILE_META = { name: '서버 DB 품질/불량 데이터', size: mapped.length };
      safeCall('buildQDefectAnalytics', function(){ if(typeof buildQDefectAnalytics === 'function' && typeof QDEFECT_ANALYTICS !== 'undefined') QDEFECT_ANALYTICS = buildQDefectAnalytics(mapped); });
      safeCall('qSyncDefectRowsToRebuildFlow', function(){ if(typeof qSyncDefectRowsToRebuildFlow === 'function') qSyncDefectRowsToRebuildFlow(); });
      safeCall('refreshQDefectAllPages', function(){ if(typeof refreshQDefectAllPages === 'function') refreshQDefectAllPages(); });
      safeCall('qEnsureQualityFlowTraceContainers', function(){ if(typeof qEnsureQualityFlowTraceContainers === 'function') qEnsureQualityFlowTraceContainers(); });
      safeCall('qRefreshQualityFlowTracePanel', function(){ if(typeof qRefreshQualityFlowTracePanel === 'function') qRefreshQualityFlowTracePanel('server-sync'); });
      ['qmain-badge','qdash-badge'].forEach(function(id){
        var el = byId(id);
        if(el) el.textContent = mapped.length ? mapped.length + '건 · 서버 DB' : '파일 미업로드';
      });
    }catch(err){
      console.error('[TechSysLab/server-sync] applyQualityRows failed', err);
    }
  }

  function miniCard(label, value, note, color){
    return '<div style="background:var(--sf);border:1px solid var(--bd);border-radius:8px;padding:9px 11px">' +
      '<div style="font-size:10px;color:var(--tm);font-weight:700;margin-bottom:3px">' + esc(label) + '</div>' +
      '<div style="font-size:20px;font-weight:900;color:' + (color || 'var(--ac)') + '">' + esc(value) + '</div>' +
      '<div style="font-size:10px;color:var(--tm);line-height:1.4">' + esc(note || '서버 DB 기준') + '</div>' +
      '</div>';
  }

  function scheduleTable(rows){
    if(!rows.length) return '<div style="font-size:10px;color:var(--tm);padding:12px">생산일정 업로드 후 표시됩니다.</div>';
    var shown = rows.slice().reverse().slice(0, 8);
    return '<table style="border-collapse:collapse;font-size:10px;width:100%;margin-top:6px"><thead><tr style="background:var(--bd)">' +
      '<th style="padding:5px 8px;text-align:left;color:var(--tm)">호기</th>' +
      '<th style="padding:5px 8px;text-align:left;color:var(--tm)">모델/품명</th>' +
      '<th style="padding:5px 8px;text-align:left;color:var(--tm)">상태</th>' +
      '<th style="padding:5px 8px;text-align:left;color:var(--tm)">일정</th>' +
      '<th style="padding:5px 8px;text-align:left;color:var(--tm)">기준</th>' +
      '</tr></thead><tbody>' + shown.map(function(r){
        return '<tr>' +
          '<td style="padding:6px 8px;border-bottom:1px solid var(--bd);color:var(--tp)">' + esc(short(r.machine,18)) + '</td>' +
          '<td style="padding:6px 8px;border-bottom:1px solid var(--bd);color:var(--ts)">' + esc(short(r.model,28)) + '</td>' +
          '<td style="padding:6px 8px;border-bottom:1px solid var(--bd);color:var(--gr)">' + esc(short(r.type,16)) + '</td>' +
          '<td style="padding:6px 8px;border-bottom:1px solid var(--bd);color:var(--ts)">' + esc(short(r.chulgo || r.ybase || '-',18)) + '</td>' +
          '<td style="padding:6px 8px;border-bottom:1px solid var(--bd);color:var(--ac)">서버</td>' +
        '</tr>';
      }).join('') + '</tbody></table>';
  }

  function qualityTable(rows){
    if(!rows.length) return '<div style="font-size:10px;color:var(--tm);padding:12px">품질/불량 업로드 후 표시됩니다.</div>';
    var shown = rows.slice().reverse().slice(0, 8);
    return '<table style="border-collapse:collapse;font-size:10px;width:100%;margin-top:6px"><thead><tr style="background:var(--bd)">' +
      '<th style="padding:5px 8px;text-align:left;color:var(--tm)">상태</th>' +
      '<th style="padding:5px 8px;text-align:left;color:var(--tm)">모델/품명</th>' +
      '<th style="padding:5px 8px;text-align:left;color:var(--tm)">불량/내용</th>' +
      '<th style="padding:5px 8px;text-align:left;color:var(--tm)">기준</th>' +
      '</tr></thead><tbody>' + shown.map(function(r){
        return '<tr>' +
          '<td style="padding:6px 8px;border-bottom:1px solid var(--bd);color:var(--gr)">' + esc(short(r.status,16)) + '</td>' +
          '<td style="padding:6px 8px;border-bottom:1px solid var(--bd);color:var(--ts)">' + esc(short(r.model,24)) + '</td>' +
          '<td style="padding:6px 8px;border-bottom:1px solid var(--bd);color:var(--ts)">' + esc(short(r.issue || r.defectType,32)) + '</td>' +
          '<td style="padding:6px 8px;border-bottom:1px solid var(--bd);color:var(--ac)">서버</td>' +
        '</tr>';
      }).join('') + '</tbody></table>';
  }

  function applyDashboard(health, uploadsPayload, scheduleRows, qualityRows){
    var db = (health && health.db) || {};
    var sc = Number(db.scheduleRowCount || scheduleRows.length || 0);
    var qc = Number(db.qualityIssueCount || qualityRows.length || 0);
    var uc = Number(db.uploadHistoryCount || 0);
    var af = Number(db.activeSourceFileCount || 0);
    var latestSchedule = latestUpload(uploadsPayload, 'schedule');
    var latestQuality = latestUpload(uploadsPayload, 'quality');
    var sub = document.querySelector('#page-dashboard .pg-sub');
    if(sub) sub.textContent = '서버 DB 기준 · 사용자 포털 업로드/저장 반영 · api.techsyslab.com 연결';

    setText('kpi-yangsan', sc);
    setText('kpi-yeonju', uc);
    setText('kpi-delay-val', 0);
    setText('kpi-done-val', af);
    setText('sn-prod-count', sc);
    setText('sn-ship-count', uc);
    setText('sn-delay-count', 0);
    setText('sn-done-count', af);
    setText('sn-raw-count', qc);
    setText('sn-raw-label', '서버 quality_issues 기준');
    setText('sn-issue-count', qc);
    setText('sn-img-count', '-');
    setText('sn-img-label', '이미지 별도 연동');
    setText('sn-data-status', '서버 DB 기준');
    setText('sn-data-label', 'api.techsyslab.com 연결됨');

    setHtml('dash-status-summary',
      '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">' +
      miniCard('생산일정 반영 행', sc, latestSchedule ? short(latestSchedule.original_filename, 34) : '사용자 포털 업로드 필요', 'var(--pi)') +
      miniCard('업로드 기록', uc, '업로드 이력 누적 보관', 'var(--ac)') +
      '</div>'
    );
    setHtml('dash-monthly-output',
      '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">' +
      miniCard('활성 원본파일', af, 'source_files 원본 기준', 'var(--gr)') +
      miniCard('최근 생산일정', latestSchedule ? (latestSchedule.row_count || 0) + '행' : '없음', latestSchedule ? short(latestSchedule.uploaded_at, 24) : '업로드 필요', 'var(--pi)') +
      '</div>'
    );
    setHtml('dash-quality-rate',
      '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">' +
      miniCard('품질/불량 반영 행', qc, latestQuality ? short(latestQuality.original_filename, 34) : '품질 업로드 필요', 'var(--rd)') +
      miniCard('최근 품질 파일', latestQuality ? (latestQuality.row_count || 0) + '행' : '없음', latestQuality ? short(latestQuality.uploaded_at, 24) : '업로드 필요', 'var(--am)') +
      '</div>'
    );
    setHtml('dash-progress', scheduleTable(scheduleRows.map(serverScheduleToAppRow)));
  }

  function applyUploadHistoryHint(uploadsPayload){
    var uploads = rowsOf(uploadsPayload);
    if(!uploads.length) return;
    setText('tv-sched', '서버 업로드 반영');
    setText('tv-quality', '서버 업로드 반영');
  }

  function applyAll(data){
    if(!data || state.applying) return;
    state.applying = true;
    try{
      var scheduleRows = rowsOf(data.schedule);
      var qualityRows = rowsOf(data.quality);
      applyScheduleRows(scheduleRows);
      applyQualityRows(qualityRows);
      applyDashboard(data.health, data.uploads, scheduleRows, qualityRows);
      applyUploadHistoryHint(data.uploads);
      state.data = data;
      window.TechSysLabLiveServerData = data;
    }finally{
      state.applying = false;
    }
  }

  function reloadServerData(force){
    if(!hasAccess() && !force) return Promise.resolve(null);
    var now = Date.now();
    if(!force && now - state.lastRefreshAt < 1500) return Promise.resolve(state.data);
    state.lastRefreshAt = now;
    return Promise.all([
      fetchJson('/api/health'),
      fetchJson('/api/public/uploads'),
      fetchJson('/api/schedule?limit=500'),
      fetchJson('/api/quality/issues?limit=500')
    ]).then(function(values){
      var data = { health: values[0], uploads: values[1], schedule: values[2], quality: values[3], loadedAt: new Date().toISOString() };
      applyAll(data);
      return data;
    }).catch(function(err){
      console.error('[TechSysLab/server-sync] reload failed', err);
      setText('sn-data-status', '서버 연결 필요');
      setText('sn-data-label', 'api.techsyslab.com 확인');
      return null;
    });
  }

  function installUploadHooks(){
    if(state.installed) return;
    state.installed = true;

    if(typeof handleUpload === 'function' && !handleUpload.__tslServerSyncWrapped){
      var originalHandleUpload = handleUpload;
      handleUpload = function(input){
        try{
          var file = input && input.files && input.files[0];
          if(file) state.scheduleFile = file;
        }catch(e){}
        return originalHandleUpload.apply(this, arguments);
      };
      handleUpload.__tslServerSyncWrapped = true;
    }

    if(typeof schedSaveData === 'function' && !schedSaveData.__tslServerSyncWrapped){
      var originalSchedSaveData = schedSaveData;
      schedSaveData = function(){
        var file = state.scheduleFile;
        var ret = originalSchedSaveData.apply(this, arguments);
        if(file){
          uploadToServer('schedule', file).finally(function(){ state.scheduleFile = null; });
        }else{
          reloadServerData(true);
        }
        return ret;
      };
      schedSaveData.__tslServerSyncWrapped = true;
    }

    if(typeof handleQDefectUpload === 'function' && !handleQDefectUpload.__tslServerSyncWrapped){
      var originalHandleQDefectUpload = handleQDefectUpload;
      handleQDefectUpload = function(file){
        if(file) state.qualityFile = file;
        var ret = originalHandleQDefectUpload.apply(this, arguments);
        if(file){
          uploadToServer('quality', file).finally(function(){ state.qualityFile = null; });
        }
        return ret;
      };
      handleQDefectUpload.__tslServerSyncWrapped = true;
    }
  }

  function start(){
    installUploadHooks();
    reloadServerData(true);
    setTimeout(function(){ installUploadHooks(); reloadServerData(true); }, 700);
    setTimeout(function(){ applyAll(state.data); }, 1800);
  }

  window.TechSysLabUserPortalServerSync = {
    reload: function(){ return reloadServerData(true); },
    uploadSchedule: function(file){ return uploadToServer('schedule', file); },
    uploadQuality: function(file){ return uploadToServer('quality', file); },
    getState: function(){ return state; }
  };

  document.addEventListener('tsl:gate-unlocked', function(){ setTimeout(start, 80); });
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) reloadServerData(false); });
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(start, 250); });
  if(document.readyState !== 'loading') setTimeout(start, 250);
})();
