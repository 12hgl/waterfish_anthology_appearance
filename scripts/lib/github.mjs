/** GitHub REST 的最小封装。只用 fetch，不引 SDK——Actions 里这些都是现成的。 */

const API = process.env.GITHUB_API_URL || 'https://api.github.com';
const TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = process.env.GITHUB_REPOSITORY || '';

export const repo = () => {
  const [owner, name] = REPO.split('/');
  return { owner, name };
};

export async function call(pathname, { method = 'GET', body, accept = 'application/vnd.github+json' } = {}) {
  if (!TOKEN) throw new Error('缺少 GITHUB_TOKEN');
  const res = await fetch(`${API}${pathname}`, {
    method,
    headers: {
      authorization: `Bearer ${TOKEN}`,
      accept,
      'content-type': 'application/json',
      'user-agent': 'waterfish-appearance',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub ${method} ${pathname} → ${res.status} ${text.slice(0, 300)}`);
  }
  return res.status === 204 ? null : res.json();
}

export const issueNumber = () =>
  Number(process.env.ISSUE_NUMBER || process.env.GITHUB_EVENT_ISSUE || 0);

export function getIssue(n = issueNumber()) {
  const { owner, name } = repo();
  return call(`/repos/${owner}/${name}/issues/${n}`);
}

export function listComments(n = issueNumber()) {
  const { owner, name } = repo();
  return call(`/repos/${owner}/${name}/issues/${n}/comments?per_page=100`);
}

export function createComment(body, n = issueNumber()) {
  const { owner, name } = repo();
  return call(`/repos/${owner}/${name}/issues/${n}/comments`, { method: 'POST', body: { body } });
}

export function editComment(id, body) {
  const { owner, name } = repo();
  return call(`/repos/${owner}/${name}/issues/comments/${id}`, { method: 'PATCH', body: { body } });
}

export function addLabels(labels, n = issueNumber()) {
  const { owner, name } = repo();
  return call(`/repos/${owner}/${name}/issues/${n}/labels`, { method: 'POST', body: { labels } });
}

export function removeLabel(label, n = issueNumber()) {
  const { owner, name } = repo();
  return call(`/repos/${owner}/${name}/issues/${n}/labels/${encodeURIComponent(label)}`, { method: 'DELETE' });
}

export function ensureLabels(defs) {
  const { owner, name } = repo();
  return Promise.all(
    defs.map((d) =>
      call(`/repos/${owner}/${name}/labels`, { method: 'POST', body: d }).catch((err) => {
        // 已存在（422）不算失败
        if (!/422/.test(err.message)) throw err;
        return null;
      }),
    ),
  );
}

export const labelsOf = (issue) => (issue.labels || []).map((l) => (typeof l === 'string' ? l : l.name));
