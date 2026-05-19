/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 3 id=(none) :: OPT01 no semantic edits */

  var _es2SelMachine = null;
  var _es2Data = {};
  function _es2Build() {
    try {
      var rows = typeof WORK_DATA !== 'undefined' ? WORK_DATA : [];
      _es2Data = {};
      rows.forEach(function(r) {
        var m = r.machine || r.machineNo || r.호기 || '미지정';
        if(!_es2Data[m]) _es2Data[m] = {rows:[], active:0, ship:0, done:0, delay:0, missing:0};
        _es2Data[m].rows.push(r);
        var info = typeof getRowStageInfo === 'function' ? getRowStageInfo(r) : null;
        var s = info ? info.status : '';
        if(/진행|자재|작업|대기|계획/.test(s)) _es2Data[m].active++;
        if(/출고/.test(s)) _es2Data[m].ship++;
        if(/완료|해체/.test(s)) _es2Data[m].done++;
        if(typeof hasScheduleDelay === 'function' && hasScheduleDelay(r)) _es2Data[m].delay++;
        if(!info || !info.date) _es2Data[m].missing++;
      });
      var allMachines = Object.keys(_es2Data).sort();
      var totalActive=0, totalShip=0, totalDelay=0, totalMissing=0;
      allMachines.forEach(function(k){totalActive+=_es2Data[k].active;totalShip+=_es2Data[k].ship;totalDelay+=_es2Data[k].delay;totalMissing+=_es2Data[k].missing;});
      var e; e=document.getElementById('es2-total');if(e)e.textContent=allMachines.length;
      e=document.getElementById('es2-active');if(e)e.textContent=totalActive;
      e=document.getElementById('es2-ship');if(e)e.textContent=totalShip;
      e=document.getElementById('es2-delay');if(e)e.textContent=totalDelay;
      e=document.getElementById('es2-missing');if(e)e.textContent=totalMissing;
      _es2Render();
    } catch(err) {}
  }
  function _es2Render() {
    try {
      var q = (document.getElementById('es2-filter-search')||{}).value||'';
      var sf = (document.getElementById('es2-filter-status')||{}).value||'';
      var delayOnly = (document.getElementById('es2-delay-only')||{}).checked||false;
      var machines = Object.keys(_es2Data).filter(function(k) {
        if(q && !k.toLowerCase().includes(q.toLowerCase())) return false;
        if(delayOnly && !_es2Data[k].delay) return false;
        var d = _es2Data[k];
        if(sf === '진행' && d.active === 0) return false;
        if(sf === '출고' && d.ship + d.done === 0) return false;
        if(sf === 'delay' && d.delay === 0) return false;
        return true;
      }).sort();
      // 좌측 목록
      var listEl = document.getElementById('es2-list-items');
      if(listEl) {
        if(!machines.length) { listEl.innerHTML = '<div style="font-size:10px;color:var(--tm);padding:8px 0;text-align:center">없음</div>'; }
        else { listEl.innerHTML = machines.map(function(k){
          var cls = 'equip-search-item' + (_es2SelMachine===k?' active':'');
          return '<div class="'+cls+'" data-mkey="'+k+'" onclick="_es2Select(this.dataset.mkey)">'+k+'</div>';
        }).join(''); }
      }
      // 중앙 카드 grid
      var grid = document.getElementById('es2-cards-grid');
      if(grid) {
        if(!machines.length) {
          grid.innerHTML = '<div style="grid-column:1/-1;padding:24px;text-align:center;background:var(--sf);border:1px solid var(--bd);border-radius:8px;color:var(--tm);font-size:10px">조건에 맞는 호기가 없습니다.</div>';
        } else {
          grid.innerHTML = machines.map(function(k) {
            var d = _es2Data[k];
            var mainRow = d.rows[0]||{};
            var info = typeof getRowStageInfo==='function'?getRowStageInfo(mainRow):null;
            var statusLabel = info?info.label:'대기';
            var stageCls = 'wait';
            if(info){if(/자재|입고/.test(info.status))stageCls='mat';else if(/진행|작업/.test(info.status))stageCls='work';else if(/출고/.test(info.status))stageCls='ship';else if(/완료|해체/.test(info.status))stageCls='done';}
            if(d.delay>0)stageCls='delay';
            var model=(mainRow.model||mainRow.modelType||mainRow.종류||'-').slice(0,12);
            var sel = _es2SelMachine===k?' selected':'';
            return '<div class="equip-card'+sel+'" data-mkey="'+k+'" onclick="_es2Select(this.dataset.mkey)">'+
              '<div class="equip-card-name">'+k+'</div>'+
              '<div class="equip-card-meta">모델: '+model+' · '+d.rows.length+'건</div>'+
              '<span class="equip-card-status '+stageCls+'">'+statusLabel+'</span>'+
              (d.delay>0?'<span style="margin-left:4px;font-size:9px;color:var(--rd)">⚠ 지연'+d.delay+'</span>':'')+
              '</div>';
          }).join('');
        }
      }
    } catch(err) {}
  }
  function _es2Select(machineKey) {
    _es2SelMachine = machineKey;
    _es2Render();
    var emptyEl = document.getElementById('es2-detail-empty');
    var contentEl = document.getElementById('es2-detail-content');
    if(!emptyEl || !contentEl) return;
    var d = _es2Data[machineKey];
    if(!d) { emptyEl.style.display='block'; contentEl.style.display='none'; return; }
    emptyEl.style.display = 'none'; contentEl.style.display = 'block';
    var models = [...new Set(d.rows.map(function(r){return r.model||r.modelType||r.종류||'-';}))];
    var stageRows = d.rows.map(function(r){
      var info = typeof getRowStageInfo==='function'?getRowStageInfo(r):null;
      var delay = typeof hasScheduleDelay==='function'&&hasScheduleDelay(r);
      return '<tr><td>'+(r.batch||'-')+'</td><td>'+(models[0]||'-')+'</td><td>'+(info?info.label:'대기')+'</td><td style="color:'+(delay?'var(--rd)':'var(--ts)')+'">'+( delay?'⚠ 지연':'정상')+'</td></tr>';
    }).slice(0,10).join('');
    contentEl.innerHTML = '<div style="font-size:11px;font-weight:700;color:var(--ts);margin-bottom:6px">'+machineKey+'</div>'+
      '<div style="font-size:10px;color:var(--tm);margin-bottom:8px">총 '+d.rows.length+'건 · 모델: '+models.slice(0,3).join(', ')+'</div>'+
      '<div style="font-size:10px;color:var(--rd);margin-bottom:8px">'+(d.delay>0?'⚠ 지연 '+d.delay+'건':'지연 없음')+'</div>'+
      '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:9px">'+
      '<thead><tr style="background:var(--bd)"><th style="padding:3px 6px;text-align:left;color:var(--tm)">차수</th><th style="padding:3px 6px;text-align:left;color:var(--tm)">모델</th><th style="padding:3px 6px;text-align:left;color:var(--tm)">단계</th><th style="padding:3px 6px;text-align:left;color:var(--tm)">상태</th></tr></thead>'+
      '<tbody>'+stageRows+'</tbody></table></div>';
  }
  setTimeout(_es2Build, 200);
  