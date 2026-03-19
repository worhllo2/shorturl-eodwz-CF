// functions/api/create/index.js
async function sha256(str) {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
function getCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  const m = cookie.match(new RegExp('(?:^|; )' + name.replace(/([.*+?^${}()|[\\]\\\\])/g, '\\\\$1') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}
async function isAuthed(request, env) {
  const pass = env.ADMIN_PASS || '';
  if (!pass) return false;
  const expected = await sha256(pass);
  const got = getCookie(request, 'auth');
  return !!got && got === expected;
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  // 保护创建接口
  if (!(await isAuthed(request, env))) {
    return new Response('未授权', { status: 401 });
  }

  const { url, slug: customSlug } = await request.json();
  const adminPath = env.ADMIN_PATH;

  if (!url) {
    return new Response('URL 是必需的', { status: 400 });
  }



  let slug = customSlug;

  if (slug) {
    if (adminPath && slug === adminPath) {
      return new Response(JSON.stringify({ error: '此自定义短链接已被使用，请重试。' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(slug)) {
      return new Response(JSON.stringify({ error: '自定义短链接只能包含字母、数字、连字符和下划线。' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const existing = await env.DWZ_KV.get(slug);
    if (existing) {
      return new Response(JSON.stringify({ error: '此自定义短链接已被使用，请重试。' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else {
    let newSlug, existing;
    do {
      newSlug = Math.random().toString(36).substring(2, 8);
      existing = await env.DWZ_KV.get(newSlug);
    } while (existing || (adminPath && newSlug === adminPath));
    slug = newSlug;
  }

  const linkData = { original: url, visits: 0 };

  await env.DWZ_KV.put(slug, JSON.stringify(linkData));

  return new Response(JSON.stringify({ slug, ...linkData }), {
    headers: { 'Content-Type': 'application/json' },
  });
}