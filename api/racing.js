const ENDPOINT = 'https://info.cld.hkjc.com/graphql/base/';

const HORSE_QUERY = `
fragment raceFragment on Race {
  id
  no
  status
  raceName_en
  raceName_ch
  postTime
  country_en
  country_ch
  distance
  wageringFieldSize
  go_en
  go_ch
  ratingType
  raceTrack { description_en description_ch }
  raceCourse { description_en description_ch displayCode }
  claCode
  raceClass_en
  raceClass_ch
  judgeSigns { value_en }
}
fragment racingBlockFragment on RaceMeeting {
  jpEsts: pmPools(oddsTypes: [WIN, PLA, TCE, TRI, FF, QTT, DT, TT, SixUP], filters: ["jackpot", "estimatedDividend"]) { leg { number races } oddsType jackpot estimatedDividend mergedPoolId }
  poolInvs: pmPools(oddsTypes: [WIN, PLA, QIN, QPL, CWA, CWB, CWC, IWN, FCT, TCE, TRI, FF, QTT, DBL, TBL, DT, TT, SixUP]) { id leg { races } }
  penetrometerReadings(filters: ["first"]) { reading readingTime }
  hammerReadings(filters: ["first"]) { reading readingTime }
  changeHistories(filters: ["top3"]) { type time raceNo runnerNo horseName_ch horseName_en jockeyName_ch jockeyName_en scratchHorseName_ch scratchHorseName_en handicapWeight scrResvIndicator }
}
query raceMeetings($date: String, $venueCode: String) {
  timeOffset { rc }
  activeMeetings: raceMeetings { id venueCode date status races { no postTime status wageringFieldSize } }
  raceMeetings(date: $date, venueCode: $venueCode) {
    id status venueCode date totalNumberOfRace currentNumberOfRace dateOfWeek meetingType totalInvestment
    country { code namech nameen seq }
    races {
      ...raceFragment
      runners {
        id no standbyNo status name_ch name_en horse { id code } color barrierDrawNumber handicapWeight currentWeight currentRating internationalRating gearInfo racingColorFileName allowance trainerPreference last6run saddleClothNo trumpCard priority finalPosition deadHeat winOdds
        jockey { code name_en name_ch }
        trainer { code name_en name_ch }
      }
    }
    obSt: pmPools(oddsTypes: [WIN, PLA]) { leg { races } oddsType comingleStatus }
    poolInvs: pmPools(oddsTypes: [WIN, PLA, QIN, QPL, CWA, CWB, CWC, IWN, FCT, TCE, TRI, FF, QTT, DBL, TBL, DT, TT, SixUP]) { id leg { number races } status sellStatus oddsType investment mergedPoolId lastUpdateTime }
    ...racingBlockFragment
    pmPools(oddsTypes: []) { id }
    jkcInstNo: foPools(oddsTypes: [JKC], filters: ["top"]) { instNo }
    tncInstNo: foPools(oddsTypes: [TNC], filters: ["top"]) { instNo }
  }
}`;

