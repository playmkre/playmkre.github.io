/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 12 id=(none) :: OPT01 no semantic edits */

  (function(){
    try{
      var rows=typeof WORK_DATA!=='undefined'?WORK_DATA:[];
      var totalW=0,errorC=0,sunC=0,nodateC=0,nostageC=0,noequipC=0,nomodelC=0,dupC=0;
      var issues=[];
      rows.forEach(function(r){
        var m=r.machine||r.호기||null;
        var md=r.model||r.모델||null;
        var info=typeof getRowStageInfo==='function'?getRowStageInfo(r):null;
        var vw=[]; try{if(typeof validateRow==='function')vw=validateRow(r);}catch(e){}
        totalW++;
        if(vw.length>0)errorC++;
        if(!m){noequipC++;issues.push({equip:'-',model:md||'-',type:'호기 누락',orig:'',action:'생산일정 원본 확인'});}
        if(!md){nomodelC++;issues.push({equip:m||'-',model:'-',type:'모델 누락',orig:'',action:'생산일정 원본 확인'});}
        if(!info||!info.date){nodateC++;}
        if(!info||!info.status||info.status==='미확인'){nostageC++;}
        // 일요일 확인
        if(info&&info.date){var dt=new Date(info.date);if(!isNaN(dt)&&dt.getDay()===0){sunC++;issues.push({equip:m||'-',model:md||'-',type:'일요일 일정',orig:info.date,action:'원본 날짜 확인 필요 (자동 보정 없음)'}); }}
        vw.forEach(function(w){issues.push({equip:m||'-',model:md||'-',type:'검증 경고',orig:String(w).slice(0,20),action:'원본 데이터 확인'});});
      });
      var e;
      e=document.getElementById('dv2-total');if(e)e.textContent=totalW;
      e=document.getElementById('dv2-error');if(e)e.textContent=errorC;
      e=document.getElementById('dv2-warn');if(e)e.textContent=errorC+sunC;
      e=document.getElementById('dv2-sunday');if(e)e.textContent=sunC;
      e=document.getElementById('dv2-nodate');if(e)e.textContent=nodateC;
      e=document.getElementById('dv2-nostage');if(e)e.textContent=nostageC;
      e=document.getElementById('dv2-c-date');if(e)e.textContent=nodateC;
      e=document.getElementById('dv2-c-sun');if(e)e.textContent=sunC;
      e=document.getElementById('dv2-c-equip');if(e)e.textContent=noequipC;
      e=document.getElementById('dv2-c-model');if(e)e.textContent=nomodelC;
      e=document.getElementById('dv2-c-stage');if(e)e.textContent=nostageC;
      e=document.getElementById('dv2-c-dup');if(e)e.textContent=dupC;
      var tbody=document.getElementById('dv2-tbody');
      if(tbody&&issues.length){
        tbody.innerHTML=issues.slice(0,30).map(function(i){
          var typeCls=i.type==='일요일 일정'?'warn':i.type.includes('누락')?'warn':'err';
          return '<tr><td>'+i.equip+'</td><td>'+i.model+'</td>'
            +'<td><span class="di-badge '+typeCls+'">'+i.type+'</span></td>'
            +'<td>'+i.orig+'</td><td style="font-size:9px;color:var(--tm)">'+i.action+'</td></tr>';
        }).join('');
      }else if(tbody&&rows.length&&!issues.length){
        tbody.innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--gr);padding:12px">✓ 검증 문제 없음</td></tr>';
      }
    }catch(err){}
  })();
  