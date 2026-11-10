
function showMessage(message, isError = false) {
  const box =
    document.getElementById("register-message") ||
    document.getElementById("auth-message");

  if (!box) return;

  box.textContent = message;
  box.style.display = "block";
  box.style.color = isError ? "#b42318" : "#176b3a";
}

async function getSupabase() {
  const module = await import("./supabase-client.js");

  if (!module.supabase) {
    throw new Error("Supabase client नहीं मिला।");
  }

  return module.supabase;
}

async function sendRegistrationOtp(event) {
  event.preventDefault();
  event.stopPropagation();

  const button = document.getElementById("send-register-otp");
  const name = document.getElementById("full-name")?.value.trim();
  const email = document.getElementById("register-email")?.value.trim();

  if (!name || !email) {
    showMessage("कृपया अपना नाम और ईमेल भरें।", true);
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = "OTP भेजा जा रहा है...";
  }

  try {
    const supabase = await getSupabase();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: {
          full_name: name
        }
      }
    });

    if (error) throw error;

    const otpSection = document.getElementById("register-otp-section");

    if (otpSection) {
      otpSection.style.display = "block";
    }

    showMessage("OTP भेजने का अनुरोध सफल हुआ। अपना ईमेल चेक करें।");
  } catch (error) {
    showMessage("OTP नहीं भेजा जा सका: " + error.message, true);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "ईमेल OTP प्राप्त करें";
    }
  }
}

async function verifyRegistrationOtp() {
  const email = document.getElementById("register-email")?.value.trim();
  const token = document.getElementById("register-otp")?.value.trim();

  if (!email || !token) {
    showMessage("ईमेल और OTP दोनों भरें।", true);
    return;
  }

  try {
    const supabase = await getSupabase();

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email"
    });

    if (error) throw error;

    showMessage("ईमेल सत्यापित हो गया।");

    window.location.href = "author-dashboard.html";
  } catch (error) {
    showMessage("OTP सत्यापित नहीं हुआ: " + error.message, true);
  }
}

function initializeAuth() {
  const registerForm = document.getElementById("register-form");

  if (registerForm) {
    registerForm.addEventListener("submit", sendRegistrationOtp);
  }

  const verifyButton = document.getElementById("register-verify-button");

  if (verifyButton) {
    verifyButton.addEventListener("click", verifyRegistrationOtp);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAuth);
} else {
  initializeAuth();
}
