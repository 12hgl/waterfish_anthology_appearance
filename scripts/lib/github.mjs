/** 极简 GitHub REST 封装，避免给仓库引入任何 npm 依赖。 */

export function env(name, fallback = '') {
  const v = process.env[name];
  if (v === undefined || v === '') {
    if (fallback !== '') return fallback;
    throw new Error(`缺少环境变量 ${name}`);
  }
  return v;
}

const API = 'https://api.github.com';

export function repoCtx() {
  return {
    token: env('GITHUB_TOKEN'),
    repo: env('GITHUB_REPOSITORY'),
    issueNumber: Number(env('ISSUE_NUMBER', '0')) || null,
  };
}

export async function gh(pathname, init = {}) {
  const { token } = repoCtx();
  const res = await fetch(`${API}${pathname}`, {
    ...init,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'x-github-api-version': '2022-11-28',
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`GitHub ${init.method || 'GET'} ${pathname} → ${res.status} ${JSON.stringify(data).slice(0, 300)}`);
  }
  return data;
}

export async function getIssue() {
  const { repo, issueNumber } = repoCtx();
  return gh(`/repos/${repo}/issues/${issueNumber}`);
}

export async function addComment(body) {
  const { repo, issueNumber } = repoCtx();
  return gh(`/repos/${repo}/issues/${issueNumber}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

export async function updateComment(commentId, body) {
  const { repo } = repoCtx();
  return gh(`/repos/${repo}/issues/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify({ body }),
  });
}

export async function listComments() {
  const { repo, issueNumber } = repoCtx();
  return gh(`/repos/${repo}/issues/${issueNumber}/comments?per_page=100`);
}

export async function addLabels(labels) {
  const { repo, issueNumber } = repoCtx();
  return gh(`/repos/${repo}/issues/${issueNumber}/labels`, {
    method: 'POST',
    body: JSON.stringify({ labels }),
  });
}

export async function removeLabel(label) {
  const { repo, issueNumber } = repoCtx();
  try {
    await gh(`/repos/${repo}/issues/${issueNumber}/labels/${encodeURIComponent(label)}`, {
      method: 'DELETE',
    });
  } catch {
    /* 标签本来就不存在，忽略 */
  }
}

export function labelNames(issue) {
  return (issue?.labels || []).map((l) => (typeof l === 'string' ? l : l.name));
}

export function hasLabel(issue, name) {
  return labelNames(issue).includes(name);
}

export function categoryLabel(issue) {
  const hit = labelNames(issue).find((l) => l.startsWith('category:'));
  return hit ? hit.slice('category:'.length) : null;
}

/** 从 raw / gist 链接抓取主题源码，带体积与域名限制。 */
export async function fetchRemoteSource(url) {
  const host = new URL(url).hostname.toLowerCase();
  const allowed = [
    'raw.githubusercontent.com',
    'gist.githubusercontent.com',
    'gist.github.com',
    'cdn.jsdelivr.net',
  ];
  if (!allowed.includes(host)) {
    throw new Error(`不支持从 ${host} 抓取，请直接把代码贴在 issue 里，或用 raw.githubusercontent.com / gist 链接`);
  }
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`抓取失败：HTTP ${res.status}`);
  const text = await res.text();
  if (Buffer.byteLength(text, 'utf8') > 96 * 1024) throw new Error('远端文件超过 96 KB，拒绝处理');
  return text;
}
