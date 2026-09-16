(function(){
'use strict';
if(window.__SB_GLOBAL_RACE_SYNC__)return;
window.__SB_GLOBAL_RACE_SYNC__='20260916-rs2';
var wanted=null,source='',syncing=false,frameSeen=new WeakSet(),scheduled=0;
var lastParentNo=0,lastParentAt=0,lastFrameNo=0,lastFrameAt=0;
function valid(v){var n=Number(v);return Number.isInteger(n)&&n>=1&&n<=12?n:null}
function selected(box){if(!box)return null;var b=box.querySelector('[data-race].on,[data-race].active,[data-race].selected,[data-race][aria-pressed="true"],[data-race][aria-current="true"]');return b?valid(b.getAttribute('data-race')):null}
function button(box,n){return box&&box.querySelector('[data-race="'+n+'"]')}
function frame(){return document.getElementById('qbankFrame')}
function info(f){if(!f||!f.getAttribute('src'))return null;try{var d=f.contentDocument,w=f.contentWindow;if(d&&w&&d.body&&d.location.origin===location.origin)return{d:d,w:w}}catch(e){}return null}
function stampHome(n){var box=document.getElementById('homeRaces');if(!box)return;box.querySelectorAll('[data-race]').forEach(function(b){b.classList.toggle('on',valid(b.getAttribute('data-race'))===n)})}
function syncParent(n){var box=document.getElementById('races'),b=button(box,n);if(!b)return false;if(selected(box)===n)return true;var title=document.getElementById('homeMeeting'),match=title&&title.textContent.match(/(?:^|\s)R(\d+)\s*$/);if(selected(box)===null&&match&&Number(match[1])===n)return true;if(lastParentNo===n&&Date.now()-lastParentAt<4000)return false;lastParentNo=n;lastParentAt=Date.now();b.click();return false}
function syncFrame(n){var f=info(frame());if(!f||!f.w.state)return false;var b=button(f.d.getElementById('raceChips'),n);if(!b)return false;var current=valid(f.w.state.raceNo);if(current===n)return true;if(lastFrameNo===n&&Date.now()-lastFrameAt<4000)return false;lastFrameNo=n;lastFrameAt=Date.now();b.click();return false}
function sync(){scheduled=0;if(syncing||!wanted)return;syncing=true;try{if(source==='frame'){syncParent(wanted);stampHome(wanted);syncFrame(wanted)}else{stampHome(wanted);syncFrame(wanted);syncParent(wanted)}}finally{syncing=false}}
function queue(n,from){n=valid(n);if(!n)return;if(n!==wanted){lastParentNo=0;lastFrameNo=0}wanted=n;source=from;if(!scheduled)scheduled=setTimeout(sync,0)}
function onParentClick(e){var b=e.target&&e.target.closest&&e.target.closest('#homeRaces [data-race],#races [data-race]');if(!b)return;queue(b.getAttribute('data-race'),'parent')}
function onFrameClick(e){var b=e.target&&e.target.closest&&e.target.closest('#raceChips [data-race]');if(!b)return;queue(b.getAttribute('data-race'),'frame')}
function explainMissing(f){var d=f.d,w=f.w,host=d.querySelector('#liveDashboard .qSpecHost .qSpec');if(!host)return;var empty=host.querySelector('.qSpecEmpty'),old=host.querySelector('.qRaceSnapshotExplanation');if(!empty||empty.textContent.indexOf('截止前快照')<0){if(old)old.remove();return}var s=w.state,m=s&&s.meeting,n=s&&valid(s.raceNo);if(!m||!n)return;var k=[m.date||'?',m.venueCode||'?',n].join(':'),six=null,raw=null,closed=null,archive=null;try{six=JSON.parse(w.localStorage.getItem('sb-qspec-six-v1:'+k)||'null');raw=JSON.parse(w.localStorage.getItem('sb-qspec-live-v2:'+k)||'null');closed=JSON.parse(w.localStorage.getItem('sb-qspec-closed-v1:'+k)||'null');archive=JSON.parse(w.localStorage.getItem('sb-qspec-archive-v2:'+k)||'null')}catch(e){}var validCount=Array.isArray(raw)?raw.filter(function(x){return x&&Number.isFinite(Number(x.t))&&x.rows&&x.pools&&Number.isFinite(Number(x.mtp))&&(!closed||closed.lastLiveT==null||!Number.isFinite(Number(closed.lastLiveT))||x.t<=closed.lastLiveT)}).length:0;var archived=Array.isArray(archive)?archive.length:0;var text=six&&six.nos&&six.nos.length===6?'這場已保存 T-5 六馬名單，但即場圖需要另一份獨立、可核實的停售前連續快照。':'這場沒有可用的停售前即場快照。';if(archived)text+=' 另有 '+archived+' 筆原始紀錄被封存，未經核實不能當作投注期間數據。';else if(validCount===0)text+=' 本機目前沒有符合顯示條件的紀錄；可能當時沒有開住此頁，或首次讀取時已停售。';text+=' 不會用最終賠率或派彩資料補畫。';if(!old){old=d.createElement('div');old.className='qRaceSnapshotExplanation';old.style.cssText='font:12px/1.5 Arial,sans-serif;color:#626e73;background:#f7f9fa;border:1px solid #dce4e7;padding:9px 12px;margin:9px 0;border-radius:6px';empty.after(old)}if(old.textContent!==text)old.textContent=text}
function attach(){var f=info(frame());if(f&&!frameSeen.has(f.d)){frameSeen.add(f.d);f.d.addEventListener('click',onFrameClick,true);if(wanted===null)wanted=selected(document.getElementById('races'))||selected(document.getElementById('homeRaces'));if(wanted)queue(wanted,'parent')}
if(!wanted){var current=selected(document.getElementById('races'))||selected(document.getElementById('homeRaces'));if(current){wanted=current;source='parent'}}
if(wanted){var parent=selected(document.getElementById('races')),child=f&&f.w.state&&valid(f.w.state.raceNo);if(parent!==wanted||f&&child!==wanted)sync()}if(f)explainMissing(f)}
document.addEventListener('click',onParentClick,true);
setInterval(attach,1100);
attach();
})();