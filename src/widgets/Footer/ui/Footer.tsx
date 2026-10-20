import { Link } from '@tanstack/react-router';

import {
	AUTHOR_GITHUB_URL,
	AUTHOR_NAME,
	ORIGINAL_AUTHOR_NAME,
	ORIGINAL_AUTHOR_URL,
	ORIGINAL_BOT_URL,
} from '@/shared/constants';
import { GoldRule } from '@/shared/ui/GoldRule';
import { OrnateLink } from '@/shared/ui/OrnateButton';

import classes from './Footer.module.css';

const COLUMNS = [
	{
		title: 'Игра',
		links: [
			{ to: '/heroes', label: 'Герои' },
			{ to: '/heroes/effects', label: 'Кодекс эффектов' },
		],
	},
	{
		title: 'Арена',
		links: [
			{ to: '/lobby', label: 'Лобби' },
			{ to: '/matches', label: 'Матчи' },
			{ to: '/rating', label: 'Рейтинг' },
		],
	},
	{
		title: 'Проект',
		links: [
			{ to: '/news', label: 'Новости' },
			{ to: '/#faq', label: 'Вопросы' },
			{ to: '/privacy', label: 'Конфиденциальность' },
			{ to: '/sign-in', label: 'Войти' },
		],
	},
] as const;

export const Footer = () => {
	return (
		<footer className={classes.root}>
			<GoldRule align="center" className={classes.rule} />
			<div className={classes.grid}>
				<div>
					<h2 className={classes.ctaTitle}>Ваш отряд ждёт</h2>
					<p className={classes.ctaText}>
						Войдите через Яндекс — рейтинг ПТС и история матчей сохранятся за вами.
					</p>
					<OrnateLink to="/sign-in" variant="parchment" withDiamonds={false}>
						Войти и играть
					</OrnateLink>
				</div>
				<nav className={classes.columns} aria-label="Подвал">
					{COLUMNS.map((column) => (
						<div key={column.title}>
							<h3 className={classes.columnTitle}>{column.title}</h3>
							<ul className={classes.list}>
								{column.links.map((link) => (
									<li key={link.to}>
										<Link to={link.to} className={classes.link}>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</nav>
			</div>
			<p className={classes.credits}>
				Веб-версия —{' '}
				<a href={AUTHOR_GITHUB_URL} target="_blank" rel="noreferrer">
					{AUTHOR_NAME}
				</a>
				. Оригинал VK-бота —{' '}
				<a href={ORIGINAL_AUTHOR_URL} target="_blank" rel="noreferrer">
					{ORIGINAL_AUTHOR_NAME}
				</a>
				{' / '}
				<a href={ORIGINAL_BOT_URL} target="_blank" rel="noreferrer">
					arenamsterbot
				</a>
				.
			</p>
		</footer>
	);
};
