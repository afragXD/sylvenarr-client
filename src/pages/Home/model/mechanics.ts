import { getSceneUrl } from '@/shared/lib/staticUrl';

export type MechanicStep = {
	readonly id: string;
	readonly title: string;
	readonly body: string;
	readonly scene: string;
	readonly sceneAlt: string;
};

export const MECHANIC_STEPS: readonly MechanicStep[] = [
	{
		id: 'draft',
		title: 'Набор отряда',
		body: 'Соперники по очереди забирают классы, пока не заполнят квоту отряда.',
		scene: getSceneUrl('draft.webp'),
		sceneAlt: 'Набор отряда: соперники по очереди выбирают героев',
	},
	{
		id: 'rows',
		title: 'Два ряда',
		body: 'Передний принимает удар, задний бьёт из глубины.',
		scene: getSceneUrl('rows.webp'),
		sceneAlt: 'Поле боя: передний и задний ряды двух отрядов',
	},
	{
		id: 'initiative',
		title: 'Инициатива',
		body: 'Кто быстрее, тот ходит первым.',
		scene: getSceneUrl('initiative.webp'),
		sceneAlt: 'Очередь ходов по инициативе',
	},
	{
		id: 'effects',
		title: 'Эффекты',
		body: 'Яды, щиты и проклятия решают исход раньше, чем кончатся очки здоровья.',
		scene: getSceneUrl('effects.webp'),
		sceneAlt: 'Карточка героя с наложенными эффектами',
	},
];
