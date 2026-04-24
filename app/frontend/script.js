const tableBody = document.querySelector(".tasks-table tbody");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskNameInput = document.getElementById("taskNameInput");
const taskStatusInput = document.getElementById("taskStatusInput");
const taskStatusDisplay = document.getElementById("taskStatusDisplay");
const taskTypeInput = document.getElementById("taskTypeInput");
const taskTypeDisplay = document.getElementById("taskTypeDisplay");
const taskAssigneeInput = document.getElementById("taskAssigneeInput");
const taskDeadlineTrigger = document.getElementById("taskDeadlineTrigger");
const taskPriorityInput = document.getElementById("taskPriorityInput");
const taskDescriptionInput = document.getElementById("taskDescriptionInput");
const taskEstimateInput = document.getElementById("taskEstimateInput");
const tasksTodayCount = document.getElementById("tasksTodayCount");
const inProgressCount = document.getElementById("inProgressCount");
const overdueCount = document.getElementById("overdueCount");
const popover = document.getElementById("deadlinePopover");
const startInput = document.getElementById("startDateInput");
const endInput = document.getElementById("endDateInput");
const saveBtn = document.getElementById("saveDatesBtn");
const closeBtn = document.getElementById("closePopoverBtn");
let activeTrigger = null;
const table = document.querySelector(".tasks-table");
const tableHead = table?.querySelector("thead");
const newTaskRow = tableBody?.querySelector(".new-task-row") || null;

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function getCellText(cell) {
  return normalizeText(cell?.textContent || "");
}

function getHeaderTitles() {
  return Array.from(tableHead?.querySelectorAll("th") || []).map((th) => getCellText(th));
}

function getColumnIndexByTitle(title) {
  return getHeaderTitles().findIndex((t) => t === title);
}

function createPill(text, variantClass) {
  const span = document.createElement("span");
  span.className = `pill ${variantClass}`.trim();
  span.textContent = text;
  return span;
}

function renderCellByColumnTitle(td, columnTitle, value) {
  const v = normalizeText(value);
  td.replaceChildren();

  if (!v) return;

  if (columnTitle === "Статус") {
    const cls = v === "Выполнено" ? "done" : v === "В процессе" ? "progress" : "neutral";
    td.appendChild(createPill(v, cls));
    return;
  }

  if (columnTitle === "Приоритет") {
    const cls = v === "Высокий" ? "danger" : v === "Средний" ? "amber" : "mint-outline";
    td.appendChild(createPill(v, cls));
    return;
  }

  if (columnTitle === "Тип задачи") {
    const cls = v === "Доработка" ? "violet" : "mint";
    td.appendChild(createPill(v, cls));
    return;
  }

  if (columnTitle === "Оценка") {
    const cls = v === "Высокая" ? "danger" : v === "Средняя" ? "amber" : "mint";
    td.appendChild(createPill(v, cls));
    return;
  }

  td.textContent = v;
}

function setCellValue(td, columnTitle, value) {
  td.dataset.value = normalizeText(value);
  renderCellByColumnTitle(td, columnTitle, td.dataset.value);
  if (columnTitle === "Статус") recomputeCounters();
}

function getCellValue(td) {
  if (!td) return "";
  if (td.dataset.value !== undefined) return td.dataset.value;
  return getCellText(td);
}

