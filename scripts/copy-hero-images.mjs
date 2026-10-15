import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const sourceRoot = join(root, 'arenamsterbot', 'imgs');

/**
 * Только layout volume Angie (`/app/static`):
 *   images/heroes/{portraits|characters}/{code}.png
 * URL: /static/images/heroes/...
 */
const targetRoot = join(root, 'angie', 'static', 'images', 'heroes');

const folders = [
	{ from: 'portraits', to: 'portraits' },
	{ from: 'characters', to: 'characters' },
];

/**
 * Нормализует имя файла к Code.png.
 */
function normalizeFileName(fileName) {
	const extension = extname(fileName);
	const name = basename(fileName, extension);
	return `${name}.png`;
}

function copyFolder(fromName, toName) {
	const fromDir = join(sourceRoot, fromName);
	const toDir = join(targetRoot, toName);
	if (!existsSync(fromDir)) {
		throw new Error(`Нет исходной папки: ${fromDir}`);
	}
	mkdirSync(toDir, { recursive: true });
	const files = readdirSync(fromDir).filter((file) => /\.(png|PNG|jpg|JPG|jpeg)$/i.test(file));
	let copied = 0;
	for (const file of files) {
		const targetName = normalizeFileName(file);
		copyFileSync(join(fromDir, file), join(toDir, targetName));
		copied += 1;
	}
	return copied;
}

function copyDefaultPortrait() {
	const defaultSrc = join(sourceRoot, 'portraits', 'DEFAULT.PNG');
	const defaultAlt = join(sourceRoot, 'portraits', 'DEFAULT.png');
	const defaultTarget = join(targetRoot, 'portraits', 'DEFAULT.png');
	if (existsSync(defaultSrc)) {
		copyFileSync(defaultSrc, defaultTarget);
	} else if (existsSync(defaultAlt)) {
		copyFileSync(defaultAlt, defaultTarget);
	} else {
		console.warn('DEFAULT portrait не найден');
	}
}

console.log(`→ angie: ${targetRoot}`);
for (const folder of folders) {
	const count = copyFolder(folder.from, folder.to);
	console.log(`  ${folder.from} → ${folder.to}: ${count} файлов`);
}
copyDefaultPortrait();

console.log('Готово. Прод-URL: /static/images/heroes/{portraits|characters}/{code}.png');
console.log('Volume: /var/lib/docker/volumes/static/_data/images/heroes/...');
