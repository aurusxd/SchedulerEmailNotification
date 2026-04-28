import { AUTH_STORAGE_KEY } from "./config.js";
import { normalizeText } from "./utils.js";

export function loadAuthUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!Number.isInteger(parsed.id)) return null;
    return {
      id: parsed.id,
      username: normalizeText(parsed.username),
      email_address: normalizeText(parsed.email_address),
    };
  } catch (_) {
    return null;
  }
}

export function clearAuthUser() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (_) {
    // Ignore storage errors.
  }
}

export function updateAuthUi({ currentUser, authHeaderTitle, authHeaderSubtitle, goAuthLink, logoutBtn }) {
  const isLoggedIn = Boolean(currentUser?.id);
  goAuthLink?.classList.toggle("hidden", isLoggedIn);
  logoutBtn?.classList.toggle("hidden", !isLoggedIn);

  if (authHeaderTitle) {
    authHeaderTitle.textContent = isLoggedIn ? `Пользователь: ${currentUser.username}` : "Профиль";
  }

  if (authHeaderSubtitle) {
    authHeaderSubtitle.textContent = isLoggedIn
      ? `ID: ${currentUser.id}. Этот user_id будет отправлен в БД при создании задачи.`
      : "Авторизуйтесь для работы с задачами на странице входа";
  }
}

export function createPageFeedback(authHeaderSubtitle) {
  return (message) => {
    if (!authHeaderSubtitle) return;
    const text = normalizeText(message);
    if (!text) return;
    authHeaderSubtitle.textContent = text;
  };
}
