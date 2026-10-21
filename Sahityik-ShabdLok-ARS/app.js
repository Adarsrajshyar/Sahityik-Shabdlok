const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const modal = $("#authModal");
const toast = $("#toast");
let activeAuth = "phone";
let toastTimer;

$("#year").textContent = new Date().getFullYear();

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}
function openModal() {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setTimeout(() => $("#authContact").focus(), 80);
}
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
$$("[data-open-auth]").forEach(btn => btn.addEventListener("click", openModal));
$$("[data-close-modal]").forEach(btn => btn.addEventListener("click", closeModal));
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

$("#menuToggle").addEventListener("click", () => $("#mainNav").classList.toggle("open"));
$$('#mainNav a').forEach(a => a.addEventListener("click", () => $("#mainNav").classList.remove("open")));

function setAuthMode(mode) {
  activeAuth = mode;
  $$(".auth-tab").forEach(tab => tab.classList.toggle("active", tab.dataset.authTab === mode));
  const label = $("#authLabel"), input = $("#authContact");
  if (mode === "phone") {
    label.textContent = "मोबाइल नंबर";
    input.type = "tel"; input.autocomplete = "tel"; input.placeholder = "+91 मोबाइल नंबर";
  } else {
    label.textContent = "ईमेल पता";
    input.type = "email"; input.autocomplete = "email"; input.placeholder = "आपका ईमेल पता";
  }
  $("#authMessage").textContent = "डेमो मोड: वास्तविक OTP के लिए Supabase कॉन्फ़िगरेशन आवश्यक है।";
}
$$("[data-auth-tab]").forEach(tab => tab.addEventListener("click", () => setAuthMode(tab.dataset.authTab)));
$("#authForm").addEventListener("submit", e => {
  e.preventDefault();
  const value = $("#authContact").value.trim();
  if (!value) return;
  $("#authMessage").textContent = activeAuth === "phone"
    ? "यह अभी डिज़ाइन डेमो है। SMS OTP तभी भेजा जाएगा जब Supabase Auth और SMS प्रदाता सेट होंगे।"
    : "यह अभी डिज़ाइन डेमो है। ईमेल OTP तभी भेजा जाएगा जब Supabase Auth सेट होगा।";
  showToast("लॉगिन स्क्रीन डेमो मोड में है — README में सेटअप निर्देश देखें।");
});

$$(".like-btn").forEach(btn => btn.addEventListener("click", () => {
  btn.classList.toggle("liked");
  btn.textContent = btn.classList.contains("liked") ? "पसंद किया" : "पसंद";
  showToast(btn.classList.contains("liked") ? "यह नमूना रचना आपकी पसंद में जोड़ी गई (केवल इस पेज पर)।" : "पसंद हटाई गई।");
}));
$$("[data-category]").forEach(btn => btn.addEventListener("click", () => {
  showToast(`${btn.dataset.category} चुना गया। वास्तविक श्रेणी पेज डेटाबेस जुड़ने के बाद दिखेगा।`);
}));
$$("[data-policy]").forEach(link => link.addEventListener("click", e => {
  e.preventDefault();
  const messages = {
    privacy: "गोपनीयता नीति: मोबाइल, ईमेल और निजी प्रोफाइल जानकारी सार्वजनिक नहीं होगी। लॉन्च से पहले पूर्ण कानूनी नीति जोड़ें।",
    copyright: "कॉपीराइट नीति: केवल अपनी मौलिक रचना या स्पष्ट अनुमति वाली सामग्री जमा करें। प्रकाशन से पहले लेखक की सहमति आवश्यक होगी।",
    terms: "नियम व शर्तें: रचनाएँ समीक्षा के बाद प्रकाशित होंगी। प्रमाणपत्र ARS द्वारा जारी सहभागिता/योगदान रिकॉर्ड होंगे, सरकारी योग्यता नहीं।",
    contact: "संपर्क: लॉन्च से पहले आधिकारिक संपर्क ईमेल और सहायता प्रक्रिया यहाँ जोड़ें।"
  };
  showToast(messages[link.dataset.policy] || "यह सेक्शन जल्द उपलब्ध होगा।");
}));

// No real authentication or certificate issuance occurs in this static starter.
