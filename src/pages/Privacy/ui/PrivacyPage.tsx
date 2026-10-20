import { Anchor, Box, List, Stack, Table, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

import { APP_TITLE, CONTACT_EMAIL, SITE_URL } from '@/shared/constants';
import { PageFrame } from '@/shared/ui/PageFrame';

const REVISION_DATE = '16 октября 2026 года';

const siteHost = SITE_URL.replace(/^https?:\/\//, '');

const cookieRows = [
	{
		name: 'playerId',
		purpose: 'Сессия входа: сервер определяет, что запрос пришёл от вошедшего игрока.',
		lifetime: '1 год или до выхода из аккаунта',
		kind: 'Техническая, httpOnly',
	},
	{
		name: 'oauthState',
		purpose: 'Защита входа через Яндекс ID от подмены запроса (CSRF).',
		lifetime: '10 минут, только на время входа',
		kind: 'Техническая, httpOnly',
	},
] as const;

type SectionProps = {
	index: number;
	title: string;
	children: ReactNode;
};

const Section = ({ index, title, children }: SectionProps) => (
	<Stack component="section" gap="sm" maw={760}>
		<Title order={2}>
			{index}. {title}
		</Title>
		{children}
	</Stack>
);

/**
 * Политика конфиденциальности и обработки персональных данных.
 */
export const PrivacyPage = () => {
	const mail = <Anchor href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</Anchor>;

	return (
		<PageFrame
			width="content"
			gap="xl"
			eyebrow="Документы"
			title="Политика конфиденциальности"
			lead={`Как ${APP_TITLE} (${siteHost}) обрабатывает данные и cookie. Редакция от ${REVISION_DATE}.`}
		>
			<Section index={1} title="Общие положения">
				<Text>
					Настоящая политика составлена в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ
					«О персональных данных» и определяет порядок обработки данных пользователей сайта{' '}
					{siteHost} (далее — Сайт). Оператор данных — владелец Сайта (далее — Оператор).
				</Text>
				<Text>
					Используя Сайт и входя через Яндекс ID, вы подтверждаете, что ознакомились с политикой и
					согласны с обработкой данных на описанных условиях. Если вы не согласны, не входите в
					аккаунт и прекратите использование Сайта.
				</Text>
			</Section>

			<Section index={2} title="Какие данные обрабатываются">
				<Text>При входе через Яндекс ID Оператор получает и сохраняет:</Text>
				<List spacing={4}>
					<List.Item>идентификатор аккаунта Яндекс;</List.Item>
					<List.Item>отображаемое имя (или логин, если имя не задано);</List.Item>
					<List.Item>адрес электронной почты, если он передан Яндексом;</List.Item>
					<List.Item>ссылку на аватар, если он установлен;</List.Item>
					<List.Item>профиль в том виде, в котором его вернул Яндекс ID.</List.Item>
				</List>
				<Text>
					В процессе игры сохраняются данные матчей: созданные комнаты, составы отрядов, результаты
					боёв и записи рейтинга. Пароль от аккаунта Яндекс Оператору не передаётся.
				</Text>
				<Text>
					Веб-сервер ведёт стандартные технические журналы (IP-адрес, время и адрес запроса),
					которые используются для обеспечения работоспособности и безопасности Сайта.
				</Text>
			</Section>

			<Section index={3} title="Цели обработки">
				<List spacing={4}>
					<List.Item>идентификация пользователя и вход в аккаунт;</List.Item>
					<List.Item>отображение имени и аватара другим игрокам в матче и рейтинге;</List.Item>
					<List.Item>проведение матчей и ведение рейтинга;</List.Item>
					<List.Item>защита от несанкционированного доступа и злоупотреблений;</List.Item>
					<List.Item>связь с пользователем по вопросам работы Сайта.</List.Item>
				</List>
			</Section>

			<Section index={4} title="Правовые основания">
				<Text>
					Данные обрабатываются на основании согласия, которое вы даёте, инициируя вход через Яндекс
					ID (п. 1 ч. 1 ст. 6 152-ФЗ), а также в связи с необходимостью предоставить вам функции
					Сайта (п. 5 ч. 1 ст. 6 152-ФЗ). Технические cookie устанавливаются как необходимые для
					работы Сайта.
				</Text>
			</Section>

			<Section index={5} title="Cookie">
				<Text>
					Сайт использует только технические cookie, без которых вход в аккаунт невозможен.
					Аналитические, рекламные и сторонние cookie не используются, счётчики посещаемости не
					установлены.
				</Text>
				<Box style={{ overflowX: 'auto' }}>
					<Table
						className="sylvenarr-registry-table"
						horizontalSpacing="md"
						verticalSpacing="sm"
						style={{ borderCollapse: 'collapse', minWidth: 640 }}
					>
						<Table.Thead>
							<Table.Tr>
								<Table.Th w={140}>Имя</Table.Th>
								<Table.Th>Назначение</Table.Th>
								<Table.Th w={200}>Срок</Table.Th>
								<Table.Th w={170}>Тип</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{cookieRows.map((row) => (
								<Table.Tr key={row.name} style={{ borderBottom: '1px solid var(--app-border)' }}>
									<Table.Td ff="monospace" fw={600}>
										{row.name}
									</Table.Td>
									<Table.Td>{row.purpose}</Table.Td>
									<Table.Td c="var(--app-text-muted)">{row.lifetime}</Table.Td>
									<Table.Td c="var(--app-text-muted)">{row.kind}</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</Box>
				<Text>
					Удалить cookie можно кнопкой «Выйти» на Сайте или в настройках браузера. После этого
					потребуется войти заново.
				</Text>
			</Section>

			<Section index={6} title="Передача данных третьим лицам">
				<Text>
					Авторизацию выполняет сервис Яндекс ID по собственным правилам; Оператор получает только
					сведения, перечисленные в разделе 2. Данные размещаются на серверах хостинг-провайдера,
					который обеспечивает их техническое хранение и не имеет права использовать их в своих
					целях.
				</Text>
				<Text>
					Оператор не продаёт данные, не передаёт их рекламным сетям и раскрывает третьим лицам
					только в случаях, прямо предусмотренных законом.
				</Text>
			</Section>

			<Section index={7} title="Сроки хранения">
				<List spacing={4}>
					<List.Item>данные аккаунта — пока существует аккаунт;</List.Item>
					<List.Item>данные матчей и рейтинга — пока существует аккаунт участника;</List.Item>
					<List.Item>cookie — в сроки, указанные в разделе 5;</List.Item>
					<List.Item>
						технические журналы сервера — ограниченный срок, необходимый для диагностики.
					</List.Item>
				</List>
				<Text>После удаления аккаунта связанные с ним данные удаляются.</Text>
			</Section>

			<Section index={8} title="Ваши права">
				<Text>Вы вправе:</Text>
				<List spacing={4}>
					<List.Item>получить сведения о том, какие ваши данные обрабатываются;</List.Item>
					<List.Item>потребовать уточнить, заблокировать или удалить данные;</List.Item>
					<List.Item>отозвать согласие на обработку и удалить аккаунт;</List.Item>
					<List.Item>обжаловать действия Оператора в Роскомнадзоре или в суде.</List.Item>
				</List>
				<Text>
					Для этого напишите на {mail} с адреса, привязанного к аккаунту Яндекс, или укажите имя в
					игре. Оператор отвечает в течение 10 рабочих дней.
				</Text>
			</Section>

			<Section index={9} title="Защита данных">
				<Text>
					Соединение с Сайтом защищено HTTPS. Cookie сессии недоступны скриптам (httpOnly) и
					передаются только по защищённому соединению. Доступ к базе данных ограничен и
					предоставляется только для обслуживания Сайта.
				</Text>
			</Section>

			<Section index={10} title="Изменения политики">
				<Text>
					Оператор может обновлять политику. Новая редакция публикуется на этой странице с указанием
					даты; продолжая пользоваться Сайтом после публикации, вы принимаете изменения.
				</Text>
			</Section>

			<Section index={11} title="Контакты">
				<Text>
					По вопросам обработки персональных данных: {mail}. Сайт: {siteHost}.
				</Text>
			</Section>
		</PageFrame>
	);
};
