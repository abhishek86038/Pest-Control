import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, realpath } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, extname, sep } from 'node:path';
import { createChatHandler } from './chat.mjs';
const root = fileURLToPath(new URL('../',import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.ico':'image/x-icon','.mp4':'video/mp4','.woff2':'font/woff2'};
export function createSiteServer(options = {}) {
  const chat = createChatHandler(options);
  return createServer(async (req,res) => {
    res.setHeader('X-Content-Type-Options','nosniff');
    try {
      let pathname = decodeURIComponent(new URL(req.url,'http://local').pathname);
      if (pathname === '/api/chat') { await chat(req,res); return; }
      if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405).end(); return;}
      if (pathname === '/') pathname = '/index.html';
      else if (!extname(pathname)) pathname += '.html';
      // Static site only: never expose .env, git, server code or documentation.
      if (!/^\/(?:[\w][\w.-]*\.(?:html|js|png|jpg|jpeg|svg|webp|ico|mp4|css)|(?:js|css)\/[\w-]+\.(?:js|css)|images\/(?:[\w ()-]+\/)*[\w][\w .()-]*\.(?:png|jpg|jpeg|svg|webp|ico|mp4|woff2))$/.test(pathname)) {res.writeHead(404).end(); return;}
      const file = await realpath(resolve(root,'.'+pathname));
      if (!file.startsWith(root.endsWith(sep) ? root : root+sep)) {res.writeHead(404).end(); return;}
      const info = await stat(file);
      if (!info.isFile() || !types[extname(file)]) {res.writeHead(404).end(); return;}
      res.writeHead(200,{'Content-Type':types[extname(file)],'Content-Length':info.size,'Cache-Control':'no-cache'});
      if (req.method==='HEAD') res.end();
      else createReadStream(file).on('error',()=>res.destroy()).pipe(res);
    } catch { if (!res.headersSent) res.writeHead(404); res.end(); }
  });
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const port = Number(process.env.PORT || 5175);
  const host = process.env.HOST || '127.0.0.1';
  const server = createSiteServer();
  server.requestTimeout = 30000;
  server.headersTimeout = 15000;
  server.listen(port,host,() => console.log(`Creepy Crawly Andy: http://localhost:${port} (chat: ${process.env.CHAT_ENABLED === 'true' ? 'AI' : 'website guide'})`));
  for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close());
}
