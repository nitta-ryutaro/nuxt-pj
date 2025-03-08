export default async function handler(req: Request) {
  const geo = req.geo; // Edge Functions での地理情報

  if (geo.country !== 'JP') {
    // アクセス元の国名を含めたメッセージを返す
    return new Response(
      JSON.stringify({
        message: `Access Denied from ${geo.country}. Please access from Japan.`,
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // 日本からのアクセスは許可
  return new Response(
    JSON.stringify({ message: 'Welcome from Japan!' }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
