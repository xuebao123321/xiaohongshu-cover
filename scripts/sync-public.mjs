import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(root, 'public');

await rm(publicDir, { recursive: true, force: true });
await mkdir(publicDir, { recursive: true });
await cp(join(root, 'index.html'), join(publicDir, 'index.html'));
await cp(join(root, 'admin.html'), join(publicDir, 'admin.html'));
await cp(join(root, 'config.js'), join(publicDir, 'config.js'));
await cp(join(root, 'lib'), join(publicDir, 'lib'), { recursive: true });

console.log('Synced static assets to public/');
