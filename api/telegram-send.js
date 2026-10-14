import {timingSafeEqual} from 'node:crypto';

const safeEq=(a,b)=>{
  const x=Buffer.from(String(a||'')),y=Buffer.from(String(b||''));
  return x.length===y.length && x.length>0 && timingSafeEqual(x,y);
};
const clean=(v,n)=>String(v??'').slice(0,n);
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'POST only'});
  const token=process.env.TELEGRAM_BOT_TOKEN;
  const chatId=process.env.TELEGRAM_CHAT_ID;
  const key=process.env.TELEGRAM_SEND_KEY;
  if(!token||!chatId||!key)return res.status(503).json({ok:false,error:'Telegram 尚未設定（需要 3 個環境變數）'});
  const origin=req.headers.origin;
  if(origin){
    try{
      const u=new URL(origin);
      if(u.host!==req.headers.host || u.protocol!=='https:')return res.status(403).json({ok:false,error:'Origin not allowed'});
    }catch{return res.status(403).json({ok:false,error:'Origin not allowed'});}
  }
  if(!safeEq(req.headers['x-smartbet-key'],key))return res.status(401).json({ok:false,error:'TG 傳送密鑰不正確'});
  let body=req.body;
  if(typeof body==='string'){try{body=JSON.parse(body)}catch{body=null}}
  if(!body||typeof body!=='object')return res.status(400).json({ok:false,error:'Invalid JSON'});
  const raceKey=clean(body.raceKey,40);
  if(!/^20\d{2}-\d{2}-\d{2}:(HV|ST):(?:[1-9]|1[0-2])$/.test(raceKey))return res.status(400).json({ok:false,error:'Invalid race'});
  const png=String(body.png||'').match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/);
  if(!png||png[1].length>3_900_000)return res.status(413).json({ok:false,error:'PNG too large or invalid'});
  const bytes=Buffer.from(png[1],'base64');
  if(bytes.length>2_900_000||bytes.length<100||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')
    return res.status(400).json({ok:false,error:'Invalid PNG bytes'});
  const caption=clean(body.caption,1024);
  const fd=new FormData();
  fd.set('chat_id',chatId);
  fd.set('caption',caption);
  fd.set('photo',new Blob([bytes],{type:'image/png'}),'smartbet-chart.png');
  const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),12000);
  try{
    const r=await fetch('https://api.telegram.org/bot'+token+'/sendPhoto',{method:'POST',body:fd,signal:ctl.signal});
    const j=await r.json().catch(()=>({}));
    if(!r.ok||!j.ok)return res.status(502).json({ok:false,error:'Telegram 拒絕傳送：'+clean(j.description||r.status,130)});
    return res.status(200).json({ok:true,messageId:j.result?.message_id||null});
  }catch(e){return res.status(502).json({ok:false,error:e.name==='AbortError'?'Telegram timeout':'Telegram 網絡錯誤'});}
  finally{clearTimeout(timer)}
}
