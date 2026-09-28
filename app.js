
const TILE_SCORES = {
'A':2, 'B':4, 'C':5, 'Ç':5, 'D':4, 'E':2, 'F':8, 'G':6, 'Ğ':9, 'H':6, 'I':3,
'İ':2, 'J':11, 'K':2, 'L':2, 'M':3, 'N':2, 'O':3, 'Ö':8, 'P':6, 'R':2, 'S':3,
'Ş':5, 'T':2, 'U':3, 'Ü':4, 'V':8, 'Y':4, 'Z':5
};
let WORD_DB_FC='';
let WORD_LIST=[];
;
// Küfür/argo filtresi: bu sözcükler Sözlük ekranında gösterilmez ve oyun için geçerli sayılmaz.
// Kökler özellikle dar tutulur; "götürmek", "bisiklet", "amaç" gibi masum sözcükler yanlış eşleşmez.
const ARGO_EXACT = new Set(['AM','GÖT','YARAK','TAŞAK','TAŞAKLI','ÇÜK','SİK','SİKME','SİKMEK']);
const ARGO_PREFIXES = ['OROSPU','PEZEVENK','KAHPE','İBNE','PUŞT','SÜRTÜK','KALTAK','DALYARAK','PİÇ','SİKTİR','AMCIK','AMINA','YARRAK','GÖTVEREN','SIÇMA','SIÇTIR'];
function isArgoWord(word){
const w=String(word||'').toLocaleUpperCase('tr-TR');
if(ARGO_EXACT.has(w)) return true;
for(const root of ARGO_PREFIXES) if(w.startsWith(root)) return true;
return w.startsWith('BOK') && !w.startsWith('BOKS') && !w.startsWith('BOKSİT');
}
// Bariz İngilizce/yabancı girişler. Türkçede yerleşmiş ortak sözcükleri yanlışlıkla silmemek için tam eşleşme dar tutulur.
const FOREIGN_EXACT = new Set(['ASK','CHANGE','CHAT','RUN','TALK']);
const TURKISH_WORD_CHARS = /^[ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ]+$/;
function isForeignWord(word){
const w=String(word||'').toLocaleUpperCase('tr-TR');
return !TURKISH_WORD_CHARS.test(w) || FOREIGN_EXACT.has(w);
}
// v298: 2–9 harfli Türkiye il/ilçe adları ve ülke adları oyun sözlüğüne dahildir.
// Yer adlarının açıklamaları TDK özel ad maddesine bağlı kalmadan sonuç/sözlük ekranında yerel olarak gösterilir.
let GEO_DICTIONARY=Object.freeze({});
let GEO_WORD_LIST=[];
let GAME_WORD_LIST=[];
let GAME_WORD_SET=new Set();
const TILE_SCORE_CACHE = Object.freeze({...TILE_SCORES});
const GAME_WORDS_BY_LENGTH = new Map();
let wordDataReady=false;
let wordDataPromise=null;

function initializeWordData(data){
if(wordDataReady) return true;
if(!data || typeof data.WORD_DB_FC!=='string' || !data.GEO_DICTIONARY) throw new Error('word-data-invalid');
WORD_DB_FC=data.WORD_DB_FC;
const out=[];
let prev='';
for(const row of WORD_DB_FC.split('\n')){
  if(!row) continue;
  const prefixLen=parseInt(row[0],36);
  const word=prev.slice(0,prefixLen)+row.slice(1);
  out.push(word); prev=word;
}
WORD_LIST=out;
GEO_DICTIONARY=data.GEO_DICTIONARY;
GEO_WORD_LIST=Object.keys(GEO_DICTIONARY);
GAME_WORD_LIST=Array.from(new Set([...WORD_LIST,...GEO_WORD_LIST]))
  .filter(w=>w.length>=2&&w.length<=9&&!isArgoWord(w)&&!isForeignWord(w)).sort();
GAME_WORD_SET=new Set(GAME_WORD_LIST);
GAME_WORDS_BY_LENGTH.clear();
for(const w of GAME_WORD_LIST){
  if(!GAME_WORDS_BY_LENGTH.has(w.length)) GAME_WORDS_BY_LENGTH.set(w.length,[]);
  GAME_WORDS_BY_LENGTH.get(w.length).push(w);
}
rebuildBoardWordPools();
DICT_BY_LETTER=null;
wordDataReady=true;
return true;
}
function ensureWordDataLoaded(){
if(wordDataReady) return Promise.resolve(true);
if(wordDataPromise) return wordDataPromise;
wordDataPromise=new Promise((resolve,reject)=>{
  const finish=()=>{
    try{
      initializeWordData(window.KAPMACA_WORD_DATA);
      try{delete window.KAPMACA_WORD_DATA;}catch(_){}
      resolve(true);
    }catch(e){wordDataPromise=null;reject(e);}
  };
  if(window.KAPMACA_WORD_DATA){finish();return;}
  const script=document.createElement('script');
  script.src='word-data.js?v=343';
  script.async=true;
  script.onload=finish;
  script.onerror=()=>{wordDataPromise=null;reject(new Error('word-data-load-failed'));};
  document.head.appendChild(script);
});
return wordDataPromise;
}

function hasWordPrefix(prefix) {
let lo = 0, hi = GAME_WORD_LIST.length;
while (lo < hi) {
const mid = (lo + hi) >> 1;
if (GAME_WORD_LIST[mid] < prefix) lo = mid + 1; else hi = mid;
}
return lo < GAME_WORD_LIST.length && GAME_WORD_LIST[lo].startsWith(prefix);
}

const TURKISH_ALPHABET = ['A','B','C','Ç','D','E','F','G','Ğ','H','I','İ','J','K','L','M','N','O','Ö','P','R','S','Ş','T','U','Ü','V','Y','Z'];
let DICT_BY_LETTER = null;
let DICT_SORTED = false;
function ensureDictionaryIndex() {
if (DICT_BY_LETTER) return;
DICT_BY_LETTER = Object.fromEntries(TURKISH_ALPHABET.map(l => [l, []]));
for (const w of GAME_WORD_LIST) if (DICT_BY_LETTER[w[0]]) DICT_BY_LETTER[w[0]].push(w);
}

const AVATARS = [
{ id: 'av_1', name: '1. Oyuncu', border: 'border-amber-400 bg-amber-50 text-amber-700 shadow-md ring-2 ring-amber-300', icon: '👑' },
{ id: 'av_2', name: '2. Oyuncu', border: 'border-sky-400 bg-sky-50 text-sky-700 shadow-md ring-2 ring-sky-300', icon: '⚔️' }
];

let chosenAvatarId = 'av_1';
let p1Score = 0, p2Score = 0;
const roundWordResults = { p1:new Map(), p2:new Map() };
const seriesWordResults = { p1:new Map(), p2:new Map() };
let singleLongestBonusApplied=false;
let singleLongestBonus={p1:false,p2:false,maxLen:0};
function clearPlayerWordShake(){
['p1-player-card','p2-player-card'].forEach(id=>{
const el=document.getElementById(id);
if(!el) return;
if(el._wordShakeAnim){ el._wordShakeAnim.cancel(); el._wordShakeAnim=null; }
el.style.transform='';
});
}
function spawnWinnerCardParty(cardId,tone='amber'){
const card=document.getElementById(cardId); if(!card) return;
card.querySelectorAll('.result-card-party').forEach(el=>el.remove());
const wrap=document.createElement('div'); wrap.className='result-card-party';
const colors=tone==='sky'?['#38bdf8','#0ea5e9','#bae6fd','#ffffff']:['#fbbf24','#f59e0b','#fde68a','#ffffff'];
for(let i=0;i<9;i++){
const part=document.createElement('i');
part.style.left=`${5+Math.random()*90}%`;
part.style.background=colors[i%colors.length];
part.style.setProperty('--dx',`${Math.round((Math.random()-.5)*26)}px`);
part.style.setProperty('--dy',`${24+Math.round(Math.random()*38)}px`);
part.style.setProperty('--rot',`${Math.round((Math.random()-.5)*420)}deg`);
part.style.setProperty('--dur',`${1.05+Math.random()*0.6}s`);
wrap.appendChild(part);
}
card.appendChild(wrap);
setTimeout(()=>wrap.remove(),1900);
}
function celebrateWordPlayer(isP1,wordLen=0){
const ids=isP1?['p1-player-card']:['p2-player-card'];
const frames=[
{transform:'translate3d(0,0,0)'},
{transform:'translate3d(-2px,0,0)'},
{transform:'translate3d(2px,0,0)'},
{transform:'translate3d(-1px,0,0)'},
{transform:'translate3d(1px,0,0)'},
{transform:'translate3d(0,0,0)'}
];
ids.forEach(id=>{
const el=document.getElementById(id); if(!el) return;
if(el._wordShakeAnim) el._wordShakeAnim.cancel();
if(typeof el.animate==='function'){
const anim=el.animate(frames,{duration:300,easing:'ease-out',iterations:1});
el._wordShakeAnim=anim;
anim.onfinish=anim.oncancel=()=>{ if(el._wordShakeAnim===anim) el._wordShakeAnim=null; };
}else{
el.classList.remove('longest-player-shake');
requestAnimationFrame(()=>{el.classList.add('longest-player-shake');setTimeout(()=>el.classList.remove('longest-player-shake'),340);});
}
});
}
function resetMatchWordResults(){ roundWordResults.p1.clear(); roundWordResults.p2.clear(); clearPlayerWordShake(); }
function resetSeriesWordResults(){ seriesWordResults.p1.clear(); seriesWordResults.p2.clear(); singleLongestBonusApplied=false; singleLongestBonus={p1:false,p2:false,maxLen:0}; }
function recordMatchWord(word, pts, isP1){
const w=String(word||'').toLocaleUpperCase('tr-TR');
if(!w) return;
const roundMap=isP1?roundWordResults.p1:roundWordResults.p2;
const isNew=!roundMap.has(w);
if(isNew) roundMap.set(w,{word:w,pts:Number(pts)||0});
const seriesMap=isP1?seriesWordResults.p1:seriesWordResults.p2;
const key=w;
if(!seriesMap.has(key)) seriesMap.set(key,{word:w,pts:Number(pts)||0});
if(isNew) celebrateWordPlayer(isP1,w.length);
}
function sortedTopScoreWords(isP1){
return Array.from((isP1?seriesWordResults.p1:seriesWordResults.p2).values())
.sort((a,b)=>b.pts-a.pts || b.word.length-a.word.length || a.word.localeCompare(b.word,'tr')).slice(0,5);
}
function renderGameoverWordLists(){
const draw=(id,items,tone)=>{
const el=document.getElementById(id); if(!el) return;
el.innerHTML='';
if(!items.length){el.innerHTML='<div class="text-center text-[9px] font-bold text-slate-400 py-2">—</div>';return;}
const frag=document.createDocumentFragment();
items.forEach((x,i)=>{
  const entry=document.createElement('div');
  entry.className=`rounded-lg ${tone==='amber'?'bg-white/75 text-amber-950':'bg-white/75 text-sky-950'}`;
  const button=document.createElement('button');
  button.type='button';
  button.className=`w-full flex items-center justify-between gap-1 px-2 py-1.5 text-left cursor-pointer rounded-lg border-2 shadow-sm transition ${tone==='amber'?'border-amber-300 bg-amber-50 hover:bg-amber-100':'border-sky-300 bg-sky-50 hover:bg-sky-100'}`;
  button.title=`${x.word} anlamını göster`;
  button.setAttribute('aria-expanded','false');
  const word=document.createElement('span');
  word.className='truncate text-[12px] font-black';
  word.innerHTML=`<span class="opacity-50 mr-1">${i+1}.</span>`;
  word.append(document.createTextNode(x.word));
  const pts=document.createElement('span');
  pts.className='shrink-0 text-[11px] font-black';
  pts.textContent=`+${x.pts}`;
  const meaning=document.createElement('div');
  meaning.className='dict-inline-meaning hidden mx-2 mb-2 text-left';
  meaning.setAttribute('aria-live','polite');
  button.append(word,pts);
  button.onclick=()=>{
    const opening=meaning.classList.contains('hidden') || dictMeaningOpenHost!==meaning;
    showDictionaryMeaning(x.word,meaning);
    button.setAttribute('aria-expanded',opening?'true':'false');
  };
  entry.append(button,meaning);
  frag.appendChild(entry);
});
el.appendChild(frag);
};
draw('final-p1-words',sortedTopScoreWords(true),'amber');
draw('final-p2-words',sortedTopScoreWords(false),'sky');
}
function setLongestBonusBadges(p1,p2){
const a=document.getElementById('final-p1-longest-bonus'),b=document.getElementById('final-p2-longest-bonus');
if(a)a.style.display=p1?'inline-block':'none';
if(b)b.style.display=p2?'inline-block':'none';
}
function applySingleLongestWordBonus(){
if(singleLongestBonusApplied) return singleLongestBonus;
singleLongestBonusApplied=true;
const a=Array.from(roundWordResults.p1.values()),b=Array.from(roundWordResults.p2.values());
const max1=a.reduce((m,x)=>Math.max(m,x.word.length),0),max2=b.reduce((m,x)=>Math.max(m,x.word.length),0),maxLen=Math.max(max1,max2);
if(maxLen>0){
if(max1===maxLen){p1Score+=10;singleLongestBonus.p1=true;}
if(max2===maxLen){p2Score+=10;singleLongestBonus.p2=true;}
singleLongestBonus.maxLen=maxLen; updateScores();
}
return singleLongestBonus;
}

function isFullscreenActive(){
return !!(document.fullscreenElement || document.webkitFullscreenElement);
}
function updateFullscreenUi(){
const active=isFullscreenActive();
const label=document.getElementById('fullscreen-label');
if(label) label.textContent=active?'TAM EKRANDAN ÇIK':'TAM EKRAN';
const gameLabel=document.getElementById('fullscreen-game-label');
if(gameLabel) gameLabel.textContent=active?'TAM EKRANDAN ÇIK':'TAM EKRAN';
}
// v233: Tam ekran hiçbir platformda otomatik olarak zorlanmaz.
// Yalnız kullanıcı TAM EKRAN düğmesine kendi isteğiyle bastığında çalışır.
async function requestGameFullscreen(silent=false){
if(isFullscreenActive()){ updateFullscreenUi(); return true; }
const el=document.documentElement;
try{
if(el.requestFullscreen) await el.requestFullscreen({navigationUI:'hide'});
else if(el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
else {
if(!silent) showToast('Bu tarayıcı tam ekranı desteklemiyor.','slate');
return false;
}
updateFullscreenUi();
return true;
}catch(e){
if(!silent) showToast('Tam ekran açılamadı.','slate');
updateFullscreenUi();
return false;
}
}
async function toggleGameFullscreen(){
if(isFullscreenActive()){
try{
if(document.exitFullscreen) await document.exitFullscreen();
else if(document.webkitExitFullscreen) await document.webkitExitFullscreen();
}catch(e){}
updateFullscreenUi();
}else{
await requestGameFullscreen(false);
}
}
function handleFullscreenLayoutChange(){
updateFullscreenUi();
// Tam ekran geçişinde tahta boyutu değişir. Sürükleme aktif değilse eski
// koordinat önbelleğini temizleyip yeni boyutları bir sonraki frame'de ölç.
// Aktif sürükleme sırasında dokunmayız; aksi halde yol hesabı yarıda bozulabilir.
if(typeof isPointerDown!=='undefined' && isPointerDown) return;
hoverGridRect=null; hoverGridMetrics=null; activeGridRect=null; activeGridMetrics=null;
requestAnimationFrame(()=>{
  if(typeof isPointerDown!=='undefined' && isPointerDown) return;
  try{
    const grid=document.getElementById('scrabble-grid');
    if(grid && grid.children.length){
      hoverGridMetrics=measureGrid();
      hoverGridRect=hoverGridMetrics.rect;
    }
  }catch(_){}
});
}
document.addEventListener('fullscreenchange',handleFullscreenLayoutChange);
document.addEventListener('webkitfullscreenchange',handleFullscreenLayoutChange);

let remainingSeconds = 60;
let isMatchActive = false;
let botDiffLevel = 'easy';
let activeGameMode = null; // 'single' | 'multi' — replay akışının tek güvenilir kaynağı
let selectedPath = [];
let sessionFoundWords = new Set();
let gridBoard = [];
let domCells = [];
let boardFoundWords = [];
function updateGameTimerUI(seconds){
const el=document.getElementById('game-timer');
if(!el)return;
const sec=Math.max(0,Math.ceil(Number(seconds)||0));
el.textContent=sec;
const danger=sec<=10 && sec>0;
el.classList.toggle('timer-warning',danger);
el.classList.toggle('timer-critical',sec<=5 && sec>0);
const timerBox=el.closest('.compact-timer');
timerBox?.classList.toggle('timer-danger',danger);
if(!danger) timerBox?.classList.remove('timer-danger-red','timer-danger-black');
}

let timerInterval = null;
let botInterval = null;
let localCountdownInterval=null, localCountdownTimeout=null;
function stopLocalCountdown(){
if(localCountdownInterval){clearInterval(localCountdownInterval);localCountdownInterval=null;}
if(localCountdownTimeout){clearTimeout(localCountdownTimeout);localCountdownTimeout=null;}
}
let isPointerDown = false;
let pointerHoldStartedAt = 0;
let pointerHoldTimer = null;
let activePointerId = null;
const HOLD_CANCEL_MS = 3000;
const IS_COARSE_POINTER=!!window.matchMedia?.('(pointer:coarse)').matches;

let gameAudioCtx = null;
let lastHeartbeatSecond = null;
let lastGongSecond = null;
const SOUND_VOLUME_KEY = 'kd_sound_volume_v2';
const AUDIO_GAIN_BOOST = 1.56574; // v335: genel ses seviyesi +%10
const AUDIO_GAIN_CAP = 0.315;
function safeStorageGet(kind,key){
try{return (kind==='session'?window.sessionStorage:window.localStorage).getItem(key);}catch(_){return null;}
}
function safeStorageSet(kind,key,value){
try{(kind==='session'?window.sessionStorage:window.localStorage).setItem(key,value);return true;}catch(_){return false;}
}
let masterSoundVolume = Math.max(0, Math.min(1, Number(safeStorageGet('local',SOUND_VOLUME_KEY) ?? 0.80)));
// Tek standart, hafif görsel profil. Grafik kalite seçeneği yoktur.

let lastNonMutedSoundVolume=masterSoundVolume>0?masterSoundVolume:.8;
function renderSoundControls(){
const range=document.getElementById('sound-volume-range');
const mute=document.getElementById('sound-muted');
if(range) range.value=String(Math.max(1,Math.min(5,Math.round((masterSoundVolume>0?masterSoundVolume:lastNonMutedSoundVolume)*5))));
if(mute) mute.checked=masterSoundVolume<=0;
}
function setMasterSoundVolume(v){
masterSoundVolume=Math.max(0,Math.min(1,Number(v)||0));
if(masterSoundVolume>0) lastNonMutedSoundVolume=masterSoundVolume;
safeStorageSet('local',SOUND_VOLUME_KEY,String(masterSoundVolume));
renderSoundControls();
}
function ensureGameAudio(){
try{
if(!gameAudioCtx){
const Ctx = window.AudioContext || window.webkitAudioContext;
if(Ctx) gameAudioCtx = new Ctx();
}
if(gameAudioCtx && gameAudioCtx.state === 'suspended') gameAudioCtx.resume().catch(()=>{});
}catch(_){}
return gameAudioCtx;
}
function playTone(freq=520,duration=.045,volume=.08,type='sine',endFreq=null,delay=0){
if(masterSoundVolume<=0) return;
const ctx=ensureGameAudio(); if(!ctx || ctx.state==='closed') return;
try{
const now=ctx.currentTime+Math.max(0,delay);
const osc=ctx.createOscillator();
const gain=ctx.createGain();
osc.type=type; osc.frequency.setValueAtTime(freq,now);
if(endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(1,endFreq),now+duration);
const out=Math.max(0.0002,Math.min(AUDIO_GAIN_CAP,volume*masterSoundVolume*AUDIO_GAIN_BOOST));
gain.gain.setValueAtTime(0.0001,now);
gain.gain.exponentialRampToValueAtTime(out,now+0.006);
gain.gain.exponentialRampToValueAtTime(0.0001,now+duration);
osc.connect(gain); gain.connect(ctx.destination);
osc.start(now); osc.stop(now+duration+0.02);
}catch(_){}
}
function playLetterPickSound(step=1){
const n=Math.min(10,Math.max(1,step));
const base=430 + (n-1)*28;
playTone(base,.060,.065,'sine',base+115);
}

// v278: Tüm düğmeler için tek, çok hafif ve kısa "pit" sesi.
// Event delegation kullanıldığı için düğme başına ayrı dinleyici oluşturmaz.
function playUiClickSound(){
  if(document.hidden) return;
  playTone(560,.028,.028,'sine',690);
}
document.addEventListener('click',(e)=>{
  const btn=e.target?.closest?.('button');
  if(!btn || btn.disabled) return;
  playUiClickSound();
},{passive:true});

function playErrorBuzzer(){
playTone(185,.14,.12,'square',95);
playTone(145,.12,.08,'sawtooth',82,.055);
}
function playCorrectChime(){
playTone(760,.13,.095,'sine',980);
playTone(1120,.19,.075,'sine',1420,.075);
}
function playHeartbeat(){
if(masterSoundVolume<=0) return;
const ctx=ensureGameAudio(); if(!ctx) return;
const thump=(delay,freq,vol,dur)=>{
try{
const now=ctx.currentTime+delay;
const osc=ctx.createOscillator(), gain=ctx.createGain();
osc.type='sine'; osc.frequency.setValueAtTime(freq,now);
osc.frequency.exponentialRampToValueAtTime(Math.max(35,freq*.62),now+dur);
gain.gain.setValueAtTime(0.0001,now);
gain.gain.exponentialRampToValueAtTime(Math.min(AUDIO_GAIN_CAP,vol*masterSoundVolume*AUDIO_GAIN_BOOST),now+.012);
gain.gain.exponentialRampToValueAtTime(0.0001,now+dur);
osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now+dur+.02);
}catch(_){}
};
thump(0,92,.105,.11); thump(.16,72,.072,.09);
}
function playFinalGong(){
if(masterSoundVolume<=0) return;
const ctx=ensureGameAudio(); if(!ctx) return;
try{
const now=ctx.currentTime;
const partials=[{f:220,v:.12,d:.72},{f:440,v:.075,d:.62},{f:660,v:.052,d:.52},{f:880,v:.035,d:.44}];
partials.forEach(({f,v,d},i)=>{
const osc=ctx.createOscillator(), gain=ctx.createGain();
osc.type=i%2?'triangle':'sine';
osc.frequency.setValueAtTime(f,now);
osc.frequency.exponentialRampToValueAtTime(Math.max(80,f*.94),now+d);
const peak=Math.min(AUDIO_GAIN_CAP,v*masterSoundVolume*AUDIO_GAIN_BOOST);
gain.gain.setValueAtTime(.0001,now);
gain.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),now+.008);
gain.gain.exponentialRampToValueAtTime(.0001,now+d);
osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now+d+.03);
});
}catch(_){ }
}
function maybeFinalGong(sec){
if(sec<=3 && sec>0 && sec!==lastGongSecond){ lastGongSecond=sec; playFinalGong(); }
if(sec>3) lastGongSecond=null;
}
function maybeHeartbeat(sec){
if(sec<=10 && sec>3 && sec!==lastHeartbeatSecond){
lastHeartbeatSecond=sec; playHeartbeat();
}
if(sec>10 || sec<=3) lastHeartbeatSecond=null;
}

const FIREBASE_CONFIG = {
apiKey: "AIzaSyAtWg9jvda8M8j8dA6F31BwoRG8IoCZWwo",
authDomain: "kelimedeneme-82f00.firebaseapp.com",
databaseURL: "https://kelimedeneme-82f00-default-rtdb.europe-west1.firebasedatabase.app",
projectId: "kelimedeneme-82f00",
storageBucket: "kelimedeneme-82f00.firebasestorage.app",
messagingSenderId: "968159872150",
appId: "1:968159872150:web:c80429010ec21363116eb7"
};

