
/*
  साहित्यिक शब्द लोक - Sample Starter Content
  Run only while logged in with an authorized Admin account.
*/

import { supabase } from "./supabase-client.js";

const starterWorks = [
  {
    title: "उम्मीद का दीप",
    category: "प्रेरणादायक",
    body: "राहों में चाहे कितने भी अँधेरे मिलें,\nहौसलों के दीप फिर भी जलते रहें।\nमंज़िल उन्हीं कदमों को मिलती है,\nजो मुश्किलों में भी चलते रहें।"
  },
  {
    title: "यादों की बारिश",
    category: "दर्द",
    body: "कुछ यादें चुपके से लौट आती हैं,\nसूनी शामों को फिर महका जाती हैं।\nवक़्त भले ही आगे बढ़ जाता है,\nकुछ बातें दिल में रह जाती हैं।"
  },
  {
    title: "दोस्ती का रिश्ता",
    category: "दोस्ती",
    body: "न दौलत की चाह, न शोहरत की बात,\nदोस्ती में बस सच्चे एहसास की सौगात।\nमुश्किल में जो साथ निभा जाए,\nवही दोस्त कहलाए दिन और रात।"
  },
  {
    title: "नई सुबह",
    category: "कविता",
    body: "सूरज ने फिर दस्तक दी है,\nनई सुबह ने राह चुनी है।\nकल की भूलों से सीख लेकर,\nआज ने नई उम्मीद बुनी है।"
  },
  {
    title: "छोटी सी सीख",
    category: "जीवन",
    body: "एक गाँव में आरव नाम का बालक रहता था। वह हर काम जल्दी पूरा करना चाहता था। एक दिन उसने अपने दादा के साथ पौधा लगाया। दादा ने समझाया कि पौधे को बढ़ने के लिए समय, धैर्य और देखभाल चाहिए। आरव ने रोज़ पौधे को पानी दिया। कुछ समय बाद पौधा बड़ा हुआ। आरव समझ गया कि अच्छी चीज़ें मेहनत और धैर्य से ही बढ़ती हैं।"
  }
];

export async function addStarterContent() {
  if (!supabase) {
    throw new Error("Supabase configure नहीं है।");
  }

  const { data: { user }, error: authError } =
    await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("पहले Admin अकाउंट से Login करें।");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    throw new Error("केवल Admin starter content जोड़ सकता है।");
  }

  const rows = starterWorks.map((work) => ({
    author_id: user.id,
    author_name: profile.full_name || "Adarsh Raj Shayar",
    title: work.title,
    body: work.body,
    category: work.category,
    status: "published"
  }));

  const { data, error } = await supabase
    .from("submissions")
    .insert(rows)
    .select("id, title");

  if (error) {
    console.error(error);
    throw new Error("Starter content नहीं जुड़ा: " + error.message);
  }

  return data;
}

// Admin page पर यह button लगाएँ:
// <button id="seed-content-btn">Sample Content जोड़ें</button>
document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector("#seed-content-btn");
  if (!button) return;

  button.addEventListener("click", async () => {
    button.disabled = true;

    try {
      const added = await addStarterContent();
      alert(`${added.length} sample रचनाएँ जोड़ दी गईं।`);
    } catch (error) {
      alert(error.message);
    } finally {
      button.disabled = false;
    }
  });
});
