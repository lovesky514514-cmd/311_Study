const DATA_URL='./data/library.json';
const KNOWLEDGE_URL='./data/knowledge.json';
const QUESTIONS_URL='./data/questions.json';
const RECALL_KEY='study311_recall_final_v1',WRONG_KEY='study311_wrong_final_v1',CLOZE_STATS_KEY='study311_cloze_stats_v1';
let LIB={docs:[],pages:[]},KNOWLEDGE=[],QUESTIONS=[],CURRENT=[],CURRENT_RECALL=null,CURRENT_QUIZ=null,QUIZ_LOCKED=false,QUIZ_POOL=[];
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const toast=m=>{const e=$('#toast');e.textContent=m;e.classList.add('show');clearTimeout(window.__t);window.__t=setTimeout(()=>e.classList.remove('show'),1500)};
const getJSON=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const saveJSON=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const GROUPS=[["最近发展区","潜在发展水平","实际发展水平","支架式教学","老师帮助学生","老师帮一下就会","在帮助下完成","稍微难一点","刚好不会","够不到","跳一跳够得着","自己不会别人帮就会"],["皮亚杰","图式","同化","顺应","平衡","感知运动阶段","前运算阶段","具体运算阶段","形式运算阶段","守恒","可逆性","去自我中心"],["维果茨基","最近发展区","文化历史","内化","支架"],["埃里克森","八阶段","信任对怀疑","自主对羞怯","主动对内疚","勤奋对自卑","同一性","亲密对孤独","繁衍对停滞","完美对绝望"],["科尔伯格","三水平六阶段","前习俗","习俗水平","后习俗","社会契约","普遍道德原则"],["外层系统","父母工作","父母单位","爸妈工作","爸妈工作的地方","爸爸妈妈工作","家长工作单位","儿童不直接参与"],["布朗芬布伦纳","生态系统","微观系统","中间系统","外层系统","宏观系统","时间系统","家庭学校关系"],["学在官府","惟官有学","惟官有器","惟官有书","官师合一","政教合一"],["六艺","礼乐射御书数","礼","乐","射","御","书","数"],["辟雍","天子大学","天子的大学"],["泮宫","诸侯大学","诸侯的大学"],["稷下学宫","齐国学府","百家争鸣中心","官家操办私家主持"],["成均","乐教机构"],["庠","养老教育","养老机构"],["校","军事训练","习武场所"],["孔子","有教无类","因材施教","启发诱导","不愤不启","不悱不发"],["孟子","性善论"],["荀子","性恶论","化性起伪"],["墨子","兼爱","非攻","尚贤"],["董仲舒","独尊儒术","罢黜百家"],["太学","中央官学"],["科举","进士科","选官"],["书院","朱熹","白鹿洞书院"],["癸卯学制","奏定学堂章程"],["壬戌学制","六三三学制"],["蔡元培","五育并举","思想自由","兼容并包"],["陶行知","生活教育","教学做合一"],["陈鹤琴","活教育"],["苏格拉底","产婆术","问答法"],["柏拉图","理想国"],["亚里士多德","自由教育"],["昆体良","雄辩术原理"],["夸美纽斯","大教学论","班级授课制"],["洛克","绅士教育","白板说"],["卢梭","自然教育","爱弥儿"],["裴斯泰洛齐","要素教育","教育心理学化"],["赫尔巴特","教育性教学","四段教学"],["福禄贝尔","幼儿园","恩物"],["蒙台梭利","感官教育","儿童之家"],["杜威","教育即生活","学校即社会","从做中学"],["桑代克","试误说","效果律"],["巴甫洛夫","经典性条件作用"],["斯金纳","操作性条件作用","强化"],["班杜拉","观察学习","社会学习","自我效能"],["布鲁纳","发现学习","认知结构"],["奥苏贝尔","有意义接受学习","先行组织者"],["学习动机","成就动机","归因","自我效能","需要层次"],["学习策略","认知策略","元认知策略","资源管理策略"],["迁移","学习迁移","正迁移","负迁移"],["知识建构","陈述性知识","程序性知识"],["技能","动作技能","心智技能"],["教育目的","培养目标","全面发展"],["课程","课程标准","课程计划","教材"],["教学原则","教学方法","教学组织形式"],["德育","德育原则","德育方法"],["师生关系","教师","学生"],["班主任","班级管理"],["教育制度","学制"],["教育公平","教育机会均等"],["教育功能","个体功能","社会功能"],["教育研究","研究方法","选题","文献综述"],["观察法","教育观察"],["调查法","问卷","访谈"],["实验法","教育实验","自变量","因变量","控制变量"],["信度","可靠性"],["效度","有效性"],["抽样","随机抽样","分层抽样"],["行动研究","教育行动研究"],["叙事研究","教育叙事"],["定性研究","质性研究"],["定量研究","量化研究"],["苏湖教法","苏基教法","范尖教法"],["三舍法","三全法"],["朱子读书法","朱子读书法"],["颜氏家训","颜氏家训","颜之推"],["鸿都门学","江都门学","鸿者门学","鸿都门学"],["文翁兴学","文首兴学","文革兴学","文区兴学","文翁兴学"],["社学","社学"]];
const STOP=new Set(['什么','怎么','怎样','哪个','哪种','属于','影响','帮助','老师','教师','学生','孩子','儿童','任务','问题','地方','东西','一下','自己','这个','那个','主要','进行','内容','相关','里面','知识','知识点','请问','为什么','是否','可以','应该','需要']);
function norm(s){return String(s||'').toLowerCase().replace(/[臺台]/g,'台').replace(/[裏裡]/g,'里').replace(/\s+/g,'').replace(/[，。！？；：、“”‘’（）()【】\[\]《》<>·—\-_,.!?:;'"/\\|]/g,'')}
function seg(s){const n=norm(s),set=new Set();try{for(const x of new Intl.Segmenter('zh-CN',{granularity:'word'}).segment(String(s||''))){const t=norm(x.segment);if(t.length>=2)set.add(t)}}catch{}if(!set.size){for(let i=0;i<n.length-1;i++)set.add(n.slice(i,i+2))}if(n.length>=2&&n.length<=6)set.add(n);return [...set]}
function expand(q){const n=norm(q),set=new Set();for(const g of GROUPS){const key=norm(g[0]);const hit=(key&&n.includes(key))||g.slice(1).some(x=>{const t=norm(x);return t.length>=3&&n.includes(t)});if(hit)g.forEach(x=>set.add(norm(x)))}return [...set].filter(x=>x.length>=2)}
function occ(h,n){let c=0,p=0;if(!n)return 0;while((p=h.indexOf(n,p))>=0){c++;p+=n.length}return c}
function sourceBoost(p){let b=(p.doc==='d5'||p.doc==='d6')?10:((p.doc==='d2'||p.doc==='d4')?7:0);if(String(p.curated_text||'').length)b+=22;const q=Number(p.ocr_quality??.7);b+=Math.round((q-.55)*12);return b}
function qBigrams(s){const n=norm(s),a=[];for(let i=0;i<n.length-1;i++){const x=n.slice(i,i+2);if(!STOP.has(x))a.push(x)}return [...new Set(a)]}
function pageSearchText(p){return `${p.curated_text||''}\n${p.text||''}`}
const QCTX=new Map();
function queryCtx(q){let c=QCTX.get(q);if(c)return c;const nq=norm(q),terms=seg(q).filter(x=>x.length>=2&&!STOP.has(x)),aliases=expand(q),bg=qBigrams(q);c={nq,terms,aliases,bg};QCTX.set(q,c);if(QCTX.size>80)QCTX.delete(QCTX.keys().next().value);return c}
function pageScore(q,p){const {nq,terms,aliases,bg}=queryCtx(q),t=p.n||norm(pageSearchText(p));let s=0,matched=new Set();const exact=t.includes(nq);if(exact){s+=100;matched.add(nq)}for(const x of terms){const c=occ(t,x);if(c){s+=Math.min(36,9*c)+(x.length>=4?6:0);matched.add(x)}}let aliasHits=0;for(const x of aliases){const c=occ(t,x);if(c){aliasHits++;s+=Math.min(30,6*c)+(x.length>=4?4:0);matched.add(x)}}const coverage=terms.length?terms.filter(x=>t.includes(x)).length/terms.length:0;if(coverage>=.7)s+=22;else if(coverage>=.45)s+=10;const bgHits=bg.filter(x=>t.includes(x)).length,bgCoverage=bg.length?bgHits/bg.length:0;if(!exact&&!aliasHits&&coverage<.45&&nq.length>=6&&bgHits>=3&&bgCoverage>=.55)s+=12+Math.round(bgCoverage*14);s+=sourceBoost(p);const valid=exact||aliasHits>=1||coverage>=.45||(terms.length===1&&coverage===1)||(nq.length>=6&&bgHits>=3&&bgCoverage>=.55);return {score:s,matched:[...matched],coverage,aliasHits,bgCoverage,valid}}
function matchPct(x){if(x.score>=100)return Math.min(99,94+Math.round(Math.min(5,x.coverage*5)));return Math.max(45,Math.min(93,Math.round(45+x.coverage*38+Math.min(15,x.score/8))))}
function sentences(text){return String(text||'').replace(/\n+/g,'。').split(/(?<=[。！？；])/).map(x=>x.trim()).filter(x=>x.length>=6&&x.length<=260&&((x.match(/[\u4e00-\u9fff]/g)||[]).length>=4)&&!/^(关键词|相关表达)[:：]/.test(x))}
function sentenceScore(q,s){const n=norm(s),qn=norm(q);let v=0;if(n.includes(qn))v+=100;for(const x of seg(q))if(x.length>=2&&!STOP.has(x)&&n.includes(x))v+=9;let novel=0;for(const x of expand(q)){if(n.includes(x)){v+=5;if(!qn.includes(x)){v+=6;novel++}}}const relevant=v>0;if(relevant&&/^解释[:：]/.test(s))v+=22;if(relevant&&/是什么|含义|定义|指什么/.test(q)&&/定义|含义|是指|指的是|称为|叫做|就是/.test(s))v+=18;if(relevant&&/叫什么/.test(q)&&novel>0&&/称为|叫做|名称|设/.test(s))v+=26;if(relevant&&/为什么|原因|根本/.test(q)&&/原因|由于|因为|根本|导致|源于/.test(s))v+=16;if(relevant&&/特点|特征/.test(q)&&/特点|特征|表现/.test(s))v+=14;if(relevant&&/作用|意义|影响/.test(q)&&/作用|意义|影响|价值/.test(s))v+=14;if(relevant&&/阶段|时期/.test(q)&&/阶段|时期|岁/.test(s))v+=12;if(/[？?]/.test(s))v-=32;if(/下列|以下|哪一|不属于|正确的是|错误的是/.test(s))v-=24;return v}
function extractAnswer(q,rows){const k=cleanKnowledgeMatch(q);if(k){const p=findPage(k.doc,k.page)||rows[0]?.p;return cleanPromptPoints(k.prompt).map((s,i)=>({s,sc:100-i,p}))}const a=[];for(let ri=0;ri<Math.min(10,rows.length);ri++){const r=rows[ri],rankBonus=Math.max(0,20-ri*3);for(const s of sentences(r.p.text)){const sc=sentenceScore(q,s)+sourceBoost(r.p)+rankBonus;if(sc>0)a.push({s,sc,p:r.p})}}a.sort((x,y)=>y.sc-x.sc);const out=[],seen=new Set();for(const x of a){const n=norm(x.s);if(seen.has(n))continue;seen.add(n);out.push(x);if(out.length>=3)break}return out}
function bestExcerpt(q,text){const ss=sentences(text).map(s=>({s,v:sentenceScore(q,s)})).sort((a,b)=>b.v-a.v);if(ss[0]?.v>0)return ss.slice(0,3).map(x=>x.s).join(' ');return String(text||'').replace(/\n+/g,' ').slice(0,330)}
function highlight(t,q){let h=esc(t);for(const x of [q,...expand(q)].filter(x=>x.length>=2).sort((a,b)=>b.length-a.length).slice(0,8)){try{h=h.replace(new RegExp(x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),m=>`<mark>${m}</mark>`)}catch{}}return h}
function explanation(q,p){const k=cleanKnowledgeMatch(q);if(k){return {points:cleanPromptPoints(k.prompt),kws:[k.name,...(k.words||[])].filter((x,i,a)=>a.indexOf(x)===i).slice(0,5)}}const base=(p&&p.curated_text)?`${p.curated_text}\n${p.text||''}`:(p?.text||'');const ranked=sentences(base).map(s=>({s,v:sentenceScore(q,s)})).filter(x=>x.v>0).sort((a,b)=>b.v-a.v);const points=[];for(const x of ranked){if(!points.includes(x.s))points.push(x.s);if(points.length>=3)break}if(!points.length)points.push(bestExcerpt(q,p.text));const kws=[...new Set([...expand(q),...seg(q)].filter(x=>x.length>=2&&norm(p.text).includes(norm(x))))].slice(0,5);return {points,kws}}
function explainHTML(q,p){const e=explanation(q,p);return `<ol>${e.points.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>${e.kws.length?`<div class="meta">关键词：${esc(e.kws.join(' / '))}</div>`:''}`}
function docName(id){return LIB.docs.find(d=>d.id===id)?.name||id}
function findPage(doc,page){return LIB.pages.find(p=>p.doc===doc&&p.page===page)||null}
const EDU_HINT=/教育|学习|教学|课程|学生|教师|学校|学制|德育|心理|认知|动机|迁移|记忆|研究|法案|教育史|教育家|理论|儿童|发展区|大学|官学|私学|六艺|科举|书院|知识点|答案|解析|第[0-9一二三四五六七八九十]+题/;
function outOfDomain(q){if(EDU_HINT.test(q))return false;return [/量子色动力学/i,/显卡|超频|股票|天气|做饭|菜谱|彩票|游戏攻略/,/python.*(装饰器|代码|函数|怎么写|编程)/i,/总统是谁|谁是.{0,8}总统/].some(r=>r.test(q))}

function knowledgeMatches(q){
  const nq=norm(q);
  if(!nq)return[];
  const out=[];
  for(const k of KNOWLEDGE){
    const names=[k.name,...(k.aliases||[])];
    let best=0;
    for(const x of names){
      const nx=norm(x);
      if(!nx)continue;
      if(nq===nx)best=Math.max(best,3);
      else if(nq.length>=2&&nx.length>=2&&nq.includes(nx))best=Math.max(best,2);
      else if(nq.length>=2&&nx.length>=3&&nx.includes(nq))best=Math.max(best,1);
    }
    if(best)out.push({k,level:best});
  }
  return out.sort((a,b)=>b.level-a.level);
}
function knowledgeBoostFromMatches(matches,p){
  let best=0;
  for(const m of matches){
    if(m.k.doc===p.doc&&m.k.page===p.page){
      best=Math.max(best,m.level===3?240:(m.level===2?210:175));
    }
  }
  return best;
}

function coreQuery(q){
  return norm(q)
    .replace(/(是什么|什么意思|叫什么|有哪些|包括什么|为什么|怎么|怎样|如何|哪个|哪一个|属于什么|属于哪|请问|一下|主要|内容|特点|意义|作用|影响|正确的是|错误的是|不属于|注意事项|推荐|价格|预测|怎么写|怎么选|怎么装|怎么安装|几点|会涨吗|好不好|健康)/g,'');
}
function domainAllowed(q,matches=null){
  const km=matches||knowledgeMatches(q);
  if(km.length)return true;
  if(EDU_HINT.test(q))return true;
  const c=coreQuery(q);
  if(c.length<3)return false;
  if(/(教育|教学|学习|课程|学制|学宫|书院|学堂|官学|私学|德育|心理|认知|研究|理论|原则|方法|制度|学校|教师|学生|儿童|大学|科举|六艺|发展区|读书法|教法)$/.test(c))return true;
  // For rare 311 terms not present in the small alias table (e.g. 苏湖教法),
  // require the cleaned phrase itself to really exist in a framework/answer source.
  return LIB.pages.some(p=>['d2','d4','d5','d6'].includes(p.doc)&&(p.n||norm(p.text)).includes(c));
}
function questionBoostFrom(sq,p){if(!sq)return 0;if(p.doc===sq.q_doc&&p.page===sq.q_page)return 320;if(p.doc===sq.a_doc&&p.page===sq.a_page)return 310;return 0}
function searchQuery(q){
  if(!q)return[];
  const km=knowledgeMatches(q);
  if(outOfDomain(q)&&!km.length)return[];
  if(!domainAllowed(q,km))return[];
  const sq=structuredQuestion(q);
  return LIB.pages.map(p=>{
    const x=pageScore(q,p);
    const kb=knowledgeBoostFromMatches(km,p);
    const qb=questionBoostFrom(sq,p);
    const score=x.score+kb+qb;
    const lowQuality=Number(p.ocr_quality??.8)<0.38&&!p.curated_text;
    const valid=(x.valid||kb>0||qb>0)&&(!lowQuality||x.score>=100||kb>0||qb>0);
    const pct=qb>0?99:(kb>=210?99:(kb>0?97:matchPct({...x,score})));
    return {p,...x,score,valid,pct,kb};
  }).filter(x=>x.valid&&x.score>=16)
    .sort((a,b)=>b.score-a.score)
    .slice(0,40);
}
function search(){const q=$('#question').value.trim();if(!q)return;CURRENT=searchQuery(q);render(q,CURRENT)}
function wrongExists(q,p){return getJSON(WRONG_KEY).some(x=>x.doc===p.doc&&x.page===p.page&&norm(x.q||'')===norm(q||''))}
function addWrong(q,p,note=''){const arr=getJSON(WRONG_KEY);if(arr.some(x=>x.doc===p.doc&&x.page===p.page&&norm(x.q||'')===norm(q||''))){toast('已经在错题里');return false}arr.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),q:q||'知识点',doc:p.doc,page:p.page,text:p.text,note,created:Date.now()});saveJSON(WRONG_KEY,arr);toast('已加入错题');return true}
function getClozeStats(){return getJSON(CLOZE_STATS_KEY,{})}
function saveClozeStats(x){localStorage.setItem(CLOZE_STATS_KEY,JSON.stringify(x))}
function knowledgeForRecall(q,p){
  const km=knowledgeMatches(q);
  return km.find(m=>m.k.doc===p.doc&&m.k.page===p.page)?.k||km[0]?.k||null;
}
function chooseClozeVariant(k,forceDifferentId=null){
  const vs=(k?.cloze_variants||[]);
  if(!vs.length)return null;
  const st=getClozeStats()[k.name]||{attempts:0,correct:0,streak:0};
  let weights;
  if(st.attempts===0)weights=[.55,.35,.10];
  else if(st.streak<=0)weights=[.72,.23,.05];
  else if(st.streak<=2)weights=[.42,.43,.15];
  else if(st.streak<=4)weights=[.22,.48,.30];
  else weights=[.10,.35,.55];
  let pool=vs.map((v,i)=>({v,w:weights[Math.min(i,weights.length-1)]||.1}));
  if(forceDifferentId&&pool.length>1){const alt=pool.filter(x=>x.v.id!==forceDifferentId);if(alt.length)pool=alt}
  const total=pool.reduce((a,x)=>a+x.w,0);let r=Math.random()*total;
  for(const x of pool){r-=x.w;if(r<=0)return x.v}
  return pool[pool.length-1].v;
}
function updateClozeStats(name,good){
  if(!name)return;
  const all=getClozeStats(),s=all[name]||{attempts:0,correct:0,streak:0};
  s.attempts++;if(good){s.correct++;s.streak++}else{s.streak=0}
  all[name]=s;saveClozeStats(all);
}
function legacySafeVariant(q,p){
  const words=[...new Set([...expand(q),...seg(q)].filter(x=>x.length>=2&&String(p.text||'').includes(x)))];
  if(!words.length)return null;
  const a=words.sort((x,y)=>y.length-x.length)[0];
  const prompt=bestExcerpt(q,p.text);
  if(!prompt.includes(a))return null;
  return {id:'legacy-safe',level:1,label:'基础',text:prompt.replace(a,'【空1】'),answers:[a],kind:'detail'};
}
function addRecall(q,p){
  const k=knowledgeForRecall(q,p);
  const v=k?chooseClozeVariant(k):legacySafeVariant(q,p);
  if(!v){toast('这条资料没有合适的挖空内容');return false}
  const item={
    id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),
    q:k?.name||q,knowledgeName:k?.name||null,doc:p.doc,page:p.page,
    text:k?.prompt||p.curated_text||p.text,created:Date.now(),variantId:v.id
  };
  const arr=getJSON(RECALL_KEY);
  if(!arr.some(x=>x.knowledgeName&&x.knowledgeName===item.knowledgeName)||!item.knowledgeName){arr.push(item);saveJSON(RECALL_KEY,arr)}
  CURRENT_RECALL={...item,cloze:v};toast('已加入背诵');return true;
}
function structuredQuestion(q){
  const nq=norm(q).replace(/正确答案|答案是什么|答案|是什么|请问/g,'');
  const explicitNo=/第[0-9一二三四五六七八九十]+题/.test(q);
  let best=null;

  for(const item of QUESTIONS){
    const aliases=(item.aliases||[]).map(norm).filter(Boolean);
    const question=norm(item.question);
    const topic=norm(item.topic);
    let score=0;

    // Strongest: an exact or contained stable question alias.
    for(const a of aliases){
      if(nq===a)score=Math.max(score,300);
      else if(a.length>=4&&(nq.includes(a)||a.includes(nq)))score=Math.max(score,220);
    }

    // If the user explicitly says "第X题", allow chapter/knowledge-point style matching.
    if(explicitNo){
      const no=norm(`第${item.number}题`);
      if(nq.includes(no))score+=40;
      if(topic.length>=3&&nq.includes(topic))score+=80;
    }

    // Full-question lookup: only accept substantial text overlap, never one generic word.
    if(nq.length>=8){
      if(question.includes(nq)||nq.includes(question))score=Math.max(score,250);
      else{
        const terms=seg(q).filter(x=>x.length>=2&&!STOP.has(x));
        const hit=terms.filter(t=>question.includes(t)).length;
        const coverage=terms.length?hit/terms.length:0;
        if(hit>=3&&coverage>=0.6)score=Math.max(score,120+Math.round(coverage*50));
      }
    }

    if(score>=100&&(!best||score>best.score))best={item,score};
  }
  return best?.item||null;
}
function cleanKnowledgeMatch(q){const km=knowledgeMatches(q);return km.length?km[0].k:null}
function cleanPromptPoints(text){return String(text||'').split(/(?<=[。！？；])/).map(x=>x.trim()).filter(Boolean).slice(0,4)}
function displayExcerpt(q,p){const km=knowledgeMatches(q);const mapped=km.find(m=>m.k.doc===p.doc&&m.k.page===p.page);if(mapped)return mapped.k.prompt;if(p.curated_text){const ss=sentences(p.curated_text).map(s=>({s,v:sentenceScore(q,s)})).sort((a,b)=>b.v-a.v);if(ss[0]?.v>0)return ss.slice(0,3).map(x=>x.s).join(' ')}return bestExcerpt(q,p.text)}
function isQuestionRef(q){return /第[0-9一二三四五六七八九十]+题/.test(q)}
function correctedAnswer(q){
  const sq=structuredQuestion(q);
  if(sq){return {answer:sq.answer,explanation:sq.explanation||sq.reference||'',page:findPage(sq.a_doc,sq.answer_page||sq.a_page)||findPage(sq.q_doc,sq.question_page||sq.q_page),structured:sq};}
  if(!isQuestionRef(q))return null;
  const nq=norm(q)
    .replace(/正确答案|答案是什么|答案|是什么|请问/g,'');
  const focus=nq
    .replace(/第[一二三四五六七八九十0-9]+章/g,'')
    .replace(/知识点[一二三四五六七八九十0-9]+/g,'')
    .replace(/第[一二三四五六七八九十0-9]+题/g,'')
    .replace(/题库|应试|真题|解析/g,'');
  let best=null;
  for(const p of LIB.pages){
    if(!String(p.text||'').includes('【校对内容】'))continue;
    const blocks=String(p.text||'').split('【校对内容】');
    for(const b of blocks){
      const ans=(b.match(/答案[:：]\s*([A-D])/i)||[])[1];
      if(!ans)continue;
      const rel=(b.match(/相关表达[:：]\s*([^\n]+)/)||[])[1]||'';
      const title=(b.match(/题目[:：]\s*([^\n]+)/)||[])[1]||'';
      const hay=norm(title+' '+rel).replace(/正确答案|答案是什么|答案|是什么|请问/g,'');
      if(focus.length>=2&&!hay.includes(focus))continue;
      let score=0;
      if(hay.includes(nq)||nq.includes(hay))score+=100;
      for(const t of seg(q))if(t.length>=2&&hay.includes(t))score+=8;
      if(score>0&&(!best||score>best.score)){
        const exp=(b.match(/解释[:：]\s*([^\n]+)/)||[])[1]||'';
        best={answer:ans.toUpperCase(),explanation:exp,page:p,score};
      }
    }
  }
  return best;
}

