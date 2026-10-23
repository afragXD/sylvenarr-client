import { Anchor, Box, Group, Loader, Stack, Table, Text } from '@mantine/core';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { HeroImage } from '@/entities/hero';
import {
	type FavoriteHero,
	fetchCurrentPlayer,
	fetchMyFavoriteHeroes,
} from '@/entities/player';
import { ApiError } from '@/shared/api/http';

/**
 * Досье: личный топ героев по числу выборов в драфте.
 */
export const ProfileDossierPage = () => {
	const navigate = useNavigate();
	const [heroes, setHeroes] = useState<FavoriteHero[] | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;
		void fetchCurrentPlayer()
			.then(() => fetchMyFavoriteHeroes(24))
			.then((items) => {
				if (mounted) {
					setHeroes(items);
					setError(null);
				}
			})
			.catch((err) => {
				if (!mounted) {
					return;
				}
				if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
					void navigate({ to: '/sign-in' });
					return;
				}
				setError(err instanceof Error ? err.message : 'Не удалось загрузить');
				setHeroes([]);
			});
		return () => {
			mounted = false;
		};
	}, [navigate]);

	if (heroes === null) {
		return (
			<Group gap="sm">
				<Loader color="brand" size="sm" />
				<Text size="sm" c="var(--app-text-muted)">
					Загрузка…
				</Text>
			</Group>
		);
	}

	if (error) {
		return (
			<Text c="accent" role="alert">
				{error}
			</Text>
		);
	}

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
							<Table.Tr
								key={hero.code}
								style={{ borderBottom: '1px solid var(--app-border)' }}
							>
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
