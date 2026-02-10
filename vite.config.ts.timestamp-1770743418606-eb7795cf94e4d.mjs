// vite.config.ts
import { defineConfig } from "file:///O:/Projets/my_portfolio/node_modules/vite/dist/node/index.js";
import vue from "file:///O:/Projets/my_portfolio/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { fileURLToPath, URL } from "node:url";
var __vite_injected_original_import_meta_url = "file:///O:/Projets/my_portfolio/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url)),
      "@components": fileURLToPath(new URL("./src/components", __vite_injected_original_import_meta_url)),
      "@composables": fileURLToPath(new URL("./src/composables", __vite_injected_original_import_meta_url)),
      "@stores": fileURLToPath(new URL("./src/stores", __vite_injected_original_import_meta_url)),
      "@types": fileURLToPath(new URL("./src/types", __vite_injected_original_import_meta_url)),
      "@utils": fileURLToPath(new URL("./src/utils", __vite_injected_original_import_meta_url)),
      "@assets": fileURLToPath(new URL("./src/assets", __vite_injected_original_import_meta_url))
    }
  },
  server: {
    port: 5173,
    open: true
  },
  build: {
    // Target modern browsers for smaller bundle
    target: "esnext",
    // Minify with esbuild for faster builds
    minify: "esbuild",
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Chunk size warnings
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Vendor chunk: Vue ecosystem
          "vendor-vue": ["vue", "pinia"],
          // Animations chunk: GSAP
          "vendor-animations": ["gsap"],
          // Utils chunk: VueUse
          "vendor-utils": ["@vueuse/core"]
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJPOlxcXFxQcm9qZXRzXFxcXG15X3BvcnRmb2xpb1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiTzpcXFxcUHJvamV0c1xcXFxteV9wb3J0Zm9saW9cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL086L1Byb2pldHMvbXlfcG9ydGZvbGlvL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGgsIFVSTCB9IGZyb20gJ25vZGU6dXJsJ1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbdnVlKCldLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgICAnQGNvbXBvbmVudHMnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL2NvbXBvbmVudHMnLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgICAgJ0Bjb21wb3NhYmxlcyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvY29tcG9zYWJsZXMnLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgICAgJ0BzdG9yZXMnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL3N0b3JlcycsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgICAnQHR5cGVzJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYy90eXBlcycsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgICAnQHV0aWxzJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYy91dGlscycsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgICAnQGFzc2V0cyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvYXNzZXRzJywgaW1wb3J0Lm1ldGEudXJsKSlcclxuICAgIH1cclxuICB9LFxyXG4gIHNlcnZlcjoge1xyXG4gICAgcG9ydDogNTE3MyxcclxuICAgIG9wZW46IHRydWVcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICAvLyBUYXJnZXQgbW9kZXJuIGJyb3dzZXJzIGZvciBzbWFsbGVyIGJ1bmRsZVxyXG4gICAgdGFyZ2V0OiAnZXNuZXh0JyxcclxuICAgIC8vIE1pbmlmeSB3aXRoIGVzYnVpbGQgZm9yIGZhc3RlciBidWlsZHNcclxuICAgIG1pbmlmeTogJ2VzYnVpbGQnLFxyXG4gICAgLy8gRW5hYmxlIENTUyBjb2RlIHNwbGl0dGluZ1xyXG4gICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxyXG4gICAgLy8gQ2h1bmsgc2l6ZSB3YXJuaW5nc1xyXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA1MDAsXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIC8vIE1hbnVhbCBjaHVua3MgZm9yIGJldHRlciBjYWNoaW5nXHJcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XHJcbiAgICAgICAgICAvLyBWZW5kb3IgY2h1bms6IFZ1ZSBlY29zeXN0ZW1cclxuICAgICAgICAgICd2ZW5kb3ItdnVlJzogWyd2dWUnLCAncGluaWEnXSxcclxuICAgICAgICAgIC8vIEFuaW1hdGlvbnMgY2h1bms6IEdTQVBcclxuICAgICAgICAgICd2ZW5kb3ItYW5pbWF0aW9ucyc6IFsnZ3NhcCddLFxyXG4gICAgICAgICAgLy8gVXRpbHMgY2h1bms6IFZ1ZVVzZVxyXG4gICAgICAgICAgJ3ZlbmRvci11dGlscyc6IFsnQHZ1ZXVzZS9jb3JlJ11cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNlAsU0FBUyxvQkFBb0I7QUFDMVIsT0FBTyxTQUFTO0FBQ2hCLFNBQVMsZUFBZSxXQUFXO0FBRndILElBQU0sMkNBQTJDO0FBSzVNLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxJQUFJLENBQUM7QUFBQSxFQUNmLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsTUFDcEQsZUFBZSxjQUFjLElBQUksSUFBSSxvQkFBb0Isd0NBQWUsQ0FBQztBQUFBLE1BQ3pFLGdCQUFnQixjQUFjLElBQUksSUFBSSxxQkFBcUIsd0NBQWUsQ0FBQztBQUFBLE1BQzNFLFdBQVcsY0FBYyxJQUFJLElBQUksZ0JBQWdCLHdDQUFlLENBQUM7QUFBQSxNQUNqRSxVQUFVLGNBQWMsSUFBSSxJQUFJLGVBQWUsd0NBQWUsQ0FBQztBQUFBLE1BQy9ELFVBQVUsY0FBYyxJQUFJLElBQUksZUFBZSx3Q0FBZSxDQUFDO0FBQUEsTUFDL0QsV0FBVyxjQUFjLElBQUksSUFBSSxnQkFBZ0Isd0NBQWUsQ0FBQztBQUFBLElBQ25FO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLE9BQU87QUFBQTtBQUFBLElBRUwsUUFBUTtBQUFBO0FBQUEsSUFFUixRQUFRO0FBQUE7QUFBQSxJQUVSLGNBQWM7QUFBQTtBQUFBLElBRWQsdUJBQXVCO0FBQUEsSUFDdkIsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBO0FBQUEsUUFFTixjQUFjO0FBQUE7QUFBQSxVQUVaLGNBQWMsQ0FBQyxPQUFPLE9BQU87QUFBQTtBQUFBLFVBRTdCLHFCQUFxQixDQUFDLE1BQU07QUFBQTtBQUFBLFVBRTVCLGdCQUFnQixDQUFDLGNBQWM7QUFBQSxRQUNqQztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
