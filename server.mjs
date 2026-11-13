import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const port = Number(process.env.PORT || 3000);
const html = await readFile(new URL('./index.html', import.meta.url));

const headers = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

const server = createServer((request, response) => {
  const url = new URL(request.url || '/', 'http://localhost');

  if (url.pathname === '/healthz') {
    response.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { 'Allow': 'GET, HEAD' });
      response.end('Method Not Allowed');
      return;
    }
    response.writeHead(200, headers);
    response.end(request.method === 'HEAD' ? undefined : html);
    return;
  }

  response.writeHead(404, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end('Not Found');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`WebSnap disponível em http://0.0.0.0:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
