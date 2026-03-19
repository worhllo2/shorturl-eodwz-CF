// 从环境变量获取 Umami 配置
function getUmamiConfig(env) {
  return {
    script: env.ANALYTICS_CODE || '<script defer src="https://tongji.test.cn/script.js" data-website-id="2f696503-af46-4820-bce6-3b7c1160f9d0"></script>',
    host: env.UMAMI_HOST || 'https://tongji.test.cn',
    websiteId: env.UMAMI_WEBSITE_ID || '2f696503-af46-4820-bce6-3b7c1160f9d0'
  };
}

function baseHeaders() {
  return { 'Content-Type': 'text/html; charset=utf-8' };
}

function helloHtml(env) {
  const umamiConfig = getUmamiConfig(env);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>你好世界</title>
  ${umamiConfig.script}
  <style>
    :root {
      --bg1: #0f172a;
      --bg2: #111827;
      --txt: #e5e7eb;
      --accent: #22d3ee;
    }
    * { box-sizing: border-box; }
    html, body { height: 100%; margin: 0; }
    body {
      display: grid;
      place-items: center;
      color: var(--txt);
      background: radial-gradient(60% 60% at 50% 40%, #0b1220 0%, var(--bg1) 45%, var(--bg2) 100%);
    }
    .card {
      width: min(88vw, 720px);
      height: min(60vh, 420px);
      display: grid;
      place-items: center;
      border: 1px solid rgba(255,255,255,0.08);
      background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
      border-radius: 20px;
      position: relative;
      overflow: hidden;
    }
    .card::before {
      content: "";
      position: absolute;
      width: 160%;
      height: 160%;
      top: -30%;
      left: -30%;
      background: conic-gradient(from 180deg at 50% 50%, rgba(34,211,238,0.15), rgba(99,102,241,0.15), rgba(236,72,153,0.15), rgba(34,211,238,0.15));
      filter: blur(40px);
      transform: rotate(10deg);
      pointer-events: none;
    }
    h1 { font-size: clamp(36px, 6vw, 64px); letter-spacing: 2px; margin: 0; }
    .hint { position: absolute; bottom: 16px; opacity: .5; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>你好世界！</h1>
  </div>
</body>
</html>`;
}

function loginHtml(adminPath, env) {
  const umamiConfig = getUmamiConfig(env);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>登录 - 短链接管理</title>
  ${umamiConfig.script}
  <style>
    :root { --bg:#0f172a; --panel:#111827; --border:#374151; --txt:#e5e7eb; --muted:#9ca3af; --accent:#facc15; }
    html, body { height: 100%; margin: 0; }
    body { display:grid; place-items:center; background:var(--bg); color:var(--txt); font-family: ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; }
    .box { width:min(92vw,420px); background:var(--panel); border:1px solid var(--border); border-radius:14px; padding:24px; box-shadow:0 20px 60px rgba(0,0,0,.35); }
    h1 { margin:0 0 8px; font-size:22px; }
    p { margin:0 0 16px; color:var(--muted); }
    input { width:100%; padding:12px 14px; border-radius:10px; border:1px solid var(--border); background:#0b1220; color:var(--txt); outline:none; }
    button { width:100%; margin-top:12px; padding:12px 14px; border:0; border-radius:10px; background:var(--accent); color:#111827; font-weight:700; cursor:pointer; }
    .err { margin-top:10px; color:#f87171; min-height:18px; }
    .tip { margin-top:14px; color:var(--muted); font-size:12px; }
  </style>
</head>
<body>
  <div class="box">
    <h1>登录</h1>
    <p>请输入管理密码</p>
    <form id="loginForm">
      <input id="pwd" type="password" placeholder="管理密码" required />
      <button type="submit">登录</button>
      <div id="err" class="err"></div>
    </form>
    <div class="tip">登录成功后将进入后台（路径 /${adminPath}）</div>
  </div>
  <script>
    const form = document.getElementById('loginForm');
    const pwd = document.getElementById('pwd');
    const err = document.getElementById('err');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      err.textContent = '';
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pwd.value }),
        });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || '登录失败');
        }
        // 登录成功，刷新当前页以加载受保护内容
        location.replace('/${adminPath}');
      } catch (ex) {
        err.textContent = ex.message || '登录失败';
      }
    });
  </script>
</body>
</html>`;
}

function adminHtml(env) {
  const umamiConfig = getUmamiConfig(env);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>管理后台 - 短链接</title>
  ${umamiConfig.script}
  <style>
    :root { --bg: #0f172a; --panel:#111827; --panel2:#0b1220; --border:#374151; --txt:#e5e7eb; --muted:#9ca3af; --accent:#facc15; --err:#f87171; --ok:#4ade80; }
    body { margin:0; background:var(--bg); color:var(--txt); font-family: ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; }
    header { display:flex; gap:8px; align-items:center; justify-content:space-between; padding:14px 18px; border-bottom:1px solid var(--border); background:linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.0)); position: sticky; top:0; }
    .brand { font-weight:800; letter-spacing:1px; }
    .actions button { padding:8px 12px; border-radius:10px; border:1px solid var(--border); background:var(--panel2); color:var(--txt); cursor:pointer; }
    main { max-width: 1000px; margin: 20px auto; padding: 0 16px 40px; display: grid; gap: 18px; }
    .card { background:var(--panel); border:1px solid var(--border); border-radius:14px; padding:16px; }
    h2 { margin:0 0 12px; font-size:18px; }
    /* 生成器 */
    form.gen .row { display:flex; gap:10px; }
    form.gen input[type=url],
    form.gen input[type=text] { flex:1; padding:10px 12px; border-radius:10px; border:1px solid var(--border); background:var(--panel2); color:var(--txt); }
    form.gen button { padding:10px 14px; border:0; border-radius:10px; background:var(--accent); color:#111827; font-weight:700; cursor:pointer; }
    .msg { margin-top:10px; min-height:18px; }
    .msg.err { color: var(--err); }
    .msg.ok  { color: var(--ok); }
    /* 列表 */
    table { width:100%; border-collapse: collapse; }
    th, td { padding: 10px 8px; text-align: left; border-bottom: 1px solid var(--border); }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .delete { background:#b91c1c; color:#fff; border:0; padding:6px 10px; border-radius:8px; cursor:pointer; }
    .muted { color: var(--muted); }
  </style>
</head>
<body>
  <header>
    <div class="brand">短链接 管理台</div>
    <div class="actions">
      <button id="logout">退出登录</button>
    </div>
  </header>
  <main>
    <section class="card">
      <h2>创建短链接</h2>
      <form id="gen" class="gen">
        <div class="row">
          <input id="url" type="url" placeholder="请输入长链接" required />
          <input id="slug" type="text" placeholder="自定义短链接（可选）" />
          <button type="submit" id="submit">生成</button>
        </div>
      </form>
      <div id="msg" class="msg"></div>
      <div id="ok" class="msg ok"></div>
    </section>

    <section class="card">
      <h2>链接列表 <span class="muted">(访问次数降序)</span></h2>
      <p>总数：<span id="count">0</span></p>
      <div style="overflow:auto">
        <table>
          <thead>
            <tr><th>短链接</th><th>原始链接</th><th>访问次数</th><th>操作</th></tr>
          </thead>
          <tbody id="tbody"></tbody>
        </table>
      </div>
    </section>
  </main>
  <script>
    const $ = (s) => document.querySelector(s);
    const tbody = $('#tbody'); const countEl = $('#count');
    const msg = $('#msg'); const ok = $('#ok'); const submitBtn = $('#submit');

    // 登出
    $('#logout').addEventListener('click', async () => {
      await fetch('/api/logout', { method: 'POST' });
      location.reload();
    });

    // 创建短链
    $('#gen').addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.textContent = ''; ok.innerHTML = '';
      submitBtn.disabled = true; submitBtn.textContent = '生成中...';
      try {
        const url = $('#url').value.trim();
        const slug = $('#slug').value.trim();
        const payload = slug ? { url, slug } : { url };
        const res = await fetch('/api/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          let e = '创建失败';
          try { const j = await res.json(); e = j.error || e; } catch {}
          throw new Error(e);
        }
        const data = await res.json();
        $('#url').value=''; $('#slug').value='';
        const shortUrl = \`\${location.origin}/\${data.slug}\`;
        ok.innerHTML = \`成功！链接为：<a target="_blank" href="\${shortUrl}">\${shortUrl.replace(/^https?:\\/\\//,'')}</a>\`;
        await loadList();
      } catch (ex) {
        msg.textContent = ex.message || '创建失败';
      } finally {
        submitBtn.disabled = false; submitBtn.textContent = '生成';
      }
    });

    // 加载列表
    async function loadList() {
      tbody.innerHTML = '';
      try {
        const res = await fetch('/api/links');
        if (res.status === 401) { location.reload(); return; }
        const list = await res.json();
        list.sort((a,b)=> (b.visits||0)-(a.visits||0));
        countEl.textContent = list.length;
        for (const it of list) {
          const tr = document.createElement('tr');
          const shortUrl = \`\${location.origin}/\${it.slug}\`;
          tr.innerHTML = \`
            <td><a target="_blank" href="\${shortUrl}">\${shortUrl.replace(/^https?:\\/\\//,'')}</a></td>
            <td title="\${it.original}"><a target="_blank" href="\${it.original}">\${it.original.length>64? (it.original.slice(0,64)+'...') : it.original}</a></td>
            <td>\${it.visits||0}</td>
            <td><button class="delete" data-slug="\${it.slug}">删除</button></td>
          \`;
          tbody.appendChild(tr);
        }
      } catch (ex) {
        console.error(ex);
      }
    }

    tbody.addEventListener('click', async (e) => {
      const btn = e.target.closest('.delete'); if (!btn) return;
      const slug = btn.dataset.slug;
      if (!confirm(\`确定删除短链接 "\${slug}" ?\`)) return;
      const res = await fetch('/api/delete', { method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ slug }) });
      if (res.ok) { btn.closest('tr').remove(); countEl.textContent = +countEl.textContent - 1; }
    });

    loadList();
  </script>
</body>
</html>`;
}

// ---- server-side helpers ----
async function sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('');
}
function getCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  const m = cookie.match(new RegExp('(?:^|; )' + name.replace(/([.*+?^${}()|[\\]\\\\])/g, '\\\\$1') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}
async function isAuthed(request, env) {
  const pass = env.ADMIN_PASS || 'admin123456';
  if (!pass) return false;
  const expected = await sha256Hex(pass);
  const got = getCookie(request, 'auth');
  return !!got && got === expected;
}

export async function onRequest({ request, params, env }) {
  const { slug } = params;
  const adminPath = env.ADMIN_PATH || 'admin';;

  // / => 主页（科技风格纯色图 + 你好世界）
  if (!slug || slug === 'favicon.ico') {
    return new Response(helloHtml(env), { headers: baseHeaders() });
  }

  // /{ADMIN_PATH} => 受保护的管理页
  if (adminPath && slug === adminPath) {
    const authed = await isAuthed(request, env);
    if (!authed) {
      return new Response(loginHtml(adminPath, env), { headers: baseHeaders() });
    }
    return new Response(adminHtml(env), { headers: baseHeaders() });
  }

  // 其它 slug：短链跳转
  try {
    const link = await env.DWZ_KV.get(slug);
    if (link) {
      const linkData = JSON.parse(link);
      linkData.visits = (linkData.visits || 0) + 1;
      await env.DWZ_KV.put(slug, JSON.stringify(linkData));
      
      // 使用真正的 Beacon API 向 Umami 发送统计数据
      try {
        const umamiConfig = getUmamiConfig(env);
        // 构建当前页面URL
        const url = new URL(request.url);
        const currentUrl = `${url.origin}/${slug}`;
        
        // 构建简单的 Beacon 请求参数
        const beaconUrl = `${umamiConfig.host}/api/collect`;
        const beaconData = new URLSearchParams({
          website: umamiConfig.websiteId,
          url: currentUrl,
          hostname: url.hostname,
          screen: '1920x1080', // 默认值
          language: 'zh-CN'    // 默认值
        }).toString();
        
        // 使用简单的 fetch + keepalive 作为 Beacon API 的替代
        // 这是在边缘函数环境中最接近 navigator.sendBeacon 的实现
        fetch(beaconUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: beaconData,
          keepalive: true
        });
      } catch (e) {
        // 忽略统计错误，不影响用户体验
      }
      
      // 立即返回重定向响应
      return Response.redirect(linkData.original, 302);
    }
  } catch (err) {
    console.error('KV Error:', err && err.message);
  }

  // 未命中：返回 404 + 主页样式
  return new Response(helloHtml(env), { headers: baseHeaders(), status: 404 });
}