// validate-mnn-examples.js — Node validator for mnn-data.js + mnn-examples.js
// Usage: node validate-mnn-examples.js
const fs = require('fs');
const path = require('path');
const dir = __dirname;
function load(p){
  const s = fs.readFileSync(path.join(dir,p),'utf8');
  const fn = new Function(s + '\n;return {LESSON_DATA_FALLBACK: (typeof LESSON_DATA_FALLBACK!=="undefined"?LESSON_DATA_FALLBACK:null), MNN_EXAMPLES: (typeof MNN_EXAMPLES!=="undefined"?MNN_EXAMPLES:null), buildAll: (typeof buildAll!=="undefined"?buildAll:null)};');
  return fn();
}
const d1 = load('mnn-data.js');
const D = d1.LESSON_DATA_FALLBACK;
if(!D){ console.error('FAIL: LESSON_DATA_FALLBACK not found'); process.exit(1); }
// load examples with LESSON_DATA_FALLBACK in scope
const a = fs.readFileSync(path.join(dir,'mnn-data.js'),'utf8');
const b = fs.readFileSync(path.join(dir,'mnn-examples.js'),'utf8');
const fn2 = new Function(a + '\n' + b + '\n;return {MNN_EXAMPLES:(typeof MNN_EXAMPLES!=="undefined"?MNN_EXAMPLES:(typeof window!=="undefined"&&window.MNN_EXAMPLES?window.MNN_EXAMPLES:null))};');
let MNN_EXAMPLES=null;
try{ MNN_EXAMPLES = fn2().MNN_EXAMPLES; }catch(e){ console.error('FAIL loading examples:',e.message); process.exit(1); }
if(!MNN_EXAMPLES){ console.error('FAIL: MNN_EXAMPLES not built'); process.exit(1); }

