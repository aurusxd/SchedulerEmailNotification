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

function decrementCount(counterElement) {
  if (!counterElement) return;
  const currentValue = Number.parseInt(counterElement.textContent || "0", 10);
  const safeValue = Number.isNaN(currentValue) ? 0 : currentValue;
  counterElement.textContent = String(Math.max(0, safeValue - 1));
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
  const deleteBtn = event.target.closest(".delete-task-btn");
  if (deleteBtn) {
    const row = deleteBtn.closest("tr");
    if (row) {
      if (activeTrigger && row.contains(activeTrigger)) closePopover();
      row.remove();
      decrementCount(tasksTodayCount);
      decrementCount(inProgressCount);
      decrementCount(overdueCount);
    }
    return;
  }

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
  row.dataset.userAdded = "true";

  const titleCell = document.createElement("td");
  const titleWrap = document.createElement("div");
  titleWrap.className = "task-title-wrap";
  const titleText = document.createElement("span");
  titleText.textContent = title;
  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "btn btn-danger btn-inline-delete delete-task-btn";
  deleteBtn.textContent = "Удалить";
  titleWrap.appendChild(titleText);
  titleWrap.appendChild(deleteBtn);
  titleCell.appendChild(titleWrap);
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
