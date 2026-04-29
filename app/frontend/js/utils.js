export function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function parseIsoDate(value) {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  const [year, month, day] = normalized
    .split("-")
    .map((part) => Number.parseInt(part, 10));
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function formatDate(isoDate) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${month}/${day}/${year}`;
}

export function formatDateRange(startDate, endDate) {
  const startFormatted = formatDate(startDate);
  const endFormatted = formatDate(endDate);
  if (startFormatted && endFormatted) return `${startFormatted} - ${endFormatted}`;
  return endFormatted || startFormatted || "Указать дедлайн";
}
