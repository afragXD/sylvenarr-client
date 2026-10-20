import { NativeSelect, Stack, Tabs, Text, Textarea, TextInput } from '@mantine/core';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import {
	createNews,
	fetchAdminNews,
	NEWS_CATEGORY_LABEL,
	type NewsCategory,
	updateNews,
} from '@/entities/news';
import { slugify } from '@/shared/lib/slugify';
import { MarkdownBody } from '@/shared/ui/MarkdownBody';
import { OrnateButton } from '@/shared/ui/OrnateButton';
import { PageFrame } from '@/shared/ui/PageFrame';

const CATEGORIES = Object.keys(NEWS_CATEGORY_LABEL) as NewsCategory[];

type FormState = {
	title: string;
	slug: string;
	summary: string;
	body: string;
	category: NewsCategory;
	coverUrl: string;
	publishedAt: string;
};

const emptyForm = (): FormState => ({
	title: '',
	slug: '',
	summary: '',
	body: '',
	category: 'devlog',
	coverUrl: '',
	publishedAt: '',
});

export const AdminNewsFormPage = ({ mode }: { mode: 'new' | 'edit' }) => {
	const navigate = useNavigate();
	const params = useParams({ strict: false }) as { id?: string };
	const [form, setForm] = useState<FormState>(emptyForm);
	const [slugTouched, setSlugTouched] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (mode !== 'edit' || !params.id) {
			return;
		}
		void fetchAdminNews(params.id)
			.then((item) => {
				setForm({
					title: item.title,
					slug: item.slug,
					summary: item.summary,
					body: item.body,
					category: item.category,
					coverUrl: item.coverUrl ?? '',
					publishedAt: item.publishedAt ? item.publishedAt.slice(0, 16) : '',
				});
				setSlugTouched(true);
			})
			.catch((err: unknown) => {
				setError(err instanceof Error ? err.message : 'Не удалось загрузить');
			});
	}, [mode, params.id]);

	const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
		setForm((prev) => {
			const next = { ...prev, [key]: value };
			if (key === 'title' && !slugTouched) {
				next.slug = slugify(String(value));
			}
			return next;
		});
	};

	const payload = (publish: boolean) => ({
		title: form.title.trim(),
		slug: form.slug.trim(),
		summary: form.summary.trim(),
		body: form.body.trim(),
		category: form.category,
		coverUrl: form.coverUrl.trim() || null,
		publishedAt: publish
			? form.publishedAt
				? new Date(form.publishedAt).toISOString()
				: new Date().toISOString()
			: null,
	});

	const save = async (publish: boolean) => {
		setSaving(true);
		setError(null);
		try {
			const body = payload(publish);
			if (mode === 'new') {
				const created = await createNews(body);
				void navigate({ to: '/admin/news/$id', params: { id: created.id } });
			} else if (params.id) {
				await updateNews(params.id, body);
				void navigate({ to: '/admin/news' });
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Не удалось сохранить');
		} finally {
			setSaving(false);
		}
	};

	return (
		<PageFrame
			title={mode === 'new' ? 'Новая новость' : 'Редактирование'}
			eyebrow="Админка"
			width="content"
		>
			<Stack gap="md">
				{error ? <Text c="accent">{error}</Text> : null}
				<TextInput
					label="Заголовок"
					value={form.title}
					onChange={(event) => setField('title', event.currentTarget.value)}
					radius={0}
				/>
				<TextInput
					label="Slug"
					value={form.slug}
					onChange={(event) => {
						setSlugTouched(true);
						setField('slug', event.currentTarget.value);
					}}
					radius={0}
				/>
				<NativeSelect
					label="Категория"
					value={form.category}
					data={CATEGORIES.map((value) => ({
						value,
						label: NEWS_CATEGORY_LABEL[value],
					}))}
					onChange={(event) => setField('category', event.currentTarget.value as NewsCategory)}
					radius={0}
				/>
				<TextInput
					label="Обложка (URL)"
					value={form.coverUrl}
					onChange={(event) => setField('coverUrl', event.currentTarget.value)}
					placeholder="/scenes/hero.png"
					radius={0}
				/>
				<TextInput
					label="Дата публикации"
					type="datetime-local"
					value={form.publishedAt}
					onChange={(event) => setField('publishedAt', event.currentTarget.value)}
					description="Пусто + «Опубликовать» = сейчас. Черновик сбрасывает дату."
					radius={0}
				/>
				<Textarea
					label="Краткое описание"
					value={form.summary}
					onChange={(event) => setField('summary', event.currentTarget.value)}
					minRows={2}
					radius={0}
				/>
				<Tabs defaultValue="edit" radius={0}>
					<Tabs.List>
						<Tabs.Tab value="edit">Текст</Tabs.Tab>
						<Tabs.Tab value="preview">Превью</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel value="edit" pt="sm">
						<Textarea
							value={form.body}
							onChange={(event) => setField('body', event.currentTarget.value)}
							minRows={12}
							autosize
							radius={0}
							styles={{ input: { fontFamily: 'inherit', lineHeight: 1.55 } }}
						/>
					</Tabs.Panel>
					<Tabs.Panel value="preview" pt="sm">
						<div
							className="sylvenarr-panel"
							style={{ color: 'var(--app-text-muted)', lineHeight: 1.6 }}
						>
							<MarkdownBody>{form.body || 'Пусто'}</MarkdownBody>
						</div>
					</Tabs.Panel>
				</Tabs>
				<GroupButtons
					saving={saving}
					onDraft={() => void save(false)}
					onPublish={() => void save(true)}
				/>
			</Stack>
		</PageFrame>
	);
};

const GroupButtons = ({
	saving,
	onDraft,
	onPublish,
}: {
	saving: boolean;
	onDraft: () => void;
	onPublish: () => void;
}) => (
	<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
		<OrnateButton variant="outline" disabled={saving} onClick={onDraft}>
			Сохранить черновик
		</OrnateButton>
		<OrnateButton variant="parchment" withDiamonds={false} disabled={saving} onClick={onPublish}>
			Опубликовать
		</OrnateButton>
	</div>
);
