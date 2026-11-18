import app from '../web/server/server.js';

export default function handler(req, res) {
  // If Vercel passed a matched path header or forwarded URL, restore it for Express routing
  const matchedPath = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'] || req.url;
  if (matchedPath && matchedPath !== '/api/index.js') {
    req.url = matchedPath;
  }
  return app(req, res);
}
