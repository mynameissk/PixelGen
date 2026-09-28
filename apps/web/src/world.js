import { WORLD } from './game-logic.mjs';

const colors = {
  grass: '#477454', grassLight: '#5c8a60', grassDark: '#345c49', path: '#c6a47a', pathLight: '#d3b48b',
  pathDark: '#9b7b61', water: '#4c9d9e', waterLight: '#8bd0bd', stone: '#567064', ink: '#233b35',
  cream: '#f2d9aa', coral: '#e88767', mint: '#96dbb2', plum: '#8f789d'
};

const trees = [
  [55, 198, 1.0], [112, 520, .9], [287, 95, .72], [332, 531, .78], [811, 508, .96], [908, 394, .88],
  [770, 195, .74], [192, 353, .64], [680, 535, .68], [879, 94, .76]
];

const flowers = [[83,284],[93,299],[138,450],[835,280],[860,294],[726,500],[244,524],[903,477],[318,122],[610,522]];

function box(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function tile(ctx, x, y, color) {
  box(ctx, x, y, 32, 32, color);
  box(ctx, x, y + 31, 32, 1, '#355b4b44');
  box(ctx, x + 31, y, 1, 32, '#355b4b30');
}
function rounded(ctx, x, y, w, h, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); }

function drawGround(ctx) {
  box(ctx, 0, 0, WORLD.width, WORLD.height, colors.grass);
  // Irregular grass flecks replace the prototype's heavy checkerboard.
  for (let i=0;i<190;i++) {
    const seed=i*7919+17;
    const x=(seed*37)%WORLD.width;
    const y=(seed*61)%WORLD.height;
    const size=2+(seed%4);
    const shade=seed%5===0?'#7c9a63':seed%3===0?'#3d694e':'#56805a';
    box(ctx,x,y,size,size>3?2:1,shade);
    if(i%7===0)box(ctx,x+size+1,y-1,2,2,'#96ab6c');
  }
  // Quiet, translucent foliage shadows give the lawn more depth.
  ctx.globalAlpha=.14;
  [[108,181,88,28],[812,332,95,32],[138,488,106,26],[704,522,118,23]].forEach(([x,y,w,h])=>{
    ctx.fillStyle='#203d37';ctx.beginPath();ctx.ellipse(x,y,w/2,h/2,0,0,Math.PI*2);ctx.fill();
  });
  ctx.globalAlpha=1;
  // Main plaza path with a softly bordered cross layout.
  rounded(ctx, 185, 210, 590, 255, 15, '#44624f');
  rounded(ctx, 192, 217, 576, 241, 13, colors.pathDark);
  rounded(ctx, 198, 223, 564, 229, 11, colors.path);
  rounded(ctx, 423, 91, 112, 416, 11, '#9c8062');
  rounded(ctx, 429, 92, 100, 414, 10, '#d0ae80');
  rounded(ctx, 303, 289, 359, 94, 10, '#a18769');
  rounded(ctx, 308, 294, 349, 84, 8, '#d4b58a');
  // Paving seams and occasional inlaid stones.
  for (let x = 210; x < 755; x += 48) { box(ctx, x, 224, 1, 227, '#97785d30'); box(ctx, x, 296, 1, 80, '#997d6240'); }
  for (let y = 245; y < 450; y += 42) { box(ctx, 199, y, 563, 1, '#90745622'); }
  [[276,247],[721,424],[365,426],[588,246],[382,267],[645,420]].forEach(([x,y],i) => {
    box(ctx, x, y, 7, 4, i % 2 ? '#e1c599' : '#b59775');
    box(ctx, x + 2, y + 1, 3, 1, '#eed3a4');
  });
  // A small pond garden in the lower right.
  rounded(ctx, 695, 393, 156, 119, 19, '#355e4b');
  rounded(ctx, 703, 399, 144, 105, 17, '#387e79');
  rounded(ctx, 713, 407, 124, 89, 15, colors.water);
  rounded(ctx, 729, 419, 84, 7, 4, '#91d6bf');
  rounded(ctx, 753, 450, 47, 5, 3, '#7ac5b7');
  // Lily pads.
  ctx.fillStyle = '#a1d39b'; ctx.beginPath(); ctx.arc(730, 466, 8, .2, Math.PI * 1.7); ctx.lineTo(730,466); ctx.fill();
  ctx.fillStyle = '#b1dda0'; ctx.beginPath(); ctx.arc(817, 477, 6, .3, Math.PI * 1.7); ctx.lineTo(817,477); ctx.fill();
}