const GAME_VERSION='v233';
const MP_STATES = Object.freeze({
IDLE:'idle', WAITING:'waiting', COUNTDOWN:'countdown', PLAYING:'playing', FINISHED:'finished'
});
let mpState=MP_STATES.IDLE;
let mpDb=null, mpRoomRef=null, mpRoomCode=null, mpRole=null, mpRoomData=null, mpRoomMode='';
let mpRandomMatchSession=false; // v233: rastgele maç kimliği sonuç ekranı kapanana kadar yerelde kilitli kalır.
let mpSessionJoinedAt=0, mpExitHandling=false, mpLastExitSignalId='';
let mpListener=null, mpWordsListener=null, mpScoresListener=null, mpServerOffset=0, mpEntered=false, mpStarted=false, mpClock=null;
let mpScoreSyncTimer=null, mpScoreSyncInFlight=false, mpScoreDesired=null, mpLastConfirmedOwnScore=null;
let mpControlListeners=[];
let mpStartBusy=false, mpRematchBusy=false, mpPresenceRef=null, mpLastRoomMetaSig='', mpEndResolveTimer=null, mpRematchExpiryTimer=null;
let mpSeenWordEvents=new Set(), mpLastBeepSecond=null, mpLastResultRenderSig='';
let mpOpponentDisconnectTimer=null, firebaseWasConnected=null, reconnectPresenceBusy=false;
const MP_DISCONNECT_GRACE_MS=5000;
const mpFoundWords={host:new Set(),guest:new Set()};

