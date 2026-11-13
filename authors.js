/*
  साहित्यिक शब्द लोक
  Public Authors Directory
*/

import { supabase } from "./supabase-client.js";

const authorsList = document.querySelector("#authors-list");
const message = document.querySelector("#authors-message");
const searchInput = document.querySelector("#authors-search");

let authors = [];

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function showMessage(text) {
  if (message) message.textContent = text;
}

function createAuthorGroups(rows) {
  const groups = new Map();

  rows.forEach((work) => {
    const name = (work.author_name || "ARS लेखक").trim();

    if (!groups.has(name)) {
      groups.set(name, {
        name,
        works: []
      });
    }

    groups.get(name).works.push(work);
  });

  return [...groups.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "hi")
  );
}

function renderAuthors() {
  if (!authorsList) return;

  const query = (searchInput?.value || "")
    .trim()
    .toLocaleLowerCase("hi");

  const filtered = authors.filter((author) =>
    author.name.toLocaleLowerCase("hi").includes(query)
  );

  if (!filtered.length) {
    authorsList.innerHTML = "";
    showMessage("कोई लेखक नहीं मिला।");
    return;
  }

  showMessage(`कुल ${filtered.length} लेखक मिले।`);

  authorsList.innerHTML = filtered.map((author) => {
    const profileUrl =
      `author.html?name=${encodeURIComponent(author.name)}`;

    const workLinks = author.works.slice(0, 5).map((work) => `
      <li>
        <a href="writing.html?id=${encodeURIComponent(work.id)}">
          ${escapeHTML(work.title)}
        </a>
      </li>
    `).join("");

    const remaining = author.works.length - 5;

    return `
      <article class="author-card">
        <h2>
          <a href="${profileUrl}">
            ${escapeHTML(author.name)}
          </a>
        </h2>

        <p class="author-count">
          प्रकाशित रचनाएँ: ${author.works.length}
        </p>

        <strong>प्रमुख रचनाएँ:</strong>

        <ul class="author-works">
          ${workLinks}
        </ul>

        ${
          remaining > 0
            ? `<p>और ${remaining} रचनाएँ...</p>`
            : ""
        }

        <p>
          <a href="${profileUrl}">
            लेखक प्रोफ़ाइल देखें →
          </a>
        </p>
      </article>
    `;
  }).join("");
}

async function loadAuthors() {
  if (!authorsList) return;

  if (!supabase) {
    showMessage("Supabase configure नहीं है।");
    return;
  }

  showMessage("लेखक सूची लोड हो रही है...");

  const { data, error } = await supabase
    .from("submissions")
    .select("id, title, author_name, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("Authors loading error:", error);
    showMessage("लेखक सूची लोड नहीं हो सकी।");
    return;
  }

  authors = createAuthorGroups(data || []);
  renderAuthors();
}

searchInput?.addEventListener("input", renderAuthors);

loadAuthors();