const ODDS_QUERY = `
query racing($date: String, $venueCode: String, $oddsTypes: [OddsType], $raceNo: Int) {
  raceMeetings(date: $date, venueCode: $venueCode) {
    pmPools(oddsTypes: $oddsTypes, raceNo: $raceNo) {
      id status sellStatus oddsType lastUpdateTime guarantee minTicketCost name_en name_ch
      leg { number races }
      cWinSelections { composite name_ch name_en starters }
      oddsNodes { combString oddsValue hotFavourite oddsDropValue bankerOdds { combString oddsValue } }
    }
  }
}`;
const HEADERS = {'content-type':'application/json','accept':'application/json, text/plain, */*','accept-language':'zh-HK,zh;q=0.9,en;q=0.8','origin':'https://bet.hkjc.com','referer':'https://bet.hkjc.com/','user-agent':'Mozilla/5.0'};
async function gql(query, variables = {}, operationName) {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 8500);
  try {
    const r = await fetch(ENDPOINT,{method:'POST',headers:HEADERS,body:JSON.stringify({...(operationName?{operationName}:{}),query,variables}),signal:controller.signal});
    const text=await r.text(),contentType=String(r.headers.get('content-type')||''); let json=null; try{json=JSON.parse(text);}catch{}
    if(!json){const looksHtml=/^\s*<!doctype|^\s*<html/i.test(text);const err=new Error(`${looksHtml?'HKJC upstream returned HTML instead of JSON':'HKJC upstream returned invalid JSON'} · HTTP ${r.status}`);err.upstreamStatus=r.status;err.upstreamContentType=contentType;throw err;}
    if(!r.ok||json.errors?.length){const err=new Error(json.errors?.map(e=>e.message).join('; ')||`HKJC HTTP ${r.status}`);err.upstreamStatus=r.status;err.upstreamContentType=contentType;throw err;}
    return json.data;
  } finally { clearTimeout(timer); }
}
function poolsForRace(poolInvs=[],raceNo){return poolInvs.filter(p=>(p.leg?.races||[]).map(Number).includes(Number(raceNo))&&['WIN','PLA','QIN','QPL'].includes(p.oddsType));}
function normalizeComb(v){
  const raw=String(v??'').trim();
  const nums=raw.match(/\d+/g);
  if(nums&&nums.length===1)return String(Number(nums[0]));
  if(nums&&nums.length===2)return nums.map(Number).sort((a,b)=>a-b).join(',');
  return raw;
}
function normalizeOdds(pools=[]){
  return pools.map(pool=>({
    ...pool,
    oddsNodes:(pool.oddsNodes||[]).map(node=>({
      ...node,
      combString:normalizeComb(node.combString),
      bankerOdds:(node.bankerOdds||[]).map(b=>({...b,combString:normalizeComb(b.combString)}))
    }))
  }));
}
export default async function handler(req,res){
  try{
    const requestedRaceNo=Math.max(1,Number(req.query.raceNo||1)),requestedDate=req.query.date||null,requestedVenue=req.query.venueCode||null;
    const meetingData=await gql(HORSE_QUERY,{date:requestedDate,venueCode:requestedVenue}); const selectedMeeting=(meetingData?.raceMeetings||[])[0]||(meetingData?.activeMeetings||[])[0]; if(!selectedMeeting)throw new Error('No active HKJC race meeting');
    const date=requestedDate||selectedMeeting.date,venueCode=requestedVenue||selectedMeeting.venueCode,raceNo=requestedRaceNo;
    const oddsData=await gql(ODDS_QUERY,{date,venueCode,oddsTypes:['WIN','PLA','QIN','QPL'],raceNo},'racing');
    const meeting=(meetingData?.raceMeetings||[]).find(m=>m.date===date&&m.venueCode===venueCode)||selectedMeeting,rawOdds=oddsData?.raceMeetings?.[0]?.pmPools||[],odds=normalizeOdds(rawOdds),pools=poolsForRace(meeting?.poolInvs||[],raceNo);
    res.setHeader('Cache-Control','no-store, max-age=0'); res.status(200).json({ok:true,fetchedAt:new Date().toISOString(),source:'HKJC public GraphQL',resolved:{date,venueCode,raceNo},activeMeetings:meetingData?.activeMeetings||[],raceMeetings:meetingData?.raceMeetings||[],odds,pools,totalInvestment:meeting?.totalInvestment??null});
  }catch(error){res.setHeader('Cache-Control','no-store, max-age=0');res.status(502).json({ok:false,error:error?.name==='AbortError'?'HKJC request timeout':(error?.message||'HKJC data unavailable'),upstreamStatus:error?.upstreamStatus??null,upstreamContentType:error?.upstreamContentType??null,retrievedAt:new Date().toISOString()});}
}
