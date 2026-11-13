/*
  साहित्यिक शब्द लोक - Search and Reading
  Published submissions search and individual writing display.
*/

import { supabase } from "./supabase-client.js";

const TABLE = "submissions";

const CATEGORY_NAMES = {
  shayari: "शायरी",
  poetry: "कविता",
  story: "कहानी"
};

function showMessage(element, message) {
  if (element) {
    element.textContent = message;
  }
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("hi-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

/* SEARCH PAGE */

async function loadSearchResults() {
  const resultsBox = document.querySelector("#search-results");
  const messageBox = document.querySelector("#search-message");

  if (!resultsBox) return;

  if (!supabase) {
    showMessage(messageBox, "Supabase configure नहीं है।");
    return;
  }

  showMessage(messageBox, "प्रकाशित रचनाएँ लोड हो रही हैं...");

  const { data, error } = await supabase
    .from(TABLE)
    .select("id, title, body, category, author_name, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Search loading error:", error);
    showMessage(messageBox, "रचनाएँ लोड नहीं हो सकीं। कृपया बाद में प्रयास करें।");
    return;
  }

  window.arsPublishedWritings = data || [];
  renderSearchResults();
}

function renderSearchResults() {
  const resultsBox = document.querySelector("#search-results");
  const messageBox = document.querySelector("#search-message");

  if (!resultsBox) return;

  const query = document
    .querySelector("#search-query")
    ?.value.trim()
    .toLocaleLowerCase("hi");

  const category = document.querySelector("#search-category")?.value || "";

  const allItems = window.arsPublishedWritings || [];

  const filteredItems = allItems.filter((item) => {
    const matchesCategory = !category || item.category === category;

    const searchableText = [
      item.title,
      item.body,
      item.author_name
    ].join(" ").toLocaleLowerCase("hi");

    const matchesQuery = !query || searchableText.includes(query);

    return matchesCategory && matchesQuery;
  });

  if (!filteredItems.length) {
    resultsBox.innerHTML = "";
    showMessage(messageBox, "आपकी खोज से मेल खाती कोई प्रकाशित रचना नहीं मिली।");
    return;
  }

  showMessage(
    messageBox,
    `कुल ${filteredItems.length} रचनाएँ मिलीं।`
  );

  resultsBox.innerHTML = filteredItems.map((item) => {
    const preview = String(item.body || "").slice(0, 180);
    const categoryName = CATEGORY_NAMES[item.category] || "रचना";

    return `
      <article class="result-card">
        <small>${escapeHTML(categoryName)}</small>
        <h2>${escapeHTML(item.title)}</h2>
        <p>${escapeHTML(preview)}${item.body?.length > 180 ? "..." : ""}</p>
        <p>लेखक: ${escapeHTML(item.author_name || "ARS लेखक")}</p>
        <small>${escapeHTML(formatDate(item.created_at))}</small>
        <p>
          <a href="writing.html?id=${encodeURIComponent(item.id)}">
            पूरी रचना पढ़ें →
          </a>
        </p>
      </article>
    `;
  }).join("");
}

/* INDIVIDUAL WRITING PAGE */

async function loadSingleWriting() {
  const messageBox = document.querySelector("#writing-message");
  const contentBox = document.querySelector("#writing-content");

  if (!contentBox) return;

  if (!supabase) {
    showMessage(messageBox, "Supabase configure नहीं है।");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const writingId = params.get("id");

  if (!writingId) {
    showMessage(messageBox, "रचना का लिंक सही नहीं है।");
    return;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select("id, title, body, category, author_name, created_at")
    .eq("id", writingId)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Writing loading error:", error);
    showMessage(messageBox, "रचना लोड नहीं हो सकी।");
    return;
  }

  if (!data) {
    showMessage(messageBox, "यह रचना उपलब्ध नहीं है या प्रकाशित नहीं है।");
    return;
  }

  document.querySelector("#writing-title").textContent = data.title || "";

  const categoryName = CATEGORY_NAMES[data.category] || "रचना";
  const authorName = data.author_name || "ARS लेखक";
  const date = formatDate(data.created_at);

  document.querySelector("#writing-meta").textContent =
    `${categoryName} | लेखक: ${authorName}${date ? " | " + date : ""}`;

  document.querySelector("#writing-body").textContent = data.body || "";

  contentBox.hidden = false;
  showMessage(messageBox, "");
}

/* INITIALIZE */

document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.querySelector("#search-form");

  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      renderSearchResults();
    });

    document
      .querySelector("#search-category")
      ?.addEventListener("change", renderSearchResults);

    loadSearchResults();
  }

  if (document.querySelector("#writing-detail")) {
    loadSingleWriting();
  }
});
