(function(){
'use strict';
if(window.__SMARTBET_QBANK_SPECTRUM__)return;
window.__SMARTBET_QBANK_SPECTRUM__='20260923-qs10';
var D=document,mode='wqqp',history=[],idx=-1,busy=false,loaded='',lastFetch=0,pending=null,closed=null,dataState='FALLBACK',historySyncedAt=0;
var TYPES=['WIN','PLA','QIN','QPL','FCT','TRI','FF'];
function number(x){if(x===null||x===undefined||x==='')return null;var v=Number(x);return Number.isFinite(v)?v:null}
function positive(x){var v=number(x);return v!==null&&v>0?v:null}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function format(v){return Math.round(Number(v)||0).toLocaleString('en-HK')}
function raceKey(){return [state&&state.meeting&&state.meeting.date||'?',state&&state.meeting&&state.meeting.venueCode||'?',state&&state.raceNo||1].join(':')}
function container(){
  var host=D.getElementById('qSpecTopHost');
  if(!host){
    host=D.createElement('section');
    host.id='qSpecTopHost';
    host.className='viz-panel qSpecHost qSpecTopHost';
    var race=D.getElementById('raceChips'),anchor=race&&race.closest('section');
    var live=D.getElementById('liveDashboard');
    if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(host,anchor.nextSibling);
    else if(live)live.insertBefore(host,live.firstChild);
    else return null;
  }
  var old=D.querySelector('.visual-analytics .qSpecHost');
  if(old&&old!==host)old.classList.remove('qSpecHost');
  var p=host.querySelector('.qSpec');
  if(!p){p=D.createElement('div');p.className='qSpec';host.appendChild(p)}
  return p
}
function styles(){if(D.getElementById('qSpecCss'))return;var s=D.createElement('style');s.id='qSpecCss';s.textContent=`
#liveDashboard .visual-analytics{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:16px!important;align-items:start!important}
#liveDashboard .visual-analytics>.viz-panel{grid-column:1/-1!important;width:100%!important;min-width:0!important;box-sizing:border-box!important}
.qSpecHost{background:#fff!important;color:#333!important;overflow:hidden!important}.qSpecTopHost{order:-10!important;margin:10px 0 14px!important;width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}.qSpecHost>.viz-title,.qSpecHost>#oddsHistogram,.qSpecHost>.hist-labels{display:none!important}
.qSpec{background:#fff;color:#303030;padding:12px 14px;font-family:Arial,'PingFang TC',sans-serif;min-width:0}.qSpecTitle,.qLiveTitle{text-align:center;color:#075da9;font-size:20px;margin:6px 0 12px}.qSpecSub,.qLiveMeta{text-align:center;color:#777;font-size:11px;margin:4px 0 9px}.qSpecScroll{overflow-x:auto;max-width:100%;-webkit-overflow-scrolling:touch}
.qSpecGrid{min-width:665px;border-top:1px solid #ccc;border-left:1px solid #ccc}.qSpecHead,.qSpecRow{display:grid;grid-template-columns:40px 46px 46px 1fr}.qSpecHead>div{height:24px;display:grid;place-items:center;border-right:1px solid #ddd;border-bottom:1px solid #ccc;font-size:11px}.qSpecScale{display:grid!important;grid-template-columns:repeat(18,1fr)!important}.qSpecScale span{display:grid;place-items:center;border-right:1px solid #eee}.qSpecNo,.qSpecPre,.qSpecWin{display:grid;place-items:center;min-height:29px;border-right:1px solid #ddd;border-bottom:1px solid #ddd;font-size:12px}.qSpecNo{font-weight:700}.qSpecBands{display:grid;grid-template-columns:repeat(18,1fr);grid-template-rows:repeat(3,7px);gap:2px;padding:3px 2px;border-right:1px solid #ddd;border-bottom:1px solid #ddd}.qSpecCell.g1{background:#ddd}.qSpecCell.g2{background:#cfe5c8}.qSpecCell.g3{background:#edaeae}.qSpecCell.g4{background:#ad3f00}.qSpecLegend,.qLiveLegend{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 0;font-size:11px;color:#555}.qSpecLegend i,.qLiveLegend i{display:inline-block;width:14px;height:10px;margin-right:3px;vertical-align:middle}.qSpecTabs{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}.qSpecTabs button{border:1px solid #888;background:#f4f4f4;color:#333;border-radius:4px;padding:8px 12px;font-size:13px}.qSpecTabs button.on{background:#e4efd9}.qSpecNote{font-size:10px;color:#777;line-height:1.45}.qSpecEmpty{padding:26px;text-align:center;color:#777;border:1px dashed #bbb}.qSpecStage{min-width:660px;display:grid;border-top:1px solid #ccc;border-left:1px solid #ccc}.qSpecStage>div{padding:5px;text-align:center;border-right:1px solid #ddd;border-bottom:1px solid #ddd;font-size:10px}.qSpecStage .h{font-weight:700;background:#fafafa}
.qLiveChart{position:relative;min-width:740px;height:330px;border-left:1px solid #aaa;border-bottom:1px solid #aaa;padding:10px 8px 0;background:repeating-linear-gradient(to top,#fff 0,#fff 43px,#e7e7e7 44px);contain:layout paint}.qLiveBars{height:274px;display:flex;align-items:flex-end;gap:7px;position:relative}.qLiveCol{position:relative;flex:1;min-width:34px;text-align:center;height:100%;display:flex;flex-direction:column;justify-content:flex-end}.qLiveBar{position:relative;background:rgba(255,159,67,.26);border:1.5px solid #ff9c45;min-height:6px}.qLiveBar strong{position:absolute;left:0;right:0;bottom:5px;font-size:13px;color:#111}.qLiveAi{position:absolute;left:0;right:0;bottom:0;height:7px;background:#198d20}.qLiveNo{font-size:12px;font-weight:700;margin-top:5px}.qLiveOdds{font-size:11px;color:#444}.qLiveBubble{position:absolute;left:50%;transform:translateX(-50%);z-index:3;border:2px solid #111;background:#fff;color:#111;border-radius:999px;min-width:38px;height:33px;padding:0 4px;display:grid;place-items:center;font-weight:800;font-size:11px;white-space:nowrap;box-sizing:border-box}.qLiveBubble.red{background:#d50000;color:#fff}.qLiveTime{display:flex;align-items:center;gap:11px;margin:12px 0}.qLiveTime b{min-width:78px;text-align:center;background:#a53b00;color:#fff;padding:9px;font-size:13px}.qLiveTime button{border:0;width:36px;height:36px;border-radius:50%;background:#527582;color:#fff;font-size:22px}.qLiveTime input{width:min(480px,60vw);max-width:60vw}
.qLiveClosed{display:inline-block;background:#eff3ee;color:#356449;border:1px solid #9db9a5;border-radius:5px;padding:4px 8px;font-size:11px;margin:3px 0 8px}.qDataState{display:flex;justify-content:center;margin:2px 0 8px}.qDataState span{font-size:10px;font-weight:800;border-radius:999px;padding:4px 8px;border:1px solid #bbb;background:#f3f3f3;color:#666}.qDataState .ok{border-color:#70b88d;background:#e8f7ed;color:#257047}.qDataState .stale{border-color:#d2a657;background:#fff4d8;color:#8b5a00}.qDataState .fallback{border-color:#d78b8b;background:#fff0f0;color:#9b3434}
@media(max-width:700px){#liveDashboard .visual-analytics{gap:10px!important}.qSpec{padding:9px 5px}.qSpecTitle,.qLiveTitle{font-size:17px}.qSpecTabs button{font-size:11px;padding:6px 8px}.qSpecGrid{min-width:650px}.qLiveChart{height:284px}.qLiveBars{height:228px}.qLiveBubble{min-width:34px;height:30px;font-size:10px}.qLiveBar strong{font-size:10px}.qLiveTime input{max-width:37vw}}
`;D.head.appendChild(s)}
function currentCentralWinOdds(){
  var out={};
  try{activeRunners().forEach(function(r){var no=runnerNo(r),v=positive(oddsFor('WIN',String(no)));if(v)out[String(no)]=v})}catch(e){}
  return out
}
function applyCentralOdds(snapshot,map){
  map=map||currentCentralWinOdds();
  if(!snapshot||!snapshot.rows)return snapshot;
  Object.keys(snapshot.rows).forEach(function(k){
    var v=positive(map[String(k)]);
    if(v)snapshot.rows[k].winOdds=v;
  });
  return snapshot
}
function currentRunners(){var a=activeRunners().map(function(r){var no=runnerNo(r);return{no:no,win:positive(oddsFor('WIN',String(no)))}});return a.sort(function(a,b){return(a.win||Infinity)-(b.win||Infinity)||a.no-b.no})}
function snapshotAt(m){var best=null,dist=Infinity;(state.snapshots||[]).forEach(function(s){var v=number(s.minutesToPost);if(v===null)return;var d=Math.abs(v-m);if(d<dist){best=s;dist=d}});return dist<=.75?best:null}
function snapshotVal(no,pool,m,abnormal){var s=snapshotAt(m);if(!s||!s.shares||!s.shares[pool])return null;var v=number(s.shares[pool][no]);if(v===null)return null;if(!abnormal)return v*100;var b=number(s.expected&&s.expected[no]);if(b===null)b=number(s.shares.WIN&&s.shares.WIN[no]);return b>0?Math.max(0,(v/b-1)*100):null}
function band(v){return v===null?'':v>=30?'g4':v>=20?'g3':v>=10?'g2':'g1'}
function table(ab){var h='<div class="qSpecScroll"><div class="qSpecGrid"><div class="qSpecHead"><div>馬號</div><div>獨前</div><div>獨贏</div><div class="qSpecScale">',ps=ab?['PLA','QIN','QPL']:['WIN','QIN','QPL'];for(var m=-1;m<=16;m++)h+='<span>'+m+'</span>';h+='</div></div>';currentRunners().forEach(function(r){h+='<div class="qSpecRow"><div class="qSpecNo">'+r.no+'</div><div class="qSpecPre">—</div><div class="qSpecWin">'+(r.win||'—')+'</div><div class="qSpecBands">';ps.forEach(function(t){for(var m=-1;m<=16;m++)h+='<i class="qSpecCell '+band(snapshotVal(r.no,t,m,ab))+'"></i>'});h+='</div></div>'});return h+'</div></div><div class="qSpecLegend">'+(ab?'P / Q / QP':'W / Q / QP')+'　 <span><i style="background:#ddd"></i>&lt;10%</span><span><i style="background:#cfe5c8"></i>10~20%</span><span><i style="background:#edaeae"></i>20~30%</span><span><i style="background:#ad3f00"></i>&gt;30%</span></div>'}
function paddock(){var stages=[45,30,20,17,10,5,3,1,0],h='<div class="qSpecScroll"><div class="qSpecStage" style="grid-template-columns:52px repeat('+stages.length+',1fr)"><div class="h">馬號</div>';stages.forEach(function(m){h+='<div class="h">T-'+m+'</div>'});currentRunners().forEach(function(r){h+='<div class="h">'+r.no+'</div>';stages.forEach(function(m){var s=snapshotAt(m),v=positive(s&&s.odds&&s.odds.WIN&&s.odds.WIN[r.no]),pct=v&&r.win?(v/r.win-1)*100:null,bg=pct===null?'#fafafa':pct>=25?'#ad3f00':pct>=10?'#cfe5c8':pct<=-15?'#edaeae':'#ddd';h+='<div style="background:'+bg+'">'+(v||'—')+'</div>'})});return h+'</div></div>'}
function endpoint(){var q=new URLSearchParams();q.set('raceNo',state.raceNo||1);if(state.meeting&&state.meeting.date)q.set('date',state.meeting.date);if(state.meeting&&state.meeting.venueCode)q.set('venueCode',state.meeting.venueCode);return'/api/late-money?'+q}
function historyEndpoint(after){
  var q=new URLSearchParams();q.set('history','1');q.set('raceNo',state.raceNo||1);
  if(state.meeting&&state.meeting.date)q.set('date',state.meeting.date);
  if(state.meeting&&state.meeting.venueCode)q.set('venueCode',state.meeting.venueCode);
  if(after)q.set('afterSnapshotId',String(after));
  return '/api/late-money?'+q.toString()
}
function dataBadge(){
  var cl=dataState==='OK'?'ok':dataState==='STALE'?'stale':'fallback';
  return '<div class="qDataState"><span class="'+cl+'">DATA '+dataState+'</span></div>'
}
async function syncCloudHistory(force){
  if(!state||!state.meeting||!state.raceNo)return false;
  var now=Date.now();if(!force&&now-historySyncedAt<12000)return false;
  var key=raceKey(),after=history.length&&history[history.length-1].snapshotId||0;
  try{
    var r=await fetch(historyEndpoint(force?0:after),{cache:'no-store'}),j=await r.json();
    if(!r.ok||!j.ok||raceKey()!==key||!Array.isArray(j.frames))throw new Error(j.error||'history');
    var frames=j.frames.map(function(x){var s=fromApi(x,false);s.snapshotId=Number(x.baseSnapshotId||x.snapshotId||0);s.baseFetchedAt=x.baseFetchedAt||null;return s}).filter(function(x){return x&&number(x.t)!==null&&x.rows&&x.pools});
    if(force&&frames.length)history=frames.slice(-180);
    else if(frames.length){
      var seen={};history.forEach(function(x){seen[String(x.snapshotId||x.t)]=true});
      frames.forEach(function(x){var k=String(x.snapshotId||x.t);if(!seen[k])history.push(x)});
      history.sort(function(a,b){return a.t-b.t});history=history.slice(-180)
    }
    if(history.length){idx=history.length-1;save()}
    historySyncedAt=now;dataState='OK';return true
  }catch(e){historySyncedAt=now;return false}
}
function storageKey(){return'sb-qspec-live-v2:'+raceKey()}
function closeKey(){return'sb-qspec-closed-v1:'+raceKey()}
function load(){var k=raceKey();if(k===loaded)return false;if(pending){pending.abort();pending=null}busy=false;lastFetch=0;loaded=k;history=[];idx=-1;closed=null;try{var a=JSON.parse(localStorage.getItem(storageKey())||'[]');if(Array.isArray(a))history=a.filter(function(x){return x&&number(x.t)!==null&&x.rows&&x.pools&&number(x.mtp)!==null}).slice(-180);var c=JSON.parse(localStorage.getItem(closeKey())||'null');if(c&&c.closed===true){closed=c;if(number(c.lastLiveT)!==null)history=history.filter(function(s){return s.t<=c.lastLiveT});}}catch(e){}if(history.length){var cm=currentCentralWinOdds();history=history.map(function(s){return applyCentralOdds(s,cm)});idx=history.length-1}return true}
function save(){try{localStorage.setItem(storageKey(),JSON.stringify(history.slice(-180)))}catch(e){}}
function closedPools(j){var p=j.pools||{},seen=0,hasWin=false,hasPair=false;['WIN','PLA','QIN','QPL'].forEach(function(k){var v=String(p[k]&&p[k].status||'').toUpperCase();if(/^(PAYOUT|PAID|SETTLED|RESULT|FINAL|CLOSED|STOPPED|ENDED)$/.test(v)){seen++;if(k==='WIN')hasWin=true;if(k==='QIN'||k==='QPL')hasPair=true}});return seen>=2&&(hasWin||hasPair)}
function closeEvidenceTime(j){var p=j.pools||{},a=p.QIN,b=p.QPL;if(!a||!b||String(a.status).toUpperCase()!=='PAYOUT'||String(b.status).toUpperCase()!=='PAYOUT')return null;var x=Date.parse(a.lastUpdateTime||''),y=Date.parse(b.lastUpdateTime||''),post=Date.parse(j.postTime||'');if(!Number.isFinite(x)||!Number.isFinite(y)||Math.abs(x-y)>60000||!Number.isFinite(post)||Math.max(x,y)<post-600000)return null;return Math.max(x,y)}
function closeRace(j){if(closed)return;var observed=Date.parse(j.fetchedAt||'');if(!Number.isFinite(observed))observed=Date.now();var marker=closeEvidenceTime(j),retrospective=Number.isFinite(Date.parse(j.postTime||''))&&observed-Date.parse(j.postTime)>300000;var cutoff=retrospective&&marker?marker+60000:observed;var previous=history.slice();if(retrospective&&marker){history=history.filter(function(s){return s.t<=cutoff});if(previous.length!==history.length){try{var archive='sb-qspec-archive-v2:'+raceKey();if(!localStorage.getItem(archive))localStorage.setItem(archive,JSON.stringify(previous))}catch(e){}save()}}closed={closed:true,observedAt:observed,lastLiveT:history.length?history[history.length-1].t:null,retrospective:retrospective,source:'彩池停售／派彩狀態'};try{localStorage.setItem(closeKey(),JSON.stringify(closed))}catch(e){}idx=history.length-1;if(pending){pending.abort();pending=null}busy=false}
function fittedPools(j,pools){var horses=j.horses||{},keys=Object.keys(horses).filter(function(k){return positive(horses[k].pools&&horses[k].pools.WIN&&horses[k].pools.WIN.share)}),models={};TYPES.forEach(function(t){if(t==='WIN'||!pools[t])return;var pairs=keys.map(function(k){var x=positive(horses[k].pools.WIN.share),y=positive(horses[k].pools[t]&&horses[k].pools[t].share);return x&&y?[Math.log(x),Math.log(y)]:null}).filter(Boolean);if(pairs.length<Math.max(6,Math.ceil(keys.length*.75)))return;var xm=pairs.reduce(function(z,p){return z+p[0]},0)/pairs.length,ym=pairs.reduce(function(z,p){return z+p[1]},0)/pairs.length,cov=0,variance=0;pairs.forEach(function(p){cov+=(p[0]-xm)*(p[1]-ym);variance+=(p[0]-xm)*(p[0]-xm)});var alpha=clamp(variance>.05?cov/variance:.8,.45,1.15),den=keys.reduce(function(z,k){return z+Math.pow(horses[k].pools.WIN.share,alpha)},0);if(den>0)models[t]={alpha:alpha,den:den}});return models}
function fromApi(j,useCurrentAi){if(useCurrentAi===undefined)useCurrentAi=true;var raw=j.pools||{},pools={},total=0;Object.keys(raw).forEach(function(t){var v=positive(raw[t]&&raw[t].investment);if(v)total+=v});TYPES.forEach(function(t){var p=raw[t],v=positive(p&&p.investment);if(p&&v&&Number(p.nodeCount)>0)pools[t]={inv:v,updated:p.lastUpdateTime||''}});var models=fittedPools(j,pools),rows={},f={};try{(flowMetrics().rows||[]).forEach(function(x){f[x.no]=x})}catch(e){}Object.keys(j.horses||{}).forEach(function(k){var h=j.horses[k],win=positive(h.pools&&h.pools.WIN&&h.pools.WIN.share);if(!win)return;var weighted=0,weight=0,avg=0,count=0,rel=0,rw=0,positivePools=0,shares={},expected={};TYPES.forEach(function(t){var p=pools[t],share=positive(h.pools&&h.pools[t]&&h.pools[t].share);if(!p||!share)return;shares[t]=share;weighted+=p.inv*share;weight+=p.inv;avg+=share;count++;if(t==='WIN'||!models[t])return;var m=models[t],exp=Math.pow(win,m.alpha)/m.den;if(!(exp>0))return;expected[t]=exp;var dev=clamp(Math.log(share/exp),-.9,.9),w=Math.sqrt(p.inv);rel+=w*dev;rw+=w;if(dev>.07)positivePools++});if(!count)return;var a=useCurrentAi?(f[k]||f[Number(k)]||{}):{};rows[k]={no:Number(k),winOdds:positive(h.winOdds),win:win,absolute:.65*(weight?weighted/weight:0)+.35*avg/count,relative:rw?rel/rw:0,covered:rw>0?count-1:0,positive:positivePools,shares:shares,expected:expected,ai:useCurrentAi&&((number(a.qBankScore)||0)>=62&&(number(a.confidence)||0)>=45)}});var post=Date.parse(j.postTime||''),clock=Date.parse(j.fetchedAt||'');clock=Number.isFinite(clock)?clock:Date.now();return{t:clock,mtp:Number.isFinite(post)?(post-clock)/60000:null,totalInvestment:number(j.totalInvestment)!==null?number(j.totalInvestment):total,pools:pools,rows:rows,snapshotId:Number(j.baseSnapshotId||j.snapshotId||0),baseFetchedAt:j.baseFetchedAt||null}}
function oldAt(s,ms){for(var i=history.length-1;i>=0;i--)if(history[i].t<=s.t-ms)return history[i];return null}
function flowSince(s,base){var gains={},gross=0,sum=0,ratio={};if(!base||s.t<=base.t)return{ratio:ratio,total:0};Object.keys(s.rows).forEach(function(k){gains[k]=0});TYPES.forEach(function(t){var a=s.pools[t],b=base.pools&&base.pools[t];if(!a||!b||a.inv<=b.inv||!s.rows||!base.rows)return;var change=a.inv-b.inv;if(change<1000)return;var eligible=0;Object.keys(gains).forEach(function(k){var x=s.rows[k],y=base.rows&&base.rows[k];if(x&&y&&number(x.shares&&x.shares[t])!==null&&number(y.shares&&y.shares[t])!==null&&positive(y.expected&&y.expected[t]))eligible++});if(eligible<Math.max(6,Math.ceil(Object.keys(gains).length*.75)))return;gross+=change;Object.keys(gains).forEach(function(k){var x=s.rows[k],y=base.rows[k],v=x&&number(x.shares&&x.shares[t]),w=y&&number(y.shares&&y.shares[t]),e=y&&positive(y.expected&&y.expected[t]);if(v===null||w===null||!e)return;gains[k]+=a.inv*v-b.inv*w-change*e})});if(gross<10000)return{ratio:ratio,total:gross};Object.keys(gains).forEach(function(k){gains[k]=Math.max(0,gains[k]);sum+=gains[k]});if(sum>0)Object.keys(gains).forEach(function(k){ratio[k]=100*gains[k]/sum});return{ratio:ratio,total:gross}}
function score(s,k,flow,maxAbs,sumAbs){var x=s.rows[k],past=oldAt(s,60000),old=past&&past.rows[k],abs=maxAbs>0?Math.sqrt(Math.max(0,x.absolute)/maxAbs):0,rel=clamp(x.relative/.4,-1,1),breadth=x.positive>=2?3:0,momentum=old?8*clamp((x.relative-old.relative)/.16,-1,1):0,hasFlow=flow&&flow.total>=10000&&Object.keys(flow.ratio).length>0,observed=hasFlow?number(flow.ratio[k]):null,expected=sumAbs>0?100*x.absolute/sumAbs:0,change=observed!==null?18*clamp((observed-expected)/20,-1,1):0;return Math.round(clamp(40+32*abs+(rel<0?18:26)*rel+breadth+momentum+change,5,140))}
function baseline(s,post){var best=null,dist=Infinity;history.forEach(function(p){if(p.t>s.t||number(p.mtp)===null)return;var v=p.mtp;if(post?(v<-.3||v>.6):(v<2.2||v>3.8))return;var d=Math.abs(v-(post?0:3));if(d<dist){dist=d;best=p}});return best}
function newHigh(s,k){var x=s.rows[k],m=null;if(!x)return false;history.forEach(function(p){if(p.t>=s.t||number(p.mtp)===null||p.mtp>0)return;var y=p.rows&&p.rows[k];if(y)m=m===null?y.relative:Math.max(m,y.relative)});return m!==null&&x.relative>m+.035}
function timeLabel(m){if(m===null)return'待定';if(m>.35)return Math.round(m)+'分鐘';if(m>=-.35)return'0分鐘';if(m< -2)return'停售狀態待確認';return'+'+Math.round(-m*60)+'秒'}
function chart(){load();if(!history.length)return'<div class="qSpecEmpty">'+(closed?'投注已截止；本機未有可核實的截止前快照。':'正在建立即場資料；未有真實快照。')+'</div>';idx=clamp(idx<0?history.length-1:idx,0,history.length-1);var s=history[idx],keys=Object.keys(s.rows||{}),maxAbs=Math.max(0,...keys.map(function(k){return s.rows[k].absolute||0})),sumAbs=keys.reduce(function(a,k){return a+(s.rows[k].absolute||0)},0),recent=flowSince(s,oldAt(s,60000)),arr=keys.map(function(k){return Object.assign({score:score(s,k,recent,maxAbs,sumAbs)},s.rows[k])}).sort(function(a,b){return(a.winOdds||Infinity)-(b.winOdds||Infinity)||a.no-b.no}),post=s.mtp!==null&&s.mtp<=0,late=s.mtp!==null&&s.mtp<=3,base=baseline(s,post),flow=late?flowSince(s,base):{ratio:{},total:0};var h='<div class="qLiveTitle">R'+(state.raceNo||1)+' 即時熱錢分佈 '+format(s.totalInvestment)+'</div><div class="qLiveMeta">WIN 熱門 → 冷門 · 跨池與近期資金訊號（估算，非勝率）</div>'+dataBadge();if(closed)h+='<div class="qLiveClosed">投注已截止 · 已保存最後可用快照（非即時）</div>';if(!arr.length)return h+'<div class="qSpecEmpty">暫無有效馬匹資料</div>';h+='<div class="qSpecScroll"><div class="qLiveChart"><div class="qLiveBars">';arr.forEach(function(x){var r=number(flow.ratio[x.no]),white=!post&&base&&flow.total>=10000&&r!==null&&r>=10,red=post&&base&&flow.total>=10000&&r!==null&&r>=10&&newHigh(s,String(x.no)),bh=Math.max(8,Math.min(220,Math.round(x.score/140*220)));h+='<div class="qLiveCol">'+(white||red?'<div class="qLiveBubble '+(red?'red':'')+'" style="bottom:'+(bh+52)+'px">'+Math.round(r)+'%</div>':'')+'<div class="qLiveBar" style="height:'+bh+'px"><strong>'+x.score+'</strong>'+(x.ai?'<i class="qLiveAi"></i>':'')+'</div><div class="qLiveNo">'+x.no+'</div><div class="qLiveOdds">'+(x.winOdds||'—')+'</div></div>'});h+='</div></div></div><div class="qLiveTime"><b>'+(closed&&idx===history.length-1?'已截止':timeLabel(s.mtp))+'</b><button data-step="-1">‹</button><input type="range" min="0" max="'+(history.length-1)+'" value="'+idx+'"><button data-step="1">›</button></div><div class="qLiveLegend"><span><i style="background:#198d20"></i>AI 推介膽範圍</span><span>○ 白波＝T-3後額外流入佔比</span><span>🔴 紅波＝預定T0後額外流入並創新高</span></div>';if(late&&!base)h+='<div class="qSpecNote">未有最後3分鐘基準，暫不顯示白波／紅波。</div>';return h}
function tabs(){return'<div class="qSpecTabs"><button data-mode="wqqp" class="'+(mode==='wqqp'?'on':'')+'">WQQP%</button><button data-mode="qqpl" class="'+(mode==='qqpl'?'on':'')+'">QQPL異常</button><button data-mode="paddock" class="'+(mode==='paddock'?'on':'')+'">沙圈前</button><button data-mode="live" class="'+(mode==='live'?'on':'')+'">即場</button></div>'}
function render(){var p=container();if(!p)return;load();var b=mode==='live'?chart():mode==='paddock'?paddock():table(mode==='qqpl'),title=mode==='live'?'':mode==='wqqp'?'WQQP%頻譜':mode==='qqpl'?'QQPL異常':'沙圈前';p.innerHTML=(title?'<div class="qSpecTitle">'+title+'</div><div class="qSpecSub">-1 ～ 16＝距離開跑分鐘；缺少快照則留白</div>':'')+b+tabs()+(mode==='live'?'':'<div class="qSpecNote">沒有實際保存的歷史資料時顯示 —。</div>');Array.prototype.forEach.call(p.querySelectorAll('[data-mode]'),function(b){b.onclick=function(){mode=b.getAttribute('data-mode');if(mode==='live')idx=history.length-1;render()}});var range=p.querySelector('.qLiveTime input');if(range)range.oninput=function(){idx=Number(range.value)||0;render()};Array.prototype.forEach.call(p.querySelectorAll('[data-step]'),function(b){b.onclick=function(){idx=clamp(idx+Number(b.getAttribute('data-step')),0,history.length-1);render()}})}
async function poll(force){
  if(!state||!state.meeting||!state.raceNo)return;load();if(closed||busy)return;
  var last=history[history.length-1],now=Date.now(),m=last&&last.mtp!==null?last.mtp:999,interval=m>30?45000:m>4?16000:8500;
  if(!force&&now-lastFetch<interval)return;lastFetch=now;busy=true;
  var key=raceKey(),controller=new AbortController();pending=controller;
  try{
    var r=await fetch(endpoint(),{cache:'no-store',signal:controller.signal}),j=await r.json();
    if(!r.ok||!j.ok||controller.signal.aborted||raceKey()!==key||pending!==controller)return;
    var lag=Math.abs((Date.parse(j.fetchedAt||'')||0)-(Date.parse(j.baseFetchedAt||'')||0));
    if(j.baseStaleSnapshot||!j.baseSnapshotId||!Number.isFinite(lag)||lag>12000){dataState='STALE';if(mode==='live')render();return}
    if(closedPools(j)){closeRace(j);if(mode==='live')render();return}
    var s=applyCentralOdds(fromApi(j,true),currentCentralWinOdds()),old=history[history.length-1],follow=idx<0||idx>=history.length-1;
    if(old&&s.snapshotId&&old.snapshotId===s.snapshotId){dataState='OK';if(mode==='live')render();return}
    if(old&&s.t<=old.t)return;
    history.push(s);history=history.filter(function(x){return s.t-x.t<=8*60*60*1000}).slice(-180);save();dataState='OK';
    if(follow)idx=history.length-1;
    syncCloudHistory(false);
    if(mode==='live')render()
  }catch(e){
    dataState=history.length?'FALLBACK':'STALE';
    if(!controller.signal.aborted&&mode==='live'&&!history.length){var p=container(),el=p&&p.querySelector('.qSpecEmpty');if(el)el.textContent='即場資料暫時未能連接，稍後自動重試。'}
  }finally{if(pending===controller){pending=null;busy=false}}
}
function boot(){styles();if(!container()){setTimeout(boot,350);return}load();dataState=history.length?'FALLBACK':'STALE';render();syncCloudHistory(true).then(function(){render()});poll(true);try{var old=renderMoneyFlow;renderMoneyFlow=function(){old();if(mode!=='live')requestAnimationFrame(render)}}catch(e){}D.addEventListener('click',function(e){var button=e.target.closest&&e.target.closest('#raceChips [data-race]');if(!button)return;Promise.resolve().then(function(){if(load()){dataState=history.length?'FALLBACK':'STALE';render();syncCloudHistory(true).then(function(){render()});poll(true)}})},true);setInterval(function(){poll(false)},8500)}
boot();
})();