const AUTH_API = "../api/auth.php";

function qs(name) {
  return new URLSearchParams(location.search).get(name) || "";
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
  const u = new URL(window.location.href);
  u.searchParams.set("lang", lang);
  window.history.replaceState({}, "", u.toString());
}

function setText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}

function setPlaceholder(id, txt) {
  const el = document.getElementById(id);
  if (el) el.placeholder = txt;
}

const i18n = {
  ar: {
    dir: "rtl",
    title: "CuraAI",
    tagline: "تشات بوت طبي ذكي خاص بمستشفى الملك خالد بحائل، يهدف إلى مساعدة المرضى في الوصول السريع للمعلومات والخدمات الصحية.",
    desc: "CuraAI تشات بوت طبي ذكي خاص بمستشفى الملك خالد بحائل، يهدف إلى مساعدة المرضى في الوصول السريع للمعلومات والخدمات الصحية.",
    askPlaceholder: "اسأل CuraAI",
    emTitle: "الطوارئ",
    emDesc: "الاتصال السريع بالإسعاف",
    bookTitle: "حجز المواعيد",
    bookDesc: "التواصل عبر واتساب",
    clinicsTitle: "مواعيد العيادات",
    clinicsDesc: "من الأحد إلى الخميس: 8 صباحًا إلى 4 مساءً",
    locTitle: "موقع المستشفى",
    locDesc: "عرض الموقع على الخريطة",
    clinicsPrefill: "مواعيد العيادات",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج"
  },
  en: {
    dir: "ltr",
    title: "CuraAI",
    tagline: "A smart medical chatbot for King Khalid Hospital (Hail).",
    desc: "CuraAI is a smart medical chatbot for King Khalid Hospital (Hail) to help patients access information and services quickly.",
    askPlaceholder: "Ask CuraAI",
    emTitle: "Emergency",
    emDesc: "Quick access to emergency services",
    bookTitle: "Appointments",
    bookDesc: "Contact via WhatsApp",
    clinicsTitle: "Clinic Hours",
    clinicsDesc: "Sun–Thu: 8:00 AM to 4:00 PM",
    locTitle: "Hospital Location",
    locDesc: "Open location on map",
    clinicsPrefill: "Clinic hours",
    login: "Login",
    logout: "Logout"
  }
};

function applyLang() {
  const lang = getLang();
  document.documentElement.lang = lang;
  document.documentElement.dir = i18n[lang].dir;

  setText("appTitle", i18n[lang].title);
  setText("appTagline", i18n[lang].tagline);
  setText("appDesc", i18n[lang].desc);
  setPlaceholder("askInput", i18n[lang].askPlaceholder);

  setText("emTitle", i18n[lang].emTitle);
  setText("emDesc", i18n[lang].emDesc);
  setText("bookTitle", i18n[lang].bookTitle);
  setText("bookDesc", i18n[lang].bookDesc);
  setText("clinicsTitle", i18n[lang].clinicsTitle);
  setText("clinicsDesc", i18n[lang].clinicsDesc);
  setText("locTitle", i18n[lang].locTitle);
  setText("locDesc", i18n[lang].locDesc);
}

function callEmergency() {
  window.location.href = "tel:997";
}

function openWhatsApp() {
  const phone = "966165434554";
  const lang = getLang();
  const msg = encodeURIComponent(lang === "ar" ? "السلام عليكم، أود حجز موعد." : "Hello, I would like to book an appointment.");
  window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
}

function openLocation() {
  window.open("https://maps.app.goo.gl/CALQcUM2G8CXX4Vj8?g_st=ic", "_blank");
}

function goToChat(prefill = "") {
  const lang = getLang();
  const q = encodeURIComponent(prefill || "");
  window.location.href = `curaaichat.html?lang=${encodeURIComponent(lang)}&q=${q}`;
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

document.addEventListener("DOMContentLoaded", async () => {

  applyLang();

  document.getElementById("btnEmergency")?.addEventListener("click", callEmergency);
  document.getElementById("btnBook")?.addEventListener("click", openWhatsApp);
  document.getElementById("btnLocation")?.addEventListener("click", openLocation);
  document.getElementById("btnClinics")?.addEventListener("click", () => goToChat(i18n[getLang()].clinicsPrefill));

  document.getElementById("chatBtn")?.addEventListener("click", () => goToChat(""));
  document.getElementById("newChatBtn")?.addEventListener("click", () => goToChat(""));

  const ask = document.getElementById("askInput");
  if (ask) {
    ask.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const msg = (ask.value || "").trim();
        if (!msg) return;
        goToChat(msg);
      }
    });
  }

  document.getElementById("langBtn")?.addEventListener("click", () => {
    const next = (getLang() === "ar") ? "en" : "ar";
    setLang(next);
    applyLang();
  });

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

    loginBtn.addEventListener("click", () => {
      window.location.href = `login.html?lang=${encodeURIComponent(getLang())}`;
    });
    logoutBtn.addEventListener("click", logout);
  }
});