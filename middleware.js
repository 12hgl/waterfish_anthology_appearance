/**
 * Vercel Edge Middleware：给每个页面提供 Markdown 协商。
 *
 * 请求带 `Accept: text/markdown` 时，返回同路径的 .md 版本（构建时已生成）。
 * 这是「agent readiness」里最常见的一分：让 agent 拿到的是纯文本，而不是一堆 div。
 * 不想用可以删掉这个文件，站点其余部分不依赖它。
 */
export const config = {
  matcher: ['/((?!assets/|api/|.*\\.[a-zA-Z0-9]+$).*)'],
};

export default async function middleware(request) {
  const accept = (request.headers.get('accept') || '').toLowerCase();
  if (!accept.includes('text/markdown')) return;

  const url = new URL(request.url);
  const { pathname } = url;
  if (pathname.endsWith('.md')) return;

  const mdPath = pathname === '/' ? '/index.md' : pathname.endsWith('/') ? `${pathname}index.md` : `${pathname}/index.md`;

  let res;
  try {
    res = await fetch(new URL(mdPath, url), { headers: { 'x-appearance-md': '1' } });
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
      'x-markdown-source': mdPath,
    },
  });
}
