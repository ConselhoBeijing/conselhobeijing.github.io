// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import keystatic from "@keystatic/astro";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkGithubBlockquoteAlert from "remark-github-blockquote-alert";
import remarkMath from "remark-math";
import remarkCustomDirectives from "./src/markdown/remark-custom-directives.mjs";

import markdoc from "@astrojs/markdoc";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  output: "static",

  vite: {
    plugins: [tailwindcss()],
  },

  // integrations: [react(), process.env.NODE_ENV === "development" ? keystatic() : null, markdoc()],
  integrations: [react(), markdoc(), keystatic()],

  markdown: {
    remarkPlugins: [remarkGfm, remarkDirective, remarkCustomDirectives, remarkGithubBlockquoteAlert, remarkMath],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: {
            className: ["markdown-heading-anchor"],
            ariaLabel: "Link para esta seção",
          },
        },
      ],
      rehypeKatex,
    ],
  },

  i18n: {
    defaultLocale: "pt-BR",
    locales: ["pt", "pt-BR"],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  adapter: vercel(),
});