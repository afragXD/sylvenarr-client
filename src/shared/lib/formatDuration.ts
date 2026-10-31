/** Формат длительности боя: m:ss или «—». */
export const formatDuration = (seconds: number | null | undefined): string => {
	if (seconds === null || seconds === undefined || seconds < 0) {
		return '—';
	}
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${String(s).padStart(2, '0')}`;
};
