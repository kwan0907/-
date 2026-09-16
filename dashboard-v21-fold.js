(function(){
'use strict';
if(window.__SMARTBET_FOLD_V21__)return;
window.__SMARTBET_FOLD_V21__='20260917-fold1';
var d=document;
var specs=[
 {id:'marketSignals',label:'同賠率／冷馬掃描',open:false,find:function(){return d.getElementById('marketSignals')}},
 {id:'eventSignals',label:'事件提醒',open:false,find:function(){return d.getElementById('eventSignals')}},
 {id:'moneyFlowRadar',label:'Money Flow 雷達',open:true,find:function(){var x=d.getElementById('radarCounts');return x&&x.closest('.card')}}
];
var s=d.createElement('style');s.id='smartbetFoldStyle';s.textContent='\
.sbFoldHead{flex-wrap:wrap!important;gap:8px!important}.sbFoldHead>div{min-width:0}.sbFoldToggle{margin-left:auto!important;flex:0 0 auto!important;min-height:38px!important;padding:8px 12px!important;border:1px solid #42735a!important;border-radius:10px!important;background:#102a1d!important;color:#a9f4c9!important;font:800 12px/1.2 system-ui,-apple-system,sans-serif!important;cursor:pointer!important;touch-action:manipulation}.sbFoldToggle:focus-visible{outline:2px solid #72ebb0!important;outline-offset:2px}.sbFoldBody[hidden]{display:none!important}.sbFoldBody:not([hidden]){display:block}.sbFoldBody>.stat4:first-child{margin-top:10px}@media(max-width:700px){.sbFoldToggle{font-size:12px!important;min-height:42px!important;padding:10px 12px!important}}\
';d.head.appendChild(s);
function stored(sp){try{var v=localStorage.getItem('smartbet_fold_v1_'+sp.id);return v==='open'?true:v==='closed'?false:sp.open}catch(e){return sp.open}}
function remember(sp,open){try{localStorage.setItem('smartbet_fold_v1_'+sp.id,open?'open':'closed')}catch(e){}}
function install(sp){var card=sp.find();if(!card||card.dataset.sbFoldReady==='1')return;
 var head=Array.prototype.find.call(card.children,function(el){return el.classList&&el.classList.contains('sectionhead')});if(!head)return;
 var children=Array.prototype.slice.call(card.children),i=children.indexOf(head);if(i<0||i===children.length-1)return;
 var body=d.createElement('div'),button=d.createElement('button');body.className='sbFoldBody';body.id='sbFoldBody_'+sp.id;
 // Move the actual data nodes rather than duplicating or replacing their content.
 children.slice(i+1).forEach(function(node){body.appendChild(node)});card.appendChild(body);
 button.type='button';button.className='sbFoldToggle';button.setAttribute('aria-controls',body.id);button.title=sp.label+'：展開或收起';head.classList.add('sbFoldHead');head.appendChild(button);
 function set(open){body.hidden=!open;button.setAttribute('aria-expanded',String(open));button.textContent=open?'收起 ▲':'展開 ▼';card.dataset.sbFoldOpen=open?'1':'0'}
 set(stored(sp));button.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var next=body.hidden;set(next);remember(sp,next)});
 card.dataset.sbFoldReady='1';
}
function boot(){specs.forEach(install)}
boot();var tries=0,wait=setInterval(function(){boot();tries++;if(tries>=40&&specs.every(function(sp){var c=sp.find();return c&&c.dataset.sbFoldReady==='1'}))clearInterval(wait)},800);
})();
