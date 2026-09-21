export function bindDsControls(root = document) {
  root.querySelectorAll('[data-ds-component="Button"]').forEach((el) => {
    if (el.dataset.dsBound) return;
    el.dataset.dsBound = "1";
    const set = (state) => {
      if (el.disabled) {
        el.setAttribute("data-ds-state", "disabled");
        return;
      }
      el.setAttribute("data-ds-state", state);
    };
    el.addEventListener("mouseenter", () => set("hover"));
    el.addEventListener("mouseleave", () => set("default"));
    el.addEventListener("mousedown", () => set("active"));
    el.addEventListener("mouseup", () => set("hover"));
    el.addEventListener("focus", () => set("focus"));
    el.addEventListener("blur", () => set("default"));
  });

  root.querySelectorAll('[data-ds-component="Input"]').forEach((el) => {
    if (el.dataset.dsBound) return;
    el.dataset.dsBound = "1";
    el.addEventListener("mouseenter", () => {
      if (document.activeElement !== el) el.setAttribute("data-ds-state", "hover");
    });
    el.addEventListener("mouseleave", () => {
      if (document.activeElement !== el) el.setAttribute("data-ds-state", "default");
    });
    el.addEventListener("focus", () => el.setAttribute("data-ds-state", "focus"));
    el.addEventListener("blur", () => el.setAttribute("data-ds-state", "default"));
  });
}

export function dsButton({
  label,
  variant = "primary",
  size = "m",
  type = "button",
  extraClass = "",
  attrs = "",
}) {
  return `<button type="${type}" class="ds-btn ds-btn-${variant} ds-btn-${size} ${extraClass}" data-ds-id="cmp-button-${variant}-${size}" data-ds-component="Button" data-ds-variant="${variant}" data-ds-size="${size}" data-ds-state="default" ${attrs}>${label}</button>`;
}

export function dsTag(label, color = "gray") {
  return `<span class="ds-tag ds-tag-${color}" data-ds-id="cmp-tag-${color}" data-ds-component="Tag" data-ds-variant="${color}" data-ds-size="default">${escapeHtml(label)}</span>`;
}

export function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: "same-origin",
    headers: options.body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || "request_failed");
    error.status = res.status;
    throw error;
  }
  return data;
}
