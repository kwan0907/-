const UP='https://ajnunehxtiofcphdyhqn.supabase.co/functions/v1/smartbet-qbank-cloud-replay';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store, max-age=0');
 res.setHeader('Content-Type','application/json; charset=utf-8');
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'method not allowed'});
 const date=String(req.query.date||''),venue=String(req.query.venueCode||'').toUpperCase(),race=Number(req.query.raceNo);
 if(!/^20\d{2}-\d{2}-\d{2}$/.test(date)||!['HV','ST'].includes(venue)||!Number.isInteger(race)||race<1||race>12)return res.status(400).json({ok:false,error:'invalid race key'});
 const q=new URLSearchParams({date,venueCode:venue,raceNo:String(race)}),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 try{const r=await fetch(UP+'?'+q,{signal:controller.signal,headers:{accept:'application/json'},cache:'no-store'}),j=await r.json();return res.status(r.status).json(j)}catch(e){return res.status(502).json({ok:false,error:'cloud snapshot service unavailable'})}finally{clearTimeout(timer)}
}