import { useEffect, useMemo, useState } from 'react';

import {
	displayAttack,
	fetchHeroes,
	getHeroCharacterUrl,
	getHeroPortraitUrl,
	type HeroClass,
} from '@/entities/hero';
import { OrnateLink } from '@/shared/ui/OrnateButton';
import { OrnateFrame } from '@/shared/ui/OrnateFrame';
import { PortraitRail } from '@/shared/ui/PortraitRail';
import { SectionHeading } from '@/shared/ui/SectionHeading';

import { FEATURED_HERO_CODES } from '../../model/featuredHeroes';
import classes from '../HomePage.module.css';

export const HeroesShowcase = () => {
	const [heroes, setHeroes] = useState<HeroClass[]>([]);
	const [selected, setSelected] = useState<string>(FEATURED_HERO_CODES[0]);

	useEffect(() => {
		void fetchHeroes()
			.then((list) => {
				const featured = FEATURED_HERO_CODES.map((code) =>
					list.find((hero) => hero.code === code),
				).filter((hero): hero is HeroClass => Boolean(hero));
				setHeroes(featured);
				if (featured[0]) {
					setSelected(featured[0].code);
				}
			})
			.catch(() => {
				setHeroes([]);
			});
	}, []);

	const current = useMemo(
		() => heroes.find((hero) => hero.code === selected) ?? heroes[0] ?? null,
		[heroes, selected],
	);

	const railItems = heroes.map((hero) => ({
		id: hero.code,
		label: hero.displayName,
		src: getHeroPortraitUrl(hero.code),
	}));

	return (
		<section className={classes.section} aria-labelledby="heroes-heading">
			<SectionHeading title="Герои арены" id="heroes-heading" align="center" />
			{current ? (
				<div className={classes.showcase}>
					<div className={classes.showcaseCopy}>
						<span className={classes.role}>Класс арены</span>
						<h3 className={classes.name}>{current.displayName}</h3>
						<p className={classes.lore}>
							{current.roleSummary ||
								current.description ||
								'Откройте карточку класса перед набором отряда.'}
						</p>
						<OrnateFrame variant="panel" className={classes.stats}>
							<div>
								<span className={classes.statLabel}>Слоты в отряде</span>
								<span className={classes.statValue}>{current.size}</span>
							</div>
							<div>
								<span className={classes.statLabel}>Атака</span>
								<span className={classes.statValue}>
									{displayAttack(current.damage, current.power)}
								</span>
							</div>
							<div>
								<span className={classes.statLabel}>Инициатива</span>
								<span className={classes.statValue}>{current.initiative}</span>
							</div>
							<div>
								<span className={classes.statLabel}>Здоровье</span>
								<span className={classes.statValue}>{current.health}</span>
							</div>
						</OrnateFrame>
					</div>
					<div className={classes.artWrap}>
						<img
							key={current.code}
							src={getHeroCharacterUrl(current.code)}
							alt={current.displayName}
							draggable={false}
						/>
					</div>
					<PortraitRail items={railItems} selectedId={current.code} onSelect={setSelected} />
				</div>
			) : null}
			<div className={classes.moreHeroes}>
				<OrnateLink to="/heroes">Все двадцать четыре класса</OrnateLink>
			</div>
		</section>
	);
};
