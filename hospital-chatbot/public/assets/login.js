const AUTH_API = "../api/auth.php";

function qs(name) { return new URLSearchParams(location.search).get(name) || ""; }

function getLang(){
  const v = (qs("lang") || localStorage.getItem("curaai_lang") || "ar").toLowerCase();
  return (v === "en") ? "en" : "ar";
}

function applyLang(){
  const lang = getLang();
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";

  const title = document.getElementById("loginTitle");
  const hint  = document.getElementById("loginHint");
  const btn   = document.getElementById("loginSubmit");

  if (lang === "ar"){
    if (title) title.textContent = "تسجيل الدخول";
    if (btn) btn.textContent = "دخول";
    }else{
    if (title) title.textContent = "Login";
    if (btn) btn.textContent = "Login";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applyLang();

  const form = document.getElementById("loginForm");
  const msg = document.getElementById("loginMsg");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (msg) msg.textContent = "";

    const username = (document.getElementById("username")?.value || "").trim();
    const password = (document.getElementById("password")?.value || "").trim();

    if (!username || !password){
      if (msg) msg.textContent = (getLang()==="ar") ? "اكتب اسم المستخدم وكلمة المرور." : "Enter username and password.";
      return;
    }

    try{
      const r = await fetch(AUTH_API, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ action:"login", username, password })
      });

      const data = await r.json();
      if (data.ok){
        window.location.href = `curaai.html?lang=${encodeURIComponent(getLang())}`;
      }else{
        if (msg) msg.textContent = data.error || ((getLang()==="ar") ? "بيانات غير صحيحة." : "Invalid credentials.");
      }
    }catch{
      if (msg) msg.textContent = (getLang()==="ar") ? "فشل الاتصال بالسيرفر." : "Server connection failed.";
    }
  });
});