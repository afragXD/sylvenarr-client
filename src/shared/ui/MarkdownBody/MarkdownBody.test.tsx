import { describe, expect, test } from 'bun:test';
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';

import { MarkdownBody } from './MarkdownBody';

const render = (markdown: string) =>
	renderToStaticMarkup(
		<MantineProvider>
			<MarkdownBody>{markdown}</MarkdownBody>
		</MantineProvider>,
	);

describe('MarkdownBody lists', () => {
	test('«- **А:** текст» → пункт с жирным', () => {
		const html = render('- **А:** текст');
		expect(html).toContain('<li><strong>А:</strong> текст</li>');
	});

	test('«* » и «1. » тоже списки', () => {
		const unordered = render('* пункт');
		expect(unordered).toContain('<ul');
		expect(unordered).toContain('<li>пункт</li>');

		const ordered = render('1. пункт');
		expect(ordered).toContain('<ol');
		expect(ordered).toContain('<li>пункт</li>');
	});

	test('абзац без маркера не становится списком', () => {
		const html = render('Обычный абзац');
		expect(html).not.toContain('<li');
		expect(html).toContain('Обычный абзац');
	});
});
