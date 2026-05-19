/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 15 id=(none) :: OPT01 no semantic edits */

    (function(){
      var vEl=document.getElementById('tv-version');
      if(vEl&&typeof APP_VERSION!=='undefined') vEl.textContent=APP_VERSION;
      function refreshTestDataStatus(){
        var s=document.getElementById('tv-sched');
        var q=document.getElementById('tv-quality');
        var img=document.getElementById('tv-images');
        if(s) s.textContent=(typeof scheduleData!=='undefined'&&scheduleData&&scheduleData.length?scheduleData.length+'건 로드':'업로드 전');
        if(q) q.textContent=(typeof QDEFECT_WORKBOOK_READY!=='undefined'&&QDEFECT_WORKBOOK_READY?'업로드 완료':'업로드 전');
        if(img) img.textContent=(typeof QDEFECT_IMAGES!=='undefined'?(QDEFECT_IMAGES.length+'장 (미매칭: '+(typeof QDEFECT_UNMATCHED_IMAGES!=='undefined'?QDEFECT_UNMATCHED_IMAGES.length:0)+')'):' —');
      }
      refreshTestDataStatus();
    })();
  