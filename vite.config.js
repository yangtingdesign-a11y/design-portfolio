import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  appType: "mpa",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.join(root, "index.html"),
        about: path.join(root, "about.html"),
        work: path.join(root, "work.html"),
        admin: path.join(root, "admin.html"),
      },
    },
  },
});
