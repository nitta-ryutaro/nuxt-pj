// api/middleware.ts
export default function handler(req: any, res: any) {
    const geo = req.geo;  // Edge Functions での地理情報

    if (geo.country !== 'JP') {  // 日本以外の国からアクセスを拒否
      return res.status(403).json({ message: 'Access Denied' });
    }

    // 日本からのアクセスは許可
    return res.status(200).json({ message: 'Welcome from Japan!' });
  }

  export const config = {
    runtime: 'edge',  // Edge Functionとして指定
  };
