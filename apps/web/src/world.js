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
  for (let y = 0; y < WORLD.height; y += 32) for (let x = 0; x < WORLD.width; x += 32) {
    const index = ((x / 32) * 7 + (y / 32) * 11) % 9;
    const color = index === 0 ? '#4d7a57' : index === 3 ? '#416d53' : '#477454';
    tile(ctx, x, y, color);
    if (index === 4) { box(ctx, x + 7, y + 11, 2, 2, '#8ba66c'); box(ctx, x + 22, y + 25, 2, 2, '#355e49'); }
  }
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
  const bob = actor.moving ? Math.round(Math.sin(time/55)*2) : Math.round(Math.sin(time/280)*1);
  // shadow
  ctx.fillStyle='#203a346c';ctx.beginPath();ctx.ellipse(x,y+6,12,5,0,0,Math.PI*2);ctx.fill();
  // feet
  box(ctx,x-7,y+3+bob,5,5,'#61483e');box(ctx,x+2,y+3-bob,5,5,'#61483e');
  // body
  box(ctx,x-9,y-8+bob,18,13,accent);box(ctx,x-11,y-6+bob,3,8,accent);box(ctx,x+8,y-6+bob,3,8,accent);
  // neck and face
  box(ctx,x-4,y-14+bob,8,5,'#e9bd97');box(ctx,x-8,y-23+bob,16,12,color);box(ctx,x-7,y-24+bob,14,4,'#583f3c');
  box(ctx,x-5,y-18+bob,2,2,'#433a37');box(ctx,x+3,y-18+bob,2,2,'#433a37');
  box(ctx,x-2,y-13+bob,4,1,'#b96e68');
  if (isPlayer) { box(ctx,x-10,y-26+bob,20,3,'#f2c875');box(ctx,x-7,y-28+bob,14,3,'#f2c875'); }
  if (name) {
    ctx.font='600 8px "DM Sans", sans-serif';ctx.textAlign='center';
    const width=ctx.measureText(name).width+12;
    rounded(ctx,x-width/2,y-44+bob,width,14,5,'#182a25dd');
    ctx.fillStyle='#e7f2e8';ctx.fillText(name,x,y-34+bob);
  }
  if(emo){rounded(ctx,x+12,y-40+bob,22,21,8,'#f0dfbdec');ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText(emo,x+23,y-25+bob);}
}

function drawFlower(ctx,x,y,index){
  const petal=['#f2cf78','#e9a8a1','#f3e4c7'][index%3];
  box(ctx,x,y,2,6,'#55885c');box(ctx,x-2,y-2,3,3,petal);box(ctx,x+2,y-2,3,3,petal);box(ctx,x,y-4,3,3,petal);box(ctx,x,y,2,2,'#e7b96e');
}

export function renderWorld(ctx, time, player, residents, effects=[]) {
  ctx.clearRect(0,0,WORLD.width,WORLD.height);
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
  effects.forEach((effect)=>drawAvatar(ctx,{...effect.actor,emo:effect.emoji},time,false));
  // foreground stepping flowers and decorative stones
  ctx.fillStyle='#d4bc8b';ctx.beginPath();ctx.ellipse(226,470,14,5,-.1,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#d4bc8b';ctx.beginPath();ctx.ellipse(666,186,13,4,.2,0,Math.PI*2);ctx.fill();
}
