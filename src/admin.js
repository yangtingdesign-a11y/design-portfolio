import { api, bindDsControls, dsButton, dsTag, escapeHtml } from "./ds.js";
import { CATEGORIES, categoryLabel, normalizeCategory } from "./categories.js";

const root = document.getElementById("admin-root");
const defaultSections = [
  { heading: "背景", body: "" },
  { heading: "问题", body: "" },
  { heading: "判断", body: "" },
  { heading: "方案", body: "" },
  { heading: "结果", body: "" },
];

let flash = "";
let editing = null;
let confirmId = "";
let loginBusy = false;

function input(name, value, placeholder = "") {
  return `<input class="ds-input" name="${name}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" data-ds-id="cmp-input-default-m" data-ds-component="Input" data-ds-variant="default" data-ds-size="m" data-ds-state="default" />`;
}

function formItem(label, control, layout = "vertical") {
  return `<div class="ds-form-item ${layout === "horizontal" ? "ds-form-item-horizontal" : ""}" data-ds-id="cmp-form-item-${layout}" data-ds-component="Form" data-ds-variant="${layout}">
    <label class="ds-label">${label}</label>
    ${control}
  </div>`;
}

function textareaControl(name, value) {
  return `<textarea class="ds-textarea" name="${name}" data-ds-component="Textarea" data-ds-variant="default" data-ds-state="default" data-ds-status="designer-review">${escapeHtml(value)}</textarea>`;
}

function modal({ id, size = "s", variant = "default", title, body, actions, formId = "", open = false }) {
  const sizeClass = size === "s" ? "ds-modal-s" : size === "l" || size === "xl" ? `ds-modal-${size}` : "";
  const dsId = variant === "confirm" ? "cmp-modal-confirm" : `cmp-modal-${size}`;
  const sizeAttr = variant === "confirm" ? "" : ` data-ds-size="${size}"`;
  const content = formId
    ? `<form id="${formId}" class="ds-form">${body}<div class="ds-modal-actions">${actions}</div></form>`
    : `${body}<div class="ds-modal-actions">${actions}</div>`;
  return `<div class="ds-modal-mask" id="${id}"${open ? "" : " hidden"}>
    <div class="ds-modal ${sizeClass}" data-ds-id="${dsId}" data-ds-component="Modal" data-ds-variant="${variant}"${sizeAttr}>
      <h3>${title}</h3>
      ${content}
    </div>
  </div>`;
}

function loginView() {
  root.innerHTML = `
    <div class="toolbar" aria-hidden="true">
      <h1 class="detail-title">作品管理</h1>
    </div>
    ${modal({
      id: "login-modal",
      size: "s",
      title: "创建者口令",
      formId: "login-form",
      open: true,
      body: `
        ${flash ? `<p class="flash">${escapeHtml(flash)}</p>` : ""}
        ${formItem(
          "密码",
          `<input class="ds-input" type="password" name="passphrase" autocomplete="current-password" placeholder="输入任意密码" data-ds-id="cmp-input-default-m" data-ds-component="Input" data-ds-variant="default" data-ds-size="m" data-ds-state="default" data-ds-status="designer-review" />`
        )}`,
      actions: dsButton({ label: "进入管理", type: "submit", attrs: 'data-action="login"' }),
    })}`;
  bindDsControls(root);
}

