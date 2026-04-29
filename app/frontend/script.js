import { clearAuthUser, createPageFeedback, loadAuthUser, updateAuthUi } from "./js/auth-state.js";
import { initTaskBoard } from "./js/task-board.js";

const authHeaderTitle = document.getElementById("authHeaderTitle");
const authHeaderSubtitle = document.getElementById("authHeaderSubtitle");
const goAuthLink = document.getElementById("goAuthLink");
const logoutBtn = document.getElementById("logoutBtn");

const currentUser = loadAuthUser();
if (!currentUser?.id) {
  window.location.href = "./auth.html";
}

updateAuthUi({
  currentUser,
  authHeaderTitle,
  authHeaderSubtitle,
  goAuthLink,
  logoutBtn,
});

const showPageFeedback = createPageFeedback(authHeaderSubtitle);

logoutBtn?.addEventListener("click", () => {
  clearAuthUser();
  window.location.href = "./auth.html";
});

initTaskBoard({ currentUser, showPageFeedback });
