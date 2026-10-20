import { Drawer } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { X } from 'lucide-react';

import { getHeroCharacterUrl } from '@/entities/hero';
import { ArtFade } from '@/shared/ui/ArtFade';
import { OrnateFrame } from '@/shared/ui/OrnateFrame';
import { SmokeBackdrop } from '@/shared/ui/SmokeBackdrop';

import classes from './SiteMenu.module.css';

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
			{ to: '/#faq', label: 'Вопросы и ответы' },
			{ to: '/privacy', label: 'Конфиденциальность' },
		],
	},
] as const;

type SiteMenuProps = {
	opened: boolean;
	onClose: () => void;
	isAdmin?: boolean;
};

/**
 * Полноэкранная карта сайта.
 */
export const SiteMenu = ({ opened, onClose, isAdmin = false }: SiteMenuProps) => {
	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			position="top"
			size="100%"
			withCloseButton={false}
			className={classes.drawer}
			transitionProps={{ transition: 'fade', duration: 180 }}
			zIndex={400}
		>
			<div className={classes.shell}>
				<div className={classes.backdrop}>
					<SmokeBackdrop variant="wine" />
				</div>
				<div className={classes.content}>
					<div className={classes.top}>
						<span className={classes.label}>Карта сайта</span>
						<button
							type="button"
							className={classes.close}
							aria-label="Закрыть меню"
							onClick={onClose}
						>
							<X size={18} />
						</button>
					</div>
					<nav className={classes.columns} aria-label="Разделы сайта">
						{COLUMNS.map((column) => (
							<div key={column.title}>
								<h2 className={classes.columnTitle}>{column.title}</h2>
								<ul className={classes.list}>
									{column.links.map((link) => (
										<li key={link.to}>
											<Link to={link.to} className={classes.link} onClick={onClose}>
												{link.label}
											</Link>
										</li>
									))}
									{column.title === 'Проект' && isAdmin ? (
										<li>
											<Link to="/admin/news" className={classes.link} onClick={onClose}>
												Управление новостями
											</Link>
										</li>
									) : null}
								</ul>
							</div>
						))}
					</nav>
				</div>
				<div className={classes.artCol}>
					<ArtFade
						className={classes.art}
						src={getHeroCharacterUrl('Archlich')}
						mask="left"
						alt=""
					/>
					<div className={classes.promo}>
						<OrnateFrame variant="card">
							<p className={classes.promoTitle}>Сыграть сейчас</p>
							<p className={classes.promoText}>Соберите отряд и выйдите на арену с другом.</p>
							<Link to="/lobby" onClick={onClose} style={{ textDecoration: 'none' }}>
								<span className={classes.promoCta}>В лобби</span>
							</Link>
						</OrnateFrame>
					</div>
				</div>
			</div>
		</Drawer>
	);
};
