/**
 * Vercel Edge Middleware：内容协商。
 * 请求带 Accept: text/markdown 时返回同路径的 .md（构建时已经生成好），
 * 让 agent 拿到纯文本而不是一堆 div。删掉这个文件站点也能跑，只是少了这一项。
 */
export const config = {
  matcher: ['/((?!assets/|api/|.*\\.[a-zA-Z0-9]+$).*)'],
};

export default async function middleware(request) {
  const accept = (request.headers.get('accept') || '').toLowerCase();
  if (!accept.includes('text/markdown')) return;

  const url = new URL(request.url);
  const p = url.pathname;
  if (p.endsWith('.md')) return;

  const md = p === '/' ? '/index.md' : p.endsWith('/') ? `${p}index.md` : `${p}/index.md`;

  let res;
  try {
    res = await fetch(new URL(md, url));
  } catch {
    return;
  }
  if (!res.ok) return;

  return new Response(res.body, {
    status: 200,
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      vary: 'Accept',
      'cache-control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400',
      'x-md-source': md,
    },
  });
}
