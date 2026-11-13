/*
  साहित्यिक शब्द लोक
  Reader Comments
*/

import { supabase } from "./supabase-client.js";

const section = document.querySelector("#comments-section");
const form = document.querySelector("#comment-form");
const commentInput = document.querySelector("#comment-body");
const commentMessage = document.querySelector("#comment-message");
const commentsList = document.querySelector("#comments-list");
const submitButton = document.querySelector("#comment-submit");

const params = new URLSearchParams(window.location.search);
const submissionId = params.get("id");

let currentUser = null;

function showMessage(message) {
  if (commentMessage) {
    commentMessage.textContent = message;
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
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

async function loadCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error(error);
    return null;
  }

  return data.user;
}

async function loadComments() {
  if (!submissionId || !commentsList) return;

  const { data, error } = await supabase
    .from("comments")
    .select("id, author_name, body, created_at")
    .eq("submission_id", submissionId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Comments loading error:", error);
    commentsList.textContent = "टिप्पणियाँ अभी लोड नहीं हो सकीं।";
    return;
  }

  const comments = data || [];

  if (!comments.length) {
    commentsList.textContent = "अभी कोई स्वीकृत टिप्पणी नहीं है।";
    return;
  }

  commentsList.innerHTML = comments.map((comment) => `
    <article class="comment-card">
      <strong>${escapeHTML(comment.author_name)}</strong>
      <small> · ${escapeHTML(formatDate(comment.created_at))}</small>
      <p>${escapeHTML(comment.body)}</p>
    </article>
  `).join("");
}

async function submitComment(event) {
  event.preventDefault();

  if (!currentUser) {
    showMessage("टिप्पणी करने के लिए पहले लॉगिन करें।");
    return;
  }

  const body = commentInput.value.trim();

  if (!body) {
    showMessage("कृपया अपनी टिप्पणी लिखें।");
    return;
  }

  if (body.length > 2000) {
    showMessage("टिप्पणी 2000 अक्षरों से छोटी रखें।");
    return;
  }

  const authorName =
    currentUser.user_metadata?.display_name ||
    currentUser.user_metadata?.full_name ||
    currentUser.email?.split("@")[0] ||
    "पाठक";

  submitButton.disabled = true;
  showMessage("आपकी टिप्पणी भेजी जा रही है...");

  const { error } = await supabase
    .from("comments")
    .insert({
      submission_id: submissionId,
      author_id: currentUser.id,
      author_name: authorName,
      body,
      status: "pending"
    });

  submitButton.disabled = false;

  if (error) {
    console.error("Comment submission error:", error);
    showMessage("टिप्पणी भेजी नहीं जा सकी। कृपया दोबारा प्रयास करें।");
    return;
  }

  commentInput.value = "";

  showMessage(
    "आपकी टिप्पणी समीक्षा के लिए भेज दी गई है। स्वीकृत होने के बाद दिखाई देगी।"
  );
}

async function initializeComments() {
  if (!section) return;

  if (!supabase) {
    showMessage("टिप्पणी सेवा अभी उपलब्ध नहीं है।");
    return;
  }

  if (!submissionId) {
    showMessage("रचना की जानकारी उपलब्ध नहीं है।");
    return;
  }

  section.hidden = false;

  currentUser = await loadCurrentUser();

  if (!currentUser) {
    commentInput.disabled = true;
    submitButton.disabled = true;

    showMessage("टिप्पणी करने के लिए लॉगिन करना आवश्यक है।");
  }

  await loadComments();

  form.addEventListener("submit", submitComment);
}

initializeComments();
