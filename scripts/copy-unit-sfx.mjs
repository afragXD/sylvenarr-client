import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';

import ffmpegPath from 'ffmpeg-static';

const root = resolve(import.meta.dirname, '../..');
const sourceRoot = join(root, 'SFX_clean');

/**
 * Layout volume Angie (`/app/static`):
 *   sfx/heroes/{HeroClassCode}/{Stem}.{webm|mp3}
 * URL: /static/sfx/heroes/...
 */
const targetRoot = join(root, 'angie', 'static', 'sfx', 'heroes');

/** Папки без класса в текущем ростере. */
const ORPHANS = new Set(['Mage', 'Savage', 'Vampire', 'Gargoyle']);

const FORMATS = [
	{ ext: 'webm', args: ['-c:a', 'libopus', '-b:a', '64k'] },
	{ ext: 'mp3', args: ['-c:a', 'libmp3lame', '-q:a', '5'] },
];

/**
 * `3_Pear_Cake.wav` → `Pear_Cake`; `death.wav` → `death`.
 * Номер слота отбрасываем: слот задаёт манифест по имени действия.
 */
function stemOf(fileName) {
	return basename(fileName, extname(fileName)).replace(/^\d+_/, '');
}

function isFresh(target, source) {
	return existsSync(target) && statSync(target).mtimeMs >= statSync(source).mtimeMs;
}

function encode(source, target, args) {
	const result = spawnSync(
		ffmpegPath,
		['-y', '-loglevel', 'error', '-i', source, '-vn', ...args, target],
		{ stdio: 'inherit' },
	);
	if (result.status !== 0) {
		throw new Error(`ffmpeg: не удалось сжать ${source}`);
	}
}

if (!ffmpegPath || !existsSync(ffmpegPath)) {
	throw new Error('ffmpeg-static не найден — переустановите devDependencies');
}
if (!existsSync(sourceRoot)) {
	throw new Error(`Нет исходной папки: ${sourceRoot}`);
}

console.log(`→ angie: ${targetRoot}`);
let encoded = 0;
let skipped = 0;
for (const code of readdirSync(sourceRoot)) {
	const fromDir = join(sourceRoot, code);
	if (ORPHANS.has(code) || !statSync(fromDir).isDirectory()) {
		continue;
	}
	const toDir = join(targetRoot, code);
	mkdirSync(toDir, { recursive: true });
	const files = readdirSync(fromDir).filter(
		(file) => /\.wav$/i.test(file) && !/_Alt\.wav$/i.test(file),
	);
	for (const file of files) {
		const source = join(fromDir, file);
		for (const format of FORMATS) {
			const target = join(toDir, `${stemOf(file)}.${format.ext}`);
			if (isFresh(target, source)) {
				skipped += 1;
				continue;
			}
			encode(source, target, format.args);
			encoded += 1;
		}
	}
	console.log(`  ${code}: ${files.length} звуков`);
}

console.log(`Готово: сжато ${encoded}, без изменений ${skipped}.`);
console.log('Прод-URL: /static/sfx/heroes/{code}/{stem}.{webm|mp3}');
console.log('Volume: /var/lib/docker/volumes/static/_data/sfx/heroes/...');
