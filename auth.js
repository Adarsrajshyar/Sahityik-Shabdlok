
/*
  साहित्यिक शब्द लोक - Authentication
  Email OTP, Registration, Login, Logout, Role Verification
*/

import { supabase } from "./supabase-client.js";

const $ = (selector) => document.querySelector(selector);

function showMessage(message, type = "info") {
  let box = $("#auth-message");

  if (!box) {
    box = document.createElement("div");
    box.id = "auth-message";
    box.setAttribute("role", "status");
    const form = $("form");
    (form || document.body).prepend(box);
  }

  box.textContent = message;
  box.dataset.type = type;
}

function requireClient() {
  if (!supabase) {
    showMessage("Backend अभी configure नहीं है। Supabase सेटिंग जाँचें।", "error");
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
  return getValue("#email", "#register-email", "#login-email", 'input[name="email"]');
}

function getPassword() {
  return getValue("#password", "#register-password", "#login-password", 'input[name="password"]');
}

function getFullName() {
  return getValue("#name", "#full-name", "#register-name", 'input[name="name"]');
}

async function sendOtp(email, fullName = "") {
  if (!requireClient()) return;

  if (!email || !email.includes("@")) {
    showMessage("कृपया सही Email Address दर्ज करें।", "error");
    return;
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: {
          full_name: fullName
        }
      }
    });

    if (error) throw error;

    showMessage("आपके Email पर OTP / Login Link भेजा गया है। अपना Email जाँचें।", "success");
  } catch (error) {
    showMessage(error.message || "OTP भेजने में समस्या हुई।", "error");
  }
}

async function verifyOtp(email, token) {
  if (!requireClient()) return;

  if (!email || !token) {
    showMessage("Email और OTP दोनों दर्ज करें।", "error");
    return;
  }

  try {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email"
    });

    if (error) throw error;

    showMessage("Login सफल हुआ।", "success");
    window.location.href = "author-dashboard.html";
  } catch (error) {
    showMessage(error.message || "OTP सत्यापित नहीं हुआ।", "error");
  }
}

async function registerUser() {
  const name = getFullName();
  const email = getEmail();

  if (!name) {
    showMessage("कृपया अपना नाम दर्ज करें।", "error");
    return;
  }

  await sendOtp(email, name);
}

async function loginUser() {
  const email = getEmail();

  if (!email) {
    showMessage("कृपया Email दर्ज करें।", "error");
    return;
  }

  await sendOtp(email);
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

  const { data: { user }, error: userError } =
    await supabase.auth.getUser();

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

  const { data: { user } } = await supabase.auth.getUser();

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
  $("#register-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await registerUser();
  });

  $("#login-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await loginUser();
  });

  $("#verify-otp-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = getEmail();
    const token = getValue("#otp", "#email-otp", 'input[name="token"]');

    await verifyOtp(email, token);
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
