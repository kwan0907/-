(function(){
'use strict';
if(window.__SB_SIGNAL_LABELS__)return;window.__SB_SIGNAL_LABELS__='20260916-label2';
var d=document,busy=false;
function style(){var s=d.createElement('style');s.textContent='#anomalyTop5 .dashrow{visibility:hidden}#anomalyTop5 .dashrow.sb-labelled{visibility:visible}.statuspill.sb-xstrong{background:#123d2a!important;color:#83f1b7!important}.statuspill.sb-strong{background:#17392b!important;color:#8beab7!important}.statuspill.sb-weak{background:#46331a!important;color:#f3ca70!important}.statuspill.sb-xweak{background:#541b25!important;color:#ff9eae!important}.statuspill.sb-normal{background:#173327!important;color:#9fc7b2!important}';d.head.appendChild(s)}
function replaceText(root){if(!root)return;var w=d.createTreeWalker(root,NodeFilter.SHOW_TEXT),n,a=[];while((n=w.nextNode()))a.push(n);a.forEach(function(x){var t=x.nodeValue||'',z=t.replace(/人氣\s*#/g,'WIN排名#').replace(/熱門不穩/g,'熱門偏弱').replace(/冷馬機會/g,'冷馬支持').replace(/非常異常/g,'極端偏離');if(z!==t)x.nodeValue=z})}
function scoreOf(row){var m=(row.textContent||'').match(/[+-]\d{1,3}/g);return m&&m.length?Number(m[m.length-1]):null}
function rankOf(row){var t=row.textContent||'',m=t.match(/WIN排名\s*#\s*(\d{1,2})/);if(!m)m=t.match(/人氣\s*#\s*(\d{1,2})/);return m?Number(m[1]):99}
function label(score,rank){if(score==null)return null;if(score>=70)return['極端偏強','sb-xstrong'];if(score>=45)return[rank>=5?'冷馬支持':'支持偏強','sb-strong'];if(score>=20)return['支持偏強','sb-strong'];if(score<=-70)return['極端偏弱','sb-xweak'];if(score<=-20)return[rank<=3?'熱門偏弱':'支持偏弱','sb-weak'];return['正常','sb-normal']}
function fixRows(){var root=d.getElementById('anomalyTop5');if(!root)return;replaceText(root);root.querySelectorAll('.dashrow').forEach(function(r){var p=r.querySelector('.statuspill'),sc=scoreOf(r),rk=rankOf(r),z=label(sc,rk);if(p&&z){p.textContent=z[0];p.classList.remove('hot','cold','bad','sb-xstrong','sb-strong','sb-weak','sb-xweak','sb-normal');p.classList.add(z[1])}r.classList.add('sb-labelled')})}
function fixFilters(){var f=d.getElementById('homeFilters');if(!f)return;var a=f.querySelector('[data-filter="severe"]'),b=f.querySelector('[data-filter="cold"]'),c=f.querySelector('[data-filter="unstable"]');if(a)a.textContent='極端偏離';if(b)b.textContent='冷馬支持';if(c)c.textContent='熱門偏弱'}
function run(){if(busy)return;busy=true;try{replaceText(d.getElementById('home'));replaceText(d.getElementById('bars'));fixFilters();fixRows()}finally{busy=false}}
style();run();setTimeout(run,250);setInterval(run,10000);var mo=new MutationObserver(function(){run()});mo.observe(d.documentElement,{childList:true,subtree:true,characterData:true});
})();
