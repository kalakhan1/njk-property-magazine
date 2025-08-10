<!-- app.js - global ajax, auth helpers, file->base64, UI helpers -->
<script>
/*
  IMPORTANT: replace API_ENDPOINT with your deployed Apps Script webapp URL
  e.g. const API_ENDPOINT = "https://script.google.com/macros/s/AKfycbz-KVydQwfbGrbTsacE2AFSlDG5HqJ3rt6JRI8aqQUmvdqJIKdaA2rrYtG97tbqW-LgbQ/exec";
*/
const API_ENDPOINT = "PASTE_YOUR_WEBAPP_URL_HERE";

/* Generic API helper (POST, form-encoded) */
async function api(action, data = {}, method = "POST") {
  data.action = action;

  // attach stored token automatically if present and not provided explicitly
  if (!data.tokenId) {
    const stored = localStorage.getItem("njk_token");
    if (stored) data.tokenId = stored;
  }

  const body = new URLSearchParams();
  for (const k in data) {
    if (data[k] !== undefined && data[k] !== null) body.append(k, data[k]);
  }

  const res = await fetch(API_ENDPOINT, { method, body });
  return res.json();
}

/* Auth helpers */
async function login(email, password) {
  const res = await api("login", { email, password });
  if (res.status === "success") {
    localStorage.setItem("njk_token", res.tokenId);
    localStorage.setItem("njk_user", JSON.stringify(res.user));
  }
  return res;
}

function logout() {
  localStorage.removeItem("njk_token");
  localStorage.removeItem("njk_user");
  window.location = "/auth.html";
}

function requireAuth(redirectTo = "/auth.html") {
  const token = localStorage.getItem("njk_token");
  if (!token) { window.location = redirectTo; return null; }
  return token;
}

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem("njk_user") || "null"); } catch (e) { return null; }
}

/* Convert file -> DataURL (base64) */
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = err => reject(err);
    reader.readAsDataURL(file);
  });
}

/* Small UI helpers */
function showMsg(msg, isError = false) {
  // simple toast-like behavior
  const id = "njk_toast";
  let t = document.getElementById(id);
  if (!t) {
    t = document.createElement("div");
    t.id = id;
    t.style.position = "fixed";
    t.style.right = "20px";
    t.style.top = "20px";
    t.style.zIndex = 9999;
    document.body.appendChild(t);
  }
  t.innerHTML = `<div style="background:${isError ? '#ffdddd' : '#e6ffef'}; color:${isError ? '#a00' : '#064'}; padding:12px 16px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.08)">${msg}</div>`;
  setTimeout(()=> { if (t) t.innerHTML = ""; }, 3500);
}

function clearForm(form) {
  form.reset();
  // clear file input visuals if any
  const file = form.querySelector('input[type=file]');
  if (file) file.value = "";
}

/* Simple role guard for admin pages (client-side check) */
function requireAdmin(redirectTo="/auth.html") {
  const u = getCurrentUser();
  if (!u || u.role !== 'admin') {
    alert("Access denied — admin only");
    window.location = redirectTo;
    return null;
  }
  return u;
}
</script>
