import { Link } from '@tanstack/react-router';
import { useUnit } from 'effector-react';

import { $player, $sessionChecked } from '@/entities/player';
import { formatHeroClassCount } from '@/shared/lib/ruPlural';
import { getSceneUrl } from '@/shared/lib/staticUrl';
import { OrnateLink } from '@/shared/ui/OrnateButton';
import { SmokeBackdrop } from '@/shared/ui/SmokeBackdrop';

import classes from '../HomePage.module.css';

type HeroBannerProps = {
	/** AC-10: число героев из API; null — пока грузится. */
	heroCount?: number | null;
};

export const HeroBanner = ({ heroCount = null }: HeroBannerProps) => {
	const player = useUnit($player);
	const sessionChecked = useUnit($sessionChecked);
	const classesPhrase =
		heroCount !== null && heroCount > 0 ? formatHeroClassCount(heroCount) : 'классы арены';

	return (
		<section className={classes.hero} aria-label="Sylvenarr">
			<div className={classes.heroScene} aria-hidden>
				<div className={classes.heroShot}>
					<img src={getSceneUrl('battle.webp')} alt="" draggable={false} />
				</div>
				<div className={classes.heroShade} />
				<SmokeBackdrop fog overlay />
			</div>
			<div className={classes.heroCopy}>
				<h1 className={classes.heroTitle}>
					Собери отряд.
					<br />
					Переиграй соперника.
				</h1>
				<p className={classes.heroLead}>
					Пошаговые дуэли в тёмном технофэнтези: {classesPhrase}, два ряда и ни одного честного
					боя.
				</p>
				{!sessionChecked ? (
					<div className={classes.heroCta}>
						<OrnateLink to="/heroes" size="lg">
							Смотреть героев
						</OrnateLink>
					</div>
				) : player ? (
					<p className={classes.heroMeta}>
						Вы вошли как {player.displayName} ·{' '}
						<Link to="/lobby" className={classes.heroInlineLink}>
							В лобби
						</Link>
					</p>
				) : (
					<>
						<div className={classes.heroCta}>
							<OrnateLink to="/sign-in" variant="parchment" size="lg" withDiamonds={false}>
								Войти и играть
							</OrnateLink>
							<OrnateLink to="/heroes" size="lg">
								Смотреть героев
							</OrnateLink>
						</div>
						<p className={classes.heroMeta}>Вход через Яндекс или по логину</p>
					</>
				)}
			</div>
		</section>
	);
};
