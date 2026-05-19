/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 5 id=(none) :: OPT01 no semantic edits */

  function _slogRender() {
    try {
      var rows = typeof WORK_DATA !== 'undefined' ? WORK_DATA : [];
      var total = rows.length;
      var delay = rows.filter(function(r){ return typeof hasScheduleDelay==='function'&&hasScheduleDelay(r); }).length;
      var validWarn = 0, sunday = 0;
      rows.forEach(function(r){
        try{if(typeof validateRow==='function'&&validateRow(r).length>0)validWarn++;}catch(e){}
        var info = typeof getRowStageInfo==='function'?getRowStageInfo(r):null;
        if(info&&info.date){var d=new Date(info.date);if(!isNaN(d)&&d.getDay()===0)sunday++;}
      });
      var e; e=document.getElementById('slog-total');if(e)e.textContent=total||0;
      e=document.getElementById('slog-delay');if(e)e.textContent=delay||0;
      e=document.getElementById('slog-valid-warn');if(e)e.textContent=validWarn||0;
      e=document.getElementById('slog-sunday');if(e)e.textContent=sunday||0;
    } catch(err) {}
  }
  setTimeout(_slogRender, 200);
  