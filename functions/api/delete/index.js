// functions/api/delete/index.js
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
    return new Response('请求方法不允许', { status: 405 });
  }

  if (!(await isAuthed(request, env))) {
    return new Response('未授权', { status: 401 });
  }

  const { slug } = await request.json();

  if (!slug) {
    return new Response('短链接标识是必需的', { status: 400 });
  }

  try {
    const linkDataStr = await env.DWZ_KV.get(slug);
    if (linkDataStr) {
      await env.DWZ_KV.delete(slug);
    }

    return new Response(JSON.stringify({ success: true, slug }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: '删除链接失败' }), { status: 500 });
  }
}