import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const sourceDir = join(root, 'sylvenarr-client', 'public', 'scenes');
/**
 * Volume Angie/service (`/app/static`):
 *   images/scenes/{file}
 * URL: /static/images/scenes/...
 */
const angieTarget = join(root, 'angie', 'static', 'images', 'scenes');
const serviceTarget = join(root, 'sylvenarr-service', 'static', 'images', 'scenes');

const listImages = (dir) =>
	existsSync(dir)
		? readdirSync(dir).filter((file) => /\.(webp|png|jpe?g|gif|avif)$/i.test(file))
		: [];

/** Канон: public/scenes → иначе уже лежащие в angie/service. */
let primarySource = sourceDir;
let files = listImages(sourceDir);
if (files.length === 0) {
	primarySource = angieTarget;
	files = listImages(angieTarget);
}
if (files.length === 0) {
	primarySource = serviceTarget;
	files = listImages(serviceTarget);
}
if (files.length === 0) {
	console.warn('Нет image-файлов scenes (public / angie / service).');
	process.exit(1);
}
console.log(`источник: ${primarySource}`);

for (const targetDir of [angieTarget, serviceTarget]) {
	mkdirSync(targetDir, { recursive: true });
	for (const file of files) {
		copyFileSync(join(primarySource, file), join(targetDir, file));
	}
	console.log(`→ ${targetDir}: ${files.length} файлов`);
}

console.log('Прод-URL: /static/images/scenes/{file}');
console.log('Volume: …/static/_data/images/scenes/...');
