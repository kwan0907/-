(function(){
'use strict';
if(window.__SB_RACE_SPEED__)return;
window.__SB_RACE_SPEED__='20260916-rs1';
var seq=0,inflight=null,currentKey='',status=null;
function key(){var m=state.meeting||{};return[m.date||'',m.venueCode||'',Number(state.raceNo)||1].join(':')}
function notice(msg,kind){var sec=document.querySelector('#liveDashboard .qSpecHost');if(!sec)return;if(!status||!status.isConnected){status=document.createElement('div');status.id='qRaceSpeedStatus';status.setAttribute('role','status');status.style.cssText='background:#e9f2eb;color:#21523a;border-radius:8px;padding:8px 12px;margin:9px 10px 0;font:600 12px Arial,sans-serif';var p=sec.querySelector('.qSpec');sec.insertBefore(status,p||null)}status.textContent=msg||'';status.style.display=msg?'block':'none';status.style.background=kind==='error'?'#fff0eb':'#e9f2eb'}
function refreshSpectrum(){var p=document.querySelector('#liveDashboard .qSpecHost .qSpec');if(!p)return;var tab=p.querySelector('.qSpecTabs button.on');if(tab&&typeof tab.click==='function')tab.click()}
function emptyOld(){var d=document;[['topMoves','正在切換場次…'],['coldRank','正在更新 Q膽資料…'],['flowGrid','正在讀取新場數據…']].forEach(function(a){var el=d.getElementById(a[0]);if(el)el.textContent=a[1]});var strip=d.getElementById('poolStrip');if(strip)strip.textContent='';var fresh=d.getElementById('flowFreshness');if(fresh)fresh.textContent='讀取新場中'}
function quickSwitch(no){no=Number(no);if(!Number.isFinite(no)||no<1)return;if(no===Number(state.raceNo))return;
 seq++;if(inflight){inflight.controller.abort();inflight=null}
 state.raceNo=no;state.race=(state.races||[]).find(function(r){return Number(r.no)===no})||null;
 state.banker=null;state.legs.clear();state.singles.clear();state.odds={};state.pools={};state.snapshots=[];state.currentRows=[];
 try{renderMeeting();renderRaces();updateCountdown();renderHorseGrid();renderBetting()}catch(e){console.warn('race switch UI',e)}
 emptyOld();refreshSpectrum();notice('R'+no+' · 正在讀取最新賠率及跨池資金…');
 loadData(true);
}
var nativeLoad=loadData;
loadData=async function(manual){var requestKey=key(),mySeq=++seq;
 if(inflight&&inflight.key===requestKey)return inflight.promise;
 if(inflight){inflight.controller.abort();inflight=null}
 var ctrl=new AbortController();var button=document.getElementById('refreshBtn');if(manual&&button)button.disabled=true;
 var promise=(async function(){try{
   var response=await fetch(apiUrl(),{cache:'no-store',signal:ctrl.signal});var j=await response.json();
   if(!response.ok||!j.ok)throw new Error(j.error||'資料暫時無法讀取');
   if(ctrl.signal.aborted||mySeq!==seq||key()!==requestKey)return;
   var meeting=(j.raceMeetings||[]).find(function(m){var parts=requestKey.split(':');return m.date===parts[0]&&m.venueCode===parts[1]})||(j.raceMeetings||[])[0]||(j.activeMeetings||[])[0];
   if(!meeting)throw new Error('暫無賽事資料');
   state.meeting=meeting;state.races=meeting.races||[];
   state.race=state.races.find(function(r){return Number(r.no)===Number(state.raceNo)})||null;
   if(!state.race)throw new Error('暫無所選場次資料');
   state.odds=oddsMap(j.odds||[]);state.pools=poolMap(j.pools||[]);
   var time=document.getElementById('updatedAt');if(time)time.textContent=nowHK();setLive(true,'HKJC LIVE');
   renderMeeting();renderRaces();recordSnapshot();renderMoneyFlow();renderHorseGrid();renderBetting();updateCountdown();
   notice('');refreshSpectrum();
 }catch(e){if(ctrl.signal.aborted||mySeq!==seq||key()!==requestKey)return;setLive(false,'資料暫停');notice('R'+state.raceNo+' 資料暫時未能更新，稍後自動重試。','error');console.warn('race fetch',e)}finally{if(inflight&&inflight.controller===ctrl)inflight=null;if(button)button.disabled=false}})();
 inflight={key:requestKey,controller:ctrl,promise:promise};return promise;
};
var races=document.getElementById('raceChips');if(races){races.addEventListener('click',function(e){var b=e.target.closest('[data-race]');if(!b||!races.contains(b))return;var no=Number(b.getAttribute('data-race'));if(!no||no===Number(state.raceNo))return;e.preventDefault();e.stopImmediatePropagation();quickSwitch(no)},true)}
})();