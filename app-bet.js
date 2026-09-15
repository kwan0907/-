function renderHorseGrid(){
  const rs=state.race?.runners||[]; $('horseGrid').innerHTML=rs.map(r=>{const no=runnerNo(r),isB=state.banker===no,isL=state.legs.has(no),isS=state.singles.has(no),cl=isB?'banker':isL?'leg':isS?'single':''; return `<button class="horse-btn ${cl}" data-horse="${no}"><span class="no">${no}</span><span class="name">${esc(r.name_ch||r.name_en||'')}</span><span class="odds">W ${oddsFor('WIN',String(no))??'—'} · P ${oddsFor('PLA',String(no))??'—'}</span></button>`}).join('');
  const pairCount=(state.banker?1:0)+state.legs.size; $('pairHint').textContent=state.banker?`膽 ${state.banker} · ${state.legs.size} 腳`:'先點一匹做膽馬'; $('singleHint').textContent=`已選 ${state.singles.size} 匹`;
  $('selectionSummary').textContent=state.pickMode==='pair'?(pairCount?`膽拖 ${pairCount}匹`:'未選馬'):(state.singles.size?`W/P ${state.singles.size}匹`:'未選馬');
}
function setPickMode(mode){state.pickMode=mode; document.querySelectorAll('#pickModeControl button').forEach(b=>b.classList.toggle('active',b.dataset.pickmode===mode)); $('pairHelp').classList.toggle('hidden',mode!=='pair');$('singleHelp').classList.toggle('hidden',mode!=='single');$('selectAllLegs').classList.toggle('hidden',mode!=='pair');$('clearPair').classList.toggle('hidden',mode!=='pair');$('clearSingles').classList.toggle('hidden',mode!=='single');renderHorseGrid();}
function selectHorse(no){ no=Number(no); if(state.pickMode==='pair'){ if(!state.banker){state.banker=no;state.legs.delete(no);} else if(state.banker===no){state.banker=null;} else if(state.legs.has(no)){state.legs.delete(no);} else state.legs.add(no); } else {state.singles.has(no)?state.singles.delete(no):state.singles.add(no);} renderHorseGrid();renderBetting();}

function activePoolsLabel(){return [...state.selectedPools].map(k=>POOL_LABEL[k]).join(' + ')||'未選玩法';}
function selectionRows(){
  const rows=[];
  if(state.banker&&state.legs.size){ for(const leg of state.legs){ const key=pairKey(state.banker,leg); if(state.selectedPools.has('QIN'))rows.push({pool:'QIN',sel:key,odds:oddsFor('QIN',key)}); if(state.selectedPools.has('QPL'))rows.push({pool:'QPL',sel:key,odds:oddsFor('QPL',key)}); } }
  for(const no of state.singles){ if(state.selectedPools.has('WIN'))rows.push({pool:'WIN',sel:String(no),odds:oddsFor('WIN',String(no))}); if(state.selectedPools.has('PLA'))rows.push({pool:'PLA',sel:String(no),odds:oddsFor('PLA',String(no))}); }
  return rows.filter(r=>r.odds>0);
}
function allocate(rows,budget,mode){ if(!rows.length)return[]; const unit=10; let weights=mode==='smart'?rows.map(r=>1/Math.max(.01,r.odds)):rows.map(()=>1); const sw=weights.reduce((a,b)=>a+b,0); let alloc=weights.map(w=>Math.max(unit,Math.floor((budget*w/sw)/unit)*unit)); let total=alloc.reduce((a,b)=>a+b,0); while(total+unit<=budget){let i=0;if(mode==='smart'){i=rows.map((r,j)=>({j,v:(alloc[j]+unit)*r.odds})).sort((a,b)=>a.v-b.v)[0].j;} else i=alloc.indexOf(Math.min(...alloc));alloc[i]+=unit;total+=unit;} while(total>budget&&alloc.some(v=>v>unit)){let i=alloc.indexOf(Math.max(...alloc));alloc[i]-=unit;total-=unit;} return rows.map((r,i)=>({...r,stake:alloc[i],ret:alloc[i]*r.odds})); }
function renderBetting(){
  $('poolSummaryPill').textContent=activePoolsLabel(); document.querySelectorAll('.pool-btn').forEach(b=>b.classList.toggle('active',state.selectedPools.has(b.dataset.pool)));
  const budget=Math.max(10,Number($('budget').value||0));$('bottomBudget').textContent=`HK$${budget}`;
  const rows=allocate(selectionRows(),budget,state.allocation); state.currentRows=rows; const total=rows.reduce((a,r)=>a+r.stake,0),returns=rows.map(r=>r.ret);
  $('comboCount').textContent=rows.length||'—';$('comboFoot').textContent=rows.length?`${activePoolsLabel()}`:'未完成選馬'; $('allocatedTotal').textContent=rows.length?`HK$${total}`:'—';$('remainingBudget').textContent=rows.length?`餘額 HK$${Math.max(0,budget-total)}`:'—'; $('returnRange').textContent=returns.length?`HK$${Math.min(...returns).toFixed(0)}–${Math.max(...returns).toFixed(0)}`:'—';
  $('resultRows').innerHTML=rows.length?rows.map(r=>`<tr><td>${POOL_LABEL[r.pool]}</td><td>${r.sel}</td><td>${r.odds.toFixed(1)}</td><td>HK$${r.stake}</td><td>≈ HK$${r.ret.toFixed(0)}</td></tr>`).join(''):'<tr><td colspan="5" class="empty">選擇玩法及馬匹後顯示</td></tr>';
  renderQuickBet(rows);
}
function betline(r){return `${POOL_LABEL[r.pool]} ${r.sel} $${r.stake}`;}
function renderQuickBet(rows){ const lines=rows.map(betline); $('quickBetPreview').textContent=lines.length?lines.join('\n'):'完成選馬及分注後，這裡顯示 Betline。'; $('rawTicketCount').textContent=rows.length||'—';$('betlineCount').textContent=lines.length||'—';$('compressionRate').textContent=rows.length?`${Math.max(0,Math.round((1-lines.length/rows.length)*100))}%`:'—'; }
function lockCurrent(){ if(!state.currentRows.length)return; state.locked=!state.locked; $('lockedCard').classList.toggle('hidden',!state.locked);$('lockBtn').textContent=state.locked?'解除鎖定':'鎖定方案'; if(state.locked)$('lockedText').textContent=`${state.meeting?.date||''} ${state.meeting?.venueCode||''} R${state.raceNo} · ${nowHK()} · ${state.currentRows.map(betline).join('｜')}`; }
function copySlip(){ const t=state.currentRows.map(betline).join('\n'); if(!t)return; navigator.clipboard?.writeText(t).then(()=>{ $('copySlipBtn').textContent='已複製';setTimeout(()=>$('copySlipBtn').textContent='複製 Betline',1200); }); }
function sendOfficial(){ const lines=state.currentRows.map(betline); if(!lines.length)return; const payload=btoa(unescape(encodeURIComponent(JSON.stringify({v:'mf1',meeting:state.meeting?.venueCode,date:state.meeting?.date,raceNo:state.raceNo,lines})))); const url='https://bet.hkjc.com/racing/pages/odds_wp.aspx?lang=ch#smartbet='+encodeURIComponent(payload); window.open(url,'_blank','noopener'); }
