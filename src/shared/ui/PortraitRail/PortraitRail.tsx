import { ChevronDown, ChevronUp } from 'lucide-react';
import { useId } from 'react';

import classes from './PortraitRail.module.css';

export type PortraitRailItem = {
	id: string;
	label: string;
	src: string;
};

type PortraitRailProps = {
	items: ReadonlyArray<PortraitRailItem>;
	selectedId: string;
	onSelect: (id: string) => void;
	className?: string;
	label?: string;
};

/**
 * Лента портретов с клавиатурной навигацией.
 */
export const PortraitRail = ({
	items,
	selectedId,
	onSelect,
	className,
	label = 'Выбор героя',
}: PortraitRailProps) => {
	const listId = useId();
	const index = items.findIndex((item) => item.id === selectedId);
	const safeIndex = index >= 0 ? index : 0;

	const move = (delta: number) => {
		if (items.length === 0) {
			return;
		}
		const next = (safeIndex + delta + items.length) % items.length;
		const item = items[next];
		if (item) {
			onSelect(item.id);
		}
	};

	const rootClass = [classes.root, className].filter(Boolean).join(' ');

	return (
		<div
			className={rootClass}
			role="listbox"
			tabIndex={0}
			aria-label={label}
			aria-activedescendant={`${listId}-${selectedId}`}
		>
			<button
				type="button"
				className={classes.nav}
				aria-label="Предыдущий"
				disabled={items.length < 2}
				onClick={() => move(-1)}
			>
				<ChevronUp size={16} />
			</button>
			<div className={classes.rail}>
				{items.map((item) => {
					const selected = item.id === selectedId;
					return (
						<button
							key={item.id}
							id={`${listId}-${item.id}`}
							type="button"
							role="option"
							aria-selected={selected}
							aria-label={item.label}
							className={classes.item}
							onClick={() => onSelect(item.id)}
							onKeyDown={(event) => {
								if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
									event.preventDefault();
									move(1);
								}
								if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
									event.preventDefault();
									move(-1);
								}
							}}
						>
							<img src={item.src} alt="" draggable={false} />
						</button>
					);
				})}
			</div>
			<button
				type="button"
				className={classes.nav}
				aria-label="Следующий"
				disabled={items.length < 2}
				onClick={() => move(1)}
			>
				<ChevronDown size={16} />
			</button>
		</div>
	);
};
