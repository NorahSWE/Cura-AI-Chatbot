const CHAT_API = "../api/chat.php";
const AUTH_API = "../api/auth.php";

function qs(name) { return new URLSearchParams(location.search).get(name) || ""; }

function setQs(name, value){
  const u = new URL(window.location.href);
  if (!value) u.searchParams.delete(name);
  else u.searchParams.set(name, value);
  window.history.replaceState({}, "", u.toString());
}

function getLang() {
  const url = (qs("lang") || "").toLowerCase();
  if (url === "ar" || url === "en") return url;

  const saved = (localStorage.getItem("curaai_lang") || "").toLowerCase();
  if (saved === "ar" || saved === "en") return saved;

  return "ar";
}
function setLang(lang){
  localStorage.setItem("curaai_lang", lang);
  setQs("lang", lang);
}

async function authStatus(){
  try{
    const r = await fetch(AUTH_API, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ action:"status" })});
    const data = await r.json();
    return !!data.logged_in;
  }catch{
    return false;
  }
}
async function logout(){
  try{
    await fetch(AUTH_API, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ action:"logout" })});
  }catch{}
  window.location.href = `curaai.html?lang=${encodeURIComponent(getLang())}`;
}

function applyLangUI(){
  const lang = getLang();
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";

  const input = document.getElementById("chatInput");
  if (input) input.placeholder = (lang === "ar") ? "اكتب رسالتك..." : "Type your message...";

  const sub = document.getElementById("chatSubTitle");
  if (sub) sub.textContent = (lang === "ar") ? "مساعد صحي" : "Healthcare Assistant";

  const historyTitle = document.getElementById("historyTitle");
  if (historyTitle) historyTitle.textContent = (lang === "ar") ? "آخر المحادثات" : "Chats";
}

