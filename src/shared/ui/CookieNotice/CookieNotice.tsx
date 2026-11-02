import { Button, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import styles from './CookieNotice.module.css';

const STORAGE_KEY = 'sylvenarr.cookie-notice';
const OFFSET_VAR = '--cookie-notice-offset';

/**
 * Уведомление о технических cookie. Показывается один раз, пока не нажато «Понятно».
 * Резервирует место снизу (AC-9), чтобы не перекрывать рейтинг / слайдеры / «Ход боя».
 */
export const CookieNotice = () => {
	const [visible, setVisible] = useState(false);
	const noticeRef = useRef<HTMLElement>(null);

	useEffect(() => {
		try {
			if (window.localStorage.getItem(STORAGE_KEY) !== '1') {
				setVisible(true);
			}
		} catch {
			/* localStorage недоступен — не показываем, чтобы не мешать */
		}
	}, []);

	useEffect(() => {
		const root = document.documentElement;
		if (!visible) {
			root.style.removeProperty(OFFSET_VAR);
			return;
		}
		const el = noticeRef.current;
		if (!el) {
			return;
		}
		const sync = () => {
			const h = Math.ceil(el.getBoundingClientRect().height) + 16;
			root.style.setProperty(OFFSET_VAR, `${h}px`);
		};
		sync();
		const ro = new ResizeObserver(sync);
		ro.observe(el);
		return () => {
			ro.disconnect();
			root.style.removeProperty(OFFSET_VAR);
		};
	}, [visible]);

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
		<section ref={noticeRef} className={styles.notice} aria-label="Уведомление о cookie">
			<Text className={styles.text}>
				Сайт ставит cookie только для входа в аккаунт. Аналитики и рекламы нет.{' '}
				<Link to="/privacy" className={styles.link}>
					Подробнее
				</Link>
			</Text>
			{/* AC-3: тёмный текст на brand ≥4,5:1 (autoContrast на баннере ненадёжен). */}
			<Button
				className={`sylvenarr-plate-btn ${styles.accept}`}
				color="brand"
				size="sm"
				onClick={handleAccept}
				styles={{
					root: {
						flexShrink: 0,
						color: 'var(--parchment-ink, #2b2219)',
					},
				}}
			>
				Понятно
			</Button>
		</section>
	);
};
