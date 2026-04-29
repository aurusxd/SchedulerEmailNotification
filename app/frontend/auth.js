const AUTH_STORAGE_KEY = "tasknotify_auth_user_v1";
const authForm = document.getElementById("authForm");
const usernameInput = document.getElementById("usernameInput");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const authFeedback = document.getElementById("authFeedback");
const API_BASE_URL = window.localStorage.getItem("tasknotify_api_base_url") || "http://127.0.0.1:8000";
const authMode = document.body.dataset.authMode || "login";

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function showAuthFeedback(message, type = "") {
  if (!authFeedback) return;
  const text = normalizeText(message);
  authFeedback.textContent = text;
  authFeedback.classList.toggle("hidden", !text);
  authFeedback.classList.toggle("error", type === "error");
  authFeedback.classList.toggle("success", type === "success");
}

function saveAuthUser(user) {
  if (!user) return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch (_) {
    // Ignore storage errors.
  }
}

function loadAuthUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!Number.isInteger(parsed.id)) return null;
    return parsed;
  } catch (_) {
    return null;
  }
}

async function authRequest(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(normalizeText(data?.detail || "Ошибка авторизации"));
  }
  return data;
}

async function submitAuth(event) {
  event.preventDefault();
  const username = normalizeText(usernameInput?.value);
  const password = passwordInput?.value || "";
  const email_address = normalizeText(emailInput?.value);

  if (!username || !password) {
    showAuthFeedback("Введите логин и пароль", "error");
    return;
  }

  if (authMode === "register" && !email_address) {
    showAuthFeedback("Введите email для регистрации", "error");
    return;
  }

  try {
    const data =
      authMode === "register"
        ? await authRequest("/api/auth/register", { username, email_address, password })
        : await authRequest("/api/auth/login", { username, password });
    saveAuthUser(data.user);
    window.location.href = "./index.html";
  } catch (error) {
    showAuthFeedback(
      error.message || (authMode === "register" ? "Ошибка регистрации" : "Ошибка входа"),
      "error"
    );
  }
}

const existingUser = loadAuthUser();
if (existingUser?.id) {
  window.location.href = "./index.html";
}

authForm?.addEventListener("submit", submitAuth);
