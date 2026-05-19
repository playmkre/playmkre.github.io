/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 20 id=(none) :: OPT01 no semantic edits */

  (function(){
    try{
      var wData=typeof WORK_DATA!=='undefined'?WORK_DATA:[];
      var qRows=typeof QDEFECT_RAW_ROWS!=='undefined'?QDEFECT_RAW_ROWS:[];
      var validW=0;wData.forEach(function(r){try{if(typeof validateRow==='function'&&validateRow(r).length>0)validW++;}catch(e){}});
      var e;
      e=document.getElementById('dl2-sched-cnt');if(e)e.textContent=wData.length||'미업로드';
      e=document.getElementById('dl2-qual-cnt');if(e)e.textContent=qRows.length||'미업로드';
      e=document.getElementById('dl2-warn-cnt');if(e)e.textContent=validW;
      if(wData.length){
        var c=document.getElementById('dl2-card-sched');if(c)c.className='di-dl-card ready';
        var d=document.getElementById('dl2-sched-desc');if(d)d.textContent=wData.length+'건 로드됨';
        /* 버튼 텍스트는 renderM08Download(08M)가 설정 — 여기서는 card 상태만 변경 */
        var c2=document.getElementById('dl2-card-valid');if(c2)c2.className='di-dl-card ready';
        var d2=document.getElementById('dl2-valid-desc');if(d2)d2.textContent=validW?validW+'건 경고 포함':'경고 없음';
        var c3=document.getElementById('dl2-card-equip');if(c3)c3.className='di-dl-card ready';
      }
    }catch(err){}
  })();
  