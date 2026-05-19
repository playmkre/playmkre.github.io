/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 4 id=(none) :: OPT01 no semantic edits */

  var _to2SelKey = null;
  var _to2TeamMap = {};
  var _to2StageMap = {};
  var _to2HasTeamField = false;
  function _to2Build() {
    try {
      var rows = typeof WORK_DATA !== 'undefined' ? WORK_DATA : [];
      _to2TeamMap = {}; _to2StageMap = {};
      var missingTeam = 0, missingDate = 0, delayCount = 0, assignedCount = 0;
      // 팀 필드 감지
      _to2HasTeamField = rows.some(function(r){ return r.manager||r.담당||r.team||r.팀; });
      rows.forEach(function(r) {
        var team = r.manager||r.담당||r.team||r.팀||null;
        var info = typeof getRowStageInfo==='function'?getRowStageInfo(r):null;
        var status = info?info.status:'미확인';
        var delay = typeof hasScheduleDelay==='function'&&hasScheduleDelay(r);
        if(!team) missingTeam++;
        else {
          assignedCount++;
          if(!_to2TeamMap[team]) _to2TeamMap[team] = {total:0,active:0,ship:0,delay:0,rows:[]};
          _to2TeamMap[team].total++;
          _to2TeamMap[team].rows.push(r);
          if(/진행|자재|작업|대기|계획/.test(status)) _to2TeamMap[team].active++;
          if(/출고/.test(status)) _to2TeamMap[team].ship++;
          if(delay) _to2TeamMap[team].delay++;
        }
        // 단계 분포
        var stageKey = '미확인';
        if(info){if(/자재|입고/.test(status))stageKey='자재입고';else if(/진행|작업/.test(status))stageKey='작업';else if(/출고/.test(status))stageKey='출고';else if(/완료|해체/.test(status))stageKey='해체';}
        if(!_to2StageMap[stageKey]) _to2StageMap[stageKey] = {total:0,delay:0};
        _to2StageMap[stageKey].total++;
        if(delay){_to2StageMap[stageKey].delay++;delayCount++;}
        if(!info||!info.date) missingDate++;
      });
      // 준비 상태 카드
      var prep = document.getElementById('to2-prep-card');
      var prepBody = document.getElementById('to2-prep-body');
      if(prep && prepBody) {
        prep.className = 'team-prep-card ' + (_to2HasTeamField ? 'team-prep-ok' : 'team-prep-warn');
        prepBody.innerHTML =
          '<span class="team-badge '+(_to2HasTeamField?'ok':'warn')+'">담당/팀 필드: '+(_to2HasTeamField?'감지됨':'없음')+'</span>'+
          '<span class="team-badge ok">공정/단계: 감지됨</span>'+
          '<span class="team-badge '+(missingTeam>0?'warn':'ok')+'">미배정: '+missingTeam+'건</span>'+
          '<span class="team-badge '+(delayCount>0?'err':'ok')+'">지연: '+delayCount+'건</span>'+
          (!_to2HasTeamField ? '<div style="margin-top:8px;color:var(--am)">담당/팀 필드가 없어 공정/단계 기준으로 대체 표시합니다.</div>' : '');
      }
      // 팀 타이틀 업데이트
      var teamTitle = document.getElementById('to2-team-title');
      if(teamTitle) teamTitle.textContent = _to2HasTeamField ? '👤 팀/담당별 분포 (주력)' : '👤 팀/담당별 분포 (필드 없음)';
      var stageSub = document.getElementById('to2-stage-sub');
      if(stageSub) stageSub.textContent = _to2HasTeamField ? '' : '(팀 필드 없어 주력 표시)';
      // 미배정 패널
      var unBody = document.getElementById('to2-unassigned-body');
      if(unBody) {
        if(!rows.length) { unBody.textContent = '업로드 후 확인됩니다.'; }
        else if(missingTeam === 0 && delayCount === 0) { unBody.innerHTML = '<span style="color:var(--gr)">✓ 미배정 항목이 없습니다.</span>'; }
        else {
          unBody.innerHTML =
            (missingTeam>0?'<div style="margin-bottom:4px">📌 담당/팀 미기재: <strong>'+missingTeam+'건</strong></div>':'')+
            (delayCount>0?'<div style="margin-bottom:4px">⚠ 지연 영향: <strong>'+delayCount+'건</strong></div>':'')+
            (missingDate>0?'<div>📅 날짜 누락: <strong>'+missingDate+'건</strong></div>':'');
        }
      }
      _to2Render();
    } catch(err) {}
  }
  function _to2Render() {
    try {
      var q = (document.getElementById('to2-search')||{}).value||'';
      var flt = (document.getElementById('to2-filter')||{}).value||'';
      var unOnly = (document.getElementById('to2-unassigned-only')||{}).checked||false;
      // 팀 표
      var teamRows = Object.keys(_to2TeamMap).filter(function(k){
        if(q && !k.toLowerCase().includes(q.toLowerCase())) return false;
        if(flt==='delay' && !_to2TeamMap[k].delay) return false;
        return true;
      }).sort();
      var teamTbody = document.getElementById('to2-team-tbody');
      if(teamTbody) {
        if(!teamRows.length) {
          teamTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--tm);padding:12px">'+
            (_to2HasTeamField?'조건에 맞는 팀 없음':'담당/팀 필드가 없습니다. 아래 단계별 분포를 확인하세요.')+'</td></tr>';
        } else {
          teamTbody.innerHTML = teamRows.map(function(k){
            var d=_to2TeamMap[k];
            var sel=_to2SelKey===k?' class="selected"':'';
            return '<tr'+sel+' data-tkey2="'+k+'" data-ttype="team" onclick="_to2Select(this.dataset.tkey2,this.dataset.ttype)">'+
              '<td>'+k+'</td><td>'+d.total+'</td><td>'+d.active+'</td><td>'+d.ship+'</td>'+
              '<td style="color:'+(d.delay?'var(--rd)':'var(--ts)')+'">'+d.delay+'</td></tr>';
          }).join('');
        }
      }
      // 단계 표
      var stageOrder = ['자재입고','작업','출고','해체','미확인'];
      var total = Object.values(_to2StageMap).reduce(function(s,v){return s+v.total;},0)||1;
      var stageTbody = document.getElementById('to2-stage-tbody');
      if(stageTbody) {
        var hasStage = Object.keys(_to2StageMap).length > 0;
        if(!hasStage) { stageTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--tm);padding:12px">생산일정 업로드 후 표시됩니다.</td></tr>'; }
        else {
          stageTbody.innerHTML = stageOrder.filter(function(k){return _to2StageMap[k];}).map(function(k){
            var d=_to2StageMap[k];var pct=Math.round(d.total/total*100);
            return '<tr data-skey="'+k+'" data-ttype="stage" onclick="_to2Select(this.dataset.skey,this.dataset.ttype)"><td>'+k+'</td><td>'+d.total+'</td>'+
              '<td><div style="background:var(--bd);border-radius:3px;height:8px;overflow:hidden">'+
              '<div style="width:'+pct+'%;height:100%;background:var(--ac);border-radius:3px"></div></div></td>'+
              '<td style="color:'+(d.delay?'var(--rd)':'var(--ts)')+'">'+d.delay+'</td></tr>';
          }).join('');
        }
      }
    } catch(err) {}
  }
  function _to2Select(key, type) {
    _to2SelKey = key;
    var panel = document.getElementById('to2-detail-panel');
    var title = document.getElementById('to2-detail-title');
    var content = document.getElementById('to2-detail-content');
    if(!panel||!title||!content) return;
    panel.style.display = 'block';
    var d = type==='team' ? _to2TeamMap[key] : null;
    if(type==='stage') {
      title.textContent = '단계 상세: ' + key;
      var smap = {};
      (typeof WORK_DATA!=='undefined'?WORK_DATA:[]).forEach(function(r){
        var info=typeof getRowStageInfo==='function'?getRowStageInfo(r):null;
        var s=info?info.status:'미확인';
        var match=false;
        if(key==='자재입고'&&/자재|입고/.test(s))match=true;
        else if(key==='작업'&&/진행|작업/.test(s))match=true;
        else if(key==='출고'&&/출고/.test(s))match=true;
        else if(key==='해체'&&/완료|해체/.test(s))match=true;
        else if(key==='미확인'&&!/자재|입고|진행|작업|출고|완료|해체/.test(s))match=true;
        if(match){var m=r.machine||'미지정';smap[m]=(smap[m]||0)+1;}
      });
      content.innerHTML = '<div style="font-size:10px;color:var(--tm);margin-bottom:6px">호기별 분포</div>'+
        Object.keys(smap).sort(function(a,b){return smap[b]-smap[a];}).slice(0,10).map(function(k){
          return '<div style="display:flex;justify-content:space-between;font-size:10px;padding:2px 0;border-bottom:1px solid var(--bd)"><span style="color:var(--ts)">'+k+'</span><span style="font-weight:700">'+smap[k]+'건</span></div>';
        }).join('');
    } else if(d) {
      title.textContent = '팀 상세: ' + key;
      var machines = [...new Set(d.rows.map(function(r){return r.machine||'미지정';}))];
      content.innerHTML = '<div style="font-size:10px;color:var(--tm);margin-bottom:6px">'+
        '연결 '+d.total+'건 · 주요 호기: '+machines.slice(0,3).join(', ')+'</div>'+
        (d.delay?'<div style="color:var(--rd);font-size:10px;margin-bottom:4px">⚠ 지연 '+d.delay+'건</div>':'');
    }
  }
  setTimeout(_to2Build, 200);
  