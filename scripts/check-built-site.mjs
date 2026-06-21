import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve("dist");
const failures = [];

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    return statSync(fullPath).isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function pathForHref(href) {
  const cleanPath = href.split(/[?#]/, 1)[0];
  if (!cleanPath || cleanPath === "/") return join(root, "index.html");

  const localPath = join(root, cleanPath.replace(/^\/+/, ""));
  if (cleanPath.endsWith("/")) return join(localPath, "index.html");
  if (existsSync(localPath)) return localPath;
  return `${localPath}.html`;
}

const htmlFiles = walk(root).filter((file) => file.endsWith(".html"));

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const displayPath = relative(root, file);

  if (!/<title>[^<]+<\/title>/i.test(html)) {
    failures.push(`${displayPath}: missing title`);
  }
  if (!/<meta name="description" content="[^"]+"/i.test(html)) {
    failures.push(`${displayPath}: missing meta description`);
  }
  if (!/<link rel="canonical" href="https:\/\/peptidecalculator\.xyz\//i.test(html)) {
    failures.push(`${displayPath}: missing canonical URL`);
  }
  if ((html.match(/<h1\b/gi) ?? []).length !== 1) {
    failures.push(`${displayPath}: expected exactly one h1`);
  }
  if (!html.includes('type="application/ld+json"')) {
    failures.push(`${displayPath}: missing JSON-LD`);
  }
  if (!html.includes("https://www.googletagmanager.com/gtag/js?id=G-560YQ8HT53")) {
    failures.push(`${displayPath}: missing Google Analytics loader`);
  }
  if (!html.includes("gtag('config', 'G-560YQ8HT53')")) {
    failures.push(`${displayPath}: missing Google Analytics configuration`);
  }

  for (const match of html.matchAll(/href="(\/[^"#?]*[^"#?]?)"/g)) {
    const href = match[1];
    if (
      href.startsWith("/_astro/") ||
      href === "/sitemap-index.xml" ||
      href === "/favicon.svg"
    ) {
      continue;
    }

    const target = pathForHref(href);
    if (!existsSync(target)) {
      failures.push(`${displayPath}: broken internal link ${href}`);
    }
  }
}

for (const required of [
  "robots.txt",
  "sitemap-index.xml",
  "_headers",
  "_redirects",
  "favicon.svg",
  "og-card.svg"
]) {
  if (!existsSync(join(root, required))) {
    failures.push(`missing built asset: ${required}`);
  }
}

if (failures.length > 0) {
  console.error(`Built-site validation failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(
  `Built-site validation passed: ${htmlFiles.length} HTML files, metadata present, internal links resolved.`
);