function setMpState(next){ mpState=next; document.documentElement.dataset.mpState=next; }
let runtimeClientToken='';
function getClientToken(){
if(runtimeClientToken) return runtimeClientToken;
let t=safeStorageGet('local','kd_client_token');
if(!t){
const a=new Uint32Array(4); crypto.getRandomValues(a);
t=Array.from(a,n=>n.toString(36)).join('');
safeStorageSet('local','kd_client_token',t);
}
runtimeClientToken=t;
return t;
}
let firebaseNetworkOnline=false;
let serverOffsetListener=null;
function ensureFirebase(){
if(!window.firebase){ showToast('Firebase yüklenemedi. İnternet bağlantını kontrol et.','rose'); return false; }
if(!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
if(!mpDb) mpDb=firebase.database();
if(!serverOffsetListener){
  serverOffsetListener=s=>{ mpServerOffset=Number(s.val()||0); };
  mpDb.ref('.info/serverTimeOffset').on('value',serverOffsetListener);
}
if(!firebaseNetworkOnline){
  try{ mpDb.goOnline(); }catch(_){}
  firebaseNetworkOnline=true;
}
return true;
}
function disconnectFirebaseNetwork(){
if(!mpDb || !firebaseNetworkOnline) return;
try{ mpDb.goOffline(); }catch(_){}
firebaseNetworkOnline=false;
firebaseWasConnected=null;
reconnectPresenceBusy=false;
}
async function syncServerClock(){
if(!ensureFirebase()) return false;
try{
const snap=await mpDb.ref('.info/serverTimeOffset').once('value');
mpServerOffset=Number(snap.val()||0);
return true;
}catch(_){ return false; }
}
async function waitFirebaseConnected(timeoutMs=6000){
if(!ensureFirebase()) return false;
const connectedRef=mpDb.ref('.info/connected');
const first=await connectedRef.once('value');
if(first.val()===true){ await syncServerClock(); return true; }
const connected=await new Promise(resolve=>{
let done=false, timer=null;
const finish=v=>{ if(done)return; done=true; if(timer) clearTimeout(timer); connectedRef.off('value',listener); resolve(v); };
const listener=s=>{ if(s.val()===true) finish(true); };
connectedRef.on('value',listener);
timer=setTimeout(()=>finish(false),timeoutMs);
});
if(connected) await syncServerClock();
return connected;
}
function serverNow(){ return Date.now()+mpServerOffset; }
function turkeyRoomDayInfo(ts=serverNow()){
const shifted=new Date(ts+3*60*60*1000);
const y=shifted.getUTCFullYear(), m=shifted.getUTCMonth(), d=shifted.getUTCDate();
const dayKey=String(y)+String(m+1).padStart(2,'0')+String(d).padStart(2,'0');
const expiresAt=Date.UTC(y,m,d+1,0,0,0)-3*60*60*1000;
return {dayKey,expiresAt};
}
function randomDailyRoomCode(){
const alphabet='abcdefghijklmnopqrstuvwxyz';
const bytes=new Uint8Array(5); crypto.getRandomValues(bytes);
let code='';
for(let i=0;i<5;i++) code+=alphabet[bytes[i]%26];
return code;
}
async function lockClosedRoomCode(code,roomRef=null,reason='closed'){
if(!mpDb || !code) return;
let dayKey=turkeyRoomDayInfo().dayKey;
try{
if(roomRef){ const snap=await roomRef.child('dayKey').once('value'); if(snap.val()) dayKey=String(snap.val()); }
await mpDb.ref('meta/closedRoomCodes/'+dayKey+'/'+code).set({closed:true,at:firebase.database.ServerValue.TIMESTAMP,reason:String(reason||'closed')});
}catch(_){ }
}
async function isRoomCodeClosedToday(code){
if(!mpDb || !code) return false;
const {dayKey}=turkeyRoomDayInfo();
try{ return !!(await mpDb.ref('meta/closedRoomCodes/'+dayKey+'/'+code).once('value')).exists(); }catch(_){ return false; }
}
async function closeAndLockPrivateRoom(ref,code,reason='closed'){
if(!ref || !code) return;
await lockClosedRoomCode(code,ref,reason);
try{ await ref.remove(); }catch(_){ }
}
function stopInviteWaitCountdown(){
if(inviteWaitCountdownTimer){ clearInterval(inviteWaitCountdownTimer); inviteWaitCountdownTimer=null; }
inviteWaitDeadlineAt=0;
const el=document.getElementById('invite-wait-countdown'); if(el) el.textContent='60';
}
async function expirePrivateInviteRoom(){
if(mpRole!=='host'||!mpRoomRef||!mpRoomCode||!/^invite-only-/.test(String(mpRoomMode||''))) return;
try{
const [gsSnap,invSnap]=await Promise.all([mpRoomRef.child('gameState').once('value'),mpRoomRef.child('invite/guest').once('value')]);
const gs=gsSnap.val()||{}, inv=invSnap.val()||{};
if(gs.status!=='waiting'||inv.guest==='accepted') return;
await requestSynchronizedRoomExit('invite-timeout');
}catch(_){
showRoomExitNotice('OYUNDAN ÇIKIŞ YAPILDI');
await new Promise(r=>setTimeout(r,1250));
returnToHomeFromMultiplayer();
hideRoomExitNotice();
}
}

function startInviteWaitCountdown(deadlineAt){
stopInviteWaitCountdown();
inviteWaitDeadlineAt=Number(deadlineAt||0);
const tick=()=>{
const left=Math.max(0,Math.ceil((inviteWaitDeadlineAt-serverNow())/1000));
const el=document.getElementById('invite-wait-countdown'); if(el) el.textContent=String(left);
if(left<=0){ stopInviteWaitCountdown(); expirePrivateInviteRoom(); }
};
tick(); inviteWaitCountdownTimer=setInterval(tick,1000);
}
async function allocateDailyRoomCode(){
if(!mpDb) throw new Error('firebase-not-ready');
const {dayKey}=turkeyRoomDayInfo();
const claimToken=getClientToken()+':'+serverNow()+':'+Math.random().toString(36).slice(2,8);
for(let attempt=0;attempt<40;attempt++){
const code=randomDailyRoomCode();
if(await isRoomCodeClosedToday(code)) continue;
const claimRef=mpDb.ref('meta/dailyRoomCodes/'+dayKey+'/'+code);
const claim=await claimRef.transaction(current=>current==null?claimToken:undefined);
if(!claim.committed) continue;
const roomRef=mpDb.ref('rooms/'+code);
const snap=await roomRef.once('value');
if(!snap.exists()) return {code,dayKey};
const room=snap.val()||{};
const oldDay=String(room.dayKey||'')!==dayKey;
const active=isOnline(room.presence?.host)||isOnline(room.presence?.guest)||['countdown','playing'].includes(String(room.gameState?.status||''));
if(oldDay && !active){
try{ await roomRef.remove(); return {code,dayKey}; }catch(_){ }
}
await claimRef.transaction(current=>current===claimToken?null:current).catch(()=>{});
}
throw new Error('daily-room-code-allocation-failed');
}
function inviteUrl(code){
const u=new URL(location.href); u.searchParams.set('room',code); u.searchParams.delete('join'); u.searchParams.delete('as'); u.hash=''; return u.toString();
}
function setRoomUrl(code){
const u=new URL(location.href); u.searchParams.set('room',code); u.searchParams.delete('join'); u.searchParams.delete('as'); u.hash=''; history.replaceState(null,'',u.toString());
}
function clearInviteFromUrl(){
const u=new URL(location.href); ['room','join','as'].forEach(k=>u.searchParams.delete(k)); history.replaceState(null,'',u.toString());
}
function setMpPanelRoom(code,status){
document.getElementById('mp-create-view')?.classList.add('hidden');
document.getElementById('mp-room-view')?.classList.remove('hidden');
const c=document.getElementById('mp-room-code'); if(c)c.textContent='https://kapmaca.tr/?room='+String(code||mpRoomCode||'-----').toLowerCase();
}
async function markPresence(){
if(!mpRoomRef||!mpRole) return;
mpPresenceRef=mpRoomRef.child('presence/'+mpRole);
const payload={online:true,clientId:getClientToken(),at:firebase.database.ServerValue.TIMESTAMP};
await mpPresenceRef.set(payload);
mpPresenceRef.onDisconnect().set({online:false,clientId:getClientToken(),at:firebase.database.ServerValue.TIMESTAMP});
}
function isOnline(p){ return !!(p && (p===true || p.online===true)); }

function clearOpponentDisconnectGrace(){
if(mpOpponentDisconnectTimer){ clearTimeout(mpOpponentDisconnectTimer); mpOpponentDisconnectTimer=null; }
}
function handleOpponentPresenceState(online){
if(online){ clearOpponentDisconnectGrace(); return; }
if(mpOpponentDisconnectTimer || mpExitHandling || !mpRoomRef || !mpRole) return;
if(!['countdown','playing'].includes(String(mpRoomData?.status||''))) return;
const ref=mpRoomRef;
const opponentRole=mpRole==='host'?'guest':'host';
mpOpponentDisconnectTimer=setTimeout(async()=>{
mpOpponentDisconnectTimer=null;
if(ref!==mpRoomRef || mpExitHandling || !mpRole) return;
try{
const [presenceSnap,gameSnap]=await Promise.all([
ref.child('presence/'+opponentRole).once('value'),
ref.child('gameState').once('value')
]);
const gs=gameSnap.val()||{};
if(!isOnline(presenceSnap.val()) && ['countdown','playing'].includes(String(gs.status||''))){
await requestSynchronizedRoomExit('opponent-disconnected');
}
}catch(_){ }
},MP_DISCONNECT_GRACE_MS);
}

let randomQueueRef=null, randomQueueListener=null, randomSearchActive=false, randomSearchTicket=null, randomWaitCancel=null;
let randomResultAutoExitTimer=null, randomResultAutoExitKey='';
let inviteWaitCountdownTimer=null;
let inviteWaitDeadlineAt=0;
const RANDOM_SEARCH_MS=45000;
const RANDOM_QUEUE_TTL=RANDOM_SEARCH_MS+5000;

function setRandomStatus(text,visible=true){
const el=document.getElementById('mp-random-status');
if(!el) return;
el.textContent=text||'';
el.classList.toggle('hidden',!visible);
}
function randomTicket(){
const a=new Uint32Array(3); crypto.getRandomValues(a);
return Array.from(a,n=>n.toString(36)).join('');
}
function releaseRandomSearchLocal(){
if(randomWaitCancel){const cancel=randomWaitCancel;randomWaitCancel=null;try{cancel();}catch(_){}}
if(randomQueueRef && randomQueueListener){try{randomQueueRef.off('value',randomQueueListener);}catch(_){} }
randomQueueListener=null;
randomSearchActive=false;
randomSearchTicket=null;
randomQueueRef=null;
}
function restoreHodriMeydanButton(){
const btn=document.getElementById('btn-random-match');
if(!btn) return;
btn.disabled=false;
btn.innerHTML='<span class="text-[88px] leading-none drop-shadow-md" aria-hidden="true">🎲</span><span class="text-[14px] leading-tight">HODRİ MEYDAN!</span><span class="text-[10.5px] leading-snug font-bold text-amber-950">Sürpriz bir rakiple oyna</span>';
}
async function cleanupRandomQueue(onlyIfMine=true){
const ref=randomQueueRef, ticket=randomSearchTicket;
if(randomWaitCancel){const cancel=randomWaitCancel;randomWaitCancel=null;try{cancel();}catch(_){}}
if(ref && randomQueueListener){try{ref.off('value',randomQueueListener);}catch(_){} randomQueueListener=null;}
if(ref && ticket){
try{
await ref.transaction(cur=>{
if(!cur) return cur;
if(onlyIfMine && cur.ticket!==ticket) return;
return null;
});
try{ await ref.onDisconnect().cancel(); }catch(_){}
}catch(_){}
}
if(randomQueueRef===ref){randomSearchActive=false;randomSearchTicket=null;randomQueueRef=null;randomQueueListener=null;}
restoreHodriMeydanButton();
}
async function createRandomMatchedRoom(hostId,guestId){
const alloc=await allocateDailyRoomCode();
const code=alloc.code, ref=mpDb.ref('rooms/'+code);
const readyBoard=prewarmedBoard || generateOptimizedBoard(3); prewarmedBoard=null; rememberBoard(readyBoard.board, readyBoard.words);
await ref.set({
schema:22, mode:'random-match-v7', createdAt:firebase.database.ServerValue.TIMESTAMP,
dayKey:alloc.dayKey,
hostId, guestId,
gameState:{status:'waiting',board:readyBoard.board,startAt:0,round:1},
scores:{host:0,guest:0}, words:{}, longestBonus:null, bonusApplied:false,
endReady:{host:false,guest:false}, rematch:{host:false,guest:false,expiresAt:0}, pendingRound:null, invite:{guest:'accepted'},
presence:{host:{online:false,clientId:hostId},guest:{online:false,clientId:guestId}}
});
return code;
}
function waitForRandomRoom(ticket,timeoutMs){
return new Promise(resolve=>{
const ref=randomQueueRef;
if(!ref) return resolve(null);
let done=false,timer=null;
const finish=v=>{
if(done) return; done=true;
if(timer) clearTimeout(timer);
try{if(randomQueueListener) ref.off('value',randomQueueListener);}catch(_){}
randomQueueListener=null;
if(randomWaitCancel===cancel) randomWaitCancel=null;
resolve(v);
};
const cancel=()=>finish(null);
randomWaitCancel=cancel;
randomQueueListener=snap=>{
const d=snap.val();
if(!d || d.ticket!==ticket) return finish(null);
if(d.claimedBy && !d.roomCode) setRandomStatus('Rakip bulundu ✓ Oda hazırlanıyor…');
if(d.roomCode) finish(String(d.roomCode));
};
ref.on('value',randomQueueListener);
timer=setTimeout(()=>finish(null),Math.max(1,timeoutMs||RANDOM_SEARCH_MS));
});
}
function waitForRandomQueueOpportunity(timeoutMs){
return new Promise(resolve=>{
const ref=randomQueueRef;
if(!ref) return resolve(false);
let done=false,timer=null;
const finish=v=>{
if(done) return; done=true;
if(timer) clearTimeout(timer);
try{ref.off('value',onValue);}catch(_){}
resolve(v);
};
const onValue=snap=>{
const d=snap.val();
const now=serverNow();
if(!d || Number(d.expiresAt||0)<now || (!d.claimedBy && d.clientId!==getClientToken())) finish(true);
};
ref.on('value',onValue);
timer=setTimeout(()=>finish(false),Math.max(1,timeoutMs||RANDOM_SEARCH_MS));
});
}

async function searchRandomOpponent(){
if(randomSearchActive) return;
const wordDataLoad=ensureWordDataLoaded();
const btn=document.getElementById('btn-random-match');
if(btn){ btn.disabled=true; btn.textContent='RAKİP ARANIYOR…'; }
setRandomStatus('Çevrimiçi rakip aranıyor…',true);
if(!await waitFirebaseConnected()){
restoreHodriMeydanButton();
setRandomStatus('Sunucuya bağlanılamadı.',true);
disconnectFirebaseNetwork();
return;
}

randomSearchActive=true;
randomQueueRef=mpDb.ref('matchmaking/random/waiting');
const ticket=randomTicket();
randomSearchTicket=ticket;
const myId=getClientToken(), started=serverNow(), deadline=started+RANDOM_SEARCH_MS;

while(randomSearchActive && randomSearchTicket===ticket && serverNow()<deadline){
const now=serverNow();
let tx=null;
try{
tx=await randomQueueRef.transaction(cur=>{
if(!cur || Number(cur.expiresAt||0)<now){
return {ticket,clientId:myId,createdAt:now,expiresAt:now+RANDOM_QUEUE_TTL,claimedBy:null,roomCode:null};
}
if(cur.clientId===myId) return cur;
if(!cur.claimedBy){
return {...cur,claimedBy:myId,claimedAt:now,expiresAt:now+RANDOM_QUEUE_TTL};
}
return;
});
}catch(_){}

if(!randomSearchActive || randomSearchTicket!==ticket) break;
if(serverNow()>=deadline) break;

if(tx?.committed){
const q=tx.snapshot.val()||{};
if(q.clientId===myId){
try{ await randomQueueRef.onDisconnect().remove(); }catch(_){}
setRandomStatus(q.claimedBy?'Rakip bulundu ✓ Oda hazırlanıyor…':'Rakip bekleniyor…',true);
const room=await waitForRandomRoom(ticket,Math.max(1,deadline-serverNow()));
if(!randomSearchActive || randomSearchTicket!==ticket) break;
if(room){
try{ await randomQueueRef?.onDisconnect().cancel(); }catch(_){}
releaseRandomSearchLocal();
await wordDataLoad;
const ok=await joinRoom(room);
if(ok){ restoreHodriMeydanButton(); setRandomStatus('Rakip bulundu ✓ Senkronize ediliyor…',true); }
return;
}
break;
}
if(q.clientId && q.clientId!==myId && q.claimedBy===myId){
setRandomStatus('Rakip bulundu ✓ Ortak oda kuruluyor…',true);
try{
await wordDataLoad;
const room=await createRandomMatchedRoom(q.clientId,myId);
if(!randomSearchActive || randomSearchTicket!==ticket){try{await mpDb.ref('rooms/'+room).remove();}catch(_){} break;}
const queueRef=randomQueueRef;
await queueRef.update({roomCode:room,expiresAt:serverNow()+8000});
releaseRandomSearchLocal();
const ok=await joinRoom(room);
setTimeout(async()=>{
try{
await mpDb.ref('matchmaking/random/waiting').transaction(cur=>{
if(cur && cur.roomCode===room) return null;
return;
});
}catch(_){}
},2500);
if(ok){ restoreHodriMeydanButton(); setRandomStatus('Rakip bulundu ✓ Senkronize ediliyor…',true); }
return;
}catch(e){
console.error('Random match room error',e);
break;
}
}
}

// Başka bir istemci kuyruğu kullanıyorsa 450 ms polling yapma.
// Kuyruk boşaldığında/değiştiğinde Firebase value olayı bizi uyandırsın.
const opportunity=await waitForRandomQueueOpportunity(Math.max(1,deadline-serverNow()));
if(!opportunity) break;
}

if(randomSearchTicket!==ticket){
restoreHodriMeydanButton();
setRandomStatus('',false);
return;
}
await cleanupRandomQueue(true);
restoreHodriMeydanButton();
setRandomStatus('45 saniye içinde rakip bulunamadı.',true);
showToast('Rakip bulunamadı. Tekrar deneyebilirsin.','slate');
setTimeout(()=>setRandomStatus('',false),1800);
}

async function createRoom(){
const wordDataLoad=ensureWordDataLoaded();
if(!await waitFirebaseConnected()){ showToast('Sunucuya bağlanılamadı. İnternet bağlantını kontrol et.','rose'); disconnectFirebaseNetwork(); return; }
try{ await wordDataLoad; }catch(_){ showToast('Oyun sözlüğü yüklenemedi. Tekrar deneyin.','rose'); return; }
let alloc;
try{ alloc=await allocateDailyRoomCode(); }
catch(e){ showToast('Günlük oda kodu oluşturulamadı. Tekrar dene.','rose'); return; }
const code=alloc.code, ref=mpDb.ref('rooms/'+code);

const hostId=getClientToken();
const readyBoard=prewarmedBoard || generateOptimizedBoard(3); prewarmedBoard=null; rememberBoard(readyBoard.board, readyBoard.words);
await ref.set({
schema:21, mode:'invite-only-v5', createdAt:firebase.database.ServerValue.TIMESTAMP,
dayKey:alloc.dayKey,
hostId, guestId:null,
gameState:{status:'waiting',board:readyBoard.board,startAt:0,round:1},
scores:{host:0,guest:0}, words:{}, longestBonus:null, bonusApplied:false,
endReady:{host:false,guest:false}, rematch:{host:false,guest:false,expiresAt:0}, pendingRound:null, invite:{guest:'pending',expiresAt:0},
presence:{host:{online:true,clientId:hostId},guest:{online:false}}
});

mpRoomCode=code; mpRole='host'; mpRoomRef=ref; mpRoomMode='invite-only-v5'; mpRandomMatchSession=false; delete document.body.dataset.randomMatchActive; document.body.dataset.privateFriendActive='1'; mpRoomData=null; mpEntered=false; mpStarted=false; mpSessionJoinedAt=serverNow(); mpExitHandling=false; mpLastExitSignalId='';
setRoomUrl(code); await markPresence();
setMpPanelRoom(code,'Bağlantıyı kopyala ve arkadaşına gönder.');
document.getElementById('btn-close-room')?.classList.remove('hidden');
setMpState(MP_STATES.WAITING);
attachRoomListener();
}

let inviteDecisionTimer=null;
function stopInviteDecisionTimer(){
  if(inviteDecisionTimer){clearInterval(inviteDecisionTimer);inviteDecisionTimer=null;}
}
function showInviteDecisionModal(){
const modal=document.getElementById('modal-room-invite');
const codeEl=document.getElementById('invite-room-code');
const startBtn=document.getElementById('btn-invite-start');
const cancelBtn=document.getElementById('btn-invite-cancel');
const countdownEl=document.getElementById('invite-decision-countdown');
if(codeEl) codeEl.textContent=String(mpRoomCode||'').toUpperCase();
if(startBtn){ startBtn.disabled=false; startBtn.classList.remove('hidden'); }
if(cancelBtn){ cancelBtn.disabled=false; cancelBtn.classList.remove('hidden'); }
modal?.classList.remove('hidden');
stopInviteDecisionTimer();
const existingDeadline=Number(mpRoomData?.inviteExpiresAt||0);
const deadline=existingDeadline>serverNow()?existingDeadline:serverNow()+60000;
if(mpRole==='guest'&&mpRoomRef&&/^invite-only-/.test(String(mpRoomMode||'')) && !existingDeadline){
  mpRoomRef.child('invite/expiresAt').set(deadline).catch(()=>{});
}
const tick=()=>{
  const left=Math.max(0,Math.ceil((deadline-serverNow())/1000));
  if(countdownEl) countdownEl.textContent=`${left} saniye içinde seçim yapın`;
  if(left<=0){
    stopInviteDecisionTimer();
    if(mpRole==='guest'&&mpRoomRef) requestSynchronizedRoomExit('invite-timeout').catch(()=>{});
  }
};
tick();
inviteDecisionTimer=setInterval(tick,500);
}

async function joinRoom(code){
code=String(code||'').toLowerCase().replace(/[^a-z]/g,'').slice(0,5);
if(!/^[a-z]{5}$/.test(code)) return false;
if(!await waitFirebaseConnected()){ showToast('Sunucuya bağlanılamadı.','rose'); return false; }
if(await isRoomCodeClosedToday(code)){ showToast('Bu oda kapatılmış.','rose'); clearInviteFromUrl(); returnToHomeFromMultiplayer(); return false; }
const ref=mpDb.ref('rooms/'+code); const snap=await ref.once('value');
if(!snap.exists()){ showToast('Davet odası bulunamadı veya kapatılmış.','rose'); clearInviteFromUrl(); returnToHomeFromMultiplayer(); return false; }
const d=snap.val()||{}; const clientId=getClientToken();
if(/^invite-only-/.test(String(d.mode||'')) && Number(d.invite?.expiresAt||0)>0 && Number(d.invite.expiresAt)<=serverNow() && String(d.gameState?.status||'')==='waiting'){
  await closeAndLockPrivateRoom(ref,code,'invite-expired');
  showToast('Davet süresi dolmuş.','rose'); clearInviteFromUrl(); returnToHomeFromMultiplayer(); return false;
}
// Gün değişimi aktif odayı kapatmaz. dayKey yalnızca yeni oda kodu havuzunu ayırır.
let role=null;
if(d.hostId===clientId){
role='host';
}else{
const guestRef=ref.child('guestId');
const claim=await guestRef.transaction(current=>{
if(current===null || current===clientId) return clientId;
return;
});
if(!claim.committed){ showToast('Bu davet odasında zaten 2 oyuncu var.','rose'); return false; }
role='guest';
}

mpRoomCode=code; mpRole=role; mpRoomRef=ref; mpRoomMode=String(d.mode||'');
mpRandomMatchSession=/^random-match-/.test(String(mpRoomMode||''));
if(mpRandomMatchSession){
document.body.dataset.randomMatchActive='1';
delete document.body.dataset.privateFriendActive;
}else{
delete document.body.dataset.randomMatchActive;
if(/^invite-only-/.test(String(mpRoomMode||''))) document.body.dataset.privateFriendActive='1';
else delete document.body.dataset.privateFriendActive;
}
const [gsSnap,scoreSnap,inviteSnap]=await Promise.all([ref.child('gameState').once('value'),ref.child('scores').once('value'),ref.child('invite/guest').once('value')]);
const gs0=gsSnap.val()||{};
if(role==='guest' && /^invite-only-/.test(String(d.mode||'')) && gs0.status==='waiting'){
  await ref.child('invite').update({guest:'pending'});
}
const invite0=inviteSnap.val()||{};
mpRoomData={...gs0,scores:scoreSnap.val()||{host:0,guest:0},inviteGuest:(role==='guest' && /^invite-only-/.test(String(d.mode||'')) && gs0.status==='waiting')?'pending':invite0.guest,inviteExpiresAt:Number(invite0.expiresAt||0)}; mpSessionJoinedAt=serverNow(); mpExitHandling=false; mpLastExitSignalId=''; mpEntered=false; mpStarted=false;
await markPresence(); setRoomUrl(code);
setMpPanelRoom(code,role==='host'?'1. oyuncu olarak odana yeniden bağlandın.':'2. oyuncu olarak davet odasına bağlandın.');
document.getElementById('btn-close-room')?.classList.toggle('hidden',role!=='host');
setMpState(mpRoomData.status||MP_STATES.WAITING);
attachRoomListener();
if(role==='guest' && /^invite-only-/.test(String(mpRoomMode||'')) && mpRoomData.status==='waiting'){
showInviteDecisionModal();
setTimeout(()=>ensureWordDataLoaded().catch(()=>{}),0);
}
if(role==='guest' && /^random-match-/.test(String(mpRoomMode||''))) await enterMultiplayerRoom();
return true;
}

async function enterMultiplayerRoom(){
if(!mpRoomRef) return;
try{ await ensureWordDataLoaded(); }
catch(_){ showToast('Oyun sözlüğü yüklenemedi. Tekrar deneyin.','rose'); return; }
activeGameMode = 'multi';
const [gsSnap,scoreSnap,wordsSnap]=await Promise.all([mpRoomRef.child('gameState').once('value'),mpRoomRef.child('scores').once('value'),mpRoomRef.child('words').once('value')]);
const d={...(gsSnap.val()||{}),scores:scoreSnap.val()||{host:0,guest:0},words:wordsSnap.val()||{}}; if(!d||!d.board) return;
const prevRound=Number(mpRoomData?.round||0);
const prevBoardSig=Array.isArray(gridBoard)&&gridBoard.length===BOARD_SIZE?boardSignature(gridBoard):'';
mpRoomData={...(mpRoomData||{}),...d};
const incomingBoardSig=Array.isArray(d.board)?boardSignature(d.board):'';
const mustRefreshBoard=!mpEntered || Number(d.round||1)!==prevRound || (incomingBoardSig && incomingBoardSig!==prevBoardSig);
if(mustRefreshBoard){
mpEntered=true; mpStarted=false;
document.getElementById('screen-home')?.classList.add('hidden');
document.getElementById('screen-game')?.classList.remove('hidden');
document.getElementById('p1-title').textContent='1. OYUNCU';
document.getElementById('p2-title').textContent='2. OYUNCU';
resetMultiplayerRoundVisualState();
p1Score=Number(d.scores?.host||0); p2Score=Number(d.scores?.guest||0); updateScores();
if (!renderProvidedBoard(d.board)) return;
hydrateMultiplayerBoardState(d);
}
if(d.status==='countdown' && d.startAt && !mpStarted) startSyncedMatch(d);
else if(d.status==='playing' && d.startAt) activateMultiplayerPlaying(d);
}

async function hostStartWaitingRound(){
if(mpRole!=='host'||mpStartBusy||!mpRoomRef) return;
mpStartBusy=true;
try{
const guestSnap=await mpRoomRef.child('guestId').once('value');
if(!guestSnap.val()) return;
await mpRoomRef.child('gameState').transaction(gs=>{
if(!gs||gs.status!=='waiting'||Number(gs.startAt||0)>0) return;
gs.status='countdown'; gs.startAt=serverNow()+3200;
return gs;
});
}finally{mpStartBusy=false;}
}

async function hostPrepareNextRound(){
if(mpRole!=='host'||!mpRoomRef) return null;
try{
const [gsSnap,pendingSnap]=await Promise.all([
mpRoomRef.child('gameState').once('value'),
mpRoomRef.child('pendingRound').once('value')
]);
const gs=gsSnap.val()||{};
if(gs.status!=='finished') return null;
const nextRound=Number(gs.round||1)+1;
const existing=pendingSnap.val();
if(existing && Number(existing.round||0)===nextRound && Array.isArray(existing.board) && existing.board.length===9) return existing;
const ready=takeDistinctNextBoard(gs.board,5);
const pending={board:ready.board,round:nextRound,preparedAt:serverNow()};
rememberBoard(pending.board, ready.words);
await mpRoomRef.child('pendingRound').set(pending);
scheduleBoardPrewarm();
return pending;
}catch(e){console.error('Next round prepare error',e);return null;}
}

async function hostStartRematch(){
if(mpRole!=='host'||mpRematchBusy||!mpRoomRef) return;
mpRematchBusy=true;
try{
const now=serverNow();
const [gsSnap,rSnap,pSnap,exitSnap]=await Promise.all([
mpRoomRef.child('gameState').once('value'),
mpRoomRef.child('rematch').once('value'),
mpRoomRef.child('pendingRound').once('value'),
mpRoomRef.child('roomExit').once('value')
]);
const gs=gsSnap.val()||{}, r=rSnap.val()||{}, exitSignal=exitSnap.val();
if(exitSignal?.id && Number(exitSignal.at||0)>=mpSessionJoinedAt-1000) return;
const requestIsCurrentRound=Number(r.round||0)===Number(gs.round||1) && (!!r.host||!!r.guest);
if(gs.status!=='finished'||!requestIsCurrentRound) return;
const nextRound=Number(gs.round||1)+1;
let pending=pSnap.val();
if(!pending || Number(pending.round||0)!==nextRound || !Array.isArray(pending.board) || pending.board.length!==9){
pending=await hostPrepareNextRound();
}
if(!pending || !Array.isArray(pending.board) || pending.board.length!==9) throw new Error('pending-round-missing');
mpStarted=false; mpEntered=false; isMatchActive=false;
clearInterval(timerInterval); timerInterval=null;
resetMultiplayerRoundVisualState();
if(mpRematchExpiryTimer){clearTimeout(mpRematchExpiryTimer);mpRematchExpiryTimer=null;}
rememberBoard(pending.board, []);
await mpRoomRef.update({
'gameState':{status:'countdown',board:pending.board,startAt:now+3200,round:nextRound},
'scores':{host:0,guest:0},'words':null,'longestBonus':null,'bonusApplied':false,'finalWinner':null,
'endReady':{host:false,guest:false},'rematch':{host:false,guest:false,expiresAt:0,round:nextRound},'pendingRound':null
});
}catch(e){console.error('Rematch start error',e);showToast('Yeni oyun başlatılamadı. Tekrar deneyin.','rose');}
finally{mpRematchBusy=false;}
}


function isRandomHumanRoom(){
return mpRandomMatchSession || /^random-match-/.test(String(mpRoomMode||'')) || /^random-match-/.test(String(mpRoomData?.mode||''));
}
function isPrivateFriendRoom(){
return /^invite-only-/.test(String(mpRoomMode||''));
}
function forcePrivateResultActions(){
if(!isPrivateFriendRoom()) return;
document.body.dataset.privateFriendActive='1';
const actions=document.getElementById('gameover-actions');
const replay=document.getElementById('btn-play-again');
const exitBtn=document.getElementById('btn-game-exit');
const inline=document.getElementById('rematch-inline-status');
if(actions){actions.classList.remove('hidden');actions.style.setProperty('display','grid','important');}
if(replay){
replay.classList.remove('hidden');
replay.style.setProperty('display','flex','important');
replay.disabled=false;
replay.textContent='YENİDEN OYNA';
replay.classList.add('rematch-pulse');
}
if(exitBtn){
exitBtn.classList.remove('hidden');
exitBtn.style.setProperty('display','flex','important');
exitBtn.disabled=false;
exitBtn.className='w-full mt-2 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-black text-xs py-2.5 rounded-xl uppercase shadow-md transition';
exitBtn.textContent='ÇIKIŞ';
}
if(inline){inline.classList.add('hidden');inline.textContent='';}
}

async function hostExpireRematchIfNeeded(d){
// v233: Özel odada yeniden oynama için ikinci oyuncu onayı veya zaman aşımı yok.
// Oda, biri YENİDEN OYNA ya da ÇIKIŞ diyene kadar açık kalır.
return;
}

function renderRematchState(d){
if(!mpRole || d?.status!=='finished' || isRandomHumanRoom()) return;
const r=d.rematch||{};
const requested=!!r.host || !!r.guest;
const btn=document.getElementById('btn-play-again');
const st=document.getElementById('rematch-inline-status');
if(!btn||!st) return;
if(requested){
btn.disabled=true; btn.textContent='YENİ OYUN HAZIRLANIYOR…'; btn.classList.remove('rematch-pulse');
st.classList.remove('hidden'); st.textContent='Yeni tahta hazırlanıyor…';
}else{
btn.disabled=false; btn.textContent='YENİDEN OYNA'; btn.classList.add('rematch-pulse');
st.classList.add('hidden'); st.textContent='';
}
}

async function hostApplyLongestWordBonus(){
if(mpRole!=='host'||!mpRoomRef) return;
const [gsSnap,bonusSnap,wordsSnap,scoresSnap]=await Promise.all([
mpRoomRef.child('gameState').once('value'),mpRoomRef.child('bonusApplied').once('value'),mpRoomRef.child('words').once('value'),mpRoomRef.child('scores').once('value')]);
const gs=gsSnap.val()||{}; if(gs.status!=='playing'||bonusSnap.val()) return;
const vals=Object.values(wordsSnap.val()||{}).filter(x=>x&&x.word);
let maxLen=0; vals.forEach(x=>{maxLen=Math.max(maxLen,String(x.word).length);});
let hostGets=false,guestGets=false;
if(maxLen>0) vals.forEach(x=>{if(String(x.word).length===maxLen){if(x.role==='host')hostGets=true;if(x.role==='guest')guestGets=true;}});
const sc=scoresSnap.val()||{host:0,guest:0};
if(hostGets) sc.host=Number(sc.host||0)+10;
if(guestGets) sc.guest=Number(sc.guest||0)+10;
await mpRoomRef.update({scores:sc,longestBonus:{maxLen,host:hostGets,guest:guestGets},bonusApplied:true});
}
async function hostResolveMatchEnd(){
if(mpRole!=='host'||!mpRoomRef) return;
await waitForBothEndReady(1400);
await hostApplyLongestWordBonus();
const [gsSnap,scoreSnap]=await Promise.all([mpRoomRef.child('gameState').once('value'),mpRoomRef.child('scores').once('value')]);
const gameState=gsSnap.val()||{}; if(gameState.status!=='playing') return;
const sc=scoreSnap.val()||{host:0,guest:0}; const hs=Number(sc.host||0),guestScore=Number(sc.guest||0);
const randomRoom=isRandomHumanRoom();
await mpRoomRef.update({'finalWinner':hs===guestScore?'tie':(hs>guestScore?'host':'guest'),'gameState/status':'finished','gameState/startAt':0,'rematch':{host:false,guest:false,expiresAt:0,round:Number(gameState.round||1)},'pendingRound':null});
// Özel davetli odalarda bir sonraki tur arka planda hazırlanır.
if(!randomRoom) hostPrepareNextRound().catch(()=>{});
}

function clearVictoryPresentation(){
  stopGrandCelebrationFx();
  stopWinnerConfettiWaterfall();
  document.querySelectorAll('.victory-badge,.victory-avatar-crown').forEach(el=>el.remove());
  ['final-p1-card','final-p2-card'].forEach(id=>document.getElementById(id)?.classList.remove('victory-card','victory-sky','victory-flash-strong','kd-winner-glow'));
  ['final-p1-name','final-p2-name','final-score-val-p1','final-score-val-p2'].forEach(id=>document.getElementById(id)?.classList.remove('winner-pulse','winner-name-big','winner-score-big'));
  ['final-p1-avatar','final-p2-avatar'].forEach(id=>document.getElementById(id)?.classList.remove('winner-avatar-big'));
}
function setGameoverOutcome(won){
  const heading=document.getElementById('gameover-heading');
  if(!heading)return;
  heading.textContent=won===true?'KAZANDIN!!':won===false?'Yenilgi :(':'BERABERE';
  heading.style.color=won===true?'#b45309':won===false?'#475569':'#2563eb';
}
function decorateWinnerCard(side){
  clearVictoryPresentation();
  const card=document.getElementById(side==='p1'?'final-p1-card':'final-p2-card');
  if(!card) return;
  card.classList.add('victory-card');
  if(side==='p2') card.classList.add('victory-sky');
}
function emphasizeWinner(side){
  if(!side)return;
  decorateWinnerCard(side);
  const card=document.getElementById(side==='p1'?'final-p1-card':'final-p2-card');
  const name=document.getElementById(side==='p1'?'final-p1-name':'final-p2-name');
  const score=document.getElementById(side==='p1'?'final-score-val-p1':'final-score-val-p2');
  const avatar=document.getElementById(side==='p1'?'final-p1-avatar':'final-p2-avatar');
  name?.classList.add('winner-pulse','winner-name-big');
  score?.classList.add('winner-pulse','winner-score-big');
  avatar?.classList.add('winner-avatar-big');
  card?.classList.add('victory-flash-strong','kd-winner-glow');
  setTimeout(()=>card?.classList.remove('victory-flash-strong'),2200);
  spawnGlobalResultConfetti(side);
  launchGrandCelebration(side);
  startWinnerConfettiWaterfall(side);
}
function showRandomResultExitButton(){
const actions=document.getElementById('gameover-actions');
const replay=document.getElementById('btn-play-again');
const exitBtn=document.getElementById('btn-game-exit');
if(actions){actions.classList.remove('hidden');actions.style.setProperty('display','grid','important');}
if(replay){replay.disabled=false;replay.classList.remove('hidden');replay.style.setProperty('display','flex','important');replay.textContent='YENİDEN OYNA';replay.classList.remove('rematch-pulse');}
if(exitBtn){exitBtn.disabled=false;exitBtn.classList.remove('hidden');exitBtn.style.setProperty('display','flex','important');exitBtn.textContent='ÇIKIŞ';}
}

function setRandomAutoExitNotice(visible){
const el=document.getElementById('random-auto-exit-note');
if(!el) return;
el.style.display=visible?'block':'none';
if(visible) el.textContent='5 SANİYE İÇİNDE ANA SAYFAYA DÖNÜLECEK';
}
function armRandomResultAutoExit(d){
if(!d || !isRandomHumanRoom()) return false;
const finalWinner=String(d.finalWinner||'');
if(!['host','guest','tie'].includes(finalWinner)) return false;
const autoKey=`${mpRoomCode||''}|${Number(d.round||1)}`;
showRandomResultExitButton();
const inline=document.getElementById('rematch-inline-status');
if(inline){inline.classList.add('hidden');inline.textContent='';}
setRandomAutoExitNotice(true);
// Kritik: sayaç sonuç ekranının çiziminden ve kutlama efektlerinden bağımsızdır.
// Aynı maç için yalnız bir kez kurulur ve Firebase güncellemeleri onu resetleyemez.
if(randomResultAutoExitTimer && randomResultAutoExitKey===autoKey) return true;
if(randomResultAutoExitTimer){clearTimeout(randomResultAutoExitTimer);randomResultAutoExitTimer=null;}
randomResultAutoExitKey=autoKey;
const capturedRef=mpRoomRef;
const capturedRole=mpRole;
randomResultAutoExitTimer=setTimeout(()=>{
randomResultAutoExitTimer=null;
finishRandomMatchAfterResult(autoKey,capturedRef,capturedRole);
},5000);
return true;
}

function showMultiplayerSeriesResult(d){
if(!d||d.status!=='finished') return;
const finalWinner=String(d.finalWinner||'');
if(!['host','guest','tie'].includes(finalWinner)) return;
if(isPrivateFriendRoom()) forcePrivateResultActions();
const resultSig=[Number(d.round||1),finalWinner,Number(d.scores?.host||0),Number(d.scores?.guest||0),Number(d.longestBonus?.maxLen||0)].join('|');
if(resultSig===mpLastResultRenderSig) return;
const previewKey=`mp|${mpRoomCode||''}|${resultSig}`;
if(!resultPreviewDoneKeys.has(previewKey)){
  resultPreviewDoneKeys.add(previewKey);
  isMatchActive=false;clearInterval(timerInterval);clearInterval(mpClock);clearTimeout(botInterval);
  showTimeUpPreview(()=>showMultiplayerSeriesResult(d));
  return;
}
mpLastResultRenderSig=resultSig;
clearVictoryPresentation();
isMatchActive=false;clearInterval(timerInterval);clearInterval(mpClock);clearTimeout(botInterval);
document.getElementById('modal-gameover')?.classList.remove('hidden');
const sc=d.scores||{host:0,guest:0};
const p1Name=document.getElementById('p1-title').textContent,p2Name=document.getElementById('p2-title').textContent;
document.getElementById('final-p1-name').textContent=p1Name;document.getElementById('final-p2-name').textContent=p2Name;
document.getElementById('final-score-val-p1').textContent=Number(sc.host||0);document.getElementById('final-score-val-p2').textContent=Number(sc.guest||0);
renderGameoverWordLists();setLongestBonusBadges(!!d.longestBonus?.host,!!d.longestBonus?.guest);
const heading=document.getElementById('gameover-heading'),p1NameEl=document.getElementById('final-p1-name'),p2NameEl=document.getElementById('final-p2-name'),p1ScoreEl=document.getElementById('final-score-val-p1'),p2ScoreEl=document.getElementById('final-score-val-p2');
[p1NameEl,p2NameEl,p1ScoreEl,p2ScoreEl].forEach(el=>el?.classList.remove('winner-pulse','winner-name-big','winner-score-big')); const p1AvatarEl=document.getElementById('final-p1-avatar'),p2AvatarEl=document.getElementById('final-p2-avatar'); [p1AvatarEl,p2AvatarEl].forEach(el=>el?.classList.remove('winner-avatar-big'));
const c1=document.getElementById('final-p1-card'),c2=document.getElementById('final-p2-card');[c1,c2].forEach(c=>{if(c){c.classList.remove('kd-winner-glow');c.style.transform='';c.style.filter='';c.style.background='';c.style.borderRadius='';c.style.padding='';}});
if(d.finalWinner==='host'){if(c1){c1.style.background='rgba(254,243,199,.9)';c1.style.borderRadius='16px';c1.style.padding='8px';}if(c2)c2.style.filter='saturate(.7) opacity(.82)';setGameoverOutcome(mpRole==='host');p1ScoreEl?.classList.add('winner-score-big');emphasizeWinner('p1');}
else if(d.finalWinner==='guest'){if(c2){c2.style.background='rgba(224,242,254,.92)';c2.style.borderRadius='16px';c2.style.padding='8px';}if(c1)c1.style.filter='saturate(.7) opacity(.82)';setGameoverOutcome(mpRole==='guest');p2ScoreEl?.classList.add('winner-score-big');emphasizeWinner('p2');}
else {setGameoverOutcome(null);}
const replay=document.getElementById('btn-play-again');
const exitBtn=document.getElementById('btn-game-exit');
const inline=document.getElementById('rematch-inline-status');
const actions=document.getElementById('gameover-actions');
const randomResultSession=isRandomHumanRoom();
if(randomResultSession){
  // v233: butonlar ve bildirim armRandomResultAutoExit tarafından yönetilir.
  // Burada yalnız görünümün yanlışlıkla geri açılmamasını garanti ediyoruz.
  armRandomResultAutoExit(d);
}else{
  setRandomAutoExitNotice(false);
  forcePrivateResultActions();
  renderRematchState(d);
}
}

function attachRoomListener(){
if(!mpRoomRef) return;
detachMultiplayerListeners();
mpLastRoomMetaSig='';

const bindControl=(path,event,handler)=>{
const ref=mpRoomRef.child(path); ref.on(event,handler); mpControlListeners.push({ref,event,handler});
};

mpListener=async snap=>{
const gs=snap.val();
const previousRound=Number(mpRoomData?.round||0);
if(!gs){
  if(mpRole && !mpExitHandling){
    const silentRandomFinish=isRandomHumanRoom() && mpState===MP_STATES.FINISHED;
    if(!silentRandomFinish) showToast('Oda kapatıldı.','rose');
    returnToHomeFromMultiplayer();
  }
  return;
}
mpRoomData={...(mpRoomData||{}),...gs};
if(!['countdown','playing'].includes(String(gs.status||''))) clearOpponentDisconnectGrace();
const roomBoardSig=Array.isArray(gs.board)?boardSignature(gs.board):'';
const metaSig=[gs.status,Number(gs.startAt||0),Number(gs.round||1),roomBoardSig,mpRoomData.guestId||'',!!mpRoomData.guestOnline,mpRoomData.inviteGuest||'',!!mpRoomData.rematch?.host,!!mpRoomData.rematch?.guest,Number(mpRoomData.rematch?.expiresAt||0),mpRoomData.finalWinner||''].join('|');
if(metaSig===mpLastRoomMetaSig) return;
mpLastRoomMetaSig=metaSig;

if(gs.status==='waiting'){
setMpState(MP_STATES.WAITING);
const inviteAccepted = /^random-match-/.test(String(mpRoomMode||'')) || mpRoomData.inviteGuest==='accepted';
if(mpRole==='host'){
if(!mpRoomData.guestId || !mpRoomData.guestOnline || !inviteAccepted){
if(mpEntered) document.getElementById('modal-mp-waiting')?.classList.remove('hidden');
else document.getElementById('modal-mp-waiting')?.classList.add('hidden');
}else{
stopInviteWaitCountdown();
document.getElementById('modal-mp-waiting')?.classList.add('hidden');
if(!mpEntered) await enterMultiplayerRoom();
await hostStartWaitingRound();
}
}
}
if(gs.status==='countdown'){

setMpState(MP_STATES.COUNTDOWN); document.getElementById('modal-mp-waiting')?.classList.add('hidden');
document.getElementById('modal-gameover')?.classList.add('hidden');
document.getElementById('modal-rematch-waiting')?.classList.add('hidden');
const localSig=Array.isArray(gridBoard)&&gridBoard.length?boardSignature(gridBoard):'';
const isNewRound=Number(gs.round||1)>previousRound;
if(isNewRound || (roomBoardSig && localSig!==roomBoardSig)){
mpEntered=false;mpStarted=false;clearInterval(timerInterval);timerInterval=null;isMatchActive=false;
resetMultiplayerRoundVisualState();
if(Array.isArray(gs.board) && gs.board.length===BOARD_SIZE) renderProvidedBoard(gs.board);
}
if(!mpEntered) await enterMultiplayerRoom();
if(gs.startAt && !mpStarted) startSyncedMatch(gs);
}
if(gs.status==='playing'){if(!mpEntered) await enterMultiplayerRoom();activateMultiplayerPlaying(gs);}
if(gs.status==='finished'){
setMpState(MP_STATES.FINISHED); document.getElementById('modal-rematch-waiting')?.classList.add('hidden');
const d={...(mpRoomData||{}),...gs};
// v233: sonuç kesinleştiği anda, render/konfeti kodundan bağımsız otomatik çıkışı kur.
if(isRandomHumanRoom()){
showRandomResultExitButton();
showMultiplayerSeriesResult(d);
}else{
forcePrivateResultActions();
const rematchRequested=Number(d.rematch?.round||0)===Number(gs.round||1) && (!!d.rematch?.host || !!d.rematch?.guest);
if(rematchRequested) showImmediateRematchSync();
else showMultiplayerSeriesResult(d);
}
}
};
mpRoomRef.child('gameState').on('value',mpListener);

bindControl('guestId','value',snap=>{mpRoomData={...(mpRoomData||{}),guestId:snap.val()||null}; if(mpRoomData.status==='waiting'&&mpListener) mpRoomRef.child('gameState').once('value').then(mpListener);});
bindControl('presence/guest','value',snap=>{const v=snap.val()||{};const online=isOnline(v);mpRoomData={...(mpRoomData||{}),guestOnline:online}; if(mpRole==='host') handleOpponentPresenceState(online); if(mpRoomData.status==='waiting'&&mpListener) mpRoomRef.child('gameState').once('value').then(mpListener);});
bindControl('presence/host','value',snap=>{const v=snap.val()||{};const online=isOnline(v);mpRoomData={...(mpRoomData||{}),hostOnline:online}; if(mpRole==='guest') handleOpponentPresenceState(online);});
bindControl('invite/guest','value',snap=>{mpRoomData={...(mpRoomData||{}),inviteGuest:snap.val()||null}; if(mpRoomData.status==='waiting'&&mpListener) mpRoomRef.child('gameState').once('value').then(mpListener);});
bindControl('rematch','value',snap=>{const r=snap.val()||{};mpRoomData={...(mpRoomData||{}),rematch:r}; if(mpRoomData.status==='finished'&&!isRandomHumanRoom()){const d={...mpRoomData,status:'finished'};forcePrivateResultActions();renderRematchState(d); const currentRoundRequest=Number(r.round||0)===Number(mpRoomData.round||1) && (!!r.host||!!r.guest); if(currentRoundRequest){showImmediateRematchSync(); if(mpRole==='host') hostStartRematch();}}});
bindControl('finalWinner','value',snap=>{mpRoomData={...(mpRoomData||{}),finalWinner:snap.val()||null}; if(mpRoomData.status==='finished'&&mpListener) mpRoomRef.child('gameState').once('value').then(mpListener);});
bindControl('longestBonus','value',snap=>{mpRoomData={...(mpRoomData||{}),longestBonus:snap.val()||null}; if(mpRoomData.status==='finished'&&mpListener) mpRoomRef.child('gameState').once('value').then(mpListener);});
bindControl('roomExit','value',snap=>{const exitSignal=snap.val(); if(exitSignal?.id&&exitSignal.id!==mpLastExitSignalId&&Number(exitSignal.at||0)>=mpSessionJoinedAt-1000){mpLastExitSignalId=exitSignal.id;handleSynchronizedRoomExit(exitSignal.reason||'game-cancelled',exitSignal.by||'');}});
mpScoresListener=mpRoomRef.child('scores').on('value',snap=>{
const sc=snap.val()||{}; mpRoomData={...(mpRoomData||{}),scores:sc};
if(mpRole==='host'){if(!isOwnMpScorePending()){p1Score=Number(sc.host||0);mpLastConfirmedOwnScore=p1Score;}p2Score=Number(sc.guest||0);}else if(mpRole==='guest'){p1Score=Number(sc.host||0);if(!isOwnMpScorePending()){p2Score=Number(sc.guest||0);mpLastConfirmedOwnScore=p2Score;}}else{p1Score=Number(sc.host||0);p2Score=Number(sc.guest||0);} updateScores();
});

mpWordsListener=mpRoomRef.child('words').on('child_added',snap=>{
const ev=snap.val(),key=snap.key;if(!ev||!key||mpSeenWordEvents.has(key))return;
const activeRound=Number(mpRoomData?.round||1), eventRound=Number(ev.round||1);
if(eventRound!==activeRound) return;
mpSeenWordEvents.add(key);const w=String(ev.word||'').toLocaleUpperCase('tr-TR');if(w){mpFoundWords.host.add(w);mpFoundWords.guest.add(w);sessionFoundWords.add(w);recordMatchWord(w,ev.pts,ev.role==='host');}if(ev.role!==mpRole)applyRemoteWordEvent(ev,key);
});
}

function applyRemoteWordEvent(ev){
if(!ev||!ev.word) return;
const path=decodeClaimPath(ev.path);
if(path.length) applyClaimedPath(path,ev.role==='host');
const remoteBadge=addTickerBadge(String(ev.word).toLocaleUpperCase('tr-TR'),ev.role==='host');
flashOpponentWord(path,ev.role==='host',remoteBadge);
let remoteOrigin=null;
const lastPos=(ev.last&&Number.isInteger(ev.last.r)&&Number.isInteger(ev.last.c))?ev.last:(path.length?path[path.length-1]:null);
if(lastPos){
 const lastEl=domCells[lastPos.r*BOARD_SIZE+lastPos.c] || document.getElementById(`cell-${lastPos.r}-${lastPos.c}`);
 const rr=lastEl?.getBoundingClientRect?.();
 if(rr&&rr.width&&rr.height) remoteOrigin={x:rr.left+rr.width/2,y:rr.top+rr.height/2};
}
flyScore(Number(ev.pts||0), ev.role==='host', remoteOrigin);
rewardWordFx(ev.role==='host');
showToast(`${String(ev.word).toLocaleUpperCase('tr-TR')} (+${ev.pts||0})`,ev.role==='host'?'amber':'sky');
}

function playCountdownBeep(n){
const ctx=ensureGameAudio(); if(!ctx) return;
try{
const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime;
o.frequency.value=n===1?760:580+(3-n)*55;
const beepPeak=Math.min(AUDIO_GAIN_CAP,.06*masterSoundVolume*AUDIO_GAIN_BOOST);
g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(Math.max(.0002,beepPeak),t+.01); g.gain.exponentialRampToValueAtTime(.0001,t+.11);
o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.12);
}catch(e){}
}
function startSyncedMatch(d){
if(mpStarted) return;
mpStarted=true; isMatchActive=false; mpLastBeepSecond=null; clearInterval(mpClock);
const modal=document.getElementById('modal-countdown'),num=document.getElementById('countdown-number'),status=document.getElementById('countdown-status');
modal?.querySelector('.mp-demo')?.classList.remove('hidden');
const inviteMsg=document.getElementById('countdown-invite-message');
if(inviteMsg){
inviteMsg.innerHTML='Kapışmaya davet aldınız<br><span class="text-indigo-600">Karşılaşma birazdan başlayacak</span>';
inviteMsg.classList.toggle('hidden', mpRole!=='guest');
}
if(num) num.classList.remove('hidden');
const startAt=Number(d.startAt||0);
if(status){status.innerHTML='<span class="sync-check">✓</span> SENKRON';status.className='countdown-sync-ok';} modal?.classList.remove('hidden');
const tick=()=>{
const left=startAt-serverNow();
if(left>0){
const n=Math.max(1,Math.min(3,Math.ceil(left/1000))); if(num)num.textContent=n;
if(mpLastBeepSecond!==n){mpLastBeepSecond=n;playCountdownBeep(n);}
if(num){num.style.transform=`translate3d(0,0,0) scale(${1+(3-n)*.06})`;num.style.opacity='1';}
return;
}
clearInterval(mpClock); modal?.classList.add('hidden'); modal?.querySelector('.mp-demo')?.classList.add('hidden'); isMatchActive=true; setMpState(MP_STATES.PLAYING);
if(mpRole==='host') mpRoomRef.child('gameState/status').set('playing').catch(()=>{});
remainingSeconds=60; updateGameTimerUI(60);
startMultiplayerTimer(startAt);
};
tick(); mpClock=setInterval(tick,90);
}
function startMultiplayerTimer(startAt){
clearInterval(timerInterval);
lastHeartbeatSecond = null;
lastGongSecond = null;
let lastRenderedSecond = null;
const tick=()=>{
const elapsed=Math.max(0,Math.floor((serverNow()-startAt)/1000)); remainingSeconds=Math.max(0,60-elapsed);
if(remainingSeconds!==lastRenderedSecond){updateGameTimerUI(remainingSeconds);lastRenderedSecond=remainingSeconds;}
maybeHeartbeat(remainingSeconds);
maybeFinalGong(remainingSeconds);
if(remainingSeconds<=0){clearInterval(timerInterval);endGame();}
};
tick(); timerInterval=setInterval(tick,250);
}

