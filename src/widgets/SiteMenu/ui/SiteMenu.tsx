import { Drawer } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';

import { getHeroCharacterUrl } from '@/entities/hero';
import { ArtFade } from '@/shared/ui/ArtFade';
import { OrnateFrame } from '@/shared/ui/OrnateFrame';
import { SmokeBackdrop } from '@/shared/ui/SmokeBackdrop';

import classes from './SiteMenu.module.css';

const COLUMNS = [
	{
		title: 'Игра',
		links: [
			{ to: '/heroes' as const, label: 'Герои' },
			{ to: '/heroes/effects' as const, label: 'Кодекс эффектов' },
			{ to: '/heroes/items' as const, label: 'Кодекс предметов' },
		],
	},
	{
		title: 'Арена',
		links: [
			{ to: '/lobby' as const, label: 'Лобби' },
			{ to: '/matches' as const, label: 'Матчи' },
			{ to: '/rating' as const, label: 'Рейтинг' },
		],
	},
	{
		title: 'Проект',
		links: [
			{ to: '/news' as const, label: 'Новости' },
			{ to: '/' as const, hash: 'faq', label: 'Вопросы и ответы' },
			{ to: '/privacy' as const, label: 'Конфиденциальность' },
		],
	},
];

type SiteMenuProps = {
	opened: boolean;
	onClose: () => void;
	isAdmin?: boolean;
	/** Вошедший — промо ведёт в /lobby, гость — на вход. */
	isSignedIn?: boolean;
	/** Пока false — не показывать гостевой CTA (AC-4). */
	sessionChecked?: boolean;
	displayName?: string;
	onLogout?: () => void;
	isLoggingOut?: boolean;
};

/**
 * Полноэкранная карта сайта.
 */
export const SiteMenu = ({
	opened,
	onClose,
	isAdmin = false,
	isSignedIn = false,
	sessionChecked = false,
	displayName,
	onLogout,
	isLoggingOut = false,
}: SiteMenuProps) => {
	const promoTo = isSignedIn ? '/lobby' : '/sign-in';
	const promoCta = isSignedIn ? 'В лобби' : 'Войти и играть';
	const showGuestPromo = sessionChecked && !isSignedIn;
	const showSignedInPromo = sessionChecked && isSignedIn;
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
						{/* Закрытие — кнопка бургера в Header (AC-9: тот же bounding box). */}
						<span className={classes.closeSlot} aria-hidden />
					</div>
					<nav className={classes.columns} aria-label="Разделы сайта">
						{COLUMNS.map((column) => (
							<div key={column.title}>
								<h2 className={classes.columnTitle}>{column.title}</h2>
								<ul className={classes.list}>
									{column.links.map((link) => (
										<li key={link.to}>
											<Link
												to={link.to}
												hash={'hash' in link ? link.hash : undefined}
												className={classes.link}
												onClick={onClose}
											>
												{link.label}
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
						{isSignedIn ? (
							<div>
								<h2 className={classes.columnTitle}>Аккаунт</h2>
								<ul className={classes.list}>
									<li>
										<Link to="/profile/dossier" className={classes.link} onClick={onClose}>
											Досье
										</Link>
									</li>
									<li>
										<Link to="/profile/presets" className={classes.link} onClick={onClose}>
											Пресеты
										</Link>
									</li>
									<li>
										<Link to="/profile/settings" className={classes.link} onClick={onClose}>
											Настройки
										</Link>
									</li>
									<li>
										<Link to="/matches" className={classes.link} onClick={onClose}>
											Мои матчи
										</Link>
									</li>
									{isAdmin ? (
										<li>
											<Link to="/admin/news" className={classes.link} onClick={onClose}>
												Новости (админ)
											</Link>
										</li>
									) : null}
									<li>
										<button
											type="button"
											className={classes.logout}
											disabled={isLoggingOut}
											onClick={() => {
												onLogout?.();
												onClose();
											}}
										>
											<LogOut size={14} aria-hidden />
											Выйти{displayName ? ` (${displayName})` : ''}
										</button>
									</li>
								</ul>
							</div>
						) : null}
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
							{showSignedInPromo ? (
								<>
									<p className={classes.promoText}>Соберите отряд и выйдите на арену с другом.</p>
									<Link to={promoTo} onClick={onClose} style={{ textDecoration: 'none' }}>
										<span className={classes.promoCta}>{promoCta}</span>
									</Link>
								</>
							) : showGuestPromo ? (
								<>
									<p className={classes.promoText}>Вход через Яндекс или по логину</p>
									<Link to={promoTo} onClick={onClose} style={{ textDecoration: 'none' }}>
										<span className={classes.promoCta}>{promoCta}</span>
									</Link>
								</>
							) : (
								<p className={classes.promoText}>Пошаговые дуэли на арене Sylvenarr.</p>
							)}
						</OrnateFrame>
					</div>
				</div>
			</div>
		</Drawer>
	);
};
