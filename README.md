# 私人作品档案

本地预览：

```bash
npm install
npm run dev
```

浏览器打开 http://localhost:8787

进入 `/admin.html` 会弹出创建者口令窗，输入任意密码即可进入管理。

部署到个人服务器时，先复制 `.env.example` 为 `.env`，改掉 `SESSION_SECRET`，然后：

```bash
npm install
npm run build
npm start
```
