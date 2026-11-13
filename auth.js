/* =====================================
   SAHITYIK SHABDLOK - ARS
   Email OTP Authentication
===================================== */

"use strict";

let pendingAuthEmail = "";
let pendingAuthType = "";
let pendingRegistration = null;

/* -------------------------------------
   1. SUPABASE CLIENT
------------------------------------- */

function getSupabase() {

  // Check commonly used client names
  const existingClient =
    window.supabaseClient ||
    window.arsSupabaseClient ||
    window.supabaseInstance ||
    window.sbClient;

  if (existingClient && existingClient.auth) {
    return existingClient;
  }

  // Check a globally declared client
  try {
    if (
      typeof supabaseClient !== "undefined" &&
      supabaseClient.auth
    ) {
      return supabaseClient;
    }
  } catch (error) {
    // Continue to configuration fallback
  }

  try {
    if (
      typeof supabase !== "undefined" &&
      supabase.auth
    ) {
      return supabase;
    }
  } catch (error) {
    // Continue to configuration fallback
  }

  // Read available configuration
  const config =
    window.SUPABASE_CONFIG ||
    window.supabaseConfig ||
    window.ARS_SUPABASE_CONFIG ||
    {};

  let projectUrl =
    config.url ||
    config.supabaseUrl ||
    config.SUPABASE_URL ||
    window.SUPABASE_URL ||
    window.supabaseUrl;

  let publishableKey =
    config.key ||
    config.anonKey ||
    config.publishableKey ||
    config.supabaseKey ||
    config.SUPABASE_ANON_KEY ||
    config.SUPABASE_PUBLISHABLE_KEY ||
    window.SUPABASE_ANON_KEY ||
    window.SUPABASE_PUBLISHABLE_KEY;

  // Check globally declared configuration constants
  try {
    if (!projectUrl && typeof SUPABASE_URL !== "undefined") {
      projectUrl = SUPABASE_URL;
    }

    if (!publishableKey && typeof SUPABASE_ANON_KEY !== "undefined") {
      publishableKey = SUPABASE_ANON_KEY;
    }
  } catch (error) {
    // Configuration may not use global constants
  }

  // Create a browser client if configuration is available
  if (
    window.supabase &&
    typeof window.supabase.createClient === "function" &&
    projectUrl &&
    publishableKey
  ) {

    window.arsSupabaseClient =
      window.supabase.createClient(
        projectUrl,
        publishableKey,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
          }
        }
      );

    return window.arsSupabaseClient;
  }

  throw new Error(
    "Supabase कनेक्शन नहीं मिला। supabase-config.js और supabase-client.js की जाँच करें।"
  );
}


/* -------------------------------------
   2. MESSAGE DISPLAY
------------------------------------- */

function showMessage(elementId, message, type = "success") {

  const element = document.getElementById(elementId);

  if (!element) return;

  element.textContent = message;
  element.className = "auth-message show " + type;
}


/* -------------------------------------
   3. BUTTON LOADING STATE
------------------------------------- */

function setButtonLoading(button, loading, originalText) {

  if (!button) return;

  button.disabled = loading;

  button.textContent = loading
    ? "कृपया प्रतीक्षा करें..."
    : originalText;
}


/* -------------------------------------
   4. SEND EMAIL OTP
------------------------------------- */

async function sendOtp(email, type, metadata = null) {

  const client = getSupabase();

  const options = {
    shouldCreateUser: type === "register"
  };

  if (metadata) {
    options.data = metadata;
  }

  const { error } = await client.auth.signInWithOtp({
    email,
    options
  });

  if (error) {
    throw error;
  }

  pendingAuthEmail = email;
  pendingAuthType = type;
}


/* -------------------------------------
   5. LOGIN OTP REQUEST
------------------------------------- */

async function sendLoginOtp(event) {

  event.preventDefault();

  const emailInput = document.getElementById("login-email");
  const button = document.getElementById("send-otp-button");
  const email = emailInput.value.trim();

  if (!email) {
    showMessage(
      "login-message",
      "कृपया अपना ईमेल पता दर्ज करें।",
      "error"
    );
    return;
  }

  setButtonLoading(button, true, "OTP भेजें");

  try {

    await sendOtp(email, "login");

    document
      .getElementById("login-otp-section")
      .classList.add("visible");

    document.getElementById("login-otp").required = true;

    document
      .getElementById("login-email-section")
      .style.display = "none";

    showMessage(
      "login-message",
      "यदि इस ईमेल से खाता मौजूद है, तो OTP भेज दिया गया है। अपना ईमेल जाँचें।"
    );

  } catch (error) {

    console.error("Login OTP error:", error);

    showMessage(
      "login-message",
      error.message || "OTP भेजने में समस्या हुई।",
      "error"
    );

  } finally {

    setButtonLoading(button, false, "OTP भेजें");

  }
}


/* -------------------------------------
   6. REGISTRATION OTP REQUEST
------------------------------------- */

