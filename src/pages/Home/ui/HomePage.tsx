import classes from './HomePage.module.css';
import {
	CloseBanner,
	FaqSection,
	HeroBanner,
	HeroesShowcase,
	MechanicsSection,
	NewsSection,
} from './sections';

export const HomePage = () => {
	return (
		<div className={classes.page}>
			<HeroBanner />
			<HeroesShowcase />
			<MechanicsSection />
			<NewsSection />
			<FaqSection />
			<CloseBanner />
		</div>
	);
};
