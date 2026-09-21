import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { existsSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import express from "express";
import cookieParser from "cookie-parser";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnv() {
  const envPath = path.join(root, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index);
    const value = trimmed.slice(index + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();
const dataDir = path.join(root, "data");
const uploadsDir = path.join(dataDir, "uploads");
const sitePath = path.join(dataDir, "site.json");
const aboutPath = path.join(dataDir, "about.json");
const worksPath = path.join(dataDir, "works.json");
const isProd = process.env.NODE_ENV === "production";
const PORT = Number(process.env.PORT || 8787);
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-session-secret-change-me";
const COOKIE = "portfolio_admin";
const TWO_HOURS = 2 * 60 * 60 * 1000;

await fs.mkdir(uploadsDir, { recursive: true });

function signSession(exp) {
  const payload = `ok.${exp}`;
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

function readSession(token) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [ok, exp, sig] = parts;
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(`${ok}.${exp}`).digest("hex");
  if (ok !== "ok" || sig !== expected) return false;
  return Number(exp) > Date.now();
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJson(file, data) {
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, file);
}

async function getSite() {
  return readJson(sitePath, { name: "", title: "", intro: "", email: "" });
}

async function getAbout() {
  const data = await readJson(aboutPath, { jobs: [], practice: [], location: "" });
  if (!Array.isArray(data.jobs)) data.jobs = [];
  if (!Array.isArray(data.practice)) data.practice = [];
  data.location = data.location || "";
  data.phone = data.phone || "";
  return data;
}

function cleanEntries(list) {
  return (Array.isArray(list) ? list : [])
    .map((item) => ({
      period: String(item?.period || "").trim(),
      title: String(item?.title || "").trim(),
      org: String(item?.org || "").trim(),
      body: String(item?.body || "").trim(),
    }))
    .filter((item) => item.period || item.title || item.body);
}

async function getWorksFile() {
  const data = await readJson(worksPath, { works: [] });
  if (!Array.isArray(data.works)) data.works = [];
  return data;
}

function publicSite(site) {
  return {
    name: site.name || "",
    title: site.title || "",
    intro: site.intro || "",
    email: site.email || "",
    portrait: site.portrait || "",
  };
}

function listItem(work) {
  return {
    id: work.id,
    title: work.title,
    summary: work.summary,
    category: work.category || "product",
    tags: work.tags || [],
    cover: work.cover || "",
    updatedAt: work.updatedAt,
  };
}

function fullWork(work) {
  return {
    ...listItem(work),
    sections: work.sections || [],
    images: work.images || [],
    open: Boolean(work.open),
  };
}

function validToken(work, token) {
  if (!token) return false;
  const found = (work.shareTokens || []).find((item) => item.token === token);
  if (!found) return false;
  if (found.type === "permanent") return true;
  return Number(found.expiresAt) > Date.now();
}

function slugify(title) {
  const base = String(title || "work")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return `${base || "work"}-${crypto.randomBytes(3).toString("hex")}`;
}

function requireAdmin(req, res, next) {
  if (!readSession(req.cookies[COOKIE])) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      const safe = [".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext) ? ext : ".png";
      cb(null, `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${safe}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, /^image\//.test(file.mimetype));
  },
});

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(uploadsDir));

app.get("/api/site", async (_req, res) => {
  res.json(publicSite(await getSite()));
});

app.get("/api/works", async (_req, res) => {
  const { works } = await getWorksFile();
  res.json({ works: works.map(listItem) });
});

app.get("/api/works/:id", async (req, res) => {
  const { works } = await getWorksFile();
  const work = works.find((item) => item.id === req.params.id);
  if (!work) {
    res.status(404).json({ error: "unavailable" });
    return;
  }
  res.json(fullWork(work));
});

app.post("/api/auth/login", (_req, res) => {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  res.cookie(COOKIE, signSession(exp), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ ok: true });
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie(COOKIE, { path: "/" });
  res.json({ ok: true });
});

app.get("/api/auth/me", (req, res) => {
  res.json({ admin: readSession(req.cookies[COOKIE]) });
});

app.get("/api/about", async (_req, res) => {
  res.json(await getAbout());
});

app.put("/api/about", requireAdmin, async (req, res) => {
  const next = {
    jobs: cleanEntries(req.body?.jobs),
    practice: cleanEntries(req.body?.practice),
    location: String(req.body?.location || ""),
    phone: String(req.body?.phone || ""),
  };
  await writeJson(aboutPath, next);
  res.json(next);
});

app.put("/api/site", requireAdmin, async (req, res) => {
  const current = await getSite();
  const next = {
    name: String(req.body?.name ?? current.name ?? ""),
    title: String(req.body?.title ?? current.title ?? ""),
    intro: String(req.body?.intro ?? current.intro ?? ""),
    email: String(req.body?.email ?? current.email ?? ""),
    portrait: String(req.body?.portrait ?? current.portrait ?? ""),
  };
  await writeJson(sitePath, next);
  res.json(next);
});

app.get("/api/admin/works", requireAdmin, async (_req, res) => {
  const { works } = await getWorksFile();
  res.json({
    works: works.map((work) => ({
      ...fullWork(work),
      shareTokens: (work.shareTokens || []).map((item) => ({
        token: item.token,
        type: item.type,
        expiresAt: item.expiresAt || null,
        createdAt: item.createdAt,
      })),
    })),
  });
});

app.post("/api/admin/works", requireAdmin, async (req, res) => {
  const data = await getWorksFile();
  const now = new Date().toISOString();
  const work = {
    id: slugify(req.body?.title),
    title: String(req.body?.title || "未命名作品"),
    summary: String(req.body?.summary || ""),
    category: String(req.body?.category || "product"),
    tags: Array.isArray(req.body?.tags) ? req.body.tags.map(String).filter(Boolean) : [],
    cover: String(req.body?.cover || ""),
    sections: Array.isArray(req.body?.sections) ? req.body.sections : [],
    images: Array.isArray(req.body?.images) ? req.body.images : [],
    open: true,
    createdAt: now,
    updatedAt: now,
    shareTokens: [],
  };
  data.works.unshift(work);
  await writeJson(worksPath, data);
  res.json(work);
});

app.put("/api/admin/works/:id", requireAdmin, async (req, res) => {
  const data = await getWorksFile();
  const work = data.works.find((item) => item.id === req.params.id);
  if (!work) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  work.title = String(req.body?.title ?? work.title);
  work.summary = String(req.body?.summary ?? work.summary);
  if (req.body?.category !== undefined) work.category = String(req.body.category || "product");
  if (Array.isArray(req.body?.tags)) work.tags = req.body.tags.map(String).filter(Boolean);
  if (req.body?.cover !== undefined) work.cover = String(req.body.cover || "");
  if (Array.isArray(req.body?.sections)) work.sections = req.body.sections;
  if (Array.isArray(req.body?.images)) work.images = req.body.images;
  if (req.body?.open !== undefined) work.open = Boolean(req.body.open);
  work.updatedAt = new Date().toISOString();
  await writeJson(worksPath, data);
  res.json(work);
});

app.delete("/api/admin/works/:id", requireAdmin, async (req, res) => {
  const data = await getWorksFile();
  const work = data.works.find((item) => item.id === req.params.id);
  data.works = data.works.filter((item) => item.id !== req.params.id);
  await writeJson(worksPath, data);
  const files = [work?.cover, ...(work?.images || [])].filter(Boolean);
  for (const file of files) {
    if (String(file).startsWith("/uploads/")) {
      const abs = path.join(uploadsDir, path.basename(file));
      if (existsSync(abs)) await fs.unlink(abs).catch(() => {});
    }
  }
  res.json({ ok: true });
});

app.post("/api/admin/works/:id/share", requireAdmin, async (req, res) => {
  const data = await getWorksFile();
  const work = data.works.find((item) => item.id === req.params.id);
  if (!work) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const type = req.body?.type === "ttl" ? "ttl" : "permanent";
  const token = crypto.randomBytes(16).toString("hex");
  const item = {
    token,
    type,
    createdAt: new Date().toISOString(),
    expiresAt: type === "ttl" ? Date.now() + TWO_HOURS : null,
  };
  work.shareTokens = work.shareTokens || [];
  work.shareTokens.push(item);
  await writeJson(worksPath, data);
  res.json({
    ...item,
    url: `/work.html?id=${encodeURIComponent(work.id)}&token=${token}`,
  });
});

app.post("/api/admin/upload", requireAdmin, upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "no_file" });
    return;
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

async function start() {
  if (!isProd) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      root,
      appType: "mpa",
      server: { middlewareMode: true },
    });
    app.use(vite.middlewares);
  } else {
    const dist = path.join(root, "dist");
    app.use(express.static(dist));
    app.get(["/work", "/admin", "/about"], (_req, res) => {
      const map = { "/admin": "admin.html", "/work": "work.html", "/about": "about.html" };
      res.sendFile(path.join(dist, map[_req.path]));
    });
  }

  app.listen(PORT, () => {
    console.log(`Portfolio running at http://localhost:${PORT}`);
    console.log("Admin login accepts any password");
  });
}

start();