function editorView(work) {
  const cover = work.cover || "";
  const images = work.images || [];
  return `
    <div class="panel">
      <div class="toolbar">
        <h2>${work.id ? "编辑作品" : "发布作品"}</h2>
        ${dsButton({ label: "返回列表", variant: "text", attrs: 'data-action="cancel-edit"' })}
      </div>
      <form id="work-form" class="ds-form">
        ${formItem("标题", input("title", work.title || "", "作品标题"))}
        ${formItem(
          "分类",
          `<select class="ds-select" name="category" data-ds-id="cmp-select-default-m" data-ds-component="Select" data-ds-variant="default" data-ds-size="m" data-ds-state="default">
            ${CATEGORIES.map((item) => `<option value="${item.id}" ${normalizeCategory(work.category) === item.id ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}
          </select>`
        )}
        ${formItem("摘要", textareaControl("summary", work.summary || ""))}
        ${formItem("标签", input("tags", (work.tags || []).join("，"), "用逗号分隔"))}
        ${formItem(
          "封面",
          `<div>
            <input type="hidden" name="cover" value="${escapeHtml(cover)}" />
            <div class="thumb-row" data-cover>${cover ? `<img src="${escapeHtml(cover)}" alt="" />` : ""}</div>
            ${dsButton({ label: "上传封面", variant: "outline", attrs: 'data-action="upload-cover"' })}
          </div>`
        )}
        ${(work.sections || defaultSections)
          .map(
            (section, index) => `
          ${formItem(
            section.heading || `段落 ${index + 1}`,
            `<input type="hidden" name="section-heading-${index}" value="${escapeHtml(section.heading || "")}" />
             ${textareaControl(`section-body-${index}`, section.body || "")}`
          )}`
          )
          .join("")}
        ${formItem(
          "图片",
          `<div>
            <div class="thumb-row" data-images>${images.map((src) => `<img src="${escapeHtml(src)}" alt="" data-src="${escapeHtml(src)}" />`).join("")}</div>
            ${dsButton({ label: "添加图片", variant: "dashed", attrs: 'data-action="upload-images"' })}
          </div>`
        )}
        ${dsButton({ label: "保存", type: "submit" })}
      </form>
      <input id="file-input" type="file" accept="image/*" hidden />
    </div>`;
}

function experienceFields(prefix, items, count = 4) {
  const rows = [...(items || [])];
  while (rows.length < count) rows.push({});
  return rows
    .slice(0, count)
    .map(
      (item, index) => `
      <div class="experience-slot">
        ${formItem("时间", input(`${prefix}-period-${index}`, item.period || "", "2006 — 今"))}
        ${formItem("标题", input(`${prefix}-title-${index}`, item.title || ""))}
        ${formItem("机构 / 方向", input(`${prefix}-org-${index}`, item.org || ""))}
        ${formItem("说明", textareaControl(`${prefix}-body-${index}`, item.body || ""))}
      </div>`
    )
    .join("");
}

function readExperience(form, prefix, count = 4) {
  const items = [];
  for (let index = 0; index < count; index += 1) {
    items.push({
      period: String(form.get(`${prefix}-period-${index}`) || "").trim(),
      title: String(form.get(`${prefix}-title-${index}`) || "").trim(),
      org: String(form.get(`${prefix}-org-${index}`) || "").trim(),
      body: String(form.get(`${prefix}-body-${index}`) || "").trim(),
    });
  }
  return items.filter((item) => item.period || item.title || item.body);
}

function dashboardView(site, works, about = { jobs: [], practice: [], location: "", phone: "" }) {
  root.innerHTML = `
    <div class="toolbar">
      <h1 class="detail-title">作品管理</h1>
      <div class="work-admin-actions">
        ${dsButton({ label: "发布作品", attrs: 'data-action="new-work"' })}
        ${dsButton({ label: "退出", variant: "text", attrs: 'data-action="logout"' })}
      </div>
    </div>
    ${flash ? `<p class="flash">${escapeHtml(flash)}</p>` : ""}
    <div class="panel">
      <div class="toolbar">
        <h2>资料</h2>
        <div class="work-admin-actions">
          ${dsButton({ label: "站点信息", variant: "outline", attrs: 'data-action="open-site"' })}
          ${dsButton({ label: "关于我", variant: "outline", attrs: 'data-action="open-about"' })}
        </div>
      </div>
    </div>
    <div class="panel">
      <h2>全部作品</h2>
      ${
        works.length
          ? works
              .map(
                (work) => `
        <div class="work-admin-item" data-id="${escapeHtml(work.id)}">
          <div>
            <strong>${escapeHtml(work.title)}</strong>
            <div class="tag-row">
              ${dsTag(categoryLabel(work.category), "primary")}
              ${(work.tags || []).map((tag) => dsTag(tag, "gray")).join("")}
            </div>
            <p class="muted">${escapeHtml(work.summary)}</p>
          </div>
          <div class="work-admin-actions">
            ${dsButton({ label: "编辑", variant: "outline", size: "s", attrs: 'data-action="edit"' })}
            ${dsButton({ label: "长期链接", variant: "secondary", size: "s", attrs: 'data-action="share-permanent"' })}
            ${dsButton({ label: "2小时链接", variant: "secondary", size: "s", attrs: 'data-action="share-ttl"' })}
            ${dsButton({ label: "删除", variant: "text", size: "s", attrs: 'data-action="delete"' })}
          </div>
        </div>`
              )
              .join("")
          : '<p class="muted">还没有作品。点击「发布作品」开始。</p>'
      }
    </div>
    ${modal({
      id: "site-modal",
      size: "l",
      title: "站点信息",
      formId: "site-form",
      body: `
        ${formItem("品牌", input("name", site.name || ""), "horizontal")}
        ${formItem("头衔", input("title", site.title || ""), "horizontal")}
        ${formItem("邮箱", input("email", site.email || "", "多个邮箱用逗号分隔"), "horizontal")}
        ${formItem("介绍", textareaControl("intro", site.intro || ""))}
        ${formItem(
          "封面照",
          `<div>
            <input type="hidden" name="portrait" value="${escapeHtml(site.portrait || "")}" />
            <div class="thumb-row" data-portrait>${site.portrait ? `<img src="${escapeHtml(site.portrait)}" alt="" />` : ""}</div>
            ${dsButton({ label: "上传封面照", variant: "outline", size: "s", attrs: 'data-action="upload-portrait"' })}
          </div>`
        )}`,
      actions:
        dsButton({ label: "保存", type: "submit" }) +
        dsButton({ label: "取消", variant: "text", attrs: 'data-action="close-site"' }),
    })}
    ${modal({
      id: "about-modal",
      size: "xl",
      title: "关于我",
      formId: "about-form",
      body: `
        <h3 class="panel-sub">联系方式</h3>
        ${formItem("所在地", input("location", about.location || "", "城市"), "horizontal")}
        ${formItem("电话", input("phone", about.phone || "", "手机或座机"), "horizontal")}
        <h3 class="panel-sub">工作经历</h3>
        ${experienceFields("job", about.jobs)}
        <h3 class="panel-sub">作品经历</h3>
        ${experienceFields("practice", about.practice)}`,
      actions:
        dsButton({ label: "保存", type: "submit" }) +
        dsButton({ label: "取消", variant: "text", attrs: 'data-action="close-about"' }),
    })}
    ${modal({
      id: "share-modal",
      size: "m",
      title: "分享链接",
      body: '<p class="muted" id="share-note"></p><div class="share-box" id="share-url"></div>',
      actions:
        dsButton({ label: "复制链接", variant: "primary", attrs: 'data-action="copy-share"' }) +
        dsButton({ label: "关闭", variant: "text", attrs: 'data-action="close-share"' }),
    })}
    ${modal({
      id: "confirm-modal",
      size: "s",
      variant: "confirm",
      title: "删除作品",
      body: "<p class=\"muted\">删除后无法恢复，分享链接也会失效。</p>",
      actions:
        dsButton({ label: "删除", variant: "primary", attrs: 'data-action="confirm-delete"' }) +
        dsButton({ label: "取消", variant: "text", attrs: 'data-action="cancel-delete"' }),
    })}
    <input id="file-input" type="file" accept="image/*" hidden />`;
  bindDsControls(root);
}

async function uploadFile() {
  const inputEl = document.getElementById("file-input");
  return new Promise((resolve) => {
    inputEl.onchange = async () => {
      const file = inputEl.files?.[0];
      inputEl.value = "";
      if (!file) {
        resolve("");
        return;
      }
      const body = new FormData();
      body.append("file", file);
      const result = await api("/api/admin/upload", { method: "POST", body });
      resolve(result.url);
    };
    inputEl.click();
  });
}

function readWorkForm(form, current) {
  const data = new FormData(form);
  const sections = (current.sections || defaultSections).map((section, index) => ({
    heading: String(data.get(`section-heading-${index}`) || section.heading || ""),
    body: String(data.get(`section-body-${index}`) || ""),
  }));
  const images = [...form.querySelectorAll("[data-images] img")].map((img) => img.getAttribute("data-src") || img.src);
  return {
    title: String(data.get("title") || ""),
    summary: String(data.get("summary") || ""),
    tags: String(data.get("tags") || "")
      .split(/[,，]/)
      .map((item) => item.trim())
      .filter(Boolean),
    cover: String(data.get("cover") || ""),
    sections,
    images,
    category: normalizeCategory(data.get("category")),
    open: true,
  };
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function share(id, type) {
  const result = await api(`/api/admin/works/${id}/share`, {
    method: "POST",
    body: JSON.stringify({ type }),
  });
  const url = `${location.origin}${result.url}`;
  const modalEl = document.getElementById("share-modal");
  document.getElementById("share-url").textContent = url;
  document.getElementById("share-note").textContent =
    type === "ttl" ? "2 小时后失效。对方打开此链接即可看作品，不能管理。" : "长期有效，直到你删除作品。对方不能管理。";
  modalEl.hidden = false;
  modalEl.dataset.url = url;
}

async function renderDashboard() {
  const [site, admin, about] = await Promise.all([
    api("/api/site"),
    api("/api/admin/works"),
    api("/api/about"),
  ]);
  dashboardView(site, admin.works, about);
}

async function submitLogin(form) {
  if (loginBusy) return;
  loginBusy = true;
  try {
    const passphrase = form?.passphrase?.value ?? "";
    await api("/api/auth/login", { method: "POST", body: JSON.stringify({ passphrase }) });
    flash = "";
    await render();
  } finally {
    loginBusy = false;
  }
}

async function render() {
  const me = await api("/api/auth/me");
  if (!me.admin) {
    loginView();
    return;
  }
  if (editing) {
    root.innerHTML = editorView(editing);
    bindDsControls(root);
    return;
  }
  await renderDashboard();
}

root.addEventListener("click", async (event) => {
  const actionEl = event.target.closest("[data-action]");
  if (!actionEl) return;
  const action = actionEl.dataset.action;
  const item = event.target.closest("[data-id]");
  const id = item?.dataset.id;

  if (action === "login") {
    event.preventDefault();
    try {
      await submitLogin(document.getElementById("login-form"));
    } catch {
      flash = "暂时无法进入，请再试一次";
      loginView();
    }
    return;
  }
  if (action === "logout") {
    await api("/api/auth/logout", { method: "POST", body: "{}" });
    editing = null;
    await render();
    return;
  }
  if (action === "new-work") {
    editing = { title: "", summary: "", category: "product", tags: [], cover: "", sections: defaultSections, images: [], open: true };
    await render();
    return;
  }
  if (action === "cancel-edit") {
    editing = null;
    await render();
    return;
  }
  if (action === "edit") {
    const { works } = await api("/api/admin/works");
    editing = works.find((work) => work.id === id);
    await render();
    return;
  }
  if (action === "set-open" && id) {
    const open = actionEl.getAttribute("data-ds-state") !== "on";
    await api(`/api/admin/works/${id}`, { method: "PUT", body: JSON.stringify({ open }) });
    flash = open ? "作品已在首页打开" : "作品已关闭，首页不再展示";
    await renderDashboard();
    return;
  }
  if (action === "share-permanent" && id) {
    await share(id, "permanent");
    return;
  }
  if (action === "share-ttl" && id) {
    await share(id, "ttl");
    return;
  }
  if (action === "copy-share") {
    const url = document.getElementById("share-modal").dataset.url || "";
    const ok = await copyText(url);
    flash = ok ? "链接已复制" : url;
    document.getElementById("share-note").textContent = ok ? "已复制到剪贴板。" : "请手动复制下面的链接。";
    return;
  }
  if (action === "open-site") {
    document.getElementById("site-modal").hidden = false;
    return;
  }
  if (action === "close-site") {
    document.getElementById("site-modal").hidden = true;
    return;
  }
  if (action === "open-about") {
    document.getElementById("about-modal").hidden = false;
    return;
  }
  if (action === "close-about") {
    document.getElementById("about-modal").hidden = true;
    return;
  }
  if (action === "close-share") {
    document.getElementById("share-modal").hidden = true;
    return;
  }
  if (action === "delete" && id) {
    confirmId = id;
    document.getElementById("confirm-modal").hidden = false;
    return;
  }
  if (action === "cancel-delete") {
    confirmId = "";
    document.getElementById("confirm-modal").hidden = true;
    return;
  }
  if (action === "confirm-delete" && confirmId) {
    await api(`/api/admin/works/${confirmId}`, { method: "DELETE" });
    confirmId = "";
    flash = "作品已删除";
    await renderDashboard();
    return;
  }
  if (action === "toggle-open") {
    const on = actionEl.getAttribute("data-ds-state") !== "on";
    actionEl.setAttribute("data-ds-state", on ? "on" : "off");
    return;
  }
  if (action === "upload-portrait") {
    const url = await uploadFile();
    if (!url) return;
    const form = document.getElementById("site-form");
    form.querySelector('[name="portrait"]').value = url;
    form.querySelector("[data-portrait]").innerHTML = `<img src="${url}" alt="" />`;
    return;
  }
  if (action === "upload-cover") {
    const url = await uploadFile();
    if (!url) return;
    const form = document.getElementById("work-form");
    form.querySelector('[name="cover"]').value = url;
    form.querySelector("[data-cover]").innerHTML = `<img src="${url}" alt="" />`;
    return;
  }
  if (action === "upload-images") {
    const url = await uploadFile();
    if (!url) return;
    const box = document.querySelector("[data-images]");
    box.insertAdjacentHTML("beforeend", `<img src="${url}" alt="" data-src="${url}" />`);
  }
});

root.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (event.target.id === "login-form") {
    try {
      await submitLogin(event.target);
    } catch {
      flash = "暂时无法进入，请再试一次";
      loginView();
    }
    return;
  }
  if (event.target.id === "site-form") {
    const data = Object.fromEntries(new FormData(event.target).entries());
    await api("/api/site", { method: "PUT", body: JSON.stringify(data) });
    flash = "站点信息已保存";
    await renderDashboard();
    return;
  }
  if (event.target.id === "about-form") {
    const form = new FormData(event.target);
    await api("/api/about", {
      method: "PUT",
      body: JSON.stringify({
        location: String(form.get("location") || ""),
        phone: String(form.get("phone") || ""),
        jobs: readExperience(form, "job"),
        practice: readExperience(form, "practice"),
      }),
    });
    flash = "关于我已保存";
    await renderDashboard();
    return;
  }
  if (event.target.id === "work-form") {
    const payload = readWorkForm(event.target, editing);
    if (editing.id) {
      await api(`/api/admin/works/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
    } else {
      await api("/api/admin/works", { method: "POST", body: JSON.stringify(payload) });
    }
    editing = null;
    flash = "作品已保存";
    await render();
  }
});

render();