function activateMultiplayerPlaying(d){
if(!d || !d.startAt) return;
const timerAlreadyRunning=mpStarted && isMatchActive && mpState===MP_STATES.PLAYING && !!timerInterval;
mpStarted=true;
isMatchActive=true;
setMpState(MP_STATES.PLAYING);
clearInterval(mpClock);
document.getElementById('modal-countdown')?.classList.add('hidden');
document.querySelector('#modal-countdown .mp-demo')?.classList.add('hidden');
document.getElementById('modal-mp-waiting')?.classList.add('hidden');
document.getElementById('modal-gameover')?.classList.add('hidden');
const grid=document.getElementById('scrabble-grid');
if(grid){
grid.style.pointerEvents='auto';
grid.style.touchAction='none';
}
const game=document.getElementById('screen-game');
if(game) game.style.pointerEvents='auto';
if(!timerAlreadyRunning) startMultiplayerTimer(Number(d.startAt));
}
function getLocalMpScore(){
if(!mpRole) return 0;
return mpRole==='host' ? Number(p1Score||0) : Number(p2Score||0);
}
function isOwnMpScorePending(){
return !!mpRole && (mpScoreSyncInFlight || mpScoreSyncTimer!==null || mpScoreDesired!==null);
}
function scheduleMpScoreSync(){
if(!mpRoomRef||!mpRole) return;
mpScoreDesired=Math.max(0,getLocalMpScore());
if(mpScoreSyncInFlight || mpScoreSyncTimer!==null) return;
mpScoreSyncTimer=setTimeout(flushMpScoreSync,0);
}
async function flushMpScoreSync(){
if(mpScoreSyncTimer!==null){ clearTimeout(mpScoreSyncTimer); mpScoreSyncTimer=null; }
if(!mpRoomRef||!mpRole){ mpScoreDesired=null; return; }
if(mpScoreSyncInFlight) return;
const value=Math.max(0,Number(mpScoreDesired??getLocalMpScore()));
mpScoreSyncInFlight=true;
try{
if(mpLastConfirmedOwnScore!==value){
await mpRoomRef.child('scores/'+mpRole).set(value);
mpLastConfirmedOwnScore=value;
}
}catch(e){
console.warn('Score sync retry needed',e);
}finally{
mpScoreSyncInFlight=false;
if(!mpRoomRef||!mpRole){ mpScoreDesired=null; return; }
const latest=Math.max(0,getLocalMpScore());
if(latest!==value){ mpScoreDesired=latest; scheduleMpScoreSync(); }
else mpScoreDesired=null;
}
}
function encodeClaimPath(path){
return path.map(p=>(p.r*BOARD_SIZE+p.c).toString(36)).join('.');
}
function decodeClaimPath(raw){
if(Array.isArray(raw)) return raw;
if(typeof raw!=='string'||!raw) return [];
const out=[];
for(const token of raw.split('.')){
const idx=parseInt(token,36);
if(!Number.isFinite(idx)||idx<0||idx>=BOARD_SIZE*BOARD_SIZE) continue;
out.push({r:Math.floor(idx/BOARD_SIZE),c:idx%BOARD_SIZE});
}
return out;
}
async function forceFlushMpScore(){
if(!mpRoomRef||!mpRole) return;
mpScoreDesired=Math.max(0,getLocalMpScore());
if(mpScoreSyncTimer!==null){ clearTimeout(mpScoreSyncTimer); mpScoreSyncTimer=null; }
while(mpScoreSyncInFlight) await new Promise(r=>setTimeout(r,8));
if(mpScoreSyncTimer!==null){ clearTimeout(mpScoreSyncTimer); mpScoreSyncTimer=null; }
const finalScore=Math.max(0,getLocalMpScore());
mpScoreSyncInFlight=true;
try{
if(mpLastConfirmedOwnScore!==finalScore){
await mpRoomRef.child('scores/'+mpRole).set(finalScore);
mpLastConfirmedOwnScore=finalScore;
}
mpScoreDesired=finalScore;
}finally{
mpScoreSyncInFlight=false;
mpScoreDesired=null;
}
}
async function markMultiplayerEndReady(){
if(!mpRoomRef||!mpRole) return;
await forceFlushMpScore();
await mpRoomRef.child('endReady/'+mpRole).set({ready:true,at:firebase.database.ServerValue.TIMESTAMP});
}
function waitForBothEndReady(timeoutMs=1400){
if(!mpRoomRef) return Promise.resolve(false);
return new Promise(resolve=>{
const ref=mpRoomRef.child('endReady');
let done=false,timer=null;
const finish=v=>{if(done)return;done=true;if(timer)clearTimeout(timer);ref.off('value',onValue);resolve(v);};
const onValue=snap=>{const v=snap.val()||{};if(v.host?.ready&&v.guest?.ready)finish(true);};
ref.on('value',onValue);
timer=setTimeout(()=>finish(false),Math.max(300,timeoutMs||1400));
});
}

function detachMultiplayerListeners(){
clearOpponentDisconnectGrace();
if(mpRoomRef && mpListener){ mpRoomRef.child('gameState').off('value',mpListener); mpListener=null; }
if(mpRoomRef && mpScoresListener){ mpRoomRef.child('scores').off('value',mpScoresListener); mpScoresListener=null; }
if(mpRoomRef && mpWordsListener){ mpRoomRef.child('words').off('child_added',mpWordsListener); mpWordsListener=null; }
for(const x of mpControlListeners.splice(0)){ try{x.ref.off(x.event,x.handler);}catch(e){} }
}
function resetMultiplayerClientState(){
stopInviteWaitCountdown();
stopGrandCelebrationFx();
stopWinnerConfettiWaterfall();
detachMultiplayerListeners();
stopLocalCountdown();
clearInterval(mpClock); mpClock=null;
clearInterval(timerInterval); timerInterval=null;
clearTimeout(botInterval); botInterval=null;
clearTimeout(mpEndResolveTimer); mpEndResolveTimer=null;
if(mpRematchExpiryTimer){clearTimeout(mpRematchExpiryTimer);mpRematchExpiryTimer=null;}
if(randomResultAutoExitTimer){clearTimeout(randomResultAutoExitTimer);randomResultAutoExitTimer=null;} randomResultAutoExitKey=''; setRandomAutoExitNotice(false);
if(mpPresenceRef){try{mpPresenceRef.onDisconnect().cancel().catch(()=>{});}catch(_){} }
if(mpScoreSyncTimer!==null){ clearTimeout(mpScoreSyncTimer); mpScoreSyncTimer=null; }
mpScoreSyncInFlight=false; mpScoreDesired=null; mpLastConfirmedOwnScore=null;
if(pointerFrame){ cancelAnimationFrame(pointerFrame); pointerFrame=0; }
isPointerDown=false; pointerHoldStartedAt=0; clearTimeout(pointerHoldTimer); pointerHoldTimer=null; activePointerId=null; pendingPointer=null; activeGridRect=null; activeGridMetrics=null; isMatchActive=false;
try{ clearPath(); }catch(_){ selectedPath=[]; }
mpEntered=false; mpStarted=false; mpStartBusy=false; mpRematchBusy=false;
mpRoomRef=null; mpRoomCode=null; mpRole=null; mpRoomData=null; mpRoomMode=''; mpRandomMatchSession=false; delete document.body.dataset.randomMatchActive; delete document.body.dataset.privateFriendActive; mpPresenceRef=null; mpLastRoomMetaSig='';
const _ga=document.getElementById('gameover-actions'); if(_ga){_ga.style.removeProperty('display');_ga.classList.remove('hidden');}
const _rp=document.getElementById('btn-play-again'); if(_rp)_rp.style.removeProperty('display');
const _ex=document.getElementById('btn-game-exit'); if(_ex)_ex.style.removeProperty('display');
mpSessionJoinedAt=0; mpExitHandling=false; mpLastExitSignalId=''; reconnectPresenceBusy=false;
mpSeenWordEvents.clear(); mpFoundWords.host.clear(); mpFoundWords.guest.clear(); mpLastResultRenderSig='';
setMpState(MP_STATES.IDLE);
}
function returnToHomeFromMultiplayer(){
const randomExitBtn=document.getElementById('btn-random-result-exit');
if(randomExitBtn){randomExitBtn.disabled=true;randomExitBtn.classList.add('hidden');randomExitBtn.style.removeProperty('display');randomExitBtn.style.removeProperty('visibility');randomExitBtn.style.removeProperty('opacity');}

stopInviteDecisionTimer();
if(randomSearchActive) cleanupRandomQueue(true).catch(()=>{}); else releaseRandomSearchLocal();
resetMultiplayerClientState();
clearInviteFromUrl();
document.getElementById('modal-countdown')?.classList.add('hidden');
document.getElementById('modal-gameover')?.classList.add('hidden');
document.getElementById('modal-rematch-waiting')?.classList.add('hidden');
document.getElementById('modal-mp-waiting')?.classList.add('hidden');
document.getElementById('screen-game')?.classList.add('hidden');
document.getElementById('screen-home')?.classList.remove('hidden');
document.getElementById('friend-invite-panel')?.classList.add('hidden');
document.getElementById('bot-settings-panel')?.classList.add('hidden');
const soloArrowHome=document.getElementById('solo-arrow'); if(soloArrowHome) soloArrowHome.style.transform='';
document.getElementById('mp-room-view')?.classList.add('hidden');
document.getElementById('mp-create-view')?.classList.remove('hidden');
document.getElementById('btn-close-room')?.classList.add('hidden');
restoreHodriMeydanButton();
setRandomStatus('',false);
disconnectFirebaseNetwork();
}


async function discardCurrentPrivateRoom(){
const oldRef=mpRoomRef, oldRole=mpRole, oldMode=mpRoomMode;
if(oldRef && oldRole==='host' && /^invite-only-/.test(String(oldMode||''))){
  detachMultiplayerListeners();
  try{ await closeAndLockPrivateRoom(oldRef,mpRoomCode,'host-discard'); }catch(_){ }
}
if(mpPresenceRef){ try{ await mpPresenceRef.onDisconnect().cancel(); }catch(_){ } }
resetMultiplayerClientState();
clearInviteFromUrl();
}
async function openFreshPrivateRoom(){
if(randomSearchActive) await cleanupRandomQueue(true);
await discardCurrentPrivateRoom();
document.getElementById('friend-invite-panel')?.classList.remove('hidden');
document.getElementById('mp-create-view')?.classList.remove('hidden');
document.getElementById('mp-room-view')?.classList.add('hidden');
await createRoom();
}
const difficultyPanel = document.getElementById('bot-settings-panel');
const soloArrow = document.getElementById('solo-arrow');
function setDifficultyOpen(open) {
difficultyPanel.classList.toggle('hidden', !open);
soloArrow.style.transform = open ? 'rotate(90deg)' : '';
}
document.getElementById('btn-solo-mode').onclick = () => {
document.getElementById('friend-invite-panel').classList.add('hidden');
setDifficultyOpen(difficultyPanel.classList.contains('hidden'));
};
document.getElementById('btn-close-difficulty').onclick = (e) => { e.stopPropagation(); setDifficultyOpen(false); };
document.getElementById('btn-friend-mode').onclick = async() => {
setDifficultyOpen(false);
const panel=document.getElementById('friend-invite-panel');
const willOpen=panel?.classList.contains('hidden');
if(willOpen){
panel?.classList.remove('hidden');
document.getElementById('mp-create-view')?.classList.remove('hidden');
document.getElementById('mp-room-view')?.classList.add('hidden');
}else{
if(mpRoomRef && mpRole) await requestSynchronizedRoomExit('player-exit');
else if(randomSearchActive) await cleanupRandomQueue(true);
panel?.classList.add('hidden');
disconnectFirebaseNetwork();
}
};
document.getElementById('btn-close-friend').onclick = async() => {
if(mpRoomRef && mpRole) await requestSynchronizedRoomExit('player-exit');
else if(randomSearchActive) await cleanupRandomQueue(true);
document.getElementById('friend-invite-panel').classList.add('hidden');
disconnectFirebaseNetwork();
};
document.getElementById('btn-create-room')?.addEventListener('click',openFreshPrivateRoom);
document.getElementById('btn-random-match')?.addEventListener('click',searchRandomOpponent);
let copyLinkEnterTimer=null;
document.getElementById('btn-copy-link').onclick = async()=>{
if(!mpRoomCode)return;
const url=inviteUrl(mpRoomCode);
try{
await navigator.clipboard.writeText(url);
const copiedRoom=mpRoomCode;
const inviteDeadline=serverNow()+60000;
if(mpRole!=='host' || !mpRoomRef || !/^invite-only-/.test(String(mpRoomMode||''))) return;
await mpRoomRef.child('invite').update({guest:'pending',expiresAt:inviteDeadline});
mpRoomData={...(mpRoomData||{}),inviteGuest:'pending',inviteExpiresAt:inviteDeadline};
clearTimeout(copyLinkEnterTimer); copyLinkEnterTimer=null;
setRoomUrl(copiedRoom);
await enterMultiplayerRoom();
if(!mpEntered || mpRoomCode!==copiedRoom || mpRole!=='host') return;
isMatchActive=false;
document.getElementById('modal-mp-waiting')?.classList.remove('hidden');
startInviteWaitCountdown(inviteDeadline);
}catch(e){ showToast('Bağlantı kopyalanamadı.','rose'); }
};
document.getElementById('btn-share-link').onclick = async()=>{
if(!mpRoomCode) return;
const url=inviteUrl(mpRoomCode);
try{
if(navigator.share) await navigator.share({title:'KAPMACA — Meydan Okuma',text:'🔥 60 saniye. Aynı harfler. Kim daha çok kelime bulacak? KAPMACA\'da bana karşı oyna!',url});
else { await navigator.clipboard.writeText(url); showToast('Davet bağlantısı kopyalandı.','emerald'); }
}catch(e){}
};
document.getElementById('btn-close-mp-waiting').onclick=async()=>{
if(mpRoomRef && mpRole){
await requestSynchronizedRoomExit('player-exit');
}else{
document.getElementById('modal-mp-waiting')?.classList.add('hidden');
returnToHomeFromMultiplayer();
}
};

document.getElementById('btn-fullscreen-home')?.addEventListener('click',toggleGameFullscreen);
document.getElementById('btn-fullscreen-game')?.addEventListener('click',toggleGameFullscreen);
window.addEventListener('DOMContentLoaded',async()=>{
const u=new URL(location.href);
const code=String(u.searchParams.get('room')||'').toLowerCase().replace(/[^a-z]/g,'').slice(0,5);
if(!code) return;
document.getElementById('screen-game')?.classList.add('hidden');
document.getElementById('screen-home')?.classList.remove('hidden');
document.getElementById('friend-invite-panel')?.classList.add('hidden');
setDifficultyOpen(false);
const ok=await joinRoom(code);
if(!ok){ disconnectFirebaseNetwork(); return; }
if(ok){
if(mpRole==='guest' && /^invite-only-/.test(String(mpRoomMode||'')) && mpRoomData?.status==='waiting') {
showInviteDecisionModal();
} else if(mpRole==='guest') {
await enterMultiplayerRoom();
} else {
updateFullscreenUi();
}
}
});

document.getElementById('btn-invite-start')?.addEventListener('click',async()=>{
if(mpRole!=='guest'||!mpRoomRef) return;
stopInviteDecisionTimer();
const btn=document.getElementById('btn-invite-start'); if(btn) btn.disabled=true;
try{
const inv=(await mpRoomRef.child('invite').once('value')).val()||{};
if(Number(inv.expiresAt||0)>0 && Number(inv.expiresAt)<=serverNow()){ showToast('Davet süresi doldu.','rose'); await closeAndLockPrivateRoom(mpRoomRef,mpRoomCode,'invite-expired'); returnToHomeFromMultiplayer(); return; }
await mpRoomRef.child('invite/guest').set('accepted');
try{ await ensureWordDataLoaded(); }catch(_){ showToast('Oyun sözlüğü yüklenemedi. Tekrar deneyin.','rose'); if(btn) btn.disabled=false; return; }

document.getElementById('modal-room-invite')?.classList.add('hidden');
await enterMultiplayerRoom();
}catch(e){showToast('Oyun başlatılamadı.','rose'); if(btn) btn.disabled=false;}
});
document.getElementById('btn-invite-cancel')?.addEventListener('click',async()=>{
stopInviteDecisionTimer();
if(mpRole==='guest'&&mpRoomRef){
await mpRoomRef.child('invite/guest').set('declined').catch(()=>{});
await requestSynchronizedRoomExit('player-exit');
}else returnToHomeFromMultiplayer();
});

