import { ArtFade } from '@/shared/ui/ArtFade';
import { OrnateLink } from '@/shared/ui/OrnateButton';
import { SmokeBackdrop } from '@/shared/ui/SmokeBackdrop';

import classes from '../HomePage.module.css';

export const HeroBanner = () => {
	return (
		<section className={classes.hero} aria-label="Sylvenarr">
			<div className={classes.heroScene} aria-hidden>
				<SmokeBackdrop />
				<ArtFade src="/scenes/hero.png" mask="bottom" alt="" />
			</div>
			<div className={classes.heroCopy}>
				<h1 className={classes.heroTitle}>
					Собери отряд.
					<br />
					Переиграй соперника.
				</h1>
				<p className={classes.heroLead}>
					Пошаговые дуэли в тёмном технофэнтези: двадцать четыре класса, два ряда и ни одного
					честного боя.
				</p>
				<div className={classes.heroCta}>
					<OrnateLink to="/sign-in" variant="parchment" size="lg" withDiamonds={false}>
						Начать бой
					</OrnateLink>
					<OrnateLink to="/heroes" size="lg">
						Смотреть героев
					</OrnateLink>
				</div>
				<p className={classes.heroMeta}>Бесплатно в браузере, вход через Яндекс</p>
			</div>
		</section>
	);
};