function questionPage(item){
  return findPage(item.q_doc,item.question_page||item.q_page)||findPage(item.a_doc,item.answer_page||item.a_page)||null;
}
function isChoiceQuestion(item){return item?.type==='choice'}
function canGradeQuestion(item){return !!item?.answer_available && !!item?.answer && /^[ABCD]$/.test(item.answer)}
function hasReference(item){return !!item?.answer_available && !!(item.reference||item.explanation)}
function verificationLabel(item){
  if(item.verification==='verified')return '人工核对';
  if(item.verification==='high')return '高置信配对';
  return '待校验';
}
function addQuestionWrong(item,selected=''){
  const p=questionPage(item)||{doc:item.q_doc||'d3',page:item.question_page||item.q_page||1,text:item.raw_question||item.question};
  const ans=canGradeQuestion(item)?`，正确答案 ${item.answer}`:'';
  const note=selected?`刷题作答 ${selected}${ans}`:`${item.type_label||'题目'} · ${verificationLabel(item)}`;
  return addWrong(item.question,p,note);
}
function optionButtonsHTML(item){
  const opts=item.options||{};
  return 'ABCD'.split('').map(key=>{
    const text=opts[key]||'';
    const cls=text?'quiz-option':'quiz-option letter-only';
    return `<button class="${cls}" data-option="${esc(key)}" type="button">
      <span class="option-key">${esc(key)}</span>
      <span class="${text?'':'option-empty'}">${text?esc(text):'选择 '+esc(key)}</span>
    </button>`;
  }).join('');
}
function bindQuestionOptions(root,item,onDone){
  const buttons=$$('.quiz-option',root);
  let locked=false;
  buttons.forEach(btn=>btn.onclick=()=>{
    if(locked)return;
    const selected=btn.dataset.option;
    if(!canGradeQuestion(item)){
      buttons.forEach(b=>b.classList.toggle('selected',b===btn));
      onDone?.({good:null,selected,pending:true});
      return;
    }
    locked=true;
    const good=selected===item.answer;
    buttons.forEach(b=>{
      b.disabled=true;
      if(b.dataset.option===item.answer)b.classList.add('correct');
    });
    if(!good){
      btn.classList.remove('correct');btn.classList.add('wrong-choice');
      addQuestionWrong(item,selected);
    }else btn.classList.add('correct');
    onDone?.({good,selected,pending:false});
  });
}
function questionMeta(item){
  const bits=[item.source,item.subject,item.type_label||'题目'];
  if(item.year)bits.push(`${item.year}年`);
  if(item.number!=null)bits.push(`第${item.number}题`);
  if(item.question_page)bits.push(`试题册第${item.question_page}页`);
  return bits.filter(Boolean).join(' · ');
}
function renderStatusTags(item){
  const v=item.verification==='pending'?'pending':'ok';
  const oq=item.ocr_quality==='rough'?'rough':'';
  const arr=[
    `<span class="qtag ${v}">${esc(verificationLabel(item))}</span>`,
    `<span class="qtag ${oq}">OCR ${item.ocr_quality==='good'?'较清晰':item.ocr_quality==='usable'?'可用':'较粗糙'}</span>`
  ];
  if(item.options_complete&&isChoiceQuestion(item))arr.push('<span class="qtag ok">选项已拆分</span>');
  else if(isChoiceQuestion(item))arr.push('<span class="qtag pending">选项按原题显示</span>');
  if(item.answer_page)arr.push(`<span class="qtag">解析册第${item.answer_page}页</span>`);
  return arr.join('');
}
function renderInlineQuestion(item){
  const box=$('#answerQuiz');
  $('#answerBox').classList.add('has-quiz');box.classList.remove('hidden');
  if(!isChoiceQuestion(item)){
    box.innerHTML=`<div class="quiz-question">${esc(item.question)}</div><div class="meta">${esc(questionMeta(item))}</div><div class="actions"><button class="link" type="button">主观题请到“刷题”页作答</button></div>`;
    return;
  }
  box.innerHTML=`<div class="quiz-question ${item.options_complete?'':'raw-choice'}">${esc(item.question)}</div>
    <div class="quiz-options">${optionButtonsHTML(item)}</div><div class="quiz-feedback hidden"></div>
    <div class="actions"><button class="link reveal-answer" type="button">${canGradeQuestion(item)?'显示答案':'答案待校验'}</button></div>`;
  const feedback=$('.quiz-feedback',box);
  const showFeedback=(good,selected,pending=false)=>{
    feedback.classList.remove('hidden');
    if(pending){feedback.className='quiz-feedback';feedback.textContent='本题解析尚未可靠配对，已记录你的选择但暂不判分。';return}
    feedback.className='quiz-feedback '+(good?'good':'bad');
    feedback.textContent=good?'回答正确':`回答错误，正确答案 ${item.answer}`;
    $('#answerExplain').classList.remove('hidden');
    $('#answerExplainBody').innerHTML=`<div>${esc(item.explanation||item.reference||'')}</div>`;
  };
  bindQuestionOptions(box,item,showFeedback);
  $('.reveal-answer',box).onclick=()=>{
    if(!canGradeQuestion(item)){showFeedback(null,'',true);return}
    const btn=$(`.quiz-option[data-option="${item.answer}"]`,box);
    if(btn){$$('.quiz-option',box).forEach(b=>b.disabled=true);btn.classList.add('correct')}
    showFeedback(true,item.answer,false);
  };
}
function clearInlineQuestion(){
  $('#answerBox').classList.remove('has-quiz');$('#answerQuiz').classList.add('hidden');$('#answerQuiz').innerHTML='';
}
function getQuizFilters(){
  return {
    source:$('#quizSource')?.value||'',
    subject:$('#quizSubject')?.value||'',
    type:$('#quizType')?.value||'',
    status:$('#quizStatus')?.value||'',
    keyword:($('#quizKeyword')?.value||'').trim()
  };
}
function rebuildQuizPool(){
  const f=getQuizFilters(), nk=norm(f.keyword);
  QUIZ_POOL=QUESTIONS.filter(q=>{
    if(f.source&&q.source!==f.source)return false;
    if(f.subject&&q.subject!==f.subject)return false;
    if(f.type&&q.type!==f.type)return false;
    if(f.status==='gradeable'&&!q.answer_available)return false;
    if(f.status==='pending'&&q.answer_available)return false;
    if(nk){
      const hay=norm([q.question,q.topic,q.chapter,q.knowledge_point,q.year,q.number].join(' '));
      if(!hay.includes(nk))return false;
    }
    return true;
  });
  const gradeable=QUIZ_POOL.filter(q=>q.answer_available).length;
  const subj=QUIZ_POOL.filter(q=>q.type!=='choice').length;
  $('#quizPoolMeta').textContent=`当前 ${QUIZ_POOL.length} 题 · 可判分/有参考答案 ${gradeable} · 主观题 ${subj}`;
  return QUIZ_POOL;
}
function chooseRandomQuestion(){
  if(!QUIZ_POOL.length)rebuildQuizPool();
  if(!QUIZ_POOL.length)return null;
  if(QUIZ_POOL.length===1)return QUIZ_POOL[0];
  let next;
  do{next=QUIZ_POOL[Math.floor(Math.random()*QUIZ_POOL.length)]}while(CURRENT_QUIZ&&next.id===CURRENT_QUIZ.id);
  return next;
}
function renderQuiz(item){
  if(!item){$('#quizCard').classList.add('hidden');return}
  CURRENT_QUIZ=item;QUIZ_LOCKED=false;$('#quizCard').classList.remove('hidden');
  $('#quizTopic').textContent=questionMeta(item);
  $('#quizStatusLine').innerHTML=renderStatusTags(item);
  $('#quizQuestion').textContent=item.question;
  $('#quizQuestion').classList.toggle('raw-choice',isChoiceQuestion(item)&&!item.options_complete);
  $('#quizFeedback').classList.add('hidden');$('#quizExplain').classList.add('hidden');
  $('#quizExplainBody').textContent=item.explanation||item.reference||'';
  $('#quizAddWrong').textContent='加入错题';

  if(isChoiceQuestion(item)){
    $('#quizOptions').classList.remove('hidden');
    $('#subjectiveArea').classList.add('hidden');
    $('#quizOptions').innerHTML=optionButtonsHTML(item);
    bindQuestionOptions($('#quizOptions'),item,({good,selected,pending})=>{
      const f=$('#quizFeedback');f.classList.remove('hidden');
      if(pending){
        f.className='quiz-feedback';
        f.textContent='本题答案尚未可靠配对，暂不判分。题目仍保留在全量题库中。';
        return;
      }
      f.className='quiz-feedback '+(good?'good':'bad');
      f.textContent=good?'回答正确':`回答错误，正确答案 ${item.answer}；已加入错题`;
      if(item.explanation){$('#quizExplain').classList.remove('hidden')}
    });
  }else{
    $('#quizOptions').classList.add('hidden');
    $('#subjectiveArea').classList.remove('hidden');
    $('#subjectiveAnswer').value='';
    $('#subjectiveReference').classList.add('hidden');
    $('#subjectiveReference').textContent=item.reference||item.explanation||'';
    $('#showSubjectiveRef').disabled=!hasReference(item);
    $('#showSubjectiveRef').textContent=hasReference(item)?'查看参考答案':'参考答案待校验';
    $('#showSubjectiveRef').onclick=()=>{
      if(!hasReference(item))return;
      $('#subjectiveReference').classList.toggle('hidden');
      $('#quizExplain').classList.remove('hidden');
    };
    $('#subjectiveKnow').onclick=()=>toast('已标记：会了');
    $('#subjectiveWrong').onclick=()=>{
      if(addQuestionWrong(item,$('#subjectiveAnswer').value?'已作答':'未作答'))toast('已加入错题');
    };
  }
}
function nextQuiz(){renderQuiz(chooseRandomQuestion())}

