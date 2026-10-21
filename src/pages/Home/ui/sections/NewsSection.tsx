import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { fetchNewsList, NEWS_CATEGORY_LABEL, type NewsSummary } from '@/entities/news';
import { ArtFade } from '@/shared/ui/ArtFade';
import { OrnateLink } from '@/shared/ui/OrnateButton';
import { OrnateFrame } from '@/shared/ui/OrnateFrame';
import { SectionHeading } from '@/shared/ui/SectionHeading';

import classes from '../HomePage.module.css';

const formatDate = (iso: string | null): string => {
	if (!iso) {
		return '';
	}
	return new Intl.DateTimeFormat('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(new Date(iso));
};

export const NewsSection = () => {
	const [items, setItems] = useState<NewsSummary[]>([]);

	useEffect(() => {
		void fetchNewsList({ limit: 4 })
			.then((result) => setItems(result.items))
			.catch(() => setItems([]));
	}, []);

	if (items.length === 0) {
		return null;
	}

	const [feature, ...rest] = items;
	const cards = rest.slice(0, 3);

	return (
		<section className={classes.section} aria-labelledby="news-heading">
			<SectionHeading title="Хроника разработки" id="news-heading" align="center" />
			{feature ? (
				<Link to="/news/$slug" params={{ slug: feature.slug }} className={classes.newsFeature}>
					{feature.coverUrl ? (
						<ArtFade src={feature.coverUrl} mask="splash" className={classes.newsCover} alt="" />
					) : (
						<div className={classes.newsCover} />
					)}
					<div className={classes.newsFeatureCopy}>
						<p className={classes.newsMeta}>
							{NEWS_CATEGORY_LABEL[feature.category]}
							{feature.publishedAt ? ` — ${formatDate(feature.publishedAt)}` : ''}
						</p>
						<h3 className={classes.name} style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>
							{feature.title}
						</h3>
						<p className={classes.newsFeatureSummary}>{feature.summary}</p>
						<span className={classes.newsRead}>Читать →</span>
					</div>
				</Link>
			) : null}
			{cards.length > 0 ? (
				<div className={classes.newsGrid}>
					{cards.map((item) => (
						<Link
							key={item.id}
							to="/news/$slug"
							params={{ slug: item.slug }}
							className={classes.newsLink}
						>
							<OrnateFrame variant="card">
								{item.coverUrl ? (
									<img
										src={item.coverUrl}
										alt=""
										className={classes.newsCardCover}
										loading="lazy"
									/>
								) : null}
								<span className={classes.newsMeta}>
									{NEWS_CATEGORY_LABEL[item.category]}
									{item.publishedAt ? ` — ${formatDate(item.publishedAt)}` : ''}
								</span>
								<h3 className={classes.newsCardTitle}>{item.title}</h3>
								<p className={classes.newsCardSummary}>{item.summary}</p>
							</OrnateFrame>
						</Link>
					))}
				</div>
			) : null}
			<div className={classes.moreHeroes}>
				<OrnateLink to="/news">Все новости</OrnateLink>
			</div>
		</section>
	);
};
