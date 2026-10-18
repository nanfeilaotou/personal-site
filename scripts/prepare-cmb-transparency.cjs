// Repair only the white matte outside the original card's four rounded corners.
// No resizing, redraw, or changes to pixels on the card face.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{PNG}=require('pngjs');
const root=path.resolve(__dirname,'..'),original='assets/cards/originals/cmb-mastercard-blue.png',target='assets/cards/cmb-mastercard-blue.png';
const raw=fs.readFileSync(path.join(root,original)),image=PNG.sync.read(raw),before=Buffer.from(image.data),{width:w,height:h}=image;
assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),'cdf71a42a69820edb93f0363ddf32bcdc5e10426e9b08453b73bd08c7aabbc43');
const offset=(x,y)=>(y*w+x)*4;
let changed=0;
for(const [sx,sy] of [[1,1],[-1,1],[1,-1],[-1,-1]]){
 const at=(x,y)=>offset(sx===1?x:w-1-x,sy===1?y:h-1-y);
 for(let y=0;y<18;y++){
  let edge=0;while(edge<24&&Math.min(before[at(edge,y)],before[at(edge,y)+1])>=90)edge++;
  assert.ok(edge<24,'Corner matte must end before the protected face');
  const reference=at(Math.min(24,edge+4),y);
  for(let x=0;x<edge;x++){
   const o=at(x,y),alpha=Math.max(0,Math.min(1,((255-before[o])/(255-before[reference])+(255-before[o+1])/(255-before[reference+1]))/2));
   // White JPEG-like matte is removed; partial edge coverage uses adjacent original blue.
   image.data[o+3]=alpha<.06?0:Math.round(alpha*255);
   if(image.data[o+3]>0)for(let c=0;c<3;c++)image.data[o+c]=before[reference+c];
   changed++;
  }
 }
}
fs.writeFileSync(path.join(root,target),PNG.sync.write(image));
console.log('CMB corner repair:',changed,'pixels in four 24×24 corner bounds;',w+'×'+h,'retained');