function drawBuilding(ctx, x, y, w, h, options) {
  const { wall, roof, sign, label, windows = 2 } = options;
  // soft shadow, walls, roof cap, striped awning
  box(ctx, x + 7, y + h - 1, w, 11, '#203f39');
  box(ctx, x, y + 15, w, h - 15, wall);
  box(ctx, x - 4, y + 12, w + 8, 11, '#e8d5ae');
  box(ctx, x + 5, y, w - 10, 16, roof);
  box(ctx, x + 12, y + 4, w - 24, 3, '#ffffff32');
  box(ctx, x + 7, y + 22, w - 14, 3, '#2b4b42');
  // windows
  for (let i=0;i<windows;i++) {
    const wx = x + 16 + i * ((w - 43) / Math.max(1,windows - 1));
    box(ctx, wx, y + 38, 23, 26, '#5e9b95');
    box(ctx, wx + 3, y + 3 + 38, 17, 3, '#b5e2c5');
    box(ctx, wx + 10, y + 38, 2, 26, '#e4d4ab');
    box(ctx, wx, y + 62, 23, 3, '#b18a62');
  }
  // door and little step
  box(ctx, x + w/2 - 11, y + h - 39, 22, 39, '#704b3e');
  box(ctx, x + w/2 - 7, y + h - 35, 14, 31, '#b67b55');
  box(ctx, x + w/2 + 5, y + h - 21, 2, 2, '#f1ce7d');
  box(ctx, x + w/2 - 15, y + h, 30, 5, '#d7be91');
  // sign
  rounded(ctx, x + w/2 - 38, y + 20, 76, 16, 4, sign);
  ctx.fillStyle = '#283a34'; ctx.font = 'bold 8px "DM Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(label, x + w/2, y + 31);
  // planter accents
  box(ctx, x + 10, y + h - 16, 13, 9, '#a66f4c'); box(ctx, x + 11, y + h - 22, 11, 8, '#6a9c65');
  box(ctx, x + w - 23, y + h - 16, 13, 9, '#a66f4c'); box(ctx, x + w - 22, y + h - 22, 11, 8, '#79a76a');
}

function drawTree(ctx, x, y, scale=1) {
  const s = scale;
  box(ctx, x - 3*s, y + 7*s, 10*s, 19*s, '#805c46');
  box(ctx, x - 13*s, y - 12*s, 30*s, 20*s, '#2f614c');
  box(ctx, x - 10*s, y - 22*s, 25*s, 18*s, '#3f7955');
  box(ctx, x - 3*s, y - 27*s, 14*s, 13*s, '#58875b');
  box(ctx, x - 5*s, y - 18*s, 5*s, 5*s, '#90b66c');
  box(ctx, x + 8*s, y - 8*s, 4*s, 4*s, '#9bb968');
  box(ctx, x - 9*s, y + 10*s, 24*s, 3*s, '#2d4e40');
}

function drawBench(ctx, x, y) {
  box(ctx, x + 2, y + 13, 29, 4, '#5e5142');
  box(ctx, x, y + 5, 33, 7, '#bd8053');
  box(ctx, x + 2, y + 6, 29, 2, '#e1aa6e');
  box(ctx, x + 4, y + 14, 3, 9, '#79604a'); box(ctx, x + 26, y + 14, 3, 9, '#79604a');
}