function addMsg(role, text){
  const box = document.getElementById("chatMessages");
  if (!box) return;

  const row = document.createElement("div");
  row.className = `msg-row ${role}`;

  if (role === "bot"){
    const avatar = document.createElement("img");
    avatar.className = "bot-avatar";
    avatar.src = "assets/logo.png";
    avatar.alt = "Hospital Logo";
    row.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = `msg ${role}`;
  bubble.textContent = text;

  row.appendChild(bubble);
  box.appendChild(row);
  box.scrollTop = box.scrollHeight;

  historyAddMessage(activeChatId(), role, text);
}

function drawMsgOnly(role, text){
  const box = document.getElementById("chatMessages");
  if (!box) return;

  const row = document.createElement("div");
  row.className = `msg-row ${role}`;

  if (role === "bot"){
    const avatar = document.createElement("img");
    avatar.className = "bot-avatar";
    avatar.src = "assets/logo.png";
    avatar.alt = "Hospital Logo";
    row.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = `msg ${role}`;
  bubble.textContent = text;

  row.appendChild(bubble);
  box.appendChild(row);
  box.scrollTop = box.scrollHeight;
}

function renderSuggestions(list){
  const wrap = document.getElementById("chatSuggestions");
  if (!wrap) return;

  wrap.innerHTML = "";
  (list || []).forEach(t=>{
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sugg";
    b.textContent = t;
    b.onclick = () => {
      const input = document.getElementById("chatInput");
      if (input) input.value = t;
      sendFromInput();
    };
    wrap.appendChild(b);
  });
}

const HISTORY_KEY = "curaai_history_v2";

function readHistory(){
  try{ return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
  catch{ return []; }
}
function writeHistory(arr){ localStorage.setItem(HISTORY_KEY, JSON.stringify(arr)); }

function uuid(){
  return "c_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function activeChatId(){
  let id = qs("chat");
  if (!id){
    id = uuid();
    setQs("chat", id);
  }
  return id;
}

function ensureChatExists(id){
  const h = readHistory();
  let chat = h.find(x => x.id === id);
  if (!chat){
    chat = { id, title: "", updatedAt: Date.now(), messages: [] };
    h.unshift(chat);
    writeHistory(h);
  }
  return chat;
}

function historyAddMessage(id, role, text){
  const h = readHistory();
  let chat = h.find(x => x.id === id);
  if (!chat){
    chat = { id, title: "", updatedAt: Date.now(), messages: [] };
    h.unshift(chat);
  }

  if (!chat.title && role === "user"){
    chat.title = (text || "").trim().slice(0, 40) || (getLang()==="ar" ? "محادثة جديدة" : "New chat");
  }

  chat.messages = chat.messages || [];
  chat.messages.push({ role, text, t: Date.now() });
  chat.updatedAt = Date.now();

  const MAX_MSG = 80;
  if (chat.messages.length > MAX_MSG) chat.messages = chat.messages.slice(-MAX_MSG);

  const MAX_CHATS = 30;
  const newArr = [chat, ...h.filter(x => x.id !== id)].slice(0, MAX_CHATS);
  writeHistory(newArr);

  renderHistoryList();
}

function deleteChat(id){
  const h = readHistory().filter(x => x.id !== id);
  writeHistory(h);

  if (qs("chat") === id){
    const newId = uuid();
    setQs("chat", newId);
    ensureChatExists(newId);
    const box = document.getElementById("chatMessages");
    if (box) box.innerHTML = "";
    renderSuggestions([]);
    addMsg("bot", (getLang()==="ar") ? "تم بدء محادثة جديدة." : "Started a new chat.");
  }
  renderHistoryList();
}

function renderHistoryList(){
  const list = document.getElementById("historyList");
  if (!list) return;

  const h = readHistory();
  list.innerHTML = "";

  if (h.length === 0){
    const empty = document.createElement("div");
    empty.className = "history-empty";
    empty.textContent = (getLang()==="ar") ? "لا توجد محادثات بعد." : "No chats yet.";
    list.appendChild(empty);
    return;
  }

  h.forEach(chat=>{
    const item = document.createElement("div");
    item.className = "history-row";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "history-item";
    btn.title = chat.title || "Chat";
    btn.innerHTML = `
      <div class="history-item-title">${escapeHtml(chat.title || (getLang()==="ar" ? "محادثة جديدة" : "New chat"))}</div>
      <div class="history-item-time">${formatTime(chat.updatedAt)}</div>
    `;
    btn.onclick = () => openChat(chat.id);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "history-del";
    del.title = (getLang()==="ar") ? "حذف" : "Delete";
    del.textContent = "🗑";
    del.onclick = (e) => {
      e.stopPropagation();
      deleteChat(chat.id);
    };

    item.appendChild(btn);
    item.appendChild(del);
    list.appendChild(item);
  });
}

function openChat(id){
  setQs("chat", id);

  const h = readHistory();
  const chat = h.find(x => x.id === id);

  const box = document.getElementById("chatMessages");
  if (box) box.innerHTML = "";
  renderSuggestions([]);

  if (chat && Array.isArray(chat.messages)){
    chat.messages.forEach(m => drawMsgOnly(m.role, m.text));
  }else{
    addMsg("bot", (getLang()==="ar") ? "تم فتح محادثة جديدة." : "Opened a new chat.");
  }
}

function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function formatTime(ms){
  try{
    const d = new Date(ms || Date.now());
    return d.toLocaleString(undefined, { month:"short", day:"2-digit" });
  }catch{ return ""; }
}

async function sendToBot(message) {
  addMsg("user", message);
  const lang = getLang();

  try {
    const r = await fetch(CHAT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, lang }),
    });

    const text = await r.text();

    if (!r.ok) {
      addMsg("bot", `⚠️ Server error (${r.status}).\n${text.slice(0, 200)}`);
      return;
    }

    let data;
    try { data = JSON.parse(text); }
    catch {
      addMsg("bot", "⚠️ API returned invalid JSON.\n" + text.slice(0, 200));
      return;
    }

    addMsg("bot", data.reply || "...");
    renderSuggestions(data.suggestions || []);
  } catch (e) {
    console.error(e);
    addMsg("bot", (getLang()==="ar")
      ? "⚠️ فشل الاتصال.\nتأكد Apache شغال وداخل من localhost."
      : "⚠️ Network failed.\nCheck Apache and localhost.");
  }
}

