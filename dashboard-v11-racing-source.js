(function(){
'use strict';
if(window.__SMARTBET_RACING_SOURCE_V11__)return;window.__SMARTBET_RACING_SOURCE_V11__='20260916-source1';
var nativeFetch=window.fetch.bind(window);
window.fetch=function(input,init){
  try{
    var raw=typeof input==='string'?input:(input&&input.url)||'';
    if(raw&&raw.indexOf('ajnunehxtiofcphdyhqn.supabase.co/functions/v1/smartbet-public-racing')!==-1){
      var u=new URL(raw,location.href);
      var next='/api/racing'+(u.search||'');
      return nativeFetch(next,init);
    }
  }catch(e){}
  return nativeFetch(input,init);
};
})();