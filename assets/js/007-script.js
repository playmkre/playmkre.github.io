/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 7 id=(none) :: OPT01 no semantic edits */

  var _spSel = null;
  var _spBuckets = {};
  var _spBucketRows = {};
  function _spBuild() {
    try {
      var period = (document.getElementById('sp-period')||{}).value||'monthly';
      var delOnly = (document.getElementById('sp-delay-only')||{}).checked||false;
      var shipOnly = (document.getElementById('sp-ship-only')||{}).checked||false;
      _spBuckets = {}; _spBucketRows = {};
      var rows = typeof WORK_DATA !== 'undefined' ? WORK_DATA : [];
      rows.forEach(function(r) {
        var info = typeof getRowStageInfo==='function'?getRowStageInfo(r):null;
        var s = info?info.status:'미확인';
        var d = info&&info.date?String(info.date):'';
        if(!d||d.length<7) d = r.productionStart||r.startDate||r.date||'';
        if(!d||d.length<7) return;
        var key = d.slice(0,7);
        if(period==='weekly'){var dt=new Date(d.slice(0,10));if(!isNaN(dt)){var wk=Math.ceil(dt.getDate()/7);key=d.slice(0,7)+'-W'+wk;}}
        else if(period==='quarterly'){var m=parseInt(d.slice(5,7));key=d.slice(0,4)+'Q'+Math.ceil(m/3);}
        else if(period==='daily'){key=d.slice(0,10);}
        if(!_spBuckets[key]) _spBuckets[key]={mat:0,work:0,ship:0,done:0,delay:0,uk:0,total:0};
        if(!_spBucketRows[key]) _spBucketRows[key]=[];
        var delay=typeof hasScheduleDelay==='function'&&hasScheduleDelay(r);
        _spBuckets[key].total++;
        _spBucketRows[key].push(r);
        if(/자재|입고/.test(s)) _spBuckets[key].mat++;
        else if(/진행|작업/.test(s)) _spBuckets[key].work++;
        else if(/출고/.test(s)) _spBuckets[key].ship++;
        else if(/완료|해체/.test(s)) _spBuckets[key].done++;
        else _spBuckets[key].uk++;
        if(delay) _spBuckets[key].delay++;
      });
      var keys = Object.keys(_spBuckets).filter(function(k){
        var b=_spBuckets[k];
        if(delOnly&&!b.delay)return false;
        if(shipOnly&&b.ship+b.done===0)return false;
        return true;
      }).sort().slice(-36);
      var chartEl = document.getElementById('sp-chart');
      if(!chartEl) return;
      if(!keys.length) {
        chartEl.innerHTML='<div style="padding:24px;text-align:center;background:var(--sf);border:1px solid var(--bd);border-radius:8px;color:var(--tm);font-size:10px">생산일정 업로드 후 기간별 흐름이 표시됩니다.</div>';
        return;
      }
      var maxT = Math.max.apply(null, keys.map(function(k){return _spBuckets[k].total;}));
      chartEl.innerHTML = keys.map(function(k){
        var b=_spBuckets[k]; var t=b.total||1;
        var selCls=_spSel===k?' selected':'';
        var matW=Math.round(b.mat/t*100),wkW=Math.round(b.work/t*100),shW=Math.round(b.ship/t*100),dnW=Math.round(b.done/t*100),ukW=Math.round(b.uk/t*100);
        var barWidth = Math.max(20, Math.round(b.total/maxT*100));
        return '<div class="sp-bucket'+selCls+'" data-bkey="'+k+'" onclick="_spSelect(this.dataset.bkey)">'+
          '<div class="sp-bucket-label">'+k+'</div>'+
          '<div class="sp-bar-wrap" style="max-width:'+barWidth+'%">'+
          '<div class="sp-bar-seg sp-bar-mat" style="width:'+matW+'%"></div>'+
          '<div class="sp-bar-seg sp-bar-work" style="width:'+wkW+'%"></div>'+
          '<div class="sp-bar-seg sp-bar-ship" style="width:'+shW+'%"></div>'+
          '<div class="sp-bar-seg sp-bar-done" style="width:'+dnW+'%"></div>'+
          '<div class="sp-bar-seg sp-bar-uk" style="width:'+ukW+'%"></div>'+
          '</div>'+
          '<div class="sp-bucket-total">'+b.total+'</div>'+
          (b.delay>0?'<div style="font-size:9px;color:var(--rd)">⚠'+b.delay+'</div>':'')+
          '</div>';
      }).join('');
    } catch(err) {}
  }
  function _spSelect(k) {
    _spSel=k; _spBuild();
    var emptyEl=document.getElementById('sp-detail-empty');
    var contEl=document.getElementById('sp-detail-content');
    if(!emptyEl||!contEl)return;
    var brows=_spBucketRows[k]||[];
    if(!brows.length){emptyEl.style.display='block';contEl.style.display='none';return;}
    emptyEl.style.display='none'; contEl.style.display='block';
    var b=_spBuckets[k]||{};
    var models=[...new Set(brows.map(function(r){return r.model||r.모델||'미지정';}))];
    var machs=[...new Set(brows.map(function(r){return r.machine||r.호기||'미지정';}))];
    var delayRows=brows.filter(function(r){return typeof hasScheduleDelay==='function'&&hasScheduleDelay(r);});
    var shipRows=brows.filter(function(r){var info=typeof getRowStageInfo==='function'?getRowStageInfo(r):null;return info&&/출고|해체|완료/.test(info.status);});
    var miniRows=brows.slice(0,8).map(function(r){
      var info=typeof getRowStageInfo==='function'?getRowStageInfo(r):null;
      return '<tr><td>'+(r.batch||'-')+'</td><td>'+(r.machine||r.호기||'-')+'</td><td>'+(r.model||r.모델||'-')+'</td><td>'+(info?info.label:'미확인')+'</td></tr>';
    }).join('');
    contEl.innerHTML='<div style="font-size:11px;font-weight:700;color:var(--ts);margin-bottom:6px">'+k+'</div>'+
      '<div style="font-size:10px;color:var(--tm);margin-bottom:6px">총 '+brows.length+'건 · 주요 모델: '+models.slice(0,3).join(', ')+'</div>'+
      '<div style="font-size:10px;color:var(--tm);margin-bottom:8px">주요 호기: '+machs.slice(0,4).join(', ')+'</div>'+
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-bottom:8px">'+
      '<div style="text-align:center;font-size:9px"><div style="font-size:14px;font-weight:800;color:#0891b2">'+shipRows.length+'</div><div style="color:var(--tm)">출고/해체</div></div>'+
      '<div style="text-align:center;font-size:9px"><div style="font-size:14px;font-weight:800;color:var(--rd)">'+delayRows.length+'</div><div style="color:var(--tm)">지연</div></div>'+
      '<div style="text-align:center;font-size:9px"><div style="font-size:14px;font-weight:800;color:var(--ts)">'+brows.length+'</div><div style="color:var(--tm)">전체</div></div>'+
      '</div>'+
      '<div style="font-size:9px;color:var(--tm);margin-bottom:4px">일정 목록 (최대 8건)</div>'+
      '<div style="overflow-x:auto"><table class="mini-tbl"><thead><tr><th>차수</th><th>호기</th><th>모델</th><th>단계</th></tr></thead><tbody>'+miniRows+'</tbody></table></div>';
  }
  setTimeout(_spBuild, 200);
  