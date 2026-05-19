/*
  ODI Store Reader - Read-only bridge for OPT09.
  Version: OPT09_READONLY_BRIDGE_DIAGNOSTIC_INSERT
  Rule: 사용자 포털은 관리자 데이터를 직접 쓰지 않는다. localStorage read/fallback/diagnostic만 허용한다.
*/
(function(){
  'use strict';
  var PREFIX = '[ODIStoreReader]';
  var VERSION = 'OPT09_READONLY_BRIDGE_DIAGNOSTIC_INSERT';
  var KEYS = Object.freeze({
    menuConfig: ['odi.v1.menuConfig', 'odi_menu_config'],
    pageStatus: ['odi.v1.pageStatus'],
    permissionMatrix: ['odi.v1.permissionMatrix'],
    featureFlags: ['odi.v1.featureFlags'],
    systemSettings: ['odi.v1.systemSettings'],
    dataReadiness: ['odi.v1.dataReadiness'],
    noticeCenter: ['odi.v1.noticeCenter'],
    auditLog: ['odi.v1.auditLog']
  });
  function hasOwn(obj, key){ return Object.prototype.hasOwnProperty.call(obj, key); }
  function safeJsonParse(raw, fallback){
    if (raw === null || raw === undefined || raw === '') return fallback;
    try { return JSON.parse(raw); }
    catch(e) { return fallback; }
  }
  function rawRead(key){
    try { return { ok:true, raw: window.localStorage.getItem(key), error:null }; }
    catch(e) { return { ok:false, raw:null, error:e && e.message ? e.message : String(e) }; }
  }
  function readFirst(keys, fallback){
    var errors = [];
    for (var i=0; i<keys.length; i++){
      var r = rawRead(keys[i]);
      if (!r.ok) { errors.push({ key:keys[i], error:r.error }); continue; }
      if (r.raw !== null && r.raw !== undefined && r.raw !== '') {
        var parsed = safeJsonParse(r.raw, fallback);
        var parseOk = parsed !== fallback || r.raw === JSON.stringify(fallback);
        return { found:true, key:keys[i], value:parsed, rawLength:String(r.raw).length, parseOk:parseOk, errors:errors };
      }
    }
    return { found:false, key:null, value:fallback, rawLength:0, parseOk:true, errors:errors };
  }
  function get(name, fallback){
    if (!hasOwn(KEYS, name)) return fallback;
    return readFirst(KEYS[name], fallback).value;
  }
  function getMeta(name, fallback){
    if (!hasOwn(KEYS, name)) return { found:false, key:null, value:fallback, rawLength:0, parseOk:true, errors:[] };
    return readFirst(KEYS[name], fallback);
  }
  function diagnostics(){
    var out = { version:VERSION, generatedAt:new Date().toISOString(), keys:{} };
    Object.keys(KEYS).forEach(function(name){
      var r = getMeta(name, null);
      out.keys[name] = {
        found: !!r.found,
        key: r.key,
        rawLength: r.rawLength || 0,
        parseOk: !!r.parseOk,
        readErrors: r.errors || []
      };
    });
    return out;
  }
  function listConfiguredKeys(){
    var flat = [];
    Object.keys(KEYS).forEach(function(name){
      KEYS[name].forEach(function(key){ flat.push({ name:name, key:key }); });
    });
    return flat;
  }
  function onStorage(handler){
    if (typeof handler !== 'function') return function(){};
    function listener(evt){
      var watched = listConfiguredKeys().some(function(item){ return item.key === evt.key; });
      if (watched) handler(evt, diagnostics());
    }
    window.addEventListener('storage', listener);
    return function(){ window.removeEventListener('storage', listener); };
  }
  window.ODIStoreReader = Object.freeze({
    VERSION: VERSION,
    PREFIX: PREFIX,
    KEYS: KEYS,
    get: get,
    getMeta: getMeta,
    diagnostics: diagnostics,
    listConfiguredKeys: listConfiguredKeys,
    onStorage: onStorage
  });
})();
