/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 41 id=odi-08h-reviewed-fixed-prod-render-hooks :: OPT01 no semantic edits */

(function(){
  var VERSION='Q_REBUILD_08I_DATA_MANAGEMENT_PAGES_PURPOSE_REDESIGN';
  try{window.APP_VERSION=VERSION;}catch(e){}
  try{window.CHANGELOG=window.CHANGELOG||[];window.CHANGELOG.push({version:VERSION,note:'08H REVIEWED_FIXED: production management pages dynamic render hooks added for prod-overview, prod-headcount, prod-process; sidebar open and quality pages preserved.'});}catch(e){}
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function rows(){try{return Array.isArray(window.WORK_DATA)?window.WORK_DATA:[];}catch(e){return [];}}
  function txt(id,v){var el=document.getElementById(id);if(el)el.textContent=v;}
  function html(id,v){var el=document.getElementById(id);if(el)el.innerHTML=v;}
  function stage(row){
    var info=null;try{if(typeof window.getRowStageInfo==='function')info=window.getRowStageInfo(row);}catch(e){}
    var label=(info&&info.status)||row.status||row.상태||row.process||row.공정||'미확인';
    var date=(info&&info.date)||row.productionStart||row.startDate||row.date||row.일자||row.날짜||'';
    var key='unknown';
    if(/자재|입고|부자재|YBASE|3POD|WV|PZ|엘모/i.test(label))key='mat';
    else if(/생산|TEST|적층|작업|진행/i.test(label))key='work';
    else if(/출고/i.test(label))key='ship';
    else if(/해체|완료/i.test(label))key='done';
    return {key:key,label:label,date:String(date||'').slice(0,10)};
  }
  function delayed(row){try{return typeof window.hasScheduleDelay==='function'&&window.hasScheduleDelay(row);}catch(e){return false;}}
  function warnings(row){try{return typeof window.validateRow==='function'?(window.validateRow(row)||[]):[];}catch(e){return [];}}
  function machine(row){return row.machine||row.machineNo||row.호기||row.장비||'미지정';}
  function model(row){return row.model||row.모델||row.type||row.기종||'-';}
  function isSunday(ds){var m=String(ds||'').match(/^(d{4})-(d{2})-(d{2})/);if(!m)return false;return new Date(Date.UTC(+m[1],+m[2]-1,+m[3])).getUTCDay()===0;}
  window.renderUserProdOverviewPage=function(){
    try{
      var rs=rows(), delay=0, ship=0, uk=0, nodate=0, today=0, stageC={mat:0,work:0,ship:0,done:0}, stageD={mat:0,work:0,ship:0,done:0}, pri=[];
      rs.forEach(function(r){var st=stage(r), d=delayed(r), w=warnings(r), reason=''; if(d){delay++;reason='지연 사유 존재';} if(st.key==='ship'||st.key==='done')ship++; if(st.key==='unknown')uk++; if(!st.date){nodate++; if(!reason)reason='날짜 누락';} if(isSunday(st.date)){if(!reason)reason='일요일 일정 원본 확인 필요';}
        if(st.key!=='unknown')stageC[st.key]++; if(d&&st.key!=='unknown')stageD[st.key]++;
        if(d||st.key==='ship'||st.key==='done'||st.key==='unknown'||!st.date||w.length){today++; pri.push({r:r,st:st,reason:reason||((st.key==='ship'||st.key==='done')?'출고/해체 임박':'검증 경고'),score:(d?5:0)+(st.key==='ship'?4:0)+(st.key==='done'?3:0)+(st.key==='unknown'?2:0)+(!st.date?2:0)+w.length});}
      });
      txt('po-f-today',today);txt('po-f-delay',delay);txt('po-f-ship',ship);txt('po-f-uk',uk);txt('po-f-nodate',nodate);
      ['mat','work','ship','done'].forEach(function(k){txt('po-s-'+k,stageC[k]);txt('po-s-'+k+'-d',stageD[k]?('지연 '+stageD[k]+'건'):'정상');});
      pri.sort(function(a,b){return b.score-a.score;});
      if(!rs.length){html('po-priority-list','<div style="padding:18px;text-align:center;background:var(--sf);border:1px solid var(--bd);border-radius:7px;color:var(--tm);font-size:10px">생산일정 업로드 후 우선 확인 대상이 표시됩니다.<br><button data-navto="schedule" onclick="nav(this.dataset.navto)" style="margin-top:8px;padding:3px 10px;border-radius:5px;border:1px solid var(--ac);background:rgba(88,166,255,.12);color:var(--ac);font-size:10px;cursor:pointer">생산일정 관리 →</button></div>');return;}
      html('po-priority-list', pri.slice(0,12).map(function(x,i){return '<div class="po-priority-item '+(x.score>=5?'urgent':(x.score>=3?'warn':''))+'"><div class="po-priority-rank">'+(i+1)+'</div><div><strong>'+esc(machine(x.r))+'</strong><br><span>'+esc(model(x.r))+'</span></div><div><div style="color:var(--tp);font-weight:700">'+esc(x.st.label)+'</div><div style="color:var(--tm);font-size:9.5px">다음 예정일: '+esc(x.st.date||'-')+' · '+esc(x.reason)+'</div></div><button data-navto="schedule" onclick="nav(this.dataset.navto)" style="border:1px solid var(--bd);background:var(--sf2);color:var(--ac);border-radius:5px;padding:3px 7px;font-size:9px;cursor:pointer">이동</button></div>';}).join('') || '<div style="padding:14px;text-align:center;color:var(--gr);background:var(--sf);border:1px solid var(--bd);border-radius:7px;font-size:10px">현재 우선 경고 대상이 없습니다.</div>');
    }catch(err){console.warn('[08H reviewed fixed] renderUserProdOverviewPage failed',err);}
  };
  window.renderUserProdHeadcountPage=function(){
    try{
      var rs=rows(); var hasTeam=rs.some(function(r){return r.manager||r.담당||r.team||r.팀;});
      html('ph-team-notice',hasTeam?'<span style="color:var(--gr)">✓ 팀/담당 필드 감지됨</span>':'⚠ 현재 생산일정 원본에 팀/담당 필드가 없어 <strong>공정 기준</strong>으로 입력 준비 목록을 표시합니다.');
      if(!rs.length){html('ph-matrix-body','<tr><td colspan="8" style="text-align:center;color:var(--tm);padding:16px">생산일정 업로드 후 입력 준비 목록이 표시됩니다.</td></tr>');html('ph-unconf-body','업로드 후 확인됩니다.');return;}
      var delay=0,noTeam=0,upcoming=0;
      var out=rs.slice(0,40).map(function(r){var st=stage(r), d=delayed(r); if(d)delay++; if(!r.manager&&!r.담당&&!r.team&&!r.팀)noTeam++; if(st.key==='ship')upcoming++; return '<tr><td>'+esc(st.date||'-')+'</td><td>'+esc(st.label)+'</td><td>'+esc(machine(r))+'</td><td>'+esc(String(model(r)).slice(0,18))+'</td><td style="text-align:center">-</td><td><input type="number" class="ph-dis-input" disabled placeholder="-" min="0"></td><td style="text-align:center;color:var(--tm)">-</td><td><span style="font-size:9px;padding:1px 5px;border-radius:4px;background:var(--bd);color:var(--tm)">미입력</span></td></tr>';}).join('');
      html('ph-matrix-body',out+(rs.length>40?'<tr><td colspan="8" style="text-align:center;color:var(--tm);padding:5px">+ '+(rs.length-40)+'건 더 있음</td></tr>':''));
      html('ph-unconf-body',(noTeam?'<div style="margin-bottom:4px">📌 팀/담당 미기재: <strong>'+noTeam+'건</strong></div>':'')+(delay?'<div style="margin-bottom:4px">⚠ 지연 영향: <strong>'+delay+'건</strong></div>':'')+(upcoming?'<div>📦 출고 임박 인원 미확인: <strong>'+upcoming+'건</strong></div>':'')+(!noTeam&&!delay&&!upcoming?'<span style="color:var(--gr)">✓ 현재 확인 필요 항목 없음</span>':''));
    }catch(err){console.warn('[08H reviewed fixed] renderUserProdHeadcountPage failed',err);}
  };
  window.renderUserProdProcessPage=function(){
    try{
      var rs=rows(), stageC={mat:0,work:0,ship:0,done:0}, stageD={mat:0,work:0,ship:0,done:0}, stageMach={mat:{},work:{},ship:{},done:{}}, mach={};
      rs.forEach(function(r){var m=machine(r), st=stage(r), d=delayed(r); if(!mach[m])mach[m]={mat:0,work:0,ship:0,done:0,delay:0,uk:0,model:model(r)}; if(st.key==='unknown')mach[m].uk++; else {stageC[st.key]++; mach[m][st.key]++; stageMach[st.key][m]=(stageMach[st.key][m]||0)+1; if(d)stageD[st.key]++;} if(d)mach[m].delay++;});
      ['mat','work','ship','done'].forEach(function(k){var top=Object.keys(stageMach[k]).sort(function(a,b){return stageMach[k][b]-stageMach[k][a];}).slice(0,3); txt('pp-'+k+'-cnt',stageC[k]); txt('pp-'+k+'-sub',top.length?'주요: '+top.join(', '):'데이터 없음'); txt('pp-'+k+'-delay',stageD[k]?'⚠ 지연 '+stageD[k]+'건':'');});
      var bott=Object.keys(mach).map(function(m){return {m:m,d:mach[m].delay,total:mach[m].mat+mach[m].work+mach[m].ship+mach[m].done,uk:mach[m].uk};}).filter(function(x){return x.d||x.uk;}).sort(function(a,b){return (b.d*3+b.uk)-(a.d*3+a.uk);}).slice(0,8);
      html('pp-bottleneck',bott.length?bott.map(function(x,i){return '<div class="pp-bottleneck-card"><div style="font-size:11px;font-weight:800;color:var(--tp)">'+(i+1)+'. '+esc(x.m)+'</div><div style="font-size:10px;color:var(--tm);margin-top:3px">지연 '+x.d+'건 · 미확인 '+x.uk+'건 · 연결 공정 '+x.total+'건</div><div style="font-size:9.5px;color:var(--am);margin-top:4px">확인 필요: 출고 영향 / 공정 대기 여부 점검</div></div>';}).join(''):'<div style="padding:14px;text-align:center;background:var(--sf);border:1px solid var(--bd);border-radius:7px;color:var(--tm);font-size:10px">현재 병목 후보가 없습니다.</div>');
      var rowsHtml=Object.keys(mach).slice(0,40).map(function(m){var x=mach[m];function cell(v){return '<td class="'+(v?'on':'')+'">'+(v?'●':'-')+'</td>';}return '<tr><td class="row-hdr">'+esc(m)+'</td>'+cell(x.mat)+cell(x.work)+cell(x.ship)+cell(x.done)+'<td style="color:'+(x.delay?'var(--rd)':'var(--tm)')+'">'+x.delay+'</td><td style="color:'+(x.uk?'var(--am)':'var(--tm)')+'">'+x.uk+'</td></tr>';}).join('');
      html('pp-matrix-body',rowsHtml||'<tr><td colspan="7" style="text-align:center;color:var(--tm);padding:14px">생산일정 업로드 후 호기 matrix가 표시됩니다.</td></tr>');
    }catch(err){console.warn('[08H reviewed fixed] renderUserProdProcessPage failed',err);}
  };
  function refresh(k){if(!k||k==='prod-overview')window.renderUserProdOverviewPage();if(!k||k==='prod-headcount')window.renderUserProdHeadcountPage();if(!k||k==='prod-process')window.renderUserProdProcessPage();}
  window.odi08hReviewedFixedRefreshProductionPages=function(){refresh();};
  try{
    var oldNav=window.nav;
    if(typeof oldNav==='function'&&!oldNav.__odi08hReviewedFixedWrapped){
      // [STEP02] nav-wrap neutralized; prod-overview/headcount/process refresh merged into odiNavAfterRenderDispatcher
      try { oldNav.__odi08hReviewedFixedWrapped=true; } catch(_e){}
    }
  }catch(e){}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){refresh();},450);});else setTimeout(function(){refresh();},450);
})();
