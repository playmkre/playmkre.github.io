/* Extracted from ODI_USER_PORTAL_IMPL_Q_REBUILD_08U_TV_STATUS_BOARD_FULLSCREEN_AND_SLIDE_RELAYOUT (3)(2).html :: script block 37 id=v5-date-match-safe-patch :: OPT01 no semantic edits */

(function(){
  'use strict';
  function _pad2(n){ return String(n).padStart(2,'0'); }
  function _ymd(y,m,d){ return String(y).padStart(4,'0')+'-'+_pad2(m)+'-'+_pad2(d); }
  function _dateObjToYmd(d){
    if(!(d instanceof Date) || isNaN(d.getTime())) return '';
    return _ymd(d.getFullYear(), d.getMonth()+1, d.getDate());
  }
  function _excelSerialToYmd(n){
    n=Number(n);
    if(!isFinite(n) || n<40000 || n>70000) return '';
    var epoch=Date.UTC(1899,11,30);
    var dt=new Date(epoch + Math.floor(n)*86400000);
    return _ymd(dt.getUTCFullYear(), dt.getUTCMonth()+1, dt.getUTCDate());
  }
  function _strictScheduleDate(v){
    if(v===null || v===undefined || v==='') return '';
    if(v instanceof Date) return _dateObjToYmd(v);
    if(typeof v==='number') return _excelSerialToYmd(v);
    var s=String(v).trim();
    if(!s) return '';
    s=s.replace(/^'+/,'').replace(/^\x60+/,'');
    if(/^\d+(\.\d+)?$/.test(s)) return _excelSerialToYmd(Number(s));
    var m=s.match(/^(\d{4})[-.\/](\d{1,2})[-.\/](\d{1,2})$/);
    if(m) return _ymd(+m[1], +m[2], +m[3]);
    m=s.match(/^(\d{2})[-.\/](\d{1,2})[-.\/](\d{1,2})$/);
    if(m){ var yy=+m[1]; return _ymd(yy<50?2000+yy:1900+yy, +m[2], +m[3]); }
    m=s.match(/^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
    if(m) return _ymd(+m[1], +m[2], +m[3]);
    m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if(m){ var y=+m[3]; if(y<100) y=y<50?2000+y:1900+y; return _ymd(y,+m[1],+m[2]); }
    return '';
  }
  window.odiStrictScheduleDate = _strictScheduleDate;
  window.parseXlDate = _strictScheduleDate;
  try{
    if(typeof _GRP_SET!=='undefined' && _GRP_SET && typeof _GRP_SET.add==='function'){
      ['월','대수','월별출고대수','출고대수','합계','소계','월별','summary','count','qty'].forEach(function(k){ _GRP_SET.add(k); });
    }
  }catch(e){}
  function _isSunday(ds){
    var m=String(ds||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(!m) return false;
    return new Date(Date.UTC(+m[1], +m[2]-1, +m[3])).getUTCDay()===0;
  }
  function _weekendWarnFields(row){
    var out=[];
    try{
      var fields=(typeof schemaAllDateFields==='function') ? schemaAllDateFields() : [];
      fields.forEach(function(f){ if(row && row[f] && _isSunday(row[f])) out.push({field:f,date:row[f]}); });
    }catch(e){}
    return out;
  }
  var _oldValidate = (typeof window.validateRow==='function') ? window.validateRow : (typeof validateRow==='function' ? validateRow : null);
  if(_oldValidate){
    window.validateRow = function(row){
      var e=[];
      try{ e=_oldValidate(row)||[]; }catch(err){ e=[]; }
      _weekendWarnFields(row).forEach(function(x){ e.push('일요일 일정 감지: '+x.field+'('+x.date+') - 원본 날짜 확인 필요'); });
      return e;
    };
    try{ validateRow = window.validateRow; }catch(_e){}
  }
  var _oldGetErrorFields = (typeof window.getErrorFields==='function') ? window.getErrorFields : (typeof getErrorFields==='function' ? getErrorFields : null);
  if(_oldGetErrorFields){
    window.getErrorFields = function(row){
      var fs;
      try{ fs=_oldGetErrorFields(row); }catch(err){ fs=new Set(); }
      if(!(fs instanceof Set)) fs=new Set(fs||[]);
      _weekendWarnFields(row).forEach(function(x){ fs.add(x.field); });
      return fs;
    };
    try{ getErrorFields = window.getErrorFields; }catch(_e){}
  }
  window.odiScheduleDatePatchInfo = {
    version:'Q_REBUILD_08D_V5_DATE_MATCH_SAFE',
    rule:'Excel serial 40000~70000, full yyyy-mm-dd/yyyy.mm.dd/yy.mm.dd/mm-dd-yy only; bare small numbers and yyyy-mm summary strings are not dates.',
    summaryColumnsIgnored:['월','대수','월별출고대수','출고대수','합계'],
    sundayHandling:'do not auto-shift; flag as source-date warning'
  };
})();
