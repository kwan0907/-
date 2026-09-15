(function(){
'use strict';
if(window.__SB_MARKER__)return;window.__SB_MARKER__=2;
var d=document;
function raceKey(){var h=d.getElementById('homeMeeting'),t=h&&h.textContent||'',m=t.match(/^([A-Z]{2})\s+(\d{4}-\d{2}-\d{2}).*?R(\d+)/);return m?m[2]+'|'+m[1]+'|'+m[3]:'current'}
function key(){return 'sb_marked_'+raceKey()}
function load(){try{var a=JSON.parse(localStorage.getItem(key())||'[]'),o={};(Array.isArray(a)?a:[]).forEach(function(n){o[Number(n)]=1});return o}catch(e){return{}}}
function save(o){try{localStorage.setItem(key(),JSON.stringify(Object.keys(o).filter(function(k){return o[k]}).map(Number)))}catch(e){}}
function colNo(el){var row=el.closest&&el.closest('.flow .col');if(!row)return 0;var h=row.querySelector('.hn'),m=h&&h.textContent.match(/\b(\d{1,2})\b/);return m?Number(m[1]):0}
function listRow(el){var bars=d.getElementById('bars'),x=el;while(x&&bars&&x!==bars){var tx=(x.textContent||'').replace(/\s+/g,' ').trim();if(tx.length>8&&tx.length<260&&/\bW\s*\d+(?:\.\d+)?/i.test(tx)&&/[+-]\d+\s*$/.test(tx)){var m=tx.match(/^\s*(\d{1,2})\b/);if(m)return{el:x,no:Number(m[1])}}x=x.parentElement}return null}
function target(el){if(el.closest&&el.closest('input,button,select,textarea,a'))return null;var n=colNo(el);if(n)return{el:el.closest('.flow .col'),no:n};return listRow(el)}
function findRows(bars){var out=[];bars.querySelectorAll('div').forEach(function(x){var tx=(x.textContent||'').replace(/\s+/g,' ').trim();if(tx.length<=8||tx.length>=260||!/\bW\s*\d+(?:\.\d+)?/i.test(tx)||!/[+-]\d+\s*$/.test(tx))return;var m=tx.match(/^\s*(\d{1,2})\b/);if(!m)return;var childMatch=false;Array.prototype.forEach.call(x.children,function(c){var ct=(c.textContent||'').replace(/\s+/g,' ').trim();if(ct.length>8&&ct.length<260&&/\bW\s*\d+(?:\.\d+)?/i.test(ct)&&/[+-]\d+\s*$/.test(ct))childMatch=true});if(!childMatch)out.push({el:x,no:Number(m[1])})});return out}
function paint(){var bars=d.getElementById('bars');if(!bars)return;var selected=load();bars.querySelectorAll('.sbMarked').forEach(function(x){x.classList.remove('sbMarked')});bars.querySelectorAll('.flow .col').forEach(function(x){var n=colNo(x);if(selected[n])x.classList.add('sbMarked')});findRows(bars).forEach(function(r){if(selected[r.no])r.el.classList.add('sbMarked')})}
function style(){var s=d.createElement('style');s.textContent='.sbMarked{outline:2px solid #f1cf57!important;outline-offset:-2px!important;background:linear-gradient(90deg,#2f2810,#0b1b13)!important}.flow .col.sbMarked{background:transparent!important;filter:drop-shadow(0 0 7px #f1cf57)!important}.flow .col.sbMarked .hn{color:#ffe878!important;text-shadow:0 0 7px #f1cf5777!important}';d.head.appendChild(s)}
d.addEventListener('click',function(e){var t=target(e.target);if(!t||!t.no)return;var selected=load();selected[t.no]=!selected[t.no];save(selected);paint()});
style();setTimeout(paint,1200);setInterval(paint,2500);
})();
