
/*
  साहित्यिक शब्द लोक - Certificate System
  Certificates are read from the database, not generated as fake records.
*/

import { supabase } from "./supabase-client.js";

const $ = (selector) => document.querySelector(selector);

function showCertificateMessage(text) {
  const box = $("#certificate-message") || $("#verify-message");
  if (box) box.textContent = text;
}

function addText(container, tag, text) {
  const element = document.createElement(tag);
  element.textContent = text || "";
  container.append(element);
  return element;
}

async function getCertificateById(id) {
  if (!supabase || !id) return null;

  const { data, error } = await supabase
    .from("certificates")
    .select("id, certificate_code, title, author_name, issued_at, status")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

async function getCertificateByCode(code) {
  if (!supabase || !code) return null;

  const { data, error } = await supabase
    .from("certificates")
    .select("id, certificate_code, title, author_name, issued_at, status")
    .eq("certificate_code", code)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

function renderCertificate(certificate) {
  const container = $("#certificate-details");
  if (!container) return;

  container.replaceChildren();

  if (!certificate || certificate.status !== "valid") {
    addText(container, "h2", "प्रमाणपत्र उपलब्ध या मान्य नहीं है।");
    return;
  }

  addText(container, "h2", "प्रकाशन प्रमाणपत्र");
  addText(container, "p", "साहित्यिक शब्द लोक | Adarsh Raj Shayar (ARS)");
  addText(container, "p", "यह प्रमाणित किया जाता है कि");
  addText(container, "h2", certificate.author_name);
  addText(container, "p", "की रचना प्रकाशित की गई है।");
  addText(container, "h3", certificate.title);
  addText(
    container,
    "p",
    `जारी तिथि: ${new Date(certificate.issued_at).toLocaleDateString("hi-IN")}`
  );
  addText(container, "p", `Certificate ID: ${certificate.certificate_code}`);
  addText(container, "p", "Founder - Adarsh Raj Shayar");
}

async function displayCertificate() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    showCertificateMessage("Certificate ID उपलब्ध नहीं है।");
    return;
  }

  const certificate = await getCertificateById(id);

  if (!certificate || certificate.status !== "valid") {
    showCertificateMessage("यह प्रमाणपत्र नहीं मिला या रद्द किया जा चुका है।");
    renderCertificate(null);
    return;
  }

  renderCertificate(certificate);
}

async function verifyCertificate(event) {
  event?.preventDefault();

  const code = $("#certificate-code")?.value.trim();

  if (!code) {
    showCertificateMessage("कृपया Certificate ID दर्ज करें।");
    return;
  }

  const certificate = await getCertificateByCode(code);

  if (!certificate || certificate.status !== "valid") {
    showCertificateMessage("प्रमाणपत्र रिकॉर्ड नहीं मिला या रद्द है।");
    return;
  }

  showCertificateMessage("प्रमाणपत्र सत्यापित है।");

  const result = $("#verify-result");

  if (result) {
    result.replaceChildren();

    addText(result, "h3", "प्रमाणपत्र सत्यापित है");
    addText(result, "p", `लेखक: ${certificate.author_name}`);
    addText(result, "p", `रचना: ${certificate.title}`);
    addText(result, "p", `Certificate ID: ${certificate.certificate_code}`);

    const link = document.createElement("a");
    link.href = `certificate.html?id=${encodeURIComponent(certificate.id)}`;
    link.textContent = "प्रमाणपत्र देखें";
    result.append(link);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  $("#verify-certificate-form")
    ?.addEventListener("submit", verifyCertificate);

  if ($("#certificate-details")) {
    displayCertificate();
  }
});

export {
  getCertificateById,
  getCertificateByCode,
  displayCertificate,
  verifyCertificate
};
