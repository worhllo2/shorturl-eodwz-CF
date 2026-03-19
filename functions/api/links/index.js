// functions/api/links/index.js
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
  if (!(await isAuthed(request, env))) {
    return new Response('未授权', { status: 401 });
  }

  try {
    let allKeys = [];
    let cursor = undefined;
    let complete = false;

    do {
      const result = await env.DWZ_KV.list(cursor ? { cursor } : {});
      if (result.keys) allKeys = allKeys.concat(result.keys);
      cursor = result.cursor;
      complete = result.list_complete;
    } while (!complete);

    const links = await Promise.all(
      allKeys.map(async ({ name: key }) => {
        if (key === 'visitCount') return null;
        const value = await env.DWZ_KV.get(key);
        if (value) {
          try {
            const data = JSON.parse(value);
            if (data.original) {
              return { slug: key, original: data.original, visits: data.visits || 0 };
            }
          } catch { return null; }
        }
        return null;
      })
    );

    const validLinks = links.filter(Boolean);

    return new Response(JSON.stringify(validLinks), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: '获取链接列表失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}