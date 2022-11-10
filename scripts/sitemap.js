import { readdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const format = (path) => {
  const suffix = path === "index.html" ? "" : `/${path.replace(".html", "")}`

  return `\n  <url>\n    <loc>https://oh-jinsu.github.io${suffix}</loc>\n  </url>`
}

const root = resolve(process.cwd(), `build`);

const extractUrls = (path, options) => readdirSync(path, { withFileTypes: true })
  .reduce((pre, cur) => {
  if (options?.excludes?.some((value) => cur.name.includes(value))) {
    return pre;
  }
  
  if (cur.isDirectory()) {
    const children = extractUrls(resolve(path, cur.name)).map((name) => `${cur.name}/${name}`)

    return [
      ...children,
      ...pre
    ]
  }

  if (cur.isFile() && cur.name.endsWith(".html")) {
    return [
      cur.name,
      ...pre
    ]
  }

  return pre;
}, [])

const urls = extractUrls(root, {
  excludes: ["googlee22f0ce5337378b0"],
}).map(format);

const result = `<?xml version="1.0" encoding="UTF-8" ?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}\n</urlset>`;

const sitemap = resolve(process.cwd(), `build/sitemap.xml`);

writeFileSync(sitemap, result);
