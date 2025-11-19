import { NextApiRequest, NextApiResponse } from 'next';

const allowedOrigins = [
  'https://www.laksdentagency.co.uk',
  'https://laksdentagency.co.uk',
  'https://laks-crm.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

export function cors(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin;

  // Check if the origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false; 
}

/**
 * Higher-order function to wrap API handlers with CORS
 * Usage:
 * export default withCors(handler);
 */
export function withCors(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const isPreflight = cors(req, res);
    
    if (isPreflight) {
      return; // Preflight handled, don't call the handler
    }

    return handler(req, res);
  };
}

