const UP='https://ajnunehxtiofcphdyhqn.supabase.co/functions/v1/smartbet-live-history';
const ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqbnVuZWh4dGlvZmNwaGR5aHFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzk4MzcsImV4cCI6MjA5MTcxNTgzN30.vn74xMzEm-fj7Gzhosxvn5UQWozAf_8LrDHXG3kycT4';
export default async function handler(req,res){
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store, max-age=0');
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'method not allowed'});
  const q=new URLSearchParams();
  for(const k of ['date','venueCode','raceNo']){const v=req.query?.[k];if(v!=null&&v!=='')q.set(k,String(Array.isArray(v)?v[0]:v));}
  const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),10000);
  try{
    const r=await fetch(UP+'?'+q.toString(),{signal:ctl.signal,cache:'no-store',headers:{accept:'application/json',apikey:ANON,authorization:'Bearer '+ANON,'user-agent':'SmartBet-Live-History-Proxy/1.0'}});
    const text=await r.text();let j=null;try{j=JSON.parse(text)}catch{}
    if(!j)return res.status(502).json({ok:false,error:'live history returned invalid JSON'});
    return res.status(r.status).json(j);
  }catch(e){
    return res.status(502).json({ok:false,error:e?.name==='AbortError'?'live history timeout':(e?.message||'live history unavailable')});
  }finally{clearTimeout(tm)}
}