// mnn-examples.js — Vocabulary -> Example Sentences -> Pattern
// Modular, generated at runtime (no bloat in mnn-data.js).
// Key: "lid-idx" (lid = lesson id, idx = 0-based vocab index, same as key() in index.html)
// Value: array of >=3 {jp, kana, mean, pat} where pat = grammar index in that lesson.
// Works in browser (window.MNN_EXAMPLES) and Node (module.exports) for validator.
(function(){
"use strict";
var ROOT = (typeof window!=="undefined")?window:(typeof globalThis!=="undefined"?globalThis:{});
var LESSONS_SRC = (typeof LESSON_DATA_FALLBACK!=="undefined")?LESSON_DATA_FALLBACK:(ROOT.LESSON_DATA_FALLBACK||[]);

// ---------- helpers ----------
function stripBrackets(s){ return String(s||"").replace(/\[[^\]]*\]/g,""); }
function cleanQ(s){ return String(s||"").replace(/[？?]/g,"").trim(); }
function meanCore(mean, keepCase){
  var m = String(mean||"").split("/")[0].split("(")[0].split("（")[0].trim();
  m = m.replace(/\[.*?\]/g,"").replace(/〜|~/g,"").trim();
  if(!m) m = String(mean||"").trim();
  if(keepCase) return m;
  if(!m) return m;
  // lowercase first letter for natural Indonesian embedding (unless all-caps/katakana-like)
  return m.charAt(0).toLowerCase()+m.slice(1);
}
function meanFull(mean){
  return String(mean||"").replace(/\[.*?\]/g,"").trim();
}
function jpBase(jp){ return cleanQ(stripBrackets(String(jp||"").replace(/〜|~/g,""))).trim(); }
function kanaBase(kana){ return cleanQ(stripBrackets(String(kana||"").replace(/〜|~/g,""))).trim(); }
function hasTilde(jp){ return /〜|~/.test(String(jp||"")); }
function fillTilde(jp,kana){
  var J=String(jp||""), K=String(kana||"");
  var repJ="田中", repK="たなか";
  if(/さん|ちゃん|くん/.test(J)){ repJ="ミラー"; repK="ミラー"; }
  else if(/人/.test(J)&&/じん/.test(K)){ repJ="日本"; repK="にほん"; }
  else if(/歳|さい/.test(J+K)){ repJ="18"; repK="じゅうはっ"; }
  else if(/時|じ/.test(J+K)&&/〜/.test(J)){ repJ="7"; repK="7"; }
  else if(/分|ふん|ぷん/.test(J+K)){ repJ="30"; repK="さんじゅっ"; }
  else if(/月|がつ/.test(J+K)){ repJ="3"; repK="さん"; }
  else if(/日|にち|か/.test(J+K)&&/〜/.test(J)){ repJ="5"; repK="いつ"; }
  else if(/階|かい|がい/.test(J+K)){ repJ="3"; repK="さん"; }
  else if(/円|えん/.test(J+K)){ repJ="500"; repK="ごひゃく"; }
  else if(/語|ご/.test(J+K)){ repJ="日本"; repK="にほん"; }
  else if(/台|だい|枚|まい|回|かい|人|にん/.test(J+K)){ repJ="2"; repK="に"; }
  else if(/メートル/.test(J+K)){ repJ="5"; repK="ご"; }
  else if(/ごろ/.test(J+K)){ repJ="3時"; repK="さんじ"; }
  return { jp: J.replace(/〜|~/g,repJ), kana: K.replace(/〜|~/g,repK) };
}
function isVerb(v){ return /ます$/.test(String(v[0]||""))||/ます$/.test(String(v[1]||"")); }
function isNaAdj(v){ return /\[な\]/.test(String(v[0]||""))||/\[な\]/.test(String(v[1]||"")); }
function isIAdj(v){
  if(isVerb(v)||isNaAdj(v)) return false;
  var k=kanaBase(v[1]||v[0]);
  if(/しい$|い$/.test(k) && !/ください|なさい/.test(k)) {
    // exclude obvious non-adjectives (nouns ending with い, phrases)
    var j=String(v[0]||"");
    if(/ます|です|か$|？|は$|人$|日$|時$|語$|曜日/.test(j)) return false;
    if(/^[あ-んア-ン〜〜]+$/.test(j)&&j.length<=2) return false;
    return true;
  }
  return false;
}
// Verb groups: 1=godan, 2=ichidan, 3=suru, K=kuru, 9=phrase (no conjugation)
var VERB_GROUP={
"2-38":1,"2-44":9,"2-45":9,"3-38":9,
"4-0":2,"4-1":2,"4-2":1,"4-3":1,"4-4":3,"4-5":1,
"5-0":1,"5-1":"K","5-2":1,
"6-0":2,"6-1":1,"6-2":1,"6-3":2,"6-4":1,"6-5":1,"6-6":1,"6-7":1,"6-8":1,"6-9":3,"6-10":1,
"7-0":1,"7-1":1,"7-2":2,"7-3":1,"7-4":1,"7-5":2,"7-6":2,"7-7":1,"7-8":2,
"9-0":1,"9-1":1,"10-0":2,"10-1":1,"11-0":2,"11-1":1,"11-2":1,
"13-0":1,"13-1":1,"13-2":2,"13-3":2,"13-4":1,"13-5":1,"13-6":2,"13-7":3,"13-8":3,"13-9":3,"13-10":3,"13-24":1,"13-25":1,
"14-0":2,"14-1":1,"14-2":2,"14-3":2,"14-4":1,"14-5":1,"14-6":1,"14-7":1,"14-8":1,"14-9":1,"14-10":1,"14-11":1,"14-12":2,"14-13":2,"14-14":2,"14-15":1,"14-16":1,"14-17":1,"14-18":2,"14-19":1,"14-20":3,
"15-0":1,"15-1":1,"15-2":1,"15-3":1,"15-4":1,"15-5":3,"15-18":1,
"16-0":1,"16-1":2,"16-2":2,"16-3":2,"16-4":2,"16-5":1,"16-6":1,"16-7":1,"16-8":1,"16-9":2,"16-10":3,"16-11":3,
"17-0":2,"17-1":2,"17-2":1,"17-3":1,"17-4":1,"17-5":2,"17-6":1,"17-7":1,"17-8":"K","17-9":3,"17-10":3,"17-11":3,
"18-0":2,"18-1":1,"18-2":1,"18-3":1,"18-4":2,"18-5":2,"18-6":2,"18-7":3,"18-8":3,
"19-0":1,"19-1":1,"19-2":3,"19-3":3,"19-4":3,"19-5":1,
"20-0":1,"20-1":2,"20-2":3,
"21-0":1,"21-1":1,"21-2":1,"21-3":2,"21-4":1,"21-5":1,"21-6":2,"21-7":2,"21-8":3,
"22-0":2,"22-1":1,"22-2":1,"22-3":2,"22-4":2,
"23-0":1,"23-1":1,"23-2":1,"23-3":2,"23-4":1,"23-5":2,"23-6":1,"23-7":1,"23-8":1,
"24-0":2,"24-1":1,"24-2":"K","24-3":1,"24-4":3,"24-5":3,"24-6":3,
"25-0":2,"25-1":1,"25-2":1,"25-3":2
};
function vGroup(lid,idx){ return VERB_GROUP[lid+"-"+idx]; }
function masuStem(s){ return String(s||"").replace(/ます$/,""); }
// te-form
function tePair(jp,kana,lid,idx){
  var g=vGroup(lid,idx);
  if(g===3){ return {jp:jp.replace(/します$/,"して").replace(/^します$/,"して"), kana:kana.replace(/します$/,"して").replace(/^します$/,"して")}; }
  if(g==="K"){ return {jp:jp.replace(/来ます$/,"来て").replace(/きます$/,"きて"), kana:kana.replace(/きます$/,"きて")}; }
  if(g===9||g==null){ return {jp:masuStem(jp)+"て", kana:masuStem(kana)+"て"}; }
  if(g===2){ return {jp:masuStem(jp)+"て", kana:masuStem(kana)+"て"}; }
  // godan — decide by kana ending
  var k=String(kana||"");
  function rep(str,rm,ad){ return str.slice(0,str.length-rm.length)+ad; }
  if(/いきます$/.test(k)){ return {jp:rep(jp,"きます","って"), kana:rep(kana,"きます","って")}; }
  if(/ぎます$/.test(k)){ return {jp:rep(jp,"ぎます","いで"), kana:rep(kana,"ぎます","いで")}; }
  if(/きます$/.test(k)){ return {jp:rep(jp,"きます","いて"), kana:rep(kana,"きます","いて")}; }
  if(/します$/.test(k)){ return {jp:rep(jp,"します","して"), kana:rep(kana,"します","して")}; }
  if(/ちます$/.test(k)){ return {jp:rep(jp,"ちます","って"), kana:rep(kana,"ちます","って")}; }
  if(/ります$/.test(k)){ return {jp:rep(jp,"ります","って"), kana:rep(kana,"ります","って")}; }
  if(/います$/.test(k)){ return {jp:rep(jp,"います","って"), kana:rep(kana,"います","って")}; }
  if(/みます$/.test(k)){ return {jp:rep(jp,"みます","んで"), kana:rep(kana,"みます","んで")}; }
  if(/びます$/.test(k)){ return {jp:rep(jp,"びます","んで"), kana:rep(kana,"びます","んで")}; }
  if(/にます$/.test(k)){ return {jp:rep(jp,"にます","んで"), kana:rep(kana,"にます","んで")}; }
  return {jp:masuStem(jp)+"って", kana:masuStem(kana)+"って"};
}
function taPair(jp,kana,lid,idx){
  var t=tePair(jp,kana,lid,idx);
  function cv(s){
    if(/で$/.test(s)) return s.replace(/で$/,"だ");
    if(/んで$/.test(s)) return s.replace(/んで$/,"んだ");
    if(/って$/.test(s)) return s.replace(/って$/,"った");
    if(/いて$/.test(s)) return s.replace(/いて$/,"いた");
    if(/いで$/.test(s)) return s.replace(/いで$/,"いだ");
    if(/して$/.test(s)) return s.replace(/して$/,"した");
    if(/て$/.test(s)) return s.replace(/て$/,"た");
    if(/きて$/.test(s)) return s.replace(/きて$/,"きた");
    if(/来て$/.test(s)) return s.replace(/来て$/,"来た");
    return s+"た";
  }
  return {jp:cv(t.jp), kana:cv(t.kana)};
}
function naiPair(jp,kana,lid,idx){
  var g=vGroup(lid,idx);
  if(g===3){ return {jp:jp.replace(/します$/,"しない").replace(/^します$/,"しない"), kana:kana.replace(/します$/,"しない").replace(/^します$/,"しない")}; }
  if(g==="K"){ return {jp:jp.replace(/来ます$/,"来ない").replace(/きます$/,"きない").replace(/来ます$/,"来ない"), kana:kana.replace(/きます$/,"こない")}; }
  if(g===9||g==null){ return {jp:masuStem(jp)+"ない", kana:masuStem(kana)+"ない"}; }
  if(g===2){ return {jp:masuStem(jp)+"ない", kana:masuStem(kana)+"ない"}; }
  var k=String(kana||"");
  function rep(str,rm,ad){ return str.slice(0,str.length-rm.length)+ad; }
  if(/きます$/.test(k)&&!/いきます$/.test(k)){ return {jp:rep(jp,"きます","かない"), kana:rep(kana,"きます","かない")}; }
  if(/いきます$/.test(k)){ return {jp:rep(jp,"きます","かない"), kana:rep(kana,"きます","かない")}; }
  if(/ぎます$/.test(k)){ return {jp:rep(jp,"ぎます","がない"), kana:rep(kana,"ぎます","がない")}; }
  if(/します$/.test(k)){ return {jp:rep(jp,"します","さない"), kana:rep(kana,"します","さない")}; }
  if(/ちます$/.test(k)){ return {jp:rep(jp,"ちます","たない"), kana:rep(kana,"ちます","たない")}; }
  if(/ります$/.test(k)){ return {jp:rep(jp,"ります","らない"), kana:rep(kana,"ります","らない")}; }
  if(/います$/.test(k)){ return {jp:rep(jp,"います","わない"), kana:rep(kana,"います","わない")}; }
  if(/みます$/.test(k)){ return {jp:rep(jp,"みます","まない"), kana:rep(kana,"みます","まない")}; }
  if(/びます$/.test(k)){ return {jp:rep(jp,"びます","ばない"), kana:rep(kana,"びます","ばない")}; }
  if(/にます$/.test(k)){ return {jp:rep(jp,"にます","なない"), kana:rep(kana,"にます","なない")}; }
  return {jp:masuStem(jp)+"ない", kana:masuStem(kana)+"ない"};
}
function dictPair(jp,kana,lid,idx){
  var g=vGroup(lid,idx);
  if(g===3){ return {jp:jp.replace(/します$/,"する").replace(/^します$/,"する"), kana:kana.replace(/します$/,"する").replace(/^します$/,"する")}; }
  if(g==="K"){ return {jp:jp.replace(/来ます$/,"来る").replace(/きます$/,"きる"), kana:kana.replace(/きます$/,"くる")}; }
  if(g===9||g==null){ var n=naiPair(jp,kana,lid,idx); return {jp:n.jp.replace(/ない$/,"る"), kana:n.kana.replace(/ない$/,"る")}; }
  if(g===2){ return {jp:masuStem(jp)+"る", kana:masuStem(kana)+"る"}; }
  var k=String(kana||"");
  function rep(str,rm,ad){ return str.slice(0,str.length-rm.length)+ad; }
  if(/きます$/.test(k)){ return {jp:rep(jp,"きます","く"), kana:rep(kana,"きます","く")}; }
  if(/ぎます$/.test(k)){ return {jp:rep(jp,"ぎます","ぐ"), kana:rep(kana,"ぎます","ぐ")}; }
  if(/します$/.test(k)){ return {jp:rep(jp,"します","す"), kana:rep(kana,"します","す")}; }
  if(/ちます$/.test(k)){ return {jp:rep(jp,"ちます","つ"), kana:rep(kana,"ちます","つ")}; }
  if(/ります$/.test(k)){ return {jp:rep(jp,"ります","る"), kana:rep(kana,"ります","る")}; }
  if(/います$/.test(k)){ return {jp:rep(jp,"います","う"), kana:rep(kana,"います","う")}; }
  if(/みます$/.test(k)){ return {jp:rep(jp,"みます","む"), kana:rep(kana,"みます","む")}; }
  if(/びます$/.test(k)){ return {jp:rep(jp,"びます","ぶ"), kana:rep(kana,"びます","ぶ")}; }
  if(/にます$/.test(k)){ return {jp:rep(jp,"にます","ぬ"), kana:rep(kana,"にます","ぬ")}; }
  return {jp:masuStem(jp)+"る", kana:masuStem(kana)+"る"};
}
// i-adjective conjugation (kana-based, jp mirrors okurigana)
function iAdjInfo(v){
  var jp=String(v[0]||""), kana=String(v[1]||"");
  var isIi = /いい/.test(jp)||/いい/.test(kana);
  var jb=stripBrackets(jp), kb=stripBrackets(kana);
  return {jb:jb, kb:kb, isIi:isIi};
}
function iAdjForms(v){
  var o=iAdjInfo(v);
  if(o.isIi){
    return {
      pres:{jp:o.jb, kana:o.kb},
      neg:{jp:o.jb.replace(/いい.*$/,"よくない"), kana:o.kb.replace(/いい.*$/,"よくない")},
      past:{jp:o.jb.replace(/いい.*$/,"よかった"), kana:o.kb.replace(/いい.*$/,"よかった")},
      pastneg:{jp:o.jb.replace(/いい.*$/,"よくなかった"), kana:o.kb.replace(/いい.*$/,"よくなかった")},
      ku:{jp:o.jb.replace(/いい.*$/,"よく"), kana:o.kb.replace(/いい.*$/,"よく")}
    };
  }
  function dropI(s){ return s.replace(/い$/,""); }
  return {
    pres:{jp:o.jb, kana:o.kb},
    neg:{jp:dropI(o.jb)+"くない", kana:dropI(o.kb)+"くない"},
    past:{jp:dropI(o.jb)+"かった", kana:dropI(o.kb)+"かった"},
    pastneg:{jp:dropI(o.jb)+"くなかった", kana:dropI(o.kb)+"くなかった"},
    ku:{jp:dropI(o.jb)+"く", kana:dropI(o.kb)+"く"}
  };
}
function naBase(v){ return {jp:stripBrackets(String(v[0]||"")), kana:stripBrackets(String(v[1]||""))}; }

// builders per lesson — each returns [{jp,kana,mean,pat},...] length>=3
var BUILDERS={};
function ex(jp,kana,mean,pat){ return {jp:jp, kana:kana, mean:mean, pat:pat}; }

// ---------- BAB 1 : Perkenalan & Profesi (pat 0:は〜です 1:じゃありません 2:ですか 3:も 4:の) ----------
BUILDERS[1]=function(v,idx){
  var jp=v[0], kana=v[1], mean=v[3];
  var mc=meanCore(mean), mcK=meanCore(mean,true);
  // tilde vocab (check から来 first — it also contains 〜)
  if(/から来ました|からきました/.test(String(kana)+String(jp))){
    return [
      ex("私はインドネシアから来ました","わたしはインドネシアからきました","Saya datang dari Indonesia.",0),
      ex("ミラーさんもアメリカから来ました","ミラーさんもアメリカからきました","Sdri Miller juga datang dari Amerika.",3),
      ex("あなたは日本から来ましたか","あなたはにほんからきましたか","Apakah Anda datang dari Jepang?",2)
    ];
  }
  if(hasTilde(jp)){
    var f=fillTilde(jp,kana);
    if(/さん|ちゃん|くん/.test(jp)){
      return [
        ex("こちらは"+f.jp+"です","こちらは"+f.kana+"です","Ini "+mc+" "+f.jp+".",0),
        ex(f.jp+"も学生です",f.kana+"もがくせいです",f.jp+" juga seorang murid.",3),
        ex(f.jp+"の本です",f.kana+"のほんです","Ini buku milik "+f.jp+".",4)
      ];
    }
    if(/人/.test(jp)){
      return [
        ex("私は日本人です","わたしはにほんじんです","Saya orang Jepang.",0),
        ex("ミラーさんも日本人です","ミラーさんもにほんじんです","Sdri Miller juga orang Jepang.",3),
        ex("あなたは日本人ですか","あなたはにほんじんですか","Apakah Anda orang Jepang?",2)
      ];
    }
    // 〜歳
    return [
      ex("私は18歳です","わたしはじゅうはっさいです","Saya berumur 18 tahun.",0),
      ex("ミラーさんも18歳です","ミラーさんもじゅうはっさいです","Sdri Miller juga berumur 18 tahun.",3),
      ex("あなたは18歳ですか","あなたはじゅうはっさいですか","Apakah Anda berumur 18 tahun?",2)
    ];
  }
  var J=jpBase(jp), K=kanaBase(kana);
  // interrogatives
  if(J==="誰"||K==="だれ") return [
    ex("あの人は誰ですか","あのひとはだれですか","Orang itu siapa?",2),
    ex("ミラーさんは誰ですか","ミラーさんはだれですか","Sdri Miller itu siapa?",2),
    ex("先生は誰ですか","せんせいはだれですか","Guru itu siapa?",2)
  ];
  if(J==="どなた"||K==="どなた") return [
    ex("あの方はどなたですか","あのかたはどなたですか","Beliau itu siapa?",2),
    ex("先生はどなたですか","せんせいはどなたですか","Guru itu siapa (sopan)?",2),
    ex("こちらはどなたですか","こちらはどなたですか","Beliau yang di sini ini siapa?",2)
  ];
  if(/何歳|おいくつ|歳/.test(J+K)){
    var ageW = /おいくつ/.test(J+K) ? "おいくつ" : "何歳";
    var ageWK = /おいくつ/.test(J+K) ? "おいくつ" : "なんさい";
    return [
      ex("ミラーさんは"+ageW+"ですか","ミラーさんは"+ageWK+"ですか","Sdri Miller umur berapa?",2),
      ex("田中さんは"+ageW+"ですか","たなかさんは"+ageWK+"ですか","Tuan Tanaka umur berapa?",2),
      ex("あなたは"+ageW+"ですか","あなたは"+ageWK+"ですか","Kamu umur berapa?",2)
    ];
  }
  // phrases / greetings
  if(J==="はい"||K==="はい") return [
    ex("はい、私は学生です","はい、わたしはがくせいです","Ya, saya seorang murid.",0),
    ex("はい、私も会社員です","はい、わたしもかいしゃいんです","Ya, saya juga seorang karyawan.",3),
    ex("はい、私は18歳です","はい、わたしはじゅうはっさいです","Ya, saya berumur 18 tahun.",0)
  ];
  if(J==="いいえ"||K==="いいえ") return [
    ex("いいえ、私は学生じゃありません","いいえ、わたしはがくせいじゃありません","Bukan, saya bukan murid.",1),
    ex("いいえ、ミラーさんは会社員じゃありません","いいえ、ミラーさんはかいしゃいんじゃありません","Bukan, Sdri Miller bukan karyawan.",1),
    ex("いいえ、私は医者じゃありません","いいえ、わたしはいしゃじゃありません","Bukan, saya bukan dokter.",1)
  ];
  if(/失礼ですが/.test(J)) return [
    ex("失礼ですが、お名前は","しつれいですが、おなまえは","Permisi, siapa nama Anda?",2),
    ex("失礼ですが、ミラーさんは何歳ですか","しつれいですが、ミラーさんはなんさいですか","Permisi, Sdri Miller umur berapa?",2),
    ex("失礼ですが、あなたは学生ですか","しつれいですが、あなたはがくせいですか","Permisi, apakah Anda murid?",2)
  ];
  if(/お名前/.test(J)) return [
    ex("私のお名前はミラーです","わたしのおなまえはミラーです","Nama saya Miller.",4),
    ex("あなたのお名前は","あなたのおなまえは","Nama Anda siapa?",4),
    ex("ミラーさんのお名前は","ミラーさんのおなまえは","Nama Sdri Miller siapa?",4)
  ];
  if(/初めまして/.test(J)) return [
    ex("初めまして、私はミラーです","はじめまして、わたしはミラーです","Salam kenal, saya Miller.",0),
    ex("初めまして、私も学生です","はじめまして、わたしもがくせいです","Salam kenal, saya juga murid.",3),
    ex("初めまして、田中さんは会社員です","はじめまして、たなかさんはかいしゃいんです","Salam kenal, Tuan Tanaka karyawan.",0)
  ];
  if(/よろしく/.test(J)) return [
    ex("どうぞよろしく、私はミラーです","どうぞよろしく、わたしはミラーです","Senang berkenalan, saya Miller.",0),
    ex("こちらこそよろしく、私も学生です","こちらこそよろしく、わたしもがくせいです","Sama-sama, saya juga murid.",3),
    ex("どうぞよろしく、私の友達は田中です","どうぞよろしく、わたしのともだちはたなかです","Senang berkenalan, teman saya Tanaka.",4)
  ];
  if(/こちらは/.test(J)) return [
    ex("こちらはミラーさんです","こちらはミラーさんです","Ini Sdri Miller.",0),
    ex("こちらは田中さんじゃありません","こちらはたなかさんじゃありません","Ini bukan Tuan Tanaka.",1),
    ex("こちらはミラーさんですか","こちらはミラーさんですか","Apakah ini Sdri Miller?",2)
  ];
  if(/から来ました|からきました/.test(K+J)) return [
    ex("私はインドネシアから来ました","わたしはインドネシアからきました","Saya datang dari Indonesia.",0),
    ex("ミラーさんもアメリカから来ました","ミラーさんもアメリカからきました","Sdri Miller juga datang dari Amerika.",3),
    ex("あなたは日本から来ましたか","あなたはにほんからきましたか","Apakah Anda datang dari Jepang?",2)
  ];
  // countries (reference)
  if(/アメリカ|イギリス|インド|韓国|タイ|中国|ドイツ|日本|フランス|ブラジル/.test(J)){
    var ctry=J, ctryK=K, ctryM=mcK.replace(/ *\(.*$/,"");
    return [
      ex("私は"+ctry+"から来ました","わたしは"+ctryK+"からきました","Saya datang dari "+ctryM+".",0),
      ex("ミラーさんも"+ctry+"から来ました","ミラーさんも"+ctryK+"からきました","Sdri Miller juga datang dari "+ctryM+".",3),
      ex("あなたは"+ctry+"の人ですか","あなたは"+ctryK+"のひとですか","Apakah Anda orang "+ctryM+"?",4)
    ];
  }
  // pronouns — use as subject, not predicate (avoid 私は私です)
  if(J==="私"||K==="わたし") return [
    ex("私は学生です","わたしはがくせいです","Saya adalah murid.",0),
    ex("私は会社員じゃありません","わたしはかいしゃいんじゃありません","Saya bukan karyawan.",1),
    ex("私も18歳です","わたしもじゅうはっさいです","Saya juga berumur 18 tahun.",3)
  ];
  if(J==="私たち"||K==="わたしたち") return [
    ex("私たちは学生です","わたしたちはがくせいです","Kami adalah murid.",0),
    ex("私たちは会社員じゃありません","わたしたちはかいしゃいんじゃありません","Kami bukan karyawan.",1),
    ex("私たちも日本人です","わたしたちもにほんじんです","Kami juga orang Jepang.",3)
  ];
  if(J==="あなた"||K==="あなた") return [
    ex("あなたは学生ですか","あなたはがくせいですか","Apakah Anda murid?",2),
    ex("あなたも会社員ですか","あなたもかいしゃいんですか","Apakah Anda juga karyawan?",3),
    ex("あなたはミラーさんですか","あなたはミラーさんですか","Apakah Anda Sdri Miller?",2)
  ];
  if(J==="あの人"||K==="あのひと") return [
    ex("あの人は学生です","あのひとはがくせいです","Orang itu murid.",0),
    ex("あの人は会社員じゃありません","あのひとはかいしゃいんじゃありません","Orang itu bukan karyawan.",1),
    ex("あの人も学生です","あのひともがくせいです","Orang itu juga murid.",3)
  ];
  if(J==="あの方"||K==="あのかた") return [
    ex("あの方は先生です","あのかたはせんせいです","Beliau adalah guru.",0),
    ex("あの方は会社員じゃありません","あのかたはかいしゃいんじゃありません","Beliau bukan karyawan.",1),
    ex("あの方も医者です","あのかたもいしゃです","Beliau juga dokter.",3)
  ];
  if(/皆さん|みなさん/.test(J+K)) return [
    ex("皆さんは学生ですか","みなさんはがくせいですか","Apakah Anda semua murid?",2),
    ex("皆さんも会社員です","みなさんもかいしゃいんです","Anda semua juga karyawan.",3),
    ex("皆さんの国はどこですか","みなさんのくにはどこですか","Negara Anda semua di mana?",4)
  ];
  if(J==="先生") return [
    ex("ミラーさんは先生です","ミラーさんはせんせいです","Sdri Miller adalah guru.",0),
    ex("田中さんは先生じゃありません","たなかさんはせんせいじゃありません","Tuan Tanaka bukan guru.",1),
    ex("あの方も先生です","あのかたもせんせいです","Beliau juga guru.",3)
  ];
  // default nouns (professions, places, people)
  var nJ=J||jp, nK=K||kana;
  var pat3ex = (idx%2===0)
    ? ex("田中さんも"+nJ+"です","たなかさんも"+nK+"です","Tuan Tanaka juga "+mc+".",3)
    : ex("私の友達は"+nJ+"です","わたしのともだちは"+nK+"です","Teman saya adalah "+mc+".",4);
  return [
    ex("私は"+nJ+"です","わたしは"+nK+"です","Saya adalah "+mc+".",0),
    ex("ミラーさんは"+nJ+"じゃありません","ミラーさんは"+nK+"じゃありません","Sdri Miller bukan "+mc+".",1),
    pat3ex
  ];
};

// ---------- BAB 2 : Benda & Kepemilikan (0:これ/それ/あれはN 1:この/その/あのN 2:そうです/違います 3:〜か〜か 4:NのN) ----------
BUILDERS[2]=function(v,idx){
  var jp=v[0], kana=v[1];
  var mc=meanCore(v[3]);
  var J=jpBase(jp), K=kanaBase(kana);
  if(J==="これ"||J==="それ"||J==="あれ") return [
    ex(J+"は本です",K+"はほんです","Ini/Itu adalah buku.",0),
    ex(J+"は辞書じゃありません",K+"はじしょじゃありません","Ini/Itu bukan kamus.",0),
    ex(J+"は本ですか",K+"はほんですか","Apakah ini/itu buku?",0)
  ];
  if(/この|その|あの/.test(J)) {
    var base=J.replace(/〜/g,"本"), baseK=K.replace(/〜/g,"ほん");
    return [
      ex(base+"は私のです",baseK+"はわたしのです","Buku ini/itu milik saya.",1),
      ex(base+"は辞書じゃありません",baseK+"はじしょじゃありません","Buku ini/itu bukan kamus.",1),
      ex(base+"は本ですか",baseK+"はほんですか","Apakah buku ini/itu buku?",1)
    ];
  }
  if(/そうですか/.test(J)) return [
    ex("これは本ですか、そうですか","これはほんですか、そうですか","Ini buku ya, oh begitu.",2),
    ex("あれは辞書ですか、そうですか","あれはじしょですか、そうですか","Itu kamus ya, oh begitu.",2),
    ex("ミラーさんは学生ですか、そうですか","ミラーさんはがくせいですか、そうですか","Miller murid ya, oh begitu.",2)
  ];
  if(/そうです/.test(J)) return [
    ex("はい、そうです","はい、そうです","Ya, benar begitu.",2),
    ex("はい、それは本です、そうです","はい、それはほんです、そうです","Ya, itu buku, benar begitu.",2),
    ex("ええ、そうです、これは辞書です","ええ、そうです、これはじしょです","Ya, benar, ini kamus.",2)
  ];
  if(/違います|ちがいます/.test(K)) return [
    ex("いいえ、違います、それは本じゃありません","いいえ、ちがいます、それはほんじゃありません","Bukan, itu bukan buku.",2),
    ex("いいえ、違います、これは辞書です","いいえ、ちがいます、これはじしょです","Bukan, ini kamus.",2),
    ex("それは違います、あれは雑誌です","それはちがいます、あれはざっしです","Itu salah, itu majalah.",2)
  ];
  if(/あのう/.test(J)) return [
    ex("あのう、これは本ですか","あのう、これはほんですか","Eeh, apakah ini buku?",0),
    ex("あのう、その辞書は私のです","あのう、そのじしょはわたしのです","Eeh, kamus itu milik saya.",1),
    ex("あのう、これは何ですか","あのう、これはなんですか","Eeh, ini apa?",0)
  ];
  if(/ほんの気持ち|どうぞ|どうも|お世話|こちらこそ/.test(J+K)) return [
    ex("これは"+J+"です",K+"は"+K+"です","Ini "+mc+".",0),
    ex("それも"+J+"です",K+"も"+K+"です","Itu juga "+mc+".",3),
    ex("これは"+J+"ですか",K+"は"+K+"ですか","Apakah ini "+mc+"?",0)
  ];
  if(J==="何"||K==="なん") return [
    ex("これは何ですか","これはなんですか","Ini apa?",0),
    ex("その本は何ですか","そのほんはなんですか","Buku itu apa?",1),
    ex("あれは日本語で何ですか","あれはにほんごでなんですか","Itu dalam bahasa Jepang apa?",1)
  ];
  // default nouns: book, dictionary, pen, etc.
  return [
    ex("これは"+J+"です","これは"+K+"です","Ini adalah "+mc+".",0),
    ex("その"+J+"は私のです","その"+K+"はわたしのです","Benda itu milik saya.",4),
    ex("これは"+J+"ですか、それとも辞書ですか", "これは"+K+"ですか、それともじしょですか","Apakah ini "+mc+" atau kamus?",3)
  ];
};

// ---------- BAB 3 : Lokasi & Tempat (0:ここ/そこ/あそこはN 1:NはTempatです 2:どこ/どちら 3:NのN) ----------
BUILDERS[3]=function(v,idx){
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  var mc=meanCore(v[3]);
  if(/ここ|そこ|あそこ|どこ/.test(J)) return [
    ex(J+"は教室です",K+"はきょうしつです","Di sini/situ/sana adalah kelas.",0),
    ex(J+"は事務所じゃありません",K+"はじむしょじゃありません","Di sini/situ/sana bukan kantor.",0),
    ex(J+"はどこですか",K+"はどこですか","Di sini/situ/sana di mana?",2)
  ];
  if(/こちら|そちら|あちら|どちら/.test(J)) return [
    ex(J+"は受付です",K+"はうけつけです","Sebelah sini/situ/sana adalah resepsionis.",0),
    ex("会社は"+J+"ですか","かいしゃは"+K+"ですか","Apakah perusahaan di sebelah sini/situ/sana?",2),
    ex(J+"はトイレです","トイレ","Tempat ini adalah toilet.",0)
  ];
  if(/何階|〜階|階/.test(J+K)) {
    return [
      ex("売り場は3階です","うりばはさんかいです","Counter penjualan di lantai 3.",1),
      ex("トイレはどこですか","トイレはどこですか","Toilet di mana?",2),
      ex("事務所は3階の隣です","じむしょはさんかいのとなりです","Kantor di sebelah lantai 3.",3)
    ];
  }
  if(/いくら|〜円|円|百|千|万/.test(J+K)) {
    var item = /円/.test(J) ? "500円" : J;
    var itemK = /円/.test(J) ? "ごひゃくえん" : K;
    return [
      ex("これは"+item+"です","これは"+itemK+"です","Ini harganya "+mc+".",0),
      ex("それはいくらですか","それはいくらですか","Itu harganya berapa?",2),
      ex("日本の本の値段です","にほんのほんのねだんです","Ini harga buku Jepang.",3)
    ];
  }
  if(/すみません|でございます|見せてください|じゃ/.test(J+K)) return [
    ex("すみません、トイレはどこですか","すみません、トイレはどこですか","Maaf, toilet di mana?",2),
    ex("こちらは事務所でございます","こちらはじむしょでございます","Ini kantor (sangat sopan).",0),
    ex("この鞄を見せてください","このかばんをみせてください","Tolong perlihatkan tas ini.",0)
  ];
  // default place/noun
  return [
    ex("教室はここです","きょうしつはここです","Ruang kelas di sini.",1),
    ex(J+"はどこですか",K+"はどこですか","Di mana "+mc+"?",2),
    ex("会社の隣の"+J+"です","かいしゃのとなりの"+K+"です","Ini "+mc+" di sebelah perusahaan.",3)
  ];
};

// ---------- BAB 4 : Waktu & Kegiatan (0:今〜時〜分 1:Vます/ません/ました 2:WaktuにV 3:NからNまで) ----------
BUILDERS[4]=function(v,idx){
  var jp=v[0], kana=v[1];
  var J=jpBase(jp), K=kanaBase(kana);
  var mc=meanCore(v[3]);
  if(isVerb(v)){
    var st=masuStem(J), stk=masuStem(K);
    return [
      ex("毎朝7時に"+J,st+"ます","Setiap pagi "+mc+" jam 7.",2),
      ex("昨日は"+st+"ませんでした",stk+"ませんでした","Kemarin tidak "+mc+".",1),
      ex("月曜日から金曜日まで"+J,stk+"ます","Dari Senin sampai Jumat "+mc+".",3)
    ];
  }
  if(/〜時|〜分|時|分|半|午前|午後|朝|昼|晩|今日|明日|昨日|毎日|曜日/.test(J+K)) {
    return [
      ex("今7時です","いま7じです","Sekarang jam 7.",0),
      ex("7時に起きます","7じにおきます","Bangun jam 7.",2),
      ex("9時から5時まで働きます","9じから5じまではたらきます","Bekerja dari jam 9 sampai jam 5.",3)
    ];
  }
  if(/から|まで/.test(J)) return [
    ex("9時"+J+"5時です","9じ"+K+"5じです","Jam 9 "+mc+" jam 5.",3),
    ex("月曜日"+J+"金曜日です","げつようび"+K+"きんようびです","Hari Senin "+mc+" Jumat.",3),
    ex("6時"+J+"9時まで働きます","6じ"+K+"9じまではたらきます","Bekerja "+mc+" jam 9.",3)
  ];
  if(/番号|何番|大変/.test(J+K)) return [
    ex("電話番号は123です","でんわばんごうは123です","Nomor telepon 123.",0),
    ex("何番ですか","なんばんですか","Nomor berapa?",0),
    ex("毎日大変ですね","まいにちたいへんですね","Setiap hari berat ya.",0)
  ];
  return [
    ex("今は"+J+"です","いまは"+K+"です","Sekarang adalah "+mc+".",0),
    ex("毎朝"+J+"です","まいあさ"+K+"です","Setiap pagi adalah "+mc+".",2),
    ex("月曜日から金曜日までです","げつようびからきんようびまでです","Dari Senin sampai Jumat.",3)
  ];
};

// ---------- BAB 5 : Perpindahan & Transportasi (0:へ行く/来る/帰る 1:どこも〜ません 2:で 3:と) ----------
BUILDERS[5]=function(v,idx){
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  var mc=meanCore(v[3]);
  if(isVerb(v)){
    if(/行きます|いきます/.test(K)) return [
      ex("明日学校へ行きます","あしたがっこうへいきます","Besok pergi ke sekolah.",0),
      ex("どこへも行きません","どこへもいきません","Tidak pergi ke mana-mana.",1),
      ex("友達と学校へ行きます","ともだちとがっこうへいきます","Pergi ke sekolah bersama teman.",3)
    ];
    if(/来ます|きます/.test(K)) return [
      ex("明日学校へ来ます","あしたがっこうへきます","Besok datang ke sekolah.",0),
      ex("どこへも来ません","どこへもきません","Tidak datang ke mana-mana.",1),
      ex("バスで学校へ来ます","バスでがっこうへきます","Datang ke sekolah naik bus.",2)
    ];
    if(/帰ります|かえります/.test(K)) return [
      ex("5時にうちへ帰ります","5じにうちへかえります","Pulang jam 5.",0),
      ex("どこへも帰りません","どこへもかえりません","Tidak pulang ke mana-mana.",1),
      ex("電車でうちへ帰ります","でんしゃでうちへかえります","Pulang naik kereta.",2)
    ];
    var st=masuStem(J), stk=masuStem(K);
    return [
      ex("明日"+J,st+"ます","Besok "+mc+".",0),
      ex("昨日はどこへも"+st+"ませんでした",stk+"ませんでした","Kemarin tidak "+mc+" ke mana-mana.",1),
      ex("電車で"+J,stk+"ます","Dengan kereta "+mc+".",2)
    ];
  }
  if(/駅|学校|会社|スーパー|人|友達|家族|彼|彼女/.test(J)) return [
    ex("明日"+J+"へ行きます","あした"+K+"へいきます","Besok pergi ke "+mc+".",0),
    ex(J+"へ友達と行きます",K+"へともだちといきます","Pergi ke "+mc+" bersama teman.",3),
    ex("電車で"+J+"へ行きます","でんしゃで"+K+"へいきます","Pergi ke "+mc+" naik kereta.",2)
  ];
  if(/飛行機|船|電車|地下鉄|新幹線|バス|タクシー|自転車|歩/.test(J+K)) {
    var tool = /歩/.test(J) ? "歩いて" : J+"で";
    var toolK = /歩/.test(J) ? "あるいて" : K+"で";
    return [
      ex(tool+"学校へ行きます",toolK+"がっこうへいきます","Pergi ke sekolah "+mc+".",2),
      ex(tool+"来ませんでした",toolK+"きませんでした","Kemarin tidak datang "+mc+".",2),
      ex("友達と"+tool+"行きます", "ともだちと"+toolK+"いきます","Pergi bersama teman "+mc+".",3)
    ];
  }
  if(/週|月|年|日|何月|何日|いつ|誕生日/.test(J+K)) return [
    ex("先週"+J+"へ行きました","せんしゅう"+K+"へいきました","Minggu lalu pergi "+mc+".",0),
    ex("いつ"+J+"へ行きますか","いつ"+K+"へいきますか","Kapan pergi "+mc+"?",0),
    ex("友達と"+J+"に行きます","ともだちと"+K+"にいきます","Pergi "+mc+" bersama teman.",3)
  ];
  return [
    ex(J+"へ行きます",K+"へいきます","Pergi ke "+mc+".",0),
    ex("どこへも行きません","どこへもいきません","Tidak pergi ke mana-mana.",1),
    ex(J+"で学校へ行きます",K+"でがっこうへいきます","Pergi ke sekolah "+mc+".",2)
  ];
};

// ---------- BAB 6 : Aktivitas & Objek (0:NをV 1:何をしますか 2:TempatでV 3:Vませんか 4:Vましょう) ----------
BUILDERS[6]=function(v,idx){
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  var mc=meanCore(v[3]);
  if(isVerb(v)){
    var st=masuStem(J), stk=masuStem(K);
    return [
      ex("ご飯を"+J, "ごはんを"+stk+"ます","Makan nasi / "+mc+".",0),
      ex("図書館で"+J, "としょかんで"+stk+"ます","Di perpustakaan "+mc+".",2),
      ex("一緒に"+st+"ませんか", "いっしょに"+stk+"ませんか","Maukah "+mc+" bersama?",3)
    ];
  }
  if(/何/.test(J)) return [
    ex("何をしますか","なにをしますか","Melakukan apa?",1),
    ex("何を食べますか","なにをたべますか","Makan apa?",1),
    ex("休みは何をしますか","やすみはなにをしますか","Hari libur melakukan apa?",1)
  ];
  if(/一緒|ちょっと|いつも|時々/.test(J+K)) return [
    ex("一緒にご飯を食べます","いっしょにごはんをたべます","Makan bersama ("+mc+").",0),
    ex("図書館で一緒に勉強します","としょかんでいっしょにべんきょうします","Belajar bersama di perpustakaan.",2),
    ex("一緒にテニスをしましょう","いっしょにテニスをしましょう","Mari bermain tenis bersama.",4)
  ];
  // nouns (food, drink, place, etc.)
  return [
    ex(J+"を食べます",K+"をたべます","Makan "+mc+".",0),
    ex("レストランで"+J+"を食べます","レストランで"+K+"をたべます","Makan "+mc+" di restoran.",2),
    ex(J+"を買いましょう",K+"をかいましょう","Mari membeli "+mc+".",4)
  ];
};

// ---------- BAB 7 : Alat & Memberi (0:AlatでV 1:〜語で何ですか 2:にNをあげます 3:にNをもらいます) ----------
BUILDERS[7]=function(v,idx){
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  var mc=meanCore(v[3]);
  if(isVerb(v)){
    if(/あげます/.test(K)) return [
      ex("友達にプレゼントをあげます","ともだちにプレゼントをあげます","Memberi hadiah kepada teman.",2),
      ex("母に花をあげます","ははにはなをあげます","Memberi bunga kepada ibu.",2),
      ex("先生に本をあげます","せんせいにほんをあげます","Memberi buku kepada guru.",2)
    ];
    if(/もらいます/.test(K)) return [
      ex("友達に本をもらいます","ともだちにほんをもらいます","Menerima buku dari teman.",3),
      ex("先生に辞書をもらいます","せんせいにじしょをもらいます","Menerima kamus dari guru.",3),
      ex("母にシャツをもらいます","ははにシャツをもらいます","Menerima kemeja dari ibu.",3)
    ];
    if(/貸します|かします/.test(K)) return [
      ex("友達に本を貸します","ともだちにほんをかします","Meminjamkan buku kepada teman.",2),
      ex("弟にCDを貸します","おとうとにCDをかします","Meminjamkan CD kepada adik.",2),
      ex("ミラーさんに辞書を貸します","ミラーさんにじしょをかします","Meminjamkan kamus kepada Miller.",2)
    ];
    if(/借ります|かります/.test(K)) return [
      ex("友達に本を借ります","ともだちにほんをかります","Meminjam buku dari teman.",3),
      ex("先生にCDを借ります","せんせいにCDをかります","Meminjam CD dari guru.",3),
      ex("図書館に本を借ります","としょかんにほんをかります","Meminjam buku dari perpustakaan.",3)
    ];
    if(/教えます|習います|かけます/.test(K)) return [
      ex("先生に日本語を習います","せんせいににほんごをならいます","Belajar bahasa Jepang dari guru.",3),
      ex("友達に英語を教えます","ともだちにえいごをおしえます","Mengajari teman bahasa Inggris.",2),
      ex("はしでご飯を食べます","はしでごはんをたべます","Makan nasi dengan sumpit.",0)
    ];
    var st=masuStem(J), stk=masuStem(K);
    return [
      ex("はさみで紙を"+J,"はさみでかみを"+stk+"ます","Dengan gunting "+mc+" kertas.",0),
      ex("友達に"+J,"ともだちに"+stk+"ます","Kepada teman "+mc+".",2),
      ex("先生に"+J,"せんせいに"+stk+"ます","Kepada/dari guru "+mc+".",3)
    ];
  }
  // nouns (tools, gifts, etc.)
  if(/手|箸|スプーン|ナイフ|フォーク|はさみ|パソコン|ケータイ|紙|花|プレゼント/.test(J+K)){
    return [
      ex(J+"で書きます",K+"でかきます","Menulis dengan "+mc+".",0),
      ex("友達に"+J+"をあげます","ともだちに"+K+"をあげます","Memberi "+mc+" kepada teman.",2),
      ex("先生に"+J+"をもらいます","せんせいに"+K+"をもらいます","Menerima "+mc+" dari guru.",3)
    ];
  }
  return [
    ex(J+"で話します",K+"ではなします","Berbicara dengan/dalam "+mc+".",0),
    ex("これは日本語で何ですか","これはにほんごでなんですか","Ini dalam bahasa Jepang apa? ("+mc+")",1),
    ex("友達に"+J+"をあげます","ともだちに"+K+"をあげます","Memberi "+mc+" kepada teman.",2)
  ];
};

// ---------- BAB 8 : Kata Sifat (0:KS-naです 1:KS-iです 2:KS+N 3:とても/あまり) ----------
BUILDERS[8]=function(v,idx){
  var mc=meanCore(v[3]);
  if(isNaAdj(v)){
    var b=naBase(v);
    return [
      ex("この町は"+b.jp+"です","このまちは"+b.kana+"です","Kota ini "+mc+".",0),
      ex("この町は"+b.jp+"じゃありません","このまちは"+b.kana+"じゃありません","Kota ini tidak "+mc+".",0),
      ex("とても"+b.jp+"な町です","とても"+b.kana+"なまちです","Kota yang sangat "+mc+".",2)
    ];
  }
  if(isIAdj(v)){
    var f=iAdjForms(v);
    return [
      ex("この山は"+f.pres.jp+"です","このやまは"+f.pres.kana+"です","Gunung ini "+mc+".",1),
      ex("とても"+f.pres.jp+"山です","とても"+f.pres.kana+"やまです","Gunung yang sangat "+mc+".",2),
      ex("あまり"+f.neg.jp+"です","あまり"+f.neg.kana+"です","Tidak terlalu "+mc+".",3)
    ];
  }
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  // nouns (sakura, yama, machi, etc.)
  return [
    ex(J+"は有名です",K+"はゆうめいです","Hal "+mc+" terkenal.",0),
    ex(J+"は大きいです",K+"はおおきいです","Hal "+mc+" besar.",1),
    ex("有名な"+J+"です","ゆうめいな"+K+"です","Hal "+mc+" yang terkenal.",2)
  ];
};

// ---------- BAB 9 : Suka & Alasan (0:Nが好き/上手 1:Nが分かる/ある 2:〜から〜) ----------
BUILDERS[9]=function(v,idx){
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  var mc=meanCore(v[3]);
  if(isNaAdj(v)){
    var b=naBase(v);
    return [
      ex("私は"+b.jp+"が"+( /上手|下手/.test(J+K) ? "です" : "です"),"わたしは"+b.kana+"がすきです","Saya "+mc+".",0),
      ex("ミラーさんは"+b.jp+"が好きです","ミラーさんは"+b.kana+"がすきです","Miller suka "+mc+".",0),
      ex("時間がありませんから、行きません","じかんがありませんから、いきません","Karena tidak ada waktu, tidak pergi ("+mc+").",2)
    ];
  }
  if(/分かります|わかります/.test(K)) return [
    ex("日本語が分かります","にほんごがわかります","Mengerti bahasa Jepang.",1),
    ex("漢字が分かりますから、読みます","かんじがわかりますから、よみます","Karena mengerti kanji, saya membaca.",2),
    ex("英語が分かりますか","えいごがわかりますか","Apakah mengerti bahasa Inggris?",1)
  ];
  if(/あります/.test(K)) return [
    ex("時間があります","じかんがあります","Ada waktu.",1),
    ex("切符がありますから、行きます","きっぷがありますから、いきます","Karena ada tiket, saya pergi.",2),
    ex("お金がありますか","おかねがありますか","Apakah ada uang?",1)
  ];
  return [
    ex("私は"+J+"が好きです","わたしは"+K+"がすきです","Saya suka "+mc+".",0),
    ex("私は"+J+"が分かります","わたしは"+K+"がわかります","Saya mengerti "+mc+".",1),
    ex(J+"がありますから、行きます",K+"がありますから、いきます","Karena ada "+mc+", saya pergi.",2)
  ];
};

// ---------- BAB 10 : Keberadaan (0:TempatにNがいる/ある 1:NはTempatにいる/ある 2:NのN posisi) ----------
BUILDERS[10]=function(v,idx){
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  var mc=meanCore(v[3]);
  var alive = /人|男|女|子|犬|猫|先生|学生|友達|家族/.test(J+K) || /います/.test(K);
  var exVerb = alive ? "います" : "あります";
  var exVerbK = alive ? "います" : "あります";
  if(/います|あります/.test(K)&&J.length<=4) return [
    ex("公園に犬がいます","こうえんにいぬがいます","Di taman ada anjing.",0),
    ex("犬は公園にいます","いぬはこうえんにいます","Anjing ada di taman.",1),
    ex("公園の前の犬です","こうえんのまえのいぬです","Anjing di depan taman.",2)
  ];
  if(/上|下|前|後ろ|右|左|中|外|隣|近く|間/.test(J)) return [
    ex("机の"+J+"に本があります","つくえの"+K+"にほんがあります","Di "+mc+" meja ada buku.",0),
    ex("本は机の"+J+"にあります","ほんはつくえの"+K+"にあります","Buku ada di "+mc+" meja.",1),
    ex("机の"+J+"の本です","つくえの"+K+"のほんです","Buku di "+mc+" meja.",2)
  ];
  return [
    ex("公園に"+J+"が"+exVerb,"こうえんに"+K+"が"+exVerbK,"Di taman ada "+mc+".",0),
    ex(J+"は公園に"+exVerb,K+"はこうえんに"+exVerbK,mc+" ada di taman.",1),
    ex("公園の隣の"+J+"です","こうえんのとなりの"+K+"です","Ini "+mc+" di sebelah taman.",2)
  ];
};

// ---------- BAB 11 : Jumlah & Frekuensi (0:bilangan+V 1:期間に〜回 2:だけ) ----------
BUILDERS[11]=function(v,idx){
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  var mc=meanCore(v[3]);
  if(/ひとつ|ふたつ|みっつ|よっつ|いつつ|むっつ|ななつ|やっつ|ここのつ|とお|いくつ|一人|二人|〜人|人|台|枚|回/.test(J+K)) {
    var cnt = hasTilde(v[0]) ? fillTilde(v[0],v[1]) : {jp:J,kana:K};
    return [
      ex("りんごを"+cnt.jp+"買います","りんごを"+cnt.kana+"かいます","Membeli apel "+mc+".",0),
      ex("1週間に2回買います","いっしゅうかんに2かいかいます","Membeli 2 kali seminggu.",1),
      ex(cnt.jp+"だけ買います",cnt.kana+"だけかいます","Hanya membeli "+mc+".",2)
    ];
  }
  if(isVerb(v)){
    var st=masuStem(J), stk=masuStem(K);
    return [
      ex("子どもが2人います","こどもが2人います","Ada 2 anak.",0),
      ex("1週間に3回"+J,stk+"ます","Seminggu 3 kali "+mc+".",1),
      ex("1時間だけ"+J,stk+"ます","Hanya 1 jam "+mc+".",2)
    ];
  }
  if(/時間|週間|か月|年|くらい|全部|みんな|だけ/.test(J+K)) return [
    ex("3時間勉強します","さんじかんべんきょうします","Belajar 3 jam.",0),
    ex("1週間に2回会います","いっしゅうかんに2かいあいます","Bertemu 2 kali seminggu.",1),
    ex("全部で500円だけです","ぜんぶで500えんだけです","Semuanya hanya 500 yen.",2)
  ];
  return [
    ex("りんごを3つ買います","りんごを3つかいます","Membeli 3 apel ("+mc+").",0),
    ex("1か月に1回会います","いっかげつに1かいあいます","Bertemu 1 kali sebulan.",1),
    ex(J+"だけです",K+"だけです","Hanya "+mc+".",2)
  ];
};

// ---------- BAB 12 : Perbandingan & Lampau (0:lampau KB/na 1:lampau KS-i 2:NはNより 3:どちらが 4:いちばん) ----------
BUILDERS[12]=function(v,idx){
  var mc=meanCore(v[3]);
  if(isNaAdj(v)){
    var b=naBase(v);
    return [
      ex("昨日は暇でした","きのうはひまでした","Kemarin senggang.",0),
      ex("東京は大阪より有名です","とうきょうはおおさかよりゆうめいです","Tokyo lebih terkenal dari Osaka.",2),
      ex("日本で富士山がいちばん有名です","にほんでふじさんが_いちばんゆうめいです".replace("_",""),"Di Jepang Fuji yang paling terkenal.",4)
    ];
  }
  if(isIAdj(v)){
    var f=iAdjForms(v);
    return [
      ex("昨日は"+f.past.jp+"です","きのうは"+f.past.kana+"です","Kemarin "+mc+".",1),
      ex("東京は大阪より"+f.pres.jp+"です","とうきょうはおおさかより"+f.pres.kana+"です","Tokyo lebih "+mc+" dari Osaka.",2),
      ex("東京と大阪とどちらが"+f.pres.jp+"ですか","とうきょうとおおさかとどちらが"+f.pres.kana+"ですか","Tokyo dan Osaka mana yang lebih "+mc+"?",3)
    ];
  }
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  if(/どちら|どちらも|ずっと|初めて/.test(J+K)) return [
    ex("東京と大阪とどちらがいいですか","とうきょうとおおさかとどちらがいいですか","Tokyo dan Osaka mana yang bagus?",3),
    ex("どちらもいいです","どちらもいいです","Dua-duanya bagus.",3),
    ex("ずっと東京よりいいです","ずっととうきょうよりいいです","Jauh lebih bagus dari Tokyo.",2)
  ];
  return [
    ex("昨日は"+J+"でした","きのうは"+K+"でした","Kemarin adalah "+mc+".",0),
    ex(J+"は大阪よりいいです",K+"はおおさかよりいいです",mc+" lebih bagus dari Osaka.",2),
    ex("日本で"+J+"がいちばんいいです","にほんで"+K+"がいちばんいいです","Di Jepang "+mc+" yang paling bagus.",4)
  ];
};

// ---------- BAB 13 : Keinginan (0:Nが欲しい 1:Vたい 2:へ行く tujuan 3:どこか/何か) ----------
BUILDERS[13]=function(v,idx){
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  var mc=meanCore(v[3]);
  if(isVerb(v)){
    var st=masuStem(J), stk=masuStem(K);
    return [
      ex(st+"たいです",stk+"たいです","Ingin "+mc+".",1),
      ex("プールへ泳ぎに行きます".replace(/泳ぎ/,st),"プールへおよぎにいきます".replace(/およぎ/,stk),"Pergi ke kolam untuk "+mc+".",2),
      ex("どこかへ"+J,stk+"ます","Pergi ke suatu tempat untuk "+mc+".",3)
    ];
  }
  if(/欲しい|ほしい/.test(K)) return [
    ex("新しい鞄が欲しいです","あたらしいかばんがほしいです","Ingin tas baru.",0),
    ex("車が欲しいです","くるまがほしいです","Ingin mobil.",0),
    ex("何か欲しいですか","なにかほしいですか","Apakah ingin sesuatu?",3)
  ];
  if(/広い|狭い/.test(J+K)) {
    var f=iAdjForms(v);
    return [
      ex("広い部屋が欲しいです","ひろいへやがほしいです","Ingin kamar yang luas.",0),
      ex("どこか広い所へ行きたいです","どこかひろいところへいきたいです","Ingin pergi ke tempat luas.",1),
      ex("何か広い物が欲しいですか","なにかひろいものがほしいですか","Apakah ingin sesuatu yang luas?",3)
    ];
  }
  if(/何か|どこか|ごろ/.test(J+K)) return [
    ex("何か食べたいです","なにかたべたいです","Ingin makan sesuatu.",1),
    ex("どこかへ行きたいです","どこかへいきたいです","Ingin pergi ke suatu tempat.",2),
    ex("3時ごろに来てください","さんじごろにきてください","Tolong datang sekitar jam 3.",3)
  ];
  return [
    ex(J+"が欲しいです",K+"がほしいです","Ingin "+mc+".",0),
    ex(J+"をしに行きたいです",K+"をしにいきたいです","Ingin pergi untuk "+mc+".",2),
    ex("どこかで"+J+"を買いたいです","どこかで"+K+"をかいたいです","Ingin membeli "+mc+" di suatu tempat.",3)
  ];
};

// ---------- BAB 14 : Bentuk Te (0:grup 1:perubahan te 2:てください 3:ています 4:ましょうか) ----------
BUILDERS[14]=function(v,idx,L){
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  var mc=meanCore(v[3]);
  var lid=14;
  // find vocab index: need idx — caller passes idx; use closure via arguments? use vGroup with lid+idx needs idx; we get idx as 2nd param
  var myIdx=arguments[1];
  if(isVerb(v)){
    var t=tePair(J,K,lid,myIdx);
    var stem=masuStem(J), stemK=masuStem(K);
    return [
      ex(t.jp+"ください",t.kana+"ください","Tolong "+mc+".",2),
      ex("今"+t.jp+"います","いま"+t.kana+"います","Sekarang sedang "+mc+".",3),
      ex(stem+"ましょうか",stemK+"ましょうか","Bagaimana kalau saya "+mc+"?",4)
    ];
  }
  return [
    ex(J+"を開けてください",K+"をあけてください","Tolong buka "+mc+".",2),
    ex("今"+J+"を使っています","いま"+K+"をつかっています","Sekarang sedang memakai "+mc+".",3),
    ex(J+"をしましょうか",K+"をしましょうか","Bagaimana kalau saya simpan "+mc+"?",4)
  ];
};

// ---------- BAB 15 : Izin & Larangan (0:てもいいですか 1:てはいけません 2:ています keadaan) ----------
BUILDERS[15]=function(v,idx){
  var lid=15;
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  var mc=meanCore(v[3]);
  if(isVerb(v)){
    var t=tePair(J,K,lid,idx);
    return [
      ex(t.jp+"もいいですか",t.kana+"もいいですか","Bolehkah "+mc+"?",0),
      ex("ここで"+t.jp+"はいけません","ここで"+t.kana+"はいけません","Di sini tidak boleh "+mc+".",1),
      ex("私はもう"+t.jp+"います","わたしはもう"+t.kana+"います","Saya sudah "+mc+" (keadaan).",2)
    ];
  }
  return [
    ex(J+"を見てもいいですか",K+"をみてもいいですか","Bolehkah melihat "+mc+"?",0),
    ex("ここで写真を撮ってはいけません","ここでしゃしんをとってはいけません","Di sini tidak boleh memotret ("+mc+").",1),
    ex("私は"+J+"を知っています","わたしは"+K+"をしっています","Saya kenal "+mc+".",2)
  ];
};

// ---------- BAB 16 : Urutan & Ciri (0:VてVてVます 1:Vてから 2:NはNがKS) ----------
BUILDERS[16]=function(v,idx){
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  var mc=meanCore(v[3]);
  var lid=16;
  if(isVerb(v)){
    var t=tePair(J,K,lid,idx);
    return [
      ex("朝起きて、シャワーを浴びて、学校へ行きます","あさおきて、シャワーをあびて、がっこうへいきます","Pagi bangun, mandi, lalu pergi sekolah ("+mc+").",0),
      ex(t.jp+"から、出かけます",t.kana+"から、でかけます","Setelah "+mc+", lalu pergi.",1),
      ex("マリアさんは髪が長いです","マリアさんはかみがながいです","Maria rambutnya panjang.",2)
    ];
  }
  if(isIAdj(v)){
    var f=iAdjForms(v);
    return [
      ex("起きて、食べて、出かけます","おきて、たべて、でかけます","Bangun, makan, lalu pergi.",0),
      ex("シャワーを浴びてから、電話します","シャワーをあびてから、でんわします","Setelah mandi, menelepon.",1),
      ex("マリアさんは髪が"+f.pres.jp+"です","マリアさんはかみが"+f.pres.kana+"です","Maria rambutnya "+mc+".",2)
    ];
  }
  // body parts / nouns
  return [
    ex("手を洗って、ご飯を食べて、出かけます","てをあらって、ごはんをたべて、でかけます","Cuci tangan, makan, lalu pergi.",0),
    ex("ご飯を食べてから、出かけます","ごはんをたべてから、でかけます","Setelah makan, pergi.",1),
    ex("マリアさんは"+J+"がきれいです","マリアさんは"+K+"がきれいです","Maria "+mc+"-nya cantik.",2)
  ];
};

// ---------- BAB 17 : Bentuk Nai (0:nai 1:ないでください 2:なければなりません 3:なくてもいい) ----------
BUILDERS[17]=function(v,idx){
  var lid=17;
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  var mc=meanCore(v[3]);
  if(isVerb(v)){
    var n=naiPair(J,K,lid,idx);
    return [
      ex(n.jp+"でください",n.kana+"でください","Tolong jangan "+mc+".",1),
      ex(J+"なければなりません",K+"なければなりません","Harus "+mc+".",2),
      ex(J+"なくてもいいです",K+"なくてもいいです","Tidak perlu "+mc+".",3)
    ];
  }
  return [
    ex("薬を飲まないでください","くすりをのまないでください","Tolong jangan minum obat ("+mc+").",1),
    ex("薬を飲まなければなりません","くすりをのまなければなりません","Harus minum obat.",2),
    ex("薬を飲まなくてもいいです","くすりをのまなくてもいいです","Tidak perlu minum obat.",3)
  ];
};

// ---------- BAB 18 : Bentuk Kamus (0:kamus 1:ことができる 2:趣味は〜こと 3:〜前に) ----------
BUILDERS[18]=function(v,idx){
  var lid=18;
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  var mc=meanCore(v[3]);
  if(isVerb(v)){
    var d=dictPair(J,K,lid,idx);
    return [
      ex("日本語を話すことができます","にほんごをはなすことができます","Bisa berbicara Jepang ("+mc+").",1),
      ex("私の趣味は"+d.jp+"ことです","わたしのしゅみは"+d.kana+"ことです","Hobi saya adalah "+mc+".",2),
      ex(d.jp+"前に、手を洗います",d.kana+"まえに、てをあらいます","Sebelum "+mc+", cuci tangan.",3)
    ];
  }
  if(/趣味|日記|お祈り|ピアノ|現金|課長|部長|社長|動物|馬/.test(J+K)) return [
    ex(J+"を弾くことができます",K+"をひくことができます","Bisa main "+mc+".",1),
    ex("私の趣味は"+J+"です","わたしのしゅみは"+K+"です","Hobi saya "+mc+".",2),
    ex("寝る前に"+J+"を見ます","ねるまえに"+K+"をみます","Sebelum tidur melihat "+mc+".",3)
  ];
  return [
    ex(J+"ができます",K+"ができます","Bisa "+mc+".",1),
    ex("私の趣味は"+J+"です","わたしのしゅみは"+K+"です","Hobi saya "+mc+".",2),
    ex("ご飯を食べる前に、手を洗います","ごはんをたべるまえに、てをあらいます","Sebelum makan ("+mc+"), cuci tangan.",3)
  ];
};

// ---------- BAB 19 : Bentuk Ta (0:ta 1:たことがある 2:たり〜たり 3:になる) ----------
BUILDERS[19]=function(v,idx){
  var lid=19;
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  var mc=meanCore(v[3]);
  if(isVerb(v)){
    var t=taPair(J,K,lid,idx);
    // ta -> takoto: replace た with たことがあります (for godan った->ったことが, etc.)
    return [
      ex(t.jp+"ことがあります",t.kana+"ことがあります","Pernah "+mc+".",1),
      ex("休みは"+t.jp+"り、寝たりします",t.kana+"り、ねたりします","Hari libur "+mc+" dan tidur-tiduran.",2),
      ex("だんだん上手になります","だんだんじょうずになります","Lama-lama menjadi mahir.",3)
    ];
  }
  if(isIAdj(v)){
    var f=iAdjForms(v);
    return [
      ex("富士山に登ったことがあります","ふじさんにのぼったことがあります","Pernah mendaki Fuji.",1),
      ex("休みは寝たり、テレビを見たりします","やすみはねたり、テレビをみたりします","Hari libur tidur dan nonton TV.",2),
      ex("だんだん"+f.ku.jp+"なります","だんだん"+f.ku.kana+"になります","Lama-lama menjadi "+mc+".",3)
    ];
  }
  if(isNaAdj(v)||/ゴルフ|相撲|お茶|日|調子/.test(J+K)){
    var b=naBase(v);
    return [
      ex("相撲を見たことがあります","すもうをみたことがあります","Pernah menonton sumo.",1),
      ex("休みはゴルフをしたり、寝たりします","やすみはゴルフをしたり、ねたりします","Hari libur main golf dan tidur.",2),
      ex("だんだん元気になります","だんだんげんきになります","Lama-lama menjadi sehat.",3)
    ];
  }
  return [
    ex("日本へ行ったことがあります","にほんへいったことがあります","Pernah pergi ke Jepang ("+mc+").",1),
    ex("休みは寝たり、散歩したりします","やすみはねたり、さんぽしたりします","Hari libur tidur dan jalan-jalan.",2),
    ex("だんだんよくなります","だんだんよくなります","Lama-lama membaik.",3)
  ];
};

// ---------- BAB 20 : Biasa vs Sopan (0:sopan 1:biasa 2:konjugasi biasa) ----------
BUILDERS[20]=function(v,idx){
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  var mc=meanCore(v[3]);
  if(isVerb(v)){
    var d=dictPair(J,K,20,idx);
    var n=naiPair(J,K,20,idx);
    var t=taPair(J,K,20,idx);
    return [
      ex(J+" (丁寧体です)",K+" (ていねいたいです)","Bentuk sopan: "+mc+".",0),
      ex(d.jp+" (普通体だ)",d.kana+" (ふつうたいだ)","Bentuk biasa: "+mc+".",1),
      ex("明日"+d.jp+"? うん、"+d.jp, "あした"+d.kana+"? うん、"+d.kana,"Besok "+mc+"? Ya.",2)
    ];
  }
  if(/僕|君|うん|うーん|こっち|そっち|あっち|どっち|みんな/.test(J+K)) return [
    ex("私は学生です","わたしはがくせいです","Saya murid (sopan).",0),
    ex("僕は学生だ","ぼくはがくせいだ","Aku murid (biasa).",1),
    ex("こっちは僕のだ","こっちはぼくのだ","Yang sini punyaku.",2)
  ];
  return [
    ex(J+"です (丁寧体)",K+"です (ていねいたい)","Bentuk sopan "+mc+".",0),
    ex(J+"だ (普通体)",K+"だ (ふつうたい)","Bentuk biasa "+mc+".",1),
    ex(J+"? うん、"+J,K+"? うん、"+K,"Apakah "+mc+"? Ya.",2)
  ];
};

// ---------- BAB 21 : Pendapat & Kutipan (0:と思う 1:と言いました 2:でしょう) ----------
BUILDERS[21]=function(v,idx){
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  var mc=meanCore(v[3]);
  if(isVerb(v)){
    var d=dictPair(J,K,21,idx);
    return [
      ex("明日は勝つと思います","あしたはかつとおもいます","Saya kira besok menang.",0),
      ex("先生は休むと言いました","せんせいはやすむといいました","Guru berkata akan libur.",1),
      ex(d.jp+"でしょう",d.kana+"でしょう","Bukankah akan "+mc+"?",2)
    ];
  }
  return [
    ex(J+"は便利だと思います",K+"はべんりだと思います","Saya kira "+mc+" praktis.",0),
    ex("先生は"+J+"だと言いました","せんせいは"+K+"だといいました","Guru berkata itu "+mc+".",1),
    ex(J+"でしょう",K+"でしょう","Bukankah "+mc+"?",2)
  ];
};

// ---------- BAB 22 : Modifikasi KB (0:anak kalimat 1:[V]N 2:[Adj]N) ----------
BUILDERS[22]=function(v,idx){
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  var mc=meanCore(v[3]);
  if(isVerb(v)){
    var t=taPair(J,K,22,idx);
    var d=dictPair(J,K,22,idx);
    var te=tePair(J,K,22,idx);
    return [
      ex("昨日"+t.jp+"人です","きのう"+t.kana+"ひとです","Orang yang "+mc+" kemarin.",0),
      ex(d.jp+"人がいます",d.kana+"ひとがいます","Ada orang yang "+mc+".",1),
      ex(te.jp+"いる人です",te.kana+"いるひとです","Orang yang sedang "+mc+".",2)
    ];
  }
  return [
    ex("昨日買った"+J+"です","きのうかった"+K+"です","Ini "+mc+" yang dibeli kemarin.",0),
    ex("眼鏡をかけている"+J+"です","めがねをかけている"+K+"です","Ini "+mc+" yang berkacamata.",1),
    ex("新しい"+J+"です","あたらしい"+K+"です","Ini "+mc+" yang baru.",2)
  ];
};

// ---------- BAB 23 : Toki & Syarat (0:とき 1:と 2:を lewat) ----------
BUILDERS[23]=function(v,idx){
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  var mc=meanCore(v[3]);
  if(isVerb(v)){
    var d=dictPair(J,K,23,idx);
    var n=naiPair(J,K,23,idx);
    return [
      ex(d.jp+"とき、聞きます",d.kana+"とき、ききます","Ketika "+mc+", saya bertanya.",0),
      ex(d.jp+"と、音がします",d.kana+"と、おとがします","Begitu "+mc+", berbunyi.",1),
      ex("橋を渡ります","はしをわたります","Menyeberangi jembatan.",2)
    ];
  }
  if(isIAdj(v)){
    var f=iAdjForms(v);
    return [
      ex(f.pres.jp+"とき、出かけません",f.pres.kana+"とき、でかけません","Ketika "+mc+", tidak pergi.",0),
      ex("寂しいと、電話します","さびしいと、でんわします","Begitu kesepian, menelepon.",1),
      ex("道を歩きます","みちをあるきます","Berjalan di jalan.",2)
    ];
  }
  return [
    ex("信号のとき、止まります","しんごうのとき、とまります","Ketika lampu lalu lintas ("+mc+"), berhenti.",0),
    ex("右へ曲がると、駅があります","みぎへまがると、えきがあります","Begitu belok kanan, ada stasiun.",1),
    ex("橋を"+J+"ます","はしを"+K+"ます","Melewati jembatan "+mc+".",2)
  ];
};

// ---------- BAB 24 : Memberi/Menerima (0:てあげる 1:てもらう 2:てくれる) ----------
BUILDERS[24]=function(v,idx){
  var lid=24;
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  var mc=meanCore(v[3]);
  if(isVerb(v)){
    var t=tePair(J,K,lid,idx);
    return [
      ex("友達に"+t.jp+"あげます","ともだちに"+t.kana+"あげます","Melakukan "+mc+" untuk teman.",0),
      ex("先生に"+t.jp+"もらいます","せんせいに"+t.kana+"もらいます","Menerima bantuan "+mc+" dari guru.",1),
      ex("友達が"+t.jp+"くれます","ともだちが"+t.kana+"くれます","Teman berbaik hati "+mc+" untuk saya.",2)
    ];
  }
  return [
    ex("友達に"+J+"を買ってあげます","ともだちに"+K+"をかってあげます","Membelikan "+mc+" untuk teman.",0),
    ex("先生に"+J+"を教えてもらいます","せんせいに"+K+"をおしえてもらいます","Menerima ajaran "+mc+" dari guru.",1),
    ex("母が"+J+"を送ってくれます","ははが"+K+"をおくってくれます","Ibu mengirimkan "+mc+" untuk saya.",2)
  ];
};

// ---------- BAB 25 : Pengandaian (0:たら 1:ても) ----------
BUILDERS[25]=function(v,idx){
  var lid=25;
  var J=jpBase(v[0]), K=kanaBase(v[1]);
  var mc=meanCore(v[3]);
  if(isVerb(v)){
    var t=taPair(J,K,lid,idx);
    var te=tePair(J,K,lid,idx);
    function tara(s){ return s.replace(/た$/,"たら"); }
    return [
      ex(tara(t.jp)+",出かけます",tara(t.kana)+",でかけます","Kalau sudah "+mc+", saya pergi.",0),
      ex(te.jp+"も、大丈夫です",te.kana+"も、だいじょうぶです","Walaupun "+mc+", tidak apa-apa.",1),
      ex("もし"+tara(t.jp)+",教えてください", "もし"+tara(t.kana)+",おしえてください","Jika sudah "+mc+", tolong beri tahu.",0)
    ];
  }
  if(/もし/.test(J+K)) return [
    ex("もし雨が降ったら、出かけません","もしあめがふったら、でかけません","Jika hujan, tidak pergi.",0),
    ex("雨が降っても、出かけます","あめがふっても、でかけます","Walaupun hujan, tetap pergi.",1),
    ex("もし暇だったら、来てください","もしひまだったら、きてください","Jika senggang, tolong datang.",0)
  ];
  return [
    ex(J+"だったら、出かけます",K+"だったら、でかけます","Kalau "+mc+", saya pergi.",0),
    ex(J+"でも、大丈夫です",K+"でも、だいじょうぶです","Walaupun "+mc+", tidak apa-apa.",1),
    ex("もし"+J+"だったら、教えてください","もし"+K+"だったら、おしえてください","Jika "+mc+", tolong beri tahu.",0)
  ];
};

//__APPEND__
function vocabCandidates(v,lid,idx){
  var out=[];
  var jb=jpBase(v[0]);
  if(jb) out.push(jb);
  var raw=String(v[0]||"");
  if(/〜|~/.test(raw)){
    // base without tilde, e.g. さん, 人, 歳
    var b=raw.replace(/〜|~/g,"").replace(/\[.*?\]/g,"");
    if(b) out.push(b);
  }
  if(isVerb(v)){
    try{
      var st=masuStem(jb); if(st) out.push(st);
      var t=tePair(jb,kanaBase(v[1]),lid,idx); out.push(t.jp);
      var n=naiPair(jb,kanaBase(v[1]),lid,idx); out.push(n.jp);
      var ta=taPair(jb,kanaBase(v[1]),lid,idx); out.push(ta.jp);
      var d=dictPair(jb,kanaBase(v[1]),lid,idx); out.push(d.jp);
    }catch(e){}
  }
  if(isIAdj(v)){ try{ var f=iAdjForms(v); out.push(f.pres.jp,f.neg.jp,f.past.jp,f.ku.jp); }catch(e){} }
  if(isNaAdj(v)){ var nb=naBase(v); out.push(nb.jp); }
  return out.filter(function(s){return s&&s.length>=1;});
}
function containsVocab(jp,v,lid,idx){
  var J=String(jp||"");
  var cands=vocabCandidates(v,lid,idx);
  for(var i=0;i<cands.length;i++){ if(cands[i]&&J.indexOf(cands[i])>=0) return true; }
  // tilde fillers: check filled form
  if(hasTilde(v[0])){
    var f=fillTilde(v[0],v[1]);
    if(f.jp&&J.indexOf(f.jp)>=0) return true;
    // e.g. 日本人 contains 人
    var b=String(v[0]).replace(/〜|~/g,"");
    if(b&&J.indexOf(b)>=0) return true;
  }
  return false;
}
function fallbackEx(v,lid,pat,tag,variant){
  var J=jpBase(v[0])||v[0], K=kanaBase(v[1])||v[1];
  var mc=meanCore(v[3]);
  if(hasTilde(v[0])){ var f=fillTilde(v[0],v[1]); J=f.jp; K=f.kana; }
  var npat=3;
  try{ npat=(LESSONS_SRC.filter(function(x){return x.id===lid;})[0].grammar||[]).length||3; }catch(e){}
  var p=(typeof pat==="number"&&pat>=0&&pat<npat)?pat:0;
  var vv=(typeof variant==="number")?variant%3:0;
  var verb=isVerb(v);
  function V(stemJ,stemK,midJ,midK,endJ,endK,meanPre){
    return ex(stemJ+midJ+endJ,stemK+midK+endK,meanPre+" "+mc+" ("+tag+").",p);
  }
  // 3 distinct variants, all containing J/stem
  if(verb){
    var st=masuStem(J), stk=masuStem(K);
    if(vv===0){
      if(lid===1) return ex("私は"+J+"ます","わたしは"+K+"ます","Saya "+mc+".",p);
      return ex("毎日"+J,"まいにち"+K,"Setiap hari "+mc+".",p);
    }
    if(vv===1) return ex("昨日は"+st+"ませんでした","きのうは"+stk+"ませんでした","Kemarin tidak "+mc+".",p);
    return ex("明日も"+J,"あしたも"+K,"Besok juga "+mc+".",p);
  }
  // nouns / adjectives / phrases
  if(vv===0){
    if(lid===1) return ex("私は"+J+"です","わたしは"+K+"です","Saya "+mc+".",p);
    if(lid===2) return ex("これは"+J+"です","これは"+K+"です","Ini "+mc+".",p);
    if(lid===3) return ex("ここは"+J+"です","ここは"+K+"です","Di sini "+mc+".",p);
    return ex("これは"+J+"です","これは"+K+"です","Ini "+mc+".",p);
  }
  if(vv===1){
    if(lid===1) return ex("ミラーさんは"+J+"じゃありません","ミラーさんは"+K+"じゃありません","Miller bukan "+mc+".",p);
    return ex("それは"+J+"じゃありません","それは"+K+"じゃありません","Itu bukan "+mc+".",p);
  }
  if(lid===1) return ex("あなたは"+J+"ですか","あなたは"+K+"ですか","Apakah Anda "+mc+"?",p);
  return ex("これは"+J+"ですか","これは"+K+"ですか","Apakah ini "+mc+"?",p);
}
function buildAll(lessonData){
  var out={};
  (lessonData||[]).forEach(function(L){
    var lid=L.id;
    var npat=(L.grammar||[]).length||1;
    L.vocab.forEach(function(v,i){
      var fn=BUILDERS[lid]||BUILD_GENERIC;
      var arr=null;
      try{ arr=fn(v,i,L); }
      catch(e){ arr=[ex(v[0],v[1],meanFull(v[3]),0),ex(v[0],v[1],meanFull(v[3]),0),ex(v[0],v[1],meanFull(v[3]),0)]; }
      if(!arr||arr.length<3){
        var b=arr||[];
        while(b.length<3) b.push(ex(v[0],v[1],meanFull(v[3]),0));
        arr=b;
      }
      // safety net: every example must contain the vocab; fix pat range
      for(var s=0;s<arr.length;s++){
        var e=arr[s];
        var p=Number(e.pat);
        if(!Number.isInteger(p)||p<0||p>=npat) e.pat=s%npat;
        if(!containsVocab(e.jp,v,lid,i)){
          arr[s]=fallbackEx(v,lid,e.pat,"bab "+lid,s);
        }
        // ensure kana/mean non-empty
        if(!arr[s].kana) arr[s].kana=v[1];
        if(!arr[s].mean) arr[s].mean=meanFull(v[3]);
      }
      out[lid+"-"+i]=arr;
    });
  });
  return out;
}
function BUILD_GENERIC(v,idx,L){
  var npat=(L.grammar||[]).length||1;
  return [ex(v[0],v[1],meanFull(v[3]),0),ex(v[0],v[1],meanFull(v[3]),1%npat),ex(v[0],v[1],meanFull(v[3]),2%npat)];
}
var MNN_EXAMPLES=buildAll(LESSONS_SRC);
ROOT.MNN_EXAMPLES=MNN_EXAMPLES;
ROOT.getVocabExamples=function(lid,idx){
  var k=lid+"-"+idx;
  if(ROOT.MNN_EXAMPLES&&ROOT.MNN_EXAMPLES[k]) return ROOT.MNN_EXAMPLES[k];
  return [];
};
var _patCache=null;
ROOT.getPatternVocabs=function(lid,pat){
  if(!_patCache){
    _patCache={};
    Object.keys(MNN_EXAMPLES).forEach(function(k){
      var l=Number(String(k).split("-")[0]);
      (MNN_EXAMPLES[k]||[]).forEach(function(s){
        var kk=l+"-"+s.pat;
        if(!_patCache[kk])_patCache[kk]=[];
        if(_patCache[kk].indexOf(k)<0)_patCache[kk].push(k);
      });
    });
  }
  return _patCache[lid+"-"+pat]||[];
};
if(typeof module!=="undefined"&&module.exports){ module.exports={MNN_EXAMPLES:MNN_EXAMPLES,buildAll:buildAll,VERB_GROUP:VERB_GROUP}; }
})();
