import { WORLD } from './game-logic.mjs';

const CX=WORLD.width/2;
const CY=58;
const ISO_X=.52;
const ISO_Y=.3;
const TILE=60;
const palette={
  grass:['#315c62','#396a6a','#40766d','#35625f'],
  stone:['#8a6d80','#a2808d','#b38c91','#9c7e89'],
  stoneLight:['#d2b6a5','#c7a79c','#dfbca6','#c9aaa1'],
  cyan:'#64efe5',violet:'#a791ff',pink:'#ff8ad9',gold:'#ffd58d',
  ink:'#182238',night:'#1b2936'
};

const trees=[
  [48,165,.95],[130,510,.85],[230,72,.75],[264,548,.86],[785,505,1.0],
  [911,370,.85],[856,65,.8],[130,430,.7],[748,185,.75],[930,175,.8],[545,552,.65]
];
const flowers=[[78,283],[109,304],[186,491],[248,101],[726,455],[856,282],[890,305],[704,520],[74,470],[926,442],[304,503],[804,74]];
const benches=[[290,350],[615,360],[430,505],[720,235]];

export function worldToScreen(x,y,z=0){
  return {x:CX+(x-y)*ISO_X,y:CY+(x+y)*ISO_Y-z};
}

export function screenToWorld(screenX,screenY,player,zoom=1){
  const focus=worldToScreen(player.x,player.y);
  const sx=zoom>1?focus.x+(screenX-CX)/zoom:screenX;
  const sy=zoom>1?focus.y+(screenY-WORLD.height/2)/zoom:screenY;
  const dx=(sx-CX)/ISO_X;
  const dy=(sy-CY)/ISO_Y;
  return {x:Math.max(14,Math.min(WORLD.width-14,(dx+dy)/2)),y:Math.max(14,Math.min(WORLD.height-14,(dy-dx)/2))};
}

function poly(ctx,points,fill,stroke=null,lineWidth=1){
  ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
  for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
  ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.lineWidth=lineWidth;ctx.strokeStyle=stroke;ctx.stroke();}
}
function plane(x,y,w,d,z=0){return [worldToScreen(x,y,z),worldToScreen(x+w,y,z),worldToScreen(x+w,y+d,z),worldToScreen(x,y+d,z)];}
function lerpColor(hex1,hex2,t){
  const a=hex1.match(/[\da-f]{2}/gi).map(v=>parseInt(v,16));const b=hex2.match(/[\da-f]{2}/gi).map(v=>parseInt(v,16));
  return `rgb(${a.map((n,i)=>Math.round(n+(b[i]-n)*t)).join(',')})`;
}
function shade(hex,amount){return lerpColor(hex,amount<0?'#000000':'#ffffff',Math.abs(amount));}
function gradient(ctx,x1,y1,x2,y2,a,b){const g=ctx.createLinearGradient(x1,y1,x2,y2);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
function rounded(ctx,x,y,w,h,r,fill,stroke=null){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}}
function isoPrism(ctx,x,y,w,d,h,material){
  const t1=worldToScreen(x,y,h),t2=worldToScreen(x+w,y,h),t3=worldToScreen(x+w,y+d,h),t4=worldToScreen(x,y+d,h);
  const b1=worldToScreen(x,y,0),b2=worldToScreen(x+w,y,0),b3=worldToScreen(x+w,y+d,0),b4=worldToScreen(x,y+d,0);
  poly(ctx,[t4,t3,b3,b4],material.front,'#19263975',1);
  poly(ctx,[t2,t3,b3,b2],material.side,'#19263975',1);
  poly(ctx,[t1,t2,t3,t4],material.top,material.edge||'#fff7e04d',1);
  return {t1,t2,t3,t4,b1,b2,b3,b4};
}

