import { Anchor, Group, Loader, Slider, Stack, Text } from '@mantine/core';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { useUnit } from 'effector-react';
import { useEffect, useMemo, useState } from 'react';

import {
	$hero,
	$heroError,
	$heroes,
	$heroPending,
	displayAttack,
	getHeroCharacterUrl,
	getHeroPortraitUrl,
	HeroRoleTags,
	heroesPageMounted,
	heroPageOpened,
	heroStatsAtLevel,
	isTransformForm,
} from '@/entities/hero';
import { ArtFade } from '@/shared/ui/ArtFade';
import { OrnateFrame } from '@/shared/ui/OrnateFrame';
import { PageFrame } from '@/shared/ui/PageFrame';
import { PortraitRail } from '@/shared/ui/PortraitRail';

import { HeroAbilitiesSection } from './HeroAbilitiesSection';
import classes from './HeroDetailPage.module.css';
import { HeroResistsSection } from './HeroResistsSection';
import { HeroSummonsSection } from './HeroSummonsSection';

const highlightStats: ReadonlyArray<{
	key: 'size' | 'damage' | 'initiative' | 'health';
	label: string;
}> = [
	{ key: 'size', label: 'Ряд / слоты' },
	{ key: 'damage', label: 'Атака' },
	{ key: 'initiative', label: 'Инициатива' },
	{ key: 'health', label: 'Здоровье' },
];

export const HeroDetailPage = () => {
	const { code } = useParams({ from: '/heroes/$code' });
	const navigate = useNavigate();
	const { hero, error, isPending, heroes } = useUnit({
		hero: $hero,
		error: $heroError,
		isPending: $heroPending,
		heroes: $heroes,
	});
	/** CUT AC-14: слайдер уровня 1–100. */
	const [level, setLevel] = useState(1);

	useEffect(() => {
		heroesPageMounted();
	}, []);

	useEffect(() => {
		heroPageOpened(code);
		setLevel(1);
	}, [code]);

	const railItems = useMemo(
		() =>
			heroes
				.filter((item) => item.isPlayable)
				.map((item) => ({
					id: item.code,
					label: item.displayName,
					src: getHeroPortraitUrl(item.code),
				})),
		[heroes],
	);

	const stats = useMemo(
		() => (hero ? heroStatsAtLevel(hero, level) : null),
		[hero, level],
	);

	const statusLabel = hero
		? hero.isPlayable
			? 'Доступен в наборе'
			: isTransformForm(hero.code)
				? 'Боевая форма'
				: 'Только призыв'
		: '';

	return (
		<PageFrame width="wide">
			<Anchor
				component={Link}
				to="/heroes"
				c="brand"
				td="none"
				size="sm"
				fw={500}
				w="fit-content"
				display="inline-block"
				className={classes.back}
			>
				← К реестру
			</Anchor>
			{isPending && (
				<Group gap="sm">
					<Loader color="brand" size="sm" />
					<Text size="sm" c="var(--app-text-muted)">
						Загрузка характеристик…
					</Text>
				</Group>
			)}
			{error && (
				<Text c="red" role="alert">
					{error}. Вернитесь в реестр и выберите другого героя.
				</Text>
			)}
			{hero && stats && !isPending && (
				<>
					<div className={classes.layout}>
						<div className={classes.copy}>
							<span className={classes.role}>{statusLabel}</span>
							<h2 className={classes.name}>{hero.displayName}</h2>
							<HeroRoleTags tags={hero.tags ?? []} />
							{hero.description ? <p className={classes.lore}>{hero.description}</p> : null}
							{hero.roleSummary ? (
								<Text size="sm" c="var(--app-text-muted)" maw="42rem" style={{ lineHeight: 1.5 }}>
									{hero.roleSummary}
								</Text>
							) : null}
							<div className={classes.levelSlider}>
								<Group justify="space-between" mb={4}>
									<Text size="sm" fw={600}>
										Уровень
									</Text>
									<Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
										{level}
									</Text>
								</Group>
								<Slider
									min={1}
									max={100}
									step={1}
									value={level}
									onChange={setLevel}
									label={(value) => `${value} ур.`}
									marks={[
										{ value: 1, label: '1' },
										{ value: 50, label: '50' },
										{ value: 100, label: '100' },
									]}
									mb="md"
								/>
							</div>
							<OrnateFrame variant="panel" className={classes.stats}>
								{highlightStats.map((stat) => (
									<div key={stat.key}>
										<span className={classes.statLabel}>{stat.label}</span>
										<span className={classes.statValue}>
											{stat.key === 'size'
												? stats.size > 1
													? 'II'
													: 'I'
												: stat.key === 'damage'
													? displayAttack(stats.damage, stats.power)
													: stats[stat.key]}
										</span>
									</div>
								))}
							</OrnateFrame>
						</div>
						<div className={classes.artWrap}>
							<ArtFade src={getHeroCharacterUrl(hero.code)} mask="splash" alt={hero.displayName} />
						</div>
						{railItems.length > 0 ? (
							<PortraitRail
								items={railItems}
								selectedId={hero.isPlayable ? hero.code : (railItems[0]?.id ?? hero.code)}
								onSelect={(nextCode) => {
									void navigate({ to: '/heroes/$code', params: { code: nextCode } });
								}}
								label="Классы арены"
							/>
						) : null}
					</div>
					<div className={classes.sections}>
						<OrnateFrame variant="panel">
							<Stack gap="md" p="md">
								<Text
									ff="var(--mantine-font-family-headings)"
									tt="uppercase"
									style={{ letterSpacing: '0.08em' }}
								>
									Полные характеристики
								</Text>
								<Group gap="md" wrap="wrap">
									{(
										[
											['size', 'Клетки'],
											['health', 'Здоровье'],
											['damage', 'Урон'],
											['armor', 'Броня'],
											['initiative', 'Инициатива'],
											['dodge', 'Уклонение'],
											['luck', 'Удача'],
											['morale', 'Мораль'],
											['mana', 'Мана'],
											['maxMana', 'Макс. мана'],
											['power', 'Сила магии'],
											['accuracy', 'Точность'],
											['gold', 'Золото'],
										] as const
									).map(([key, label]) => (
										<div key={key} className="sylvenarr-stat-cell">
											<Text className="sylvenarr-stat-cell__label">{label}</Text>
											<Text
												className="sylvenarr-stat-cell__value"
												style={{ fontVariantNumeric: 'tabular-nums' }}
											>
												{key === 'size' ? (stats.size > 1 ? 'II' : 'I') : stats[key]}
											</Text>
										</div>
									))}
								</Group>
							</Stack>
						</OrnateFrame>
						<HeroResistsSection code={hero.code} />
						<HeroAbilitiesSection
							code={hero.code}
							isPlayable={hero.isPlayable}
							hero={{
								damage: stats.damage,
								power: stats.power,
								health: stats.health,
								luck: stats.luck,
								gold: stats.gold,
								lvl: level,
							}}
						/>
						<HeroSummonsSection summonerCode={hero.code} />
					</div>
				</>
			)}
		</PageFrame>
	);
};