function render(q,rows){
  const res=$('#results');
  clearInlineQuestion();
  $('#relatedHead').classList.remove('hidden');
  $('#relatedCount').textContent=`${rows.length}条`;

  const direct=correctedAnswer(q);
  const sq=direct?.structured||structuredQuestion(q);

  if(!rows.length&&!sq){
    $('#answerBox').classList.remove('hidden');
    $('#answerList').innerHTML='<li>未找到</li>';
    $('#answerExplain').classList.add('hidden');
    res.innerHTML='';
    return;
  }

  $('#answerBox').classList.remove('hidden');

  if(sq){
    $('#answerList').innerHTML='';
    renderInlineQuestion(sq);
    $('#answerExplain').classList.add('hidden');
  }else if(isQuestionRef(q)){
    $('#answerList').innerHTML='<li>未找到该题的已校对答案，请查看关联搜索。</li>';
    $('#answerExplain').classList.add('hidden');
  }else{
    const ans=extractAnswer(q,rows);
    $('#answerList').innerHTML=ans.length
      ?ans.map(x=>`<li>${esc(x.s)}<div class="meta">${esc(docName(x.p.doc))} · 第${x.p.page}页</div></li>`).join('')
      :'<li>未找到明确答案句，请查看关联搜索。</li>';
    const pref=rows.find(r=>String(r.p.curated_text||'').length)
      ||rows.find(r=>['d2','d4'].includes(r.p.doc))
      ||rows.find(r=>['d5','d6'].includes(r.p.doc))
      ||rows[0];
    if(pref){
      $('#answerExplain').classList.remove('hidden');
      $('#answerExplainBody').innerHTML=explainHTML(q,pref.p);
    }else $('#answerExplain').classList.add('hidden');
  }

  if(!rows.length){res.innerHTML='';return}

  res.innerHTML=rows.map((r,i)=>`<article class="result" data-i="${i}">
    <div class="result-top"><div class="result-title">${esc(docName(r.p.doc))} · 第${r.p.page}页</div><span class="match">匹配 ${r.pct}%</span></div>
    <div class="snippet">${highlight(displayExcerpt(q,r.p),q)}</div>
    <div class="actions"><button class="link exp">AI解释</button><button class="link recall-add">加入背诵</button><button class="link wrong-add">${wrongExists(q,r.p)?'已加入错题':'加入错题'}</button></div>
    <details class="explain result-exp"><summary>AI解释</summary><div>${explainHTML(q,r.p)}</div></details>
  </article>`).join('');
  $$('.result',res).forEach(el=>{
    const r=rows[+el.dataset.i];
    $('.exp',el).onclick=()=>{$('.result-exp',el).open=!$('.result-exp',el).open};
    $('.recall-add',el).onclick=()=>{if(addRecall(q,r.p))$('.recall-add',el).textContent='已加入背诵'};
    $('.wrong-add',el).onclick=()=>{if(addWrong(q,r.p))$('.wrong-add',el).textContent='已加入错题'};
  });
}
function randomKnowledge(){
  if(!KNOWLEDGE.length)return;
  const pool=KNOWLEDGE.filter(k=>k.random!==false);
  for(let i=pool.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [pool[i],pool[j]]=[pool[j],pool[i]];
  }
  const five=pool.slice(0,5);
  $('#knowledgeList').innerHTML=five.map(k=>`
    <button class="knowledge-item" data-q="${esc(k.name)}">
      <div class="knowledge-main">
        <div class="knowledge-title">${esc(k.name)}</div>
        <div class="knowledge-meta">${esc(docName(k.doc))} · 第${k.page}页</div>
      </div>
      <span class="knowledge-badge">随机</span>
    </button>`).join('');
  $$('.knowledge-item').forEach(b=>b.onclick=()=>{
    $('#question').value=b.dataset.q;
    search();
    window.scrollTo({top:58,behavior:'smooth'});
  });
}
function makeRandomRecall(){
  const pool=KNOWLEDGE.filter(k=>k.random!==false&&(k.cloze_variants||[]).length);
  if(!pool.length)return null;
  for(let tries=0;tries<50;tries++){
    const k=pool[Math.floor(Math.random()*pool.length)],p=findPage(k.doc,k.page);
    if(!p)continue;
    const v=chooseClozeVariant(k);
    if(!v)continue;
    return {id:'random-'+Date.now().toString(36),q:k.name,knowledgeName:k.name,doc:p.doc,page:p.page,text:k.prompt,created:Date.now(),ephemeral:true,cloze:v};
  }
  return null;
}
function resolveRecallCloze(r,forceDifferent=false){
  if(!r)return null;
  if(r.knowledgeName){
    const k=KNOWLEDGE.find(x=>x.name===r.knowledgeName);
    if(k){
      const prev=r.cloze?.id||r.variantId||null;
      const v=chooseClozeVariant(k,forceDifferent?prev:null);
      r.cloze=v;r.variantId=v?.id||null;r.text=k.prompt;r.q=k.name;
      return v;
    }
  }
  if(r.cloze)return r.cloze;
  const p=findPage(r.doc,r.page)||{text:r.text||''};
  return legacySafeVariant(r.q||'',p);
}
function renderRecall(forceDifferent=false){
  const saved=getJSON(RECALL_KEY);
  if(!CURRENT_RECALL)CURRENT_RECALL=saved[0]||makeRandomRecall();
  if(!CURRENT_RECALL){$('#recallEmpty').classList.remove('hidden');$('#recallCard').classList.add('hidden');return}
  const r=CURRENT_RECALL,v=resolveRecallCloze(r,forceDifferent);
  if(!v){CURRENT_RECALL=makeRandomRecall();return renderRecall()}
  $('#recallEmpty').classList.add('hidden');$('#recallCard').classList.remove('hidden');
  const topicHint=v.kind==='reverse'?'':`${r.knowledgeName||r.q} · `;$('#recallSource').textContent=`${r.ephemeral?'随机 · ':''}${topicHint}${docName(r.doc)} · 第${r.page}页 · ${v.label} · ${v.answers.length}空`;
  $('#recallPrompt').textContent=v.text;
  $('#recallInputs').innerHTML=v.answers.map((w,i)=>`<div class="fill"><label>空${i+1}</label><input data-i="${i}" autocomplete="off" placeholder="输入答案"></div>`).join('');
  $('#recallFeedback').classList.add('hidden');$('#recallAnswer').classList.add('hidden');
  $('#recallAnswer').textContent=v.answers.map((w,i)=>`空${i+1}：${w}`).join('\n');
  const k=r.knowledgeName?KNOWLEDGE.find(x=>x.name===r.knowledgeName):null;
  $('#recallExplain').innerHTML=k?`<ol>${cleanPromptPoints(k.prompt).map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`:explainHTML(r.q,{text:r.text});
  $('#deleteRecall').textContent=r.ephemeral?'下一题':'删除';
  $('#recallList').innerHTML=saved.length?saved.map(x=>`<div class="mini"><span>${esc(x.knowledgeName||x.q||docName(x.doc))}</span><button data-id="${x.id}">练习</button></div>`).join(''):'<div class="mini"><span>当前为随机练习</span></div>';
  $$('#recallList button').forEach(b=>b.onclick=()=>{CURRENT_RECALL=saved.find(x=>x.id===b.dataset.id);renderRecall(true)});
}
function checkRecall(){
  if(!CURRENT_RECALL)return;
  const v=CURRENT_RECALL.cloze||resolveRecallCloze(CURRENT_RECALL);if(!v)return;
  let ok=0;
  $$('#recallInputs input').forEach(inp=>{const good=norm(inp.value)===norm(v.answers[+inp.dataset.i]);inp.classList.toggle('good',good);inp.classList.toggle('bad',!good);if(good)ok++});
  const allGood=ok===v.answers.length;updateClozeStats(CURRENT_RECALL.knowledgeName,allGood);
  const e=$('#recallFeedback');e.classList.remove('hidden');e.className='feedback '+(allGood?'good':'bad');
  const st=CURRENT_RECALL.knowledgeName?getClozeStats()[CURRENT_RECALL.knowledgeName]:null;
  e.textContent=allGood?`全部正确 ${ok}/${v.answers.length}${st?` · 连对 ${st.streak}`:''}`:`答对 ${ok}/${v.answers.length} · 下一次会自动降低挖空难度`;
}
function randomRecall(){CURRENT_RECALL=makeRandomRecall();renderRecall()}
function deleteRecall(){
  if(!CURRENT_RECALL)return;
  if(CURRENT_RECALL.ephemeral)return randomRecall();
  saveJSON(RECALL_KEY,getJSON(RECALL_KEY).filter(x=>x.id!==CURRENT_RECALL.id));CURRENT_RECALL=null;renderRecall();
}
function recallWrong(){
  if(!CURRENT_RECALL)return;
  const v=CURRENT_RECALL.cloze||resolveRecallCloze(CURRENT_RECALL);
  addWrong(CURRENT_RECALL.q,{doc:CURRENT_RECALL.doc,page:CURRENT_RECALL.page,text:CURRENT_RECALL.text},`背诵：${(v?.answers||[]).join(' / ')}`);renderWrong();
}

