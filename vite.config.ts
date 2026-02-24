import { defineConfig } from "vite";
import { resolve } from "path";

// Explicit list of HTML entry points that are well-formed enough for Vite to build.
// The dev server serves ALL files regardless; this only affects `vite build`.
const buildEntries: Record<string, string> = {
  index: resolve(__dirname, "index.html"),
  SystemAnimator_online: resolve(__dirname, "SystemAnimator_online.html"),
  SystemAnimator_online_GitHub: resolve(
    __dirname,
    "SystemAnimator_online_GitHub.html",
  ),
  SystemAnimator_online_FGO: resolve(
    __dirname,
    "SystemAnimator_online_FGO.html",
  ),
  SystemAnimator_online_PT: resolve(
    __dirname,
    "SystemAnimator_online_PT.html",
  ),
  SystemAnimator_online_dancer: resolve(
    __dirname,
    "SystemAnimator_online_dancer.html",
  ),
  SystemAnimator_online_multiplayer: resolve(
    __dirname,
    "SystemAnimator_online_multiplayer.html",
  ),
  XR_Animator: resolve(__dirname, "XR_Animator.html"),
};

export default defineConfig({
  root: ".",

  // Dev server configuration
  server: {
    port: 3000,
    open: "/index.html",
  },

  build: {
    rollupOptions: {
      input: buildEntries,
    },
    outDir: "dist",
    assetsInlineLimit: 0,
  },

  // Legacy scripts loaded via <script> tags and document.write()
  // are not processed by Vite's module system.
  optimizeDeps: {
    exclude: ["three"],
  },
});
