import { Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

import { resolveStaticUrl } from '@/shared/lib/staticUrl';

type MarkdownBodyProps = {
	children: string;
	className?: string;
};

type ListKind = 'ul' | 'ol';

type ListItem = {
	kind: ListKind;
	text: string;
	start?: number;
};

/**
 * Минимальный markdown: абзацы, **жирный**, # / ## заголовки, ссылки [text](url),
 * картинки ![alt](url), списки «- » / «* » и «1. ».
 * Без сырого HTML.
 */
export const MarkdownBody = ({ children, className }: MarkdownBodyProps) => {
	const blocks = children
		.replace(/\r\n?/g, '\n')
		.trim()
		.split(/\n{2,}/);

	return (
		<div className={className} style={{ maxWidth: '75ch' }}>
			{blocks.flatMap((block, index) => renderBlock(block, index))}
		</div>
	);
};

const parseListItem = (line: string): ListItem | null => {
	const trimmed = line.trim();
	const unordered = /^[-*]\s+(.*)$/.exec(trimmed);
	if (unordered) {
		return { kind: 'ul', text: unordered[1] };
	}
	const ordered = /^(\d+)\.\s+(.*)$/.exec(trimmed);
	if (ordered) {
		return { kind: 'ol', text: ordered[2], start: Number(ordered[1]) };
	}
	return null;
};

const renderBlock = (block: string, index: number): ReactNode[] => {
	const keyBase = `${index}-${block.slice(0, 24)}`;
	const trimmed = block.trim();
	if (!trimmed) {
		return [];
	}

	const imageOnly = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(trimmed);
	if (imageOnly) {
		const src = resolveStaticUrl(imageOnly[2]) ?? imageOnly[2];
		return [
			<img
				key={keyBase}
				src={src}
				alt={imageOnly[1]}
				loading="lazy"
				style={{
					display: 'block',
					width: '100%',
					maxHeight: 420,
					objectFit: 'contain',
					objectPosition: 'center top',
					margin: '0.75rem 0 1.25rem',
					border: '1px solid color-mix(in srgb, var(--brass) 35%, transparent)',
					background: '#050403',
				}}
			/>,
		];
	}
	if (trimmed.startsWith('## ')) {
		return [
			<Title key={keyBase} order={3} c="var(--app-text)" mb="sm" mt="md">
				{renderInline(trimmed.slice(3))}
			</Title>,
		];
	}
	if (trimmed.startsWith('# ')) {
		return [
			<Title key={keyBase} order={2} c="var(--app-text)" mb="sm">
				{renderInline(trimmed.slice(2))}
			</Title>,
		];
	}

	const lines = trimmed.split('\n');
	const nodes: ReactNode[] = [];
	let cursor = 0;
	let part = 0;
	while (cursor < lines.length) {
		const listed = parseListItem(lines[cursor] ?? '');
		if (listed) {
			const kind = listed.kind;
			const items: string[] = [];
			let start = listed.start;
			while (cursor < lines.length) {
				const next = parseListItem(lines[cursor] ?? '');
				if (!next || next.kind !== kind) {
					break;
				}
				if (items.length === 0) {
					start = next.start;
				}
				items.push(next.text);
				cursor += 1;
			}
			const Tag = kind === 'ol' ? 'ol' : 'ul';
			nodes.push(
				<Tag
					key={`${keyBase}-l-${part}`}
					className="sylvenarr-md-list"
					{...(Tag === 'ol' && start && start !== 1 ? { start } : {})}
				>
					{items.map((text) => (
						<li key={text}>{renderInline(text, 'strong')}</li>
					))}
				</Tag>,
			);
		} else {
			const textLines: string[] = [];
			while (cursor < lines.length && !parseListItem(lines[cursor] ?? '')) {
				textLines.push(lines[cursor] ?? '');
				cursor += 1;
			}
			nodes.push(
				<Text key={`${keyBase}-p-${part}`} mb="sm" style={{ whiteSpace: 'pre-wrap' }}>
					{renderInline(textLines.join('\n'))}
				</Text>,
			);
		}
		part += 1;
	}
	return nodes;
};

const renderInline = (text: string, bold: 'span' | 'strong' = 'span'): ReactNode[] => {
	const nodes: ReactNode[] = [];
	const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
	let last = 0;
	let match = pattern.exec(text);
	let i = 0;
	while (match) {
		if (match.index > last) {
			nodes.push(text.slice(last, match.index));
		}
		const token = match[0];
		if (token.startsWith('**')) {
			const label = token.slice(2, -2);
			nodes.push(
				bold === 'strong' ? (
					<strong key={`b-${i}`}>{label}</strong>
				) : (
					<Text key={`b-${i}`} span fw={700} c="var(--app-text)">
						{label}
					</Text>
				),
			);
		} else {
			const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
			if (linkMatch) {
				const href = linkMatch[2];
				const external = /^https?:\/\//i.test(href);
				nodes.push(
					<a
						key={`a-${i}`}
						href={href}
						style={{ color: 'var(--copper)' }}
						{...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
					>
						{linkMatch[1]}
					</a>,
				);
			}
		}
		last = match.index + token.length;
		i += 1;
		match = pattern.exec(text);
	}
	if (last < text.length) {
		nodes.push(text.slice(last));
	}
	return nodes;
};
