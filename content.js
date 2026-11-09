
/*
  साहित्यिक शब्द लोक - Content Management
  Published content display and author submission.
*/

import { supabase } from "./supabase-client.js";

const CONTENT_TABLE = "submissions";

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function showContentMessage(message, type = "info") {
  const box = document.querySelector("#content-message");
  if (!box) return;

  box.textContent = message;
  box.dataset.type = type;
}

async function getPublishedContent(category = null) {
  if (!supabase) {
    showContentMessage("Backend configure नहीं है।");
    return [];
  }

  let query = supabase
    .from(CONTENT_TABLE)
    .select("id, title, body, category, author_name, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Content loading failed:", error);
    showContentMessage("रचनाएँ लोड नहीं हो सकीं।");
    return [];
  }

  return data || [];
}

function renderContent(items, container) {
  if (!container) return;

  if (!items.length) {
    container.innerHTML = "<p>अभी इस श्रेणी में कोई प्रकाशित रचना उपलब्ध नहीं है।</p>";
    return;
  }

  container.innerHTML = items.map((item) => `
    <article class="content-card">
      <h3>${escapeHTML(item.title)}</h3>
      <p>${escapeHTML(item.body).replace(/\n/g, "<br>")}</p>
      <small>
        लेखक: ${escapeHTML(item.author_name || "ARS लेखक")}
      </small>
    </article>
  `).join("");
}

async function loadPublishedContent(category = null) {
  const container = document.querySelector("#content-list");

  if (!container) return;

  container.innerHTML = "<p>रचनाएँ लोड हो रही हैं...</p>";

  const items = await getPublishedContent(category);
  renderContent(items, container);
}

async function submitWork(event) {
  event?.preventDefault();

  if (!supabase) {
    showContentMessage("Backend configure नहीं है।", "error");
    return;
  }

  const { data: { user }, error: userError } =
    await supabase.auth.getUser();

  if (userError || !user) {
    showContentMessage("रचना भेजने के लिए पहले Login करें।", "error");
    return;
  }

  const title = document.querySelector("#work-title")?.value.trim();
  const body = document.querySelector("#work-body")?.value.trim();
  const category = document.querySelector("#work-category")?.value;

  if (!title || !body || !category) {
    showContentMessage("कृपया सभी आवश्यक जानकारी भरें।", "error");
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from(CONTENT_TABLE)
    .insert({
      author_id: user.id,
      author_name: profile?.full_name || user.email,
      title,
      body,
      category,
      status: "pending"
    });

  if (error) {
    console.error("Submission failed:", error);
    showContentMessage(
      "रचना जमा नहीं हो सकी। Database और permissions जाँचें।",
      "error"
    );
    return;
  }

  showContentMessage("आपकी रचना समीक्षा के लिए जमा हो गई है।", "success");
  event?.target?.reset();
}

document.addEventListener("DOMContentLoaded", () => {
  const contentContainer = document.querySelector("#content-list");

  if (contentContainer) {
    const category = contentContainer.dataset.category || null;
    loadPublishedContent(category);
  }

  document.querySelector("#submit-work-form")
    ?.addEventListener("submit", submitWork);
});

export {
  getPublishedContent,
  loadPublishedContent,
  submitWork
};
