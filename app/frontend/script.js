const tableBody = document.querySelector(".tasks-table tbody");
const openTaskFormBtn = document.getElementById("openTaskFormBtn");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskNameInput = document.getElementById("taskNameInput");
const tasksTodayCount = document.getElementById("tasksTodayCount");
const inProgressCount = document.getElementById("inProgressCount");
const overdueCount = document.getElementById("overdueCount");

function resetTaskForm() {
  taskNameInput.value = "";
}

function incrementCount(counterElement) {
  if (!counterElement) return;
  const currentValue = Number.parseInt(counterElement.textContent || "0", 10);
  const nextValue = Number.isNaN(currentValue) ? 1 : currentValue + 1;
  counterElement.textContent = String(nextValue);
}

openTaskFormBtn.addEventListener("click", () => {
  const inlineTaskRow = tableBody.querySelector(".new-task-row");
  if (inlineTaskRow) inlineTaskRow.scrollIntoView({ behavior: "smooth", block: "center" });
  taskNameInput.focus();
});

addTaskBtn.addEventListener("click", () => {
  const title = taskNameInput.value.trim();
  if (!title) {
    taskNameInput.focus();
    return;
  }

  const row = document.createElement("tr");

  const titleCell = document.createElement("td");
  titleCell.textContent = title;
  row.appendChild(titleCell);

  for (let i = 0; i < 7; i += 1) {
    row.appendChild(document.createElement("td"));
  }

  const insertBeforeNode = tableBody.querySelector(".new-task-row");
  tableBody.insertBefore(row, insertBeforeNode || null);

  incrementCount(tasksTodayCount);
  incrementCount(inProgressCount);
  incrementCount(overdueCount);

  resetTaskForm();
  taskNameInput.focus();
});

taskNameInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addTaskBtn.click();
});
