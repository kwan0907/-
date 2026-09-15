(function(){
'use strict';
if(window.__SB_MARKER__)return;window.__SB_MARKER__=1;
var d=document;
var selected={};
function noOf(el){
  var row=el.closest&&el.closest('[data-horse-no],.dashrow,.col');
  if(row&&row.getAttribute('data-horse-no'))return Number(row.getAttribute('data-horse-no'))||0;
  if(row&&row.classList.contains('col')){var h=row.querySelector('.hn');var m=h&&h.textContent.match(/\b(\d{1,2})\b/);return m?Number(m[1]):0}
  if(row&&row.classList.contains('dashrow')){var m2=(row.textContent||'').match(/^\s*(\d{1,2})\b/);return m2?Number(m2[1]):0}
  return 0;
}
function paint(){
  var bars=d.getElementById('bars');if(!bars)return;
  bars.querySelectorAll('.sbMarked').forEach(function(x){x.classList.remove('sbMarked')});
  bars.querySelectorAll('.flow .col').forEach(function(x){var n=noOf(x);if(selected[n])x.classList.add('sbMarked')});
  bars.querySelectorAll('.dashrow').forEach(function(x){var n=noOf(x);if(selected[n])x.classList.add('sbMarked')});
}
function style(){var s=d.createElement('style');s.textContent='.sbMarked{outline:2px solid #f1cf57!important;outline-offset:-2px!important;background:#2b250f!important}.flow .col.sbMarked{background:transparent!important;filter:drop-shadow(0 0 7px #f1cf57)!important}.flow .col.sbMarked .hn{color:#ffe878!important}';d.head.appendChild(s)}
d.addEventListener('click',function(e){var n=noOf(e.target);if(!n)return;selected[n]=!selected[n];paint()});
style();setInterval(paint,2000);
})();