async function sendFromInput() {
  const input = document.getElementById("chatInput");
  if (!input) return;

  const msg = (input.value || "").trim();
  if (!msg) return;

  input.value = "";
  input.focus();
  await sendToBot(msg);
}

let drawerOpen = false;
let closeTimer = null;

function openDrawer(){
  const d = document.getElementById("historyDrawer");
  if (!d) return;
  d.classList.add("open");
  drawerOpen = true;
}
function closeDrawer(){
  const d = document.getElementById("historyDrawer");
  if (!d) return;
  d.classList.remove("open");
  drawerOpen = false;
}
function scheduleClose(ms=250){
  clearTimeout(closeTimer);
  closeTimer = setTimeout(()=> closeDrawer(), ms);
}

document.addEventListener("DOMContentLoaded", async () => {
  const logged = await authStatus();
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (loginBtn && logoutBtn){
    if (logged){
      loginBtn.style.display = "none";
      logoutBtn.style.display = "inline-flex";
    }else{
      loginBtn.style.display = "inline-flex";
      logoutBtn.style.display = "none";
    }
    loginBtn.onclick = () => window.location.href = `login.html?lang=${encodeURIComponent(getLang())}`;
    logoutBtn.onclick = logout;
  }

  applyLangUI();
  setLang(getLang()); 

  ensureChatExists(activeChatId());
  renderHistoryList();
  openChat(activeChatId());

  document.getElementById("langBtn")?.addEventListener("click", () => {
    const next = (getLang() === "ar") ? "en" : "ar";
    setLang(next);
    applyLangUI();
    renderHistoryList();
  });

  document.getElementById("backBtn")?.addEventListener("click", () => {
    window.location.href = `curaai.html?lang=${encodeURIComponent(getLang())}`;
  });

  document.getElementById("newChatBtn")?.addEventListener("click", () => {
    const id = uuid();
    setQs("chat", id);

    const box = document.getElementById("chatMessages");
    if (box) box.innerHTML = "";
    renderSuggestions([]);

    ensureChatExists(id);
    renderHistoryList();

    addMsg("bot", (getLang()==="ar")
      ? "مرحباً! أنا CuraAI. كيف أقدر أساعدك اليوم؟"
      : "Hi! I’m CuraAI. How can I help you today?");
    document.getElementById("chatInput")?.focus();
  });

  document.getElementById("chatForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await sendFromInput();
  });

  const prefill = (qs("q") || "").trim();
  if (prefill){
    const input = document.getElementById("chatInput");
    if (input) input.value = prefill;
    sendFromInput();
  } else {
    const h = readHistory();
    const cur = h.find(x => x.id === activeChatId());
    if (!cur || !cur.messages || cur.messages.length === 0){
      addMsg("bot", (getLang()==="ar")
        ? "مرحباً! أنا CuraAI. كيف أقدر أساعدك اليوم؟"
        : "Hi! I’m CuraAI. How can I help you today?");
    }
  }

  const hotspot = document.getElementById("historyHotspot");
  const drawer = document.getElementById("historyDrawer");
  const closeBtn = document.getElementById("historyCloseBtn");

  hotspot?.addEventListener("mouseenter", () => openDrawer());
  hotspot?.addEventListener("mouseleave", () => scheduleClose(200));

  drawer?.addEventListener("mouseenter", () => {
    clearTimeout(closeTimer);
    openDrawer();
  });
  drawer?.addEventListener("mouseleave", () => scheduleClose(250));

  closeBtn?.addEventListener("click", () => closeDrawer());

  document.addEventListener("mousemove", (e) => {
    const edge = 10; 
    if (e.clientX <= edge) openDrawer();
    else if (drawerOpen) scheduleClose(250);
  });
});