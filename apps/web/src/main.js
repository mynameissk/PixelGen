import { movePlayer, distance, WORLD } from './game-logic.mjs';
import { OBSTACLES, renderWorld } from './world.js';

const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const player = { x: 476, y: 425, color: '#e1a879', accent: '#9dddb9', hair:'#4b3548', hairHighlight:'#a17678', pants:'#4a6470', speed: 148, radius: 9, moving: false, facing:'down', phase:0 };
const residents = [
  { id:'mina',name:'Mina',x:325,y:333,color:'#d88e78',accent:'#e5c675',hair:'#553d32',hairHighlight:'#a36b4d',pants:'#6c7660',line:'Kafenin kahvesi çok güzel ☕',outfit:'Sarı kazak',phase:.4 },
  { id:'atlas',name:'Atlas',x:586,y:350,color:'#9d735f',accent:'#95c3dc',hair:'#433a3a',hairHighlight:'#746565',pants:'#4e6577',line:'Meydanda buluşalım dediler!',outfit:'Mavi ceket',phase:1.5 },
  { id:'lila',name:'Lila',x:399,y:443,color:'#d89b8a',accent:'#c4a3db',hair:'#48394e',hairHighlight:'#9d79a5',pants:'#665476',line:'Birazdan sahile geçeceğim ✨',outfit:'Lila hırka',phase:2.2 },
  { id:'kaan',name:'Kaan',x:633,y:257,color:'#b8835d',accent:'#de8e6f',hair:'#513d31',hairHighlight:'#9e7049',pants:'#56665c',line:'Selam! Bu meydan çok tatlı.',outfit:'Mercan tişört',phase:2.8 }
];
const keys = new Set();
const palette = { Mina:['#d88e78','#e5c675'], Atlas:['#9d735f','#95c3dc'], Lila:['#d89b8a','#c4a3db'], Kaan:['#b8835d','#de8e6f'], Sezer:['#e1a879','#9dddb9'] };
const chatMessages = document.querySelector('#chat-messages');
const nearbyList = document.querySelector('#nearby-list');
const toast = document.querySelector('#scene-toast');
let lastTime = performance.now();
let lastChatAt = 0;
let toastTimer;
let nextResidentLine = 0;
let moveTarget = null;
let hasMoved = false;

const themeToggle=document.querySelector('#theme-toggle');
function applyTheme(theme,persist=false){
  const next=theme==='light'?'light':'dark';
  document.documentElement.dataset.theme=next;
  const light=next==='light';
  document.querySelector('#theme-icon').textContent=light?'🌙':'☀️';
  themeToggle.setAttribute('aria-label',light?'Koyu temaya geç':'Açık temaya geç');
  themeToggle.title=light?'Açık tema · koyu temaya geç':'Koyu tema · açık temaya geç';
  themeToggle.setAttribute('aria-pressed',String(light));
  if(persist){try{localStorage.setItem('pixelgen-theme',next);}catch{}}
}
let savedTheme=null;
try{savedTheme=localStorage.getItem('pixelgen-theme');}catch{}
const previewTheme=new URLSearchParams(location.search).get('theme');
applyTheme(previewTheme||savedTheme||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'));
themeToggle.addEventListener('click',()=>applyTheme(document.documentElement.dataset.theme==='light'?'dark':'light',true));

const starterMessages = [
  {name:'Mina',text:'Meydan bugün çok huzurlu 🌿',time:'şimdi'},
  {name:'Atlas',text:'Kafeden limonata alan var mı? ☀️',time:'şimdi'},
  {name:'Lila',text:'Selam herkese! 👋',time:'şimdi'}
];

function addChatMessage({name,text,time='şimdi'}) {
  const row=document.createElement('div');row.className='chat-message';
  const avatar=document.createElement('span');avatar.className='chat-avatar';
  const [skin,shirt]=palette[name]||palette.Mina;
  avatar.textContent=name.slice(0,1);avatar.style.background=`linear-gradient(145deg, ${shirt}, ${skin})`;avatar.style.color='#28342c';
  const body=document.createElement('div');body.className='chat-body';
  const nameRow=document.createElement('div');nameRow.className='chat-name-row';
  const label=document.createElement('span');label.className='chat-name';label.textContent=name;
  const stamp=document.createElement('span');stamp.className='chat-time';stamp.textContent=time;
  const message=document.createElement('div');message.className='chat-text';message.textContent=text;
  nameRow.append(label,stamp);body.append(nameRow,message);row.append(avatar,body);chatMessages.append(row);
  while(chatMessages.children.length>35)chatMessages.firstElementChild.remove();
  chatMessages.scrollTop=chatMessages.scrollHeight;
}
starterMessages.forEach(addChatMessage);

function renderNearby() {
  nearbyList.replaceChildren();
  residents.forEach((person)=>{
    const row=document.createElement('div');row.className='nearby-person';row.tabIndex=0;row.setAttribute('role','button');row.setAttribute('aria-label',`${person.name}: selam ver`);
    const avatar=document.createElement('span');avatar.className='person-avatar';avatar.textContent=person.name.slice(0,1);avatar.style.background=`linear-gradient(145deg, ${person.accent}, ${person.color})`;avatar.style.color='#28342c';
    const dot=document.createElement('i');dot.className='online-dot';avatar.append(dot);
    const info=document.createElement('span');info.className='person-info';
    const strong=document.createElement('strong');strong.textContent=person.name;
    const status=document.createElement('span');status.textContent=person.line;
    info.append(strong,status);
    const action=document.createElement('button');action.className='person-action';action.type='button';action.setAttribute('aria-label',`${person.name} oyuncusuna selam ver`);action.textContent='＋';
    action.addEventListener('click',(event)=>{event.stopPropagation();greet(person);});
    row.append(avatar,info,action);row.addEventListener('click',()=>greet(person));
    row.addEventListener('keydown',(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();greet(person);}});
    nearbyList.append(row);
  });
}
renderNearby();