document.getElementById('btn-close-room').onclick=async()=>{
if(!mpRoomRef || mpRole!=='host') return;
await requestSynchronizedRoomExit('player-exit');
};

document.querySelectorAll('.bot-diff-choice').forEach(btn => {
btn.onclick = async() => {
botDiffLevel = btn.dataset.diff;
document.querySelectorAll('.bot-diff-choice').forEach(b=>b.classList.remove('ring-4','ring-amber-400'));
btn.classList.add('ring-4','ring-amber-400');
setDifficultyOpen(false);
try{ await ensureWordDataLoaded(); prepareGame(); }
catch(err){ console.error('Single game startup failed',err); showToast('Oyun hazırlanamadı. Tekrar deneyin.','rose'); }
};
});
let howtoDemoTimer=null;
function stopHowtoDemo(){clearTimeout(howtoDemoTimer);howtoDemoTimer=null;}
function startHowtoDemo(){
 if(howtoDemoTimer||document.hidden||isFullscreenActive())return;
 const boards=[...document.querySelectorAll('.demo-board')];
 const visibleBoards=()=>boards.filter(board=>!board.closest('.hidden'));
 const demoScreens=['screen-howto','screen-home','modal-room-invite','modal-mp-waiting','modal-rematch-waiting'];
 const demoVisible=()=>demoScreens.some(id=>!document.getElementById(id).classList.contains('hidden'))||(!document.getElementById('modal-countdown').classList.contains('hidden')&&!document.querySelector('#modal-countdown .mp-demo').classList.contains('hidden'));
 const rounds=[
  // v276: Beş kısa hareket; yalnız komşu harf toplamayı gösterir.
  {word:'KAP',path:[7,8,9]},        // soldan sağa
  {word:'CAM',path:[12,11,10]},    // sağdan sola
  {word:'TAŞ',path:[18,11,4]},      // aşağıdan yukarı
  {word:'SAL',path:[6,13,20]},      // yukarıdan aşağı
  {word:'AYAK',path:[0,1,8,7]}      // dirsek/kare benzeri komşu toplama
 ];
 let round=0,step=0;
 function advance(){
  // v274: Tam ekranda ana sayfa / geri sayım demosu CPU ve paint üretmesin.
  // Demo görünür kalır ama animasyon dondurulur.
  if(document.hidden||!demoVisible()||isFullscreenActive()){stopHowtoDemo();return;}
  const item=rounds[round];
  const visible=visibleBoards();
  const setPicked=(count)=>{
    const chars=Array.from(item.word).slice(0,count);
    for(const board of visible){
      const wrap=board.closest('.mp-demo')||board.parentElement;
      const picked=wrap?.querySelector('.demo-picked');
      if(!picked) continue;
      picked.replaceChildren(...chars.map(ch=>{
        const tile=document.createElement('span');
        tile.className='demo-picked-tile';
        tile.textContent=ch;
        return tile;
      }));
    }
  };
  if(step===0){
    for(const board of visible)board.querySelectorAll('.demo-active').forEach(t=>t.classList.remove('demo-active'));
    setPicked(0);
  }
  if(step<item.path.length){
    for(const board of visible)board.querySelectorAll('.demo-tile')[item.path[step]]?.classList.add('demo-active');
    step++;
    setPicked(step);
    howtoDemoTimer=setTimeout(advance,170);
    return;
  }
  round=(round+1)%rounds.length;
  step=0;
  howtoDemoTimer=setTimeout(advance,520);
 }
 advance();
}
const rematchDemo=document.querySelector('#modal-mp-waiting .mp-demo')?.cloneNode(true);
if(rematchDemo) document.getElementById('rematch-wait-sub')?.after(rematchDemo);
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){stopHowtoDemo();stopWinnerConfettiWaterfall();}
  else startHowtoDemo();
});
new MutationObserver(()=>{if(!document.getElementById('screen-home').classList.contains('hidden'))startHowtoDemo();}).observe(document.getElementById('screen-home'),{attributes:true,attributeFilter:['class']});
for(const id of ['modal-room-invite','modal-mp-waiting','modal-rematch-waiting','modal-countdown'])new MutationObserver(()=>startHowtoDemo()).observe(document.getElementById(id),{attributes:true,attributeFilter:['class']});
startHowtoDemo();

// v284: Ana sayfa alt menüleri tek merkezi click yöneticisiyle çalışır.
// Böylece başka bir modülün handler'ı bozulsa bile Ayarlar/Oynanış/Hakkında/Sözlük/Destek bağımsız kalır.
document.addEventListener('click',(event)=>{
  const target=event.target?.closest?.('#btn-settings,#btn-settings-back,#btn-howto,#btn-howto-back,#btn-about,#btn-about-back,#btn-open-dictionary,#btn-support,#btn-close-support');
  if(!target) return;
  switch(target.id){
    case 'btn-settings':
      setMasterSoundVolume(masterSoundVolume);
      document.getElementById('screen-settings')?.classList.remove('hidden');
      break;
    case 'btn-settings-back':
      document.getElementById('screen-settings')?.classList.add('hidden');
      break;
    case 'btn-howto':
      document.getElementById('screen-howto')?.classList.remove('hidden');
      startHowtoDemo();
      break;
    case 'btn-howto-back':
      document.getElementById('screen-howto')?.classList.add('hidden');
      break;
    case 'btn-about':
      document.getElementById('screen-about')?.classList.remove('hidden');
      break;
    case 'btn-about-back':
      document.getElementById('screen-about')?.classList.add('hidden');
      break;
    case 'btn-open-dictionary':
      ensureWordDataLoaded().then(openDictionary).catch(()=>showToast('Sözlük yüklenemedi. Tekrar deneyin.','rose'));
      break;
    case 'btn-support':{
      event.preventDefault();
      document.getElementById('screen-support')?.classList.remove('hidden');
      break;
    }
    case 'btn-close-support':
      document.getElementById('screen-support')?.classList.add('hidden');
      if(location.hash==='#screen-support') history.replaceState(null,'',location.pathname+location.search);
      break;
  }
});
const supportScreen=document.getElementById('screen-support');
supportScreen?.addEventListener('click',event=>{if(event.target===supportScreen){supportScreen.classList.add('hidden');if(location.hash==='#screen-support')history.replaceState(null,'',location.pathname+location.search);}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&supportScreen&&!supportScreen.classList.contains('hidden')){supportScreen.classList.add('hidden');if(location.hash==='#screen-support')history.replaceState(null,'',location.pathname+location.search);}});
const soundRange=document.getElementById('sound-volume-range');
const soundMuted=document.getElementById('sound-muted');
let soundPreviewAt=0;
function previewSoundLevel(){
  if(masterSoundVolume<=0) return;
  const now=performance.now();
  if(now-soundPreviewAt<75) return;
  soundPreviewAt=now;
  ensureGameAudio();
  playTone(620,.055,.065,'sine',760);
}
soundRange?.addEventListener('pointerdown',()=>{
  const level=Math.max(1,Math.min(5,Number(soundRange.value||1)));
  setMasterSoundVolume(level/5);
  previewSoundLevel();
});
soundRange?.addEventListener('input',()=>{
  const level=Math.max(1,Math.min(5,Number(soundRange.value||1)));
  setMasterSoundVolume(level/5);
  previewSoundLevel();
});
soundMuted?.addEventListener('change',()=>{
  if(soundMuted.checked){
    if(masterSoundVolume>0) lastNonMutedSoundVolume=masterSoundVolume;
    setMasterSoundVolume(0);
  }else{
    setMasterSoundVolume(Math.max(1,Math.min(5,Math.round((lastNonMutedSoundVolume>0?lastNonMutedSoundVolume:.8)*5)))/5);
    previewSoundLevel();
  }
});
setMasterSoundVolume(masterSoundVolume);

updateFullscreenUi();

function prepareGame() {
stopLocalCountdown();
activeGameMode='single'; setLongestBonusBadges(false,false);
document.getElementById('p1-title').textContent='OYUNCU';
document.getElementById('p2-title').textContent='BİLGİSAYAR';
p1Score=0; p2Score=0; resetRewardFx(); updateScores(); remainingSeconds=60;
resetMatchWordResults(); resetSeriesWordResults();
sessionFoundWords.clear();
const ticker=document.getElementById('words-ticker'); if(ticker)ticker.innerHTML='';
try{
  buildGrid();
}catch(err){
  console.error('Single game board startup error',err);
  showToast('Tahta hazırlanamadı. Tekrar deneyin.','rose');
  return;
}
document.getElementById('screen-home').classList.add('hidden');
document.getElementById('screen-game').classList.remove('hidden');
triggerCountdownSequence(()=>{isMatchActive=true;startTimer();planBot();});
}

function triggerCountdownSequence(onComplete) {
stopLocalCountdown();
const modal=document.getElementById('modal-countdown');
modal?.querySelector('.mp-demo')?.classList.remove('hidden');
const numEl=document.getElementById('countdown-number');
const statusEl=document.getElementById('countdown-status');
const inviteMsg=document.getElementById('countdown-invite-message');
if(inviteMsg) inviteMsg.classList.add('hidden');
if(statusEl){ statusEl.textContent='SÖZCÜKLERİ YAKALA!'; statusEl.className='text-slate-800 font-black text-xs tracking-widest uppercase mt-3 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm'; statusEl.classList.remove('hidden'); }
modal?.classList.remove('hidden');
let n=3;
const paint=()=>{
if(!numEl) return;
numEl.textContent=String(n);
numEl.style.opacity='1';
numEl.style.transform='scale(1.16)';
playCountdownBeep(n);
requestAnimationFrame(()=>{ numEl.style.transform='scale(1)'; });
};
paint();
localCountdownInterval=setInterval(()=>{
n--;
if(n>0){ paint(); return; }
clearInterval(localCountdownInterval); localCountdownInterval=null;
if(numEl){ numEl.style.opacity='0'; numEl.style.transform='scale(1.28)'; }
localCountdownTimeout=setTimeout(()=>{
if(numEl){ numEl.style.opacity='1'; numEl.style.transform='scale(1)'; }
modal?.classList.add('hidden');
localCountdownTimeout=null;
onComplete();
},120);
},1000);
}

const BOARD_SIZE = 9;
const BOARD_DIRS = [
{dr:0,dc:1},{dr:0,dc:-1},{dr:1,dc:0},{dr:-1,dc:0}
];
const SEED_VOWELS = new Set(['A','E','I','İ','O','Ö','U','Ü']);
function isFriendlyBoardSeed(word){
const w=String(word||'');
if(w.length<3) return true;
let vowels=0, consonantRun=0, maxConsonantRun=0, rare=0;
for(let i=0;i<w.length;i++){
const ch=w[i];
if(SEED_VOWELS.has(ch)){vowels++;consonantRun=0;}else{consonantRun++;if(consonantRun>maxConsonantRun)maxConsonantRun=consonantRun;}
if(ch==='J'||ch==='F') rare++;
if(i>=2 && ch===w[i-1] && ch===w[i-2]) return false;
}
const ratio=vowels/Math.max(1,w.length);
return vowels>0 && ratio>=.22 && ratio<=.72 && maxConsonantRun<=3 && rare<=1;
}
let FRIENDLY_WORDS_BY_LENGTH = new Map();
let BOARD_POOLS = {easy2:[],medium34:[],bridge5:[],hidden69:[]};
function rebuildBoardWordPools(){
FRIENDLY_WORDS_BY_LENGTH=new Map();
for(const [len,list] of GAME_WORDS_BY_LENGTH){
  const friendly=list.filter(isFriendlyBoardSeed);
  FRIENDLY_WORDS_BY_LENGTH.set(len,friendly.length>=Math.min(12,list.length)?friendly:list);
}
BOARD_POOLS={
  easy2:GAME_WORDS_BY_LENGTH.get(2)||[],
  medium34:[...(FRIENDLY_WORDS_BY_LENGTH.get(3)||[]),...(FRIENDLY_WORDS_BY_LENGTH.get(4)||[])],
  bridge5:FRIENDLY_WORDS_BY_LENGTH.get(5)||[],
  hidden69:[...(FRIENDLY_WORDS_BY_LENGTH.get(6)||[]),...(FRIENDLY_WORDS_BY_LENGTH.get(7)||[]),...(FRIENDLY_WORDS_BY_LENGTH.get(8)||[]),...(FRIENDLY_WORDS_BY_LENGTH.get(9)||[])]
};
}

const BOARD_BALANCE = Object.freeze({
easyMin: 16, easyIdeal: 32, easyMax: 58,
mediumMin: 105, mediumIdeal: 178,
bridgeMin: 18, bridgeIdeal: 44,
coreMin: 126, coreIdeal: 216,
hiddenMin: 8, hiddenIdeal: 17, hiddenMax: 30,
totalMin: 205, totalIdeal: 350,
coverageMin: 57, coverageIdeal: 77,
longVarietyMin: 3, initialVarietyMin: 16
});
const FILL_LETTERS = "AAAAAAAABCCÇDDEEEEEEEFGĞHHIIIIIİİİİJKKKLLLMMMNNNOOÖPRRRRSSSŞTTTUUÜVYYZ";

function shuffledSample(source, count) {
const out = [];
const used = new Set();
const n = Math.min(count, source.length);
while (out.length < n) {
const idx = Math.floor(Math.random() * source.length);
if (!used.has(idx)) { used.add(idx); out.push(source[idx]); }
}
return out;
}

function tryPlaceWord(board, word, requireCross = false) {
for (let attempt = 0; attempt < 55; attempt++) {
const dir = BOARD_DIRS[Math.floor(Math.random() * BOARD_DIRS.length)];
const r = Math.floor(Math.random() * BOARD_SIZE), c = Math.floor(Math.random() * BOARD_SIZE);
const er = r + (word.length - 1) * dir.dr, ec = c + (word.length - 1) * dir.dc;
if (er < 0 || er >= BOARD_SIZE || ec < 0 || ec >= BOARD_SIZE) continue;
let crosses = 0, ok = true;
for (let i = 0; i < word.length; i++) {
const rr = r + i * dir.dr, cc = c + i * dir.dc;
const old = board[rr][cc];
if (old && old !== word[i]) { ok = false; break; }
if (old === word[i]) crosses++;
}
if (!ok || (requireCross && crosses === 0)) continue;
for (let i = 0; i < word.length; i++) board[r+i*dir.dr][c+i*dir.dc] = word[i];
return true;
}
return false;
}

function makeCandidateBoard() {
const board = Array.from({length:BOARD_SIZE}, () => Array(BOARD_SIZE).fill(''));

const bridgeSeeds = shuffledSample(BOARD_POOLS.bridge5, 56);
const mediumSeeds = shuffledSample(BOARD_POOLS.medium34, 240);
const easySeeds = shuffledSample(BOARD_POOLS.easy2, 72);

let placedLong = 0;
for (const len of [9,8,7,6]) {
const candidates = shuffledSample(FRIENDLY_WORDS_BY_LENGTH.get(len) || GAME_WORDS_BY_LENGTH.get(len) || [], 14);
for (const word of candidates) {
if (tryPlaceWord(board, word, placedLong >= 3)) { placedLong++; break; }
}
}
const longSeeds = shuffledSample(BOARD_POOLS.hidden69, 30);
for (const word of longSeeds) {
if (placedLong >= 9) break;
if (tryPlaceWord(board, word, placedLong >= 5)) placedLong++;
}
let bridgePlaced=0;
for (const word of bridgeSeeds) {
if (bridgePlaced >= 14) break;
if (tryPlaceWord(board, word, true) || tryPlaceWord(board, word, false)) bridgePlaced++;
}
let mediumPlaced=0;
for (const word of mediumSeeds) {
if (mediumPlaced >= 32) break;
if (tryPlaceWord(board, word, true) || tryPlaceWord(board, word, false)) mediumPlaced++;
}
let easyPlaced = 0;
for (const word of easySeeds) {
if (easyPlaced >= 5) break;
if (tryPlaceWord(board, word, false)) easyPlaced++;
}

for (let r=0;r<BOARD_SIZE;r++) for (let c=0;c<BOARD_SIZE;c++) {
if (!board[r][c]) board[r][c] = FILL_LETTERS[Math.floor(Math.random()*FILL_LETTERS.length)];
}
return board;
}

function analyzeBoardWords(words) {
const stats = { easy:0, medium:0, bridge:0, core:0, hidden:0, total:words.length, coverage:0, longVariety:0, initialVariety:0 };
const productiveCells = new Set();
const longLengths = new Set();
const initials = new Set();
for (const item of words) {
const n = item.word.length;
if (n === 2) stats.easy++;
else if (n <= 4) stats.medium++;
else if (n === 5) stats.bridge++;
if (n >= 3 && n <= 6) stats.core++;
if (n >= 6 && n <= 9) { stats.hidden++; longLengths.add(n); }
if (n >= 3 && item.word) initials.add(item.word[0]);
if (n >= 2 && n <= 6 && Array.isArray(item.path)) {
for (const p of item.path) productiveCells.add(`${p.r},${p.c}`);
}
}
stats.coverage = productiveCells.size;
stats.longVariety = longLengths.size;
stats.initialVariety = initials.size;

const b = BOARD_BALANCE;
const accepted = stats.easy >= b.easyMin && stats.easy <= b.easyMax &&
stats.medium >= b.mediumMin && stats.bridge >= b.bridgeMin && stats.core >= b.coreMin &&
stats.hidden >= b.hiddenMin && stats.hidden <= b.hiddenMax && stats.total >= b.totalMin && stats.coverage >= b.coverageMin &&
stats.longVariety >= b.longVarietyMin && stats.initialVariety >= b.initialVarietyMin;
const closeness = (v, ideal, weight) => Math.min(v, ideal) * weight - Math.max(0, v-ideal) * weight * 0.18;
let score = closeness(stats.easy,b.easyIdeal,2.2) + closeness(stats.medium,b.mediumIdeal,2.5) +
closeness(stats.bridge,b.bridgeIdeal,2.1) + closeness(stats.core,b.coreIdeal,2.4) +
closeness(stats.hidden,b.hiddenIdeal,3.2) + Math.min(stats.total,b.totalIdeal) * 0.30 +
closeness(stats.coverage,b.coverageIdeal,2.6) + stats.longVariety * 12 + stats.initialVariety * 2.5;
if (stats.easy > b.easyMax) score -= (stats.easy-b.easyMax) * 8;
if (stats.hidden > b.hiddenMax) score -= (stats.hidden-b.hiddenMax) * 5;
const easyRatio = stats.total ? stats.easy / stats.total : 0;
if (easyRatio > .28) score -= (easyRatio-.28) * 900;
if (!accepted) {
score -= Math.max(0,b.easyMin-stats.easy)*6 + Math.max(0,stats.easy-b.easyMax)*8 +
Math.max(0,b.mediumMin-stats.medium)*5 + Math.max(0,b.bridgeMin-stats.bridge)*5 +
Math.max(0,b.coreMin-stats.core)*4 + Math.max(0,b.hiddenMin-stats.hidden)*12 +
Math.max(0,b.totalMin-stats.total)*1.4 + Math.max(0,b.coverageMin-stats.coverage)*5 +
Math.max(0,b.longVarietyMin-stats.longVariety)*16 + Math.max(0,b.initialVarietyMin-stats.initialVariety)*4;
} else score += 1100;
return {stats, accepted, score};
}

let prewarmedBoard = null;
const RECENT_BOARD_KEY = 'kd_recent_board_profiles_v164_9x9';

function boardSignature(board) {
return board.map(row => row.join('')).join('|');
}
function boardWordProfile(words) {
return words.filter(x=>x?.word?.length>=5).sort((a,b)=>b.word.length-a.word.length||a.word.localeCompare(b.word,'tr')).slice(0,28).map(x=>x.word);
}
function getRecentBoardProfiles() {
try {
const x = JSON.parse(safeStorageGet('session',RECENT_BOARD_KEY) || '[]');
return Array.isArray(x) ? x.slice(-6) : [];
} catch (_) { return []; }
}
function boardProfileSimilarity(words, profile) {
if(!Array.isArray(profile)||!profile.length) return 0;
const now=new Set(boardWordProfile(words));
let hit=0; for(const w of profile) if(now.has(w)) hit++;
return hit / Math.max(1,Math.min(now.size,profile.length));
}
function rememberBoard(board, words=[]) {
try {
const list = getRecentBoardProfiles();
list.push(boardWordProfile(words));
safeStorageSet('session',RECENT_BOARD_KEY,JSON.stringify(list.slice(-6)));
} catch (_) {}
}
function packBoardResult(board, words) {
return { board, words };
}
function generateOptimizedBoard(maxCandidates = 3) {
let bestBoard = null, bestWords = [], bestEval = {score:-Infinity, accepted:false, stats:null};
const recentProfiles = getRecentBoardProfiles();
const tries = Math.max(maxCandidates, 2);
for (let i=0; i<tries; i++) {
const candidate = makeCandidateBoard();
const solved = solveBoardWords(candidate);
const evaluation = analyzeBoardWords(solved);
let similarity=0; for(const profile of recentProfiles) similarity=Math.max(similarity,boardProfileSimilarity(solved,profile));
if(similarity>.48) evaluation.score-=500; else if(similarity>.34) evaluation.score-=180;
if (evaluation.score > bestEval.score) { bestBoard = candidate; bestWords = solved; bestEval = evaluation; }
const st = evaluation.stats;
if (evaluation.accepted && st.easy <= BOARD_BALANCE.easyMax &&
st.medium >= BOARD_BALANCE.mediumIdeal && st.core >= BOARD_BALANCE.coreIdeal &&
st.hidden >= BOARD_BALANCE.hiddenIdeal && st.hidden <= BOARD_BALANCE.hiddenMax &&
st.total >= BOARD_BALANCE.totalIdeal && st.coverage >= BOARD_BALANCE.coverageIdeal &&
st.longVariety >= 4 && st.initialVariety >= BOARD_BALANCE.initialVarietyMin) break;
}
const board = bestBoard || makeCandidateBoard();
const words = bestWords.length ? bestWords : solveBoardWords(board);
return packBoardResult(board, words);
}
function scheduleBoardPrewarm() {
if(!wordDataReady) return;
const work = () => {
if (prewarmedBoard || !wordDataReady) return;
prewarmedBoard = generateOptimizedBoard(2);
};
if ('requestIdleCallback' in window) requestIdleCallback(work, {timeout:1200});
else setTimeout(work, 80);
}

function takeDistinctNextBoard(currentBoard, maxAttempts=5){
const currentSig=Array.isArray(currentBoard)&&currentBoard.length===BOARD_SIZE ? boardSignature(currentBoard) : '';
let candidate=prewarmedBoard; prewarmedBoard=null;
if(candidate && boardSignature(candidate.board)!==currentSig) return candidate;
for(let i=0;i<maxAttempts;i++){
const next=generateOptimizedBoard(i<2?2:3);
if(boardSignature(next.board)!==currentSig) return next;
}
// 9x9 rastgele tahta için pratikte buraya düşülmez; yine de kesin farklılık sağla.
let next=generateOptimizedBoard(3);
if(boardSignature(next.board)===currentSig){
next={...next,board:next.board.map(row=>row.slice())};
const a=next.board[0][0], b=next.board[0][1];
next.board[0][0]=b; next.board[0][1]=a;
if(a===b){ next.board[0][0]=next.board[1][0]; next.board[1][0]=a; }
}
return next;
}

function resetMultiplayerRoundVisualState(){
clearTimeUpPreview();
mpLastResultRenderSig='';
resetRewardFx();
try{ clearPath(); }catch(_){ selectedPath.length=0; selectedFlags.fill(0); }
selectedFlags.fill(0);
pendingPointer=null; lastPointerX=null; lastPointerY=null;
if(pointerFrame){cancelAnimationFrame(pointerFrame);pointerFrame=0;}
if(hoverLiftCell){hoverLiftCell.classList.remove('tile-hover-lift');hoverLiftCell=null;}
for(const cell of domCells){
cell?.classList.remove('tile-dragging','tile-dragging-p1','tile-dragging-p2','tile-claimed-p1','tile-claimed-p2','tile-hover-lift','tile-hover-p1','tile-hover-p2','remote-word-flash-p1','remote-word-flash-p2');
}
remainingSeconds=60;
p1Score=0; p2Score=0; updateScores();
const timer=document.getElementById('game-timer'); if(timer) timer.textContent='60';
resetMatchWordResults(); resetSeriesWordResults();
sessionFoundWords.clear(); mpFoundWords.host.clear(); mpFoundWords.guest.clear(); mpSeenWordEvents.clear();
const ticker=document.getElementById('words-ticker'); if(ticker) ticker.replaceChildren();
if(selectedWordPreviewEl){ for(const pv of previewTiles) pv.tile.hidden=true; }
setSelectedPreviewState('neutral');
}

