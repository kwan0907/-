(function(){
'use strict';
if(window.__SMARTBET_QBANK_MOBILE_FIX__)return;window.__SMARTBET_QBANK_MOBILE_FIX__='20260916-mf2';
var style=document.createElement('style');
style.textContent='html,body{width:100%;max-width:100%;overflow-x:hidden!important}*,*:before,*:after{box-sizing:border-box}.app-shell,main,.live-panel,.history-panel,.hero-card,.control-card,.flow-card,.viz-panel,.visual-analytics,.visual-pools{max-width:100%;min-width:0}.app-shell{width:100%;overflow-x:hidden}.heatmap-wrap{max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}.mf-row,.cold-rank-item{max-width:100%;min-width:0}section:has(#poolControl),.horse-picker-card,section:has(#budget),.summary-grid,.result-card,#lockedCard,.quickbet-card,.bottom-bar{display:none!important}.heat.mainh1{background:#255f34!important;color:#d7efe2}.heat.mainh2{background:#57933b!important;color:#eef7e9}.heat.mainh3{background:#b4a83b!important;color:#fff8d0}.heat.mainh4{background:#cb6c35!important;color:#fff0df}@media(max-width:700px){.topbar{padding-left:10px;padding-right:10px}.topbar h1{font-size:24px}.meeting-visual{grid-template-columns:1fr}.race-time-panel{text-align:left}.visual-pools{grid-template-columns:repeat(2,minmax(0,1fr))}.insight-row{grid-template-columns:repeat(2,minmax(0,1fr))}.visual-analytics{grid-template-columns:1fr}.flow-filters{grid-template-columns:repeat(2,minmax(0,1fr))}.mf-row{grid-template-columns:26px minmax(0,1fr) 70px 38px!important;gap:5px!important}.mf-bar{min-width:0}.mf-tags{grid-column:2/-1}.cold-rank-item{grid-template-columns:24px minmax(0,1fr) 48px 48px!important;gap:4px!important}.cold-rank-conf{display:none}.heatmap{min-width:620px!important}.heatmap-tools{overflow-x:auto;flex-wrap:nowrap;padding-bottom:4px}.heatmap-tools button{white-space:nowrap;flex:0 0 auto}.heatmap-key{display:none}.mode-switch{top:66px}.source-note{font-size:9px}.qbank-only-note{display:block}}';
document.head.appendChild(style);

// Use the exact same public racing endpoint as the main SmartBet dashboard.
try{apiUrl=function(){var q=new URLSearchParams();if(state.raceNo)q.set('raceNo',state.raceNo);if(state.meeting&&state.meeting.date)q.set('date',state.meeting.date);if(state.meeting&&state.meeting.venueCode)q.set('venueCode',state.meeting.venueCode);return 'https://ajnunehxtiofcphdyhqn.supabase.co/functions/v1/smartbet-public-racing?'+q.toString();};}catch(e){}

function legacyMedian(a){a=a.slice().sort(function(x,y){return x-y});return a.length?a[Math.floor(a.length/2)]:0;}
function legacyZMap(o){var a=[],k,m,d,z={},ds=[],i;for(k in o)if(Object.prototype.hasOwnProperty.call(o,k))a.push(o[k]);m=legacyMedian(a);for(i=0;i<a.length;i++)ds.push(Math.abs(a[i]-m));d=legacyMedian(ds)||.12;for(k in o)if(Object.prototype.hasOwnProperty.call(o,k))z[k]=Math.max(-3.5,Math.min(3.5,(o[k]-m)/(1.4826*d)));return z;}
function mainHeatRows(){
  var w=singlePoolShares('WIN'),p=singlePoolShares('PLA'),q=pairPoolShares('QIN'),qp=pairPoolShares('QPL'),ord=[],k,i,rk={},ep={},eq={},eqp={};
  for(k in w)if(Object.prototype.hasOwnProperty.call(w,k))ord.push(Number(k));ord.sort(function(a,b){return w[b]-w[a]});for(i=0;i<ord.length;i++)rk[ord[i]]=i+1;
  for(i=0;i<ord.length;i++){k=ord[i];ep[k]=p[k]&&w[k]?Math.log((p[k]+.004)/(w[k]+.004)):0;eq[k]=q[k]&&w[k]?Math.log((q[k]+.004)/(w[k]+.004)):0;eqp[k]=qp[k]&&w[k]?Math.log((qp[k]+.004)/(w[k]+.004)):0;}
  var zp=legacyZMap(ep),zq=legacyZMap(eq),zqp=legacyZMap(eqp),out=[];
  activeRunners().forEach(function(r){var n=runnerNo(r),base=.22*(zp[n]||0)+.30*(zq[n]||0)+.38*(zqp[n]||0);var e=Math.exp(2*(base/1.65)),idx=Math.round(100*((e-1)/(e+1)));out.push({n:n,rank:rk[n]||99,wo:oddsFor('WIN',String(n)),zp:zp[n]||0,zq:zq[n]||0,zqp:zqp[n]||0,idx:idx});});
  return out;
}
function mainClass(v){v=Number(v)||0;if(v>=1.3)return'mainh4';if(v>=.55)return'mainh3';if(v>=-.1)return'mainh2';if(v>=-.8)return'mainh1';return'';}
function syncHeat(){
  var el=document.getElementById('heatmap');if(!el||!state.race)return;
  var mainRows=mainHeatRows(),mainBy={};mainRows.forEach(function(x){mainBy[x.n]=x;});
  var advanced={};try{flowMetrics().rows.forEach(function(x){advanced[x.no]=x;});}catch(e){}
  var nos=mainRows.map(function(x){return x.n;});
  function oddsNum(n){return Number(mainBy[n]&&mainBy[n].wo)||999;}
  if(state.heatSort==='oddsDesc')nos.sort(function(a,b){return oddsNum(b)-oddsNum(a);});else if(state.heatSort==='qbank')nos.sort(function(a,b){return ((advanced[b]&&advanced[b].qBankScore)||0)-((advanced[a]&&advanced[a].qBankScore)||0);});else nos.sort(function(a,b){return oddsNum(a)-oddsNum(b);});
  if(state.heatColdOnly)nos=nos.filter(function(n){var x=advanced[n];return x&&x.rank>4&&x.zQ>=.45&&(x.zQP>=.35||x.zP>=.45);});
  var cols=Math.max(1,nos.length);el.style.gridTemplateColumns='52px repeat('+cols+',minmax(52px,1fr))';
  function isQB(n){var x=advanced[n];return !!(x&&x.rank>4&&x.qBankScore>=62&&x.zQ>=.45);}
  var h='<div></div>'+nos.map(function(n){var x=mainBy[n],a=advanced[n];return '<div class="heat-head '+(isQB(n)?'qbank':'')+'">#'+n+'<small>W '+(x.wo==null?'—':x.wo)+' · 人氣#'+x.rank+(a?' · Q膽 '+a.qBankScore:'')+'</small></div>';}).join('');
  ['WIN','P','Q','QP'].forEach(function(k){h+='<div class="hlabel">'+k+'</div>';h+=nos.map(function(n){var x=mainBy[n],hv=k==='WIN'?(2.2-(x.rank-1)*.25):k==='P'?x.zp:k==='Q'?x.zq:x.zqp;return '<div class="heat '+mainClass(hv)+' '+(isQB(n)?'qbank':'')+'" title="'+k+' #'+n+' · '+hv.toFixed(2)+'"></div>';}).join('');});
  el.innerHTML=nos.length?h:'<div class="empty-mini" style="grid-column:1/-1">目前冇符合「WIN冷 / Q-QP熱」嘅馬。</div>';
  var note=document.querySelector('.heatmap-note');if(note)note.innerHTML='<b>已統一主頁算法：</b> WIN／P／Q／QP 熱度顏色而家同主頁使用完全相同嘅支持份額、z-score 同分級。金框／Q膽分數只係額外分析層，唔會改變熱度底色。';
}
try{var oldRender=renderMoneyFlow;renderMoneyFlow=function(){oldRender();setTimeout(syncHeat,0);};}catch(e){}
var tools=document.getElementById('heatmapTools');if(tools)tools.addEventListener('click',function(){setTimeout(syncHeat,0);},false);
setTimeout(function(){syncHeat();try{loadData(true);}catch(e){}},120);
})();