function drawFountain(ctx, time) {
  // stepping stones and low basin
  ctx.fillStyle='#a58b6c'; ctx.beginPath(); ctx.ellipse(481,275,68,47,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#d1b58b'; ctx.beginPath(); ctx.ellipse(481,269,61,43,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#408b87'; ctx.beginPath(); ctx.ellipse(481,266,48,31,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#70bab0'; ctx.beginPath(); ctx.ellipse(481,263,38,24,0,0,Math.PI*2); ctx.fill();
  box(ctx, 462, 245, 38, 17, '#d0b58d');
  box(ctx, 468, 237, 26, 10, '#9a866d');
  box(ctx, 473, 227, 16, 12, '#e5d1a5');
  box(ctx, 479, 215, 4, 16 + Math.round(Math.sin(time/350)*3), '#98d6bd');
  box(ctx, 474, 226, 3, 7, '#b0e3ca');
  // dots of water sparkle
  box(ctx, 450, 266, 3, 2, '#c6eee1'); box(ctx, 504, 275, 3, 2, '#bce9dc');
}

export const OBSTACLES = [
  {x:31,y:37,width:193,height:112}, {x:692,y:41,width:201,height:124},
  {x:385,y:17,width:150,height:72}, {x:420,y:211,width:122,height:96},
  {x:704,y:396,width:139,height:92},
  ...trees.map(([x,y,s])=>({x:x-12*s,y:y-23*s,width:29*s,height:39*s}))
];

function drawAvatar(ctx, actor, time, isPlayer=false) {
  const {x,y,color='#dc8d76',accent='#b9e5be',name='',emo=''}=actor;
  const phase=Math.floor(time/125)%4;
  const gait=actor.moving?[0,2,0,-2][phase]:0;
  const idle=Math.round(Math.sin(time/310+(actor.phase||0))*.8);
  const dance=actor.dancingUntil>time;
  const wave=actor.wavingUntil>time;
  const sway=dance?Math.round(Math.sin(time/90)*2):0;
  const bob=actor.moving?[0,-1,0,1][phase]:idle;
  const skin=actor.color||'#dc8d76';
  const hair=actor.hair||'#51404a';
  const shirt=actor.accent||'#b9e5be';
  const pants=actor.pants||'#526477';
  const outline='#493d3b';
  const facing=actor.facing||'down';
  const eyeShift=facing==='left'?-2:facing==='right'?2:0;

  ctx.save();
  ctx.translate(sway,0);
  // Ground shadow softly breathes with the idle/walk cycle.
  ctx.fillStyle='#203a3480';ctx.beginPath();ctx.ellipse(x,y+5,actor.moving?11:12,4,0,0,Math.PI*2);ctx.fill();

  // Shoes and two independently animated legs.
  const leftStep=actor.moving?gait:0;
  const rightStep=actor.moving?-gait:0;
  box(ctx,x-7,y-3+leftStep,5,8,pants);box(ctx,x+2,y-3+rightStep,5,8,pants);
  box(ctx,x-8,y+3+leftStep,7,4,'#f0dfc8');box(ctx,x+1,y+3+rightStep,7,4,'#f0dfc8');
  box(ctx,x-8,y+5+leftStep,7,2,'#9b745d');box(ctx,x+1,y+5+rightStep,7,2,'#9b745d');

  // Neck, jacket silhouette, sleeves, and small stitched highlights.
  box(ctx,x-4,y-22+bob,8,7,'#bd8874');
  box(ctx,x-10,y-19+bob,20,18,outline);
  box(ctx,x-8,y-18+bob,16,15,shirt);
  box(ctx,x-12,y-17+bob,5,10,outline);box(ctx,x+7,y-17+bob,5,10,outline);
  box(ctx,x-11,y-16+bob,4,8,shirt);box(ctx,x+7,y-16+bob,4,8,shirt);
  box(ctx,x-12,y-9+bob,4,4,skin);box(ctx,x+8,y-9+bob,4,4,skin);
  box(ctx,x-7,y-17+bob,4,3,'#ffffff3d');box(ctx,x+3,y-17+bob,3,2,'#ffffff35');
  box(ctx,x-7,y-5+bob,14,2,'#344f48');
  box(ctx,x-2,y-14+bob,2,2,'#f4e4bd');box(ctx,x-2,y-9+bob,2,2,'#f4e4bd');

  // Head with ears, layered hair, expressive eyes, blush, and an individual part.
  box(ctx,x-10,y-39+bob,20,17,outline);
  box(ctx,x-9,y-38+bob,18,15,skin);
  box(ctx,x-12,y-33+bob,3,5,skin);box(ctx,x+9,y-33+bob,3,5,skin);
  box(ctx,x-10,y-40+bob,20,6,hair);
  box(ctx,x-12,y-38+bob,4,9,hair);box(ctx,x+8,y-38+bob,4,7,hair);
  box(ctx,x-8,y-41+bob,13,3,actor.hairHighlight||'#806275');
  box(ctx,x-7+eyeShift,y-31+bob,3,3,'#382f35');
  box(ctx,x+4+eyeShift,y-31+bob,3,3,'#382f35');
  box(ctx,x-6+eyeShift,y-31+bob,1,1,'#fff1dc');box(ctx,x+5+eyeShift,y-31+bob,1,1,'#fff1dc');
  box(ctx,x-7,y-26+bob,3,1,'#d88883');box(ctx,x+5,y-26+bob,3,1,'#d88883');
  box(ctx,x-2,y-24+bob,4,1,'#a75e62');
  // Player signature headband; residents get small, distinct hair clips.
  if(isPlayer){
    box(ctx,x-10,y-38+bob,20,3,'#f1c96d');box(ctx,x+4,y-38+bob,5,3,'#fff0a6');
    box(ctx,x-2,y-37+bob,4,2,'#fff0a6');
  } else {
    box(ctx,x+5,y-37+bob,3,3,actor.clip||'#f2cc78');
  }

  // Four-frame walk cycle swings arms; emotes lift an arm instead.
  if(wave){
    box(ctx,x-13,y-20+bob,4,10,shirt);box(ctx,x-16,y-25+bob,4,7,skin);
    box(ctx,x-17,y-27+bob,5,2,'#fff0d7');
  } else if(dance) {
    const lift=Math.round(Math.sin(time/100)*2);
    box(ctx,x-14,y-23+bob+lift,4,9,shirt);box(ctx,x-16,y-27+bob+lift,4,5,skin);
    box(ctx,x+10,y-22+bob-lift,4,9,shirt);box(ctx,x+12,y-26+bob-lift,4,5,skin);
  } else {
    box(ctx,x-12,y-17+bob+gait,4,9,shirt);box(ctx,x+8,y-17+bob-gait,4,9,shirt);
    box(ctx,x-12,y-9+bob+gait,4,4,skin);box(ctx,x+8,y-9+bob-gait,4,4,skin);
  }

  if(dance){
    const sparkle=(Math.floor(time/160)%2)===0?'✦':'·';
    ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillStyle='#ffe28a';
    ctx.fillText(sparkle,x+18,y-36+bob);
  }
  if(name){
    ctx.font='600 10px system-ui, sans-serif';ctx.textAlign='center';
    const width=ctx.measureText(name).width+14;
    rounded(ctx,x-width/2,y-57+bob,width,16,5,'#182a25ed');
    box(ctx,x-width/2+5,y-53+bob,3,3,isPlayer?'#f1c96d':'#9fe0b5');
    ctx.fillStyle='#e7f2e8';ctx.fillText(name,x+2,y-45+bob);
  }
  if(emo){
    rounded(ctx,x+13,y-52+bob,27,24,8,'#f8efd8');
    box(ctx,x+15,y-32+bob,5,4,'#f8efd8');
    ctx.font='15px sans-serif';ctx.textAlign='center';ctx.fillText(emo,x+27,y-35+bob);
  }
  ctx.restore();
}

function drawFlower(ctx,x,y,index){
  const petal=['#f2cf78','#e9a8a1','#f3e4c7'][index%3];
  box(ctx,x,y,2,6,'#55885c');box(ctx,x-2,y-2,3,3,petal);box(ctx,x+2,y-2,3,3,petal);box(ctx,x,y-4,3,3,petal);box(ctx,x,y,2,2,'#e7b96e');
}

export function renderWorld(ctx, time, player, residents, zoom=1) {
  ctx.clearRect(0,0,WORLD.width,WORLD.height);
  if(zoom>1){
    ctx.save();
    ctx.beginPath();ctx.rect(0,0,WORLD.width,WORLD.height);ctx.clip();
    ctx.translate(WORLD.width/2,WORLD.height/2);
    ctx.scale(zoom,zoom);
    ctx.translate(-player.x,-player.y);
  }
  drawGround(ctx);
  drawBuilding(ctx,43,44,183,108,{wall:'#d9b883',roof:'#b66e55',sign:'#f2d9aa',label:'KAFE LUNA',windows:2});
  drawBuilding(ctx,704,47,181,109,{wall:'#b6c89b',roof:'#6c8c68',sign:'#e9d8ac',label:'ÇİÇEKÇİ',windows:2});
  drawBuilding(ctx,389,17,143,68,{wall:'#d5b48a',roof:'#557c6e',sign:'#ede1bc',label:'MEYDAN',windows:1});
  drawFountain(ctx,time);
  trees.forEach(([x,y,s])=>drawTree(ctx,x,y,s));
  flowers.forEach(([x,y],i)=>drawFlower(ctx,x,y,i));
  drawBench(ctx,323,223);drawBench(ctx,588,324);drawBench(ctx,267,410);
  // lamp posts
  [[286,221],[652,240],[561,416],[361,416]].forEach(([x,y])=>{box(ctx,x,y,3,23,'#5b5140');box(ctx,x-4,y-3,11,5,'#e4c57e');box(ctx,x-2,y-5,7,3,'#f8e5a4');});
  // tiny market table
  box(ctx,606,201,36,20,'#986d4d');box(ctx,601,197,46,6,'#d78b63');box(ctx,608,192,8,7,'#e8c270');box(ctx,621,191,9,8,'#9ec77c');
  // Sorted draw order gives simple depth.
  const actors=[...residents.map((a)=>({...a,isPlayer:false})),{...player,name:'Sezer',isPlayer:true}].sort((a,b)=>a.y-b.y);
  actors.forEach((actor)=>drawAvatar(ctx,actor,time,actor.isPlayer));
  // foreground stepping flowers and decorative stones
  ctx.fillStyle='#d4bc8b';ctx.beginPath();ctx.ellipse(226,470,14,5,-.1,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#d4bc8b';ctx.beginPath();ctx.ellipse(666,186,13,4,.2,0,Math.PI*2);ctx.fill();
  if(zoom>1)ctx.restore();
}
