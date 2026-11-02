import { useEffect, useState } from 'react';

import { fetchHeroes } from '@/entities/hero';

import classes from './HomePage.module.css';
import { FaqSection, HeroBanner, HeroesShowcase, MechanicsSection, NewsSection } from './sections';

export const HomePage = () => {
	const [heroCount, setHeroCount] = useState<number | null>(null);

	useEffect(() => {
		void fetchHeroes()
			.then((list) => setHeroCount(list.length))
			.catch(() => setHeroCount(null));
	}, []);

	return (
		<div className={classes.page}>
			<HeroBanner heroCount={heroCount} />
			<HeroesShowcase heroCount={heroCount} />
			<MechanicsSection />
			<NewsSection />
			<FaqSection />
		</div>
	);
};
