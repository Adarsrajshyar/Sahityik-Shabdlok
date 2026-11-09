
/*
  साहित्यिक शब्द लोक - Author Dashboard
  Author profile and submission history.
*/

import { supabase } from "./supabase-client.js";

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function showDashboardMessage(message) {
  const box = document.querySelector("#dashboard-message");
  if (box) box.textContent = message;
}

async function getUserAndProfile() {
  if (!supabase) {
    showDashboardMessage("Backend configure नहीं है।");
    return null;
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    window.location.href = "login.html";
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(profileError);
    showDashboardMessage("Profile लोड नहीं हो सका।");
    return null;
  }

  return { user, profile };
}

async function loadAuthorProfile() {
  const result = await getUserAndProfile();
  if (!result) return;

  const { user, profile } = result;

  const nameElement = document.querySelector("#author-name");
  const emailElement = document.querySelector("#author-email");
  const roleElement = document.querySelector("#author-role");

  if (nameElement) {
    nameElement.textContent = profile?.full_name || user.email;
  }

  if (emailElement) {
    emailElement.textContent = profile?.email || user.email;
  }

  if (roleElement) {
    roleElement.textContent = profile?.role || "author";
  }

  await loadAuthorSubmissions(user.id);
  await loadAuthorCertificates(user.id);
}

async function loadAuthorSubmissions(userId) {
  const container = document.querySelector("#author-submissions");
  if (!container || !supabase) return;

  const { data, error } = await supabase
    .from("submissions")
    .select("id, title, category, status, created_at")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    container.textContent = "रचनाओं की सूची लोड नहीं हो सकी।";
    return;
  }

  if (!data?.length) {
    container.textContent = "आपने अभी कोई रचना जमा नहीं की है।";
    return;
  }

  container.innerHTML = data.map((item) => `
    <article class="content-card">
      <h3>${escapeHTML(item.title)}</h3>
      <p>श्रेणी: ${escapeHTML(item.category)}</p>
      <p>स्थिति: ${escapeHTML(item.status)}</p>
      <small>${new Date(item.created_at).toLocaleDateString("hi-IN")}</small>
    </article>
  `).join("");
}

async function loadAuthorCertificates(userId) {
  const container = document.querySelector("#author-certificates");
  if (!container || !supabase) return;

  const { data, error } = await supabase
    .from("certificates")
    .select("id, certificate_code, title, issued_at")
    .eq("author_id", userId)
    .order("issued_at", { ascending: false });

  if (error) {
    console.error(error);
    container.textContent = "प्रमाणपत्रों की सूची लोड नहीं हो सकी।";
    return;
  }

  if (!data?.length) {
    container.textContent = "अभी कोई प्रमाणपत्र जारी नहीं हुआ है।";
    return;
  }

  container.innerHTML = data.map((certificate) => `
    <article class="content-card">
      <h3>${escapeHTML(certificate.title || "ARS Publication Certificate")}</h3>
      <p>Certificate ID: ${escapeHTML(certificate.certificate_code)}</p>
      <p>जारी तिथि: ${
        certificate.issued_at
          ? new Date(certificate.issued_at).toLocaleDateString("hi-IN")
          : "उपलब्ध नहीं"
      }</p>
      <a href="certificate.html?id=${encodeURIComponent(certificate.id)}">
        प्रमाणपत्र देखें
      </a>
    </article>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  if (
    document.querySelector("#author-name") ||
    document.querySelector("#author-submissions") ||
    document.querySelector("#author-certificates")
  ) {
    loadAuthorProfile();
  }
});

export {
  getUserAndProfile,
  loadAuthorProfile,
  loadAuthorSubmissions,
  loadAuthorCertificates
};
