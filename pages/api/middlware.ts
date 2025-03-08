export default async function handler(req: Request) {
    const geo = req.geo;  // Edge Functions での地理情報

    if (geo.country !== 'JP') {  // 日本以外の国からアクセスを拒否
      return new Response(JSON.stringify({ message: 'Access Denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 日本からのアクセスは許可
    return new Response(JSON.stringify({ message: 'Welcome from Japan!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  export const config = {
    runtime: 'edge',  // Edge Functionとして指定
  };
