import { useState } from 'react';

import { OrnateFrame } from '@/shared/ui/OrnateFrame';
import { SectionHeading } from '@/shared/ui/SectionHeading';

import { MECHANIC_STEPS } from '../../model/mechanics';
import classes from '../HomePage.module.css';

export const MechanicsSection = () => {
	const [activeId, setActiveId] = useState(MECHANIC_STEPS[0].id);
	const active = MECHANIC_STEPS.find((step) => step.id === activeId) ?? MECHANIC_STEPS[0];

	return (
		<section className={classes.section} aria-labelledby="mechanics-heading">
			<SectionHeading title="Как устроен бой" id="mechanics-heading" align="center" />
			<div className={classes.mechanics}>
				<OrnateFrame variant="tabbed" tabLabel="Этапы">
					<div className={classes.stepGrid} role="listbox" aria-label="Этапы боя">
						{MECHANIC_STEPS.map((step, index) => (
							<button
								key={step.id}
								type="button"
								role="option"
								aria-selected={step.id === active.id}
								className={classes.stepBtn}
								onClick={() => setActiveId(step.id)}
							>
								<span className={classes.stepN}>{String(index + 1).padStart(2, '0')}</span>
								<span className={classes.stepTitle}>{step.title}</span>
							</button>
						))}
					</div>
				</OrnateFrame>
				<OrnateFrame variant="medallion" medallion={<span aria-hidden>⚔</span>}>
					<div className={classes.detail}>
						<SectionHeading title={active.title} order={3} withRule align="start" />
						<p className={classes.detailBody}>{active.body}</p>
						<img className={classes.detailScene} src={active.scene} alt={active.sceneAlt} />
					</div>
				</OrnateFrame>
			</div>
		</section>
	);
};