function showToast(message) {
  toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove('show'),2100);
}
function addEmote(emoji,actor=player) {
  const now=performance.now();
  actor.emo=emoji;actor.emoteUntil=now+1400;
  if(emoji==='👋')actor.wavingUntil=now+1100;
  if(emoji==='💃')actor.dancingUntil=now+1500;
  const pop=document.querySelector('#emote-pop');const node=document.createElement('span');node.className='floating-emote';node.textContent=emoji;
  node.style.left=`${Math.max(8,Math.min(92,actor.x/WORLD.width*100))}%`;node.style.top=`${Math.max(7,Math.min(82,actor.y/WORLD.height*100))}%`;pop.append(node);
  setTimeout(()=>node.remove(),1550);
}
function greet(person) {
  const dist=distance(player,person);
  if(dist>155){moveTarget={x:person.x,y:person.y+25,person};showToast(`${person.name} sana yaklaşıyor...`);return;}
  addEmote('👋',person);showToast(`${person.name} selamını aldı!`);
  const quest=document.querySelector('.quest-progress span');quest.style.width='66%';
  document.querySelector('.quest-foot span').textContent='2 / 3 tamamlandı';
}
function interact() {
  const person=[...residents].sort((a,b)=>distance(player,a)-distance(player,b))[0];
  if(person&&distance(player,person)<88){greet(person);return;}
  if(player.x>690&&player.y>385&&player.y<510){showToast('Göletin kenarında biraz dinleniyorsun 🌿');return;}
  if(player.x<270&&player.y<185){showToast('Kafe Luna — bugün özel limonata var! 🍋');return;}
  if(player.x>690&&player.y<190){showToast('Çiçekçide rengârenk buketler var 🌷');return;}
  showToast('Etrafta keşfedilecek çok şey var!');
}

function inputState() {
  return {
    up:keys.has('ArrowUp')||keys.has('w'),down:keys.has('ArrowDown')||keys.has('s'),
    left:keys.has('ArrowLeft')||keys.has('a'),right:keys.has('ArrowRight')||keys.has('d')
  };
}
function update(dt) {
  const input=inputState();
  if(moveTarget){
    const dx=moveTarget.x-player.x,dy=moveTarget.y-player.y,dist=Math.hypot(dx,dy);
    if(dist<7){const who=moveTarget.person;moveTarget=null;if(who)greet(who);}
    else{input.right=dx>6;input.left=dx< -6;input.down=dy>6;input.up=dy< -6;}
  }
  const wasMoving=player.moving;
  if(input.left)player.facing='left';else if(input.right)player.facing='right';else if(input.up)player.facing='up';else if(input.down)player.facing='down';
  Object.assign(player,movePlayer(player,input,dt,OBSTACLES));
  player.emo=performance.now()<player.emoteUntil?player.emo:'';
  if(player.moving&&!wasMoving&&!hasMoved){hasMoved=true;document.querySelector('#world-hint').style.opacity='0';}
  if(player.moving)moveTarget=null;
  residents.forEach((person,index)=>{
    person.emo=performance.now()<person.emoteUntil?person.emote:'';
    if(performance.now()>person.nextMove){person.nextMove=performance.now()+2800+index*900;person.targetX=person.x+(Math.random()-.5)*24;person.targetY=person.y+(Math.random()-.5)*16;}
    if(person.targetX!=null){const dx=person.targetX-person.x,dy=person.targetY-person.y,dist=Math.hypot(dx,dy);if(dist>1){person.moving=true;person.facing=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');person.x+=dx/dist*.13;person.y+=dy/dist*.13;}else{person.moving=false;person.targetX=null;}}
  });
}
function frame(now) {
  const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;update(dt);
  const zoom=window.matchMedia('(max-width: 700px)').matches?1.28:1;
  renderWorld(ctx,now,player,residents,zoom);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

window.addEventListener('keydown',(event)=>{
  const key=event.key.toLowerCase();
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key)&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName))event.preventDefault();
  keys.add(key);
  if(key==='e'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName))interact();
  if(key==='enter'&&document.activeElement.id!=='chat-input'){event.preventDefault();document.querySelector('#chat-input').focus();}
  if(key==='escape')document.querySelector('#chat-input').blur();
});
window.addEventListener('keyup',(event)=>keys.delete(event.key.toLowerCase()));
window.addEventListener('blur',()=>keys.clear());

