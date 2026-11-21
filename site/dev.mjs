#!/usr/bin/env node
/** 本地预览：node site/dev.mjs [端口]。行为贴近 Vercel 静态托管，含 markdown 协商。 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(HERE, 'dist');
const PORT = Number(process.argv[2] || process.env.PORT || 4173);

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.log('没有 dist，先构建一次…');
  spawnSync(process.execPath, [path.join(HERE, 'build.mjs')], { stdio: 'inherit' });
}

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

http
  .createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    let p = decodeURIComponent(url.pathname);
    const wantsMd = (req.headers.accept || '').toLowerCase().includes('text/markdown') && !p.endsWith('.md');

    const resolve = (q) => {
      let file = path.join(DIST, q);
      if (q.endsWith('/')) file = path.join(file, 'index.html');
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      return file;
    };

    let file = resolve(p);
    let body;
    let type = TYPES[path.extname(file)] || 'application/octet-stream';
    if (p.endsWith('/api-catalog')) type = 'application/linkset+json';
    if (p.endsWith('/SKILL.md')) type = 'text/markdown; charset=utf-8';

    if (wantsMd) {
      const mdPath = p === '/' ? '/index.md' : p.endsWith('/') ? `${p}index.md` : `${p}/index.md`;
      const mdFile = path.join(DIST, mdPath);
      if (fs.existsSync(mdFile)) {
        file = mdFile;
        type = 'text/markdown; charset=utf-8';
      }
    }

    if (!fs.existsSync(file)) {
      const nf = path.join(DIST, '404.html');
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : '404');
      return;
    }

    body = fs.readFileSync(file);
    res.writeHead(200, {
      'content-type': type,
      vary: 'Accept',
      'cache-control': 'no-store',
      link: '</sitemap.xml>; rel="sitemap", </llms.txt>; rel="llms-txt"',
    });
    res.end(body);
  })
  .listen(PORT, () => {
    console.log(`预览：http://localhost:${PORT}`);
    console.log(`试试：curl -H 'Accept: text/markdown' http://localhost:${PORT}/library/ | head -20`);
  });
