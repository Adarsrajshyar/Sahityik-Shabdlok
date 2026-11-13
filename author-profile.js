/*
  साहित्यिक शब्द लोक
  Individual Author Profile
*/

import { supabase } from "./supabase-client.js";

const nameElement = document.querySelector("#author-name");
const avatarElement = document.querySelector("#author-avatar");
const countElement = document.querySelector("#work-count");
const worksElement = document.querySelector("#profile-works");
const messageElement = document.querySelector("#profile-message");

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function showMessage(message) {
  if (messageElement) {
    messageElement.textContent = message;
  }
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

function categoryName(category) {
  const categories = {
    shayari: "शायरी",
    poetry: "कविता",
    story: "कहानी"
  };

  return categories[category] || "रचना";
}

async function loadAuthorProfile() {
  if (!supabase) {
    showMessage("Supabase configure नहीं है।");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const authorName = params.get("name")?.trim();

  if (!authorName) {
    showMessage("लेखक का नाम उपलब्ध नहीं है।");
    return;
  }

  nameElement.textContent = authorName;
  avatarElement.textContent = [...authorName][0] || "अ";

  document.title = `${authorName} | साहित्यिक शब्द लोक`;

  showMessage("लेखक की प्रकाशित रचनाएँ लोड हो रही हैं...");

  const { data, error } = await supabase
    .from("submissions")
    .select("id, title, category, created_at, author_name")
    .eq("author_name", authorName)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Author profile error:", error);
    showMessage("लेखक की रचनाएँ लोड नहीं हो सकीं।");
    return;
  }

  const works = data || [];

  countElement.textContent = String(works.length);

  if (!works.length) {
    showMessage("इस लेखक की कोई प्रकाशित रचना अभी उपलब्ध नहीं है।");
    return;
  }

  showMessage("");

  worksElement.innerHTML = works.map((work) => `
    <article class="work-card">
      <small>${escapeHTML(categoryName(work.category))}</small>
      <h3>${escapeHTML(work.title || "बिना शीर्षक की रचना")}</h3>
      <p>${escapeHTML(formatDate(work.created_at))}</p>
      <a href="writing.html?id=${encodeURIComponent(work.id)}">
        पूरी रचना पढ़ें →
      </a>
    </article>
  `).join("");
}

loadAuthorProfile();