canvas.addEventListener('pointerdown',(event)=>{
  const rect=canvas.getBoundingClientRect();const x=(event.clientX-rect.left)/rect.width*WORLD.width;const y=(event.clientY-rect.top)/rect.height*WORLD.height;
  const zoom=window.matchMedia('(max-width: 700px)').matches?1.28:1;
  const worldX=zoom>1?player.x+(x-WORLD.width/2)/zoom:x;
  const worldY=zoom>1?player.y+(y-WORLD.height/2)/zoom:y;
  const hit=[...residents].reverse().find((person)=>Math.abs(person.x-worldX)<20&&Math.abs(person.y-12-worldY)<28);
  if(hit){greet(hit);return;}
  moveTarget={x:worldX,y:worldY};
});

document.querySelectorAll('[data-emote]').forEach((button)=>button.addEventListener('click',()=>{
  const emoji=button.dataset.emote;addEmote(emoji);showToast(emoji==='👋'?'Meydana selam gönderdin!':'Emoten havalı görünüyor!');
}));
document.querySelector('#greet-button').addEventListener('click',()=>{
  const person=[...residents].sort((a,b)=>distance(player,a)-distance(player,b))[0];greet(person);
});
document.querySelector('#chat-form').addEventListener('submit',(event)=>{
  event.preventDefault();const input=document.querySelector('#chat-input');const text=input.value.trim();
  if(!text)return;if(text.length>160)return;
  const now=Date.now();if(now-lastChatAt<800){showToast('Biraz yavaşla, mesajını az sonra gönder.');return;}
  lastChatAt=now;addChatMessage({name:'Sezer',text,time:'şimdi'});input.value='';
});

document.querySelectorAll('[data-section]').forEach((button)=>button.addEventListener('click',()=>showToast(`${button.dataset.section} yakında PixelGen'e geliyor.`)));
document.querySelectorAll('[data-mobile]').forEach((button)=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-mobile]').forEach((item)=>item.classList.remove('active'));button.classList.add('active');
  if(button.dataset.mobile==='Sohbet'&&window.matchMedia('(max-width: 700px)').matches)document.querySelector('#chat-input').focus();
  else if(button.dataset.mobile!=='Dünya')showToast(`${button.dataset.mobile} bölümü sıradaki modüllerde açılacak.`);
}));
document.querySelector('#fullscreen-button').addEventListener('click',async()=>{
  try{if(!document.fullscreenElement)await document.querySelector('.game-frame').requestFullscreen();else await document.exitFullscreen();}catch{showToast('Tam ekran bu tarayıcıda kullanılamıyor.');}
});
document.querySelector('#map-button').addEventListener('click',()=>showToast('Meydan haritası: Kafe Luna · Çiçekçi · Gölet'));
document.querySelector('#notifications-button').addEventListener('click',()=>showToast('Şimdilik yeni bildirimin yok.'));
document.querySelector('#wallet-button').addEventListener('click',()=>showToast('Demo cüzdan: 1.250 Coin'));
document.querySelector('#all-players-button').addEventListener('click',()=>showToast('Meydanda 24 oyuncu var · demo prototipte 4 kişi gösteriliyor.'));
document.querySelector('#chat-menu-button').addEventListener('click',()=>showToast('Sohbet güvenliği ve raporlama sonraki modülde.'));
document.querySelector('#help-button').addEventListener('click',()=>showToast('WASD / ok tuşlarıyla yürü · E ile etkileş · Enter ile sohbete geç.'));
