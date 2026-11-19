#!/usr/bin/env node
/** 本地预览：node site/serve.mjs [端口]，默认 4173。行为和 Vercel 上的静态托管基本一致，含 markdown 协商。 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const PORT = Number(process.argv[2] || process.env.PORT || 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);
  const accept = (req.headers.accept || '').toLowerCase();
  const wantsMd = accept.includes('text/markdown') && !pathname.endsWith('.md');

  const resolve = (p) => {
    let file = path.join(DIST, p);
    if (p.endsWith('/')) file = path.join(file, 'index.html');
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    return file;
  };

  let file = resolve(pathname);
  let type = TYPES[path.extname(file)] || 'application/octet-stream';

  if (wantsMd) {
    const mdPath = pathname === '/' ? '/index.md' : pathname.endsWith('/') ? `${pathname}index.md` : `${pathname}/index.md`;
    const mdFile = path.join(DIST, mdPath);
    if (fs.existsSync(mdFile)) {
      file = mdFile;
      type = 'text/markdown; charset=utf-8';
      res.setHeader('x-markdown-source', mdPath);
    }
  }

  if (!fs.existsSync(file)) {
    const notFound = path.join(DIST, '404.html');
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : '404');
    return;
  }

  res.writeHead(200, {
    'content-type': type,
    vary: 'Accept',
    'cache-control': 'no-store',
    link: '</sitemap.xml>; rel="sitemap", </llms.txt>; rel="llms-txt"',
  });
  res.end(fs.readFileSync(file));
});

server.listen(PORT, () => {
  console.log(`预览：http://localhost:${PORT}`);
  console.log(`试试：curl -H 'Accept: text/markdown' http://localhost:${PORT}/library/ | head -20`);
});
