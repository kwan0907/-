function bind(){
  $('flowFilters').onclick=e=>{const b=e.target.closest('[data-flow-filter]');if(!b)return;state.flowFilter=b.dataset.flowFilter;document.querySelectorAll('#flowFilters button').forEach(x=>x.classList.toggle('active',x===b));renderMoneyFlow();};
  $('refreshBtn').onclick=()=>loadData(true); $('raceChips').onclick=e=>{const b=e.target.closest('[data-race]');if(!b)return;state.raceNo=Number(b.dataset.race);state.banker=null;state.legs.clear();state.singles.clear();loadData(true);};
  $('intervalControl').onclick=e=>{const b=e.target.closest('[data-interval]');if(!b)return;state.interval=Number(b.dataset.interval);document.querySelectorAll('#intervalControl button').forEach(x=>x.classList.toggle('active',x===b));restartTimer();};
  $('poolControl').onclick=e=>{const b=e.target.closest('[data-pool]');if(!b)return;const p=b.dataset.pool;state.selectedPools.has(p)?state.selectedPools.delete(p):state.selectedPools.add(p);renderBetting();};
  $('pickModeControl').onclick=e=>{const b=e.target.closest('[data-pickmode]');if(b)setPickMode(b.dataset.pickmode);}; $('horseGrid').onclick=e=>{const b=e.target.closest('[data-horse]');if(b)selectHorse(b.dataset.horse);};
  $('selectAllLegs').onclick=()=>{if(!state.banker)return;(state.race?.runners||[]).forEach(r=>{const n=runnerNo(r);if(n&&n!==state.banker)state.legs.add(n)});renderHorseGrid();renderBetting();}; $('clearPair').onclick=()=>{state.banker=null;state.legs.clear();renderHorseGrid();renderBetting();}; $('clearSingles').onclick=()=>{state.singles.clear();renderHorseGrid();renderBetting();};
  $('budget').oninput=renderBetting; $('budgetPresets').onclick=e=>{const b=e.target.closest('[data-budget]');if(!b)return;$('budget').value=b.dataset.budget;document.querySelectorAll('#budgetPresets button').forEach(x=>x.classList.toggle('active',x===b));renderBetting();};
  $('allocationControl').onclick=e=>{const b=e.target.closest('[data-mode]');if(!b)return;state.allocation=b.dataset.mode;document.querySelectorAll('#allocationControl button').forEach(x=>x.classList.toggle('active',x===b));renderBetting();};
  $('lockBtn').onclick=lockCurrent;$('copySlipBtn').onclick=copySlip;$('hkjcBtn').onclick=sendOfficial;
}
function shouldPoll(){return !document.hidden&&navigator.onLine!==false;}
function restartTimer(){
  clearInterval(state.timer);
  state.timer=setInterval(()=>{if(shouldPoll())loadData(false);},Math.max(5000,state.interval));
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&navigator.onLine!==false)loadData(false);});
window.addEventListener('online',()=>loadData(false));
bind();setPickMode('pair');renderBetting();loadData(false).then(restartTimer);
