(function(){
'use strict';
if(window.__SMARTBET_LAYOUT_V12__)return;window.__SMARTBET_LAYOUT_V12__='20260916-layout1';
var d=document;
function q(s){return d.querySelector(s)}
function byId(id){return d.getElementById(id)}
function style(){var s=d.createElement('style');s.textContent='\
.bottomnav{grid-template-columns:repeat(5,1fr)!important}\
.bottomnav [data-v="research"],.bottomnav [data-v="health"],.bottomnav [data-v="backtest"]{display:none!important}\
.dashgrid.heatOnly{grid-template-columns:1fr!important}\
.dashgrid.heatOnly>.card{grid-column:1/-1!important;width:100%!important;max-width:100%!important}\
#raceControl{margin-top:8px}\
';d.head.appendChild(s)}
function hideOddsDist(){var el=byId('oddsDist');if(!el)return;var card=el.closest('.card');if(!card)return;card.style.display='none';var g=card.parentElement;if(g&&g.classList.contains('dashgrid'))g.classList.add('heatOnly')}
function moveControlRoom(){var rc=byId('raceControl'),health=byId('health');if(!rc||!health||rc.parentElement===health)return;if(!byId('systemToolsHead')){var h=d.createElement('div');h.id='systemToolsHead';h.className='card';h.innerHTML='<div class="ey">SYSTEM STATUS</div><div class="title">系統狀態 / Research Lab</div><div class="sub">Race Day Control Room、Watchdog、Health 同研究工具集中喺「更多」入面。</div>';health.insertBefore(h,health.firstChild)}health.insertBefore(rc,health.children[1]||health.firstChild)}
function tidyBottom(){var b=byId('bottomNav');if(!b)return;['research','health','backtest'].forEach(function(v){var x=b.querySelector('[data-v="'+v+'"]');if(x)x.style.display='none'})}
function run(){hideOddsDist();moveControlRoom();tidyBottom()}
style();run();
var mo=new MutationObserver(function(){run()});mo.observe(d.documentElement,{childList:true,subtree:true});
setInterval(run,1500);
})();