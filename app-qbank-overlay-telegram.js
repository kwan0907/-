(function(){
'use strict';
if(window.__SB_BASE_OVERLAY_TG__)return;
window.__SB_BASE_OVERLAY_TG__='20261014-base1';
var D=document,lastKey='',inFlight=false,view=null,intervalId=0,knownPick=null;
var STORE='sb-tg-auto-chart-v1',SECRET='sb-tg-send-secret';
function $(s,root){return (root||D).querySelector(s)}
function all(s,root){return Array.from((root||D).querySelectorAll(s))}
function raceKey(){
  var s=window.state,m=s&&s.meeting;
  return m&&m.date&&m.venueCode&&s.raceNo ? [m.date,m.venueCode,Number(s.raceNo)].join(':') : '';
}
function dataFrames(key){
  try{
    var x=JSON.parse(localStorage.getItem('sb-qspec-live-v2:'+key)||'[]');
    return Array.isArray(x)?x.filter(function(v){return v&&Number.isFinite(Number(v.t))&&v.rows}):[];
  }catch(e){return []}
}
function selected(key,host){
  var frames=dataFrames(key),slider=$('.qLiveTime input[type="range"]',host);
  var i=slider?Math.max(0,Math.min(frames.length-1,Number(slider.value)||0)):frames.length-1;
  return {frames:frames,index:i,frame:frames[i]||null};
}
function cloudRange(key,at){
  var api=window.__SB_CLOUD_PICKERS__,data=api&&api.get(key);
  if(!data||!Array.isArray(data.frames)||typeof api.picks!=='function')return null;
  // Never read future snapshots relative to the base chart being viewed.
  var frames=data.frames.filter(function(x){return Number.isFinite(Number(x.t))&&x.t<=at});
  return api.picks(frames);
}
function fmt(t){return new Date(t).toLocaleTimeString('zh-HK',{timeZone:'Asia/Hong_Kong',hour12:false})}
function style(){
  if(D.getElementById('sbOverlayTelegramCss'))return;
  var css=D.createElement('style');css.id='sbOverlayTelegramCss';
  css.textContent='.qSbTelegramTools{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:8px 0 10px}.qSbTelegramTools button{background:#0d5134;color:white;border:1px solid #3b9671;border-radius:8px;padding:8px 12px;font:bold 12px Arial,sans-serif;cursor:pointer}.qSbTelegramTools button[disabled]{opacity:.45;cursor:default}.qSbTelegramTools button.autoOn{background:#217bc1;border-color:#217bc1}.qSbTelegramStatus{font:11px/1.45 Arial,sans-serif;color:#52635b;min-width:0}.qSbBlueSummary{font:bold 12px/1.5 Arial,sans-serif;color:#145c94;background:#e8f4ff;border:1px solid #b4d9fd;border-radius:6px;padding:7px 9px;margin:7px 0}.qSbUnifiedBlue{position:absolute;left:0;right:0;top:0;height:5px;background:#2586d7;pointer-events:none;z-index:2}.qSbUnifiedActive .qSixMark,.qSbUnifiedActive .qCloudAltMark{display:none!important}.qSbCloudFallback .qCloudScroll,.qSbCloudFallback .qCloudControls{display:none!important}.qSbBaseUnavailable{font:12px/1.5 Arial,sans-serif;background:#fff4df;border:1px solid #dbba75;border-radius:7px;color:#72500f;padding:9px;margin:8px 0}@media(max-width:700px){.qSbTelegramTools button{padding:7px 8px;font-size:11px}.qSbBlueSummary{font-size:11px}}';
  D.head.appendChild(css);
}
function makeTools(host){
  var tools=$('.qSbTelegramTools',host);if(tools)return tools;
  tools=D.createElement('div');tools.className='qSbTelegramTools';
  tools.innerHTML='<button type="button" data-sbtg="send">📤 傳送圖表到 TG</button><button type="button" data-sbtg="auto">🔔 自動（開頁期間）</button><span class="qSbTelegramStatus" aria-live="polite"></span>';
  var meta=$('.qLiveMeta',host)||$('.qCloudLabel',host)||$('.qSpecTabs',host);
  if(meta)meta.after(tools);else host.prepend(tools);
  $('[data-sbtg="send"]',tools).onclick=function(){send(false)};
  $('[data-sbtg="auto"]',tools).onclick=function(){
    var on=localStorage.getItem(STORE)==='1';
    if(!on&&!getSecret())return;
    localStorage.setItem(STORE,on?'0':'1');update();
  };
  return tools;
}
function getSecret(){
  var s='';
  try{s=sessionStorage.getItem(SECRET)||''}catch(e){}
  if(s)return s;
  s=window.prompt('請輸入 SmartBet TG 傳送密鑰（TELEGRAM_SEND_KEY）。密鑰只暫存至今次分頁關閉。')||'';
  if(!s)return '';
  try{sessionStorage.setItem(SECRET,s)}catch(e){}
  return s;
}
function notice(tools,msg){
  var n=$('.qSbTelegramStatus',tools);if(n)n.textContent=msg;
}
function fallbackGuard(host,basePresent){
  var cloud=$('.qCloudView',host),hasCloudChart=cloud&&$('.qCloudChart',cloud);
  host.classList.toggle('qSbCloudFallback',!!(hasCloudChart&&!basePresent));
  var note=$('.qSbBaseUnavailable',host);
  if(hasCloudChart&&!basePresent){
    if(!note){note=D.createElement('div');note.className='qSbBaseUnavailable';cloud.prepend(note)}
    note.textContent='原版資金柱圖快照暫時未齊。為避免雲端四池的另一套分數取代原版數值，暫不顯示不同公式的柱高；藍色 T-5 觀察名單仍可保留。';
  }else if(note)note.remove();
}
function syncOverlay(host,key){
  var live=$('.qLiveChart',host),sel=selected(key,host),at=sel.frame&&Number(sel.frame.t);
  fallbackGuard(host,!!(live&&sel.frame));
  var old=$('.qSbBlueSummary',host);
  if(!live||!sel.frame||!Number.isFinite(at)){
    knownPick=null;host.classList.remove('qSbUnifiedActive');
    if(old)old.remove();
    return {live:false,key:key,frame:null,pick:null};
  }
  var pick=cloudRange(key,at),visible=pick&&at>=pick.at;
  var same=visible&&Array.isArray(pick.nos)&&pick.nos.length===6;
  host.classList.toggle('qSbUnifiedActive',!!same);
  var blue=new Set(same?pick.nos.map(Number):[]);
  all('.qLiveCol',live).forEach(function(col){
    var label=$('.qLiveNo',col),bar=$('.qLiveBar',col);if(!label||!bar)return;
    var n=Number(label.textContent),mark=$('.qSbUnifiedBlue',bar),yes=blue.has(n);
    if(yes&&!mark){mark=D.createElement('i');mark.className='qSbUnifiedBlue';bar.appendChild(mark)}
    if(!yes&&mark)mark.remove();
  });
  if(same){
    var txt='🔵 雲端 T-5 藍色範圍：'+pick.nos.map(function(n){return '#'+n}).join('　')+'　｜主圖數值沿用原版，不參與藍色計分';
    if(!old){old=D.createElement('div');old.className='qSbBlueSummary';var meta=$('.qLiveMeta',host);if(meta)meta.after(old);else host.prepend(old)}
    if(old.textContent!==txt)old.textContent=txt;
  }else if(old)old.remove();
  knownPick=same?pick:null;
  return {live:true,key:key,frame:sel.frame,pick:same?pick:null,latest:sel.index===sel.frames.length-1};
}
// Draw the *displayed* base values/runner order. Never calculate or overwrite a bar score.
function renderPng(host,key,info){
  var cols=all('.qLiveChart .qLiveCol',host).map(function(col){
    var bar=$('.qLiveBar',col),label=$('.qLiveNo',col);
    return {no:label?label.textContent.trim():'',score:$('.qLiveBar strong',col)?.textContent.trim()||'',
      odds:$('.qLiveOdds',col)?.textContent.trim()||'—',
      h:bar?Number.parseFloat(bar.style.height)||0:0,ai:!!(bar&&$('.qLiveAi',bar)),
      blue:!!(bar&&$('.qSbUnifiedBlue',bar))};
  }).filter(function(x){return x.no&&Number.isFinite(Number(x.score))});
  if(cols.length<6)throw Error('未有完整原版柱圖，暫不能傳送');
  var W=1200,H=750,c=D.createElement('canvas');c.width=W;c.height=H;
  var x=c.getContext('2d');if(!x)throw Error('無法製作圖片');
  x.fillStyle='#fff';x.fillRect(0,0,W,H);
  var r=key.split(':');x.fillStyle='#0861a5';x.textAlign='center';x.font='bold 34px Arial';
  x.fillText('SmartBet HK  |  '+(r[1]||'')+' 第 '+(r[2]||'')+' 場',W/2,56);
  var title=$('.qLiveTitle',host)?.textContent||'即時熱錢分佈';
  x.font='bold 25px Arial';x.fillText(title,W/2,99);
  x.font='19px Arial';x.fillStyle='#506472';
  x.fillText('原版資金柱圖（數值不經藍色算法重算）  |  快照 '+fmt(info.frame.t),W/2,133);
  if(info.pick){
    x.fillStyle='#155b98';x.font='bold 22px Arial';
    x.fillText('🔵 藍色 T-5 觀察：'+info.pick.nos.map(function(n){return '#'+n}).join('  '),W/2,171);
  }else{
    x.font='20px Arial';x.fillStyle='#75818a';x.fillText('藍色 T-5 觀察尚未鎖定',W/2,171);
  }
  var left=50,right=W-45,bottom=655,barBase=bottom-60,maxHeight=345;
  x.strokeStyle='#e4e8eb';x.lineWidth=1;
  for(var i=0;i<=5;i++){var yy=barBase-i*maxHeight/5;x.beginPath();x.moveTo(left,yy);x.lineTo(right,yy);x.stroke()}
  var gap=7,w=(right-left-(cols.length-1)*gap)/cols.length;
  cols.forEach(function(c,i){
    var bx=left+i*(w+gap),h=Math.max(8,Math.min(maxHeight,c.h/220*maxHeight)),top=barBase-h;
    x.fillStyle='rgba(255,154,62,.28)';x.strokeStyle='#f7943d';x.lineWidth=2;
    x.fillRect(bx,top,w,h);x.strokeRect(bx,top,w,h);
    if(c.blue){x.fillStyle='#2586d7';x.fillRect(bx+1,top+1,w-2,6)}
    if(c.ai){x.fillStyle='#198d20';x.fillRect(bx+2,barBase-8,w-4,7)}
    x.textAlign='center';x.fillStyle='#15252a';x.font='bold 23px Arial';x.fillText(c.score,bx+w/2,barBase-20);
    x.font='bold 20px Arial';x.fillText(c.no,bx+w/2,bottom-35);
    x.fillStyle='#5c666d';x.font='19px Arial';x.fillText(c.odds,bx+w/2,bottom-9);
  });
  x.fillStyle='#556670';x.textAlign='left';x.font='18px Arial';
  x.fillText('🟦 雲端 T-5 藍色區間（只標記）   🟩 AI 提示（保留原版）',left,702);
  x.font='16px Arial';x.fillText('研究訊號，不代表勝率或保證結果。',left,730);
  return c.toDataURL('image/png');
}
async function send(isAuto,info){
  if(inFlight)return;
  var key=raceKey(),host=$('#liveDashboard .qSpecHost .qSpec');
  if(!key||!host)return;
  info=info||syncOverlay(host,key);
  var tools=makeTools(host);
  if(!info.live){notice(tools,'⚠️ 需要原版資金圖（DATA OK／已保存快照）');return}
  var secret=isAuto?sessionStorage.getItem(SECRET):getSecret();
  if(!secret){notice(tools,'未設定 TG 傳送密鑰');return}
  var png;
  try{png=renderPng(host,key,info)}catch(e){notice(tools,String(e.message||e));return}
  var doneKey='sb-tg-auto-done:'+key+':'+(info.pick&&info.pick.at);
  inFlight=true;notice(tools,'⏳ 正在傳送圖片…');
  try{
    var r=await fetch('/api/telegram-send',{method:'POST',
      headers:{'Content-Type':'application/json','x-smartbet-key':secret},
      body:JSON.stringify({raceKey:key,png:png,
        caption:'🏇 SmartBet HK｜'+key.split(':')[1]+' 第'+key.split(':')[2]+'場\n'
          +'📊 原版資金柱圖 · 快照 '+fmt(info.frame.t)+'\n'
          +'🔵 雲端 T-5：'+(info.pick?info.pick.nos.map(function(n){return '#'+n}).join(' '):'未有可核實名單')
          +'\n原版分數未經藍色算法重算；研究用途，非勝率。'})});
    var j=await r.json();
    if(!r.ok||!j.ok)throw Error(j.error||'發送失敗');
    if(isAuto)localStorage.setItem(doneKey,String(Date.now()));
    notice(tools,'✅ 已傳送 TG'+(isAuto?'（T-5 自動）':''));
  }catch(e){notice(tools,'❌ '+String(e.message||e))}
  finally{inFlight=false}
}
function update(){
  var key=raceKey(),host=$('#liveDashboard .qSpecHost .qSpec');
  if(!key||!host)return;
  var tab=$('.qSpecTabs button.on',host),liveMode=tab&&tab.dataset.mode==='live';
  if(!liveMode)return;
  style();
  var tools=makeTools(host),info=syncOverlay(host,key);
  var auto=localStorage.getItem(STORE)==='1';
  var toggle=$('[data-sbtg="auto"]',tools),button=$('[data-sbtg="send"]',tools);
  toggle.classList.toggle('autoOn',auto);
  toggle.textContent=auto?'🔔 自動（開頁期間）：ON':'🔕 自動：OFF';
  button.disabled=!info.live||inFlight;
  // Auto-send once per race at the T-5 cloud lock, only for current/very recent data.
  // This never starts a hidden background job and never sends a historical replay.
  var stamp=info.pick&&info.pick.at,elapsed=stamp&&Date.now()-stamp;
  var old=info.frame&&Date.now()-Number(info.frame.t);
  var fresh=info.live&&info.latest&&info.frame&&Number(info.frame.mtp)<=5.75
    &&Number(info.frame.mtp)>=-0.5&&old>=-60000&&old<90000&&elapsed>=0&&elapsed<360000;
  var mark=stamp&&'sb-tg-auto-done:'+key+':'+stamp;
  if(auto&&fresh&&stamp&&!localStorage.getItem(mark)&&!inFlight)send(true,info);
}
intervalId=setInterval(update,1600);
update();
})();
