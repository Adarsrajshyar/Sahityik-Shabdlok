/*
  साहित्यिक शब्द लोक - ARS
  Publisher Review Panel
*/

import { supabase } from "./supabase-client.js";

const $ = (selector) => document.querySelector(selector);

function showMessage(text, type = "info") {
  const box = $("#publisher-message");

  if (!box) return;

  box.textContent = text;
  box.dataset.type = type;
}

function setAccessMessage(text) {
  const box = $("#publisher-access-message");
  if (box) box.textContent = text;
}

async function authorizePublisher() {
  if (!supabase) {
    setAccessMessage("Supabase configure नहीं है।");
    return false;
  }

  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;

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
    setAccessMessage("आपको Publisher Panel की अनुमति नहीं है।");
    return false;
  }

  $("#publisher-content").hidden = false;
  setAccessMessage("Publisher अनुमति सत्यापित हो गई है।");

  return true;
}

async function getCount(status = null) {
  let query = supabase
    .from("submissions")
    .select("*", { count: "exact", head: true });

  if (status) {
    query = query.eq("status", status);
  }

  const { count, error } = await query;

  if (error) {
    console.error(error);
    return "—";
  }

  return count ?? 0;
}

async function loadPublisherStatistics() {
  const [total, pending, published] = await Promise.all([
    getCount(),
    getCount("pending"),
    getCount("published")
  ]);

  $("#publisher-total").textContent = total;
  $("#publisher-pending").textContent = pending;
  $("#publisher-published").textContent = published;
}

function makeTextElement(tag, text) {
  const element = document.createElement(tag);
  element.textContent = text || "";
  return element;
}

async function loadPublisherQueue() {
  const container = $("#publisher-submissions");
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
    card.className = "publisher-item";

    card.append(
      makeTextElement("h3", item.title),
      makeTextElement("p", `लेखक: ${item.author_name || "अज्ञात"}`),
      makeTextElement("p", `श्रेणी: ${item.category || "अन्य"}`),
      makeTextElement("p", item.body),
      makeTextElement(
        "small",
        item.created_at
          ? `जमा करने की तिथि: ${new Date(item.created_at).toLocaleString("hi-IN")}`
          : ""
      )
    );

    const actions = document.createElement("div");
    actions.className = "publisher-actions";

    const publish = makeTextElement("button", "प्रकाशित करें");
    publish.type = "button";
    publish.addEventListener("click", () => {
      reviewSubmission(item.id, "published", publish);
    });

    const reject = makeTextElement("button", "अस्वीकार करें");
    reject.type = "button";
    reject.className = "secondary";
    reject.addEventListener("click", () => {
      reviewSubmission(item.id, "rejected", reject);
    });

    actions.append(publish, reject);
    card.append(actions);
    container.append(card);
  });
}

async function loadPublishedList() {
  const container = $("#publisher-published-list");
  if (!container) return;

  const { data, error } = await supabase
    .from("submissions")
    .select("title, author_name, category, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    container.textContent = "प्रकाशित रचनाएँ लोड नहीं हो सकीं।";
    return;
  }

  container.replaceChildren();

  if (!data?.length) {
    container.textContent = "अभी कोई प्रकाशित रचना नहीं है।";
    return;
  }

  data.forEach((item) => {
    const card = document.createElement("article");
    card.className = "publisher-item";

    card.append(
      makeTextElement("h3", item.title),
      makeTextElement("p", `लेखक: ${item.author_name || "अज्ञात"}`),
      makeTextElement("p", `श्रेणी: ${item.category || "अन्य"}`)
    );

    container.append(card);
  });
}

async function reviewSubmission(id, status, button) {
  if (!["published", "rejected"].includes(status)) return;

  const prompt = status === "published"
    ? "क्या आप इस रचना को प्रकाशित करना चाहते हैं?"
    : "क्या आप इस रचना को अस्वीकार करना चाहते हैं?";

  if (!window.confirm(prompt)) return;

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
    showMessage("यह रचना पहले ही अपडेट हो चुकी है।", "error");
  } else {
    showMessage(
      status === "published"
        ? "रचना प्रकाशित हो गई।"
        : "रचना अस्वीकार कर दी गई।",
      "success"
    );
  }

  await Promise.all([
    loadPublisherQueue(),
    loadPublishedList(),
    loadPublisherStatistics()
  ]);
}

async function initializePublisher() {
  const allowed = await authorizePublisher();
  if (!allowed) return;

  await Promise.all([
    loadPublisherQueue(),
    loadPublishedList(),
    loadPublisherStatistics()
  ]);
}

document.addEventListener("DOMContentLoaded", () => {
  if ($("#publisher-submissions")) {
    initializePublisher();
  }
});

export {
  authorizePublisher,
  loadPublisherQueue,
  loadPublishedList,
  loadPublisherStatistics,
  reviewSubmission
};
