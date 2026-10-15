import { flushSync } from 'react-dom';

interface ViewTransition {
	ready: Promise<void>;
	finished: Promise<void>;
}

type DocumentWithViewTransition = Document & {
	startViewTransition?: (update: () => void) => ViewTransition;
};

const ANIMATION_MS = 400;
const ANIMATION_EASING = 'ease-in-out';

const canStartViewTransition = (
	document: Document,
): document is DocumentWithViewTransition & {
	startViewTransition: (update: () => void) => ViewTransition;
} => {
	return typeof (document as DocumentWithViewTransition).startViewTransition === 'function';
};

const getViewportSize = () => {
	const visualViewport = window.visualViewport;
	const width = Math.max(
		window.innerWidth,
		document.documentElement.clientWidth,
		visualViewport?.width ?? 0,
	);
	const height = Math.max(
		window.innerHeight,
		document.documentElement.clientHeight,
		visualViewport?.height ?? 0,
	);

	return { width, height };
};

const getRevealRadius = (x: number, y: number) => {
	const { width, height } = getViewportSize();

	return Math.ceil(Math.hypot(Math.max(x, width - x), Math.max(y, height - y)));
};

export const animateThemeTransition = async (
	x: number,
	y: number,
	toDark: boolean,
	applyTheme: () => void,
): Promise<void> => {
	if (!canStartViewTransition(document)) {
		applyTheme();
		return;
	}

	const root = document.documentElement;
	const radius = getRevealRadius(x, y);
	const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`];

	root.dataset.themeTransition = toDark ? 'to-dark' : 'to-light';

	let applied = false;
	const apply = () => {
		if (applied) {
			return;
		}
		applied = true;
		applyTheme();
	};

	try {
		const transition = document.startViewTransition(() => {
			flushSync(apply);
		});

		await transition.ready;

		document.documentElement.animate(
			{
				clipPath: toDark ? clipPath : [...clipPath].reverse(),
			},
			{
				duration: ANIMATION_MS,
				easing: ANIMATION_EASING,
				fill: 'both',
				pseudoElement: toDark ? '::view-transition-new(root)' : '::view-transition-old(root)',
			},
		);

		await transition.finished;
	} catch {
		apply();
	} finally {
		delete root.dataset.themeTransition;
	}
};
