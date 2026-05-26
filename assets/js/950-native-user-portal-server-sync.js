(function(){
  'use strict';

  var API_BASE = 'https://api.techsyslab.com';
  var STATE = {
    scheduleFile: null,
    qualityFile: null,
    lastHealth: null,
    lastScheduleRows: [],
    lastQualityRows: [],
    syncing: false
  };
  window.TechSysLabNativeServerSync = STATE;

  function log(){ try{ console.log.apply(console, ['[native-server-sync]'].concat([].slice.call(arguments))); }catch(_){} }
  function warn(){ try{ console.warn.apply(console, ['[native-server-sync]'].concat([].slice.call(arguments))); }catch(_){} }
  function byId(id){ return document.getElementById(id); }
  function safe(fn){ try{ return fn(); }catch(e){ warn(e && e.message ? e.message : e); return undefined; } }
  function nrm(s){ return String(s == null ? '' : s).replace(/[^a-z0-9가-힣]+/gi,'').toLowerCase(); }
  function escapeHtml(s){ return String(s == null ? '' : s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

  function jsonFetch(path, opt){
    return fetch(API_BASE + path, Object.assign({credentials:'omit', cache:'no-store'}, opt || {})).then(function(r){
      if(!r.ok) return r.text().then(function(t){ throw new Error(path+' HTTP '+r.status+' '+t.slice(0,300)); });
      return r.json();
    });
  }

  function pick(obj, keys){
    if(!obj) return '';
    var normMap = {};
    Object.keys(obj).forEach(function(k){ normMap[nrm(k)] = obj[k]; });
    for(var i=0;i<keys.length;i++){
      var nk = nrm(keys[i]);
      if(Object.prototype.hasOwnProperty.call(normMap,nk) && normMap[nk] !== null && normMap[nk] !== '') return String(normMap[nk]);
    }
    for(var k in obj){
      var kk=nrm(k);
      for(var j=0;j<keys.length;j++){
        var want=nrm(keys[j]);
        if(want && kk.indexOf(want) >= 0 && obj[k] !== null && obj[k] !== '') return String(obj[k]);
      }
    }
    return '';
  }

  function asRaw(serverRow){
    return serverRow && typeof serverRow.raw === 'object' && serverRow.raw ? serverRow.raw : {};
  }

  function parseRawJson(v){
    if(!v) return {};
    if(typeof v === 'object') return v;
    try{ return JSON.parse(v); }catch(_){ return {}; }
  }

  function toScheduleRow(serverRow, index){
    var raw = asRaw(serverRow);
    var row = {
      id: 900000 + index,
      batch: pick(raw,['차수','구분','수주번호','오더','order_no','order','lot','job']) || serverRow.order_no || String(index+1),
      model: pick(raw,['모델명','모델','품명','제품명','item_name','item','part']) || serverRow.item_name || '',
      machine: pick(raw,['호기','설비','라인','line','cell','CELL']) || serverRow.line_name || '',
      note: pick(raw,['비고','기타','메모','note']) || '',
      type: serverRow.status || pick(raw,['상태','진행상태','공정상태']) || '대기',
      _valid: true,
      _errs: []
    };
    var plan = serverRow.plan_date || pick(raw,['계획일','생산일','일자','날짜','납기','출고','해체']);
    if(plan){ row.chulgo = String(plan).slice(0,10); row.planDate = String(plan).slice(0,10); }

    // 기존 동적 스키마 필드명에 최대한 맞춰 날짜를 채운다.
    safe(function(){
      var schema = window.ACTIVE_SCHEMA || {};
      (schema.materials || []).forEach(function(m){ row[m.key] = pick(raw,[m.label,m.short,m.key]); });
      (schema.works || []).forEach(function(w){
        row[w.key+'Start'] = pick(raw,[w.label+' 시작',w.label+'시작',w.short+' 시작',w.key+'Start',w.key+'_start','시작']);
        row[w.key+'End']   = pick(raw,[w.label+' 종료',w.label+'종료',w.short+' 종료',w.key+'End',w.key+'_end','종료']);
      });
      (schema.semix || []).forEach(function(s){ row[s.key] = pick(raw,[s.label,s.short,s.key]); });
    });
    return row;
  }

  function toQualityRow(serverRow, index){
    var raw = asRaw(serverRow);
    var date = pick(raw,['날짜','일자','date','발생일','접수일']) || '';
    var severity = serverRow.severity || pick(raw,['중요도','심각도','등급','severity']) || '일반';
    var content = serverRow.defect_type || pick(raw,['내용','불량내용','현상','이슈내용','사유','불량','defect_type']) || '원본내용확인필요';
    return {
      id: 'server_Q_' + (serverRow.id || index),
      sourceSheet: 'server',
      sourceRow: Number(serverRow.row_index || index+1),
      monthKey: date ? String(date).slice(0,7) : 'server',
      no: serverRow.issue_no || pick(raw,['No','번호','구분','이슈번호','불량번호']) || String(index+1),
      date: date ? String(date).slice(0,10) : '',
      writer: pick(raw,['작성자','writer','담당자']) || '',
      dept: pick(raw,['부서','dept','팀']) || '',
      model: pick(raw,['종류','모델','모델명','장비','품명']) || serverRow.item_name || '',
      machine: pick(raw,['호기','설비','machine','장비번호']) || '',
      cell: pick(raw,['CELL','cell','셀']) || '',
      severity: severity,
      content: content,
      part: pick(raw,['파트','part','품명','부품']) || serverRow.item_name || '',
      majorCategory: pick(raw,['대분류','major']) || '',
      middleCategory: pick(raw,['중분류','middle']) || '',
      smallCategory: pick(raw,['소분류','small']) || '',
      etc: pick(raw,['기타','비고','etc']) || '',
      imageCount: 0,
      images: [],
      parseStatus: 'ok',
      parseWarnings: [],
      isCritical: severity === '치명',
      modelMachineKey: '',
      categoryPath: ''
    };
  }

  function refreshScheduleNative(){
    safe(function(){ if(typeof syncWorkData === 'function') syncWorkData(); });
    safe(function(){ if(typeof commitSavedSnapshot === 'function') commitSavedSnapshot(); });
    safe(function(){ if(typeof populateEditFilters === 'function') populateEditFilters(); });
    safe(function(){ if(typeof renderEditTable === 'function') renderEditTable(); });
    safe(function(){ if(typeof populateGvFilters === 'function') populateGvFilters(); });
    safe(function(){ if(typeof renderCurrentView === 'function') renderCurrentView(); });
    safe(function(){ if(typeof renderDashboardKPI === 'function') renderDashboardKPI(); });
    safe(function(){ if(typeof renderDashboardSummaryNotes === 'function') renderDashboardSummaryNotes(); });
    safe(function(){ if(typeof renderUserProdOverviewPage === 'function') renderUserProdOverviewPage(); });
    safe(function(){ if(typeof renderUserProdHeadcountPage === 'function') renderUserProdHeadcountPage(); });
    safe(function(){ if(typeof renderUserProdProcessPage === 'function') renderUserProdProcessPage(); });
    safe(function(){ if(typeof _updateSchedStatusPanel === 'function') _updateSchedStatusPanel(); });
    safe(function(){ if(typeof updateCards === 'function') updateCards(); });
  }

  function applyScheduleRows(rows, health){
    var list = (rows || []).slice().reverse().map(toScheduleRow);
    STATE.lastScheduleRows = list;
    if(list.length){
      window.YANGSAN_DATA = list;
      window.YEONJU_DATA = [];
      window.PENDING_YANGSAN = null;
      window.PENDING_YEONJU = null;
      window.WORK_DATA = list.slice();
      safe(function(){ if(typeof markScheduleDataReady === 'function') markScheduleDataReady(); });
      window.SCHEDULE_LAST_SAVED_AT = (health && health.checkedAt) || new Date().toISOString();
    }
    refreshScheduleNative();
  }

  function refreshQualityNative(){
    safe(function(){ if(typeof buildQDefectAnalytics === 'function') window.QDEFECT_ANALYTICS = buildQDefectAnalytics(window.QDEFECT_RAW_ROWS || []); });
    safe(function(){ if(typeof refreshQDefectAllPages === 'function') refreshQDefectAllPages(); });
    safe(function(){ if(typeof renderQDashPage === 'function') renderQDashPage(); });
    safe(function(){ if(typeof renderQMainPage === 'function') renderQMainPage(); });
    safe(function(){ if(typeof renderQAnalysisPage === 'function') renderQAnalysisPage(); });
    safe(function(){ if(typeof renderQActionPage === 'function') renderQActionPage(); });
    safe(function(){ if(typeof renderQImagesPage === 'function') renderQImagesPage(); });
    safe(function(){ if(typeof renderQMasterPage === 'function') renderQMasterPage(); });
  }

  function applyQualityRows(rows){
    var list = (rows || []).slice().reverse().map(toQualityRow);
    STATE.lastQualityRows = list;
    if(list.length){
      window.QDEFECT_RAW_ROWS = list;
      window.QDEFECT_WORKBOOK_READY = true;
      window.QDEFECT_FILE = window.QDEFECT_FILE || { name: 'server-db-quality.xlsx', size: 0 };
      var badge = list.length + '건 · 서버 DB 기준';
      ['qdash-badge','qmain-badge'].forEach(function(id){ safe(function(){ if(typeof _qBadge === 'function') _qBadge(byId(id), badge, 'green'); }); });
    }
    refreshQualityNative();
  }

  function updateSmallStatus(health){
    safe(function(){
      var sub = document.querySelector('#page-dashboard .pg-sub');
      if(sub && health && health.db){
        sub.textContent = '서버 DB 기준 · 생산일정 ' + health.db.scheduleRowCount + '행 · 품질/불량 ' + health.db.qualityIssueCount + '행 · 테스트 데이터 없음';
      }
    });
  }

  function loadServerIntoNative(){
    if(STATE.syncing) return Promise.resolve();
    STATE.syncing = true;
    return Promise.all([
      jsonFetch('/api/health'),
      jsonFetch('/api/schedule?limit=2000'),
      jsonFetch('/api/quality/issues?limit=2000')
    ]).then(function(res){
      var health = res[0], schedule = res[1], quality = res[2];
      STATE.lastHealth = health;
      updateSmallStatus(health);
      applyScheduleRows(schedule && schedule.rows ? schedule.rows : [], health);
      applyQualityRows(quality && quality.rows ? quality.rows : []);
      log('server data applied', health && health.db);
    }).catch(function(err){
      warn('server data load failed', err && err.message ? err.message : err);
    }).finally(function(){ STATE.syncing = false; });
  }

  function uploadFileToServer(type, file){
    if(!file) return Promise.resolve(null);
    var endpoint = type === 'schedule' ? '/api/public/upload/schedule' : '/api/public/upload/quality';
    var fd = new FormData();
    fd.append('file', file, file.name || (type + '.xlsx'));
    fd.append('uploaded_by', 'user-portal-native');
    return fetch(API_BASE + endpoint, { method:'POST', body:fd, credentials:'omit', cache:'no-store' })
      .then(function(r){
        if(!r.ok) return r.text().then(function(t){ throw new Error(endpoint+' HTTP '+r.status+' '+t.slice(0,300)); });
        return r.json();
      })
      .then(function(data){
        log('uploaded', type, data);
        if(typeof showToast === 'function') showToast((type==='schedule'?'생산일정':'품질/불량') + ' 서버 저장 완료', 'ok');
        return loadServerIntoNative().then(function(){ return data; });
      })
      .catch(function(err){
        warn('upload failed', type, err && err.message ? err.message : err);
        if(typeof showErr === 'function') showErr((type==='schedule'?'생산일정':'품질/불량') + ' 서버 저장 실패: ' + (err.message || err));
        throw err;
      });
  }

  function hookNativeUpload(){
    if(window.__tslNativeSyncHooked) return;
    window.__tslNativeSyncHooked = true;

    var origHandleUpload = window.handleUpload;
    if(typeof origHandleUpload === 'function'){
      window.handleUpload = function(input){
        try{ STATE.scheduleFile = input && input.files && input.files[0] ? input.files[0] : null; }catch(_){ STATE.scheduleFile = null; }
        return origHandleUpload.apply(this, arguments);
      };
    }

    var origSchedSave = window.schedSaveData;
    if(typeof origSchedSave === 'function'){
      window.schedSaveData = function(){
        var beforeY = Array.isArray(window.YANGSAN_DATA) ? window.YANGSAN_DATA.length : 0;
        var beforeR = Array.isArray(window.YEONJU_DATA) ? window.YEONJU_DATA.length : 0;
        var ret = origSchedSave.apply(this, arguments);
        var hasSavedRows = ((Array.isArray(window.YANGSAN_DATA)?window.YANGSAN_DATA.length:0) + (Array.isArray(window.YEONJU_DATA)?window.YEONJU_DATA.length:0)) > 0;
        if(STATE.scheduleFile && hasSavedRows){
          uploadFileToServer('schedule', STATE.scheduleFile).finally(function(){ STATE.scheduleFile = null; });
        } else if(beforeY || beforeR){
          loadServerIntoNative();
        }
        return ret;
      };
    }

    var origQ = window.handleQDefectUpload;
    if(typeof origQ === 'function'){
      window.handleQDefectUpload = function(file){
        STATE.qualityFile = file || null;
        var ret = origQ.apply(this, arguments);
        if(file){ setTimeout(function(){ uploadFileToServer('quality', file).finally(function(){ STATE.qualityFile = null; }); }, 800); }
        return ret;
      };
    }
  }

  function boot(){
    hookNativeUpload();
    loadServerIntoNative();
    // 기존 포털 스크립트가 초기 렌더에서 빈 상태를 다시 만들 수 있어 짧게 재동기화한다.
    setTimeout(loadServerIntoNative, 900);
    setTimeout(loadServerIntoNative, 2200);
    window.addEventListener('hashchange', function(){ setTimeout(loadServerIntoNative, 250); });
    document.addEventListener('visibilitychange', function(){ if(!document.hidden) setTimeout(loadServerIntoNative, 250); });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
