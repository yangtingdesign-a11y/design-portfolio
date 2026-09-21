export function parseEmails(raw) {
  return String(raw || "")
    .split(/[,;:：\s]+/)
    .map((item) => item.trim())
    .filter((item) => item.includes("@"));
}

export function publicNav({ about = false, works = false } = {}) {
  return `
    <a href="/about.html"${about ? ' class="is-current"' : ""}>关于</a>
    <a href="/#works">全部</a>
    <a href="/#works"${works ? ' class="is-current"' : ""}>作品</a>
    <a href="/#services">服务</a>
  `;
}
