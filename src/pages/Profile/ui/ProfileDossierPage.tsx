import { Anchor, Box, Button, Group, Skeleton, Stack, Table, Text } from '@mantine/core';
import { Link, useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';

import { HeroImage } from '@/entities/hero';
import { type FavoriteHero, fetchCurrentPlayer, fetchMyFavoriteHeroes } from '@/entities/player';
import { ApiError } from '@/shared/api/http';
import { useAc6DeferredLoad } from '@/shared/lib/useAc6DeferredLoad';

/**
 * Досье: личный топ героев по числу выборов в драфте (AC-6: skeleton + 4–6 с retry).
 */
export const ProfileDossierPage = () => {
	const navigate = useNavigate();

	const load = useCallback(async (): Promise<FavoriteHero[]> => {
		const me = await fetchCurrentPlayer();
		if (!me) {
			void navigate({ to: '/sign-in' });
			return [];
		}
		try {
			return await fetchMyFavoriteHeroes(24);
		} catch (err) {
			if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
				void navigate({ to: '/sign-in' });
				return [];
			}
			throw err;
		}
	}, [navigate]);

	const { state, data, retry } = useAc6DeferredLoad(load, [load]);

	if (state === 'loading') {
		return (
			<Stack gap="sm" maw={480} aria-busy>
				<Skeleton height={28} radius={0} />
				<Skeleton height={28} radius={0} />
				<Skeleton height={28} radius={0} />
				<Skeleton height={28} radius={0} />
			</Stack>
		);
	}

	if (state === 'error') {
		return (
			<Stack gap="sm">
				<Text c="var(--app-text-muted)" role="alert">
					Не удалось загрузить ·{' '}
					<Button variant="subtle" color="brand" size="compact-sm" radius={0} onClick={retry}>
						Повторить
					</Button>
				</Text>
			</Stack>
		);
	}

	const heroes = data ?? [];

	if (heroes.length === 0) {
		return (
			<Text c="var(--app-text-muted)">
				Сыграйте матч до конца — здесь появятся герои из ваших составов.
			</Text>
		);
	}

	return (
		<Stack gap="md">
			<Box style={{ overflowX: 'auto' }}>
				<Table
					className="sylvenarr-registry-table"
					highlightOnHover
					horizontalSpacing="md"
					verticalSpacing="sm"
					style={{ borderCollapse: 'collapse', minWidth: 360 }}
				>
					<Table.Thead>
						<Table.Tr>
							<Table.Th w={64}>#</Table.Th>
							<Table.Th>Герой</Table.Th>
							<Table.Th>Выборы</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{heroes.map((hero, index) => (
							<Table.Tr key={hero.code} style={{ borderBottom: '1px solid var(--app-border)' }}>
								<Table.Td>
									<Text span ff="monospace" c="var(--app-text-muted)">
										{index + 1}
									</Text>
								</Table.Td>
								<Table.Td>
									<Group gap="sm" wrap="nowrap">
										<HeroImage
											code={hero.code}
											alt={hero.displayName}
											variant="portrait"
											w={40}
											h={40}
										/>
										<Anchor
											component={Link}
											to={`/heroes/${hero.code}`}
											c="var(--app-text)"
											underline="never"
										>
											{hero.displayName}
										</Anchor>
									</Group>
								</Table.Td>
								<Table.Td ff="monospace" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
									{hero.pickCount}
								</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			</Box>
		</Stack>
	);
};
