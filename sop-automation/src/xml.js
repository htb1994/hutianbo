export function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function p(value) {
  return `<p>${escapeXml(value)}</p>`;
}

export function li(value) {
  return `<li>${escapeXml(value)}</li>`;
}
