const fs=require('fs');
eval(fs.readFileSync('src/engine.js','utf8')+fs.readFileSync('src/data.js','utf8')+fs.readFileSync('src/track.js','utf8')+`
// instrument
const origV=Track.prototype.validate;
for(const m of MAPS){
  let fails=[];
  Track.prototype.validate=function(pts){
    const n=pts.length,minSep=this.def.width+9; let why='ok';
    for(let i=0;i<n&&why==='ok';i++){const a=pts[(i-3+n)%n],b=pts[i],c=pts[(i+3)%n];const h1=Math.atan2(b[0]-a[0],b[2]-a[2]),h2=Math.atan2(c[0]-b[0],c[2]-b[2]);const k=Math.abs(wrapAngle(h2-h1))/(3*STEP);if(k>1/9) why='radius '+(1/k).toFixed(1);}
    const r=origV.call(this,pts); if(!r&&why==='ok') why='sep'; fails.push(r?'PASS':why); return r;
  };
  const t0=Date.now(); const tr=new Track(m);
  console.log(m.id.padEnd(11), (tr.length/1000).toFixed(2)+'km', 'corners',tr.corners.length,'hp',tr.corners.filter(c=>c.type==='ヘアピン').length, 'tries',fails.join(','), (Date.now()-t0)+'ms', 'dY',(tr.maxY-tr.minY).toFixed(0));
}
`);
