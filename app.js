const DATA_URL='./data/library.json';
const RECALL_KEY='study311_recall_final_v1',WRONG_KEY='study311_wrong_final_v1';
let LIB={docs:[],pages:[]},CURRENT=[],PENDING=null,CURRENT_RECALL=null,RANDOM_POOL=null;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const toast=m=>{const e=$('#toast');e.textContent=m;e.classList.add('show');clearTimeout(window.__t);window.__t=setTimeout(()=>e.classList.remove('show'),1500)};
const getJSON=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const saveJSON=(k,v)=>localStorage.setItem(k,JSON.stringify(v));

const GROUPS=[
['最近发展区','潜在发展水平','实际发展水平','支架式教学','老师帮助学生','老师帮一下就会','在帮助下完成','稍微难一点','刚好不会','够不到','跳一跳够得着','自己不会别人帮就会'],
['皮亚杰','图式','同化','顺应','平衡','感知运动阶段','前运算阶段','具体运算阶段','形式运算阶段','守恒','可逆性','去自我中心'],
['维果茨基','最近发展区','文化历史','内化','支架'],
['埃里克森','八阶段','信任对怀疑','自主对羞怯','主动对内疚','勤奋对自卑','同一性','亲密对孤独','繁衍对停滞','完美对绝望'],
['科尔伯格','三水平六阶段','前习俗','习俗水平','后习俗','社会契约','普遍道德原则'],
['外层系统','父母工作','父母单位','爸妈工作','爸妈工作的地方','爸爸妈妈工作','家长工作单位','儿童不直接参与'],
['布朗芬布伦纳','生态系统','微观系统','中间系统','外层系统','宏观系统','时间系统','家庭学校关系'],
['学在官府','惟官有学','惟官有器','惟官有书','官师合一','政教合一'],
['六艺','礼乐射御书数','礼','乐','射','御','书','数'],['辟雍','天子大学','天子的大学'],['泮宫','诸侯大学','诸侯的大学'],
['稷下学宫','齐国学府','百家争鸣中心','官家操办私家主持'],['成均','乐教机构'],['庠','养老教育','养老机构'],['校','军事训练','习武场所'],
['孔子','有教无类','因材施教','启发诱导','不愤不启','不悱不发'],['孟子','性善论'],['荀子','性恶论','化性起伪'],['墨子','兼爱','非攻','尚贤'],
['董仲舒','独尊儒术','罢黜百家'],['太学','中央官学'],['科举','进士科','选官'],['书院','朱熹','白鹿洞书院'],
['癸卯学制','奏定学堂章程'],['壬戌学制','六三三学制'],['蔡元培','五育并举','思想自由','兼容并包'],['陶行知','生活教育','教学做合一'],['陈鹤琴','活教育'],
['苏格拉底','产婆术','问答法'],['柏拉图','理想国'],['亚里士多德','自由教育'],['昆体良','雄辩术原理'],['夸美纽斯','大教学论','班级授课制'],
['洛克','绅士教育','白板说'],['卢梭','自然教育','爱弥儿'],['裴斯泰洛齐','要素教育','教育心理学化'],['赫尔巴特','教育性教学','四段教学'],
['福禄贝尔','幼儿园','恩物'],['蒙台梭利','感官教育','儿童之家'],['杜威','教育即生活','学校即社会','从做中学'],
['桑代克','试误说','效果律'],['巴甫洛夫','经典性条件作用'],['斯金纳','操作性条件作用','强化'],['班杜拉','观察学习','社会学习','自我效能'],
['布鲁纳','发现学习','认知结构'],['奥苏贝尔','有意义接受学习','先行组织者'],['学习动机','成就动机','归因','自我效能','需要层次'],
['学习策略','认知策略','元认知策略','资源管理策略'],['迁移','学习迁移','正迁移','负迁移'],['知识建构','陈述性知识','程序性知识'],['技能','动作技能','心智技能'],
['教育目的','培养目标','全面发展'],['课程','课程标准','课程计划','教材'],['教学原则','教学方法','教学组织形式'],['德育','德育原则','德育方法'],
['教师','学生','师生关系'],['班主任','班级管理'],['教育制度','学制'],['教育公平','教育机会均等'],['教育功能','个体功能','社会功能'],
['教育研究','研究方法','选题','文献综述'],['观察法','教育观察'],['调查法','问卷','访谈'],['实验法','教育实验','自变量','因变量','控制变量'],
['信度','可靠性'],['效度','有效性'],['抽样','随机抽样','分层抽样'],['行动研究','教育行动研究'],['叙事研究','教育叙事'],['定性研究','质性研究'],['定量研究','量化研究']
];
const STOP=new Set(['什么','怎么','怎样','哪个','哪种','属于','影响','帮助','老师','教师','学生','孩子','儿童','任务','问题','地方','东西','一下','自己','这个','那个','主要','进行','内容','相关','里面','知识','知识点','请问','为什么','是否','可以','应该','需要']);
function norm(s){return String(s||'').toLowerCase().replace(/[臺台]/g,'台').replace(/[裏裡]/g,'里').replace(/\s+/g,'').replace(/[，。！？；：、“”‘’（）()【】\[\]《》<>·—\-_,.!?:;'"/\\|]/g,'')}
function seg(s){const n=norm(s),set=new Set();try{for(const x of new Intl.Segmenter('zh-CN',{granularity:'word'}).segment(String(s||''))){const t=norm(x.segment);if(t.length>=2)set.add(t)}}catch{}if(!set.size){for(let i=0;i<n.length-1;i++)set.add(n.slice(i,i+2))}if(n.length>=2&&n.length<=6)set.add(n);return [...set]}
function expand(q){const n=norm(q),set=new Set();for(const g of GROUPS){const key=norm(g[0]);const hit=(key&&n.includes(key))||g.slice(1).some(x=>{const t=norm(x);return t.length>=3&&n.includes(t)});if(hit)g.forEach(x=>set.add(norm(x)))}return [...set].filter(x=>x.length>=2)}
function occ(h,n){let c=0,p=0;if(!n)return 0;while((p=h.indexOf(n,p))>=0){c++;p+=n.length}return c}
function sourceBoost(p){let b=(p.doc==='d5'||p.doc==='d6')?10:((p.doc==='d2'||p.doc==='d4')?7:0);if(String(p.text||'').includes('【校对内容】'))b+=18;return b}
function qBigrams(s){const n=norm(s),a=[];for(let i=0;i<n.length-1;i++){const x=n.slice(i,i+2);if(!STOP.has(x))a.push(x)}return [...new Set(a)]}
function pageScore(q,p){const nq=norm(q),t=p.n||norm(p.text);let s=0,matched=new Set();const exact=t.includes(nq);if(exact){s+=100;matched.add(nq)}const terms=seg(q).filter(x=>x.length>=2&&!STOP.has(x));for(const x of terms){const c=occ(t,x);if(c){s+=Math.min(36,9*c)+(x.length>=4?6:0);matched.add(x)}}const aliases=expand(q);let aliasHits=0;for(const x of aliases){const c=occ(t,x);if(c){aliasHits++;s+=Math.min(30,6*c)+(x.length>=4?4:0);matched.add(x)}}const coverage=terms.length?terms.filter(x=>t.includes(x)).length/terms.length:0;if(coverage>=.7)s+=22;else if(coverage>=.45)s+=10;const bg=qBigrams(q),bgHits=bg.filter(x=>t.includes(x)).length,bgCoverage=bg.length?bgHits/bg.length:0;if(!exact&&!aliasHits&&coverage<.45&&nq.length>=6&&bgHits>=3&&bgCoverage>=.55)s+=12+Math.round(bgCoverage*14);s+=sourceBoost(p);const valid=exact||aliasHits>=1||coverage>=.45||(terms.length===1&&coverage===1)||(nq.length>=6&&bgHits>=3&&bgCoverage>=.55);return {score:s,matched:[...matched],coverage,aliasHits,bgCoverage,valid}}
function matchPct(x){if(x.score>=100)return Math.min(99,94+Math.round(Math.min(5,x.coverage*5)));return Math.max(45,Math.min(93,Math.round(45+x.coverage*38+Math.min(15,x.score/8))))}
function sentences(text){return String(text||'').replace(/\n+/g,'。').split(/(?<=[。！？；])/).map(x=>x.trim()).filter(x=>x.length>=6&&x.length<=260&&((x.match(/[\u4e00-\u9fff]/g)||[]).length>=4)&&!/^(关键词|相关表达)[:：]/.test(x))}
function sentenceScore(q,s){const n=norm(s),qn=norm(q);let v=0;if(n.includes(qn))v+=100;for(const x of seg(q))if(x.length>=2&&!STOP.has(x)&&n.includes(x))v+=9;let novel=0;for(const x of expand(q)){if(n.includes(x)){v+=5;if(!qn.includes(x)){v+=6;novel++}}}const relevant=v>0;if(relevant&&/^解释[:：]/.test(s))v+=22;if(relevant&&/是什么|含义|定义|指什么/.test(q)&&/定义|含义|是指|指的是|称为|叫做|就是/.test(s))v+=18;if(relevant&&/叫什么/.test(q)&&novel>0&&/称为|叫做|名称|设/.test(s))v+=26;if(relevant&&/为什么|原因|根本/.test(q)&&/原因|由于|因为|根本|导致|源于/.test(s))v+=16;if(relevant&&/特点|特征/.test(q)&&/特点|特征|表现/.test(s))v+=14;if(relevant&&/作用|意义|影响/.test(q)&&/作用|意义|影响|价值/.test(s))v+=14;if(relevant&&/阶段|时期/.test(q)&&/阶段|时期|岁/.test(s))v+=12;if(relevant&&/区别|不同|比较/.test(q)&&/区别|不同|相比|而/.test(s))v+=10;if(/[？?]/.test(s))v-=32;if(/下列|以下|哪一|不属于|正确的是|错误的是|分别称为\s*\(/.test(s))v-=24;return v}
function extractAnswer(q,rows){const a=[],rs=rows.slice(0,10);for(let ri=0;ri<rs.length;ri++){const r=rs[ri],rankBonus=Math.max(0,20-ri*3);for(const s of sentences(r.p.text)){const sc=sentenceScore(q,s)+sourceBoost(r.p)+rankBonus;if(sc>0)a.push({s,sc,p:r.p})}}a.sort((x,y)=>y.sc-x.sc);const out=[],seen=new Set();for(const x of a){const n=norm(x.s);if(seen.has(n))continue;seen.add(n);out.push(x);if(out.length>=3)break}return out}
function bestExcerpt(q,text){const ss=sentences(text).map(s=>({s,v:sentenceScore(q,s)})).sort((a,b)=>b.v-a.v);if(ss[0]?.v>0)return ss.slice(0,3).map(x=>x.s).join(' ');return String(text||'').replace(/\n+/g,' ').slice(0,330)}
function highlight(t,q){let h=esc(t);for(const x of [q,...expand(q)].filter(x=>x.length>=2).sort((a,b)=>b.length-a.length).slice(0,8)){try{h=h.replace(new RegExp(x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),m=>`<mark>${m}</mark>`)}catch{}}return h}
function explanation(q,p){const ranked=sentences(p.text).map(s=>({s,v:sentenceScore(q,s)})).filter(x=>x.v>0).sort((a,b)=>b.v-a.v);const points=[];for(const x of ranked){if(!points.includes(x.s))points.push(x.s);if(points.length>=3)break}if(!points.length)points.push(bestExcerpt(q,p.text));const kws=[...new Set([...expand(q),...seg(q)].filter(x=>x.length>=2&&norm(p.text).includes(norm(x))))].slice(0,5);return {points,kws}}
function explainHTML(q,p){const e=explanation(q,p);return `<ol>${e.points.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>${e.kws.length?`<div class="meta">关键词：${esc(e.kws.join(' / '))}</div>`:''}`}
function docName(id){return LIB.docs.find(d=>d.id===id)?.name||id}

function wrongExists(q,p){
  return getJSON(WRONG_KEY).some(x=>x.doc===p.doc&&x.page===p.page&&norm(x.q||'')===norm(q||''));
}
function addWrongDirect(q,p,note=''){
  const arr=getJSON(WRONG_KEY);
  if(arr.some(x=>x.doc===p.doc&&x.page===p.page&&norm(x.q||'')===norm(q||''))){
    toast('已经在错题里');
    return false;
  }
  arr.push({
    id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),
    q:q||'知识点',
    doc:p.doc,page:p.page,text:p.text,
    note:note||'',
    created:Date.now()
  });
  saveJSON(WRONG_KEY,arr);
  toast('已加入错题');
  return true;
}
function autoWordsFromText(text,limit=4){
  const n=norm(text),found=[];
  for(const g of GROUPS){
    const present=g.filter(x=>x.length>=2&&n.includes(norm(x)));
    if(!present.length)continue;
    const canonical=present.includes(g[0])?g[0]:present[0];
    if(canonical.length>=2&&!found.includes(canonical))found.push(canonical);
    for(const x of present.slice(1)){
      if(x.length>=2&&!found.includes(x))found.push(x);
      if(found.length>=limit)break;
    }
    if(found.length>=limit)break;
  }
  return found.slice(0,limit);
}
function recallPromptAndWords(r){
  let prompt=r.prompt||bestExcerpt(r.q||r.words?.[0]||'',r.text);
  let words=(r.words||[]).filter(w=>prompt.includes(w));
  if(!words.length){
    words=autoWordsFromText(prompt,4).filter(w=>prompt.includes(w));
  }
  if(!words.length&&r.words?.length){
    const target=r.words[0];
    const ss=sentences(r.text).filter(s=>s.includes(target));
    if(ss.length){
      prompt=ss.slice(0,3).join(' ');
      words=r.words.filter(w=>prompt.includes(w));
    }
  }
  return {prompt,words};
}
function makeRandomRecall(){
  if(!RANDOM_POOL){
    const preferred=LIB.pages.filter(p=>['d5','d6','d2','d4'].includes(p.doc)&&p.page>3&&String(p.text||'').length>80);
    const fallback=LIB.pages.filter(p=>p.page>3&&String(p.text||'').length>80);
    const src=preferred.length?preferred:fallback;
    RANDOM_POOL=[];
    for(const p of src){
      const words=autoWordsFromText(p.text,4);
      if(!words.length)continue;
      const q=words[0];
      const prompt=bestExcerpt(q,p.text);
      const usable=words.filter(w=>prompt.includes(w)).slice(0,4);
      if(!usable.length)continue;
      RANDOM_POOL.push({p,q,prompt,words:usable});
    }
  }
  if(!RANDOM_POOL.length)return null;
  const x=RANDOM_POOL[Math.floor(Math.random()*RANDOM_POOL.length)];
  return {
    id:'random-'+Date.now().toString(36),
    q:x.q,doc:x.p.doc,page:x.p.page,text:x.p.text,
    prompt:x.prompt,words:x.words,created:Date.now(),ephemeral:true
  };
}
function addRecallDirect(q,p){
  let prompt=bestExcerpt(q,p.text);
  let words=candidateWords(q,p).slice(0,4).filter(w=>prompt.includes(w));
  if(!words.length)words=autoWordsFromText(prompt,4).filter(w=>prompt.includes(w));
  if(!words.length){
    toast('这页没有找到合适的挖空词');
    return false;
  }
  const item={
    id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),
    q:q||words[0],doc:p.doc,page:p.page,text:p.text,prompt,
    words:[...new Set(words)],created:Date.now()
  };
  const arr=getJSON(RECALL_KEY);
  if(!arr.some(x=>x.doc===item.doc&&x.page===item.page&&JSON.stringify(x.words)===JSON.stringify(item.words))){
    arr.push(item);saveJSON(RECALL_KEY,arr);
  }
  CURRENT_RECALL=item;
  toast('已加入背诵');
  return true;
}

const EDU_HINT=/教育|学习|教学|课程|学生|教师|学校|学制|德育|心理|认知|动机|迁移|记忆|研究|法案|教育史|教育家|理论|儿童|发展区|大学|官学|私学|六艺|科举|书院/;
function outOfDomain(q){if(EDU_HINT.test(q))return false;return [/量子色动力学/i,/显卡|超频|股票|天气|做饭|菜谱|彩票|游戏攻略/,/python.*(装饰器|代码|函数|怎么写|编程)/i,/总统是谁|谁是.{0,8}总统/].some(r=>r.test(q))}
function search(){const q=$('#question').value.trim();if(!q)return;if(outOfDomain(q)){CURRENT=[];render(q,[]);return}const rows=LIB.pages.map(p=>{const x=pageScore(q,p);return {p,...x,pct:matchPct(x)}}).filter(x=>x.valid&&x.score>=16).sort((a,b)=>b.score-a.score).slice(0,40);CURRENT=rows;render(q,rows)}
function render(q,rows){
  const res=$('#results');
  $('#relatedHead').classList.remove('hidden');
  $('#relatedCount').textContent=`${rows.length}条`;

  if(!rows.length){
    $('#answerBox').classList.remove('hidden');
    $('#answerList').innerHTML='<li>未找到</li>';
    $('#answerExplain').classList.add('hidden');
    res.innerHTML='';
    return;
  }

  const ans=extractAnswer(q,rows);
  $('#answerBox').classList.remove('hidden');
  $('#answerList').innerHTML=ans.length
    ?ans.map(x=>`<li>${esc(x.s)}<div class="meta">${esc(docName(x.p.doc))} · 第${x.p.page}页</div></li>`).join('')
    :'<li>未找到明确答案句，请查看关联搜索。</li>';

  const preferred=
    rows.find(r=>String(r.p.text||'').includes('【校对内容】'))
    ||rows.find(r=>['d2','d4'].includes(r.p.doc))
    ||rows.find(r=>['d5','d6'].includes(r.p.doc))
    ||rows[0];
  const top=preferred.p;

  $('#answerExplain').classList.remove('hidden');
  $('#answerExplainBody').innerHTML=explainHTML(q,top);

  res.innerHTML=rows.map((r,i)=>`<article class="result" data-i="${i}">
    <div class="result-top">
      <div class="result-title">${esc(docName(r.p.doc))} · 第${r.p.page}页</div>
      <span class="match">匹配 ${r.pct}%</span>
    </div>
    <div class="snippet">${highlight(bestExcerpt(q,r.p.text),q)}</div>
    <div class="actions">
      <button class="link exp">AI解释</button>
      <button class="link recall-add">加入背诵</button>
      <button class="link wrong-add">${wrongExists(q,r.p)?'已加入错题':'加入错题'}</button>
    </div>
    <details class="explain result-exp"><summary>AI解释</summary><div>${explainHTML(q,r.p)}</div></details>
  </article>`).join('');

  $$('.result',res).forEach(el=>{
    const r=rows[+el.dataset.i];
    $('.exp',el).onclick=()=>{$('.result-exp',el).open=!$('.result-exp',el).open};
    $('.recall-add',el).onclick=()=>{
      if(addRecallDirect(q,r.p))$('.recall-add',el).textContent='已加入背诵';
    };
    $('.wrong-add',el).onclick=()=>{
      if(addWrongDirect(q,r.p))$('.wrong-add',el).textContent='已加入错题';
    };
  });
}

function candidateWords(q,p){const set=new Set();for(const x of [...expand(q),...seg(q)])if(x.length>=2&&p.text.includes(x))set.add(x);if(norm(p.text).includes(norm(q))&&q.length>=2)set.add(q);return [...set].sort((a,b)=>b.length-a.length).slice(0,6)}
function openRecall(q,p){PENDING={type:'recall',q,p};$('#recallWords').value=candidateWords(q,p).slice(0,3).join('，');$('#recallDialog').showModal()}
function saveRecall(){if(!PENDING)return;const words=$('#recallWords').value.split(/[，,；;\n]/).map(x=>x.trim()).filter(Boolean).filter(x=>PENDING.p.text.includes(x));if(!words.length){toast('挖空词必须出现在原文里');return false}const arr=getJSON(RECALL_KEY);arr.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),q:PENDING.q,doc:PENDING.p.doc,page:PENDING.p.page,text:PENDING.p.text,words:[...new Set(words)],created:Date.now()});saveJSON(RECALL_KEY,arr);toast('已加入背诵');PENDING=null;return true}
function openWrong(q,p){PENDING={type:'wrong',q,p};$('#wrongNote').value='';$('#wrongDialog').showModal()}
function saveWrong(){if(!PENDING)return;const arr=getJSON(WRONG_KEY);arr.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),q:PENDING.q,doc:PENDING.p.doc,page:PENDING.p.page,text:PENDING.p.text,note:$('#wrongNote').value.trim(),created:Date.now()});saveJSON(WRONG_KEY,arr);toast('已加入错题');PENDING=null}

