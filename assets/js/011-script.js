/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 11 id=(none) :: OPT01 no semantic edits */

  (function(){
    try{
      var wData=typeof WORK_DATA!=='undefined'?WORK_DATA:[];
      var qRows=typeof QDEFECT_RAW_ROWS!=='undefined'?QDEFECT_RAW_ROWS:[];
      var imgs=typeof QDEFECT_IMAGES!=='undefined'?QDEFECT_IMAGES.length:0;
      var validW=0; wData.forEach(function(r){try{if(typeof validateRow==='function'&&validateRow(r).length>0)validW++;}catch(e){}});
      var machSet=new Set();wData.forEach(function(r){if(r.machine||r.호기)machSet.add(r.machine||r.호기);});
      var e;
      e=document.getElementById('uh2-sched-rows');if(e)e.textContent=wData.length||'미업로드';
      e=document.getElementById('uh2-qual-rows');if(e)e.textContent=qRows.length||'미업로드';
      e=document.getElementById('uh2-valid-warn');if(e)e.textContent=validW;
      e=document.getElementById('uh2-img-cnt');if(e)e.textContent=imgs+'장';
      // timeline
      var tlEl=document.getElementById('uh2-timeline');
      var events=[];
      if(wData.length>0) events.push({type:'upload',title:'생산일정 업로드 완료',desc:wData.length+'건 WORK_DATA 반영 · 호기 '+machSet.size+'개 감지'});
      if(validW>0) events.push({type:'warn',title:'검증 경고 발생',desc:validW+'건 경고 · 데이터 검증 탭 확인 권장'});
      if(qRows.length>0) events.push({type:'parse',title:'품질 파일 파싱 완료',desc:'Raw '+qRows.length+'건 반영'});
      if(events.length&&tlEl){
        tlEl.innerHTML=events.map(function(ev){
          return '<div class="di-tl-item '+ev.type+'"><div class="di-tl-type">'+ev.title+'</div><div class="di-tl-desc">'+ev.desc+'</div></div>';
        }).join('');
      }
      // linkage
      e=document.getElementById('uh2-link-sched');if(e)e.textContent=wData.length?wData.length+'건 로드':'미업로드';
      if(e&&wData.length)e.style.color='var(--gr)';
      e=document.getElementById('uh2-link-equip');if(e)e.textContent=machSet.size?machSet.size+'호기 감지':'-';
      e=document.getElementById('uh2-link-valid');if(e)e.textContent=validW>0?validW+'건 경고':'경고 없음';
      if(e&&!validW)e.style.color='var(--gr)';
      e=document.getElementById('uh2-link-qual');if(e)e.textContent=qRows.length?qRows.length+'건':'미업로드';
      if(e&&qRows.length)e.style.color='var(--gr)';
    }catch(err){}
  })();
  