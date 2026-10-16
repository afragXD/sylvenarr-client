import { Button, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import styles from './CookieNotice.module.css';

const STORAGE_KEY = 'sylvenarr.cookie-notice';

/**
 * Уведомление о технических cookie. Показывается один раз, пока не нажато «Понятно».
 */
export const CookieNotice = () => {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		try {
			if (window.localStorage.getItem(STORAGE_KEY) !== '1') {
				setVisible(true);
			}
		} catch {
			/* localStorage недоступен — не показываем, чтобы не мешать */
		}
	}, []);

	if (!visible) {
		return null;
	}

	const handleAccept = () => {
		try {
			window.localStorage.setItem(STORAGE_KEY, '1');
		} catch {
			/* ignore */
		}
		setVisible(false);
	};

	return (
		<section className={styles.notice} aria-label="Уведомление о cookie">
			<Text className={styles.text}>
				Сайт ставит cookie только для входа в аккаунт. Аналитики и рекламы нет.{' '}
				<Link to="/privacy" className={styles.link}>
					Подробнее
				</Link>
			</Text>
			<Button color="brand" size="sm" onClick={handleAccept} style={{ flexShrink: 0 }}>
				Понятно
			</Button>
		</section>
	);
};
