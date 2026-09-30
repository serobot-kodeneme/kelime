const TILE_SCORES={
'A':2,'B':4,'C':5,'Ç':5,'D':4,'E':2,'F':8,'G':6,'Ğ':9,'H':6,'I':3,
'İ':2,'J':11,'K':2,'L':2,'M':3,'N':2,'O':3,'Ö':8,'P':6,'R':2,'S':3,
'Ş':5,'T':2,'U':3,'Ü':4,'V':8,'Y':4,'Z':5
};
let WORD_DB_FC='';
let WORD_LIST=[];
const ARGO_EXACT=new Set(['AM','GÖT','YARAK','TAŞAK','TAŞAKLI','ÇÜK','SİK','SİKME','SİKMEK']);
const ARGO_PREFIXES=['OROSPU','PEZEVENK','KAHPE','İBNE','PUŞT','SÜRTÜK','KALTAK','DALYARAK','PİÇ','SİKTİR','AMCIK','AMINA','YARRAK','GÖTVEREN','SIÇMA','SIÇTIR'];
function isArgoWord(word){
const w=String(word||'').toLocaleUpperCase('tr-TR');
if(ARGO_EXACT.has(w))return true;
for(const root of ARGO_PREFIXES)if(w.startsWith(root))return true;
return w.startsWith('BOK')&&!w.startsWith('BOKS')&&!w.startsWith('BOKSİT');
}
const FOREIGN_EXACT=new Set(['ASK','CHANGE','CHAT','RUN','TALK']);
const TURKISH_WORD_CHARS = /^[ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ]+$/;
const COMMON_IMPERATIVE_WORDS=Object.freeze([
'AÇ','AÇIL','AÇMA','AK','AL','AN','ANLA','ARA','ART','AS','AT','ATLA','AYIR',
'BAK','BAS','BAŞLA','BEKLE','BELİRLE','BIRAK','BİL','BİLDİR','BİN','BİTİR','BOZ','BÖL','BUL',
'ÇAĞIR','ÇAL','ÇALIŞ','ÇEK','ÇEVİR','ÇIK','ÇIKAR','ÇİZ','ÇÖZ',
'DAĞIT','DAYAN','DE','DEĞİŞ','DENE','DİNLE','DÖK','DÖN','DÖNDÜR','DUR','DÜŞ','DÜŞÜN',
'EKLE','GEÇ','GEL','GENİŞLET','GETİR','GİR','GİT','GÖNDER','GÖR','GÖSTER','GÖTÜR',
'HATIRLA','HAZIRLA','İÇ','İLERLE','İN','İNDİR','İNCELE','İZLE',
'KAL','KALDIR','KAPAT','KARŞILA','KAT','KAYDET','KAZAN','KES','KIR','KIRP','KONUŞ','KORU','KOŞ','KULLAN',
'OKU','OL','OYNA','ÖĞREN','ÖLÇ','ÖP',
'PAYLAŞ','PİŞİR',
'SAKLA','SAR','SAY','SEÇ','SEV','SİL','SOR','SÖYLE','SÜR',
'TAK','TAŞI','TOPLA','TUT',
'UÇ','UY','UYAN','UYGULA',
'ÜRET',
'VAR','VER','VUR',
'YAK','YAKALA','YAP','YAZ','YERLEŞ','YE','YIK','YÜKLE','YÜRÜ','YÜRÜT',
'ZORLA'
]);
/* v446 — Kontrollü sözlük genişletme katmanı.
Amaç:ana sözlüğü bozmadan günlük kullanımda oyuncunun beklediği doğal biçimleri artırmak.
Katmanlar: yaygın çekimli fiiller, çoğullar/günlük sözcükler, meslek-eşya-hayvan-bitki
ve daha seyrek fakat doğal sözcükler. 2–9 harf kuralı ve argo/yabancı filtreleri aynen geçerlidir. */
const CURATED_EXPANSION_WORDS=Object.freeze([
'AÇTI','AÇAR','AÇAN','AÇILDI','ALDI','ALIR','ALAN','ALMIŞ','ANLADI','ANLAR','ANLAYAN',
'ARADI','ARAR','ARAYAN','ATTI','ATAR','ATAN','AYIRDI','AYIRIR','BAKTI','BAKAR','BAKAN',
'BASAR','BASAN','BAŞLADI','BEKLEDİ','BEKLER','BİLDİ','BİLİR','BİLEN','BİNDİ','BİNER',
'BİTİRDİ','BİTİRİR','BOZDU','BOZAR','BÖLDÜ','BÖLER','BULDU','BULUR','BULAN',
'ÇAĞIRDI','ÇAĞIRIR','ÇALDI','ÇALAR','ÇALIŞTI','ÇALIŞIR','ÇEKTİ','ÇEKER','ÇIKTI','ÇIKAR',
'ÇİZDİ','ÇİZER','ÇİZEN','ÇÖZDÜ','ÇÖZER','DAĞITTI','DAYANDI','DEĞİŞTİ','DENEDİ','DİNLER',
'DÖKTÜ','DÖKER','DÖNDÜ','DÖNER','DÖNEN','DURDU','DURUR','DURAN','DÜŞTÜ','DÜŞER','DÜŞÜNDÜ',
'EKLEDİ','EKLER','GEÇTİ','GEÇER','GELDİ','GELİR','GELEN','GELMİŞ','GETİRDİ','GETİRİR',
'GİRDİ','GİRER','GİTTİ','GİDER','GİDEN','GÖRDÜ','GÖRÜR','GÖREN','GÖSTERDİ','GÖTÜRDÜ','GÖTÜRÜR',
'HAZIRDI','İÇTİ','İÇER','İÇEN','İNDİ','İNER','İNDİRDİ','İNDİRİR','İZLEDİ','İZLER',
'KALDI','KALIR','KALAN','KALDIRDI','KAPADI','KAPAR','KAPAN','KATTI','KATAR','KAYDETTİ',
'KAZANDI','KAZANIR','KESTİ','KESER','KIRDI','KIRAR','KONUŞTU','KONUŞUR','KORUDU','KORUR',
'KOŞTU','KOŞAR','KOŞAN','KULLANDI','OKUDU','OKUR','OKUYAN','OLDU','OLUR','OLAN',
'OYNADI','OYNAR','ÖĞRENDİ','ÖĞRENİR','ÖLÇTÜ','ÖLÇER','PAYLAŞTI','PİŞİRDİ','SAKLADI',
'SARDI','SARAR','SAYDI','SAYAR','SEÇTİ','SEÇER','SEÇEN','SEVDİ','SEVER','SEVEN',
'SİLDİ','SİLER','SİLEN','SORDU','SORAR','SÖYLEDİ','SÖYLER','SÜRDÜ','SÜRER',
'TAKTI','TAKAR','TAŞIDI','TAŞIR','TOPLADI','TOPLAR','TUTTU','TUTAR','TUTAN',
'UÇTU','UÇAR','UYUDU','UYUR','UYANDI','UYGULADI','ÜRETTİ','ÜRETİR','VERDİ','VERİR','VEREN',
'VURDU','VURUR','YAKTI','YAKAR','YAKALADI','YAPTI','YAPAR','YAPAN','YAZDI','YAZAR','YAZAN',
'YEDİ','YER','YIKTI','YIKAR','YÜKLEDİ','YÜKLER','YÜRÜDÜ','YÜRÜR','YÜRÜTEN',
'EVLER','YOLLAR','TAŞLAR','KUŞLAR','KEDİLER','KÖPEKLER','AĞAÇLAR','ÇİÇEKLER','KALEMLER',
'KİTAPLAR','MASALAR','ODALAR','KAPILAR','CAMLAR','DAĞLAR','GÖLLER','DENİZLER','OKULLAR',
'ÇOCUKLAR','OYUNLAR','SÖZLER','HARFLER','RENKLER','SESLER','ELLER','GÖZLER','YÜZLER',
'GÜNLER','AYLAR','YILLAR','SAATLER','ŞEHİRLER','ÜLKELER','DOSTLAR','SORULAR','CEVAPLAR',
'SAYILAR','ŞEKİLLER','RESİMLER','ARAÇLAR','ÇANTALAR','BARDAKLAR','TABAKLAR','KAŞIKLAR',
'AYNEN','HADİ','TAMAM','KEŞKE','BELKİ','ZATEN','NEDEN','NASIL','NEREDE','NEREYE','NEREDEN',
'ŞİMDİ','SONRA','ÖNCE','BUGÜN','YARIN','DÜN','HEMEN','BAZEN','ÇÜNKÜ','FAKAT','YİNE','ARTIK',
'PEKİ','TABİİ','GALİBA','SANIRIM','ELBETTE','ÜSTELİK','AYRICA','BİRLİKTE','TEKRAR','İLK',
'SON','HERKES','KİMSE','BİRKAÇ','BİRÇOK','BAŞKA','BÜTÜN','KADAR','KENDİ','BÖYLE','ŞÖYLE',
'DOKTOR','TERZİ','KASAP','ŞOFÖR','GARSON','BERBER','MİMAR','AVUKAT','ECZACI','POLİS','HAKİM',
'SAVCI','AŞÇI','ÇİFTÇİ','İŞÇİ','ŞAİR','YAZAR','RESSAM','MARANGOZ','MÜHENDİS','HEMŞİRE',
'ÖĞRETMEN','PASTACI','MANAV','BAKKAL','KASİYER','MEMUR','USTA','ÇIRAK','ŞOFÖRLÜK',
'KEDİ','KÖPEK','KUŞ','AT','İNEK','KOYUN','KEÇİ','TAVUK','HOROZ','ÖRDEK','KAZ','ARI','KARINCA',
'SİNEK','KELEBEK','BALIK','YILAN','KURBAĞA','TAVŞAN','ASLAN','KAPLAN','AYI','KURT','TİLKİ',
'GEYİK','CEYLAN','MAYMUN','ZEBRA','FİL','DEVE','PENGUEN','YUNUS','BALİNA','MARTI','SERÇE',
'KARGA','GÜVERCİN','KARTAL','ŞAHİN','LEYLEK','KİRPİ','SİNCAP','KAPLUMBAĞA',
'GÜL','LALE','MENEKŞE','PAPATYA','ÇAM','MEŞE','KAVAK','SÖĞÜT','ZEYTİN','İNCİR','ELMA','ARMUT',
'KİRAZ','VİŞNE','ÜZÜM','KAVUN','KARPUZ','ERİK','ŞEFTALİ','PORTAKAL','MANDALİN','LİMON',
'DOMATES','BİBER','PATATES','SOĞAN','SARIMSAK','HAVUÇ','SALATALIK','MARUL','ISPANAK',
'EKMEK','PEYNİR','YOĞURT','SÜT','AYRAN','ÇORBA','PİLAV','MAKARNA','YUMURTA','BAL',
'KALEM','DEFTER','KİTAP','SİLGİ','CETVEL','MASA','SANDALYE','KAPI','PENCERE','BARDAK',
'TABAK','KAŞIK','ÇATAL','BIÇAK','ÇANTA','KUTU','ANAHTAR','SAAT','TELEFON','EKRAN','MODEM',
'ÇEHRE','SEHER','SEDA','YAREN','SERİN','ESİNTİ','GÖLGE','ŞAFAK','UFUK','PINAR','IRMAK',
'KORU','VADİ','YAMAÇ','DORUK','KIYI','KUMSAL','DALGA','ESEN','DURU','PARLAK','YALIN',
'NAZİK','ÇEVİK','SAKİN','CESUR','ÖZGÜR','BİLGE','MERAK','UMUT','NEŞE','SEVİNÇ','DOSTLUK',
'ADIM','AKIL','ALAN','ANLIK','ARAÇ','ARALIK','ARTI','AŞAMA','BAĞ','BAĞLI','BAŞ','BİÇİM','BİLGİ',
'BİRİ','BİZ','BOY','BOYUT','BÖLÜM','ÇABA','ÇARE','ÇEVRE','DENGE','DEĞER','DİZİ','DÜZEN','DÜZEY',
'ETKİ','EVRE','FİKİR','GEREK','GÜÇ','HAL','HIZ','İLKE','İPUCU','İŞLEM','İZ','KARAR','KONU',
'KURAL','KÜME','NOKTA','OLAY','ORTA','ÖLÇEK','ÖRNEK','PAY','PLAN','SIRA','SINIR','SONUÇ','SÜRE',
'TARAF','TÜR','YOL','YÖN','ZAMAN','ZEMİN','AÇIK','CANLI','DERİN','DOĞAL','ERKEN','GENÇ','GÜZEL',
'HIZLI','İNCE','KOLAY','KÜÇÜK','NET','ORTAK','SAĞLAM','SICAK','TEMİZ','UZAK','YAKIN','YENİ',
'YÜKSEK','AZ','ÇOK','DAHA','EN','HER','İYİ','KÖTÜ','VARSA','YOKSA','İÇİN','GİBİ','KİM','NE',
'NİYE','HANGİ','BURA','ŞURA','ORADA','BURADA','İLERİ','GERİ','YUKARI','AŞAĞI'
]);
function isForeignWord(word){
const w=String(word||'').toLocaleUpperCase('tr-TR');
return !TURKISH_WORD_CHARS.test(w)||FOREIGN_EXACT.has(w);
}
let GEO_DICTIONARY=Object.freeze({});
let GEO_WORD_LIST=[];
let GAME_WORD_LIST=[];
let GAME_WORD_SET=new Set();
const TILE_SCORE_CACHE=Object.freeze({...TILE_SCORES});
const GAME_WORDS_BY_LENGTH=new Map();
let wordDataReady=false;
let wordDataPromise=null;
function initializeWordData(data){
if(wordDataReady)return true;
if(!data||typeof data.WORD_DB_FC!=='string'||!data.GEO_DICTIONARY)throw new Error('word-data-invalid');
WORD_DB_FC=data.WORD_DB_FC;
const out=[];
let prev='';
for(const row of WORD_DB_FC.split('\n')){
if(!row)continue;
const prefixLen=parseInt(row[0],36);
const word=prev.slice(0,prefixLen)+row.slice(1);
out.push(word);prev=word;
}
WORD_LIST=out;
GEO_DICTIONARY=data.GEO_DICTIONARY;
GEO_WORD_LIST=Object.keys(GEO_DICTIONARY);
GAME_WORD_LIST=Array.from(new Set([...WORD_LIST,...GEO_WORD_LIST,...COMMON_IMPERATIVE_WORDS,...CURATED_EXPANSION_WORDS]))
.filter(w=>w.length>=2&&w.length<=9&&!isArgoWord(w)&&!isForeignWord(w)).sort();
GAME_WORD_SET=new Set(GAME_WORD_LIST);
GAME_WORDS_BY_LENGTH.clear();
for(const w of GAME_WORD_LIST){
if(!GAME_WORDS_BY_LENGTH.has(w.length))GAME_WORDS_BY_LENGTH.set(w.length,[]);
GAME_WORDS_BY_LENGTH.get(w.length).push(w);
}
rebuildBoardWordPools();
DICT_BY_LETTER=null;
wordDataReady=true;
return true;
}
function ensureWordDataLoaded(){
if(wordDataReady)return Promise.resolve(true);
if(wordDataPromise)return wordDataPromise;
const loadAttempt=(src,timeoutMs=10000)=>new Promise((resolve,reject)=>{
if(window.KAPMACA_WORD_DATA){resolve(true);return;}
const script=document.createElement('script');
let done=false;
const finish=(ok,err)=>{
if(done)return;done=true;clearTimeout(timer);
script.onload=null;script.onerror=null;
if(!ok){try{script.remove();}catch(_){}reject(err||new Error('word-data-load-failed'));return;}
resolve(true);
};
const timer=setTimeout(()=>finish(false,new Error('word-data-load-timeout')),timeoutMs);
script.src=src;script.async=true;
script.onload=()=>finish(true);
script.onerror=()=>finish(false,new Error('word-data-load-failed'));
document.head.appendChild(script);
});
wordDataPromise=(async()=>{
if(!window.KAPMACA_WORD_DATA){
let ok=false;
for(const src of['word-data.js?v=436','word-data.js?v=436&retry=1']){
try{await loadAttempt(src);ok=true;break;}catch(_){}
}
if(!ok&&!window.KAPMACA_WORD_DATA)throw new Error('word-data-unavailable');
}
initializeWordData(window.KAPMACA_WORD_DATA);
try{delete window.KAPMACA_WORD_DATA;}catch(_){}
return true;
})().catch(err=>{wordDataPromise=null;throw err;});
return wordDataPromise;
}
function hasWordPrefix(prefix){
let lo=0,hi=GAME_WORD_LIST.length;
while(lo<hi){
const mid=(lo+hi)>>1;
if(GAME_WORD_LIST[mid]<prefix)lo=mid+1;else hi=mid;
}
return lo<GAME_WORD_LIST.length&&GAME_WORD_LIST[lo].startsWith(prefix);
}
const TURKISH_ALPHABET=['A','B','C','Ç','D','E','F','G','Ğ','H','I','İ','J','K','L','M','N','O','Ö','P','R','S','Ş','T','U','Ü','V','Y','Z'];
let DICT_BY_LETTER=null;
function ensureDictionaryIndex(){
if(DICT_BY_LETTER)return;
DICT_BY_LETTER=Object.fromEntries(TURKISH_ALPHABET.map(l=>[l,[]]));
for(const w of GAME_WORD_LIST)if(DICT_BY_LETTER[w[0]])DICT_BY_LETTER[w[0]].push(w);
}
const AVATARS=[
{id:'av_1',name:'1. Oyuncu',border:'border-amber-400 bg-amber-50 text-amber-700 shadow-md ring-2 ring-amber-300',icon:'👑'},
{id:'av_2',name:'2. Oyuncu',border:'border-sky-400 bg-sky-50 text-sky-700 shadow-md ring-2 ring-sky-300',icon:'⚔️'}
];
let chosenAvatarId='av_1';
let p1Score=0,p2Score=0;
const roundWordResults={p1:new Map(),p2:new Map()};
const seriesWordResults={p1:new Map(),p2:new Map()};
let singleLongestBonusApplied=false;
let singleLongestBonus={p1:false,p2:false,maxLen:0};
function clearPlayerWordShake(){
['p1-player-card','p2-player-card'].forEach(id=>{
const el=document.getElementById(id);
if(!el)return;
if(el._wordShakeAnim){el._wordShakeAnim.cancel();el._wordShakeAnim=null;}
el.style.transform='';
});
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
const el=document.getElementById(id);if(!el)return;
if(el._wordShakeAnim)el._wordShakeAnim.cancel();
if(typeof el.animate==='function'){
const anim=el.animate(frames,{duration:300,easing:'ease-out',iterations:1});
el._wordShakeAnim=anim;
anim.onfinish=anim.oncancel=()=>{if(el._wordShakeAnim===anim)el._wordShakeAnim=null;};
}else{
el.classList.remove('longest-player-shake');
requestAnimationFrame(()=>{el.classList.add('longest-player-shake');setTimeout(()=>el.classList.remove('longest-player-shake'),340);});
}
});
}
function resetMatchWordResults(){roundWordResults.p1.clear();roundWordResults.p2.clear();clearPlayerWordShake();}
function resetSeriesWordResults(){seriesWordResults.p1.clear();seriesWordResults.p2.clear();singleLongestBonusApplied=false;singleLongestBonus={p1:false,p2:false,maxLen:0};}
function recordMatchWord(word,pts,isP1){
const w=String(word||'').toLocaleUpperCase('tr-TR');
if(!w)return;
const roundMap=isP1?roundWordResults.p1:roundWordResults.p2;
const isNew=!roundMap.has(w);
if(isNew)roundMap.set(w,{word:w,pts:Number(pts)||0});
const seriesMap=isP1?seriesWordResults.p1:seriesWordResults.p2;
const key=w;
if(!seriesMap.has(key))seriesMap.set(key,{word:w,pts:Number(pts)||0});
if(isNew)celebrateWordPlayer(isP1,w.length);
}
function sortedTopScoreWords(isP1){
return Array.from((isP1?seriesWordResults.p1:seriesWordResults.p2).values())
.sort((a,b)=>b.pts-a.pts||b.word.length-a.word.length||a.word.localeCompare(b.word,'tr')).slice(0,5);
}
function renderGameoverWordLists(){
const draw=(id,items,tone)=>{
const el=document.getElementById(id);if(!el)return;
el.innerHTML='';
if(!items.length){el.innerHTML='<div class="text-center text-[9px] font-bold text-slate-400 py-2">—</div>';return;}
const frag=document.createDocumentFragment();
items.forEach((x,i)=>{
const entry=document.createElement('div');
entry.className=`rounded-lg ${tone==='amber'?'bg-white/75 text-amber-950':'bg-white/75 text-sky-950'}`;
const button=document.createElement('button');
button.type='button';
button.className=`w-full flex items-center justify-between gap-1 px-2 py-1.5 text-left cursor-pointer rounded-lg border-2 shadow-sm transition ${tone==='amber'?'border-amber-300 bg-amber-50 hover:bg-amber-100':'border-sky-300 bg-sky-50 hover:bg-sky-100'}`;
button.title=`${x.word}anlamını göster`;
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
const opening=meaning.classList.contains('hidden')||dictMeaningOpenHost!==meaning;
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
if(singleLongestBonusApplied)return singleLongestBonus;
singleLongestBonusApplied=true;
const a=Array.from(roundWordResults.p1.values()),b=Array.from(roundWordResults.p2.values());
const max1=a.reduce((m,x)=>Math.max(m,x.word.length),0),max2=b.reduce((m,x)=>Math.max(m,x.word.length),0),maxLen=Math.max(max1,max2);
if(maxLen>0){
if(max1===maxLen){p1Score+=10;singleLongestBonus.p1=true;}
if(max2===maxLen){p2Score+=10;singleLongestBonus.p2=true;}
singleLongestBonus.maxLen=maxLen;updateScores();
}
return singleLongestBonus;
}
function isFullscreenActive(){
return !!(document.fullscreenElement||document.webkitFullscreenElement);
}
function updateFullscreenUi(){
const active=isFullscreenActive();
const label=document.getElementById('fullscreen-label');
if(label)label.textContent=active?'TAM EKRANDAN ÇIK':'TAM EKRAN';
const gameLabel=document.getElementById('fullscreen-game-label');
if(gameLabel)gameLabel.textContent=active?'TAM EKRANDAN ÇIK':'TAM EKRAN';
}
async function requestGameFullscreen(silent=false){
if(isFullscreenActive()){updateFullscreenUi();return true;}
const el=document.documentElement;
try{
if(el.requestFullscreen)await el.requestFullscreen({navigationUI:'hide'});
else if(el.webkitRequestFullscreen)await el.webkitRequestFullscreen();
else{
if(!silent)showToast('Bu tarayıcı tam ekranı desteklemiyor.','slate');
return false;
}
updateFullscreenUi();
return true;
}catch(e){
if(!silent)showToast('Tam ekran açılamadı.','slate');
updateFullscreenUi();
return false;
}
}
async function toggleGameFullscreen(){
if(isFullscreenActive()){
try{
if(document.exitFullscreen)await document.exitFullscreen();
else if(document.webkitExitFullscreen)await document.webkitExitFullscreen();
}catch(e){}
updateFullscreenUi();
}else{
await requestGameFullscreen(false);
}
}
function handleFullscreenLayoutChange(){
updateFullscreenUi();
if(typeof isPointerDown!=='undefined'&&isPointerDown)return;
hoverGridRect=null;hoverGridMetrics=null;activeGridRect=null;activeGridMetrics=null;
requestAnimationFrame(()=>{
if(typeof isPointerDown!=='undefined'&&isPointerDown)return;
try{
const grid=document.getElementById('scrabble-grid');
if(grid&&grid.children.length){
hoverGridMetrics=measureGrid();
hoverGridRect=hoverGridMetrics.rect;
}
}catch(_){}
});
}
document.addEventListener('fullscreenchange',handleFullscreenLayoutChange);
document.addEventListener('webkitfullscreenchange',handleFullscreenLayoutChange);
let remainingSeconds=60;
let isMatchActive=false;
let botDiffLevel='easy';
let activeGameMode = null; // 'single' | 'multi' — replay akışının tek güvenilir kaynağı
let selectedPath=[];
let sessionFoundWords=new Set();
let gridBoard=[];
let domCells=[];
let boardFoundWords=[];
function updateGameTimerUI(seconds){
const el=document.getElementById('game-timer');
if(!el)return;
const sec=Math.max(0,Math.ceil(Number(seconds)||0));
el.textContent=sec;
const danger=sec<=10&&sec>0;
el.classList.toggle('timer-warning',danger);
el.classList.toggle('timer-critical',sec<=5&&sec>0);
const timerBox=el.closest('.compact-timer');
timerBox?.classList.toggle('timer-danger',danger);
if(!danger)timerBox?.classList.remove('timer-danger-red','timer-danger-black');
}
let timerInterval=null;
let botInterval=null;
let localCountdownInterval=null,localCountdownTimeout=null;
function stopLocalCountdown(){
if(localCountdownInterval){clearInterval(localCountdownInterval);localCountdownInterval=null;}
if(localCountdownTimeout){clearTimeout(localCountdownTimeout);localCountdownTimeout=null;}
}
let isPointerDown=false;
let pointerHoldStartedAt=0;
let pointerHoldTimer=null;
let activePointerId=null;
const HOLD_CANCEL_MS=3000;
const IS_COARSE_POINTER=!!window.matchMedia?.('(pointer:coarse)').matches;
let gameAudioCtx=null;
let lastHeartbeatSecond=null;
let lastGongSecond=null;
const SOUND_VOLUME_KEY='kd_sound_volume_v2';
const AUDIO_GAIN_BOOST = 1.722314; // v431: mevcut genel ses seviyesi +%10
const AUDIO_GAIN_CAP=0.3465;
function safeStorageGet(kind,key){
try{return(kind==='session'?window.sessionStorage:window.localStorage).getItem(key);}catch(_){return null;}
}
function safeStorageSet(kind,key,value){
try{(kind==='session'?window.sessionStorage:window.localStorage).setItem(key,value);return true;}catch(_){return false;}
}
let masterSoundVolume=Math.max(0,Math.min(1,Number(safeStorageGet('local',SOUND_VOLUME_KEY)??0.80)));
let lastNonMutedSoundVolume=masterSoundVolume>0?masterSoundVolume:.8;
function renderSoundControls(){
const range=document.getElementById('sound-volume-range');
const mute=document.getElementById('sound-muted');
if(range)range.value=String(Math.max(1,Math.min(6,Math.round((masterSoundVolume>0?masterSoundVolume:lastNonMutedSoundVolume)*6))));
if(mute)mute.checked=masterSoundVolume<=0;
}
function setMasterSoundVolume(v){
masterSoundVolume=Math.max(0,Math.min(1,Number(v)||0));
if(masterSoundVolume>0)lastNonMutedSoundVolume=masterSoundVolume;
safeStorageSet('local',SOUND_VOLUME_KEY,String(masterSoundVolume));
renderSoundControls();
}
function ensureGameAudio(){
try{
if(!gameAudioCtx){
const Ctx=window.AudioContext||window.webkitAudioContext;
if(Ctx)gameAudioCtx=new Ctx();
}
if(gameAudioCtx&&gameAudioCtx.state==='suspended')gameAudioCtx.resume().catch(()=>{});
}catch(_){}
return gameAudioCtx;
}
function playTone(freq=520,duration=.045,volume=.08,type='sine',endFreq=null,delay=0){
if(masterSoundVolume<=0)return;
const ctx=ensureGameAudio();if(!ctx||ctx.state==='closed')return;
try{
const now=ctx.currentTime+Math.max(0,delay);
const osc=ctx.createOscillator();
const gain=ctx.createGain();
osc.type=type;osc.frequency.setValueAtTime(freq,now);
if(endFreq)osc.frequency.exponentialRampToValueAtTime(Math.max(1,endFreq),now+duration);
const out=Math.max(0.0002,Math.min(AUDIO_GAIN_CAP,volume*masterSoundVolume*AUDIO_GAIN_BOOST));
gain.gain.setValueAtTime(0.0001,now);
gain.gain.exponentialRampToValueAtTime(out,now+0.006);
gain.gain.exponentialRampToValueAtTime(0.0001,now+duration);
osc.connect(gain);gain.connect(ctx.destination);
osc.start(now);osc.stop(now+duration+0.02);
}catch(_){}
}
function playLetterPickSound(step=1){
const n=Math.min(10,Math.max(1,step));
const base=430+(n-1)*28;
playTone(base,.060,.065,'sine',base+115);
}
let lastUiSoundAt=0,lastUiReleaseAt=0;
function playUiClickSound(){
if(document.hidden)return;
const now=performance.now();
if(now-lastUiSoundAt<85)return;
lastUiSoundAt=now;
playTone(560,.028,.028,'sine',690);
}
function isUiSoundTarget(target){
const el=target?.closest?.('button,a,[role="button"]');
return el&&!el.disabled?el:null;
}
document.addEventListener('pointerover',(e)=>{
if(e.pointerType==='touch')return;
const el=isUiSoundTarget(e.target);
if(!el)return;
const fromEl=isUiSoundTarget(e.relatedTarget);
if(fromEl===el) return; // Aynı düğmenin ikon/yazı gibi iç öğeleri arasında geçiş.
playUiClickSound();
},{passive:true});
document.addEventListener('pointerdown',(e)=>{
if(isUiSoundTarget(e.target))ensureGameAudio();
},{passive:true});
document.addEventListener('pointerup',(e)=>{
const el=isUiSoundTarget(e.target);
if(!el)return;
lastUiReleaseAt=performance.now();
playUiClickSound(); // Basıp bırakınca yalnızca bir kez.
},{passive:true});
document.addEventListener('click',(e)=>{
const el=isUiSoundTarget(e.target);
if(!el)return;
if(performance.now()-lastUiReleaseAt>500)playUiClickSound();
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
if(masterSoundVolume<=0)return;
const ctx=ensureGameAudio();if(!ctx)return;
const thump=(delay,freq,vol,dur)=>{
try{
const now=ctx.currentTime+delay;
const osc=ctx.createOscillator(),gain=ctx.createGain();
osc.type='sine';osc.frequency.setValueAtTime(freq,now);
osc.frequency.exponentialRampToValueAtTime(Math.max(35,freq*.62),now+dur);
gain.gain.setValueAtTime(0.0001,now);
gain.gain.exponentialRampToValueAtTime(Math.min(AUDIO_GAIN_CAP,vol*masterSoundVolume*AUDIO_GAIN_BOOST),now+.012);
gain.gain.exponentialRampToValueAtTime(0.0001,now+dur);
osc.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+dur+.02);
}catch(_){}
};
thump(0,92,.105,.11);thump(.16,72,.072,.09);
}
function playFinalGong(){
if(masterSoundVolume<=0)return;
const ctx=ensureGameAudio();if(!ctx)return;
try{
const now=ctx.currentTime;
const partials=[{f:220,v:.12,d:.72},{f:440,v:.075,d:.62},{f:660,v:.052,d:.52},{f:880,v:.035,d:.44}];
partials.forEach(({f,v,d},i)=>{
const osc=ctx.createOscillator(),gain=ctx.createGain();
osc.type=i%2?'triangle':'sine';
osc.frequency.setValueAtTime(f,now);
osc.frequency.exponentialRampToValueAtTime(Math.max(80,f*.94),now+d);
const peak=Math.min(AUDIO_GAIN_CAP,v*masterSoundVolume*AUDIO_GAIN_BOOST);
gain.gain.setValueAtTime(.0001,now);
gain.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),now+.008);
gain.gain.exponentialRampToValueAtTime(.0001,now+d);
osc.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+d+.03);
});
}catch(_){}
}
function maybeFinalGong(sec){
if(sec<=3&&sec>0&&sec!==lastGongSecond){lastGongSecond=sec;playFinalGong();}
if(sec>3)lastGongSecond=null;
}
function maybeHeartbeat(sec){
if(sec<=10&&sec>3&&sec!==lastHeartbeatSecond){
lastHeartbeatSecond=sec;playHeartbeat();
}
if(sec>10||sec<=3)lastHeartbeatSecond=null;
}
const FIREBASE_CONFIG={
apiKey:"AIzaSyAtWg9jvda8M8j8dA6F31BwoRG8IoCZWwo",
authDomain:"kelimedeneme-82f00.firebaseapp.com",
databaseURL:"https://kelimedeneme-82f00-default-rtdb.europe-west1.firebasedatabase.app",
projectId:"kelimedeneme-82f00",
storageBucket:"kelimedeneme-82f00.firebasestorage.app",
messagingSenderId:"968159872150",
appId:"1:968159872150:web:c80429010ec21363116eb7"
};
const MP_STATES=Object.freeze({
IDLE:'idle',WAITING:'waiting',COUNTDOWN:'countdown',PLAYING:'playing',FINISHED:'finished'
});
let mpState=MP_STATES.IDLE;
let mpDb=null,mpRoomRef=null,mpRoomCode=null,mpRole=null,mpRoomData=null,mpRoomMode='';
let mpRandomMatchSession=false;
let mpSessionJoinedAt=0,mpExitHandling=false,mpLastExitSignalId='';
let mpListener=null,mpWordsListener=null,mpScoresListener=null,mpServerOffset=0,mpEntered=false,mpStarted=false,mpClock=null;
let mpScoreSyncTimer=null,mpScoreSyncInFlight=false,mpScoreDesired=null,mpLastConfirmedOwnScore=null;
let mpWordScoreCommitted=null;
let mpControlListeners=[];
let mpStartBusy=false,mpRematchBusy=false,mpPresenceRef=null,mpLastRoomMetaSig='',mpEndResolveTimer=null,mpRematchExpiryTimer=null;
let mpSeenWordEvents=new Set(),mpLastBeepSecond=null,mpLastResultRenderSig='';
let mpOpponentDisconnectTimer=null,firebaseWasConnected=null,reconnectPresenceBusy=false;
const MP_DISCONNECT_GRACE_MS=5000;
const mpFoundWords={host:new Set(),guest:new Set()};
function setMpState(next){mpState=next;document.documentElement.dataset.mpState=next;}
let runtimeClientToken='';
function getClientToken(){
if(runtimeClientToken)return runtimeClientToken;
let t=safeStorageGet('local','kd_client_token');
if(!t){
const a=new Uint32Array(4);crypto.getRandomValues(a);
t=Array.from(a,n=>n.toString(36)).join('');
safeStorageSet('local','kd_client_token',t);
}
runtimeClientToken=t;
return t;
}
let firebaseNetworkOnline=false;
let serverOffsetListener=null;
let firebaseSdkPromise=null;
function loadExternalScriptOnce(src,id,timeoutMs=5000){
let existing=document.getElementById(id);
if(existing?.dataset.loaded==='1')return Promise.resolve(true);
if(existing?.dataset.failed==='1'){try{existing.remove();}catch(_){}existing=null;}
return new Promise((resolve,reject)=>{
const script=existing||document.createElement('script');
let done=false;
const finish=(ok,err)=>{
if(done)return;
done=true;
clearTimeout(timer);
script.onload=null;
script.onerror=null;
if(ok){script.dataset.loaded='1';delete script.dataset.failed;resolve(true);return;}
script.dataset.failed='1';
if(!existing){try{script.remove();}catch(_){}}
reject(err||new Error('firebase-script-load-failed'));
};
const timer=setTimeout(()=>finish(false,new Error('firebase-script-timeout')),timeoutMs);
script.onload=()=>finish(true);
script.onerror=()=>finish(false,new Error('firebase-script-load-failed'));
if(!existing){
script.id=id;script.src=src;script.async=true;
document.head.appendChild(script);
}
});
}
function ensureFirebaseSdkLoaded(){
if(window.firebase?.database)return Promise.resolve(true);
if(firebaseSdkPromise)return firebaseSdkPromise;
firebaseSdkPromise=(async()=>{
await loadExternalScriptOnce('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js','kapmaca-firebase-app');
await loadExternalScriptOnce('https://www.gstatic.com/firebasejs/10.14.1/firebase-database-compat.js','kapmaca-firebase-db');
return !!window.firebase?.database;
})().catch(err=>{
firebaseSdkPromise=null;
console.error('Firebase SDK yüklenemedi',err);
return false;
});
return firebaseSdkPromise;
}
let firebaseAuthSdkPromise=null;
function ensureFirebaseAuthLoaded(){
if(window.firebase?.auth&&window.firebase?.database)return Promise.resolve(true);
if(firebaseAuthSdkPromise)return firebaseAuthSdkPromise;
firebaseAuthSdkPromise=(async()=>{
await loadExternalScriptOnce('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js','kapmaca-firebase-app');
await Promise.all([
loadExternalScriptOnce('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js','kapmaca-firebase-auth'),
loadExternalScriptOnce('https://www.gstatic.com/firebasejs/10.14.1/firebase-database-compat.js','kapmaca-firebase-db')
]);
return !!window.firebase?.auth&&!!window.firebase?.database;
})().catch(err=>{
firebaseAuthSdkPromise=null;
console.error('Firebase Auth yüklenemedi',err);
return false;
});
return firebaseAuthSdkPromise;
}
function ensureFirebase(){
if(!window.firebase?.database){
showToast('Firebase yüklenemedi. İnternet bağlantını kontrol et.','rose');
return false;
}
if(!firebase.apps.length)firebase.initializeApp(FIREBASE_CONFIG);
if(!mpDb)mpDb=firebase.database();
if(!serverOffsetListener){
serverOffsetListener=snap=>{mpServerOffset=Number(snap.val()||0);};
mpDb.ref('.info/serverTimeOffset').on('value',serverOffsetListener);
}
if(!firebaseNetworkOnline){
try{mpDb.goOnline();}catch(_){}
firebaseNetworkOnline=true;
}
return true;
}
let mpConnectPromise=null;
function disconnectFirebaseNetwork(force=false){
if(accountAuth?.currentUser)return;
if(!mpDb)return;
if(!force&&(mpRoomRef||randomSearchActive))return;
if(serverOffsetListener){
try{mpDb.ref('.info/serverTimeOffset').off('value',serverOffsetListener);}catch(_){}
serverOffsetListener=null;
}
if(firebaseNetworkOnline||force){
try{mpDb.goOffline();}catch(_){}
}
firebaseNetworkOnline=false;
firebaseWasConnected=null;
reconnectPresenceBusy=false;
}
async function syncServerClock(){
if(!await ensureFirebaseSdkLoaded())return false;
if(!ensureFirebase())return false;
try{
const snap=await Promise.race([
mpDb.ref('.info/serverTimeOffset').once('value'),
new Promise((_,reject)=>setTimeout(()=>reject(new Error('clock-timeout')),1800))
]);
mpServerOffset=Number(snap.val()||0);
return true;
}catch(_){return false;}
}
async function waitFirebaseConnected(timeoutMs=8000){
if(mpConnectPromise)return mpConnectPromise;
mpConnectPromise=(async()=>{
if(!await ensureFirebaseSdkLoaded())return false;
if(!ensureFirebase())return false;
try{mpDb.goOnline();firebaseNetworkOnline=true;}catch(_){}
const connectedRef=mpDb.ref('.info/connected');
try{
const first=await Promise.race([
connectedRef.once('value'),
new Promise((_,reject)=>setTimeout(()=>reject(new Error('connected-first-timeout')),1800))
]);
if(first.val()===true){
await syncServerClock();
return true;
}
}catch(_){}
const connected=await new Promise(resolve=>{
let done=false,timer=null;
const finish=value=>{
if(done)return;
done=true;
if(timer)clearTimeout(timer);
try{connectedRef.off('value',listener);}catch(_){}
resolve(!!value);
};
const listener=snap=>{if(snap.val()===true)finish(true);};
connectedRef.on('value',listener);
timer=setTimeout(()=>finish(false),Math.max(2500,Number(timeoutMs)||8000));
});
if(!connected){
firebaseNetworkOnline=false;
return false;
}
await syncServerClock();
return true;
})().finally(()=>{mpConnectPromise=null;});
return mpConnectPromise;
}
function serverNow(){return Date.now()+mpServerOffset;}
function turkeyRoomDayInfo(ts=serverNow()){
const shifted=new Date(ts+3*60*60*1000);
const y=shifted.getUTCFullYear(),m=shifted.getUTCMonth(),d=shifted.getUTCDate();
const dayKey=String(y)+String(m+1).padStart(2,'0')+String(d).padStart(2,'0');
const expiresAt=Date.UTC(y,m,d+1,0,0,0)-3*60*60*1000;
return{dayKey,expiresAt};
}
function randomDailyRoomCode(){
const alphabet='abcdefghijklmnopqrstuvwxyz';
const bytes=new Uint8Array(5);crypto.getRandomValues(bytes);
let code='';
for(let i=0;i<5;i++)code+=alphabet[bytes[i]%26];
return code;
}
async function closeAndLockPrivateRoom(ref,code,reason='closed'){
if(!ref||!code)return;
try{await ref.remove();}catch(_){}
}
function stopInviteWaitCountdown(){
if(inviteWaitCountdownTimer){clearInterval(inviteWaitCountdownTimer);inviteWaitCountdownTimer=null;}
inviteWaitDeadlineAt=0;
const el=document.getElementById('invite-wait-countdown');if(el)el.textContent='60';
}
async function expirePrivateInviteRoom(){
if(mpRole!=='host'||!mpRoomRef||!mpRoomCode||!/^invite-only-/.test(String(mpRoomMode||''))) return;
try{
const[gsSnap,invSnap]=await Promise.all([mpRoomRef.child('gameState').once('value'),mpRoomRef.child('invite/guest').once('value')]);
const gs=gsSnap.val()||{},inv=invSnap.val()||{};
if(gs.status!=='waiting'||inv.guest==='accepted')return;
await requestSynchronizedRoomExit('invite-timeout');
}catch(_){
showRoomExitNotice('OYUN SONLANDIRILDI');
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
const el=document.getElementById('invite-wait-countdown');if(el)el.textContent=String(left);
if(left<=0){stopInviteWaitCountdown();expirePrivateInviteRoom();}
};
tick();inviteWaitCountdownTimer=setInterval(tick,1000);
}
async function createCleanRoomRecord({schema,mode,hostId,guestId=null,board,inviteGuest='pending'}){
if(!mpDb)throw new Error('firebase-not-ready');
const dayKey=turkeyRoomDayInfo().dayKey;
for(let attempt=0;attempt<18;attempt++){
const code=randomDailyRoomCode();
const ref=mpDb.ref('rooms/'+code);
const payload={
schema,
mode,
createdAt:serverNow(),
dayKey,
hostId,
gameState:{status:'waiting',board,startAt:0,round:1},
scores:{host:0,guest:0},
presence:{host:{online:false,clientId:hostId},guest:{online:false}},
ready:{host:false,guest:false},
invite:{guest:inviteGuest,expiresAt:0},
endReady:{host:false,guest:false},
rematch:{host:false,guest:false,expiresAt:0},
bonusApplied:false
};
if(guestId)payload.guestId=guestId;
const tx=await ref.transaction(current=>current===null?payload:undefined);
if(tx.committed)return{code,ref,dayKey};
}
throw new Error('room-reservation-failed');
}
function inviteUrl(code){
const publicCode=activeMemberRoomNo||code;
const u=new URL(location.href);u.searchParams.set('room',publicCode);u.searchParams.delete('join');u.searchParams.delete('as');u.hash='';return u.toString();
}
function setRoomUrl(code){
const publicCode=activeMemberRoomNo||code;
const u=new URL(location.href);u.searchParams.set('room',publicCode);u.searchParams.delete('join');u.searchParams.delete('as');u.hash='';history.replaceState(null,'',u.toString());
}
function clearInviteFromUrl(){
const u=new URL(location.href);['room','join','as'].forEach(k=>u.searchParams.delete(k));history.replaceState(null,'',u.toString());
}
function setPrivateInviteControlsReady(ready,code=''){
const copy=document.getElementById('btn-copy-link');
const share=document.getElementById('btn-share-link');
if(copy)copy.disabled=!ready;
if(share)share.disabled=!ready;
for(const el of[copy,share]){
if(!el)continue;
el.style.opacity=ready?'1':'.55';
el.style.cursor=ready?'pointer':'wait';
}
const c=document.getElementById('mp-room-code');
if(c)c.textContent=ready&&code?'https://kapmaca.tr/?room='+String(code).toLowerCase():'ODA HAZIRLANIYOR…';
}
function setMpPanelRoom(code){
document.getElementById('mp-create-view')?.classList.add('hidden');
document.getElementById('mp-room-view')?.classList.remove('hidden');
setPrivateInviteControlsReady(true,String(code||mpRoomCode||''));
}
async function markPresence(){
if(!mpRoomRef||!mpRole)return;
mpPresenceRef=mpRoomRef.child('presence/'+mpRole);
const payload={online:true,clientId:getClientToken(),at:firebase.database.ServerValue.TIMESTAMP};
await mpPresenceRef.set(payload);
mpPresenceRef.onDisconnect().set({online:false,clientId:getClientToken(),at:firebase.database.ServerValue.TIMESTAMP});
}
function isOnline(p){return !!(p&&(p===true||p.online===true));}
function clearOpponentDisconnectGrace(){
if(mpOpponentDisconnectTimer){clearTimeout(mpOpponentDisconnectTimer);mpOpponentDisconnectTimer=null;}
}
function handleOpponentPresenceState(online){
if(online){clearOpponentDisconnectGrace();return;}
if(mpOpponentDisconnectTimer||mpExitHandling||!mpRoomRef||!mpRole)return;
if(!['countdown','playing'].includes(String(mpRoomData?.status||'')))return;
const ref=mpRoomRef;
const opponentRole=mpRole==='host'?'guest':'host';
mpOpponentDisconnectTimer=setTimeout(async()=>{
mpOpponentDisconnectTimer=null;
if(ref!==mpRoomRef||mpExitHandling||!mpRole)return;
try{
const[presenceSnap,gameSnap]=await Promise.all([
ref.child('presence/'+opponentRole).once('value'),
ref.child('gameState').once('value')
]);
const gs=gameSnap.val()||{};
if(!isOnline(presenceSnap.val())&&['countdown','playing'].includes(String(gs.status||''))){
await requestSynchronizedRoomExit('opponent-disconnected');
}
}catch(_){}
},MP_DISCONNECT_GRACE_MS);
}
let randomPoolRef=null,randomOwnEntryRef=null,randomOwnListener=null;
let randomSearchActive=false,randomSearchTicket=null,randomWaitCancel=null;
let randomResultAutoExitTimer=null,randomResultAutoExitKey='';
let inviteWaitCountdownTimer=null;
let inviteWaitDeadlineAt=0;
const RANDOM_SEARCH_MS=45000;
const RANDOM_QUEUE_TTL=RANDOM_SEARCH_MS+5000;
let randomPairRoomBusy=false,randomJoinBusy=false;
function setRandomStatus(text,visible=true){
const el=document.getElementById('mp-random-status');
if(!el)return;
el.textContent=text||'';
el.classList.toggle('hidden',!visible);
}
function randomTicket(){
const a=new Uint32Array(3);crypto.getRandomValues(a);
return Array.from(a,n=>n.toString(36)).join('');
}
function restoreHodriMeydanButton(){
const btn=document.getElementById('btn-random-match');
if(!btn)return;
btn.disabled=false;
btn.innerHTML='<span class="text-[88px] leading-none drop-shadow-md" aria-hidden="true">🎲</span><span class="text-[14px] leading-tight">HODRİ MEYDAN!</span><span class="text-[10.5px] leading-snug font-bold text-amber-950">Sürpriz bir oyuncuyla kapış!</span>';
}
function releaseRandomSearchLocal(){
if(randomWaitCancel){const cancel=randomWaitCancel;randomWaitCancel=null;try{cancel();}catch(_){}}
if(randomOwnEntryRef&&randomOwnListener){try{randomOwnEntryRef.off('value',randomOwnListener);}catch(_){}}
randomOwnListener=null;
randomOwnEntryRef=null;
randomPoolRef=null;
randomSearchActive=false;
randomSearchTicket=null;
randomPairRoomBusy=false;
randomJoinBusy=false;
}
async function removeRefWithRetry(ref,attempts=3,delayMs=180){
if(!ref)return true;
for(let attempt=1;attempt<=attempts;attempt++){
try{
await ref.remove();
return true;
}catch(err){
if(attempt>=attempts){console.warn('Firebase remove failed after retries',err);return false;}
await new Promise(r=>setTimeout(r,delayMs*attempt));
}
}
return false;
}
async function cleanupRandomQueue(){
const poolRef=randomPoolRef;
const ownRef=randomOwnEntryRef;
if(randomWaitCancel){
const cancel=randomWaitCancel;
randomWaitCancel=null;
try{cancel();}catch(_){}
}
if(poolRef&&randomOwnListener){
try{poolRef.off('value',randomOwnListener);}catch(_){}
}
randomOwnListener=null;
if(ownRef){
try{await ownRef.onDisconnect().cancel();}catch(_){}
await removeRefWithRetry(ownRef,3,140);
}
releaseRandomSearchLocal();
restoreHodriMeydanButton();
}
async function cleanupRandomRoomBeforeReset(ref,role,reason='random-exit'){
if(!ref)return;
const signal={id:`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`,at:serverNow(),by:role||'player',reason};
if(mpPresenceRef){
try{await mpPresenceRef.set({online:false,clientId:getClientToken(),at:firebase.database.ServerValue.TIMESTAMP});}catch(_){}
}
try{await ref.child('roomExit').set(signal);}catch(_){}
await removeRefWithRetry(ref,3,160);
}
async function createRandomMatchedRoom(hostId,guestId){
await ensureWordDataLoaded();
const readyBoard=prewarmedBoard||generateOptimizedBoard(3);
prewarmedBoard=null;
rememberBoard(readyBoard.board,readyBoard.words);
const created=await createCleanRoomRecord({
schema:22,
mode:'random-match-timepool-v1',
hostId,
guestId,
board:readyBoard.board,
inviteGuest:'accepted'
});
return created.code;
}
function waitForTimedPoolMatch(ticket,deadline,wordDataLoad){
return new Promise(resolve=>{
let done=false;
let timer=null;
const finish=ok=>{
if(done)return;
done=true;
if(timer)clearTimeout(timer);
if(randomPoolRef&&randomOwnListener){
try{randomPoolRef.off('value',randomOwnListener);}catch(_){}
}
randomOwnListener=null;
if(randomWaitCancel===cancel)randomWaitCancel=null;
resolve(ok);
};
const cancel=()=>finish(false);
randomWaitCancel=cancel;
randomOwnListener=async snap=>{
if(done||!randomSearchActive||randomSearchTicket!==ticket)return;
const now=serverNow();
const raw=snap.val()||{};
const entries=Object.entries(raw)
.map(([key,value])=>({ticket:key,...(value||{})}))
.filter(e=>Number(e.enteredAt||0)>0&&Number(e.enteredAt||0)+RANDOM_QUEUE_TTL>now)
.sort((a,b)=>{
const dt=Number(a.enteredAt||0)-Number(b.enteredAt||0);
return dt||String(a.ticket).localeCompare(String(b.ticket));
});
const idx=entries.findIndex(e=>e.ticket===ticket);
if(idx<0)return;
const mateIndex=(idx%2===0)?idx+1:idx-1;
if(mateIndex<0||mateIndex>=entries.length){
setRandomStatus('Rakip bekleniyor… Sıra: '+(idx+1),true);
return;
}
const host=entries[Math.min(idx,mateIndex)];
const guest=entries[Math.max(idx,mateIndex)];
const role=(ticket===host.ticket)?'host':'guest';
const mine=entries[idx];
const roleLabel=role==='host'?'1. oyuncu (HOST)':'2. oyuncu (GUEST)';
if(mine.roomCode){
setRandomStatus('Rakip bulundu ✓ '+roleLabel+' ✓ Senkronize ediliyor…',true);
if(randomJoinBusy)return;
randomJoinBusy=true;
try{await wordDataLoad;}catch(_){}
const ok=await joinRoom(String(mine.roomCode));
if(ok){
try{await randomOwnEntryRef?.onDisconnect().cancel();}catch(_){}
try{await randomOwnEntryRef?.remove();}catch(_){}
restoreHodriMeydanButton();
finish(true);
return;
}
randomJoinBusy=false;
return;
}
setRandomStatus('Rakip bulundu ✓ '+roleLabel+' ✓ Oda hazırlanıyor…',true);
if(!randomPairRoomBusy){
randomPairRoomBusy=true;
try{
await wordDataLoad;
const room=await createRandomMatchedRoom(host.clientId,guest.clientId);
if(!randomSearchActive||randomSearchTicket!==ticket){
await removeRefWithRetry(mpDb.ref('rooms/'+room),2,120);
return finish(false);
}
const roomCodeRef=randomPoolRef.child(host.ticket+'/roomCode');
const claim=await roomCodeRef.transaction(current=>{
if(current)return;
return room;
});
let winningRoom=room;
if(!claim.committed){
try{
winningRoom=String((await roomCodeRef.once('value')).val()||'');
}catch(_){winningRoom='';}
if(winningRoom&&winningRoom!==room){
await removeRefWithRetry(mpDb.ref('rooms/'+room),2,120);
}
}
if(!winningRoom){
randomPairRoomBusy=false;
setRandomStatus('Eşleşme yeniden deneniyor…',true);
return;
}
const updates={};
updates[host.ticket+'/roomCode']=winningRoom;
updates[guest.ticket+'/roomCode']=winningRoom;
updates[host.ticket+'/role']='host';
updates[guest.ticket+'/role']='guest';
await randomPoolRef.update(updates);
}catch(err){
console.error('Hodri room create error',err);
randomPairRoomBusy=false;
setRandomStatus('Eşleşme yeniden deneniyor…',true);
}
}
};
randomPoolRef.on('value',randomOwnListener);
timer=setTimeout(()=>finish(false),Math.max(1,deadline-serverNow()));
});
}
async function searchRandomOpponent(){
if(randomSearchActive)return;
const btn=document.getElementById('btn-random-match');
if(btn){btn.disabled=true;btn.textContent='RAKİP ARANIYOR…';}
setRandomStatus('Sunucuya bağlanılıyor…',true);
const wordDataLoad=ensureWordDataLoaded();
if(!await waitFirebaseConnected(8000)){
restoreHodriMeydanButton();
setRandomStatus('Sunucuya bağlanılamadı. Tekrar deneyin.',true);
showToast('Sunucuya bağlanılamadı.','rose');
disconnectFirebaseNetwork(true);
return;
}
randomSearchActive=true;
randomPairRoomBusy=false;
randomJoinBusy=false;
randomPoolRef=mpDb.ref('matchmaking/randomPool');
const ticket=randomTicket();
randomSearchTicket=ticket;
randomOwnEntryRef=randomPoolRef.child(ticket);
try{
await randomOwnEntryRef.set({
ticket,
clientId:getClientToken(),
enteredAt:firebase.database.ServerValue.TIMESTAMP
});
await randomOwnEntryRef.onDisconnect().remove();
}catch(err){
console.error('Hodri pool entry error',err);
releaseRandomSearchLocal();
restoreHodriMeydanButton();
setRandomStatus('Havuza bağlanılamadı. Tekrar deneyin.',true);
disconnectFirebaseNetwork(true);
return;
}
let enteredAt=serverNow();
try{
const ownSnap=await randomOwnEntryRef.once('value');
enteredAt=Number(ownSnap.val()?.enteredAt||enteredAt);
}catch(_){}
const deadline=enteredAt+RANDOM_SEARCH_MS;
setRandomStatus('Rakip bekleniyor… Sıra: 1',true);
const matched=await waitForTimedPoolMatch(ticket,deadline,wordDataLoad);
if(matched){
releaseRandomSearchLocal();
return;
}
if(randomSearchTicket===ticket)await cleanupRandomQueue();
if(!mpRoomRef){
setRandomStatus('45 saniye içinde rakip bulunamadı.',true);
showToast('Rakip bulunamadı. Tekrar deneyebilirsin.','slate');
setTimeout(()=>setRandomStatus('',false),1800);
disconnectFirebaseNetwork(true);
}
}
let privateRoomCreateBusy=false;
function setPrivateRoomProgress(text){
const c=document.getElementById('mp-room-code');
if(c)c.textContent=String(text||'ODA HAZIRLANIYOR…');
}
async function createRoom(){
if(privateRoomCreateBusy)return false;
privateRoomCreateBusy=true;
const wordDataLoad=ensureWordDataLoaded();
try{
setPrivateRoomProgress('SUNUCUYA BAĞLANILIYOR…');
if(!await waitFirebaseConnected(8000)){
setPrivateRoomProgress('SUNUCUYA BAĞLANILAMADI — TEKRAR DENE');
showToast('Sunucuya bağlanılamadı.','rose');
disconnectFirebaseNetwork(true);
return false;
}
setPrivateRoomProgress('TAHTA HAZIRLANIYOR…');
try{await wordDataLoad;}catch(err){
console.error('Private word data error',err);
setPrivateRoomProgress('SÖZLÜK YÜKLENEMEDİ — TEKRAR DENE');
showToast('Oyun sözlüğü yüklenemedi.','rose');
return false;
}
const readyBoard=prewarmedBoard||generateOptimizedBoard(3);
prewarmedBoard=null;
rememberBoard(readyBoard.board,readyBoard.words);
setPrivateRoomProgress('ODA OLUŞTURULUYOR…');
const created=await createCleanRoomRecord({
schema:21,
mode:'invite-only-clean-v1',
hostId:getClientToken(),
board:readyBoard.board,
inviteGuest:'pending'
});
mpRoomCode=created.code;
mpRole='host';
mpRoomRef=created.ref;
mpRoomMode='invite-only-clean-v1';
mpRandomMatchSession=false;
delete document.body.dataset.randomMatchActive;
document.body.dataset.privateFriendActive='1';
mpRoomData=null;
mpEntered=false;
mpStarted=false;
mpSessionJoinedAt=serverNow();
mpExitHandling=false;
mpLastExitSignalId='';
setRoomUrl(mpRoomCode);
await markPresence();
setMpPanelRoom(mpRoomCode);
document.getElementById('btn-close-room')?.classList.remove('hidden');
setMpState(MP_STATES.WAITING);
attachRoomListener();
return true;
}catch(err){
console.error('Clean private room create error',err);
setPrivateRoomProgress('ODA OLUŞTURULAMADI — TEKRAR DENE');
showToast('Oda oluşturulamadı. Tekrar dene.','rose');
return false;
}finally{
privateRoomCreateBusy=false;
}
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
if(codeEl)codeEl.textContent=String(mpRoomCode||'').toUpperCase();
if(startBtn){startBtn.disabled=false;startBtn.classList.remove('hidden');}
if(cancelBtn){cancelBtn.disabled=false;cancelBtn.classList.remove('hidden');}
modal?.classList.remove('hidden');
stopInviteDecisionTimer();
const existingDeadline=Number(mpRoomData?.inviteExpiresAt||0);
const deadline=existingDeadline>serverNow()?existingDeadline:serverNow()+60000;
if(mpRole==='guest'&&mpRoomRef&&/^invite-only-/.test(String(mpRoomMode||'')) && !existingDeadline){
mpRoomRef.child('invite/expiresAt').set(deadline).catch(()=>{});
}
const tick=()=>{
const left=Math.max(0,Math.ceil((deadline-serverNow())/1000));
if(countdownEl)countdownEl.textContent=`${left} saniye içinde seçim yapın`;
if(left<=0){
stopInviteDecisionTimer();
if(mpRole==='guest'&&mpRoomRef)requestSynchronizedRoomExit('invite-timeout').catch(()=>{});
}
};
tick();
inviteDecisionTimer=setInterval(tick,500);
}
function showInactiveRoomAndReturn(){
clearInviteFromUrl();
document.getElementById('inactive-room-toast')?.classList.add('hidden');
document.getElementById('modal-room-invite')?.classList.add('hidden');
document.getElementById('screen-game')?.classList.add('hidden');
document.getElementById('screen-home')?.classList.remove('hidden');
returnToHomeFromMultiplayer();
}
async function joinRoom(code){
code=String(code||'').toLowerCase().replace(/[^a-z]/g,'').slice(0,5);
if(!/^[a-z]{5}$/.test(code)) return false;
if(!await waitFirebaseConnected(8000)){
showToast('Sunucuya bağlanılamadı.','rose');
return false;
}
const ref=mpDb.ref('rooms/'+code);
let snap;
try{snap=await ref.once('value');}catch(_){return false;}
if(!snap.exists()){
showInactiveRoomAndReturn();
return false;
}
const d=snap.val()||{};
const mode=String(d.mode||'');
const clientId=getClientToken();
const gs0=d.gameState||{};
if(/^invite-only-/.test(mode) && Number(d.invite?.expiresAt||0)>0 && Number(d.invite.expiresAt)<=serverNow() && gs0.status==='waiting'){
try{await ref.remove();}catch(_){}
showInactiveRoomAndReturn();
return false;
}
let role=null;
if(/^random-match-/.test(mode)){
if(d.hostId===clientId)role='host';
else if(d.guestId===clientId)role='guest';
else return false;
}else if(/^invite-only-/.test(mode)){
if(d.hostId===clientId){
role='host';
}else{
const claim=await ref.child('guestId').transaction(current=>{
if(current===null||current===clientId)return clientId;
return;
});
if(!claim.committed){
showToast('Bu davet odasında zaten 2 oyuncu var.','rose');
return false;
}
role='guest';
d.guestId=clientId;
}
}else{
return false;
}
mpRoomCode=code;
mpRole=role;
mpRoomRef=ref;
mpRoomMode=mode;
mpRandomMatchSession=/^random-match-/.test(mode);
if(mpRandomMatchSession){
document.body.dataset.randomMatchActive='1';
delete document.body.dataset.privateFriendActive;
}else{
delete document.body.dataset.randomMatchActive;
document.body.dataset.privateFriendActive='1';
}
const[gameSnap,scoreSnap,inviteSnap]=await Promise.all([
ref.child('gameState').once('value'),
ref.child('scores').once('value'),
ref.child('invite').once('value')
]);
const game=gameSnap.val()||{};
const invite=inviteSnap.val()||{};
mpRoomData={
...game,
scores:scoreSnap.val()||{host:0,guest:0},
guestId:d.guestId||null,
inviteGuest:invite.guest||null,
inviteExpiresAt:Number(invite.expiresAt||0)
};
mpSessionJoinedAt=serverNow();
mpExitHandling=false;
mpLastExitSignalId='';
mpEntered=false;
mpStarted=false;
await markPresence();
setRoomUrl(code);
setMpState(mpRoomData.status||MP_STATES.WAITING);
attachRoomListener();
if(role==='host' && /^invite-only-/.test(mode)){
setMpPanelRoom(code);
document.getElementById('btn-close-room')?.classList.remove('hidden');
}
if(role==='guest' && /^invite-only-/.test(mode) && mpRoomData.status==='waiting'){
showInviteDecisionModal();
setTimeout(()=>ensureWordDataLoaded().catch(()=>{}),0);
}
if(/^random-match-/.test(mode)){
await enterMultiplayerRoom();
await hostStartWaitingRound();
}
return true;
}
async function enterMultiplayerRoom(){
if(!mpRoomRef)return;
try{await ensureWordDataLoaded();}
catch(_){showToast('Oyun sözlüğü yüklenemedi. Tekrar deneyin.','rose');return;}
activeGameMode='multi';
const[gsSnap,scoreSnap,wordsSnap]=await Promise.all([mpRoomRef.child('gameState').once('value'),mpRoomRef.child('scores').once('value'),mpRoomRef.child('words').once('value')]);
const d={...(gsSnap.val()||{}),scores:scoreSnap.val()||{host:0,guest:0},words:wordsSnap.val()||{}};if(!d||!d.board)return;
const prevRound=Number(mpRoomData?.round||0);
const prevBoardSig=Array.isArray(gridBoard)&&gridBoard.length===BOARD_SIZE?boardSignature(gridBoard):'';
mpRoomData={...(mpRoomData||{}),...d};
const incomingBoardSig=Array.isArray(d.board)?boardSignature(d.board):'';
const mustRefreshBoard=!mpEntered||Number(d.round||1)!==prevRound||(incomingBoardSig&&incomingBoardSig!==prevBoardSig);
if(mustRefreshBoard){
mpEntered=true;mpStarted=false;
document.getElementById('screen-home')?.classList.add('hidden');
document.getElementById('friend-invite-panel')?.classList.add('hidden');
document.getElementById('screen-game')?.classList.remove('hidden');
document.getElementById('p1-title').textContent='1. OYUNCU';
document.getElementById('p2-title').textContent='2. OYUNCU';
resetMultiplayerRoundVisualState();
p1Score=Number(d.scores?.host||0);p2Score=Number(d.scores?.guest||0);updateScores();
if(!renderProvidedBoard(d.board))return;
const liveGrid=document.getElementById('scrabble-grid');
if(liveGrid){
liveGrid.style.filter='';
liveGrid.style.opacity='';
liveGrid.style.pointerEvents='none';
}
hydrateMultiplayerBoardState(d);
try{if(mpRoomRef&&mpRole)await mpRoomRef.child('ready/'+mpRole).set(true);}catch(_){}
}
if(d.status==='countdown'&&d.startAt&&!mpStarted)startSyncedMatch(d);
else if(d.status==='playing'&&d.startAt)activateMultiplayerPlaying(d);
}
async function hostStartWaitingRound(){
if(!mpRole||mpStartBusy||!mpRoomRef)return;
mpStartBusy=true;
try{
const[guestSnap,readySnap]=await Promise.all([
mpRoomRef.child('guestId').once('value'),
mpRoomRef.child('ready').once('value')
]);
const ready=readySnap.val()||{};
if(!guestSnap.val()||!ready.host||!ready.guest)return;
await mpRoomRef.child('gameState').transaction(gs=>{
if(!gs||gs.status!=='waiting'||Number(gs.startAt||0)>0)return;
gs.status='countdown';gs.startAt=serverNow()+3200;
return gs;
});
}finally{mpStartBusy=false;}
}
async function hostPrepareNextRound(){
if(mpRole!=='host'||!mpRoomRef)return null;
try{
const[gsSnap,pendingSnap]=await Promise.all([
mpRoomRef.child('gameState').once('value'),
mpRoomRef.child('pendingRound').once('value')
]);
const gs=gsSnap.val()||{};
if(gs.status!=='finished')return null;
const nextRound=Number(gs.round||1)+1;
const existing=pendingSnap.val();
if(existing&&Number(existing.round||0)===nextRound&&Array.isArray(existing.board)&&existing.board.length===9)return existing;
const ready=takeDistinctNextBoard(gs.board,5);
const pending={board:ready.board,round:nextRound,preparedAt:serverNow()};
rememberBoard(pending.board,ready.words);
await mpRoomRef.child('pendingRound').set(pending);
scheduleBoardPrewarm();
return pending;
}catch(e){console.error('Next round prepare error',e);return null;}
}
async function hostStartRematch(){
if(mpRole!=='host'||mpRematchBusy||!mpRoomRef)return;
mpRematchBusy=true;
try{
const now=serverNow();
const[gsSnap,rSnap,pSnap,exitSnap]=await Promise.all([
mpRoomRef.child('gameState').once('value'),
mpRoomRef.child('rematch').once('value'),
mpRoomRef.child('pendingRound').once('value'),
mpRoomRef.child('roomExit').once('value')
]);
const gs=gsSnap.val()||{},r=rSnap.val()||{},exitSignal=exitSnap.val();
if(exitSignal?.id&&Number(exitSignal.at||0)>=mpSessionJoinedAt-1000)return;
const requestIsCurrentRound=Number(r.round||0)===Number(gs.round||1)&&(!!r.host||!!r.guest);
if(gs.status!=='finished'||!requestIsCurrentRound)return;
const nextRound=Number(gs.round||1)+1;
let pending=pSnap.val();
if(!pending||Number(pending.round||0)!==nextRound||!Array.isArray(pending.board)||pending.board.length!==9){
pending=await hostPrepareNextRound();
}
if(!pending||!Array.isArray(pending.board)||pending.board.length!==9)throw new Error('pending-round-missing');
mpStarted=false;mpEntered=false;isMatchActive=false;
clearInterval(timerInterval);timerInterval=null;
resetMultiplayerRoundVisualState();
if(mpRematchExpiryTimer){clearTimeout(mpRematchExpiryTimer);mpRematchExpiryTimer=null;}
rememberBoard(pending.board,[]);
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
if(!isPrivateFriendRoom())return;
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
exitBtn.className='w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 active:scale-[0.97] text-white font-black text-xs py-3 rounded-2xl uppercase shadow-lg transition';
exitBtn.textContent='ÇIKIŞ';
}
if(inline){inline.classList.add('hidden');inline.textContent='';}
}
function renderRematchState(d){
if(!mpRole||d?.status!=='finished'||isRandomHumanRoom())return;
const r=d.rematch||{};
const requested=!!r.host||!!r.guest;
const btn=document.getElementById('btn-play-again');
const st=document.getElementById('rematch-inline-status');
if(!btn||!st)return;
if(requested){
btn.disabled=true;btn.textContent='YENİ OYUN HAZIRLANIYOR…';btn.classList.remove('rematch-pulse');
st.classList.remove('hidden');st.textContent='Yeni oyun başlıyor…';
}else{
btn.disabled=false;btn.textContent='YENİDEN OYNA';btn.classList.add('rematch-pulse');
st.classList.add('hidden');st.textContent='';
}
}
async function hostApplyLongestWordBonus(){
if(mpRole!=='host'||!mpRoomRef)return;
const[gsSnap,bonusSnap,wordsSnap,scoresSnap]=await Promise.all([
mpRoomRef.child('gameState').once('value'),mpRoomRef.child('bonusApplied').once('value'),mpRoomRef.child('words').once('value'),mpRoomRef.child('scores').once('value')]);
const gs=gsSnap.val()||{};if(gs.status!=='playing'||bonusSnap.val())return;
const vals=Object.values(wordsSnap.val()||{}).filter(x=>x&&x.word);
let maxLen=0;vals.forEach(x=>{maxLen=Math.max(maxLen,String(x.word).length);});
let hostGets=false,guestGets=false;
if(maxLen>0)vals.forEach(x=>{if(String(x.word).length===maxLen){if(x.role==='host')hostGets=true;if(x.role==='guest')guestGets=true;}});
const sc=scoresSnap.val()||{host:0,guest:0};
if(hostGets)sc.host=Number(sc.host||0)+10;
if(guestGets)sc.guest=Number(sc.guest||0)+10;
await mpRoomRef.update({scores:sc,longestBonus:{maxLen,host:hostGets,guest:guestGets},bonusApplied:true});
}
async function hostResolveMatchEnd(){
if(mpRole!=='host'||!mpRoomRef)return;
await waitForBothEndReady(1400);
await hostApplyLongestWordBonus();
const[gsSnap,scoreSnap]=await Promise.all([mpRoomRef.child('gameState').once('value'),mpRoomRef.child('scores').once('value')]);
const gameState=gsSnap.val()||{};if(gameState.status!=='playing')return;
const sc=scoreSnap.val()||{host:0,guest:0};const hs=Number(sc.host||0),guestScore=Number(sc.guest||0);
const randomRoom=isRandomHumanRoom();
await mpRoomRef.update({'finalWinner':hs===guestScore?'tie':(hs>guestScore?'host':'guest'),'gameState/status':'finished','gameState/startAt':0,'rematch':{host:false,guest:false,expiresAt:0,round:Number(gameState.round||1)},'pendingRound':null});
if(!randomRoom)hostPrepareNextRound().catch(()=>{});
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
if(!card)return;
card.classList.add('victory-card');
if(side==='p2')card.classList.add('victory-sky');
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
if(!el)return;
el.style.display=visible?'block':'none';
if(visible)el.textContent='5 SANİYE İÇİNDE ANA SAYFAYA DÖNÜLECEK';
}
function armRandomResultAutoExit(d){
if(!d||!isRandomHumanRoom())return false;
const finalWinner=String(d.finalWinner||'');
if(!['host','guest','tie'].includes(finalWinner))return false;
const autoKey=`${mpRoomCode||''}|${Number(d.round||1)}`;
showRandomResultExitButton();
const inline=document.getElementById('rematch-inline-status');
if(inline){inline.classList.add('hidden');inline.textContent='';}
setRandomAutoExitNotice(true);
if(randomResultAutoExitTimer&&randomResultAutoExitKey===autoKey)return true;
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
if(!d||d.status!=='finished')return;
const finalWinner=String(d.finalWinner||'');
if(!['host','guest','tie'].includes(finalWinner))return;
if(isPrivateFriendRoom())forcePrivateResultActions();
const resultSig=[Number(d.round||1),finalWinner,Number(d.scores?.host||0),Number(d.scores?.guest||0),Number(d.longestBonus?.maxLen||0)].join('|');
if(resultSig===mpLastResultRenderSig)return;
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
[p1NameEl,p2NameEl,p1ScoreEl,p2ScoreEl].forEach(el=>el?.classList.remove('winner-pulse','winner-name-big','winner-score-big'));const p1AvatarEl=document.getElementById('final-p1-avatar'),p2AvatarEl=document.getElementById('final-p2-avatar');[p1AvatarEl,p2AvatarEl].forEach(el=>el?.classList.remove('winner-avatar-big'));
const c1=document.getElementById('final-p1-card'),c2=document.getElementById('final-p2-card');[c1,c2].forEach(c=>{if(c){c.classList.remove('kd-winner-glow');c.style.transform='';c.style.filter='';c.style.background='';c.style.borderRadius='';c.style.padding='';}});
if(d.finalWinner==='host'){if(c1){c1.style.background='rgba(254,243,199,.9)';c1.style.borderRadius='16px';c1.style.padding='8px';}if(c2)c2.style.filter='saturate(.7) opacity(.82)';setGameoverOutcome(mpRole==='host');p1ScoreEl?.classList.add('winner-score-big');emphasizeWinner('p1');}
else if(d.finalWinner==='guest'){if(c2){c2.style.background='rgba(224,242,254,.92)';c2.style.borderRadius='16px';c2.style.padding='8px';}if(c1)c1.style.filter='saturate(.7) opacity(.82)';setGameoverOutcome(mpRole==='guest');p2ScoreEl?.classList.add('winner-score-big');emphasizeWinner('p2');}
else{setGameoverOutcome(null);}
const replay=document.getElementById('btn-play-again');
const exitBtn=document.getElementById('btn-game-exit');
const inline=document.getElementById('rematch-inline-status');
const actions=document.getElementById('gameover-actions');
const randomResultSession=isRandomHumanRoom();
if(randomResultSession){
armRandomResultAutoExit(d);
}else{
setRandomAutoExitNotice(false);
forcePrivateResultActions();
renderRematchState(d);
}
}
function attachRoomListener(){
if(!mpRoomRef)return;
detachMultiplayerListeners();
mpLastRoomMetaSig='';
const bindControl=(path,event,handler)=>{
const ref=mpRoomRef.child(path);ref.on(event,handler);mpControlListeners.push({ref,event,handler});
};
mpListener=async snap=>{
const gs=snap.val();
const previousRound=Number(mpRoomData?.round||0);
if(!gs){
if(mpRole&&!mpExitHandling){
const silentRandomFinish=isRandomHumanRoom()&&mpState===MP_STATES.FINISHED;
if(!silentRandomFinish)showToast('Oda kapatıldı.','rose');
returnToHomeFromMultiplayer();
}
return;
}
mpRoomData={...(mpRoomData||{}),...gs};
if(!['countdown','playing'].includes(String(gs.status||'')))clearOpponentDisconnectGrace();
const roomBoardSig=Array.isArray(gs.board)?boardSignature(gs.board):'';
const metaSig=[gs.status,Number(gs.startAt||0),Number(gs.round||1),roomBoardSig,mpRoomData.guestId||'',!!mpRoomData.guestOnline,mpRoomData.inviteGuest||'',!!mpRoomData.rematch?.host,!!mpRoomData.rematch?.guest,Number(mpRoomData.rematch?.expiresAt||0),mpRoomData.finalWinner||''].join('|');
if(metaSig===mpLastRoomMetaSig)return;
mpLastRoomMetaSig=metaSig;
if(gs.status==='waiting'){
setMpState(MP_STATES.WAITING);
const randomRoom=/^random-match-/.test(String(mpRoomMode||''));
const inviteAccepted=randomRoom||mpRoomData.inviteGuest==='accepted';
if(randomRoom){
document.getElementById('modal-mp-waiting')?.classList.add('hidden');
if(!mpEntered)await enterMultiplayerRoom();
await hostStartWaitingRound();
}else if(mpRole==='host'){
if(!mpRoomData.guestId||!mpRoomData.guestOnline||!inviteAccepted){
if(mpEntered)document.getElementById('modal-mp-waiting')?.classList.remove('hidden');
else document.getElementById('modal-mp-waiting')?.classList.add('hidden');
}else{
stopInviteWaitCountdown();
document.getElementById('modal-mp-waiting')?.classList.add('hidden');
if(!mpEntered)await enterMultiplayerRoom();
await hostStartWaitingRound();
}
}
}
if(gs.status==='countdown'){
setMpState(MP_STATES.COUNTDOWN);document.getElementById('modal-mp-waiting')?.classList.add('hidden');
document.getElementById('modal-gameover')?.classList.add('hidden');
document.getElementById('modal-rematch-waiting')?.classList.add('hidden');
const localSig=Array.isArray(gridBoard)&&gridBoard.length?boardSignature(gridBoard):'';
const isNewRound=Number(gs.round||1)>previousRound;
if(isNewRound||(roomBoardSig&&localSig!==roomBoardSig)){
mpEntered=false;mpStarted=false;clearInterval(timerInterval);timerInterval=null;isMatchActive=false;
resetMultiplayerRoundVisualState();
if(Array.isArray(gs.board)&&gs.board.length===BOARD_SIZE)renderProvidedBoard(gs.board);
}
if(!mpEntered)await enterMultiplayerRoom();
if(gs.startAt&&!mpStarted)startSyncedMatch(gs);
}
if(gs.status==='playing'){if(!mpEntered)await enterMultiplayerRoom();activateMultiplayerPlaying(gs);}
if(gs.status==='finished'){
setMpState(MP_STATES.FINISHED);document.getElementById('modal-rematch-waiting')?.classList.add('hidden');
const d={...(mpRoomData||{}),...gs};
if(isRandomHumanRoom()){
showRandomResultExitButton();
showMultiplayerSeriesResult(d);
}else{
forcePrivateResultActions();
const rematchRequested=Number(d.rematch?.round||0)===Number(gs.round||1)&&(!!d.rematch?.host||!!d.rematch?.guest);
if(rematchRequested)showImmediateRematchSync();
else showMultiplayerSeriesResult(d);
}
}
};
mpRoomRef.child('gameState').on('value',mpListener);
bindControl('guestId','value',snap=>{mpRoomData={...(mpRoomData||{}),guestId:snap.val()||null};if(mpRoomData.status==='waiting'&&mpListener)mpRoomRef.child('gameState').once('value').then(mpListener);});
bindControl('presence/guest','value',snap=>{const v=snap.val()||{};const online=isOnline(v);mpRoomData={...(mpRoomData||{}),guestOnline:online};if(mpRole==='host')handleOpponentPresenceState(online);if(mpRoomData.status==='waiting'&&mpListener)mpRoomRef.child('gameState').once('value').then(mpListener);});
bindControl('presence/host','value',snap=>{const v=snap.val()||{};const online=isOnline(v);mpRoomData={...(mpRoomData||{}),hostOnline:online};if(mpRole==='guest')handleOpponentPresenceState(online);});
bindControl('invite/guest','value',snap=>{mpRoomData={...(mpRoomData||{}),inviteGuest:snap.val()||null};if(mpRoomData.status==='waiting'&&mpListener)mpRoomRef.child('gameState').once('value').then(mpListener);});
bindControl('ready','value',snap=>{
mpRoomData={...(mpRoomData||{}),ready:snap.val()||{}};
if(mpRoomData.status==='waiting'&&isRandomHumanRoom()){
hostStartWaitingRound().catch(()=>{});
}
if(mpRoomData.status==='waiting'&&mpListener){
mpRoomRef.child('gameState').once('value').then(mpListener);
}
});
bindControl('rematch','value',snap=>{const r=snap.val()||{};mpRoomData={...(mpRoomData||{}),rematch:r};if(mpRoomData.status==='finished'&&!isRandomHumanRoom()){const d={...mpRoomData,status:'finished'};forcePrivateResultActions();renderRematchState(d);const currentRoundRequest=Number(r.round||0)===Number(mpRoomData.round||1)&&(!!r.host||!!r.guest);if(currentRoundRequest){showImmediateRematchSync();if(mpRole==='host')hostStartRematch();}}});
bindControl('finalWinner','value',snap=>{mpRoomData={...(mpRoomData||{}),finalWinner:snap.val()||null};if(mpRoomData.status==='finished'&&mpListener)mpRoomRef.child('gameState').once('value').then(mpListener);});
bindControl('longestBonus','value',snap=>{mpRoomData={...(mpRoomData||{}),longestBonus:snap.val()||null};if(mpRoomData.status==='finished'&&mpListener)mpRoomRef.child('gameState').once('value').then(mpListener);});
bindControl('roomExit','value',snap=>{const exitSignal=snap.val();if(exitSignal?.id&&exitSignal.id!==mpLastExitSignalId&&Number(exitSignal.at||0)>=mpSessionJoinedAt-1000){mpLastExitSignalId=exitSignal.id;handleSynchronizedRoomExit(exitSignal.reason||'game-cancelled',exitSignal.by||'');}});
mpScoresListener=mpRoomRef.child('scores').on('value',snap=>{
const sc=snap.val()||{};mpRoomData={...(mpRoomData||{}),scores:sc};
if(mpRole==='host'){if(!isOwnMpScorePending()){p1Score=Number(sc.host||0);mpLastConfirmedOwnScore=p1Score;}p2Score=Number(sc.guest||0);}else if(mpRole==='guest'){p1Score=Number(sc.host||0);if(!isOwnMpScorePending()){p2Score=Number(sc.guest||0);mpLastConfirmedOwnScore=p2Score;}}else{p1Score=Number(sc.host||0);p2Score=Number(sc.guest||0);}updateScores();
});
mpWordsListener=mpRoomRef.child('words').on('child_added',snap=>{
const ev=snap.val(),key=snap.key;if(!ev||!key||mpSeenWordEvents.has(key))return;
const activeRound=Number(mpRoomData?.round||1),eventRound=Number(ev.round||1);
if(eventRound!==activeRound)return;
mpSeenWordEvents.add(key);const w=String(ev.word||'').toLocaleUpperCase('tr-TR');if(w){mpFoundWords.host.add(w);mpFoundWords.guest.add(w);sessionFoundWords.add(w);recordMatchWord(w,ev.pts,ev.role==='host');}if(ev.role!==mpRole)applyRemoteWordEvent(ev,key);
});
}
function applyRemoteWordEvent(ev){
if(!ev||!ev.word)return;
const path=decodeClaimPath(ev.path);
if(path.length)applyClaimedPath(path,ev.role==='host');
const remoteBadge=addTickerBadge(String(ev.word).toLocaleUpperCase('tr-TR'),ev.role==='host');
flashOpponentWord(path,ev.role==='host',remoteBadge);
let remoteOrigin=null;
const lastPos=(ev.last&&Number.isInteger(ev.last.r)&&Number.isInteger(ev.last.c))?ev.last:(path.length?path[path.length-1]:null);
if(lastPos){
const lastEl=domCells[lastPos.r*BOARD_SIZE+lastPos.c]||document.getElementById(`cell-${lastPos.r}-${lastPos.c}`);
const rr=lastEl?.getBoundingClientRect?.();
if(rr&&rr.width&&rr.height) remoteOrigin={x:rr.left+rr.width/2,y:rr.top+rr.height/2};
}
flyScore(Number(ev.pts||0),ev.role==='host',remoteOrigin);
rewardWordFx(ev.role==='host');
showToast(`${String(ev.word).toLocaleUpperCase('tr-TR')}(+${ev.pts||0})`,ev.role==='host'?'amber':'sky');
}
function playCountdownBeep(n){
const ctx=ensureGameAudio();if(!ctx)return;
try{
const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime;
o.frequency.value=n===1?760:580+(3-n)*55;
const beepPeak=Math.min(AUDIO_GAIN_CAP,.06*masterSoundVolume*AUDIO_GAIN_BOOST);
g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,beepPeak),t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.11);
o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.12);
}catch(e){}
}
function startSyncedMatch(d){
if(mpStarted)return;
mpStarted=true;isMatchActive=false;mpLastBeepSecond=null;clearInterval(mpClock);
const modal=document.getElementById('modal-countdown'),num=document.getElementById('countdown-number'),status=document.getElementById('countdown-status');
modal?.querySelector('.mp-demo')?.classList.remove('hidden');
const inviteMsg=document.getElementById('countdown-invite-message');
if(inviteMsg){
inviteMsg.innerHTML='Kapışmaya davet aldınız<br><span class="text-indigo-600">Karşılaşma birazdan başlayacak</span>';
inviteMsg.classList.toggle('hidden',mpRole!=='guest');
}
if(num)num.classList.remove('hidden');
const startAt=Number(d.startAt||0);
if(status){status.innerHTML='<span class="sync-check">✓</span> SENKRON';status.className='countdown-sync-ok';}modal?.classList.remove('hidden');
const tick=()=>{
const left=startAt-serverNow();
if(left>0){
const n=Math.max(1,Math.min(3,Math.ceil(left/1000))); if(num)num.textContent=n;
if(mpLastBeepSecond!==n){mpLastBeepSecond=n;playCountdownBeep(n);}
if(num){num.style.transform=`translate3d(0,0,0)scale(${1+(3-n)*.06})`;num.style.opacity='1';}
return;
}
clearInterval(mpClock);modal?.classList.add('hidden');modal?.querySelector('.mp-demo')?.classList.add('hidden');isMatchActive=true;setMpState(MP_STATES.PLAYING);
if(mpRole==='host')mpRoomRef.child('gameState/status').set('playing').catch(()=>{});
remainingSeconds=60;updateGameTimerUI(60);
startMultiplayerTimer(startAt);
};
tick();mpClock=setInterval(tick,90);
}
function startMultiplayerTimer(startAt){
clearInterval(timerInterval);
lastHeartbeatSecond=null;
lastGongSecond=null;
let lastRenderedSecond=null;
const tick=()=>{
const elapsed=Math.max(0,Math.floor((serverNow()-startAt)/1000)); remainingSeconds=Math.max(0,60-elapsed);
if(remainingSeconds!==lastRenderedSecond){updateGameTimerUI(remainingSeconds);lastRenderedSecond=remainingSeconds;}
maybeHeartbeat(remainingSeconds);
maybeFinalGong(remainingSeconds);
if(remainingSeconds<=0){clearInterval(timerInterval);endGame();}
};
tick();timerInterval=setInterval(tick,250);
}
function activateMultiplayerPlaying(d){
if(!d||!d.startAt)return;
const timerAlreadyRunning=mpStarted&&isMatchActive&&mpState===MP_STATES.PLAYING&&!!timerInterval;
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
grid.style.filter='';
grid.style.opacity='';
grid.style.pointerEvents='auto';
grid.style.touchAction='none';
}
const game=document.getElementById('screen-game');
if(game)game.style.pointerEvents='auto';
if(!timerAlreadyRunning)startMultiplayerTimer(Number(d.startAt));
}
function getLocalMpScore(){
if(!mpRole)return 0;
return mpRole==='host'?Number(p1Score||0):Number(p2Score||0);
}
function isOwnMpScorePending(){
return !!mpRole&&(mpScoreSyncInFlight||mpScoreSyncTimer!==null||mpScoreDesired!==null);
}
function scheduleMpScoreSync(){
if(!mpRoomRef||!mpRole)return;
mpScoreDesired=Math.max(0,getLocalMpScore());
if(mpScoreSyncInFlight||mpScoreSyncTimer!==null)return;
mpScoreSyncTimer=setTimeout(flushMpScoreSync,0);
}
async function flushMpScoreSync(){
if(mpScoreSyncTimer!==null){clearTimeout(mpScoreSyncTimer);mpScoreSyncTimer=null;}
if(!mpRoomRef||!mpRole){mpScoreDesired=null;return;}
if(mpScoreSyncInFlight)return;
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
if(!mpRoomRef||!mpRole){mpScoreDesired=null;return;}
const latest=Math.max(0,getLocalMpScore());
if(latest!==value){mpScoreDesired=latest;scheduleMpScoreSync();}
else mpScoreDesired=null;
}
}
function encodeClaimPath(path){
return path.map(p=>(p.r*BOARD_SIZE+p.c).toString(36)).join('.');
}
function decodeClaimPath(raw){
if(Array.isArray(raw))return raw;
if(typeof raw!=='string'||!raw)return[];
const out=[];
for(const token of raw.split('.')){
const idx=parseInt(token,36);
if(!Number.isFinite(idx)||idx<0||idx>=BOARD_SIZE*BOARD_SIZE)continue;
out.push({r:Math.floor(idx/BOARD_SIZE),c:idx%BOARD_SIZE});
}
return out;
}
async function forceFlushMpScore(){
if(!mpRoomRef||!mpRole)return;
mpScoreDesired=Math.max(0,getLocalMpScore());
if(mpScoreSyncTimer!==null){clearTimeout(mpScoreSyncTimer);mpScoreSyncTimer=null;}
while(mpScoreSyncInFlight)await new Promise(r=>setTimeout(r,8));
if(mpScoreSyncTimer!==null){clearTimeout(mpScoreSyncTimer);mpScoreSyncTimer=null;}
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
if(!mpRoomRef||!mpRole)return;
await forceFlushMpScore();
await mpRoomRef.child('endReady/'+mpRole).set({ready:true,at:firebase.database.ServerValue.TIMESTAMP});
}
function waitForBothEndReady(timeoutMs=1400){
if(!mpRoomRef)return Promise.resolve(false);
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
if(mpRoomRef&&mpListener){mpRoomRef.child('gameState').off('value',mpListener);mpListener=null;}
if(mpRoomRef&&mpScoresListener){mpRoomRef.child('scores').off('value',mpScoresListener);mpScoresListener=null;}
if(mpRoomRef&&mpWordsListener){mpRoomRef.child('words').off('child_added',mpWordsListener);mpWordsListener=null;}
for(const x of mpControlListeners.splice(0)){try{x.ref.off(x.event,x.handler);}catch(e){}}
}
function resetMultiplayerClientState(){
stopInviteWaitCountdown();
stopGrandCelebrationFx();
stopWinnerConfettiWaterfall();
detachMultiplayerListeners();
stopLocalCountdown();
clearInterval(mpClock);mpClock=null;
clearInterval(timerInterval);timerInterval=null;
clearTimeout(botInterval);botInterval=null;
clearTimeout(mpEndResolveTimer);mpEndResolveTimer=null;
if(mpRematchExpiryTimer){clearTimeout(mpRematchExpiryTimer);mpRematchExpiryTimer=null;}
if(randomResultAutoExitTimer){clearTimeout(randomResultAutoExitTimer);randomResultAutoExitTimer=null;}randomResultAutoExitKey='';setRandomAutoExitNotice(false);
if(mpPresenceRef){try{mpPresenceRef.onDisconnect().cancel().catch(()=>{});}catch(_){}}
if(mpScoreSyncTimer!==null){clearTimeout(mpScoreSyncTimer);mpScoreSyncTimer=null;}
mpScoreSyncInFlight=false;mpScoreDesired=null;mpLastConfirmedOwnScore=null;
if(pointerFrame){cancelAnimationFrame(pointerFrame);pointerFrame=0;}
isPointerDown=false;pointerHoldStartedAt=0;clearTimeout(pointerHoldTimer);pointerHoldTimer=null;activePointerId=null;pendingPointer=null;activeGridRect=null;activeGridMetrics=null;isMatchActive=false;
try{clearPath();}catch(_){selectedPath=[];}
mpEntered=false;mpStarted=false;mpStartBusy=false;mpRematchBusy=false;
mpRoomRef=null;mpRoomCode=null;mpRole=null;mpRoomData=null;mpRoomMode='';mpRandomMatchSession=false;delete document.body.dataset.randomMatchActive;delete document.body.dataset.privateFriendActive;mpPresenceRef=null;mpLastRoomMetaSig='';
const _ga=document.getElementById('gameover-actions');if(_ga){_ga.style.removeProperty('display');_ga.classList.remove('hidden');}
const _rp=document.getElementById('btn-play-again');if(_rp)_rp.style.removeProperty('display');
const _ex=document.getElementById('btn-game-exit');if(_ex)_ex.style.removeProperty('display');
mpSessionJoinedAt=0;mpExitHandling=false;mpLastExitSignalId='';reconnectPresenceBusy=false;
mpSeenWordEvents.clear();mpFoundWords.host.clear();mpFoundWords.guest.clear();mpLastResultRenderSig='';
setMpState(MP_STATES.IDLE);
}
function returnToHomeFromMultiplayer(){
const memberNoToClear=activeMemberRoomNo;
const memberWasOwner=activeMemberRoomOwner;
activeMemberRoomNo='';activeMemberRoomOwner=false;
if(memberWasOwner&&memberNoToClear&&accountDb){
accountDb.ref('memberRooms/'+memberNoToClear).update({activeRoomCode:'',updatedAt:firebase.database.ServerValue.TIMESTAMP}).catch(()=>{});
}
const randomExitBtn=document.getElementById('btn-random-result-exit');
if(randomExitBtn){randomExitBtn.disabled=true;randomExitBtn.classList.add('hidden');randomExitBtn.style.removeProperty('display');randomExitBtn.style.removeProperty('visibility');randomExitBtn.style.removeProperty('opacity');}
stopInviteDecisionTimer();
const queueCleanup=randomSearchActive?cleanupRandomQueue().catch(()=>{}):null;
if(!randomSearchActive)releaseRandomSearchLocal();
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
const soloArrowHome=document.getElementById('solo-arrow');if(soloArrowHome)soloArrowHome.style.transform='';
document.getElementById('mp-room-view')?.classList.add('hidden');
document.getElementById('mp-create-view')?.classList.remove('hidden');
document.getElementById('btn-close-room')?.classList.add('hidden');
restoreHodriMeydanButton();
setRandomStatus('',false);
if(queueCleanup)queueCleanup.finally(()=>disconnectFirebaseNetwork(true));
else disconnectFirebaseNetwork();
}
async function discardCurrentPrivateRoom(){
const oldRef=mpRoomRef;
const oldRole=mpRole;
const oldMode=mpRoomMode;
detachMultiplayerListeners();
if(mpPresenceRef){
try{await mpPresenceRef.onDisconnect().cancel();}catch(_){}
}
if(oldRef && oldRole==='host' && /^invite-only-/.test(String(oldMode||''))){
try{await oldRef.remove();}catch(_){}
}
resetMultiplayerClientState();
clearInviteFromUrl();
}
async function openFreshPrivateRoom(){
if(randomSearchActive)await cleanupRandomQueue(true);
await discardCurrentPrivateRoom();
document.getElementById('friend-invite-panel')?.classList.remove('hidden');
document.getElementById('mp-create-view')?.classList.add('hidden');
document.getElementById('mp-room-view')?.classList.remove('hidden');
document.getElementById('btn-close-room')?.classList.remove('hidden');
setPrivateInviteControlsReady(false);
setPrivateRoomProgress('SUNUCUYA BAĞLANILIYOR…');
const ok=await createRoom();
if(!ok&&!mpRoomRef)setPrivateInviteControlsReady(false);
}
const difficultyPanel=document.getElementById('bot-settings-panel');
const soloArrow=document.getElementById('solo-arrow');
function setDifficultyOpen(open){
difficultyPanel.classList.toggle('hidden',!open);
soloArrow.style.transform=open?'rotate(90deg)':'';
}
let accountAuth=null,accountDb=null,accountAuthUnsub=null,accountFormMode='login',accountProfile=null;
let accountRoomPresenceRef=null,activeMemberRoomNo='',activeMemberRoomOwner=false;
function accountErrorMessage(err){
const code=String(err?.code||'');
if(code.includes('invalid-credential')||code.includes('wrong-password')||code.includes('user-not-found'))return 'E-posta veya şifre hatalı.';
if(code.includes('email-already-in-use'))return 'Bu e-posta zaten kayıtlı.';
if(code.includes('weak-password'))return 'Şifre en az 6 karakter olmalı.';
if(code.includes('invalid-email'))return 'Geçerli bir e-posta yazın.';
if(code.includes('popup-closed-by-user'))return '';
if(code.includes('popup-blocked'))return 'Tarayıcı Google giriş penceresini engelledi.';
if(code.includes('operation-not-allowed'))return 'Bu giriş yöntemi Firebase Authentication içinde henüz etkin değil.';
if(code.includes('unauthorized-domain'))return 'kapmaca.tr Firebase yetkili alan adlarına eklenmeli.';
return 'Hesap işlemi tamamlanamadı. Tekrar deneyin.';
}
function setAccountMessage(text='',ok=false){
const el=document.getElementById('account-message');if(!el)return;
el.textContent=text;el.className='mt-3 min-h-[18px] text-center text-xs font-black '+(ok?'text-emerald-700':'text-rose-600');
}
function setAccountUserMessage(text='',ok=true){
const el=document.getElementById('account-user-message');if(!el)return;
el.textContent=text;el.className='mt-3 min-h-[18px] text-xs font-black '+(ok?'text-emerald-700':'text-rose-600');
}
function setAccountLoading(on){
document.getElementById('account-loading')?.classList.toggle('hidden',!on);
}
function setAccountForm(mode){
accountFormMode=mode==='signup'?'signup':'login';
const form=document.getElementById('account-email-form');
form?.classList.remove('hidden');
const nick=document.getElementById('account-nickname');
nick?.classList.toggle('hidden',accountFormMode!=='signup');
const title=document.getElementById('account-form-title');
if(title)title.textContent=accountFormMode==='signup'?'Üye Ol':'Giriş Yap';
const pass=document.getElementById('account-password');
if(pass)pass.autocomplete=accountFormMode==='signup'?'new-password':'current-password';
setAccountMessage('');
}
async function ensureAccountBackend(){
if(!await ensureFirebaseAuthLoaded())throw new Error('auth-sdk-load-failed');
if(!firebase.apps.length)firebase.initializeApp(FIREBASE_CONFIG);
accountAuth=firebase.auth();
accountDb=firebase.database();
try{await accountAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);}catch(_){}
if(!accountAuthUnsub){
accountAuthUnsub=accountAuth.onAuthStateChanged(user=>renderAccountState(user).catch(()=>{}));
}
return true;
}
function memberRoomUrl(roomNo){
const u=new URL('https://kapmaca.tr/');
u.searchParams.set('room',String(roomNo||''));
return u.toString();
}
async function ensurePermanentRoomForUser(user,profile){
if(!user||!accountDb)return profile;
let roomNo=String(profile?.roomNo||'');
if(/^\d{6,7}$/.test(roomNo))return profile;
for(let attempt=0;attempt<8;attempt++){
const counterRef=accountDb.ref('meta/nextMemberRoom');
const tx=await counterRef.transaction(current=>{
const n=Math.max(99999,Number(current||99999));
return n+1;
});
if(!tx.committed)continue;
roomNo=String(tx.snapshot.val()||'');
if(!/^\d{6,7}$/.test(roomNo))throw new Error('member-room-range');
const roomRef=accountDb.ref('memberRooms/'+roomNo);
const reserve=await roomRef.transaction(current=>{
if(current===null)return{ownerUid:user.uid,createdAt:firebase.database.ServerValue.TIMESTAMP,online:false,activeRoomCode:'',updatedAt:firebase.database.ServerValue.TIMESTAMP};
if(current?.ownerUid===user.uid)return current;
return;
});
if(!reserve.committed)continue;
await accountDb.ref('users/'+user.uid).update({roomNo,updatedAt:Date.now()});
return{...(profile||{}),roomNo};
}
throw new Error('member-room-allocation-failed');
}
async function stopMemberRoomPresence(){
const ref=accountRoomPresenceRef;
accountRoomPresenceRef=null;
if(!ref)return;
try{await ref.onDisconnect().cancel();}catch(_){}
try{await ref.parent.update({online:false,updatedAt:firebase.database.ServerValue.TIMESTAMP});}catch(_){}
}
async function startMemberRoomPresence(user,roomNo){
if(!user||!accountDb||!/^\d{6,7}$/.test(String(roomNo||'')))return;
try{accountDb.goOnline();}catch(_){}
if(accountRoomPresenceRef&&accountRoomPresenceRef.toString().includes('/'+roomNo+'/presence'))return;
await stopMemberRoomPresence();
const roomRef=accountDb.ref('memberRooms/'+roomNo);
accountRoomPresenceRef=roomRef.child('presence');
await roomRef.update({ownerUid:user.uid,online:true,updatedAt:firebase.database.ServerValue.TIMESTAMP});
await accountRoomPresenceRef.set({online:true,at:firebase.database.ServerValue.TIMESTAMP});
accountRoomPresenceRef.onDisconnect().set({online:false,at:firebase.database.ServerValue.TIMESTAMP});
roomRef.child('online').onDisconnect().set(false);
}
function paintAccountRoom(profile){
const roomNo=String(profile?.roomNo||'');
const no=document.getElementById('account-room-number');
const st=document.getElementById('account-room-status');
const dot=document.getElementById('account-room-dot');
if(no)no.textContent=roomNo||'------';
if(st)st.textContent=roomNo?'Çevrimiçi':'Hazırlanıyor…';
if(dot)dot.style.background=roomNo?'#22c55e':'#94a3b8';
}
async function openPermanentMemberRoom(){
const user=accountAuth?.currentUser;
const roomNo=String(accountProfile?.roomNo||'');
if(!user||!/^\d{6,7}$/.test(roomNo)){setAccountUserMessage('Özel oda henüz hazır değil.',false);return;}
closeAccountScreen();
activeMemberRoomNo=roomNo;
activeMemberRoomOwner=true;
try{
if(randomSearchActive)await cleanupRandomQueue(true);
await discardCurrentPrivateRoom();
document.getElementById('friend-invite-panel')?.classList.remove('hidden');
document.getElementById('mp-create-view')?.classList.add('hidden');
document.getElementById('mp-room-view')?.classList.remove('hidden');
document.getElementById('btn-close-room')?.classList.remove('hidden');
setPrivateInviteControlsReady(false);
setPrivateRoomProgress('ÖZEL ODA HAZIRLANIYOR…');
const ok=await createRoom();
if(!ok)throw new Error('member-room-create-failed');
await accountDb.ref('memberRooms/'+roomNo).update({online:true,activeRoomCode:mpRoomCode,updatedAt:firebase.database.ServerValue.TIMESTAMP});
setRoomUrl(roomNo);
setPrivateInviteControlsReady(true,roomNo);
showToast('Özel odan hazır.','emerald');
}catch(err){
console.error('Permanent member room error',err);
activeMemberRoomNo='';activeMemberRoomOwner=false;
setAccountUserMessage('Özel oda açılamadı. Tekrar deneyin.',false);
document.getElementById('screen-account')?.classList.remove('hidden');
}
}
async function resolveMemberRoom(roomNo){
roomNo=String(roomNo||'').replace(/\D/g,'').slice(0,7);
if(!/^\d{6,7}$/.test(roomNo))return false;
if(!await waitFirebaseConnected(8000)){showToast('Sunucuya bağlanılamadı.','rose');return false;}
let data=null;
try{data=(await mpDb.ref('memberRooms/'+roomNo).once('value')).val();}catch(_){}
if(!data){showToast('Özel oda bulunamadı.','rose');return false;}
if(data.online!==true){
showToast('Oda sahibi şu anda çevrimdışı.','slate');
return false;
}
const liveCode=String(data.activeRoomCode||'').toLowerCase();
if(!/^[a-z]{5}$/.test(liveCode)){
showToast('Oda sahibi çevrimiçi; oda henüz açılmadı.','amber');
return false;
}
activeMemberRoomNo=roomNo;activeMemberRoomOwner=false;
return joinRoom(liveCode);
}
function defaultAccountProfile(user){
const fallback=(user?.displayName||String(user?.email||'').split('@')[0]||'Oyuncu').slice(0,18);
return{nickname:fallback,games:0,wins:0,losses:0,bestScore:0,longestWord:'',createdAt:Date.now(),updatedAt:Date.now()};
}
async function loadAccountProfile(user){
if(!user||!accountDb)return null;
const ref=accountDb.ref('users/'+user.uid);
let data=null;
try{
const snap=await ref.once('value');
data=snap.val();
if(!data){
data=defaultAccountProfile(user);
await ref.set(data);
}
}catch(err){
console.warn('Profil okunamadı',err);
data=defaultAccountProfile(user);
}
data=await ensurePermanentRoomForUser(user,data);
accountProfile=data;
await startMemberRoomPresence(user,data?.roomNo);
return data;
}
async function renderAccountState(user){
const guest=document.getElementById('account-guest-view');
const signed=document.getElementById('account-user-view');
if(!guest||!signed)return;
if(!user){
await stopMemberRoomPresence();
accountProfile=null;activeMemberRoomNo='';activeMemberRoomOwner=false;
paintAccountRoom(null);
guest.classList.remove('hidden');signed.classList.add('hidden');
const homeLabel=document.getElementById('account-home-label');if(homeLabel)homeLabel.textContent='Hesap';
return;
}
setAccountLoading(true);
const profile=await loadAccountProfile(user);
guest.classList.add('hidden');signed.classList.remove('hidden');
const name=String(profile?.nickname||user.displayName||'Oyuncu').slice(0,18);
const games=Number(profile?.games||0),wins=Number(profile?.wins||0);
const nameEl=document.getElementById('account-user-name');if(nameEl)nameEl.textContent=name;
const stats=document.getElementById('account-user-stats');if(stats)stats.textContent=`${games} oyun • ${wins} galibiyet`;
const emailEl=document.getElementById('account-user-email');if(emailEl)emailEl.textContent=user.email||'';
const editor=document.getElementById('account-profile-nickname');if(editor)editor.value=name;
const homeLabel=document.getElementById('account-home-label');if(homeLabel)homeLabel.textContent=name;
paintAccountRoom(profile);
setAccountLoading(false);
}
async function openAccountScreen(){
document.getElementById('screen-account')?.classList.remove('hidden');
setAccountLoading(true);setAccountMessage('');
try{
await ensureAccountBackend();
await renderAccountState(accountAuth.currentUser);
}catch(err){
setAccountLoading(false);
setAccountMessage(accountErrorMessage(err));
}
}
function closeAccountScreen(){document.getElementById('screen-account')?.classList.add('hidden');}
document.getElementById('btn-account-login')?.addEventListener('click',()=>setAccountForm('login'));
document.getElementById('btn-account-signup')?.addEventListener('click',()=>setAccountForm('signup'));
document.getElementById('btn-account-submit')?.addEventListener('click',async()=>{
setAccountMessage('');
const email=String(document.getElementById('account-email')?.value||'').trim();
const password=String(document.getElementById('account-password')?.value||'');
const nickname=String(document.getElementById('account-nickname')?.value||'').trim().slice(0,18);
if(!email||!password){setAccountMessage('E-posta ve şifre gerekli.');return;}
if(accountFormMode==='signup'&&!nickname){setAccountMessage('Bir oyuncu adı yazın.');return;}
try{
await ensureAccountBackend();
if(accountFormMode==='signup'){
const cred=await accountAuth.createUserWithEmailAndPassword(email,password);
await cred.user.updateProfile({displayName:nickname});
const data={...defaultAccountProfile(cred.user),nickname,updatedAt:Date.now()};
await accountDb.ref('users/'+cred.user.uid).set(data);
await renderAccountState(cred.user);
}else{
const cred=await accountAuth.signInWithEmailAndPassword(email,password);
await renderAccountState(cred.user);
}
}catch(err){setAccountMessage(accountErrorMessage(err));}
});
document.getElementById('btn-account-google')?.addEventListener('click',async()=>{
setAccountMessage('');
try{
await ensureAccountBackend();
const provider=new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({prompt:'select_account'});
const cred=await accountAuth.signInWithPopup(provider);
await renderAccountState(cred.user);
}catch(err){const msg=accountErrorMessage(err);if(msg)setAccountMessage(msg);}
});
document.getElementById('btn-account-logout')?.addEventListener('click',async()=>{
try{await accountAuth?.signOut();setAccountUserMessage('');}catch(err){setAccountUserMessage(accountErrorMessage(err),false);}
});
document.getElementById('btn-account-profile')?.addEventListener('click',()=>{
document.getElementById('account-profile-editor')?.classList.toggle('hidden');
});
document.getElementById('btn-account-save-profile')?.addEventListener('click',async()=>{
const user=accountAuth?.currentUser;if(!user||!accountDb)return;
const nickname=String(document.getElementById('account-profile-nickname')?.value||'').trim().slice(0,18);
if(!nickname){setAccountUserMessage('Oyuncu adı boş bırakılamaz.',false);return;}
try{
await user.updateProfile({displayName:nickname});
await accountDb.ref('users/'+user.uid).update({nickname,updatedAt:Date.now()});
accountProfile={...(accountProfile||{}),nickname};
await renderAccountState(user);
document.getElementById('account-profile-editor')?.classList.add('hidden');
setAccountUserMessage('Profil güncellendi ✓');
}catch(err){setAccountUserMessage(accountErrorMessage(err),false);}
});
document.getElementById('btn-account-copy-room')?.addEventListener('click',async()=>{
const roomNo=String(accountProfile?.roomNo||'');
if(!/^\d{6,7}$/.test(roomNo))return;
try{await navigator.clipboard.writeText(memberRoomUrl(roomNo));setAccountUserMessage('Oda bağlantısı kopyalandı ✓');}
catch(_){setAccountUserMessage('Bağlantı kopyalanamadı.',false);}
});
document.getElementById('btn-account-open-room')?.addEventListener('click',openPermanentMemberRoom);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.getElementById('screen-account')?.classList.contains('hidden'))closeAccountScreen();});
let deferredShortcutPrompt=null;
window.addEventListener('beforeinstallprompt',(e)=>{
e.preventDefault();
deferredShortcutPrompt=e;
});
window.addEventListener('appinstalled',()=>{
deferredShortcutPrompt=null;
showToast('KAPMACA kısayolu eklendi.','emerald');
});
document.getElementById('btn-add-shortcut')?.addEventListener('click',async()=>{
if(window.matchMedia?.('(display-mode: standalone)')?.matches||window.navigator.standalone===true){
showToast('KAPMACA zaten ana ekranda.','emerald');
return;
}
if(deferredShortcutPrompt){
const promptEvent=deferredShortcutPrompt;
deferredShortcutPrompt=null;
try{
await promptEvent.prompt();
await promptEvent.userChoice;
}catch(_){}
return;
}
const isiOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
showToast(isiOS?'Paylaş → Ana Ekrana Ekle seçeneğini kullan.':'Tarayıcı menüsü → Ana ekrana ekle / Uygulamayı yükle seçeneğini kullan.','amber');
});
if('serviceWorker' in navigator){
window.addEventListener('load',()=>{
navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
},{once:true});
}
document.getElementById('btn-solo-mode').onclick=()=>{
document.getElementById('friend-invite-panel').classList.add('hidden');
const opening=difficultyPanel.classList.contains('hidden');
setDifficultyOpen(opening);
if(opening&&!wordDataReady){
ensureWordDataLoaded().then(()=>scheduleBoardPrewarm()).catch(()=>{});
}
};
document.getElementById('btn-close-difficulty').onclick=(e)=>{e.stopPropagation();setDifficultyOpen(false);};
document.getElementById('btn-friend-mode').onclick=async()=>{
setDifficultyOpen(false);
const panel=document.getElementById('friend-invite-panel');
const opening=panel?.classList.contains('hidden');
if(opening){
panel?.classList.remove('hidden');
document.getElementById('mp-create-view')?.classList.remove('hidden');
document.getElementById('mp-room-view')?.classList.add('hidden');
if(!wordDataReady)ensureWordDataLoaded().then(()=>scheduleBoardPrewarm()).catch(()=>{});
}else{
if(mpRoomRef&&mpRole)await requestSynchronizedRoomExit('player-exit');
else if(randomSearchActive)await cleanupRandomQueue(true);
panel?.classList.add('hidden');
disconnectFirebaseNetwork(true);
}
};
document.getElementById('btn-close-friend').onclick=async()=>{
if(mpRoomRef&&mpRole)await requestSynchronizedRoomExit('player-exit');
else if(randomSearchActive)await cleanupRandomQueue(true);
document.getElementById('friend-invite-panel')?.classList.add('hidden');
disconnectFirebaseNetwork(true);
};
document.getElementById('btn-create-room')?.addEventListener('click',openFreshPrivateRoom);
document.getElementById('btn-random-match')?.addEventListener('click',searchRandomOpponent);
async function beginPrivateHostWaiting(copyToClipboard=false,shareNative=false){
if(!mpRoomCode||mpRole!=='host'||!mpRoomRef)return;
const url=inviteUrl(mpRoomCode);
const deadline=serverNow()+60000;
try{
if(copyToClipboard)await navigator.clipboard.writeText(url);
await mpRoomRef.child('invite').set({guest:'pending',expiresAt:deadline});
mpRoomData={...(mpRoomData||{}),inviteGuest:'pending',inviteExpiresAt:deadline};
setRoomUrl(mpRoomCode);
await enterMultiplayerRoom();
if(!mpEntered)return;
isMatchActive=false;
document.getElementById('modal-mp-waiting')?.classList.remove('hidden');
startInviteWaitCountdown(deadline);
if(shareNative){
if(navigator.share){
navigator.share({title:'KAPMACA - Sözcük Avı',text:'🔥 60 saniye. Aynı harfler. Kim daha çok sözcük bulacak? KAPMACA\'da bana karşı oyna!',url}).catch(()=>{});
}else{
await navigator.clipboard.writeText(url).catch(()=>{});
showToast('Davet bağlantısı kopyalandı.','emerald');
}
}
}catch(err){
console.error('Private invite start error',err);
showToast('Davet başlatılamadı.','rose');
}
}
document.getElementById('btn-copy-link').onclick=()=>beginPrivateHostWaiting(true,false);
document.getElementById('btn-share-link').onclick=()=>beginPrivateHostWaiting(false,true);
document.getElementById('btn-close-mp-waiting').onclick=async()=>{
if(mpRoomRef&&mpRole){
const ref=mpRoomRef;
try{await ref.remove();}catch(_){}
returnToHomeFromMultiplayer();
}else{
document.getElementById('modal-mp-waiting')?.classList.add('hidden');
returnToHomeFromMultiplayer();
}
};
document.getElementById('btn-fullscreen-home')?.addEventListener('click',toggleGameFullscreen);
document.getElementById('btn-fullscreen-game')?.addEventListener('click',toggleGameFullscreen);
window.addEventListener('DOMContentLoaded',async()=>{
const u=new URL(location.href);
const raw=String(u.searchParams.get('room')||'').trim().toLowerCase();
const memberNo=raw.replace(/\D/g,'').slice(0,7);
const code=raw.replace(/[^a-z]/g,'').slice(0,5);
if(!memberNo&&!code)return;
document.getElementById('screen-home')?.classList.add('hidden');
document.getElementById('screen-game')?.classList.add('hidden');
document.getElementById('friend-invite-panel')?.classList.add('hidden');
setDifficultyOpen(false);
const ok=/^\d{6,7}$/.test(memberNo)?await resolveMemberRoom(memberNo):await joinRoom(code);
if(!ok){
document.getElementById('screen-home')?.classList.remove('hidden');
return;
}
if(mpRole==='guest' && /^invite-only-/.test(String(mpRoomMode||'')) && mpRoomData?.status==='waiting'){
showInviteDecisionModal();
}else if(mpRole==='guest' && /^random-match-/.test(String(mpRoomMode||''))){
await enterMultiplayerRoom();
}
});
document.getElementById('btn-invite-start')?.addEventListener('click',async()=>{
if(mpRole!=='guest'||!mpRoomRef)return;
stopInviteDecisionTimer();
const btn=document.getElementById('btn-invite-start');
if(btn)btn.disabled=true;
try{
const inv=(await mpRoomRef.child('invite').once('value')).val()||{};
if(Number(inv.expiresAt||0)>0&&Number(inv.expiresAt)<=serverNow()){
showToast('Davet süresi doldu.','rose');
try{await mpRoomRef.remove();}catch(_){}
returnToHomeFromMultiplayer();
return;
}
await ensureWordDataLoaded();
document.getElementById('modal-room-invite')?.classList.add('hidden');
await enterMultiplayerRoom();
await mpRoomRef.child('ready/guest').set(true);
await mpRoomRef.child('invite/guest').set('accepted');
}catch(err){
console.error('Guest invite start error',err);
showToast('Oyun başlatılamadı.','rose');
if(btn)btn.disabled=false;
}
});
document.getElementById('btn-invite-cancel')?.addEventListener('click',async()=>{
stopInviteDecisionTimer();
if(mpRoomRef){
try{await mpRoomRef.remove();}catch(_){}
}
returnToHomeFromMultiplayer();
});
document.getElementById('btn-close-room').onclick=async()=>{
if(mpRoomRef&&mpRole==='host'){
try{await mpRoomRef.remove();}catch(_){}
}
returnToHomeFromMultiplayer();
};
document.querySelectorAll('.bot-diff-choice').forEach(btn=>{
btn.onclick=async()=>{
botDiffLevel=btn.dataset.diff;
document.querySelectorAll('.bot-diff-choice').forEach(b=>b.classList.remove('ring-4','ring-amber-400'));
btn.classList.add('ring-4','ring-amber-400');
setDifficultyOpen(false);
try{await ensureWordDataLoaded();prepareGame();}
catch(err){console.error('Single game startup failed',err);showToast('Oyun hazırlanamadı. Tekrar deneyin.','rose');}
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
{word:'KAP',path:[7,8,9]},        // soldan sağa
{word:'CAM',path:[12,11,10]},    // sağdan sola
{word:'TAŞ',path:[18,11,4]},      // aşağıdan yukarı
{word:'SAL',path:[6,13,20]},      // yukarıdan aşağı
{word:'AYAK',path:[0,1,8,7]}      // dirsek/kare benzeri komşu toplama
];
let round=0,step=0;
function advance(){
if(document.hidden||!demoVisible()||isFullscreenActive()){stopHowtoDemo();return;}
const item=rounds[round];
const visible=visibleBoards();
const setPicked=(count)=>{
const chars=Array.from(item.word).slice(0,count);
for(const board of visible){
const wrap=board.closest('.mp-demo')||board.parentElement;
const picked=wrap?.querySelector('.demo-picked');
if(!picked)continue;
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
if(rematchDemo)document.getElementById('rematch-wait-sub')?.after(rematchDemo);
document.addEventListener('visibilitychange',()=>{
if(document.hidden){stopHowtoDemo();stopWinnerConfettiWaterfall();}
else startHowtoDemo();
});
new MutationObserver(()=>{if(!document.getElementById('screen-home').classList.contains('hidden'))startHowtoDemo();}).observe(document.getElementById('screen-home'),{attributes:true,attributeFilter:['class']});
for(const id of['modal-room-invite','modal-mp-waiting','modal-rematch-waiting','modal-countdown'])new MutationObserver(()=>startHowtoDemo()).observe(document.getElementById(id),{attributes:true,attributeFilter:['class']});
startHowtoDemo();
document.addEventListener('click',(event)=>{
const target=event.target?.closest?.('#btn-account-home,#btn-close-account,#btn-settings,#btn-settings-back,#btn-howto,#btn-howto-back,#btn-about,#btn-about-back,#btn-open-dictionary,#btn-recommend,#btn-close-recommend,#btn-support,#btn-close-support');
if(!target)return;
switch(target.id){
case 'btn-account-home':
openAccountScreen();
break;
case 'btn-close-account':
closeAccountScreen();
break;
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
case 'btn-recommend':
openRecommendModal();
break;
case 'btn-close-recommend':
closeRecommendModal();
break;
case 'btn-support':{
event.preventDefault();
document.getElementById('screen-support')?.classList.remove('hidden');
startCoffeeCooldownClock();
break;
}
case 'btn-close-support':
document.getElementById('screen-support')?.classList.add('hidden');
stopCoffeeCooldownClock();
if(location.hash==='#screen-support')history.replaceState(null,'',location.pathname+location.search);
break;
}
});
const recommendScreen=document.getElementById('screen-recommend');
const recommendStatus=document.getElementById('recommend-share-status');
const RECOMMEND_URL='https://kapmaca.tr/';
const RECOMMEND_TEXT='KAPMACA; seni kapışmaya davet ediyorum!';
function setRecommendStatus(text=''){
if(!recommendStatus)return;
recommendStatus.textContent=text;
if(text)setTimeout(()=>{if(recommendStatus.textContent===text)recommendStatus.textContent='';},1800);
}
function openRecommendModal(){recommendScreen?.classList.remove('hidden');}
function closeRecommendModal(){recommendScreen?.classList.add('hidden');setRecommendStatus('');}
function openShareWindow(url){
const w=window.open(url,'_blank','noopener,noreferrer,width=720,height=640');
if(!w)location.href=url;
}
async function copyRecommendLink(){
try{
if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(RECOMMEND_URL);
else{
const ta=document.createElement('textarea');ta.value=RECOMMEND_URL;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
}
setRecommendStatus('Bağlantı kopyalandı ✓');
}catch(_){setRecommendStatus('Kopyalanamadı');}
}
document.getElementById('btn-close-recommend')?.addEventListener('click',closeRecommendModal);
recommendScreen?.addEventListener('click',event=>{if(event.target===recommendScreen)closeRecommendModal();});
document.querySelectorAll('.recommend-share-option').forEach(btn=>{
btn.addEventListener('click',()=>{
const type=btn.dataset.share;
const u=encodeURIComponent(RECOMMEND_URL);
const t=encodeURIComponent(RECOMMEND_TEXT+' '+RECOMMEND_URL);
if(type==='whatsapp')openShareWindow('https://wa.me/?text='+t);
else if(type==='facebook')openShareWindow('https://www.facebook.com/sharer/sharer.php?u='+u);
else if(type==='x')openShareWindow('https://twitter.com/intent/tweet?text='+encodeURIComponent(RECOMMEND_TEXT)+'&url='+u);
else if(type==='telegram')openShareWindow('https://t.me/share/url?url='+u+'&text='+encodeURIComponent(RECOMMEND_TEXT));
else if(type==='email')location.href='mailto:?subject='+encodeURIComponent('KAPMACA - Sözcük Avı')+'&body='+t;
else if(type==='copy')copyRecommendLink();
});
});
document.getElementById('btn-native-share')?.addEventListener('click',()=>{
if(navigator.share){
navigator.share({title:'KAPMACA - Sözcük Avı',text:RECOMMEND_TEXT,url:RECOMMEND_URL}).catch(()=>{});
}else copyRecommendLink();
});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&recommendScreen&&!recommendScreen.classList.contains('hidden'))closeRecommendModal();});
const supportScreen=document.getElementById('screen-support');
const COFFEE_LOCK_KEY='kapmaca_coffee_next_allowed_v1';
const COFFEE_LOCK_MS=24*60*60*1000;
let coffeeCooldownTimer=null;
let coffeeBusy=false;
function readCoffeeNextAllowed(){
const raw=Number(safeStorageGet('local',COFFEE_LOCK_KEY)||0);
return Number.isFinite(raw)&&raw>0?raw:0;
}
function renderCoffeeButtonState(){
const btn=document.getElementById('btn-buy-coffee');
if(!btn)return;
const left=readCoffeeNextAllowed()-Date.now();
const locked=left>0;
btn.disabled=locked||coffeeBusy;
btn.style.opacity=(locked||coffeeBusy)?'.62':'1';
btn.style.cursor=(locked||coffeeBusy)?'not-allowed':'pointer';
if(coffeeBusy)btn.textContent='TEŞEKKÜRLER :)';
else if(locked)btn.textContent='TEŞEKKÜRLER :)';
else btn.textContent='KAHVE ISMARLA';
}
function startCoffeeCooldownClock(){
clearInterval(coffeeCooldownTimer);
renderCoffeeButtonState();
if(readCoffeeNextAllowed()>Date.now()){
coffeeCooldownTimer=setInterval(()=>{
renderCoffeeButtonState();
if(readCoffeeNextAllowed()<=Date.now()){
clearInterval(coffeeCooldownTimer);
coffeeCooldownTimer=null;
}
},30000);
}
}
function stopCoffeeCooldownClock(){
clearInterval(coffeeCooldownTimer);
coffeeCooldownTimer=null;
}
function trackCoffeeLike(){
try{
if(typeof window.gtag==='function'){
window.gtag('event','kahve_begeni',{
event_category:'engagement',
event_label:'kahve',
value:1
});
}
}catch(_){}
}
async function handleCoffeeLike(){
if(coffeeBusy)return;
if(readCoffeeNextAllowed()>Date.now()){
startCoffeeCooldownClock();
return;
}
coffeeBusy=true;
renderCoffeeButtonState();
const thanks=document.getElementById('coffee-thanks');
try{
trackCoffeeLike();
safeStorageSet('local',COFFEE_LOCK_KEY,String(Date.now()+COFFEE_LOCK_MS));
if(thanks){
thanks.textContent='Teşekkürler :)';
thanks.classList.remove('hidden');
}
startCoffeeCooldownClock();
}finally{
coffeeBusy=false;
renderCoffeeButtonState();
}
}
document.getElementById('btn-buy-coffee')?.addEventListener('click',handleCoffeeLike);
supportScreen?.addEventListener('click',event=>{
if(event.target===supportScreen){
supportScreen.classList.add('hidden');
stopCoffeeCooldownClock();
if(location.hash==='#screen-support')history.replaceState(null,'',location.pathname+location.search);
}
});
document.addEventListener('keydown',event=>{
if(event.key==='Escape'&&supportScreen&&!supportScreen.classList.contains('hidden')){
supportScreen.classList.add('hidden');
stopCoffeeCooldownClock();
if(location.hash==='#screen-support')history.replaceState(null,'',location.pathname+location.search);
}
});
const soundRange=document.getElementById('sound-volume-range');
const soundMuted=document.getElementById('sound-muted');
let soundPreviewAt=0;
function previewSoundLevel(){
if(masterSoundVolume<=0)return;
const now=performance.now();
if(now-soundPreviewAt<75)return;
soundPreviewAt=now;
ensureGameAudio();
playTone(620,.055,.065,'sine',760);
}
soundRange?.addEventListener('pointerdown',()=>{
const level=Math.max(1,Math.min(6,Number(soundRange.value||1)));
setMasterSoundVolume(level/6);
previewSoundLevel();
});
soundRange?.addEventListener('input',()=>{
const level=Math.max(1,Math.min(6,Number(soundRange.value||1)));
setMasterSoundVolume(level/6);
previewSoundLevel();
});
soundMuted?.addEventListener('change',()=>{
if(soundMuted.checked){
if(masterSoundVolume>0)lastNonMutedSoundVolume=masterSoundVolume;
setMasterSoundVolume(0);
}else{
setMasterSoundVolume(Math.max(1,Math.min(6,Math.round((lastNonMutedSoundVolume>0?lastNonMutedSoundVolume:.8)*6)))/6);
previewSoundLevel();
}
});
setMasterSoundVolume(masterSoundVolume);
updateFullscreenUi();
function prepareGame(){
stopLocalCountdown();
activeGameMode='single';setLongestBonusBadges(false,false);
document.getElementById('p1-title').textContent='OYUNCU';
document.getElementById('p2-title').textContent='BİLGİSAYAR';
p1Score=0;p2Score=0;resetRewardFx();updateScores();remainingSeconds=60;
resetMatchWordResults();resetSeriesWordResults();
sessionFoundWords.clear();
const ticker=document.getElementById('words-ticker');if(ticker)ticker.innerHTML='';
document.getElementById('screen-home').classList.add('hidden');
document.getElementById('screen-game').classList.remove('hidden');
triggerCountdownSequence(()=>{isMatchActive=true;startTimer();planBot();});
requestAnimationFrame(()=>{
try{buildGrid();}
catch(err){
console.error('Single game board startup error',err);
stopLocalCountdown();
document.getElementById('modal-countdown')?.classList.add('hidden');
showToast('Tahta hazırlanamadı. Tekrar deneyin.','rose');
document.getElementById('screen-game')?.classList.add('hidden');
document.getElementById('screen-home')?.classList.remove('hidden');
}
});
}
function triggerCountdownSequence(onComplete){
stopLocalCountdown();
const modal=document.getElementById('modal-countdown');
modal?.querySelector('.mp-demo')?.classList.remove('hidden');
const numEl=document.getElementById('countdown-number');
const statusEl=document.getElementById('countdown-status');
const inviteMsg=document.getElementById('countdown-invite-message');
if(inviteMsg)inviteMsg.classList.add('hidden');
if(statusEl){statusEl.textContent='SÖZCÜKLERİ YAKALA!';statusEl.className='text-slate-800 font-black text-xs tracking-widest uppercase mt-3 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm';statusEl.classList.remove('hidden');}
modal?.classList.remove('hidden');
let n=3;
const paint=()=>{
if(!numEl)return;
numEl.textContent=String(n);
numEl.style.opacity='1';
numEl.style.transform='scale(1.16)';
playCountdownBeep(n);
requestAnimationFrame(()=>{numEl.style.transform='scale(1)';});
};
paint();
localCountdownInterval=setInterval(()=>{
n--;
if(n>0){paint();return;}
clearInterval(localCountdownInterval);localCountdownInterval=null;
if(numEl){numEl.style.opacity='0';numEl.style.transform='scale(1.28)';}
localCountdownTimeout=setTimeout(()=>{
if(numEl){numEl.style.opacity='1';numEl.style.transform='scale(1)';}
modal?.classList.add('hidden');
localCountdownTimeout=null;
onComplete();
},120);
},1000);
}
const BOARD_SIZE=9;
const BOARD_DIRS=[
{dr:0,dc:1},{dr:0,dc:-1},{dr:1,dc:0},{dr:-1,dc:0}
];
const SEED_VOWELS=new Set(['A','E','I','İ','O','Ö','U','Ü']);
function isFriendlyBoardSeed(word){
const w=String(word||'');
if(w.length<3)return true;
let vowels=0,consonantRun=0,maxConsonantRun=0,rare=0;
for(let i=0;i<w.length;i++){
const ch=w[i];
if(SEED_VOWELS.has(ch)){vowels++;consonantRun=0;}else{consonantRun++;if(consonantRun>maxConsonantRun)maxConsonantRun=consonantRun;}
if(ch==='J'||ch==='F')rare++;
if(i>=2&&ch===w[i-1]&&ch===w[i-2])return false;
}
const ratio=vowels/Math.max(1,w.length);
return vowels>0&&ratio>=.22&&ratio<=.72&&maxConsonantRun<=3&&rare<=1;
}
let FRIENDLY_WORDS_BY_LENGTH=new Map();
let BOARD_POOLS={easy2:[],medium3:[],medium4:[],medium34:[],bridge5:[],hidden69:[]};
function rebuildBoardWordPools(){
FRIENDLY_WORDS_BY_LENGTH=new Map();
for(const[len,list]of GAME_WORDS_BY_LENGTH){
const friendly=list.filter(isFriendlyBoardSeed);
FRIENDLY_WORDS_BY_LENGTH.set(len,friendly.length>=Math.min(12,list.length)?friendly:list);
}
const medium3=FRIENDLY_WORDS_BY_LENGTH.get(3)||[];
const medium4=FRIENDLY_WORDS_BY_LENGTH.get(4)||[];
BOARD_POOLS={
easy2:GAME_WORDS_BY_LENGTH.get(2)||[],
medium3,
medium4,
medium34:[...medium3,...medium4],
bridge5:FRIENDLY_WORDS_BY_LENGTH.get(5)||[],
hidden69:[...(FRIENDLY_WORDS_BY_LENGTH.get(6)||[]),...(FRIENDLY_WORDS_BY_LENGTH.get(7)||[]),...(FRIENDLY_WORDS_BY_LENGTH.get(8)||[]),...(FRIENDLY_WORDS_BY_LENGTH.get(9)||[])]
};
}
const BOARD_BALANCE=Object.freeze({
easyMin:16,easyIdeal:32,easyMax:58,
mediumMin:105,mediumIdeal:178,
bridgeMin:18,bridgeIdeal:44,
coreMin:126,coreIdeal:216,
hiddenMin:8,hiddenIdeal:17,hiddenMax:30,
totalMin:205,totalIdeal:350,
coverageMin:57,coverageIdeal:77,
longVarietyMin:3,initialVarietyMin:16
});
const FILL_LETTERS="AAAAAAAABCCÇDDEEEEEEEFGĞHHIIIIIİİİİJKKKLLLMMMNNNOOÖPRRRRSSSŞTTTUUÜVYYZ";
const BOARD_FLAVORS=Object.freeze([
{id:'akici',easy:8,m3:28,m4:10,bridge:11,long:7,fill:"AAAAAAAABCCÇDDEEEEEEEGHIIIIIİİİİKKKLLLLMMMNNNNOOÖPRRRRSSSSŞTTTTUUÜVYYZ"},
{id:'dengeli',easy:6,m3:21,m4:15,bridge:14,long:9,fill:FILL_LETTERS},
{id:'orta',easy:6,m3:18,m4:19,bridge:15,long:8,fill:"AAAAAAABCCÇDDEEEEEEEFGĞHIIIIIİİİİKKKLLLMMMNNNOOÖPRRRRSSSŞTTTUUÜVYYZ"},
{id:'uzun',easy:5,m3:17,m4:17,bridge:17,long:11,fill:FILL_LETTERS},
{id:'ritim',easy:9,m3:30,m4:9,bridge:10,long:6,fill:"AAAAAAAAABCCÇDDEEEEEEEEEGHHIIIIIİİİİİKKLLLMMMNNNNOOÖPRRRRSSSSŞTTTTUUUÜVYYZ"},
{id:'karma',easy:7,m3:23,m4:14,bridge:13,long:8,fill:"AAAAAAAABCCÇDDEEEEEEEFGHIIIIIİİİİKKKLLLMMMNNNOOÖPRRRRSSSŞTTTUUÜVYYZ"}
]);
const RECENT_FLAVOR_KEY='kd_recent_board_flavors_v446';
function chooseBoardFlavor(){
let recent=[];
try{recent=JSON.parse(safeStorageGet('session',RECENT_FLAVOR_KEY)||'[]');if(!Array.isArray(recent))recent=[];}catch(_){recent=[];}
const blocked=new Set(recent.slice(-2));
const choices=BOARD_FLAVORS.filter(x=>!blocked.has(x.id));
const flavor=choices[Math.floor(Math.random()*choices.length)]||BOARD_FLAVORS[0];
try{recent.push(flavor.id);safeStorageSet('session',RECENT_FLAVOR_KEY,JSON.stringify(recent.slice(-5)));}catch(_){}
return flavor;
}
function shuffledSample(source,count){
const out=[];
const used=new Set();
const n=Math.min(count,source.length);
while(out.length<n){
const idx=Math.floor(Math.random()*source.length);
if(!used.has(idx)){used.add(idx);out.push(source[idx]);}
}
return out;
}
function tryPlaceWord(board,word,requireCross=false){
for(let attempt=0;attempt<55;attempt++){
const dir=BOARD_DIRS[Math.floor(Math.random()*BOARD_DIRS.length)];
const r=Math.floor(Math.random()*BOARD_SIZE),c=Math.floor(Math.random()*BOARD_SIZE);
const er=r+(word.length-1)*dir.dr,ec=c+(word.length-1)*dir.dc;
if(er<0||er>=BOARD_SIZE||ec<0||ec>=BOARD_SIZE)continue;
let crosses=0,ok=true;
for(let i=0;i<word.length;i++){
const rr=r+i*dir.dr,cc=c+i*dir.dc;
const old=board[rr][cc];
if(old&&old!==word[i]){ok=false;break;}
if(old===word[i])crosses++;
}
if(!ok||(requireCross&&crosses===0))continue;
for(let i=0;i<word.length;i++)board[r+i*dir.dr][c+i*dir.dc]=word[i];
return true;
}
return false;
}
function makeCandidateBoard(flavor=BOARD_FLAVORS[1]){
const board=Array.from({length:BOARD_SIZE},()=>Array(BOARD_SIZE).fill(''));
const bridgeSeeds=shuffledSample(BOARD_POOLS.bridge5,52);
const medium3Seeds=shuffledSample(BOARD_POOLS.medium3,180);
const medium4Seeds=shuffledSample(BOARD_POOLS.medium4,160);
const easySeeds=shuffledSample(BOARD_POOLS.easy2,64);
let placedLong=0;
for(const len of[9,8,7,6]){
const candidates=shuffledSample(FRIENDLY_WORDS_BY_LENGTH.get(len)||GAME_WORDS_BY_LENGTH.get(len)||[],12);
for(const word of candidates){
if(tryPlaceWord(board,word,placedLong>=3)){placedLong++;break;}
}
}
const longSeeds=shuffledSample(BOARD_POOLS.hidden69,28);
for(const word of longSeeds){
if(placedLong>=flavor.long)break;
if(tryPlaceWord(board,word,placedLong>=5))placedLong++;
}
let bridgePlaced=0;
for(const word of bridgeSeeds){
if(bridgePlaced>=flavor.bridge)break;
if(tryPlaceWord(board,word,true)||tryPlaceWord(board,word,false))bridgePlaced++;
}
let m4Placed=0;
for(const word of medium4Seeds){
if(m4Placed>=flavor.m4)break;
if(tryPlaceWord(board,word,true)||tryPlaceWord(board,word,false))m4Placed++;
}
let m3Placed=0;
for(const word of medium3Seeds){
if(m3Placed>=flavor.m3)break;
if(tryPlaceWord(board,word,true)||tryPlaceWord(board,word,false))m3Placed++;
}
let easyPlaced=0;
for(const word of easySeeds){
if(easyPlaced>=flavor.easy)break;
if(tryPlaceWord(board,word,false))easyPlaced++;
}
const fill=flavor.fill||FILL_LETTERS;
for(let r=0;r<BOARD_SIZE;r++)for(let c=0;c<BOARD_SIZE;c++){
if(!board[r][c])board[r][c]=fill[Math.floor(Math.random()*fill.length)];
}
return board;
}
function analyzeBoardWords(words){
const stats={easy:0,medium:0,bridge:0,core:0,hidden:0,total:words.length,coverage:0,longVariety:0,initialVariety:0};
const productiveCells=new Set();
const longLengths=new Set();
const initials=new Set();
for(const item of words){
const n=item.word.length;
if(n===2)stats.easy++;
else if(n<=4)stats.medium++;
else if(n===5)stats.bridge++;
if(n>=3&&n<=6)stats.core++;
if(n>=6&&n<=9){stats.hidden++;longLengths.add(n);}
if(n>=3&&item.word)initials.add(item.word[0]);
if(n>=2&&n<=6&&Array.isArray(item.path)){
for(const p of item.path)productiveCells.add(`${p.r},${p.c}`);
}
}
stats.coverage=productiveCells.size;
stats.longVariety=longLengths.size;
stats.initialVariety=initials.size;
const b=BOARD_BALANCE;
const accepted=stats.easy>=b.easyMin&&stats.easy<=b.easyMax&&
stats.medium>=b.mediumMin&&stats.bridge>=b.bridgeMin&&stats.core>=b.coreMin&&
stats.hidden>=b.hiddenMin&&stats.hidden<=b.hiddenMax&&stats.total>=b.totalMin&&stats.coverage>=b.coverageMin&&
stats.longVariety>=b.longVarietyMin&&stats.initialVariety>=b.initialVarietyMin;
const closeness=(v,ideal,weight)=>Math.min(v,ideal)*weight-Math.max(0,v-ideal)*weight*0.18;
let score=closeness(stats.easy,b.easyIdeal,2.2)+closeness(stats.medium,b.mediumIdeal,2.5)+
closeness(stats.bridge,b.bridgeIdeal,2.1)+closeness(stats.core,b.coreIdeal,2.4)+
closeness(stats.hidden,b.hiddenIdeal,3.2)+Math.min(stats.total,b.totalIdeal)*0.30+
closeness(stats.coverage,b.coverageIdeal,2.6)+stats.longVariety*12+stats.initialVariety*2.5;
if(stats.easy>b.easyMax)score-=(stats.easy-b.easyMax)*8;
if(stats.hidden>b.hiddenMax)score-=(stats.hidden-b.hiddenMax)*5;
const easyRatio = stats.total ? stats.easy / stats.total : 0;
if(easyRatio>.28)score-=(easyRatio-.28)*900;
if(!accepted){
score-=Math.max(0,b.easyMin-stats.easy)*6+Math.max(0,stats.easy-b.easyMax)*8+
Math.max(0,b.mediumMin-stats.medium)*5+Math.max(0,b.bridgeMin-stats.bridge)*5+
Math.max(0,b.coreMin-stats.core)*4+Math.max(0,b.hiddenMin-stats.hidden)*12+
Math.max(0,b.totalMin-stats.total)*1.4+Math.max(0,b.coverageMin-stats.coverage)*5+
Math.max(0,b.longVarietyMin-stats.longVariety)*16+Math.max(0,b.initialVarietyMin-stats.initialVariety)*4;
}else score+=1100;
return{stats,accepted,score};
}
let prewarmedBoard=null;
const RECENT_BOARD_KEY='kd_recent_board_profiles_v164_9x9';
function boardSignature(board){
return board.map(row=>row.join('')).join('|');
}
function boardWordProfile(words){
return words.filter(x=>x?.word?.length>=5).sort((a,b)=>b.word.length-a.word.length||a.word.localeCompare(b.word,'tr')).slice(0,28).map(x=>x.word);
}
function getRecentBoardProfiles(){
try{
const x=JSON.parse(safeStorageGet('session',RECENT_BOARD_KEY)||'[]');
return Array.isArray(x)?x.slice(-6):[];
}catch(_){return[];}
}
function boardProfileSimilarity(words,profile){
if(!Array.isArray(profile)||!profile.length)return 0;
const now=new Set(boardWordProfile(words));
let hit=0;for(const w of profile)if(now.has(w))hit++;
return hit / Math.max(1,Math.min(now.size,profile.length));
}
function rememberBoard(board,words=[]){
try{
const list=getRecentBoardProfiles();
list.push(boardWordProfile(words));
safeStorageSet('session',RECENT_BOARD_KEY,JSON.stringify(list.slice(-6)));
}catch(_){}
}
function packBoardResult(board,words){
return{board,words};
}
function generateOptimizedBoard(maxCandidates=3){
let bestBoard=null,bestWords=[],bestEval={score:-Infinity,accepted:false,stats:null};
const recentProfiles=getRecentBoardProfiles();
const flavor=chooseBoardFlavor();
const tries=Math.max(maxCandidates,2);
for(let i=0;i<tries;i++){
const candidate=makeCandidateBoard(flavor);
const solved=solveBoardWords(candidate);
const evaluation=analyzeBoardWords(solved);
let similarity=0;for(const profile of recentProfiles)similarity=Math.max(similarity,boardProfileSimilarity(solved,profile));
if(similarity>.48)evaluation.score-=500;else if(similarity>.34)evaluation.score-=180;
if(evaluation.score>bestEval.score){bestBoard=candidate;bestWords=solved;bestEval=evaluation;}
const st=evaluation.stats;
if(evaluation.accepted&&st.easy<=BOARD_BALANCE.easyMax&&
st.medium>=BOARD_BALANCE.mediumIdeal&&st.core>=BOARD_BALANCE.coreIdeal&&
st.hidden>=BOARD_BALANCE.hiddenIdeal&&st.hidden<=BOARD_BALANCE.hiddenMax&&
st.total>=BOARD_BALANCE.totalIdeal&&st.coverage>=BOARD_BALANCE.coverageIdeal&&
st.longVariety>=4&&st.initialVariety>=BOARD_BALANCE.initialVarietyMin)break;
}
const board=bestBoard||makeCandidateBoard(flavor);
const words=bestWords.length?bestWords:solveBoardWords(board);
return packBoardResult(board,words);
}
function scheduleBoardPrewarm(){
if(!wordDataReady)return;
const work=()=>{
if(prewarmedBoard||!wordDataReady)return;
prewarmedBoard=generateOptimizedBoard(2);
};
if('requestIdleCallback' in window)requestIdleCallback(work,{timeout:1200});
else setTimeout(work,80);
}
function takeDistinctNextBoard(currentBoard,maxAttempts=5){
const currentSig=Array.isArray(currentBoard)&&currentBoard.length===BOARD_SIZE?boardSignature(currentBoard):'';
let candidate=prewarmedBoard;prewarmedBoard=null;
if(candidate&&boardSignature(candidate.board)!==currentSig)return candidate;
for(let i=0;i<maxAttempts;i++){
const next=generateOptimizedBoard(i<2?2:3);
if(boardSignature(next.board)!==currentSig)return next;
}
let next=generateOptimizedBoard(3);
if(boardSignature(next.board)===currentSig){
next={...next,board:next.board.map(row=>row.slice())};
const a=next.board[0][0],b=next.board[0][1];
next.board[0][0]=b;next.board[0][1]=a;
if(a===b){next.board[0][0]=next.board[1][0];next.board[1][0]=a;}
}
return next;
}
function resetMultiplayerRoundVisualState(){
clearTimeUpPreview();
mpLastResultRenderSig='';
resetRewardFx();
try{clearPath();}catch(_){selectedPath.length=0;selectedFlags.fill(0);}
selectedFlags.fill(0);
pendingPointer=null;lastPointerX=null;lastPointerY=null;
if(pointerFrame){cancelAnimationFrame(pointerFrame);pointerFrame=0;}
if(hoverLiftCell){hoverLiftCell.classList.remove('tile-hover-lift');hoverLiftCell=null;}
for(const cell of domCells){
cell?.classList.remove('tile-dragging','tile-dragging-p1','tile-dragging-p2','tile-claimed-p1','tile-claimed-p2','tile-hover-lift','tile-hover-p1','tile-hover-p2','remote-word-flash-p1','remote-word-flash-p2');
}
remainingSeconds=60;
p1Score=0;p2Score=0;updateScores();
const timer=document.getElementById('game-timer');if(timer)timer.textContent='60';
resetMatchWordResults();resetSeriesWordResults();
sessionFoundWords.clear();mpFoundWords.host.clear();mpFoundWords.guest.clear();mpSeenWordEvents.clear();
const ticker=document.getElementById('words-ticker');if(ticker)ticker.replaceChildren();
if(selectedWordPreviewEl){for(const pv of previewTiles)pv.tile.hidden=true;}
setSelectedPreviewState('neutral');
}
function paintBoardCells(board){
const container=document.getElementById('scrabble-grid');
if(!container)return false;
let html='';
for(let r=0;r<BOARD_SIZE;r++)for(let c=0;c<BOARD_SIZE;c++){
const char=board[r][c],score=TILE_SCORES[char]||1;
html+=`<div class="letter-cell" id="cell-${r}-${c}"><span>${char}</span><span class="tile-score">${score}</span></div>`;
}
container.innerHTML=html;
domCells=Array.from(container.children);
hoverGridRect=null;activeGridRect=null;hoverGridMetrics=null;activeGridMetrics=null;
return true;
}
function buildGrid(){
let ready=null;
try{
if(prewarmedBoard&&Array.isArray(prewarmedBoard.board)&&prewarmedBoard.board.length===BOARD_SIZE){
ready=prewarmedBoard;
}else{
ready=generateOptimizedBoard(3);
}
}catch(err){
console.error('Optimized board generation failed',err);
}
prewarmedBoard=null;
if(!ready||!Array.isArray(ready.board)||ready.board.length!==BOARD_SIZE){
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
if(!paintBoardCells(gridBoard))throw new Error('board-paint-failed');
}
function renderProvidedBoard(board){
const container=document.getElementById('scrabble-grid');
if(!container)throw new Error('scrabble-grid bulunamadı');
const valid=Array.isArray(board)&&board.length===BOARD_SIZE&&
board.every(row=>Array.isArray(row)&&row.length===BOARD_SIZE);
if(!valid){
console.error('Geçersiz multiplayer tahtası:',board);
showToast('Oyun tahtası yüklenemedi. Oda yeniden senkronize ediliyor.','rose');
return false;
}
clearPath();
gridBoard=board.map(row=>row.map(ch=>String(ch||'').toLocaleUpperCase('tr-TR')));
boardFoundWords = []; // Çoklu oyunda bot yok; pahalı tam-tahta çözümü gereksiz.
paintBoardCells(gridBoard);
syncWordDisplay();
return true;
}
function hydrateMultiplayerBoardState(d){
if(!d||!d.words||!domCells.length)return;
const entries=Object.entries(d.words);
for(const[key,ev]of entries){
if(!ev)continue;
const activeRound=Number(d.round||mpRoomData?.round||1);
const eventRound=Number(ev.round||1);
if(eventRound!==activeRound)continue;
const word=String(ev.word||'').toLocaleUpperCase('tr-TR');
if(!word)continue;
mpFoundWords.host.add(word);
mpFoundWords.guest.add(word);
sessionFoundWords.add(word);
{const remotePath=decodeClaimPath(ev.path);if(remotePath.length)applyClaimedPath(remotePath,ev.role==='host');}
if(!mpSeenWordEvents.has(key)){
mpSeenWordEvents.add(key);
addTickerBadge(word,ev.role==='host');
}
}
}
const gridEl=document.getElementById('scrabble-grid');
let activeGridRect=null;
let activeGridMetrics=null;
let hoverGridRect=null;
let hoverGridMetrics=null;
let pendingPointer=null;
let pointerFrame=0;
let hoverLiftCell=null;
let lastPointerX=null,lastPointerY=null;
const selectedFlags=new Uint8Array(BOARD_SIZE*BOARD_SIZE);
const selectedWordPreviewEl=document.getElementById('selected-word-preview');
const selectedPreviewBarEl=document.getElementById('selected-preview-bar');
const selectedPreviewStatusEl=document.getElementById('selected-preview-status');
let selectedPreviewVisualState='neutral';
const previewTiles=[];
function setSelectedPreviewState(state='neutral'){
if(!selectedPreviewBarEl)return;
const statusText=state==='valid'?'(SÖZLÜKTE VAR)':(state==='invalid'?'(SÖZLÜKTE YOK)':'');
if(state===selectedPreviewVisualState&&selectedPreviewStatusEl?.textContent===statusText)return;
selectedPreviewVisualState=state;
selectedPreviewBarEl.classList.remove('preview-invalid','preview-valid');
if(state==='valid')selectedPreviewBarEl.classList.add('preview-valid');
else if(state==='invalid')selectedPreviewBarEl.classList.add('preview-invalid');
if(selectedPreviewStatusEl)selectedPreviewStatusEl.textContent=statusText;
}
function ensurePreviewTiles(){
if(!selectedWordPreviewEl)return;
if(!previewTiles.length){
const frag=document.createDocumentFragment();
for(let i=0;i<9;i++){
const tile=document.createElement('div');tile.className='letter-cell selected-preview-tile';tile.hidden=true;
const letter=document.createElement('span');
const score=document.createElement('span');score.className='tile-score';
tile.append(letter,score);frag.appendChild(tile);previewTiles.push({tile,letter,score});
}
selectedWordPreviewEl.replaceChildren(frag);
return;
}
if(previewTiles[0]?.tile?.parentNode!==selectedWordPreviewEl){
const frag=document.createDocumentFragment();
for(const pv of previewTiles)frag.appendChild(pv.tile);
selectedWordPreviewEl.replaceChildren(frag);
}
}
ensurePreviewTiles();
function measureGrid(){
const rect=gridEl.getBoundingClientRect();
const cs=getComputedStyle(gridEl);
const px=v=>Number.parseFloat(v)||0;
const padL=px(cs.paddingLeft),padR=px(cs.paddingRight),padT=px(cs.paddingTop),padB=px(cs.paddingBottom);
const gapX=px(cs.columnGap),gapY=px(cs.rowGap);
const innerW=Math.max(1,rect.width-padL-padR-gapX*(BOARD_SIZE-1));
const innerH=Math.max(1,rect.height-padT-padB-gapY*(BOARD_SIZE-1));
const cellW=innerW/BOARD_SIZE, cellH=innerH/BOARD_SIZE;
return{rect,padL,padT,gapX,gapY,cellW,cellH,stepX:cellW+gapX,stepY:cellH+gapY};
}
function pointToCell(clientX,clientY,metrics){
if(!metrics)metrics=measureGrid();
const{rect,padL,padT,stepX,stepY}=metrics;
if(clientX<rect.left||clientX>rect.right||clientY<rect.top||clientY>rect.bottom)return null;
const x=clientX-rect.left-padL,y=clientY-rect.top-padT;
const col=Math.max(0,Math.min(BOARD_SIZE-1,Math.round((x-metrics.cellW/2)/stepX)));
const row=Math.max(0,Math.min(BOARD_SIZE-1,Math.round((y-metrics.cellH/2)/stepY)));
return{row,col};
}
function invalidateGridMetrics(){hoverGridRect=null;hoverGridMetrics=null;activeGridRect=null;activeGridMetrics=null;}
const refreshGridRect=()=>{hoverGridMetrics=measureGrid();hoverGridRect=hoverGridMetrics.rect;};
gridEl.addEventListener('pointerenter',refreshGridRect,{passive:true});
window.addEventListener('resize',invalidateGridMetrics,{passive:true});
if('ResizeObserver' in window){new ResizeObserver(invalidateGridMetrics).observe(gridEl);}
let lastHoverCell=-1;
gridEl.addEventListener('pointermove',(e)=>{
if(e.pointerType==='touch'||isPointerDown)return;
const metrics=hoverGridMetrics||(hoverGridMetrics=measureGrid());hoverGridRect=metrics.rect;
const pos=pointToCell(e.clientX,e.clientY,metrics);if(!pos)return;
const idx=pos.row*BOARD_SIZE+pos.col;
if(idx===lastHoverCell||!domCells[idx])return;
lastHoverCell=idx;
const cell=domCells[idx];
if(hoverLiftCell&&hoverLiftCell!==cell)hoverLiftCell.classList.remove('tile-hover-p1','tile-hover-p2');
hoverLiftCell=cell;
const hoveringAsP1=mpRole==='guest'?false:(mpRole==='host'?true:(chosenAvatarId==='av_1'));
cell.classList.remove('tile-hover-p1','tile-hover-p2');
cell.classList.add(hoveringAsP1?'tile-hover-p1':'tile-hover-p2');
},{passive:true});
gridEl.addEventListener('pointerleave',()=>{
lastHoverCell=-1;hoverGridRect=null;hoverGridMetrics=null;
if(hoverLiftCell)hoverLiftCell.classList.remove('tile-hover-p1','tile-hover-p2');hoverLiftCell=null;
},{passive:true});
gridEl.addEventListener('pointerdown',(e)=>{
if(!isMatchActive&&mpRole&&mpState===MP_STATES.PLAYING)isMatchActive=true;
if(!isMatchActive)return;
e.preventDefault();
ensureGameAudio();
isPointerDown=true;
pointerHoldStartedAt=performance.now();
activePointerId=e.pointerId;
clearTimeout(pointerHoldTimer);
pointerHoldTimer=setTimeout(()=>{
if(!isPointerDown)return;
isPointerDown=false;pointerHoldStartedAt=0;pendingPointer=null;activeGridRect=null;activeGridMetrics=null;
lastPointerX=null;lastPointerY=null;
if(pointerFrame){cancelAnimationFrame(pointerFrame);pointerFrame=0;}
gridEl.classList.remove('is-grabbing');clearPath();
try{if(activePointerId!==null)gridEl.releasePointerCapture(activePointerId);}catch(_){}
activePointerId=null;
},HOLD_CANCEL_MS);
activeGridMetrics=hoverGridMetrics||measureGrid();
activeGridRect=activeGridMetrics.rect;hoverGridMetrics=activeGridMetrics;hoverGridRect=activeGridRect;
gridEl.classList.add('is-grabbing');
try{gridEl.setPointerCapture(e.pointerId);}catch(_){}
clearPath();
processPointerAt(e.clientX,e.clientY,activeGridMetrics);
lastPointerX=e.clientX;lastPointerY=e.clientY;
},{passive:false});
gridEl.addEventListener('pointermove',(e)=>{
if(!isMatchActive||!isPointerDown)return;
const fullscreenFine=!IS_COARSE_POINTER&&isFullscreenActive();
if(!fullscreenFine){
const samples=typeof e.getCoalescedEvents==='function'?e.getCoalescedEvents():null;
if(samples&&samples.length>1){
const step=Math.max(1,Math.ceil(samples.length/4));
for(let i=0;i<samples.length;i+=step){const sample=samples[i];processPointerSegment(sample.clientX,sample.clientY,activeGridMetrics);}
const last=samples[samples.length-1];processPointerSegment(last.clientX,last.clientY,activeGridMetrics);
}
}
pendingPointer={x:e.clientX,y:e.clientY};
if(pointerFrame)return;
pointerFrame=requestAnimationFrame(()=>{
pointerFrame=0;if(!pendingPointer||!isPointerDown)return;
const p=pendingPointer;pendingPointer=null;processPointerSegment(p.x,p.y,activeGridMetrics);
});
},{passive:true});
const finishPointer=(e,shouldSubmit=true)=>{
if(!isPointerDown)return;
clearTimeout(pointerHoldTimer);pointerHoldTimer=null;
const heldMs=pointerHoldStartedAt?(performance.now()-pointerHoldStartedAt):0;
const cancelForLongHold=shouldSubmit&&heldMs>=HOLD_CANCEL_MS;
if(shouldSubmit&&!cancelForLongHold&&activeGridMetrics)processPointerAt(e.clientX,e.clientY,activeGridMetrics);
isPointerDown=false;pointerHoldStartedAt=0;pendingPointer=null;activeGridRect=null;activeGridMetrics=null;
lastPointerX=null;lastPointerY=null;
if(pointerFrame){cancelAnimationFrame(pointerFrame);pointerFrame=0;}
gridEl.classList.remove('is-grabbing');
try{gridEl.releasePointerCapture(e.pointerId);}catch(err){}
activePointerId=null;
if(cancelForLongHold){clearPath();return;}
if(shouldSubmit&&selectedPath.length){
const lastCell=selectedPath[selectedPath.length-1]?.el||null;
const rr=lastCell?.getBoundingClientRect?.();
const submitOrigin=(rr&&rr.width&&rr.height)?{x:rr.left+rr.width/2,y:rr.top+rr.height/2}:null;
submitWord(submitOrigin);
}else clearPath();
};
gridEl.addEventListener('pointerup',(e)=>finishPointer(e,true),{passive:true});
gridEl.addEventListener('pointercancel',(e)=>finishPointer(e,false),{passive:true});
function processPointerSegment(clientX,clientY,metrics=activeGridMetrics){
if(lastPointerX===null||lastPointerY===null){processPointerAt(clientX,clientY,metrics);lastPointerX=clientX;lastPointerY=clientY;return;}
const dx=clientX-lastPointerX,dy=clientY-lastPointerY;
const cellPx=metrics?Math.min(metrics.cellW,metrics.cellH):40;
const finePointer=!IS_COARSE_POINTER;
const fullscreenFine=finePointer&&isFullscreenActive();
const maxSteps=fullscreenFine?3:(finePointer?5:10);
const stepDivisor=fullscreenFine?Math.max(10,cellPx*.72):(finePointer?Math.max(8,cellPx*.56):Math.max(6.5,cellPx*.38));
const steps=Math.min(maxSteps,Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/stepDivisor)));
for(let i=1;i<=steps;i++) processPointerAt(lastPointerX+dx*i/steps,lastPointerY+dy*i/steps,metrics);
lastPointerX=clientX;lastPointerY=clientY;
}
function processPointerAt(clientX,clientY,metrics=activeGridMetrics){
const pos=pointToCell(clientX,clientY,metrics||hoverGridMetrics||measureGrid());
if(!pos)return;const{row,col}=pos;
if(selectedPath.length>=2){
const prev=selectedPath[selectedPath.length-2];
if(prev.r===row&&prev.c===col){
const removed=selectedPath.pop();selectedFlags[removed.r*BOARD_SIZE+removed.c]=0;
removed.el.classList.remove('tile-dragging','tile-dragging-p1','tile-dragging-p2');syncWordDisplay();return;
}
}
if(isNeighbor(row,col)){const cell=domCells[row*BOARD_SIZE+col];addCellToPath(row,col,cell);}
}
function isNeighbor(r,c){
if(selectedPath.length===0)return true;
const last=selectedPath[selectedPath.length-1];
const dr=Math.abs(last.r-r);
const dc=Math.abs(last.c-c);
return(dr+dc===1)&&!selectedFlags[r*BOARD_SIZE+c];
}
function addCellToPath(r,c,cell){
selectedPath.push({r,c,char:gridBoard[r][c],el:cell});
selectedFlags[r*BOARD_SIZE+c]=1;
playLetterPickSound(selectedPath.length);
const selectingAsP1=mpRole==='guest'?false:(mpRole==='host'?true:(chosenAvatarId==='av_1'));
cell.classList.remove('tile-dragging-p1','tile-dragging-p2');
cell.classList.add('tile-dragging',selectingAsP1?'tile-dragging-p1':'tile-dragging-p2');
syncWordDisplay();
}
function clearPath(){
selectedPath.forEach(p=>p.el.classList.remove('tile-dragging','tile-dragging-p1','tile-dragging-p2'));
selectedPath.length=0;
selectedFlags.fill(0);
syncWordDisplay();
}
function syncWordDisplay(){
ensurePreviewTiles();
let word='';
for(let i=0;i<selectedPath.length;i++){
const p=selectedPath[i];word+=p.char;
const pv=previewTiles[i];if(pv){pv.letter.textContent=p.char;pv.score.textContent=String(TILE_SCORE_CACHE[p.char]||1);pv.tile.hidden=false;}
}
for(let i=selectedPath.length;i<previewTiles.length;i++)previewTiles[i].tile.hidden=true;
let state='neutral';
if(word.length>=1){
const valid=word.length>=2&&!isArgoWord(word)&&GAME_WORD_SET.has(word);
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
if(document.hidden)return;
const side=isP1?'p1':'p2';
const now=performance.now();
const state=kdComboState[side];
state.count=(now-state.last<=2600)?state.count+1:1;
state.last=now;
const score=document.getElementById(isP1?'p1-score-chip':'p2-score-chip');
const avatar=document.getElementById(isP1?'p1-avatar-box':'p2-avatar-box');
restartFxClass(score,'kd-score-pop');
restartFxClass(avatar,'kd-avatar-ring');
if(state.count>=2&&score){
const r=score.getBoundingClientRect();
const el=document.createElement('div');el.className='kd-combo-pop';el.textContent=`x${Math.min(state.count,9)}COMBO`;
el.style.left=(r.left+r.width/2)+'px';el.style.top=Math.max(8,r.top-2)+'px';
document.body.appendChild(el);setTimeout(()=>el.remove(),620);
}
}
function breakCombo(isP1){const st=kdComboState[isP1?'p1':'p2'];st.count=0;st.last=0;}
async function submitWord(submitOrigin=null){
if(!isMatchActive||selectedPath.length===0)return;
const word=selectedPath.map(p=>p.char).join('');
const pts=word.split('').reduce((sum,ch)=>sum+(TILE_SCORE_CACHE[ch]||1),0);
const isP1=mpRole?(mpRole==='host'):(chosenAvatarId==='av_1');
let scoreFxOrigin=(submitOrigin&&Number.isFinite(submitOrigin.x)&&Number.isFinite(submitOrigin.y))?submitOrigin:null;
if(!scoreFxOrigin){
const scoreFxLastEl=selectedPath[selectedPath.length-1]?.el||null;
const scoreFxLastRect=scoreFxLastEl?.getBoundingClientRect?.();
if(scoreFxLastRect&&scoreFxLastRect.width&&scoreFxLastRect.height){
scoreFxOrigin={x:scoreFxLastRect.left+scoreFxLastRect.width/2,y:scoreFxLastRect.top+scoreFxLastRect.height/2};
}
}
if(word.length<2){
clearPath();
return;
}
if(isArgoWord(word)){
playErrorBuzzer();
flashWordFeedback(false);
breakCombo(isP1);
showToast(`${word} (-3) ARGO/KÜFÜR`, 'rose');
adjustScore(isP1?-3:0,!isP1?-3:0);
clearPath();
return;
}
if(!GAME_WORD_SET.has(word)){
playErrorBuzzer();
flashWordFeedback(false);
breakCombo(isP1);
showToast(`${word}(-3)Geçersiz!`,'rose');
adjustScore(isP1?-3:0,!isP1?-3:0);
clearPath();
return;
}
if(mpRole){
const normalizedWord=word.toLocaleUpperCase('tr-TR');
const wordKey = encodeURIComponent(normalizedWord).replace(/\./g, '%2E');
const claimRef=mpRoomRef.child('words').child(wordKey);
try{
const nextOwnScore=Math.max(0,getLocalMpScore()+pts);
const tx=await claimRef.transaction(current=>{
if(current!==null)return;
return{
word:normalizedWord,role:mpRole,pts:pts,
round:Number(mpRoomData?.round||1),
path:encodeClaimPath(selectedPath),
last:selectedPath.length?{r:selectedPath[selectedPath.length-1].r,c:selectedPath[selectedPath.length-1].c}:null,
at:firebase.database.ServerValue.TIMESTAMP
};
},undefined,false);
if(tx.committed){
mpWordScoreCommitted=nextOwnScore;
mpRoomRef.child('scores/'+mpRole).set(nextOwnScore).then(()=>{mpLastConfirmedOwnScore=nextOwnScore;}).catch(()=>{scheduleMpScoreSync();});
}
if(!tx.committed){
showToast(`${word}(DAHA ÖNCE BULUNDU)`,'rose',1500);
clearPath();
return;
}
}catch(err){
showToast('Senkronizasyon kontrol ediliyor, tekrar dene.','rose');
clearPath();
return;
}
}else if(sessionFoundWords.has(word)){
showToast(`${word}(DAHA ÖNCE BULUNDU)`,'rose',1500);
clearPath();
return;
}
if(mpRole){
mpFoundWords.host.add(word);
mpFoundWords.guest.add(word);
}else sessionFoundWords.add(word);
recordMatchWord(word,pts,isP1);
playCorrectChime();
flashWordFeedback(true);
showToast(`${word}(+${pts})`,isP1?'amber':'sky');
playWordConfetti(word.length);
selectedPath.forEach(p=>{
p.el.classList.add(isP1?'tile-claimed-p1':'tile-claimed-p2');
});
addTickerBadge(word,isP1);
flyScore(pts,isP1,scoreFxOrigin);
rewardWordFx(isP1);
adjustScore(isP1?pts:0,!isP1?pts:0);
clearPath();
}
function applyClaimedPath(path,isP1){
path.forEach(pos=>{
const el=domCells[pos.r*BOARD_SIZE+pos.c];
if(!el)return;
el.classList.add(isP1?'tile-claimed-p1':'tile-claimed-p2');
});
}
function flashOpponentWord(path,isP1,badge=null){
if(document.hidden||!Array.isArray(path)||!path.length)return;
const cls=isP1?'remote-word-flash-p1':'remote-word-flash-p2';
for(const pos of path){
const el=domCells[pos.r*BOARD_SIZE+pos.c]||document.getElementById(`cell-${pos.r}-${pos.c}`);
if(!el)continue;
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
function flyScore(pts,isP1,originPoint=null){
if(document.hidden)return;
const target=document.getElementById(isP1?'p1-score-chip':'p2-score-chip')||document.getElementById(isP1?'p1-score-val':'p2-score-val');
if(!target)return;
const tr=target.getBoundingClientRect();
const el=document.createElement('div');el.className='score-fly';el.textContent=`+${pts}`;
el.style.color=isP1?'#fbbf24':'#38bdf8';
const gridRect=document.getElementById('scrabble-grid')?.getBoundingClientRect?.();
const validOrigin=originPoint&&Number.isFinite(originPoint.x)&&Number.isFinite(originPoint.y);
const cx=validOrigin ? originPoint.x : (gridRect?gridRect.left+gridRect.width/2:innerWidth/2);
const cy=validOrigin ? originPoint.y : (gridRect?gridRect.top+gridRect.height/2:Math.min(innerHeight*.38,innerHeight-120));
el.style.left=cx+'px';el.style.top=cy+'px';
el.style.transform='translate3d(-50%,-50%,0) scale(.9)';
document.body.appendChild(el);
const er=el.getBoundingClientRect();
const startCx=er.left+er.width/2,startCy=er.top+er.height/2;
el.style.setProperty('--dx',(tr.left+tr.width/2-startCx)+'px');
el.style.setProperty('--dy',(tr.top+tr.height/2-startCy)+'px');
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
function adjustScore(p1Delta,p2Delta){
p1Score=Math.max(0,p1Score+p1Delta);
p2Score=Math.max(0,p2Score+p2Delta);
updateScores();
if(mpRole){
const delta=mpRole==='host'?Number(p1Delta||0):Number(p2Delta||0);
if(delta){
const own=getLocalMpScore();
if(mpWordScoreCommitted!==null&&own===mpWordScoreCommitted){mpLastConfirmedOwnScore=own;mpWordScoreCommitted=null;}
else scheduleMpScoreSync();
}
}
}
function updateScores(){
document.getElementById('p1-score-val').textContent=p1Score;
document.getElementById('p2-score-val').textContent=p2Score;
}
function addTickerBadge(word,isP1){
const ticker=document.getElementById('words-ticker');
if(!ticker)return null;
while(ticker.children.length>=36)ticker.firstElementChild?.remove();
const badge=document.createElement('button');
badge.type='button';
badge.className=`${isP1?'bg-amber-400':'bg-sky-400'} found-word-badge text-slate-950 font-black rounded-full uppercase mx-0.5`;
badge.textContent=word;
badge.title=`${word}sözcüğünün anlamını göster`;
badge.setAttribute('aria-label',`${word}sözcüğünün anlamını göster`);
badge.addEventListener('click',(ev)=>{ev.preventDefault();ev.stopPropagation();openFoundWordMeaning(word);});
ticker.appendChild(badge);
requestAnimationFrame(()=>{ticker.scrollLeft=Math.max(0,ticker.scrollWidth-ticker.clientWidth);});
return badge;
}
function getChallengeShareData(){
const p1=Number(document.getElementById('final-score-val-p1')?.textContent||0);
const p2=Number(document.getElementById('final-score-val-p2')?.textContent||0);
const myScore=mpRole==='guest'?p2:p1;
const ownWords=mpRole==='guest'?Array.from(roundWordResults.p2.values()):Array.from(roundWordResults.p1.values());
const longest=ownWords.reduce((best,x)=>String(x?.word||'').length>String(best||'').length?String(x.word):best,'');
const scoreLine=myScore>0?`KAPMACA'da ${myScore} puan yaptım!`:`KAPMACA'da kapışmaya var mısın?`;
const longestLine=longest?` En uzun sözcüğüm:${longest}(${longest.length}harf).`:'';
return{title:'KAPMACA - Sözcük Avı',text:`🔥 ${scoreLine}${longestLine}60 saniyede beni geçebilir misin?`,url:location.origin+location.pathname};
}
function showToast(msg,color,duration=1600){
const toast=document.createElement('div');
toast.className = `floating-toast px-3 py-1 rounded-full text-xs font-black shadow-lg ${
                color === 'rose' ? 'bg-rose-600 text-white' : color === 'amber' ? 'bg-amber-400 text-slate-950' : 'bg-sky-400 text-slate-950'
            }`;
toast.textContent=msg;
document.getElementById('toast-layer').appendChild(toast);
setTimeout(()=>toast.remove(),Math.max(400,Number(duration)||1600));
}
function startTimer(){
clearInterval(timerInterval);
lastHeartbeatSecond=null;
lastGongSecond=null;
timerInterval=setInterval(()=>{
remainingSeconds--;
updateGameTimerUI(remainingSeconds);
maybeHeartbeat(remainingSeconds);
maybeFinalGong(remainingSeconds);
if(remainingSeconds<=0)endGame();
},1000);
}
const BOARD_SOLVE_CACHE=new Map();
const BOARD_SOLVE_CACHE_LIMIT=8;
function solveBoardWords(board=gridBoard){
const solveKey=Array.isArray(board)&&board.length===BOARD_SIZE?boardSignature(board):'';
if(solveKey&&BOARD_SOLVE_CACHE.has(solveKey))return BOARD_SOLVE_CACHE.get(solveKey);
const found=new Map();
const visited=Array.from({length:BOARD_SIZE},()=>Array(BOARD_SIZE).fill(false));
const deltas=[[-1,0],[0,-1],[0,1],[1,0]];
const MAX_SOLVE_LEN = 9; // 9x9 motoru: oyun ve bot en fazla 9 harf tarar.
const prefixMemo=new Map();
const prefixExists=str=>{
if(prefixMemo.has(str))return prefixMemo.get(str);
const ok=hasWordPrefix(str);prefixMemo.set(str,ok);return ok;
};
function dfs(r,c,curStr,path){
if(!prefixExists(curStr))return;
if(curStr.length>=2&&GAME_WORD_SET.has(curStr)&&!found.has(curStr)){
found.set(curStr,{word:curStr,path:[...path]});
}
if(curStr.length>=MAX_SOLVE_LEN)return;
for(const[dr,dc]of deltas){
const nr=r+dr,nc=c+dc;
if(nr>=0&&nr<BOARD_SIZE&&nc>=0&&nc<BOARD_SIZE&&!visited[nr][nc]){
visited[nr][nc]=true;path.push({r:nr,c:nc});
dfs(nr,nc,curStr+board[nr][nc],path);
path.pop();visited[nr][nc]=false;
}
}
}
for(let r=0;r<BOARD_SIZE;r++)for(let c=0;c<BOARD_SIZE;c++){
visited[r][c]=true;dfs(r,c,board[r][c],[{r,c}]);visited[r][c]=false;
}
const solved=Array.from(found.values());
if(solveKey){
if(BOARD_SOLVE_CACHE.size>=BOARD_SOLVE_CACHE_LIMIT)BOARD_SOLVE_CACHE.delete(BOARD_SOLVE_CACHE.keys().next().value);
BOARD_SOLVE_CACHE.set(solveKey,solved);
}
return solved;
}
const BOT_LEVELS={
easy:{delay:6500,focus:.22,top:8,minLen:2,maxLen:3},
medium:{delay:4200,focus:.50,top:7,minLen:2,maxLen:5},
hard:{delay:2600,focus:.76,top:5,minLen:3,maxLen:6},
expert:{delay:1650,focus:.91,top:3,minLen:4,maxLen:9}
};
let botRankedBoard=null,botRankedWords=[];
function getBotRankedWords(){
if(botRankedBoard!==boardFoundWords){
botRankedBoard=boardFoundWords;
botRankedWords=boardFoundWords.map(item=>({
item,score:item.word.split('').reduce((sum,ch)=>sum+(TILE_SCORE_CACHE[ch]||1),0)
})).sort((a,b)=>b.score-a.score||b.item.word.length-a.item.word.length);
}
return botRankedWords;
}
function planBot(){
if(!isMatchActive)return;
const level=BOT_LEVELS[botDiffLevel]||BOT_LEVELS.easy;
botInterval=setTimeout(()=>{
if(!isMatchActive)return;
const available=getBotRankedWords().filter(({item})=>!sessionFoundWords.has(item.word));
if(available.length>0){
let ranked=available.filter(({item})=>item.word.length>=level.minLen&&item.word.length<=level.maxLen);
if(!ranked.length)ranked=available;
let matchObj;
if(Math.random()<level.focus){
const topCount=Math.min(ranked.length,level.top);
matchObj=ranked[Math.floor(Math.random()*topCount)].item;
}else{
matchObj=ranked[Math.floor(Math.random()*ranked.length)].item;
}
const word=matchObj.word;
const pts=word.split('').reduce((s,c)=>s+(TILE_SCORES[c]||1),0);
const botIsP2=(chosenAvatarId==='av_1');
sessionFoundWords.add(word);
recordMatchWord(word,pts,!botIsP2);
matchObj.path.forEach(pt=>{
const cell=document.getElementById(`cell-${pt.r}-${pt.c}`);
if(cell){
cell.classList.remove('tile-claimed-p1','tile-claimed-p2');
cell.classList.add(botIsP2?'tile-claimed-p2':'tile-claimed-p1');
}
});
let botOrigin=null;
const botLast=matchObj.path?.[matchObj.path.length-1];
if(botLast){const bel=document.getElementById(`cell-${botLast.r}-${botLast.c}`);const br=bel?.getBoundingClientRect?.();if(br&&br.width&&br.height)botOrigin={x:br.left+br.width/2,y:br.top+br.height/2};}
flyScore(pts,!botIsP2,botOrigin);
rewardWordFx(!botIsP2);
adjustScore(botIsP2?0:pts,botIsP2?pts:0);
const botBadge=addTickerBadge(word,!botIsP2);
flashOpponentWord(matchObj.path,!botIsP2,botBadge);
showToast(`${word}(+${pts})`,botIsP2?'sky':'amber');
}
planBot();
},level.delay);
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
try{done?.();}catch(err){console.error('Result screen error',err);document.getElementById('modal-gameover')?.classList.remove('hidden');}
},1000);
}
const resultPreviewDoneKeys=new Set();
let winnerWaterfallTimer=null,grandCelebrationInterval=null,grandCelebrationTimeouts=[];
function stopGrandCelebrationFx(){
if(grandCelebrationInterval){clearInterval(grandCelebrationInterval);grandCelebrationInterval=null;}
for(const t of grandCelebrationTimeouts.splice(0))clearTimeout(t);
}
function stopWinnerConfettiWaterfall(){
if(winnerWaterfallTimer){clearInterval(winnerWaterfallTimer);winnerWaterfallTimer=null;}
}
async function waitUntilRoomFinished(timeoutMs=3500){
if(!mpRoomRef)return false;
const started=Date.now();
while(Date.now()-started<timeoutMs){
try{
const snap=await mpRoomRef.child('gameState/status').once('value');
if(snap.val()==='finished')return true;
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
if(inviteMsg)inviteMsg.classList.add('hidden');
if(num){num.textContent='3';num.style.opacity='1';num.style.transform='scale(1)';}
if(status){status.innerHTML='<span class="sync-check">✓</span> SENKRON HAZIRLANIYOR';status.className='countdown-sync-ok';}
modal?.classList.remove('hidden');
}
async function handlePlayAgain(){
if(activeGameMode==='multi'&&isRandomHumanRoom()){
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
if(activeGameMode!=='multi'){
clearInterval(timerInterval);timerInterval=null;
clearTimeout(botInterval);botInterval=null;
clearInterval(mpClock);mpClock=null;
isMatchActive=false;
document.getElementById('modal-gameover')?.classList.add('hidden');
prepareGame();
return;
}
const btn=document.getElementById('btn-play-again');
if(btn){btn.disabled=true;btn.textContent='YENİ OYUN HAZIRLANIYOR…';}
try{
const finished=await waitUntilRoomFinished();
if(!finished)throw new Error('room-not-finished');
if(!mpRoomRef||!mpRole)throw new Error('room-missing');
const role=mpRole;
const rematchRef=mpRoomRef.child('rematch');
const res=await rematchRef.transaction(current=>{
const r=current||{host:false,guest:false,expiresAt:0,round:Number(mpRoomData?.round||1)};
r[role]=true;
r.expiresAt=0;
r.round=Number(mpRoomData?.round||1);
return r;
});
if(!res.committed)throw new Error('rematch-not-committed');
showImmediateRematchSync();
if(mpRole==='host')hostStartRematch();
}catch(e){
console.error('Rematch request error',e);
if(btn){btn.disabled=false;btn.textContent='YENİDEN OYNA';}
showToast('Yeni oyun başlatılamadı. Tekrar deneyin.','rose');
}
}
function prepareSingleResultScreen(){
const longestBonus=applySingleLongestWordBonus();
const singleActions=document.getElementById('gameover-actions');
if(singleActions){singleActions.classList.remove('hidden');singleActions.style.setProperty('display','grid','important');}
const replayBtn=document.getElementById('btn-play-again');
if(replayBtn){replayBtn.style.removeProperty('display');replayBtn.disabled=false;replayBtn.textContent='YENİDEN OYNA';replayBtn.classList.remove('hidden');}
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
const p1Name=document.getElementById('p1-title').textContent,p2Name=document.getElementById('p2-title').textContent;
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
if(!isMatchActive&&mpRole&&mpState===MP_STATES.FINISHED)return;
isMatchActive=false;
clearInterval(timerInterval);timerInterval=null;
clearTimeout(botInterval);botInterval=null;
updateGameTimerUI(0);
if(mpRoomRef&&mpRole){
markMultiplayerEndReady().catch(e=>console.warn('Final score sync retry needed',e));
if(mpRole==='host'&&mpState===MP_STATES.PLAYING){
clearTimeout(mpEndResolveTimer);
mpEndResolveTimer=setTimeout(()=>{mpEndResolveTimer=null;hostResolveMatchEnd().catch(()=>{});},120);
}else showToast('Maç sonucu senkronize ediliyor…','sky');
return;
}
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
function showRoomExitNotice(message='OYUN SONLANDIRILDI'){
let el=document.getElementById('mp-room-exit-notice');
if(!el){
el=document.createElement('div');
el.id='mp-room-exit-notice';
el.style.cssText='position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.52);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);pointer-events:auto;';
el.innerHTML='<div id="mp-room-exit-notice-text" style="background:#7f1d1d;color:#fff;font-weight:900;font-size:18px;letter-spacing:.06em;padding:16px 24px;border-radius:18px;box-shadow:0 16px 40px rgba(0,0,0,.28)">OYUN SONLANDIRILDI</div>';
document.body.appendChild(el);
}
const txt=el.querySelector('#mp-room-exit-notice-text');if(txt)txt.textContent=message;
el.style.display='flex';
}
function hideRoomExitNotice(){
const el=document.getElementById('mp-room-exit-notice');
if(el)el.style.display='none';
}
async function finishRandomMatchAfterResult(expectedKey='',capturedRef=null,capturedRole=''){
if(expectedKey&&randomResultAutoExitKey!==expectedKey)return;
const ref=capturedRef||mpRoomRef;
const role=capturedRole||mpRole;
if(randomResultAutoExitTimer){clearTimeout(randomResultAutoExitTimer);randomResultAutoExitTimer=null;}
randomResultAutoExitKey='';
setRandomAutoExitNotice(false);
try{await cleanupRandomRoomBeforeReset(ref,role,'random-result-timeout');}catch(_){}
returnToHomeFromMultiplayer();
hideRoomExitNotice();
}
async function exitRandomResultImmediately(){
if(!isRandomHumanRoom())return false;
const ref=mpRoomRef;
const role=mpRole;
if(randomResultAutoExitTimer){clearTimeout(randomResultAutoExitTimer);randomResultAutoExitTimer=null;}
try{await cleanupRandomRoomBeforeReset(ref,role,'random-result-exit');}catch(_){}
returnToHomeFromMultiplayer();
hideRoomExitNotice();
return true;
}
async function handleSynchronizedRoomExit(reason='game-cancelled',sourceRole=''){
if(mpExitHandling)return;
mpExitHandling=true;
const roleAtExit=mpRole;
const initiatedBySelf=!!sourceRole&&sourceRole===roleAtExit;
const randomRoomAtExit=/^random-match-/.test(String(mpRoomMode||''));
clearOpponentDisconnectGrace();
stopWinnerConfettiWaterfall();
clearVictoryPresentation();
isMatchActive=false;
clearInterval(timerInterval);timerInterval=null;
clearInterval(mpClock);mpClock=null;
clearTimeout(botInterval);botInterval=null;
if(pointerFrame){cancelAnimationFrame(pointerFrame);pointerFrame=0;}
isPointerDown=false;pointerHoldStartedAt=0;clearTimeout(pointerHoldTimer);pointerHoldTimer=null;activePointerId=null;pendingPointer=null;activeGridRect=null;activeGridMetrics=null;
try{clearPath();}catch(_){selectedPath=[];}
const presence=mpPresenceRef;
if(presence){
presence.set({online:false,clientId:getClientToken(),at:firebase.database.ServerValue.TIMESTAMP}).catch(()=>{});
}
const exitingRef=mpRoomRef;
const randomResultExit=(reason==='random-result-timeout'||reason==='random-result-exit');
const isAutomaticRandomTimeout=(reason==='random-result-timeout');
const isRandomResultManualExit=(reason==='random-result-exit');
const isManualPlayerExit=(reason==='player-exit');
const forceCloseForDisconnect=reason==='opponent-disconnected';
const shouldDeletePrivate=!!(exitingRef && /^invite-only-/.test(String(mpRoomMode||'')) && (roleAtExit==='host'||forceCloseForDisconnect));
const shouldDeleteRandom=!!(exitingRef&&randomRoomAtExit&&(roleAtExit==='host'||forceCloseForDisconnect));
if(randomResultAutoExitTimer){clearTimeout(randomResultAutoExitTimer);randomResultAutoExitTimer=null;}
if(randomRoomAtExit&&(isAutomaticRandomTimeout||isRandomResultManualExit)){
try{await cleanupRandomRoomBeforeReset(exitingRef,roleAtExit,reason);}catch(_){}
returnToHomeFromMultiplayer();
hideRoomExitNotice();
return;
}
if(randomRoomAtExit&&isManualPlayerExit&&initiatedBySelf){
showRoomExitNotice('OYUN SONLANDIRILDI');
try{await cleanupRandomRoomBeforeReset(exitingRef,roleAtExit,'player-exit');}catch(_){}
await new Promise(r=>setTimeout(r,250));
returnToHomeFromMultiplayer();
hideRoomExitNotice();
return;
}
if(shouldDeletePrivate){ /* v366: private oda fiziksel olarak aşağıda silinir; ek kapalı-oda meta kaydı tutulmaz. */ }
const exitMessage=reason==='opponent-disconnected'
?'RAKİBİN BAĞLANTISI KESİLDİ'
:(reason==='invite-timeout'
?'OYUN SONLANDIRILDI'
:(reason==='player-exit'
?'OYUN SONLANDIRILDI'
:(reason==='rematch-timeout'?'OYUN İPTAL OLDU':'OYUN SONLANDIRILDI')));
if(isManualPlayerExit||!randomResultExit)showRoomExitNotice(exitMessage);
await new Promise(r=>setTimeout(r,isManualPlayerExit?1250:2000));
if(shouldDeletePrivate||shouldDeleteRandom){try{await exitingRef.remove();}catch(_){}}
returnToHomeFromMultiplayer();
hideRoomExitNotice();
}
async function requestSynchronizedRoomExit(reason='game-cancelled'){
if(!mpRoomRef||!mpRole){
return exitCurrentGameToHome();
}
if(mpExitHandling)return;
const ref=mpRoomRef;
const role=mpRole;
const signal={
id:`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`,
at:serverNow(),
by:role,
reason
};
mpLastExitSignalId=signal.id;
const randomImmediate=isRandomHumanRoom()&&['player-exit','random-result-exit','random-result-timeout'].includes(reason);
if(randomImmediate){
await handleSynchronizedRoomExit(reason,role);
return;
}
try{
if(reason==='player-exit')await ref.child('rematch').set({host:false,guest:false,expiresAt:0}).catch(()=>{});
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
clearInterval(timerInterval);timerInterval=null;
clearInterval(mpClock);mpClock=null;
clearTimeout(botInterval);botInterval=null;
if(pointerFrame){cancelAnimationFrame(pointerFrame);pointerFrame=0;}
isPointerDown=false;pointerHoldStartedAt=0;clearTimeout(pointerHoldTimer);pointerHoldTimer=null;activePointerId=null;pendingPointer=null;activeGridRect=null;activeGridMetrics=null;
try{clearPath();}catch(_){selectedPath=[];}
document.getElementById('modal-countdown')?.classList.add('hidden');
document.getElementById('modal-gameover')?.classList.add('hidden');
document.getElementById('modal-rematch-waiting')?.classList.add('hidden');
document.getElementById('modal-mp-waiting')?.classList.add('hidden');
if(activeGameMode==='multi'||mpRole||mpRoomRef){
if(mpPresenceRef){
await mpPresenceRef.set({online:false,clientId:getClientToken(),at:firebase.database.ServerValue.TIMESTAMP}).catch(()=>{});
}
returnToHomeFromMultiplayer();
}else{
activeGameMode='single';
sessionFoundWords.clear();
const ticker=document.getElementById('words-ticker');if(ticker)ticker.innerHTML='';
ensurePreviewTiles();for(const pv of previewTiles){pv.tile.hidden=true;pv.letter.textContent='';pv.score.textContent='';}
setSelectedPreviewState('neutral');
document.getElementById('screen-game')?.classList.add('hidden');
document.getElementById('screen-home')?.classList.remove('hidden');
}
}
document.getElementById('btn-quick-exit')?.addEventListener('click',()=>{
if(activeGameMode==='multi'&&mpRoomRef&&mpRole)requestSynchronizedRoomExit('player-exit');
else exitCurrentGameToHome();
});
document.getElementById('btn-game-exit')?.addEventListener('click',async()=>{
if(activeGameMode!=='multi'&&!mpRoomRef&&!mpRole){
exitCurrentGameToHome();
return;
}
if(isRandomHumanRoom()){
exitRandomResultImmediately();
return;
}
if(mpRoomRef&&mpRole&&isPrivateFriendRoom()&&mpState===MP_STATES.FINISHED){
const ref=mpRoomRef,code=mpRoomCode;
detachMultiplayerListeners();
await closeAndLockPrivateRoom(ref,code,'result-closed');
returnToHomeFromMultiplayer();
return;
}
if(mpRoomRef&&mpRole)requestSynchronizedRoomExit('player-exit');
else returnToHomeFromMultiplayer();
});
const DICT_PAGE_SIZE=140;
const dictSortedLetters=new Set();
let dictCurrentLetter='A';
let dictCurrentQuery='';
let dictVisibleCount=DICT_PAGE_SIZE;
let dictCurrentWords=[];
function openDictionary(){
ensureDictionaryIndex();
renderAlphabetButtons();
dictCurrentLetter='';dictCurrentQuery='';dictVisibleCount=DICT_PAGE_SIZE;
document.getElementById('dict-search-input').value='';
document.getElementById('dict-search-wrap')?.classList.add('hidden');
document.getElementById('dict-search-meaning').classList.add('hidden');
document.getElementById('dict-list-heading')?.classList.add('hidden');
document.getElementById('dict-rules-panel')?.classList.add('hidden');
const initialDictList=document.getElementById('dict-words-list');
initialDictList?.classList.add('hidden');
if(initialDictList)initialDictList.style.display='';
document.getElementById('dict-load-more')?.classList.add('hidden');
updateAlphabetActive();
document.getElementById('modal-dictionary').classList.remove('hidden');
}
document.getElementById('btn-close-dict').onclick=()=>{
clearTimeout(dictSearchTimer);
closeDictionaryMeaning();
document.getElementById('modal-dictionary').classList.add('hidden');
};
function ensureLetterSorted(letter){
if(!letter||dictSortedLetters.has(letter))return;
const bucket=DICT_BY_LETTER?.[letter];
if(bucket)bucket.sort((a,b)=>a.localeCompare(b,'tr'));
dictSortedLetters.add(letter);
}
function renderAlphabetButtons(){
const bar=document.getElementById('alphabet-bar');
if(bar.dataset.ready==='1'){updateAlphabetActive();return;}
const frag=document.createDocumentFragment();
TURKISH_ALPHABET.forEach(l=>{
const btn=document.createElement('button');
btn.className="dict-letter-btn";
btn.textContent=l;
btn.dataset.letter=l;
btn.onclick=()=>{
document.getElementById('dict-search-input').value='';
closeDictionaryMeaning();document.getElementById('dict-search-meaning').classList.add('hidden');
dictCurrentQuery='';dictCurrentLetter=l;dictVisibleCount=DICT_PAGE_SIZE;
renderWordsForLetter(l);
};
frag.appendChild(btn);
});
bar.appendChild(frag);bar.dataset.ready='1';updateAlphabetActive();
}
function updateAlphabetActive(){
document.querySelectorAll('.dict-letter-btn').forEach(b=>b.classList.toggle('dict-letter-active',!dictCurrentQuery&&b.dataset.letter===dictCurrentLetter));
}
function getDictionaryWords(letter,query=''){
if(query){
const q=query.toLocaleUpperCase('tr-TR');
const out=[];
for(const l of TURKISH_ALPHABET){
const bucket=DICT_BY_LETTER[l]||[];
for(const w of bucket)if(w.includes(q))out.push(w);
}
out.sort((a,b)=>(a===q?-1:0)-(b===q?-1:0)||a.localeCompare(b,'tr'));
return out;
}
ensureLetterSorted(letter);
return DICT_BY_LETTER[letter]||[];
}
function closeFoundWordMeaning(){
const modal=document.getElementById('modal-found-meaning');
if(modal)modal.classList.add('hidden');
closeDictionaryMeaning();
}
function openFoundWordMeaning(word){
const modal=document.getElementById('modal-found-meaning');
const title=document.getElementById('found-meaning-word');
const host=document.getElementById('found-meaning-content');
if(!modal||!title||!host)return;
title.textContent=String(word||'').toLocaleUpperCase('tr-TR');
host.textContent='';
modal.classList.remove('hidden');
showDictionaryMeaning(word,host,true);
}
document.getElementById('btn-close-found-meaning')?.addEventListener('click',closeFoundWordMeaning);
document.getElementById('modal-found-meaning')?.addEventListener('click',e=>{if(e.target===e.currentTarget)closeFoundWordMeaning();});
const dictMeaningCache=new Map();
let dictMeaningAbortController=null;
let dictMeaningOpenKey='';
let dictMeaningOpenHost=null;
function normalizeMeaningLookupWord(value){
return String(value||'').toLocaleUpperCase('tr-TR').replaceAll('Â','A').replaceAll('Î','İ').replaceAll('Û','U');
}
function closeDictionaryMeaning(){
if(dictMeaningAbortController){try{dictMeaningAbortController.abort();}catch(_){}dictMeaningAbortController=null;}
if(dictMeaningOpenHost)dictMeaningOpenHost.classList.add('hidden');
dictMeaningOpenKey='';dictMeaningOpenHost=null;
}
function fillInlineMeaning(host,word,meanings,sourceWord=''){
if(!host)return;
host.textContent='';
const title=document.createElement('div');title.className='dict-meaning-title';
title.textContent=sourceWord&&normalizeMeaningLookupWord(sourceWord)!==normalizeMeaningLookupWord(word)?`${word}• TDK:${sourceWord}`:`${word}• anlam`;
host.appendChild(title);
if(!meanings?.length){
const msg=document.createElement('div');msg.textContent='TDK Güncel Türkçe Sözlükte bu yazımla anlam bulunamadı.';host.appendChild(msg);
}else{
meanings.slice(0,6).forEach((meaning,index)=>{
const row=document.createElement('div');row.className='dict-meaning-item';
const num=document.createElement('span');num.className='dict-meaning-num';num.textContent=`${index+1}.`;
const txt=document.createElement('span');txt.textContent=meaning;
row.append(num,txt);host.appendChild(row);
});
}
const note=document.createElement('div');note.className='dict-meaning-note';note.textContent=GEO_DICTIONARY[normalizeMeaningLookupWord(word)]?'KAPMACA Coğrafi Sözlük':'TDK Güncel Türkçe Sözlük • anlamlar çevrim içi sorgulanır.';host.appendChild(note);
host.classList.remove('hidden');
}
async function showDictionaryMeaning(word,host,auto=false){
if(!host)return;
const key=normalizeMeaningLookupWord(word);
if(!auto&&dictMeaningOpenKey===key&&dictMeaningOpenHost===host&&!host.classList.contains('hidden')){closeDictionaryMeaning();return;}
closeDictionaryMeaning();dictMeaningOpenKey=key;dictMeaningOpenHost=host;
if(dictMeaningCache.has(key)){
const cached=dictMeaningCache.get(key);fillInlineMeaning(host,word,cached.meanings,cached.sourceWord);return;
}
if(GEO_DICTIONARY[key]){
const local={meanings:[GEO_DICTIONARY[key]],sourceWord:String(word)};
dictMeaningCache.set(key,local);fillInlineMeaning(host,word,local.meanings,local.sourceWord);return;
}
const controller=new AbortController();dictMeaningAbortController=controller;
host.textContent='';const loading=document.createElement('div');loading.className='dict-meaning-loading';loading.textContent='Anlam getiriliyor…';host.appendChild(loading);host.classList.remove('hidden');
let timedOut=false;
const timeout=setTimeout(()=>{timedOut=true;controller.abort();},7000);
try{
const query=String(word).toLocaleLowerCase('tr-TR');
const response=await fetch(`https://sozluk.gov.tr/gts?ara=${encodeURIComponent(query)}`,{signal:controller.signal,cache:'no-store'});
if(!response.ok)throw new Error(`HTTP ${response.status}`);
const data=await response.json();if(controller.signal.aborted)return;
const rows=Array.isArray(data)?data:[];
const exact=rows.filter(entry=>normalizeMeaningLookupWord(entry?.madde||'')===key);
const chosen=exact.length?exact:rows;
const meanings=[];const seen=new Set();
for(const entry of chosen){
for(const sense of(entry?.anlamlarListe||[])){
const text=String(sense?.anlam||'').trim();
if(text&&!seen.has(text)){seen.add(text);meanings.push(text);}
if(meanings.length>=6)break;
}
if(meanings.length>=6)break;
}
const sourceWord=chosen[0]?.madde||'';
if(meanings.length)dictMeaningCache.set(key,{meanings,sourceWord});
if(dictMeaningOpenKey===key&&dictMeaningOpenHost===host)fillInlineMeaning(host,word,meanings,sourceWord);
}catch(err){
if(controller.signal.aborted&&!timedOut)return;
if(dictMeaningOpenKey===key&&dictMeaningOpenHost===host){host.textContent='';const msg=document.createElement('div');msg.className='dict-meaning-loading';msg.textContent='Anlam şu anda alınamadı. Bağlantıyı kontrol edip tekrar ara veya sözcüğe dokun.';host.appendChild(msg);host.classList.remove('hidden');}
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
const entry=document.createElement('div');entry.className='dict-word-entry';
const button=document.createElement('button');button.type='button';button.className='dict-word-button';button.title=`${w}anlamını göster`;button.setAttribute('aria-expanded','false');
const wordSpan=document.createElement('span');wordSpan.className='dict-word-main';wordSpan.textContent=w;
const pointSpan=document.createElement('span');pointSpan.className='dict-word-points';pointSpan.textContent=`${pts}p`;
const meaning=document.createElement('div');meaning.className='dict-inline-meaning hidden';meaning.setAttribute('aria-live','polite');
button.append(wordSpan,pointSpan);
button.onclick=()=>{const opening=meaning.classList.contains('hidden')||dictMeaningOpenHost!==meaning;showDictionaryMeaning(w,meaning);button.setAttribute('aria-expanded',opening?'true':'false');};
entry.append(button,meaning);frag.appendChild(entry);
}
list.appendChild(frag);
const more=document.getElementById('dict-load-more');
more.classList.toggle('hidden',limit>=dictCurrentWords.length);
more.textContent=`DAHA FAZLA GÖSTER(${dictCurrentWords.length-limit})`;
}
function renderWordsForLetter(letter,query=''){
closeDictionaryMeaning();
dictCurrentLetter=letter||dictCurrentLetter||'A';
dictCurrentQuery=query;
dictCurrentWords=getDictionaryWords(dictCurrentLetter,query);
document.getElementById('dict-search-wrap')?.classList.remove('hidden');
document.getElementById('dict-list-heading')?.classList.remove('hidden');
document.getElementById('dict-rules-panel')?.classList.remove('hidden');
const list=document.getElementById('dict-words-list');
list?.classList.remove('hidden');
if(list)list.style.display='block';
document.getElementById('dict-letter-heading').textContent=query?`"${query}" ARAMA SONUÇLARI`:`"${dictCurrentLetter}" HARFİ KELİMELERİ`;
document.getElementById('dict-word-count').textContent=`${dictCurrentWords.length}Sözcük`;
updateAlphabetActive();
paintDictionaryWords();
}
document.getElementById('dict-load-more').onclick=()=>{dictVisibleCount+=DICT_PAGE_SIZE;paintDictionaryWords();};
let dictSearchTimer=null;
function searchDictionaryInput(){
const q=document.getElementById('dict-search-input').value.trim();
dictVisibleCount=DICT_PAGE_SIZE;
renderWordsForLetter(dictCurrentLetter,q);
const meaning=document.getElementById('dict-search-meaning');
if(q){showDictionaryMeaning(q,meaning,true);}else{closeDictionaryMeaning();meaning.classList.add('hidden');}
}
document.getElementById('dict-search-input').oninput=(e)=>{
clearTimeout(dictSearchTimer);
closeDictionaryMeaning();document.getElementById('dict-search-meaning').classList.add('hidden');
if(!e.target.value.trim()){searchDictionaryInput();return;}
dictSearchTimer=setTimeout(searchDictionaryInput,280);
};
document.getElementById('dict-search-input').onkeydown=e=>{
if(e.key==='Enter'){e.preventDefault();clearTimeout(dictSearchTimer);searchDictionaryInput();}
};
document.getElementById('modal-rematch-waiting')?.classList.add('hidden');
document.getElementById('btn-close-rematch-waiting')?.addEventListener('click',()=>document.getElementById('modal-rematch-waiting')?.classList.add('hidden'));
document.getElementById('btn-rematch-accept')?.addEventListener('click',handlePlayAgain);
document.getElementById('btn-rematch-decline')?.addEventListener('click',()=>document.getElementById('modal-rematch-waiting')?.classList.add('hidden'));
