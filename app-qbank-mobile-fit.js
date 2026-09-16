(function(){
'use strict';
if(document.getElementById('qbankMobileFitCss'))return;
var style=document.createElement('style');
style.id='qbankMobileFitCss';
style.textContent=`
/* Mobile-only presentation: keep all runners visible without changing source data. */
@media (max-width:700px){
  #liveDashboard .qSpecHost, #liveDashboard .qSpecHost .qSpec,
  #liveDashboard .qSpecHost .qSpecScroll,
  #liveDashboard .qSpecHost .qCloudView,
  #liveDashboard .qSpecHost .qCloudScroll {min-width:0!important;max-width:100%!important;width:100%!important;box-sizing:border-box!important;}
  #liveDashboard .qSpecHost .qSpecScroll,
  #liveDashboard .qSpecHost .qCloudScroll {overflow-x:hidden!important;}
  #liveDashboard .qSpecHost .qLiveChart,
  #liveDashboard .qSpecHost .qCloudChart {min-width:0!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;padding-left:2px!important;padding-right:2px!important;}
  #liveDashboard .qSpecHost .qLiveBars,
  #liveDashboard .qSpecHost .qCloudBars {min-width:0!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;gap:2px!important;padding-left:1px!important;padding-right:1px!important;}
  #liveDashboard .qSpecHost .qLiveCol,
  #liveDashboard .qSpecHost .qCloudCol {flex:1 1 0!important;min-width:0!important;max-width:none!important;box-sizing:border-box!important;overflow:visible!important;}
  #liveDashboard .qSpecHost .qLiveBar,
  #liveDashboard .qSpecHost .qCloudBar {min-width:0!important;width:100%!important;box-sizing:border-box!important;}
  #liveDashboard .qSpecHost .qLiveBar strong,
  #liveDashboard .qSpecHost .qCloudBar strong {font-size:clamp(9px,2.5vw,12px)!important;white-space:nowrap!important;letter-spacing:-.3px!important;}
  #liveDashboard .qSpecHost .qLiveNo,
  #liveDashboard .qSpecHost .qLiveOdds,
  #liveDashboard .qSpecHost .qCloudCol b,
  #liveDashboard .qSpecHost .qCloudCol small {font-size:clamp(9px,2.5vw,11px)!important;line-height:1.25!important;white-space:nowrap!important;letter-spacing:-.35px!important;}
  #liveDashboard .qSpecHost .qLiveBubble,
  #liveDashboard .qSpecHost .qCloudAltBubble {min-width:25px!important;width:auto!important;height:26px!important;font-size:9px!important;padding:0 2px!important;}
  #liveDashboard .qSpecHost .qLiveCol:nth-child(even)>.qLiveBubble,
  #liveDashboard .qSpecHost .qLiveCol:nth-child(even)>.qCloudAltBubble {translate:0 -22px;}
  #liveDashboard .qSpecHost .qLiveTime,
  #liveDashboard .qSpecHost .qCloudControls {max-width:100%!important;min-width:0!important;box-sizing:border-box!important;gap:6px!important;}
  #liveDashboard .qSpecHost .qLiveTime input,
  #liveDashboard .qSpecHost .qCloudControls input {flex:1 1 auto!important;min-width:20px!important;width:100%!important;max-width:none!important;}
  #liveDashboard .qSpecHost .qLiveTime b,
  #liveDashboard .qSpecHost .qCloudControls span {min-width:0!important;white-space:nowrap!important;padding:8px 5px!important;font-size:10px!important;}
  #liveDashboard .qSpecHost .qLiveTime button,
  #liveDashboard .qSpecHost .qCloudControls button {flex:0 0 30px!important;width:30px!important;height:30px!important;font-size:20px!important;}
}
@media (max-width:370px){
  #liveDashboard .qSpecHost .qLiveBars,
  #liveDashboard .qSpecHost .qCloudBars {gap:1px!important;}
  #liveDashboard .qSpecHost .qLiveBar strong,
  #liveDashboard .qSpecHost .qCloudBar strong,
  #liveDashboard .qSpecHost .qLiveNo,
  #liveDashboard .qSpecHost .qLiveOdds,
  #liveDashboard .qSpecHost .qCloudCol b,
  #liveDashboard .qSpecHost .qCloudCol small {font-size:9px!important;letter-spacing:-.5px!important;}
}
`;
document.head.appendChild(style);
})();