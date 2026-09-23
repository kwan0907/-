const UP='https://ajnunehxtiofcphdyhqn.supabase.co/functions/v1/smartbet-live-racing';
const ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqbnVuZWh4dGlvZmNwaGR5aHFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzk4MzcsImV4cCI6MjA5MTcxNTgzN30.vn74xMzEm-fj7Gzhosxvn5UQWozAf_8LrDHXG3kycT4';

export default async function handler(req,res){
  res.setHeader('Content-Type','application/json; charset=utf-8');
  if(req.method!=='GET'){
    res.setHeader('Cache-Control','no-store');
    return res.status(405).json({ok:false,error:'method not allowed'});
  }
  const q=new URLSearchParams();
  for(const k of ['date','venueCode','raceNo']){
    const v=req.query?.[k];
    if(v!=null&&v!=='')q.set(k,String(Array.isArray(v)?v[0]:v));
  }
  const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),12000);
  try{
    const r=await fetch(UP+'?'+q.toString(),{
      signal:ctl.signal,
      cache:'no-store',
      headers:{
        accept:'application/json',
        apikey:ANON,
        authorization:'Bearer '+ANON,
        'user-agent':'SmartBet-Vercel-Proxy/1.0'
      }
    });
    const text=await r.text();
    let j=null;try{j=JSON.parse(text)}catch{}
    if(!j)return res.status(502).json({ok:false,error:'live cache returned invalid JSON'});
    res.setHeader('Cache-Control','no-store, max-age=0');
    res.setHeader('X-SmartBet-Snapshot',String(j.snapshotId||0));
    res.setHeader('X-SmartBet-Cache-State',String(j.cacheState||'UNKNOWN'));
    return res.status(r.status).json(j);
  }catch(e){
    res.setHeader('Cache-Control','no-store, max-age=0');
    return res.status(502).json({ok:false,error:e?.name==='AbortError'?'live cache timeout':(e?.message||'live cache unavailable'),retrievedAt:new Date().toISOString()});
  }finally{clearTimeout(tm)}
}