
/*
  साहित्यिक शब्द लोक - ARS Authentication
  Email OTP Registration, Login, Logout and Role Verification
*/

import { supabase } from "./supabase-client.js";

const $ = (selector) => document.querySelector(selector);

function showMessage(message, type = "info") {
  let box =
    $("#register-message") ||
    $("#login-message") ||
    $("#auth-message");

  if (!box) {
    box = document.createElement("div");
    box.id = "auth-message";
    document.body.prepend(box);
  }

  box.textContent = message;
  box.style.display = "block";
  box.style.padding = "12px";
  box.style.marginTop = "14px";
  box.style.borderRadius = "8px";
  box.style.background =
    type === "error" ? "#ffe8e8" :
    type === "success" ? "#e7f6e9" : "#eef3f8";
  box.style.color =
    type === "error" ? "#a00000" :
    type === "success" ? "#176b2c" : "#234";

  box.setAttribute("role", "status");
}

function requireClient() {
  if (!supabase) {
    showMessage(
      "Supabase कनेक्शन नहीं मिला। कृपया Supabase सेटिंग जाँचें।",
      "error"
    );
    return false;
  }
  return true;
}

function getValue(...selectors) {
  for (const selector of selectors) {
    const element = $(selector);
    if (element) return element.value.trim();
  }
  return "";
}

function getEmail() {
  return getValue(
    "#register-email",
    "#login-email",
    "#email",
    'input[name="email"]'
  );
}

function getFullName() {
  return getValue(
    "#full-name",
    "#name",
    "#register-name",
    'input[name="fullName"]'
  );
}

async function sendOtp(email, fullName = "", isRegistration = false) {
  if (!requireClient()) return false;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMessage("कृपया सही Email Address दर्ज करें।", "error");
    return false;
  }

  try {
    showMessage("OTP भेजा जा रहा है, कृपया प्रतीक्षा करें...");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: isRegistration,
        data: isRegistration ? { full_name: fullName } : undefined
      }
    });

    if (error) throw error;

    showMessage(
      "ईमेल भेजने का अनुरोध सफल हुआ। अपना Inbox और Spam फोल्डर जाँचें।",
      "success"
    );

    return true;

  } catch (error) {
    console.error("OTP sending error:", error);
    showMessage(
      error.message || "OTP भेजने में समस्या हुई।",
      "error"
    );
    return false;
  }
}

async function verifyOtp(email, token) {
  if (!requireClient()) return false;

  if (!email || !token) {
    showMessage("Email और OTP दोनों दर्ज करें।", "error");
    return false;
  }

  try {
    showMessage("OTP सत्यापित किया जा रहा है...");

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email"
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error("User की जानकारी प्राप्त नहीं हुई।");
    }

    showMessage("सफलतापूर्वक सत्यापन हो गया।", "success");

    window.location.href = "author-dashboard.html";
    return true;

  } catch (error) {
    console.error("OTP verification error:", error);
    showMessage(
      error.message || "OTP गलत है या उसकी समय-सीमा समाप्त हो गई है।",
      "error"
    );
    return false;
  }
}

async function registerUser() {
  const name = getFullName();
  const email = getEmail();

  if (!name) {
    showMessage("कृपया अपना पूरा नाम दर्ज करें।", "error");
    return false;
  }

  return await sendOtp(email, name, true);
}

async function loginUser() {
  const email = getEmail();

  if (!email) {
    showMessage("कृपया अपना Email दर्ज करें।", "error");
    return false;
  }

  return await sendOtp(email, "", false);
}

async function logoutUser() {
  if (!requireClient()) return;

  const { error } = await supabase.auth.signOut();

  if (error) {
    showMessage(error.message, "error");
    return;
  }

  window.location.href = "index.html";
}

async function getCurrentProfile() {
  if (!supabase) return null;

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Profile lookup failed:", error);
    return null;
  }

  return data;
}

async function protectRole(allowedRoles = []) {
  if (!requireClient()) return false;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "login.html";
    return false;
  }

  const profile = await getCurrentProfile();

  if (!profile || !allowedRoles.includes(profile.role)) {
    showMessage("आपको इस पेज को खोलने की अनुमति नहीं है।", "error");
    window.location.href = "index.html";
    return false;
  }

  return true;
}

document.addEventListener("DOMContentLoaded", () => {

  // Registration
  const registerForm = $("#register-form");

  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const button = registerForm.querySelector(
        'button[type="submit"]'
      );

      if (button) button.disabled = true;

      const success = await registerUser();

      if (success) {
        const otpSection = $("#register-otp-section");

        if (otpSection) {
          otpSection.style.display = "block";
        }

        const otpInput = $("#register-otp");
        if (otpInput) otpInput.focus();
      }

      if (button) button.disabled = false;
    });
  }

  // Registration OTP verification
  $("#register-verify-button")?.addEventListener("click", async () => {
    const email = getEmail();
    const token = getValue("#register-otp");

    const button = $("#register-verify-button");
    if (button) button.disabled = true;

    await verifyOtp(email, token);

    if (button) button.disabled = false;
  });

  // Login OTP request
  const loginForm = $("#login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const button = loginForm.querySelector(
        'button[type="submit"]'
      );

      if (button) button.disabled = true;

      const success = await loginUser();

      if (success) {
        const otpSection = $("#otp-section");

        if (otpSection) {
          otpSection.style.display = "block";
        }
      }

      if (button) button.disabled = false;
    });
  }

  // Login OTP verification
  $("#verify-otp-button")?.addEventListener("click", async () => {
    const email = getEmail();
    const token = getValue("#login-otp", "#otp", "#email-otp");

    const button = $("#verify-otp-button");
    if (button) button.disabled = true;

    await verifyOtp(email, token);

    if (button) button.disabled = false;
  });

  $("#logout-btn")?.addEventListener("click", logoutUser);

  document.querySelectorAll("[data-auth='logout']").forEach((button) => {
    button.addEventListener("click", logoutUser);
  });

});

export {
  sendOtp,
  verifyOtp,
  registerUser,
  loginUser,
  logoutUser,
  getCurrentProfile,
  protectRole
};
