// Zipun Supabase Config
// Prioritas: localStorage (UI Settings) > konstanta di bawah > offline
const SUPABASE_URL = "https://pcltzfdmrnhwbalrbyyq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ss7ZlUvbNCpyqiYQQO8yWA_JvmEMj5-";

window.zipunSupaStatus = { mode: "init", reason: "starting" };
window.supabaseClient = null;

function zipunGetCreds() {
  try {
    const u = localStorage.getItem("zipun_supa_url") || "";
    const k = localStorage.getItem("zipun_supa_key") || "";
    if (u && k) return { url: u.trim(), key: k.trim(), from: "settings" };
  } catch(e) {}
  return { url: (SUPABASE_URL||"").trim(), key: (SUPABASE_ANON_KEY||"").trim(), from: "file" };
}

(function initSupa() {
  const { url, key, from } = zipunGetCreds();
  if (!url || !key) {
    window.zipunSupaStatus = { mode: "offline", reason: "URL/Key kosong ("+from+")" };
    console.log("[Zipun] Offline: URL/Key kosong");
    return;
  }
  if (!window.supabase || !window.supabase.createClient) {
    window.zipunSupaStatus = { mode: "offline", reason: "CDN supabase-js gagal dimuat (cek internet/adblock)" };
    console.log("[Zipun] Offline: window.supabase tidak ada, CDN gagal?");
    return;
  }
  try {
    window.supabaseClient = window.supabase.createClient(url, key);
    window.zipunSupaStatus = { mode: "online", reason: "connected ("+from+")", url };
    console.log("[Zipun] Supabase connected via", from, url);
  } catch(e) {
    window.zipunSupaStatus = { mode: "offline", reason: "createClient gagal: " + (e.message||e) };
    window.supabaseClient = null;
    console.warn("[Zipun] Supabase gagal", e);
  }
})();

function zipunSaveCreds(url, key) {
  try {
    localStorage.setItem("zipun_supa_url", (url||"").trim());
    localStorage.setItem("zipun_supa_key", (key||"").trim());
  } catch(e) {}
  location.reload();
}
function zipunClearCreds() {
  try { localStorage.removeItem("zipun_supa_url"); localStorage.removeItem("zipun_supa_key"); } catch(e) {}
  location.reload();
}
