(function(){
'use strict';
if(window.__SMARTBET_QBANK_MOBILE_FIX__)return;window.__SMARTBET_QBANK_MOBILE_FIX__='20260916-mf3';
var style=document.createElement('style');
style.textContent=`
html,body{width:100%!important;max-width:100%!important;overflow-x:hidden!important;position:relative!important}
*,*:before,*:after{box-sizing:border-box!important;min-width:0}
body{margin:0!important}
.app-shell{width:100%!important;max-width:100%!important;margin:0 auto!important;padding-left:10px!important;padding-right:10px!important;overflow-x:hidden!important}
main,.live-panel,.history-panel,main>*,section,.hero-card,.control-card,.flow-card,.viz-panel,.visual-analytics,.visual-pools,.mode-switch,.topbar{width:100%!important;max-width:100%!important;min-width:0!important}
img,svg,canvas,table{max-width:100%}
section:has(#poolControl),.horse-picker-card,section:has(#budget),.summary-grid,.result-card,#lockedCard,.quickbet-card,.bottom-bar{display:none!important}
.heat.mainh1{background:#255f34!important;color:#d7efe2}.heat.mainh2{background:#57933b!important;color:#eef7e9}.heat.mainh3{background:#b4a83b!important;color:#fff8d0}.heat.mainh4{background:#cb6c35!important;color:#fff0df}
.heatmap-wrap{width:100%!important;max-width:100%!important;overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch!important;contain:inline-size!important}
.heatmap{width:max-content!important;min-width:560px!important;max-width:none!important}
@media(max-width:700px){
  .app-shell{padding:0 8px 28px!important}
  .topbar{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:8px!important;padding:10px 2px!important;align-items:center!important}
  .brand-wrap{gap:8px!important;min-width:0!important}.brand-mark{width:38px!important;height:38px!important;border-radius:12px!important;font-size:20px!important;flex:0 0 38px!important}
  .topbar h1{font-size:20px!important;white-space:nowrap!important}.topbar .tagline,.eyebrow{font-size:8px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  .live-badge{padding:6px 7px!important;font-size:9px!important;white-space:nowrap!important}
  .mode-switch{top:58px!important;grid-template-columns:1fr 1fr!important}.mode-switch button{padding:9px 5px!important;font-size:10px!important}
  .hero-main{padding:13px!important}.meeting-visual{grid-template-columns:minmax(0,1fr)!important;gap:8px!important}.meeting-title{font-size:18px!important;overflow-wrap:anywhere!important}.race-meta-big{font-size:10px!important}.race-time-panel{text-align:left!important}.race-time-panel strong{font-size:25px!important}
  .dashboard-tools{display:grid!important;grid-template-columns:1fr 1fr!important;gap:5px!important}.dashboard-tools .pill-btn{padding:7px 6px!important;font-size:9px!important;text-align:center!important}
  .visual-pools{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important}.vpool{padding:10px 8px!important}.vpool .vhead{font-size:9px!important}.vpool strong{font-size:15px!important}.vpool small{font-size:8px!important;overflow-wrap:anywhere!important}
  .flow-card,.viz-panel,.control-card{padding:11px!important}
  .flow-filters{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:5px!important}.flow-filters button{font-size:9px!important;padding:8px 4px!important}
  .insight-row{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:5px!important}.insight-box{padding:8px 5px!important}.insight-box span{font-size:8px!important}.insight-box b{font-size:18px!important}
  .cold-rank-head{display:grid!important;grid-template-columns:1fr!important;gap:3px!important;align-items:start!important}.cold-rank-head>span{font-size:8px!important;line-height:1.35!important}
  .cold-rank-item{display:grid!important;grid-template-columns:24px minmax(0,1fr) 54px!important;gap:5px!important;padding:8px 6px!important;max-width:100%!important;overflow:hidden!important}
  .cold-rank-pos{grid-row:1/3!important}.cold-rank-horse{grid-column:2!important}.cold-rank-score{grid-column:3!important}.cold-rank-score:nth-of-type(2){grid-column:2/4!important;display:flex!important;justify-content:flex-start!important;gap:6px!important;text-align:left!important}.cold-rank-conf{display:none!important}
  .cold-rank-horse b{font-size:10px!important}.cold-rank-horse span{white-space:normal!important;font-size:7px!important;line-height:1.35!important}.cold-rank-score strong{font-size:14px!important}.cold-rank-score small{font-size:6px!important}
  .pool-strip{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:5px!important}.pool-stat{padding:8px 6px!important}.pool-stat strong{font-size:11px!important}
  .flow-axis-legend{grid-template-columns:1fr!important;gap:2px!important;text-align:left!important}.flow-axis-legend span:last-child{text-align:left!important}
  .mf-row{display:grid!important;grid-template-columns:26px minmax(0,1fr) 42px!important;gap:5px!important;padding:8px 2px!important;max-width:100%!important;overflow:hidden!important}
  .mf-no{grid-column:1!important;grid-row:1!important;font-size:13px!important}.mf-name{grid-column:2!important;grid-row:1!important;min-width:0!important}.mf-name b{font-size:10px!important}.mf-name span{font-size:7px!important;white-space:normal!important;line-height:1.25!important}.mf-value{grid-column:3!important;grid-row:1!important;font-size:12px!important}
  .mf-bar{grid-column:2/4!important;grid-row:2!important;width:100%!important;min-width:0!important}.mf-tags{grid-column:2/4!important;grid-row:3!important;min-width:0!important}.mf-tags span{font-size:7px!important}.mf-tags small{font-size:7px!important;white-space:normal!important}
  .visual-analytics{grid-template-columns:1fr!important;gap:8px!important}.move-row{grid-template-columns:25px minmax(0,1fr) 54px!important;gap:5px!important}.tiny-bars{display:none!important}.move-tag{font-size:8px!important}.move-name b{font-size:10px!important}.move-name small{font-size:7px!important}
  .viz-title{gap:6px!important}.viz-title b{font-size:12px!important}.viz-title small{font-size:8px!important;text-align:right!important}
  .heatmap-tools{display:flex!important;overflow-x:auto!important;flex-wrap:nowrap!important;max-width:100%!important;padding-bottom:5px!important}.heatmap-tools button{white-space:nowrap!important;flex:0 0 auto!important;font-size:9px!important;padding:6px 8px!important}.heatmap-key{display:none!important}
  .heatmap-wrap{width:100%!important;max-width:100%!important;overflow-x:auto!important;overscroll-behavior-inline:contain!important}
  .heatmap{min-width:540px!important}.heatmap-note{font-size:8px!important;line-height:1.4!important;overflow-wrap:anywhere!important}
  .source-note{font-size:8px!important;line-height:1.4!important;padding:9px 11px!important}
  .history-controls{grid-template-columns:1fr!important}.history-controls button{padding:10px!important}.history-hero{grid-template-columns:1fr!important}.history-badge{justify-self:start!important}
}
@media(max-width:390px){
  .app-shell{padding-left:6px!important;padding-right:6px!important}
  .topbar h1{font-size:18px!important}.brand-mark{width:34px!important;height:34px!important;flex-basis:34px!important}
  .cold-rank-item{grid-template-columns:22px minmax(0,1fr) 48px!important}.mf-row{grid-template-columns:24px minmax(0,1fr) 38px!important}
  .heatmap{min-width:500px!important}
}
`;
document.head.appendChild(style);

try{apiUrl=function(){var q=new URLSearchParams();if(state.raceNo)q.set('raceNo',state.raceNo);if(state.meeting&&state.meeting.date)q.set('date',state.meeting.date);if(state.meeting&&state.meeting.venueCode)q.set('venueCode',state.meeting.venueCode);return 'https://ajnunehxtiofcphdyhqn.supabase.co/functions/v1/smartbet-public-racing?'+q.toString();};}catch(e){}
function legacyMedian(a){a=a.slice().sort(function(x,y){return x-y});return a.length?a[Math.floor(a.length/2)]:0;}
function legacyZMap(o){var a=[],k,m,d,z={},ds=[],i;for(k in o)if(Object.prototype.hasOwnProperty.call(o,k))a.push(o[k]);m=legacyMedian(a);for(i=0;i<a.length;i++)ds.push(Math.abs(a[i]-m));d=legacyMedian(ds)||.12;for(k in o)if(Object.prototype.hasOwnProperty.call(o,k))z[k]=Math.max(-3.5,Math.min(3.5,(o[k]-m)/(1.4826*d)));return z;}
function mainHeatRows(){var w=singlePoolShares('WIN'),p=singlePoolShares('PLA'),q=pairPoolShares('QIN'),qp=pairPoolShares('QPL'),ord=[],k,i,rk={},ep={},eq={},eqp={};for(k in w)if(Object.prototype.hasOwnProperty.call(w,k))ord.push(Number(k));ord.sort(function(a,b){return w[b]-w[a]});for(i=0;i<ord.length;i++)rk[ord[i]]=i+1;for(i=0;i<ord.length;i++){k=ord[i];ep[k]=p[k]&&w[k]?Math.log((p[k]+.004)/(w[k]+.004)):0;eq[k]=q[k]&&w[k]?Math.log((q[k]+.004)/(w[k]+.004)):0;eqp[k]=qp[k]&&w[k]?Math.log((qp[k]+.004)/(w[k]+.004)):0;}var zp=legacyZMap(ep),zq=legacyZMap(eq),zqp=legacyZMap(eqp),out=[];activeRunners().forEach(function(r){var n=runnerNo(r),base=.22*(zp[n]||0)+.30*(zq[n]||0)+.38*(zqp[n]||0);var e=Math.exp(2*(base/1.65)),idx=Math.round(100*((e-1)/(e+1)));out.push({n:n,rank:rk[n]||99,wo:oddsFor('WIN',String(n)),zp:zp[n]||0,zq:zq[n]||0,zqp:zqp[n]||0,idx:idx});});return out;}
function mainClass(v){v=Number(v)||0;if(v>=1.3)return'mainh4';if(v>=.55)return'mainh3';if(v>=-.1)return'mainh2';if(v>=-.8)return'mainh1';return'';}
function syncHeat(){var el=document.getElementById('heatmap');if(!el||!state.race)return;var mainRows=mainHeatRows(),mainBy={};mainRows.forEach(function(x){mainBy[x.n]=x;});var advanced={};try{flowMetrics().rows.forEach(function(x){advanced[x.no]=x;});}catch(e){}var nos=mainRows.map(function(x){return x.n;});function oddsNum(n){return Number(mainBy[n]&&mainBy[n].wo)||999;}if(state.heatSort==='oddsDesc')nos.sort(function(a,b){return oddsNum(b)-oddsNum(a);});else if(state.heatSort==='qbank')nos.sort(function(a,b){return ((advanced[b]&&advanced[b].qBankScore)||0)-((advanced[a]&&advanced[a].qBankScore)||0);});else nos.sort(function(a,b){return oddsNum(a)-oddsNum(b);});if(state.heatColdOnly)nos=nos.filter(function(n){var x=advanced[n];return x&&x.rank>4&&x.zQ>=.45&&(x.zQP>=.35||x.zP>=.45);});var cols=Math.max(1,nos.length);el.style.gridTemplateColumns='52px repeat('+cols+',minmax(42px,1fr))';function isQB(n){var x=advanced[n];return !!(x&&x.rank>4&&x.qBankScore>=62&&x.zQ>=.45);}var h='<div></div>'+nos.map(function(n){var x=mainBy[n],a=advanced[n];return '<div class="heat-head '+(isQB(n)?'qbank':'')+'">#'+n+'<small>W '+(x.wo==null?'—':x.wo)+(a?' · Q '+a.qBankScore:'')+'</small></div>';}).join('');['WIN','P','Q','QP'].forEach(function(k){h+='<div class="hlabel">'+k+'</div>';h+=nos.map(function(n){var x=mainBy[n],hv=k==='WIN'?(2.2-(x.rank-1)*.25):k==='P'?x.zp:k==='Q'?x.zq:x.zqp;return '<div class="heat '+mainClass(hv)+' '+(isQB(n)?'qbank':'')+'" title="'+k+' #'+n+' · '+hv.toFixed(2)+'"></div>';}).join('');});el.innerHTML=nos.length?h:'<div class="empty-mini" style="grid-column:1/-1">目前冇符合「WIN冷 / Q-QP熱」嘅馬。</div>';var note=document.querySelector('.heatmap-note');if(note)note.innerHTML='<b>主頁同一算法：</b> 熱度底色完全跟主頁；金框／Q膽分數只係額外分析。圖表本身可左右掃，但整個頁面唔會再左右走。';}
try{var oldRender=renderMoneyFlow;renderMoneyFlow=function(){oldRender();setTimeout(syncHeat,0);};}catch(e){}
var tools=document.getElementById('heatmapTools');if(tools)tools.addEventListener('click',function(){setTimeout(syncHeat,0);},false);
setTimeout(function(){syncHeat();try{loadData(true);}catch(e){}},120);
})();