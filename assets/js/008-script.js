/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 8 id=(none) :: OPT01 no semantic edits */

  (function(){
    try{
      var rows=typeof WORK_DATA!=='undefined'?WORK_DATA:[];
      var delay=0,ship=0,uk=0,nodate=0,today=0,priorityItems=[];
      var stageC={mat:0,work:0,ship:0,done:0};
      var stageD={mat:0,work:0,ship:0,done:0};
      rows.forEach(function(r){
        var info=typeof getRowStageInfo==='function'?getRowStageInfo(r):null;
        var s=info?info.status:'미확인';
        var d=typeof hasScheduleDelay==='function'&&hasScheduleDelay(r);
        var vw=[];try{if(typeof validateRow==='function')vw=validateRow(r);}catch(e){}
        if(d)delay++;
        if(/출고|해체|완료/.test(s))ship++;
        if(!info||info.status==='미확인')uk++;
        if(!info||!info.date)nodate++;
        if(d||/출고/.test(s)||vw.length>0){today++;
          priorityItems.push({r:r,reason:d?'지연':/출고/.test(s)?'출고 임박':'검증 경고',urgency:d?'urgent':vw.length>0?'warn':'',s:s});}
        var sk=null;
        if(/자재|입고/.test(s))sk='mat';else if(/진행|작업/.test(s))sk='work';else if(/출고/.test(s))sk='ship';else if(/완료|해체/.test(s))sk='done';
        if(sk){stageC[sk]++;if(d)stageD[sk]++;}
      });
      var e;
      e=document.getElementById('po-f-today');if(e)e.textContent=today;
      e=document.getElementById('po-f-delay');if(e)e.textContent=delay;
      e=document.getElementById('po-f-ship');if(e)e.textContent=ship;
      e=document.getElementById('po-f-uk');if(e)e.textContent=uk;
      e=document.getElementById('po-f-nodate');if(e)e.textContent=nodate;
      ['mat','work','ship','done'].forEach(function(sk){
        var ce=document.getElementById('po-s-'+sk);var de=document.getElementById('po-s-'+sk+'-d');
        if(ce)ce.textContent=stageC[sk];
        if(de)de.textContent=stageD[sk]>0?'⚠ 지연'+stageD[sk]:'';
      });
      var listEl=document.getElementById('po-priority-list');
      if(listEl&&priorityItems.length){
        priorityItems.sort(function(a,b){return a.urgency==='urgent'?-1:b.urgency==='urgent'?1:0;});
        listEl.innerHTML=priorityItems.slice(0,15).map(function(item,i){
          var r=item.r,m=r.machine||r.호기||'미지정',model=(r.model||r.모델||'-').slice(0,12);
          return '<div class="po-priority-item '+item.urgency+'">'
            +'<div class="po-priority-badge">'+(i+1)+'</div>'
            +'<div style="font-size:10px;font-weight:700;color:var(--ts)">'+m+'</div>'
            +'<div style="font-size:9px;color:var(--tm)">'+model+' · '+item.s+'<br><span style="color:var(--rd)">'+item.reason+'</span></div>'
            +'<button onclick="nav(\'schedule\')" style="font-size:9px;padding:2px 7px;border-radius:4px;border:1px solid var(--bd);background:var(--sf);color:var(--ts);cursor:pointer">→</button>'
            +'</div>';
        }).join('')+(priorityItems.length>15?'<div style="font-size:10px;color:var(--tm);padding:4px 8px">+ '+(priorityItems.length-15)+'건 더...</div>':'');
      }
    }catch(err){}
  })();
  