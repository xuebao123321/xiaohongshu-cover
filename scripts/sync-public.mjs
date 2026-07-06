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
await cp(join(root, 'ins_reviewer_carousel'), join(publicDir, 'ins_reviewer_carousel'), { recursive: true });
await cp(join(root, 'reddit-reply-assistant'), join(publicDir, 'reddit-reply-assistant'), { recursive: true });
await cp(join(root, 'reddit-radar'), join(publicDir, 'reddit-radar'), { recursive: true });
await cp(join(root, 'reddit-post-writer'), join(publicDir, 'reddit-post-writer'), { recursive: true });
await cp(join(root, 'content_assistant'), join(publicDir, 'instagram-content-assistant'), { recursive: true });
await cp(join(root, 'video_maker'), join(publicDir, 'video_maker'), { recursive: true });
await cp(join(root, 'data'), join(publicDir, 'data'), { recursive: true });

console.log('Synced static assets to public/ (incl. video_maker)');
