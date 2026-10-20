import { Accordion } from '@mantine/core';

import { OrnateFrame } from '@/shared/ui/OrnateFrame';
import { SectionHeading } from '@/shared/ui/SectionHeading';

import { FAQ_ITEMS } from '../../model/faq';
import classes from '../HomePage.module.css';

export const FaqSection = () => {
	return (
		<section className={classes.section} id="faq" aria-labelledby="faq-heading">
			<SectionHeading title="Вопросы и ответы" id="faq-heading" align="center" />
			<OrnateFrame variant="panel">
				<Accordion variant="separated" radius={0} chevronPosition="right">
					{FAQ_ITEMS.map((item) => (
						<Accordion.Item key={item.question} value={item.question} className={classes.faqItem}>
							<Accordion.Control>{item.question}</Accordion.Control>
							<Accordion.Panel>{item.answer}</Accordion.Panel>
						</Accordion.Item>
					))}
				</Accordion>
			</OrnateFrame>
		</section>
	);
};
