/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 13 id=(none) :: OPT01 no semantic edits */

  (function(){
    try{
      var rows=typeof WORK_DATA!=='undefined'?WORK_DATA:[];
      if(!rows.length)return;
      var sample=rows[0];
      var fields=Object.keys(sample);
      // 업로드 감지
      var upEl=document.getElementById('fm2-b-upload');var upVal=document.getElementById('fm2-upload-val');
      if(upEl)upEl.className='di-map-block ok';if(upVal)upVal.textContent='감지됨';upVal&&(upVal.style.color='var(--gr)');
      var shEl=document.getElementById('fm2-b-sheet');var shVal=document.getElementById('fm2-sheet-val');
      if(shEl)shEl.className='di-map-block ok';if(shVal)shVal.textContent='1개+';shVal&&(shVal.style.color='var(--gr)');
      var fEl=document.getElementById('fm2-b-field');var fVal=document.getElementById('fm2-field-val');
      if(fEl)fEl.className='di-map-block ok';if(fVal)fVal.textContent=fields.length+'개';fVal&&(fVal.style.color='var(--gr)');
      // 표준 필드 매핑
      var stdFields=[
        {std:'일자/날짜',candidates:['date','productionStart','startDate','시작일','날짜'],req:true},
        {std:'호기/장비',candidates:['machine','machineNo','호기','장비'],req:true},
        {std:'모델',candidates:['model','MODEL','모델','modelType','종류'],req:true},
        {std:'공정/단계',candidates:['process','공정','status','상태'],req:false},
        {std:'출고 예정',candidates:['ship','출고','shipDate'],req:false},
        {std:'해체',candidates:['disassembly','해체'],req:false},
        {std:'담당/팀',candidates:['manager','담당','team','팀'],req:false}
      ];
      var tbody=document.getElementById('fm2-field-tbody');
      if(tbody){
        tbody.innerHTML=stdFields.map(function(sf){
          var found=sf.candidates.find(function(c){return fields.some(function(f){return f.toLowerCase()===c.toLowerCase()||f.includes(c);});});
          var status=found?'ok':sf.req?'err':'warn';
          var statusTxt=found?'매핑됨':sf.req?'미매핑(필수)':'미매핑';
          return '<tr><td>'+sf.std+'</td><td>'+(found||'-')+'</td>'
            +'<td style="text-align:center">'+(sf.req?'<span style="color:var(--rd)">필수</span>':'선택')+'</td>'
            +'<td><span class="di-badge '+status+'">'+statusTxt+'</span></td></tr>';
        }).join('');
      }
      // 미매핑 패널
      var updateUnmap=function(id, candidates){
        var found=candidates.find(function(c){return fields.some(function(f){return f.toLowerCase()===c.toLowerCase()||f.includes(c);});});
        var el=document.getElementById(id);
        if(el){el.textContent=found?'✓ '+found:'미감지';el.style.color=found?'var(--gr)':'var(--am)';}
      };
      updateUnmap('fm2-u-date',['date','productionStart','startDate','날짜']);
      updateUnmap('fm2-u-equip',['machine','machineNo','호기','장비']);
      updateUnmap('fm2-u-model',['model','MODEL','모델','modelType']);
      updateUnmap('fm2-u-proc',['process','공정','status','상태']);
    }catch(err){}
  })();
  