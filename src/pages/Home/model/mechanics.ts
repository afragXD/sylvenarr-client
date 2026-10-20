export type MechanicStep = {
	readonly id: string;
	readonly title: string;
	readonly body: string;
	readonly scene: string;
};

export const MECHANIC_STEPS: readonly MechanicStep[] = [
	{
		id: 'draft',
		title: 'Драфт',
		body: 'Соперники по очереди забирают классы, пока не заполнят квоту отряда.',
		scene: '/scenes/draft.png',
	},
	{
		id: 'rows',
		title: 'Два ряда',
		body: 'Передний принимает удар, задний бьёт из глубины.',
		scene: '/scenes/rows.png',
	},
	{
		id: 'initiative',
		title: 'Инициатива',
		body: 'Кто быстрее, тот ходит первым.',
		scene: '/scenes/initiative.png',
	},
	{
		id: 'effects',
		title: 'Эффекты',
		body: 'Яды, щиты и проклятия решают исход раньше, чем кончатся очки здоровья.',
		scene: '/scenes/effects.png',
	},
];