function paintBoardCells(board) {
const container=document.getElementById('scrabble-grid');
if(!container) return false;
let html='';
for(let r=0;r<BOARD_SIZE;r++) for(let c=0;c<BOARD_SIZE;c++){
const char=board[r][c], score=TILE_SCORES[char]||1;
html+=`<div class="letter-cell" id="cell-${r}-${c}"><span>${char}</span><span class="tile-score">${score}</span></div>`;
}
container.innerHTML=html;
domCells=Array.from(container.children);
hoverGridRect=null; activeGridRect=null; hoverGridMetrics=null; activeGridMetrics=null;
return true;
}

function buildGrid() {
let ready=null;
try{
  if(prewarmedBoard && Array.isArray(prewarmedBoard.board) && prewarmedBoard.board.length===BOARD_SIZE){
    ready=prewarmedBoard;
  }else{
    ready=generateOptimizedBoard(3);
  }
}catch(err){
  console.error('Optimized board generation failed',err);
}
prewarmedBoard=null;

// Fail-safe: the game must never open with an empty grey board.
if(!ready || !Array.isArray(ready.board) || ready.board.length!==BOARD_SIZE){
  try{
    const board=makeCandidateBoard();
    const words=wordDataReady?solveBoardWords(board):[];
    ready={board,words};
  }catch(err){
    console.error('Fallback board generation failed',err);
    const board=Array.from({length:BOARD_SIZE},()=>Array.from({length:BOARD_SIZE},()=>FILL_LETTERS[Math.floor(Math.random()*FILL_LETTERS.length)]));
    ready={board,words:[]};
  }
}
gridBoard=ready.board;
boardFoundWords=Array.isArray(ready.words)?ready.words:[];
rememberBoard(gridBoard,boardFoundWords);
if(!paintBoardCells(gridBoard)) throw new Error('board-paint-failed');
}

function renderProvidedBoard(board) {
const container = document.getElementById('scrabble-grid');
if (!container) throw new Error('scrabble-grid bulunamadı');

const valid = Array.isArray(board) && board.length === BOARD_SIZE &&
board.every(row => Array.isArray(row) && row.length === BOARD_SIZE);
if (!valid) {
console.error('Geçersiz multiplayer tahtası:', board);
showToast('Oyun tahtası yüklenemedi. Oda yeniden senkronize ediliyor.', 'rose');
return false;
}

clearPath();
gridBoard = board.map(row => row.map(ch => String(ch || '').toLocaleUpperCase('tr-TR')));
boardFoundWords = []; // Çoklu oyunda bot yok; pahalı tam-tahta çözümü gereksiz.
paintBoardCells(gridBoard);
syncWordDisplay();
return true;
}

function hydrateMultiplayerBoardState(d) {
if (!d || !d.words || !domCells.length) return;
const entries = Object.entries(d.words);
for (const [key, ev] of entries) {
if (!ev) continue;
const activeRound=Number(d.round||mpRoomData?.round||1);
const eventRound=Number(ev.round||1);
if(eventRound!==activeRound) continue;
const word = String(ev.word || '').toLocaleUpperCase('tr-TR');
if (!word) continue;
mpFoundWords.host.add(word);
mpFoundWords.guest.add(word);
sessionFoundWords.add(word);
{ const remotePath=decodeClaimPath(ev.path); if(remotePath.length) applyClaimedPath(remotePath, ev.role === 'host'); }
if (!mpSeenWordEvents.has(key)) {
mpSeenWordEvents.add(key);
addTickerBadge(word, ev.role === 'host');
}
}
}

const gridEl = document.getElementById('scrabble-grid');

let activeGridRect = null;
let activeGridMetrics = null;
let hoverGridRect = null;
let hoverGridMetrics = null;
let pendingPointer = null;
let pointerFrame = 0;
let hoverLiftCell = null;
let lastPointerX = null, lastPointerY = null;
const selectedFlags = new Uint8Array(BOARD_SIZE*BOARD_SIZE);
const selectedWordPreviewEl=document.getElementById('selected-word-preview');
const selectedPreviewBarEl=document.getElementById('selected-preview-bar');
const selectedPreviewStatusEl=document.getElementById('selected-preview-status');
let selectedPreviewVisualState='neutral';
const previewTiles=[];
function setSelectedPreviewState(state='neutral'){
if(!selectedPreviewBarEl) return;
const statusText=state==='valid'?'(SÖZLÜKTE VAR)':(state==='invalid'?'(SÖZLÜKTE YOK)':'');
if(state===selectedPreviewVisualState && selectedPreviewStatusEl?.textContent===statusText) return;
selectedPreviewVisualState=state;
selectedPreviewBarEl.classList.remove('preview-invalid','preview-valid');
if(state==='valid') selectedPreviewBarEl.classList.add('preview-valid');
else if(state==='invalid') selectedPreviewBarEl.classList.add('preview-invalid');
if(selectedPreviewStatusEl) selectedPreviewStatusEl.textContent=statusText;
}

function ensurePreviewTiles(){
if(!selectedWordPreviewEl) return;
if(!previewTiles.length){
const frag=document.createDocumentFragment();
for(let i=0;i<9;i++){
const tile=document.createElement('div'); tile.className='letter-cell selected-preview-tile'; tile.hidden=true;
const letter=document.createElement('span');
const score=document.createElement('span'); score.className='tile-score';
tile.append(letter,score); frag.appendChild(tile); previewTiles.push({tile,letter,score});
}
selectedWordPreviewEl.replaceChildren(frag);
return;
}
// Oyun ekranı yeniden açıldığında taşlar DOM'dan kopmuşsa aynı hafif taşları yeniden bağla.
if(previewTiles[0]?.tile?.parentNode!==selectedWordPreviewEl){
const frag=document.createDocumentFragment();
for(const pv of previewTiles) frag.appendChild(pv.tile);
selectedWordPreviewEl.replaceChildren(frag);
}
}
ensurePreviewTiles();

function measureGrid(){
const rect=gridEl.getBoundingClientRect();
const cs=getComputedStyle(gridEl);
const px=v=>Number.parseFloat(v)||0;
const padL=px(cs.paddingLeft), padR=px(cs.paddingRight), padT=px(cs.paddingTop), padB=px(cs.paddingBottom);
const gapX=px(cs.columnGap), gapY=px(cs.rowGap);
const innerW=Math.max(1,rect.width-padL-padR-gapX*(BOARD_SIZE-1));
const innerH=Math.max(1,rect.height-padT-padB-gapY*(BOARD_SIZE-1));
const cellW=innerW/BOARD_SIZE, cellH=innerH/BOARD_SIZE;
return {rect,padL,padT,gapX,gapY,cellW,cellH,stepX:cellW+gapX,stepY:cellH+gapY};
}
function pointToCell(clientX,clientY,metrics){
if(!metrics) metrics=measureGrid();
const {rect,padL,padT,stepX,stepY}=metrics;
if(clientX<rect.left||clientX>rect.right||clientY<rect.top||clientY>rect.bottom) return null;
const x=clientX-rect.left-padL, y=clientY-rect.top-padT;
const col=Math.max(0,Math.min(BOARD_SIZE-1,Math.round((x-metrics.cellW/2)/stepX)));
const row=Math.max(0,Math.min(BOARD_SIZE-1,Math.round((y-metrics.cellH/2)/stepY)));
return {row,col};
}
function invalidateGridMetrics(){ hoverGridRect=null; hoverGridMetrics=null; activeGridRect=null; activeGridMetrics=null; }
const refreshGridRect=()=>{ hoverGridMetrics=measureGrid(); hoverGridRect=hoverGridMetrics.rect; };
gridEl.addEventListener('pointerenter',refreshGridRect,{passive:true});
window.addEventListener('resize',invalidateGridMetrics,{passive:true});
if('ResizeObserver' in window){ new ResizeObserver(invalidateGridMetrics).observe(gridEl); }

let lastHoverCell=-1;
gridEl.addEventListener('pointermove', (e) => {
if(e.pointerType==='touch' || isPointerDown) return;
const metrics=hoverGridMetrics || (hoverGridMetrics=measureGrid()); hoverGridRect=metrics.rect;
const pos=pointToCell(e.clientX,e.clientY,metrics); if(!pos) return;
const idx=pos.row*BOARD_SIZE+pos.col;
if(idx===lastHoverCell || !domCells[idx]) return;
lastHoverCell=idx;
const cell=domCells[idx];
if(hoverLiftCell && hoverLiftCell!==cell) hoverLiftCell.classList.remove('tile-hover-p1','tile-hover-p2');
hoverLiftCell=cell;
const hoveringAsP1 = mpRole === 'guest' ? false : (mpRole === 'host' ? true : (chosenAvatarId === 'av_1'));
cell.classList.remove('tile-hover-p1','tile-hover-p2');
cell.classList.add(hoveringAsP1 ? 'tile-hover-p1' : 'tile-hover-p2');
}, {passive:true});
gridEl.addEventListener('pointerleave',()=>{
lastHoverCell=-1; hoverGridRect=null; hoverGridMetrics=null;
if(hoverLiftCell) hoverLiftCell.classList.remove('tile-hover-p1','tile-hover-p2'); hoverLiftCell=null;
}, {passive:true});

gridEl.addEventListener('pointerdown', (e) => {
if (!isMatchActive && mpRole && mpState===MP_STATES.PLAYING) isMatchActive=true;
if (!isMatchActive) return;
e.preventDefault();
ensureGameAudio();
isPointerDown = true;
pointerHoldStartedAt = performance.now();
activePointerId = e.pointerId;
clearTimeout(pointerHoldTimer);
pointerHoldTimer = setTimeout(() => {
if (!isPointerDown) return;
isPointerDown = false; pointerHoldStartedAt = 0; pendingPointer = null; activeGridRect = null; activeGridMetrics=null;
lastPointerX=null; lastPointerY=null;
if (pointerFrame) { cancelAnimationFrame(pointerFrame); pointerFrame = 0; }
gridEl.classList.remove('is-grabbing'); clearPath();
try { if (activePointerId !== null) gridEl.releasePointerCapture(activePointerId); } catch (_) {}
activePointerId = null;
}, HOLD_CANCEL_MS);
activeGridMetrics = hoverGridMetrics || measureGrid();
activeGridRect = activeGridMetrics.rect; hoverGridMetrics=activeGridMetrics; hoverGridRect=activeGridRect;
gridEl.classList.add('is-grabbing');
try { gridEl.setPointerCapture(e.pointerId); } catch (_) {}
clearPath();
processPointerAt(e.clientX, e.clientY, activeGridMetrics);
lastPointerX=e.clientX; lastPointerY=e.clientY;
}, {passive:false});

gridEl.addEventListener('pointermove', (e) => {
if (!isMatchActive || !isPointerDown) return;
const fullscreenFine = !IS_COARSE_POINTER && isFullscreenActive();
if(!fullscreenFine){
  const samples = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : null;
  if (samples && samples.length > 1) {
    const step=Math.max(1,Math.ceil(samples.length/4));
    for (let i=0;i<samples.length;i+=step) { const sample=samples[i]; processPointerSegment(sample.clientX,sample.clientY,activeGridMetrics); }
    const last=samples[samples.length-1]; processPointerSegment(last.clientX,last.clientY,activeGridMetrics);
  }
}
pendingPointer = {x:e.clientX, y:e.clientY};
if (pointerFrame) return;
pointerFrame = requestAnimationFrame(() => {
pointerFrame = 0; if (!pendingPointer || !isPointerDown) return;
const p = pendingPointer; pendingPointer = null; processPointerSegment(p.x, p.y, activeGridMetrics);
});
}, {passive:true});

const finishPointer = (e, shouldSubmit = true) => {
if (!isPointerDown) return;
clearTimeout(pointerHoldTimer); pointerHoldTimer = null;
const heldMs = pointerHoldStartedAt ? (performance.now() - pointerHoldStartedAt) : 0;
const cancelForLongHold = shouldSubmit && heldMs >= HOLD_CANCEL_MS;
if (shouldSubmit && !cancelForLongHold && activeGridMetrics) processPointerAt(e.clientX, e.clientY, activeGridMetrics);
isPointerDown = false; pointerHoldStartedAt = 0; pendingPointer = null; activeGridRect = null; activeGridMetrics=null;
lastPointerX=null; lastPointerY=null;
if (pointerFrame) { cancelAnimationFrame(pointerFrame); pointerFrame = 0; }
gridEl.classList.remove('is-grabbing');
try { gridEl.releasePointerCapture(e.pointerId); } catch(err) {}
activePointerId = null;
if (cancelForLongHold) { clearPath(); return; }
if (shouldSubmit && selectedPath.length) {
 const lastCell=selectedPath[selectedPath.length-1]?.el || null;
 const rr=lastCell?.getBoundingClientRect?.();
 const submitOrigin=(rr&&rr.width&&rr.height)?{x:rr.left+rr.width/2,y:rr.top+rr.height/2}:null;
 submitWord(submitOrigin);
} else clearPath();
};

gridEl.addEventListener('pointerup', (e) => finishPointer(e, true), {passive:true});
gridEl.addEventListener('pointercancel', (e) => finishPointer(e, false), {passive:true});

function processPointerSegment(clientX,clientY,metrics=activeGridMetrics){
if(lastPointerX===null||lastPointerY===null){processPointerAt(clientX,clientY,metrics);lastPointerX=clientX;lastPointerY=clientY;return;}
const dx=clientX-lastPointerX,dy=clientY-lastPointerY;
const cellPx=metrics?Math.min(metrics.cellW,metrics.cellH):40;

// v273: Masaüstünde coalesced pointer örnekleri zaten gerçek fare yolunu veriyor.
// Küçük hücrelerde gereksiz 8-10 ara hesap üretmek fullscreen'de tutukluk yapıyordu.
// Dokunmatik yolu eski hassasiyetinde kalır; fine-pointer yolu daha hafif çalışır.
const finePointer=!IS_COARSE_POINTER;
const fullscreenFine=finePointer && isFullscreenActive();
const maxSteps=fullscreenFine?3:(finePointer?5:10);
const stepDivisor=fullscreenFine?Math.max(10,cellPx*.72):(finePointer?Math.max(8,cellPx*.56):Math.max(6.5,cellPx*.38));
const steps=Math.min(maxSteps,Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/stepDivisor)));
for(let i=1;i<=steps;i++) processPointerAt(lastPointerX+dx*i/steps,lastPointerY+dy*i/steps,metrics);
lastPointerX=clientX;lastPointerY=clientY;
}

function processPointerAt(clientX, clientY, metrics = activeGridMetrics) {
const pos=pointToCell(clientX,clientY,metrics || hoverGridMetrics || measureGrid());
if(!pos) return; const {row,col}=pos;
if (selectedPath.length >= 2) {
const prev = selectedPath[selectedPath.length - 2];
if (prev.r === row && prev.c === col) {
const removed = selectedPath.pop(); selectedFlags[removed.r*BOARD_SIZE+removed.c]=0;
removed.el.classList.remove('tile-dragging','tile-dragging-p1','tile-dragging-p2'); syncWordDisplay(); return;
}
}
if (isNeighbor(row, col)) { const cell = domCells[row * BOARD_SIZE + col]; addCellToPath(row, col, cell); }
}

function isNeighbor(r, c) {
if (selectedPath.length === 0) return true;
const last = selectedPath[selectedPath.length - 1];
const dr = Math.abs(last.r - r);
const dc = Math.abs(last.c - c);
return (dr + dc === 1) && !selectedFlags[r*BOARD_SIZE+c];
}

function addCellToPath(r, c, cell) {
selectedPath.push({ r, c, char: gridBoard[r][c], el: cell });
selectedFlags[r*BOARD_SIZE+c]=1;
playLetterPickSound(selectedPath.length);
const selectingAsP1 = mpRole === 'guest' ? false : (mpRole === 'host' ? true : (chosenAvatarId === 'av_1'));
cell.classList.remove('tile-dragging-p1','tile-dragging-p2');
cell.classList.add('tile-dragging', selectingAsP1 ? 'tile-dragging-p1' : 'tile-dragging-p2');
syncWordDisplay();
}

function clearPath() {
selectedPath.forEach(p => p.el.classList.remove('tile-dragging','tile-dragging-p1','tile-dragging-p2'));
selectedPath.length = 0;
selectedFlags.fill(0);
syncWordDisplay();
}

function syncWordDisplay() {
ensurePreviewTiles();
let word='';
for(let i=0;i<selectedPath.length;i++){
const p=selectedPath[i]; word+=p.char;
const pv=previewTiles[i]; if(pv){pv.letter.textContent=p.char;pv.score.textContent=String(TILE_SCORE_CACHE[p.char]||1);pv.tile.hidden=false;}
}
for(let i=selectedPath.length;i<previewTiles.length;i++) previewTiles[i].tile.hidden=true;
let state='neutral';
if(word.length>=1){
  const valid = word.length>=2 && !isArgoWord(word) && GAME_WORD_SET.has(word);
  state=valid?'valid':'invalid';
}
setSelectedPreviewState(state);
}

function flashWordFeedback(ok){
const bar=document.getElementById('selected-preview-bar');
if(!bar)return;
const cls=ok?'kd-word-ok':'kd-word-bad';
bar.classList.remove('kd-word-ok','kd-word-bad');
requestAnimationFrame(()=>{
bar.classList.add(cls);
setTimeout(()=>bar.classList.remove(cls),230);
});
}

const kdComboState={p1:{count:0,last:0},p2:{count:0,last:0}};
function resetRewardFx(side=null){
const keys=side?[side]:['p1','p2'];
for(const k of keys){kdComboState[k].count=0;kdComboState[k].last=0;}
document.querySelectorAll('.kd-score-pop,.kd-avatar-ring').forEach(el=>el.classList.remove('kd-score-pop','kd-avatar-ring'));
document.querySelectorAll('.kd-combo-pop').forEach(el=>el.remove());
}
function restartFxClass(el,cls){
if(!el)return;
el.classList.remove(cls);
requestAnimationFrame(()=>{el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),620);});
}
function rewardWordFx(isP1){
if(document.hidden) return;
const side=isP1?'p1':'p2';
const now=performance.now();
const state=kdComboState[side];
state.count=(now-state.last<=2600)?state.count+1:1;
state.last=now;
const score=document.getElementById(isP1?'p1-score-chip':'p2-score-chip');
const avatar=document.getElementById(isP1?'p1-avatar-box':'p2-avatar-box');
restartFxClass(score,'kd-score-pop');
restartFxClass(avatar,'kd-avatar-ring');
if(state.count>=2 && score){
 const r=score.getBoundingClientRect();
 const el=document.createElement('div');el.className='kd-combo-pop';el.textContent=`x${Math.min(state.count,9)} COMBO`;
 el.style.left=(r.left+r.width/2)+'px';el.style.top=Math.max(8,r.top-2)+'px';
 document.body.appendChild(el);setTimeout(()=>el.remove(),620);
}
}
function breakCombo(isP1){const st=kdComboState[isP1?'p1':'p2'];st.count=0;st.last=0;}

async function submitWord(submitOrigin=null) {
if (!isMatchActive || selectedPath.length === 0) return;
const word = selectedPath.map(p => p.char).join('');
const pts = word.split('').reduce((sum, ch) => sum + (TILE_SCORE_CACHE[ch] || 1), 0);
const isP1 = mpRole ? (mpRole === 'host') : (chosenAvatarId === 'av_1');
// Pointer bırakıldığı anda alınan koordinatı kullan. Böylece async işlemler bu noktayı değiştiremez.
let scoreFxOrigin=(submitOrigin&&Number.isFinite(submitOrigin.x)&&Number.isFinite(submitOrigin.y))?submitOrigin:null;
if(!scoreFxOrigin){
 const scoreFxLastEl=selectedPath[selectedPath.length-1]?.el || null;
 const scoreFxLastRect=scoreFxLastEl?.getBoundingClientRect?.();
 if(scoreFxLastRect&&scoreFxLastRect.width&&scoreFxLastRect.height){
  scoreFxOrigin={x:scoreFxLastRect.left+scoreFxLastRect.width/2,y:scoreFxLastRect.top+scoreFxLastRect.height/2};
 }
}

if (word.length < 2) {
clearPath();
return;
}

if (isArgoWord(word)) {
playErrorBuzzer();
flashWordFeedback(false);
breakCombo(isP1);
showToast(`${word} (-3) ARGO/KÜFÜR`, 'rose');
adjustScore(isP1 ? -3 : 0, !isP1 ? -3 : 0);
clearPath();
return;
}

if (!GAME_WORD_SET.has(word)) {
playErrorBuzzer();
flashWordFeedback(false);
breakCombo(isP1);
showToast(`${word} (-3) Geçersiz!`, 'rose');
adjustScore(isP1 ? -3 : 0, !isP1 ? -3 : 0);
clearPath();
return;
}

if (mpRole) {
const normalizedWord = word.toLocaleUpperCase('tr-TR');
const wordKey = encodeURIComponent(normalizedWord).replace(/\./g, '%2E');
const claimRef = mpRoomRef.child('words').child(wordKey);
try {
const tx = await claimRef.transaction(current => {
if (current !== null) return;
return {
word: normalizedWord, role: mpRole, pts: pts,
round: Number(mpRoomData?.round||1),
path: encodeClaimPath(selectedPath),
last: selectedPath.length?{r:selectedPath[selectedPath.length-1].r,c:selectedPath[selectedPath.length-1].c}:null,
at: firebase.database.ServerValue.TIMESTAMP
};
});
if (!tx.committed) {
showToast(`${word} (DAHA ÖNCE BULUNDU)`, 'rose', 1500);
clearPath();
return;
}
} catch (err) {
showToast('Senkronizasyon kontrol ediliyor, tekrar dene.', 'rose');
clearPath();
return;
}
} else if (sessionFoundWords.has(word)) {
showToast(`${word} (DAHA ÖNCE BULUNDU)`, 'rose', 1500);
clearPath();
return;
}

if(mpRole) {
mpFoundWords.host.add(word);
mpFoundWords.guest.add(word);
} else sessionFoundWords.add(word);
recordMatchWord(word,pts,isP1);
playCorrectChime();
flashWordFeedback(true);
showToast(`${word} (+${pts})`, isP1 ? 'amber' : 'sky');
playWordConfetti(word.length);

selectedPath.forEach(p => {
p.el.classList.add(isP1 ? 'tile-claimed-p1' : 'tile-claimed-p2');
});

addTickerBadge(word, isP1);
// Konfeti sadece sözcüğü bu cihazda bulan oyuncuda görünür.
flyScore(pts, isP1, scoreFxOrigin);
rewardWordFx(isP1);
adjustScore(isP1 ? pts : 0, !isP1 ? pts : 0);
clearPath();
}

function applyClaimedPath(path, isP1) {
path.forEach(pos=>{
const el=domCells[pos.r*BOARD_SIZE+pos.c];
if(!el) return;
el.classList.add(isP1?'tile-claimed-p1':'tile-claimed-p2');
});
}

function flashOpponentWord(path,isP1,badge=null){
if(document.hidden||!Array.isArray(path)||!path.length) return;
const cls=isP1?'remote-word-flash-p1':'remote-word-flash-p2';
for(const pos of path){
  const el=domCells[pos.r*BOARD_SIZE+pos.c]||document.getElementById(`cell-${pos.r}-${pos.c}`);
  if(!el) continue;
  el.classList.remove('remote-word-flash-p1','remote-word-flash-p2');
  void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(()=>el.classList.remove(cls),1080);
}
if(badge){
  const badgeCls=isP1?'remote-word-badge-p1':'remote-word-badge-p2';
  badge.classList.add(badgeCls);
  setTimeout(()=>badge.classList.remove(badgeCls),1080);
}
}

function playWordConfetti(length){
const letters=Math.max(2,Math.min(9,Number(length)||2));
const count=Math.round((IS_COARSE_POINTER?8:10)+(letters-2)*(IS_COARSE_POINTER?2.5:3));
confetti({particleCount:count});
}

