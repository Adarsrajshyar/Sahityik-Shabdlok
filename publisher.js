
/*
  साहित्यिक शब्द लोक - Publisher Panel
  Publisher can review and publish submissions.
*/

import { supabase } from "./supabase-client.js";

const $ = (selector) => document.querySelector(selector);

function showMessage(text, type = "info") {
  const box = $("#publisher-message");
  if (box) {
    box.textContent = text;
    box.dataset.type = type;
  }
}

async function authorizePublisher() {
  if (!supabase) {
    showMessage("Supabase configure नहीं है।", "error");
    return false;
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    window.location.href = "login.html";
    return false;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !["publisher", "admin"].includes(profile?.role)) {
    showMessage("आपको Publisher Panel की अनुमति नहीं है।", "error");
    window.location.href = "index.html";
    return false;
  }

  return true;
}

async function loadPublisherQueue() {
  const container = $("#publisher-submissions");
  if (!container) return;

  const { data, error } = await supabase
    .from("submissions")
    .select("id, title, body, category, author_name, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    showMessage("Submissions लोड नहीं हो सकीं।", "error");
    return;
  }

  if (!data?.length) {
    container.textContent = "अभी कोई रचना समीक्षा के लिए नहीं है।";
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

    const body = document.createElement("p");
    body.textContent = item.body;

    const publish = document.createElement("button");
    publish.type = "button";
    publish.textContent = "प्रकाशित करें";
    publish.addEventListener("click", () => reviewSubmission(item.id, "published"));

    const reject = document.createElement("button");
    reject.type = "button";
    reject.textContent = "अस्वीकार करें";
    reject.addEventListener("click", () => reviewSubmission(item.id, "rejected"));

    card.append(title, author, body, publish, reject);
    container.append(card);
  });
}

async function reviewSubmission(id, status) {
  if (!["published", "rejected"].includes(status)) return;

  const { error } = await supabase
    .from("submissions")
    .update({
      status,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("status", "pending");

  if (error) {
    showMessage("रचना अपडेट नहीं हुई। Permissions जाँचें।", "error");
    return;
  }

  showMessage(
    status === "published" ? "रचना प्रकाशित हो गई।" : "रचना अस्वीकार कर दी गई।",
    "success"
  );

  await loadPublisherQueue();
}

async function initializePublisher() {
  const allowed = await authorizePublisher();
  if (!allowed) return;

  await loadPublisherQueue();
}

document.addEventListener("DOMContentLoaded", () => {
  if ($("#publisher-submissions")) {
    initializePublisher();
  }
});

export {
  authorizePublisher,
  loadPublisherQueue,
  reviewSubmission
};
