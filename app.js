
let DATA=[];
let currentSubject="全部";
const WRONG_KEY="study311_wrong_v1";
const AI_KEY="study311_optional_ai_v1";
let AI_ENABLED=localStorage.getItem(AI_KEY)==="1";
let puterLoading=null;

const $=(s)=>document.querySelector(s);
const $$=(s)=>Array.from(document.querySelectorAll(s));
const norm=s=>String(s||"").toLowerCase().replace(/\s+/g,"").replace(/[，。！？；：、“”‘’（）()【】\[\]《》<>·—\-_,.!?:;'"/\\|]/g,"");
const escapeHTML=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

function toast(msg){
  const el=$("#toast");el.textContent=msg;el.classList.add("show");
  clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>el.classList.remove("show"),1600);
}
function wrongIds(){try{return JSON.parse(localStorage.getItem(WRONG_KEY)||"[]")}catch{return[]}}
function saveWrong(ids){localStorage.setItem(WRONG_KEY,JSON.stringify([...new Set(ids)]))}
function isWrong(id){return wrongIds().includes(id)}

function belongs(d,subject){
  if(subject==="全部")return true;
  return String(d.section||"").includes(subject);
}
function score(q,d){
  q=norm(q);if(!q)return 1;
  const title=norm(d.title),content=norm(d.content),section=norm(d.section);
  let s=0;
  if(title===q)s+=30;
  if(q.length>=2 && (title.includes(q)||q.includes(title)))s+=12;

  for(const a of (d.aliases||[])){
    const x=norm(a);
    if(!x)continue;
    if(x.length>=2 && q.includes(x))s+=10;
    else if(q===x)s+=12;
  }

  for(const k of (d.keywords||[])){
    const x=norm(k);
    if(!x)continue;
    // Ignore one-character keyword leakage such as "学" matching unrelated questions.
    if(x.length>=2 && q.includes(x))s+=7;
    else if(q===x)s+=8;
  }

  if(q.length>=2 && content.includes(q))s+=5;
  if(q.length>=2 && section.includes(q))s+=3;

  const nums=String(q).match(/\d+/g)||[];
  if(d.type==="question"&&nums.length){
    const blob=norm((d.title||"")+" "+(d.question||"")+" "+(d.aliases||[]).join(" "));
    if(nums.every(n=>blob.includes(n)))s+=10;
  }
  return s;
}
function rankedData(q,subject=currentSubject){
  return DATA.filter(d=>belongs(d,subject))
    .map(d=>({d,s:score(q,d)}))
    .filter(x=>!q||x.s>=5)
    .sort((a,b)=>b.s-a.s);
}
function searchData(q){
  return rankedData(q).map(x=>x.d);
}
function copyText(text){navigator.clipboard?.writeText(text).then(()=>toast("已复制资料")).catch(()=>toast("复制失败"))}


async function ensurePuter(){
  if(window.puter)return window.puter;
  if(puterLoading)return puterLoading;
  puterLoading=new Promise((resolve,reject)=>{
    const s=document.createElement("script");
    s.src="https://js.puter.com/v2/";
    s.async=true;
    s.onload=()=>window.puter?resolve(window.puter):reject(new Error("Puter.js 加载失败"));
    s.onerror=()=>reject(new Error("无法加载 Puter.js"));
    document.head.appendChild(s);
  });
  return puterLoading;
}
function aiResponseText(resp){
  if(typeof resp==="string")return resp;
  const c=resp?.message?.content;
  if(typeof c==="string")return c;
  if(Array.isArray(c))return c.map(x=>x?.text||x?.value||"").join("");
  return String(resp||"");
}
async function explainWithAI(d,item){
  if(!AI_ENABLED){toast("请先打开 AI解释");return}
  let box=$(".ai-box",item);
  if(!box){
    box=document.createElement("div");
    box.className="ai-box loading";
    item.appendChild(box);
  }
  box.className="ai-box loading";
  box.innerHTML="<b>AI解释</b>正在加载…";
  try{
    const puter=await ensurePuter();
    const source=[
      `标题：${d.title||""}`,
      d.question?`题目：${d.question}`:"",
      `资料：${d.content||""}`,
      d.answer?`资料答案：${d.answer}`:"",
      `来源：${d.source||""}；${d.page||""}`
    ].filter(Boolean).join("\\n");
    const prompt=`你是311教育学学习助手。只能依据下面【资料】解释，不允许使用资料外知识，不允许补充新事实。
如果资料不足就说“这条资料不足以继续解释”。
输出要求：1到3点，每点一句，简短易懂；选择题先说答案；不要开场白，不要总结。

【资料】
${source}`;
    const resp=await puter.ai.chat(prompt,{model:"gpt-5.4-nano"});
    const text=aiResponseText(resp).trim();
    box.className="ai-box";
    box.innerHTML=`<b>AI解释（仅辅助，答案以资料为准）</b>${escapeHTML(text||"没有返回内容").replace(/\\n/g,"<br>")}`;
  }catch(e){
    box.className="ai-box error";
    box.innerHTML=`<b>AI解释不可用</b>${escapeHTML(e.message||String(e))}`;
  }
}

function itemHTML(d){
  const wrong=isWrong(d.id);
  return `<article class="item" data-id="${escapeHTML(d.id)}">
    <div class="item-top">
      <div class="item-title"><span class="tag">${d.type==="question"?"题目":"知识"}</span>${escapeHTML(d.title)}</div>
    </div>
    <div class="item-meta">${escapeHTML(d.section)} · ${escapeHTML(d.source)} · 页 ${escapeHTML(d.page)}</div>
    ${d.question?`<div class="item-question">${escapeHTML(d.question)}</div>`:""}
    <div class="item-content">${escapeHTML(d.content)}</div>
    ${d.answer?`<div class="item-answer"><b>答案：</b>${escapeHTML(d.answer)}</div>`:""}
    <div class="item-actions">
      ${d.answer?`<button class="link-btn answer-btn">显示答案</button>`:""}
      <button class="link-btn copy-btn">复制资料</button>
      ${AI_ENABLED?`<button class="link-btn ai-btn">AI解释</button>`:""}
      ${d.type==="question"?`<button class="link-btn wrong wrong-btn">${wrong?"移出错题":"加入错题"}</button>`:""}
    </div>
  </article>`;
}
function bindItemActions(root){
  $$(".item",root).forEach(el=>{
    const d=DATA.find(x=>x.id===el.dataset.id);if(!d)return;
    $(".answer-btn",el)?.addEventListener("click",e=>{
      el.classList.toggle("show-answer");
      e.currentTarget.textContent=el.classList.contains("show-answer")?"隐藏答案":"显示答案";
    });
    $(".copy-btn",el)?.addEventListener("click",()=>copyText(`${d.title}\n${d.content}${d.answer?`\n答案：${d.answer}`:""}`));
    $(".ai-btn",el)?.addEventListener("click",()=>explainWithAI(d,el));
    $(".wrong-btn",el)?.addEventListener("click",()=>{
      let ids=wrongIds();
      if(ids.includes(d.id))ids=ids.filter(x=>x!==d.id);else ids.push(d.id);
      saveWrong(ids);renderResults();renderWrong();toast(ids.includes(d.id)?"已加入错题":"已移出错题");
    });
  });
}
function renderResults(){
  const q=$("#searchInput").value.trim();
  const rows=searchData(q);
  $("#resultTitle").textContent=q?`搜索：${q}`:"全部资料";
  $("#resultCount").textContent=`${rows.length} 条`;
  const root=$("#resultList");
  root.innerHTML=rows.length?rows.map(itemHTML).join(""):`<div class="empty">资料库没有找到相关内容。</div>`;
  bindItemActions(root);
}
function renderWrong(){
  const ids=wrongIds();
  const rows=ids.map(id=>DATA.find(d=>d.id===id)).filter(Boolean);
  const root=$("#wrongList");
  root.innerHTML=rows.length?rows.map(itemHTML).join(""):`<div class="empty">还没有错题。</div>`;
  bindItemActions(root);
}
function recallDocs(){return DATA.filter(d=>d.type==="knowledge"&&(d.keywords||[]).length)}
function fillRecallSelect(){
  const docs=recallDocs();
  $("#recallSelect").innerHTML=docs.map(d=>`<option value="${escapeHTML(d.id)}">${escapeHTML(d.title)}</option>`).join("");
  if(docs[0])renderRecall(docs[0].id);
}
function renderRecall(id){
  const d=DATA.find(x=>x.id===id);if(!d)return;
  let text=d.content;const answers=[];
  const kws=[...new Set((d.keywords||[]).filter(k=>String(k).length>=2))].sort((a,b)=>b.length-a.length);
  for(const k of kws){
    if(answers.length>=5)break;
    if(text.includes(k)){text=text.replaceAll(k,"＿".repeat(Math.min(8,Math.max(2,k.length))));answers.push(k)}
  }
  $("#recallMeta").textContent=`${d.title} · ${d.source} · 页 ${d.page}`;
  $("#recallText").textContent=text;
  $("#recallAnswer").textContent=answers.length?`答案：${answers.join("、")}`:"当前知识点没有可挖空关键词。";
  $("#recallAnswer").hidden=true;
  $("#showRecallBtn").textContent="显示答案";
}
function switchView(view){
  $$(".view").forEach(v=>v.classList.remove("active"));
  $$(".nav").forEach(n=>n.classList.toggle("active",n.dataset.view===view));
  $("#view-"+view).classList.add("active");
  if(view==="wrong")renderWrong();
}


function runSelfTest(){
  const tests=[];
  const add=(name,ok,detail)=>tests.push({name,ok:!!ok,detail});

  add("资料库加载",Array.isArray(DATA)&&DATA.length===21,`当前 ${DATA.length} 条`);

  const expectedAnswers={
    "q-zj-001":"C","q-zj-002":"D","q-zj-003":"C","q-zj-004":"D","q-zj-005":"A"
  };
  const answerOK=Object.entries(expectedAnswers).every(([id,a])=>DATA.find(d=>d.id===id)?.answer===a);
  add("5 道核对题答案",answerOK,"应为 C / D / C / D / A");

  const cases=[
    ["六艺教育","zj-007"],
    ["稷下学宫","zj-009"],
    ["皮亚杰四阶段","jx-003"],
    ["最近发展区","jx-004"],
    ["第一章知识点一第2题","q-zj-002"]
  ];
  const retrievalOK=cases.every(([q,id])=>rankedData(q,"全部")[0]?.d.id===id);
  add("已知资料检索",retrievalOK,"5/5 典型查询应命中正确首条");

  const ood=["量子色动力学三圈修正","Python装饰器","美国总统是谁"];
  const oodOK=ood.every(q=>rankedData(q,"全部").length===0);
  add("资料外问题拦截",oodOK,"3 个资料外问题必须 0 结果");

  const temp="__study311_selftest__";
  let storageOK=false;
  try{localStorage.setItem(temp,"ok");storageOK=localStorage.getItem(temp)==="ok";localStorage.removeItem(temp)}catch{}
  add("浏览器本地存储",storageOK,"用于保存错题与 AI 开关");

  add("可选 AI 默认安全",!AI_ENABLED || typeof AI_ENABLED==="boolean","AI关闭时不会加载 Puter.js");

  const passed=tests.filter(t=>t.ok).length;
  $("#selfTestScore").textContent=`${passed}/${tests.length} 通过`;
  $("#selfTestList").innerHTML=tests.map(t=>`<div class="selftest-row">
    <span class="${t.ok?"ok":"fail"}">${t.ok?"✓":"×"}</span>
    <div><b>${escapeHTML(t.name)}</b><br><small>${escapeHTML(t.detail)}</small></div>
    <strong class="${t.ok?"ok":"fail"}">${t.ok?"PASS":"FAIL"}</strong>
  </div>`).join("");
  return {passed,total:tests.length,tests};
}

async function init(){
  try{
    DATA=await fetch("./data/knowledge.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error("资料文件读取失败");return r.json()});
  }catch(e){
    $("#resultList").innerHTML=`<div class="empty">资料加载失败：${escapeHTML(e.message)}</div>`;return;
  }
  $("#aiToggle").checked=AI_ENABLED;
  $("#aiToggle").addEventListener("change",e=>{
    AI_ENABLED=e.target.checked;
    localStorage.setItem(AI_KEY,AI_ENABLED?"1":"0");
    renderResults();renderWrong();
    toast(AI_ENABLED?"AI解释已开启（只在点击时调用）":"AI解释已关闭");
  });

  $("#runSelfTestBtn")?.addEventListener("click",runSelfTest);

  renderResults();renderWrong();fillRecallSelect();

  $("#searchBtn").addEventListener("click",renderResults);
  $("#searchInput").addEventListener("keydown",e=>{if(e.key==="Enter")renderResults()});
  $$(".subject").forEach(b=>b.addEventListener("click",()=>{
    $$(".subject").forEach(x=>x.classList.remove("active"));b.classList.add("active");currentSubject=b.dataset.subject;renderResults();
  }));
  $$(".nav").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view)));
  $("#recallSelect").addEventListener("change",e=>renderRecall(e.target.value));
  $("#newRecallBtn").addEventListener("click",()=>{
    const docs=recallDocs();if(!docs.length)return;
    const d=docs[Math.floor(Math.random()*docs.length)];$("#recallSelect").value=d.id;renderRecall(d.id);
  });
  $("#showRecallBtn").addEventListener("click",e=>{
    const box=$("#recallAnswer");box.hidden=!box.hidden;e.currentTarget.textContent=box.hidden?"显示答案":"隐藏答案";
  });
  $("#clearWrongBtn").addEventListener("click",()=>{if(confirm("确定清空错题本？")){saveWrong([]);renderWrong();renderResults()}});
  $("#exportWrongBtn").addEventListener("click",()=>{
    const payload={version:1,wrong_ids:wrongIds(),exported_at:new Date().toISOString()};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="311-wrong-questions.json";a.click();URL.revokeObjectURL(a.href);
  });
  $("#importWrongInput").addEventListener("change",async e=>{
    const f=e.target.files[0];if(!f)return;
    try{const data=JSON.parse(await f.text());if(!Array.isArray(data.wrong_ids))throw new Error();saveWrong(data.wrong_ids);renderWrong();renderResults();toast("错题已导入")}
    catch{toast("导入文件格式不正确")}finally{e.target.value=""}
  });
  if("serviceWorker" in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});
}
init();
