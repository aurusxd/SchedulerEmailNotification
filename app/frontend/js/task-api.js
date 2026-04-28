import { API_BASE_URL } from "./config.js";
import { normalizeText } from "./utils.js";

export async function createTaskInBackend(taskData, currentUser) {
  if (!currentUser?.id) return;

  const deadline = taskData.deadlineEnd || taskData.deadlineStart;
  if (!deadline) return;

  const payload = {
    name: taskData.title,
    description: taskData.description || null,
    status: taskData.status || "Не начато",
    priority: taskData.priority || "Низкий",
    type: taskData.taskType || "Общая",
    start_date: taskData.deadlineStart || null,
    end_date: `${deadline}T00:00:00`,
    user_id: currentUser.id,
  };

  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const detail = normalizeText(data?.detail || "Ошибка создания задачи в БД");
    throw new Error(detail);
  }
}
