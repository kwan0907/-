(function(){
'use strict';
window.__SMARTBET_QBANK_LIVE_SOURCE__='20260916-qsrc1';
try{
  apiUrl=function(){
    var q=new URLSearchParams();
    if(state&&state.raceNo)q.set('raceNo',state.raceNo);
    if(state&&state.meeting&&state.meeting.date)q.set('date',state.meeting.date);
    if(state&&state.meeting&&state.meeting.venueCode)q.set('venueCode',state.meeting.venueCode);
    return '/api/racing?'+q.toString();
  };
  setTimeout(function(){try{loadData(true)}catch(e){}},50);
}catch(e){}
})();