let total=0, covered=0, missing=[];
let lt3=[];
let totalEx=0;
let invJp=0, invKana=0, invMean=0, invPat=0;
let badPatDetails=[];
let dupCount=0;
let seen=new Set();
// Kanji -> kana checks: if jp has kanji, kana must be non-empty and different
const KANJI_RE = /[㐀-䶿一-鿿豈-﫿぀-ヿ]/u;
const KANJI_RE_SIMPLE = /[一-鿿]/;
const hasKanji = (s)=> KANJI_RE_SIMPLE.test(String(s||""));
let kanjiExBad=0, kanjiExDetails=[];
let kanjiVocabBad=0, kanjiVocabDetails=[];
let kanjiBankBad=0, kanjiBankDetails=[];
const patLen={};
D.forEach(l=>{ patLen[l.id]=l.grammar.length; total+=l.vocab.length; });
Object.keys(patLen).forEach(()=>{});
// vocab-level kanji check (mnn-data.js)
D.forEach(l=>{
  l.vocab.forEach((w,i)=>{
    const jp=w[0], kana=w[1];
    if(hasKanji(jp)){
      if(!kana||!String(kana).trim()||String(kana)===String(jp)){
        kanjiVocabBad++;
        if(kanjiVocabDetails.length<20) kanjiVocabDetails.push({k:l.id+'-'+i,jp,kana});
      }
    }
  });
});
D.forEach(l=>{
  l.vocab.forEach((w,i)=>{
    const k=l.id+'-'+i;
    const arr=MNN_EXAMPLES[k];
    if(!arr||!arr.length){ missing.push({k,word:w[0]}); return; }
    covered++;
    if(arr.length<3) lt3.push({k,word:w[0],n:arr.length});
    totalEx+=arr.length;
    arr.forEach((s,si)=>{
      if(!s.jp||!String(s.jp).trim()) invJp++;
      if(!s.kana||!String(s.kana).trim()) invKana++;
      if(!s.mean||!String(s.mean).trim()) invMean++;
      if(hasKanji(s.jp)){
        if(!s.kana||!String(s.kana).trim()||String(s.kana)===String(s.jp)){
          kanjiExBad++;
          if(kanjiExDetails.length<20) kanjiExDetails.push({k,si,jp:s.jp,kana:s.kana});
        }
      }
      const p=Number(s.pat);
      if(!Number.isInteger(p)||p<0||p>=(patLen[l.id]||1)){ invPat++; badPatDetails.push({k,si,pat:s.pat,max:patLen[l.id]}); }
      const key=s.jp+'||'+s.kana;
      if(seen.has(key)) dupCount++;
      else seen.add(key);
    });
  });
});
// pattern bank check (index.html hardcoded patternDetail bank examples)
try{
  const html = fs.readFileSync(path.join(dir,'index.html'),'utf8');
  const bStart = html.indexOf('const bank={');
  if(bStart>=0){
    const bEnd = html.indexOf('};', bStart);
    const bankSrc = html.slice(bStart, bEnd>=0?bEnd+2:undefined);
    const tripleRe = /\["([^"]*)","([^"]*)","([^"]*)"\]/g;
    let m, n=0;
    while((m=tripleRe.exec(bankSrc))){
      n++;
      const jp=m[1], kana=m[2];
      if(hasKanji(jp)){
        if(!kana||!kana.trim()||kana===jp){
          kanjiBankBad++;
          if(kanjiBankDetails.length<20) kanjiBankDetails.push({n,jp,kana});
        }
      }
    }
  }
  // PAT_INFO coverage: expect 91 pola (25 bab)
  const pStart = html.indexOf('const PAT_INFO={');
  if(pStart>=0){
    const pEnd = html.indexOf('\n};', pStart);
    const patSrc = html.slice(pStart, pEnd>=0?pEnd:undefined);
    const keyRe = /"(\d+)-(\d+)":\{/g;
    let km, keys=[];
    while((km=keyRe.exec(patSrc))) keys.push(km[0]);
    globalThis.__PAT_INFO_COUNT = keys.length;
  } else globalThis.__PAT_INFO_COUNT = 0;
  // TTS-kana check: speak buttons must use kana (e[1]/s.kana/W[1]/v[1]/w.kana, or kana||jp fallback).
  // Only jp-only references without kana fallback are violations (latihan tokens like t/q.answer/ans are Japanese at runtime).
  const speakRe = /data-t="\$\{esc\(([^}]+)\)\}"/g;
  let sm, ttsBadList=[];
  while((sm=speakRe.exec(html))){
    const inner=sm[1];
    if(/(^|[^.\w])(e\[0\]|s\.jp|W\[0\]|v\[0\]|w\.jp)([^.\w]|$)/.test(inner) && inner.indexOf('||')<0) ttsBadList.push(inner.slice(0,60));
  }
  globalThis.__TTS_BAD = ttsBadList;
  globalThis.__PAT_EXPECTED = D.reduce((x,l)=>x+(l.grammar||[]).length,0);
}catch(e){ console.error('Bank check error: '+e.message); }
const orphan=Object.keys(MNN_EXAMPLES).filter(k=>{
  const m=k.split('-'); if(m.length!==2) return true;
  const lid=Number(m[0]), idx=Number(m[1]);
  const L=D.find(x=>x.id===lid);
  if(!L) return true;
  if(idx<0||idx>=L.vocab.length) return true;
  return false;
});
console.log('');
console.log('MNN EXAMPLE VALIDATION');
console.log('');
console.log('Total vocabulary : '+total);
console.log('Vocabulary covered: '+covered);
console.log('Missing vocabulary: '+(total-covered));
console.log('');
console.log('Minimum examples:');
console.log('3 per vocabulary');
console.log('');
console.log('Vocabulary with < 3 examples: '+lt3.length);
console.log('');
console.log('Total examples:');
console.log(totalEx);
console.log('');
console.log('Invalid JP   : '+invJp);
console.log('Invalid Kana : '+invKana);
console.log('Invalid Mean : '+invMean);
console.log('Invalid Pat  : '+invPat);
console.log('');
console.log('Kanji w/o kana (examples) : '+kanjiExBad);
console.log('Kanji w/o kana (vocab)    : '+kanjiVocabBad);
console.log('Kanji w/o kana (pat bank) : '+kanjiBankBad);
console.log('');
console.log('Duplicate sentences: '+dupCount);
console.log('Unused example keys: '+orphan.length);
console.log('');
const patInfoCount = globalThis.__PAT_INFO_COUNT||0;
const patExpected = globalThis.__PAT_EXPECTED||0;
const ttsBad = globalThis.__TTS_BAD||[];
console.log('PAT_INFO entries (expect '+patExpected+'): '+patInfoCount);
console.log('Speak buttons w/o kana   : '+ttsBad.length);
console.log('');
let pass = (total-covered)===0 && lt3.length===0 && invJp===0 && invKana===0 && invMean===0 && invPat===0 && orphan.length===0 && kanjiExBad===0 && kanjiVocabBad===0 && kanjiBankBad===0 && patInfoCount===patExpected && patExpected>0 && ttsBad.length===0;
if(pass) console.log('RESULT: PASS');
else{
  console.log('RESULT: FAIL');
  missing.slice(0,20).forEach(m=>console.log('[FAIL] Vocabulary: '+m.k+' Word: '+m.word+' Reason: missing'));
  lt3.slice(0,20).forEach(m=>console.log('[FAIL] Vocabulary: '+m.k+' Word: '+m.word+' Reason: only '+m.n+' examples'));
  badPatDetails.slice(0,20).forEach(m=>console.log('[FAIL] Key: '+m.k+' Reason: pattern ID '+m.pat+' invalid (max '+(m.max-1)+')'));
  orphan.slice(0,20).forEach(k=>console.log('[FAIL] Key: '+k+' Reason: orphan (no vocab)'));
  kanjiExDetails.forEach(m=>console.log('[FAIL] Kanji-kana examples: '+m.k+'#'+m.si+' jp="'+m.jp+'" kana="'+m.kana+'" Reason: kanji without distinct kana'));
  kanjiVocabDetails.forEach(m=>console.log('[FAIL] Kanji-kana vocab: '+m.k+' jp="'+m.jp+'" kana="'+m.kana+'" Reason: kanji without distinct kana'));
  kanjiBankDetails.forEach(m=>console.log('[FAIL] Kanji-kana pat-bank #'+m.n+' jp="'+m.jp+'" kana="'+m.kana+'" Reason: kanji without distinct kana'));
  if(patInfoCount!==patExpected) console.log('[FAIL] PAT_INFO entries: '+patInfoCount+' (expect '+patExpected+')');
  ttsBad.slice(0,10).forEach(t=>console.log('[FAIL] TTS speak w/o kana: data-t="'+t+'" Reason: TTS must use kana'));
}
process.exit(pass?0:1);
