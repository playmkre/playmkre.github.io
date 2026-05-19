/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 10 id=(none) :: OPT01 no semantic edits */

  (function(){
    try{
      var rows=typeof WORK_DATA!=='undefined'?WORK_DATA:[];
      var stageC={mat:0,work:0,ship:0,done:0},stageD={mat:0,work:0,ship:0,done:0};
      var stageMach={mat:{},work:{},ship:{},done:{}};
      var machMap={};
      rows.forEach(function(r){
        var m=r.machine||r.machineNo||r.호기||'미지정';
        var info=typeof getRowStageInfo==='function'?getRowStageInfo(r):null;
        var s=info?info.status:'미확인';
        var d=typeof hasScheduleDelay==='function'&&hasScheduleDelay(r);
        if(!machMap[m])machMap[m]={mat:0,work:0,ship:0,done:0,delay:0,uk:0};
        var sk=null;
        if(/자재|입고/.test(s))sk='mat';
        else if(/진행|작업/.test(s))sk='work';
        else if(/출고/.test(s))sk='ship';
        else if(/완료|해체/.test(s))sk='done';
        if(sk){
          stageC[sk]++;if(d)stageD[sk]++;
          stageMach[sk][m]=(stageMach[sk][m]||0)+1;
          machMap[m][sk]++;
        }else{machMap[m].uk++;}
        if(d)machMap[m].delay++;
      });
      var skNames={mat:'자재입고',work:'작업',ship:'출고',done:'해체'};
      ['mat','work','ship','done'].forEach(function(sk){
        var ce=document.getElementById('pp-'+sk+'-cnt');
        var se=document.getElementById('pp-'+sk+'-sub');
        var de=document.getElementById('pp-'+sk+'-delay');
        if(ce)ce.textContent=stageC[sk];
        var topM=Object.keys(stageMach[sk]).sort(function(a,b){return stageMach[sk][b]-stageMach[sk][a];}).slice(0,3);
        if(se)se.textContent=topM.length?'주요: '+topM.join(', '):'데이터 없음';
        if(de)de.textContent=stageD[sk]>0?'⚠ 지연 '+stageD[sk]+'건':'';
        if(stageC[sk]>0){
          var children={'mat':['cc-jaje','cc-ybase','cc-pod3','cc-wvpz','cc-elmo'],'work':['cc-prod','cc-test','cc-layer']};
          if(children[sk])children[sk].forEach(function(id){var el=document.getElementById(id);if(el)el.classList.add('active');});
        }
      });
      // 병목
      var bnEl=document.getElementById('pp-bottleneck');
      var bnItems=[];
      ['mat','work','ship','done'].forEach(function(sk){
        if(stageD[sk]>0){
          var topM=Object.keys(stageMach[sk]).sort(function(a,b){return stageMach[sk][b]-stageMach[sk][a];}).slice(0,2);
          bnItems.push({name:skNames[sk],delay:stageD[sk],machines:topM,urgency:stageD[sk]>3?'high':'mid'});
        }
      });
      if(bnEl&&bnItems.length){
        bnEl.innerHTML=bnItems.map(function(b,i){
          return '<div class="pp-bn-item '+b.urgency+'">'
            +'<div class="pp-bn-rank">'+(i+1)+'</div>'
            +'<div class="pp-bn-name">'+b.name+'</div>'
            +'<div class="pp-bn-info">지연 '+b.delay+'건 · 주요 호기: '+b.machines.join(', ')+'</div>'
            +'<div style="font-size:9px;color:'+(b.urgency==='high'?'var(--rd)':'var(--am)')+'">'+( b.urgency==='high'?'즉시 확인':'주의')+'</div></div>';
        }).join('');
      }
      // 호기 matrix
      var machKeys=Object.keys(machMap).sort();
      var tbody=document.getElementById('pp-matrix-body');
      if(tbody&&machKeys.length){
        tbody.innerHTML=machKeys.map(function(m){
          var d=machMap[m];
          var cell=function(cnt,cls){return cnt>0?'<span class="pp-cell '+cls+'">'+cnt+'</span>':'-';};
          return '<tr><td class="row-hdr">'+m+'</td>'
            +'<td>'+cell(d.mat,'mat')+'</td><td>'+cell(d.work,'work')+'</td>'
            +'<td>'+cell(d.ship,'ship')+'</td><td>'+cell(d.done,'done')+'</td>'
            +'<td>'+cell(d.delay,'delay')+'</td>'
            +'<td style="color:var(--tm);font-size:9px">'+d.uk+'</td></tr>';
        }).join('');
      }
    }catch(err){}
  })();
  