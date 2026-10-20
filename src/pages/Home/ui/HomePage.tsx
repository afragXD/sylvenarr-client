import classes from './HomePage.module.css';
import { FaqSection, HeroBanner, HeroesShowcase, MechanicsSection, NewsSection } from './sections';

export const HomePage = () => {
	return (
		<div className={classes.page}>
			<HeroBanner />
			<HeroesShowcase />
			<MechanicsSection />
			<NewsSection />
			<FaqSection />
		</div>
	);
};
