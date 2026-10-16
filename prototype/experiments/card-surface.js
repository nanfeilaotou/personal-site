/* Static source preparation inside the experiment. Original downloads stay intact. */
'use strict';
window.NFCardSurface={
 async load(item){
  const image=new Image();image.decoding='async';image.src='../../assets/global/'+item.file;await image.decode();
  const canvas=document.createElement('canvas');canvas.width=item.quad||item.redactions?item.surfaceWidth:image.naturalWidth;canvas.height=Math.round(canvas.width/item.aspect);const ctx=canvas.getContext('2d');
  let sampleMatrix=[1,0,0,0,1,0,0,0,1];
  if(item.quad){
   const scratch=document.createElement('canvas');scratch.width=image.naturalWidth;scratch.height=image.naturalHeight;const g=scratch.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0);const src=g.getImageData(0,0,scratch.width,scratch.height).data,out=ctx.createImageData(canvas.width,canvas.height);
   // Solve the projective mapping from a unit rectangle into the published photograph.
   const A=[],B=[];[[0,0],[1,0],[1,1],[0,1]].forEach(([u,v],i)=>{const [x,y]=item.quad[i];A.push([u,v,1,0,0,0,-x*u,-x*v],[0,0,0,u,v,1,-y*u,-y*v]);B.push(x,y);});
   for(let k=0;k<8;k++){let pivot=k;for(let j=k+1;j<8;j++)if(Math.abs(A[j][k])>Math.abs(A[pivot][k]))pivot=j;[A[k],A[pivot]]=[A[pivot],A[k]];[B[k],B[pivot]]=[B[pivot],B[k]];const d=A[k][k];for(let j=k;j<8;j++)A[k][j]/=d;B[k]/=d;for(let i=0;i<8;i++)if(i!==k){const f=A[i][k];for(let j=k;j<8;j++)A[i][j]-=f*A[k][j];B[i]-=f*B[k];}}
   const inset=item.sampleInset||0,s=1-2*inset;
   sampleMatrix=[B[0]*s/image.naturalWidth,B[3]*s/image.naturalHeight,B[6]*s,B[1]*s/image.naturalWidth,B[4]*s/image.naturalHeight,B[7]*s,((B[0]+B[1])*inset+B[2])/image.naturalWidth,((B[3]+B[4])*inset+B[5])/image.naturalHeight,(B[6]+B[7])*inset+1];
   for(let y=0;y<canvas.height;y++){if(y&&y%48===0)await new Promise(r=>setTimeout(r,0));for(let x=0;x<canvas.width;x++){
    const inset=item.sampleInset||0,u=inset+(x+.5)/canvas.width*(1-2*inset),v=inset+(y+.5)/canvas.height*(1-2*inset),d=B[6]*u+B[7]*v+1,sx=(B[0]*u+B[1]*v+B[2])/d,sy=(B[3]*u+B[4]*v+B[5])/d,ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy,o=(y*canvas.width+x)*4;
    for(let c=0;c<4;c++){const sample=(a,b)=>src[(Math.max(0,Math.min(scratch.height-1,b))*scratch.width+Math.max(0,Math.min(scratch.width-1,a)))*4+c];out.data[o+c]=sample(ix,iy)*(1-fx)*(1-fy)+sample(ix+1,iy)*fx*(1-fy)+sample(ix,iy+1)*(1-fx)*fy+sample(ix+1,iy+1)*fx*fy;}
   }}ctx.putImageData(out,0,0);
  }else ctx.drawImage(image,0,0,canvas.width,canvas.height);
  if(item.quad){ctx.save();ctx.globalCompositeOperation='destination-in';ctx.beginPath();ctx.roundRect(0,0,canvas.width,canvas.height,canvas.height*.043);ctx.fill();ctx.restore();}
  if(item.redactions){ctx.fillStyle='#080e1a';for(const [x,y,w,h] of item.redactions)ctx.fillRect(x*canvas.width,y*canvas.height,w*canvas.width,h*canvas.height);ctx.fillStyle='#aab2c0';ctx.font='8px monospace';ctx.fillText('VISUAL SAMPLE',canvas.width*.1,canvas.height*.6);}
  return {item,image,canvas,sampleMatrix};
 }
};
