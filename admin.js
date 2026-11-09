
/*
  साहित्यिक शब्द लोक - Admin Panel
  Admin-only content, roles and website settings management.
*/

import { supabase } from "./supabase-client.js";

const $ = (selector) => document.querySelector(selector);

function message(text, type = "info") {
  const box = $("#admin-message");
  if (box) {
    box.textContent = text;
    box.dataset.type = type;
  }
}

async function getAdmin() {
  if (!supabase) {
    message("Supabase configure नहीं है।", "error");
    return null;
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    window.location.href = "login.html";
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    message("केवल अधिकृत Admin इस पेज को खोल सकता है।", "error");
    window.location.href = "index.html";
    return null;
  }

  return { user, profile };
}

async function loadPendingSubmissions() {
  const container = $("#admin-submissions");
  if (!container) return;

  const { data, error } = await supabase
    .from("submissions")
    .select("id, title, body, category, author_name, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    message("रचनाएँ लोड नहीं हो सकीं।");
    return;
  }

  if (!data?.length) {
    container.textContent = "कोई लंबित रचना नहीं है।";
    return;
  }

  container.replaceChildren();

  data.forEach((item) => {
    const card = document.createElement("article");
    card.className = "content-card";

    const title = document.createElement("h3");
    title.textContent = item.title;

    const author = document.createElement("p");
    author.textContent = `लेखक: ${item.author_name || "अज्ञात"}`;

    const category = document.createElement("p");
    category.textContent = `श्रेणी: ${item.category}`;

    const body = document.createElement("p");
    body.textContent = item.body;

    const publish = document.createElement("button");
    publish.type = "button";
    publish.textContent = "प्रकाशित करें";
    publish.addEventListener("click", () => updateSubmission(item.id, "published"));

    const reject = document.createElement("button");
    reject.type = "button";
    reject.textContent = "अस्वीकार करें";
    reject.addEventListener("click", () => updateSubmission(item.id, "rejected"));

    card.append(title, author, category, body, publish, reject);
    container.append(card);
  });
}

async function updateSubmission(id, status) {
  const { error } = await supabase
    .from("submissions")
    .update({
      status,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("status", "pending");

  if (error) {
    message("रचना अपडेट नहीं हुई। Database permissions जाँचें।", "error");
    return;
  }

  message(status === "published" ? "रचना प्रकाशित हो गई।" : "रचना अस्वीकार कर दी गई।", "success");
  await loadPendingSubmissions();
}

async function loadMembers() {
  const container = $("#admin-members");
  if (!container) return;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    message("Members लोड नहीं हो सके।");
    return;
  }

  container.replaceChildren();

  (data || []).forEach((member) => {
    const row = document.createElement("div");
    row.className = "content-card";

    const info = document.createElement("p");
    info.textContent = `${member.full_name || "नाम नहीं"} | ${member.email || ""} | ${member.role}`;

    const select = document.createElement("select");

    ["reader", "author", "publisher", "admin"].forEach((role) => {
      const option = document.createElement("option");
      option.value = role;
      option.textContent = role;
      option.selected = member.role === role;
      select.append(option);
    });

    const save = document.createElement("button");
    save.type = "button";
    save.textContent = "Role बदलें";
    save.addEventListener("click", () => changeRole(member.id, select.value));

    row.append(info, select, save);
    container.append(row);
  });
}

async function changeRole(userId, role) {
  if (!["reader", "author", "publisher", "admin"].includes(role)) return;

  if (!confirm("क्या आप इस सदस्य का Role बदलना चाहते हैं?")) return;

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) {
    message("Role नहीं बदला। Database permissions जाँचें।", "error");
    return;
  }

  message("Role अपडेट हो गया।", "success");
  await loadMembers();
}

async function saveSettings(event) {
  event?.preventDefault();

  const settings = {
    site_name: $("#setting-site-name")?.value.trim(),
    youtube_url: $("#setting-youtube")?.value.trim(),
    instagram_url: $("#setting-instagram")?.value.trim(),
    contact_email: $("#setting-email")?.value.trim(),
    ars_book_text: $("#setting-book")?.value.trim()
  };

  const { error } = await supabase
    .from("site_settings")
    .upsert({
      id: 1,
      settings
    });

  if (error) {
    message("Settings सेव नहीं हुईं।", "error");
    return;
  }

  message("Website Settings सेव हो गईं।", "success");
}

async function initializeAdmin() {
  const result = await getAdmin();
  if (!result) return;

  await Promise.all([
    loadPendingSubmissions(),
    loadMembers()
  ]);

  $("#admin-settings-form")?.addEventListener("submit", saveSettings);
}

document.addEventListener("DOMContentLoaded", () => {
  if ($("#admin-submissions") || $("#admin-members")) {
    initializeAdmin();
  }
});

export {
  getAdmin,
  loadPendingSubmissions,
  updateSubmission,
  loadMembers,
  changeRole,
  saveSettings
};
