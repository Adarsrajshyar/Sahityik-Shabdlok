/*
  साहित्यिक शब्द लोक - ARS
  Admin Panel
*/

import { supabase } from "./supabase-client.js";

const $ = (selector) => document.querySelector(selector);

function showMessage(text, type = "info") {
  const box = $("#admin-message");
  if (!box) return;

  box.textContent = text;
  box.dataset.type = type;
}

function setAccessMessage(text) {
  const box = $("#admin-access-message");
  if (box) box.textContent = text;
}

async function getAdmin() {
  if (!supabase) {
    setAccessMessage("Supabase configure नहीं है।");
    return null;
  }

  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;

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
    setAccessMessage("केवल अधिकृत Admin इस पैनल का उपयोग कर सकता है।");
    return null;
  }

  $("#admin-content").hidden = false;
  setAccessMessage(`स्वागत है, ${profile.full_name || "Admin"}।`);

  return { user, profile };
}

async function countRows(table, column, value = null) {
  let query = supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (column && value !== null) {
    query = query.eq(column, value);
  }

  const { count, error } = await query;

  if (error) {
    console.error(`Count error for ${table}:`, error);
    return "—";
  }

  return count ?? 0;
}

async function loadStatistics() {
  const [users, authors, pending, published] = await Promise.all([
    countRows("profiles"),
    countRows("profiles", "role", "author"),
    countRows("submissions", "status", "pending"),
    countRows("submissions", "status", "published")
  ]);

  $("#admin-users-count").textContent = users;
  $("#admin-authors-count").textContent = authors;
  $("#admin-pending-count").textContent = pending;
  $("#admin-published-count").textContent = published;
}

function makeElement(tag, text, className = "") {
  const element = document.createElement(tag);
  element.textContent = text;

  if (className) element.className = className;

  return element;
}

async function loadPendingSubmissions() {
  const container = $("#admin-submissions");
  if (!container) return;

  container.textContent = "रचनाएँ लोड हो रही हैं...";

  const { data, error } = await supabase
    .from("submissions")
    .select("id, title, body, category, author_name, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    container.textContent = "रचनाएँ लोड नहीं हो सकीं।";
    showMessage(error.message, "error");
    return;
  }

  container.replaceChildren();

  if (!data?.length) {
    container.textContent = "अभी कोई रचना समीक्षा के लिए नहीं है।";
    return;
  }

  data.forEach((item) => {
    const card = document.createElement("article");
    card.className = "admin-item";

    card.append(
      makeElement("h3", item.title),
      makeElement("p", `लेखक: ${item.author_name || "अज्ञात"}`),
      makeElement("p", `श्रेणी: ${item.category || "अन्य"}`),
      makeElement("p", item.body || ""),
      makeElement(
        "small",
        item.created_at
          ? `जमा करने की तिथि: ${new Date(item.created_at).toLocaleString("hi-IN")}`
          : ""
      )
    );

    const actions = document.createElement("div");
    actions.className = "admin-actions";

    const publishButton = makeElement("button", "प्रकाशित करें");
    publishButton.type = "button";
    publishButton.addEventListener("click", () => {
      updateSubmission(item.id, "published", publishButton);
    });

    const rejectButton = makeElement("button", "अस्वीकार करें", "secondary");
    rejectButton.type = "button";
    rejectButton.addEventListener("click", () => {
      updateSubmission(item.id, "rejected", rejectButton);
    });

    actions.append(publishButton, rejectButton);
    card.append(actions);
    container.append(card);
  });
}