function renderWrong(){const arr=getJSON(WRONG_KEY).sort((a,b)=>b.created-a.created),root=$('#wrongList');if(!arr.length){root.innerHTML='<div class="empty">暂无内容</div>';return}root.innerHTML=arr.map(w=>`<details class="wrong" data-id="${w.id}"><summary><div><b>${esc(w.q||'知识点')}</b><div class="meta">${esc(docName(w.doc))} · 第${w.page}页</div></div><span class="meta">展开</span></summary><div class="wrong-body">${w.note?`<div class="wrong-note">${esc(w.note)}</div>`:''}<div class="source">${esc(displayExcerpt(w.q,findPage(w.doc,w.page)||{text:w.text}))}</div><details class="explain"><summary>AI解释</summary><div>${explainHTML(w.q,{text:w.text})}</div></details><div class="actions"><button class="link danger del">删除</button></div></div></details>`).join('');$$('.wrong',root).forEach(el=>$('.del',el).onclick=()=>{saveJSON(WRONG_KEY,getJSON(WRONG_KEY).filter(x=>x.id!==el.dataset.id));renderWrong()})}
function switchView(v){$$('.view').forEach(x=>x.classList.remove('active'));$$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.view===v));$('#view-'+v).classList.add('active');if(v==='recall'){if(!CURRENT_RECALL)CURRENT_RECALL=makeRandomRecall();renderRecall()}if(v==='quiz'){rebuildQuizPool();if(!CURRENT_QUIZ||!QUIZ_POOL.some(q=>q.id===CURRENT_QUIZ.id))CURRENT_QUIZ=chooseRandomQuestion();renderQuiz(CURRENT_QUIZ)}if(v==='wrong')renderWrong();window.scrollTo({top:0})}
async function clearOldCaches(){try{if('serviceWorker'in navigator){const regs=await navigator.serviceWorker.getRegistrations();for(const r of regs)await r.unregister()}if('caches'in window){const ks=await caches.keys();for(const k of ks)await caches.delete(k)}}catch{}}
async function init(){
  console.log('311背书助手 FINAL full-bank v2.0.0');
  await clearOldCaches();
  try{
    [LIB,{items:KNOWLEDGE},{questions:QUESTIONS}]=await Promise.all([
      fetch(DATA_URL,{cache:'no-store'}).then(r=>r.json()),
      fetch(KNOWLEDGE_URL,{cache:'no-store'}).then(r=>r.json()),
      fetch(QUESTIONS_URL,{cache:'no-store'}).then(r=>r.json())
    ]);
  }catch(e){
    $('#answerBox').classList.remove('hidden');$('#answerList').innerHTML='<li>资料加载失败</li>';return;
  }
  LIB.pages.forEach(p=>{p.n=norm(pageSearchText(p))});
  $('#askBtn').onclick=search;
  $('#question').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();search()}};
  $$('.tab').forEach(b=>b.onclick=()=>switchView(b.dataset.view));
  $('#refreshKnowledge').onclick=randomKnowledge;
  $('#checkRecall').onclick=checkRecall;
  $('#showRecall').onclick=()=>$('#recallAnswer').classList.toggle('hidden');
  $('#alternateRecall').onclick=()=>renderRecall(true);
  $('#recallWrong').onclick=recallWrong;
  $('#deleteRecall').onclick=deleteRecall;
  $('#randomRecall').onclick=randomRecall;
  $('#randomQuiz').onclick=()=>{rebuildQuizPool();nextQuiz()};
  $('#nextQuiz').onclick=nextQuiz;
  $('#applyQuizFilter').onclick=()=>{rebuildQuizPool();CURRENT_QUIZ=null;nextQuiz()};
  $('#quizKeyword').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();rebuildQuizPool();CURRENT_QUIZ=null;nextQuiz()}};
  $('#quizAddWrong').onclick=()=>{if(CURRENT_QUIZ&&addQuestionWrong(CURRENT_QUIZ)){toast('已加入错题');$('#quizAddWrong').textContent='已加入错题'}};
  $('#clearWrong').onclick=()=>{if(confirm('清空错题？')){saveJSON(WRONG_KEY,[]);renderWrong()}};
  $('#quizCount').textContent=`全量题库 ${QUESTIONS.length} 题`;
  rebuildQuizPool();randomKnowledge();renderWrong();
}
init();
