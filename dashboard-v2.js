(function(){
'use strict';
if(window.__SMARTBET_DASHBOARD_V2__)return;window.__SMARTBET_DASHBOARD_V2__='20260915-0038';
var d=document,$=function(id){return d.getElementById(id)};
var css=`
#homePools .pool{position:relative;overflow:hidden;padding:10px 9px;border-width:1px;box-shadow:inset 0 0 0 1px #ffffff05}
#homePools .pool:after{content:'';position:absolute;left:0;right:0;bottom:0;height:3px;opacity:.9}
#homePools .pool:nth-child(1){border-color:#237fd8;background:linear-gradient(145deg,#0a2340,#081710)}
#homePools .pool:nth-child(1):after{background:#3da2ff}
#homePools .pool:nth-child(1) small:first-child{color:#67b8ff}
#homePools .pool:nth-child(2){border-color:#278e51;background:linear-gradient(145deg,#0b2b1d,#081710)}
#homePools .pool:nth-child(2):after{background:#59e58f}
#homePools .pool:nth-child(2) small:first-child{color:#74eea1}
#homePools .pool:nth-child(3){border-color:#9b6a19;background:linear-gradient(145deg,#33250b,#081710)}
#homePools .pool:nth-child(3):after{background:#f1b43d}
#homePools .pool:nth-child(3) small:first-child{color:#ffc85b}
#homePools .pool:nth-child(4){border-color:#7441a3;background:linear-gradient(145deg,#251237,#081710)}
#homePools .pool:nth-child(4):after{background:#ba70ee}
#homePools .pool:nth-child(4) small:first-child{color:#ca8bf4}
#homePools .pool b{font-size:15px;line-height:1.15}
.bottomnav{box-shadow:0 -12px 30px #0009}
.bottomnav button{border-radius:12px;transition:.18s ease;min-height:46px}
.bottomnav button[data-v="bars"]{border:1px solid #244f3b;background:#092319}
.bottomnav button[data-v="bars"].on{background:linear-gradient(180deg,#173c2c,#0a2118);box-shadow:0 0 18px #52e3a02f;color:#86f5bd}
.bottomnav button.on{background:#0b2118}
.dashrow{grid-template-columns:32px minmax(0,1fr) 44px 62px!important;padding:6px 4px!important;gap:5px!important}
.dashrow b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rankpill{width:27px!important;height:27px!important;border-radius:50%!important;background:#103524!important}
.scorebar{height:5px!important}
.statuspill{font-size:6.5px!important;padding:4px 4px!important;white-space:nowrap}
#coldRank .dashrow{grid-template-columns:31px minmax(0,1fr) 46px!important}
.flowtag{display:inline-flex;align-items:center;gap:2px;margin-left:4px;padding:2px 5px;border-radius:99px;background:#0d2d20;border:1px solid #28513d;color:#83eeb7;font-size:7px;font-weight:900}
.heatlegend{display:flex;gap:5px;align-items:center;margin-top:7px;font-size:7px;color:#7f9e8d}.heatlegend i{width:16px;height:7px;border-radius:3px;display:inline-block}
.latehome{border-color:#3b594a;background:radial-gradient(circle at 88% 10%,#4d161b66 0,transparent 26%),linear-gradient(#0d2018,#081710)}
.latehead{display:flex;justify-content:space-between;gap:8px;align-items:center}.latebadge{font-size:7px;border:1px solid #65434a;color:#ffb2ba;background:#34131a;border-radius:99px;padding:5px 8px;font-weight:900}
.latelist{display:grid;gap:6px;margin-top:8px}.lateitem{display:grid;grid-template-columns:36px minmax(0,1fr) auto;gap:8px;align-items:center;background:#071710;border:1px solid #294739;border-radius:12px;padding:8px}
.latebubble{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;border:2px solid #fff;font-weight:950;font-size:12px;box-shadow:0 2px 10px #0008}.latebubble.red{background:#d41620}.latebubble.orange{background:#d97a18}.latebubble.white{background:#eef2ef;color:#132119}
.latename{font-weight:950;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.latemeta{font-size:8px;color:#8da796;margin-top:2px}.latepools{display:flex;gap:4px;flex-wrap:wrap;margin-top:4px}.latepool{font-size:7px;border-radius:99px;padding:2px 5px;background:#143326;color:#8ff3bd;font-weight:900}.latedelta{font-size:13px;font-weight:950;color:#72ebb0;text-align:right}.latedelta small{display:block;color:#789686;font-size:7px;font-weight:700}.lateempty{padding:10px 0;color:#8fa99a;font-size:10px}.latenote{margin-top:7px;font-size:7px;color:#6f897b;line-height:1.4}
.radarbarTitle{font-size:7px;color:#769282;margin-top:2px}
@media(max-width:520px){#homePools{grid-template-columns:1fr 1fr!important}.lateitem{grid-template-columns:34px minmax(0,1fr) 48px}.latedelta{font-size:12px}}
`;
var st=d.createElement('style');st.textContent=css;d.head.appendChild(st);
var home=$('home');if(!home)return;
var pools=$('homePools');
var late=d.createElement('div');late.id='homeLateFlow';late.className='card latehome';late.innerHTML='<div class="latehead"><div><div class="ey">0+ LATE FLOW</div><div class="title">開跑線後資金延續</div></div><span class="latebadge">延後資金更新</span></div><div id="lateHomeBody" class="lateempty">等待 T0 後 snapshot…</div><div class="latenote">0+ 代表開跑線後收到的延後資金更新／延續流入，不代表開跑後仍可投注。</div>';
if(pools&&pools.parentNode)pools.parentNode.insertBefore(late,pools.nextSibling);
var heat=$('heatmap');if(heat&&!$('heatLegend')){var lg=d.createElement('div');lg.id='heatLegend';lg.className='heatlegend';lg.innerHTML='<span>資金強度</span><i style="background:#123326"></i><span>低</span><i style="background:#57933b"></i><span>中</span><i style="background:#b4a83b"></i><span>高</span><i style="background:#cb6c35"></i><span>極高</span>';heat.parentNode.appendChild(lg)}
function parseMeeting(){var t=$('homeMeeting')?$('homeMeeting').textContent:'';var m=t.match(/^([A-Z]{2})\s+(\d{4}-\d{2}-\d{2})\s+·\s+R(\d+)/);return m?{venue:m[1],date:m[2],race:Number(m[3])}:null}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function sign(n){n=Number(n)||0;return(n>0?'+':'')+n}
function renderLate(j){var b=$('lateHomeBody');if(!b)return;if(!j||j.ok===false){b.className='lateempty';b.textContent='0+ 資料暫時未能更新。';return}if(!j.available){b.className='lateempty';b.textContent='未到 T0，或尚未收到開跑線後 snapshot。';return}var a=j.top||[];if(!a.length){b.className='lateempty';b.innerHTML='本場暫無明顯 0+ 延續資金'+(j.counts&&j.counts.fade?'；'+j.counts.fade+' 匹訊號開始回落':'')+'。';return}var h='<div class="latelist">';for(var i=0;i<a.length;i++){var x=a[i],cl=x.kind==='strong'?'red':'orange',p=(x.pools||[]).map(function(k){return '<span class="latepool">'+esc(k)+'↑</span>'}).join('');h+='<div class="lateitem"><div class="latebubble '+cl+'">'+esc(x.lateRank)+'</div><div><div class="latename">#'+esc(x.no)+' '+esc(x.name||'')+'</div><div class="latemeta">人氣#'+esc(x.rank)+' · SmartFlow '+sign(x.baseIdx)+' → '+sign(x.currentIdx)+' · 同步 '+esc(x.sync)+' 池</div><div class="latepools">'+p+'</div></div><div class="latedelta">'+sign(x.deltaIdx)+'<small>'+esc(j.durationMin)+'m</small></div></div>'}h+='</div>';if(j.fade&&j.fade.length){h+='<div class="latenote">回落：'+j.fade.map(function(x){return '#'+x.no}).join('、')+'</div>'}b.className='';b.innerHTML=h}
var lastKey='';function loadLate(force){var m=parseMeeting();if(!m)return;var key=m.date+'|'+m.venue+'|'+m.race;if(!force&&key===lastKey)return;lastKey=key;var u='https://ajnunehxtiofcphdyhqn.supabase.co/functions/v1/smartbet-lateflow-summary?date='+encodeURIComponent(m.date)+'&venueCode='+encodeURIComponent(m.venue)+'&raceNo='+m.race;fetch(u,{cache:'no-store'}).then(function(r){return r.json()}).then(renderLate).catch(function(){renderLate({ok:false})})}
function tagCold(){var root=$('coldRank');if(!root)return;var subs=root.querySelectorAll('.sub'),i,m;for(i=0;i<subs.length;i++){if(subs[i].querySelector('.flowtag'))continue;m=subs[i].textContent.match(/QP\s+([+-]?\d+(?:\.\d+)?)σ/);if(m&&Number(m[1])>.5){var s=d.createElement('span');s.className='flowtag';s.textContent='QP↑';subs[i].appendChild(s)}}}
if($('coldRank'))new MutationObserver(tagCold).observe($('coldRank'),{childList:true,subtree:true});
if($('homeMeeting'))new MutationObserver(function(){lastKey='';setTimeout(function(){loadLate(true)},150)}).observe($('homeMeeting'),{childList:true,characterData:true,subtree:true});
setTimeout(function(){loadLate(true);tagCold()},600);setInterval(function(){loadLate(true)},30000);
})();
