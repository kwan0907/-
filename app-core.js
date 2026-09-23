const $ = id => document.getElementById(id);
const state = {
  meeting: null, races: [], raceNo: 1, race: null, odds: {}, pools: {},
  selectedPools: new Set(['QIN','QPL']), pickMode: 'pair', banker: null, legs: new Set(), singles: new Set(),
  interval: 10000, timer: null, allocation: 'smart', locked: false,
  snapshots: [], currentRows: [], flowFilter: 'all', heatSort: 'oddsAsc', heatColdOnly: false,
  snapshotId: 0, apiFetchedAt: null, cloudHistoryKey: '', cloudHistoryAt: 0
};
const POOL_LABEL = {WIN:'WIN',PLA:'P',QIN:'Q',QPL:'QP'};

function fmtTime(v){ if(!v) return '--:--'; const d=new Date(v); if(Number.isNaN(d.getTime())) return String(v).slice(11,16)||'--:--'; return d.toLocaleTimeString('zh-HK',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Hong_Kong'}); }
function fmtNum(v){ const n=Number(v); return Number.isFinite(n)?n.toLocaleString('en-HK',{maximumFractionDigits:0}):'—'; }
function nowHK(){ return new Date().toLocaleTimeString('zh-HK',{hour12:false,timeZone:'Asia/Hong_Kong'}); }
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function pairKey(a,b){ return [Number(a),Number(b)].sort((x,y)=>x-y).join(','); }
function asOdds(v){ const n=Number(v); return n>0?n:null; }
function setLive(ok,msg){ $('liveBadge').classList.toggle('error',!ok); $('liveBadge').querySelector('span').textContent=msg|| (ok?'已連線':'連線錯誤'); }
function apiUrl(){ const q=new URLSearchParams(); if(state.raceNo)q.set('raceNo',state.raceNo); if(state.meeting?.date)q.set('date',state.meeting.date); if(state.meeting?.venueCode)q.set('venueCode',state.meeting.venueCode); return '/api/racing?'+q.toString(); }

function poolMap(pools=[]){ return Object.fromEntries(pools.map(p=>[p.oddsType,p])); }
function normComb(v){
  const raw=String(v??'').replace(/\s/g,'');
  const nums=raw.match(/\d+/g);
  if(nums&&nums.length===2) return nums.map(Number).sort((a,b)=>a-b).join(',');
  return raw;
}
function oddsMap(pools=[]){
  const out={};
  pools.forEach(p=>{
    const m={};
    (p.oddsNodes||[]).forEach(n=>{ if(n.combString)m[normComb(n.combString)]=n; });
    out[p.oddsType]={...p,map:m};
  });
  return out;
}
function oddsFor(pool,key){ return asOdds(state.odds?.[pool]?.map?.[normComb(key)]?.oddsValue); }
function runnerNo(r){ return Number(r.no||r.saddleClothNo); }

async function loadData(manual=false){
  try{
    if(manual)$('refreshBtn').disabled=true;
    const r=await fetch(apiUrl(),{cache:'no-store'}); const j=await r.json(); if(!r.ok||!j.ok)throw new Error(j.error||`HTTP ${r.status}`);
    const incomingSnapshotId=Number(j.snapshotId||0);
    if(incomingSnapshotId&&state.snapshotId&&incomingSnapshotId<state.snapshotId)return;
    if(incomingSnapshotId)state.snapshotId=Math.max(state.snapshotId,incomingSnapshotId);
    state.apiFetchedAt=j.fetchedAt||new Date().toISOString();
    const meeting=(j.raceMeetings||[])[0] || (j.activeMeetings||[])[0];
    if(!meeting) throw new Error('今日暫時未有可讀取賽事');
    state.meeting=meeting; state.races=meeting.races||[];
    if(!state.races.find(r=>Number(r.no)===Number(state.raceNo))) state.raceNo=Number(state.races[0]?.no||1);
    state.race=state.races.find(r=>Number(r.no)===Number(state.raceNo))||state.races[0];
    state.odds=oddsMap(j.odds||[]); state.pools=poolMap(j.pools||[]);
    await syncCloudHistory();
    $('updatedAt').textContent=state.snapshotId?`#${String(state.snapshotId).slice(-6)} · ${fmtTime(state.apiFetchedAt)}`:nowHK(); setLive(true,'HKJC LIVE');
    renderMeeting(); renderRaces(); recordSnapshot(); renderMoneyFlow(); renderHorseGrid(); renderBetting(); updateCountdown();
  }catch(e){ setLive(false,'資料暫停'); $('meetingTitle').textContent='暫時未能取得 HKJC 資料'; $('raceMeta').textContent=e.message; }
  finally{ if(manual)$('refreshBtn').disabled=false; }
}

function renderMeeting(){
  const m=state.meeting,r=state.race; $('meetingTitle').textContent=`${m.venueCode||''} ${m.date||''} · 第 ${state.raceNo} 場`;
  $('raceMeta').textContent=[r?.raceName_ch,r?.distance?`${r.distance}m`:null,r?.raceCourse?.description_ch].filter(Boolean).join(' · ')||'香港賽馬會';
  $('postTime').textContent=fmtTime(r?.postTime);
}
function renderRaces(){
  $('raceChips').innerHTML=state.races.map(r=>`<button class="${Number(r.no)===Number(state.raceNo)?'active':''}" data-race="${r.no}">R${r.no} · ${fmtTime(r.postTime)}</button>`).join('');
}
function updateCountdown(){
  const p=state.race?.postTime; if(!p){$('countdown').textContent='--:--';return;} const ms=new Date(p).getTime()-Date.now();
  if(!Number.isFinite(ms)){$('countdown').textContent='--:--';return;} if(ms<=0){$('countdown').textContent='已開跑';return;}
  const s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60; $('countdown').textContent=h?`${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`:`${m}:${String(sec).padStart(2,'0')}`;
}
setInterval(updateCountdown,1000);

function snapshotStoreKey(){ return `smartbet-flow3:${state.meeting?.date||'na'}:${state.meeting?.venueCode||'na'}:${state.raceNo}`; }
function cloudSnapshotFromFrame(f){
  const shares=f?.shares||{},available=Object.keys(shares).filter(k=>Object.values(shares[k]||{}).some(v=>Number(v)>0)),pools=f?.pools||{};
  let invTotal=0;const inv={},weights={};available.forEach(k=>{inv[k]=Math.max(0,Number(pools[k]||0));invTotal+=inv[k];});
  available.forEach(k=>weights[k]=invTotal>0?(0.35/available.length+0.65*(inv[k]/invTotal)):(1/Math.max(1,available.length)));
  const cross={};Object.keys(shares.WIN||{}).forEach(no=>{cross[no]=available.reduce((sum,k)=>sum+(Number(shares[k]?.[no])||0)*(weights[k]||0),0);});
  return {t:Number(f?.t||0),postTime:state.race?.postTime||null,minutesToPost:Number(f?.mtp),pools,shares,cross,expected:shares.WIN||{},available,odds:{WIN:f?.odds||{},PLA:{}}};
}
async function syncCloudHistory(){
  const m=state.meeting;if(!m?.date||!m?.venueCode||!state.raceNo)return;
  const key=`${m.date}:${m.venueCode}:${state.raceNo}`,now=Date.now();
  if(state.cloudHistoryKey===key&&now-state.cloudHistoryAt<30000)return;
  try{
    const q=new URLSearchParams({date:m.date,venueCode:m.venueCode,raceNo:String(state.raceNo)}),r=await fetch('/api/qbank-cloud?'+q.toString(),{cache:'no-store'}),j=await r.json();
    if(r.ok&&j.ok&&Array.isArray(j.frames)){
      const frames=j.frames.map(cloudSnapshotFromFrame).filter(s=>s.t>0).sort((a,b)=>a.t-b.t);
      state.snapshots=frames.slice(-120);state.cloudHistoryKey=key;state.cloudHistoryAt=now;
    }
  }catch{}
}
function activeRunners(){ return (state.race?.runners||[]).filter(r=>runnerNo(r)&&!['SCRATCHED','Scratched','Standby'].includes(r.status)); }
function normalizeWeights(obj){
  const vals=Object.values(obj).filter(v=>Number.isFinite(v)&&v>0), total=vals.reduce((a,b)=>a+b,0);
  const out={}; Object.entries(obj).forEach(([k,v])=>out[k]=total>0&&v>0?v/total:0); return out;
}
function singlePoolShares(pool){
  const raw={}; activeRunners().forEach(r=>{const no=runnerNo(r),o=oddsFor(pool,String(no));if(o)raw[no]=1/o;}); return normalizeWeights(raw);
}
function pairPoolShares(pool){
  const raw={}; activeRunners().forEach(r=>raw[runnerNo(r)]=0);
  const m=state.odds?.[pool]?.map||{};
  Object.entries(m).forEach(([k,n])=>{const nums=normComb(k).split(',').map(Number).filter(Boolean),o=asOdds(n.oddsValue);if(nums.length!==2||!o)return;const w=1/o;nums.forEach(no=>{if(no in raw)raw[no]+=w/2;});});
  return normalizeWeights(raw);
}
function currentSupportModel(){
  const shares={WIN:singlePoolShares('WIN'),PLA:singlePoolShares('PLA'),QIN:pairPoolShares('QIN'),QPL:pairPoolShares('QPL')};
  const available=Object.keys(shares).filter(k=>Object.values(shares[k]).some(v=>v>0));
  const inv={}; let invTotal=0; available.forEach(k=>{inv[k]=Math.max(0,Number(state.pools[k]?.investment||0));invTotal+=inv[k];});
  const weights={}; available.forEach(k=>weights[k]=invTotal>0?(0.35/available.length+0.65*(inv[k]/invTotal)):(1/available.length));
  const cross={}; activeRunners().forEach(r=>{const no=runnerNo(r);cross[no]=available.reduce((sum,k)=>sum+(shares[k][no]||0)*weights[k],0);});
  const winBase=shares.WIN; const sorted=activeRunners().map(r=>runnerNo(r)).filter(no=>winBase[no]>0).sort((a,b)=>winBase[b]-winBase[a]); const ranks={};sorted.forEach((no,i)=>ranks[no]=i+1);
  return {shares,available,weights,cross,expected:winBase,ranks};
}
function rawSingleOdds(pool){ const o={}; activeRunners().forEach(r=>{const no=runnerNo(r),v=oddsFor(pool,String(no));if(v)o[no]=v;}); return o; }
function buildSnapshot(){
  const model=currentSupportModel();
  const apiTime=Date.parse(state.apiFetchedAt||'');
  return {t:Number.isFinite(apiTime)?apiTime:Date.now(),snapshotId:state.snapshotId||0,postTime:state.race?.postTime||null,minutesToPost:minutesToPost(),pools:Object.fromEntries(['WIN','PLA','QIN','QPL'].map(k=>[k,Number(state.pools[k]?.investment||0)])),shares:model.shares,cross:model.cross,expected:model.expected,available:model.available,odds:{WIN:rawSingleOdds('WIN'),PLA:rawSingleOdds('PLA')}};
}
function recordSnapshot(){
  if(!state.race)return;
  const snap=buildSnapshot();let arr=(state.snapshots||[]).filter(x=>x&&Number(x.t)>0&&snap.t-Number(x.t)<=45*60*1000&&Number(x.t)<=snap.t);
  const same=arr.findIndex(x=>(snap.snapshotId&&x.snapshotId===snap.snapshotId)||Number(x.t)===Number(snap.t));
  if(same>=0)arr[same]=snap;else arr.push(snap);
  arr.sort((a,b)=>a.t-b.t);state.snapshots=arr.slice(-450);
}
function previousSnapshot(minAgo=3){
  const target=Date.now()-minAgo*60000,arr=state.snapshots||[];if(!arr.length)return null;let best=null,dist=Infinity;
  for(const s of arr){const d=Math.abs(s.t-target);if(d<dist){best=s;dist=d;}}return best;
}
function pct(oldV,newV){ if(!(oldV>0)||!(newV>0))return 0; return (newV-oldV)/oldV*100; }
function minutesToPost(){ const t=new Date(state.race?.postTime||0).getTime(); return Number.isFinite(t)?(t-Date.now())/60000:99; }
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function median(arr){const a=arr.filter(Number.isFinite).slice().sort((x,y)=>x-y);if(!a.length)return 0;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;}
function robustZMap(obj){
  const vals=Object.values(obj).filter(Number.isFinite),med=median(vals),mad=median(vals.map(v=>Math.abs(v-med)))||0.12,scale=1.4826*mad;
  return Object.fromEntries(Object.entries(obj).map(([k,v])=>[k,clamp((v-med)/scale,-3.5,3.5)]));
}
function sigmoidScore(z){return clamp(100/(1+Math.exp(-1.15*z)),0,100);}
function logExcess(actual,expected){if(!(actual>0)||!(expected>0))return 0;return Math.log((actual+.004)/(expected+.004));}
