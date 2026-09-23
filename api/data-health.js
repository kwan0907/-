const UP='https://ajnunehxtiofcphdyhqn.supabase.co/functions/v1/smartbet-data-health';
export default async function handler(req,res){
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store, max-age=0');
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'method not allowed'});
  const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),10000);
  try{
    const r=await fetch(UP,{signal:ctl.signal,cache:'no-store',headers:{accept:'application/json','user-agent':'SmartBet-Health-Proxy/1.0'}});
    const text=await r.text();let j=null;try{j=JSON.parse(text)}catch{}
    if(!j)return res.status(502).json({ok:false,error:'health service returned invalid JSON'});
    return res.status(r.status).json(j);
  }catch(e){
    return res.status(502).json({ok:false,error:e?.name==='AbortError'?'health timeout':(e?.message||'health unavailable')});
  }finally{clearTimeout(tm)}
}