function drawGround(ctx,time,parallax={x:0,y:0}){
  ctx.save();ctx.translate(parallax.x,parallax.y);
  ctx.fillStyle=gradient(ctx,0,0,0,WORLD.height,'#101d32','#20394b');ctx.fillRect(0,0,WORLD.width,WORLD.height);
  // Deep, softly glowing island shadow.
  ctx.save();ctx.shadowColor='#56d7db55';ctx.shadowBlur=28;
  poly(ctx,plane(0,0,WORLD.width,WORLD.height),gradient(ctx,160,120,810,470,'#294b53','#243c50'),'#8af4e24d',2);ctx.restore();
  for(let y=0;y<WORLD.height;y+=TILE){
    for(let x=0;x<WORLD.width;x+=TILE){
      const cx=x+TILE/2,cy=y+TILE/2;
      const plaza=(cx>205&&cx<755&&cy>205&&cy<445)||(cx>390&&cx<570&&cy>55&&cy<555);
      const points=plane(x,y,TILE,TILE,0);
      const seed=Math.floor(x/TILE)*17+Math.floor(y/TILE)*31;
      if(plaza){
        const base=palette.stone[Math.abs(seed)%palette.stone.length];
        const fill=gradient(ctx,points[0].x,points[0].y,points[2].x,points[2].y,shade(base,.13),shade(base,-.13));
        poly(ctx,points,fill,'#f5cee022',1);
        if(seed%4===0){const p=worldToScreen(cx-8,cy+7,0);rounded(ctx,p.x-2,p.y-1,4,2,1,'#edcbb025');}
        if(seed%7===0){const p=worldToScreen(cx+10,cy-11,0);rounded(ctx,p.x-4,p.y-2,8,3,1,'#6c526521');}
      }else{
        const base=palette.grass[Math.abs(seed)%palette.grass.length];
        const fill=gradient(ctx,points[0].x,points[0].y,points[2].x,points[2].y,shade(base,.07),shade(base,-.12));
        poly(ctx,points,fill,'#a4f3d512',.8);
        if(seed%5===0){const p=worldToScreen(cx+(seed%13),cy-(seed%9),0);rounded(ctx,p.x,p.y,3,2,1,seed%2?'#9cebc544':'#b29bff33');}
      }
    }
  }
  // Hand-inlaid luminous route trims.
  const routeA=plane(390,66,180,6,1),routeB=plane(390,528,180,6,1);
  poly(ctx,routeA,'#58dce324');poly(ctx,routeB,'#58dce324');
  // Floating motes, seeded so they stay calm and consistent between frames.
  for(let i=0;i<18;i++){
    const x=(i*173+80)%WORLD.width,y=(i*97+55)%WORLD.height;
    const p=worldToScreen(x,y,0);const flicker=.4+.6*Math.abs(Math.sin(time/700+i));
    ctx.globalAlpha=flicker*.38;ctx.fillStyle=i%3?'#81f0df':'#ffbfe9';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=9;
    ctx.beginPath();ctx.arc(p.x+Math.sin(time/1200+i)*4,p.y-3+Math.cos(time/900+i)*3,1.2,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.restore();
}

function drawWindow(ctx,x,y,zBottom,w,h,glow){
  const pts=[worldToScreen(x,y,zBottom+h),worldToScreen(x+w,y,zBottom+h),worldToScreen(x+w,y,zBottom),worldToScreen(x,y,zBottom)];
  ctx.save();ctx.shadowColor=glow;ctx.shadowBlur=12;poly(ctx,pts,gradient(ctx,pts[0].x,pts[0].y,pts[2].x,pts[2].y,glow,'#f7cb8b'));ctx.restore();
  poly(ctx,pts,null,'#20253e',2);
  const a=worldToScreen(x+w*.22,y,zBottom+h*.8),b=worldToScreen(x+w*.78,y,zBottom+h*.8);
  poly(ctx,[a,b,worldToScreen(x+w*.78,y,zBottom+h*.67),worldToScreen(x+w*.22,y,zBottom+h*.67)],'#ffffff76');
  const mid1=worldToScreen(x+w*.48,y,zBottom+h),mid2=worldToScreen(x+w*.52,y,zBottom);
  poly(ctx,[mid1,worldToScreen(x+w*.52,y,zBottom+h),mid2,worldToScreen(x+w*.48,y,zBottom)],'#20314b',1);
}

function drawDoor(ctx,x,y,zBottom,w,h){
  const points=[worldToScreen(x,y,zBottom+h),worldToScreen(x+w,y,zBottom+h),worldToScreen(x+w,y,zBottom),worldToScreen(x,y,zBottom)];
  poly(ctx,points,gradient(ctx,points[0].x,points[0].y,points[2].x,points[2].y,'#633d62','#232943'),'#f8c99366',1.5);
  const knob=worldToScreen(x+w*.78,y,zBottom+h*.45);ctx.fillStyle='#7cf3e8';ctx.shadowColor='#69eadd';ctx.shadowBlur=5;ctx.beginPath();ctx.arc(knob.x,knob.y,1.8,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
}

function drawBuilding(ctx,x,y,w,d,h,config,time){
  const base=worldToScreen(x+w/2,y+d/2,0);
  ctx.fillStyle='#0b172354';ctx.beginPath();ctx.ellipse(base.x,base.y+3,(w+d)*.25,(w+d)*.1,0,0,Math.PI*2);ctx.fill();
  const colors={front:config.front,side:config.side,top:config.top,edge:'#fff1dd6b'};
  isoPrism(ctx,x,y,w,d,h,colors);
  const frontShade=gradient(ctx,worldToScreen(x,y+d,h).x,0,worldToScreen(x+w,y+d,0).x,0,config.front,'#463d62');
  const facade=[worldToScreen(x,y+d,h),worldToScreen(x+w,y+d,h),worldToScreen(x+w,y+d,0),worldToScreen(x,y+d,0)];
  poly(ctx,facade,frontShade);
  const windows=config.windows||2;
  for(let i=0;i<windows;i++)drawWindow(ctx,x+18+i*(w-50)/Math.max(1,windows-1),y+d,h*.38,24,28,config.glow);
  drawDoor(ctx,x+w*.5-14,y+d,h*.04,28,h*.48);
  // Art-deco horizontal facade trim.
  const trim=[worldToScreen(x+5,y+d,h*.34),worldToScreen(x+w-5,y+d,h*.34),worldToScreen(x+w-5,y+d,h*.31),worldToScreen(x+5,y+d,h*.31)];
  poly(ctx,trim,config.trim);
  // Floating roof terrace with metallic edge and emissive accents.
  isoPrism(ctx,x-9,y-9,w+18,d+18,h+8,{front:shade(config.side,-.12),side:shade(config.side,-.25),top:config.roof,edge:'#ffffff68'});
  const center=worldToScreen(x+w/2,y+d*.38,h+15);
  const signWidth=Math.max(58,config.label.length*7.2);
  ctx.save();ctx.shadowColor=config.glow;ctx.shadowBlur=18;
  rounded(ctx,center.x-signWidth/2,center.y-9,signWidth,18,6,'#17253be8','#9af7ed91');ctx.restore();
  ctx.font='700 8px system-ui,sans-serif';ctx.textAlign='center';ctx.fillStyle='#e8fff3';ctx.fillText(config.label,center.x,center.y+3);
  // Roof ridge and tiny neon corner markers.
  const r1=worldToScreen(x+w*.15,y+d*.2,h+11),r2=worldToScreen(x+w*.85,y+d*.2,h+11);
  ctx.strokeStyle=config.glow;ctx.shadowColor=config.glow;ctx.shadowBlur=8;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(r1.x,r1.y);ctx.lineTo(r2.x,r2.y);ctx.stroke();ctx.restore();
  [[x+8,y+8],[x+w-8,y+8],[x+8,y+d-8],[x+w-8,y+d-8]].forEach(([tx,ty],i)=>{
    const p=worldToScreen(tx,ty,h+10);ctx.fillStyle=i%2?'#86f6e7':'#f6a8e9';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(p.x,p.y,2,0,Math.PI*2);ctx.fill();
  });ctx.shadowBlur=0;
  // Animated rooftop steam/neon beacon for the café.
  if(config.beacon){const p=worldToScreen(x+w*.8,y+d*.35,h+20);const pulse=.6+.4*Math.sin(time/260);ctx.globalAlpha=pulse;ctx.fillStyle='#ff95dd';ctx.shadowColor='#ff72da';ctx.shadowBlur=14;ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.shadowBlur=0;}
}

function drawTree(ctx,x,y,scale,time){
  const base=worldToScreen(x,y,0),s=scale;
  ctx.fillStyle='#0713234d';ctx.beginPath();ctx.ellipse(base.x,base.y+2,18*s,7*s,0,0,Math.PI*2);ctx.fill();
  const trunkTop=worldToScreen(x,y,38*s);
  rounded(ctx,base.x-5*s,trunkTop.y,10*s,base.y-trunkTop.y+3,4*s,gradient(ctx,base.x-5,0,base.x+5,0,'#b37567','#463852'));
  // Layered, softly lit canopy instead of flat tiles.
  for(let layer=0;layer<3;layer++){
    const z=(46+layer*14)*s,pt=worldToScreen(x,y,z),rx=(22-layer*2)*s,ry=(13-layer)*s;
    const pulse=Math.sin(time/900+x+layer)*1.2;
    const g=ctx.createRadialGradient(pt.x-rx*.35,pt.y-ry*.45,2,pt.x,pt.y,rx*1.2);
    g.addColorStop(0,layer===2?'#9cf5c8':'#68dfa8');g.addColorStop(.5,layer===1?'#338c83':'#246b72');g.addColorStop(1,'#183e5d');
    ctx.save();ctx.shadowColor=layer===2?'#65f0cf55':'transparent';ctx.shadowBlur=layer===2?16:0;
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(pt.x,pt.y+pulse,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  const sparkle=worldToScreen(x-5*s,y-3*s,73*s);ctx.fillStyle='#d2ffe8';ctx.globalAlpha=.6+.3*Math.sin(time/240+x);ctx.fillRect(sparkle.x,sparkle.y,2,2);ctx.globalAlpha=1;
}

function drawFountain(ctx,x,y,time){
  const p=worldToScreen(x,y,0);
  // raised stone bowl with several material layers
  ctx.fillStyle='#101e345e';ctx.beginPath();ctx.ellipse(p.x,p.y+7,62,27,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=gradient(ctx,p.x-60,p.y-28,p.x+50,p.y+30,'#9d84a2','#4b557b');ctx.beginPath();ctx.ellipse(p.x,p.y,62,28,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#edc5ba';ctx.beginPath();ctx.ellipse(p.x,p.y-5,53,22,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=gradient(ctx,p.x-30,p.y-24,p.x+25,p.y+18,'#b5fcf0','#36a4c9');ctx.beginPath();ctx.ellipse(p.x,p.y-8,43,17,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#c1fff2a8';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y-9,31+Math.sin(time/300)*2,10,0,0,Math.PI*2);ctx.stroke();
  // central crystal jet and animated droplets
  const jet=18+Math.sin(time/180)*4;ctx.save();ctx.shadowColor='#74fff1';ctx.shadowBlur=15;
  ctx.fillStyle=gradient(ctx,p.x-4,p.y-42,p.x+4,p.y-10,'#e7fff1','#5de7f2');ctx.beginPath();ctx.ellipse(p.x,p.y-22-jet/3,3,jet,0,0,Math.PI*2);ctx.fill();ctx.restore();
  for(let i=0;i<5;i++){
    const a=time/800+i*Math.PI*2/5;const radius=15+(i%2)*10;
    const dx=p.x+Math.cos(a)*radius,dy=p.y-10+Math.sin(a)*radius*.3-Math.abs(Math.sin(time/180+i))*10;
    ctx.globalAlpha=.35+.55*Math.abs(Math.sin(time/170+i));ctx.fillStyle=i%2?'#d1fff4':'#8ceeff';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=7;ctx.beginPath();ctx.arc(dx,dy,1.6,0,Math.PI*2);ctx.fill();
  }ctx.globalAlpha=1;ctx.shadowBlur=0;
}

function drawPond(ctx,x,y,time){
  const p=worldToScreen(x,y,0);
  ctx.fillStyle='#12253b77';ctx.beginPath();ctx.ellipse(p.x,p.y+4,74,35,0,0,Math.PI*2);ctx.fill();
  const g=ctx.createLinearGradient(p.x-45,p.y-25,p.x+50,p.y+35);g.addColorStop(0,'#a0fff0');g.addColorStop(.25,'#39bdd0');g.addColorStop(.65,'#5568bf');g.addColorStop(1,'#3b477f');
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(p.x,p.y,70,31,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#d6fff5a8';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y,61,25,0,0,Math.PI*2);ctx.stroke();
  for(let i=0;i<4;i++){
    const phase=(time/900+i*.22)%1;ctx.globalAlpha=(1-phase)*.55;ctx.strokeStyle=i%2?'#c7a6ff':'#b6fff4';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.ellipse(p.x,p.y,12+phase*48,4+phase*19,0,0,Math.PI*2);ctx.stroke();
  }ctx.globalAlpha=1;
  for(let i=0;i<3;i++){const leaf=worldToScreen(x-35+i*32,y+6,2);ctx.fillStyle=['#9af3bb','#d4f594','#f7c4dc'][i];ctx.beginPath();ctx.ellipse(leaf.x,leaf.y,7,3,-.4,0,Math.PI*2);ctx.fill();}
}

function drawBench(ctx,x,y){
  const shadow=worldToScreen(x+18,y+9,0);ctx.fillStyle='#111d3355';ctx.beginPath();ctx.ellipse(shadow.x,shadow.y,24,8,0,0,Math.PI*2);ctx.fill();
  isoPrism(ctx,x,y,36,16,12,{front:'#714d68',side:'#4b426b',top:gradient(ctx,0,0,0,12,'#ffb77b','#d87c92'),edge:'#fff1dc'});
  const legA=worldToScreen(x+5,y+13,0),legB=worldToScreen(x+30,y+13,0),seatA=worldToScreen(x+5,y+13,12),seatB=worldToScreen(x+30,y+13,12);
  poly(ctx,[seatA,seatB,legB,legA],'#f1a07e');
}

function drawLamp(ctx,x,y,time){
  const p=worldToScreen(x,y,0),top=worldToScreen(x,y,59);
  ctx.strokeStyle='#8ea9c9';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(top.x,top.y);ctx.stroke();
  ctx.fillStyle='#435272';ctx.beginPath();ctx.ellipse(p.x,p.y,7,3,0,0,Math.PI*2);ctx.fill();
  const glow=.75+.25*Math.sin(time/300+x);ctx.globalAlpha=glow;ctx.shadowColor='#70f5f2';ctx.shadowBlur=18;ctx.fillStyle='#c8fff5';ctx.beginPath();ctx.arc(top.x,top.y-3,5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.shadowBlur=0;
  ctx.strokeStyle='#79f5e766';ctx.lineWidth=1;ctx.beginPath();ctx.arc(top.x,top.y-3,10+Math.sin(time/250)*2,0,Math.PI*2);ctx.stroke();
}

function drawFlower(ctx,x,y,index,time){
  const p=worldToScreen(x,y,0),colors=['#ff87d9','#f9dc86','#90fae5','#b7a0ff'];
  ctx.strokeStyle='#83dca6';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x,p.y-9);ctx.stroke();
  const color=colors[index%colors.length];ctx.save();ctx.shadowColor=color;ctx.shadowBlur=6;
  for(let i=0;i<4;i++){const a=i*Math.PI/2;ctx.fillStyle=i%2?'#ffe6f5':color;ctx.beginPath();ctx.ellipse(p.x+Math.cos(a)*3,p.y-10+Math.sin(a)*2,3,2,a,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#fff4af';ctx.beginPath();ctx.arc(p.x,p.y-10,1.6,0,Math.PI*2);ctx.fill();ctx.restore();
}

function drawLimb(ctx,x1,y1,x2,y2,width,color,highlight){
  ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#263149';ctx.lineWidth=width+3;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  if(highlight){ctx.strokeStyle=highlight;ctx.lineWidth=Math.max(1,width*.22);ctx.beginPath();ctx.moveTo(x1-1,y1);ctx.lineTo(x2-1,y2);ctx.stroke();}
}

function drawAvatar(ctx,actor,time,isPlayer=false){
  const foot=worldToScreen(actor.x,actor.y,0);
  const state=actor.animation||'idle';
  const stride=actor.moving?Math.sin(time/82+(actor.phase||0))*4:0;
  const breathing=Math.sin(time/390+(actor.phase||0))*.9;
  const dance=state==='dance',wave=state==='wave',cheer=state==='cheer',sitting=state==='sit';
  const sway=dance?Math.sin(time/145+(actor.phase||0))*5:Math.sin(time/900+(actor.phase||0))*1.1;
  const bounce=dance?Math.abs(Math.sin(time/115))*5:actor.moving?Math.abs(stride)*.36:breathing;
  const shirt=actor.accent||'#80eadd',skin=actor.color||'#eab49c',hair=actor.hair||'#372e4b',pants=actor.pants||'#424969';
  const x=foot.x+sway,y=foot.y-bounce;
  const bodyTilt=dance?Math.sin(time/145)*.1:actor.moving?Math.sin(time/82)*.035:0;
  const shadowScale=actor.moving?.88:1;
  ctx.save();ctx.translate(x,foot.y);ctx.scale(1,shadowScale);
  const shadow=ctx.createRadialGradient(0,4,2,0,4,23);shadow.addColorStop(0,'#070e1b99');shadow.addColorStop(1,'#0b132800');
  ctx.fillStyle=shadow;ctx.beginPath();ctx.ellipse(0,5,22,8,0,0,Math.PI*2);ctx.fill();
  if(dance){ctx.strokeStyle='#8ef7ff85';ctx.lineWidth=1.3;ctx.shadowColor='#59eef2';ctx.shadowBlur=13;ctx.beginPath();ctx.ellipse(0,4,27+Math.sin(time/110)*3,10,0,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;}
  ctx.translate(0,-bounce);ctx.rotate(bodyTilt);
  // Shaded legs and sneakers with independently animated knee paths.
  const legLift=sitting?7:stride;
  drawLimb(ctx,-5,-15, -6+legLift,-5,7,gradient(ctx,-9,-12,-2,-2,pants,shade(pants,-.32)),'#b8bbff77');
  drawLimb(ctx,5,-15, 6-legLift,-5,7,gradient(ctx,2,-12,9,-2,pants,shade(pants,-.28)),'#c8d1ff66');
  rounded(ctx,-12,-8+legLift,12,6,3,gradient(ctx,-12,-8,-1,-2,'#fff0d4','#ad8391'),'#eff2ff9a');
  rounded(ctx,1,-8-legLift,12,6,3,gradient(ctx,1,-8,12,-2,'#fff0d4','#ad8391'),'#eff2ff9a');
  // Softly lit body shell and jacket.
  const coat=gradient(ctx,-13,-47,13,-16,shade(shirt,.2),shade(shirt,-.28));
  rounded(ctx,-12,-43,24,29,8,'#262c47','#e8d5ff69');
  rounded(ctx,-10,-42,20,26,7,coat,'#ffffff54');
  rounded(ctx,-9,-41,7,22,5,'#ffffff1e');
  poly(ctx,[{x:-4,y:-42},{x:0,y:-36},{x:4,y:-42}],shade(shirt,-.1));
  ctx.strokeStyle='#f4d8ff70';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-35);ctx.lineTo(0,-19);ctx.stroke();
  ctx.fillStyle='#ffe9a1';ctx.shadowColor='#ffce7a';ctx.shadowBlur=5;ctx.beginPath();ctx.arc(0,-31,1.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  // Neck and head, with soft radial skin shading.
  rounded(ctx,-4,-51,8,9,3,gradient(ctx,-4,-50,4,-40,'#ffd5b6','#bd806f'));
  const face=ctx.createRadialGradient(-5,-66,2,0,-58,17);face.addColorStop(0,'#ffe0c0');face.addColorStop(.7,skin);face.addColorStop(1,shade(skin,-.32));
  ctx.fillStyle='#252a43';ctx.beginPath();ctx.ellipse(0,-60,15,17,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=face;ctx.beginPath();ctx.ellipse(0,-61,13,15,0,0,Math.PI*2);ctx.fill();
  // hair cap and swoop
  const hairGradient=gradient(ctx,-13,-77,10,-53,shade(hair,.2),shade(hair,-.28));
  ctx.fillStyle=hairGradient;ctx.beginPath();ctx.moveTo(-13,-65);ctx.quadraticCurveTo(-16,-82,-3,-80);ctx.quadraticCurveTo(11,-82,14,-71);ctx.lineTo(12,-64);ctx.quadraticCurveTo(6,-70,2,-72);ctx.quadraticCurveTo(-4,-65,-13,-65);ctx.fill();
  ctx.fillStyle=actor.hairHighlight||'#d29acb';ctx.globalAlpha=.65;ctx.beginPath();ctx.ellipse(-4,-76,6,2,-.25,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  // Eye direction follows movement; glints add a polished, friendly expression.
  const eyeShift=actor.facing==='left'?-2:actor.facing==='right'?2:0;
  ctx.fillStyle='#322a40';ctx.beginPath();ctx.ellipse(-5+eyeShift,-62,1.55,2.4,0,0,Math.PI*2);ctx.ellipse(5+eyeShift,-62,1.55,2.4,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff8ea';ctx.beginPath();ctx.arc(-5.4+eyeShift,-63,0.7,0,Math.PI*2);ctx.arc(4.6+eyeShift,-63,0.7,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f390ad';ctx.globalAlpha=.55;ctx.beginPath();ctx.ellipse(-8,-57,2.4,1.2,0,0,Math.PI*2);ctx.ellipse(8,-57,2.4,1.2,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  ctx.strokeStyle='#954e68';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-2,-54);ctx.quadraticCurveTo(0,-52,2,-54);ctx.stroke();
  // Arms animate with smooth gait, wave, celebration, and dancing states.
  if(wave){
    drawLimb(ctx,-11,-38,-16,-25,8,coat,'#ffffff65');
    const handY=-29+Math.sin(time/90)*2;drawLimb(ctx,-16,-25,-18,handY,6,gradient(ctx,-20,-32,-14,-24,'#ffe0c4',skin));
    ctx.fillStyle='#fff1c7';ctx.beginPath();ctx.arc(-18,handY,4,0,Math.PI*2);ctx.fill();
  }else if(dance||cheer){
    const armWave=Math.sin(time/95)*3;
    drawLimb(ctx,-10,-39,-18,-50-armWave,8,coat,'#ffffff72');drawLimb(ctx,10,-39,18,-50+armWave,8,coat,'#ffffff72');
    ctx.fillStyle=skin;ctx.beginPath();ctx.arc(-19,-51-armWave,4,0,Math.PI*2);ctx.arc(19,-51+armWave,4,0,Math.PI*2);ctx.fill();
  }else{
    drawLimb(ctx,-10,-39,-15-stride*.55,-24,8,coat,'#ffffff62');drawLimb(ctx,10,-39,15+stride*.55,-24,8,coat,'#ffffff62');
    ctx.fillStyle=skin;ctx.beginPath();ctx.arc(-15-stride*.55,-23,4,0,Math.PI*2);ctx.arc(15+stride*.55,-23,4,0,Math.PI*2);ctx.fill();
  }
  // Signature crystal hair clip and glint.
  if(isPlayer){ctx.save();ctx.shadowColor='#7ef5eb';ctx.shadowBlur=9;poly(ctx,[{x:7,y:-77},{x:11,y:-73},{x:7,y:-69},{x:3,y:-73}],'#87fff0','#e4fffb',1);ctx.restore();}
  else {ctx.fillStyle=actor.clip||'#f7c877';ctx.shadowColor=actor.clip||'#f7c877';ctx.shadowBlur=6;ctx.beginPath();ctx.arc(8,-73,2.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
  if(dance||cheer){for(let i=0;i<4;i++){const a=time/420+i*Math.PI/2;ctx.fillStyle=i%2?'#74f6e5':'#ff95dc';ctx.globalAlpha=.7+.3*Math.sin(time/150+i);ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=10;ctx.beginPath();ctx.arc(Math.cos(a)*25,-60+Math.sin(a)*18,2,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;ctx.shadowBlur=0;}
  ctx.restore();
  // Nameplate and speech bubble sit in screen space above the animated model.
  if(actor.name){
    const labelY=foot.y-88-bounce;ctx.font='700 11px system-ui,sans-serif';ctx.textAlign='center';const labelW=ctx.measureText(actor.name).width+18;
    ctx.save();ctx.shadowColor=isPlayer?'#63f1e5':'#a78cff';ctx.shadowBlur=10;rounded(ctx,foot.x-labelW/2,labelY,labelW,20,7,'#121a31eF',isPlayer?'#8af4df':'#bea9ff88');ctx.restore();
    ctx.fillStyle=isPlayer?'#a9fff0':'#f4efff';ctx.fillText(actor.name,foot.x,labelY+13.5);
  }
  if(actor.emo){
    const bx=foot.x+17,by=foot.y-109-bounce;ctx.save();ctx.shadowColor='#87f6eb';ctx.shadowBlur=12;
    rounded(ctx,bx,by,31,28,9,'#f2f7ff','#8de8ef');ctx.restore();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(bx+4,by+23);ctx.lineTo(bx+1,by+31);ctx.lineTo(bx+12,by+24);ctx.fill();
    ctx.font='17px system-ui,sans-serif';ctx.textAlign='center';ctx.fillText(actor.emo,bx+15,by+20);
  }
}

export const OBSTACLES=[
  {x:46,y:45,width:244,height:168},{x:671,y:36,width:230,height:155},
  {x:384,y:0,width:180,height:84},{x:256,y:252,width:98,height:83},
  {x:672,y:367,width:152,height:118},
  ...trees.map(([x,y,s])=>({x:x-15*s,y:y-22*s,width:30*s,height:34*s}))
];

function drawAmbient(ctx,time){
  // Gentle chromatic light wash and horizon haze.
  const glow=ctx.createRadialGradient(480,215,20,480,215,440);glow.addColorStop(0,'#67e9e21b');glow.addColorStop(.55,'#b06bf00d');glow.addColorStop(1,'#0b102000');ctx.fillStyle=glow;ctx.fillRect(0,0,WORLD.width,WORLD.height);
  for(let i=0;i<8;i++){
    const x=80+(i*127)%800,y=70+(i*83)%430;
    const pulse=.5+.5*Math.sin(time/370+i*2.1);
    ctx.globalAlpha=.23*pulse;ctx.fillStyle=i%3===0?'#ff8fda':'#70f7e8';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=15;
    ctx.beginPath();ctx.arc(x+Math.sin(time/950+i)*4,y+Math.cos(time/740+i)*3,1.6+pulse,0,Math.PI*2);ctx.fill();
  }ctx.globalAlpha=1;ctx.shadowBlur=0;
  const vignette=ctx.createRadialGradient(CX,280,180,CX,280,520);vignette.addColorStop(0,'#07102100');vignette.addColorStop(1,'#091122a6');ctx.fillStyle=vignette;ctx.fillRect(0,0,WORLD.width,WORLD.height);
}

export function renderWorld(ctx,time,player,residents,zoom=1,parallax={x:0,y:0}){
  ctx.clearRect(0,0,WORLD.width,WORLD.height);
  if(zoom>1){const focus=worldToScreen(player.x,player.y);ctx.save();ctx.beginPath();ctx.rect(0,0,WORLD.width,WORLD.height);ctx.clip();ctx.translate(CX,WORLD.height/2);ctx.scale(zoom,zoom);ctx.translate(-focus.x,-focus.y);}
  drawGround(ctx,time,{x:parallax.x*.22,y:parallax.y*.22});
  drawBuilding(ctx,55,86,220,116,80,{front:'#945f84',side:'#554c7b',top:'#435a8b',trim:'#ffb4e4',glow:'#ff73d5',roof:'#283e72',label:'LUNA · CAFÉ',windows:2,beacon:true},time);
  drawBuilding(ctx,680,64,190,112,70,{front:'#527f82',side:'#394e76',top:'#3d6586',trim:'#87f4de',glow:'#62f3e7',roof:'#2d5478',label:'BLOOM',windows:2},time);
  drawBuilding(ctx,390,8,150,90,58,{front:'#6e6594',side:'#494771',top:'#665d9a',trim:'#d9b5ff',glow:'#bc96ff',roof:'#453f7a',label:'PIXELGEN',windows:1},time);
  drawPond(ctx,736,420,time);
  drawFountain(ctx,320,300,time);
  trees.forEach(([x,y,s])=>drawTree(ctx,x,y,s,time));
  benches.forEach(([x,y])=>drawBench(ctx,x,y));
  [[305,205],[650,226],[569,470],[366,475],[800,322]].forEach(([x,y])=>drawLamp(ctx,x,y,time));
  flowers.forEach(([x,y],i)=>drawFlower(ctx,x,y,i,time));
  // Tiered interactive kiosks create little points of interest on the plaza.
  const kiosk=worldToScreen(620,226,0);ctx.save();ctx.shadowColor='#79e8ff';ctx.shadowBlur=12;
  rounded(ctx,kiosk.x-18,kiosk.y-27,36,29,7,gradient(ctx,kiosk.x-18,kiosk.y-27,kiosk.x+18,kiosk.y+2,'#73569f','#253b68'),'#b8fff5');
  rounded(ctx,kiosk.x-12,kiosk.y-22,24,12,4,'#19263f','#82eee9');ctx.restore();
  ctx.fillStyle='#d5fff4';ctx.font='700 6px system-ui,sans-serif';ctx.textAlign='center';ctx.fillText('INFO',kiosk.x,kiosk.y-14);
  // Sort actors by their ground depth for natural isometric overlap.
  const actors=[...residents.map(a=>({...a,isPlayer:false})),{...player,name:'Sezer',isPlayer:true}].sort((a,b)=>(a.x+a.y)-(b.x+b.y));
  actors.forEach(actor=>drawAvatar(ctx,actor,time,actor.isPlayer));
  drawAmbient(ctx,time);
  if(zoom>1)ctx.restore();
}
