(function(){
'use strict';
if(window.__SB_RACE_SPEED__)return;
window.__SB_RACE_SPEED__='20260916-rs3';
var sequence=0,pending=null,noticeEl=null;
function key(){var m=state.meeting||{};return [m.date||'',m.venueCode||'',Number(state.raceNo)||1].join(':')}
function notice(text,error){var host=document.querySelector('#liveDashboard .qSpecHost');if(!host)return;if(!noticeEl||!noticeEl.isConnected){noticeEl=document.createElement('div');noticeEl.id='qRaceSpeedStatus';noticeEl.setAttribute('role','status');noticeEl.style.cssText='background:#e9f2eb;color:#21523a;border-radius:8px;padding:8px 12px;margin:9px 10px 0;font:600 12px Arial,sans-serif';host.insertBefore(noticeEl,host.querySelector('.qSpec')||null)}noticeEl.textContent=text||'';noticeEl.style.display=text?'block':'none';noticeEl.style.background=error?'#fff0eb':'#e9f2eb'}
function refreshChart(){var host=document.querySelector('#liveDashboard .qSpecHost .qSpec');var active=host&&host.querySelector('.qSpecTabs button.on');if(active)active.click()}
function clearPrevious(){[['topMoves','正在切換場次…'],['coldRank','正在更新 Q膽資料…'],['flowGrid','正在讀取新場數據…']].forEach(function(a){var el=document.getElementById(a[0]);if(el)el.textContent=a[1]});var strip=document.getElementById('poolStrip');if(strip)strip.textContent='';var fresh=document.getElementById('flowFreshness');if(fresh)fresh.textContent='讀取新場中'}
function switchRace(no){no=Number(no);if(!Number.isInteger(no)||no<1||no===Number(state.raceNo))return;
 sequence++;if(pending){pending.controller.abort();pending=null}
 state.raceNo=no;state.race=(state.races||[]).find(function(r){return Number(r.no)===no})||null;
 state.banker=null;state.legs.clear();state.singles.clear();state.odds={};state.pools={};state.snapshots=[];state.currentRows=[];
 try{renderMeeting();renderRaces();updateCountdown();renderHorseGrid();renderBetting()}catch(e){console.warn('race switch display',e)}
 clearPrevious();notice('R'+no+' · 正在更新新場數據…');loadData(true)
}
loadData=async function(manual){var requestKey=key();
 if(pending&&pending.key===requestKey)return pending.promise;
 if(pending){pending.controller.abort();pending=null}
 var mySequence=++sequence,controller=new AbortController(),button=document.getElementById('refreshBtn');if(manual&&button)button.disabled=true;
 var promise=(async function(){try{
   var response=await fetch(apiUrl(),{cache:'no-store',signal:controller.signal}),data=await response.json();
   if(!response.ok||!data.ok)throw new Error(data.error||'賽事資料暫時不可用');
   if(controller.signal.aborted||mySequence!==sequence||key()!==requestKey)return;
   var parts=requestKey.split(':'),meeting=(data.raceMeetings||[]).find(function(m){return m.date===parts[0]&&m.venueCode===parts[1]})||(data.raceMeetings||[])[0]||(data.activeMeetings||[])[0];
   if(!meeting)throw new Error('暫無賽事資料');state.meeting=meeting;state.races=meeting.races||[];
   state.race=state.races.find(function(r){return Number(r.no)===Number(state.raceNo)})||null;
   if(!state.race)throw new Error('找不到所選場次');
   state.odds=oddsMap(data.odds||[]);state.pools=poolMap(data.pools||[]);
   var time=document.getElementById('updatedAt');if(time)time.textContent=nowHK();setLive(true,'HKJC LIVE');
   renderMeeting();renderRaces();recordSnapshot();renderMoneyFlow();renderHorseGrid();renderBetting();updateCountdown();notice('');refreshChart();
 }catch(e){if(controller.signal.aborted||mySequence!==sequence||key()!==requestKey)return;setLive(false,'資料暫停');notice('R'+state.raceNo+' 更新暫時失敗，稍後自動重試。',true);console.warn('race request',e)}finally{if(pending&&pending.controller===controller){pending=null;if(button)button.disabled=false}}})();
 pending={key:requestKey,controller:controller,promise:promise};return promise;
};
var chips=document.getElementById('raceChips');if(chips)chips.addEventListener('click',function(e){var b=e.target.closest('[data-race]');if(!b||!chips.contains(b))return;var no=Number(b.getAttribute('data-race'));if(!no||no===Number(state.raceNo))return;e.preventDefault();e.stopImmediatePropagation();switchRace(no)},true);
})();