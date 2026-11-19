/**
 * 主题代码的静态检查规则。
 * 三处共用：CI（PR 校验）、issue 自动审核、维护者本地 `npm run validate`。
 *
 * 判定分三档：
 *   block —— 明确危险，直接拒绝（主题在页面主世界运行，能碰到 DOM 和用户数据）
 *   warn  —— 需要人看一眼，但不拒绝
 *   info  —— 记录用
 */

export const ALLOWED_EXTERNAL_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net',
  'fastly.jsdelivr.net',
  'gcore.jsdelivr.net',
  'unpkg.com',
  'registry.npmmirror.com',
  'lib.baomitu.com',
  // SVG / XLink 命名空间：出现在 xmlns 里，不会产生请求
  'www.w3.org',
];

const BLOCK_RULES = [
  {
    id: 'eval',
    re: /\beval\s*\(/,
    why: '用了 eval()，执行字符串代码无法审计',
  },
  {
    id: 'new-function',
    re: /\bnew\s+Function\s*\(/,
    why: '用了 new Function()，等价于 eval',
  },
  {
    id: 'function-ctor',
    re: /(^|[^.\w])Function\s*\(\s*['"`]/,
    why: '直接调用 Function 构造器',
  },
  {
    id: 'document-write',
    re: /document\s*\.\s*(write|writeln)\s*\(/,
    why: '用了 document.write，会破坏页面',
  },
  {
    id: 'cookie',
    re: /\bdocument\s*\.\s*cookie\b/,
    why: '读写 cookie，主题不需要碰登录态',
  },
  {
    id: 'storage',
    re: /\b(localStorage|sessionStorage|indexedDB|openDatabase)\b/,
    why: '读写浏览器存储，可能带出账号数据',
  },
  {
    id: 'network',
    re: /\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|navigator\s*\.\s*serviceWorker)\b/,
    why: '发起网络请求，可能把页面内容外传',
  },
  {
    id: 'dynamic-import',
    re: /\bimport\s*\(|\bimportScripts\s*\(/,
    why: '动态加载外部脚本',
  },
  {
    id: 'script-tag',
    re: /<\s*script|<%|javascript\s*:/i,
    why: '内容里出现 script 标签或 javascript: 协议',
  },
  {
    id: 'inline-handler',
    re: /\bon(click|error|load|mouseover|mouseenter|focus|submit|input)\s*=/i,
    why: '写内联事件处理属性',
  },
  {
    id: 'create-script',
    re: /createElement\s*\(\s*['"`]\s*(script|iframe|object|embed)\s*['"`]/i,
    why: '动态创建 script / iframe 等可执行元素',
  },
  {
    id: 'location',
    re: /\b(window|document|self|top|parent)\s*\.\s*location\b|\blocation\s*\.\s*(href|replace|assign)\s*[=(]/,
    why: '改写页面地址，可能是跳转劫持',
  },
  {
    id: 'window-open',
    re: /\b(window\s*\.\s*open|open\s*\(\s*['"`]https?)/,
    why: '打开新窗口',
  },
  {
    id: 'postmessage',
    re: /\bpostMessage\b/,
    why: '向其它窗口发消息，容易被用来做点击劫持',
  },
  {
    id: 'form',
    re: /createElement\s*\(\s*['"`]\s*form|\.submit\s*\(\s*\)/,
    why: '构造或提交表单，可能是钓鱼',
  },
  {
    id: 'keylogger',
    re: /addEventListener\s*\(\s*['"`](keydown|keypress|keyup|input)['"`]/,
    why: '监听键盘 / 输入事件，有记录输入的嫌疑',
  },
  {
    id: 'proto',
    re: /__proto__|prototype\s*\[|\bObject\s*\.\s*assign\s*\(\s*window/,
    why: '改原型链或全局对象',
  },
  {
    id: 'sourcemap',
    re: /sourceMappingURL|sourceURL\s*=/,
    why: '带 sourcemap 指向，通常是从别处打包来的',
  },
];

const WARN_RULES = [
  {
    id: 'plain-http',
    // xmlns 命名空间不是请求，别误报
    re: /http:\/\/(?!localhost|127\.0\.0\.1|www\.w3\.org)/,
    why: '引用了 http:// 资源，混用协议可能被浏览器拦',
  },
  {
    id: 'long-base64',
    re: /[A-Za-z0-9+/]{160,}={0,2}/,
    why: '有一段很长的疑似 base64 内容，看不出意图',
  },
  {
    id: 'setinterval',
    re: /\bsetInterval\s*\(/,
    why: '用了定时器，注意别把 CPU 打满',
  },
  {
    id: 'innerhtml',
    re: /\.innerHTML\s*=/,
    why: '直接写 innerHTML，会覆盖应用自己的节点',
  },
  {
    id: 'remove-node',
    re: /\.remove\s*\(\s*\)|\.removeChild\s*\(/,
    why: '删除页面节点，可能是广告拦截式的改动',
  },
  {
    id: 'autoplay',
    re: /<(audio|video)[^>]*autoplay/i,
    why: '自动播放媒体',
  },
];

/** 简单写法支持的键（中 / 英），与客户端一致。 */
export const SIMPLE_KEYS = new Map([
  ['主色', 'accent'],
  ['副色', 'accent2'],
  ['背景', 'bg'],
  ['字体', 'font'],
  ['文字', 'ink'],
  ['底色', 'paper'],
  ['圆角', 'radius'],
  ['accent', 'accent'],
  ['accent2', 'accent2'],
  ['bg', 'bg'],
  ['font', 'font'],
  ['ink', 'ink'],
  ['paper', 'paper'],
  ['radius', 'radius'],
]);

export const FONT_PRESETS = ['serif', 'round', 'mono', 'system'];

/** 解析「简单写法」：一行一条，`:` / `=` / 空格分隔，`//` 与 `#` 开头是注释。 */
export function parseSimpleStyle(source) {
  const entries = [];
  const unknown = [];
  const lines = source.split('\n');
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (/^(\/\/|#)/.test(trimmed)) return;
    const m = trimmed.match(/^([^\s:=]+)\s*[:=]?\s*(.+)$/);
    if (!m) return;
    const rawKey = m[1].trim();
    const value = m[2].trim();
    if (!value) return;
    const key = SIMPLE_KEYS.get(rawKey);
    if (!key) {
      unknown.push({ line: i + 1, key: rawKey, value });
      return;
    }
    entries.push({ line: i + 1, key, rawKey, value });
  });
  return { entries, unknown };
}

/** 复杂写法检测：定义 function theme(api)。 */
export function isComplex(source) {
  return /function\s+theme\s*\(|(?:const|let|var)\s+theme\s*=\s*(?:async\s*)?(?:function|\()/.test(source);
}

export function extractHosts(source) {
  const hosts = new Set();
  const re = /(?:https?:)?\/\/([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
  let m;
  while ((m = re.exec(source))) hosts.add(m[1].toLowerCase());
  return [...hosts];
}

/**
 * 跑一遍规则，返回结构化结果。
 * 只做静态判断，不执行任何主题代码。
 */
export function scan(source, { category, acceptsSubmissions } = {}) {
  const bytes = Buffer.byteLength(source, 'utf8');
  const blocks = [];
  const warns = [];
  const infos = [];

  for (const rule of BLOCK_RULES) {
    const hit = rule.re.exec(source);
    if (hit) {
      const line = source.slice(0, hit.index).split('\n').length;
      blocks.push({ id: rule.id, why: rule.why, line, snippet: clip(hit[0]) });
    }
  }
  for (const rule of WARN_RULES) {
    const hit = rule.re.exec(source);
    if (hit) {
      const line = source.slice(0, hit.index).split('\n').length;
      warns.push({ id: rule.id, why: rule.why, line, snippet: clip(hit[0]) });
    }
  }

  const hosts = extractHosts(source);
  for (const host of hosts) {
    const ok = ALLOWED_EXTERNAL_HOSTS.some((h) => host === h || host.endsWith('.' + h));
    if (!ok) {
      warns.push({
        id: 'external-host',
        why: `引用外部域名 ${host}，会向该域名发起请求（背景图通常可以，脚本不行）`,
        line: 0,
        snippet: host,
      });
    }
  }

  let syntax = 'simple';
  if (isComplex(source)) {
    syntax = 'complex';
  } else {
    const { entries, unknown } = parseSimpleStyle(source);
    if (entries.length === 0) {
      blocks.push({
        id: 'unparsable',
        why: '既没有 function theme(api)，也不是可识别的「键: 值」写法，客户端不会生效',
        line: 0,
        snippet: '',
      });
    }
    for (const u of unknown) {
      warns.push({
        id: 'unknown-key',
        why: `第 ${u.line} 行的键「${u.key}」客户端不认识，这一行会被跳过`,
        line: u.line,
        snippet: `${u.key} ${u.value}`,
      });
    }
    for (const e of entries) {
      if (e.key === 'font' && !FONT_PRESETS.includes(e.value) && !/[一-龥]/.test(e.value)) {
        warns.push({
          id: 'font-value',
          why: `字体值「${e.value}」既不是预设（${FONT_PRESETS.join(' / ')}），也不像字体名`,
          line: e.line,
          snippet: e.value,
        });
      }
      if (e.key === 'radius' && !/^\d{1,2}$/.test(e.value)) {
        warns.push({
          id: 'radius-value',
          why: `圆角只接受 0–40 的整数，收到「${e.value}」`,
          line: e.line,
          snippet: e.value,
        });
      }
    }
  }

  if (bytes > 48 * 1024) {
    warns.push({
      id: 'large-file',
      why: `文件 ${(bytes / 1024).toFixed(1)} KB，接近 64 KB 上限，考虑精简`,
      line: 0,
      snippet: '',
    });
  }

  if (acceptsSubmissions === false) {
    infos.push({ id: 'manual-category', why: '该分类只接受维护者手动收录，不接受投稿' });
  }

  let score = 100;
  for (const b of blocks) score -= 45;
  for (const w of warns) score -= 8;
  score = Math.max(0, Math.min(100, score));

  const verdict = blocks.length > 0 ? 'reject' : score >= 80 ? 'pass' : 'review';

  return {
    bytes,
    syntax,
    hosts,
    blocks,
    warns,
    infos,
    score,
    verdict,
    category: category || null,
  };
}

function clip(s, n = 60) {
  const one = String(s).replace(/\s+/g, ' ').trim();
  return one.length > n ? one.slice(0, n) + '…' : one;
}
