/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 18 id=(none) :: OPT01 no semantic edits */

        (function(){
          var tot=document.getElementById("qimg-kpi-total"),lnk=document.getElementById("qimg-kpi-linked"),unm=document.getElementById("qimg-kpi-unmatched");
          if(typeof QDEFECT_IMAGES!=="undefined"&&tot) tot.textContent=QDEFECT_IMAGES.length;
          if(typeof QDEFECT_IMAGES!=="undefined"&&lnk) lnk.textContent=QDEFECT_IMAGES.filter(function(i){return i.defectId;}).length;
          if(typeof QDEFECT_UNMATCHED_IMAGES!=="undefined"&&unm) unm.textContent=QDEFECT_UNMATCHED_IMAGES.length;
        })();
      