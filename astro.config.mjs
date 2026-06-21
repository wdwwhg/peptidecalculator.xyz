import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://peptidecalculator.xyz",
  output: "static",
  integrations: [
    sitemap({
      namespaces: {
        news: false,
        video: false,
        xhtml: false
      }
    })
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
