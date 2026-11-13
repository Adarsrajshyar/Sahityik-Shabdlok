/*
  साहित्यिक शब्द लोक - ARS
  Author Writing Submission
*/

import { supabase } from "./supabase-client.js";

const categoryOptions = {
  shayari: [
    { value: "प्रेम", label: "प्रेम शायरी" },
    { value: "दर्द", label: "दर्द शायरी" },
    { value: "भावनात्मक", label: "भावनात्मक शायरी" },
    { value: "प्रेरणादायक", label: "प्रेरणादायक शायरी" },
    { value: "दोस्ती", label: "दोस्ती शायरी" },
    { value: "अन्य", label: "अन्य" }
  ],

  poetry: [
    { value: "प्रेरणादायक", label: "प्रेरणादायक कविता" },
    { value: "प्रकृति", label: "प्रकृति कविता" },
    { value: "सामाजिक", label: "सामाजिक कविता" },
    { value: "भावनात्मक", label: "भावनात्मक कविता" },
    { value: "अन्य", label: "अन्य" }
  ],

  story: [
    { value: "जीवन", label: "जीवन से जुड़ी कहानी" },
    { value: "प्रेरणा", label: "प्रेरणादायक कहानी" },
    { value: "सामाजिक", label: "सामाजिक कहानी" },
    { value: "रहस्य", label: "रहस्य कहानी" },
    { value: "अन्य", label: "अन्य" }
  ]
};

function showMessage(message, type = "error") {
  const box = document.getElementById("submission-message");

  if (!box) return;

  box.textContent = message;
  box.dataset.type = type;
}

function updateCategories() {
  const typeSelect = document.getElementById("work-type");
  const categorySelect = document.getElementById("work-category");

  if (!typeSelect || !categorySelect) return;

  const selectedType = typeSelect.value;
  const options = categoryOptions[selectedType];

  categorySelect.innerHTML = "";

  if (!options) {
    categorySelect.disabled = true;
    categorySelect.add(
      new Option("पहले रचना का प्रकार चुनें", "")
    );
    return;
  }

  categorySelect.disabled = false;
  categorySelect.add(new Option("श्रेणी चुनें", ""));

  options.forEach((item) => {
    categorySelect.add(
      new Option(item.label, item.value)
    );
  });
}

async function checkLogin() {
  if (!supabase) {
    showMessage("Supabase backend configure नहीं है।", "error");
    return null;
  }

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    showMessage(
      "रचना जमा करने के लिए पहले अपने अकाउंट में Login करें।",
      "error"
    );
    return null;
  }

  return data.user;
}

async function submitWriting(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const button = document.getElementById("submit-writing-button");

  if (!supabase) {
    showMessage("Backend उपलब्ध नहीं है। बाद में पुनः प्रयास करें।");
    return;
  }

  const user = await checkLogin();

  if (!user) return;

  const title = document.getElementById("work-title").value.trim();
  const type = document.getElementById("work-type").value;
  const category = document.getElementById("work-category").value;
  const body = document.getElementById("work-content").value.trim();
  const penName = document.getElementById("pen-name").value.trim();
  const originalConfirmed =
    document.getElementById("original-work").checked;

  if (!title || !type || !category || !body) {
    showMessage("कृपया सभी आवश्यक जानकारी भरें।");
    return;
  }

  if (body.length < 20) {
    showMessage("रचना कम से कम 20 अक्षरों की होनी चाहिए।");
    return;
  }

  if (!originalConfirmed) {
    showMessage("कृपया मौलिक रचना की पुष्टि करें।");
    return;
  }

  if (!categoryOptions[type]) {
    showMessage("रचना का प्रकार सही चुनें।");
    return;
  }

  const validCategory = categoryOptions[type].some(
    (item) => item.value === category
  );

  if (!validCategory) {
    showMessage("कृपया सही श्रेणी चुनें।");
    return;
  }

  button.disabled = true;
  button.textContent = "रचना जमा हो रही है...";

  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    const authorName =
      penName ||
      profile?.full_name ||
      user.user_metadata?.full_name ||
      user.email ||
      "ARS लेखक";

    /*
      Database में category को type:subcategory के रूप में
      रखा जाएगा, उदाहरण: shayari:प्रेम
    */

    const databaseCategory = `${type}:${category}`;

    const { error } = await supabase
      .from("submissions")
      .insert({
        author_id: user.id,
        author_name: authorName,
        title: title,
        body: body,
        category: databaseCategory,
        status: "pending"
      });

    if (error) {
      throw error;
    }

    showMessage(
      "आपकी रचना सफलतापूर्वक समीक्षा के लिए जमा हो गई है। आप Author Dashboard में इसकी स्थिति देख सकते हैं।",
      "success"
    );

    form.reset();
    updateCategories();

  } catch (error) {
    console.error("Writing submission error:", error);

    showMessage(
      error.message ||
      "रचना जमा नहीं हो सकी। कृपया कुछ समय बाद पुनः प्रयास करें।",
      "error"
    );

  } finally {
    button.disabled = false;
    button.textContent = "रचना समीक्षा के लिए भेजें";
  }
}

function initializeSubmissionForm() {
  const form = document.getElementById("submission-form");
  const typeSelect = document.getElementById("work-type");

  if (!form || !typeSelect) return;

  typeSelect.addEventListener("change", updateCategories);
  form.addEventListener("submit", submitWriting);
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeSubmissionForm
  );
} else {
  initializeSubmissionForm();
}
