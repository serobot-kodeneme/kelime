const TILE_SCORES={
'A':2,'B':4,'C':5,'Ç':5,'D':4,'E':2,'F':8,'G':6,'Ğ':9,'H':6,'I':3,
'İ':2,'J':11,'K':2,'L':2,'M':3,'N':2,'O':3,'Ö':8,'P':6,'R':2,'S':3,
'Ş':5,'T':2,'U':3,'Ü':4,'V':8,'Y':4,'Z':5
};
const ARGO_EXACT=new Set(['AM','GÖT','YARAK','TAŞAK','TAŞAKLI','ÇÜK','SİK','SİKME','SİKMEK']);
const ARGO_PREFIXES=['OROSPU','PEZEVENK','KAHPE','İBNE','PUŞT','SÜRTÜK','KALTAK','DALYARAK','PİÇ','SİKTİR','AMCIK','AMINA','YARRAK','GÖTVEREN','SIÇMA','SIÇTIR'];
function isArgoWord(word){
const w=String(word||'').toLocaleUpperCase('tr-TR');
if(ARGO_EXACT.has(w))return true;
for(const root of ARGO_PREFIXES)if(w.startsWith(root))return true;
return w.startsWith('BOK')&&!w.startsWith('BOKS')&&!w.startsWith('BOKSİT');
}
// Symbol-only entries are excluded; genuine Turkish words with the same spelling remain playable.
// Source: IUPAC periodic table; both standard and Turkish uppercase forms.
const ELEMENT_SYMBOLS=Object.freeze('H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' '));
const ELEMENT_SYMBOL_WORDS=new Set(ELEMENT_SYMBOLS.flatMap(symbol=>[symbol.toUpperCase(),symbol.toLocaleUpperCase('tr-TR')]));
const ELEMENT_SYMBOL_TURKISH_WORDS=new Set(['AL','AR','AS','AT','BE','ER','ES','HE','İN','LA','NE','RA','RE','Sİ','TA','TE','Tİ']);
function isElementSymbol(word){const w=String(word||'').trim().toLocaleUpperCase('tr-TR');return ELEMENT_SYMBOL_WORDS.has(w)&&!ELEMENT_SYMBOL_TURKISH_WORDS.has(w);}
const FOREIGN_EXACT=new Set(['ASK','CHANGE','CHAT','RUN','TALK']);
const TURKISH_WORD_CHARS = /^[ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ]+$/;
const COMMON_IMPERATIVE_WORDS=Object.freeze([
'AÇ','AÇIL','AÇMA','AK','AL','AN','ANLA','ARA','ART','AS','AT','ATLA','AYIR',
'BAK','BAS','BAŞLA','BEKLE','BELİRLE','BIRAK','BİL','BİLDİR','BİN','BİTİR','BOYAT','BOZ','BÖL','BUL',
'ÇAĞIR','ÇAL','ÇALIŞ','ÇEK','ÇEVİR','ÇIK','ÇIKAR','ÇİZ','ÇÖZ',
'DAĞIT','DAYAN','DE','DEĞİŞ','DENE','DİNLE','DÖK','DÖN','DÖNDÜR','DUR','DÜŞ','DÜŞÜN',
'EKLE','GEÇ','GEL','GENİŞLET','GETİR','GİR','GİT','GÖNDER','GÖR','GÖSTER','GÖTÜR',
'HATIRLA','HAZIRLA','ISIT','İÇ','İLET','İLERLE','İN','İNDİR','İNCELE','İZLE',
'KAL','KALDIR','KAPAT','KARŞILA','KAT','KAYDET','KAZAN','KES','KIR','KIRP','KISALT','KONUŞ','KORU','KOŞ','KULLAN','KURUT',
'OKU','OL','OYNA','ÖĞREN','ÖLÇ','ÖP',
'PAYLAŞ','PİŞİR',
'SAKLA','SAR','SAY','SEÇ','SEV','SİL','SOR','SOĞUT','SÖYLE','SULAT','SÜR',
'TAK','TAŞI','TOPLA','TUT',
'UÇ','UY','UYAN','UYGULA','UZAT',
'ÜRET',
'VAR','VER','VUR',
'YAK','YAKALA','YAP','YAZ','YERLEŞ','YE','YIK','YÜKLE','YÜRÜ','YÜRÜT',
'ZORLA'
]);

/* v617 — Açıkça doğrulanmış emir kipleri ve yerel anlam güvencesi.
Kökten/ekten otomatik sözcük türetilmez; yalnızca bu tam yazımlar kabul edilir. */
const IMPERATIVE_MEANING_DICTIONARY=Object.freeze({
'İLET':['Bir şeyi bir yerden başka bir yere ulaştırmak.','Bir bilgiyi veya haberi başkasına aktarmak.'],
'SULAT':['Sulama işini yaptırmak; su verilmesini sağlamak.'],
'BOYAT':['Boyama işini yaptırmak; bir şeyin boyanmasını sağlamak.'],
'KURUT':['Islaklığını veya nemini gidererek kuru duruma getirmek.'],
'ISIT':['Sıcaklığını artırmak; sıcak duruma getirmek.'],
'SOĞUT':['Sıcaklığını azaltmak; soğuk veya daha serin duruma getirmek.'],
'UZAT':['Uzunluğunu veya süresini artırmak.','Bir şeyi birine doğru vermek veya erişecek biçimde ileri götürmek.'],
'KISALT':['Uzunluğunu veya süresini azaltmak; daha kısa duruma getirmek.'],
'YÜRÜT':['Yürümesini sağlamak veya bir işi sürdürmek, yönetmek.']
});
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
/* v454 — Kontrollü sözlük genişletme paketi 2.
Günlük ve doğal çekimli fiiller, yaygın çoğullar, nitelikler ve gündelik kavramlar.
Ana sözlükten bağımsız katmandır; tekrarlar Set ile elenir. */
const CURATED_EXPANSION_WORDS_V2=Object.freeze([
'ABARTTI','ABARTIR','AĞLADI','AĞLAR','AĞLAYAN','ANLATTI','ANLATIR','ANLATAN',
'ARINDI','ARINIR','ARTTI','ARTAR','ARTAN','AZALDI','AZALIR','AZALAN',
'BAĞLADI','BAĞLAR','BAĞLAYAN','BAĞIRDI','BAĞIRIR','BAĞIRAN','BAŞARDI','BAŞARIR','BAŞARAN',
'BESLEDİ','BESLER','BESLENEN','BIRAKTI','BIRAKIR','BIRAKAN','BOYADI','BOYAR','BOYANAN',
'ÇARPTI','ÇARPAR','ÇARPAN','ÇEVİRDİ','ÇEVİRİR','ÇEVİREN','ÇÖKTÜ','ÇÖKER','ÇÖKEN',
'DAĞILDI','DAĞILIR','DAĞILAN','DOLDU','DOLAR','DOLAN','DOLDURDU','DOLDURUR',
'DOĞDU','DOĞAR','DOĞAN','DUYDU','DUYAR','DUYAN','DÜZELDİ','DÜZELİR','DÜZELEN',
'ERİDİ','ERİR','ERİYEN','EZDİ','EZER','EZİLEN','FIRLADI','FIRLAR','FIRLATTI',
'GELİŞTİ','GELİŞİR','GİYDİ','GİYER','GİYEN','GÜLDÜ','GÜLER','GÜLEN',
'ISINDI','ISINIR','ISINAN','ISITTI','ISITIR','İSTEDİ','İSTER','İSTEYEN',
'İTTİ','İTER','İTEN','KAÇTI','KAÇAR','KAÇAN','KAPANDI','KAPANIR','KAPANAN',
'KARIŞTI','KARIŞIR','KARIŞAN','KIRILDI','KIRILIR','KIZDI','KIZAR','KIZAN',
'KOKTU','KOKAR','KOKAN','KURDU','KURAR','KURAN','KURUDU','KURUR','KURUYAN',
'OTURDU','OTURUR','OTURAN','ÖDEDİ','ÖDER','ÖDEYEN','ÖPTÜ','ÖPER','ÖPEN',
'PATLADI','PATLAR','PATLAYAN','SALLADI','SALLAR','SALLANAN','SAVUNDU','SAVUNUR','SAVUNAN',
'SIÇRADI','SIÇRAR','SUSTU','SUSAR','SUSAN','ŞAŞIRDI','ŞAŞIRIR','ŞAŞIRAN',
'TANIDI','TANIR','TANIYAN','TARTTI','TARTAR','TARTAN','TAŞTI','TAŞAR','TAŞAN',
'UYARDI','UYARIR','UYARAN','UZADI','UZAR','UZAYAN','ÜŞÜDÜ','ÜŞÜR','ÜŞÜYEN',
'YANDI','YANAR','YANAN','YIKANDI','YIKANIR','YIKANAN','YÜZDÜ','YÜZER','YÜZEN',

'ANNELER','BABALAR','ABLALAR','ABİLER','KARDEŞLER','AİLELER','KOLTUKLAR','DOLAPLAR',
'YATAKLAR','YASTIKLAR','HALILAR','PERDELER','LAMBA','LAMBALAR','KOVALAR','SEPETLER',
'ŞİŞELER','KUTULAR','KAPAKLAR','DUVARLAR','TAVANLAR','BAHÇELER','SOKAKLAR',
'CADDELER','PARKLAR','KÖYLER','KASABALAR','BİNALAR','DÜKKANLAR','MARKETLER','PAZARLAR',
'FABRİKA','OFİSLER','SINIFLAR','SIRALAR','TAHTALAR','KURSLAR','ÖĞRENCİ','HOCALAR',
'UZMANLAR','OYUNCULAR','TAKIMLAR','MAÇLAR','KURALLAR','PUANLAR','TURLAR','RAKİPLER','ZAFERLER',

'ORMANLAR','OVALAR','ADALAR','KAYALAR','TOPRAKLAR','BULUTLAR','YAĞMURLAR','RÜZGARLAR',
'FIRTINA','ŞİMŞEK','GÖKKUŞAĞI','YILDIZLAR','GEZEGEN','GÜNEŞLİ','YAĞMURLU','BULUTLU',
'KARLI','RÜZGARLI','SERİNCE','ILIK','NEMLİ','KURUCA',

'MUTLU','MUTSUZ','SESSİZ','GÜRÜLTÜLÜ','YUMUŞAK','SERTÇE','PARLAKÇA','KARANLIK',
'AYDINLIK','DÜZGÜN','EĞRİ','YUVARLAK','DÜZ','KALIN','İNCELİK','GENİŞ','DAR',
'KISA','UZUN','AĞIR','HAFİF','HAREKETLİ','DURGUN','SAKİNCE','ÖFKELİ','KIZGIN',
'ŞAŞKIN','YORGUN','AÇLIK','TOKLUK','SUSUZ','ISLAK','KURU',

'SEVGİ','SAYGI','GÜVEN','KORKU','KAYGI','HUZUR','ÖZLEM','MERAKLI','DİKKAT','DİKKATLİ',
'BAŞARI','EMEK','ÇÖZÜM','SORUN','SEBEP','NEDENİ','AMAÇ','HEDEF','BİTİŞ','DENEYİM',
'DÜŞÜNCE','ANLAM','ANLATIM','SÖYLEM','SES','RENKLİ','ŞEKİLLİ','KOKU','TAT','DOKU',
'IŞIK','GÖRÜNTÜ','HAREKET','DURUŞ',

'KAHVALTI','ÖĞÜN','YEMEKLER','ÇAYLAR','KAHVELER','MEYVELER','SEBZELER','TATLILAR',
'ÇİKOLATA','BİSKÜVİ','KURABİYE','KÖFTE','BÖREK','DOLMA','SARMA','SALATA','ÇORBALAR',
'PİLAVLAR','EKMEKLER','ZEYTİNLER',

'GÖMLEK','PANTOLON','CEKET','KAZAK','HIRKA','ETEK','ELBİSE','ÇORAP','AYAKKABI','TERLİK',
'ŞAPKA','ELDİVEN','KEMER','DÜĞME','FERMUAR','CEPLER','KIYAFET','GİYSİLER',

'OTOBÜS','MİNİBÜS','TREN','VAPUR','GEMİ','UÇAK','BİSİKLET','TAKSİ','DURAK','İSTASYON',
'BİLET','YOLCU','YOLCULAR','SÜRÜCÜ','ŞOFÖRLER',

'KLAVYE','FARE','YAZICI','KAMERA','KULAKLIK','HOPARLÖR','KABLO','ŞARJ','İNTERNET',
'DOSYA','KLASÖR','BELGE','RESİM','VİDEO','MESAJ','HESAP','PAROLA','KULLANICI'
]);

/* v590 — Yaygın ülke/ulus adları.
2–9 harf oyun sınırına uyan biçimler yerel anlamıyla birlikte kabul edilir. */
const NATIONALITY_DICTIONARY=Object.freeze({
'TÜRK':'Türkiye halkından veya bu halkın soyundan olan kimse.',
'ALMAN':'Almanya halkından olan kimse.',
'FRANSIZ':'Fransa halkından olan kimse.',
'İNGİLİZ':'İngiltere halkından olan kimse.',
'İTALYAN':'İtalya halkından olan kimse.',
'İSPANYOL':'İspanya halkından olan kimse.',
'RUS':'Rusya halkından olan kimse.',
'UKRAYNALI':'Ukrayna halkından olan kimse.',
'POLONYALI':'Polonya halkından olan kimse.',
'JAPON':'Japonya halkından olan kimse.',
'ÇİNLİ':'Çin halkından olan kimse.',
'KORELİ':'Kore halklarından olan kimse.',
'YUNAN':'Yunanistan halkından olan kimse.',
'BULGAR':'Bulgaristan halkından olan kimse.',
'SIRP':'Sırbistan halkından olan kimse.',
'HIRVAT':'Hırvatistan halkından olan kimse.',
'BOŞNAK':'Bosna kökenli Güney Slav halkından olan kimse.',
'ARNAVUT':'Arnavutluk halkından olan kimse.',
'RUMEN':'Romanya halkından olan kimse.',
'MACAR':'Macaristan halkından olan kimse.',
'ÇEK':'Çekya halkından olan kimse.',
'SLOVAK':'Slovakya halkından olan kimse.',
'İSVEÇLİ':'İsveç halkından olan kimse.',
'NORVEÇLİ':'Norveç halkından olan kimse.',
'FİNLİ':'Finlandiya halkından olan kimse.',
'BELÇİKALI':'Belçika halkından olan kimse.',
'İSVİÇRELİ':'İsviçre halkından olan kimse.',
'İRLANDALI':'İrlanda halkından olan kimse.',
'İSKOÇ':'İskoçya halkından olan kimse.',
'AMERİKALI':'Amerika Birleşik Devletleri halkından olan kimse.',
'KANADALI':'Kanada halkından olan kimse.',
'MEKSİKALI':'Meksika halkından olan kimse.',
'ŞİLİLİ':'Şili halkından olan kimse.',
'KÜBALI':'Küba halkından olan kimse.',
'MISIRLI':'Mısır halkından olan kimse.',
'FASLI':'Fas halkından olan kimse.',
'CEZAYİRLİ':'Cezayir halkından olan kimse.',
'TUNUSLU':'Tunus halkından olan kimse.',
'LİBYALI':'Libya halkından olan kimse.',
'ARAP':'Arap halklarından olan kimse.',
'İRANLI':'İran halkından olan kimse.',
'IRAKLI':'Irak halkından olan kimse.',
'SURİYELİ':'Suriye halkından olan kimse.',
'İSRAİLLİ':'İsrail halkından olan kimse.',
'HİNTLİ':'Hindistan halkından olan kimse.',
'AFGAN':'Afganistan halkından olan kimse.',
'KAZAK':'Kazakistan halkından olan kimse.',
'KIRGIZ':'Kırgızistan halkından olan kimse.',
'ÖZBEK':'Özbekistan halkından olan kimse.',
'TÜRKMEN':'Türkmenistan halkından olan kimse.',
'GÜRCÜ':'Gürcistan halkından olan kimse.',
'ERMENİ':'Ermenistan halkından olan kimse.',
'AZERİ':'Azerbaycan halkından olan kimse.',
'MOĞOL':'Moğolistan halkından olan kimse.',
'TAYLANDLI':'Tayland halkından olan kimse.',
'VİETNAMLI':'Vietnam halkından olan kimse.',
'MALEZYALI':'Malezya halkından olan kimse.'
});

/* v591 — Temel günlük Türkçe paketi.
Aile, beden, ev, okul, ulaşım, doğa, renk, duygu ve mesleklerden tartışmasız temel sözcükler. */
const CURATED_EXPANSION_WORDS_V3=Object.freeze([
'ANNE','BABA','ABLA','ABİ','KARDEŞ','AİLE','BEBEK','ÇOCUK','YAŞLI',
'SAÇ','GÖZ','KULAK','BURUN','AĞIZ','DİŞ','DİL','BOĞAZ','KOL','EL','PARMAK','BACAK','DİZ','KALP',
'EV','ODA','MUTFAK','BANYO','SALON','BALKON','ÇATI','DUVAR','TAVAN','PERDE','HALI','YATAK','YASTIK','YORGAN','KOLTUK','DOLAP',
'OKUL','SINIF','DERS','ÖDEV','SINAV','SORU','CEVAP',
'ARABA','KÖPRÜ','SOKAK','CADDE',
'YAĞMUR','KAR','RÜZGAR','BULUT','GÜNEŞ','AY','YILDIZ','DENİZ','GÖL','NEHİR','ORMAN','DAĞ','OVA','ADA',
'KIRMIZI','MAVİ','YEŞİL','SARI','SİYAH','BEYAZ','MOR','PEMBE','TURUNCU','GRİ',
'MUZ','ÜZGÜ','HEKİM','İTFAİYECİ'
]);

/* v617 — Tahta sözcük sıklığı katmanı.
Doğrudan tahta tohumlarında hedef yaklaşık %70 günlük, %20 genel, %10 az bilinen/eğitici Türkçedir.
Sözlükten hiçbir sözcük silinmez; sınıflandırılmamış teknik/terminolojik sözcükler yalnızca yedek havuzda kalır. */
const DAILY_BOARD_PRIORITY_WORDS=new Set([
...COMMON_IMPERATIVE_WORDS,
...Object.keys(IMPERATIVE_MEANING_DICTIONARY),
...CURATED_EXPANSION_WORDS,
...CURATED_EXPANSION_WORDS_V3,
'İLET','SULAT','YÜRÜT','GETİR','BIRAK','KURUT','ISIT','SOĞUT','UZAT','KISALT',
'BARDAK','ÇANTA','PERDE','DURAK','MARKET','KOMŞU','YEMEK','ÇOCUK','SABAH','AKŞAM','YORGUN',
'EV','ODA','KAPI','CAM','MASA','SANDALYE','LAMBA','ŞİŞE','KUTU','KAPAK','KOVA','SEPET',
'ANNE','BABA','ABLA','ABİ','KARDEŞ','AİLE','BEBEK','ARKADAŞ','DOST','KOMŞU',
'OKUL','SINIF','DERS','ÖDEV','SINAV','SORU','CEVAP','KALEM','DEFTER','KİTAP','İŞ','OFİS',
'YOL','SOKAK','CADDE','PARK','KÖY','KASABA','ŞEHİR','ARABA','OTOBÜS','TREN','VAPUR','TAKSİ','BİLET',
'SU','SÜT','ÇAY','KAHVE','EKMEK','PEYNİR','YOĞURT','ÇORBA','PİLAV','MAKARNA','YUMURTA',
'ELMA','ARMUT','ÜZÜM','MUZ','LİMON','DOMATES','BİBER','PATATES','SOĞAN',
'SABAH','ÖĞLE','AKŞAM','GECE','BUGÜN','YARIN','DÜN','ŞİMDİ','SONRA','ÖNCE','HEMEN',
'MUTLU','MUTSUZ','ÜZGÜ','YORGUN','KIZGIN','SAKİN','KORKU','SEVGİ','SAYGI','GÜVEN','ÖZLEM',
'YAĞMUR','KAR','RÜZGAR','BULUT','GÜNEŞ','DENİZ','GÖL','NEHİR','ORMAN','DAĞ','OVA','ADA',
'KEDİ','KÖPEK','KUŞ','BALIK','AĞAÇ','ÇİÇEK','GÜL','ÇAM',
'TELEFON','MESAJ','HESAP','DOSYA','RESİM','VİDEO','İNTERNET'
]);

const GENERAL_BOARD_PRIORITY_WORDS=new Set([
...CURATED_EXPANSION_WORDS_V2,
...Object.keys(NATIONALITY_DICTIONARY)
]);

const RARE_EDUCATIONAL_BOARD_WORDS=new Set([
'İMECE','SEHER','DORUK','YAMAÇ','UFUK','PUS','ÇİSE','MİHENK','SERZENİŞ','MÜPHEM',
'NAİF','YADİGAR','SÜKUN','ESİNTİ','DİNGİN','KIRAĞI','ÇERAĞ','TÖRE','OZAN','YAREN',
'KUŞAK','HARMAN','ÇAĞLA','PINAR','BOZKIR','YAYLA','İKLİM','KEŞİF','MİRAS','ÖYKÜ',
'MASAL','EFSANE','DEYİM','ATASÖZÜ'
]);

function boardWordUsageTier(word){
const w=String(word||'').toLocaleUpperCase('tr-TR');
if(DAILY_BOARD_PRIORITY_WORDS.has(w))return'daily';
if(RARE_EDUCATIONAL_BOARD_WORDS.has(w))return'rare';
if(GENERAL_BOARD_PRIORITY_WORDS.has(w)||GEO_DICTIONARY?.[w])return'general';
return'other';
}

function isForeignWord(word){
const w=String(word||'').toLocaleUpperCase('tr-TR');
return !TURKISH_WORD_CHARS.test(w)||FOREIGN_EXACT.has(w);
}
let GEO_DICTIONARY=Object.freeze({});
let GAME_WORD_LIST=[];
let GAME_WORD_SET=new Set();
const TILE_SCORE_CACHE=Object.freeze({...TILE_SCORES});
const GAME_WORDS_BY_LENGTH=new Map();
let wordDataReady=false;
let wordDataPromise=null;
function initializeWordData(data){
if(wordDataReady)return true;
if(!data||typeof data.WORD_DB_FC!=='string'||!data.GEO_DICTIONARY)throw new Error('word-data-invalid');
const decodedWords=[];
let prev='';
for(const row of data.WORD_DB_FC.split('\n')){
if(!row)continue;
const prefixLen=parseInt(row[0],36);
const word=prev.slice(0,prefixLen)+row.slice(1);
decodedWords.push(word);prev=word;
}
GEO_DICTIONARY=data.GEO_DICTIONARY;
GAME_WORD_LIST=Array.from(new Set(decodedWords))
.filter(w=>w.length>=2&&w.length<=9&&!isArgoWord(w)&&!isForeignWord(w)&&!isElementSymbol(w)).sort();
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
try{script.remove();}catch(_){}
if(!ok){reject(err||new Error('word-data-load-failed'));return;}
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
for(const src of['word-data.js?v=643','word-data.js?v=643&retry=1']){
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
const LONGEST_WORD_BONUS=40;
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
if(max1===maxLen){p1Score+=LONGEST_WORD_BONUS;singleLongestBonus.p1=true;}
if(max2===maxLen){p2Score+=LONGEST_WORD_BONUS;singleLongestBonus.p2=true;}
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

// v617 — Oyun sırasında 4 sn harf etkileşimi olmazsa 👋 hatırlatması
const LETTER_IDLE_WAVE_MS=4000;
let letterIdleLastActivityAt=0;
let letterIdleWaveShown=false;
let letterIdleWasEligible=false;
function noteLetterInteraction(){
letterIdleLastActivityAt=performance.now();
letterIdleWaveShown=false;
}
function showLetterIdleWave(){
const grid=document.getElementById('scrabble-grid');
if(!grid||document.querySelector('.letter-idle-wave-fx'))return;
const r=grid.getBoundingClientRect();
if(!r.width||!r.height)return;
const fx=document.createElement('div');
fx.className='letter-idle-wave-fx';
fx.textContent='✋';
Object.assign(fx.style,{
  position:'fixed',
  left:(r.left+r.width/2)+'px',
  top:(r.top+r.height/2)+'px',
  transform:'translate(-50%,-50%) scale(.16)',
  transformOrigin:'50% 50%',
  fontSize:'clamp(90px,23vw,170px)',
  lineHeight:'1',
  opacity:'0',
  pointerEvents:'none',
  userSelect:'none',
  zIndex:'220',
  filter:'drop-shadow(0 10px 16px rgba(0,0,0,.34))'
});
document.body.appendChild(fx);
if(typeof fx.animate==='function'){
  const anim=fx.animate([
    {transform:'translate(-50%,-50%) scale(.16)',opacity:0},
    {transform:'translate(-50%,-50%) scale(1.08)',opacity:1,offset:.34},
    {transform:'translate(-50%,-50%) scale(1.72)',opacity:1,offset:.58},
    {transform:'translate(-50%,-50%) scale(1.9)',opacity:.98,offset:.68},
    {transform:'translate(-50%,-50%) scale(.96)',opacity:0}
  ],{duration:980,easing:'cubic-bezier(.16,.84,.22,1)',fill:'forwards'});
  anim.onfinish=()=>fx.remove();
  anim.oncancel=()=>fx.remove();
}else{
  fx.style.transition='transform 780ms cubic-bezier(.16,.84,.22,1),opacity 780ms ease-out';
  requestAnimationFrame(()=>{fx.style.transform='translate(-50%,-50%) scale(1.82)';fx.style.opacity='1';});
  setTimeout(()=>{fx.style.opacity='0';fx.style.transform='translate(-50%,-50%) scale(.96)';},610);
  setTimeout(()=>fx.remove(),980);
}
}
function isLetterIdleWaveEligible(){
if(!isMatchActive||document.hidden)return false;
const game=document.getElementById('screen-game');
const grid=document.getElementById('scrabble-grid');
if(!game||game.classList.contains('hidden')||!grid||!grid.children.length)return false;
if(atismaSetupActive)return false;
return true;
}
function checkLetterIdleWave(){
const eligible=isLetterIdleWaveEligible();
if(!eligible){
  letterIdleWasEligible=false;
  letterIdleWaveShown=false;
  letterIdleLastActivityAt=0;
  return;
}
const now=performance.now();
if(!letterIdleWasEligible){
  letterIdleWasEligible=true;
  letterIdleLastActivityAt=now;
  letterIdleWaveShown=false;
  return;
}
if(isPointerDown||selectedPath.length){
  noteLetterInteraction();
  return;
}
if(!letterIdleWaveShown&&now-letterIdleLastActivityAt>=LETTER_IDLE_WAVE_MS){
  showLetterIdleWave();
  letterIdleWaveShown=true;
}
}
setInterval(checkLetterIdleWave,250);
let botDiffLevel='easy';
let activeGameMode = null; // 'single' | 'multi' — replay akışının tek güvenilir kaynağı
let selectedHomeGameMode=null; // 'kapisma' | 'patlama'
let randomMatchGameMode='kapisma';
const PATLAMA_TRAP_COUNT=7;
const PATLAMA_TURN_HANDOFF_MS=1000;
let atismaTurnHandoffTimer=null;
let atismaTool='trap',atismaSetupTimer=null,atismaTurnTimer=null,atismaSetupActive=false,atismaTimeoutBusy=false;

function stopAtismaTurnHandoff(){
if(atismaTurnHandoffTimer){clearTimeout(atismaTurnHandoffTimer);atismaTurnHandoffTimer=null;}
}
function lockAtismaTurnHandoff(){
isMatchActive=false;
stopAtismaTurnTimer();
const grid=document.getElementById('scrabble-grid');
if(grid)grid.style.pointerEvents='none';
}
function scheduleLocalAtismaTurn(nextTurn){
stopAtismaTurnHandoff();
lockAtismaTurnHandoff();
atismaTurnHandoffTimer=setTimeout(()=>{
atismaTurnHandoffTimer=null;
if(isLocalAtisma())startLocalAtismaTurn(nextTurn);
},PATLAMA_TURN_HANDOFF_MS);
}
async function waitAtismaTurnHandoff(){
lockAtismaTurnHandoff();
await new Promise(resolve=>setTimeout(resolve,PATLAMA_TURN_HANDOFF_MS));
}
let atismaDragType='',atismaDragGhost=null,atismaDragHoverCell=null;
let atismaLocalActive=false,atismaLocalTurn='player',atismaLocalPlayerTurns=0,atismaLocalAiTurns=0,atismaLocalAiTimer=null;
let atismaLocalPlayerPlacements={},atismaLocalAiPlacements={},atismaLocalUsedPlayer={},atismaLocalUsedAi={};
let atismaLocalBlastedWords=new Set(),atismaPlacementHintTimer=null,atismaLastBalloonDropAt=0,atismaLastSecondTick=null;
let selectedPath=[];
let sessionFoundWords=new Set();
let gridBoard=[];
let domCells=[];
let boardFoundWords=[];
function updateGameTimerUI(seconds){
const el=document.getElementById('game-timer');
if(!el)return;
const sec=Math.max(0,Math.ceil(Number(seconds)||0));
if(el.textContent!==String(sec))el.textContent=String(sec);
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
const ack=document.getElementById('single-countdown-understood');
if(ack){ack.onclick=null;ack.disabled=false;ack.classList.add('hidden');}
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
const VIBRATION_KEY='kd_vibration_level_v1';
const VIBRATION_LEVELS=new Set(['off','low','medium','high']);
let vibrationLevel=VIBRATION_LEVELS.has(safeStorageGet('local',VIBRATION_KEY))?safeStorageGet('local',VIBRATION_KEY):'medium';
function vibrationPattern(kind='tap'){
if(vibrationLevel==='off')return 0;
const table={
 low:{tap:12,success:24,longword:[34,22,42],error:[24,28,24],blast:[30,24,38],finish:[22,34,28]},
 medium:{tap:20,success:38,longword:[48,24,62],error:[36,34,36],blast:[48,28,62],finish:[30,40,42]},
 high:{tap:32,success:58,longword:[68,28,86],error:[54,42,54],blast:[72,34,92],finish:[42,48,66]}
};
return(table[vibrationLevel]||table.medium)[kind]||0;
}
function deviceSupportsVibration(){
return typeof navigator!=='undefined'&&typeof navigator.vibrate==='function';
}
function visualGameHaptic(kind='tap'){
if(vibrationLevel==='off'||document.hidden)return false;
const game=document.getElementById('screen-game');
const settings=document.getElementById('vibration-control');
const target=game&&!game.classList.contains('hidden')?game:settings;
if(!target||typeof target.animate!=='function')return false;
const ampTable={low:.45,medium:.9,high:1.65};
const amp=ampTable[vibrationLevel]||ampTable.medium;
const mult={tap:.55,success:1.0,error:1.25,blast:1.55,finish:1.15}[kind]||.7;
const x=amp*mult;
const duration={tap:85,success:125,error:165,blast:190,finish:145}[kind]||100;
try{
if(target.__kapmacaHapticAnimation)target.__kapmacaHapticAnimation.cancel();
target.__kapmacaHapticAnimation=target.animate(
[{transform:'translate3d(0,0,0)'},{transform:`translate3d(${x}px,0,0)`},{transform:`translate3d(-${x}px,0,0)`},{transform:'translate3d(0,0,0)'}],
{duration,easing:'ease-out'}
);
return true;
}catch(_){return false;}
}
function vibrateGame(kind='tap'){
const pattern=vibrationPattern(kind);
if(!pattern||document.hidden)return false;
if(deviceSupportsVibration()){
try{return navigator.vibrate(pattern)!==false;}catch(_){}
}
return visualGameHaptic(kind);
}
function triggerKapismaLongWordVibration(){
if(document.hidden||vibrationLevel==='off')return false;
const pattern=vibrationPattern('longword');
if(!pattern||!deviceSupportsVibration())return false;
try{return navigator.vibrate(pattern)!==false;}catch(_){return false;}
}
function renderVibrationControls(){
document.querySelectorAll('.vibration-choice').forEach(btn=>btn.classList.toggle('selected',btn.dataset.vibration===vibrationLevel));
const status=document.getElementById('vibration-support-status');
if(status){
status.textContent=deviceSupportsVibration()
?'Oyun içinde harf seçimi, sözcük geri bildirimi ve patlamada fiziksel titreşim uygulanır.'
:'Fiziksel titreşim desteklenmiyor; oyun içinde görsel titreme uygulanır.';
status.className='mt-2 text-center text-[10px] font-bold '+(deviceSupportsVibration()?'text-emerald-700':'text-violet-700');
}
}
function setVibrationLevel(level,{preview=true}={}){
vibrationLevel=VIBRATION_LEVELS.has(level)?level:'medium';
safeStorageSet('local',VIBRATION_KEY,vibrationLevel);
renderVibrationControls();
if(preview&&vibrationLevel!=='off'){
const ok=vibrateGame('tap');
if(!ok&&!deviceSupportsVibration())showToast('Bu cihaz titreşim özelliğini desteklemiyor.','amber',1600);
}
}
function renderSoundControls(){
const range=document.getElementById('sound-volume-range');
const mute=document.getElementById('sound-muted');
if(range)range.value=String(Math.max(1,Math.min(6,Math.round((masterSoundVolume>0?masterSoundVolume:lastNonMutedSoundVolume)*6))));
if(mute)mute.checked=masterSoundVolume<=0;
renderVibrationControls();
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
vibrateGame('tap');
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
vibrateGame('error');
playTone(185,.14,.12,'square',95);
playTone(145,.12,.08,'sawtooth',82,.055);
}
function playCorrectChime(withHaptic=true){
if(withHaptic)vibrateGame('success');
playTone(760,.13,.095,'sine',980);
playTone(1120,.19,.075,'sine',1420,.075);
}
let atismaExplosionNoiseBuffer=null;
let lastAtismaExplosionSoundAt=0;
function playAtismaExplosionSound(){
if(masterSoundVolume<=0||document.hidden)return;
const ctx=ensureGameAudio();if(!ctx||ctx.state==='closed')return;
try{
const perfNow=performance.now();
const stackScale=perfNow-lastAtismaExplosionSoundAt<85?.68:1;
lastAtismaExplosionSoundAt=perfNow;
const now=ctx.currentTime;
const master=ctx.createGain();
const compressor=ctx.createDynamicsCompressor();
compressor.threshold.setValueAtTime(-16,now);
compressor.knee.setValueAtTime(16,now);
compressor.ratio.setValueAtTime(5,now);
compressor.attack.setValueAtTime(.002,now);
compressor.release.setValueAtTime(.12,now);
master.gain.setValueAtTime(Math.min(.95,masterSoundVolume*1.08*stackScale),now);
master.connect(compressor);compressor.connect(ctx.destination);

const boom=ctx.createOscillator(),boomGain=ctx.createGain();
boom.type='sine';
boom.frequency.setValueAtTime(155,now);
boom.frequency.exponentialRampToValueAtTime(43,now+.24);
boomGain.gain.setValueAtTime(.0001,now);
boomGain.gain.exponentialRampToValueAtTime(.34,now+.004);
boomGain.gain.exponentialRampToValueAtTime(.0001,now+.25);
boom.connect(boomGain);boomGain.connect(master);
boom.start(now);boom.stop(now+.27);

const body=ctx.createOscillator(),bodyGain=ctx.createGain();
body.type='triangle';
body.frequency.setValueAtTime(390,now);
body.frequency.exponentialRampToValueAtTime(92,now+.13);
bodyGain.gain.setValueAtTime(.0001,now);
bodyGain.gain.exponentialRampToValueAtTime(.22,now+.003);
bodyGain.gain.exponentialRampToValueAtTime(.0001,now+.14);
body.connect(bodyGain);bodyGain.connect(master);
body.start(now);body.stop(now+.16);

if(!atismaExplosionNoiseBuffer||atismaExplosionNoiseBuffer.sampleRate!==ctx.sampleRate){
const len=Math.max(1,Math.floor(ctx.sampleRate*.18));
atismaExplosionNoiseBuffer=ctx.createBuffer(1,len,ctx.sampleRate);
const data=atismaExplosionNoiseBuffer.getChannelData(0);
for(let i=0;i<len;i++){
const decay=Math.pow(1-i/len,2.6);
data[i]=(Math.random()*2-1)*decay;
}
}
const noise=ctx.createBufferSource(),noiseFilter=ctx.createBiquadFilter(),noiseGain=ctx.createGain();
noise.buffer=atismaExplosionNoiseBuffer;
noiseFilter.type='bandpass';
noiseFilter.frequency.setValueAtTime(920,now);
noiseFilter.Q.setValueAtTime(.75,now);
noiseGain.gain.setValueAtTime(.0001,now);
noiseGain.gain.exponentialRampToValueAtTime(.24,now+.002);
noiseGain.gain.exponentialRampToValueAtTime(.0001,now+.16);
noise.connect(noiseFilter);noiseFilter.connect(noiseGain);noiseGain.connect(master);
noise.start(now);noise.stop(now+.18);

setTimeout(()=>{try{master.disconnect();compressor.disconnect();}catch(_){}},420);
}catch(_){}
}
function playPatlamaSecondTick(sec){
sec=Math.max(0,Math.ceil(Number(sec)||0));
if(sec<=0||sec>5||sec===atismaLastSecondTick||document.hidden)return;
atismaLastSecondTick=sec;
const urgency=Math.max(0,5-sec);
const freq=410+urgency*22;
const vol=sec<=2?.058:.042;
playTone(freq,.05,vol,'square',freq+28);
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
vibrateGame('finish');
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
authDomain:"giris.kapmaca.tr",
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
let mpConnectionStateListener=null;
const mpFoundWords={host:new Set(),guest:new Set()};
function setMpConnectionStatus(visible,text='Bağlantı yeniden kuruluyor…'){
const el=document.getElementById('mp-connection-status');
if(!el)return;
el.textContent=text;
el.classList.toggle('hidden',!visible);
}
function ensureMpConnectionWatcher(){
if(!mpDb||mpConnectionStateListener)return;
const ref=mpDb.ref('.info/connected');
mpConnectionStateListener=async snap=>{
const connected=snap.val()===true;
const active=!!mpRoomRef||randomSearchActive;
if(!connected){
if(firebaseWasConnected===true&&active)setMpConnectionStatus(true);
firebaseWasConnected=false;
return;
}
const wasDisconnected=firebaseWasConnected===false;
firebaseWasConnected=true;
setMpConnectionStatus(false);
if(wasDisconnected&&mpRoomRef&&mpRole&&!reconnectPresenceBusy){
reconnectPresenceBusy=true;
try{await syncServerClock();await markPresence();}catch(_){}
finally{reconnectPresenceBusy=false;}
}
};
ref.on('value',mpConnectionStateListener);
}
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
ensureMpConnectionWatcher();
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
setMpConnectionStatus(false);
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
function setPrivateInviteControlsReady(ready){
const copy=document.getElementById('btn-copy-link');
const share=document.getElementById('btn-share-link');
if(copy)copy.disabled=!ready;
if(share)share.disabled=!ready;
for(const el of[copy,share]){
if(!el)continue;
el.style.opacity=ready?'1':'.55';
el.style.cursor=ready?'pointer':'wait';
}
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
randomMatchGameMode='kapisma';
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
if(randomMatchGameMode==='gokdelen')return window.gokdelenNetwork.createRandom(hostId,guestId);
await ensureWordDataLoaded();
const readyBoard=prewarmedBoard||generateOptimizedBoard(3);
prewarmedBoard=null;
rememberBoard(readyBoard.board,readyBoard.words);
const patlama=randomMatchGameMode==='patlama';
const created=await createCleanRoomRecord({
schema:22,
mode:patlama?'random-match-patlama-v1':'random-match-timepool-v1',
hostId,
guestId,
board:readyBoard.board,
inviteGuest:'accepted'
});
if(patlama)await created.ref.child('atisma').set({placements:{host:{},guest:{}},used:null,blastedWords:null});
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
randomMatchGameMode=['patlama','gokdelen'].includes(selectedHomeGameMode)?selectedHomeGameMode:'kapisma';
randomPairRoomBusy=false;
randomJoinBusy=false;
randomPoolRef=mpDb.ref(randomMatchGameMode==='gokdelen'?'matchmaking/randomPoolGokdelen':randomMatchGameMode==='patlama'?'matchmaking/randomPoolPatlama':'matchmaking/randomPool');
const ticket=randomTicket();
randomSearchTicket=ticket;
randomOwnEntryRef=randomPoolRef.child(ticket);
try{
await randomOwnEntryRef.set({
ticket,
clientId:getClientToken(),
gameMode:randomMatchGameMode,
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
function setPrivateRoomProgress(){}
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
const startBtn=document.getElementById('btn-invite-start');
const cancelBtn=document.getElementById('btn-invite-cancel');
const countdownEl=document.getElementById('invite-decision-countdown');
const countdownNumberEl=document.getElementById('invite-decision-number');
const inviteTitle=modal?.querySelector('.invite-title');
if(inviteTitle)inviteTitle.textContent=isGokdelenRoom()?'GÖKDELEN oyununa davet edildiniz':isAtismaRoom()?'PATLAMA oyununa davet edildiniz':'KAPMACA oyununa davet edildiniz';
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
if(countdownNumberEl)countdownNumberEl.textContent=String(left); else if(countdownEl)countdownEl.textContent=`${left} saniye içinde seçim yapın`;
if(left<=0){
stopInviteDecisionTimer();
if(mpRole==='guest'&&mpRoomRef)requestSynchronizedRoomExit('invite-timeout').catch(()=>{});
}
};
tick();
inviteDecisionTimer=setInterval(tick,500);
}
function showInactiveRoomAndReturn(){
try{history.replaceState(null,'','https://kapmaca.tr/');}catch(_){}
window.location.replace('https://kapmaca.tr/');
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
showInactiveRoomAndReturn();
return false;
}
mpRoomCode=code;
mpRole=role;
mpRoomRef=ref;
mpRoomMode=mode;
if(isGokdelenRoom()){document.body.dataset.gokdelenMenu='1';if(selectedHomeGameMode!=='gokdelen')selectHomeGameMode('gokdelen');}
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
if(!game||!Array.isArray(game.board)||game.board.length!==(mode.includes('gokdelen')?40:9)){
showInactiveRoomAndReturn();
return false;
}
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
if(isGokdelenRoom()){await window.gokdelenNetwork.enter();return;}
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
if(d.status==='setup')activateAtismaSetup(d);
else if(d.status==='countdown'&&d.startAt&&!mpStarted)startSyncedMatch(d);
else if(d.status==='playing'&&d.startAt)activateMultiplayerPlaying(d);
}
async function hostStartWaitingRound(){
if(isGokdelenRoom()){await window.gokdelenNetwork.start();return;}
if(mpRole!=='host'||mpStartBusy||!mpRoomRef)return;
mpStartBusy=true;
try{
const[guestSnap,readySnap]=await Promise.all([
mpRoomRef.child('guestId').once('value'),
mpRoomRef.child('ready').once('value')
]);
const ready=readySnap.val()||{};
if(!guestSnap.val()||!ready.host||!ready.guest)return;
if(isAtismaRoom()){await hostStartAtismaSetup();return;}
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
if(isAtismaRoom()){
await mpRoomRef.update({
'gameState':{
status:'setup',
board:pending.board,
startAt:0,
setupEndAt:now+23000,
round:nextRound,
turn:'host',
hostTurns:0,
guestTurns:0,
turnStartedAt:0,
turnDeadline:0
},
'scores':{host:0,guest:0},
'words':null,
'longestBonus':null,
'bonusApplied':false,
'finalWinner':null,
'endReady':{host:false,guest:false},
'rematch':{host:false,guest:false,expiresAt:0,round:nextRound},
'pendingRound':null,
'atisma/placements':{host:{},guest:{}},
'atisma/used':null,
'atisma/blastedWords':null
});
}else{
await mpRoomRef.update({
'gameState':{status:'countdown',board:pending.board,startAt:now+3200,round:nextRound},
'scores':{host:0,guest:0},'words':null,'longestBonus':null,'bonusApplied':false,'finalWinner':null,
'endReady':{host:false,guest:false},'rematch':{host:false,guest:false,expiresAt:0,round:nextRound},'pendingRound':null
});
}
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
if(actions){
actions.classList.remove('hidden');
actions.style.setProperty('display','grid','important');
actions.style.setProperty('grid-template-columns','minmax(0,1fr) minmax(0,1fr)','important');
}
if(replay){
replay.classList.remove('hidden');
replay.style.setProperty('display','flex','important');
replay.style.setProperty('grid-column','1','important');
replay.style.setProperty('grid-row','1','important');
replay.disabled=false;
replay.textContent='YENİDEN OYNA';
replay.classList.add('rematch-pulse');
}
if(exitBtn){
exitBtn.classList.remove('hidden');
exitBtn.style.setProperty('display','flex','important');
exitBtn.style.setProperty('grid-column','2','important');
exitBtn.style.setProperty('grid-row','1','important');
exitBtn.disabled=false;
exitBtn.className='w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 active:scale-[0.97] text-white font-black text-xs py-3 rounded-2xl uppercase shadow-lg transition';
exitBtn.textContent='ÇIKIŞ';
}
if(inline){inline.style.setProperty('grid-column','1 / -1','important');inline.style.setProperty('grid-row','2','important');inline.classList.add('hidden');inline.textContent='';}
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
const gs=gsSnap.val()||{};if(!['playing','resolving'].includes(String(gs.status||''))||bonusSnap.val())return;
const vals=Object.values(wordsSnap.val()||{}).filter(x=>x&&x.word);
let maxLen=0;vals.forEach(x=>{maxLen=Math.max(maxLen,String(x.word).length);});
let hostGets=false,guestGets=false;
if(maxLen>0)vals.forEach(x=>{if(String(x.word).length===maxLen){if(x.role==='host')hostGets=true;if(x.role==='guest')guestGets=true;}});
const sc=scoresSnap.val()||{host:0,guest:0};
if(hostGets)sc.host=Number(sc.host||0)+LONGEST_WORD_BONUS;
if(guestGets)sc.guest=Number(sc.guest||0)+LONGEST_WORD_BONUS;
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
if(actions){actions.classList.remove('hidden');actions.style.setProperty('display','grid','important');actions.style.setProperty('grid-template-columns','1fr','important');}
if(replay){replay.disabled=true;replay.classList.add('hidden');replay.style.setProperty('display','none','important');replay.style.removeProperty('grid-column');replay.style.removeProperty('grid-row');replay.classList.remove('rematch-pulse');}
if(exitBtn){exitBtn.disabled=false;exitBtn.classList.remove('hidden');exitBtn.style.setProperty('display','flex','important');exitBtn.style.setProperty('width','100%','important');exitBtn.style.setProperty('grid-column','1 / -1','important');exitBtn.style.setProperty('grid-row','1','important');exitBtn.textContent='ÇIKIŞ';}
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
function isGokdelenRoom(){return String(mpRoomMode||'').includes('gokdelen');}
function attachRoomListener(){
if(!mpRoomRef)return;
if(isGokdelenRoom()){window.gokdelenNetwork.attach();return;}
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
const metaSig=[gs.status,Number(gs.startAt||0),Number(gs.setupEndAt||0),String(gs.turn||''),Number(gs.turnDeadline||0),Number(gs.hostTurns||0),Number(gs.guestTurns||0),Number(gs.round||1),roomBoardSig,mpRoomData.guestId||'',!!mpRoomData.guestOnline,mpRoomData.inviteGuest||'',!!mpRoomData.rematch?.host,!!mpRoomData.rematch?.guest,Number(mpRoomData.rematch?.expiresAt||0),mpRoomData.finalWinner||''].join('|');
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
if(gs.status==='setup'){
setMpState('setup');document.getElementById('modal-mp-waiting')?.classList.add('hidden');
if(!mpEntered)await enterMultiplayerRoom();
activateAtismaSetup(gs);
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
if(gs.status==='resolving'){
isMatchActive=false;stopAtismaTurnTimer();
const grid=document.getElementById('scrabble-grid');if(grid)grid.style.pointerEvents='none';
const status=document.getElementById('atisma-phase-status');if(status)status.textContent='SONUÇ HESAPLANIYOR…';
if(mpRole==='host')hostFinalizeAtisma().catch(()=>{});
}
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
bindControl('atisma','value',snap=>{
mpRoomData={...(mpRoomData||{}),atisma:snap.val()||{}};
if(isAtismaRoom()){
renderAtismaTools();
updateAtismaPlacementWaitState();
if(mpRoomData.status==='setup'&&mpRole==='host'&&bothAtismaPlacementsComplete())hostFinishAtismaSetup(true).catch(()=>{});
if(mpRoomData.status==='playing')syncAtismaTurnUi(mpRoomData);
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
if(isAtismaRoom()&&ev.effects){showAtismaEffects(ev.effects);if((ev.effects?.trap||[]).length)showPatlamaReaction('laugh');}
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
modal?.classList.remove('single-countdown-active');
document.getElementById('single-countdown-message')?.classList.add('hidden');
document.getElementById('single-countdown-understood')?.classList.add('hidden');
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
if(isAtismaRoom()){
clearInterval(timerInterval);timerInterval=null;
syncAtismaTurnUi(d);
}else if(!timerAlreadyRunning)startMultiplayerTimer(Number(d.startAt));
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
window.gokdelenNetwork?.stop();
stopInviteWaitCountdown();
stopAtismaSetupTimer();stopAtismaTurnTimer();clearAtismaDrag();atismaSetupActive=false;atismaTimeoutBusy=false;atismaTool='trap';if(atismaPlacementHintTimer){clearTimeout(atismaPlacementHintTimer);atismaPlacementHintTimer=null;}atismaLastBalloonDropAt=0;atismaLastSecondTick=null;document.getElementById('atisma-placement-hint')?.remove();setPatlamaActivePlayer(null);document.getElementById('atisma-setup-notice')?.classList.add('hidden');setAtismaPanelVisible(false,false);
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
const _ga=document.getElementById('gameover-actions');if(_ga){_ga.style.removeProperty('display');_ga.style.removeProperty('grid-template-columns');_ga.classList.remove('hidden');}
const _rp=document.getElementById('btn-play-again');if(_rp){_rp.style.removeProperty('display');_rp.style.removeProperty('grid-column');_rp.style.removeProperty('grid-row');}
const _ex=document.getElementById('btn-game-exit');if(_ex){_ex.style.removeProperty('display');_ex.style.removeProperty('grid-column');_ex.style.removeProperty('grid-row');}
mpSessionJoinedAt=0;mpExitHandling=false;mpLastExitSignalId='';reconnectPresenceBusy=false;setMpConnectionStatus(false);
mpSeenWordEvents.clear();mpFoundWords.host.clear();mpFoundWords.guest.clear();mpLastResultRenderSig='';
setMpState(MP_STATES.IDLE);
}
function returnToHomeFromMultiplayer(){
const memberNoToClear=activeMemberRoomNo;
const memberWasOwner=activeMemberRoomOwner;
activeMemberRoomNo='';activeMemberRoomOwner=false;
if(memberWasOwner&&memberNoToClear&&accountDb){
accountDb.ref('memberRooms/'+memberNoToClear).update({activeRoomCode:'',activeMode:'',updatedAt:firebase.database.ServerValue.TIMESTAMP}).catch(()=>{});
}
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
function showAtismaSetupNotice(onUnderstood=null){
const wrap=document.getElementById('atisma-setup-notice');if(!wrap)return;
const game=document.getElementById('screen-game');
const btn=document.getElementById('atisma-setup-understood');
wrap.classList.remove('hidden');
game?.classList.add('atisma-setup-intro-active');
clearTimeout(wrap._hideTimer);
if(typeof onUnderstood==='function'){
  wrap.classList.add('atisma-single-understand');
  if(btn){
    btn.classList.remove('hidden');
    btn.disabled=false;
    btn.onclick=()=>{
      if(btn.disabled)return;
      btn.disabled=true;
      btn.onclick=null;
      btn.classList.add('hidden');
      wrap.classList.add('hidden');
      wrap.classList.remove('atisma-single-understand');
      game?.classList.remove('atisma-setup-intro-active');
      onUnderstood();
    };
  }
  return;
}
wrap.classList.remove('atisma-single-understand');
if(btn){btn.classList.add('hidden');btn.onclick=null;btn.disabled=false;}
wrap._hideTimer=setTimeout(()=>{
  wrap.classList.add('hidden');
  game?.classList.remove('atisma-setup-intro-active');
},4000);
}
function ensureAtismaPlacementHint(){
let el=document.getElementById('atisma-placement-hint');
if(!el){
  el=document.createElement('div');
  el.id='atisma-placement-hint';
  el.setAttribute('aria-live','polite');
  el.innerHTML='Balonlarınızı, tuzak kurmak istediğiniz<br>harfin üzerine bırakın.';
  const host=document.getElementById('selected-preview-bar')||document.getElementById('screen-game');
  host?.appendChild(el);
}
if(el){
  Object.assign(el.style,{
    position:'absolute',
    left:'50%',
    top:'50%',
    transform:'translate(-50%,-50%)',
    transformOrigin:'center center',
    zIndex:'135',
    width:'min(74vw,300px)',
    maxWidth:'calc(100% - 28px)',
    boxSizing:'border-box',
    padding:'7px 12px',
    border:'0',
    borderRadius:'11px',
    background:'#dc2626',
    color:'#fff',
    boxShadow:'0 5px 14px rgba(127,29,29,.30)',
    fontFamily:"'Quicksand',Calibri,'Segoe UI',sans-serif",
    fontSize:'clamp(14px,3.8vw,18px)',
    lineHeight:'1.18',
    fontWeight:'1000',
    textAlign:'center',
    whiteSpace:'normal',
    pointerEvents:'none',
    opacity:'1',
    margin:'0'
  });
}
return el;
}
function showAtismaPlacementHint(){
if(!atismaSetupActive)return;
const el=ensureAtismaPlacementHint();
if(!el)return;
el.innerHTML='Balonunuzu, tuzak kurmak istediğiniz<br>harfin üzerine bırakın.';
el.classList.remove('atisma-placement-hint-pulse');
el.style.display='block';
}
function hideAtismaPlacementHint(){
const el=document.getElementById('atisma-placement-hint');
if(!el)return;
el.classList.remove('atisma-placement-hint-pulse');
el.style.display='none';
}
function pulseAtismaPlacementHint(){
if(!atismaSetupActive)return;
const el=ensureAtismaPlacementHint();
if(!el)return;
el.style.display='block';
el.classList.remove('atisma-placement-hint-pulse');
void el.offsetWidth;
el.classList.add('atisma-placement-hint-pulse');
clearTimeout(el._pulseTimer);
el._pulseTimer=setTimeout(()=>el.classList.remove('atisma-placement-hint-pulse'),560);
}
function clearAtismaDrag(){
atismaDragType='';
atismaDragGhost?.remove();atismaDragGhost=null;
atismaDragHoverCell?.classList.remove('atisma-drop-target');atismaDragHoverCell=null;
document.querySelectorAll('#atisma-tools button.atisma-dragging').forEach(b=>b.classList.remove('atisma-dragging'));
}
function atismaCellFromPoint(x,y){
let el=document.elementFromPoint(x,y)?.closest?.('.letter-cell')||null;
if(!el){
const grid=document.getElementById('scrabble-grid'),r=grid?.getBoundingClientRect?.();
if(r&&x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom&&r.width>0&&r.height>0){
const col=Math.min(BOARD_SIZE-1,Math.max(0,Math.floor((x-r.left)/(r.width/BOARD_SIZE))));
const row=Math.min(BOARD_SIZE-1,Math.max(0,Math.floor((y-r.top)/(r.height/BOARD_SIZE))));
el=document.getElementById('cell-'+row+'-'+col);
}
}
if(!el)return null;
const id=String(el.id||''),m=id.match(/^cell-(\d+)-(\d+)$/);if(!m)return null;
return{el,index:Number(m[1])*BOARD_SIZE+Number(m[2])};
}
function beginAtismaDrag(type,e){
if(!atismaSetupActive||(!isAtismaRoom()&&!isLocalAtisma()))return;
type='trap';const remaining=isLocalAtisma()?PATLAMA_TRAP_COUNT-atismaLocalCount('trap'):PATLAMA_TRAP_COUNT-Object.values(atismaOwnPlacements()).filter(v=>v==='trap').length;
if(remaining<=0)return;
e.preventDefault();e.stopPropagation();atismaTool=type;atismaDragType=type;
isLocalAtisma()?renderLocalAtismaTools():renderAtismaTools();
const btn=e.currentTarget;btn?.classList.add('atisma-dragging');
const ghost=document.createElement('div');ghost.className='atisma-drag-ghost';ghost.textContent='🎈';document.body.appendChild(ghost);atismaDragGhost=ghost;
moveAtismaDrag(e.clientX,e.clientY);
try{btn?.setPointerCapture?.(e.pointerId);}catch(_){}
}
function moveAtismaDrag(x,y){
if(!atismaDragType)return;
if(atismaDragGhost){atismaDragGhost.style.left=x+'px';atismaDragGhost.style.top=y+'px';}
const hit=atismaCellFromPoint(x,y),cell=hit?.el||null;
if(cell!==atismaDragHoverCell){atismaDragHoverCell?.classList.remove('atisma-drop-target');atismaDragHoverCell=cell;atismaDragHoverCell?.classList.add('atisma-drop-target');}
}
async function endAtismaDrag(e){
if(!atismaDragType)return;
e.preventDefault();e.stopPropagation();
let hit=atismaCellFromPoint(e.clientX,e.clientY);
if(!hit&&atismaDragHoverCell){
const id=String(atismaDragHoverCell.id||''),m=id.match(/^cell-(\d+)-(\d+)$/);
if(m)hit={el:atismaDragHoverCell,index:Number(m[1])*BOARD_SIZE+Number(m[2])};
}
const type=atismaDragType;
clearAtismaDrag();
atismaTool=type;
if(hit){
atismaLastBalloonDropAt=performance.now();
await placeAtismaPiece(hit.index,type);
if(isLocalAtisma())renderLocalAtismaTools();else renderAtismaTools();
}
}
function isLocalAtisma(){return atismaLocalActive===true;}
function stopAtismaLocalAi(){if(atismaLocalAiTimer){clearTimeout(atismaLocalAiTimer);atismaLocalAiTimer=null;}}
function atismaLocalCount(type){return Object.values(atismaLocalPlayerPlacements).filter(v=>v===type).length;}
function renderLocalAtismaTools(){
if(!isLocalAtisma())return;
atismaTool='trap';
const tc=document.getElementById('atisma-trap-count');
if(tc)tc.textContent=String(Math.max(0,PATLAMA_TRAP_COUNT-atismaLocalCount('trap')));
const tb=document.getElementById('atisma-trap-tool');
tb?.classList.add('atisma-tool-active');
if(tb)tb.disabled=atismaLocalCount('trap')>=PATLAMA_TRAP_COUNT;
if(document.getElementById('screen-game')?.classList.contains('atisma-playing'))return;
document.querySelectorAll('.atisma-piece-own').forEach(el=>el.remove());
for(const [key,type] of Object.entries(atismaLocalPlayerPlacements)){
if(type!=='trap')continue;
const cell=domCells[Number(key)];if(!cell)continue;
const mark=document.createElement('span');
mark.className='atisma-piece-own'+(atismaLocalUsedPlayer[key]?' atisma-piece-used':'');
mark.textContent='🎈';
cell.appendChild(mark);
}
}
function chooseAtismaAiPlacements(){
atismaLocalAiPlacements={};const freq=Array(BOARD_SIZE*BOARD_SIZE).fill(0);
for(const item of boardFoundWords){for(const p of item.path||[])freq[p.r*BOARD_SIZE+p.c]++;}
const ranked=Array.from({length:BOARD_SIZE*BOARD_SIZE},(_,i)=>i).sort((a,b)=>freq[b]-freq[a]||Math.random()-.5);const pool=ranked.slice(0,Math.min(30,ranked.length));const picked=new Set();
const take=()=>{let x=null;for(let tries=0;tries<80;tries++){const c=pool[Math.floor(Math.random()*pool.length)];if(!picked.has(c)){x=c;break;}}if(x===null)x=ranked.find(i=>!picked.has(i));picked.add(x);return x;};
for(let n=0;n<PATLAMA_TRAP_COUNT;n++)atismaLocalAiPlacements[take()]='trap';
}
function playAtismaTrapExplosion(idx){
vibrateGame('blast');
playAtismaExplosionSound();
const cell=domCells[Number(idx)]||document.getElementById('cell-'+Math.floor(Number(idx)/BOARD_SIZE)+'-'+(Number(idx)%BOARD_SIZE));
if(!cell)return;
cell.classList.remove('atisma-explode');
void cell.offsetWidth;
cell.classList.add('atisma-explode');
setTimeout(()=>cell.classList.remove('atisma-explode'),1650);
const fx=document.createElement('span');
fx.className='atisma-bomb-fx';
fx.textContent='💥';
cell.appendChild(fx);
setTimeout(()=>fx.remove(),900);
const game=document.getElementById('screen-game');
if(game){
game.classList.remove('atisma-screen-shake');
void game.offsetWidth;
game.classList.add('atisma-screen-shake');
setTimeout(()=>game.classList.remove('atisma-screen-shake'),500);
}
}
function revealLocalAtismaHit(idx,type,delay=0){
const run=()=>{
const cell=domCells[Number(idx)];if(!cell)return;
playAtismaTrapExplosion(idx);
cell.querySelectorAll('.atisma-piece-hit').forEach(x=>x.remove());
const mark=document.createElement('span');mark.className='atisma-piece-hit atisma-piece-used';mark.textContent='🎈';cell.appendChild(mark);
};
if(delay>0)setTimeout(run,delay);else run();
}
function applyLocalAtismaEffects(path,placements,usedTarget){
const trap=[];
for(const p of path||[]){
const idx=p.r*BOARD_SIZE+p.c,key=String(idx);
if(usedTarget[key])continue;
if(placements[key]==='trap')trap.push(idx);
}
trap.forEach((idx,i)=>{usedTarget[idx]=true;revealLocalAtismaHit(idx,'trap',i*140);});
return{trap};
}
function localAtismaDelta(base,effects){return effects.trap.length?0:base;}
function chooseLocalAtismaAiWord(){const level=BOT_LEVELS[botDiffLevel]||BOT_LEVELS.medium;const available=getBotRankedWords().filter(({item})=>!sessionFoundWords.has(item.word));if(!available.length)return null;let ranked=available.filter(({item})=>item.word.length>=level.minLen&&item.word.length<=level.maxLen);if(!ranked.length)ranked=available;if(Math.random()<level.focus){const topCount=Math.min(ranked.length,level.top);return ranked[Math.floor(Math.random()*topCount)].item;}return ranked[Math.floor(Math.random()*ranked.length)].item;}
function setPatlamaActivePlayer(side=null){
const p1=document.getElementById('p1-player-card'),p2=document.getElementById('p2-player-card');
const timer=document.querySelector('#compact-game-header .compact-timer');
const active=side==='p1'?p1:(side==='p2'?p2:null);
const wasSame=!!active?.classList.contains('patlama-turn-active');
[p1,p2].forEach(el=>{
  if(!el)return;
  el.classList.remove('patlama-turn-active','patlama-turn-inactive');
  if(!wasSame)el.classList.remove('patlama-turn-flash');
});
timer?.classList.remove('patlama-timer-p1','patlama-timer-p2');
if(side==='p1'){
  p1?.classList.add('patlama-turn-active');p2?.classList.add('patlama-turn-inactive');
  timer?.classList.add('patlama-timer-p1');
}else if(side==='p2'){
  p2?.classList.add('patlama-turn-active');p1?.classList.add('patlama-turn-inactive');
  timer?.classList.add('patlama-timer-p2');
}
if(active&&!wasSame){
  active.classList.remove('patlama-turn-flash');
  void active.offsetWidth;
  active.classList.add('patlama-turn-flash');
  clearTimeout(active._patlamaTurnFlashTimer);
  active._patlamaTurnFlashTimer=setTimeout(()=>active.classList.remove('patlama-turn-flash'),850);
}
}
function renderPatlamaTurnDots(p1Used=0,p2Used=0){
const paint=(id,used)=>{
const el=document.getElementById(id);if(!el)return;
const n=Math.max(0,Math.min(10,Number(used)||0));
let out='';
for(let i=0;i<10;i++)out+='<span class="patlama-turn-dot'+(i<n?' used':'')+'"></span>';
el.innerHTML=out;
};
paint('p1-turn-dots',p1Used);
paint('p2-turn-dots',p2Used);
}
function startLocalAtismaTurn(turn='player'){
stopAtismaTurnHandoff();stopAtismaTurnTimer();stopAtismaLocalAi();atismaLocalTurn=turn;renderPatlamaTurnDots(atismaLocalPlayerTurns,atismaLocalAiTurns);
if(atismaLocalPlayerTurns>=10&&atismaLocalAiTurns>=10){finishLocalAtisma();return;}if(turn==='player'&&atismaLocalPlayerTurns>=10){startLocalAtismaTurn('ai');return;}if(turn==='ai'&&atismaLocalAiTurns>=10){startLocalAtismaTurn('player');return;}
isMatchActive=turn==='player';setAtismaPanelVisible(true,true);setPatlamaActivePlayer(turn==='player'?'p1':'p2');atismaLastSecondTick=null;const grid=document.getElementById('scrabble-grid');if(grid){grid.style.pointerEvents=turn==='player'?'auto':'none';grid.style.opacity=turn==='player'?'1':'.70';grid.style.filter=turn==='player'?'':'saturate(.82) brightness(.92)';grid.style.touchAction='none';}
const status=document.getElementById('atisma-phase-status');const n=(turn==='player'?atismaLocalPlayerTurns:atismaLocalAiTurns)+1;if(status)status.textContent='';
const deadline=Date.now()+10000;const tick=()=>{if(!isLocalAtisma())return;const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));updateGameTimerUI(left);playPatlamaSecondTick(left);if(left<=0){stopAtismaTurnTimer();if(turn==='player'){atismaLocalPlayerTurns++;renderPatlamaTurnDots(atismaLocalPlayerTurns,atismaLocalAiTurns);showToast('Süre doldu — sıra '+getBotDisplayName()+'’da.','slate',1200);scheduleLocalAtismaTurn('ai');}else runLocalAtismaAiTurn();}};tick();atismaTurnTimer=setInterval(tick,250);
if(turn==='ai')atismaLocalAiTimer=setTimeout(()=>runLocalAtismaAiTurn(),1200+Math.floor(Math.random()*1500));
}
function runLocalAtismaAiTurn(){
if(!isLocalAtisma()||atismaLocalTurn!=='ai')return;stopAtismaTurnTimer();stopAtismaLocalAi();const aiName=getBotDisplayName();const match=chooseLocalAtismaAiWord();atismaLocalAiTurns++;renderPatlamaTurnDots(atismaLocalPlayerTurns,atismaLocalAiTurns);if(!match){showToast(aiName+' pas geçti.','slate',1200);scheduleLocalAtismaTurn('player');return;}
const word=match.word,pts=word.split('').reduce((s,c)=>s+(TILE_SCORE_CACHE[c]||1),0);sessionFoundWords.add(word);const effects=applyLocalAtismaEffects(match.path,atismaLocalPlayerPlacements,atismaLocalUsedPlayer);const trapped=effects.trap.length>0;if(trapped){atismaLocalBlastedWords.add(word);showPatlamaReaction('laugh');}const delta=trapped?0:pts;if(trapped)p1Score+=pts;else p2Score+=pts;updateScores();recordMatchWord(word,delta,false);
match.path.forEach(pt=>document.getElementById('cell-'+pt.r+'-'+pt.c)?.classList.add('tile-claimed-p2'));const badge=addTickerBadge(word,false);flashOpponentWord(match.path,false,badge);let origin=null;const lp=match.path?.[match.path.length-1],el=lp?document.getElementById('cell-'+lp.r+'-'+lp.c):null,rr=el?.getBoundingClientRect?.();if(rr?.width)origin={x:rr.left+rr.width/2,y:rr.top+rr.height/2};flyScore(pts,trapped?true:false,origin);
if(trapped){playErrorBuzzer();breakCombo(false);showToast('🎈 TUZAK! '+word+' PUANI '+aiName+' TARAFINDAN SANA GEÇTİ: +'+pts,'amber',1900);}else{playCorrectChime();rewardWordFx(false);showToast(aiName+': '+word+'(+'+pts+')','sky',1800);}scheduleLocalAtismaTurn('player');
}
function finishLocalAtisma(){stopAtismaTurnHandoff();stopAtismaTurnTimer();stopAtismaLocalAi();renderPatlamaTurnDots(atismaLocalPlayerTurns,atismaLocalAiTurns);setPatlamaActivePlayer(null);const endGrid=document.getElementById('scrabble-grid');if(endGrid){endGrid.style.opacity='1';endGrid.style.filter='';}isMatchActive=false;updateGameTimerUI(0);setAtismaPanelVisible(true,true);const status=document.getElementById('atisma-phase-status');if(status)status.textContent='PATLAMA BİTTİ • 10 / 10 TUR';showTimeUpPreview(()=>{document.getElementById('modal-gameover')?.classList.remove('hidden');prepareSingleResultScreen();});}
function prepareLocalAtisma(){
stopLocalCountdown();stopAtismaTurnHandoff();stopAtismaTurnTimer();stopAtismaLocalAi();atismaLocalActive=true;activeGameMode='single';setLongestBonusBadges(false,false);atismaLocalTurn='player';atismaLocalPlayerTurns=0;atismaLocalAiTurns=0;atismaLocalPlayerPlacements={};atismaLocalAiPlacements={};atismaLocalUsedPlayer={};atismaLocalUsedAi={};atismaLocalBlastedWords=new Set();
document.getElementById('p1-title').textContent='OYUNCU';document.getElementById('p2-title').textContent=getBotDisplayName();renderPatlamaTurnDots(0,0);p1Score=0;p2Score=0;resetRewardFx();updateScores();resetMatchWordResults();resetSeriesWordResults();sessionFoundWords.clear();const ticker=document.getElementById('words-ticker');if(ticker)ticker.innerHTML='';document.getElementById('screen-home').classList.add('hidden');document.getElementById('screen-game').classList.remove('hidden');setAtismaPanelVisible(true,false);
requestAnimationFrame(()=>{try{buildGrid();chooseAtismaAiPlacements();renderLocalAtismaTools();atismaSetupActive=true;isMatchActive=false;setPatlamaActivePlayer(null);const grid=document.getElementById('scrabble-grid');if(grid){grid.style.pointerEvents='none';grid.style.opacity='1';grid.style.touchAction='none';}updateGameTimerUI(20);showAtismaSetupNotice(()=>{if(!atismaSetupActive)return;if(grid)grid.style.pointerEvents='auto';showAtismaPlacementHint();const endAt=Date.now()+20000;atismaLastSecondTick=null;const tick=()=>{const left=Math.max(0,Math.ceil((endAt-Date.now())/1000));const shown=Math.min(20,left);updateGameTimerUI(shown);playPatlamaSecondTick(shown);const status=document.getElementById('atisma-phase-status');if(status)status.textContent='';if(left<=0){stopAtismaSetupTimer();atismaSetupActive=false;document.getElementById('atisma-setup-notice')?.classList.add('hidden');hideAtismaPlacementHint();renderLocalAtismaTools();showToast('Balonlarını yerleştirdin\nİlk hamle sırası sende','orange',6500);startLocalAtismaTurn('player');}};tick();atismaSetupTimer=setInterval(tick,250);});}catch(err){console.error('Local Atisma startup failed',err);atismaLocalActive=false;showToast('PATLAMA hazırlanamadı.','rose');document.getElementById('screen-game')?.classList.add('hidden');document.getElementById('screen-home')?.classList.remove('hidden');}});
}
function isAtismaRoom(){
return /^(?:invite-only|random-match)-(?:atisma|patlama)-/.test(String(mpRoomMode||'')); 
}
function stopAtismaSetupTimer(){
if(atismaSetupTimer){clearInterval(atismaSetupTimer);atismaSetupTimer=null;}
}
function stopAtismaTurnTimer(){
if(atismaTurnTimer){clearInterval(atismaTurnTimer);atismaTurnTimer=null;}
}
function setAtismaPanelVisible(visible,playing=false){
const panel=document.getElementById('atisma-panel');
panel?.classList.toggle('hidden',!visible);
panel?.classList.toggle('atisma-playing',!!playing);
const game=document.getElementById('screen-game');
game?.classList.toggle('atisma-mode',!!visible);
game?.classList.toggle('atisma-playing',!!visible&&!!playing);
}
function atismaOwnPlacements(){
return mpRoomData?.atisma?.placements?.[mpRole]||{};
}
function atismaUsed(){
return mpRoomData?.atisma?.used||{};
}
function atismaPlacementCount(role){
const p=mpRoomData?.atisma?.placements?.[role]||{};
return Object.values(p).filter(v=>v==='trap').length;
}
function setAtismaPlacementWaiting(active){
const wait=document.getElementById('atisma-placement-wait');
const game=document.getElementById('screen-game');
const grid=document.getElementById('scrabble-grid');
wait?.classList.toggle('hidden',!active);
game?.classList.toggle('atisma-placement-waiting-active',!!active);
if(grid&&active)grid.style.pointerEvents='none';
if(grid&&!active&&atismaSetupActive&&!game?.classList.contains('atisma-setup-intro-active'))grid.style.pointerEvents='auto';
}
function updateAtismaPlacementWaitState(){
if(!isAtismaRoom()||!mpRole||String(mpRoomData?.status||'')!=='setup'){
setAtismaPlacementWaiting(false);return false;
}
const done=atismaPlacementCount(mpRole)>=PATLAMA_TRAP_COUNT;
setAtismaPlacementWaiting(done);
return done;
}
function bothAtismaPlacementsComplete(){
return atismaPlacementCount('host')>=PATLAMA_TRAP_COUNT&&atismaPlacementCount('guest')>=PATLAMA_TRAP_COUNT;
}
function renderAtismaPieces(){
const game=document.getElementById('screen-game');
if(game?.classList.contains('atisma-playing'))return;
document.querySelectorAll('.atisma-piece-own').forEach(el=>el.remove());
if(isLocalAtisma()){renderLocalAtismaTools();return;}
if(!isAtismaRoom()||!mpRole)return;
const own=atismaOwnPlacements(),used=atismaUsed()?.[mpRole]||{};
for(const [key,type] of Object.entries(own)){
const idx=Number(key),cell=domCells[idx];
if(!cell)continue;
const mark=document.createElement('span');
mark.className='atisma-piece-own'+(used?.[key]?' atisma-piece-used':'');
mark.textContent='🎈';
cell.appendChild(mark);
}
}
function renderAtismaTools(){
if(isLocalAtisma()){renderLocalAtismaTools();return;}
if(!isAtismaRoom()||!mpRole)return;
atismaTool='trap';
const own=atismaOwnPlacements();
const traps=Object.values(own).filter(v=>v==='trap').length;
const tc=document.getElementById('atisma-trap-count');
if(tc)tc.textContent=String(Math.max(0,PATLAMA_TRAP_COUNT-traps));
const tb=document.getElementById('atisma-trap-tool');
tb?.classList.add('atisma-tool-active');
if(tb)tb.disabled=traps>=PATLAMA_TRAP_COUNT;
renderAtismaPieces();
}
async function placeAtismaPiece(index,requestedType='trap'){
const type='trap';atismaTool='trap';
if(isLocalAtisma()){
if(!atismaSetupActive)return;
index=Number(index);if(!Number.isInteger(index)||index<0||index>=BOARD_SIZE*BOARD_SIZE)return;
const key=String(index),current=atismaLocalPlayerPlacements[key];
if(current==='trap'){delete atismaLocalPlayerPlacements[key];renderLocalAtismaTools();return;}
if(atismaLocalCount('trap')>=PATLAMA_TRAP_COUNT){showToast('Balon hakkın kalmadı.','slate');return;}
atismaLocalPlayerPlacements[key]='trap';
renderLocalAtismaTools();
if(atismaLocalCount('trap')>=PATLAMA_TRAP_COUNT){
stopAtismaSetupTimer();
atismaSetupActive=false;
document.getElementById('atisma-setup-notice')?.classList.add('hidden');
hideAtismaPlacementHint();
showToast('Balonlarını yerleştirdin\nİlk hamle sırası sende','orange',6500);
startLocalAtismaTurn('player');
}
return;
}
if(!atismaSetupActive||!isAtismaRoom()||!mpRoomRef||!mpRole)return;
index=Number(index);if(!Number.isInteger(index)||index<0||index>=BOARD_SIZE*BOARD_SIZE)return;
const own=atismaOwnPlacements(),current=own?.[String(index)]||null;
if(current==='trap'){await mpRoomRef.child('atisma/placements/'+mpRole+'/'+index).remove().catch(()=>{});return;}
const usedCount=Object.values(own).filter(v=>v==='trap').length;
if(usedCount>=PATLAMA_TRAP_COUNT){showToast('Balon hakkın kalmadı.','slate');return;}
try{
await mpRoomRef.child('atisma/placements/'+mpRole+'/'+index).set('trap');
if(usedCount+1>=PATLAMA_TRAP_COUNT)setAtismaPlacementWaiting(true);
}catch(_){}
renderAtismaTools();
}
function showPatlamaReaction(kind='laugh'){
const grid=document.getElementById('scrabble-grid');
if(!grid)return;
const r=grid.getBoundingClientRect();
if(!r.width||!r.height)return;
const fx=document.createElement('div');
fx.className='patlama-reaction-fx';
fx.textContent=kind==='cry'?'😭':'😂';
Object.assign(fx.style,{
  position:'fixed',
  left:(r.left+r.width/2)+'px',
  top:(r.top+r.height/2)+'px',
  transform:'translate(-50%,-50%) scale(.25)',
  transformOrigin:'50% 50%',
  fontSize:'clamp(62px,16vw,116px)',
  lineHeight:'1',
  opacity:'0',
  pointerEvents:'none',
  userSelect:'none',
  zIndex:'220',
  filter:'drop-shadow(0 6px 10px rgba(0,0,0,.28))'
});
document.body.appendChild(fx);
if(typeof fx.animate==='function'){
  const anim=fx.animate([
    {transform:'translate(-50%,-50%) scale(.25)',opacity:0},
    {transform:'translate(-50%,-50%) scale(1.18)',opacity:1,offset:.42},
    {transform:'translate(-50%,-50%) scale(1.42)',opacity:1,offset:.66},
    {transform:'translate(-50%,-50%) scale(.92)',opacity:0}
  ],{duration:1050,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});
  anim.onfinish=()=>fx.remove();
  anim.oncancel=()=>fx.remove();
}else{
  fx.style.transition='transform 900ms ease-out,opacity 900ms ease-out';
  requestAnimationFrame(()=>{fx.style.transform='translate(-50%,-50%) scale(1.35)';fx.style.opacity='1';});
  setTimeout(()=>{fx.style.opacity='0';fx.style.transform='translate(-50%,-50%) scale(.95)';},650);
  setTimeout(()=>fx.remove(),1100);
}
setTimeout(()=>{if(fx.isConnected)fx.remove();},1250);
}
function showAtismaEffects(effects){
if(!effects)return;
const traps=Array.from(effects.trap||[]);
traps.forEach((idx,i)=>{
const run=()=>{
const cell=domCells[Number(idx)];if(!cell)return;
playAtismaTrapExplosion(idx);
cell.querySelectorAll('.atisma-piece-hit').forEach(x=>x.remove());
const mark=document.createElement('span');mark.className='atisma-piece-hit atisma-piece-used';mark.textContent='🎈';cell.appendChild(mark);
};
if(i>0)setTimeout(run,i*140);else run();
});
}
function syncAtismaTurnUi(gs=mpRoomData){
if(!isAtismaRoom()||!mpRole)return;
/* v517: setup erken biterse eski yerleştirme kilidi oyunu bloke etmesin */
stopAtismaSetupTimer();
atismaSetupActive=false;
hideAtismaPlacementHint();
clearAtismaDrag();
document.getElementById('atisma-setup-notice')?.classList.add('hidden');
document.getElementById('screen-game')?.classList.remove('atisma-setup-intro-active','atisma-placement-waiting-active');
setAtismaPlacementWaiting(false);
const turn=String(gs?.turn||'host');
const mine=turn===mpRole;
isMatchActive=mine;
renderPatlamaTurnDots(Number(gs?.hostTurns||0),Number(gs?.guestTurns||0));
setAtismaPanelVisible(true,true);setPatlamaActivePlayer(turn==='host'?'p1':'p2');
const status=document.getElementById('atisma-phase-status');
if(status)status.textContent='';
const grid=document.getElementById('scrabble-grid');
if(grid){grid.style.pointerEvents=mine?'auto':'none';grid.style.opacity=mine?'1':'.70';grid.style.filter=mine?'':'saturate(.82) brightness(.92)';}
stopAtismaTurnTimer();
atismaLastSecondTick=null;
const deadline=Number(gs?.turnDeadline||0);
const tick=async()=>{
if(!isAtismaRoom()||!mpRoomRef||String(mpRoomData?.status||gs?.status)!=='playing'){stopAtismaTurnTimer();return;}
const left=Math.max(0,Math.ceil((deadline-serverNow())/1000));
updateGameTimerUI(left);playPatlamaSecondTick(left);
if(left<=0&&mpRole==='host'&&!atismaTimeoutBusy){
atismaTimeoutBusy=true;
try{
const currentTurn=String((await mpRoomRef.child('gameState/turn').once('value')).val()||'');
if(currentTurn===turn){
showToast('Süre doldu — sıra değişti.','slate',1200);
await atismaCompleteTurn(turn);
}
}finally{atismaTimeoutBusy=false;}
}
};
tick();atismaTurnTimer=setInterval(tick,250);
}
function activateAtismaSetup(gs){
if(!isAtismaRoom()||!mpRole)return;
atismaSetupActive=true;isMatchActive=false;
setAtismaPlacementWaiting(false);const setupGridReset=document.getElementById('scrabble-grid');if(setupGridReset){setupGridReset.style.opacity='1';setupGridReset.style.filter='';}
renderPatlamaTurnDots(Number(gs?.hostTurns||0),Number(gs?.guestTurns||0));setPatlamaActivePlayer(null);
setAtismaPanelVisible(true,false);
const noticeKey=String(gs?.setupEndAt||'');const gameEl=document.getElementById('screen-game');
if(gameEl?.dataset.atismaNoticeKey!==noticeKey){if(gameEl)gameEl.dataset.atismaNoticeKey=noticeKey;showAtismaSetupNotice();}
const grid=document.getElementById('scrabble-grid');
if(grid){
  const introActive=document.getElementById('screen-game')?.classList.contains('atisma-setup-intro-active');
  grid.style.pointerEvents=introActive?'none':'auto';
  grid.style.opacity='1';
  grid.style.touchAction='manipulation';
  if(introActive)setTimeout(()=>{if(atismaSetupActive&&grid)grid.style.pointerEvents='auto';},4000);
}
renderAtismaTools();
showAtismaPlacementHint();
stopAtismaSetupTimer();
atismaLastSecondTick=null;
const endAt=Number(gs?.setupEndAt||serverNow()+23000);
const tick=()=>{
const left=Math.max(0,Math.ceil((endAt-serverNow())/1000));
const shown=Math.min(20,left);updateGameTimerUI(shown);playPatlamaSecondTick(shown);
const status=document.getElementById('atisma-phase-status');
if(status)status.textContent='';
if(left<=0){
stopAtismaSetupTimer();atismaSetupActive=false;document.getElementById('atisma-setup-notice')?.classList.add('hidden');hideAtismaPlacementHint();
if(grid)grid.style.pointerEvents='none';
if(mpRole==='host')hostFinishAtismaSetup().catch(()=>{});
}
};
tick();atismaSetupTimer=setInterval(tick,250);
}
async function hostFinishAtismaSetup(requireBoth=false){
if(mpRole!=='host'||!mpRoomRef||!isAtismaRoom())return false;
if(requireBoth){
const at=(await mpRoomRef.child('atisma/placements').once('value')).val()||{};
const count=role=>Object.values(at?.[role]||{}).filter(v=>v==='trap').length;
if(count('host')<PATLAMA_TRAP_COUNT||count('guest')<PATLAMA_TRAP_COUNT)return false;
}
const playAt=serverNow();
const tx=await mpRoomRef.child('gameState').transaction(gs=>{
if(!gs||gs.status!=='setup')return;
gs.status='playing';
gs.startAt=playAt;
gs.turn='host';
gs.hostTurns=0;
gs.guestTurns=0;
gs.turnStartedAt=playAt;
gs.turnDeadline=playAt+10000;
return gs;
},undefined,false).catch(()=>null);
if(!tx?.committed)return false;
await mpRoomRef.child('atisma/used').remove().catch(()=>{});
return true;
}
async function hostStartAtismaSetup(){
if(mpRole!=='host'||!mpRoomRef||!isAtismaRoom())return;
const now=serverNow();
const tx=await mpRoomRef.child('gameState').transaction(gs=>{
if(!gs||gs.status!=='waiting')return;
gs.status='setup';
gs.startAt=0;
gs.setupEndAt=now+23000;
gs.turn='host';
gs.hostTurns=0;
gs.guestTurns=0;
gs.turnStartedAt=0;
gs.turnDeadline=0;
return gs;
},undefined,false).catch(()=>null);
if(!tx?.committed)return;
await mpRoomRef.update({
'atisma/placements':{host:{},guest:{}},
'atisma/used':null,
'atisma/blastedWords':null
});
}
async function atismaCompleteTurn(expectedRole=mpRole){
if(!isAtismaRoom()||!mpRoomRef||!expectedRole)return false;
const now=serverNow();
const tx=await mpRoomRef.child('gameState').transaction(gs=>{
if(!gs||gs.status!=='playing'||gs.turn!==expectedRole)return;
let hostTurns=Number(gs.hostTurns||0),guestTurns=Number(gs.guestTurns||0);
if(expectedRole==='host')hostTurns=Math.min(10,hostTurns+1);
else guestTurns=Math.min(10,guestTurns+1);
gs.hostTurns=hostTurns;gs.guestTurns=guestTurns;
if(hostTurns>=10&&guestTurns>=10){
gs.status='resolving';gs.startAt=0;gs.turnDeadline=0;gs.turnStartedAt=0;
return gs;
}
const next=expectedRole==='host'?'guest':'host';
gs.turn=next;gs.turnStartedAt=now;gs.turnDeadline=now+10000;
return gs;
},undefined,false).catch(()=>null);
return !!tx?.committed;
}
async function atismaPassTurn(){
await waitAtismaTurnHandoff();
return atismaCompleteTurn(mpRole);
}
async function hostFinalizeAtisma(){
if(mpRole!=='host'||!mpRoomRef||!isAtismaRoom())return;
const gsSnap=await mpRoomRef.child('gameState').once('value');
const gs=gsSnap.val()||{};if(gs.status!=='resolving')return;
await hostApplyLongestWordBonus();
const scoreSnap=await mpRoomRef.child('scores').once('value');
const sc=scoreSnap.val()||{host:0,guest:0},hs=Number(sc.host||0),guestScore=Number(sc.guest||0);
await mpRoomRef.update({
'finalWinner':hs===guestScore?'tie':(hs>guestScore?'host':'guest'),
'gameState/status':'finished',
'gameState/startAt':0,
'gameState/turnDeadline':0,
'rematch':{host:false,guest:false,expiresAt:0,round:Number(gs.round||1)},
'pendingRound':null
});
}
async function atismaPenaltyAndPass(word,delta=-3){
if(!isAtismaRoom()||!mpRoomRef||!mpRole)return false;
const gs=(await mpRoomRef.child('gameState').once('value')).val()||{};
if(gs.status!=='playing'||gs.turn!==mpRole){showToast('Sıra rakibinde.','slate');return true;}
await mpRoomRef.child('scores/'+mpRole).transaction(v=>Number(v||0)+Number(delta||0)).catch(()=>{});
await atismaPassTurn();
return true;
}
async function submitAtismaWord(word,pts,isP1,scoreFxOrigin){
if(!isAtismaRoom()||!mpRoomRef||!mpRole)return false;
const gs=(await mpRoomRef.child('gameState').once('value')).val()||{};
if(gs.status!=='playing'||gs.turn!==mpRole){showToast('Sıra rakibinde.','slate');return true;}
const normalizedWord=word.toLocaleUpperCase('tr-TR');
const wordKey=encodeURIComponent(normalizedWord).replace(/\./g,'%2E');
const atSnap=await mpRoomRef.child('atisma').once('value');
const data=atSnap.val()||{},opponent=mpRole==='host'?'guest':'host';
if(data.blastedWords?.[wordKey]){
await mpRoomRef.child('scores/'+mpRole).transaction(v=>Number(v||0)-5).catch(()=>{});
playErrorBuzzer();flashWordFeedback(false);breakCombo(isP1);showToast(normalizedWord+' PATLADI -5','rose',1500);
await atismaPassTurn();
return true;
}
const opp=data.placements?.[opponent]||{},used=data.used?.[opponent]||{};
const pathIds=selectedPath.map(p=>p.r*BOARD_SIZE+p.c);
const trapHits=[];
for(const idx of pathIds){const key=String(idx);if(used[key])continue;if(opp[key]==='trap')trapHits.push(idx);}
const trapped=trapHits.length>0;
const claimPts=trapped?0:pts;
const claimRef=mpRoomRef.child('words').child(wordKey);
const tx=await claimRef.transaction(current=>{
if(current!==null)return;
return{
word:normalizedWord,role:mpRole,pts:claimPts,basePts:pts,stolenBy:trapped?opponent:null,blasted:trapped,
round:Number(mpRoomData?.round||1),path:encodeClaimPath(selectedPath),
last:selectedPath.length?{r:selectedPath[selectedPath.length-1].r,c:selectedPath[selectedPath.length-1].c}:null,
effects:{trap:trapHits},at:firebase.database.ServerValue.TIMESTAMP
};
},undefined,false);
if(!tx.committed){
const existingSnap=await claimRef.once('value').catch(()=>null);
const existing=existingSnap?.val?.()||null;
if(existing?.blasted||((existing?.effects?.trap||[]).length>0)){
await mpRoomRef.child('scores/'+mpRole).transaction(v=>Number(v||0)-5).catch(()=>{});
playErrorBuzzer();flashWordFeedback(false);breakCombo(isP1);showToast(normalizedWord+' PATLADI -5','rose',1500);
}else showToast(word+'(DAHA ÖNCE BULUNDU)','rose',1500);
await atismaPassTurn();return true;
}
if(trapped)await mpRoomRef.child('scores/'+opponent).transaction(v=>Number(v||0)+pts);
else await mpRoomRef.child('scores/'+mpRole).transaction(v=>Number(v||0)+pts);
const updates={};
for(const idx of trapHits)updates['atisma/used/'+opponent+'/'+idx]=true;
if(trapped)updates['atisma/blastedWords/'+wordKey]=true;
if(Object.keys(updates).length)await mpRoomRef.update(updates);
showAtismaEffects({trap:trapHits});
if(trapped)showPatlamaReaction('cry');
selectedPath.forEach(p=>p.el.classList.add(isP1?'tile-claimed-p1':'tile-claimed-p2'));
addTickerBadge(word,isP1);
flyScore(pts,trapped?!isP1:isP1,scoreFxOrigin);
if(trapped){playErrorBuzzer();flashWordFeedback(false);breakCombo(isP1);showToast(`🎈 TUZAK! ${word} puanı rakibe geçti: +${pts}`,'rose',1900);}
else{playCorrectChime();flashWordFeedback(true);rewardWordFx(isP1);playWordConfetti(word.length);showToast(`${word}(+${pts})`,isP1?'amber':'sky',1800);}
await waitAtismaTurnHandoff();
await atismaCompleteTurn(mpRole);
return true;
}
async function createAtismaRoom(){
if(privateRoomCreateBusy)return false;
privateRoomCreateBusy=true;
try{
setPrivateRoomProgress('PATLAMA HAZIRLANIYOR…');
if(!await waitFirebaseConnected(8000)){showToast('Sunucuya bağlanılamadı.','rose');return false;}
await ensureWordDataLoaded();
const readyBoard=prewarmedBoard||generateOptimizedBoard(3);prewarmedBoard=null;rememberBoard(readyBoard.board,readyBoard.words);
const created=await createCleanRoomRecord({schema:22,mode:'invite-only-patlama-v1',hostId:getClientToken(),board:readyBoard.board,inviteGuest:'pending'});
mpRoomCode=created.code;mpRole='host';mpRoomRef=created.ref;mpRoomMode='invite-only-patlama-v1';mpRandomMatchSession=false;
delete document.body.dataset.randomMatchActive;document.body.dataset.privateFriendActive='1';
mpRoomData=null;mpEntered=false;mpStarted=false;mpSessionJoinedAt=serverNow();mpExitHandling=false;mpLastExitSignalId='';
await created.ref.child('atisma').set({placements:{host:{},guest:{}},used:null,blastedWords:null});
setRoomUrl(mpRoomCode);await markPresence();setMpPanelRoom(mpRoomCode);document.getElementById('btn-close-room')?.classList.remove('hidden');setMpState(MP_STATES.WAITING);attachRoomListener();
return true;
}catch(err){console.error('Atisma room create error',err);showToast('PATLAMA odası açılamadı.','rose');return false;}
finally{privateRoomCreateBusy=false;}
}
async function openFreshAtismaRoom(){
if(randomSearchActive)await cleanupRandomQueue(true);
await discardCurrentPrivateRoom();
setDifficultyOpen(false);
document.getElementById('friend-invite-panel')?.classList.remove('hidden');
document.getElementById('mp-create-view')?.classList.add('hidden');
document.getElementById('mp-room-view')?.classList.remove('hidden');
document.getElementById('btn-close-room')?.classList.remove('hidden');
setPrivateInviteControlsReady(false);
const ok=await createAtismaRoom();
if(ok){setPrivateInviteControlsReady(true,mpRoomCode);showToast('PATLAMA deneme odası hazır. Bağlantıyı gönder.','emerald',1800);}
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
let accountRoomMode='kapisma';
let accountRoomPresenceRef=null,activeMemberRoomNo='',activeMemberRoomOwner=false;
function accountErrorMessage(err){
const code=String(err?.code||err?.message||'');
if(code.includes('invalid-credential')||code.includes('wrong-password')||code.includes('user-not-found'))return 'E-posta veya şifre hatalı.';
if(code.includes('email-already-in-use'))return 'Bu e-posta ile daha önce hesap açılmış. Giriş Yap bölümünü deneyin.';
if(code.includes('weak-password'))return 'Şifre en az 6 karakter olmalı.';
if(code.includes('invalid-email'))return 'Geçerli bir e-posta yazın.';
if(code.includes('too-many-requests'))return 'Çok fazla deneme yapıldı. Biraz sonra tekrar deneyin.';
if(code.includes('network-request-failed'))return 'Bağlantı sorunu oluştu. İnternet bağlantınızı kontrol edin.';
if(code.includes('account-exists-with-different-credential'))return 'Bu e-posta başka bir giriş yöntemiyle kayıtlı olabilir.';
if(code.includes('credential-already-in-use'))return 'Bu giriş bilgisi başka bir hesapta kullanılıyor.';
if(code.includes('popup-closed-by-user'))return '';
if(code.includes('popup-blocked'))return 'Tarayıcı giriş penceresini engelledi.';
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
const submit=document.getElementById('btn-account-submit');
if(submit)submit.textContent=accountFormMode==='signup'?'ÜYE OL':'GİRİŞ YAP';
document.getElementById('btn-account-forgot')?.classList.toggle('hidden',accountFormMode!=='login');
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
function normalizeAccountRoomMode(mode){return ['patlama','gokdelen'].includes(mode)?mode:'kapisma';}
function paintAccountRoomMode(mode){
accountRoomMode=normalizeAccountRoomMode(mode);
document.getElementById('btn-account-room-kapisma')?.classList.toggle('selected',accountRoomMode==='kapisma');
document.getElementById('btn-account-room-patlama')?.classList.toggle('selected',accountRoomMode==='patlama');
document.getElementById('btn-account-room-gokdelen')?.classList.toggle('selected',accountRoomMode==='gokdelen');
}
async function setAccountRoomMode(mode){
accountRoomMode=normalizeAccountRoomMode(mode);
paintAccountRoomMode(accountRoomMode);
const user=accountAuth?.currentUser;
if(user&&accountDb){
try{
await accountDb.ref('users/'+user.uid).update({roomMode:accountRoomMode,updatedAt:Date.now()});
accountProfile={...(accountProfile||{}),roomMode:accountRoomMode};
}catch(_){}
}
}
function paintAccountRoom(profile){
const roomNo=String(profile?.roomNo||'');
paintAccountRoomMode(profile?.roomMode||'kapisma');
const no=document.getElementById('account-room-number');
const link=document.getElementById('account-room-link');
if(no)no.textContent=roomNo||'------';
if(link)link.textContent=roomNo?'kapmaca.tr/?room='+roomNo:'kapmaca.tr/?room=------';
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
const selectedMode=normalizeAccountRoomMode(accountRoomMode||accountProfile?.roomMode);
const ok=selectedMode==='gokdelen'?await window.gokdelenNetwork.createPrivate():selectedMode==='patlama'?await createAtismaRoom():await createRoom();
if(!ok)throw new Error('member-room-create-failed');
await accountDb.ref('memberRooms/'+roomNo).update({online:true,activeRoomCode:mpRoomCode,activeMode:selectedMode,updatedAt:firebase.database.ServerValue.TIMESTAMP});
setRoomUrl(roomNo);
setPrivateInviteControlsReady(true,roomNo);
await beginPrivateHostWaiting(true,false);
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
return{nickname:fallback,roomMode:'kapisma',games:0,wins:0,losses:0,bestScore:0,longestWord:'',createdAt:Date.now(),updatedAt:Date.now()};
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
const homeLabel=document.getElementById('account-home-label');if(homeLabel)homeLabel.textContent='Üyelik';
return;
}
setAccountLoading(true);
const profile=await loadAccountProfile(user);
guest.classList.add('hidden');signed.classList.remove('hidden');
const name=String(profile?.nickname||user.displayName||'Oyuncu').slice(0,18);
const nameEl=document.getElementById('account-user-name');if(nameEl)nameEl.textContent=name;
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
function refreshAfterAccountLogin(){
setTimeout(()=>{window.location.reload();},180);
}

document.getElementById('btn-account-login')?.addEventListener('click',()=>setAccountForm('login'));
document.getElementById('btn-account-signup')?.addEventListener('click',()=>setAccountForm('signup'));
let accountSubmitBusy=false;
document.getElementById('btn-account-submit')?.addEventListener('click',async()=>{
if(accountSubmitBusy)return;
setAccountMessage('');
const email=String(document.getElementById('account-email')?.value||'').trim();
const password=String(document.getElementById('account-password')?.value||'');
const nickname=String(document.getElementById('account-nickname')?.value||'').trim().slice(0,18);
if(!email||!password){setAccountMessage('E-posta ve şifre gerekli.');return;}
if(accountFormMode==='signup'&&!nickname){setAccountMessage('Bir takma ad yazın.');return;}
const btn=document.getElementById('btn-account-submit');
accountSubmitBusy=true;
if(btn){
btn.disabled=true;
btn.classList.add('account-busy');
btn.textContent=accountFormMode==='signup'?'ÜYELİK OLUŞTURULUYOR':'GİRİŞ YAPILIYOR';
}
try{
await ensureAccountBackend();
if(accountFormMode==='signup'){
const cred=await accountAuth.createUserWithEmailAndPassword(email,password);
await cred.user.updateProfile({displayName:nickname});
const data={...defaultAccountProfile(cred.user),nickname,updatedAt:Date.now()};
await accountDb.ref('users/'+cred.user.uid).set(data);
await renderAccountState(cred.user);
setAccountMessage('Üyelik oluşturuldu ✓',true);
setTimeout(()=>{document.getElementById('account-email-form')?.classList.add('hidden');},900);
}else{
const cred=await accountAuth.signInWithEmailAndPassword(email,password);
await renderAccountState(cred.user);
setAccountMessage('Giriş başarılı ✓',true);
setTimeout(()=>refreshAfterAccountLogin(),550);
}
}catch(err){
console.error('Account submit error',err);
setAccountMessage(accountErrorMessage(err));
}finally{
accountSubmitBusy=false;
if(btn){
btn.disabled=false;
btn.classList.remove('account-busy');
btn.textContent=accountFormMode==='signup'?'ÜYE OL':'GİRİŞ YAP';
}
}
});
document.getElementById('btn-account-forgot')?.addEventListener('click',async()=>{
const email=String(document.getElementById('account-email')?.value||'').trim();
if(!email){setAccountMessage('Şifre sıfırlama bağlantısı için e-posta adresinizi yazın.');return;}
try{
await ensureAccountBackend();
await accountAuth.sendPasswordResetEmail(email);
setAccountMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi ✓',true);
}catch(err){
console.error('Password reset error',err);
const msg=accountErrorMessage(err);
setAccountMessage(msg||'Şifre sıfırlama bağlantısı gönderilemedi.');
}
});
async function signInWithAccountProvider(providerFactory,configure){
setAccountMessage('');
try{
await ensureAccountBackend();
const provider=providerFactory();
if(configure)configure(provider);
const cred=await accountAuth.signInWithPopup(provider);
await renderAccountState(cred.user);
refreshAfterAccountLogin();
}catch(err){
const msg=accountErrorMessage(err);
if(msg)setAccountMessage(msg);
}
}
document.getElementById('btn-account-google')?.addEventListener('click',()=>{
signInWithAccountProvider(
()=>new firebase.auth.GoogleAuthProvider(),
provider=>provider.setCustomParameters({prompt:'select_account'})
);
});
document.getElementById('btn-account-github')?.addEventListener('click',()=>{
signInWithAccountProvider(()=>new firebase.auth.GithubAuthProvider());
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
if(!nickname){setAccountUserMessage('Takma ad boş bırakılamaz.',false);return;}
try{
await user.updateProfile({displayName:nickname});
await accountDb.ref('users/'+user.uid).update({nickname,updatedAt:Date.now()});
accountProfile={...(accountProfile||{}),nickname};
await renderAccountState(user);
document.getElementById('account-profile-editor')?.classList.add('hidden');
setAccountUserMessage('Profil güncellendi ✓');
}catch(err){setAccountUserMessage(accountErrorMessage(err),false);}
});
document.getElementById('btn-account-delete')?.addEventListener('click',async()=>{
const user=accountAuth?.currentUser;
if(!user||!accountDb)return;
const lastSignIn=Date.parse(user.metadata?.lastSignInTime||'');
if(Number.isFinite(lastSignIn)&&Date.now()-lastSignIn>10*60*1000){
setAccountUserMessage('Güvenlik için önce çıkış yapıp yeniden giriş yapın, sonra hesabı silin.',false);
return;
}
if(!window.confirm('Hesabınız, takma adınız ve özel oda bilgileriniz silinecek. Emin misiniz?'))return;
const btn=document.getElementById('btn-account-delete');
if(btn){btn.disabled=true;btn.textContent='HESAP SİLİNİYOR…';}
const uid=user.uid;
const roomNo=String(accountProfile?.roomNo||'');
try{
await stopMemberRoomPresence();
const removals=[accountDb.ref('users/'+uid).remove()];
if(/^\d{6,7}$/.test(roomNo))removals.push(accountDb.ref('memberRooms/'+roomNo).remove());
await Promise.all(removals);
await user.delete();
accountProfile=null;activeMemberRoomNo='';activeMemberRoomOwner=false;
setAccountUserMessage('');
showToast('Hesap silindi.','slate',1400);
closeAccountScreen();
setTimeout(()=>window.location.reload(),350);
}catch(err){
console.error('Account delete error',err);
if(String(err?.code||'').includes('requires-recent-login')){
setAccountUserMessage('Güvenlik için çıkış yapıp yeniden giriş yaptıktan sonra tekrar deneyin.',false);
}else{
setAccountUserMessage(accountErrorMessage(err),false);
}
try{if(accountAuth?.currentUser)await renderAccountState(accountAuth.currentUser);}catch(_){}
}finally{
if(btn){btn.disabled=false;btn.textContent='HESABIMI SİL';}
}
});
document.getElementById('btn-account-room-kapisma')?.addEventListener('click',()=>setAccountRoomMode('kapisma'));
document.getElementById('btn-account-room-gokdelen')?.addEventListener('click',()=>setAccountRoomMode('gokdelen'));
document.getElementById('btn-account-room-patlama')?.addEventListener('click',()=>setAccountRoomMode('patlama'));
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
navigator.serviceWorker.register('./sw.js?v=642-gokdelen-undo',{scope:'./',updateViaCache:'none'}).catch(()=>{});
},{once:true});
}
const homeGameSubmodes=document.getElementById('home-game-submodes');
const kapismaModeBtn=document.getElementById('btn-mode-kapisma');
const patlamaModeBtn=document.getElementById('btn-mode-patlama');
function closeHomeGameChildren(){
setDifficultyOpen(false);
document.getElementById('friend-invite-panel')?.classList.add('hidden');
document.getElementById('mp-create-view')?.classList.remove('hidden');
document.getElementById('mp-room-view')?.classList.add('hidden');
}
function parkHomeGameSubmodes(){
const picker=document.getElementById('home-game-mode-picker');
if(picker&&homeGameSubmodes&&picker.contains(homeGameSubmodes))picker.after(homeGameSubmodes);
}
function selectHomeGameMode(mode){
const normalized=['patlama','gokdelen'].includes(mode)?mode:'kapisma';
if(normalized==='gokdelen')document.body.dataset.gokdelenMenu='1';else delete document.body.dataset.gokdelenMenu;
const sameOpen=selectedHomeGameMode===normalized&&!homeGameSubmodes?.classList.contains('hidden');
if(sameOpen){
selectedHomeGameMode=null;
homeGameSubmodes?.classList.add('hidden');
kapismaModeBtn?.classList.remove('selected');
patlamaModeBtn?.classList.remove('selected');
document.getElementById('btn-mode-gokdelen')?.classList.remove('selected');
delete document.body.dataset.gokdelenMenu;
closeHomeGameChildren();
parkHomeGameSubmodes();
return;
}
selectedHomeGameMode=normalized;
const selectedBtn=normalized==='gokdelen'?document.getElementById('btn-mode-gokdelen'):normalized==='patlama'?patlamaModeBtn:kapismaModeBtn;
const selectedRow=selectedBtn?.closest('.home-mode-guide-row');
(selectedRow||selectedBtn)?.after(homeGameSubmodes);
homeGameSubmodes?.classList.remove('hidden');
kapismaModeBtn?.classList.toggle('selected',normalized==='kapisma');
patlamaModeBtn?.classList.toggle('selected',normalized==='patlama');
document.getElementById('btn-mode-gokdelen')?.classList.toggle('selected',normalized==='gokdelen');
closeHomeGameChildren();
}
document.getElementById('btn-mode-gokdelen')?.addEventListener('click',()=>selectHomeGameMode('gokdelen'));
document.getElementById('btn-guide-gokdelen')?.addEventListener('click',()=>document.getElementById('modal-gokdelen-guide')?.classList.remove('hidden'));
document.getElementById('btn-gokdelen-guide-close')?.addEventListener('click',()=>document.getElementById('modal-gokdelen-guide')?.classList.add('hidden'));
kapismaModeBtn?.addEventListener('click',()=>selectHomeGameMode('kapisma'));
patlamaModeBtn?.addEventListener('click',()=>selectHomeGameMode('patlama'));
document.getElementById('btn-solo-mode').onclick=()=>{
if(!selectedHomeGameMode)selectedHomeGameMode='kapisma';
document.getElementById('friend-invite-panel').classList.add('hidden');
const opening=difficultyPanel.classList.contains('hidden');
setDifficultyOpen(opening);
if(opening&&!wordDataReady){
ensureWordDataLoaded().then(()=>scheduleBoardPrewarm()).catch(()=>{});
}
};
document.getElementById('btn-close-difficulty').onclick=(e)=>{e.stopPropagation();setDifficultyOpen(false);};
document.getElementById('btn-friend-mode').onclick=async()=>{
if(!selectedHomeGameMode)selectedHomeGameMode='kapisma';
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
document.getElementById('btn-create-room')?.addEventListener('click',()=>selectedHomeGameMode==='gokdelen'?window.gokdelenNetwork.openPrivate():selectedHomeGameMode==='patlama'?openFreshAtismaRoom():openFreshPrivateRoom());
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
navigator.share({
title:isGokdelenRoom()?'KAPMACA - GÖKDELEN':isAtismaRoom()?'KAPMACA - PATLAMA':'KAPMACA - Sözcük Avı',
text:isGokdelenRoom()?'GÖKDELEN’de sırayla sözcükler kurup binayı yükseltelim!':isAtismaRoom()?'🎈 PATLAMA! 7 balonunu gizle, 10 turda rakibinin puanını kap. Bana karşı oyna!':'🔥 60 saniye. Aynı harfler. Kim daha çok sözcük bulacak? KAPMACA\'da bana karşı oyna!',
url
}).catch(()=>{});
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
document.getElementById('atisma-trap-tool')?.addEventListener('click',()=>{atismaTool='trap';isLocalAtisma()?renderLocalAtismaTools():renderAtismaTools();});
document.getElementById('atisma-trap-tool')?.addEventListener('pointerdown',e=>beginAtismaDrag('trap',e));
document.addEventListener('pointermove',e=>{if(atismaDragType)moveAtismaDrag(e.clientX,e.clientY);},{passive:true});
document.addEventListener('pointerup',e=>{if(atismaDragType)endAtismaDrag(e);},{passive:false});
document.addEventListener('pointercancel',()=>clearAtismaDrag(),{passive:true});
document.getElementById('scrabble-grid')?.addEventListener('pointerdown',e=>{
if(!atismaSetupActive||(!isAtismaRoom()&&!isLocalAtisma()))return;
if(atismaDragType)return;
e.preventDefault();e.stopImmediatePropagation();
pulseAtismaPlacementHint();
},true);
document.getElementById('scrabble-grid')?.addEventListener('click',e=>{
if(!atismaSetupActive||(!isAtismaRoom()&&!isLocalAtisma()))return;
e.preventDefault();e.stopPropagation();
if(performance.now()-atismaLastBalloonDropAt>450)pulseAtismaPlacementHint();
},true);
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
try{
await ensureWordDataLoaded();
if(selectedHomeGameMode==='gokdelen')await window.openKapmacaKesisim();
else if(selectedHomeGameMode==='patlama')prepareLocalAtisma();
else prepareGame();
}catch(err){console.error('Single game startup failed',err);showToast('Oyun hazırlanamadı. Tekrar deneyin.','rose');}
};
});
let howtoDemoTimer=null;
function stopHowtoDemo(){clearTimeout(howtoDemoTimer);howtoDemoTimer=null;}
function clearDemoRoute(board){
const svg=board?.querySelector(':scope > .demo-route-layer');
if(svg)svg.remove();
}
function renderDemoRoute(board,path,count,isP1=true){
if(!board||!Array.isArray(path)||count<1)return;
let svg=board.querySelector(':scope > .demo-route-layer');
const ns='http://www.w3.org/2000/svg';
if(!svg){
svg=document.createElementNS(ns,'svg');
svg.classList.add('demo-route-layer');
svg.setAttribute('aria-hidden','true');
Object.assign(svg.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',overflow:'visible',zIndex:'5'});
const line=document.createElementNS(ns,'polyline');
line.classList.add('demo-route-line');
const routeColor=isP1?'#f97316':'#2563eb';
line.setAttribute('fill','none');line.setAttribute('stroke',routeColor);line.setAttribute('stroke-width','1.8');
line.setAttribute('stroke-linecap','round');line.setAttribute('stroke-linejoin','round');line.setAttribute('opacity','.94');
const head=document.createElementNS(ns,'polygon');
head.classList.add('demo-route-head');head.setAttribute('fill',routeColor);head.setAttribute('opacity','.98');
svg.append(line,head);board.appendChild(svg);
}
const tiles=[...board.querySelectorAll('.demo-tile')];
svg.setAttribute('viewBox',`0 0 ${board.clientWidth} ${board.clientHeight}`);
svg.setAttribute('preserveAspectRatio','none');
const pts=path.slice(0,count).map(i=>tiles[i]).filter(Boolean).map(el=>({x:el.offsetLeft+el.offsetWidth/2,y:el.offsetTop+el.offsetHeight/2}));
const line=svg.querySelector('.demo-route-line'),head=svg.querySelector('.demo-route-head');
if(!pts.length){svg.style.display='none';return;}
svg.style.display='';
line.setAttribute('points',pts.map(p=>`${p.x},${p.y}`).join(' '));
if(pts.length<2){head.setAttribute('points','');return;}
const a=pts[pts.length-2],b=pts[pts.length-1],ang=Math.atan2(b.y-a.y,b.x-a.x),size=5.2;
const backX=b.x-Math.cos(ang)*size,backY=b.y-Math.sin(ang)*size;
const wing=size*.5,px=-Math.sin(ang)*wing,py=Math.cos(ang)*wing;
head.setAttribute('points',`${b.x},${b.y} ${backX+px},${backY+py} ${backX-px},${backY-py}`);
}
function startHowtoDemo(){
if(howtoDemoTimer||document.hidden||isFullscreenActive())return;
const boards=[...document.querySelectorAll('.demo-board:not(.patlama-howto-demo-board)')];
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
const isP1=round%2===0;
const setPicked=(count)=>{
const chars=Array.from(item.word).slice(0,count);
for(const board of visible){
const wrap=board.closest('.mp-demo')||board.parentElement;
const picked=wrap?.querySelector('.demo-picked');
if(!picked)continue;
picked.replaceChildren(...chars.map(ch=>{
const tile=document.createElement('span');
tile.className='demo-picked-tile '+(isP1?'demo-picked-p1':'demo-picked-p2');
tile.textContent=ch;
return tile;
}));
}
};
if(step===0){
for(const board of visible){
board.querySelectorAll('.demo-active-p1,.demo-active-p2').forEach(t=>t.classList.remove('demo-active-p1','demo-active-p2'));
clearDemoRoute(board);
}
setPicked(0);
}
if(step<item.path.length){
for(const board of visible)board.querySelectorAll('.demo-tile')[item.path[step]]?.classList.add(isP1?'demo-active-p1':'demo-active-p2');
step++;
for(const board of visible)renderDemoRoute(board,item.path,step,isP1);
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
const startInitialHomeDemo=()=>startHowtoDemo();
if('requestIdleCallback' in window)requestIdleCallback(startInitialHomeDemo,{timeout:650});
else setTimeout(startInitialHomeDemo,180);
let patlamaHowtoDemoTimer=null;
function stopPatlamaHowtoDemo(){
  if(patlamaHowtoDemoTimer){clearTimeout(patlamaHowtoDemoTimer);patlamaHowtoDemoTimer=null;}
  const board=document.getElementById('howto-patlama-demo-board');
  const picked=document.querySelector('#howto-patlama-panel .patlama-demo-picked');
  board?.querySelectorAll('.demo-active-p1,.demo-active-p2,.demo-balloon-pop').forEach(t=>t.classList.remove('demo-active-p1','demo-active-p2','demo-balloon-pop'));
  if(board)clearDemoRoute(board);
  picked?.replaceChildren();
}
function startPatlamaHowtoDemo(){
  if(patlamaHowtoDemoTimer||document.hidden||isFullscreenActive())return;
  const panel=document.getElementById('howto-patlama-panel');
  const board=document.getElementById('howto-patlama-demo-board');
  const picked=panel?.querySelector('.patlama-demo-picked');
  if(!panel||panel.classList.contains('hidden')||!board||!picked)return;
  const rounds=[
    {word:'KAP',path:[7,8,9]},
    {word:'CAM',path:[12,11,10]},
    {word:'TAŞ',path:[18,11,4]},
    {word:'SAL',path:[6,13,20]}
  ];
  const tiles=[...board.querySelectorAll('.demo-tile')];
  let round=0,step=0,popping=false;
  const setPicked=(item,count,isP1)=>{
    picked.replaceChildren(...Array.from(item.word).slice(0,count).map(ch=>{
      const t=document.createElement('span');
      t.className='demo-picked-tile '+(isP1?'demo-picked-p1':'demo-picked-p2');
      t.textContent=ch;
      return t;
    }));
  };
  function advance(){
    if(document.hidden||panel.classList.contains('hidden')||document.getElementById('screen-howto')?.classList.contains('hidden')||isFullscreenActive()){
      stopPatlamaHowtoDemo();return;
    }
    const item=rounds[round],isP1=round%2===0;
    if(step===0&&!popping){
      tiles.forEach(t=>t.classList.remove('demo-active-p1','demo-active-p2','demo-balloon-pop'));
      clearDemoRoute(board);
      setPicked(item,0,isP1);
    }
    if(step<item.path.length){
      tiles[item.path[step]]?.classList.add(isP1?'demo-active-p1':'demo-active-p2');
      step++;
      renderDemoRoute(board,item.path,step,isP1);
      setPicked(item,step,isP1);
      patlamaHowtoDemoTimer=setTimeout(()=>{patlamaHowtoDemoTimer=null;advance();},180);
      return;
    }
    if(!popping){
      popping=true;
      item.path.map(i=>tiles[i]).filter(t=>t?.classList.contains('demo-balloon')).forEach((t,n)=>{
        setTimeout(()=>t.classList.add('demo-balloon-pop'),n*70);
      });
      patlamaHowtoDemoTimer=setTimeout(()=>{patlamaHowtoDemoTimer=null;advance();},620);
      return;
    }
    round=(round+1)%rounds.length;step=0;popping=false;
    patlamaHowtoDemoTimer=setTimeout(()=>{patlamaHowtoDemoTimer=null;advance();},350);
  }
  advance();
}
function setHowtoMode(mode='kapisma'){
const patlama=mode==='patlama';
document.getElementById('howto-kapisma-panel')?.classList.toggle('hidden',patlama);
document.getElementById('howto-patlama-panel')?.classList.toggle('hidden',!patlama);
document.getElementById('btn-howto-kapisma')?.classList.toggle('active',!patlama);
document.getElementById('btn-howto-patlama')?.classList.toggle('active',patlama);
if(patlama){
  stopHowtoDemo();
  startPatlamaHowtoDemo();
}else{
  stopPatlamaHowtoDemo();
  startHowtoDemo();
}
}
document.getElementById('btn-howto-kapisma')?.addEventListener('click',()=>setHowtoMode('kapisma'));
document.getElementById('btn-howto-patlama')?.addEventListener('click',()=>setHowtoMode('patlama'));
document.addEventListener('click',(event)=>{
const target=event.target?.closest?.('#btn-close-account,#btn-settings-back,#btn-guide-kapisma,#btn-guide-patlama,#btn-howto-back,#btn-about-back,#btn-close-recommend,#btn-close-support');
if(!target)return;
switch(target.id){
case 'btn-close-account':
closeAccountScreen();
break;
case 'btn-settings-back':
document.getElementById('screen-settings')?.classList.add('hidden');
break;
case 'btn-guide-kapisma':
document.getElementById('screen-howto')?.classList.remove('hidden');
setHowtoMode('kapisma');
break;
case 'btn-guide-patlama':
document.getElementById('screen-howto')?.classList.remove('hidden');
setHowtoMode('patlama');
break;
case 'btn-howto-back':
document.getElementById('screen-howto')?.classList.add('hidden');
stopPatlamaHowtoDemo();
break;
case 'btn-about-back':
document.getElementById('screen-about')?.classList.add('hidden');
break;
case 'btn-close-recommend':
closeRecommendModal();
break;
case 'btn-close-support':
document.getElementById('screen-support')?.classList.add('hidden');
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
document.getElementById('btn-account-home')?.addEventListener('click',(event)=>{
  event.preventDefault();
  event.stopPropagation();
  openAccountScreen();
});
document.getElementById('btn-recommend')?.addEventListener('click',(event)=>{
  event.preventDefault();
  event.stopPropagation();
  openRecommendModal();
});
document.getElementById('btn-settings')?.addEventListener('click',(event)=>{
  event.preventDefault();event.stopPropagation();
  setMasterSoundVolume(masterSoundVolume);
  renderVibrationControls();
  document.getElementById('screen-settings')?.classList.remove('hidden');
});
document.getElementById('btn-about')?.addEventListener('click',(event)=>{
  event.preventDefault();event.stopPropagation();
  document.getElementById('screen-about')?.classList.remove('hidden');
});
document.getElementById('btn-open-dictionary')?.addEventListener('click',(event)=>{
  event.preventDefault();event.stopPropagation();
  ensureWordDataLoaded().then(openDictionary).catch(()=>showToast('Sözlük yüklenemedi. Tekrar deneyin.','rose'));
});
document.getElementById('btn-support')?.addEventListener('click',(event)=>{
  event.preventDefault();event.stopPropagation();
  document.getElementById('screen-support')?.classList.remove('hidden');
});
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
supportScreen?.addEventListener('click',event=>{
if(event.target===supportScreen){
supportScreen.classList.add('hidden');
if(location.hash==='#screen-support')history.replaceState(null,'',location.pathname+location.search);
}
});
document.addEventListener('keydown',event=>{
if(event.key==='Escape'&&supportScreen&&!supportScreen.classList.contains('hidden')){
supportScreen.classList.add('hidden');
if(location.hash==='#screen-support')history.replaceState(null,'',location.pathname+location.search);
}
});
const soundRange=document.getElementById('sound-volume-range');
const soundMuted=document.getElementById('sound-muted');
document.querySelectorAll('.vibration-choice').forEach(btn=>btn.addEventListener('click',()=>setVibrationLevel(btn.dataset.vibration)));
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
isMatchActive=false;
clearInterval(timerInterval);timerInterval=null;
clearTimeout(botInterval);botInterval=null;
if(pointerFrame){cancelAnimationFrame(pointerFrame);pointerFrame=0;}
isPointerDown=false;pointerHoldStartedAt=0;clearTimeout(pointerHoldTimer);pointerHoldTimer=null;activePointerId=null;pendingPointer=null;activeGridRect=null;activeGridMetrics=null;lastPointerX=null;lastPointerY=null;
try{clearPath();}catch(_){selectedPath=[];}
const standardGrid=document.getElementById('scrabble-grid');
if(standardGrid){standardGrid.style.pointerEvents='auto';standardGrid.style.opacity='';standardGrid.style.filter='';standardGrid.style.touchAction='none';}
const standardGame=document.getElementById('screen-game');if(standardGame)standardGame.style.pointerEvents='auto';
atismaLocalActive=false;stopAtismaSetupTimer();stopAtismaTurnTimer();stopAtismaLocalAi();atismaSetupActive=false;atismaTimeoutBusy=false;setAtismaPanelVisible(false,false);
activeGameMode='single';setLongestBonusBadges(false,false);
document.getElementById('p1-title').textContent='OYUNCU';
document.getElementById('p2-title').textContent=getBotDisplayName();
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
modal?.classList.add('single-countdown-active');
document.getElementById('single-countdown-message')?.classList.remove('hidden');
modal?.querySelector('.mp-demo')?.classList.remove('hidden');
const numEl=document.getElementById('countdown-number');
const statusEl=document.getElementById('countdown-status');
const ackBtn=document.getElementById('single-countdown-understood');
const inviteMsg=document.getElementById('countdown-invite-message');
if(inviteMsg)inviteMsg.classList.add('hidden');
if(statusEl)statusEl.classList.add('hidden');
if(numEl){numEl.textContent='3';numEl.style.opacity='1';numEl.style.transform='scale(1)';}
if(ackBtn){ackBtn.textContent='Anladım👍';ackBtn.disabled=false;ackBtn.classList.remove('hidden');}
modal?.classList.remove('hidden');
const beginCountdown=()=>{
if(ackBtn){ackBtn.disabled=true;ackBtn.onclick=null;ackBtn.classList.add('hidden');}
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
modal?.classList.remove('single-countdown-active');
document.getElementById('single-countdown-message')?.classList.add('hidden');
if(ackBtn){ackBtn.classList.add('hidden');ackBtn.disabled=false;}
localCountdownTimeout=null;
onComplete();
},120);
},1000);
};
if(ackBtn)ackBtn.onclick=beginCountdown;
else beginCountdown();
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
let BOARD_POOLS={easy2:[],medium3:[],medium4:[],bridge5:[],hidden69:[]};
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
function shuffleBoardSeedOrder(list){
const out=list.slice();
for(let i=out.length-1;i>0;i--){
const j=Math.floor(Math.random()*(i+1));
[out[i],out[j]]=[out[j],out[i]];
}
return out;
}
function weightedBoardSample(source,count){
const unique=Array.from(new Set((source||[]).filter(Boolean)));
const n=Math.min(Math.max(0,Number(count)||0),unique.length);
if(!n)return[];
const tiers={daily:[],general:[],rare:[],other:[]};
for(const word of unique)tiers[boardWordUsageTier(word)].push(word);
const dailyTarget=Math.min(n,Math.round(n*.70));
const generalTarget=Math.min(n-dailyTarget,Math.round(n*.20));
const rareTarget=Math.max(0,n-dailyTarget-generalTarget);
const out=[];const used=new Set();
const take=(pool,amount)=>{
for(const word of shuffledSample(pool,amount)){
if(used.has(word))continue;
used.add(word);out.push(word);
}
};
take(tiers.daily,dailyTarget);
take(tiers.general,generalTarget);
take(tiers.rare,rareTarget);
// Bir katman kısa kalırsa önce bilinen Türkçe katmanlarından, en son sınıflandırılmamış havuzdan tamamla.
if(out.length<n){
const known=[...tiers.daily,...tiers.general,...tiers.rare].filter(w=>!used.has(w));
take(known,n-out.length);
}
if(out.length<n)take(tiers.other,n-out.length);
return shuffleBoardSeedOrder(out);
}
function tryPlaceWord(board,word,requireCross=false,maxCrosses=1){
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
if(!ok||(requireCross&&crosses===0)||crosses>maxCrosses)continue;
for(let i=0;i<word.length;i++)board[r+i*dir.dr][c+i*dir.dc]=word[i];
return true;
}
return false;
}
function makeCandidateBoard(flavor=BOARD_FLAVORS[1]){
const board=Array.from({length:BOARD_SIZE},()=>Array(BOARD_SIZE).fill(''));
const bridgeSeeds=weightedBoardSample(BOARD_POOLS.bridge5,52);
const medium3Seeds=weightedBoardSample(BOARD_POOLS.medium3,180);
const medium4Seeds=weightedBoardSample(BOARD_POOLS.medium4,160);
const easySeeds=weightedBoardSample(BOARD_POOLS.easy2,64);
let placedLong=0;
for(const len of[9,8,7,6]){
const candidates=weightedBoardSample(FRIENDLY_WORDS_BY_LENGTH.get(len)||GAME_WORDS_BY_LENGTH.get(len)||[],12);
for(const word of candidates){
if(tryPlaceWord(board,word,placedLong>=3)){placedLong++;break;}
}
}
const longSeeds=weightedBoardSample(BOARD_POOLS.hidden69,28);
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
function analyzeStraightBoardWords(board){
const words=new Set();
let long=0;
if(!Array.isArray(board)||board.length!==BOARD_SIZE)return{count:0,long:0};
for(let r=0;r<BOARD_SIZE;r++)for(let c=0;c<BOARD_SIZE;c++){
for(const {dr,dc} of BOARD_DIRS){
let s='';
for(let len=1;len<=9;len++){
const rr=r+(len-1)*dr,cc=c+(len-1)*dc;
if(rr<0||rr>=BOARD_SIZE||cc<0||cc>=BOARD_SIZE)break;
s+=board[rr][cc];
if(len>=2&&GAME_WORD_SET.has(s))words.add(s);
}
}
}
for(const w of words)if(w.length>=5)long++;
return{count:words.size,long};
}
function analyzeBoardWords(words,board){
const straight=analyzeStraightBoardWords(board);
const stats={easy:0,medium:0,bridge:0,core:0,hidden:0,total:words.length,coverage:0,longVariety:0,initialVariety:0,straight:straight.count,straightLong:straight.long};
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
closeness(stats.coverage,b.coverageIdeal,2.6)+stats.longVariety*12+stats.initialVariety*2.5+
Math.min(stats.straight,48)*5.2+Math.min(stats.straightLong,14)*8.5;
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
const evaluation=analyzeBoardWords(solved,candidate);
let similarity=0;for(const profile of recentProfiles)similarity=Math.max(similarity,boardProfileSimilarity(solved,profile));
if(similarity>.48)evaluation.score-=500;else if(similarity>.34)evaluation.score-=180;
if(evaluation.score>bestEval.score){bestBoard=candidate;bestWords=solved;bestEval=evaluation;}
const st=evaluation.stats;
if(evaluation.accepted&&st.easy<=BOARD_BALANCE.easyMax&&
st.medium>=BOARD_BALANCE.mediumIdeal&&st.core>=BOARD_BALANCE.coreIdeal&&
st.hidden>=BOARD_BALANCE.hiddenIdeal&&st.hidden<=BOARD_BALANCE.hiddenMax&&
st.total>=BOARD_BALANCE.totalIdeal&&st.coverage>=BOARD_BALANCE.coverageIdeal&&
st.longVariety>=4&&st.initialVariety>=BOARD_BALANCE.initialVarietyMin&&
st.straight>=34&&st.straightLong>=6)break;
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
lastHoverCell=-1;hoverLiftCell=null;
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
const multiplayerPointer=activeGameMode==='multi'&&!!mpRole&&!!mpRoomRef;
const hoveringAsP1=multiplayerPointer?(mpRole==='host'):(chosenAvatarId==='av_1');
cell.classList.remove('tile-hover-p1','tile-hover-p2');
cell.classList.add(hoveringAsP1?'tile-hover-p1':'tile-hover-p2');
},{passive:true});
gridEl.addEventListener('pointerleave',()=>{
lastHoverCell=-1;hoverGridRect=null;hoverGridMetrics=null;
if(hoverLiftCell)hoverLiftCell.classList.remove('tile-hover-p1','tile-hover-p2');hoverLiftCell=null;
},{passive:true});
gridEl.addEventListener('pointerdown',(e)=>{
if(!isMatchActive&&activeGameMode==='multi'&&mpRole&&mpRoomRef&&mpState===MP_STATES.PLAYING)isMatchActive=true;
if(!isMatchActive)return;
noteLetterInteraction();
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
noteLetterInteraction();
selectedPath.push({r,c,char:gridBoard[r][c],el:cell});
selectedFlags[r*BOARD_SIZE+c]=1;
playLetterPickSound(selectedPath.length);
const multiplayerPointer=activeGameMode==='multi'&&!!mpRole&&!!mpRoomRef;
const selectingAsP1=multiplayerPointer?(mpRole==='host'):(chosenAvatarId==='av_1');
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
const isHumanMultiplayer=activeGameMode==='multi'&&!!mpRole&&!!mpRoomRef;
const isP1=isHumanMultiplayer?(mpRole==='host'):(chosenAvatarId==='av_1');
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
if(isLocalAtisma()){p1Score-=3;updateScores();atismaLocalPlayerTurns++;renderPatlamaTurnDots(atismaLocalPlayerTurns,atismaLocalAiTurns);clearPath();scheduleLocalAtismaTurn('ai');return;}
if(isHumanMultiplayer&&isAtismaRoom()){await atismaPenaltyAndPass(word,-3);clearPath();return;}
adjustScore(isP1?-3:0,!isP1?-3:0);
clearPath();
return;
}
if(!GAME_WORD_SET.has(word)){
playErrorBuzzer();
flashWordFeedback(false);
breakCombo(isP1);
showToast(`${word}(-3)Geçersiz!`,'rose');
if(isLocalAtisma()){p1Score-=3;updateScores();atismaLocalPlayerTurns++;renderPatlamaTurnDots(atismaLocalPlayerTurns,atismaLocalAiTurns);clearPath();scheduleLocalAtismaTurn('ai');return;}
if(isHumanMultiplayer&&isAtismaRoom()){await atismaPenaltyAndPass(word,-3);clearPath();return;}
adjustScore(isP1?-3:0,!isP1?-3:0);
clearPath();
return;
}
if(isLocalAtisma()){
if(atismaLocalBlastedWords.has(word)){
p1Score-=5;updateScores();playErrorBuzzer();flashWordFeedback(false);breakCombo(true);showToast(word+' PATLADI -5','rose',1500);atismaLocalPlayerTurns++;renderPatlamaTurnDots(atismaLocalPlayerTurns,atismaLocalAiTurns);clearPath();scheduleLocalAtismaTurn('ai');return;
}
const effects=applyLocalAtismaEffects(selectedPath,atismaLocalAiPlacements,atismaLocalUsedAi);const trapped=effects.trap.length>0;if(trapped){atismaLocalBlastedWords.add(word);showPatlamaReaction('cry');}const delta=trapped?0:pts;sessionFoundWords.add(word);recordMatchWord(word,delta,true);if(trapped)p2Score+=pts;else p1Score+=pts;updateScores();
selectedPath.forEach(p=>p.el.classList.add('tile-claimed-p1'));addTickerBadge(word,true);flyScore(pts,trapped?false:true,scoreFxOrigin);
if(trapped){playErrorBuzzer();flashWordFeedback(false);breakCombo(true);showToast('🎈 TUZAK! '+word+' PUANI '+getBotDisplayName()+' TARAFINA GEÇTİ: +'+pts,'rose',1900);}else{playCorrectChime();flashWordFeedback(true);rewardWordFx(true);playWordConfetti(word.length);showToast(word+'(+'+pts+')','amber',1800);}
atismaLocalPlayerTurns++;clearPath();scheduleLocalAtismaTurn('ai');return;
}
if(isHumanMultiplayer&&isAtismaRoom()){
await submitAtismaWord(word,pts,isP1,scoreFxOrigin);
clearPath();
return;
}
if(isHumanMultiplayer){
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
if(isHumanMultiplayer){
mpFoundWords.host.add(word);
mpFoundWords.guest.add(word);
}else sessionFoundWords.add(word);


recordMatchWord(word,pts,isP1);
playCorrectChime(false);
if(word.length>=5)triggerKapismaLongWordVibration();
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
function animateOpponentRoute(path,isP1){
if(document.hidden||!Array.isArray(path)||path.length<2)return;
const board=document.getElementById('scrabble-grid');
if(!board||board.clientWidth<1||board.clientHeight<1)return;
if(getComputedStyle(board).position==='static')board.style.position='relative';
const pts=[];
for(const pos of path){
const el=domCells[pos.r*BOARD_SIZE+pos.c]||document.getElementById(`cell-${pos.r}-${pos.c}`);
if(!el||el.offsetParent===null)continue;
pts.push({x:el.offsetLeft+el.offsetWidth/2,y:el.offsetTop+el.offsetHeight/2});
}
if(pts.length<2)return;
const ns='http://www.w3.org/2000/svg';
const svg=document.createElementNS(ns,'svg');
svg.setAttribute('viewBox',`0 0 ${board.clientWidth} ${board.clientHeight}`);
svg.setAttribute('preserveAspectRatio','none');
svg.setAttribute('aria-hidden','true');
Object.assign(svg.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'58',overflow:'visible'});
const route=document.createElementNS(ns,'polyline');
route.setAttribute('points',pts.map(p=>`${p.x},${p.y}`).join(' '));
route.setAttribute('fill','none');
route.setAttribute('stroke',isP1?'#f97316':'#2563eb');
route.setAttribute('stroke-width','4');
route.setAttribute('vector-effect','non-scaling-stroke');
route.setAttribute('stroke-linecap','round');
route.setAttribute('stroke-linejoin','round');
route.setAttribute('opacity','.92');
svg.appendChild(route);
const dot=document.createElementNS(ns,'circle');
dot.setAttribute('r','7');
dot.setAttribute('vector-effect','non-scaling-stroke');
dot.setAttribute('fill',isP1?'#fb923c':'#3b82f6');
dot.setAttribute('cx',String(pts[0].x));
dot.setAttribute('cy',String(pts[0].y));
svg.appendChild(dot);
board.appendChild(svg);
let len=0;
try{len=route.getTotalLength();}catch(_){}
if(len>0){
route.style.strokeDasharray=String(len);
route.style.strokeDashoffset=String(len);
route.animate([{strokeDashoffset:String(len),opacity:.95},{strokeDashoffset:'0',opacity:.95},{strokeDashoffset:'0',opacity:0}],{duration:650,easing:'ease-out',fill:'forwards'});
}
const keyframes=pts.map((p,i)=>({offset:i/(pts.length-1),cx:String(p.x),cy:String(p.y)}));
try{dot.animate(keyframes,{duration:520,easing:'linear',fill:'forwards'});}catch(_){}
setTimeout(()=>svg.remove(),720);
}
function flashOpponentWord(path,isP1,badge=null){
if(document.hidden||!Array.isArray(path)||!path.length)return;
animateOpponentRoute(path,isP1);
const cls=isP1?'remote-word-flash-p1':'remote-word-flash-p2';
path.forEach((pos,i)=>{
const el=domCells[pos.r*BOARD_SIZE+pos.c]||document.getElementById(`cell-${pos.r}-${pos.c}`);
if(!el)return;
setTimeout(()=>{
if(!el.isConnected)return;
el.classList.remove('remote-word-flash-p1','remote-word-flash-p2');
void el.offsetWidth;
el.classList.add(cls);
setTimeout(()=>el.classList.remove(cls),400);
},i*50);
});
if(badge){
const badgeCls=isP1?'remote-word-badge-p1':'remote-word-badge-p2';
badge.classList.add(badgeCls);
setTimeout(()=>badge.classList.remove(badgeCls),720);
}
}
function playWordConfetti(length){
const letters=Math.max(1,Math.min(9,Number(length)||1));
const scale=Math.max(.55,Math.min(1,(letters+2)/7));
const first=Math.round((IS_COARSE_POINTER?17:22)*scale);
const second=Math.round((IS_COARSE_POINTER?7:8)*scale);
confetti({particleCount:first,epic:true});
setTimeout(()=>confetti({particleCount:second,epic:true,secondary:true}),135);
}
function confetti(options={}){
const count=Math.max(0,Math.min(64,Math.round(Number(options.particleCount)||0)));
if(!count||document.hidden)return;
const epic=!!options.epic;
const secondary=!!options.secondary;
const board=document.getElementById('scrabble-grid');
if(!board)return;
const rect=board.getBoundingClientRect();
if(rect.width<1||rect.height<1)return;

const layer=document.createElement('div');
Object.assign(layer.style,{
position:'absolute',
inset:'0',
overflow:'hidden',
pointerEvents:'none',
zIndex:'120',
display:'block'
});
const computed=getComputedStyle(board);
if(computed.position==='static')board.style.position='relative';
board.appendChild(layer);

const frag=document.createDocumentFragment();
const parts=[];
const cx=rect.width/2+(secondary?(Math.random()-.5)*rect.width*.10:0);
const cy=rect.height/2+(secondary?(Math.random()-.5)*rect.height*.08:0);
const colors=['#facc15','#f97316','#ef4444','#22c55e','#0ea5e9','#2563eb','#8b5cf6','#ec4899','#ffffff'];
const duration=secondary?1150:1450;

for(let i=0;i<count;i++){
const part=document.createElement('span');
const angle=Math.random()*Math.PI*2;
const reach=Math.min(rect.width,rect.height)*(.36+Math.random()*.40);
const dx=Math.cos(angle)*reach;
const dy=Math.sin(angle)*reach+28+Math.random()*34;
const midX=dx*.52;
const midY=dy*.28-(50+Math.random()*34);
const rot=(Math.random()-.5)*1080;
const w=5+Math.random()*4;
const h=7+Math.random()*6;

Object.assign(part.style,{
position:'absolute',
left:cx+'px',
top:cy+'px',
width:w+'px',
height:h+'px',
borderRadius:Math.random()>.72?'50%':'2px',
background:colors[i%colors.length],
opacity:'1',
pointerEvents:'none',
boxShadow:'0 1px 2px rgba(15,23,42,.16)',
transform:'translate3d(-50%,-50%,0) scale(.7)'
});
frag.appendChild(part);
parts.push({part,dx,dy,midX,midY,rot});
}
layer.appendChild(frag);

for(const p of parts){
if(typeof p.part.animate==='function'){
p.part.animate([
{transform:'translate3d(-50%,-50%,0) rotate(0deg) scale(.55)',opacity:0},
{offset:.10,transform:'translate3d(-50%,-50%,0) rotate(0deg) scale(1.05)',opacity:.92},
{offset:.48,transform:`translate3d(calc(-50% + ${p.midX}px),calc(-50% + ${p.midY}px),0) rotate(${p.rot*.45}deg) scale(.96)`,opacity:.88},
{transform:`translate3d(calc(-50% + ${p.dx}px),calc(-50% + ${p.dy}px),0) rotate(${p.rot}deg) scale(.82)`,opacity:0}
],{duration,easing:'cubic-bezier(.15,.72,.28,1)',fill:'forwards'});
}else{
p.part.style.transition=`transform ${duration}ms ease-out,opacity ${duration}ms ease-out`;
requestAnimationFrame(()=>requestAnimationFrame(()=>{
p.part.style.transform=`translate3d(calc(-50% + ${p.dx}px),calc(-50% + ${p.dy}px),0) rotate(${p.rot}deg) scale(.82)`;
p.part.style.opacity='0';
}));
}
}
setTimeout(()=>layer.remove(),duration+120);
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
                color === 'rose' ? 'bg-rose-600 text-white' : color === 'amber' ? 'bg-amber-400 text-slate-950' : color === 'orange' ? 'bg-orange-500 text-white patlama-first-move-toast' : 'bg-sky-400 text-slate-950'
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
const BOT_DISPLAY_NAMES={
easy:'DURGUN',
medium:'BİLGİN',
hard:'ÜSTAD',
expert:'FİLOZOF'
};
function getBotDisplayName(){
return BOT_DISPLAY_NAMES[botDiffLevel]||'DURGUN';
}
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
modal?.classList.remove('single-countdown-active');
document.getElementById('single-countdown-message')?.classList.add('hidden');
document.getElementById('single-countdown-understood')?.classList.add('hidden');
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
showToast('Hodri Meydan tek maçlık moddur.','slate',1200);
return;
}
if(activeGameMode!=='multi'){
clearInterval(timerInterval);timerInterval=null;
clearTimeout(botInterval);botInterval=null;
clearInterval(mpClock);mpClock=null;
isMatchActive=false;
document.getElementById('modal-gameover')?.classList.add('hidden');
if(isLocalAtisma()||selectedHomeGameMode==='patlama')prepareLocalAtisma();
else prepareGame();
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
if(singleActions){
singleActions.classList.remove('hidden');
singleActions.style.setProperty('display','grid','important');
singleActions.style.setProperty('grid-template-columns','minmax(0,1fr) minmax(0,1fr)','important');
}
const replayBtn=document.getElementById('btn-play-again');
if(replayBtn){
replayBtn.style.removeProperty('display');
replayBtn.style.setProperty('grid-column','1','important');
replayBtn.style.setProperty('grid-row','1','important');
replayBtn.disabled=false;replayBtn.textContent='YENİDEN OYNA';replayBtn.classList.remove('hidden');
}
const singleExitBtn=document.getElementById('btn-game-exit');
if(singleExitBtn){
singleExitBtn.style.removeProperty('display');
singleExitBtn.style.setProperty('grid-column','2','important');
singleExitBtn.style.setProperty('grid-row','1','important');
singleExitBtn.disabled=false;
singleExitBtn.classList.remove('hidden');
singleExitBtn.className='w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-black text-xs py-2.5 rounded-xl uppercase shadow-md transition';
singleExitBtn.textContent='ÇIKIŞ';
}
const singleInline=document.getElementById('rematch-inline-status');
if(singleInline){singleInline.style.setProperty('grid-column','1 / -1','important');singleInline.style.setProperty('grid-row','2','important');}
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
async function resetRandomRoomForReplay(){
if(!isRandomHumanRoom())return false;
const ref=mpRoomRef;
const role=mpRole;
if(randomResultAutoExitTimer){clearTimeout(randomResultAutoExitTimer);randomResultAutoExitTimer=null;}
randomResultAutoExitKey='';
setRandomAutoExitNotice(false);
detachMultiplayerListeners();
if(mpPresenceRef){
try{await mpPresenceRef.onDisconnect().cancel();}catch(_){}
}
try{await cleanupRandomRoomBeforeReset(ref,role,'random-replay');}catch(_){}
releaseRandomSearchLocal();
resetMultiplayerClientState();
clearInviteFromUrl();
hideRoomExitNotice();
document.getElementById('modal-countdown')?.classList.add('hidden');
document.getElementById('modal-gameover')?.classList.add('hidden');
document.getElementById('modal-rematch-waiting')?.classList.add('hidden');
document.getElementById('modal-mp-waiting')?.classList.add('hidden');
document.getElementById('screen-game')?.classList.add('hidden');
document.getElementById('screen-home')?.classList.remove('hidden');
document.getElementById('friend-invite-panel')?.classList.remove('hidden');
document.getElementById('mp-create-view')?.classList.remove('hidden');
document.getElementById('mp-room-view')?.classList.add('hidden');
document.getElementById('btn-close-room')?.classList.add('hidden');
setRandomStatus('Yeni rakip aranıyor…',true);
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
const exitGrid=document.getElementById('scrabble-grid');
if(exitGrid){exitGrid.style.pointerEvents='auto';exitGrid.style.opacity='';exitGrid.style.filter='';exitGrid.style.touchAction='none';}
const exitGame=document.getElementById('screen-game');if(exitGame)exitGame.style.pointerEvents='auto';
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
atismaLocalActive=false;atismaSetupActive=false;stopAtismaSetupTimer();stopAtismaTurnTimer();stopAtismaLocalAi();setAtismaPanelVisible(false,false);
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
const meaningShardCache=new Map();
const meaningShardLoads=new Map();
async function loadVerifiedMeaning(key){
const shard=key.codePointAt(0).toString(16).padStart(4,'0');
if(!meaningShardCache.has(shard)){
if(!meaningShardLoads.has(shard))meaningShardLoads.set(shard,(async()=>{
const controller=new AbortController();
const timeout=setTimeout(()=>controller.abort(),7000);
try{
const response=await fetch(`meanings/${shard}.json?v=643`,{signal:controller.signal});
if(!response.ok)throw new Error('meaning-load-failed');
const data=await response.json();meaningShardCache.set(shard,data);return data;
}finally{clearTimeout(timeout);}
})().finally(()=>meaningShardLoads.delete(shard)));
await meaningShardLoads.get(shard);
}
const meanings=meaningShardCache.get(shard)[key];
if(!Array.isArray(meanings)||!meanings.length)throw new Error('verified-meaning-missing');
return meanings;
}
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
function fillInlineMeaning(host,word,meanings,sourceWord='',source=''){
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
const note=document.createElement('div');note.className='dict-meaning-note';note.textContent=source==='geo'?'KAPMACA Coğrafi Sözlük':(source==='local'?'KAPMACA Türkçe Sözlük':'TDK Güncel Türkçe Sözlük • anlamlar çevrim içi sorgulanır.');host.appendChild(note);
host.classList.remove('hidden');
}
async function showDictionaryMeaning(word,host,auto=false){
if(!host)return;
const key=normalizeMeaningLookupWord(word);
if(!auto&&dictMeaningOpenKey===key&&dictMeaningOpenHost===host&&!host.classList.contains('hidden')){closeDictionaryMeaning();return;}
closeDictionaryMeaning();dictMeaningOpenKey=key;dictMeaningOpenHost=host;
if(dictMeaningCache.has(key)){
const cached=dictMeaningCache.get(key);fillInlineMeaning(host,word,cached.meanings,cached.sourceWord,cached.source||'');return;
}
if(GAME_WORD_SET.has(key)){
host.textContent='Anlam getiriliyor…';host.classList.remove('hidden');
try{
const local={meanings:await loadVerifiedMeaning(key),sourceWord:key,source:'local'};
dictMeaningCache.set(key,local);
if(dictMeaningOpenKey===key&&dictMeaningOpenHost===host)fillInlineMeaning(host,word,local.meanings,key,'local');
}catch(_){
if(dictMeaningOpenKey===key&&dictMeaningOpenHost===host){host.textContent='Anlam yüklenemedi. Bağlantıyı kontrol edip sözcüğe tekrar dokun.';host.classList.remove('hidden');}
}
return;
}
if(NATIONALITY_DICTIONARY[key]){
const local={meanings:[NATIONALITY_DICTIONARY[key]],sourceWord:String(word),source:'local'};
dictMeaningCache.set(key,local);fillInlineMeaning(host,word,local.meanings,local.sourceWord,local.source);return;
}
if(IMPERATIVE_MEANING_DICTIONARY[key]){
const local={meanings:IMPERATIVE_MEANING_DICTIONARY[key],sourceWord:String(word),source:'local'};
dictMeaningCache.set(key,local);fillInlineMeaning(host,word,local.meanings,local.sourceWord,local.source);return;
}
if(GEO_DICTIONARY[key]){
const local={meanings:[GEO_DICTIONARY[key]],sourceWord:String(word),source:'geo'};
dictMeaningCache.set(key,local);fillInlineMeaning(host,word,local.meanings,local.sourceWord,local.source);return;
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
if(meanings.length)dictMeaningCache.set(key,{meanings,sourceWord,source:'tdk'});
if(dictMeaningOpenKey===key&&dictMeaningOpenHost===host)fillInlineMeaning(host,word,meanings,sourceWord,'tdk');
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

/* v617 — ZİNCİRLEME: sıra tabanlı 9x9 tahta sözcük zinciri */
(()=>{
const screen=document.getElementById('screen-zincirleme');
const homeBtn=document.getElementById('btn-zincirleme-home');
const boardEl=document.getElementById('zlm-board');
if(!screen||!homeBtn||!boardEl)return;

const state={
  mode:'ai',running:false,paused:false,turn:0,required:'N',initialLetter:'N',
  board:[],solutions:[],used:new Set(),scores:[0,0],path:[],selected:new Uint8Array(81),
  pointerId:null,lastCell:null,lastX:null,lastY:null,aiTimer:null,turnTimer:null,timeLeft:18,turnLimit:18,
  chainCount:0,messageTimer:null
};
const cells=[];
const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
const key=(r,c)=>r*9+c;

function zlmScore(word){
  return Array.from(word).reduce((sum,ch)=>sum+(TILE_SCORE_CACHE[ch]||1),0)+Math.max(0,word.length-2)*2;
}
function zlmPointInfo(word){
  const base=zlmScore(word);
  const bonus=state.chainCount>0&&!!state.initialLetter&&Array.from(word).includes(state.initialLetter);
  return{base,bonus,points:bonus?base*2:base};
}
function zlmClearTimers(){
  clearTimeout(state.aiTimer);state.aiTimer=null;
  clearInterval(state.turnTimer);state.turnTimer=null;
  clearTimeout(state.messageTimer);state.messageTimer=null;
}
function zlmShowMessage(text,duration=900){
  const el=document.getElementById('zlm-message');if(!el)return;
  clearTimeout(state.messageTimer);el.textContent=text;el.classList.add('show');
  state.messageTimer=setTimeout(()=>el.classList.remove('show'),duration);
}
function zlmSetMode(mode){
  state.mode=mode==='local'?'local':'ai';
  document.getElementById('btn-zlm-ai')?.classList.toggle('selected',state.mode==='ai');
  document.getElementById('btn-zlm-local')?.classList.toggle('selected',state.mode==='local');
  const p1=document.getElementById('zlm-p1-name'),p2=document.getElementById('zlm-p2-name');
  if(p1)p1.textContent=state.mode==='local'?'1. OYUNCU':'OYUNCU';
  if(p2)p2.textContent=state.mode==='local'?'2. OYUNCU':'BİLGİN';
}
function zlmRenderHud(){
  document.getElementById('zlm-p1-score').textContent=String(state.scores[0]);
  document.getElementById('zlm-p2-score').textContent=String(state.scores[1]);
  document.getElementById('zlm-required-letter').textContent=state.required||'?';
  document.getElementById('zlm-p1-card')?.classList.toggle('active',state.turn===0);
  document.getElementById('zlm-p2-card')?.classList.toggle('active',state.turn===1);
  zlmUpdateStatus();
}
function zlmUpdateStatus(extra=''){
  const el=document.getElementById('zlm-turn-status');if(!el)return;
  let who;
  if(state.turn===0)who=state.mode==='local'?'1. oyuncu':'Sıra sende';
  else who=state.mode==='local'?'2. oyuncu':'BİLGİN düşünüyor';
  const time=state.running&&!state.paused?' • '+Math.max(0,state.timeLeft)+' sn':'';
  const bonus=state.chainCount>0&&state.initialLetter?' • '+state.initialLetter+' içerirse 2×':'';
  el.textContent=extra||(`${who}: ${state.required} ile başlayan sözcük bul${bonus}${time}`);
}
function zlmRenderPreview(){
  const host=document.getElementById('zlm-preview-word'),status=document.getElementById('zlm-preview-status');
  if(!host||!status)return;
  host.textContent='';
  const word=state.path.map(p=>p.char).join('');
  for(const p of state.path){
    const tile=document.createElement('span');tile.className='zlm-preview-tile';tile.textContent=p.char;
    const sm=document.createElement('small');sm.textContent=String(TILE_SCORE_CACHE[p.char]||1);tile.appendChild(sm);host.appendChild(tile);
  }
  status.className='';
  if(!word){status.textContent='';return;}
  if(word[0]!==state.required){status.textContent=state.required+' İLE BAŞLAMALI';status.className='bad';return;}
  if(state.used.has(word)){status.textContent='DAHA ÖNCE KULLANILDI';status.className='bad';return;}
  const valid=word.length>=2&&GAME_WORD_SET.has(word)&&!isArgoWord(word)&&!isForeignWord(word);
  const bonus=valid&&state.chainCount>0&&state.initialLetter&&Array.from(word).includes(state.initialLetter);
  status.textContent=valid?(bonus?'SÖZLÜKTE VAR • 2×':'SÖZLÜKTE VAR'):'SÖZLÜKTE YOK';status.className=valid?'good':'bad';
}
function zlmClearPath(){
  for(const p of state.path)p.el?.classList.remove('sel-p1','sel-p2');
  state.path.length=0;state.selected.fill(0);state.lastCell=null;zlmRenderPreview();
}
function zlmPaintBoard(){
  boardEl.textContent='';cells.length=0;zlmClearPath();
  const frag=document.createDocumentFragment();
  for(let r=0;r<9;r++)for(let c=0;c<9;c++){
    const ch=state.board[r][c];
    const cell=document.createElement('div');cell.className='zlm-cell';cell.dataset.r=String(r);cell.dataset.c=String(c);
    const letter=document.createElement('span');letter.textContent=ch;
    const score=document.createElement('small');score.textContent=String(TILE_SCORE_CACHE[ch]||1);
    cell.append(letter,score);frag.appendChild(cell);cells.push(cell);
  }
  boardEl.appendChild(frag);
}
function zlmGenerateBoard(preferLetter='N'){
  let best=null;
  for(let i=0;i<6;i++){
    const ready=generateOptimizedBoard(i<2?2:3);
    const candidates=ready.words.filter(x=>x.word.length>=2&&x.word[0]===preferLetter);
    if(!best||candidates.length>(best.candidates?.length||0))best={...ready,candidates};
    if(candidates.length>=3)break;
  }
  state.board=best.board;state.solutions=best.words;
  zlmPaintBoard();
}
function zlmCandidates(letter=state.required){
  return state.solutions.filter(x=>x.word.length>=2&&x.word[0]===letter&&!state.used.has(x.word)&&!isArgoWord(x.word)&&!isForeignWord(x.word));
}
function zlmEnsurePlayable(){
  if(zlmCandidates().length)return true;
  zlmGenerateBoard(state.required);
  const ok=zlmCandidates().length>0;
  if(ok)zlmShowMessage('TAHTA YENİLENDİ',850);
  return ok;
}
function zlmChooseInitial(){
  const preferred=['N','E','K','A','S','M','B','D','Y'];
  for(const letter of preferred)if(state.solutions.filter(x=>x.word[0]===letter&&x.word.length>=2).length>=2)return letter;
  const counts=new Map();
  for(const x of state.solutions)if(x.word.length>=2)counts.set(x.word[0],(counts.get(x.word[0])||0)+1);
  return [...counts.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||'N';
}
function zlmMeasureCell(clientX,clientY){
  const rect=boardEl.getBoundingClientRect();
  if(clientX<rect.left||clientX>rect.right||clientY<rect.top||clientY>rect.bottom)return null;
  const gap=2,pad=3;
  const innerW=rect.width-pad*2,innerH=rect.height-pad*2;
  const cellW=(innerW-gap*8)/9,cellH=(innerH-gap*8)/9;
  const x=clientX-rect.left-pad,y=clientY-rect.top-pad;
  const c=Math.floor(x/(cellW+gap)),r=Math.floor(y/(cellH+gap));
  if(r<0||r>8||c<0||c>8)return null;
  return{r,c};
}
function zlmIsNeighbor(r,c){
  if(!state.path.length)return true;
  const last=state.path[state.path.length-1];
  return Math.abs(last.r-r)+Math.abs(last.c-c)===1&&!state.selected[key(r,c)];
}
function zlmAddCell(r,c){
  if(state.path.length>=9)return;
  if(state.path.length>=2){
    const prev=state.path[state.path.length-2];
    if(prev.r===r&&prev.c===c){
      const removed=state.path.pop();state.selected[key(removed.r,removed.c)]=0;
      removed.el.classList.remove('sel-p1','sel-p2');zlmRenderPreview();return;
    }
  }
  if(!zlmIsNeighbor(r,c))return;
  const el=cells[key(r,c)];if(!el)return;
  state.selected[key(r,c)]=1;
  state.path.push({r,c,char:state.board[r][c],el});
  el.classList.add(state.turn===0?'sel-p1':'sel-p2');
  if(typeof playLetterPickSound==='function')try{playLetterPickSound(state.path.length);}catch(_){}
  zlmRenderPreview();
}
function zlmProcessPoint(x,y){
  const pos=zlmMeasureCell(x,y);if(!pos)return;
  if(state.lastCell&&state.lastCell.r===pos.r&&state.lastCell.c===pos.c)return;
  state.lastCell=pos;zlmAddCell(pos.r,pos.c);
}
function zlmProcessSegment(x,y){
  if(state.lastX===null||state.lastY===null){
    zlmProcessPoint(x,y);state.lastX=x;state.lastY=y;return;
  }
  const dx=x-state.lastX,dy=y-state.lastY;
  const rect=boardEl.getBoundingClientRect();
  const step=Math.max(7,(Math.min(rect.width,rect.height)/9)*.42);
  const count=Math.min(10,Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/step)));
  for(let i=1;i<=count;i++)zlmProcessPoint(state.lastX+dx*i/count,state.lastY+dy*i/count);
  state.lastX=x;state.lastY=y;
}
function zlmStartTurn(){
  zlmClearPath();
  if(!zlmEnsurePlayable()){zlmEndGame('Bu harfle tahtada sözcük kalmadı.');return;}
  state.turnLimit=Math.max(7,18-Math.floor(state.chainCount/3));
  state.timeLeft=state.turnLimit;
  clearInterval(state.turnTimer);
  state.turnTimer=setInterval(()=>{
    if(!state.running||state.paused)return;
    state.timeLeft--;zlmUpdateStatus();
    if(state.timeLeft<=0){
      clearInterval(state.turnTimer);state.turnTimer=null;
      zlmEndGame(state.turn===0?'Süren doldu.':'Rakibin süresi doldu.');
    }
  },1000);
  zlmRenderHud();
  if(state.mode==='ai'&&state.turn===1)zlmScheduleAi();
}
function zlmCommitWord(word,path,actor=state.turn){
  const info=zlmPointInfo(word),pts=info.points;
  state.used.add(word);state.scores[actor]+=pts;state.chainCount++;
  state.required=Array.from(word).slice(-1)[0]||state.required;
  zlmRenderHud();
  for(const p of path){
    const el=cells[key(p.r,p.c)];if(el){el.classList.add('ai-pulse');setTimeout(()=>el.classList.remove('ai-pulse'),520);}
  }
  zlmShowMessage(word+'  +'+pts+(info.bonus?'  •  '+state.initialLetter+' BONUSU 2×':''),1100);
  clearInterval(state.turnTimer);state.turnTimer=null;
  state.turn=actor===0?1:0;
  setTimeout(()=>{if(state.running)zlmStartTurn();},780);
}
function zlmSubmitPlayer(){
  if(!state.running||state.paused||!state.path.length)return;
  const word=state.path.map(p=>p.char).join('');
  if(word.length<2){zlmShowMessage('EN AZ 2 HARF',700);zlmClearPath();return;}
  if(word[0]!==state.required){zlmShowMessage(state.required+' İLE BAŞLAMALI',850);zlmClearPath();return;}
  if(state.used.has(word)){zlmShowMessage('BU SÖZCÜK KULLANILDI',850);zlmClearPath();return;}
  if(!GAME_WORD_SET.has(word)||isArgoWord(word)||isForeignWord(word)){zlmShowMessage('SÖZLÜKTE YOK',750);zlmClearPath();return;}
  const path=state.path.map(p=>({r:p.r,c:p.c}));zlmClearPath();zlmCommitWord(word,path,state.turn);
}
function zlmScheduleAi(){
  const delay=900+Math.floor(Math.random()*700);
  state.aiTimer=setTimeout(()=>{if(state.running&&!state.paused&&state.turn===1)zlmPlayAi();},delay);
}
function zlmPlayAi(){
  let choices=zlmCandidates();
  if(!choices.length){
    zlmGenerateBoard(state.required);choices=zlmCandidates();
    if(!choices.length){zlmEndGame('BİLGİN devam edecek sözcük bulamadı.');return;}
  }
  const ranked=choices.map(item=>{
    const tier=typeof boardWordUsageTier==='function'?boardWordUsageTier(item.word):'other';
    const tierBonus=tier==='daily'?30:tier==='general'?14:tier==='rare'?7:0;
    const score=zlmPointInfo(item.word).points+tierBonus-Math.max(0,item.word.length-6)*2;
    return{item,score};
  }).sort((a,b)=>b.score-a.score);
  const top=ranked.slice(0,Math.min(8,ranked.length));
  const choice=top[Math.floor(Math.random()*top.length)]?.item||choices[0];
  if(!choice){zlmEndGame('BİLGİN sözcük bulamadı.');return;}
  const path=choice.path||[];
  let i=0;
  const pulse=()=>{
    if(!state.running||state.turn!==1)return;
    if(i>=path.length){setTimeout(()=>{if(state.running&&state.turn===1)zlmCommitWord(choice.word,path,1);},180);return;}
    const p=path[i++],el=cells[key(p.r,p.c)];
    if(el){el.classList.add('sel-p2');setTimeout(()=>el.classList.remove('sel-p2'),360);}
    setTimeout(pulse,125);
  };
  pulse();
}
function zlmEndGame(reason='Oyun sona erdi.'){
  if(!state.running)return;
  state.running=false;zlmClearTimers();zlmClearPath();
  const a=state.scores[0],b=state.scores[1];
  let title='ZİNCİR KOPTU!';
  if(a>b)title=state.mode==='ai'?'KAZANDIN!':'1. OYUNCU KAZANDI!';
  else if(b>a)title=state.mode==='ai'?'BİLGİN KAZANDI':'2. OYUNCU KAZANDI!';
  else title='BERABERE!';
  document.getElementById('zlm-over-title').textContent=title;
  document.getElementById('zlm-over-text').textContent=reason+' Zincir: '+state.chainCount;
  document.getElementById('zlm-over-score').textContent=a+' - '+b;
  document.getElementById('zlm-gameover')?.classList.remove('hidden');
}
function zlmPause(silent=false){
  if(!state.running||state.paused)return;
  state.paused=true;clearInterval(state.turnTimer);state.turnTimer=null;clearTimeout(state.aiTimer);state.aiTimer=null;
  const b=document.getElementById('btn-zlm-pause');if(b)b.textContent='▶';
  boardEl.style.pointerEvents='none';if(!silent)zlmUpdateStatus('DURAKLATILDI');
}
function zlmResume(){
  if(!state.running||!state.paused)return;
  state.paused=false;const b=document.getElementById('btn-zlm-pause');if(b)b.textContent='Ⅱ';boardEl.style.pointerEvents='';
  const remaining=Math.max(1,state.timeLeft);
  clearInterval(state.turnTimer);
  state.turnTimer=setInterval(()=>{
    if(!state.running||state.paused)return;
    state.timeLeft--;zlmUpdateStatus();
    if(state.timeLeft<=0){clearInterval(state.turnTimer);state.turnTimer=null;zlmEndGame(state.turn===0?'Süren doldu.':'Rakibin süresi doldu.');}
  },1000);
  state.timeLeft=remaining;zlmRenderHud();if(state.mode==='ai'&&state.turn===1)zlmScheduleAi();
}
function zlmReset(){
  zlmClearTimers();state.running=true;state.paused=false;state.turn=0;state.used.clear();state.scores=[0,0];state.chainCount=0;
  document.getElementById('zlm-gameover')?.classList.add('hidden');document.getElementById('zlm-rules')?.classList.add('hidden');
  const pause=document.getElementById('btn-zlm-pause');if(pause)pause.textContent='Ⅱ';boardEl.style.pointerEvents='';
  zlmGenerateBoard('N');state.required=zlmChooseInitial();state.initialLetter=state.required;zlmRenderHud();zlmStartTurn();
}
function zlmExit(){
  state.running=false;state.paused=false;zlmClearTimers();zlmClearPath();
  screen.classList.add('hidden');document.getElementById('zlm-rules')?.classList.add('hidden');document.getElementById('zlm-gameover')?.classList.add('hidden');
  document.getElementById('screen-home')?.classList.remove('hidden');
}
async function zlmOpen(){
  document.getElementById('screen-home')?.classList.add('hidden');screen.classList.remove('hidden');
  zlmUpdateStatus('Sözlük ve tahta hazırlanıyor…');
  try{await ensureWordDataLoaded();zlmReset();}
  catch(err){console.error('Zincirleme startup failed',err);showToast('ZİNCİRLEME hazırlanamadı.','rose');zlmExit();}
}

boardEl.addEventListener('pointerdown',e=>{
  if(!state.running||state.paused||(state.mode==='ai'&&state.turn===1))return;
  e.preventDefault();state.pointerId=e.pointerId;boardEl.setPointerCapture?.(e.pointerId);boardEl.classList.add('grabbing');state.lastCell=null;
  state.lastX=null;state.lastY=null;zlmProcessSegment(e.clientX,e.clientY);
},{passive:false});
boardEl.addEventListener('pointermove',e=>{
  if(state.pointerId!==e.pointerId)return;e.preventDefault();zlmProcessSegment(e.clientX,e.clientY);
},{passive:false});
const finish=e=>{
  if(state.pointerId!==e.pointerId)return;
  e.preventDefault();try{boardEl.releasePointerCapture(e.pointerId);}catch(_){}
  state.pointerId=null;boardEl.classList.remove('grabbing');zlmProcessSegment(e.clientX,e.clientY);state.lastCell=null;state.lastX=null;state.lastY=null;zlmSubmitPlayer();
};
boardEl.addEventListener('pointerup',finish,{passive:false});
boardEl.addEventListener('pointercancel',e=>{if(state.pointerId===e.pointerId){state.pointerId=null;state.lastX=null;state.lastY=null;boardEl.classList.remove('grabbing');zlmClearPath();}},{passive:false});

homeBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();zlmOpen();});
document.getElementById('btn-zlm-exit')?.addEventListener('click',zlmExit);
document.getElementById('btn-zlm-home-exit')?.addEventListener('click',zlmExit);
document.getElementById('btn-zlm-new')?.addEventListener('click',zlmReset);
document.getElementById('btn-zlm-again')?.addEventListener('click',zlmReset);
document.getElementById('btn-zlm-pause')?.addEventListener('click',()=>state.paused?zlmResume():zlmPause());
document.getElementById('btn-zlm-ai')?.addEventListener('click',()=>{zlmSetMode('ai');if(!screen.classList.contains('hidden'))zlmReset();});
document.getElementById('btn-zlm-local')?.addEventListener('click',()=>{zlmSetMode('local');if(!screen.classList.contains('hidden'))zlmReset();});
document.getElementById('btn-zlm-rules')?.addEventListener('click',()=>{if(state.running&&!state.paused)zlmPause(true);document.getElementById('zlm-rules')?.classList.remove('hidden');});
document.getElementById('btn-zlm-rule-close')?.addEventListener('click',()=>{document.getElementById('zlm-rules')?.classList.add('hidden');if(state.running&&state.paused)zlmResume();});
document.getElementById('btn-zlm-rule-new')?.addEventListener('click',()=>{document.getElementById('zlm-rules')?.classList.add('hidden');zlmReset();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!screen.classList.contains('hidden')&&state.running&&!state.paused)zlmPause(true);});
zlmSetMode('ai');
})();


/* v617 — AVCI: hareketli harflerden görev sözcüğü yakalama */
(()=>{
const screen=document.getElementById('screen-avci');
const homeBtn=document.getElementById('btn-avci-home');
const arena=document.getElementById('avc-arena');
const slots=document.getElementById('avc-word-slots');
if(!screen||!homeBtn||!arena||!slots)return;

const AVCI_MISSIONS=Object.freeze([
  {clue:'4 harfli bir hayvan bul',len:4,answers:['KEDİ','KURT','FARE'],meanings:{
    KEDİ:'Evcil olarak da yaşayan küçük, çevik memeli hayvan.',
    KURT:'Köpekgillerden, sürü hâlinde de yaşayabilen yaban hayvanı.',
    FARE:'Küçük yapılı, kemirgen bir memeli hayvan.'
  }},
  {clue:'5 harfli bir mutfak eşyası bul',len:5,answers:['KAŞIK','TABAK','BIÇAK'],meanings:{
    KAŞIK:'Yemek yemeye, almaya veya karıştırmaya yarayan araç.',
    TABAK:'Yiyecek koymaya yarayan yayvan kap.',
    BIÇAK:'Kesme işinde kullanılan keskin ağızlı araç.'
  }},
  {clue:'5 harfli bir eylem sözcüğü bul',len:5,answers:['GETİR','GÖTÜR','YÜRÜT'],meanings:{
    GETİR:'Bir şeyi bulunduğu yerden alıp istenen yere ulaştırmak.',
    GÖTÜR:'Bir şeyi bir yerden başka bir yere taşımak veya iletmek.',
    YÜRÜT:'Yürümesini sağlamak; bir işi sürdürmek veya yönetmek.'
  }},
  {clue:'5 harfli doğayla ilgili bir sözcük bul',len:5,answers:['DENİZ','BULUT','NEHİR'],meanings:{
    DENİZ:'Yeryüzünün büyük bölümünü kaplayan tuzlu su kütlesi.',
    BULUT:'Atmosferde yoğunlaşmış su damlacıkları veya buz kristalleri topluluğu.',
    NEHİR:'Büyük ve sürekli akan doğal su yolu.'
  }},
  {clue:'4 harfli bir ev eşyası bul',len:4,answers:['MASA','HALI','KAPI'],meanings:{
    MASA:'Üzerinde çalışmak, yemek yemek veya eşya koymak için kullanılan mobilya.',
    HALI:'Yere serilen, dokunmuş kalın örtü.',
    KAPI:'Bir yere girip çıkmayı sağlayan açılır kapanır bölüm.'
  }},
  {clue:'5 harfli bir yiyecek bul',len:5,answers:['EKMEK','PİLAV','HELVA'],meanings:{
    EKMEK:'Un, su ve mayayla hazırlanıp pişirilen temel yiyecek.',
    PİLAV:'Pirinç veya bulgurun pişirilmesiyle hazırlanan yemek.',
    HELVA:'Un, irmik veya tahin gibi malzemelerle yapılan tatlı.'
  }},
  {clue:'5 harfli bir meslek bul',len:5,answers:['HEKİM','TERZİ'],meanings:{
    HEKİM:'Hastalıkları tanıyan ve tedavi eden doktor.',
    TERZİ:'Giysi diken veya onaran kişi.'
  }},
  {clue:'5 harfli bir ulaşım aracı bul',len:5,answers:['VAPUR','TAKSİ'],meanings:{
    VAPUR:'Yolcu veya yük taşımaya yarayan gemi.',
    TAKSİ:'Ücret karşılığı yolcu taşıyan otomobil.'
  }},
  {clue:'5 harfli bir renk adı bul',len:5,answers:['SİYAH','BEYAZ','YEŞİL','PEMBE'],meanings:{
    SİYAH:'Işığı yansıtmayan en koyu renk.',
    BEYAZ:'Işığın bütün görünür renklerini yansıtan açık renk.',
    YEŞİL:'Sarı ile mavinin karışımından oluşan renk.',
    PEMBE:'Açık kırmızı tonlarındaki renk.'
  }},
  {clue:'5 harfli bir vücut bölümü bul',len:5,answers:['BURUN','KULAK','BOĞAZ'],meanings:{
    BURUN:'Yüzde bulunan koku alma ve solunuma yardımcı organ.',
    KULAK:'İşitme ve dengeyle ilgili organ.',
    BOĞAZ:'Ağız ve burun boşluklarının arkasındaki geçit bölgesi.'
  }},
  {clue:'5 harfli bir şehir adı bul',len:5,answers:['İZMİR','TOKAT','SİVAS'],meanings:{
    İZMİR:'Türkiye’nin Ege Bölgesi’nde bulunan büyükşehir.',
    TOKAT:'Türkiye’nin Karadeniz Bölgesi’nde bulunan il.',
    SİVAS:'Türkiye’nin İç Anadolu Bölgesi’nde bulunan il.'
  }},
  {clue:'5 harfli okulda kullanılan bir şey bul',len:5,answers:['KALEM','KİTAP','SİLGİ'],meanings:{
    KALEM:'Yazı yazmaya veya çizim yapmaya yarayan araç.',
    KİTAP:'Basılı veya dijital yapraklardan oluşan eser.',
    SİLGİ:'Yazı veya çizgiyi silmeye yarayan araç.'
  }},
  {clue:'5 harfli bir duygu sözcüğü bul',len:5,answers:['SEVGİ','ÖZLEM','KORKU'],meanings:{
    SEVGİ:'Birine veya bir şeye karşı duyulan güçlü yakınlık.',
    ÖZLEM:'Ayrı kalınan birini veya bir şeyi görme isteği.',
    KORKU:'Tehlike karşısında duyulan kaygı ve ürperti.'
  }}
]);

const AVCI_DECOYS='AAAAAAAABCCÇDDEEEEEEEEGĞHIIIIİİİİKKKLLLLMMMNNNNOOÖPRRRRSSSSŞTTTTUUÜVYYZ';
const state={
  running:false,paused:false,raf:0,last:0,deadline:0,remainingMs:60000,
  score:0,caught:0,mission:null,missionIndex:-1,particles:[],selected:[],
  popTimer:null,transitioning:false
};

function avcShuffle(list){
  const a=list.slice();
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
function avcSetFeedback(text='',kind=''){
  const el=document.getElementById('avc-feedback');if(!el)return;
  el.textContent=text;el.classList.remove('good','bad');if(kind)el.classList.add(kind);
}
function avcUpdateHud(){
  document.getElementById('avc-score').textContent=String(state.score);
  document.getElementById('avc-time').textContent=String(Math.max(0,Math.ceil(state.remainingMs/1000)));
  document.getElementById('avc-caught-count').textContent=String(state.caught);
}
function avcRenderSlots(){
  slots.textContent='';
  const len=state.mission?.len||4;
  for(let i=0;i<len;i++){
    const slot=document.createElement('span');slot.className='avc-slot';
    const selected=state.selected[i];
    if(selected){
      slot.classList.add('filled');slot.textContent=selected.letter;
      const sm=document.createElement('small');sm.textContent=String(TILE_SCORE_CACHE[selected.letter]||1);slot.appendChild(sm);
    }
    slots.appendChild(slot);
  }
}
function avcMissionPoolLetters(mission){
  const pool=[];
  for(const answer of mission.answers)for(const ch of Array.from(answer))pool.push(ch);
  while(pool.length<36)pool.push(AVCI_DECOYS[Math.floor(Math.random()*AVCI_DECOYS.length)]);
  return avcShuffle(pool.slice(0,36));
}
function avcRemoveParticles(){
  for(const p of state.particles)p.el?.remove();
  state.particles.length=0;
}
function avcArenaSize(){
  const r=arena.getBoundingClientRect();
  return{w:r.width,h:r.height};
}
function avcSpawnParticles(){
  avcRemoveParticles();
  const letters=avcMissionPoolLetters(state.mission);
  const {w,h}=avcArenaSize();
  const size=w<=390?38:42;
  const cols=Math.max(4,Math.floor(Math.max(1,w-12)/(size+10)));
  letters.forEach((letter,i)=>{
    const el=document.createElement('button');el.type='button';el.className='avc-letter';el.setAttribute('aria-label',letter+' harfini yakala');
    el.textContent=letter;
    const sm=document.createElement('small');sm.textContent=String(TILE_SCORE_CACHE[letter]||1);el.appendChild(sm);
    const col=i%cols,row=Math.floor(i/cols);
    const cellW=Math.max(size+4,(w-size-8)/Math.max(1,cols));
    let x=6+col*cellW+(Math.random()-.5)*10;
    let y=8+row*(size+9)+(Math.random()-.5)*8;
    x=Math.max(2,Math.min(Math.max(2,w-size-2),x));
    y=Math.max(2,Math.min(Math.max(2,h-size-2),y));
    const speed=14+Math.random()*24,angle=Math.random()*Math.PI*2;
    const p={el,letter,x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,size,active:true};
    const idx=state.particles.length;
    el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();avcCatch(idx);},{passive:false});
    state.particles.push(p);arena.appendChild(el);
    el.style.transform=`translate3d(${x}px,${y}px,0)`;
  });
}
function avcReleaseSelected(item){
  const p=state.particles[item.index];if(!p)return;
  p.active=true;p.el.classList.remove('caught');
  const {w,h}=avcArenaSize();
  p.x=Math.max(2,Math.min(w-p.size-2,p.x+(Math.random()-.5)*30));
  p.y=Math.max(2,Math.min(h-p.size-2,p.y+(Math.random()-.5)*30));
}
function avcClearSelection(){
  for(const item of state.selected)avcReleaseSelected(item);
  state.selected.length=0;avcRenderSlots();
}
function avcUndo(){
  if(!state.running||state.paused||state.transitioning||!state.selected.length)return;
  const item=state.selected.pop();avcReleaseSelected(item);avcRenderSlots();avcSetFeedback('Son harf geri bırakıldı.');
}
function avcWord(){
  return state.selected.map(x=>x.letter).join('');
}
function avcShowSuccess(word,meaning,points){
  const pop=document.getElementById('avc-pop'),w=document.getElementById('avc-pop-word'),m=document.getElementById('avc-pop-meaning');
  if(!pop||!w||!m)return;
  clearTimeout(state.popTimer);w.textContent=word+'  +'+points;m.textContent=meaning||'Doğru sözcük!';
  pop.classList.add('show');
  state.popTimer=setTimeout(()=>pop.classList.remove('show'),1250);
}
function avcValidateCompleted(){
  const mission=state.mission,word=avcWord();if(!mission||word.length!==mission.len)return;
  if(mission.answers.includes(word)){
    const tilePoints=Array.from(word).reduce((sum,ch)=>sum+(TILE_SCORE_CACHE[ch]||1),0);
    const speedBonus=Math.max(0,Math.ceil(state.remainingMs/10000));
    const points=tilePoints+mission.len*4+speedBonus;
    state.score+=points;state.caught++;state.transitioning=true;avcUpdateHud();
    avcSetFeedback('DOĞRU! '+word,'good');avcShowSuccess(word,mission.meanings?.[word],points);
    for(const item of state.selected){
      const p=state.particles[item.index];if(p)p.el.classList.add('answer-glow');
    }
    setTimeout(()=>{if(state.running){state.transitioning=false;avcNextMission();}},1250);
  }else{
    state.score=Math.max(0,state.score-3);avcUpdateHud();state.transitioning=true;
    avcSetFeedback(word+' bu göreve uymuyor. -3','bad');
    setTimeout(()=>{if(state.running){state.transitioning=false;avcClearSelection();avcSetFeedback('Tekrar dene.');}},650);
  }
}
function avcCatch(index){
  if(!state.running||state.paused||state.transitioning)return;
  const p=state.particles[index];if(!p||!p.active)return;
  if(state.selected.length>=(state.mission?.len||9))return;
  p.active=false;p.el.classList.add('caught');
  state.selected.push({index,letter:p.letter});avcRenderSlots();
  const word=avcWord();
  const possible=state.mission.answers.some(a=>a.startsWith(word));
  avcSetFeedback(possible?'Devam et…':'Bu başlangıç görev cevaplarına uymuyor.',possible?'':'bad');
  if(state.selected.length===state.mission.len)avcValidateCompleted();
}
function avcChooseMission(){
  let idx=Math.floor(Math.random()*AVCI_MISSIONS.length);
  if(AVCI_MISSIONS.length>1&&idx===state.missionIndex)idx=(idx+1+Math.floor(Math.random()*(AVCI_MISSIONS.length-1)))%AVCI_MISSIONS.length;
  state.missionIndex=idx;return AVCI_MISSIONS[idx];
}
function avcNextMission(){
  state.mission=avcChooseMission();state.selected.length=0;
  document.getElementById('avc-clue').textContent=state.mission.clue;
  document.getElementById('avc-length').textContent=state.mission.len+' HARF';
  avcRenderSlots();avcSpawnParticles();avcSetFeedback('Doğru harfleri sırayla yakala.');
}
function avcStep(ts){
  if(!state.running)return;
  const dt=Math.min(.04,Math.max(0,(ts-state.last)/1000||0));state.last=ts;
  if(!state.paused){
    state.remainingMs=Math.max(0,state.deadline-performance.now());
    avcUpdateHud();
    if(state.remainingMs<=0){avcEndGame();return;}
    const {w,h}=avcArenaSize();
    for(const p of state.particles){
      if(!p.active)continue;
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(p.x<=1){p.x=1;p.vx=Math.abs(p.vx);}
      if(p.x+p.size>=w-1){p.x=Math.max(1,w-p.size-1);p.vx=-Math.abs(p.vx);}
      if(p.y<=1){p.y=1;p.vy=Math.abs(p.vy);}
      if(p.y+p.size>=h-1){p.y=Math.max(1,h-p.size-1);p.vy=-Math.abs(p.vy);}
      p.el.style.transform=`translate3d(${p.x}px,${p.y}px,0)`;
    }
  }
  state.raf=requestAnimationFrame(avcStep);
}
function avcPause(silent=false){
  if(!state.running||state.paused)return;
  state.remainingMs=Math.max(0,state.deadline-performance.now());state.paused=true;
  const b=document.getElementById('btn-avc-pause');if(b)b.textContent='▶';
  if(!silent)avcSetFeedback('DURAKLATILDI');
}
function avcResume(){
  if(!state.running||!state.paused)return;
  state.paused=false;state.deadline=performance.now()+state.remainingMs;state.last=performance.now();
  const b=document.getElementById('btn-avc-pause');if(b)b.textContent='Ⅱ';avcSetFeedback('Av devam ediyor.');
}
function avcEndGame(){
  if(!state.running)return;
  state.running=false;state.paused=false;cancelAnimationFrame(state.raf);state.raf=0;clearTimeout(state.popTimer);
  document.getElementById('avc-final-score').textContent=String(state.score);
  document.getElementById('avc-final-caught').textContent=String(state.caught);
  document.getElementById('avc-gameover')?.classList.remove('hidden');
}
function avcReset(){
  cancelAnimationFrame(state.raf);clearTimeout(state.popTimer);
  state.running=true;state.paused=false;state.score=0;state.caught=0;state.remainingMs=60000;state.deadline=performance.now()+60000;
  state.transitioning=false;state.last=performance.now();state.selected.length=0;
  document.getElementById('avc-gameover')?.classList.add('hidden');document.getElementById('avc-rules')?.classList.add('hidden');
  const b=document.getElementById('btn-avc-pause');if(b)b.textContent='Ⅱ';
  avcUpdateHud();avcNextMission();state.raf=requestAnimationFrame(avcStep);
}
function avcExit(){
  state.running=false;state.paused=false;cancelAnimationFrame(state.raf);state.raf=0;clearTimeout(state.popTimer);avcRemoveParticles();
  screen.classList.add('hidden');document.getElementById('avc-gameover')?.classList.add('hidden');document.getElementById('avc-rules')?.classList.add('hidden');
  document.getElementById('screen-home')?.classList.remove('hidden');
}
async function avcOpen(){
  document.getElementById('screen-home')?.classList.add('hidden');screen.classList.remove('hidden');
  avcSetFeedback('AVCI hazırlanıyor…');
  try{await ensureWordDataLoaded();avcReset();}
  catch(err){console.error('Avcı startup failed',err);showToast('AVCI hazırlanamadı.','rose');avcExit();}
}

window.openKapmacaAvci=avcOpen;
document.getElementById('btn-avc-exit')?.addEventListener('click',avcExit);
document.getElementById('btn-avc-exit-home')?.addEventListener('click',avcExit);
document.getElementById('btn-avc-again')?.addEventListener('click',avcReset);
document.getElementById('btn-avc-new')?.addEventListener('click',()=>{document.getElementById('avc-rules')?.classList.add('hidden');avcReset();});
document.getElementById('btn-avc-undo')?.addEventListener('click',avcUndo);
document.getElementById('btn-avc-clear')?.addEventListener('click',()=>{if(state.running&&!state.paused&&!state.transitioning){avcClearSelection();avcSetFeedback('Seçim temizlendi.');}});
document.getElementById('btn-avc-pause')?.addEventListener('click',()=>state.paused?avcResume():avcPause());
document.getElementById('btn-avc-rules')?.addEventListener('click',()=>{if(state.running&&!state.paused)avcPause(true);document.getElementById('avc-rules')?.classList.remove('hidden');});
document.getElementById('btn-avc-rule-close')?.addEventListener('click',()=>{document.getElementById('avc-rules')?.classList.add('hidden');if(state.running&&state.paused)avcResume();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!screen.classList.contains('hidden')&&state.running&&!state.paused)avcPause(true);});
window.addEventListener('resize',()=>{
  if(screen.classList.contains('hidden'))return;
  const {w,h}=avcArenaSize();
  for(const p of state.particles){p.x=Math.max(1,Math.min(Math.max(1,w-p.size-1),p.x));p.y=Math.max(1,Math.min(Math.max(1,h-p.size-1),p.y));}
},{passive:true});
})();


/* v617 — VURMACA: uçuşan hedef harfleri küçük topla vurma */
(()=>{
const screen=document.getElementById('screen-vurmaca2');
const homeBtn=document.getElementById('btn-vurmaca-home');
const wrap=document.getElementById('vur2-arena-wrap');
const arena=document.getElementById('vur2-arena');
const projectileEl=document.getElementById('vur2-projectile');
const aimEl=document.getElementById('vur2-aim-line');
const barrel=document.getElementById('vur2-barrel');
if(!screen||!homeBtn||!wrap||!arena||!projectileEl||!aimEl||!barrel)return;

const FALLBACK_TARGETS=['KALEM','YEMEK','SABAH','AKŞAM','KİTAP','DENİZ','BULUT','ORMAN','ÇANTA','PERDE','DURAK','MARKET','KOMŞU','ÇOCUK','YORGUN','SEVGİ','ÖZLEM','MASAL','YAYLA','BOZKIR','ERİK','NİĞDE'];
const FILL='AAAAAAAABCCÇDDEEEEEEEEGĞHIIIIİİİİKKKLLLLMMMNNNNOOÖPRRRRSSSSŞTTTTUUÜVYYZ';
const state={
  running:false,paused:false,raf:0,last:0,deadline:0,remainingMs:60000,
  score:0,targetsDone:0,target:'',targetIndex:0,targetStartedAt:0,targetSerial:0,
  flyers:[],shot:null,aimX:0,aimY:0,pointerId:null,bombReady:true,bombTimer:null,popTimer:null
};

function vur2SetFeedback(text='',kind=''){
  const el=document.getElementById('vur2-feedback');if(!el)return;
  el.textContent=text;el.classList.remove('good','bad');if(kind)el.classList.add(kind);
}
function vur2UpdateHud(){
  document.getElementById('vur2-score').textContent=String(state.score);
  document.getElementById('vur2-time').textContent=String(Math.max(0,Math.ceil(state.remainingMs/1000)));
  document.getElementById('vur2-target-count').textContent=String(state.targetsDone);
}
function vur2WordScore(word){
  return Array.from(word).reduce((sum,ch)=>sum+(TILE_SCORE_CACHE[ch]||1),0);
}
function vur2TargetPool(){
  let pool=[];
  try{
    if(typeof DAILY_BOARD_PRIORITY_WORDS!=='undefined'){
      pool=[...DAILY_BOARD_PRIORITY_WORDS].filter(w=>w.length>=3&&w.length<=7&&GAME_WORD_SET.has(w)&&!isArgoWord(w)&&!isForeignWord(w));
    }
  }catch(_){}
  if(pool.length<12)pool=FALLBACK_TARGETS.filter(w=>GAME_WORD_SET.has(w)||FALLBACK_TARGETS.includes(w));
  return pool.length?pool:FALLBACK_TARGETS;
}
function vur2ChooseTarget(){
  const pool=vur2TargetPool().filter(w=>w!==state.target);
  state.target=pool[Math.floor(Math.random()*pool.length)]||'KALEM';
  state.targetIndex=0;state.targetStartedAt=performance.now();state.targetSerial++;
  vur2RenderTarget();vur2EnsureNeededLetter();vur2SetFeedback('Sıradaki harfi vur: '+state.target[0]);
}
function vur2RenderTarget(){
  const host=document.getElementById('vur2-target-word');if(!host)return;
  host.textContent='';
  Array.from(state.target).forEach((ch,i)=>{
    const t=document.createElement('span');t.className='vur2-target-tile'+(i<state.targetIndex?' done':i===state.targetIndex?' next':'');t.textContent=ch;
    const sm=document.createElement('small');sm.textContent=String(TILE_SCORE_CACHE[ch]||1);t.appendChild(sm);host.appendChild(t);
  });
}
function vur2ShowPop(title,sub,duration=950){
  const pop=document.getElementById('vur2-pop'),a=document.getElementById('vur2-pop-title'),b=document.getElementById('vur2-pop-sub');
  if(!pop||!a||!b)return;
  clearTimeout(state.popTimer);a.textContent=title;b.textContent=sub||'';pop.classList.add('show');
  state.popTimer=setTimeout(()=>pop.classList.remove('show'),duration);
}
function vur2ArenaSize(){
  const r=wrap.getBoundingClientRect();return{w:r.width,h:r.height};
}
function vur2RandomLetter(){
  return FILL[Math.floor(Math.random()*FILL.length)];
}
function vur2CreateFlyer(letter,x=null,y=null){
  const {w,h}=vur2ArenaSize(),size=w<=390?36:40;
  const el=document.createElement('div');el.className='vur2-fly';el.textContent=letter;
  const sm=document.createElement('small');sm.textContent=String(TILE_SCORE_CACHE[letter]||1);el.appendChild(sm);
  const speed=26+Math.random()*54,angle=Math.random()*Math.PI*2;
  const p={
    el,letter,size,
    x:x==null?5+Math.random()*Math.max(5,w-size-10):x,
    y:y==null?8+Math.random()*Math.max(8,h-size-28):y,
    vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed
  };
  arena.appendChild(el);state.flyers.push(p);return p;
}
function vur2RemoveFlyers(){
  for(const p of state.flyers)p.el?.remove();
  state.flyers.length=0;
}
function vur2Populate(){
  vur2RemoveFlyers();
  const letters=[];
  for(const ch of Array.from(state.target))letters.push(ch);
  while(letters.length<30)letters.push(vur2RandomLetter());
  for(let i=letters.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[letters[i],letters[j]]=[letters[j],letters[i]];}
  letters.forEach(ch=>vur2CreateFlyer(ch));
}
function vur2HasLetter(letter){
  return state.flyers.some(p=>p.letter===letter);
}
function vur2EnsureNeededLetter(){
  const needed=state.target[state.targetIndex];if(!needed||vur2HasLetter(needed))return;
  const candidates=state.flyers.filter(p=>p.letter!==needed);
  const p=candidates[Math.floor(Math.random()*candidates.length)];
  if(p){
    p.letter=needed;p.el.firstChild.nodeValue=needed;
    const sm=p.el.querySelector('small');if(sm)sm.textContent=String(TILE_SCORE_CACHE[needed]||1);
  }else vur2CreateFlyer(needed);
}
function vur2RespawnFlyer(p){
  if(!p)return;
  p.letter=vur2RandomLetter();p.el.firstChild.nodeValue=p.letter;
  const sm=p.el.querySelector('small');if(sm)sm.textContent=String(TILE_SCORE_CACHE[p.letter]||1);
  const {w,h}=vur2ArenaSize();
  p.x=5+Math.random()*Math.max(5,w-p.size-10);p.y=8+Math.random()*Math.max(8,h-p.size-28);
  const speed=26+Math.random()*54,angle=Math.random()*Math.PI*2;p.vx=Math.cos(angle)*speed;p.vy=Math.sin(angle)*speed;
  p.el.classList.remove('hit');p.el.style.opacity='1';
}
function vur2ApplyMiss(reason='ISKA! -5'){
  state.score-=5;vur2UpdateHud();vur2SetFeedback(reason,'bad');vur2ShowPop('-5','ISKA',650);
}
function vur2CompleteTarget(){
  const elapsed=performance.now()-state.targetStartedAt;
  const fast=elapsed<=10000;
  const base=vur2WordScore(state.target),points=fast?base*2:base;
  state.score+=points;state.targetsDone++;vur2UpdateHud();
  vur2ShowPop(state.target+'  +'+points,fast?'10 SANİYE BONUSU • 2×':'HEDEF TAMAMLANDI',1150);
  vur2SetFeedback(fast?'Hız bonusu! Sözcük puanı 2×.':'Hedef tamamlandı!','good');
  const serial=state.targetSerial;
  setTimeout(()=>{
    if(!state.running||state.targetSerial!==serial)return;
    vur2ChooseTarget();vur2Populate();
  },950);
}
function vur2HitFlyer(p){
  if(!p)return;
  const hitLetter=p.letter,needed=state.target[state.targetIndex];
  p.el.classList.add('hit');
  setTimeout(()=>{if(state.running)vur2RespawnFlyer(p);},210);
  if(hitLetter===needed){
    state.targetIndex++;vur2RenderTarget();
    if(state.targetIndex>=state.target.length){vur2CompleteTarget();return;}
    vur2SetFeedback('DOĞRU! Şimdi '+state.target[state.targetIndex]+' harfini vur.','good');
    setTimeout(()=>{if(state.running)vur2EnsureNeededLetter();},240);
  }else{
    vur2ApplyMiss('Yanlış harf: '+hitLetter+' • -5');
    setTimeout(()=>{if(state.running)vur2EnsureNeededLetter();},240);
  }
}
function vur2LauncherPoint(){
  const {w,h}=vur2ArenaSize();return{x:w/2,y:h-4};
}
function vur2AimAt(clientX,clientY){
  const r=wrap.getBoundingClientRect(),start=vur2LauncherPoint();
  let x=Math.max(0,Math.min(r.width,clientX-r.left)),y=Math.max(0,Math.min(r.height-20,clientY-r.top));
  const dx=x-start.x,dy=y-start.y;
  const angle=Math.atan2(dy,dx);
  const deg=angle*180/Math.PI+90;
  barrel.style.transform='translateX(-50%) rotate('+Math.max(-72,Math.min(72,deg))+'deg)';
  const len=Math.hypot(dx,dy);
  aimEl.style.left=start.x+'px';aimEl.style.top=start.y+'px';aimEl.style.width=Math.min(len,180)+'px';
  aimEl.style.transform='rotate('+angle+'rad)';
  state.aimX=x;state.aimY=y;
}
function vur2Fire(){
  if(!state.running||state.paused||state.shot)return;
  const start=vur2LauncherPoint();
  let dx=state.aimX-start.x,dy=state.aimY-start.y;
  if(dy>-18)dy=-18;
  const len=Math.hypot(dx,dy)||1,speed=570;
  state.shot={x:start.x-6.5,y:start.y-6.5,vx:dx/len*speed,vy:dy/len*speed,size:13};
  projectileEl.style.display='block';
}
function vur2EndShot(hit=null){
  if(!state.shot)return;
  state.shot=null;projectileEl.style.display='none';
  if(hit)vur2HitFlyer(hit);else vur2ApplyMiss();
}
function vur2UpdateShot(dt){
  const sh=state.shot;if(!sh)return;
  sh.x+=sh.vx*dt;sh.y+=sh.vy*dt;
  projectileEl.style.transform='translate3d('+sh.x+'px,'+sh.y+'px,0)';
  for(const p of state.flyers){
    const cx=p.x+p.size/2,cy=p.y+p.size/2,sx=sh.x+sh.size/2,sy=sh.y+sh.size/2;
    if(Math.hypot(cx-sx,cy-sy)<=p.size*.46+sh.size*.46){vur2EndShot(p);return;}
  }
  const {w,h}=vur2ArenaSize();
  if(sh.x+sh.size<0||sh.x>w||sh.y+sh.size<0||sh.y>h){vur2EndShot(null);}
}
function vur2Bomb(){
  if(!state.running||state.paused||!state.bombReady)return;
  state.bombReady=false;const buttons=[document.getElementById('btn-vur2-bomb-left'),document.getElementById('btn-vur2-bomb-right')];
  buttons.forEach(b=>{if(b)b.disabled=true;});
  if(state.shot){state.shot=null;projectileEl.style.display='none';}
  for(const p of state.flyers)p.el.classList.add('hit');
  vur2ShowPop('💥','HARFLER YENİLENİYOR',650);
  setTimeout(()=>{if(state.running){vur2Populate();vur2EnsureNeededLetter();}},250);
  clearTimeout(state.bombTimer);
  state.bombTimer=setTimeout(()=>{state.bombReady=true;buttons.forEach(b=>{if(b)b.disabled=false;});},2200);
}
function vur2UpdateFastBonus(){
  const el=document.getElementById('vur2-fast-bonus');if(!el)return;
  const left=Math.max(0,10-(performance.now()-state.targetStartedAt)/1000);
  if(left>0){el.textContent=Math.ceil(left)+' SN • 2×';el.classList.remove('off');}
  else{el.textContent='NORMAL PUAN';el.classList.add('off');}
}
function vur2Frame(ts){
  if(!state.running)return;
  const dt=Math.min(.04,Math.max(0,(ts-state.last)/1000||0));state.last=ts;
  if(!state.paused){
    state.remainingMs=Math.max(0,state.deadline-performance.now());vur2UpdateHud();vur2UpdateFastBonus();
    if(state.remainingMs<=0){vur2EndGame();return;}
    const {w,h}=vur2ArenaSize();
    for(const p of state.flyers){
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(p.x<=1){p.x=1;p.vx=Math.abs(p.vx);}
      if(p.x+p.size>=w-1){p.x=Math.max(1,w-p.size-1);p.vx=-Math.abs(p.vx);}
      if(p.y<=1){p.y=1;p.vy=Math.abs(p.vy);}
      if(p.y+p.size>=h-18){p.y=Math.max(1,h-p.size-18);p.vy=-Math.abs(p.vy);}
      p.el.style.transform='translate3d('+p.x+'px,'+p.y+'px,0)';
    }
    vur2UpdateShot(dt);
  }
  state.raf=requestAnimationFrame(vur2Frame);
}
function vur2Pause(silent=false){
  if(!state.running||state.paused)return;
  state.remainingMs=Math.max(0,state.deadline-performance.now());state.paused=true;
  const b=document.getElementById('btn-vur2-pause');if(b)b.textContent='▶';if(!silent)vur2SetFeedback('DURAKLATILDI');
}
function vur2Resume(){
  if(!state.running||!state.paused)return;
  state.paused=false;state.deadline=performance.now()+state.remainingMs;state.last=performance.now();
  const b=document.getElementById('btn-vur2-pause');if(b)b.textContent='Ⅱ';vur2SetFeedback('Vurmaca devam ediyor.');
}
function vur2EndGame(){
  if(!state.running)return;
  state.running=false;state.paused=false;cancelAnimationFrame(state.raf);state.raf=0;clearTimeout(state.popTimer);clearTimeout(state.bombTimer);
  state.shot=null;projectileEl.style.display='none';
  document.getElementById('vur2-final-score').textContent=String(state.score);
  document.getElementById('vur2-final-targets').textContent=String(state.targetsDone);
  document.getElementById('vur2-gameover')?.classList.remove('hidden');
}
function vur2Reset(){
  cancelAnimationFrame(state.raf);clearTimeout(state.popTimer);clearTimeout(state.bombTimer);
  state.running=true;state.paused=false;state.score=0;state.targetsDone=0;state.remainingMs=60000;state.deadline=performance.now()+60000;
  state.last=performance.now();state.shot=null;state.bombReady=true;
  document.getElementById('vur2-gameover')?.classList.add('hidden');document.getElementById('vur2-rules')?.classList.add('hidden');
  document.getElementById('btn-vur2-bomb-left').disabled=false;document.getElementById('btn-vur2-bomb-right').disabled=false;
  const b=document.getElementById('btn-vur2-pause');if(b)b.textContent='Ⅱ';
  vur2UpdateHud();vur2ChooseTarget();vur2Populate();
  const {w,h}=vur2ArenaSize();state.aimX=w/2;state.aimY=Math.max(25,h*.28);
  const rect=wrap.getBoundingClientRect();vur2AimAt(rect.left+state.aimX,rect.top+state.aimY);
  state.raf=requestAnimationFrame(vur2Frame);
}
function vur2Exit(){
  state.running=false;state.paused=false;cancelAnimationFrame(state.raf);state.raf=0;clearTimeout(state.popTimer);clearTimeout(state.bombTimer);
  state.shot=null;projectileEl.style.display='none';vur2RemoveFlyers();screen.classList.add('hidden');
  document.getElementById('vur2-gameover')?.classList.add('hidden');document.getElementById('vur2-rules')?.classList.add('hidden');
  document.getElementById('screen-home')?.classList.remove('hidden');
}
async function vur2Open(){
  document.getElementById('screen-home')?.classList.add('hidden');screen.classList.remove('hidden');vur2SetFeedback('VURMACA hazırlanıyor…');
  try{await ensureWordDataLoaded();vur2Reset();}
  catch(err){console.error('Vurmaca startup failed',err);showToast('VURMACA hazırlanamadı.','rose');vur2Exit();}
}

wrap.addEventListener('pointermove',e=>{if(state.running&&!state.paused&&!state.shot)vur2AimAt(e.clientX,e.clientY);},{passive:true});
wrap.addEventListener('pointerdown',e=>{
  if(!state.running||state.paused||state.shot)return;e.preventDefault();state.pointerId=e.pointerId;wrap.setPointerCapture?.(e.pointerId);vur2AimAt(e.clientX,e.clientY);
},{passive:false});
wrap.addEventListener('pointerup',e=>{
  if(state.pointerId!==e.pointerId)return;e.preventDefault();try{wrap.releasePointerCapture(e.pointerId);}catch(_){}
  state.pointerId=null;vur2AimAt(e.clientX,e.clientY);vur2Fire();
},{passive:false});
wrap.addEventListener('pointercancel',e=>{if(state.pointerId===e.pointerId)state.pointerId=null;},{passive:true});

window.openKapmacaVurmaca=vur2Open;
document.getElementById('btn-vur2-exit')?.addEventListener('click',vur2Exit);
document.getElementById('btn-vur2-home-exit')?.addEventListener('click',vur2Exit);
document.getElementById('btn-vur2-again')?.addEventListener('click',vur2Reset);
document.getElementById('btn-vur2-new')?.addEventListener('click',vur2Reset);
document.getElementById('btn-vur2-bomb-left')?.addEventListener('click',vur2Bomb);
document.getElementById('btn-vur2-bomb-right')?.addEventListener('click',vur2Bomb);
document.getElementById('btn-vur2-pause')?.addEventListener('click',()=>state.paused?vur2Resume():vur2Pause());
document.getElementById('btn-vur2-rules')?.addEventListener('click',()=>{if(state.running&&!state.paused)vur2Pause(true);document.getElementById('vur2-rules')?.classList.remove('hidden');});
document.getElementById('btn-vur2-rule-close')?.addEventListener('click',()=>{document.getElementById('vur2-rules')?.classList.add('hidden');if(state.running&&state.paused)vur2Resume();});
document.getElementById('btn-vur2-rule-new')?.addEventListener('click',()=>{document.getElementById('vur2-rules')?.classList.add('hidden');vur2Reset();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!screen.classList.contains('hidden')&&state.running&&!state.paused)vur2Pause(true);});
window.addEventListener('resize',()=>{
  if(screen.classList.contains('hidden'))return;
  const {w,h}=vur2ArenaSize();
  for(const p of state.flyers){p.x=Math.max(1,Math.min(Math.max(1,w-p.size-1),p.x));p.y=Math.max(1,Math.min(Math.max(1,h-p.size-18),p.y));}
},{passive:true});
})();

/* v648 — GÖKDELEN: kesintisiz yavaş kamera ve gerçek ölçekli sokak */
(()=>{
const screen=document.getElementById('screen-kesisim');
const boardEl=document.getElementById('ksm-board');
const wrap=document.getElementById('ksm-board-wrap');
const rackP1El=document.getElementById('ksm-rack-p1');
const ghost=document.getElementById('ksm-drag-ghost');
if(!screen||!boardEl||!wrap||!rackP1El||!ghost)return;

const ROWS=40,COLS=9,H=1,V=2,TOTAL_TILES=300;
const LETTER_POOL='AAAAAAAABCCÇDDEEEEEEEEGĞHIIIIİİİİKKKLLLLMMMNNNNOOÖPRRRRSSSSŞTTTTUUÜVYYZ';
const SEEDS=['ARKADAŞ','PENCERE','ÇİÇEKLİ','BİLGİLİ','KARINCA','KELEBEK','GÖKYÜZÜ','KİTAPÇI','SÜPÜRGE','KAPLAMA','ÖĞRENCİ','SEVGİLİ','KIRMIZI','TURUNCU','DOSTLUK','BAHÇELİ','ÇOCUKÇA','DÜŞÜNCE','BULMACA','DENİZCİ','GÜNEŞLİ'];
const AI_LEVELS={easy:{maxLen:3,focus:.15,top:20,delay:2100,rackTrials:24},medium:{maxLen:4,focus:.40,top:12,delay:1700,rackTrials:48},hard:{maxLen:5,focus:.70,top:6,delay:1300,rackTrials:80},expert:{maxLen:6,focus:.90,top:3,delay:1100,rackTrials:128}};
const state={
  multiplayer:false,networkPlaying:false,mySide:0,aiLevel:'easy',networkBusy:false,revision:-1,
  grid:Array.from({length:ROWS},()=>Array(COLS).fill('')),
  dirs:Array.from({length:ROWS},()=>Array(COLS).fill(0)),
  used:new Set(),seedKeys:new Set(),flowers:new Set(),flowerIcons:new Map(),words:[],scores:[0,0],turn:0,bag:[],racks:[[],[]],broomUsed:[0,0],
  temp:new Map(),tempOrder:[],drag:null,meaningBlockedUntil:0,popTimer:null,gameOver:false,turnLeft:30,turnTimer:null,aiTimer:null,lastHeartSec:null,lastBellSec:null,
  highestFloors:[0,0],longestWords:['',''],wordCounts:[0,0],roofWinner:-1,lowBagWarned:false,finalBagTimer:null,
  introActive:false,introToken:0,introFrame:null,introCamera:null,introTimers:new Set()
};
const cells=[];
function myTurn(){return (!state.multiplayer||state.networkPlaying)&&!state.networkBusy&&state.turn===state.mySide;}
function aiName(){return state.multiplayer?'2. OYUNCU':(BOT_DISPLAY_NAMES[state.aiLevel]||'DURGUN');}
const key=(r,c)=>r+','+c;
const RACK_VOWELS=new Set(Array.from('AEIİOÖUÜ'));
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function makeBag(){
  // Fixed proportions prevent a match starting with an accidentally vowel-heavy bag.
  const pool=Array.from(LETTER_POOL),a=[];
  for(let i=0;i<TOTAL_TILES;i++)a.push(pool[i%pool.length]);
  return shuffle(a);
}
function rackPoints(rack){return rack.reduce((n,ch)=>n+(TILE_SCORE_CACHE[ch]||1),0);}
function drawRackToNine(p){
  const rack=state.racks[p],needed=Math.min(9-rack.length,state.bag.length);
  if(needed<=0)return;
  const finalSize=rack.length+needed,other=state.racks[1-p];
  const bagAverage=rackPoints(state.bag)/state.bag.length;
  const reference=other.length===9?rackPoints(other)/9:bagAverage;
  const target=Math.max(bagAverage-.5,Math.min(bagAverage+.5,reference))*finalSize;
  let best=null,bestCost=Infinity;
  // Sample only replacements. Letters the player kept are never exchanged.
  const aiDraw=!state.multiplayer&&p===1;
  const trials=aiDraw?AI_LEVELS[state.aiLevel].rackTrials:192;
  for(let attempt=0;attempt<trials;attempt++){
    const indices=new Set();
    while(indices.size<needed)indices.add(Math.floor(Math.random()*state.bag.length));
    const candidate=[...rack,...Array.from(indices,i=>state.bag[i])];
    const counts=new Map();let vowels=0,high=0;
    for(const ch of candidate){counts.set(ch,(counts.get(ch)||0)+1);if(RACK_VOWELS.has(ch))vowels++;if((TILE_SCORE_CACHE[ch]||1)>=5)high++;}
    const repeats=[...counts.values()].reduce((n,c)=>n+Math.max(0,c-2)**2,0);
    const minVowels=Math.min(aiDraw?2:3,Math.floor(finalSize/3)),maxVowels=aiDraw?Math.max(2,Math.floor(finalSize/2)):Math.ceil(finalSize/2);
    const vowelPenalty=Math.max(0,minVowels-vowels)+Math.max(0,vowels-maxVowels);
    const cost=repeats*1000+vowelPenalty*200+Math.abs(rackPoints(candidate)-target)*8+Math.max(0,high-2)*60;
    if(cost<bestCost){bestCost=cost;best=[...indices];}
  }
  const letters=best.map(i=>state.bag[i]);
  best.sort((a,b)=>b-a).forEach(i=>state.bag.splice(i,1));
  rack.push(...letters);
}
function consumeSeedFromBag(word){for(const ch of word){const i=state.bag.indexOf(ch);if(i>=0)state.bag.splice(i,1);else if(state.bag.length)state.bag.pop();}}
function setFeedback(text='',kind=''){const el=document.getElementById('ksm-feedback');if(el){el.textContent=text;el.classList.remove('good','bad');if(kind)el.classList.add(kind);}const top=document.getElementById('ksm-turn-status-top');if(top&&text)top.textContent=text;}
const GOKDELEN_NOTICE_EXTRA_MS=1000;
function showPop(title,sub='',duration=950){
  const pop=document.getElementById('ksm-pop'),a=document.getElementById('ksm-pop-title'),b=document.getElementById('ksm-pop-sub');
  if(!pop||!a||!b)return;
  clearTimeout(state.popTimer);pop.classList.remove('ksm-bonus-pop','ksm-flower-pop');
  a.textContent=title;b.textContent=sub;pop.classList.add('show');
  state.popTimer=setTimeout(()=>pop.classList.remove('show'),Math.max(0,duration)+GOKDELEN_NOTICE_EXTRA_MS);
}
function showBonusPop(title,sub='',flower=false,duration=1100){
  const pop=document.getElementById('ksm-pop'),a=document.getElementById('ksm-pop-title'),b=document.getElementById('ksm-pop-sub');if(!pop||!a||!b)return;
  clearTimeout(state.popTimer);a.textContent=title;b.textContent=sub;pop.classList.add('show','ksm-bonus-pop');pop.classList.toggle('ksm-flower-pop',!!flower);
  state.popTimer=setTimeout(()=>{pop.classList.remove('show','ksm-bonus-pop','ksm-flower-pop');},Math.max(0,duration)+GOKDELEN_NOTICE_EXTRA_MS);
}
function wordScore(word){return Array.from(word).reduce((n,ch)=>n+(TILE_SCORE_CACHE[ch]||1),0)+Math.max(0,word.length-2)*2;}
function tempAt(r,c){return state.temp.get(key(r,c))||null;}
function charAt(r,c){const t=tempAt(r,c);return t?t.char:(state.grid[r]?.[c]||'');}
function rackIndexUsed(index){for(const t of state.temp.values())if(t.rackIndex===index)return true;return false;}

const GOKDELEN_SEED_ROW=ROWS-8; // kapının üstünden 4. satır
const GOKDELEN_BASE_ROW=GOKDELEN_SEED_ROW;
const GOKDELEN_ROOF_BONUS=20;
function openingPlacementFree(){return Number(state.wordCounts?.[0]||0)+Number(state.wordCounts?.[1]||0)===0;}
function floorForRow(r){return Math.max(0,GOKDELEN_BASE_ROW-Number(r||0));}
function topCommittedRow(){
  for(let r=0;r<ROWS;r++)if(state.grid[r]?.some(Boolean))return r;
  return GOKDELEN_BASE_ROW;
}
function currentBuildingFloor(){return floorForRow(topCommittedRow());}
function updateGokdelenAtmosphere(){
  const floor=currentBuildingFloor();
  const level=floor>=30?3:floor>=20?2:floor>=10?1:0;
  if(screen.dataset.skyLevel!==String(level))screen.dataset.skyLevel=String(level);
  const badge=document.getElementById('ksm-floor-current');
  if(badge)badge.textContent=topCommittedRow()===0?'ÇATI':floor+'. KAT';
}
function recordMoveStats(side,result,placed){
  const floor=placed.length?Math.max(...placed.map(t=>floorForRow(t.r))):0;
  state.highestFloors[side]=Math.max(Number(state.highestFloors[side]||0),floor);
  const moveWords=(result.words||[]).map(w=>String(w.word||'')).filter(Boolean);
  state.wordCounts[side]=Number(state.wordCounts[side]||0)+moveWords.length;
  for(const word of moveWords){
    const prev=String(state.longestWords[side]||'');
    if(word.length>prev.length)state.longestWords[side]=word;
  }
  if(Number(result.roofBonus||0)>0&&state.roofWinner<0)state.roofWinner=side;
}
function clearGokdelenFx(){
  if(state.finalBagTimer){clearTimeout(state.finalBagTimer);state.finalBagTimer=null;}
  boardEl.querySelectorAll('.ksm-cell-bonus-tag,.ksm-window-flash').forEach(el=>el.remove());
  cells.forEach(el=>el.classList.remove('ksm-opponent-p1','ksm-opponent-p2'));
}
function showCellBonusTag(r,c,text,kind='climb'){
  const cell=cells[r*COLS+c];if(!cell)return;
  const tag=document.createElement('div');tag.className='ksm-cell-bonus-tag '+kind;tag.textContent=text;
  tag.style.left=(cell.offsetLeft+cell.offsetWidth/2)+'px';tag.style.top=Math.max(2,cell.offsetTop-3)+'px';
  boardEl.appendChild(tag);setTimeout(()=>tag.remove(),1750);
}
function flashOpponentMove(placed,side){
  if(Number(side)===Number(state.mySide))return;
  const cls=Number(side)===0?'ksm-opponent-p1':'ksm-opponent-p2';
  for(const t of placed||[])cells[t.r*COLS+t.c]?.classList.add(cls);
  setTimeout(()=>{for(const t of placed||[])cells[t.r*COLS+t.c]?.classList.remove(cls);},1150);
}
function celebrateLongWord(){
  boardEl.querySelector('.ksm-window-flash')?.remove();
  const fx=document.createElement('div');fx.className='ksm-window-flash';fx.setAttribute('aria-hidden','true');boardEl.appendChild(fx);
  setTimeout(()=>fx.remove(),1350);
}
function showMoveIdentityFx(result,placed,side){
  for(const t of result.climbTiles||[])showCellBonusTag(t.r,t.c,'+5','climb');
  const tower=(placed||[]).find(t=>t.tower);if(tower)showCellBonusTag(tower.r,tower.c,'▲ KULE','tower');
  if(Number(result.roofBonus||0)>0){
    const roof=(placed||[]).find(t=>t.r===0);if(roof)showCellBonusTag(roof.r,roof.c,'ÇATI +20','roof');
  }
  if((result.words||[]).some(w=>String(w.word||'').length>=6))celebrateLongWord();
  flashOpponentMove(placed,side);
  updateGokdelenAtmosphere();
}
function maybeWarnFinalBag(delay=2300){
  if(state.lowBagWarned||state.bag.length>30||state.gameOver)return;
  state.lowBagWarned=true;
  const token=state.introToken;
  state.finalBagTimer=setTimeout(()=>{
    state.finalBagTimer=null;
    if(token!==state.introToken||screen.classList.contains('hidden')||state.gameOver)return;
    showPop('SON KATLAR','TORBADA '+state.bag.length+' HARF KALDI',1400);
  },Math.max(0,delay));
}
function renderGameOverStats(){
  const p2Name=state.multiplayer?'2. OYUNCU':aiName();
  const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
  set('ksm-over-p1-name',state.multiplayer?'1. OYUNCU':'OYUNCU');set('ksm-over-p2-name',p2Name);
  set('ksm-over-p1-floor',state.highestFloors[0]+' KAT');set('ksm-over-p2-floor',state.highestFloors[1]+' KAT');
  set('ksm-over-p1-longest',state.longestWords[0]||'—');set('ksm-over-p2-longest',state.longestWords[1]||'—');
  set('ksm-over-p1-words',String(state.wordCounts[0]||0));set('ksm-over-p2-words',String(state.wordCounts[1]||0));
}

function updateHud(){
  document.getElementById('ksm-p1-score').textContent=String(state.scores[0]);
  document.getElementById('ksm-p2-score').textContent=String(state.scores[1]);
  const bagCount=document.getElementById('ksm-bag-count');if(bagCount)bagCount.textContent=String(state.bag.length);
  const bagCard=bagCount?.closest('.ksm-bag-card');
  if(bagCard){
    const left=state.bag.length;
    bagCard.classList.remove('bag-warm','bag-hot','bag-critical','ksm-final-bag');
    if(left<=30)bagCard.classList.add('bag-critical','ksm-final-bag');
    else if(left<=60)bagCard.classList.add('bag-critical');
    else if(left<=120)bagCard.classList.add('bag-hot');
    else if(left<=200)bagCard.classList.add('bag-warm');
  }
  updateGokdelenAtmosphere();
  document.getElementById('ksm-p1-label')?.classList.toggle('active',state.turn===0);
  document.getElementById('ksm-p2-label')?.classList.toggle('active',state.turn===1);
  document.getElementById('ksm-p1-card')?.classList.toggle('active',state.turn===0);
  document.getElementById('ksm-p2-card')?.classList.toggle('active',state.turn===1);
  const broom=document.getElementById('ksm-broom-left');if(broom)broom.textContent='×'+Math.max(0,2-state.broomUsed[state.mySide]);
  document.getElementById('ksm-p1-label').textContent=state.multiplayer?'1. OYUNCU':'OYUNCU';
  document.getElementById('ksm-p2-label').textContent=aiName();
  const aiTurn=state.introActive||!myTurn();
  const broomBtn=document.getElementById('btn-ksm-broom');if(broomBtn)broomBtn.disabled=aiTurn||state.broomUsed[state.mySide]>=2||state.temp.size>0||state.gameOver;
  const shuffleBtn=document.getElementById('btn-ksm-shuffle');if(shuffleBtn)shuffleBtn.disabled=aiTurn||state.temp.size>0||state.gameOver;
  const undoBtn=document.getElementById('btn-ksm-undo');if(undoBtn)undoBtn.disabled=aiTurn||!state.temp.size||state.gameOver;
  const placeBtn=document.getElementById('btn-ksm-place');if(placeBtn)placeBtn.disabled=aiTurn||!state.temp.size||state.gameOver;
  const turnTop=document.getElementById('ksm-turn-status-top');
  if(turnTop)turnTop.textContent=state.introActive?'GÖKDELEN • Açılış hazırlanıyor…':(state.multiplayer?(state.turn+1)+'. oyuncunun sırası.':(state.turn===1?aiName()+' düşünüyor…':'1. oyuncunun sırası.'));
  const t1=document.getElementById('ksm-timer-p1'),t2=document.getElementById('ksm-timer-p2');
  const a1=t1?.querySelector('strong'),a2=t2?.querySelector('strong');
  if(a1)a1.textContent=String(state.turn===0?state.turnLeft:30);
  if(a2)a2.textContent=String(state.turn===1?state.turnLeft:30);
  t1?.classList.toggle('active',state.turn===0);t2?.classList.toggle('active',state.turn===1);
  t1?.classList.toggle('danger',state.turn===0&&state.turnLeft<=5);t2?.classList.toggle('danger',state.turn===1&&state.turnLeft<=5);
}
function renderCell(r,c,isNew=false){
  const el=cells[r*COLS+c];if(!el)return;
  const base=state.grid[r][c],t=tempAt(r,c),ch=t?t.char:base,flower=state.flowers.has(key(r,c));
  const entryWall=r>=ROWS-4&&(c<3||c>=6);
  el.className='ksm-cell'+(ch?' filled':'')+(base?' stackable':'')+(state.seedKeys.has(key(r,c))?' seed-cell':'')+(flower?' flower-cell':'')+(entryWall?' entry-wall':'')+(t?' ksm-temp':'')+(t?.tower?' ksm-temp-tower':'')+(isNew?' new-cell':'');
  el.setAttribute('role','button');el.tabIndex=ch?0:-1;el.setAttribute('aria-label',ch?ch+' — sözcüğün anlamı':'Boş kare');
  el.textContent='';
  if(ch){const sp=document.createElement('span');const motion=document.createElement('span');motion.className='ksm-letter';motion.textContent=ch;sp.appendChild(motion);const sm=document.createElement('small');sm.textContent=String(TILE_SCORE_CACHE[ch]||1);el.append(sp,sm);}
  if(flower){const mark=document.createElement('span');mark.className='ksm-flower-mark';mark.textContent=state.flowerIcons.get(key(r,c))||'🌸';mark.setAttribute('aria-label','3 kat puan');el.appendChild(mark);}
}
function animateTile(r,c,from=null){
  const el=cells[r*COLS+c]?.querySelector('.ksm-letter');
  if(!el||typeof el.animate!=='function'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const rect=el.getBoundingClientRect();
  const dx=from?from.x-(rect.left+rect.width/2):0,dy=from?from.y-(rect.top+rect.height/2):-18;
  el.animate([
    {transform:`translate(${dx}px,${dy}px) scale(.96)`,opacity:.55},
    {offset:.70,transform:'translate(0,-1px) scale(.995)',opacity:.95},
    {transform:'translate(0,0) scale(1)',opacity:1}
  ],{duration:850,easing:'cubic-bezier(.25,.65,.28,1)'});
}
function showCellMeaning(r,c){
  if(state.introActive||state.drag||Date.now()<state.meaningBlockedUntil||tempAt(r,c)||!state.grid[r][c])return;
  const words=[...new Set([[0,1],[1,0]].map(([dr,dc])=>lineThroughOverlay(new Map(),r,c,dr,dc).map(x=>x.char).join('')).filter(w=>w.length>=2&&state.used.has(w)))];
  if(!words.length)return;
  if(words.length===1){openFoundWordMeaning(words[0]);return;}
  const modal=document.getElementById('modal-found-meaning'),host=document.getElementById('found-meaning-content'),title=document.getElementById('found-meaning-word');
  if(!modal||!host||!title)return;
  closeDictionaryMeaning();title.textContent='Sözcük seç';host.textContent='';host.classList.remove('hidden');
  for(const word of words){const b=document.createElement('button');b.type='button';b.className='ksm-meaning-choice';b.textContent=word;b.onclick=()=>openFoundWordMeaning(word);host.appendChild(b);}
  modal.classList.remove('hidden');
}
function renderAll(){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)renderCell(r,c,false);}
function refreshPlacementPreview(){
  const result=myTurn()&&state.temp.size?validate():null;
  for(const el of cells){
    const pending=!!tempAt(Number(el.dataset.r),Number(el.dataset.c));
    el.classList.toggle('ksm-preview-valid',pending&&!!result&&!result.error);
    el.classList.toggle('ksm-preview-invalid',pending&&!!result&&!!result.error);
  }
  if(result){
    if(result.error)setFeedback(result.error,'bad');
    else setFeedback(result.words.map(w=>w.word).join(' • ')+' • +'+result.totalScore+' puan'+(result.climbBonus?' • YÜKSELİŞ +'+result.climbBonus:'')+(result.roofBonus?' • ÇATI +'+result.roofBonus:'')+' — GÖNDER ile onayla.','good');
  }else if(myTurn()&&!state.gameOver)setFeedback(openingPlacementFree()?'İlk hamle serbest: sözcüğünü istediğin uygun yere kur.':'Harfleri yerleştir; GÖNDER’e kadar düzenleyebilirsin.');
  return result;
}
function renderRack(){
  rackP1El.textContent='';
  state.racks[state.mySide].forEach((letter,index)=>{
    const b=document.createElement('button');b.type='button';b.className='ksm-rack-tile'+(rackIndexUsed(index)?' used':'');
    const sp=document.createElement('span');sp.textContent=letter;
    const sm=document.createElement('small');sm.textContent=String(TILE_SCORE_CACHE[letter]||1);
    b.append(sp,sm);b.addEventListener('pointerdown',e=>startDrag(e,index),{passive:false});rackP1El.appendChild(b);
  });
  const row=document.querySelector('.ksm-rack-row.p1');
  row?.classList.toggle('active',myTurn());
  row?.classList.toggle('inactive',!myTurn());
  updateHud();refreshPlacementPreview();
}
function buildBoard(){
  boardEl.textContent='';cells.length=0;const frag=document.createDocumentFragment();
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const el=document.createElement('div');el.className='ksm-cell';el.dataset.r=r;el.dataset.c=c;el.addEventListener('pointerdown',e=>{if(tempAt(r,c))startTempDrag(e,r,c);},{passive:false});el.addEventListener('dblclick',e=>{if(tempAt(r,c)){e.preventDefault();returnTempTile(key(r,c));}});el.addEventListener('click',()=>showCellMeaning(r,c));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showCellMeaning(r,c);}});frag.appendChild(el);cells.push(el);}
  boardEl.appendChild(frag);
  const door=document.createElement('div');door.id='ksm-building-door';door.setAttribute('aria-label','Gökdelen giriş kapısı');
  const crown=document.createElement('div');crown.className='ksm-door-crown';crown.setAttribute('aria-hidden','true');
  const panels=document.createElement('div');panels.className='ksm-door-panels';panels.setAttribute('aria-hidden','true');
  for(let i=0;i<4;i++)panels.appendChild(document.createElement('span'));
  const sill=document.createElement('div');sill.className='ksm-door-sill';sill.setAttribute('aria-hidden','true');
  door.append(crown,panels,sill);boardEl.appendChild(door);
  const pediment=document.createElement('div');pediment.id='ksm-door-pediment';pediment.setAttribute('aria-hidden','true');boardEl.appendChild(pediment);
  const markers=document.createElement('div');markers.id='ksm-floor-markers';markers.setAttribute('aria-hidden','true');
  for(const floor of [5,10,15,20,25,30]){
    const mark=document.createElement('span');mark.className='ksm-floor-marker';mark.style.setProperty('--floor-row',String(GOKDELEN_BASE_ROW-floor));mark.textContent=floor+'. KAT';markers.appendChild(mark);
  }
  const roof=document.createElement('span');roof.className='ksm-floor-marker roof';roof.style.setProperty('--floor-row','0');roof.textContent='ÇATI';markers.appendChild(roof);
  boardEl.appendChild(markers);
}
let previousSeed='';
function chooseSeed(){
  const common=SEEDS.filter(w=>GAME_WORD_SET.has(w)&&w.length===7);
  const valid=common.length?common:[...GAME_WORD_SET].filter(w=>w.length===7);
  const pool=valid.filter(w=>w!==previousSeed);
  const choices=pool.length?pool:valid;
  if(!choices.length)throw new Error('seven-letter-seed-missing');
  previousSeed=choices[Math.floor(Math.random()*choices.length)];return previousSeed;
}
function placeSeedLetter(word,index,animate=false){
  const r=GOKDELEN_SEED_ROW,c=Math.floor((COLS-word.length)/2)+index;
  state.grid[r][c]=word[index];state.dirs[r][c]|=H;state.seedKeys.add(key(r,c));renderCell(r,c,animate);
  if(animate)animateTile(r,c);
}
function hideQuickGuide(){
  const guide=document.getElementById('ksm-quick-guide');
  const ok=document.getElementById('btn-ksm-quick-guide-ok');
  guide?.classList.add('hidden');
  if(ok)ok.onclick=null;
}
function cancelIntro(){
  state.introToken++;state.introActive=false;
  if(state.introCamera){state.introCamera.cancel();state.introCamera=null;}
  if(state.introFrame!==null){cancelAnimationFrame(state.introFrame);state.introFrame=null;}
  for(const timer of state.introTimers)clearTimeout(timer);state.introTimers.clear();
  hideQuickGuide();
  screen.classList.remove('ksm-intro');
  clearTimeout(state.popTimer);state.popTimer=null;
  document.getElementById('ksm-pop')?.classList.remove('show','ksm-bonus-pop','ksm-flower-pop');
  const title=document.getElementById('ksm-intro-title');title?.classList.remove('show','fading');
}
function introLater(fn,ms,token){
  const timer=setTimeout(()=>{state.introTimers.delete(timer);if(state.introActive&&token===state.introToken&&!screen.classList.contains('hidden'))fn();},ms);
  state.introTimers.add(timer);
}
function showQuickGuide(next,token){
  const guide=document.getElementById('ksm-quick-guide');
  const ok=document.getElementById('btn-ksm-quick-guide-ok');
  if(!guide||!ok){next();return;}
  let done=false;
  ok.onclick=()=>{
    if(done)return;done=true;
    hideQuickGuide();
    if(state.introActive&&token===state.introToken&&!screen.classList.contains('hidden'))next();
  };
  guide.classList.remove('hidden');
}
function playIntro(seed){
  state.introActive=true;const token=state.introToken;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const title=document.getElementById('ksm-intro-title');
  hideQuickGuide();
  screen.classList.add('ksm-intro');if(title){void title.offsetWidth;title.classList.add('show');}
  wrap.scrollTop=0;wrap.scrollLeft=Math.max(0,(boardEl.scrollWidth-wrap.clientWidth)/2);updateHud();
  const finish=()=>{
    if(!state.used.has(seed))state.words.push(seed);state.used.add(seed);
    state.introActive=false;screen.classList.remove('ksm-intro');title?.classList.remove('show','fading');hideQuickGuide();
    renderRack();
    if(state.multiplayer){
      setFeedback('Hazırsın. Rakibin hazırlanması bekleniyor…','good');
      window.gokdelenNetwork?.introReady?.();
    }else{
      setFeedback('Başlangıç sözcüğü: '+seed+'. 1. oyuncu başlıyor.','good');
      startTurnTimer();
    }
  };
  const placeSeed=()=>{
    setFeedback('Başlangıç sözcüğü yerleştiriliyor…');
    let index=0;
    const next=()=>{
      placeSeedLetter(seed,index,!reduced);index++;
      introLater(index<seed.length?next:finish,index<seed.length?(reduced?70:420):(reduced?100:1200),token);
    };
    next();
  };
  const reveal=()=>{
    title?.classList.add('fading');
    wrap.scrollTop=Math.max(0,wrap.scrollHeight-wrap.clientHeight);
    if(state.introCamera){state.introCamera.cancel();state.introCamera=null;}
    setFeedback('GÖKDELEN • Kısaca nasıl oynanır?');
    showQuickGuide(placeSeed,token);
  };
  const descend=()=>{
    const content=document.getElementById('ksm-building-content');
    if(content&&typeof content.animate==='function'){
      const distance=Math.max(0,wrap.scrollHeight-wrap.clientHeight);
      const camera=content.animate([{transform:'translate3d(0,0,0)'},{transform:`translate3d(0,${-distance}px,0)`}],{duration:5000,easing:'cubic-bezier(.45,0,.55,1)',fill:'forwards'});
      state.introCamera=camera;
      camera.onfinish=()=>{if(state.introActive&&token===state.introToken)introLater(reveal,250,token);};
      return;
    }
    let lastFrame=null,elapsed=0;
    const step=now=>{
      if(!state.introActive||token!==state.introToken||screen.classList.contains('hidden'))return;
      if(lastFrame!==null)elapsed+=Math.min(50,Math.max(0,now-lastFrame));
      lastFrame=now;
      const progress=Math.min(1,elapsed/5000);
      const eased=progress*progress*progress*(progress*(progress*6-15)+10);
      wrap.scrollTop=Math.max(0,wrap.scrollHeight-wrap.clientHeight)*eased;
      if(progress<1)state.introFrame=requestAnimationFrame(step);
      else{state.introFrame=null;introLater(reveal,250,token);}
    };
    state.introFrame=requestAnimationFrame(step);
  };
  introLater(descend,0,token);
}

function startDrag(e,index){
  if(state.introActive||state.gameOver||!myTurn()||rackIndexUsed(index))return;e.preventDefault();e.stopPropagation();lastTempTap=null;
  state.drag={source:'rack',index,letter:state.racks[state.turn][index],pointerId:e.pointerId};ghost.textContent=state.drag.letter;ghost.style.display='flex';moveGhost(e.clientX,e.clientY);
}
let lastTempTap=null;
const returnFlights=new Set();
function clearReturnFlights(){for(const flight of returnFlights)flight.remove();returnFlights.clear();lastTempTap=null;}
function animateReturn(letter,rackIndex,from){
  const target=rackP1El.children[rackIndex];if(!target||!from)return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const rect=target.getBoundingClientRect(),dx=rect.left+rect.width/2-from.x,dy=rect.top+rect.height/2-from.y;
  const fly=document.createElement('div');fly.className='ksm-return-flight';fly.textContent=letter;fly.style.left=from.x+'px';fly.style.top=from.y+'px';document.body.appendChild(fly);returnFlights.add(fly);
  if(typeof fly.animate==='function')fly.animate([
    {transform:'translate(-50%,-50%) scale(1)',opacity:1},
    {offset:.45,transform:`translate(calc(-50% + ${dx*.35}px),calc(-50% + ${dy*.32-18}px)) scale(.98)`,opacity:1},
    {transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.92)`,opacity:.25}
  ],{duration:560,easing:'cubic-bezier(.22,.65,.25,1)',fill:'forwards'});
  if(typeof target.animate==='function')target.animate([{opacity:0},{offset:.8,opacity:0},{opacity:1}],{duration:560,easing:'ease-out'});
  setTimeout(()=>{fly.remove();returnFlights.delete(fly);},600);
}
function returnTempTile(k,fromItem=null,fromPoint=null){
  if(state.introActive||state.gameOver||!myTurn())return;
  const item=state.temp.get(k)||fromItem;if(!item)return;
  const rect=cells[item.r*COLS+item.c].getBoundingClientRect();
  const origin=fromPoint||{x:rect.left+rect.width/2,y:rect.top+rect.height/2};
  state.temp.delete(k);state.tempOrder=state.tempOrder.filter(x=>x!==k);state.meaningBlockedUntil=Date.now()+600;lastTempTap=null;
  clearInvalidFeedback();renderCell(item.r,item.c);renderRack();animateReturn(item.char,item.rackIndex,origin);
}
function undoLastTile(){
  if(state.introActive||state.drag||!myTurn()||state.gameOver)return;
  const k=[...state.tempOrder].reverse().find(k=>state.temp.has(k));if(k)returnTempTile(k);
}
function startTempDrag(e,r,c){
  if(state.introActive||state.gameOver||!myTurn())return;
  const t=tempAt(r,c);if(!t)return;
  e.preventDefault();e.stopPropagation();
  const now=Date.now();
  if(lastTempTap&&lastTempTap.k===key(r,c)&&now-lastTempTap.at<350&&Math.hypot(e.clientX-lastTempTap.x,e.clientY-lastTempTap.y)<14){returnTempTile(key(r,c));return;}
  lastTempTap={k:key(r,c),at:now,x:e.clientX,y:e.clientY};
  const fromKey=key(r,c),from={...t};
  state.temp.delete(fromKey);
  state.drag={source:'temp',index:t.rackIndex,letter:t.char,pointerId:e.pointerId,fromKey,from};
  renderCell(r,c,false);refreshPlacementPreview();
  ghost.textContent=t.char;ghost.style.display='flex';moveGhost(e.clientX,e.clientY);
}
function moveGhost(x,y){ghost.style.left=x+'px';ghost.style.top=y+'px';}
function dropAt(x,y){
  const drag=state.drag;if(!drag)return;
  const target=document.elementFromPoint(x,y);
  if(target&&(target===rackP1El||rackP1El.contains(target))){
    if(drag.source==='temp'){
      returnTempTile(drag.fromKey,drag.from,{x,y});
      if(!state.temp.size)setFeedback('Taş ıstakaya döndü. GÖNDER’e kadar düzenleyebilirsin.');
    }
    return;
  }
  const el=target?.closest?.('.ksm-cell');
  if(!el||!boardEl.contains(el)){
    if(drag.source==='temp'&&drag.from){state.temp.set(drag.fromKey,drag.from);renderCell(drag.from.r,drag.from.c,false);refreshPlacementPreview();}
    setFeedback('Taşı tahta üzerine bırak.','bad');return;
  }
  const r=Number(el.dataset.r),c=Number(el.dataset.c),destKey=key(r,c),base=state.grid[r][c];
  if(drag.source==='temp'&&drag.fromKey===destKey){
    if(drag.from){state.temp.set(drag.fromKey,drag.from);renderCell(drag.from.r,drag.from.c,false);renderRack();}
    return;
  }
  const doorRowsStart=ROWS-4,doorColStart=Math.floor((COLS-3)/2);
  const invalidDoor=r>=doorRowsStart&&c>=doorColStart&&c<doorColStart+3;
  const occupiedRows=[];for(let rr=0;rr<ROWS;rr++)if(state.grid[rr].some(Boolean))occupiedRows.push(rr);
  const lowestOccupied=occupiedRows.length?Math.max(...occupiedRows):ROWS-1;
  const invalidUp=!openingPlacementFree()&&r>lowestOccupied;
  const occupiedTemp=tempAt(r,c);
  const invalidSame=base===drag.letter;
  if(invalidDoor||invalidUp||occupiedTemp||invalidSame){
    if(drag.source==='temp'&&drag.from){state.temp.set(drag.fromKey,drag.from);renderCell(drag.from.r,drag.from.c,false);refreshPlacementPreview();}
    if(invalidDoor)setFeedback('Giriş kapısına harf yerleştirilemez.','bad');
    else if(invalidUp)setFeedback('GÖKDELEN yalnızca yukarı doğru büyür.','bad');
    else if(occupiedTemp)setFeedback('Bu karede zaten geçici taş var.','bad');
    else setFeedback('Aynı harfi üst üste koymaya gerek yok.','bad');
    return;
  }
  if(drag.source==='temp'&&drag.from){
    state.temp.delete(drag.fromKey);
    const oi=state.tempOrder.indexOf(drag.fromKey);if(oi>=0)state.tempOrder.splice(oi,1);
    renderCell(drag.from.r,drag.from.c,false);
  }
  lastTempTap=null;
  const item={r,c,char:drag.letter,rackIndex:drag.index,tower:!!base,under:base||''};
  state.temp.set(destKey,item);state.tempOrder.push(destKey);renderCell(r,c,false);renderRack();animateTile(r,c,{x,y});

}
function clearTemp(){lastTempTap=null;state.drag=null;ghost.style.display='none';const all=[...state.temp.values()];state.temp.clear();state.tempOrder.length=0;for(const t of all)renderCell(t.r,t.c,false);renderRack();}

function lineThrough(r,c,dr,dc){
  let sr=r,sc=c;
  while(sr-dr>=0&&sc-dc>=0&&sr-dr<ROWS&&sc-dc<COLS&&charAt(sr-dr,sc-dc)){sr-=dr;sc-=dc;}
  const out=[];let rr=sr,cc=sc;
  while(rr>=0&&cc>=0&&rr<ROWS&&cc<COLS&&charAt(rr,cc)){out.push({r:rr,c:cc,char:charAt(rr,cc)});rr+=dr;cc+=dc;}
  return out;
}
function overlayChar(overlay,r,c){
  const t=overlay.get(key(r,c));
  return t?t.char:(state.grid[r]?.[c]||'');
}
function lineThroughOverlay(overlay,r,c,dr,dc){
  let sr=r,sc=c;
  while(sr-dr>=0&&sc-dc>=0&&sr-dr<ROWS&&sc-dc<COLS&&overlayChar(overlay,sr-dr,sc-dc)){sr-=dr;sc-=dc;}
  const out=[];let rr=sr,cc=sc;
  while(rr>=0&&cc>=0&&rr<ROWS&&cc<COLS&&overlayChar(overlay,rr,cc)){
    out.push({r:rr,c:cc,char:overlayChar(overlay,rr,cc)});rr+=dr;cc+=dc;
  }
  return out;
}
function evaluateWordLine(line,name,bit){
  if(line.length<2)return null;
  if(line.length>9)return{error:'Sözcük en fazla 9 harf olabilir.',invalidWord:line.map(x=>x.char).join(''),invalidLine:line};
  const word=line.map(x=>x.char).join('');
  if(!GAME_WORD_SET.has(word)||isArgoWord(word)||isForeignWord(word))return{error:'Geçersiz yan veya ana sözcük: '+word,invalidWord:word,invalidLine:line};
    const baseScore=wordScore(word);
  return{word,line,name,bit,baseScore,score:baseScore,flowerBonus:false};
}
function evaluatePlacement(overlay){
  const temps=[...overlay.values()];
  if(!temps.length)return{error:'Istakadan en az bir taş yerleştir.'};
  const sameRow=temps.every(t=>t.r===temps[0].r),sameCol=temps.every(t=>t.c===temps[0].c);
  if(!sameRow&&!sameCol)return{error:'Yeni harfleri tek bir yatay veya dikey hatta yerleştir.'};
  const axis=temps.length>1?(sameRow?H:V):0;
  if(axis){
    const ordered=temps.map(t=>axis===H?t.c:t.r).sort((a,b)=>a-b);
    for(let i=ordered[0];i<=ordered[ordered.length-1];i++){
      const r=axis===H?temps[0].r:i,c=axis===H?i:temps[0].c;
      if(!overlayChar(overlay,r,c))return{error:'Ana sözcüğün harfleri arasında boşluk bırakılamaz.'};
    }
  }
  const rackIds=new Set(temps.map(t=>t.rackIndex));
  if(rackIds.size!==temps.length)return{error:'Aynı taş iki karede kullanılamaz.'};
  let topRow=ROWS,lowest=-1;
  for(let r=0;r<ROWS;r++)if(state.grid[r].some(Boolean)){if(topRow===ROWS)topRow=r;lowest=r;}
  const openingFree=openingPlacementFree();
  for(const t of temps){
    if(t.r<0||t.r>=ROWS||t.c<0||t.c>=COLS)return{error:'Taş oyun alanının dışında.'};
    if(!openingFree&&t.r>lowest)return{error:'GÖKDELEN yalnızca yukarı doğru büyür.'};
    if(t.r>=ROWS-4&&t.c>=3&&t.c<6)return{error:'Giriş kapısına harf yerleştirilemez.'};
  }
  // Açılış hamlesi serbesttir; ilk geçerli hamleden sonra yeni taşlar mevcut gökdelene bağlanır.
  if(!openingFree){
    const reachable=new Set(),queue=[];
    for(const t of temps)if(state.grid[t.r][t.c]||[[0,1],[0,-1],[1,0],[-1,0]].some(([dr,dc])=>state.grid[t.r+dr]?.[t.c+dc])){reachable.add(key(t.r,t.c));queue.push(t);}
    for(let i=0;i<queue.length;i++){
      const {r,c}=queue[i];
      for(const [dr,dc] of [[0,1],[0,-1],[1,0],[-1,0]]){
        const k=key(r+dr,c+dc);if(reachable.has(k)||!overlay.has(k))continue;
        reachable.add(k);queue.push(overlay.get(k));
      }
    }
    if(temps.some(t=>!reachable.has(key(t.r,t.c))))return{error:'Tüm yeni taşlar bir sözcükle mevcut gökdelene bağlanmalı.'};
  }
  const words=[],seen=new Set(),covered=new Set();
  for(const t of temps)for(const [dr,dc,name,bit] of [[0,1,'h',H],[1,0,'v',V]]){
    const line=lineThroughOverlay(overlay,t.r,t.c,dr,dc);if(line.length<2)continue;
    const first=line[0],last=line[line.length-1],sig=name+'|'+first.r+','+first.c+'|'+last.r+','+last.c;
    if(seen.has(sig))continue;seen.add(sig);
    const result=evaluateWordLine(line,name,bit);if(result?.error)return result;
    // Existing, unchanged occurrences do not earn points again.
    const oldLine=lineThroughOverlay(new Map(),t.r,t.c,dr,dc);
    const unchanged=oldLine.length===line.length&&oldLine.every((x,i)=>x.r===line[i].r&&x.c===line[i].c&&x.char===line[i].char);
    if(unchanged)continue;
    words.push(result);for(const x of line)if(overlay.has(key(x.r,x.c)))covered.add(key(x.r,x.c));
  }
  if(temps.some(t=>!covered.has(key(t.r,t.c))))return{error:'Her yeni taş en az iki harfli geçerli bir sözcüğün içinde olmalı.'};
  if(!words.length)return{error:'En az iki harfli anlamlı bir sözcük oluştur.'};
  const placedCount=rackIds.size,rackBonus=placedCount>=5;
  const mainWords=axis?words.filter(w=>w.bit===axis):words;
  if(!mainWords.length)return{error:'Yeni harfler aynı ana sözcüğü oluşturmalı.'};
  mainWords.sort((a,b)=>b.baseScore-a.baseScore||b.line.length-a.line.length);
  const main=mainWords[0];
  if(temps.some(t=>!main.line.some(x=>x.r===t.r&&x.c===t.c)))return{error:'Yeni harfler tek bir ana sözcükte birleşmeli.'};
  // v656 — Scrabble tipi tüm sözcük puanlarına gerçek kat yükseliş bonusunu ekle.
  for(const w of words)w.score=w.baseScore;
  if(rackBonus)main.score*=2;
  const climbTiles=temps.filter(t=>!state.grid[t.r]?.[t.c]&&t.r<topRow).map(t=>({r:t.r,c:t.c}));
  const climbCount=climbTiles.length;
  const climbBonus=climbCount*5;
  const roofReached=state.roofWinner<0&&temps.some(t=>!state.grid[t.r]?.[t.c]&&t.r===0);
  const roofBonus=roofReached?GOKDELEN_ROOF_BONUS:0;
  const totalScore=words.reduce((sum,w)=>sum+w.score,0)+climbBonus+roofBonus;
  return{...main,words,totalScore,rackBonus,placedCount,climbCount,climbTiles,climbBonus,roofBonus,flowerBonus:false};
}
function validate(){return evaluatePlacement(state.temp);}
function clearAiTimer(){if(state.aiTimer){clearTimeout(state.aiTimer);state.aiTimer=null;}}
function aiBoardPositions(){
  const map=new Map();
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const ch=state.grid[r][c];if(!ch)continue;
    if(!map.has(ch))map.set(ch,[]);
    map.get(ch).push({r,c});
  }
  return map;
}
function aiRackIndicesFor(chars){
  const rack=state.racks[1],used=new Set(),out=[];
  for(const ch of chars){
    let idx=-1;
    for(let i=0;i<rack.length;i++)if(!used.has(i)&&rack[i]===ch){idx=i;break;}
    if(idx<0)return null;
    used.add(idx);out.push(idx);
  }
  return out;
}
function aiPlacement(word,sr,sc,dr,dc){
  const er=sr+dr*(word.length-1),ec=sc+dc*(word.length-1);
  if(sr<0||sc<0||er<0||ec<0||sr>=ROWS||er>=ROWS||sc>=COLS||ec>=COLS)return null;
  const br=sr-dr,bc=sc-dc,ar=er+dr,ac=ec+dc;
  if(br>=0&&bc>=0&&br<ROWS&&bc<COLS&&state.grid[br][bc])return null;
  if(ar>=0&&ac>=0&&ar<ROWS&&ac<COLS&&state.grid[ar][ac])return null;
  const need=[],cellsToPlace=[];
  for(let i=0;i<word.length;i++){
    const r=sr+dr*i,c=sc+dc*i,ch=word[i],base=state.grid[r][c];
    const doorRowsStart=ROWS-4,doorColStart=Math.floor((COLS-3)/2);
    if(r>=doorRowsStart&&c>=doorColStart&&c<doorColStart+3)return null;
    if(base){if(base!==ch)return null;}
    else{need.push(ch);cellsToPlace.push({r,c,char:ch});}
  }
  if(!need.length||need.length>state.racks[1].length)return null;
  const idxs=aiRackIndicesFor(need);if(!idxs)return null;
  const overlay=new Map();
  for(let i=0;i<cellsToPlace.length;i++){
    cellsToPlace[i].rackIndex=idxs[i];
    const t={...cellsToPlace[i],tower:false,under:''};
    overlay.set(key(t.r,t.c),t);
  }
  const evaluated=evaluatePlacement(overlay);
  if(evaluated.error)return null;
  return{
    word:evaluated.word,
    words:evaluated.words,
    score:evaluated.totalScore,
    flowerBonus:evaluated.flowerBonus,
    rackBonus:evaluated.rackBonus,
    placed:cellsToPlace
  };
}
function aiFindMove(){
  const positions=aiBoardPositions(),pool=[],seen=new Set(),frontier=[];
  const level=AI_LEVELS[state.aiLevel];
  // Keep only equally best moves, in the same order as the previous stable sort.
  const keepBest=move=>{
    if(move.words.some(w=>w.word.length>level.maxLen))return;
    pool.push(move);pool.sort((a,b)=>b.score-a.score||a.word.length-b.word.length);
    if(pool.length>32)pool.length=32;
  };
  let lowest=-1;for(let r=0;r<ROWS;r++)if(state.grid[r].some(Boolean))lowest=r;
  for(let r=0;r<=lowest;r++)for(let c=0;c<COLS;c++)if(!state.grid[r][c]&&[[0,1],[0,-1],[1,0],[-1,0]].some(([dr,dc])=>state.grid[r+dr]?.[c+dc]))frontier.push({r,c});
  for(const raw of GAME_WORD_SET){
    if(typeof raw==='string'&&raw.length>level.maxLen)continue;
    const word=String(raw||'').toLocaleUpperCase('tr-TR');
    if(word.length<2||word.length>level.maxLen||isArgoWord(word)||isForeignWord(word))continue;
    if(word.length<=state.racks[1].length&&aiRackIndicesFor(Array.from(word))){
      for(const p of frontier)for(let i=0;i<word.length;i++)for(const [dr,dc] of [[0,1],[1,0]]){
        const sr=p.r-dr*i,sc=p.c-dc*i,k=word+'@'+sr+','+sc+','+dr;
        if(seen.has(k))continue;seen.add(k);const move=aiPlacement(word,sr,sc,dr,dc);if(move)keepBest(move);
      }
    }
    for(let i=0;i<word.length;i++){
      const anchors=positions.get(word[i]);if(!anchors)continue;
      for(const p of anchors){
        for(const [dr,dc] of [[0,1],[1,0]]){
          const sr=p.r-dr*i,sc=p.c-dc*i,key0=word+'@'+sr+','+sc+','+dr;
          if(seen.has(key0))continue;seen.add(key0);
          const cand=aiPlacement(word,sr,sc,dr,dc);
          if(cand)keepBest(cand);
        }
      }
    }
  }
  // A single replacement tile can form valid tower words in both directions.
  const unique=new Set();state.racks[1].forEach((char,rackIndex)=>{
    if(unique.has(char))return;unique.add(char);
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(state.grid[r][c]&&state.grid[r][c]!==char){
      const placed={r,c,char,rackIndex,tower:true,under:state.grid[r][c]};
      const result=evaluatePlacement(new Map([[key(r,c),placed]]));
      if(!result.error)keepBest({word:result.word,words:result.words,score:result.totalScore,flowerBonus:result.flowerBonus,rackBonus:result.rackBonus,placed:[placed]});
    }
  });
  if(!pool.length)return null;
  const count=Math.random()<level.focus?Math.min(level.top,pool.length):pool.length;
  return pool[Math.floor(Math.random()*count)];
}
function aiPassTurn(text='HAMLE BULAMADI'){
  clearAiTimer();clearTemp();state.turn=0;renderRack();updateHud();
  showPop(aiName(),text,800);setFeedback('1. oyuncunun sırası.','good');startTurnTimer();
}
function aiTakeTurn(){
  clearAiTimer();
  if(state.gameOver||state.turn!==1||screen.classList.contains('hidden'))return;
  const move=aiFindMove();
  if(!move){
    if(state.broomUsed[1]<2&&state.bag.length){
      broom();
      state.aiTimer=setTimeout(aiTakeTurn,650);
      return;
    }
    aiPassTurn();
    return;
  }
  state.temp.clear();state.tempOrder.length=0;
  setFeedback(aiName()+' sözcüğünü yerleştiriyor…','');
  let index=0;
  const placeNext=()=>{
    if(state.turn!==1||state.gameOver||screen.classList.contains('hidden'))return;
    const t=move.placed[index++],k=key(t.r,t.c);
    state.temp.set(k,{...t,tower:!!t.tower,under:t.under||''});state.tempOrder.push(k);
    renderCell(t.r,t.c);animateTile(t.r,t.c);
    state.aiTimer=setTimeout(index<move.placed.length?placeNext:()=>{if(state.turn===1&&!state.gameOver)commit();},index<move.placed.length?380:900);
  };
  const top=Math.min(...move.placed.map(t=>t.r));
  wrap.scrollTo({top:Math.max(0,boardEl.offsetTop+top*boardEl.clientHeight/ROWS-wrap.clientHeight*.35),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  state.aiTimer=setTimeout(placeNext,240);
}
function playGokdelenBell(){
  if(masterSoundVolume<=0)return;
  playTone(880,.11,.055,'sine',1320);
  playTone(1320,.10,.035,'sine',1760,.08);
}
function clearTurnTimer(){if(state.turnTimer){clearInterval(state.turnTimer);state.turnTimer=null;}state.lastHeartSec=null;state.lastBellSec=null;}
function startTurnTimer(){
  if(state.introActive)return;
  clearTurnTimer();clearAiTimer();state.turnLeft=30;updateHud();
  if(state.multiplayer){window.gokdelenNetwork?.startTurnClock();return;}
  if(state.turn===1&&!state.gameOver)state.aiTimer=setTimeout(aiTakeTurn,AI_LEVELS[state.aiLevel].delay);
  state.turnTimer=setInterval(()=>{
    if(state.gameOver||screen.classList.contains('hidden')){clearTurnTimer();return;}
    state.turnLeft=Math.max(0,state.turnLeft-1);
    if(state.turnLeft<=10&&state.turnLeft>5&&state.turnLeft!==state.lastHeartSec){state.lastHeartSec=state.turnLeft;playHeartbeat();}
    if(state.turnLeft<=5&&state.turnLeft>0&&state.turnLeft!==state.lastBellSec){state.lastBellSec=state.turnLeft;playGokdelenBell();}
    updateHud();
    if(state.turnLeft<=0){
      clearTurnTimer();clearAiTimer();
      clearTemp();
      state.turn=state.turn?0:1;
      renderRack();updateHud();
      showPop('SÜRE DOLDU','SIRA DEĞİŞTİ',850);
      setFeedback(state.turn===1?aiName()+' düşünüyor…':'1. oyuncunun sırası.','bad');
      startTurnTimer();
    }
  },1000);
}

let invalidTimer=null;
function clearInvalidFeedback(){
  clearTimeout(invalidTimer);invalidTimer=null;screen.classList.remove('ksm-invalid-shake');
  document.getElementById('ksm-invalid-word')?.remove();
}
function showInvalidFeedback(result={}){
  clearInvalidFeedback();
  const pending=[...state.temp.values()];if(!pending.length)return;
  const label=document.createElement('div');label.id='ksm-invalid-word';label.className='ksm-invalid-word';label.textContent=result.invalidWord?'GEÇERSİZ SÖZCÜK: '+result.invalidWord:'GEÇERSİZ HAMLE';label.setAttribute('role','status');
  const positions=(result.invalidLine||pending).map(t=>cells[t.r*COLS+t.c]);
  const x=positions.reduce((sum,el)=>sum+el.offsetLeft+el.offsetWidth/2,0)/positions.length;
  const y=Math.min(...positions.map(el=>el.offsetTop));
  label.style.left=Math.max(90,Math.min(boardEl.clientWidth-90,x))+'px';label.style.top=Math.max(2,y-24)+'px';
  boardEl.appendChild(label);void screen.offsetWidth;screen.classList.add('ksm-invalid-shake');
  invalidTimer=setTimeout(clearInvalidFeedback,2500);
}
function renderBirds(){
  document.getElementById('ksm-birds')?.remove();
  const layer=document.createElement('div');layer.id='ksm-birds';layer.setAttribute('aria-hidden','true');layer.style.setProperty('--bird-distance',(boardEl.clientWidth+80)+'px');
  for(let i=0;i<3;i++){
    const bird=document.createElement('span');bird.className='ksm-bird';bird.textContent='🐦';
    bird.style.top=(14+i*24+Math.random()*12)+'%';bird.style.setProperty('--bird-duration',(12+i*5)+'s');bird.style.setProperty('--bird-delay',(-Math.random()*20)+'s');
    layer.appendChild(bird);
  }
  boardEl.appendChild(layer);
}
function commit(){
  if(state.introActive||state.gameOver)return;
  if(state.multiplayer){if(myTurn())window.gokdelenNetwork.submit('move',[...state.temp.values()]);return;}
  const v=validate();if(v.error){setFeedback(v.error,'bad');showInvalidFeedback(v);return;}
  clearInvalidFeedback();
  const placed=[...state.temp.values()];
  for(const t of placed)state.grid[t.r][t.c]=t.char;
  for(const w of v.words)for(const x of w.line)state.dirs[x.r][x.c]|=w.bit;
  for(const w of v.words){state.used.add(w.word);state.words.push(w.word);}
  const moveSide=state.turn;
  state.scores[moveSide]+=v.totalScore;
  recordMoveStats(moveSide,v,placed);
  const rack=state.racks[state.turn];
  const used=[...new Set(placed.map(t=>t.rackIndex))].sort((a,b)=>b-a);
  for(const idx of used)rack.splice(idx,1);
  drawRackToNine(state.turn);
  state.temp.clear();state.tempOrder.length=0;
  // Committing changes only placed squares; preserve all other cell DOM and animations.
  for(const t of placed)renderCell(t.r,t.c,true);
  wrap.classList.remove('ksm-send-burst');void wrap.offsetWidth;wrap.classList.add('ksm-send-burst');setTimeout(()=>wrap.classList.remove('ksm-send-burst'),460);
  const scoredWords=v.words.map(w=>w.word+' +'+w.score).join(' • ');
  const climbText=v.climbBonus?' • YÜKSELİŞ +'+v.climbBonus:'';
  const roofText=v.roofBonus?' • ÇATI +'+v.roofBonus:'';
  const towerText=placed.some(t=>t.tower)?' • KULE HAMLESİ':'';
  if(v.rackBonus)showBonusPop('5+ HARF BONUSU!','TOPLAM +'+v.totalScore+' • '+scoredWords+climbText+roofText+towerText,false,1350);
  else showPop('+'+v.totalScore,scoredWords+climbText+roofText+towerText,1250);
  showMoveIdentityFx(v,placed,moveSide);maybeWarnFinalBag();
  const matchToken=state.introToken;
  state.turn=state.turn?0:1;renderRack();updateHud();
  setFeedback(state.turn===1?aiName()+' düşünüyor…':'1. oyuncunun sırası.','good');
  startTurnTimer();
  requestAnimationFrame(()=>{
    if(matchToken!==state.introToken||screen.classList.contains('hidden'))return;
    let top=ROWS-1;
    for(let rr=0;rr<ROWS;rr++){if(state.grid[rr].some(Boolean)){top=rr;break;}}
    wrap.scrollTo({top:Math.max(0,boardEl.offsetTop+top*boardEl.clientHeight/ROWS-wrap.clientHeight*.35),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  });
  checkEnd();
}
function broom(){
  if(state.multiplayer){if(myTurn()&&!state.temp.size)window.gokdelenNetwork.submit('broom');return;}
  if(state.introActive||state.gameOver||state.broomUsed[state.turn]>=2||state.temp.size)return;
  const rack=state.racks[state.turn];
  while(rack.length)state.bag.push(rack.pop());
  shuffle(state.bag);drawRackToNine(state.turn);state.broomUsed[state.turn]++;renderRack();updateHud();
  showPop('🧹 SÜPÜRGE','ISTAKA YENİLENDİ',850);
}
function shuffleRack(){
  if(state.multiplayer){if(myTurn()&&!state.temp.size)window.gokdelenNetwork.submit('shuffle');return;}
  if(state.introActive||state.gameOver||state.temp.size)return;
  shuffle(state.racks[state.turn]);renderRack();
  showPop('🔀 KARIŞTIR','ISTAKA KARIŞTIRILDI',650);
}
function checkEnd(){
  if(state.bag.length||state.racks[0].length||state.racks[1].length)return;
  state.gameOver=true;clearTurnTimer();clearAiTimer();updateHud();
  const a=state.scores[0],b=state.scores[1],title=document.getElementById('ksm-over-title'),txt=document.getElementById('ksm-over-text');
  if(title)title.textContent=a===b?'BERABERE!':(a>b?'1. OYUNCU KAZANDI!':'2. OYUNCU KAZANDI!');
  if(txt)txt.textContent='300 harf bitti • '+a+' - '+b;
  renderGameOverStats();
  document.getElementById('ksm-gameover')?.classList.remove('hidden');
}
function reset(){
  if(state.multiplayer){window.gokdelenNetwork.restart();return;}
  state.aiLevel=AI_LEVELS[botDiffLevel]?botDiffLevel:'easy';state.mySide=0;document.getElementById('btn-ksm-again')?.classList.remove('hidden');
  cancelIntro();clearTurnTimer();
  clearReturnFlights();document.getElementById('ksm-confetti-layer')?.remove();
  clearInvalidFeedback();
  clearTimeout(state.popTimer);state.grid=Array.from({length:ROWS},()=>Array(COLS).fill(''));state.dirs=Array.from({length:ROWS},()=>Array(COLS).fill(0));
  state.used.clear();state.seedKeys.clear();state.flowers.clear();state.words=[];state.scores=[0,0];state.turn=0;state.broomUsed=[0,0];state.highestFloors=[0,0];state.longestWords=['',''];state.wordCounts=[0,0];state.roofWinner=-1;state.lowBagWarned=false;clearGokdelenFx();state.temp.clear();state.tempOrder=[];state.drag=null;state.meaningBlockedUntil=0;ghost.style.display='none';state.gameOver=false;state.turnLeft=30;clearAiTimer();
  state.bag=makeBag();const seed=chooseSeed();consumeSeedFromBag(seed);state.flowerIcons.clear();state.racks=[[],[]];drawRackToNine(0);drawRackToNine(1);
  document.getElementById('ksm-gameover')?.classList.add('hidden');document.getElementById('ksm-rules')?.classList.add('hidden');
  renderAll();renderBirds();renderRack();setFeedback('GÖKDELEN • Açılış hazırlanıyor…');playIntro(seed);
}
function exit(){if(state.multiplayer){window.gokdelenNetwork.leave();return;}cancelIntro();clearReturnFlights();document.getElementById('ksm-confetti-layer')?.remove();clearInvalidFeedback();clearTimeout(state.popTimer);clearTurnTimer();clearAiTimer();state.drag=null;ghost.style.display='none';screen.classList.add('hidden');document.getElementById('ksm-rules')?.classList.add('hidden');document.getElementById('ksm-gameover')?.classList.add('hidden');document.getElementById('screen-home')?.classList.remove('hidden');}
async function open(){activeGameMode='single';state.multiplayer=false;state.mySide=0;document.body.dataset.gokdelenMenu='1';cancelIntro();const openingToken=state.introToken;document.getElementById('screen-home')?.classList.add('hidden');screen.classList.remove('hidden');setFeedback('GÖKDELEN hazırlanıyor…');try{await ensureWordDataLoaded();if(openingToken!==state.introToken||screen.classList.contains('hidden'))return;if(!cells.length)buildBoard();reset();}catch(err){console.error('Kesişim startup failed',err);showToast('GÖKDELEN hazırlanamadı.','rose');exit();}}

document.addEventListener('pointermove',e=>{if(!state.drag||e.pointerId!==state.drag.pointerId)return;e.preventDefault();if(lastTempTap&&Math.hypot(e.clientX-lastTempTap.x,e.clientY-lastTempTap.y)>8)lastTempTap=null;moveGhost(e.clientX,e.clientY);},{passive:false});
document.addEventListener('pointerup',e=>{if(!state.drag||e.pointerId!==state.drag.pointerId)return;e.preventDefault();state.meaningBlockedUntil=Date.now()+250;dropAt(e.clientX,e.clientY);state.drag=null;ghost.style.display='none';},{passive:false});
document.addEventListener('pointercancel',e=>{
  if(!state.drag||e.pointerId!==state.drag.pointerId)return;
  const drag=state.drag;
  if(drag.source==='temp'&&drag.from){state.temp.set(drag.fromKey,drag.from);renderCell(drag.from.r,drag.from.c,false);renderRack();}
  state.drag=null;ghost.style.display='none';
},{passive:true});
// The same pure rule engine is used locally and by both network clients.
const MATCH_FIELDS=['grid','dirs','used','seedKeys','words','scores','turn','bag','racks','broomUsed','highestFloors','longestWords','wordCounts','roofWinner','gameOver','multiplayer','mySide'];
function withMatch(data,fn){
  const saved=Object.fromEntries(MATCH_FIELDS.map(k=>[k,state[k]]));
  try{
    state.grid=Array.from({length:ROWS},(_,r)=>Array.from({length:COLS},(_,c)=>data.grid?.[r]?.[c]||''));
    state.dirs=Array.from({length:ROWS},(_,r)=>Array.from({length:COLS},(_,c)=>Number(data.dirs?.[r]?.[c]||0)));
    state.used=new Set(data.words||[]);state.seedKeys=new Set(data.seedKeys||[]);state.words=[...(data.words||[])];
    state.scores=[Number(data.scores?.[0]||0),Number(data.scores?.[1]||0)];state.turn=Number(data.turn||0);
    state.bag=[...(data.bag||[])];state.racks=[[...(data.racks?.[0]||[])],[...(data.racks?.[1]||[])]];
    state.broomUsed=[Number(data.broomUsed?.[0]||0),Number(data.broomUsed?.[1]||0)];
    state.highestFloors=[Number(data.highestFloors?.[0]||0),Number(data.highestFloors?.[1]||0)];
    state.longestWords=[String(data.longestWords?.[0]||''),String(data.longestWords?.[1]||'')];
    state.wordCounts=[Number(data.wordCounts?.[0]||0),Number(data.wordCounts?.[1]||0)];
    state.roofWinner=Number.isInteger(data.roofWinner)?data.roofWinner:-1;
    state.gameOver=!!data.gameOver;state.multiplayer=true;
    return fn();
  }finally{for(const k of MATCH_FIELDS)state[k]=saved[k];}
}
function serializeMatch(extra={}){
  return{grid:state.grid,dirs:state.dirs,words:[...state.used],seedKeys:[...state.seedKeys],scores:state.scores,turn:state.turn,bag:state.bag,racks:state.racks,broomUsed:state.broomUsed,highestFloors:state.highestFloors,longestWords:state.longestWords,wordCounts:state.wordCounts,roofWinner:state.roofWinner,gameOver:state.gameOver,...extra};
}
function makeNetworkMatch(){
  const seed=chooseSeed();
  return withMatch({},()=>{
    state.bag=makeBag();consumeSeedFromBag(seed);drawRackToNine(0);drawRackToNine(1);
    for(let i=0;i<seed.length;i++){const r=GOKDELEN_SEED_ROW,c=1+i;state.grid[r][c]=seed[i];state.dirs[r][c]=H;state.seedKeys.add(key(r,c));}
    state.used.add(seed);return serializeMatch({seed,revision:0,turnDeadline:0,passCount:0});
  });
}
function reduceNetworkMatch(data,side,action,placed,now,revision){
  if(!data||data.gameOver||Number(data.revision)!==revision)return null;
  if(action==='timeout'){
    if(!data.turnDeadline||now<Number(data.turnDeadline))return null;
  }else if(Number(data.turn)!==side||now>=Number(data.turnDeadline)||!data.turnDeadline)return null;
  return withMatch(data,()=>{
    let lastMove=null,passes=Number(data.passCount||0);
    if(action==='move'){
      if(!Array.isArray(placed)||!placed.length||placed.length>9)return null;
      const overlay=new Map();
      for(const t of placed){
        if(!Number.isInteger(t.r)||t.r<0||t.r>=ROWS||!Number.isInteger(t.c)||t.c<0||t.c>=COLS||!Number.isInteger(t.rackIndex)||t.rackIndex<0||t.rackIndex>=9||state.racks[side][t.rackIndex]!==t.char||overlay.has(key(t.r,t.c)))return null;
        const under=state.grid[t.r]?.[t.c];if(under===t.char)return null;
        overlay.set(key(t.r,t.c),{...t,tower:!!under,under:under||''});
      }
      const result=evaluatePlacement(overlay);if(result.error)return null;
      for(const t of overlay.values())state.grid[t.r][t.c]=t.char;
      for(const w of result.words){state.used.add(w.word);for(const t of w.line)state.dirs[t.r][t.c]|=w.bit;}
      state.scores[side]+=result.totalScore;
      recordMoveStats(side,result,[...overlay.values()]);
      [...overlay.values()].map(t=>t.rackIndex).sort((a,b)=>b-a).forEach(i=>state.racks[side].splice(i,1));
      drawRackToNine(side);passes=0;
      lastMove={side,placed:[...overlay.values()],word:result.word,words:result.words.map(w=>({word:w.word,score:w.score})),climbCount:result.climbCount,climbTiles:result.climbTiles,climbBonus:result.climbBonus,roofBonus:result.roofBonus,score:result.totalScore};
      state.turn=1-side;
    }else if(action==='broom'){
      if(state.broomUsed[side]>=2)return null;
      state.bag.push(...state.racks[side]);state.racks[side]=[];shuffle(state.bag);drawRackToNine(side);state.broomUsed[side]++;
    }else if(action==='shuffle')shuffle(state.racks[side]);
    else if(action==='timeout'){state.turn=1-state.turn;passes++;}
    else return null;
    state.gameOver=!state.bag.length&&!state.racks[0].length&&!state.racks[1].length;
    return serializeMatch({seed:data.seed,revision:revision+1,turnDeadline:action==='broom'||action==='shuffle'?Number(data.turnDeadline):now+30000,passCount:passes,lastMove});
  });
}
function applyNetworkMatch(data,round,intro=false){
  if(!intro&&state.introActive)cancelIntro();
  const old=state.grid,previousRevision=state.revision;
  clearTemp();clearAiTimer();clearTurnTimer();state.multiplayer=true;state.mySide=mpRole==='guest'?1:0;
  const restored=withMatch(data,()=>serializeMatch());
  state.grid=restored.grid;state.dirs=restored.dirs;state.used=new Set(restored.words);state.words=restored.words;state.seedKeys=new Set(restored.seedKeys);
  state.scores=restored.scores;state.turn=restored.turn;state.bag=restored.bag;state.racks=restored.racks;state.broomUsed=restored.broomUsed;
  state.highestFloors=restored.highestFloors;state.longestWords=restored.longestWords;state.wordCounts=restored.wordCounts;state.roofWinner=restored.roofWinner;state.gameOver=restored.gameOver;
  state.flowers.clear();state.flowerIcons.clear();state.revision=Number(data.revision||0);
  document.getElementById('ksm-gameover')?.classList.add('hidden');
  if(intro){
    cancelIntro();state.grid=Array.from({length:ROWS},()=>Array(COLS).fill(''));state.seedKeys.clear();renderAll();renderRack();playIntro(data.seed);return;
  }
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    if(previousRevision<0||old[r]?.[c]!==state.grid[r][c]){renderCell(r,c,previousRevision>=0);if(previousRevision>=0&&state.grid[r][c])animateTile(r,c);}
  }
  renderRack();
  if(data.lastMove&&previousRevision>=0&&previousRevision!==state.revision){
    const moveWords=Array.isArray(data.lastMove.words)&&data.lastMove.words.length?data.lastMove.words.map(w=>w.word+' +'+Number(w.score||0)).join(' • '):data.lastMove.word+' +'+data.lastMove.score;
    const climbText=Number(data.lastMove.climbBonus||0)>0?' • YÜKSELİŞ +'+Number(data.lastMove.climbBonus):'';
    const roofText=Number(data.lastMove.roofBonus||0)>0?' • ÇATI +'+Number(data.lastMove.roofBonus):'';
    const towerText=(data.lastMove.placed||[]).some(t=>t.tower)?' • KULE HAMLESİ':'';
    showPop('+'+data.lastMove.score,moveWords+climbText+roofText+towerText+' • '+(data.lastMove.side===state.mySide?'HAMLE ONAYLANDI':'RAKİBİN HAMLESİ'),1250);
    showMoveIdentityFx(data.lastMove,data.lastMove.placed||[],Number(data.lastMove.side));maybeWarnFinalBag();
    const top=Math.min(...(data.lastMove.placed||[]).map(t=>t.r));
    if(Number.isFinite(top))wrap.scrollTo({top:Math.max(0,boardEl.offsetTop+top*boardEl.clientHeight/ROWS-wrap.clientHeight*.35),behavior:'smooth'});
  }
  if(state.gameOver){
    const [a,b]=state.scores;document.getElementById('ksm-over-title').textContent=a===b?'BERABERE!':(a>b?'1. OYUNCU KAZANDI!':'2. OYUNCU KAZANDI!');
    document.getElementById('ksm-over-text').textContent='300 taş bitti • '+a+' - '+b;renderGameOverStats();document.getElementById('ksm-gameover')?.classList.remove('hidden');
  }
}
function enterNetworkScene(data){
  cancelIntro();clearReturnFlights();clearInvalidFeedback();clearTurnTimer();clearAiTimer();
  state.multiplayer=true;state.networkPlaying=false;state.mySide=mpRole==='guest'?1:0;state.revision=-1;state.networkBusy=false;state.lowBagWarned=false;clearGokdelenFx();
  if(!cells.length)buildBoard();
  document.body.dataset.gokdelenMenu='1';document.getElementById('screen-home')?.classList.add('hidden');screen.classList.remove('hidden');
  document.getElementById('screen-game')?.classList.add('hidden');document.getElementById('ksm-rules')?.classList.add('hidden');
  document.querySelector('.ksm-rack-row.p1')?.setAttribute('aria-label',(state.mySide+1)+'. oyuncunun 9 harflik ıstakası');
  applyNetworkMatch(data,0);wrap.scrollTop=Math.max(0,wrap.scrollHeight-wrap.clientHeight);
}
function networkTick(deadline,playing){
  state.networkPlaying=playing;
  state.turnLeft=Math.max(0,Math.min(30,Math.ceil((deadline-serverNow())/1000)));
  if(!state.introActive){updateHud();if(!state.gameOver)setFeedback(playing?(myTurn()?'Sıra sende. Harflerini tek hatta yerleştir.':'Rakibinin hamlesi bekleniyor…'):'Rakip bekleniyor…');}
}
function stopNetworkScene(){
  cancelIntro();clearReturnFlights();clearInvalidFeedback();clearTurnTimer();clearAiTimer();clearTemp();
  state.multiplayer=false;state.networkPlaying=false;state.mySide=0;state.networkBusy=false;state.revision=-1;screen.classList.add('hidden');document.getElementById('ksm-gameover')?.classList.add('hidden');
}
function networkBusy(busy){state.networkBusy=busy;updateHud();}
window.gokdelenEngine={makeMatch:makeNetworkMatch,reduce:reduceNetworkMatch,enter:enterNetworkScene,apply:applyNetworkMatch,tick:networkTick,stop:stopNetworkScene,busy:networkBusy,preview:validate};

window.openKapmacaKesisim=open;
document.getElementById('btn-ksm-exit')?.addEventListener('click',exit);
document.getElementById('btn-ksm-home-exit')?.addEventListener('click',exit);
document.getElementById('btn-ksm-again')?.addEventListener('click',reset);
document.getElementById('btn-ksm-new')?.addEventListener('click',reset);
document.getElementById('btn-ksm-broom')?.addEventListener('click',broom);
document.getElementById('btn-ksm-shuffle')?.addEventListener('click',shuffleRack);
document.getElementById('btn-ksm-place')?.addEventListener('click',commit);
document.getElementById('btn-ksm-undo')?.addEventListener('click',undoLastTile);
document.getElementById('btn-ksm-fullscreen')?.addEventListener('click',()=>toggleGameFullscreen());
document.getElementById('btn-ksm-exit-bottom')?.addEventListener('click',exit);
document.getElementById('btn-ksm-rules')?.addEventListener('click',()=>document.getElementById('ksm-rules')?.classList.remove('hidden'));
document.getElementById('btn-ksm-rules-top')?.addEventListener('click',()=>document.getElementById('ksm-rules')?.classList.remove('hidden'));
document.getElementById('btn-ksm-rule-close')?.addEventListener('click',()=>document.getElementById('ksm-rules')?.classList.add('hidden'));
})();

