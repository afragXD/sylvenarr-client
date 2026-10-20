import { createFileRoute } from '@tanstack/react-router';

import { HomePage } from '@/pages/Home';
import { FAQ_ITEMS, faqAnswerPlain } from '@/pages/Home/model/faq';
import { APP_DESCRIPTION, absoluteUrl } from '@/shared/constants';
import { seo } from '@/shared/lib/seo';

const homeUrl = absoluteUrl('/');

const faqJsonLd = {
	type: 'application/ld+json' as const,
	children: JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: FAQ_ITEMS.map((item) => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faqAnswerPlain(item.answer),
			},
		})),
	}),
};

export const Route = createFileRoute('/')({
	head: () => ({
		meta: seo({
			title: 'Sylvenarr',
			description: APP_DESCRIPTION,
			url: homeUrl,
		}),
		links: [{ rel: 'canonical', href: homeUrl }],
		scripts: [faqJsonLd],
	}),
	component: HomePage,
});
