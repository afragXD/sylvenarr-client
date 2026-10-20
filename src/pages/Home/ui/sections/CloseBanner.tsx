import { OrnateLink } from '@/shared/ui/OrnateButton';
import { OrnateFrame } from '@/shared/ui/OrnateFrame';
import { SectionHeading } from '@/shared/ui/SectionHeading';

import classes from '../HomePage.module.css';

export const CloseBanner = () => {
	return (
		<section className={classes.section} aria-labelledby="close-heading">
			<OrnateFrame variant="panel">
				<div className={classes.close}>
					<SectionHeading title="Ваше имя войдёт в летопись" id="close-heading" align="center" />
					<p className={classes.closeLead}>
						Войдите через Яндекс — рейтинг ПТС и история матчей сохранятся за вами.
					</p>
					<OrnateLink to="/sign-in" variant="parchment" withDiamonds={false}>
						Войти и играть
					</OrnateLink>
				</div>
			</OrnateFrame>
		</section>
	);
};
