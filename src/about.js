import { escapeHtml } from "./ds.js";
import { parseEmails, publicNav } from "./site.js";

function timelineHtml(items) {
  if (!items.length) return '<div class="empty">还没有填写。</div>';
  return items
    .map(
      (item) => `
      <article class="timeline-item">
        <p class="timeline-period">${escapeHtml(item.period || "")}</p>
        <h3>${escapeHtml(item.title || "")}</h3>
        ${item.org ? `<p class="timeline-org">${escapeHtml(item.org)}</p>` : ""}
        <p>${escapeHtml(item.body || "")}</p>
      </article>`
    )
    .join("");
}

try {
  const [site, about] = await Promise.all([
    fetch("/api/site").then((res) => res.json()),
    fetch("/api/about").then((res) => res.json()),
  ]);
  const name = site.name || "红方块";
  const emails = parseEmails(site.email);
  document.title = `关于我 · ${name}`;
  document.getElementById("brand-name").textContent = name;
  document.getElementById("site-nav").innerHTML = publicNav({ about: true });
  document.getElementById("hero-role").textContent = site.title || "B 端产品设计师";
  document.getElementById("hero-intro").textContent = site.intro || "";
  document.getElementById("portrait").innerHTML = site.portrait
    ? `<img src="${escapeHtml(site.portrait)}" alt="${escapeHtml(name)}" />`
    : `<span>${escapeHtml(name.slice(0, 1))}</span>`;
  document.getElementById("jobs").innerHTML = timelineHtml(about.jobs || []);
  document.getElementById("practice").innerHTML = timelineHtml(about.practice || []);
  document.getElementById("contact-location").textContent = about.location || "欢迎邮件或电话联系。";
  const phone = String(about.phone || "").trim();
  const contacts = [
    ...emails.map(
      (email) => `<a class="talk-mail contact-mail" href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`
    ),
    ...(phone
      ? [`<a class="talk-mail contact-mail" href="tel:${escapeHtml(phone.replace(/\s+/g, ""))}">${escapeHtml(phone)}</a>`]
      : []),
  ];
  document.getElementById("contact-list").innerHTML = contacts.length
    ? contacts.join("")
    : '<p class="folio-lead">联系方式还没填写。</p>';
  const mailEl = document.getElementById("connect-mail");
  if (emails[0]) {
    mailEl.href = `mailto:${emails[0]}`;
    mailEl.textContent = emails[0];
  } else {
    mailEl.href = "/admin.html";
    mailEl.textContent = "填写邮箱";
  }
} catch {
  document.getElementById("jobs").innerHTML = '<div class="empty">暂时无法读取。</div>';
}