async function updateSubmission(id, status, button) {
  if (!["published", "rejected"].includes(status)) return;

  const confirmation = status === "published"
    ? "क्या आप इस रचना को प्रकाशित करना चाहते हैं?"
    : "क्या आप इस रचना को अस्वीकार करना चाहते हैं?";

  if (!window.confirm(confirmation)) return;

  if (button) button.disabled = true;

  const { data, error } = await supabase
    .from("submissions")
    .update({
      status,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("status", "pending")
    .select("id");

  if (error) {
    showMessage(`रचना अपडेट नहीं हुई: ${error.message}`, "error");
    if (button) button.disabled = false;
    return;
  }

  if (!data?.length) {
    showMessage("यह रचना पहले ही किसी अन्य व्यक्ति द्वारा अपडेट की जा चुकी है।", "error");
  } else {
    showMessage(
      status === "published"
        ? "रचना प्रकाशित हो गई।"
        : "रचना अस्वीकार कर दी गई।",
      "success"
    );
  }

  await Promise.all([
    loadPendingSubmissions(),
    loadStatistics()
  ]);
}

async function loadMembers() {
  const container = $("#admin-members");
  if (!container) return;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    container.textContent = "सदस्यों की जानकारी लोड नहीं हो सकी।";
    showMessage(error.message, "error");
    return;
  }

  container.replaceChildren();

  if (!data?.length) {
    container.textContent = "अभी कोई सदस्य नहीं है।";
    return;
  }

  data.forEach((member) => {
    const row = document.createElement("article");
    row.className = "admin-item";

    row.append(
      makeElement("strong", member.full_name || "नाम उपलब्ध नहीं"),
      makeElement("p", member.email || ""),
      makeElement("small", `वर्तमान भूमिका: ${member.role}`)
    );

    const select = document.createElement("select");

    ["reader", "author", "publisher", "admin"].forEach((role) => {
      const option = document.createElement("option");
      option.value = role;
      option.textContent = role;
      option.selected = member.role === role;
      select.append(option);
    });

    const saveButton = makeElement("button", "भूमिका बदलें");
    saveButton.type = "button";

    if (member.id === (await supabase.auth.getUser()).data?.user?.id) {
      saveButton.disabled = true;
      saveButton.title = "अपने Admin role को यहाँ से नहीं बदल सकते।";
    } else {
      saveButton.addEventListener("click", () => {
        changeRole(member.id, select.value, saveButton);
      });
    }

    const actions = document.createElement("div");
    actions.className = "admin-actions";
    actions.append(select, saveButton);

    row.append(actions);
    container.append(row);
  });
}

async function changeRole(userId, role, button) {
  if (!["reader", "author", "publisher", "admin"].includes(role)) return;

  if (!window.confirm(`क्या आप इस सदस्य की भूमिका "${role}" करना चाहते हैं?`)) {
    return;
  }

  if (button) button.disabled = true;

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) {
    showMessage(`भूमिका नहीं बदली: ${error.message}`, "error");
    if (button) button.disabled = false;
    return;
  }

  showMessage("सदस्य की भूमिका अपडेट हो गई।", "success");
  await loadMembers();
}

async function loadSettings() {
  const { data, error } = await supabase
    .from("site_settings")
    .select("settings")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    showMessage("वेबसाइट सेटिंग्स लोड नहीं हो सकीं।", "error");
    return;
  }

  const settings = data?.settings || {};

  $("#setting-youtube").value = settings.youtube_url || "";
  $("#setting-instagram").value = settings.instagram_url || "";
  $("#setting-contact").value = settings.contact_email || "";
  $("#setting-book").value = settings.ars_book_text || "";
}

async function saveSettings(event) {
  event.preventDefault();

  const settings = {
    site_name: "साहित्यिक शब्द लोक",
    youtube_url: $("#setting-youtube").value.trim(),
    instagram_url: $("#setting-instagram").value.trim(),
    contact_email: $("#setting-contact").value.trim(),
    ars_book_text: $("#setting-book").value.trim()
  };

  const { error } = await supabase
    .from("site_settings")
    .upsert({
      id: 1,
      settings,
      updated_at: new Date().toISOString()
    });

  if (error) {
    showMessage(`सेटिंग्स सेव नहीं हुईं: ${error.message}`, "error");
    return;
  }

  showMessage("वेबसाइट सेटिंग्स सेव हो गईं।", "success");
}

async function initializeAdmin() {
  const admin = await getAdmin();
  if (!admin) return;

  $("#admin-settings-form")?.addEventListener("submit", saveSettings);

  await Promise.all([
    loadStatistics(),
    loadPendingSubmissions(),
    loadMembers(),
    loadSettings()
  ]);
}

document.addEventListener("DOMContentLoaded", initializeAdmin);

export {
  getAdmin,
  loadStatistics,
  loadPendingSubmissions,
  updateSubmission,
  loadMembers,
  changeRole,
  loadSettings,
  saveSettings
};