function parseIsoDate(value) {
  const v = normalizeText(value);
  if (!v) return null;
  const [y, m, d] = v.split("-").map((n) => Number.parseInt(n, 10));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function recomputeCounters() {
  if (!tableBody) return;

  const rows = Array.from(tableBody.querySelectorAll("tr")).filter((r) => !r.classList.contains("new-task-row"));
  const total = rows.length;

  const statusIndex = getColumnIndexByTitle("Статус");
  const deadlineIndex = getColumnIndexByTitle("Срок");

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let inProgress = 0;
  let overdue = 0;

  for (const row of rows) {
    const statusTd = statusIndex >= 0 ? row.children[statusIndex] : null;
    const status = normalizeText(getCellValue(statusTd));
    if (status === "В процессе") inProgress++;

    const deadlineTd = deadlineIndex >= 0 ? row.children[deadlineIndex] : null;
    const trigger = deadlineTd?.querySelector?.(".date-trigger") || null;
    const endIso = trigger?.dataset?.end || trigger?.dataset?.start || "";
    const endDate = parseIsoDate(endIso);
    if (endDate && endDate < today && status !== "Выполнено") overdue++;
  }

  if (tasksTodayCount) tasksTodayCount.textContent = String(total);
  if (inProgressCount) inProgressCount.textContent = String(inProgress);
  if (overdueCount) overdueCount.textContent = String(overdue);
}

function startInlineEdit(td, columnTitle) {
  if (!td || !columnTitle) return;
  if (td.querySelector("input, select, textarea")) return;
  if (td.closest("tr")?.classList.contains("new-task-row")) return;
  if (columnTitle === "Название задачи" || columnTitle === "Срок") return;

  const currentValue = getCellValue(td);

  const commit = (nextValue) => {
    setCellValue(td, columnTitle, nextValue);
  };

  const cancel = () => {
    renderCellByColumnTitle(td, columnTitle, currentValue);
  };

  td.replaceChildren();

  if (columnTitle === "Исполнитель") {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "cell-input";
    input.value = currentValue;
    input.placeholder = "Указать исполнителя";
    td.appendChild(input);
    input.focus();
    input.select();

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        input.blur();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
    });
    input.addEventListener("blur", () => commit(input.value));
    return;
  }

  if (columnTitle === "Описание") {
    const textarea = document.createElement("textarea");
    textarea.className = "cell-textarea";
    textarea.value = currentValue;
    textarea.placeholder = "Добавить описание";
    td.appendChild(textarea);
    textarea.focus();
    textarea.select();

    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        textarea.blur();
      }
    });
    textarea.addEventListener("blur", () => commit(textarea.value));
    return;
  }

  const select = document.createElement("select");
  select.className = "cell-select";
  const options =
    columnTitle === "Статус"
      ? ["", "Не начато", "В процессе", "Выполнено"]
      : columnTitle === "Приоритет"
        ? ["", "Низкий", "Средний", "Высокий"]
        : columnTitle === "Тип задачи"
          ? ["", "Запрос фичи", "Доработка"]
          : columnTitle === "Оценка"
            ? ["", "Низкая", "Средняя", "Высокая"]
            : [""];

  for (const opt of options) {
    const optionEl = document.createElement("option");
    optionEl.value = opt;
    optionEl.textContent = opt || "—";
    select.appendChild(optionEl);
  }

  select.value = currentValue;
  td.appendChild(select);
  select.focus();

  select.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    } else if (e.key === "Enter") {
      e.preventDefault();
      select.blur();
    }
  });
  select.addEventListener("change", () => commit(select.value));
  select.addEventListener("blur", () => commit(select.value));
}

function resetTaskForm() {
  taskNameInput.value = "";
  if (taskStatusInput) taskStatusInput.value = "Не начато";
  if (taskTypeInput) taskTypeInput.value = "";
  if (taskAssigneeInput) taskAssigneeInput.value = "";
  if (taskPriorityInput) taskPriorityInput.value = "";
  if (taskDescriptionInput) taskDescriptionInput.value = "";
  if (taskEstimateInput) taskEstimateInput.value = "";
  if (taskDeadlineTrigger) {
    taskDeadlineTrigger.dataset.start = "";
    taskDeadlineTrigger.dataset.end = "";
    taskDeadlineTrigger.textContent = formatDateRange("", "");
  }
  syncNewTaskRowEditors();
  addTaskBtn.classList.add("hidden");
}

