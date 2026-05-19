/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 9 id=(none) :: OPT01 no semantic edits */

  (function(){
    try{
      var rows=typeof WORK_DATA!=='undefined'?WORK_DATA:[];
      var hasTeam=rows.some(function(r){return r.manager||r.담당||r.team||r.팀;});
      var noticeEl=document.getElementById('ph-team-notice');
      if(noticeEl)noticeEl.innerHTML=hasTeam
        ?'<span style="color:var(--gr)">✓ 팀/담당 필드 감지됨</span>'
        :'⚠ 원본에 팀/담당 필드가 없어 <strong>공정 기준</strong>으로 입력 준비 목록을 표시합니다.';
      if(!rows.length)return;
      var delay=0,noTeam=0,upcoming=0;
      var matRows=rows.slice(0,20).map(function(r){
        var info=typeof getRowStageInfo==='function'?getRowStageInfo(r):null;
        var s=info?info.status:'미확인';
        var d=typeof hasScheduleDelay==='function'&&hasScheduleDelay(r);
        if(d)delay++;
        if(!r.manager&&!r.담당&&!r.team&&!r.팀)noTeam++;
        if(/출고/.test(s))upcoming++;
        return '<tr><td>'+(r.productionStart||r.startDate||'-').toString().slice(0,10)+'</td>'
          +'<td>'+s+'</td><td>'+(r.machine||r.호기||'-')+'</td><td>'+(r.model||r.모델||'-').slice(0,10)+'</td>'
          +'<td style="text-align:center">-</td>'
          +'<td><input type="number" class="ph-dis-input" disabled placeholder="-" min="0"></td>'
          +'<td style="text-align:center;color:var(--tm)">-</td>'
          +'<td><span style="font-size:9px;padding:1px 5px;border-radius:4px;background:var(--bd);color:var(--tm)">미입력</span></td></tr>';
      }).join('');
      var tbody=document.getElementById('ph-matrix-body');
      if(tbody)tbody.innerHTML=matRows+(rows.length>20?'<tr><td colspan="8" style="text-align:center;color:var(--tm);padding:5px">+ '+(rows.length-20)+'건 더...</td></tr>':'');
      var unconfEl=document.getElementById('ph-unconf-body');
      if(unconfEl)unconfEl.innerHTML=
        (noTeam>0?'<div style="margin-bottom:4px">📌 팀/담당 미기재: <strong>'+noTeam+'건</strong></div>':'')+
        (delay>0?'<div style="margin-bottom:4px">⚠ 지연 영향: <strong>'+delay+'건</strong></div>':'')+
        (upcoming>0?'<div>📦 출고 임박 인원 미확인: <strong>'+upcoming+'건</strong></div>':'')+
        (!noTeam&&!delay&&!upcoming?'<span style="color:var(--gr)">✓ 현재 확인 필요 항목 없음</span>':'');
    }catch(err){}
  })();
  