async function sendRegistrationOtp(event) {

  event.preventDefault();

  const form = document.getElementById("register-form");

  if (!form.reportValidity()) {
    return;
  }

  const fullName =
    document.getElementById("full-name").value.trim();

  const email =
    document.getElementById("register-email").value.trim();

  const displayName =
    document.getElementById("display-name").value.trim();

  const requestedRole =
    document.getElementById("user-role").value;

  const bio =
    document.getElementById("register-bio").value.trim();

  const consent =
    document.getElementById("register-consent").checked;

  const button =
    document.getElementById("send-register-otp");

  if (!consent) {
    showMessage(
      "register-message",
      "कृपया नियम एवं शर्तें स्वीकार करें।",
      "error"
    );
    return;
  }

  if (!fullName || !email) {
    showMessage(
      "register-message",
      "नाम और ईमेल आवश्यक हैं।",
      "error"
    );
    return;
  }

  // Only Reader and Author can be requested here.
  // Publisher and Admin permissions must be assigned securely.
  if (!["reader", "author"].includes(requestedRole)) {
    showMessage(
      "register-message",
      "चयनित भूमिका मान्य नहीं है।",
      "error"
    );
    return;
  }

  const metadata = {
    full_name: fullName,
    display_name: displayName || fullName,
    requested_role: requestedRole,
    bio: bio
  };

  setButtonLoading(
    button,
    true,
    "ईमेल पर OTP भेजें"
  );

  try {

    await sendOtp(email, "register", metadata);

    pendingRegistration = metadata;

    document
      .getElementById("register-otp-section")
      .classList.add("visible");

    document
      .getElementById("register-details")
      .style.display = "none";

    document.getElementById("register-otp").required = true;

    showMessage(
      "register-message",
      "OTP आपके ईमेल पर भेज दिया गया है। अपना ईमेल जाँचें।"
    );

  } catch (error) {

    console.error("Registration OTP error:", error);

    showMessage(
      "register-message",
      error.message || "पंजीकरण OTP भेजने में समस्या हुई।",
      "error"
    );

  } finally {

    setButtonLoading(
      button,
      false,
      "ईमेल पर OTP भेजें"
    );

  }
}


/* -------------------------------------
   7. VERIFY OTP
------------------------------------- */

async function verifyOtp() {

  const isRegistration = pendingAuthType === "register";

  const inputId = isRegistration
    ? "register-otp"
    : "login-otp";

  const messageId = isRegistration
    ? "register-message"
    : "login-message";

  const buttonId = isRegistration
    ? "register-verify-button"
    : "verify-otp-button";

  const buttonText = isRegistration
    ? "OTP सत्यापित करें और खाता बनाएँ"
    : "OTP सत्यापित करें और लॉगिन करें";

  const button = document.getElementById(buttonId);
  const token = document.getElementById(inputId).value.trim();

  if (!pendingAuthEmail) {
    showMessage(
      messageId,
      "पहले अपने ईमेल पर OTP भेजें।",
      "error"
    );
    return;
  }

  if (!/^[0-9]{6}$/.test(token)) {
    showMessage(
      messageId,
      "कृपया सही 6 अंकों का OTP दर्ज करें।",
      "error"
    );
    return;
  }

  setButtonLoading(button, true, buttonText);

  try {

    const client = getSupabase();

    const { data, error } = await client.auth.verifyOtp({
      email: pendingAuthEmail,
      token,
      type: "email"
    });

    if (error) {
      throw error;
    }

    if (!data || !data.user) {
      throw new Error(
        "उपयोगकर्ता सत्यापन पूरा नहीं हो सका।"
      );
    }

    showMessage(
      messageId,
      isRegistration
        ? "आपका ईमेल सत्यापित हो गया है। खाता तैयार किया जा रहा है..."
        : "लॉगिन सफल रहा। आपका स्वागत है!"
    );

    // Supabase stores registration metadata in user metadata.
    // This is not an authorization role.
    // Actual permissions must be controlled through secure database policies.

    window.setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);

  } catch (error) {

    console.error("OTP verification error:", error);

    showMessage(
      messageId,
      error.message || "OTP सत्यापित नहीं हो सका।",
      "error"
    );

  } finally {

    setButtonLoading(button, false, buttonText);

  }
}


/* -------------------------------------
   8. RESEND OTP
------------------------------------- */

async function resendOtp() {

  const isRegistration = pendingAuthType === "register";

  const messageId = isRegistration
    ? "register-message"
    : "login-message";

  const buttonId = isRegistration
    ? "resend-register-otp"
    : "resend-login-otp";

  const button = document.getElementById(buttonId);

  if (!pendingAuthEmail || !pendingAuthType) {
    showMessage(
      messageId,
      "पहले ईमेल पता दर्ज करें।",
      "error"
    );
    return;
  }

  const originalText = "OTP दोबारा भेजें";

  setButtonLoading(button, true, originalText);

  try {

    await sendOtp(
      pendingAuthEmail,
      pendingAuthType,
      isRegistration ? pendingRegistration : null
    );

    showMessage(
      messageId,
      "नया OTP भेज दिया गया है। अपना ईमेल जाँचें।"
    );

  } catch (error) {

    console.error("Resend OTP error:", error);

    showMessage(
      messageId,
      error.message || "OTP दोबारा भेजने में समस्या हुई।",
      "error"
    );

  } finally {

    setButtonLoading(button, false, originalText);

  }
}


/* -------------------------------------
   9. INITIALIZE AUTHENTICATION
------------------------------------- */

function initializeAuth() {

  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      sendLoginOtp
    );

    document
      .getElementById("verify-otp-button")
      ?.addEventListener("click", verifyOtp);

    document
      .getElementById("resend-login-otp")
      ?.addEventListener("click", resendOtp);

  }

  if (registerForm) {

    registerForm.addEventListener(
      "submit",
      sendRegistrationOtp
    );

    document
      .getElementById("register-verify-button")
      ?.addEventListener("click", verifyOtp);

    document
      .getElementById("resend-register-otp")
      ?.addEventListener("click", resendOtp);

  }

}

initializeAuth();