function syncAddButtonVisibility() {
  const hasTitle = Boolean(taskNameInput.value.trim());
  addTaskBtn.classList.toggle("hidden", !hasTitle);
  newTaskRow?.classList.toggle("is-compact", !hasTitle);
  taskStatusDisplay?.classList.toggle("hidden", !hasTitle);
  taskTypeDisplay?.classList.toggle("hidden", !hasTitle);
  taskAssigneeInput?.classList.toggle("hidden", !hasTitle);
  taskDeadlineTrigger?.classList.toggle("hidden", !hasTitle);
  taskPriorityInput?.classList.toggle("hidden", !hasTitle);
  taskDescriptionInput?.classList.toggle("hidden", !hasTitle);
  taskEstimateInput?.classList.toggle("hidden", !hasTitle);
}

function setDisplayValue(displayEl, value, emptyLabel) {
  if (!displayEl) return;
  const v = normalizeText(value);
  const hasValue = Boolean(v);
  displayEl.textContent = hasValue ? v : emptyLabel;
  displayEl.classList.toggle("has-value", hasValue);
}

function collapseEditor({ displayEl, editorEl }) {
  displayEl?.classList.remove("hidden");
  editorEl?.classList.add("is-collapsed");
}

function expandEditor({ displayEl, editorEl }) {
  displayEl?.classList.add("hidden");
  editorEl?.classList.remove("is-collapsed");
}

function syncNewTaskRowEditors() {
  setDisplayValue(taskStatusDisplay, taskStatusInput?.value || "Не начато", "Выбрать статус");
  setDisplayValue(taskTypeDisplay, taskTypeInput?.value || "", "Указать тип");
  collapseEditor({ displayEl: taskStatusDisplay, editorEl: taskStatusInput });
  collapseEditor({ displayEl: taskTypeDisplay, editorEl: taskTypeInput });
}

taskStatusDisplay?.addEventListener("click", () => {
  expandEditor({ displayEl: taskStatusDisplay, editorEl: taskStatusInput });
  taskStatusInput?.focus();
});

taskStatusInput?.addEventListener("change", () => {
  setDisplayValue(taskStatusDisplay, taskStatusInput.value, "Выбрать статус");
});

taskStatusInput?.addEventListener("blur", () => {
  setDisplayValue(taskStatusDisplay, taskStatusInput.value, "Выбрать статус");
  collapseEditor({ displayEl: taskStatusDisplay, editorEl: taskStatusInput });
});

taskTypeDisplay?.addEventListener("click", () => {
  expandEditor({ displayEl: taskTypeDisplay, editorEl: taskTypeInput });
  taskTypeInput?.focus();
  taskTypeInput?.select();
});

taskTypeInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    taskTypeInput.blur();
  } else if (e.key === "Escape") {
    e.preventDefault();
    taskTypeInput.value = "";
    taskTypeInput.blur();
  }
});

taskTypeInput?.addEventListener("blur", () => {
  setDisplayValue(taskTypeDisplay, taskTypeInput.value, "Указать тип");
  collapseEditor({ displayEl: taskTypeDisplay, editorEl: taskTypeInput });
});

// Ensure initial state for add-row editors.
syncNewTaskRowEditors();
syncAddButtonVisibility();

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

tableBody.querySelectorAll(".date-trigger").forEach((trigger) => {
  trigger.textContent = formatDateRange(trigger.dataset.start, trigger.dataset.end);
});

// Initialize existing rows so editable columns render consistently.
(() => {
  if (!tableBody) return;
  const headers = Array.from(tableHead?.querySelectorAll("th") || []);
  const headerTitles = headers.map((th) => getCellText(th));

  const editable = new Set(["Статус", "Исполнитель", "Приоритет", "Тип задачи", "Описание", "Оценка"]);
  const rows = Array.from(tableBody.querySelectorAll("tr")).filter((r) => !r.classList.contains("new-task-row"));

  for (const row of rows) {
    const cells = Array.from(row.children);
    for (let i = 0; i < cells.length; i++) {
      const title = headerTitles[i];
      if (!editable.has(title)) continue;
      const td = cells[i];
      const value = getCellText(td);
      setCellValue(td, title, value);
    }
  }
})();

