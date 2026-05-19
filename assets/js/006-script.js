/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 6 id=(none) :: OPT01 no semantic edits */

  var _smSel = null;
  var _smMap = {};
  function _smBuild() {
    try {
      var q = (document.getElementById('sm-search')||{}).value||'';
      var delOnly = (document.getElementById('sm-delay-only')||{}).checked||false;
      var shipOnly = (document.getElementById('sm-ship-only')||{}).checked||false;
      _smMap = {};
      (typeof WORK_DATA!=='undefined'?WORK_DATA:[]).forEach(function(r) {
        var m = r.model||r.MODEL||r.모델||r.modelName||r.modelCode||'모델 미기재';
        if(!_smMap[m]) _smMap[m] = {total:0,mat:0,work:0,ship:0,done:0,delay:0,rows:[]};
        var info = typeof getRowStageInfo==='function'?getRowStageInfo(r):null;
        var s = info?info.status:'미확인';
        _smMap[m].total++; _smMap[m].rows.push(r);
        if(/자재|입고/.test(s)) _smMap[m].mat++;
        else if(/진행|작업/.test(s)) _smMap[m].work++;
        else if(/출고/.test(s)) _smMap[m].ship++;
        else if(/완료|해체/.test(s)) _smMap[m].done++;
        if(typeof hasScheduleDelay==='function'&&hasScheduleDelay(r)) _smMap[m].delay++;
      });
      var keys = Object.keys(_smMap).filter(function(k){
        if(q && !k.toLowerCase().includes(q.toLowerCase())) return false;
        if(delOnly && !_smMap[k].delay) return false;
        if(shipOnly && _smMap[k].ship+_smMap[k].done===0) return false;
        return true;
      }).sort();
      var grid = document.getElementById('sm-cards-grid');
      var tbody = document.getElementById('sm-tbl-body');
      if(!keys.length) {
        if(grid) grid.innerHTML = '<div style="grid-column:1/-1;padding:20px;text-align:center;background:var(--sf);border:1px solid var(--bd);border-radius:8px;color:var(--tm);font-size:10px">조건에 맞는 모델이 없습니다.</div>';
        if(tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--tm);padding:12px">-</td></tr>';
        return;
      }
      // 카드 grid
      if(grid) {
        grid.innerHTML = keys.map(function(k){
          var d = _smMap[k]; var total = d.total||1;
          var selCls = _smSel===k?' selected':'';
          var matP=Math.round(d.mat/total*100),workP=Math.round(d.work/total*100),shipP=Math.round(d.ship/total*100),doneP=Math.round(d.done/total*100);
          return '<div class="sm-card'+selCls+'" data-mkey="'+k+'" onclick="_smSelect(this.dataset.mkey)">'+
            '<div class="sm-card-name" title="'+k+'">'+k+'</div>'+
            '<div class="sm-stage-bar">'+
            '<div class="sm-stage-seg sp-bar-mat" style="width:'+matP+'%;background:#c8a200" title="자재입고 '+d.mat+'"></div>'+
            '<div class="sm-stage-seg sp-bar-work" style="width:'+workP+'%" title="작업 '+d.work+'"></div>'+
            '<div class="sm-stage-seg sp-bar-ship" style="width:'+shipP+'%" title="출고 '+d.ship+'"></div>'+
            '<div class="sm-stage-seg sp-bar-done" style="width:'+doneP+'%" title="해체 '+d.done+'"></div>'+
            '</div>'+
            '<div style="font-size:9px;color:var(--tm)">'+d.total+'건'+
              (d.delay>0?' · <span style="color:var(--rd)">⚠ 지연'+d.delay+'</span>':'')+
              (d.ship>0?' · <span style="color:#0891b2">출고'+d.ship+'</span>':'')+
            '</div></div>';
        }).join('');
      }
      // 요약 표
      if(tbody) {
        tbody.innerHTML = keys.map(function(k){
          var d=_smMap[k];
          var sel=_smSel===k?' style="background:rgba(88,166,255,.08)"':'';
          return '<tr'+sel+' data-mkey="'+k+'" onclick="_smSelect(this.dataset.mkey)" style="cursor:pointer">'+
            '<td style="padding:3px 8px;border-bottom:1px solid var(--bd);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ts)" title="'+k+'">'+k+'</td>'+
            '<td style="padding:3px 8px;border-bottom:1px solid var(--bd);text-align:right;font-weight:700;color:var(--ts)">'+d.total+'</td>'+
            '<td style="padding:3px 8px;border-bottom:1px solid var(--bd);text-align:right;color:#c8a200">'+d.mat+'</td>'+
            '<td style="padding:3px 8px;border-bottom:1px solid var(--bd);text-align:right;color:#6BA8E8">'+d.work+'</td>'+
            '<td style="padding:3px 8px;border-bottom:1px solid var(--bd);text-align:right;color:#0891b2">'+d.ship+'</td>'+
            '<td style="padding:3px 8px;border-bottom:1px solid var(--bd);text-align:right;color:#16a34a">'+d.done+'</td>'+
            '<td style="padding:3px 8px;border-bottom:1px solid var(--bd);text-align:right;color:var(--rd)">'+d.delay+'</td></tr>';
        }).join('');
      }
    } catch(err) {}
  }
  function _smSelect(k) {
    _smSel = k;
    _smBuild();
    var emptyEl=document.getElementById('sm-detail-empty');
    var contEl=document.getElementById('sm-detail-content');
    if(!emptyEl||!contEl) return;
    var d=_smMap[k]; if(!d){emptyEl.style.display='block';contEl.style.display='none';return;}
    emptyEl.style.display='none'; contEl.style.display='block';
    var machines=[...new Set(d.rows.map(function(r){return r.machine||r.machineNo||r.호기||'미지정';}))];
    var delayRows=d.rows.filter(function(r){return typeof hasScheduleDelay==='function'&&hasScheduleDelay(r);});
    var miniRows=d.rows.slice(0,8).map(function(r){
      var info=typeof getRowStageInfo==='function'?getRowStageInfo(r):null;
      return '<tr><td>'+(r.batch||r.차수||'-')+'</td><td>'+(r.machine||r.호기||'-')+'</td><td>'+(info?info.label:'미확인')+'</td></tr>';
    }).join('');
    contEl.innerHTML='<div style="font-size:11px;font-weight:700;color:var(--ts);margin-bottom:6px">'+k+'</div>'+
      '<div style="font-size:10px;color:var(--tm);margin-bottom:6px">총 '+d.total+'건 · 연결 호기: '+machines.slice(0,4).join(', ')+(machines.length>4?'…':'')+'</div>'+
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:8px">'+
      '<div style="text-align:center;font-size:9px"><div style="font-size:14px;font-weight:800;color:#c8a200">'+d.mat+'</div><div style="color:var(--tm)">자재입고</div></div>'+
      '<div style="text-align:center;font-size:9px"><div style="font-size:14px;font-weight:800;color:#6BA8E8">'+d.work+'</div><div style="color:var(--tm)">작업</div></div>'+
      '<div style="text-align:center;font-size:9px"><div style="font-size:14px;font-weight:800;color:#0891b2">'+d.ship+'</div><div style="color:var(--tm)">출고</div></div>'+
      '<div style="text-align:center;font-size:9px"><div style="font-size:14px;font-weight:800;color:#16a34a">'+d.done+'</div><div style="color:var(--tm)">해체</div></div>'+
      '</div>'+
      (delayRows.length?'<div style="font-size:10px;color:var(--rd);margin-bottom:6px">⚠ 지연 '+delayRows.length+'건</div>':'')+
      '<div style="font-size:9px;color:var(--tm);margin-bottom:4px">최근 일정</div>'+
      '<div style="overflow-x:auto"><table class="mini-tbl"><thead><tr><th>차수</th><th>호기</th><th>단계</th></tr></thead><tbody>'+miniRows+'</tbody></table></div>';
  }
  setTimeout(_smBuild, 200);
  