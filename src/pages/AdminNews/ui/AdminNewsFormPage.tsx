import { NativeSelect, Stack, Tabs, Text, Textarea, TextInput } from '@mantine/core';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useRef, useEffect, useState } from 'react';

import {
	createNews,
	fetchAdminNews,
	NEWS_CATEGORY_LABEL,
	type NewsCategory,
	updateNews,
	uploadNewsImage,
} from '@/entities/news';
import { resolveStaticUrl } from '@/shared/lib/staticUrl';
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
	const [uploadingCover, setUploadingCover] = useState(false);
	const [uploadingBody, setUploadingBody] = useState(false);
	const coverInputRef = useRef<HTMLInputElement>(null);
	const bodyInputRef = useRef<HTMLInputElement>(null);

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

	const onCoverFile = async (file: File | undefined) => {
		if (!file) {
			return;
		}
		setUploadingCover(true);
		setError(null);
		try {
			const { url } = await uploadNewsImage(file);
			setField('coverUrl', url);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Не удалось загрузить обложку');
		} finally {
			setUploadingCover(false);
			if (coverInputRef.current) {
				coverInputRef.current.value = '';
			}
		}
	};

	const onBodyImageFile = async (file: File | undefined) => {
		if (!file) {
			return;
		}
		setUploadingBody(true);
		setError(null);
		try {
			const { url } = await uploadNewsImage(file);
			setForm((prev) => {
				const insert = `\n\n![скрин](${url})\n\n`;
				return { ...prev, body: prev.body ? `${prev.body}${insert}` : insert.trim() };
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Не удалось загрузить картинку');
		} finally {
			setUploadingBody(false);
			if (bodyInputRef.current) {
				bodyInputRef.current.value = '';
			}
		}
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

	const coverPreview = resolveStaticUrl(form.coverUrl);

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
				<div>
					<Text size="sm" mb={6} style={{ fontWeight: 500 }}>
						Обложка
					</Text>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
						<input
							ref={coverInputRef}
							type="file"
							accept="image/webp,image/png,image/jpeg,image/gif,image/avif"
							hidden
							onChange={(event) => void onCoverFile(event.currentTarget.files?.[0])}
						/>
						<OrnateButton
							variant="outline"
							disabled={uploadingCover || saving}
							onClick={() => coverInputRef.current?.click()}
						>
							{uploadingCover ? 'Загрузка…' : 'Загрузить'}
						</OrnateButton>
						<Text size="sm" c="dimmed">
							webp / png / jpg, до 5 МБ
						</Text>
					</div>
					{coverPreview ? (
						<img
							src={coverPreview}
							alt=""
							style={{
								display: 'block',
								marginTop: '0.75rem',
								maxWidth: '100%',
								maxHeight: 180,
								objectFit: 'cover',
								border: '1px solid color-mix(in srgb, var(--app-border) 70%, transparent)',
							}}
						/>
					) : null}
					<TextInput
						mt="sm"
						label="Путь обложки"
						value={form.coverUrl}
						onChange={(event) => setField('coverUrl', event.currentTarget.value)}
						placeholder="/static/images/scenes/…"
						description="Заполняется после загрузки; можно вписать вручную"
						radius={0}
					/>
				</div>
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
						<div style={{ marginBottom: '0.75rem' }}>
							<input
								ref={bodyInputRef}
								type="file"
								accept="image/webp,image/png,image/jpeg,image/gif,image/avif"
								hidden
								onChange={(event) => void onBodyImageFile(event.currentTarget.files?.[0])}
							/>
							<OrnateButton
								variant="outline"
								disabled={uploadingBody || saving}
								onClick={() => bodyInputRef.current?.click()}
							>
								{uploadingBody ? 'Загрузка…' : 'Вставить картинку в текст'}
							</OrnateButton>
						</div>
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
					saving={saving || uploadingCover || uploadingBody}
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