function renderRecall(){
  const arr=getJSON(RECALL_KEY);

  if(!CURRENT_RECALL)CURRENT_RECALL=arr[0]||makeRandomRecall();

  if(!CURRENT_RECALL){
    $('#recallEmpty').classList.remove('hidden');
    $('#recallEmpty').textContent='没有找到可随机生成的背诵内容';
    $('#recallCard').classList.add('hidden');
    $('#recallList').innerHTML='';
    return;
  }

  const r=CURRENT_RECALL;
  const built=recallPromptAndWords(r);

  if(!built.words.length){
    CURRENT_RECALL=makeRandomRecall();
    if(CURRENT_RECALL)return renderRecall();
    $('#recallEmpty').classList.remove('hidden');
    $('#recallEmpty').textContent='当前资料没有可挖空内容';
    $('#recallCard').classList.add('hidden');
    return;
  }

  r.words=built.words;
  r.prompt=built.prompt;

  $('#recallEmpty').classList.add('hidden');
  $('#recallCard').classList.remove('hidden');
  $('#recallSource').textContent=`${r.ephemeral?'随机 · ':''}${docName(r.doc)} · 第${r.page}页`;

  let prompt=r.prompt;
  r.words.forEach((w,i)=>{prompt=prompt.replace(w,`【空${i+1}】`)});
  $('#recallPrompt').textContent=prompt;

  $('#recallInputs').innerHTML=r.words.map((w,i)=>`
    <div class="fill">
      <label>空${i+1}</label>
      <input data-i="${i}" autocomplete="off" placeholder="输入答案">
    </div>`).join('');

  $('#recallFeedback').classList.add('hidden');
  $('#recallAnswer').classList.add('hidden');
  $('#recallAnswer').textContent=r.words.map((w,i)=>`空${i+1}：${w}`).join('\n');
  $('#recallExplain').innerHTML=explainHTML(r.q||r.words[0],{text:r.text});
  $('#deleteRecall').textContent=r.ephemeral?'下一题':'删除';

  $('#recallList').innerHTML=arr.length
    ?arr.map(x=>`<div class="mini"><span>${esc(docName(x.doc))} · 第${x.page}页 · ${esc((x.words||[]).join(' / '))}</span><button data-id="${x.id}">练习</button></div>`).join('')
    :'<div class="mini"><span>没有收藏卡也可以直接随机练习。</span></div>';

  $$('#recallList button').forEach(b=>b.onclick=()=>{
    CURRENT_RECALL=arr.find(x=>x.id===b.dataset.id);
    renderRecall();
  });
}
function checkRecall(){if(!CURRENT_RECALL)return;let ok=0;$$('#recallInputs input').forEach(inp=>{const good=norm(inp.value)===norm(CURRENT_RECALL.words[+inp.dataset.i]);inp.classList.toggle('good',good);inp.classList.toggle('bad',!good);if(good)ok++});const e=$('#recallFeedback');e.classList.remove('hidden');e.className='feedback '+(ok===CURRENT_RECALL.words.length?'good':'bad');e.textContent=ok===CURRENT_RECALL.words.length?`全部正确 ${ok}/${CURRENT_RECALL.words.length}`:`答对 ${ok}/${CURRENT_RECALL.words.length}`}
function deleteRecall(){
  if(!CURRENT_RECALL)return;
  if(CURRENT_RECALL.ephemeral)return randomRecall();
  saveJSON(RECALL_KEY,getJSON(RECALL_KEY).filter(x=>x.id!==CURRENT_RECALL.id));
  CURRENT_RECALL=null;
  renderRecall();
}
function recallWrong(){
  if(!CURRENT_RECALL)return;
  addWrongDirect(
    CURRENT_RECALL.q||CURRENT_RECALL.words?.[0]||'背诵',
    {doc:CURRENT_RECALL.doc,page:CURRENT_RECALL.page,text:CURRENT_RECALL.text},
    `背诵填空：${(CURRENT_RECALL.words||[]).join(' / ')}`
  );
  renderWrong();
}
function randomRecall(){
  CURRENT_RECALL=makeRandomRecall();
  renderRecall();
}

