const fs=require('fs');
eval(fs.readFileSync('src/engine.js','utf8')+fs.readFileSync('src/data.js','utf8')+fs.readFileSync('src/physics.js','utf8')+`
function bot(id, assist, tune){
  const c=CAR_BY_ID[id]; const t0=defaultTune(c); Object.assign(t0,tune||{}); const s=computeSpec(c,t0); const v=new Vehicle(s); v.reset(0,0,0,0);
  let inDrift=0, total=0, spins=0, out=[];
  for(let k=0;k<120*16;k++){ const t=k/120; let inp; const b=-v.beta;
    if(t<3.5) inp={throttle:1,steer:0}; else if(t<3.8) inp={throttle:0.5,steer:1,hand:1};
    else { inp={throttle:clamp(0.75+(0.5-b)*1.6,0.25,1), steer:clamp(0.35+(0.5-b)*2.2,-1,1)}; }
    v.step(1/120,inp,{grip:1,slope:0,offroad:0,assist});
    if(t>4){ total++; if(b>0.25&&b<0.9) inDrift++; if(b>1.4) spins++; }
    if(k%120===0&&t>3) out.push((v.beta/DEG).toFixed(0)+'/'+(v.speed*3.6).toFixed(0)+'g'+v.gear);
  }
  console.log(id,'A'+assist, JSON.stringify(tune||{}), 'drift%',(inDrift/total*100).toFixed(0),'spin%',(spins/total*100).toFixed(0),' ',out.join(' '));
}
for(const a of [0,0.5,0.8]) { bot('hk_s3',a); bot('ak_kiri',a); }
bot('ak_kiri',0.5,{tire:'drift',diff:'2way'}); bot('hk_gt3',0.5); bot('ts_kazami',0.5); bot('eu_veloce',0.5); bot('hk_180',0.0,{tire:'drift',diff:'2way',engine:'turbo'});
`);