recomputeCounters();

tableBody.addEventListener("click", (event) => {
  const deleteBtn = event.target.closest(".delete-task-btn");
  if (deleteBtn) {
    const row = deleteBtn.closest("tr");
    if (row) {
      if (activeTrigger && row.contains(activeTrigger)) closePopover();
      row.remove();
      recomputeCounters();
    }
    return;
  }

  const trigger = event.target.closest(".date-trigger");
  if (!trigger) return;
  event.stopPropagation();
  openPopover(trigger);
});

// Inline editing for table columns (except task title and deadlines).
tableBody.addEventListener("click", (event) => {
  if (event.target.closest(".date-trigger")) return;
  if (event.target.closest(".delete-task-btn")) return;

  const td = event.target.closest("td");
  if (!td) return;
  const row = td.closest("tr");
  if (!row || row.classList.contains("new-task-row")) return;

  const colIndex = Array.from(row.children).indexOf(td);
  const headers = Array.from(tableHead?.querySelectorAll("th") || []);
  const columnTitle = getCellText(headers[colIndex]);
  startInlineEdit(td, columnTitle);
});

saveBtn.addEventListener("click", () => {
  if (!activeTrigger) return;
  activeTrigger.dataset.start = startInput.value;
  activeTrigger.dataset.end = endInput.value;
  activeTrigger.textContent = formatDateRange(startInput.value, endInput.value);
  closePopover();
  recomputeCounters();
});

closeBtn.addEventListener("click", closePopover);

addTaskBtn.addEventListener("click", () => {
  const title = taskNameInput.value.trim();
  if (!title) {
    taskNameInput.focus();
    syncAddButtonVisibility();
    return;
  }

  const selectedStatus = normalizeText(taskStatusInput?.value || "") || "Не начато";
  const typedTaskType = normalizeText(taskTypeInput?.value || "");
  const typedAssignee = normalizeText(taskAssigneeInput?.value || "");
  const selectedPriority = normalizeText(taskPriorityInput?.value || "");
  const typedDescription = normalizeText(taskDescriptionInput?.value || "");
  const selectedEstimate = normalizeText(taskEstimateInput?.value || "");
  const deadlineStart = taskDeadlineTrigger?.dataset?.start || "";
  const deadlineEnd = taskDeadlineTrigger?.dataset?.end || "";

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

  const statusCell = document.createElement("td");
  setCellValue(statusCell, "Статус", selectedStatus);
  row.appendChild(statusCell);

  const assigneeCell = document.createElement("td");
  setCellValue(assigneeCell, "Исполнитель", typedAssignee);
  row.appendChild(assigneeCell);

  const deadlineCell = document.createElement("td");
  const deadlineBtn = document.createElement("button");
  deadlineBtn.className = "date-trigger";
  deadlineBtn.type = "button";
  deadlineBtn.dataset.start = deadlineStart;
  deadlineBtn.dataset.end = deadlineEnd;
  deadlineBtn.textContent = formatDateRange(deadlineStart, deadlineEnd);
  deadlineCell.appendChild(deadlineBtn);
  row.appendChild(deadlineCell);

  const priorityCell = document.createElement("td");
  setCellValue(priorityCell, "Приоритет", selectedPriority);
  row.appendChild(priorityCell);

  const typeCell = document.createElement("td");
  setCellValue(typeCell, "Тип задачи", typedTaskType);
  row.appendChild(typeCell);

  const descriptionCell = document.createElement("td");
  setCellValue(descriptionCell, "Описание", typedDescription);
  row.appendChild(descriptionCell);

  const estimateCell = document.createElement("td");
  setCellValue(estimateCell, "Оценка", selectedEstimate);
  row.appendChild(estimateCell);

  const insertBeforeNode = tableBody.querySelector(".new-task-row");
  tableBody.insertBefore(row, insertBeforeNode || null);

  recomputeCounters();

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

taskNameInput.addEventListener("input", syncAddButtonVisibility);
