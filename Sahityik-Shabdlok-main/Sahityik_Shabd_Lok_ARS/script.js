/* ARS Sahityik Shabd Lok
   Supabase project URL + anon key are public client settings.
   Never place service_role keys or passwords in this file. */
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const supabaseReady = window.supabase && SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("YOUR_") && !SUPABASE_ANON_KEY.includes("YOUR_");
const db = supabaseReady ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let authMode = "login";
let currentUser = null;
let currentProfile = null;
let currentCategory = "सभी";
let remoteWorks = [];

const $ = (id) => document.getElementById(id);
const toast = (message) => {
  const el = $("toast"); el.textContent = message; el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3200);
};
const escapeHTML = (value="") => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const demoWorks = [
  {title:"हौसले की राह",category:"प्रेरणादायक",type:"शायरी",author_name:"ARS संग्रह",body:"राहों में धूप हो तो हौसला बनाए रखना,\nमंज़िल मिले न मिले, कदम बढ़ाए रखना।\nवक़्त भी झुकता है मेहनत के सामने,\nबस अपने सपनों से रिश्ता बनाए रखना।"},
  {title:"दोस्ती का अर्थ",category:"दोस्ती",type:"शायरी",author_name:"ARS संग्रह",body:"कुछ रिश्ते नाम के मोहताज नहीं होते,\nहर पल साथ हों, यह ज़रूरी नहीं होते।\nजो यादों में भी मुस्कान छोड़ जाएँ,\nवही दोस्त कभी आम नहीं होते।"},
  {title:"अनकहा एहसास",category:"प्रेम",type:"शायरी",author_name:"ARS संग्रह",body:"शब्द कम पड़ें तो ख़ामोशी पढ़ लेना,\nकभी आँखों में छिपी बात भी समझ लेना।\nहर एहसास कहा नहीं जाता ज़ुबाँ से,\nकभी दिल की लिखावट भी पढ़ लेना।"}
];

