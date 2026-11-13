/*
  साहित्यिक शब्द लोक - ARS
  Public Published Content Display
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

function showContentMessage(message) {
  const box = document.querySelector("#content-message");

  if (box) {
    box.textContent = message;
  }
}

function getCategoryLabel(category = "") {
  const labels = {
    shayari: "शायरी",
    poetry: "कविता",
    story: "कहानी",
    प्रेम: "प्रेम",
    दर्द: "दर्द",
    भावनात्मक: "भावनात्मक",
    प्रेरणादायक: "प्रेरणादायक",
    दोस्ती: "दोस्ती",
    प्रकृति: "प्रकृति",
    सामाजिक: "सामाजिक",
    जीवन: "जीवन",
    प्रेरणा: "प्रेरणा",
    रहस्य: "रहस्य",
    अन्य: "अन्य"
  };

  return labels[category] || category;
}

function formatCategory(category = "") {
  const parts = category.split(":");

  if (parts.length === 2) {
    return `${getCategoryLabel(parts[0])} • ${getCategoryLabel(parts[1])}`;
  }

  return getCategoryLabel(category);
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

  /*
    नई रचनाओं की category:
    shayari:प्रेम
    poetry:प्रकृति
    story:जीवन

    पुराने records में केवल shayari/poetry/story भी हो सकता है।
  */

  if (category) {
    query = query.or(
      `category.eq.${category},category.like.${category}:%`
    );
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
    container.innerHTML =
      "<p>अभी इस श्रेणी में कोई प्रकाशित रचना उपलब्ध नहीं है।</p>";
    return;
  }

  container.innerHTML = items.map((item) => `
    <article class="content-card">
      <h3>${escapeHTML(item.title)}</h3>

      <p>${escapeHTML(item.body).replace(/\n/g, "<br>")}</p>

      <small>
        श्रेणी: ${escapeHTML(formatCategory(item.category || ""))}
        <br>
        लेखक: ${escapeHTML(item.author_name || "ARS लेखक")}
        <br>
        प्रकाशित तिथि:
        ${
          item.created_at
            ? new Date(item.created_at).toLocaleDateString("hi-IN")
            : "उपलब्ध नहीं"
        }
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

document.addEventListener("DOMContentLoaded", () => {
  const contentContainer = document.querySelector("#content-list");

  if (contentContainer) {
    const category =
      contentContainer.dataset.category || null;

    loadPublishedContent(category);
  }
});

export {
  getPublishedContent,
  loadPublishedContent,
  renderContent
};
