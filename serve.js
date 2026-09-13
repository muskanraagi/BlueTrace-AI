// Tiny zero-dependency server for the static prototype.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };

http.createServer((request, response) => {
  const requested = request.url === '/' ? '/index.html' : decodeURIComponent(request.url.split('?')[0]);
  const file = path.resolve(root, `.${requested}`);
  if (!file.startsWith(root)) { response.writeHead(403); return response.end('Forbidden'); }
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(error.code === 'ENOENT' ? 404 : 500); return response.end('Not found'); }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    response.end(data);
  });
}).listen(8080, () => console.log('BLUTRACE AI prototype: http://localhost:8080'));