function renderWorks() {
  const grid = $("shayariGrid");
  const all = [...demoWorks, ...remoteWorks];
  const query = ($("searchInput").value || "").trim().toLowerCase();
  const visible = all.filter(w => (currentCategory === "सभी" || w.category === currentCategory) &&
    `${w.title||""} ${w.author_name||""} ${w.body||""}`.toLowerCase().includes(query));
  grid.innerHTML = visible.map(w => `<article class="writing-card"><span class="tag">${escapeHTML(w.category||w.type||"रचना")}</span><h3>${escapeHTML(w.title||"शीर्षक रहित")}</h3><p>${escapeHTML(w.body||"").replace(/\n/g,"<br>")}</p><footer><span>${escapeHTML(w.author_name||"ARS लेखक")}</span><button class="share-btn" data-share="${escapeHTML((w.title||"रचना")+" — "+(w.body||"").slice(0,90))}">↗ साझा करें</button></footer></article>`).join("");
  $("emptyState").classList.toggle("hidden", visible.length !== 0);
  $("resultCount").textContent = `${visible.length} रचनाएँ`;
}
async function loadWorks() {
  if (!db) return;
  const {data,error} = await db.from("submissions").select("title,category,type,author_name,body").eq("status","published").order("created_at",{ascending:false}).limit(60);
  if (!error && data) { remoteWorks = data; renderWorks(); }
}
async function loadProfile(user) {
  if (!db || !user) return null;
  const {data,error} = await db.from("profiles").select("id,display_name,role").eq("id",user.id).maybeSingle();
  if (error) { console.error(error); return null; }
  return data;
}
function openAuth(mode="login") {
  authMode=mode; setAuthTab(); $("authModal").classList.remove("hidden");
}
function setAuthTab() {
  document.querySelectorAll(".auth-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.auth===authMode));
  $("displayNameWrap").classList.toggle("hidden",authMode!=="signup");
  $("authSubmit").textContent=authMode==="signup"?"खाता बनाएँ":"लॉगिन करें";
  $("authTitle").textContent=authMode==="signup"?"नया लेखक खाता":"समुदाय में लॉगिन";
}
async function refreshSession() {
  if (!db) return;
  const {data} = await db.auth.getSession();
  currentUser = data.session?.user || null;
  currentProfile = currentUser ? await loadProfile(currentUser) : null;
  updateAuthButton();
}
function updateAuthButton() {
  $("openAuth").textContent = currentUser ? "मेरा डैशबोर्ड" : "लॉगिन / जुड़ें";
  $("submissionMessage").textContent = currentUser ? "आप लॉगिन हैं। अपनी मौलिक रचना भेजें।" : "रचना भेजने के लिए पहले लॉगिन करें।";
}
async function handleAuthSubmit(event) {
  event.preventDefault();
  if (!db) return $("authMessage").textContent="पहले README के अनुसार Supabase URL और anon key जोड़ें।";
  const form=new FormData(event.currentTarget), email=form.get("email"), password=form.get("password");
  $("authSubmit").disabled=true;
  try {
    if(authMode==="signup") {
      const display_name=String(form.get("display_name")||"").trim();
      const {data,error}=await db.auth.signUp({email,password,options:{data:{display_name}}});
      if(error) throw error;
      if(data.user && data.session) {
        await db.from("profiles").upsert({id:data.user.id,display_name,role:"author"});
      }
      $("authMessage").textContent="खाता अनुरोध भेज दिया गया। ईमेल सत्यापन पूरा करें, यदि माँगा जाए।";
    } else {
      const {error}=await db.auth.signInWithPassword({email,password});
      if(error) throw error;
      await refreshSession(); $("authModal").classList.add("hidden"); toast("लॉगिन सफल।");
    }
  } catch(err) { $("authMessage").textContent=err.message || "प्रक्रिया पूरी नहीं हो सकी।"; }
  finally { $("authSubmit").disabled=false; }
}
async function handleSubmission(event) {
  event.preventDefault();
  if(!currentUser) return openAuth("login");
  if(!db) return $("submissionMessage").textContent="Supabase सेटअप पूरा होने के बाद रचनाएँ सुरक्षित रूप से जमा होंगी।";
  const form=new FormData(event.currentTarget);
  const payload={user_id:currentUser.id,author_name:String(form.get("author_name")).trim(),title:String(form.get("title")).trim(),type:form.get("type"),category:form.get("category"),body:String(form.get("body")).trim(),status:"pending"};
  try {
    const {error}=await db.from("submissions").insert(payload);
    if(error) throw error;
    event.currentTarget.reset(); $("submissionMessage").textContent="रचना समीक्षा के लिए जमा हो गई है।";
    toast("रचना सफलतापूर्वक जमा हुई।");
  } catch(err) { $("submissionMessage").textContent=err.message || "रचना जमा नहीं हो सकी।"; }
}
async function openDashboard() {
  if(!currentUser) return openAuth("login");
  $("dashboardModal").classList.remove("hidden");
  $("dashboardTitle").textContent=`नमस्ते, ${currentProfile?.display_name || currentUser.email}`;
  const role=currentProfile?.role || "author";
  if(!db) { $("dashboardContent").innerHTML="<p>डैशबोर्ड इस्तेमाल करने के लिए Supabase सेटअप आवश्यक है।</p>"; return; }
  if(role==="admin" || role==="publisher") await renderReviewDashboard(role);
  else await renderAuthorDashboard();
}
async function renderAuthorDashboard() {
  const {data,error}=await db.from("submissions").select("id,title,type,status,created_at").eq("user_id",currentUser.id).order("created_at",{ascending:false}).limit(30);
  if(error) { $("dashboardContent").textContent=error.message; return; }
  $("dashboardContent").innerHTML=`<h3>मेरी रचनाएँ</h3><div class="dashboard-list">${(data||[]).map(x=>`<div class="dashboard-item"><h4>${escapeHTML(x.title)}</h4><p>${escapeHTML(x.type)} • स्थिति: <b>${escapeHTML(x.status)}</b></p></div>`).join("")||"<p>अभी कोई रचना जमा नहीं की गई।</p>"}</div>`;
}
async function renderReviewDashboard(role) {
  const {data,error}=await db.from("submissions").select("*").eq("status","pending").order("created_at",{ascending:true}).limit(50);
  if(error) { $("dashboardContent").textContent=error.message; return; }
  $("dashboardContent").innerHTML=`<h3>${role==="admin"?"Admin":"Publisher"} समीक्षा पैनल</h3><div class="dashboard-list">${(data||[]).map(x=>`<div class="dashboard-item"><h4>${escapeHTML(x.title)} <small>(${escapeHTML(x.type)})</small></h4><p>लेखक: ${escapeHTML(x.author_name)} • श्रेणी: ${escapeHTML(x.category)}</p><p>${escapeHTML(x.body)}</p><div class="dashboard-actions"><button class="small-btn approve" data-review="${x.id}" data-status="published">स्वीकृत / प्रकाशित</button><button class="small-btn reject" data-review="${x.id}" data-status="rejected">अस्वीकृत</button></div></div>`).join("")||"<p>कोई लंबित रचना नहीं है।</p>"}</div>`;
}
async function reviewSubmission(id,status) {
  const {error}=await db.from("submissions").update({status,reviewed_by:currentUser.id,reviewed_at:new Date().toISOString()}).eq("id",id);
  if(error) return toast(error.message);
  toast(status==="published"?"रचना प्रकाशित हुई।":"रचना अस्वीकृत हुई।");
  await renderReviewDashboard(currentProfile?.role||"publisher"); await loadWorks();
}
async function logout() {
  if(db) await db.auth.signOut();
  currentUser=null; currentProfile=null; updateAuthButton();
  $("dashboardModal").classList.add("hidden"); toast("आप लॉगआउट हो गए हैं।");
}
function setupUI() {
  $("year").textContent=new Date().getFullYear();
  $("menuToggle").addEventListener("click",()=>$("mainNav").classList.toggle("open"));
  document.querySelectorAll("#mainNav a").forEach(a=>a.addEventListener("click",()=>$("mainNav").classList.remove("open")));
  $("openAuth").addEventListener("click",()=>currentUser?openDashboard():openAuth());
  $("closeAuth").addEventListener("click",()=>$("authModal").classList.add("hidden"));
  $("closeDashboard").addEventListener("click",()=>$("dashboardModal").classList.add("hidden"));
  $("logoutButton").addEventListener("click",logout);
  document.querySelectorAll(".auth-tabs button").forEach(b=>b.addEventListener("click",()=>{authMode=b.dataset.auth;setAuthTab();}));
  $("authForm").addEventListener("submit",handleAuthSubmit);
  $("submissionForm").addEventListener("submit",handleSubmission);
  $("searchInput").addEventListener("input",renderWorks);
  $("categoryFilters").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;currentCategory=b.dataset.category;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));renderWorks();});
  document.addEventListener("click",e=>{
    const share=e.target.closest("[data-share]");
    if(share){const text=share.dataset.share;if(navigator.share)navigator.share({title:"साहित्यिक शब्द लोक",text}).catch(()=>{});else if(navigator.clipboard){navigator.clipboard.writeText(text).then(()=>toast("रचना कॉपी हो गई।"));}}
    const review=e.target.closest("[data-review]");
    if(review)reviewSubmission(review.dataset.review,review.dataset.status);
  });
  if(!db) $("submissionMessage").textContent="डेमो मोड: सुरक्षित सबमिशन और लॉगिन चालू करने के लिए Supabase सेटअप करें।";
}
document.addEventListener("DOMContentLoaded",async()=>{setupUI();renderWorks();if(db){await refreshSession();db.auth.onAuthStateChange(()=>setTimeout(refreshSession,0));await loadWorks();}});
