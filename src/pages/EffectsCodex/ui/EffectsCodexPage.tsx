import { Anchor, Group, Stack, Text, Title, Tooltip } from '@mantine/core';
import { Link } from '@tanstack/react-router';

import { CODEX_L, type EffectMeta, listBuffs, listDebuffs } from '@/features/battle';
import { PageFrame } from '@/shared/ui/PageFrame';

import styles from './EffectsCodexPage.module.css';

/**
 * Справочник боевых эффектов (кодекс).
 */
export const EffectsCodexPage = () => {
	const buffs = listBuffs();
	const debuffs = listDebuffs();

	return (
		<PageFrame width="content">
			<Anchor
				component={Link}
				to="/heroes"
				c="brand"
				td="none"
				size="sm"
				fw={500}
				w="fit-content"
				display="inline-block"
			>
				← К реестру
			</Anchor>

			<Stack gap={8} maw="40rem">
				<Title order={1}>Кодекс эффектов</Title>
				<Text c="var(--app-text-muted)" style={{ lineHeight: 1.55 }}>
					Состояния, которые герои накладывают в бою. На поле они отмечены иконками на юните — здесь
					полный список с пояснениями.
				</Text>
				<div className={styles.legend}>
					<Text size="sm" fw={600}>
						Обозначения
					</Text>
					<ul className={styles.legendList}>
						<li>
							<Text size="sm" c="var(--app-text-muted)" component="span">
								<span className={styles.legendKey}>L</span> — условный уровень героя в бою (сейчас
								всегда {CODEX_L}; отдельного уровня у юнита пока нет)
							</Text>
						</li>
						<li>
							<Text size="sm" c="var(--app-text-muted)" component="span">
								<span className={styles.legendKey}>р.</span> — длительность в раундах
							</Text>
						</li>
						<li>
							<Text size="sm" c="var(--app-text-muted)" component="span">
								<span className={styles.legendKey}>⌊…⌋</span> — целая часть (округление вниз)
							</Text>
						</li>
					</ul>
				</div>
			</Stack>

			<EffectSection title="Усиления" effects={buffs} />
			<EffectSection title="Ослабления" effects={debuffs} />
		</PageFrame>
	);
};

const EffectSection = ({ title, effects }: { title: string; effects: EffectMeta[] }) => (
	<section className={styles.section}>
		<Title order={2} size="h3" mb="sm">
			{title}
		</Title>
		<ul className={styles.list}>
			{effects.map((effect) => {
				const Icon = effect.Icon;
				return (
					<li key={effect.id} className={styles.item} data-kind={effect.kind}>
						<Group gap="sm" align="flex-start" wrap="nowrap">
							<span className={styles.icon} aria-hidden>
								<Icon size={18} strokeWidth={1.75} />
							</span>
							<Stack gap={4} style={{ minWidth: 0 }}>
								<Text fw={600}>{effect.label}</Text>
								<Text size="sm" c="var(--app-text-muted)" style={{ lineHeight: 1.5 }}>
									{effect.description}
								</Text>
								<Tooltip label={effect.exampleAtL} multiline w={260} withArrow>
									<span className={styles.mechanics}>{effect.mechanics}</span>
								</Tooltip>
							</Stack>
						</Group>
					</li>
				);
			})}
		</ul>
	</section>
);
