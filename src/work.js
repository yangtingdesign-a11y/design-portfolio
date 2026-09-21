import { api, dsTag, escapeHtml, bindDsControls } from "./ds.js";
import { categoryLabel } from "./categories.js";

const root = document.getElementById("work-root");
const params = new URLSearchParams(location.search);
const id = params.get("id") || "";
const token = params.get("token") || "";

function renderBlocked() {
  root.innerHTML = `
    <div class="blocked">
      <h1 class="detail-title">作品未开放或链接已失效</h1>
      <p class="lede">请向创建者重新获取链接。此页不会展示未授权的作品信息。</p>
    </div>`;
}

try {
  if (!id) {
    renderBlocked();
  } else {
    const query = token ? `?token=${encodeURIComponent(token)}` : "";
    const work = await api(`/api/works/${encodeURIComponent(id)}${query}`);
    document.title = work.title;
    const images = (work.images || [])
      .map((src) => `<img src="${escapeHtml(src)}" alt="" />`)
      .join("");
    root.innerHTML = `
      <article class="detail">
        <p class="section-kicker">${escapeHtml(categoryLabel(work.category))}</p>
        <h1 class="detail-title">${escapeHtml(work.title)}</h1>
        <p class="lede">${escapeHtml(work.summary)}</p>
        ${work.cover ? `<div class="detail-cover"><img src="${escapeHtml(work.cover)}" alt="${escapeHtml(work.title)}" /></div>` : ""}
        <div class="tag-row">${(work.tags || []).map((tag) => dsTag(tag, "gray")).join("")}</div>
        ${(work.sections || [])
          .map(
            (section) => `
          <section class="detail-section">
            <h2>${escapeHtml(section.heading || "")}</h2>
            <p>${escapeHtml(section.body || "")}</p>
          </section>`
          )
          .join("")}
        ${images ? `<div class="gallery">${images}</div>` : ""}
      </article>`;
  }
} catch {
  renderBlocked();
}

bindDsControls();
