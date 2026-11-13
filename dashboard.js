import { requireSupabase } from "./supabase-client.js";

"use strict";

const supabase = requireSupabase();

const $ = (id) => document.getElementById(id);

const statusLabels = {
  pending: "लंबित",
  under_review: "समीक्षा में",
  revision_requested: "सुधार आवश्यक",
  approved: "स्वीकृत",
  published: "प्रकाशित",
  rejected: "अस्वीकृत"
};

function showDashboardMessage(message) {
  const element = $("dashboard-message");
  if (element) element.textContent = message;
}

function safeText(value) {
  return value == null ? "—" : String(value);
}

function createCell(value) {
  const td = document.createElement("td");
  td.textContent = safeText(value);
  return td;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("hi-IN");
}

async function loadDashboard() {

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) throw sessionError;

  const user = sessionData.session?.user;

  if (!user) {
    window.location.replace("login.html");
    return;
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

  if (profileError) throw profileError;

  if (!profile) {
    showDashboardMessage(
      "आपकी प्रोफाइल अभी उपलब्ध नहीं है। Admin से संपर्क करें।"
    );
    return;
  }

  const role = profile.role || "reader";
  const currentPage = window.location.pathname.split("/").pop();

  if (
    currentPage === "author-dashboard.html" &&
    role !== "author"
  ) {
    showDashboardMessage(
      "यह पृष्ठ केवल Author अकाउंट के लिए उपलब्ध है।"
    );
    return;
  }

  if (
    currentPage === "dashboard.html" &&
    role !== "reader"
  ) {
    const routes = {
      author: "author-dashboard.html",
      publisher: "publisher.html",
      admin: "admin.html"
    };

    if (routes[role]) {
      window.location.replace(routes[role]);
      return;
    }
  }

  const name =
    profile.display_name ||
    profile.full_name ||
    user.user_metadata?.display_name ||
    user.user_metadata?.full_name ||
    "पाठक";

  if ($("reader-name")) $("reader-name").textContent = name;
  if ($("author-name")) $("author-name").textContent = name;

  if ($("profile-name")) {
    $("profile-name").textContent =
      profile.full_name || name;
  }

  if ($("profile-email")) {
    $("profile-email").textContent = user.email || "—";
  }

  if ($("profile-role")) {
    $("profile-role").textContent = role;
  }

  if ($("profile-display-name")) {
    $("profile-display-name").textContent =
      profile.display_name || "—";
  }

  if (role === "author") {
    await loadAuthorSubmissions(user.id);
  }

}

async function loadAuthorSubmissions(userId) {

  const tbody = $("author-submissions");

  if (!tbody) return;

  const { data: writings, error } = await supabase
    .from("writings")
    .select("id,title,category,status,created_at")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Submissions error:", error);
    tbody.innerHTML = "";
    const row = document.createElement("tr");
    const cell = createCell("रचनाएँ लोड नहीं हो सकीं।");
    cell.colSpan = 4;
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  const items = writings || [];

  const total = $("total-submissions");
  const pending = $("pending-submissions");
  const published = $("published-submissions");

  if (total) total.textContent = items.length;

  if (pending) {
    pending.textContent = items.filter(item =>
      ["pending", "under_review", "revision_requested"]
        .includes(item.status)
    ).length;
  }

  if (published) {
    published.textContent = items.filter(item =>
      item.status === "published"
    ).length;
  }

  tbody.replaceChildren();

  if (items.length === 0) {
    const row = document.createElement("tr");
    const cell = createCell("अभी तक कोई रचना प्रस्तुत नहीं की गई है।");
    cell.colSpan = 4;
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  items.forEach(item => {

    const row = document.createElement("tr");

    row.appendChild(createCell(item.title));
    row.appendChild(createCell(item.category));
    row.appendChild(
      createCell(statusLabels[item.status] || item.status)
    );
    row.appendChild(createCell(formatDate(item.created_at)));

    tbody.appendChild(row);

  });

}

async function logout() {

  const button = $("logout-button");

  if (button) button.disabled = true;

  try {

    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    window.location.replace("login.html");

  } catch (error) {

    console.error("Logout error:", error);
    showDashboardMessage("Logout नहीं हो सका। पुनः प्रयास करें।");

    if (button) button.disabled = false;

  }

}

const logoutButton = $("logout-button");

if (logoutButton) {
  logoutButton.addEventListener("click", logout);
}

loadDashboard().catch(error => {
  console.error("Dashboard error:", error);
  showDashboardMessage(
    "Dashboard लोड नहीं हुआ। कृपया पेज Refresh करें।"
  );
});
