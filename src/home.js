import { escapeHtml, bindDsControls } from "./ds.js";
import { CATEGORIES, categoryLabel, normalizeCategory } from "./categories.js";
import { parseEmails, publicNav } from "./site.js";

const listEl = document.getElementById("work-list");
const filterEl = document.getElementById("filter-bar");
let allWorks = [];
let current = "all";

function workCard(work) {
  const href = `/work.html?id=${encodeURIComponent(work.id)}`;
  const cover = work.cover
    ? `<img src="${escapeHtml(work.cover)}" alt="${escapeHtml(work.title)}" />`
    : `<span class="tile-placeholder">${escapeHtml(categoryLabel(work.category))}</span>`;
  return `
    <a class="feature-card" href="${href}" data-ds-status="designer-review">
      <div class="feature-media">${cover}</div>
      <div class="feature-meta">
        <strong>${escapeHtml(work.title)}</strong>
        <span>${escapeHtml(CATEGORIES.find((item) => item.id === normalizeCategory(work.category))?.en || "Product Design")}</span>
      </div>
    </a>`;
}

function renderNav() {
  document.getElementById("site-nav").innerHTML = publicNav({ works: true });
}

function renderFilters() {
  const items = [{ id: "all", label: "全部", en: "ALL" }, ...CATEGORIES];
  filterEl.innerHTML = items
    .map((item) => {
      const checked = current === item.id;
      return `<button type="button" class="ds-radio-btn filter-pill" data-filter="${item.id}" data-ds-id="cmp-radio-button-m" data-ds-component="Radio" data-ds-variant="button" data-ds-size="m" data-ds-state="${checked ? "checked" : "unchecked"}">${escapeHtml(item.en || item.label)}</button>`;
    })
    .join("");
}

function renderWorks() {
  const filtered =
    current === "all" ? allWorks : allWorks.filter((work) => normalizeCategory(work.category) === current);
  listEl.innerHTML = filtered.length
    ? filtered.map(workCard).join("")
    : '<div class="empty">这个分类还没有作品。</div>';
}

function renderServices() {
  document.getElementById("capability-row").innerHTML = CATEGORIES.map((item) => {
    const active = current === item.id;
    return `
      <button type="button" class="service-capsule${active ? " is-on" : ""}" data-filter="${item.id}" data-ds-id="cmp-radio-button-l" data-ds-component="Radio" data-ds-variant="button" data-ds-size="l" data-ds-state="${active ? "checked" : "unchecked"}">
        <strong>${escapeHtml(item.en)}</strong>
        <span>${escapeHtml(item.label)}</span>
      </button>`;
  }).join("");
}

function setFilter(id) {
  current = id;
  renderNav();
  renderFilters();
  renderWorks();
  renderServices();
}

filterEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  setFilter(button.dataset.filter);
});

document.getElementById("site-nav").addEventListener("click", (event) => {
  const link = event.target.closest("[data-nav-filter]");
  if (!link) return;
  setFilter(link.dataset.navFilter);
});

document.getElementById("capability-row").addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  setFilter(button.dataset.filter);
  document.getElementById("works").scrollIntoView({ behavior: "smooth" });
});

function renderExperience(about) {
  const slot = document.getElementById("experience-preview");
  const items = [...(about.jobs || []), ...(about.practice || [])].slice(0, 3);
  if (!items.length) {
    slot.innerHTML = '<p class="folio-lead">经历写在关于页。</p>';
    return;
  }
  slot.innerHTML = items
    .map(
      (item) => `
      <article class="experience-row">
        <div>
          <h3>${escapeHtml(item.title || "")}</h3>
          <p>${escapeHtml(item.org || item.body || "")}</p>
        </div>
        <span>${escapeHtml(item.period || "")}</span>
      </article>`
    )
    .join("");
}

try {
  const [site, { works }, about] = await Promise.all([
    fetch("/api/site").then((res) => res.json()),
    fetch("/api/works").then((res) => res.json()),
    fetch("/api/about").then((res) => res.json()),
  ]);
  const name = site.name || "红方块";
  document.getElementById("brand-name").textContent = name;
  const nameEl = document.getElementById("hero-name");
  if (name.length >= 2) {
    nameEl.innerHTML = `<span>${escapeHtml(name.slice(0, 1))}</span><span class="hero-name-rest">${escapeHtml(name.slice(1))}</span>`;
  } else {
    nameEl.textContent = name;
  }
  document.getElementById("hero-role").textContent = site.title || "B 端产品设计师";
  document.title = `${name} · ${site.title || "作品档案"}`;
  document.getElementById("hero-intro").textContent =
    site.intro || "主业是 B 端产品设计，同时做 Logo、视频、插画、绘画和 AI。";
  const portrait = site.portrait || works.find((work) => work.cover)?.cover || "";
  document.getElementById("portrait").innerHTML = portrait
    ? `<img src="${escapeHtml(portrait)}" alt="${escapeHtml(name)}" />`
    : `<span>${escapeHtml(name.slice(0, 1))}</span>`;
  const emails = parseEmails(site.email);
  const mailEl = document.getElementById("connect-mail");
  if (emails[0]) {
    mailEl.href = `mailto:${emails[0]}`;
    mailEl.textContent = emails[0];
  } else {
    mailEl.href = "/admin.html";
    mailEl.textContent = "填写邮箱";
  }
  allWorks = works;
  renderNav();
  renderFilters();
  renderWorks();
  renderServices();
  renderExperience(about);
  bindDsControls();
} catch {
  listEl.innerHTML = '<div class="empty">暂时无法读取作品，请稍后重试。</div>';
}
