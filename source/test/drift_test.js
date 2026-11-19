const fs=require('fs');
eval(fs.readFileSync('src/engine.js','utf8')+fs.readFileSync('src/data.js','utf8')+fs.readFileSync('src/physics.js','utf8')+`
for (const id of ['ak_kiri','hk_s3','hk_gt3','ts_kazami','eu_veloce','ak_raijin4']) { const s=computeSpec(CAR_BY_ID[id]); console.log(id, s.stats.top, CAR_BY_ID[id].top, s.stats.accel.toFixed(1)); }
function sustain(id, assist, steerIn, thr, tune){
  const c=CAR_BY_ID[id]; const t0=defaultTune(c); Object.assign(t0,tune||{}); const s=computeSpec(c,t0); const v=new Vehicle(s); v.reset(0,0,0,0);
  const out=[];
  for(let k=0;k<120*12;k++){ const t=k/120; let inp;
    if(t<3.2) inp={throttle:1,steer:0}; else if(t<3.7) inp={throttle:0.2,steer:1,hand:1}; else inp={throttle:thr,steer:steerIn};
    v.step(1/120,inp,{grip:1,slope:0,offroad:0,assist});
    if(k%120===0&&t>3) out.push((v.beta/DEG).toFixed(0)+'/'+(v.speed*3.6).toFixed(0));
  }
  console.log(id,'A'+assist,'st'+steerIn,'th'+thr, out.join(' '));
}
for(const a of [0,0.5,0.8]) for(const st of [0.2,0.6,1]) sustain('hk_s3',a,st,1);
sustain('hk_s3',0.8,0.6,0.7); sustain('ak_kiri',0.8,0.6,1); sustain('ak_kiri',0.8,0.6,1,{tire:'drift',diff:'2way'}); sustain('hk_gt3',0.8,0.6,1); sustain('ts_kazami',0.8,0.6,1);
`);
