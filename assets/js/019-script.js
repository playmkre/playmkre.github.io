/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 19 id=(none) :: OPT01 no semantic edits */

  (function(){
    try{
      var rows=typeof WORK_DATA!=='undefined'?WORK_DATA:[];
      var equipSet={},modelSet={};
      var missingEquip=0,missingModel=0;
      var machMap={};
      rows.forEach(function(r){
        var m=r.machine||r.machineNo||r.호기||null;
        var md=r.model||r.MODEL||r.모델||r.modelType||null;
        if(!m)missingEquip++;else{equipSet[m]=true;if(!machMap[m])machMap[m]={count:0,models:new Set(),processes:new Set()};machMap[m].count++;if(md)machMap[m].models.add(md);}
        if(!md)missingModel++;else modelSet[md]=true;
        var info=typeof getRowStageInfo==='function'?getRowStageInfo(r):null;
        var proc=info?info.status:'미확인';
        if(m&&machMap[m])machMap[m].processes.add(proc);
      });
      var equipKeys=Object.keys(machMap).sort();
      // 중복 후보 (유사 이름)
      var dupCand=equipKeys.filter(function(k,i){return equipKeys.some(function(k2,j){return i!==j&&k!==k2&&(k.toLowerCase().includes(k2.toLowerCase())||k2.toLowerCase().includes(k.toLowerCase()));});}).length;
      var e;
      e=document.getElementById('de2-total-equip');if(e)e.textContent=equipKeys.length;
      e=document.getElementById('de2-total-model');if(e)e.textContent=Object.keys(modelSet).length;
      e=document.getElementById('de2-missing-equip');if(e)e.textContent=missingEquip;
      e=document.getElementById('de2-missing-model');if(e)e.textContent=missingModel;
      e=document.getElementById('de2-dup-cand');if(e)e.textContent=dupCand;
      var tbody=document.getElementById('de2-master-tbody');
      if(tbody&&equipKeys.length){
        tbody.innerHTML=equipKeys.map(function(k){
          var d=machMap[k];
          var mds=[...d.models].slice(0,2).join(', ')+(d.models.size>2?'…':'');
          var procs=[...d.processes].slice(0,2).join(', ')+(d.processes.size>2?'…':'');
          var status=d.models.size===0||d.processes.size===0?'warn':'ok';
          return '<tr><td>'+k+'</td><td>'+(mds||'<span style="color:var(--am)">누락</span>')+'</td><td>'+d.count+'</td><td>'+(procs||'-')+'</td>'
            +'<td><span class="di-badge '+status+'">'+(status==='ok'?'정상':'확인 필요')+'</span></td></tr>';
        }).join('');
      }
      var normEl=document.getElementById('de2-norm-panel');
      if(normEl&&rows.length){
        var items=[];
        if(missingEquip>0)items.push('📌 호기 누락: <strong>'+missingEquip+'건</strong>');
        if(missingModel>0)items.push('📌 모델 누락: <strong>'+missingModel+'건</strong>');
        if(dupCand>0)items.push('🔍 중복 이름 후보: <strong>'+dupCand+'개</strong>');
        normEl.innerHTML=items.length?items.map(function(i){return '<div style="margin-bottom:5px">'+i+'</div>';}).join('')
          :'<span style="color:var(--gr)">✓ 정규화 필요 항목 없음</span>';
      }
    }catch(err){}
  })();
  