// Yerel oyuncunun sözcük kutlaması yalnız oyun tahtasının içinde çizilir.
function confetti(options={}){
const count=Math.max(0,Math.min(48,Math.round(Number(options.particleCount)||0)));
if(!count||document.hidden)return;
const board=document.getElementById('scrabble-grid');
if(!board||board.closest('.hidden')||board.clientWidth<1||board.clientHeight<1)return;
const layer=document.createElement('div');layer.className='word-confetti-layer';
const frag=document.createDocumentFragment();
const x=board.clientWidth/2,y=board.clientHeight/2;
const colors=['#fbbf24','#38bdf8','#fb7185','#a78bfa','#34d399','#ffffff'];
const duration=1000;
for(let i=0;i<count;i++){
const part=document.createElement('i');
const angle=Math.random()*Math.PI*2;
const reach=Math.min(board.clientWidth,board.clientHeight)*(.12+Math.random()*.25);
part.style.setProperty('--x',x+'px');part.style.setProperty('--y',y+'px');
const dx=Math.round(Math.cos(angle)*reach),dy=Math.round(Math.sin(angle)*reach+12+Math.random()*16);
part.style.setProperty('--dx',dx+'px');part.style.setProperty('--dy',dy+'px');
part.style.setProperty('--mid-x',Math.round(dx*.58)+'px');part.style.setProperty('--mid-y',Math.round(dy*.38-38)+'px');
const rotation=Math.round((Math.random()-.5)*720);
part.style.setProperty('--rot',rotation+'deg');part.style.setProperty('--mid-rot',Math.round(rotation*.5)+'deg');
part.style.setProperty('--w',(4+Math.random()*4)+'px');part.style.setProperty('--h',(7+Math.random()*5)+'px');
part.style.setProperty('--color',colors[i%colors.length]);
part.style.setProperty('--duration',duration+'ms');frag.appendChild(part);
}
layer.appendChild(frag);board.appendChild(layer);
setTimeout(()=>layer.remove(),duration+80);
}

function flyScore(pts, isP1, originPoint=null) {
if(document.hidden) return;
const target=document.getElementById(isP1?'p1-score-chip':'p2-score-chip') || document.getElementById(isP1?'p1-score-val':'p2-score-val');
if(!target) return;
const tr=target.getBoundingClientRect();
const el=document.createElement('div'); el.className='score-fly'; el.textContent=`+${pts}`;
el.style.color=isP1?'#fbbf24':'#38bdf8';
const gridRect=document.getElementById('scrabble-grid')?.getBoundingClientRect?.();
// originPoint submit anında kaydedilen SABİT piksel koordinatıdır.
// Örn. ARALIK -> K hücresinin merkezi; async işlem sonrası DOM'a tekrar bakılmaz.
const validOrigin=originPoint&&Number.isFinite(originPoint.x)&&Number.isFinite(originPoint.y);
const cx=validOrigin ? originPoint.x : (gridRect?gridRect.left+gridRect.width/2:innerWidth/2);
const cy=validOrigin ? originPoint.y : (gridRect?gridRect.top+gridRect.height/2:Math.min(innerHeight*.38,innerHeight-120));
// Yazıyı başlangıç merkezine gerçek ölçüsüyle sabitle; sonraki frame'de skora taşı.
el.style.left=cx+'px'; el.style.top=cy+'px';
el.style.transform='translate3d(-50%,-50%,0) scale(.9)';
document.body.appendChild(el);
const er=el.getBoundingClientRect();
const startCx=er.left+er.width/2,startCy=er.top+er.height/2;
el.style.setProperty('--dx',(tr.left+tr.width/2-startCx)+'px');
el.style.setProperty('--dy',(tr.top+tr.height/2-startCy)+'px');
// CSS .go transform'ı yüzde merkezlemeyi korumadığı için hedefi inline keyframe ile kesinleştir.
requestAnimationFrame(()=>requestAnimationFrame(()=>{
 if(typeof el.animate==='function'){
  const anim=el.animate([
   {transform:'translate3d(-50%,-50%,0) scale(.9)',opacity:.58},
   {transform:`translate3d(calc(-50% + ${tr.left+tr.width/2-startCx}px),calc(-50% + ${tr.top+tr.height/2-startCy}px),0) scale(1.18)`,opacity:0}
  ],{duration:720,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});
  anim.onfinish=()=>el.remove();
 }else{
  el.style.setProperty('--dx',(tr.left+tr.width/2-startCx)+'px');
  el.style.setProperty('--dy',(tr.top+tr.height/2-startCy)+'px');
  el.classList.add('go');setTimeout(()=>el.remove(),780);
 }
}));
setTimeout(()=>{if(el.isConnected)el.remove();},900);
}
function adjustScore(p1Delta, p2Delta) {
p1Score = Math.max(0, p1Score + p1Delta);
p2Score = Math.max(0, p2Score + p2Delta);
updateScores();
if (mpRole) {
const delta=mpRole==='host'?Number(p1Delta||0):Number(p2Delta||0);
if(delta) scheduleMpScoreSync();
}
}

function updateScores() {
document.getElementById('p1-score-val').textContent = p1Score;
document.getElementById('p2-score-val').textContent = p2Score;
}

function addTickerBadge(word, isP1) {
const ticker=document.getElementById('words-ticker');
if(!ticker) return null;
while(ticker.children.length>=36) ticker.firstElementChild?.remove();
const badge = document.createElement('span');
badge.className = `${isP1 ? 'bg-amber-400' : 'bg-sky-400'} text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px] uppercase mx-0.5`;
badge.textContent = word;
ticker.appendChild(badge);
return badge;
}

function getChallengeShareData(){
const p1=Number(document.getElementById('final-score-val-p1')?.textContent||0);
const p2=Number(document.getElementById('final-score-val-p2')?.textContent||0);
const myScore=mpRole==='guest'?p2:p1;
const ownWords=mpRole==='guest'?Array.from(roundWordResults.p2.values()):Array.from(roundWordResults.p1.values());
const longest=ownWords.reduce((best,x)=>String(x?.word||'').length>String(best||'').length?String(x.word):best,'');
const scoreLine=myScore>0?`KAPMACA'da ${myScore} puan yaptım!`:`KAPMACA'da kapışmaya var mısın?`;
const longestLine=longest?` En uzun sözcüğüm: ${longest} (${longest.length} harf).`:'';
return {title:'KAPMACA — Meydan Okuma',text:`🔥 ${scoreLine}${longestLine} 60 saniyede beni geçebilir misin?`,url:location.origin+location.pathname};
}
async function shareChallengeResult(){
const data=getChallengeShareData();
try{
if(navigator.share){await navigator.share(data);return;}
const plain=`${data.text} ${data.url}`;
await navigator.clipboard.writeText(plain);
showToast('Meydan okuma metni kopyalandı!','emerald',2200);
}catch(e){if(e?.name!=='AbortError') showToast('Paylaşım açılamadı.','rose');}
}

function showToast(msg, color, duration=1600) {
const toast = document.createElement('div');
toast.className = `floating-toast px-3 py-1 rounded-full text-xs font-black shadow-lg ${
                color === 'rose' ? 'bg-rose-600 text-white' : color === 'amber' ? 'bg-amber-400 text-slate-950' : 'bg-sky-400 text-slate-950'
            }`;
toast.textContent = msg;
document.getElementById('toast-layer').appendChild(toast);
setTimeout(() => toast.remove(), Math.max(400, Number(duration)||1600));
}

function startTimer() {
clearInterval(timerInterval);
lastHeartbeatSecond = null;
lastGongSecond = null;
timerInterval = setInterval(() => {
remainingSeconds--;
updateGameTimerUI(remainingSeconds);
maybeHeartbeat(remainingSeconds);
maybeFinalGong(remainingSeconds);
if (remainingSeconds <= 0) endGame();
}, 1000);
}

const BOARD_SOLVE_CACHE = new Map();
const BOARD_SOLVE_CACHE_LIMIT = 8;
function solveBoardWords(board = gridBoard) {
const solveKey=Array.isArray(board)&&board.length===BOARD_SIZE ? boardSignature(board) : '';
if(solveKey && BOARD_SOLVE_CACHE.has(solveKey)) return BOARD_SOLVE_CACHE.get(solveKey);
const found = new Map();
const visited = Array.from({length:BOARD_SIZE}, () => Array(BOARD_SIZE).fill(false));
const deltas = [[-1,0],[0,-1],[0,1],[1,0]];
const MAX_SOLVE_LEN = 9; // 9x9 motoru: oyun ve bot en fazla 9 harf tarar.
const prefixMemo = new Map();
const prefixExists = str => {
if(prefixMemo.has(str)) return prefixMemo.get(str);
const ok=hasWordPrefix(str); prefixMemo.set(str,ok); return ok;
};

function dfs(r, c, curStr, path) {
if (!prefixExists(curStr)) return;
if (curStr.length >= 2 && GAME_WORD_SET.has(curStr) && !found.has(curStr)) {
found.set(curStr, { word: curStr, path: [...path] });
}
if (curStr.length >= MAX_SOLVE_LEN) return;
for (const [dr,dc] of deltas) {
const nr=r+dr, nc=c+dc;
if (nr>=0 && nr<BOARD_SIZE && nc>=0 && nc<BOARD_SIZE && !visited[nr][nc]) {
visited[nr][nc]=true; path.push({r:nr,c:nc});
dfs(nr,nc,curStr+board[nr][nc],path);
path.pop(); visited[nr][nc]=false;
}
}
}
for (let r=0;r<BOARD_SIZE;r++) for (let c=0;c<BOARD_SIZE;c++) {
visited[r][c]=true; dfs(r,c,board[r][c],[{r,c}]); visited[r][c]=false;
}
const solved=Array.from(found.values());
if(solveKey){
  if(BOARD_SOLVE_CACHE.size>=BOARD_SOLVE_CACHE_LIMIT) BOARD_SOLVE_CACHE.delete(BOARD_SOLVE_CACHE.keys().next().value);
  BOARD_SOLVE_CACHE.set(solveKey,solved);
}
return solved;
}

const BOT_LEVELS = {
easy:   {delay:6500, focus:.22, top:8, minLen:2, maxLen:3},
medium: {delay:4200, focus:.50, top:7, minLen:2, maxLen:5},
hard:   {delay:2600, focus:.76, top:5, minLen:3, maxLen:6},
expert: {delay:1650, focus:.91, top:3, minLen:4, maxLen:9}
};
let botRankedBoard=null, botRankedWords=[];
function getBotRankedWords(){
if(botRankedBoard!==boardFoundWords){
botRankedBoard=boardFoundWords;
botRankedWords=boardFoundWords.map(item=>({
item,score:item.word.split('').reduce((sum,ch)=>sum+(TILE_SCORE_CACHE[ch]||1),0)
})).sort((a,b)=>b.score-a.score||b.item.word.length-a.item.word.length);
}
return botRankedWords;
}

function planBot() {
if (!isMatchActive) return;
const level=BOT_LEVELS[botDiffLevel]||BOT_LEVELS.easy;

botInterval = setTimeout(() => {
if (!isMatchActive) return;

const available=getBotRankedWords().filter(({item})=>!sessionFoundWords.has(item.word));

if (available.length > 0) {
let ranked=available.filter(({item})=>item.word.length>=level.minLen&&item.word.length<=level.maxLen);
if(!ranked.length)ranked=available;
let matchObj;
if (Math.random() < level.focus) {
const topCount=Math.min(ranked.length,level.top);
matchObj = ranked[Math.floor(Math.random() * topCount)].item;
} else {
matchObj = ranked[Math.floor(Math.random() * ranked.length)].item;
}
const word = matchObj.word;
const pts = word.split('').reduce((s, c) => s + (TILE_SCORES[c] || 1), 0);
const botIsP2 = (chosenAvatarId === 'av_1');

sessionFoundWords.add(word);
recordMatchWord(word,pts,!botIsP2);

matchObj.path.forEach(pt => {
const cell = document.getElementById(`cell-${pt.r}-${pt.c}`);
if (cell) {
cell.classList.remove('tile-claimed-p1', 'tile-claimed-p2');
cell.classList.add(botIsP2 ? 'tile-claimed-p2' : 'tile-claimed-p1');
}
});

let botOrigin=null;
const botLast=matchObj.path?.[matchObj.path.length-1];
if(botLast){const bel=document.getElementById(`cell-${botLast.r}-${botLast.c}`);const br=bel?.getBoundingClientRect?.();if(br&&br.width&&br.height)botOrigin={x:br.left+br.width/2,y:br.top+br.height/2};}
flyScore(pts, !botIsP2, botOrigin);
rewardWordFx(!botIsP2);
adjustScore(botIsP2 ? 0 : pts, botIsP2 ? pts : 0);
const botBadge=addTickerBadge(word, !botIsP2);
flashOpponentWord(matchObj.path,!botIsP2,botBadge);
showToast(`${word} (+${pts})`, botIsP2 ? 'sky' : 'amber');
}
planBot();
}, level.delay);
}

let timeUpPreviewTimer=null;
function clearTimeUpPreview(){
  if(timeUpPreviewTimer){clearTimeout(timeUpPreviewTimer);timeUpPreviewTimer=null;}
  document.getElementById('time-up-overlay')?.remove();
}
function showTimeUpPreview(done){
  clearTimeUpPreview();
  const game=document.getElementById('screen-game');
  if(!game){done();return;}
  const overlay=document.createElement('div');
  overlay.id='time-up-overlay';
  overlay.className='time-up-overlay';
  overlay.innerHTML=`<div class="time-up-card">
    <div class="time-up-clock" aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="34" r="22" fill="#fff" stroke="#f59e0b" stroke-width="4"/>
        <path d="M32 34V21M32 34l10 6" stroke="#b45309" stroke-width="4" stroke-linecap="round"/>
        <path d="M23 7h18M27 7v6M37 7v6" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
        <circle cx="32" cy="34" r="3" fill="#b45309"/>
      </svg>
    </div>
    <div class="time-up-title">SÜRE DOLDU!</div>
    <div class="time-up-sub">SONUÇLAR HAZIRLANIYOR</div>
  </div>`;
  game.appendChild(overlay);
  timeUpPreviewTimer=setTimeout(()=>{
    timeUpPreviewTimer=null;
    overlay.remove();
    try{ done?.(); }catch(err){ console.error('Result screen error',err); document.getElementById('modal-gameover')?.classList.remove('hidden'); }
  },1000);
}

const resultPreviewDoneKeys=new Set();

function spawnHighResultPartyFx(){ return; }
function launchLightResultConfetti(x=.5){if(typeof confetti==='function')confetti({particleCount:20,spread:70,origin:{x,y:.56},zIndex:999,disableForReducedMotion:true});}
function spawnGlobalResultConfetti(winnerSide=null){
 document.querySelectorAll('.result-global-confetti').forEach(el=>el.remove());
 const wrap=document.createElement('div');wrap.className='result-global-confetti';
 const colors=winnerSide==='p2'?['#38bdf8','#0ea5e9','#bae6fd','#f8fafc']:winnerSide==='p1'?['#fbbf24','#f59e0b','#fde68a','#f8fafc']:['#fbbf24','#38bdf8','#fb7185','#a78bfa','#f8fafc'];
 const count=58;
 for(let i=0;i<count;i++){
   const part=document.createElement('i');
   const focus=winnerSide==='p1'?.28:winnerSide==='p2'?.72:.5;
   const spread=(Math.random()-.5)*.56;
   part.style.left=`${Math.max(3,Math.min(97,(focus+spread)*100))}%`;
   part.style.background=colors[i%colors.length];
   part.style.setProperty('--dx',`${Math.round((Math.random()-.5)*130)}px`);
   part.style.setProperty('--rot',`${Math.round((Math.random()-.5)*900)}deg`);
   part.style.setProperty('--dur',`${1.45+Math.random()*1.15}s`);
   part.style.animationDelay=`${Math.random()*.35}s`;
   wrap.appendChild(part);
 }
 document.body.appendChild(wrap); setTimeout(()=>wrap.remove(),3300);
}

let winnerWaterfallTimer=null, grandCelebrationInterval=null, grandCelebrationTimeouts=[];
function stopGrandCelebrationFx(){
if(grandCelebrationInterval){clearInterval(grandCelebrationInterval);grandCelebrationInterval=null;}
for(const t of grandCelebrationTimeouts.splice(0)) clearTimeout(t);
}
function stopWinnerConfettiWaterfall(){
 if(winnerWaterfallTimer){clearInterval(winnerWaterfallTimer);winnerWaterfallTimer=null;}
}
function startWinnerConfettiWaterfall(winnerSide=null){
 stopWinnerConfettiWaterfall();
 if(document.hidden||typeof confetti!=='function'||!winnerSide) return;
 const modal=document.getElementById('modal-gameover');
 const avatarId=winnerSide==='p1'?'final-p1-avatar':'final-p2-avatar';
 const shoot=()=>{
   if(!modal||modal.classList.contains('hidden')){stopWinnerConfettiWaterfall();return;}
   const avatar=document.getElementById(avatarId);
   const r=avatar?.getBoundingClientRect?.();
   if(!r||!r.width||!r.height) return;
   const x=Math.max(.04,Math.min(.96,(r.left+r.width/2)/innerWidth));
   const y=Math.max(.03,Math.min(.92,(r.top+r.height*.12)/innerHeight));
   confetti({particleCount:3,angle:270,spread:26,startVelocity:8,gravity:.62,decay:.96,ticks:92,scalar:.58,origin:{x,y},zIndex:1000,disableForReducedMotion:true});
 };
 shoot();
 winnerWaterfallTimer=setInterval(shoot,180);
 const stopTimer=setTimeout(()=>stopWinnerConfettiWaterfall(),3600);
 grandCelebrationTimeouts.push(stopTimer);
}

function launchGrandCelebration(winnerSide=null) {
stopGrandCelebrationFx();
stopWinnerConfettiWaterfall();
spawnHighResultPartyFx();
const baseX = winnerSide==='p1' ? 0.22 : winnerSide==='p2' ? 0.78 : 0.5;
launchLightResultConfetti(baseX);
}

async function waitUntilRoomFinished(timeoutMs=3500){
if(!mpRoomRef) return false;
const started=Date.now();
while(Date.now()-started<timeoutMs){
try{
const snap=await mpRoomRef.child('gameState/status').once('value');
if(snap.val()==='finished') return true;
}catch(e){}
await new Promise(r=>setTimeout(r,120));
}
return false;
}

function showImmediateRematchSync(){
const modal=document.getElementById('modal-countdown');
modal?.querySelector('.mp-demo')?.classList.remove('hidden');
const num=document.getElementById('countdown-number');
const status=document.getElementById('countdown-status');
const inviteMsg=document.getElementById('countdown-invite-message');
document.getElementById('modal-gameover')?.classList.add('hidden');
document.getElementById('modal-rematch-waiting')?.classList.add('hidden');
if(inviteMsg) inviteMsg.classList.add('hidden');
if(num){ num.textContent='3'; num.style.opacity='1'; num.style.transform='scale(1)'; }
if(status){ status.innerHTML='<span class="sync-check">✓</span> SENKRON HAZIRLANIYOR'; status.className='countdown-sync-ok'; }
modal?.classList.remove('hidden');
}

async function handlePlayAgain(){
if(activeGameMode==='multi' && isRandomHumanRoom()){
  if(randomResultAutoExitTimer){clearTimeout(randomResultAutoExitTimer);randomResultAutoExitTimer=null;}
  randomResultAutoExitKey='';
  exitRandomResultImmediately();
  const panel=document.getElementById('friend-invite-panel');
  panel?.classList.remove('hidden');
  document.getElementById('mp-create-view')?.classList.remove('hidden');
  document.getElementById('mp-room-view')?.classList.add('hidden');
  setTimeout(()=>searchRandomOpponent(),0);
  return;
}
if(activeGameMode !== 'multi'){
clearInterval(timerInterval); timerInterval=null;
clearTimeout(botInterval); botInterval=null;
clearInterval(mpClock); mpClock=null;
isMatchActive=false;
document.getElementById('modal-gameover')?.classList.add('hidden');
prepareGame();
return;
}
const btn=document.getElementById('btn-play-again');
if(btn){ btn.disabled=true; btn.textContent='YENİ OYUN HAZIRLANIYOR…'; }
try{
const finished=await waitUntilRoomFinished();
if(!finished) throw new Error('room-not-finished');
if(!mpRoomRef || !mpRole) throw new Error('room-missing');

// v233: Özel odada ilk YENİDEN OYNA basışı yeterlidir.
// Host/guest rolleri değişmez; host yeni ve farklı tahtayı hazırlayıp aynı iki oyuncuyla başlatır.
const role=mpRole;
const rematchRef=mpRoomRef.child('rematch');
const res=await rematchRef.transaction(current=>{
const r=current||{host:false,guest:false,expiresAt:0,round:Number(mpRoomData?.round||1)};
r[role]=true;
r.expiresAt=0;
r.round=Number(mpRoomData?.round||1);
return r;
});
if(!res.committed) throw new Error('rematch-not-committed');
showImmediateRematchSync();
if(mpRole==='host') hostStartRematch();
}catch(e){
console.error('Rematch request error',e);
if(btn){ btn.disabled=false; btn.textContent='YENİDEN OYNA'; }
showToast('Yeni oyun başlatılamadı. Tekrar deneyin.','rose');
}
}

function prepareSingleResultScreen(){
const longestBonus=applySingleLongestWordBonus();
const singleActions=document.getElementById('gameover-actions');
if(singleActions){ singleActions.classList.remove('hidden'); singleActions.style.setProperty('display','grid','important'); }
const replayBtn=document.getElementById('btn-play-again');
if(replayBtn){ replayBtn.style.removeProperty('display'); replayBtn.disabled=false; replayBtn.textContent='YENİDEN OYNA'; replayBtn.classList.remove('hidden'); }
const singleExitBtn=document.getElementById('btn-game-exit');
if(singleExitBtn){
  singleExitBtn.style.removeProperty('display');
  singleExitBtn.disabled=false;
  singleExitBtn.classList.remove('hidden');
  singleExitBtn.className='w-full mt-2 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-black text-xs py-2.5 rounded-xl uppercase shadow-md transition';
  singleExitBtn.textContent='ÇIKIŞ';
}
document.getElementById('final-score-val-p1').textContent=p1Score;
document.getElementById('final-score-val-p2').textContent=p2Score;
const p1Name=document.getElementById('p1-title').textContent, p2Name=document.getElementById('p2-title').textContent;
document.getElementById('final-p1-name').textContent=p1Name;
document.getElementById('final-p2-name').textContent=p2Name;
renderGameoverWordLists();
setLongestBonusBadges(!!longestBonus.p1,!!longestBonus.p2);
const p1NameEl=document.getElementById('final-p1-name'),p2NameEl=document.getElementById('final-p2-name'),p1ScoreEl=document.getElementById('final-score-val-p1'),p2ScoreEl=document.getElementById('final-score-val-p2');
[p1NameEl,p2NameEl,p1ScoreEl,p2ScoreEl].forEach(el=>el?.classList.remove('winner-pulse','winner-name-big','winner-score-big'));
const p1AvatarEl=document.getElementById('final-p1-avatar'),p2AvatarEl=document.getElementById('final-p2-avatar');
[p1AvatarEl,p2AvatarEl].forEach(el=>el?.classList.remove('winner-avatar-big'));
clearVictoryPresentation();
const c1=document.getElementById('final-p1-card'),c2=document.getElementById('final-p2-card');
[c1,c2].forEach(c=>{if(c){c.classList.remove('kd-winner-glow');c.style.transform='';c.style.filter='';c.style.background='';c.style.borderRadius='';c.style.padding='';}});
if(p1Score>p2Score){
  if(c1){c1.style.background='rgba(254,243,199,.9)';c1.style.borderRadius='16px';c1.style.padding='8px';}
  if(c2)c2.style.filter='saturate(.7) opacity(.82)';
  setGameoverOutcome(true);p1ScoreEl?.classList.add('winner-score-big');
}else if(p2Score>p1Score){
  if(c2){c2.style.background='rgba(224,242,254,.92)';c2.style.borderRadius='16px';c2.style.padding='8px';}
  if(c1)c1.style.filter='saturate(.7) opacity(.82)';
  setGameoverOutcome(false);p2ScoreEl?.classList.add('winner-score-big');
}else{
  setGameoverOutcome(null);
}
if(p1Score>p2Score)emphasizeWinner('p1');
else if(p2Score>p1Score)emphasizeWinner('p2');
}

function endGame(){
if(!isMatchActive && mpRole && mpState===MP_STATES.FINISHED) return;
isMatchActive=false;
clearInterval(timerInterval); timerInterval=null;
clearTimeout(botInterval); botInterval=null;
updateGameTimerUI(0);

if(mpRoomRef && mpRole){
markMultiplayerEndReady().catch(e=>console.warn('Final score sync retry needed',e));
if(mpRole==='host' && mpState===MP_STATES.PLAYING){
clearTimeout(mpEndResolveTimer);
mpEndResolveTimer=setTimeout(()=>{mpEndResolveTimer=null;hostResolveMatchEnd().catch(()=>{});},120);
}else showToast('Maç sonucu senkronize ediliyor…','sky');
return;
}

// v342: 1 saniyelik SÜRE DOLDU bildirimi biter bitmez sonuç modali açılır.
// Ağır sonuç süslemeleri modal görünür olduktan sonra çalışır; geçişi artık bloke etmez.
showTimeUpPreview(()=>{
  const modal=document.getElementById('modal-gameover');
  modal?.classList.remove('hidden');
  requestAnimationFrame(()=>{
    try{prepareSingleResultScreen();}
    catch(e){console.error('Single result preparation error',e);}
    scheduleBoardPrewarm();
  });
});
}

