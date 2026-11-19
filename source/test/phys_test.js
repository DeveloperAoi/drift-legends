const fs=require('fs');
eval(fs.readFileSync('src/engine.js','utf8')+fs.readFileSync('src/data.js','utf8')+fs.readFileSync('src/physics.js','utf8')+`
for (const id of ['ak_kiri','hk_s3','hk_gt3','ts_kazami','eu_veloce','hb_kaze']) {
  const c=CAR_BY_ID[id]; const s=computeSpec(c); console.log(id, JSON.stringify(s.stats));
}
// drift test
function run(id, assist, label, ctrl){
  const s=computeSpec(CAR_BY_ID[id]); const v=new Vehicle(s); v.reset(0,0,0,0);
  let log=[];
  for(let k=0;k<120*14;k++){ const t=k/120; const inp=ctrl(t,v);
    v.step(1/120, inp, {grip:1,slope:0,offroad:0,assist});
    if(k%60===0) log.push(t.toFixed(1)+':'+(v.speed*3.6).toFixed(0)+'kmh g'+v.gear+' rpm'+v.rpm.toFixed(0)+' b'+(v.beta/DEG).toFixed(0)+' r'+v.r.toFixed(2)+' sR'+v.spinR.toFixed(2));
  }
  console.log(label, id, 'assist',assist); console.log(log.join(' | '));
}
const ctrl=(t,v)=>{ if(t<4) return {throttle:1,brake:0,steer:0,hand:0}; if(t<4.5) return {throttle:0.3,brake:0,steer:1,hand:1}; return {throttle:0.85,brake:0,steer:-0.15,hand:0}; };
run('hk_s3',0,'drift',ctrl); run('hk_s3',0.8,'drift',ctrl); run('ak_kiri',0.8,'drift',ctrl); run('hk_gt3',0.8,'drift',ctrl);
run('hk_s3',0.8,'grip turn',(t)=>t<5?{throttle:1,steer:0}:{throttle:0.5,steer:0.5});
run('ak_kiri',0.8,'brake',(t)=>t<6?{throttle:1,steer:0}:{throttle:0,brake:1,steer:0});
`);
