const BASE = 'https://racing.hkjc.com/zh-hk/local/information/localresults';
function stripTags(s='') {return String(s).replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<br\s*\/?>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/\s+/g,' ').trim();}
function cells(row='') {return [...row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(m=>stripTags(m[1]));}
function normalizeDate(v='') {const m=String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);return m ? `${m[1]}/${m[2]}/${m[3]}` : v;}
function parseResults(html='') {
  const rows=[...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(m=>cells(m[1])).filter(x=>x.length),results=[],dividends=[];
  const poolNames=['獨贏','位置','連贏','位置Q','二重彩','三重彩','單T','四連環','四重彩','孖寶','三寶','六環彩','WIN','PLACE','QUINELLA','QUINELLA PLACE','FORECAST','TIERCE','TRIO','FIRST 4','QUARTET']; let lastPool='';
  for(const c of rows){
    const a=(c[0]||'').replace(/[\s　]/g,''),b=(c[1]||'').replace(/[\s　]/g,'');
    if(/^\d{1,2}$/.test(a)&&/^\d{1,2}$/.test(b)&&c.length>=8){const finish=Number(a),horseNo=Number(b),horse=c[2]||'';if(finish>0&&horseNo>0&&horse&&!results.some(x=>x.finish===finish&&x.horseNo===horseNo)){results.push({finish,horseNo,horse,jockey:c[3]||'',trainer:c[4]||'',actualWeight:c[5]||'',declaredWeight:c[6]||'',draw:c[7]||'',margin:c[8]||'',runningPosition:c[9]||'',finishTime:c[10]||'',winOdds:c[11]||c[c.length-1]||''});}continue;}
    const first=c[0]||'',detected=poolNames.find(p=>first.replace(/\s/g,'').toLowerCase()===p.replace(/\s/g,'').toLowerCase());
    if(detected){lastPool=detected;if(c.length>=3)dividends.push({pool:lastPool,combination:c[1]||'',dividend:c[2]||''});else if(c.length===2)dividends.push({pool:lastPool,combination:c[1]||'',dividend:''});continue;}
    if(lastPool&&c.length>=2&&/\d/.test(c[0]||'')&&/\d/.test(c[1]||''))dividends.push({pool:lastPool,combination:c[0]||'',dividend:c[1]||''});
  }
  results.sort((x,y)=>x.finish-y.finish); return {results,dividends};
}
function parseMeta(html='') {const text=stripTags(html),raceTitle=(text.match(/第\s*\d+\s*場[^\n]{0,140}/)||[])[0]||'',classDistance=(text.match(/第[一二三四五六七八九十]+班\s*-\s*\d+米[^\n]{0,120}/)||[])[0]||'',going=(text.match(/場地狀況\s*[:：]?\s*([^\s]{1,12})/)||[])[1]||'';return {raceTitle,classDistance,going};}
export default async function handler(req,res){
  try{
    const date=String(req.query.date||'').trim(),venue=String(req.query.venueCode||'ST').toUpperCase()==='HV'?'HV':'ST',raceNo=Math.max(1,Math.min(12,Number(req.query.raceNo||1)));
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ok:false,error:'Invalid date'});
    const u=new URL(BASE);u.searchParams.set('RaceNo',String(raceNo));u.searchParams.set('Racecourse',venue);u.searchParams.set('racedate',normalizeDate(date));
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9000);let r;try{r=await fetch(u,{headers:{'user-agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15','accept-language':'zh-HK,zh;q=0.9,en;q=0.7','accept':'text/html,application/xhtml+xml'},signal:controller.signal});}finally{clearTimeout(timer)}
    const html=await r.text();if(!r.ok)throw new Error(`HKJC history HTTP ${r.status}`);const parsed=parseResults(html),meta=parseMeta(html);if(!parsed.results.length)throw new Error('呢個日期／場次暫時讀唔到官方賽果，可能冇本地賽事或 HKJC 頁面格式已更新');
    res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=3600');res.status(200).json({ok:true,source:'HKJC official results',sourceUrl:u.toString(),date,venueCode:venue,raceNo,...meta,...parsed,fetchedAt:new Date().toISOString()});
  }catch(e){res.setHeader('Cache-Control','no-store');res.status(502).json({ok:false,error:e?.name==='AbortError'?'HKJC history request timeout':(e?.message||'History unavailable'),retrievedAt:new Date().toISOString()});}
}
