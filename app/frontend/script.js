const tableBody = document.querySelector(".tasks-table tbody");
const openTaskFormBtn = document.getElementById("openTaskFormBtn");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskNameInput = document.getElementById("taskNameInput");
const tasksTodayCount = document.getElementById("tasksTodayCount");
const inProgressCount = document.getElementById("inProgressCount");
const overdueCount = document.getElementById("overdueCount");
const popover = document.getElementById("deadlinePopover");
const startInput = document.getElementById("startDateInput");
const endInput = document.getElementById("endDateInput");
const saveBtn = document.getElementById("saveDatesBtn");
const closeBtn = document.getElementById("closePopoverBtn");
let activeTrigger = null;

function resetTaskForm() {
  taskNameInput.value = "";
}

function incrementCount(counterElement) {
  if (!counterElement) return;
  const currentValue = Number.parseInt(counterElement.textContent || "0", 10);
  const nextValue = Number.isNaN(currentValue) ? 1 : currentValue + 1;
  counterElement.textContent = String(nextValue);
}

function formatDate(isoDate) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return month + "/" + day + "/" + year;
}

function formatDateRange(startDate, endDate) {
  const startFormatted = formatDate(startDate);
  const endFormatted = formatDate(endDate);
  if (startFormatted && endFormatted) return startFormatted + " - " + endFormatted;
  return endFormatted || startFormatted || "Указать дедлайн";
}

function openPopover(trigger) {
  activeTrigger = trigger;
  startInput.value = trigger.dataset.start || "";
  endInput.value = trigger.dataset.end || "";

  const triggerRect = trigger.getBoundingClientRect();
  const workspaceRect = document.querySelector(".workspace")?.getBoundingClientRect();
  const offsetLeft = workspaceRect ? triggerRect.left - workspaceRect.left : triggerRect.left;
  const offsetTop = workspaceRect ? triggerRect.bottom - workspaceRect.top : triggerRect.bottom;

  popover.style.left = offsetLeft + 12 + "px";
  popover.style.top = offsetTop + 10 + "px";
  popover.classList.remove("hidden");
}

function closePopover() {
  popover.classList.add("hidden");
  activeTrigger = null;
}

openTaskFormBtn.addEventListener("click", () => {
  const inlineTaskRow = tableBody.querySelector(".new-task-row");
  if (inlineTaskRow) inlineTaskRow.scrollIntoView({ behavior: "smooth", block: "center" });
  taskNameInput.focus();
});

tableBody.querySelectorAll(".date-trigger").forEach((trigger) => {
  trigger.textContent = formatDateRange(trigger.dataset.start, trigger.dataset.end);
});

tableBody.addEventListener("click", (event) => {
  const trigger = event.target.closest(".date-trigger");
  if (!trigger) return;
  event.stopPropagation();
  openPopover(trigger);
});

saveBtn.addEventListener("click", () => {
  if (!activeTrigger) return;
  activeTrigger.dataset.start = startInput.value;
  activeTrigger.dataset.end = endInput.value;
  activeTrigger.textContent = formatDateRange(startInput.value, endInput.value);
  closePopover();
});

closeBtn.addEventListener("click", closePopover);

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

  row.appendChild(document.createElement("td")); // status
  row.appendChild(document.createElement("td")); // assignee

  const deadlineCell = document.createElement("td");
  const deadlineBtn = document.createElement("button");
  deadlineBtn.className = "date-trigger";
  deadlineBtn.type = "button";
  deadlineBtn.dataset.start = "";
  deadlineBtn.dataset.end = "";
  deadlineBtn.textContent = formatDateRange("", "");
  deadlineCell.appendChild(deadlineBtn);
  row.appendChild(deadlineCell);

  row.appendChild(document.createElement("td")); // priority
  row.appendChild(document.createElement("td")); // type
  row.appendChild(document.createElement("td")); // description
  row.appendChild(document.createElement("td")); // estimate

  const insertBeforeNode = tableBody.querySelector(".new-task-row");
  tableBody.insertBefore(row, insertBeforeNode || null);

  incrementCount(tasksTodayCount);
  incrementCount(inProgressCount);
  incrementCount(overdueCount);

  resetTaskForm();
  taskNameInput.focus();
});

document.addEventListener("click", (event) => {
  if (popover.classList.contains("hidden")) return;
  if (!popover.contains(event.target)) closePopover();
});

taskNameInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addTaskBtn.click();
});
