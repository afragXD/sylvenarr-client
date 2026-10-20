import { Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

type MarkdownBodyProps = {
	children: string;
	className?: string;
};

/**
 * Минимальный markdown: абзацы, **жирный**, # / ## заголовки, ссылки [text](url), картинки ![alt](url).
 * Без сырого HTML.
 */
export const MarkdownBody = ({ children, className }: MarkdownBodyProps) => {
	const blocks = children.trim().split(/\n{2,}/);

	return (
		<div className={className}>
			{blocks.map((block, index) => {
				const key = `${index}-${block.slice(0, 24)}`;
				const trimmed = block.trim();
				const imageOnly = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(trimmed);
				if (imageOnly) {
					return (
						<img
							key={key}
							src={imageOnly[2]}
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
						/>
					);
				}
				if (trimmed.startsWith('## ')) {
					return (
						<Title key={key} order={3} c="var(--app-text)" mb="sm" mt="md">
							{renderInline(trimmed.slice(3))}
						</Title>
					);
				}
				if (trimmed.startsWith('# ')) {
					return (
						<Title key={key} order={2} c="var(--app-text)" mb="sm">
							{renderInline(trimmed.slice(2))}
						</Title>
					);
				}
				return (
					<Text key={key} mb="sm" style={{ whiteSpace: 'pre-wrap' }}>
						{renderInline(trimmed)}
					</Text>
				);
			})}
		</div>
	);
};

const renderInline = (text: string): ReactNode[] => {
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
			nodes.push(
				<Text key={`b-${i}`} span fw={700} c="var(--app-text)">
					{token.slice(2, -2)}
				</Text>,
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
