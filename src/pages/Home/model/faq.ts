import {
	CONTACT_EMAIL,
	ORIGINAL_AUTHOR_NAME,
	ORIGINAL_AUTHOR_URL,
	ORIGINAL_BOT_URL,
} from '@/shared/constants';

export type FaqItem = {
	readonly question: string;
	/** Текст ответа; поддерживает markdown-ссылки `[текст](url)`. */
	readonly answer: string;
};

/** Плоский текст ответа без markdown — для JSON-LD. */
export const faqAnswerPlain = (answer: string): string =>
	answer.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

export const FAQ_ITEMS: readonly FaqItem[] = [
	{
		question: 'Сколько стоит игра?',
		answer: 'Бесплатно. Играете в браузере.',
	},
	{
		question: 'Нужно ли что-то устанавливать?',
		answer: 'Нет. Достаточно браузера — в том числе на телефоне.',
	},
	{
		question: 'Как войти?',
		answer:
			'Через Яндекс. Гостевых аккаунтов нет: рейтинг и история матчей всегда привязаны к вам.',
	},
	{
		question: 'Как сыграть с другом?',
		answer: 'Создайте матч в лобби и отправьте другу код приглашения.',
	},
	{
		question: 'Сколько героев в отряде?',
		answer: 'Столько, сколько задают правила матча: квота и ряды выбираются при создании.',
	},
	{
		question: 'Что такое ПТС?',
		answer: 'Очки рейтинга. Все начинают с 1500; победа над сильным соперником даёт больше.',
	},
	{
		question: 'Можно ли сдаться или договориться о ничьей?',
		answer: 'Да. Обе кнопки есть в панели боя.',
	},
	{
		question: 'Откуда игра?',
		answer: `Это веб-версия VK-бота [«Sylvenarr: Origins»](${ORIGINAL_BOT_URL}) авторства [${ORIGINAL_AUTHOR_NAME}](${ORIGINAL_AUTHOR_URL}).`,
	},
	{
		question: 'Нашёл ошибку — куда писать?',
		answer: `На почту ${CONTACT_EMAIL}.`,
	},
];
