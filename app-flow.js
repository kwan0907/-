function flowMetrics(){
  const model=currentSupportModel(), runners=activeRunners(), nos=runners.map(r=>runnerNo(r));
  const excess={PLA:{},QIN:{},QPL:{}};
  for(const no of nos){for(const pool of Object.keys(excess)){excess[pool][no]=logExcess(model.shares[pool]?.[no]||0,model.expected[no]||0);}}
  const z={PLA:robustZMap(excess.PLA),QIN:robustZMap(excess.QIN),QPL:robustZMap(excess.QPL)};
  const p3=previousSnapshot(3),p17=previousSnapshot(17),minutes=minutesToPost(),snapCount=state.snapshots.length;
  const latest3=state.snapshots.slice(-3);
  const rows=nos.map(no=>{
    const rank=model.ranks[no]||99, winOdds=oddsFor('WIN',String(no)), plaOdds=oddsFor('PLA',String(no));
    const zP=model.available.includes('PLA')?(z.PLA[no]||0):0,zQ=model.available.includes('QIN')?(z.QIN[no]||0):0,zQP=model.available.includes('QPL')?(z.QPL[no]||0):0;
    const oldWin3=Number(p3?.odds?.WIN?.[no]||0), oldWin17=Number(p17?.odds?.WIN?.[no]||0);
    const shorten3=oldWin3>0&&winOdds>0?clamp(Math.log(oldWin3/winOdds)*2.4,-1.8,1.8):0;
    const shorten17=oldWin17>0&&winOdds>0?clamp(Math.log(oldWin17/winOdds)*1.8,-1.5,1.5):0;
    const currentComposite=.42*zQ+.28*zQP+.14*zP+.09*shorten3+.03*shorten17;
    const persistence=latest3.length>=2?latest3.filter(s=>{const expected=s.expected?.[no]||0,cross=s.cross?.[no]||0;return expected>0&&cross>expected*1.08;}).length/latest3.length:0;
    const coldness=rank>4?clamp((rank-4)/6,0,1):0;
    const upsetZ=.34*zQ+.25*zQP+.13*zP+.10*shorten3+.12*persistence+.16*coldness-(rank<=3?.38:0);
    const top2Z=.44*zQ+.25*zQP+.13*zP+.07*shorten3+.03*shorten17+.18*persistence+.14*coldness-(rank<=3?.18:0);
    let upset=sigmoidScore(upsetZ-.18), place=sigmoidScore(top2Z-.08); if(rank<=4)upset*=.84;
    const poolConfidence=model.available.length/4,historyConfidence=clamp(snapCount/8,0,1),timeConfidence=minutes<=5?1:minutes<=18?.9:minutes<=35?.72:.55;
    const confidence=Math.round(100*clamp(.5*poolConfidence+.3*historyConfidence+.2*timeConfidence,.2,1));
    const excessRatio=model.expected[no]>0?((model.cross[no]||0)/model.expected[no]-1):0;
    const flow=clamp(currentComposite*30 + persistence*10,-100,100);
    const qBankScore=Math.round(clamp(.72*place+.18*upset+10*clamp(zQ,0,2)/2,0,100));
    const coldCandidate=rank>4 && qBankScore>=62 && confidence>=45 && zQ>=.45 && (zQP>=.35||zP>=.45);
    const very=qBankScore>=78&&confidence>=55&&zQ>=.75&&[zQP,zP].filter(v=>v>=.55).length>=1;
    const unstable=rank<=3&&currentComposite<=-.55&&confidence>=45;
    const type=very?'very':coldCandidate?'cold':unstable?'unstable':'normal';
    const tags=[]; if(very)tags.push('非常異常'); else if(coldCandidate)tags.push('冷馬機會'); else if(unstable)tags.push('熱門不穩');
    if(zQP>=1)tags.push(`QP +${zQP.toFixed(1)}σ`); else if(zQ>=1)tags.push(`Q +${zQ.toFixed(1)}σ`); else if(zP>=1)tags.push(`P +${zP.toFixed(1)}σ`); if(shorten3>.22)tags.push('WIN縮短'); if(!tags.length)tags.push(flow>=12?'偏熱':flow<=-12?'偏冷':'正常');
    return {no,rank,winOdds,plaOdds,zP,zQ,zQP,shorten3,shorten17,persistence,upset:Math.round(upset),place:Math.round(place),qBankScore,confidence,excessRatio,flow,type,tags,expected:model.expected[no]||0,actual:model.cross[no]||0};
  });
  return {model,rows};
}
function renderColdRank(rows){
  const el=$('coldRank'); if(!el)return;
  const candidates=rows.filter(x=>x.rank>4&&x.confidence>=40).sort((a,b)=>b.qBankScore-a.qBankScore||b.zQ-a.zQ).slice(0,3);
  if(!candidates.length){el.innerHTML='<div class="empty-mini">暫未有足夠跨池資料判斷 Q膽冷馬。</div>';return;}
  const runnerByNo=Object.fromEntries(activeRunners().map(r=>[runnerNo(r),r]));
  el.innerHTML=candidates.map((x,i)=>{const r=runnerByNo[x.no]||{};const clear=x.qBankScore>=62&&x.confidence>=45;return `<article class="cold-rank-item ${clear?'signal':''}"><div class="cold-rank-pos">${i+1}</div><div class="cold-rank-horse"><b>#${x.no} ${esc(r.name_ch||r.name_en||'')}</b><span>WIN ${x.winOdds??'—'} · 人氣 #${x.rank} · Q ${x.zQ>=0?'+':''}${x.zQ.toFixed(1)}σ</span></div><div class="cold-rank-score"><small>Q膽指數</small><strong>${x.qBankScore}</strong></div><div class="cold-rank-score"><small>前二指數</small><strong>${x.place}</strong></div><div class="cold-rank-conf"><small>可信度</small><b>${x.confidence}%</b></div></article>`;}).join('');
}
function renderMoneyFlow(){
  const prev=previousSnapshot(3),cur=buildSnapshot(),{model,rows:allRows}=flowMetrics();
  $('flowFreshness').textContent=state.snapshots.length>1?`${state.snapshots.length} 快照 · ${model.available.length}/4池`:'建立基準中';
  $('poolStrip').innerHTML=['WIN','PLA','QIN','QPL'].map(k=>{const g=pct(prev?.pools?.[k],cur.pools[k]),w=model.weights[k]||0;return `<div class="pool-stat"><span>${POOL_LABEL[k]} 彩池</span><strong>${cur.pools[k]>0?'$'+fmtNum(cur.pools[k]):'未開售'}</strong><em>${w>0?`模型權重 ${(w*100).toFixed(0)}%`:'等待數據'}</em><small class="${g>=0?'up':'down'}">3m ${g>=0?'+':''}${g.toFixed(1)}%</small></div>`}).join('');
  renderColdRank(allRows);
  let rows=allRows.map(x=>({r:activeRunners().find(r=>runnerNo(r)===x.no),...x}));
  if(state.flowFilter==='very')rows=rows.filter(x=>x.type==='very'); if(state.flowFilter==='cold')rows=rows.filter(x=>x.rank>4&&x.qBankScore>=62); if(state.flowFilter==='unstable')rows=rows.filter(x=>x.type==='unstable');
  rows.sort((a,b)=>b.qBankScore-a.qBankScore||b.flow-a.flow);
  $('flowGrid').innerHTML=rows.length?rows.map(x=>{const pos=x.flow>=0,w=Math.min(50,Math.abs(x.flow)/2);return `<div class="mf-row ${x.type}"><div class="mf-no">${x.no}</div><div class="mf-name"><b>${esc(x.r?.name_ch||x.r?.name_en||'—')}</b><span>W ${x.winOdds??'—'} · 人氣#${x.rank} · 超額 ${x.excessRatio>=0?'+':''}${(x.excessRatio*100).toFixed(0)}%</span></div><div class="mf-bar"><i class="zero"></i><i class="fill ${pos?'positive':'negative'}" style="${pos?`left:50%;width:${w}%`:`right:50%;width:${w}%`}"></i></div><div class="mf-value ${pos?'positive':'negative'}">${x.flow>=0?'+':''}${x.flow.toFixed(0)}</div><div class="mf-tags">${x.tags.slice(0,2).map(t=>`<span>${esc(t)}</span>`).join('')}<small>Q膽 ${x.qBankScore} · 前二 ${x.place} · 信 ${x.confidence}%</small></div></div>`}).join(''):'<div class="empty">目前篩選沒有符合條件的馬匹。</div>';
}