function renderWrong(){const arr=getJSON(WRONG_KEY).sort((a,b)=>b.created-a.created);const root=$('#wrongList');if(!arr.length){root.innerHTML='<div class="empty">暂无内容</div>';return}root.innerHTML=arr.map(w=>`<details class="wrong" data-id="${w.id}"><summary><div><b>${esc(w.q||'知识点')}</b><div class="meta">${esc(docName(w.doc))} · 第${w.page}页</div></div><span class="meta">展开</span></summary><div class="wrong-body">${w.note?`<div class="wrong-note">${esc(w.note)}</div>`:''}<div class="source">${esc(bestExcerpt(w.q,w.text))}</div><details class="explain"><summary>AI解释</summary><div>${explainHTML(w.q,{text:w.text})}</div></details><div class="actions"><button class="link danger del">删除</button></div></div></details>`).join('');$$('.wrong',root).forEach(el=>$('.del',el).onclick=()=>{saveJSON(WRONG_KEY,getJSON(WRONG_KEY).filter(x=>x.id!==el.dataset.id));renderWrong()})}
function switchView(v){$$('.view').forEach(x=>x.classList.remove('active'));$$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.view===v));$('#view-'+v).classList.add('active');if(v==='recall'){if(!CURRENT_RECALL)CURRENT_RECALL=makeRandomRecall();renderRecall()}if(v==='wrong')renderWrong()}
async function init(){console.log('311背书助手 app.js v1.1.0');try{LIB=await fetch(DATA_URL,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('资料加载失败');return r.json()})}catch(e){$('#answerBox').classList.remove('hidden');$('#answerList').innerHTML='<li>资料加载失败</li>';return}$('#askBtn').onclick=search;$('#question').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();search()}};$$('.tab').forEach(b=>b.onclick=()=>switchView(b.dataset.view));$('#saveRecall').onclick=e=>{e.preventDefault();if(saveRecall())$('#recallDialog').close()};$('#saveWrong').onclick=e=>{e.preventDefault();saveWrong();$('#wrongDialog').close()};$('#checkRecall').onclick=checkRecall;$('#showRecall').onclick=()=>$('#recallAnswer').classList.toggle('hidden');$('#recallWrong').onclick=recallWrong;$('#deleteRecall').onclick=deleteRecall;$('#randomRecall').onclick=randomRecall;$('#clearWrong').onclick=()=>{if(confirm('清空错题？')){saveJSON(WRONG_KEY,[]);renderWrong()}};if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{})}
init();