function showRoomExitNotice(message='OYUNDAN ÇIKIŞ YAPILDI'){
let el=document.getElementById('mp-room-exit-notice');
if(!el){
el=document.createElement('div');
el.id='mp-room-exit-notice';
el.style.cssText='position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.52);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);pointer-events:auto;';
el.innerHTML='<div id="mp-room-exit-notice-text" style="background:#7f1d1d;color:#fff;font-weight:900;font-size:18px;letter-spacing:.06em;padding:16px 24px;border-radius:18px;box-shadow:0 16px 40px rgba(0,0,0,.28)">OYUNDAN ÇIKIŞ YAPILDI</div>';
document.body.appendChild(el);
}
const txt=el.querySelector('#mp-room-exit-notice-text'); if(txt) txt.textContent=message;
el.style.display='flex';
}

function hideRoomExitNotice(){
const el=document.getElementById('mp-room-exit-notice');
if(el) el.style.display='none';
}

function finishRandomMatchAfterResult(expectedKey='',capturedRef=null,capturedRole=''){
// v233: zamanlayıcı kurulduktan sonra canlı oda/mod değişkenlerine bağımlı değiliz.
// Yalnız aynı sonuç oturumu hâlâ geçerliyse cihaz çıkış komutunu uygular.
if(expectedKey && randomResultAutoExitKey!==expectedKey) return;
const ref=capturedRef||mpRoomRef;
const role=capturedRole||mpRole;
const signal={id:`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`,at:serverNow(),by:role||'player',reason:'random-result-timeout'};
if(randomResultAutoExitTimer){clearTimeout(randomResultAutoExitTimer);randomResultAutoExitTimer=null;}
randomResultAutoExitKey='';
setRandomAutoExitNotice(false);
// Tam 6 saniye sonunda cihaz otomatik ÇIKIŞ komutunu verir. Kendi ekranı
// Firebase yanıtını beklemeden ana sayfaya döner. Host/guest fark etmeksizin
// aynı anda oda kapatma best-effort olarak gönderilir; ilk başarılı silme yeterlidir.
if(ref){
  // Çıkış sinyali best-effort gönderilir; oda silme bunun tamamlanmasını beklemez.
  // Böylece 6. saniyede oda kapanışı Firebase ağ gecikmesiyle ötelenmez.
  try{ref.child('roomExit').set(signal).catch(()=>{});}catch(_){}
  try{ref.remove().catch(()=>{});}catch(_){}
}
returnToHomeFromMultiplayer();
hideRoomExitNotice();
}

function exitRandomResultImmediately(){
if(!isRandomHumanRoom()) return false;
const ref=mpRoomRef;
const role=mpRole;
if(randomResultAutoExitTimer){clearTimeout(randomResultAutoExitTimer);randomResultAutoExitTimer=null;}
// ÇIKIŞ düğmesi: kendi cihazında ağ beklemeden anında ana sayfa.
returnToHomeFromMultiplayer();
hideRoomExitNotice();
// Diğer tarafı da hemen kapatmak için best-effort ortak sinyal.
if(ref && role){
  const signal={id:`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`,at:serverNow(),by:role,reason:'random-result-exit'};
  try{ref.child('roomExit').set(signal).catch(()=>{});}catch(_){}
  if(role==='host') setTimeout(()=>{try{ref.remove().catch(()=>{});}catch(_){}},1800);
}
return true;
}

async function handleSynchronizedRoomExit(reason='game-cancelled',sourceRole=''){
if(mpExitHandling) return;
mpExitHandling=true;
const roleAtExit=mpRole;
const initiatedBySelf=!!sourceRole && sourceRole===roleAtExit;
const randomRoomAtExit=/^random-match-/.test(String(mpRoomMode||''));
clearOpponentDisconnectGrace();
stopWinnerConfettiWaterfall();
clearVictoryPresentation();
isMatchActive=false;
clearInterval(timerInterval); timerInterval=null;
clearInterval(mpClock); mpClock=null;
clearTimeout(botInterval); botInterval=null;
if(pointerFrame){ cancelAnimationFrame(pointerFrame); pointerFrame=0; }
isPointerDown=false; pointerHoldStartedAt=0; clearTimeout(pointerHoldTimer); pointerHoldTimer=null; activePointerId=null; pendingPointer=null; activeGridRect=null; activeGridMetrics=null;
try{ clearPath(); }catch(_){ selectedPath=[]; }
const presence=mpPresenceRef;
if(presence){
presence.set({online:false,clientId:getClientToken(),at:firebase.database.ServerValue.TIMESTAMP}).catch(()=>{});
}
const exitingRef=mpRoomRef;
const exitingCode=mpRoomCode;
const randomResultExit=(reason==='random-result-timeout'||reason==='random-result-exit');
const isAutomaticRandomTimeout=(reason==='random-result-timeout');
const isRandomResultManualExit=(reason==='random-result-exit');
const isManualPlayerExit=(reason==='player-exit');
const forceCloseForDisconnect=reason==='opponent-disconnected';
const shouldDeletePrivate=!!(exitingRef && /^invite-only-/.test(String(mpRoomMode||'')) && (roleAtExit==='host'||forceCloseForDisconnect));
const shouldDeleteRandom=!!(exitingRef && randomRoomAtExit && (roleAtExit==='host'||forceCloseForDisconnect));
if(randomResultAutoExitTimer){clearTimeout(randomResultAutoExitTimer);randomResultAutoExitTimer=null;}

// v233 — Rastgele maçın normal bitişi otomatik kapanır; sonuç ekranında düğme yoktur:
// host/guest ayrımı olmadan anında ana sayfaya dönülür. Odayı host tarafı
// arka planda temizler; guest sinyal gönderirse host aynı sinyali alıp temizler.
if(randomRoomAtExit && (isAutomaticRandomTimeout||isRandomResultManualExit)){
  if(shouldDeleteRandom) setTimeout(()=>exitingRef?.remove().catch(()=>{}),120);
  returnToHomeFromMultiplayer();
  hideRoomExitNotice();
  return;
}

// v233: Rastgele maçta oyunculardan biri ÇIKIŞ yaptığında iki tarafta da
// kısa "OYUNDAN ÇIKIŞ YAPILDI" bildirimi görünür ve ardından ana sayfaya dönülür.
if(randomRoomAtExit && isManualPlayerExit && initiatedBySelf){
  showRoomExitNotice('OYUNDAN ÇIKIŞ YAPILDI');
  await new Promise(r=>setTimeout(r,700));
  returnToHomeFromMultiplayer();
  hideRoomExitNotice();
  return;
}

if(shouldDeletePrivate){ try{ await lockClosedRoomCode(exitingCode,exitingRef,reason||'player-exit'); }catch(_){ } }
const exitMessage=reason==='opponent-disconnected'
?'RAKİBİN BAĞLANTISI KESİLDİ'
:(reason==='invite-timeout'
?'OYUN SONLANDIRILDI'
:(reason==='player-exit'
?'OYUN SONLANDIRILDI'
:(reason==='rematch-timeout'?'OYUN İPTAL OLDU':'OYUN SONLANDIRILDI')));
if(isManualPlayerExit || !randomResultExit) showRoomExitNotice(exitMessage);
await new Promise(r=>setTimeout(r,isManualPlayerExit?1250:2000));
if(shouldDeletePrivate||shouldDeleteRandom){try{await exitingRef.remove();}catch(_){} }
returnToHomeFromMultiplayer();
hideRoomExitNotice();
}
async function requestSynchronizedRoomExit(reason='game-cancelled'){

if(!mpRoomRef || !mpRole){
return exitCurrentGameToHome();
}
if(mpExitHandling) return;
const ref=mpRoomRef;
const role=mpRole;
const signal={
id:`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`,
at:serverNow(),
by:role,
reason
};
// Kendi roomExit listener'ımız aynı sinyali ikinci kez işlememeli.
mpLastExitSignalId=signal.id;
const randomImmediate=isRandomHumanRoom() && ['player-exit','random-result-exit','random-result-timeout'].includes(reason);
if(randomImmediate){
  // Rastgele maç tek kullanımlıktır. Manuel çıkış sinyalini önce diğer oyuncuya
  // ulaştırmaya çalışırız; ardından oda host/guest ayrımı olmadan temizlenir.
  ref.child('roomExit').set(signal).then(()=>{
    if(reason==='player-exit') setTimeout(()=>ref.remove().catch(()=>{}),1100);
    else setTimeout(()=>ref.child('roomExit').transaction(cur=>cur?.id===signal.id?null:cur).catch(()=>{}),2200);
  }).catch(e=>{
    console.warn('Random room exit signal error',e);
    if(reason==='player-exit') setTimeout(()=>ref.remove().catch(()=>{}),1100);
  });
  await handleSynchronizedRoomExit(reason,role);
  return;
}
try{
if(reason==='player-exit') await ref.child('rematch').set({host:false,guest:false,expiresAt:0}).catch(()=>{});
await ref.child('roomExit').set(signal);
setTimeout(()=>ref.child('roomExit').transaction(cur=>cur?.id===signal.id?null:cur).catch(()=>{}),2200);
await handleSynchronizedRoomExit(reason,role);
}catch(e){
console.error('Synchronized room exit error',e);
await handleSynchronizedRoomExit(reason,role);
}
}
async function exitCurrentGameToHome(){
stopLocalCountdown();
stopInviteDecisionTimer();
clearTimeUpPreview();
stopWinnerConfettiWaterfall();
clearVictoryPresentation();
isMatchActive=false;
clearInterval(timerInterval); timerInterval=null;
clearInterval(mpClock); mpClock=null;
clearTimeout(botInterval); botInterval=null;
if(pointerFrame){ cancelAnimationFrame(pointerFrame); pointerFrame=0; }
isPointerDown=false; pointerHoldStartedAt=0; clearTimeout(pointerHoldTimer); pointerHoldTimer=null; activePointerId=null; pendingPointer=null; activeGridRect=null; activeGridMetrics=null;
try{ clearPath(); }catch(_){ selectedPath=[]; }

document.getElementById('modal-countdown')?.classList.add('hidden');
document.getElementById('modal-gameover')?.classList.add('hidden');
document.getElementById('modal-rematch-waiting')?.classList.add('hidden');
document.getElementById('modal-mp-waiting')?.classList.add('hidden');

if(activeGameMode==='multi' || mpRole || mpRoomRef){
if(mpPresenceRef){
await mpPresenceRef.set({online:false,clientId:getClientToken(),at:firebase.database.ServerValue.TIMESTAMP}).catch(()=>{});
}
returnToHomeFromMultiplayer();
}else{
activeGameMode='single';
sessionFoundWords.clear();
const ticker=document.getElementById('words-ticker'); if(ticker)ticker.innerHTML='';
ensurePreviewTiles(); for(const pv of previewTiles){ pv.tile.hidden=true; pv.letter.textContent=''; pv.score.textContent=''; }
setSelectedPreviewState('neutral');
document.getElementById('screen-game')?.classList.add('hidden');
document.getElementById('screen-home')?.classList.remove('hidden');
}
}

document.getElementById('btn-quick-exit')?.addEventListener('click', ()=>{
if(activeGameMode==='multi' && mpRoomRef && mpRole) requestSynchronizedRoomExit('player-exit');
else exitCurrentGameToHome();
});


document.getElementById('btn-game-exit')?.addEventListener('click', ()=>{
if(activeGameMode!=='multi' && !mpRoomRef && !mpRole){
  exitCurrentGameToHome();
  return;
}
if(isRandomHumanRoom()){
  exitRandomResultImmediately();
  return;
}
if(mpRoomRef && mpRole) requestSynchronizedRoomExit('player-exit');
else returnToHomeFromMultiplayer();
});
const btnOpenDictionary = document.getElementById('btn-open-dictionary');
const DICT_PAGE_SIZE = 140;
const dictSortedLetters = new Set();
let dictCurrentLetter = 'A';
let dictCurrentQuery = '';
let dictVisibleCount = DICT_PAGE_SIZE;
let dictCurrentWords = [];

function openDictionary(){
ensureDictionaryIndex();
renderAlphabetButtons();
dictCurrentLetter=''; dictCurrentQuery=''; dictVisibleCount=DICT_PAGE_SIZE;
document.getElementById('dict-search-input').value='';
document.getElementById('dict-search-wrap')?.classList.add('hidden');
document.getElementById('dict-search-meaning').classList.add('hidden');
document.getElementById('dict-list-heading')?.classList.add('hidden');
document.getElementById('dict-rules-panel')?.classList.add('hidden');
const initialDictList=document.getElementById('dict-words-list');
initialDictList?.classList.add('hidden');
if(initialDictList) initialDictList.style.display='';
document.getElementById('dict-load-more')?.classList.add('hidden');
updateAlphabetActive();
document.getElementById('modal-dictionary').classList.remove('hidden');
}
document.getElementById('btn-close-dict').onclick = () => {
clearTimeout(dictSearchTimer);
closeDictionaryMeaning();
document.getElementById('modal-dictionary').classList.add('hidden');
};

function ensureLetterSorted(letter){
if(!letter || dictSortedLetters.has(letter)) return;
const bucket = DICT_BY_LETTER?.[letter];
if(bucket) bucket.sort((a,b)=>a.localeCompare(b,'tr'));
dictSortedLetters.add(letter);
}

function renderAlphabetButtons() {
const bar = document.getElementById('alphabet-bar');
if(bar.dataset.ready==='1') { updateAlphabetActive(); return; }
const frag=document.createDocumentFragment();
TURKISH_ALPHABET.forEach(l => {
const btn = document.createElement('button');
btn.className = "dict-letter-btn w-7 h-7 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-bold shadow-sm";
btn.textContent = l;
btn.dataset.letter=l;
btn.onclick = () => {
document.getElementById('dict-search-input').value = '';
closeDictionaryMeaning(); document.getElementById('dict-search-meaning').classList.add('hidden');
dictCurrentQuery=''; dictCurrentLetter=l; dictVisibleCount=DICT_PAGE_SIZE;
renderWordsForLetter(l);
};
frag.appendChild(btn);
});
bar.appendChild(frag); bar.dataset.ready='1'; updateAlphabetActive();
}
function updateAlphabetActive(){
document.querySelectorAll('.dict-letter-btn').forEach(b=>b.classList.toggle('dict-letter-active', !dictCurrentQuery && b.dataset.letter===dictCurrentLetter));
}

function getDictionaryWords(letter, query=''){
if(query){
const q=query.toLocaleUpperCase('tr-TR');
const out=[];
for(const l of TURKISH_ALPHABET){
const bucket=DICT_BY_LETTER[l]||[];
for(const w of bucket) if(w.includes(q)) out.push(w);
}
out.sort((a,b)=>(a===q?-1:0)-(b===q?-1:0)||a.localeCompare(b,'tr'));
return out;
}
ensureLetterSorted(letter);
return DICT_BY_LETTER[letter] || [];
}

const dictMeaningCache = new Map();
let dictMeaningAbortController = null;
let dictMeaningOpenKey = '';
let dictMeaningOpenHost = null;

function normalizeMeaningLookupWord(value){
return String(value||'').toLocaleUpperCase('tr-TR').replaceAll('Â','A').replaceAll('Î','İ').replaceAll('Û','U');
}
function closeDictionaryMeaning(){
if(dictMeaningAbortController){try{dictMeaningAbortController.abort();}catch(_){ } dictMeaningAbortController=null;}
if(dictMeaningOpenHost) dictMeaningOpenHost.classList.add('hidden');
dictMeaningOpenKey=''; dictMeaningOpenHost=null;
}
function fillInlineMeaning(host, word, meanings, sourceWord=''){
if(!host) return;
host.textContent='';
const title=document.createElement('div'); title.className='dict-meaning-title';
title.textContent=sourceWord && normalizeMeaningLookupWord(sourceWord)!==normalizeMeaningLookupWord(word) ? `${word} • TDK: ${sourceWord}` : `${word} • anlam`;
host.appendChild(title);
if(!meanings?.length){
const msg=document.createElement('div'); msg.textContent='TDK Güncel Türkçe Sözlükte bu yazımla anlam bulunamadı.'; host.appendChild(msg);
}else{
meanings.slice(0,6).forEach((meaning,index)=>{
const row=document.createElement('div'); row.className='dict-meaning-item';
const num=document.createElement('span'); num.className='dict-meaning-num'; num.textContent=`${index+1}.`;
const txt=document.createElement('span'); txt.textContent=meaning;
row.append(num,txt); host.appendChild(row);
});
}
const note=document.createElement('div'); note.className='dict-meaning-note'; note.textContent=GEO_DICTIONARY[normalizeMeaningLookupWord(word)]?'KAPMACA Coğrafi Sözlük':'TDK Güncel Türkçe Sözlük • anlamlar çevrim içi sorgulanır.'; host.appendChild(note);
host.classList.remove('hidden');
}
async function showDictionaryMeaning(word, host, auto=false){
if(!host) return;
const key=normalizeMeaningLookupWord(word);
if(!auto && dictMeaningOpenKey===key && dictMeaningOpenHost===host && !host.classList.contains('hidden')){closeDictionaryMeaning();return;}
closeDictionaryMeaning(); dictMeaningOpenKey=key; dictMeaningOpenHost=host;
if(dictMeaningCache.has(key)){
const cached=dictMeaningCache.get(key); fillInlineMeaning(host,word,cached.meanings,cached.sourceWord); return;
}
if(GEO_DICTIONARY[key]){
const local={meanings:[GEO_DICTIONARY[key]],sourceWord:String(word)};
dictMeaningCache.set(key,local); fillInlineMeaning(host,word,local.meanings,local.sourceWord); return;
}
const controller=new AbortController(); dictMeaningAbortController=controller;
host.textContent=''; const loading=document.createElement('div'); loading.className='dict-meaning-loading'; loading.textContent='Anlam getiriliyor…'; host.appendChild(loading); host.classList.remove('hidden');
let timedOut=false;
const timeout=setTimeout(()=>{timedOut=true;controller.abort();},7000);
try{
const query=String(word).toLocaleLowerCase('tr-TR');
const response=await fetch(`https://sozluk.gov.tr/gts?ara=${encodeURIComponent(query)}`,{signal:controller.signal,cache:'no-store'});
if(!response.ok) throw new Error(`HTTP ${response.status}`);
const data=await response.json(); if(controller.signal.aborted) return;
const rows=Array.isArray(data)?data:[];
const exact=rows.filter(entry=>normalizeMeaningLookupWord(entry?.madde||'')===key);
const chosen=exact.length?exact:rows;
const meanings=[]; const seen=new Set();
for(const entry of chosen){
for(const sense of (entry?.anlamlarListe||[])){
const text=String(sense?.anlam||'').trim();
if(text && !seen.has(text)){seen.add(text);meanings.push(text);}
if(meanings.length>=6) break;
}
if(meanings.length>=6) break;
}
const sourceWord=chosen[0]?.madde||'';
if(meanings.length) dictMeaningCache.set(key,{meanings,sourceWord});
if(dictMeaningOpenKey===key && dictMeaningOpenHost===host) fillInlineMeaning(host,word,meanings,sourceWord);
}catch(err){
if(controller.signal.aborted && !timedOut) return;
if(dictMeaningOpenKey===key && dictMeaningOpenHost===host){host.textContent='';const msg=document.createElement('div');msg.className='dict-meaning-loading';msg.textContent='Anlam şu anda alınamadı. Bağlantıyı kontrol edip tekrar ara veya sözcüğe dokun.';host.appendChild(msg);host.classList.remove('hidden');}
}finally{clearTimeout(timeout);if(dictMeaningAbortController===controller)dictMeaningAbortController=null;}
}

function paintDictionaryWords(){
closeDictionaryMeaning();
const list=document.getElementById('dict-words-list');
list.innerHTML='';
const frag=document.createDocumentFragment();
const limit=Math.min(dictVisibleCount,dictCurrentWords.length);
for(let i=0;i<limit;i++){
const w=dictCurrentWords[i];
const pts=w.split('').reduce((sum,c)=>sum+(TILE_SCORES[c]||1),0);
const entry=document.createElement('div'); entry.className='dict-word-entry';
const button=document.createElement('button'); button.type='button'; button.className='dict-word-button'; button.title=`${w} anlamını göster`; button.setAttribute('aria-expanded','false');
const wordSpan=document.createElement('span'); wordSpan.className='dict-word-main'; wordSpan.textContent=w;
const pointSpan=document.createElement('span'); pointSpan.className='dict-word-points'; pointSpan.textContent=`${pts}p`;
const meaning=document.createElement('div'); meaning.className='dict-inline-meaning hidden'; meaning.setAttribute('aria-live','polite');
button.append(wordSpan,pointSpan);
button.onclick=()=>{const opening=meaning.classList.contains('hidden') || dictMeaningOpenHost!==meaning; showDictionaryMeaning(w,meaning); button.setAttribute('aria-expanded',opening?'true':'false');};
entry.append(button,meaning); frag.appendChild(entry);
}
list.appendChild(frag);
const more=document.getElementById('dict-load-more');
more.classList.toggle('hidden', limit>=dictCurrentWords.length);
more.textContent=`DAHA FAZLA GÖSTER (${dictCurrentWords.length-limit})`;
}

function renderWordsForLetter(letter, query = '') {
closeDictionaryMeaning();
dictCurrentLetter=letter || dictCurrentLetter || 'A';
dictCurrentQuery=query;
dictCurrentWords=getDictionaryWords(dictCurrentLetter,query);
document.getElementById('dict-search-wrap')?.classList.remove('hidden');
document.getElementById('dict-list-heading')?.classList.remove('hidden');
document.getElementById('dict-rules-panel')?.classList.remove('hidden');
const list=document.getElementById('dict-words-list');
list?.classList.remove('hidden');
if(list) list.style.display='block';
document.getElementById('dict-letter-heading').textContent = query ? `"${query}" ARAMA SONUÇLARI` : `"${dictCurrentLetter}" HARFİ KELİMELERİ`;
document.getElementById('dict-word-count').textContent = `${dictCurrentWords.length} Kelime`;
updateAlphabetActive();
paintDictionaryWords();
}

document.getElementById('dict-load-more').onclick=()=>{ dictVisibleCount += DICT_PAGE_SIZE; paintDictionaryWords(); };
let dictSearchTimer=null;
function searchDictionaryInput(){
const q=document.getElementById('dict-search-input').value.trim();
dictVisibleCount=DICT_PAGE_SIZE;
renderWordsForLetter(dictCurrentLetter,q);
const meaning=document.getElementById('dict-search-meaning');
if(q){showDictionaryMeaning(q,meaning,true);}else{closeDictionaryMeaning();meaning.classList.add('hidden');}
}
document.getElementById('dict-search-input').oninput = (e) => {
clearTimeout(dictSearchTimer);
closeDictionaryMeaning(); document.getElementById('dict-search-meaning').classList.add('hidden');
if(!e.target.value.trim()){searchDictionaryInput();return;}
dictSearchTimer=setTimeout(searchDictionaryInput,280);
};
document.getElementById('dict-search-input').onkeydown = e => {
if(e.key==='Enter'){e.preventDefault();clearTimeout(dictSearchTimer);searchDictionaryInput();}
};

document.getElementById('modal-rematch-waiting')?.classList.add('hidden');
document.getElementById('btn-close-rematch-waiting')?.addEventListener('click',()=>document.getElementById('modal-rematch-waiting')?.classList.add('hidden'));
document.getElementById('btn-rematch-accept')?.addEventListener('click',handlePlayAgain);
document.getElementById('btn-rematch-decline')?.addEventListener('click',()=>document.getElementById('modal-rematch-waiting')?.classList.add('hidden'));

const initialRoomCode=new URL(location.href).searchParams.get('room');
if(!initialRoomCode){
  const warm=()=>ensureWordDataLoaded().then(()=>{scheduleBoardPrewarm();console.info(`KAPMACA v333: ${WORD_LIST.length} sözcük | lazy veri yükleme aktif.`);}).catch(()=>{});
  if('requestIdleCallback' in window) requestIdleCallback(warm,{timeout:2600});
  else setTimeout(warm,1600);
}
