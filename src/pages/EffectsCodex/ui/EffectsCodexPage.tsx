import { Anchor, Group, Stack, Text, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';

import { listEffectCatalog } from '@/features/battle';
import { PageFrame } from '@/shared/ui/PageFrame';

import styles from './EffectsCodexPage.module.css';

/**
 * Справочник боевых эффектов (кодекс).
 */
export const EffectsCodexPage = () => {
	const effects = listEffectCatalog();

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
			</Stack>

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
									<Group gap="sm" align="baseline">
										<Text fw={600}>{effect.label}</Text>
										<Text size="xs" c="var(--app-text-muted)" tt="lowercase">
											{effect.kind === 'buff' ? 'бафф' : 'дебафф'}
										</Text>
									</Group>
									<Text size="sm" c="var(--app-text-muted)" style={{ lineHeight: 1.5 }}>
										{effect.description}
									</Text>
								</Stack>
							</Group>
						</li>
					);
				})}
			</ul>
		</PageFrame>
	);
};
